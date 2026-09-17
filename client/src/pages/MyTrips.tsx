import { useState } from "react";
import logoImg from "@assets/flydentify_logo.png";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Plus, Backpack, ChevronLeft, Trash2, Waves, Leaf,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  saveTripKit,
  deleteTripKit,
  createEmptyKit,
  fetchTripKits,
  type TripKit,
} from "@/lib/tripKitStore";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";

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

function CacheStatusBadge({ status, cachedAt }: { status: TripKit["cacheStatus"]; cachedAt: number }) {
  if (status === "ready") {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 size={11} style={{ color: "#A67A3A" }} />
        <span className="font-['Inter'] text-xs" style={{ color: "#A67A3A" }}>Ready offline</span>
        {cachedAt > 0 && (
          <span className="font-['Inter'] text-xs" style={{ color: s.muted }}>
            · Cached {formatCachedAt(cachedAt)}
          </span>
        )}
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="flex items-center gap-1.5">
        <AlertCircle size={11} style={{ color: s.amber }} />
        <span className="font-['Inter'] text-xs" style={{ color: s.amber }}>Tap to cache</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Clock size={11} style={{ color: s.muted }} />
      <span className="font-['Inter'] text-xs" style={{ color: s.muted }}>Pending</span>
    </div>
  );
}

