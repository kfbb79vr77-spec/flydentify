import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  email: string;
  subscriptionStatus: "free" | "trialing" | "active" | "expired" | "canceled";
  homeRegion?: string | null;
  subscriptionCurrentPeriodEnd?: number | null;
  trialStartedAt?: number | null;
  trialEndsAt?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isPro: boolean;
  isTrialing: boolean;
  isFree: boolean;    // logged in, permanent free tier
  isExpired: boolean;
  daysLeftInTrial: number | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, homeRegion?: string, newsletterOptIn?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await apiRequest("GET", "/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed.");
    }
    const data = await res.json();
    setUser(data.user);
  };

  const register = async (email: string, password: string, homeRegion?: string, newsletterOptIn = true) => {
    const res = await apiRequest("POST", "/api/auth/register", { email, password, homeRegion, newsletterOptIn });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration failed.");
    }
    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
  };

  const now = Math.floor(Date.now() / 1000);

  const isPro =
    !!user &&
    user.subscriptionStatus === "active" &&
    (user.subscriptionCurrentPeriodEnd == null || user.subscriptionCurrentPeriodEnd > now);

  const isTrialing =
    !!user &&
    user.subscriptionStatus === "trialing" &&
    user.trialEndsAt != null &&
    user.trialEndsAt > now;

  // Permanent free tier: signed in, never paid, no trial running
  const isFree =
    !!user &&
    (user.subscriptionStatus === "free" ||
     (user.subscriptionStatus === "trialing" && (user.trialEndsAt == null || user.trialEndsAt <= now)));

  const isExpired =
    !!user &&
    user.subscriptionStatus === "expired";

  // Days remaining in trial (null if not trialing, 0 if expired)
  const daysLeftInTrial: number | null =
    user?.trialEndsAt != null
      ? Math.max(0, Math.ceil((user.trialEndsAt - now) / 86400))
      : null;

  return (
    <AuthContext.Provider value={{ user, loading, isPro, isTrialing, isFree, isExpired, daysLeftInTrial, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
