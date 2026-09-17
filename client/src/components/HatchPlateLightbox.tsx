import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface HatchPlateLightboxProps {
  src: string;
  alt: string;
  hatchName: string;
  /** Optional: thumbnail size class applied to the trigger image */
  thumbnailClass?: string;
  /** Optional: whether the trigger is a card/button wrapper or a raw img */
  triggerStyle?: React.CSSProperties;
}

/**
 * HatchPlateLightbox
 * Click the thumbnail → full-screen plate view.
 * Click the full-screen plate again (or the X) → return to original size.
 * Esc key also closes.
 */
export function HatchPlateLightbox({
  src,
  alt,
  hatchName,
  thumbnailClass = "w-full h-full object-contain",
  triggerStyle,
}: HatchPlateLightboxProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      {/* ── Trigger thumbnail ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full focus:outline-none"
        style={triggerStyle}
        aria-label={`View full illustration of ${hatchName}`}
      >
        <img
          src={src}
          alt={alt}
          className={thumbnailClass}
          draggable={false}
        />
        {/* Hover hint overlay */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm" style={{ backgroundColor: "rgba(6,13,26,0.35)" }}>
          <ZoomIn size={22} color="#EFE8D7" />
        </span>
      </button>

      {/* ── Fullscreen overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(6,13,26,0.92)" }}
          onClick={close}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-sm font-['Inter'] text-sm"
            style={{ backgroundColor: "rgba(239,232,215,0.12)", color: "#EFE8D7", border: "1px solid rgba(239,232,215,0.2)" }}
            aria-label="Close illustration"
          >
            <X size={16} />
            Close
          </button>

          {/* Full plate image — clicking it also closes */}
          <div
            className="relative flex flex-col items-center max-w-[96vw] max-h-[92vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl"
              style={{ cursor: "zoom-out" }}
              onClick={close}
              draggable={false}
            />
            <p
              className="mt-3 font-['Cinzel'] tracking-widest uppercase text-sm"
              style={{ color: "#BAB9B4", letterSpacing: "0.22em" }}
            >
              {hatchName}
            </p>
            <p
              className="mt-1 font-['Inter'] text-xs"
              style={{ color: "rgba(186,185,180,0.5)" }}
            >
              Tap image or press Esc to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
