import { Link } from "react-router-dom";

import type { Produk, UmkmInfo } from "../../../../features/umkm/types";
import { formatRupiah } from "../../../../lib/format";
import { getShopStatus } from "../../../../lib/status";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Carousel from "../../../../components/ui/Carousel";
import { pickGallery, pickUnggulan } from "../utils/produk.utils";

export default function UmkmGridView({
  items,
}: {
  items: { umkm: UmkmInfo; produk: Produk[] }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ umkm, produk }) => {
        const gallery = pickGallery(umkm, produk);
        const unggulan = pickUnggulan(umkm, produk);
        const st = getShopStatus(umkm.jam_buka);

        const statusCls =
          st.color === "green" ? "bg-green-600" : st.color === "red" ? "bg-red-600" : "bg-gray-700";

        return (
          <Card key={umkm.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100">
              <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

              <div className="absolute left-2 top-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                  {umkm.kategori.toUpperCase()}
                </span>
                <span className="rounded-full bg-brand-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-soft">
                  {umkm.dusun.nama}
                </span>
              </div>

              <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2">
                <span className={["rounded-full px-2.5 py-1 text-[11px] font-semibold text-white", statusCls].join(" ")}>
                  {st.label}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{umkm.nama}</div>
              <div className="mt-1 text-xs text-gray-600 line-clamp-1">
                {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
              </div>

              <div className="mt-3 grid gap-2">
                {unggulan.slice(0, 1).map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
                    <div className="text-xs font-semibold text-gray-900 line-clamp-1">{p.nama}</div>
                    <div className="mt-1 text-xs font-semibold text-brand-900">
                      {formatRupiah(p.harga)}
                      {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Link to={`/umkm/${umkm.id}`}>
                  <Button className="h-11 w-full">Pesan</Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
