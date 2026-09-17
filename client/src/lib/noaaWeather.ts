/**
 * noaaWeather.ts
 * Fetches current weather conditions and forecast from the NOAA Weather API.
 * No API key required. All data is public.
 */

export interface WeatherConditions {
  temp: number;           // °F
  feelsLike: number;
  humidity: number;
  windSpeed: number;      // mph
  windDir: string;        // e.g. "SW"
  pressure: number;       // inHg
  pressureTrend: "rising" | "falling" | "steady";
  description: string;    // e.g. "Partly Cloudy"
  icon: string;           // NOAA icon URL
  forecast: ForecastDay[];
  fishingAdvice: string;  // generated from pressure trend
}

export interface ForecastDay {
  name: string;      // "Tonight", "Thursday", etc.
  temp: number;
  wind: string;
  shortForecast: string;
  isDaytime: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOAA_BASE = "https://api.weather.gov";

const NOAA_HEADERS = {
  "User-Agent": "Flydentify/1.0 (fly-fishing hatch predictor; contact@flydentify.app)",
  Accept: "application/geo+json",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely fetch JSON, returns null on any network or HTTP error. */
async function safeGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: NOAA_HEADERS });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Convert Celsius to Fahrenheit. */
function cToF(c: number | null | undefined): number {
  if (c == null) return 0;
  return Math.round(c * 9 / 5 + 32);
}

/** Convert Pascal pressure to inHg. */
function paToInHg(pa: number | null | undefined): number {
  if (pa == null) return 0;
  return Math.round((pa / 3386.39) * 100) / 100;
}

/** Convert m/s to mph. */
function msToMph(ms: number | null | undefined): number {
  if (ms == null) return 0;
  return Math.round(ms * 2.237);
}

/** Convert degrees to cardinal direction abbreviation. */
function degreesToCardinal(deg: number | null | undefined): string {
  if (deg == null) return "N/A";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Extract a unitless numeric value from a NOAA quantity-value object. */
function getValue(
  obj: { value: number | null; unitCode?: string } | null | undefined
): number | null {
  if (obj == null || obj.value == null) return null;
  return obj.value;
}

/** Derive pressure trend and generate fishing advice. */
function derivePressureTrend(
  currentPa: number | null,
  previousPa: number | null
): { pressureTrend: "rising" | "falling" | "steady"; fishingAdvice: string } {
  let pressureTrend: "rising" | "falling" | "steady" = "rising";

  if (currentPa != null && previousPa != null) {
    const delta = currentPa - previousPa;
    if (delta < -50) {
      pressureTrend = "falling";
    } else if (delta > 50) {
      pressureTrend = "rising";
    } else {
      pressureTrend = "steady";
    }
  }

  const fishingAdvice =
    pressureTrend === "falling"
      ? "Feeding activity high — fish are actively rising. Get on the water now."
      : pressureTrend === "rising"
      ? "Post-front conditions. Fish may be deeper. Nymph or streamer."
      : "Stable conditions favor consistent hatches and predictable feeding windows.";

  return { pressureTrend, fishingAdvice };
}

// ─── NOAA response shape types ────────────────────────────────────────────────

interface PointsResponse {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    observationStations: string; // URL
    forecastHourly: string;      // URL
  };
}

interface ObservationStationsResponse {
  features: Array<{ properties: { stationIdentifier: string } }>;
}

interface ObservationResponse {
  properties: {
    temperature: { value: number | null; unitCode: string };
    heatIndex: { value: number | null; unitCode: string };
    relativeHumidity: { value: number | null; unitCode: string };
    windSpeed: { value: number | null; unitCode: string };
    windDirection: { value: number | null; unitCode: string };
    barometricPressure: { value: number | null; unitCode: string };
    textDescription: string;
    icon: string;
    timestamp: string;
  };
}

interface PreviousObsResponse {
  features: Array<{
    properties: {
      barometricPressure: { value: number | null; unitCode: string };
      timestamp: string;
    };
  }>;
}

interface ForecastResponse {
  properties: {
    periods: Array<{
      name: string;
      temperature: number;
      windSpeed: string;
      shortForecast: string;
      isDaytime: boolean;
    }>;
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch current weather conditions and a multi-day forecast for a lat/lon.
 * Returns null if the NOAA API is unreachable or the location is unsupported
 * (NOAA only covers the continental US, Hawaii, Alaska, and territories).
 */
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherConditions | null> {
  // ── Step 1: Resolve gridpoint and station list URL ─────────────────────────
  const pointsUrl = `${NOAA_BASE}/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
  const points = await safeGet<PointsResponse>(pointsUrl);
  if (!points) return null;

  const { gridId, gridX, gridY, observationStations } = points.properties;

  // ── Step 2: Get first observation station ─────────────────────────────────
  const stationsData =
    await safeGet<ObservationStationsResponse>(observationStations);
  if (!stationsData || !stationsData.features.length) return null;

  const stationId =
    stationsData.features[0].properties.stationIdentifier;

  // ── Step 3: Fetch current observation and previous observations in parallel ─
  const latestObsUrl = `${NOAA_BASE}/stations/${stationId}/observations/latest`;
  const recentObsUrl = `${NOAA_BASE}/stations/${stationId}/observations?limit=6`;
  const forecastUrl  = `${NOAA_BASE}/gridpoints/${gridId}/${gridX},${gridY}/forecast`;

  const [latestObs, recentObs, forecastData] = await Promise.all([
    safeGet<ObservationResponse>(latestObsUrl),
    safeGet<PreviousObsResponse>(recentObsUrl),
    safeGet<ForecastResponse>(forecastUrl),
  ]);

  if (!latestObs) return null;

  const obs = latestObs.properties;

  // ── Step 4: Parse current conditions ──────────────────────────────────────
  const tempC    = getValue(obs.temperature);
  const heatIdxC = getValue(obs.heatIndex);
  const humidPct = getValue(obs.relativeHumidity);
  const windMs   = getValue(obs.windSpeed);
  const windDeg  = getValue(obs.windDirection);
  const pressPa  = getValue(obs.barometricPressure);

  const temp      = cToF(tempC);
  const feelsLike = heatIdxC != null ? cToF(heatIdxC) : temp;
  const humidity  = Math.round(humidPct ?? 0);
  const windSpeed = msToMph(windMs);
  const windDir   = degreesToCardinal(windDeg);
  const pressure  = paToInHg(pressPa);

  // ── Step 5: Determine pressure trend from ~1 hr ago ───────────────────────
  let previousPa: number | null = null;
  if (recentObs && recentObs.features.length > 1) {
    // features[0] is latest; find one ~1 hour older
    previousPa = getValue(recentObs.features[1]?.properties?.barometricPressure) ?? null;
  }
  const { pressureTrend, fishingAdvice } = derivePressureTrend(pressPa, previousPa);

  // ── Step 6: Parse forecast ─────────────────────────────────────────────────
  const forecast: ForecastDay[] = (forecastData?.properties?.periods ?? [])
    .slice(0, 7)
    .map((p) => ({
      name:          p.name,
      temp:          p.temperature, // already °F from NOAA forecast endpoint
      wind:          p.windSpeed,
      shortForecast: p.shortForecast,
      isDaytime:     p.isDaytime,
    }));

  // ── Step 7: Assemble result ────────────────────────────────────────────────
  return {
    temp,
    feelsLike,
    humidity,
    windSpeed,
    windDir,
    pressure,
    pressureTrend,
    description: obs.textDescription || "Unknown",
    icon:        obs.icon || "",
    forecast,
    fishingAdvice,
  };
}
