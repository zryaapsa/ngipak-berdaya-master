import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { listDusun } from "../../../features/umkm/api";
import type { Dusun } from "../../../features/umkm/types";
import { supabase } from "../../../lib/supabaseClient";
import { useConfirmDialog } from "../../../components/useConfirmDialog"; // <-- FIX PATH & NAME

type DbRow = {
  id: string; // uuid
  nama: string;
  peran: string | null;
  no_wa: string;
  dusun_id: string;
  published: boolean;
};

type FormState = {
  id?: string;
  nama: string;
  peran: string;
  no_wa: string;
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

export default function AdminKaderPage() {
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
    nama: "",
    peran: "",
    no_wa: "",
    dusun_id: "",
    published: true,
  });

  const load = async () => {
    setErr(null);
    setOkMsg(null);
    setLoading(true);
    try {
      const d = await listDusun();
      const { data, error } = await supabase
        .from("kesehatan_kader")
        .select("id,nama,peran,no_wa,dusun_id,published")
        .order("nama", { ascending: true });

      if (error) throw error;

      setDusun(d);
      setRows((data ?? []) as DbRow[]);
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal memuat kader.");
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
      nama: "",
      peran: "",
      no_wa: "",
      dusun_id: firstDusun,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (r: DbRow) => {
    setModalMode("edit");
    setForm({
      id: r.id,
      nama: r.nama ?? "",
      peran: r.peran ?? "",
      no_wa: r.no_wa ?? "",
      dusun_id: r.dusun_id ?? (dusun[0]?.id ?? ""),
      published: !!r.published,
    });
    setModalOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    setOkMsg(null);
    try {
      if (!form.nama.trim()) throw new Error("Nama wajib diisi.");
      if (!form.no_wa.trim()) throw new Error("No WA wajib diisi.");
      if (!form.dusun_id) throw new Error("Dusun wajib dipilih.");

      const payload = {
        nama: form.nama.trim(),
        peran: form.peran.trim() || null,
        no_wa: form.no_wa.trim(),
        dusun_id: form.dusun_id,
        published: !!form.published,
      };

      if (modalMode === "new") {
        const { error } = await supabase.from("kesehatan_kader").insert(payload);
        if (error) throw error;
        setOkMsg("Kader berhasil ditambahkan.");
      } else {
        if (!form.id) throw new Error("ID kader tidak valid.");
        const { error } = await supabase.from("kesehatan_kader").update(payload).eq("id", form.id);
        if (error) throw error;
        setOkMsg("Kader berhasil disimpan.");
      }

      setModalOpen(false);
      await load();
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal menyimpan kader.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r: DbRow) => {
    const ok = await confirm({
      title: "Hapus kader?",
      message: `Kader "${r.nama}" (${dusunMap.get(r.dusun_id) ?? "—"}) akan dihapus permanen.`,
      danger: true,
      confirmText: "Hapus",
      cancelText: "Batal",
    });
    if (!ok) return;

    setBusy(true);
    setErr(null);
    setOkMsg(null);
    try {
      const { error } = await supabase.from("kesehatan_kader").delete().eq("id", r.id);
      if (error) throw error;
      setOkMsg("Kader berhasil dihapus.");
      await load();
    } catch (e: unknown) {
      setErr(isSbErr(e) ? e.message : "Gagal menghapus kader.");
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
            <div className="text-xl font-semibold text-gray-900">Kader</div>
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
              + Tambah Kader
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
          Daftar Kader
        </div>

        <div className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-600">Belum ada kader.</div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900">{r.nama}</div>
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
                      {r.peran ? `${r.peran} • ` : ""}
                      {dusunMap.get(r.dusun_id) ?? "—"} • {r.no_wa}
                    </div>
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
        title={modalMode === "new" ? "Tambah Kader" : "Edit Kader"}
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
              disabled={busy || !form.nama.trim() || !form.no_wa.trim() || !form.dusun_id}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                busy || !form.nama.trim() || !form.no_wa.trim() || !form.dusun_id
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
          <div className="md:col-span-6">
            <div className="text-xs font-semibold text-gray-600">Nama</div>
            <input
              value={form.nama}
              onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="Bu Siti"
            />
          </div>

          <div className="md:col-span-6">
            <div className="text-xs font-semibold text-gray-600">Peran (opsional)</div>
            <input
              value={form.peran}
              onChange={(e) => setForm((p) => ({ ...p, peran: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="Kader Posyandu"
            />
          </div>

          <div className="md:col-span-6">
            <div className="text-xs font-semibold text-gray-600">No WA</div>
            <input
              value={form.no_wa}
              onChange={(e) => setForm((p) => ({ ...p, no_wa: e.target.value }))}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="62812xxxxxxx"
            />
          </div>

          <div className="md:col-span-6">
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

          <div className="md:col-span-12">
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
        </div>
      </Modal>
    </div>
  );
}