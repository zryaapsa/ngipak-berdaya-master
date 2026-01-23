import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import type { Dusun, UmkmKategori } from "../../../features/umkm/types";
import type { AdminUmkmRow } from "../../../features/umkm/api.admin";
import { adminListDusun, adminListUmkm, adminToggleUmkmPublished } from "../../../features/umkm/api.admin";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "gray" | "blue" }) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-gray-50 text-gray-600 ring-gray-200";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1", cls)}>{children}</span>;
}

export default function AdminUmkmListPage() {
  const [items, setItems] = useState<AdminUmkmRow[]>([]);
  const [dusun, setDusun] = useState<Dusun[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [dusunId, setDusunId] = useState<string>("all");
  const [kategori, setKategori] = useState<UmkmKategori | "all">("all");
  const [published, setPublished] = useState<"all" | "published" | "draft">("all");

  const [err, setErr] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ q, dusunId, kategori, published }),
    [q, dusunId, kategori, published]
  );

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [d, u] = await Promise.all([adminListDusun(), adminListUmkm(filters)]);
      setDusun(d);
      setItems(u);
    } catch (e: unknown) {
      let msg = "Gagal memuat data UMKM.";
      if (e instanceof Error) msg = e.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dusunId, kategori, published]);

  const totalPublished = useMemo(() => items.filter((x) => x.published).length, [items]);

  const onToggle = async (id: string, next: boolean) => {
    // optimistic update
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, published: next } : x)));
    try {
      await adminToggleUmkmPublished(id, next);
    } catch (e: unknown) {
      // rollback
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, published: !next } : x)));
      let msg = "Gagal mengubah status publish.";
      if (e instanceof Error) msg = e.message;
      setErr(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900">Kelola UMKM</div>
            <div className="mt-1 text-sm text-gray-600">
              Manajemen data UMKM (admin-only). Total: <span className="font-semibold">{items.length}</span> • Publish:{" "}
              <span className="font-semibold">{totalPublished}</span>
            </div>
          </div>

          <NavLink
            to="/admin/umkm/new"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Tambah UMKM
          </NavLink>
        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Cari</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / WA / alamat…"
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Dusun</div>
            <select
              value={dusunId}
              onChange={(e) => setDusunId(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
            >
              <option value="all">Semua</option>
              {dusun.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-600">Kategori</div>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as UmkmKategori | "all")}
                className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              >
                <option value="all">Semua</option>
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
                <option value="jasa">Jasa</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600">Status</div>
              <select
                value={published}
                onChange={(e) => setPublished(e.target.value as "all" | "published" | "draft")}
                className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm"
              >
                <option value="all">Semua</option>
                <option value="published">Publish</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="text-sm font-semibold text-gray-900">Daftar UMKM</div>
          <div className="mt-1 text-xs text-gray-500">
            Klik status untuk publish/unpublish. Edit untuk mengubah detail.
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-600">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">Belum ada data UMKM sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600">
                  <th className="px-6 py-3">UMKM</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Dusun</th>
                  <th className="px-6 py-3">WA</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map((x) => (
                  <tr key={x.id} className="text-sm text-gray-800">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{x.nama}</div>
                      {x.alamat ? <div className="mt-0.5 text-xs text-gray-500">{x.alamat}</div> : null}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone="blue">{x.kategori}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{x.dusun?.nama ?? "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-700">{x.no_wa}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onToggle(x.id, !x.published)}
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                          x.published
                            ? "bg-green-50 text-green-700 ring-green-200 hover:bg-green-100"
                            : "bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100"
                        )}
                        title="Klik untuk ubah status publish"
                      >
                        {x.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <NavLink
                          to={`/admin/umkm/${encodeURIComponent(x.id)}/edit`}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </NavLink>
                        <NavLink
                          to={`/admin/umkm/${encodeURIComponent(x.id)}/produk`}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Produk
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
