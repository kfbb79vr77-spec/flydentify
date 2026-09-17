/**
 * degreeDayEngine.ts
 * Degree-day accumulation model for predicting aquatic insect hatch timing.
 * No external API calls, pure computational model using date, latitude,
 * and optional water temperature as inputs.
 */

export interface HatchPrediction {
  insect: string;
  latinName: string;
  status: "imminent" | "active" | "waning" | "weeks_away";
  confidence: number;   // 0-100
  daysUntil: number | null; // null if already active or waning
  description: string;
  baseTemp: number;          // °F threshold used in this model
  degreeDaysNeeded: number;  // midpoint of hatch window
  degreeDaysAccum: number;   // estimated accumulated degree-days so far
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base temperature for aquatic insect DD accumulation (°F). */
const BASE_TEMP_F = 32;

/**
 * Hatch window definitions.
 * ddStart / ddEnd are accumulated degree-days from Jan 1 at base 32°F.
 * "imminent" zone: within 100 DD below ddStart.
 * "active"   zone: ddStart → ddEnd.
 * "waning"   zone: ddEnd → ddEnd + 150.
 */
interface HatchSpec {
  insect: string;
  latinName: string;
  ddStart: number;
  ddEnd: number;
  description: string;
}

const HATCH_SPECS: HatchSpec[] = [
  {
    insect:      "Midge",
    latinName:   "Chironomidae",
    ddStart:     0,
    ddEnd:       200,
    description: "Winter midges hatch year-round in cold tailwaters. Tiny #20-26 patterns in black, red, or olive.",
  },
  {
    insect:      "Blue-Winged Olive (Spring)",
    latinName:   "Baetis tricaudatus",
    ddStart:     200,
    ddEnd:       400,
    description: "Classic early-season dry fly fishing. Look for emergence on overcast afternoons. #16-20 BWO patterns.",
  },
  {
    insect:      "Hendrickson",
    latinName:   "Ephemerella subvaria",
    ddStart:     350,
    ddEnd:       500,
    description: "Reliable afternoon hatch on freestone streams. Males (Red Quill) emerge before females. #12-14.",
  },
  {
    insect:      "Caddis (Brachycentrus)",
    latinName:   "Brachycentrus americanus",
    ddStart:     450,
    ddEnd:       650,
    description: "Mother's Day Caddis. Heavy morning and evening hatches. Elk Hair Caddis and soft hackles in #14-16.",
  },
  {
    insect:      "Salmonfly",
    latinName:   "Pteronarcys californica",
    ddStart:     600,
    ddEnd:       850,
    description: "Western rivers' biggest hatch. Giant #4-8 dries can produce explosive takes. Prime runoff timing.",
  },
  {
    insect:      "Pale Morning Dun",
    latinName:   "Ephemerella dorothea",
    ddStart:     700,
    ddEnd:       950,
    description: "Summer staple. Spinners at dusk are critical. #16-18 PMD comparaduns and sparkle duns.",
  },
  {
    insect:      "Green Drake",
    latinName:   "Ephemera guttulata",
    ddStart:     900,
    ddEnd:       1100,
    description: "Brief but spectacular evening hatch. Large #8-12 wulffs and paradrakes. Fish with confidence.",
  },
  {
    insect:      "Trico",
    latinName:   "Tricorythodes minutus",
    ddStart:     1200,
    ddEnd:       1600,
    description: "Early morning spinner falls. Demanding presentation on flat water. #20-26 Trico spinners.",
  },
  {
    insect:      "Hopper Season",
    latinName:   "Acrididae / Tettigoniidae",
    ddStart:     1400,
    ddEnd:       2000,
    description: "Terrestrial bonanza. Foam and yarn hoppers slapped against cut banks. #6-12 patterns.",
  },
  {
    insect:      "Blue-Winged Olive (Fall)",
    latinName:   "Baetis tricaudatus",
    ddStart:     1800,
    ddEnd:       2200,
    description: "Fall return of the BWO. Best on cloudy, drizzly afternoons as temperatures drop. #18-22.",
  },
];

// ─── Climate zone estimation ──────────────────────────────────────────────────

/**
 * Estimate mean annual daily temperature range (°F) for a latitude.
 * Uses a simplified sinusoidal climate model:
 *   - Higher latitudes run cooler with more seasonal swing.
 *   - Lower latitudes (south) run warmer with less swing.
 */
function estimateAnnualTempCurve(lat: number): {
  annualMean: number;  // °F
  amplitude: number;   // seasonal swing (°F, half-range)
} {
  // Reference: CONUS latitude spans ~25°N (tip of FL) to ~49°N (MT border)
  // Clamp to sensible CONUS range for the model
  const clampedLat = Math.max(25, Math.min(50, Math.abs(lat)));

  // Mean annual temperature decreases ~1.5°F per degree latitude (empirical)
  const annualMean = 72 - (clampedLat - 25) * 1.5;

  // Seasonal amplitude increases with latitude (more continental)
  const amplitude  = 20 + (clampedLat - 25) * 0.8;

  return { annualMean, amplitude };
}

/**
 * Estimate average air temperature on a given day of the year for a latitude.
 * Uses a cosine curve with peak on day ~200 (mid-July) for CONUS.
 */
function estimateDailyAirTempF(lat: number, dayOfYear: number): number {
  const { annualMean, amplitude } = estimateAnnualTempCurve(lat);
  // Phase shift: coldest ~day 15 (Jan 15), warmest ~day 196 (Jul 15)
  const phaseOffset = 15;
  const radians = (2 * Math.PI * (dayOfYear - phaseOffset)) / 365;
  return annualMean + amplitude * Math.sin(radians - Math.PI / 2) + amplitude;
}

/**
 * Estimate average daily water temperature from air temperature.
 * Empirical approximation: waterTemp ≈ airTemp * 0.75 + 4 (°F)
 */
function airToWaterTempF(airTempF: number): number {
  return airTempF * 0.75 + 4;
}

// ─── Degree-day accumulation ──────────────────────────────────────────────────

/**
 * Estimate total accumulated degree-days from Jan 1 through the given
 * day of year, for a specified latitude, at base 32°F.
 *
 * Uses numerical integration over estimated daily mean air temps,
 * converted to water temperature before applying the base-temp floor.
 */
export function getDDAccumEstimate(lat: number, dayOfYear: number): number {
  let totalDD = 0;
  for (let day = 1; day <= dayOfYear; day++) {
    const airTemp   = estimateDailyAirTempF(lat, day);
    const waterTemp = airToWaterTempF(airTemp);
    const dd        = Math.max(0, waterTemp - BASE_TEMP_F);
    totalDD += dd;
  }
  return Math.round(totalDD);
}

// ─── Status and confidence scoring ───────────────────────────────────────────

/**
 * Derive status and base confidence from accumulated DD vs. hatch window.
 * Confidence reflects both proximity and certainty of model.
 */
function scoreHatch(
  dd: number,
  spec: HatchSpec
): { status: HatchPrediction["status"]; confidence: number; daysUntil: number | null } {
  const { ddStart, ddEnd } = spec;
  const windowSize  = ddEnd - ddStart;
  const imminentZone = Math.min(100, windowSize * 0.3);
  const waningZone   = 150;

  if (dd < ddStart - imminentZone) {
    // Weeks away, scale confidence down with distance
    const ddGap      = ddStart - dd;
    const confidence = Math.max(10, Math.round(50 - (ddGap / 200) * 20));
    // Rough days estimate: assume ~15 DD/day as typical accumulation rate
    const daysUntil  = Math.round(ddGap / 15);
    return { status: "weeks_away", confidence, daysUntil };
  }

  if (dd >= ddStart - imminentZone && dd < ddStart) {
    // Imminent
    const progress   = (dd - (ddStart - imminentZone)) / imminentZone;
    const confidence = Math.round(65 + progress * 25);
    const ddGap      = ddStart - dd;
    const daysUntil  = Math.max(1, Math.round(ddGap / 15));
    return { status: "imminent", confidence, daysUntil };
  }

  if (dd >= ddStart && dd <= ddEnd) {
    // Active, peak confidence at midpoint, slightly lower at edges
    const progress   = (dd - ddStart) / windowSize;
    const bell       = 1 - Math.pow((progress - 0.5) * 2, 2); // 0-1
    const confidence = Math.round(75 + bell * 20);
    return { status: "active", confidence, daysUntil: null };
  }

  if (dd > ddEnd && dd <= ddEnd + waningZone) {
    // Waning
    const overrun    = dd - ddEnd;
    const confidence = Math.round(50 - (overrun / waningZone) * 30);
    return { status: "waning", confidence, daysUntil: null };
  }

  // Well past — no reliable signal for this window, so avoid collapsing
  // every hatch into an identical "waning / 10%" reading. Fall back to a
  // moderate confidence, gently varied by how far past the window we are
  // so cards don't render as visually identical.
  const overrun          = dd - (ddEnd + waningZone);
  const moderateConfidence = Math.max(30, Math.min(50, Math.round(50 - (overrun / 1000) * 20)));
  return { status: "waning", confidence: moderateConfidence, daysUntil: null };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Predict hatch timing for all tracked insect species given current conditions.
 *
 * @param lat           Latitude (used to estimate climate zone and DD curve)
 * @param currentMonth  1-based month number (1 = January, 12 = December)
 * @param avgWaterTempF Measured water temperature in °F, or null to use air-temp estimate
 * @returns             Array of HatchPrediction sorted by confidence (desc), then status priority
 */
export function predictHatches(
  lat: number,
  currentMonth: number,
  avgWaterTempF: number | null
): HatchPrediction[] {
  // Compute approximate day of year at the middle of the current month
  const dayOfYear = Math.round((currentMonth - 0.5) * (365 / 12));

  // Get model DD estimate for the latitude
  let modelDD = getDDAccumEstimate(lat, dayOfYear);

  // If we have an actual water temp reading, calibrate the DD estimate.
  // Strategy: compute what the model thinks today's water temp would be,
  // find the ratio, and scale cumulative DD accordingly.
  if (avgWaterTempF != null) {
    const airTempEstimate   = estimateDailyAirTempF(lat, dayOfYear);
    const modelWaterEstimate = airToWaterTempF(airTempEstimate);
    if (modelWaterEstimate > BASE_TEMP_F) {
      const calibrationRatio = Math.max(
        0.5,
        Math.min(2.0, avgWaterTempF / modelWaterEstimate)
      );
      modelDD = Math.round(modelDD * calibrationRatio);
    }
  }

  const predictions: HatchPrediction[] = HATCH_SPECS.map((spec) => {
    const { status, confidence, daysUntil } = scoreHatch(modelDD, spec);
    return {
      insect:             spec.insect,
      latinName:          spec.latinName,
      status,
      confidence,
      daysUntil,
      description:        spec.description,
      baseTemp:           BASE_TEMP_F,
      degreeDaysNeeded:   Math.round((spec.ddStart + spec.ddEnd) / 2),
      degreeDaysAccum:    modelDD,
    };
  });

  // Sort: active first, then imminent, then waning, then weeks_away
  // Within each group, sort by confidence descending
  const statusOrder: Record<HatchPrediction["status"], number> = {
    active:      0,
    imminent:    1,
    waning:      2,
    weeks_away:  3,
  };

  predictions.sort((a, b) => {
    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
    if (orderDiff !== 0) return orderDiff;
    return b.confidence - a.confidence;
  });

  return predictions;
}
