import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useWaterMode } from "@/lib/waterModeContext";

interface HatchReport {
  id: number;
  userId: number | null;
  state: string;
  river: string;
  insect: string;
  intensity: string;
  waterTemp: number | null;
  conditions: string | null;
  createdAt: number;
}

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function IntensityBadge({ intensity, tok }: { intensity: string; tok: any }) {
  const bg = intensity === "heavy" ? tok.accent
    : intensity === "moderate" ? `${tok.accent}66`
    : tok.faintBg;
  const color = intensity === "heavy" ? "#fff"
    : intensity === "moderate" ? tok.text
    : tok.muted;
  return (
    <span className="inline-block rounded-sm px-2 py-0.5 font-['Inter'] text-xs uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}>
      {intensity}
    </span>
  );
}

interface Props {
  stateAbbr?: string;
  refreshKey?: number;
}

export function HatchReportFeed({ stateAbbr, refreshKey = 0 }: Props) {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";

  const tok = isSalt ? {
    bg: "#DDE4EC",
    border: "rgba(61,107,131,0.3)",
    accent: "#3D6B83",
    text: "#1A2A38",
    muted: "rgba(26,34,44,0.65)",
    faint: "rgba(26,34,44,0.38)",
    faintBg: "rgba(61,107,131,0.10)",
    innerBg: "rgba(255,255,255,0.4)",
    innerBorder: "rgba(61,107,131,0.15)",
  } : {
    bg: "#E4E7D8",
    border: "rgba(167,122,58,0.3)",
    accent: "#A67A3A",
    text: "#2F2B1E",
    muted: "rgba(37,45,30,0.65)",
    faint: "rgba(37,45,30,0.38)",
    faintBg: "rgba(160,118,58,0.10)",
    innerBg: "rgba(255,255,255,0.4)",
    innerBorder: "rgba(167,122,58,0.15)",
  };

  const [reports, setReports] = useState<HatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (stateAbbr) params.set("state", stateAbbr);
      const res = await apiRequest("GET", `/api/hatch-reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load reports.");
      setReports(await res.json());
    } catch (err: any) {
      setError(err.message || "Could not load hatch reports.");
    } finally { setLoading(false); }
  }, [stateAbbr, refreshKey]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="rounded-sm w-full" style={{ backgroundColor: tok.bg, border: `1px solid ${tok.border}` }}>
      <div className="h-0.5 w-full rounded-t-sm" style={{ backgroundColor: tok.accent }} />
      <div className="p-5">
        <p className="font-['Inter'] text-xs uppercase tracking-widest mb-1" style={{ color: tok.accent }}>
          {stateAbbr ? `${stateAbbr} · ` : ""}Recent
        </p>
        <h3 className="font-['Cormorant_Garamond'] text-lg mb-4" style={{ color: tok.text }}>
          Hatch Feed
        </h3>

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-sm h-16 animate-pulse" style={{ backgroundColor: tok.innerBg }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="font-['Inter'] text-sm italic" style={{ color: "#c0392b" }}>{error}</p>
        )}

        {!loading && !error && reports.length === 0 && (
          <p className="font-['Inter'] text-sm italic" style={{ color: tok.muted }}>
            No reports yet for this area. Be the first to file a report.
          </p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="rounded-sm p-3"
                style={{ backgroundColor: tok.innerBg, border: `1px solid ${tok.innerBorder}` }}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: tok.text }}>
                      {r.insect}
                    </span>
                    <IntensityBadge intensity={r.intensity} tok={tok} />
                  </div>
                  <span className="font-['Inter'] text-xs shrink-0" style={{ color: tok.faint }}>
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
                <p className="font-['Inter'] text-sm mt-1" style={{ color: tok.muted }}>
                  {r.river}{r.state && <span style={{ color: tok.faint }}> · {r.state}</span>}
                  {r.waterTemp != null && <span style={{ color: tok.faint }}> · {r.waterTemp}°F</span>}
                </p>
                {r.conditions && (
                  <p className="font-['Inter'] text-xs italic mt-1 leading-snug line-clamp-2" style={{ color: tok.faint }}>
                    {r.conditions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
