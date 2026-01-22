import type { Produk } from "../../../../features/umkm/types";
import { formatRupiah } from "../../../../lib/format";

import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

export default function UmkmProdukGrid({
  produk,
  selectedProdukId,
  onSelectProduk,
}: {
  produk: Produk[];
  selectedProdukId: string;
  onSelectProduk: (id: string) => void;
}) {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Daftar Produk"
        desc="Klik kartu untuk memilih produk."
        right={<Badge>{produk.length}</Badge>}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {produk.map((p) => {
          const active = p.id === selectedProdukId;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProduk(p.id)}
              className={[
                "text-left",
                "group overflow-hidden rounded-2xl border bg-white transition",
                "hover:-translate-y-0.5 hover:shadow-soft",
                active
                  ? "border-brand-200 ring-2 ring-brand-100"
                  : "border-gray-100",
              ].join(" ")}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {p.foto_url ? (
                  <img
                    src={p.foto_url}
                    alt={p.nama}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-900">
                  {p.nama}
                </div>

                <div className="mt-1 text-sm font-semibold text-brand-900">
                  {formatRupiah(p.harga)}
                  {p.satuan ? <span className="text-gray-500"> / {p.satuan}</span> : null}
                </div>

                {p.deskripsi ? (
                  <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                    {p.deskripsi}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500">Klik untuk pilih produk</div>
                )}

                <div className="mt-3">
                  <div
                    className={[
                      "inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "bg-brand-50 text-brand-900 ring-1 ring-brand-100"
                        : "bg-gray-50 text-gray-800 ring-1 ring-gray-200 group-hover:bg-brand-50 group-hover:text-brand-900 group-hover:ring-brand-100",
                    ].join(" ")}
                  >
                    {active ? "Terpilih" : "Pilih produk"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
