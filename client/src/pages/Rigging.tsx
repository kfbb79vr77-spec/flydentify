import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useWaterMode } from "@/lib/waterModeContext";
import { Leaf, Waves, ChevronDown, ShoppingBag, Star, ArrowRight, ExternalLink, ChevronRight, Menu, X } from "lucide-react";
import logoImg from "@assets/flydentify_logo.png";
// ── Fish portraits
import portraitRainbowImg from "@assets/portraits/fw/fw_plate_14_rainbow_trout.png";
import portraitBrownImg from "@assets/portraits/fw/fw_plate_05_brown_trout.png";
import portraitBrookImg from "@assets/portraits/fw/fw_plate_04_brook_trout.png";
import portraitBonefishImg from "@assets/portraits/sw/sw_plate_06_bonefish.png";
import portraitTarponImg from "@assets/portraits/sw/sw_plate_01_atlantic_tarpon.png";
import portraitStriperImg from "@assets/portraits/sw/sw_plate_27_striped_bass.png";
// ── Fly pattern images
import flyAdamsImg from "@assets/flies/adams.png";
import flyElkCaddisImg from "@assets/flies/elk_hair_caddis.png";
import flyHareEarImg from "@assets/flies/hare_ear_nymph.png";
import flyWoollyBuggerImg from "@assets/flies/woolly_bugger.png";
import flyStimulatorImg from "@assets/flies/stimulator.png";
import flyCrazyCharlieImg from "@assets/flies/saltwater/crazy_charlie.png";
import flyCockroachImg from "@assets/flies/saltwater/cockroach.png";
import flyClouserStriperImg from "@assets/flies/saltwater/clouser_striper.png";
import flyCastVid from "@assets/videos/fly_cast.mp4";
import riggingAssemblySwVid from "@assets/videos/rigging_assembly_sw.mp4";
import swHeroV3Vid from "@assets/videos/saltwater_flats_cast_slow3.mp4";
import knotTyingVid from "@assets/videos/knot_tying_macro.mp4";
import knotTyingSwVid from "@assets/videos/knot_tying_macro_sw.mp4";
import fieldCraftFwImg from "@assets/fly_macro.png";
import fieldCraftSwImg from "@assets/hatch_underwater.png";
import saltwaterFlatsVid from "@assets/videos/saltwater_flats_cast_slow3.mp4";
import {
  DryFlyRigDiagram,
  NymphRigDiagram,
  StreamerRigDiagram,
  DryDropperRigDiagram,
  FlatsRigDiagram,
  TarponRigDiagram,
  StriperRigDiagram,
} from "@/components/GearSetupCard";
import RiggingDiagram, { RigConditions } from "@/components/RiggingDiagram";
import { useTrack } from "@/lib/useTrack";

// Map display fly names to Finder fly IDs for deep-linking
const FLY_NAME_TO_ID: Record<string, string> = {
  "Hare's Ear": "hare_ear_nymph",
  "Pheasant Tail": "pheasant_tail",
  "Copper John": "copper_john",
  "Prince Nymph": "prince_nymph",
  "Woolly Bugger": "woolly_bugger",
  "Muddler Minnow": "muddler_minnow",
  "Adams": "adams",
  "Elk Hair Caddis": "elk_hair_caddis",
  "Parachute Adams": "parachute_adams",
  "Stimulator": "stimulator",
  "Zebra Midge": "zebra_midge",
  "Stonefly Nymph": "stonefly_nymph",
  "CDC BWO": "cdc_bwo",
  "PMD Emerger": "pmd_emerger",
  "Copper John Nymph": "copper_john",
  "Clouser Minnow": "clouser_minnow_bone",
  "Deceiver": "deceiver",
  "Snake Fly": "half_and_half",
  "Gurgler": "gurgler",
  "EP Spawning Shrimp": "ep_spawning_shrimp",
  "Tarpon Toad": "tarpon_toad",
  "Cockroach": "cockroach",
  "Crazy Charlie": "crazy_charlie",
  "Del Brown Permit Crab": "del_brown_permit",
  "Black Death": "black_death",
  "Borski Slider": "borski_slider",
  "Gotcha": "gotcha",
  "Sea Habit": "sea_habit",
  "Bruce Chard Redfish": "bruce_chard_redfish",
};
function flyHref(name: string): string {
  const id = FLY_NAME_TO_ID[name];
  return id ? `/#/finder/fly/${id}` : "/#/finder";
}


// ─── Color tokens ─────────────────────────────────────────────────────────────
const fw = {
  bg: "#EFE8D7",
  card: "rgba(0,0,0,0.04)",
  cardHover: "rgba(0,0,0,0.06)",
  border: "rgba(167,122,58,0.2)",
  borderHot: "rgba(167,122,58,0.55)",
  accent: "#A67A3A",
  amber: "#A67A3A",
  text: "#2F2B1E",
  muted: "rgba(37,45,30,0.72)",
  faint: "rgba(37,45,30,0.52)",
  diagBg: "#060D1A",
  strip: "#0D1B33",
  featuredBg: "#0D1B33",
};
const sw = {
  bg: "#EEF2F4",
  card: "rgba(61,107,131,0.08)",
  cardHover: "rgba(61,107,131,0.14)",
  border: "rgba(61,107,131,0.25)",
  borderHot: "rgba(61,107,131,0.55)",
  accent: "#3D6B83",
  amber: "#3D6B83",
  text: "#1A2A38",
  muted: "rgba(26,34,44,0.72)",
  faint: "rgba(26,34,44,0.52)",
  diagBg: "#060D1A",
  strip: "#EEF2F4",
  featuredBg: "#0D1B33",
};

// ─── Affiliate links ───────────────────────────────────────────────────────────
const AFFILIATE = {
  orvis:  "https://www.orvis.com/fly-fishing-rods",
  rio:    "https://www.rioproducts.com/fly-lines",
  simms:  "https://www.simmsfishing.com",
  sage:   "https://www.sageflyfish.com",
  tibor:  "https://www.tibor.com",
  abel:   "https://www.abelflyreels.com",
  scott:  "https://www.scottflyrod.com",
  hatch:  "https://www.hatchoutdoors.com",
  cortland: "https://www.cortlandline.com",
};

