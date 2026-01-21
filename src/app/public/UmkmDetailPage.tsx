import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listProduk } from "../../features/umkm/api";
import type { Produk, UmkmInfo } from "../../features/umkm/types";

import { formatRupiah } from "../../lib/format";
import { toWaLink } from "../../lib/wa";
import { getShopStatus } from "../../lib/status";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Carousel from "../../components/ui/Carousel";
import QrCode from "../../components/ui/QrCode";
import CopyButton from "../../components/ui/CopyButton";
import SectionHeader from "../../components/ui/SectionHeader";
import FilterSelect from "../../components/ui/FilterSelect";

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

function pickThumb(umkm: UmkmInfo, produk: Produk[]) {
  return (umkm.galeri_foto ?? [])[0] ?? produk[0]?.foto_url ?? "";
}

function pickSerupa(all: { umkm: UmkmInfo; produk: Produk[] }[], cur: UmkmInfo) {
  const sameKat = all.filter(
    (x) => x.umkm.id !== cur.id && x.umkm.kategori === cur.kategori,
  );
  const sameDusun = all.filter(
    (x) => x.umkm.id !== cur.id && x.umkm.dusun.id === cur.dusun.id,
  );
  const merged = [...sameKat, ...sameDusun];

  const seen = new Set<string>();
  const unique = merged.filter((x) => {
    if (seen.has(x.umkm.id)) return false;
    seen.add(x.umkm.id);
    return true;
  });

  return unique.slice(0, 3);
}

