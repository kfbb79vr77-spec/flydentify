// SVG step-by-step knot diagrams — Flydentify
// Style: original session design — abstract geometry, color-coded lines,
// labeled callouts with dashed leaders, wrap ellipses, grip indicators.
// One change from original: legend reads "Short end (tag)" instead of "tag end".
import React from "react";

export interface KnotFrame {
  label: string;
  svg: React.ReactNode;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const STANDING      = "#F7F1E2";   // cream — matches brand FW canvas
const TAG_COLOR     = "#A67A3A";   // brand amber
const DIM           = "rgba(247,241,226,0.28)";
const GRIP_COLOR    = "rgba(247,241,226,0.70)";
const LABEL_TAG     = "#A67A3A";   // brand amber
const LABEL_STANDING = "rgba(247,241,226,0.85)";
const LABEL_NEUTRAL  = "rgba(247,241,226,0.6)";

// Shared font — Lora matches the carousel chrome
const SERIF = "Lora, Georgia, serif";

// ── Legend — occupies y=3..19, diagram content starts at y=22 ────────────────
// viewBox is 220×170 — 10px taller than before to give the legend room.
function Legend() {
  return (
    <g>
      <rect x="6" y="3" width="228" height="15" rx="3"
        fill="rgba(255,255,255,0.07)" />

      {/* Main line swatch */}
      <line x1="13" y1="10.5" x2="24" y2="10.5"
        stroke={STANDING} strokeWidth="2" strokeLinecap="round" />
      <text x="27" y="14" fill={LABEL_STANDING} fontSize="7.5"
        style={{ fontFamily: SERIF }}>
        Main line
      </text>

      {/* Short end (tag) swatch */}
      <line x1="74" y1="10.5" x2="85" y2="10.5"
        stroke={TAG_COLOR} strokeWidth="2" strokeLinecap="round" />
      <text x="88" y="14" fill={LABEL_TAG} fontSize="7.5"
        style={{ fontFamily: SERIF }}>
        Short end (tag)
      </text>

      {/* Hold here swatch */}
      <circle cx="154" cy="10.5" r="3.5"
        fill="none" stroke={GRIP_COLOR} strokeWidth="1.5" />
      <text x="160" y="14" fill={GRIP_COLOR} fontSize="7.5"
        style={{ fontFamily: SERIF }}>
        Hold here
      </text>
    </g>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

// FlyIcon — clean branded fly from the Flydentify logo.
// Eyelet ring with tippet line through it + proportional wing arcs. No hackle burst, no hook anatomy.
// Callers use scale=1.0. Total visual size in the 220×170 viewBox: ~20px wide, ~10px tall.
function FlyIcon({ x, y, scale = 1.0 }: { x: number; y: number; scale?: number }) {
  // All geometry is in SVG viewBox units (220×170).
  // At scale=1.0: eyelet r=3, body 7 units, wings 8 units tall — clean and compact.
  const r = 3 * scale;
  const sw = 1.8 * scale;  // main stroke weight
  const bw = 1.4 * scale;  // wing stroke weight
  return (
    <g
      transform={`translate(${x},${y})`}
      stroke="#F7F1E2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {/* Eyelet ring */}
      <circle cx={0} cy={0} r={r} strokeWidth={sw} />
      {/* Body stub: eyelet to wing base */}
      <line x1={r} y1={0} x2={r + 7 * scale} y2={0} strokeWidth={sw} />
      {/* Primary wing — compact arc sweeping up then back down */}
      <path
        d={`M${(r+2)*scale},0 Q${(r+6)*scale},${-8*scale} ${(r+14)*scale},${-4*scale} Q${(r+17)*scale},${-1*scale} ${(r+14)*scale},0`}
        strokeWidth={bw}
      />
      {/* Secondary wing — slightly outside primary, lighter */}
      <path
        d={`M${(r+5)*scale},0 Q${(r+9)*scale},${-7*scale} ${(r+16)*scale},${-3*scale} Q${(r+18)*scale},0 ${(r+16)*scale},0`}
        strokeWidth={bw * 0.75}
        opacity={0.6}
      />
      {/* Tail — single short upswept line */}
      <line
        x1={(r+14)*scale} y1={0}
        x2={(r+18)*scale} y2={-3*scale}
        strokeWidth={bw * 0.75}
      />
    </g>
  );
}

// Arrow — filled polygon arrowhead
function Arrow({ x, y, dir = "right", color = TAG_COLOR }:
  { x: number; y: number; dir?: "right"|"left"|"up"|"down"; color?: string }) {
  const rotate = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <polygon points="0,-5.5 12,0 0,5.5" fill={color} />
    </g>
  );
}

// GripMark — dashed circle with label beneath
function GripMark({ x, y, label = "Hold here", anchor = "middle" }:
  { x: number; y: number; label?: string; anchor?: "start"|"middle"|"end" }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7"
        fill="rgba(255,255,255,0.08)"
        stroke={GRIP_COLOR} strokeWidth="1.8"
        strokeDasharray="3,2" />
      <text x={x} y={y + 18} fill={GRIP_COLOR} fontSize="7.5"
        textAnchor={anchor}
        style={{ fontFamily: SERIF }}>
        {label}
      </text>
    </g>
  );
}

// PartLabel — italic annotation with optional dashed leader line
function PartLabel({ x, y, text, anchor = "middle", color = LABEL_NEUTRAL, leaderTo }:
  { x: number; y: number; text: string; anchor?: "start"|"middle"|"end";
    color?: string; leaderTo?: [number, number] }) {
  return (
    <>
      {leaderTo && (
        <line x1={x} y1={y + 2} x2={leaderTo[0]} y2={leaderTo[1]}
          stroke={color} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.6" />
      )}
      <text x={x} y={y} fill={color} fontSize="8" textAnchor={anchor}
        style={{ fontFamily: SERIF, fontStyle: "italic" }}>
        {text}
      </text>
    </>
  );
}

// Wraps — evenly-spaced coil ellipses representing thread wraps
function Wraps({ cx, count, y = 90, color = TAG_COLOR }:
  { cx: number; count: number; y?: number; color?: string }) {
  const spacing = 11;
  const start = cx - ((count - 1) * spacing) / 2;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ellipse key={i} cx={start + i * spacing} cy={y}
          rx="4.5" ry="10" stroke={color} strokeWidth="2" fill="none" />
      ))}
    </>
  );
}

