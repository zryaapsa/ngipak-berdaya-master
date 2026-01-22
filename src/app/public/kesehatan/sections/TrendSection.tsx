import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

function TrendLabel({ series }: { series: number[] }) {
  if (series.length < 2) return null;

  const prev = series[series.length - 2];
  const now = series[series.length - 1];
  const diff = now - prev;

  const isSame = diff === 0;
  const cls = isSame
    ? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
    : diff > 0
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : "bg-green-50 text-green-700 ring-1 ring-green-100";

  const label = isSame
    ? "Stabil"
    : diff > 0
      ? `Meningkat ${diff}`
      : `Menurun ${Math.abs(diff)}`;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function MiniLineChart({
  values,
  height = 92,
  width = 260,
}: {
  values: number[];
  height?: number;
  width?: number;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);

  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
      <path d={area} fill="currentColor" opacity="0.10" />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="currentColor" opacity="0.9" />
      ))}
    </svg>
  );
}

function SummaryCard({
  title,
  subtitle,
  latest,
  series,
  tone = "brand",
  note,
}: {
  title: string;
  subtitle: string;
  latest: number;
  series: number[];
  tone?: "brand" | "danger";
  note?: string;
}) {
  const toneCls = tone === "danger" ? "text-red-700" : "text-brand-700";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-xs text-gray-600">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          <TrendLabel series={series} />
          <span className="text-sm font-bold text-gray-900">{latest}</span>
        </div>
      </div>

      <div className={`mt-4 ${toneCls}`}>
        <MiniLineChart values={series} />
      </div>

      {note ? <div className="mt-3 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

export default function TrendSection({
  desc,
  latestStunting,
  latestHipertensi,
  stuntingSeries,
  hipertensiSeries,
}: {
  desc: string;
  latestStunting: number;
  latestHipertensi: number;
  stuntingSeries: number[];
  hipertensiSeries: number[];
}) {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Perkembangan 6 Bulan Terakhir"
        desc={desc}
        right={<Badge>Contoh data</Badge>}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SummaryCard
          title="Stunting"
          subtitle="Jumlah kasus (contoh untuk tampilan)"
          latest={latestStunting}
          series={stuntingSeries}
          note="Interpretasi singkat: bandingkan perubahan bulan terakhir untuk melihat arah tren."
        />

        <SummaryCard
          title="Tekanan darah tinggi (hipertensi)"
          subtitle="Jumlah kasus (contoh untuk tampilan)"
          latest={latestHipertensi}
          series={hipertensiSeries}
          tone="danger"
          note="Saran umum: cek tekanan darah rutin, kurangi garam, dan konsultasi tenaga kesehatan jika perlu."
        />
      </div>
    </Card>
  );
}
