export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-gray-900">
            Desa Ngipak
          </div>
          <div className="text-sm text-gray-600">
            Copyright © 2026 Desa Ngipak. All rights reserved.
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Made by Kelompok KKN-T 35 Universitas Duta Bangsa Surakarta.
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Catatan: Data dan informasi pada website ini dapat diperbarui oleh admin/pengelola
          sesuai kebutuhan desa.
        </div>
      </div>
    </footer>
  );
}
