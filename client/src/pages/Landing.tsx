// Landing page — Flydentify Heritage Design System v1.0
// Fool the Fish. · Navy Chrome · Cormorant + Inter + Cinzel

import React, { useState, useRef, useEffect } from "react";
import { Check, ArrowRight, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImg from "@assets/flydentify_logo.png";

// ── Video assets ───────────────────────────────────────────────────────────────
import fwHeroVid from "@assets/videos/fw_hero_new.mp4";
import fwHeroVidMobile from "@assets/videos/fw_hero_new_mobile.mp4";

// ── Image assets ───────────────────────────────────────────────────────────────
import flyMacroImg from "@assets/fly_macro.png";
import hatchImg from "@assets/hatch_underwater.png";

// ── Heritage Design Tokens ─────────────────────────────────────────────────────
const T = {
  // Navy Chrome (header, footer, cinematic blocks)
  navy900: "#060D1A",
  navy800: "#0D1B33",
  navy700: "#142446",

  // Freshwater — Heritage Khaki
  fwCanvas: "#EFE8D7",   // page bg
  fwCream:  "#F7F1E2",   // card bg
  fwInk:    "#2F2B1E",   // body text
  fwAccent: "#6B7A4B",   // olive highlights
  fwWarm:   "#A67A3A",   // saddle tan

  // Saltwater — Coastal Blue
  swCanvas: "#EEF2F4",
  swCream:  "#FFFFFF",
  swInk:    "#1A2A38",
  swAccent: "#3D6B83",
  swWarm:   "#B09A72",

  // Card border
  line: "#CDBF9C",
};

// ── Font helpers ───────────────────────────────────────────────────────────────
// Cormorant Garamond = editorial serif (headings, hero, stats)
// Inter = body + UI
// Cinzel = micro-caps, eyebrows, tags (Copperplate CC substitute — same opentype category)

const EDITORIAL = "'Cormorant Garamond', Georgia, serif";
const BODY      = "'Inter', system-ui, sans-serif";
const CAPS      = "'Cinzel', 'Copperplate', serif";

// ── Eyebrow component ──────────────────────────────────────────────────────────
function Eyebrow({ children, light = false, color }: { children: React.ReactNode; light?: boolean; color?: string }) {
  return (
    <p style={{
      fontFamily: CAPS,
      fontSize: 13,
      letterSpacing: "0.24em",
      textTransform: "uppercase",
      color: color ?? (light ? "rgba(245,230,204,0.65)" : T.fwAccent),
      marginBottom: 16,
      lineHeight: 1.4,
    }}>
      {children}
    </p>
  );
}

// ── Chapter mark ──────────────────────────────────────────────────────────────
function ChapterMark({ numeral, label, light = false }: { numeral: string; label: string; light?: boolean }) {
  const inkColor = light ? "rgba(245,230,204,0.85)" : T.fwInk;
  const lineColor = light ? "rgba(245,230,204,0.18)" : T.line;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
      <span style={{ fontFamily: EDITORIAL, fontStyle: "italic", fontSize: 22, color: inkColor, lineHeight: 1 }}>
        {numeral}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
      <span style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.26em", textTransform: "uppercase", color: light ? "rgba(245,230,204,0.5)" : "rgba(47,43,30,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

// ── Pill button — Copperplate micro-caps style ─────────────────────────────────
function PillBtn({
  href, onClick, filled = true, accent, children, small = false
}: {
  href?: string;
  onClick?: () => void;
  filled?: boolean;
  accent: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: CAPS,
    fontSize: small ? 10 : 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    padding: small ? "8px 20px" : "14px 32px",
    borderRadius: 999,
    border: filled ? "none" : `1px solid ${accent}`,
    backgroundColor: filled ? accent : "transparent",
    color: filled ? "#fff" : accent,
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity 0.18s",
    boxShadow: filled ? "0 4px 16px rgba(0,0,0,0.22)" : "none",
    whiteSpace: "nowrap",
  };
  if (href) return <a href={href} style={style} onMouseOver={e => (e.currentTarget.style.opacity = "0.82")} onMouseOut={e => (e.currentTarget.style.opacity = "1")}>{children}</a>;
  return <button onClick={onClick} style={style} onMouseOver={e => (e.currentTarget.style.opacity = "0.82")} onMouseOut={e => (e.currentTarget.style.opacity = "1")}>{children}</button>;
}

// ── App Store badge ────────────────────────────────────────────────────────────
const APP_URL = "https://apps.apple.com/us/app/flydentify";

function AppleBadge({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const bg = dark ? "#fff" : T.navy800;
  const fg = dark ? T.navy800 : "#fff";
  if (compact) {
    return (
      <a href={APP_URL} target="_blank" rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 999,
          backgroundColor: bg, color: fg,
          fontFamily: CAPS, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase",
          textDecoration: "none", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={fg}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        Try the App
      </a>
    );
  }
  return (
    <a href={APP_URL} target="_blank" rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "14px 28px", borderRadius: 999, minWidth: 220,
        backgroundColor: bg, color: fg,
        textDecoration: "none", whiteSpace: "nowrap",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
        fontFamily: CAPS, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
        fontWeight: 600,
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fg} style={{ flexShrink: 0 }}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      Try the App
    </a>
  );
}

// ── Card component ─────────────────────────────────────────────────────────────
function FeatureCard({ eyebrow, title, body, light = false }: { eyebrow?: string; title: string; body: string; light?: boolean }) {
  const bg = light ? T.navy700 : T.fwCream;
  const border = light ? "rgba(255,255,255,0.08)" : T.line;
  const titleColor = light ? "#F7F1E2" : T.fwInk;
  const bodyColor = light ? "rgba(245,230,204,0.62)" : "rgba(47,43,30,0.65)";
  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: 24,
    }}>
      {eyebrow && (
        <p style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.24em", textTransform: "uppercase", color: light ? "rgba(245,230,204,0.45)" : T.fwAccent, marginBottom: 10 }}>
          {eyebrow}
        </p>
      )}
      <h3 style={{ fontFamily: EDITORIAL, fontSize: "clamp(1.25rem,2.5vw,1.6rem)", color: titleColor, marginBottom: 10, fontWeight: 500, lineHeight: 1.2 }}>
        {title}
      </h3>
      <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: bodyColor }}>
        {body}
      </p>
    </div>
  );
}

