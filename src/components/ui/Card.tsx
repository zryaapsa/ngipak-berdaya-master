import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  noShadow?: boolean;
};

export default function Card({ className = "", noShadow, ...props }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-100 bg-white",
        noShadow ? "shadow-none" : "shadow-soft",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
