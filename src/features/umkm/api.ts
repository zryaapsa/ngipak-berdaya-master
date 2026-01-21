import type { Produk, UmkmInfo, Dusun } from "./types";
import { DUSUN, PRODUK, UMKM_LIST } from "./mock";

const SOURCE = import.meta.env.VITE_DATA_SOURCE ?? "mock";

export async function listDusun(): Promise<Dusun[]> {
  if (SOURCE === "mock") return DUSUN;
  throw new Error("supabase not wired");
}

export async function listProduk(): Promise<Produk[]> {
  if (SOURCE === "mock") return PRODUK;
  throw new Error("supabase not wired");
}

export async function listUmkm(): Promise<UmkmInfo[]> {
  if (SOURCE === "mock") return UMKM_LIST;
  throw new Error("supabase not wired");
}

export async function getUmkmById(id: string): Promise<UmkmInfo | null> {
  if (SOURCE === "mock") return UMKM_LIST.find((u) => u.id === id) ?? null;
  throw new Error("supabase not wired");
}

export async function listProdukByUmkmId(umkmId: string): Promise<Produk[]> {
  if (SOURCE === "mock") return PRODUK.filter((p) => p.umkm.id === umkmId);
  throw new Error("supabase not wired");
}
