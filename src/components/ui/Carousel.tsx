import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Props = {
  images: string[];
  alt?: string;
  className?: string;
};

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Carousel({ images, alt, className = "" }: Props) {
  const imgs = useMemo(() => images.filter(Boolean).slice(0, 3), [images]);

  // idx boleh "stale", render selalu pakai safeIdx supaya tidak butuh useEffect clamp
  const [idx, setIdx] = useState(0);
  const safeIdx = imgs.length ? ((idx % imgs.length) + imgs.length) % imgs.length : 0;

  // drag state
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const axisLock = useRef<"x" | "y" | null>(null);
  const widthRef = useRef<number>(1);

  const threshold = 60; // px swipe threshold

  const prev = () => {
    const len = imgs.length;
    if (len <= 1) return;
    setIdx((v) => ((v - 1) % len + len) % len);
  };

  const next = () => {
    const len = imgs.length;
    if (len <= 1) return;
    setIdx((v) => (v + 1) % len);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (imgs.length <= 1) return;

    // Jangan mulai drag kalau user klik tombol control/dots
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    const el = e.currentTarget;
    widthRef.current = Math.max(1, el.getBoundingClientRect().width);

    startX.current = e.clientX;
    startY.current = e.clientY;
    axisLock.current = null;

    setDragging(true);
    setDragX(0);

    // pointer capture (biar swipe stabil)
    if (typeof el.setPointerCapture === "function") {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || imgs.length <= 1) return;
    if (startX.current == null || startY.current == null) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!axisLock.current) {
      axisLock.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisLock.current === "y") return; // biarkan scroll vertikal

    // clamp drag
    const maxDrag = widthRef.current * 0.55;
    const clamped = Math.max(-maxDrag, Math.min(maxDrag, dx));
    setDragX(clamped);
  };

  const endDrag = (e?: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);

    if (axisLock.current === "x") {
      if (dragX > threshold) prev();
      else if (dragX < -threshold) next();
    }

    setDragX(0);

    if (e) {
      const el = e.currentTarget;
      if (typeof el.releasePointerCapture === "function") {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (imgs.length <= 1) return;
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (!imgs.length) {
    return <div className={`h-full w-full bg-gray-100 ${className}`} />;
  }

  // Controls: selalu tampil di mobile, hover/focus untuk >=sm
  const showUI =
    "opacity-100 pointer-events-auto " +
    "sm:opacity-0 sm:pointer-events-none " +
    "sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto " +
    "sm:group-focus-within:opacity-100 sm:group-focus-within:pointer-events-auto";

  const arrowBase = [
    "absolute top-1/2 -translate-y-1/2 z-20",
    "h-8 w-8 rounded-full",
    "bg-white/85 backdrop-blur",
    "ring-1 ring-black/10 shadow-sm",
    "flex items-center justify-center",
    "text-gray-900",
    "hover:bg-white hover:ring-black/15",
    "active:scale-95 transition",
    "focus:outline-none focus:ring-2 focus:ring-brand-100",
    showUI,
  ].join(" ");

  const trackCls = dragging ? "transition-none" : "transition-transform duration-300 ease-out";
  const translate = `calc(${-safeIdx * 100}% + ${dragX}px)`;

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ touchAction: "pan-y" }}
      aria-label="Carousel"
    >
      {/* overlay gradient (tidak mengganggu click) */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      {/* track */}
      <div className={`flex h-full w-full ${trackCls}`} style={{ transform: `translateX(${translate})` }}>
        {imgs.map((src, i) => (
          <div key={i} className="h-full w-full shrink-0">
            <img
              src={src}
              alt={alt ?? "gambar"}
              className="h-full w-full select-none object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {imgs.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className={`${arrowBase} left-2`}
            aria-label="Sebelumnya"
          >
            <ArrowIcon dir="left" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className={`${arrowBase} right-2`}
            aria-label="Berikutnya"
          >
            <ArrowIcon dir="right" />
          </button>

          {/* dots */}
          <div className={`absolute bottom-2 left-0 right-0 z-20 flex justify-center ${showUI}`}>
            <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                  className={[
                    "h-1.5 w-1.5 rounded-full ring-1 ring-white/25 transition",
                    i === safeIdx ? "bg-white" : "bg-white/45 hover:bg-white/70",
                  ].join(" ")}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
