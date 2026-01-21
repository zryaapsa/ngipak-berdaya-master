import type {
  Kader,
  JadwalKesehatan,
  IsuKesehatan,
  StatistikBulanan,
  MetaKesehatan,
  LeafletLink,
} from "./types";
import { META_KESEHATAN, LEAFLET, ISU, STATISTIK, KADER, JADWAL } from "./mock";

const SOURCE = import.meta.env.VITE_DATA_SOURCE ?? "mock";

export async function getMetaKesehatan(): Promise<MetaKesehatan> {
  if (SOURCE === "mock") return META_KESEHATAN;
  throw new Error("supabase not wired");
}

export async function getLeafletKesehatan(): Promise<LeafletLink> {
  if (SOURCE === "mock") return LEAFLET.kesehatan;
  throw new Error("supabase not wired");
}

export async function listIsuKesehatan(): Promise<IsuKesehatan[]> {
  if (SOURCE === "mock") return ISU;
  throw new Error("supabase not wired");
}

export async function listStatistikBulanan(): Promise<StatistikBulanan[]> {
  if (SOURCE === "mock") return STATISTIK;
  throw new Error("supabase not wired");
}

export async function listKader(): Promise<Kader[]> {
  if (SOURCE === "mock") return KADER;
  throw new Error("supabase not wired");
}

export async function listJadwalKesehatan(): Promise<JadwalKesehatan[]> {
  if (SOURCE === "mock") return JADWAL;
  throw new Error("supabase not wired");
}
