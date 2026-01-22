import type { UmkmInfo } from "../../../../features/umkm/types";
import Button from "../../../../components/ui/Button";
import Pill from "./Pill";

export default function UmkmHero({
  umkm,
  statusLabel,
  statusCls,
}: {
  umkm: UmkmInfo;
  statusLabel: string;
  statusCls: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{umkm.nama}</h1>

            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5">
              {umkm.kategori.toUpperCase()}
            </span>

            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
              {umkm.dusun.nama}
            </span>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-semibold text-white",
                statusCls,
              ].join(" ")}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-2 text-sm text-white/80">
            {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
          </div>

          <p className="mt-3 max-w-3xl text-sm text-white/85">
            {umkm.tentang ?? "Deskripsi belum tersedia."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {umkm.layanan?.includes("cod") ? <Pill tone="brand">COD</Pill> : null}
            {umkm.layanan?.includes("antar") ? <Pill tone="brand">Antar</Pill> : null}
            {umkm.layanan?.includes("ambil") ? <Pill tone="brand">Ambil</Pill> : null}
            {umkm.pembayaran?.length ? (
              <Pill tone="brand">Bayar: {umkm.pembayaran.join(", ")}</Pill>
            ) : null}
            {umkm.jam_buka ? <Pill tone="brand">🕒 {umkm.jam_buka}</Pill> : null}
            {umkm.estimasi ? <Pill tone="brand">⏱ {umkm.estimasi}</Pill> : null}
          </div>
        </div>

        <div className="shrink-0">
          <a href="#order-panel">
            <Button variant="secondary" className="h-11 w-full md:w-auto">
              Pesan & QR
            </Button>
          </a>
          <div className="mt-2 text-xs text-white/70">
            Aksi pemesanan ada di panel kanan.
          </div>
        </div>
      </div>
    </div>
  );
}
