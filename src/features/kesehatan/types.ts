export type Dusun = { id: string; nama: string; slug: string };

export type Kader = { id: string; dusun: Dusun; nama: string; no_wa: string };

export type JadwalKesehatan = {
  id: string;
  dusun: Dusun;
  kegiatan: string;
  tanggal: string;
  jam_mulai?: string;
  jam_selesai?: string;
  lokasi?: string;
  catatan?: string;
};

export type IsuKesehatan = {
  id: string;
  judul: string;
  ringkas: string;
  dampak: string[];
  upayaDesa: string[];
  aksiWarga: string[];
};

export type StatistikBulanan = {
  bulan: string;
  hipertensi: number;
  stunting: number;
};

export type MetaKesehatan = {
  periode_terakhir: string;
  sumber: string;
};

export type LeafletLink = {
  label: string;
  path: string;
};
