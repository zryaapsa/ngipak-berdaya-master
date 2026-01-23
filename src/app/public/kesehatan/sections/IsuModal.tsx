import type { IsuKesehatan } from "../../../../features/kesehatan/public.types";
import Modal from "../../../../components/ui/Modal";

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

function ListBox({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export default function IsuModal({
  isu,
  open,
  onClose,
  leafletPath,
}: {
  isu: IsuKesehatan | null;
  open: boolean;
  onClose: () => void;
  leafletPath: string;
}) {
  const pr = isu?.prioritas ?? "sedang";
  const hasLeaflet = Boolean(leafletPath && leafletPath.trim());

  const dampak = isu?.dampak ?? [];
  const upaya = isu?.upaya_desa ?? [];
  const aksi = isu?.aksi_warga ?? [];
  const saran = isu?.saran ?? [];

  const hasDetail = dampak.length || upaya.length || aksi.length;

  return (
    <Modal open={open} onClose={onClose} title={isu?.judul ?? "Detail Isu"}>
      {isu ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">Ringkasan</div>
            <PrioritasBadge level={pr} />
          </div>

          <p className="text-gray-800 leading-relaxed">{isu.ringkas}</p>

          {hasDetail ? (
            <>
              <ListBox title="Upaya yang bisa dilakukan di tingkat desa" items={upaya} />
              <ListBox title="Dampak jika tidak ditangani" items={dampak} />
              <ListBox title="Langkah yang bisa dilakukan warga" items={aksi} />
            </>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">Langkah yang bisa dilakukan</div>
              {saran.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {saran.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-gray-600">
                  Detail isu belum diisi (upaya/dampak/aksi). Admin bisa melengkapi di Kelola Kesehatan.
                </div>
              )}
            </div>
          )}

          {hasLeaflet ? (
            <a
              href={leafletPath}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-800 hover:bg-brand-100"
            >
              Buka leaflet edukasi (PDF)
            </a>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Leaflet belum tersedia.
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}