export default function UmkmDetailPage() {
  const { id } = useParams();
  const [selectedProdukId, setSelectedProdukId] = useState<string>("");

  const [produkAll, setProdukAll] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const p = await listProduk();
        if (!alive) return;
        setProdukAll(p);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ==== SEMUA HOOKS HARUS DI ATAS, SEBELUM RETURN CONDITIONAL ====

  const umkmAll = useMemo(() => groupByUmkm(produkAll), [produkAll]);

  const data = useMemo(() => {
    if (!id) return null;
    return umkmAll.find((x) => String(x.umkm.id) === String(id)) ?? null;
  }, [id, umkmAll]);

  const umkm = data?.umkm ?? null;
  const produk = data?.produk ?? [];

  const gallery = useMemo(() => {
    if (!umkm) return [];
    return pickGallery(umkm, produk);
  }, [umkm, produk]);

  const chosen = useMemo(() => {
    return produk.find((p) => p.id === selectedProdukId) ?? null;
  }, [produk, selectedProdukId]);

  const msg = useMemo(() => {
    if (!umkm) return "";
    return chosen
      ? `Halo, saya ingin pesan "${chosen.nama}". Jumlah: __. Alamat: __.`
      : `Halo, saya ingin tanya/pesan produk dari "${umkm.nama}". Produk: __. Jumlah: __.`;
  }, [umkm, chosen]);

  const href = useMemo(() => {
    if (!umkm) return "#";
    return toWaLink(umkm.no_wa, msg);
  }, [umkm, msg]);

  const st = useMemo(() => getShopStatus(umkm?.jam_buka), [umkm]);

  const serupa = useMemo(() => {
    if (!umkm) return [];
    return pickSerupa(umkmAll, umkm);
  }, [umkmAll, umkm]);

  // ✅ dropdown produk (pakai FilterSelect)
  const produkOptions = useMemo(
    () => [
      { value: "", label: "(Tidak memilih) — tanya dulu" },
      ...produk.map((p) => ({
        value: p.id,
        label: `${p.nama} — ${formatRupiah(p.harga)}`,
      })),
    ],
    [produk],
  );

  // ==== RETURN CONDITIONAL SETELAH SEMUA HOOKS ====

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-sm text-gray-700">Memuat detail UMKM...</div>
      </Card>
    );
  }

  if (!data || !umkm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/produk">
            <Button variant="secondary">← Kembali</Button>
          </Link>
          <div className="text-sm text-gray-500">Detail UMKM</div>
        </div>

        <Card className="p-6">
          <div className="font-semibold text-gray-900">UMKM tidak ditemukan.</div>
          <div className="mt-1 text-sm text-gray-600">
            Kembali ke Direktori UMKM untuk melihat daftar.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/produk">
          <Button variant="secondary">← Kembali</Button>
        </Link>
        <div className="text-sm text-gray-500">Detail UMKM</div>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{umkm.nama}</h1>
              <Badge>{umkm.kategori.toUpperCase()}</Badge>
              <Badge>{umkm.dusun.nama}</Badge>

              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${
                  st.color === "green"
                    ? "bg-green-600"
                    : st.color === "red"
                      ? "bg-red-600"
                      : "bg-gray-700"
                }`}
              >
                {st.label}
              </span>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              {umkm.alamat ?? `Dusun ${umkm.dusun.nama}`}
            </div>

            <p className="mt-3 text-sm text-gray-700">
              {umkm.tentang ?? "Deskripsi belum tersedia."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
              {umkm.layanan?.includes("cod") ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">COD</span>
              ) : null}
              {umkm.layanan?.includes("antar") ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">Antar</span>
              ) : null}
              {umkm.layanan?.includes("ambil") ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">Ambil</span>
              ) : null}
              {umkm.pembayaran?.length ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">
                  Bayar: {umkm.pembayaran.join(", ")}
                </span>
              ) : null}
              {umkm.jam_buka ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">
                  🕒 {umkm.jam_buka}
                </span>
              ) : null}
              {umkm.estimasi ? (
                <span className="rounded-full border bg-gray-50 px-2 py-1">
                  ⏱ {umkm.estimasi}
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0">
            <a href={href} target="_blank" rel="noreferrer">
              <Button>Pesan via WhatsApp</Button>
            </a>
            <div className="mt-2 text-xs text-gray-500">QR tersedia di bawah</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-start">
        {/* Left: gallery */}
        <Card className="overflow-hidden">
          <div className="aspect-[4/3] bg-gray-100">
            <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />
          </div>
        </Card>

        {/* Right: order panel */}
        <Card className="p-4">
          <SectionHeader
            title="Pesan Sekarang"
            desc="Pilih produk (opsional), lalu kirim via WhatsApp."
            right={<Badge>WA / QR</Badge>}
          />

          <div className="mt-4">
            <FilterSelect
              label="Produk"
              value={selectedProdukId}
              options={produkOptions}
              onChange={setSelectedProdukId}
            />

            {chosen ? (
              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                <div className="font-semibold text-gray-900">{chosen.nama}</div>
                <div className="mt-1 font-semibold text-brand-900">
                  {formatRupiah(chosen.harga)}
                  {chosen.satuan ? (
                    <span className="text-gray-500"> / {chosen.satuan}</span>
                  ) : null}
                </div>
                {chosen.deskripsi ? (
                  <div className="mt-2 text-gray-700">{chosen.deskripsi}</div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px] lg:items-start">
            {/* Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2"
                >
                  <Button className="h-11 w-full">Buka WhatsApp</Button>
                </a>

                <CopyButton text={msg} className="col-span-1" />

                {umkm.maps_url ? (
                  <a
                    href={umkm.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-1"
                  >
                    <Button variant="secondary" className="h-11 w-full">
                      Lokasi
                    </Button>
                  </a>
                ) : (
                  <div className="col-span-1">
                    <Button variant="secondary" className="h-11 w-full" disabled>
                      Lokasi
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                Tip: setelah WhatsApp terbuka, isi jumlah & alamat pada chat.
              </div>
            </div>

            {/* QR */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-center">
              <div className="text-xs font-semibold text-gray-600">QR WhatsApp</div>
              <div className="mt-3 flex justify-center">
                <QrCode
                  value={href}
                  size={150}
                  className="rounded-xl bg-white p-2 ring-1 ring-black/5"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Scan untuk membuka chat
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Produk UMKM */}
      <Card className="p-4">
        <SectionHeader
          title="Daftar Produk"
          desc="Produk yang tersedia dari UMKM ini."
          right={<Badge>{produk.length}</Badge>}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {produk.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="font-semibold text-gray-900">{p.nama}</div>
              <div className="mt-1 font-semibold text-brand-900">
                {formatRupiah(p.harga)}
                {p.satuan ? (
                  <span className="text-gray-500"> / {p.satuan}</span>
                ) : null}
              </div>
              {p.deskripsi ? (
                <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                  {p.deskripsi}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setSelectedProdukId(p.id)}
                className="mt-3 w-full"
              >
                <Button variant="secondary" className="h-11 w-full">
                  Pilih Produk Ini
                </Button>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* UMKM Serupa (tambah gambar) */}
      {serupa.length ? (
        <Card className="p-4">
          <SectionHeader
            title="UMKM Serupa"
            desc="Alternatif dari kategori/dusun yang mirip."
            right={<Badge>{serupa.length}</Badge>}
          />

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {serupa.map(({ umkm: u, produk: pr }) => {
              const thumb = pickThumb(u, pr);

              return (
                <Link
                  key={u.id}
                  to={`/umkm/${u.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="relative h-36 bg-gray-100">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={u.nama}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                        {u.kategori.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-brand-800 px-2.5 py-1 text-xs font-medium text-white shadow-soft">
                        {u.dusun.nama}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="font-semibold text-gray-900 group-hover:text-brand-900">
                      {u.nama}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{u.dusun.nama}</div>

                    <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                      {u.tentang ?? "Lihat detail UMKM."}
                    </div>

                    <div className="mt-3 text-xs text-gray-500">{pr.length} produk</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
