export interface Knot {
  id: string;
  name: string;
  purpose: string;
  strength: string; // % of line strength retained
  difficulty: "easy" | "moderate" | "advanced";
  steps: string[];
  tip: string;
  usedFor: string[]; // fly type ids or situation keys
  situation: string; // plain english when to use
}

export const knots: { [id: string]: Knot } = {
  improved_clinch: {
    id: "improved_clinch",
    name: "Improved Clinch Knot",
    purpose: "Attaches fly to tippet",
    strength: "95%",
    difficulty: "easy",
    steps: [
      "Thread 6 inches of tippet through the hook eye",
      "Wrap the tag end around the standing line 5-7 times",
      "Pass the tag end back through the loop near the eye",
      "Pass it through the large loop you just created",
      "Wet the knot, pull the standing line to tighten",
      "Seat firmly against the eye and trim the tag",
    ],
    tip: "Use 5 wraps for heavier tippet (3X-4X), 7 wraps for fine tippet (6X-7X).",
    usedFor: ["dry", "emerger", "terrestrial"],
    situation: "Attaching dry flies, emergers, and terrestrials to tippet",
  },
  palomar: {
    id: "palomar",
    name: "Palomar Knot",
    purpose: "Attaches fly to tippet, maximum strength",
    strength: "99%",
    difficulty: "easy",
    steps: [
      "Double 6 inches of tippet and pass the loop through the hook eye",
      "Tie a simple overhand knot with the doubled line, leave the hook hanging",
      "Pass the hook through the large loop",
      "Wet and pull both ends to tighten",
      "Trim the tag end close",
    ],
    tip: "The strongest knot for attaching flies. Preferred for streamers and heavy nymphs where maximum strength matters.",
    usedFor: ["streamer", "nymph"],
    situation: "Attaching streamers and heavy nymphs where maximum knot strength is critical",
  },
  davy_knot: {
    id: "davy_knot",
    name: "Davy Knot",
    purpose: "Fast single-fly attachment",
    strength: "90%",
    difficulty: "easy",
    steps: [
      "Thread tippet through the hook eye",
      "Form a loop and pass the tag end through it",
      "Pass the tag end over the standing line and back through the loop again",
      "Wet and pull tight against the eye",
      "Trim close, this knot is tiny by design",
    ],
    tip: "The fastest knot to tie on the water. Invaluable during a hatch when you're changing flies quickly.",
    usedFor: ["dry", "emerger"],
    situation: "Speed-tying during an active hatch when you need to change flies fast",
  },
  blood_knot: {
    id: "blood_knot",
    name: "Blood Knot",
    purpose: "Joins two sections of similar-diameter leader/tippet",
    strength: "90%",
    difficulty: "moderate",
    steps: [
      "Overlap the two line ends by 6 inches",
      "Wrap one tag end around the other line 5 times",
      "Pass the tag end back through the center gap",
      "Repeat on the other side, 5 wraps in the opposite direction",
      "Pass that tag through the center gap in the opposite direction",
      "Wet thoroughly and pull both standing lines to tighten",
      "Trim both tag ends",
    ],
    tip: "Keep both tag ends pointing in opposite directions through the center gap or the knot will slip. Best for lines within 2X of each other.",
    usedFor: ["dry", "nymph", "emerger", "terrestrial", "streamer"],
    situation: "Connecting tippet to leader, or adding a new tippet section",
  },
  surgeons_knot: {
    id: "surgeons_knot",
    name: "Surgeon's Knot",
    purpose: "Joins tippet to leader, easier alternative to blood knot",
    strength: "95%",
    difficulty: "easy",
    steps: [
      "Overlap the two lines by 6-8 inches",
      "Form a loop with both lines together",
      "Pass both tag ends through the loop twice (double surgeon's)",
      "Wet the knot and pull all four strands simultaneously",
      "Trim both tag ends short",
    ],
    tip: "Easier than the blood knot and works even when the two lines differ significantly in diameter, ideal for adding fine tippet to a heavier leader.",
    usedFor: ["dry", "nymph", "emerger", "terrestrial", "streamer"],
    situation: "Adding tippet to your leader, especially when sizes differ (e.g. 4X leader to 6X tippet)",
  },
  dropper_loop: {
    id: "dropper_loop",
    name: "Dropper Loop",
    purpose: "Creates a loop mid-line for attaching a second fly",
    strength: "85%",
    difficulty: "moderate",
    steps: [
      "Form a loop in the middle of your line",
      "Wrap one side of the loop around itself 5-6 times",
      "Push the original loop through the center of the wraps",
      "Wet and pull both standing ends to tighten",
      "Attach the dropper fly using an improved clinch through the loop",
    ],
    tip: "Position the dropper 18-24 inches above the point fly. Great for nymph-under-dry or double nymph rigs.",
    usedFor: ["nymph", "dry", "emerger"],
    situation: "Two-fly dropper rigs, nymph below a dry fly, or tandem nymph setups",
  },
  non_slip_mono: {
    id: "non_slip_mono",
    name: "Non-Slip Mono Loop",
    purpose: "Attaches streamer with a loop for maximum action",
    strength: "95%",
    difficulty: "moderate",
    steps: [
      "Make an overhand knot 4 inches from the tag end, do not tighten",
      "Thread the tag through the hook eye",
      "Pass the tag back through the overhand knot loop",
      "Wrap the tag around the standing line 4-6 times (fewer for heavier line)",
      "Pass the tag back through the overhand knot from the same side it exited",
      "Wet and pull the standing line to tighten the loop",
      "Pull the tag to snug the wraps",
    ],
    tip: "The loop allows the fly to swing and breathe freely, essential for streamer fishing. Size the loop to about 1/4 inch.",
    usedFor: ["streamer"],
    situation: "Attaching streamers and Woolly Buggers, the loop gives the fly lifelike movement in the current",
  },
  turle_knot: {
    id: "turle_knot",
    name: "Turle Knot",
    purpose: "Keeps fly aligned straight on tippet",
    strength: "85%",
    difficulty: "moderate",
    steps: [
      "Thread tippet through the hook eye and past the fly",
      "Form a loop and tie a double overhand knot (slip knot) in the tag end",
      "Pass the loop over the fly completely",
      "Slide the loop up to seat behind the hook eye",
      "Pull the standing line to tighten",
    ],
    tip: "Ideal for flies tied on turned-down or turned-up eyes, keeps the fly swimming straight instead of cocked at an angle.",
    usedFor: ["dry", "emerger"],
    situation: "Dry flies with turned-down eyes where straight fly alignment matters for presentation",
  },
  trilene_knot: {
    id: "trilene_knot",
    name: "Trilene Knot",
    purpose: "Extra-secure fly attachment, double loop through eye",
    strength: "95%",
    difficulty: "easy",
    steps: [
      "Run the tag end through the hook eye twice, forming a double loop",
      "Wrap the tag end around the standing line 5-6 times",
      "Pass the tag end back through both loops near the eye",
      "Wet and pull the standing line firmly to tighten",
      "Trim the tag",
    ],
    tip: "The double pass through the eye makes this extremely secure, great for nymphs fished with heavy split shot where the knot takes a beating.",
    usedFor: ["nymph"],
    situation: "Nymphs fished deep with weight, the double loop prevents the knot from slipping under stress",
  },
};

