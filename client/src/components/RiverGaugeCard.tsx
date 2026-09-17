/**
 * RiverGaugeCard.tsx
 *
 * Compact inline river gauge card for the Trip Kit detail page.
 * Fetches from /api/conditions/river and renders a single-row summary
 * (compact=true) that expands to a full view (compact=false).
 *
 * Color: bg #0d2d38, border rgba(255,255,255,0.08)
 */

import { useEffect, useState } from "react";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Fish,
  AlertTriangle,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const tokens = {
  bg: "#0d2d38",
  border: "rgba(255,255,255,0.08)",
  accent: "#A67A3A",
  text: "#f5e6cc",
  muted: "rgba(214,197,176,0.65)",
  faint: "rgba(214,197,176,0.4)",
  divider: "rgba(255,255,255,0.07)",
  card: "rgba(255,255,255,0.04)",
};

// ── API types ─────────────────────────────────────────────────────────────────
interface RiverData {
  station_name: string;
  flow: number;
  flow_unit: string;
  wadeability: string;           // e.g. "Fishable", "High, wade with care"
  wadeability_status: "ok" | "caution" | "danger";
  water_temp: number;
  temp_label: string;            // e.g. "Prime", "Cold", "Warm"
  pressure_trend: "rising" | "steady" | "falling";
  updated: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function PressureIcon({ trend }: { trend: "rising" | "steady" | "falling" }) {
  const color = trend === "falling" ? tokens.accent : "rgba(214,197,176,0.5)";
  if (trend === "rising") return <TrendingUp size={14} style={{ color }} />;
  if (trend === "falling") return <TrendingDown size={14} style={{ color }} />;
  return <Minus size={14} style={{ color }} />;
}

function wadeabilityColor(status: RiverData["wadeability_status"]) {
  switch (status) {
    case "ok":      return "#A67A3A";
    case "caution": return "#f59e0b";
    case "danger":  return "#f87171";
  }
}

function tempLabelColor(label: string) {
  if (label.toLowerCase().includes("prime") || label.toLowerCase().includes("ideal"))
    return "#A67A3A";
  if (label.toLowerCase().includes("cold") || label.toLowerCase().includes("warm"))
    return "rgba(214,197,176,0.55)";
  return tokens.muted;
}

// ── Flow badge ────────────────────────────────────────────────────────────────
function FlowBadge({ flow, unit, wadeability, status }: {
  flow: number;
  unit: string;
  wadeability: string;
  status: RiverData["wadeability_status"];
}) {
  const color = wadeabilityColor(status);
  const bgMap = {
    ok: "rgba(167,122,58,0.12)",
    caution: "rgba(245,158,11,0.12)",
    danger: "rgba(248,113,113,0.12)",
  };
  const borderMap = {
    ok: "rgba(167,122,58,0.3)",
    caution: "rgba(245,158,11,0.3)",
    danger: "rgba(248,113,113,0.3)",
  };

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-sm"
      style={{
        backgroundColor: bgMap[status],
        border: `1px solid ${borderMap[status]}`,
      }}
    >
      <Droplets size={11} style={{ color }} />
      <span className="font-['Cormorant_Garamond'] text-sm" style={{ color: tokens.text }}>
        {flow}
      </span>
      <span className="font-['Inter'] text-[10px] uppercase tracking-widest" style={{ color: tokens.faint }}>
        {unit}
      </span>
      <span
        className="font-['Inter'] text-[10px] italic"
        style={{ color }}
      >
        {wadeability}
      </span>
    </div>
  );
}

// ── Temp pill ─────────────────────────────────────────────────────────────────
function TempPill({ temp, label }: { temp: number; label: string }) {
  const color = tempLabelColor(label);
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-['Cormorant_Garamond'] text-sm" style={{ color: tokens.text }}>
        {temp}°F
      </span>
      <span className="font-['Inter'] text-[10px] italic" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function GaugeSkeleton({ compact }: { compact: boolean }) {
  return (
    <div
      className="rounded-sm animate-pulse"
      style={{ backgroundColor: tokens.bg, border: `1px solid ${tokens.border}` }}
    >
      {compact ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.12)" }} />
          <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.1)" }} />
          <div className="h-5 w-24 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.08)" }} />
          <div className="h-3 w-16 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.08)" }} />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="h-4 w-32 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.12)" }} />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-sm" style={{ backgroundColor: "rgba(167,122,58,0.08)" }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expanded view ─────────────────────────────────────────────────────────────
