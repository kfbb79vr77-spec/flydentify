/**
 * Flydentify Monetization Routes
 * Guide bookings, fly shop affiliates, conservation orgs, sponsor ads
 */

import type { Express, Request, Response } from "express";

// ── Curated Guide Database ─────────────────────────────────────────────────────
const GUIDES = [
  {
    id: 1, name: "Jake Mosher", businessName: "Mosher Guide Service",
    state: "MT", region: "Southwest Montana", lat: 45.6770, lon: -111.0429,
    specialty: ["fresh"], targetSpecies: ["Brown Trout", "Rainbow Trout", "Cutthroat"],
    homeWater: "Madison River", rateHalfDay: 350, rateFullDay: 550,
    bio: "Twenty years on the Madison. Jake reads water the way most people read a room. Full and half-day floats, walk-wade, and winter nymphing trips.",
    website: "https://mosherflyguide.com", instagram: "@mosherflies",
    isAffiliate: 1, affiliateCode: "FLYD-MT01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1542223092-c995b2a1b7b1?w=400",
  },
  {
    id: 2, name: "Colton Reed", businessName: "Blue Ribbon Fly Fishing",
    state: "CO", region: "South Park / South Platte",
    lat: 38.9483, lon: -105.7283,
    specialty: ["fresh"], targetSpecies: ["Brown Trout", "Rainbow Trout"],
    homeWater: "South Platte River", rateHalfDay: 325, rateFullDay: 525,
    bio: "Born and raised in South Park. Gold Medal water specialist. Trico and PMD dry-fly instruction a specialty.",
    website: "https://blueribbonflyfishing.co", instagram: "@blueribbonco",
    isAffiliate: 1, affiliateCode: "FLYD-CO01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400",
  },
  {
    id: 3, name: "Sarah Linberg", businessName: "Tides & Tails Guide Co.",
    state: "FL", region: "Florida Keys",
    lat: 24.7102, lon: -81.1003,
    specialty: ["salt"], targetSpecies: ["Tarpon", "Bonefish", "Permit"],
    homeWater: "Florida Bay / Islamorada flats",
    rateHalfDay: 450, rateFullDay: 750,
    bio: "IGFA certified. Sarah has poled the Keys flats for 15 years. Sight-fishing permit and tarpon her calling cards. Spot-burning not in her vocabulary.",
    website: "https://tidesandtails.com", instagram: "@tidesandtails",
    isAffiliate: 1, affiliateCode: "FLYD-FL01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  {
    id: 4, name: "Dario Vasquez", businessName: "Rio Grande Fly Fishing",
    state: "NM", region: "Northern New Mexico",
    lat: 36.5778, lon: -105.6725,
    specialty: ["fresh"], targetSpecies: ["Brown Trout", "Rainbow Trout", "Cutthroat"],
    homeWater: "Rio Grande Gorge", rateHalfDay: 300, rateFullDay: 475,
    bio: "Third generation New Mexican. The Gorge is his backyard. Canyon streamer fishing and dry-dropper rigs on remote water only locals know.",
    website: "https://riograndeflyfishing.com",
    isAffiliate: 1, affiliateCode: "FLYD-NM01", featured: 0,
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
  {
    id: 5, name: "Marcus Webb", businessName: "Lowcountry Fly Fishing",
    state: "SC", region: "Lowcountry / ACE Basin",
    lat: 32.6657, lon: -80.6065,
    specialty: ["salt"], targetSpecies: ["Redfish", "Speckled Trout", "Cobia"],
    homeWater: "ACE Basin marshes",
    rateHalfDay: 375, rateFullDay: 625,
    bio: "Pole and troll, mostly pole. Marcus specializes in tailing redfish on spartina grass flats. No motor — no crowds.",
    website: "https://lowcountryflyfishing.com", instagram: "@lowcountryfly",
    isAffiliate: 1, affiliateCode: "FLYD-SC01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  },
  {
    id: 6, name: "Tyler Hawn", businessName: "Deschutes Canyon Outfitters",
    state: "OR", region: "Central Oregon",
    lat: 44.5957, lon: -121.1578,
    specialty: ["fresh"], targetSpecies: ["Steelhead", "Rainbow Trout", "Cutthroat"],
    homeWater: "Deschutes River",
    rateHalfDay: 400, rateFullDay: 650,
    bio: "Deschutes Steelhead guide and fly-fishing instructor. Spey casting clinics offered October–December. Dry-line swinging only — no weight, no indicator.",
    website: "https://deschutesflyguide.com", instagram: "@deschutesfly",
    isAffiliate: 1, affiliateCode: "FLYD-OR01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  },
];

// ── Fly Shop Database ──────────────────────────────────────────────────────────
const FLY_SHOPS = [
  {
    id: 1, name: "The Blue Ribbon Flies", state: "WY", city: "West Yellowstone",
    lat: 44.6627, lon: -111.1013,
    website: "https://blueribbon.com",
    affiliateUrl: "https://blueribbon.com?ref=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 8,
    description: "West Yellowstone's original fly shop. Full guide service, rental gear, custom flies tied for the Madison, Firehole, and Gallatin.",
    specialties: ["Yellowstone area", "Spring creeks", "Float trips"],
    brands: ["Orvis", "Simms", "Scott", "Abel"],
    featured: 1,
  },
  {
    id: 2, name: "Orvis Houston", state: "TX", city: "Houston",
    lat: 29.7499, lon: -95.4571,
    website: "https://orvis.com/retail/houston",
    affiliateUrl: "https://orvis.com?AID=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 10,
    description: "Full-service Orvis retail store. Rod and reel demos, casting lessons on the lawn, guided coastal saltwater trips to Galveston Bay.",
    specialties: ["Saltwater fly fishing", "Casting instruction", "Gear fitting"],
    brands: ["Orvis", "Patagonia", "Costa"],
    featured: 1,
  },
  {
    id: 3, name: "Trouts Fly Fishing", state: "CO", city: "Denver",
    lat: 39.7514, lon: -105.0019,
    website: "https://troutsflyfishing.com",
    affiliateUrl: "https://troutsflyfishing.com?ref=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 8,
    description: "Denver's premier fly shop. Guide service on South Platte, Blue River, and Colorado tailwaters. Classes for every level.",
    specialties: ["Colorado tailwaters", "Gold Medal rivers", "Trico fishing"],
    brands: ["Simms", "Sage", "Rio", "Dr. Slick"],
    featured: 1,
  },
  {
    id: 4, name: "Rocky Mountain Fly Shop", state: "ID", city: "Idaho Falls",
    lat: 43.4917, lon: -112.0401,
    website: "https://rockymtnflyshop.com",
    affiliateUrl: "https://rockymtnflyshop.com?source=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 7,
    description: "Henry's Fork, South Fork Snake, Teton River — this shop knows all three. Expert staff, full guide roster.",
    specialties: ["Henry's Fork", "South Fork Snake", "Callibaetis"],
    brands: ["Sage", "Scott", "Winston", "Simms"],
    featured: 0,
  },
  {
    id: 5, name: "Saltwater Edge", state: "RI", city: "Middletown",
    lat: 41.5170, lon: -71.2828,
    website: "https://saltwateredge.com",
    affiliateUrl: "https://saltwateredge.com?ref=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 8,
    description: "The Northeast's saltwater fly fishing authority. Striped bass, bluefish, false albacore, bonito. Fly tying materials and guide trips.",
    specialties: ["Striped bass", "False albacore", "Northeast saltwater"],
    brands: ["Orvis", "Abel", "Sage", "Costa"],
    featured: 1,
  },
  {
    id: 6, name: "Tight Lines Fly Shop", state: "WI", city: "De Pere",
    lat: 44.4483, lon: -88.0596,
    website: "https://tightlinesflyfishing.com",
    affiliateUrl: "https://tightlinesflyfishing.com?ref=flydentify",
    affiliateCode: "FLYD",
    commissionPct: 7,
    description: "Midwest specialty shop. Trout, smallmouth, and carp on the fly. Great Lakes steelhead guide service fall through spring.",
    specialties: ["Great Lakes steelhead", "Carp on the fly", "Smallmouth bass"],
    brands: ["G. Loomis", "Patagonia", "Rio", "Simms"],
    featured: 0,
  },
];

// ── Conservation Organizations ────────────────────────────────────────────────
const CONSERVATION_ORGS = [
  {
    id: 1,
    name: "Trout Unlimited",
    shortName: "TU",
    mission: "Conserve, protect, and restore North America's coldwater fisheries and their watersheds.",
    website: "https://www.tu.org",
    donateUrl: "https://www.tu.org/donate/?source=flydentify",
    membershipUrl: "https://www.tu.org/membership/?source=flydentify",
    focusArea: "trout",
    national: 1,
    referralCode: "FLYDENTIFY",
    flydentifyDonatesPct: 10,
    logoUrl: "/assets/tu-logo.png",
  },
  {
    id: 2,
    name: "Bonefish & Tarpon Trust",
    shortName: "BTT",
    mission: "Conserving bonefish, tarpon, and permit and their habitats through research, stewardship, and education.",
    website: "https://www.bonefishtarpontrust.org",
    donateUrl: "https://www.bonefishtarpontrust.org/donate/?ref=flydentify",
    membershipUrl: "https://www.bonefishtarpontrust.org/join/?ref=flydentify",
    focusArea: "saltwater",
    national: 1,
    referralCode: "FLYDENTIFY",
    flydentifyDonatesPct: 10,
    logoUrl: "/assets/btt-logo.png",
  },
  {
    id: 3,
    name: "The Nature Conservancy",
    shortName: "TNC",
    mission: "Protecting freshwater ecosystems and the rivers, lakes, and wetlands that sustain fish and fishermen.",
    website: "https://www.nature.org/freshwater",
    donateUrl: "https://www.nature.org/donate/?ref=flydentify",
    membershipUrl: "https://www.nature.org/membership/?ref=flydentify",
    focusArea: "all",
    national: 1,
    referralCode: "FLYDENTIFY",
    flydentifyDonatesPct: 5,
    logoUrl: "/assets/tnc-logo.png",
  },
  {
    id: 4,
    name: "Wild Steelhead Coalition",
    shortName: "WSC",
    mission: "Preserving and restoring wild steelhead populations throughout the Pacific Northwest.",
    website: "https://wildsteelheadcoalition.org",
    donateUrl: "https://wildsteelheadcoalition.org/donate/?ref=flydentify",
    membershipUrl: "https://wildsteelheadcoalition.org/join/?ref=flydentify",
    focusArea: "steelhead",
    national: 0,
    state: "WA",
    referralCode: "FLYDENTIFY",
    flydentifyDonatesPct: 10,
    logoUrl: "/assets/wsc-logo.png",
  },
  {
    id: 5,
    name: "Coastal Conservation Association",
    shortName: "CCA",
    mission: "Protecting the marine, wetlands, and coastal resources of the US for future generations.",
    website: "https://www.joincca.org",
    donateUrl: "https://www.joincca.org/donate/?ref=flydentify",
    membershipUrl: "https://www.joincca.org/membership/?ref=flydentify",
    focusArea: "saltwater",
    national: 1,
    referralCode: "FLYDENTIFY",
    flydentifyDonatesPct: 8,
    logoUrl: "/assets/cca-logo.png",
  },
];

// ── Sponsor Ads ───────────────────────────────────────────────────────────────
const SPONSOR_ADS = [
  {
    id: 1,
    brand: "Orvis",
    headline: "Built for the water you fish",
    tagline: "Rods, reels, and waders engineered for anglers who take it seriously.",
    ctaText: "Shop Orvis",
    ctaUrl: "https://www.orvis.com/fly-fishing?AID=flydentify",
    imageUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800",
    placement: "all",
    waterMode: "both",
    priority: 10,
    active: 1,
  },
  {
    id: 2,
    brand: "Simms",
    headline: "Waders that outlast the season",
    tagline: "GORE-TEX waders and wading boots trusted by guides coast to coast.",
    ctaText: "Shop Simms",
    ctaUrl: "https://www.simmsfishing.com?ref=flydentify",
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    placement: "home",
    waterMode: "fresh",
    priority: 9,
    active: 1,
  },
  {
    id: 3,
    brand: "Patagonia",
    headline: "Fish. Fight. Protect.",
    tagline: "Fly fishing gear from a company that gives back to wild rivers.",
    ctaText: "Shop Patagonia",
    ctaUrl: "https://www.patagonia.com/fly-fishing?ref=flydentify",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    placement: "hatch",
    waterMode: "both",
    priority: 8,
    active: 1,
  },
  {
    id: 4,
    brand: "Costa del Mar",
    headline: "See more fish",
    tagline: "Polarized lenses engineered for the flats. Spot the tail before you hear the push.",
    ctaText: "Shop Costa",
    ctaUrl: "https://www.costadelmar.com/fly-fishing?ref=flydentify",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    placement: "finder",
    waterMode: "salt",
    priority: 8,
    active: 1,
  },
  {
    id: 5,
    brand: "Rio Products",
    headline: "The line between you and the fish",
    tagline: "Fly lines, leaders, and tippet designed for the way trout and tarpon actually eat.",
    ctaText: "Shop Rio",
    ctaUrl: "https://www.rioproducts.com?ref=flydentify",
    imageUrl: "https://images.unsplash.com/photo-1542223092-c995b2a1b7b1?w=800",
    placement: "rigging",
    waterMode: "both",
    priority: 7,
    active: 1,
  },
];

// ── Merch catalog ─────────────────────────────────────────────────────────────
export const MERCH_ITEMS = [
  {
    id: "hat-patch",
    name: "Flydentify Patch Hat",
    description: "Richardson 112 trucker. Khaki front, mesh back. Leather Flydentify patch.",
    price: 38,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600",
    tag: "Bestseller",
    inStock: true,
    sizes: null,
    colors: ["Khaki/Bark", "Navy/White", "Olive/Tan"],
  },
  {
    id: "tshirt-badge",
    name: "Flydentify Badge Tee",
    description: "100% ring-spun cotton. Chest badge print. Washed for softness.",
    price: 32,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    tag: null,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Linen", "Faded Black", "River Green"],
  },
  {
    id: "buff-merino",
    name: "Merino Wool Buff",
    description: "Midweight merino. Sun protection + warmth. Flydentify wordmark woven in.",
    price: 28,
    image: "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=600",
    tag: null,
    inStock: true,
    sizes: null,
    colors: ["Stone", "Deep Navy", "Army Green"],
  },
  {
    id: "sticker-pack",
    name: "Sticker Pack — 5-Pack",
    description: "Waterproof vinyl. Species portraits, wordmark, and the Flydentify logo.",
    price: 12,
    image: "https://images.unsplash.com/photo-1609348445017-e2e0af78acd3?w=600",
    tag: "Fan Favorite",
    inStock: true,
    sizes: null,
    colors: null,
  },
  {
    id: "mug-enamel",
    name: "Enamel Camp Mug",
    description: "12 oz enamel-coated steel. River camp ready. Flydentify badge on one side.",
    price: 24,
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600",
    tag: null,
    inStock: true,
    sizes: null,
    colors: ["Cream", "Olive"],
  },
  {
    id: "hoodie-fleece",
    name: "Flydentify Quarter-Zip Fleece",
    description: "Midlayer 100g fleece. Wrist-loop thumb holes. Embroidered chest logo.",
    price: 85,
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff9ef?w=600",
    tag: "Limited Run",
    inStock: false,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bark Brown", "Deep Slate"],
  },
];

// ── Route registration ────────────────────────────────────────────────────────

export function registerMonetizationRoutes(app: Express) {

  // Guides directory
  app.get("/api/guides", (req: Request, res: Response) => {
    const state = (req.query.state as string)?.toUpperCase();
    const mode  = req.query.mode as string;
    let results = [...GUIDES];
    if (state) results = results.filter(g => g.state === state);
    if (mode)  results = results.filter(g => g.specialty.includes(mode));
    results.sort((a, b) => b.featured - a.featured);
    res.json(results);
  });

  // Single guide
  app.get("/api/guides/:id", (req: Request, res: Response) => {
    const guide = GUIDES.find(g => g.id === parseInt(req.params.id));
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    return res.json(guide);
  });

  // Fly shops
  app.get("/api/fly-shops", (req: Request, res: Response) => {
    const state = (req.query.state as string)?.toUpperCase();
    let results = [...FLY_SHOPS];
    if (state) results = results.filter(s => s.state === state);
    results.sort((a, b) => b.featured - a.featured);
    res.json(results);
  });

  // Conservation orgs
  app.get("/api/conservation", (req: Request, res: Response) => {
    const mode = req.query.mode as string;
    let results = [...CONSERVATION_ORGS];
    if (mode === "salt") {
      results = results.filter(o => o.focusArea === "saltwater" || o.focusArea === "all");
    } else if (mode === "fresh") {
      results = results.filter(o => o.focusArea !== "saltwater");
    }
    res.json(results);
  });

  // Sponsor ads — returns contextual ad for given placement + waterMode
  app.get("/api/ads", (req: Request, res: Response) => {
    const placement = (req.query.placement as string) || "home";
    const waterMode = (req.query.mode as string) || "fresh";
    const eligible = SPONSOR_ADS.filter(ad =>
      ad.active &&
      (ad.placement === "all" || ad.placement === placement) &&
      (ad.waterMode === "both" || ad.waterMode === waterMode)
    );
    eligible.sort((a, b) => b.priority - a.priority);
    const ad = eligible[0] || null;
    res.json({ ad });
  });

  // Merch catalog
  app.get("/api/merch", (_req: Request, res: Response) => {
    res.json(MERCH_ITEMS);
  });
}
