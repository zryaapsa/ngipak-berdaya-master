// src/features/umkm/mock.ts
import type { Dusun, Produk, UmkmInfo, UmkmKategori } from "./types";

export const DUSUN: Dusun[] = [
  { id: "d1", nama: "Kalangan 1", slug: "kalangan-1" },
  { id: "d2", nama: "Kalangan 2", slug: "kalangan-2" },
  { id: "d3", nama: "Ngipak", slug: "ngipak" },
  { id: "d4", nama: "Karangwetan", slug: "karangwetan" },
  { id: "d5", nama: "Dungkasi", slug: "dungkasi" },
  { id: "d6", nama: "Coyudan 1", slug: "coyudan-1" },
  { id: "d7", nama: "Coyudan 2", slug: "coyudan-2" },
  { id: "d8", nama: "Jetis", slug: "jetis" },
  { id: "d9", nama: "Munggur", slug: "munggur" },
];

const getDusun = (slug: Dusun["slug"]) => {
  const d = DUSUN.find((x) => x.slug === slug);
  if (!d) throw new Error(`Dusun slug tidak ditemukan: ${slug}`);
  return d;
};

const IMG = {
  TERONG:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/KERIPIK%20TERONG.jpeg",
  MLINJO:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/KERIPIK%20MLINJO.jpeg",
  KACANG_OVEN:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/KACANG%20OVEN.jpeg",
  KERIPIK_PISANG:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/KERIPIK%20PISANG.jpeg",
  SARON:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/GAMELAN/GAMELAN%20(1).jpg",
  FALLBACK:
    "https://aimrxyqppgebeqgfneah.supabase.co/storage/v1/object/public/produk/3.jpeg",
} as const;

const WA = (n: number) => `62812${String(1000000 + n).slice(1)}`;

const mkUmkm = (p: {
  id: string;
  nama: string;
  kategori: UmkmKategori;
  waSeed: number;
  dusunSlug: Dusun["slug"];
  alamat?: string;
  tentang?: string;
  jam_buka?: string;
  pembayaran?: ("cash" | "transfer" | "qris")[];
  galeri?: string[];
  unggulan?: string[];
  layanan?: ("ambil" | "antar" | "cod")[];
  estimasi?: string;
}): UmkmInfo => ({
  id: p.id,
  nama: p.nama,
  kategori: p.kategori,
  no_wa: WA(p.waSeed),
  alamat: p.alamat ?? `Dusun ${getDusun(p.dusunSlug).nama}, Gunungkidul`,
  dusun: getDusun(p.dusunSlug),
  tentang: p.tentang,
  jam_buka: p.jam_buka,
  pembayaran: p.pembayaran,
  maps_url: `https://maps.google.com/?q=Dusun+${encodeURIComponent(
    getDusun(p.dusunSlug).nama,
  )}+Gunungkidul`,
  galeri_foto: p.galeri,
  produk_unggulan_ids: p.unggulan,
  layanan: p.layanan,
  estimasi: p.estimasi,
});

