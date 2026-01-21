import { useEffect, useMemo, useState } from "react";

import { listDusun } from "../../features/umkm/api";
import type { Dusun } from "../../features/umkm/types";

import {
  getLeafletKesehatan,
  getMetaKesehatan,
  listIsuKesehatan,
  listJadwalKesehatan,
  listKader,
  listStatistikBulanan,
} from "../../features/kesehatan/api";
import type {
  IsuKesehatan,
  JadwalKesehatan,
  Kader,
  LeafletLink,
  MetaKesehatan,
  StatistikBulanan,
} from "../../features/kesehatan/types";

import { formatTanggalID } from "../../lib/date";
import { toWaLink } from "../../lib/wa";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import Modal from "../../components/ui/Modal";
import SectionHeader from "../../components/ui/SectionHeader";
import StatTile from "../../components/ui/StatTile";

function formatBulanID(ym: string) {
  const [y, m] = ym.split("-");
  const map: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "Mei",
    "06": "Jun",
    "07": "Jul",
    "08": "Agu",
    "09": "Sep",
    "10": "Okt",
    "11": "Nov",
    "12": "Des",
  };
  return `${map[m] ?? m} ${y}`;
}

function TrendPill({ series }: { series: number[] }) {
  if (series.length < 2) return null;
  const a = series[series.length - 2];
  const b = series[series.length - 1];
  const diff = b - a;
  const same = diff === 0;

  const cls = same
    ? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
    : diff > 0
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : "bg-green-50 text-green-700 ring-1 ring-green-100";

  const label = same ? "Stabil" : diff > 0 ? `Naik +${diff}` : `Turun ${diff}`;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function MiniLineChart({
  values,
  height = 90,
  width = 260,
}: {
  values: number[];
  height?: number;
  width?: number;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);

  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const d = pts
    .map(
      ([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(" ");

  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
      <path d={area} fill="currentColor" opacity="0.10" />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3.5"
          fill="currentColor"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

function SeverityBadge({ id }: { id: string }) {
  const sev = id === "stunting" || id === "hipertensi" ? "Tinggi" : "Sedang";

  const cls =
    sev === "Tinggi"
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        cls,
      ].join(" ")}
    >
      {sev}
    </span>
  );
}

function IsuIcon({ id }: { id: string }) {
  if (id === "stunting") return <span className="text-2xl">👶</span>;
  if (id === "hipertensi") return <span className="text-2xl">💓</span>;
  return <span className="text-2xl">🍃</span>;
}

function DocumentCard({ leaflet }: { leaflet: LeafletLink }) {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Dokumen Edukasi"
        desc="Leaflet kesehatan (PDF) untuk dibagikan saat kegiatan."
        right={<Badge>PDF</Badge>}
      />

      <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{leaflet.label}</div>
            <div className="mt-1 text-xs text-gray-600">{leaflet.path}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a href={leaflet.path} target="_blank" rel="noreferrer">
                <Button>Unduh / Buka PDF</Button>
              </a>
              <a href={leaflet.path} target="_blank" rel="noreferrer">
                <Button variant="secondary">Bagikan Link</Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: buka di browser HP lalu “download” agar mudah dibagikan.
      </div>
    </Card>
  );
}

function CekIMT() {
  const [bb, setBb] = useState("");
  const [tb, setTb] = useState("");
  const [hasil, setHasil] = useState<{
    imt: number;
    status: string;
    cls: string;
  } | null>(null);

  const hitung = () => {
    const b = parseFloat(bb);
    const t = parseFloat(tb) / 100;
    if (!b || !t) return;

    const imt = b / (t * t);
    const imtRounded = Math.round(imt * 10) / 10;

    if (imt < 18.5)
      return setHasil({
        imt: imtRounded,
        status: "Berat Kurang",
        cls: "text-yellow-700 bg-yellow-50 ring-1 ring-yellow-100",
      });
    if (imt < 25)
      return setHasil({
        imt: imtRounded,
        status: "Normal",
        cls: "text-green-700 bg-green-50 ring-1 ring-green-100",
      });
    if (imt < 30)
      return setHasil({
        imt: imtRounded,
        status: "Kelebihan Berat",
        cls: "text-orange-700 bg-orange-50 ring-1 ring-orange-100",
      });
    return setHasil({
      imt: imtRounded,
      status: "Obesitas",
      cls: "text-red-700 bg-red-50 ring-1 ring-red-100",
    });
  };

  return (
    <Card className="p-4">
      <SectionHeader
        title="Cek IMT (Dewasa)"
        desc="Edukasi cepat, bukan diagnosis."
        right={<Badge>Tools</Badge>}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Berat (kg)"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-brand-300 focus:ring-brand-100"
          value={bb}
          onChange={(e) => setBb(e.target.value)}
        />
        <input
          type="number"
          placeholder="Tinggi (cm)"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-brand-300 focus:ring-brand-100"
          value={tb}
          onChange={(e) => setTb(e.target.value)}
        />
      </div>

      <button
        onClick={hitung}
        className="mt-3 h-11 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Hitung
      </button>

      {hasil ? (
        <div className={`mt-3 rounded-xl p-3 text-center ${hasil.cls}`}>
          <div className="text-sm font-semibold">IMT: {hasil.imt}</div>
          <div className="text-xs font-medium">Kategori: {hasil.status}</div>
        </div>
      ) : null}
    </Card>
  );
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

  useEffect(() => {
    let alive = true;

    (async () => {
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

  if (!meta || !leaflet || statistik.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-700">
        Memuat data kesehatan...
      </div>
    );
  }

  const last6 = statistik.slice(-6);
  const months = last6.map((x) => x.bulan);
  const stuntingSeries = last6.map((x) => x.stunting);
  const hipertensiSeries = last6.map((x) => x.hipertensi);
  const latest = statistik[statistik.length - 1];

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-noise-soft" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold">Informasi Kesehatan Desa Ngipak</h1>
            <p className="mt-2 text-white/80">
              Ringkasan isu kesehatan, tren data (dummy), jadwal posyandu, dan dokumen edukasi.
            </p>
            <p className="mt-3 text-xs text-white/70">
              Periode: {meta.periode_terakhir} • Sumber: {meta.sumber}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={leaflet.path} target="_blank" rel="noreferrer">
              <Button variant="secondary">Unduh Leaflet PDF</Button>
            </a>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Stunting (terbaru)" value={latest.stunting} icon={<span className="text-lg">👶</span>} />
          <StatTile label="Hipertensi (terbaru)" value={latest.hipertensi} icon={<span className="text-lg">💓</span>} />
          <StatTile label="Jadwal (filter)" value={filteredJadwal.length} />
          <StatTile label="Dusun" value={dusunList.length} />
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        {/* KIRI */}
        <div className="space-y-4">
          {/* Tren */}
          <Card className="p-4">
            <SectionHeader
              title="Tren 6 Bulan Terakhir"
              desc={months.map(formatBulanID).join(" • ")}
              right={<Badge>Dummy</Badge>}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Stunting</div>
                    <div className="mt-1 text-xs text-gray-600">Jumlah kasus (dummy)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendPill series={stuntingSeries} />
                    <span className="text-sm font-bold text-gray-900">{latest.stunting}</span>
                  </div>
                </div>
                <div className="mt-4 text-brand-700">
                  <MiniLineChart values={stuntingSeries} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Hipertensi</div>
                    <div className="mt-1 text-xs text-gray-600">Jumlah kasus (dummy)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendPill series={hipertensiSeries} />
                    <span className="text-sm font-bold text-gray-900">{latest.hipertensi}</span>
                  </div>
                </div>
                <div className="mt-4 text-brand-700">
                  <MiniLineChart values={hipertensiSeries} />
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Catatan: angka ini dummy untuk simulasi UI.
            </div>
          </Card>

          {/* Isu */}
          <Card className="p-4">
            <SectionHeader
              title="Isu Kesehatan Utama"
              desc="Ringkasan isu prioritas dan tindakan yang disarankan."
              right={<Badge>{isuList.length} isu</Badge>}
            />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {isuList.map((isu) => (
                <button
                  key={isu.id}
                  onClick={() => setSelectedIsu(isu)}
                  className={[
                    "group rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition",
                    "hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-100",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-xl bg-brand-50 p-2 text-brand-800 ring-1 ring-brand-100">
                      <IsuIcon id={isu.id} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {isu.judul}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <div className="text-xs text-gray-500">Prioritas desa</div>
                        <SeverityBadge id={isu.id} />
                      </div>

                      <div className="mt-3 min-h-[3.25rem] text-sm text-gray-700 line-clamp-2">
                        {isu.ringkas}
                      </div>

                      <div className="mt-3 text-xs font-semibold text-brand-700">
                        Baca detail →
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* KANAN */}
        <div className="space-y-4">
          <DocumentCard leaflet={leaflet} />
          <CekIMT />
        </div>
      </div>

      {/* Kontak Kader */}
      <Card className="p-4">
        <SectionHeader
          title="Kontak Kader"
          desc="Chat untuk info posyandu & imunisasi."
          right={<Badge>{kaderFiltered.length}</Badge>}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {kaderFiltered.map((k) => (
            <div key={k.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{k.nama}</div>
                  <div className="mt-1 text-sm text-gray-600">{k.dusun.nama}</div>
                </div>
                <Badge>{k.dusun.nama}</Badge>
              </div>

              <a
                href={toWaLink(k.no_wa, "Halo Bu Kader, saya ingin tanya jadwal posyandu.")}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block h-11 w-full rounded-xl bg-green-50 py-2 text-center text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                WhatsApp
              </a>
            </div>
          ))}

          {kaderFiltered.length === 0 ? (
            <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
              Kontak kader belum tersedia untuk filter ini.
            </div>
          ) : null}
        </div>
      </Card>

      {/* Jadwal */}
      <Card className="p-4">
        <SectionHeader
          title="Jadwal Kegiatan Kesehatan"
          desc="Filter per dusun dan cari kegiatan/lokasi."
          right={<Badge>{filteredJadwal.length} jadwal</Badge>}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Dusun"
            value={dusunId}
            options={dusunOptions}
            onChange={setDusunId}
          />
          <SearchInput
            className="md:col-span-2"
            label=""
            placeholder="Cari kegiatan / lokasi..."
            value={q}
            onChange={setQ}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {filteredJadwal.slice(0, 8).map((j) => (
            <Card key={j.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{j.kegiatan}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatTanggalID(j.tanggal)}
                    {j.jam_mulai
                      ? ` • ${j.jam_mulai}${j.jam_selesai ? `-${j.jam_selesai}` : ""}`
                      : ""}
                  </div>
                  {j.lokasi ? (
                    <div className="mt-1 text-sm text-gray-600">{j.lokasi}</div>
                  ) : null}
                  {j.catatan ? (
                    <div className="mt-2 text-sm text-gray-700">{j.catatan}</div>
                  ) : null}
                </div>
                <Badge>{j.dusun.nama}</Badge>
              </div>
            </Card>
          ))}

          {filteredJadwal.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="font-semibold text-gray-900">Tidak ada jadwal.</div>
              <div className="mt-1 text-sm text-gray-600">
                Coba ganti filter atau kata kunci.
              </div>
            </div>
          ) : null}
        </div>

        {filteredJadwal.length > 8 ? (
          <div className="mt-3 text-xs text-gray-500">
            Menampilkan 8 teratas (urut tanggal). Bisa ditambah pagination nanti.
          </div>
        ) : null}
      </Card>

      {/* Modal isu */}
      <Modal
        open={!!selectedIsu}
        onClose={() => setSelectedIsu(null)}
        title={selectedIsu?.judul}
      >
        {selectedIsu ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Ringkasan</div>
              <SeverityBadge id={selectedIsu.id} />
            </div>

            <p className="text-gray-800">{selectedIsu.ringkas}</p>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">Upaya Desa</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {selectedIsu.upayaDesa.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Dampak</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {selectedIsu.dampak.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Aksi Warga</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {selectedIsu.aksiWarga.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            <a href={leaflet.path} target="_blank" rel="noreferrer">
              <Button className="w-full">Unduh Leaflet PDF</Button>
            </a>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
