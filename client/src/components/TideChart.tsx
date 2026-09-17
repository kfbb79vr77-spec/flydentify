/**
 * TideChart.tsx
 *
 * Standalone tide chart for the saltwater HatchChart page.
 * Fetches from /api/conditions/tides, renders section header, current stage
 * pill, advisory, best windows, SVG tide timeline, tide table, and attribution.
 *
 * Salt accent: #3080A8, border: rgba(61,107,131,0.25)
 */

import { useEffect, useState } from "react";
import { Waves, Fish, Clock, ExternalLink } from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const accent = "#3D6B83";
const border = "rgba(61,107,131,0.28)";
const divider = "rgba(61,107,131,0.15)";
const cardBg = "rgba(61,107,131,0.07)";
const text = "#1A2A38";
const muted = "rgba(26,34,44,0.68)";
const faint = "rgba(26,34,44,0.48)";
const amberAccent = "#a05a00";

// ── API types ─────────────────────────────────────────────────────────────────
interface TidePrediction {
  t: string;   // "2024-06-22 06:14"
  v: string;   // height in feet
  type: "H" | "L";
}

interface TideData {
  station_id: string;
  station_name: string;
  date: string;
  tide_stage: "Incoming" | "High tide" | "Outgoing" | "Low tide";
  advisory: string;
  best_window_start?: string;
  best_window_end?: string;
  predictions: TidePrediction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function stageColor(stage: string): { bg: string; color: string; border: string } {
  switch (stage) {
    case "Incoming":
      return { bg: "rgba(61,107,131,0.18)", color: "#3D6B83", border: "rgba(61,107,131,0.4)" };
    case "High tide":
      return { bg: "rgba(61,107,131,0.18)", color: "#3D6B83", border: "rgba(61,107,131,0.4)" };
    case "Outgoing":
      return { bg: "rgba(167,122,58,0.18)", color: "#A67A3A", border: "rgba(167,122,58,0.4)" };
    case "Low tide":
    default:
      return { bg: "rgba(120,113,108,0.2)", color: "#d6c5b0", border: "rgba(120,113,108,0.35)" };
  }
}

function formatTime(t: string): string {
  // t: "2024-06-22 06:14"
  const parts = t.split(" ");
  if (parts.length < 2) return t;
  const [hh, mm] = parts[1].split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function parseMinutes(t: string): number {
  const parts = t.split(" ");
  if (parts.length < 2) return 0;
  const [hh, mm] = parts[1].split(":").map(Number);
  return hh * 60 + mm;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function TideChartSkeleton() {
  return (
    <div
      className="rounded-sm p-5 space-y-4 animate-pulse"
      style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
    >
      <div className="h-5 w-32 rounded-sm" style={{ backgroundColor: "rgba(61,107,131,0.12)" }} />
      <div className="h-3 w-full rounded-sm" style={{ backgroundColor: "rgba(26,34,44,0.06)" }} />
      <div className="h-3 w-3/4 rounded-sm" style={{ backgroundColor: "rgba(26,34,44,0.05)" }} />
      <div className="h-16 rounded-sm" style={{ backgroundColor: "rgba(61,107,131,0.06)" }} />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 rounded-sm" style={{ backgroundColor: "rgba(26,34,44,0.04)" }} />
        ))}
      </div>
    </div>
  );
}

