import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import FilterSelect from "../../../../components/ui/FilterSelect";
import SearchInput from "../../../../components/ui/SearchInput";
import SectionHeader from "../../../../components/ui/SectionHeader";

import Pill from "./Pill";
import ViewToggle from "./ViewToggle";
import type { KategoriOrAll, ViewMode } from "../utils/produk.utils";
import { kategoriLabel, kategoriUI } from "../utils/produk.utils";

export default function ProdukFilters({
  dusunId,
  setDusunId,
  kategori,
  onKategoriChange,
  q,
  setQ,
  view,
  setView,
  dusunOptions,
  activeDusunLabel,
  umkmCount,
  showActive,
  onReset,
}: {
  dusunId: string;
  setDusunId: (v: string) => void;
  kategori: KategoriOrAll;
  onKategoriChange: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  dusunOptions: { value: string; label: string }[];
  activeDusunLabel: string;
  umkmCount: number;
  showActive: boolean;
  onReset: () => void;
}) {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Cari UMKM"
        desc="Gunakan filter untuk mempercepat pencarian."
        right={
          <div className="flex items-center gap-3">
            <Badge variant="neutral">{umkmCount} UMKM</Badge>
            <ViewToggle value={view} onChange={setView} />
          </div>
        }
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <FilterSelect label="Dusun" value={dusunId} options={dusunOptions} onChange={setDusunId} />
        <FilterSelect label="Kategori" value={kategori} options={kategoriUI} onChange={onKategoriChange} />
        <SearchInput label="" placeholder="Cari UMKM / produk..." value={q} onChange={setQ} />
      </div>

      {showActive ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Filter aktif:</span>
          {dusunId !== "all" ? <Pill>Dusun: {activeDusunLabel}</Pill> : null}
          {kategori !== "all" ? <Pill>Kategori: {kategoriLabel(kategori)}</Pill> : null}
          {q.trim() ? <Pill>Cari: “{q.trim()}”</Pill> : null}

          <button
            type="button"
            onClick={onReset}
            className="ml-auto rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            Clear all
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
          <Pill>Tips: ketik kata “keripik”</Pill>
          <Pill>Gunakan dusun untuk warga lokal</Pill>
        </div>
      )}
    </Card>
  );
}
