import { Link } from "react-router-dom";

type Props = {
  to: string;
  label?: string;
};

export default function BackButton({ to, label = "Kembali" }: Props) {
  return (
    <Link
      to={to}
      className="
        inline-flex items-center gap-2 rounded-2xl
        bg-white px-3 py-2 text-sm font-medium
        text-brand-900 ring-1 ring-gray-200
        shadow-soft transition
        hover:-translate-y-0.5 hover:bg-brand-50 hover:ring-brand-100
        focus:outline-none focus:ring-2 focus:ring-brand-100
      "
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
