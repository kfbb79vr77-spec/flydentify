// ─── Saltwater Fly Data ───────────────────────────────────────────────────────
// Mirrors the freshwater flyData.ts structure for seamless Finder integration

export type SWFlyType = "streamer" | "popper" | "crab" | "shrimp" | "baitfish" | "worm";
export type ConfidenceLevel = "high" | "medium" | "low";
export type SWRigType = "single" | "weedless" | "tandem" | "popper_dropper";

export interface SWFlyRigging {
  rod: string;
  reel: string;
  line: string;
  leader: string;
  tippet: string;
  riggingNote: string;
}

export interface SaltwaterFly {
  id: string;
  name: string;
  type: SWFlyType;
  hook: string;
  description: string;
  technique: string;
  bestDepth: string;
  colors: string[];
  imitates: string;
  notes: string;
  rigType: SWRigType;
  rigging: SWFlyRigging;
}

export interface TidalEvent {
  species: string;
  commonName: string;
  peakTide: string;       // e.g. "Incoming, 2 hrs before high"
  season: string;
  waterTemp: string;
  confidence: ConfidenceLevel;
  flies: string[];        // saltwaterFly ids
  description: string;
  lookFor: string;
  tip: string;
}

export interface SWRegionData {
  name: string;
  destinations: string[];  // flats, bays, estuaries, equivalent to rivers
  tides: { [month: number]: TidalEvent[] };
}

