import StatTile from "../../../../components/ui/StatTile";
import Pill from "./Pill";

export default function ProdukHero({
  totalUmkm,
  totalProduk,
  totalDusun,
  totalFilteredUmkm,
}: {
  totalUmkm: number;
  totalProduk: number;
  totalDusun: number;
  totalFilteredUmkm: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">UMKM Desa Ngipak</h1>
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
        <StatTile label="Dusun" value={totalDusun} />
        <StatTile label="UMKM Terfilter" value={totalFilteredUmkm} />
      </div>
    </div>
  );
}
