/**
 * SectionDivider.tsx
 * 
 * Decorative full-width SVG dividers for Flydentify.
 * Field-guide aesthetic — water, flies, rocks, nature motifs.
 */

interface DividerProps {
  className?: string;
}

// ─── River Divider — Water ripple line ────────────────────────────────────────
export function RiverDivider({ className = "" }: DividerProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 32"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 32 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main ripple wave */}
        <path
          d="M0 16 Q40 8 80 16 Q120 24 160 16 Q200 8 240 16 Q280 24 320 16 Q360 8 400 16 Q440 24 480 16 Q520 8 560 16 Q600 24 640 16 Q680 8 720 16 Q760 24 800 16"
          stroke="rgba(167,122,58,0.35)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Secondary ripple — offset */}
        <path
          d="M0 20 Q40 14 80 20 Q120 26 160 20 Q200 14 240 20 Q280 26 320 20 Q360 14 400 20 Q440 26 480 20 Q520 14 560 20 Q600 26 640 20 Q680 14 720 20 Q760 26 800 20"
          stroke="rgba(167,122,58,0.15)"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Faint tertiary */}
        <path
          d="M0 12 Q40 7 80 12 Q120 17 160 12 Q200 7 240 12 Q280 17 320 12 Q360 7 400 12 Q440 17 480 12 Q520 7 560 12 Q600 17 640 12 Q680 7 720 12 Q760 17 800 12"
          stroke="rgba(167,122,58,0.08)"
          strokeWidth="0.6"
          fill="none"
        />
        {/* Small rocks / pebbles breaking the surface */}
        <ellipse cx="120" cy="16" rx="5" ry="2" fill="rgba(167,122,58,0.12)" stroke="rgba(167,122,58,0.3)" strokeWidth="0.7" />
        <ellipse cx="320" cy="16" rx="7" ry="2.5" fill="rgba(167,122,58,0.1)" stroke="rgba(167,122,58,0.25)" strokeWidth="0.7" />
        <ellipse cx="550" cy="16" rx="4" ry="1.8" fill="rgba(167,122,58,0.12)" stroke="rgba(167,122,58,0.3)" strokeWidth="0.7" />
        <ellipse cx="720" cy="16" rx="6" ry="2" fill="rgba(167,122,58,0.08)" stroke="rgba(167,122,58,0.2)" strokeWidth="0.7" />
      </svg>
    </div>
  );
}

