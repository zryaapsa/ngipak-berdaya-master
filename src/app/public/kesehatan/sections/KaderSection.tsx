import type { Kader } from "../../../../features/kesehatan/types";
import { toWaLink } from "../../../../lib/wa";

import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import SectionHeader from "../../../../components/ui/SectionHeader";

export default function KaderSection({ kader }: { kader: Kader[] }) {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Kontak Kader Kesehatan"
        desc="Hubungi kader untuk tanya jadwal posyandu, imunisasi, atau informasi kegiatan."
        right={<Badge>{kader.length}</Badge>}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {kader.map((k) => (
          <div key={k.id} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{k.nama}</div>
                <div className="mt-1 text-sm text-gray-600">{k.dusun.nama}</div>
              </div>
              <Badge variant="neutral">{k.dusun.nama}</Badge>
            </div>

            <a
              href={toWaLink(
                k.no_wa,
                "Halo Bu Kader, saya ingin bertanya jadwal kegiatan kesehatan (posyandu / imunisasi).",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block"
            >
              <Button className="w-full">Chat melalui WhatsApp</Button>
            </a>

            <div className="mt-2 text-xs text-gray-500">
              Tulis nama, dusun, dan keperluan.
            </div>
          </div>
        ))}

        {kader.length === 0 ? (
          <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
            Kontak kader belum tersedia untuk pilihan dusun ini.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
