// src/features/kesehatan/types.ts
// Gabungan: tipe content lama + public types (barrel export)

export type KesehatanStats = Record<string, number>;

export type PosyanduBlock = {
  judul: string;
  jadwal: string;
  lokasi: string;
};

export type KesehatanPosyandu = {
  balita?: PosyanduBlock;
  lansia?: PosyanduBlock;
};

export type KesehatanKontak = {
  nama: string;
  peran: string;
  no_wa: string;
};

export type KesehatanContent = {
  id: "main";
  published: boolean;
  hero_title: string;
  hero_desc: string;
  stats: KesehatanStats;
  isu: string[];
  posyandu: KesehatanPosyandu;
  kontak: KesehatanKontak[];
  updated_at: string;
};

// ✅ Re-export public kesehatan types supaya import lama tidak pecah
export type {
  MetaKesehatan,
  LeafletLink,
  StatistikBulanan,
  IsuKesehatan,
  Kader,
  JadwalKesehatan,
} from "./public.types";