import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import session from "express-session";
import createMemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage, logEvent } from "./storage";
import { insertFishingReportSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import { registerStreamRoutes } from "./streamRoutes";
import { registerForecastRoutes } from "./forecastEngine";
import { registerMonetizationRoutes } from "./monetizationRoutes";

// ── Stripe config (test mode until keys are set) ──────────────────────────────
// Add these env vars in your Stripe dashboard:
//   STRIPE_SECRET_KEY      = sk_live_...  (or sk_test_... while testing)
//   STRIPE_PRICE_MONTHLY   = price_xxx    (monthly recurring, 7-day trial)
//   STRIPE_PRICE_YEARLY    = price_xxx    (annual recurring, 7-day trial)
//   STRIPE_PRICE_LIFETIME  = price_xxx    (one-time payment)
//   STRIPE_WEBHOOK_SECRET  = whsec_xxx    (from Stripe webhooks dashboard)
const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY     || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_PRICE_MONTHLY  = process.env.STRIPE_PRICE_MONTHLY  || "";
const STRIPE_PRICE_YEARLY   = process.env.STRIPE_PRICE_YEARLY   || "";
const STRIPE_PRICE_LIFETIME = process.env.STRIPE_PRICE_LIFETIME || "";
const TRIAL_PERIOD_DAYS     = 7;

let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-05-28.basil" });
}

function priceIdForTier(tier: string): string | null {
  if (tier === "MONTHLY")  return STRIPE_PRICE_MONTHLY  || null;
  if (tier === "YEARLY")   return STRIPE_PRICE_YEARLY   || null;
  if (tier === "LIFETIME") return STRIPE_PRICE_LIFETIME || null;
  return null;
}

function isLifetimeTier(tier: string) { return tier === "LIFETIME"; }

// ── Session augmentation ───────────────────────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      subscriptionStatus: string;
      subscriptionCurrentPeriodEnd?: number | null;
      trialStartedAt?: number | null;
      trialEndsAt?: number | null;
      homeRegion?: string | null;
    }
  }
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

function requireSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  const user = req.user!;
  const now = Math.floor(Date.now() / 1000);
  // Paid and active
  if (
    user.subscriptionStatus === "active" &&
    (user.subscriptionCurrentPeriodEnd == null || user.subscriptionCurrentPeriodEnd > now)
  ) return next();
  // In trial window
  if (
    user.subscriptionStatus === "trialing" &&
    user.trialEndsAt != null &&
    user.trialEndsAt > now
  ) return next();
  // Trial expired or canceled
  res.status(402).json({
    error: "Trial expired",
    code: "TRIAL_EXPIRED",
    trialEndsAt: user.trialEndsAt ?? null,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Apple Universal Links (must be served before auth middleware) ──────────
  app.get("/.well-known/apple-app-site-association", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.sendFile(
      require("path").resolve(process.cwd(), "dist/public/.well-known/apple-app-site-association")
    );
  });

  // ── Session & Passport ─────────────────────────────────────────────────────
  const MemoryStore = createMemoryStore(session);
  app.use(session({
    name: "__Host-sid",
    secret: (() => {
      const s = process.env.SESSION_SECRET;
      if (!s) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("SESSION_SECRET environment variable must be set in production");
        }
        return "flydentify-dev-only-secret-not-for-prod";
      }
      return s;
    })(),
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) return done(null, false, { message: "No account found with that email." });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return done(null, false, { message: "Incorrect password." });
        return done(null, {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
          homeRegion: user.homeRegion,
        });
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) return done(null, false);
      // Auto-expire stale trial on session restore
      const now = Math.floor(Date.now() / 1000);
      let status = user.subscriptionStatus;
      if (status === 'trialing' && user.trialEndsAt != null && user.trialEndsAt < now) {
        await storage.updateUser(user.id, { subscriptionStatus: 'expired' });
        status = 'expired';
      }
      done(null, {
        id: user.id,
        email: user.email,
        subscriptionStatus: status,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        trialStartedAt: user.trialStartedAt,
        trialEndsAt: user.trialEndsAt,
        homeRegion: user.homeRegion,
      });
    } catch (err) {
      done(err);
    }
  });

  // ── Auth routes ────────────────────────────────────────────────────────────

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, homeRegion } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required." });
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(409).json({ error: "An account with that email already exists." });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email,
        passwordHash,
        homeRegion: homeRegion || null,
      });

      // Log them in immediately
      req.login({ id: user.id, email: user.email, subscriptionStatus: user.subscriptionStatus, trialStartedAt: user.trialStartedAt, trialEndsAt: user.trialEndsAt, homeRegion: user.homeRegion }, (err) => {
        if (err) return res.status(500).json({ error: "Login after register failed." });
        res.json({ user: { id: user.id, email: user.email, subscriptionStatus: user.subscriptionStatus, trialStartedAt: user.trialStartedAt, trialEndsAt: user.trialEndsAt, homeRegion: user.homeRegion } });
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Registration failed." });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || "Login failed." });
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ user });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ ok: true });
    });
  });

  // Current session
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.json({ user: null });
    }
  });

  // Create customer portal (manage/cancel)
  app.post("/api/stripe/portal", requireAuth, async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured." });
    try {
      const dbUser = await storage.getUserById(req.user!.id);
      if (!dbUser?.stripeCustomerId) return res.status(400).json({ error: "No billing account found." });
      const origin = req.headers.origin || "https://flydentify.pplx.app";
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${origin}/#/finder`,
      });
      res.json({ url: portalSession.url });
    } catch (err: any) {
      console.error("Portal error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Confirm subscription after successful checkout
  app.get("/api/stripe/confirm/:sessionId", requireAuth, async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured." });
    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
        expand: ["subscription"],
      });
      const sub = session.subscription as Stripe.Subscription;
      if (!sub) return res.status(400).json({ error: "No subscription found." });
      await storage.updateUser(req.user!.id, {
        stripeSubscriptionId: sub.id,
        subscriptionStatus: sub.status === "active" ? "active" : "free",
        subscriptionCurrentPeriodEnd: sub.current_period_end,
      });
      res.json({ ok: true, status: sub.status });
    } catch (err: any) {
      console.error("Confirm error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Stripe webhook (handles renewals, cancellations)
  app.post("/api/stripe/webhook",
    // Raw body needed for signature verification
    (req, res, next) => {
      let raw = "";
      req.setEncoding("utf8");
      req.on("data", (chunk) => { raw += chunk; });
      req.on("end", () => {
        (req as any).rawBody = raw;
        next();
      });
    },
    async (req, res) => {
      if (!stripe) return res.status(503).send("Stripe not configured");
      let event: Stripe.Event;
      try {
        event = STRIPE_WEBHOOK_SECRET
          ? stripe.webhooks.constructEvent((req as any).rawBody, req.headers["stripe-signature"]!, STRIPE_WEBHOOK_SECRET)
          : JSON.parse((req as any).rawBody);
      } catch (err: any) {
        return res.status(400).send(`Webhook error: ${err.message}`);
      }

      const sub = (event.data.object as Stripe.Subscription);
      if (["customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
        const userId = Number(sub.metadata?.userId);
        if (userId) {
          await storage.updateUser(userId, {
            subscriptionStatus: sub.status === "active" ? "active" : "canceled",
            subscriptionCurrentPeriodEnd: sub.current_period_end,
          });
        }
      }
      res.json({ received: true });
    }
  );

  // ── Geocoding proxy routes ─────────────────────────────────────────────────
  app.get("/api/geocode", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.status(400).json({ error: "Missing q parameter" });
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=us&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Flydentify/1.0 (fly fishing app)",
        },
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Geocoding failed" });
    }
  });

  app.get("/api/reverse", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180)
        return res.status(400).json({ error: "Invalid lat/lon" });
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Flydentify/1.0 (fly fishing app)",
        },
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Reverse geocoding failed" });
    }
  });

  // ── Fishing reports ────────────────────────────────────────────────────────
  app.get("/api/reports", async (_req, res) => {
    const reports = await storage.getFishingReports();
    res.json(reports);
  });

  app.post("/api/reports", requireAuth, async (req, res) => {
    const result = insertFishingReportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const report = await storage.createFishingReport(result.data);
    res.status(201).json(report);
  });

  app.delete("/api/reports/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    await storage.deleteFishingReport(id);
    res.status(204).send();
  });

  // ── Hatch Reports ─────────────────────────────────────────────────────

  // POST /api/hatch-reports — create a hatch report (auth optional)
  app.post("/api/hatch-reports", async (req, res) => {
    try {
      const { state, river, insect, intensity, waterTemp, conditions } = req.body;
      if (!state || !river || !insect || !intensity) {
        return res.status(400).json({ error: "state, river, insect, and intensity are required." });
      }
      const validIntensities = ["sparse", "moderate", "heavy"];
      if (!validIntensities.includes(intensity)) {
        return res.status(400).json({ error: "intensity must be sparse, moderate, or heavy." });
      }
      const userId = req.isAuthenticated() ? req.user!.id : null;
      const report = await storage.createHatchReport({
        state: state.toUpperCase(),
        river,
        insect,
        intensity,
        waterTemp: waterTemp != null ? Number(waterTemp) : null,
        conditions: conditions || null,
        userId,
        createdAt: Math.floor(Date.now() / 1000),
      });
      res.status(201).json(report);
    } catch (err: any) {
      console.error("Hatch report create error:", err);
      res.status(500).json({ error: "Failed to create hatch report." });
    }
  });

  // GET /api/hatch-reports?state=TX&limit=20
  app.get("/api/hatch-reports", async (req, res) => {
    try {
      const state = req.query.state as string | undefined;
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      if (state) {
        const reports = await storage.getHatchReportsByState(state, limit);
        return res.json(reports);
      }
      const reports = await storage.getRecentHatchReports(limit);
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch hatch reports." });
    }
  });

  // GET /api/hatch-reports/recent?lat=&lon=&radius=200
  app.get("/api/hatch-reports/recent", async (req, res) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const reports = await storage.getRecentHatchReports(limit);
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch recent hatch reports." });
    }
  });

  // ── Trip Plans ────────────────────────────────────────────────────────

  // POST /api/trip-plans — create a trip plan (auth required)
  app.post("/api/trip-plans", requireAuth, async (req, res) => {
    try {
      const { destination, state, targetDate, targetSpecies, notes, alertEnabled } = req.body;
      if (!destination || !state || !targetDate) {
        return res.status(400).json({ error: "destination, state, and targetDate are required." });
      }
      const plan = await storage.createTripPlan({
        userId: req.user!.id,
        destination,
        state: state.toUpperCase(),
        targetDate,
        targetSpecies: Array.isArray(targetSpecies) ? JSON.stringify(targetSpecies) : (targetSpecies || null),
        notes: notes || null,
        alertEnabled: alertEnabled !== false ? 1 : 0,
        createdAt: Math.floor(Date.now() / 1000),
      });
      res.status(201).json(plan);
    } catch (err: any) {
      console.error("Trip plan create error:", err);
      res.status(500).json({ error: "Failed to create trip plan." });
    }
  });

  // GET /api/trip-plans — get user's trip plans (auth required)
  app.get("/api/trip-plans", requireAuth, async (req, res) => {
    try {
      const plans = await storage.getTripPlansByUser(req.user!.id);
      res.json(plans);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch trip plans." });
    }
  });

  // DELETE /api/trip-plans/:id — delete own plan (auth required)
  app.delete("/api/trip-plans/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });
      await storage.deleteTripPlan(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete trip plan." });
    }
  });


  // ── RSS Feed ── AI-authored fly fishing articles, rotating 4 literary voices ──
  // Voices: Hemingway (terse, declarative, no dashes), Thoreau (meditative, semicolons),
  //         Dave Ramirez (modern fly fishing, clean prose), Twain (colloquial, warm)
  // Rule: NO em dashes or en dashes in any article. Use commas, semicolons, periods only.

  const RSS_ARTICLES = [
    {
      id: "001",
      title: "The Guadalupe in June",
      region: "Texas Hill Country",
      voice: "hemingway",
      pubDate: "Wed, 11 Jun 2026 06:00:00 GMT",
      body: `The river comes down cold from the springs. You feel it through your waders before you are even knee-deep. June on the Guadalupe is a thing you have to do early, before the sun gets into the canyon. The rainbows hold in the tail-outs and in the slots behind the limestone shelves. They are not large fish but they are honest fish. They eat a size 18 Zebra Midge without ceremony. You rig light. You rig 6X. You move slow and you keep the sun behind you and after a while the morning does what mornings do on good water.`,
      flyPattern: "Zebra Midge, size 18",
      tags: ["Texas", "freshwater", "midge", "trout"],
    },
    {
      id: "002",
      title: "On Stillness and the Hatch",
      region: "Rocky Mountain West",
      voice: "thoreau",
      pubDate: "Wed, 04 Jun 2026 06:00:00 GMT",
      body: `I have stood in moving water long enough to understand that patience is not the absence of desire but the refinement of it. The angler who waits for the hatch does not idle; he studies. He reads the surface the way a scholar reads a difficult text, attending to each ring, each dimple, each barely perceptible sip. On the Provo last May, the Blue-Winged Olives came at exactly the moment the clouds thickened over the ridge, as if the insects had some arrangement with the weather, some old compact written in pressure and light. I have no theory to explain this. I have only the fish, and the fly, and the silence that precedes the rise.`,
      flyPattern: "BWO Parachute, size 18-20",
      tags: ["Rocky Mountain", "freshwater", "BWO", "nymph"],
    },
    {
      id: "003",
      title: "Permit Don't Care How Good You Think You Are",
      region: "Florida Keys / Caribbean Flats",
      voice: "ramirez",
      pubDate: "Wed, 28 May 2026 06:00:00 GMT",
      body: `You can throw a perfect cast at a permit and watch it spook anyway. That is the deal. The fly lands soft, the crab pattern sinks right, the fish tips up and you think this is it, this is finally it, and then nothing. The permit ghosts away like smoke in a wind. The guide on the poling platform says something kind because that is what good guides do. You strip in, check the fly, and look for the next one. That is the whole game on the flats. The cast does not guarantee anything. It only earns you a chance, and permit make you earn it again and again before they let you win.`,
      flyPattern: "Del Brown Permit Crab, size 2-4",
      tags: ["saltwater", "Florida Keys", "permit", "flats"],
    },
    {
      id: "004",
      title: "The Sacramento After Rain",
      region: "Northern California",
      voice: "twain",
      pubDate: "Wed, 21 May 2026 06:00:00 GMT",
      body: `Well, I will tell you something about the Sacramento River after three days of rain. It is brown as coffee and twice as fast, and a sensible man would stay home. I was not a sensible man. We put in below Redding on a Thursday with the water running high and the guides shaking their heads in that particular way guides have when they have already been paid. The Elk Hair Caddis was useless. The Hare's Ear was useless. What finally worked was a Woolly Bugger the color of old mud, swung slow through the inside bend where the current slackened. The trout were there. They were cold and they were hungry and they were grateful for something that looked like it belonged in that water. Sometimes that is all the philosophy a river trip requires.`,
      flyPattern: "Woolly Bugger, olive/brown, size 6-8",
      tags: ["California", "freshwater", "steelhead", "streamer"],
    },
    {
      id: "005",
      title: "Tarpon Season, Islamorada",
      region: "Florida Keys",
      voice: "hemingway",
      pubDate: "Wed, 14 May 2026 06:00:00 GMT",
      body: `The tarpon come through in May. They travel in pods along the channels and you see them before they see you if you are lucky. A hundred pounds of silver fish moving through gin-clear water is a thing that does not prepare you the way you think it will. You make the cast. The Cockroach lands ahead of the pod and you strip slow and one fish breaks from the others and follows. The take, when it comes, is not gentle. You strip-strike hard. The fish leaves the water completely. It is jumping before you understand that it has struck. You bow to the fish when it jumps. That is the tradition and the tradition exists because it works. Not always. But enough.`,
      flyPattern: "Cockroach Tarpon Fly, size 2/0-3/0",
      tags: ["saltwater", "Florida Keys", "tarpon", "flats"],
    },
    {
      id: "006",
      title: "Reading Water on the Green River",
      region: "Utah",
      voice: "thoreau",
      pubDate: "Wed, 07 May 2026 06:00:00 GMT",
      body: `A river is not a single thing; it is a community of currents, each with its own character and velocity, and the trout distribute themselves among these currents according to laws that are older than our knowledge of them. The Green River below Flaming Gorge runs cold and clear in all seasons; the tailwater below the dam keeps temperature honest even in August, and the fish grow fat and deliberate on scuds and midges carried down from the reservoir. I have spent whole mornings reading a single seam of water, observing where the current slackens at the edge of a weed bed, where the foam line delivers food to a waiting fish. This is not patience as resignation. It is patience as attention; and attention, honestly practiced, is its own reward before the first fish ever rises.`,
      flyPattern: "Scud, pink or tan, size 14-16",
      tags: ["Utah", "freshwater", "tailwater", "scud"],
    },
    {
      id: "007",
      title: "Redfish on the Texas Coast",
      region: "Texas Gulf Coast",
      voice: "ramirez",
      pubDate: "Wed, 30 Apr 2026 06:00:00 GMT",
      body: `The redfish tails in less than a foot of water and the whole thing turns into a problem of geometry. You need the fly in front of the fish before the fish moves, but not so close that the splash spooks it. The guide reads the wind and the tide and the angle of the sun and he puts you in position. After that it is your problem. The Bruce Chard Redfish Fly lands right and the red tips down and the line goes tight and the fish runs hard for the spartina grass at the edge of the flat. You turn it. You always have to turn the redfish before it reaches the grass or the game is over. Texas coast fly fishing is not elegant. It is fast and physical and loud and when it works it is about the best thing you can do with a fly rod.`,
      flyPattern: "Bruce Chard Redfish Fly, size 2",
      tags: ["Texas", "saltwater", "redfish", "flats"],
    },
    {
      id: "008",
      title: "The Madison at First Light",
      region: "Montana",
      voice: "twain",
      pubDate: "Wed, 23 Apr 2026 06:00:00 GMT",
      body: `Montana in the morning has a way of making a man feel both very small and very fortunate, which is a combination not easy to find in the modern world. I was on the Madison at five-thirty in the morning when the fog was still in the willows and the osprey had not yet made up its mind about the day. The salmonflies were coming off the water in that improbable way they have, big clumsy insects the size of a man's thumb, and the trout were losing their usual good sense entirely. A size 4 Stimulator thrown with no particular art whatsoever was enough to bring up fish after fish. I caught more brown trout that morning than I deserved. The river did not seem to mind.`,
      flyPattern: "Stimulator, orange, size 4-6",
      tags: ["Montana", "freshwater", "salmonfly", "dry fly"],
    },
  ];

  // ── Trip Kits CRUD ──────────────────────────────────────────────────────────────
  // Kits are tied to the logged-in user. Guest users get an empty list.

  function kitUserId(req: any): number | null {
    return (req.session as any)?.userId ?? null;
  }

  // GET all kits for current user
  app.get("/api/trip-kits", async (req, res) => {
    const userId = kitUserId(req);
    if (!userId) return res.json([]);
    const kits = await storage.getTripKits(userId);
    // Parse JSON columns before sending
    const parsed = kits.map(k => ({
      ...k,
      flies: JSON.parse(k.flies ?? "[]"),
      knotIds: JSON.parse(k.knotIds ?? "[]"),
    }));
    res.json(parsed);
  });

  // GET single kit
  app.get("/api/trip-kits/:id", async (req, res) => {
    const kit = await storage.getTripKit(req.params.id, kitUserId(req));
    if (!kit) return res.status(404).json({ error: "Not found" });
    res.json({ ...kit, flies: JSON.parse(kit.flies ?? "[]"), knotIds: JSON.parse(kit.knotIds ?? "[]") });
  });

  // POST create/update kit (upsert)
  app.post("/api/trip-kits", async (req, res) => {
    const userId = kitUserId(req);
    if (!userId) return res.status(401).json({ error: "Sign in to save Trip Kits" });
    const body = req.body;
    const data = {
      id: body.id,
      userId,
      name: body.name ?? "Untitled Kit",
      river: body.river ?? "",
      state: body.state ?? "",
      dates: body.dates ?? "",
      waterMode: body.waterMode ?? "fresh",
      flies: JSON.stringify(Array.isArray(body.flies) ? body.flies : []),
      knotIds: JSON.stringify(Array.isArray(body.knotIds) ? body.knotIds : []),
      notes: body.notes ?? "",
      cachedAt: body.cachedAt ?? 0,
      cacheStatus: body.cacheStatus ?? "pending",
    };
    const kit = await storage.upsertTripKit(data);
    res.json({ ...kit, flies: JSON.parse(kit.flies ?? "[]"), knotIds: JSON.parse(kit.knotIds ?? "[]") });
  });

  // DELETE kit
  app.delete("/api/trip-kits/:id", async (req, res) => {
    await storage.deleteTripKit(req.params.id, kitUserId(req));
    res.json({ ok: true });
  });

  // POST add fly to kit
  app.post("/api/trip-kits/:id/flies", async (req, res) => {
    const kit = await storage.addFlyToKit(req.params.id, kitUserId(req), req.body);
    if (!kit) return res.status(404).json({ error: "Kit not found" });
    res.json({ ...kit, flies: JSON.parse(kit.flies ?? "[]"), knotIds: JSON.parse(kit.knotIds ?? "[]") });
  });

  // DELETE fly from kit
  app.delete("/api/trip-kits/:id/flies/:flyId", async (req, res) => {
    const kit = await storage.removeFlyFromKit(req.params.id, kitUserId(req), req.params.flyId);
    if (!kit) return res.status(404).json({ error: "Kit not found" });
    res.json({ ...kit, flies: JSON.parse(kit.flies ?? "[]"), knotIds: JSON.parse(kit.knotIds ?? "[]") });
  });

  // PATCH kit notes
  app.patch("/api/trip-kits/:id/notes", async (req, res) => {
    const kit = await storage.updateKitNotes(req.params.id, kitUserId(req), req.body.notes ?? "");
    if (!kit) return res.status(404).json({ error: "Kit not found" });
    res.json({ ...kit, flies: JSON.parse(kit.flies ?? "[]"), knotIds: JSON.parse(kit.knotIds ?? "[]") });
  });

  // ── Places API (lodging + eats) ──────────────────────────────────────────
  // Curated fallback data per region — used when GOOGLE_PLACES_KEY is not set.
  // When the key is present, live Google Places Nearby Search results are returned.

  const CURATED_LODGING: Record<string, any[]> = {
    "Rocky Mountain West": [
      { name: "Slide Inn", type: "Lodge", address: "3 Slide Inn Rd, West Yellowstone, MT", phone: "(406) 682-4400", rating: 4.8, url: "https://maps.google.com/?q=Slide+Inn+West+Yellowstone+MT", note: "Right on the Madison. Fly shop on-site, guided trips available." },
      { name: "Montana Trout Outfitters Cabin", type: "Cabin", address: "Bozeman, MT", phone: "(406) 587-3111", rating: 4.7, url: "https://maps.google.com/?q=Montana+Trout+Outfitters+Bozeman+MT", note: "Rustic cabins with rod storage and wader drying room." },
      { name: "Blue Damsel Lodge", type: "Lodge", address: "Cameron, MT", phone: "(406) 682-7772", rating: 4.9, url: "https://maps.google.com/?q=Blue+Damsel+Lodge+Cameron+MT", note: "Orvis-endorsed. Steps from the Madison River." },
      { name: "Yellowstone Valley Lodge", type: "Motel", address: "Livingston, MT", phone: "(406) 333-4787", rating: 4.3, url: "https://maps.google.com/?q=Yellowstone+Valley+Lodge+Livingston+MT", note: "Classic guide motel. Park-n-fish from the door." },
    ],
    "Pacific Northwest": [
      { name: "Steamboat Inn", type: "Lodge", address: "Steamboat, OR", phone: "(541) 498-2230", rating: 4.9, url: "https://maps.google.com/?q=Steamboat+Inn+Oregon", note: "Legendary North Umpqua steelhead lodge. Legendary dining too." },
      { name: "The Fly Fisher's Place Cabins", type: "Cabin", address: "Sisters, OR", phone: "(541) 549-3474", rating: 4.6, url: "https://maps.google.com/?q=Fly+Fishers+Place+Sisters+OR", note: "Walk to the Metolius. One of the best dry-fly rivers in the West." },
      { name: "Clearwater River Lodge", type: "Lodge", address: "Orofino, ID", phone: "(208) 476-5990", rating: 4.5, url: "https://maps.google.com/?q=Clearwater+River+Lodge+Orofino+ID", note: "Steelhead country. Right on the river." },
    ],
    "Appalachians": [
      { name: "Hemlock Inn", type: "Lodge", address: "Bryson City, NC", phone: "(828) 488-2885", rating: 4.7, url: "https://maps.google.com/?q=Hemlock+Inn+Bryson+City+NC", note: "Classic Smoky Mountain lodge near Delayed Harvest trout water." },
      { name: "Cataloochee Ranch", type: "Cabin", address: "Maggie Valley, NC", phone: "(828) 926-1401", rating: 4.8, url: "https://maps.google.com/?q=Cataloochee+Ranch+Maggie+Valley+NC", note: "Working mountain ranch. Wild trout streams on property." },
      { name: "Douthat State Park Cabins", type: "Cabin", address: "Millboro, VA", phone: "(540) 862-8100", rating: 4.5, url: "https://maps.google.com/?q=Douthat+State+Park+Cabins+VA", note: "State park cabins next to stocked trout lake." },
    ],
    "Northeast / New England": [
      { name: "Beaverkill Valley Inn", type: "Lodge", address: "Roscoe, NY", phone: "(845) 439-4844", rating: 4.8, url: "https://maps.google.com/?q=Beaverkill+Valley+Inn+Roscoe+NY", note: "Historic Catskills lodge. The birthplace of American fly fishing." },
      { name: "Riverview B&B", type: "Motel", address: "Roscoe, NY", phone: "(845) 439-4242", rating: 4.4, url: "https://maps.google.com/?q=Riverview+BB+Roscoe+NY", note: "Clean, simple. Right in Trout Town USA." },
      { name: "Orvis Sandanona", type: "Lodge", address: "Millbrook, NY", phone: "(845) 677-9701", rating: 4.9, url: "https://maps.google.com/?q=Orvis+Sandanona+Millbrook+NY", note: "Orvis flagship hunting and fishing lodge." },
    ],
    "Upper Midwest": [
      { name: "Trout Run Cabins", type: "Cabin", address: "Lanesboro, MN", phone: "(507) 467-2943", rating: 4.6, url: "https://maps.google.com/?q=Trout+Run+Cabins+Lanesboro+MN", note: "On the Root River. Prime Driftless Area limestone streams nearby." },
      { name: "Spring Creek Motel", type: "Motel", address: "Viroqua, WI", phone: "(608) 637-8080", rating: 4.2, url: "https://maps.google.com/?q=Spring+Creek+Motel+Viroqua+WI", note: "No-frills guide motel in the heart of Driftless trout country." },
    ],
    "Gulf Coast / Saltwater": [
      { name: "Hawks Cay Resort", type: "Lodge", address: "Duck Key, FL", phone: "(305) 743-7000", rating: 4.7, url: "https://maps.google.com/?q=Hawks+Cay+Resort+Duck+Key+FL", note: "Florida Keys flats lodge. Guided permit, bonefish, tarpon." },
      { name: "Cheeca Lodge", type: "Lodge", address: "Islamorada, FL", phone: "(305) 664-4651", rating: 4.6, url: "https://maps.google.com/?q=Cheeca+Lodge+Islamorada+FL", note: "Classic Keys lodge. Sport fishing and flats access." },
      { name: "Little Palm Island", type: "Lodge", address: "Little Torch Key, FL", phone: "(305) 872-2524", rating: 4.9, url: "https://maps.google.com/?q=Little+Palm+Island+Florida+Keys", note: "Secluded island lodge. Prime backcountry flats." },
    ],
    "default": [
      { name: "Local Fly Lodge", type: "Lodge", address: "Near your fishing destination", phone: "", rating: 4.5, url: "https://maps.google.com/?q=fly+fishing+lodge+near+me", note: "Search for Orvis-endorsed lodges near your destination for the most current recommendations." },
    ],
  };

  const CURATED_EATS: Record<string, any[]> = {
    "Rocky Mountain West": [
      { name: "Ennis Cafe", type: "Diner", address: "Main St, Ennis, MT", phone: "(406) 682-4442", rating: 4.6, url: "https://maps.google.com/?q=Ennis+Cafe+Montana", note: "Pancakes and elk sausage. Every guide in the Madison Valley eats here." },
      { name: "The Longbranch Saloon & Kitchen", type: "Breakfast", address: "West Yellowstone, MT", phone: "(406) 646-9119", rating: 4.4, url: "https://maps.google.com/?q=Longbranch+Saloon+West+Yellowstone+MT", note: "Opens early. Huge portions for a long day on the water." },
      { name: "The Pine Creek Lodge Restaurant", type: "Dinner", address: "Livingston, MT", phone: "(406) 222-9669", rating: 4.8, url: "https://maps.google.com/?q=Pine+Creek+Lodge+Restaurant+Livingston+MT", note: "Best dinner in Paradise Valley. Farm-to-table, full bar." },
      { name: "Yesterday's Soda Fountain", type: "Breakfast", address: "Bozeman, MT", phone: "(406) 587-4420", rating: 4.5, url: "https://maps.google.com/?q=Yesterdays+Soda+Fountain+Bozeman+MT", note: "Old-school counter diner. Open at 6am." },
    ],
    "Pacific Northwest": [
      { name: "Blackbird Restaurant", type: "Dinner", address: "Bend, OR", phone: "(541) 318-0048", rating: 4.7, url: "https://maps.google.com/?q=Blackbird+Restaurant+Bend+OR", note: "Post-float dinner spot. Craft cocktails and local catch." },
      { name: "McKay Cottage", type: "Breakfast", address: "Bend, OR", phone: "(541) 383-2697", rating: 4.6, url: "https://maps.google.com/?q=McKay+Cottage+Bend+OR", note: "Best breakfast in Bend. Line out the door on weekends." },
      { name: "Sisters Diner", type: "Diner", address: "Sisters, OR", phone: "(541) 549-2575", rating: 4.5, url: "https://maps.google.com/?q=Sisters+Diner+Oregon", note: "Classic Western diner. Walk to your car, drive to the Metolius." },
    ],
    "Appalachians": [
      { name: "Nantahala Village Restaurant", type: "Diner", address: "Bryson City, NC", phone: "(828) 488-2826", rating: 4.4, url: "https://maps.google.com/?q=Nantahala+Village+Restaurant+Bryson+City+NC", note: "Country breakfast with a mountain view." },
      { name: "The Cork & Bean", type: "Breakfast", address: "Waynesville, NC", phone: "(828) 456-8637", rating: 4.5, url: "https://maps.google.com/?q=Cork+Bean+Waynesville+NC", note: "Coffee shop and biscuit breakfast near the Pigeon River." },
      { name: "The Peddler Steakhouse", type: "Dinner", address: "Gatlinburg, TN", phone: "(865) 436-5794", rating: 4.7, url: "https://maps.google.com/?q=Peddler+Steakhouse+Gatlinburg+TN", note: "Legendary mountain steakhouse. On Gatlinburg Creek." },
    ],
    "Northeast / New England": [
      { name: "Roscoe Diner", type: "Diner", address: "Roscoe, NY", phone: "(607) 498-4405", rating: 4.7, url: "https://maps.google.com/?q=Roscoe+Diner+NY", note: "The real deal. Open at 6am. Every guide in the Catskills knows it." },
      { name: "Stewart's Shops", type: "Breakfast", address: "Upstate NY (multiple)", phone: "", rating: 4.3, url: "https://maps.google.com/?q=Stewarts+Shops+Upstate+NY", note: "Local institution. Great coffee and egg sandwiches before the hatch." },
      { name: "The Antrim Inn", type: "Dinner", address: "Antrim, NH", phone: "(603) 588-8000", rating: 4.6, url: "https://maps.google.com/?q=Antrim+Inn+NH", note: "Classic New England inn dining. Near the Contoocook River." },
    ],
    "Upper Midwest": [
      { name: "Old Village Hall Restaurant", type: "Dinner", address: "Lanesboro, MN", phone: "(507) 467-2962", rating: 4.7, url: "https://maps.google.com/?q=Old+Village+Hall+Restaurant+Lanesboro+MN", note: "Best dinner in the Driftless. Farm-to-table right on the Root River." },
      { name: "The Rustic Bar", type: "Diner", address: "Viroqua, WI", phone: "(608) 637-2028", rating: 4.3, url: "https://maps.google.com/?q=Rustic+Bar+Viroqua+WI", note: "Locals-only breakfast joint. Cash only, opens at 5:30am." },
    ],
    "Gulf Coast / Saltwater": [
      { name: "Loretta's Authentic Pralines", type: "Breakfast", address: "New Orleans, LA", phone: "(504) 529-6170", rating: 4.8, url: "https://maps.google.com/?q=Lorettas+Authentic+Pralines+New+Orleans", note: "Start your trip right. Best beignets in the city before hitting the marsh." },
      { name: "Marker 88", type: "Dinner", address: "Islamorada, FL", phone: "(305) 852-9315", rating: 4.6, url: "https://maps.google.com/?q=Marker+88+Islamorada+FL", note: "Waterfront Keys dining. Fresh fish, cold beer, sunset guaranteed." },
      { name: "The Fish House", type: "Dinner", address: "Key Largo, FL", phone: "(305) 451-4665", rating: 4.7, url: "https://maps.google.com/?q=Fish+House+Key+Largo+FL", note: "Local catch every day. Ask what came in off the boats." },
      { name: "Key West Diner", type: "Diner", address: "Key West, FL", phone: "(305) 296-5890", rating: 4.4, url: "https://maps.google.com/?q=Key+West+Diner+FL", note: "No-frills island breakfast. Cuban toast and strong coffee." },
    ],
    "default": [
      { name: "Local Diner", type: "Diner", address: "Near your fishing destination", phone: "", rating: 4.3, url: "https://maps.google.com/?q=diner+near+me", note: "Ask your guide where they eat breakfast. That's always the right answer." },
    ],
  };

  // Map kit region names to curated data keys
  function matchRegion(region: string, data: Record<string, any[]>): any[] {
    if (!region) return data["default"];
    const key = Object.keys(data).find(k =>
      region.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().split(" ").some((w: string) => region.toLowerCase().includes(w))
    );
    return data[key ?? "default"] ?? data["default"];
  }

  app.get("/api/places", async (req, res) => {
    const { type, region, lat, lng } = req.query as Record<string, string>;
    const apiKey = process.env.GOOGLE_PLACES_KEY;

    if (apiKey && lat && lng) {
      // Live Google Places Nearby Search
      try {
        const radius = 40000; // 25 miles
        let keyword = type === "lodging"
          ? "fly fishing lodge cabin motel"
          : "diner breakfast restaurant";
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type === "lodging" ? "lodging" : "restaurant"}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json() as any;
        const places = (data.results ?? []).slice(0, 6).map((p: any) => ({
          name: p.name,
          type: type === "lodging" ? "Lodge" : "Diner",
          address: p.vicinity,
          phone: "",
          rating: p.rating ?? null,
          url: `https://maps.google.com/?place_id=${p.place_id}`,
          note: p.opening_hours?.open_now ? "Open now" : "",
          photo: p.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
            : null,
        }));
        return res.json({ source: "google", places });
      } catch (e) {
        // Fall through to curated on error
      }
    }

    // Curated fallback
    const data = type === "lodging" ? CURATED_LODGING : CURATED_EATS;
    const places = matchRegion(region ?? "", data);
    return res.json({ source: "curated", places });
  });

  app.get("/api/rss", (_req, res) => {
    const baseUrl = "https://flydentify.pplx.app";
    const items = RSS_ARTICLES.map(a => {
      const voiceLabel = a.voice === "hemingway" ? "Ernest Hemingway" :
        a.voice === "thoreau" ? "Henry David Thoreau" :
        a.voice === "ramirez" ? "Dave Ramirez" : "Mark Twain";
      return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/#/articles/${a.id}</link>
      <guid isPermaLink="false">${baseUrl}/articles/${a.id}</guid>
      <pubDate>${a.pubDate}</pubDate>
      <description><![CDATA[${a.body.trim()}]]></description>
      <category>${a.region}</category>
      <author>In the style of ${voiceLabel}</author>
      <flydentify:flyPattern>${a.flyPattern}</flydentify:flyPattern>
      <flydentify:region>${a.region}</flydentify:region>
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:flydentify="https://flydentify.pplx.app/ns/1.0">
  <channel>
    <title>Flydentify: On the Water</title>
    <link>${baseUrl}</link>
    <description>Fly fishing field notes, hatch reports, and river dispatches. Written in the voices of the greats. No em dashes. No hype. Just water and fish.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>Flydentify</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  // ── Articles endpoint (JSON, for in-app feed) ──────────────────────────────
  app.get("/api/articles", (_req, res) => {
    const { region, voice, tag } = _req.query;
    let articles = RSS_ARTICLES;
    if (region) articles = articles.filter(a => a.region.toLowerCase().includes((region as string).toLowerCase()));
    if (voice)  articles = articles.filter(a => a.voice === voice);
    if (tag)    articles = articles.filter(a => a.tags.includes(tag as string));
    res.json(articles);
  });

  app.get("/api/articles/:id", (req, res) => {
    const article = RSS_ARTICLES.find(a => a.id === req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  // ── Weather / Conditions API routes ────────────────────────────────────────
  // In-memory cache: key → { data: any, ts: number }
  const conditionsCache = new Map<string, { data: any; ts: number }>();
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  function cacheGet(key: string): any | null {
    const entry = conditionsCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { conditionsCache.delete(key); return null; }
    return entry.data;
  }
  function cacheSet(key: string, data: any): void {
    conditionsCache.set(key, { data, ts: Date.now() });
  }

  // ── Route 1: GET /api/conditions/river ───────────────────────────────────────
  app.get("/api/conditions/river", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      if (isNaN(lat) || isNaN(lon)) {
        return res.json({ error: "Missing or invalid lat/lon" });
      }

      const cacheKey = `river-${lat.toFixed(3)}-${lon.toFixed(3)}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // Step 1: Find nearest USGS stream gauges within ~0.5 degree bbox
      const bBox = `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`;
      const siteUrl = `https://waterservices.usgs.gov/nwis/site/?format=rdb&bBox=${bBox}&siteType=ST&hasDataTypeCd=iv&parameterCd=00060`;
      let siteResp: Response;
      try {
        siteResp = await fetch(siteUrl, { headers: { "Accept": "text/plain" } });
      } catch {
        return res.json({ error: "No gauge data available for this location" });
      }
      const siteText = await siteResp.text();

      // Step 2: Parse RDB text — skip comment lines, skip two header rows
      const siteLines = siteText.split("\n").filter(l => !l.startsWith("#") && l.trim() !== "");
      // siteLines[0] = column headers, siteLines[1] = data-type row, siteLines[2+] = data
      if (siteLines.length < 3) {
        return res.json({ error: "No gauge data available for this location" });
      }
      const dataLines = siteLines.slice(2);
      interface SiteRow { site_no: string; station_nm: string; siteLat: number; siteLon: number; }
      const sites: SiteRow[] = [];
      for (const line of dataLines) {
        const cols = line.split("\t");
        if (cols.length < 7) continue;
        const siteLat = parseFloat(cols[4]);
        const siteLon = parseFloat(cols[5]);
        if (isNaN(siteLat) || isNaN(siteLon)) continue;
        sites.push({ site_no: cols[1].trim(), station_nm: cols[2].trim(), siteLat, siteLon });
      }
      if (sites.length === 0) {
        return res.json({ error: "No gauge data available for this location" });
      }

      // Step 3: Pick closest site by Euclidean distance
      let closestSite = sites[0];
      let minDist = Math.hypot(sites[0].siteLat - lat, sites[0].siteLon - lon);
      for (const s of sites) {
        const d = Math.hypot(s.siteLat - lat, s.siteLon - lon);
        if (d < minDist) { minDist = d; closestSite = s; }
      }

      // Step 4: Fetch current conditions
      const ivUrl = `https://waterservices.usgs.gov/nwis/iv/?sites=${closestSite.site_no}&parameterCd=00060,00065,00010&format=json&period=PT2H`;
      let ivResp: Response;
      try {
        ivResp = await fetch(ivUrl);
      } catch {
        return res.json({ error: "No gauge data available for this location" });
      }
      let ivJson: any;
      try { ivJson = await ivResp.json(); } catch { return res.json({ error: "No gauge data available for this location" }); }

      // Step 5: Parse timeSeries
      const timeSeries: any[] = ivJson?.value?.timeSeries ?? [];
      let flow_cfs: number | null = null;
      let gauge_height_ft: number | null = null;
      let water_temp_c: number | null = null;
      let updated_at = "";

      for (const ts of timeSeries) {
        const code: string = ts?.variable?.variableCode?.[0]?.value ?? "";
        const vals: any[] = ts?.values?.[0]?.value ?? [];
        if (vals.length === 0) continue;
        const last = vals[vals.length - 1];
        const val = parseFloat(last?.value);
        if (isNaN(val)) continue;
        if (!updated_at && last?.dateTime) updated_at = last.dateTime;
        if (code === "00060") flow_cfs = val;
        else if (code === "00065") gauge_height_ft = val;
        else if (code === "00010") water_temp_c = val;
      }

      // Convert water temp C → F
      const water_temp_f = water_temp_c !== null ? Math.round((water_temp_c * 9 / 5 + 32) * 10) / 10 : null;

      // Step 6: Wadeability
      let wadeability = "Unknown";
      if (flow_cfs !== null) {
        if (flow_cfs < 50) wadeability = "Very low";
        else if (flow_cfs < 200) wadeability = "Fishable";
        else if (flow_cfs < 500) wadeability = "Wadeable with care";
        else if (flow_cfs < 1500) wadeability = "High — wade with caution";
        else wadeability = "Unfishable — too high";
      }

      // Step 7: Water temp advisory
      let temp_advisory: string | null = null;
      if (water_temp_f !== null) {
        if (water_temp_f < 45) temp_advisory = "Too cold — fish sluggish";
        else if (water_temp_f < 50) temp_advisory = "Cold — nymphs only";
        else if (water_temp_f <= 65) temp_advisory = "Prime — surface activity likely";
        else if (water_temp_f <= 68) temp_advisory = "Warm — fish deep or early morning";
        else temp_advisory = "Too warm — fish stressed, consider skipping";
      }

      const result = {
        station_name: closestSite.station_nm,
        site_no: closestSite.site_no,
        flow_cfs,
        gauge_height_ft,
        water_temp_f,
        wadeability,
        temp_advisory,
        trend: "Steady",
        updated_at,
      };
      cacheSet(cacheKey, result);
      res.json(result);
    } catch (err) {
      console.error("[conditions/river] error:", err);
      res.json({ error: "No gauge data available for this location" });
    }
  });

  // ── Route 2: GET /api/conditions/tides ───────────────────────────────────────
  app.get("/api/conditions/tides", async (req, res) => {
    try {
      const station = (req.query.station as string) || "8771450";
      const today = new Date();
      const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const date = (req.query.date as string) || defaultDate;

      const cacheKey = `tides-${station}-${date}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // Step 1: Fetch tide predictions
      const dateNodash = date.replace(/-/g, "");
      const tidesUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateNodash}&end_date=${dateNodash}&station=${station}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=flydentify&format=json`;
      let tidesResp: Response;
      try {
        tidesResp = await fetch(tidesUrl);
      } catch {
        return res.json({ error: "Tide data unavailable" });
      }
      let tidesJson: any;
      try { tidesJson = await tidesResp.json(); } catch { return res.json({ error: "Tide data unavailable" }); }

      const rawPredictions: any[] = tidesJson?.predictions ?? [];
      if (rawPredictions.length === 0) {
        return res.json({ error: "No tide predictions available for this station" });
      }

      // Step 2: Map predictions
      const predictions = rawPredictions.map((p: any) => ({
        time: p.t as string,
        height_ft: parseFloat(p.v),
        type: p.type as string,
        label: p.type === "H" ? "High" : "Low",
      }));

      // Step 3: Determine current tide stage
      const nowMs = Date.now();
      function parsePredTime(t: string): number {
        // Format: "2026-06-22 04:44"
        return new Date(t.replace(" ", "T")).getTime();
      }
      const NINETY_MIN = 90 * 60 * 1000;
      let current_stage = "Unknown";

      // Find surrounding predictions
      const times = predictions.map(p => parsePredTime(p.time));
      let prevIdx = -1;
      let nextIdx = -1;
      for (let i = 0; i < times.length; i++) {
        if (times[i] <= nowMs) prevIdx = i;
        else if (nextIdx === -1) nextIdx = i;
      }

      // Check proximity to H/L
      const nearPrev = prevIdx >= 0 && (nowMs - times[prevIdx]) <= NINETY_MIN;
      const nearNext = nextIdx >= 0 && (times[nextIdx] - nowMs) <= NINETY_MIN;
      if (nearPrev) {
        current_stage = predictions[prevIdx].type === "H" ? "High tide" : "Low tide";
      } else if (nearNext) {
        current_stage = predictions[nextIdx].type === "H" ? "High tide" : "Low tide";
      } else if (prevIdx >= 0 && nextIdx >= 0) {
        // Between two predictions
        current_stage = predictions[nextIdx].type === "H" ? "Incoming" : "Outgoing";
      } else if (prevIdx >= 0) {
        current_stage = predictions[prevIdx].type === "H" ? "Outgoing" : "Incoming";
      }

      // Step 4: Best fishing windows (1hr before → 1hr after each HIGH)
      const ONE_HR_MS = 60 * 60 * 1000;
      const best_windows: string[] = [];
      for (const p of predictions) {
        if (p.type === "H") {
          const highMs = parsePredTime(p.time);
          const startMs = highMs - ONE_HR_MS;
          const endMs = highMs + ONE_HR_MS;
          function fmtTime(ms: number): string {
            const d = new Date(ms);
            let h = d.getHours(), m = d.getMinutes();
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;
            return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
          }
          best_windows.push(`${fmtTime(startMs)} – ${fmtTime(endMs)}`);
        }
      }

      // Step 5: Advisory
      let advisory = "";
      if (current_stage === "Incoming") advisory = "Incoming tide — fish moving onto flats now.";
      else if (current_stage === "High tide") advisory = "High tide — prime feeding window on the flats.";
      else if (current_stage === "Outgoing") advisory = "Outgoing tide — fish pulling off flats, target channel edges.";
      else if (current_stage === "Low tide") advisory = "Low tide — fish holding deep, wait for the turn.";
      else advisory = "Check tide chart for best windows.";

      // Station name from NOAA metadata (may not always be present)
      const station_name = tidesJson?.metadata?.name ?? station;

      const result = {
        station,
        station_name,
        date,
        predictions,
        current_stage,
        best_windows,
        advisory,
      };
      cacheSet(cacheKey, result);
      res.json(result);
    } catch (err) {
      console.error("[conditions/tides] error:", err);
      res.json({ error: "Tide data unavailable" });
    }
  });

  // ── Route 3: GET /api/conditions/weather ─────────────────────────────────────
  app.get("/api/conditions/weather", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const mode = (req.query.mode as string) ?? "fresh";
      if (isNaN(lat) || isNaN(lon)) return res.json({ error: "Missing or invalid lat/lon" });

      const cacheKey = `weather2-${lat.toFixed(3)}-${lon.toFixed(3)}-${mode}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // ── Build Open-Meteo URL with all fishing-relevant parameters ──
      const hourlyParams = [
        "temperature_2m", "apparent_temperature", "relative_humidity_2m",
        "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
        "surface_pressure", "cloud_cover", "precipitation",
        "weather_code", "uv_index", "visibility",
      ].join(",");

      const marineParams = mode === "salt"
        ? "&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_period"
        : "";

      const dailyParams = [
        "temperature_2m_max", "temperature_2m_min",
        "sunrise", "sunset",
        "uv_index_max", "precipitation_sum",
        "wind_speed_10m_max", "wind_gusts_10m_max",
      ].join(",");

      const baseUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=${hourlyParams}` +
        `&daily=${dailyParams}` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
        `&timezone=auto&forecast_days=4`;

      // Marine model for SW (wave data)
      const marineUrl = mode === "salt"
        ? `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
          `&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_period` +
          `&timezone=auto&forecast_days=4`
        : null;

      const [meteoResp, marineResp] = await Promise.all([
        fetch(baseUrl).catch(() => null),
        marineUrl ? fetch(marineUrl).catch(() => null) : Promise.resolve(null),
      ]);

      if (!meteoResp) return res.json({ error: "Weather data unavailable" });
      const meteo: any = await meteoResp.json().catch(() => null);
      if (!meteo) return res.json({ error: "Weather data unavailable" });

      const marine: any = marineResp ? await marineResp.json().catch(() => null) : null;

      // ── Find current hour index ──
      const times: string[] = meteo?.hourly?.time ?? [];
      let idx = 0, minDiff = Infinity;
      for (let i = 0; i < times.length; i++) {
        const diff = Math.abs(new Date(times[i]).getTime() - Date.now());
        if (diff < minDiff) { minDiff = diff; idx = i; }
      }

      const h = meteo.hourly;
      const d = meteo.daily;

      // ── Current hour values ──
      const temp        = Math.round(h.temperature_2m?.[idx] ?? 0);
      const feelsLike   = Math.round(h.apparent_temperature?.[idx] ?? temp);
      const humidity    = Math.round(h.relative_humidity_2m?.[idx] ?? 0);
      const windSpeed   = Math.round(h.wind_speed_10m?.[idx] ?? 0);
      const windGust    = Math.round(h.wind_gusts_10m?.[idx] ?? 0);
      const windDeg     = h.wind_direction_10m?.[idx] ?? 0;
      const pressureHpa = h.surface_pressure?.[idx] ?? null;
      const cloudPct    = Math.round(h.cloud_cover?.[idx] ?? 0);
      const precipIn    = Math.round((h.precipitation?.[idx] ?? 0) * 100) / 100;
      const uvIndex     = Math.round(h.uv_index?.[idx] ?? 0);
      const wmoCode     = h.weather_code?.[idx] ?? 0;

      // Pressure trend (vs 3h ago)
      const prevIdx     = Math.max(0, idx - 3);
      const pressCurr   = pressureHpa;
      const pressPrev   = h.surface_pressure?.[prevIdx] ?? null;
      let pressure_trend = "Steady";
      if (pressCurr !== null && pressPrev !== null) {
        const delta = pressCurr - pressPrev;
        if (delta > 1.5) pressure_trend = "Rising";
        else if (delta < -1.5) pressure_trend = "Falling";
      }

      // inHg conversion
      const pressureInHg = pressureHpa !== null ? Math.round((pressureHpa * 0.02953) * 100) / 100 : null;

      // Wind direction cardinal
      const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
      const windDir = dirs[Math.round(windDeg / 22.5) % 16];

      // WMO weather description
      const wmoDesc: Record<number, string> = {
        0:"Clear sky", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast",
        45:"Foggy", 48:"Icy fog", 51:"Light drizzle", 53:"Drizzle", 55:"Heavy drizzle",
        61:"Light rain", 63:"Rain", 65:"Heavy rain", 71:"Light snow", 73:"Snow", 75:"Heavy snow",
        80:"Rain showers", 81:"Rain showers", 82:"Heavy showers",
        95:"Thunderstorm", 96:"Thunderstorm with hail", 99:"Thunderstorm with heavy hail",
      };
      const description = wmoDesc[wmoCode] ?? "Variable";

      // Pressure advisory
      const pressure_advisory =
        pressure_trend === "Falling"
          ? "Pressure falling — pre-front feeding window. Fish aggressively now."
          : pressure_trend === "Rising"
          ? "Pressure rising — post-front. Fish may be deeper for 12–24 hrs."
          : "Pressure steady — consistent feeding conditions expected.";

      // Cloud cover fishing note
      const cloudNote =
        cloudPct < 25 ? "Bright sun — fish may seek shade or depth."
        : cloudPct < 60 ? "Partly cloudy — good hatch conditions."
        : "Overcast — fish feel secure, surface feeding likely.";

      // Wind fishing note
      const windNote =
        windSpeed < 5 ? "Calm — perfect presentation conditions."
        : windSpeed < 15 ? "Light breeze — manageable, watch for drag."
        : windSpeed < 25 ? "Moderate wind — nymphing or streamers preferred."
        : "Strong wind — tough casting conditions.";

      // UV note
      const uvNote =
        uvIndex <= 2 ? "Low UV — midday hatch possible."
        : uvIndex <= 5 ? "Moderate UV — look for shaded seams."
        : "High UV — early morning or evening best.";

      // Daily forecast (next 4 days)
      const forecast = (d?.time ?? []).slice(0, 4).map((date: string, i: number) => ({
        date,
        temp_high: Math.round(d.temperature_2m_max?.[i] ?? 0),
        temp_low:  Math.round(d.temperature_2m_min?.[i] ?? 0),
        wind_max:  Math.round(d.wind_speed_10m_max?.[i] ?? 0),
        gust_max:  Math.round(d.wind_gusts_10m_max?.[i] ?? 0),
        precip:    Math.round((d.precipitation_sum?.[i] ?? 0) * 100) / 100,
        sunrise:   d.sunrise?.[i]?.slice(11, 16) ?? "",
        sunset:    d.sunset?.[i]?.slice(11, 16) ?? "",
        uv_max:    Math.round(d.uv_index_max?.[i] ?? 0),
      }));

      // Marine data (SW only)
      let wave_height_ft = null, wave_period_s = null, swell_height_ft = null, wave_dir = "";
      if (marine?.hourly) {
        const mh = marine.hourly;
        const mTimes: string[] = mh.time ?? [];
        let mIdx = 0, mMin = Infinity;
        for (let i = 0; i < mTimes.length; i++) {
          const diff = Math.abs(new Date(mTimes[i]).getTime() - Date.now());
          if (diff < mMin) { mMin = diff; mIdx = i; }
        }
        wave_height_ft = mh.wave_height?.[mIdx] != null ? Math.round(mh.wave_height[mIdx] * 3.281 * 10) / 10 : null;
        wave_period_s  = mh.wave_period?.[mIdx] != null ? Math.round(mh.wave_period[mIdx]) : null;
        swell_height_ft= mh.swell_wave_height?.[mIdx] != null ? Math.round(mh.swell_wave_height[mIdx] * 3.281 * 10) / 10 : null;
        const wDir     = mh.wave_direction?.[mIdx];
        wave_dir       = wDir != null ? dirs[Math.round(wDir / 22.5) % 16] : "";
      }

      const result = {
        // Current conditions
        temp, feelsLike, humidity,
        windSpeed, windGust, windDir,
        pressure_hpa: pressureHpa ? Math.round(pressureHpa) : null,
        pressure_inHg: pressureInHg,
        pressure_trend,
        pressure_advisory,
        cloudPct, precipIn, uvIndex,
        description,
        // Fishing notes
        cloudNote, windNote, uvNote,
        // Forecast
        forecast,
        // Marine (SW)
        wave_height_ft, wave_period_s, swell_height_ft, wave_dir,
        // Meta
        updated_at: times[idx] ?? new Date().toISOString().slice(0, 16),
      };

      cacheSet(cacheKey, result, 1800); // 30-min cache
      res.json(result);
    } catch (err) {
      console.error("[conditions/weather] error:", err);
      res.json({ error: "Weather data unavailable" });
    }
  });

  // ── Route 4: GET /api/conditions/advisory ────────────────────────────────────
  app.get("/api/conditions/advisory", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const mode = (req.query.mode as string) || "fresh";
      const tideStation = (req.query.tideStation as string) || "8771450";

      if (isNaN(lat) || isNaN(lon)) {
        return res.json({ error: "Missing or invalid lat/lon" });
      }

      const baseUrl = `http://localhost:${process.env.PORT ?? 5000}`;

      // Fetch all needed data in parallel
      const [riverResult, tidesResult, weatherResult] = await Promise.all([
        mode === "fresh"
          ? fetch(`${baseUrl}/api/conditions/river?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => null)
          : Promise.resolve(null),
        mode === "salt"
          ? fetch(`${baseUrl}/api/conditions/tides?station=${tideStation}`).then(r => r.json()).catch(() => null)
          : Promise.resolve(null),
        fetch(`${baseUrl}/api/conditions/weather?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => ({ error: "Weather unavailable" })),
      ]);

      // Step 4: Build score 0–3
      let score = 0;

      // +1 if pressure is Steady or Falling
      if (weatherResult && !weatherResult.error) {
        const trend = weatherResult.pressure_trend;
        if (trend === "Steady" || trend === "Falling") score += 1;
      }

      // +1 for water temp (fresh) or tide stage (salt)
      if (mode === "fresh" && riverResult && !riverResult.error) {
        if (riverResult.temp_advisory === "Prime — surface activity likely") score += 1;
      } else if (mode === "salt" && tidesResult && !tidesResult.error) {
        const stage = tidesResult.current_stage;
        if (stage === "Incoming" || stage === "High tide") score += 1;
      }

      // +1 for flow (fresh) or any tide data (salt)
      if (mode === "fresh" && riverResult && !riverResult.error) {
        if (riverResult.wadeability === "Fishable" || riverResult.wadeability === "Wadeable with care") score += 1;
      } else if (mode === "salt" && tidesResult && !tidesResult.error) {
        score += 1;
      }

      // Step 5: Map score to rating
      const ratingMap: Record<number, string> = {
        3: "Prime conditions",
        2: "Good — worth going",
        1: "Fair — manageable",
        0: "Tough conditions",
      };
      const rating = ratingMap[score] ?? "Fair — manageable";

      // Step 6: Generate plain-English advisory
      const parts: string[] = [];
      if (mode === "fresh" && riverResult && !riverResult.error) {
        if (riverResult.flow_cfs !== null) parts.push(`River is at ${riverResult.flow_cfs} cfs — ${riverResult.wadeability.toLowerCase()}.`);
        if (riverResult.water_temp_f !== null) parts.push(`Water at ${riverResult.water_temp_f}°F puts fish in a ${riverResult.temp_advisory?.toLowerCase() ?? "unknown"} window.`);
      }
      if (mode === "salt" && tidesResult && !tidesResult.error) {
        parts.push(tidesResult.advisory);
      }
      if (weatherResult && !weatherResult.error) {
        parts.push(weatherResult.pressure_advisory);
      }
      if (score === 3) parts.push("This is a go.");
      else if (score === 0) parts.push("Consider waiting for better conditions.");

      const advisory = parts.join(" ");

      const result = {
        rating,
        rating_score: score,
        advisory,
        river: mode === "fresh" ? (riverResult ?? null) : null,
        tides: mode === "salt" ? (tidesResult ?? null) : null,
        weather: weatherResult,
      };
      res.json(result);
    } catch (err) {
      console.error("[conditions/advisory] error:", err);
      res.json({ error: "Advisory unavailable" });
    }
  });



  // ── Waitlist signup (replaces newsletter subscribe) ─────────────────────────
  app.post("/api/waitlist/join", async (req, res) => {
    try {
      const { email, name, waterMode } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      const subscriber = await storage.upsertSubscriber({
        email: email.toLowerCase().trim(),
        name: name ?? null,
        waterMode: waterMode ?? "fw",
        newsletterOptIn: true,
      });
      return res.json({ ok: true, subscriber });
    } catch (err) {
      console.error("[waitlist] error:", err);
      return res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  // ── Analytics tracking (fire-and-forget, no auth required) ─────────────────
  app.post("/api/track", (req, res) => {
    try {
      const { event, properties, session_id, water_mode, page } = req.body;
      if (!event || typeof event !== "string") {
        return res.json({ ok: true }); // silent ignore — never fail
      }
      const userId = req.isAuthenticated() ? req.user!.id : null;
      if (process.env.NODE_ENV !== "production") {
        console.log(`[track] ${event}`, { session_id, userId, properties, water_mode, page });
      }
      logEvent({
        eventName: event,
        sessionId: session_id ?? null,
        userId,
        properties: properties && typeof properties === "object" ? properties as Record<string, unknown> : null,
        waterMode: water_mode ?? null,
        page: page ?? null,
      });
    } catch (err) {
      // Never surface errors to the client
      console.error("[track] error:", err);
    }
    res.json({ ok: true });
  });

  // ── AI Fishing Forecast routes ──────────────────────────────────────────────
  registerForecastRoutes(app, cacheGet, cacheSet);

  // ── Monetization routes (guides, shops, conservation, ads, merch) ──────────
  registerMonetizationRoutes(app);

  // ── Stream intelligence routes ────────────────────────────────────────────
  registerStreamRoutes(app, cacheGet, cacheSet);

  // ══ CATCH REPORTS ══════════════════════════════════════════════════════════

  // Seed stocking data on startup
  await storage.seedStockingData();

  // GET /api/catch-reports/recent — most recent reports across all states
  app.get("/api/catch-reports/recent", async (_req, res) => {
    try {
      const limit = parseInt((_req.query.limit as string) || "20");
      const reports = await storage.getRecentCatchReports(limit);
      res.json(reports);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // GET /api/catch-reports?state=MT&river=Madison River
  app.get("/api/catch-reports", async (req, res) => {
    try {
      const state = (req.query.state as string) || "";
      const river = (req.query.river as string) || "";
      const limit = parseInt((req.query.limit as string) || "30");
      if (!state) {
        const reports = await storage.getRecentCatchReports(limit);
        return res.json(reports);
      }
      const reports = river
        ? await storage.getCatchReportsByRiver(state, river, limit)
        : await storage.getCatchReportsByState(state, limit);
      res.json(reports);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // POST /api/catch-reports — submit a new catch report
  app.post("/api/catch-reports", async (req, res) => {
    try {
      const body = req.body;
      if (!body.state || !body.river || !body.species || !body.fly) {
        return res.status(400).json({ error: "Missing required fields: state, river, species, fly" });
      }
      const report = await storage.createCatchReport({
        userId: body.userId ?? null,
        displayName: body.displayName || "Anonymous Angler",
        waterMode: body.waterMode || "fresh",
        state: body.state,
        river: body.river,
        lat: body.lat ?? null,
        lon: body.lon ?? null,
        species: body.species,
        fly: body.fly,
        method: body.method || "dry",
        catchCount: body.catchCount ?? 1,
        waterTemp: body.waterTemp ?? null,
        conditions: body.conditions || "good",
        hatch: body.hatch ?? null,
        notes: body.notes ?? null,
        photoUrl: body.photoUrl ?? null,
      });
      res.json(report);
    } catch (e) {
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  // ══ WAYPOINTS ════════════════════════════════════════════════════════════════════════

  // GET /api/waypoints?userId=&tripKitId=
  app.get("/api/waypoints", async (req, res) => {
    try {
      const userId = req.query.userId != null ? Number(req.query.userId) : undefined;
      const tripKitId = (req.query.tripKitId as string) || undefined;
      const points = await storage.getWaypoints(
        userId !== undefined && !isNaN(userId) ? userId : undefined,
        tripKitId
      );
      res.json(points);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch waypoints" });
    }
  });

  // POST /api/waypoints
  app.post("/api/waypoints", async (req, res) => {
    try {
      const body = req.body ?? {};
      if (!body.name || body.lat == null || body.lon == null) {
        return res.status(400).json({ error: "Missing required fields: name, lat, lon" });
      }

      // Auto-fetch elevation from Open-Elevation API if not provided
      if (!body.elevation && body.lat && body.lon) {
        try {
          const elevRes = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${body.lat},${body.lon}`);
          const elevData = await elevRes.json();
          body.elevation = elevData.results?.[0]?.elevation;
        } catch {}
      }

      const waypoint = await storage.createWaypoint({
        userId: body.userId ?? null,
        tripKitId: body.tripKitId ?? null,
        name: body.name,
        lat: Number(body.lat),
        lon: Number(body.lon),
        elevation: body.elevation ?? null,
        waterMode: body.waterMode || "fresh",
        state: body.state ?? null,
        river: body.river ?? null,
        featureType: body.featureType ?? null,
        cfs: body.cfs ?? null,
        waterTemp: body.waterTemp ?? null,
        notes: body.notes ?? null,
        photoUrl: body.photoUrl ?? null,
      });
      res.status(201).json(waypoint);
    } catch (e) {
      console.error("Waypoint create error:", e);
      res.status(500).json({ error: "Failed to create waypoint" });
    }
  });

  // DELETE /api/waypoints/:id
  app.delete("/api/waypoints/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
      await storage.deleteWaypoint(id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: "Failed to delete waypoint" });
    }
  });

  // ══ REPUTATION & UPVOTES ═══════════════════════════════════════════════════════════

  // POST /api/reports/:type/:id/upvote  — body: { userId }
  app.post("/api/reports/:type/:id/upvote", async (req, res) => {
    try {
      const { type, id } = req.params;
      const reportId = Number(id);
      const userId = Number(req.body?.userId);
      if (type !== "hatch" && type !== "catch") {
        return res.status(400).json({ error: "type must be 'hatch' or 'catch'" });
      }
      if (isNaN(reportId) || isNaN(userId)) {
        return res.status(400).json({ error: "Valid id and userId are required" });
      }
      await storage.upvoteReport(userId, type, reportId);
      res.status(204).send();
    } catch (e) {
      console.error("Upvote error:", e);
      res.status(500).json({ error: "Failed to upvote report" });
    }
  });

  // GET /api/reputation/:userId
  app.get("/api/reputation/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });
      const rep = await storage.getReputation(userId);
      if (!rep) return res.status(404).json({ error: "No reputation record found" });
      res.json(rep);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch reputation" });
    }
  });

  // ══ STOCKING DATA ═══════════════════════════════════════════════════════════

  // GET /api/stocking?state=MT&river=Madison River&days=60
  app.get("/api/stocking", async (req, res) => {
    try {
      const state = (req.query.state as string) || "";
      const river = (req.query.river as string) || "";
      const days = parseInt((req.query.days as string) || "60");
      if (!state) return res.status(400).json({ error: "state param required" });
      const events = river
        ? await storage.getStockingByRiver(state, river, days)
        : await storage.getStockingByState(state, days);
      res.json(events);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch stocking data" });
    }
  });


  // ── Trial enforcement: expire stale trials on startup ─────────────────────
  storage.expireStaleTrials().then(n => {
    if (n > 0) console.log(`[trial] Expired ${n} stale trial(s) on startup`);
  }).catch(() => {});

  // ── Trial re-engagement nudge endpoint ──────────────────────────────────────
  // Called by external cron or admin; returns which users need which nudge.
  // Stripe email integration plugs in here once connected.
  app.get("/api/admin/trial-nudges", async (req, res) => {
    // Minimal admin guard — replace with a real secret check pre-launch
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== (process.env.ADMIN_SECRET || "flydentify-admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      const now = Math.floor(Date.now() / 1000);
      const DAY = 86400;
      // Fetch all trialing + expired users
      const allUsers = await storage.getAllUsers();
      const nudges = allUsers
        .filter(u => u.trialStartedAt != null)
        .map(u => {
          const daysSinceStart = Math.floor((now - u.trialStartedAt!) / DAY);
          const daysLeft = u.trialEndsAt ? Math.ceil((u.trialEndsAt - now) / DAY) : 0;
          let nudge: string | null = null;
          if (u.subscriptionStatus === 'trialing') {
            if (daysSinceStart === 3)  nudge = 'day3_4days_left';
            if (daysSinceStart === 6)  nudge = 'day6_last_day';
          }
          if (u.subscriptionStatus === 'expired') {
            if (daysSinceStart === 8)  nudge = 'day8_extend_offer';   // 7 extra days
            if (daysSinceStart === 14) nudge = 'day14_final_discount'; // 20% off annual
          }
          return nudge ? { userId: u.id, email: u.email, nudge, daysLeft, daysSinceStart } : null;
        })
        .filter(Boolean);
      res.json({ count: nudges.length, nudges });
    } catch (err) {
      res.status(500).json({ error: 'Failed to compute nudges' });
    }
  });

  // ── Admin: extend trial for a user (re-engagement offer) ───────────────────
  app.post("/api/admin/trial-extend", async (req, res) => {
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== (process.env.ADMIN_SECRET || "flydentify-admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { userId, extraDays = 7 } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    try {
      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const newTrialEndsAt = Math.floor(Date.now() / 1000) + (extraDays * 86400);
      await storage.updateUser(userId, {
        subscriptionStatus: 'trialing',
        trialEndsAt: newTrialEndsAt,
      });
      res.json({ ok: true, userId, newTrialEndsAt, extraDays });
    } catch (err) {
      res.status(500).json({ error: 'Failed to extend trial' });
    }
  });

  return httpServer;
}