// ── Main Landing ───────────────────────────────────────────────────────────────
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const fwVidRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: T.fwCanvas, color: T.fwInk, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        html { scroll-padding-top: 72px; }
        * { box-sizing: border-box; }
        img { max-width: 100%; }
        .hidden-mobile-nav { display: flex; }
        @media (max-width: 639px) { .hidden-mobile-nav { display: none; } }
      `}</style>

      {/* ── NAV — Navy chrome, fixed ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 20px 8px",
        background: "#0D1B33",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Logo centered */}
        <a href="/#/" style={{ textDecoration: "none", display: "block", marginBottom: 6 }}>
          <img
            src={logoImg}
            alt="Flydentify"
            style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", display: "block" }}
          />
        </a>
        {/* Nav row below logo — links hidden on mobile, badge always visible */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, paddingBottom: 4, flexWrap: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hidden-mobile-nav">
            <a href="/#/finder" style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", textDecoration: "none", whiteSpace: "nowrap" }}>The App</a>
            <a href="/#/hatch-chart" style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", textDecoration: "none", whiteSpace: "nowrap" }}>Hatch</a>
            <a href="/#/rigging" style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", textDecoration: "none", whiteSpace: "nowrap" }}>Rigging</a>
            <a href="/#/pricing" style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A67A3A", textDecoration: "none", whiteSpace: "nowrap" }}>Subscribe</a>
          </div>
          <AppleBadge compact />
        </div>
      </nav>

      {/* ── HERO ── Full-screen video, navy gradient, editorial type ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* Video */}
        <video
          ref={fwVidRef}
          autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        >
          <source src={fwHeroVidMobile} media="(max-width: 639px)" type="video/mp4" />
          <source src={fwHeroVid} type="video/mp4" />
        </video>

        {/* Cinematic scrim — dark bottom for type legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(6,13,26,0.42) 0%, rgba(6,13,26,0.18) 45%, rgba(6,13,26,0.72) 100%)",
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "140px 24px 80px",
          maxWidth: 780, margin: "0 auto",
          width: "100%",
        }}>

          {/* Hero headline — Cormorant, large */}
          <h1 style={{
            fontFamily: EDITORIAL,
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 500,
            lineHeight: 1.05,
            color: "#fff",
            textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            marginBottom: 20,
          }}>
            Fool the Fish.
          </h1>

          {/* Sub-tagline */}
          <p style={{
            fontFamily: BODY,
            fontSize: 17,
            color: "rgba(245,230,204,0.8)",
            lineHeight: 1.6,
            marginBottom: 48,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            Real-time hatch matching. GPS-matched fly patterns. Every rig, every knot, every water.
          </p>

          {/* CTA pair — App Store (navy) + See how it works (outline navy) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 64, padding: "0 16px" }}>
            <AppleBadge compact={false} dark={false} />
            <a href="/#/finder"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "14px 28px", borderRadius: 999, minWidth: 220,
                backgroundColor: "#fff", color: "#0D1B33",
                textDecoration: "none", whiteSpace: "nowrap",
                boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
                fontFamily: CAPS, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                fontWeight: 600,
              }}>
              See how it works
            </a>
          </div>

          {/* Hairline rule + stat row */}
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ height: 1, backgroundColor: "rgba(245,230,204,0.2)", marginBottom: 32 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { num: "32+", label: "Fly patterns" },
                { num: "Live", label: "Real-time data" },
                { num: "50", label: "States" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: EDITORIAL, fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 500, color: "#F7F1E2", lineHeight: 1, marginBottom: 6 }}>
                    {s.num}
                  </div>
                  <div style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,230,204,0.55)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.55 }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${T.fwWarm}, transparent)` }} />
          <span style={{ fontFamily: CAPS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(245,230,204,0.7)" }}>Scroll</span>
        </div>
      </section>

      {/* ── SECTION I — Navy dark: Why anglers switch ── */}
      <section style={{ backgroundColor: T.navy900, padding: "96px 40px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ChapterMark numeral="I" label="Why anglers switch" light />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "48px 0" : "80px 64px" }}>
            {[
              {
                num: "01",
                title: "Read the water right now",
                body: "Weather, USGS gauge data, and iNaturalist insect sightings fuse into one answer. Not last season. Not the forum from 2019. Right now.",
              },
              {
                num: "02",
                title: "Matched to your water",
                body: "GPS detects your river, flat, or coastline and tailors every pattern, weight, and presentation to that watershed this week.",
              },
              {
                num: "03",
                title: "Rigged, not just named",
                body: "Every fly comes with the full setup: rod weight, line, leader, tippet, and the knot for that connection. No guesswork from the bank.",
              },
              {
                num: "04",
                title: "Freshwater and saltwater",
                body: "Trout, bass, tarpon, permit, redfish, bonefish. Thirty-two patterns across both worlds. One app for all of it.",
              },
            ].map(item => (
              <div key={item.num}>
                <div style={{ fontFamily: EDITORIAL, fontStyle: "italic", fontSize: "clamp(2.5rem,5vw,4rem)", color: T.fwWarm, opacity: 0.35, lineHeight: 1, marginBottom: 16 }}>
                  {item.num}
                </div>
                <h3 style={{ fontFamily: EDITORIAL, fontSize: "clamp(1.4rem,2.5vw,1.9rem)", color: "#F7F1E2", fontWeight: 500, marginBottom: 12, lineHeight: 1.2 }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65, color: "rgba(245,230,204,0.6)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION II — FW Canvas: The Science ── */}
      <section style={{ backgroundColor: T.fwCanvas, padding: "96px 40px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ChapterMark numeral="II" label="The science of the hatch" />

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 48, alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: EDITORIAL, fontSize: "clamp(2rem,4.5vw,3.2rem)", color: T.fwInk, fontWeight: 500, lineHeight: 1.1, marginBottom: 20 }}>
                Every cast backed<br />by real data.
              </h2>
              <p style={{ fontFamily: BODY, fontSize: 17, color: "rgba(47,43,30,0.7)", lineHeight: 1.65, marginBottom: 32, maxWidth: 420 }}>
                Flydentify is not a pattern library. It's a decision engine that reads the water and tells you exactly what to tie on.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "NOAA weather + barometric pressure",
                  "USGS stream flow and temperature",
                  "iNaturalist research-grade insect sightings",
                  "GPS-matched regional hatch calendars",
                  "Open-Meteo marine and freshwater models",
                ].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <Check size={13} style={{ color: T.fwAccent, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontFamily: BODY, fontSize: 15, color: "rgba(47,43,30,0.75)" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <AppleBadge compact={false} dark={true} />
            </div>

            {/* Editorial image: hidden on mobile to prevent overlap */}
            {!isMobile ? (
              <div style={{ position: "relative" }}>
                <div style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${T.line}`,
                  aspectRatio: "4/5",
                }}>
                  <img
                    src={hatchImg}
                    alt="Underwater hatch - real-time data"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{
                  position: "absolute",
                  bottom: -20, left: -20,
                  backgroundColor: T.fwCream,
                  border: `1px solid ${T.line}`,
                  borderRadius: 16,
                  padding: "18px 24px",
                  boxShadow: "0 8px 32px rgba(47,43,30,0.14)",
                  minWidth: 160,
                }}>
                  <p style={{ fontFamily: CAPS, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: T.fwAccent, marginBottom: 6 }}>
                    Matching now
                  </p>
                  <p style={{ fontFamily: EDITORIAL, fontSize: "1.5rem", color: T.fwInk, fontWeight: 500, lineHeight: 1, marginBottom: 4 }}>
                    Blue Wing Olive
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(47,43,30,0.55)" }}>Emerger, size 18-20</p>
                  <p style={{ fontFamily: EDITORIAL, fontStyle: "italic", fontSize: "1.8rem", color: T.fwWarm, fontWeight: 500, marginTop: 8 }}>
                    92%
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── SECTION III — Navy: App preview / phone mockup ── */}
      <section style={{ backgroundColor: T.navy800, padding: "96px 40px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ChapterMark numeral="III" label="In the app" light />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 64, alignItems: "center" }}>

            {/* Phone mockup */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 220 }}>
                <div style={{
                  borderRadius: 36, overflow: "hidden",
                  border: "6px solid #1a2244",
                  aspectRatio: "9/19.5",
                  backgroundColor: "#000",
                  boxShadow: "0 32px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(166,122,58,0.25)",
                }}>
                  <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 72, height: 22, backgroundColor: "#0D1B33", borderRadius: "0 0 12px 12px", zIndex: 2 }} />
                  <video autoPlay muted loop playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                    ref={el => { if (el) { el.playbackRate = 0.75; } }}>
                    <source src={fwHeroVidMobile} type="video/mp4" />
                  </video>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
                </div>
                {/* Ambient glow */}
                <div style={{ position: "absolute", inset: 0, zIndex: -1, borderRadius: "50%", backgroundColor: T.fwWarm, filter: "blur(48px)", opacity: 0.18, transform: "scale(0.7) translateY(20%)" }} />
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FeatureCard
                eyebrow="Hatch intelligence"
                title="Real-time hatch matching"
                body="NOAA, USGS, and iNaturalist triangulate what is hatching on your water right now. Not last season."
                light
              />
              <FeatureCard
                eyebrow="GPS · Your water"
                title="Patterns matched to your region"
                body="GPS locates your watershed and surfaces the exact flies, weights, and presentations for this week."
                light
              />
              <FeatureCard
                eyebrow="Rigging guides"
                title="Every fly, fully rigged"
                body="Rod, reel, line, leader, tippet, and knot. Every pattern arrives with the complete rig."
                light
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION IV — FW Canvas: Fly macro / editorial image ── */}
      <section style={{ backgroundColor: T.fwCanvas, padding: "96px 40px", borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ order: isMobile ? 0 : 2 }}>
            <ChapterMark numeral="IV" label="The patterns" />
            <h2 style={{ fontFamily: EDITORIAL, fontSize: "clamp(2rem,4vw,3rem)", color: T.fwInk, fontWeight: 500, lineHeight: 1.1, marginBottom: 20 }}>
              Freshwater and saltwater, covered.
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: "rgba(47,43,30,0.7)", marginBottom: 32, maxWidth: 400 }}>
              Thirty-two patterns across trout, bass, tarpon, permit, redfish, and bonefish. Both worlds. One app. Every rig detailed to the last knot.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px", marginBottom: 40 }}>
              {[
                ["21", "Freshwater species"],
                ["28", "Saltwater species"],
                ["32+", "Fly patterns"],
                ["50", "States covered"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: EDITORIAL, fontSize: "clamp(1.8rem,3vw,2.5rem)", color: T.fwWarm, fontWeight: 500, lineHeight: 1 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(47,43,30,0.5)", marginTop: 4 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <AppleBadge compact={false} dark={true} />
          </div>

          <div style={{ order: isMobile ? 1 : 1, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.line}`, aspectRatio: "1/1" }}>
            <img
              src={flyMacroImg}
              alt="Dry fly — precision rigging"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION V — Navy: Pricing teaser ── */}
      <section style={{ backgroundColor: T.navy900, padding: "96px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <ChapterMark numeral="V" label="Simple pricing" light />
          <h2 style={{ fontFamily: EDITORIAL, fontSize: "clamp(2rem,4.5vw,3.2rem)", color: "#F7F1E2", fontWeight: 500, lineHeight: 1.15, marginBottom: 16 }}>
            Start free. Stay as long as the fish are biting.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 15, color: "rgba(245,230,204,0.55)", lineHeight: 1.6, marginBottom: 56 }}>
            7-day free trial on every plan. No credit card required to start.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24, marginBottom: 48 }}>
            {[
              { label: "Monthly", price: "$6.99", period: "/mo", note: "7-day free trial", featured: false },
              { label: "Annual", price: "$39.99", period: "/yr", note: "Just $3.33/mo · save 52%", featured: true },
            ].map(plan => (
              <div key={plan.label} style={{
                backgroundColor: plan.featured ? "rgba(166,122,58,0.10)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${plan.featured ? "rgba(166,122,58,0.45)" : "rgba(255,255,255,0.09)"}`,
                borderRadius: 16,
                padding: "36px 24px",
                position: "relative",
                overflow: "hidden",
              }}>
                {plan.featured && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: T.fwWarm }} />
                )}
                <p style={{ fontFamily: CAPS, fontSize: 13, letterSpacing: "0.24em", textTransform: "uppercase", color: plan.featured ? T.fwWarm : "rgba(245,230,204,0.4)", marginBottom: 16 }}>
                  {plan.label}{plan.featured && " · Best value"}
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: EDITORIAL, fontSize: "3.5rem", fontWeight: 500, color: "#F7F1E2", lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontFamily: BODY, fontSize: 14, color: "rgba(245,230,204,0.45)", paddingBottom: 8 }}>{plan.period}</span>
                </div>
                <p style={{ fontFamily: BODY, fontSize: 13, color: "rgba(245,230,204,0.45)", fontStyle: "italic" }}>{plan.note}</p>
              </div>
            ))}
          </div>

          <PillBtn href="/#/pricing" filled accent={T.navy800}>
            See full pricing <ChevronRight size={14} />
          </PillBtn>
        </div>
      </section>

      {/* ── SECTION VI — FW Canvas: Bottom CTA ── */}
      <section style={{ backgroundColor: T.fwCream, padding: "96px 40px", borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Coming to iOS</Eyebrow>
          <h2 style={{ fontFamily: EDITORIAL, fontSize: "clamp(2rem,4.5vw,3.2rem)", color: T.fwInk, fontWeight: 500, lineHeight: 1.1, marginBottom: 16 }}>
            Fool the Fish,<br />starting day one.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 17, color: "rgba(47,43,30,0.65)", lineHeight: 1.65, marginBottom: 48 }}>
            Subscribe in year one and lock in your Founding Member rate. First access to every new feature, forever.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AppleBadge dark />
          </div>
          <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(47,43,30,0.4)", marginTop: 20 }}>
            Coming soon to iOS. Android in 2027.
          </p>
        </div>
      </section>

      {/* ── FOOTER — Navy 900 ── */}
      <footer style={{ backgroundColor: "#0D1B33", padding: "48px 24px", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
            <img src={logoImg} alt="Flydentify" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", display: "block", margin: "0 auto 16px" }} />

          </div>

          {/* Links */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 40 }}>
            {[
              ["Pricing", "/#/pricing"],
              ["The App", "/#/finder"],
              ["Rigging", "/#/rigging"],
              ["Hatch Chart", "/#/hatch-chart"],
            ].map(([label, href]) => (
              <a key={label} href={href} style={{ fontFamily: CAPS, fontSize: 15, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,230,204,0.7)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>

          {/* Data sources */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, textAlign: "center" }}>
            <p style={{ fontFamily: CAPS, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(245,230,204,0.5)", marginBottom: 20 }}>
              Powered by live data from
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {[
                { label: "USGS NWIS", href: "https://waterservices.usgs.gov" },
                { label: "NOAA Weather", href: "https://api.weather.gov" },
                { label: "NOAA CO-OPS", href: "https://tidesandcurrents.noaa.gov" },
                { label: "iNaturalist", href: "https://www.inaturalist.org" },
                { label: "Open-Meteo", href: "https://open-meteo.com" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: CAPS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,230,204,0.6)", textDecoration: "none", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 999 }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(245,230,204,0.45)", textAlign: "center", marginTop: 32 }}>
            © 2026 Flydentify LLC · Made in Texas
          </p>
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (max-width: 640px) {
          section {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          section > div {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          /* Stats grid in Section IV: keep 2-col since it's just numbers */
          .stats-grid-2col {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
