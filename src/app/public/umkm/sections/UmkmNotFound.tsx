import Card from "../../../../components/ui/Card";
import UmkmTopBar from "./UmkmTopBar";

export default function UmkmNotFound() {
  return (
    <div className="space-y-4">
      <UmkmTopBar />
      <Card className="p-6">
        <div className="font-semibold text-gray-900">UMKM tidak ditemukan.</div>
        <div className="mt-1 text-sm text-gray-600">
          Kembali ke Direktori UMKM untuk melihat daftar.
        </div>
      </Card>
    </div>
  );
}
