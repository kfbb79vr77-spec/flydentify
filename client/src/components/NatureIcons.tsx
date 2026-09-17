/**
 * NatureIcons.tsx
 * 
 * Custom hand-crafted SVG icon library for Flydentify.
 * Each icon looks like a fine-line engraving — intricate, clean,
 * stroke-first, like something from an Orvis catalog or Trout Unlimited field guide.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Fly Icon — Detailed dry fly with hook, hackle, wing ───────────────────────
export function FlyIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Dry fly"
    >
      {/* Eyelet — the ring the tippet threads through. NO hook below it. */}
      <circle cx="7" cy="12" r="1.6" strokeWidth="1.2" fill="none" />
      {/* Body stub from eyelet to hackle center */}
      <line x1="8.6" y1="12" x2="11" y2="12" strokeWidth="1.2" />
      {/* Hackle fibers — top */}
      <path d="M10 12 Q8 9 7 7" strokeWidth="0.9" />
      <path d="M11 12 Q10 8.5 10 6.5" strokeWidth="0.9" />
      <path d="M12 12 Q12 8 13 6" strokeWidth="0.9" />
      <path d="M13 12 Q14 8 15 6.5" strokeWidth="0.9" />
      {/* Hackle fibers — bottom */}
      <path d="M10 12 Q8 14 7 16" strokeWidth="0.9" />
      <path d="M11.5 12 Q11 14.5 10.5 16" strokeWidth="0.9" />
      <path d="M13 12 Q13 14.5 12.5 16.5" strokeWidth="0.9" />
      {/* Upright wings */}
      <path d="M11 12 Q9 7 8 5 Q11 6.5 11 12" strokeWidth="1" fill={color} fillOpacity="0.12" />
      <path d="M12 12 Q14 7 15 5 Q12 6.5 12 12" strokeWidth="1" fill={color} fillOpacity="0.12" />
      {/* Tail fibers — right side only (no hook below) */}
      <path d="M15 12 L17.5 10.5 M15 12 L18 12 M15 12 L17.5 13.5" strokeWidth="0.7" />
    </svg>
  );
}

// ─── Trout Icon — Rainbow trout silhouette with spots ──────────────────────────
export function TroutIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Trout"
    >
      {/* Body */}
      <path d="M3 12 Q5 7 12 8 Q18 8 20 12 Q18 16 12 16 Q5 17 3 12 Z"
        strokeWidth="1.3" fill={color} fillOpacity="0.08" />
      {/* Tail fin */}
      <path d="M3 12 L1 9 M3 12 L1 15" strokeWidth="1.4" />
      {/* Dorsal fin */}
      <path d="M9 8 Q11 5 14 7" strokeWidth="1.1" />
      {/* Pectoral fin */}
      <path d="M13 10.5 Q15 9 16 11" strokeWidth="1" />
      {/* Ventral fin */}
      <path d="M12 15.5 Q14 17 15 15.5" strokeWidth="1" />
      {/* Lateral line */}
      <path d="M5 11.5 Q10 10.5 18 12" strokeWidth="0.8" strokeDasharray="1.5,1.2" />
      {/* Eye */}
      <circle cx="18.5" cy="11" r="0.9" strokeWidth="1" />
      <circle cx="18.5" cy="11" r="0.3" fill={color} stroke="none" />
      {/* Spots */}
      <circle cx="8" cy="11" r="0.5" fill={color} />
      <circle cx="11" cy="10" r="0.4" fill={color} />
      <circle cx="14" cy="11.5" r="0.5" fill={color} />
      <circle cx="10" cy="13" r="0.35" fill={color} />
      <circle cx="7" cy="13.5" r="0.4" fill={color} />
      <circle cx="13" cy="9.5" r="0.35" fill={color} />
      {/* Gill plate */}
      <path d="M17 9 Q18.5 11 17 14" strokeWidth="1" />
    </svg>
  );
}

