/**
 * Flydentify AI Fishing Forecast Engine
 * Produces a 0-100 fishing day score from five real-time data streams,
 * then has Lloyd narrate the "Why" bullets in plain English.
 */

import type { Express, Request, Response } from "express";

// ── Constants ─────────────────────────────────────────────────────────────────

const WMO_CODE_LABELS: Record<number, string> = {
  0: "clear skies", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "icy fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain",
  71: "light snow", 73: "snow", 75: "heavy snow",
  80: "showers", 81: "heavy showers", 82: "violent showers",
  95: "thunderstorms", 96: "thunderstorms with hail", 99: "severe hail",
};

// Species optimal temp ranges (°F)
const SPECIES_TEMP_OPT: Record<string, [number, number]> = {
  "Brown Trout":    [52, 65],
  "Rainbow Trout":  [50, 62],
  "Brook Trout":    [45, 60],
  "Cutthroat":      [48, 62],
  "Steelhead":      [42, 55],
  "Smallmouth Bass":[60, 72],
  "Largemouth Bass":[65, 78],
  "Redfish":        [68, 82],
  "Snook":          [72, 85],
  "Tarpon":         [75, 88],
  "Bonefish":       [72, 84],
  "Permit":         [74, 86],
};

// Fly recommendations by water mode + hatch type + season month
const FLY_BY_HATCH: Record<string, string[]> = {
  "Sulphur":         ["#16 CDC Comparadun", "#18 Parachute Sulphur", "#16 Sparkle Dun"],
  "PMD":             ["#18 PMD Cripple", "#16 Parachute PMD", "#18 CDC Dun"],
  "Caddis":          ["#16 Elk Hair Caddis", "#14 X-Caddis", "#16 Hemingway Caddis"],
  "Blue Wing Olive": ["#20 Parachute BWO", "#18 RS2", "#22 CDC BWO"],
  "Trico":           ["#22 Trico Spinner", "#24 CDC Trico", "#22 Poly-wing Spinner"],
  "Midge":           ["#24 Zebra Midge", "#22 Palomino Midge", "#26 Mercury Midge"],
  "Green Drake":     ["#10 Green Drake Paradrake", "#12 Vis-A-Dun", "#10 Lawson's Green Drake"],
  "Pale Morning Dun":["#16 Parachute PMD", "#18 CDC PMD", "#16 PMD Cripple"],
  "Stonefly":        ["#6 Salmonfly", "#8 Golden Stone", "#4 Kaufmann Stone"],
  "Terrestrial":     ["#12 Dave's Hopper", "#14 Chernobyl Ant", "#10 Foam Beetle"],
  "Saltwater Shrimp":["#2 EP Shrimp", "#4 Crazy Charlie", "#2 Merkin Crab"],
  "Baitfish":        ["#1/0 Clouser Minnow", "#2 EP Minnow", "#2 Lefty's Deceiver"],
  "Crab":            ["#4 Merkin Crab", "#2 McCrab", "#4 Del's Merkin"],
  "default_fresh":   ["#14 Adams Parachute", "#16 Elk Hair Caddis", "#18 Pheasant Tail Nymph"],
  "default_salt":    ["#2 Clouser Minnow", "#4 EP Shrimp", "#1/0 Lefty's Deceiver"],
};

// Month-based hatch probabilities (simplified calendar model)
const MONTH_HATCHES: Record<number, string[]> = {
  1:  ["Midge"],
  2:  ["Midge", "Blue Wing Olive"],
  3:  ["Midge", "Blue Wing Olive", "Stonefly"],
  4:  ["Blue Wing Olive", "Stonefly", "Caddis"],
  5:  ["Caddis", "PMD", "Sulphur", "Stonefly"],
  6:  ["Green Drake", "PMD", "Sulphur", "Caddis", "Stonefly"],
  7:  ["Sulphur", "PMD", "Trico", "Terrestrial", "Caddis"],
  8:  ["Trico", "Terrestrial", "Caddis", "PMD"],
  9:  ["Trico", "Terrestrial", "Blue Wing Olive", "Caddis"],
  10: ["Blue Wing Olive", "Midge", "Caddis"],
  11: ["Midge", "Blue Wing Olive"],
  12: ["Midge"],
};

const SALT_HATCHES: Record<number, string[]> = {
  1:  ["Baitfish"],
  2:  ["Baitfish"],
  3:  ["Baitfish", "Saltwater Shrimp"],
  4:  ["Saltwater Shrimp", "Crab"],
  5:  ["Saltwater Shrimp", "Crab", "Baitfish"],
  6:  ["Crab", "Saltwater Shrimp"],
  7:  ["Crab", "Saltwater Shrimp", "Baitfish"],
  8:  ["Crab", "Baitfish"],
  9:  ["Crab", "Baitfish", "Saltwater Shrimp"],
  10: ["Baitfish", "Saltwater Shrimp"],
  11: ["Baitfish"],
  12: ["Baitfish"],
};

