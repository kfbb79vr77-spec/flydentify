/**
 * FlyShops.tsx — Fly shop affiliate directory
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, MapPin, ExternalLink, ShoppingBag, Star } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { FLY_SHOPS_DATA } from "@/lib/catalogData";
import logoImg from "@assets/flydentify_logo.png";

const tok = {
  fwBg: "#EFE8D7", swBg: "#EEF2F4",
  fwText: "#2F2B1E", swText: "#1A2A38",
  amber: "#A67A3A", saltBlue: "#3D6B83",
  border: "rgba(0,0,0,0.09)",
};

interface FlyShop {
  id: number;
  name: string;
  state: string;
  city: string;
  website: string;
  affiliateUrl: string;
  description: string;
  specialties: string[];
  brands: string[];
  featured: number;
}

const STATE_LABELS: Record<string, string> = {
  WY: "Wyoming", CO: "Colorado", TX: "Texas", ID: "Idaho",
  RI: "Rhode Island", WI: "Wisconsin", MT: "Montana", OR: "Oregon",
};

export default function FlyShops() {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? tok.saltBlue : tok.amber;
  const bg = isSalt ? tok.swBg : tok.fwBg;
  const textColor = isSalt ? tok.swText : tok.fwText;

  const [shops, setShops] = useState<FlyShop[]>(FLY_SHOPS_DATA as FlyShop[]);
  const [loading, setLoading] = useState(false);
  const [filterState, setFilterState] = useState("ALL");

  useEffect(() => {
    fetch("/api/fly-shops")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setShops(data as FlyShop[]); })
      .catch(() => {});
  }, []);

  const states = ["ALL", ...Array.from(new Set(shops.map(s => s.state))).sort()];
  const filtered = filterState === "ALL" ? shops : shops.filter(s => s.state === filterState);

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
          <ShoppingBag size={15} style={{ color: accent }} />
          <span style={{ fontSize: 11, fontFamily: "Lora, serif", opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Fly shops
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color: textColor, marginBottom: 8, lineHeight: 1.2 }}>
          Fly shops we trust
        </h1>
        <p style={{ fontFamily: "Lora, serif", fontSize: 15, opacity: 0.65, lineHeight: 1.65, maxWidth: 520, marginBottom: 28 }}>
          Vetted independent fly shops and outfitters. Every purchase through these links helps keep Flydentify free for the next angler.
        </p>

        {/* Affiliate disclosure */}
        <div style={{
          background: `${accent}0D`, border: `1px solid ${accent}22`,
          borderRadius: 4, padding: "10px 16px", marginBottom: 24
        }}>
          <p style={{ fontFamily: "Lora, serif", fontSize: 11, color: textColor, opacity: 0.65, lineHeight: 1.5 }}>
            Flydentify earns a small commission on purchases made through these links at no cost to you. We only list shops whose quality we'd stake our name on.
          </p>
        </div>

        {/* State filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {states.map(s => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              style={{
                padding: "6px 14px", borderRadius: 4,
                border: `1px solid ${filterState === s ? accent : tok.border}`,
                background: filterState === s ? accent : "transparent",
                color: filterState === s ? "#fff" : textColor,
                fontFamily: "Lora, serif", fontSize: 12, cursor: "pointer",
                opacity: filterState === s ? 1 : 0.65,
              }}
            >
              {s === "ALL" ? "All" : (STATE_LABELS[s] || s)}
            </button>
          ))}
        </div>

        {loading && <p style={{ fontFamily: "Lora, serif", fontSize: 14, opacity: 0.45 }}>Loading shops...</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(shop => (
            <div key={shop.id} style={{
              background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
              borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden"
            }}>
              <div style={{ padding: "18px 20px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 17, fontWeight: 700, color: textColor, lineHeight: 1.2, marginBottom: 3 }}>
                      {shop.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} style={{ color: accent }} />
                      <span style={{ fontFamily: "Lora, serif", fontSize: 12, opacity: 0.6, color: textColor }}>
                        {shop.city}, {STATE_LABELS[shop.state] || shop.state}
                      </span>
                    </div>
                  </div>
                  {shop.featured === 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Star size={11} style={{ color: accent }} />
                      <span style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Lora, serif", color: accent }}>
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: "Lora, serif", fontSize: 13, color: textColor, opacity: 0.72, lineHeight: 1.6, marginBottom: 12 }}>
                  {shop.description}
                </p>
                {/* Specialties */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {shop.specialties.map(s => (
                    <span key={s} style={{
                      fontSize: 10, fontFamily: "Lora, serif", padding: "2px 8px",
                      border: `1px solid ${accent}44`, borderRadius: 2, color: accent
                    }}>{s}</span>
                  ))}
                </div>
                {/* Brands */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {shop.brands.map(b => (
                    <span key={b} style={{
                      fontSize: 10, fontFamily: "Lora, serif", padding: "2px 8px",
                      background: "rgba(0,0,0,0.05)", borderRadius: 2,
                      color: textColor, opacity: 0.6
                    }}>{b}</span>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <a
                  href={shop.affiliateUrl}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, padding: "12px 20px",
                    background: accent, color: "#fff", textDecoration: "none",
                    fontFamily: "Lora, serif", fontSize: 13, fontWeight: 600
                  }}
                >
                  Visit {shop.name} <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Shop partnership CTA */}
        <div style={{
          marginTop: 40, background: "rgba(255,255,255,0.55)", borderRadius: 4,
          border: `1px solid ${tok.border}`, padding: "24px"
        }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 6 }}>
            Own a fly shop?
          </p>
          <p style={{ fontFamily: "Lora, serif", fontSize: 13, opacity: 0.65, color: textColor, lineHeight: 1.55, marginBottom: 12 }}>
            Partner with Flydentify and reach anglers actively planning their next trip. Affiliate listings are free to join.
          </p>
          <a href="mailto:partners@flydentify.com?subject=Fly shop partnership" style={{
            color: accent, fontFamily: "Lora, serif", fontSize: 13, fontWeight: 600,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5
          }}>
            Get in touch <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
