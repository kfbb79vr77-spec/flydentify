import { X, MapPin, Fish, Feather, Ruler, BookOpen, ExternalLink, ChevronRight, Anchor } from "lucide-react";
import { stateData } from "@/lib/stateData";
import { swStateData } from "@/lib/saltwaterStateData";
import { guidesByRegion, getGuidesForRegion } from "@/lib/guidesData";
import { getGuidesForState } from "@/lib/stateGuides";
import { getShopsForRegion } from "@/lib/flyShopsData";
import { getShopsForState, stateFlyShops } from "@/lib/stateFlyShops";
import type { Fly } from "@/lib/flyData";
import type { SaltwaterFly } from "@/lib/saltwaterFlyData";

// ── Design tokens ─────────────────────────────────────────────────────────────
const fw = {
  bg:       "#0D1B33",
  card:     "rgba(255,255,255,0.04)",
  strip:    "#14120d",
  border:   "rgba(167,122,58,0.25)",
  amber:    "#A67A3A",
  amberDim: "rgba(167,122,58,0.12)",
  text:     "#f5e6cc",
  muted:    "rgba(214,197,176,0.80)",
  faint:    "rgba(214,197,176,0.60)",
};
const sw = {
  bg:       "#060D1A",
  card:     "rgba(61,107,131,0.06)",
  strip:    "#091825",
  border:   "rgba(61,107,131,0.25)",
  accent:   "#3D6B83",
  accentDim:"rgba(61,107,131,0.12)",
  text:     "#f5e6cc",
  muted:    "rgba(214,197,176,0.80)",
  faint:    "rgba(214,197,176,0.60)",
};

