import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const META_ID = 1; // kesehatan_meta.id = smallint
const LEAFLET_BUCKET = "leaflet";
const LEAFLET_PATH = "leaflet-kesehatan.pdf";

type MetaRow = {
  id: number;
  published: boolean;
  sumber: string | null;
  periode_terakhir: string | null; // "YYYY-MM"
  updated_at: string | null;
};

type IsuRow = {
  id: string;
  judul: string;
  ringkas: string | null;
  prioritas: string | null;
  saran: string[] | null;
  urutan: number | null;
  sort_order: number | null;
  published: boolean;
  updated_at: string | null;
};

type StatRow = {
  bulan: string; // date string or "YYYY-MM-01"
  stunting: number | null;
  hipertensi: number | null;
  published: boolean;
};

type UiIsu = {
  key: string;
  isNew: boolean;
  id: string;
  judul: string;
  ringkas: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  saranText: string; // per baris
  urutan: number;
  published: boolean;
};

type UiStat = {
  key: string;
  isNew: boolean;
  bulanYm: string; // "YYYY-MM" (editable)
  bulanDb: string; // "YYYY-MM-01" (key lama utk update/delete)
  stunting: number;
  hipertensi: number;
  published: boolean;
};

function normalizePrioritas(x: string): "rendah" | "sedang" | "tinggi" {
  const v = x.toLowerCase().trim();
  if (v === "rendah" || v === "sedang" || v === "tinggi") return v;
  return "sedang";
}

