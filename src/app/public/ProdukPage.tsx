import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { listDusun, listProduk } from "../../features/umkm/api";
import type {
  Dusun,
  Produk,
  UmkmInfo,
  UmkmKategori,
} from "../../features/umkm/types";

import { formatRupiah } from "../../lib/format";
import { getShopStatus } from "../../lib/status";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import Carousel from "../../components/ui/Carousel";
import SectionHeader from "../../components/ui/SectionHeader";
import StatTile from "../../components/ui/StatTile";

type KategoriOrAll = UmkmKategori | "all";
type ViewMode = "list" | "grid";

const kategoriUI: { value: KategoriOrAll; label: string }[] = [
  { value: "all", label: "Semua Kategori" },
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
  { value: "jasa", label: "Jasa" },
];

function isKategori(v: string): v is UmkmKategori {
  return v === "makanan" || v === "minuman" || v === "jasa";
}

function groupByUmkm(items: Produk[]) {
  const map = new Map<string, { umkm: UmkmInfo; produk: Produk[] }>();
  for (const p of items) {
    const key = p.umkm.id;
    const prev = map.get(key);
    if (!prev) map.set(key, { umkm: p.umkm, produk: [p] });
    else prev.produk.push(p);
  }
  return [...map.values()];
}

function pickGallery(umkm: UmkmInfo, produk: Produk[]) {
  const g = (umkm.galeri_foto ?? []).slice(0, 3);
  if (g.length) return g;
  return produk.map((p) => p.foto_url).slice(0, 3);
}

