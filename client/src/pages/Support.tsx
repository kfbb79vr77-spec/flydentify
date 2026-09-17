// Support page — required for Apple App Store review
import logoImg from "@assets/flydentify_logo.png";

const accent = "#A67A3A";
const bg = "#0D1B33";
const text = "#f5e6cc";
const muted = "rgba(245,230,204,0.6)";
const faint = "rgba(245,230,204,0.35)";

const FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your account settings inside the app. Your access continues until the end of your current billing period. No partial refunds are issued.",
  },
  {
    q: "I forgot my password. How do I reset it?",
    a: "On the sign-in screen, tap 'Forgot password' and enter your email. You will receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
  },
  {
    q: "The hatch data doesn't match what I'm seeing on the water.",
    a: "Hatch data is aggregated from USGS, NOAA, and iNaturalist. Conditions on your specific reach may vary. If you consistently see discrepancies, email us with your location and date and we will investigate.",
  },
  {
    q: "My fly identification results seem off.",
    a: "Make sure your region and water type (freshwater/saltwater) are set correctly in the Finder. If results still seem wrong, contact us with details.",
  },
  {
    q: "How do I request a refund?",
    a: "We do not process refunds directly. For App Store purchases, request a refund through Apple at reportaproblem.apple.com. For web purchases, contact us at support@flydentify.com within 7 days of the charge.",
  },
  {
    q: "How do I delete my account?",
    a: "Email support@flydentify.com with the subject line 'Delete my account' from your registered email address. We will delete your account and all associated data within 30 days.",
  },
];

export default function Support() {
  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh", fontFamily: "Lora, serif" }}>
      {/* Nav */}
      <nav className="px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 py-3"
        style={{ backgroundColor: bg, borderBottom: "1px solid rgba(160,118,58,0.2)" }}>
        <a href="/#/" style={{ display: "block", lineHeight: 0 }}>
          <img src={logoImg} alt="Flydentify" className="w-auto h-auto" style={{ maxWidth: 160, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
        </a>
        <a href="/#/" className="font-['Inter'] text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ color: faint }}>&larr; Back</a>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-['Inter'] text-xs uppercase tracking-[0.25em] mb-4" style={{ color: accent }}>Help</p>
        <h1 className="font-['Cormorant_Garamond'] font-light italic mb-4" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
          Support
        </h1>
        <p className="font-['Inter'] text-sm mb-12" style={{ color: muted }}>
          Questions about Flydentify? Start with the answers below. If you still need help, email us directly.
        </p>

        {/* Contact card */}
        <div className="mb-12 p-6 rounded-sm" style={{ backgroundColor: "rgba(160,118,58,0.08)", border: "1px solid rgba(160,118,58,0.25)" }}>
          <p className="font-['Cormorant_Garamond'] text-base font-semibold mb-1" style={{ color: text }}>Email support</p>
          <a href="mailto:support@flydentify.com" className="font-['Inter'] text-sm transition-opacity hover:opacity-80" style={{ color: accent }}>
            support@flydentify.com
          </a>
          <p className="font-['Inter'] text-xs mt-2" style={{ color: faint }}>We respond within 1 business day.</p>
        </div>

        {/* FAQ */}
        <h2 className="font-['Cormorant_Garamond'] text-xl font-semibold mb-6" style={{ color: text }}>Common questions</h2>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="p-5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-['Cormorant_Garamond'] text-sm font-semibold mb-2" style={{ color: text }}>{q}</p>
              <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: muted }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: "1px solid rgba(160,118,58,0.15)" }}>
        <p className="font-['Inter'] text-xs" style={{ color: faint }}>
          &copy; 2026 Flydentify &middot; Made in Texas
        </p>
      </footer>
    </div>
  );
}