// ─── Mayfly Icon — With upright wings and tails ────────────────────────────────
export function MayflyIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Mayfly"
    >
      {/* Body segments */}
      <path d="M12 20 Q11 17 12 14 Q13 17 12 20" strokeWidth="1.2" fill={color} fillOpacity="0.1" />
      <ellipse cx="12" cy="13" rx="1.5" ry="2.5" strokeWidth="1.2" fill={color} fillOpacity="0.08" />
      <ellipse cx="12" cy="10" rx="1.2" ry="1.5" strokeWidth="1.1" fill={color} fillOpacity="0.06" />
      {/* Head */}
      <circle cx="12" cy="8.2" r="1.1" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Eyes */}
      <circle cx="11.3" cy="7.8" r="0.35" fill={color} />
      <circle cx="12.7" cy="7.8" r="0.35" fill={color} />
      {/* Large upright fore-wings */}
      <path d="M12 11 Q7 8 6 4 Q10 5.5 12 11" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      <path d="M12 11 Q17 8 18 4 Q14 5.5 12 11" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Wing venation */}
      <path d="M10 9 Q9 7 8 5.5" strokeWidth="0.6" />
      <path d="M11 8.5 Q10.5 7 10 5" strokeWidth="0.6" />
      <path d="M14 9 Q15 7 16 5.5" strokeWidth="0.6" />
      <path d="M13 8.5 Q13.5 7 14 5" strokeWidth="0.6" />
      {/* Small hind wings */}
      <path d="M12 12 Q9 11 8.5 9.5 Q10.5 10 12 12" strokeWidth="0.9" fill={color} fillOpacity="0.06" />
      <path d="M12 12 Q15 11 15.5 9.5 Q13.5 10 12 12" strokeWidth="0.9" fill={color} fillOpacity="0.06" />
      {/* Tails — three cerci */}
      <path d="M11.5 20 Q10.5 22.5 9.5 23.5" strokeWidth="0.9" />
      <path d="M12 20.5 Q12 23 12 23.5" strokeWidth="0.9" />
      <path d="M12.5 20 Q13.5 22.5 14.5 23.5" strokeWidth="0.9" />
      {/* Legs */}
      <path d="M10.5 12 Q9 13 8 12.5" strokeWidth="0.8" />
      <path d="M10.5 13.5 Q9 14.5 7.5 14" strokeWidth="0.8" />
      <path d="M13.5 12 Q15 13 16 12.5" strokeWidth="0.8" />
      <path d="M13.5 13.5 Q15 14.5 16.5 14" strokeWidth="0.8" />
    </svg>
  );
}

// ─── Caddis Icon — Tent wings folded over body ─────────────────────────────────
export function CaddisIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Caddisfly"
    >
      {/* Body */}
      <path d="M7 14 Q9 18 12 18.5 Q15 18 17 14 Q15 12 12 11.5 Q9 12 7 14 Z"
        strokeWidth="1.2" fill={color} fillOpacity="0.08" />
      {/* Thorax */}
      <ellipse cx="12" cy="11" rx="2" ry="1.5" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Head */}
      <circle cx="12" cy="9" r="1.2" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Long antennae */}
      <path d="M11.2 8 Q9 5 7 3" strokeWidth="1" />
      <path d="M12.8 8 Q15 5 17 3" strokeWidth="1" />
      {/* Tent-folded wings — left */}
      <path d="M7 14 Q5 11 5.5 7 Q8 9 9 11.5" strokeWidth="1.1" fill={color} fillOpacity="0.08" />
      <path d="M7.5 13.5 Q6 11 6.5 8" strokeWidth="0.7" />
      {/* Tent-folded wings — right */}
      <path d="M17 14 Q19 11 18.5 7 Q16 9 15 11.5" strokeWidth="1.1" fill={color} fillOpacity="0.08" />
      <path d="M16.5 13.5 Q18 11 17.5 8" strokeWidth="0.7" />
      {/* Wing ridge at top */}
      <path d="M9 11.5 Q12 10 15 11.5" strokeWidth="0.9" />
      {/* Body segmentation */}
      <path d="M8.5 15 Q12 14.5 15.5 15" strokeWidth="0.7" strokeDasharray="1,1.2" />
      <path d="M8 16.5 Q12 16 16 16.5" strokeWidth="0.7" strokeDasharray="1,1.2" />
      {/* Legs */}
      <path d="M10 12 Q8.5 13.5 7.5 13" strokeWidth="0.8" />
      <path d="M14 12 Q15.5 13.5 16.5 13" strokeWidth="0.8" />
      <path d="M10 13 Q8 14.5 7 15.5" strokeWidth="0.8" />
      <path d="M14 13 Q16 14.5 17 15.5" strokeWidth="0.8" />
    </svg>
  );
}

