import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { listProduk } from "../../../features/umkm/api";
import type { Produk } from "../../../features/umkm/types";

import { formatRupiah } from "../../../lib/format";
import { toWaLink } from "../../../lib/wa";
import { getShopStatus } from "../../../lib/status";

import UmkmTopBar from "./sections/UmkmTopBar";
import UmkmSkeleton from "./sections/UmkmSkeleton";
import UmkmNotFound from "./sections/UmkmNotFound";
import UmkmHero from "./sections/UmkmHero";
import UmkmMediaAndOrder from "./sections/UmkmMediaAndOrder";
import UmkmProdukGrid from "./sections/UmkmProdukGrid";
import UmkmSerupa from "./sections/UmkmSerupa";

import {
  groupByUmkm,
  pickGallery,
  pickSerupa,
  type UmkmGroup,
} from "./utils/umkm-detail.utils";

export default function UmkmDetailPage() {
  const { id } = useParams();
  const [selectedProdukId, setSelectedProdukId] = useState<string>("");

  const [produkAll, setProdukAll] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const p = await listProduk();
        if (!alive) return;
        setProdukAll(p);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const umkmAll = useMemo(() => groupByUmkm(produkAll), [produkAll]);

  const data = useMemo(() => {
    if (!id) return null;
    return umkmAll.find((x) => String(x.umkm.id) === String(id)) ?? null;
  }, [id, umkmAll]);

  const umkm = data?.umkm ?? null;
  const produk = data?.produk ?? [];

  const gallery = useMemo(() => {
    if (!umkm) return [];
    return pickGallery(umkm, produk);
  }, [umkm, produk]);

  const chosen = useMemo(() => {
    return produk.find((p) => p.id === selectedProdukId) ?? null;
  }, [produk, selectedProdukId]);

  const msg = useMemo(() => {
    if (!umkm) return "";
    return chosen
      ? `Halo, saya ingin pesan "${chosen.nama}". Jumlah: __. Alamat: __.`
      : `Halo, saya ingin tanya/pesan produk dari "${umkm.nama}". Produk: __. Jumlah: __.`;
  }, [umkm, chosen]);

  const href = useMemo(() => {
    if (!umkm) return "#";
    return toWaLink(umkm.no_wa, msg);
  }, [umkm, msg]);

  const st = useMemo(() => getShopStatus(umkm?.jam_buka), [umkm]);

  const serupa = useMemo<UmkmGroup[]>(() => {
    if (!umkm) return [];
    return pickSerupa(umkmAll, umkm);
  }, [umkmAll, umkm]);

  const produkOptions = useMemo(
    () => [
      { value: "", label: "(Tidak memilih) — tanya dulu" },
      ...produk.map((p) => ({
        value: p.id,
        label: `${p.nama} — ${formatRupiah(p.harga)}`,
      })),
    ],
    [produk],
  );

  const statusCls =
    st.color === "green"
      ? "bg-green-600"
      : st.color === "red"
        ? "bg-red-600"
        : "bg-gray-700";

  if (loading) return <UmkmSkeleton />;
  if (!data || !umkm) return <UmkmNotFound />;

  return (
    <div className="space-y-6">
      <UmkmTopBar />

      <UmkmHero umkm={umkm} statusLabel={st.label} statusCls={statusCls} />

      <UmkmMediaAndOrder
        umkm={umkm}
        gallery={gallery}
        produkOptions={produkOptions}
        selectedProdukId={selectedProdukId}
        onSelectProduk={setSelectedProdukId}
        chosen={chosen}
        msg={msg}
        href={href}
      />

      <UmkmProdukGrid
        produk={produk}
        selectedProdukId={selectedProdukId}
        onSelectProduk={setSelectedProdukId}
      />

      <UmkmSerupa serupa={serupa} />
    </div>
  );
}
