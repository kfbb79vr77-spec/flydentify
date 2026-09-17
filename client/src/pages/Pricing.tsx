import React, { useState } from "react";
// Pricing page — informational only. All purchases via App Store.
// No checkout, no sign-in, no account creation on this page.

import { Check, Shield, Star, Calendar, Zap, X, Menu } from "lucide-react";
import logoImg from "@assets/flydentify_logo.png";

const APP_STORE_URL = "https://apps.apple.com/us/app/flydentify";
const accent = "#A67A3A";

const TIERS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$6.99",
    period: "/month",
    savings: null,
    description: "Full access. Cancel anytime.",
    featured: false,
    features: [
      "AI Fishing Forecast: daily score, arrival time, best fly, best stretch",
      "Full fly identification database (32 patterns)",
      "Freshwater and saltwater fly finder",
      "Real-time hatch data via USGS, NOAA, and iNaturalist",
      "GPS-based local river and gauge conditions",
      "Gear setup and rigging guides",
      "Trip planner",
      "Guide directory, book local guides direct",
      "Fly shop affiliate directory",
    ],
  },
  {
    id: "yearly",
    label: "Annual",
    price: "$39.99",
    period: "/year",
    savings: "Just $3.33/mo, save 52%",
    description: "One payment. Full year of access.",
    featured: true,
    features: [
      "Everything in Monthly",
      "Save 52% vs monthly billing",
      "Priority feature access",
      "Early beta invites",
      "10% of your subscription donated to conservation partners",
    ],
  },
];

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function Pricing() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#0D1B33", color: "#F7F1E2" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-30"
        style={{ backgroundColor: "#0D1B33", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        {/* ── Logo row ── */}
        <div className="flex justify-center px-5 pt-3 pb-1">
          <a href="/#/" style={{ display: "block", lineHeight: 0 }}>
            <img src={logoImg} alt="Flydentify" className="w-auto h-auto block" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)" }} />
          </a>
        </div>
        {/* ── Nav row: back / links / hamburger ── */}
        <div className="flex items-center justify-between px-5 sm:px-8 pb-2.5">
          <a href="/#/" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70 flex items-center gap-1 min-h-[36px]"
            style={{ color: "rgba(245,230,204,0.55)", textDecoration: "none" }}>
            ← Home
          </a>
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <a href="/#/finder" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", textDecoration: "none" }}>Finder</a>
            <a href="/#/hatch-chart" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", textDecoration: "none" }}>Hatch</a>
            <a href="/#/rigging" className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)", textDecoration: "none" }}>Rigging</a>
          </div>
          {/* Desktop: Try the App button */}
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{
              fontFamily: "'Cinzel', 'Copperplate', serif",
              fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase",
              padding: "9px 18px", borderRadius: 999,
              backgroundColor: "#fff", color: "#0D1B33",
              fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
            }}>
            <AppleIcon /> Try the App
          </a>
          {/* Mobile hamburger */}
          <button className="md:hidden flex items-center justify-center w-10 h-10" onClick={() => setMobileNavOpen(v => !v)} style={{ color: "rgba(245,230,204,0.8)" }} aria-label="Menu">
            {mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen nav */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9998] flex flex-col"
          style={{ backgroundColor: "#0D1B33" }}
        >
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={logoImg} alt="Flydentify" style={{ height: 64, width: "auto", filter: "brightness(0) invert(1)" }} />
            <button onClick={() => setMobileNavOpen(false)} className="w-11 h-11 flex items-center justify-center" style={{ color: "rgba(245,230,204,0.6)" }}>
              <X size={22} />
            </button>
          </div>
          <div className="flex flex-col px-6 pt-6 flex-1">
            {[
              { label: "Fly Finder", href: "/#/finder" },
              { label: "Hatch chart", href: "/#/hatch-chart" },
              { label: "Rigging", href: "/#/rigging" },
              { label: "Conditions", href: "/#/conditions" },
              { label: "Pricing", href: "/#/pricing" },
            ].map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileNavOpen(false)}
                className="block py-5 font-['Cinzel'] text-base tracking-[0.18em] uppercase border-b"
                style={{ color: "rgba(245,230,204,0.8)", textDecoration: "none", borderColor: "rgba(255,255,255,0.07)" }}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="px-6 pb-10">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-sm"
              style={{ backgroundColor: "#fff", color: "#0D1B33", fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}>
              <AppleIcon /> Try the App
            </a>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center px-6 pt-16 pb-12" style={{ borderBottom: "1px solid rgba(160,118,58,0.15)" }}>
        <p className="font-['Inter'] text-sm uppercase tracking-[0.25em] mb-5" style={{ color: accent }}>
          7-day free trial — no credit card required
        </p>
        <h1 className="font-['Cormorant_Garamond'] font-light italic leading-tight mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F7F1E2" }}>
          Fool the Fish.
        </h1>
        <p className="font-['Inter'] text-base max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(245,230,204,0.62)" }}>
          Real-time hatch data, GPS-matched fly patterns, and full rigging guides. Subscribe inside the app after your free trial.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIERS.map(tier => (
            <div key={tier.id} className="relative flex flex-col rounded-sm overflow-hidden"
              style={{
                backgroundColor: tier.featured ? "rgba(160,118,58,0.10)" : "rgba(255,255,255,0.03)",
                border: tier.featured ? "1px solid rgba(160,118,58,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}>
              {tier.featured && <div className="absolute top-0 inset-x-0 h-px" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />}

              {tier.featured && (
                <div className="px-6 pt-5 pb-0">
                  <span className="font-['Inter'] text-[13px] uppercase tracking-[0.22em] font-semibold px-2.5 py-1 rounded-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(245,230,204,0.9)" }}>
                    Most popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="px-6 pt-5 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-['Inter'] text-sm uppercase tracking-[0.2em] mb-3"
                  style={{ color: tier.featured ? accent : "rgba(245,230,204,0.45)" }}>
                  {tier.label}
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-['Cormorant_Garamond'] font-semibold leading-none"
                    style={{ fontSize: "clamp(2.5rem,6vw,3.5rem)", color: "#F7F1E2" }}>
                    {tier.price}
                  </span>
                  <span className="font-['Inter'] text-sm pb-1.5" style={{ color: "rgba(245,230,204,0.45)" }}>
                    {tier.period}
                  </span>
                </div>
                {tier.savings && (
                  <p className="font-['Inter'] text-sm italic mb-2" style={{ color: accent }}>{tier.savings}</p>
                )}
                <p className="font-['Inter'] text-sm" style={{ color: "rgba(245,230,204,0.5)" }}>{tier.description}</p>
              </div>

              {/* Features */}
              <div className="px-6 py-6 flex-1 space-y-3.5">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 w-4 h-4 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: tier.featured ? "rgba(160,118,58,0.25)" : "rgba(255,255,255,0.06)" }}>
                      <Check size={10} style={{ color: tier.featured ? accent : "rgba(245,230,204,0.5)" }} />
                    </div>
                    <span className="font-['Inter'] text-sm leading-relaxed"
                      style={{ color: f === "Everything in Monthly" ? "rgba(245,230,204,0.9)" : "rgba(245,230,204,0.65)" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA — App Store only */}
              <div className="px-6 pb-6 pt-2">
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 rounded-full transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{
                    fontFamily: "'Cinzel', 'Copperplate', serif",
                    fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
                    backgroundColor: tier.featured ? "#fff" : "transparent",
                    border: tier.featured ? "none" : "1px solid rgba(245,230,204,0.3)",
                    color: tier.featured ? "#0D1B33" : "rgba(245,230,204,0.85)",
                    boxShadow: tier.featured ? "0 4px 18px rgba(0,0,0,0.22)" : "none",
                  }}>
                  <AppleIcon /> Try the App
                </a>
                <p className="text-center font-['Inter'] text-[13px] mt-2" style={{ color: "rgba(245,230,204,0.3)" }}>
                  Free for 7 days, then {tier.price}{tier.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div className="max-w-3xl mx-auto px-5 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "No card to start", desc: "7-day trial is truly free." },
            { icon: Zap, label: "Cancel anytime", desc: "No lock-in. No questions asked." },
            { icon: Check, label: "All platforms", desc: "iOS now. Android in 2027." },
          ].map(({ icon: I, label, desc }) => (
            <div key={label} className="flex gap-3 items-center px-4 py-4 rounded-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <I size={14} className="shrink-0" style={{ color: accent }} />
              <div>
                <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: "#F7F1E2" }}>{label}</p>
                <p className="font-['Inter'] text-sm mt-0.5" style={{ color: "rgba(245,230,204,0.45)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-5 pb-16" style={{ borderTop: "1px solid rgba(160,118,58,0.15)" }}>
        <h2 className="font-['Cormorant_Garamond'] text-xl font-semibold text-center pt-12 mb-8" style={{ color: "#F7F1E2" }}>
          Common questions
        </h2>
        <div className="space-y-3">
          {[
            { q: "How does the free trial work?", a: "Download the app and start your 7-day trial. No credit card required. After the trial, choose a plan inside the app to keep access." },
            { q: "Where do I subscribe?", a: "All subscriptions are managed through the App Store on your iPhone. Apple handles billing and receipts securely." },
            { q: "Can I switch plans later?", a: "Yes. Upgrade, downgrade, or cancel anytime from your iPhone's subscription settings." },
            { q: "Is there an Android app?", a: "iOS is available now. Android is in development for 2027." },
            { q: "What is the conservation donation?", a: "Annual subscribers have 10% of their subscription donated to Trout Unlimited, Bonefish and Tarpon Trust, and other conservation partners we vet annually." },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-['Cormorant_Garamond'] text-sm font-semibold mb-1.5" style={{ color: "#F7F1E2" }}>{q}</p>
              <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: "rgba(245,230,204,0.55)" }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#0D1B33" }}>
        <div className="px-6 py-8 text-center">
          <p className="font-['Inter'] text-sm" style={{ color: "rgba(245,230,204,0.25)" }}>
            &copy; 2026 Flydentify &middot; Made in Texas &middot;{" "}
            <a href="/#/privacy" style={{ color: "rgba(245,230,204,0.35)" }}>Privacy</a>
            {" "}&middot;{" "}
            <a href="/#/support" style={{ color: "rgba(245,230,204,0.35)" }}>Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