// ─── Master Saltwater Fly Patterns ────────────────────────────────────────────
export const saltwaterFlies: { [id: string]: SaltwaterFly } = {
  // ── BONEFISH FLIES ──────────────────────────────────────────────────────────
  crazy_charlie: {
    id: "crazy_charlie",
    name: "Crazy Charlie",
    type: "shrimp",
    hook: "#4-8",
    description: "The quintessential bonefish fly. A sparse, flashy shrimp imitation that sinks fast and looks alive on the drop.",
    technique: "Cast 6-8 feet ahead of a tailing or cruising bone. Two short strips, then let it drop. The eat almost always happens on the pause.",
    bestDepth: "Bottom, 1-4 ft",
    colors: ["White/Silver", "Pink/Gold", "Tan/Bead Chain"],
    imitates: "Mantis shrimp / glass shrimp",
    notes: "Size the hook to the flat. Shallow water over turtle grass = #8. Deeper sand flats = #4.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 8-weight",
      reel: "Large-arbor · 8/9 wt · sealed disc drag",
      line: "WF8F flats taper, weight-forward floating",
      leader: "9 ft · 12 lb hard mono tapered",
      tippet: "10-12 lb fluorocarbon · 16-18 in",
      riggingNote: "Bead chain eyes sink slowly, perfect for skinny water. Heavier lead eyes for depths over 3 ft. Loop-to-loop for quick leader swaps.",
    },
  },
  gotcha: {
    id: "gotcha",
    name: "Gotcha",
    type: "shrimp",
    hook: "#4-6",
    description: "Flash, flash, eat. The Gotcha's pearl body and rubber legs drive bonefish crazy in clear-water flats.",
    technique: "Lead the fish, strip twice, let it drop. The rubber legs pulse on the pause.",
    bestDepth: "Bottom, 2-5 ft",
    colors: ["Pearl/Pink", "Tan/Chartreuse", "White/Orange"],
    imitates: "Shrimp",
    notes: "Proven everywhere from the Bahamas to Christmas Island. Always carry a dozen.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 8-weight",
      reel: "Large-arbor · 8/9 wt · sealed disc drag",
      line: "WF8F flats taper, weight-forward floating",
      leader: "9 ft · 12 lb hard mono tapered",
      tippet: "10 lb fluorocarbon · 16 in",
      riggingNote: "Flash body cuts through wind on Bahamian flats. 150-200 yd of 20 lb backing, bonefish runs are longer than you expect.",
    },
  },
  clouser_minnow_bone: {
    id: "clouser_minnow_bone",
    name: "Clouser Minnow (Light)",
    type: "baitfish",
    hook: "#4-8",
    description: "Bob Clouser's diving minnow. Lighter dumbbell eyes for shallow flat work. Equally deadly for bonefish and permit.",
    technique: "Long strips with pauses. The jigging action mimics a wounded baitfish escaping into sand.",
    bestDepth: "Mid-column, 2-6 ft",
    colors: ["White/Chartreuse", "White/Brown", "All White"],
    imitates: "Glass minnow / small baitfish",
    notes: "The most versatile saltwater fly ever tied. Works from the Florida Keys to Cape Cod.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 8-weight (bonefish) or 10-weight (stripers)",
      reel: "Large-arbor · 8/10 wt · sealed disc drag",
      line: "WF8F tropical taper or WF10F floating",
      leader: "9 ft · 15-20 lb hard mono",
      tippet: "12-16 lb fluorocarbon · 18 in",
      riggingNote: "Non-slip mono loop knot gives maximum swimming action. Size up to 10-wt on windy days or for stripers in current.",
    },
  },

  // ── TARPON FLIES ────────────────────────────────────────────────────────────
  cockroach: {
    id: "cockroach",
    name: "Cockroach",
    type: "streamer",
    hook: "#3/0-4/0",
    description: "The original tarpon fly. Grizzly hackles and a sparse profile that breathes in current. A true classic.",
    technique: "Swing it across the current in tarpon lanes. Two-handed strip with pause. Let the current animate it.",
    bestDepth: "Mid-column, surface to 8 ft",
    colors: ["Grizzly/Yellow", "All Grizzly"],
    imitates: "Mullet / crabs / general attractor",
    notes: "If tarpon are rolling and not eating, downsize to a #1 and slow your strip.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 11-weight or 12-weight",
      reel: "Large-arbor · 11/12 wt · sealed disc drag · 300+ yd 30 lb backing",
      line: "WF11F or WF12F, tarpon taper tropical floating",
      leader: "9 ft · 60 lb hard mono butt tapered to 40 lb",
      tippet: "20-40 lb fluorocarbon class tippet · 10-12 in",
      riggingNote: "Set the hook with 3 hard strip-sets, then lift. Bony mouth, no give. Sealed drag essential: tarpon runs exceed 100 yd in seconds.",
    },
  },
  black_death: {
    id: "black_death",
    name: "Black Death",
    type: "streamer",
    hook: "#2/0-3/0",
    description: "Steve Huff's legendary tarpon pattern. Black marabou, purple flash. Low-light and cloudy days.",
    technique: "Slow strip, then fast. Pause. Let it sink into the strike zone. Tarpon often eat on the drop.",
    bestDepth: "Near surface, 0-4 ft",
    colors: ["Black/Purple", "Black/Blue"],
    imitates: "Dark baitfish / large mullet",
    notes: "Overcast skies, stained water, this is the first fly you tie on.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 11-weight or 12-weight",
      reel: "Large-arbor · 11/12 wt · sealed disc drag · 300 yd backing",
      line: "WF12F tropical floating, tarpon taper",
      leader: "9 ft · 60 lb butt tapered to 40 lb",
      tippet: "30-40 lb fluorocarbon · 10-12 in",
      riggingNote: "Dark profile reads in low light and stained water. Large arbor recovers line fast after a tarpon's first run reversal.",
    },
  },
  tarpon_toad: {
    id: "tarpon_toad",
    name: "Tarpon Toad",
    type: "shrimp",
    hook: "#1/0-2/0",
    description: "Del Brown's permit/tarpon hybrid pattern. Rubber legs, foam head, weed-guard. The modern classic.",
    technique: "Cast to rolling tarpon. Long slow strip. The foam head keeps it in the strike zone.",
    bestDepth: "Surface, 0-3 ft",
    colors: ["Tan/Olive", "Black/Red", "White/Pink"],
    imitates: "Crab / swimming shrimp",
    notes: "Tie with a heavy mono weed guard for grass flats. Go weightless in open water.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 9-weight or 10-weight",
      reel: "Large-arbor · 9/10 wt · sealed disc drag",
      line: "WF9F tropical floating, permit/bonefish taper",
      leader: "9 ft · 16-20 lb hard mono tapered",
      tippet: "12-16 lb fluorocarbon · 16-18 in",
      riggingNote: "Permit are leader-shy, drop to 12 lb in calm clear conditions. Land the fly silently 3-5 ft ahead of a tailing fish.",
    },
  },

  // ── PERMIT FLIES ────────────────────────────────────────────────────────────
  del_brown_permit: {
    id: "del_brown_permit",
    name: "Del Brown's Merkin",
    type: "crab",
    hook: "#2-4",
    description: "The most famous crab pattern in saltwater fly fishing. Yarn and rubber-leg construction that settles like a real crab hitting the flat.",
    technique: "Lead a cruising permit by 8-10 feet. Let it splash down, strip once, then dead drift. The permit must see it sink.",
    bestDepth: "Bottom, 1-4 ft",
    colors: ["Tan/Olive", "Brown/Rust"],
    imitates: "Blue crab / swimming crab",
    notes: "Permit are the hardest flats fish to fool. Perfect presentation beats perfect fly selection every time.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 9-weight",
      reel: "Large-arbor · 9/10 wt · disc drag",
      line: "WF9F tropical floating",
      leader: "10 ft · 16 lb hard mono tapered",
      tippet: "12 lb fluorocarbon · 18-20 in",
      riggingNote: "Permit demand a perfect crab presentation. Dead-drift after a single strip, any extra motion and they spook.",
    },
  },
  spawning_shrimp: {
    id: "spawning_shrimp",
    name: "Spawning Shrimp",
    type: "shrimp",
    hook: "#2-6",
    description: "Articulated shrimp imitation with an epoxy shell and rubber antenna. Fools permit when crabs won't.",
    technique: "Strip-pause-strip on bare sand. The epoxy shell catches light exactly like a real shrimp.",
    bestDepth: "Bottom, 1-3 ft",
    colors: ["Orange/Tan", "Pink/Clear"],
    imitates: "Mantis / spiny shrimp",
    notes: "Use in spring when permit are feeding on spawning shrimp along grass edges.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 9-weight",
      reel: "Large-arbor · 9/10 wt · disc drag",
      line: "WF9F tropical floating",
      leader: "9 ft · 16 lb hard mono tapered",
      tippet: "12 lb fluorocarbon · 16-18 in",
      riggingNote: "Shrimp patterns need a silent entry. Practice landing the fly like a real shrimp, no splash, no spook.",
    },
  },

  // ── REDFISH FLIES ───────────────────────────────────────────────────────────
  ep_spawning_shrimp: {
    id: "ep_spawning_shrimp",
    name: "EP Spawning Shrimp",
    type: "shrimp",
    hook: "#2-4",
    description: "Enrico Puglisi's synthetic shrimp. Neutral buoyancy, life-like movement. The redfish flat's best all-around fly.",
    technique: "Spot-and-stalk. Cast to a tailing red. One strip, let it flutter. The eat is explosive.",
    bestDepth: "Bottom, 6 in to 3 ft",
    colors: ["Tan/Copper", "Olive/Brown", "Pink/Chartreuse"],
    imitates: "Various shrimp species",
    notes: "The go-to for Louisiana marsh, Texas bays, and South Carolina flats.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 8-weight",
      reel: "Large-arbor · 8/9 wt · disc drag",
      line: "WF8F tropical or redfish taper, floating",
      leader: "9 ft · 20 lb hard mono",
      tippet: "16-20 lb fluorocarbon · 18 in",
      riggingNote: "Weed guard essential in Louisiana marsh. Redfish take on the pause, count to 3 after the fly lands before your first strip.",
    },
  },
  bruce_chard_redfish: {
    id: "bruce_chard_redfish",
    name: "Chernobyl Redfish Crab",
    type: "crab",
    hook: "#2-4",
    description: "Flat-bodied foam crab with rubber legs that flares on the drop. Pushes water. Redfish can't resist it.",
    technique: "Toss it into the spartina grass edge. Let it drop. Strip once slowly. Reds key on the splash and drop.",
    bestDepth: "Bottom, inches to 2 ft",
    colors: ["Olive/Tan", "Brown/Orange"],
    imitates: "Mud crab / fiddler crab",
    notes: "Perfect for tailing reds in shallow marsh. The slap on entry triggers instinctive strikes.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 8-weight",
      reel: "Large-arbor · 8/9 wt · disc drag",
      line: "WF8F redfish taper, floating",
      leader: "9 ft · 20 lb hard mono",
      tippet: "16 lb fluorocarbon · 18 in",
      riggingNote: "Foam body slaps the surface on entry, cast at the tailer's nose. Redfish are nearly blind above water; lead them with sound.",
    },
  },

  // ── STRIPED BASS / BLUEFISH ─────────────────────────────────────────────────
  clouser_striper: {
    id: "clouser_striper",
    name: "Clouser Minnow (Heavy)",
    type: "baitfish",
    hook: "#1/0-3/0",
    description: "Large-hook Clouser with weighted dumbbell eyes for deep structure and current. The Northeast striper standard.",
    technique: "Sink to bottom structure. Jigging strip, 6 inches fast, pause, repeat. Mimic a wounded bunker.",
    bestDepth: "Bottom, 4-20 ft",
    colors: ["White/Chartreuse", "White/Blue", "Chartreuse/White"],
    imitates: "Bunker / menhaden / sand eel",
    notes: "Size up to 5/0 for big bass on structure during fall blitzes.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 9-weight or 10-weight",
      reel: "Large-arbor · 9/10 wt · disc drag",
      line: "WF9F or WF10F, intermediate for depth, floating for surface",
      leader: "7.5 ft · 20-25 lb hard mono",
      tippet: "20 lb fluorocarbon · 12-18 in",
      riggingNote: "Fast-loading rod handles the big fly in wind. Intermediate line cuts through surface chop and gets the Clouser into the striper's feeding zone.",
    },
  },
  deceiver: {
    id: "deceiver",
    name: "Lefty's Deceiver",
    type: "baitfish",
    hook: "#1/0-4/0",
    description: "Lefty Kreh's masterpiece. Long saddle hackle tail, bucktail head. Looks like every baitfish at once.",
    technique: "Vary your retrieve. Fast strip for bluefish. Slow strip-pause for bass. Let the current do the work.",
    bestDepth: "All depths, 0-15 ft",
    colors: ["White/Blue", "White/Olive", "All White", "Red/White"],
    imitates: "Bunker / herring / sand eel",
    notes: "Every saltwater box should have Deceivers in white, olive, and chartreuse.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 8-weight to 10-weight",
      reel: "Large-arbor · 8/10 wt · disc drag",
      line: "WF9F floating or slow-intermediate",
      leader: "7.5 ft · 20 lb hard mono",
      tippet: "16-20 lb fluorocarbon · 12 in",
      riggingNote: "Bucktail breathes on the pause, let it flutter. Non-slip mono loop preserves the full action of the tail on every strip.",
    },
  },
  gurgler: {
    id: "gurgler",
    name: "Gurgler / Popper",
    type: "popper",
    hook: "#1/0-3/0",
    description: "Jack Gartside's foam gurgler. Rides low and gurgles across the surface. Devastating in low-light and during baitfish blitzes.",
    technique: "Cast to breaking fish or along seawalls. Loud, aggressive strips. Bluefish and bass can't resist the commotion.",
    bestDepth: "Surface, topwater",
    colors: ["White/Yellow", "Chartreuse", "Black/Purple"],
    imitates: "Injured baitfish / mullet",
    notes: "Dawn and dusk near structure. Bring a 9-wt for big fish that eat big poppers.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 8-weight or 9-weight",
      reel: "Large-arbor · 8/9 wt · disc drag",
      line: "WF8F or WF9F, weight-forward floating",
      leader: "7.5 ft · 25 lb hard mono straight (not tapered)",
      tippet: "20 lb fluorocarbon · 12 in",
      riggingNote: "Straight stiff leader preserves the popping action. A tapered leader robs surface flies of their gurgle and splash.",
    },
  },

  // ── SNOOK / FLOUNDER / INSHORE ──────────────────────────────────────────────
  sea_habit: {
    id: "sea_habit",
    name: "Sea Habit Bucktail",
    type: "baitfish",
    hook: "#1/0-2/0",
    description: "Layered bucktail, flash body. Low-profile and fast-sinking. Perfect for dock lights and mangrove edges for snook.",
    technique: "Cast to shadow lines under lights. Let it sink below the light cone. Short strips, snook suspend just out of the light.",
    bestDepth: "Mid-column, 2-8 ft",
    colors: ["White/Gold", "Chartreuse/Silver", "Pink/White"],
    imitates: "Glass minnow / pilchard",
    notes: "Snook stack under dock lights on flood tide. Fish the shadow edge, not the light.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 9-weight",
      reel: "Large-arbor · 9/10 wt · disc drag",
      line: "WF9F floating or slow-intermediate",
      leader: "7.5 ft · 30 lb hard mono",
      tippet: "30 lb fluorocarbon · 12 in",
      riggingNote: "Heavy tippet required near structure, snook head straight for dock pilings when hooked. 30 lb is not optional.",
    },
  },
  borski_slider: {
    id: "borski_slider",
    name: "Borski Slider",
    type: "worm",
    hook: "#1-2",
    description: "Tim Borski's epoxy-headed slid-in-the-mud design. Mimics a fleeing shrimp or worm. Snook, flounder, seatrout love it.",
    technique: "Dead drift in tidal current. Occasional twitch. Seatrout key on the resting shrimp sitting on the bottom.",
    bestDepth: "Bottom, 1-4 ft",
    colors: ["Tan/Root Beer", "Olive/Brown", "Pink/Chartreuse"],
    imitates: "Shrimp / worm",
    notes: "Excellent in grass beds for seatrout during summer. Match the color of the natural shrimp on that flat.",
    rigType: "weedless",
    rigging: {
      rod: "9 ft · 8-weight",
      reel: "Large-arbor · 8/9 wt · disc drag",
      line: "WF8F, weight-forward floating",
      leader: "9 ft · 16 lb hard mono",
      tippet: "12-14 lb fluorocarbon · 18 in",
      riggingNote: "Worm patterns rest naturally on bottom, let it settle fully before the first strip. Redfish hit on the drop 80% of the time.",
    },
  },

  // ── OFFSHORE / BLUEWATER ────────────────────────────────────────────────────
  half_and_half: {
    id: "half_and_half",
    name: "Half and Half",
    type: "baitfish",
    hook: "#2/0-5/0",
    description: "Hybrid Clouser-Deceiver. Deep-diving, large profile. The go-to for offshore species: tuna, mahi, wahoo.",
    technique: "Cast to breaking fish in a blitz. Fast, aggressive retrieve. The dumbbells take it into the strike zone fast.",
    bestDepth: "All depths, 0-30 ft",
    colors: ["White/Blue/Silver", "Chartreuse/White", "Pink/White"],
    imitates: "Flying fish / ballyhoo / squid",
    notes: "Go to 12-wt for mahi and AJs. Use 80 lb bite tippet for wahoo.",
    rigType: "single",
    rigging: {
      rod: "9 ft · 10-weight to 12-weight",
      reel: "Large-arbor · 10/12 wt · sealed disc drag · 300 yd 30 lb backing",
      line: "WF10F, WF12F, floating or slow-intermediate",
      leader: "7.5 ft · 30 lb hard mono",
      tippet: "20-30 lb fluorocarbon · 12 in",
      riggingNote: "Fast aggressive retrieve, bluefish key on wounded baitfish. Match hook size to the bait being blown up on the surface.",
    },
  },
};