// ─── Stonefly Icon — Flat wings, stocky body ──────────────────────────────────
export function StoneflyIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Stonefly"
    >
      {/* Flat wings — fore */}
      <path d="M8.5 11 Q5 8 4 5 Q8 7 10 11" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      <path d="M15.5 11 Q19 8 20 5 Q16 7 14 11" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Flat wings — hind (shorter) */}
      <path d="M9 12 Q6 10.5 5.5 8 Q8.5 9.5 10 12" strokeWidth="1" fill={color} fillOpacity="0.07" />
      <path d="M15 12 Q18 10.5 18.5 8 Q15.5 9.5 14 12" strokeWidth="1" fill={color} fillOpacity="0.07" />
      {/* Wing venation lines */}
      <path d="M8 9 Q6.5 7.5 6 6" strokeWidth="0.6" />
      <path d="M9 8.5 Q8 7 7.5 5.5" strokeWidth="0.6" />
      <path d="M16 9 Q17.5 7.5 18 6" strokeWidth="0.6" />
      <path d="M15 8.5 Q16 7 16.5 5.5" strokeWidth="0.6" />
      {/* Body — segmented abdomen */}
      <rect x="10" y="11" width="4" height="9" rx="1.5" strokeWidth="1.2" fill={color} fillOpacity="0.08" />
      <path d="M10 13.5 L14 13.5 M10 15.5 L14 15.5 M10 17.5 L14 17.5" strokeWidth="0.7" />
      {/* Thorax */}
      <rect x="9.5" y="8.5" width="5" height="3" rx="1" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Head */}
      <rect x="10" y="6.5" width="4" height="2.5" rx="1" strokeWidth="1.1" fill={color} fillOpacity="0.1" />
      {/* Antennae */}
      <path d="M10.5 6.5 Q9 4.5 8 3" strokeWidth="1" />
      <path d="M13.5 6.5 Q15 4.5 16 3" strokeWidth="1" />
      {/* Two tails */}
      <path d="M11 20 Q10.5 22 10 22.5" strokeWidth="0.9" />
      <path d="M13 20 Q13.5 22 14 22.5" strokeWidth="0.9" />
      {/* Legs */}
      <path d="M9.5 10 Q7.5 11 7 12" strokeWidth="0.8" />
      <path d="M9.5 11.5 Q7 12.5 6.5 14" strokeWidth="0.8" />
      <path d="M9.5 13 Q7.5 13.5 7 15" strokeWidth="0.8" />
      <path d="M14.5 10 Q16.5 11 17 12" strokeWidth="0.8" />
      <path d="M14.5 11.5 Q17 12.5 17.5 14" strokeWidth="0.8" />
      <path d="M14.5 13 Q16.5 13.5 17 15" strokeWidth="0.8" />
    </svg>
  );
}

// ─── River Icon — Flowing river with rocks, perspective ────────────────────────
export function RiverIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="River"
    >
      {/* River banks converging to horizon */}
      <path d="M2 20 Q6 16 8 12 Q10 8 11 4" strokeWidth="1.3" />
      <path d="M22 20 Q18 16 16 12 Q14 8 13 4" strokeWidth="1.3" />
      {/* Water surface ripples */}
      <path d="M6 18 Q9 17 12 18 Q15 19 18 18" strokeWidth="0.9" />
      <path d="M7 15.5 Q10 14.5 12 15.5 Q14.5 16.5 17 15.5" strokeWidth="0.9" />
      <path d="M8.5 13 Q10.5 12 12 13 Q13.5 14 15.5 13" strokeWidth="0.9" />
      <path d="M9.5 10.5 Q11 9.5 12 10.5 Q13 11.5 14.5 10.5" strokeWidth="0.8" />
      <path d="M10.5 8 Q11.5 7 12 8 Q12.5 9 13.5 8" strokeWidth="0.7" />
      {/* Rocks in river */}
      <ellipse cx="5" cy="19" rx="1.5" ry="0.8" strokeWidth="1" fill={color} fillOpacity="0.12" />
      <ellipse cx="19" cy="19" rx="1.3" ry="0.7" strokeWidth="1" fill={color} fillOpacity="0.12" />
      <ellipse cx="9" cy="16.5" rx="1" ry="0.6" strokeWidth="0.9" fill={color} fillOpacity="0.1" />
      <ellipse cx="16" cy="16" rx="0.9" ry="0.5" strokeWidth="0.9" fill={color} fillOpacity="0.1" />
      {/* Tree line at horizon */}
      <path d="M10.5 4 Q11 2.5 11.5 2 Q12 1.5 12.5 2 Q13 2.5 13.5 4" strokeWidth="0.8" fill={color} fillOpacity="0.08" />
      <path d="M9 4.5 Q9.5 3 10 2.5 Q10.5 2 11 2.5" strokeWidth="0.7" />
      <path d="M13 4.5 Q13.5 3 14 2.5 Q14.5 2 15 3" strokeWidth="0.7" />
    </svg>
  );
}

// ─── Cast Icon — Fly rod mid-cast with line loop ───────────────────────────────
export function CastIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Fly cast"
    >
      {/* Rod — thin, tapered */}
      <path d="M19 22 L6 8" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 8 L4.5 6.5" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 6.5 L3.5 5.2" strokeWidth="0.9" strokeLinecap="round" />
      {/* Reel seat */}
      <rect x="17" y="19.5" width="3" height="2" rx="0.5" strokeWidth="1" fill={color} fillOpacity="0.1" />
      {/* Guides on rod */}
      <circle cx="15" cy="17" r="0.6" strokeWidth="0.9" />
      <circle cx="12" cy="13.5" r="0.5" strokeWidth="0.9" />
      <circle cx="9" cy="10.5" r="0.4" strokeWidth="0.8" />
      {/* Fly line loop in the air */}
      <path d="M3.5 5.2 Q0.5 3 2 1 Q5 -0.5 7 2 Q9 4 8 7 Q7 10 5 11"
        strokeWidth="1" strokeDasharray="none" />
      {/* Leader/tippet extending from loop */}
      <path d="M5 11 Q3 13 4 16" strokeWidth="0.7" />
      {/* Fly at end of tippet */}
      <circle cx="4.5" cy="16.5" r="0.7" strokeWidth="0.9" fill={color} fillOpacity="0.2" />
      <path d="M3.8 16 Q4.5 15 5.2 16" strokeWidth="0.7" />
    </svg>
  );
}

