import { supabase } from "../../lib/supabaseClient";
import type { KesehatanContent } from "./types";

export async function getKesehatanPublished(): Promise<KesehatanContent | null> {
  const { data, error } = await supabase
    .from("kesehatan_content")
    .select("id,published,hero_title,hero_desc,stats,isu,posyandu,kontak,updated_at")
    .eq("id", "main")
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as KesehatanContent | null;
}
