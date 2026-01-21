import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Placeholder dulu: nanti diganti Supabase Auth
    if (email.trim() && password.trim()) {
      nav("/admin", { replace: true });
      return;
    }

    alert("Email dan password wajib diisi.");
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold text-gray-900">Admin Login</h1>
        <p className="mt-1 text-sm text-gray-600">
          Masuk untuk mengelola data UMKM & kesehatan.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-600">Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
              placeholder="admin@ngipak.id"
              autoComplete="username"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-11 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Masuk
          </button>

          <div className="pt-2 text-xs text-gray-500">
            Catatan: ini sementara (tanpa Supabase Auth). Nanti kita kunci dengan
            session + RLS.
          </div>
        </form>
      </div>
    </div>
  );
}
