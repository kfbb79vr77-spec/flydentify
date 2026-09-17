// GearSetupCard, Fly-specific gear & rigging panel with SVG rig diagrams

import { FlyRigging } from "@/lib/flyData";
import { SWFlyRigging } from "@/lib/saltwaterFlyData";
import { FlyType } from "@/lib/flyData";
import { SWFlyType } from "@/lib/saltwaterFlyData";
import { Lightbulb, ShoppingBag, ChevronRight } from "lucide-react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const fw = {
  bg: "#0D1B33",
  card: "rgba(255,255,255,0.05)",
  border: "rgba(245,230,204,0.12)",
  accent: "#A67A3A",
  amber: "#C99A52",
  text: "rgba(245,230,204,0.95)",
  muted: "rgba(245,230,204,0.65)",
  faint: "rgba(245,230,204,0.45)",
  diagBg: "#060D1A",
};
const sw = {
  bg: "#0D1B33",
  card: "rgba(61,107,131,0.12)",
  border: "rgba(61,107,131,0.28)",
  accent: "#4F98A3",
  text: "rgba(245,230,204,0.95)",
  muted: "rgba(245,230,204,0.65)",
  faint: "rgba(245,230,204,0.45)",
  diagBg: "#060D1A",
};

// ─── SVG Rig Diagrams ─────────────────────────────────────────────────────────
// Line style helpers
const L  = "stroke-current stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round";
const LD = "stroke-current stroke-[1.5] fill-none stroke-linecap-round stroke-linejoin-round opacity-40";
const LT = "stroke-[2] fill-none stroke-linecap-round stroke-linejoin-round";
const LB = "stroke-[#3D6B83] stroke-[2] fill-none stroke-linecap-round stroke-linejoin-round";

function Label({ x, y, children, anchor = "middle", salt = false }: {
  x: number; y: number; children: string; anchor?: string; salt?: boolean
}) {
  return (
    <text x={x} y={y} textAnchor={anchor as any}
      fill={salt ? "rgba(61,107,131,0.85)" : "rgba(212,168,90,0.9)"}
      fontSize="8.5" fontFamily="Lora, serif" fontStyle="italic">
      {children}
    </text>
  );
}

// Terminus dot — clean end-of-tippet marker matching knot diagram style
function Hook({ x, y, salt = false }: { x: number; y: number; scale?: number; salt?: boolean }) {
  const accent = salt ? "rgba(61,107,131,0.9)" : "rgba(212,168,90,0.9)";
  const ring   = salt ? "rgba(61,107,131,0.35)" : "rgba(212,168,90,0.35)";
  return (
    <g>
      {/* Outer ring */}
      <circle cx={x} cy={y} r={6} stroke={ring} strokeWidth="1" fill="none" />
      {/* Inner filled dot */}
      <circle cx={x} cy={y} r={3} fill={accent} />
    </g>
  );
}