// ── SVG tide timeline ─────────────────────────────────────────────────────────
interface TideSVGProps {
  predictions: TidePrediction[];
  height?: number;
}
function TideSVG({ predictions, height = 80 }: TideSVGProps) {
  const W = 500;
  const H = height;
  const PAD_X = 32;
  const PAD_Y = 14;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const points = predictions.map((p) => {
    const minutes = parseMinutes(p.t);
    const val = parseFloat(p.v);
    return { minutes, val, type: p.type, raw: p.t };
  });

  if (points.length === 0) return null;

  const allVals = points.map((p) => p.val);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const rangeV = maxV - minV || 1;

  const toX = (minutes: number) => PAD_X + (minutes / 1440) * innerW;
  const toY = (val: number) => PAD_Y + innerH - ((val - minV) / rangeV) * innerH;

  // Build smooth SVG path using cubic bezier control points
  const pathD = (() => {
    if (points.length < 2) return "";
    const pts = points.map((p) => ({ x: toX(p.minutes), y: toY(p.val) }));
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
  })();

  // Current time x
  const nowX = Math.max(PAD_X, Math.min(W - PAD_X, toX(nowMinutes)));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fill area under curve */}
      <defs>
        <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Baseline */}
      <line
        x1={PAD_X} y1={H - PAD_Y}
        x2={W - PAD_X} y2={H - PAD_Y}
        stroke="rgba(26,34,44,0.10)" strokeWidth="1"
      />

      {/* Area fill — close path at bottom */}
      {pathD && (
        <path
          d={`${pathD} L ${toX(points[points.length - 1].minutes)},${H - PAD_Y} L ${PAD_X},${H - PAD_Y} Z`}
          fill="url(#tideGrad)"
        />
      )}

      {/* Tide curve */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      )}

      {/* H/L dots + labels */}
      {points.map((p, i) => {
        const x = toX(p.minutes);
        const y = toY(p.val);
        const isHigh = p.type === "H";
        const markerY = isHigh ? y - 10 : y + 17;
        const timeStr = formatTime(p.raw);

        return (
          <g key={i}>
            {/* Type marker (H or L) */}
            <text
              x={x} y={markerY}
              textAnchor="middle"
              fontSize="8"
              fontFamily="Lora, serif"
              fontWeight="600"
              fill={accent}
              opacity="0.9"
            >
              {p.type}
            </text>
            {/* Dot */}
            <circle cx={x} cy={y} r={4} fill={accent} opacity="0.9" />
            {/* Time label */}
            <text
              x={x} y={isHigh ? markerY - 9 : markerY + 9}
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="Lora, serif"
              fill="rgba(26,34,44,0.60)"
            >
              {timeStr}
            </text>
          </g>
        );
      })}

      {/* Current time line */}
      <line
        x1={nowX} y1={PAD_Y}
        x2={nowX} y2={H - PAD_Y}
        stroke={amberAccent}
        strokeWidth="1.5"
        strokeDasharray="3,2.5"
        opacity="0.85"
      />
      {/* Arrow head */}
      <polygon
        points={`${nowX - 4},${PAD_Y} ${nowX + 4},${PAD_Y} ${nowX},${PAD_Y + 6}`}
        fill={amberAccent}
        opacity="0.85"
      />
    </svg>
  );
}

