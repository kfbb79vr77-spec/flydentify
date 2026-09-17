import { useState, useEffect, useCallback } from "react";
import { Calendar, Trash2, Lock, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { stateData } from "@/lib/stateData";

// ── Design tokens ──────────────────────────────────────────────────────────────
const s = {
  bg: "#071e25",
  card: "#091d24",
  border: "rgba(167,122,58,0.3)",
  amber: "#A67A3A",
  amberFaint: "rgba(167,122,58,0.12)",
  amberBorder: "rgba(167,122,58,0.5)",
  text: "#f5e6cc",
  faint: "rgba(214,197,176,0.5)",
  muted: "rgba(214,197,176,0.7)",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(167,122,58,0.25)",
  cardInner: "rgba(255,255,255,0.025)",
  cardBorder: "rgba(167,122,58,0.15)",
};

const SPECIES_OPTIONS = [
  "Brown Trout",
  "Rainbow Trout",
  "Brook Trout",
  "Cutthroat Trout",
  "Steelhead",
  "Smallmouth Bass",
  "Largemouth Bass",
  "Carp",
  "Redfish",
  "Tarpon",
  "Bonefish",
];

interface TripPlan {
  id: number;
  userId: number;
  destination: string;
  state: string;
  targetDate: string;
  targetSpecies: string | null;
  notes: string | null;
  alertEnabled: number | null;
  createdAt: number;
}

function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseSpecies(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [raw];
  } catch {
    return raw ? [raw] : [];
  }
}

