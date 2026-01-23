import { supabase } from "../../lib/supabaseClient";
import { listDusun } from "../umkm/api";
import type { Dusun } from "../umkm/types";

import type {
  IsuKesehatan,
  JadwalKesehatan,
  Kader,
  LeafletLink,
  MetaKesehatan,
  StatistikBulanan,
} from "./public.types";

const LEAFLET_BUCKET = "leaflet";
const LEAFLET_PUBLIC_PATH = "leaflet-kesehatan.pdf";

// kesehatan_meta.id = smallint → pakai 1
const META_ID = 1;

function ymFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toYm(bulanRaw: string) {
  if (bulanRaw.length >= 7) return bulanRaw.slice(0, 7);
  return bulanRaw;
}

function normalizePrioritas(
  x: string | null | undefined,
): "rendah" | "sedang" | "tinggi" {
  const v = (x ?? "").toLowerCase().trim();
  if (v === "rendah" || v === "sedang" || v === "tinggi") return v;
  return "sedang";
}

/** === Row Types (tanpa any) === */
type KesehatanMetaRow = {
  id: number; // smallint
  published: boolean;
  updated_at: string | null;
  sumber: string | null;
  periode_terakhir: string | null;
};

type KesehatanIsuRow = {
  id: string;
  judul: string;
  ringkas: string | null;

  dampak: string[] | null;
  upaya_desa: string[] | null;
  aksi_warga: string[] | null;

  prioritas: string | null;

  urutan: number | null;
  sort_order: number | null;

  published: boolean;
};

type KesehatanStatRow = {
  bulan: string; // date -> string
  stunting: number | null;
  hipertensi: number | null;
  published: boolean;
};

type KesehatanKaderRow = {
  id: string;
  nama: string;
  peran: string | null;
  no_wa: string;
  dusun_id: string;
  published: boolean;
};

type KesehatanJadwalRow = {
  id: string;
  kegiatan: string;
  tanggal: string; // date -> string
  jam: string | null;
  lokasi: string | null;
  catatan: string | null;
  dusun_id: string;
  published: boolean;
};

export async function getLeafletKesehatan(): Promise<LeafletLink | null> {
  const { data } = supabase.storage
    .from(LEAFLET_BUCKET)
    .getPublicUrl(LEAFLET_PUBLIC_PATH);

  const url = data?.publicUrl ?? "";
  return url ? { path: url } : null;
}

export async function getMetaKesehatan(): Promise<MetaKesehatan | null> {
  const { data, error } = await supabase
    .from("kesehatan_meta")
    .select("id,published,updated_at,sumber,periode_terakhir")
    .eq("id", META_ID)
    .eq("published", true)
    .maybeSingle<KesehatanMetaRow>();

  if (error) throw error;
  if (!data) return null;

  const periode =
    data.periode_terakhir ??
    (data.updated_at
      ? ymFromDate(new Date(data.updated_at))
      : ymFromDate(new Date()));

  return {
    periode_terakhir: periode,
    sumber: data.sumber ?? "Admin Desa Ngipak",
  };
}

export async function listIsuKesehatan(): Promise<IsuKesehatan[]> {
  const { data, error } = await supabase
    .from("kesehatan_isu")
    .select(
      "id,judul,ringkas,dampak,upaya_desa,aksi_warga,prioritas,urutan,sort_order,published",
    )
    .eq("published", true);

  if (error) throw error;

  const rows = (data ?? []) as KesehatanIsuRow[];

  const sorted = [...rows].sort((a, b) => {
    const ak = a.urutan ?? a.sort_order ?? 999999;
    const bk = b.urutan ?? b.sort_order ?? 999999;
    return ak - bk;
  });

  return sorted.map((x) => ({
    id: x.id,
    judul: x.judul,
    ringkas: x.ringkas ?? "Ringkasan belum diisi.",
    prioritas: normalizePrioritas(x.prioritas),

    // detail sesuai DB
    dampak: x.dampak ?? [],
    upaya_desa: x.upaya_desa ?? [],
    aksi_warga: x.aksi_warga ?? [],

    // legacy fallback (kalau UI lama masih pakai saran)
    saran: (x.aksi_warga ?? []).length
      ? (x.aksi_warga ?? [])
      : (x.upaya_desa ?? []).length
      ? (x.upaya_desa ?? [])
      : x.dampak ?? [],
  }));
}

export async function listStatistikBulanan(): Promise<StatistikBulanan[]> {
  const { data, error } = await supabase
    .from("kesehatan_stat_bulanan")
    .select("bulan,stunting,hipertensi,published")
    .eq("published", true)
    .order("bulan", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as KesehatanStatRow[];

  return rows.map((x) => ({
    bulan: toYm(x.bulan),
    stunting: Number(x.stunting ?? 0),
    hipertensi: Number(x.hipertensi ?? 0),
  }));
}

export async function listKader(): Promise<Kader[]> {
  const dusun = await listDusun();
  const dusunMap = new Map(dusun.map((d) => [d.id, d]));

  const { data, error } = await supabase
    .from("kesehatan_kader")
    .select("id,nama,peran,no_wa,dusun_id,published")
    .eq("published", true)
    .order("nama", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as KesehatanKaderRow[];

  return rows.map((x) => {
    const d = dusunMap.get(x.dusun_id);
    return {
      id: x.id,
      nama: x.nama,
      peran: x.peran ?? undefined,
      no_wa: x.no_wa,
      dusun: (d ??
        ({
          id: x.dusun_id,
          nama: "Dusun tidak ditemukan",
          slug: "unknown",
        } as Dusun)),
    };
  });
}

export async function listJadwalKesehatan(): Promise<JadwalKesehatan[]> {
  const dusun = await listDusun();
  const dusunMap = new Map(dusun.map((d) => [d.id, d]));

  const { data, error } = await supabase
    .from("kesehatan_jadwal")
    .select("id,kegiatan,tanggal,jam,lokasi,catatan,dusun_id,published")
    .eq("published", true)
    .order("tanggal", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as KesehatanJadwalRow[];

  return rows.map((x) => {
    const d = dusunMap.get(x.dusun_id);
    return {
      id: x.id,
      kegiatan: x.kegiatan,
      tanggal: x.tanggal,
      jam: x.jam ?? undefined,
      lokasi: x.lokasi ?? undefined,
      catatan: x.catatan ?? undefined,
      dusun: (d ??
        ({
          id: x.dusun_id,
          nama: "Dusun tidak ditemukan",
          slug: "unknown",
        } as Dusun)),
    };
  });
}