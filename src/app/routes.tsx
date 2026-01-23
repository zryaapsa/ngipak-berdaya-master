import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProdukPage from "./public/produk/ProdukPage";
import UmkmDetailPage from "./public/umkm/UmkmDetailPage";
import KesehatanPage from "./public/kesehatan/KesehatanPage";
import TentangPage from "./public/tentang/TentangPage";

import DashboardPage from "./admin/DashboardPage";
import AdminGuard from "./admin/AdminGuard";
import AdminLaporanPage from "./admin/laporan/AdminLaporanPage";

import AdminUmkmListPage from "./admin/umkm/AdminUmkmListPage";
import AdminUmkmFormPage from "./admin/umkm/AdminUmkmFormPage";
import AdminUmkmProdukPage from "./admin/umkm/AdminUmkmProdukPage";

import AdminKesehatanPage from "./admin/kesehatan/AdminKesehatanPage";
import AdminKaderPage from "./admin/kesehatan/AdminKaderPage";
import AdminJadwalPage from "./admin/kesehatan/AdminJadwalPage";

import UserLoginPage from "./auth/UserLoginPage";
import UserRegisterPage from "./auth/UserRegisterPage";

import NotFoundPage from "./NotfoundPage";

function AdminPlaceholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="text-xl font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        Halaman ini belum diimplementasikan. Step berikutnya: buat CRUD + koneksi API
        Supabase (admin-only).
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/produk" replace />} />
        <Route path="/produk" element={<ProdukPage />} />
        <Route path="/umkm/:id" element={<UmkmDetailPage />} />
        <Route path="/kesehatan" element={<KesehatanPage />} />
        <Route path="/tentang" element={<TentangPage />} />

        {/* AUTH */}
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/register" element={<UserRegisterPage />} />
      </Route>

      {/* ADMIN REDIRECT */}
      <Route
        path="/admin/login"
        element={<Navigate to="/login?next=/admin&require=admin" replace />}
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Laporan */}
        <Route path="laporan" element={<AdminLaporanPage />} />

        {/* UMKM */}
        <Route path="umkm" element={<AdminUmkmListPage />} />
        <Route path="umkm/new" element={<AdminUmkmFormPage />} />
        <Route path="umkm/:id/edit" element={<AdminUmkmFormPage />} />
        <Route path="umkm/:id/produk" element={<AdminUmkmProdukPage />} />

        {/* Produk (opsional global) */}
        <Route
          path="produk"
          element={
            <AdminPlaceholder
              title="Kelola Produk"
              desc="CRUD Produk per UMKM + publish/unpublish. (Opsional) Nanti bisa dibuat halaman produk global."
            />
          }
        />

        {/* Kesehatan */}
        <Route path="kesehatan" element={<AdminKesehatanPage />} />
        <Route path="kesehatan/kader" element={<AdminKaderPage />} />
        <Route path="kesehatan/jadwal" element={<AdminJadwalPage />} />

        {/* fallback admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
