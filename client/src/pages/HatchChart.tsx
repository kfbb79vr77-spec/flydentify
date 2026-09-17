import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, Leaf, Waves, Droplets, Thermometer, TrendingUp, TrendingDown, Minus, Menu, X } from "lucide-react";
import { useTrack } from "@/lib/useTrack";
import logoImg from "@assets/flydentify_logo.png";
import hatchEmergenceVid from "@assets/videos/hatch_emergence.mp4";
import hatchEmergenceSwVid from "@assets/videos/saltwater_flats_cast.mp4";
import {
  regions,
  flies,
  monthNames,
  type ConfidenceLevel,
  type HatchEvent,
} from "@/lib/flyData";
import {
  swRegions,
  swRegionKeys,
  saltwaterFlies,
  type TidalEvent,
} from "@/lib/saltwaterFlyData";

// ── Freshwater fly images ───────────────────────────────────────────────────────────
import { HatchPlateLightbox } from "@/components/HatchPlateLightbox";
import fwAdamsImg from "@assets/flies/adams.png";
import fwElkHairCaddisImg from "@assets/flies/elk_hair_caddis.png";
import fwParachuteAdamsImg from "@assets/flies/parachute_adams.png";
import fwHareEarNymphImg from "@assets/flies/hare_ear_nymph.png";
import fwPheasantTailImg from "@assets/flies/pheasant_tail.png";
import fwCopperJohnImg from "@assets/flies/copper_john.png";
import fwWoollyBuggerImg from "@assets/flies/woolly_bugger.png";
import fwMuddlerMinnowImg from "@assets/flies/muddler_minnow.png";
import fwPmdEmergerImg from "@assets/flies/pmd_emerger.png";
import fwCdcBwoImg from "@assets/flies/cdc_bwo.png";
import fwDaveHopperImg from "@assets/flies/dave_hopper.png";
import fwAntPatternImg from "@assets/flies/ant_pattern.png";
import fwStoneflyNymphImg from "@assets/flies/stonefly_nymph.png";
import fwStimulatorImg from "@assets/flies/stimulator.png";
import fwZebraMidgeImg from "@assets/flies/zebra_midge.png";
import fwGriffithsGnatImg from "@assets/flies/griffiths_gnat.png";

const fwFlyImages: Record<string, string> = {
  adams: fwAdamsImg,
  elk_hair_caddis: fwElkHairCaddisImg,
  parachute_adams: fwParachuteAdamsImg,
  hare_ear_nymph: fwHareEarNymphImg,
  pheasant_tail: fwPheasantTailImg,
  copper_john: fwCopperJohnImg,
  woolly_bugger: fwWoollyBuggerImg,
  muddler_minnow: fwMuddlerMinnowImg,
  pmd_emerger: fwPmdEmergerImg,
  cdc_bwo: fwCdcBwoImg,
  dave_hopper: fwDaveHopperImg,
  ant_pattern: fwAntPatternImg,
  stonefly_nymph: fwStoneflyNymphImg,
  stimulator: fwStimulatorImg,
  zebra_midge: fwZebraMidgeImg,
  griffiths_gnat: fwGriffithsGnatImg,
};

// ── Saltwater fly images ─────────────────────────────────────────────────────────────
import swCrazyCharlieImg from "@assets/flies/saltwater/crazy_charlie.png";
import swGotchaImg from "@assets/flies/saltwater/gotcha.png";
import swClouserBoneImg from "@assets/flies/saltwater/clouser_minnow_bone.png";
import swCockroachImg from "@assets/flies/saltwater/cockroach.png";
import swBlackDeathImg from "@assets/flies/saltwater/black_death.png";
import swTarponToadImg from "@assets/flies/saltwater/tarpon_toad.png";
import swDelBrownImg from "@assets/flies/saltwater/del_brown_permit.png";
import swSpawningShrimpImg from "@assets/flies/saltwater/spawning_shrimp.png";
import swEpSpawningImg from "@assets/flies/saltwater/ep_spawning_shrimp.png";
import swBruceChardImg from "@assets/flies/saltwater/bruce_chard_redfish.png";
import swClouserStriperImg from "@assets/flies/saltwater/clouser_striper.png";
import swDeceiverImg from "@assets/flies/saltwater/deceiver.png";
import swGurglerImg from "@assets/flies/saltwater/gurgler.png";
import swSeaHabitImg from "@assets/flies/saltwater/sea_habit.png";
import swBorskiSliderImg from "@assets/flies/saltwater/borski_slider.png";
import swHalfAndHalfImg from "@assets/flies/saltwater/half_and_half.png";
import { useWaterMode } from "@/lib/waterModeContext";
import { TideChart } from "@/components/TideChart";

const swFlyImages: Record<string, string> = {
  crazy_charlie: swCrazyCharlieImg, gotcha: swGotchaImg,
  clouser_minnow_bone: swClouserBoneImg, cockroach: swCockroachImg,
  black_death: swBlackDeathImg, tarpon_toad: swTarponToadImg,
  del_brown_permit: swDelBrownImg, spawning_shrimp: swSpawningShrimpImg,
  ep_spawning_shrimp: swEpSpawningImg, bruce_chard_redfish: swBruceChardImg,
  clouser_striper: swClouserStriperImg, deceiver: swDeceiverImg,
  gurgler: swGurglerImg, sea_habit: swSeaHabitImg,
  borski_slider: swBorskiSliderImg, half_and_half: swHalfAndHalfImg,
};

// ── Fish portrait images ────────────────────────────────────────────────────
import portraitRainbowTroutImg from "@assets/portraits/fw/fw_plate_14_rainbow_trout.png";
import portraitBrownTroutImg from "@assets/portraits/fw/fw_plate_05_brown_trout.png";
import portraitBrookTroutImg from "@assets/portraits/fw/fw_plate_04_brook_trout.png";
import portraitCutthroatTroutImg from "@assets/portraits/fw/fw_plate_09_cutthroat_trout.png";
import portraitSteelheadImg from "@assets/portraits/fw/fw_plate_18_steelhead.png";
import portraitBullTroutImg from "@assets/portraits/fw/fw_plate_06_bull_trout.png";
import portraitApacheTroutImg from "@assets/portraits/fw/fw_plate_01_apache_trout.png";
import portraitGuadalupeBassImg from "@assets/portraits/fw/fw_plate_10_guadalupe_bass.png";
import portraitLargemouthBassImg from "@assets/portraits/fw/fw_plate_11_largemouth_bass.png";
import portraitSmallmouthBassImg from "@assets/portraits/fw/fw_plate_16_smallmouth_bass.png";
import portraitCarpImg from "@assets/portraits/fw/fw_plate_07_carp.png";
import portraitWalleyeImg from "@assets/portraits/fw/fw_plate_20_walleye.png";
import portraitNorthernPikeImg from "@assets/portraits/fw/fw_plate_12_northern_pike.png";
import portraitWhiteBassImg from "@assets/portraits/fw/fw_plate_21_white_bass.png";
import portraitTarponImg from "@assets/portraits/sw/sw_plate_01_atlantic_tarpon.png";
import portraitPermitImg from "@assets/portraits/sw/sw_plate_17_permit.png";
import portraitBonefishImg from "@assets/portraits/sw/sw_plate_06_bonefish.png";
import portraitRedDrumImg from "@assets/portraits/sw/sw_plate_19_red_drum.png";
import portraitStripedBassImg from "@assets/portraits/sw/sw_plate_27_striped_bass.png";
import portraitSpottedSeatroutImg from "@assets/portraits/sw/sw_plate_26_spotted_seatrout.png";
import portraitBluefishImg from "@assets/portraits/sw/sw_plate_05_bluefish.png";
import portraitFlounderImg from "@assets/portraits/sw/sw_plate_13_flounder.png";
import portraitSnookImg from "@assets/portraits/sw/sw_plate_23_snook.png";
import portraitSheepsheadImg from "@assets/portraits/sw/sw_plate_22_sheepshead.png";
import portraitCobiaImg from "@assets/portraits/sw/sw_plate_09_cobia.png";
import portraitFalseAlbacoreImg from "@assets/portraits/sw/sw_plate_12_false_albacore.png";
import portraitSpanishMackerelImg from "@assets/portraits/sw/sw_plate_25_spanish_mackerel.png";
import portraitWeakfishImg from "@assets/portraits/sw/sw_plate_28_weakfish.png";
import portraitBonitoImg from "@assets/portraits/sw/sw_plate_07_atlantic_bonito.png";
import portraitPacificHalibutImg from "@assets/portraits/sw/sw_plate_16_pacific_halibut.png";
import portraitLeopardSharkImg from "@assets/portraits/sw/sw_plate_14_leopard_shark.png";
import portraitRockfishImg from "@assets/portraits/sw/sw_plate_20_rockfish.png";
import portraitCohoSalmonImg from "@assets/portraits/sw/sw_plate_10_coho_salmon.png";
import portraitChinookSalmonImg from "@assets/portraits/sw/sw_plate_08_chinook_salmon.png";
import portraitPinkSalmonImg from "@assets/portraits/sw/sw_plate_18_pink_salmon.png";
import portraitSockeyeSalmonImg from "@assets/portraits/sw/sw_plate_24_sockeye_salmon.png";
import portraitDollyVardenImg from "@assets/portraits/sw/sw_plate_11_dolly_varden.png";
import portraitGiantTrevallyImg from "@assets/portraits/sw/sw_plate_03_giant_trevally.png";
import portraitBluefinTrevallyImg from "@assets/portraits/sw/sw_plate_04_bluefin_trevally.png";
import portraitMahiMahiImg from "@assets/portraits/sw/sw_plate_15_mahi_mahi.png";
import portraitYellowfinTunaImg from "@assets/portraits/sw/sw_plate_02_yellowfin_tuna.png";
import portraitSearunCutthroatImg from "@assets/portraits/sw/sw_plate_21_searun_cutthroat.png";

