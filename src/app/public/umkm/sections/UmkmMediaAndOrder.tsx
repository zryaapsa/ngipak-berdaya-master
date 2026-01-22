import type { Produk, UmkmInfo } from "../../../../features/umkm/types";
import { formatRupiah } from "../../../../lib/format";

import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Carousel from "../../../../components/ui/Carousel";
import QrCode from "../../../../components/ui/QrCode";
import CopyButton from "../../../../components/ui/CopyButton";
import SectionHeader from "../../../../components/ui/SectionHeader";
import FilterSelect from "../../../../components/ui/FilterSelect";

export default function UmkmMediaAndOrder({
  umkm,
  gallery,
  produkOptions,
  selectedProdukId,
  onSelectProduk,
  chosen,
  msg,
  href,
}: {
  umkm: UmkmInfo;
  gallery: string[];
  produkOptions: { value: string; label: string }[];
  selectedProdukId: string;
  onSelectProduk: (id: string) => void;
  chosen: Produk | null;
  msg: string;
  href: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-start">
      {/* Left: gallery */}
      <Card className="overflow-hidden">
        <div className="aspect-[4/3] bg-gray-100">
          <Carousel images={gallery} alt={umkm.nama} className="h-full w-full" />
        </div>
      </Card>

      {/* Right: order panel */}
      <Card id="order-panel" className="p-4 lg:sticky lg:top-20">
        <SectionHeader
          title="Pesan Sekarang"
          desc="Pilih produk (opsional), lalu kirim via WhatsApp."
          right={<Badge>WA / QR</Badge>}
        />

        <div className="mt-4">
          <FilterSelect
            label="Produk"
            value={selectedProdukId}
            options={produkOptions}
            onChange={onSelectProduk}
          />

          {chosen ? (
            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
              <div className="font-semibold text-gray-900">{chosen.nama}</div>
              <div className="mt-1 font-semibold text-brand-900">
                {formatRupiah(chosen.harga)}
                {chosen.satuan ? (
                  <span className="text-gray-500"> / {chosen.satuan}</span>
                ) : null}
              </div>
              {chosen.deskripsi ? (
                <div className="mt-2 text-gray-700">{chosen.deskripsi}</div>
              ) : null}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
              Kamu bisa langsung chat dulu, atau pilih produk agar format pesan otomatis.
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px] lg:items-start">
          {/* Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a href={href} target="_blank" rel="noreferrer" className="col-span-2">
                <Button className="h-11 w-full">Buka WhatsApp</Button>
              </a>

              <CopyButton text={msg} className="col-span-1" />

              {umkm.maps_url ? (
                <a href={umkm.maps_url} target="_blank" rel="noreferrer" className="col-span-1">
                  <Button variant="secondary" className="h-11 w-full">
                    Lokasi
                  </Button>
                </a>
              ) : (
                <div className="col-span-1">
                  <Button variant="secondary" className="h-11 w-full" disabled>
                    Lokasi
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
              Tip: setelah WhatsApp terbuka, isi jumlah & alamat pada chat.
            </div>
          </div>

          {/* QR */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-center">
            <div className="text-xs font-semibold text-gray-600">QR WhatsApp</div>
            <div className="mt-3 flex justify-center">
              <QrCode
                value={href}
                size={150}
                className="rounded-xl bg-white p-2 ring-1 ring-black/5"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">Scan untuk membuka chat</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
