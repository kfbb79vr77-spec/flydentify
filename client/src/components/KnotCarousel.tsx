// KnotCarousel — swipeable step-by-step knot instruction carousel
// Replaces the Prev/Next button layout with a full-width, mobile-first card carousel
import React, { useState, useRef, useCallback } from "react";
import { KnotDiagram, getStepCount, knotDiagrams } from "@/lib/knotDiagrams";
import { knots } from "@/lib/knotData";

interface KnotCarouselProps {
  knotId: string;
  /** "fw" | "sw" — controls accent color */
  mode?: "fw" | "sw";
}

const FW_ACCENT = "#A67A3A";
const SW_ACCENT = "#3D6B83";
const FW_BG_SVG = "#0D1B33";   // unified navy panel (FW)
const SW_BG_SVG = "#0D1B33";   // unified navy panel (SW)

export function KnotCarousel({ knotId, mode = "fw" }: KnotCarouselProps) {
  const knot = knots[knotId];
  const stepCount = getStepCount(knotId);
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const accent = mode === "sw" ? SW_ACCENT : FW_ACCENT;
  const svgBg  = mode === "sw" ? SW_BG_SVG : FW_BG_SVG;
  const isFirst = step === 0;
  const isLast  = step >= stepCount - 1;
  const showTip = knot && isLast;

  // ── Swipe / drag ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((clientX: number) => {
    dragStart.current = clientX;
    setDragging(true);
  }, []);

  const handleDragEnd = useCallback((clientX: number) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    const threshold = 40;
    if (delta > threshold && !isLast)  setStep(s => s + 1);
    if (delta < -threshold && !isFirst) setStep(s => s - 1);
    dragStart.current = null;
    setDragging(false);
  }, [isFirst, isLast]);

  // Touch
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchEnd   = (e: React.TouchEvent) => handleDragEnd(e.changedTouches[0].clientX);

  // Mouse (desktop)
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseUp   = (e: React.MouseEvent) => handleDragEnd(e.clientX);
  const onMouseLeave = () => { dragStart.current = null; setDragging(false); };

  if (!knot || stepCount === 0) return null;

  const frameLabels = knotDiagrams[knotId]?.map(f => f.label) ?? [];
  const currentLabel = frameLabels[Math.min(step, frameLabels.length - 1)] ?? knot.steps[step] ?? "";

  return (
    <div className="rounded-sm overflow-hidden select-none" style={{ border: `1px solid ${accent}33` }}>

      {/* ── Header bar: step counter + knot name ─────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: svgBg }}>
        <div>
          <span className="font-['Cinzel'] text-xs tracking-widest" style={{ color: accent }}>
            STEP {String(step + 1).padStart(2, "0")} OF {String(stepCount).padStart(2, "0")}
          </span>
        </div>
        <span className="font-['Inter'] text-xs italic" style={{ color: "rgba(255,255,255,0.55)" }}>
          {knot.name}
        </span>
      </div>

      {/* ── Plain-English instruction — READ FIRST ──────────────────────── */}
      <div
        className="px-4 py-3 min-h-[56px] flex items-center"
        style={{ backgroundColor: svgBg, borderTop: `1px solid rgba(255,255,255,0.06)` }}
      >
        <p
          className="font-['Inter'] text-sm leading-snug text-center w-full"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          {currentLabel}
        </p>
      </div>

      {/* ── SVG diagram — swipeable ──────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ backgroundColor: svgBg, paddingBottom: "8px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Diagram — large, breathing room */}
        <div className="px-6 py-2">
          <KnotDiagram knotId={knotId} step={step} className="w-full" />
        </div>

        {/* Swipe hint — only on step 1, fades out */}
        {step === 0 && stepCount > 1 && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none"
            style={{ opacity: 0.45 }}
          >
            <span className="font-['Inter'] text-xs" style={{ color: accent }}>swipe</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Progress dots + prev/next ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: svgBg, borderTop: `1px solid rgba(255,255,255,0.06)` }}
      >
        {/* Prev button */}
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={isFirst}
          className="w-9 h-9 flex items-center justify-center rounded-sm transition-opacity disabled:opacity-20"
          style={{ backgroundColor: `${accent}22` }}
          aria-label="Previous step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: stepCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 18 : 6,
                height: 6,
                backgroundColor: i === step ? accent : `${accent}44`,
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => setStep(s => Math.min(stepCount - 1, s + 1))}
          disabled={isLast}
          className="w-9 h-9 flex items-center justify-center rounded-sm transition-opacity disabled:opacity-20"
          style={{ backgroundColor: `${accent}22` }}
          aria-label="Next step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Pro tip — surfaces after last step ───────────────────────────── */}
      {showTip && knot.tip && (
        <div
          className="px-4 py-3 flex gap-3"
          style={{
            backgroundColor: mode === "sw" ? "rgba(61,107,131,0.14)" : "rgba(13,27,51,0.85)",
            borderTop: `1px solid ${accent}44`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
            <circle cx="7" cy="5.5" r="3.5" stroke={accent} strokeWidth="1.5"/>
            <path d="M5.5 10h3M6 11.5h2" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="font-['Inter'] text-xs italic leading-relaxed" style={{ color: mode === "sw" ? "rgba(240,242,244,0.85)" : "rgba(247,241,226,0.85)" }}>
            <span className="not-italic font-medium">Pro tip: </span>{knot.tip}
          </p>
        </div>
      )}

      {/* ── Strength badge ────────────────────────────────────────────────── */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: mode === "sw" ? "rgba(61,107,131,0.08)" : "rgba(13,27,51,0.6)" }}
      >
        <span className="font-['Inter'] text-xs" style={{ color: mode === "sw" ? "rgba(240,242,244,0.8)" : "rgba(247,241,226,0.8)" }}>
          Line strength retained
        </span>
        <span className="font-['Cinzel'] text-xs font-semibold" style={{ color: accent }}>
          {knot.strength}
        </span>
      </div>

    </div>
  );
}
