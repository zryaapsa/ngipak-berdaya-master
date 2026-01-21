import type { ReactNode } from "react";

type Variant = "dark" | "light";

export default function StatTile({
  label,
  value,
  icon,
  variant = "dark",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: Variant;
}) {
  const cls =
    variant === "dark"
      ? "border-white/15 bg-white/10 text-white backdrop-blur"
      : "border-gray-200 bg-white text-gray-900";

  const sub =
    variant === "dark" ? "text-white/75" : "text-gray-600";

  const iconCls =
    variant === "dark" ? "bg-white/10 text-white/90" : "bg-gray-50 text-gray-700";

  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`mt-1 text-xs ${sub}`}>{label}</div>
        </div>
        {icon ? (
          <div className={`rounded-xl p-2 ring-1 ring-black/5 ${iconCls}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
