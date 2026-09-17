/**
 * ConditionsCard.tsx
 *
 * Unified river or tide conditions widget for the Flydentify Home screen.
 * Horizontal-row layout with weather icons (sun, cloud, rain, wind).
 * Fresh: Flow / Water Temp / Air / Wind / Pressure
 * Salt:  Tide Stage / Next Tide / Air / Wind / Pressure + tide chart
 */

import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, Clock, MapPin,
  Wind, Thermometer, Droplets, Waves,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const fw = {
  accent: "#A67A3A",
  border: "rgba(160,118,58,0.28)",
  card: "rgba(160,118,58,0.06)",
  cardInner: "rgba(160,118,58,0.04)",
  text: "#2F2B1E",
  muted: "rgba(37,45,30,0.68)",
  faint: "rgba(37,45,30,0.45)",
  divider: "rgba(160,118,58,0.15)",
  rowHover: "rgba(160,118,58,0.06)",
};
const sw = {
  accent: "#3D6B83",
  border: "rgba(61,107,131,0.28)",
  card: "rgba(61,107,131,0.07)",
  cardInner: "rgba(61,107,131,0.05)",
  text: "#1A2A38",
  muted: "rgba(26,34,44,0.68)",
  faint: "rgba(26,34,44,0.45)",
  divider: "rgba(61,107,131,0.13)",
  rowHover: "rgba(61,107,131,0.06)",
};

// ── API response types ────────────────────────────────────────────────────────
interface TidePrediction {
  t: string;
  v: string;
  type: "H" | "L";
}

interface AdvisoryData {
  rating: "Prime conditions" | "Good" | "Fair" | "Tough";
  station_name?: string;
  advisory: string;
  updated: string;
  flow?: number;
  flow_unit?: string;
  wadeability?: string;
  water_temp?: number;
  temp_advisory?: string;
  air_temp?: number;
  wind_speed?: number;
  wind_dir?: string;
  weather_code?: number;
  pressure_trend?: "rising" | "steady" | "falling";
  tide_stage?: "Incoming" | "High tide" | "Outgoing" | "Low tide";
  next_tide_time?: string;
  next_tide_height?: number;
  next_tide_type?: "H" | "L";
  tide_predictions?: TidePrediction[];
}

// ── SVG weather icons ─────────────────────────────────────────────────────────
function WeatherIcon({ code, size = 28, color }: { code?: number; size?: number; color: string }) {
  // WMO weather interpretation codes → icon
  // 0 = clear, 1-3 = partly cloudy, 45/48 = fog, 51-67 = rain, 71-77 = snow, 80-99 = storms
  const c = code ?? 0;

  if (c === 0) {
    // ☀️ Clear sun
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="6" fill={color} opacity="0.9" />
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 16 + Math.cos(rad) * 9;
          const y1 = 16 + Math.sin(rad) * 9;
          const x2 = 16 + Math.cos(rad) * 13;
          const y2 = 16 + Math.sin(rad) * 13;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.75" />;
        })}
      </svg>
    );
  }

  if (c >= 1 && c <= 3) {
    // ⛅ Partly cloudy
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="13" cy="13" r="5" fill={color} opacity="0.8" />
        {[0,60,120,180,240,300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 13 + Math.cos(rad) * 7;
          const y1 = 13 + Math.sin(rad) * 7;
          const x2 = 13 + Math.cos(rad) * 9.5;
          const y2 = 13 + Math.sin(rad) * 9.5;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />;
        })}
        <ellipse cx="18" cy="20" rx="7" ry="4.5" fill={color} opacity="0.35" />
        <ellipse cx="18" cy="20" rx="5" ry="3.5" fill={color} opacity="0.25" />
        <path d="M 11 20 Q 11 16 18 16 Q 26 16 26 20 Q 26 24 18 24 Q 10 24 11 20 Z" fill={color} opacity="0.35" />
      </svg>
    );
  }

  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) {
    // 🌧️ Rain
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M 6 16 Q 6 10 16 10 Q 26 10 26 16 Q 26 21 16 21 Q 6 21 6 16 Z" fill={color} opacity="0.4" />
        {[[10,24,9,29],[16,24,15,29],[22,24,21,29]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        ))}
      </svg>
    );
  }

  if (c >= 71 && c <= 77) {
    // ❄️ Snow
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M 6 14 Q 6 8 16 8 Q 26 8 26 14 Q 26 19 16 19 Q 6 19 6 14 Z" fill={color} opacity="0.4" />
        {[[10,22,10,28],[16,22,16,28],[22,22,22,28]].map(([x,y1,_x,y2],i) => (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1={x-2} y1={(y1+y2)/2} x2={x+2} y2={(y1+y2)/2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </g>
        ))}
      </svg>
    );
  }

  if (c >= 95) {
    // ⛈️ Storm
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M 5 15 Q 5 9 16 9 Q 27 9 27 15 Q 27 20 16 20 Q 5 20 5 15 Z" fill={color} opacity="0.35" />
        <polyline points="18,20 14,26 17,26 13,32" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" fill="none" />
      </svg>
    );
  }

  // Default: overcast / fog
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M 4 17 Q 4 11 16 11 Q 28 11 28 17 Q 28 22 16 22 Q 4 22 4 17 Z" fill={color} opacity="0.4" />
      <line x1="7" y1="25" x2="25" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="10" y1="28" x2="22" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