// Map fly types to their recommended knots with context
export interface KnotRecommendation {
  knotId: string;
  reason: string;
  primary: boolean; // true = first choice, false = alternative
}

export function getKnotsForFly(flyType: string, situation?: string): KnotRecommendation[] {
  const recs: KnotRecommendation[] = [];

  if (flyType === "dry" || flyType === "emerger" || flyType === "terrestrial") {
    recs.push(
      { knotId: "improved_clinch", reason: "Standard tippet-to-fly connection. Reliable and fast.", primary: true },
      { knotId: "davy_knot", reason: "Fastest to tie during an active hatch when you're switching flies.", primary: false },
      { knotId: "turle_knot", reason: "Best for turned-down eye hooks, keeps the fly tracking straight.", primary: false },
      { knotId: "surgeons_knot", reason: "For adding fine tippet (6X-7X) to your leader before the fly.", primary: false },
    );
  }

  if (flyType === "nymph") {
    recs.push(
      { knotId: "improved_clinch", reason: "Standard connection for most nymph rigs.", primary: true },
      { knotId: "trilene_knot", reason: "Extra security when fishing heavy split shot and deep fast water.", primary: false },
      { knotId: "dropper_loop", reason: "For two-nymph tandem rigs or nymph-under-dry setups.", primary: false },
      { knotId: "surgeons_knot", reason: "Connecting tippet to leader before rigging your nymphs.", primary: false },
    );
  }

  if (flyType === "streamer") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot lets the fly swim and breathe freely, essential for streamer action.", primary: true },
      { knotId: "palomar", reason: "Maximum strength when you're targeting big fish in heavy current.", primary: false },
      { knotId: "surgeons_knot", reason: "Attaching heavy tippet (0X-2X) to your leader for streamer fishing.", primary: false },
    );
  }

  // Saltwater fly types
  if (flyType === "shrimp") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot lets shrimp patterns breathe and kick naturally on the strip.", primary: true },
      { knotId: "improved_clinch", reason: "Reliable connection when a loop knot isn't needed for smaller shrimp patterns.", primary: false },
      { knotId: "surgeons_knot", reason: "Connecting bite or shock tippet to your class tippet.", primary: false },
    );
  }

  if (flyType === "crab") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot gives crab patterns natural movement and sinks more naturally.", primary: true },
      { knotId: "improved_clinch", reason: "Solid fixed connection for smaller crab patterns on lighter tippet.", primary: false },
      { knotId: "surgeons_knot", reason: "Tying class tippet to leader butt for permit and redfish leaders.", primary: false },
    );
  }

  if (flyType === "baitfish") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot is essential for baitfish patterns, free-swinging action triggers strikes.", primary: true },
      { knotId: "palomar", reason: "Maximum strength for large baitfish patterns targeting tarpon or GT.", primary: false },
      { knotId: "surgeons_knot", reason: "Joining shock or bite tippet sections on big-game leaders.", primary: false },
    );
  }

  if (flyType === "popper") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot allows poppers to dart and splash freely without restriction.", primary: true },
      { knotId: "palomar", reason: "Strong fixed connection for heavier popper hooks.", primary: false },
    );
  }

  if (flyType === "worm") {
    recs.push(
      { knotId: "non_slip_mono", reason: "Loop knot gives worm patterns the undulating action that triggers redfish and bonefish.", primary: true },
      { knotId: "improved_clinch", reason: "Clean fixed connection for smaller worm patterns.", primary: false },
    );
  }

  return recs;
}

export function getDifficultyColor(level: Knot["difficulty"]) {
  if (level === "easy") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (level === "moderate") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
}