// ─── Rig data ─────────────────────────────────────────────────────────────────
const freshRigs = [
  {
    id: "dry-fly",
    name: "Dry fly",
    subtitle: "Surface precision",
    featured: true,
    portrait: portraitRainbowImg,
    portraitAlt: "Rainbow Trout",
    flyImg: flyAdamsImg,
    flyAlt: "Adams dry fly",
    diagram: DryFlyRigDiagram,
    rod: "9 ft, 4-5 wt fast action",
    reel: "Large arbor, disc drag",
    line: "Weight-forward floating",
    leader: "9-12 ft tapered 4X",
    tippet: "5X-6X fluorocarbon",
    tip: "Grease the leader butt with floatant. Keep tippet light. Selective risers refuse anything heavier than 5X on flat water.",
    flies: ["Adams", "Elk Hair Caddis", "Pale Morning Dun", "Parachute Adams"],
    sponsors: [
      { brand: "Orvis", label: "Clearwater 9' 5-wt", url: AFFILIATE.orvis },
      { brand: "Scientific Anglers", label: "Mastery Trout line", url: AFFILIATE.rio },
    ],
  },
  {
    id: "nymph",
    name: "Nymph/Indicator",
    subtitle: "Sub-surface dominance",
    featured: false,
    portrait: portraitBrownImg,
    portraitAlt: "Brown Trout",
    flyImg: flyHareEarImg,
    flyAlt: "Hare's Ear nymph",
    diagram: NymphRigDiagram,
    rod: "10-10.5 ft, 4-5 wt medium-fast",
    reel: "Large arbor, sealed drag",
    line: "Weight-forward floating with long head",
    leader: "9 ft tapered 3X",
    tippet: "4X-5X tippet, 18-24 in",
    tip: "Pinch shot above the fly on light runs. A size-4 indicator set at 1.5x water depth gives the most sensitive strike detection.",
    flies: ["Hare's Ear", "Pheasant Tail", "Copper John", "Prince Nymph"],
    sponsors: [
      { brand: "Sage", label: "Foundation 10.5' 4-wt", url: AFFILIATE.sage },
      { brand: "Rio", label: "Indicator Tippet", url: AFFILIATE.rio },
    ],
  },
  {
    id: "streamer",
    name: "Streamer",
    subtitle: "Aggression at depth",
    featured: false,
    portrait: portraitBrookImg,
    portraitAlt: "Brook Trout",
    flyImg: flyWoollyBuggerImg,
    flyAlt: "Woolly Bugger streamer",
    diagram: StreamerRigDiagram,
    rod: "9 ft, 6-8 wt fast action",
    reel: "Large arbor, strong sealed drag",
    line: "Sink-tip or integrated sinking",
    leader: "4-6 ft, 0X-2X stiff mono",
    tippet: "0X-1X heavy fluorocarbon",
    tip: "Dead-drift the streamer through the strike zone first, then strip hard on the swing. Big fish eat on the hang-down.",
    flies: ["Woolly Bugger", "Muddler Minnow", "Sculpin", "Zonker"],
    sponsors: [
      { brand: "G. Loomis", label: "NRX+ Streamer", url: AFFILIATE.orvis },
      { brand: "Rio", label: "InTouch Streamerdance", url: AFFILIATE.rio },
    ],
  },
  {
    id: "dry-dropper",
    name: "Dry-dropper",
    subtitle: "Two flies, twice the chances",
    featured: false,
    portrait: portraitRainbowImg,
    portraitAlt: "Rainbow Trout",
    flyImg: flyStimulatorImg,
    flyAlt: "Stimulator dry fly",
    diagram: DryDropperRigDiagram,
    rod: "9 ft, 4-5 wt medium-fast",
    reel: "Large arbor, disc drag",
    line: "Weight-forward floating",
    leader: "9 ft tapered 4X",
    tippet: "5X dry, 18-24 in 6X dropper",
    tip: "Tie the dropper off the hook bend of the dry fly. The dry acts as both attractor and indicator.",
    flies: ["Stimulator + Hare's Ear", "Chubby Chernobyl + Zebra Midge", "Foam Beetle + PT"],
    sponsors: [
      { brand: "Orvis", label: "Pro 9' 5-wt", url: AFFILIATE.orvis },
      { brand: "Scientific Anglers", label: "Amplitude Trout", url: AFFILIATE.rio },
    ],
  },
];