function toNonNegInt(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function monthToDate(ym: string) {
  // store as YYYY-MM-01 for DATE columns
  return `${ym}-01`;
}
function dateToMonth(s: string) {
  return s.length >= 7 ? s.slice(0, 7) : s;
}

function splitLines(s: string) {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function ConfirmModal({
  open,
  title,
  message,
  danger,
  confirmText,
  cancelText,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
  onClose: (ok: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          {message ? <div className="mt-2 text-sm text-gray-600">{message}</div> : null}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {cancelText ?? "Batal"}
            </button>
            <button
              type="button"
              onClick={() => onClose(true)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                danger ? "bg-red-600 hover:bg-red-500" : "bg-gray-900 hover:bg-gray-800",
              )}
            >
              {confirmText ?? "Ya"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminKesehatanPage() {
  // Meta
  const [meta, setMeta] = useState<MetaRow>({
    id: META_ID,
    published: true,
    sumber: "Admin Desa Ngipak",
    periode_terakhir: "",
    updated_at: null,
  });

  // Leaflet
  const [leafletBusy, setLeafletBusy] = useState(false);
  const [leafletBuster, setLeafletBuster] = useState(0);

  const leafletUrl = useMemo(() => {
    const { data } = supabase.storage.from(LEAFLET_BUCKET).getPublicUrl(LEAFLET_PATH);
    const url = data?.publicUrl ?? "";
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}t=${leafletBuster}`;
  }, [leafletBuster]);

  // Isu
  const [isu, setIsu] = useState<UiIsu[]>([]);
  const [isuBusyKey, setIsuBusyKey] = useState<string | null>(null);

  // Statistik
  const [stats, setStats] = useState<UiStat[]>([]);
  const [statBusyKey, setStatBusyKey] = useState<string | null>(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Confirm
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message?: string;
    danger?: boolean;
    onOk?: () => Promise<void> | void;
  }>({ open: false, title: "" });

  const openConfirm = (o: Omit<typeof confirm, "open">) => setConfirm({ open: true, ...o });
  const closeConfirm = async (ok: boolean) => {
    const fn = confirm.onOk;
    setConfirm({ open: false, title: "" });
    if (ok && fn) await fn();
  };

  const loadAll = async () => {
    setErr(null);
    setOkMsg(null);
    setLoading(true);
    try {
      // meta (id smallint)
      const m = await supabase
        .from("kesehatan_meta")
        .select("id,published,sumber,periode_terakhir,updated_at")
        .eq("id", META_ID)
        .maybeSingle<MetaRow>();

      if (m.error) throw m.error;

      if (m.data) {
        setMeta({
          id: META_ID,
          published: !!m.data.published,
          sumber: m.data.sumber ?? "Admin Desa Ngipak",
          periode_terakhir: m.data.periode_terakhir ?? "",
          updated_at: m.data.updated_at ?? null,
        });
      } else {
        // belum ada row id=1 → tetap bisa disimpan dari UI
        setMeta((p) => ({ ...p, id: META_ID }));
      }

      // isu
      const is = await supabase
        .from("kesehatan_isu")
        .select("id,judul,ringkas,prioritas,saran,urutan,sort_order,published,updated_at")
        .order("urutan", { ascending: true });

      if (is.error) throw is.error;

      const isuMapped: UiIsu[] = ((is.data ?? []) as IsuRow[]).map((r) => ({
        key: r.id,
        isNew: false,
        id: r.id,
        judul: r.judul ?? "",
        ringkas: r.ringkas ?? "",
        prioritas: normalizePrioritas(r.prioritas ?? "sedang"),
        saranText: (r.saran ?? []).join("\n"),
        urutan: r.urutan ?? r.sort_order ?? 0,
        published: !!r.published,
      }));
      setIsu(isuMapped);

      // statistik bulanan
      const st = await supabase
        .from("kesehatan_stat_bulanan")
        .select("bulan,stunting,hipertensi,published")
        .order("bulan", { ascending: true });

      if (st.error) throw st.error;

      const statMapped: UiStat[] = ((st.data ?? []) as StatRow[]).map((r) => {
        const bulanDb = String(r.bulan);
        const bulanYm = dateToMonth(bulanDb);
        return {
          key: bulanDb,
          isNew: false,
          bulanYm,
          bulanDb: monthToDate(bulanYm),
          stunting: Number(r.stunting ?? 0),
          hipertensi: Number(r.hipertensi ?? 0),
          published: !!r.published,
        };
      });
      setStats(statMapped);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat data kesehatan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== META SAVE =====
  const saveMeta = async () => {
    setSavingMeta(true);
    setErr(null);
    setOkMsg(null);
    try {
      const payload: MetaRow = {
        id: META_ID,
        published: !!meta.published,
        sumber: meta.sumber?.trim() ? meta.sumber.trim() : null,
        periode_terakhir: meta.periode_terakhir?.trim() ? meta.periode_terakhir.trim() : null,
        updated_at: null,
      };

      const { error } = await supabase.from("kesehatan_meta").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      setOkMsg("Meta berhasil disimpan.");
      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan meta.");
    } finally {
      setSavingMeta(false);
    }
  };

  // ===== LEAFLET UPLOAD =====
  const uploadLeaflet = async (file: File) => {
    setLeafletBusy(true);
    setErr(null);
    setOkMsg(null);
    try {
      if (file.type !== "application/pdf") {
        throw new Error("File harus PDF.");
      }

      const { error } = await supabase.storage
        .from(LEAFLET_BUCKET)
        .upload(LEAFLET_PATH, file, { upsert: true, contentType: "application/pdf" });

      if (error) throw error;

      // cache-buster supaya pdf baru langsung kebuka
      setLeafletBuster((x) => x + 1);
      setOkMsg("Leaflet berhasil diunggah.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal upload leaflet.");
    } finally {
      setLeafletBusy(false);
    }
  };

  // ===== ISU CRUD =====
  const addIsu = () => {
    setIsu((p) => [
      {
        key: `new-${Date.now()}`,
        isNew: true,
        id: "",
        judul: "",
        ringkas: "",
        prioritas: "sedang",
        saranText: "",
        urutan: 0,
        published: true,
      },
      ...p,
    ]);
  };

  const saveIsu = async (r: UiIsu) => {
    setIsuBusyKey(r.key);
    setErr(null);
    setOkMsg(null);
    try {
      const id = r.isNew ? (r.id.trim() ? r.id.trim() : slugify(r.judul)) : r.id;
      if (!id) throw new Error("ID kosong. Isi judul agar ID bisa dibuat.");
      if (!r.judul.trim()) throw new Error("Judul wajib diisi.");

      const payload = {
        id,
        judul: r.judul.trim(),
        ringkas: r.ringkas.trim() || null,
        prioritas: r.prioritas,
        saran: splitLines(r.saranText),
        urutan: Number.isFinite(r.urutan) ? Math.trunc(r.urutan) : 0,
        published: !!r.published,
      };

      if (r.isNew) {
        const { error } = await supabase.from("kesehatan_isu").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kesehatan_isu").update(payload).eq("id", r.id);
        if (error) throw error;
      }

      setOkMsg("Isu berhasil disimpan.");
      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan isu.");
    } finally {
      setIsuBusyKey(null);
    }
  };

  const removeIsu = (r: UiIsu) => {
    if (r.isNew) {
      setIsu((p) => p.filter((x) => x.key !== r.key));
      return;
    }
    openConfirm({
      title: "Hapus isu?",
      message: `Isu "${r.judul}" akan dihapus permanen.`,
      danger: true,
      onOk: async () => {
        setIsuBusyKey(r.key);
        setErr(null);
        setOkMsg(null);
        try {
          const { error } = await supabase.from("kesehatan_isu").delete().eq("id", r.id);
          if (error) throw error;
          setOkMsg("Isu berhasil dihapus.");
          await loadAll();
        } finally {
          setIsuBusyKey(null);
        }
      },
    });
  };

  // ===== STAT CRUD =====
  const addStat = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const bulanYm = `${y}-${m}`;
    setStats((p) => [
      {
        key: `new-${Date.now()}`,
        isNew: true,
        bulanYm,
        bulanDb: "",
        stunting: 0,
        hipertensi: 0,
        published: true,
      },
      ...p,
    ]);
  };

  const saveStat = async (r: UiStat) => {
    setStatBusyKey(r.key);
    setErr(null);
    setOkMsg(null);
    try {
      if (!r.bulanYm) throw new Error("Bulan wajib diisi.");

      const bulanNewDb = monthToDate(r.bulanYm);

      const payload = {
        bulan: bulanNewDb,
        stunting: Number(r.stunting ?? 0),
        hipertensi: Number(r.hipertensi ?? 0),
        published: !!r.published,
      };

      if (r.isNew) {
        const { error } = await supabase.from("kesehatan_stat_bulanan").insert(payload);
        if (error) throw error;
      } else {
        // update pakai key lama (bulanDb), supaya aman meski bulanYm diganti
        const keyOld = r.bulanDb || bulanNewDb;
        const { error } = await supabase
          .from("kesehatan_stat_bulanan")
          .update(payload)
          .eq("bulan", keyOld);
        if (error) throw error;
      }

      setOkMsg("Statistik berhasil disimpan.");
      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan statistik.");
    } finally {
      setStatBusyKey(null);
    }
  };

  const removeStat = (r: UiStat) => {
    if (r.isNew) {
      setStats((p) => p.filter((x) => x.key !== r.key));
      return;
    }
    openConfirm({
      title: "Hapus statistik?",
      message: `Data bulan ${r.bulanYm} akan dihapus.`,
      danger: true,
      onOk: async () => {
        setStatBusyKey(r.key);
        setErr(null);
        setOkMsg(null);
        try {
          const keyOld = r.bulanDb || monthToDate(r.bulanYm);
          const { error } = await supabase.from("kesehatan_stat_bulanan").delete().eq("bulan", keyOld);
          if (error) throw error;
          setOkMsg("Statistik berhasil dihapus.");
          await loadAll();
        } finally {
          setStatBusyKey(null);
        }
      },
    });
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
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        danger={confirm.danger}
        onClose={closeConfirm}
      />

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Kelola Kesehatan</div>
            <div className="mt-1 text-sm text-gray-600">
              Sumber data public: <span className="font-semibold">isu/stat/jadwal/kader/meta</span> (published-only).
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              to="/kesehatan"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Preview Public
            </NavLink>
            <NavLink
              to="/admin/kesehatan/jadwal"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Jadwal
            </NavLink>
            <NavLink
              to="/admin/kesehatan/kader"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Kader
            </NavLink>
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

      {/* META + LEAFLET */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Meta (Hero)</div>
              <div className="mt-1 text-xs text-gray-500">Dipakai untuk periode & sumber data.</div>
            </div>
            <button
              type="button"
              onClick={saveMeta}
              disabled={savingMeta}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                savingMeta ? "bg-gray-300" : "bg-gray-900 hover:bg-gray-800",
              )}
            >
              {savingMeta ? "Menyimpan…" : "Simpan Meta"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={meta.published}
                onChange={(e) => setMeta((p) => ({ ...p, published: e.target.checked }))}
              />
              Published
            </label>
            <div className="text-xs text-gray-600">
              Jika off, hero & statistik bisa dianggap “belum siap” oleh user page.
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-gray-600">Periode terakhir (YYYY-MM)</div>
              <input
                type="month"
                value={meta.periode_terakhir ?? ""}
                onChange={(e) => setMeta((p) => ({ ...p, periode_terakhir: e.target.value }))}
                className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600">Sumber</div>
              <input
                value={meta.sumber ?? ""}
                onChange={(e) => setMeta((p) => ({ ...p, sumber: e.target.value }))}
                className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                placeholder="Admin Desa Ngipak"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Leaflet (PDF)</div>
          <div className="mt-1 text-xs text-gray-500">
            Disimpan di Storage bucket <span className="font-semibold">leaflet</span> dengan path tetap{" "}
            <span className="font-semibold">{LEAFLET_PATH}</span>.
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-700">Link Public</div>
            <div className="mt-2 break-all text-sm text-gray-700">{leafletUrl || "(belum ada)"}</div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                {leafletBusy ? "Mengunggah…" : "Upload PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLeaflet(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <a
                href={leafletUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "rounded-2xl border border-gray-200 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50",
                  !leafletUrl && "pointer-events-none opacity-50",
                )}
              >
                Buka PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="rounded-3xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Statistik Bulanan</div>
            <div className="mt-1 text-xs text-gray-500">Dipakai untuk trend 6 bulan dan angka terbaru.</div>
          </div>
          <button
            type="button"
            onClick={addStat}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Tambah Bulan
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {stats.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-600">
              Belum ada data statistik. Tambahkan minimal 1 bulan lalu publish.
            </div>
          ) : (
            stats.map((r) => (
              <div key={r.key} className="px-6 py-4">
                <div className="grid gap-3 md:grid-cols-12">
                  <input
                    type="month"
                    value={r.bulanYm}
                    onChange={(e) =>
                      setStats((p) =>
                        p.map((x) => (x.key === r.key ? { ...x, bulanYm: e.target.value } : x)),
                      )
                    }
                    className="md:col-span-3 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                  />

                  <input
                    value={String(r.stunting)}
                    onChange={(e) =>
                      setStats((p) =>
                        p.map((x) =>
                          x.key === r.key ? { ...x, stunting: toNonNegInt(e.target.value) } : x,
                        ),
                      )
                    }
                    className="md:col-span-3 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                    placeholder="Stunting"
                  />

                  <input
                    value={String(r.hipertensi)}
                    onChange={(e) =>
                      setStats((p) =>
                        p.map((x) =>
                          x.key === r.key ? { ...x, hipertensi: toNonNegInt(e.target.value) } : x,
                        ),
                      )
                    }
                    className="md:col-span-3 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                    placeholder="Hipertensi"
                  />

                  <label className="md:col-span-3 flex h-11 items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm">
                    <span className="text-xs font-semibold text-gray-700">Published</span>
                    <input
                      type="checkbox"
                      checked={r.published}
                      onChange={(e) =>
                        setStats((p) =>
                          p.map((x) => (x.key === r.key ? { ...x, published: e.target.checked } : x)),
                        )
                      }
                    />
                  </label>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void saveStat(r)}
                    disabled={statBusyKey === r.key || !r.bulanYm}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                      statBusyKey === r.key || !r.bulanYm ? "bg-gray-300" : "bg-gray-900 hover:bg-gray-800",
                    )}
                  >
                    {statBusyKey === r.key ? "Menyimpan…" : "Simpan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeStat(r)}
                    disabled={statBusyKey === r.key}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {r.isNew ? "Batal" : "Hapus"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ISU */}
      <div className="rounded-3xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Isu Kesehatan</div>
            <div className="mt-1 text-xs text-gray-500">Public hanya menampilkan yang Published.</div>
          </div>
          <button
            type="button"
            onClick={addIsu}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Tambah Isu
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {isu.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-600">Belum ada isu.</div>
          ) : (
            isu.map((r) => (
              <div key={r.key} className="px-6 py-4">
                <div className="grid gap-3 md:grid-cols-12">
                  <input
                    value={r.judul}
                    onChange={(e) =>
                      setIsu((p) => p.map((x) => (x.key === r.key ? { ...x, judul: e.target.value } : x)))
                    }
                    className="md:col-span-4 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                    placeholder="Judul"
                  />

                  <select
                    value={r.prioritas}
                    onChange={(e) =>
                      setIsu((p) =>
                        p.map((x) =>
                          x.key === r.key ? { ...x, prioritas: normalizePrioritas(e.target.value) } : x,
                        ),
                      )
                    }
                    className="md:col-span-2 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                  >
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>

                  <input
                    value={String(r.urutan)}
                    onChange={(e) =>
                      setIsu((p) =>
                        p.map((x) => (x.key === r.key ? { ...x, urutan: toNonNegInt(e.target.value) } : x)),
                      )
                    }
                    className="md:col-span-2 h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                    placeholder="Urutan"
                  />

                  <label className="md:col-span-4 flex h-11 items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm">
                    <span className="text-xs font-semibold text-gray-700">Published</span>
                    <input
                      type="checkbox"
                      checked={r.published}
                      onChange={(e) =>
                        setIsu((p) => p.map((x) => (x.key === r.key ? { ...x, published: e.target.checked } : x)))
                      }
                    />
                  </label>

                  <textarea
                    value={r.ringkas}
                    onChange={(e) =>
                      setIsu((p) => p.map((x) => (x.key === r.key ? { ...x, ringkas: e.target.value } : x)))
                    }
                    className="md:col-span-6 min-h-[90px] rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    placeholder="Ringkasan (opsional)"
                  />

                  <textarea
                    value={r.saranText}
                    onChange={(e) =>
                      setIsu((p) => p.map((x) => (x.key === r.key ? { ...x, saranText: e.target.value } : x)))
                    }
                    className="md:col-span-6 min-h-[90px] rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    placeholder="Saran (1 baris = 1 poin)"
                  />
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void saveIsu(r)}
                    disabled={isuBusyKey === r.key || !r.judul.trim()}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                      isuBusyKey === r.key || !r.judul.trim()
                        ? "bg-gray-300"
                        : "bg-gray-900 hover:bg-gray-800",
                    )}
                  >
                    {isuBusyKey === r.key ? "Menyimpan…" : "Simpan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeIsu(r)}
                    disabled={isuBusyKey === r.key}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {r.isNew ? "Batal" : "Hapus"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}