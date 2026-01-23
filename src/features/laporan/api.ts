// src/features/laporan/api.ts
import { supabase } from "../../lib/supabaseClient";

export type CreateLaporanInput = {
  jenis: string; // contoh: "kesehatan" | "umkm" | "infrastruktur" | ...
  targetType?: string | null; // contoh: "dusun" | "umkm" | "kesehatan" | ...
  targetId?: string | null; // id referensi jika ada
  judul: string;
  pesan: string;
};

export type LaporanRow = {
  id: string;
  jenis: string;
  target_type: string | null;
  target_id: string | null;
  judul: string;
  pesan: string;
  nama_pelapor: string | null;
  kontak_pelapor: string | null;
  user_id: string | null;
  status: string; // contoh: "baru" | "diproses" | "selesai" | dst
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
};

export async function createLaporan(input: CreateLaporanInput): Promise<LaporanRow> {
  // wajib login
  const { data: sdata, error: sErr } = await supabase.auth.getSession();
  if (sErr) throw sErr;

  const session = sdata.session;
  if (!session?.user) {
    throw new Error("Silakan login terlebih dahulu untuk mengirim laporan.");
  }

  const userId = session.user.id;

  const payload = {
    jenis: input.jenis,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    judul: input.judul,
    pesan: input.pesan,
    nama_pelapor: null,
    kontak_pelapor: null,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("laporan_konten")
    .insert(payload)
    .select(
      "id,jenis,target_type,target_id,judul,pesan,nama_pelapor,kontak_pelapor,user_id,status,catatan_admin,created_at,updated_at",
    )
    .single();

  if (error) throw error;
  return data as LaporanRow;
}