// ── Rating badge ──────────────────────────────────────────────────────────────
function ratingStyle(rating: AdvisoryData["rating"], accent: string) {
  switch (rating) {
    case "Prime conditions": return { bg: `${accent}28`, color: accent, border: `${accent}66` };
    case "Good":             return { bg: "rgba(61,107,131,0.18)", color: "#3D6B83", border: "rgba(61,107,131,0.4)" };
    case "Fair":             return { bg: "rgba(120,113,108,0.2)", color: "#d6c5b0", border: "rgba(120,113,108,0.35)" };
    case "Tough":            return { bg: "rgba(185,28,28,0.18)", color: "#f87171", border: "rgba(185,28,28,0.4)" };
    default:                 return { bg: "rgba(120,113,108,0.18)", color: "#d6c5b0", border: "rgba(120,113,108,0.3)" };
  }
}

// ── Pressure arrow ────────────────────────────────────────────────────────────
function PressureArrow({ trend, color }: { trend: "rising" | "steady" | "falling"; color: string }) {
  if (trend === "rising")  return <TrendingUp  size={16} style={{ color }} />;
  if (trend === "falling") return <TrendingDown size={16} style={{ color }} />;
  return <Minus size={16} style={{ color }} />;
}

// ── Single data row ───────────────────────────────────────────────────────────
function DataRow({
  icon, label, value, sub, accentColor, dividerColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accentColor: string;
  dividerColor: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${dividerColor}` }}>
      <div className="shrink-0 w-8 flex items-center justify-center" style={{ color: accentColor, opacity: 0.85 }}>
        {icon}
      </div>
      <span className="font-['Inter'] text-[10px] uppercase tracking-[0.18em] w-24 shrink-0" style={{ color: "rgba(37,45,30,0.50)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 ml-auto text-right">
        <span className="font-['Cormorant_Garamond'] text-base" style={{ color: "#f5e6cc" }}>{value}</span>
        {sub && <span className="font-['Inter'] text-[10px] italic" style={{ color: "rgba(214,197,176,0.5)" }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── Tide timeline SVG ─────────────────────────────────────────────────────────
function TideTimeline({ predictions, accentColor }: { predictions: TidePrediction[]; accentColor: string }) {
  const W = 400, H = 64, PAD_X = 28, PAD_Y = 12;
  const innerW = W - PAD_X * 2, innerH = H - PAD_Y * 2;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const points = predictions.map(p => {
    const [, timePart] = p.t.split(" ");
    const [hh, mm] = timePart.split(":").map(Number);
    return { min: hh * 60 + mm, val: parseFloat(p.v), type: p.type };
  });

  if (!points.length) return null;
  const vals = points.map(p => p.val);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = (m: number) => PAD_X + (m / 1440) * innerW;
  const toY = (v: number) => PAD_Y + innerH - ((v - minV) / range) * innerH;
  const poly = points.map(p => `${toX(p.min)},${toY(p.val)}`).join(" ");
  const nowX = Math.max(PAD_X, Math.min(W - PAD_X, toX(nowMin)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <line x1={PAD_X} y1={H - PAD_Y} x2={W - PAD_X} y2={H - PAD_Y} stroke="rgba(214,197,176,0.12)" strokeWidth="1" />
      <polyline points={poly} fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
      {points.map((p, i) => {
        const x = toX(p.min), y = toY(p.val);
        const isHigh = p.type === "H";
        const labelY = isHigh ? y - 7 : y + 14;
        const hh = Math.floor(p.min / 60), mm = p.min % 60;
        const ampm = hh >= 12 ? "PM" : "AM";
        const h12 = hh % 12 || 12;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3.5} fill={accentColor} opacity="0.85" />
            <text x={x} y={labelY} textAnchor="middle" fontSize="7.5" fontFamily="Lora, serif" fill="rgba(214,197,176,0.65)">
              {p.type} {h12}:{String(mm).padStart(2,"0")} {ampm}
            </text>
          </g>
        );
      })}
      <line x1={nowX} y1={PAD_Y} x2={nowX} y2={H - PAD_Y} stroke={accentColor} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.9" />
      <polygon points={`${nowX-4},${PAD_Y} ${nowX+4},${PAD_Y} ${nowX},${PAD_Y+5}`} fill={accentColor} opacity="0.9" />
    </svg>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ConditionsSkeleton({ mode }: { mode: "fresh" | "salt" }) {
  const t = mode === "salt" ? sw : fw;
  return (
    <div className="rounded-sm overflow-hidden animate-pulse" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.divider}` }}>
        <div className="h-5 w-32 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.08)" }} />
        <div className="h-3 w-20 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.06)" }} />
      </div>
      <div className="px-4 py-3 space-y-2" style={{ borderBottom: `1px solid ${t.divider}` }}>
        <div className="h-3 w-full rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.06)" }} />
        <div className="h-3 w-4/5 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.05)" }} />
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <div className="w-8 h-6 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.07)" }} />
          <div className="w-20 h-2.5 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.06)" }} />
          <div className="ml-auto w-16 h-4 rounded-sm" style={{ backgroundColor: "rgba(214,197,176,0.07)" }} />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ConditionsCardProps {
  lat: number;
  lon: number;
  mode: "fresh" | "salt";
  tideStation?: string;
}

