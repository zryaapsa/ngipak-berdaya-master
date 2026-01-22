import type { IsuKesehatan } from "../../../../features/kesehatan/types";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

function SeverityBadge({ id }: { id: string }) {
  const level =
    id === "stunting" || id === "hipertensi"
      ? "Perlu perhatian lebih"
      : "Perlu perhatian";

  const cls =
    level === "Perlu perhatian lebih"
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        cls,
      ].join(" ")}
    >
      {level}
    </span>
  );
}

function IsuIcon({ id }: { id: string }) {
  if (id === "stunting") return <span className="text-2xl">👶</span>;
  if (id === "hipertensi") return <span className="text-2xl">💓</span>;
  return <span className="text-2xl">🍃</span>;
}

export default function IsuSection({
  isuList,
  onSelect,
}: {
  isuList: IsuKesehatan[];
  onSelect: (isu: IsuKesehatan) => void;
}) {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Isu Kesehatan yang Perlu Dipahami"
        desc="Pilih kartu untuk melihat penjelasan lengkap dan langkah yang bisa dilakukan."
        right={<Badge>{isuList.length} topik</Badge>}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {isuList.map((isu) => (
          <button
            key={isu.id}
            onClick={() => onSelect(isu)}
            className={[
              "group rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition",
              "hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-100",
            ].join(" ")}
            type="button"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-brand-50 p-2 text-brand-800 ring-1 ring-brand-100">
                <IsuIcon id={isu.id} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {isu.judul}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <div className="text-xs text-gray-500">Tingkat perhatian</div>
                  <SeverityBadge id={isu.id} />
                </div>

                <div className="mt-3 min-h-[3.25rem] text-sm text-gray-700 line-clamp-2">
                  {isu.ringkas}
                </div>

                <div className="mt-3 text-xs font-semibold text-brand-700">
                  Baca penjelasan →
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
        <div className="font-semibold text-gray-900">Tujuan halaman ini</div>
        <div className="mt-1">
          Membantu warga memahami informasi dasar dan memilih langkah yang tepat.
          Untuk keluhan berat atau darurat, tetap utamakan layanan kesehatan terdekat.
        </div>
      </div>
    </Card>
  );
}
