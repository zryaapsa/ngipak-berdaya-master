import type { ViewMode } from "../utils/produk.utils";

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-100";
  const on = "bg-brand-50 text-brand-900 ring-1 ring-brand-100";
  const off = "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50";

  return (
    <div className="inline-flex rounded-2xl bg-white p-1 ring-1 ring-gray-200">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={[base, value === "list" ? on : off].join(" ")}
        aria-pressed={value === "list"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 6h13M8 12h13M8 18h13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 6h.01M3 12h.01M3 18h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        List
      </button>

      <button
        type="button"
        onClick={() => onChange("grid")}
        className={[base, value === "grid" ? on : off].join(" ")}
        aria-pressed={value === "grid"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Grid
      </button>
    </div>
  );
}
