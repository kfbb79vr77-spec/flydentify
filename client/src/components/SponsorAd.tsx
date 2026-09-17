/**
 * SponsorAd.tsx — Contextual sponsor ad unit
 * Shows Orvis, Simms, Patagonia, Costa, Rio ads based on placement + water mode.
 * Subtle, editorial-style — never banner-style.
 */
import { useState, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";

interface Ad {
  id: number;
  brand: string;
  headline: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
}

export default function SponsorAd({ placement }: { placement: string }) {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? "#3D6B83" : "#A67A3A";
  const textColor = isSalt ? "#1A2A38" : "#2F2B1E";

  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`/api/ads?placement=${placement}&mode=${waterMode}`)
      .then(r => r.json())
      .then(data => setAd(data.ad))
      .catch(() => {});
  }, [placement, waterMode]);

  if (!ad || dismissed) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)",
      borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)",
      overflow: "hidden", position: "relative"
    }}>
      {/* Sponsored label */}
      <div style={{
        position: "absolute", top: 10, left: 12, zIndex: 2,
        display: "flex", alignItems: "center", gap: 5
      }}>
        <span style={{
          fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
          fontFamily: "Lora, serif", color: textColor, opacity: 0.38,
          background: "rgba(255,255,255,0.8)", padding: "2px 6px", borderRadius: 2
        }}>Sponsored</span>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute", top: 8, right: 10, zIndex: 2,
          background: "rgba(255,255,255,0.7)", border: "none", cursor: "pointer",
          borderRadius: "50%", width: 22, height: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.55
        }}
      >
        <X size={11} color={textColor} />
      </button>

      <div style={{ display: "flex", minHeight: 90 }}>
        {/* Image strip */}
        <div style={{
          width: 100, flexShrink: 0,
          background: `url(${ad.imageUrl}) center/cover no-repeat`
        }} />
        {/* Copy */}
        <div style={{ flex: 1, padding: "20px 16px 14px" }}>
          <p style={{ fontFamily: "Lora, serif", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 4, marginTop: 2 }}>
            {ad.brand}
          </p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 15, fontWeight: 700, color: textColor, lineHeight: 1.25, marginBottom: 5 }}>
            {ad.headline}
          </p>
          <p style={{ fontFamily: "Lora, serif", fontSize: 11, color: textColor, opacity: 0.6, lineHeight: 1.5, marginBottom: 10 }}>
            {ad.tagline}
          </p>
          <a
            href={ad.ctaUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "Lora, serif", fontSize: 11, fontWeight: 600,
              color: accent, textDecoration: "none"
            }}
          >
            {ad.ctaText} <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
