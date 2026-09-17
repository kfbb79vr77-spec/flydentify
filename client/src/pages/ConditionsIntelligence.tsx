/**
 * ConditionsIntelligence.tsx
 *
 * Tier 3: Go / Wait / Prime conditions dashboard.
 * Combines USGS stream data (FW), NOAA tides (SW), barometric pressure,
 * moon phase (computed client-side), and hatch calendar into a single
 * verdict per location.
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import {
  MapPin, RefreshCw, ChevronLeft, Droplets, Thermometer,
  Wind, Moon, TrendingUp, TrendingDown, Minus, AlertTriangle, Fish, Waves, Leaf
} from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";

// ── Design tokens ──────────────────────────────────────────────────────────────
function useTokens(mode: "fresh" | "salt") {
  return mode === "salt"
    ? { bg: "#EEF2F4", card: "#DDE4EC", accent: "#3D6B83", text: "#1A2A38", muted: "rgba(26,34,44,0.55)", faint: "rgba(26,34,44,0.3)", border: "rgba(61,107,131,0.2)", strip: "#060D1A", stripText: "#f5e6cc" }
    : { bg: "#EFE8D7", card: "#E4E7D8", accent: "#A67A3A", text: "#2F2B1E", muted: "rgba(37,45,30,0.55)", faint: "rgba(37,45,30,0.3)", border: "rgba(160,118,58,0.2)", strip: "#0D1B33", stripText: "#f5e6cc" };
}

// ── Moon phase calculator (no API needed) ──────────────────────────────────────
function getMoonPhase(date = new Date()): { name: string; emoji: string; fishingNote: string; score: number } {
  const known = new Date(2000, 0, 6, 18, 14); // known new moon Jan 6 2000
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diff % cycle) + cycle) % cycle;
  if (phase < 1.85)  return { name: "New moon",        emoji: "🌑", fishingNote: "New moon. Low light, fish feed aggressively at dawn and dusk.", score: 2 };
  if (phase < 5.53)  return { name: "Waxing crescent", emoji: "🌒", fishingNote: "Waxing crescent. Building solunar activity.", score: 1 };
  if (phase < 9.22)  return { name: "First quarter",   emoji: "🌓", fishingNote: "First quarter. Moderate solunar activity.", score: 1 };
  if (phase < 12.91) return { name: "Waxing gibbous",  emoji: "🌔", fishingNote: "Waxing gibbous. Increasing feeding windows.", score: 1 };
  if (phase < 16.61) return { name: "Full moon",        emoji: "🌕", fishingNote: "Full moon. Peak solunar activity. Prime feeding windows.", score: 3 };
  if (phase < 20.30) return { name: "Waning gibbous",  emoji: "🌖", fishingNote: "Waning gibbous. Post-full, still strong solunar pull.", score: 2 };
  if (phase < 23.99) return { name: "Last quarter",    emoji: "🌗", fishingNote: "Last quarter. Moderate solunar activity.", score: 1 };
  if (phase < 27.68) return { name: "Waning crescent", emoji: "🌘", fishingNote: "Waning crescent. Quieter phase, sight-fishing favored.", score: 1 };
  return                  { name: "New moon",           emoji: "🌑", fishingNote: "New moon. Low light, fish feed aggressively at dawn and dusk.", score: 2 };
}

// ── Geocode helper ─────────────────────────────────────────────────────────────
async function geocode(query: string): Promise<{ lat: number; lon: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const r = await fetch(url, { headers: { "Accept-Language": "en" } });
    const j = await r.json();
    if (!j.length) return null;
    return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon), display: j[0].display_name.split(",").slice(0, 2).join(",") };
  } catch { return null; }
}

// ── NOAA station nearest to lon (Gulf + Atlantic common stations) ───────────────
function nearestTideStation(lat: number, lon: number): string {
  const stations = [
    { id: "8771450", lat: 29.72, lon: -95.27, name: "Galveston" },
    { id: "8760922", lat: 29.23, lon: -89.96, name: "Grand Isle" },
    { id: "8723214", lat: 25.73, lon: -80.16, name: "Miami" },
    { id: "8518750", lat: 40.69, lon: -74.01, name: "Battery NY" },
    { id: "9414290", lat: 37.79, lon: -122.39, name: "San Francisco" },
    { id: "9447130", lat: 47.60, lon: -122.34, name: "Seattle" },
    { id: "8410140", lat: 43.65, lon: -70.25, name: "Portland ME" },
    { id: "8461490", lat: 41.36, lon: -72.09, name: "New London" },
    { id: "8720218", lat: 30.40, lon: -81.63, name: "Jacksonville" },
    { id: "8656483", lat: 34.72, lon: -76.70, name: "Beaufort NC" },
  ];
  let best = stations[0], bestDist = Infinity;
  for (const s of stations) {
    const d = Math.hypot(s.lat - lat, s.lon - lon);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best.id;
}

// ── Verdict chip ───────────────────────────────────────────────────────────────
function VerdictChip({ score }: { score: number }) {
  const cfg =
    score >= 5 ? { label: "GO", bg: "#166534", text: "#dcfce7", border: "#15803d" } :
    score >= 3 ? { label: "GOOD", bg: "#92400e", text: "#fef3c7", border: "#A67A3A" } :
    score >= 1 ? { label: "FAIR", bg: "#1e3a5f", text: "#dbeafe", border: "#3b82f6" } :
                 { label: "WAIT", bg: "#4b1c1c", text: "#fee2e2", border: "#ef4444" };
  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span className="font-['Cormorant_Garamond'] text-3xl font-bold tracking-widest" style={{ color: cfg.text }}>{cfg.label}</span>
    </div>
  );
}

// ── Stat row ───────────────────────────────────────────────────────────────────
function StatRow({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="w-5 flex-shrink-0" style={{ color }}>{icon}</div>
      <span className="font-['Inter'] text-xs w-28 flex-shrink-0" style={{ color: "rgba(37,45,30,0.5)" }}>{label}</span>
      <div>
        <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color }}>{value}</span>
        {sub && <span className="font-['Inter'] text-xs ml-2" style={{ color: "rgba(37,45,30,0.45)" }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ConditionsIntelligence() {
  const { waterMode } = useWaterMode();
  const t = useTokens(waterMode);
  const moon = getMoonPhase();

  const [locationInput, setLocationInput] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState("");

  // Data state
  const [advisory, setAdvisory] = useState<any>(null);
  const [advLoading, setAdvLoading] = useState(false);

  // Score components
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [factors, setFactors] = useState<Array<{ label: string; value: string; note: string; score: number; icon: React.ReactNode }>>([]);

  const fetchAll = useCallback(async (lat: number, lon: number) => {
    setAdvLoading(true);
    setAdvisory(null);
    setTotalScore(null);
    setFactors([]);

    const tideStation = nearestTideStation(lat, lon);
    try {
      const res = await fetch(`/api/conditions/advisory?lat=${lat}&lon=${lon}&mode=${waterMode}&tideStation=${tideStation}`);
      const data = await res.json();
      setAdvisory(data);

      // Build factor breakdown
      const f: typeof factors = [];
      let score = 0;

      // Moon phase (always present)
      f.push({
        label: "Moon phase",
        value: `${moon.emoji} ${moon.name}`,
        note: moon.fishingNote,
        score: moon.score,
        icon: <Moon size={16} />,
      });
      score += Math.min(moon.score, 2);

      // FW: Flow
      if (waterMode === "fresh" && data.river && !data.river.error) {
        const r = data.river;
        const s = r.wadeability === "Fishable" ? 2 : r.wadeability === "Wadeable with care" ? 1 : 0;
        f.push({ label: "River flow", value: r.flow_cfs != null ? `${r.flow_cfs} cfs` : "—", note: r.wadeability ?? "—", score: s, icon: <Droplets size={16} /> });
        score += s;
      }

      // FW: Water temp
      if (waterMode === "fresh" && data.river && !data.river.error) {
        const r = data.river;
        const s = r.temp_advisory?.includes("Prime") ? 2 : r.temp_advisory?.includes("Cold") || r.temp_advisory?.includes("Warm") ? 1 : 0;
        f.push({ label: "Water temp", value: r.water_temp_f != null ? `${r.water_temp_f}°F` : "—", note: r.temp_advisory ?? "—", score: s, icon: <Thermometer size={16} /> });
        score += s;
      }

      // SW: Tide
      if (waterMode === "salt" && data.tides && !data.tides.error) {
        const td = data.tides;
        const s = td.current_stage === "Incoming" || td.current_stage === "High tide" ? 2 : 1;
        f.push({ label: "Tide", value: td.current_stage ?? "—", note: td.advisory ?? "—", score: s, icon: <Waves size={16} /> });
        score += s;
        if (td.next_tide_time) {
          f.push({ label: "Next tide", value: td.next_tide_time, note: td.next_tide_height != null ? `${td.next_tide_height.toFixed(1)} ft ${td.next_tide_type ?? ""}` : "—", score: 0, icon: <TrendingUp size={16} /> });
        }
      }

      // Barometric pressure
      if (data.weather && !data.weather.error) {
        const w = data.weather;
        const trend = w.pressure_trend;
        const s = trend === "Falling" ? 2 : trend === "Steady" ? 1 : 0;
        const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus;
        f.push({ label: "Pressure", value: w.pressure_hpa != null ? `${w.pressure_hpa} hPa` : "—", note: w.pressure_advisory ?? `Trend: ${trend}`, score: s, icon: <TrendIcon size={16} /> });
        score += s;
      }

      // Wind
      if (data.weather && !data.weather.error && data.weather.windSpeed != null) {
        const w = data.weather;
        const spd = w.windSpeed ?? 0;
        const gust = w.windGust ?? spd;
        const dir = w.windDir ?? "";
        // Score: 2=calm, 1=light-moderate, 0=strong
        const s = spd < 8 ? 2 : spd < 18 ? 1 : 0;

        // Hopper season advisory (June–Sept, FW only, 5–22 mph)
        const month = new Date().getMonth();
        const hopperSeason = month >= 5 && month <= 8;
        const hopperTrigger = hopperSeason && waterMode === "fresh" && spd >= 5 && spd <= 22;
        const hopperNote = hopperTrigger
          ? (spd >= 10 && spd <= 18 ? `Prime hopper wind, ${spd} mph ${dir} blowing insects off banks.` : `Hopper wind active, ${spd} mph ${dir}, work downwind banks.`)
          : null;

        const baseNote = spd < 8 ? "Calm. Ideal presentation." : spd < 18 ? "Light to moderate breeze. Manageable." : gust >= 25 ? `Gusty ${gust} mph. Tough casting.` : "Strong wind. Nymph or streamer.";
        f.push({ label: "Wind", value: `${spd} mph ${dir}`, note: hopperNote ?? baseNote, score: s + (hopperTrigger ? 1 : 0), icon: <Wind size={16} /> });
        score += s + (hopperTrigger ? 1 : 0);
      }

      setFactors(f);
      setTotalScore(score);
    } catch (e) {
      setAdvisory({ error: "Could not load conditions" });
    }
    setAdvLoading(false);
  }, [waterMode, moon.name]);

  const handleSearch = async () => {
    const q = locationInput.trim();
    if (!q) return;
    setLoading(true); setLocError("");
    const result = await geocode(q);
    if (result) {
      setLocationLabel(result.display);
      setCoords({ lat: result.lat, lon: result.lon });
      fetchAll(result.lat, result.lon);
    } else {
      setLocError("Location not found. Try a city or zip code.");
    }
    setLoading(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { setLocError("GPS not available."); return; }
    setLoading(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        setLocationLabel("Your location");
        fetchAll(lat, lon);
        setLoading(false);
      },
      () => { setLocError("Could not get GPS location."); setLoading(false); }
    );
  };

  // Auto-detect location on mount so conditions load immediately, without
  // requiring the user to manually tap the GPS button.
  useEffect(() => {
    if (!coords && !locationInput) {
      handleGPS();
    }
  }, []);

  // Score color
  const scoreColor = (s: number) =>
    s >= 2 ? "#166534" : s === 1 ? "#92400e" : "rgba(37,45,30,0.4)";

  const maxScore = factors.reduce((a, f) => a + Math.max(f.score, 0), 0) || 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <button
          onClick={() => { window.location.hash = "/home"; }}
          className="flex items-center gap-1.5 mb-5 font-['Inter'] text-xs uppercase tracking-widest"
          style={{ color: t.muted }}
        >
          <ChevronLeft size={14} /> Back
        </button>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-bold" style={{ color: t.text }}>
            Conditions intelligence
          </h1>
          {waterMode === "salt"
            ? <Waves size={20} style={{ color: t.accent }} />
            : <Leaf size={20} style={{ color: t.accent }} />}
        </div>
        <p className="font-['Inter'] text-sm mb-6" style={{ color: t.muted }}>
          {waterMode === "fresh"
            ? "USGS stream gauges, barometric pressure, moon phase. One verdict."
            : "NOAA tides, barometric pressure, moon phase. One verdict."}
        </p>

        {/* ── Location search ─────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={waterMode === "fresh" ? "City, zip, or river name…" : "Coastal city or zip…"}
            className="flex-1 px-3 py-2.5 rounded-sm font-['Inter'] text-sm outline-none min-h-[44px]"
            style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.text }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2.5 rounded-sm font-['Inter'] text-xs uppercase tracking-widest min-h-[44px]"
            style={{ backgroundColor: t.accent, color: "#fff" }}
          >
            {loading ? "…" : "Search"}
          </button>
          <button
            onClick={handleGPS}
            disabled={loading}
            className="px-3 py-2.5 rounded-sm min-h-[44px]"
            style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.accent }}
            title="Use my location"
          >
            <MapPin size={16} />
          </button>
        </div>
        {locError && <p className="font-['Inter'] text-xs mt-1" style={{ color: "#ef4444" }}>{locError}</p>}
      </div>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {!coords && !advLoading && (
        <div className="px-4 max-w-2xl mx-auto">
          <div className="rounded-sm p-6 text-center" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
            <Fish size={32} className="mx-auto mb-3" style={{ color: t.faint }} />
            <p className="font-['Cormorant_Garamond'] text-base" style={{ color: t.muted }}>
              Enter a location to get your go / wait verdict
            </p>
            <p className="font-['Inter'] text-xs mt-1" style={{ color: t.faint }}>
              Powered by USGS stream gauges{waterMode === "salt" ? " · NOAA CO-OPS tides" : ""} · Open-Meteo weather
            </p>
          </div>

          {/* Moon phase always visible */}
          <div className="mt-4 rounded-sm p-4 flex items-start gap-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
            <span className="text-3xl leading-none">{moon.emoji}</span>
            <div>
              <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: t.text }}>{moon.name}</p>
              <p className="font-['Inter'] text-xs mt-0.5" style={{ color: t.muted }}>{moon.fishingNote}</p>
            </div>
          </div>
        </div>
      )}

      {advLoading && (
        <div className="px-4 max-w-2xl mx-auto">
          <div className="rounded-sm p-8 text-center" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin" style={{ color: t.accent }} />
            <p className="font-['Inter'] text-sm" style={{ color: t.muted }}>Reading live conditions…</p>
            <p className="font-['Inter'] text-xs mt-1" style={{ color: t.faint }}>
              {waterMode === "fresh" ? "Querying USGS NWIS stream gauges" : "Querying NOAA CO-OPS tide station"}
            </p>
          </div>
        </div>
      )}

      {coords && !advLoading && advisory && (
        <div className="px-4 max-w-2xl mx-auto pb-16">
          {/* Location header */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={13} style={{ color: t.muted }} />
            <span className="font-['Inter'] text-xs" style={{ color: t.muted }}>{locationLabel}</span>
            <button
              onClick={() => fetchAll(coords.lat, coords.lon)}
              className="ml-auto flex items-center gap-1 font-['Inter'] text-xs"
              style={{ color: t.accent }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {advisory.error ? (
            <div className="rounded-sm p-5 flex items-start gap-3" style={{ backgroundColor: t.card, border: `1px solid rgba(239,68,68,0.3)` }}>
              <AlertTriangle size={16} style={{ color: "#ef4444" }} className="mt-0.5 shrink-0" />
              <p className="font-['Inter'] text-sm" style={{ color: t.text }}>Live conditions unavailable for this location. Try a city closer to a USGS gauge or NOAA tide station.</p>
            </div>
          ) : (
            <>
              {/* ── Verdict card ─────────────────────────────────────────── */}
              <div className="rounded-sm p-5 mb-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-['Inter'] text-xs uppercase tracking-widest mb-2" style={{ color: t.faint }}>Today's verdict</p>
                    {totalScore !== null && <VerdictChip score={totalScore} />}
                  </div>
                  <div className="text-right">
                    <p className="font-['Cormorant_Garamond'] text-4xl font-bold" style={{ color: t.accent }}>{totalScore}</p>
                    <p className="font-['Inter'] text-xs" style={{ color: t.faint }}>of {maxScore} pts</p>
                  </div>
                </div>
                {advisory.advisory && (
                  <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: t.text }}>{advisory.advisory}</p>
                )}
              </div>

              {/* ── Factor breakdown ─────────────────────────────────────── */}
              <div className="rounded-sm px-4 pt-3 pb-1 mb-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                <p className="font-['Inter'] text-xs uppercase tracking-widest mb-2" style={{ color: t.faint }}>Factor breakdown</p>
                {factors.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 py-3" style={{ borderBottom: i < factors.length - 1 ? `1px solid ${t.border}` : "none" }}>
                      <div className="w-5 flex-shrink-0 mt-0.5" style={{ color: f.score >= 2 ? "#166534" : f.score === 1 ? t.accent : t.faint }}>{f.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-['Inter'] text-xs uppercase tracking-wide" style={{ color: t.muted }}>{f.label}</span>
                          <div className="flex gap-1">
                            {[0,1,2].map(dot => (
                              <div key={dot} className="w-2 h-2 rounded-full" style={{ backgroundColor: dot < f.score ? (f.score >= 2 ? "#166534" : t.accent) : t.border }} />
                            ))}
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: t.text }}>{f.value}</p>
                        <p className="font-['Inter'] text-xs mt-0.5" style={{ color: t.muted }}>{f.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Data sources footer ──────────────────────────────────── */}
              <div className="rounded-sm px-4 py-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-3" style={{ color: t.faint }}>Powered by live data from</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(waterMode === "fresh" ? [
                    { label: "USGS NWIS", desc: "Real-time stream flow + water temp, updated every 15 min at 10,000+ gauges nationwide", href: "https://waterservices.usgs.gov" },
                    { label: "Open-Meteo", desc: "Hourly weather: barometric pressure, wind speed, cloud cover, precipitation", href: "https://open-meteo.com" },
                    { label: "iNaturalist", desc: "Research-grade insect observation records triangulating what is actually hatching on your water", href: "https://www.inaturalist.org" },
                    { label: "Lunar cycle", desc: "Client-side moon phase calculation (no API) using the Julian date method", href: "" },
                  ] : [
                    { label: "NOAA CO-OPS", desc: "Real-time tide predictions + water level readings from 175+ coastal stations", href: "https://tidesandcurrents.noaa.gov" },
                    { label: "Open-Meteo", desc: "Hourly weather: barometric pressure, wind speed, wave height, precipitation", href: "https://open-meteo.com" },
                    { label: "NOAA Weather", desc: "Hourly marine forecasts and coastal advisory data", href: "https://api.weather.gov" },
                    { label: "Lunar cycle", desc: "Client-side moon phase calculation (no API) using the Julian date method", href: "" },
                  ]).map(s => (
                    <div key={s.label} className="flex gap-2.5 items-start">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: t.accent, marginTop: 5 }} />
                      <div>
                        {s.href ? (
                          <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-['Cormorant_Garamond'] text-xs font-semibold hover:underline" style={{ color: t.accent }}>{s.label}</a>
                        ) : (
                          <span className="font-['Cormorant_Garamond'] text-xs font-semibold" style={{ color: t.accent }}>{s.label}</span>
                        )}
                        <p className="font-['Inter'] text-[10px] leading-snug mt-0.5" style={{ color: t.muted }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
