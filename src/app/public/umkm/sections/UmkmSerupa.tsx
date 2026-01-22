import { Link } from "react-router-dom";
import type { UmkmGroup } from "../utils/umkm-detail.utils";
import { pickThumb } from "../utils/umkm-detail.utils";

import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

export default function UmkmSerupa({ serupa }: { serupa: UmkmGroup[] }) {
  if (!serupa.length) return null;

  return (
    <Card className="p-4">
      <SectionHeader
        title="UMKM Serupa"
        desc="Alternatif dari kategori/dusun yang mirip."
        right={<Badge>{serupa.length}</Badge>}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {serupa.map(({ umkm: u, produk: pr }) => {
          const thumb = pickThumb(u, pr);

          return (
            <Link
              key={u.id}
              to={`/umkm/${u.id}`}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="relative h-36 bg-gray-100">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={u.nama}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                    {u.kategori.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-brand-800 px-2.5 py-1 text-xs font-medium text-white shadow-soft">
                    {u.dusun.nama}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="font-semibold text-gray-900 group-hover:text-brand-900">
                  {u.nama}
                </div>
                <div className="mt-1 text-sm text-gray-600">{u.dusun.nama}</div>

                <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                  {u.tentang ?? "Lihat detail UMKM."}
                </div>

                <div className="mt-3 text-xs text-gray-500">{pr.length} produk</div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
