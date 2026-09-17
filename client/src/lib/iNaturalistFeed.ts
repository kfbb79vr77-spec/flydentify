/**
 * iNaturalistFeed.ts
 * Fetches recent aquatic insect observations from the iNaturalist public API.
 * No API key required. Covers the four primary fly-fishing insect orders.
 */

export interface NaturalistObs {
  id: number;
  taxon: string;       // order name, e.g. "Ephemeroptera"
  commonName: string;  // e.g. "Mayflies"
  observedOn: string;  // ISO date string, e.g. "2026-06-15"
  place: string;
  photoUrl: string | null;
  uri: string;         // canonical iNaturalist URL
  lat: number;
  lng: number;
}

// ─── Taxon catalog ────────────────────────────────────────────────────────────

interface TaxonEntry {
  id: number;
  latinName: string;
  commonName: string;
}

const FISHING_TAXONS: TaxonEntry[] = [
  { id: 47935, latinName: "Ephemeroptera", commonName: "Mayflies" },
  { id: 47864, latinName: "Plecoptera",    commonName: "Stoneflies" },
  { id: 47925, latinName: "Trichoptera",   commonName: "Caddisflies" },
  { id: 49886, latinName: "Chironomidae",  commonName: "Midges" },
];

const INAT_BASE = "https://api.inaturalist.org/v1";
const RADIUS_KM = 150;
const PER_PAGE  = 12;

// ─── iNaturalist response types ───────────────────────────────────────────────

interface InatObservation {
  id: number;
  observed_on: string;
  place_guess: string | null;
  uri: string;
  location: string | null; // "lat,lng"
  taxon?: {
    name?: string;
    preferred_common_name?: string;
    iconic_taxon_name?: string;
  };
  photos?: Array<{ url: string | null }>;
}

interface InatResponse {
  results: InatObservation[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely fetch JSON from iNaturalist, returns null on any error. */
async function safeGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Flydentify/1.0 (fly-fishing app; contact@flydentify.app)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Build iNaturalist observation query URL for a single taxon.
 * Uses research-grade observations only for data quality.
 */
function buildQueryUrl(
  taxonId: number,
  lat: number,
  lon: number
): string {
  const params = new URLSearchParams({
    taxon_id:      String(taxonId),
    lat:           lat.toFixed(6),
    lng:           lon.toFixed(6),
    radius:        String(RADIUS_KM),
    order:         "desc",
    order_by:      "observed_on",
    per_page:      String(PER_PAGE),
    quality_grade: "research",
  });
  return `${INAT_BASE}/observations?${params.toString()}`;
}

/**
 * Normalize a raw iNaturalist observation into our NaturalistObs shape,
 * using the supplied taxon metadata as fallback for name fields.
 */
function normalizeObs(
  raw: InatObservation,
  taxon: TaxonEntry
): NaturalistObs {
  let lat = 0;
  let lng = 0;
  if (raw.location) {
    const parts = raw.location.split(",");
    lat = parseFloat(parts[0] ?? "0");
    lng = parseFloat(parts[1] ?? "0");
  }

  // iNaturalist serves small thumbnails; bump to medium (75px → 400px)
  const rawPhoto = raw.photos?.[0]?.url ?? null;
  const photoUrl = rawPhoto
    ? rawPhoto.replace("/square.", "/medium.")
    : null;

  return {
    id:         raw.id,
    taxon:      raw.taxon?.name ?? taxon.latinName,
    commonName: raw.taxon?.preferred_common_name ?? taxon.commonName,
    observedOn: raw.observed_on ?? "",
    place:      raw.place_guess ?? "Unknown location",
    photoUrl,
    uri:        raw.uri ?? `https://www.inaturalist.org/observations/${raw.id}`,
    lat,
    lng,
  };
}

// ─── Main exports ─────────────────────────────────────────────────────────────

/**
 * Fetch recent research-grade insect observations from iNaturalist for the
 * four fly-fishing insect orders within 150 km of the supplied lat/lon.
 * All four taxon requests are made in parallel; results are merged, deduped,
 * and sorted by observation date (most recent first).
 */
export async function fetchNaturalistObs(
  lat: number,
  lon: number
): Promise<NaturalistObs[]> {
  // Fetch all four taxons in parallel
  const responses = await Promise.all(
    FISHING_TAXONS.map(async (taxon) => {
      const url  = buildQueryUrl(taxon.id, lat, lon);
      const data = await safeGet<InatResponse>(url);
      if (!data?.results) return [] as NaturalistObs[];
      return data.results.map((raw) => normalizeObs(raw, taxon));
    })
  );

  // Flatten
  const allObs: NaturalistObs[] = responses.flat();

  // Deduplicate by observation id
  const seen = new Set<number>();
  const deduped = allObs.filter((obs) => {
    if (seen.has(obs.id)) return false;
    seen.add(obs.id);
    return true;
  });

  // Sort by date descending (ISO strings sort lexicographically)
  deduped.sort((a, b) => b.observedOn.localeCompare(a.observedOn));

  return deduped;
}

/**
 * Given a list of NaturalistObs, return the insect order names (latinName)
 * that have had at least one observation in the past 14 days.
 * Used to boost hatch confidence scores in the degree-day engine.
 */
export function getActiveOrders(obs: NaturalistObs[]): string[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffStr = cutoff.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const activeSet = new Set<string>();
  for (const o of obs) {
    if (o.observedOn >= cutoffStr) {
      activeSet.add(o.taxon);
    }
  }
  return Array.from(activeSet);
}
