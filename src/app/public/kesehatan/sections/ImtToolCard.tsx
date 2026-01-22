import { useState } from "react";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";
import Input from "../../../../components/ui/Input";

export default function ImtToolCard() {
  const [beratBadanKg, setBeratBadanKg] = useState("");
  const [tinggiBadanCm, setTinggiBadanCm] = useState("");
  const [hasil, setHasil] = useState<{
    nilai: number;
    kategori: string;
    cls: string;
  } | null>(null);

  const invalidBerat =
    beratBadanKg.trim() !== "" &&
    (Number.isNaN(Number(beratBadanKg)) || Number(beratBadanKg) <= 0);

  const invalidTinggi =
    tinggiBadanCm.trim() !== "" &&
    (Number.isNaN(Number(tinggiBadanCm)) || Number(tinggiBadanCm) <= 0);

  const hitung = () => {
    const berat = parseFloat(beratBadanKg);
    const tinggiM = parseFloat(tinggiBadanCm) / 100;
    if (!berat || !tinggiM) return;

    const nilai = berat / (tinggiM * tinggiM);
    const nilaiRounded = Math.round(nilai * 10) / 10;

    if (nilai < 18.5)
      return setHasil({
        nilai: nilaiRounded,
        kategori: "Berat badan kurang",
        cls: "text-yellow-700 bg-yellow-50 ring-1 ring-yellow-100",
      });
    if (nilai < 25)
      return setHasil({
        nilai: nilaiRounded,
        kategori: "Berat badan normal",
        cls: "text-green-700 bg-green-50 ring-1 ring-green-100",
      });
    if (nilai < 30)
      return setHasil({
        nilai: nilaiRounded,
        kategori: "Berat badan berlebih",
        cls: "text-orange-700 bg-orange-50 ring-1 ring-orange-100",
      });

    return setHasil({
      nilai: nilaiRounded,
      kategori: "Obesitas",
      cls: "text-red-700 bg-red-50 ring-1 ring-red-100",
    });
  };

  return (
    <Card className="p-4">
      <SectionHeader
        title="Cek Indeks Massa Tubuh (Dewasa)"
        desc="Alat edukasi cepat. Bukan pengganti pemeriksaan tenaga kesehatan."
        right={<Badge>Alat</Badge>}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Input
          type="number"
          placeholder="Berat badan (kg)"
          value={beratBadanKg}
          onChange={(e) => setBeratBadanKg(e.target.value)}
          invalid={invalidBerat}
        />
        <Input
          type="number"
          placeholder="Tinggi badan (cm)"
          value={tinggiBadanCm}
          onChange={(e) => setTinggiBadanCm(e.target.value)}
          invalid={invalidTinggi}
        />
      </div>

      <button
        type="button"
        onClick={hitung}
        className="mt-3 h-11 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Hitung
      </button>

      {hasil ? (
        <div className={`mt-3 rounded-xl p-3 text-center ${hasil.cls}`}>
          <div className="text-sm font-semibold">Hasil: {hasil.nilai}</div>
          <div className="text-xs font-medium">{hasil.kategori}</div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-gray-500">
          Isi berat badan dan tinggi badan untuk melihat hasil.
        </div>
      )}
    </Card>
  );
}
