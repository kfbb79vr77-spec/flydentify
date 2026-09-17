import { useState, useRef, useEffect } from "react";
import logoImg from "@assets/flydentify_logo.png";
import { useTrack } from "@/lib/useTrack";
import { GearSetupCard } from "@/components/GearSetupCard";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  ChevronLeft, Waves, Leaf, CheckCircle2, Clock, AlertCircle,
  X, Search, Trash2, Droplets, BedDouble, UtensilsCrossed,
  Star, MapPin, Phone, ExternalLink,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AtTheWater from "@/components/AtTheWater";
import { RiverGaugeCard } from "@/components/RiverGaugeCard";
import { TideChart } from "@/components/TideChart";
import {
  fetchTripKit,
  saveTripKit,
  removeFlyFromKit,
  updateKitNotes,
  addFlyToKit,
  type TripKit,
  type SavedFly,
} from "@/lib/tripKitStore";
import { flies as freshFlies, type Fly } from "@/lib/flyData";
import { saltwaterFlies, type SaltwaterFly } from "@/lib/saltwaterFlyData";
import { knots, getKnotsForFly, getDifficultyColor } from "@/lib/knotData";
import { KnotCarousel } from "@/components/KnotCarousel";

const s = {
  bg: "#EFE8D7",
  card: "rgba(37,45,30,0.06)",
  border: "rgba(160,118,58,0.2)",
  text: "#2F2B1E",
  muted: "rgba(37,45,30,0.65)",
  amber: "#A67A3A",
};

function formatCachedAt(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CacheStatusBadge({ status }: { status: TripKit["cacheStatus"] }) {
  if (status === "ready") return (
    <span className="flex items-center gap-1.5 font-['Inter'] text-xs" style={{ color: "#A67A3A" }}>
      <CheckCircle2 size={12} /> Ready offline
    </span>
  );
  if (status === "partial") return (
    <span className="flex items-center gap-1.5 font-['Inter'] text-xs" style={{ color: s.amber }}>
      <AlertCircle size={12} /> Partial cache
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 font-['Inter'] text-xs" style={{ color: s.muted }}>
      <Clock size={12} /> Pending
    </span>
  );
}

// ─── Add Fly Modal ───────────────────────────────────────────────────────────

interface AddFlyModalProps {
  open: boolean;
  waterMode: "fresh" | "salt";
  existingFlyIds: string[];
  onAdd: (fly: Fly | SaltwaterFly) => void;
  onClose: () => void;
}

function AddFlyModal({ open, waterMode, existingFlyIds, onAdd, onClose }: AddFlyModalProps) {
  const [query, setQuery] = useState("");

  const allFlies = waterMode === "salt"
    ? Object.values(saltwaterFlies)
    : Object.values(freshFlies);

  const filtered = allFlies.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()) &&
    !existingFlyIds.includes(f.id)
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="rounded-sm max-w-md max-h-[80vh] flex flex-col"
        style={{ backgroundColor: s.card, border: `1px solid ${s.border}`, color: s.text }}
      >
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-xl" style={{ color: s.text }}>
            Add a Fly
          </DialogTitle>
        </DialogHeader>
        <div className="relative mb-3 mt-2 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: s.muted }} />
          <Input
            autoFocus
            placeholder="Search fly patterns…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 rounded-sm font-['Inter'] text-sm"
            style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}`, color: s.text }}
          />
        </div>
        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {filtered.length === 0 && (
            <p className="text-center py-8 font-['Inter'] text-sm italic" style={{ color: s.muted }}>
              No flies found.
            </p>
          )}
          {filtered.map((fly) => (
            <button
              key={fly.id}
              onClick={() => { onAdd(fly); setQuery(""); }}
              className="w-full text-left rounded-sm px-4 py-3 transition-colors hover:bg-white/5"
              style={{ border: `1px solid ${s.border}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-['Cormorant_Garamond'] text-sm" style={{ color: s.text }}>{fly.name}</p>
                  <p className="font-['Inter'] text-xs italic" style={{ color: s.muted }}>
                    {fly.type} · {fly.hook}
                  </p>
                </div>
                <span className="font-['Inter'] text-xs" style={{ color: s.amber }}>+ Add</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Fly entry in Flies tab ──────────────────────────────────────────────────

interface FlyEntryProps {
  fly: SavedFly;
  onRemove: () => void;
  onAtTheWater: () => void;
}

