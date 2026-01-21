import { NavLink, Outlet } from "react-router-dom";

function SideItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "block rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-brand-50 text-brand-900 ring-1 ring-brand-100"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white">
              Ngipak Berdaya
            </div>
            <div className="text-sm font-semibold text-gray-700">Admin Panel</div>
          </div>

          <NavLink
            to="/produk"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Website
          </NavLink>
        </div>
      </div>

      {/* Shell */}
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-3">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </div>

          <nav className="space-y-1">
            <SideItem to="/admin" label="Dashboard" />
            {/* nanti: UMKM CRUD, Kesehatan, Dokumen, Users */}
            {/* <SideItem to="/admin/umkm" label="Kelola UMKM" /> */}
            {/* <SideItem to="/admin/kesehatan" label="Kelola Kesehatan" /> */}
          </nav>

          <div className="mt-4 border-t border-gray-100 pt-3">
            {/* nanti: tombol logout */}
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-gray-100 px-3 py-2 text-left text-sm font-semibold text-gray-400"
              title="Logout akan aktif setelah Supabase Auth diaktifkan"
            >
              Logout (belum aktif)
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
