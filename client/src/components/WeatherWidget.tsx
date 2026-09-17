/**
 * WeatherWidget.tsx
 * Open-Meteo powered fishing conditions widget.
 * FW: amber palette. SW: slate blue palette. No teal.
 */

import { useWaterMode } from "@/lib/waterModeContext";

export interface OpenMeteoConditions {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDir: string;
  pressure_inHg: number | null;
  pressure_trend: "Rising" | "Falling" | "Steady";
  pressure_advisory: string;
  cloudPct: number;
  precipIn: number;
  uvIndex: number;
  description: string;
  cloudNote: string;
  windNote: string;
  uvNote: string;
  forecast: ForecastDay[];
  // SW only
  wave_height_ft: number | null;
  wave_period_s: number | null;
  swell_height_ft: number | null;
  wave_dir: string;
  updated_at: string;
}

export interface ForecastDay {
  date: string;
  temp_high: number;
  temp_low: number;
  wind_max: number;
  gust_max: number;
  precip: number;
  sunrise: string;
  sunset: string;
  uv_max: number;
}

interface WeatherWidgetProps {
  conditions: OpenMeteoConditions | null;
  loading: boolean;
}

// ── Fishing rating ─────────────────────────────────────────────────────────

function getFishingRating(c: OpenMeteoConditions, isSalt: boolean): "PRIME" | "GOOD" | "SLOW" {
  let score = 0;
  if (c.pressure_trend === "Falling") score += 2;
  else if (c.pressure_trend === "Steady") score += 1;
  if (isSalt) {
    if (c.temp >= 72 && c.temp <= 86) score += 1;
    if (c.windSpeed < 15) score += 1;
    if (c.wave_height_ft !== null && c.wave_height_ft < 2) score += 1;
  } else {
    if (c.temp >= 50 && c.temp <= 68) score += 1;
    if (c.cloudPct > 30 && c.cloudPct < 80) score += 1;
    if (c.windSpeed < 12) score += 1;
  }
  if (score >= 4) return "PRIME";
  if (score >= 2) return "GOOD";
  return "SLOW";
}

// ── WMO code → emoji ────────────────────────────────────────────────────────

function cloudIcon(cloudPct: number, precip: number): string {
  if (precip > 0.1) return "🌧";
  if (cloudPct < 20) return "☀";
  if (cloudPct < 50) return "⛅";
  if (cloudPct < 85) return "🌥";
  return "☁";
}

// ── Pressure arrow ─────────────────────────────────────────────────────────

function PressureArrow({ trend, accent }: { trend: string; accent: string }) {
  if (trend === "Falling") return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" />
    </svg>
  );
  if (trend === "Rising") return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="rgba(120,120,120,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="rgba(120,120,120,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

// ── Forecast day tile ───────────────────────────────────────────────────────

function ForecastTile({ day, tokens }: { day: ForecastDay; tokens: any }) {
  const label = (() => {
    const d = new Date(day.date + "T12:00:00");
    const today = new Date();
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  })();

  const icon = day.precip > 0.15 ? "🌧" : day.uv_max > 7 ? "☀" : "⛅";

  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-sm min-w-0"
      style={{ backgroundColor: tokens.tileBg, border: `1px solid ${tokens.tileBorder}` }}>
      <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter'] uppercase tracking-widest">{label}</p>
      <span style={{ fontSize: 16, lineHeight: 1.2 }}>{icon}</span>
      <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: tokens.textPrimary }}>{day.temp_high}°</p>
      <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter']">{day.temp_low}°</p>
      <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter'] text-center">{day.wind_max}mph</p>
    </div>
  );
}

// ── Stat pill ───────────────────────────────────────────────────────────────

function StatPill({ label, value, note, tokens }: { label: string; value: string; note?: string; tokens: any }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-sm"
      style={{ backgroundColor: tokens.tileBg, border: `1px solid ${tokens.tileBorder}` }}>
      <p style={{ color: tokens.textMuted, fontSize: "8px" }} className="font-['Inter'] uppercase tracking-widest">{label}</p>
      <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: tokens.textPrimary }}>{value}</p>
      {note && <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter'] italic leading-tight">{note}</p>}
    </div>
  );
}