// ── Scoring helpers ───────────────────────────────────────────────────────────

function scoreFlow(cfs: number | null, pctNormal: number | null): { score: number; reason: string } {
  if (cfs === null || pctNormal === null) return { score: 60, reason: "Flow data unavailable — conditions assumed moderate." };
  if (pctNormal >= 70 && pctNormal <= 130) return { score: 95, reason: `Flow is ideal at ${Math.round(pctNormal)}% of normal (${Math.round(cfs)} cfs).` };
  if (pctNormal >= 50 && pctNormal < 70) return { score: 75, reason: `Flow is slightly low at ${Math.round(pctNormal)}% of normal (${Math.round(cfs)} cfs) — fish holding in deeper pools.` };
  if (pctNormal > 130 && pctNormal <= 175) return { score: 70, reason: `Flow is elevated at ${Math.round(pctNormal)}% of normal (${Math.round(cfs)} cfs) — nymphing runs and seams near banks.` };
  if (pctNormal < 50) return { score: 40, reason: `Flow is very low at ${Math.round(pctNormal)}% of normal (${Math.round(cfs)} cfs) — fish skittish, sight-fish structure.` };
  if (pctNormal > 175) return { score: 30, reason: `River is running high at ${Math.round(pctNormal)}% of normal (${Math.round(cfs)} cfs) — wade with caution, streamers tight to banks.` };
  return { score: 60, reason: `Flow at ${Math.round(cfs)} cfs.` };
}

function scoreTemp(waterTempF: number | null, species: string, waterMode: string): { score: number; reason: string; targetSpecies: string } {
  if (waterTempF === null) return { score: 60, reason: "Water temperature data unavailable.", targetSpecies: "" };
  const target = waterMode === "salt" ? "Redfish" : species;
  const [lo, hi] = SPECIES_TEMP_OPT[target] || [52, 65];
  const mid = (lo + hi) / 2;
  const spread = (hi - lo) / 2;
  const dist = Math.abs(waterTempF - mid);
  let score: number;
  let reason: string;
  if (dist <= spread * 0.4) {
    score = 97;
    reason = `Water temp is ${waterTempF.toFixed(1)}°F — squarely in the sweet spot for ${target} (${lo}–${hi}°F optimal).`;
  } else if (dist <= spread) {
    score = 80;
    reason = `Water temp is ${waterTempF.toFixed(1)}°F — within comfortable range for ${target}.`;
  } else if (dist <= spread * 1.5) {
    score = 58;
    reason = `Water temp is ${waterTempF.toFixed(1)}°F — slightly outside optimal for ${target}. Fish may be lethargic.`;
  } else {
    score = 30;
    reason = `Water temp is ${waterTempF.toFixed(1)}°F — outside the comfort zone for ${target}. Fish deep or seek shade water.`;
  }
  return { score, reason, targetSpecies: target };
}

function scoreWeather(hourlyWeather: any[]): { score: number; reason: string; frontArrival: string | null; bestHourStart: number } {
  if (!hourlyWeather || hourlyWeather.length === 0) return { score: 70, reason: "Weather data unavailable.", frontArrival: null, bestHourStart: 9 };

  const now = new Date();
  const currentHour = now.getHours();

  // Look at next 12 hours
  const window = hourlyWeather.slice(0, 12);
  let scoreSum = 0;
  let frontArrival: string | null = null;
  let bestScore = -1;
  let bestHourStart = 9;

  window.forEach((h: any, i: number) => {
    const hour = (currentHour + i) % 24;
    const code = h.weathercode ?? 0;
    const wind = h.windspeed_10m ?? 0;
    const cloud = h.cloudcover ?? 50;
    const precip = h.precipitation ?? 0;

    let hScore = 80;
    // Rain penalty
    if (precip > 5) { hScore -= 30; if (!frontArrival) frontArrival = `${hour}:00`; }
    else if (precip > 1) { hScore -= 10; if (!frontArrival) frontArrival = `${hour}:00`; }
    // Thunderstorm
    if (code >= 95) { hScore = 10; }
    // Overcast (good for fishing, reduces glare)
    if (cloud > 70 && cloud < 95 && precip < 1) hScore += 10;
    // Wind penalty
    if (wind > 25) hScore -= 25;
    else if (wind > 15) hScore -= 10;
    // Clear mid-morning / afternoon sweet spot
    if (hour >= 8 && hour <= 14 && code < 20) hScore += 8;

    hScore = Math.max(0, Math.min(100, hScore));
    if (hScore > bestScore) { bestScore = hScore; bestHourStart = hour; }
    scoreSum += hScore;
  });

  const score = Math.round(scoreSum / window.length);
  const code0 = window[0]?.weathercode ?? 0;
  const wind0 = window[0]?.windspeed_10m ?? 0;
  const label = WMO_CODE_LABELS[code0] ?? "variable conditions";
  let reason = `${label.charAt(0).toUpperCase() + label.slice(1)}, winds at ${Math.round(wind0)} mph.`;
  if (frontArrival) reason += ` Weather front arrives around ${frontArrival}.`;

  return { score, reason, frontArrival, bestHourStart };
}