function NewKitModal({
  open,
  onClose,
  onCreated,
  onNeedAuth,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
  onNeedAuth?: () => void;
}) {
  const [name, setName] = useState("");
  const [river, setRiver] = useState("");
  const [state, setState] = useState("");
  const [dates, setDates] = useState("");
  const [waterMode, setWaterMode] = useState<"fresh" | "salt">("fresh");

  const [saving, setSaving] = useState(false);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      onNeedAuth?.();
      return;
    }
    setSaving(true);
    const kit = createEmptyKit(
      name || `${river} · ${dates}`,
      river,
      state,
      dates,
      waterMode
    );
    try {
      await saveTripKit(kit);
      setName(""); setRiver(""); setState(""); setDates(""); setWaterMode("fresh");
      setSaving(false);
      onCreated(kit.id);
    } catch (err: any) {
      setSaving(false);
      if (err?.message?.includes("401") || err?.message?.startsWith("401")) {
        onClose();
        onNeedAuth?.();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="rounded-sm max-w-md"
        style={{ backgroundColor: s.card, border: `1px solid ${s.border}`, color: s.text }}
      >
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-xl" style={{ color: s.text }}>
            New trip kit
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>
              Kit Name
            </Label>
            <Input
              placeholder="e.g. Guadalupe River · July 4th"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-sm font-['Inter'] text-sm"
              style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}`, color: s.text }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>
                River
              </Label>
              <Input
                required
                placeholder="Guadalupe River"
                value={river}
                onChange={(e) => setRiver(e.target.value)}
                className="rounded-sm font-['Inter'] text-sm"
                style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}`, color: s.text }}
              />
            </div>
            <div>
              <Label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>
                State
              </Label>
              <Input
                placeholder="TX"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-sm font-['Inter'] text-sm"
                style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}`, color: s.text }}
              />
            </div>
          </div>
          <div>
            <Label className="font-['Inter'] text-xs uppercase tracking-widest mb-1.5 block" style={{ color: s.muted }}>
              Dates
            </Label>
            <Input
              placeholder="July 4-6, 2026"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="rounded-sm font-['Inter'] text-sm"
              style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}`, color: s.text }}
            />
          </div>
          <div>
            <Label className="font-['Inter'] text-xs uppercase tracking-widest mb-2 block" style={{ color: s.muted }}>
              Water Mode
            </Label>
            <div
              className="inline-flex rounded-sm p-0.5"
              style={{ backgroundColor: "#EFE8D7", border: `1px solid ${s.border}` }}
            >
              {(["fresh", "salt"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setWaterMode(m)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-xs font-['Inter'] uppercase tracking-wider transition-all"
                  style={
                    waterMode === m
                      ? { backgroundColor: m === "fresh" ? s.amber : "#142446", color: s.text }
                      : { color: s.muted }
                  }
                >
                  {m === "fresh" ? <Leaf size={11} /> : <Waves size={11} />}
                  {m === "fresh" ? "Freshwater" : "Saltwater"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-sm font-['Inter'] text-sm"
              style={{ color: s.muted }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!river.trim()}
              className="flex-1 rounded-sm font-['Inter'] text-sm"
              style={{ backgroundColor: s.amber, color: "#fff" }}
            >
              Create Kit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MyTrips() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showNewKit, setShowNewKit] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const { data: kits = [], isLoading } = useQuery<TripKit[]>({
    queryKey: ["/api/trip-kits"],
    queryFn: fetchTripKits,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTripKit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] }),
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this trip kit?")) deleteMutation.mutate(id);
  };

  const handleCreated = (id: string) => {
    setShowNewKit(false);
    navigate(`/trip-kit/${id}`);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: s.bg }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between py-3"
        style={{ backgroundColor: s.bg, borderBottom: `1px solid ${s.border}` }}
      >
        <Link href="/finder">
          <button
            className="flex items-center gap-1.5 font-['Inter'] text-sm transition-colors min-h-[44px]"
            style={{ color: s.muted }}
          >
            <ChevronLeft size={15} />
            <span>Finder</span>
          </button>
        </Link>
        <a href="/#/">
          <img src={logoImg} alt="Flydentify" className="w-auto max-w-[130px] sm:max-w-[220px] lg:max-w-[290px] h-auto" style={{ filter: "brightness(0)" }} />
        </a>
        <button
          onClick={() => setShowNewKit(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm font-['Inter'] text-sm transition-opacity hover:opacity-90 min-h-[44px]"
          style={{ backgroundColor: s.amber, color: "#fff" }}
        >
          <Plus size={14} />
          New Kit
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        {/* Page header */}
        <div className="mb-10">
          <p
            className="font-['Inter'] text-[10px] tracking-[0.25em] uppercase mb-3"
            style={{ color: s.amber }}
          >
            Offline Ready
          </p>
          <h1
            className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl mb-3"
            style={{ color: s.text }}
          >
            My trips
          </h1>
          <div
            className="w-16 h-px mb-4"
            style={{ backgroundColor: s.amber }}
          />
          <p className="font-['Inter'] text-sm" style={{ color: s.muted }}>
            Pack your research before you lose signal.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3 pt-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 rounded-sm animate-pulse" style={{ backgroundColor: s.card }} />
            ))}
          </div>
        )}

        {/* Not signed in */}
        {!user && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-sm flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(160,118,58,0.10)", border: `1px solid ${s.border}` }}>
              <Backpack size={28} style={{ color: "rgba(160,118,58,0.50)" }} />
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl mb-3" style={{ color: s.text }}>Sign in to use trip kits</h2>
            <p className="font-['Inter'] text-sm leading-relaxed mb-8 max-w-xs" style={{ color: s.muted }}>
              Trip kits are saved to your account so they're always with you, online or off.
            </p>
            <a href="/#/" className="flex items-center gap-2 px-6 py-3 rounded-sm font-['Inter'] text-sm tracking-wider transition-opacity hover:opacity-90 min-h-[44px]" style={{ backgroundColor: s.amber, color: "#fff" }}>
              Sign In
            </a>
          </div>
        )}

        {/* Empty state */}
        {!!user && !isLoading && kits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-sm flex items-center justify-center mb-6"
              style={{ backgroundColor: "rgba(160,118,58,0.10)", border: `1px solid ${s.border}` }}
            >
              <Backpack size={28} style={{ color: "rgba(160,118,58,0.50)" }} />
            </div>
            <h2
              className="font-['Cormorant_Garamond'] text-2xl mb-3"
              style={{ color: s.text }}
            >
              No trip kits yet.
            </h2>
            <p
              className="font-['Inter'] text-sm leading-relaxed mb-8 max-w-xs"
              style={{ color: s.muted }}
            >
              Save flies, rigs, and knots from the Finder before your next trip.
            </p>
            <button
              onClick={() => setShowNewKit(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-sm font-['Inter'] text-sm tracking-wider transition-opacity hover:opacity-90 min-h-[44px]"
              style={{ backgroundColor: s.amber, color: "#fff" }}
            >
              <Plus size={14} />
              Create Your First Kit
            </button>
          </div>
        )}

        {/* Kit cards */}
        {!!user && !isLoading && kits.length > 0 && (
          <div className="space-y-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="group rounded-sm cursor-pointer transition-all hover:border-amber-600/40"
                style={{
                  backgroundColor: s.card,
                  border: `1px solid ${s.border}`,
                }}
                onClick={() => navigate(`/trip-kit/${kit.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* River + State */}
                      <h2
                        className="font-['Cormorant_Garamond'] text-xl leading-snug mb-0.5 truncate"
                        style={{ color: s.text }}
                      >
                        {kit.river || kit.name}
                        {kit.state ? ` · ${kit.state}` : ""}
                      </h2>
                      {/* Date */}
                      {kit.dates && (
                        <p
                          className="font-['Inter'] text-xs italic mb-3"
                          style={{ color: s.muted }}
                        >
                          {kit.dates}
                        </p>
                      )}
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Water mode badge */}
                        <span
                          className="flex items-center gap-1 font-['Inter'] text-xs px-2 py-0.5 rounded-sm"
                          style={
                            kit.waterMode === "salt"
                              ? { backgroundColor: "rgba(61,107,131,0.22)", color: "#3D6B83" }
                              : { backgroundColor: "rgba(160,118,58,0.15)", color: s.amber }
                          }
                        >
                          {kit.waterMode === "salt" ? <Waves size={10} /> : <Leaf size={10} />}
                          {kit.waterMode === "fresh" ? "Freshwater" : "Saltwater"}
                        </span>
                        {/* Fly count */}
                        <span
                          className="font-['Inter'] text-xs px-2 py-0.5 rounded-sm"
                          style={{ backgroundColor: "rgba(255,255,255,0.05)", color: s.muted }}
                        >
                          {kit.flies.length === 0
                            ? "No flies packed"
                            : `${kit.flies.length} ${kit.flies.length === 1 ? "fly" : "flies"} packed`}
                        </span>
                      </div>
                      {/* Cache status */}
                      <CacheStatusBadge status={kit.cacheStatus} cachedAt={kit.cachedAt} />
                    </div>

                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          style={{ color: s.muted }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-lg leading-none">···</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="rounded-sm"
                        style={{ backgroundColor: s.card, border: `1px solid ${s.border}` }}
                      >
                        <DropdownMenuItem
                          className="font-['Inter'] text-sm cursor-pointer"
                          style={{ color: "#f87171" }}
                          onClick={(e) => handleDelete(kit.id, e)}
                        >
                          <Trash2 size={13} className="mr-2" />
                          Delete Kit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bottom accent line on hover */}
                <div
                  className="h-px transition-all group-hover:opacity-100 opacity-0"
                  style={{ backgroundColor: s.amber }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="login" onSuccess={() => setShowAuth(false)} />}
      <NewKitModal
        open={showNewKit}
        onClose={() => setShowNewKit(false)}
        onNeedAuth={() => setShowAuth(true)}
        onCreated={handleCreated}
      />

      {/* ── Page footer logo ── */}
      <div className="flex flex-col items-center gap-2 py-12" style={{ borderTop: "1px solid rgba(167,122,58,0.15)" }}>
        <img src={logoImg} alt="Flydentify" className="w-auto h-auto" style={{ maxWidth: 220, filter: "brightness(0)", opacity: 0.5 }} />
        <p className="font-['Inter'] text-xs" style={{ color: "rgba(37,45,30,0.38)" }}>
          © 2026 Flydentify · Made in Texas
        </p>
      </div>
    </div>
  );
}
