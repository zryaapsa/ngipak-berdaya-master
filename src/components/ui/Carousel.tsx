import { useMemo, useRef, useState } from "react";

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

  const [idx, setIdx] = useState(0);
  const safeIdx = imgs.length ? ((idx % imgs.length) + imgs.length) % imgs.length : 0;

  // drag state
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const axisLock = useRef<"x" | "y" | null>(null);
  const widthRef = useRef<number>(1);

  const threshold = 60; // px

  const prev = () => setIdx((v) => (v - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((v) => (v + 1) % imgs.length);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (imgs.length <= 1) return;
    const el = e.currentTarget;
    widthRef.current = Math.max(1, el.getBoundingClientRect().width);

    startX.current = e.clientX;
    startY.current = e.clientY;
    axisLock.current = null;
    setDragging(true);
    setDragX(0);

    // biar tetap dapat pointer events
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || imgs.length <= 1) return;
    if (startX.current == null || startY.current == null) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!axisLock.current) {
      axisLock.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisLock.current === "y") return; // biarkan scroll vertikal

    // clamp drag supaya tidak terlalu jauh
    const maxDrag = widthRef.current * 0.55;
    const clamped = Math.max(-maxDrag, Math.min(maxDrag, dx));
    setDragX(clamped);
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);

    // kalau axis y, jangan geser
    if (axisLock.current === "y") {
      setDragX(0);
      return;
    }

    if (dragX > threshold) prev();
    else if (dragX < -threshold) next();

    setDragX(0);

    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (imgs.length <= 1) return;
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (!imgs.length) return <div className={`h-full w-full bg-gray-100 ${className}`} />;

  const showUI =
    "opacity-0 pointer-events-none " +
    "group-hover:opacity-100 group-hover:pointer-events-auto " +
    "group-focus-within:opacity-100 group-focus-within:pointer-events-auto " +
    "group-active:opacity-100 group-active:pointer-events-auto";

  const arrowBase = [
    "absolute top-1/2 -translate-y-1/2 z-20",
    "h-9 w-9 rounded-full",
    "bg-white/85 backdrop-blur",
    "ring-1 ring-black/10 shadow-sm",
    "flex items-center justify-center",
    "text-gray-800",
    "hover:bg-white hover:ring-black/15",
    "active:scale-95 transition",
    "focus:outline-none focus:ring-2 focus:ring-brand-100",
    showUI,
  ].join(" ");

  // slider transform: translate per slide + drag offset
  const translate = `calc(${-safeIdx * 100}% + ${dragX}px)`;
  const trackCls = dragging ? "transition-none" : "transition-transform duration-300 ease-out";

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
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      <div
        className={`flex h-full w-full ${trackCls}`}
        style={{ transform: `translateX(${translate})` }}
      >
        {imgs.map((src, i) => (
          <div key={i} className="h-full w-full shrink-0">
            <img
              src={src}
              alt={alt ?? "gambar"}
              className="h-full w-full object-cover select-none"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {imgs.length > 1 ? (
        <>
          <button type="button" onClick={prev} className={`${arrowBase} left-2`} aria-label="Sebelumnya">
            <ArrowIcon dir="left" />
          </button>

          <button type="button" onClick={next} className={`${arrowBase} right-2`} aria-label="Berikutnya">
            <ArrowIcon dir="right" />
          </button>

          <div className={`absolute bottom-2 left-0 right-0 z-20 flex justify-center ${showUI}`}>
            <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
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
