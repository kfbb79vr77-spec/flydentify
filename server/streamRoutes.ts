/**
 * streamRoutes.ts
 *
 * All 50-state stream intelligence routes for Flydentify.
 * Sources: USGS NWIS (live gauges), EPA ATTAINS (water quality),
 *          State DNR data (trout designations, species, regulations).
 *
 * Routes:
 *   GET /api/streams/nearby       — nearest gauged streams to lat/lon
 *   GET /api/streams/detail/:id   — deep drill-down on one USGS gauge
 *   GET /api/streams/state/:abbr  — all gauges + DNR info for a state
 *   GET /api/streams/search       — search streams by name
 *   GET /api/streams/trout-states — all 50 state DNR trout summaries
 */

import type { Express } from "express";

// ── Cache helpers (mirrored from routes.ts pattern) ──────────────────────────
const _cache: Map<string, { data: unknown; expires: number }> = new Map();
function cacheGet(key: string): unknown | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { _cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key: string, data: unknown, ttlSeconds = 900): void {
  _cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

// ── USGS state FIPS code -> 2-letter abbr ───────────────────────────────────
const FIPS_TO_STATE: Record<string, string> = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS",
  "21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS",
  "29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY",
  "37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC",
  "46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV",
  "55":"WI","56":"WY",
};

