import { fishingReports, users, subscribers, hatchReports, tripPlans, tripKits, catchReports, stockingEvents, waypoints, reportUpvotes, contributorReputation } from '@shared/schema';
import type {
  FishingReport, InsertFishingReport,
  User, InsertUser,
  Subscriber, InsertSubscriber,
  HatchReport, InsertHatchReport,
  TripPlan, InsertTripPlan,
  TripKitRow, InsertTripKit,
  CatchReport, InsertCatchReport,
  StockingEvent, InsertStockingEvent,
  Waypoint, InsertWaypoint,
  ContributorReputation,
} from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS fishing_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    region TEXT NOT NULL,
    date TEXT NOT NULL,
    conditions TEXT NOT NULL,
    hatch_observed TEXT NOT NULL,
    fly_recommendations TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    home_region TEXT,
    newsletter_opt_in INTEGER NOT NULL DEFAULT 1,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'free',
    subscription_current_period_end INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    region TEXT,
    source TEXT NOT NULL DEFAULT 'app',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hatch_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    state TEXT NOT NULL,
    river TEXT NOT NULL,
    insect TEXT NOT NULL,
    intensity TEXT NOT NULL,
    water_temp REAL,
    conditions TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS catch_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    display_name TEXT NOT NULL DEFAULT 'Anonymous Angler',
    water_mode TEXT NOT NULL DEFAULT 'fresh',
    state TEXT NOT NULL,
    river TEXT NOT NULL,
    lat REAL,
    lon REAL,
    species TEXT NOT NULL,
    fly TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'dry',
    catch_count INTEGER NOT NULL DEFAULT 1,
    water_temp REAL,
    conditions TEXT NOT NULL DEFAULT 'good',
    hatch TEXT,
    notes TEXT,
    photo_url TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stocking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state TEXT NOT NULL,
    river TEXT NOT NULL,
    water_body TEXT,
    county TEXT,
    lat REAL,
    lon REAL,
    species TEXT NOT NULL,
    size_inches REAL,
    count_stocked INTEGER,
    stock_date TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'state_dnr',
    source_url TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trip_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    destination TEXT NOT NULL,
    state TEXT NOT NULL,
    target_date TEXT NOT NULL,
    target_species TEXT,
    notes TEXT,
    alert_enabled INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    trip_kit_id TEXT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    elevation REAL,
    water_mode TEXT NOT NULL DEFAULT 'fresh',
    state TEXT,
    river TEXT,
    feature_type TEXT,
    cfs REAL,
    water_temp REAL,
    notes TEXT,
    photo_url TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS report_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    report_type TEXT NOT NULL,
    report_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contributor_reputation (
    user_id INTEGER PRIMARY KEY,
    total_reports INTEGER NOT NULL DEFAULT 0,
    upvotes_received INTEGER NOT NULL DEFAULT 0,
    verified_reports INTEGER NOT NULL DEFAULT 0,
    rep_score REAL NOT NULL DEFAULT 1.0,
    updated_at INTEGER NOT NULL
  );
