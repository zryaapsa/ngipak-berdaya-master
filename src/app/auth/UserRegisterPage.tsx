import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signUp } from "../../lib/auth";

function getQueryParam(search: string, key: string): string | null {
  const sp = new URLSearchParams(search);
  return sp.get(key);
}

function getNextFromState(state: unknown): string | undefined {
  if (!state || typeof state !== "object") return undefined;
  if (!("next" in state)) return undefined;

  const next = (state as { next?: unknown }).next;
  return typeof next === "string" ? next : undefined;
}

export default function UserRegisterPage() {
  const nav = useNavigate();
  const loc = useLocation();

  const next = useMemo(() => {
    const qNext = getQueryParam(loc.search, "next");
    const sNext = getNextFromState(loc.state);
    return qNext || sNext || "/produk";
  }, [loc.search, loc.state]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    const em = email.trim();
    const pw = password.trim();
    const pw2 = password2.trim();

    if (!em || !pw) {
      setErr("Email dan password wajib diisi.");
      return;
    }
    if (pw.length < 6) {
      setErr("Password minimal 6 karakter.");
      return;
    }
    if (pw !== pw2) {
      setErr("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(em, pw);

      // kalau email confirmation aktif, session bisa null
      if (res.session) {
        nav(next, { replace: true });
      } else {
        setInfo("Akun dibuat. Jika diminta verifikasi email, cek inbox lalu login.");
        nav(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      }
    } catch (e: unknown) {
      let message = "Gagal daftar.";
      if (e instanceof Error) message = e.message;
      else if (typeof e === "string") message = e;
      else if (e && typeof e === "object" && "message" in e) {
        const m = (e as { message?: unknown }).message;
        if (typeof m === "string") message = m;
      }
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold text-gray-900">Daftar</h1>
        <p className="mt-1 text-sm text-gray-600">
          Buat akun untuk mengirim laporan/request.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-600">Email</div>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
              placeholder="nama@email.com"
              autoComplete="username"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Password</div>
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
              placeholder="minimal 6 karakter"
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Konfirmasi Password</div>
            <input
              type="password"
              value={password2}
              onChange={(ev) => setPassword2(ev.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-brand-300 focus:ring-brand-100"
              placeholder="ulang password"
              autoComplete="new-password"
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          {info && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Buat Akun"}
          </button>

          <div className="pt-2 text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              className="font-semibold text-brand-700 hover:underline"
              to={`/login?next=${encodeURIComponent(next)}`}
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
