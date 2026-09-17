/**
 * TrialExpiredGate — full-screen, non-dismissible paywall shown when trial ends.
 * Stripe integration: replace the handleSubscribe placeholder with the
 * /api/stripe/create-checkout call once Stripe is configured.
 */
import { useState } from "react";
import { Check, Loader2, Fish } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

const s = {
  bg:     "#0d1108",
  card:   "#131a0e",
  cardHL: "#161f10",
  border: "rgba(160,118,58,0.25)",
  amber:  "#A67A3A",
  amberL: "#c49550",
  cream:  "#f5e6cc",
  muted:  "rgba(245,230,204,0.6)",
  faint:  "rgba(245,230,204,0.35)",
};

const PERKS = [
  "Real-time hatch data: every insect, every region",
  "GPS-matched fly recommendations for your exact water",
  "USGS river flow and temperature, live",
  "Full knot library with step-by-step rigging guides",
  "Freshwater and saltwater, all 50 states",
  "Priority access to every new feature",
];

export function TrialExpiredGate() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError("");
    try {
      // Once Stripe is configured this hits the real checkout endpoint.
      // For now it gracefully fails and shows the error message.
      const res = await apiRequest("POST", "/api/stripe/create-checkout", { plan });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: any) {
      const msg = err.message || "Could not start checkout.";
      // Stripe not configured yet: show a friendly holding message
      setError(
        msg.includes("not configured") || msg.includes("503")
          ? "Payment processing is coming soon. Check back shortly."
          : msg
      );
      setLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: s.bg }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <p
          className="font-['Cinzel'] text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: s.amber }}
        >
          Flydentify
        </p>
        <Fish size={28} style={{ color: s.amber, margin: "0 auto 16px" }} />
        <h1
          className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl italic leading-tight"
          style={{ color: s.cream }}
        >
          Your free trial has ended.
        </h1>
        <p
          className="font-['Inter'] text-sm mt-3 max-w-sm mx-auto leading-relaxed"
          style={{ color: s.muted }}
        >
          The hatch doesn't wait. Subscribe to keep your fly intelligence live.
        </p>
      </div>

      {/* Perks */}
      <ul className="space-y-2 mb-8 max-w-xs w-full">
        {PERKS.map((perk, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check size={12} className="mt-0.5 shrink-0" style={{ color: s.amber }} />
            <span className="font-['Inter'] text-sm leading-snug" style={{ color: s.muted }}>
              {perk}
            </span>
          </li>
        ))}
      </ul>

      {/* Pricing cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mb-6">
        {/* Monthly */}
        <button
          onClick={() => handleSubscribe("monthly")}
          disabled={!!loading}
          className="flex-1 rounded-sm p-5 text-left transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: s.card,
            border: `1px solid ${s.border}`,
          }}
        >
          <p className="font-['Cinzel'] text-xs uppercase tracking-widest mb-2" style={{ color: s.amber }}>
            Monthly
          </p>
          <p className="font-['Cormorant_Garamond'] text-2xl mb-0.5" style={{ color: s.cream }}>
            $7.99
            <span className="font-['Inter'] text-sm italic ml-1" style={{ color: s.faint }}>/mo</span>
          </p>
          <p className="font-['Inter'] text-xs" style={{ color: s.faint }}>Cancel anytime.</p>
          <div
            className="mt-4 w-full py-2.5 rounded-sm font-['Inter'] text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "rgba(160,118,58,0.15)", color: s.amberL }}
          >
            {loading === "monthly" && <Loader2 size={12} className="animate-spin" />}
            Subscribe
          </div>
        </button>

        {/* Annual — highlighted */}
        <button
          onClick={() => handleSubscribe("annual")}
          disabled={!!loading}
          className="flex-1 rounded-sm p-5 text-left transition-opacity hover:opacity-90 disabled:opacity-50 relative overflow-hidden"
          style={{
            backgroundColor: s.cardHL,
            border: `1px solid ${s.amber}`,
          }}
        >
          {/* Most popular badge */}
          <div
            className="absolute top-0 right-0 px-2.5 py-1 font-['Cinzel'] text-[10px] uppercase tracking-widest"
            style={{ backgroundColor: s.amber, color: "#fff" }}
          >
            Best value
          </div>
          <p className="font-['Cinzel'] text-xs uppercase tracking-widest mb-2" style={{ color: s.amber }}>
            Annual
          </p>
          <p className="font-['Cormorant_Garamond'] text-2xl mb-0.5" style={{ color: s.cream }}>
            $49.99
            <span className="font-['Inter'] text-sm italic ml-1" style={{ color: s.faint }}>/yr</span>
          </p>
          <p className="font-['Inter'] text-xs" style={{ color: s.faint }}>
            $4.17/mo. Save 48%.
          </p>
          <div
            className="mt-4 w-full py-2.5 rounded-sm font-['Inter'] text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
            style={{ backgroundColor: s.amber, color: "#fff" }}
          >
            {loading === "annual" && <Loader2 size={12} className="animate-spin" />}
            Subscribe and save
          </div>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="font-['Inter'] text-xs italic mb-4 text-center max-w-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <p className="font-['Inter'] text-xs text-center mb-2" style={{ color: s.faint }}>
        Secure checkout. No surprises.
      </p>

      {/* Sign out */}
      <button
        onClick={logout}
        className="font-['Inter'] text-xs underline transition-opacity hover:opacity-70 mt-2"
        style={{ color: s.faint }}
      >
        Sign out
      </button>

      <p
        className="font-['Cinzel'] text-[10px] uppercase tracking-[0.25em] mt-10"
        style={{ color: "rgba(245,230,204,0.15)" }}
      >
        Tell them Flydentify hooked you up.
      </p>
    </div>
  );
}