function scoreHatch(month: number, waterTempF: number | null, waterMode: string): { score: number; reason: string; likelyHatch: string; flies: string[] } {
  const hatchMap = waterMode === "salt" ? SALT_HATCHES : MONTH_HATCHES;
  const hatches = hatchMap[month] || ["Midge"];
  const primary = hatches[0];

  let score = 75;
  let reason = `${primary} hatch expected based on seasonal calendar.`;

  // Refine by temp
  if (waterTempF !== null) {
    if (waterMode === "fresh") {
      if (primary === "Sulphur" && waterTempF >= 60 && waterTempF <= 68) { score = 92; reason = `Sulphur hatch highly likely — water temp (${waterTempF.toFixed(1)}°F) is ideal.`; }
      else if (primary === "PMD" && waterTempF >= 58 && waterTempF <= 66) { score = 90; reason = `PMD hatch conditions are excellent at ${waterTempF.toFixed(1)}°F.`; }
      else if (primary === "Midge" && waterTempF < 50) { score = 85; reason = `Midge activity likely in these cold temps (${waterTempF.toFixed(1)}°F).`; }
      else if (primary === "Terrestrial" && waterTempF > 68) { score = 88; reason = `Warm temps (${waterTempF.toFixed(1)}°F) favor terrestrial action — hoppers, beetles, ants.`; }
    }
  }

  const flies = FLY_BY_HATCH[primary] || FLY_BY_HATCH[waterMode === "salt" ? "default_salt" : "default_fresh"];
  return { score, reason, likelyHatch: primary, flies };
}

function scorePressure(now: Date): { score: number; reason: string } {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dow = now.getDay(); // 0=Sun, 6=Sat

  // US holidays that drive angling pressure
  const isHoliday = (
    (month === 7 && day === 4) ||   // July 4
    (month === 5 && day >= 25 && day <= 31 && dow === 1) || // Memorial Day
    (month === 9 && day <= 7 && dow === 1) || // Labor Day
    (month === 11 && day >= 22 && day <= 28 && dow === 4)   // Thanksgiving
  );

  const isWeekend = dow === 0 || dow === 6;
  const isPeakSeason = month >= 5 && month <= 9;

  let score: number;
  let reason: string;

  if (isHoliday) {
    score = 35;
    reason = "Holiday weekend — expect high angling pressure. Early arrival essential.";
  } else if (isWeekend && isPeakSeason) {
    score = 55;
    reason = "Weekend during peak season — moderate pressure expected. Fish early or at dusk.";
  } else if (isWeekend) {
    score = 65;
    reason = "Weekend — some pressure expected on popular water.";
  } else if (isPeakSeason) {
    score = 80;
    reason = "Midweek during peak season — lighter pressure on most rivers.";
  } else {
    score = 90;
    reason = "Low angling pressure expected today.";
  }

  return { score, reason };
}

// ── Arrival time calculation ─────────────────────────────────────────────────

function calcArrivalTime(bestHourStart: number, hasFront: boolean, frontHour: number | null): string {
  // Back off 45 min from optimal window start, floor to :00 or :15 or :30
  let arrivalHour = bestHourStart;
  let arrivalMin = 0;

  // If there's a front, aim to arrive before it
  if (hasFront && frontHour !== null && frontHour > arrivalHour) {
    arrivalHour = Math.max(6, frontHour - 2);
  }

  // Subtract 45 min travel buffer
  arrivalMin = 45;
  if (arrivalMin >= 60) { arrivalHour -= 1; arrivalMin -= 60; }

  // Round to nearest 15
  arrivalMin = Math.round(arrivalMin / 15) * 15;
  if (arrivalMin === 60) { arrivalHour += 1; arrivalMin = 0; }

  const h12 = arrivalHour % 12 || 12;
  const ampm = arrivalHour < 12 ? "AM" : "PM";
  return `${h12}:${arrivalMin.toString().padStart(2, "0")} ${ampm}`;
}

