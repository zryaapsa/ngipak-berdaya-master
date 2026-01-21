import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export default function Select({
  className = "",
  invalid,
  children,
  ...props
}: Props) {
  return (
    <div className={["relative", className].join(" ")}>
      <select
        {...props}
        className={[
          "w-full appearance-none rounded-xl border bg-white px-3 py-3 pr-10 text-sm text-gray-900 outline-none transition",
          "focus:ring-2",
          invalid
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-brand-300 focus:ring-brand-100",
          "hover:border-gray-300",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        ].join(" ")}
      >
        {children}
      </select>

      {/* chevron */}
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
