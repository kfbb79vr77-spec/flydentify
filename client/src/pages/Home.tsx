import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { BookOpen, Calendar, Fish, MapPin, ChevronDown, Leaf, Waves, Menu, X } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { useTrack } from "@/lib/useTrack";
import logoImg from "@assets/flydentify_logo.png";
import flyCastVid from "@assets/videos/fw_hero_new.mp4";
import flyCastVidMobile from "@assets/videos/fw_hero_new_mobile.mp4";
import underwaterTroutVid from "@assets/videos/underwater_trout.mp4";
import riverCurrentVid from "@assets/videos/river_current.mp4";
import swHeroVid from "@assets/videos/sw_hero_v3.mp4";
import swHeroVidMobile from "@assets/videos/sw_hero_v3.mp4";
import swHorizonMagicVid from "@assets/videos/hatch_emergence_sw.mp4";
import hatchEmergenceVid from "@assets/videos/hatch_emergence.mp4";
import hatchUnderwaterImg from "@assets/hatch_underwater.png";
import hatchEmergenceSwVid from "@assets/videos/hatch_emergence_sw.mp4";
import saltwaterFlatsVid from "@assets/videos/sw_hero_v3.mp4";
import swHeroPoster from "@assets/sw_hero_v3_poster.jpg";
import heroDawnImg from "@assets/hero_dawn.png";
import heroOption4Img from "@assets/hero_option_4.png";
import adamsImg from "@assets/flies/adams.png";
import elkHairCaddisImg from "@assets/flies/elk_hair_caddis.png";
import hareEarNymphImg from "@assets/flies/hare_ear_nymph.png";
import parachuteAdamsImg from "@assets/flies/parachute_adams.png";
import woollyBuggerImg from "@assets/flies/woolly_bugger.png";
import bwoImg from "@assets/flies/cdc_bwo.png";

// Saltwater fly imports
import clouserImg from "@assets/flies/saltwater/clouser_minnow_bone.png";
import crazyCharlieImg from "@assets/flies/saltwater/crazy_charlie.png";
import epShrimpImg from "@assets/flies/saltwater/ep_spawning_shrimp.png";
import delBrownImg from "@assets/flies/saltwater/del_brown_permit.png";
import gurglerImg from "@assets/flies/saltwater/gurgler.png";
import tarponToadImg from "@assets/flies/saltwater/tarpon_toad.png";
import borskiSliderImg from "@assets/flies/saltwater/borski_slider.png";
import pmdImg from "@assets/flies/pmd_emerger.png";
import salmonFlyImg from "@assets/insects/salmonfly.png";
import caddisImg from "@assets/insects/caddis.png";

// Species portrait imports — editorial "what's biting now" grid
import rainbowTroutPortrait from "@assets/portraits/fw/fw_plate_14_rainbow_trout.png";
import brownTroutPortrait from "@assets/portraits/fw/fw_plate_05_brown_trout.png";
import cutthroatTroutPortrait from "@assets/portraits/fw/fw_plate_09_cutthroat_trout.png";
import smallmouthBassPortrait from "@assets/portraits/fw/fw_plate_16_smallmouth_bass.png";
import bonefishPortrait from "@assets/portraits/sw/sw_plate_06_bonefish.png";
import permitPortrait from "@assets/portraits/sw/sw_plate_17_permit.png";
import tarponPortrait from "@assets/portraits/sw/sw_plate_01_atlantic_tarpon.png";
import redDrumPortrait from "@assets/portraits/sw/sw_plate_19_red_drum.png";

import { ConditionsCard } from "@/components/ConditionsCard";
import FishingForecast from "@/components/FishingForecast";

