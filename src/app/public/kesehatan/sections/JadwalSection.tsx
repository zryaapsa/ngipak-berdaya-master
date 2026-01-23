import type { JadwalKesehatan } from "../../../../features/kesehatan/public.types";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import FilterSelect from "../../../../components/ui/FilterSelect";
import SearchInput from "../../../../components/ui/SearchInput";
import SectionHeader from "../../../../components/ui/SectionHeader";
import JadwalItem from "./JadwalItem";

export default function JadwalSection({
  dusunOptions,
  dusunId,
  onDusunChange,
  q,
  onQueryChange,
  filteredJadwal,
}: {
  dusunOptions: { value: string; label: string }[];
  dusunId: string;
  onDusunChange: (v: string) => void;
  q: string;
  onQueryChange: (v: string) => void;
  filteredJadwal: JadwalKesehatan[];
}) {
  const preview = filteredJadwal.slice(0, 8);

  return (
    <Card className="p-4">
      <SectionHeader
        title="Jadwal Kegiatan Kesehatan"
        desc="Cari dan filter jadwal berdasarkan dusun."
        right={<Badge>{filteredJadwal.length} kegiatan</Badge>}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <FilterSelect
          label="Dusun"
          value={dusunId}
          options={dusunOptions}
          onChange={onDusunChange}
        />
        <SearchInput
          className="md:col-span-2"
          label=""
          placeholder="Cari kegiatan atau lokasi..."
          value={q}
          onChange={onQueryChange}
        />
      </div>

      {filteredJadwal.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <div className="font-semibold text-gray-900">Tidak ada jadwal.</div>
          <div className="mt-1 text-sm text-gray-600">
            Coba ubah pilihan dusun atau kata kunci pencarian.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {preview.map((j) => (
              <JadwalItem key={j.id} j={j} />
            ))}
          </div>

          {filteredJadwal.length > 8 ? (
            <div className="mt-3 text-xs text-gray-500">
              Menampilkan 8 terdekat. Jika perlu, kita tambah pagination / tombol “Tampilkan lebih banyak”.
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}