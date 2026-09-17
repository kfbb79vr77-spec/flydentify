// ── Local Fishing Guides by Region ────────────────────────────────────────────
// Curated outfitters and guide services, one entry per region with 3-4 options

export interface FishingGuide {
  name: string;
  location: string;
  specialty: string;
  priceRange: string;       // e.g. "$450-$550/day"
  website: string;
  phone?: string;
  notes: string;            // what makes them standout
  rivers: string[];
  species: string[];
}

export const guidesByRegion: Record<string, FishingGuide[]> = {
  "Rocky Mountain / Intermountain": [
    {
      name: "Bailing Out Guide Service",
      location: "Ennis, MT",
      specialty: "Madison River drift boat & wade",
      priceRange: "$550-$650/day",
      website: "#",
      notes: "Specialists on the Madison, salmonfly, PMD, and caddis hatches. Full-day float and half-day wade options.",
      rivers: ["Madison", "Gallatin", "Jefferson"],
      species: ["Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Yellowstone Angler",
      location: "Livingston, MT",
      specialty: "Yellowstone River & spring creeks",
      priceRange: "$500-$600/day",
      website: "https://www.yellowstoneangler.com",
      notes: "30+ years guiding the Yellowstone. Spring creek access on Nelson's and Armstrong's included with some packages.",
      rivers: ["Yellowstone", "Spring Creeks", "Stillwater"],
      species: ["Cutthroat", "Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Montana Trout Outfitters",
      location: "Bozeman, MT",
      specialty: "Gallatin Canyon walk-wade",
      priceRange: "$475-$575/day",
      website: "https://www.montanatroutoutfitters.com",
      notes: "Deep Gallatin expertise. Excellent for technical dry fly fishing. Beginner-friendly instruction available.",
      rivers: ["Gallatin", "Madison", "Missouri"],
      species: ["Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Henry's Fork Anglers",
      location: "Last Chance, ID",
      specialty: "Henry's Fork technical dry fly",
      priceRange: "$500-$600/day",
      website: "https://www.henrysforkanglers.com",
      notes: "The authority on Henry's Fork. PMD and Green Drake hatches are world-class. Wading and float options.",
      rivers: ["Henry's Fork", "South Fork Snake", "Teton"],
      species: ["Rainbow Trout", "Cutthroat"],
    },
  ],

  "Pacific Northwest / Northern Rockies": [
    {
      name: "Deschutes River Outfitters",
      location: "Bend, OR",
      specialty: "Deschutes drift boat & steelhead",
      priceRange: "$500-$650/day",
      website: "https://www.deschutesriveroutfitters.com",
      notes: "Premier Deschutes operation, redside rainbow, salmonfly hatch, and fall steelhead runs.",
      rivers: ["Deschutes", "Metolius", "McKenzie"],
      species: ["Redside Rainbow", "Steelhead", "Bull Trout"],
    },
    {
      name: "The Fly Fishing Shop",
      location: "Welches, OR",
      specialty: "Sandy & Clackamas guided wade",
      priceRange: "$425-$525/day",
      website: "https://www.flyfishusa.com",
      notes: "Family operation since 1973. Unmatched local knowledge of Sandy and Clackamas systems.",
      rivers: ["Sandy", "Clackamas", "Zigzag"],
      species: ["Steelhead", "Coho", "Cutthroat"],
    },
    {
      name: "Montana Angling Company",
      location: "Missoula, MT",
      specialty: "Clark Fork & Bitterroot",
      priceRange: "$475-$575/day",
      website: "https://www.montanaanglingcompany.com",
      notes: "Specialists on the Clark Fork system. Excellent streamer and nymph fishing through Missoula.",
      rivers: ["Clark Fork", "Bitterroot", "Blackfoot"],
      species: ["Brown Trout", "Rainbow Trout", "Bull Trout"],
    },
  ],

  "Northeast / Appalachian": [
    {
      name: "Catskill Flies",
      location: "Roscoe, NY",
      specialty: "Catskill dry fly tradition",
      priceRange: "$400-$500/day",
      website: "https://www.catskillflies.com",
      notes: "Birthplace of American fly fishing. Sulphur and Hendrickson hatches are iconic. Classic upstream dry fly presentations.",
      rivers: ["Beaverkill", "Willowemoc", "Delaware"],
      species: ["Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Housatonic River Outfitters",
      location: "Cornwall Bridge, CT",
      specialty: "Housatonic tailwater",
      priceRange: "$375-$475/day",
      website: "https://www.dryflies.com",
      notes: "Expert guides on one of the East's best trout rivers. Year-round tailwater fishery with consistent caddis and sulphur hatches.",
      rivers: ["Housatonic", "Farmington"],
      species: ["Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Battenkill Anglers",
      location: "Manchester, VT",
      specialty: "Battenkill wild brown trout",
      priceRange: "$400-$500/day",
      website: "https://www.battenkillanglers.com",
      notes: "Wild brown trout in gin-clear limestone water. Technical fishing at its finest. Orvis flagship store nearby.",
      rivers: ["Battenkill", "Mettawee", "Batten Kill"],
      species: ["Wild Brown Trout"],
    },
  ],

  "Southeast / Appalachian Tailwaters": [
    {
      name: "Unicoi Outfitters",
      location: "Helen, GA",
      specialty: "Chattahoochee headwaters",
      priceRange: "$350-$450/day",
      website: "https://www.unicoioutfitters.com",
      notes: "Blue Ribbon trout water in the North Georgia mountains. Excellent sulphur and blue-winged olive hatches.",
      rivers: ["Chattahoochee", "Nantahala", "Tellico"],
      species: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    },
    {
      name: "Bennett's Creek Guide Service",
      location: "Damascus, VA",
      specialty: "South Holston tailwater",
      priceRange: "$375-$475/day",
      website: "https://www.southholstonguide.com",
      notes: "South Holston is America's best sulphur hatch, 18 hours a day in season. Phenomenal dry fly fishing.",
      rivers: ["South Holston", "Watauga", "New River"],
      species: ["Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Blue Ridge Fly Fishers",
      location: "Boone, NC",
      specialty: "High Country brook trout streams",
      priceRange: "$325-$425/day",
      website: "https://www.blueridgeflyfishers.com",
      notes: "Native Southern Appalachian brook trout on remote mountain streams. Backcountry access included.",
      rivers: ["New River", "Watauga", "Elk"],
      species: ["Brook Trout", "Brown Trout"],
    },
  ],

  "Great Lakes / Midwest": [
    {
      name: "Pere Marquette River Lodge",
      location: "Baldwin, MI",
      specialty: "Pere Marquette steelhead & brown trout",
      priceRange: "$450-$550/day",
      website: "https://www.pmrlodge.com",
      notes: "Legendary Michigan steelhead river. Spring and fall runs. World-class brown trout in summer. Float and wade.",
      rivers: ["Pere Marquette", "Muskegon", "Au Sable"],
      species: ["Steelhead", "Brown Trout", "Chinook Salmon"],
    },
    {
      name: "Au Sable Trout Unlimited Guide Service",
      location: "Grayling, MI",
      specialty: "Au Sable Holy Water",
      priceRange: "$400-$500/day",
      website: "https://michigan-streamside.com",
      notes: "The Au Sable's Holy Water is legendary Hendrickson and hex hatch water. Classic Michigan wooden canoe drift.",
      rivers: ["Au Sable", "Manistee", "Black"],
      species: ["Brown Trout", "Brook Trout"],
    },
    {
      name: "Current River Outfitters",
      location: "Van Buren, MO",
      specialty: "Ozark smallmouth & trout",
      priceRange: "$325-$425/day",
      website: "https://www.currentriveroutfitters.com",
      notes: "Crystal-clear Ozark spring rivers. Both smallmouth bass and rainbow trout. Float trip specialists.",
      rivers: ["Current River", "Eleven Point", "North Fork"],
      species: ["Rainbow Trout", "Smallmouth Bass"],
    },
  ],

  "Southwest / Desert Streams": [
    {
      name: "Arizona Flyfishing",
      location: "Payson, AZ",
      specialty: "White Mountains trout streams",
      priceRange: "$375-$475/day",
      website: "https://www.azflyfishing.com",
      notes: "Desert trout fishing at high elevation. Apache trout, Arizona's state fish, in remote wilderness streams.",
      rivers: ["White River", "Black River", "East Fork"],
      species: ["Apache Trout", "Rainbow Trout", "Brown Trout"],
    },
    {
      name: "Rio Costilla Park",
      location: "Amalia, NM",
      specialty: "Rio Grande cutthroat",
      priceRange: "$400-$500/day",
      website: "https://www.riocostilla.com",
      notes: "Private ranch fishing for Rio Grande cutthroat in northern New Mexico. Remote and uncrowded.",
      rivers: ["Rio Costilla", "Cimarron", "Red River"],
      species: ["Rio Grande Cutthroat", "Brown Trout"],
    },
    {
      name: "San Juan Guide Service",
      location: "Navajo Dam, NM",
      specialty: "San Juan tailwater",
      priceRange: "$350-$450/day",
      website: "https://www.sanjuanflyshop.com",
      notes: "San Juan below Navajo Dam is a midge-fishing paradise. 4-mile quality water with 15,000+ fish per mile.",
      rivers: ["San Juan"],
      species: ["Rainbow Trout", "Brown Trout"],
    },
  ],

  "California / Sierra Nevada": [
    {
      name: "Trout Creek Flies",
      location: "Mammoth Lakes, CA",
      specialty: "Eastern Sierra streams & lakes",
      priceRange: "$450-$550/day",
      website: "https://www.troutcreekflies.com",
      notes: "High Sierra golden trout on pack-in wilderness trips. Also walk-wade on the upper Owens and Hot Creek.",
      rivers: ["Owens River", "Hot Creek", "Upper Owens"],
      species: ["Golden Trout", "Brown Trout", "Rainbow Trout"],
    },
    {
      name: "Kiene's Fly Shop",
      location: "Sacramento, CA",
      specialty: "Sacramento River guides",
      priceRange: "$400-$500/day",
      website: "https://www.kiene.com",
      notes: "Largest fly shop in Northern California. Expert guides on the Sacramento system including Pit and McCloud.",
      rivers: ["Sacramento", "McCloud", "Pit River"],
      species: ["Rainbow Trout", "Steelhead", "Sacramento Pikeminnow"],
    },
    {
      name: "The Fly Shop",
      location: "Redding, CA",
      specialty: "Upper Sacramento & Fall River",
      priceRange: "$475-$575/day",
      website: "https://www.theflyshop.com",
      notes: "California's premier outfitter since 1978. Fall River is one of the West's great spring creek fisheries.",
      rivers: ["Upper Sacramento", "Fall River", "Hat Creek"],
      species: ["Rainbow Trout", "Brown Trout", "Steelhead"],
    },
  ],

  "Alaska / Pacific": [
    {
      name: "Alaska Trophy Adventures Lodge",
      location: "King Salmon, AK",
      specialty: "Kvichak & Naknek salmon & trout",
      priceRange: "$900-$1,200/day",
      website: "https://www.alaskatrophyadventures.com",
      notes: "World-class rainbow trout following sockeye runs. Remote fly-out access to dozens of Bristol Bay rivers.",
      rivers: ["Kvichak", "Naknek", "Alagnak"],
      species: ["Rainbow Trout", "Sockeye Salmon", "Chinook", "Arctic Grayling"],
    },
    {
      name: "Kenai River Guides",
      location: "Cooper Landing, AK",
      specialty: "Kenai River kings & sockeye",
      priceRange: "$700-$900/day",
      website: "https://www.kenairiverguides.com",
      notes: "Kenai Peninsula's top guide service. World-record Chinook water. Sockeye in July is off the charts.",
      rivers: ["Kenai", "Russian River", "Kasilof"],
      species: ["Chinook Salmon", "Sockeye", "Rainbow Trout", "Dolly Varden"],
    },
    {
      name: "Alaska West",
      location: "Quinhagak, AK",
      specialty: "Kanektok remote fly-out",
      priceRange: "$1,100-$1,400/day",
      website: "https://www.alaskawest.com",
      notes: "The Kanektok is one of the last great untouched rainbow rivers in Alaska. Multi-species float camp operation.",
      rivers: ["Kanektok", "Goodnews", "Arolik"],
      species: ["Rainbow Trout", "Chum Salmon", "Coho", "Arctic Char"],
    },
  ],
};

// Map snake_case region keys → human-readable keys used in guidesByRegion
const guideRegionKeyMap: Record<string, string> = {
  montana_rockies: "Rocky Mountain / Intermountain",
  pacific_northwest: "Pacific Northwest / Northern Rockies",
  northeast: "Northeast / Appalachian",
  appalachian_east: "Northeast / Appalachian",
  southeast: "Southeast / Appalachian Tailwaters",
  great_lakes: "Great Lakes / Midwest",
  great_plains: "Great Lakes / Midwest",
  southwest: "Southwest / Desert Streams",
  california: "California / Sierra Nevada",
  alaska: "Alaska / Pacific",
};

export function getGuidesForRegion(region: string): FishingGuide[] {
  return guidesByRegion[region] ?? guidesByRegion[guideRegionKeyMap[region]] ?? [];
}
