// RiggingDiagram, Interactive tap-to-highlight rigging illustration
// Segments: Reel → Rod → Fly Line → Leader → Tippet+Fly
// Condition-aware copy adapts to the selected river's flow/hatch context

import { useState, useRef } from "react";
import { X, ShoppingBag, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RigConditions = {
  rigType: "dry-fly" | "nymph" | "streamer" | "dry-dropper" | "flats" | "tarpon" | "striper";
  cfs?: number;        // live gauge reading
  clarity?: "clear" | "stained" | "murky";
  hatch?: string;      // e.g. "PMD", "Caddis", "Midge"
  river?: string;
  season?: "spring" | "summer" | "fall" | "winter";
};

export type SegmentId = "reel" | "rod" | "flyline" | "leader" | "tippet";

// ─── Condition-aware copy engine ──────────────────────────────────────────────
function getSegmentCopy(
  seg: SegmentId,
  c: RigConditions,
  isSalt: boolean
): { headline: string; body: string; spec: string; shopLabel?: string; shopUrl?: string } {
  const high = c.cfs && c.cfs > 800;
  const low  = c.cfs && c.cfs < 150;
  const murky = c.clarity === "murky" || c.clarity === "stained";

  const riverNote = c.river ? ` on ${c.river}` : "";
  const hatchNote = c.hatch ? ` during the ${c.hatch} hatch` : "";

  if (seg === "reel") {
    if (isSalt) return {
      headline: "Large-arbor sealed drag",
      body: "Saltwater demands a fully sealed, corrosion-proof drag system with enough backing for long runs. 250-400 yards of 30 lb backing is the floor.",
      spec: c.rigType === "tarpon" ? "Anti-reverse, 400+ yd 30 lb backing" : "Sealed large arbor, 250 yd backing",
      shopLabel: "Abel / Tibor reels",
      shopUrl: "https://www.abelflyreels.com",
    };
    if (high) return {
      headline: "Sealed drag holds under pressure",
      body: `High water${riverNote} puts serious strain on your drag. A large-arbor reel with a sealed disc drag recovers line quickly after a downstream run and protects internals from debris.`,
      spec: "Large arbor, sealed disc drag",
      shopLabel: "Hatch Finatic",
      shopUrl: "https://www.hatchoutdoors.com",
    };
    return {
      headline: "Large-arbor, disc drag",
      body: `For trout${riverNote}, a large-arbor reel recovers line fast and keeps even tension across a smooth disc drag. Weight should balance the rod without fatiguing your wrist over a full day.`,
      spec: c.rigType === "streamer" ? "Large arbor, strong sealed drag" : "Large arbor, disc drag",
      shopLabel: "Orvis Battenkill",
      shopUrl: "https://www.orvis.com",
    };
  }

  if (seg === "rod") {
    if (c.rigType === "streamer") return {
      headline: "Power over finesse",
      body: `A 6-8 weight fast-action rod${riverNote} drives large, wind-resistant streamers and turns fish quickly in heavy current. The stiff tip translates every strip-pause into a killing dart.`,
      spec: "9 ft, 6-8 wt fast action",
      shopLabel: "G. Loomis NRX+",
      shopUrl: "https://www.gloomis.com",
    };
    if (c.rigType === "nymph") return {
      headline: "Extra length for mending",
      body: `A 10-10.5 ft rod${riverNote} gives you the reach to lift and mend line without disturbing the drift${hatchNote}. Medium-fast action telegraphs subtle indicator dips.`,
      spec: "10-10.5 ft, 4-5 wt medium-fast",
      shopLabel: "Sage Foundation",
      shopUrl: "https://www.sageflyfish.com",
    };
    if (c.rigType === "tarpon") return {
      headline: "12-weight artillery",
      body: "Tarpon rods must throw large flies in wind, turn 100-lb fish, and survive the shock of a 200-lb leap. Fast action, fighting butt, and no give in the blank.",
      spec: "9 ft, 11-12 wt fast action",
      shopLabel: "Sage Motive 12-wt",
      shopUrl: "https://www.sageflyfish.com",
    };
    if (isSalt) return {
      headline: "Fast action for distance and wind",
      body: `Saltwater demands distance casts and tight loops in wind. A 7-9 wt fast-action rod${riverNote} punches through gusts and turns fish before they reach structure.`,
      spec: "9 ft, 7-9 wt fast action",
      shopLabel: "Sage Salt HD",
      shopUrl: "https://www.sageflyfish.com",
    };
    return {
      headline: "The right weight matters",
      body: `A 9 ft, 4-5 wt rod is the trout standard${riverNote}. It presents flies delicately on flat water, loads efficiently on short casts, and fights fish fairly without undue stress.`,
      spec: "9 ft, 4-5 wt",
      shopLabel: "Orvis Clearwater",
      shopUrl: "https://www.orvis.com",
    };
  }

  if (seg === "flyline") {
    if (c.rigType === "streamer") return {
      headline: "Sink-tip gets the fly in the zone",
      body: `${murky ? "In stained water, " : ""}A sink-tip or integrated sinking line gets your streamer down to the level where big fish hold${riverNote}. The floating portion lets you pick up and recast without excess spray.`,
      spec: "Sink-tip or integrated sinking",
      shopLabel: "Rio InTouch Streamerdance",
      shopUrl: "https://www.rioproducts.com",
    };
    if (c.rigType === "tarpon") return {
      headline: "12-wt tarpon taper, tropical core",
      body: "Tarpon lines have a stiff tropical core that doesn't go limp in 90° heat. The aggressive front taper turns over the largest flies at distance.",
      spec: "12-wt tarpon taper, tropical",
      shopLabel: "Rio Leviathan",
      shopUrl: "https://www.rioproducts.com",
    };
    if (c.rigType === "striper") return {
      headline: "Intermediate cuts through current",
      body: "An intermediate or clear sink-tip line stays sub-surface on the swing, keeping the fly in the baitfish zone without spooking stripers on shallow flats.",
      spec: "Intermediate or clear sink-tip",
      shopLabel: "Rio Striper line",
      shopUrl: "https://www.rioproducts.com",
    };
    if (isSalt) return {
      headline: "Tropical taper, stiff core",
      body: "Flats lines are stiff by design so they don't coil in heat and make noise on the deck. A tropical taper launches the fly quickly with minimal false casts.",
      spec: "Tropical taper, floating",
      shopLabel: "Cortland Tropic Plus",
      shopUrl: "https://www.cortlandline.com",
    };
    if (high) return {
      headline: "Weight-forward for distance in push",
      body: `High water${riverNote} means longer reaches to find seams. A weight-forward floating line picks up fast and carries the extra leader length needed to cover broken current.`,
      spec: "Weight-forward floating",
      shopLabel: "Rio Gold",
      shopUrl: "https://www.rioproducts.com",
    };
    return {
      headline: "Weight-forward floating",
      body: `The trout workhorse${hatchNote}. A weight-forward taper loads quickly on short casts and delivers dry flies, nymphs, or small streamers without blowing out a feeding lane.`,
      spec: "Weight-forward floating",
      shopLabel: "Scientific Anglers Mastery",
      shopUrl: "https://www.rioproducts.com",
    };
  }

  if (seg === "leader") {
    if (c.rigType === "tarpon") return {
      headline: "60 lb butt, then class tippet",
      body: "IGFA rules require a 12-inch class section. The stiff 60 lb butt drives energy from the fly line, absorbs shock, and doesn't kink on jumps.",
      spec: "60 lb butt + 20-40 lb class tippet",
      shopLabel: "Rio Tarpon leader",
      shopUrl: "https://www.rioproducts.com",
    };
    if (c.rigType === "streamer") return {
      headline: "Short, stiff leader, 4 to 6 ft",
      body: "A short, stiff leader keeps your streamer tracking true on the strip and prevents the line from sagging between pulls. Loop-to-loop connection allows fast swaps.",
      spec: "4-6 ft, 0X-2X stiff mono",
      shopLabel: "Rio Powerflex",
      shopUrl: "https://www.rioproducts.com",
    };
    if (isSalt) return {
      headline: "Hard mono transfers energy",
      body: "Saltwater leaders use hard, stiff mono that kicks the fly over fully on a single haul and resists wind knots. Longer leaders for spooky bonefish, shorter for tarpon.",
      spec: "9-12 ft hard mono",
      shopLabel: "Rio Fluoroflex",
      shopUrl: "https://www.rioproducts.com",
    };
    if (low) return {
      headline: "Go longer in low clear water",
      body: `Low water${riverNote} makes fish nervous. A 12-15 ft leader puts maximum distance between your fly line splash and the fly, reducing refusals on flat tailouts.`,
      spec: "12-15 ft tapered 4X-5X",
      shopLabel: "Orvis knotless leader",
      shopUrl: "https://www.orvis.com",
    };
    if (murky) return {
      headline: "Shorter leader in stained water",
      body: `Stained water${riverNote} reduces visibility, so fish won't see your fly line from as far. A 7-9 ft leader turns over larger nymphs and streamers more cleanly.`,
      spec: "7-9 ft tapered 3X",
      shopLabel: "Rio Powerflex leader",
      shopUrl: "https://www.rioproducts.com",
    };
    return {
      headline: "9 ft tapered leader",
      body: `The 9 ft knotless taper is the standard${hatchNote}. It transfers energy from fly line to fly cleanly and lands without coiling. Size down (4X-5X) for dry flies, up (3X) for nymphs.`,
      spec: "9 ft tapered 4X (dry) / 3X (nymph)",
      shopLabel: "Rio knotless leader",
      shopUrl: "https://www.rioproducts.com",
    };
  }

  // tippet
  if (c.rigType === "tarpon") return {
    headline: "60-80 lb shock or heavy fluoro",
    body: "Tarpon have an abrasive mouth. The shock tippet absorbs the hit and prevents the class section from parting on the strike. Tie with a Non-Slip Mono loop.",
    spec: "60-80 lb fluorocarbon shock",
    shopLabel: "Rio Fluoroflex Plus",
    shopUrl: "https://www.rioproducts.com",
  };
  if (c.rigType === "streamer") return {
    headline: "Heavy fluoro, 0X to 1X",
    body: "Big flies need stiff tippet that won't hinge on the strip. Heavy fluorocarbon also sinks the fly's nose slightly, giving it a more erratic, realistic action.",
    spec: "0X-1X heavy fluorocarbon",
    shopLabel: "Seaguar fluorocarbon",
    shopUrl: "https://www.rioproducts.com",
  };
  if (isSalt) return {
    headline: "Fluorocarbon, invisible in clear water",
    body: "Fluorocarbon's refractive index nearly matches seawater, making it nearly invisible to bonefish and permit. It also resists abrasion on coral and oyster bars.",
    spec: "10-15 lb fluorocarbon",
    shopLabel: "Orvis Mirage fluoro",
    shopUrl: "https://www.orvis.com",
  };
  if (low) return {
    headline: "Drop to 6X in low clear water",
    body: `Low flows${riverNote} make fish ultra-selective. 6X (0.005 in) fluorocarbon is nearly invisible and allows tiny flies to drift without drag from a heavy connection.`,
    spec: "6X fluorocarbon (0.005 in)",
    shopLabel: "Rio Fluoroflex tippet",
    shopUrl: "https://www.rioproducts.com",
  };
  if (high) return {
    headline: "Heavier tippet in dirty water",
    body: `High, off-color water${riverNote} gives you a little more tippet latitude. 3X-4X turns over larger nymphs and streamers and holds up to debris in the drift.`,
    spec: "3X-4X fluorocarbon",
    shopLabel: "Rio Fluoroflex",
    shopUrl: "https://www.rioproducts.com",
  };
  if (c.hatch === "Midge" || c.hatch === "midge") return {
    headline: "7X for midge presentations",
    body: `Midges demand ultra-fine tippet. 7X (0.004 in) lets size 22-26 flies drift without torquing in the current${riverNote}.`,
    spec: "7X fluorocarbon (0.004 in)",
    shopLabel: "Rio Midge tippet",
    shopUrl: "https://www.rioproducts.com",
  };
  return {
    headline: "Tippet is the handshake",
    body: `5X-6X fluorocarbon is the trout standard${hatchNote}. Go lighter for selective risers on flat water. Fluorocarbon sinks, resists abrasion, and is nearly invisible, always worth the premium.`,
    spec: "5X-6X fluorocarbon",
    shopLabel: "Rio Fluoroflex Plus",
    shopUrl: "https://www.rioproducts.com",
  };
}

// ─── Segment definitions ──────────────────────────────────────────────────────
const SEGMENTS: { id: SegmentId; label: string; shortLabel: string }[] = [
  { id: "reel",    label: "Reel",    shortLabel: "Reel" },
  { id: "rod",     label: "Rod",     shortLabel: "Rod" },
  { id: "flyline", label: "Fly line",shortLabel: "Line" },
  { id: "leader",  label: "Leader",  shortLabel: "Leader" },
  { id: "tippet",  label: "Tippet",  shortLabel: "Tippet" },
];

// ─── Color helpers ────────────────────────────────────────────────────────────
function segColor(id: SegmentId, active: boolean, isSalt: boolean) {
  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  const dim    = isSalt ? "rgba(61,107,131,0.35)" : "rgba(167,122,58,0.35)";
  if (active) return accent;
  return dim;
}
function segStroke(id: SegmentId, active: boolean, isSalt: boolean) {
  return active ? (isSalt ? "#3D6B83" : "#A67A3A") : "rgba(255,255,255,0.22)";
}

// ─── Main SVG diagram ─────────────────────────────────────────────────────────
// Horizontal layout: Reel(left) → Rod blank → Fly line → Leader → Tippet → Fly
// Proportions designed for mobile-first (300×180 viewBox)

interface DiagramProps {
  active: SegmentId | null;
  onTap: (id: SegmentId) => void;
  isSalt: boolean;
  rigType: RigConditions["rigType"];
}

function InteractiveRigSVG({ active, onTap, isSalt, rigType }: DiagramProps) {
  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  const dimLine = isSalt ? "rgba(61,107,131,0.28)" : "rgba(167,122,58,0.28)";

  const isActive = (id: SegmentId) => active === id;
  const isStreamer = rigType === "streamer";
  const isNymph    = rigType === "nymph";
  const isTarpon   = rigType === "tarpon";

  // Tap target padding, larger invisible hit areas for mobile
  const HIT = 16;

  return (
    <svg
      viewBox="0 0 360 210"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
      style={{ touchAction: "manipulation", cursor: "pointer" }}
    >
      {/* ─── Background water surface ─── */}
      <path
        d="M0,168 Q90,162 180,168 Q270,174 360,168"
        stroke="rgba(61,107,131,0.18)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0,176 Q90,170 180,176 Q270,182 360,176"
        stroke="rgba(61,107,131,0.10)"
        strokeWidth="1"
        fill="none"
      />

      {/* ─── REEL (realistic large-arbor fly reel) ─── */}
      <g
        onClick={() => onTap("reel")}
        style={{ cursor: "pointer" }}
        data-testid="segment-reel"
      >
        {/* Hit area */}
        <rect x={6} y={52} width={62} height={76} fill="transparent" />
        {/* Outer cage ring */}
        <circle
          cx={34} cy={85} r={26}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={isActive("reel") ? 2.5 : 1.5}
          fill={isActive("reel") ? (isSalt ? "rgba(61,107,131,0.18)" : "rgba(120,65,10,0.25)") : "rgba(0,0,0,0.55)"}
          style={{ transition: "all 0.25s" }}
        />
        {/* Palming rim */}
        <circle
          cx={34} cy={85} r={23}
          stroke={isActive("reel") ? accent : "rgba(255,255,255,0.12)"}
          strokeWidth={1}
          fill="none"
          style={{ transition: "all 0.25s" }}
        />
        {/* Spool arbor */}
        <circle
          cx={34} cy={85} r={12}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={isActive("reel") ? 2 : 1.2}
          fill={isActive("reel") ? (isSalt ? "rgba(61,107,131,0.25)" : "rgba(120,65,10,0.3)") : "rgba(0,0,0,0.4)"}
          style={{ transition: "all 0.25s" }}
        />
        {/* Spokes at 0°, 90°, 180°, 270° */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 34 + Math.cos(rad) * 12;
          const y1 = 85 + Math.sin(rad) * 12;
          const x2 = 34 + Math.cos(rad) * 22;
          const y2 = 85 + Math.sin(rad) * 22;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive("reel") ? accent : "rgba(255,255,255,0.18)"}
              strokeWidth={1.2} strokeLinecap="round"
              style={{ transition: "all 0.25s" }}
            />
          );
        })}
        {/* Center hub */}
        <circle
          cx={34} cy={85} r={5}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={1.5}
          fill={isActive("reel") ? accent : "rgba(255,255,255,0.15)"}
          style={{ transition: "all 0.25s" }}
        />
        {/* Reel foot / mount plate at bottom */}
        <rect x={27} y={109} width={14} height={5} rx={2}
          stroke={isActive("reel") ? accent : "rgba(255,255,255,0.15)"}
          strokeWidth={1} fill="rgba(0,0,0,0.5)"
          style={{ transition: "all 0.25s" }}
        />
        {/* Drag knob on right rim */}
        <circle cx={60} cy={85} r={5}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={1.5} fill="rgba(0,0,0,0.6)"
          style={{ transition: "all 0.25s" }}
        />
        <circle cx={60} cy={85} r={2.5}
          fill={isActive("reel") ? accent : "rgba(255,255,255,0.2)"}
          style={{ transition: "all 0.25s" }}
        />
        {/* Handle arm */}
        <line x1={60} y1={80} x2={64} y2={74}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={1.8} strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />
        <circle cx={65} cy={72} r={3}
          stroke={isActive("reel") ? accent : dimLine}
          strokeWidth={1.2} fill="rgba(0,0,0,0.5)"
          style={{ transition: "all 0.25s" }}
        />
        {/* Label */}
        <text
          x={34} y={122}
          textAnchor="middle"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("reel") ? accent : "rgba(255,255,255,0.35)"}
          style={{ transition: "all 0.25s" }}
        >
          Reel
        </text>
        {isActive("reel") && (
          <circle cx={34} cy={130} r={2.5} fill={accent} />
        )}
      </g>

      {/* ─── ROD (realistic fly rod with cork grip) ─── */}
      <g
        onClick={() => onTap("rod")}
        style={{ cursor: "pointer" }}
        data-testid="segment-rod"
      >
        {/* Hit area */}
        <rect x={56} y={44} width={104} height={58} fill="transparent" />

        {/* Cork grip — warm tan, slightly textured shape */}
        <path
          d="M60,90 Q62,87 68,85 Q76,83 84,82 Q82,87 78,91 Q70,92 63,92 Z"
          fill={isActive("rod") ? "rgba(210,170,100,0.6)" : "rgba(160,120,60,0.4)"}
          stroke={isActive("rod") ? "rgba(210,170,100,0.8)" : "rgba(160,120,60,0.5)"}
          strokeWidth="0.8"
          style={{ transition: "all 0.25s" }}
        />
        {/* Reel seat — cylindrical band below grip */}
        <rect x={60} y={88} width={18} height={5} rx={1.5}
          fill={isActive("rod") ? "rgba(100,80,40,0.7)" : "rgba(60,40,15,0.6)"}
          stroke={isActive("rod") ? accent : "rgba(255,255,255,0.18)"}
          strokeWidth={0.8}
          style={{ transition: "all 0.25s" }}
        />

        {/* Blank — three tapered sections */}
        <line x1={78} y1={84} x2={108} y2={72}
          stroke={isActive("rod") ? accent : dimLine}
          strokeWidth={isActive("rod") ? 4.5 : 3}
          strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />
        <line x1={108} y1={72} x2={138} y2={62}
          stroke={isActive("rod") ? accent : dimLine}
          strokeWidth={isActive("rod") ? 3 : 2.2}
          strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />
        <line x1={138} y1={62} x2={160} y2={56}
          stroke={isActive("rod") ? accent : dimLine}
          strokeWidth={isActive("rod") ? 1.8 : 1.2}
          strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />

        {/* Ferrule at section join */}
        <rect x={106} y={70} width={5} height={4} rx={0.5}
          fill={isActive("rod") ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}
          style={{ transition: "all 0.25s" }}
        />

        {/* Guide rings with feet — 4 guides along blank */}
        {[[90, 77], [114, 68], [140, 60], [155, 57]].map(([gx, gy], i) => (
          <g key={i}>
            {/* guide foot */}
            <line
              x1={gx - 2} y1={gy + 2}
              x2={gx + 2} y2={gy + 2}
              stroke={isActive("rod") ? accent : "rgba(255,255,255,0.25)"}
              strokeWidth={0.8}
              style={{ transition: "all 0.25s" }}
            />
            {/* guide ring */}
            <circle
              cx={gx} cy={gy}
              r={3.5 - i * 0.6}
              stroke={isActive("rod") ? accent : "rgba(255,255,255,0.35)"}
              strokeWidth={1.2}
              fill="none"
              style={{ transition: "all 0.25s" }}
            />
          </g>
        ))}

        {/* Tip-top guide at very end */}
        <circle cx={159} cy={56} r={1.5}
          stroke={isActive("rod") ? accent : "rgba(255,255,255,0.3)"}
          strokeWidth={1} fill="none"
          style={{ transition: "all 0.25s" }}
        />

        {/* Label */}
        <text
          x={112} y={100}
          textAnchor="middle"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("rod") ? accent : "rgba(255,255,255,0.35)"}
          style={{ transition: "all 0.25s" }}
        >
          Rod
        </text>
        {isActive("rod") && (
          <circle cx={112} cy={108} r={2.5} fill={accent} />
        )}
      </g>

      {/* ─── FLY LINE ─── */}
      <g
        onClick={() => onTap("flyline")}
        style={{ cursor: "pointer" }}
        data-testid="segment-flyline"
      >
        {/* Hit area */}
        <rect x={152} y={42} width={64} height={26} fill="transparent" />
        {/* Fly line, thick, slightly curved */}
        {isStreamer ? (
          // Sink-tip: dark brown/teal with dashes for sink portion
          <>
            <line
              x1={158} y1={56} x2={195} y2={50}
              stroke={isActive("flyline") ? (isSalt ? "#3D6B83" : "#A67A3A") : (isSalt ? "rgba(61,107,131,0.35)" : "rgba(100,50,10,0.5)")}
              strokeWidth={isActive("flyline") ? 4 : 3}
              strokeLinecap="round"
              style={{ transition: "all 0.25s" }}
            />
            <line
              x1={195} y1={50} x2={218} y2={48}
              stroke={isActive("flyline") ? (isSalt ? "#3D6B83" : "#A67A3A") : (isSalt ? "rgba(61,107,131,0.35)" : "rgba(100,50,10,0.5)")}
              strokeWidth={isActive("flyline") ? 3.5 : 2.5}
              strokeLinecap="round"
              strokeDasharray="6,3"
              style={{ transition: "all 0.25s" }}
            />
          </>
        ) : (
          <path
            d={`M158,56 Q180,48 218,48`}
            stroke={isActive("flyline") ? accent : dimLine}
            strokeWidth={isActive("flyline") ? 4 : 2.8}
            fill="none"
            strokeLinecap="round"
            style={{ transition: "all 0.25s" }}
          />
        )}
        {/* Label */}
        <text
          x={188} y={40}
          textAnchor="middle"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("flyline") ? accent : "rgba(255,255,255,0.35)"}
          style={{ transition: "all 0.25s" }}
        >
          Fly line
        </text>
        {isActive("flyline") && (
          <circle cx={188} cy={44} r={2.5} fill={accent} />
        )}
      </g>

      {/* ─── LEADER ─── */}
      <g
        onClick={() => onTap("leader")}
        style={{ cursor: "pointer" }}
        data-testid="segment-leader"
      >
        {/* Hit area */}
        <rect x={214} y={44} width={50} height={42} fill="transparent" />
        {/* Leader, thinner, dashed */}
        <line
          x1={218} y1={48} x2={250} y2={62}
          stroke={isActive("leader") ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)"}
          strokeWidth={isActive("leader") ? 2 : 1.5}
          strokeDasharray="5,3"
          strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />
        {/* Loop knot indicator for streamers */}
        {(isStreamer || rigType === "striper") && (
          <circle
            cx={250} cy={62} r={4}
            stroke={isActive("leader") ? accent : dimLine}
            strokeWidth={isActive("leader") ? 1.8 : 1.2}
            fill="none"
            style={{ transition: "all 0.25s" }}
          />
        )}
        {/* Nymph indicator float */}
        {isNymph && (
          <circle
            cx={242} cy={56} r={6}
            fill={isActive("leader") ? (isSalt ? "rgba(61,107,131,0.8)" : "rgba(167,122,58,0.85)") : (isSalt ? "rgba(61,107,131,0.3)" : "rgba(167,122,58,0.3)")}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            style={{ transition: "all 0.25s" }}
          />
        )}
        {/* Label */}
        <text
          x={248} y={42}
          textAnchor="middle"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("leader") ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)"}
          style={{ transition: "all 0.25s" }}
        >
          Leader
        </text>
        {isActive("leader") && (
          <circle cx={248} cy={46} r={2.5} fill="rgba(255,255,255,0.8)" />
        )}
      </g>

      {/* ─── TIPPET + FLY ─── */}
      <g
        onClick={() => onTap("tippet")}
        style={{ cursor: "pointer" }}
        data-testid="segment-tippet"
      >
        {/* Hit area */}
        <rect x={246} y={58} width={80} height={96} fill="transparent" />
        {/* Tippet, very fine line */}
        <line
          x1={252} y1={66}
          x2={isNymph ? 262 : 268}
          y2={isNymph ? 120 : 90}
          stroke={isActive("tippet") ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)"}
          strokeWidth={isActive("tippet") ? 1.5 : 1}
          strokeLinecap="round"
          style={{ transition: "all 0.25s" }}
        />

        {/* Nymph: split shot + sub-surface fly */}
        {isNymph && (
          <>
            <circle cx={263} cy={108} r={4}
              fill="rgba(180,180,180,0.6)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            {/* Nymph terminus dot */}
            <circle cx={262} cy={120} r={8}
              stroke={isActive("tippet") ? `${accent}55` : "rgba(255,255,255,0.12)"}
              strokeWidth="1" fill="none"
              style={{ transition: "all 0.25s" }}
            />
            <circle cx={262} cy={120} r={4}
              fill={isActive("tippet") ? accent : "rgba(255,255,255,0.45)"}
              style={{ transition: "all 0.25s" }}
            />
          </>
        )}

        {/* Terminus dot — clean end-of-tippet marker */}
        {!isNymph && (
          <g>
            <circle cx={268} cy={90} r={8}
              stroke={isActive("tippet") ? `${accent}55` : "rgba(255,255,255,0.12)"}
              strokeWidth="1" fill="none"
              style={{ transition: "all 0.25s" }}
            />
            <circle cx={268} cy={90} r={4}
              fill={isActive("tippet") ? accent : "rgba(255,255,255,0.45)"}
              style={{ transition: "all 0.25s" }}
            />
          </g>
        )}

        {/* Tippet label */}
        <text
          x={330} y={68}
          textAnchor="end"
          dy="-8"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("tippet") ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)"}
          style={{ transition: "all 0.25s" }}
        >
          Tippet
        </text>
        {isActive("tippet") && (
          <circle cx={296} cy={72} r={2.5} fill="rgba(255,255,255,0.8)" />
        )}
        {/* Fly label */}
        <text
          x={295} y={isNymph ? 138 : 103}
          textAnchor="start"
          dy="6"
          fontSize="8"
          fontFamily="Lora, serif"
          fontStyle="italic"
          fill={isActive("tippet") ? accent : dimLine}
          style={{ transition: "all 0.25s" }}
        >
          Fly
        </text>
      </g>

      {/* ─── Connection knots (visual dots where segments join) ─── */}
      {/* Rod tip → fly line */}
      <circle cx={158} cy={56} r={3}
        fill={active === "rod" || active === "flyline" ? accent : "rgba(255,255,255,0.2)"}
        style={{ transition: "all 0.25s", pointerEvents: "none" }}
      />
      {/* Fly line → leader loop */}
      <circle cx={218} cy={48} r={2.5}
        fill={active === "flyline" || active === "leader" ? accent : "rgba(255,255,255,0.15)"}
        style={{ transition: "all 0.25s", pointerEvents: "none" }}
      />
      {/* Leader → tippet */}
      <circle cx={252} cy={66} r={2}
        fill={active === "leader" || active === "tippet" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.12)"}
        style={{ transition: "all 0.25s", pointerEvents: "none" }}
      />
    </svg>
  );
}

