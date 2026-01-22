import { Link } from "react-router-dom";

import type { Produk, UmkmInfo } from "../../../../features/umkm/types";
import { formatRupiah } from "../../../../lib/format";
import { getShopStatus } from "../../../../lib/status";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Carousel from "../../../../components/ui/Carousel";
import Pill from "./Pill";
import { pickGallery, pickUnggulan } from "../utils/produk.utils";

export default function UmkmListView({
  items,
}: {
  items: { umkm: UmkmInfo; produk: Produk[] }[];
}) {
  return (
    <div className="space-y-4">
      {items.map(({ umkm, produk }) => {
        const gallery = pickGallery(umkm, produk);
        const unggulan = pickUnggulan(umkm, produk);
        const st = getShopStatus(umkm.jam_buka);

        const statusCls =
          st.color === "green" ? "bg-green-600" : st.color === "red" ? "bg-red-600" : "bg-gray-700";

        return (
          <Card key={umkm.id} className="overflow-hidden">
            <div className="grid lg:grid-cols-[340px_1fr]">
              {/* media */}
              <div className="relative h-60 bg-gray-100 lg:h-full">
                <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900 ring-1 ring-black/5 backdrop-blur">
                    {umkm.kategori.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-brand-800 px-2.5 py-1 text-xs font-medium text-white shadow-soft">
                    {umkm.dusun.nama}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                  <span className={["rounded-full px-2.5 py-1 text-xs font-semibold text-white", statusCls].join(" ")}>
                    {st.label}
                  </span>
                  {umkm.estimasi ? (
                    <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                      ⏱ {umkm.estimasi}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* content */}
              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">{umkm.nama}</h2>
                    <div className="mt-1 text-sm text-gray-600">
                      {umkm.alamat ?? `Dusun ${umkm.dusun.nama}, Gunungkidul`}
                    </div>

                    <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                      {umkm.tentang ?? "Deskripsi belum tersedia."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {umkm.layanan?.includes("cod") ? <Pill>COD</Pill> : null}
                      {umkm.layanan?.includes("antar") ? <Pill>Antar</Pill> : null}
                      {umkm.layanan?.includes("ambil") ? <Pill>Ambil</Pill> : null}
                      {umkm.pembayaran?.length ? <Pill>Bayar: {umkm.pembayaran.join(", ")}</Pill> : null}
                      {umkm.jam_buka ? <Pill>🕒 {umkm.jam_buka}</Pill> : null}
                    </div>

                    <div className="mt-5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Produk unggulan
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {unggulan.map((p) => (
                          <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">{p.nama}</div>
                            <div className="mt-1 text-sm font-semibold text-brand-900">
                              {formatRupiah(p.harga)}
                              {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <Link to={`/umkm/${umkm.id}`}>
                      <Button className="w-full sm:w-auto">Lihat & Pesan</Button>
                    </Link>
                    <div className="mt-2 text-xs text-gray-500">Detail UMKM • WA & QR</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
