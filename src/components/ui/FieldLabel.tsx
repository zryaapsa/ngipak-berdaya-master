import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export default function FieldLabel({ children, icon, right, className = "" }: Props) {
  return (
    <div className={["mb-1 flex items-center justify-between gap-2", className].join(" ")}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        {icon ? <span className="text-gray-500">{icon}</span> : null}
        <span>{children}</span>
      </div>
      {right ? <div className="text-xs text-gray-500">{right}</div> : null}
    </div>
  );
}