// ─── Segment pill row ─────────────────────────────────────────────────────────
function SegmentPills({ active, onTap, isSalt }: {
  active: SegmentId | null;
  onTap: (id: SegmentId) => void;
  isSalt: boolean;
}) {
  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {SEGMENTS.map(seg => {
        const isAct = active === seg.id;
        return (
          <button
            key={seg.id}
            onClick={() => onTap(seg.id)}
            data-testid={`pill-${seg.id}`}
            className="font-['Inter'] text-[10px] uppercase tracking-widest px-3 py-2.5 rounded-sm transition-all duration-200 min-h-[44px]"
            style={isAct
              ? { backgroundColor: accent, color: "#fff", boxShadow: `0 0 12px ${accent}55` }
              : { border: `1px solid rgba(255,255,255,0.15)`, color: "rgba(245,230,204,0.5)", backgroundColor: "rgba(0,0,0,0.3)" }
            }
          >
            {seg.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────
function InfoPanel({ seg, conditions, isSalt }: {
  seg: SegmentId;
  conditions: RigConditions;
  isSalt: boolean;
}) {
  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  const copy = getSegmentCopy(seg, conditions, isSalt);
  const segLabel = SEGMENTS.find(s => s.id === seg)?.label || "";

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        border: `1px solid ${accent}55`,
        backgroundColor: isSalt ? "rgba(61,107,131,0.10)" : "rgba(120,65,10,0.15)",
        animation: "fadeSlideUp 0.22s ease both",
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header row */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${accent}33`, backgroundColor: isSalt ? "rgba(61,107,131,0.12)" : "rgba(120,65,10,0.2)" }}
      >
        <span
          className="font-['Inter'] text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 rounded-sm"
          style={{ backgroundColor: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
        >
          {segLabel}
        </span>
        <p className="font-['Cormorant_Garamond'] text-base leading-tight" style={{ color: "#f5e6cc" }}>
          {copy.headline}
        </p>
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="font-['Inter'] text-xs leading-relaxed" style={{ color: "rgba(214,197,176,0.8)" }}>
          {copy.body}
        </p>
        <div
          className="mt-3 flex items-center justify-between gap-3 flex-wrap"
        >
          <span
            className="font-['Inter'] text-[10px] italic px-2.5 py-1 rounded-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${accent}33`, color: accent }}
          >
            {copy.spec}
          </span>
          {copy.shopLabel && copy.shopUrl && (
            <a
              href={copy.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-['Inter'] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ color: accent }}
            >
              <ShoppingBag size={10} />
              {copy.shopLabel}
              <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
interface RiggingDiagramProps {
  conditions: RigConditions;
  isSalt: boolean;
  /** optional river name shown in header */
  riverName?: string;
}

export default function RiggingDiagram({ conditions, isSalt, riverName }: RiggingDiagramProps) {
  const [active, setActive] = useState<SegmentId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  const bg     = isSalt ? "#060f1a" : "#071e25";
  const border = isSalt ? "rgba(61,107,131,0.22)" : "rgba(167,122,58,0.2)";

  const handleTap = (id: SegmentId) => {
    setActive(prev => (prev === id ? null : id));
    // Scroll panel into view on mobile
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  };

  const conditionBadges: { label: string; value: string }[] = [];
  if (conditions.cfs !== undefined) {
    conditionBadges.push({
      label: "Flow",
      value: `${conditions.cfs.toLocaleString()} CFS ${conditions.cfs > 800 ? "(high)" : conditions.cfs < 150 ? "(low)" : "(normal)"}`,
    });
  }
  if (conditions.clarity) {
    conditionBadges.push({ label: "Clarity", value: conditions.clarity });
  }
  if (conditions.hatch) {
    conditionBadges.push({ label: "Hatch", value: conditions.hatch });
  }

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ border: `1px solid ${border}`, backgroundColor: bg }}
      data-testid="rigging-diagram"
    >
      {/* ── Header ── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: `1px solid ${border}`, backgroundColor: isSalt ? "rgba(61,107,131,0.12)" : "rgba(120,65,10,0.18)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-['Inter'] text-[9px] uppercase tracking-[0.28em]" style={{ color: accent }}>
            Interactive rig
          </p>
          {riverName && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>|</span>
              <p className="font-['Inter'] text-[10px]" style={{ color: "rgba(245,230,204,0.6)" }}>
                {riverName}
              </p>
            </>
          )}
          {conditionBadges.map(b => (
            <span
              key={b.label}
              className="font-['Inter'] text-[9px] px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: `${accent}18`, color: accent, border: `1px solid ${accent}33` }}
            >
              {b.label}: {b.value}
            </span>
          ))}
        </div>
        <p className="font-['Inter'] text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(245,230,204,0.35)" }}>
          Tap any segment
        </p>
      </div>

      {/* ── SVG Diagram ── */}
      <div
        className="px-4 pt-5 pb-3"
        style={{ backgroundColor: isSalt ? "#030a12" : "#050f12" }}
      >
        <InteractiveRigSVG
          active={active}
          onTap={handleTap}
          isSalt={isSalt}
          rigType={conditions.rigType}
        />
      </div>

      {/* ── Segment pills ── */}
      <div className="px-4 pb-4" style={{ backgroundColor: isSalt ? "#030a12" : "#050f12" }}>
        <SegmentPills active={active} onTap={handleTap} isSalt={isSalt} />
      </div>

      {/* ── Info panel ── */}
      <div ref={panelRef} className="px-4 pb-5">
        {active ? (
          <InfoPanel seg={active} conditions={conditions} isSalt={isSalt} />
        ) : (
          <div
            className="rounded-sm px-5 py-4 text-center"
            style={{ border: `1px solid ${border}`, backgroundColor: "rgba(0,0,0,0.2)" }}
          >
            <p className="font-['Inter'] text-xs italic" style={{ color: "rgba(245,230,204,0.4)" }}>
              Tap a segment above to see why it matters for{" "}
              {riverName ? riverName : "these conditions"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