const saltRigs = [
  {
    id: "flats",
    name: "Flats/Bonefish",
    subtitle: "Sight fishing precision",
    featured: true,
    portrait: portraitBonefishImg,
    portraitAlt: "Bonefish",
    flyImg: flyCrazyCharlieImg,
    flyAlt: "Crazy Charlie bonefish fly",
    diagram: FlatsRigDiagram,
    rod: "9 ft, 7-9 wt fast action",
    reel: "Sealed large arbor, 250 yd backing",
    line: "Tropical taper, floating",
    leader: "9-12 ft hard mono",
    tippet: "10-12 lb fluorocarbon",
    tip: "Always strip 30 ft off the reel before wading. False cast to the side of the fish, never over it. Lead by 6-8 ft.",
    flies: ["Gotcha", "Bonefish Scampi", "Crazy Charlie", "Mantis Shrimp"],
    sponsors: [
      { brand: "Sage", label: "Salt HD 9' 8-wt", url: AFFILIATE.sage },
      { brand: "Tibor", label: "Everglades reel", url: AFFILIATE.tibor },
      { brand: "Cortland", label: "Tropic Plus line", url: AFFILIATE.cortland },
    ],
  },
  {
    id: "tarpon",
    name: "Tarpon",
    subtitle: "The silver king",
    featured: false,
    portrait: portraitTarponImg,
    portraitAlt: "Tarpon",
    flyImg: flyCockroachImg,
    flyAlt: "Cockroach tarpon fly",
    diagram: TarponRigDiagram,
    rod: "9 ft, 11-12 wt fast action",
    reel: "Anti-reverse, 400+ yd 30 lb backing",
    line: "12-wt tarpon taper, tropical",
    leader: "60 lb butt + 20-40 lb class",
    tippet: "Heavy 60-80 lb shock or heavy fluoro",
    tip: "Bow to the king on the jump. Drop the rod tip and thrust it toward the fish. Fighting high will tire your arm before the fish.",
    flies: ["Black Death", "Cockroach", "EP Tarpon Bunny", "Tarpon Toad"],
    sponsors: [
      { brand: "Sage", label: "Motive 12-wt", url: AFFILIATE.sage },
      { brand: "Abel", label: "Super 12/13 reel", url: AFFILIATE.abel },
      { brand: "Rio", label: "Leviathan line", url: AFFILIATE.rio },
    ],
  },
  {
    id: "striper",
    name: "Striper/Inshore",
    subtitle: "Baitfish in the surf",
    featured: false,
    portrait: portraitStriperImg,
    portraitAlt: "Striped Bass",
    flyImg: flyClouserStriperImg,
    flyAlt: "Clouser Minnow striper fly",
    diagram: StriperRigDiagram,
    rod: "9-10 ft, 9-11 wt fast action",
    reel: "Large arbor, sealed, 300 yd backing",
    line: "Intermediate or clear sink-tip",
    leader: "6-8 ft, 20-25 lb hard mono",
    tippet: "Loop knot, 15-20 lb fluorocarbon",
    tip: "Cast into the current seam, let the intermediate line sink 3-5 seconds. Long strips trigger the predator response.",
    flies: ["Clouser Minnow", "Deceiver", "Snake Fly", "Gurgler"],
    sponsors: [
      { brand: "Scott", label: "Meridian 10' 10-wt", url: AFFILIATE.scott },
      { brand: "Hatch", label: "Finatic reel", url: AFFILIATE.hatch },
      { brand: "Rio", label: "Striper line", url: AFFILIATE.rio },
    ],
  },
  {
    id: "flats-popper",
    name: "Flats popper",
    subtitle: "Surface commotion on the flats",
    featured: false,
    portrait: portraitBonefishImg,
    portraitAlt: "Redfish on the flats",
    flyImg: flyCockroachImg,
    flyAlt: "Surface popper fly",
    diagram: FlatsRigDiagram,
    rod: "9 ft, 7-8 wt fast action",
    reel: "Sealed large arbor, 200 yd backing",
    line: "Tropical taper, floating",
    leader: "9 ft leader, 20 lb fluorocarbon",
    tippet: "Tippet ring to 20 lb fluorocarbon class",
    tip: "Let it sit after the splash. Redfish key in on the rest, not the pop. Works best on incoming tide with low wind.",
    flies: ["Gurgler", "Sea Habit", "Surface Popper"],
    sponsors: [
      { brand: "Sage", label: "Salt HD 9' 8-wt", url: AFFILIATE.sage },
      { brand: "Tibor", label: "Everglades reel", url: AFFILIATE.tibor },
      { brand: "Cortland", label: "Tropic Plus line", url: AFFILIATE.cortland },
    ],
  },
];

// ─── River context presets (condition-aware copy seed data) ─────────────────
type RiverPreset = {
  id: string;
  name: string;
  state: string;
  rigType: RigConditions["rigType"];
  cfs?: number;
  clarity?: RigConditions["clarity"];
  hatch?: string;
  season?: RigConditions["season"];
};

const FRESH_PRESETS: RiverPreset[] = [
  { id: "generic-fw", name: "Generic freshwater", state: "", rigType: "dry-fly" },
  { id: "guadalupe", name: "Guadalupe River, TX", state: "TX", rigType: "dry-fly",   cfs: 85,  clarity: "clear",   hatch: "Caddis" },
  { id: "frio",      name: "Frio River, TX",      state: "TX", rigType: "nymph",    cfs: 72,  clarity: "clear",   hatch: "Midge" },
  { id: "s-llano",   name: "South Llano, TX",     state: "TX", rigType: "dry-fly",  cfs: 55,  clarity: "clear",   hatch: "PMD" },
  { id: "madison",   name: "Madison River, MT",   state: "MT", rigType: "dry-fly",  cfs: 1800,clarity: "stained", hatch: "Salmonfly" },
  { id: "bighorn",   name: "Bighorn River, WY",   state: "WY", rigType: "nymph",   cfs: 1100,clarity: "clear",   hatch: "Midge" },
  { id: "green",     name: "Green River, UT",     state: "UT", rigType: "dry-fly",  cfs: 1250,clarity: "clear",   hatch: "PMD" },
  { id: "dream",     name: "South Platte, CO",    state: "CO", rigType: "nymph",   cfs: 110, clarity: "clear",   hatch: "Midge" },
  { id: "beaverkill",name: "Beaverkill, NY",      state: "NY", rigType: "dry-fly",  cfs: 220, clarity: "clear",   hatch: "Sulphur" },
  { id: "deschutes", name: "Deschutes River, OR", state: "OR", rigType: "streamer", cfs: 2800,clarity: "stained" },
];

const SALT_PRESETS: RiverPreset[] = [
  { id: "generic-sw", name: "Generic saltwater", state: "",   rigType: "flats" },
  { id: "flats-bh",   name: "Bonefish flats",    state: "FL", rigType: "flats",   clarity: "clear" },
  { id: "tarpon-fl",  name: "Tarpon, Florida Keys", state: "FL", rigType: "tarpon", clarity: "clear" },
  { id: "striper-ne", name: "Stripers, New England", state: "MA", rigType: "striper",clarity: "stained" },
  { id: "redfish-tx", name: "Redfish, Texas Gulf",  state: "TX", rigType: "flats",  clarity: "stained" },
  { id: "boca-grande", name: "Boca Grande Pass, FL",   state: "FL", rigType: "tarpon",  clarity: "clear",   hatch: "Tarpon migration", season: "summer" },
  { id: "la-marsh",    name: "Louisiana Marsh",        state: "LA", rigType: "flats",   clarity: "stained", hatch: "Tailing redfish" },
  { id: "chesapeake",  name: "Chesapeake Bay, MD",     state: "MD", rigType: "striper", clarity: "stained", hatch: "Baitfish schools" },
  { id: "fl-keys",     name: "Florida Keys Flats",     state: "FL", rigType: "flats",   clarity: "clear",   hatch: "Permit on grass" },
  { id: "outer-banks", name: "Outer Banks, NC",        state: "NC", rigType: "striper", clarity: "clear",   hatch: "False albacore blitz", season: "fall" },
];

