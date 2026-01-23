import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import type { Dusun, UmkmKategori } from "../../../features/umkm/types";
import {
  adminGetUmkm,
  adminListDusun,
  adminUpsertUmkm,
  type AdminUmkmUpsertInput,
} from "../../../features/umkm/api.admin";

type Payment = "cash" | "transfer" | "qris";
type Service = "ambil" | "antar" | "cod";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function normalizeId(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeNullableText(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t ? t : null;
}

function normalizeNullableArray<T>(xs: T[] | null | undefined): T[] | null {
  return xs && xs.length ? xs : null;
}

export default function AdminUmkmFormPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const mode: "new" | "edit" = id ? "edit" : "new";

  const [dusun, setDusun] = useState<Dusun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<AdminUmkmUpsertInput>({
    id: "",
    nama: "",
    kategori: "makanan",
    no_wa: "",
    dusun_id: "",
    alamat: "",
    tentang: "",
    jam_buka: "",
    maps_url: "",
    pembayaran: [],
    layanan: [],
    galeri_foto: [],
    produk_unggulan_ids: [],
    estimasi: "",
    published: false,
  });

  const title = mode === "new" ? "Tambah UMKM" : "Edit UMKM";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const d = await adminListDusun();
        if (!alive) return;
        setDusun(d);

        if (mode === "new") {
          setForm((prev) => ({
            ...prev,
            dusun_id: prev.dusun_id || (d[0]?.id ?? ""),
          }));
          return;
        }

        if (!id) return;

        const u = await adminGetUmkm(id);
        if (!alive) return;

        if (!u) {
          setErr("UMKM tidak ditemukan.");
          return;
        }

        setForm({
          id: u.id,
          nama: u.nama,
          kategori: u.kategori,
          no_wa: u.no_wa,
          dusun_id: u.dusun?.id ?? "",
          alamat: u.alamat ?? "",
          tentang: u.tentang ?? "",
          jam_buka: u.jam_buka ?? "",
          maps_url: u.maps_url ?? "",
          pembayaran: (u.pembayaran ?? []) as Payment[],
          layanan: (u.layanan ?? []) as Service[],
          galeri_foto: u.galeri_foto ?? [],
          produk_unggulan_ids: u.produk_unggulan_ids ?? [],
          estimasi: u.estimasi ?? "",
          published: u.published ?? false,
        });
      } catch (e: unknown) {
        let msg = "Gagal memuat data.";
        if (e instanceof Error) msg = e.message;
        setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, mode]);

  const isValid = useMemo(() => {
    return (
      form.id.trim().length >= 2 &&
      form.nama.trim().length >= 2 &&
      !!form.dusun_id &&
      !!form.kategori &&
      form.no_wa.trim().length >= 6
    );
  }, [form]);

  const setField = <K extends keyof AdminUmkmUpsertInput>(k: K, v: AdminUmkmUpsertInput[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const togglePayment = (value: Payment) => {
    setForm((prev) => {
      const curr = (prev.pembayaran ?? []) as Payment[];
      const next = curr.includes(value) ? curr.filter((x) => x !== value) : [...curr, value];
      return { ...prev, pembayaran: next };
    });
  };

  const toggleService = (value: Service) => {
    setForm((prev) => {
      const curr = (prev.layanan ?? []) as Service[];
      const next = curr.includes(value) ? curr.filter((x) => x !== value) : [...curr, value];
      return { ...prev, layanan: next };
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);

    const nextId = normalizeId(form.id);
    if (!nextId) {
      setErr("ID UMKM tidak valid.");
      return;
    }
    if (!form.dusun_id) {
      setErr("Dusun wajib dipilih.");
      return;
    }

    const payload: AdminUmkmUpsertInput = {
      ...form,
      id: nextId,
      nama: form.nama.trim(),
      no_wa: form.no_wa.trim(),

      alamat: normalizeNullableText(form.alamat),
      tentang: normalizeNullableText(form.tentang),
      jam_buka: normalizeNullableText(form.jam_buka),
      maps_url: normalizeNullableText(form.maps_url),
      estimasi: normalizeNullableText(form.estimasi),

      pembayaran: normalizeNullableArray(form.pembayaran as Payment[]),
      layanan: normalizeNullableArray(form.layanan as Service[]),
      galeri_foto: normalizeNullableArray(form.galeri_foto ?? []),
      produk_unggulan_ids: normalizeNullableArray(form.produk_unggulan_ids ?? []),
    };

    setSaving(true);
    try {
      await adminUpsertUmkm(payload);
      nav("/admin/umkm", { replace: true });
    } catch (e: unknown) {
      let msg = "Gagal menyimpan UMKM.";
      if (e instanceof Error) msg = e.message;
      setErr(msg);
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-sm text-gray-600">
              Isi data inti terlebih dahulu. Field lanjutan bisa menyusul.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/admin/umkm"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </NavLink>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-gray-600">ID (unik)</div>
            <input
              value={form.id}
              onChange={(e) => setField("id", e.target.value)}
              disabled={mode === "edit"}
              placeholder="contoh: umkm-sari-mlinjo"
              className={cn(
                "mt-2 h-11 w-full rounded-2xl border px-3 text-sm",
                mode === "edit"
                  ? "border-gray-200 bg-gray-100 text-gray-600"
                  : "border-gray-200 bg-gray-50"
              )}
            />
            <div className="mt-1 text-xs text-gray-500">
              Disarankan slug: huruf kecil, angka, dan tanda minus.
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Nama UMKM</div>
            <input
              value={form.nama}
              onChange={(e) => setField("nama", e.target.value)}
              placeholder="Nama usaha"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Kategori</div>
            <select
              value={form.kategori}
              onChange={(e) => setField("kategori", e.target.value as UmkmKategori)}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            >
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
              <option value="jasa">Jasa</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Dusun</div>
            <select
              value={form.dusun_id}
              onChange={(e) => setField("dusun_id", e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            >
              <option value="" disabled>
                Pilih dusun…
              </option>
              {dusun.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">No. WhatsApp</div>
            <input
              value={form.no_wa}
              onChange={(e) => setField("no_wa", e.target.value)}
              placeholder="62812xxxxxxx"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Alamat</div>
            <input
              value={form.alamat ?? ""}
              onChange={(e) => setField("alamat", e.target.value)}
              placeholder="Alamat singkat"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Tentang UMKM</div>
            <textarea
              value={form.tentang ?? ""}
              onChange={(e) => setField("tentang", e.target.value)}
              placeholder="Deskripsi singkat usaha"
              className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Jam Buka</div>
            <input
              value={form.jam_buka ?? ""}
              onChange={(e) => setField("jam_buka", e.target.value)}
              placeholder="Contoh: 08:00-16:00"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Maps URL</div>
            <input
              value={form.maps_url ?? ""}
              onChange={(e) => setField("maps_url", e.target.value)}
              placeholder="https://maps.app.goo.gl/…"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>

          <div className="lg:col-span-2 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-700">Pembayaran</div>
              <div className="mt-3 space-y-2 text-sm">
                {(["cash", "transfer", "qris"] as const).map((x) => (
                  <label key={x} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={((form.pembayaran ?? []) as Payment[]).includes(x)}
                      onChange={() => togglePayment(x)}
                    />
                    <span className="capitalize">{x}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-700">Layanan</div>
              <div className="mt-3 space-y-2 text-sm">
                {(["ambil", "antar", "cod"] as const).map((x) => (
                  <label key={x} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={((form.layanan ?? []) as Service[]).includes(x)}
                      onChange={() => toggleService(x)}
                    />
                    <span className="uppercase">{x}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-700">Status</div>
              <div className="mt-3 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.published}
                    onChange={(e) => setField("published", e.target.checked)}
                  />
                  <span>Published</span>
                </label>
                <div className="text-xs text-gray-500">
                  Jika tidak publish, UMKM tidak tampil di halaman public.
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Estimasi (opsional)</div>
            <input
              value={form.estimasi ?? ""}
              onChange={(e) => setField("estimasi", e.target.value)}
              placeholder="Contoh: 30-45 menit"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Field galeri/unggulan produk bisa ditambahkan setelah modul produk selesai.
          </div>

          <button
            type="submit"
            disabled={!isValid || saving}
            className={cn(
              "h-11 rounded-2xl px-5 text-sm font-semibold text-white",
              !isValid || saving ? "bg-gray-300" : "bg-gray-900 hover:bg-gray-800"
            )}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
