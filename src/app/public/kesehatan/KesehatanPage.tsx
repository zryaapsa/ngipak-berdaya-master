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
} from "../../../features/kesehatan";

import type {
  IsuKesehatan,
  JadwalKesehatan,
  Kader,
  LeafletLink,
  MetaKesehatan,
  StatistikBulanan,
} from "../../../features/kesehatan/public.types";

import { formatBulanPanjangID } from "./utils/kesehatan.utils";
import { toErrMessage } from "../../../lib/error";

import KesehatanSkeleton from "./sections/KesehatanSkeleton";
import KesehatanHero from "./sections/KesehatanHero";
import TrendSection from "./sections/TrendSection";
import IsuSection from "./sections/IsuSection";
import ImtToolCard from "./sections/ImtToolCard";
import QuickGuideCard from "./sections/QuickGuideCard";
import KaderSection from "./sections/KaderSection";
import JadwalSection from "./sections/JadwalSection";
import IsuModal from "./sections/IsuModal";

type WarnState = Partial<Record<
  "dusun" | "jadwal" | "kader" | "isu" | "statistik" | "meta" | "leaflet",
  string
>>;

function unwrapSettled<T>(r: PromiseSettledResult<T>): { ok: true; value: T } | { ok: false; error: unknown } {
  return r.status === "fulfilled" ? { ok: true, value: r.value } : { ok: false, error: r.reason };
}

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
  const [warn, setWarn] = useState<WarnState>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      setWarn({});
      setLoading(true);

      // Dusun (pisah)
      try {
        const d = await listDusun();
        if (!alive) return;
        setDusunList(d);
      } catch (e: unknown) {
        if (!alive) return;
        setWarn((p) => ({ ...p, dusun: toErrMessage(e) }));
      }

      try {
        const results = await Promise.allSettled([
          listJadwalKesehatan(),
          listKader(),
          listIsuKesehatan(),
          listStatistikBulanan(),
          getMetaKesehatan(),
          getLeafletKesehatan(),
        ]);

        if (!alive) return;

        const rJ = unwrapSettled(results[0] as PromiseSettledResult<JadwalKesehatan[]>);
        const rK = unwrapSettled(results[1] as PromiseSettledResult<Kader[]>);
        const rI = unwrapSettled(results[2] as PromiseSettledResult<IsuKesehatan[]>);
        const rS = unwrapSettled(results[3] as PromiseSettledResult<StatistikBulanan[]>);
        const rM = unwrapSettled(results[4] as PromiseSettledResult<MetaKesehatan | null>);
        const rL = unwrapSettled(results[5] as PromiseSettledResult<LeafletLink | null>);

        if (rJ.ok) setJadwal(rJ.value);
        else setWarn((p) => ({ ...p, jadwal: toErrMessage(rJ.error) }));

        if (rK.ok) setKader(rK.value);
        else setWarn((p) => ({ ...p, kader: toErrMessage(rK.error) }));

        if (rI.ok) setIsuList(rI.value);
        else setWarn((p) => ({ ...p, isu: toErrMessage(rI.error) }));

        if (rS.ok) setStatistik(rS.value);
        else setWarn((p) => ({ ...p, statistik: toErrMessage(rS.error) }));

        if (rM.ok) setMeta(rM.value);
        else setWarn((p) => ({ ...p, meta: toErrMessage(rM.error) }));

        if (rL.ok) setLeaflet(rL.value);
        else setWarn((p) => ({ ...p, leaflet: toErrMessage(rL.error) }));
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
        return `${j.kegiatan} ${j.dusun.nama} ${j.lokasi ?? ""}`.toLowerCase().includes(query);
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

  const periodeLabel = meta?.periode_terakhir ? formatBulanPanjangID(meta.periode_terakhir) : "-";
  const leafletPath = leaflet?.path ?? "";

  const hasHero = !!meta && !!latest && statistik.length > 0;
  const hasTrend = statistik.length > 0 && last6.length > 0;
  const hasIsu = isuList.length > 0;
  const hasKader = kaderFiltered.length > 0;

  const readiness = useMemo(() => {
    const missing: string[] = [];
    if (!meta) missing.push("Meta (Hero)");
    if (statistik.length === 0) missing.push("Statistik");
    if (!leafletPath) missing.push("Leaflet");
    if (isuList.length === 0) missing.push("Isu");
    if (jadwal.length === 0) missing.push("Jadwal");
    if (kader.length === 0) missing.push("Kader");
    return missing;
  }, [meta, statistik.length, leafletPath, isuList.length, jadwal.length, kader.length]);

  const warnText = useMemo(() => {
    const parts: string[] = [];
    if (warn.dusun) parts.push(`Dusun: ${warn.dusun}`);
    if (warn.meta) parts.push(`Meta: ${warn.meta}`);
    if (warn.statistik) parts.push(`Statistik: ${warn.statistik}`);
    if (warn.isu) parts.push(`Isu: ${warn.isu}`);
    if (warn.kader) parts.push(`Kader: ${warn.kader}`);
    if (warn.jadwal) parts.push(`Jadwal: ${warn.jadwal}`);
    if (warn.leaflet) parts.push(`Leaflet: ${warn.leaflet}`);
    return parts.join(" | ");
  }, [warn]);

  if (loading) return <KesehatanSkeleton />;

  return (
    <div className="space-y-6">
      {warnText ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Debug: {warnText}
        </div>
      ) : null}

      {readiness.length ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Konten kesehatan belum lengkap</div>
          <div className="mt-1 text-sm text-gray-600">
            Modul yang belum tersedia / belum dipublish:{" "}
            <span className="font-semibold">{readiness.join(", ")}</span>.
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Ini bukan error UI. Admin bisa melengkapi lewat menu <span className="font-semibold">Kelola Kesehatan</span>.
          </div>
        </div>
      ) : null}

      {hasHero ? (
        <KesehatanHero
          periodeLabel={periodeLabel}
          sumber={meta!.sumber}
          leafletPath={leafletPath}
          latestStunting={latest!.stunting}
          latestHipertensi={latest!.hipertensi}
          jadwalCount={filteredJadwal.length}
          dusunCount={dusunList.length}
        />
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="text-xl font-semibold text-gray-900">Informasi Kesehatan Desa Ngipak</div>
          <div className="mt-2 text-sm text-gray-600">
            Data utama (hero & trend) belum tersedia. Namun bagian isu/jadwal/kader tetap bisa ditampilkan.
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          {hasTrend ? (
            <TrendSection
              desc={last6.map((x) => formatBulanPanjangID(x.bulan)).join(" • ")}
              latestStunting={latest?.stunting ?? 0}
              latestHipertensi={latest?.hipertensi ?? 0}
              stuntingSeries={stuntingSeries}
              hipertensiSeries={hipertensiSeries}
            />
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="text-sm font-semibold text-gray-900">Trend 6 Bulan</div>
              <div className="mt-2 text-sm text-gray-600">Belum ada statistik bulanan yang dipublish.</div>
            </div>
          )}

          {hasIsu ? (
            <IsuSection isuList={isuList} onSelect={setSelectedIsu} />
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="text-lg font-semibold text-gray-900">Isu Kesehatan yang Perlu Dipahami</div>
              <div className="mt-2 text-sm text-gray-600">Belum ada topik isu yang dipublish.</div>
              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Tujuan halaman ini: membantu warga memahami informasi dasar dan memilih langkah yang tepat.
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ImtToolCard />
          <QuickGuideCard />
        </div>
      </div>

      {hasKader ? <KaderSection kader={kaderFiltered} /> : null}

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
        leafletPath={leafletPath}
      />
    </div>
  );
}
