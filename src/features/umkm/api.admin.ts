import { supabase } from "../../lib/supabaseClient";

import type { Dusun, UmkmInfo, UmkmKategori, Produk } from "./types";

export type AdminUmkmRow = UmkmInfo & {
  published: boolean;
  updated_at?: string;
};

export type AdminUmkmListFilters = {
  q?: string;
  dusunId?: string;
  kategori?: UmkmKategori | "all";
  published?: "all" | "published" | "draft";
};

export async function adminListDusun(): Promise<Dusun[]> {
  const { data, error } = await supabase
    .from("dusun")
    .select("id,nama,slug")
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Dusun[];
}

export async function adminListUmkm(filters: AdminUmkmListFilters = {}): Promise<AdminUmkmRow[]> {
  let q = supabase
    .from("umkm")
    .select(
      `
      id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
      published,updated_at,
      dusun:dusun_id (id,nama,slug)
    `
    )
    .order("nama", { ascending: true });

  // filter published
  if (filters.published === "published") q = q.eq("published", true);
  if (filters.published === "draft") q = q.eq("published", false);

  // filter kategori
  if (filters.kategori && filters.kategori !== "all") q = q.eq("kategori", filters.kategori);

  // filter dusun
  if (filters.dusunId && filters.dusunId !== "all") q = q.eq("dusun_id", filters.dusunId);

  // search
  if (filters.q && filters.q.trim()) {
    const s = filters.q.trim().replace(/%/g, "\\%").replace(/_/g, "\\_");
    q = q.or(`nama.ilike.%${s}%,no_wa.ilike.%${s}%,alamat.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []) as unknown as AdminUmkmRow[];
}

export async function adminToggleUmkmPublished(id: string, published: boolean): Promise<void> {
  const { error } = await supabase
    .from("umkm")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
export type AdminUmkmUpsertInput = {
  id: string;
  nama: string;
  kategori: UmkmKategori;
  no_wa: string;
  dusun_id: string;

  alamat?: string | null;
  tentang?: string | null;
  jam_buka?: string | null;
  maps_url?: string | null;

  pembayaran?: ("cash" | "transfer" | "qris")[] | null;
  galeri_foto?: string[] | null;
  produk_unggulan_ids?: string[] | null;
  layanan?: ("ambil" | "antar" | "cod")[] | null;
  estimasi?: string | null;

  published?: boolean;
};

export async function adminGetUmkm(id: string): Promise<AdminUmkmRow | null> {
  const { data, error } = await supabase
    .from("umkm")
    .select(
      `
      id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
      published,updated_at,
      dusun:dusun_id (id,nama,slug)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as AdminUmkmRow | null;
}

export async function adminUpsertUmkm(input: AdminUmkmUpsertInput): Promise<void> {
  const payload = {
    id: input.id,
    nama: input.nama,
    kategori: input.kategori,
    no_wa: input.no_wa,
    dusun_id: input.dusun_id,

    alamat: input.alamat ?? null,
    tentang: input.tentang ?? null,
    jam_buka: input.jam_buka ?? null,
    maps_url: input.maps_url ?? null,

    pembayaran: input.pembayaran ?? null,
    galeri_foto: input.galeri_foto ?? null,
    produk_unggulan_ids: input.produk_unggulan_ids ?? null,
    layanan: input.layanan ?? null,
    estimasi: input.estimasi ?? null,

    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("umkm").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}
/** INPUT untuk upsert produk (admin) */
export type AdminProdukUpsertInput = {
  id: string;
  umkm_id: string;
  nama: string;
  harga: number;
  satuan?: string | null;
  foto_url: string;
  deskripsi?: string | null;
  published?: boolean;
};

export type AdminProdukRow = Produk & {
  published: boolean;
  updated_at?: string;
};

export async function adminListProdukByUmkmId(umkmId: string): Promise<AdminProdukRow[]> {
  const { data, error } = await supabase
    .from("produk")
    .select(
      `
      id,nama,harga,satuan,foto_url,deskripsi,published,updated_at,
      umkm:umkm_id (
        id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
        dusun:dusun_id (id,nama,slug)
      )
    `
    )
    .eq("umkm_id", umkmId)
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AdminProdukRow[];
}

export async function adminGetProduk(id: string): Promise<AdminProdukRow | null> {
  const { data, error } = await supabase
    .from("produk")
    .select(
      `
      id,nama,harga,satuan,foto_url,deskripsi,published,updated_at,
      umkm:umkm_id (
        id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
        dusun:dusun_id (id,nama,slug)
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as AdminProdukRow | null;
}

export async function adminUpsertProduk(input: AdminProdukUpsertInput): Promise<void> {
  const payload = {
    id: input.id,
    umkm_id: input.umkm_id,
    nama: input.nama,
    harga: input.harga,
    satuan: input.satuan ?? null,
    foto_url: input.foto_url,
    deskripsi: input.deskripsi ?? null,
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("produk").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function adminToggleProdukPublished(id: string, published: boolean): Promise<void> {
  const { error } = await supabase
    .from("produk")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}