// ─── Hatch Icon — Multiple mayflies emerging from water surface ─────────────────
export function HatchIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Hatch"
    >
      {/* Water surface */}
      <path d="M2 16 Q6 14.5 12 15.5 Q18 16.5 22 15" strokeWidth="1.3" />
      {/* Water ripples */}
      <path d="M2 18 Q6 17 12 18 Q18 19 22 17.5" strokeWidth="0.9" />
      <path d="M3 20 Q7 19.5 12 20.5 Q17 21 21 20" strokeWidth="0.8" />
      {/* Emerging mayfly 1 — center */}
      <path d="M12 15.5 L12 10" strokeWidth="0.9" />
      <path d="M12 11 Q9.5 8.5 8.5 6 Q11 8 12 11" strokeWidth="1" fill={color} fillOpacity="0.1" />
      <path d="M12 11 Q14.5 8.5 15.5 6 Q13 8 12 11" strokeWidth="1" fill={color} fillOpacity="0.1" />
      <path d="M11.5 15 L10.5 17.5 M12.5 15 L13.5 17.5 M12 15 L12 17" strokeWidth="0.7" />
      {/* Emerging mayfly 2 — left */}
      <path d="M7 15 L7 11" strokeWidth="0.8" />
      <path d="M7 11.5 Q5.5 9.5 5 7.5 Q6.5 9 7 11.5" strokeWidth="0.9" fill={color} fillOpacity="0.08" />
      <path d="M7 11.5 Q8.5 9.5 9 8 Q7.5 9.5 7 11.5" strokeWidth="0.9" fill={color} fillOpacity="0.08" />
      <path d="M6.5 14.5 L5.5 17 M7.5 14.5 L8.5 17" strokeWidth="0.6" />
      {/* Emerging mayfly 3 — right */}
      <path d="M17 15 L17 11" strokeWidth="0.8" />
      <path d="M17 11.5 Q15.5 9.5 15 7.5 Q16.5 9 17 11.5" strokeWidth="0.9" fill={color} fillOpacity="0.08" />
      <path d="M17 11.5 Q18.5 9.5 19 8 Q17.5 9.5 17 11.5" strokeWidth="0.9" fill={color} fillOpacity="0.08" />
      <path d="M16.5 14.5 L15.5 17 M17.5 14.5 L18.5 17" strokeWidth="0.6" />
      {/* Water surface ripple rings */}
      <ellipse cx="7" cy="15.5" rx="2" ry="0.5" strokeWidth="0.7" strokeOpacity="0.5" />
      <ellipse cx="12" cy="15.5" rx="2.5" ry="0.6" strokeWidth="0.7" strokeOpacity="0.5" />
      <ellipse cx="17" cy="15" rx="2" ry="0.5" strokeWidth="0.7" strokeOpacity="0.5" />
    </svg>
  );
}

// ─── ThermometerWater Icon — Thermometer submerged in water ────────────────────
export function ThermometerWaterIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Water temperature"
    >
      {/* Thermometer tube */}
      <rect x="10.5" y="3" width="3" height="12" rx="1.5" strokeWidth="1.2" fill={color} fillOpacity="0.06" />
      {/* Mercury fill */}
      <rect x="11.2" y="9" width="1.6" height="6.5" rx="0.8" fill={color} fillOpacity="0.35" stroke="none" />
      {/* Bulb */}
      <circle cx="12" cy="16.5" r="2.5" strokeWidth="1.2" fill={color} fillOpacity="0.25" />
      {/* Tick marks */}
      <line x1="10.5" y1="6" x2="9.5" y2="6" strokeWidth="0.9" />
      <line x1="10.5" y1="8" x2="9.5" y2="8" strokeWidth="0.9" />
      <line x1="10.5" y1="10" x2="9.5" y2="10" strokeWidth="0.9" />
      <line x1="10.5" y1="12" x2="9.5" y2="12" strokeWidth="0.9" />
      {/* Water surface */}
      <path d="M2 20 Q5 18.5 8 20 Q11 21.5 14 20 Q17 18.5 22 20" strokeWidth="1.1" />
      <path d="M3 22 Q6 21 9 22 Q12 23 15 22 Q18 21 21 22" strokeWidth="0.8" />
      {/* Water droplets on glass */}
      <path d="M13.5 8 Q14.5 8 14.5 9" strokeWidth="0.7" />
      <path d="M13.5 11 Q14.5 11 14.5 12" strokeWidth="0.7" />
    </svg>
  );
}

