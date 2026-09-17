import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { SavedFly } from "@/lib/tripKitStore";
import { addFlyToKit } from "@/lib/tripKitStore";

interface AtTheWaterProps {
  flies: SavedFly[];
  initialIndex?: number;
  kitId: string;
  onClose: () => void;
}

const s = {
  bg: "#071e25",
  amber: "#A67A3A",
  text: "#f5e6cc",
  muted: "#9ca3af",
};

export default function AtTheWater({
  flies,
  initialIndex = 0,
  kitId,
  onClose,
}: AtTheWaterProps) {
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(0, flies.length - 1)));
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const touchStartX = useRef<number | null>(null);

  const fly = flies[index];
  if (!fly) return null;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(flies.length - 1, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const updatedFly = { ...fly, notes: fly.notes ? `${fly.notes}\n${noteText}` : noteText };
    // Persist via addFlyToKit (upserts, so re-adding with updated notes replaces it)
    addFlyToKit(kitId, updatedFly);
    setNoteText("");
    setShowNoteInput(false);
  };

  const rigRows: { label: string; value: string }[] = [
    { label: "Rod", value: fly.rigging.rod },
    { label: "Reel", value: fly.rigging.reel },
    { label: "Line", value: fly.rigging.line },
    { label: "Leader", value: fly.rigging.leader },
    { label: "Tippet", value: fly.rigging.tippet },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: s.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <p className="font-['Inter'] text-xs uppercase tracking-widest" style={{ color: s.amber }}>
            At the Water
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(167,122,58,0.15)", color: s.amber }}
            aria-label="Add note"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: s.text }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main content, scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Fly name */}
        <div className="mb-6">
          <span
            className="inline-block font-['Inter'] text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm mb-3"
            style={{ backgroundColor: "rgba(167,122,58,0.18)", color: s.amber }}
          >
            {fly.flyType}
          </span>
          <h1
            className="font-['Cormorant_Garamond'] leading-snug"
            style={{ color: s.text, fontSize: "clamp(28px, 6vw, 40px)" }}
          >
            {fly.flyName}
          </h1>
        </div>

        {/* Rig specs */}
        <div
          className="rounded-sm overflow-hidden mb-6"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {rigRows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-start gap-4 px-4 py-3.5"
              style={{
                borderBottom: i < rigRows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <span
                className="font-['Inter'] uppercase tracking-widest shrink-0"
                style={{ color: s.amber, fontSize: 13, width: 52 }}
              >
                {row.label}
              </span>
              <span className="font-['Inter']" style={{ color: s.text, fontSize: 18, lineHeight: 1.4 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Rigging note */}
        {fly.rigging.riggingNote && (
          <div
            className="rounded-sm px-4 py-3 mb-6"
            style={{ backgroundColor: "rgba(167,122,58,0.08)", border: "1px solid rgba(167,122,58,0.2)" }}
          >
            <p className="font-['Inter'] italic leading-relaxed" style={{ color: s.text, fontSize: 16 }}>
              {fly.rigging.riggingNote}
            </p>
          </div>
        )}

        {/* Knots */}
        {fly.knotIds.length > 0 && (
          <div className="mb-6">
            <p
              className="font-['Inter'] text-xs uppercase tracking-widest mb-3"
              style={{ color: s.muted }}
            >
              Knots for this fly
            </p>
            <div className="flex flex-wrap gap-2">
              {fly.knotIds.map((kid) => (
                <span
                  key={kid}
                  className="font-['Inter'] px-3 py-1.5 rounded-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: s.text,
                    fontSize: 15,
                  }}
                >
                  {kid.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {fly.notes && (
          <div
            className="rounded-sm px-4 py-3 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="font-['Inter'] text-xs uppercase tracking-widest mb-2" style={{ color: s.muted }}>
              Field Notes
            </p>
            <p className="font-['Inter'] italic whitespace-pre-line" style={{ color: s.text, fontSize: 15 }}>
              {fly.notes}
            </p>
          </div>
        )}

        {/* Quick note input */}
        {showNoteInput && (
          <div
            className="rounded-sm p-4 mb-4"
            style={{ backgroundColor: "rgba(167,122,58,0.08)", border: "1px solid rgba(167,122,58,0.3)" }}
          >
            <p className="font-['Inter'] text-xs uppercase tracking-widest mb-2" style={{ color: s.amber }}>
              Add Note
            </p>
            <textarea
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. fish taking on size 16, not 18"
              rows={3}
              className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm focus:outline-none resize-none mb-3"
              style={{
                backgroundColor: "#071e25",
                border: "1px solid rgba(255,255,255,0.1)",
                color: s.text,
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoteInput(false)}
                className="flex-1 py-2 rounded-sm font-['Inter'] text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: s.muted }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="flex-1 py-2 rounded-sm font-['Inter'] text-sm disabled:opacity-40"
                style={{ backgroundColor: s.amber, color: "#fff" }}
              >
                Save Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      <div
        className="shrink-0 flex items-center justify-between gap-4 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex items-center gap-2 rounded-sm px-5 font-['Inter'] text-base transition-colors disabled:opacity-30"
          style={{
            minHeight: 56,
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: s.text,
          }}
        >
          <ChevronLeft size={18} />
          <span>Prev</span>
        </button>

        <div className="text-center shrink-0 w-16">
          <p className="font-['Inter'] text-sm" style={{ color: s.muted }}>
            {index + 1} / {flies.length}
          </p>
        </div>

        <button
          onClick={next}
          disabled={index === flies.length - 1}
          className="flex items-center justify-end gap-2 rounded-sm px-5 font-['Inter'] text-base transition-colors disabled:opacity-30"
          style={{
            minHeight: 56,
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: s.text,
          }}
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
