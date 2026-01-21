import { useId } from "react";
import Input from "./Input";
import FieldLabel from "./FieldLabel";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  className?: string;
};

export default function SearchInput({
  label = "Cari",
  placeholder = "Cari...",
  value,
  onChange,
  onClear,
  className = "",
}: Props) {
  const id = useId();
  const canClear = value.trim().length > 0;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="block">
          <FieldLabel
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          >
            {label}
          </FieldLabel>
        </label>
      ) : (
        <div className="h-5" />
      )}

      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <Input
          id={id}
          className={[
            "bg-gray-50 hover:bg-white",
            "pl-11",
            canClear ? "pr-11" : "pr-4",
          ].join(" ")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {canClear ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className={[
              "absolute right-2 top-1/2 -translate-y-1/2",
              "rounded-lg p-2 text-gray-400 transition",
              "hover:bg-gray-100 hover:text-gray-600",
              "focus:outline-none focus:ring-2 focus:ring-brand-100",
            ].join(" ")}
            aria-label="Hapus pencarian"
            title="Hapus"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
