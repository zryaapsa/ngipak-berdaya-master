import type { JadwalKesehatan } from "../../../../features/kesehatan/public.types";
import { formatTanggalID } from "../../../../lib/date";
import Badge from "../../../../components/ui/Badge";

export default function JadwalItem({ j }: { j: JadwalKesehatan }) {
  const jam = j.jam ? j.jam : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 transition hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900">{j.kegiatan}</div>
          <div className="mt-1 text-sm text-gray-600">
            {formatTanggalID(j.tanggal)}
            {jam ? ` • ${jam}` : ""}
          </div>
          {j.lokasi ? (
            <div className="mt-1 text-sm text-gray-600">{j.lokasi}</div>
          ) : null}
        </div>
        <Badge variant="neutral">{j.dusun.nama}</Badge>
      </div>

      {j.catatan ? (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
          {j.catatan}
        </div>
      ) : null}
    </div>
  );
}