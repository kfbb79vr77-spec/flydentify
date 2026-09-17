// Privacy Policy — required for Apple App Store review
import logoImg from "@assets/flydentify_logo.png";

const accent = "#A67A3A";
const bg = "#0D1B33";
const text = "#f5e6cc";
const muted = "rgba(245,230,204,0.6)";
const faint = "rgba(245,230,204,0.35)";

export default function Privacy() {
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
        <p className="font-['Inter'] text-xs uppercase tracking-[0.25em] mb-4" style={{ color: accent }}>Legal</p>
        <h1 className="font-['Cormorant_Garamond'] font-light italic mb-2" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
          Privacy Policy
        </h1>
        <p className="font-['Inter'] text-sm mb-12" style={{ color: faint }}>Effective date: August 1, 2026</p>

        <div className="space-y-10" style={{ color: muted, lineHeight: 1.8 }}>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>1. Who we are</h2>
            <p className="font-['Inter'] text-sm">Flydentify is a fly fishing identification and planning application operated by Flydentify LLC, based in Houston, Texas. We can be reached at support@flydentify.com.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>2. Information we collect</h2>
            <p className="font-['Inter'] text-sm mb-3">We collect only what is necessary to operate the app:</p>
            <ul className="font-['Inter'] text-sm space-y-2 pl-4">
              <li><strong style={{ color: text }}>Account information:</strong> email address and password (hashed) when you create an account.</li>
              <li><strong style={{ color: text }}>Location data:</strong> approximate GPS coordinates, used only in-session to match local hatch and river conditions. We do not store or transmit your location.</li>
              <li><strong style={{ color: text }}>Usage data:</strong> anonymized app interactions (pages visited, features used) to improve the product. No personally identifiable information is attached.</li>
              <li><strong style={{ color: text }}>Payment data:</strong> handled entirely by Stripe. We never see or store your credit card number.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>3. How we use your information</h2>
            <ul className="font-['Inter'] text-sm space-y-2 pl-4">
              <li>To provide and improve Flydentify features.</li>
              <li>To manage your subscription and process payments via Stripe.</li>
              <li>To send transactional emails (account confirmation, billing receipts). No marketing emails without your consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>4. Data sharing</h2>
            <p className="font-['Inter'] text-sm">We do not sell your personal information. We share data only with service providers necessary to operate Flydentify: Stripe (payments), and cloud hosting providers. All providers are bound by data processing agreements.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>5. Data retention</h2>
            <p className="font-['Inter'] text-sm">We retain your account data for as long as your account is active. You may request deletion at any time by emailing support@flydentify.com. We will delete your account and associated data within 30 days.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>6. Children</h2>
            <p className="font-['Inter'] text-sm">Flydentify is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>7. Your rights</h2>
            <p className="font-['Inter'] text-sm">Depending on your location, you may have rights to access, correct, or delete your personal information. To exercise any of these rights, contact us at support@flydentify.com.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>8. Changes to this policy</h2>
            <p className="font-['Inter'] text-sm">We may update this policy from time to time. Material changes will be communicated via email or a notice within the app. Continued use of Flydentify after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold mb-3" style={{ color: text }}>9. Contact</h2>
            <p className="font-['Inter'] text-sm">Questions about this policy? Email us at <a href="mailto:support@flydentify.com" style={{ color: accent }}>support@flydentify.com</a>.</p>
          </section>

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
