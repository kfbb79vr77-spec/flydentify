import { useState, useEffect } from "react";
import { Fish, MapPin, Thermometer, Droplets, Clock, ChevronDown, ChevronUp, Plus, Send, Truck, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { Link } from "wouter";

// ── Types ──────────────────────────────────────────────────────────────────────
interface CatchReportRow {
  id: number;
  displayName: string;
  waterMode: string;
  state: string;
  river: string;
  species: string;
  fly: string;
  method: string;
  catchCount: number;
  waterTemp?: number | null;
  conditions: string;
  hatch?: string | null;
  notes?: string | null;
  createdAt: number;
}

interface StockingEvent {
  id: number;
  state: string;
  river: string;
  county?: string | null;
  species: string;
  sizeInches?: number | null;
  countStocked?: number | null;
  stockDate: string;
  sourceUrl?: string | null;
  notes?: string | null;
}

// ── Static data ────────────────────────────────────────────────────────────────
const US_STATES = [
  "AK","AL","AR","AZ","CA","CO","CT","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA",
  "MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK",
  "OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"
];

const FW_SPECIES = [
  "Rainbow Trout","Brown Trout","Brook Trout","Cutthroat Trout","Bull Trout","Apache Trout",
  "Steelhead","Atlantic Salmon","Chinook Salmon","Coho Salmon","Sockeye Salmon","Pink Salmon",
  "Dolly Varden","Largemouth Bass","Smallmouth Bass","Walleye","Pike","Muskie","Perch"
];
const SW_SPECIES = [
  "Bonefish","Tarpon","Permit","Redfish / Red Drum","Snook","Striped Bass","Bluefish",
  "False Albacore","Mahi-Mahi","Cobia","Flounder","Spotted Seatrout","Weakfish","Spanish Mackerel"
];

const FW_FLIES = [
  "Adams","Parachute Adams","Elk Hair Caddis","PMD Sparkle Dun","Pale Morning Dun","BWO",
  "CDC BWO","Blue Wing Olive","Hare's Ear Nymph","Pheasant Tail","Copper John","Zebra Midge",
  "Dave's Hopper","Stimulator","Elk Hair Hopper","Stonefly Nymph","Woolly Bugger","Muddler Minnow",
  "Clouser Minnow","Griffith's Gnat","Light Cahill","March Brown","Green Drake","Sulphur",
  "Skwala","Salmonfly","Golden Stonefly","Early Black Stonefly"
];
const SW_FLIES = [
  "Crazy Charlie","Gotcha","Del Brown's Crab","Clouser Minnow","Deceiver","Tarpon Toad",
  "Sea-Habit Bucktail","EP Spawning Shrimp","Borski Slider","Half and Half","Black Death",
  "Gurgler","Cockroach","Permit Crab"
];

const METHODS = ["dry","nymph","streamer","wet","emerger","popper","crab","shrimp"];
const CONDITIONS = ["poor","fair","good","excellent"];

const conditionColor = (c: string) => ({
  poor: "#6B7280", fair: "#D97706", good: "#059669", excellent: "#2563EB"
}[c] || "#6B7280");

const conditionLabel = (c: string) => ({
  poor: "Tough", fair: "Fair", good: "Good", excellent: "On Fire"
}[c] || c);

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function stockDaysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

function stockFreshness(dateStr: string): "fresh" | "recent" | "older" {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff <= 7) return "fresh";
  if (diff <= 21) return "recent";
  return "older";
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CatchReport() {
  const [waterMode, setWaterMode] = useState<"fresh" | "salt">("fresh");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"reports" | "stocking">("reports");
  const [filterState, setFilterState] = useState("");
  const [filterRiver, setFilterRiver] = useState("");
  const [reports, setReports] = useState<CatchReportRow[]>([]);
  const [stocking, setStocking] = useState<StockingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    displayName: "",
    state: "",
    river: "",
    species: "",
    fly: "",
    method: "dry",
    catchCount: 1,
    waterTemp: "",
    conditions: "good",
    hatch: "",
    notes: "",
  });

  const s = waterMode === "fresh"
    ? { bg: "#EFE8D7", dark: "#0D1B33", accent: "#A67A3A", text: "#2F2B1E", border: "rgba(167,122,58,0.2)", muted: "rgba(37,45,30,0.5)", faint: "rgba(37,45,30,0.35)", strip: "#f5ede0" }
    : { bg: "#EEF2F4", dark: "#060D1A", accent: "#3D6B83", text: "#1A2A38", border: "rgba(61,107,131,0.2)", muted: "rgba(26,34,44,0.5)", faint: "rgba(26,34,44,0.35)", strip: "#e8f0f8" };

  const speciesList = waterMode === "fresh" ? FW_SPECIES : SW_SPECIES;
  const flyList = waterMode === "fresh" ? FW_FLIES : SW_FLIES;

  // Load reports
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterState) params.set("state", filterState);
    if (filterRiver) params.set("river", filterRiver);
    params.set("limit", "40");
    fetch(`/api/catch-reports?${params}`)
      .then(r => r.json())
      .then(data => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterState, filterRiver, submitted]);

  // Load stocking
  useEffect(() => {
    if (activeTab !== "stocking" || waterMode !== "fresh") return;
    const state = filterState || "MT";
    fetch(`/api/stocking?state=${state}&days=60`)
      .then(r => r.json())
      .then(data => setStocking(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeTab, filterState, waterMode]);

  const handleSubmit = async () => {
    if (!form.state || !form.river || !form.species || !form.fly) return;
    try {
      await fetch("/api/catch-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, waterMode, catchCount: Number(form.catchCount) }),
      });
      setShowForm(false);
      setSubmitted(s => !s);
      setForm({ displayName:"", state:"", river:"", species:"", fly:"", method:"dry", catchCount:1, waterTemp:"", conditions:"good", hatch:"", notes:"" });
    } catch {}
  };

  return (
    <div style={{ backgroundColor: s.bg, minHeight: "100vh" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 border-b" style={{ backgroundColor: s.bg, borderColor: s.border }}>
        <div className="flex items-center gap-4">
          <Link href="/home">
            <span className="font-['Inter'] text-xs uppercase tracking-widest cursor-pointer" style={{ color: s.muted }}>Home</span>
          </Link>
          <span style={{ color: s.faint }}>|</span>
          <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: s.text }}>Catch Reports</span>
        </div>
        {/* FW/SW toggle */}
        <div className="flex rounded-sm overflow-hidden" style={{ border: `1px solid ${s.border}` }}>
          {(["fresh","salt"] as const).map(m => (
            <button key={m} onClick={() => setWaterMode(m)}
              className="px-3 py-1.5 font-['Inter'] text-xs uppercase tracking-widest transition-colors"
              style={{ backgroundColor: waterMode===m ? s.accent : "transparent", color: waterMode===m ? "#fff" : s.muted }}>
              {m === "fresh" ? "FW" : "SW"}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-['Cormorant_Garamond'] text-3xl mb-1" style={{ color: s.text }}>
                Hyper-local Intelligence
              </h1>
              <p className="font-['Inter'] text-sm italic" style={{ color: s.muted }}>
                Real catches, real hatches, real time. Powered by anglers like you.
              </p>
            </div>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-['Inter'] text-sm transition-opacity hover:opacity-80 whitespace-nowrap min-h-[44px]"
              style={{ backgroundColor: s.accent, color: "#fff" }}>
              <Plus size={15} />
              Log a catch
            </button>
          </div>
        </div>

        {/* Log Catch Form */}
        {showForm && (
          <div className="mb-8 rounded-sm p-6" style={{ backgroundColor: s.strip, border: `1px solid ${s.border}` }}>
            <h2 className="font-['Cormorant_Garamond'] text-lg mb-5" style={{ color: s.text }}>Log Your Catch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Your name (optional)</label>
                <input value={form.displayName} onChange={e => setForm(f=>({...f,displayName:e.target.value}))}
                  placeholder="Anonymous Angler"
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>State *</label>
                <select value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))}
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  <option value="">Select state</option>
                  {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>River / Water *</label>
                <input value={form.river} onChange={e => setForm(f=>({...f,river:e.target.value}))}
                  placeholder="e.g. Madison River"
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Species *</label>
                <select value={form.species} onChange={e => setForm(f=>({...f,species:e.target.value}))}
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  <option value="">Select species</option>
                  {speciesList.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                </select>
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Fly that worked *</label>
                <select value={form.fly} onChange={e => setForm(f=>({...f,fly:e.target.value}))}
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  <option value="">Select fly</option>
                  {flyList.map(fl => <option key={fl} value={fl}>{fl}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Method</label>
                <select value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))}
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  {METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Fish landed</label>
                <input type="number" min={1} max={99} value={form.catchCount}
                  onChange={e => setForm(f=>({...f,catchCount:parseInt(e.target.value)||1}))}
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Water temp (F, optional)</label>
                <input type="number" value={form.waterTemp} onChange={e => setForm(f=>({...f,waterTemp:e.target.value}))}
                  placeholder="e.g. 58"
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
            </div>
            {/* Conditions bar */}
            <div className="mb-4">
              <label className="font-['Inter'] text-xs uppercase tracking-widest mb-2 block" style={{ color: s.muted }}>Conditions</label>
              <div className="flex gap-2">
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => setForm(f=>({...f,conditions:c}))}
                    className="flex-1 py-2 rounded-sm font-['Inter'] text-xs transition-all"
                    style={{
                      backgroundColor: form.conditions===c ? conditionColor(c) : "transparent",
                      color: form.conditions===c ? "#fff" : s.muted,
                      border: `1px solid ${form.conditions===c ? conditionColor(c) : s.border}`
                    }}>
                    {conditionLabel(c)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Hatch observed (optional)</label>
                <input value={form.hatch} onChange={e => setForm(f=>({...f,hatch:e.target.value}))}
                  placeholder="e.g. PMD spinner fall at dusk"
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
              <div>
                <label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                  placeholder="Spot, technique, anything useful"
                  className="w-full px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none"
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSubmit}
                disabled={!form.state || !form.river || !form.species || !form.fly}
                className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-['Inter'] text-sm transition-opacity disabled:opacity-40"
                style={{ backgroundColor: s.accent, color: "#fff" }}>
                <Send size={14} />
                Submit Report
              </button>
              <button onClick={() => setShowForm(false)}
                className="font-['Inter'] text-xs" style={{ color: s.muted }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterState} onChange={e => setFilterState(e.target.value)}
            className="px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none min-h-[44px]"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
            <option value="">All states</option>
            {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <input value={filterRiver} onChange={e => setFilterRiver(e.target.value)}
            placeholder="Filter by river..."
            className="px-3 py-2 rounded-sm font-['Inter'] text-sm outline-none flex-1 min-w-0 min-h-[44px]"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: s.border }}>
          {[
            { key: "reports", label: "Catch Reports" },
            ...(waterMode === "fresh" ? [{ key: "stocking", label: "State Stocking" }] : []),
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="pb-3 px-1 mr-5 font-['Inter'] text-sm tracking-wide transition-all"
              style={{
                color: activeTab===tab.key ? s.accent : s.muted,
                borderBottom: activeTab===tab.key ? `2px solid ${s.accent}` : "2px solid transparent",
                marginBottom: -1,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CATCH REPORTS TAB ── */}
        {activeTab === "reports" && (
          <div>
            {loading && (
              <div className="text-center py-12">
                <p className="font-['Inter'] text-sm italic" style={{ color: s.muted }}>Loading reports...</p>
              </div>
            )}
            {!loading && reports.length === 0 && (
              <div className="rounded-sm p-12 text-center" style={{ border: `1px solid ${s.border}` }}>
                <Fish size={36} className="mx-auto mb-4" style={{ color: s.faint }} />
                <p className="font-['Cormorant_Garamond'] text-xl italic mb-2" style={{ color: s.muted }}>No reports yet for this filter.</p>
                <p className="font-['Inter'] text-sm mb-5" style={{ color: s.faint }}>Be the first to log a catch. Your intel helps every angler here.</p>
                <button onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 rounded-sm font-['Inter'] text-sm whitespace-nowrap min-h-[44px]"
                  style={{ backgroundColor: s.accent, color: "#fff" }}>
                  Log a catch
                </button>
              </div>
            )}
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="rounded-sm p-5" style={{ backgroundColor: s.strip, border: `1px solid ${s.border}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-['Cormorant_Garamond'] text-base font-semibold" style={{ color: s.text }}>{r.species}</span>
                      <span className="text-xs px-2 py-0.5 rounded-sm font-['Inter']"
                        style={{ backgroundColor: `${conditionColor(r.conditions)}22`, color: conditionColor(r.conditions), border: `1px solid ${conditionColor(r.conditions)}44` }}>
                        {conditionLabel(r.conditions)}
                      </span>
                      <span className="text-xs font-['Inter'] px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: "rgba(0,0,0,0.05)", color: s.muted }}>
                        {r.catchCount} fish
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock size={11} style={{ color: s.faint }} />
                      <span className="font-['Inter'] text-[11px]" style={{ color: s.faint }}>{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} style={{ color: s.accent }} />
                      <span className="font-['Inter'] text-xs" style={{ color: s.text }}>{r.river}, {r.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Fish size={12} style={{ color: s.accent }} />
                      <span className="font-['Inter'] text-xs" style={{ color: s.text }}>{r.fly}, {r.method}</span>
                    </div>
                    {r.waterTemp && (
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={12} style={{ color: s.accent }} />
                        <span className="font-['Inter'] text-xs" style={{ color: s.text }}>{r.waterTemp}°F</span>
                      </div>
                    )}
                  </div>
                  {r.hatch && (
                    <p className="font-['Inter'] text-xs italic mb-1.5" style={{ color: s.muted }}>
                      Hatch: {r.hatch}
                    </p>
                  )}
                  {r.notes && (
                    <p className="font-['Inter'] text-xs" style={{ color: s.muted }}>{r.notes}</p>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="font-['Inter'] text-[11px]" style={{ color: s.faint }}>— {r.displayName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STOCKING TAB ── */}
        {activeTab === "stocking" && waterMode === "fresh" && (
          <div>
            <div className="mb-5 rounded-sm p-4 flex items-start gap-3" style={{ backgroundColor: "rgba(160,118,58,0.08)", border: `1px solid ${s.border}` }}>
              <AlertCircle size={15} style={{ color: s.accent }} className="mt-0.5 shrink-0" />
              <p className="font-['Inter'] text-xs leading-relaxed" style={{ color: s.text }}>
                State stocking data is sourced directly from official fish and wildlife agencies (MT FWP, CO CPW, WY G&F, WA DFW, ID IDFG, PA PFBC, WI DNR). 
                Stocked fish are typically accessible within 24-72 hours of plant date.
                Select a state above to filter.
              </p>
            </div>
            {stocking.length === 0 && (
              <div className="text-center py-10" style={{ color: s.muted }}>
                <Truck size={32} className="mx-auto mb-3" style={{ color: s.faint }} />
                <p className="font-['Inter'] text-sm italic">No stocking events found. Select a supported state (MT, CO, WY, WA, ID, PA, WI).</p>
              </div>
            )}
            <div className="space-y-3">
              {stocking.map(ev => {
                const fresh = stockFreshness(ev.stockDate);
                return (
                  <div key={ev.id} className="rounded-sm p-5" style={{ backgroundColor: s.strip, border: `1px solid ${s.border}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-['Cormorant_Garamond'] text-base font-semibold mr-2" style={{ color: s.text }}>{ev.species}</span>
                        <span className="text-xs px-2 py-0.5 rounded-sm font-['Inter']" style={{
                          backgroundColor: fresh==="fresh" ? "rgba(5,150,105,0.15)" : fresh==="recent" ? "rgba(167,122,58,0.12)" : "rgba(0,0,0,0.06)",
                          color: fresh==="fresh" ? "#059669" : fresh==="recent" ? "#B45309" : s.muted,
                        }}>
                          {stockDaysAgo(ev.stockDate)}
                        </span>
                      </div>
                      {ev.countStocked && (
                        <span className="font-['Inter'] text-xs" style={{ color: s.muted }}>{ev.countStocked.toLocaleString()} fish</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: s.accent }} />
                        <span className="font-['Inter'] text-xs" style={{ color: s.text }}>{ev.river}, {ev.state}</span>
                      </div>
                      {ev.county && (
                        <span className="font-['Inter'] text-xs" style={{ color: s.faint }}>{ev.county} Co.</span>
                      )}
                      {ev.sizeInches && (
                        <span className="font-['Inter'] text-xs" style={{ color: s.faint }}>avg {ev.sizeInches}"</span>
                      )}
                    </div>
                    {ev.notes && (
                      <p className="font-['Inter'] text-xs italic mb-2" style={{ color: s.muted }}>{ev.notes}</p>
                    )}
                    {ev.sourceUrl && (
                      <a href={ev.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="font-['Inter'] text-[11px] hover:underline" style={{ color: s.accent }}>
                        Source: State fish & wildlife agency
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA — build the data moat */}
        <div className="mt-12 rounded-sm p-6 text-center" style={{ backgroundColor: s.dark }}>
          <Star size={20} className="mx-auto mb-3" style={{ color: s.accent }} />
          <h3 className="font-['Cormorant_Garamond'] text-xl mb-2" style={{ color: "#f5e6cc" }}>Build the data moat</h3>
          <p className="font-['Inter'] text-sm leading-relaxed max-w-md mx-auto mb-4" style={{ color: "rgba(245,230,204,0.65)" }}>
            Every catch you log becomes intel for the entire Flydentify community. 
            No competitor has this. You are the data.
          </p>
          <button onClick={() => setShowForm(true)}
            className="px-6 py-2.5 rounded-sm font-['Inter'] text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: s.accent, color: "#fff" }}>
            Log your catch now
          </button>
        </div>

      </div>
    </div>
  );
}
