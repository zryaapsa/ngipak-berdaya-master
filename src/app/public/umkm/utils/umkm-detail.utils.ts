import type { Produk, UmkmInfo } from "../../../../features/umkm/types";

export type UmkmGroup = { umkm: UmkmInfo; produk: Produk[] };

export function groupByUmkm(items: Produk[]): UmkmGroup[] {
  const map = new Map<string, UmkmGroup>();
  for (const p of items) {
    const key = p.umkm.id;
    const prev = map.get(key);
    if (!prev) map.set(key, { umkm: p.umkm, produk: [p] });
    else prev.produk.push(p);
  }
  return [...map.values()];
}

export function pickGallery(umkm: UmkmInfo, produk: Produk[]) {
  const g = (umkm.galeri_foto ?? []).filter(Boolean).slice(0, 3);
  if (g.length) return g;
  return produk.map((p) => p.foto_url).filter(Boolean).slice(0, 3);
}

export function pickThumb(umkm: UmkmInfo, produk: Produk[]) {
  return (umkm.galeri_foto ?? [])[0] ?? produk[0]?.foto_url ?? "";
}

export function pickSerupa(all: UmkmGroup[], cur: UmkmInfo) {
  const sameKat = all.filter(
    (x) => x.umkm.id !== cur.id && x.umkm.kategori === cur.kategori,
  );
  const sameDusun = all.filter(
    (x) => x.umkm.id !== cur.id && x.umkm.dusun.id === cur.dusun.id,
  );

  const merged = [...sameKat, ...sameDusun];
  const seen = new Set<string>();

  const unique = merged.filter((x) => {
    if (seen.has(x.umkm.id)) return false;
    seen.add(x.umkm.id);
    return true;
  });

  return unique.slice(0, 3);
}