// Map rig id → RigConditions rigType
const RIG_ID_MAP: Record<string, RigConditions["rigType"]> = {
  "dry-fly":     "dry-fly",
  "nymph":       "nymph",
  "streamer":    "streamer",
  "dry-dropper": "dry-dropper",
  "flats":       "flats",
  "tarpon":      "tarpon",
  "striper":     "striper",
  "flats-popper":"flats",
};

// ─── Water mode toggle ────────────────────────────────────────────────────────
function WaterModeToggle({ mode, onChange, compact = false }: { mode: "fresh" | "salt"; onChange: (m: "fresh" | "salt") => void; compact?: boolean }) {
  return (
    <div
      className="inline-flex rounded-sm p-0.5"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,204,0.2)" }}
    >
      {(["fresh", "salt"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-1 rounded-sm font-['Inter'] uppercase tracking-wider transition-all duration-200 ${compact ? "px-2.5 py-2.5 text-[13px] min-h-[44px]" : "px-5 py-2 text-sm gap-1.5 min-h-[44px]"}`}
            style={
              active
                ? { backgroundColor: m === "fresh" ? "#A67A3A" : "#0D1B33", color: m === "fresh" ? "#2F2B1E" : "#F7F1E2", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
                : { color: "rgba(245,230,204,0.55)" }
            }
          >
            {m === "fresh" ? <Leaf size={compact ? 11 : 13} /> : <Waves size={compact ? 11 : 13} />}
            {compact ? (m === "fresh" ? "FW" : "SW") : (m === "fresh" ? "Freshwater" : "Saltwater")}
          </button>
        );
      })}
    </div>
  );
}

// ─── Featured Rig, always-visible large card ─────────────────────────────────
function FeaturedRig({ rig, t, isSalt, onShopClick }: {
  rig: typeof freshRigs[0];
  t: typeof fw;
  isSalt: boolean;
  onShopClick: (rigId: string, brand: string) => void;
}) {
  const Diagram = rig.diagram;
  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ border: `1px solid ${t.borderHot}`, backgroundColor: t.featuredBg }}
    >
      {/* Featured label */}
      <div
        className="px-6 pt-4 pb-3 flex items-center gap-2"
        style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.08)" : "rgba(167,122,58,0.08)", borderBottom: `1px solid ${t.border}` }}
      >
        <Star size={11} style={{ color: t.accent }} />
        <p className="font-['Inter'] text-[9px] uppercase tracking-[0.28em]" style={{ color: t.accent }}>
          Featured rig
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left, diagram + name */}
        <div className="p-6 lg:p-8" style={{ borderBottom: `1px solid ${t.border}` }}>
          {/* Species portrait banner */}
          {rig.portrait && (
            <div className="relative rounded-sm overflow-hidden mb-5 flex items-center justify-center" style={{ height: 200, backgroundColor: "#0a141d" }}>
              <img
                src={rig.portrait}
                alt={rig.portraitAlt || rig.name}
                className="w-full h-full object-contain"
                style={{ padding: "8px" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
              <p className="absolute bottom-3 left-4 font-['Inter'] text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(245,230,204,0.75)" }}>
                {rig.portraitAlt}
              </p>
            </div>
          )}
          <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.22em] mb-2" style={{ color: t.accent }}>
            {rig.subtitle}
          </p>
          <h2 className="font-['Cormorant_Garamond'] italic text-3xl mb-6" style={{ color: "#fff" }}>
            {rig.name}
          </h2>
          {/* Full diagram, always visible */}
          <div
            className="rounded-sm overflow-hidden p-3"
            style={{ backgroundColor: t.diagBg, border: `1px solid ${t.border}` }}
          >
            <Diagram salt={isSalt} />
          </div>
        </div>

        {/* Right, specs + field tip */}
        <div className="flex flex-col" style={{ borderLeft: `1px solid ${t.border}`, backgroundColor: isSalt ? "rgba(240,242,244,0.97)" : "rgba(238,240,232,0.97)" }}>
          {/* Gear specs */}
          <div className="px-6 lg:px-8 pt-8 pb-4">
            {[
              { label: "Rod", value: rig.rod },
              { label: "Reel", value: rig.reel },
              { label: "Line", value: rig.line },
              { label: "Leader", value: rig.leader },
              { label: "Tippet", value: rig.tippet },
            ].map((row, i) => (
              <div
                key={row.label}
                className="flex items-start gap-4 py-3"
                style={{ borderBottom: i < 4 ? `1px solid ${t.border}` : "none" }}
              >
                <p className="font-['Cinzel'] text-[13px] uppercase tracking-widest w-14 shrink-0 mt-0.5" style={{ color: t.accent }}>
                  {row.label}
                </p>
                <p className="font-['Inter'] text-sm leading-snug" style={{ color: isSalt ? "#1A2A38" : "#2F2B1E" }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* Field tip */}
          <div className="px-6 lg:px-8 py-4" style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.08)" : "rgba(120,80,20,0.1)", borderTop: `1px solid ${t.border}` }}>
            <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: isSalt ? "rgba(26,34,44,0.82)" : "rgba(37,45,30,0.82)" }}>
              <span className="font-semibold not-italic" style={{ color: t.accent }}>Field tip: </span>
              {rig.tip}
            </p>
          </div>

          {/* Fly patterns */}
          <div className="px-6 lg:px-8 py-4" style={{ borderTop: `1px solid ${t.border}` }}>
            <p className="font-['Cinzel'] text-[9px] uppercase tracking-widest mb-3" style={{ color: isSalt ? "rgba(26,34,44,0.55)" : "rgba(37,45,30,0.55)" }}>Common patterns</p>
            <div className="flex flex-wrap gap-1.5">
              {rig.flies.map(fly => (
                <a
                  key={fly}
                  href={flyHref(fly)}
                  onClick={(e) => { e.preventDefault(); window.location.hash = flyHref(fly).replace("/#", ""); }}
                  className="font-['Inter'] text-sm px-2.5 py-1 rounded-sm hover:underline transition-colors"
                  style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.12)" : "rgba(120,80,20,0.18)", border: `1px solid ${t.border}`, color: isSalt ? "rgba(26,34,44,0.82)" : "rgba(37,45,30,0.82)" }}
                >
                  {fly}
                </a>
              ))}
            </div>
          </div>

          {/* Sponsor links */}
          <div
            className="mt-auto px-6 lg:px-8 py-5"
            style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.05)" : "rgba(167,122,58,0.06)", borderTop: `1px solid ${t.borderHot}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={11} style={{ color: t.accent }} />
              <p className="font-['Cinzel'] text-[9px] uppercase tracking-[0.22em]" style={{ color: t.accent }}>Shop this rig</p>
            </div>
            <div className="flex flex-col gap-2">
              {rig.sponsors.map(s => (
                <a
                  key={s.brand}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onShopClick(rig.id, s.brand)}
                  className="flex items-center justify-between group px-3.5 py-2.5 rounded-sm transition-all duration-200"
                  style={{ border: `1px solid ${t.border}`, backgroundColor: isSalt ? "rgba(61,107,131,0.10)" : "rgba(160,118,58,0.12)" }}
                >
                  <div>
                    <p className="font-['Cinzel'] text-[13px] uppercase tracking-widest" style={{ color: t.accent }}>{s.brand}</p>
                    <p className="font-['Inter'] text-sm mt-0.5" style={{ color: t.muted }}>{s.label}</p>
                  </div>
                  <ExternalLink size={11} style={{ color: t.faint }} className="group-hover:opacity-100 opacity-60 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible rig card ─────────────────────────────────────────────────────
function RigCard({ rig, t, isSalt, onExpand, onShopClick }: {
  rig: typeof freshRigs[0];
  t: typeof fw;
  isSalt: boolean;
  onExpand: (rigId: string, rigName: string) => void;
  onShopClick: (rigId: string, brand: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Diagram = rig.diagram;

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onExpand(rig.id, rig.name);
  };

  return (
    <div
      className="rounded-sm overflow-hidden transition-all duration-300 shadow-sm"
      style={{ border: `1px solid ${open ? t.borderHot : t.border}`, backgroundColor: "#FAF9F5" }}
    >
      {/* Clickable header */}
      <button
        className="w-full text-left px-8 pt-8 pb-6 flex items-center justify-between gap-4 min-h-[72px]"
        onClick={handleToggle}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          {/* Rig schematic badge — readable at any size */}
          <div
            className="rounded-sm shrink-0 flex flex-col items-center justify-center gap-0.5"
            style={{ width: 80, height: 72, backgroundColor: t.diagBg, border: `1px solid ${t.border}`, padding: "8px 6px" }}
          >
            {/* Reel icon */}
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              {/* Outer ring */}
              <circle cx="11" cy="11" r="9" stroke={isSalt ? "rgba(61,107,131,0.7)" : "rgba(212,168,90,0.7)"} strokeWidth="1.5" fill="rgba(0,0,0,0.4)" />
              {/* Arbor */}
              <circle cx="11" cy="11" r="4.5" stroke={isSalt ? "rgba(61,107,131,0.9)" : "rgba(212,168,90,0.9)"} strokeWidth="1.2" fill="none" />
              {/* Spokes */}
              <line x1="11" y1="6.5" x2="11" y2="9" stroke={isSalt ? "rgba(61,107,131,0.5)" : "rgba(212,168,90,0.5)"} strokeWidth="1" />
              <line x1="11" y1="13" x2="11" y2="15.5" stroke={isSalt ? "rgba(61,107,131,0.5)" : "rgba(212,168,90,0.5)"} strokeWidth="1" />
              <line x1="6.5" y1="11" x2="9" y2="11" stroke={isSalt ? "rgba(61,107,131,0.5)" : "rgba(212,168,90,0.5)"} strokeWidth="1" />
              <line x1="13" y1="11" x2="15.5" y2="11" stroke={isSalt ? "rgba(61,107,131,0.5)" : "rgba(212,168,90,0.5)"} strokeWidth="1" />
              {/* Center hub */}
              <circle cx="11" cy="11" r="2" fill={isSalt ? "rgba(61,107,131,0.7)" : "rgba(212,168,90,0.7)"} />
              {/* Rod blank out to right */}
              <line x1="20" y1="11" x2="27" y2="8" stroke={isSalt ? "rgba(61,107,131,0.6)" : "rgba(212,168,90,0.6)"} strokeWidth="2" strokeLinecap="round" />
            </svg>
            {/* Rig segment bars */}
            <div className="flex items-center gap-0.5 w-full">
              {/* Fly line — thickest, colored */}
              <div style={{ height: 4, flex: 2.5, borderRadius: 2, backgroundColor: isSalt ? "rgba(61,107,131,0.9)" : "rgba(167,122,58,0.9)" }} />
              {/* Leader — thinner, white dashed effect */}
              <div style={{ height: 2.5, flex: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.45)", backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(0,0,0,0.5) 3px,rgba(0,0,0,0.5) 5px)" }} />
              {/* Tippet — finest, faint */}
              <div style={{ height: 1.5, flex: 1.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.28)" }} />
              {/* Fly dot */}
              <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, backgroundColor: isSalt ? "rgba(61,107,131,0.9)" : "rgba(167,122,58,0.9)", border: "1px solid rgba(255,255,255,0.4)" }} />
            </div>
            <p className="font-['Inter'] text-[7px] uppercase tracking-wider w-full text-left" style={{ color: isSalt ? "rgba(61,107,131,0.7)" : "rgba(167,122,58,0.7)" }}>
              {rig.subtitle}
            </p>
          </div>
          <div>
            <p className="font-['Cinzel'] text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: t.accent }}>
              {rig.subtitle}
            </p>
            <h3 className="font-['Cormorant_Garamond'] italic text-2xl" style={{ color: t.text }}>
              {rig.name}
            </h3>
          </div>
        </div>
        <ChevronDown
          size={16}
          style={{ color: t.faint }}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Full diagram */}
          <div className="px-8 pb-6" style={{ backgroundColor: t.diagBg, borderTop: `1px solid ${t.border}` }}>
            <Diagram salt={isSalt} />
          </div>

          {/* Gear spec rows */}
          <div className="px-8 py-6" style={{ borderTop: `1px solid ${t.border}` }}>
            {[
              { label: "Rod", value: rig.rod },
              { label: "Reel", value: rig.reel },
              { label: "Line", value: rig.line },
              { label: "Leader", value: rig.leader },
              { label: "Tippet", value: rig.tippet },
            ].map((row, i) => (
              <div
                key={row.label}
                className="flex items-start gap-4 py-3"
                style={{ borderBottom: i < 4 ? `1px solid ${t.border}` : "none" }}
              >
                <p className="font-['Cinzel'] text-[13px] uppercase tracking-widest w-14 shrink-0 mt-0.5" style={{ color: t.accent }}>
                  {row.label}
                </p>
                <p className="font-['Inter'] text-sm leading-snug" style={{ color: t.text }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* Field tip */}
          <div className="px-8 py-6" style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.08)" : "rgba(120,80,20,0.1)", borderTop: `1px solid ${t.border}` }}>
            <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: t.muted }}>
              <span className="font-semibold not-italic" style={{ color: t.accent }}>Field tip: </span>
              {rig.tip}
            </p>
          </div>

          {/* Flies */}
          <div className="px-8 pb-6" style={{ borderTop: `1px solid ${t.border}` }}>
            <p className="font-['Cinzel'] text-[9px] uppercase tracking-widest pt-4 mb-2.5" style={{ color: t.faint }}>
              Common patterns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {rig.flies.map(fly => (
                <a
                  key={fly}
                  href={flyHref(fly)}
                  onClick={(e) => { e.preventDefault(); window.location.hash = flyHref(fly).replace("/#", ""); }}
                  className="font-['Inter'] text-sm px-2.5 py-1 rounded-sm hover:underline transition-colors"
                  style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.12)" : "rgba(120,80,20,0.18)", border: `1px solid ${t.border}`, color: t.muted }}
                >
                  {fly}
                </a>
              ))}
            </div>
          </div>

          {/* Sponsor links */}
          <div
            className="px-8 py-6"
            style={{ borderTop: `1px solid ${t.border}`, backgroundColor: isSalt ? "rgba(61,107,131,0.05)" : "rgba(167,122,58,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={11} style={{ color: t.accent }} />
              <p className="font-['Cinzel'] text-[9px] uppercase tracking-[0.22em]" style={{ color: t.accent }}>Shop this rig</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rig.sponsors.map(s => (
                <a
                  key={s.brand}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onShopClick(rig.id, s.brand)}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-200 hover:opacity-90"
                  style={{ border: `1px solid ${t.accent}`, backgroundColor: isSalt ? "rgba(61,107,131,0.10)" : "rgba(160,118,58,0.10)" }}
                >
                  <p className="font-['Cinzel'] text-[13px] uppercase tracking-widest" style={{ color: t.accent }}>{s.brand}</p>
                  <ExternalLink size={9} style={{ color: t.accent }} />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Gear philosophy strip ────────────────────────────────────────────────────
function PhilosophyStrip({ t }: { t: typeof fw }) {
  const items = [
    { num: "01", head: "Match the presentation", body: "Different fly types demand different line tapers, leader lengths, and tippet diameters. The rig is not an afterthought." },
    { num: "02", head: "Tippet is the handshake", body: "Too heavy and selective fish refuse. Too light and the fish wins. Tippet diameter is the single most correctable variable on the water." },
    { num: "03", head: "The rod loads the story", body: "A 4-weight dry-fly rod and a 7-weight streamer rod are different tools entirely. Correct weight means efficient casting, natural drift, and fast fights." },
  ];
  // Strip bg is always dark (#1c1a14 FW, #F0F2F4 SW) — use light text on dark
  const onDark = t.strip.startsWith("#1") || t.strip.startsWith("#0");
  const headColor = onDark ? "rgba(245,235,215,0.95)" : t.text;
  const bodyColor = onDark ? "rgba(245,235,215,0.60)" : t.muted;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {items.map(item => (
        <div key={item.num} className="flex gap-4">
          <span className="font-['Inter'] text-sm shrink-0 mt-1" style={{ color: t.accent, letterSpacing: "0.1em" }}>{item.num}</span>
          <div>
            <p className="font-['Cormorant_Garamond'] text-lg mb-2" style={{ color: headColor }}>{item.head}</p>
            <p className="font-['Inter'] text-base leading-relaxed" style={{ color: bodyColor }}>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Rigging() {
  const { waterMode, setWaterMode } = useWaterMode();
  const { track } = useTrack();
  const isSalt = waterMode === "salt";
  const t = isSalt ? sw : fw;
  const rigs = isSalt ? saltRigs : freshRigs;
  const otherRigs = rigs.filter(r => !r.featured);

  // Mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── Interactive diagram state ──
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    isSalt ? SALT_PRESETS[0].id : FRESH_PRESETS[0].id
  );

  // When water mode switches, reset preset to first for that mode
  const prevSalt = useRef(isSalt);
  useEffect(() => {
    if (prevSalt.current !== isSalt) {
      prevSalt.current = isSalt;
      setSelectedPresetId(isSalt ? SALT_PRESETS[0].id : FRESH_PRESETS[0].id);
    }
  }, [isSalt]);

  const selectedPreset = (isSalt ? SALT_PRESETS : FRESH_PRESETS).find(p => p.id === selectedPresetId)
    || (isSalt ? SALT_PRESETS[0] : FRESH_PRESETS[0]);

  const featuredRig = rigs.find(r => r.id === selectedPreset.rigType) || rigs.find(r => r.featured) || rigs[0];

  const conditions: RigConditions = {
    rigType: selectedPreset.rigType,
    cfs:     selectedPreset.cfs,
    clarity: selectedPreset.clarity,
    hatch:   selectedPreset.hatch,
    river:   selectedPreset.name,
    season:  selectedPreset.season,
  };

  useEffect(() => {
    track("page_view", { page: "rigs" });
  }, []);

  const handleModeChange = (m: "fresh" | "salt") => {
    setWaterMode(m);
    track("water_mode_change", { new_mode: m, page: "rigs" });
  };

  const handleRigExpand = (rig_id: string, rig_name: string) => {
    track("rig_expand", { rig_id, rig_name });
  };

  const handleShopClick = (rig_id: string, brand: string) => {
    track("shop_click", { rig_id, brand });
    track("affiliate_click", { target: brand, page: "rigs" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: t.bg }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-30"
        style={{ backgroundColor: "#0D1B33", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      >
        {/* ── Logo row ── */}
        <div className="flex justify-center px-4 pt-3 pb-1">
          <Link href="/"><img src={logoImg} alt="Flydentify" className="w-auto h-auto block" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", cursor: "pointer" }}/></Link>
        </div>
        {/* ── Nav row: toggle / links / hamburger ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-2.5">
          <WaterModeToggle mode={waterMode} onChange={handleModeChange} compact />
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link href="/finder"><span className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", cursor: "pointer" }}>Finder</span></Link>
            <Link href="/hatch-chart"><span className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", cursor: "pointer" }}>Hatch</span></Link>
            <Link href="/conditions"><span className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", cursor: "pointer" }}>Conditions</span></Link>
          </div>
          <button className="md:hidden flex items-center justify-center w-10 h-10" onClick={() => setMobileNavOpen(v=>!v)} style={{ color: "rgba(245,230,204,0.8)" }}>
            {mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen nav */}
      {mobileNavOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[9998] flex flex-col"
          style={{ backgroundColor: "#0D1B33" }}
        >
          {/* Close button top-right */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={logoImg} alt="Flydentify" style={{ height: 72, width: "auto", filter: "brightness(0) invert(1)", display: "block" }} />
            <button onClick={() => setMobileNavOpen(false)} className="w-11 h-11 flex items-center justify-center" style={{ color: "rgba(245,230,204,0.6)" }}>
              <X size={22} />
            </button>
          </div>
          {/* Links */}
          <div className="flex flex-col px-6 pt-6 flex-1">
            {[
              { label: "Fly Finder", href: "/finder" },
              { label: "Hatch chart", href: "/hatch-chart" },
              { label: "Rigging", href: "/rigging" },
              { label: "Conditions", href: "/conditions" },
              { label: "Catch reports", href: "/reports" },
              { label: "My trips", href: "/trips" },
              { label: "Pricing", href: "/pricing" },
            ].map(link => (
              <Link key={link.label} href={link.href}>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-left py-5 font-['Cormorant_Garamond'] italic text-2xl border-b"
                  style={{ color: "#F7F1E2", borderColor: "rgba(255,255,255,0.07)" }}
                >
                  {link.label}
                </button>
              </Link>
            ))}
          </div>
          {/* Tagline bottom */}
          <p className="px-6 pb-8 font-['Cinzel'] text-[13px] uppercase tracking-[0.25em]" style={{ color: "rgba(245,230,204,0.2)" }}>
            Tell them Flydentify hooked you up.
          </p>
        </div>
      )}

      {/* ── Hero, cinematic video ── */}
      <section className="relative overflow-hidden" style={{ height: "75vh", minHeight: 480 }}>
        {/* Video background, swaps FW/SW */}
        <video
          key={isSalt ? "rigging-sw" : "rigging-fw"}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.85) saturate(1.05)" }}
          onLoadedData={() => {}}
        >
          <source src={isSalt ? riggingAssemblySwVid : flyCastVid} type="video/mp4" />
        </video>
        {/* Gradient overlay — strong bottom scrim for headline legibility */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.82) 100%)` }} />
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="font-['Inter'] text-[13px] tracking-[0.28em] uppercase mb-3" style={{ color: t.accent }}>
                {isSalt ? "Saltwater gear setup" : "Gear setup & rigging"}
              </p>
              <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl lg:text-6xl leading-tight mb-4" style={{ color: "#fff", fontWeight: 300, fontStyle: "italic", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                {isSalt ? <>The right rig<br /><span style={{ color: t.accent, fontWeight: 400 }}>for every flat.</span></> : <>The right rig<br /><span style={{ color: t.accent, fontWeight: 400 }}>for every hatch.</span></>}
              </h1>
              <p className="font-['Inter'] text-base leading-relaxed max-w-md" style={{ color: "rgba(245,230,204,0.75)" }}>
                {isSalt
                  ? "Line weight, shock tippet, leader formula. Every variable matters when permit are tailing. These are the rigs built for salt."
                  : "Rod weight, line taper, leader length, tippet diameter. Every variable matters when fish are selective. These are the rigs that work."}
              </p>
            </div>
            <WaterModeToggle mode={waterMode} onChange={handleModeChange} />
          </div>
        </div>
      </section>

      {/* ── Interactive Rigging Diagram ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-20" style={{ backgroundColor: t.bg }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
            <div>
              <p className="font-['Cinzel'] text-[13px] tracking-[0.28em] uppercase mb-2" style={{ color: t.accent }}>
                Gear anatomy
              </p>
              <h2 className="font-['Cormorant_Garamond'] italic text-3xl md:text-4xl" style={{ color: t.text }}>
                Tap each segment to understand why it matters.
              </h2>
            </div>
            {/* River / situation selector */}
            <div className="flex flex-col gap-3">
              <p className="font-['Cinzel'] text-[9px] uppercase tracking-[0.22em]" style={{ color: t.faint }}>
                Select situation
              </p>
              <div className="flex flex-wrap gap-2.5">
                {(isSalt ? SALT_PRESETS : FRESH_PRESETS).map(p => {
                  const isSelected = selectedPresetId === p.id;
                  const chips = [p.clarity, p.season].filter(Boolean) as string[];
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      data-testid={`preset-${p.id}`}
                      className="rounded-sm transition-all duration-200 min-h-[44px] text-left px-4 py-3 shadow-sm"
                      style={isSelected
                        ? { backgroundColor: t.accent, boxShadow: `0 0 10px ${t.accent}44` }
                        : { border: `1px solid ${t.border}`, backgroundColor: "#FAF9F5" }
                      }
                    >
                      <p className="font-['Cormorant_Garamond'] italic text-sm mb-1" style={{ color: isSelected ? "#fff" : t.text }}>
                        {p.name}
                      </p>
                      {chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {chips.map(c => (
                            <span key={c} className="font-['Cinzel'] text-[9px] uppercase tracking-widest" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : t.accent }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* The interactive diagram */}
          <div className="-mx-6 sm:-mx-10 lg:-mx-16">
            <RiggingDiagram
              conditions={conditions}
              isSalt={isSalt}
              riverName={selectedPreset.id.startsWith("generic") ? undefined : selectedPreset.name}
            />
          </div>
        </div>
      </section>

      {/* ── Amber rule before rig cards ── */}
      <div className="mx-6 sm:mx-10 lg:mx-16" style={{ height: 1, backgroundColor: t.border }} />

      {/* ── Featured rig, full display ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-20" style={{ backgroundColor: t.bg }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.28em] uppercase mb-4" style={{ color: t.accent }}>
            Featured rig
          </p>
          <FeaturedRig
            rig={featuredRig}
            t={t}
            isSalt={isSalt}
            onShopClick={handleShopClick}
          />
        </div>
      </section>

      {/* ── Orange/teal rule ── */}
      <div style={{ height: 2, backgroundColor: t.accent, opacity: 0.2 }} />

      {/* ── Field Craft static image interstitial ── */}
      <section className="relative overflow-hidden" style={{ height: 340 }}>
        <img
          src={isSalt ? fieldCraftSwImg : fieldCraftFwImg}
          alt={isSalt ? "Mayfly nymph ascending through crystal water" : "Dry fly on leather"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: isSalt ? "center 40%" : "center 55%",
            filter: isSalt ? "brightness(0.7)" : "brightness(0.75)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%)" }} />
        <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-16">
          <div className="max-w-sm">
            <p className="font-['Cinzel'] text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: t.accent }}>Field craft</p>
            <p className="font-['Cormorant_Garamond'] text-2xl md:text-3xl leading-snug mb-3" style={{ color: "#fff", fontWeight: 300, fontStyle: "italic", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
              {isSalt ? "The loop knot gives your fly life." : "The knot is the last thing between you and the fish."}
            </p>
            <p className="font-['Inter'] text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
              {isSalt
                ? "A non-slip mono loop lets a Deceiver swing freely. Clinch knots kill action. Loop knots win."
                : "Five wraps, tag through the loop, cinch slow. A clinch knot tied fast costs fish. Tied right, it holds forever."}
            </p>
          </div>
        </div>
      </section>

      {/* ── Gear philosophy ── */}
      <section style={{ backgroundColor: t.strip }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
          <PhilosophyStrip t={t} />
        </div>
      </section>

      {/* ── Additional rig cards ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-20" style={{ backgroundColor: t.bg }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.25em] uppercase mb-3" style={{ color: t.accent }}>
            {isSalt ? "More saltwater rigs" : "More freshwater rigs"}
          </p>
          <h2 className="font-['Cormorant_Garamond'] italic text-3xl md:text-4xl mb-10" style={{ color: t.text }}>
            {isSalt ? "Every coastal situation, covered." : "Every river situation, covered."}
          </h2>

          <div className="space-y-4">
            {otherRigs.map(rig => (
              <RigCard
                key={rig.id}
                rig={rig}
                t={t}
                isSalt={isSalt}
                onExpand={handleRigExpand}
                onShopClick={handleShopClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsorship banner ── */}
      <section
        className="px-6 sm:px-10 lg:px-16 py-20"
        style={{ backgroundColor: isSalt ? "#060D1A" : "#0D1B33", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} style={{ color: t.accent }} />
              <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em]" style={{ color: t.accent }}>
                Flydentify partners
              </p>
            </div>
            <h3 className="font-['Cormorant_Garamond'] italic text-2xl mb-2" style={{ color: "#F7F1E2" }}>
              Every rig. Every fly.<br />Saved to your kit.
            </h3>
            <p className="font-['Inter'] text-base leading-relaxed max-w-sm" style={{ color: "rgba(245,230,204,0.72)" }}>
              Build a trip kit from any rig or fly recommendation. Save it, share it, bring it to the water.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <a
              href="/#/trips"
              onClick={() => track("kit_build_click", { page: "rigs_banner" })}
              className="font-['Inter'] text-sm uppercase tracking-widest px-7 py-3 rounded-sm transition-opacity hover:opacity-80 min-h-[44px] flex items-center gap-2 justify-center"
              style={{ backgroundColor: t.accent, color: "#fff" }}
            >
              Build Your Kit <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA, back into app ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-20" style={{ backgroundColor: t.bg }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-['Cormorant_Garamond'] italic text-2xl mb-2" style={{ color: t.text }}>
              Match the rig to the hatch.
            </h3>
            <p className="font-['Inter'] text-sm" style={{ color: t.muted }}>
              Open Fly Finder to identify what's on the water, then come back to set up the right rod.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/finder">
              <span
                className="font-['Inter'] text-sm uppercase tracking-widest px-6 py-3 rounded-sm transition-opacity hover:opacity-80 min-h-[44px] flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: t.accent, color: "#fff" }}
              >
                Open Fly Finder <ArrowRight size={13} />
              </span>
            </Link>
            <Link href="/hatch-chart">
              <span
                className="font-['Inter'] text-sm uppercase tracking-widest px-6 py-3 rounded-sm transition-opacity hover:opacity-80 min-h-[44px] flex items-center gap-2 cursor-pointer"
                style={{ border: `1px solid ${t.border}`, color: t.muted }}
              >
                Hatch Calendar
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 sm:px-10 lg:px-16 py-12" style={{ backgroundColor: "#0D1B33", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <img src={logoImg} alt="Flydentify" className="w-auto h-auto block mx-auto" style={{ width: "clamp(120px, 18vw, 240px)", filter: "brightness(0) invert(1)" }} />
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Fly Finder", href: "/finder" },
              { label: "Hatch Calendar", href: "/hatch-chart" },
              { label: "Conditions", href: "/conditions" },
              { label: "Catch Reports", href: "/reports" },
              { label: "Trips", href: "/trips" },
              { label: "Pricing", href: "/pricing" },
            ].map(link => (
              <Link key={link.label} href={link.href}>
                <span className="font-['Inter'] text-sm uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "rgba(245,230,204,0.55)" }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6" style={{ borderTop: `1px solid ${t.border}` }}>
          <p className="font-['Inter'] text-sm text-center" style={{ color: "rgba(245,230,204,0.4)" }}>
            © 2026 Flydentify · Made in Texas · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
