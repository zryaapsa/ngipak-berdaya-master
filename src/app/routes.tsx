import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProdukPage from "./public/ProdukPage";
import UmkmDetailPage from "./public/UmkmDetailPage";
import KesehatanPage from "./public/KesehatanPage";
import TentangPage from "./public/TentangPage";
import NotFoundPage from "./NotFoundPage";

import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/produk" replace />} />
        <Route path="/produk" element={<ProdukPage />} />
        <Route path="/umkm/:id" element={<UmkmDetailPage />} />
        <Route path="/kesehatan" element={<KesehatanPage />} />
        <Route path="/tentang" element={<TentangPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