export function ConditionsCard({ lat, lon, mode, tideStation }: ConditionsCardProps) {
  const [data, setData] = useState<AdvisoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const t = mode === "salt" ? sw : fw;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/conditions/advisory?lat=${lat}&lon=${lon}&mode=${mode}&tideStation=${tideStation ?? ""}`);
        if (!res.ok) throw new Error();
        const json: AdvisoryData = await res.json();
        if (!cancelled) { setData(json); setLoading(false); }
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [lat, lon, mode, tideStation]);

  if (loading) return <ConditionsSkeleton mode={mode} />;
  if (error || !data) {
    return (
      <div className="rounded-sm px-4 py-3" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
        <p className="font-['Inter'] text-sm italic" style={{ color: t.faint }}>Conditions unavailable.</p>
        <p className="font-['Inter'] italic text-[11px] mt-1" style={{ color: "#9ca3af" }}>Set your home water in Trips to see live USGS gauge data here.</p>
      </div>
    );
  }

  const badge = ratingStyle(data.rating, t.accent);
  const trend = data.pressure_trend ?? "steady";
  const updatedLabel = (() => {
    try { return new Date(data.updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
    catch { return data.updated; }
  })();

  return (
    <div className="rounded-sm overflow-hidden" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>

      {/* ── Header: rating + weather icon + station ─────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.divider}` }}>
        <div className="flex items-center gap-3">
          {/* Weather icon */}
          <WeatherIcon code={data.weather_code} size={32} color={t.accent} />
          {/* Rating badge */}
          <div className="px-3 py-1 rounded-sm" style={{ backgroundColor: badge.bg, border: `1px solid ${badge.border}` }}>
            <span className="font-['Inter'] text-xs uppercase tracking-widest" style={{ color: badge.color }}>
              {data.rating}
            </span>
          </div>
        </div>
        {data.station_name && (
          <div className="flex items-center gap-1.5">
            <MapPin size={10} style={{ color: t.faint }} />
            <span className="font-['Inter'] text-xs italic" style={{ color: t.faint }}>{data.station_name}</span>
          </div>
        )}
      </div>

      {/* ── Advisory text ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${t.divider}` }}>
        <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: t.muted }}>{data.advisory}</p>
      </div>

      {/* ── Horizontal data rows ───────────────────────────────────────────────── */}
      {mode === "fresh" ? (
        <>
          {data.flow != null && (
            <DataRow
              icon={<Droplets size={18} />}
              label="Flow"
              value={`${data.flow} ${data.flow_unit ?? "cfs"}`}
              sub={data.wadeability}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.water_temp != null && (
            <DataRow
              icon={<Thermometer size={18} />}
              label="Water temp"
              value={`${data.water_temp}°F`}
              sub={data.temp_advisory?.split(" ").slice(0,3).join(" ")}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.air_temp != null && (
            <DataRow
              icon={<WeatherIcon code={data.weather_code} size={18} color={t.accent} />}
              label="Air temp"
              value={`${data.air_temp}°F`}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.wind_speed != null && (
            <DataRow
              icon={<Wind size={18} />}
              label="Wind"
              value={`${data.wind_speed} mph`}
              sub={data.wind_dir}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          <DataRow
            icon={<PressureArrow trend={trend} color={t.accent} />}
            label="Pressure"
            value={trend.charAt(0).toUpperCase() + trend.slice(1)}
            accentColor={t.accent}
            dividerColor="transparent"
          />
        </>
      ) : (
        <>
          {data.tide_stage && (
            <DataRow
              icon={<Waves size={18} />}
              label="Tide stage"
              value={data.tide_stage}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.next_tide_time && (
            <DataRow
              icon={<Clock size={18} />}
              label="Next tide"
              value={data.next_tide_time}
              sub={data.next_tide_height != null ? `${data.next_tide_height.toFixed(1)} ft ${data.next_tide_type ?? ""}` : undefined}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.air_temp != null && (
            <DataRow
              icon={<Thermometer size={18} />}
              label="Air temp"
              value={`${data.air_temp}°F`}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          {data.wind_speed != null && (
            <DataRow
              icon={<Wind size={18} />}
              label="Wind"
              value={`${data.wind_speed} mph`}
              sub={data.wind_dir}
              accentColor={t.accent}
              dividerColor={t.divider}
            />
          )}
          <DataRow
            icon={<PressureArrow trend={trend} color={t.accent} />}
            label="Pressure"
            value={trend.charAt(0).toUpperCase() + trend.slice(1)}
            accentColor={t.accent}
            dividerColor={data.tide_predictions?.length ? t.divider : "transparent"}
          />
          {data.tide_predictions && data.tide_predictions.length > 0 && (
            <div className="px-3 py-3">
              <p className="font-['Inter'] text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: t.faint }}>Today's tide</p>
              <TideTimeline predictions={data.tide_predictions} accentColor={t.accent} />
            </div>
          )}
        </>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: `1px solid ${t.divider}` }}>
        <span className="font-['Inter'] text-[10px] uppercase tracking-widest" style={{ color: "rgba(37,45,30,0.45)" }}>
          {mode === "salt" ? "NOAA CO-OPS" : "USGS"}
        </span>
        <div className="flex items-center gap-1.5">
          <Clock size={9} style={{ color: "rgba(26,34,44,0.42)" }} />
          <span className="font-['Inter'] text-[10px]" style={{ color: "rgba(26,34,44,0.42)" }}>Updated {updatedLabel}</span>
        </div>
      </div>
    </div>
  );
}
