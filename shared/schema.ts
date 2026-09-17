import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users ──────────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  homeRegion: text("home_region"),           // e.g. "Rocky Mountain / Intermountain"
  newsletterOptIn: integer("newsletter_opt_in").notNull().default(1), // 1 = yes
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").notNull().default("trialing"), // trialing | active | expired | canceled | free
  trialStartedAt: integer("trial_started_at"),   // unix timestamp — set on register
  trialEndsAt: integer("trial_ends_at"),           // unix timestamp = trialStartedAt + 604800 (7 days)
  subscriptionCurrentPeriodEnd: integer("subscription_current_period_end"), // unix timestamp
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Newsletter subscribers (also captures non-registered interest) ────────────
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  region: text("region"),
  source: text("source").notNull().default("app"), // app | landing | finder
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, createdAt: true });
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// ── Saved fishing sessions / reports
export const fishingReports = sqliteTable("fishing_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  location: text("location").notNull(),
  region: text("region").notNull(),
  date: text("date").notNull(),
  conditions: text("conditions").notNull(), // JSON: { water_temp, clarity, flow, weather }
  hatchObserved: text("hatch_observed").notNull(), // JSON: string[]
  flyRecommendations: text("fly_recommendations").notNull(), // JSON: FlyRecommendation[]
  notes: text("notes"),
});

export const insertFishingReportSchema = createInsertSchema(fishingReports).omit({ id: true });
export type InsertFishingReport = z.infer<typeof insertFishingReportSchema>;
export type FishingReport = typeof fishingReports.$inferSelect;

// ── Community Hatch Reports ───────────────────────────────────────────────────
export const hatchReports = sqliteTable("hatch_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),           // null = anonymous
  state: text("state").notNull(),       // 2-letter abbr
  river: text("river").notNull(),
  insect: text("insect").notNull(),     // e.g. "PMD", "Caddis", "Midge"
  intensity: text("intensity").notNull(), // "sparse" | "moderate" | "heavy"
  waterTemp: real("water_temp"),        // °F, optional
  conditions: text("conditions"),       // free text notes
  createdAt: integer("created_at").notNull(),
  // ── Unified observation model fields ────────────────────────────────────
  lat: real("lat"),                     // GPS latitude
  lon: real("lon"),                     // GPS longitude
  elevation: real("elevation"),         // meters above sea level
  cfs: real("cfs"),                     // stream flow at time of report
  airTemp: real("air_temp"),            // °F
  windSpeed: real("wind_speed"),        // mph
  windDir: text("wind_dir"),            // cardinal direction
  confidence: integer("confidence"),    // 0-100 user confidence score
  stage: text("stage"),                 // "nymph" | "emerger" | "dun" | "spinner"
  waterClarity: text("water_clarity"),  // "clear" | "off-color" | "muddy"
  photoUrl: text("photo_url"),
  upvotes: integer("upvotes").notNull().default(0),
});

export const insertHatchReportSchema = createInsertSchema(hatchReports).omit({ id: true });
export type InsertHatchReport = z.infer<typeof insertHatchReportSchema>;
export type HatchReport = typeof hatchReports.$inferSelect;

