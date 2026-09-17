import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { stateData } from "@/lib/stateData";
import { useWaterMode } from "@/lib/waterModeContext";

const INSECTS = [
  "Midge", "Blue-Winged Olive", "Caddis", "PMD", "Salmonfly",
  "Green Drake", "Hopper", "Trico", "Hendrickson", "Stonefly",
];

type Intensity = "sparse" | "moderate" | "heavy";

interface Props {
  defaultState?: string;
  onSuccess?: () => void;
}

export function HatchReportForm({ defaultState, onSuccess }: Props) {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";

  // Mode-aware tokens — light palette, no teal/navy
  const tok = isSalt ? {
    bg: "#DDE4EC",
    border: "rgba(61,107,131,0.3)",
    accent: "#3D6B83",
    accentFaint: "rgba(61,107,131,0.12)",
    accentBorder: "rgba(61,107,131,0.4)",
    text: "#1A2A38",
    muted: "rgba(26,34,44,0.65)",
    faint: "rgba(26,34,44,0.38)",
    inputBg: "rgba(255,255,255,0.6)",
    inputBorder: "rgba(61,107,131,0.25)",
  } : {
    bg: "#E4E7D8",
    border: "rgba(167,122,58,0.3)",
    accent: "#A67A3A",
    accentFaint: "rgba(160,118,58,0.12)",
    accentBorder: "rgba(160,118,58,0.4)",
    text: "#2F2B1E",
    muted: "rgba(37,45,30,0.65)",
    faint: "rgba(37,45,30,0.38)",
    inputBg: "rgba(255,255,255,0.6)",
    inputBorder: "rgba(167,122,58,0.25)",
  };

  const stateAbbrs = Object.keys(stateData).sort();
  const [river, setRiver] = useState("");
  const [insect, setInsect] = useState(INSECTS[0]);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [state, setState] = useState(defaultState || stateAbbrs[0]);
  const [waterTemp, setWaterTemp] = useState("");
  const [conditions, setConditions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!river.trim()) { setError("River name is required."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await apiRequest("POST", "/api/hatch-reports", {
        state, river: river.trim(), insect, intensity,
        waterTemp: waterTemp !== "" ? parseFloat(waterTemp) : undefined,
        conditions: conditions.trim() || undefined,
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed."); }
      setSuccess(true);
      setRiver(""); setInsect(INSECTS[0]); setIntensity("moderate"); setWaterTemp(""); setConditions("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  const inputStyle = {
    backgroundColor: tok.inputBg,
    border: `1px solid ${tok.inputBorder}`,
    color: tok.text,
  };

  return (
    <div className="rounded-sm w-full" style={{ backgroundColor: tok.bg, border: `1px solid ${tok.border}` }}>
      <div className="h-0.5 w-full rounded-t-sm" style={{ backgroundColor: tok.accent }} />
      <div className="p-5">
        <p className="font-['Inter'] text-xs uppercase tracking-widest mb-1" style={{ color: tok.accent }}>
          Community Feed
        </p>
        <h3 className="font-['Cormorant_Garamond'] text-lg mb-4" style={{ color: tok.text }}>
          File a Hatch Report
        </h3>

        {success ? (
          <div className="rounded-sm p-4 font-['Inter'] text-sm"
            style={{ backgroundColor: tok.accentFaint, border: `1px solid ${tok.accentBorder}`, color: tok.text }}>
            Report received. Thanks for contributing to the hatch feed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-none w-24">
                <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>State</label>
                <select value={state} onChange={e => setState(e.target.value)}
                  className="w-full rounded-sm px-2.5 py-2 font-['Inter'] text-sm outline-none appearance-none"
                  style={inputStyle}>
                  {stateAbbrs.map(abbr => <option key={abbr} value={abbr}>{abbr}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>River / Water</label>
                <input type="text" value={river} onChange={e => setRiver(e.target.value)}
                  placeholder="e.g. Madison River" maxLength={100}
                  className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>Insect</label>
              <select value={insect} onChange={e => setInsect(e.target.value)}
                className="w-full rounded-sm px-2.5 py-2 font-['Inter'] text-sm outline-none appearance-none"
                style={inputStyle}>
                {INSECTS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>Hatch Intensity</label>
              <div className="flex gap-2">
                {(["sparse", "moderate", "heavy"] as Intensity[]).map(lvl => {
                  const active = intensity === lvl;
                  return (
                    <button key={lvl} type="button" onClick={() => setIntensity(lvl)}
                      className="flex-1 rounded-sm py-2 font-['Inter'] text-xs uppercase tracking-wider transition-colors"
                      style={{
                        backgroundColor: active ? tok.accent : tok.inputBg,
                        border: `1px solid ${active ? tok.accent : tok.inputBorder}`,
                        color: active ? "#fff" : tok.muted,
                      }}>
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>
                Water Temp °F <span style={{ color: tok.faint }}>(optional)</span>
              </label>
              <input type="number" value={waterTemp} onChange={e => setWaterTemp(e.target.value)}
                placeholder="e.g. 52" min={32} max={90} step={0.5}
                className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none" style={inputStyle} />
            </div>

            <div>
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: tok.muted }}>
                Notes <span style={{ color: tok.faint }}>(optional, {200 - conditions.length} chars left)</span>
              </label>
              <textarea value={conditions} onChange={e => setConditions(e.target.value.slice(0, 200))}
                rows={3} placeholder="Conditions, time of day, fly that worked..."
                className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none resize-none" style={inputStyle} />
            </div>

            {error && <p className="font-['Inter'] text-sm italic" style={{ color: "#c0392b" }}>{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full rounded-sm py-2.5 font-['Inter'] text-sm uppercase tracking-widest transition-colors"
              style={{ backgroundColor: submitting ? `${tok.accent}99` : tok.accent, color: "#fff" }}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