// ── Upgrade prompt shown to unauthenticated / non-Pro users ──────────────────
function UpgradePrompt({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div
      className="rounded-sm w-full"
      style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
    >
      <div className="h-0.5 w-full rounded-t-sm" style={{ backgroundColor: s.amber }} />
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: s.amberFaint, border: `1px solid ${s.amberBorder}` }}
        >
          <Lock size={18} style={{ color: s.amber }} />
        </div>
        <div>
          <p
            className="font-['Inter'] text-xs uppercase tracking-widest mb-1"
            style={{ color: s.amber }}
          >
            Pro Feature
          </p>
          <h3
            className="font-['Cormorant_Garamond'] text-xl mb-2"
            style={{ color: s.text }}
          >
            Trip Planner
          </h3>
          <p
            className="font-['Inter'] text-sm italic leading-relaxed"
            style={{ color: s.muted }}
          >
            {isLoggedIn
              ? "Upgrade to Pro to plan trips, track target dates, and receive condition alerts when your water is fishing well."
              : "Sign in or create a Pro account to plan trips, save destinations, and receive condition alerts."}
          </p>
        </div>
        <a
          href="/#/finder"
          className="rounded-sm px-5 py-2.5 font-['Inter'] text-sm uppercase tracking-widest transition-colors"
          style={{ backgroundColor: s.amber, color: "#fff" }}
        >
          {isLoggedIn ? "Upgrade to Pro" : "Get Started"}
        </a>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TripPlanner() {
  const { user, isPro } = useAuth();
  const stateAbbrs = Object.keys(stateData).sort();

  // Form state
  const [destination, setDestination] = useState("");
  const [state, setState] = useState("MT");
  const [targetDate, setTargetDate] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Trip list state
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTrips = useCallback(async () => {
    if (!user || !isPro) return;
    setLoadingTrips(true);
    try {
      const res = await apiRequest("GET", "/api/trip-plans");
      if (res.ok) {
        const data: TripPlan[] = await res.json();
        setTrips(data);
      }
    } catch {
      // fail silently
    } finally {
      setLoadingTrips(false);
    }
  }, [user, isPro]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const toggleSpecies = (sp: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(sp) ? prev.filter((x) => x !== sp) : [...prev, sp]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setFormError("Destination is required.");
      return;
    }
    if (!targetDate) {
      setFormError("Target date is required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiRequest("POST", "/api/trip-plans", {
        destination: destination.trim(),
        state,
        targetDate,
        targetSpecies: selectedSpecies.length > 0 ? selectedSpecies : undefined,
        notes: notes.trim() || undefined,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save trip.");
      }
      const newPlan: TripPlan = await res.json();
      setTrips((prev) => [newPlan, ...prev]);
      // Reset form
      setDestination("");
      setTargetDate("");
      setSelectedSpecies([]);
      setNotes("");
    } catch (err: any) {
      setFormError(err.message || "Could not save trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiRequest("DELETE", `/api/trip-plans/${id}`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // fail silently
    } finally {
      setDeletingId(null);
    }
  };

  // Not logged in or not Pro → show upgrade prompt
  if (!user || !isPro) {
    return <UpgradePrompt isLoggedIn={!!user} />;
  }

  return (
    <div
      className="rounded-sm w-full"
      style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
    >
      {/* Amber top bar */}
      <div className="h-0.5 w-full rounded-t-sm" style={{ backgroundColor: s.amber }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={15} style={{ color: s.amber }} />
          <p
            className="font-['Inter'] text-xs uppercase tracking-widest"
            style={{ color: s.amber }}
          >
            Pro
          </p>
        </div>
        <h3
          className="font-['Cormorant_Garamond'] text-lg mb-5"
          style={{ color: s.text }}
        >
          Plan a Trip
        </h3>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-7">
          {/* Destination + State */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: s.muted }}>
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Madison River, MT"
                maxLength={100}
                className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none"
                style={{
                  backgroundColor: s.inputBg,
                  border: `1px solid ${s.inputBorder}`,
                  color: s.text,
                }}
              />
            </div>
            <div className="flex-none w-24">
              <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: s.muted }}>
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-sm px-2.5 py-2 font-['Inter'] text-sm outline-none appearance-none"
                style={{
                  backgroundColor: s.inputBg,
                  border: `1px solid ${s.inputBorder}`,
                  color: s.text,
                }}
              >
                {stateAbbrs.map((abbr) => (
                  <option key={abbr} value={abbr} style={{ backgroundColor: s.card }}>
                    {abbr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target date */}
          <div>
            <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: s.muted }}>
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none"
              style={{
                backgroundColor: s.inputBg,
                border: `1px solid ${s.inputBorder}`,
                color: s.text,
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Target species chips */}
          <div>
            <label className="block font-['Inter'] text-xs mb-2" style={{ color: s.muted }}>
              Target Species{" "}
              <span style={{ color: s.faint }}>(optional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SPECIES_OPTIONS.map((sp) => {
                const selected = selectedSpecies.includes(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => toggleSpecies(sp)}
                    className="rounded-sm px-2.5 py-1 font-['Inter'] text-xs transition-colors"
                    style={{
                      backgroundColor: selected ? s.amber : s.inputBg,
                      border: `1px solid ${selected ? s.amber : s.inputBorder}`,
                      color: selected ? "#fff" : s.muted,
                    }}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-['Inter'] text-xs mb-1.5" style={{ color: s.muted }}>
              Notes{" "}
              <span style={{ color: s.faint }}>(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Goals, fly selection ideas, gear reminders..."
              maxLength={500}
              className="w-full rounded-sm px-3 py-2 font-['Inter'] text-sm outline-none resize-none"
              style={{
                backgroundColor: s.inputBg,
                border: `1px solid ${s.inputBorder}`,
                color: s.text,
              }}
            />
          </div>

          {formError && (
            <p className="font-['Inter'] text-sm italic" style={{ color: "#f87171" }}>
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm py-2.5 font-['Inter'] text-sm uppercase tracking-widest transition-colors"
            style={{
              backgroundColor: submitting ? "rgba(167,122,58,0.5)" : s.amber,
              color: "#fff",
            }}
          >
            {submitting ? "Saving…" : "Save Trip"}
          </button>
        </form>

        {/* ── Saved trips list ── */}
        {loadingTrips && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-sm h-14 animate-pulse"
                style={{ backgroundColor: s.cardInner }}
              />
            ))}
          </div>
        )}

        {!loadingTrips && trips.length > 0 && (
          <div className="space-y-2">
            <p
              className="font-['Inter'] text-xs uppercase tracking-widest mb-2"
              style={{ color: s.faint }}
            >
              Your Trips
            </p>
            {trips.map((trip) => {
              const species = parseSpecies(trip.targetSpecies);
              return (
                <div
                  key={trip.id}
                  className="rounded-sm p-3 flex items-start justify-between gap-3"
                  style={{
                    backgroundColor: s.cardInner,
                    border: `1px solid ${s.cardBorder}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin size={11} style={{ color: s.amber, flexShrink: 0 }} />
                      <span
                        className="font-['Cormorant_Garamond'] text-sm font-semibold truncate"
                        style={{ color: s.text }}
                      >
                        {trip.destination}
                      </span>
                      <span
                        className="font-['Inter'] text-xs rounded-sm px-1.5 py-0.5"
                        style={{
                          backgroundColor: s.amberFaint,
                          border: `1px solid ${s.amberBorder}`,
                          color: s.amber,
                        }}
                      >
                        {trip.state}
                      </span>
                    </div>
                    <p
                      className="font-['Inter'] text-xs mt-0.5"
                      style={{ color: s.muted }}
                    >
                      {formatDate(trip.targetDate)}
                      {species.length > 0 && (
                        <span style={{ color: s.faint }}>
                          {" "}· {species.join(", ")}
                        </span>
                      )}
                    </p>
                    {trip.notes && (
                      <p
                        className="font-['Inter'] text-xs italic mt-0.5 line-clamp-1"
                        style={{ color: s.faint }}
                      >
                        {trip.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    disabled={deletingId === trip.id}
                    className="flex-none rounded-sm p-1.5 transition-opacity hover:opacity-70"
                    style={{ color: s.faint }}
                    title="Delete trip"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p
          className="font-['Inter'] text-xs italic mt-5"
          style={{ color: s.faint }}
        >
          Condition alerts will notify you when your target water is fishing well.
        </p>
      </div>
    </div>
  );
}
