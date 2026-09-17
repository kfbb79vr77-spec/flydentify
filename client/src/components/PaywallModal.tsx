import { useState } from "react";
import { X, Check, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { AuthModal } from "./AuthModal";

const s = {
  bg: "#071e25",
  card: "#091d24",
  border: "rgba(167,122,58,0.3)",
  amber: "#A67A3A",
  text: "#f5e6cc",
  faint: "rgba(214,197,176,0.5)",
  muted: "rgba(214,197,176,0.7)",
};

const PERKS = [
  "All fly recommendations: every hatch, every region",
  "AI Fishing Forecast: daily score, arrival time, best fly, best stretch",
  "Live USGS river flow & temperature data",
  "Full knot library with animated step-by-step guides",
  "iPhone & iPad optimized experience",
];

interface Props {
  onClose: () => void;
}

export function PaywallModal({ onClose }: Props) {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/stripe/create-checkout");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <AuthModal
        onClose={() => setShowAuth(false)}
        defaultMode="register"
        onSuccess={() => {
          setShowAuth(false);
          // After registering, trigger checkout
          setTimeout(handleUpgrade, 300);
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(4,14,18,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-sm overflow-hidden"
        style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
      >
        {/* Amber top bar */}
        <div className="h-1 w-full" style={{ backgroundColor: s.amber }} />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 transition-opacity hover:opacity-70"
            style={{ color: s.faint }}
          >
            <X size={18} />
          </button>

          {/* Lock icon */}
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(167,122,58,0.15)", border: "1px solid rgba(167,122,58,0.3)" }}
          >
            <Lock size={18} style={{ color: s.amber }} />
          </div>

          <p className="font-['Inter'] text-xs uppercase tracking-widest mb-1" style={{ color: s.amber }}>
            Flydentify Pro
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-2xl mb-2" style={{ color: s.text }}>
            You've seen 3 flies.
          </h2>
          <p className="font-['Inter'] text-sm italic mb-6 leading-relaxed" style={{ color: s.muted }}>
            Unlock the full hatch match. Every fly, every knot, and live river conditions for all 8 regions.
          </p>

          {/* Perks list */}
          <ul className="space-y-2.5 mb-7">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={13} className="mt-0.5 shrink-0" style={{ color: s.amber }} />
                <span className="font-['Inter'] text-sm leading-snug" style={{ color: s.muted }}>{perk}</span>
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-5">
            <span className="font-['Cormorant_Garamond'] text-3xl" style={{ color: s.text }}>$7.99</span>
            <span className="font-['Inter'] text-sm italic" style={{ color: s.faint }}>/month, cancel anytime</span>
          </div>

          {/* Error */}
          {error && (
            <p className="font-['Inter'] text-xs italic mb-3" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-sm py-3.5 font-['Inter'] text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-3"
            style={{ backgroundColor: s.amber, color: "#fff" }}
            data-testid="button-upgrade"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {user ? "Subscribe, $6.99/mo" : "Get Started"}
          </button>

          <p className="text-center font-['Inter'] text-xs" style={{ color: s.faint }}>
            Secure payment via Stripe. No commitment.
          </p>

          {!user && (
            <p className="mt-3 text-center font-['Inter'] text-xs" style={{ color: s.faint }}>
              Already a member?{" "}
              <button
                onClick={() => setShowAuth(true)}
                className="underline transition-opacity hover:opacity-70"
                style={{ color: s.amber }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
