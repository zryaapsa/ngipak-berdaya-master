import { useNavigate } from "react-router-dom";
import { signOut } from "../../../src/lib/auth";

export default function DashboardPage() {
  const nav = useNavigate();

  const onLogout = async () => {
    await signOut();
    nav("/admin/login", { replace: true });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola data UMKM, kesehatan, dan laporan warga.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/laporan"
          className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50"
        >
          <div className="text-sm font-semibold text-gray-900">Laporan Warga</div>
          <div className="mt-1 text-xs text-gray-600">
            Request UMKM baru & lapor data salah.
          </div>
        </a>
      </div>
    </div>
  );
}