// ─── Barometer Icon — Barometer with needle ────────────────────────────────────
export function BarometerIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Barometer"
    >
      {/* Outer case */}
      <circle cx="12" cy="13" r="9" strokeWidth="1.3" fill={color} fillOpacity="0.04" />
      {/* Inner dial ring */}
      <circle cx="12" cy="13" r="7" strokeWidth="0.7" strokeDasharray="1.5,1.5" />
      {/* Pressure scale marks */}
      <line x1="12" y1="6.5" x2="12" y2="8" strokeWidth="1.1" />
      <line x1="17.5" y1="8.5" x2="16.5" y2="9.4" strokeWidth="1.1" />
      <line x1="19.5" y1="14" x2="18" y2="14" strokeWidth="1.1" />
      <line x1="4.5" y1="14" x2="6" y2="14" strokeWidth="1.1" />
      <line x1="6.5" y1="8.5" x2="7.5" y2="9.4" strokeWidth="1.1" />
      {/* Minor ticks */}
      <line x1="14.7" y1="6.7" x2="14.2" y2="7.6" strokeWidth="0.7" />
      <line x1="17.2" y1="11.3" x2="16.2" y2="11.7" strokeWidth="0.7" />
      <line x1="9.3" y1="6.7" x2="9.8" y2="7.6" strokeWidth="0.7" />
      <line x1="6.8" y1="11.3" x2="7.8" y2="11.7" strokeWidth="0.7" />
      {/* Labels: STORMY / FAIR */}
      <text x="5.5" y="17" fontSize="2.2" fill={color} stroke="none" fontFamily="serif">STORM</text>
      <text x="14" y="17" fontSize="2.2" fill={color} stroke="none" fontFamily="serif">FAIR</text>
      {/* Needle — pointing to FAIR (upper right) */}
      <line x1="12" y1="13" x2="16" y2="9" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="12" y1="13" x2="10" y2="15.5" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
      {/* Pivot */}
      <circle cx="12" cy="13" r="1.2" strokeWidth="1" fill={color} fillOpacity="0.3" />
      {/* Crown / mounting ring */}
      <path d="M9 4.5 Q12 3 15 4.5" strokeWidth="1" fill={color} fillOpacity="0.08" />
    </svg>
  );
}

// ─── RiverDrop Icon — Water droplet with river inside ─────────────────────────
export function RiverDropIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="River drop"
    >
      {/* Droplet outline */}
      <path d="M12 3 Q7 9 7 14 A5 5 0 0 0 17 14 Q17 9 12 3 Z"
        strokeWidth="1.3" fill={color} fillOpacity="0.08" />
      {/* River lines inside drop */}
      <path d="M9 16 Q10.5 14 12 15 Q13.5 16 15 14" strokeWidth="0.9" strokeOpacity="0.7" />
      <path d="M9 14 Q10.5 12.5 12 13.5 Q13.5 14.5 15 12.5" strokeWidth="0.9" strokeOpacity="0.7" />
      <path d="M9.5 17.5 Q11 16 12 17 Q13 18 14.5 16.5" strokeWidth="0.8" strokeOpacity="0.6" />
      {/* Inner highlight */}
      <path d="M10 9 Q9 12 9 13" strokeWidth="0.8" strokeOpacity="0.4" />
    </svg>
  );
}

// ─── Compass Rose Icon — Navigation compass for maps ──────────────────────────
export function CompassRoseIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Compass"
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.1" fill={color} fillOpacity="0.03" />
      {/* Cardinal points — N */}
      <path d="M12 3 L10.5 7 L12 6.5 L13.5 7 Z" strokeWidth="0.8" fill={color} fillOpacity="0.8" />
      {/* Cardinal points — S */}
      <path d="M12 21 L10.5 17 L12 17.5 L13.5 17 Z" strokeWidth="0.8" fill={color} fillOpacity="0.3" />
      {/* Cardinal points — E */}
      <path d="M21 12 L17 10.5 L17.5 12 L17 13.5 Z" strokeWidth="0.8" fill={color} fillOpacity="0.3" />
      {/* Cardinal points — W */}
      <path d="M3 12 L7 10.5 L6.5 12 L7 13.5 Z" strokeWidth="0.8" fill={color} fillOpacity="0.3" />
      {/* Ordinal points */}
      <line x1="12" y1="4" x2="18" y2="6" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="18" y1="6" x2="20" y2="12" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="18" y1="18" x2="12" y2="20" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="6" y1="18" x2="4" y2="12" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="12" y1="4" x2="6" y2="6" strokeWidth="0.7" strokeOpacity="0.4" />
      {/* Inner ring */}
      <circle cx="12" cy="12" r="3" strokeWidth="0.9" />
      {/* Center pivot */}
      <circle cx="12" cy="12" r="1.2" strokeWidth="0.9" fill={color} fillOpacity="0.3" />
      {/* N label */}
      <text x="10.7" y="2.5" fontSize="2.5" fill={color} stroke="none" fontFamily="serif" fontWeight="bold">N</text>
    </svg>
  );
}