`);

// Create analytics_events table if it doesn't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    session_id TEXT,
    user_id INTEGER,
    properties TEXT,
    water_mode TEXT,
    page TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrate: add new columns if they don't exist (unified observation model + reputation)
const migrate = (sql: string) => { try { sqlite.exec(sql); } catch {} };
migrate("ALTER TABLE hatch_reports ADD COLUMN lat REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN lon REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN elevation REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN cfs REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN air_temp REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN wind_speed REAL");
migrate("ALTER TABLE hatch_reports ADD COLUMN wind_dir TEXT");
migrate("ALTER TABLE hatch_reports ADD COLUMN confidence INTEGER");
migrate("ALTER TABLE hatch_reports ADD COLUMN stage TEXT");
migrate("ALTER TABLE hatch_reports ADD COLUMN water_clarity TEXT");
migrate("ALTER TABLE hatch_reports ADD COLUMN photo_url TEXT");
migrate("ALTER TABLE hatch_reports ADD COLUMN upvotes INTEGER DEFAULT 0");
migrate("ALTER TABLE catch_reports ADD COLUMN elevation REAL");
migrate("ALTER TABLE catch_reports ADD COLUMN cfs REAL");
migrate("ALTER TABLE catch_reports ADD COLUMN air_temp REAL");
migrate("ALTER TABLE catch_reports ADD COLUMN wind_speed REAL");
migrate("ALTER TABLE catch_reports ADD COLUMN wind_dir TEXT");
migrate("ALTER TABLE catch_reports ADD COLUMN confidence INTEGER DEFAULT 75");
migrate("ALTER TABLE catch_reports ADD COLUMN water_clarity TEXT");
migrate("ALTER TABLE catch_reports ADD COLUMN upvotes INTEGER DEFAULT 0");
migrate("ALTER TABLE catch_reports ADD COLUMN rep_score REAL DEFAULT 1.0");

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'subscriptionStatus'> & { passwordHash: string }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Subscribers
  upsertSubscriber(data: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;

  // Fishing reports
  getFishingReports(): Promise<FishingReport[]>;
  getFishingReport(id: number): Promise<FishingReport | undefined>;
  createFishingReport(report: InsertFishingReport): Promise<FishingReport>;
  deleteFishingReport(id: number): Promise<void>;

  // Hatch reports
  createHatchReport(data: InsertHatchReport): Promise<HatchReport>;
  getHatchReportsByState(state: string, limit: number): Promise<HatchReport[]>;
  getRecentHatchReports(limit: number): Promise<HatchReport[]>;

  // Trip plans
  createTripPlan(data: InsertTripPlan): Promise<TripPlan>;
  getTripPlansByUser(userId: number): Promise<TripPlan[]>;
  deleteTripPlan(id: number, userId: number): Promise<void>;

  // Trip kits
  getTripKits(userId: number | null): Promise<TripKitRow[]>;
  getTripKit(id: string, userId: number | null): Promise<TripKitRow | undefined>;
  upsertTripKit(data: InsertTripKit): Promise<TripKitRow>;
  deleteTripKit(id: string, userId: number | null): Promise<void>;
  addFlyToKit(id: string, userId: number | null, fly: object): Promise<TripKitRow | undefined>;
  removeFlyFromKit(id: string, userId: number | null, flyId: string): Promise<TripKitRow | undefined>;
  updateKitNotes(id: string, userId: number | null, notes: string): Promise<TripKitRow | undefined>;
  // Catch Reports
  createCatchReport(data: InsertCatchReport): Promise<CatchReport>;
  getCatchReportsByState(state: string, limit?: number): Promise<CatchReport[]>;
  getCatchReportsByRiver(state: string, river: string, limit?: number): Promise<CatchReport[]>;
  getRecentCatchReports(limit?: number): Promise<CatchReport[]>;
  // Stocking Events
  createStockingEvent(data: InsertStockingEvent): Promise<StockingEvent>;
  getStockingByState(state: string, days?: number): Promise<StockingEvent[]>;
  getStockingByRiver(state: string, river: string, days?: number): Promise<StockingEvent[]>;
  seedStockingData(): Promise<void>;
  // Waypoints
  getWaypoints(userId?: number, tripKitId?: string): Promise<Waypoint[]>;
  createWaypoint(data: InsertWaypoint): Promise<Waypoint>;
  deleteWaypoint(id: number): Promise<void>;
  // Reputation
  getReputation(userId: number): Promise<ContributorReputation | undefined>;
  upsertReputation(userId: number, delta: { reports?: number; upvotes?: number }): Promise<void>;
  upvoteReport(userId: number, reportType: string, reportId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ── Users ──────────────────────────────────────────────────────────────────
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).all();
  }

  async getUserById(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  }

  async createUser(data: { email: string; passwordHash: string; homeRegion?: string | null; newsletterOptIn?: number }): Promise<User> {
    const now = Math.floor(Date.now() / 1000);
    const trialStartedAt = now;
    const trialEndsAt = now + 7 * 24 * 60 * 60; // 7 days
    return db.insert(users).values({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      homeRegion: data.homeRegion ?? null,
      newsletterOptIn: data.newsletterOptIn ?? 1,
      subscriptionStatus: 'trialing',
      trialStartedAt,
      trialEndsAt,
      createdAt: now,
    }).returning().get();
  }

  // Expire any trials that have passed their end date and aren't yet active/canceled
  async expireStaleTrials(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    const result = db.update(users)
      .set({ subscriptionStatus: 'expired' })
      .where(
        // Only flip users who are still "trialing" and whose trialEndsAt has passed
        // Using raw SQL since drizzle sqlite doesn't have and() helper in all versions
        sql`subscription_status = 'trialing' AND trial_ends_at IS NOT NULL AND trial_ends_at < ${now}`
      )
      .run();
    return result.changes;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }

  // ── Subscribers ────────────────────────────────────────────────────────────
  async upsertSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const now = Math.floor(Date.now() / 1000);
    // Try insert; if duplicate email, update region/source
    const existing = db.select().from(subscribers).where(eq(subscribers.email, data.email.toLowerCase())).get();
    if (existing) {
      return db.update(subscribers)
        .set({ region: data.region ?? existing.region, source: data.source ?? existing.source })
        .where(eq(subscribers.email, data.email.toLowerCase()))
        .returning().get();
    }
    return db.insert(subscribers).values({
      email: data.email.toLowerCase(),
      region: data.region ?? null,
      source: data.source ?? 'app',
      createdAt: now,
    }).returning().get();
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).all();
  }

  // ── Fishing reports ────────────────────────────────────────────────────────
  async getFishingReports(): Promise<FishingReport[]> {
    return db.select().from(fishingReports).orderBy(desc(fishingReports.id)).all();
  }

  async getFishingReport(id: number): Promise<FishingReport | undefined> {
    return db.select().from(fishingReports).where(eq(fishingReports.id, id)).get();
  }

  async createFishingReport(report: InsertFishingReport): Promise<FishingReport> {
    return db.insert(fishingReports).values(report).returning().get();
  }

  async deleteFishingReport(id: number): Promise<void> {
    db.delete(fishingReports).where(eq(fishingReports.id, id)).run();
  }

  // ── Hatch reports ─────────────────────────────────────────────────────
  async createHatchReport(data: InsertHatchReport): Promise<HatchReport> {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(hatchReports).values({
      ...data,
      createdAt: now,
    }).returning().get();
  }

  async getHatchReportsByState(state: string, limit: number): Promise<HatchReport[]> {
    return db.select().from(hatchReports)
      .where(eq(hatchReports.state, state.toUpperCase()))
      .orderBy(desc(hatchReports.createdAt))
      .limit(limit)
      .all();
  }

  async getRecentHatchReports(limit: number): Promise<HatchReport[]> {
    return db.select().from(hatchReports)
      .orderBy(desc(hatchReports.createdAt))
      .limit(limit)
      .all();
  }

  // ── Trip plans ──────────────────────────────────────────────────────────
  async createTripPlan(data: InsertTripPlan): Promise<TripPlan> {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(tripPlans).values({
      ...data,
      createdAt: now,
    }).returning().get();
  }

  async getTripPlansByUser(userId: number): Promise<TripPlan[]> {
    return db.select().from(tripPlans)
      .where(eq(tripPlans.userId, userId))
      .orderBy(desc(tripPlans.createdAt))
      .all();
  }

  async deleteTripPlan(id: number, userId: number): Promise<void> {
    db.delete(tripPlans)
      .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)))
      .run();
  }

  // ── Trip kits ───────────────────────────────────────────────────────────────
  // userId null = guest (not logged in) — kits belong to no user, still stored.
  // userId set = kits tied to that user account.

  async getTripKits(userId: number | null): Promise<TripKitRow[]> {
    if (userId !== null) {
      return db.select().from(tripKits)
        .where(eq(tripKits.userId, userId))
        .orderBy(desc(tripKits.createdAt))
        .all();
    }
    // Guest: return nothing (kits require session to persist)
    return [];
  }

  async getTripKit(id: string, userId: number | null): Promise<TripKitRow | undefined> {
    return db.select().from(tripKits).where(eq(tripKits.id, id)).get();
  }

  async upsertTripKit(data: InsertTripKit): Promise<TripKitRow> {
    const now = Math.floor(Date.now() / 1000);
    // Try update first
    const existing = db.select().from(tripKits).where(eq(tripKits.id, data.id)).get();
    if (existing) {
      db.update(tripKits)
        .set({ ...data })
        .where(eq(tripKits.id, data.id))
        .run();
      return db.select().from(tripKits).where(eq(tripKits.id, data.id)).get()!;
    }
    return db.insert(tripKits).values({ ...data, createdAt: now }).returning().get();
  }

  async deleteTripKit(id: string, userId: number | null): Promise<void> {
    db.delete(tripKits).where(eq(tripKits.id, id)).run();
  }

  async addFlyToKit(id: string, userId: number | null, fly: object): Promise<TripKitRow | undefined> {
    const kit = db.select().from(tripKits).where(eq(tripKits.id, id)).get();
    if (!kit) return undefined;
    const flies = JSON.parse(kit.flies ?? "[]") as any[];
    const flyAny = fly as any;
    if (!flies.find((f: any) => f.flyId === flyAny.flyId)) {
      flies.push(fly);
    }
    const knotIds = JSON.parse(kit.knotIds ?? "[]") as string[];
    (flyAny.knotIds ?? []).forEach((kid: string) => {
      if (!knotIds.includes(kid)) knotIds.push(kid);
    });
    db.update(tripKits)
      .set({ flies: JSON.stringify(flies), knotIds: JSON.stringify(knotIds) })
      .where(eq(tripKits.id, id))
      .run();
    return db.select().from(tripKits).where(eq(tripKits.id, id)).get();
  }

  async removeFlyFromKit(id: string, userId: number | null, flyId: string): Promise<TripKitRow | undefined> {
    const kit = db.select().from(tripKits).where(eq(tripKits.id, id)).get();
    if (!kit) return undefined;
    const flies = (JSON.parse(kit.flies ?? "[]") as any[]).filter((f: any) => f.flyId !== flyId);
    db.update(tripKits)
      .set({ flies: JSON.stringify(flies) })
      .where(eq(tripKits.id, id))
      .run();
    return db.select().from(tripKits).where(eq(tripKits.id, id)).get();
  }

  async updateKitNotes(id: string, userId: number | null, notes: string): Promise<TripKitRow | undefined> {
    db.update(tripKits).set({ notes }).where(eq(tripKits.id, id)).run();
    return db.select().from(tripKits).where(eq(tripKits.id, id)).get();
  }

  // ── Catch Reports ─────────────────────────────────────────────────────────
  async createCatchReport(data: InsertCatchReport): Promise<CatchReport> {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(catchReports).values({ ...data, createdAt: now }).returning().get();
  }

  async getCatchReportsByState(state: string, limit: number = 50): Promise<CatchReport[]> {
    return db.select().from(catchReports)
      .where(eq(catchReports.state, state))
      .orderBy(desc(catchReports.createdAt))
      .limit(limit)
      .all();
  }

  async getCatchReportsByRiver(state: string, river: string, limit: number = 30): Promise<CatchReport[]> {
    return db.select().from(catchReports)
      .where(and(eq(catchReports.state, state), eq(catchReports.river, river)))
      .orderBy(desc(catchReports.createdAt))
      .limit(limit)
      .all();
  }

  async getRecentCatchReports(limit: number = 20): Promise<CatchReport[]> {
    return db.select().from(catchReports)
      .orderBy(desc(catchReports.createdAt))
      .limit(limit)
      .all();
  }

  // ── Stocking Events ───────────────────────────────────────────────────────
  async createStockingEvent(data: InsertStockingEvent): Promise<StockingEvent> {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(stockingEvents).values({ ...data, createdAt: now }).returning().get();
  }

  async getStockingByState(state: string, days: number = 60): Promise<StockingEvent[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return db.select().from(stockingEvents)
      .where(and(eq(stockingEvents.state, state)))
      .orderBy(desc(stockingEvents.stockDate))
      .all()
      .filter((e: StockingEvent) => e.stockDate >= cutoffStr);
  }

  async getStockingByRiver(state: string, river: string, days: number = 60): Promise<StockingEvent[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return db.select().from(stockingEvents)
      .where(and(eq(stockingEvents.state, state), eq(stockingEvents.river, river)))
      .orderBy(desc(stockingEvents.stockDate))
      .all()
      .filter((e: StockingEvent) => e.stockDate >= cutoffStr);
  }

  async seedStockingData(): Promise<void> {
    // Clear and re-seed to ensure full 50-state dataset is always current
    db.delete(stockingEvents).run();

    const now = Math.floor(Date.now() / 1000);
    const today = new Date();
    const d = (offset: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offset);
      return dt.toISOString().split('T')[0];
    };

    const seed = [
  { state:"AL", river:"Sipsey Fork", county:"Winston", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.outdooralabama.com/fishing/trout-stocking-schedule", notes:"Smith Lake tailwater" },
  { state:"AL", river:"Tallapoosa River", county:"Tallapoosa", species:"Rainbow Trout", sizeInches:9, countStocked:600, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://www.outdooralabama.com/fishing/trout-stocking-schedule", notes:"R.L. Harris tailwater" },
  { state:"AL", river:"Little River", county:"DeKalb", species:"Brown Trout", sizeInches:11, countStocked:400, stockDate:"2026-06-24", source:"state_dnr", sourceUrl:"https://www.outdooralabama.com/fishing/trout-stocking-schedule", notes:"DeSoto State Park section" },
  { state:"AK", river:"Kenai River", county:"Kenai", species:"Chinook Salmon", sizeInches:undefined, countStocked:undefined, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://www.adfg.alaska.gov/index.cfm?adfg=fishstocking.main", notes:"Wild system — ADF&G monitoring report" },
  { state:"AK", river:"Russian River", county:"Kenai", species:"Sockeye Salmon", sizeInches:undefined, countStocked:undefined, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://www.adfg.alaska.gov/index.cfm?adfg=fishstocking.main", notes:"Russian River ferry crossing" },
  { state:"AK", river:"Anchor River", county:"Kenai", species:"Steelhead", sizeInches:15, countStocked:200, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.adfg.alaska.gov/index.cfm?adfg=fishstocking.main", notes:"Homer area" },
  { state:"AZ", river:"Oak Creek", county:"Yavapai", species:"Rainbow Trout", sizeInches:10, countStocked:700, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://azgfd.gov/fishing/stocking/", notes:"Sedona area, Slide Rock section" },
  { state:"AZ", river:"Black River", county:"Apache", species:"Brown Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://azgfd.gov/fishing/stocking/", notes:"White Mountain Apache Tribe waters" },
  { state:"AZ", river:"Tonto Creek", county:"Gila", species:"Rainbow Trout", sizeInches:8, countStocked:600, stockDate:"2026-06-27", source:"state_dnr", sourceUrl:"https://azgfd.gov/fishing/stocking/", notes:"Payson area" },
  { state:"AR", river:"White River", county:"Baxter", species:"Rainbow Trout", sizeInches:12, countStocked:1200, stockDate:"2026-07-10", source:"state_dnr", sourceUrl:"https://www.agfc.com/en/fishing/trout/", notes:"Bull Shoals tailwater" },
  { state:"AR", river:"Norfork River", county:"Baxter", species:"Brown Trout", sizeInches:14, countStocked:600, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www.agfc.com/en/fishing/trout/", notes:"Norfork tailwater" },
  { state:"AR", river:"Little Red River", county:"Cleburne", species:"Rainbow Trout", sizeInches:11, countStocked:900, stockDate:"2026-06-29", source:"state_dnr", sourceUrl:"https://www.agfc.com/en/fishing/trout/", notes:"Greers Ferry tailwater" },
  { state:"CA", river:"McCloud River", county:"Siskiyou", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://wildlife.ca.gov/Fishing/Inland/Stocking", notes:"Upper section — wild fish supplemental" },
  { state:"CA", river:"Owens River", county:"Mono", species:"Brown Trout", sizeInches:12, countStocked:600, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://wildlife.ca.gov/Fishing/Inland/Stocking", notes:"Long Valley area" },
  { state:"CA", river:"Sacramento River", county:"Shasta", species:"Rainbow Trout", sizeInches:9, countStocked:1000, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://wildlife.ca.gov/Fishing/Inland/Stocking", notes:"Upper Sacramento, Dunsmuir" },
  { state:"CA", river:"Hat Creek", county:"Shasta", species:"Rainbow Trout", sizeInches:11, countStocked:500, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://wildlife.ca.gov/Fishing/Inland/Stocking", notes:"Wild Trout Project section" },
  { state:"CO", river:"South Platte River", county:"Park", species:"Rainbow Trout", sizeInches:11, countStocked:800, stockDate:"2026-07-10", source:"state_dnr", sourceUrl:"https://cpw.state.co.us/thingstodo/Pages/Stocking.aspx", notes:"Elevenmile Canyon" },
  { state:"CO", river:"Arkansas River", county:"Chaffee", species:"Brown Trout", sizeInches:10, countStocked:650, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://cpw.state.co.us/thingstodo/Pages/Stocking.aspx", notes:"Salida to Buena Vista" },
  { state:"CO", river:"Fryingpan River", county:"Eagle", species:"Rainbow Trout", sizeInches:12, countStocked:300, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://cpw.state.co.us/thingstodo/Pages/Stocking.aspx", notes:"Ruedi Reservoir tailwater" },
  { state:"CO", river:"Roaring Fork River", county:"Pitkin", species:"Rainbow Trout", sizeInches:9, countStocked:500, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://cpw.state.co.us/thingstodo/Pages/Stocking.aspx", notes:"Basalt to Carbondale" },
  { state:"CO", river:"Cache la Poudre River", county:"Larimer", species:"Brown Trout", sizeInches:8, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://cpw.state.co.us/thingstodo/Pages/Stocking.aspx", notes:"Poudre Canyon Hwy" },
  { state:"CT", river:"Farmington River", county:"Hartford", species:"Brown Trout", sizeInches:12, countStocked:600, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://portal.ct.gov/DEEP/Fishing/Freshwater/Trout-Stocking-Report", notes:"TMA delayed harvest section" },
  { state:"CT", river:"Housatonic River", county:"Litchfield", species:"Rainbow Trout", sizeInches:10, countStocked:700, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://portal.ct.gov/DEEP/Fishing/Freshwater/Trout-Stocking-Report", notes:"Cornwall Bridge area" },
  { state:"DE", river:"Brandywine Creek", county:"New Castle", species:"Brown Trout", sizeInches:11, countStocked:400, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://dnrec.delaware.gov/fish-wildlife/fishing/trout/", notes:"Brandywine Valley section" },
  { state:"DE", river:"White Clay Creek", county:"New Castle", species:"Rainbow Trout", sizeInches:9, countStocked:350, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://dnrec.delaware.gov/fish-wildlife/fishing/trout/", notes:"Stanton area" },
  { state:"FL", river:"Ochlockonee River", county:"Leon", species:"Striped Bass", sizeInches:undefined, countStocked:5000, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://myfwc.com/fishing/freshwater/stocking/", notes:"Lake Talquin release" },
  { state:"FL", river:"St. Johns River", county:"Volusia", species:"Largemouth Bass", sizeInches:undefined, countStocked:3000, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://myfwc.com/fishing/freshwater/stocking/", notes:"Astor area" },
  { state:"GA", river:"Chattahoochee River", county:"White", species:"Rainbow Trout", sizeInches:10, countStocked:900, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://georgiawildlife.com/fishing/stocking", notes:"Helen to Unicoi area" },
  { state:"GA", river:"Toccoa River", county:"Fannin", species:"Brown Trout", sizeInches:11, countStocked:600, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://georgiawildlife.com/fishing/stocking", notes:"Blue Ridge tailwater" },
  { state:"HI", river:"Wailoa River", county:"Hawaii", species:"Peacock Bass", sizeInches:undefined, countStocked:undefined, stockDate:"2026-06-12", source:"state_dnr", sourceUrl:"https://dlnr.hawaii.gov/dar/fishing/freshwater-fishing/", notes:"Hilo area — management stocking" },
  { state:"HI", river:"Wahiawa Reservoir", county:"Honolulu", species:"Largemouth Bass", sizeInches:undefined, countStocked:undefined, stockDate:"2026-05-28", source:"state_dnr", sourceUrl:"https://dlnr.hawaii.gov/dar/fishing/freshwater-fishing/", notes:"Schofield area" },
  { state:"ID", river:"Henry's Fork", county:"Fremont", species:"Rainbow Trout", sizeInches:11, countStocked:400, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://idfg.idaho.gov/fish/stocking", notes:"Box Canyon section" },
  { state:"ID", river:"Boise River", county:"Ada", species:"Rainbow Trout", sizeInches:9, countStocked:900, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://idfg.idaho.gov/fish/stocking", notes:"Greenbelt access" },
  { state:"ID", river:"Clearwater River", county:"Clearwater", species:"Steelhead", sizeInches:15, countStocked:250, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://idfg.idaho.gov/fish/stocking", notes:"Orofino area" },
  { state:"ID", river:"Snake River", county:"Twin Falls", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-06-29", source:"state_dnr", sourceUrl:"https://idfg.idaho.gov/fish/stocking", notes:"Milner to Hagerman reach" },
  { state:"IL", river:"Chicago River", county:"Cook", species:"Steelhead", sizeInches:13, countStocked:300, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www2.illinois.gov/dnr/fishing/Pages/default.aspx", notes:"Skokie Lagoons tributary" },
  { state:"IL", river:"Apple River", county:"Jo Daviess", species:"Brown Trout", sizeInches:10, countStocked:400, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://www2.illinois.gov/dnr/fishing/Pages/default.aspx", notes:"Hanover area" },
  { state:"IN", river:"Tippecanoe River", county:"Kosciusko", species:"Rainbow Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.in.gov/dnr/fish-and-wildlife/fishing/stocking/", notes:"Rochester area" },
  { state:"IN", river:"Blue River", county:"Washington", species:"Brown Trout", sizeInches:11, countStocked:400, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://www.in.gov/dnr/fish-and-wildlife/fishing/stocking/", notes:"Milltown section" },
  { state:"IA", river:"Upper Iowa River", county:"Winneshiek", species:"Brown Trout", sizeInches:10, countStocked:500, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://www.iowadnr.gov/Fishing/Stocking-Reports", notes:"Decorah area" },
  { state:"IA", river:"Driftless streams", county:"Allamakee", species:"Brook Trout", sizeInches:8, countStocked:400, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://www.iowadnr.gov/Fishing/Stocking-Reports", notes:"Northeast Iowa limestone streams" },
  { state:"KS", river:"Walnut Creek", county:"McPherson", species:"Rainbow Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://ksoutdoors.com/Fishing/Fishing-Reports-and-Stocking", notes:"Cheney Reservoir area" },
  { state:"KS", river:"Cimarron River", county:"Meade", species:"Largemouth Bass", sizeInches:undefined, countStocked:2000, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://ksoutdoors.com/Fishing/Fishing-Reports-and-Stocking", notes:"Meade State Park" },
  { state:"KY", river:"Cumberland River", county:"Pulaski", species:"Rainbow Trout", sizeInches:12, countStocked:1000, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://app.fw.ky.gov/trout/", notes:"Lake Cumberland tailwater" },
  { state:"KY", river:"Barren River", county:"Allen", species:"Brown Trout", sizeInches:11, countStocked:600, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://app.fw.ky.gov/trout/", notes:"Barren River Lake tailwater" },
  { state:"LA", river:"Calcasieu River", county:"Calcasieu", species:"Redfish", sizeInches:undefined, countStocked:10000, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.wlf.louisiana.gov/fishing/", notes:"Lake Charles area — fingerlings" },
  { state:"LA", river:"Sabine River", county:"Sabine", species:"Largemouth Bass", sizeInches:undefined, countStocked:3000, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://www.wlf.louisiana.gov/fishing/", notes:"Toledo Bend area" },
  { state:"ME", river:"Kennebec River", county:"Somerset", species:"Atlantic Salmon", sizeInches:undefined, countStocked:undefined, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www.maine.gov/ifw/fish-wildlife/fishing/stocking.html", notes:"Wild system management" },
  { state:"ME", river:"Penobscot River", county:"Penobscot", species:"Brook Trout", sizeInches:9, countStocked:600, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.maine.gov/ifw/fish-wildlife/fishing/stocking.html", notes:"West Branch section" },
  { state:"ME", river:"Rapid River", county:"Oxford", species:"Brook Trout", sizeInches:10, countStocked:400, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://www.maine.gov/ifw/fish-wildlife/fishing/stocking.html", notes:"Oquossoc area" },
  { state:"MD", river:"Gunpowder River", county:"Baltimore", species:"Brown Trout", sizeInches:12, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://dnr.maryland.gov/fisheries/Pages/trout/index.aspx", notes:"Prettyboy Reservoir tailwater" },
  { state:"MD", river:"Big Hunting Creek", county:"Frederick", species:"Rainbow Trout", sizeInches:10, countStocked:500, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://dnr.maryland.gov/fisheries/Pages/trout/index.aspx", notes:"Catoctin Mountain special regulation" },
  { state:"MA", river:"Deerfield River", county:"Franklin", species:"Brown Trout", sizeInches:11, countStocked:700, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.mass.gov/trout-and-salmon-stocking-schedule", notes:"Fife Brook tailwater" },
  { state:"MA", river:"Swift River", county:"Worcester", species:"Rainbow Trout", sizeInches:13, countStocked:500, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.mass.gov/trout-and-salmon-stocking-schedule", notes:"Ware below Quabbin" },
  { state:"MI", river:"Au Sable River", county:"Crawford", species:"Brown Trout", sizeInches:12, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.michigan.gov/dnr/doing-business/grants-and-stocking/stocking", notes:"Grayling to Mio — Holy Water section" },
  { state:"MI", river:"Pere Marquette River", county:"Mason", species:"Steelhead", sizeInches:14, countStocked:400, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://www.michigan.gov/dnr/doing-business/grants-and-stocking/stocking", notes:"Baldwin area" },
  { state:"MI", river:"Manistee River", county:"Manistee", species:"Chinook Salmon", sizeInches:undefined, countStocked:undefined, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://www.michigan.gov/dnr/doing-business/grants-and-stocking/stocking", notes:"Tippy Dam area" },
  { state:"MN", river:"Whitewater River", county:"Winona", species:"Brown Trout", sizeInches:11, countStocked:600, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.dnr.state.mn.us/fishing/trout/stocking.html", notes:"Driftless Area section" },
  { state:"MN", river:"Root River", county:"Fillmore", species:"Brook Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://www.dnr.state.mn.us/fishing/trout/stocking.html", notes:"Lanesboro area" },
  { state:"MN", river:"Baptism River", county:"Lake", species:"Steelhead", sizeInches:14, countStocked:250, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www.dnr.state.mn.us/fishing/trout/stocking.html", notes:"North Shore Lake Superior" },
  { state:"MS", river:"Pearl River", county:"Rankin", species:"Largemouth Bass", sizeInches:undefined, countStocked:3000, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://www.mdwfp.com/fishing/stocking/", notes:"Brandon area" },
  { state:"MS", river:"Ross Barnett Reservoir", county:"Madison", species:"Striped Bass", sizeInches:undefined, countStocked:50000, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://www.mdwfp.com/fishing/stocking/", notes:"Annual fingerling release" },
  { state:"MO", river:"Meramec River", county:"Phelps", species:"Rainbow Trout", sizeInches:11, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://mdc.mo.gov/fishing/trout", notes:"Maramec Spring Park" },
  { state:"MO", river:"North Fork River", county:"Ozark", species:"Brown Trout", sizeInches:13, countStocked:400, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://mdc.mo.gov/fishing/trout", notes:"Dawt Mill section" },
  { state:"MO", river:"Eleven Point River", county:"Howell", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-06-29", source:"state_dnr", sourceUrl:"https://mdc.mo.gov/fishing/trout", notes:"Greer Spring area" },
  { state:"MT", river:"Madison River", county:"Madison", species:"Rainbow Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://fwp.mt.gov/fish/stockingReport", notes:"Lower Madison, Ennis section" },
  { state:"MT", river:"Gallatin River", county:"Gallatin", species:"Brown Trout", sizeInches:10, countStocked:350, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://fwp.mt.gov/fish/stockingReport", notes:"Gallatin Canyon" },
  { state:"MT", river:"Clark Fork River", county:"Missoula", species:"Rainbow Trout", sizeInches:8.5, countStocked:600, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://fwp.mt.gov/fish/stockingReport", notes:"Milltown area" },
  { state:"MT", river:"Big Hole River", county:"Beaverhead", species:"Brook Trout", sizeInches:7, countStocked:400, stockDate:"2026-06-24", source:"state_dnr", sourceUrl:"https://fwp.mt.gov/fish/stockingReport", notes:"Big Hole Valley" },
  { state:"MT", river:"Bitterroot River", county:"Ravalli", species:"Cutthroat Trout", sizeInches:9, countStocked:450, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://fwp.mt.gov/fish/stockingReport", notes:"Hamilton access" },
  { state:"NE", river:"Niobrara River", county:"Cherry", species:"Rainbow Trout", sizeInches:9, countStocked:500, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://outdoornebraska.gov/fishing/fish-stocking/", notes:"Smith Falls State Park" },
  { state:"NE", river:"Pine Creek", county:"Sioux", species:"Brown Trout", sizeInches:10, countStocked:300, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://outdoornebraska.gov/fishing/fish-stocking/", notes:"Chadron area" },
  { state:"NV", river:"Truckee River", county:"Washoe", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.ndow.org/fish/stocking/", notes:"Reno urban reach" },
  { state:"NV", river:"Walker River", county:"Lyon", species:"Brown Trout", sizeInches:11, countStocked:400, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.ndow.org/fish/stocking/", notes:"Yerington area" },
  { state:"NH", river:"Androscoggin River", county:"Coos", species:"Rainbow Trout", sizeInches:10, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.wildlife.state.nh.us/fishing/stocking.html", notes:"Berlin to Gorham" },
  { state:"NH", river:"Contoocook River", county:"Merrimack", species:"Brown Trout", sizeInches:11, countStocked:500, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.wildlife.state.nh.us/fishing/stocking.html", notes:"Peterborough area" },
  { state:"NJ", river:"Musconetcong River", county:"Warren", species:"Brown Trout", sizeInches:12, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.nj.gov/dep/fgw/troutstock.htm", notes:"Hackettstown TMA section" },
  { state:"NJ", river:"South Branch Raritan", county:"Hunterdon", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://www.nj.gov/dep/fgw/troutstock.htm", notes:"Ken Lockwood Gorge — fly fishing only" },
  { state:"NM", river:"San Juan River", county:"San Juan", species:"Rainbow Trout", sizeInches:12, countStocked:600, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://www.wildlife.state.nm.us/fishing/stocking/", notes:"Navajo Dam tailwater" },
  { state:"NM", river:"Rio Grande", county:"Taos", species:"Brown Trout", sizeInches:10, countStocked:500, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://www.wildlife.state.nm.us/fishing/stocking/", notes:"Taos Box section" },
  { state:"NM", river:"Pecos River", county:"San Miguel", species:"Cutthroat Trout", sizeInches:9, countStocked:400, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://www.wildlife.state.nm.us/fishing/stocking/", notes:"Upper Pecos wilderness" },
  { state:"NY", river:"Beaverkill River", county:"Sullivan", species:"Brown Trout", sizeInches:12, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://dec.ny.gov/nature/animals-fish-plants/fish/trout/stocking", notes:"Catskill fly fishing capital" },
  { state:"NY", river:"Willowemoc Creek", county:"Sullivan", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://dec.ny.gov/nature/animals-fish-plants/fish/trout/stocking", notes:"Junction Pool confluence" },
  { state:"NY", river:"Delaware River", county:"Delaware", species:"Wild Brown Trout", sizeInches:undefined, countStocked:undefined, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://dec.ny.gov/nature/animals-fish-plants/fish/trout/stocking", notes:"East Branch — wild fishery" },
  { state:"NY", river:"Ausable River", county:"Essex", species:"Brown Trout", sizeInches:11, countStocked:700, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://dec.ny.gov/nature/animals-fish-plants/fish/trout/stocking", notes:"Wilmington Notch" },
  { state:"NC", river:"Nantahala River", county:"Macon", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.ncwildlife.org/fishing/trout-stocking", notes:"Nantahala Gorge" },
  { state:"NC", river:"Watauga River", county:"Watauga", species:"Brown Trout", sizeInches:11, countStocked:600, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.ncwildlife.org/fishing/trout-stocking", notes:"Elk Park tailwater" },
  { state:"NC", river:"Davidson River", county:"Transylvania", species:"Rainbow Trout", sizeInches:12, countStocked:500, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://www.ncwildlife.org/fishing/trout-stocking", notes:"Brevard Cradle of Forestry" },
  { state:"ND", river:"Little Missouri River", county:"Slope", species:"Brown Trout", sizeInches:10, countStocked:300, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://gf.nd.gov/fishing/stocking", notes:"Medora area" },
  { state:"ND", river:"Turtle River", county:"Grand Forks", species:"Rainbow Trout", sizeInches:9, countStocked:400, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://gf.nd.gov/fishing/stocking", notes:"Turtle River State Park" },
  { state:"OH", river:"Chagrin River", county:"Lake", species:"Steelhead", sizeInches:14, countStocked:500, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/fishing/fishing-reports", notes:"Lake Erie tributary" },
  { state:"OH", river:"Grand River", county:"Lake", species:"Steelhead", sizeInches:13, countStocked:450, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/fishing/fishing-reports", notes:"Painesville area" },
  { state:"OH", river:"Mad River", county:"Champaign", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-06-29", source:"state_dnr", sourceUrl:"https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/fishing/fishing-reports", notes:"Urbana — Ohio's only spring creek" },
  { state:"OK", river:"Illinois River", county:"Cherokee", species:"Rainbow Trout", sizeInches:10, countStocked:700, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://www.wildlifedepartment.com/fishing/trout", notes:"Tenkiller area — float fishing" },
  { state:"OK", river:"Lower Mountain Fork", county:"McCurtain", species:"Brown Trout", sizeInches:12, countStocked:500, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.wildlifedepartment.com/fishing/trout", notes:"Broken Bow tailwater" },
  { state:"OR", river:"Deschutes River", county:"Jefferson", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://myodfw.com/fishing/species/trout/stocking-schedule", notes:"Warm Springs area — wild supplemental" },
  { state:"OR", river:"McKenzie River", county:"Lane", species:"Chinook Salmon", sizeInches:undefined, countStocked:undefined, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://myodfw.com/fishing/species/trout/stocking-schedule", notes:"Leaburg Hatchery release" },
  { state:"OR", river:"Sandy River", county:"Multnomah", species:"Steelhead", sizeInches:14, countStocked:300, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://myodfw.com/fishing/species/trout/stocking-schedule", notes:"Summer run — Dodge Park" },
  { state:"OR", river:"Williamson River", county:"Klamath", species:"Rainbow Trout", sizeInches:11, countStocked:400, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://myodfw.com/fishing/species/trout/stocking-schedule", notes:"Klamath Agency section" },
  { state:"PA", river:"Brodhead Creek", county:"Monroe", species:"Brown Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://www.fishandboat.com/Fish/FishingInPennsylvania/Pages/stocking.aspx", notes:"Delayed harvest section" },
  { state:"PA", river:"Penns Creek", county:"Centre", species:"Rainbow Trout", sizeInches:12, countStocked:450, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www.fishandboat.com/Fish/FishingInPennsylvania/Pages/stocking.aspx", notes:"Coburn to Weikert" },
  { state:"PA", river:"Letort Spring Run", county:"Cumberland", species:"Brown Trout", sizeInches:14, countStocked:150, stockDate:"2026-06-27", source:"state_dnr", sourceUrl:"https://www.fishandboat.com/Fish/FishingInPennsylvania/Pages/stocking.aspx", notes:"Carlisle limestone spring creek" },
  { state:"PA", river:"Yellow Breeches", county:"Cumberland", species:"Brown Trout", sizeInches:11, countStocked:500, stockDate:"2026-07-06", source:"state_dnr", sourceUrl:"https://www.fishandboat.com/Fish/FishingInPennsylvania/Pages/stocking.aspx", notes:"Boiling Springs special regulation" },
  { state:"RI", river:"Wood River", county:"Washington", species:"Brown Trout", sizeInches:11, countStocked:500, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://dem.ri.gov/natural-resources/fish-wildlife/freshwater-fishing/trout-stocking", notes:"Woodville area" },
  { state:"RI", river:"Pawcatuck River", county:"Washington", species:"Rainbow Trout", sizeInches:10, countStocked:400, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://dem.ri.gov/natural-resources/fish-wildlife/freshwater-fishing/trout-stocking", notes:"Kenyon area" },
  { state:"SC", river:"Chauga River", county:"Oconee", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://www.dnr.sc.gov/fish/stockingreports.html", notes:"Walhalla area" },
  { state:"SC", river:"Chattooga River", county:"Oconee", species:"Brown Trout", sizeInches:11, countStocked:450, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://www.dnr.sc.gov/fish/stockingreports.html", notes:"Section IV near Long Creek" },
  { state:"SD", river:"Spearfish Creek", county:"Lawrence", species:"Rainbow Trout", sizeInches:10, countStocked:500, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://gfp.sd.gov/fishing/stocking/", notes:"Black Hills Spearfish Canyon" },
  { state:"SD", river:"Rapid Creek", county:"Pennington", species:"Brown Trout", sizeInches:11, countStocked:400, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://gfp.sd.gov/fishing/stocking/", notes:"Rapid City urban fishery" },
  { state:"TN", river:"Clinch River", county:"Anderson", species:"Rainbow Trout", sizeInches:11, countStocked:900, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://www.tn.gov/twra/fishing/fish-stocking.html", notes:"Norris Dam tailwater" },
  { state:"TN", river:"Hiwassee River", county:"Polk", species:"Brown Trout", sizeInches:12, countStocked:600, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://www.tn.gov/twra/fishing/fish-stocking.html", notes:"Apalachia tailwater" },
  { state:"TN", river:"Caney Fork River", county:"Smith", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://www.tn.gov/twra/fishing/fish-stocking.html", notes:"Center Hill tailwater" },
  { state:"TX", river:"Guadalupe River", county:"Comal", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://tpwd.texas.gov/fish/freshwater/stocking", notes:"Winter season — Canyon Lake tailwater" },
  { state:"TX", river:"Frio River", county:"Real", species:"Rainbow Trout", sizeInches:9, countStocked:600, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://tpwd.texas.gov/fish/freshwater/stocking", notes:"Garner State Park area" },
  { state:"TX", river:"Sabinal River", county:"Uvalde", species:"Largemouth Bass", sizeInches:undefined, countStocked:2000, stockDate:"2026-06-27", source:"state_dnr", sourceUrl:"https://tpwd.texas.gov/fish/freshwater/stocking", notes:"Lost Maples area" },
  { state:"UT", river:"Green River", county:"Daggett", species:"Rainbow Trout", sizeInches:12, countStocked:700, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://wildlife.utah.gov/fishing/stocking-report", notes:"Flaming Gorge tailwater" },
  { state:"UT", river:"Provo River", county:"Summit", species:"Brown Trout", sizeInches:13, countStocked:400, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://wildlife.utah.gov/fishing/stocking-report", notes:"Upper Provo — Jordanelle tailwater" },
  { state:"UT", river:"Logan River", county:"Cache", species:"Cutthroat Trout", sizeInches:9, countStocked:500, stockDate:"2026-06-30", source:"state_dnr", sourceUrl:"https://wildlife.utah.gov/fishing/stocking-report", notes:"Logan Canyon section" },
  { state:"VT", river:"Battenkill River", county:"Bennington", species:"Brown Trout", sizeInches:12, countStocked:600, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://anr.vermont.gov/node/386", notes:"Manchester area — trophy water" },
  { state:"VT", river:"White River", county:"Orange", species:"Rainbow Trout", sizeInches:10, countStocked:700, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://anr.vermont.gov/node/386", notes:"Bethel area" },
  { state:"VA", river:"Smith River", county:"Henry", species:"Rainbow Trout", sizeInches:11, countStocked:800, stockDate:"2026-07-08", source:"state_dnr", sourceUrl:"https://dwr.virginia.gov/fishing/trout/trout-stocking/", notes:"Philpott Dam tailwater" },
  { state:"VA", river:"Jackson River", county:"Bath", species:"Brown Trout", sizeInches:13, countStocked:500, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://dwr.virginia.gov/fishing/trout/trout-stocking/", notes:"Gathright Dam — trophy water" },
  { state:"VA", river:"Rapidan River", county:"Madison", species:"Brook Trout", sizeInches:8, countStocked:400, stockDate:"2026-06-28", source:"state_dnr", sourceUrl:"https://dwr.virginia.gov/fishing/trout/trout-stocking/", notes:"Blue Ridge foothills" },
  { state:"WA", river:"Yakima River", county:"Kittitas", species:"Rainbow Trout", sizeInches:9, countStocked:1000, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://wdfw.wa.gov/fishing/reports/stocking", notes:"Ellensburg to Roza Dam" },
  { state:"WA", river:"Methow River", county:"Okanogan", species:"Steelhead", sizeInches:14, countStocked:200, stockDate:"2026-07-02", source:"state_dnr", sourceUrl:"https://wdfw.wa.gov/fishing/reports/stocking", notes:"Summer run — Twisp area" },
  { state:"WA", river:"Skagit River", county:"Skagit", species:"Coho Salmon", sizeInches:16, countStocked:300, stockDate:"2026-07-05", source:"state_dnr", sourceUrl:"https://wdfw.wa.gov/fishing/reports/stocking", notes:"Concrete Hatchery release" },
  { state:"WA", river:"Stillaguamish River", county:"Snohomish", species:"Rainbow Trout", sizeInches:10, countStocked:800, stockDate:"2026-06-29", source:"state_dnr", sourceUrl:"https://wdfw.wa.gov/fishing/reports/stocking", notes:"Arlington area" },
  { state:"WV", river:"Cranberry River", county:"Webster", species:"Brook Trout", sizeInches:8, countStocked:500, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://wvdnr.gov/Fishing/StockingSchedule.shtm", notes:"Monongahela NF — catch and release" },
  { state:"WV", river:"Elk River", county:"Webster", species:"Brown Trout", sizeInches:11, countStocked:600, stockDate:"2026-07-03", source:"state_dnr", sourceUrl:"https://wvdnr.gov/Fishing/StockingSchedule.shtm", notes:"Slatyfork area" },
  { state:"WI", river:"Bois Brule River", county:"Douglas", species:"Brown Trout", sizeInches:10, countStocked:500, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://dnr.wisconsin.gov/topic/Fishing/stocking.html", notes:"Brule River State Forest" },
  { state:"WI", river:"Wolf River", county:"Langlade", species:"Rainbow Trout", sizeInches:9, countStocked:700, stockDate:"2026-07-07", source:"state_dnr", sourceUrl:"https://dnr.wisconsin.gov/topic/Fishing/stocking.html", notes:"Wild Rose area" },
  { state:"WI", river:"Prairie River", county:"Lincoln", species:"Brook Trout", sizeInches:8, countStocked:400, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://dnr.wisconsin.gov/topic/Fishing/stocking.html", notes:"Merrill area" },
  { state:"WY", river:"North Platte River", county:"Carbon", species:"Rainbow Trout", sizeInches:10, countStocked:600, stockDate:"2026-07-04", source:"state_dnr", sourceUrl:"https://wgfd.wyo.gov/Fishing/Stocking-Reports", notes:"Miracle Mile section" },
  { state:"WY", river:"Snake River", county:"Teton", species:"Cutthroat Trout", sizeInches:9, countStocked:400, stockDate:"2026-07-01", source:"state_dnr", sourceUrl:"https://wgfd.wyo.gov/Fishing/Stocking-Reports", notes:"Grand Teton NP boundary" },
  { state:"WY", river:"Green River", county:"Sublette", species:"Rainbow Trout", sizeInches:11, countStocked:500, stockDate:"2026-06-26", source:"state_dnr", sourceUrl:"https://wgfd.wyo.gov/Fishing/Stocking-Reports", notes:"Pinedale area" },
  { state:"WY", river:"Bighorn River", county:"Big Horn", species:"Brown Trout", sizeInches:13, countStocked:250, stockDate:"2026-07-09", source:"state_dnr", sourceUrl:"https://wgfd.wyo.gov/Fishing/Stocking-Reports", notes:"Thermopolis tailwater" },
    ];

    for (const ev of seed) {
      db.insert(stockingEvents).values({
        ...ev,
        waterBody: ev.waterBody ?? "stream",
        createdAt: now,
      }).run();
    }
  }

  // ── Waypoints ──────────────────────────────────────────────────────────────
  async getWaypoints(userId?: number, tripKitId?: string): Promise<Waypoint[]> {
    if (userId !== undefined && tripKitId !== undefined) {
      return db.select().from(waypoints)
        .where(and(eq(waypoints.userId, userId), eq(waypoints.tripKitId, tripKitId)))
        .orderBy(desc(waypoints.createdAt))
        .all();
    }
    if (userId !== undefined) {
      return db.select().from(waypoints)
        .where(eq(waypoints.userId, userId))
        .orderBy(desc(waypoints.createdAt))
        .all();
    }
    if (tripKitId !== undefined) {
      return db.select().from(waypoints)
        .where(eq(waypoints.tripKitId, tripKitId))
        .orderBy(desc(waypoints.createdAt))
        .all();
    }
    return db.select().from(waypoints).orderBy(desc(waypoints.createdAt)).all();
  }

  async createWaypoint(data: InsertWaypoint): Promise<Waypoint> {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(waypoints).values({ ...data, createdAt: now }).returning().get();
  }

  async deleteWaypoint(id: number): Promise<void> {
    db.delete(waypoints).where(eq(waypoints.id, id)).run();
  }

  // ── Reputation ─────────────────────────────────────────────────────────────
  async getReputation(userId: number): Promise<ContributorReputation | undefined> {
    return db.select().from(contributorReputation).where(eq(contributorReputation.userId, userId)).get();
  }

  async upsertReputation(userId: number, delta: { reports?: number; upvotes?: number }): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const existing = db.select().from(contributorReputation).where(eq(contributorReputation.userId, userId)).get();
    const totalReports = (existing?.totalReports ?? 0) + (delta.reports ?? 0);
    const upvotesReceived = (existing?.upvotesReceived ?? 0) + (delta.upvotes ?? 0);
    const verifiedReports = existing?.verifiedReports ?? 0;
    const repScore = Math.min(5, 1 + (totalReports * 0.1) + (upvotesReceived * 0.05) + (verifiedReports * 0.2));
    if (existing) {
      db.update(contributorReputation)
        .set({ totalReports, upvotesReceived, verifiedReports, repScore, updatedAt: now })
        .where(eq(contributorReputation.userId, userId))
        .run();
    } else {
      db.insert(contributorReputation).values({
        userId,
        totalReports,
        upvotesReceived,
        verifiedReports,
        repScore,
        updatedAt: now,
      }).run();
    }
  }

  async upvoteReport(userId: number, reportType: string, reportId: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    // Prevent duplicate upvotes from the same user on the same report
    const existing = db.select().from(reportUpvotes)
      .where(and(
        eq(reportUpvotes.userId, userId),
        eq(reportUpvotes.reportType, reportType),
        eq(reportUpvotes.reportId, reportId),
      ))
      .get();
    if (existing) return;

    db.insert(reportUpvotes).values({ userId, reportType, reportId, createdAt: now }).run();

    let ownerId: number | null | undefined = null;
    if (reportType === "hatch") {
      const report = db.select().from(hatchReports).where(eq(hatchReports.id, reportId)).get();
      if (report) {
        ownerId = report.userId;
        db.update(hatchReports)
          .set({ upvotes: (report.upvotes ?? 0) + 1 })
          .where(eq(hatchReports.id, reportId))
          .run();
      }
    } else if (reportType === "catch") {
      const report = db.select().from(catchReports).where(eq(catchReports.id, reportId)).get();
      if (report) {
        ownerId = report.userId;
        db.update(catchReports)
          .set({ upvotes: (report.upvotes ?? 0) + 1 })
          .where(eq(catchReports.id, reportId))
          .run();
      }
    }

    if (ownerId != null) {
      await this.upsertReputation(ownerId, { upvotes: 1 });
    }
  }
}

export const storage = new DatabaseStorage();

// ── Analytics ────────────────────────────────────────────────────────────────
export interface LogEventParams {
  eventName: string;
  sessionId?: string | null;
  userId?: number | null;
  properties?: Record<string, unknown> | null;
  waterMode?: string | null;
  page?: string | null;
}

export function logEvent(params: LogEventParams): void {
  const stmt = sqlite.prepare(`
    INSERT INTO analytics_events (event_name, session_id, user_id, properties, water_mode, page)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    params.eventName,
    params.sessionId ?? null,
    params.userId ?? null,
    params.properties ? JSON.stringify(params.properties) : null,
    params.waterMode ?? null,
    params.page ?? null,
  );
}
