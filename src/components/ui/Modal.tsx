import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3 border-b p-4">
            <div className="min-w-0">
              {title ? (
                <div className="truncate text-lg font-semibold text-gray-900">
                  {title}
                </div>
              ) : null}
            </div>
            <button
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[75vh] overflow-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
