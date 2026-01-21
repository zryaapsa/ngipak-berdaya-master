import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export default function Input({ className = "", invalid, ...props }: Props) {
  return (
    <input
      {...props}
      className={[
        "h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition",
        "placeholder:text-gray-400",
        "focus:ring-2",
        invalid
          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
          : "border-gray-200 focus:border-brand-300 focus:ring-brand-100",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        className,
      ].join(" ")}
    />
  );
}
