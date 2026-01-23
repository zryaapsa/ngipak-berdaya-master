import { useCallback, useEffect, useRef, useState } from "react";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type InternalState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function useConfirmDialog() {
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const [st, setSt] = useState<InternalState>({
    open: false,
    title: "Konfirmasi",
    message: "Lanjutkan?",
    confirmText: "Ya",
    cancelText: "Batal",
    danger: false,
  });

  const close = useCallback((ans: boolean) => {
    const r = resolveRef.current;
    resolveRef.current = null;
    setSt((p) => ({ ...p, open: false }));
    r?.(ans);
  }, []);

  const confirm = useCallback((opts?: ConfirmOptions) => {
    // Kalau ada dialog sebelumnya yang masih menggantung, tutup dan resolve false
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setSt({
        open: true,
        title: opts?.title ?? "Konfirmasi",
        message: opts?.message ?? "Lanjutkan?",
        confirmText: opts?.confirmText ?? "Ya",
        cancelText: opts?.cancelText ?? "Batal",
        danger: opts?.danger ?? false,
      });
    });
  }, []);

  function ConfirmDialog() {
    // ESC + lock scroll
    useEffect(() => {
      if (!st.open) return;

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close(false);
      };

      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
      };
    }, [st.open, close]);

    if (!st.open) return null;

    return (
      <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          onClick={() => close(false)}
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-white/95 p-4 backdrop-blur">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-gray-900">
                  {st.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => close(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Tutup"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {st.message ? (
                <div className="text-sm leading-relaxed text-gray-700">
                  {st.message}
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {st.cancelText}
                </button>

                <button
                  type="button"
                  onClick={() => close(true)}
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                    st.danger
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-gray-900 hover:bg-gray-800"
                  )}
                >
                  {st.confirmText}
                </button>
              </div>
            </div>

            <div className="h-2" />
          </div>
        </div>
      </div>
    );
  }

  return { confirm, ConfirmDialog };
}