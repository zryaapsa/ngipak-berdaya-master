import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import {
  adminGetUmkm,
  adminListProdukByUmkmId,
  adminToggleProdukPublished,
  adminUpsertProduk,
  type AdminProdukRow,
  type AdminProdukUpsertInput,
} from "../../../features/umkm/api.admin";

import { uploadProdukImage } from "../../../features/storage/api";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatIDR(n: number) {
  const s = String(Math.max(0, Math.trunc(n)));
  return "Rp " + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function toNonNegInt(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function normalizeText(v: string | null | undefined) {
  return (v ?? "").trim();
}

function normalizeNullableText(v: string | null | undefined) {
  const t = normalizeText(v);
  return t ? t : null;
}

export default function AdminUmkmProdukPage() {
  const { id } = useParams();
  const umkmId = String(id ?? "");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  const [umkmName, setUmkmName] = useState<string>("");
  const [items, setItems] = useState<AdminProdukRow[]>([]);

  const [selectedId, setSelectedId] = useState<string>(""); // edit mode if not empty
  const mode: "new" | "edit" = selectedId ? "edit" : "new";

  const [form, setForm] = useState<AdminProdukUpsertInput>({
    id: "",
    umkm_id: umkmId,
    nama: "",
    harga: 0,
    satuan: "",
    foto_url: "",
    deskripsi: "",
    published: true,
  });

  const setField = <K extends keyof AdminProdukUpsertInput>(k: K, v: AdminProdukUpsertInput[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const resetForm = () => {
    setSelectedId("");
    setForm({
      id: "",
      umkm_id: umkmId,
      nama: "",
      harga: 0,
      satuan: "",
      foto_url: "",
      deskripsi: "",
      published: true,
    });
  };

  const stats = useMemo(() => {
    const total = items.length;
    const pub = items.filter((x) => x.published).length;
    const draft = total - pub;
    return { total, pub, draft };
  }, [items]);

  const load = async () => {
    if (!umkmId) return;
    setErr(null);
    setLoading(true);
    try {
      const u = await adminGetUmkm(umkmId);
      if (!u) {
        setUmkmName("");
        setItems([]);
        setErr("UMKM tidak ditemukan.");
        return;
      }
      setUmkmName(u.nama);

      const p = await adminListProdukByUmkmId(umkmId);
      setItems(p);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [umkmId]);

  const onEdit = (p: AdminProdukRow) => {
    setErr(null);
    setSelectedId(p.id);
    setForm({
      id: p.id,
      umkm_id: umkmId,
      nama: p.nama,
      harga: p.harga,
      satuan: p.satuan ?? "",
      foto_url: p.foto_url,
      deskripsi: p.deskripsi ?? "",
      published: p.published,
    });
  };

  const onTogglePublished = async (pid: string, next: boolean) => {
    setErr(null);
    setItems((prev) => prev.map((x) => (x.id === pid ? { ...x, published: next } : x)));
    try {
      await adminToggleProdukPublished(pid, next);
    } catch (e: unknown) {
      setItems((prev) => prev.map((x) => (x.id === pid ? { ...x, published: !next } : x)));
      setErr(e instanceof Error ? e.message : "Gagal mengubah status publish.");
    }
  };

  const isValid = useMemo(() => {
    const namaOk = normalizeText(form.nama).length >= 2;
    const fotoOk = normalizeText(form.foto_url).length >= 8;
    const hargaOk = Number.isFinite(form.harga) && form.harga >= 0;
    const idOk = mode === "edit" ? normalizeText(form.id).length > 0 : true;
    return umkmId.length > 0 && namaOk && fotoOk && hargaOk && idOk && !uploading;
  }, [form, umkmId, mode, uploading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const nama = normalizeText(form.nama);
    const foto = normalizeText(form.foto_url);
    const satuan = normalizeNullableText(form.satuan ?? "");
    const deskripsi = normalizeNullableText(form.deskripsi ?? "");

    const finalId =
      mode === "edit"
        ? normalizeText(form.id)
        : normalizeText(form.id)
          ? slugify(form.id)
          : `${slugify(nama)}-${Date.now()}`;

    if (!finalId) {
      setErr("ID produk tidak valid.");
      return;
    }

    setSaving(true);
    try {
      await adminUpsertProduk({
        id: finalId,
        umkm_id: umkmId,
        nama,
        harga: Math.max(0, Math.trunc(form.harga)),
        satuan,
        foto_url: foto,
        deskripsi,
        published: !!form.published,
      });

      await load();
      resetForm();
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  };

  const triggerPickFile = () => fileRef.current?.click();

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const res = await uploadProdukImage({
        file,
        umkmId,
        produkIdHint: normalizeText(form.id) || normalizeText(form.nama),
      });
      setField("foto_url", res.publicUrl);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const file = ev.dataTransfer.files?.[0] ?? null;
    await onPickFile(file);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
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
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <NavLink to="/admin/umkm" className="hover:text-gray-700">
                UMKM
              </NavLink>
              <span>•</span>
              <span className="truncate">{umkmName || umkmId}</span>
              <span>•</span>
              <span className="font-semibold text-gray-700">Produk</span>
            </div>

            <div className="mt-2 text-xl font-semibold text-gray-900">Kelola Produk</div>
            <div className="mt-1 text-sm text-gray-600">
              Total: <span className="font-semibold">{stats.total}</span> • Published:{" "}
              <span className="font-semibold">{stats.pub}</span> • Draft:{" "}
              <span className="font-semibold">{stats.draft}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/admin/umkm"
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </NavLink>
            <NavLink
              to={`/umkm/${encodeURIComponent(umkmId)}`}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Preview Public
            </NavLink>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        {/* List */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="text-sm font-semibold text-gray-900">Daftar Produk</div>
            <div className="mt-1 text-xs text-gray-500">
              Produk tampil di halaman public hanya jika produk & UMKM sama-sama published.
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm font-semibold text-gray-900">Belum ada produk</div>
                <div className="mt-1 text-sm text-gray-600">
                  Tambahkan produk pertama dari panel kanan.
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-600">
                    <th className="px-6 py-3">Produk</th>
                    <th className="px-6 py-3">Harga</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((p) => (
                    <tr key={p.id} className="text-sm text-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={p.foto_url}
                            alt={p.nama}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-gray-900">{p.nama}</div>
                            <div className="mt-0.5 truncate font-mono text-xs text-gray-500">
                              {p.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatIDR(p.harga)}
                          {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => onTogglePublished(p.id, !p.published)}
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                            p.published
                              ? "bg-green-50 text-green-700 ring-green-200 hover:bg-green-100"
                              : "bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100"
                          )}
                          title="Klik untuk ubah status publish"
                        >
                          {p.published ? "Published" : "Draft"}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Editor */}
        <form onSubmit={onSubmit} className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {mode === "new" ? "Tambah Produk" : "Edit Produk"}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Upload foto → URL otomatis terisi → simpan.
              </div>
            </div>

            {mode === "edit" ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-600">ID Produk (opsional)</div>
              <input
                value={form.id}
                onChange={(e) => setField("id", e.target.value)}
                disabled={mode === "edit"}
                placeholder="kosongkan untuk auto"
                className={cn(
                  "mt-2 h-11 w-full rounded-2xl border px-3 text-sm",
                  mode === "edit"
                    ? "border-gray-200 bg-gray-100 text-gray-600"
                    : "border-gray-200 bg-gray-50"
                )}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600">Nama Produk</div>
              <input
                value={form.nama}
                onChange={(e) => setField("nama", e.target.value)}
                placeholder="Keripik Mlinjo"
                className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600">Harga</div>
                <input
                  value={String(form.harga)}
                  onChange={(e) => setField("harga", toNonNegInt(e.target.value))}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600">Satuan</div>
                <input
                  value={form.satuan ?? ""}
                  onChange={(e) => setField("satuan", e.target.value)}
                  placeholder="pack / pcs"
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
                />
              </div>
            </div>

            {/* Upload */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700">Foto Produk</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    Upload ke Supabase Storage bucket <span className="font-semibold">produk</span>.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={triggerPickFile}
                    disabled={uploading}
                    className={cn(
                      "rounded-xl px-3 py-2 text-xs font-semibold",
                      uploading
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    )}
                  >
                    {uploading ? "Uploading…" : "Choose File"}
                  </button>
                </div>
              </div>

              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={cn(
                  "mt-3 rounded-2xl border border-dashed p-4 text-center text-xs",
                  uploading
                    ? "border-gray-300 bg-white text-gray-500"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                Drag & drop gambar ke sini (jpg/png/webp). Maks 5MB.
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-600">Foto URL</div>
                <input
                  value={form.foto_url}
                  onChange={(e) => setField("foto_url", e.target.value)}
                  placeholder="akan terisi otomatis setelah upload"
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm"
                  disabled={uploading}
                />
              </div>

              {normalizeText(form.foto_url) ? (
                <img
                  src={normalizeText(form.foto_url)}
                  alt="preview"
                  className="mt-3 h-36 w-full rounded-2xl object-cover ring-1 ring-gray-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600">Deskripsi</div>
              <textarea
                value={form.deskripsi ?? ""}
                onChange={(e) => setField("deskripsi", e.target.value)}
                className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={(e) => setField("published", e.target.checked)}
              />
              <span>Published</span>
            </label>

            <button
              type="submit"
              disabled={!isValid || saving}
              className={cn(
                "mt-2 h-11 w-full rounded-2xl text-sm font-semibold text-white",
                !isValid || saving ? "bg-gray-300" : "bg-gray-900 hover:bg-gray-800"
              )}
            >
              {saving ? "Menyimpan…" : "Simpan Produk"}
            </button>

            <div className="text-xs text-gray-500">
              Catatan: jika upload gagal, penyebab paling umum adalah policy INSERT storage belum benar
              atau kamu belum login admin.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
