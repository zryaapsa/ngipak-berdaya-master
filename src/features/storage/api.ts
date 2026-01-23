import { supabase } from "../../lib/supabaseClient";

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExt(filename: string) {
  const i = filename.lastIndexOf(".");
  const ext = i >= 0 ? filename.slice(i + 1).toLowerCase() : "jpg";
  return ext || "jpg";
}

export async function uploadProdukImage(args: {
  file: File;
  umkmId: string;
  produkIdHint?: string;
}) {
  const { file, umkmId, produkIdHint } = args;

  // guard
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }
  const maxMB = 5;
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`Ukuran gambar maksimal ${maxMB}MB.`);
  }

  const ext = getExt(file.name);
  const base =
    slugify(produkIdHint ?? file.name.replace(/\.[^/.]+$/, "")) || "foto";
  const path = `${slugify(umkmId)}/${Date.now()}-${base}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("produk")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("produk").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Gagal mendapatkan public URL.");

  return { path, publicUrl: data.publicUrl };
}
