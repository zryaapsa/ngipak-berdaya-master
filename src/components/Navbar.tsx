import { NavLink, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo-ngipak.svg";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-brand-50 text-brand-900 ring-1 ring-brand-100"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  ].join(" ");
}

export default function Navbar() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  // Navbar public tidak muncul di area /admin
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        {/* Left: Logo + title */}
        <Link to="/produk" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Ngipak Berdaya"
            className="h-9 w-9 rounded-xl ring-1 ring-black/5"
          />
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-gray-900">
              Ngipak Berdaya
            </div>
            <div className="text-xs font-medium text-gray-500">
              Website Informasi Desa
            </div>
          </div>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/produk" className={navClass}>
            UMKM
          </NavLink>
          <NavLink to="/kesehatan" className={navClass}>
            Kesehatan
          </NavLink>
          <NavLink to="/tentang" className={navClass}>
            Tentang
          </NavLink>
        </nav>

        {/* Right: Admin */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/login"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-black"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t border-gray-100 bg-white md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
          <NavLink to="/produk" className={navClass}>
            UMKM
          </NavLink>
          <NavLink to="/kesehatan" className={navClass}>
            Kesehatan
          </NavLink>
          <NavLink to="/tentang" className={navClass}>
            Tentang
          </NavLink>
        </div>
      </div>
    </header>
  );
}
