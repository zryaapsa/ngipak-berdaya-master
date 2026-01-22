import type { ReactNode } from "react";

export default function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand";
}) {
  const cls =
    tone === "brand"
      ? "border-white/20 bg-white/10 text-white"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