const UMKM = {
  NGIPAK_KERIPIK: mkUmkm({
    id: "u-ngipak-keripik",
    nama: "Keripik Ngipak",
    kategori: "makanan",
    waSeed: 1,
    dusunSlug: "ngipak",
    tentang: "Keripik rumahan (terong & mlinjo) gurih-renyah untuk camilan dan oleh-oleh.",
    jam_buka: "08.00–17.00",
    pembayaran: ["cash", "transfer"],
    galeri: [IMG.TERONG, IMG.MLINJO, IMG.FALLBACK],
    unggulan: ["p-terong", "p-mlinjo"],
    layanan: ["ambil", "antar", "cod"],
    estimasi: "Same day (area dekat)",
  }),

  DUNGKASI_KACANG: mkUmkm({
    id: "u-dungkasi-kacang",
    nama: "Kacang Oven Dungkasi",
    kategori: "makanan",
    waSeed: 2,
    dusunSlug: "dungkasi",
    tentang: "Kacang oven gurih untuk teman minum. Ada kemasan harian & oleh-oleh.",
    jam_buka: "09.00–16.00",
    pembayaran: ["cash", "qris"],
    galeri: [IMG.KACANG_OVEN, IMG.FALLBACK, IMG.KERIPIK_PISANG],
    unggulan: ["p-kacang-oven"],
    layanan: ["ambil", "antar"],
    estimasi: "1 hari",
  }),

  KALANGAN2_PISANG: mkUmkm({
    id: "u-kalangan2-pisang",
    nama: "Keripik Pisang Kalangan 2",
    kategori: "makanan",
    waSeed: 3,
    dusunSlug: "kalangan-2",
    tentang: "Keripik pisang renyah manis-gurih. Cocok untuk oleh-oleh.",
    jam_buka: "08.00–17.00",
    pembayaran: ["cash", "transfer"],
    galeri: [IMG.KERIPIK_PISANG, IMG.FALLBACK, IMG.MLINJO],
    unggulan: ["p-keripik-pisang"],
    layanan: ["ambil", "cod"],
    estimasi: "Same day",
  }),

  KARANGWETAN_SARON: mkUmkm({
    id: "u-karangwetan-saron",
    nama: "Pengrajin Saron Karangwetan",
    kategori: "jasa",
    waSeed: 4,
    dusunSlug: "karangwetan",
    tentang: "Pembuatan saron/gamelan custom. Konsultasi spesifikasi & estimasi via WhatsApp.",
    jam_buka: "08.00–16.00",
    pembayaran: ["transfer", "cash"],
    galeri: [IMG.SARON, IMG.FALLBACK, IMG.KACANG_OVEN],
    unggulan: ["p-saron"],
    layanan: ["ambil"],
    estimasi: "7–14 hari (custom)",
  }),
} as const;

const mkProduk = (p: {
  id: string;
  nama: string;
  harga: number;
  satuan?: string;
  foto: string;
  deskripsi?: string;
  umkm: UmkmInfo;
}): Produk => ({
  id: p.id,
  nama: p.nama,
  harga: p.harga,
  satuan: p.satuan,
  foto_url: p.foto,
  deskripsi: p.deskripsi,
  umkm: p.umkm,
});

export const PRODUK: Produk[] = [
  mkProduk({
    id: "p-terong",
    nama: "Keripik Terong",
    harga: 15000,
    satuan: "pack",
    foto: IMG.TERONG,
    deskripsi: "Keripik terong gurih dan renyah.",
    umkm: UMKM.NGIPAK_KERIPIK,
  }),
  mkProduk({
    id: "p-mlinjo",
    nama: "Keripik Mlinjo",
    harga: 20000,
    satuan: "pack",
    foto: IMG.MLINJO,
    deskripsi: "Keripik mlinjo (emping) gurih.",
    umkm: UMKM.NGIPAK_KERIPIK,
  }),
  mkProduk({
    id: "p-kacang-oven",
    nama: "Kacang Oven",
    harga: 12000,
    satuan: "pack",
    foto: IMG.KACANG_OVEN,
    deskripsi: "Kacang oven gurih, cocok untuk teman minum.",
    umkm: UMKM.DUNGKASI_KACANG,
  }),
  mkProduk({
    id: "p-keripik-pisang",
    nama: "Keripik Pisang",
    harga: 13000,
    satuan: "pack",
    foto: IMG.KERIPIK_PISANG,
    deskripsi: "Keripik pisang renyah untuk oleh-oleh.",
    umkm: UMKM.KALANGAN2_PISANG,
  }),
  mkProduk({
    id: "p-saron",
    nama: "Saron (Gamelan) Custom",
    harga: 0,
    satuan: "custom",
    foto: IMG.SARON,
    deskripsi: "Custom sesuai spesifikasi. Chat WA untuk konsultasi.",
    umkm: UMKM.KARANGWETAN_SARON,
  }),
];

export const UMKM_LIST: UmkmInfo[] = Array.from(
  new Map(PRODUK.map((p) => [p.umkm.id, p.umkm])).values(),
);
