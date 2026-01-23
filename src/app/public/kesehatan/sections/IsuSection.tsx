import type { IsuKesehatan } from "../../../../features/kesehatan/public.types";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function PrioritasBadge({ level }: { level: "rendah" | "sedang" | "tinggi" }) {
  const cls =
    level === "tinggi"
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : level === "sedang"
      ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100"
      : "bg-green-50 text-green-700 ring-1 ring-green-100";

  const label =
    level === "tinggi"
      ? "Prioritas tinggi"
      : level === "sedang"
      ? "Prioritas sedang"
      : "Prioritas rendah";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>
      {label}
    </span>
  );
}

function pickIconKey(isu: IsuKesehatan) {
  const t = `${isu.id} ${isu.judul} ${isu.ringkas}`.toLowerCase();
  if (t.includes("stunting")) return "stunting";
  if (t.includes("hipertensi") || t.includes("darah tinggi") || t.includes("tekanan darah")) return "hipertensi";
  if (t.includes("lingkungan") || t.includes("sanitasi") || t.includes("sampah")) return "lingkungan";
  return "default";
}

function IsuIcon({ isu }: { isu: IsuKesehatan }) {
  const k = pickIconKey(isu);
  if (k === "stunting") return <span className="text-2xl">👶</span>;
  if (k === "hipertensi") return <span className="text-2xl">💓</span>;
  if (k === "lingkungan") return <span className="text-2xl">🍃</span>;
  return <span className="text-2xl">🩺</span>;
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

      {isuList.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <div className="font-semibold text-gray-900">Belum ada isu yang dipublish.</div>
          <div className="mt-1 text-sm text-gray-600">Admin perlu menambahkan isu dan mengaktifkan status Published.</div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {isuList.map((isu) => {
            const pr = isu.prioritas ?? "sedang";
            return (
              <button
                key={isu.id}
                onClick={() => onSelect(isu)}
                className={cn(
                  "group rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition",
                  "hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-100",
                )}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-xl bg-brand-50 p-2 text-brand-800 ring-1 ring-brand-100">
                    <IsuIcon isu={isu} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">{isu.judul}</div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <div className="text-xs text-gray-500">Prioritas</div>
                      <PrioritasBadge level={pr} />
                    </div>

                    <div className="mt-3 min-h-[3.25rem] text-sm text-gray-700 line-clamp-2">{isu.ringkas}</div>

                    <div className="mt-3 text-xs font-semibold text-brand-700">Baca penjelasan →</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
        <div className="font-semibold text-gray-900">Tujuan halaman ini</div>
        <div className="mt-1">
          Membantu warga memahami informasi dasar dan memilih langkah yang tepat. Untuk keluhan berat atau darurat,
          tetap utamakan layanan kesehatan terdekat.
        </div>
      </div>
    </Card>
  );
}