// Direction string → degrees (for compass)
const DIR_DEG: Record<string, number> = {
  N:0,NNE:22,NE:45,ENE:67,E:90,ESE:112,SE:135,SSE:157,
  S:180,SSW:202,SW:225,WSW:247,W:270,WNW:292,NW:315,NNW:337
};

// ── Compass rose ────────────────────────────────────────────────────────────

function CompassRose({ degrees, accent, muted }: { degrees: number; accent: string; muted: string }) {
  return (
    <svg viewBox="0 0 64 64" width={52} height={52} style={{ flexShrink: 0 }}>
      {/* Outer ring */}
      <circle cx="32" cy="32" r="30" fill="none" stroke={muted} strokeWidth="1" opacity="0.3" />
      {/* Cardinal tick marks */}
      {[0, 90, 180, 270].map(a => {
        const rad = (a - 90) * Math.PI / 180;
        return (
          <line key={a}
            x1={32 + 24 * Math.cos(rad)} y1={32 + 24 * Math.sin(rad)}
            x2={32 + 30 * Math.cos(rad)} y2={32 + 30 * Math.sin(rad)}
            stroke={muted} strokeWidth="1.5" opacity="0.5" />
        );
      })}
      {/* N label */}
      <text x="32" y="10" textAnchor="middle" fontSize="7" fill={muted} fontFamily="Lora,serif" fontWeight="600" opacity="0.7">N</text>
      {/* Wind arrow — points FROM the origin wind direction */}
      <g transform={`rotate(${degrees}, 32, 32)`}>
        {/* Shaft */}
        <line x1="32" y1="44" x2="32" y2="20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        {/* Arrowhead */}
        <polygon points="32,14 28,22 36,22" fill={accent} />
        {/* Tail feathers */}
        <line x1="29" y1="44" x2="32" y2="38" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="44" x2="32" y2="38" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ── Main widget ─────────────────────────────────────────────────────────────

export function WeatherWidget({ conditions, loading }: WeatherWidgetProps) {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";

  const tokens = isSalt ? {
    bg: "#DDE4EC",
    border: "rgba(61,107,131,0.25)",
    divider: "rgba(61,107,131,0.12)",
    accent: "#3D6B83",
    textPrimary: "#1A2A38",
    textBody: "rgba(26,34,44,0.78)",
    textMuted: "rgba(26,34,44,0.48)",
    tileBg: "rgba(61,107,131,0.07)",
    tileBorder: "rgba(61,107,131,0.15)",
    primeBg: "rgba(61,107,131,0.15)",
    primeBorder: "rgba(61,107,131,0.5)",
    primeColor: "#3D6B83",
  } : {
    bg: "#E4E7D8",
    border: "rgba(167,122,58,0.25)",
    divider: "rgba(167,122,58,0.12)",
    accent: "#A67A3A",
    textPrimary: "#2F2B1E",
    textBody: "rgba(37,45,30,0.78)",
    textMuted: "rgba(37,45,30,0.48)",
    tileBg: "rgba(120,80,20,0.07)",
    tileBorder: "rgba(167,122,58,0.15)",
    primeBg: "rgba(160,118,58,0.15)",
    primeBorder: "rgba(160,118,58,0.5)",
    primeColor: "#A67A3A",
  };

  if (loading) {
    return (
      <div className="rounded-sm p-5 animate-pulse" style={{ backgroundColor: tokens.bg, border: `1px solid ${tokens.border}` }}>
        <div className="flex gap-4 items-center mb-4">
          <div className="w-10 h-10 rounded-sm" style={{ backgroundColor: tokens.tileBg }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-sm w-1/4" style={{ backgroundColor: tokens.tileBg }} />
            <div className="h-6 rounded-sm w-1/3" style={{ backgroundColor: tokens.tileBg }} />
            <div className="h-3 rounded-sm w-1/2" style={{ backgroundColor: tokens.tileBg }} />
          </div>
          <div className="w-16 h-12 rounded-sm" style={{ backgroundColor: tokens.tileBg }} />
        </div>
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <div key={i} className="flex-1 h-20 rounded-sm" style={{ backgroundColor: tokens.tileBg }} />)}
        </div>
      </div>
    );
  }

  if (!conditions) return null;

  const rating = getFishingRating(conditions, isSalt);
  const icon = cloudIcon(conditions.cloudPct, conditions.precipIn);

  const ratingStyle = rating === "PRIME"
    ? { bg: tokens.primeBg, border: tokens.primeBorder, color: tokens.primeColor }
    : rating === "GOOD"
    ? { bg: tokens.tileBg, border: tokens.tileBorder, color: tokens.textBody }
    : { bg: "transparent", border: tokens.divider, color: tokens.textMuted };

  const ratingSubtext = rating === "PRIME" ? "Best window" : rating === "GOOD" ? "Worth going" : "Fish deeper";

  const trendShort = conditions.pressure_trend === "Falling"
    ? "Falling, fish active"
    : conditions.pressure_trend === "Rising"
    ? "Rising, fish deeper"
    : "Steady, consistent";

  return (
    <div className="rounded-sm overflow-hidden" style={{ backgroundColor: tokens.bg, border: `1px solid ${tokens.border}` }}>

      {/* ── Row 1: Current conditions ── */}
      <div className="flex items-stretch">

        {/* Pressure */}
        <div className="flex flex-col items-center justify-center gap-1 px-3 py-4 shrink-0"
          style={{ borderRight: `1px solid ${tokens.divider}`, minWidth: 78 }}>
          <PressureArrow trend={conditions.pressure_trend} accent={tokens.accent} />
          <p style={{ color: tokens.textMuted, fontSize: "8px" }} className="font-['Inter'] uppercase tracking-widest text-center">Pressure</p>
          {conditions.pressure_inHg && (
            <p className="font-['Cormorant_Garamond'] text-sm" style={{ color: tokens.accent }}>
              {conditions.pressure_inHg}<span style={{ fontSize: "9px", color: tokens.textMuted }} className="font-['Inter']"> inHg</span>
            </p>
          )}
          <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter'] text-center leading-tight">{trendShort}</p>
        </div>

        {/* Temp + conditions */}
        <div className="flex-1 flex flex-col justify-center px-4 py-4 gap-1.5 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span style={{ fontSize: 28 }}>{icon}</span>
            <p className="font-['Cormorant_Garamond'] text-3xl" style={{ color: tokens.textPrimary }}>
              {conditions.temp}°<span className="font-['Inter'] text-sm" style={{ color: tokens.textMuted }}>F</span>
            </p>
            <p className="font-['Inter'] text-sm capitalize" style={{ color: tokens.textBody }}>{conditions.description}</p>
          </div>
          <p style={{ color: tokens.textMuted, fontSize: "11px" }} className="font-['Inter']">
            Feels {conditions.feelsLike}° · Humidity {conditions.humidity}% · Wind {conditions.windSpeed} mph {conditions.windDir}
            {conditions.windGust > conditions.windSpeed + 5 ? `, gusts ${conditions.windGust}` : ""}
          </p>
          <p style={{ color: tokens.textMuted, fontSize: "11px" }} className="font-['Inter'] italic">
            {conditions.windNote}
          </p>
        </div>

        {/* Fishing rating */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 shrink-0"
          style={{ borderLeft: `1px solid ${tokens.divider}`, minWidth: 72 }}>
          <p style={{ color: tokens.textMuted, fontSize: "8px" }} className="font-['Inter'] uppercase tracking-widest">Fishing</p>
          <div className="px-2.5 py-1.5 rounded-sm text-center"
            style={{ backgroundColor: ratingStyle.bg, border: `1px solid ${ratingStyle.border}` }}>
            <p className="font-['Cormorant_Garamond'] font-semibold tracking-wide" style={{ color: ratingStyle.color, fontSize: 13 }}>
              {rating}
            </p>
          </div>
          <p style={{ color: tokens.textMuted, fontSize: "9px" }} className="font-['Inter'] text-center">{ratingSubtext}</p>
        </div>
      </div>

      {/* ── Row 2: Fishing stat pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 pb-3 pt-2"
        style={{ borderTop: `1px solid ${tokens.divider}` }}>
        <StatPill label="Cloud cover" value={`${conditions.cloudPct}%`} note={conditions.cloudNote} tokens={tokens} />
        <StatPill label="UV index" value={`${conditions.uvIndex}`} note={conditions.uvNote} tokens={tokens} />
        {isSalt && conditions.wave_height_ft !== null ? (
          <StatPill
            label="Wave height"
            value={`${conditions.wave_height_ft} ft`}
            note={conditions.wave_height_ft < 1 ? "Calm — ideal flats wading" : conditions.wave_height_ft < 2.5 ? "Manageable — watch footing" : "Rough — wade with caution"}
            tokens={tokens}
          />
        ) : (
          <StatPill label="Precip" value={`${conditions.precipIn}"`} note={conditions.precipIn === 0 ? "Dry conditions" : "Check for runoff"} tokens={tokens} />
        )}
        {isSalt && conditions.wave_period_s !== null ? (
          <StatPill
            label="Wave period"
            value={`${conditions.wave_period_s}s`}
            note={conditions.wave_period_s >= 10 ? "Long swell — fish pushing in" : "Short chop — fish holding deep"}
            tokens={tokens}
          />
        ) : (
          <StatPill label="Wind gust" value={`${conditions.windGust} mph`} note={conditions.windGust < 15 ? "Manageable" : "Tough casting"} tokens={tokens} />
        )}
      </div>

      {/* ── Wind panel ── */}
      <div className="px-3 pb-3 pt-2" style={{ borderTop: `1px solid ${tokens.divider}` }}>
        <p style={{ color: tokens.textMuted, fontSize: "8px" }} className="font-[\'Lora\'] uppercase tracking-widest pb-2">Wind conditions</p>
        <div className="flex items-center gap-4">
          <CompassRose degrees={DIR_DEG[conditions.windDir] ?? 0} accent={tokens.accent} muted={tokens.textMuted} />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-[\'Cormorant_Garamond\'] text-2xl font-semibold" style={{ color: tokens.textPrimary }}>
                {conditions.windSpeed}
              </span>
              <span className="font-[\'Lora\'] text-sm" style={{ color: tokens.textMuted }}>mph</span>
              <span className="font-[\'Cormorant_Garamond\'] font-semibold text-sm" style={{ color: tokens.accent }}>
                {conditions.windDir}
              </span>
              {conditions.windGust > conditions.windSpeed + 4 && (
                <span className="font-[\'Lora\'] text-xs" style={{ color: tokens.textMuted }}>
                  gusts {conditions.windGust} mph
                </span>
              )}
            </div>
            <p style={{ color: tokens.textBody, fontSize: "11px" }} className="font-[\'Lora\'] italic leading-snug">
              {conditions.windNote}
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 3: 4-day outlook ── */}
      {conditions.forecast.length > 0 && (
        <div className="px-3 pb-3" style={{ borderTop: `1px solid ${tokens.divider}` }}>
          <p style={{ color: tokens.textMuted, fontSize: "8px" }} className="font-['Inter'] uppercase tracking-widest pt-2 pb-2">
            4-day outlook
          </p>
          <div className="flex gap-2">
            {conditions.forecast.slice(0, 4).map((day, i) => (
              <ForecastTile key={i} day={day} tokens={tokens} />
            ))}
          </div>
        </div>
      )}

      {/* ── Pressure advisory ── */}
      <div className="px-3 pb-3 pt-1" style={{ borderTop: `1px solid ${tokens.divider}` }}>
        <p style={{ color: tokens.textBody, fontSize: "11px" }} className="font-['Inter'] italic">
          {conditions.pressure_advisory}
        </p>
      </div>

    </div>
  );
}