// ─── Counter hook for animated number roll-up ──────────────────────────────
function useCountUp(target: number, duration = 2200, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnVisible) {
      setHasStarted(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted, startOnVisible]);

  useEffect(() => {
    if (!hasStarted) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

// ─── Scroll-fade hook ──────────────────────────────────────────────────────
function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Water mode pill toggle ────────────────────────────────────────────────
function WaterModeToggle({
  mode,
  onChange,
}: {
  mode: "fresh" | "salt";
  onChange: (m: "fresh" | "salt") => void;
}) {
  return (
    <div
      className="inline-flex rounded-sm p-0.5"
      style={{ backgroundColor: "rgba(0,0,0,0.08)", border: "1px solid rgba(245,230,204,0.2)", backdropFilter: "blur(4px)" }}
      role="group"
      aria-label="Water type"
    >
      {(["fresh", "salt"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-sm font-['Inter'] uppercase tracking-wider transition-all duration-200 min-h-[32px]"
            style={
              active
                ? {
                    backgroundColor: m === "fresh" ? "#A67A3A" : "#142446",
                    color: "#2F2B1E",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }
                : { color: "rgba(255,255,255,0.75)" }
            }
            data-testid={`toggle-water-${m}-home`}
          >
            {m === "fresh" ? <Leaf size={12} /> : <Waves size={12} />}
            <span className="hidden sm:inline">{m === "fresh" ? "Freshwater" : "Saltwater"}</span>
            <span className="sm:hidden">{m === "fresh" ? "FW" : "SW"}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { waterMode, setWaterMode } = useWaterMode();
  const { track } = useTrack();
  const isSalt = waterMode === "salt";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fixed nav scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track page view on mount
  useEffect(() => {
    track('page_view', { page: 'home' });
  }, []);

  const scrollToContent = () => {
    document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" });
  };

  const quotefade = useScrollFade();
  const { count: riverCount, ref: riverRef } = useCountUp(847);
  const { count: dataCount, ref: dataRef } = useCountUp(2400000);

  // Format 2.4M
  const formatM = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
  };

  const pageBg = isSalt ? "#EEF2F4" : "#EFE8D7";

  const accent = isSalt ? "#3D6B83" : "#A67A3A";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: pageBg, overflowX: "hidden" }}>
      <style>{`html { scroll-padding-top: 68px; }`}</style>

      {/* ══════════════════════════════════════════════════════
          STICKY NAV — fixed, glass blur when scrolled
      ══════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 inset-x-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(13,27,51,0.96)" : "rgba(13,27,51,0.0)",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}
      >
        {/* ── Logo row ── */}
        <div className="flex justify-center px-4 pt-3 pb-1">
          <a href="/#/home" style={{ display: "block", lineHeight: 0 }}>
            <img src={logoImg} alt="Flydentify" className="h-auto w-auto block" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)" }} />
          </a>
        </div>
        {/* ── Nav row: toggle / links / hamburger ── */}
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-14 pb-2.5">
          <WaterModeToggle mode={waterMode} onChange={setWaterMode} />
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <a href="/#/finder" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Finder</a>
            <a href="/#/hatch-chart" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Hatch</a>
            <a href="/#/rigging" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Rigging</a>
            <a href="/#/pricing" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70" style={{ color: "#A67A3A", textDecoration: "none" }}>Subscribe</a>
          </div>
          <button
            className="md:hidden p-2 rounded-sm transition-opacity hover:opacity-70"
            style={{ color: "#fff" }}
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 z-30 sm:hidden py-4 px-5 flex flex-col gap-1"
          style={{
            top: 60,
            background: isSalt ? "rgba(10,24,36,0.97)" : "rgba(6,13,26,0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${isSalt ? "rgba(61,107,131,0.18)" : "rgba(160,118,58,0.18)"}`,
          }}
        >
          {[
            { label: "Finder",     href: "/#/finder" },
            { label: "Hatch chart", href: "/#/hatch-chart" },
            { label: "Rigging",    href: "/#/rigging" },
            { label: "Conditions", href: "/#/conditions" },
            { label: "Trips",      href: "/#/trips" },
            { label: "Pricing",    href: "/#/pricing" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-['Inter'] text-sm uppercase tracking-widest py-3 border-b"
              style={{ color: "rgba(255,255,255,0.85)", borderColor: isSalt ? "rgba(61,107,131,0.12)" : "rgba(160,118,58,0.12)" }}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 1 · Species portraits — editorial grid (now first)
      ══════════════════════════════════════════════════════ */}
      <section className="pt-36 pb-24 sm:pt-40 sm:pb-32" style={{ backgroundColor: pageBg }}>
        <img
          src={hatchUnderwaterImg}
          alt="Nymph ascending through water"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "none" }}
        />
        <div className="absolute inset-0" style={{ background: "none" }} />
        <div className="relative z-10 flex items-center px-6 sm:px-10 lg:px-16 py-24" style={{ minHeight: 520 }}>
          <div>
            <p className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>
              {isSalt ? "Saltwater patterns" : "What's biting right now"}
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl lg:text-6xl leading-tight mb-5" style={{ color: "#F7F1E2", fontWeight: 300, fontStyle: "italic", maxWidth: 600 }}>
              {isSalt
                ? <>The flat goes quiet.<br /><span style={{ color: "#3D6B83" }}>Then the permit tail.</span></>
                : <>What's rising right now.</>}
            </h2>
            <p className="font-['Inter'] text-base leading-relaxed" style={{ color: "rgba(245,230,204,0.72)", maxWidth: 440 }}>
              {isSalt
                ? "Shrimp, crabs, baitfish. On the flats, matching the forage is everything. These are the exact patterns that fool selective permit, bonefish, and tarpon."
                : "Mayflies, caddis, stoneflies. Every species has a signature emergence. These are the sixteen patterns that cover every significant hatch, all season."}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4.6 · Species portraits — editorial grid
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: pageBg }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>
            {isSalt ? "On the flats today" : "On the water today"}
          </p>
          <h2 className="font-['Cormorant_Garamond'] italic font-light leading-tight mb-14"
            style={{ fontSize: "clamp(2rem,4.5vw,3.25rem)", color: isSalt ? "#1A2A38" : "#2F2B1E" }}>
            {isSalt ? "Species tailing on this tide." : "Species feeding on this hatch."}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {(isSalt ? [
              { img: bonefishPortrait, name: "Bonefish" },
              { img: permitPortrait, name: "Permit" },
              { img: tarponPortrait, name: "Tarpon" },
              { img: redDrumPortrait, name: "Redfish" },
            ] : [
              { img: rainbowTroutPortrait, name: "Rainbow trout" },
              { img: brownTroutPortrait, name: "Brown trout" },
              { img: cutthroatTroutPortrait, name: "Cutthroat trout" },
              { img: smallmouthBassPortrait, name: "Smallmouth bass" },
            ]).map(species => (
              <div key={species.name} className="flex flex-col">
                <div className="w-full aspect-square overflow-hidden mb-4" style={{ backgroundColor: "#FAF9F5", border: `1px solid ${isSalt ? "rgba(61,107,131,0.18)" : "rgba(160,118,58,0.18)"}` }}>
                  <img src={species.img} alt={species.name} className="w-full h-full object-contain p-4" />
                </div>
                <p className="font-['Cormorant_Garamond'] italic text-xl sm:text-2xl text-center" style={{ color: isSalt ? "#1A2A38" : "#2F2B1E" }}>
                  {species.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 · Fly Pattern Editorial
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: pageBg }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          {/* Header */}
          <div className="mb-16">
            <p
              className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5"
              style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
            >
              {isSalt ? "Saltwater patterns" : "The patterns"}
            </p>
            <h2
              className="font-['Cormorant_Garamond'] italic font-light leading-tight"
              style={{ fontSize: "clamp(2.25rem,5vw,3.5rem)", color: "#2F2B1E" }}
            >
              {isSalt ? (<>Essential saltwater patterns.<br />Every flat. Every season.</>) : (<>Sixteen flies.<br />Every hatch. All season.</>)}
            </h2>
          </div>

          {/* Desktop fly grid — FW or SW based on water mode */}
          {!isSalt && (
            <>
              {/* FW Row 1 */}
              <div className="hidden md:grid grid-cols-5 gap-3 mb-3">
                <div className="col-span-2 group cursor-pointer overflow-hidden rounded-sm" style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce", borderTop: "1px solid #d6d3ce" }} onClick={() => (window.location.hash = "/finder")}>
                  <div className="h-64 overflow-hidden"><img src={adamsImg} alt="Adams" className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-6">
                    <p className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "#A67A3A" }}>Dry Fly</p>
                    <p className="font-['Cormorant_Garamond'] italic text-3xl mb-2" style={{ color: "#2F2B1E" }}>Adams</p>
                    <p className="font-['Inter'] italic text-base leading-relaxed" style={{ color: "#BAB9B4" }}>The universal dry fly. Impressionistic silhouette that passes for a dozen different mayflies. Hook #12-16.</p>
                  </div>
                </div>
                {[
                  { img: elkHairCaddisImg, name: "Elk Hair Caddis", hook: "#14-18", type: "Dry Fly" },
                  { img: hareEarNymphImg, name: "Hare's Ear Nymph", hook: "#10-18", type: "Nymph" },
                  { img: parachuteAdamsImg, name: "Parachute Adams", hook: "#14-20", type: "Dry Fly" },
                ].map((fly) => (
                  <div key={fly.name} className="col-span-1 group cursor-pointer overflow-hidden rounded-sm" style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce", borderTop: "1px solid #d6d3ce" }} onClick={() => (window.location.hash = "/finder")}>
                    <div className="h-40 overflow-hidden"><img src={fly.img} alt={fly.name} className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500" /></div>
                    <div className="p-6">
                      <p className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#A67A3A" }}>{fly.type}</p>
                      <p className="font-['Cormorant_Garamond'] italic text-xl" style={{ color: "#2F2B1E" }}>{fly.name}</p>
                      <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>Hook {fly.hook}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* FW Row 2 */}
              <div className="hidden md:grid grid-cols-5 gap-3 mb-10">
                {[
                  { img: woollyBuggerImg, name: "Woolly Bugger", hook: "#4-10", type: "Streamer" },
                  { img: bwoImg, name: "Blue-Winged Olive", hook: "#18-22", type: "Dry Fly" },
                ].map((fly) => (
                  <div key={fly.name} className="col-span-2 group cursor-pointer overflow-hidden rounded-sm" style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce", borderTop: "1px solid #d6d3ce" }} onClick={() => (window.location.hash = "/finder")}>
                    <div className="h-44 overflow-hidden"><img src={fly.img} alt={fly.name} className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500" /></div>
                    <div className="p-6">
                      <p className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#A67A3A" }}>{fly.type}</p>
                      <p className="font-['Cormorant_Garamond'] italic text-2xl" style={{ color: "#2F2B1E" }}>{fly.name}</p>
                      <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>Hook {fly.hook}</p>
                    </div>
                  </div>
                ))}
                <div className="col-span-1 group cursor-pointer overflow-hidden rounded-sm" style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce", borderTop: "1px solid #d6d3ce" }} onClick={() => (window.location.hash = "/finder")}>
                  <div className="h-44 overflow-hidden"><img src={pmdImg} alt="Pale Morning Dun" className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-6">
                    <p className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#A67A3A" }}>Dry Fly</p>
                    <p className="font-['Cormorant_Garamond'] italic text-xl" style={{ color: "#2F2B1E" }}>Pale Morning Dun</p>
                    <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>Hook #16-20</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile fly grid — 2-column, visible only on mobile */}
          <div className="md:hidden grid grid-cols-2 gap-4 mb-10">
            {(isSalt ? [
              { img: clouserImg, name: "Clouser Minnow", hook: "#1-4", type: "Baitfish" },
              { img: crazyCharlieImg, name: "Crazy Charlie", hook: "#4-8", type: "Bonefish" },
              { img: epShrimpImg, name: "EP Spawning Shrimp", hook: "#1/0-4", type: "Shrimp" },
              { img: borskiSliderImg, name: "Borski Slider", hook: "#1/0-2", type: "Redfish" },
            ] : [
              { img: adamsImg, name: "Adams", hook: "#12-16", type: "Dry Fly" },
              { img: elkHairCaddisImg, name: "Elk Hair Caddis", hook: "#14-18", type: "Dry Fly" },
              { img: hareEarNymphImg, name: "Hare's Ear Nymph", hook: "#10-18", type: "Nymph" },
              { img: woollyBuggerImg, name: "Woolly Bugger", hook: "#4-10", type: "Streamer" },
            ]).map(fly => (
              <div key={fly.name} onClick={() => window.location.hash = "/finder"}
                className="cursor-pointer overflow-hidden rounded-sm"
                style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce" }}>
                <div className="aspect-square overflow-hidden">
                  <img src={fly.img} alt={fly.name} className="w-full h-full object-contain bg-white" />
                </div>
                <div className="p-3">
                  <p className="font-['Inter'] text-[13px] tracking-widest uppercase mb-1" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>{fly.type}</p>
                  <p className="font-['Cormorant_Garamond'] italic text-base leading-tight" style={{ color: isSalt ? "#1A2A38" : "#2F2B1E" }}>{fly.name}</p>
                  <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>Hook {fly.hook}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SW fly grid */}
          {isSalt && (() => {
            const swFlies16 = [
              { img: clouserImg,      name: "Clouser Minnow",        hook: "#1-4",     type: "Baitfish" },
              { img: null,            name: "Deceiver",               hook: "#1/0-3/0", type: "Baitfish" },
              { img: crazyCharlieImg, name: "Crazy Charlie",          hook: "#4-8",     type: "Bonefish" },
              { img: delBrownImg,     name: "Del Brown Permit Crab",  hook: "#2-6",     type: "Crab/Permit" },
              { img: null,            name: "Gotcha",                 hook: "#2-6",     type: "Bonefish" },
              { img: borskiSliderImg, name: "Borski Slider",          hook: "#1/0-2",   type: "Redfish" },
              { img: epShrimpImg,     name: "EP Spawning Shrimp",     hook: "#1/0-4",   type: "Shrimp" },
              { img: tarponToadImg,   name: "Tarpon Toad",            hook: "#3/0-5/0", type: "Tarpon" },
              { img: null,            name: "Cockroach",              hook: "#1/0-3/0", type: "Baitfish" },
              { img: gurglerImg,      name: "Gurgler",                hook: "#1/0-2",   type: "Topwater" },
              { img: null,            name: "Half and Half",          hook: "#1/0-3/0", type: "Baitfish" },
              { img: null,            name: "Sea Habit",              hook: "#1-2",     type: "Baitfish" },
              { img: null,            name: "Black Death",            hook: "#2-6",     type: "Bonefish" },
              { img: null,            name: "Bruce Chard Redfish",    hook: "#1-4",     type: "Redfish" },
              { img: null,            name: "Spawning Shrimp",        hook: "#1/0-4",   type: "Shrimp" },
              { img: null,            name: "Clouser Striper",        hook: "#1/0-3/0", type: "Striper" },
            ];
            const swRow1 = swFlies16.slice(0, 8);
            const swRow2 = swFlies16.slice(8, 16);
            const renderSwCard = (fly: typeof swFlies16[number]) => (
              <div key={fly.name} className="group cursor-pointer overflow-hidden rounded-sm" style={{ backgroundColor: "#FAF9F5", border: "1px solid #d6d3ce", borderTop: "1px solid #d6d3ce" }} onClick={() => (window.location.hash = "/finder")}>
                {fly.img ? (
                  <div className="h-40 overflow-hidden"><img src={fly.img} alt={fly.name} className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500" /></div>
                ) : (
                  <div className="bg-gray-200 rounded-sm" style={{ height: 80 }} />
                )}
                <div className="p-6">
                  <p className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#3D6B83" }}>{fly.type}</p>
                  <p className="font-['Cormorant_Garamond'] italic text-xl" style={{ color: "#1A2A38" }}>{fly.name}</p>
                  <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>Hook {fly.hook}</p>
                </div>
              </div>
            );
            return (
              <>
                {/* SW Row 1 */}
                <div className="hidden md:grid grid-cols-5 gap-3 mb-3">
                  {swRow1.map(renderSwCard)}
                </div>
                {/* SW Row 2 */}
                <div className="hidden md:grid grid-cols-5 gap-3 mb-10">
                  {swRow2.map(renderSwCard)}
                </div>
              </>
            );
          })()}

          {/* Mobile horizontal scroll */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
            {(isSalt ? [
              { img: clouserImg,      name: "Clouser Minnow",        hook: "#1-4",     type: "Baitfish" },
              { img: null,            name: "Deceiver",               hook: "#1/0-3/0", type: "Baitfish" },
              { img: crazyCharlieImg, name: "Crazy Charlie",          hook: "#4-8",     type: "Bonefish" },
              { img: delBrownImg,     name: "Del Brown Permit Crab",  hook: "#2-6",     type: "Crab/Permit" },
              { img: null,            name: "Gotcha",                 hook: "#2-6",     type: "Bonefish" },
              { img: borskiSliderImg, name: "Borski Slider",          hook: "#1/0-2",   type: "Redfish" },
              { img: epShrimpImg,     name: "EP Spawning Shrimp",     hook: "#1/0-4",   type: "Shrimp" },
              { img: tarponToadImg,   name: "Tarpon Toad",            hook: "#3/0-5/0", type: "Tarpon" },
              { img: null,            name: "Cockroach",              hook: "#1/0-3/0", type: "Baitfish" },
              { img: gurglerImg,      name: "Gurgler",                hook: "#1/0-2",   type: "Topwater" },
              { img: null,            name: "Half and Half",          hook: "#1/0-3/0", type: "Baitfish" },
              { img: null,            name: "Sea Habit",              hook: "#1-2",     type: "Baitfish" },
              { img: null,            name: "Black Death",            hook: "#2-6",     type: "Bonefish" },
              { img: null,            name: "Bruce Chard Redfish",    hook: "#1-4",     type: "Redfish" },
              { img: null,            name: "Spawning Shrimp",        hook: "#1/0-4",   type: "Shrimp" },
              { img: null,            name: "Clouser Striper",        hook: "#1/0-3/0", type: "Striper" },
            ] : [
              { img: adamsImg,         name: "Adams",             hook: "#12-16", type: "Dry Fly" },
              { img: elkHairCaddisImg, name: "Elk Hair Caddis",   hook: "#14-18", type: "Dry Fly" },
              { img: hareEarNymphImg,  name: "Hare's Ear Nymph", hook: "#10-18", type: "Nymph" },
              { img: parachuteAdamsImg,name: "Parachute Adams",   hook: "#14-20", type: "Dry Fly" },
              { img: woollyBuggerImg,  name: "Woolly Bugger",     hook: "#4-10",  type: "Streamer" },
            ]).map((fly) => (
              <div
                key={fly.name}
                className="flex-shrink-0 snap-start overflow-hidden rounded-sm"
                style={{
                  width: "200px",
                  backgroundColor: "#FAF9F5",
                  border: "1px solid #d6d3ce",
                }}
                onClick={() => (window.location.hash = "/finder")}
              >
                {fly.img ? (
                  <div className="h-36 overflow-hidden">
                    <img
                      src={fly.img}
                      alt={fly.name}
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 rounded-sm" style={{ height: 80 }} />
                )}
                <div className="p-4">
                  <p
                    className="font-['Inter'] text-[13px] tracking-[0.2em] uppercase mb-1.5"
                    style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
                  >
                    {fly.type}
                  </p>
                  <p
                    className="font-['Cormorant_Garamond'] italic text-lg"
                    style={{ color: isSalt ? "#1A2A38" : "#2F2B1E" }}
                  >
                    {fly.name}
                  </p>
                  <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "#7A7974" }}>
                    Hook {fly.hook}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer link */}
          <div className="flex justify-end mt-8">
            <Link href="/finder">
              <span
                className="font-['Inter'] text-sm tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
              >
                {isSalt ? "Explore all 16 saltwater patterns →" : "Explore all 16 freshwater patterns →"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 · Data Intelligence Strip
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: isSalt ? "#060D1A" : "#0D1B33",
          borderTop: `1px solid ${isSalt ? "rgba(61,107,131,0.2)" : "rgba(160,118,58,0.2)"}`,
          borderBottom: `1px solid ${isSalt ? "rgba(61,107,131,0.2)" : "rgba(160,118,58,0.2)"}`,
          scrollMarginTop: "64px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-14 text-center md:text-left" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>
            The data behind every recommendation
          </p>
          <div className="flex flex-col md:flex-row">

            {/* Panel 1 */}
            <div
              ref={riverRef as React.RefObject<HTMLDivElement>}
              className="flex-1 py-10 md:py-0 md:pr-12 text-left"
            >
              <p
                className="font-['Inter'] text-[13px] tracking-[0.25em] uppercase mb-5"
                style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
              >
                {isSalt ? "Live coastal conditions" : "Live river conditions"}
              </p>
              <p
                className="font-['Cormorant_Garamond'] leading-none mb-4 text-6xl sm:text-7xl"
                style={{
                  color: "#F7F1E2",
                  fontWeight: 700,
                }}
              >
                {riverCount.toLocaleString()}
              </p>
              <p
                className="font-['Inter'] italic text-sm leading-relaxed"
                style={{ color: "rgba(245,230,204,0.55)", maxWidth: "220px" }}
              >
                {isSalt ? "NOAA tide stations and saltwater condition sensors active across coastal zones." : "USGS-gauged rivers monitored in real time across the continental United States."}
              </p>
            </div>

            {/* Vertical rule */}
            <div
              className="hidden md:block w-px flex-shrink-0"
              style={{ background: isSalt ? "rgba(61,107,131,0.2)" : "rgba(160,118,58,0.2)" }}
            />

            {/* Panel 2 */}
            <div className="flex-1 py-10 md:py-0 md:px-12 text-left border-t border-b md:border-0"
              style={{ borderColor: isSalt ? "rgba(61,107,131,0.2)" : "rgba(160,118,58,0.2)" }}
            >
              <p
                className="font-['Inter'] text-[13px] tracking-[0.25em] uppercase mb-5"
                style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
              >
                {isSalt ? "NOAA CO-OPS, tidal data" : "Hatch precision"}
              </p>
              <p
                className="font-['Inter'] text-[13px] tracking-[0.15em] uppercase mb-3"
                style={{ color: "rgba(245,230,204,0.45)" }}
              >
                {isSalt ? "Tide windows" : "Degree-day model"}
              </p>
              <p
                className="font-['Cormorant_Garamond'] leading-none mb-4 text-6xl sm:text-7xl"
                style={{
                  color: "#F7F1E2",
                  fontWeight: 700,
                }}
              >
                {isSalt ? "±20 min" : "±3 days"}
              </p>
              <p
                className="font-['Inter'] italic text-sm leading-relaxed"
                style={{ color: "rgba(245,230,204,0.55)", maxWidth: "220px" }}
              >
                {isSalt ? "Predicted tide window accuracy across tracked coastal stations, validated against NOAA gauge records." : "Emergence window accuracy across tracked hatch species, validated against field records."}
              </p>
            </div>

            {/* Vertical rule */}
            <div
              className="hidden md:block w-px flex-shrink-0"
              style={{ background: isSalt ? "rgba(61,107,131,0.2)" : "rgba(160,118,58,0.2)" }}
            />

            {/* Panel 3 */}
            <div
              ref={dataRef as React.RefObject<HTMLDivElement>}
              className="flex-1 py-10 md:py-0 md:pl-12 text-left"
            >
              <p
                className="font-['Inter'] text-[13px] tracking-[0.25em] uppercase mb-5"
                style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
              >
                {isSalt ? "Moon phase index" : "iNaturalist data"}
              </p>
              <p
                className="font-['Inter'] text-[13px] tracking-[0.15em] uppercase mb-3"
                style={{ color: "rgba(245,230,204,0.45)" }}
              >
                {isSalt ? "Lunar influence" : "Research-grade sightings"}
              </p>
              <p
                className="font-['Cormorant_Garamond'] leading-none mb-4 text-6xl sm:text-7xl"
                style={{
                  color: "#F7F1E2",
                  fontWeight: 700,
                }}
              >
                {isSalt ? "4 phases" : formatM(dataCount)}
              </p>
              <p
                className="font-['Inter'] italic text-sm leading-relaxed"
                style={{ color: "rgba(245,230,204,0.55)", maxWidth: "220px" }}
              >
                {isSalt ? "New and full moon feeding windows tracked across tidal species and coastal migration patterns." : "Verified aquatic insect observations powering hatch prediction models."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6b · Live Conditions
      ══════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════
          SECTION 6a · AI Fishing Forecast
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: pageBg }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>
            Today's forecast
          </p>
          <h2 className="font-['Cormorant_Garamond'] italic font-light leading-tight mb-10" style={{ fontSize: "clamp(2rem,4.5vw,3rem)", color: "#2F2B1E" }}>
            {isSalt ? "How does the ocean look today?" : "Is today worth wetting a line?"}
          </h2>
          <FishingForecast isPremium={false} />
          <p className="font-['Inter'] text-sm mt-4 italic" style={{ color: "rgba(37,45,30,0.38)" }}>
            {isSalt ? "Score updates every hour using NOAA tidal data, Open-Meteo weather, and seasonal species calendars." : "Score updates every hour using live USGS gauge data, Open-Meteo weather, and seasonal hatch calendars."}
          </p>
          {/* Data source badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(isSalt ? [
              { label: "NOAA CO-OPS", href: "https://tidesandcurrents.noaa.gov" },
              { label: "NOAA Weather", href: "https://api.weather.gov" },
              { label: "Open-Meteo", href: "https://open-meteo.com" },
            ] : [
              { label: "USGS NWIS", href: "https://waterservices.usgs.gov" },
              { label: "Open-Meteo", href: "https://open-meteo.com" },
              { label: "iNaturalist", href: "https://www.inaturalist.org" },
            ]).map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="font-['Inter'] text-[13px] uppercase tracking-widest px-2.5 py-1 rounded-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: isSalt ? "rgba(61,107,131,0.08)" : "rgba(160,118,58,0.08)", border: isSalt ? "1px solid rgba(61,107,131,0.18)" : "1px solid rgba(160,118,58,0.18)", color: isSalt ? "#3D6B83" : "#A67A3A" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: pageBg, borderBottom: isSalt ? "1px solid rgba(61,107,131,0.15)" : "1px solid rgba(120,53,15,0.2)" }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
          <p className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5" style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}>
            Right now
          </p>
          <h2 className="font-['Cormorant_Garamond'] italic font-light leading-tight mb-10" style={{ fontSize: "clamp(2rem,4.5vw,3rem)", color: "#2F2B1E" }}>
            {isSalt ? "Today's tides and conditions." : "Today's river conditions."}
          </h2>
          <ConditionsCard
            lat={29.76}
            lon={-95.37}
            mode={waterMode}
            tideStation={"8771450"}
          />
          <p className="font-['Inter'] text-sm mt-5 italic" style={{ color: "rgba(37,45,30,0.42)" }}>
            Conditions update automatically based on your region. Set your home water in Trips.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 · Cinematic CTA — river_current.mp4
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ height: "85vh" }}>
        {isSalt ? (
          /* SW placeholder — rainbow video removed, awaiting new photo */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: "#060D1A" }}
          >
            <p
              className="font-['Cinzel'] text-sm tracking-[0.28em] uppercase"
              style={{ color: "rgba(61,107,131,0.55)" }}
            >
              New photo here
            </p>
          </div>
        ) : (
          <video
            key="s7-fw"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: "none" }}
          >
            <source src={riverCurrentVid} type="video/mp4" />
          </video>
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: isSalt ? "rgba(26,34,44,0.35)" : "rgba(238,240,232,0.55)" }}
        />

        {/* Content — left-aligned, bottom-third */}
        <div className="absolute inset-0 flex items-end z-10">
          <div className="px-6 sm:px-10 lg:px-16 pb-16 md:pb-24 w-full max-w-3xl">
            <p
              className="font-['Cinzel'] text-[13px] tracking-[0.3em] uppercase mb-5"
              style={{ color: isSalt ? "#3D6B83" : "#A67A3A" }}
            >
              {isSalt ? "Your coast, your tide" : "Your water, your hatch"}
            </p>
            <p
              className="font-['Cormorant_Garamond'] italic text-3xl md:text-4xl leading-snug mb-10"
              style={{ color: "#2F2B1E" }}
            >
              {isSalt
                ? "\"Every flat has a tide window. Know it.\""
                : "\"Every river has a calendar. Read it.\""
              }
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                data-testid="button-cta-footer"
                onClick={() => (window.location.hash = "/finder")}
                className="px-9 py-3.5 font-['Inter'] text-sm font-semibold tracking-wider rounded-full hover:opacity-90 transition-opacity min-h-[44px] shadow-md"
                style={{ backgroundColor: isSalt ? "#142446" : "#A67A3A", color: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" }}
              >
                {isSalt ? "Find my saltwater fly" : "Find my fly"}
              </button>
              <button
                onClick={() => (window.location.hash = "/hatch-chart")}
                className="px-9 py-3.5 font-['Inter'] text-sm tracking-wider rounded-full hover:bg-white/10 transition-colors min-h-[44px]"
                style={{ border: "1px solid rgba(37,45,30,0.4)", color: "#2F2B1E" }}
              >
                {isSalt ? "Explore the tidal calendar" : "View hatch chart"}
              </button>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-6 right-6 z-10">
          <p
            className="font-['Inter'] text-sm tracking-[0.2em]"
            style={{ color: isSalt ? "rgba(61,107,131,0.35)" : "rgba(120,53,15,0.4)" }}
          >
            Flydentify · Pro · v2.0
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 9 · Footer
      ══════════════════════════════════════════════════════ */}
      <footer
        style={{
          backgroundColor: "#0D1B33",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Three-column grid */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

            {/* Col 1: Logo + tagline */}
            <div className="flex flex-col items-center md:items-start">
              <img
                src={logoImg}
                alt="Flydentify"
                style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", display: "block", marginBottom: 16 }}
              />

            </div>

            {/* Col 2: Nav links */}
            <div className="flex flex-col justify-center">
              {[
                { label: "Fly Finder", href: "/finder" },
                { label: "Hatch Calendar", href: "/hatch-chart" },
                { label: "Conditions", href: "/conditions" },
                { label: "Catch Reports", href: "/reports" },
                { label: "Rigs", href: "/rigging" },
                { label: "Guides", href: "/guides" },
                { label: "Fly Shops", href: "/fly-shops" },
                { label: "Conservation", href: "/conservation" },
                { label: "Merch", href: "/merch" },
                { label: "Trips", href: "/trips" },
                { label: "Pricing", href: "/pricing" },
              ].map((link, i) => (
                <div key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="block py-4 font-['Inter'] text-sm cursor-pointer hover:opacity-100 transition-opacity"
                      style={{ color: "rgba(245,230,204,0.6)", opacity: 0.85 }}
                    >
                      {link.label}
                    </span>
                  </Link>
                  {i < 3 && (
                    <div
                      className="w-full h-px"
                      style={{ background: "rgba(245,230,204,0.1)" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Col 3: About */}
            <div className="flex flex-col justify-center gap-4">

              <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: "rgba(245,230,204,0.5)" }}>
                Real-time conditions, hatch charts, rigging guides, and species intelligence. Everything you need to answer the question.
              </p>
              <p className="font-['Inter'] text-sm italic" style={{ color: "rgba(245,230,204,0.45)" }}>
                Tell them Flydentify hooked you up.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 py-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-center font-['Inter'] text-sm"
            style={{ color: "rgba(245,230,204,0.38)" }}
          >
            © 2026 Flydentify · Made in Texas · All rights reserved
            {" · "}
            <a href="/api/rss" className="hover:opacity-100 transition-opacity" style={{ color: "inherit" }}>RSS Feed</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
