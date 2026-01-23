import type { Produk, UmkmInfo, Dusun } from "./types";
import { DUSUN, PRODUK, UMKM_LIST } from "./mock";
import { supabase } from "../../lib/supabaseClient";

const SOURCE = import.meta.env.VITE_DATA_SOURCE ?? "mock";

export async function listDusun(): Promise<Dusun[]> {
  if (SOURCE === "mock") return DUSUN;

  const { data, error } = await supabase
    .from("dusun")
    .select("id,nama,slug")
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Dusun[];
}

export async function listUmkm(): Promise<UmkmInfo[]> {
  if (SOURCE === "mock") return UMKM_LIST;

  const { data, error } = await supabase
    .from("umkm")
    .select(
      `
      id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
      dusun:dusun_id (id,nama,slug)
    `
    )
    .eq("published", true)
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as UmkmInfo[];
}

export async function getUmkmById(id: string): Promise<UmkmInfo | null> {
  if (SOURCE === "mock") return UMKM_LIST.find((u) => u.id === id) ?? null;

  const { data, error } = await supabase
    .from("umkm")
    .select(
      `
      id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
      dusun:dusun_id (id,nama,slug)
    `
    )
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as UmkmInfo | null;
}

/**
 * Untuk halaman list / agregasi, kamu bisa pakai ini.
 * Tapi untuk detail page, pakai listProdukByUmkmId.
 */
export async function listProduk(): Promise<Produk[]> {
  if (SOURCE === "mock") return PRODUK;

  const { data, error } = await supabase
    .from("produk")
    .select(
      `
      id,nama,harga,satuan,foto_url,deskripsi,
      umkm:umkm_id!inner (
        id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
        published,
        dusun:dusun_id (id,nama,slug)
      )
    `
    )
    .eq("published", true)
    .eq("umkm.published", true)
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Produk[];
}

export async function listProdukByUmkmId(umkmId: string): Promise<Produk[]> {
  if (SOURCE === "mock") return PRODUK.filter((p) => p.umkm.id === umkmId);

  const { data, error } = await supabase
    .from("produk")
    .select(
      `
      id,nama,harga,satuan,foto_url,deskripsi,
      umkm:umkm_id!inner (
        id,nama,kategori,no_wa,alamat,tentang,jam_buka,maps_url,pembayaran,galeri_foto,produk_unggulan_ids,layanan,estimasi,
        published,
        dusun:dusun_id (id,nama,slug)
      )
    `
    )
    .eq("published", true)
    .eq("umkm_id", umkmId)
    .eq("umkm.published", true)
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Produk[];
}

