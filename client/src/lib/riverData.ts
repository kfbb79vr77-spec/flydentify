// ── Top Fly Fishing Rivers by State, USGS Gauges ────────────────────────────
// Keys match flyData.ts region keys exactly.
// State-level data: when locationStateAbbr is known, filter by state.
// USGS parameter codes: 00060 = discharge (CFS), 00010 = water temp (°C)

export interface RiverGauge {
  name: string;
  state: string;          // 2-letter state abbr
  usgsId: string;
  description: string;
  species: string[];
  bestMonths: number[];   // 1-indexed
}

export interface RiverCondition {
  name: string;
  state: string;
  cfs: number | null;
  tempF: number | null;
  trend: "rising" | "falling" | "stable";
  advisory: string;
  usgsUrl: string;
  live: boolean;
}

// ── USGS API (legacy waterservices endpoint — works for all gauges, stable until 2027) ──
const USGS_LEGACY_BASE = "https://waterservices.usgs.gov/nwis/iv";

export async function fetchUSGSLatest(siteId: string): Promise<{ cfs: number | null; tempF: number | null }> {
  try {
    // Fetch discharge (00060) and water temp (00010) in a single request
    const url = `${USGS_LEGACY_BASE}/?sites=${siteId}&parameterCd=00060,00010&format=json&period=PT2H`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const data = await res.json();

    const timeSeries: any[] = data?.value?.timeSeries ?? [];
    let cfs: number | null = null;
    let tempF: number | null = null;

    for (const ts of timeSeries) {
      const paramCode = ts?.variable?.variableCode?.[0]?.value;
      const values: any[] = ts?.values?.[0]?.value ?? [];
      // Get the most recent non-empty value
      const latest = [...values].reverse().find(v => v?.value && v.value !== "-999999");
      if (!latest) continue;
      const num = parseFloat(latest.value);
      if (isNaN(num)) continue;
      if (paramCode === "00060") cfs = Math.round(num);
      if (paramCode === "00010") tempF = Math.round(num * 9 / 5 + 32);
    }

    return { cfs, tempF };
  } catch {
    return { cfs: null, tempF: null };
  }
}

