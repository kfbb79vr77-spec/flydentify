/**
 * Guides.tsx — Guide booking directory
 * Freshwater + saltwater guides. Affiliate referral links.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, MapPin, DollarSign, ExternalLink, Instagram, Fish, Waves } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { GUIDES_DATA } from "@/lib/catalogData";
import logoImg from "@assets/flydentify_logo.png";

const tok = {
  fwBg: "#EFE8D7", swBg: "#EEF2F4",
  fwText: "#2F2B1E", swText: "#1A2A38",
  amber: "#A67A3A", saltBlue: "#3D6B83",
  border: "rgba(0,0,0,0.09)",
  card: "rgba(255,255,255,0.7)",
};

interface Guide {
  id: number;
  name: string;
  businessName: string;
  state: string;
  region: string;
  specialty: string[];
  targetSpecies: string[];
  homeWater: string;
  bio: string;
  rateHalfDay: number;
  rateFullDay: number;
  website: string;
  instagram?: string;
  photoUrl: string;
  isAffiliate: number;
  affiliateCode: string;
  featured: number;
}

const STATE_LABELS: Record<string, string> = {
  MT: "Montana", CO: "Colorado", FL: "Florida",
  NM: "New Mexico", SC: "South Carolina", OR: "Oregon",
  WY: "Wyoming", ID: "Idaho", WA: "Washington", CA: "California",
};

export default function Guides() {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? tok.saltBlue : tok.amber;
  const bg = isSalt ? tok.swBg : tok.fwBg;
  const textColor = isSalt ? tok.swText : tok.fwText;

  const [guides, setGuides] = useState<Guide[]>(GUIDES_DATA as Guide[]);
  const [loading, setLoading] = useState(false);
  const [filterState, setFilterState] = useState("ALL");

  useEffect(() => {
    // Static data already loaded — try to augment with live API (non-blocking)
    const mode = waterMode === "salt" ? "salt" : "fresh";
    fetch(`/api/guides?mode=${mode}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setGuides(data as Guide[]); })
      .catch(() => {});
  }, [waterMode]);

  const states = ["ALL", ...Array.from(new Set(guides.map(g => g.state))).sort()];
  const filtered = filterState === "ALL" ? guides : guides.filter(g => g.state === filterState);
  const featured = filtered.filter(g => g.featured);
  const rest = filtered.filter(g => !g.featured);

  function handleBook(guide: Guide) {
    // Track referral click — in production send to analytics
    const url = guide.website + (guide.affiliateCode ? `?ref=${guide.affiliateCode}` : "");
    window.open(url, "_blank", "noopener");
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: bg, borderBottom: `1px solid ${tok.border}`,
        display: "flex", alignItems: "center", gap: 16, padding: "12px 20px"
      }}>
        <Link href="/home" style={{ display: "flex", alignItems: "center", color: textColor, opacity: 0.65, cursor: "pointer" }}>
          <ChevronLeft size={18} />
        </Link>
        <img src={logoImg} alt="Flydentify" style={{ height: 28, filter: "brightness(0)", opacity: 0.85 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {isSalt ? <Waves size={16} style={{ color: accent }} /> : <Fish size={16} style={{ color: accent }} />}
          <span style={{ fontSize: 11, fontFamily: "Lora, serif", opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {isSalt ? "Saltwater" : "Freshwater"} guides
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color: textColor, marginBottom: 8, lineHeight: 1.2 }}>
            Find your guide
          </h1>
          <p style={{ fontFamily: "Lora, serif", fontSize: 15, opacity: 0.65, lineHeight: 1.65, maxWidth: 520 }}>
            Every guide listed here was vetted by the Flydentify team. Book direct — no middleman, no platform fees.
          </p>
          <p style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.85, marginTop: 8, fontStyle: "italic" }}>
            Tell them Flydentify hooked you up.
          </p>
        </div>

        {/* State filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {states.map(s => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              style={{
                padding: "6px 14px", borderRadius: 4, border: `1px solid ${filterState === s ? accent : tok.border}`,
                background: filterState === s ? accent : "transparent",
                color: filterState === s ? "#fff" : textColor,
                fontFamily: "Lora, serif", fontSize: 12, cursor: "pointer",
                opacity: filterState === s ? 1 : 0.65,
                transition: "all 0.15s",
              }}
            >
              {s === "ALL" ? "All regions" : (STATE_LABELS[s] || s)}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ fontFamily: "Lora, serif", fontSize: 14, opacity: 0.45 }}>Loading guides...</p>
        )}

        {/* Featured guides */}
        {featured.length > 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 12 }}>
              Featured
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {featured.map(guide => <GuideCard key={guide.id} guide={guide} accent={accent} textColor={textColor} onBook={handleBook} />)}
            </div>
          </>
        )}

        {/* All others */}
        {rest.length > 0 && (
          <>
            {featured.length > 0 && (
              <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 12 }}>
                More guides
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {rest.map(guide => <GuideCard key={guide.id} guide={guide} accent={accent} textColor={textColor} onBook={handleBook} />)}
            </div>
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            background: tok.card, borderRadius: 4, border: `1px solid ${tok.border}`,
            padding: "40px 24px", textAlign: "center"
          }}>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: textColor, marginBottom: 8 }}>No guides listed yet for this region</p>
            <p style={{ fontFamily: "Lora, serif", fontSize: 13, opacity: 0.55, color: textColor }}>
              Are you a guide? <a href="mailto:guides@flydentify.com" style={{ color: accent }}>Apply to be listed</a>
            </p>
          </div>
        )}

        {/* Guide application CTA */}
        <div style={{
          marginTop: 40, background: tok.card, borderRadius: 4,
          border: `1px solid ${tok.border}`, padding: "24px",
          display: "flex", flexDirection: "column", gap: 8
        }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor }}>
            Are you a guide?
          </p>
          <p style={{ fontFamily: "Lora, serif", fontSize: 13, opacity: 0.65, color: textColor, lineHeight: 1.55 }}>
            List your service on Flydentify at no cost. Affiliate partners earn a referral fee on every booking that comes through the app.
          </p>
          <a href="mailto:guides@flydentify.com?subject=Guide listing inquiry" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: accent, fontFamily: "Lora, serif", fontSize: 13, fontWeight: 600,
            textDecoration: "none", marginTop: 4
          }}>
            Apply to be listed <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav accent={accent} textColor={textColor} bg={bg} />
    </div>
  );
}

