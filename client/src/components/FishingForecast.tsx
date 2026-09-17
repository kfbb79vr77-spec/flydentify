/**
 * FishingForecast.tsx
 * AI Fishing Day Score — the hero card on Home.
 * Premium users see full detail. Free users see the score blurred with an upgrade prompt.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Droplets, Thermometer, Wind, Bug, Users, Lock, ChevronRight, RefreshCw } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { apiRequest } from "@/lib/queryClient";

const API_BASE = ("__PORT_5000__" as string).startsWith("__") ? "" : "__PORT_5000__";

// ── Design tokens (inline, no teal) ──────────────────────────────────────────
const tok = {
  amber: "#A67A3A",
  saltBlue: "#3D6B83",
  fwBg: "#EFE8D7",
  swBg: "#EEF2F4",
  fwText: "#2F2B1E",
  swText: "#1A2A38",
};

interface ForecastData {
  score: number;
  grade: string;
  color: string;
  arrivalTime: string;
  bestStretch: string;
  bestFly: string;
  likelyHatch: string;
  targetSpecies: string;
  reasons: string[];
  dimensions: {
    flow: number;
    temperature: number;
    weather: number;
    hatch: number;
    pressure: number;
  };
  generatedAt: string;
}

interface PreviewData {
  score: number;
  grade: string;
  color: string;
}

const DIMENSION_ICONS = [
  { key: "flow",        label: "Water level",   Icon: Droplets },
  { key: "temperature", label: "Temperature",   Icon: Thermometer },
  { key: "weather",     label: "Weather",       Icon: Wind },
  { key: "hatch",       label: "Hatch activity",Icon: Bug },
  { key: "pressure",    label: "Angler pressure",Icon: Users },
];

function ScoreRing({ score, color, size = 120 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const dash = pct * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={8} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function DimBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ height: 4, background: "rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 2, transition: "width 1s ease" }} />
    </div>
  );
}

export default function FishingForecast({ lat, lon, isPremium = false }: {
  lat?: number;
  lon?: number;
  isPremium?: boolean;
}) {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? tok.saltBlue : tok.amber;
  const textColor = isSalt ? tok.swText : tok.fwText;

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userLat, setUserLat] = useState(lat ?? 39.95);
  const [userLon, setUserLon] = useState(lon ?? -105.3);

  useEffect(() => {
    // Try to get user's real location
    if (!lat && !lon && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLon(pos.coords.longitude); },
        () => {} // fall back to Colorado default
      );
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchForecast();
  }, [userLat, userLon, waterMode, isPremium]);

  async function fetchForecast() {
    setLoading(true);
    setError(false);
    try {
      const endpoint = isPremium
        ? `${API_BASE}/api/forecast?lat=${userLat}&lon=${userLon}&mode=${waterMode}`
        : `${API_BASE}/api/forecast/preview?lat=${userLat}&lon=${userLon}&mode=${waterMode}`;
      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error("fetch failed");
      const data = await resp.json();
      if (isPremium) setForecast(data);
      else setPreview(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const scoreData = isPremium ? forecast : preview;
  const score = scoreData?.score ?? 0;
  const grade = scoreData?.grade ?? "Calculating";
  const color = scoreData?.color ?? accent;

  if (loading) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)",
        borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)",
        padding: "28px 24px", textAlign: "center", color: textColor
      }}>
        <RefreshCw size={20} style={{ opacity: 0.4, animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 13, opacity: 0.5, marginTop: 8, fontFamily: "Lora, serif" }}>Reading the water...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.55)", borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.08)", padding: "20px 24px",
        color: textColor, opacity: 0.6, fontSize: 13, fontFamily: "Lora, serif"
      }}>
        Forecast unavailable — check back when conditions data refreshes.
      </div>
    );
  }

  // ── FREE TIER: blurred score teaser ──────────────────────────────────────
  if (!isPremium) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)",
        borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden", position: "relative"
      }}>
        {/* Blurred detail rows */}
        <div style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none", padding: "20px 24px 12px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 80, height: 80, background: "rgba(0,0,0,0.12)", borderRadius: "50%" }} />
            <div>
              <div style={{ width: 120, height: 14, background: "rgba(0,0,0,0.1)", borderRadius: 2, marginBottom: 8 }} />
              <div style={{ width: 80, height: 10, background: "rgba(0,0,0,0.07)", borderRadius: 2 }} />
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: "100%", height: 10, background: "rgba(0,0,0,0.06)", borderRadius: 2, marginTop: 10 }} />
          ))}
        </div>

        {/* Score visible above blur */}
        <div style={{
          position: "absolute", top: 16, left: 24,
          display: "flex", alignItems: "center", gap: 14
        }}>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <ScoreRing score={score} color={color} size={72} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              transform: "rotate(0deg)"
            }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: textColor, lineHeight: 1, fontFamily: "Cormorant Garamond, serif" }}>{score}</span>
              <span style={{ fontSize: 9, opacity: 0.5, color: textColor, fontFamily: "Lora, serif" }}>/100</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, opacity: 0.5, fontFamily: "Lora, serif", color: textColor, marginBottom: 2 }}>Today is a</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: color, fontFamily: "Cormorant Garamond, serif", lineHeight: 1 }}>{score}/100</p>
            <p style={{ fontSize: 13, color: textColor, fontFamily: "Lora, serif" }}>{grade} fishing day</p>
          </div>
        </div>

        {/* CTA overlay */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)"
        }}>
          <div style={{
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
            borderRadius: 4, padding: "16px 24px", textAlign: "center",
            border: `1px solid ${accent}22`, marginTop: 48, maxWidth: 260
          }}>
            <Lock size={16} style={{ color: accent, marginBottom: 8 }} />
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, fontSize: 14, color: textColor, marginBottom: 4 }}>
              Unlock the full forecast
            </p>
            <p style={{ fontFamily: "Lora, serif", fontSize: 11, opacity: 0.6, color: textColor, marginBottom: 12, lineHeight: 1.5 }}>
              Arrival time, best stretch, fly recommendation, and the full 5-dimension breakdown.
            </p>
            <Link href="/pricing" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: accent, color: "#fff", borderRadius: 4,
              padding: "9px 20px", fontFamily: "Lora, serif", fontSize: 13,
              fontWeight: 600, cursor: "pointer", textDecoration: "none", margin: "0 auto"
            }}>
              Start free trial <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── PREMIUM: full forecast card ───────────────────────────────────────────
  if (!forecast) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)",
      borderRadius: 4, border: "1px solid rgba(0,0,0,0.09)",
      overflow: "hidden"
    }}>
      {/* Header row */}
      <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Score ring */}
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <ScoreRing score={forecast.score} color={forecast.color} size={100} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: forecast.color, lineHeight: 1, fontFamily: "Cormorant Garamond, serif" }}>
                {forecast.score}
              </span>
              <span style={{ fontSize: 10, opacity: 0.45, color: textColor, fontFamily: "Lora, serif" }}>/100</span>
            </div>
          </div>
          {/* Grade + label */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45, fontFamily: "Lora, serif", color: textColor, marginBottom: 2 }}>
              Today's fishing forecast
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: forecast.color, fontFamily: "Cormorant Garamond, serif", lineHeight: 1.1, marginBottom: 4 }}>
              {forecast.grade}
            </p>
            <p style={{ fontSize: 13, opacity: 0.65, color: textColor, fontFamily: "Lora, serif" }}>
              {forecast.targetSpecies} — {waterMode === "salt" ? "Saltwater" : "Freshwater"}
            </p>
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", color: textColor, marginBottom: 10 }}>
          Score breakdown
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DIMENSION_ICONS.map(({ key, label, Icon }) => {
            const val = forecast.dimensions[key as keyof typeof forecast.dimensions];
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={13} style={{ color: accent, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontFamily: "Lora, serif", color: textColor, opacity: 0.7, width: 110, flexShrink: 0 }}>{label}</span>
                <DimBar score={val} color={forecast.color} />
                <span style={{ fontSize: 11, fontFamily: "Lora, serif", color: textColor, opacity: 0.6, width: 28, textAlign: "right", flexShrink: 0 }}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why bullets */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", color: textColor, marginBottom: 10 }}>
          Why
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {forecast.reasons.map((r, i) => (
            <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: 14, lineHeight: 1.3, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 13, fontFamily: "Lora, serif", color: textColor, opacity: 0.8, lineHeight: 1.55 }}>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended arrival + best fly */}
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 4, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", color: textColor, marginBottom: 6 }}>
            Recommended arrival
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Cormorant Garamond, serif", color: accent, lineHeight: 1 }}>
            {forecast.arrivalTime}
          </p>
        </div>
        <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 4, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", color: textColor, marginBottom: 6 }}>
            Lead fly
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "Cormorant Garamond, serif", color: textColor, lineHeight: 1.3 }}>
            {forecast.bestFly}
          </p>
        </div>
      </div>

      {/* Best stretch */}
      <div style={{ padding: "0 24px 18px" }}>
        <div style={{ background: `${accent}10`, border: `1px solid ${accent}22`, borderRadius: 4, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45, fontFamily: "Lora, serif", color: textColor, marginBottom: 5 }}>
            Best stretch
          </p>
          <p style={{ fontSize: 13, fontFamily: "Lora, serif", color: textColor, lineHeight: 1.55 }}>
            {forecast.bestStretch}
          </p>
        </div>
      </div>

      {/* Footer: hatch + refresh */}
      <div style={{
        padding: "10px 24px", borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: 11, fontFamily: "Lora, serif", color: textColor, opacity: 0.45 }}>
          {forecast.likelyHatch} hatch expected
        </span>
        <button
          onClick={fetchForecast}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, opacity: 0.4, color: textColor }}
        >
          <RefreshCw size={11} />
          <span style={{ fontSize: 10, fontFamily: "Lora, serif" }}>Refresh</span>
        </button>
      </div>
    </div>
  );
}
