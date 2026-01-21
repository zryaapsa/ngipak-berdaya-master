import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { listDusun, listProduk } from "../../features/umkm/api";
import type { Dusun, Produk, UmkmInfo, UmkmKategori } from "../../features/umkm/types";

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
type ViewMode = "grid" | "list";

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
      ? "border-brand-100 bg-brand-50 text-brand-900"
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

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const base =
    "h-10 rounded-xl px-3 text-sm font-semibold ring-1 ring-inset transition focus:outline-none focus:ring-2 focus:ring-brand-100";
  return (
    <div className="inline-flex rounded-2xl bg-gray-50 p-1 ring-1 ring-gray-200">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={[
          base,
          value === "grid"
            ? "bg-white text-gray-900 ring-gray-200 shadow-sm"
            : "bg-transparent text-gray-600 ring-transparent hover:text-gray-900",
        ].join(" ")}
        aria-pressed={value === "grid"}
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={[
          base,
          value === "list"
            ? "bg-white text-gray-900 ring-gray-200 shadow-sm"
            : "bg-transparent text-gray-600 ring-transparent hover:text-gray-900",
        ].join(" ")}
        aria-pressed={value === "list"}
      >
        List
      </button>
    </div>
  );
}

function StatusChip({ label, color }: { label: string; color: "green" | "red" | "gray" }) {
  const cls =
    color === "green"
      ? "bg-green-600"
      : color === "red"
        ? "bg-red-600"
        : "bg-gray-700";
  return (
    <span className={["rounded-full px-2.5 py-1 text-xs font-semibold text-white", cls].join(" ")}>
      {label}
    </span>
  );
}