function pickUnggulan(umkm: UmkmInfo, produk: Produk[]) {
  const ids = (umkm.produk_unggulan_ids ?? []).filter(Boolean);
  if (ids.length) {
    const picked = produk.filter((p) => ids.includes(p.id)).slice(0, 2);
    if (picked.length) return picked;
  }
  return produk.slice(0, 2);
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand";
}) {
  const cls =
    tone === "brand"
      ? "border-white/20 bg-white/10 text-white"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function kategoriLabel(k: KategoriOrAll) {
  return kategoriUI.find((x) => x.value === k)?.label ?? String(k);
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-100";
  const on = "bg-brand-50 text-brand-900 ring-1 ring-brand-100";
  const off = "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50";

  return (
    <div className="inline-flex rounded-2xl bg-white p-1 ring-1 ring-gray-200">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={[base, value === "list" ? on : off].join(" ")}
        aria-pressed={value === "list"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 6h13M8 12h13M8 18h13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 6h.01M3 12h.01M3 18h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        List
      </button>

      <button
        type="button"
        onClick={() => onChange("grid")}
        className={[base, value === "grid" ? on : off].join(" ")}
        aria-pressed={value === "grid"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Grid
      </button>
    </div>
  );
}

export default function ProdukPage() {
  const [dusunId, setDusunId] = useState<string>("all");
  const [kategori, setKategori] = useState<KategoriOrAll>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const [dusunList, setDusunList] = useState<Dusun[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [d, p] = await Promise.all([listDusun(), listProduk()]);
        if (!alive) return;
        setDusunList(d);
        setProdukList(p);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dusunOptions = useMemo(
    () => [
      { value: "all", label: "Semua Dusun" },
      ...dusunList.map((d) => ({ value: d.id, label: d.nama })),
    ],
    [dusunList],
  );

  const filteredProduk = useMemo(() => {
    const query = q.trim().toLowerCase();
    return produkList.filter((p) => {
      const okDusun = dusunId === "all" ? true : p.umkm.dusun.id === dusunId;
      const okKat = kategori === "all" ? true : p.umkm.kategori === kategori;

      const hay =
        `${p.nama} ${p.umkm.nama} ${p.umkm.dusun.nama} ${p.deskripsi ?? ""}`.toLowerCase();
      const okQ = query === "" ? true : hay.includes(query);

      return okDusun && okKat && okQ;
    });
  }, [dusunId, kategori, q, produkList]);

  const umkmAll = useMemo(() => groupByUmkm(filteredProduk), [filteredProduk]);
  const umkmShown = useMemo(
    () => umkmAll.slice(0, visibleCount),
    [umkmAll, visibleCount],
  );

  useEffect(() => setVisibleCount(PAGE_SIZE), [dusunId, kategori, q]);

  const reset = () => {
    setDusunId("all");
    setKategori("all");
    setQ("");
    setVisibleCount(PAGE_SIZE);
  };

  const onKategoriChange = (v: string) => {
    if (v === "all") return setKategori("all");
    if (isKategori(v)) return setKategori(v);
    return setKategori("all");
  };

  const totalProduk = produkList.length;
  const totalUmkm = useMemo(() => groupByUmkm(produkList).length, [produkList]);

  const activeDusunLabel =
    dusunOptions.find((x) => x.value === dusunId)?.label ?? "Semua Dusun";

  const showActive =
    dusunId !== "all" || kategori !== "all" || q.trim().length > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <div className="h-5 w-56 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-100" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <div className="h-5 w-40 rounded bg-gray-100" />
          <div className="mt-6 h-14 rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO (clean) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              UMKM Desa Ngipak
            </h1>
            <p className="mt-2 text-white/80">
              Cari UMKM dan produk, lalu pesan langsung via WhatsApp.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="brand">Langsung ke penjual</Pill>
              <Pill tone="brand">Mudah diakses</Pill>
              <Pill tone="brand">WA & QR</Pill>
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total UMKM" value={totalUmkm} />
          <StatTile label="Total Produk" value={totalProduk} />
          <StatTile label="Dusun" value={dusunList.length} />
          <StatTile label="UMKM Terfilter" value={umkmAll.length} />
        </div>
      </div>

      {/* FILTER + TOGGLE (seperti lampiran ke-2) */}
      <Card className="p-5">
        <SectionHeader
          title="Cari UMKM"
          desc="Gunakan filter untuk mempercepat pencarian."
          right={
            <div className="flex items-center gap-3">
              <Badge variant="neutral">{umkmAll.length} UMKM</Badge>
              <ViewToggle value={view} onChange={setView} />
            </div>
          }
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Dusun"
            value={dusunId}
            options={dusunOptions}
            onChange={setDusunId}
          />
          <FilterSelect
            label="Kategori"
            value={kategori}
            options={kategoriUI}
            onChange={onKategoriChange}
          />
          <SearchInput
            label=""
            placeholder="Cari UMKM / produk..."
            value={q}
            onChange={setQ}
          />
        </div>

        {showActive ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">
              Filter aktif:
            </span>
            {dusunId !== "all" ? <Pill>Dusun: {activeDusunLabel}</Pill> : null}
            {kategori !== "all" ? (
              <Pill>Kategori: {kategoriLabel(kategori)}</Pill>
            ) : null}
            {q.trim() ? <Pill>Cari: “{q.trim()}”</Pill> : null}

            <button
              type="button"
              onClick={reset}
              className="ml-auto rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              Clear all
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
            <Pill>Tips: ketik kata “keripik”</Pill>
            <Pill>Gunakan dusun untuk warga lokal</Pill>
          </div>
        )}
      </Card>

      {/* LIST / GRID */}
      {view === "list" ? (
        <div className="space-y-4">
          {umkmShown.map(({ umkm, produk }) => {
            const gallery = pickGallery(umkm, produk);
            const unggulan = pickUnggulan(umkm, produk);
            const st = getShopStatus(umkm.jam_buka);

            const statusCls =
              st.color === "green"
                ? "bg-green-600"
                : st.color === "red"
                  ? "bg-red-600"
                  : "bg-gray-700";

            return (
              <Card key={umkm.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-[340px_1fr]">
                  <div className="relative h-60 bg-gray-100 lg:h-full">
                    <Carousel
                      images={gallery}
                      alt={umkm.nama}
                      className="h-full w-full"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                        {umkm.kategori.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-brand-800 px-2.5 py-1 text-xs font-medium text-white shadow-soft">
                        {umkm.dusun.nama}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold text-white",
                          statusCls,
                        ].join(" ")}
                      >
                        {st.label}
                      </span>
                      {umkm.estimasi ? (
                        <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          ⏱ {umkm.estimasi}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {umkm.nama}
                        </h2>
                        <div className="mt-1 text-sm text-gray-600">
                          {umkm.alamat ??
                            `Dusun ${umkm.dusun.nama}, Gunungkidul`}
                        </div>

                        <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                          {umkm.tentang ?? "Deskripsi belum tersedia."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          {umkm.layanan?.includes("cod") ? (
                            <Pill>COD</Pill>
                          ) : null}
                          {umkm.layanan?.includes("antar") ? (
                            <Pill>Antar</Pill>
                          ) : null}
                          {umkm.layanan?.includes("ambil") ? (
                            <Pill>Ambil</Pill>
                          ) : null}
                          {umkm.pembayaran?.length ? (
                            <Pill>Bayar: {umkm.pembayaran.join(", ")}</Pill>
                          ) : null}
                          {umkm.jam_buka ? (
                            <Pill>🕒 {umkm.jam_buka}</Pill>
                          ) : null}
                        </div>

                        <div className="mt-5">
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Produk unggulan
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {unggulan.map((p) => (
                              <div
                                key={p.id}
                                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                              >
                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                  {p.nama}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-brand-900">
                                  {formatRupiah(p.harga)}
                                  {p.satuan ? (
                                    <span className="text-gray-500">
                                      {" "}
                                      / {p.satuan}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <Link to={`/umkm/${umkm.id}`}>
                          <Button className="w-full sm:w-auto">
                            Lihat & Pesan
                          </Button>
                        </Link>
                        <div className="mt-2 text-xs text-gray-500">
                          Detail UMKM • WA & QR
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {umkmShown.map(({ umkm, produk }) => {
            const gallery = pickGallery(umkm, produk);
            const unggulan = pickUnggulan(umkm, produk);
            const st = getShopStatus(umkm.jam_buka);

            const statusCls =
              st.color === "green"
                ? "bg-green-600"
                : st.color === "red"
                  ? "bg-red-600"
                  : "bg-gray-700";

            return (
              <Card key={umkm.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {/* grid: tetap pakai carousel biar konsisten dengan list */}
                  <Carousel
                    images={gallery}
                    alt={umkm.nama}
                    className="h-full w-full"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  <div className="absolute left-2 top-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                      {umkm.kategori.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-brand-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-soft">
                      {umkm.dusun.nama}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
                        statusCls,
                      ].join(" ")}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {umkm.nama}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 line-clamp-1">
                    {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
                  </div>

                  <div className="mt-3 grid gap-2">
                    {unggulan.slice(0, 1).map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"
                      >
                        <div className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {p.nama}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-brand-900">
                          {formatRupiah(p.harga)}
                          {p.satuan ? (
                            <span className="text-gray-500"> / {p.satuan}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Link to={`/umkm/${umkm.id}`}>
                      <Button className="h-11 w-full">Pesan</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* empty state */}
      {umkmAll.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-lg font-semibold text-gray-900">
            Tidak ada hasil
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Coba ubah filter/kata kunci atau reset.
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>
        </Card>
      ) : null}

      {/* load more */}
      {umkmAll.length > umkmShown.length ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          >
            Tampilkan lebih banyak
          </Button>
        </div>
      ) : null}
    </div>
  );
}