// ── State-level USGS gauges ───────────────────────────────────────────────────
// Keyed by 2-letter state abbr. Up to 5 gauges per state.
export const gaugesByState: Record<string, RiverGauge[]> = {
  // ── MONTANA ──────────────────────────────────────────────────────────────
  MT: [
    { name: "Madison River", state: "MT", usgsId: "06043500", description: "World-class dry fly river below Hebgen Dam", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 9, 10] },
    { name: "Yellowstone River", state: "MT", usgsId: "06192500", description: "Longest undammed river in the lower 48", species: ["Cutthroat Trout", "Brown Trout"], bestMonths: [7, 8, 9, 10] },
    { name: "Gallatin River", state: "MT", usgsId: "06043500", description: "Blue-ribbon canyon river, A River Runs Through It country", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [6, 7, 8, 9] },
    { name: "Big Hole River", state: "MT", usgsId: "06024540", description: "Last stronghold of the fluvial Arctic grayling", species: ["Brown Trout", "Rainbow Trout", "Arctic Grayling"], bestMonths: [6, 7, 8] },
    { name: "Missouri River", state: "MT", usgsId: "06054500", description: "Tailwater below Holter Dam, massive technical hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 9, 10, 11] },
  ],
  // ── WYOMING ───────────────────────────────────────────────────────────────
  WY: [
    { name: "Snake River", state: "WY", usgsId: "13013650", description: "Jackson Hole fine-spotted cutthroat on attractor dries", species: ["Cutthroat Trout"], bestMonths: [7, 8, 9] },
    { name: "Green River", state: "WY", usgsId: "09188500", description: "Flaming Gorge tailwater, trophy browns in canyon country", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10, 11] },
    { name: "Shoshone River", state: "WY", usgsId: "06806500", description: "North Fork below Buffalo Bill Reservoir, strong PMD hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [6, 7, 8] },
    { name: "Bighorn River", state: "WY", usgsId: "06259500", description: "Tailwater below Boysen Dam, heavy Trico and midge hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [7, 8, 9, 10] },
    { name: "North Platte River", state: "WY", usgsId: "06630000", description: "Classic Wyoming tailwater, Miracle Mile section", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10] },
  ],
  // ── IDAHO ─────────────────────────────────────────────────────────────────
  ID: [
    { name: "Henry's Fork", state: "ID", usgsId: "13054500", description: "Railroad Ranch, most technically demanding dry fly river in America", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [6, 7, 8] },
    { name: "Silver Creek", state: "ID", usgsId: "13150430", description: "Crystal spring creek, legendary PMD and Trico hatches", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [7, 8, 9] },
    { name: "South Fork Snake River", state: "ID", usgsId: "13046995", description: "Float fishing for big cutthroats, prolific Salmonfly hatches", species: ["Cutthroat Trout", "Brown Trout"], bestMonths: [6, 7, 8, 9] },
    { name: "North Fork Clearwater", state: "ID", usgsId: "13340000", description: "Remote canyon with wild steelhead and massive cutthroat", species: ["Cutthroat Trout", "Steelhead"], bestMonths: [6, 7, 8] },
    { name: "Boise River", state: "ID", usgsId: "13206000", description: "Urban tailwater with surprisingly good trout fishing", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [4, 5, 9, 10] },
  ],
  // ── COLORADO ──────────────────────────────────────────────────────────────
  CO: [
    { name: "South Platte River", state: "CO", usgsId: "09035800", description: "Dream Stream below Spinney, world-famous technical tailwater", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "Frying Pan River", state: "CO", usgsId: "09080400", description: "Tailwater below Ruedi Reservoir, giant midge hatches year-round", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [1, 2, 3, 11, 12] },
    { name: "Arkansas River", state: "CO", usgsId: "07087050", description: "Best dry fly water in Colorado, prolific caddis and PMD hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Roaring Fork River", state: "CO", usgsId: "09085000", description: "Aspen area blue-ribbon river, great stonefly and caddis hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [6, 7, 8, 9] },
    { name: "Gunnison River", state: "CO", usgsId: "09128000", description: "Remote Black Canyon gorge, wild browns in technical water", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 9, 10] },
  ],
  // ── UTAH ──────────────────────────────────────────────────────────────────
  UT: [
    { name: "Green River (A-C sections)", state: "UT", usgsId: "09261000", description: "Below Flaming Gorge Dam, trophy browns, prolific midge hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10, 11] },
    { name: "Provo River", state: "UT", usgsId: "10154200", description: "Middle Provo tailwater, productive year-round Blue Ribbon water", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10] },
    { name: "Logan River", state: "UT", usgsId: "10109000", description: "Mountain freestone through Logan Canyon, wild cutthroat and browns", species: ["Brown Trout", "Cutthroat Trout"], bestMonths: [5, 6, 7, 8] },
    { name: "Weber River", state: "UT", usgsId: "10141000", description: "Urban trout fishery through Ogden canyon", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10] },
    { name: "Beaver River", state: "UT", usgsId: "10210000", description: "Remote south Utah mountain stream with wild brook trout", species: ["Brook Trout", "Brown Trout"], bestMonths: [6, 7, 8] },
  ],
  // ── NEVADA ────────────────────────────────────────────────────────────────
  NV: [
    { name: "Truckee River", state: "NV", usgsId: "10348000", description: "Strong evening caddis hatches in May and June near Reno", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Walker River (E. Fork)", state: "NV", usgsId: "10293000", description: "Remote Nevada river with wild browns and Lahontan cutthroat", species: ["Brown Trout", "Lahontan Cutthroat"], bestMonths: [5, 6, 9, 10] },
    { name: "Carson River", state: "NV", usgsId: "10310000", description: "East Fork Carson, spring fishing for wild browns", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6] },
  ],
  // ── WASHINGTON ────────────────────────────────────────────────────────────
  WA: [
    { name: "Yakima River", state: "WA", usgsId: "12484500", description: "Washington's premier dry fly river, Skwala stonefly in March", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [3, 4, 5, 9, 10] },
    { name: "Methow River", state: "WA", usgsId: "12448500", description: "North Cascades freestone, salmon, steelhead, and resident trout", species: ["Steelhead", "Cutthroat Trout"], bestMonths: [4, 5, 9, 10] },
    { name: "Skagit River", state: "WA", usgsId: "12194000", description: "Wild steelhead in old-growth canyon, classic winter run", species: ["Steelhead", "Bull Trout"], bestMonths: [1, 2, 3, 11, 12] },
    { name: "Wenatchee River", state: "WA", usgsId: "12462500", description: "Prolific caddis and stonefly hatches, good public access", species: ["Rainbow Trout", "Steelhead"], bestMonths: [5, 6, 7, 9, 10] },
    { name: "Klickitat River", state: "WA", usgsId: "14107000", description: "Volcanic gorge steelhead, fall run in spectacular canyon", species: ["Steelhead", "Cutthroat Trout"], bestMonths: [9, 10, 11] },
  ],
  // ── OREGON ────────────────────────────────────────────────────────────────
  OR: [
    { name: "Deschutes River", state: "OR", usgsId: "14050000", description: "Oregon's crown jewel, Salmonfly hatch and summer steelhead", species: ["Redside Rainbow", "Steelhead"], bestMonths: [5, 6, 7, 9, 10] },
    { name: "Rogue River", state: "OR", usgsId: "14372300", description: "Legendary rafting and steelhead river through the Siskiyous", species: ["Steelhead", "Cutthroat Trout"], bestMonths: [9, 10, 11] },
    { name: "North Umpqua River", state: "OR", usgsId: "14317000", description: "Classic summer steelhead river, swing flies through long glides", species: ["Steelhead", "Brown Trout"], bestMonths: [7, 8, 9, 10] },
    { name: "McKenzie River", state: "OR", usgsId: "14162500", description: "Classic drift boat river, prolific caddis and PMD hatches", species: ["Rainbow Trout", "Cutthroat Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Metolius River", state: "OR", usgsId: "14091500", description: "Crystal spring creek, sight fishing to selective rainbows", species: ["Rainbow Trout", "Bull Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── CALIFORNIA ────────────────────────────────────────────────────────────
  CA: [
    { name: "Hat Creek", state: "CA", usgsId: "11367500", description: "Wild trout section, crystal clear spring creek with selective fish", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [5, 6, 7, 9, 10] },
    { name: "Fall River", state: "CA", usgsId: "11369500", description: "Spring creek, prolific PMD and Trico hatches, very technical", species: ["Rainbow Trout"], bestMonths: [6, 7, 8, 9] },
    { name: "McCloud River", state: "CA", usgsId: "11378000", description: "Birthplace of the McCloud rainbow, wild, remote, historic", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [5, 6, 9, 10] },
    { name: "Owens River", state: "CA", usgsId: "10265500", description: "High Sierra valley, consistent flows and willing browns", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "East Walker River", state: "CA", usgsId: "10293000", description: "High desert tailwater, monster browns and rainbows below Bridgeport", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 9, 10, 11] },
  ],
  // ── ALASKA ────────────────────────────────────────────────────────────────
  AK: [
    { name: "Kenai River", state: "AK", usgsId: "15266300", description: "World-record Chinook salmon water, Alaska's most accessible fishery", species: ["Chinook Salmon", "Sockeye Salmon", "Rainbow Trout"], bestMonths: [6, 7, 8, 9] },
    { name: "Naknek River", state: "AK", usgsId: "15302200", description: "Bristol Bay anchor river, trophy rainbows below sockeye runs", species: ["Rainbow Trout", "Sockeye Salmon"], bestMonths: [6, 7, 8, 9] },
    { name: "Copper River", state: "AK", usgsId: "15214000", description: "Remote wilderness salmon river, king and sockeye runs", species: ["Chinook Salmon", "Sockeye Salmon"], bestMonths: [6, 7] },
    { name: "Situk River", state: "AK", usgsId: "15052500", description: "Yakutat steelhead, one of the most productive steelhead rivers per mile", species: ["Steelhead", "Coho Salmon"], bestMonths: [4, 5, 9, 10] },
  ],
  // ── NEW MEXICO ────────────────────────────────────────────────────────────
  NM: [
    { name: "San Juan River", state: "NM", usgsId: "09355500", description: "15,000 fish per mile, arguably the best numbers tailwater in the US", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: "Rio Grande", state: "NM", usgsId: "08279500", description: "Wild trout in the Rio Grande Gorge, remote and spectacular", species: ["Brown Trout", "Cutthroat Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Pecos River", state: "NM", usgsId: "08382000", description: "Jemez Mountains freestone, wild brown and rainbow trout", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 9, 10] },
    { name: "Cimarron River", state: "NM", usgsId: "07207500", description: "Northern NM canyon river, native Rio Grande cutthroat", species: ["Brown Trout", "Cutthroat Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── ARIZONA ───────────────────────────────────────────────────────────────
  AZ: [
    { name: "Colorado River (Lee's Ferry)", state: "AZ", usgsId: "09380000", description: "Arizona's premier trout fishery below Glen Canyon Dam", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Oak Creek", state: "AZ", usgsId: "09504500", description: "Sedona area red rock canyon creek, small browns and rainbows", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "White River", state: "AZ", usgsId: "09491500", description: "White Mountain Apache tribal water, Apache trout, the state fish", species: ["Apache Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 7, 8] },
    { name: "Black River", state: "AZ", usgsId: "09397300", description: "Remote White Mountains, wild trout in pristine conditions", species: ["Brown Trout", "Apache Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── TEXAS ─────────────────────────────────────────────────────────────────
  TX: [
    { name: "Guadalupe River", state: "TX", usgsId: "08165300", description: "Texas's only quality trout tailwater, cold water year-round below Canyon Lake", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [11, 12, 1, 2, 3] },
    { name: "South Llano River", state: "TX", usgsId: "08149900", description: "Spring-fed Hill Country river, Guadalupe bass and clear water", species: ["Guadalupe Bass", "Largemouth Bass"], bestMonths: [4, 5, 6, 7, 8, 9, 10] },
    { name: "Frio River", state: "TX", usgsId: "08194690", description: "Crystal spring creek, Guadalupe bass on dries and topwater", species: ["Guadalupe Bass", "Sunfish"], bestMonths: [4, 5, 6, 7, 8, 9, 10] },
    { name: "San Marcos River", state: "TX", usgsId: "08170500", description: "Constant 68°F spring-fed river, year-round bass and carp", species: ["Guadalupe Bass", "Largemouth Bass", "Carp"], bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: "Pedernales River", state: "TX", usgsId: "08152900", description: "Hill Country limestone river, smallmouth and Guadalupe bass", species: ["Guadalupe Bass", "Smallmouth Bass"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── OKLAHOMA ──────────────────────────────────────────────────────────────
  OK: [
    { name: "Illinois River", state: "OK", usgsId: "07196500", description: "Oklahoma's finest smallmouth stream, float through Ozark foothills", species: ["Smallmouth Bass", "Largemouth Bass"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Lower Mountain Fork River", state: "OK", usgsId: "07338750", description: "Broken Bow tailwater, Oklahoma's best trout fishery", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [3, 4, 5, 10, 11, 12] },
    { name: "Blue River", state: "OK", usgsId: "07332500", description: "Spring-fed Chickasaw country, stocked trout and bass", species: ["Rainbow Trout", "Smallmouth Bass"], bestMonths: [10, 11, 12, 1, 2, 3] },
  ],
  // ── KANSAS ────────────────────────────────────────────────────────────────
  KS: [
    { name: "Arkansas River (KS)", state: "KS", usgsId: "07137500", description: "Prairie river smallmouth and carp on the fly", species: ["Smallmouth Bass", "Carp"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Neosho River", state: "KS", usgsId: "07183000", description: "Flint Hills limestone stream, best smallmouth in eastern Kansas", species: ["Smallmouth Bass", "Largemouth Bass"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── NEBRASKA ──────────────────────────────────────────────────────────────
  NE: [
    { name: "Dismal River", state: "NE", usgsId: "06775900", description: "Sandhills spring-fed gem, clear water smallmouth on dry flies", species: ["Smallmouth Bass", "Trout"], bestMonths: [6, 7, 8] },
    { name: "Niobrara River", state: "NE", usgsId: "06462000", description: "National Scenic River, float fishing for smallmouth in canyon", species: ["Smallmouth Bass", "Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Snake River (NE)", state: "NE", usgsId: "06775000", description: "Sandhills headwater, wild trout in prairie spring creeks", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 8] },
  ],
  // ── NORTH DAKOTA ──────────────────────────────────────────────────────────
  ND: [
    { name: "Missouri River (ND)", state: "ND", usgsId: "06342500", description: "Tailwater below Garrison Dam, walleye and smallmouth on the fly", species: ["Walleye", "Smallmouth Bass", "Northern Pike"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Sheyenne River", state: "ND", usgsId: "05062000", description: "Carp and smallmouth in the prairie, surprisingly good fly fishing", species: ["Carp", "Smallmouth Bass"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── SOUTH DAKOTA ──────────────────────────────────────────────────────────
  SD: [
    { name: "Rapid Creek", state: "SD", usgsId: "06412500", description: "Urban Black Hills trout fishery, wild browns through Rapid City", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Spearfish Creek", state: "SD", usgsId: "06407000", description: "Black Hills limestone creek, wild brown trout in a stunning canyon", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Fall River (SD)", state: "SD", usgsId: "06408000", description: "Spring-fed Black Hills creek, clear, cold, and productive", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── IOWA ──────────────────────────────────────────────────────────────────
  IA: [
    { name: "Upper Iowa River", state: "IA", usgsId: "05387500", description: "Northeast Iowa Driftless, wild brown trout in limestone country", species: ["Brown Trout", "Smallmouth Bass"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Yellow River", state: "IA", usgsId: "05388770", description: "Driftless spring creek, wild trout in a remote setting", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Volga River", state: "IA", usgsId: "05389000", description: "Forested Driftless stream, wild brown trout and caddis hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [5, 6, 9, 10] },
  ],
  // ── MINNESOTA ─────────────────────────────────────────────────────────────
  MN: [
    { name: "Whitewater River", state: "MN", usgsId: "05376000", description: "Southeast MN Driftless, wild brown trout in limestone creek", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Root River", state: "MN", usgsId: "05383900", description: "Lanesboro area, excellent spring hatches and wild browns", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Brule River", state: "MN", usgsId: "04015330", description: "Minnesota-Wisconsin border, brookies and steelhead", species: ["Brook Trout", "Steelhead"], bestMonths: [4, 5, 9, 10] },
  ],
  // ── MISSOURI ──────────────────────────────────────────────────────────────
  MO: [
    { name: "Current River", state: "MO", usgsId: "07064535", description: "Ozark spring creek, gin-clear water, wild brown trout year-round", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "North Fork White River", state: "MO", usgsId: "07057470", description: "Coldwater Ozark tailwater, trophy browns and spring hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "Eleven Point River", state: "MO", usgsId: "07071500", description: "Remote wild and scenic Ozark river, smallmouth and trout", species: ["Smallmouth Bass", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Meramec River", state: "MO", usgsId: "07013000", description: "St. Louis-area Ozark river, smallmouth and stocked trout", species: ["Smallmouth Bass", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── MICHIGAN ──────────────────────────────────────────────────────────────
  MI: [
    { name: "Au Sable River", state: "MI", usgsId: "04136000", description: "Michigan's greatest trout river, home of the legendary Hex hatch", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7, 8] },
    { name: "Pere Marquette River", state: "MI", usgsId: "04122500", description: "Premier steelhead and brown trout, wild fish in a Wild & Scenic river", species: ["Steelhead", "Brown Trout"], bestMonths: [4, 5, 9, 10, 11] },
    { name: "Manistee River", state: "MI", usgsId: "04123460", description: "Pine forest float water, excellent Hex hatch and fall salmon", species: ["Brown Trout", "Steelhead", "Chinook Salmon"], bestMonths: [5, 6, 7, 8, 9, 10] },
    { name: "Muskegon River", state: "MI", usgsId: "04121970", description: "Tailwater below Croton Dam, strong steelhead and salmon runs", species: ["Steelhead", "Brown Trout", "Chinook Salmon"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "Boardman River", state: "MI", usgsId: "04124000", description: "Traverse City area, accessible wild trout fishery", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── WISCONSIN ─────────────────────────────────────────────────────────────
  WI: [
    { name: "Bois Brule River", state: "WI", usgsId: "04025500", description: "Wisconsin's most storied trout stream, presidential fishing water", species: ["Brown Trout", "Brook Trout", "Steelhead"], bestMonths: [5, 6, 9, 10] },
    { name: "Wolf River", state: "WI", usgsId: "04074950", description: "Wild and Scenic designation, excellent Hex hatch in June", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7, 8] },
    { name: "Namekagon River", state: "WI", usgsId: "05331855", description: "National Scenic Riverway, cold spring-fed water and wild browns", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7, 8] },
    { name: "Prairie River", state: "WI", usgsId: "04074950", description: "North central Wisconsin, wild trout in spruce bog setting", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7] },
  ],
  // ── ILLINOIS ──────────────────────────────────────────────────────────────
  IL: [
    { name: "Fox River", state: "IL", usgsId: "05552500", description: "Best smallmouth in northeastern Illinois, below Algonquin Dam", species: ["Smallmouth Bass", "Largemouth Bass"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Des Plaines River", state: "IL", usgsId: "05529000", description: "Chicago metro urban carp and bass fishery", species: ["Carp", "Smallmouth Bass"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Kankakee River", state: "IL", usgsId: "05520500", description: "Downstate river, smallmouth and spotted bass on streamers", species: ["Smallmouth Bass", "Spotted Bass"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── INDIANA ───────────────────────────────────────────────────────────────
  IN: [
    { name: "St. Joseph River", state: "IN", usgsId: "04101500", description: "Lake Michigan tributary, steelhead runs in spring and fall", species: ["Steelhead", "Smallmouth Bass"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Sugar Creek", state: "IN", usgsId: "03339460", description: "Central Indiana float creek, smallmouth on poppers all summer", species: ["Smallmouth Bass", "Largemouth Bass"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Tippecanoe River", state: "IN", usgsId: "03331500", description: "Northern Indiana limestone creek, best wild trout fishing in the state", species: ["Brown Trout", "Smallmouth Bass"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── OHIO ──────────────────────────────────────────────────────────────────
  OH: [
    { name: "Grand River", state: "OH", usgsId: "04212100", description: "Northeast Ohio steelhead tributary, October through April", species: ["Steelhead", "Brown Trout"], bestMonths: [10, 11, 12, 1, 2, 3, 4] },
    { name: "Chagrin River", state: "OH", usgsId: "04208815", description: "Cuyahoga County steelhead stream, excellent public access", species: ["Steelhead", "Brown Trout"], bestMonths: [10, 11, 12, 1, 2, 3, 4] },
    { name: "Mad River", state: "OH", usgsId: "03266500", description: "Spring-fed limestone creek, Ohio's best wild trout stream", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Rocky River", state: "OH", usgsId: "04197100", description: "Cleveland metro steelhead river, accessible urban fly fishing", species: ["Steelhead", "Smallmouth Bass"], bestMonths: [10, 11, 12, 1, 2, 3, 4] },
  ],
  // ── MAINE ─────────────────────────────────────────────────────────────────
  ME: [
    { name: "Kennebec River", state: "ME", usgsId: "01049500", description: "Restored Atlantic salmon river, landlocked salmon and brown trout", species: ["Landlocked Salmon", "Brown Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Penobscot River (West Branch)", state: "ME", usgsId: "01028000", description: "Remote Maine wild trout, brookies and landlocked salmon", species: ["Brook Trout", "Landlocked Salmon"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Rapid River", state: "ME", usgsId: "01064500", description: "Walk-in remote stream, wild brook trout in a classic Maine setting", species: ["Brook Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Roach River", state: "ME", usgsId: "01031300", description: "Pond outlet, exceptional wild brook trout, no motorized access", species: ["Brook Trout", "Landlocked Salmon"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── NEW HAMPSHIRE ─────────────────────────────────────────────────────────
  NH: [
    { name: "Connecticut River (NH)", state: "NH", usgsId: "01135500", description: "Upper Connecticut River, wild browns and landlocked salmon", species: ["Brown Trout", "Landlocked Salmon"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Androscoggin River", state: "NH", usgsId: "01053500", description: "North Country freestone river, wild browns and brook trout", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Swift River (NH)", state: "NH", usgsId: "01064485", description: "White Mountains freestone, wild brook trout in remote gorge", species: ["Brook Trout", "Brown Trout"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── VERMONT ───────────────────────────────────────────────────────────────
  VT: [
    { name: "Battenkill River", state: "VT", usgsId: "04280440", description: "Vermont's most storied trout stream, notoriously selective wild browns", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Lamoille River", state: "VT", usgsId: "04292500", description: "North Vermont freestone, landlocked salmon and brown trout", species: ["Brown Trout", "Landlocked Salmon"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "White River (VT)", state: "VT", usgsId: "01143500", description: "Central Vermont, wild browns and excellent caddis hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── MASSACHUSETTS ──────────────────────────────────────────────────────────
  MA: [
    { name: "Swift River", state: "MA", usgsId: "01174565", description: "Quabbin tailwater, year-round wild rainbows on tiny midges", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [1, 2, 3, 4, 5, 9, 10, 11, 12] },
    { name: "Deerfield River", state: "MA", usgsId: "01170000", description: "Tailwater through Deerfield Canyon, strong Hendrickson and caddis", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Millers River", state: "MA", usgsId: "01162500", description: "Central Mass freestone, good spring hatches and wild browns", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── RHODE ISLAND ──────────────────────────────────────────────────────────
  RI: [
    { name: "Wood River", state: "RI", usgsId: "01117500", description: "Rhode Island's best trout stream, wild browns in Arcadia Wildlife Area", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Pawcatuck River", state: "RI", usgsId: "01118000", description: "South County spring creek, wild brown trout and sea-run brook trout", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── CONNECTICUT ───────────────────────────────────────────────────────────
  CT: [
    { name: "Farmington River", state: "CT", usgsId: "01186000", description: "Connecticut's finest trout river, classic Hendrickson and BWO hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Housatonic River", state: "CT", usgsId: "01199000", description: "Limestone-fed river, prolific Hendrickson, Sulphur and BWO hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Salmon River", state: "CT", usgsId: "01193500", description: "Colchester CT, tailwater trout and steelhead runs", species: ["Brown Trout", "Steelhead"], bestMonths: [4, 5, 9, 10, 11] },
  ],
  // ── NEW YORK ──────────────────────────────────────────────────────────────
  NY: [
    { name: "Delaware River (West Branch)", state: "NY", usgsId: "01425000", description: "Tailwater, world-class hatches, wild browns and rainbows", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Beaverkill River", state: "NY", usgsId: "01419000", description: "Birthplace of American dry fly fishing, historic Catskill water", species: ["Brown Trout"], bestMonths: [4, 5, 6] },
    { name: "AuSable River (ADK)", state: "NY", usgsId: "04273970", description: "Adirondack blue-ribbon stream, wild browns and rainbows", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Willowemoc Creek", state: "NY", usgsId: "01419000", description: "Classic Catskill tributary, Sulphur and Green Drake hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6] },
    { name: "West Canada Creek", state: "NY", usgsId: "04252500", description: "Mohawk Valley freestone, wild browns and excellent public access", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── NEW JERSEY ────────────────────────────────────────────────────────────
  NJ: [
    { name: "Big Flat Brook", state: "NJ", usgsId: "01439800", description: "Delaware Water Gap, best wild trout in New Jersey", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "South Branch Raritan", state: "NJ", usgsId: "01396500", description: "NJ's most productive stocked and wild trout stream", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Musconetcong River", state: "NJ", usgsId: "01455500", description: "Limestone-fed trout stream, wild browns and consistent hatches", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── PENNSYLVANIA ──────────────────────────────────────────────────────────
  PA: [
    { name: "Penns Creek", state: "PA", usgsId: "01555000", description: "Greatest Green Drake hatch in the East, wild browns in limestone spring creek", species: ["Brown Trout", "Brook Trout"], bestMonths: [5, 6, 9, 10] },
    { name: "Spring Creek", state: "PA", usgsId: "01546500", description: "State College limestone spring creek, year-round wild trout", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [1, 2, 3, 4, 5, 9, 10, 11, 12] },
    { name: "Brodhead Creek", state: "PA", usgsId: "01442500", description: "Poconos freestone, wild browns and classic hatch calendar", species: ["Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Yellow Breeches Creek", state: "PA", usgsId: "01571500", description: "Cumberland Valley limestone spring creek, technical wild trout", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Letort Spring Run", state: "PA", usgsId: "01569800", description: "The birthplace of American nymph fishing, ultra-technical spring creek", species: ["Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── DELAWARE ──────────────────────────────────────────────────────────────
  DE: [
    { name: "White Clay Creek", state: "DE", usgsId: "01479000", description: "Newark DE catch-and-release, wild brown trout in suburban setting", species: ["Brown Trout", "Brook Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Brandywine Creek", state: "DE", usgsId: "01481000", description: "Delaware's largest trout stream, smallmouth and stocked browns", species: ["Brown Trout", "Smallmouth Bass"], bestMonths: [3, 4, 5, 10, 11] },
  ],
  // ── MARYLAND ──────────────────────────────────────────────────────────────
  MD: [
    { name: "Gunpowder Falls", state: "MD", usgsId: "01581920", description: "Maryland's top tailwater below Prettyboy Reservoir, wild brown trout year-round", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [1, 2, 3, 4, 5, 9, 10, 11, 12] },
    { name: "North Branch Potomac", state: "MD", usgsId: "01596500", description: "Appalachian Mountain tailwater, world-class wild brown trout", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Savage River", state: "MD", usgsId: "01598000", description: "Garrett County tailwater, Maryland's most technical trout stream", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── VIRGINIA ──────────────────────────────────────────────────────────────
  VA: [
    { name: "New River (VA)", state: "VA", usgsId: "03163000", description: "Ancient river, smallmouth bass and wild brown trout", species: ["Smallmouth Bass", "Brown Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Rapidan River", state: "VA", usgsId: "01665500", description: "Shenandoah National Park, wild brook trout in remote headwaters", species: ["Brook Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Mossy Creek", state: "VA", usgsId: "01620842", description: "Virginia's most challenging spring creek, ultra-selective wild browns", species: ["Brown Trout"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "Smith River", state: "VA", usgsId: "02072000", description: "Tailwater below Philpott Dam, world-class midge fishing", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [1, 2, 3, 4, 9, 10, 11, 12] },
  ],
  // ── WEST VIRGINIA ─────────────────────────────────────────────────────────
  WV: [
    { name: "Elk River", state: "WV", usgsId: "03193900", description: "Summersville tailwater, wild rainbow trout in spectacular canyon", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10, 11] },
    { name: "Cranberry River", state: "WV", usgsId: "03187500", description: "Monongahela National Forest, wild brook trout in pristine mountain water", species: ["Brook Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Williams River", state: "WV", usgsId: "03186500", description: "Remote headwater stream, wild brook trout, no hatchery fish", species: ["Brook Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Greenbrier River", state: "WV", usgsId: "03183000", description: "Long Appalachian float river, smallmouth and stocked trout", species: ["Smallmouth Bass", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── KENTUCKY ──────────────────────────────────────────────────────────────
  KY: [
    { name: "Cumberland River (tailwater)", state: "KY", usgsId: "03403500", description: "Below Wolf Creek Dam, Kentucky's top trout fishery year-round", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [1, 2, 3, 4, 9, 10, 11, 12] },
    { name: "Red River", state: "KY", usgsId: "03282500", description: "Red River Gorge area, wild smallmouth and rock bass", species: ["Smallmouth Bass", "Rock Bass"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Russell Fork", state: "KY", usgsId: "03208500", description: "Breaks Interstate Park, spectacular canyon, smallmouth on streamers", species: ["Smallmouth Bass", "Spotted Bass"], bestMonths: [5, 6, 7, 8, 9] },
  ],
  // ── NORTH CAROLINA ────────────────────────────────────────────────────────
  NC: [
    { name: "Davidson River", state: "NC", usgsId: "03441000", description: "Pisgah National Forest, the Southeast's most famous trout stream", species: ["Rainbow Trout", "Brown Trout", "Brook Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Nantahala River", state: "NC", usgsId: "03504000", description: "Cold gorge tailwater, active year-round with midge and BWO hatches", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [1, 2, 3, 10, 11, 12] },
    { name: "South Toe River", state: "NC", usgsId: "03463500", description: "High country Blue Ridge, wild brook trout at elevation", species: ["Brook Trout", "Rainbow Trout"], bestMonths: [5, 6, 7, 8, 9] },
    { name: "Watauga River (NC)", state: "NC", usgsId: "03484000", description: "Cold tailwater below Watauga Dam, prolific Sulphur hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10, 11] },
  ],
  // ── TENNESSEE ─────────────────────────────────────────────────────────────
  TN: [
    { name: "South Holston River", state: "TN", usgsId: "03476500", description: "Premier tailwater, world-class Sulphur hatches with technical browns", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
    { name: "Clinch River", state: "TN", usgsId: "03527620", description: "East Tennessee tailwater, consistent year-round flows and hatches", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [3, 4, 5, 9, 10, 11] },
    { name: "Hiwassee River", state: "TN", usgsId: "03566000", description: "Catch-and-release section, trophy browns and excellent wading", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 9, 10] },
    { name: "Little River (Smokies)", state: "TN", usgsId: "03497180", description: "Great Smoky Mountains, wild brook and rainbow trout in mountain pocket water", species: ["Brook Trout", "Rainbow Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── SOUTH CAROLINA ────────────────────────────────────────────────────────
  SC: [
    { name: "Chattooga River", state: "SC", usgsId: "02177000", description: "SC/NC/GA border wild river, native brook trout, no motors", species: ["Brook Trout", "Brown Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Saluda River", state: "SC", usgsId: "02162350", description: "Columbia tailwater below Lake Murray Dam, rainbow trout year-round", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [1, 2, 3, 10, 11, 12] },
  ],
  // ── GEORGIA ───────────────────────────────────────────────────────────────
  GA: [
    { name: "Chattahoochee River", state: "GA", usgsId: "02330450", description: "Atlanta area tailwater below Buford Dam, accessible year-round trout", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Toccoa River", state: "GA", usgsId: "02384500", description: "Blue Ridge tailwater, Georgia's best cold-water fishery", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Chestatee River", state: "GA", usgsId: "02333500", description: "North Georgia freestone, wild rainbow trout in mountain setting", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── FLORIDA ───────────────────────────────────────────────────────────────
  FL: [
    { name: "Suwannee River", state: "FL", usgsId: "02315500", description: "North Florida blackwater, largemouth bass and Suwannee bass on poppers", species: ["Largemouth Bass", "Suwannee Bass"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "St. Johns River", state: "FL", usgsId: "02244000", description: "Central FL largemouth bass, one of America's great bass rivers", species: ["Largemouth Bass", "Crappie"], bestMonths: [3, 4, 5, 10, 11] },
  ],
  // ── ALABAMA ───────────────────────────────────────────────────────────────
  AL: [
    { name: "Sipsey Fork", state: "AL", usgsId: "02450250", description: "North Alabama coldwater tailwater, stocked trout in canyon", species: ["Rainbow Trout", "Brown Trout"], bestMonths: [10, 11, 12, 1, 2, 3] },
    { name: "Cahaba River", state: "AL", usgsId: "02423500", description: "Alabama's most biodiverse river, spotted bass and redeye bass", species: ["Spotted Bass", "Redeye Bass"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── MISSISSIPPI ───────────────────────────────────────────────────────────
  MS: [
    { name: "Pearl River", state: "MS", usgsId: "02482550", description: "Central MS largemouth and spotted bass, float trip country", species: ["Largemouth Bass", "Spotted Bass"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Big Black River", state: "MS", usgsId: "02481510", description: "West MS deer-hair popper bass fishing, underrated float trips", species: ["Largemouth Bass", "Spotted Bass"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── LOUISIANA ─────────────────────────────────────────────────────────────
  LA: [
    { name: "Sabine River", state: "LA", usgsId: "08025500", description: "Texas/Louisiana border, bass, bowfin, and gar on the fly", species: ["Largemouth Bass", "Bowfin", "Gar"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Atchafalaya River", state: "LA", usgsId: "07381490", description: "Floodplain basin, largemouth, crappie, and redfish in the brackish marsh", species: ["Largemouth Bass", "Redfish"], bestMonths: [3, 4, 5, 10, 11] },
  ],
  // ── ARKANSAS ──────────────────────────────────────────────────────────────
  AR: [
    { name: "White River", state: "AR", usgsId: "07054500", description: "Below Bull Shoals Dam, world-record brown trout water", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 10, 11, 12] },
    { name: "Norfork River", state: "AR", usgsId: "07059998", description: "Tailwater below Norfork Dam, mid-sized tailwater with consistent hatches", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Little Red River", state: "AR", usgsId: "07075000", description: "Greers Ferry tailwater, held world-record brown for years", species: ["Brown Trout", "Rainbow Trout"], bestMonths: [3, 4, 5, 10, 11] },
    { name: "Buffalo National River", state: "AR", usgsId: "07055660", description: "America's first national river, smallmouth bass in Ozark canyon", species: ["Smallmouth Bass", "Rock Bass"], bestMonths: [4, 5, 6, 9, 10] },
  ],
  // ── HAWAII ────────────────────────────────────────────────────────────────
  HI: [
    { name: "Kaneohe Bay Flats (Oahu)", state: "HI", usgsId: "16208000", description: "Oahu's top bonefish flat, tailing bones year-round in crystal water", species: ["Bonefish", "Bluefin Trevally"], bestMonths: [4, 5, 6, 7, 8, 9, 10] },
  ],
};

// ── Region-level fallback (flyData keys) ─────────────────────────────────────
// Used when no state match exists or for regional browsing.
export const topRiversByRegion: Record<string, RiverGauge[]> = {
  montana_rockies: [
    ...gaugesByState["MT"]!,
    ...gaugesByState["WY"]!.slice(0, 2),
    ...gaugesByState["ID"]!.slice(0, 2),
    ...gaugesByState["CO"]!.slice(0, 1),
  ],
  pacific_northwest: [
    ...gaugesByState["WA"]!.slice(0, 3),
    ...gaugesByState["OR"]!.slice(0, 3),
  ],
  california: gaugesByState["CA"]!,
  alaska: gaugesByState["AK"]!,
  southwest: [
    ...gaugesByState["NM"]!.slice(0, 3),
    ...gaugesByState["AZ"]!.slice(0, 2),
  ],
  texas_hill_country: [
    ...gaugesByState["TX"]!,
  ],
  great_plains: [
    ...gaugesByState["OK"]!.slice(0, 2),
    ...gaugesByState["MO"]!.slice(0, 2),
    ...gaugesByState["AR"]!.slice(0, 2),
  ],
  great_lakes: [
    ...gaugesByState["MI"]!.slice(0, 3),
    ...gaugesByState["WI"]!.slice(0, 2),
    ...gaugesByState["OH"]!.slice(0, 2),
  ],
  northeast: [
    ...gaugesByState["NY"]!.slice(0, 2),
    ...gaugesByState["PA"]!.slice(0, 2),
    ...gaugesByState["CT"]!.slice(0, 1),
    ...gaugesByState["MA"]!.slice(0, 1),
  ],
  appalachian_east: [
    ...gaugesByState["VA"]!.slice(0, 2),
    ...gaugesByState["WV"]!.slice(0, 2),
    ...gaugesByState["NC"]!.slice(0, 2),
    ...gaugesByState["TN"]!.slice(0, 2),
  ],
  southeast: [
    ...gaugesByState["GA"]!.slice(0, 2),
    ...gaugesByState["SC"]!.slice(0, 1),
    ...gaugesByState["AR"]!.slice(0, 2),
    ...gaugesByState["KY"]!.slice(0, 1),
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getGaugesForState(stateAbbr: string): RiverGauge[] {
  return gaugesByState[stateAbbr.toUpperCase()] ?? [];
}

export function buildAdvisory(cfs: number | null, tempF: number | null): string {
  if (cfs === null) return "Check local conditions before heading out.";
  const parts: string[] = [];
  if (cfs > 1500) parts.push("Very high flows, streamers and heavy nymphs only. Wade with caution.");
  else if (cfs > 600) parts.push("High flows, switch to weighted nymphs or streamers. Surface activity reduced.");
  else if (cfs < 80) parts.push("Low, clear water, use fine tippet (6X-7X) and smaller flies. Fish are spooky.");
  else if (cfs < 200) parts.push("Low-moderate flows, ideal for dry flies and light nymphs.");
  else parts.push("Ideal conditions for all techniques.");
  if (tempF !== null) {
    if (tempF > 68) parts.push("Water temp above 68°F, fish stress risk. Fish early morning only or skip.");
    else if (tempF > 62) parts.push("Warm water, fish are active but stress quickly. Release quickly.");
    else if (tempF < 40) parts.push("Cold water, fish are sluggish. Slow your drift, fish deeper.");
    else parts.push(`Water ${tempF}°F, prime feeding temperature.`);
  }
  return parts.join(" ");
}

export function usgsGaugeUrl(siteId: string): string {
  return `https://waterdata.usgs.gov/monitoring-location/${siteId}/`;
}