/** CARD: GRID (2 kolom di HP) */
function UmkmCardGrid({
  umkm,
  produk,
}: {
  umkm: UmkmInfo;
  produk: Produk[];
}) {
  const gallery = pickGallery(umkm, produk);
  const unggulan = pickUnggulan(umkm, produk);
  const st = getShopStatus(umkm.jam_buka);

  return (
    <Link to={`/umkm/${umkm.id}`} className="group">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft transition group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_35px_rgba(2,6,23,0.12)]">
        {/* media */}
        <div className="relative aspect-[4/3] bg-gray-100">
          <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
              {umkm.kategori.toUpperCase()}
            </span>
            <span className="rounded-full bg-brand-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-soft">
              {umkm.dusun.nama}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
            <StatusChip label={st.label} color={st.color} />
            {umkm.estimasi ? (
              <span className="rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                ⏱ {umkm.estimasi}
              </span>
            ) : null}
          </div>
        </div>

        {/* body */}
        <div className="p-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-gray-900 line-clamp-1">{umkm.nama}</div>
            <div className="mt-1 text-sm text-gray-600 line-clamp-1">
              {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
            </div>
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">
              {umkm.tentang ?? "Deskripsi belum tersedia."}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {umkm.layanan?.includes("cod") ? <Pill>COD</Pill> : null}
            {umkm.layanan?.includes("antar") ? <Pill>Antar</Pill> : null}
            {umkm.layanan?.includes("ambil") ? <Pill>Ambil</Pill> : null}
          </div>

          {/* unggulan ringkas */}
          <div className="mt-3 grid gap-2">
            {unggulan.slice(0, 1).map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="text-xs font-semibold text-gray-900 line-clamp-1">{p.nama}</div>
                <div className="mt-0.5 text-sm font-semibold text-brand-900">
                  {formatRupiah(p.harga)}
                  {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="h-11 w-full rounded-2xl bg-brand-800 text-center text-sm font-semibold text-white leading-[2.75rem] transition group-hover:bg-brand-900">
              Lihat & Pesan
            </div>
            <div className="mt-2 text-center text-[11px] text-gray-500">Detail UMKM • WA & QR</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** CARD: LIST (desktop enak, seperti versi awal) */
function UmkmCardList({ umkm, produk }: { umkm: UmkmInfo; produk: Produk[] }) {
  const gallery = pickGallery(umkm, produk);
  const unggulan = pickUnggulan(umkm, produk);
  const st = getShopStatus(umkm.jam_buka);

  const statusCls =
    st.color === "green" ? "bg-green-600" : st.color === "red" ? "bg-red-600" : "bg-gray-700";

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[360px_1fr]">
        {/* Media */}
        <div className="relative h-64 bg-gray-100 lg:h-full">
          <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
              {umkm.kategori.toUpperCase()}
            </span>
            <span className="rounded-full bg-brand-800 px-2.5 py-1 text-xs font-medium text-white shadow-soft">
              {umkm.dusun.nama}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${statusCls}`}>
              {st.label}
            </span>
            {umkm.estimasi ? (
              <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                ⏱ {umkm.estimasi}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">{umkm.nama}</h2>
              <div className="mt-1 text-sm text-gray-600">
                {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
              </div>

              <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                {umkm.tentang ?? "Deskripsi belum tersedia."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {umkm.layanan?.includes("cod") ? <Pill>COD</Pill> : null}
                {umkm.layanan?.includes("antar") ? <Pill>Antar</Pill> : null}
                {umkm.layanan?.includes("ambil") ? <Pill>Ambil</Pill> : null}
                {umkm.pembayaran?.length ? <Pill>Bayar: {umkm.pembayaran.join(", ")}</Pill> : null}
                {umkm.jam_buka ? <Pill>🕒 {umkm.jam_buka}</Pill> : null}
              </div>

              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Produk unggulan
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {unggulan.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{p.nama}</div>
                      <div className="mt-1 text-sm font-semibold text-brand-900">
                        {formatRupiah(p.harga)}
                        {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 sm:text-right">
              <Link to={`/umkm/${umkm.id}`}>
                <Button className="w-full sm:w-auto">Lihat & Pesan</Button>
              </Link>
              <div className="mt-2 text-xs text-gray-500">Detail UMKM • WA & QR</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ProdukPage() {
  const [dusunId, setDusunId] = useState<string>("all");
  const [kategori, setKategori] = useState<KategoriOrAll>("all");
  const [q, setQ] = useState("");

  const [dusunList, setDusunList] = useState<Dusun[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<ViewMode>("grid");

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
    () => [{ value: "all", label: "Semua Dusun" }, ...dusunList.map((d) => ({ value: d.id, label: d.nama }))],
    [dusunList],
  );

  const filteredProduk = useMemo(() => {
    const query = q.trim().toLowerCase();
    return produkList.filter((p) => {
      const okDusun = dusunId === "all" ? true : p.umkm.dusun.id === dusunId;
      const okKat = kategori === "all" ? true : p.umkm.kategori === kategori;

      const hay = `${p.nama} ${p.umkm.nama} ${p.umkm.dusun.nama} ${p.deskripsi ?? ""}`.toLowerCase();
      const okQ = query === "" ? true : hay.includes(query);

      return okDusun && okKat && okQ;
    });
  }, [dusunId, kategori, q, produkList]);

  const umkmAll = useMemo(() => groupByUmkm(filteredProduk), [filteredProduk]);
  const umkmShown = useMemo(() => umkmAll.slice(0, visibleCount), [umkmAll, visibleCount]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [dusunId, kategori, q, view]);

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

  const activeDusunLabel = dusunOptions.find((x) => x.value === dusunId)?.label ?? "Semua Dusun";
  const showActive = dusunId !== "all" || kategori !== "all" || q.trim().length > 0;

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
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Direktori UMKM Desa Ngipak</h1>
            <p className="mt-2 text-white/80">Cari UMKM dan produk, lalu pesan langsung via WhatsApp.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
              <Pill tone="brand">Langsung ke penjual</Pill>
              <Pill tone="brand">Mobile-friendly</Pill>
              <Pill tone="brand">WA & QR</Pill>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle value={view} onChange={setView} />

            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
            <Link to="/tentang">
              <Button variant="secondary">Tentang</Button>
            </Link>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total UMKM" value={totalUmkm} />
          <StatTile label="Total Produk" value={totalProduk} />
          <StatTile label="Dusun" value={dusunList.length} />
          <StatTile label="UMKM Terfilter" value={umkmAll.length} />
        </div>
      </div>

      {/* FILTER */}
      <Card className="p-5">
        <SectionHeader
          title="Cari UMKM"
          desc="Gunakan filter untuk mempercepat pencarian."
          right={<Badge variant="neutral">{umkmAll.length} UMKM</Badge>}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <FilterSelect label="Dusun" value={dusunId} options={dusunOptions} onChange={setDusunId} />
          <FilterSelect label="Kategori" value={kategori} options={kategoriUI} onChange={onKategoriChange} />
          <SearchInput label="" placeholder="Cari UMKM / produk..." value={q} onChange={setQ} />
        </div>

        {showActive ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Filter aktif:</span>

            {dusunId !== "all" ? <Pill>Dusun: {activeDusunLabel}</Pill> : null}
            {kategori !== "all" ? <Pill>Kategori: {kategoriLabel(kategori)}</Pill> : null}
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
            <Pill>Tips: ketik “keripik”, “jamu”, “laundry”</Pill>
            <Pill>Filter dusun untuk warga lokal</Pill>
          </div>
        )}
      </Card>

      {/* LIST/GRID */}
      {umkmAll.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-lg font-semibold text-gray-900">Tidak ada hasil</div>
          <div className="mt-1 text-sm text-gray-600">Coba ubah filter/kata kunci atau reset.</div>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>
        </Card>
      ) : view === "grid" ? (
        <>
          {/* grid: mobile 2 kolom */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
            {umkmShown.map(({ umkm, produk }) => (
              <UmkmCardGrid key={umkm.id} umkm={umkm} produk={produk} />
            ))}
          </div>

          {umkmAll.length > umkmShown.length ? (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                Tampilkan lebih banyak
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {umkmShown.map(({ umkm, produk }) => (
              <UmkmCardList key={umkm.id} umkm={umkm} produk={produk} />
            ))}
          </div>

          {umkmAll.length > umkmShown.length ? (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                Tampilkan lebih banyak
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
