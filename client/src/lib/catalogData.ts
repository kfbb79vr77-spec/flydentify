/**
 * catalogData.ts
 * Static fallback data for guides, fly shops, conservation orgs, and merch.
 * These are embedded in the frontend bundle so pages render instantly
 * even before the Express backend warms up.
 * The API routes may augment this data later (user-submitted guides, etc.)
 */

export const GUIDES_DATA = [
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
    state: "CO", region: "South Park / South Platte", lat: 38.9483, lon: -105.7283,
    specialty: ["fresh"], targetSpecies: ["Brown Trout", "Rainbow Trout"],
    homeWater: "South Platte River", rateHalfDay: 325, rateFullDay: 525,
    bio: "Born and raised in South Park. Gold Medal water specialist. Trico and PMD dry-fly instruction a specialty.",
    website: "https://blueribbonflyfishing.co", instagram: "@blueribbonco",
    isAffiliate: 1, affiliateCode: "FLYD-CO01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400",
  },
  {
    id: 3, name: "Sarah Linberg", businessName: "Tides & Tails Guide Co.",
    state: "FL", region: "Florida Keys", lat: 24.7102, lon: -81.1003,
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
    state: "NM", region: "Northern New Mexico", lat: 36.5778, lon: -105.6725,
    specialty: ["fresh"], targetSpecies: ["Brown Trout", "Rainbow Trout", "Cutthroat"],
    homeWater: "Rio Grande Gorge", rateHalfDay: 300, rateFullDay: 475,
    bio: "Third generation New Mexican. The Gorge is his backyard. Canyon streamer fishing and dry-dropper rigs on remote water only locals know.",
    website: "https://riograndeflyfishing.com", instagram: undefined,
    isAffiliate: 1, affiliateCode: "FLYD-NM01", featured: 0,
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
  {
    id: 5, name: "Marcus Webb", businessName: "Lowcountry Fly Fishing",
    state: "SC", region: "Lowcountry / ACE Basin", lat: 32.6657, lon: -80.6065,
    specialty: ["salt"], targetSpecies: ["Redfish", "Speckled Trout", "Cobia"],
    homeWater: "ACE Basin marshes", rateHalfDay: 375, rateFullDay: 625,
    bio: "Pole and troll, mostly pole. Marcus specializes in tailing redfish on spartina grass flats. No motor, no crowds.",
    website: "https://lowcountryflyfishing.com", instagram: "@lowcountryfly",
    isAffiliate: 1, affiliateCode: "FLYD-SC01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  },
  {
    id: 6, name: "Tyler Hawn", businessName: "Deschutes Canyon Outfitters",
    state: "OR", region: "Central Oregon", lat: 44.5957, lon: -121.1578,
    specialty: ["fresh"], targetSpecies: ["Steelhead", "Rainbow Trout", "Cutthroat"],
    homeWater: "Deschutes River", rateHalfDay: 400, rateFullDay: 650,
    bio: "Deschutes Steelhead guide and fly-fishing instructor. Spey casting clinics offered October through December. Dry-line swinging only, no weight, no indicator.",
    website: "https://deschutesflyguide.com", instagram: "@deschutesfly",
    isAffiliate: 1, affiliateCode: "FLYD-OR01", featured: 1,
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  },
];

export const FLY_SHOPS_DATA = [
  {
    id: 1, name: "The Blue Ribbon Flies", state: "WY", city: "West Yellowstone",
    lat: 44.6627, lon: -111.1013, website: "https://blueribbon.com",
    affiliateUrl: "https://blueribbon.com?ref=flydentify", affiliateCode: "FLYD", commissionPct: 8,
    description: "West Yellowstone's original fly shop. Full guide service, rental gear, custom flies tied for the Madison, Firehole, and Gallatin.",
    specialties: ["Yellowstone area", "Spring creeks", "Float trips"],
    brands: ["Orvis", "Simms", "Scott", "Abel"], featured: 1,
  },
  {
    id: 2, name: "Orvis Houston", state: "TX", city: "Houston",
    lat: 29.7499, lon: -95.4571, website: "https://orvis.com/retail/houston",
    affiliateUrl: "https://orvis.com?AID=flydentify", affiliateCode: "FLYD", commissionPct: 10,
    description: "Full-service Orvis retail store. Rod and reel demos, casting lessons, guided coastal saltwater trips to Galveston Bay.",
    specialties: ["Saltwater fly fishing", "Casting instruction", "Gear fitting"],
    brands: ["Orvis", "Patagonia", "Costa"], featured: 1,
  },
  {
    id: 3, name: "Trouts Fly Fishing", state: "CO", city: "Denver",
    lat: 39.7514, lon: -105.0019, website: "https://troutsflyfishing.com",
    affiliateUrl: "https://troutsflyfishing.com?ref=flydentify", affiliateCode: "FLYD", commissionPct: 8,
    description: "Denver's premier fly shop. Guide service on South Platte, Blue River, and Colorado tailwaters. Classes for every level.",
    specialties: ["Colorado tailwaters", "Gold Medal rivers", "Trico fishing"],
    brands: ["Simms", "Sage", "Rio", "Dr. Slick"], featured: 1,
  },
  {
    id: 4, name: "Rocky Mountain Fly Shop", state: "ID", city: "Idaho Falls",
    lat: 43.4917, lon: -112.0401, website: "https://rockymtnflyshop.com",
    affiliateUrl: "https://rockymtnflyshop.com?source=flydentify", affiliateCode: "FLYD", commissionPct: 7,
    description: "Henry's Fork, South Fork Snake, Teton River. This shop knows all three. Expert staff, full guide roster.",
    specialties: ["Henry's Fork", "South Fork Snake", "Callibaetis"],
    brands: ["Sage", "Scott", "Winston", "Simms"], featured: 0,
  },
  {
    id: 5, name: "Saltwater Edge", state: "RI", city: "Middletown",
    lat: 41.5170, lon: -71.2828, website: "https://saltwateredge.com",
    affiliateUrl: "https://saltwateredge.com?ref=flydentify", affiliateCode: "FLYD", commissionPct: 8,
    description: "The Northeast's saltwater fly fishing authority. Striped bass, bluefish, false albacore, bonito. Fly tying materials and guide trips.",
    specialties: ["Striped bass", "False albacore", "Northeast saltwater"],
    brands: ["Orvis", "Abel", "Sage", "Costa"], featured: 1,
  },
  {
    id: 6, name: "Tight Lines Fly Shop", state: "WI", city: "De Pere",
    lat: 44.4483, lon: -88.0596, website: "https://tightlinesflyfishing.com",
    affiliateUrl: "https://tightlinesflyfishing.com?ref=flydentify", affiliateCode: "FLYD", commissionPct: 7,
    description: "Midwest specialty shop. Trout, smallmouth, and carp on the fly. Great Lakes steelhead guide service fall through spring.",
    specialties: ["Great Lakes steelhead", "Carp on the fly", "Smallmouth bass"],
    brands: ["G. Loomis", "Patagonia", "Rio", "Simms"], featured: 0,
  },
];

export const CONSERVATION_DATA = [
  {
    id: 1, name: "Trout Unlimited", shortName: "TU",
    mission: "Conserve, protect, and restore North America's coldwater fisheries and their watersheds.",
    website: "https://www.tu.org",
    donateUrl: "https://www.tu.org/donate/?source=flydentify",
    membershipUrl: "https://www.tu.org/membership/?source=flydentify",
    focusArea: "trout", national: 1, flydentifyDonatesPct: 10,
  },
  {
    id: 2, name: "Bonefish & Tarpon Trust", shortName: "BTT",
    mission: "Conserving bonefish, tarpon, and permit and their habitats through research, stewardship, and education.",
    website: "https://www.bonefishtarpontrust.org",
    donateUrl: "https://www.bonefishtarpontrust.org/donate/?ref=flydentify",
    membershipUrl: "https://www.bonefishtarpontrust.org/join/?ref=flydentify",
    focusArea: "saltwater", national: 1, flydentifyDonatesPct: 10,
  },
  {
    id: 3, name: "The Nature Conservancy", shortName: "TNC",
    mission: "Protecting freshwater ecosystems and the rivers, lakes, and wetlands that sustain fish and fishermen.",
    website: "https://www.nature.org/freshwater",
    donateUrl: "https://www.nature.org/donate/?ref=flydentify",
    membershipUrl: "https://www.nature.org/membership/?ref=flydentify",
    focusArea: "all", national: 1, flydentifyDonatesPct: 5,
  },
  {
    id: 4, name: "Wild Steelhead Coalition", shortName: "WSC",
    mission: "Preserving and restoring wild steelhead populations throughout the Pacific Northwest.",
    website: "https://wildsteelheadcoalition.org",
    donateUrl: "https://wildsteelheadcoalition.org/donate/?ref=flydentify",
    membershipUrl: "https://wildsteelheadcoalition.org/join/?ref=flydentify",
    focusArea: "steelhead", national: 0, state: "WA", flydentifyDonatesPct: 10,
  },
  {
    id: 5, name: "Coastal Conservation Association", shortName: "CCA",
    mission: "Protecting the marine, wetlands, and coastal resources of the US for future generations.",
    website: "https://www.joincca.org",
    donateUrl: "https://www.joincca.org/donate/?ref=flydentify",
    membershipUrl: "https://www.joincca.org/membership/?ref=flydentify",
    focusArea: "saltwater", national: 1, flydentifyDonatesPct: 8,
  },
];

export const MERCH_DATA = [
  {
    id: "hat-navy", name: "Flydentify Fitted Cap",
    description: "Navy structured cap with embroidered Flydentify script logo. Low-profile, medium-crown. One size fits most.",
    price: 38,
    image: "/merch/hat.png",
    tag: "Bestseller", inStock: true, sizes: null,
    colors: ["Navy"],
  },
  {
    id: "hat-trucker", name: "Flydentify Trucker Hat",
    description: "Navy front panel, white mesh back. Snapback fit. Embroidered Flydentify script logo.",
    price: 36,
    image: "/merch/hat_trucker.png",
    tag: null, inStock: true, sizes: null,
    colors: ["Navy/White"],
  },
  {
    id: "tshirt-navy", name: "Flydentify Script Tee",
    description: "100% ring-spun cotton. Left-chest embroidered Flydentify script. Relaxed fit.",
    price: 34,
    image: "/merch/tee.png",
    tag: null, inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy"],
  },
];
