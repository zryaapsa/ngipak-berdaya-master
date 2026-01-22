import { useEffect, useMemo, useState } from "react";

import { listDusun } from "../../../features/umkm/api";
import type { Dusun } from "../../../features/umkm/types";

import {
  getLeafletKesehatan,
  getMetaKesehatan,
  listIsuKesehatan,
  listJadwalKesehatan,
  listKader,
  listStatistikBulanan,
} from "../../../features/kesehatan/api";
import type {
  IsuKesehatan,
  JadwalKesehatan,
  Kader,
  LeafletLink,
  MetaKesehatan,
  StatistikBulanan,
} from "../../../features/kesehatan/types";

import { formatBulanPanjangID } from "./utils/kesehatan.utils";

import KesehatanSkeleton from "./sections/KesehatanSkeleton";
import KesehatanHero from "./sections/KesehatanHero";
import TrendSection from "./sections/TrendSection";
import IsuSection from "./sections/IsuSection";
import ImtToolCard from "./sections/ImtToolCard";
import QuickGuideCard from "./sections/QuickGuideCard";
import KaderSection from "./sections/KaderSection";
import JadwalSection from "./sections/JadwalSection";
import IsuModal from "./sections/IsuModal";

export default function KesehatanPage() {
  const [dusunId, setDusunId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selectedIsu, setSelectedIsu] = useState<IsuKesehatan | null>(null);

  const [dusunList, setDusunList] = useState<Dusun[]>([]);
  const [jadwal, setJadwal] = useState<JadwalKesehatan[]>([]);
  const [kader, setKader] = useState<Kader[]>([]);
  const [isuList, setIsuList] = useState<IsuKesehatan[]>([]);
  const [statistik, setStatistik] = useState<StatistikBulanan[]>([]);
  const [meta, setMeta] = useState<MetaKesehatan | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [d, j, k, isu, s, m, l] = await Promise.all([
          listDusun(),
          listJadwalKesehatan(),
          listKader(),
          listIsuKesehatan(),
          listStatistikBulanan(),
          getMetaKesehatan(),
          getLeafletKesehatan(),
        ]);

        if (!alive) return;
        setDusunList(d);
        setJadwal(j);
        setKader(k);
        setIsuList(isu);
        setStatistik(s);
        setMeta(m);
        setLeaflet(l);
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

  const filteredJadwal = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...jadwal]
      .filter((j) => (dusunId === "all" ? true : j.dusun.id === dusunId))
      .filter((j) => {
        if (!query) return true;
        return `${j.kegiatan} ${j.dusun.nama} ${j.lokasi ?? ""}`
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [dusunId, q, jadwal]);

  const kaderFiltered = useMemo(
    () => kader.filter((k) => (dusunId === "all" ? true : k.dusun.id === dusunId)),
    [dusunId, kader],
  );

  const last6 = useMemo(() => statistik.slice(-6), [statistik]);
  const stuntingSeries = useMemo(() => last6.map((x) => x.stunting), [last6]);
  const hipertensiSeries = useMemo(() => last6.map((x) => x.hipertensi), [last6]);
  const latest = statistik.length ? statistik[statistik.length - 1] : null;

  const periodeLabel = meta?.periode_terakhir
    ? formatBulanPanjangID(meta.periode_terakhir)
    : "-";

  if (loading || !meta || !leaflet || !latest || statistik.length === 0) {
    return <KesehatanSkeleton />;
  }

  return (
    <div className="space-y-6">
      <KesehatanHero
        periodeLabel={periodeLabel}
        sumber={meta.sumber}
        leafletPath={leaflet.path}
        latestStunting={latest.stunting}
        latestHipertensi={latest.hipertensi}
        jadwalCount={filteredJadwal.length}
        dusunCount={dusunList.length}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          <TrendSection
            desc={last6.map((x) => formatBulanPanjangID(x.bulan)).join(" • ")}
            latestStunting={latest.stunting}
            latestHipertensi={latest.hipertensi}
            stuntingSeries={stuntingSeries}
            hipertensiSeries={hipertensiSeries}
          />
          <IsuSection isuList={isuList} onSelect={setSelectedIsu} />
        </div>

        <div className="space-y-4">
          <ImtToolCard />
          <QuickGuideCard />
        </div>
      </div>

      <KaderSection kader={kaderFiltered} />

      <JadwalSection
        dusunOptions={dusunOptions}
        dusunId={dusunId}
        onDusunChange={setDusunId}
        q={q}
        onQueryChange={setQ}
        filteredJadwal={filteredJadwal}
      />

      <IsuModal
        isu={selectedIsu}
        open={!!selectedIsu}
        onClose={() => setSelectedIsu(null)}
        leafletPath={leaflet.path}
      />
    </div>
  );
}
