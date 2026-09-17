import { useState, useEffect } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { regions } from "@/lib/flyData";
import { useWaterMode } from "@/lib/waterModeContext";

const fwTheme = {
  overlay: "rgba(4,14,10,0.88)",
  card: "#0D1B33",
  border: "rgba(160,118,58,0.35)",
  accent: "#A67A3A",
  accentBorder: "rgba(160,118,58,0.25)",
  checkBorder: "rgba(160,118,58,0.45)",
  text: "#f5e6cc",
  faint: "rgba(214,197,176,0.55)",
  muted: "rgba(214,197,176,0.75)",
  inputBg: "rgba(255,255,255,0.05)",
};

const swTheme = {
  overlay: "rgba(4,10,18,0.88)",
  card: "#0e1a24",
  border: "rgba(61,107,131,0.35)",
  accent: "#3D6B83",
  accentBorder: "rgba(61,107,131,0.25)",
  checkBorder: "rgba(61,107,131,0.45)",
  text: "#deeaf2",
  faint: "rgba(180,210,228,0.55)",
  muted: "rgba(180,210,228,0.75)",
  inputBg: "rgba(255,255,255,0.05)",
};

interface Props {
  onClose: () => void;
  defaultMode?: "login" | "register";
  onSuccess?: () => void;
}

export function AuthModal({ onClose, defaultMode = "register", onSuccess }: Props) {
  const { login, register } = useAuth();
  const { waterMode } = useWaterMode();
  const s = waterMode === "salt" ? swTheme : fwTheme;

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [homeRegion, setHomeRegion] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const regionOptions = Object.values(regions).map((r) => r.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, homeRegion || undefined);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: s.overlay, backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-sm p-8"
        style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-opacity hover:opacity-70"
          style={{ color: s.faint }}
        >
          <X size={18} />
        </button>

        {/* Logo wordmark */}
        <p className="font-['Inter'] text-xs uppercase tracking-widest mb-1" style={{ color: s.accent }}>
          Flydentify
        </p>
        <h2 className="font-['Cormorant_Garamond'] text-2xl mb-1" style={{ color: s.text }}>
          {mode === "login" ? "Welcome back." : "Create your account."}
        </h2>
        <p className="font-['Inter'] text-sm italic mb-6" style={{ color: s.muted }}>
          {mode === "login"
            ? "Sign in to access your full fly recommendations."
            : "Join to unlock all hatches, river data, and knot guides."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-['Inter'] text-xs uppercase tracking-widest mb-1.5" style={{ color: s.faint }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="yourname@email.com"
              className="w-full rounded-sm px-3 py-2.5 text-sm font-['Inter'] outline-none transition-all"
              style={{
                backgroundColor: s.inputBg,
                border: `1px solid ${s.accentBorder}`,
                color: s.text,
              }}
              data-testid="input-email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-['Inter'] text-xs uppercase tracking-widest mb-1.5" style={{ color: s.faint }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full rounded-sm px-3 py-2.5 pr-10 text-sm font-['Inter'] outline-none"
                style={{
                  backgroundColor: s.inputBg,
                  border: `1px solid ${s.accentBorder}`,
                  color: s.text,
                }}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: s.faint }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Register-only fields */}
          {mode === "register" && (
            <>
              <div>
                <label className="block font-['Inter'] text-xs uppercase tracking-widest mb-1.5" style={{ color: s.faint }}>
                  Home Region (optional)
                </label>
                <select
                  value={homeRegion}
                  onChange={(e) => setHomeRegion(e.target.value)}
                  className="w-full rounded-sm px-3 py-2.5 text-sm font-['Inter'] outline-none"
                  style={{
                    backgroundColor: s.inputBg,
                    border: `1px solid ${s.accentBorder}`,
                    color: homeRegion ? s.text : s.faint,
                  }}
                  data-testid="select-region"
                >
                  <option value="">Select your region</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r} style={{ backgroundColor: s.card, color: s.text }}>{r}</option>
                  ))}
                </select>
              </div>


            </>
          )}

          {/* Error */}
          {error && (
            <p className="font-['Inter'] text-xs italic" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm py-3 font-['Inter'] text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: s.accent, color: "#fff" }}
            data-testid="button-submit-auth"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-5 text-center font-['Inter'] text-xs" style={{ color: s.faint }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setEmail(""); setPassword(""); }}
            className="underline transition-opacity hover:opacity-70"
            style={{ color: s.accent }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
