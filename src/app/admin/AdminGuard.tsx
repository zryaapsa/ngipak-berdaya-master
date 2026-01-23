import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession, isAdmin } from "../../lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session) return setState("no");
        const ok = await isAdmin();
        setState(ok ? "ok" : "no");
      } catch {
        setState("no");
      }
    })();
  }, []);

  if (state === "loading") return null; // bisa diganti skeleton
  if (state === "no") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