function GuideCard({ guide, accent, textColor, onBook }: {
  guide: Guide; accent: string; textColor: string; onBook: (g: Guide) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
      borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", gap: 0 }}>
        {/* Photo */}
        <div style={{
          width: 90, flexShrink: 0,
          background: `url(${guide.photoUrl}) center/cover no-repeat`,
          minHeight: 120
        }} />
        {/* Info */}
        <div style={{ flex: 1, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
                {guide.name}
              </p>
              <p style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.6, color: textColor }}>
                {guide.businessName}
              </p>
            </div>
            {guide.featured === 1 && (
              <span style={{
                fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                background: accent, color: "#fff", padding: "2px 7px", borderRadius: 2,
                fontFamily: "Lora, serif"
              }}>Featured</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <MapPin size={11} style={{ color: accent }} />
            <span style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.65, color: textColor }}>
              {guide.homeWater}, {guide.state}
            </span>
          </div>
          {/* Species */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {guide.targetSpecies.map(s => (
              <span key={s} style={{
                fontSize: 10, fontFamily: "Lora, serif", padding: "2px 8px",
                border: `1px solid ${accent}44`, borderRadius: 2, color: accent
              }}>{s}</span>
            ))}
          </div>
          {/* Rates */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <DollarSign size={11} style={{ color: textColor, opacity: 0.45 }} />
              <span style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.65, color: textColor }}>
                Half day ${guide.rateHalfDay}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <DollarSign size={11} style={{ color: textColor, opacity: 0.45 }} />
              <span style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.65, color: textColor }}>
                Full day ${guide.rateFullDay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio expand */}
      {expanded && (
        <div style={{ padding: "0 18px 14px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontFamily: "Lora, serif", fontSize: 13, color: textColor, opacity: 0.75, lineHeight: 1.65, paddingTop: 12 }}>
            {guide.bio}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: "flex", gap: 0, borderTop: "1px solid rgba(0,0,0,0.06)"
      }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            flex: 1, padding: "11px 0", background: "none", border: "none",
            borderRight: "1px solid rgba(0,0,0,0.06)", cursor: "pointer",
            fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.55
          }}
        >
          {expanded ? "Less" : "About"}
        </button>
        {guide.instagram && (
          <a
            href={`https://instagram.com/${guide.instagram.replace("@", "")}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, padding: "11px 0", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 4, textDecoration: "none",
              borderRight: "1px solid rgba(0,0,0,0.06)",
              color: textColor, opacity: 0.55, fontFamily: "Lora, serif", fontSize: 12
            }}
          >
            <Instagram size={12} /> Instagram
          </a>
        )}
        <button
          onClick={() => onBook(guide)}
          style={{
            flex: 1.5, padding: "11px 0", background: accent, border: "none",
            cursor: "pointer", fontFamily: "Lora, serif", fontSize: 13,
            fontWeight: 600, color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6
          }}
        >
          Book <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

function BottomNav({ accent, textColor, bg }: { accent: string; textColor: string; bg: string }) {
  const links = [
    { label: "Home", href: "/home" },
    { label: "Finder", href: "/finder" },
    { label: "Hatch", href: "/hatch-chart" },
    { label: "Guides", href: "/guides", active: true },
    { label: "Trips", href: "/trips" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: bg, borderTop: "1px solid rgba(0,0,0,0.09)",
      display: "flex", zIndex: 50
    }}>
      {links.map(l => (
        <Link key={l.href} href={l.href} style={{
          flex: 1, padding: "10px 4px 12px", display: "flex", flexDirection: "column",
          alignItems: "center", textDecoration: "none",
          color: l.active ? accent : textColor,
          opacity: l.active ? 1 : 0.45,
        }}>
          <span style={{ fontSize: 10, fontFamily: "Lora, serif", letterSpacing: "0.04em" }}>{l.label}</span>
        </Link>
      ))}
    </nav>
  );
}
