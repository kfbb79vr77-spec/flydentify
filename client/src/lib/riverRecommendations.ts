// ── River Recommendations by Region ───────────────────────────────────────────
// Best rivers per region with fishing profile, best season, difficulty, and why

export interface AccessPoint {
  name: string;
  lat: number;
  lng: number;
  fee?: string;   // e.g. "$5/day", "Free", "Montana FWP — no fee"
  type?: string;  // e.g. "Boat ramp", "Walk-in", "Parking pullout"
}

export interface RiverRecommendation {
  name: string;
  state: string;
  type: "freestone" | "tailwater" | "spring creek" | "wilderness";
  difficulty: "beginner" | "intermediate" | "expert";
  bestMonths: number[];       // 1-indexed
  targetSpecies: string[];
  hatchHighlights: string[];
  whyFish: string;            // the one-sentence pitch
  accessNotes: string;
  accessPoints?: AccessPoint[];
  usgsUrl?: string;
  lat?: number;
  lng?: number;
}

export const riversByRegion: Record<string, RiverRecommendation[]> = {
  "Rocky Mountain / Intermountain": [
    {
      name: "Madison River",
      state: "Montana",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 7, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Salmonfly (June)", "PMD (July)", "Caddis (Aug-Sept)", "Trico (Aug)"],
      whyFish: "Montana's most celebrated trout river, 50-mile float from Quake Lake to Ennis with non-stop action.",
      accessNotes: "Public access throughout. Ennis, MT is the hub. Heavily fished in peak season, go early.",
      accessPoints: [
        { name: "Ennis Bridge", lat: 45.35, lng: -111.73, fee: "Free", type: "Walk-in" },
        { name: "McAtee Bridge", lat: 45.46, lng: -111.65, fee: "Free", type: "Walk-in" },
        { name: "Varney Bridge", lat: 45.24, lng: -111.80, fee: "Free", type: "Boat ramp" },
        { name: "Lyons Bridge", lat: 45.16, lng: -111.85, fee: "Free", type: "Boat ramp" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06037500/",
      lat: 45.35, lng: -111.75,
    },
    {
      name: "Henry's Fork",
      state: "Idaho",
      type: "spring creek",
      difficulty: "expert",
      bestMonths: [6, 7, 8],
      targetSpecies: ["Rainbow Trout"],
      hatchHighlights: ["PMD (July-Aug)", "Green Drake (July)", "Trico (Aug)", "Callibaetis (Aug)"],
      whyFish: "The Railroad Ranch section is the world's most demanding dry fly water, big visible fish, ultra-clear currents.",
      accessNotes: "Railroad Ranch (Harriman State Park) requires walk-in. No wading in key sections. Arrive before 7am.",
      accessPoints: [
        { name: "Harriman State Park — Box Canyon", lat: 44.49, lng: -111.48, fee: "$7/vehicle", type: "Walk-in" },
        { name: "Last Chance Ramp", lat: 44.46, lng: -111.46, fee: "Free", type: "Boat ramp" },
        { name: "Coffee Pot Rapids", lat: 44.38, lng: -111.37, fee: "Free", type: "Walk-in" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13042500/",
      lat: 44.47, lng: -111.39,
    },
    {
      name: "Gallatin River",
      state: "Montana",
      type: "freestone",
      difficulty: "beginner",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Caddis (June-Sept)", "PMD (July)", "Hoppers (Aug-Sept)"],
      whyFish: "A River Runs Through It country, accessible canyon water perfect for learning dry fly fishing.",
      accessNotes: "Highway 191 parallels the river with pullouts every mile. No crowds compared to the Madison.",
      accessPoints: [
        { name: "Big Sky Meadow", lat: 45.28, lng: -111.18, fee: "Free", type: "Parking pullout" },
        { name: "Portal Creek", lat: 45.36, lng: -111.11, fee: "Free", type: "Parking pullout" },
        { name: "Squaw Creek Bridge", lat: 45.44, lng: -111.07, fee: "Free", type: "Walk-in" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06043500/",
      lat: 45.68, lng: -111.05,
    },
    {
      name: "Yellowstone River",
      state: "Montana",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [7, 8, 9, 10],
      targetSpecies: ["Cutthroat Trout", "Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Salmonfly (June)", "Caddis (July-Aug)", "Hoppers (Aug-Sept)"],
      whyFish: "The longest undammed river in the lower 48, wild cutthroat on floating lines in big water.",
      accessNotes: "Best from Livingston downstream. Float fishing dominates. Public access at many bridge crossings.",
      accessPoints: [
        { name: "Livingston Carter Bridge", lat: 45.66, lng: -110.55, fee: "Free", type: "Boat ramp" },
        { name: "Pine Creek", lat: 45.55, lng: -110.49, fee: "Free", type: "Walk-in" },
        { name: "Mallard's Rest", lat: 45.50, lng: -110.50, fee: "$5/day", type: "Boat ramp" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06192500/",
      lat: 45.66, lng: -110.56,
    },
    {
      name: "South Fork Snake",
      state: "Idaho",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Cutthroat Trout", "Brown Trout"],
      hatchHighlights: ["Green Drake (June-July)", "PMD (July-Aug)", "Caddis (Aug-Sept)"],
      whyFish: "Pristine canyon float with wild cutthroat that eat dry flies aggressively, classic western river fishing.",
      accessNotes: "Float-only on the canyon section. Palisades to Lorenzo is the classic 2-day float. Book outfitters early.",
      accessPoints: [
        { name: "Palisades Dam Launch", lat: 43.37, lng: -111.19, fee: "$5/vehicle", type: "Boat ramp" },
        { name: "Highway 26 Pullout", lat: 43.45, lng: -111.22, fee: "Free", type: "Parking pullout" },
        { name: "Lorenzo Take-Out", lat: 43.52, lng: -111.33, fee: "Free", type: "Boat ramp" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13057940/",
      lat: 43.47, lng: -111.22,
    },
  ],

  "Pacific Northwest / Northern Rockies": [
    {
      name: "Deschutes River",
      state: "Oregon",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 7, 9, 10],
      targetSpecies: ["Redside Rainbow", "Steelhead"],
      hatchHighlights: ["Salmonfly (May-June)", "Golden Stone (June)", "Caddis (July-Sept)", "Fall Steelhead (Sept-Nov)"],
      whyFish: "Oregon's crown jewel, canyon float with aggressive redside rainbows and world-class fall steelhead.",
      accessNotes: "Lower canyon (Maupin area) is most accessible. Upper river for wade fishing. Shuttle services available.",
      accessPoints: [
        { name: "Maupin City Park Ramp", lat: 45.18, lng: -121.08, fee: "$5/day", type: "Boat ramp" },
        { name: "Harpham Flat", lat: 45.22, lng: -121.10, fee: "Free", type: "Walk-in" },
        { name: "Beavertail Recreation Site", lat: 45.34, lng: -121.00, fee: "$10/night camp", type: "Camping/wade" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/14050000/",
      lat: 45.08, lng: -121.10,
    },
    {
      name: "North Fork Clearwater",
      state: "Idaho",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [9, 10, 11, 3, 4],
      targetSpecies: ["Steelhead", "Cutthroat Trout"],
      hatchHighlights: ["Fall Steelhead (Sept-Nov)", "Spring Steelhead (Mar-Apr)", "Summer Caddis (July-Aug)"],
      whyFish: "One of the great steelhead rivers of the Pacific Northwest, wild B-run fish to 20+ pounds.",
      accessNotes: "Highway 12 follows the river. Wade fishing along most of the corridor. Cold water, bring layers.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13340000/",
      lat: 46.53, lng: -115.92,
    },
    {
      name: "Clark Fork River",
      state: "Montana",
      type: "freestone",
      difficulty: "beginner",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout", "Bull Trout"],
      hatchHighlights: ["Caddis (June-Aug)", "PMD (July)", "Hoppers (Aug)"],
      whyFish: "Underrated big-water fishing through Missoula, less pressure than the Madison with quality browns and rainbows.",
      accessNotes: "Multiple access points in Missoula. Good beginner float water. Bull trout are catch-and-release only.",
      accessPoints: [
        { name: "Missoula Rattlesnake", lat: 46.88, lng: -113.96, fee: "Free", type: "Walk-in" },
        { name: "Tower Street Bridge", lat: 46.86, lng: -114.00, fee: "Free", type: "Walk-in" },
        { name: "Maclay Flats", lat: 46.84, lng: -114.07, fee: "Free", type: "Walk-in" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/12353000/",
      lat: 46.87, lng: -114.00,
    },
    {
      name: "Metolius River",
      state: "Oregon",
      type: "spring creek",
      difficulty: "expert",
      bestMonths: [5, 6, 7, 8, 9],
      targetSpecies: ["Rainbow Trout", "Bull Trout"],
      hatchHighlights: ["PMD (June-Aug)", "BWO (May, Sept-Oct)", "Caddis (June-Aug)"],
      whyFish: "One of America's most beautiful trout streams, spring-fed, crystal clear, sight-fishing to selective rainbows.",
      accessNotes: "Barbless only on the trophy section. Walk-in only below Camp Sherman. No bait. Challenging presentations.",
      lat: 44.45, lng: -121.63,
    },
  ],

  "Northeast / Appalachian": [
    {
      name: "Delaware River",
      state: "New York / Pennsylvania",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Hendrickson (April-May)", "Sulphur (May-June)", "Green Drake (June)", "Trico (Aug)"],
      whyFish: "The best wild trout river in the East, massive hatches on big water with trophy browns.",
      accessNotes: "West Branch (Hancock, NY) is premier. Cannonsville releases affect flows, check USGS before going.",
      accessPoints: [
        { name: "Hancock Launch", lat: 41.96, lng: -75.28, fee: "Free", type: "Boat ramp" },
        { name: "Cannonsville Tailwater Access", lat: 42.05, lng: -75.32, fee: "Free", type: "Walk-in" },
        { name: "Balls Eddy", lat: 41.92, lng: -75.20, fee: "Free", type: "Parking pullout" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01425000/",
      lat: 41.95, lng: -75.22,
    },
    {
      name: "Beaverkill River",
      state: "New York",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [4, 5, 6, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Hendrickson (April)", "Sulphur (May-June)", "Caddis (May-June)", "Trico (Aug)"],
      whyFish: "The birthplace of American fly fishing, fish the same pools where the Catskill tradition was born.",
      accessNotes: "Roscoe, NY is the hub. Public stretches alternate with private. Fabled Hendrickson hatch in late April.",
      accessPoints: [
        { name: "Roscoe Town Access", lat: 41.93, lng: -74.92, fee: "Free", type: "Walk-in" },
        { name: "Barnhart's Pool", lat: 41.90, lng: -74.86, fee: "Free", type: "Walk-in" },
        { name: "Junction Pool", lat: 41.94, lng: -74.93, fee: "Free", type: "Walk-in" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01420500/",
      lat: 41.88, lng: -74.87,
    },
    {
      name: "Housatonic River",
      state: "Connecticut",
      type: "tailwater",
      difficulty: "beginner",
      bestMonths: [4, 5, 6, 9, 10, 11],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Hendrickson (April-May)", "Sulphur (May-June)", "Caddis (June)", "BWO (Oct-Nov)"],
      whyFish: "Connecticut's best tailwater, year-round fishery with consistent flows and big browns up to 24 inches.",
      accessNotes: "Cornwall Bridge area is the go-to. Gear restrictions on the trophy section, check CT DEEP regulations.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01199000/",
      lat: 41.83, lng: -73.37,
    },
  ],

  "Southeast / Appalachian Tailwaters": [
    {
      name: "South Holston River",
      state: "Tennessee / Virginia",
      type: "tailwater",
      difficulty: "intermediate",
      bestMonths: [4, 5, 6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Sulphur (April-September, 18hrs/day)", "Trico (Aug-Sept)", "BWO (Oct-Nov)"],
      whyFish: "America's best sulphur hatch, evening rises with fish feeding on the surface for hours on end.",
      accessNotes: "Dam releases affect wading safety. Check TVA release schedule before fishing. Catch-and-release sections.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03476500/",
      lat: 36.52, lng: -82.27,
    },
    {
      name: "Nantahala River",
      state: "North Carolina",
      type: "tailwater",
      difficulty: "beginner",
      bestMonths: [4, 5, 6, 7, 8, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
      hatchHighlights: ["Sulphur (May-June)", "Caddis (April-May)", "Blue-Winged Olive (Sept-Oct)"],
      whyFish: "Gorge tailwater with consistent cold flows, excellent beginner water in a stunning Smoky Mountain setting.",
      accessNotes: "Nantahala Outdoor Center area is most accessible. Share water with kayakers, plan accordingly.",
      lat: 35.47, lng: -83.68,
    },
    {
      name: "Watauga River",
      state: "Tennessee",
      type: "tailwater",
      difficulty: "intermediate",
      bestMonths: [3, 4, 5, 6, 9, 10, 11],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Midges (year-round)", "BWO (Mar-May, Oct-Nov)", "Sulphur (May-June)"],
      whyFish: "Tennessee's most productive tailwater, consistent cold releases and strong midge hatches even in winter.",
      accessNotes: "Siam Road access is excellent. Dam generation schedule critical, check before wading.",
      lat: 36.35, lng: -82.07,
    },
  ],

  "Great Lakes / Midwest": [
    {
      name: "Au Sable River",
      state: "Michigan",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 7, 8],
      targetSpecies: ["Brown Trout", "Brook Trout"],
      hatchHighlights: ["Hendrickson (May)", "Brown Drake (June)", "Hex (June-July)", "Trico (Aug)"],
      whyFish: "The legendary Holy Water near Grayling, hex hatch nights in June are a bucket-list experience.",
      accessNotes: "Holy Water is walk-in only from the Burton's Landing access. Night fishing for hex requires local knowledge.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04136000/",
      lat: 44.65, lng: -84.72,
    },
    {
      name: "Pere Marquette River",
      state: "Michigan",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [3, 4, 5, 9, 10, 11],
      targetSpecies: ["Steelhead", "Brown Trout", "Chinook Salmon"],
      hatchHighlights: ["Spring Steelhead (Mar-May)", "Caddis (June-Aug)", "Fall Salmon/Steelhead (Sept-Nov)"],
      whyFish: "Michigan's premier steelhead river, wild fish runs in spring and fall through old-growth forests.",
      accessNotes: "National Wild & Scenic River, no motors. Canoe/kayak access at multiple points. Book guides early for spring.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04122500/",
      lat: 43.98, lng: -86.00,
    },
    {
      name: "Manistee River",
      state: "Michigan",
      type: "freestone",
      difficulty: "beginner",
      bestMonths: [5, 6, 7, 8, 9, 10],
      targetSpecies: ["Brown Trout", "Steelhead", "Chinook Salmon"],
      hatchHighlights: ["Hendrickson (May)", "Hex (June)", "Caddis (July-Aug)", "Fall Runs (Sept-Oct)"],
      whyFish: "Less crowded than the Au Sable, beautiful float water through pine forests with excellent trout and salmon.",
      accessNotes: "Tippy Dam tailwater is excellent year-round. Multiple public access sites throughout.",
      lat: 44.20, lng: -85.92,
    },
  ],

  "Texas Hill Country": [
    {
      name: "Guadalupe River",
      state: "Texas",
      type: "tailwater",
      difficulty: "beginner",
      bestMonths: [11, 12, 1, 2, 3],
      targetSpecies: ["Guadalupe Bass", "Rainbow Trout", "Brown Trout"],
      hatchHighlights: ["Midges (year-round)", "Blue-Winged Olive (Nov-Mar)", "Caddis (Spring)"],
      whyFish: "Texas's only quality trout tailwater. Cold water year-round below Canyon Lake dam. Native Guadalupe bass throughout. Best Nov-Mar for trout, May-Oct for bass on dries.",
      accessNotes: "Guadalupe River State Park and Whitewater Amphitheater. Guide services in New Braunfels.",
      accessPoints: [
        { name: "Guadalupe River State Park", lat: 29.87, lng: -98.50, fee: "$7/person", type: "State park entry" },
        { name: "Rebecca Creek Rd Bridge", lat: 29.85, lng: -98.44, fee: "Free", type: "Walk-in" },
        { name: "Whitewater Amphitheater", lat: 29.71, lng: -98.10, fee: "Free", type: "Parking pullout" },
      ],
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08165300/",
      lat: 29.88, lng: -98.13,
    },
    {
      name: "South Llano River",
      state: "Texas",
      type: "spring creek",
      difficulty: "beginner",
      bestMonths: [4, 5, 6, 7, 8, 9, 10],
      targetSpecies: ["Guadalupe Bass", "Largemouth Bass", "Sunfish"],
      hatchHighlights: ["Caddis (Spring)", "Terrestrials (Summer)", "Crickets and Hoppers (July-Aug)"],
      whyFish: "One of the most beautiful Hill Country streams. Gin-clear spring water, healthy Guadalupe bass, and far less pressure than the Guadalupe. The South Llano River State Park section is exceptional.",
      accessNotes: "Junction, TX area. South Llano River State Park has excellent access.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08149900/",
      lat: 30.47, lng: -99.77,
    },
    {
      name: "Frio River",
      state: "Texas",
      type: "spring creek",
      difficulty: "beginner",
      bestMonths: [4, 5, 6, 7, 8, 9, 10],
      targetSpecies: ["Guadalupe Bass", "Sunfish", "Largemouth Bass"],
      hatchHighlights: ["Caddis (Spring)", "Terrestrials (Summer)", "Hoppers and Crickets (July-Aug)"],
      whyFish: "Spring-fed Hill Country gem with crystal clear water. Guadalupe bass on dries and topwater poppers all summer. The natural swimming area at Garner State Park makes this a local classic.",
      accessNotes: "Leakey and Concan area. Float tubes work great. Crowded on summer weekends.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08194690/",
      lat: 29.45, lng: -99.75,
    },
    {
      name: "San Marcos River",
      state: "Texas",
      type: "spring creek",
      difficulty: "beginner",
      bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      targetSpecies: ["Guadalupe Bass", "Largemouth Bass", "Carp"],
      hatchHighlights: ["Terrestrials (year-round)", "Caddis (Spring)", "Midges (Winter)"],
      whyFish: "San Marcos Springs maintain a constant 68 degrees year-round. One of the clearest rivers in Texas. Visible Guadalupe bass and large carp make this a sight-fishing destination unlike any other in the state.",
      accessNotes: "City Park access is excellent. Highly visible fish in shallow clear water. Light tippet and small flies required.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08170500/",
      lat: 29.88, lng: -97.94,
    },
    {
      name: "Pedernales River",
      state: "Texas",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [4, 5, 6, 9, 10],
      targetSpecies: ["Guadalupe Bass", "Smallmouth Bass", "Carp"],
      hatchHighlights: ["Hoppers (July-Sept)", "Caddis (Apr-May)", "Terrestrials (Summer)"],
      whyFish: "Hill Country limestone river running through LBJ Ranch country. Rocky riffles and pools hold Guadalupe bass and smallmouth. Best fished in spring and fall before heat concentrates fish.",
      accessNotes: "Pedernales Falls State Park is the primary access. Water levels fluctuate significantly with rainfall.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08152900/",
      lat: 30.30, lng: -98.25,
    },
  ],

  "Great Plains & South": [
    {
      name: "South Platte River",
      state: "Colorado",
      type: "tailwater",
      difficulty: "intermediate",
      bestMonths: [3, 4, 5, 9, 10, 11],
      targetSpecies: ["Rainbow Trout", "Brown Trout"],
      hatchHighlights: ["Midge (year-round)", "Blue-Winged Olive (Mar-May)", "PMD (June-July)", "Trico (Aug-Sept)"],
      whyFish: "The Dream Stream below Spinney Reservoir, one of Colorado's most technical tailwaters with consistent big fish.",
      accessNotes: "Eleven Mile Canyon and Dream Stream sections. Catch-and-release only on the Dream Stream.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09035800/",
      lat: 38.98, lng: -105.52,
    },
    {
      name: "Illinois River",
      state: "Oklahoma",
      type: "freestone",
      difficulty: "beginner",
      bestMonths: [4, 5, 6, 9, 10],
      targetSpecies: ["Smallmouth Bass", "Largemouth Bass", "Spotted Bass"],
      hatchHighlights: ["Caddis (Spring)", "Terrestrials (Summer)", "Crawfish patterns (Fall)"],
      whyFish: "Oklahoma's finest smallmouth stream, float trips through the Ozark foothills with scenery to match the fishing.",
      accessNotes: "Float the section from Tenkiller to Tahlequah. Multiple canoe/kayak outfitters on the river.",
      lat: 35.85, lng: -94.98,
    },
  ],

  "Colorado / Rockies": [
    {
      name: "Frying Pan River",
      state: "Colorado",
      type: "tailwater",
      difficulty: "expert",
      bestMonths: [1, 2, 3, 11, 12],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Midge (year-round)", "BWO (Mar-May, Sept-Oct)", "PMD (June-Aug)"],
      whyFish: "World-class tailwater below Ruedi Reservoir, giant midge hatches year-round and the most technical dry fly fishing in Colorado.",
      accessNotes: "Basalt, CO is the hub. Fly fishing only on the lower 1.5 miles. Barbless hooks required. Book guides months in advance.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09080400/",
      lat: 39.37, lng: -107.09,
    },
    {
      name: "South Platte River",
      state: "Colorado",
      type: "tailwater",
      difficulty: "intermediate",
      bestMonths: [3, 4, 5, 9, 10, 11],
      targetSpecies: ["Rainbow Trout", "Brown Trout"],
      hatchHighlights: ["Midge (year-round)", "Blue-Winged Olive (Mar-May)", "PMD (June-July)", "Trico (Aug-Sept)"],
      whyFish: "The Dream Stream below Spinney Reservoir is Colorado's most technical tailwater, consistent trophy fish with challenging spring creek conditions.",
      accessNotes: "Eleven Mile Canyon and Deckers sections are most accessible. Catch-and-release only on the Dream Stream. Crowds on weekends.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09035800/",
      lat: 38.98, lng: -105.52,
    },
    {
      name: "Arkansas River",
      state: "Colorado",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Caddis (May-June)", "PMD (June-Aug)", "Golden Stone (June)", "Trico (Aug-Sept)"],
      whyFish: "Colorado's premier caddis river, the Royal Gorge canyon section is stunning and fishes best in late summer when runoff clears.",
      accessNotes: "Canon City and Salida are hubs. Strong runoff May-early June, plan around it. Wading can be demanding in the gorge section.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07087050/",
      lat: 38.44, lng: -105.87,
    },
    {
      name: "Roaring Fork River",
      state: "Colorado",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Golden Stone (June)", "Caddis (June-Aug)", "PMD (July)", "Hoppers (Aug-Sept)"],
      whyFish: "Blue-ribbon Aspen-area river with excellent stonefly and caddis hatches, great combination of scenery and willing dry fly fish.",
      accessNotes: "Best access between Basalt and Glenwood Springs. Gold Medal water near Aspen. Float or wade the lower sections.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09085000/",
      lat: 39.55, lng: -107.08,
    },
    {
      name: "Gunnison River",
      state: "Colorado",
      type: "wilderness",
      difficulty: "expert",
      bestMonths: [5, 6, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Salmonfly (June)", "Golden Stone (June-July)", "Caddis (July-Aug)", "BWO (Sept-Oct)"],
      whyFish: "The Black Canyon gorge section holds wild browns in breathtaking remote canyon scenery, a bucket-list wade for serious anglers.",
      accessNotes: "Inner gorge requires a technical hike down the Gunnison Route. Wilderness permit required. Not for beginners.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09128000/",
      lat: 38.53, lng: -107.72,
    },
  ],

  "Southwest / Desert Streams": [
    {
      name: "San Juan River",
      state: "New Mexico",
      type: "tailwater",
      difficulty: "beginner",
      bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      targetSpecies: ["Rainbow Trout", "Brown Trout"],
      hatchHighlights: ["Midges (year-round)", "BWO (Feb-Mar, Oct-Nov)", "PMD (June-July)"],
      whyFish: "15,000+ fish per mile in the quality water, arguably the best numbers fishing in the US year-round.",
      accessNotes: "Quality water is 4 miles below Navajo Dam. Small flies (#22-28) and long leaders essential. Very crowded weekends.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09355500/",
      lat: 36.84, lng: -107.87,
    },
    {
      name: "White River",
      state: "Arizona",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [4, 5, 6, 7, 8, 9, 10],
      targetSpecies: ["Apache Trout", "Rainbow Trout", "Brown Trout"],
      hatchHighlights: ["Caddis (May-June)", "PMD (June-July)", "Hoppers (July-Aug)"],
      whyFish: "High-elevation Arizona, Apache trout, the state fish, in remote White Mountain wilderness.",
      accessNotes: "White Mountain Apache Tribal permits required for much of the river. Check ahead, worth every penny.",
      lat: 33.89, lng: -109.73,
    },
    {
      name: "Cimarron River",
      state: "New Mexico",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [5, 6, 7, 8, 9],
      targetSpecies: ["Brown Trout", "Rainbow Trout", "Rio Grande Cutthroat"],
      hatchHighlights: ["PMD (June-July)", "Caddis (June-Aug)", "Hoppers (Aug-Sept)"],
      whyFish: "Unspoiled northern New Mexico canyon river with native Rio Grande cutthroat, remote and uncrowded.",
      accessNotes: "Much of the river flows through private ranches. Philmont Scout Ranch section accessible with permission.",
      lat: 36.51, lng: -104.88,
    },
  ],

  "California / Sierra Nevada": [
    {
      name: "Hot Creek",
      state: "California",
      type: "spring creek",
      difficulty: "expert",
      bestMonths: [5, 6, 7, 8, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["PMD (June-Aug)", "Callibaetis (June-Aug)", "Trico (Aug-Sept)", "BWO (Oct)"],
      whyFish: "The most technical dry fly fishing in California, gin-clear geothermal spring creek with big, educated fish.",
      accessNotes: "Public fishing area is 1.5 miles. Flies and artificial only. Park at Hot Creek Hatchery. Fragile ecosystem, tread carefully.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10265150/",
      lat: 37.68, lng: -118.84,
    },
    {
      name: "Owens River",
      state: "California",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [4, 5, 6, 7, 8, 9, 10],
      targetSpecies: ["Brown Trout", "Rainbow Trout"],
      hatchHighlights: ["Caddis (May-June)", "PMD (June-July)", "Hopper (Aug-Sept)", "BWO (Oct)"],
      whyFish: "High Sierra valley river with consistent flows and willing browns, the Owens Valley is stunning backdrop fishing.",
      accessNotes: "Best from Benton Crossing to Pleasant Valley Reservoir. Check water rights/releases, DWP controls flows.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10336780/",
      lat: 37.38, lng: -118.35,
    },
    {
      name: "Fall River",
      state: "California",
      type: "spring creek",
      difficulty: "expert",
      bestMonths: [5, 6, 7, 8, 9, 10],
      targetSpecies: ["Rainbow Trout"],
      hatchHighlights: ["PMD (June-Aug)", "Callibaetis (June-Sept)", "Trico (Aug)", "BWO (Oct)"],
      whyFish: "California's answer to Henry's Fork, ultra-clear spring creek with massive rainbows that demand perfection.",
      accessNotes: "Boat-only access (electric motors). Public ramps available. Flies and barbless only. Catch-and-release strongly encouraged.",
      lat: 40.88, lng: -121.43,
    },
  ],

  "Alaska / Pacific": [
    {
      name: "Kenai River",
      state: "Alaska",
      type: "freestone",
      difficulty: "beginner",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Chinook Salmon", "Sockeye Salmon", "Rainbow Trout"],
      hatchHighlights: ["King Salmon Run (May-July)", "Sockeye Run (July-Aug)", "Silver Salmon (Aug-Sept)"],
      whyFish: "World-record Chinook salmon water, the Kenai is Alaska's most accessible world-class fishery.",
      accessNotes: "Sterling Highway access throughout. Popular, hire a guide for best results. Float permits required on some sections.",
      usgsUrl: "https://waterdata.usgs.gov/monitoring-location/15266300/",
      lat: 60.48, lng: -150.67,
    },
    {
      name: "Naknek River",
      state: "Alaska",
      type: "freestone",
      difficulty: "intermediate",
      bestMonths: [6, 7, 8, 9],
      targetSpecies: ["Rainbow Trout", "Sockeye Salmon", "Chinook Salmon"],
      hatchHighlights: ["Sockeye Run (July)", "Rainbow following salmon (July-Sept)", "Flesh Fly (Aug)"],
      whyFish: "Bristol Bay's anchor river, trophy rainbows stacked behind sockeye runs. Remote lodge-based fishing.",
      accessNotes: "Fly into King Salmon, AK. Lodge-based operation required for most access. Plan 1+ year ahead.",
      lat: 58.70, lng: -157.00,
    },
    {
      name: "Kanektok River",
      state: "Alaska",
      type: "wilderness",
      difficulty: "intermediate",
      bestMonths: [7, 8, 9],
      targetSpecies: ["Rainbow Trout", "Chum Salmon", "Coho Salmon", "Arctic Char"],
      hatchHighlights: ["Chum Run (July)", "Coho Run (Aug-Sept)", "Rainbow post-spawn (Aug-Sept)"],
      whyFish: "One of Alaska's last wild rainbow rivers, multi-day float camp through untouched tundra with fish on every cast.",
      accessNotes: "Fly into Quinhagak, AK via Anchorage. Float camp trips 5-7 days. Very remote, guide operations essential.",
      lat: 59.75, lng: -161.25,
    },
  ],
};

// Map snake_case region keys (from flyData.ts) → human-readable keys used here
const regionKeyMap: Record<string, string> = {
  montana_rockies: "Rocky Mountain / Intermountain",
  pacific_northwest: "Pacific Northwest / Northern Rockies",
  northeast: "Northeast / Appalachian",
  appalachian_east: "Northeast / Appalachian",
  southeast: "Southeast / Appalachian Tailwaters",
  great_lakes: "Great Lakes / Midwest",
  texas_hill_country: "Texas Hill Country",
  great_plains: "Great Plains & South",
  southwest: "Southwest / Desert Streams",
  california: "California / Sierra Nevada",
  alaska: "Alaska / Pacific",
};

export function getRiversForRegion(region: string): RiverRecommendation[] {
  return riversByRegion[region] ?? riversByRegion[regionKeyMap[region]] ?? [];
}

export function getDifficultyColor(d: RiverRecommendation["difficulty"]): string {
  if (d === "beginner") return "#9acd5a";    // green
  if (d === "intermediate") return "#3D6B83"; // sky blue — clearly distinct from both green and red
  return "#ef4444";                            // true red
}

export function getTypeLabel(t: RiverRecommendation["type"]): string {
  const map: Record<string, string> = {
    freestone: "Freestone",
    tailwater: "Tailwater",
    "spring creek": "Spring Creek",
    wilderness: "Wilderness",
  };
  return map[t] ?? t;
}

// ── State-level curated spot cards ───────────────────────────────────────────
// Keyed by 2-letter state abbr. These show in "Best Rivers" when GPS/search
// resolves to a specific state, giving users local spots instead of region-wide.
export const riversByState: Record<string, RiverRecommendation[]> = {
  MT: [
    { name: "Madison River", state: "Montana", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Salmonfly (June)","PMD (July)","Caddis (Aug-Sept)","Trico (Aug)"], whyFish: "Montana's most celebrated trout river, 50-mile float from Quake Lake to Ennis with relentless action.", accessNotes: "Public access throughout. Ennis is the hub. Go early, heavily fished in summer.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06037500/", lat: 45.35, lng: -111.75 },
    { name: "Yellowstone River", state: "Montana", type: "freestone", difficulty: "intermediate", bestMonths: [7,8,9,10], targetSpecies: ["Cutthroat Trout","Brown Trout"], hatchHighlights: ["Salmonfly (June)","Caddis (July-Aug)","Hoppers (Aug-Sept)"], whyFish: "The longest undammed river in the lower 48, wild cutthroat on floating lines in big open water.", accessNotes: "Best from Livingston downstream. Float fishing dominates. Public access at bridge crossings.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06192500/", lat: 45.66, lng: -110.56 },
    { name: "Gallatin River", state: "Montana", type: "freestone", difficulty: "beginner", bestMonths: [6,7,8,9], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Caddis (June-Sept)","PMD (July)","Hoppers (Aug-Sept)"], whyFish: "A River Runs Through It country, accessible canyon water perfect for learning dry fly fishing.", accessNotes: "Highway 191 parallels with pullouts every mile. Less pressure than the Madison.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06043500/", lat: 45.68, lng: -111.05 },
    { name: "Big Hole River", state: "Montana", type: "freestone", difficulty: "intermediate", bestMonths: [6,7,8], targetSpecies: ["Brown Trout","Rainbow Trout","Arctic Grayling"], hatchHighlights: ["Salmonfly (June)","PMD (July)","Hoppers (Aug)"], whyFish: "Last stronghold of the fluvial Arctic grayling in the lower 48, fish both grayling and trout in the same run.", accessNotes: "Wise River is the gateway. Salmonfly hatch in early June is legendary. Go early for grayling.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06024540/", lat: 45.78, lng: -113.42 },
    { name: "Missouri River", state: "Montana", type: "tailwater", difficulty: "intermediate", bestMonths: [5,6,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Trico (Aug)","PMD (June-July)","Midge (year-round)","BWO (Sept-Oct)"], whyFish: "Tailwater below Holter Dam, massive prolific hatches, technical dry fly fishing for big fish.", accessNotes: "Craig, MT is the hub. Boat access essential. Midge and Trico hatches are the most reliable.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06054500/", lat: 47.04, lng: -111.66 },
  ],
  WY: [
    { name: "Snake River", state: "Wyoming", type: "freestone", difficulty: "beginner", bestMonths: [7,8,9], targetSpecies: ["Cutthroat Trout"], hatchHighlights: ["Green Drake (July)","PMD (July-Aug)","Caddis (Aug)","Hoppers (Aug-Sept)"], whyFish: "Jackson Hole's fine-spotted cutthroat eat dry flies aggressively, classic western float trip scenery.", accessNotes: "Float from Deadman's Bar to Moose is the classic run. Grand Teton NP permits required for some sections.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13013650/", lat: 43.65, lng: -110.70 },
    { name: "Green River", state: "Wyoming", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","BWO (Apr-May, Oct)","Caddis (June-July)"], whyFish: "Flaming Gorge tailwater, trophy browns in a red rock canyon, one of Wyoming's hidden gems.", accessNotes: "Access at Little Hole. Drift boats essential on the canyon section. Crowds in summer, go fall.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09188500/", lat: 40.93, lng: -109.47 },
    { name: "North Platte River", state: "Wyoming", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["PMD (June-July)","Caddis (May-June)","Trico (Aug-Sept)","BWO (Sept-Oct)"], whyFish: "Miracle Mile and Miracle Mile sections, Wyoming's most productive tailwater fishery with consistent big fish.", accessNotes: "Access near Saratoga and Alcova. Miracle Mile and Grey Reef are the marquee sections.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06630000/", lat: 41.75, lng: -107.20 },
    { name: "Bighorn River", state: "Wyoming", type: "tailwater", difficulty: "beginner", bestMonths: [7,8,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Trico (Aug-Sept)","PMD (June-July)","Midge (year-round)","Caddis (June)"], whyFish: "Thermopolis tailwater, excellent public access and prolific hatches in a scenic high-desert canyon.", accessNotes: "Thermopolis is the gateway. Tailwaters below Wedding of the Waters are productive year-round.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06259500/", lat: 43.62, lng: -108.20 },
  ],
  ID: [
    { name: "Henry's Fork", state: "Idaho", type: "spring creek", difficulty: "expert", bestMonths: [6,7,8], targetSpecies: ["Rainbow Trout"], hatchHighlights: ["PMD (July-Aug)","Green Drake (July)","Trico (Aug)","Callibaetis (Aug)"], whyFish: "The Railroad Ranch section is the world's most demanding dry fly water, big visible fish, ultra-clear currents.", accessNotes: "Harriman State Park requires walk-in. No wading in key sections. Arrive before 7am.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13042500/", lat: 44.47, lng: -111.39 },
    { name: "South Fork Snake River", state: "Idaho", type: "freestone", difficulty: "intermediate", bestMonths: [6,7,8,9], targetSpecies: ["Cutthroat Trout","Brown Trout"], hatchHighlights: ["Green Drake (June-July)","PMD (July-Aug)","Caddis (Aug-Sept)"], whyFish: "Pristine canyon float with wild cutthroat that eat dry flies aggressively, classic Idaho river experience.", accessNotes: "Float-only on the canyon section. Palisades to Lorenzo is the classic 2-day float.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13057940/", lat: 43.47, lng: -111.22 },
    { name: "Silver Creek", state: "Idaho", type: "spring creek", difficulty: "expert", bestMonths: [7,8,9], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["PMD (July)","Trico (Aug-Sept)","Callibaetis (Aug)","Baetis (Oct)"], whyFish: "Ernest Hemingway fished here, legendary spring creek with spring-fed gin-clear water and selective fish.", accessNotes: "The Preserve section is TNC managed, day use fees apply. No bait. Barbless. Presentation must be perfect.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13150430/", lat: 43.40, lng: -114.39 },
    { name: "Boise River", state: "Idaho", type: "tailwater", difficulty: "beginner", bestMonths: [4,5,9,10], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["BWO (Apr-May)","Caddis (May-June)","PMD (June-July)","Midge (year-round)"], whyFish: "Urban tailwater right through Boise, accessible, wade-friendly, and surprisingly good fish.", accessNotes: "Multiple access points from the greenbelt. Best in spring and fall. Easy beginner water.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/13206000/", lat: 43.60, lng: -116.20 },
  ],
  CO: [
    { name: "Frying Pan River", state: "Colorado", type: "tailwater", difficulty: "expert", bestMonths: [1,2,3,11,12], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-May, Sept-Oct)","PMD (June-Aug)"], whyFish: "World-class tailwater below Ruedi Reservoir, giant midge hatches year-round, the most technical dry fly fishing in Colorado.", accessNotes: "Basalt is the hub. Fly fishing only on the lower 1.5 miles. Barbless hooks. Book guides months ahead.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09080400/", lat: 39.37, lng: -107.09 },
    { name: "South Platte River", state: "Colorado", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","Blue-Winged Olive (Mar-May)","PMD (June-July)","Trico (Aug-Sept)"], whyFish: "The Dream Stream below Spinney Reservoir, Colorado's most technical tailwater with consistent trophy fish.", accessNotes: "Eleven Mile Canyon and Deckers are most accessible. Catch-and-release only on the Dream Stream.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09035800/", lat: 38.98, lng: -105.52 },
    { name: "Arkansas River", state: "Colorado", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Caddis (May-June)","PMD (June-Aug)","Golden Stone (June)","Trico (Aug-Sept)"], whyFish: "Colorado's premier caddis river, the Royal Gorge canyon section is stunning and fishes best in late summer.", accessNotes: "Canon City and Salida are hubs. Runoff May-early June, plan around it. Wading can be technical.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07087050/", lat: 38.44, lng: -105.87 },
    { name: "Roaring Fork River", state: "Colorado", type: "freestone", difficulty: "intermediate", bestMonths: [6,7,8,9], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Golden Stone (June)","Caddis (June-Aug)","PMD (July)","Hoppers (Aug-Sept)"], whyFish: "Blue-ribbon Aspen-area river with excellent stonefly and caddis hatches in a stunning alpine setting.", accessNotes: "Best access between Basalt and Glenwood Springs. Gold Medal water near Aspen.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09085000/", lat: 39.55, lng: -107.08 },
    { name: "Gunnison River", state: "Colorado", type: "wilderness", difficulty: "expert", bestMonths: [5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Salmonfly (June)","Golden Stone (June-July)","Caddis (July-Aug)","BWO (Sept-Oct)"], whyFish: "The Black Canyon gorge holds wild browns in breathtaking remote canyon scenery, a bucket-list wade.", accessNotes: "Inner gorge requires a technical hike down the Gunnison Route. Wilderness permit required.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09128000/", lat: 38.53, lng: -107.72 },
  ],
  UT: [
    { name: "Green River (A-C)", state: "Utah", type: "tailwater", difficulty: "beginner", bestMonths: [4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","BWO (Apr-May)","PMD (June-July)","Caddis (May-June)"], whyFish: "Below Flaming Gorge Dam, some of the largest fish per mile in the country with good access.", accessNotes: "Dutch John, UT is the gateway. A, B, and C sections all fish differently, A is most technical.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09261000/", lat: 40.91, lng: -109.42 },
    { name: "Provo River", state: "Utah", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (Jan-Apr)","BWO (Apr-May)","Caddis (May-June)","PMD (July-Aug)"], whyFish: "Middle Provo is Utah's most accessible Blue Ribbon tailwater, consistent flows and prolific hatches near Provo.", accessNotes: "Multiple access points off US-189. Barbless strongly recommended. Boat or wade.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10154200/", lat: 40.36, lng: -111.52 },
    { name: "Logan River", state: "Utah", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8], targetSpecies: ["Brown Trout","Cutthroat Trout","Brook Trout"], hatchHighlights: ["Caddis (May-June)","PMD (June-July)","Golden Stone (June)","Hoppers (Aug)"], whyFish: "Logan Canyon scenic byway river, accessible mountain freestone with wild browns and cutthroat.", accessNotes: "US-89 follows the canyon. Multiple pullouts and campgrounds. Good beginner water.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10109000/", lat: 41.73, lng: -111.55 },
  ],
  NV: [
    { name: "Truckee River", state: "Nevada", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Caddis (May-June)","PMD (June-July)","Trico (Aug-Sept)","BWO (Sept-Oct)"], whyFish: "Strong evening caddis hatches in May-June near Reno, the most accessible fly fishing in Nevada.", accessNotes: "Multiple access points along I-80 corridor near Reno. Urban reach is easy wading.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10348000/", lat: 39.52, lng: -119.81 },
    { name: "East Walker River", state: "Nevada", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Caddis (May)","PMD (June-July)","Trico (Aug-Sept)","BWO (Oct)"], whyFish: "High desert tailwater below Bridgeport Reservoir, monster browns and rainbows in a remote sagebrush canyon.", accessNotes: "Access off US-395. Best in April-May and September-October. Watch for private property.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10293000/", lat: 38.70, lng: -119.18 },
  ],
  WA: [
    { name: "Yakima River", state: "Washington", type: "freestone", difficulty: "intermediate", bestMonths: [3,4,5,9,10], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Skwala Stonefly (Mar-Apr)","PMD (June-July)","Caddis (May-Sept)","October Caddis (Sept-Oct)"], whyFish: "Washington's premier dry fly river, Skwala stonefly in late March brings aggressive rainbows to the surface.", accessNotes: "Ellensburg to Yakima canyon is the best stretch. Drift boats preferred. Excellent wade access in canyon.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/12484500/", lat: 46.60, lng: -120.51 },
    { name: "Methow River", state: "Washington", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,9,10], targetSpecies: ["Steelhead","Cutthroat Trout","Rainbow Trout"], hatchHighlights: ["PMD (June-July)","Caddis (June-Aug)","October Caddis (Sept-Oct)","Steelhead (Sept-Nov)"], whyFish: "North Cascades steelhead and resident trout, remote Okanogan Highlands with stunning mountain scenery.", accessNotes: "Highway 20 follows the river. Wade fishing throughout. Steelhead September-November.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/12448500/", lat: 48.39, lng: -119.99 },
    { name: "Skagit River", state: "Washington", type: "freestone", difficulty: "intermediate", bestMonths: [1,2,3,11,12], targetSpecies: ["Steelhead","Bull Trout"], hatchHighlights: ["Winter Steelhead (Dec-Mar)","Coho Salmon (Oct-Nov)","Caddis (May-June)"], whyFish: "Wild steelhead in old-growth forest canyon, one of the last strongholds for wild winter steelhead.", accessNotes: "Marblemount to Concrete is the prime reach. Spey fishing preferred. Permit may be required.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/12194000/", lat: 48.51, lng: -121.73 },
    { name: "Klickitat River", state: "Washington", type: "freestone", difficulty: "intermediate", bestMonths: [9,10,11], targetSpecies: ["Steelhead","Cutthroat Trout"], hatchHighlights: ["Fall Steelhead (Sept-Nov)","Summer Caddis (July-Aug)","PMD (June)"], whyFish: "Volcanic gorge steelhead, fall B-run fish to 15 pounds in spectacular Columbia Gorge canyon.", accessNotes: "Access from Lyle, WA. Upper river requires hiking. Best in October.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/14107000/", lat: 45.83, lng: -121.10 },
  ],
  OR: [
    { name: "Deschutes River", state: "Oregon", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,7,9,10], targetSpecies: ["Redside Rainbow","Steelhead"], hatchHighlights: ["Salmonfly (May-June)","Golden Stone (June)","Caddis (July-Sept)","Fall Steelhead (Sept-Nov)"], whyFish: "Oregon's crown jewel, canyon float with aggressive redside rainbows and world-class fall steelhead.", accessNotes: "Lower canyon (Maupin area) is most accessible. Upper river for wade fishing. Shuttle services available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/14050000/", lat: 45.08, lng: -121.10 },
    { name: "North Umpqua River", state: "Oregon", type: "freestone", difficulty: "intermediate", bestMonths: [7,8,9,10], targetSpecies: ["Steelhead","Brown Trout"], hatchHighlights: ["Summer Steelhead (July-Sept)","Caddis (June-Aug)","October Caddis (Sept-Oct)"], whyFish: "Classic summer steelhead river, swing wet flies through long glides in a remote Douglas fir canyon.", accessNotes: "Restricted to fly fishing only on designated sections. Guides recommended for first-timers.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/14317000/", lat: 43.24, lng: -122.53 },
    { name: "McKenzie River", state: "Oregon", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Rainbow Trout","Cutthroat Trout"], hatchHighlights: ["Salmonfly (May-June)","Caddis (June-Aug)","PMD (July)","October Caddis (Sept-Oct)"], whyFish: "Classic drift boat river through the Cascade foothills, the birthplace of the McKenzie drift boat.", accessNotes: "Multiple put-in/take-out points. Eugene-area guides offer half-day floats. Great beginner option.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/14162500/", lat: 44.11, lng: -122.56 },
    { name: "Metolius River", state: "Oregon", type: "spring creek", difficulty: "expert", bestMonths: [5,6,7,8,9], targetSpecies: ["Rainbow Trout","Bull Trout"], hatchHighlights: ["PMD (June-Aug)","BWO (May, Sept-Oct)","Caddis (June-Aug)"], whyFish: "One of America's most beautiful trout streams, spring-fed, crystal clear, sight-fishing to selective rainbows.", accessNotes: "Barbless only on the trophy section. Walk-in only below Camp Sherman. No bait.", lat: 44.45, lng: -121.63 },
  ],
  CA: [
    { name: "Hot Creek", state: "California", type: "spring creek", difficulty: "expert", bestMonths: [5,6,7,8,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["PMD (June-Aug)","Callibaetis (June-Aug)","Trico (Aug-Sept)","BWO (Oct)"], whyFish: "The most technical dry fly fishing in California, gin-clear geothermal spring creek with big, educated fish.", accessNotes: "Public fishing area is 1.5 miles. Flies and artificial only. Fragile ecosystem, tread carefully.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10265150/", lat: 37.68, lng: -118.84 },
    { name: "Fall River", state: "California", type: "spring creek", difficulty: "expert", bestMonths: [5,6,7,8,9,10], targetSpecies: ["Rainbow Trout"], hatchHighlights: ["PMD (June-Aug)","Callibaetis (June-Sept)","Trico (Aug)","BWO (Oct)"], whyFish: "California's answer to Henry's Fork, ultra-clear spring creek with massive rainbows that demand perfection.", accessNotes: "Boat-only access (electric motors). Public ramps available. Barbless and flies-only.", lat: 40.88, lng: -121.43 },
    { name: "Hat Creek", state: "California", type: "spring creek", difficulty: "expert", bestMonths: [5,6,7,9,10], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["PMD (June-Aug)","Trico (Aug-Sept)","Callibaetis (June-Aug)","BWO (Oct)"], whyFish: "Wild trout section, crystal clear spring creek with selective fish and prolific insect life near Burney.", accessNotes: "Catch Wild Trout section on CA-89. Flies and lures only. Walk-in from road pullouts.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/11367500/", lat: 40.86, lng: -121.45 },
    { name: "Owens River", state: "California", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Caddis (May-June)","PMD (June-July)","Hopper (Aug-Sept)","BWO (Oct)"], whyFish: "High Sierra valley river with consistent flows and willing browns, stunning Eastern Sierra backdrop.", accessNotes: "Best from Benton Crossing to Pleasant Valley Reservoir. Check water releases, DWP controls flows.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10265500/", lat: 37.38, lng: -118.35 },
    { name: "East Walker River", state: "California", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Caddis (May)","PMD (June-July)","Trico (Aug-Sept)","BWO (Oct)"], whyFish: "High desert tailwater below Bridgeport Reservoir, monster browns in a remote Eastern Sierra canyon.", accessNotes: "Access off US-395. Best in April-May and September-October.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/10293000/", lat: 38.70, lng: -119.18 },
  ],
  AK: [
    { name: "Kenai River", state: "Alaska", type: "freestone", difficulty: "beginner", bestMonths: [6,7,8,9], targetSpecies: ["Chinook Salmon","Sockeye Salmon","Rainbow Trout"], hatchHighlights: ["King Salmon (May-July)","Sockeye (July-Aug)","Silver Salmon (Aug-Sept)","Rainbow following salmon (July-Sept)"], whyFish: "World-record Chinook salmon water, Alaska's most accessible world-class fishery.", accessNotes: "Sterling Highway access throughout. Popular, hire a guide for best results.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/15266300/", lat: 60.48, lng: -150.67 },
    { name: "Naknek River", state: "Alaska", type: "freestone", difficulty: "intermediate", bestMonths: [6,7,8,9], targetSpecies: ["Rainbow Trout","Sockeye Salmon"], hatchHighlights: ["Sockeye Run (July)","Rainbow trailing salmon (July-Sept)","Flesh Fly (Aug)"], whyFish: "Bristol Bay's anchor river, trophy rainbows stacked behind sockeye runs. Remote lodge-based.", accessNotes: "Fly into King Salmon, AK. Lodge-based operation required. Plan 1+ year ahead.", lat: 58.70, lng: -157.00 },
    { name: "Situk River", state: "Alaska", type: "wilderness", difficulty: "intermediate", bestMonths: [4,5,9,10], targetSpecies: ["Steelhead","Coho Salmon"], hatchHighlights: ["Spring Steelhead (Apr-May)","Fall Steelhead (Sept-Oct)","Coho Salmon (Sept-Oct)"], whyFish: "Yakutat steelhead, one of the most productive steelhead rivers per mile anywhere.", accessNotes: "Fly into Yakutat, AK. Float trip or wade. Very remote, guide services essential.", lat: 59.65, lng: -139.50 },
  ],
  NM: [
    { name: "San Juan River", state: "New Mexico", type: "tailwater", difficulty: "beginner", bestMonths: [1,2,3,4,5,6,7,8,9,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","BWO (Feb-Mar, Oct-Nov)","PMD (June-July)"], whyFish: "15,000+ fish per mile, arguably the best numbers fishing in the US year-round.", accessNotes: "Quality water is 4 miles below Navajo Dam. Small flies (#22-28) essential. Very crowded weekends.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09355500/", lat: 36.84, lng: -107.87 },
    { name: "Cimarron River", state: "New Mexico", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brown Trout","Cutthroat Trout"], hatchHighlights: ["PMD (June-July)","Caddis (June-Aug)","Hoppers (Aug-Sept)"], whyFish: "Unspoiled northern NM canyon river with native Rio Grande cutthroat, remote and uncrowded.", accessNotes: "Much flows through private ranches. Philmont Scout Ranch section accessible with permission.", lat: 36.51, lng: -104.88 },
    { name: "Rio Grande (NM)", state: "New Mexico", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Cutthroat Trout"], hatchHighlights: ["PMD (May-July)","Caddis (Apr-May)","Stonefly (June)","BWO (Oct)"], whyFish: "Wild trout in the Rio Grande Gorge, steep canyon walls and remote access make this a true wilderness wade.", accessNotes: "Pilar area is most accessible. Class III rapids limit wading to low-water season.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08279500/", lat: 36.17, lng: -105.83 },
  ],
  AZ: [
    { name: "Colorado River at Lee's Ferry", state: "Arizona", type: "tailwater", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Nov-Mar)","BWO (Mar-May)","Caddis (Apr-June)","Trico (Aug-Sept)"], whyFish: "Arizona's premier trout fishery below Glen Canyon Dam, clear water and big rainbows on midges and nymphs.", accessNotes: "Marble Canyon Lodge is the hub. 15-mile section from the dam. Guide services available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09380000/", lat: 36.86, lng: -111.59 },
    { name: "White River", state: "Arizona", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,7,8], targetSpecies: ["Apache Trout","Rainbow Trout"], hatchHighlights: ["Caddis (May-June)","PMD (June-July)","Hoppers (July-Aug)"], whyFish: "High-elevation Arizona, Apache trout, the state fish, in remote White Mountain wilderness.", accessNotes: "White Mountain Apache Tribal permits required for most of the river. Worth every penny.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09491500/", lat: 33.89, lng: -109.73 },
    { name: "Oak Creek", state: "Arizona", type: "freestone", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["BWO (Mar-Apr)","Caddis (Apr-May)","PMD (May-June)","Trico (Aug-Sept)"], whyFish: "Sedona red rock canyon creek, small but beautiful, surprisingly productive in the right conditions.", accessNotes: "West Fork section is hike-in and spectacular. Slide Rock State Park section is accessible but crowded.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/09504500/", lat: 34.87, lng: -111.75 },
  ],
  TX: [
    { name: "Guadalupe River", state: "Texas", type: "tailwater", difficulty: "beginner", bestMonths: [11,12,1,2,3], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","BWO (Nov-Mar)","Caddis (Spring)"], whyFish: "Texas's only quality trout tailwater, cold water year-round below Canyon Lake dam, best Nov-Mar when water temps drop.", accessNotes: "Guadalupe River State Park and Whitewater Amphitheater. Guide services in New Braunfels.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08165300/", lat: 29.88, lng: -98.13,
      accessPoints: [
        { name: "Guadalupe River State Park", lat: 29.87, lng: -98.50, fee: "$7/person", type: "State park entry" },
        { name: "Rebecca Creek Rd Bridge", lat: 29.85, lng: -98.44, fee: "Free", type: "Walk-in" },
        { name: "Whitewater Amphitheater", lat: 29.71, lng: -98.10, fee: "Free", type: "Parking pullout" },
        { name: "Canyon Dam Tailrace", lat: 29.88, lng: -98.19, fee: "Free", type: "Walk-in" },
      ],
    },
    { name: "South Llano River", state: "Texas", type: "spring creek", difficulty: "beginner", bestMonths: [4,5,6,7,8,9,10], targetSpecies: ["Guadalupe Bass","Largemouth Bass","Sunfish"], hatchHighlights: ["Caddis (Spring)","Terrestrials (Summer)","Crickets and Hoppers (July-Aug)"], whyFish: "Spring-fed Hill Country river, crystal clear with Guadalupe bass hitting dry flies all summer.", accessNotes: "Junction, TX area. South Llano River State Park has excellent access.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08149900/", lat: 30.37, lng: -99.77,
      accessPoints: [
        { name: "South Llano River State Park", lat: 30.45, lng: -99.76, fee: "$6/person", type: "State park entry" },
        { name: "Junction City Park", lat: 30.48, lng: -99.77, fee: "Free", type: "Walk-in" },
      ],
    },
    { name: "Frio River", state: "Texas", type: "spring creek", difficulty: "beginner", bestMonths: [4,5,6,7,8,9,10], targetSpecies: ["Guadalupe Bass","Sunfish","Largemouth Bass"], hatchHighlights: ["Caddis (Spring)","Terrestrials (Summer)","Hoppers and Crickets (July-Aug)"], whyFish: "Spring-fed Texas Hill Country gem, crystal clear 68°F water, Guadalupe bass on dries and topwater poppers.", accessNotes: "Leakey and Concan area. Float tubes work great. Crowded summer weekends.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08194690/", lat: 29.45, lng: -99.75,
      accessPoints: [
        { name: "Garner State Park", lat: 29.59, lng: -99.74, fee: "$8/person", type: "State park entry" },
        { name: "Concan River Access", lat: 29.46, lng: -99.70, fee: "Free", type: "Walk-in" },
        { name: "Leakey City Park", lat: 29.73, lng: -99.80, fee: "Free", type: "Walk-in" },
      ],
    },
    { name: "San Marcos River", state: "Texas", type: "spring creek", difficulty: "beginner", bestMonths: [1,2,3,4,5,6,7,8,9,10,11,12], targetSpecies: ["Guadalupe Bass","Largemouth Bass","Carp"], hatchHighlights: ["Terrestrials (year-round)","Caddis (Spring)","Midges (Winter)"], whyFish: "Constant 68°F spring-fed river through San Marcos, year-round bass and sight-fishing for carp.", accessNotes: "City Park access excellent. Highly visible fish. Light tippet and small flies required.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08170500/", lat: 29.88, lng: -97.94,
      accessPoints: [
        { name: "City Park (Spring Lake)", lat: 29.89, lng: -97.93, fee: "Free", type: "Walk-in" },
        { name: "Rio Vista Park", lat: 29.88, lng: -97.93, fee: "Free", type: "Walk-in" },
        { name: "Sewell Park", lat: 29.88, lng: -97.94, fee: "Free", type: "Walk-in" },
      ],
    },
    { name: "Pedernales River", state: "Texas", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Guadalupe Bass","Smallmouth Bass","Largemouth Bass"], hatchHighlights: ["Hoppers (July-Sept)","Caddis (Apr-May)","Terrestrials (Summer)"], whyFish: "Hill Country limestone river with Guadalupe and smallmouth bass, LBJ National Historical Park has public access.", accessNotes: "Pedernales Falls State Park is the best access point. Low water summer wading is excellent.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/08152900/", lat: 30.31, lng: -98.25,
      accessPoints: [
        { name: "Pedernales Falls State Park", lat: 30.31, lng: -98.25, fee: "$6/person", type: "State park entry" },
        { name: "LBJ Ranch Crossing", lat: 30.25, lng: -98.63, fee: "Free", type: "Walk-in" },
      ],
    },
  ],
  OK: [
    { name: "Illinois River", state: "Oklahoma", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Smallmouth Bass","Largemouth Bass","Spotted Bass"], hatchHighlights: ["Caddis (Spring)","Terrestrials (Summer)","Crawfish patterns (Fall)"], whyFish: "Oklahoma's finest smallmouth stream, float trips through Ozark foothills with excellent scenery.", accessNotes: "Tenkiller to Tahlequah float. Multiple canoe/kayak outfitters. Great beginner float water.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07196500/", lat: 35.85, lng: -94.98 },
    { name: "Lower Mountain Fork River", state: "Oklahoma", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Oct-Mar)","BWO (Mar-Apr)","Caddis (Apr-May)","Sulphur (May-June)"], whyFish: "Broken Bow tailwater, Oklahoma's best trout fishery with quality catch-and-release water.", accessNotes: "Beavers Bend State Park. Dam releases affect wading, check schedule. Guides available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07338750/", lat: 34.11, lng: -94.68 },
  ],
  KS: [
    { name: "Flint Hills Streams", state: "Kansas", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Smallmouth Bass","Largemouth Bass","Carp"], hatchHighlights: ["Caddis (May-June)","Hoppers (July-Aug)","Terrestrials (Summer)"], whyFish: "Prairie limestone streams, surprising smallmouth action on streamers and crayfish patterns.", accessNotes: "Best waded during low water in late summer. Cottonwood and Neosho River tributaries.", lat: 38.50, lng: -96.80 },
  ],
  NE: [
    { name: "Dismal River", state: "Nebraska", type: "spring creek", difficulty: "beginner", bestMonths: [6,7,8], targetSpecies: ["Smallmouth Bass","Brown Trout"], hatchHighlights: ["Caddis (May-June)","Terrestrials (July-Aug)","Hoppers (July-Sept)"], whyFish: "Sandhills spring-fed gem, crystal clear water with smallmouth on dry flies and poppers.", accessNotes: "Thedford, NE area. Limited public access, plan ahead. Float tube or wade.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06775900/", lat: 41.96, lng: -100.47 },
    { name: "Niobrara River", state: "Nebraska", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Smallmouth Bass","Rock Bass"], hatchHighlights: ["Caddis (May-June)","Terrestrials (Summer)","Hoppers (July-Sept)"], whyFish: "National Scenic River, float fishing for smallmouth in a spectacular Valentine, NE canyon setting.", accessNotes: "Canoe outfitters in Valentine. National Park Service access points throughout.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06462000/", lat: 42.87, lng: -100.55 },
  ],
  ND: [
    { name: "Missouri River (ND)", state: "North Dakota", type: "tailwater", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Walleye","Smallmouth Bass","Northern Pike"], hatchHighlights: ["Caddis (May-June)","Hoppers (July-Aug)","Terrestrials (Summer)"], whyFish: "Tailwater below Garrison Dam, surprisingly good walleye and smallmouth on streamers in the Great Plains.", accessNotes: "Bismarck area provides best access. Spring fishing is most productive.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06342500/", lat: 47.54, lng: -101.43 },
  ],
  SD: [
    { name: "Rapid Creek", state: "South Dakota", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["BWO (Apr-May)","Caddis (May-June)","PMD (June-July)","Trico (Aug-Sept)"], whyFish: "Urban Black Hills fishery, wild browns up to 20 inches right through Rapid City.", accessNotes: "Excellent public access throughout the city. Catch-and-release sections available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06412500/", lat: 44.08, lng: -103.24 },
    { name: "Spearfish Creek", state: "South Dakota", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["BWO (Apr-May)","Caddis (May-June)","PMD (June)","Hopper (July-Aug)"], whyFish: "Limestone canyon creek, stunning Black Hills scenery with wild brown trout.", accessNotes: "Spearfish Canyon is accessible. Multiple highway pullouts. Town Creek section is easiest.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/06407000/", lat: 44.48, lng: -103.86 },
  ],
  IA: [
    { name: "Upper Iowa River", state: "Iowa", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Smallmouth Bass"], hatchHighlights: ["Caddis (May-June)","Sulphur (May-June)","BWO (Sept-Oct)"], whyFish: "Northeast Iowa Driftless Area, wild brown trout in limestone spring creek country.", accessNotes: "Decorah area. DNR access points throughout. Float canoe or wade.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05387500/", lat: 43.45, lng: -91.70 },
    { name: "Yellow River", state: "Iowa", type: "spring creek", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Caddis (May-June)","BWO (Apr-May, Sept-Oct)","Sulphur (May)"], whyFish: "Remote Driftless spring creek, wild brook trout in a setting that feels like Vermont.", accessNotes: "Yellow River State Forest provides access. Gravel roads, high clearance recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05388770/", lat: 43.25, lng: -91.28 },
  ],
  MN: [
    { name: "Whitewater River", state: "Minnesota", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Sulphur (May-June)","Trico (Aug)"], whyFish: "Southeast MN Driftless, wild brown trout in limestone spring creek country near Winona.", accessNotes: "Whitewater State Park area. Multiple DNR access points. Catch-and-release encouraged.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05376000/", lat: 44.05, lng: -91.98 },
    { name: "Root River", state: "Minnesota", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Smallmouth Bass"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Sulphur (May-June)","Hex (June)"], whyFish: "Lanesboro area, excellent spring hatches, wild browns, and smallmouth in a trail town setting.", accessNotes: "Lanesboro is the hub with outfitters and guides. State trail parallels the river.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05383900/", lat: 43.71, lng: -91.97 },
  ],
  MO: [
    { name: "Current River", state: "Missouri", type: "spring creek", difficulty: "beginner", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout","Smallmouth Bass"], hatchHighlights: ["Caddis (Apr-May)","Sulphur (May-June)","BWO (Sept-Oct)","Midges (Jan-Mar)"], whyFish: "Ozark spring creek, gin-clear water year-round with wild brown trout and classic smallmouth float fishing.", accessNotes: "Ozark National Scenic Riverways manages most of the river. Multiple access points and campgrounds.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07064535/", lat: 36.96, lng: -91.35 },
    { name: "North Fork White River", state: "Missouri", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (Oct-Mar)","Caddis (Apr-May)","Sulphur (May-June)","BWO (Sept-Oct)"], whyFish: "Cold Ozark tailwater, trophy browns in remote springs country near Mountain Grove.", accessNotes: "Twin Bridges access is excellent. Missouri C&R trout park sections available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07057470/", lat: 36.89, lng: -92.35 },
    { name: "Meramec River", state: "Missouri", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Smallmouth Bass","Brown Trout"], hatchHighlights: ["Caddis (Apr-May)","Sulphur (May-June)","Hoppers (July-Sept)"], whyFish: "St. Louis-area Ozark river, smallmouth on streamers and poppers with convenient access.", accessNotes: "Meramec State Park is the best base. Float or wade. Crowded summer weekends.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07013000/", lat: 38.23, lng: -91.08 },
  ],
  MI: [
    { name: "Au Sable River", state: "Michigan", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,7,8], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (May)","Brown Drake (June)","Hex (June-July)","Trico (Aug)"], whyFish: "The legendary Holy Water near Grayling, Hex hatch nights in June are a bucket-list experience.", accessNotes: "Holy Water is walk-in only from Burton's Landing. Night fishing for Hex requires local knowledge.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04136000/", lat: 44.65, lng: -84.72 },
    { name: "Pere Marquette River", state: "Michigan", type: "freestone", difficulty: "intermediate", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Steelhead","Brown Trout","Chinook Salmon"], hatchHighlights: ["Spring Steelhead (Mar-May)","Caddis (June-Aug)","Fall Salmon/Steelhead (Sept-Nov)"], whyFish: "Michigan's premier steelhead river, wild fish runs through old-growth forest.", accessNotes: "National Wild & Scenic River, no motors. Canoe access at multiple points. Book guides early for spring.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04122500/", lat: 43.98, lng: -86.00 },
    { name: "Manistee River", state: "Michigan", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9,10], targetSpecies: ["Brown Trout","Steelhead","Chinook Salmon"], hatchHighlights: ["Hendrickson (May)","Hex (June)","Caddis (July-Aug)","Fall Runs (Sept-Oct)"], whyFish: "Less crowded than the Au Sable, beautiful float water through pine forests.", accessNotes: "Tippy Dam tailwater is excellent year-round. Multiple public access sites.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04123460/", lat: 44.20, lng: -85.92 },
    { name: "Muskegon River", state: "Michigan", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Steelhead","Brown Trout","Chinook Salmon"], hatchHighlights: ["Spring Steelhead (Mar-May)","Hex (June)","Fall Salmon/Steelhead (Sept-Nov)"], whyFish: "Tailwater below Croton Dam, strong runs and consistent year-round flows.", accessNotes: "Newaygo area access is excellent. Drift boats preferred for the canyon section.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04121970/", lat: 43.42, lng: -85.81 },
  ],
  WI: [
    { name: "Bois Brule River", state: "Wisconsin", type: "freestone", difficulty: "intermediate", bestMonths: [5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout","Steelhead"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Hex (June)","Trico (Aug)"], whyFish: "Wisconsin's most storied trout stream, presidential fishing water with wild browns and brook trout.", accessNotes: "Brule River State Forest access. Spring steelhead and fall browns are peak times.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04025500/", lat: 46.52, lng: -91.55 },
    { name: "Wolf River", state: "Wisconsin", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (May)","Sulphur (May-June)","Hex (June)","Caddis (July-Aug)"], whyFish: "Wild and Scenic designation, excellent Hex hatch in June with consistent spring flows.", accessNotes: "Lily, WI is the hub. Multiple DNR access points. Canoe or wade.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04074950/", lat: 45.35, lng: -88.97 },
    { name: "Namekagon River", state: "Wisconsin", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8], targetSpecies: ["Brown Trout","Brook Trout","Smallmouth Bass"], hatchHighlights: ["Caddis (May-June)","BWO (May)","Hex (June)","Trico (Aug)"], whyFish: "National Scenic Riverway, cold spring-fed water through Wisconsin's north woods.", accessNotes: "Cable, WI area. National Park Service access points. Excellent canoe camping.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05331855/", lat: 46.01, lng: -91.26 },
  ],
  IL: [
    { name: "Fox River", state: "Illinois", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Smallmouth Bass","Largemouth Bass"], hatchHighlights: ["Caddis (May-June)","Hoppers (July-Aug)","Hex (June)","Trico (Aug-Sept)"], whyFish: "Best smallmouth in northeastern Illinois, strong population below Algonquin Dam.", accessNotes: "Multiple forest preserve access points between Elgin and Algonquin. Wading is easy.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05552500/", lat: 42.16, lng: -88.31 },
    { name: "Kankakee River", state: "Illinois", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Smallmouth Bass","Spotted Bass","Carp"], hatchHighlights: ["Caddis (May-June)","Hoppers (July-Aug)","Terrestrials (Summer)"], whyFish: "Downstate river, smallmouth on streamers and spotted bass on poppers through summer.", accessNotes: "Kankakee River State Park has excellent access. Canoe rentals available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/05520500/", lat: 41.21, lng: -88.16 },
  ],
  IN: [
    { name: "St. Joseph River", state: "Indiana", type: "freestone", difficulty: "intermediate", bestMonths: [3,4,5,10,11], targetSpecies: ["Steelhead","Smallmouth Bass"], hatchHighlights: ["Spring Steelhead (Mar-May)","Fall Steelhead (Oct-Nov)","Caddis (May-June)","Hoppers (July-Aug)"], whyFish: "Lake Michigan tributary, steelhead runs in spring and fall with summer smallmouth action.", accessNotes: "South Bend area public access. Steelhead March-May is peak. Smallmouth June-September.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04101500/", lat: 41.70, lng: -86.25 },
    { name: "Sugar Creek", state: "Indiana", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Smallmouth Bass","Largemouth Bass"], hatchHighlights: ["Caddis (May-June)","Hoppers (July-Aug)","Terrestrials (Summer)"], whyFish: "Central Indiana float creek, smallmouth on poppers all summer through wooded corridor.", accessNotes: "Turkey Run State Park area. Canoe outfitters in Crawfordsville. Excellent beginner float.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03339460/", lat: 39.91, lng: -87.05 },
  ],
  OH: [
    { name: "Grand River", state: "Ohio", type: "freestone", difficulty: "intermediate", bestMonths: [10,11,12,1,2,3,4], targetSpecies: ["Steelhead","Brown Trout"], hatchHighlights: ["Steelhead Run (Oct-Apr)","BWO (Mar-May)","Caddis (Apr-June)"], whyFish: "Northeast Ohio's best steelhead tributary, excellent access and prolific runs from October through April.", accessNotes: "Harpersfield Covered Bridge area is best access. Wading is easy. State routes follow the river.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04212100/", lat: 41.77, lng: -81.08 },
    { name: "Mad River", state: "Ohio", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["BWO (Mar-May)","Hendrickson (Apr-May)","Sulphur (May-June)","Caddis (June)"], whyFish: "Spring-fed limestone creek, Ohio's best wild trout stream near Urbana.", accessNotes: "State of Ohio Wild Trout management area. Barbless flies recommended. Limited kill.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03266500/", lat: 40.11, lng: -83.76 },
    { name: "Chagrin River", state: "Ohio", type: "freestone", difficulty: "intermediate", bestMonths: [10,11,12,1,2,3,4], targetSpecies: ["Steelhead","Brown Trout"], hatchHighlights: ["Steelhead Run (Oct-Apr)","BWO (Mar-May)","Caddis (Apr-June)"], whyFish: "Cuyahoga County steelhead stream, excellent public access close to Cleveland.", accessNotes: "Daniels Park and Whitesburg Road are prime access. Wading is good.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04208815/", lat: 41.49, lng: -81.40 },
  ],
  ME: [
    { name: "West Branch Penobscot", state: "Maine", type: "wilderness", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brook Trout","Landlocked Salmon"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Gray Drake (June)","Trico (Aug)"], whyFish: "Remote Maine wild trout, brook trout and landlocked salmon in spectacular north woods setting.", accessNotes: "Millinocket area with float trips or canoe camping. Moosehead Lake access as well.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01028000/", lat: 45.92, lng: -69.16 },
    { name: "Rapid River", state: "Maine", type: "wilderness", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brook Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Gray Drake (June)","Trico (Aug)"], whyFish: "Classic Maine remote stream, wild brook trout and rainbow trout, no motorized access.", accessNotes: "Walk-in or boat access only. Camps available. Very remote, plan carefully.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01064500/", lat: 44.68, lng: -70.71 },
  ],
  NH: [
    { name: "Androscoggin River", state: "New Hampshire", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Brown Trout","Brook Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Sulphur (May-June)","Trico (Aug)"], whyFish: "North Country freestone, wild browns and brookies in the White Mountains.", accessNotes: "Multiple access points off US-2 in Shelburne and Milan area. Good wading throughout.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01053500/", lat: 44.48, lng: -71.18 },
    { name: "Swift River (NH)", state: "New Hampshire", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Brook Trout","Brown Trout"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Sulphur (May-June)","BWO (Sept-Oct)"], whyFish: "White Mountains freestone, wild brook trout in a beautiful gorge setting near Conway.", accessNotes: "Kancamagus Highway follows the river. Multiple pull-offs. Easy wading.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01064485/", lat: 43.98, lng: -71.24 },
  ],
  VT: [
    { name: "Battenkill River", state: "Vermont", type: "freestone", difficulty: "expert", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (May)","Sulphur (May-June)","Light Cahill (June-July)","Trico (Aug)"], whyFish: "Vermont's most storied trout stream, notoriously selective wild browns that demand drag-free presentations.", accessNotes: "Manchester, VT area. Orvis flagship store is steps away. Multiple public access points.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04280440/", lat: 43.16, lng: -73.10 },
    { name: "White River (VT)", state: "Vermont", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (May)","Caddis (May-June)","Sulphur (May-June)","BWO (Oct)"], whyFish: "Central Vermont, wild browns and excellent caddis hatches near Bethel and Stockbridge.", accessNotes: "Multiple highway access points off I-89 corridor. Good wade fishing throughout.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01143500/", lat: 43.82, lng: -72.65 },
  ],
  MA: [
    { name: "Swift River", state: "Massachusetts", type: "tailwater", difficulty: "intermediate", bestMonths: [1,2,3,4,5,9,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-May)","Caddis (May-June)","Trico (Aug)"], whyFish: "Quabbin tailwater, year-round cold water wild rainbows on tiny midges near Belchertown.", accessNotes: "Catch-and-release section below Winsor Dam. Artificial only. Heavily fished weekends.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01174565/", lat: 42.24, lng: -72.28 },
    { name: "Deerfield River", state: "Massachusetts", type: "tailwater", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Caddis (May-June)","Sulphur (May-June)","BWO (Oct)"], whyFish: "Tailwater through Deerfield Canyon, strong spring hatches and consistent flows from dam releases.", accessNotes: "Charlemont area. Yankee Atomic releases affect flow, check before going.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01170000/", lat: 42.65, lng: -72.87 },
  ],
  RI: [
    { name: "Wood River", state: "Rhode Island", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Caddis (May-June)","Sulphur (May-June)","Trico (Aug)"], whyFish: "Rhode Island's best trout stream, crystal clear with wild browns in the Arcadia Wildlife Management Area.", accessNotes: "Arcadia WMA access off Rte 165. Multiple pull-offs. Best wild trout fishing in the state.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01117500/", lat: 41.57, lng: -71.71 },
  ],
  CT: [
    { name: "Farmington River", state: "Connecticut", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Sulphur (May-June)","Caddis (May-June)","BWO (Sept-Oct)"], whyFish: "Connecticut's finest trout river, classic limestone spring water below Hogback Dam.", accessNotes: "Catch-and-release section near Riverton. Gear restrictions on the trophy section.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01186000/", lat: 41.98, lng: -72.97 },
    { name: "Housatonic River", state: "Connecticut", type: "tailwater", difficulty: "beginner", bestMonths: [4,5,6,9,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Sulphur (May-June)","Caddis (June)","BWO (Oct-Nov)"], whyFish: "Connecticut's best tailwater, year-round fishery with consistent flows and big browns up to 24 inches.", accessNotes: "Cornwall Bridge area is best. Gear restrictions on the trophy section, check CT DEEP regulations.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01199000/", lat: 41.83, lng: -73.37 },
  ],
  NY: [
    { name: "Delaware River (West Branch)", state: "New York", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Sulphur (May-June)","Green Drake (June)","Trico (Aug)"], whyFish: "The best wild trout river in the East, massive hatches on big water with trophy browns.", accessNotes: "Hancock, NY is the hub. Cannonsville releases affect flows, check USGS before going.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01425000/", lat: 41.95, lng: -75.22 },
    { name: "Beaverkill River", state: "New York", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (April)","Sulphur (May-June)","Caddis (May-June)","Trico (Aug)"], whyFish: "The birthplace of American fly fishing, fish the same pools where the Catskill tradition was born.", accessNotes: "Roscoe, NY is the hub. Public stretches alternate with private. Fabled Hendrickson hatch in late April.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01420500/", lat: 41.88, lng: -74.87 },
    { name: "AuSable River (Adirondacks)", state: "New York", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout","Brook Trout"], hatchHighlights: ["Hendrickson (May)","Sulphur (May-June)","Caddis (June)","Trico (Aug)"], whyFish: "Adirondack blue-ribbon stream near Lake Placid, wild browns, rainbows, and native brookies.", accessNotes: "Multiple access points off Rte 86. Monument Falls area is most popular.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/04273970/", lat: 44.27, lng: -73.98 },
    { name: "Willowemoc Creek", state: "New York", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (April)","Sulphur (May-June)","Green Drake (June)"], whyFish: "Classic Catskill tributary, fishes best in early season with Sulphur and Green Drake hatches.", accessNotes: "Livingston Manor, NY is the hub. Public access throughout.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01419000/", lat: 41.90, lng: -74.82 },
  ],
  NJ: [
    { name: "Big Flat Brook", state: "New Jersey", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Sulphur (May-June)","Caddis (May-June)","Trico (Aug)"], whyFish: "Delaware Water Gap area, best wild trout in New Jersey in a remote mountain setting.", accessNotes: "Upper section near Flatbrookville is the premier catch-and-release stretch.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01439800/", lat: 41.18, lng: -74.90 },
    { name: "Musconetcong River", state: "New Jersey", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Caddis (May-June)","Sulphur (May-June)","BWO (Oct)"], whyFish: "Limestone-fed trout stream, wild browns and consistent hatches in Warren County.", accessNotes: "Multiple access points. Spruce Run TU section is well managed.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01455500/", lat: 40.75, lng: -74.99 },
  ],
  PA: [
    { name: "Penns Creek", state: "Pennsylvania", type: "spring creek", difficulty: "intermediate", bestMonths: [5,6,9,10], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Green Drake (May-June)","Sulphur (May-June)","Trico (July-Aug)"], whyFish: "Greatest Green Drake hatch in the East, size 10-12 drakes produce aggressive surface takes from wild browns.", accessNotes: "Coburn, PA access is best. Green Drake week in late May draws anglers from around the country.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01555000/", lat: 40.88, lng: -77.44 },
    { name: "Spring Creek", state: "Pennsylvania", type: "spring creek", difficulty: "expert", bestMonths: [1,2,3,4,5,9,10,11,12], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","Hendrickson (Apr-May)","Sulphur (May-June)","Trico (July-Aug)"], whyFish: "State College limestone spring creek, year-round wild trout water in the heart of Pennsylvania.", accessNotes: "Multiple TU-managed access points. Bellefonte and Fisherman's Paradise sections.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01546500/", lat: 40.85, lng: -77.80 },
    { name: "Letort Spring Run", state: "Pennsylvania", type: "spring creek", difficulty: "expert", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout"], hatchHighlights: ["Sulphur (May-June)","Trico (July-Aug)","Terrestrials (July-Sept)","BWO (Oct)"], whyFish: "The birthplace of American nymph fishing, the most technical spring creek in the East, home to the Letort Cricket.", accessNotes: "Carlisle, PA. Barbless, artificial only. Long leaders and accurate casts required.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01569800/", lat: 40.16, lng: -77.18 },
    { name: "Yellow Breeches Creek", state: "Pennsylvania", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Hendrickson (Apr-May)","Sulphur (May-June)","Trico (July-Aug)","BWO (Oct)"], whyFish: "Cumberland Valley limestone spring creek near Carlisle, technical wild trout with prolific hatches.", accessNotes: "Boiling Springs area is best. Children's Lake access point is easy. C&R section available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01571500/", lat: 40.14, lng: -77.13 },
  ],
  DE: [
    { name: "White Clay Creek", state: "Delaware", type: "spring creek", difficulty: "intermediate", bestMonths: [3,4,5,10,11], targetSpecies: ["Brown Trout","Brook Trout"], hatchHighlights: ["Hendrickson (Apr)","Caddis (Apr-May)","Sulphur (May-June)","BWO (Oct)"], whyFish: "Newark DE catch-and-release, wild brown trout in a suburban Brandywine Valley setting.", accessNotes: "White Clay Creek State Park access. Artificial only in C&R section. Easy wading.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01479000/", lat: 39.73, lng: -75.74 },
  ],
  MD: [
    { name: "Gunpowder Falls", state: "Maryland", type: "tailwater", difficulty: "intermediate", bestMonths: [1,2,3,4,5,9,10,11,12], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-May)","Sulphur (May-June)","Trico (Aug)"], whyFish: "Maryland's top tailwater below Prettyboy Reservoir, year-round cold water wild brown trout.", accessNotes: "Hereford, MD area. Multiple access points off Bunker Hill Rd. Barbless strongly recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01581920/", lat: 39.61, lng: -76.68 },
    { name: "North Branch Potomac", state: "Maryland", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (Mar-Apr)","Caddis (May-June)","PMD (June-July)","Trico (Aug)"], whyFish: "Appalachian Mountain tailwater below Jennings Randolph Dam, world-class wild brown trout.", accessNotes: "Shallmar, MD access. Very remote, plan accordingly. C&R trophy section.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01596500/", lat: 39.48, lng: -79.11 },
  ],
  VA: [
    { name: "Smith River", state: "Virginia", type: "tailwater", difficulty: "intermediate", bestMonths: [1,2,3,4,9,10,11,12], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-May)","Sulphur (May-June)","Trico (Aug)"], whyFish: "Philpott Dam tailwater, world-class midge fishing with consistent year-round flows.", accessNotes: "Bassett, VA area. Multiple access points. Most productive on stable flows.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02072000/", lat: 36.77, lng: -80.00 },
    { name: "Mossy Creek", state: "Virginia", type: "spring creek", difficulty: "expert", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Brown Trout"], hatchHighlights: ["BWO (Mar-Apr)","Sulphur (May-June)","Trico (July-Aug)","Terrestrials (Summer)"], whyFish: "Virginia's most challenging spring creek, ultra-selective wild browns in the Shenandoah Valley.", accessNotes: "Bridgewater, VA area. Limited public access. Fish with local guides recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01620842/", lat: 38.38, lng: -79.00 },
    { name: "Rapidan River", state: "Virginia", type: "wilderness", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brook Trout","Brown Trout"], hatchHighlights: ["Quill Gordon (Apr)","Hendrickson (Apr-May)","Sulphur (May-June)","Yellow Sally (June)"], whyFish: "Shenandoah National Park, remote headwaters wild brook trout in a pristine mountain setting.", accessNotes: "Skyline Drive access. Walk-in only. No vehicles in the park below Skyline. Backcountry camping available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/01665500/", lat: 38.42, lng: -78.39 },
    { name: "New River (VA)", state: "Virginia", type: "freestone", difficulty: "beginner", bestMonths: [5,6,7,8,9], targetSpecies: ["Smallmouth Bass","Brown Trout"], hatchHighlights: ["Hoppers (July-Sept)","Caddis (May-June)","Terrestrials (Summer)"], whyFish: "Ancient river through southwest Virginia, world-class smallmouth bass on streamers and poppers.", accessNotes: "Radford, VA and Narrows are hubs. Multiple float put-ins. Canoe outfitters available.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03163000/", lat: 37.12, lng: -80.57 },
  ],
  WV: [
    { name: "Elk River", state: "West Virginia", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,6,9,10,11], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Mar-Apr)","Caddis (May-June)","Sulphur (May-June)","BWO (Oct)"], whyFish: "Summersville tailwater, wild rainbow trout in a spectacular New River Gorge-adjacent canyon.", accessNotes: "Sutton, WV is the hub. Upper C&R section is most productive. Releases from Sutton Dam.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03193900/", lat: 38.76, lng: -80.52 },
    { name: "Cranberry River", state: "West Virginia", type: "wilderness", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brook Trout","Brown Trout"], hatchHighlights: ["Quill Gordon (Apr)","Hendrickson (Apr-May)","Sulphur (May-June)","Yellow Sally (June)"], whyFish: "Monongahela National Forest, wild brook trout in pristine mountain water, no hatchery fish.", accessNotes: "Richwood, WV area. Walk-in stream. Dispersed camping throughout the MNF.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03187500/", lat: 38.24, lng: -80.30 },
    { name: "Williams River", state: "West Virginia", type: "wilderness", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brook Trout"], hatchHighlights: ["Quill Gordon (Apr-May)","Sulphur (May-June)","Yellow Sally (June)","Hoppers (July-Aug)"], whyFish: "Remote headwater stream, wild brook trout only, no hatchery fish, spectacular mountain scenery.", accessNotes: "Highland Scenic Highway access. Short hike in required. No facilities.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03186500/", lat: 38.32, lng: -80.34 },
  ],
  KY: [
    { name: "Cumberland River", state: "Kentucky", type: "tailwater", difficulty: "beginner", bestMonths: [1,2,3,4,9,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Nov-Mar)","BWO (Mar-Apr)","Sulphur (May-June)","Caddis (Apr-May)"], whyFish: "Below Wolf Creek Dam, Kentucky's top trout fishery, accessible and productive year-round.", accessNotes: "Burkesville, KY area. Multiple access points. Guide services available. C&R section recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03403500/", lat: 36.77, lng: -85.00 },
    { name: "Red River", state: "Kentucky", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Smallmouth Bass","Rock Bass"], hatchHighlights: ["Caddis (Apr-May)","Hoppers (July-Sept)","Terrestrials (Summer)"], whyFish: "Red River Gorge area, smallmouth on poppers in one of Kentucky's most scenic river corridors.", accessNotes: "Canoe/kayak access off Rte 11. Red River Gorge Geological Area nearby.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03282500/", lat: 37.80, lng: -83.71 },
  ],
  NC: [
    { name: "Davidson River", state: "North Carolina", type: "freestone", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Rainbow Trout","Brown Trout","Brook Trout"], hatchHighlights: ["Quill Gordon (Apr)","Hendrickson (Apr-May)","Sulphur (May-June)","Yellow Sally (June)"], whyFish: "Pisgah National Forest, the Southeast's most famous trout stream, consistent hatches and wild fish.", accessNotes: "Brevard, NC is the hub. Hatchery-supported water above Davidson River Campground.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03441000/", lat: 35.28, lng: -82.77 },
    { name: "Nantahala River", state: "North Carolina", type: "tailwater", difficulty: "beginner", bestMonths: [1,2,3,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout","Brook Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-Apr)","Sulphur (May-June)","Caddis (May)"], whyFish: "Cold gorge tailwater, active year-round with consistent flows in a stunning Smoky Mountain setting.", accessNotes: "Nantahala Outdoor Center area is most accessible. Share water with kayakers.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03504000/", lat: 35.47, lng: -83.68 },
    { name: "South Toe River", state: "North Carolina", type: "wilderness", difficulty: "intermediate", bestMonths: [5,6,7,8,9], targetSpecies: ["Brook Trout","Rainbow Trout"], hatchHighlights: ["Yellow Sally (May-June)","PMD (June-July)","Caddis (June-Aug)","Hoppers (Aug)"], whyFish: "High Blue Ridge elevation, wild native brook trout above 4,000 feet in remote headwaters.", accessNotes: "Mount Mitchell area. Walk-in trails required above Burnsville. Very remote fishing.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03463500/", lat: 35.72, lng: -82.28 },
  ],
  TN: [
    { name: "South Holston River", state: "Tennessee", type: "tailwater", difficulty: "intermediate", bestMonths: [4,5,6,7,8,9], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Sulphur (Apr-Sept, 18hrs/day)","Trico (Aug-Sept)","BWO (Oct-Nov)"], whyFish: "America's best sulphur hatch, evening rises with fish feeding on the surface for hours on end.", accessNotes: "Dam releases affect wading safety. Check TVA release schedule before fishing.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03476500/", lat: 36.52, lng: -82.27 },
    { name: "Clinch River", state: "Tennessee", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,9,10,11], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","Sulphur (May-Sept)","Caddis (May-June)","Trico (Aug)"], whyFish: "East Tennessee tailwater near Norris Dam, consistent year-round flows with excellent midge and sulphur hatches.", accessNotes: "Multiple access points in Norris, TN. Check TVA release schedule.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03527620/", lat: 36.22, lng: -84.07 },
    { name: "Hiwassee River", state: "Tennessee", type: "tailwater", difficulty: "beginner", bestMonths: [3,4,5,9,10], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Sulphur (May-June)","Caddis (Apr-May)","BWO (Sept-Oct)","Midge (Oct-Mar)"], whyFish: "Catch-and-release section, trophy browns and excellent wading access in scenic Cherokee National Forest.", accessNotes: "Reliance, TN area. Good wade access throughout. Check TVA releases.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03566000/", lat: 35.21, lng: -84.53 },
    { name: "Little River (Smokies)", state: "Tennessee", type: "wilderness", difficulty: "intermediate", bestMonths: [4,5,6,9,10], targetSpecies: ["Brook Trout","Rainbow Trout"], hatchHighlights: ["Quill Gordon (Apr)","Yellow Sally (May-June)","Caddis (May-June)","Sulphur (May)"], whyFish: "Great Smoky Mountains National Park, wild native brook trout in a spectacular mountain pocket water setting.", accessNotes: "Little River Road follows the stream. No fishing license required in the park.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/03497180/", lat: 35.65, lng: -83.63 },
  ],
  SC: [
    { name: "Chattooga River", state: "South Carolina", type: "wilderness", difficulty: "intermediate", bestMonths: [3,4,5,10,11], targetSpecies: ["Brook Trout","Brown Trout"], hatchHighlights: ["Quill Gordon (Apr)","Sulphur (Apr-May)","Yellow Sally (May-June)","Terrestrials (Summer)"], whyFish: "Wild & Scenic SC/NC/GA border river, native brook trout in a remote mountain canyon setting.", accessNotes: "Fly fishing only above the highway 28 bridge. No motors. Walk-in required.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02177000/", lat: 34.88, lng: -83.30 },
    { name: "Saluda River", state: "South Carolina", type: "tailwater", difficulty: "beginner", bestMonths: [1,2,3,10,11,12], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Oct-Mar)","BWO (Mar-Apr)","Caddis (Apr-May)"], whyFish: "Columbia tailwater below Lake Murray Dam, rainbow trout year-round in a convenient urban setting.", accessNotes: "Multiple access points off US-76. Fly fishing only in designated sections.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02162350/", lat: 34.05, lng: -81.22 },
  ],
  GA: [
    { name: "Toccoa River", state: "Georgia", type: "tailwater", difficulty: "intermediate", bestMonths: [3,4,5,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["BWO (Mar-Apr)","Sulphur (Apr-June)","Caddis (Apr-May)","Trico (Aug-Sept)"], whyFish: "Georgia's best cold-water fishery below Blue Ridge Dam, large browns hold in the deep tailwater pools.", accessNotes: "Blue Ridge, GA area. Multiple USFS access points. Catch-and-release section recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02384500/", lat: 34.86, lng: -84.37 },
    { name: "Chattahoochee River", state: "Georgia", type: "tailwater", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (year-round)","BWO (Mar-Apr)","Caddis (Apr-May)","Sulphur (Apr-June)"], whyFish: "Atlanta area tailwater, accessible year-round trout fishery below Buford Dam in Chattahoochee NRA.", accessNotes: "Multiple NRA access points from Buford to Roswell. Cold water year-round.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02330450/", lat: 34.10, lng: -84.07 },
  ],
  FL: [
    { name: "Suwannee River", state: "Florida", type: "freestone", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Largemouth Bass","Suwannee Bass"], hatchHighlights: ["Poppers for bass (Mar-Oct)","Crayfish patterns (Mar-May)","Terrestrials (Summer)"], whyFish: "North Florida blackwater, Suwannee bass (found nowhere else) and largemouth on topwater poppers.", accessNotes: "Multiple state park access points. Old Town to Suwannee is a classic float.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02315500/", lat: 29.82, lng: -83.16 },
  ],
  AL: [
    { name: "Sipsey Fork", state: "Alabama", type: "tailwater", difficulty: "beginner", bestMonths: [10,11,12,1,2,3], targetSpecies: ["Rainbow Trout","Brown Trout"], hatchHighlights: ["Midge (Dec-Feb)","Caddis (Mar-Apr)","Sulphur (Apr-May)"], whyFish: "North Alabama coldwater tailwater through a canyon, stocked and holdover trout year-round.", accessNotes: "Clear Creek USFS area near Jasper. Wading is excellent. Guide services in Birmingham.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02450250/", lat: 34.08, lng: -87.39 },
  ],
  MS: [
    { name: "Pearl River", state: "Mississippi", type: "freestone", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Largemouth Bass","Spotted Bass","Crappie"], hatchHighlights: ["Poppers for bass (Apr-Oct)","Terrestrials (Summer)","Hoppers (July-Sept)"], whyFish: "Central Mississippi float fishing, largemouth and spotted bass through hardwood bottomland.", accessNotes: "Multiple boat ramps south of Jackson. Canoe or kayak access throughout.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/02482550/", lat: 32.24, lng: -89.98 },
  ],
  LA: [
    { name: "Atchafalaya Basin", state: "Louisiana", type: "freestone", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Largemouth Bass","Redfish","Bowfin"], hatchHighlights: ["Poppers for bass (Apr-Oct)","Shrimp/baitfish patterns (year-round)","Crayfish (Mar-June)"], whyFish: "America's largest river swamp, largemouth, bowfin, and gar on streamers in a primeval cypress forest.", accessNotes: "Atchafalaya Basin access off I-10 near Henderson. Guided pirogue trips recommended.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07381490/", lat: 29.87, lng: -91.89 },
  ],
  AR: [
    { name: "White River", state: "Arkansas", type: "tailwater", difficulty: "beginner", bestMonths: [3,4,5,10,11,12], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (Oct-Mar)","BWO (Mar-Apr)","Caddis (Apr-May)","Sulphur (May-June)"], whyFish: "Below Bull Shoals Dam, world-record brown trout water with some of the largest fish in the US.", accessNotes: "Cotter and Flippin, AR area. Guide services throughout. Multiple access points.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07054500/", lat: 36.31, lng: -92.43 },
    { name: "Norfork River", state: "Arkansas", type: "tailwater", difficulty: "beginner", bestMonths: [3,4,5,10,11], targetSpecies: ["Brown Trout","Rainbow Trout"], hatchHighlights: ["Midge (Oct-Apr)","BWO (Mar-Apr)","Sulphur (May-June)","Caddis (May)"], whyFish: "Tailwater below Norfork Dam, consistent cold water and mid-sized river with excellent access.", accessNotes: "Norfork, AR area. Multiple access points. Less crowded than the White River.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07059998/", lat: 36.19, lng: -92.27 },
    { name: "Buffalo National River", state: "Arkansas", type: "freestone", difficulty: "beginner", bestMonths: [4,5,6,9,10], targetSpecies: ["Smallmouth Bass","Rock Bass"], hatchHighlights: ["Caddis (Apr-May)","Terrestrials (Summer)","Hoppers (July-Sept)","Crawfish patterns (Fall)"], whyFish: "America's first national river, pristine Ozark canyon float with smallmouth on poppers.", accessNotes: "Multiple NPS access points. Canoe outfitters in Gilbert and Ponca.", usgsUrl: "https://waterdata.usgs.gov/monitoring-location/07055660/", lat: 35.98, lng: -92.76 },
  ],
  HI: [
    { name: "Kaneohe Bay Flats", state: "Hawaii", type: "spring creek", difficulty: "intermediate", bestMonths: [4,5,6,7,8,9,10], targetSpecies: ["Bonefish","Bluefin Trevally"], hatchHighlights: ["Shrimp patterns (year-round)","Crab patterns (year-round)","Poppers for GT (year-round)"], whyFish: "Oahu's top bonefish flat, tailing bones year-round in crystal Hawaiian water.", accessNotes: "Kaneohe Bay State Recreation Area. Permit may be required. Guide recommended for first visits.", lat: 21.44, lng: -157.80 },
  ],
};

// ── Primary entry point: state-aware rivers lookup ────────────────────────────
// Returns state-level spots when stateAbbr is known, falls back to region.
export function getRiversForState(stateAbbr: string): RiverRecommendation[] {
  return riversByState[stateAbbr.toUpperCase()] ?? [];
}

// Returns state spots if available, otherwise region.
export function getRiversForStateOrRegion(stateAbbr: string | undefined, region: string): RiverRecommendation[] {
  if (stateAbbr) {
    const stateSpotsResult = getRiversForState(stateAbbr);
    if (stateSpotsResult.length) return stateSpotsResult;
  }
  return getRiversForRegion(region);
}


// ── Enrich flat riversByState entries with accessPoints from riversByRegion ───
// Matches by river name, merges accessPoints and accessNotes if missing in flat entry.
export function enrichRiversWithAccessPoints(rivers: RiverRecommendation[]): RiverRecommendation[] {
  // Build lookup from all riversByRegion by name
  const regionLookup: Record<string, RiverRecommendation> = {};
  for (const regionRivers of Object.values(riversByRegion)) {
    for (const r of regionRivers) {
      regionLookup[r.name.toLowerCase()] = r;
    }
  }
  return rivers.map(r => {
    const match = regionLookup[r.name.toLowerCase()];
    if (!match) return r;
    return {
      ...r,
      accessPoints: r.accessPoints?.length ? r.accessPoints : match.accessPoints,
      accessNotes: r.accessNotes || match.accessNotes,
      whyFish: r.whyFish || match.whyFish,
      usgsUrl: r.usgsUrl || match.usgsUrl,
    };
  });
}
