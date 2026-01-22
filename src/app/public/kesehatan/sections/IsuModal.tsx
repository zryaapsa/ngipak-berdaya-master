import type { IsuKesehatan } from "../../../../features/kesehatan/types";
import Modal from "../../../../components/ui/Modal";

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
  return (
    <Modal open={open} onClose={onClose} title={isu?.judul}>
      {isu ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Ringkasan singkat</div>
            <SeverityBadge id={isu.id} />
          </div>

          <p className="text-gray-800">{isu.ringkas}</p>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">
              Upaya yang bisa dilakukan di tingkat desa
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {isu.upayaDesa.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">
              Dampak jika tidak ditangani
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {isu.dampak.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">
              Langkah yang bisa dilakukan warga
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {isu.aksiWarga.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <a
            href={leafletPath}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-sm font-semibold text-brand-700 hover:underline"
          >
            Buka leaflet edukasi (PDF)
          </a>
        </div>
      ) : null}
    </Modal>
  );
}
