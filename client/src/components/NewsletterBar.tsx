import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const fwColors = {
  accent: "#A67A3A",
  bg: "#1a1610",
  border: "rgba(167,122,58,0.2)",
  inputBorder: "rgba(167,122,58,0.2)",
  doneBg: "rgba(120,80,20,0.15)",
  doneBorder: "rgba(167,122,58,0.25)",
  text: "#f5e6cc",
  muted: "rgba(214,197,176,0.7)",
};

const swColors = {
  accent: "#3D6B83",
  bg: "#0e1a24",
  border: "rgba(61,107,131,0.25)",
  inputBorder: "rgba(61,107,131,0.2)",
  doneBg: "rgba(20,70,110,0.2)",
  doneBorder: "rgba(61,107,131,0.3)",
  text: "#deeaf2",
  muted: "rgba(180,210,228,0.7)",
};

interface Props {
  region?: string;
  source?: string;
  isSalt?: boolean;
}

export function NewsletterBar({ region, source = "footer", isSalt = false }: Props) {
  const c = isSalt ? swColors : fwColors;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", {
        email,
        region: region || null,
        source,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Subscription failed.");
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="rounded-sm p-5 flex items-center gap-3"
        style={{ backgroundColor: c.doneBg, border: `1px solid ${c.doneBorder}` }}
      >
        <CheckCircle size={16} style={{ color: "#9acd5a" }} className="shrink-0" />
        <div>
          <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: c.text }}>
            You're on the list.
          </p>
          <p className="font-['Inter'] text-xs italic mt-0.5" style={{ color: c.muted }}>
            {region
              ? `Your first ${region.split(" / ")[0]} hatch report drops this week.`
              : "Your first regional hatch report drops this week."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-sm p-5"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail size={14} style={{ color: c.accent }} />
        <p className="font-['Inter'] text-xs uppercase tracking-widest" style={{ color: c.text }}>
          Weekly Hatch Report
        </p>
      </div>
      <p className="font-['Inter'] text-xs italic mb-4 leading-relaxed" style={{ color: c.muted }}>
        {region
          ? `Get what's rising in ${region.split(" / ")[0]} every week. Hatches, flows, and what's working.`
          : "Get weekly regional reports. What's hatching, what's rising, and what to tie on."}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 rounded-sm px-3 py-2 text-xs font-['Inter'] outline-none min-w-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: `1px solid ${c.inputBorder}`,
            color: c.text,
          }}
          data-testid="input-newsletter-email"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm px-4 py-2 font-['Inter'] text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: c.accent, color: "#fff" }}
          data-testid="button-newsletter-subscribe"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : "Subscribe"}
        </button>
      </form>
      {error && (
        <p className="mt-2 font-['Inter'] text-xs italic" style={{ color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}
