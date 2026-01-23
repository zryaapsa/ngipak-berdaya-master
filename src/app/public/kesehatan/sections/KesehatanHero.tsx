import Button from "../../../../components/ui/Button";
import StatTile from "../../../../components/ui/StatTile";

function InfoStrip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur">
      <div className="text-xs font-semibold text-white/90">{title}</div>
      <div className="mt-1 text-xs text-white/75">{desc}</div>
    </div>
  );
}

export default function KesehatanHero({
  periodeLabel,
  sumber,
  leafletPath,
  latestStunting,
  latestHipertensi,
  jadwalCount,
  dusunCount,
}: {
  periodeLabel: string;
  sumber: string;
  leafletPath: string;
  latestStunting: number;
  latestHipertensi: number;
  jadwalCount: number;
  dusunCount: number;
}) {
  const hasLeaflet = Boolean(leafletPath && leafletPath.trim());

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">
            Informasi Kesehatan Desa Ngipak
          </h1>
          <p className="mt-2 text-white/80">
            Ringkasan isu kesehatan, tren data, jadwal posyandu, dan kontak kader.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <InfoStrip title="Periode data" desc={periodeLabel} />
            <InfoStrip title="Sumber" desc={sumber} />
            <InfoStrip
              title="Cakupan"
              desc={`${dusunCount} dusun • ${jadwalCount} jadwal (sesuai filter)`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasLeaflet ? (
            <a href={leafletPath} target="_blank" rel="noreferrer">
              <Button variant="secondary">Unduh Leaflet Edukasi (PDF)</Button>
            </a>
          ) : (
            <Button variant="secondary" disabled>
              Leaflet belum tersedia
            </Button>
          )}
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Stunting (terbaru)"
          value={latestStunting}
          icon={<span className="text-lg">👶</span>}
        />
        <StatTile
          label="Hipertensi (terbaru)"
          value={latestHipertensi}
          icon={<span className="text-lg">💓</span>}
        />
        <StatTile
          label="Jadwal kegiatan"
          value={jadwalCount}
        />
        <StatTile label="Jumlah dusun" value={dusunCount} />
      </div>
    </div>
  );
}