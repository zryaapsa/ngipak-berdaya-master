import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-xl font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "active:translate-y-px",
  ].join(" ");

const variants: Record<Variant, string> = {
  primary: "bg-brand-800 text-white hover:bg-brand-900 shadow-soft",
  secondary:
    "bg-white text-brand-800 border border-gray-200 hover:bg-gray-50",
  ghost: "bg-transparent text-brand-800 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type,
  ...props
}: Props) {
  return (
    <button
      type={type ?? "button"}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
