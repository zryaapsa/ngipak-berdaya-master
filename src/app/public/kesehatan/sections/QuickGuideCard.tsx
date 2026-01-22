import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import SectionHeader from "../../../../components/ui/SectionHeader";

export default function QuickGuideCard() {
  return (
    <Card className="p-4">
      <SectionHeader
        title="Panduan Cepat untuk Warga"
        desc="Ringkas, mudah dipahami, dan bisa ditindaklanjuti."
        right={<Badge>Edukasi</Badge>}
      />

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="font-semibold text-gray-900">
            Jika ingin cek tekanan darah
          </div>
          <div className="mt-1">
            Usahakan cek rutin (misalnya sebulan sekali). Jika sering pusing,
            mudah lelah, atau ada riwayat keluarga, sebaiknya lebih rutin.
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="font-semibold text-gray-900">Jika punya balita</div>
          <div className="mt-1">
            Datang ke posyandu agar berat dan tinggi anak tercatat. Data ini penting
            untuk memantau pertumbuhan dan mencegah masalah gizi sedini mungkin.
          </div>
        </div>
      </div>
    </Card>
  );
}