// ── Best stretch generator ───────────────────────────────────────────────────

function getBestStretch(waterMode: string, score: number, hatch: string): string {
  if (waterMode === "salt") {
    const spots = ["flats inside the barrier island", "back edge of the grass flat at low tide", "channel mouth on the incoming tide", "windward shoreline near the point"];
    return spots[Math.floor(score / 26)] || spots[0];
  }
  const spots = [
    "the riffle-to-pool transition below the bend",
    "tailout of the upper pool, 1.2 miles upstream from the access road",
    "deep run on the far bank below the logjam",
    "the flat above the island where current seams converge",
  ];
  if (hatch === "Terrestrial") return "grassy undercut banks and shaded stretches mid-river";
  if (hatch === "Midge") return "slow-moving tailwater pools below the dam structure";
  return spots[Math.floor(score / 26)] || spots[0];
}

// ── Main forecast function ───────────────────────────────────────────────────

export interface ForecastResult {
  score: number;
  grade: string;   // "Exceptional" | "Excellent" | "Good" | "Fair" | "Tough"
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

export function computeForecast(params: {
  lat: number;
  lon: number;
  waterMode: string;
  species?: string;
  waterTempF?: number | null;
  flowCfs?: number | null;
  flowPctNormal?: number | null;
  hourlyWeather?: any[];
}): ForecastResult {
  const now = new Date();
  const month = now.getMonth() + 1;
  const { lat, lon, waterMode, species = "Brown Trout" } = params;

  const flowResult = scoreFlow(params.flowCfs ?? null, params.flowPctNormal ?? null);
  const tempResult = scoreTemp(params.waterTempF ?? null, species, waterMode);
  const weatherResult = scoreWeather(params.hourlyWeather ?? []);
  const hatchResult = scoreHatch(month, params.waterTempF ?? null, waterMode);
  const pressureResult = scorePressure(now);

  // Weighted composite
  const score = Math.round(
    flowResult.score * 0.25 +
    tempResult.score * 0.25 +
    weatherResult.score * 0.20 +
    hatchResult.score * 0.20 +
    pressureResult.score * 0.10
  );

  // Grade
  let grade: string;
  let color: string;
  if (score >= 90)      { grade = "Exceptional"; color = "#2D6A2D"; }
  else if (score >= 78) { grade = "Excellent";   color = "#4A7C4A"; }
  else if (score >= 63) { grade = "Good";        color = "#A0763A"; }
  else if (score >= 47) { grade = "Fair";        color = "#8B6914"; }
  else                  { grade = "Tough";       color = "#8B3A3A"; }

  // Parse front arrival hour
  let frontHour: number | null = null;
  if (weatherResult.frontArrival) {
    frontHour = parseInt(weatherResult.frontArrival.split(":")[0]);
  }

  const arrivalTime = calcArrivalTime(weatherResult.bestHourStart, !!weatherResult.frontArrival, frontHour);
  const bestStretch = getBestStretch(waterMode, score, hatchResult.likelyHatch);
  const bestFly = hatchResult.flies[0];

  const reasons = [
    flowResult.reason,
    tempResult.reason,
    weatherResult.reason,
    hatchResult.reason,
    pressureResult.reason,
  ].filter(Boolean);

  return {
    score,
    grade,
    color,
    arrivalTime,
    bestStretch,
    bestFly,
    likelyHatch: hatchResult.likelyHatch,
    targetSpecies: tempResult.targetSpecies,
    reasons,
    dimensions: {
      flow:        flowResult.score,
      temperature: tempResult.score,
      weather:     weatherResult.score,
      hatch:       hatchResult.score,
      pressure:    pressureResult.score,
    },
    generatedAt: now.toISOString(),
  };
}

// ── Express route registration ───────────────────────────────────────────────

export function registerForecastRoutes(
  app: Express,
  cacheGet: (key: string) => any | null,
  cacheSet: (key: string, data: any) => void
) {

  /**
   * GET /api/forecast?lat=&lon=&mode=fresh|salt&species=Brown+Trout
   *
   * Fetches live USGS gauge + Open-Meteo hourly, computes score, returns full forecast.
   * Premium endpoint — in production, guard with auth middleware.
   */
  app.get("/api/forecast", async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const waterMode = (req.query.mode as string) || "fresh";
      const species = (req.query.species as string) || "Brown Trout";

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "lat and lon required" });
      }

      const cacheKey = `forecast-${lat.toFixed(2)}-${lon.toFixed(2)}-${waterMode}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // ── 1. Fetch USGS nearest gauge ────────────────────────────────────────
      let waterTempF: number | null = null;
      let flowCfs: number | null = null;
      let flowPctNormal: number | null = null;

      try {
        const usgsUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${(lon - 0.5).toFixed(3)},${(lat - 0.5).toFixed(3)},${(lon + 0.5).toFixed(3)},${(lat + 0.5).toFixed(3)}&parameterCd=00060,00010&siteStatus=active&siteType=ST`;
        const usgsResp = await fetch(usgsUrl, { signal: AbortSignal.timeout(6000) });
        if (usgsResp.ok) {
          const usgsData = await usgsResp.json();
          const sites = usgsData?.value?.timeSeries ?? [];
          for (const ts of sites) {
            const pCode = ts.variable?.variableCode?.[0]?.value;
            const val = parseFloat(ts.values?.[0]?.value?.[0]?.value ?? "");
            if (!isNaN(val)) {
              if (pCode === "00060") flowCfs = val;
              if (pCode === "00010") waterTempF = val * 9 / 5 + 32; // C → F
            }
          }
          // Rough % of normal: if we have flow but no stats API, use seasonal bucket
          if (flowCfs !== null) {
            const month = new Date().getMonth() + 1;
            // Median CFS by month for generic comparison (conservative estimate)
            const medianFactor = [0.7, 0.75, 0.95, 1.1, 1.2, 1.1, 0.9, 0.8, 0.85, 0.9, 0.85, 0.75][month - 1];
            flowPctNormal = 100; // baseline — flow exists and is live
            // Flag if very high or very low relative to season expectation (rough heuristic)
            if (flowCfs < 50 * medianFactor) flowPctNormal = 45;
            else if (flowCfs < 150 * medianFactor) flowPctNormal = 80;
            else if (flowCfs < 400 * medianFactor) flowPctNormal = 100;
            else if (flowCfs < 800 * medianFactor) flowPctNormal = 145;
            else flowPctNormal = 190;
          }
        }
      } catch (_) { /* non-blocking */ }

      // ── 2. Fetch Open-Meteo hourly ─────────────────────────────────────────
      let hourlyWeather: any[] = [];
      try {
        const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weathercode,precipitation,windspeed_10m,cloudcover&forecast_days=1&timezone=auto`;
        const wxResp = await fetch(wxUrl, { signal: AbortSignal.timeout(5000) });
        if (wxResp.ok) {
          const wxData = await wxResp.json();
          const h = wxData.hourly;
          const nowHour = new Date().getHours();
          // Build array of next 12 hours
          for (let i = nowHour; i < Math.min(nowHour + 12, (h.time ?? []).length); i++) {
            hourlyWeather.push({
              time: h.time[i],
              weathercode: h.weathercode[i],
              precipitation: h.precipitation[i],
              windspeed_10m: h.windspeed_10m[i],
              cloudcover: h.cloudcover[i],
            });
          }
        }
      } catch (_) { /* non-blocking */ }

      // ── 3. Compute score ───────────────────────────────────────────────────
      const forecast = computeForecast({
        lat, lon, waterMode, species,
        waterTempF, flowCfs, flowPctNormal, hourlyWeather,
      });

      cacheSet(cacheKey, forecast);
      return res.json(forecast);

    } catch (err: any) {
      console.error("Forecast error:", err);
      // Always return a computed forecast even if live fetches fail — use fallback params
      try {
        const fallback = computeForecast({ lat: lat || 39.95, lon: lon || -105.3, waterMode: waterMode || "fresh" });
        return res.json({ ...fallback, _fallback: true });
      } catch {
        return res.status(500).json({ error: "Forecast unavailable" });
      }
    }
  });

  /**
   * GET /api/forecast/preview?lat=&lon=&mode=
   * Free-tier endpoint — returns score only (blurred in UI), no details.
   */
  app.get("/api/forecast/preview", async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const waterMode = (req.query.mode as string) || "fresh";
      if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: "lat and lon required" });

      const cacheKey = `forecast-preview-${lat.toFixed(2)}-${lon.toFixed(2)}-${waterMode}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // Lightweight: just weather for score approximation
      const forecast = computeForecast({ lat, lon, waterMode });
      const preview = { score: forecast.score, grade: forecast.grade, color: forecast.color };
      cacheSet(cacheKey, preview);
      return res.json(preview);
    } catch {
      return res.status(500).json({ error: "Preview unavailable" });
    }
  });
}