function FlyEntry({ fly, onRemove, onAtTheWater }: FlyEntryProps) {
  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-['Cormorant_Garamond'] text-lg" style={{ color: s.text }}>
            {fly.flyName}
          </h3>
          <span
            className="inline-block font-['Inter'] text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm mt-1"
            style={{ backgroundColor: "rgba(167,122,58,0.15)", color: s.amber }}
          >
            {fly.flyType}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors shrink-0"
          style={{ color: s.muted, border: `1px solid ${s.border}` }}
          aria-label="Remove from kit"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Full GearSetupCard with SVG rig diagram */}
      <div className="px-5 pb-2">
        <GearSetupCard
          rigging={fly.rigging}
          flyType={fly.flyType as any}
          flyName={fly.flyName}
        />
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 pt-3 flex gap-2">
        <button
          onClick={onAtTheWater}
          className="flex-1 py-2 rounded-sm font-['Inter'] text-xs uppercase tracking-widest transition-opacity hover:opacity-90 min-h-[44px]"
          style={{ backgroundColor: s.amber, color: "#fff" }}
        >
          At the Water
        </button>
        <button
          onClick={onRemove}
          className="px-4 py-2 rounded-sm font-['Inter'] text-xs transition-colors min-h-[44px]"
          style={{ border: `1px solid ${s.border}`, color: s.muted }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Place types ─────────────────────────────────────────────────────────────

interface Place {
  name: string;
  type: string;
  address: string;
  phone: string;
  rating: number | null;
  url: string;
  note: string;
  photo?: string | null;
}

// ─── PlaceCard ────────────────────────────────────────────────────────────────

function PlaceCard({ place }: { place: Place }) {
  const typeColors: Record<string, string> = {
    Lodge: "#A67A3A",
    Cabin: "#3D6B83",
    Motel: "#9ca3af",
    Diner: "#A67A3A",
    Breakfast: "#A67A3A",
    Dinner: "#3D6B83",
  };
  const tagColor = typeColors[place.type] ?? s.amber;

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
    >
      {/* Photo strip */}
      {place.photo && (
        <img src={place.photo} alt={place.name} className="w-full h-28 object-cover" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p
              className="font-['Cormorant_Garamond'] text-base font-semibold leading-snug"
              style={{ color: s.text }}
            >
              {place.name}
            </p>
            <span
              className="inline-block font-['Inter'] text-[10px] uppercase tracking-widest mt-0.5"
              style={{ color: tagColor }}
            >
              {place.type}
            </span>
          </div>
          {place.rating && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star size={12} fill="#A67A3A" style={{ color: "#A67A3A" }} />
              <span className="font-['Inter'] text-xs" style={{ color: s.text }}>
                {place.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Note */}
        {place.note && (
          <p className="font-['Inter'] text-xs italic leading-relaxed mb-3" style={{ color: s.muted }}>
            {place.note}
          </p>
        )}

        {/* Address + Phone */}
        <div className="space-y-1 mb-3">
          {place.address && (
            <div className="flex items-start gap-2">
              <MapPin size={11} className="mt-0.5 shrink-0" style={{ color: s.muted }} />
              <span className="font-['Inter'] text-xs leading-snug" style={{ color: s.muted }}>
                {place.address}
              </span>
            </div>
          )}
          {place.phone && (
            <div className="flex items-center gap-2">
              <Phone size={11} className="shrink-0" style={{ color: s.muted }} />
              <a
                href={`tel:${place.phone.replace(/\D/g, "")}`}
                className="font-['Inter'] text-xs transition-opacity hover:opacity-80"
                style={{ color: s.muted }}
              >
                {place.phone}
              </a>
            </div>
          )}
        </div>

        {/* Google Maps link */}
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-['Inter'] text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ color: s.amber }}
        >
          <ExternalLink size={11} />
          View on Maps
        </a>
      </div>
    </div>
  );
}

// ─── PlacesTab ────────────────────────────────────────────────────────────────

function PlacesTab({
  type,
  region,
  label,
  icon: Icon,
  emptyLine,
}: {
  type: "lodging" | "eats";
  region: string;
  label: string;
  icon: React.ElementType;
  emptyLine: string;
}) {
  const { data, isLoading, isError } = useQuery<{ source: string; places: Place[] }>({
    queryKey: ["/api/places", type, region],
    queryFn: async () => {
      const params = new URLSearchParams({ type, region });
      const res = await fetch(`/api/places?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color: s.amber }} />
        <p className="font-['Inter'] text-[11px] uppercase tracking-widest" style={{ color: s.amber }}>
          {label}
        </p>
        {data?.source === "curated" && (
          <span className="ml-auto font-['Inter'] text-[10px] italic" style={{ color: s.muted }}>
            Flydentify picks
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-sm animate-pulse" style={{ backgroundColor: s.card }} />
          ))}
        </div>
      )}

      {isError && (
        <p className="font-['Inter'] text-sm italic text-center py-8" style={{ color: s.muted }}>
          Could not load {label.toLowerCase()}. Try again.
        </p>
      )}

      {!isLoading && !isError && (!data?.places || data.places.length === 0) && (
        <p className="font-['Inter'] text-sm italic text-center py-8" style={{ color: s.muted }}>
          {emptyLine}
        </p>
      )}

      {data?.places?.map((place, i) => (
        <PlaceCard key={i} place={place} />
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function TripKitDetail() {
  const params = useParams<{ id: string }>();
  const [kitLatLon, setKitLatLon] = useState<{ lat: number; lon: number } | null>(null);
  const kitId = params.id ?? "";
  const { track } = useTrack();

  const [showAddFly, setShowAddFly] = useState(false);
  const [atWaterIndex, setAtWaterIndex] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Track page view and trip kit open on mount
  useEffect(() => {
    track('page_view', { page: 'trip_kit' });
    if (kitId) {
      track('trip_kit_open', { kit_id: kitId });
    }
  }, [kitId]);

  // ── Fetch kit from API ──────────────────────────────────────────────────────
  const { data: kit, isLoading, isError } = useQuery<TripKit>({
    queryKey: ["/api/trip-kits", kitId],
    queryFn: () => fetchTripKit(kitId),
    enabled: !!kitId,
  });

  // Geocode river + state to get lat/lon for RiverGaugeCard
  useEffect(() => {
    if (!kit) return;
    const q = [kit.river, kit.state].filter(Boolean).join(", ");
    if (!q) return;
    fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { if (d.lat && d.lon) setKitLatLon({ lat: d.lat, lon: d.lon }); })
      .catch(() => {});
  }, [kit?.river, kit?.state]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const removeFlyMutation = useMutation({
    mutationFn: (flyId: string) => removeFlyFromKit(kitId, flyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] }),
  });

  const addFlyMutation = useMutation({
    mutationFn: (savedFly: SavedFly) => addFlyToKit(kitId, savedFly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
      setShowAddFly(false);
    },
  });

  const cacheNowMutation = useMutation({
    mutationFn: () => {
      if (!kit) throw new Error("No kit loaded");
      return saveTripKit({ ...kit, cacheStatus: "ready", cachedAt: Date.now() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] }),
  });

  const saveNotesMutation = useMutation({
    mutationFn: (notes: string) => updateKitNotes(kitId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
      setEditingNotes(false);
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRemoveFly = (flyId: string) => {
    removeFlyMutation.mutate(flyId);
  };

  const handleAddFly = (fly: Fly | SaltwaterFly) => {
    const knotRecs = getKnotsForFly(fly.type);
    const knotIds = knotRecs.map((r) => r.knotId);
    const savedFly: SavedFly = {
      flyId: fly.id,
      flyName: fly.name,
      flyType: fly.type,
      rigging: fly.rigging,
      knotIds,
      notes: "",
    };
    addFlyMutation.mutate(savedFly);
  };

  const handleNotesSave = () => {
    const newNotes = notesRef.current?.value ?? kit?.notes ?? "";
    saveNotesMutation.mutate(newNotes);
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: s.bg }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-['Inter'] text-sm" style={{ color: s.muted }}>Loading trip kit…</p>
        </div>
      </div>
    );
  }

  if (isError || !kit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: s.bg }}>
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-xl mb-4" style={{ color: s.text }}>
            Trip kit not found.
          </p>
          <Link href="/trips">
            <button className="font-['Inter'] text-sm" style={{ color: s.amber }}>
              ← Back to My Trips
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: s.bg }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between py-3"
        style={{ backgroundColor: s.bg, borderBottom: `1px solid ${s.border}` }}
      >
        <Link href="/trips">
          <button
            className="flex items-center gap-1.5 font-['Inter'] text-sm transition-colors min-h-[44px]"
            style={{ color: s.muted }}
          >
            <ChevronLeft size={15} />
            My Trips
          </button>
        </Link>
        <a href="/#/">
          <img src={logoImg} alt="Flydentify" className="w-auto max-w-[100px] sm:max-w-[190px] lg:max-w-[260px] h-auto" />
        </a>
        <div style={{ width: 80 }} />
      </nav>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        {/* Header section */}
        <div className="mb-8">
          {/* Kit name */}
          <h1
            className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl mb-2"
            style={{ color: s.text }}
          >
            {kit.name || `${kit.river} · ${kit.dates}`}
          </h1>

          {/* River · State · Dates */}
          <p className="font-['Inter'] text-sm mb-4" style={{ color: s.muted }}>
            {[kit.river, kit.state, kit.dates].filter(Boolean).join(" · ")}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Water mode badge */}
            <span
              className="flex items-center gap-1.5 font-['Inter'] text-xs px-2.5 py-1 rounded-sm"
              style={
                kit.waterMode === "salt"
                  ? { backgroundColor: "rgba(61,107,131,0.22)", color: "#3D6B83" }
                  : { backgroundColor: "rgba(167,122,58,0.15)", color: s.amber }
              }
            >
              {kit.waterMode === "salt" ? <Waves size={11} /> : <Leaf size={11} />}
              {kit.waterMode === "fresh" ? "Freshwater" : "Saltwater"}
            </span>

            {/* Cache status */}
            <CacheStatusBadge status={kit.cacheStatus} />

            {/* Cache Now button */}
            {kit.cacheStatus !== "ready" && (
              <button
                onClick={() => cacheNowMutation.mutate()}
                disabled={cacheNowMutation.isPending}
                className="font-['Inter'] text-xs px-3 py-1 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: s.amber, color: "#fff" }}
              >
                {cacheNowMutation.isPending ? "Saving…" : "Cache Now"}
              </button>
            )}
          </div>

          {/* Cached at */}
          {kit.cacheStatus === "ready" && kit.cachedAt > 0 && (
            <p className="font-['Inter'] text-xs" style={{ color: s.muted }}>
              Cached {formatCachedAt(kit.cachedAt)}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="flies">
          <TabsList
            className="rounded-sm mb-6 p-1 w-full grid grid-cols-6"
            style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
          >
            <TabsTrigger value="flies" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white" style={{ minHeight: 40, color: s.muted }}>
              Flies ({kit.flies.length})
            </TabsTrigger>
            <TabsTrigger value="knots" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white" style={{ minHeight: 40, color: s.muted }}>
              Knots
            </TabsTrigger>
            <TabsTrigger value="lodging" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white flex flex-col items-center gap-0.5" style={{ minHeight: 40, color: s.muted }}>
              <BedDouble size={13} />
              <span className="text-[9px]">Stay</span>
            </TabsTrigger>
            <TabsTrigger value="eats" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white flex flex-col items-center gap-0.5" style={{ minHeight: 40, color: s.muted }}>
              <UtensilsCrossed size={13} />
              <span className="text-[9px]">Eat</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white" style={{ minHeight: 40, color: s.muted }}>
              Notes
            </TabsTrigger>
            <TabsTrigger value="conditions" className="rounded-sm font-['Inter'] text-xs uppercase tracking-wide data-[state=active]:text-white flex flex-col items-center gap-0.5" style={{ minHeight: 40, color: s.muted }}>
              <Droplets size={13} />
              <span className="text-[9px]">Water</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Flies tab ── */}
          <TabsContent value="flies">
            {kit.flies.length === 0 ? (
              <div className="text-center py-16">
                <Droplets size={32} className="mx-auto mb-4" style={{ color: "rgba(167,122,58,0.3)" }} />
                <p className="font-['Cormorant_Garamond'] text-xl mb-2 italic" style={{ color: s.muted }}>
                  No flies packed yet.
                </p>
                <p className="font-['Inter'] text-sm mb-6" style={{ color: s.muted }}>
                  Add flies from the Finder or tap + Add Fly below.
                </p>
                <button
                  onClick={() => setShowAddFly(true)}
                  className="px-6 py-2.5 rounded-sm font-['Inter'] text-sm transition-opacity hover:opacity-90 min-h-[44px]"
                  style={{ backgroundColor: s.amber, color: "#fff" }}
                >
                  + Add Fly
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {kit.flies.map((fly, i) => (
                    <FlyEntry
                      key={fly.flyId}
                      fly={fly}
                      onRemove={() => handleRemoveFly(fly.flyId)}
                      onAtTheWater={() => setAtWaterIndex(i)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setShowAddFly(true)}
                  className="w-full py-3 rounded-sm font-['Inter'] text-sm transition-colors hover:border-amber-600/40 min-h-[44px]"
                  style={{ border: `1px dashed ${s.border}`, color: s.muted }}
                >
                  + Add Fly
                </button>
              </>
            )}
          </TabsContent>

          {/* ── Knots tab ── */}
          <TabsContent value="knots">
            {kit.knotIds.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-['Cormorant_Garamond'] text-xl mb-2 italic" style={{ color: s.muted }}>
                  No knots cached yet.
                </p>
                <p className="font-['Inter'] text-sm" style={{ color: s.muted }}>
                  Add flies to the kit, knots will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {kit.knotIds.map((knotId) => {
                  const knot = knots[knotId];
                  if (!knot) return null;
                  return (
                    <div key={knotId}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <h3 className="font-['Cormorant_Garamond'] text-base" style={{ color: s.text }}>{knot.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-sm font-['Inter'] ${getDifficultyColor(knot.difficulty)}`}>{knot.difficulty}</span>
                      </div>
                      <p className="font-['Inter'] text-xs italic mb-2 px-1" style={{ color: s.muted }}>{knot.purpose}</p>
                      <KnotCarousel knotId={knotId} mode="fw" />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Lodging tab ── */}
          <TabsContent value="lodging">
            <PlacesTab
              type="lodging"
              region={kit.river ?? ""}
              label="Where to Stay"
              icon={BedDouble}
              emptyLine="No lodging found for this region yet."
            />
          </TabsContent>

          {/* ── Eats tab ── */}
          <TabsContent value="eats">
            <PlacesTab
              type="eats"
              region={kit.river ?? ""}
              label="Where to Eat"
              icon={UtensilsCrossed}
              emptyLine="No restaurants found for this region yet."
            />
          </TabsContent>

          {/* ── Notes tab ── */}
          <TabsContent value="notes">
            <div>
              {!editingNotes ? (
                <div>
                  {kit.notes ? (
                    <div
                      className="rounded-sm p-5 mb-4"
                      style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
                    >
                      <p
                        className="font-['Inter'] text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: s.text }}
                      >
                        {kit.notes}
                      </p>
                    </div>
                  ) : (
                    <p className="font-['Inter'] text-sm italic mb-4" style={{ color: s.muted }}>
                      No notes yet. Add access points, fly shop contacts, local tips…
                    </p>
                  )}
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="px-5 py-2 rounded-sm font-['Inter'] text-sm min-h-[44px]"
                    style={{ border: `1px solid ${s.border}`, color: s.muted }}
                  >
                    {kit.notes ? "Edit Notes" : "Add Notes"}
                  </button>
                </div>
              ) : (
                <div>
                  <textarea
                    ref={notesRef}
                    defaultValue={kit.notes}
                    placeholder="Access points, fly shop contacts, local intel…"
                    rows={12}
                    className="w-full rounded-sm px-4 py-3 font-['Inter'] text-sm focus:outline-none resize-none mb-3"
                    style={{
                      backgroundColor: s.card,
                      border: `1px solid rgba(167,122,58,0.3)`,
                      color: s.text,
                    }}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingNotes(false)}
                      className="px-5 py-2 rounded-sm font-['Inter'] text-sm min-h-[44px]"
                      style={{ border: `1px solid ${s.border}`, color: s.muted }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNotesSave}
                      disabled={saveNotesMutation.isPending}
                      className="px-5 py-2 rounded-sm font-['Inter'] text-sm min-h-[44px] disabled:opacity-60"
                      style={{ backgroundColor: s.amber, color: "#fff" }}
                    >
                      {saveNotesMutation.isPending ? "Saving…" : "Save Notes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          {/* ── Conditions tab ── */}
          <TabsContent value="conditions">
            {kitLatLon ? (
              kit.waterMode === "salt" ? (
                <TideChart station="8771450" stationName={kit.river || "Gulf Coast"} />
              ) : (
                <RiverGaugeCard lat={kitLatLon.lat} lon={kitLatLon.lon} />
              )
            ) : (
              <p
                className="font-['Inter'] text-sm italic text-center py-12"
                style={{ color: s.muted }}
              >
                Locating nearest gauge…
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Fly modal */}
      <AddFlyModal
        open={showAddFly}
        waterMode={kit.waterMode}
        existingFlyIds={kit.flies.map((f) => f.flyId)}
        onAdd={handleAddFly}
        onClose={() => setShowAddFly(false)}
      />

      {/* AtTheWater overlay */}
      {atWaterIndex !== null && kit.flies.length > 0 && (
        <AtTheWater
          flies={kit.flies}
          initialIndex={atWaterIndex}
          kitId={kit.id}
          onClose={() => {
            setAtWaterIndex(null);
            queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
          }}
        />
      )}
    </div>
  );
}
