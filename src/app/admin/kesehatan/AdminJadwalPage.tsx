import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { listDusun } from "../../../features/umkm/api";
import type { Dusun } from "../../../features/umkm/types";
import { useConfirmDialog } from "../../../components/useConfirmDialog"; // <-- FIX PATH & NAME

type DbRow = {
  id: string; // uuid
  kegiatan: string;
  tanggal: string; // YYYY-MM-DD
  jam?: string | null; // bisa undefined kalau kolom jam tidak ada
  lokasi: string | null;
  catatan: string | null;
  dusun_id: string;
  published: boolean;
};

type FormState = {
  id?: string;
  kegiatan: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  catatan: string;
  dusun_id: string;
  published: boolean;
};

type SbErr = { message: string; code?: string };

function isSbErr(x: unknown): x is SbErr {
  return !!x && typeof x === "object" && "message" in x;
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtTanggal(s: string) {
  if (!s || s.length < 10) return s;
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[900]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
          <div className="p-6">{children}</div>
          {footer ? <div className="border-t border-gray-100 px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminJadwalPage() {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [dusun, setDusun] = useState<Dusun[]>([]);
  const dusunMap = useMemo(() => new Map(dusun.map((d) => [d.id, d.nama])), [dusun]);

  const [rows, setRows] = useState<DbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [form, setForm] = useState<FormState>({
    kegiatan: "",
    tanggal: todayISO(),
    jam: "",
    lokasi: "",
    catatan: "",
    dusun_id: "",
    published: true,
  });

  const load = async () => {
    setErr(null);
    setOkMsg(null);
    setLoading(true);
    try {
      const d = await listDusun();

      // coba query dengan jam; kalau kolom jam belum ada, retry tanpa jam
      const q1 = await supabase
        .from("kesehatan_jadwal")
        .select("id,kegiatan,tanggal,jam,lokasi,catatan,dusun_id,published")
        .order("tanggal", { ascending: true });

      let data = q1.data as unknown;
      let error = q1.error as unknown;

      if (isSbErr(error) && String(error.code) === "42703") {
        const q2 = await supabase
          .from("kesehatan_jadwal")
          .select("id,kegiatan,tanggal,lokasi,catatan,dusun_id,published")
          .order("tanggal", { ascending: true });
        data = q2.data as unknown;
        error = q2.error as unknown;
      }

      if (error) throw error;

      setDusun(d);
      setRows((data ?? []) as DbRow[]);
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => {
    const firstDusun = dusun[0]?.id ?? "";
    setModalMode("new");
    setForm({
      kegiatan: "",
      tanggal: todayISO(),
      jam: "",
      lokasi: "",
      catatan: "",
      dusun_id: firstDusun,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (r: DbRow) => {
    setModalMode("edit");
    setForm({
      id: r.id,
      kegiatan: r.kegiatan ?? "",
      tanggal: r.tanggal ?? todayISO(),
      jam: r.jam ?? "",
      lokasi: r.lokasi ?? "",
      catatan: r.catatan ?? "",
      dusun_id: r.dusun_id ?? (dusun[0]?.id ?? ""),
      published: !!r.published,
    });
    setModalOpen(true);
  };

  const insertOrUpdateWithJamFallback = async (mode: "insert" | "update", id?: string) => {
    const payloadWithJam = {
      kegiatan: form.kegiatan.trim(),
      tanggal: form.tanggal,
      jam: form.jam.trim() || null,
      lokasi: form.lokasi.trim() || null,
      catatan: form.catatan.trim() || null,
      dusun_id: form.dusun_id,
      published: !!form.published,
    };

    const payloadNoJam = {
      kegiatan: form.kegiatan.trim(),
      tanggal: form.tanggal,
      lokasi: form.lokasi.trim() || null,
      catatan: form.catatan.trim() || null,
      dusun_id: form.dusun_id,
      published: !!form.published,
    };

    // 1) coba dengan jam
    let res =
      mode === "insert"
        ? await supabase.from("kesehatan_jadwal").insert(payloadWithJam)
        : await supabase.from("kesehatan_jadwal").update(payloadWithJam).eq("id", id);

    // 2) kalau kolom jam tidak ada -> retry tanpa jam
    if (res.error && String(res.error.code) === "42703") {
      res =
        mode === "insert"
          ? await supabase.from("kesehatan_jadwal").insert(payloadNoJam)
          : await supabase.from("kesehatan_jadwal").update(payloadNoJam).eq("id", id);
    }

    if (res.error) throw res.error;
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    setOkMsg(null);
    try {
      if (!form.kegiatan.trim()) throw new Error("Kegiatan wajib diisi.");
      if (!form.tanggal) throw new Error("Tanggal wajib diisi.");
      if (!form.dusun_id) throw new Error("Dusun wajib dipilih.");

      if (modalMode === "new") {
        await insertOrUpdateWithJamFallback("insert");
        setOkMsg("Jadwal berhasil ditambahkan.");
      } else {
        if (!form.id) throw new Error("ID jadwal tidak valid.");
        await insertOrUpdateWithJamFallback("update", form.id);
        setOkMsg("Jadwal berhasil disimpan.");
      }

      setModalOpen(false);
      await load();
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal menyimpan jadwal.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r: DbRow) => {
    const ok = await confirm({
      title: "Hapus jadwal?",
      message: `Jadwal "${r.kegiatan}" (${fmtTanggal(r.tanggal)}) akan dihapus permanen.`,
      danger: true,
      confirmText: "Hapus",
      cancelText: "Batal",
    });
    if (!ok) return;

    setBusy(true);
    setErr(null);
    setOkMsg(null);
    try {
      const { error } = await supabase.from("kesehatan_jadwal").delete().eq("id", r.id);
      if (error) throw error;
      setOkMsg("Jadwal berhasil dihapus.");
      await load();
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal menghapus jadwal.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Memuat…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog />

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Jadwal Kegiatan</div>
            <div className="mt-1 text-sm text-gray-600">
              Public hanya melihat yang <span className="font-semibold">Published</span>.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              to="/admin/kesehatan"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Kembali
            </NavLink>
            <button
              type="button"
              onClick={openNew}
              className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              + Tambah Jadwal
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
        {okMsg ? (
          <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
            {okMsg}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
          Daftar Jadwal
        </div>

        <div className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-600">Belum ada jadwal.</div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900">{r.kegiatan}</div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1",
                          r.published
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : "bg-gray-50 text-gray-600 ring-gray-200"
                        )}
                      >
                        {r.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {fmtTanggal(r.tanggal)}
                      {r.jam ? ` • ${r.jam}` : ""}
                      {" • "}
                      {dusunMap.get(r.dusun_id) ?? "—"}
                      {r.lokasi ? ` • ${r.lokasi}` : ""}
                    </div>
                    {r.catatan ? <div className="mt-1 text-xs text-gray-500">{r.catatan}</div> : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(r)}
                      disabled={busy}
                      className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === "new" ? "Tambah Jadwal" : "Edit Jadwal"}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy || !form.kegiatan.trim() || !form.tanggal || !form.dusun_id}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                busy || !form.kegiatan.trim() || !form.tanggal || !form.dusun_id
                  ? "bg-gray-300"
                  : "bg-gray-900 hover:bg-gray-800"
              )}
            >
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="text-xs font-semibold text-gray-600">Kegiatan</div>
            <input
              value={form.kegiatan}
              onChange={(e) => setForm((p) => ({ ...p, kegiatan: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="Posyandu Balita / Senam Lansia / dsb"
            />
          </div>

          <div className="md:col-span-5">
            <div className="text-xs font-semibold text-gray-600">Dusun</div>
            <select
              value={form.dusun_id}
              onChange={(e) => setForm((p) => ({ ...p, dusun_id: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            >
              {dusun.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs font-semibold text-gray-600">Tanggal</div>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm((p) => ({ ...p, tanggal: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div className="md:col-span-4">
            <div className="text-xs font-semibold text-gray-600">Jam (opsional)</div>
            <input
              value={form.jam}
              onChange={(e) => setForm((p) => ({ ...p, jam: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="08:00"
            />
          </div>

          <div className="md:col-span-4">
            <div className="text-xs font-semibold text-gray-600">Published</div>
            <label className="mt-2 flex h-11 items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm">
              <span className="text-sm text-gray-700">{form.published ? "On" : "Off"}</span>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
              />
            </label>
          </div>

          <div className="md:col-span-12">
            <div className="text-xs font-semibold text-gray-600">Lokasi (opsional)</div>
            <input
              value={form.lokasi}
              onChange={(e) => setForm((p) => ({ ...p, lokasi: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="Balai Dusun / Posyandu / Puskesmas"
            />
          </div>

          <div className="md:col-span-12">
            <div className="text-xs font-semibold text-gray-600">Catatan (opsional)</div>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))}
              className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              placeholder="Bawa KMS / KTP / dsb"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}