function ExpandedView({ data }: { data: RiverData }) {
  const trendLabel = {
    rising: "Rising",
    falling: "Falling",
    steady: "Steady",
  }[data.pressure_trend];

  return (
    <div>
      {/* Station name */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${tokens.divider}` }}
      >
        <MapPin size={12} style={{ color: tokens.accent }} />
        <span
          className="font-['Cormorant_Garamond'] text-sm"
          style={{ color: tokens.text }}
        >
          {data.station_name}
        </span>
      </div>

      {/* 2-column data grid */}
      <div
        className="grid grid-cols-2 divide-x"
        style={{ borderBottom: `1px solid ${tokens.divider}` }}
      >
        {/* Flow + wadeability */}
        <div
          className="flex flex-col gap-1 px-4 py-4"
          style={{ borderRight: `1px solid ${tokens.divider}` }}
        >
          <span
            className="font-['Inter'] text-[9px] uppercase tracking-widest"
            style={{ color: tokens.faint }}
          >
            Flow
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-['Cormorant_Garamond'] text-2xl"
              style={{ color: tokens.text }}
            >
              {data.flow}
            </span>
            <span
              className="font-['Inter'] text-[10px] uppercase tracking-widest"
              style={{ color: tokens.faint }}
            >
              {data.flow_unit}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {data.wadeability_status === "danger" ? (
              <AlertTriangle size={10} style={{ color: "#f87171" }} />
            ) : (
              <Droplets size={10} style={{ color: wadeabilityColor(data.wadeability_status) }} />
            )}
            <span
              className="font-['Inter'] text-xs italic"
              style={{ color: wadeabilityColor(data.wadeability_status) }}
            >
              {data.wadeability}
            </span>
          </div>
        </div>

        {/* Water temp */}
        <div className="flex flex-col gap-1 px-4 py-4">
          <span
            className="font-['Inter'] text-[9px] uppercase tracking-widest"
            style={{ color: tokens.faint }}
          >
            Water Temp
          </span>
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-['Cormorant_Garamond'] text-2xl"
              style={{ color: tokens.text }}
            >
              {data.water_temp}
            </span>
            <span
              className="font-['Cormorant_Garamond'] text-sm"
              style={{ color: tokens.muted }}
            >
              °F
            </span>
          </div>
          <span
            className="font-['Inter'] text-xs italic"
            style={{ color: tempLabelColor(data.temp_label) }}
          >
            {data.temp_label}
          </span>
        </div>
      </div>

      {/* Pressure trend */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${tokens.divider}` }}
      >
        <PressureIcon trend={data.pressure_trend} />
        <div>
          <span
            className="font-['Inter'] text-[9px] uppercase tracking-widest mr-2"
            style={{ color: tokens.faint }}
          >
            Pressure
          </span>
          <span
            className="font-['Inter'] text-xs"
            style={{ color: tokens.muted }}
          >
            {trendLabel}
          </span>
        </div>
      </div>

      {/* Attribution */}
      <div className="px-4 py-2">
        <span
          className="font-['Inter'] text-[9px] uppercase tracking-widest"
          style={{ color: "rgba(214,197,176,0.2)" }}
        >
          River data: USGS
        </span>
      </div>
    </div>
  );
}

// ── Compact row ───────────────────────────────────────────────────────────────
function CompactRow({ data, onExpand }: { data: RiverData; onExpand: () => void }) {
  return (
    <button
      onClick={onExpand}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-opacity hover:opacity-80"
      aria-label={`Expand ${data.station_name} river conditions`}
    >
      {/* Gauge icon */}
      <div
        className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(167,122,58,0.15)", border: `1px solid rgba(167,122,58,0.2)` }}
      >
        <Droplets size={13} style={{ color: tokens.accent }} />
      </div>

      {/* Station name */}
      <span
        className="font-['Inter'] text-xs flex-1 min-w-0 truncate italic"
        style={{ color: tokens.muted }}
      >
        {data.station_name}
      </span>

      {/* Flow badge */}
      <FlowBadge
        flow={data.flow}
        unit={data.flow_unit}
        wadeability={data.wadeability}
        status={data.wadeability_status}
      />

      {/* Temp */}
      <TempPill temp={data.water_temp} label={data.temp_label} />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface RiverGaugeCardProps {
  lat: number;
  lon: number;
  compact?: boolean;
}

export function RiverGaugeCard({ lat, lon, compact = true }: RiverGaugeCardProps) {
  const [data, setData] = useState<RiverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  // Reset expanded state when compact prop changes
  useEffect(() => {
    setExpanded(!compact);
  }, [compact]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/conditions/river?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed to fetch river data");
        const json: RiverData = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [lat, lon]);

  if (loading) return <GaugeSkeleton compact={compact && !expanded} />;

  if (error || !data) {
    return (
      <div
        className="rounded-sm flex items-center gap-2 px-4 py-3"
        style={{ backgroundColor: tokens.bg, border: `1px solid ${tokens.border}` }}
      >
        <Fish size={12} style={{ color: "rgba(214,197,176,0.3)" }} />
        <span
          className="font-['Inter'] text-xs italic"
          style={{ color: "rgba(214,197,176,0.3)" }}
        >
          River conditions unavailable.
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ backgroundColor: tokens.bg, border: `1px solid ${tokens.border}` }}
    >
      {compact && !expanded ? (
        <CompactRow data={data} onExpand={() => setExpanded(true)} />
      ) : (
        <>
          {/* Collapse button when expanded from compact mode */}
          {compact && expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-end px-4 pt-2 pb-0 transition-opacity hover:opacity-70"
              aria-label="Collapse river conditions"
            >
              <span
                className="font-['Inter'] text-[9px] uppercase tracking-widest"
                style={{ color: tokens.faint }}
              >
                Collapse
              </span>
            </button>
          )}
          <ExpandedView data={data} />
        </>
      )}
    </div>
  );
}
