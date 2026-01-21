import type { HTMLAttributes } from "react";

type Variant = "brand" | "neutral" | "success" | "warning" | "danger";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  brand: "bg-brand-50 text-brand-800",
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-700",
};

export default function Badge({
  className = "",
  variant = "brand",
  ...props
}: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        "ring-1 ring-black/5",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
