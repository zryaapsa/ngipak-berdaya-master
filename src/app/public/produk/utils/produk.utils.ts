import type { Produk, UmkmInfo, UmkmKategori } from "../../../../features/umkm/types";

export type KategoriOrAll = UmkmKategori | "all";
export type ViewMode = "list" | "grid";

export const kategoriUI: { value: KategoriOrAll; label: string }[] = [
  { value: "all", label: "Semua Kategori" },
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
  { value: "jasa", label: "Jasa" },
];

export function isKategori(v: string): v is UmkmKategori {
  return v === "makanan" || v === "minuman" || v === "jasa";
}

export function kategoriLabel(k: KategoriOrAll) {
  return kategoriUI.find((x) => x.value === k)?.label ?? String(k);
}

export function groupByUmkm(items: Produk[]) {
  const map = new Map<string, { umkm: UmkmInfo; produk: Produk[] }>();
  for (const p of items) {
    const key = p.umkm.id;
    const prev = map.get(key);
    if (!prev) map.set(key, { umkm: p.umkm, produk: [p] });
    else prev.produk.push(p);
  }
  return [...map.values()];
}

export function pickGallery(umkm: UmkmInfo, produk: Produk[]) {
  const g = (umkm.galeri_foto ?? []).slice(0, 3);
  if (g.length) return g;
  return produk.map((p) => p.foto_url).slice(0, 3);
}

export function pickUnggulan(umkm: UmkmInfo, produk: Produk[]) {
  const ids = (umkm.produk_unggulan_ids ?? []).filter(Boolean);
  if (ids.length) {
    const picked = produk.filter((p) => ids.includes(p.id)).slice(0, 2);
    if (picked.length) return picked;
  }
  return produk.slice(0, 2);
}