export const swFlyList = Object.values(saltwaterFlies);

// Saltwater hatch equivalent: "bite windows" / tidal events by month
export const swRegions: { [id: string]: SWRegionData } = {
  // ── GULF COAST FLATS ───────────────────────────────────────────────────────
  gulf_coast_flats: {
    name: "Gulf Coast Flats (TX · LA · MS · AL · FL Panhandle)",
    destinations: [
      "Laguna Madre (TX)", "Aransas Bay (TX)", "Matagorda Bay (TX)",
      "Louisiana Marsh (LA)", "Biloxi Marsh (MS/AL)", "Pensacola Bay (FL)"
    ],
    tides: {
      1: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, mid-tide", season: "Winter", waterTemp: "50-60°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Winter reds school in deeper channels and bayous. Find push-water structure on incoming tide.", lookFor: "Wakes in shallow bayous, tailing along oyster shell", tip: "Slow your retrieve. Winter reds are lethargic and want a stationary or barely-moving fly." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Winter", waterTemp: "52-62°F", confidence: "high", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Trout hold on deep grass-edge drop-offs during cold fronts.", lookFor: "Glass minnows dimpling the surface near structure", tip: "Fish slow. Dead-drift a Borski Slider along the grass edge in 3-6 ft." }],
      2: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Late Winter", waterTemp: "54-64°F", confidence: "medium", flies: ["ep_spawning_shrimp", "clouser_striper"], description: "Reds begin returning to shallower water as days lengthen.", lookFor: "Tails in shallow back bays on warm afternoons", tip: "Afternoon sun warms the shallows, fish the warmest, clearest water first." }],
      3: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, 1-2 hrs before high", season: "Spring", waterTemp: "62-72°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Spring prime time. Reds push onto the flats with warming water. Best sight-fishing of the year.", lookFor: "Tailing fish in 6 inches to 2 feet over sand and grass", tip: "Spot-and-stalk in a kayak or wading. Lead the fish 4 feet, let it drop, one strip." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Spring", waterTemp: "64-72°F", confidence: "high", flies: ["borski_slider", "gurgler"], description: "Trout push onto spawning grass flats in spring. Early morning topwater produces violent strikes.", lookFor: "Nervous water over thick grass in 1-3 ft", tip: "Dawn gurgler fishing on the Texas coast is some of the best inshore fly fishing in the country." }],
      4: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Spring", waterTemp: "68-76°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Peak spring flats action. Spawning shrimp trigger aggressive redfish.", lookFor: "Pods of 3-10 fish, tailers and cruisers in gin-clear shallows", tip: "Look for the red bronze flash of a tail in sunlight. Polarized glasses are non-negotiable." }, { species: "Flounder", commonName: "Southern Flounder", peakTide: "Outgoing, strong ebb", season: "Spring", waterTemp: "66-74°F", confidence: "medium", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Flounder ambush baitfish in tidal cuts on outgoing tide.", lookFor: "Tidal cuts and passes with sandy bottoms adjacent to grass beds", tip: "Fish the bottom. Flounder lay flat on the sand, your fly needs to drag or hop right at their eye level." }],
      5: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Slack water, just before outgoing", season: "Late Spring", waterTemp: "74-80°F", confidence: "medium", flies: ["cockroach", "tarpon_toad", "black_death"], description: "Juvenile tarpon up to 30 lbs move into shallow bays and estuaries. Gulf tarpon season begins.", lookFor: "Rolling fish in passes, creeks, and deep-water holes", tip: "Tarpon breathe air. Watch for rolls and present the fly as the fish is coming up, not after." }],
      6: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, night or dawn", season: "Early Summer", waterTemp: "78-84°F", confidence: "high", flies: ["cockroach", "black_death", "tarpon_toad"], description: "Peak Gulf tarpon season. Fish passes at dawn. Large schools move through Texas and Louisiana bays.", lookFor: "Fish rolling in passes and bay mouths at first light", tip: "A pre-dawn start is essential. Tarpon enter the passes with the last of the incoming tide." }, { species: "Redfish", commonName: "Red Drum", peakTide: "Outgoing, near dusk", season: "Summer", waterTemp: "80-86°F", confidence: "high", flies: ["bruce_chard_redfish", "ep_spawning_shrimp"], description: "Summer reds school on the Gulf Intracoastal, huge schools on mud flats at dusk.", lookFor: "Wakes, nervous water in 6 inches of water in protected bays", tip: "Summer heat: fish the first two hours of daylight and the last hour before dark. Mid-day = dead." }],
      7: [{ species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Dawn, any tide", season: "Summer", waterTemp: "82-88°F", confidence: "medium", flies: ["gurgler", "borski_slider"], description: "Summer trout go deep in mid-day heat. Dawn topwater fishing on the flats is the best bet.", lookFor: "Tailing on shallow grass with first light. Look for birds.", tip: "If you see diving terns working a shoreline at dawn, you are looking at feeding trout." }],
      8: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, afternoon", season: "Late Summer", waterTemp: "84-90°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Reds are scattered in summer heat. Target shaded structure and oyster reefs during mid-tide.", lookFor: "Shade lines under mangroves, deep water around oyster reefs", tip: "Shrimp are abundant and reds are full. Downsize to a #4 shrimp, competition is high." }],
      9: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Fall", waterTemp: "78-84°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Fall is the best time of year. Pre-spawn bull reds congregate offshore in massive schools, while slot reds push the flats.", lookFor: "Large pods tailing on clear flats, nervous wakes in protected bays", tip: "September through November is peak. Every angler on the Gulf Coast knows this, plan your trip accordingly." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Fall", waterTemp: "72-80°F", confidence: "high", flies: ["borski_slider", "gurgler", "ep_spawning_shrimp"], description: "Fall trout stack up on drop-offs and grass edges as baitfish school. Topwater produces all morning.", lookFor: "Cormorants diving on grass edges, free-jumping trout, glass minnows skipping", tip: "The outgoing tide pushes baitfish off the grass into the adjacent channels. Fish the seam." }],
      10: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Fall Peak", waterTemp: "68-76°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "The best month on the Gulf Coast. Water clear, fish fat, crowds thin. Perfect conditions.", lookFor: "Tailing fish, golden-bronze flashes in bright sun", tip: "October in Louisiana and Texas is world-class. Book a guide, local knowledge on a skiff is irreplaceable." }],
      11: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Mid-tide", season: "Late Fall", waterTemp: "58-68°F", confidence: "medium", flies: ["ep_spawning_shrimp", "clouser_minnow_bone"], description: "Cold fronts push fish deep. Warm days between fronts offer great shallow-water action.", lookFor: "Fish on sun-warmed mud flats on the south-facing banks between cold fronts", tip: "The day after a cold front = hard fishing. The third day after = great fishing." }],
      12: [{ species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Winter", waterTemp: "50-60°F", confidence: "medium", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Winter trout hold deep in warm bayous and channels. Slow presentations win.", lookFor: "Deep grass beds in 4-6 ft of water, protected from north wind", tip: "Slow is the key. Dead-drift, barely twitch. A cold trout doesn't want to chase." }],
    },
  },

  // ── FLORIDA KEYS / BACKCOUNTRY ─────────────────────────────────────────────
  florida_keys: {
    name: "Florida Keys & Backcountry (Biscayne · Islamorada · Lower Keys · Dry Tortugas)",
    destinations: [
      "Biscayne Bay", "Islamorada Flats", "Key West Backcountry",
      "Marquesas Keys", "Dry Tortugas", "Florida Bay"
    ],
    tides: {
      1: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming, feeding flats", season: "Winter", waterTemp: "68-74°F", confidence: "high", flies: ["crazy_charlie", "gotcha"], description: "January bones are big, spooky, and powerful. Cold-water fish school in deeper channels between flats.", lookFor: "V-wakes on white sand bottom, nervous water, tailing in eel grass", tip: "Winter bones spook easily on cold days, long leaders (12-14 ft), fine tippet (8-10 lb). Dead quiet approach." }, { species: "Permit", commonName: "Permit", peakTide: "Outgoing, around structure", season: "Winter", waterTemp: "68-74°F", confidence: "medium", flies: ["del_brown_permit", "spawning_shrimp"], description: "Winter permit pod up on shallow offshore bars. The hardest flats fish on any tackle.", lookFor: "Black tails waving, mud clouds near coral heads and bar edges", tip: "A permit eats a crab. Period. Size 2 Merkin on 10 lb tippet." }],
      2: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Winter", waterTemp: "68-74°F", confidence: "high", flies: ["crazy_charlie", "gotcha", "clouser_minnow_bone"], description: "Feb brings some of the clearest water of the year. Exceptional sight fishing on the Atlantic flats.", lookFor: "Fish pushing shoreline edges in 6-18 inches", tip: "Florida Bay bones are smaller but quicker, great for learning. Atlantic-side bones are world-class." }],
      3: [{ species: "Permit", commonName: "Permit", peakTide: "Incoming", season: "Spring", waterTemp: "72-78°F", confidence: "high", flies: ["del_brown_permit", "spawning_shrimp"], description: "March is the beginning of Keys permit season. Permit appear on oceanside flats with warming water.", lookFor: "Daisy-chaining singles or small pods on white sand with coral", tip: "Look for black sickle tails against white sand. The cast window is often 5 seconds." }, { species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, first light", season: "Spring", waterTemp: "72-78°F", confidence: "medium", flies: ["cockroach", "tarpon_toad"], description: "Early season tarpon appear in the channels and backcountry. The migration is just beginning.", lookFor: "Rolling fish at dawn, daisy chains in the passes", tip: "Hire a Keys guide for tarpon, local knowledge of fish locations changes daily." }],
      4: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, dawn to 10am", season: "Peak Spring", waterTemp: "76-82°F", confidence: "high", flies: ["cockroach", "black_death", "tarpon_toad"], description: "April is prime. The migration is in full swing. Thousands of tarpon move through the Keys.", lookFor: "Daisy chains, rolling schools, fish laid up in channels", tip: "The first 2 hours of daylight with a cloud cover. Tarpon see leaders in bright sun, use 16-lb clear tippet." }, { species: "Permit", commonName: "Permit", peakTide: "Mid-tide", season: "Spring", waterTemp: "74-80°F", confidence: "high", flies: ["del_brown_permit", "spawning_shrimp"], description: "Peak permit season. Fish are pre-spawn and aggressive. The grand slam is achievable.", lookFor: "Singles tailing hard, tail and dorsal both out of the water", tip: "The 'grand slam', bonefish, permit, and tarpon in one day, is a Keys obsession. April is your month." }],
      5: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, any light condition", season: "Peak", waterTemp: "78-84°F", confidence: "high", flies: ["cockroach", "black_death", "tarpon_toad"], description: "May is the apex. Tarpon stack up on the flats. World-record-class fish in every channel.", lookFor: "Daisy chains of 100+ fish, laid-up schools, rolling in the Gulf", tip: "The world record tarpon were caught in the Keys in May. This month is why guides here book 2 years out." }, { species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Spring", waterTemp: "78-84°F", confidence: "high", flies: ["crazy_charlie", "gotcha"], description: "Spring bonefish are aggressive and everywhere, tailing on every flat at dawn.", lookFor: "Tailing fish in 6 inches on white sand at first light", tip: "You can see tailers with the naked eye at 100 feet if the sun is right. Position upwind, cast cross-wind." }],
      6: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, dawn", season: "Late Spring", waterTemp: "80-86°F", confidence: "high", flies: ["cockroach", "black_death"], description: "Tarpon season winds down but big fish remain. June produces some of the largest tarpon of the season.", lookFor: "Large loners and small pods on oceanside flats in early morning", tip: "June tarpon are the biggest. Fewer fish, larger average size. 9-wt isn't enough, bring a 12." }],
      7: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Summer", waterTemp: "82-88°F", confidence: "high", flies: ["crazy_charlie", "gotcha", "clouser_minnow_bone"], description: "Summer bonefish are scattered across deeper flats. Dawn and dusk best, brutal mid-day heat.", lookFor: "Fish pushing along tidal cuts in the late afternoon", tip: "Hydrate and fish early. Bonefish feed up to 9am then go deep in summer heat." }],
      8: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Summer", waterTemp: "84-90°F", confidence: "medium", flies: ["crazy_charlie", "gotcha"], description: "August is the Keys at their most difficult. Hot water, scattered fish, afternoon thunderstorms.", lookFor: "Fish on the oceanside in slightly cooler water", tip: "August in the Keys tests your patience. The flip side: no crowds. Go at dawn, be off the water by 10." }],
      9: [{ species: "Permit", commonName: "Permit", peakTide: "Outgoing, afternoon", season: "Fall", waterTemp: "82-86°F", confidence: "medium", flies: ["del_brown_permit", "spawning_shrimp"], description: "Fall permit push onto the flats again after the summer heat breaks.", lookFor: "Permit along oceanside flats and coral patches", tip: "September permit fishing is underrated. Fewer anglers than spring, fish are fat from summer feeding." }],
      10: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming, morning", season: "Fall", waterTemp: "78-84°F", confidence: "high", flies: ["crazy_charlie", "gotcha", "clouser_minnow_bone"], description: "October is the second peak. Fall bones return to the flats in force as the water cools.", lookFor: "Large schools on white sand in 1-2 ft at first light", tip: "Fall bones are often in bigger schools than spring, more fish, more chances. Don't spook the pod." }, { species: "Permit", commonName: "Permit", peakTide: "Mid-tide", season: "Fall", waterTemp: "76-82°F", confidence: "high", flies: ["del_brown_permit", "spawning_shrimp"], description: "Prime fall permit. Schools of 10-30 fish on the oceanside flats, a rare and beautiful sight.", lookFor: "Multiple tails in open water, fish chasing crabs off the bottom", tip: "Fall permit schools are more aggressive than solitary spring fish. Pick the most aggressive-looking tail." }],
      11: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Fall", waterTemp: "72-78°F", confidence: "high", flies: ["crazy_charlie", "gotcha"], description: "November is one of the best months. Cooling water, clear skies, pre-winter bones are big and aggressive.", lookFor: "Large fish on ocean flats, tailing in very shallow water", tip: "November light is lower on the horizon, easier to spot fish without glare than summer. Polarized glasses shine." }],
      12: [{ species: "Bonefish", commonName: "Bonefish", peakTide: "Incoming", season: "Winter", waterTemp: "68-74°F", confidence: "high", flies: ["crazy_charlie", "gotcha"], description: "December bones can be exceptional. School fish in warmer areas between cold fronts.", lookFor: "Fish holding on the south-facing flats in sun-warmed shallows", tip: "A winter-calm day in the Keys with tailing bonefish is one of fishing's finest experiences. Protect the date." }],
    },
  },

  // ── STRIPER COAST (Northeast) ─────────────────────────────────────────────
  striper_coast: {
    name: "Striper Coast (MA · RI · CT · NY · NJ · ME)",
    destinations: [
      "Cape Cod Bay (MA)", "Nantucket Sound (MA)", "Montauk Point (NY)",
      "Narragansett Bay (RI)", "Sandy Hook (NJ)", "Penobscot Bay (ME)"
    ],
    tides: {
      1: [],
      2: [],
      3: [],
      4: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing, near structure", season: "Spring Migration", waterTemp: "44-52°F", confidence: "medium", flies: ["clouser_striper", "deceiver"], description: "First stripers of the year. Schoolies arrive in estuaries as water clears. Small baitfish patterns.", lookFor: "Fish under diving terns in tidal rivers, wakes behind boulders", tip: "April stripers are hungry after winter. Schoolie bass eat anything. Match small sand eels (#2 Clouser)." }],
      5: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing, 2 hrs after high", season: "Spring", waterTemp: "52-62°F", confidence: "high", flies: ["clouser_striper", "deceiver", "gurgler"], description: "Prime striper season. Fish move into nearshore water and estuaries chasing sand eels and herring.", lookFor: "Bass crashing bait under birds, wakes along rocky shorelines at dawn", tip: "Fish dropping tides along sandy beaches. Stripers ambush baitfish pushed into the shallows by the ebb." }, { species: "Bluefish", commonName: "Bluefish", peakTide: "Any, following bait schools", season: "Spring", waterTemp: "56-64°F", confidence: "medium", flies: ["gurgler", "deceiver"], description: "Blues arrive with the sand eels. Explosive surface blitzes from Cape Cod to NJ.", lookFor: "Birds diving on surface chaos, foam, blood, choppy water", tip: "Blues cut mono. Always use a wire tippet or 40-60 lb mono bite tippet. They destroy standard flies." }],
      6: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing, dawn and dusk", season: "Peak Spring", waterTemp: "60-68°F", confidence: "high", flies: ["deceiver", "gurgler", "clouser_striper"], description: "June is prime striper season from Maine to New Jersey. Night fishing under lights produces big fish.", lookFor: "Daisy chains on the surface at dusk, bass under dock lights at night", tip: "June night fishing with a large white Deceiver under a bridge light is the quintessential Northeast striper experience." }],
      7: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Dawn, outgoing", season: "Summer", waterTemp: "66-72°F", confidence: "medium", flies: ["clouser_striper", "deceiver"], description: "Midsummer stripers. Big bass push into deep, cool structure. Offshore bars and rocky points.", lookFor: "Bait on the surface at dawn, bass feeding on bunker schools", tip: "July heat pushes big bass deep. Target the 0-2 hours around sunrise on current-swept points." }, { species: "Bluefish", commonName: "Bluefish", peakTide: "Any, following bunker", season: "Summer", waterTemp: "66-72°F", confidence: "high", flies: ["gurgler", "half_and_half", "deceiver"], description: "Peak bluefish. Thick schools of blues blitz surface bait from Rhode Island to New York.", lookFor: "Oil slicks and feathers on the water surface, dead baitfish from chopper blues below", tip: "Blues are chaotic and fun. Bring cheap flies, they destroy everything. A gurgler brings them to the surface." }],
      8: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Night, outgoing", season: "Summer", waterTemp: "68-74°F", confidence: "medium", flies: ["clouser_striper", "deceiver", "gurgler"], description: "August bass go nocturnal in warm water. Night fishing in surf and around structure is most productive.", lookFor: "Night blitzes along beaches, bass feeding in surf by feel and sound", tip: "Fish after dark from the beach. Black fly in the surface film. Big bass feed by feel and sound in low light." }],
      9: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing, sunset to midnight", season: "Fall Migration", waterTemp: "62-70°F", confidence: "high", flies: ["clouser_striper", "deceiver", "gurgler", "half_and_half"], description: "Fall migration begins. Stripers fatten on bunker schools for the long run south. Best fishing of the year.", lookFor: "Massive bunker pods pushed to the surface, bass crashing under birds", tip: "September surf fishing at Montauk and Cape Cod is legendary. 10-wt, 300-gr sinking line, big deceiver." }],
      10: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing, anytime", season: "Peak Fall", waterTemp: "56-64°F", confidence: "high", flies: ["clouser_striper", "deceiver", "half_and_half"], description: "The peak of the peak. Fat bass on bunker, blitzes from dawn to dusk. The fall run is everything.", lookFor: "Bunker schools on the surface from Montauk to Sandy Hook, birds working miles of water", tip: "October at Montauk. If you can make one trip for stripers, make it here, this month." }, { species: "Bluefish", commonName: "Bluefish", peakTide: "Any", season: "Fall", waterTemp: "56-64°F", confidence: "high", flies: ["gurgler", "deceiver", "half_and_half"], description: "Chopper bluefish in full fall feeding frenzy. 10-15 lb fish on the surface.", lookFor: "Surface chaos, oil slicks, diving gannets", tip: "Fall blues are as big as they get. 9-wt with wire tippet. They will cut you off instantly with mono." }],
      11: [{ species: "Striped Bass", commonName: "Striped Bass", peakTide: "Outgoing", season: "Late Fall", waterTemp: "48-58°F", confidence: "medium", flies: ["clouser_striper", "half_and_half"], description: "Schooling bass continue south. Montauk and the Cape still produce into November on mild days.", lookFor: "Bass along jetties and in tidal rivers as water cools", tip: "November bass are prespawn, they bulk up. One November striper day can be the best of the year." }],
      12: [],
    },
  },

  // ── PACIFIC COAST INSHORE ─────────────────────────────────────────────────
  pacific_inshore: {
    name: "Pacific Coast Inshore (CA · OR · WA · AK)",
    destinations: [
      "San Francisco Bay (CA)", "Tomales Bay (CA)", "Puget Sound (WA)",
      "Columbia River Estuary (OR/WA)", "Sitka Sound (AK)", "Kona Coast (HI)"
    ],
    tides: {
      1: [{ species: "Leopard Shark", commonName: "Leopard Shark", peakTide: "Incoming, warming flats", season: "Winter", waterTemp: "54-60°F", confidence: "medium", flies: ["ep_spawning_shrimp", "borski_slider"], description: "Leopard sharks cruise SF Bay flats on incoming tide seeking crustaceans.", lookFor: "Shadowy torpedo shapes moving slowly along sandy flats in clear water", tip: "Leopard sharks spook easily in clear water, long cast, no splash, dead drift along the bottom." }],
      4: [{ species: "Striped Bass", commonName: "Pacific Striped Bass", peakTide: "Outgoing, tidal rivers", season: "Spring", waterTemp: "56-64°F", confidence: "high", flies: ["clouser_striper", "deceiver"], description: "SF Bay Delta stripers move into the Sacramento and San Joaquin systems. One of the country's best striper fisheries.", lookFor: "Fish feeding on anchovies in the bay, bass in Delta sloughs on outgoing tide", tip: "Fish the Delta's tidal sloughs with a sinking line and bunker-colored Clouser." }],
      5: [{ species: "Striped Bass", commonName: "Pacific Striped Bass", peakTide: "Outgoing, dawn", season: "Spring", waterTemp: "58-66°F", confidence: "high", flies: ["clouser_striper", "deceiver", "gurgler"], description: "Peak SF Bay striper season. Fish stack under the Bay Bridge and along the South Bay mudflats.", lookFor: "Stripers busting on anchovies near structure, wakes along rip-rap", tip: "A 7-wt can handle SF Bay school bass. A 9-wt for the big girls over the Bay Bridge at first light." }],
      6: [{ species: "Halibut", commonName: "Pacific Halibut / California Halibut", peakTide: "Incoming, over sandy shallows", season: "Summer", waterTemp: "58-66°F", confidence: "high", flies: ["clouser_minnow_bone", "borski_slider", "ep_spawning_shrimp"], description: "Summer halibut move into SF Bay and coastal estuaries. A prime target for fly fishers.", lookFor: "Halibut laying flat on white sandy areas in 6-15 ft", tip: "Fish the bottom. Halibut don't chase, your fly needs to land almost on their nose." }],
      7: [{ species: "Halibut", commonName: "Pacific Halibut", peakTide: "Incoming", season: "Summer", waterTemp: "60-68°F", confidence: "high", flies: ["clouser_minnow_bone", "deceiver"], description: "July is peak halibut season in California bays. Large fish on sandy flats.", lookFor: "Sandy bottom in 8-20 ft with nearby structure, halibut ambush from flat ground", tip: "Slow, bottom-hugging strip. Halibut eat squid and anchovies, white or clear patterns work best." }],
      8: [{ species: "Coho Salmon", commonName: "Coho Salmon", peakTide: "Incoming, nearshore", season: "Summer", waterTemp: "54-62°F", confidence: "high", flies: ["half_and_half", "deceiver", "clouser_striper"], description: "Pacific Coho arrive off the Oregon and Washington coast. Feeding on anchovies just inside the surf zone.", lookFor: "Coho busting anchovies along beaches and in river mouths", tip: "Coho are aggressive. Match the anchovy, small, silver Clouser or Deceiver stripped fast." }],
      9: [{ species: "Coho Salmon", commonName: "Coho Salmon", peakTide: "Incoming, river mouths", season: "Fall Run", waterTemp: "52-62°F", confidence: "high", flies: ["half_and_half", "deceiver", "clouser_striper"], description: "Peak Coho run. Fish stack in river mouths and nearshore waters from Northern California to Alaska.", lookFor: "Chrome fish rolling in tidal reaches, feeding schools in the surf", tip: "Intercept coho before they enter the river in tidal water, they're chrome, fast, and will take a fly readily." }, { species: "Chinook Salmon", commonName: "King Salmon", peakTide: "Incoming", season: "Fall Run", waterTemp: "50-58°F", confidence: "medium", flies: ["half_and_half", "deceiver"], description: "Chinook kings stack in nearshore waters and tidal reaches during fall run. The trophy saltwater fly target.", lookFor: "Large dark backs rolling in the surf, schools in tidal rivers", tip: "Kings don't eat flies readily in salt, fish them actively in tidal reaches where they're still chrome." }],
      10: [{ species: "Coho Salmon", commonName: "Coho Salmon", peakTide: "Incoming", season: "Peak Fall Run", waterTemp: "50-58°F", confidence: "high", flies: ["half_and_half", "deceiver"], description: "October is the peak of Pacific salmon in tidal water from the Pacific Northwest into Alaska.", lookFor: "Chrome fish jumping in bay entrances and river mouths", tip: "October in Puget Sound: coho everywhere from the boat launch to the beach. A 7-wt and Clouser is all you need." }],
      11: [{ species: "Striped Bass", commonName: "Pacific Striped Bass", peakTide: "Outgoing", season: "Fall", waterTemp: "56-64°F", confidence: "medium", flies: ["clouser_striper", "deceiver"], description: "Fall SF Bay stripers move through the Delta system back to the bay. Good action on outgoing tide.", lookFor: "Bass near channel markers and rip-rap in the outer delta", tip: "November striper fishing in SF Bay is underrated. Fewer fishermen, bigger fish." }],
      12: [],
    },
  },

  // ── CAROLINAS / MID-ATLANTIC INSHORE ─────────────────────────────────────
  carolina_inshore: {
    name: "Carolinas & Mid-Atlantic Inshore (NC · SC · GA · VA)",
    destinations: [
      "Outer Banks (NC)", "Cape Fear (NC)", "Pawleys Island Flats (SC)",
      "ACE Basin (SC)", "Golden Isles (GA)", "Virginia Beach Nearshore (VA)"
    ],
    tides: {
      1: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, afternoon sun", season: "Winter", waterTemp: "48-56°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Winter reds school in deep creek bends and tidal rivers in the Carolinas.", lookFor: "Schools visible in clear creek channels on cold clear days", tip: "A warm day between fronts is your window. Fish creek mouths as the incoming tide warms shallow flats." }],
      3: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Spring", waterTemp: "56-66°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Spring reds return to ACE Basin and Savannah flats. Sight-fishing on flood tide grass beds.", lookFor: "Tailing fish in spartina grass at high tide", tip: "Georgia's Golden Isles in March: tailing reds in knee-deep water over oyster shell. One of fly fishing's underrated gems." }],
      4: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Flooding, high tide push", season: "Spring", waterTemp: "62-70°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Prime Carolina redfish season. Flood tide fishing in spartina grass marshes.", lookFor: "Wakes and tails in flooded grass on the highest tides of the month", tip: "Flood tide redfishing: push your kayak into the spartina on the flood. Wait. The reds come to you." }, { species: "Cobia", commonName: "Cobia", peakTide: "Incoming, nearshore", season: "Spring Migration", waterTemp: "66-72°F", confidence: "medium", flies: ["half_and_half", "deceiver"], description: "Cobia migrate north along the Outer Banks and Virginia Beach in spring. Sight-fishing from boats.", lookFor: "Dark shapes near the surface following rays and sharks", tip: "Cobia follow cownose rays in spring. Find the rays, cast to the cobia swimming behind them." }],
      5: [{ species: "Cobia", commonName: "Cobia", peakTide: "Incoming", season: "Peak Migration", waterTemp: "68-74°F", confidence: "high", flies: ["half_and_half", "sea_habit", "deceiver"], description: "Peak cobia migration. Virginia Beach buoy season is the most famous cobia fishery in America.", lookFor: "Large dark fish cruising the surface near buoys and channel markers", tip: "Cast to a cobia's head. Don't strip too fast, they are deliberate feeders. One strip, pause, one strip." }],
      6: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Flooding, dawn", season: "Summer", waterTemp: "74-80°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Summer flood tide redfishing at dawn in SC and GA. Get on the water before the sun.", lookFor: "Tails in the first 6 inches of flooding water as it enters the marsh", tip: "Be at the landing at 4:30am. The bite window on summer flood tide is often just 90 minutes." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Dawn, outgoing", season: "Summer", waterTemp: "76-82°F", confidence: "high", flies: ["gurgler", "borski_slider"], description: "Summer trout on shallow grass flats at dawn. Topwater produces explosive strikes.", lookFor: "Nervous glass minnows, trout pushing water along grass edges", tip: "A gurgler on a 6-wt is pure fun. Cast along grass edges at sunrise when trout are aggressive." }],
      7: [{ species: "Flounder", commonName: "Summer Flounder", peakTide: "Outgoing, tidal cuts", season: "Summer", waterTemp: "74-80°F", confidence: "high", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Flounder stack in tidal cuts and creek mouths throughout the Carolinas. A great summer target.", lookFor: "Sandy-bottom tidal cuts with adjacent grass beds, flounder often visible", tip: "Flounder ambush from sand. Your fly must bounce along the bottom through the cut." }],
      8: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Flooding", season: "Late Summer", waterTemp: "80-86°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Late summer reds in ACE Basin and Georgia. Fish dawn or dusk, mid-day heat is brutal.", lookFor: "Wakes in shallow creek heads on the highest moon tides", tip: "August: wade in the dark. Arrive before sunrise and position before the fish come in on the flood." }],
      9: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Flooding, morning", season: "Fall Peak", waterTemp: "74-80°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Fall is the best month in the Carolinas. Reds are fat, fish are aggressive, water starts to clear.", lookFor: "Large schools tailing on the flats, pods moving on the flooding tide", tip: "September/October flood tide redfishing in ACE Basin and Golden Isles = world class. Period." }],
      10: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Peak Fall", waterTemp: "66-72°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "The very best month for Carolina and Georgia redfishing. Clear water, aggressive fish, perfect temperatures.", lookFor: "Everything, tails, wakes, pods on open flats and in the grass", tip: "October in the Golden Isles is where legends are made. Guide trips book 18 months out for good reason." }],
      11: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Mid-tide", season: "Late Fall", waterTemp: "56-64°F", confidence: "medium", flies: ["ep_spawning_shrimp", "clouser_minnow_bone"], description: "Late season reds. Cold fronts push fish into deeper creeks. Warm days still produce great shallow action.", lookFor: "Fish bunched in creek bends and tidal holes on warm days", tip: "Fish between the cold fronts. The 2-3 day window after a front passes often produces the clearest water." }],
      12: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, afternoon", season: "Winter", waterTemp: "48-56°F", confidence: "low", flies: ["ep_spawning_shrimp", "borski_slider"], description: "December reds retreat deep but warm spells bring them back. The last days of the southern season.", lookFor: "Fish on sun-warmed banks on the first warm day after a cold spell", tip: "December fishing is unpredictable. But a 60°F January day in Georgia with tailing reds is one of fly fishing's gifts." }],
    },
  },

  // ── TEXAS COAST (Dedicated) — Laguna Madre, Baffin Bay, Aransas, Matagorda ──
  texas_coast: {
    name: "Texas Coast (Laguna Madre · Baffin Bay · Aransas · Matagorda)",
    destinations: [
      "Lower Laguna Madre (TX)", "Upper Laguna Madre (TX)", "Baffin Bay (TX)",
      "Aransas Bay (TX)", "Redfish Bay (TX)", "Matagorda Bay (TX)", "Sabine Lake (TX)"
    ],
    tides: {
      1: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, afternoon sun", season: "Winter", waterTemp: "48-60°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Winter reds school in deep channels and bayous. On warm days between fronts, fish move onto sun-warmed flats.", lookFor: "Tails in 6-8 inches on south-facing mud flats on the warmest afternoon of the week", tip: "The day after a cold front is dead. The third day after, with calm wind and rising temps, is the best fishing of the month." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Winter", waterTemp: "50-60°F", confidence: "medium", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Baffin Bay is world-famous for giant winter trout. Cold water concentrates them in deep grass-edge drop-offs.", lookFor: "Grass beds in 4-6 feet near the Baffin shoreline, especially rocky points", tip: "Baffin Bay trout in winter are the biggest in Texas. Slow retrieve, dead drift along the bottom. They don't chase in cold water." }],
      2: [{ species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing, afternoon", season: "Late Winter", waterTemp: "52-62°F", confidence: "high", flies: ["borski_slider", "gurgler"], description: "Baffin Bay trophy trout season peaks. The largest speckled trout in the United States are caught here in February.", lookFor: "Rocks and hard-bottom areas in Baffin Bay on warm afternoons, solitary fish", tip: "Baffin Bay is a wade-fishing destination. Stingray shuffle, slow down, and work every piece of hard bottom." }, { species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Late Winter", waterTemp: "54-62°F", confidence: "medium", flies: ["ep_spawning_shrimp", "clouser_minnow_bone"], description: "Reds begin returning to shallow flats as days lengthen. Look for them on the warmest water.", lookFor: "Backs and tails visible in 4-8 inches of clear water", tip: "February afternoons on the Laguna with calm, clear water and a rising tide can be magical." }],
      3: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, 1-2 hrs before high", season: "Spring", waterTemp: "62-70°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Spring prime time on the Laguna Madre. Reds push onto the flats with warming water. Best sight-fishing of the year.", lookFor: "Tailing fish in 6 inches to 2 feet over sand and seagrass. Golden-bronze flash in clear water.", tip: "Spot-and-stalk on the Laguna: wade silently, lead the fish 4-6 feet, one strip after the fly lands, then dead-drift." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Spring", waterTemp: "64-72°F", confidence: "high", flies: ["borski_slider", "gurgler"], description: "Trout push onto spawning grass flats. Early morning topwater fishing on the Texas bays is exceptional.", lookFor: "Nervous water over thick seagrass in 1-3 feet, dawn surface activity", tip: "A dawn gurgler on the Texas Laguna is a religious experience. Be on the water at first light." }],
      4: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Spring", waterTemp: "68-76°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Peak spring flats action. Spawning shrimp trigger aggressive redfish on every Texas bay.", lookFor: "Pods of 3-10 fish tailing and cruising in gin-clear shallows", tip: "Polarized glasses are non-negotiable on the Laguna. A tailing red in 6 inches of clear water is the most thrilling target in saltwater fly fishing." }, { species: "Flounder", commonName: "Southern Flounder", peakTide: "Outgoing, strong ebb", season: "Spring", waterTemp: "66-74°F", confidence: "medium", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Flounder ambush baitfish in tidal cuts and passes throughout the Texas bays.", lookFor: "Tidal cuts and passes with sandy bottoms adjacent to seagrass beds", tip: "Dead slow retrieve along the bottom. Flounder lay flat and ambush from below, your fly needs to nearly touch the sand." }],
      5: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Slack, just before outgoing", season: "Late Spring", waterTemp: "74-80°F", confidence: "medium", flies: ["cockroach", "tarpon_toad", "black_death"], description: "Juvenile tarpon enter the Texas bays and passes. A legitimate fly target in Aransas and Corpus Christi Bays.", lookFor: "Rolling fish in passes, creek mouths, and bay-to-bay cuts", tip: "Tarpon breathe air. Watch for a roll and present the fly as the fish comes up, not after it submerges." }, { species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, dawn", season: "Late Spring", waterTemp: "72-80°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "Redfish are everywhere on the Texas Coast in May. Tailing fish from Port Isabel to Port Arthur.", lookFor: "Early morning tails before the wind picks up, dawn is everything on the Texas coast", tip: "Texas wind: fish before 9am or after 6pm. The afternoon wind on the Laguna will destroy your casting and your sanity." }],
      6: [{ species: "Tarpon", commonName: "Atlantic Tarpon", peakTide: "Incoming, night or dawn", season: "Peak Summer", waterTemp: "78-84°F", confidence: "high", flies: ["cockroach", "black_death", "tarpon_toad"], description: "Peak Gulf tarpon season. Large schools move through Texas passes and bay mouths at dawn. The best tarpon opportunity on the Upper Texas Coast.", lookFor: "Fish rolling in passes at first light, daisy chains at sunrise", tip: "Pre-dawn start is essential. Aransas Pass and Pass Cavallo are the top tarpon spots in June. Hire a local guide." }, { species: "Redfish", commonName: "Red Drum", peakTide: "Outgoing, dusk", season: "Summer", waterTemp: "80-86°F", confidence: "high", flies: ["bruce_chard_redfish", "ep_spawning_shrimp"], description: "Summer reds school on the ICW edges and mud flats. Dawn and dusk are the only viable windows.", lookFor: "Wakes and nervous water in 6 inches on protected, calm bays. Look away from the sun.", tip: "Texas summer: fish the first 2 hours of daylight and the last hour before dark. Mid-day is dead on the flats." }],
      7: [{ species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Dawn, any tide", season: "Summer", waterTemp: "82-88°F", confidence: "medium", flies: ["gurgler", "borski_slider"], description: "Summer trout fishing on the Texas coast is an early morning game. Dawn topwater on the Laguna can be explosive.", lookFor: "Tailing fish on shallow seagrass flats with first light. Diving terns mark feeding fish.", tip: "If you see terns working a shoreline at 6:30am on the Texas Laguna, run to them. Trout are feeding below." }],
      8: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming, afternoon", season: "Late Summer", waterTemp: "84-90°F", confidence: "medium", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "August is brutal but fishable. Downsize your fly, fish the coolest water available, target shaded structure.", lookFor: "Shade under mangroves, deep edges of oyster reefs, early morning tails before 8am", tip: "August on the Texas coast: arrive before sunrise. The window between first light and 8am is everything." }],
      9: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Fall Peak", waterTemp: "76-84°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish", "clouser_minnow_bone"], description: "Fall arrives on the Texas coast. Pre-spawn bull reds congregate in massive schools. Slot reds dominate the flats. The best time of year.", lookFor: "Large pods of tailing fish on clear flats, nervous wakes in protected bays. October is coming.", tip: "September through November is peak Texas coast fly fishing. Every serious saltwater angler in Texas knows this. Book early." }, { species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Fall", waterTemp: "72-80°F", confidence: "high", flies: ["borski_slider", "gurgler", "ep_spawning_shrimp"], description: "Fall trout stack up on drop-offs and grass edges as baitfish school. All-day topwater on clear mornings.", lookFor: "Cormorants diving along grass edges, jumping trout, glass minnows skipping ahead of feeding fish", tip: "The outgoing tide pushes baitfish off the grass into the adjacent channels. Fish the seam at the edge." }],
      10: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Incoming", season: "Peak Fall", waterTemp: "66-74°F", confidence: "high", flies: ["ep_spawning_shrimp", "bruce_chard_redfish"], description: "The best month on the Texas coast. Water clear, fish fat, crowds thin. October on the Laguna is world-class by any measure.", lookFor: "Tailing fish, golden-bronze flashes, early morning wakes on mirror-flat water", tip: "October in the Lower Laguna Madre is the pinnacle of Texas saltwater fly fishing. This is the trip you plan a year in advance." }],
      11: [{ species: "Redfish", commonName: "Red Drum", peakTide: "Mid-tide", season: "Late Fall", waterTemp: "56-68°F", confidence: "medium", flies: ["ep_spawning_shrimp", "clouser_minnow_bone"], description: "Cold fronts push fish into deeper water. The windows between fronts produce some of the clearest, most beautiful flats fishing of the year.", lookFor: "Fish on sun-warmed mud flats on south-facing banks between cold fronts", tip: "The third day after a cold front, with the wind finally calm: that is the most underrated day in Texas fishing." }],
      12: [{ species: "Spotted Seatrout", commonName: "Speckled Trout", peakTide: "Outgoing", season: "Winter", waterTemp: "50-60°F", confidence: "medium", flies: ["borski_slider", "ep_spawning_shrimp"], description: "Winter trout hold deep in warm bayous and the Baffin Bay system. The biggest fish of the year are caught now.", lookFor: "Deep grass beds in 4-6 feet of water, protected from north wind", tip: "Baffin Bay in December: the fish are giants and the water is cold and clear. Slow retrieve, long pauses. Patience wins." }],
    },
  },
};

