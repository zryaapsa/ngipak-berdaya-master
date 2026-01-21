import BackButton from "../../components/ui/BackButton";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <BackButton to="/produk" label="Kembali" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Tentang Ngipak Berdaya</h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge>UMKM</Badge>
            <Badge>Kesehatan</Badge>
            <Badge>Informasi Desa</Badge>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-brand-900">
          Apa itu Ngipak Berdaya?
        </h2>
        <p className="mt-2 leading-relaxed text-gray-700">
          <strong>Ngipak Berdaya</strong> adalah platform informasi digital untuk mendukung
          potensi <strong>Desa Ngipak</strong>, khususnya dalam promosi{" "}
          <strong>UMKM lokal</strong> dan penyebaran <strong>informasi kesehatan</strong>.
          Website ini dirancang agar warga dan pengunjung dapat menemukan produk UMKM dan
          menghubungi pelaku usaha melalui WhatsApp secara mudah.
        </p>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">Tujuan utama</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Memperluas akses informasi UMKM dan produk unggulan desa.</li>
            <li>Memudahkan komunikasi pemesanan melalui WhatsApp.</li>
            <li>Menyajikan informasi kesehatan yang ringkas dan mudah dipahami.</li>
          </ul>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Dikembangkan oleh Tim <strong>KKN-T 35 Universitas Duta Bangsa Surakarta</strong>{" "}
          (Periode 2025/2026) sebagai bagian dari program pengabdian masyarakat.
        </p>
      </Card>

      <Card className="border-l-4 border-l-green-500 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Panduan Pendaftaran UMKM Baru
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Bagi warga Desa Ngipak yang memiliki usaha dan ingin ditampilkan di website ini,
          ikuti langkah berikut:
        </p>

        <ul className="mt-4 space-y-3">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              1
            </span>
            <span className="text-gray-700">
              Siapkan foto produk yang jelas (minimal 1–3 foto) dan deskripsi singkat usaha.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              2
            </span>
            <span className="text-gray-700">
              Pastikan nomor WhatsApp aktif untuk menerima pesan dari calon pembeli.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              3
            </span>
            <div className="text-gray-700">
              Hubungi admin/pengelola website (perangkat desa bidang informasi) untuk
              pengajuan data UMKM.
              <div className="mt-2 rounded-xl border border-green-100 bg-green-50 p-3">
                <div className="text-xs font-semibold text-green-800">
                  Kontak Admin (isi sesuai data resmi desa)
                </div>
                <div className="mt-1 text-sm font-semibold text-green-700">
                  Pak Admin — 08xx-xxxx-xxxx
                </div>
                <div className="mt-1 text-xs text-green-700/80">
                  Jam layanan: Senin–Jumat (08.00–15.00)
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div className="mt-4 text-xs text-gray-500">
          Catatan: data yang masuk akan diverifikasi sebelum ditampilkan.
        </div>
      </Card>
    </div>
  );
}