// ─── Creel Icon — Wicker fishing creel/basket ─────────────────────────────────
export function CreelIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Fishing creel"
    >
      {/* Creel body */}
      <path d="M5 10 Q4 14 4 17 Q4 20 12 20.5 Q20 20 20 17 Q20 14 19 10 Z"
        strokeWidth="1.2" fill={color} fillOpacity="0.06" />
      {/* Lid */}
      <path d="M5 10 Q6 7 12 7 Q18 7 19 10" strokeWidth="1.2" fill={color} fillOpacity="0.1" />
      {/* Opening hole in lid */}
      <ellipse cx="12" cy="8.5" rx="3" ry="1.2" strokeWidth="0.9" fill={color} fillOpacity="0.15" />
      {/* Wicker weave pattern — horizontal */}
      <path d="M5.5 12 Q9 11.5 12 12 Q15 12.5 18.5 12" strokeWidth="0.7" />
      <path d="M5 14.5 Q9 14 12 14.5 Q15 15 19 14.5" strokeWidth="0.7" />
      <path d="M4.5 17 Q8.5 16.5 12 17 Q15.5 17.5 19.5 17" strokeWidth="0.7" />
      {/* Wicker weave — vertical */}
      <path d="M8 10 Q7.5 14 7.5 18.5" strokeWidth="0.7" />
      <path d="M12 10 Q12 14 12 19" strokeWidth="0.7" />
      <path d="M16 10 Q16.5 14 16.5 18.5" strokeWidth="0.7" />
      <path d="M10 10 Q9.5 14 9.5 19" strokeWidth="0.7" />
      <path d="M14 10 Q14.5 14 14.5 19" strokeWidth="0.7" />
      {/* Shoulder strap */}
      <path d="M5 10 Q2 7 3 4 Q5 2 7 4 Q8 5 7 6.5" strokeWidth="1" />
      {/* Buckle */}
      <rect x="4" y="4" width="2" height="1.5" rx="0.3" strokeWidth="0.9" />
    </svg>
  );
}

// ─── Wader Icon — Boot/wader silhouette ───────────────────────────────────────
export function WaderIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Waders"
    >
      {/* Left wader */}
      <path d="M5 2 L5 13 Q5 15 4 17 Q3 19 3 21 L8 21 Q8 19 9 17 Q10 15 10 13 L10 2 Z"
        strokeWidth="1.2" fill={color} fillOpacity="0.07" />
      {/* Left boot */}
      <path d="M3 21 Q2 22 2 23 L10 23 Q10 22 9 21" strokeWidth="1.1" fill={color} fillOpacity="0.15" />
      {/* Right wader */}
      <path d="M14 2 L14 13 Q14 15 15 17 Q16 19 16 21 L21 21 Q21 19 21 17 Q20 15 19 13 L19 2 Z"
        strokeWidth="1.2" fill={color} fillOpacity="0.07" />
      {/* Right boot */}
      <path d="M16 21 Q15 22 15 23 L23 23 Q23 22 22 21" strokeWidth="1.1" fill={color} fillOpacity="0.15" />
      {/* Waistband / bib */}
      <path d="M5 2 Q7.5 0.5 10 2" strokeWidth="1.1" />
      <path d="M14 2 Q16.5 0.5 19 2" strokeWidth="1.1" />
      {/* Suspender strap hint */}
      <path d="M7.5 2 Q12 1 16.5 2" strokeWidth="0.8" strokeDasharray="1.5,1" />
      {/* Seam lines */}
      <path d="M7.5 3 L7.5 13" strokeWidth="0.6" strokeDasharray="1,1.5" />
      <path d="M16.5 3 L16.5 13" strokeWidth="0.6" strokeDasharray="1,1.5" />
      {/* Knee patches */}
      <ellipse cx="7.5" cy="9" rx="1.8" ry="1.2" strokeWidth="0.8" fill={color} fillOpacity="0.12" />
      <ellipse cx="16.5" cy="9" rx="1.8" ry="1.2" strokeWidth="0.8" fill={color} fillOpacity="0.12" />
    </svg>
  );
}

