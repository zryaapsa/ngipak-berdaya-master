import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getMyRole, signOut } from "../../lib/auth";

type Role = "admin" | "editor" | "viewer" | null;

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function SideItem({
  to,
  label,
  desc,
  end,
}: {
  to: string;
  label: string;
  desc?: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "group block rounded-2xl border px-3 py-3 transition",
          isActive
            ? "border-brand-200 bg-brand-50"
            : "border-transparent hover:border-gray-200 hover:bg-gray-50"
        )
      }
    >
      {({ isActive }) => (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className={cn(
                "text-sm font-semibold",
                isActive ? "text-brand-900" : "text-gray-900"
              )}
            >
              {label}
            </div>
            {desc ? (
              <div className="mt-0.5 truncate text-xs text-gray-500">{desc}</div>
            ) : null}
          </div>

          <span
            className={cn(
              "mt-0.5 inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold",
              isActive
                ? "bg-brand-100 text-brand-900"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
            )}
          >
            {isActive ? "Aktif" : "Buka"}
          </span>
        </div>
      )}
    </NavLink>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const label =
    role === "admin" ? "Admin" : role === "editor" ? "Editor" : role === "viewer" ? "Viewer" : "—";

  const cls =
    role === "admin"
      ? "bg-green-50 text-green-700 ring-green-200"
      : role === "editor"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-gray-50 text-gray-600 ring-gray-200";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1", cls)}>
      {label}
    </span>
  );
}

export default function AdminLayout() {
  const nav = useNavigate();
  const [role, setRole] = useState<Role>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingRole(true);
        const r = await getMyRole();
        if (!alive) return;
        setRole(r);
      } catch {
        if (!alive) return;
        setRole(null);
      } finally {
        if (alive) setLoadingRole(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onLogout = async () => {
    await signOut();
    nav("/login?next=/admin&require=admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl bg-gray-900 px-3 py-2 text-sm font-extrabold text-white">
              Ngipak Berdaya
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">Admin Panel</div>
              <div className="truncate text-xs text-gray-500">
                Kelola konten UMKM & Kesehatan dengan kontrol akses.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/produk"
              className="hidden rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
            >
              Lihat Website
            </NavLink>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center rounded-2xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Shell */}
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-3xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Menu Admin
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900">Navigasi</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-gray-500">Role</div>
              <div className="mt-1">
                {loadingRole ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                    memuat…
                  </span>
                ) : (
                  <RoleBadge role={role} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <SideItem to="/admin" label="Dashboard" desc="Ringkasan & shortcut" end />
            <SideItem to="/admin/umkm" label="Kelola UMKM" desc="Tambah/edit UMKM, publish/unpublish" />
            <SideItem to="/admin/produk" label="Kelola Produk" desc="Tambah/edit produk per UMKM" />
            <SideItem to="/admin/kesehatan" label="Kelola Kesehatan" desc="Update isu, statistik, jadwal, kader" />
            <SideItem to="/admin/laporan" label="Laporan Warga" desc="Request UMKM & laporan data" />
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-700">Catatan</div>
            <div className="mt-1 text-xs text-gray-600">
              Akses admin dibatasi oleh <span className="font-semibold">RLS</span> di Supabase. UI hanya
              guard tambahan.
            </div>
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