// ── Tide table row ────────────────────────────────────────────────────────────
function TideRow({ prediction, isNext }: { prediction: TidePrediction; isNext: boolean }) {
  const heightFt = parseFloat(prediction.v).toFixed(1);
  const isHigh = prediction.type === "H";

  return (
    <div
      className="grid grid-cols-3 items-center py-2 px-4"
      style={{
        borderBottom: `1px solid ${divider}`,
        backgroundColor: isNext ? "rgba(61,107,131,0.06)" : "transparent",
      }}
    >
      <span
        className="font-['Inter'] text-xs"
        style={{ color: isNext ? text : muted }}
      >
        {formatTime(prediction.t)}
      </span>
      <span
        className="font-['Cormorant_Garamond'] text-sm text-center"
        style={{ color: isNext ? text : muted }}
      >
        {heightFt} ft
      </span>
      <div className="flex justify-end">
        <span
          className="font-['Inter'] text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
          style={{
            color: isHigh ? accent : "rgba(26,34,44,0.55)",
            backgroundColor: isHigh ? "rgba(61,107,131,0.1)" : "transparent",
            border: isHigh ? `1px solid rgba(61,107,131,0.2)` : "none",
          }}
        >
          {isHigh ? "High" : "Low"}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface TideChartProps {
  station?: string;
  stationName?: string;
}

export function TideChart({ station = "8771450", stationName }: TideChartProps) {
  const [data, setData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchData = async () => {
      try {
        const today = todayString();
        const res = await fetch(`/api/conditions/tides?station=${station}&date=${today}`);
        if (!res.ok) throw new Error("Failed to fetch tides");
        const json: TideData = await res.json();
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
  }, [station]);

  if (loading) return <TideChartSkeleton />;

  if (error || !data) {
    return (
      <div
        className="rounded-sm px-4 py-3"
        style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
      >
        <p className="font-['Inter'] text-xs italic" style={{ color: "#6b7280" }}>
          Tide data unavailable.
        </p>
      </div>
    );
  }

  const stagePill = stageColor(data.tide_stage);
  const resolvedName = stationName ?? data.station_name;

  // Find next H/L after current time
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextTideIndex = data.predictions.findIndex(
    (p) => parseMinutes(p.t) > nowMinutes
  );

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
    >
      {/* ── Section header ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <div className="flex items-center gap-2.5">
          <Waves size={16} style={{ color: accent }} />
          <h2
            className="font-['Cormorant_Garamond'] text-base"
            style={{ color: accent }}
          >
            Tides Today
          </h2>
        </div>
        {resolvedName && (
          <span
            className="font-['Inter'] text-xs italic"
            style={{ color: faint }}
          >
            {resolvedName}
          </span>
        )}
      </div>

      {/* ── Current stage pill + advisory ───────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2" style={{ borderBottom: `1px solid ${divider}` }}>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm"
          style={{
            backgroundColor: stagePill.bg,
            border: `1px solid ${stagePill.border}`,
          }}
        >
          <Waves size={11} style={{ color: stagePill.color }} />
          <span
            className="font-['Inter'] text-xs uppercase tracking-widest"
            style={{ color: stagePill.color }}
          >
            {data.tide_stage}
          </span>
        </div>

        <p
          className="font-['Inter'] text-sm italic leading-relaxed"
          style={{ color: muted }}
        >
          {data.advisory}
        </p>
      </div>

      {/* ── Best windows ────────────────────────────────────────────────────── */}
      {data.best_window_start && data.best_window_end && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5"
          style={{
            backgroundColor: "rgba(167,122,58,0.07)",
            borderBottom: `1px solid ${divider}`,
          }}
        >
          <Fish size={12} style={{ color: amberAccent }} />
          <span
            className="font-['Inter'] text-xs"
            style={{ color: "#A67A3A" }}
          >
            Best fishing window: {data.best_window_start} to {data.best_window_end}
          </span>
        </div>
      )}

      {/* ── SVG tide timeline ────────────────────────────────────────────────── */}
      {data.predictions.length > 0 && (
        <div
          className="px-3 pt-3 pb-2"
          style={{ borderBottom: `1px solid ${divider}` }}
        >
          <TideSVG predictions={data.predictions} height={80} />
        </div>
      )}

      {/* ── Tide table header ────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 items-center px-4 py-1.5"
        style={{
          backgroundColor: "rgba(61,107,131,0.12)",
          borderBottom: `1px solid ${divider}`,
        }}
      >
        {["Time", "Height", "Type"].map((label) => (
          <span
            key={label}
            className={`font-['Inter'] text-[9px] uppercase tracking-widest ${label === "Height" ? "text-center" : label === "Type" ? "text-right" : ""}`}
            style={{ color: faint }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Tide table rows ──────────────────────────────────────────────────── */}
      <div>
        {data.predictions.map((p, i) => (
          <TideRow
            key={i}
            prediction={p}
            isNext={i === nextTideIndex}
          />
        ))}
      </div>

      {/* ── Attribution ─────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${divider}` }}
      >
        <span
          className="font-['Inter'] text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(26,34,44,0.38)" }}
        >
          Tide predictions: NOAA CO-OPS
        </span>
        <a
          href="https://tidesandcurrents.noaa.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
        >
          <ExternalLink size={9} style={{ color: "rgba(26,34,44,0.42)" }} />
          <span
            className="font-['Inter'] text-[10px]"
            style={{ color: "rgba(26,34,44,0.42)" }}
          >
            tidesandcurrents.noaa.gov
          </span>
        </a>
      </div>
    </div>
  );
}