// ─── FlyBox Icon — Open fly box with flies ────────────────────────────────────
export function FlyBoxIcon({ size = 24, color = "currentColor", className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label="Fly box"
    >
      {/* Box lid (open, angled back) */}
      <path d="M3 11 L3 4 L21 4 L21 11" strokeWidth="1.2" fill={color} fillOpacity="0.05" />
      <path d="M3 4 Q12 1.5 21 4" strokeWidth="0.9" fill={color} fillOpacity="0.08" />
      {/* Box body */}
      <rect x="3" y="11" width="18" height="11" rx="0.5" strokeWidth="1.2" fill={color} fillOpacity="0.06" />
      {/* Hinge */}
      <line x1="3" y1="11" x2="21" y2="11" strokeWidth="1.1" />
      {/* Foam pad in lid */}
      <rect x="4.5" y="5" width="15" height="5.5" rx="0.3" strokeWidth="0.7" fill={color} fillOpacity="0.07" />
      {/* Flies pinned in lid */}
      <path d="M7 7 Q6 5.5 7.5 5 Q8.5 5.5 8 7" strokeWidth="0.8" />
      <path d="M11 7 Q10 5.5 11.5 5 Q12.5 5.5 12 7" strokeWidth="0.8" />
      <path d="M15 7 Q14 5.5 15.5 5 Q16.5 5.5 16 7" strokeWidth="0.8" />
      {/* Compartment dividers */}
      <line x1="9" y1="12" x2="9" y2="22" strokeWidth="0.7" />
      <line x1="15" y1="12" x2="15" y2="22" strokeWidth="0.7" />
      <line x1="3" y1="16.5" x2="21" y2="16.5" strokeWidth="0.7" />
      {/* Flies in compartments */}
      <path d="M5.5 14 Q6 13 6.5 14" strokeWidth="0.9" />
      <circle cx="6" cy="14.5" r="0.4" fill={color} fillOpacity="0.5" />
      <path d="M11.5 14 Q12 13 12.5 14" strokeWidth="0.9" />
      <circle cx="12" cy="14.5" r="0.4" fill={color} fillOpacity="0.5" />
      <path d="M17.5 14 Q18 13 18.5 14" strokeWidth="0.9" />
      <circle cx="18" cy="14.5" r="0.4" fill={color} fillOpacity="0.5" />
      <path d="M5.5 19 Q6 18 6.5 19" strokeWidth="0.9" />
      <path d="M11.5 19 Q12 18 12.5 19" strokeWidth="0.9" />
      <path d="M17.5 19 Q18 18 18.5 19" strokeWidth="0.9" />
      {/* Latch */}
      <rect x="10.5" y="10.5" width="3" height="1.5" rx="0.5" strokeWidth="0.9" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

// ─── Saltwater Icons ────────────────────────────────────────────────────────

export function TarponIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Tarpon"
    >
      {/* Body */}
      <path d="M2 12 C4 7 9 5 14 6 C18 7 21 9.5 22 12 C21 14.5 18 17 14 18 C9 19 4 17 2 12Z" />
      {/* Tail fork */}
      <path d="M2 12 L-1 8" />
      <path d="M2 12 L-1 16" />
      {/* Dorsal fin */}
      <path d="M10 6 C11 3 13 2.5 14 3 C14.5 4 14 5.5 14 6" />
      {/* Pectoral fin */}
      <path d="M13 10 C15 8.5 17 8.5 17 10" />
      {/* Scale line */}
      <path d="M8 9 C10 8.5 13 8.5 15 9.5" strokeWidth="0.75" />
      <path d="M7 12 C10 11.5 14 11.5 17 12" strokeWidth="0.75" />
      {/* Eye */}
      <circle cx="18.5" cy="11" r="1" />
      <circle cx="18.5" cy="11" r="0.3" fill="currentColor" />
      {/* Mouth */}
      <path d="M22 12 L23 11.5" />
    </svg>
  );
}

export function BonefishIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Bonefish"
    >
      {/* Slim torpedo body */}
      <path d="M3 12 C5 8 9 6.5 14 7 C18 7.5 21 9.5 22 12 C21 14.5 18 16.5 14 17 C9 17.5 5 16 3 12Z" />
      {/* Forked tail */}
      <path d="M3 12 L0 9" />
      <path d="M3 12 L0 15" />
      {/* Dorsal fin — tall and pointed */}
      <path d="M11 7 C12 4 13.5 3 14 3.5 C14.5 4.5 14 6 14 7" />
      {/* Lateral stripe */}
      <path d="M6 11 C10 10.5 15 10.5 19 11.5" strokeWidth="0.75" />
      {/* Eye */}
      <circle cx="19.5" cy="11" r="0.9" />
      <circle cx="19.5" cy="11" r="0.3" fill="currentColor" />
      {/* Pointed snout */}
      <path d="M22 12 L24 11.5" />
    </svg>
  );
}