// Rig specs pulled from the Rigging page data
const FW_RIGS: Record<string, { rod: string; reel: string; line: string; leader: string; tippet: string; name: string }> = {
  "dry-fly":    { name: "Dry Fly",          rod: "9 ft · 4-5 wt fast action",       reel: "Large arbor, disc drag",              line: "Weight-forward floating",             leader: "9-12 ft tapered 4X",        tippet: "5X-6X fluorocarbon" },
  "nymph":      { name: "Nymph/Indicator",  rod: "10-10.5 ft · 4-5 wt medium-fast", reel: "Large arbor, sealed drag",            line: "WF floating with long head",          leader: "9 ft tapered 3X",           tippet: "4X-5X, 18-24 in" },
  "streamer":   { name: "Streamer",         rod: "9 ft · 6-8 wt fast action",       reel: "Large arbor, strong sealed drag",     line: "Sink-tip or integrated sinking",      leader: "4-6 ft, 0X-2X stiff mono", tippet: "0X-1X heavy fluorocarbon" },
  "dry-dropper":{ name: "Dry-Dropper",      rod: "9 ft · 4-5 wt medium-fast",       reel: "Large arbor, disc drag",              line: "Weight-forward floating",             leader: "9 ft tapered 4X",           tippet: "5X dry · 18-24 in 6X dropper" },
};
const SW_RIGS: Record<string, { rod: string; reel: string; line: string; leader: string; tippet: string; name: string }> = {
  "flats":   { name: "Flats/Bonefish",  rod: "9 ft · 7-9 wt fast action",      reel: "Sealed large arbor, 250 yd backing",      line: "Tropical taper, floating",            leader: "9-12 ft hard mono",           tippet: "10-12 lb fluorocarbon" },
  "tarpon":  { name: "Tarpon",          rod: "9 ft · 11-12 wt fast action",     reel: "Anti-reverse, 400+ yd 30 lb backing",     line: "12-wt tarpon taper, tropical",        leader: "60 lb butt + 20-40 lb class", tippet: "60-80 lb shock or heavy fluoro" },
  "striper": { name: "Striper/Inshore", rod: "9-10 ft · 9-11 wt fast action",  reel: "Large arbor, sealed, 300 yd backing",     line: "Intermediate or clear sink-tip",      leader: "6-8 ft, 20-25 lb hard mono",  tippet: "Loop knot, 15-20 lb fluorocarbon" },
  "weedless":{ name: "Redfish/Flats",   rod: "9 ft · 8 wt fast action",        reel: "Large arbor · 8/9 wt · sealed disc drag", line: "WF8F flats taper, weight-forward",    leader: "9 ft · 12 lb hard mono",      tippet: "12-16 lb fluorocarbon" },
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Derive best rig type from region/state
function inferFWRig(hatches: string[]): string {
  const h = hatches.join(" ").toLowerCase();
  if (h.includes("streamer") || h.includes("sculpin")) return "streamer";
  if (h.includes("nymph") || h.includes("midge")) return "nymph";
  if (h.includes("dry") || h.includes("caddis") || h.includes("pmd") || h.includes("mayfly")) return "dry-fly";
  return "dry-dropper";
}
function inferSWRig(species: string[]): string {
  const s = species.join(" ").toLowerCase();
  if (s.includes("tarpon")) return "tarpon";
  if (s.includes("striper") || s.includes("striped bass") || s.includes("inshore")) return "striper";
  return "weedless";
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface TripDossierDrawerProps {
  open: boolean;
  onClose: () => void;
  waterMode: "fresh" | "salt";
  // FW
  locationLabel?: string | null;
  locationStateAbbr?: string | null;
  selectedRegion?: string;
  regionName?: string;
  selectedMonth?: number;
  recommendedFlies?: Fly[];
  // SW
  selectedSWRegion?: string;
  swRegionName?: string;
  recommendedSWFlies?: SaltwaterFly[];
}

export function TripDossierDrawer({
  open, onClose,
  waterMode,
  locationLabel, locationStateAbbr, selectedRegion, regionName, selectedMonth,
  recommendedFlies = [],
  selectedSWRegion, swRegionName, recommendedSWFlies = [],
}: TripDossierDrawerProps) {
  const t = waterMode === "salt" ? sw : fw;
  const isSalt = waterMode === "salt";
  const monthName = MONTH_NAMES[(selectedMonth ?? new Date().getMonth() + 1) - 1] ?? MONTH_NAMES[new Date().getMonth()];

  // ── Data assembly ──────────────────────────────────────────────────────────
  const stateInfo = locationStateAbbr ? stateData[locationStateAbbr] : null;
  const swState   = (isSalt && locationStateAbbr) ? swStateData[locationStateAbbr] : null;

  const tripName = isSalt
    ? `${swState?.name ?? swRegionName ?? "Saltwater"} · ${monthName}`
    : `${stateInfo?.name ?? regionName ?? "Fly Fishing"} · ${monthName}`;

  // Guides
  const guides = (() => {
    if (locationStateAbbr) {
      const byState = isSalt ? [] : getGuidesForState(locationStateAbbr);
      if (byState.length) return byState.slice(0, 3);
    }
    if (selectedRegion) return getGuidesForRegion(selectedRegion).slice(0, 3);
    return [];
  })();

  // Fly shops
  const shops = (() => {
    if (locationStateAbbr) {
      const byState = getShopsForState(locationStateAbbr);
      if (byState.length) return byState.slice(0, 3);
    }
    if (selectedRegion) return getShopsForRegion(selectedRegion).slice(0, 3);
    return [];
  })();

  // Rig
  const fwRigKey = stateInfo ? inferFWRig(stateInfo.hatches) : "dry-dropper";
  const swRigKey = swState ? inferSWRig(swState.targetSpecies) : "weedless";
  const rig = isSalt ? SW_RIGS[swRigKey] : FW_RIGS[fwRigKey];

  // Flies to bring
  const flies = isSalt ? recommendedSWFlies.slice(0, 6) : recommendedFlies.slice(0, 6);

  // Season notes
  const seasonNotes = isSalt
    ? (swState?.tideNotes ?? []).slice(0, 4)
    : (stateInfo?.hatches ?? []).slice(0, 4);

  const bestMonths = isSalt
    ? (swState?.bestMonths ?? [])
    : (stateInfo?.bestMonths ?? []);

  const topWaters = isSalt
    ? (swState?.topDestinations ?? []).slice(0, 5)
    : (stateInfo?.topRivers ?? []).slice(0, 5);

  const licenseUrl = isSalt ? swState?.licenseUrl : stateInfo?.licenseUrl;
  const quickTip = isSalt ? swState?.quickTip : stateInfo?.quickTip;

  if (!open) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />

      {/* Drawer panel */}
      <div
        className="relative z-10 w-full sm:max-w-lg h-[92vh] sm:h-full overflow-y-auto flex flex-col"
        style={{ backgroundColor: t.bg, borderLeft: `1px solid ${t.border}`, borderTop: `1px solid ${t.border}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-20 flex items-start justify-between px-6 pt-5 pb-4"
          style={{ backgroundColor: t.bg, borderBottom: `1px solid ${t.border}` }}>
          <div>
            <p className="font-['Inter'] text-[10px] uppercase tracking-[0.25em] mb-1"
              style={{ color: isSalt ? sw.accent : fw.amber }}>
              {isSalt ? "Saltwater Trip Kit" : "Freshwater Trip Kit"}
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-xl leading-snug" style={{ color: t.text }}>
              {tripName}
            </h2>
            {locationLabel && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} style={{ color: t.faint }} />
                <p className="font-['Inter'] text-xs" style={{ color: t.faint }}>{locationLabel}</p>
              </div>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}` }}
            aria-label="Close">
            <X size={14} style={{ color: t.faint }} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 px-6 py-6 space-y-8">

          {/* 1. Rig Setup */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                <Ruler size={11} style={{ color: isSalt ? sw.accent : fw.amber }} />
              </div>
              <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                Full Rig Setup
              </h3>
              <span className="font-['Inter'] text-xs italic ml-auto" style={{ color: t.faint }}>{rig.name}</span>
            </div>
            <div className="rounded-sm p-4 space-y-3" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
              {[
                { label: "Rod",    value: rig.rod },
                { label: "Reel",   value: rig.reel },
                { label: "Line",   value: rig.line },
                { label: "Leader", value: rig.leader },
                { label: "Tippet", value: rig.tippet },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="font-['Inter'] text-[10px] uppercase tracking-widest w-14 shrink-0 pt-0.5"
                    style={{ color: t.faint }}>{label}</span>
                  <span className="font-['Inter'] text-sm leading-snug" style={{ color: t.muted }}>{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Flies to Bring */}
          {flies.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                  <Feather size={11} style={{ color: isSalt ? sw.accent : fw.amber }} />
                </div>
                <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                  Pack These Flies
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {flies.map(fly => (
                  <div key={fly.id} className="rounded-sm p-3"
                    style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                    <p className="font-['Cormorant_Garamond'] text-sm leading-snug mb-1" style={{ color: t.text }}>{fly.name}</p>
                    <p className="font-['Inter'] text-[10px]" style={{ color: t.faint }}>
                      {"hook" in fly ? fly.hook : ""} {"type" in fly ? `· ${fly.type}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Top Waters */}
          {topWaters.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                  {isSalt ? <Anchor size={11} style={{ color: sw.accent }} /> : <MapPin size={11} style={{ color: fw.amber }} />}
                </div>
                <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                  {isSalt ? "Top Flats and Bays" : "Top Rivers and Streams"}
                </h3>
              </div>
              <div className="space-y-2">
                {topWaters.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-sm"
                    style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                    <span className="font-['Inter'] text-[10px] w-4 shrink-0" style={{ color: t.faint }}>{i + 1}</span>
                    <span className="font-['Inter'] text-sm" style={{ color: t.muted }}>{w}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Season Notes */}
          {(seasonNotes.length > 0 || bestMonths.length > 0) && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                  <BookOpen size={11} style={{ color: isSalt ? sw.accent : fw.amber }} />
                </div>
                <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                  Season Notes
                </h3>
              </div>
              <div className="rounded-sm p-4 space-y-3" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                {bestMonths.length > 0 && (
                  <div>
                    <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-1.5" style={{ color: t.faint }}>
                      Best Months
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bestMonths.map(m => (
                        <span key={m} className="font-['Inter'] text-xs px-2 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: m === (selectedMonth ?? new Date().getMonth() + 1)
                              ? (isSalt ? sw.accent : fw.amber) : (isSalt ? sw.accentDim : fw.amberDim),
                            color: m === (selectedMonth ?? new Date().getMonth() + 1)
                              ? "#071e25" : t.muted,
                            border: `1px solid ${isSalt ? sw.border : fw.border}`,
                          }}>
                          {MONTH_NAMES[m - 1].slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {seasonNotes.length > 0 && (
                  <div>
                    <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-2" style={{ color: t.faint }}>
                      {isSalt ? "Tide and Species Notes" : "Hatch Calendar"}
                    </p>
                    <ul className="space-y-1.5">
                      {seasonNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight size={11} className="mt-0.5 shrink-0" style={{ color: isSalt ? sw.accent : fw.amber }} />
                          <span className="font-['Inter'] text-xs leading-snug" style={{ color: t.muted }}>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {quickTip && (
                  <div className="pt-3 mt-1" style={{ borderTop: `1px solid ${t.border}` }}>
                    <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-1.5" style={{ color: t.faint }}>
                      Local Edge
                    </p>
                    <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: t.muted }}>{quickTip}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 5. Guides */}
          {guides.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                  <Fish size={11} style={{ color: isSalt ? sw.accent : fw.amber }} />
                </div>
                <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                  Local Guides
                </h3>
              </div>
              <div className="space-y-3">
                {guides.map((g, i) => (
                  <div key={i} className="rounded-sm p-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug" style={{ color: t.text }}>{g.name}</p>
                        <p className="font-['Inter'] text-xs" style={{ color: t.faint }}>{g.location}</p>
                      </div>
                      <span className="font-['Inter'] text-xs font-semibold shrink-0" style={{ color: isSalt ? sw.accent : fw.amber }}>{g.priceRange}</span>
                    </div>
                    <p className="font-['Inter'] text-xs italic leading-snug mb-3" style={{ color: t.faint }}>{g.notes}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {g.rivers.slice(0, 2).map((r, j) => (
                          <span key={j} className="font-['Inter'] text-[10px] px-1.5 py-0.5 rounded-sm"
                            style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, color: t.faint, border: `1px solid ${t.border}` }}>{r}</span>
                        ))}
                      </div>
                      <a href={g.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-['Inter'] text-xs underline hover:opacity-70 shrink-0"
                        style={{ color: isSalt ? sw.accent : fw.amber }}>
                        Book <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Fly Shops */}
          {shops.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isSalt ? sw.accentDim : fw.amberDim, border: `1px solid ${isSalt ? sw.accent : fw.amber}` }}>
                  <Feather size={11} style={{ color: isSalt ? sw.accent : fw.amber }} />
                </div>
                <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest" style={{ color: t.text }}>
                  Local Fly Shops
                </h3>
              </div>
              <div className="space-y-3">
                {shops.map((s, i) => (
                  <div key={i} className="rounded-sm p-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: t.text }}>{s.name}</p>
                        <p className="font-['Inter'] text-xs" style={{ color: t.faint }}>{s.city}, {s.state}</p>
                      </div>
                      <a href={s.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-['Inter'] text-xs underline hover:opacity-70 shrink-0"
                        style={{ color: isSalt ? sw.accent : fw.amber }}>
                        Visit <ExternalLink size={10} />
                      </a>
                    </div>
                    <p className="font-['Inter'] text-xs italic leading-snug mt-1.5" style={{ color: t.faint }}>{s.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* License reminder */}
          {licenseUrl && (
            <div className="rounded-sm px-4 py-3 flex items-center justify-between gap-3"
              style={{ backgroundColor: "rgba(120,80,20,0.08)", border: `1px solid ${fw.border}` }}>
              <p className="font-['Inter'] text-sm italic" style={{ color: t.faint }}>
                Remember your fishing license before you go.
              </p>
              <a href={licenseUrl} target="_blank" rel="noopener noreferrer"
                className="font-['Inter'] text-xs uppercase tracking-widest shrink-0 hover:opacity-70"
                style={{ color: isSalt ? sw.accent : fw.amber }}>
                Get License
              </a>
            </div>
          )}

          {/* Sponsorship placeholder — future affiliate links */}
          <div className="rounded-sm p-4 text-center" style={{ backgroundColor: t.card, border: `1px dashed ${t.border}` }}>
            <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-1" style={{ color: t.faint }}>Gear Recommendations</p>
            <p className="font-['Inter'] text-sm italic" style={{ color: t.faint }}>
              Partner gear links coming soon. Every rod, reel, and line spec will be field-tested and curated by region.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