// FW portrait entries — `regions` lists which region keys show this species.
// Use ["*"] for species that appear in all regions (trout shown everywhere as baseline).
// Texas-specific warm-water species only appear when texas_hill_country is selected.
const FW_PORTRAITS = [
  // Trout — shown in all regions
  { name: "Rainbow Trout",   img: portraitRainbowTroutImg,  latin: "Oncorhynchus mykiss",           regions: ["*"] },
  { name: "Brown Trout",     img: portraitBrownTroutImg,    latin: "Salmo trutta",                   regions: ["*"] },
  { name: "Brook Trout",     img: portraitBrookTroutImg,    latin: "Salvelinus fontinalis",          regions: ["appalachian", "northeast", "great_lakes", "ozarks", "rockies", "pacific_northwest", "alaska"] },
  { name: "Cutthroat Trout", img: portraitCutthroatTroutImg,latin: "Oncorhynchus clarkii",          regions: ["rockies", "pacific_northwest", "alaska"] },
  { name: "Steelhead",       img: portraitSteelheadImg,     latin: "Oncorhynchus mykiss irideus",   regions: ["pacific_northwest", "alaska", "great_lakes"] },
  { name: "Bull Trout",      img: portraitBullTroutImg,     latin: "Salvelinus confluentus",        regions: ["rockies", "pacific_northwest", "alaska"] },
  { name: "Apache Trout",    img: portraitApacheTroutImg,   latin: "Oncorhynchus apache",           regions: ["southwest"] },
  // Texas Hill Country warm-water species
  { name: "Guadalupe Bass",  img: portraitGuadalupeBassImg, latin: "Micropterus treculii",          regions: ["texas_hill_country"] },
  { name: "Largemouth Bass", img: portraitLargemouthBassImg,latin: "Micropterus salmoides",         regions: ["texas_hill_country", "southeast", "ozarks", "great_plains", "appalachian", "great_lakes"] },
  { name: "Smallmouth Bass", img: portraitSmallmouthBassImg,latin: "Micropterus dolomieu",          regions: ["texas_hill_country", "ozarks", "appalachian", "northeast", "great_lakes"] },
  { name: "Carp",            img: portraitCarpImg,          latin: "Cyprinus carpio",               regions: ["texas_hill_country", "great_plains", "great_lakes"] },
  // Great Plains / Midwest
  { name: "Walleye",         img: portraitWalleyeImg,       latin: "Sander vitreus",               regions: ["great_plains", "great_lakes"] },
  { name: "Northern Pike",   img: portraitNorthernPikeImg,  latin: "Esox lucius",                  regions: ["great_plains", "great_lakes", "alaska"] },
  { name: "White Bass",      img: portraitWhiteBassImg,     latin: "Morone chrysops",              regions: ["great_plains", "texas_hill_country"] },
];

const SW_PORTRAITS = [
  { name: "Tarpon",            img: portraitTarponImg,          latin: "Megalops atlanticus" },
  { name: "Permit",            img: portraitPermitImg,          latin: "Trachinotus falcatus" },
  { name: "Bonefish",          img: portraitBonefishImg,        latin: "Albula vulpes" },
  { name: "Red Drum",          img: portraitRedDrumImg,         latin: "Sciaenops ocellatus" },
  { name: "Striped Bass",      img: portraitStripedBassImg,     latin: "Morone saxatilis" },
  { name: "Spotted Seatrout",  img: portraitSpottedSeatroutImg, latin: "Cynoscion nebulosus" },
  { name: "Bluefish",          img: portraitBluefishImg,        latin: "Pomatomus saltatrix" },
  { name: "Flounder",          img: portraitFlounderImg,        latin: "Paralichthys lethostigma" },
  { name: "Snook",             img: portraitSnookImg,           latin: "Centropomus undecimalis" },
  { name: "Sheepshead",        img: portraitSheepsheadImg,      latin: "Archosargus probatocephalus" },
  { name: "Cobia",             img: portraitCobiaImg,           latin: "Rachycentron canadum" },
  { name: "False Albacore",    img: portraitFalseAlbacoreImg,   latin: "Euthynnus alletteratus" },
  { name: "Spanish Mackerel",  img: portraitSpanishMackerelImg, latin: "Scomberomorus maculatus" },
  { name: "Weakfish",          img: portraitWeakfishImg,        latin: "Cynoscion regalis" },
  { name: "Bonito",            img: portraitBonitoImg,          latin: "Sarda sarda" },
  { name: "Pacific Halibut",   img: portraitPacificHalibutImg,  latin: "Hippoglossus stenolepis" },
  { name: "Leopard Shark",     img: portraitLeopardSharkImg,    latin: "Triakis semifasciata" },
  { name: "Rockfish",          img: portraitRockfishImg,        latin: "Sebastes spp." },
  { name: "Coho Salmon",       img: portraitCohoSalmonImg,      latin: "Oncorhynchus kisutch" },
  { name: "Chinook Salmon",    img: portraitChinookSalmonImg,   latin: "Oncorhynchus tshawytscha" },
  { name: "Pink Salmon",       img: portraitPinkSalmonImg,      latin: "Oncorhynchus gorbuscha" },
  { name: "Sockeye Salmon",    img: portraitSockeyeSalmonImg,   latin: "Oncorhynchus nerka" },
  { name: "Dolly Varden",      img: portraitDollyVardenImg,     latin: "Salvelinus malma" },
  { name: "Giant Trevally",    img: portraitGiantTrevallyImg,   latin: "Caranx ignobilis" },
  { name: "Bluefin Trevally",  img: portraitBluefinTrevallyImg, latin: "Caranx melampygus" },
  { name: "Mahi-Mahi",         img: portraitMahiMahiImg,        latin: "Coryphaena hippurus" },
  { name: "Yellowfin Tuna",    img: portraitYellowfinTunaImg,   latin: "Thunnus albacares" },
  { name: "Searun Cutthroat",  img: portraitSearunCutthroatImg, latin: "Oncorhynchus clarkii" },
];

// Insect → primary target species for FW hover card portrait
const insectTargetSpecies: Record<string, string> = {
  // BWO variants
  "Blue-Winged Olive": "Brown Trout", "Blue-Winged Olive (Early)": "Brown Trout",
  "Blue-Winged Olive (Fall)": "Brown Trout", "Blue-Winged Olive (Late Fall)": "Brown Trout",
  "Blue-Winged Olive (October)": "Brown Trout", "BWO": "Brown Trout",
  // PMD variants
  "Pale Morning Dun": "Rainbow Trout", "PMD": "Rainbow Trout",
  "Pale Morning Dun (Summer)": "Rainbow Trout",
  // Salmonfly
  "Salmonfly": "Rainbow Trout", "Salmon Fly": "Rainbow Trout",
  // Caddis
  "Caddis": "Brown Trout", "Fall Caddis": "Brown Trout",
  // Stoneflies
  "Golden Stonefly": "Rainbow Trout",
  "Skwala Stonefly": "Rainbow Trout", "Skwala": "Rainbow Trout",
  "Early Black Stonefly": "Brown Trout",
  // Mayflies
  "Hendrickson": "Brown Trout",
  "Green Drake": "Brown Trout",
  "Trico": "Brown Trout", "Tricos": "Brown Trout",
  "Sulphur": "Brown Trout", "Sulphur (Late Season)": "Brown Trout",
  "March Brown": "Brown Trout",
  "Light Cahill": "Brown Trout",
  "Hex Hatch": "Brown Trout",
  // Midges
  "Midge": "Rainbow Trout", "Midge Cluster": "Rainbow Trout", "Midges": "Rainbow Trout",
  "Midges (Late Winter)": "Rainbow Trout", "Midges/Early BWO": "Rainbow Trout",
  "Midges/Early Spring Prep": "Rainbow Trout", "Midges/Early Spring Signs": "Rainbow Trout",
  "Midges/Streamers": "Rainbow Trout",
  // Hoppers
  "Hopper": "Cutthroat Trout", "Grasshopper": "Cutthroat Trout",
  "Hopper Season": "Cutthroat Trout", "Hoppers/Terrestrials": "Cutthroat Trout",
  "Terrestrials, Grasshoppers": "Cutthroat Trout",
  // Ants
  "Flying Ants": "Brown Trout", "Terrestrials, Ants & Beetles": "Brown Trout",
  "Terrestrials": "Brown Trout",
  // Mother's Day Caddis
  "Mother's Day Caddis": "Rainbow Trout",
  // Streamers
  "Streamer Season": "Brown Trout", "Streamers": "Brown Trout",
  // Texas Hill Country — warm-water species
  "Terrestrials / Caddis": "Guadalupe Bass",
  "Warm-Water Poppers": "Guadalupe Bass",
  "Bass Poppers": "Guadalupe Bass",
  "Guadalupe Bass": "Guadalupe Bass",
};

// Combined portrait lookup map for any species name → image
const allFishPortraits: Record<string, string> = {
  ...Object.fromEntries(FW_PORTRAITS.map(p => [p.name, p.img])),
  ...Object.fromEntries(SW_PORTRAITS.map(p => [p.name, p.img])),
  // aliases
  "Atlantic Tarpon": portraitTarponImg,
  "Tarpon (seasonal)": portraitTarponImg,
  "Speckled Trout": portraitSpottedSeatroutImg,
  "Red Drum": portraitRedDrumImg,
  "Redfish": portraitRedDrumImg,
  "Southern Flounder": portraitFlounderImg,
  "Common Snook": portraitSnookImg,
  "Cutthroat": portraitCutthroatTroutImg,
  "Westslope Cutthroat": portraitCutthroatTroutImg,
  // additional SW species from data
  "Halibut": portraitPacificHalibutImg,
  "Pacific Striped Bass": portraitStripedBassImg,
  "Little Tunny": portraitFalseAlbacoreImg,
  "Atlantic Bonito": portraitBonitoImg,
  "Bluefin Trevally (ulua)": portraitBluefinTrevallyImg,
  "Mahi-Mahi (offshore)": portraitMahiMahiImg,
  "Yellowfin Tuna (offshore)": portraitYellowfinTunaImg,
  "Cutthroat Trout (searun)": portraitSearunCutthroatImg,
  "Salmon (seasonal)": portraitCohoSalmonImg,
  "King Salmon": portraitChinookSalmonImg,
  "Golden Trout": portraitApacheTroutImg,
  "Lahontan Cutthroat Trout": portraitCutthroatTroutImg,
  "Landlocked Striped Bass": portraitStripedBassImg,
  "Rainbow Trout (Steelhead)": portraitSteelheadImg,
  "Rainbow Trout (stocked)": portraitRainbowTroutImg,
  "Rainbow Trout (stocked winter)": portraitRainbowTroutImg,
  "Steelhead (Lake Michigan tribs)": portraitSteelheadImg,
  "Atlantic Salmon (limited)": portraitCohoSalmonImg,
  "Atlantic Salmon (stocked)": portraitCohoSalmonImg,
};

// ─── Insect engraving illustrations ─────────────────────────────────────────
import bwoImg from "@assets/insects/bwo.png";
import pmdImg from "@assets/insects/pmd.png";
import salmonFlyImg from "@assets/insects/salmonfly.png";
import caddisImg from "@assets/insects/caddis.png";
import goldenStoneflyImg from "@assets/insects/golden_stonefly.png";
import hendricksonImg from "@assets/insects/hendrickson.png";
import greenDrakeImg from "@assets/insects/green_drake.png";
import hopperImg from "@assets/insects/hopper.png";
import tricoImg from "@assets/insects/trico.png";
import midgeImg from "@assets/insects/midge.png";
import sulphurImg from "@assets/insects/sulphur.png";
import marchBrownImg from "@assets/insects/march_brown.png";
import lightCahillImg from "@assets/insects/light_cahill.png";
import hexHatchImg from "@assets/insects/hex_hatch.png";
import flyingAntsImg from "@assets/insects/flying_ants.png";
import skwalaStoneflyImg from "@assets/insects/skwala_stonefly.png";
import earlyBlackStoneflyImg from "@assets/insects/early_black_stonefly.png";
import mothersDayCaddisImg from "@assets/insects/mothers_day_caddis.png";