export function ReddrumIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Redfish"
    >
      {/* Stocky body */}
      <path d="M2 13 C3 8 8 5.5 13 6 C17.5 6.5 21 9 22 12.5 C21 16 17.5 18.5 13 19 C8 19.5 3 17 2 13Z" />
      {/* Tail — squared/rounded (redfish style) */}
      <path d="M2 13 L-0.5 10" />
      <path d="M2 13 L-0.5 16" />
      <path d="M-0.5 10 L-0.5 16" />
      {/* Dorsal fin */}
      <path d="M9 6 C10 3.5 12 3 13 3.5 C13.5 4.5 13 5.5 13 6" />
      {/* Tail spot — signature redfish marking */}
      <circle cx="4" cy="14" r="1.5" />
      {/* Lateral line */}
      <path d="M6 12 C10 11 15 11 19 12.5" strokeWidth="0.75" />
      {/* Eye */}
      <circle cx="19.5" cy="11.5" r="1" />
      <circle cx="19.5" cy="11.5" r="0.35" fill="currentColor" />
    </svg>
  );
}

export function ShrimpIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Shrimp"
    >
      {/* Curved body segments */}
      <path d="M5 18 C4 15 5 12 7 10 C9 8 11 7.5 13 8 C15 8.5 16.5 10 16 12 C15.5 14 14 15 12 15.5 C10 16 8 15.5 7 14" />
      {/* Tail fan */}
      <path d="M5 18 L3 20" />
      <path d="M5 18 L4 21" />
      <path d="M5 18 L6 21" />
      {/* Antennae */}
      <path d="M16 12 L20 9" strokeWidth="0.9" />
      <path d="M16 12 L19 7" strokeWidth="0.9" />
      {/* Walking legs */}
      <path d="M10 12 L8 14" strokeWidth="0.9" />
      <path d="M11 11 L10 13.5" strokeWidth="0.9" />
      <path d="M12.5 10.5 L12 13" strokeWidth="0.9" />
      {/* Eye */}
      <circle cx="15.5" cy="10" r="0.8" />
    </svg>
  );
}

export function CrabIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Crab"
    >
      {/* Oval body */}
      <ellipse cx="12" cy="13" rx="5" ry="3.5" />
      {/* Claws */}
      <path d="M7 13 C5 12 3.5 10.5 3 9 C3.5 8 4.5 8 5 8.5 C5.5 7.5 6.5 7.5 7 8 C7.5 8.5 7.5 10 7 11" />
      <path d="M17 13 C19 12 20.5 10.5 21 9 C20.5 8 19.5 8 19 8.5 C18.5 7.5 17.5 7.5 17 8 C16.5 8.5 16.5 10 17 11" />
      {/* Walking legs left */}
      <path d="M8.5 14 L6 16" strokeWidth="0.9" />
      <path d="M8 15 L5.5 17.5" strokeWidth="0.9" />
      <path d="M8.5 16 L7 18.5" strokeWidth="0.9" />
      {/* Walking legs right */}
      <path d="M15.5 14 L18 16" strokeWidth="0.9" />
      <path d="M16 15 L18.5 17.5" strokeWidth="0.9" />
      <path d="M15.5 16 L17 18.5" strokeWidth="0.9" />
      {/* Eyes on stalks */}
      <line x1="10.5" y1="9.5" x2="10" y2="8" />
      <circle cx="10" cy="7.5" r="0.6" />
      <line x1="13.5" y1="9.5" x2="14" y2="8" />
      <circle cx="14" cy="7.5" r="0.6" />
    </svg>
  );
}

export function StriperIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Striped Bass"
    >
      {/* Deep body */}
      <path d="M2 12 C4 7 9 5 13.5 5.5 C18 6 21.5 8.5 22.5 12 C21.5 15.5 18 18 13.5 18.5 C9 19 4 17 2 12Z" />
      {/* Forked tail */}
      <path d="M2 12 L-0.5 8.5" />
      <path d="M2 12 L-0.5 15.5" />
      {/* Spiny dorsal fin */}
      <path d="M9 5.5 L9 3" />
      <path d="M10.5 5.2 L10.5 2.5" />
      <path d="M12 5 L12 2" />
      <path d="M13 5.5 L13 2.5" />
      <path d="M9 3 C10 2.5 12 2 13 2.5" />
      {/* Horizontal stripes — signature marking */}
      <path d="M5 10 C9 9.5 15 9.5 20 10.5" strokeWidth="0.8" />
      <path d="M4 12 C8 11.5 15 11.5 20.5 12.5" strokeWidth="0.8" />
      <path d="M5 14 C9 13.5 15 13.5 20 14.5" strokeWidth="0.8" />
      {/* Eye */}
      <circle cx="19.5" cy="10.5" r="1.1" />
      <circle cx="19.5" cy="10.5" r="0.4" fill="currentColor" />
      {/* Jaw */}
      <path d="M22.5 12 L24 12.5" />
    </svg>
  );
}
