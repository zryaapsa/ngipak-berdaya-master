import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProdukPage from "./public/produk/ProdukPage";
import UmkmDetailPage from "./public/umkm/UmkmDetailPage";
import KesehatanPage from "./public/kesehatan/KesehatanPage";
import TentangPage from "./public/tentang/TentangPage";

import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";

import NotFoundPage from "./NotFoundPage";

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
      </Route>

      {/* ADMIN */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
