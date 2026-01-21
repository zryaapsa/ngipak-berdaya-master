export type Dusun = { id: string; nama: string; slug: string };
export type UmkmKategori = "makanan" | "minuman" | "jasa";

export type UmkmInfo = {
  id: string;
  nama: string;
  kategori: UmkmKategori;
  no_wa: string;
  alamat?: string;
  dusun: Dusun;

  tentang?: string;
  jam_buka?: string;
  maps_url?: string;
  pembayaran?: ("cash" | "transfer" | "qris")[];

  galeri_foto?: string[];
  produk_unggulan_ids?: string[];

  layanan?: ("ambil" | "antar" | "cod")[];
  estimasi?: string;
};

export type Produk = {
  id: string;
  nama: string;
  harga: number;
  satuan?: string;
  foto_url: string;
  umkm: UmkmInfo;
  deskripsi?: string;
};