// WrapBadge — small amber pill showing wrap count
function WrapBadge({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <>
      <rect x={x - 20} y={y - 10} width="40" height="13" rx="3"
        fill="rgba(166,122,58,0.22)" stroke={TAG_COLOR} strokeWidth="1" />
      <text x={x} y={y} fill={TAG_COLOR} fontSize="8" textAnchor="middle"
        style={{ fontFamily: SERIF, fontStyle: "italic" }}>
        {text}
      </text>
    </>
  );
}

// ── IMPROVED CLINCH (FlyIcon test) ─────────────────────────────────────────────
const improvedClinchFrames: KnotFrame[] = [
  {
    label: "Push 6 inches of tippet through the hook eye",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="143" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M143,88 Q155,48 155,44"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="155" y1="44" x2="204" y2="44"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={192} y={44} dir="right" />
        <GripMark x={155} y={88} label="Hold hook" />
        <PartLabel x={60} y={80} text="main line" color={LABEL_STANDING} />
        <PartLabel x={182} y={36} text="short end" color={LABEL_TAG} />
      </>
    ),
  },
  {
    label: "Wrap the short end around the main line 5 to 7 times",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="143" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M143,88 Q155,48 155,44"
          stroke={DIM} strokeWidth="1.5" fill="none" />
        <Wraps cx={92} count={5} y={88} color={TAG_COLOR} />
        <line x1="58" y1="98" x2="42" y2="123"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={45} y={118} dir="down" />
        <WrapBadge x={92} y={68} text="5 to 7 wraps" />
        <GripMark x={143} y={88} label="Hold here" anchor="middle" />
        <PartLabel x={42} y={136} text="short end" color={LABEL_TAG} />
      </>
    ),
  },
  {
    label: "Tuck the short end back through the small loop by the hook eye",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="143" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={92} count={5} y={88} color={DIM} />
        <path d="M143,88 Q152,66 145,60 Q137,52 129,60"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" />
        <path d="M50,120 Q92,108 127,64"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={129} y={68} dir="up" />
        <GripMark x={92} y={88} label="Pinch wraps" />
        <PartLabel x={118} y={48} text="small loop" color={LABEL_TAG}
          anchor="middle" leaderTo={[133, 58]} />
      </>
    ),
  },
  {
    label: "Wet it, pass through the big loop, then pull both ends tight. Trim the short end.",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="143" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="108" cy="88" rx="22" ry="12"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <path d="M60,76 Q88,58 130,72 Q143,80 143,88"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" />
        <Arrow x={18} y={88} dir="left" color={STANDING} />
        <Arrow x={190} y={88} dir="right" color={STANDING} />
        <PartLabel x={108} y={116} text="pull both ends tight" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── PALOMAR ───────────────────────────────────────────────────────────────────
const palomarFrames: KnotFrame[] = [
  {
    label: "Fold 6 inches of tippet in half and push the folded loop through the hook eye",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={89} scale={1.0} />
        <line x1="12" y1="84" x2="143" y2="84"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="94" x2="143" y2="94"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M143,84 Q153,48 155,46"
          stroke={STANDING} strokeWidth="2" fill="none" />
        <path d="M143,94 Q153,48 155,46"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" />
        <Arrow x={150} y={58} dir="up" color={LABEL_NEUTRAL} />
        <GripMark x={90} y={89} label="Hold doubled line" />
        <PartLabel x={155} y={132} text="hook eye" color={LABEL_NEUTRAL}
          anchor="middle" leaderTo={[155, 120]} />
      </>
    ),
  },
  {
    label: "Tie a loose overhand knot in the doubled line, leaving the hook dangling",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={90} scale={1.0} />
        <path d="M12,88 Q46,58 72,72 Q90,82 72,96 Q54,112 82,120 L143,88"
          stroke={STANDING} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M12,92 Q46,62 72,76 Q90,86 72,100 Q54,116 82,124 L143,92"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" strokeDasharray="5,3" />
        <GripMark x={72} y={84} label="Hold loop open" />
        <PartLabel x={108} y={138} text="loose overhand, don't tighten" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Push the hook through the large loop. Pull it all the way through",
    svg: (
      <><Legend />
        <ellipse cx="95" cy="86" rx="52" ry="30"
          stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" fill="none" />
        <FlyIcon x={148} y={88} scale={1.0} />
        <Arrow x={148} y={82} dir="up" color={TAG_COLOR} />
        <GripMark x={95} y={64} label="Hold knot" anchor="middle" />
        <PartLabel x={95} y={50} text="large loop" color={LABEL_STANDING} anchor="middle" />
        <PartLabel x={148} y={140} text="hook passes up through loop" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wet it and pull both ends tight. Trim close. Strongest fly knot.",
    svg: (
      <><Legend />
        <FlyIcon x={143} y={88} scale={1.0} />
        <rect x="104" y="82" width="32" height="18" rx="9"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <line x1="12" y1="88" x2="104" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="136" y1="92" x2="143" y2="92"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={20} y={88} dir="left" color={STANDING} />
        <Arrow x={190} y={92} dir="right" color={STANDING} />
        <PartLabel x={110} y={120} text="pull both ends, 98% strength" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── DAVY KNOT ─────────────────────────────────────────────────────────────────
const davyFrames: KnotFrame[] = [
  {
    label: "Run the tippet through the hook eye, leaving a 4-inch short end",
    svg: (
      <><Legend />
        <FlyIcon x={140} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="140" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M140,88 Q152,48 152,44"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="152" y1="44" x2="202" y2="44"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={190} y={44} dir="right" />
        <GripMark x={152} y={88} label="Hold hook" />
        <PartLabel x={60} y={80} text="main line" color={LABEL_STANDING} />
        <PartLabel x={180} y={36} text="4-inch short end" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Form a small loop with the short end and pass the short end through it once",
    svg: (
      <><Legend />
        <FlyIcon x={140} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="140" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M140,88 Q150,66 142,58 Q134,50 126,58 Q118,68 128,80 Q134,86 140,88"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M140,88 Q144,100 142,116"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={141} y={110} dir="down" />
        <GripMark x={126} y={64} label="Hold loop" anchor="middle" />
        <PartLabel x={140} y={130} text="short end passes through once" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Bring the short end over the main line and tuck it back through the same loop again",
    svg: (
      <><Legend />
        <FlyIcon x={140} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="140" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M140,88 Q148,70 140,62 Q130,52 122,60"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" />
        <path d="M122,60 Q113,70 122,82 Q130,88 140,88"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" />
        <path d="M140,88 Q146,100 140,110"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" />
        <Arrow x={139} y={104} dir="down" />
        <GripMark x={132} y={74} label="Pinch crossing" anchor="middle" />
        <PartLabel x={108} y={126} text="tuck through loop a second time" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wet it and pull tight. Fastest fly knot, perfect during a hatch.",
    svg: (
      <><Legend />
        <FlyIcon x={132} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="132" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="138" cy="88" r="8"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <Arrow x={20} y={88} dir="left" color={STANDING} />
        <Arrow x={188} y={88} dir="right" color={STANDING} />
        <PartLabel x={110} y={118} text="wet then pull tight" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── SURGEON'S KNOT ────────────────────────────────────────────────────────────
const surgeonsFrames: KnotFrame[] = [
  {
    label: "Lay the two lines side by side, overlapping by 6 to 8 inches",
    svg: (
      <><Legend />
        <line x1="12" y1="80" x2="170" y2="80"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="98" x2="210" y2="98"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="75" x2="60" y2="103"
          stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <line x1="170" y1="75" x2="170" y2="85"
          stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <PartLabel x={30} y={72} text="leader" color={LABEL_STANDING} />
        <PartLabel x={194} y={114} text="tippet" color={LABEL_TAG} />
        <PartLabel x={115} y={66} text="overlap 6 to 8 inches" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Pick up both lines together and form one large loop",
    svg: (
      <><Legend />
        <line x1="12" y1="82" x2="72" y2="82"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="72" y1="96" x2="12" y2="96"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M72,82 Q130,46 150,72 Q165,92 150,112 Q130,132 72,96"
          stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" />
        <GripMark x={40} y={89} label="Hold both lines" anchor="middle" />
        <PartLabel x={158} y={68} text="large loop" color={LABEL_STANDING} anchor="start" />
      </>
    ),
  },
  {
    label: "Pass both short ends through that loop, then do it a second time before pulling",
    svg: (
      <><Legend />
        <line x1="12" y1="82" x2="72" y2="82"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="96" x2="72" y2="96"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M72,82 Q115,52 136,70 Q150,84 136,100 Q115,120 72,96"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" fill="none" />
        <rect x="148" y="76" width="26" height="16" rx="3"
          fill="rgba(166,122,58,0.22)" stroke={TAG_COLOR} strokeWidth="1" />
        <text x="161" y="88" fill={TAG_COLOR} fontSize="10"
          textAnchor="middle" fontWeight="bold">× 2</text>
        <Arrow x={70} y={82} dir="right" color={STANDING} />
        <Arrow x={70} y={96} dir="right" color={TAG_COLOR} />
        <GripMark x={120} y={68} label="Hold loop open" anchor="middle" />
      </>
    ),
  },
  {
    label: "Wet it, then pull all four strands at once, two on each side, at the same time",
    svg: (
      <><Legend />
        <rect x="88" y="78" width="44" height="22" rx="11"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <line x1="88" y1="82" x2="30" y2="72"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="88" y1="96" x2="30" y2="106"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="82" x2="192" y2="72"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="96" x2="192" y2="106"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={36} y={74} dir="left" color={STANDING} />
        <Arrow x={36} y={104} dir="left" color={TAG_COLOR} />
        <Arrow x={184} y={74} dir="right" color={STANDING} />
        <Arrow x={184} y={104} dir="right" color={TAG_COLOR} />
        <PartLabel x={110} y={124} text="pull all 4 strands simultaneously" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── DROPPER LOOP ──────────────────────────────────────────────────────────────
const dropperLoopFrames: KnotFrame[] = [
  {
    label: "Pinch a loop in the middle of the line, not at the end",
    svg: (
      <><Legend />
        <line x1="12" y1="86" x2="80" y2="86"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="140" y1="86" x2="210" y2="86"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M80,86 Q88,120 110,120 Q132,120 140,86"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <GripMark x={110} y={120} label="Pinch loop tip" anchor="middle" />
        <PartLabel x={40} y={78} text="main line" color={LABEL_STANDING} />
      </>
    ),
  },
  {
    label: "Wrap one side of that loop around itself 5 to 6 times in the same direction",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="82" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="138" y1="88" x2="210" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={110} count={5} y={88} color={TAG_COLOR} />
        <WrapBadge x={110} y={66} text="5 to 6 wraps" />
        <GripMark x={50} y={88} label="Hold taut" anchor="middle" />
        <GripMark x={170} y={88} label="Hold taut" anchor="middle" />
      </>
    ),
  },
  {
    label: "Push the original loop up through the center of the wraps you just made",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="86" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="134" y1="88" x2="210" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={110} count={5} y={88} color={DIM} />
        <path d="M110,98 Q110,70 110,50"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M110,50 Q100,38 94,50 Q90,62 100,74 Q106,82 110,88"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={108} y={46} dir="up" />
        <GripMark x={110} y={88} label="Pinch wraps" anchor="middle" />
        <PartLabel x={110} y={38} text="push loop through" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Pull both ends of the main line. The loop stands straight out, ready for a dropper fly.",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="86" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="134" y1="88" x2="210" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="86" y="80" width="48" height="16" rx="8"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <path d="M110,80 Q110,56 110,42"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" />
        <path d="M110,42 Q100,30 94,42 Q90,54 100,66 Q106,74 110,80"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" />
        <Arrow x={20} y={88} dir="left" color={STANDING} />
        <Arrow x={202} y={88} dir="right" color={STANDING} />
        <PartLabel x={130} y={38} text="dropper loop" color={LABEL_TAG} anchor="start"
          leaderTo={[112, 42]} />
        <PartLabel x={110} y={130} text="attach dropper fly here" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── BLOOD KNOT ────────────────────────────────────────────────────────────────
const bloodKnotFrames: KnotFrame[] = [
  {
    label: "Hold both lines parallel, overlapping about 6 inches in the middle",
    svg: (
      <><Legend />
        <line x1="12" y1="78" x2="165" y2="78"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="98" x2="210" y2="98"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="73" x2="60" y2="103"
          stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <line x1="165" y1="73" x2="165" y2="83"
          stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <PartLabel x={30} y={70} text="line A" color={LABEL_STANDING} />
        <PartLabel x={192} y={114} text="line B" color={LABEL_TAG} />
        <PartLabel x={112} y={66} text="overlap ~6 inches" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wrap the first short end around the other line 5 times, moving away from center",
    svg: (
      <><Legend />
        <line x1="12" y1="84" x2="100" y2="84"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="125" y1="96" x2="210" y2="96"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={92} count={5} y={90} color={TAG_COLOR} />
        <WrapBadge x={92} y={68} text="5 wraps" />
        <GripMark x={170} y={96} label="Hold line B taut" anchor="middle" />
        <PartLabel x={50} y={76} text="line A wraps" color={LABEL_STANDING} anchor="middle" />
      </>
    ),
  },
  {
    label: "Do the same on the other side: 5 wraps in the opposite direction",
    svg: (
      <><Legend />
        <line x1="12" y1="84" x2="88" y2="84"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="96" x2="210" y2="96"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={88} count={3} y={90} color={DIM} />
        <Wraps cx={122} count={3} y={90} color={TAG_COLOR} />
        <line x1="110" y1="78" x2="110" y2="64"
          stroke={TAG_COLOR} strokeWidth="1.8" strokeDasharray="4,3" />
        <line x1="110" y1="102" x2="110" y2="116"
          stroke={STANDING} strokeWidth="1.8" strokeDasharray="4,3" />
        <GripMark x={110} y={90} label="Pinch center" anchor="middle" />
        <PartLabel x={110} y={58} text="tags meet at center gap" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wet it well, then pull both main lines in opposite directions until it snugs up",
    svg: (
      <><Legend />
        <rect x="88" y="80" width="44" height="20" rx="10"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <line x1="12" y1="84" x2="88" y2="84"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="96" x2="210" y2="96"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={20} y={84} dir="left" color={STANDING} />
        <Arrow x={202} y={96} dir="right" color={TAG_COLOR} />
        <PartLabel x={110} y={70} text="trim both short ends" color={LABEL_NEUTRAL} anchor="middle" />
        <PartLabel x={110} y={122} text="pull steadily, knot blooms tight" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── NON-SLIP MONO LOOP ────────────────────────────────────────────────────────
const nonSlipMonoFrames: KnotFrame[] = [
  {
    label: "Tie a loose overhand knot 4 inches from the end, but do not pull it closed",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="78" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M78,88 Q98,62 114,72 Q128,82 114,96 Q100,110 114,118"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="114" y1="118" x2="200" y2="88"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <PartLabel x={42} y={80} text="main line" color={LABEL_STANDING} anchor="middle" />
        <PartLabel x={170} y={80} text="short end" color={LABEL_TAG} anchor="middle" />
        <GripMark x={96} y={88} label="Hold loop open" anchor="middle" />
        <PartLabel x={96} y={134} text="loose overhand, don't close it" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Thread the short end through the hook eye, going away from you",
    svg: (
      <><Legend />
        <FlyIcon x={160} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="78" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M78,88 Q98,62 114,72 Q128,82 114,96 Q100,110 114,118"
          stroke={DIM} strokeWidth="1.5" fill="none" />
        <line x1="114" y1="118" x2="160" y2="88"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M160,88 Q172,48 172,44"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" />
        <Arrow x={168} y={66} dir="up" />
        <GripMark x={96} y={88} label="Hold knot open" anchor="middle" />
        <PartLabel x={172} y={130} text="hook eye" color={LABEL_NEUTRAL}
          anchor="middle" leaderTo={[172, 116]} />
      </>
    ),
  },
  {
    label: "Wrap the short end 4 to 6 times around the main line, then pass back through the open loop",
    svg: (
      <><Legend />
        <FlyIcon x={160} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="78" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M78,88 Q98,62 114,72 Q128,82 114,96 Q100,110 114,118"
          stroke={DIM} strokeWidth="1.5" fill="none" />
        <Wraps cx={148} count={4} y={88} color={TAG_COLOR} />
        <WrapBadge x={148} y={66} text="4 to 6 wraps" />
        <GripMark x={96} y={88} label="Hold loop open" anchor="middle" />
        <PartLabel x={110} y={134} text="then pass short end back through loop" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wet it and pull tight. The loop stays open so the fly can swing freely.",
    svg: (
      <><Legend />
        <FlyIcon x={164} y={86} scale={1.0} />
        <ellipse cx="130" cy="86" rx="16" ry="11"
          fill="none" stroke={TAG_COLOR} strokeWidth="2" />
        <line x1="12" y1="86" x2="114" y2="86"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="144" y="78" width="20" height="16" rx="8"
          fill="none" stroke="#F7F1E2" strokeWidth="1.8" />
        <line x1="164" y1="86" x2="172" y2="86"
          stroke={STANDING} strokeWidth="2" strokeLinecap="round" />
        <Arrow x={20} y={86} dir="left" color={STANDING} />
        <PartLabel x={130} y={70} text="open loop" color={LABEL_TAG} anchor="middle" />
        <PartLabel x={110} y={126} text="fly swings freely in the current" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── TURLE KNOT ────────────────────────────────────────────────────────────────
const turleFrames: KnotFrame[] = [
  {
    label: "Push the tippet through the hook eye, then pull it past the fly body",
    svg: (
      <><Legend />
        <FlyIcon x={136} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="136" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M136,88 Q148,48 148,42 Q148,32 148,26"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={148} y={30} dir="up" />
        <GripMark x={148} y={88} label="Hold hook" anchor="middle" />
        <PartLabel x={60} y={80} text="main line" color={LABEL_STANDING} />
        <PartLabel x={168} y={32} text="short end" color={LABEL_TAG} anchor="start" />
      </>
    ),
  },
  {
    label: "Tie a double overhand knot in the short end to form a loop. Do not tighten yet",
    svg: (
      <><Legend />
        <FlyIcon x={136} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="136" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M136,88 Q144,66 136,58 Q128,48 118,58 Q108,68 118,80 Q126,88 136,88"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <GripMark x={118} y={68} label="Hold loop open" anchor="middle" />
        <PartLabel x={100} y={44} text="double overhand loop" color={LABEL_TAG}
          anchor="middle" leaderTo={[118, 58]} />
        <PartLabel x={100} y={134} text="don't tighten yet" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Slide the loop over the whole fly. Hook, body, everything.",
    svg: (
      <><Legend />
        <FlyIcon x={136} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="136" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="148" cy="72" rx="26" ry="38"
          fill="none" stroke={TAG_COLOR} strokeWidth="2" strokeDasharray="6,4" />
        <Arrow x={148} y={36} dir="down" color={TAG_COLOR} />
        <PartLabel x={148} y={130} text="loop slides over entire fly" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Snug the loop behind the hook eye, then pull the main line. The fly tracks straight.",
    svg: (
      <><Legend />
        <FlyIcon x={136} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="136" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="140" cy="84" r="7"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <Arrow x={20} y={88} dir="left" color={STANDING} />
        <PartLabel x={110} y={122} text="fly tracks straight on tippet" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── TRILENE KNOT ──────────────────────────────────────────────────────────────
const trileneFrames: KnotFrame[] = [
  {
    label: "Thread the tippet through the hook eye twice to create a double loop",
    svg: (
      <><Legend />
        <FlyIcon x={140} y={88} scale={1.0} />
        <line x1="12" y1="84" x2="140" y2="84"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="92" x2="140" y2="92"
          stroke={TAG_COLOR} strokeWidth="2" strokeLinecap="round" strokeDasharray="5,3" />
        <path d="M140,84 Q152,48 152,44"
          stroke={STANDING} strokeWidth="2" fill="none" />
        <path d="M140,92 Q152,48 152,44"
          stroke={TAG_COLOR} strokeWidth="2" fill="none" strokeDasharray="5,3" />
        <Arrow x={152} y={38} dir="up" />
        <GripMark x={152} y={88} label="Hold hook" anchor="middle" />
        <PartLabel x={70} y={74} text="thread through eye, twice" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Wrap the short end 5 to 6 times around the main line, moving away from the eye",
    svg: (
      <><Legend />
        <FlyIcon x={140} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="140" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />
        <Wraps cx={102} count={5} y={88} color={TAG_COLOR} />
        <line x1="58" y1="98" x2="40" y2="122"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={43} y={117} dir="down" />
        <WrapBadge x={102} y={66} text="5 to 6 wraps" />
        <GripMark x={140} y={88} label="Hold double loop" anchor="middle" />
        <PartLabel x={40} y={134} text="short end" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Pass the short end back through both loops at the eye, wet it, and pull tight",
    svg: (
      <><Legend />
        <FlyIcon x={128} y={88} scale={1.0} />
        <line x1="12" y1="88" x2="128" y2="88"
          stroke={STANDING} strokeWidth="2.5" strokeLinecap="round" />

        <path d="M40,122 Q86,108 124,84"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={126} y={86} dir="right" color={TAG_COLOR} />
        <Arrow x={20} y={88} dir="left" color={STANDING} />
        <PartLabel x={80} y={64} text="short end passes through double loop" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── NAIL KNOT ─────────────────────────────────────────────────────────────────
const nailKnotFrames: KnotFrame[] = [
  {
    label: "Hold a nail or straw against the fly line, then lay 6 inches of leader alongside both",
    svg: (
      <><Legend />
        <rect x="58" y="84" width="112" height="8" rx="4"
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="175" y2="88"
          stroke={STANDING} strokeWidth="4" strokeLinecap="round" />
        <line x1="58" y1="78" x2="175" y2="78"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <GripMark x={110} y={88} label="Hold all three together" anchor="middle" />
        <PartLabel x={30} y={104} text="fly line" color={LABEL_STANDING} />
        <PartLabel x={110} y={68} text="leader" color={LABEL_TAG} anchor="middle" />
        <PartLabel x={110} y={114} text="nail or straw" color={LABEL_NEUTRAL}
          anchor="middle" leaderTo={[110, 92]} />
      </>
    ),
  },
  {
    label: "Wrap the leader short end around the fly line and nail 8 times, moving in one direction",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="175" y2="88"
          stroke={STANDING} strokeWidth="4" strokeLinecap="round" />
        <Wraps cx={108} count={6} y={88} color={TAG_COLOR} />
        <line x1="130" y1="98" x2="158" y2="120"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <WrapBadge x={108} y={66} text="6 to 8 wraps" />
        <GripMark x={60} y={88} label="Hold nail + line" anchor="middle" />
        <PartLabel x={158} y={132} text="short end" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
  {
    label: "Thread the leader short end through the tube or alongside the nail, then slide the nail out",
    svg: (
      <><Legend />
        <line x1="12" y1="88" x2="175" y2="88"
          stroke={STANDING} strokeWidth="4" strokeLinecap="round" />
        <Wraps cx={102} count={6} y={88} color={DIM} />
        <path d="M78,76 Q78,58 78,44"
          stroke={TAG_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Arrow x={76} y={40} dir="up" />
        <GripMark x={102} y={88} label="Pinch wraps" anchor="middle" />
        <PartLabel x={78} y={34} text="thread short end through" color={LABEL_TAG} anchor="middle" />
        <PartLabel x={110} y={126} text="then slide nail out slowly" color={LABEL_NEUTRAL} anchor="middle" />
      </>
    ),
  },
  {
    label: "Pull both ends tight and trim close. Connects fly line directly to the leader.",
    svg: (
      <><Legend />
        <line x1="12" y1="84" x2="88" y2="84"
          stroke={STANDING} strokeWidth="4" strokeLinecap="round" />
        <rect x="88" y="76" width="44" height="18" rx="4"
          fill="none" stroke="#F7F1E2" strokeWidth="2" />
        <line x1="132" y1="90" x2="210" y2="90"
          stroke={TAG_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <Arrow x={20} y={84} dir="left" color={STANDING} />
        <Arrow x={202} y={90} dir="right" color={TAG_COLOR} />
        <PartLabel x={110} y={66} text="fly line to leader connection" color={LABEL_NEUTRAL} anchor="middle" />
        <PartLabel x={110} y={122} text="trim short ends flush" color={LABEL_TAG} anchor="middle" />
      </>
    ),
  },
];

// ── Main diagram record ───────────────────────────────────────────────────────
const diagrams: Record<string, React.ReactNode[]> = {
  improved_clinch: improvedClinchFrames.map((f) => f.svg),
  palomar:         palomarFrames.map((f) => f.svg),
  davy_knot:       davyFrames.map((f) => f.svg),
  non_slip_mono:   nonSlipMonoFrames.map((f) => f.svg),
  surgeons_knot:   surgeonsFrames.map((f) => f.svg),
  dropper_loop:    dropperLoopFrames.map((f) => f.svg),
  blood_knot:      bloodKnotFrames.map((f) => f.svg),
  turle_knot:      turleFrames.map((f) => f.svg),
  trilene_knot:    trileneFrames.map((f) => f.svg),
  nail_knot:       nailKnotFrames.map((f) => f.svg),
};

// ── Exports ───────────────────────────────────────────────────────────────────
export function getStepCount(knotId: string): number {
  return diagrams[knotId]?.length ?? 0;
}

export interface KnotDiagramProps {
  knotId: string;
  step: number;
  className?: string;
}

export function KnotDiagram({ knotId, step, className }: KnotDiagramProps) {
  const frames = diagrams[knotId];
  if (!frames) return null;
  const frame = frames[Math.min(step, frames.length - 1)];
  return (
    <svg viewBox="0 0 240 175" className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "auto" }}
      overflow="hidden">
      {frame}
    </svg>
  );
}

export const knotDiagrams: Record<string, KnotFrame[]> = {
  improved_clinch: improvedClinchFrames,
  palomar:         palomarFrames,
  davy_knot:       davyFrames,
  non_slip_mono:   nonSlipMonoFrames,
  surgeons_knot:   surgeonsFrames,
  dropper_loop:    dropperLoopFrames,
  blood_knot:      bloodKnotFrames,
  turle_knot:      turleFrames,
  trilene_knot:    trileneFrames,
  nail_knot:       nailKnotFrames,
};
