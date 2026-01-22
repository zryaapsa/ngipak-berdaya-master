import { useEffect, useMemo, useState } from "react";

import { listDusun, listProduk } from "../../../features/umkm/api";
import type { Dusun, Produk } from "../../../features/umkm/types";

import ProdukHero from "./sections/ProdukHero";
import ProdukFilters from "./sections/ProdukFilters";
import UmkmListView from "./sections/UmkmListView";
import UmkmGridView from "./sections/UmkmGridView";
import ProdukEmptyState from "./sections/ProdukEmptyState";
import ProdukLoadMore from "./sections/ProdukLoadMore";
import ProdukSkeleton from "./sections/ProdukSkeleton";

import type { KategoriOrAll, ViewMode } from "./utils/produk.utils";
import { groupByUmkm, isKategori } from "./utils/produk.utils";

export default function ProdukPage() {
  const [dusunId, setDusunId] = useState<string>("all");
  const [kategori, setKategori] = useState<KategoriOrAll>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const [dusunList, setDusunList] = useState<Dusun[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [d, p] = await Promise.all([listDusun(), listProduk()]);
        if (!alive) return;
        setDusunList(d);
        setProdukList(p);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dusunOptions = useMemo(
    () => [
      { value: "all", label: "Semua Dusun" },
      ...dusunList.map((d) => ({ value: d.id, label: d.nama })),
    ],
    [dusunList],
  );

  const filteredProduk = useMemo(() => {
    const query = q.trim().toLowerCase();
    return produkList.filter((p) => {
      const okDusun = dusunId === "all" ? true : p.umkm.dusun.id === dusunId;
      const okKat = kategori === "all" ? true : p.umkm.kategori === kategori;

      const hay = `${p.nama} ${p.umkm.nama} ${p.umkm.dusun.nama} ${p.deskripsi ?? ""}`.toLowerCase();
      const okQ = query === "" ? true : hay.includes(query);

      return okDusun && okKat && okQ;
    });
  }, [dusunId, kategori, q, produkList]);

  const umkmAll = useMemo(() => groupByUmkm(filteredProduk), [filteredProduk]);
  const umkmShown = useMemo(() => umkmAll.slice(0, visibleCount), [umkmAll, visibleCount]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [dusunId, kategori, q]);

  const reset = () => {
    setDusunId("all");
    setKategori("all");
    setQ("");
    setVisibleCount(PAGE_SIZE);
  };

  const onKategoriChange = (v: string) => {
    if (v === "all") return setKategori("all");
    if (isKategori(v)) return setKategori(v);
    return setKategori("all");
  };

  const totalProduk = produkList.length;
  const totalUmkm = useMemo(() => groupByUmkm(produkList).length, [produkList]);

  const activeDusunLabel =
    dusunOptions.find((x) => x.value === dusunId)?.label ?? "Semua Dusun";

  const showActive = dusunId !== "all" || kategori !== "all" || q.trim().length > 0;

  if (loading) return <ProdukSkeleton />;

  return (
    <div className="space-y-6">
      <ProdukHero
        totalUmkm={totalUmkm}
        totalProduk={totalProduk}
        totalDusun={dusunList.length}
        totalFilteredUmkm={umkmAll.length}
      />

      <ProdukFilters
        dusunId={dusunId}
        setDusunId={setDusunId}
        kategori={kategori}
        onKategoriChange={onKategoriChange}
        q={q}
        setQ={setQ}
        view={view}
        setView={setView}
        dusunOptions={dusunOptions}
        activeDusunLabel={activeDusunLabel}
        umkmCount={umkmAll.length}
        showActive={showActive}
        onReset={reset}
      />

      {view === "list" ? <UmkmListView items={umkmShown} /> : <UmkmGridView items={umkmShown} />}

      {umkmAll.length === 0 ? <ProdukEmptyState onReset={reset} /> : null}

      {umkmAll.length > umkmShown.length ? (
        <ProdukLoadMore onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} />
      ) : null}
    </div>
  );
}
