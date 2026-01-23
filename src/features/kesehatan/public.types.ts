import type { Dusun } from "../umkm/types";

export type MetaKesehatan = {
  periode_terakhir: string; // "YYYY-MM"
  sumber: string;
};

export type LeafletLink = {
  path: string; // url/path leaflet pdf
};

export type StatistikBulanan = {
  bulan: string; // "YYYY-MM"
  stunting: number;
  hipertensi: number;
};

export type IsuKesehatan = {
  id: string;
  judul: string;
  ringkas: string;
  prioritas?: "rendah" | "sedang" | "tinggi";

  // detail sesuai kolom DB kesehatan_isu
  dampak?: string[];
  upaya_desa?: string[];
  aksi_warga?: string[];

  // fallback/legacy (boleh tetap ada)
  saran?: string[];
};

export type Kader = {
  id: string;
  nama: string;
  peran?: string;
  no_wa: string;
  dusun: Dusun;
};

export type JadwalKesehatan = {
  id: string;
  kegiatan: string;
  tanggal: string; // ISO date "YYYY-MM-DD"
  jam?: string; // "08:00"
  lokasi?: string;
  catatan?: string;
  dusun: Dusun;
};