// ── Trip Kits ────────────────────────────────────────────────────────────────
// Stores per-user offline trip kits. flies and knotIds are JSON text columns.
export const tripKits = sqliteTable("trip_kits", {
  id: text("id").primaryKey(), // client-generated: Date.now().toString(36) + random
  userId: integer("user_id"),  // null = anonymous / guest
  name: text("name").notNull(),
  river: text("river").notNull().default(""),
  state: text("state").notNull().default(""),
  dates: text("dates").notNull().default(""),
  waterMode: text("water_mode").notNull().default("fresh"), // fresh | salt
  flies: text("flies").notNull().default("[]"),       // JSON: SavedFly[]
  knotIds: text("knot_ids").notNull().default("[]"),  // JSON: string[]
  notes: text("notes").notNull().default(""),
  cachedAt: integer("cached_at").notNull().default(0),
  cacheStatus: text("cache_status").notNull().default("pending"), // ready | partial | pending
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertTripKitSchema = createInsertSchema(tripKits).omit({ createdAt: true });
export type InsertTripKit = z.infer<typeof insertTripKitSchema>;
export type TripKitRow = typeof tripKits.$inferSelect;

// ── Trip Plans ────────────────────────────────────────────────────────────────
export const tripPlans = sqliteTable("trip_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  destination: text("destination").notNull(),   // city/river name
  state: text("state").notNull(),
  targetDate: text("target_date").notNull(),    // ISO date string
  targetSpecies: text("target_species"),        // JSON array stored as text
  notes: text("notes"),
  alertEnabled: integer("alert_enabled").default(1), // 0 or 1
  createdAt: integer("created_at").notNull(),
});

export const insertTripPlanSchema = createInsertSchema(tripPlans).omit({ id: true });
export type InsertTripPlan = z.infer<typeof insertTripPlanSchema>;
export type TripPlan = typeof tripPlans.$inferSelect;

// ── Guide Listings ────────────────────────────────────────────────────────────
export const guides = sqliteTable("guides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  state: text("state").notNull(),
  region: text("region").notNull(),
  lat: real("lat"),
  lon: real("lon"),
  specialty: text("specialty").notNull().default("[]"), // JSON: "fresh" | "salt" | both
  targetSpecies: text("target_species").notNull().default("[]"), // JSON: string[]
  homeWater: text("home_water").notNull().default(""),
  bio: text("bio").notNull().default(""),
  rateHalfDay: integer("rate_half_day"),   // USD
  rateFullDay: integer("rate_full_day"),   // USD
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  instagram: text("instagram"),
  photoUrl: text("photo_url"),
  isAffiliate: integer("is_affiliate").notNull().default(0), // 1 = pays referral fee
  affiliateCode: text("affiliate_code"),
  featured: integer("featured").notNull().default(0),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertGuideSchema = createInsertSchema(guides).omit({ id: true, createdAt: true });
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// ── Fly Shop Affiliates ───────────────────────────────────────────────────────
export const flyShops = sqliteTable("fly_shops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  lat: real("lat"),
  lon: real("lon"),
  website: text("website"),
  phone: text("phone"),
  affiliateUrl: text("affiliate_url"),   // tracked referral link
  affiliateCode: text("affiliate_code"),
  commissionPct: real("commission_pct").default(8), // %
  description: text("description"),
  specialties: text("specialties").notNull().default("[]"), // JSON: string[]
  brands: text("brands").notNull().default("[]"),           // JSON: Orvis, Simms, etc.
  featured: integer("featured").notNull().default(0),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertFlyShopSchema = createInsertSchema(flyShops).omit({ id: true, createdAt: true });
export type InsertFlyShop = z.infer<typeof insertFlyShopSchema>;
export type FlyShop = typeof flyShops.$inferSelect;

// ── Conservation Partners ────────────────────────────────────────────────────
export const conservationOrgs = sqliteTable("conservation_orgs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  mission: text("mission").notNull(),
  website: text("website").notNull(),
  donateUrl: text("donate_url").notNull(),
  membershipUrl: text("membership_url"),
  logoUrl: text("logo_url"),
  focusArea: text("focus_area").notNull(), // "trout" | "salmon" | "steelhead" | "saltwater" | "all"
  national: integer("national").notNull().default(1), // 1=national, 0=regional
  state: text("state"),                               // if regional
  referralCode: text("referral_code"),
  flydentifyDonatesPct: real("flydentify_donates_pct").default(10), // % of membership we donate
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertConservationOrgSchema = createInsertSchema(conservationOrgs).omit({ id: true, createdAt: true });
export type InsertConservationOrg = z.infer<typeof insertConservationOrgSchema>;
export type ConservationOrg = typeof conservationOrgs.$inferSelect;

// ── Sponsor Ad Placements ────────────────────────────────────────────────────
export const sponsorAds = sqliteTable("sponsor_ads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brand: text("brand").notNull(),          // "Orvis" | "Simms" | "Patagonia" | ...
  headline: text("headline").notNull(),
  tagline: text("tagline"),
  ctaText: text("cta_text").notNull().default("Shop Now"),
  ctaUrl: text("cta_url").notNull(),
  imageUrl: text("image_url"),
  placement: text("placement").notNull(),  // "home" | "finder" | "hatch" | "rigging" | "all"
  waterMode: text("water_mode").notNull().default("both"), // "fresh" | "salt" | "both"
  priority: integer("priority").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertSponsorAdSchema = createInsertSchema(sponsorAds).omit({ id: true, createdAt: true });
export type InsertSponsorAd = z.infer<typeof insertSponsorAdSchema>;
export type SponsorAd = typeof sponsorAds.$inferSelect;

// ── Catch Reports (crowd-sourced hyper-local intelligence) ───────────────────
export const catchReports = sqliteTable("catch_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),               // null = anonymous
  displayName: text("display_name").notNull().default("Anonymous Angler"),
  waterMode: text("water_mode").notNull().default("fresh"), // fresh | salt
  state: text("state").notNull(),
  river: text("river").notNull(),
  lat: real("lat"),
  lon: real("lon"),
  species: text("species").notNull(),       // e.g. "Rainbow Trout"
  fly: text("fly").notNull(),               // e.g. "Dave's Hopper"
  method: text("method").notNull().default("dry"), // dry | nymph | streamer | wet | spin
  catchCount: integer("catch_count").notNull().default(1), // fish landed this session
  waterTemp: real("water_temp"),            // °F optional
  conditions: text("conditions").notNull().default("good"), // poor | fair | good | excellent
  hatch: text("hatch"),                     // what was hatching, free text
  notes: text("notes"),
  photoUrl: text("photo_url"),
  // ── Unified observation model / reputation fields ─────────────────────
  elevation: real("elevation"),
  cfs: real("cfs"),
  airTemp: real("air_temp"),
  windSpeed: real("wind_speed"),
  windDir: text("wind_dir"),
  confidence: integer("confidence").default(75), // 0-100
  waterClarity: text("water_clarity"),
  upvotes: integer("upvotes").notNull().default(0),
  repScore: real("rep_score").notNull().default(1.0), // reputation-weighted score
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertCatchReportSchema = createInsertSchema(catchReports).omit({ id: true, createdAt: true });
export type InsertCatchReport = z.infer<typeof insertCatchReportSchema>;
export type CatchReport = typeof catchReports.$inferSelect;

// ── State Stocking Data ───────────────────────────────────────────────────────
export const stockingEvents = sqliteTable("stocking_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  state: text("state").notNull(),
  river: text("river").notNull(),
  waterBody: text("water_body"),            // lake / stream / pond
  county: text("county"),
  lat: real("lat"),
  lon: real("lon"),
  species: text("species").notNull(),       // e.g. "Rainbow Trout", "Brown Trout"
  sizeInches: real("size_inches"),          // average stocked fish size
  countStocked: integer("count_stocked"),
  stockDate: text("stock_date").notNull(),  // ISO date "2026-07-01"
  source: text("source").notNull().default("state_dnr"), // state_dnr | angler_report
  sourceUrl: text("source_url"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const insertStockingEventSchema = createInsertSchema(stockingEvents).omit({ id: true, createdAt: true });
export type InsertStockingEvent = z.infer<typeof insertStockingEventSchema>;
export type StockingEvent = typeof stockingEvents.$inferSelect;

// ── Waypoints (user-saved map points, optionally linked to a Trip Kit) ────────
export const waypoints = sqliteTable("waypoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  tripKitId: text("trip_kit_id"),         // links to tripKits.id
  name: text("name").notNull(),           // e.g. "Big pool below the bridge"
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  elevation: real("elevation"),
  waterMode: text("water_mode").notNull().default("fresh"),
  state: text("state"),
  river: text("river"),
  featureType: text("feature_type"),      // "riffle"|"pool"|"undercut_bank"|"gravel_bar"|"side_channel"|"spring_seep"|"weed_bed"|"boulder_garden"|"spinner_fall"|"foam_line"|"overhanging_willows"
  cfs: real("cfs"),
  waterTemp: real("water_temp"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
export const insertWaypointSchema = createInsertSchema(waypoints).omit({ id: true, createdAt: true });
export type InsertWaypoint = z.infer<typeof insertWaypointSchema>;
export type Waypoint = typeof waypoints.$inferSelect;

// ── Report Upvotes (tracks who upvoted what) ───────────────────────────
export const reportUpvotes = sqliteTable("report_upvotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  reportType: text("report_type").notNull(), // "hatch" | "catch"
  reportId: integer("report_id").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
export const insertReportUpvoteSchema = createInsertSchema(reportUpvotes).omit({ id: true, createdAt: true });
export type InsertReportUpvote = z.infer<typeof insertReportUpvoteSchema>;
export type ReportUpvote = typeof reportUpvotes.$inferSelect;

// ── Contributor Reputation ───────────────────────────────────────
export const contributorReputation = sqliteTable("contributor_reputation", {
  userId: integer("user_id").primaryKey(),
  totalReports: integer("total_reports").notNull().default(0),
  upvotesReceived: integer("upvotes_received").notNull().default(0),
  verifiedReports: integer("verified_reports").notNull().default(0),
  repScore: real("rep_score").notNull().default(1.0),   // 0.1 – 5.0
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
export const insertContributorReputationSchema = createInsertSchema(contributorReputation).omit({ updatedAt: true });
export type InsertContributorReputation = z.infer<typeof insertContributorReputationSchema>;
export type ContributorReputation = typeof contributorReputation.$inferSelect;
