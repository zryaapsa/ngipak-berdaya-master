import { supabase } from "../../lib/supabaseClient";
import type { KesehatanContent, KesehatanKontak, KesehatanPosyandu, KesehatanStats } from "./types";

export type KesehatanUpsertInput = {
  published: boolean;
  hero_title: string;
  hero_desc: string;
  stats: KesehatanStats;
  isu: string[];
  posyandu: KesehatanPosyandu;
  kontak: KesehatanKontak[];
};

export async function adminGetKesehatan(): Promise<KesehatanContent | null> {
  const { data, error } = await supabase
    .from("kesehatan_content")
    .select("id,published,hero_title,hero_desc,stats,isu,posyandu,kontak,updated_at")
    .eq("id", "main")
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as KesehatanContent | null;
}

export async function adminUpsertKesehatan(input: KesehatanUpsertInput): Promise<void> {
  const payload = {
    id: "main",
    published: input.published,
    hero_title: input.hero_title,
    hero_desc: input.hero_desc,
    stats: input.stats,
    isu: input.isu,
    posyandu: input.posyandu,
    kontak: input.kontak,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("kesehatan_content").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}