export const swRegionKeys = Object.keys(swRegions);

// Map coastal states to SW regions
export const stateSWRegion: Record<string, string> = {
  // Texas Coast (dedicated)
  TX: "texas_coast",
  // Gulf Coast Flats
  LA: "gulf_coast_flats", MS: "gulf_coast_flats",
  AL: "gulf_coast_flats",
  // Florida, split between gulf/keys/carolina
  FL: "florida_keys",
  // Carolina Inshore
  NC: "carolina_inshore", SC: "carolina_inshore", GA: "carolina_inshore",
  VA: "carolina_inshore",
  // Striper Coast
  ME: "striper_coast", NH: "striper_coast", MA: "striper_coast",
  RI: "striper_coast", CT: "striper_coast", NY: "striper_coast",
  NJ: "striper_coast", DE: "striper_coast", MD: "striper_coast",
  PA: "striper_coast",  // Delaware Bay
  // Pacific Inshore
  CA: "pacific_inshore", OR: "pacific_inshore", WA: "pacific_inshore",
  AK: "pacific_inshore", HI: "pacific_inshore",
};

export function getSwFlyTypeLabel(type: SWFlyType): string {
  const labels: Record<SWFlyType, string> = {
    streamer: "Streamer",
    popper: "Popper / Topwater",
    crab: "Crab Pattern",
    shrimp: "Shrimp Pattern",
    baitfish: "Baitfish",
    worm: "Worm / Slider",
  };
  return labels[type] || type;
}

export function getSwFlyTypeBadgeClass(type: SWFlyType): string {
  const classes: Record<SWFlyType, string> = {
    streamer: "bg-blue-900 text-blue-200",
    popper: "bg-yellow-900 text-yellow-200",
    crab: "bg-red-900 text-red-200",
    shrimp: "bg-pink-900 text-pink-200",
    baitfish: "bg-slate-700 text-slate-200",
    worm: "bg-amber-900 text-amber-200",
  };
  return classes[type] || "bg-stone-800 text-stone-200";
}

export const swMonthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
