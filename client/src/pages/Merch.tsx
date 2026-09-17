/**
 * Merch.tsx — Flydentify branded merchandise
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ShoppingBag, Tag } from "lucide-react";
import { useWaterMode } from "@/lib/waterModeContext";
import { MERCH_DATA } from "@/lib/catalogData";
import logoImg from "@assets/flydentify_logo.png";

const tok = {
  fwBg: "#EFE8D7", swBg: "#EEF2F4",
  fwText: "#2F2B1E", swText: "#1A2A38",
  amber: "#A67A3A", saltBlue: "#3D6B83",
  border: "rgba(0,0,0,0.09)",
};

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string | null;
  inStock: boolean;
  sizes: string[] | null;
  colors: string[] | null;
}

export default function Merch() {
  const { waterMode } = useWaterMode();
  const isSalt = waterMode === "salt";
  const accent = isSalt ? tok.saltBlue : tok.amber;
  const bg = isSalt ? tok.swBg : tok.fwBg;
  const textColor = isSalt ? tok.swText : tok.fwText;

  const [items, setItems] = useState<MerchItem[]>(MERCH_DATA as MerchItem[]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, { color?: string; size?: string }>>({});
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/merch")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setItems(data as MerchItem[]); })
      .catch(() => {});
  }, []);

  function addToCart(item: MerchItem) {
    setCart(c => [...c, item.id]);
    setToast(`${item.name} added`);
    setTimeout(() => setToast(null), 2200);
  }

  const inStock = items.filter(i => i.inStock);
  const comingSoon = items.filter(i => !i.inStock);

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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {cart.length > 0 && (
            <div style={{ position: "relative" }}>
              <ShoppingBag size={18} style={{ color: textColor, opacity: 0.7 }} />
              <span style={{
                position: "absolute", top: -5, right: -6, background: accent,
                color: "#fff", fontSize: 9, fontFamily: "Lora, serif", fontWeight: 700,
                width: 14, height: 14, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{cart.length}</span>
            </div>
          )}
          <span style={{ fontSize: 11, fontFamily: "Lora, serif", opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Merch
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "rgba(30,30,28,0.92)", backdropFilter: "blur(8px)",
          color: "#fff", fontFamily: "Lora, serif", fontSize: 13,
          padding: "10px 20px", borderRadius: 4, zIndex: 200,
          animation: "fadeIn 0.2s ease"
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color: textColor, marginBottom: 8, lineHeight: 1.2 }}>
          Gear up
        </h1>
        <p style={{ fontFamily: "Lora, serif", fontSize: 15, opacity: 0.65, lineHeight: 1.65, maxWidth: 480, marginBottom: 32 }}>
          Limited-run Flydentify goods. Designed for people who fish, built to last the season.
        </p>

        {loading && <p style={{ fontFamily: "Lora, serif", fontSize: 14, opacity: 0.45 }}>Loading...</p>}

        {/* In-stock grid */}
        {inStock.length > 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 14 }}>
              Available now
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16, marginBottom: 36
            }}>
              {inStock.map(item => (
                <MerchCard
                  key={item.id} item={item} accent={accent} textColor={textColor}
                  selState={selected[item.id] || {}}
                  onSelect={(field, val) => setSelected(s => ({ ...s, [item.id]: { ...s[item.id], [field]: val } }))}
                  onAdd={() => addToCart(item)}
                />
              ))}
            </div>
          </>
        )}

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.38, fontFamily: "Lora, serif", marginBottom: 14 }}>
              Coming soon
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {comingSoon.map(item => (
                <div key={item.id} style={{
                  background: "rgba(255,255,255,0.55)", borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", opacity: 0.7
                }}>
                  <div style={{
                    height: 200, background: `url(${item.image}) center/cover no-repeat`,
                    filter: "grayscale(0.6)"
                  }} />
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.6, lineHeight: 1.5, marginBottom: 10 }}>
                      {item.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor }}>${item.price}</span>
                      <span style={{
                        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                        fontFamily: "Lora, serif", color: textColor, opacity: 0.45,
                        border: "1px solid rgba(0,0,0,0.15)", borderRadius: 2, padding: "3px 8px"
                      }}>Notify me</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer note */}
        <p style={{ fontFamily: "Lora, serif", fontSize: 11, opacity: 0.38, color: textColor, marginTop: 40, textAlign: "center", lineHeight: 1.6 }}>
          Merch ships within 7-10 business days. Printed and fulfilled in the USA.<br />
          Questions? <a href="mailto:merch@flydentify.com" style={{ color: accent }}>merch@flydentify.com</a>
        </p>
      </div>
    </div>
  );
}

function MerchCard({ item, accent, textColor, selState, onSelect, onAdd }: {
  item: MerchItem; accent: string; textColor: string;
  selState: { color?: string; size?: string };
  onSelect: (field: string, val: string) => void;
  onAdd: () => void;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
      borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden",
      display: "flex", flexDirection: "column"
    }}>
      {/* Image */}
      <div style={{ position: "relative", height: 220, background: "#F9F8F5" }}>
        <div style={{ height: "100%", background: `url(${item.image}) center/contain no-repeat`, backgroundColor: "#F9F8F5" }} />
        {item.tag && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: accent, color: "#fff",
            fontFamily: "Lora, serif", fontSize: 9,
            fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 2,
            display: "flex", alignItems: "center", gap: 4
          }}>
            <Tag size={9} /> {item.tag}
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: textColor, lineHeight: 1.2, flex: 1 }}>
            {item.name}
          </p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, fontWeight: 700, color: accent, flexShrink: 0, marginLeft: 10 }}>
            ${item.price}
          </p>
        </div>
        <p style={{ fontFamily: "Lora, serif", fontSize: 12, color: textColor, opacity: 0.65, lineHeight: 1.55 }}>
          {item.description}
        </p>

        {/* Color selector */}
        {item.colors && (
          <div>
            <p style={{ fontSize: 10, opacity: 0.45, fontFamily: "Lora, serif", color: textColor, marginBottom: 5 }}>Color</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {item.colors.map(c => (
                <button key={c} onClick={() => onSelect("color", c)} style={{
                  padding: "3px 10px", borderRadius: 4, border: `1px solid ${selState.color === c ? accent : "rgba(0,0,0,0.15)"}`,
                  background: selState.color === c ? `${accent}15` : "transparent",
                  fontFamily: "Lora, serif", fontSize: 11, color: textColor,
                  cursor: "pointer", transition: "all 0.12s"
                }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {item.sizes && (
          <div>
            <p style={{ fontSize: 10, opacity: 0.45, fontFamily: "Lora, serif", color: textColor, marginBottom: 5 }}>Size</p>
            <div style={{ display: "flex", gap: 6 }}>
              {item.sizes.map(s => (
                <button key={s} onClick={() => onSelect("size", s)} style={{
                  width: 36, height: 36, borderRadius: 4,
                  border: `1px solid ${selState.size === s ? accent : "rgba(0,0,0,0.15)"}`,
                  background: selState.size === s ? accent : "transparent",
                  color: selState.size === s ? "#fff" : textColor,
                  fontFamily: "Lora, serif", fontSize: 11, cursor: "pointer",
                  transition: "all 0.12s"
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Add to cart */}
      <button
        onClick={onAdd}
        style={{
          margin: "0 16px 16px", padding: "11px 0", background: accent,
          color: "#fff", border: "none", borderRadius: 4, cursor: "pointer",
          fontFamily: "Lora, serif", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7
        }}
      >
        <ShoppingBag size={14} /> Add to cart
      </button>
    </div>
  );
}
