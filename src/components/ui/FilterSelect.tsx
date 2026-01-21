import { Fragment, type ReactNode } from "react";
import { Listbox, Transition } from "@headlessui/react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  icon?: ReactNode;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  className?: string;
};

export default function FilterSelect({
  label,
  icon,
  value,
  options,
  onChange,
  className = "",
}: Props) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={className}>
      <div className="flex h-5 items-center gap-2 text-xs font-semibold text-gray-700">
        {icon ? <span className="text-gray-400">{icon}</span> : null}
        {label}
      </div>

      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button
            className={[
              "relative w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-left text-sm transition",
              "hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300",
            ].join(" ")}
          >
            <span className="block truncate text-gray-900">{selected.label}</span>

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
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={[
                "absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-soft",
                "focus:outline-none",
              ].join(" ")}
            >
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active }) =>
                    [
                      "cursor-pointer select-none px-3 py-2 text-sm",
                      active ? "bg-brand-50 text-brand-900" : "text-gray-800",
                    ].join(" ")
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span className={selected ? "font-semibold" : "font-normal"}>
                        {opt.label}
                      </span>
                      {selected ? (
                        <span className="text-brand-700">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