// ── All 50-state trout/fishery database ─────────────────────────────────────
// Source: State DNR databases, USGS, TroutSpotr, PFBC, etc.
export const ALL_STATE_TROUT: Record<string, {
  name: string;
  agency: string;
  agencyUrl: string;
  licenseUrl: string;
  notes: string;
  topWaters: string[];
  species: string[];
  regulations: string;
  season: string;
  goldMedal?: string;
}> = {
  AL: {
    name: "Alabama", agency: "Alabama DCNR", agencyUrl: "https://www.outdooralabama.com",
    licenseUrl: "https://www.outdooralabama.com/licenses-and-fees",
    notes: "Tailwater fisheries below dams. Sipsey Fork is the standout coldwater stream.",
    topWaters: ["Sipsey Fork", "Little River Canyon", "Talladega Creek"],
    species: ["Rainbow Trout", "Brown Trout"],
    regulations: "Statewide trout season year-round on designated waters. Check DCNR for slot limits.",
    season: "Year-round on tailwaters",
  },
  AK: {
    name: "Alaska", agency: "Alaska Department of Fish & Game", agencyUrl: "https://www.adfg.alaska.gov",
    licenseUrl: "https://www.adfg.alaska.gov/index.cfm?adfg=license.main",
    notes: "World-class wilderness fisheries. King salmon, steelhead, rainbow trout in remote drainages.",
    topWaters: ["Kenai River", "Naknek River", "Karluk River", "Anchor River", "Russian River"],
    species: ["Rainbow Trout", "Steelhead", "Dolly Varden", "Arctic Char", "Arctic Grayling", "Lake Trout"],
    regulations: "Species and drainage-specific. King salmon require separate stamp. Check ADF&G annually.",
    season: "Varies by drainage. Summer peak June-September.",
    goldMedal: "Kenai River — trophy rainbow and king salmon",
  },
  AZ: {
    name: "Arizona", agency: "Arizona Game & Fish Department", agencyUrl: "https://www.azgfd.com",
    licenseUrl: "https://www.azgfd.com/licensing/",
    notes: "Oak Creek, Black River, White Mountain streams. Apache Trout is Arizona's state fish and an endangered endemic.",
    topWaters: ["Oak Creek", "Black River", "White River", "Little Colorado River", "Blue River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Apache Trout"],
    regulations: "Apache Trout catch-and-release only on many waters. Check AZGFD for White Mountain designations.",
    season: "Year-round on most designated trout waters",
    goldMedal: "Black River — wild brown and rainbow",
  },
  AR: {
    name: "Arkansas", agency: "Arkansas Game & Fish Commission", agencyUrl: "https://www.agfc.com",
    licenseUrl: "https://www.agfc.com/en/resources/licenses-permits/",
    notes: "White River and Norfork River below Bull Shoals and Norfork Dams are world-class trophy tailwaters producing 20+ lb browns.",
    topWaters: ["White River", "Norfork River", "Little Red River", "Spring River", "Crooked Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
    regulations: "Catch-and-release and special harvest zones on White River. Trophy sections have slot limits.",
    season: "Year-round",
    goldMedal: "White River — world record brown trout water",
  },
  CA: {
    name: "California", agency: "CA Department of Fish & Wildlife", agencyUrl: "https://wildlife.ca.gov",
    licenseUrl: "https://www.wildlife.ca.gov/Licensing",
    notes: "Sacramento, McCloud, Pit, East Walker, Hot Creek. Wild steelhead in coastal rivers. Golden Trout Wilderness.",
    topWaters: ["Sacramento River", "McCloud River", "Hat Creek", "Hot Creek", "East Walker River", "Owens River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Golden Trout", "Steelhead", "Bull Trout"],
    regulations: "Wild trout regulations vary by water. McCloud is catch-and-release barbless. Check CDFW regulations booklet.",
    season: "Last Saturday in April through November 15 on most waters. Catch-and-release year-round on designated wild trout waters.",
    goldMedal: "Hat Creek — California's premier dry-fly stream",
  },
  CO: {
    name: "Colorado", agency: "Colorado Parks & Wildlife", agencyUrl: "https://cpw.state.co.us",
    licenseUrl: "https://cpw.state.co.us/buyapply/Pages/Fishing.aspx",
    notes: "Gold Medal waters: South Platte, Frying Pan, Arkansas, Colorado River. Over 9,000 miles of trout streams.",
    topWaters: ["Fryingpan River", "South Platte River", "Arkansas River", "Gunnison River", "Blue River", "Colorado River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Cutthroat Trout"],
    regulations: "Gold Medal waters require fly/lure only, catch-and-release. Check CPW for current Gold Medal designations.",
    season: "Year-round on most waters",
    goldMedal: "Fryingpan River — tailwater midge factory below Ruedi Reservoir",
  },
  CT: {
    name: "Connecticut", agency: "CT DEEP Fisheries Division", agencyUrl: "https://portal.ct.gov/DEEP",
    licenseUrl: "https://portal.ct.gov/DEEP/Fishing/Freshwater-Fishing/Fishing-Licenses",
    notes: "Farmington River TMA is the flagship. Housatonic River in the Berkshires. Strong wild brown trout.",
    topWaters: ["Farmington River", "Housatonic River", "Salmon River", "Willimantic River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "TMA sections: fly fishing only, catch-and-release. Farmington TMA is year-round.",
    season: "April through February. Year-round on TMA sections.",
    goldMedal: "Farmington River TMA — Connecticut's blue-ribbon trout management area",
  },
  DE: {
    name: "Delaware", agency: "DNREC Division of Fish & Wildlife", agencyUrl: "https://dnrec.delaware.gov",
    licenseUrl: "https://dnrec.delaware.gov/fish-wildlife/freshwater/",
    notes: "Limited coldwater habitat. Brandywine Creek and Red Clay Creek are the primary trout fisheries.",
    topWaters: ["Brandywine Creek", "Red Clay Creek", "White Clay Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Stocked trout season spring and fall. Check DNREC for current regulations.",
    season: "Spring stocking begins in March. Some year-round sections.",
  },
  FL: {
    name: "Florida", agency: "Florida Fish & Wildlife Conservation Commission", agencyUrl: "https://myfwc.com",
    licenseUrl: "https://myfwc.com/license/recreational/",
    notes: "No coldwater trout fishery. Panhandle spring-fed rivers offer some stocked rainbow trout in winter. Saltwater fishing is world-class.",
    topWaters: ["Coldwater Creek", "Blackwater River", "Juniper Creek"],
    species: ["Rainbow Trout (stocked)"],
    regulations: "Check FWC for stocking schedules. Saltwater fishing licenses required for coastal species.",
    season: "November through March for stocked trout",
  },
  GA: {
    name: "Georgia", agency: "GA DNR Wildlife Resources Division", agencyUrl: "https://georgiawildlife.com",
    licenseUrl: "https://georgiawildlife.com/fishing/licenses",
    notes: "Blue Ridge Mountains hold quality trout water. Chattooga River is legendary. Chestatee and Toccoa are premier streams.",
    topWaters: ["Chattooga River", "Chestatee River", "Toccoa River", "Conasauga River", "Fightingtown Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Delayed harvest sections: artificial only, catch-and-release October through May.",
    season: "Year-round on most trout waters",
    goldMedal: "Toccoa River tailwater — trophy brown trout",
  },
  HI: {
    name: "Hawaii", agency: "DLNR Division of Aquatic Resources", agencyUrl: "https://dlnr.hawaii.gov/dar/",
    licenseUrl: "https://dlnr.hawaii.gov/dar/fishing/freshwater-fishing/",
    notes: "Kokee Stream on Kauai is the only trout water in Hawaii. Open only in July and August.",
    topWaters: ["Kokee Stream (Kauai)"],
    species: ["Rainbow Trout (stocked)"],
    regulations: "Trout season is limited: July and August only. Fishing license required.",
    season: "July and August only",
  },
  ID: {
    name: "Idaho", agency: "Idaho Department of Fish & Game", agencyUrl: "https://idfg.idaho.gov",
    licenseUrl: "https://idfg.idaho.gov/licenses",
    notes: "Silver Creek is a technical spring creek. Henry's Fork is a pilgrimage water. Steelhead in the Clearwater and Salmon.",
    topWaters: ["Henry's Fork", "Silver Creek", "South Fork Snake River", "Boise River", "Clearwater River", "Salmon River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Cutthroat Trout", "Bull Trout", "Steelhead"],
    regulations: "Bull Trout are catch-and-release only. Steelhead require separate permit. Henry's Fork has special regulations.",
    season: "General season: last Saturday in May through November 30. Year-round on some tailwaters.",
    goldMedal: "Henry's Fork — Box Canyon wild rainbow trout",
  },
  IL: {
    name: "Illinois", agency: "IDNR Fisheries Division", agencyUrl: "https://www2.illinois.gov/dnr/fishing",
    licenseUrl: "https://www2.illinois.gov/dnr/fishing/Pages/license.aspx",
    notes: "Limited coldwater habitat. Spring creeks in Jo Daviess County in the northwest Driftless area.",
    topWaters: ["Apple River", "Galena River", "Smallpox Creek"],
    species: ["Rainbow Trout (stocked)", "Brown Trout"],
    regulations: "Stocked trout season. Check IDNR for current regulations.",
    season: "Spring stocking, some fall stocking",
  },
  IN: {
    name: "Indiana", agency: "IDNR Division of Fish & Wildlife", agencyUrl: "https://www.in.gov/dnr/fish-and-wildlife/",
    licenseUrl: "https://www.in.gov/dnr/fish-and-wildlife/fishing/fishing-licenses/",
    notes: "Spring stocking program in park lakes and some streams. Tippecanoe River is the primary trout destination.",
    topWaters: ["Tippecanoe River", "Indiana Dunes area streams"],
    species: ["Rainbow Trout (stocked)", "Brown Trout"],
    regulations: "Standard statewide trout regulations apply. Check IDNR annually.",
    season: "Spring through fall stocking seasons",
  },
  IA: {
    name: "Iowa", agency: "Iowa DNR Fisheries Bureau", agencyUrl: "https://www.iowadnr.gov/fishing",
    licenseUrl: "https://www.iowadnr.gov/fishing/fishing-licenses",
    notes: "Northeast Iowa's Driftless Area holds the best trout streams. Over 100 spring-fed limestone streams.",
    topWaters: ["Upper Iowa River", "Yellow River", "Turkey River", "Bloody Run Creek", "Trout River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Special regulations on designated wild trout streams. Some catch-and-release sections.",
    season: "Year-round on most cold-water streams",
    goldMedal: "Bloody Run Creek — wild brown trout spring creek",
  },
  KS: {
    name: "Kansas", agency: "Kansas Dept of Wildlife & Parks", agencyUrl: "https://ksoutdoors.com",
    licenseUrl: "https://ksoutdoors.com/Fishing/Fishing-License-Requirements",
    notes: "Fall and winter trout stocking program at designated state park lakes.",
    topWaters: ["Milford Lake", "Cheney Reservoir area"],
    species: ["Rainbow Trout (stocked)"],
    regulations: "Standard statewide regulations. Fall stocking program November through March.",
    season: "November through March",
  },
  KY: {
    name: "Kentucky", agency: "KY Dept of Fish & Wildlife Resources", agencyUrl: "https://fw.ky.gov",
    licenseUrl: "https://fw.ky.gov/Fish/Pages/Fishing-Licenses.aspx",
    notes: "Cumberland River below Wolf Creek Dam is a quality tailwater. Also Hatchery Creek.",
    topWaters: ["Cumberland River", "Hatchery Creek", "Lake Cumberland tributaries"],
    species: ["Rainbow Trout", "Brown Trout"],
    regulations: "Special regulations on Hatchery Creek: fly only, catch-and-release. Check KDFWR.",
    season: "Year-round on tailwaters",
    goldMedal: "Hatchery Creek — fly-only catch-and-release tailwater",
  },
  LA: {
    name: "Louisiana", agency: "LA Dept of Wildlife & Fisheries", agencyUrl: "https://www.wlf.louisiana.gov",
    licenseUrl: "https://www.wlf.louisiana.gov/fishing/fishing-license",
    notes: "No coldwater trout habitat. Coastal fishery is world-class: redfish, speckled trout, flounder on the flats.",
    topWaters: ["Lake Borgne", "Barataria Bay", "Vermilion Bay", "Calcasieu Lake", "Chandeleur Islands"],
    species: ["Spotted Seatrout", "Red Drum (Redfish)", "Flounder", "Striped Bass"],
    regulations: "Saltwater license required. Check LDWF for current red drum slot limits and trout size limits.",
    season: "Year-round saltwater",
  },
  ME: {
    name: "Maine", agency: "Maine DIF&W", agencyUrl: "https://www.maine.gov/ifw/fishing/",
    licenseUrl: "https://www.maine.gov/ifw/fishing/licenses.html",
    notes: "Kennebec, Penobscot, Rapid River, Rangeley Lakes region. Wild brook trout fishing is Maine's hallmark.",
    topWaters: ["Kennebec River", "Penobscot River", "Rapid River", "Moose River", "West Branch Penobscot"],
    species: ["Brook Trout", "Brown Trout", "Rainbow Trout", "Lake Trout", "Landlocked Salmon"],
    regulations: "Rapid River special regulations. Many remote ponds fly-fishing only. Check IFW fishing regulations.",
    season: "April 1 through September 30 (general). Some waters open year-round.",
    goldMedal: "Rapid River — remote wild brook trout and landlocked salmon",
  },
  MD: {
    name: "Maryland", agency: "MD DNR Fisheries Service", agencyUrl: "https://dnr.maryland.gov/fisheries/",
    licenseUrl: "https://dnr.maryland.gov/fisheries/Pages/licenses-stamps/",
    notes: "Savage River and Big Hunting Creek (FDR's home water). Gunpowder Falls tailwater in Baltimore County.",
    topWaters: ["Savage River", "Gunpowder Falls", "Big Hunting Creek", "Patuxent River headwaters"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Savage River special regulations section. Gunpowder Falls catch-and-release on some sections.",
    season: "Year-round on designated streams",
    goldMedal: "Savage River — Maryland's premier wild trout river",
  },
  MA: {
    name: "Massachusetts", agency: "MassWildlife Fisheries", agencyUrl: "https://www.mass.gov/masswildlife",
    licenseUrl: "https://www.mass.gov/how-to/buy-or-renew-a-massachusetts-fishing-license",
    notes: "Deerfield River and its tributaries. Westfield and Millers Rivers offer good trout fishing.",
    topWaters: ["Deerfield River", "Westfield River", "Millers River", "Swift River", "Farmington River (CT border)"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Catch-and-release only sections on Swift River and parts of Deerfield. Check MassWildlife.",
    season: "April 1 through November 30 (general). Year-round catch-and-release on some waters.",
    goldMedal: "Swift River — trophy tailwater below Quabbin Reservoir",
  },
  MI: {
    name: "Michigan", agency: "MDNR Fisheries Division", agencyUrl: "https://www.michigan.gov/dnr/managing-resources/fisheries",
    licenseUrl: "https://www.michigan.gov/dnr/licenses-and-permits/fishing",
    notes: "Au Sable, Manistee, Pere Marquette, Muskegon. Michigan has more blue-ribbon trout streams than almost any state.",
    topWaters: ["Au Sable River", "Manistee River", "Pere Marquette River", "Muskegon River", "Boardman River", "Jordan River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Steelhead", "Lake Trout"],
    regulations: "Special regulations on Au Sable Holy Waters (catch-and-release, flies only). Check MDNR.",
    season: "Last Saturday in April through September 30 (general). Year-round on designated streams.",
    goldMedal: "Au Sable River Holy Waters — Michigan's legendary catch-and-release dry-fly stretch",
  },
  MN: {
    name: "Minnesota", agency: "MN DNR Fisheries Section", agencyUrl: "https://www.dnr.state.mn.us/fishing/",
    licenseUrl: "https://www.dnr.state.mn.us/licenses/fishing/index.html",
    notes: "Southeast Minnesota's Driftless Area spring creeks are world-class. Root River tributaries, Whitewater.",
    topWaters: ["Whitewater River", "Root River", "Rush Creek", "Hay Creek", "Canfield Creek", "Trout Run Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Class 1, 2, and 3 trout stream designations with different regulations. Check MN DNR.",
    season: "Stream trout season: April through September in most zones",
    goldMedal: "Root River system — Driftless spring creek brown trout",
  },
  MS: {
    name: "Mississippi", agency: "MDWFP Fisheries Bureau", agencyUrl: "https://www.mdwfp.com/fishing.aspx",
    licenseUrl: "https://www.mdwfp.com/license-permits/",
    notes: "No significant coldwater trout habitat. Limited stocking at state parks. Excellent warm and salt water fishing.",
    topWaters: ["Natchez Trace Parkway streams (stocked)"],
    species: ["Rainbow Trout (stocked, seasonal)"],
    regulations: "Park-only stocking programs. Check MDWFP for locations and dates.",
    season: "Winter stocking November through March",
  },
  MO: {
    name: "Missouri", agency: "Missouri Dept of Conservation", agencyUrl: "https://mdc.mo.gov/fishing",
    licenseUrl: "https://mdc.mo.gov/licenses",
    notes: "The four Missouri trout parks (Bennett Spring, Roaring River, Montauk, Maramec Spring) are unique and well-managed.",
    topWaters: ["Bennett Spring", "Roaring River", "Montauk State Park", "Maramec Spring", "North Fork of White River"],
    species: ["Rainbow Trout", "Brown Trout"],
    regulations: "Trout parks have specific daily limits and regulations. North Fork has catch-and-release sections.",
    season: "March 1 through October 31 at trout parks. North Fork: year-round catch-and-release section.",
    goldMedal: "North Fork of White River — wild brown trout Ozark spring creek",
  },
  MT: {
    name: "Montana", agency: "MT Fish Wildlife & Parks", agencyUrl: "https://fwp.mt.gov/fishing",
    licenseUrl: "https://fwp.mt.gov/buyandapply/fishing",
    notes: "The gold standard. Madison, Missouri, Beaverhead, Big Hole, Gallatin, Yellowstone. More blue-ribbon water per mile than anywhere.",
    topWaters: ["Madison River", "Missouri River", "Beaverhead River", "Big Hole River", "Gallatin River", "Yellowstone River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Cutthroat Trout", "Bull Trout", "Arctic Grayling"],
    regulations: "Bull Trout catch-and-release only statewide. Some rivers have closure periods for cutthroat. Check FWP.",
    season: "Third Saturday in May through November 30 (general). Year-round on tailwaters.",
    goldMedal: "Madison River — world-class dry fly water, 50-mile long riffle",
  },
  NE: {
    name: "Nebraska", agency: "Nebraska Game & Parks Commission", agencyUrl: "https://outdoornebraska.gov/fishing/",
    licenseUrl: "https://outdoornebraska.gov/licenses/",
    notes: "Niobrara River and Pine Ridge region streams. Snake River in the Nebraska Sandhills.",
    topWaters: ["Niobrara River", "Snake River (Sandhills)", "Medicine Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Standard statewide trout regulations. Check NGPC for updated rules.",
    season: "Year-round on Niobrara and designated streams",
  },
  NV: {
    name: "Nevada", agency: "Nevada Dept of Wildlife", agencyUrl: "https://www.ndow.org/fish/",
    licenseUrl: "https://www.ndow.org/licenses-tags-permits/",
    notes: "Walker River, Truckee River, East Fork Carson River. Ruby Mountains streams hold Lahontan cutthroat.",
    topWaters: ["Walker River", "Truckee River", "East Fork Carson River", "Humboldt River headwaters"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Lahontan Cutthroat Trout"],
    regulations: "Lahontan Cutthroat Trout: catch-and-release on some waters. Check NDOW for current rules.",
    season: "Year-round on most trout waters",
  },
  NH: {
    name: "New Hampshire", agency: "NH Fish & Game Department", agencyUrl: "https://www.wildlife.nh.gov/fishing/",
    licenseUrl: "https://www.wildlife.nh.gov/licenses-and-permits/",
    notes: "Connecticut River, Androscoggin River, Swift Diamond, and upper Connecticut tributaries hold quality trout.",
    topWaters: ["Connecticut River", "Androscoggin River", "Swift Diamond River", "Saco River", "Merrimack River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Lake Trout"],
    regulations: "Some waters have fly-fishing only and catch-and-release sections. Check NH Fish & Game.",
    season: "January 1 through October 15 (general). Some waters year-round.",
  },
  NJ: {
    name: "New Jersey", agency: "NJ Div of Fish & Wildlife", agencyUrl: "https://www.nj.gov/dep/fgw/fishing.htm",
    licenseUrl: "https://www.nj.gov/dep/fgw/fishlicn.htm",
    notes: "South Branch Raritan, Musconetcong, Big Flat Brook. New Jersey has excellent stocked and wild trout.",
    topWaters: ["South Branch Raritan River", "Musconetcong River", "Big Flat Brook", "Pequest River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Wild trout streams have special regulations. Check NJ DFW annually.",
    season: "Second Saturday in April through September 1 (general). Year-round catch-and-release on some waters.",
  },
  NM: {
    name: "New Mexico", agency: "NM Dept of Game & Fish", agencyUrl: "https://www.wildlife.state.nm.us/fishing/",
    licenseUrl: "https://www.wildlife.state.nm.us/licensing/",
    notes: "San Juan River tailwater is world-class. Red River, Cimarron, Pecos, Gila hold wild trout.",
    topWaters: ["San Juan River", "Red River", "Cimarron River", "Pecos River", "Gila River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Rio Grande Cutthroat Trout"],
    regulations: "San Juan special regulations: catch-and-release section below Navajo Dam. Check NMDGF.",
    season: "Year-round on most waters",
    goldMedal: "San Juan River — world-class tailwater below Navajo Dam",
  },
  NY: {
    name: "New York", agency: "NYSDEC Division of Fish & Wildlife", agencyUrl: "https://www.dec.ny.gov/outdoor/fishing.html",
    licenseUrl: "https://www.dec.ny.gov/permits/6091.html",
    notes: "The Catskills are the birthplace of American dry fly fishing. Beaverkill, Willowemoc, Delaware. Ausable on the Adirondacks.",
    topWaters: ["Beaverkill River", "Willowemoc Creek", "Delaware River (East & West Branches)", "Ausable River", "Battenkill River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Steelhead", "Lake Trout"],
    regulations: "Catch-and-release sections on Beaverkill and Willowemoc (Catskill TMA). Check NYSDEC.",
    season: "April 1 through November 30 (general). Year-round catch-and-release on special sections.",
    goldMedal: "Beaverkill & Willowemoc — Catskill TMA, birthplace of American dry fly fishing",
  },
  NC: {
    name: "North Carolina", agency: "NC Wildlife Resources Commission", agencyUrl: "https://www.ncwildlife.org/fishing",
    licenseUrl: "https://www.ncwildlife.org/licensing",
    notes: "Blue Ridge Mountain streams. Davidson River, Nantahala, Chattooga. Delayed Harvest program is strong.",
    topWaters: ["Davidson River", "Nantahala River", "Chattooga River", "South Mills River", "Wilson Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Delayed Harvest (catch-and-release, artificials only) October through May on designated waters.",
    season: "Year-round on most designated trout waters",
    goldMedal: "Davidson River — Pisgah National Forest, technical dry fly water",
  },
  ND: {
    name: "North Dakota", agency: "ND Game & Fish Department", agencyUrl: "https://gf.nd.gov/fishing",
    licenseUrl: "https://gf.nd.gov/licensing",
    notes: "Limited trout habitat. Some streams in the Turtle Mountains and Sheyenne River. Stocking programs at parks.",
    topWaters: ["Sheyenne River", "Heart River", "Little Missouri River"],
    species: ["Rainbow Trout (stocked)", "Brown Trout"],
    regulations: "Standard statewide regulations. Check ND Game & Fish for stocking locations.",
    season: "Spring and fall stocking seasons",
  },
  OH: {
    name: "Ohio", agency: "Ohio Dept of Natural Resources", agencyUrl: "https://ohiodnr.gov/fishing",
    licenseUrl: "https://ohiodnr.gov/buy-and-apply/hunt-fish-trap/fishing-licenses",
    notes: "Lake Erie tributaries: Chagrin River, Rocky River, Vermilion River produce excellent steelhead runs October-April.",
    topWaters: ["Chagrin River", "Rocky River", "Vermilion River", "Grand River", "Conneaut Creek"],
    species: ["Rainbow Trout (stocked)", "Steelhead", "Brown Trout", "Brook Trout"],
    regulations: "Steelhead season runs October through April. Some tributaries have special regs. Check ODNR.",
    season: "Year-round on most streams. Steelhead peak October through April.",
    goldMedal: "Chagrin River — Lake Erie steelhead tributary",
  },
  OK: {
    name: "Oklahoma", agency: "Oklahoma Dept of Wildlife Conservation", agencyUrl: "https://www.wildlifedepartment.com/fishing",
    licenseUrl: "https://www.wildlifedepartment.com/licenses",
    notes: "Lower Mountain Fork River below Broken Bow Lake is a blue-ribbon tailwater. Trophy brown trout in the canyon.",
    topWaters: ["Lower Mountain Fork River", "Illinois River"],
    species: ["Rainbow Trout", "Brown Trout"],
    regulations: "Blue Ribbon section on Mountain Fork: artificial lures only, catch-and-release for browns over 20 inches.",
    season: "Year-round on tailwaters",
    goldMedal: "Lower Mountain Fork River — Oklahoma's blue-ribbon tailwater",
  },
  OR: {
    name: "Oregon", agency: "Oregon Dept of Fish & Wildlife", agencyUrl: "https://www.dfw.state.or.us/fish/",
    licenseUrl: "https://www.dfw.state.or.us/resources/licenses_regs/",
    notes: "Deschutes, Rogue, McKenzie, Metolius, John Day, North Umpqua. World-class steelhead and resident trout.",
    topWaters: ["Deschutes River", "Rogue River", "McKenzie River", "Metolius River", "North Umpqua River", "John Day River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Westslope Cutthroat", "Steelhead", "Bull Trout"],
    regulations: "Metolius: catch-and-release, flies only. Deschutes: barbless hooks required. Check ODFW annually.",
    season: "Year-round on most major rivers. Steelhead season varies by river.",
    goldMedal: "Deschutes River — redside rainbow trout and summer steelhead",
  },
  PA: {
    name: "Pennsylvania", agency: "PA Fish & Boat Commission", agencyUrl: "https://www.fishandboat.com",
    licenseUrl: "https://www.fishandboat.com/Fishing/FishingLicenses/Pages/default.aspx",
    notes: "Penns Creek, Brodhead Creek, Spring Creek, Yellow Breeches. PA limestone spring creeks are world-famous.",
    topWaters: ["Penns Creek", "Brodhead Creek", "Spring Creek", "Yellow Breeches", "Falling Springs", "Letort Spring Run"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Catch-and-release, fly-fishing only sections on Penns Creek, Letort, and Spring Creek. Check PFBC.",
    season: "April 3 through Labor Day (general). Year-round catch-and-release on many limestone creeks.",
    goldMedal: "Penns Creek — Pennsylvania's best wild brown trout stream",
  },
  RI: {
    name: "Rhode Island", agency: "RI DEM Division of Fish & Wildlife", agencyUrl: "https://www.dem.ri.gov/programs/fish-wildlife/freshwater-fisheries/",
    licenseUrl: "https://www.dem.ri.gov/programs/fish-wildlife/licenses-permits/",
    notes: "Wood River, Pawcatuck River, Hunt River. Wild brown trout in Wood River drainage.",
    topWaters: ["Wood River", "Pawcatuck River", "Hunt River", "Flat River Reservoir tributaries"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Wild trout management areas have special regulations. Check RI DEM.",
    season: "Second Saturday in April through September 30 (general)",
  },
  SC: {
    name: "South Carolina", agency: "SC Dept of Natural Resources", agencyUrl: "https://www.dnr.sc.gov/fish.html",
    licenseUrl: "https://www.dnr.sc.gov/fish/licenses.html",
    notes: "Chattooga River headwaters. Blue Ridge Escarpment streams. Delayed Harvest sections on some rivers.",
    topWaters: ["Chattooga River", "Saluda River headwaters", "Middle Saluda River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Some Delayed Harvest sections. Check SCDNR for current designations.",
    season: "Year-round on most designated streams",
  },
  SD: {
    name: "South Dakota", agency: "SD Game, Fish & Parks", agencyUrl: "https://gfp.sd.gov/fishing/",
    licenseUrl: "https://gfp.sd.gov/licenses/",
    notes: "Black Hills streams: Rapid Creek, Spearfish Creek, French Creek. Cold, clear limestone streams.",
    topWaters: ["Rapid Creek", "Spearfish Creek", "French Creek", "Grace Coolidge Creek"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Some no-bait sections in the Black Hills. Check GFP for current regulations.",
    season: "Year-round on most designated Black Hills streams",
    goldMedal: "Rapid Creek (Rapid City) — urban wild brown trout fishery",
  },
  TN: {
    name: "Tennessee", agency: "TN Wildlife Resources Agency", agencyUrl: "https://www.tn.gov/twra/fishing.html",
    licenseUrl: "https://www.tn.gov/twra/fishing/fishing-licenses.html",
    notes: "World-class tailwaters: Clinch River, South Holston, Hiwassee. Caney Fork is a trophy brown trout river.",
    topWaters: ["Clinch River", "South Holston River", "Hiwassee River", "Caney Fork River", "Watauga River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Trophy sections have minimum size limits and restricted harvest. Check TWRA for tailwater regulations.",
    season: "Year-round on tailwaters",
    goldMedal: "South Holston River — Tennessee's blue-ribbon tailwater, extraordinary brown trout",
  },
  TX: {
    name: "Texas", agency: "Texas Parks & Wildlife Dept", agencyUrl: "https://tpwd.texas.gov/fishboat/fish/",
    licenseUrl: "https://tpwd.texas.gov/business/licenses/",
    notes: "Guadalupe River below Canyon Lake Dam is the only year-round trout fishery in Texas. Stocked October through March.",
    topWaters: ["Guadalupe River"],
    species: ["Rainbow Trout", "Brown Trout"],
    regulations: "Guadalupe River: 18-inch minimum on brown trout. Stocking October through March.",
    season: "October through March (trout). Year-round saltwater fishing.",
    goldMedal: "Guadalupe River — Texas's only coldwater trout fishery",
  },
  UT: {
    name: "Utah", agency: "Utah Division of Wildlife Resources", agencyUrl: "https://wildlife.utah.gov/fishing.html",
    licenseUrl: "https://wildlife.utah.gov/licenses.html",
    notes: "Green River, Provo River, Logan River, Weber River. Gold Medal tailwaters produce trophy fish.",
    topWaters: ["Green River", "Provo River", "Logan River", "Weber River", "Bear River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Bonneville Cutthroat Trout"],
    regulations: "Gold Medal waters: fly/lure only, catch-and-release. Check UDWR for current Gold Medal boundaries.",
    season: "Year-round on most rivers",
    goldMedal: "Green River (below Flaming Gorge) — Utah's finest trout river",
  },
  VT: {
    name: "Vermont", agency: "VT Fish & Wildlife Department", agencyUrl: "https://vtfishandwildlife.com/fish",
    licenseUrl: "https://vtfishandwildlife.com/fish/fishing-licenses",
    notes: "Batten Kill, Lamoille River, Black River, Willoughby River. Wild brook trout in remote ponds.",
    topWaters: ["Batten Kill River", "Lamoille River", "Black River", "Willoughby River", "Dog River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Lake Trout", "Landlocked Salmon"],
    regulations: "Batten Kill: artificial lures only in some sections. Check VTFW for wild trout waters regulations.",
    season: "Second Saturday in April through October 31 (general)",
    goldMedal: "Batten Kill River — New England's most storied wild brown trout stream",
  },
  VA: {
    name: "Virginia", agency: "VA Dept of Wildlife Resources", agencyUrl: "https://www.dwr.virginia.gov/fishing/",
    licenseUrl: "https://www.dwr.virginia.gov/licensing/",
    notes: "Jackson River, Rapidan River, Mossy Creek, Big Stony Creek, New River. Excellent wild trout.",
    topWaters: ["Jackson River", "Rapidan River", "Mossy Creek", "Big Stony Creek", "New River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Special regulation waters including Mossy Creek (artificial only, catch-and-release) and others. Check VDWR.",
    season: "Year-round on most designated streams",
    goldMedal: "Jackson River — Alleghany Highlands trophy brown trout",
  },
  WA: {
    name: "Washington", agency: "WA Dept of Fish & Wildlife", agencyUrl: "https://wdfw.wa.gov/fishing",
    licenseUrl: "https://wdfw.wa.gov/licenses/fishing",
    notes: "Yakima River, Methow, Wenatchee, Naches. Olympic Peninsula steelhead. Eastern WA has strong resident trout.",
    topWaters: ["Yakima River", "Methow River", "Wenatchee River", "Naches River", "Hoh River", "Quinault River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Westslope Cutthroat", "Steelhead", "Bull Trout"],
    regulations: "Wild steelhead regulations change annually. Barbless hooks required on many rivers. Check WDFW.",
    season: "Year-round on most trout waters. Steelhead season varies by river.",
    goldMedal: "Yakima River — Washington's best dry fly river for wild rainbows",
  },
  WV: {
    name: "West Virginia", agency: "WV Division of Natural Resources", agencyUrl: "https://wvdnr.gov/fishing/",
    licenseUrl: "https://wvdnr.gov/licenses/",
    notes: "South Branch Potomac, Cranberry River, Elk River headwaters hold quality wild trout.",
    topWaters: ["South Branch Potomac", "Cranberry River", "Elk River", "Greenbrier River", "Williams River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Some catch-and-release and artificial-only sections. Check WVDNR.",
    season: "Year-round on most designated streams",
  },
  WI: {
    name: "Wisconsin", agency: "WI Dept of Natural Resources", agencyUrl: "https://dnr.wisconsin.gov/topic/Fishing",
    licenseUrl: "https://dnr.wisconsin.gov/topic/Fishing/licenses.html",
    notes: "Driftless Area spring creeks are legendary. Timber Coulee, Rush Creek, Prairie du Sac, Kinnickinnic River.",
    topWaters: ["Kinnickinnic River", "Timber Coulee Creek", "Rush Creek", "Peshtigo River", "Bois Brule River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations: "Class I, II, III stream designations with different regulations. Check WDNR Trout Fishing Regulations.",
    season: "First Saturday in May through September 30 (general). Some waters year-round.",
    goldMedal: "Kinnickinnic River — Wisconsin's blue-ribbon spring creek",
  },
  WY: {
    name: "Wyoming", agency: "WY Game & Fish Department", agencyUrl: "https://wgfd.wyo.gov/Fishing",
    licenseUrl: "https://wgfd.wyo.gov/Licensing",
    notes: "North Platte, Shoshone, Snake, Gibbon, Firehole in Yellowstone. Blue-ribbon fisheries across the state.",
    topWaters: ["North Platte River", "Snake River", "Shoshone River", "Gibbon River", "Firehole River", "Lamar River"],
    species: ["Rainbow Trout", "Brown Trout", "Brook Trout", "Cutthroat Trout"],
    regulations: "Some rivers have float-only regulations. Yellowstone NP requires separate park fishing permit.",
    season: "General season: June 1 through October 31. Some tailwaters year-round.",
    goldMedal: "North Platte (Grey Reef) — Wyoming's world-class tailwater for trophy brown trout",
  },
};

// ── Parse USGS NWIS RDB site response ───────────────────────────────────────
function parseNWISSites(text: string): {
  site_no: string; name: string; lat: number; lon: number;
  stateCd: string; huc: string; drainArea: string;
}[] {
  const lines = text.split("\n").filter(l => !l.startsWith("#") && l.trim());
  if (lines.length < 3) return [];
  const headers = lines[0].split("\t");
  const get = (cols: string[], h: string) => cols[headers.indexOf(h)]?.trim() ?? "";

  return lines.slice(2).flatMap(line => {
    const cols = line.split("\t");
    const lat = parseFloat(get(cols, "dec_lat_va"));
    const lon = parseFloat(get(cols, "dec_long_va"));
    if (isNaN(lat) || isNaN(lon)) return [];
    return [{
      site_no: get(cols, "site_no"),
      name: get(cols, "station_nm"),
      lat, lon,
      stateCd: get(cols, "state_cd"),
      huc: get(cols, "huc_cd"),
      drainArea: get(cols, "drain_area_va"),
    }];
  });
}

// ── Flow condition label ─────────────────────────────────────────────────────
function flowConditionLabel(cfs: number | null): string {
  if (cfs === null) return "Unknown";
  if (cfs < 30) return "Very low";
  if (cfs < 150) return "Low — wading easy";
  if (cfs < 400) return "Fishable";
  if (cfs < 900) return "Moderate";
  if (cfs < 2000) return "High — wade with care";
  if (cfs < 5000) return "Very high";
  return "Flood stage";
}

// ── Water temp advisory ──────────────────────────────────────────────────────
function tempAdvisory(f: number | null): string {
  if (f === null) return "";
  if (f < 38) return "Ice-cold — fish inactive";
  if (f < 45) return "Too cold — fish sluggish, nymphs deep";
  if (f < 52) return "Cold — nymph deep with attractor";
  if (f <= 62) return "Prime — all presentations work";
  if (f <= 65) return "Ideal — surface activity likely";
  if (f <= 68) return "Warm — fish deep or early morning";
  if (f <= 72) return "Stressful — consider releasing quickly";
  return "Too warm — fish stressed, skip or fish at dawn";
}

// ── Register all stream routes ───────────────────────────────────────────────
export function registerStreamRoutes(app: Express, cacheGetFn: (k: string) => unknown, cacheSetFn: (k: string, d: unknown, ttl?: number) => void) {

  // GET /api/streams/trout-states — all 50 states DNR data
  app.get("/api/streams/trout-states", (_req, res) => {
    const list = Object.entries(ALL_STATE_TROUT).map(([abbr, info]) => ({
      abbr,
      name: info.name,
      agency: info.agency,
      agency_url: info.agencyUrl,
      license_url: info.licenseUrl,
      notes: info.notes,
      top_waters: info.topWaters,
      target_species: info.species,
      regulations: info.regulations,
      season: info.season,
      gold_medal: info.goldMedal ?? null,
    }));
    res.json({ states: list, total: list.length, source: "Flydentify + State DNR databases (all 50 states)" });
  });

  // GET /api/streams/state/:abbr — state info + all live USGS gauges
  app.get("/api/streams/state/:abbr", async (req, res) => {
    try {
      const abbr = req.params.abbr.toUpperCase().slice(0, 2);
      const info = ALL_STATE_TROUT[abbr];
      if (!info) return res.status(404).json({ error: `Unknown state: ${abbr}` });

      const cacheKey = `streams-state-${abbr}`;
      const cached = cacheGetFn(cacheKey);
      if (cached) return res.json(cached);

      const siteUrl = `https://waterservices.usgs.gov/nwis/site/?format=rdb&stateCd=${abbr}&siteType=ST&hasDataTypeCd=iv&parameterCd=00060`;
      const siteResp = await fetch(siteUrl, { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(10000) });
      const siteText = await siteResp.text();
      const rawSites = parseNWISSites(siteText);

      const gauges = rawSites.map(s => ({
        site_no: s.site_no,
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        huc8: s.huc,
        drain_area_sqmi: parseFloat(s.drainArea) || null,
        usgs_url: `https://waterdata.usgs.gov/nwis/uv?site_no=${s.site_no}`,
      }));

      const result = {
        abbr,
        state_info: {
          name: info.name,
          agency: info.agency,
          agency_url: info.agencyUrl,
          license_url: info.licenseUrl,
          notes: info.notes,
          top_waters: info.topWaters,
          target_species: info.species,
          regulations: info.regulations,
          season: info.season,
          gold_medal: info.goldMedal ?? null,
        },
        total_gauges: gauges.length,
        gauges: gauges.slice(0, 250),
        source: "USGS NWIS + Flydentify State DNR Database",
        fetched_at: new Date().toISOString(),
      };

      cacheSetFn(cacheKey, result, 3600);
      res.json(result);
    } catch (err) {
      console.error("[streams/state] error:", err);
      res.status(500).json({ error: "State data temporarily unavailable" });
    }
  });

  // GET /api/streams/nearby?lat=&lon=&radius=
  // Returns up to 10 nearest gauged streams with live conditions
  app.get("/api/streams/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const radius = Math.min(parseFloat((req.query.radius as string) || "0.75"), 2.0);
      if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: "lat/lon required" });

      const cacheKey = `streams-nearby-${lat.toFixed(2)}-${lon.toFixed(2)}-${radius}`;
      const cached = cacheGetFn(cacheKey);
      if (cached) return res.json(cached);

      // USGS: find all stream gauges in bounding box
      const bBox = `${lon - radius},${lat - radius},${lon + radius},${lat + radius}`;
      const siteUrl = `https://waterservices.usgs.gov/nwis/site/?format=rdb&bBox=${bBox}&siteType=ST&hasDataTypeCd=iv&parameterCd=00060,00065,00010`;
      const siteResp = await fetch(siteUrl, { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(10000) });
      const siteText = await siteResp.text();
      const rawSites = parseNWISSites(siteText);

      if (rawSites.length === 0) return res.json({ streams: [], radius_deg: radius, source: "USGS NWIS" });

      // Sort by distance, take closest 10
      const sorted = rawSites
        .map(s => ({ ...s, dist: Math.hypot(s.lat - lat, s.lon - lon) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 10);

      // Batch fetch real-time conditions for all 10 sites
      const siteIds = sorted.map(s => s.site_no).join(",");
      const ivUrl = `https://waterservices.usgs.gov/nwis/iv/?sites=${siteIds}&parameterCd=00060,00065,00010&format=json&period=PT2H`;
      const ivResp = await fetch(ivUrl, { signal: AbortSignal.timeout(8000) });
      const ivJson = await ivResp.json().catch(() => ({ value: { timeSeries: [] } }));
      const timeSeries: any[] = ivJson?.value?.timeSeries ?? [];

      // Index conditions by site_no
      const condMap: Record<string, { cfs: number|null; ft: number|null; tempF: number|null; at: string }> = {};
      for (const ts of timeSeries) {
        const sno: string = ts?.sourceInfo?.siteCode?.[0]?.value ?? "";
        const code: string = ts?.variable?.variableCode?.[0]?.value ?? "";
        const vals: any[] = ts?.values?.[0]?.value ?? [];
        if (!sno || !vals.length) continue;
        const last = vals[vals.length - 1];
        const v = parseFloat(last?.value);
        if (isNaN(v)) continue;
        if (!condMap[sno]) condMap[sno] = { cfs: null, ft: null, tempF: null, at: last?.dateTime ?? "" };
        if (code === "00060") condMap[sno].cfs = Math.round(v);
        else if (code === "00065") condMap[sno].ft = Math.round(v * 10) / 10;
        else if (code === "00010") condMap[sno].tempF = Math.round(v * 9/5 + 32);
      }

      const streams = sorted.map(s => {
        const c = condMap[s.site_no] ?? { cfs: null, ft: null, tempF: null, at: "" };
        const stateAbbr = FIPS_TO_STATE[s.stateCd] ?? "";
        const stateInfo = stateAbbr ? ALL_STATE_TROUT[stateAbbr] : null;
        return {
          site_no: s.site_no,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          state: stateAbbr,
          huc8: s.huc,
          drain_area_sqmi: parseFloat(s.drainArea) || null,
          distance_miles: Math.round(s.dist * 69.0 * 10) / 10,
          flow_cfs: c.cfs,
          gauge_height_ft: c.ft,
          water_temp_f: c.tempF,
          flow_condition: flowConditionLabel(c.cfs),
          temp_advisory: tempAdvisory(c.tempF),
          updated_at: c.at,
          target_species: stateInfo?.species ?? [],
          top_waters: stateInfo?.topWaters ?? [],
          dnr_agency: stateInfo?.agency ?? "",
          dnr_notes: stateInfo?.notes ?? "",
          license_url: stateInfo?.licenseUrl ?? "",
          usgs_url: `https://waterdata.usgs.gov/nwis/uv?site_no=${s.site_no}`,
        };
      });

      const result = { streams, radius_deg: radius, source: "USGS NWIS + Flydentify State DNR Database", fetched_at: new Date().toISOString() };
      cacheSetFn(cacheKey, result, 1800);
      res.json(result);
    } catch (err) {
      console.error("[streams/nearby] error:", err);
      res.json({ streams: [], error: "Stream data temporarily unavailable" });
    }
  });

  // GET /api/streams/detail/:siteNo — deep drill-down for one stream gauge
  app.get("/api/streams/detail/:siteNo", async (req, res) => {
    try {
      const siteNo = req.params.siteNo.replace(/[^0-9]/g, "");
      if (!siteNo) return res.status(400).json({ error: "Invalid site number" });

      const cacheKey = `streams-detail-${siteNo}`;
      const cached = cacheGetFn(cacheKey);
      if (cached) return res.json(cached);

      // Parallel: metadata + real-time IV (7d sparkline) + daily values (30d)
      const [metaR, ivR, dvR] = await Promise.allSettled([
        fetch(`https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=${siteNo}&siteOutput=expanded`, { signal: AbortSignal.timeout(8000) }),
        fetch(`https://waterservices.usgs.gov/nwis/iv/?sites=${siteNo}&parameterCd=00060,00065,00010&format=json&period=P7D`, { signal: AbortSignal.timeout(8000) }),
        fetch(`https://waterservices.usgs.gov/nwis/dv/?sites=${siteNo}&parameterCd=00060&format=json&period=P30D`, { signal: AbortSignal.timeout(8000) }),
      ]);

      // --- Site metadata ---
      let siteName = "", siteLat = 0, siteLon = 0, stateCd = "", huc = "", drainArea = "";
      if (metaR.status === "fulfilled") {
        const txt = await metaR.value.text();
        const sites = parseNWISSites(txt);
        if (sites.length > 0) {
          siteName = sites[0].name; siteLat = sites[0].lat; siteLon = sites[0].lon;
          stateCd = sites[0].stateCd; huc = sites[0].huc; drainArea = sites[0].drainArea;
        }
      }

      // --- Real-time conditions + sparkline ---
      let cfs: number|null = null, ft: number|null = null, tempF: number|null = null, updatedAt = "";
      const sparkline: { t: string; v: number }[] = [];

      if (ivR.status === "fulfilled") {
        const ivJson = await ivR.value.json().catch(() => null);
        for (const ts of ivJson?.value?.timeSeries ?? []) {
          const code: string = ts?.variable?.variableCode?.[0]?.value ?? "";
          const vals: any[] = ts?.values?.[0]?.value ?? [];
          if (!vals.length) continue;
          const last = vals[vals.length - 1];
          const v = parseFloat(last?.value);
          if (isNaN(v)) continue;
          if (!updatedAt) updatedAt = last.dateTime ?? "";
          if (code === "00060") {
            cfs = Math.round(v);
            // Downsample to ~20 points for sparkline
            const step = Math.max(1, Math.floor(vals.length / 20));
            for (let i = 0; i < vals.length; i += step) {
              const sv = parseFloat(vals[i]?.value);
              if (!isNaN(sv)) sparkline.push({ t: vals[i].dateTime, v: Math.round(sv) });
            }
          } else if (code === "00065") ft = Math.round(v * 10) / 10;
          else if (code === "00010") tempF = Math.round(v * 9/5 + 32);
        }
      }

      // --- 30-day daily flow + trend ---
      const daily: { date: string; cfs: number }[] = [];
      if (dvR.status === "fulfilled") {
        const dvJson = await dvR.value.json().catch(() => null);
        const dvSeries = dvJson?.value?.timeSeries ?? [];
        const dvTs = dvSeries.find((ts: any) => ts?.variable?.variableCode?.[0]?.value === "00060");
        for (const v of dvTs?.values?.[0]?.value ?? []) {
          const val = parseFloat(v?.value);
          if (!isNaN(val) && v?.dateTime) daily.push({ date: v.dateTime.slice(0, 10), cfs: Math.round(val) });
        }
      }

      let trend = "Steady";
      if (daily.length >= 6) {
        const rec = daily.slice(-3).reduce((s, d) => s + d.cfs, 0) / 3;
        const pri = daily.slice(-6, -3).reduce((s, d) => s + d.cfs, 0) / 3;
        if (rec > pri * 1.20) trend = "Rising";
        else if (rec < pri * 0.80) trend = "Falling";
      }

      // --- State info ---
      const stateAbbr = FIPS_TO_STATE[stateCd] ?? "";
      const stateInfo = stateAbbr ? ALL_STATE_TROUT[stateAbbr] : null;

      // --- EPA ATTAINS water quality (non-blocking) ---
      let waterQuality: { listed_impaired: boolean; causes: string; source: string } | null = null;
      try {
        const huc8 = huc.slice(0, 8);
        if (huc8.length === 8) {
          const attR = await fetch(
            `https://attains.epa.gov/attains-public/api/assessmentUnits?huc=${huc8}&format=json`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (attR.ok) {
            const attJson = await attR.json();
            const units: any[] = attJson?.items ?? [];
            const listed = units.some((u: any) => u?.overallStatus === "Impaired");
            const causes: string[] = [];
            for (const u of units.slice(0, 8)) {
              for (const p of (u?.parameters ?? [])) {
                if (p?.parameterStatusName === "Cause" && p?.parameterName && !causes.includes(p.parameterName))
                  causes.push(p.parameterName);
              }
            }
            waterQuality = { listed_impaired: listed, causes: causes.slice(0, 4).join(", "), source: "EPA ATTAINS" };
          }
        }
      } catch { /* non-blocking */ }

      const result = {
        site_no: siteNo,
        name: siteName,
        lat: siteLat,
        lon: siteLon,
        state: stateAbbr,
        huc8: huc,
        drain_area_sqmi: parseFloat(drainArea) || null,
        // Live conditions
        flow_cfs: cfs,
        gauge_height_ft: ft,
        water_temp_f: tempF,
        flow_condition: flowConditionLabel(cfs),
        temp_advisory: tempAdvisory(tempF),
        trend,
        updated_at: updatedAt,
        // Time series
        sparkline_7d: sparkline,
        daily_30d: daily.slice(-14),
        // State & DNR
        state_info: stateInfo ? {
          name: stateInfo.name,
          agency: stateInfo.agency,
          agency_url: stateInfo.agencyUrl,
          license_url: stateInfo.licenseUrl,
          notes: stateInfo.notes,
          top_waters: stateInfo.topWaters,
          target_species: stateInfo.species,
          regulations: stateInfo.regulations,
          season: stateInfo.season,
          gold_medal: stateInfo.goldMedal ?? null,
        } : null,
        // EPA water quality
        water_quality: waterQuality,
        // Links
        usgs_url: `https://waterdata.usgs.gov/nwis/uv?site_no=${siteNo}`,
        usgs_chart_url: `https://waterdata.usgs.gov/nwisweb/graph?site_no=${siteNo}&parm_cd=00060&period=7`,
        source: "USGS NWIS + EPA ATTAINS + Flydentify State DNR Database",
      };

      cacheSetFn(cacheKey, result, 900); // 15 min cache
      res.json(result);
    } catch (err) {
      console.error("[streams/detail] error:", err);
      res.status(500).json({ error: "Stream detail unavailable" });
    }
  });

  // GET /api/streams/search?q=madison+river&state=MT
  app.get("/api/streams/search", async (req, res) => {
    try {
      const q = ((req.query.q as string) || "").trim();
      const state = ((req.query.state as string) || "").toUpperCase().slice(0, 2);
      if (q.length < 2) return res.status(400).json({ error: "Query must be at least 2 characters" });

      const cacheKey = `streams-search-${state}-${q.toLowerCase()}`;
      const cached = cacheGetFn(cacheKey);
      if (cached) return res.json(cached);

      let url = `https://waterservices.usgs.gov/nwis/site/?format=rdb&siteType=ST&hasDataTypeCd=iv&parameterCd=00060&siteNameCd=${encodeURIComponent(q)}`;
      if (state) url += `&stateCd=${state}`;

      const resp = await fetch(url, { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(10000) });
      const txt = await resp.text();
      const rawSites = parseNWISSites(txt);

      const results = rawSites.slice(0, 25).map(s => {
        const stateAbbr = FIPS_TO_STATE[s.stateCd] ?? "";
        const stateInfo = stateAbbr ? ALL_STATE_TROUT[stateAbbr] : null;
        return {
          site_no: s.site_no,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          state: stateAbbr,
          huc8: s.huc,
          target_species: stateInfo?.species ?? [],
          gold_medal: stateInfo?.goldMedal ?? null,
          usgs_url: `https://waterdata.usgs.gov/nwis/uv?site_no=${s.site_no}`,
        };
      });

      const result = { results, query: q, state: state || "all", total: results.length, source: "USGS NWIS" };
      cacheSetFn(cacheKey, result, 1800);
      res.json(result);
    } catch (err) {
      console.error("[streams/search] error:", err);
      res.status(500).json({ error: "Search unavailable" });
    }
  });
}