function FlyTuft({ x, y, salt = false }: { x: number; y: number; salt?: boolean }) {
  const c = salt ? "rgba(61,107,131,0.7)" : "rgba(212,168,90,0.7)";
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M0,0 Q-6,-10 -3,-18 M0,0 Q2,-12 6,-16 M0,0 Q8,-8 10,-14`}
        stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Reel({ x, y, salt = false }: { x: number; y: number; salt?: boolean }) {
  const stroke = salt ? "rgba(61,107,131,0.9)" : "rgba(212,168,90,0.9)";
  const fill   = salt ? "rgba(61,107,131,0.15)" : "rgba(120,80,20,0.18)";
  const dim    = salt ? "rgba(61,107,131,0.45)" : "rgba(212,168,90,0.45)";
  // Realistic large-arbor fly reel: outer rim → palming rim → arbor → spool spokes → handle
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Outer frame / cage */}
      <circle cx="0" cy="0" r="19" stroke={stroke} strokeWidth="2" fill="rgba(0,0,0,0.55)" />
      {/* Palming rim ring */}
      <circle cx="0" cy="0" r="17" stroke={dim} strokeWidth="1" fill="none" />
      {/* Spool arbor */}
      <circle cx="0" cy="0" r="9" stroke={stroke} strokeWidth="1.5" fill={fill} />
      {/* Spool spokes (4) */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = Math.cos(rad) * 9;
        const y1 = Math.sin(rad) * 9;
        const x2 = Math.cos(rad) * 17;
        const y2 = Math.sin(rad) * 17;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dim} strokeWidth="1.2" strokeLinecap="round" />;
      })}
      {/* Arbor center hub */}
      <circle cx="0" cy="0" r="4" stroke={stroke} strokeWidth="1.5" fill={stroke} opacity="0.7" />
      {/* Foot / mount at bottom */}
      <rect x="-5" y="17" width="10" height="5" rx="1.5" stroke={dim} strokeWidth="1" fill="rgba(0,0,0,0.5)" />
      {/* Drag knob on right side */}
      <circle cx="19" cy="0" r="4.5" stroke={stroke} strokeWidth="1.5" fill="rgba(0,0,0,0.55)" />
      <circle cx="19" cy="0" r="2" fill={dim} />
      {/* Handle arm */}
      <line x1="19" y1="-4.5" x2="24" y2="-9" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="-9" r="2.5" stroke={dim} strokeWidth="1.2" fill="rgba(0,0,0,0.5)" />
    </g>
  );
}

function Rod({ x1, y1, x2, y2, salt = false }: {
  x1: number; y1: number; x2: number; y2: number; salt?: boolean
}) {
  const col = salt ? "rgba(61,107,131,0.85)" : "rgba(212,168,90,0.85)";
  const dim = salt ? "rgba(61,107,131,0.45)" : "rgba(212,168,90,0.45)";
  // Direction vector for guide perpendicular offset
  const dx = x2 - x1; const dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = -dy / len; const ny = dx / len; // normal
  const guideFractions = [0.32, 0.52, 0.72, 0.88];
  return (
    <>
      {/* Cork grip — warm tan, near handle end */}
      <path
        d={`M${x1},${y1} Q${x1 + dx*0.04},${y1 + dy*0.04 - 3} ${x1 + dx*0.1},${y1 + dy*0.1 - 2} L${x1 + dx*0.1},${y1 + dy*0.1 + 2} Q${x1 + dx*0.04},${y1 + dy*0.04 + 3} ${x1},${y1} Z`}
        fill="rgba(160,120,60,0.5)" stroke="rgba(160,120,60,0.6)" strokeWidth="0.5"
      />
      {/* Reel seat band */}
      <rect
        x={x1 + dx*0.08 - 1} y={y1 + dy*0.08 - 3}
        width={6} height={5} rx={1}
        fill="rgba(60,40,15,0.55)" stroke={dim} strokeWidth="0.7"
        transform={`rotate(${Math.atan2(dy,dx)*180/Math.PI},${x1 + dx*0.1},${y1 + dy*0.1})`}
      />
      {/* Blank — 3 sections, tapering thick→thin */}
      <line x1={x1 + dx*0.1} y1={y1 + dy*0.1} x2={x1 + dx*0.45} y2={y1 + dy*0.45}
        stroke={col} strokeWidth="2.8" strokeLinecap="round" />
      <line x1={x1 + dx*0.45} y1={y1 + dy*0.45} x2={x1 + dx*0.75} y2={y1 + dy*0.75}
        stroke={col} strokeWidth="1.8" strokeLinecap="round" />
      <line x1={x1 + dx*0.75} y1={y1 + dy*0.75} x2={x2} y2={y2}
        stroke={col} strokeWidth="1" strokeLinecap="round" />
      {/* Ferrule at main join */}
      <rect
        x={x1 + dx*0.44 - 1} y={y1 + dy*0.44 - 2}
        width={4} height={3} rx={0.5}
        fill="rgba(255,255,255,0.25)"
        transform={`rotate(${Math.atan2(dy,dx)*180/Math.PI},${x1 + dx*0.45},${y1 + dy*0.45})`}
      />
      {/* Guide rings with feet */}
      {guideFractions.map((t, i) => {
        const gx = x1 + dx * t; const gy = y1 + dy * t;
        const r = 3.2 - i * 0.55;
        const footLen = r + 1;
        return (
          <g key={i}>
            <line x1={gx - nx*footLen} y1={gy - ny*footLen}
                  x2={gx + nx*footLen} y2={gy + ny*footLen}
              stroke={dim} strokeWidth="0.7" />
            <circle cx={gx - nx*(r+0.5)} cy={gy - ny*(r+0.5)} r={r}
              stroke={col} strokeWidth="1.1" fill="none" />
          </g>
        );
      })}
      {/* Tip-top */}
      <circle cx={x2} cy={y2} r={1.2} stroke={col} strokeWidth="0.8" fill="none" />
    </>
  );
}

// ── Dry Fly Rig ──────────────────────────────────────────────────────────────
export function DryFlyRigDiagram({ salt = false }) {
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={30} y={70} salt={salt} />
      <Rod x1={46} y1={70} x2={200} y2={28} salt={salt} />
      {/* Fly line */}
      <path d="M200,28 Q218,22 232,23" className={salt ? LB : LT} stroke={salt ? "rgba(61,107,131,0.9)" : "rgba(167,122,58,0.95)"} strokeWidth="2.5" />
      {/* Leader */}
      <path d="M232,23 Q242,25 248,32" stroke="rgba(255,255,255,0.5)" strokeWidth="0.75"
        fill="none" strokeLinecap="round" strokeDasharray="4,2" />
      {/* Tippet */}
      <line x1="248" y1="32" x2="254" y2="50" stroke="rgba(255,255,255,0.35)"
        strokeWidth="1" strokeLinecap="round" />
      {/* Fly terminus — at exact tippet endpoint x2=254 y2=50 */}
      <Hook x={254} y={50} salt={salt} />
      {/* Water surface */}
      <path d="M180,118 Q210,114 240,118 Q265,122 290,118"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels — staggered right of geometry */}
      <Label x={175} y={14} salt={salt}>Fly line</Label>
      <Label x={258} y={22} anchor="start" salt={salt}>Leader</Label>
      <Label x={258} y={36} anchor="start" salt={salt}>Tippet</Label>
      <Label x={258} y={54} anchor="start" salt={salt}>Dry fly</Label>
    </svg>
  );
}

// ── Nymph / Indicator Rig ────────────────────────────────────────────────────
export function NymphRigDiagram({ salt = false }) {
  return (
    <svg viewBox="0 0 340 160" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={30} y={80} salt={salt} />
      <Rod x1={46} y1={80} x2={185} y2={38} salt={salt} />
      {/* Fly line */}
      <path d="M185,38 Q205,30 220,32" className={salt ? LB : LT} stroke={salt ? "rgba(61,107,131,0.9)" : "rgba(167,122,58,0.95)"} strokeWidth="2.5" />
      {/* Leader */}
      <line x1="220" y1="32" x2="228" y2="78"
        stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" strokeDasharray="4,2" />
      {/* Indicator */}
      <circle cx="228" cy="78" r="7" fill={salt ? "rgba(61,107,131,0.7)" : "rgba(167,122,58,0.75)"}
        stroke="white" strokeWidth="1" />
      {/* Tippet down */}
      <line x1="228" y1="85" x2="230" y2="128"
        stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      {/* Split shot */}
      <circle cx="230" cy="116" r="4" fill="rgba(180,180,180,0.6)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      {/* Nymph terminus — tippet ends x2=230 y2=128 */}
      <Hook x={230} y={128} salt={salt} />
      {/* Water */}
      <path d="M140,105 Q180,100 220,105 Q250,110 275,105"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels — to the right, well-spaced */}
      <Label x={165} y={22} salt={salt}>Fly line</Label>
      <Label x={240} y={52} anchor="start" salt={salt}>Leader</Label>
      <Label x={240} y={78} anchor="start" salt={salt}>Indicator</Label>
      <Label x={240} y={118} anchor="start" salt={salt}>Split shot</Label>
      <Label x={240} y={132} anchor="start" salt={salt}>Nymph</Label>
    </svg>
  );
}

// ── Streamer Rig ─────────────────────────────────────────────────────────────
export function StreamerRigDiagram({ salt = false }) {
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={30} y={70} salt={salt} />
      <Rod x1={46} y1={70} x2={180} y2={40} salt={salt} />
      {/* Fly line — sink-tip */}
      <path d="M180,40 Q200,34 218,36" stroke={salt ? "rgba(61,107,131,0.9)" : "rgba(120,80,20,0.9)"}
        strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Short leader */}
      <line x1="218" y1="36" x2="234" y2="56"
        stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* Streamer terminus — leader ends x2=234 y2=56 */}
      <Hook x={234} y={56} salt={salt} />
      {/* Water */}
      <path d="M130,105 Q175,100 220,106 Q255,110 285,105"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels */}
      <Label x={155} y={24} salt={salt}>Fly line (sink-tip)</Label>
      <Label x={244} y={38} anchor="start" salt={salt}>Short leader</Label>
      <Label x={244} y={60} anchor="start" salt={salt}>Streamer</Label>
    </svg>
  );
}

// ── Dry-Dropper Rig ──────────────────────────────────────────────────────────
export function DryDropperRigDiagram({ salt = false }) {
  return (
    <svg viewBox="0 0 340 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={30} y={85} salt={salt} />
      <Rod x1={46} y1={85} x2={185} y2={42} salt={salt} />
      <path d="M185,42 Q204,34 218,36" className={salt ? LB : LT} stroke={salt ? "rgba(61,107,131,0.9)" : "rgba(167,122,58,0.95)"} strokeWidth="2.5" />
      {/* Leader */}
      <line x1="218" y1="36" x2="225" y2="74"
        stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" strokeDasharray="4,2" />
      {/* Dry fly terminus — leader ends x2=225 y2=74 */}
      <Hook x={225} y={74} salt={salt} />
      {/* Dropper tippet — starts from dry fly terminus */}
      <line x1="225" y1="74" x2="228" y2="148"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Nymph terminus — dropper ends x2=228 y2=148 */}
      <Hook x={228} y={148} salt={salt} />
      {/* Water */}
      <path d="M165,118 Q200,113 235,118 Q258,122 278,118"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels — to right, clear of geometry */}
      <Label x={165} y={22} salt={salt}>Fly line</Label>
      <Label x={238} y={48} anchor="start" salt={salt}>Leader 9 ft</Label>
      <Label x={238} y={78} anchor="start" salt={salt}>Dry fly</Label>
      <Label x={238} y={108} anchor="start" salt={salt}>Dropper tippet</Label>
      <Label x={238} y={152} anchor="start" salt={salt}>Nymph</Label>
    </svg>
  );
}

// ── Flats / Saltwater Single ─────────────────────────────────────────────────
export function FlatsRigDiagram() {
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={30} y={72} salt />
      <Rod x1={46} y1={72} x2={185} y2={32} salt />
      {/* Fly line */}
      <path d="M185,32 Q205,24 220,26" stroke="rgba(61,107,131,0.9)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Hard mono leader */}
      <line x1="220" y1="26" x2="234" y2="50"
        stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeDasharray="5,2" />
      {/* Tippet */}
      <line x1="234" y1="50" x2="240" y2="72"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      {/* Flats fly terminus — tippet ends x2=240 y2=72 */}
      <Hook x={240} y={72} salt />
      {/* Flat bottom */}
      <path d="M110,114 L290,114" stroke="rgba(180,150,80,0.4)" strokeWidth="1.5" strokeDasharray="6,3" />
      {/* Water surface */}
      <path d="M110,90 Q150,86 195,90 Q235,94 275,90"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels — staggered right */}
      <Label x={162} y={16} salt>Tropical taper</Label>
      <Label x={248} y={36} anchor="start" salt>Hard mono leader</Label>
      <Label x={248} y={54} anchor="start" salt>Fluoro tippet</Label>
      <Label x={248} y={76} anchor="start" salt>Shrimp fly</Label>
    </svg>
  );
}

// ── Tarpon Rig ───────────────────────────────────────────────────────────────
export function TarponRigDiagram() {
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={28} y={72} salt />
      <Rod x1={44} y1={72} x2={180} y2={32} salt />
      {/* Heavy fly line */}
      <path d="M180,32 Q198,24 212,26" stroke="rgba(61,107,131,0.9)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* 60 lb butt */}
      <line x1="212" y1="26" x2="224" y2="48"
        stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Class tippet */}
      <line x1="224" y1="48" x2="230" y2="68"
        stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />
      {/* Tarpon fly terminus — class tippet ends x2=230 y2=68 */}
      <Hook x={230} y={68} salt />
      {/* Water */}
      <path d="M110,112 Q155,107 200,112 Q238,117 270,112"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels — staggered, clear space right of x=240 */}
      <Label x={155} y={14} salt>12-wt tarpon taper</Label>
      <Label x={242} y={30} anchor="start" salt>60 lb butt</Label>
      <Label x={242} y={50} anchor="start" salt>Class tippet</Label>
      <Label x={242} y={72} anchor="start" salt>Tarpon fly</Label>
    </svg>
  );
}

// ── Striper / Inshore Rig ────────────────────────────────────────────────────
export function StriperRigDiagram() {
  return (
    <svg viewBox="0 0 340 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <Reel x={28} y={70} salt />
      <Rod x1={44} y1={70} x2={178} y2={34} salt />
      {/* Intermediate line */}
      <path d="M178,34 Q196,28 212,30" stroke="rgba(61,107,131,0.75)" strokeWidth="3.5"
        fill="none" strokeLinecap="round" strokeDasharray="8,3" />
      {/* Leader */}
      <line x1="212" y1="30" x2="228" y2="56"
        stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* Striper fly terminus — leader ends x2=228 y2=56 */}
      <Hook x={228} y={56} salt />
      {/* Water */}
      <path d="M118,105 Q160,100 210,105 Q248,110 278,105"
        stroke="rgba(61,107,131,0.3)" strokeWidth="0.75" fill="none" />
      {/* Labels */}
      <Label x={152} y={18} salt>Intermediate line</Label>
      <Label x={242} y={34} anchor="start" salt>20-25 lb leader</Label>
      <Label x={242} y={60} anchor="start" salt>Clouser/Deceiver</Label>
    </svg>
  );
}

// ─── Diagram selector by fly type ────────────────────────────────────────────
function FWDiagram({ flyType }: { flyType: FlyType }) {
  if (flyType === "streamer") return <StreamerRigDiagram />;
  if (flyType === "nymph") return <NymphRigDiagram />;
  if (flyType === "emerger") return <DryFlyRigDiagram />;
  if (flyType === "terrestrial") return <DryDropperRigDiagram />;
  return <DryFlyRigDiagram />;
}

function SWDiagram({ flyType }: { flyType: SWFlyType }) {
  if (flyType === "streamer" || flyType === "baitfish" || flyType === "popper" || flyType === "worm")
    return <StriperRigDiagram />;
  if (flyType === "crab") return <FlatsRigDiagram />;
  // shrimp → check if tarpon (handled by parent via rod weight hint), default flats
  return <FlatsRigDiagram />;
}

// ─── Gear Row ─────────────────────────────────────────────────────────────────
interface GearRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  salt?: boolean;
}
function GearRow({ icon, label, value, salt = false }: GearRowProps) {
  const t = salt ? sw : fw;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: t.border }}>
      <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: salt ? "rgba(61,107,131,0.15)" : "rgba(120,80,20,0.2)", color: t.accent }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-['Inter'] text-[10px] uppercase tracking-widest mb-0.5"
          style={{ color: t.faint }}>{label}</p>
        <p className="font-['Cormorant_Garamond'] text-sm leading-snug"
          style={{ color: t.text }}>{value}</p>
      </div>

    </div>
  );
}

// ─── Rod icon SVG ─────────────────────────────────────────────────────────────
function RodIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <line x1="1" y1="15" x2="15" y2="1" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="2" r="1.5" stroke={color} strokeWidth="1.2" />
      <circle cx="10" cy="6" r="1.2" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="9" r="1" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
function ReelIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="8" r="1" fill={color} />
    </svg>
  );
}
function LineIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2,8 Q5,4 8,8 Q11,12 14,8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function LeaderIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <line x1="2" y1="8" x2="14" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,2" />
      <circle cx="14" cy="8" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
function TippetIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="2" x2="8" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="14" x2="11" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="2" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

// ─── Main GearSetupCard ───────────────────────────────────────────────────────
interface FWGearProps {
  rigging: FlyRigging;
  flyType: FlyType;
  flyName: string;
}
interface SWGearProps {
  rigging: SWFlyRigging;
  flyType: SWFlyType;
  flyName: string;
  salt: true;
}

export function GearSetupCard(props: FWGearProps | SWGearProps) {
  const isSalt = "salt" in props && props.salt;
  const t = isSalt ? sw : fw;
  const { rigging, flyName } = props;

  // Tarpon flies use a special rig diagram
  const useTarponDiagram = isSalt && (
    props.flyType === "streamer" &&
    (flyName.toLowerCase().includes("cockroach") || flyName.toLowerCase().includes("black death") || flyName.toLowerCase().includes("tarpon"))
  );

  return (
    <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#0D1B33" }}>
        <div className="flex items-center gap-2">
          <RodIcon size={14} color={t.accent} />
          <h3 className="font-['Inter'] text-xs font-semibold uppercase tracking-widest"
            style={{ color: t.text }}>Gear Setup</h3>
        </div>
        <span className="font-['Inter'] text-[10px] italic" style={{ color: t.faint }}>
          Rod · Reel · Line · Leader · Tippet
        </span>
      </div>

      {/* SVG Rig Diagram */}
      <div className="px-3 pt-3 pb-1" style={{ backgroundColor: t.diagBg }}>
        {isSalt
          ? useTarponDiagram
            ? <TarponRigDiagram />
            : (props as SWGearProps).flyType === "baitfish" || (props as SWGearProps).flyType === "streamer" || (props as SWGearProps).flyType === "popper"
              ? <StriperRigDiagram />
              : <FlatsRigDiagram />
          : <FWDiagram flyType={(props as FWGearProps).flyType} />
        }
      </div>

      {/* Gear Rows */}
      <div className="px-3" style={{ backgroundColor: t.bg }}>
        <GearRow icon={<RodIcon size={14} color={t.accent} />} label="Rod" value={rigging.rod} salt={isSalt} />
        <GearRow icon={<ReelIcon size={14} color={t.accent} />} label="Reel" value={rigging.reel} salt={isSalt} />
        <GearRow icon={<LineIcon size={14} color={t.accent} />} label="Line" value={rigging.line} salt={isSalt} />
        <GearRow icon={<LeaderIcon size={14} color={t.accent} />} label="Leader" value={rigging.leader} salt={isSalt} />
        <GearRow icon={<TippetIcon size={14} color={t.accent} />} label="Tippet" value={rigging.tippet} salt={isSalt} />
      </div>

      {/* Field tip */}
      <div className="px-4 py-3 flex gap-3 items-start"
        style={{ backgroundColor: "#0D1B33", borderTop: `1px solid ${t.border}` }}>
        <Lightbulb size={13} style={{ color: t.accent }} className="mt-0.5 shrink-0" />
        <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: "rgba(240,225,200,0.95)" }}>
          {rigging.riggingNote}
        </p>
      </div>

      {/* Shop This Rig + full guide link */}
      <div className="px-4 py-3 flex items-center justify-between gap-2"
        style={{ borderTop: `1px solid ${t.border}`, backgroundColor: "#0D1B33" }}>
        <div className="flex items-center gap-2">
          <ShoppingBag size={12} style={{ color: t.accent }} />
          <p className="font-['Inter'] text-[10px] uppercase tracking-widest font-semibold" style={{ color: t.accent }}>Shop this rig</p>
        </div>
        <a href="/#/rigging" className="flex items-center gap-1 font-['Inter'] text-[11px] uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: t.accent }}>
          Full guide
          <ChevronRight size={11} />
        </a>
      </div>
    </div>
  );
}