// ── Hatch Series Plates ─────────────────────────────────────────────────────
import hatchPlate01MidgeImg from "@assets/hatch_plates/hatch_plate_01_midge.jpeg";
import hatchPlate02BwoImg from "@assets/hatch_plates/hatch_plate_02_blue_winged_olive.jpeg";
import hatchPlate03EarlyBlackImg from "@assets/hatch_plates/hatch_plate_03_early_black_stonefly.jpeg";
import hatchPlate04SkwalaImg from "@assets/hatch_plates/hatch_plate_04_skwala_stonefly.jpeg";
import hatchPlate05HendricksonImg from "@assets/hatch_plates/hatch_plate_05_hendrickson.jpeg";
import hatchPlate06GreenDrakeImg from "@assets/hatch_plates/hatch_plate_06_green_drake.jpeg";
import hatchPlate07ParachuteAdamsImg from "@assets/hatch_plates/hatch_plate_07_parachute_adams.jpeg";
import hatchPlate08GreenDrakeAltImg from "@assets/hatch_plates/hatch_plate_08_green_drake_alt.jpeg";
import hatchPlate09YellowSallyImg from "@assets/hatch_plates/hatch_plate_09_yellow_sally_stonefly.jpeg";
import hatchPlate10CraneFlyImg from "@assets/hatch_plates/hatch_plate_10_crane_fly.jpeg";
import hatchPlate11BrownStoneflyImg from "@assets/hatch_plates/hatch_plate_11_brown_stonefly.jpeg";
import hatchPlate12BlackStoneflyImg from "@assets/hatch_plates/hatch_plate_12_black_stonefly.jpeg";
import hatchPlate13SulphurImg from "@assets/hatch_plates/hatch_plate_13_sulphur_mayfly.jpeg";
import hatchPlate14CaddisflyImg from "@assets/hatch_plates/hatch_plate_14_caddisfly.jpeg";
import hatchPlate15CaddisflyAltImg from "@assets/hatch_plates/hatch_plate_15_caddisfly_alt.jpeg";
import hatchPlate16CaddisflyAlt2Img from "@assets/hatch_plates/hatch_plate_16_caddisfly_alt2.jpeg";

// Map EVERY insect name in the data to its hatch plate illustration.
// Sorted by plate number so accordion can use PLATE_ORDER for display order.
const hatchPlateImages: Record<string, string> = {
  // Plate 01 — Midge
  "Midge": hatchPlate01MidgeImg,
  "Midges": hatchPlate01MidgeImg,
  "Midges (Late Winter)": hatchPlate01MidgeImg,
  "Midges/Streamers": hatchPlate01MidgeImg,
  "Midges/Early BWO": hatchPlate01MidgeImg,
  "Midges/Early Spring Prep": hatchPlate01MidgeImg,
  "Midges/Early Spring Signs": hatchPlate01MidgeImg,
  "Midge Cluster": hatchPlate01MidgeImg,
  "Trico": hatchPlate01MidgeImg,
  "Tricos": hatchPlate01MidgeImg,
  // Plate 02 — Blue-Winged Olive
  "Blue-Winged Olive": hatchPlate02BwoImg,
  "Blue-Winged Olive (Early)": hatchPlate02BwoImg,
  "Blue-Winged Olive (Spring)": hatchPlate02BwoImg,
  "Blue-Winged Olive (Fall)": hatchPlate02BwoImg,
  "Blue-Winged Olive (Late Fall)": hatchPlate02BwoImg,
  "Blue-Winged Olive (October)": hatchPlate02BwoImg,
  "BWO": hatchPlate02BwoImg,
  // Plate 03 — Early Black Stonefly
  "Early Black Stonefly": hatchPlate03EarlyBlackImg,
  "Early Black Stone": hatchPlate03EarlyBlackImg,
  // Plate 04 — Skwala Stonefly
  "Skwala Stonefly": hatchPlate04SkwalaImg,
  "Skwala": hatchPlate04SkwalaImg,
  // Plate 05 — Hendrickson (also covers similar spring mayflies)
  "Hendrickson": hatchPlate05HendricksonImg,
  "March Brown": hatchPlate05HendricksonImg,
  "Light Cahill": hatchPlate05HendricksonImg,
  // Plate 06 — Green Drake
  "Green Drake": hatchPlate06GreenDrakeImg,
  "Green Drake (Evening)": hatchPlate06GreenDrakeImg,
  "Hex Hatch": hatchPlate06GreenDrakeImg,
  // Plate 07 — Parachute Adams
  "Parachute Adams": hatchPlate07ParachuteAdamsImg,
  "Adams": hatchPlate07ParachuteAdamsImg,
  // Plate 08 — Green Drake Alt (PMD / Pale Morning Dun — similar upwing mayfly)
  "PMD": hatchPlate08GreenDrakeAltImg,
  "Pale Morning Dun": hatchPlate08GreenDrakeAltImg,
  "Pale Morning Dun (Summer)": hatchPlate08GreenDrakeAltImg,
  // Plate 09 — Yellow Sally Stonefly
  "Golden Stonefly": hatchPlate09YellowSallyImg,
  "Yellow Sally": hatchPlate09YellowSallyImg,
  "Golden Stone": hatchPlate09YellowSallyImg,
  // Plate 10 — Crane Fly (covers terrestrials / hoppers)
  "Crane Fly": hatchPlate10CraneFlyImg,
  "Terrestrials": hatchPlate10CraneFlyImg,
  "Terrestrials, Grasshoppers": hatchPlate10CraneFlyImg,
  "Terrestrials, Ants & Beetles": hatchPlate10CraneFlyImg,
  "Flying Ants": hatchPlate10CraneFlyImg,
  "Hoppers/Terrestrials": hatchPlate10CraneFlyImg,
  "Hopper Season": hatchPlate10CraneFlyImg,
  // Plate 11 — Brown Stonefly (also Salmonfly — large stonefly family)
  "Brown Stonefly": hatchPlate11BrownStoneflyImg,
  "Salmonfly": hatchPlate11BrownStoneflyImg,
  "Salmon Fly": hatchPlate11BrownStoneflyImg,
  // Plate 12 — Black Stonefly
  "Black Stonefly": hatchPlate12BlackStoneflyImg,
  // Plate 13 — Sulphur Mayfly
  "Sulphur": hatchPlate13SulphurImg,
  "Sulphur (Late Season)": hatchPlate13SulphurImg,
  "Sulphur Mayfly": hatchPlate13SulphurImg,
  // Plate 14 — Caddisfly A
  "Caddis": hatchPlate14CaddisflyImg,
  "Fall Caddis": hatchPlate14CaddisflyImg,
  "Caddis (Brachycentrus)": hatchPlate14CaddisflyImg,
  "Caddis (Evening)": hatchPlate14CaddisflyImg,
  "Terrestrials / Caddis": hatchPlate14CaddisflyImg,
  "Terrestrials / Caddis (Fall)": hatchPlate14CaddisflyImg,
  // Plate 15 — Caddisfly B
  "Mother's Day Caddis": hatchPlate15CaddisflyAltImg,
  // Plate 16 — Caddisfly C (alternate caddis)
  "Streamer Season": hatchPlate16CaddisflyAlt2Img,
};

// Plate order for sorting accordion insects by plate number (seasonal order)
const PLATE_ORDER: string[] = [
  "Midge", "Midges", "Midges (Late Winter)", "Midges/Streamers", "Midges/Early BWO",
  "Midges/Early Spring Prep", "Midges/Early Spring Signs", "Midge Cluster", "Trico", "Tricos",
  "Blue-Winged Olive", "Blue-Winged Olive (Early)", "Blue-Winged Olive (Spring)",
  "Blue-Winged Olive (Fall)", "Blue-Winged Olive (Late Fall)", "Blue-Winged Olive (October)", "BWO",
  "Early Black Stonefly", "Early Black Stone",
  "Skwala Stonefly", "Skwala",
  "Hendrickson", "March Brown", "Light Cahill",
  "Green Drake", "Green Drake (Evening)", "Hex Hatch",
  "Parachute Adams", "Adams",
  "PMD", "Pale Morning Dun", "Pale Morning Dun (Summer)",
  "Golden Stonefly", "Yellow Sally", "Golden Stone",
  "Crane Fly", "Terrestrials", "Terrestrials, Grasshoppers", "Terrestrials, Ants & Beetles",
  "Flying Ants", "Hoppers/Terrestrials", "Hopper Season",
  "Salmonfly", "Salmon Fly", "Brown Stonefly",
  "Black Stonefly",
  "Sulphur", "Sulphur (Late Season)", "Sulphur Mayfly",
  "Caddis", "Fall Caddis", "Caddis (Brachycentrus)", "Caddis (Evening)",
  "Terrestrials / Caddis", "Terrestrials / Caddis (Fall)",
  "Mother's Day Caddis",
  "Streamer Season",
];

const insectImages: Record<string, string> = {
  // BWO variants
  "Blue-Winged Olive": bwoImg, "Blue-Winged Olive (Early)": bwoImg,
  "Blue-Winged Olive (Fall)": bwoImg, "Blue-Winged Olive (Late Fall)": bwoImg,
  "Blue-Winged Olive (October)": bwoImg, "BWO": bwoImg,
  // PMD variants
  "Pale Morning Dun": pmdImg, "PMD": pmdImg, "Pale Morning Dun (Summer)": pmdImg,
  // Salmonfly
  "Salmonfly": salmonFlyImg, "Salmon Fly": salmonFlyImg,
  // Caddis
  "Caddis": caddisImg, "Fall Caddis": caddisImg,
  // Stoneflies
  "Golden Stonefly": goldenStoneflyImg,
  "Skwala Stonefly": skwalaStoneflyImg, "Skwala": skwalaStoneflyImg,
  "Early Black Stonefly": earlyBlackStoneflyImg,
  // Mayflies
  "Hendrickson": hendricksonImg,
  "Green Drake": greenDrakeImg,
  "Trico": tricoImg, "Tricos": tricoImg,
  "Sulphur": sulphurImg, "Sulphur (Late Season)": sulphurImg,
  "March Brown": marchBrownImg,
  "Light Cahill": lightCahillImg,
  "Hex Hatch": hexHatchImg,
  // Midges
  "Midge": midgeImg, "Midge Cluster": midgeImg, "Midges": midgeImg,
  "Midges (Late Winter)": midgeImg, "Midges/Early BWO": midgeImg,
  "Midges/Early Spring Prep": midgeImg, "Midges/Early Spring Signs": midgeImg,
  "Midges/Streamers": midgeImg,
  // Hoppers / Terrestrials
  "Hopper": hopperImg, "Grasshopper": hopperImg, "Hopper Season": hopperImg,
  "Hoppers/Terrestrials": hopperImg, "Terrestrials, Grasshoppers": hopperImg,
  // Ants
  "Flying Ants": flyingAntsImg, "Terrestrials, Ants & Beetles": flyingAntsImg,
  "Terrestrials": flyingAntsImg,
  "Terrestrials / Caddis": hopperImg,
  "Terrestrials / Caddis (Fall)": hopperImg,
  // Mother's Day Caddis
  "Mother's Day Caddis": mothersDayCaddisImg,
  // Streamers
  "Streamer Season": fwWoollyBuggerImg, "Streamers": fwWoollyBuggerImg,
};