// ─── Fly Divider — Centered fly motif with ruled lines ────────────────────────
export function FlyDivider({ className = "" }: DividerProps) {
  return (
    <div className={`w-full flex items-center overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 40 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left ruled line — fades to amber toward center */}
        <line x1="0" y1="20" x2="330" y2="20" stroke="url(#fadeLeft)" strokeWidth="0.9" />
        {/* Right ruled line */}
        <line x1="470" y1="20" x2="800" y2="20" stroke="url(#fadeRight)" strokeWidth="0.9" />
        
        {/* Central fly motif — branded dry fly, NO hook anatomy */}
        {/* Eyelet */}
        <circle cx="388" cy="20" r="2.5" stroke="rgba(167,122,58,0.75)" strokeWidth="1.2" fill="none" />
        {/* Body stub from eyelet to hackle center */}
        <line x1="390.5" y1="20" x2="397" y2="20" stroke="rgba(167,122,58,0.75)" strokeWidth="1.3" />
        {/* Hackle burst — top */}
        <path d="M399 20 Q397 17 395 14" stroke="rgba(167,122,58,0.55)" strokeWidth="0.9" />
        <path d="M401 20 Q400 16.5 400 14.5" stroke="rgba(167,122,58,0.55)" strokeWidth="0.9" />
        <path d="M403 20 Q403 16 404 14" stroke="rgba(167,122,58,0.55)" strokeWidth="0.9" />
        <path d="M405 20 Q406 16.5 408 14.5" stroke="rgba(167,122,58,0.55)" strokeWidth="0.9" />
        {/* Hackle burst — bottom */}
        <path d="M399 20 Q397 23 395 25" stroke="rgba(167,122,58,0.38)" strokeWidth="0.9" />
        <path d="M401 20 Q400 23.5 400 25.5" stroke="rgba(167,122,58,0.38)" strokeWidth="0.9" />
        <path d="M397 17 Q398 20.5 398 22.5" stroke="rgba(167,122,58,0.4)" strokeWidth="0.9" />
        {/* Wings */}
        <path d="M395 17 Q393 13 391 11 Q394.5 12.5 395 17" stroke="rgba(167,122,58,0.6)" strokeWidth="0.9" fill="rgba(167,122,58,0.08)" />
        <path d="M397 17 Q399 13 401 11 Q397.5 12.5 397 17" stroke="rgba(167,122,58,0.6)" strokeWidth="0.9" fill="rgba(167,122,58,0.08)" />
        {/* Tail fibers — right of body (no hook) */}
        <path d="M408 17 L411 15.5 M408 17 L412 17 M408 17 L411 18.5" stroke="rgba(167,122,58,0.45)" strokeWidth="0.7" />

        {/* Small diamond ornaments flanking the fly */}
        <path d="M345 20 L349 17 L353 20 L349 23 Z" stroke="rgba(167,122,58,0.4)" strokeWidth="0.8" fill="rgba(167,122,58,0.06)" />
        <path d="M447 20 L451 17 L455 20 L451 23 Z" stroke="rgba(167,122,58,0.4)" strokeWidth="0.8" fill="rgba(167,122,58,0.06)" />
        
        {/* Tiny ornament dots */}
        <circle cx="360" cy="20" r="1.5" fill="rgba(167,122,58,0.3)" />
        <circle cx="370" cy="20" r="1" fill="rgba(167,122,58,0.2)" />
        <circle cx="440" cy="20" r="1.5" fill="rgba(167,122,58,0.3)" />
        <circle cx="430" cy="20" r="1" fill="rgba(167,122,58,0.2)" />

        <defs>
          <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(167,122,58,0.05)" />
            <stop offset="60%" stopColor="rgba(167,122,58,0.3)" />
            <stop offset="100%" stopColor="rgba(167,122,58,0.55)" />
          </linearGradient>
          <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(167,122,58,0.55)" />
            <stop offset="40%" stopColor="rgba(167,122,58,0.3)" />
            <stop offset="100%" stopColor="rgba(167,122,58,0.05)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Track Divider — Animal track dots (heron, deer, bear paw) ────────────────
export function TrackDivider({ className = "" }: DividerProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 28"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 28 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center horizontal rule */}
        <line x1="0" y1="14" x2="800" y2="14" stroke="rgba(167,122,58,0.12)" strokeWidth="0.7" />

        {/* Heron tracks — left section (elongated bird foot) */}
        {[80, 140, 200].map((x, i) => (
          <g key={`heron-${i}`} transform={`translate(${x}, ${i % 2 === 0 ? 10 : 18})`}>
            <path d="M0 0 L-3 -5 M0 0 L0 -6 M0 0 L3 -5 M0 0 L-2 3"
              stroke="rgba(167,122,58,0.3)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Deer tracks — mid-left (cloven hoof) */}
        {[300, 370, 440].map((x, i) => (
          <g key={`deer-${i}`} transform={`translate(${x}, ${i % 2 === 0 ? 12 : 16})`}>
            <path d="M-2 0 Q-3 -3 -1 -5 Q1 -3 0 0 Z"
              stroke="rgba(167,122,58,0.3)"
              strokeWidth="0.8"
              fill="rgba(167,122,58,0.05)"
            />
            <path d="M2 0 Q1 -3 3 -5 Q5 -3 4 0 Z"
              stroke="rgba(167,122,58,0.3)"
              strokeWidth="0.8"
              fill="rgba(167,122,58,0.05)"
            />
          </g>
        ))}

        {/* Bear paw tracks — right section */}
        {[580, 660, 730].map((x, i) => (
          <g key={`bear-${i}`} transform={`translate(${x}, ${i % 2 === 0 ? 11 : 17})`}>
            <path d="M-5 0 Q-5 -6 0 -6 Q5 -6 5 0 Q5 3 0 4 Q-5 3 -5 0 Z"
              stroke="rgba(167,122,58,0.25)"
              strokeWidth="0.8"
              fill="rgba(167,122,58,0.04)"
            />
            <circle cx="-4" cy="-7" r="1.2" stroke="rgba(167,122,58,0.25)" strokeWidth="0.7" />
            <circle cx="-1.5" cy="-8" r="1.2" stroke="rgba(167,122,58,0.25)" strokeWidth="0.7" />
            <circle cx="1.5" cy="-8" r="1.2" stroke="rgba(167,122,58,0.25)" strokeWidth="0.7" />
            <circle cx="4" cy="-7" r="1.2" stroke="rgba(167,122,58,0.25)" strokeWidth="0.7" />
          </g>
        ))}

        {/* Separator dots between track sections */}
        <circle cx="255" cy="14" r="1.5" fill="rgba(167,122,58,0.2)" />
        <circle cx="520" cy="14" r="1.5" fill="rgba(167,122,58,0.2)" />
      </svg>
    </div>
  );
}
