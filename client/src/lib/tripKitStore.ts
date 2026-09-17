// Trip Kit store, API-backed (SQLite via Express).
// No localStorage. All data persists server-side per user account.

import { apiRequest, queryClient } from "./queryClient";

export interface SavedFly {
  flyId: string;
  flyName: string;
  flyType: string;
  rigging: any;
  knotIds: string[];
  notes: string;
}

export interface TripKit {
  id: string;
  userId?: number | null;
  name: string;
  river: string;
  state: string;
  dates: string;
  waterMode: "fresh" | "salt";
  flies: SavedFly[];
  knotIds: string[];
  notes: string;
  cachedAt: number;
  cacheStatus: "ready" | "partial" | "pending";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function createEmptyKit(
  name: string,
  river: string,
  state: string,
  dates: string,
  waterMode: "fresh" | "salt"
): TripKit {
  return {
    id: generateId(),
    name,
    river,
    state,
    dates,
    waterMode,
    flies: [],
    knotIds: [],
    notes: "",
    cachedAt: 0,
    cacheStatus: "pending",
  };
}

// ── API helpers ───────────────────────────────────────────────────────────────

export async function fetchTripKits(): Promise<TripKit[]> {
  const res = await fetch("/api/trip-kits", { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchTripKit(id: string): Promise<TripKit | null> {
  const res = await fetch(`/api/trip-kits/${id}`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function saveTripKit(kit: TripKit): Promise<TripKit> {
  const res = await apiRequest("POST", "/api/trip-kits", kit);
  const saved = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
  return saved;
}

export async function deleteTripKit(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/trip-kits/${id}`);
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
}

export async function addFlyToKit(kitId: string, fly: SavedFly): Promise<TripKit | null> {
  const res = await apiRequest("POST", `/api/trip-kits/${kitId}/flies`, fly);
  const updated = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
  return updated;
}

export async function removeFlyFromKit(kitId: string, flyId: string): Promise<TripKit | null> {
  const res = await apiRequest("DELETE", `/api/trip-kits/${kitId}/flies/${flyId}`);
  const updated = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
  return updated;
}

export async function updateKitNotes(kitId: string, notes: string): Promise<TripKit | null> {
  const res = await apiRequest("PATCH", `/api/trip-kits/${kitId}/notes`, { notes });
  const updated = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/trip-kits", kitId] });
  return updated;
}