const regionKeys = Object.keys(regions);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const monthShort = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// ─── Freshwater confidence colours ──────────────────────────────────────────
function confidenceColor(level: ConfidenceLevel, active: boolean) {
  if (!active) return "bg-transparent";
  if (level === "high") return "bg-[#3a7d2e]";
  if (level === "medium") return "bg-[#A67A3A]";
  return "bg-[#8a8a8a]";
}

function confidenceDot(level: ConfidenceLevel) {
  if (level === "high") return "bg-[#3a7d2e]";
  if (level === "medium") return "bg-[#A67A3A]";
  return "bg-[#8a8a8a]";
}

// ─── Saltwater confidence colours ────────────────────────────────────────────
function swConfidenceColor(level: ConfidenceLevel, active: boolean) {
  if (!active) return "bg-transparent";
  if (level === "high") return "bg-[#3080A8]";
  if (level === "medium") return "bg-[#6b9db8]";
  return "bg-[#c0d0dc]";
}

function swConfidenceDot(level: ConfidenceLevel) {
  if (level === "high") return "bg-[#3080A8]";
  if (level === "medium") return "bg-[#6b9db8]";
  return "bg-[#c0d0dc]";
}

// ─── Water-mode pill toggle (matches Finder.tsx design) ──────────────────────
function WaterModeToggle({
  mode,
  onChange,
}: {
  mode: "fresh" | "salt";
  onChange: (m: "fresh" | "salt") => void;
}) {
  return (
    <div
      className="inline-flex rounded-sm p-0.5"
      style={{ backgroundColor: "rgba(0,0,0,0.05)", border: "1px solid rgba(167,122,58,0.2)" }}
      role="group"
      aria-label="Water type"
    >
      {(["fresh", "salt"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-sm font-['Inter'] uppercase tracking-wider transition-all duration-200 min-h-[36px]"
            style={
              active
                ? {
                    backgroundColor: m === "fresh" ? "#A67A3A" : "#DDE4EC",
                    color: "#2F2B1E",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }
                : { color: "#7A7974" }
            }
            data-testid={`toggle-water-${m}-hatch`}
          >
            {m === "fresh" ? <Leaf size={12} /> : <Waves size={12} />}
            {m === "fresh" ? "Freshwater" : "Saltwater"}
          </button>
        );
      })}
    </div>
  );
}

