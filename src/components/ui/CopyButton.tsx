import { useState } from "react";
import Button from "./Button";

export default function CopyButton({
  text,
  className = "",
  label = "Copy Pesan",
  copiedLabel = "Tercopy ✓",
}: {
  text: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <button type="button" onClick={onCopy} className={className}>
      <Button variant="secondary" className="h-11 w-full">
        {copied ? copiedLabel : label}
      </Button>
    </button>
  );
}
