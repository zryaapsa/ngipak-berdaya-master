// src/features/kesehatan/mock.ts
import type {
  IsuKesehatan,
  StatistikBulanan,
  Kader,
  JadwalKesehatan,
  MetaKesehatan,
  LeafletLink,
} from "./public.types";

export const META_KESEHATAN: MetaKesehatan = {
  periode_terakhir: "2026-01",
  sumber: "Rekap Posyandu Desa Ngipak (dummy)",
};

export const LEAFLET: { kesehatan: LeafletLink } = {
  kesehatan: {
    path: "/leaflet/leaflet-kesehatan.pdf",
  },
};

export const ISU: IsuKesehatan[] = [
  {
    id: "stunting",
    judul: "Stunting",
    ringkas:
      "Fokus 1000 HPK: pemantauan tumbuh kembang, edukasi gizi keluarga, dan dukungan PMT.",
    prioritas: "tinggi",
    dampak: [
      "Pertumbuhan balita terhambat",
      "Risiko kesehatan jangka panjang meningkat",
    ],
    upaya_desa: [
      "Penimbangan dan pengukuran rutin",
      "PMT balita dan edukasi gizi",
    ],
    aksi_warga: [
      "Datang posyandu tiap bulan (BB/TB tercatat)",
      "Cukupi protein hewani sesuai kemampuan",
      "Lengkapi imunisasi dan vitamin",
    ],
  },
  {
    id: "hipertensi",
    judul: "Hipertensi",
    ringkas:
      "Kasus tekanan darah tinggi perlu pemantauan rutin, pola makan seimbang, dan aktivitas fisik.",
    prioritas: "tinggi",
    dampak: [
      "Meningkatkan risiko stroke dan penyakit jantung",
      "Keluhan pusing/lemas berulang terutama pada lansia",
    ],
    upaya_desa: [
      "Cek tensi berkala di posbindu/posyandu lansia",
      "Edukasi diet rendah garam dan berhenti merokok",
    ],
    aksi_warga: [
      "Cek tekanan darah minimal 1x/bulan",
      "Kurangi garam, gorengan, dan rokok",
      "Aktivitas fisik ringan 30 menit/hari",
    ],
  },
  {
    id: "kesehatan-lingkungan",
    judul: "Kesehatan Lingkungan",
    ringkas:
      "Kebersihan lingkungan dan pengelolaan air/sampah untuk menurunkan diare/DBD/penyakit kulit.",
    prioritas: "sedang",
    dampak: ["Diare pada balita", "DBD saat musim hujan"],
    upaya_desa: ["PSN 3M", "Edukasi cuci tangan", "Kerja bakti lingkungan"],
    aksi_warga: ["Tutup wadah air", "Buang sampah terpilah", "Cuci tangan pakai sabun"],
  },
];

export const STATISTIK: StatistikBulanan[] = [
  { bulan: "2025-08", hipertensi: 110, stunting: 18 },
  { bulan: "2025-09", hipertensi: 115, stunting: 17 },
  { bulan: "2025-10", hipertensi: 121, stunting: 16 },
  { bulan: "2025-11", hipertensi: 124, stunting: 15 },
  { bulan: "2025-12", hipertensi: 126, stunting: 15 },
  { bulan: "2026-01", hipertensi: 128, stunting: 14 },
];

export const KADER: Kader[] = [
  {
    id: "k1",
    dusun: { id: "d1", nama: "Kalangan 1", slug: "kalangan-1" },
    nama: "Bu Siti",
    no_wa: "6287819443263",
  },
  {
    id: "k2",
    dusun: { id: "d3", nama: "Ngipak", slug: "ngipak" },
    nama: "Bu Wati",
    no_wa: "628976536276",
  },
  {
    id: "k3",
    dusun: { id: "d8", nama: "Jetis", slug: "jetis" },
    nama: "Bu Rina",
    no_wa: "6285641191935",
  },
];

export const JADWAL: JadwalKesehatan[] = [
  {
    id: "j1",
    dusun: { id: "d3", nama: "Ngipak", slug: "ngipak" },
    kegiatan: "Posyandu Balita",
    tanggal: "2026-01-20",
    jam: "08:00–10:00",
    lokasi: "Balai Dusun Ngipak",
    catatan: "Bawa KIA & buku kesehatan.",
  },
  {
    id: "j2",
    dusun: { id: "d1", nama: "Kalangan 1", slug: "kalangan-1" },
    kegiatan: "Posbindu Lansia",
    tanggal: "2026-01-22",
    jam: "07:30–09:30",
    lokasi: "Rumah Pak RT",
  },
  {
    id: "j3",
    dusun: { id: "d8", nama: "Jetis", slug: "jetis" },
    kegiatan: "Imunisasi",
    tanggal: "2026-01-25",
    jam: "08:00",
    lokasi: "Posyandu Jetis",
  },
];