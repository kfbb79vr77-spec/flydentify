/**
 * Conservation.tsx — Conservation partners + membership
 * Flydentify donates 10% of membership revenue to partner orgs.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ExternalLink, Heart, Leaf } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { CONSERVATION_DATA } from "@/lib/catalogData";
import logoImg from "@assets/flydentify_logo.png";

const tok = {
  fwBg: "#EFE8D7", swBg: "#EEF2F4",
  fwText: "#2F2B1E", swText: "#1A2A38",
  amber: "#A67A3A", saltBlue: "#3D6B83",
  border: "rgba(0,0,0,0.09)",
  green: "#437A22",
};

interface Org {
  id: number;
  name: string;
  shortName: string;
  mission: string;
  website: string;
  donateUrl: string;
  membershipUrl?: string;
  focusArea: string;
  national: number;
  state?: string;
  referralCode?: string;
  flydentifyDonatesPct: number;
}

export default function Conservation() {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? tok.saltBlue : tok.amber;
  const bg = isSalt ? tok.swBg : tok.fwBg;
  const textColor = isSalt ? tok.swText : tok.fwText;

  const [orgs, setOrgs] = useState<Org[]>(CONSERVATION_DATA as Org[]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/conservation?mode=${waterMode === "salt" ? "salt" : "fresh"}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setOrgs(data as Org[]); })
      .catch(() => {});
  }, [waterMode]);

  const national = orgs.filter(o => o.national === 1);
  const regional = orgs.filter(o => o.national === 0);

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: bg,
        borderBottom: `1px solid ${tok.border}`,
        display: "flex", alignItems: "center", gap: 16, padding: "12px 20px"
      }}>
        <Link href="/home" style={{ display: "flex", alignItems: "center", color: textColor, opacity: 0.65, cursor: "pointer" }}>
          <ChevronLeft size={18} />
        </Link>
        <img src={logoImg} alt="Flydentify" style={{ height: 28, filter: "brightness(0)", opacity: 0.85 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <Leaf size={15} style={{ color: tok.green }} />
          <span style={{ fontSize: 11, fontFamily: "Lora, serif", opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Conservation
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Hero */}
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color: textColor, marginBottom: 8, lineHeight: 1.2 }}>
          Fish well. Give back.
        </h1>
        <p style={{ fontFamily: "Lora, serif", fontSize: 15, opacity: 0.65, lineHeight: 1.65, maxWidth: 520, marginBottom: 10 }}>
          Every Flydentify subscription puts up to 10% toward the conservation organizations protecting the water we fish.
        </p>
        <p style={{ fontFamily: "Lora, serif", fontSize: 13, opacity: 0.5, color: textColor, marginBottom: 32 }}>
          No opt-in required. It happens automatically on every active subscription.
        </p>

        {/* How it works */}
        <div style={{
          background: `${tok.green}10`, border: `1px solid ${tok.green}30`,
          borderRadius: 4, padding: "20px 22px", marginBottom: 36,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20
        }}>
          {[
            { num: "01", label: "Subscribe to Flydentify" },
            { num: "02", label: "Up to 10% goes to conservation" },
            { num: "03", label: "Clean water. More fish." },
          ].map(({ num, label }) => (
            <div key={num} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 700, color: tok.green, lineHeight: 1 }}>{num}</p>
              <p style={{ fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.7, marginTop: 6, lineHeight: 1.45 }}>{label}</p>
            </div>
          ))}
        </div>

        {loading && <p style={{ fontFamily: "Lora, serif", fontSize: 14, opacity: 0.45 }}>Loading partners...</p>}

        {/* National orgs */}
        {national.length > 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 14 }}>
              National partners
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {national.map(org => <OrgCard key={org.id} org={org} accent={accent} textColor={textColor} green={tok.green} />)}
            </div>
          </>
        )}

        {/* Regional orgs */}
        {regional.length > 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 14 }}>
              Regional partners
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {regional.map(org => <OrgCard key={org.id} org={org} accent={accent} textColor={textColor} green={tok.green} />)}
            </div>
          </>
        )}

        {/* Membership CTA */}
        <div style={{
          background: `${accent}0E`, border: `1px solid ${accent}25`,
          borderRadius: 4, padding: "28px 24px", textAlign: "center"
        }}>
          <Heart size={22} style={{ color: accent, marginBottom: 10 }} />
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: textColor, marginBottom: 8 }}>
            Ready to make it count?
          </p>
          <p style={{ fontFamily: "Lora, serif", fontSize: 13, opacity: 0.65, color: textColor, lineHeight: 1.6, marginBottom: 20, maxWidth: 360, margin: "0 auto 20px" }}>
            Subscribe to Flydentify. Use the best fly fishing app on the market. Help keep wild fish wild.
          </p>
          <Link href="/pricing" style={{
            display: "inline-block", background: accent, color: "#fff",
            borderRadius: 4, padding: "12px 28px", fontFamily: "Lora, serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none"
          }}>
            Start your free trial
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrgCard({ org, accent, textColor, green }: {
  org: Org; accent: string; textColor: string; green: string;
}) {
  const focusColors: Record<string, string> = {
    trout: "#437A22", salmon: "#6E522B", steelhead: "#3D6B83",
    saltwater: "#3D6B83", all: "#437A22",
  };
  const fc = focusColors[org.focusArea] || green;

  return (
    <div style={{
      background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
      borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden"
    }}>
      <div style={{ padding: "18px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 17, fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
              {org.name}
            </p>
            <span style={{
              display: "inline-block", marginTop: 4, fontSize: 9,
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "Lora, serif", color: fc,
              padding: "2px 7px", border: `1px solid ${fc}44`, borderRadius: 2
            }}>
              {org.focusArea === "all" ? "All species" : org.focusArea}
            </span>
          </div>
          <div style={{
            background: `${green}15`, border: `1px solid ${green}30`,
            borderRadius: 4, padding: "6px 10px", textAlign: "center", flexShrink: 0
          }}>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 700, color: green, lineHeight: 1 }}>
              {org.flydentifyDonatesPct}%
            </p>
            <p style={{ fontFamily: "Lora, serif", fontSize: 9, color: green, opacity: 0.7, marginTop: 2 }}>donated</p>
          </div>
        </div>
        <p style={{ fontFamily: "Lora, serif", fontSize: 13, color: textColor, opacity: 0.72, lineHeight: 1.65 }}>
          {org.mission}
        </p>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <a
          href={org.donateUrl}
          target="_blank" rel="noopener noreferrer"
          style={{
            flex: 1, padding: "11px 0", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6, textDecoration: "none",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            fontFamily: "Lora, serif", fontSize: 12, color: green, fontWeight: 600
          }}
        >
          <Heart size={12} /> Donate
        </a>
        {org.membershipUrl && (
          <a
            href={org.membershipUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, padding: "11px 0", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6, textDecoration: "none",
              fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.65
            }}
          >
            Join <ExternalLink size={11} />
          </a>
        )}
        <a
          href={org.website}
          target="_blank" rel="noopener noreferrer"
          style={{
            flex: 1, padding: "11px 0", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6, textDecoration: "none",
            fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.55
          }}
        >
          Learn more <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
