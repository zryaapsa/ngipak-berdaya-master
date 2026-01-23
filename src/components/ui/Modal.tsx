import { useEffect, useId, useRef } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-3xl";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // ESC + lock body scroll + focus panel
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    // focus panel after paint
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          className={[
            "w-full",
            maxWidth,
            "overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10",
          ].join(" ")}
        >
          {/* Header (sticky) */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white/95 p-4 backdrop-blur">
            <div className="min-w-0">
              {title ? (
                <div
                  id={titleId}
                  className="truncate text-base font-semibold text-gray-900"
                >
                  {title}
                </div>
              ) : (
                <div className="text-base font-semibold text-gray-900">
                  Detail
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Tutup"
              title="Tutup"
            >
              <span className="text-base leading-none">✕</span>
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[75vh] overflow-auto p-4">
            {children}
          </div>

          {/* Footer spacer (optional feel) */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}