export default function HatchChart() {
  const { waterMode, setWaterMode } = useWaterMode();
  const { track } = useTrack();

  // Track page view on mount
  useEffect(() => {
    track('page_view', { page: 'hatch_chart' });
  }, []);

  // ── Freshwater state ───────────────────────────────────────────────────────
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState<string>(regionKeys[0]);
  const [hoveredCell, setHoveredCell] = useState<{ insect: string; month: number } | null>(null);
  const [entomologyOpen, setEntomologyOpen] = useState<string | null>(null);

  // ── Saltwater state ────────────────────────────────────────────────────────
  const [selectedSWRegion, setSelectedSWRegion] = useState<string>(swRegionKeys[0]);
  const [hoveredSWCell, setHoveredSWCell] = useState<{ species: string; month: number } | null>(null);
  const [speciesNotesOpen, setSpeciesNotesOpen] = useState<string | null>(null);
  const [expandedPortrait, setExpandedPortrait] = useState<string | null>(null);

  // ── Live conditions (Tier 1) ───────────────────────────────────────────────
  const [liveRiver, setLiveRiver] = useState<any>(null);
  const [liveTides, setLiveTides] = useState<any>(null);
  const [liveCondLoading, setLiveCondLoading] = useState(false);

  // Auto-fetch when a cell is hovered — GPS optional, fall back to region default coords
  const regionCoords: Record<string, { lat: number; lon: number; tideStation: string }> = {
    "Rocky Mountain":    { lat: 44.4, lon: -110.6, tideStation: "9447130" },
    "Pacific Northwest": { lat: 47.5, lon: -121.5, tideStation: "9447130" },
    "Northeast":         { lat: 44.5, lon: -71.5,  tideStation: "8410140" },
    "Southeast":         { lat: 35.5, lon: -83.0,  tideStation: "8656483" },
    "Midwest":           { lat: 43.0, lon: -89.5,  tideStation: "8518750" },
    "Southwest":         { lat: 36.5, lon: -112.0, tideStation: "9414290" },
  };
  const swRegionCoords: Record<string, { lat: number; lon: number; tideStation: string }> = {
    "Gulf Coast":    { lat: 29.7, lon: -95.3,  tideStation: "8771450" },
    "Atlantic":      { lat: 32.0, lon: -80.9,  tideStation: "8656483" },
    "Pacific":       { lat: 37.8, lon: -122.4, tideStation: "9414290" },
    "Florida Keys":  { lat: 24.7, lon: -81.1,  tideStation: "8723214" },
  };

  const fetchLiveConditions = useCallback(async () => {
    setLiveCondLoading(true);
    try {
      if (waterMode === "fresh") {
        const rc = regionCoords[selectedRegion] ?? { lat: 44.4, lon: -110.6, tideStation: "9447130" };
        const r = await fetch(`/api/conditions/river?lat=${rc.lat}&lon=${rc.lon}`).then(x => x.json()).catch(() => null);
        setLiveRiver(r);
      } else {
        const sc = swRegionCoords[selectedSWRegion] ?? { lat: 29.7, lon: -95.3, tideStation: "8771450" };
        const t = await fetch(`/api/conditions/tides?station=${sc.tideStation}`).then(x => x.json()).catch(() => null);
        setLiveTides(t);
      }
    } finally {
      setLiveCondLoading(false);
    }
  }, [waterMode, selectedRegion, selectedSWRegion]);

  useEffect(() => {
    fetchLiveConditions();
  }, [fetchLiveConditions]);

  // ── Freshwater data build ──────────────────────────────────────────────────
  const region = regions[selectedRegion];
  const insectMap: Map<string, { months: Record<number, { confidence: ConfidenceLevel; flies: string[]; hatch: HatchEvent }> }> = new Map();
  for (const [mStr, hatches] of Object.entries(region.hatches)) {
    const m = Number(mStr);
    for (const hatch of hatches) {
      if (!insectMap.has(hatch.insect)) insectMap.set(hatch.insect, { months: {} });
      insectMap.get(hatch.insect)!.months[m] = { confidence: hatch.confidence, flies: hatch.flies, hatch };
    }
  }
  // Sort insects by plate order (seasonal/taxonomic), unknowns go last
  const insects = Array.from(insectMap.entries()).sort(([a], [b]) => {
    const ai = PLATE_ORDER.indexOf(a);
    const bi = PLATE_ORDER.indexOf(b);
    const an = ai === -1 ? 999 : ai;
    const bn = bi === -1 ? 999 : bi;
    return an - bn;
  });
  const hoveredHatch: HatchEvent | null = hoveredCell
    ? (region.hatches[hoveredCell.month]?.find((h) => h.insect === hoveredCell.insect) ?? null)
    : null;

  // ── Saltwater data build, species × month grid ────────────────────────────
  const swRegion = swRegions[selectedSWRegion];
  const swSpeciesMap: Map<string, {
    commonName: string;
    months: Record<number, TidalEvent>;
  }> = new Map();

  for (const [mStr, events] of Object.entries(swRegion.tides)) {
    const m = Number(mStr);
    for (const ev of events) {
      if (!swSpeciesMap.has(ev.species)) {
        swSpeciesMap.set(ev.species, { commonName: ev.commonName, months: {} });
      }
      // Keep highest-confidence entry per species/month
      const existing = swSpeciesMap.get(ev.species)!.months[m];
      const priority: Record<ConfidenceLevel, number> = { high: 3, medium: 2, low: 1 };
      if (!existing || priority[ev.confidence] > priority[existing.confidence]) {
        swSpeciesMap.get(ev.species)!.months[m] = ev;
      }
    }
  }
  const swSpeciesList = Array.from(swSpeciesMap.entries());

  const hoveredSWEvent: TidalEvent | null = hoveredSWCell
    ? (swRegion.tides[hoveredSWCell.month]?.find((e) => e.species === hoveredSWCell.species) ?? null)
    : null;

  // ── Nav background based on mode ──────────────────────────────────────────
  const navBg = waterMode === "salt" ? "#EEF2F4" : "#EFE8D7";
  const pageBg = waterMode === "salt" ? "#EEF2F4" : "#EFE8D7";
  const cardBg = waterMode === "salt" ? "#DDE4EC" : "#E4E7D8";
  const accentColor = waterMode === "salt" ? "#3D6B83" : "rgba(167,122,58,0.7)";
  const borderColor = waterMode === "salt" ? "rgba(61,107,131,0.25)" : "rgba(167,122,58,0.15)";
  const borderColorMed = waterMode === "salt" ? "rgba(61,107,131,0.2)" : "rgba(167,122,58,0.2)";

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden" style={{ backgroundColor: pageBg }}>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40"
        style={{ backgroundColor: "#0D1B33", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      >
        {/* ── Logo row ── */}
        <div className="flex justify-center px-4 pt-3 pb-1">
          <Link href="/"><img src={logoImg} alt="Flydentify" className="w-auto h-auto block" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", cursor: "pointer" }}/></Link>
        </div>
        {/* ── Nav row ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-2.5">
          <Link href="/">
            <button data-testid="button-nav-home-hatch" className="flex items-center gap-1 font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70 min-h-[36px]" style={{ color: "rgba(245,230,204,0.55)" }}>
              <ChevronLeft size={12}/><span>Home</span>
            </button>
          </Link>
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link href="/finder"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Finder</button></Link>
            <Link href="/rigging"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Rigging</button></Link>
            <Link href="/conditions"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Conditions</button></Link>
            <Link href="/pricing"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "#A67A3A" }}>Subscribe</button></Link>
          </div>
          <button className="md:hidden flex items-center justify-center w-10 h-10" onClick={() => setMobileNavOpen(v => !v)} style={{ color: "rgba(245,230,204,0.8)" }} aria-label="Menu">
            {mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen nav ── */}
      {mobileNavOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[9998] flex flex-col"
          style={{ backgroundColor: "#0D1B33" }}
        >
          {/* Close button top-right */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={logoImg} alt="Flydentify" className="w-auto max-w-[160px] h-auto block mx-auto" style={{ filter: "brightness(0) invert(1)" }} />
            <button onClick={() => setMobileNavOpen(false)} className="w-11 h-11 flex items-center justify-center" style={{ color: "rgba(245,230,204,0.6)" }}>
              <X size={22} />
            </button>
          </div>
          {/* Links */}
          <div className="flex flex-col px-6 pt-6 flex-1">
            {[
              { label: "Fly Finder", href: "/finder" },
              { label: "Hatch chart", href: "/hatch-chart" },
              { label: "Rigging", href: "/rigging" },
              { label: "Conditions", href: "/conditions" },
              { label: "Catch reports", href: "/reports" },
              { label: "My trips", href: "/trips" },
              { label: "Pricing", href: "/pricing" },
            ].map(link => (
              <Link key={link.label} href={link.href}>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-left py-5 font-['Cormorant_Garamond'] italic text-2xl border-b"
                  style={{ color: "#F7F1E2", borderColor: "rgba(255,255,255,0.07)" }}
                >
                  {link.label}
                </button>
              </Link>
            ))}
          </div>
          {/* Tagline bottom */}
          <p className="px-6 pb-8 font-['Cinzel'] text-[13px] uppercase tracking-[0.25em]" style={{ color: "rgba(245,230,204,0.2)" }}>
            Tell them Flydentify hooked you up.
          </p>
        </div>
      )}

      {/* ── Video hero ── */}
      <section className="relative overflow-hidden" style={{ height: "70vh", minHeight: 440 }}>
        <video
          key={waterMode === "salt" ? "hatch-sw" : "hatch-fw"}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.78) saturate(1.1)" }}
        >
          <source src={waterMode === "salt" ? hatchEmergenceSwVid : hatchEmergenceVid} type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.52) 50%, rgba(0,0,0,0.72) 100%)" }} />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-10">
          <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="font-['Inter'] italic text-[13px] uppercase tracking-[0.28em] mb-3" style={{ color: accentColor }}>
                {waterMode === "salt" ? "Tidal Bite Calendar, Flydentify" : "Annual Hatch Calendar, Flydentify"}
              </p>
              <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl mb-3 leading-tight" style={{ color: "#F7F1E2", fontWeight: 300, fontStyle: "italic" }}>
                {waterMode === "salt" ? "When the fish bite." : "When the insects hatch."}
              </h1>
              <p className="font-['Inter'] max-w-lg leading-relaxed text-sm" style={{ color: "rgba(245,230,204,0.75)" }}>
                {waterMode === "salt"
                  ? "Every coastal fishery runs on tidal rhythms. This calendar maps the best bite windows month-by-month across 5 saltwater regions."
                  : "Every trout stream has a seasonal calendar. This chart maps what's hatching month-by-month across 8 regions."}
              </p>
            </div>
            <WaterModeToggle mode={waterMode} onChange={(m) => { setWaterMode(m); track('water_mode_change', { new_mode: m }); }} />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* ── Region selector ──────────────────────────────────────────────── */}
        <div className="mb-8 max-w-sm">
          <label
            className="block font-['Cinzel'] text-sm font-medium uppercase tracking-widest mb-3"
            htmlFor="region-hatch"
            style={{ color: "#2F2B1E" }}
          >
            Region
          </label>
          {waterMode === "fresh" ? (
            <>
              <div className="relative">
                <select
                  id="region-hatch"
                  data-testid="select-region-hatch-fresh"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm px-5 py-3 rounded-sm font-['Inter'] text-sm focus:outline-none appearance-none"
                  style={{ color: "#2F2B1E" }}
                >
                  {regionKeys.map((key) => (
                    <option key={key} value={key}>{regions[key].name}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-sm font-['Inter'] italic" style={{ color: "#2F2B1E" }}>
                {region.rivers.join(" · ")}
              </p>
            </>
          ) : (
            <>
              <div className="relative">
                <select
                  id="region-hatch"
                  data-testid="select-region-hatch-salt"
                  value={selectedSWRegion}
                  onChange={(e) => setSelectedSWRegion(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm px-5 py-3 rounded-sm font-['Inter'] text-sm focus:outline-none appearance-none"
                  style={{ color: "#2F2B1E" }}
                >
                  {swRegionKeys.map((key) => (
                    <option key={key} value={key}>{swRegions[key].name}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-sm font-['Inter'] italic" style={{ color: "#2F2B1E" }}>
                {swRegion.destinations.join(" · ")}
              </p>
            </>
          )}
        </div>

        {/* ── Legend ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-5 mb-6 text-sm font-['Inter']" style={{ color: "#2F2B1E" }}>
          {waterMode === "fresh"
            ? [
                { label: "High confidence", bg: "#3a7d2e" },
                { label: "Moderate", bg: "#A67A3A" },
                { label: "Low / sporadic", bg: "#8a8a8a" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: item.bg }} />
                  {item.label}
                </div>
              ))
            : [
                { label: "Prime bite window", bg: "#3D6B83" },
                { label: "Good opportunity", bg: "#7aabb5" },
                { label: "Low / weather dependent", bg: "#c0d0dc" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: item.bg }} />
                  {item.label}
                </div>
              ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            FRESHWATER: Annual Hatch Chart
        ════════════════════════════════════════════════════════════════ */}
        {waterMode === "fresh" && (
          <>
            {/* ── FW Fish Portrait Strip — clickable, expands species notes ── */}
            <div className="mb-10 space-y-3">
              <div className="flex flex-col gap-3">
                {FW_PORTRAITS.filter(p => (p.regions as string[]).includes("*") || (p.regions as string[]).includes(selectedRegion)).map(p => {
                  const isOpen = expandedPortrait === p.name;
                  return (
                    <button
                      key={p.name}
                      className="w-full text-left focus:outline-none rounded-sm overflow-hidden transition-all"
                      style={{ border: `2px solid ${isOpen ? "#A67A3A" : "rgba(167,122,58,0.2)"}`, backgroundColor: "#060D1A", display: "flex", alignItems: "stretch" }}
                      onClick={() => setExpandedPortrait(isOpen ? null : p.name)}
                      aria-expanded={isOpen}
                    >
                      <div style={{ width: 120, flexShrink: 0, position: "relative", minHeight: 80, backgroundColor: "#0a0f18" }}>
                        <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8, opacity: 0.95 }} />
                      </div>
                      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <p className="font-['Cormorant_Garamond'] italic font-semibold leading-tight mb-0.5" style={{ fontSize: 17, color: "#F7F1E2" }}>{p.name}</p>
                        <p className="font-['Inter'] text-xs italic" style={{ color: "rgba(245,230,204,0.45)" }}>{p.latin}</p>
                      </div>
                      <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: isOpen ? "#A67A3A" : "rgba(245,230,204,0.4)", fontSize: 11 }}>
                        {isOpen ? "▲" : "▼"}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Expanded species notes panel */}
              {expandedPortrait && FW_PORTRAITS.find(p => p.name === expandedPortrait) && (() => {
                const portrait = FW_PORTRAITS.find(p => p.name === expandedPortrait)!;
                // Find matching region hatch data for this species
                const speciesHatches = Object.values(region.hatches).flat().filter(h =>
                  (insectTargetSpecies[h.insect] === portrait.name) || h.insect.includes(portrait.name.split(" ")[0])
                );
                const bestHatch = speciesHatches.sort((a, b) =>
                  (a.confidence === "high" ? 3 : a.confidence === "medium" ? 2 : 1) -
                  (b.confidence === "high" ? 3 : b.confidence === "medium" ? 2 : 1)
                ).reverse()[0];
                return (
                  <div className="rounded-sm p-6" style={{ backgroundColor: "#FAF9F5", border: "1px solid rgba(160,118,58,0.25)", borderLeft: "3px solid #A0763A" }}>
                    <div className="flex gap-4 mb-4">
                      <img src={portrait.img} alt={portrait.name} className="rounded-sm object-contain flex-shrink-0" style={{ width: 120, height: 80, backgroundColor: "#060D1A" }} />
                      <div>
                        <h3 className="font-['Cormorant_Garamond'] italic text-lg font-semibold mb-0.5" style={{ color: "#2F2B1E" }}>{portrait.name}</h3>
                        <p className="font-['Inter'] text-sm italic mb-2" style={{ color: "#BAB9B4" }}>{portrait.latin}</p>
                        {bestHatch && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm px-2 py-0.5 rounded-sm font-['Inter'] uppercase tracking-wide" style={{ backgroundColor: "rgba(160,118,58,0.12)", color: "#2F2B1E" }}>Peak: {bestHatch.peakTime}</span>
                            <span className="text-sm px-2 py-0.5 rounded-sm font-['Inter'] uppercase tracking-wide" style={{ backgroundColor: "rgba(160,118,58,0.12)", color: "#2F2B1E" }}>{bestHatch.waterTemp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {bestHatch?.entomologyNote ? (
                      <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: "#2F2B1E" }}>{bestHatch.entomologyNote}</p>
                    ) : bestHatch?.description ? (
                      <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: "#2F2B1E" }}>{bestHatch.description}</p>
                    ) : (
                      <p className="font-['Inter'] text-sm italic" style={{ color: "#BAB9B4" }}>
                        Select a region above to see species notes for {portrait.name} on {region.rivers.slice(0,2).join(" and ")}.
                      </p>
                    )}
                    {bestHatch && (
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(160,118,58,0.15)" }}>
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-2" style={{ color: "#BAB9B4" }}>Top patterns</p>
                        <div className="flex flex-wrap gap-2">
                          {bestHatch.flies.map(fid => flies[fid] && (
                            <span key={fid} className="text-sm px-2.5 py-1 rounded-sm font-['Inter']" style={{ backgroundColor: "rgba(160,118,58,0.12)", border: "1px solid rgba(160,118,58,0.2)", color: "#2F2B1E" }}>
                              {flies[fid].name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Hatch Chart Table */}
            <p className="sm:hidden font-['Inter'] text-[13px] italic mb-2 text-right" style={{ color: "#2F2B1E" }}>Scroll right to see all months →</p>
            <div
              className="overflow-x-auto rounded-sm border shadow-sm mb-10"
              style={{ borderColor: "rgba(167,122,58,0.15)" }}
            >
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr style={{ backgroundColor: cardBg }}>
                    <th
                      className="text-left px-4 py-4 font-['Cinzel'] uppercase tracking-widest text-sm sticky left-0 z-20 w-44"
                      style={{ color: "#2F2B1E", backgroundColor: cardBg, borderBottom: "1px solid rgba(167,122,58,0.15)" }}
                    >
                      Insect / Hatch
                    </th>
                    {months.map((m) => (
                      <th
                        key={m}
                        className="px-2 py-4 font-['Cinzel'] uppercase tracking-widest text-sm font-normal text-center w-12"
                        style={{ color: "#2F2B1E", borderBottom: "1px solid rgba(167,122,58,0.15)" }}
                      >
                        {monthShort[m]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {insects.map(([insect, data], rowIdx) => {
                    const rowBg = rowIdx % 2 === 0 ? "#EFE8D7" : "#FAF9F5";
                    return (
                      <tr key={insect} style={{ backgroundColor: rowBg }}>
                        <td
                          className="px-3 py-4 font-['Cormorant_Garamond'] italic text-sm sticky left-0 z-10"
                          style={{ color: "#2F2B1E", borderBottom: "1px solid rgba(167,122,58,0.08)", backgroundColor: rowBg }}
                        >
                          <div className="flex items-center gap-2.5">
                            {insectImages[insect] && (
                              <img
                                src={insectImages[insect]}
                                alt={insect}
                                className="w-8 h-8 object-contain shrink-0"
                                style={{ filter: "sepia(0.6) opacity(0.65)" }}
                              />
                            )}
                            <span className="truncate">{insect}</span>
                          </div>
                        </td>
                        {months.map((m) => {
                          const cell = data.months[m];
                          const isHovered = hoveredCell?.insect === insect && hoveredCell?.month === m;
                          return (
                            <td
                              key={m}
                              className="px-1 py-4 text-center relative"
                              style={{ borderBottom: "1px solid rgba(167,122,58,0.08)" }}
                              onMouseEnter={() => cell && setHoveredCell({ insect, month: m })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {cell ? (
                                <span
                                  data-testid={`cell-hatch-${insect.replace(/\s+/g, '-')}-${m}`}
                                  className={`inline-block w-7 h-5 rounded-sm cursor-pointer transition-all duration-150 ${confidenceColor(cell.confidence, true)} ${isHovered ? "ring-2 ring-amber-500 ring-offset-1 scale-110" : "hover:scale-105"}`}
                                />
                              ) : (
                                <span className="inline-block w-7 h-5 rounded-sm" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Hover Tooltip Card, Freshwater */}
            {hoveredHatch && hoveredCell && (
              <div className="mb-10 rounded-sm p-6 max-w-2xl" style={{ backgroundColor: cardBg, border: "1px solid rgba(167,122,58,0.2)" }}>
                <div className="flex items-start gap-4 mb-3">
                  {/* Fish portrait thumbnail — matches SW tooltip treatment */}
                  {(() => {
                    const targetSpecies = insectTargetSpecies[hoveredCell.insect] ?? "Rainbow Trout";
                    const portraitImg = allFishPortraits[targetSpecies];
                    return portraitImg ? (
                      <div className="shrink-0 w-32 h-20 rounded-sm overflow-hidden" style={{ border: "1px solid rgba(167,122,58,0.2)" }}>
                        <img src={portraitImg} alt={targetSpecies} className="w-full h-full object-cover object-center" />
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-start gap-3 flex-1">
                    {insectImages[hoveredCell.insect] && (
                      <img
                        src={insectImages[hoveredCell.insect]}
                        alt={hoveredCell.insect}
                        className="w-10 h-10 object-contain shrink-0 mt-0.5"
                        style={{ filter: "sepia(0.4) opacity(0.75)" }}
                      />
                    )}
                    <span className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${confidenceDot(hoveredHatch.confidence)}`} />
                    <div>
                      <h3 className="font-['Cormorant_Garamond'] text-lg" style={{ color: "#2F2B1E" }}>{hoveredHatch.insect}</h3>
                      <p className="font-['Inter'] text-sm italic" style={{ color: "#7A7974" }}>
                        {hoveredHatch.latinName}, {monthNames[hoveredCell.month]}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="font-['Inter'] text-sm leading-relaxed mb-4" style={{ color: "#2F2B1E" }}>
                  {hoveredHatch.description}
                </p>
                {hoveredHatch.entomologyNote && (
                  <div className="mb-4 p-3 rounded-sm flex gap-2.5" style={{ backgroundColor: "rgba(120,80,20,0.15)", border: "1px solid rgba(167,122,58,0.2)" }}>
                    <Leaf size={13} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: "#2F2B1E" }}>
                      {hoveredHatch.entomologyNote}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Peak hatch", val: hoveredHatch.peakTime },
                    { label: "Water temp", val: hoveredHatch.waterTemp },
                    { label: "Duration", val: hoveredHatch.duration },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-sm px-2.5 py-2" style={{ backgroundColor: "rgba(120,80,20,0.12)", border: "1px solid rgba(160,118,58,0.15)" }}>
                      <p className="font-['Inter'] text-[13px] uppercase tracking-wide mb-0.5" style={{ color: "#2F2B1E" }}>{stat.label}</p>
                      <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug" style={{ color: "#2F2B1E" }}>{stat.val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-['Inter'] uppercase tracking-wide mb-2" style={{ color: "#7A7974" }}>Recommended Flies</p>
                  <div className="flex flex-wrap gap-2">
                    {hoveredHatch.flies.map((fid) => flies[fid] && (
                      <Link key={fid} href="/finder">
                        <span
                          className="text-sm px-2.5 py-1 rounded-sm cursor-pointer font-['Inter'] transition-colors"
                          style={{ backgroundColor: "rgba(120,80,20,0.25)", border: "1px solid rgba(167,122,58,0.25)", color: "#A67A3A" }}
                        >
                          {flies[fid].name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* ── Live USGS conditions strip (Tier 1) ─────────────────── */}
                {liveRiver && !liveRiver.error && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(167,122,58,0.15)" }}>
                    <a href="https://waterservices.usgs.gov" target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-[13px] uppercase tracking-widest mb-2 block hover:underline" style={{ color: "#2F2B1E" }}>Live stream conditions · USGS NWIS</a>
                    <div className="flex flex-wrap gap-3">
                      {liveRiver.flow_cfs != null && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(120,80,20,0.12)", border: "1px solid rgba(160,118,58,0.18)" }}>
                          <Droplets size={12} style={{ color: "#A67A3A" }} />
                          <span className="font-['Inter'] text-sm" style={{ color: "#2F2B1E" }}>{liveRiver.flow_cfs} cfs</span>
                          <span className="font-['Inter'] text-[13px]" style={{ color: "rgba(37,45,30,0.45)" }}>{liveRiver.wadeability}</span>
                        </div>
                      )}
                      {liveRiver.water_temp_f != null && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(120,80,20,0.12)", border: "1px solid rgba(160,118,58,0.18)" }}>
                          <Thermometer size={12} style={{ color: "#A67A3A" }} />
                          <span className="font-['Inter'] text-sm" style={{ color: "#2F2B1E" }}>{liveRiver.water_temp_f}°F</span>
                          <span className="font-['Inter'] text-[13px]" style={{ color: "rgba(37,45,30,0.45)" }}>{liveRiver.temp_advisory?.split(" — ")[0]}</span>
                        </div>
                      )}
                      {liveRiver.station_name && (
                        <span className="font-['Inter'] text-[13px] self-center" style={{ color: "rgba(37,45,30,0.35)" }}>{liveRiver.station_name}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Entomology Notes Section */}
            <section className="py-20">
              <p className="font-['Cinzel'] text-sm uppercase tracking-[0.25em] mb-3" style={{ color: "#A67A3A" }}>
                The science behind the rise
              </p>
              <h2 className="font-['Cormorant_Garamond'] italic text-3xl sm:text-4xl mb-2 pb-3 border-b" style={{ color: "#2F2B1E", borderColor: "rgba(167,122,58,0.2)" }}>
                Entomology Notes
              </h2>
              <p className="font-['Inter'] text-sm mb-5 italic" style={{ color: "#7A7974" }}>
                What triggers each hatch. The science behind the rise.
              </p>
              <div className="space-y-2">
                {insects.map(([insect, data]) => {
                  const hatchWithNote = Object.values(data.months).find(m => m.hatch.entomologyNote);
                  if (!hatchWithNote) return null;
                  const isOpen = entomologyOpen === insect;
                  return (
                    <div key={insect} className="rounded-sm" style={{ backgroundColor: cardBg, border: "1px solid rgba(167,122,58,0.15)" }}>
                      <button
                        className="w-full text-left px-5 py-3 flex items-center justify-between min-h-[44px]"
                        onClick={() => setEntomologyOpen(isOpen ? null : insect)}
                      >
                        <div className="flex items-center gap-3">
                          {hatchPlateImages[insect] ? (
                            <div className="shrink-0 w-14 h-14 rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(120,80,20,0.06)" }}>
                              <img src={hatchPlateImages[insect]} alt={insect} className="w-full h-full object-cover" />
                            </div>
                          ) : insectImages[insect] ? (
                            <img src={insectImages[insect]} alt={insect} className="w-14 h-14 object-contain shrink-0" style={{ filter: "sepia(0.2) opacity(0.92)" }} />
                          ) : (
                            <Leaf size={13} style={{ color: "rgba(167,122,58,0.7)" }} />
                          )}
                          <span className="font-['Cormorant_Garamond'] text-sm" style={{ color: "#2F2B1E" }}>{insect}</span>
                          <span className="font-['Inter'] text-sm italic" style={{ color: "#2F2B1E" }}>
                            {hatchWithNote.hatch.latinName}
                          </span>
                        </div>
                        <span className="text-sm" style={{ color: "rgba(167,122,58,0.7)" }}>{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: "rgba(167,122,58,0.1)" }}>
                          {/* Hatch plate lightbox — tap to zoom full screen */}
                          {hatchPlateImages[insect] ? (
                            <div className="mb-4 w-full rounded-sm overflow-hidden" style={{ border: "1px solid rgba(167,122,58,0.22)", backgroundColor: "rgba(240,236,224,0.6)" }}>
                              <HatchPlateLightbox
                                src={hatchPlateImages[insect]}
                                alt={`${insect} hatch plate`}
                                hatchName={insect}
                                thumbnailClass="w-full object-cover"
                                triggerStyle={{ display: "block" }}
                              />
                            </div>
                          ) : insectImages[insect] ? (
                            <div className="mb-4 w-full rounded-sm overflow-hidden flex items-center justify-center" style={{ height: 200, border: "1px solid rgba(167,122,58,0.22)", backgroundColor: "rgba(240,236,224,0.6)" }}>
                              <img src={insectImages[insect]} alt={insect} className="w-full h-full object-contain p-6" style={{ filter: "sepia(0.1) opacity(0.95)" }} />
                            </div>
                          ) : null}
                          <p className="font-['Inter'] text-sm italic leading-relaxed mb-3" style={{ color: "#2F2B1E" }}>
                            {hatchWithNote.hatch.entomologyNote}
                          </p>
                          <p className="font-['Inter'] text-sm mb-3" style={{ color: "#2F2B1E" }}>
                            <strong>Peak hatch:</strong> {hatchWithNote.hatch.peakTime} &nbsp;&middot;&nbsp;
                            <strong>Water temp:</strong> {hatchWithNote.hatch.waterTemp}
                          </p>
                          {/* Confidence / activity bar */}
                          {(() => {
                            const pct = hatchWithNote.hatch.confidence === "high" ? 90 : hatchWithNote.hatch.confidence === "medium" ? 60 : 30;
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1 rounded-sm overflow-hidden bg-stone-200">
                                  <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: "#A67A3A" }} />
                                </div>
                                <span className="font-['Cinzel'] text-[13px] uppercase tracking-widest shrink-0" style={{ color: "#A67A3A" }}>{pct}%</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* All Freshwater Patterns */}
            <section className="py-20">
              <p className="font-['Cinzel'] text-sm uppercase tracking-[0.25em] mb-3" style={{ color: "#A67A3A" }}>
                The complete fly box
              </p>
              <h2 className="font-['Cormorant_Garamond'] italic text-3xl sm:text-4xl mb-2 pb-3 border-b" style={{ color: "#2F2B1E", borderColor: "rgba(167,122,58,0.2)" }}>
                All Patterns
              </h2>
              <p className="font-['Inter'] text-sm mb-5 italic" style={{ color: "#7A7974" }}>
                The complete fly box. Every pattern in the Flydentify system.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(flies).map((fly) => (
                  <Link key={fly.id} href="/finder">
                    <div
                      data-testid={`card-all-fly-${fly.id}`}
                      className="rounded-sm cursor-pointer transition-all overflow-hidden group"
                      style={{ backgroundColor: cardBg, border: "1px solid rgba(167,122,58,0.15)" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,122,58,0.45)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,122,58,0.15)")}
                    >
                      {/* Fly photo */}
                      <div className="w-full overflow-hidden" style={{ aspectRatio:"4/3", backgroundColor: "#EBE7DB" }}>
                        {fwFlyImages[fly.id]
                          ? <img src={fwFlyImages[fly.id]} alt={fly.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" style={{ filter: "sepia(0.05) contrast(1.02)" }} />
                          : <div className="w-full h-full flex items-center justify-center">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(160,118,58,0.4)" strokeWidth="1.25"><path d="M3 12 C6 7 10 5 14 6 C18 7 21 9.5 22 12 C21 14.5 18 17 14 18 C10 19 6 17 3 12Z"/></svg>
                            </div>
                        }
                      </div>
                      {/* Label */}
                      <div className="px-3.5 py-3">
                        <h3 className="font-['Cormorant_Garamond'] text-sm leading-snug mb-0.5" style={{ color: "#2F2B1E" }}>{fly.name}</h3>
                        <p className="font-['Inter'] text-sm italic" style={{ color: "#2F2B1E" }}>{fly.imitates}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SALTWATER: Live Tide Chart
        ════════════════════════════════════════════════════════════════ */}
        {waterMode === "salt" && (
          <div className="mb-10">
            <TideChart
              station={selectedSWRegion === "gulf_coast_flats" ? "8771450" :
                       selectedSWRegion === "florida_keys" ? "8723214" :
                       selectedSWRegion === "striper_coast" ? "8467150" :
                       selectedSWRegion === "carolinas_mid_atlantic" ? "8651370" :
                       "8771450"}
              stationName={swRegion.name}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SALTWATER: Tidal Bite Calendar
        ════════════════════════════════════════════════════════════════ */}
        {waterMode === "salt" && (
          <>
            {swSpeciesList.length === 0 ? (
              <div className="rounded-sm p-10 text-center mb-10" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <Waves size={32} className="mx-auto mb-3" style={{ color: "rgba(61,107,131,0.4)" }} />
                <p className="font-['Inter'] text-sm italic" style={{ color: "#7A7974" }}>
                  No tidal data for this region yet. Select a different region.
                </p>
              </div>
            ) : (
              <>
                {/* Species calendar legend */}
                <div className="flex flex-wrap gap-5 mb-4 text-sm font-['Inter']" style={{ color: "#1A2A38" }}>
                  {[
                    { label: "Prime season", bg: "#3D6B83" },
                    { label: "Active", bg: "#6b9db8" },
                    { label: "Occasional", bg: "#c0d0dc" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: item.bg }} />
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* Tidal Bite Chart Table */}
                <p className="sm:hidden font-['Inter'] text-[13px] italic mb-2 text-right" style={{ color: "#2F2B1E" }}>Scroll right to see all months →</p>
                <div
                  className="overflow-x-auto rounded-sm border shadow-sm mb-10"
                  style={{ borderColor }}
                >
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: cardBg }}>
                        <th
                          className="text-left px-4 py-4 font-['Cinzel'] uppercase tracking-widest text-sm sticky left-0 z-20 w-44"
                          style={{ color: "#2F2B1E", backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}
                        >
                          Species
                        </th>
                        {months.map((m) => (
                          <th
                            key={m}
                            className="px-2 py-4 font-['Cinzel'] uppercase tracking-widest text-sm font-normal text-center w-12"
                            style={{ color: "#2F2B1E", borderBottom: `1px solid ${borderColor}` }}
                          >
                            {monthShort[m]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {swSpeciesList.map(([species, data], rowIdx) => {
                        const rowBg = rowIdx % 2 === 0 ? "#EEF2F4" : "#FAF9F5";
                        return (
                          <tr key={species} style={{ backgroundColor: rowBg }}>
                            <td
                              className="px-3 py-4 font-['Cormorant_Garamond'] italic text-sm sticky left-0 z-10"
                              style={{ color: "#2F2B1E", borderBottom: `1px solid rgba(61,107,131,0.1)`, backgroundColor: rowBg }}
                            >
                              <div className="flex items-center gap-2.5">
                                <Waves size={14} style={{ color: "rgba(61,107,131,0.5)", flexShrink: 0 }} />
                                <div>
                                  <div className="truncate">{species}</div>
                                  <div className="text-sm italic truncate" style={{ color: "#2F2B1E" }}>{data.commonName}</div>
                                </div>
                              </div>
                            </td>
                            {months.map((m) => {
                              const cell = data.months[m];
                              const isHovered = hoveredSWCell?.species === species && hoveredSWCell?.month === m;
                              return (
                                <td
                                  key={m}
                                  className="px-1 py-4 text-center relative"
                                  style={{ borderBottom: "1px solid rgba(61,107,131,0.08)" }}
                                  onMouseEnter={() => cell && setHoveredSWCell({ species, month: m })}
                                  onMouseLeave={() => setHoveredSWCell(null)}
                                >
                                  {cell ? (
                                    <span
                                      data-testid={`cell-tide-${species.replace(/\s+/g, '-')}-${m}`}
                                      className={`inline-block w-7 h-5 rounded-sm cursor-pointer transition-all duration-150 ${swConfidenceColor(cell.confidence, true)} ${isHovered ? "ring-2 ring-[#3D6B83] ring-offset-1 scale-110" : "hover:scale-105"}`}
                                    />
                                  ) : (
                                    <span className="inline-block w-7 h-5 rounded-sm" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="font-['Inter'] italic text-[13px] mb-10" style={{ color: "#BAB9B4", marginTop: 8 }}>
                  Showing primary target species. Full species matrix coming with regional tide data integration.
                </p>

                {/* Hover Tooltip Card, Saltwater */}
                {hoveredSWEvent && hoveredSWCell && (
                  <div className="mb-10 rounded-sm p-6 max-w-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColorMed}` }}>
                    <div className="flex items-start gap-4 mb-3">
                      {allFishPortraits[hoveredSWEvent.commonName] && (
                        <div className="shrink-0 w-32 h-20 rounded-sm overflow-hidden" style={{ border:"1px solid rgba(61,107,131,0.2)" }}>
                          <img src={allFishPortraits[hoveredSWEvent.commonName]} alt={hoveredSWEvent.commonName} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${swConfidenceDot(hoveredSWEvent.confidence)}`} />
                          <h3 className="font-['Cormorant_Garamond'] text-lg" style={{ color: "#2F2B1E" }}>
                            {hoveredSWEvent.species}
                          </h3>
                        </div>
                        <p className="font-['Inter'] text-sm italic" style={{ color: "#7A7974" }}>
                          {hoveredSWEvent.commonName}, {monthShort[hoveredSWCell.month]} · {hoveredSWEvent.season}
                        </p>
                      </div>
                    </div>

                    <p className="font-['Inter'] text-sm leading-relaxed mb-4" style={{ color: "#2F2B1E" }}>
                      {hoveredSWEvent.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Best tide", val: hoveredSWEvent.peakTide },
                        { label: "Water Temp", val: hoveredSWEvent.waterTemp },
                        { label: "Look For", val: hoveredSWEvent.lookFor },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-sm p-2.5" style={{ backgroundColor: "rgba(61,107,131,0.12)" }}>
                          <p className="text-sm font-['Inter'] uppercase tracking-wide mb-0.5" style={{ color: "#1A2A38" }}>{stat.label}</p>
                          <p className="font-['Inter'] text-sm font-semibold leading-snug" style={{ color: "#1A2A38" }}>{stat.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip */}
                    <div className="mb-4 p-3 rounded-sm flex gap-2.5" style={{ backgroundColor: "rgba(61,107,131,0.12)", border: `1px solid ${borderColorMed}` }}>
                      <Waves size={13} style={{ color: "#3D6B83", flexShrink: 0, marginTop: 2 }} />
                      <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color: "#1A2A38" }}>
                        {hoveredSWEvent.tip}
                      </p>
                    </div>

                    {/* Recommended Flies */}
                    <div>
                      <p className="text-sm font-['Inter'] uppercase tracking-wide mb-2" style={{ color: "#1A2A38" }}>
                        Recommended saltwater patterns
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {hoveredSWEvent.flies.map((fid) => saltwaterFlies[fid] && (
                          <Link key={fid} href="/finder">
                            <span
                              className="text-sm px-2.5 py-1 rounded-sm cursor-pointer font-['Inter'] transition-colors"
                              style={{ backgroundColor: "rgba(61,107,131,0.18)", border: `1px solid ${borderColorMed}`, color: "#3D6B83" }}
                            >
                              {saltwaterFlies[fid].name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* ── Live NOAA tide strip (Tier 1) ─────────────────── */}
                    {liveTides && !liveTides.error && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(61,107,131,0.15)" }}>
                        <a href="https://tidesandcurrents.noaa.gov" target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-[13px] uppercase tracking-widest mb-2 block hover:underline" style={{ color: "rgba(61,107,131,0.55)" }}>Live tide conditions · NOAA CO-OPS</a>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(61,107,131,0.1)", border: "1px solid rgba(61,107,131,0.2)" }}>
                            <Waves size={12} style={{ color: "#3D6B83" }} />
                            <span className="font-['Inter'] text-sm" style={{ color: "#1A2A38" }}>{liveTides.current_stage}</span>
                          </div>
                          {liveTides.next_tide_time && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(61,107,131,0.1)", border: "1px solid rgba(61,107,131,0.2)" }}>
                              <TrendingUp size={12} style={{ color: "#3D6B83" }} />
                              <span className="font-['Inter'] text-sm" style={{ color: "#1A2A38" }}>Next: {liveTides.next_tide_time}</span>
                              {liveTides.next_tide_height != null && (
                                <span className="font-['Inter'] text-[13px]" style={{ color: "rgba(26,34,44,0.45)" }}>{liveTides.next_tide_height.toFixed(1)} ft {liveTides.next_tide_type}</span>
                              )}
                            </div>
                          )}
                          <span className="font-['Inter'] text-[13px] self-center" style={{ color: "rgba(26,34,44,0.35)" }}>{liveTides.advisory}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Species Notes accordion */}
                <section className="py-20">
                  <p className="font-['Cinzel'] text-sm uppercase tracking-[0.25em] mb-3" style={{ color: "#3D6B83" }}>
                    The science behind the bite
                  </p>
                  <h2 className="font-['Cormorant_Garamond'] italic text-3xl sm:text-4xl mb-2 pb-3 border-b" style={{ color: "#2F2B1E", borderColor }}>
                    Species Notes
                  </h2>
                  <p className="font-['Inter'] text-sm mb-5 italic" style={{ color: "#7A7974" }}>
                    Behavior, habitat, and seasonal patterns. The science behind the bite.
                  </p>
                  <div className="space-y-2">
                    {swSpeciesList.map(([species, data]) => {
                      // Find the best description (highest-confidence month)
                      const allMonthEvents = Object.values(data.months);
                      const bestEvent = allMonthEvents.sort((a, b) => {
                        const p: Record<ConfidenceLevel, number> = { high: 3, medium: 2, low: 1 };
                        return p[b.confidence] - p[a.confidence];
                      })[0];
                      if (!bestEvent) return null;
                      const isOpen = speciesNotesOpen === species;
                      return (
                        <div key={species} className="rounded-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                          <button
                            className="w-full text-left px-4 py-3 flex items-center justify-between min-h-[44px]"
                            onClick={() => setSpeciesNotesOpen(isOpen ? null : species)}
                          >
                            <div className="flex items-center gap-3">
                              {allFishPortraits[species] || allFishPortraits[data.commonName] ? (
                                <img
                                  src={allFishPortraits[species] || allFishPortraits[data.commonName]}
                                  alt={data.commonName}
                                  className="rounded-sm object-contain flex-shrink-0"
                                  style={{ width: 88, height: 60, backgroundColor: "#060D1A" }}
                                />
                              ) : (
                                <Waves size={13} style={{ color: "#3D6B83", flexShrink: 0 }} />
                              )}
                              <span className="font-['Cormorant_Garamond'] text-sm" style={{ color: "#2F2B1E" }}>{data.commonName || species}</span>
                              <span className="font-['Inter'] text-sm italic" style={{ color: "rgba(26,34,44,0.5)" }}>
                                {species !== data.commonName ? species : ""}
                              </span>
                            </div>
                            <span className="text-sm" style={{ color: "#3D6B83" }}>{isOpen ? "▲" : "▼"}</span>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: "rgba(61,107,131,0.15)" }}>
                              {/* Large species portrait */}
                              {(allFishPortraits[species] || allFishPortraits[data.commonName]) && (
                                <div className="w-full mb-4 rounded-sm overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#060D1A", minHeight: 200 }}>
                                  <img
                                    src={allFishPortraits[species] || allFishPortraits[data.commonName]}
                                    alt={data.commonName}
                                    className="w-full object-contain"
                                    style={{ maxHeight: 280 }}
                                  />
                                </div>
                              )}
                              <p className="font-['Inter'] text-sm italic leading-relaxed mb-3" style={{ color: "#2F2B1E" }}>
                                {bestEvent.description}
                              </p>
                              <p className="font-['Inter'] text-sm mb-3" style={{ color: "rgba(61,107,131,0.8)" }}>
                                <strong>Best tide:</strong> {bestEvent.peakTide} &nbsp;·&nbsp;
                                <strong>Water temp:</strong> {bestEvent.waterTemp}
                              </p>
                              {/* Confidence / activity bar */}
                              {(() => {
                                const pct = bestEvent.confidence === "high" ? 90 : bestEvent.confidence === "medium" ? 60 : 30;
                                return (
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1 rounded-sm overflow-hidden bg-stone-200">
                                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: "#3D6B83" }} />
                                    </div>
                                    <span className="font-['Cinzel'] text-[13px] uppercase tracking-widest shrink-0" style={{ color: "#3D6B83" }}>{pct}%</span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ── SW Fish Portrait Strip — clickable, expands species notes ── */}
                <div className="mb-10 space-y-3">
                  <div className="flex flex-col gap-3">
                    {SW_PORTRAITS.map(p => {
                      const isOpen = expandedPortrait === p.name;
                      return (
                        <button
                          key={p.name}
                          className="w-full text-left focus:outline-none rounded-sm overflow-hidden transition-all"
                          style={{ border: `2px solid ${isOpen ? "#3D6B83" : "rgba(61,107,131,0.2)"}`, backgroundColor: "#0d1a26", display: "flex", alignItems: "stretch" }}
                          onClick={() => setExpandedPortrait(isOpen ? null : p.name)}
                          aria-expanded={isOpen}
                        >
                          {/* Image */}
                          <div style={{ width: 120, flexShrink: 0, position: "relative", minHeight: 80, backgroundColor: "#060D1A" }}>
                            <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8, opacity: 0.95 }} />
                          </div>
                          {/* Text */}
                          <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <p className="font-['Cormorant_Garamond'] italic font-semibold leading-tight mb-0.5" style={{ fontSize: 17, color: "#F7F1E2" }}>{p.name}</p>
                            <p className="font-['Inter'] text-xs italic" style={{ color: "rgba(245,230,204,0.4)" }}>{p.latin}</p>
                          </div>
                          {/* Chevron */}
                          <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: isOpen ? "#3D6B83" : "rgba(245,230,204,0.4)", fontSize: 11 }}>
                            {isOpen ? "▲" : "▼"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Expanded SW species notes panel */}
                  {expandedPortrait && SW_PORTRAITS.find(p => p.name === expandedPortrait) && (() => {
                    const portrait = SW_PORTRAITS.find(p => p.name === expandedPortrait)!;
                    const speciesEntry = swSpeciesList.find(([key, data]) =>
                      data.commonName === portrait.name || key === portrait.name
                    );
                    const bestEvent = speciesEntry
                      ? Object.values(speciesEntry[1].months).sort((a, b) =>
                          (a.confidence === "high" ? 3 : a.confidence === "medium" ? 2 : 1) -
                          (b.confidence === "high" ? 3 : b.confidence === "medium" ? 2 : 1)
                        ).reverse()[0]
                      : null;
                    return (
                      <div className="rounded-sm p-6" style={{ backgroundColor: "#FAF9F5", border: "1px solid rgba(61,107,131,0.25)", borderLeft: "3px solid #3080A8" }}>
                        <div className="flex gap-4 mb-4">
                          <img src={portrait.img} alt={portrait.name} className="rounded-sm object-contain flex-shrink-0" style={{ width: 120, height: 80, backgroundColor: "#060D1A" }} />
                          <div>
                            <h3 className="font-['Cormorant_Garamond'] italic text-lg font-semibold mb-0.5" style={{ color: "#1A2A38" }}>{portrait.name}</h3>
                            <p className="font-['Inter'] text-sm italic mb-2" style={{ color: "#BAB9B4" }}>{portrait.latin}</p>
                            {bestEvent && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm px-2 py-0.5 rounded-sm font-['Inter'] uppercase tracking-wide" style={{ backgroundColor: "rgba(61,107,131,0.12)", color: "#1A2A38" }}>Peak: {bestEvent.peakTime}</span>
                                <span className="text-sm px-2 py-0.5 rounded-sm font-['Inter'] uppercase tracking-wide" style={{ backgroundColor: "rgba(61,107,131,0.12)", color: "#1A2A38" }}>{bestEvent.tide}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {bestEvent?.tip ? (
                          <p className="font-['Inter'] text-sm leading-relaxed" style={{ color: "#2F2B1E" }}>{bestEvent.tip}</p>
                        ) : (
                          <p className="font-['Inter'] text-sm italic" style={{ color: "#BAB9B4" }}>
                            Select a region above to see species notes for {portrait.name}.
                          </p>
                        )}
                        {bestEvent?.flies && bestEvent.flies.length > 0 && (
                          <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(61,107,131,0.15)" }}>
                            <p className="font-['Inter'] text-sm uppercase tracking-widest mb-2" style={{ color: "#BAB9B4" }}>Top patterns</p>
                            <div className="flex flex-wrap gap-2">
                              {bestEvent.flies.map(fid => saltwaterFlies[fid] && (
                                <span key={fid} className="text-sm px-2.5 py-1 rounded-sm font-['Inter']" style={{ backgroundColor: "rgba(61,107,131,0.12)", border: "1px solid rgba(61,107,131,0.2)", color: "#3D6B83" }}>
                                  {saltwaterFlies[fid].name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* All Saltwater Patterns grid */}
                <section className="py-20">
                  <p className="font-['Cinzel'] text-sm uppercase tracking-[0.25em] mb-3" style={{ color: "#3D6B83" }}>
                    The complete saltwater box
                  </p>
                  <h2 className="font-['Cormorant_Garamond'] italic text-3xl sm:text-4xl mb-2 pb-3 border-b" style={{ color: "#2F2B1E", borderColor }}>
                    All Saltwater Patterns
                  </h2>
                  <p className="font-['Inter'] text-sm mb-5 italic" style={{ color: "#7A7974" }}>
                    Every pattern in the Flydentify saltwater box. From Keys permit to Northeast stripers.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.values(saltwaterFlies).map((fly) => (
                      <Link key={fly.id} href="/finder">
                        <div
                          data-testid={`card-sw-fly-${fly.id}`}
                          className="rounded-sm cursor-pointer transition-all overflow-hidden group"
                          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(61,107,131,0.5)")}
                          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = borderColor)}
                        >
                          {/* Fly photo */}
                          <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EEF2F4" }}>
                            {swFlyImages[fly.id]
                              ? <img src={swFlyImages[fly.id]} alt={fly.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center" style={{ opacity: 0.2 }}>
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(61,107,131,0.6)" strokeWidth="1.25"><path d="M3 12 C6 7 10 5 14 6 C18 7 21 9.5 22 12 C21 14.5 18 17 14 18 C10 19 6 17 3 12Z"/></svg>
                                </div>
                            }
                          </div>
                          {/* Label */}
                          <div className="p-3">
                            <h3 className="font-['Cormorant_Garamond'] text-sm leading-snug mb-1" style={{ color: "#2F2B1E" }}>{fly.name}</h3>
                            <p className="font-['Inter'] text-sm italic" style={{ color: "#2F2B1E" }}>{fly.imitates}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Page footer logo ── */}
      <div className="flex flex-col items-center gap-4 pb-12 pt-10" style={{ backgroundColor: "#0D1B33", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <img src={logoImg} alt="Flydentify" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", display: "block", margin: "0 auto" }} />
        <p className="font-['Inter'] text-sm" style={{ color: "rgba(245,230,204,0.45)" }}>
          © 2026 Flydentify · Made in Texas
        </p>
      </div>
    </div>
  );
}
