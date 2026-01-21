import { Link } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-8">
        <div className="text-2xl font-semibold text-gray-900">404</div>
        <div className="mt-2 text-lg font-semibold text-gray-900">
          Halaman tidak ditemukan
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Tautan yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/produk">
            <Button>Ke Direktori UMKM</Button>
          </Link>
          <Link to="/kesehatan">
            <Button variant="secondary">Info Kesehatan</Button>
          </Link>
        </div>
      </Card>

      <div className="text-xs text-gray-500">
        Jika Anda merasa ini kesalahan, silakan hubungi admin/pengelola website.
      </div>
    </div>
  );
}
