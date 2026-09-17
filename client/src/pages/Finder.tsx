import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";
import { MapContainer, TileLayer, GeoJSON, Polyline, Marker, Popup, useMap } from "react-leaflet";

// ── Map fly-to controller — mounts inside MapContainer, responds to focusedDest ──
function MapFlyTo({ dest, zoom }: { dest: { lat: number; lng: number } | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (dest) {
      map.flyTo([dest.lat, dest.lng], Math.max(zoom, 10), { duration: 1.2 });
    }
  }, [dest]);
  return null;
}
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Fix Leaflet default icon path in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import { Link, useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTrack } from "@/lib/useTrack";
import { useWaterMode } from "@/lib/waterModeContext";
import { AuthModal } from "@/components/AuthModal";
import { PaywallModal } from "@/components/PaywallModal";

import {
  ChevronLeft, Info, Thermometer, Clock, ArrowRight,
  ChevronDown, ChevronUp, MapPin, Search, Loader2, X, Menu,
  Camera, Leaf, TrendingUp, TrendingDown, Minus,
  ExternalLink, Phone, Waves, Backpack, Plus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  fetchTripKits, addFlyToKit, createEmptyKit, saveTripKit,
  type TripKit, type SavedFly,
} from "@/lib/tripKitStore";
import { useToast } from "@/hooks/use-toast";
import {
  TroutIcon, RiverIcon, CompassRoseIcon, FlyBoxIcon,
  CreelIcon, CastIcon, FlyIcon, MayflyIcon, CaddisIcon, StoneflyIcon,
} from "@/components/NatureIcons";
import logoImg from "@assets/flydentify_logo.png";
import {
  regions, flies, monthNames,
  type HatchEvent, type Fly,
  getFlyTypeLabel, getFlyTypeBadgeClass,
} from "@/lib/flyData";
import { knots, getKnotsForFly, getDifficultyColor } from "@/lib/knotData";
import { KnotDiagram, getStepCount } from "@/lib/knotDiagrams";
import { KnotCarousel } from "@/components/KnotCarousel";
import { GearSetupCard } from "@/components/GearSetupCard";
import {
  topRiversByRegion, fetchUSGSLatest, buildAdvisory, usgsGaugeUrl,
  getGaugesForState,
  type RiverGauge, type RiverCondition,
} from "@/lib/riverData";
import { getGuidesForRegion } from "@/lib/guidesData";
import { getShopsForRegion } from "@/lib/flyShopsData";
import { getStateInfo, stateToRegion, type StateInfo } from "@/lib/stateData";
import { getShopsForState } from "@/lib/stateFlyShops";
import { getGuidesForState } from "@/lib/stateGuides";
import { type OpenMeteoConditions } from "@/components/WeatherWidget";
import { fetchNaturalistObs, getActiveOrders, type NaturalistObs } from "@/lib/iNaturalistFeed";
import { predictHatches, type HatchPrediction } from "@/lib/degreeDayEngine";
import { WeatherWidget } from "@/components/WeatherWidget";
import { HatchReportForm } from "@/components/HatchReportForm";
import { HatchReportFeed } from "@/components/HatchReportFeed";
import { TripPlanner } from "@/components/TripPlanner";
import { TripDossierDrawer } from "@/components/TripDossierDrawer";
import { RiverDivider, FlyDivider } from "@/components/SectionDivider";
import {
  getRiversForRegion, getRiversForStateOrRegion, getDifficultyColor as getRiverDiffColor,
  getTypeLabel, enrichRiversWithAccessPoints, type RiverRecommendation,
} from "@/lib/riverRecommendations";

// ── Saltwater data ────────────────────────────────────────────────────────────
import {
  saltwaterFlies, swRegions, swRegionKeys, stateSWRegion,
  type SaltwaterFly, type TidalEvent, type SWRegionData,
  getSwFlyTypeLabel, getSwFlyTypeBadgeClass,
} from "@/lib/saltwaterFlyData";
import { getSwStateInfo, isCoastalState, type SWStateInfo } from "@/lib/saltwaterStateData";

// ── Fly macro photos, freshwater ────────────────────────────────────────────
import adamsImg from "@assets/flies/adams.png";
import elkHairCaddisImg from "@assets/flies/elk_hair_caddis.png";
import parachuteAdamsImg from "@assets/flies/parachute_adams.png";
import hareEarNymphImg from "@assets/flies/hare_ear_nymph.png";
import pheasantTailImg from "@assets/flies/pheasant_tail.png";
import copperJohnImg from "@assets/flies/copper_john.png";
import woollyBuggerImg from "@assets/flies/woolly_bugger.png";
import muddlerMinnowImg from "@assets/flies/muddler_minnow.png";
import pmdEmergerImg from "@assets/flies/pmd_emerger.png";
import cdcBwoImg from "@assets/flies/cdc_bwo.png";
import daveHopperImg from "@assets/flies/dave_hopper.png";
import antPatternImg from "@assets/flies/ant_pattern.png";
import stoneflyNymphImg from "@assets/flies/stonefly_nymph.png";
import stimulatorImg from "@assets/flies/stimulator.png";
import zebraMidgeImg from "@assets/flies/zebra_midge.png";
import griffithsGnatImg from "@assets/flies/griffiths_gnat.png";

// ── Fly macro photos, saltwater ─────────────────────────────────────────────
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

// ── Fish portrait images ──────────────────────────────────────────────────────
// ── Fish portrait images ────────────────────────────────────────────────────
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
// Warmwater / new species portraits
import portraitApacheTroutImg from "@assets/portraits/fw/fw_plate_01_apache_trout.png";
import portraitBluegillImg from "@assets/portraits/fw/fw_plate_02_bluegill.png";
import portraitBowfinImg from "@assets/portraits/fw/fw_plate_03_bowfin.png";
import portraitBrookTroutImg from "@assets/portraits/fw/fw_plate_04_brook_trout.png";
import portraitBrownTroutImg from "@assets/portraits/fw/fw_plate_05_brown_trout.png";
import portraitBullTroutImg from "@assets/portraits/fw/fw_plate_06_bull_trout.png";
import portraitCarpImg from "@assets/portraits/fw/fw_plate_07_carp.png";
import portraitChannelCatfishImg from "@assets/portraits/fw/fw_plate_08_channel_catfish.png";
import portraitCutthroatTroutImg from "@assets/portraits/fw/fw_plate_09_cutthroat_trout.png";
import portraitGuadalupeBassImg from "@assets/portraits/fw/fw_plate_10_guadalupe_bass.png";
import portraitLargemouthBassImg from "@assets/portraits/fw/fw_plate_11_largemouth_bass.png";
import portraitNorthernPikeImg from "@assets/portraits/fw/fw_plate_12_northern_pike.png";
import portraitPeacockBassImg from "@assets/portraits/fw/fw_plate_13_peacock_bass.png";
import portraitRainbowTroutImg from "@assets/portraits/fw/fw_plate_14_rainbow_trout.png";
import portraitRedbreastSunfishImg from "@assets/portraits/fw/fw_plate_15_redbreast_sunfish.png";
import portraitSmallmouthBassImg from "@assets/portraits/fw/fw_plate_16_smallmouth_bass.png";
import portraitSpottedBassImg from "@assets/portraits/fw/fw_plate_17_spotted_bass.png";
import portraitSteelheadImg from "@assets/portraits/fw/fw_plate_18_steelhead.png";
import portraitTilapiaImg from "@assets/portraits/fw/fw_plate_19_tilapia.png";
import portraitWalleyeImg from "@assets/portraits/fw/fw_plate_20_walleye.png";
import portraitWhiteBassImg from "@assets/portraits/fw/fw_plate_21_white_bass.png";

const fishPortraits: Record<string, string> = {
  // Saltwater
  "Tarpon": portraitTarponImg,
  "Tarpon (seasonal)": portraitTarponImg,
  "Permit": portraitPermitImg,
  "Bonefish": portraitBonefishImg,
  "Bonefish (oio)": portraitBonefishImg,
  "Red Drum": portraitRedDrumImg,
  "Redfish": portraitRedDrumImg,
  "Striped Bass": portraitStripedBassImg,
  "Spotted Seatrout": portraitSpottedSeatroutImg,
  "Bluefish": portraitBluefishImg,
  "Flounder": portraitFlounderImg,
  "Snook": portraitSnookImg,
  "Sheepshead": portraitSheepsheadImg,
  "Cobia": portraitCobiaImg,
  "False Albacore": portraitFalseAlbacoreImg,
  "Spanish Mackerel": portraitSpanishMackerelImg,
  "Weakfish": portraitWeakfishImg,
  "Bonito": portraitBonitoImg,
  "Pacific Halibut": portraitPacificHalibutImg,
  "Leopard Shark": portraitLeopardSharkImg,
  "Rockfish": portraitRockfishImg,
  "Coho Salmon": portraitCohoSalmonImg,
  "Coho Salmon (seasonal)": portraitCohoSalmonImg,
  "Coho Salmon (stocked)": portraitCohoSalmonImg,
  "Chinook Salmon": portraitChinookSalmonImg,
  "Pink Salmon": portraitPinkSalmonImg,
  "Sockeye Salmon": portraitSockeyeSalmonImg,
  "Dolly Varden": portraitDollyVardenImg,
  "Sea-Run Cutthroat": portraitSearunCutthroatImg,
  "Giant Trevally": portraitGiantTrevallyImg,
  "Bluefin Trevally (ulua)": portraitBluefinTrevallyImg,
  "Bluefin Trevally": portraitBluefinTrevallyImg,
  "Mahi-Mahi (offshore)": portraitMahiMahiImg,
  "Mahi-Mahi": portraitMahiMahiImg,
  "Yellowfin Tuna (offshore)": portraitYellowfinTunaImg,
  "Yellowfin Tuna": portraitYellowfinTunaImg,
  // Freshwater
  "Rainbow Trout": portraitRainbowTroutImg,
  "Rainbow Trout (stocked)": portraitRainbowTroutImg,
  "Rainbow Trout (stocked winter)": portraitRainbowTroutImg,
  "Brown Trout": portraitBrownTroutImg,
  "Brown Trout (landlocked)": portraitBrownTroutImg,
  "Brook Trout": portraitBrookTroutImg,
  "Cutthroat Trout": portraitCutthroatTroutImg,
  "Steelhead": portraitSteelheadImg,
  "Steelhead (Lake Michigan tribs)": portraitSteelheadImg,
  "Bull Trout": portraitBullTroutImg,
  "Apache Trout": portraitApacheTroutImg,
  // Warmwater / bass
  "Smallmouth Bass": portraitSmallmouthBassImg,
  "Largemouth Bass": portraitLargemouthBassImg,
  "Guadalupe Bass": portraitGuadalupeBassImg,
  "Walleye": portraitWalleyeImg,
  "Northern Pike": portraitNorthernPikeImg,
  "Peacock Bass": portraitPeacockBassImg,
  "Bluegill": portraitBluegillImg,
  "Channel Catfish": portraitChannelCatfishImg,
  "White Bass": portraitWhiteBassImg,
  "Spotted Bass": portraitSpottedBassImg,
  "Redbreast Sunfish": portraitRedbreastSunfishImg,
  "Bowfin": portraitBowfinImg,
  "Carp": portraitCarpImg,
  "Tilapia": portraitTilapiaImg,
};

const flyImages: Record<string, string> = {
  // freshwater
  adams: adamsImg, elk_hair_caddis: elkHairCaddisImg,
  parachute_adams: parachuteAdamsImg, hare_ear_nymph: hareEarNymphImg,
  pheasant_tail: pheasantTailImg, copper_john: copperJohnImg,
  woolly_bugger: woollyBuggerImg, muddler_minnow: muddlerMinnowImg,
  pmd_emerger: pmdEmergerImg, cdc_bwo: cdcBwoImg,
  dave_hopper: daveHopperImg, ant_pattern: antPatternImg,
  stonefly_nymph: stoneflyNymphImg, stimulator: stimulatorImg,
  zebra_midge: zebraMidgeImg, griffiths_gnat: griffithsGnatImg,
  // saltwater
  crazy_charlie: swCrazyCharlieImg, gotcha: swGotchaImg,
  clouser_minnow_bone: swClouserBoneImg, cockroach: swCockroachImg,
  black_death: swBlackDeathImg, tarpon_toad: swTarponToadImg,
  del_brown_permit: swDelBrownImg, spawning_shrimp: swSpawningShrimpImg,
  ep_spawning_shrimp: swEpSpawningImg, bruce_chard_redfish: swBruceChardImg,
  clouser_striper: swClouserStriperImg, deceiver: swDeceiverImg,
  gurgler: swGurglerImg, sea_habit: swSeaHabitImg,
  borski_slider: swBorskiSliderImg, half_and_half: swHalfAndHalfImg,
};

// ── Insect images ─────────────────────────────────────────────────────────────
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
import { HatchPlateLightbox } from "@/components/HatchPlateLightbox";
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

const hatchPlateImages: Record<string, string> = {
  // Plate 01 — Midge
  "Midge": hatchPlate01MidgeImg, "Midges": hatchPlate01MidgeImg,
  "Midges (Late Winter)": hatchPlate01MidgeImg, "Midges/Streamers": hatchPlate01MidgeImg,
  "Midges/Early BWO": hatchPlate01MidgeImg, "Midges/Early Spring Prep": hatchPlate01MidgeImg,
  "Midges/Early Spring Signs": hatchPlate01MidgeImg, "Midge Cluster": hatchPlate01MidgeImg,
  "Trico": hatchPlate01MidgeImg, "Tricos": hatchPlate01MidgeImg,
  // Plate 02 — Blue-Winged Olive
  "Blue-Winged Olive": hatchPlate02BwoImg, "Blue-Winged Olive (Early)": hatchPlate02BwoImg,
  "Blue-Winged Olive (Spring)": hatchPlate02BwoImg, "Blue-Winged Olive (Fall)": hatchPlate02BwoImg,
  "Blue-Winged Olive (Late Fall)": hatchPlate02BwoImg, "Blue-Winged Olive (October)": hatchPlate02BwoImg,
  "BWO": hatchPlate02BwoImg,
  // Plate 03 — Early Black Stonefly
  "Early Black Stonefly": hatchPlate03EarlyBlackImg, "Early Black Stone": hatchPlate03EarlyBlackImg,
  // Plate 04 — Skwala Stonefly
  "Skwala Stonefly": hatchPlate04SkwalaImg, "Skwala": hatchPlate04SkwalaImg,
  // Plate 05 — Hendrickson
  "Hendrickson": hatchPlate05HendricksonImg,
  "March Brown": hatchPlate05HendricksonImg, "Light Cahill": hatchPlate05HendricksonImg,
  // Plate 06 — Green Drake
  "Green Drake": hatchPlate06GreenDrakeImg, "Green Drake (Evening)": hatchPlate06GreenDrakeImg,
  "Hex Hatch": hatchPlate06GreenDrakeImg,
  // Plate 07 — Parachute Adams
  "Parachute Adams": hatchPlate07ParachuteAdamsImg, "Adams": hatchPlate07ParachuteAdamsImg,
  // Plate 08 — PMD / Pale Morning Dun
  "PMD": hatchPlate08GreenDrakeAltImg,
  "Pale Morning Dun": hatchPlate08GreenDrakeAltImg, "Pale Morning Dun (Summer)": hatchPlate08GreenDrakeAltImg,
  // Plate 09 — Yellow Sally / Golden Stonefly
  "Golden Stonefly": hatchPlate09YellowSallyImg, "Yellow Sally": hatchPlate09YellowSallyImg,
  "Golden Stone": hatchPlate09YellowSallyImg,
  // Plate 10 — Crane Fly / Terrestrials
  "Crane Fly": hatchPlate10CraneFlyImg, "Terrestrials": hatchPlate10CraneFlyImg,
  "Terrestrials, Grasshoppers": hatchPlate10CraneFlyImg, "Terrestrials, Ants & Beetles": hatchPlate10CraneFlyImg,
  "Flying Ants": hatchPlate10CraneFlyImg, "Hoppers/Terrestrials": hatchPlate10CraneFlyImg,
  "Hopper Season": hatchPlate10CraneFlyImg,
  // Plate 11 — Brown Stonefly / Salmonfly
  "Brown Stonefly": hatchPlate11BrownStoneflyImg,
  "Salmonfly": hatchPlate11BrownStoneflyImg, "Salmon Fly": hatchPlate11BrownStoneflyImg,
  // Plate 12 — Black Stonefly
  "Black Stonefly": hatchPlate12BlackStoneflyImg,
  // Plate 13 — Sulphur Mayfly
  "Sulphur": hatchPlate13SulphurImg, "Sulphur (Late Season)": hatchPlate13SulphurImg,
  "Sulphur Mayfly": hatchPlate13SulphurImg,
  // Plate 14 — Caddisfly A
  "Caddis": hatchPlate14CaddisflyImg, "Fall Caddis": hatchPlate14CaddisflyImg,
  "Caddis (Brachycentrus)": hatchPlate14CaddisflyImg, "Caddis (Evening)": hatchPlate14CaddisflyImg,
  "Terrestrials / Caddis": hatchPlate14CaddisflyImg, "Terrestrials / Caddis (Fall)": hatchPlate14CaddisflyImg,
  // Plate 15 — Caddisfly B
  "Mother's Day Caddis": hatchPlate15CaddisflyAltImg,
};

import finderWadingVid from "@assets/videos/fw_hero_new.mp4";
import finderWadingSwVid from "@assets/videos/sw_tarpon.mp4";

const insectImages: Record<string, string> = {
  // BWO variants
  "Blue-Winged Olive": bwoImg, "Blue-Winged Olive (Early)": bwoImg,
  "Blue-Winged Olive (Fall)": bwoImg, "Blue-Winged Olive (Late Fall)": bwoImg,
  "Blue-Winged Olive (October)": bwoImg, "BWO": bwoImg,
  // PMD variants
  "Pale Morning Dun": pmdImg, "PMD": pmdImg, "Pale Morning Dun (Summer)": pmdImg,
  // Salmonfly
  "Salmonfly": salmonFlyImg, "Salmon Fly": salmonFlyImg,
  // Caddis variants
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
  // Ants / other terrestrials
  "Flying Ants": flyingAntsImg, "Terrestrials, Ants & Beetles": flyingAntsImg,
  "Terrestrials": flyingAntsImg,
  "Terrestrials / Caddis": hopperImg,
  "Terrestrials / Caddis (Fall)": hopperImg,
  // Mother's Day Caddis
  "Mother's Day Caddis": mothersDayCaddisImg,
  // Streamers
  "Streamer Season": woollyBuggerImg, "Streamers": woollyBuggerImg,
};

const regionKeys = Object.keys(regions);

// ── State name → abbr ─────────────────────────────────────────────────────────
const STATE_NAME_TO_ABBR: Record<string, string> = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA",
  "Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD",
  "Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS",
  "Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH",
  "New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC",
  "North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA",
  "Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN",
  "Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA",
  "West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};

function parseStateAbbr(address: Record<string, string>): string {
  const stateName = address?.state ?? "";
  return STATE_NAME_TO_ABBR[stateName] ?? stateName.substring(0, 2).toUpperCase();
}

async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; display: string; stateAbbr: string } | null> {
  try {
    const res = await apiRequest("GET", `/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    const addr = data[0].address ?? {};
    const city = addr.city || addr.town || addr.county || addr.village || "";
    const stateAbbr = parseStateAbbr(addr);
    return {
      lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon),
      display: [city, addr.state].filter(Boolean).join(", ") || data[0].display_name?.split(",").slice(0, 2).join(", ") || query,
      stateAbbr,
    };
  } catch { return null; }
}

async function reverseGeocode(lat: number, lon: number): Promise<{ label: string; stateAbbr: string }> {
  try {
    const res = await apiRequest("GET", `/api/reverse?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    const addr = data.address ?? {};
    const city = addr.city || addr.town || addr.county || addr.village || "";
    const stateAbbr = parseStateAbbr(addr);
    return { label: [city, addr.state].filter(Boolean).join(", ") || `${lat.toFixed(2)}N ${Math.abs(lon).toFixed(2)}W`, stateAbbr };
  } catch { return { label: `${lat.toFixed(2)}N ${Math.abs(lon).toFixed(2)}W`, stateAbbr: "" }; }
}

interface FlowData { cfs: number; tempF: number | null; trend: "rising"|"falling"|"stable"; advisory: string; simulated: boolean; }
// Returns { color, label, dot } for the fishability status indicator
function getFishability(cfs: number | null, tempF: number | null): { color: string; label: string } {
  if (cfs === null) return { color: "#BAB9B4", label: "No data" };
  if (tempF !== null && tempF > 68) return { color: "#ef4444", label: "Stressed" };
  if (cfs > 1500) return { color: "#f97316", label: "Blown out" };
  if (cfs > 600) return { color: "#f59e0b", label: "High" };
  if (cfs < 80) return { color: "#f59e0b", label: "Low" };
  if (tempF !== null && tempF < 40) return { color: "#3D6B83", label: "Cold" };
  return { color: "#22c55e", label: "Fishable" };
}

function getSimulatedFlow(month: number): FlowData {
  const springHigh = [3,4,5,6], summerLow = [7,8], fallModerate = [9,10];
  let cfs: number, tempF: number, trend: "rising"|"falling"|"stable";
  if (springHigh.includes(month)) { cfs = Math.floor(Math.random()*800+400); tempF = month<5?44:54; trend = month<=4?"rising":"falling"; }
  else if (summerLow.includes(month)) { cfs = Math.floor(Math.random()*120+60); tempF = 64+Math.floor(Math.random()*6); trend = "stable"; }
  else if (fallModerate.includes(month)) { cfs = Math.floor(Math.random()*300+150); tempF = month===9?58:50; trend = "falling"; }
  else { cfs = Math.floor(Math.random()*200+80); tempF = 38+Math.floor(Math.random()*6); trend = "stable"; }
  return { cfs, tempF, trend, advisory: buildAdvisory(cfs, tempF), simulated: true };
}

// ── "Tap the Stream" intelligence helpers ──────────────────────────────────

/** Wadability indicator derived from CFS flow. */
function getWadability(cfs: number | null): { label: string; color: string } {
  if (cfs === null) return { label: "No flow data", color: "#BAB9B4" };
  if (cfs < 200) return { label: "Easy wading", color: "#6B7A4B" };
  if (cfs <= 500) return { label: "Moderate", color: "#B58A2E" };
  if (cfs <= 1000) return { label: "Use caution", color: "#C0672A" };
  return { label: "Dangerous", color: "#B23A2E" };
}

/** Trout comfort zone indicator derived from water temperature (°F). */
function getWaterComfortZone(tempF: number | null): { label: string; color: string } {
  if (tempF === null) return { label: "No temp data", color: "#BAB9B4" };
  if (tempF < 45) return { label: "Cold, midges", color: "#3D6B83" };
  if (tempF <= 55) return { label: "Prime nymphing", color: "#6B7A4B" };
  if (tempF <= 65) return { label: "Prime dry fly", color: "#A67A3A" };
  if (tempF <= 72) return { label: "Warming, go early", color: "#C0672A" };
  return { label: "Too warm, fish rest", color: "#B23A2E" };
}

/** Map a hatch insect name (from degreeDayEngine) to the top 3 fly patterns to fish right now. */
function getTopFliesForInsect(insect: string | null): string[] {
  if (!insect) return ["Parachute Adams #14", "Pheasant Tail #16", "Hare's Ear #14"];
  const key = insect.toLowerCase();
  if (key.includes("pale morning") || key.includes("pmd")) return ["PMD Comparadun #16", "Sparkle Dun #18", "CDC Emerger #18"];
  if (key.includes("blue-winged olive") || key.includes("bwo")) return ["BWO Parachute #18", "Pheasant Tail #16", "RS2 #20"];
  if (key.includes("caddis")) return ["Elk Hair Caddis #14", "X-Caddis #14", "Green Bead Head Caddis #16"];
  if (key.includes("hopper")) return ["Dave's Hopper #10", "Chernobyl Ant #8", "Parachute Adams #14"];
  if (key.includes("midge")) return ["Mercury Midge #22", "Zebra Midge #22", "Disco Midge #24"];
  if (key.includes("salmonfly")) return ["Chubby Chernobyl #6", "Sofa Pillow #4", "Rubber Leg Stimulator #6"];
  if (key.includes("green drake")) return ["Parachute Green Drake #10", "Comparadun Drake #10", "Adams Wulff #10"];
  if (key.includes("trico")) return ["Trico Spinner #22", "Trico Dun #24", "CDC Trico #22"];
  if (key.includes("hendrickson")) return ["Red Quill #14", "Hendrickson Comparadun #14", "Pheasant Tail #16"];
  return ["Parachute Adams #14", "Pheasant Tail #16", "Hare's Ear #14"];
}

/** Casting angle advice from the current hour of day, based on sun angle. */
function getCastingAngle(hour: number): string {
  if (hour >= 6 && hour < 9) return "Cast upstream, low light";
  if (hour >= 9 && hour < 12) return "Cross-stream, fish shade";
  if (hour >= 12 && hour < 15) return "Deep nymphing, seek structure";
  if (hour >= 15 && hour < 18) return "Upstream dry, shadows lengthen";
  return "Evening rise, short casts";
}

/** Combine hatch status + water temp + time of day into a 2-hour activity forecast. */
function getActivityForecast(
  topHatchPred: HatchPrediction | null,
  tempF: number | null,
  hour: number
): string {
  const primeTemp = tempF !== null && tempF >= 45 && tempF <= 65;
  const rightTime = (hour >= 6 && hour < 10) || (hour >= 16 && hour < 21);
  if (topHatchPred?.status === "active" && primeTemp && rightTime) return "High activity expected";
  if ((topHatchPred?.status === "active" || topHatchPred?.status === "imminent") && tempF !== null && tempF >= 42 && tempF <= 70) {
    return "Pick up in 1–2 hrs";
  }
  return "Moderate, prospect riffles";
}

interface PhotoIdResult { name: string; latinName: string; confidence: number; order: string; family: string; size: string; color: string; flyIds: string[]; }
function getSimulatedPhotoId(month: number): PhotoIdResult {
  const isSummer = [5,6,7,8].includes(month);
  if (isSummer && Math.random()>0.5) return { name:"Golden Stonefly",latinName:"Hesperoperla pacifica",confidence:87,order:"Plecoptera",family:"Perlidae",size:"#6-8 (adult)",color:"Bright golden-yellow with brown mottling",flyIds:["stimulator","stonefly_nymph"] };
  if (isSummer) return { name:"Pale Morning Dun",latinName:"Ephemerella dorothea",confidence:92,order:"Ephemeroptera",family:"Ephemerellidae",size:"#16-18",color:"Pale yellow-olive body, gray-olive wings",flyIds:["pmd_emerger","parachute_adams","hare_ear_nymph"] };
  if (Math.random()>0.5) return { name:"Blue-Winged Olive",latinName:"Baetis spp.",confidence:89,order:"Ephemeroptera",family:"Baetidae",size:"#18-22",color:"Olive-brown body, dark gray wings",flyIds:["cdc_bwo","pheasant_tail","adams"] };
  return { name:"Midge Cluster",latinName:"Chironomidae",confidence:78,order:"Diptera",family:"Chironomidae",size:"#20-26",color:"Near-black body, clear wings",flyIds:["zebra_midge","griffiths_gnat"] };
}

// ── Rig diagrams (freshwater) ─────────────────────────────────────────────────
function DryDropperDiagram() {
  return (
    <svg viewBox="0 0 160 120" className="w-full h-24" xmlns="http://www.w3.org/2000/svg">
      <line x1="80" y1="5" x2="80" y2="30" stroke="#A67A3A" strokeWidth="1.5" strokeDasharray="4,2"/>
      <ellipse cx="80" cy="38" rx="14" ry="7" fill="none" stroke="#A67A3A" strokeWidth="1.5"/>
      <path d="M66,38 Q80,25 94,38" stroke="#A67A3A" strokeWidth="1" fill="none"/>
      <text x="100" y="41" fill="rgba(37,45,30,0.55)" fontSize="8" fontFamily="serif">Dry fly</text>
      <line x1="80" y1="45" x2="80" y2="85" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="84" y="70" fill="rgba(37,45,30,0.45)" fontSize="7" fontFamily="serif">18-24″</text>
      <ellipse cx="80" cy="92" rx="8" ry="5" fill="rgba(167,122,58,0.4)" stroke="#A67A3A" strokeWidth="1.5"/>
      <text x="90" y="95" fill="rgba(37,45,30,0.55)" fontSize="8" fontFamily="serif">Nymph</text>
    </svg>
  );
}
function TwoNymphDiagram() {
  return (
    <svg viewBox="0 0 160 130" className="w-full h-24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="15" r="8" fill="rgba(180,60,20,0.6)" stroke="#A67A3A" strokeWidth="1.5"/>
      <text x="90" y="18" fill="rgba(37,45,30,0.55)" fontSize="7" fontFamily="serif">Indicator</text>
      <line x1="80" y1="23" x2="80" y2="55" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <ellipse cx="80" cy="62" rx="8" ry="5" fill="rgba(167,122,58,0.4)" stroke="#A67A3A" strokeWidth="1.5"/>
      <text x="90" y="65" fill="rgba(37,45,30,0.55)" fontSize="7" fontFamily="serif">Point nymph</text>
      <line x1="80" y1="67" x2="80" y2="95" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <ellipse cx="80" cy="102" rx="6" ry="4" fill="rgba(120,80,20,0.4)" stroke="#A67A3A" strokeWidth="1"/>
      <text x="88" y="105" fill="rgba(37,45,30,0.55)" fontSize="7" fontFamily="serif">Dropper</text>
    </svg>
  );
}
function StreamerDiagram() {
  return (
    <svg viewBox="0 0 160 110" className="w-full h-24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,30 Q80,10 140,40" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4,2"/>
      <path d="M140,40 Q158,52 150,62 Q142,70 134,64 Q126,58 132,48 Z" fill="rgba(167,122,58,0.4)" stroke="#A67A3A" strokeWidth="1.5"/>
      <path d="M134,64 Q128,72 120,70" stroke="#A67A3A" strokeWidth="1" fill="none"/>
      <text x="60" y="72" fill="rgba(37,45,30,0.55)" fontSize="8" fontFamily="serif">Cast across &amp; down</text>
      <path d="M130,70 Q100,90 70,85" stroke="#A67A3A" strokeWidth="1" fill="none"/>
      <polygon points="70,85 78,80 76,90" fill="#A67A3A"/>
      <text x="30" y="95" fill="#BAB9B4" fontSize="7" fontFamily="serif">Strip on the swing</text>
    </svg>
  );
}

// ── Saltwater leader diagram ──────────────────────────────────────────────────
function SWLeaderDiagram() {
  return (
    <svg viewBox="0 0 220 80" className="w-full h-16" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="40" x2="70" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"/>
      <text x="12" y="32" fill="rgba(200,230,255,0.5)" fontSize="7" fontFamily="serif">Fly line</text>
      <line x1="70" y1="40" x2="140" y2="40" stroke="rgba(180,210,255,0.5)" strokeWidth="1.5" strokeDasharray="4,2"/>
      <text x="85" y="32" fill="rgba(180,210,255,0.5)" fontSize="7" fontFamily="serif">9′ 20-30 lb</text>
      <line x1="140" y1="40" x2="195" y2="40" stroke="rgba(100,200,180,0.5)" strokeWidth="1" strokeDasharray="2,2"/>
      <text x="142" y="58" fill="rgba(100,200,180,0.5)" fontSize="7" fontFamily="serif">12-18″ fluoro</text>
      <path d="M195,33 Q210,40 195,47 Q184,44 187,40 Z" fill="rgba(61,107,131,0.5)" stroke="#3D6B83" strokeWidth="1.5"/>
      <text x="198" y="32" fill="rgba(200,230,255,0.5)" fontSize="7" fontFamily="serif">Fly</text>
    </svg>
  );
}

// ── Water mode toggle ─────────────────────────────────────────────────────────
function WaterModeToggle({ mode, onChange }: { mode: "fresh"|"salt"; onChange: (m: "fresh"|"salt") => void }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
      <div style={{ display:"inline-flex", backgroundColor:"rgba(13,27,51,0.06)", borderRadius:999, padding:4, gap:4 }}>
        <button
          data-testid="toggle-freshwater"
          onClick={() => onChange("fresh")}
          className="flex items-center gap-2 font-['Cinzel'] uppercase transition-all"
          style={{
            padding:"12px 26px",
            borderRadius:999,
            fontSize:14,
            letterSpacing:"0.18em",
            fontWeight:600,
            backgroundColor: mode==="fresh" ? "#0D1B33" : "transparent",
            color: mode==="fresh" ? "rgba(245,230,204,0.95)" : "rgba(37,45,30,0.55)",
            boxShadow: mode==="fresh" ? "0 2px 10px rgba(13,27,51,0.22)" : "none",
            border:"none",
            cursor:"pointer",
            transition:"all 0.18s ease",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17c3-3 6-5 9-5s6 2 9 5"/><path d="M3 10c3-3 6-5 9-5s6 2 9 5"/>
          </svg>
          Freshwater
        </button>
        <button
          data-testid="toggle-saltwater"
          onClick={() => onChange("salt")}
          className="flex items-center gap-2 font-['Cinzel'] uppercase transition-all"
          style={{
            padding:"12px 26px",
            borderRadius:999,
            fontSize:14,
            letterSpacing:"0.18em",
            fontWeight:600,
            backgroundColor: mode==="salt" ? "#0D1B33" : "transparent",
            color: mode==="salt" ? "rgba(245,230,204,0.95)" : "rgba(37,45,30,0.55)",
            boxShadow: mode==="salt" ? "0 2px 10px rgba(13,27,51,0.22)" : "none",
            border:"none",
            cursor:"pointer",
            transition:"all 0.18s ease",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9s3-1.5 4.5-1.5S18 9 19.5 9s3-1.5 4.5-1.5"/><path d="M2 17c1.5-3 3-4.5 4.5-4.5S9 14 10.5 14s3-1.5 4.5-1.5 3 1.5 4.5 1.5 3-1.5 4.5-1.5"/>
          </svg>
          Saltwater
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────

// Difficulty → polyline color
const DIFF_COLORS: Record<string,string> = {
  beginner:     "#22c55e",
  intermediate: "#3b82f6",
  advanced:     "#f97316",
  expert:       "#ef4444",
};

export default function Finder() {
  const currentMonth = new Date().getMonth() + 1;
  const { track } = useTrack();
  const params = useParams<{ flyId?: string }>();

  // Water mode, shared via context so Home & HatchChart stay in sync
  const { waterMode, setWaterMode } = useWaterMode();

  // Freshwater
  const [selectedRegion, setSelectedRegion] = useState<string>(regionKeys[0]);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedFly, setSelectedFly] = useState<Fly | null>(null);
  const [knotsOpen, setKnotsOpen] = useState(true);
  const [expandedKnot, setExpandedKnot] = useState<string | null>(null);
  const [knotStep, setKnotStep] = useState<Record<string, number>>({});
  const [swKnotsOpen, setSwKnotsOpen] = useState(true);
  const [swExpandedKnot, setSwExpandedKnot] = useState<string | null>(null);
  const [swKnotStep, setSwKnotStep] = useState<Record<string, number>>({});

  // Saltwater
  const [selectedSWRegion, setSelectedSWRegion] = useState<string>(swRegionKeys[0]);
  const [selectedSWFly, setSelectedSWFly] = useState<SaltwaterFly | null>(null);
  const [swFocusedDest, setSwFocusedDest] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Location — persisted across page navigation
  const [locationInput, setLocationInput] = useState("");
  const [locationLabel, setLocationLabel] = useState<string>(() => {
    try { return localStorage.getItem("fdy_loc_label") || ""; } catch { return ""; }
  });
  const [locationStateAbbr, setLocationStateAbbr] = useState<string>(() => {
    try { return localStorage.getItem("fdy_loc_state") || ""; } catch { return ""; }
  });
  // ── US river network GeoJSON (loaded once) ────────────────────────────────
  const [riverGeoJson, setRiverGeoJson] = useState<any>(null);
  useEffect(() => {
    fetch("/us_rivers.geojson")
      .then(r => r.json())
      .then(d => setRiverGeoJson(d))
      .catch(() => {});
  }, []);




  const [activeFishSheet, setActiveFishSheet] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [locCoords, setLocCoords] = useState<{ lat: number; lon: number } | null>(() => {
    try {
      const s = localStorage.getItem("fdy_loc_coords");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  // Live data
  const [weather, setWeather] = useState<OpenMeteoConditions | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [naturalistObs, setNaturalistObs] = useState<NaturalistObs[]>([]);
  const [hatchPredictions, setHatchPredictions] = useState<HatchPrediction[]>([]);
  const [hatchReportKey, setHatchReportKey] = useState(0);
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [riverConditions, setRiverConditions] = useState<RiverCondition[]>([]);
  const [riversLoading, setRiversLoading] = useState(false);
  const [expandedRivers, setExpandedRivers] = useState<Set<string>>(new Set());

  // Tier 2: live inline conditions (fetched when locCoords known)
  const [liveRiver, setLiveRiver] = useState<any>(null);
  const [liveTides, setLiveTides] = useState<any>(null);

  // Photo ID
  const [activeTab, setActiveTab] = useState<"finder"|"photo_id">("finder");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoIdLoading, setPhotoIdLoading] = useState(false);
  const [photoIdResult, setPhotoIdResult] = useState<PhotoIdResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Hyper-local intelligence
  const [stockingData, setStockingData] = useState<Array<{id:number;river:string;species:string;countStocked:number|null;stockDate:string;sourceUrl:string|null}>>([]);
  const [recentCatches, setRecentCatches] = useState<Array<{id:number;river:string;state:string;species:string;fly:string;conditions:string;createdAt:number}>>([]);

  // Mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth
  const { user, isPro } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // "Tap the Stream" intelligence card + habitat legend (frontend-only UI state)
  // Waypoint saving
  const [waypointFormOpen, setWaypointFormOpen] = useState(false);
  const [waypointName, setWaypointName] = useState("");
  const [waypointFeature, setWaypointFeature] = useState<string>("riffle");
  const [waypointNotes, setWaypointNotes] = useState("");
  const [waypointSaving, setWaypointSaving] = useState(false);
  const [waypointSaved, setWaypointSaved] = useState(false);
  const [habitatLegendOpen, setHabitatLegendOpen] = useState(false);

  // Map / Directions

  const [focusedRiver, setFocusedRiver] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [activeAccessPoint, setActiveAccessPoint] = useState<{ name: string; type?: string; fee?: string; river: string; accessNotes?: string; whyFish?: string; usgsUrl?: string } | null>(null);
  const [activeSWAccessPoint, setActiveSWAccessPoint] = useState<{ name: string; species?: string } | null>(null);

  const [dirModal, setDirModal] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [showTripDossier, setShowTripDossier] = useState(false);
  const [dirOrigin, setDirOrigin] = useState("");
  const [dirOriginCoords, setDirOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dirLocLoading, setDirLocLoading] = useState(false);
  const [dirLocError, setDirLocError] = useState("");

  const handleDirUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDirLocError("Geolocation is not supported by your browser.");
      return;
    }
    setDirLocLoading(true);
    setDirLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDirOriginCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDirOrigin(""); // clear text; coords take precedence
        setDirLocLoading(false);
      },
      (err) => {
        setDirLocError("Location access denied. Please enter your starting point manually.");
        setDirLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Save to Kit
  const { toast } = useToast();

  // Load kits list for the popover
  const { data: tripKits = [] } = useQuery<TripKit[]>({
    queryKey: ["/api/trip-kits"],
    queryFn: fetchTripKits,
  });

  const saveToKitMutation = useMutation({
    mutationFn: async ({
      flyId, flyName, flyType, rigging,
    }: { flyId: string; flyName: string; flyType: string; rigging: SavedFly["rigging"]; }) => {
      if (!user) {
        setShowAuthModal(true);
        throw new Error("Not signed in");
      }
      const knotIds = getKnotsForFly(flyType).map((r) => r.knotId);
      const savedFly: SavedFly = { flyId, flyName, flyType, rigging, knotIds, notes: "" };
      if (tripKits.length === 0) {
        const kit = createEmptyKit("My trip kit", "", "", "", waterMode);
        await saveTripKit(kit);
        await addFlyToKit(kit.id, savedFly);
        return { kitName: "My trip kit", isNew: true };
      } else {
        const kit = tripKits[0];
        await addFlyToKit(kit.id, savedFly);
        return { kitName: kit.name || kit.river || "My trip kit", isNew: false };
      }
    },
    onSuccess: ({ kitName, isNew }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
      toast({
        title: `Saved to "${kitName}"`,
        description: isNew ? "A new trip kit was created. View it in My Trips." : "View it in My Trips.",
      });
    },
    onError: (err: Error) => {
      if (err.message === "Not signed in") return; // auth modal already shown
      toast({ title: "Could not save fly", description: "Please try again.", variant: "destructive" });
    },
  });

  const saveToSpecificKit = useCallback(async (
    kitId: string, kitName: string,
    flyId: string, flyName: string, flyType: string, rigging: SavedFly["rigging"]
  ) => {
    const knotIds = getKnotsForFly(flyType).map((r) => r.knotId);
    await addFlyToKit(kitId, { flyId, flyName, flyType, rigging, knotIds, notes: "" });
    queryClient.invalidateQueries({ queryKey: ["/api/trip-kits"] });
    toast({ title: `Saved to "${kitName || "My trip kit"}"` });
  }, [tripKits]);

  function SaveToKitButton({
    flyId, flyName, flyType, rigging
  }: { flyId: string; flyName: string; flyType: string; rigging: SavedFly["rigging"]; }) {
    if (tripKits.length === 0) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); saveToKitMutation.mutate({ flyId, flyName, flyType, rigging }); }}
          className="flex items-center gap-1 text-sm px-2 py-1 rounded-sm font-['Inter'] transition-colors min-h-[36px]"
          style={{ backgroundColor: "rgba(167,122,58,0.15)", color: "#A67A3A", border: "1px solid rgba(167,122,58,0.3)" }}
        >
          <Backpack size={11} /> Save to Kit
        </button>
      );
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded-sm font-['Inter'] transition-colors min-h-[36px]"
            style={{ backgroundColor: "rgba(167,122,58,0.15)", color: "#A67A3A", border: "1px solid rgba(167,122,58,0.3)" }}
          >
            <Backpack size={11} /> Save to Kit
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="rounded-sm p-1 w-52"
          style={{ backgroundColor: "rgba(37,45,30,0.06)", border: "1px solid rgba(160,118,58,0.2)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-3 py-1.5 font-['Inter'] text-sm uppercase tracking-widest" style={{ color: "#BAB9B4" }}>Add to kit</p>
          {tripKits.slice(0, 5).map((kit) => (
            <button
              key={kit.id}
              className="w-full text-left px-3 py-2 rounded-sm font-['Inter'] text-sm transition-colors hover:bg-white/5"
              style={{ color: "#2F2B1E" }}
              onClick={() => saveToSpecificKit(
                kit.id, kit.name || kit.river || "My trip kit",
                flyId, flyName, flyType, rigging
              )}
            >
              {kit.name || kit.river || "My trip kit"}
            </button>
          ))}
          <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            <button
              className="w-full text-left px-3 py-2 rounded-sm font-['Inter'] text-sm transition-colors hover:bg-white/5 flex items-center gap-1.5"
              style={{ color: "#A67A3A" }}
              onClick={() => { window.location.hash = "/trips"; }}
            >
              <Plus size={11} /> New trip kit
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Track page view on mount
  useEffect(() => {
    track('page_view', { page: 'finder' });
  }, []);

  // Deep-link fly pre-select: /#/finder/fly/<id> → open that fly detail
  useEffect(() => {
    const flyId = params?.flyId;
    if (flyId) {
      const fly = flies[flyId];
      if (fly) {
        setSelectedFly(fly);
        setActiveTab("finder");
      }
    }
  }, [params?.flyId]);

  // Auto-select SW region when location changes
  useEffect(() => {
    if (locationStateAbbr) {
      const swReg = stateSWRegion[locationStateAbbr];
      if (swReg) setSelectedSWRegion(swReg);
    }
  }, [locationStateAbbr]);

  const fetchTopRivers = async (region: string, stateAbbr?: string) => {
    // Prefer state-specific gauges when we have a GPS-resolved state; fall back to region list
    const stateGauges = stateAbbr ? getGaugesForState(stateAbbr) : [];
    const gauges = stateGauges.length ? stateGauges : (topRiversByRegion[region] ?? []);
    if (!gauges.length) return;
    setRiversLoading(true);
    const results: RiverCondition[] = await Promise.all(
      gauges.map(async (g: RiverGauge) => {
        const { cfs, tempF } = await fetchUSGSLatest(g.usgsId);
        return { name:g.name, state:g.state, cfs, tempF, trend:"stable" as const, advisory:buildAdvisory(cfs,tempF), usgsUrl:usgsGaugeUrl(g.usgsId), live:cfs!==null };
      })
    );
    setRiverConditions(results);
    setRiversLoading(false);
  };

  useEffect(() => {
    if (selectedRegion && waterMode==="fresh") fetchTopRivers(selectedRegion, locationStateAbbr || undefined);
  }, [selectedRegion, waterMode, locationStateAbbr]);

  // ── Stocking + Catch Report data (hyper-local) ──────────────────────────────
  useEffect(() => {
    if (!locationStateAbbr || waterMode !== "fresh") { setStockingData([]); setRecentCatches([]); return; }
    fetch(`/api/stocking?state=${locationStateAbbr}&days=60`)
      .then(r => r.json()).then(d => Array.isArray(d) ? setStockingData(d) : null).catch(() => {});
    fetch(`/api/catch-reports?state=${locationStateAbbr}&limit=10`)
      .then(r => r.json()).then(d => Array.isArray(d) ? setRecentCatches(d) : null).catch(() => {});
  }, [locationStateAbbr, waterMode]);

  useEffect(() => {
    if (!locCoords) return;
    const { lat, lon } = locCoords;
    setWeatherLoading(true);
    fetch(`/api/conditions/weather?lat=${lat}&lon=${lon}&mode=${waterMode}`)
      .then(r => r.ok ? r.json() : null)
      .then(w => { setWeather(w); setWeatherLoading(false); })
      .catch(() => setWeatherLoading(false));
    fetchNaturalistObs(lat, lon).then(obs => {
      setNaturalistObs(obs);
      setHatchPredictions(predictHatches(lat, selectedMonth, weather?.temp ?? null));
    });
    // Tier 2: fetch live stream or tide conditions alongside weather
    if (waterMode === "fresh") {
      fetch(`/api/conditions/river?lat=${lat}&lon=${lon}`)
        .then(r => r.json()).then(setLiveRiver).catch(() => null);
    } else {
      // Nearest NOAA station lookup (simple lon-based heuristic)
      const stations = [
        { id: "8771450", lat: 29.72, lon: -95.27 }, { id: "8760922", lat: 29.23, lon: -89.96 },
        { id: "8723214", lat: 25.73, lon: -80.16 }, { id: "8518750", lat: 40.69, lon: -74.01 },
        { id: "9414290", lat: 37.79, lon: -122.39 },{ id: "9447130", lat: 47.60, lon: -122.34 },
        { id: "8410140", lat: 43.65, lon: -70.25 }, { id: "8656483", lat: 34.72, lon: -76.70 },
      ];
      const st = stations.reduce((best, s) => Math.hypot(s.lat-lat, s.lon-lon) < Math.hypot(best.lat-lat, best.lon-lon) ? s : best);
      fetch(`/api/conditions/tides?station=${st.id}`)
        .then(r => r.json()).then(setLiveTides).catch(() => null);
    }
  }, [locCoords, waterMode]);

  const handleLocationSearch = async () => {
    const q = locationInput.trim();
    if (!q) return;
    setLocLoading(true); setLocError("");
    const result = await geocodeLocation(q);
    if (result) {
      const region = result.stateAbbr ? (stateToRegion(result.stateAbbr) || regionKeys[0]) : regionKeys[0];
      setSelectedRegion(region);
      setLocationStateAbbr(result.stateAbbr);
      setLocationLabel(result.display);
      setLocCoords({ lat: result.lat, lon: result.lon });
      try {
        localStorage.setItem("fdy_loc_label", result.display);
        localStorage.setItem("fdy_loc_state", result.stateAbbr);
        localStorage.setItem("fdy_loc_coords", JSON.stringify({ lat: result.lat, lon: result.lon }));
      } catch {}
      setFlowData(getSimulatedFlow(selectedMonth));
      if (result.stateAbbr && stateSWRegion[result.stateAbbr]) setSelectedSWRegion(stateSWRegion[result.stateAbbr]);
    } else {
      setLocError("Location not found. Try a city, zip code, or state, e.g. Houston, TX or 77001.");
    }
    setLocLoading(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { setLocError("GPS not supported. Enter a city or zip instead."); return; }
    setLocLoading(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { label, stateAbbr } = await reverseGeocode(latitude, longitude);
        if (!stateAbbr) {
          setLocError("Could not identify your state from GPS. Try typing a city or zip above.");
          setLocLoading(false);
          return;
        }
        const region = stateToRegion(stateAbbr) || regionKeys[0];
        setSelectedRegion(region);
        setLocationStateAbbr(stateAbbr);
        setLocationLabel(label);
        setLocCoords({ lat: latitude, lon: longitude });
        try {
          localStorage.setItem("fdy_loc_label", label);
          localStorage.setItem("fdy_loc_state", stateAbbr);
          localStorage.setItem("fdy_loc_coords", JSON.stringify({ lat: latitude, lon: longitude }));
        } catch {}
        setLocationInput("");
        setFlowData(getSimulatedFlow(selectedMonth));
        if (stateSWRegion[stateAbbr]) setSelectedSWRegion(stateSWRegion[stateAbbr]);
        setLocLoading(false);
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location blocked. On iPhone: tap \u2039\u203a in your browser address bar \u2192 Website Settings \u2192 Location \u2192 Allow. Or just type a city or zip above."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Location unavailable. Type a city, river, or zip code above."
            : "Location timed out. Type a city, river, or zip code above.";
        setLocError(msg);
        setLocLoading(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    );
  };

  const clearLocation = () => {
    setLocationLabel(""); setLocationInput(""); setLocationStateAbbr("");
    try { localStorage.removeItem("fdy_loc_label"); localStorage.removeItem("fdy_loc_state"); localStorage.removeItem("fdy_loc_coords"); } catch {}
    setLocCoords(null); setWeather(null); setNaturalistObs([]);
    setHatchPredictions([]); setLocError("");
    setSelectedRegion(regionKeys[0]); setSelectedSWRegion(swRegionKeys[0]);
    setFlowData(null); setRiverConditions([]);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file); setPhotoIdResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoIdentify = () => {
    if (!photoFile) return;
    setPhotoIdLoading(true); setPhotoIdResult(null);
    setTimeout(() => { setPhotoIdResult(getSimulatedPhotoId(selectedMonth)); setPhotoIdLoading(false); }, 2000);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const region = regions[selectedRegion];
  const stateInfo: StateInfo | undefined = locationStateAbbr ? getStateInfo(locationStateAbbr) : undefined;
  const hatches: HatchEvent[] = region?.hatches[selectedMonth] ?? [];
  const recommendedFlyIds = Array.from(new Set(hatches.flatMap(h => h.flies)));
  const allRecommendedFlies = recommendedFlyIds.map(id => flies[id]).filter(Boolean);
  const FREE_FLY_LIMIT = 3;
  const recommendedFlies = isPro ? allRecommendedFlies : allRecommendedFlies.slice(0, FREE_FLY_LIMIT);
  const lockedFlyCount = isPro ? 0 : Math.max(0, allRecommendedFlies.length - FREE_FLY_LIMIT);
  const topHatch = hatches.find(h => h.confidence==="high") ?? hatches[0];
  const flyKnots = selectedFly ? getKnotsForFly(selectedFly.type) : [];
  const swFlyKnots = selectedSWFly ? getKnotsForFly(selectedSWFly.type) : [];
  const dryDropperFlies = recommendedFlies.filter(f => f.rigType==="dropper"||f.type==="dry"||f.type==="emerger").slice(0,3);
  const indicatorFlies = recommendedFlies.filter(f => f.rigType==="indicator"||f.type==="nymph").slice(0,3);
  const streamerFlies = recommendedFlies.filter(f => f.rigType==="streamer_strip"||f.type==="streamer").slice(0,2);

  // Saltwater derived
  const swRegion: SWRegionData = swRegions[selectedSWRegion];
  const swStateInfo: SWStateInfo | undefined = locationStateAbbr ? getSwStateInfo(locationStateAbbr) : undefined;
  const tidalEvents: TidalEvent[] = swRegion?.tides[selectedMonth] ?? [];
  const topTidalEvent = tidalEvents[0] ?? null;
  const swFlyIds = Array.from(new Set(tidalEvents.flatMap(t => t.flies)));
  const recommendedSWFlies = swFlyIds.map(id => saltwaterFlies[id]).filter(Boolean);
  const allSWFlies = Object.values(saltwaterFlies);

  const s = {
    bg:"#EFE8D7", card:"rgba(0,0,0,0.04)", border:"rgba(160,118,58,0.22)",
    text:"#2F2B1E", muted:"rgba(37,45,30,0.72)", faint:"rgba(37,45,30,0.45)",
    amber:"#A67A3A", amberFaint:"rgba(160,118,58,0.12)",
  };
  const sw = {
    bg:"#EEF2F4", card:"#FAF8F3", border:"rgba(61,107,131,0.18)",
    accent:"#3D6B83", accentFaint:"#F2EFE8", text:"#1A2A38",
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-0 overflow-x-hidden" style={{ backgroundColor: waterMode==="salt" ? sw.bg : s.bg }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40"
        style={{ backgroundColor: "#0D1B33", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        {/* ── Logo row ── */}
        <div className="flex justify-center px-4 pt-3 pb-1">
          <Link href="/"><img src={logoImg} alt="Flydentify" className="w-auto h-auto block" style={{ maxWidth: "clamp(120px, 18vw, 240px)", filter: "brightness(0) invert(1)", cursor: "pointer" }}/></Link>
        </div>
        {/* ── Nav row: back / links / hamburger ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-2.5">
          <Link href="/"><button data-testid="button-nav-back" className="flex items-center gap-1 font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70 min-h-[36px]" style={{ color: "rgba(245,230,204,0.55)" }}>
            <ChevronLeft size={12}/><span>Home</span>
          </button></Link>
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link href="/finder"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Finder</button></Link>
            <Link href="/hatch-chart"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Hatch</button></Link>
            <Link href="/rigging"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Rigging</button></Link>
            <Link href="/conditions"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "rgba(245,230,204,0.65)" }}>Conditions</button></Link>
            <Link href="/pricing"><button className="font-['Cinzel'] text-[13px] tracking-[0.18em] uppercase transition-opacity hover:opacity-80" style={{ color: "#A67A3A" }}>Subscribe</button></Link>
          </div>
          <button className="md:hidden flex items-center justify-center w-10 h-10" onClick={() => setMobileNavOpen(v=>!v)} style={{ color: "rgba(245,230,204,0.8)" }}>
            {mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen nav ── */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9998] flex flex-col"
          style={{ backgroundColor: "#060D1A" }}
        >
          {/* Close button top-right */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-11"/>
            <img src={logoImg} alt="Flydentify" style={{ width: "clamp(100px, 40vw, 180px)", height: "auto", filter: "brightness(0) invert(1)", display: "block" }} />
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
            {!user && (
              <button
                onClick={() => { setMobileNavOpen(false); setShowAuthModal(true); }}
                className="mt-6 font-['Inter'] text-sm uppercase tracking-widest"
                style={{ color: waterMode==="salt" ? "#3D6B83" : "#A67A3A", textAlign: "left" }}
              >
                Sign in
              </button>
            )}
          </div>

        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} defaultMode={user?"login":"register"}/>}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)}/>}

      {/* ── Directions Modal ─────────────────────────────────────────── */}
      {dirModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          style={{ backgroundColor:"rgba(0,0,0,0.65)" }}
          onClick={(e) => { if (e.target===e.currentTarget) { setDirModal(null); setDirOriginCoords(null); setDirLocError(""); } }}>
          <div className="w-full max-w-sm rounded-sm p-6" style={{ backgroundColor:"#EFE8D7",border:"1px solid rgba(167,122,58,0.35)",boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-['Cormorant_Garamond'] text-base font-semibold" style={{ color:"#2F2B1E" }}>{dirModal.name}</p>
                <p className="font-['Inter'] text-sm mt-0.5" style={{ color:"#2F2B1E" }}>Would you like directions to this spot?</p>
              </div>
              <button onClick={() => { setDirModal(null); setDirOriginCoords(null); setDirLocError(""); }} className="p-1 hover:opacity-70" style={{ color:"#BAB9B4" }}><X size={16}/></button>
            </div>

            {/* Origin label + current location button */}
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-['Inter'] text-sm uppercase tracking-widest" style={{ color:"rgba(167,122,58,0.8)" }}>Starting from</label>
              <button
                onClick={() => { handleDirUseCurrentLocation(); setDirOrigin(""); }}
                disabled={dirLocLoading}
                className="flex items-center gap-1 font-['Inter'] text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: dirOriginCoords ? "#6B7A4B" : "rgba(167,122,58,0.8)" }}>
                {dirLocLoading
                  ? <><Loader2 size={11} className="animate-spin"/> Locating...</>
                  : dirOriginCoords
                    ? <><MapPin size={11}/> Location set</>
                    : <><MapPin size={11}/> Use my location</>}
              </button>
            </div>

            {/* Origin input, disabled when GPS coords are active */}
            <div className="relative mb-1">
              <input
                type="text"
                placeholder={dirOriginCoords ? "Using your GPS location" : "City, address, or landmark"}
                value={dirOriginCoords ? "" : dirOrigin}
                onChange={e => { setDirOrigin(e.target.value); setDirOriginCoords(null); setDirLocError(""); }}
                disabled={!!dirOriginCoords}
                className="w-full px-3 py-2.5 rounded-sm font-['Inter'] text-sm outline-none transition-colors"
                style={{
                  backgroundColor: dirOriginCoords ? "rgba(154,205,90,0.08)" : "rgba(120,80,20,0.12)",
                  border: dirOriginCoords ? "1px solid rgba(154,205,90,0.35)" : "1px solid rgba(167,122,58,0.25)",
                  color: dirOriginCoords ? "#6B7A4B" : "#2F2B1E",
                }}
              />
              {dirOriginCoords && (
                <button
                  onClick={() => { setDirOriginCoords(null); setDirLocError(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70"
                  style={{ color:"rgba(154,205,90,0.7)" }}>
                  <X size={12}/>
                </button>
              )}
            </div>

            {/* Error or helper text */}
            {dirLocError
              ? <p className="font-['Inter'] text-sm mb-4" style={{ color:"#e87070" }}>{dirLocError}</p>
              : <p className="font-['Inter'] text-sm mb-4" style={{ color:"#2F2B1E" }}>
                  {dirOriginCoords ? "Your GPS coordinates will be used as the starting point." : "Or tap 'Use my location' to start from where you are."}
                </p>
            }

            {/* Destination (read-only) */}
            <label className="block font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:"rgba(167,122,58,0.8)" }}>Destination</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm mb-5" style={{ backgroundColor:"rgba(120,80,20,0.08)",border:"1px solid rgba(167,122,58,0.15)" }}>
              <MapPin size={12} style={{ color:"#A67A3A" }}/>
              <span className="font-['Inter'] text-sm" style={{ color:"#2F2B1E" }}>{dirModal.name}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setDirModal(null); setDirOriginCoords(null); setDirLocError(""); }}
                className="flex-1 flex items-center justify-center font-['Cinzel'] uppercase transition-opacity hover:opacity-70"
                style={{ padding:"11px 0", borderRadius:999, fontSize:12, letterSpacing:"0.18em", fontWeight:600, border:"1px solid rgba(13,27,51,0.2)", color:"#0D1B33", backgroundColor:"transparent", cursor:"pointer" }}>
                Cancel
              </button>
              <a
                href={(() => {
                  const origin = dirOriginCoords
                    ? `${dirOriginCoords.lat},${dirOriginCoords.lng}`
                    : dirOrigin.trim() || "";
                  const dest = dirModal.lat && dirModal.lng
                    ? `${dirModal.lat},${dirModal.lng}`
                    : encodeURIComponent(dirModal.name);
                  return `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}&destination=${dest}&travelmode=driving`;
                })()}
                target="_blank" rel="noopener noreferrer"
                onClick={() => { setDirModal(null); setDirOriginCoords(null); setDirLocError(""); }}
                className="flex-1 py-2.5 rounded-sm font-['Inter'] text-sm uppercase tracking-widest text-center transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ backgroundColor:"#A67A3A",color:"#EFE8D7" }}>
                <MapPin size={12}/> Open Directions
              </a>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-2 sm:pt-3 pb-8 sm:pb-10">

        {/* ── Fresh / Salt toggle ──────────────────────────────────────── */}
        <WaterModeToggle mode={waterMode} onChange={(m) => {
          setWaterMode(m);
          if (m==="salt" && locationStateAbbr && stateSWRegion[locationStateAbbr]) setSelectedSWRegion(stateSWRegion[locationStateAbbr]);
        }}/>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-8 w-fit" style={{ borderBottom:`1px solid ${s.border}` }}>
          <button onClick={() => setActiveTab("finder")} className="px-5 py-2.5 text-sm font-['Inter'] tracking-wide transition-all min-h-[44px] border-b-2"
            style={{
              borderBottomColor: activeTab==="finder" ? (waterMode==="salt"?sw.accent:s.amber) : "transparent",
              color: activeTab==="finder" ? s.text : "rgba(37,45,30,0.55)",
              fontWeight: activeTab==="finder" ? 600 : 400,
              boxShadow: activeTab==="finder" ? "0 1px 0 rgba(0,0,0,0.02)" : "none",
            }}>
            {waterMode==="salt" ? "Saltwater Finder" : "Fly Finder"}
          </button>
          <button data-testid="button-photo-id-tab" onClick={() => setActiveTab("photo_id")} className="px-5 py-2.5 text-sm font-['Inter'] tracking-wide transition-all flex items-center gap-2 min-h-[44px] border-b-2"
            style={{
              borderBottomColor: activeTab==="photo_id" ? (waterMode==="salt"?sw.accent:s.amber) : "transparent",
              color: activeTab==="photo_id" ? s.text : "rgba(37,45,30,0.55)",
              fontWeight: activeTab==="photo_id" ? 600 : 400,
            }}>
            <Camera size={13}/> Identify a Bug
            <span className="text-sm px-1.5 py-0.5 rounded-sm font-['Inter']" style={{ backgroundColor:"rgba(180,40,20,0.6)",color:"#ffcbb0",fontSize:"9px" }}>BETA</span>
          </button>
        </div>

        {/* ── Photo ID tab ─────────────────────────────────────────────── */}
        {activeTab==="photo_id" && (
          <div className="mb-12">
            <div className="mb-6">
              <p className="font-['Inter'] italic text-sm uppercase tracking-widest mb-2" style={{ color:s.amberFaint }}>AI Insect Identification · Beta</p>
              <h1 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl mb-2" style={{ color:s.text }}>Identify the Hatch</h1>
              <p className="font-['Inter'] text-base leading-relaxed max-w-lg" style={{ color:s.muted }}>
                Photograph the insect on your hand, a rock, or bankside vegetation. Our identification engine will match it to species and recommend the exact flies to tie on.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect}/>
                <div className="border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors"
                  style={{ borderColor:photoPreview?s.amber:"rgba(167,122,58,0.25)" }}
                  onClick={() => fileInputRef.current?.click()}>
                  {photoPreview
                    ? <><img src={photoPreview} alt="Uploaded insect" className="max-h-48 mx-auto rounded-sm object-contain mb-3"/><p className="font-['Inter'] text-sm italic" style={{ color:s.muted }}>Click to change photo</p></>
                    : <><Camera size={32} className="mx-auto mb-4" style={{ color:"rgba(180,100,20,0.5)" }}/><p className="font-['Inter'] text-sm italic mb-1" style={{ color:s.muted }}>Photograph the insect</p><p className="font-['Inter'] text-sm" style={{ color:s.faint }}>on your hand, a rock, or bankside vegetation</p></>
                  }
                </div>
                <button data-testid="button-identify-photo" onClick={handlePhotoIdentify} disabled={!photoFile||photoIdLoading}
                  className="mt-4 w-full py-3 rounded-sm font-['Inter'] text-sm tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center gap-2 min-h-[44px]"
                  style={{ backgroundColor:s.amber, color:"#fff" }}>
                  {photoIdLoading ? <><Loader2 size={14} className="animate-spin"/> Analyzing…</> : <><Camera size={14}/> Identify Insect</>}
                </button>
                <p className="mt-3 text-sm font-['Inter'] italic text-center" style={{ color:s.faint }}>AI identification is a guide. Confirm with local knowledge.</p>
              </div>
              <div>
                {!photoIdResult && !photoIdLoading && (
                  <div className="h-full flex items-center justify-center"><div className="text-center p-8">
                    <MayflyIcon size={28} color="rgba(180,100,20,0.3)" className="mx-auto mb-3"/>
                    <p className="font-['Cormorant_Garamond'] italic" style={{ color:"#2F2B1E" }}>Upload a photo to identify the hatch</p>
                    <p className="font-['Inter'] text-sm mt-2" style={{ color:"#2F2B1E" }}>Supports mayflies, stoneflies, caddis &amp; terrestrials</p>
                  </div></div>
                )}
                {photoIdLoading && (
                  <div className="h-full flex items-center justify-center"><div className="text-center p-8">
                    <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color:s.amber }}/>
                    <p className="font-['Inter'] italic text-sm" style={{ color:s.muted }}>Analyzing insect features…</p>
                  </div></div>
                )}
                {photoIdResult && (
                  <div className="rounded-sm p-5" style={{ backgroundColor:"rgba(160,118,58,0.08)", border:`1px solid ${s.border}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-['Cormorant_Garamond'] text-xl mb-0.5" style={{ color:s.text }}>{photoIdResult.name}</h3>
                        <p className="font-['Inter'] text-sm italic" style={{ color:s.muted }}>{photoIdResult.latinName}</p>
                      </div>
                      <span className="text-sm font-['Inter'] px-2.5 py-1 rounded-sm" style={{ backgroundColor:"rgba(80,120,40,0.15)",color:"#3a6b1a",border:"1px solid rgba(80,120,40,0.3)" }}>{photoIdResult.confidence}% match</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[{label:"Order",val:photoIdResult.order},{label:"Family",val:photoIdResult.family},{label:"Hook Size",val:photoIdResult.size},{label:"Coloration",val:photoIdResult.color}].map(item => (
                        <div key={item.label} className="rounded-sm p-2.5" style={{ backgroundColor:"rgba(160,118,58,0.12)",border:"1px solid rgba(160,118,58,0.18)" }}>
                          <p className="text-sm font-['Inter'] mb-0.5" style={{ color:s.muted }}>{item.label}</p>
                          <p className="font-['Inter'] text-sm font-medium" style={{ color:s.text }}>{item.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3" style={{ borderColor:s.border }}>
                      <p className="text-sm font-['Inter'] uppercase tracking-widest mb-2" style={{ color:s.muted }}>Matching Fly Patterns</p>
                      <div className="flex flex-wrap gap-2">
                        {photoIdResult.flyIds.map(fid => flies[fid] && (
                          <button key={fid} onClick={() => { setSelectedFly(flies[fid]); setActiveTab("finder"); track('fly_selected', { fly_id: fid, fly_name: flies[fid].name }); }}
                            className="text-sm px-2.5 py-1 rounded-sm font-['Inter'] transition-opacity hover:opacity-80"
                            style={{ backgroundColor:"#A67A3A",border:"1px solid rgba(120,80,20,0.4)",color:"#fff" }}>
                            {flies[fid].name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-['Inter'] italic" style={{ color:s.muted }}>※ Demo result. AI identification is a guide. Confirm with local knowledge.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Finder tab ───────────────────────────────────────────────── */}
        {activeTab==="finder" && (
          <>
            {/* Page header, video hero */}
            <div className="relative overflow-hidden rounded-sm mb-10" style={{ minHeight: 320 }}>
              <video
                key={waterMode==="salt" ? "finder-sw" : "finder-fw"}
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: waterMode==="salt" ? "brightness(0.65)" : "brightness(0.45) saturate(0.5)", objectPosition: "center 50%" }}
              >
                <source src={waterMode==="salt" ? finderWadingSwVid : finderWadingVid} type="video/mp4" />
              </video>
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)" }} />
              <div className="relative z-10 flex flex-col justify-end px-6 sm:px-10 py-10 sm:py-12" style={{ minHeight: 320 }}>
                <p className="font-['Cinzel'] text-[9px] uppercase tracking-[0.28em] mb-3" style={{ color: waterMode==="salt"?"rgba(61,107,131,0.9)":"rgba(167,122,58,0.9)" }}>
                  {waterMode==="salt" ? "Saltwater Fly Finder" : "Fly Finder"}
                </p>
                <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl leading-tight mb-3" style={{ color:"#F7F1E2", fontWeight:300, fontStyle:"italic" }}>
                  {waterMode==="salt" ? "What's biting on the flats?" : "What's hatching right now?"}
                </h1>
                <p className="font-['Inter'] text-sm sm:text-base leading-relaxed max-w-sm" style={{ color:"rgba(255,255,255,0.82)" }}>
                  {waterMode==="salt"
                    ? "Enter your coastal location for tidal bite windows, target species, and exact saltwater patterns."
                    : "Enter your location for what's on the water, which flies to tie on, and how to rig them."}
                </p>
              </div>
            </div>

            {/* Location + Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <label className="block font-['Inter'] text-sm font-medium uppercase tracking-widest mb-3" style={{ color:s.text }}>Your Location</label>
                {locationLabel ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-sm mb-3" style={{ backgroundColor:"rgba(120,80,20,0.12)",border:"1px solid rgba(167,122,58,0.35)" }}>
                    <MapPin size={14} style={{ color:s.amber }} className="shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Inter'] text-sm truncate" style={{ color:s.text }}>{locationLabel}</p>
                      <p className="font-['Inter'] text-sm italic" style={{ color:s.muted }}>
                        {waterMode==="salt" ? (swStateInfo?.name ?? swRegion.name) : (stateInfo?.name ?? region.name)}
                      </p>
                    </div>
                    <button onClick={clearLocation} className="shrink-0 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ color:s.faint }}><X size={14}/></button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color:s.muted }}/>
                      <input data-testid="input-location" type="text"
                        placeholder={waterMode==="salt" ? "Coastal city, bay, or zip…" : "Zip code, city, or river…"}
                        value={locationInput} onChange={e => setLocationInput(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && handleLocationSearch()}
                        className="w-full pl-11 pr-5 py-3 rounded-sm bg-white border border-stone-300 shadow-sm font-['Inter'] text-sm focus:outline-none transition-colors"
                        style={{ color:s.text }}/>
                    </div>
                    <button data-testid="button-location-search" onClick={handleLocationSearch} disabled={locLoading||!locationInput.trim()}
                      className="px-6 py-3 rounded-sm font-['Cinzel'] text-sm uppercase tracking-widest shadow-md transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0 min-h-[44px]"
                      style={{ backgroundColor:s.amber,color:"#fff" }}>
                      {locLoading ? <Loader2 size={14} className="animate-spin"/> : "Search"}
                    </button>
                  </div>
                )}
                <button data-testid="button-use-gps" onClick={handleGPS} disabled={locLoading}
                  className="flex items-center gap-2 text-sm font-['Inter'] transition-colors disabled:opacity-40 min-h-[44px]" style={{ color:s.muted }}>
                  {locLoading ? <Loader2 size={12} className="animate-spin"/> : <MapPin size={12}/>}
                  {locLoading ? "Detecting location..." : "Use my current location"}
                </button>
                {locError && !locationInput && (
                  <div className="mt-3 rounded-sm p-3" style={{ backgroundColor:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)" }}>
                    {locError.includes("blocked") || locError.includes("PERMISSION") ? (
                      <>
                        <p className="font-['Inter'] text-sm font-semibold mb-2" style={{ color:"#ef4444" }}>Location blocked</p>
                        <p className="font-['Inter'] text-[13px] mb-2 leading-relaxed" style={{ color:"#2F2B1E" }}>To allow location on iPhone:</p>
                        <ol className="space-y-1 mb-2">
                          {[
                            "Tap the ‹aA› icon in Safari's address bar",
                            'Tap "Website Settings"',
                            'Set Location to "Allow"',
                            'Tap "Use my current location" again'
                          ].map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold mt-0.5" style={{ backgroundColor:"rgba(239,68,68,0.15)", color:"#ef4444" }}>{i+1}</span>
                              <span className="font-['Inter'] text-[13px] leading-snug" style={{ color:"#2F2B1E" }}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </>
                    ) : (
                      <>
                        <p className="font-['Inter'] text-sm font-semibold mb-1" style={{ color:"#ef4444" }}>
                          {locError.includes("timed out") ? "GPS timed out" : locError.includes("unavailable") ? "Location unavailable" : "Location error"}
                        </p>
                        <p className="font-['Inter'] text-[13px] mb-2 leading-relaxed" style={{ color:"#2F2B1E" }}>{locError}</p>
                      </>
                    )}
                    <p className="font-['Inter'] text-[13px] italic" style={{ color:"#7A7974" }}>Or just type a city, river, or zip above.</p>
                  </div>
                )}
                {!locationLabel && !locError && !locationInput && (
                  <p className="mt-2.5 text-sm font-['Inter'] italic" style={{ color:"#BAB9B4" }}>
                    Enter a location to see hatches and flies for your water.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-['Inter'] text-sm font-medium uppercase tracking-widest mb-3" htmlFor="month-select" style={{ color:s.text }}>Month</label>
                <select id="month-select" data-testid="select-month" value={selectedMonth}
                  onChange={e => { setSelectedMonth(Number(e.target.value)); if (locationLabel) setFlowData(getSimulatedFlow(Number(e.target.value))); }}
                  className="w-full px-5 py-3 rounded-sm bg-white border border-stone-300 shadow-sm font-['Inter'] text-sm focus:outline-none appearance-none mb-4"
                  style={{ color:s.text }}>
                  {Array.from({length:12},(_,i)=>i+1).map(m => (
                    <option key={m} value={m}>{monthNames[m]}{m===currentMonth?" (Now)":""}</option>
                  ))}
                </select>
                {waterMode==="salt" && (
                  <div>
                    <label className="block font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:s.text }}>Saltwater Region</label>
                    <select data-testid="select-sw-region" value={selectedSWRegion} onChange={e => setSelectedSWRegion(e.target.value)}
                      className="w-full px-5 py-3 rounded-sm bg-white border border-stone-300 shadow-sm font-['Inter'] text-sm focus:outline-none appearance-none"
                      style={{ color:s.text }}>
                      {swRegionKeys.map(key => <option key={key} value={key}>{swRegions[key].name}</option>)}
                    </select>
                    <p className="mt-2 text-sm font-['Inter'] italic" style={{ color:s.faint }}>Notable waters: {swRegion.destinations.slice(0,3).join(", ")}</p>
                  </div>
                )}
                {waterMode==="fresh" && (
                  <div>
                    <label className="block font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:s.text }}>Freshwater Region</label>
                    <select data-testid="select-fw-region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
                      className="w-full px-5 py-3 rounded-sm bg-white border border-stone-300 shadow-sm font-['Inter'] text-sm focus:outline-none appearance-none"
                      style={{ color:s.text }}>
                      {regionKeys.map(key => <option key={key} value={key}>{regions[key].name}</option>)}
                    </select>
                    <p className="mt-2 text-sm font-['Inter'] italic" style={{ color:s.faint }}>
                      {locationLabel ? `Notable waters: ${(stateInfo?.topRivers ?? region.rivers).slice(0,3).join(", ")}` : `Notable waters: ${region.rivers.slice(0,3).join(", ")}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <hr className="w-full border-t border-stone-400 opacity-20 mb-10" />

            {/* ══ SALTWATER MODE ══════════════════════════════════════════ */}
            {waterMode==="salt" && (
              <>
                {/* Landlocked notice */}
                {locationStateAbbr && !isCoastalState(locationStateAbbr) && (
                  <div className="mb-8 rounded-sm p-5" style={{ backgroundColor:sw.card,border:sw.border }}>
                    <div className="flex items-start gap-3">
                      <Waves size={16} style={{ color:sw.accent }} className="mt-0.5 shrink-0"/>
                      <div>
                        <p className="font-['Cormorant_Garamond'] text-base mb-1" style={{ color:s.text }}>{stateInfo?.name ?? locationStateAbbr} is landlocked, showing nearest saltwater region</p>
                        <p className="font-['Inter'] text-sm italic" style={{ color:s.muted }}>Select a coastal region above or enter a coastal city for precise data.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skeleton loading state — shown during location search */}
                {locLoading && (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-3 w-2/5 rounded-sm" style={{ backgroundColor: s.border }} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1,2,3].map(n => (
                        <div key={n} className="rounded-sm overflow-hidden" style={{ border:`1px solid ${s.border}` }}>
                          <div className="h-28" style={{ backgroundColor: s.border }} />
                          <div className="p-4 space-y-2">
                            <div className="h-4 w-3/4 rounded-sm" style={{ backgroundColor: s.border }} />
                            <div className="h-3 w-full rounded-sm" style={{ backgroundColor: s.border }} />
                            <div className="h-3 w-2/3 rounded-sm" style={{ backgroundColor: s.border }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SW State info card */}
                {!locLoading && swStateInfo && (
                  <div className="mb-8 rounded-sm p-5 relative overflow-hidden" style={{ backgroundColor:sw.card,border:`1px solid rgba(61,107,131,0.35)` }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(61,107,131,0.5),transparent)" }}/>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Waves size={16} style={{ color:sw.accent }}/>
                        <h2 className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:s.text }}>Saltwater Fly Fishing, {swStateInfo.name}</h2>
                      </div>
                      <a href={swStateInfo.licenseUrl} target="_blank" rel="noopener noreferrer"
                        className="font-['Inter'] text-sm underline transition-opacity hover:opacity-70 flex items-center gap-1" style={{ color:sw.accent }}>
                        <ExternalLink size={10}/>License
                      </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:sw.accent }}>Top Destinations</p>
                        <ul className="space-y-1">
                          {swStateInfo.topDestinations.map((d,i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor:sw.accent }}/>
                              <span className="font-['Inter'] text-sm" style={{ color:s.text }}>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:sw.accent }}>Target Species</p>
                        <div className="flex flex-wrap gap-4 mb-3">
                          {swStateInfo.targetSpecies.map((sp,i) => (
                            <button key={i} className="flex flex-col items-center gap-2 text-left focus:outline-none" style={{ width:80 }}
                              onClick={() => setActiveFishSheet(activeFishSheet === sp ? null : sp)}
                            >
                              <div className="relative overflow-hidden rounded-sm" style={{ width:96, height:64, backgroundColor:"#060D1A", border: activeFishSheet===sp ? "2px solid #3080A8" : "2px solid transparent", transition:"border-color 0.15s" }}>
                                {fishPortraits[sp]
                                  ? <img src={fishPortraits[sp]} alt={sp} className="w-full h-full object-contain p-1" style={{ opacity:0.97 }}/>
                                  : <div className="w-full h-full" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}/>
                                }
                              </div>
                              <span className="font-['Cormorant_Garamond'] italic text-sm text-center leading-tight" style={{ color: activeFishSheet===sp ? "#3D6B83" : s.text }}>{sp}</span>
                            </button>
                          ))}
                        </div>
                        {/* Fish info sheet — slides in below portraits when tapped */}
                        {activeFishSheet && swStateInfo.targetSpecies.includes(activeFishSheet) && (() => {
                          const FISH_NOTES: Record<string,{latin:string,tip:string}> = {
                            "Redfish":{latin:"Sciaenops ocellatus",tip:"Tailing fish are most visible on a rising tide over shallow grass. Cast 3 ft ahead, short strips."},
                            "Red Drum":{latin:"Sciaenops ocellatus",tip:"Tailing fish are most visible on a rising tide over shallow grass. Cast 3 ft ahead, short strips."},
                            "Spotted Seatrout":{latin:"Cynoscion nebulosus",tip:"Work seagrass edges at first light. Topwater poppers at dawn; switch to soft plastics by 9am."},
                            "Flounder":{latin:"Paralichthys lethostigma",tip:"Ambush feeders. Drift a crab or shrimp pattern slowly along channel edges and drop-offs."},
                            "Tarpon":{latin:"Megalops atlanticus",tip:"Follow the daisy chain. Lead a rolling fish by 10 ft, strip once, then stop. The take is a freight train."},
                            "Tarpon (seasonal)":{latin:"Megalops atlanticus",tip:"Follow the daisy chain. Lead a rolling fish by 10 ft, strip once, then stop. The take is a freight train."},
                            "Bonefish":{latin:"Albula vulpes",tip:"Cast 6-8 ft ahead of a tailing bone. Two short strips, then let it drop — the eat happens on the pause."},
                            "Permit":{latin:"Trachinotus falcatus",tip:"One of fly fishing's toughest targets. Present a crab fly directly in front, then strip it away to trigger the chase."},
                            "Sheepshead":{latin:"Archosargus probatocephalus",tip:"Barnacle crushers. Fish small crab or shrimp flies dead-drift near structure — they're picky but bite hard."},
                            "Snook":{latin:"Centropomus undecimalis",tip:"Fish mangrove edges at dawn. Strip fast to trigger reaction bites; slow down in cooler water."},
                            "Striped Bass":{latin:"Morone saxatilis",tip:"Match the bait — use large deceivers in the surf, smaller patterns in estuaries. Follow feeding birds."},
                            "Bluefish":{latin:"Pomatomus saltatrix",tip:"Blues destroy flies. Use wire tippet or heavy fluorocarbon. Poppers in the surf produce explosive surface strikes."},
                            "Cobia":{latin:"Rachycentron canadum",tip:"Sight-cast to cobia following rays. Present a large bucktail or Clouser directly in front and strip fast."},
                            "Spanish Mackerel":{latin:"Scomberomorus maculatus",tip:"Speed matters. Use a fast strip with a small Clouser or deceiver. Wire bite tippet prevents bite-offs."},
                            "False Albacore":{latin:"Euthynnus alletteratus",tip:"Cast ahead of the blitz, not into it. A fast, steady strip with an epoxy Albie fly works best."},
                          };
                          const info = FISH_NOTES[activeFishSheet];
                          const img = fishPortraits[activeFishSheet];
                          return (
                            <div className="mb-3 p-3 rounded-sm" style={{ backgroundColor:"rgba(61,107,131,0.07)", border:"1px solid rgba(61,107,131,0.2)", animation:"fadeIn 0.2s ease" }}>
                              <div className="flex items-start gap-3">
                                {img && <img src={img} alt={activeFishSheet} className="rounded-sm object-contain flex-shrink-0" style={{ width:72, height:48, backgroundColor:"#0d1a26" }}/>}
                                <div className="flex-1 min-w-0">
                                  <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:"#2F2B1E" }}>{activeFishSheet}</p>
                                  {info && <p className="font-['Inter'] text-sm italic mb-1" style={{ color:"rgba(26,34,44,0.5)" }}>{info.latin}</p>}
                                  {info && <p className="font-['Inter'] text-sm leading-relaxed" style={{ color:"#2F2B1E" }}>{info.tip}</p>}
                                  <a href="/#/hatch-chart" className="font-['Cinzel'] text-[13px] uppercase tracking-widest mt-2 inline-block" style={{ color:"#3D6B83" }}>Hatch calendar &rarr;</a>
                                </div>
                                <button onClick={() => setActiveFishSheet(null)} className="text-sm flex-shrink-0" style={{ color:"#3D6B83" }}>✕</button>
                              </div>
                            </div>
                          );
                        })()}
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:sw.accent }}>Peak season</p>
                        <p className="font-['Inter'] text-sm" style={{ color:s.text }}>
                          {swStateInfo.bestMonths.map(m => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3" style={{ borderTop:"1px solid rgba(61,107,131,0.2)" }}>
                      <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:sw.accent }}>Tidal Notes</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {swStateInfo.tideNotes.map((n,i) => (
                          <span key={i} className="font-['Inter'] text-sm px-2 py-0.5 rounded-sm" style={{ backgroundColor:"#F2EFE8",color:s.muted,border:`1px solid ${sw.border}` }}>{n}</span>
                        ))}
                      </div>
                      <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:s.muted }}>{swStateInfo.quickTip}</p>
                    </div>
                  </div>
                )}

                {/* Tidal bite windows */}
                {tidalEvents.length > 0 ? (
                  <>
                    {/* Top tidal banner */}
                    {topTidalEvent && (
                      <div className="relative overflow-hidden rounded-sm mb-10" style={{ backgroundColor:sw.card,border:`1px solid rgba(61,107,131,0.4)` }}>
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(61,107,131,0.6),transparent)" }}/>
                        <div className="p-6 sm:p-8">
                          {/* Portrait + meta row */}
                          <div className="flex items-start gap-5 mb-5">
                            {fishPortraits[topTidalEvent.commonName] && (
                              <div className="shrink-0 w-28 h-16 sm:w-40 sm:h-24 rounded-sm overflow-hidden" style={{ border:"1px solid rgba(61,107,131,0.25)" }}>
                                <img src={fishPortraits[topTidalEvent.commonName]} alt={topTidalEvent.commonName} className="w-full h-full object-cover object-center" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm px-2.5 py-1 rounded-sm font-['Inter'] tracking-wide" style={{
                                  backgroundColor:topTidalEvent.confidence==="high"?"rgba(61,107,131,0.40)":"rgba(60,80,100,0.4)",
                                  color:topTidalEvent.confidence==="high"?"#fff":"rgba(240,242,244,0.85)",
                                }}>
                                  {topTidalEvent.confidence==="high"?"Prime window":topTidalEvent.confidence==="medium"?"Good chance":"Sporadic"}
                                </span>
                                <span className="text-sm font-['Inter'] uppercase tracking-widest" style={{ color:s.faint }}>{monthNames[selectedMonth]}</span>
                              </div>
                              <h2 className="font-['Cormorant_Garamond'] text-2xl mb-0.5" style={{ color:s.text }}>{topTidalEvent.commonName}</h2>
                              <p className="font-['Inter'] italic text-sm" style={{ color:s.faint }}>{topTidalEvent.species} · {topTidalEvent.season}</p>
                            </div>
                          </div>
                          <p className="font-['Inter'] text-sm leading-relaxed mb-5" style={{ color:"#2F2B1E" }}>{topTidalEvent.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                            {[
                              {icon:<Waves size={12}/>,label:"Best tide",val:topTidalEvent.peakTide},
                              {icon:<Thermometer size={12}/>,label:"Water temp",val:topTidalEvent.waterTemp},
                              {icon:<Clock size={12}/>,label:"Season",val:topTidalEvent.season},
                            ].map(si => (
                              <div key={si.label} className="rounded-sm p-3" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}>
                                <div className="flex items-center gap-1.5 text-sm mb-1 font-['Inter']" style={{ color:sw.accent }}>{si.icon} {si.label}</div>
                                <p className="font-['Inter'] text-sm font-medium" style={{ color:s.text }}>{si.val}</p>
                              </div>
                            ))}
                          </div>
                          <div className="pl-4" style={{ borderLeft:"2px solid #3080A8" }}>
                            <p className="text-sm font-['Inter'] italic leading-relaxed" style={{ color:"#2F2B1E" }}>
                              <strong className="not-italic font-medium" style={{ color:s.text }}>What to look for, </strong>{topTidalEvent.lookFor}
                            </p>
                          </div>
                          {topTidalEvent.tip && (
                            <div className="mt-4 p-3 rounded-sm flex gap-2.5" style={{ backgroundColor:"#F2EFE8",border:`1px solid ${sw.border}` }}>
                              <Info size={13} style={{ color:sw.accent }} className="mt-0.5 shrink-0"/>
                              <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:s.muted }}>{topTidalEvent.tip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* All tidal events */}
                    {tidalEvents.length > 1 && (
                      <div className="mb-10">
                        <h2 className="font-['Cormorant_Garamond'] text-lg mb-5 pb-2" style={{ color:s.text,borderBottom:"1px solid rgba(61,107,131,0.2)" }}>
                          {monthNames[selectedMonth]} Bite Windows, {swRegion.name}
                        </h2>
                        <div className="space-y-2">
                          {tidalEvents.map((evt,i) => (
                            <div key={i} className="rounded-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                              style={{ backgroundColor:s.card,border:`1px solid ${sw.border}` }}>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {fishPortraits[evt.commonName] ? (
                                  <div className="shrink-0 w-10 h-7 rounded-sm overflow-hidden" style={{ border:"1px solid rgba(61,107,131,0.2)" }}>
                                    <img src={fishPortraits[evt.commonName]} alt={evt.commonName} className="w-full h-full object-cover object-center" />
                                  </div>
                                ) : (
                                  <span className="shrink-0 w-2 h-2 rounded-full mt-0.5" style={{
                                    backgroundColor:evt.confidence==="high"?"#3D6B83":evt.confidence==="medium"?"#7c7060":"#4a4035"
                                  }}/>
                                )}
                                <div className="min-w-0">
                                  <p className="font-['Cormorant_Garamond'] text-sm" style={{ color:s.text }}>{evt.commonName}</p>
                                  <p className="font-['Inter'] text-sm italic" style={{ color:s.faint }}>{evt.peakTide} · {evt.waterTemp}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 shrink-0">
                                {evt.flies.slice(0,3).map(fid => saltwaterFlies[fid] && (
                                  <button key={fid} onClick={() => setSelectedSWFly(saltwaterFlies[fid])}
                                    className="text-sm px-2.5 py-1 rounded-sm font-['Inter'] transition-colors min-h-[44px]"
                                    style={{ backgroundColor:"rgba(61,107,131,0.15)",border:`1px solid ${sw.border}`,color:"#1A2A38" }}>
                                    {saltwaterFlies[fid].name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-sm p-16 text-center mb-10" style={{ border:`1px solid ${sw.border}` }}>
                    <Waves size={32} className="mx-auto mb-4" style={{ color:"rgba(61,107,131,0.3)" }}/>
                    <p className="font-['Cormorant_Garamond'] text-xl italic mb-2" style={{ color:s.muted }}>No tidal bite data for {monthNames[selectedMonth]}.</p>
                    <p className="font-['Inter'] text-sm" style={{ color:s.faint }}>Try an adjacent month or switch regions above.</p>
                  </div>
                )}



                {/* ── Saltwater destinations map — Esri satellite + hydrology + labels ── */}
                {(() => {
                  const swDestCoords: Record<string, { lat: number; lng: number; name: string; species?: string }[]> = {
                    texas_coast: [
                      { lat: 26.48, lng: -97.22, name: "Lower Laguna Madre", species: "Redfish, Seatrout" },
                      { lat: 27.30, lng: -97.35, name: "Baffin Bay", species: "Trophy Seatrout" },
                      { lat: 27.85, lng: -97.08, name: "Redfish Bay", species: "Redfish, Seatrout" },
                      { lat: 28.09, lng: -97.05, name: "Aransas Bay", species: "Redfish, Flounder" },
                      { lat: 28.71, lng: -95.97, name: "Matagorda Bay", species: "Redfish, Tarpon" },
                      { lat: 30.00, lng: -93.85, name: "Sabine Lake", species: "Redfish" },
                    ],
                    gulf_coast_flats: [
                      { lat: 29.52, lng: -89.40, name: "Louisiana Marsh", species: "Redfish, Speckled Trout" },
                      { lat: 29.38, lng: -89.95, name: "Barataria Bay (LA)", species: "Redfish, Drum" },
                      { lat: 30.41, lng: -87.22, name: "Pensacola Bay (FL)", species: "Redfish, Trout" },
                      { lat: 29.65, lng: -85.37, name: "Apalachicola Flats", species: "Redfish, Flounder" },
                      { lat: 30.34, lng: -89.09, name: "Mississippi Sound", species: "Redfish, Speckled Trout" },
                      { lat: 30.28, lng: -87.68, name: "Mobile Bay (AL)", species: "Redfish, Flounder" },
                    ],
                    florida_keys: [
                      { lat: 25.75, lng: -80.33, name: "Biscayne Bay", species: "Bonefish, Tarpon, Permit" },
                      { lat: 24.92, lng: -80.63, name: "Islamorada Flats", species: "Bonefish, Permit" },
                      { lat: 24.55, lng: -81.78, name: "Key West Backcountry", species: "Tarpon, Bonefish" },
                      { lat: 24.55, lng: -82.06, name: "Marquesas Keys", species: "Permit, Bonefish" },
                      { lat: 24.63, lng: -82.87, name: "Dry Tortugas", species: "Permit, Tuna" },
                      { lat: 25.02, lng: -80.75, name: "Florida Bay", species: "Redfish, Tarpon" },
                    ],
                    florida_west_coast: [
                      { lat: 27.33, lng: -82.73, name: "Charlotte Harbor", species: "Snook, Redfish" },
                      { lat: 26.93, lng: -82.06, name: "Gasparilla Sound", species: "Snook, Redfish" },
                      { lat: 28.02, lng: -82.82, name: "Tampa Bay", species: "Snook, Redfish" },
                      { lat: 29.07, lng: -83.05, name: "Crystal River Flats", species: "Redfish, Trout" },
                      { lat: 29.72, lng: -84.98, name: "St. Marks Flats", species: "Redfish" },
                    ],
                    striper_coast: [
                      { lat: 41.38, lng: -71.47, name: "Narragansett Bay (RI)", species: "Striped Bass, Bluefish" },
                      { lat: 41.60, lng: -70.61, name: "Cape Cod (MA)", species: "Striped Bass, Bluefish" },
                      { lat: 40.91, lng: -73.08, name: "Montauk (NY)", species: "Striped Bass, False Albacore" },
                      { lat: 38.98, lng: -76.46, name: "Chesapeake Bay", species: "Striped Bass, Weakfish" },
                      { lat: 35.54, lng: -75.46, name: "Outer Banks (NC)", species: "Striped Bass, Drum" },
                      { lat: 43.65, lng: -70.25, name: "Kennebec River (ME)", species: "Striped Bass" },
                    ],
                    pacific_inshore: [
                      { lat: 34.00, lng: -119.20, name: "Channel Islands", species: "Yellowtail, Calico" },
                      { lat: 47.65, lng: -122.38, name: "Puget Sound", species: "Salmon, Searun Cutthroat" },
                      { lat: 37.50, lng: -122.50, name: "San Francisco Bay", species: "Striped Bass, Halibut" },
                      { lat: 33.55, lng: -117.85, name: "Orange County Kelp", species: "Yellowtail, Halibut" },
                      { lat: 46.25, lng: -124.05, name: "Columbia River Estuary", species: "Salmon, Sturgeon" },
                    ],
                    carolina_inshore: [
                      { lat: 35.54, lng: -75.46, name: "Outer Banks (NC)", species: "Red Drum, Flounder" },
                      { lat: 34.23, lng: -77.95, name: "Cape Fear (NC)", species: "Red Drum, Speckled Trout" },
                      { lat: 32.73, lng: -80.52, name: "ACE Basin (SC)", species: "Red Drum" },
                      { lat: 31.14, lng: -81.42, name: "Golden Isles (GA)", species: "Red Drum, Flounder" },
                    ],
                  };
                  const swAccessPoints: Record<string, { lat: number; lng: number; name: string; type?: string; fee?: string }[]> = {
                    texas_coast: [
                      { lat: 26.07, lng: -97.16, name: "Adolph Thomae Jr. Park", type: "Boat ramp", fee: "$5/day" },
                      { lat: 27.52, lng: -97.30, name: "Bob Hall Pier", type: "Walk-in wade", fee: "Free" },
                      { lat: 27.83, lng: -97.09, name: "Redfish Bay State Scientific Area", type: "Wade access", fee: "Free" },
                      { lat: 28.09, lng: -96.99, name: "Rockport Beach Park", type: "Kayak launch", fee: "$5" },
                      { lat: 28.67, lng: -96.01, name: "Matagorda Bay Nature Park", type: "Boat ramp", fee: "$3" },
                    ],
                    gulf_coast_flats: [
                      { lat: 29.93, lng: -90.04, name: "Shell Beach Ramp (LA)", type: "Boat ramp", fee: "Free" },
                      { lat: 29.52, lng: -89.57, name: "Venice Marina Ramp", type: "Boat ramp", fee: "$10" },
                      { lat: 30.35, lng: -87.16, name: "Pensacola Bayou Chico Ramp", type: "Boat ramp", fee: "Free" },
                      { lat: 30.28, lng: -87.56, name: "Fairhope Public Pier", type: "Wade access", fee: "Free" },
                    ],
                    florida_keys: [
                      { lat: 25.47, lng: -80.46, name: "John Pennekamp State Park Ramp", type: "Boat ramp", fee: "$6" },
                      { lat: 24.91, lng: -80.72, name: "Whale Harbor Ramp", type: "Boat ramp", fee: "$15" },
                      { lat: 24.55, lng: -81.80, name: "Stock Island Ramp", type: "Boat ramp", fee: "$10" },
                      { lat: 25.07, lng: -80.91, name: "Flamingo Ramp (Everglades NP)", type: "Kayak/skiff", fee: "$15 park fee" },
                    ],
                    florida_west_coast: [
                      { lat: 27.33, lng: -82.58, name: "Placida Ramp (Charlotte Harbor)", type: "Boat ramp", fee: "Free" },
                      { lat: 28.01, lng: -82.78, name: "Gandy Bridge Causeway Access", type: "Wade access", fee: "Free" },
                      { lat: 29.07, lng: -83.07, name: "Crystal River Preserve Ramp", type: "Kayak launch", fee: "Free" },
                    ],
                    striper_coast: [
                      { lat: 41.32, lng: -71.36, name: "Watch Hill Public Ramp", type: "Boat ramp", fee: "$15" },
                      { lat: 41.68, lng: -70.30, name: "Chatham Fish Pier", type: "Surf/wade", fee: "Free" },
                      { lat: 40.67, lng: -73.86, name: "Montauk State Park Ramp", type: "Boat ramp", fee: "$10" },
                    ],
                    pacific_inshore: [
                      { lat: 37.75, lng: -122.51, name: "Coyote Point Ramp (SF Bay)", type: "Boat ramp", fee: "$8" },
                      { lat: 47.57, lng: -122.35, name: "Leschi Park Ramp (Puget Sound)", type: "Kayak launch", fee: "Free" },
                      { lat: 46.24, lng: -123.92, name: "Port of Astoria Ramp", type: "Boat ramp", fee: "$10" },
                    ],
                    carolina_inshore: [
                      { lat: 35.07, lng: -76.69, name: "Oriental Town Ramp", type: "Boat ramp", fee: "Free" },
                      { lat: 33.88, lng: -77.99, name: "Masonboro Island Wade Access", type: "Wade access", fee: "Free" },
                      { lat: 32.82, lng: -79.97, name: "Folly Beach Ramp", type: "Kayak launch", fee: "$5" },
                    ],
                  };
                  const swAccessPts = swAccessPoints[selectedSWRegion] ?? [];
                  const swAccessIcon = () => L.divIcon({
                    className: "",
                    html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer"><div style="width:14px;height:14px;border-radius:50%;background:#4F46E5;border:2.5px solid rgba(255,255,255,0.95);box-shadow:0 1px 6px rgba(79,70,229,0.55)"></div></div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  });
                  const swMapDests = swDestCoords[selectedSWRegion] ?? [];
                  if (!swMapDests.length) return null;
                  const swMapCenter = swMapDests.reduce((acc, d) => ({ lat: acc.lat + d.lat / swMapDests.length, lng: acc.lng + d.lng / swMapDests.length }), { lat: 0, lng: 0 });
                  const swIcon = (focused: boolean) => L.divIcon({
                    className: "",
                    html: `<div style="width:${focused?28:22}px;height:${focused?38:30}px;position:relative"><svg width="100%" height="100%" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19S22 19 22 11C22 5 17 0 11 0z" fill="${focused?"#2DD4F0":"#3D6B83"}" stroke="#0D1B33" stroke-width="1.5"/><circle cx="11" cy="11" r="4" fill="#EEF2F4"/></svg></div>`,
                    iconSize: [focused?28:22, focused?38:30],
                    iconAnchor: [focused?14:11, focused?38:30],
                    popupAnchor: [0, focused?-38:-30],
                  });
                  const zoomLevel = selectedSWRegion==="florida_keys" ? 8 : selectedSWRegion==="pacific_inshore" ? 5 : selectedSWRegion==="striper_coast" ? 6 : selectedSWRegion==="carolina_inshore" ? 7 : 7;
                  return (
                    <div className="mb-10 rounded-sm overflow-hidden" style={{ border:`1px solid ${sw.border}`, isolation:"isolate", zIndex:0, position:"relative" }}>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: sw.card }}>
                        <div className="flex items-center gap-2">
                          <CompassRoseIcon size={16} color={sw.accent}/>
                          <div>
                            <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Destinations</h2>
                            <p className="font-['Inter'] text-[13px] leading-none mt-0.5" style={{ color:s.faint }}>{swRegion.name} · {swMapDests.length} spots · tap a chip to zoom</p>
                          </div>
                        </div>

                      </div>

                      {/* Map */}
                      <div style={{ height: 420, position:"relative" }}>
                        <MapContainer
                          key={`sw-${selectedSWRegion}`}
                          center={[swMapCenter.lat, swMapCenter.lng]}
                          zoom={zoomLevel}
                          style={{ height:"100%", width:"100%" }}
                          zoomControl={true}
                          attributionControl={false}
                        >
                          {/* OpenStreetMap standard — no API key required, global coverage */}
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            subdomains="abc"
                            maxZoom={19}
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                          />
                          {/* Fly-to controller: zooms map when chip is tapped */}
                          <MapFlyTo dest={swFocusedDest} zoom={zoomLevel} />
                          {/* Destination markers — open popup when chip selects them */}
                          {swMapDests.map((dest, i) => {
                            const isFocused = swFocusedDest?.name === dest.name;
                            return (
                              <Marker key={i} position={[dest.lat, dest.lng]}
                                icon={swIcon(isFocused)}
                              >
                                <Popup>
                                  <div style={{ fontFamily:"Lora,serif", fontSize:13, minWidth:180, padding:4 }}>
                                    <p style={{ fontFamily:"Cormorant Garamond, serif", fontWeight:700, marginBottom:6, fontSize:15, color:"#1A2A38" }}>{dest.name}</p>
                                    {dest.species && (
                                      <p style={{ fontSize:12, color:"#3D6B83", marginBottom:6, fontWeight:600 }}>What&apos;s biting: {dest.species}</p>
                                    )}
                                    <p style={{ fontSize:13, color:"#7A7974" }}>{swRegion.name}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}
                          {/* SW access point dot markers — indigo #4F46E5 */}
                          {swAccessPts.map((ap, i) => (
                            <Marker key={`sw-ap-${i}`} position={[ap.lat, ap.lng]}
                              icon={swAccessIcon()}
                              eventHandlers={{ click: () => setActiveSWAccessPoint({ name: ap.name, species: ap.type ? `${ap.type}${ap.fee ? " · " + ap.fee : ""}` : undefined }) }}
                            />
                          ))}
                        </MapContainer>

                        {/* Map legend overlay — bottom left */}
                        <div style={{ position:"absolute", bottom:8, left:8, zIndex:999, pointerEvents:"none" }}>
                          <div className="rounded-sm px-2.5 py-2" style={{ backgroundColor:"rgba(13,31,45,0.85)", backdropFilter:"blur(4px)" }}>
                            <p className="font-['Inter'] text-[9px] uppercase tracking-widest mb-1.5" style={{ color:"rgba(240,242,244,0.6)" }}>Fishing spots</p>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <svg width="12" height="16" viewBox="0 0 22 30" fill="none"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19S22 19 22 11C22 5 17 0 11 0z" fill="#3D6B83" stroke="#0D1B33" strokeWidth="1.5"/><circle cx="11" cy="11" r="4" fill="#EEF2F4"/></svg>
                              <span className="font-['Inter'] text-[13px]" style={{ color:"#EEF2F4" }}>Fishing spot</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div style={{ width:12, height:12, borderRadius:"50%", background:"#4F46E5", border:"2px solid rgba(255,255,255,0.9)", flexShrink:0 }} />
                              <span className="font-['Inter'] text-[13px]" style={{ color:"#EEF2F4" }}>Access point</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SW Access point info popup */}
                      {activeSWAccessPoint && (
                        <div style={{ position:"absolute", top:12, right:12, zIndex:1000, maxWidth:220, pointerEvents:"all" }}>
                          <div className="rounded-sm p-3" style={{ backgroundColor:"#0D1B33", boxShadow:"0 4px 20px rgba(0,0,0,0.45)", border:"1px solid rgba(245,230,204,0.15)" }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug" style={{ color:"rgba(245,230,204,0.95)" }}>{activeSWAccessPoint.name}</p>
                              <button onClick={() => setActiveSWAccessPoint(null)} className="shrink-0" style={{ color:"rgba(245,230,204,0.4)", fontSize:14, lineHeight:1 }}>✕</button>
                            </div>
                            {activeSWAccessPoint.species && <p className="font-['Inter'] text-[13px]" style={{ color:"#3D6B83" }}>Target: {activeSWAccessPoint.species}</p>}
                            <p className="font-['Inter'] text-[11px] mt-1.5" style={{ color:"rgba(245,230,204,0.45)" }}>Public access</p>
                          </div>
                        </div>
                      )}

                      {/* Destination chips — tap to zoom map + open popup */}
                      <div className="px-4 py-3 flex flex-wrap gap-2" style={{ backgroundColor: sw.card, borderTop:`1px solid ${sw.border}` }}>
                        {swMapDests.map((dest, i) => {
                          const isFocused = swFocusedDest?.name === dest.name;
                          return (
                            <button key={i}
                              onClick={() => setSwFocusedDest(isFocused ? null : { lat: dest.lat, lng: dest.lng, name: dest.name })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-sm font-['Inter'] text-sm transition-all min-h-[44px]"
                              style={{
                                backgroundColor: isFocused ? sw.accent : sw.accentFaint,
                                border: `1px solid ${isFocused ? sw.accent : sw.border}`,
                                color: isFocused ? "#fff" : s.text,
                              }}
                            >
                              <MapPin size={10} style={{ color: isFocused ? "#fff" : sw.accent }}/>
                              {dest.name}
                              {dest.species && <span className="opacity-60 text-[13px] ml-1 hidden sm:inline">· {dest.species}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Plan a Trip CTA */}
                      <div className="px-4 py-3" style={{ backgroundColor: sw.card, borderTop:`1px solid rgba(61,107,131,0.08)` }}>
                        <button
                          data-testid="button-plan-trip-sw-from-map"
                          onClick={() => setShowTripDossier(true)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-['Inter'] text-sm font-medium uppercase tracking-widest transition-all hover:opacity-90"
                          style={{ backgroundColor:"rgba(61,107,131,0.08)", border:"1px solid rgba(61,107,131,0.35)", color:"#3D6B83" }}
                        >
                          <Backpack size={13}/> Plan a trip for {locationLabel || swRegion.name}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Destinations */}
                {swRegion.destinations.length > 0 && (
                  <div className="mb-10 rounded-sm overflow-hidden" style={{ border:`1px solid ${sw.border}` }}>
                    <div className="flex items-center gap-2 px-5 py-3" style={{ backgroundColor:sw.card }}>
                      <CompassRoseIcon size={16} color={sw.accent}/>
                      <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Directions to destinations</h2>
                    </div>
                    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ backgroundColor:sw.card }}>
                      {swRegion.destinations.map((dest,i) => (
                        <button key={i}
                          onClick={() => { setDirModal({ name: dest, lat: 0, lng: 0 }); setDirOrigin(""); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors group text-left w-full"
                          style={{ backgroundColor:sw.accentFaint,border:`1px solid ${sw.border}` }}>
                          <MapPin size={13} style={{ color:sw.accent }} className="shrink-0"/>
                          <p className="font-['Cormorant_Garamond'] text-sm leading-snug flex-1" style={{ color:s.text }}>{dest}</p>
                          <span className="font-['Inter'] text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:sw.accent }}>Directions</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Weather (works for both) */}
                {locCoords && <div className="mb-8"><WeatherWidget conditions={weather} loading={weatherLoading}/></div>}

                {/* ── Tier 2: Live stream / tide conditions strip ──────────────── */}
                {locCoords && waterMode === "salt" && liveTides && !liveTides.error && (
                  <div className="mb-8 rounded-sm px-4 py-3 flex flex-wrap items-center gap-4" style={{ backgroundColor: "rgba(61,107,131,0.08)", border: "1px solid rgba(61,107,131,0.2)" }}>
                    <a href="https://tidesandcurrents.noaa.gov" target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-[13px] uppercase tracking-widest hover:underline" style={{ color: "rgba(61,107,131,0.6)" }}>Live tides · NOAA CO-OPS</a>
                    <div className="flex items-center gap-1.5">
                      <Waves size={13} style={{ color: "#3D6B83" }} />
                      <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: s.text }}>{liveTides.current_stage}</span>
                    </div>
                    {liveTides.next_tide_time && (
                      <span className="font-['Inter'] text-sm" style={{ color: s.muted }}>Next: {liveTides.next_tide_time} {liveTides.next_tide_height != null ? `· ${liveTides.next_tide_height.toFixed(1)} ft ${liveTides.next_tide_type ?? ""}` : ""}</span>
                    )}
                    <span className="font-['Inter'] text-sm italic flex-1" style={{ color: s.muted }}>{liveTides.advisory}</span>
                    <a href="/#/conditions" onClick={e=>{e.preventDefault();window.location.hash="/conditions";}} className="font-['Inter'] text-[13px] uppercase tracking-widest" style={{ color: "#3D6B83" }}>Full forecast →</a>
                  </div>
                )}

                {/* ── Tidal conditions ──────────────────────────────────────────── */}
                {locationLabel && (
                  <div className="mb-10 border-b border-stone-200 py-6 px-6" style={{ backgroundColor: "#FAF8F3" }}>
                    <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:sw.accent }}>Local Conditions</p>
                    <div className="flex items-center gap-2 mb-4"><Waves size={15} color={sw.accent}/>
                      <h2 className="font-['Cormorant_Garamond'] text-base font-medium" style={{ color:s.text }}>Tidal conditions</h2>
                      <span className="text-sm font-['Inter'] italic" style={{ color:s.faint }}>(estimated)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="rounded-sm p-3" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}>
                        <p className="text-sm font-['Inter'] mb-1" style={{ color:s.faint }}>Tide stage</p>
                        <p className="font-['Cormorant_Garamond'] text-lg" style={{ color:s.text }}>Incoming · mid</p>
                      </div>
                      <div className="rounded-sm p-3" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}>
                        <p className="text-sm font-['Inter'] mb-1" style={{ color:s.faint }}>Wind</p>
                        <div className="flex items-center gap-1.5"><Waves size={13} style={{ color:sw.accent }}/><p className="font-['Cormorant_Garamond'] text-lg" style={{ color:s.text }}>SSW 12 kts</p></div>
                      </div>
                      <div className="rounded-sm p-3" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}>
                        <p className="text-sm font-['Inter'] mb-1" style={{ color:s.faint }}>Water temp</p>
                        <div className="flex items-center gap-1.5"><Thermometer size={13} style={{ color:sw.accent }}/><p className="font-['Cormorant_Garamond'] text-lg" style={{ color:s.text }}>78°F</p></div>
                      </div>
                    </div>
                    <div className="rounded-sm p-3 flex gap-2" style={{ backgroundColor:"rgba(61,107,131,0.14)",border:"1px solid rgba(61,107,131,0.2)" }}>
                      <Info size={13} style={{ color:sw.accent }} className="mt-0.5 shrink-0"/>
                      <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:"#BAB9B4" }}>Estimated from nearest NOAA CO-OPS station · may vary by location</p>
                    </div>
                  </div>
                )}

                {/* ── Bite intelligence ────────────────────────────── */}
                {locationLabel && (() => {
                  const bitePredictions: Array<{ species: string; status: string; confidence: number }> = [
                    { species: "Redfish", status: "Incoming tide", confidence: 78 },
                    { species: "Spotted Seatrout", status: "Early morning", confidence: 65 },
                    { species: "Tarpon", status: "Slack tide", confidence: 45 },
                    { species: "Snook", status: "Dusk outgoing", confidence: 55 },
                  ];
                  return (
                    <div className="mb-8 bg-white border-b border-stone-200 py-6 px-6">
                      <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:sw.accent }}>Forecast</p>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-['Cormorant_Garamond'] text-base font-medium" style={{ color:s.text }}>Bite intelligence</h2>
                      </div>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color:"#BAB9B4", fontSize:13 }}>Based on tide phase, moon, water temp, and seasonal patterns</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bitePredictions.map((pred,i) => (
                          <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-sm" style={{
                            backgroundColor: i===0 ? "rgba(61,107,131,0.14)" : "#FAF8F3",
                            border:`1px solid ${i===0 ? "rgba(61,107,131,0.35)" : "rgba(61,107,131,0.08)"}`
                          }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:s.text }}>{pred.species}</p>
                                <span className="font-['Inter'] text-sm px-1.5 py-0.5 rounded-sm" style={{
                                  backgroundColor: i===0 ? "#3D6B83" : "rgba(61,107,131,0.2)",
                                  color: i===0 ? "#fff" : s.text, fontWeight: i===0 ? 700 : 400
                                }}>{pred.status.toUpperCase()}</span>
                              </div>
                              <p className="font-['Inter'] text-sm italic" style={{ color:s.text }}>{pred.status}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-['Inter'] text-sm font-semibold" style={{ color:sw.accent }}>{pred.confidence}%</p>
                              <p className="font-['Inter'] text-sm" style={{ color:s.text }}>confidence</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* ── "Tap the Flat" intelligence card ─────────────────────── */}
                <hr className="w-full border-t border-stone-400 opacity-20 mb-10" />

                {/* Tie These On — saltwater */}
                {!locationLabel ? (
                  <div className="rounded-sm p-12 text-center mb-10" style={{ border:`1px solid ${sw.border}` }}>
                    <Waves size={32} className="mx-auto mb-4" style={{ color:"rgba(61,107,131,0.3)" }}/>
                    <p className="font-['Cormorant_Garamond'] text-lg italic mb-2" style={{ color:s.muted }}>Where are you fishing?</p>
                    <p className="font-['Inter'] text-sm" style={{ color:s.faint }}>Enter a location above to see tides, fly recommendations, and rigging for your saltwater.</p>
                  </div>
                ) : recommendedSWFlies.length > 0 && (
                  <div className="mb-10">
                    <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:sw.accent }}>Fly Box</p>
                    <h2 className="font-['Cormorant_Garamond'] text-lg pb-2 border-b mb-2" style={{ color:s.text,borderColor:"rgba(61,107,131,0.2)" }}>Tie These On</h2>
                    <p className="font-['Inter'] text-sm italic mb-6 mt-2" style={{ color:s.faint }}>
                      Patterns most likely to produce in {monthNames[selectedMonth]}, {swRegion.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendedSWFlies.map((fly, swIdx) => (
                        <div key={fly.id} className="group overflow-hidden relative border-b"
                          style={{
                            backgroundColor:"#F0F4F7",
                            borderColor: swIdx === 0 ? "#3D6B83" : "rgba(61,107,131,0.25)",
                            borderBottomWidth: swIdx === 0 ? 2 : 1,
                          }}>
                          {/* HOT RIGHT NOW badge for top fly */}
                          {swIdx === 0 && (
                            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 z-10"
                              style={{ backgroundColor:"#3D6B83" }}>
                              <span className="font-['Inter'] text-[13px] uppercase tracking-[0.2em] font-semibold" style={{ color:"#fff" }}>
                                Hot right now
                              </span>
                              <span className="font-['Inter'] text-[13px] font-semibold" style={{ color:"rgba(255,255,255,0.85)" }}>
                                Top confidence
                              </span>
                            </div>
                          )}
                          {/* Spacer when HOT badge is shown */}
                          {swIdx === 0 && <div style={{ height: 28 }} />}
                          <button data-testid={`card-sw-fly-top-${fly.id}`}
                            onClick={() => { setSelectedSWFly(fly); track('fly_selected', { fly_id: fly.id, fly_name: fly.name }); }}
                            className="w-full text-left">
                            <div className="h-32 flex items-center justify-center p-3 relative overflow-hidden" style={{ backgroundColor:"#E8EFF4" }}>
                              {flyImages[fly.id] ? (
                                <img src={flyImages[fly.id]} alt={fly.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"/>
                              ) : (
                                <>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity:0.07 }}>
                                    <Waves size={88} color="rgba(61,107,131,0.15)"/>
                                  </div>
                                  <Waves size={30} color="rgba(61,107,131,0.18)"/>
                                </>
                              )}
                            </div>
                            <div className="p-4" style={{ backgroundColor:"#F0F4F7" }}>
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <h3 className="font-['Cormorant_Garamond'] italic text-base leading-snug text-[#2F2B1E]">{fly.name}</h3>
                                <span className={`text-sm px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0 font-['Inter'] ${getSwFlyTypeBadgeClass(fly.type)}`}>{getSwFlyTypeLabel(fly.type)}</span>
                              </div>
                              <p className="font-['Inter'] text-sm leading-relaxed mb-3 line-clamp-2" style={{ color:"#1A2A38" }}>{fly.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-['Inter'] italic" style={{ color:"#1A2A38" }}>{fly.hook}</span>
                                <span className="text-sm font-['Inter'] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:"#3D6B83" }}>Details →</span>
                              </div>
                            </div>
                          </button>
                          <div className="px-4 pb-3" style={{ backgroundColor:"#F0F4F7" }}>
                            <SaveToKitButton flyId={fly.id} flyName={fly.name} flyType={fly.type} rigging={fly.rigging} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ── Catch intel (hyper-local intel) ───────────────────────── */}
                {locationLabel && (() => {
                  const swCatchEntries = [
                    { species: "Redfish", size: "24 in", place: "Bull Bay", fly: "Weedless Shrimp", cond: "Incoming tide", when: "10 hrs ago", upvotes: 4 },
                    { species: "Tarpon", size: "80 lb", place: "Boca Grande", fly: "Tarpon Toad", cond: "Slack tide", when: "2 days ago", upvotes: 11 },
                  ];
                  return (
                    <div className="mb-8 rounded-sm p-4" style={{ backgroundColor:sw.card,border:"1px solid rgba(61,107,131,0.2)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-['Inter'] text-sm uppercase tracking-widest" style={{ color:sw.accent }}>Catch intel</span>
                        <Link href="/reports">
                          <span className="font-['Inter'] text-sm underline cursor-pointer" style={{ color:"#BAB9B4" }}>All reports</span>
                        </Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        {swCatchEntries.map((c,i) => (
                          <div key={i} className="flex items-center gap-3 flex-wrap">
                            <span className="font-['Inter'] text-sm" style={{ color:"#1A2A38" }}>{c.species} · {c.size} · {c.place}</span>
                            <span className="font-['Inter'] text-sm italic" style={{ color:"#BAB9B4" }}>on a {c.fly}</span>
                            <span className="font-['Inter'] text-sm" style={{ color:"#BAB9B4" }}>{c.cond}</span>
                            <span className="text-[13px] px-1.5 py-0.5 rounded-sm font-['Inter']" style={{ backgroundColor:"rgba(61,107,131,0.15)",color:sw.accent }}>{c.upvotes} upvotes</span>
                            <span className="text-[13px] font-['Inter'] ml-auto" style={{ color:"#BAB9B4" }}>{c.when}</span>
                          </div>
                        ))}
                      </div>
                      <Link href="/reports">
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity" style={{ borderColor:"rgba(61,107,131,0.15)" }}>
                          <span className="font-['Inter'] text-sm" style={{ color:sw.accent }}>+ Log your catch</span>
                          <span className="font-['Inter'] text-sm" style={{ color:"#BAB9B4" }}>help build the intel</span>
                        </div>
                      </Link>
                    </div>
                  );
                })()}

                <hr className="w-full border-t border-stone-400 opacity-20 mb-10" />

                {/* All SW flies */}
                <div className="mb-10">
                  <h2 className="font-['Cormorant_Garamond'] text-lg mb-2 pb-3 border-b" style={{ color:s.text,borderColor:"rgba(61,107,131,0.2)" }}>The Saltwater Fly Box</h2>
                  <p className="font-['Inter'] text-sm mb-5 italic" style={{ color:s.muted }}>16 essential saltwater patterns, from the flats to the surf.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allSWFlies.map(fly => (
                      <button key={fly.id} data-testid={`card-all-sw-fly-${fly.id}`}
                        onClick={() => { setSelectedSWFly(fly); track('fly_selected', { fly_id: fly.id, fly_name: fly.name }); }}
                        className="rounded-sm cursor-pointer transition-all text-left overflow-hidden"
                        style={{ backgroundColor:sw.card,border:`1px solid ${sw.border}` }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor="rgba(61,107,131,0.45)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor=sw.border)}>
                        {flyImages[fly.id] ? (
                          <div className="w-full overflow-hidden" style={{ aspectRatio:"4/3", background:"#1a2230" }}>
                            <img src={flyImages[fly.id]} alt={fly.name}
                              className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105" />
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-center" style={{ aspectRatio:"4/3", backgroundColor:"rgba(61,107,131,0.08)" }}>
                            <FlyBoxIcon size={28} color="rgba(61,107,131,0.3)" />
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-['Cormorant_Garamond'] text-sm leading-snug mb-0.5" style={{ color:s.text }}>{fly.name}</h3>
                          <p className="font-['Inter'] text-sm italic" style={{ color:"#1A2A38" }}>{fly.imitates}</p>
                          <p className="text-sm font-['Inter'] mt-0.5" style={{ color:"#1A2A38" }}>{fly.hook}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Bite reports near you ─────────────────────────── */}
                {locationLabel && locationStateAbbr && (
                  <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:sw.card,border:`1px solid ${sw.border}` }}>
                    <h2 className="font-['Cormorant_Garamond'] text-lg mb-1" style={{ color:s.text }}>Bite reports near you</h2>
                    <p className="font-['Inter'] text-sm italic mb-4" style={{ color:"#BAB9B4" }}>Community catch reports for this area.</p>
                    <button
                      className="px-4 py-2 rounded-sm font-['Inter'] text-sm uppercase tracking-widest mb-4"
                      style={{ backgroundColor:"transparent", border:`1px solid ${sw.accent}`, color:sw.accent }}
                    >
                      Report a bite
                    </button>
                    <div className="rounded-sm p-3" style={{ backgroundColor:"rgba(255,255,255,0.5)", border:`1px solid rgba(61,107,131,0.15)` }}>
                      <p className="font-['Inter'] text-sm" style={{ color:s.text }}>Snook · Mangrove edge · 3 hrs ago · Incoming tide</p>
                    </div>
                  </div>
                )}

                {/* Plan a Trip — above shops and guides */}
                {locationLabel && (
                  <div className="mb-8">
                    <button
                      data-testid="button-plan-trip-sw-pre-guides"
                      onClick={() => setShowTripDossier(true)}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-sm font-['Cormorant_Garamond'] text-base font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{ backgroundColor: "#3D6B83", color: "#fff" }}
                    >
                      <Backpack size={18}/> Plan a Trip for {locationLabel}
                    </button>
                    <p className="text-center font-['Inter'] text-sm italic mt-2" style={{ color: "rgba(26,42,56,0.55)" }}>Full rig setup, fly selection, guides, and fly shops</p>
                  </div>
                )}

                {/* Local shops (saltwater) */}
                {locationStateAbbr && (() => {
                  const shops = getShopsForState(locationStateAbbr).length ? getShopsForState(locationStateAbbr) : getShopsForRegion(selectedRegion);
                  if (!shops.length) return null;
                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:sw.card,border:`1px solid ${sw.border}` }}>
                      <div className="flex items-center gap-2 mb-1"><FlyBoxIcon size={16} color={sw.accent}/>
                        <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Local Fly Shops, {swStateInfo?.name ?? swRegion.name}</h2>
                      </div>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color:s.faint }}>Shops with local saltwater intel</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {shops.map((shop,i) => (
                          <div key={i} className="rounded-sm p-4 flex flex-col" style={{ backgroundColor:sw.accentFaint,border:`1px solid ${sw.border}` }}>
                            <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug mb-0.5" style={{ color:s.text }}>{shop.name}</p>
                            <p className="font-['Inter'] text-sm mb-2" style={{ color:s.faint }}>{shop.city}, {shop.state}</p>
                            <p className="font-['Inter'] text-sm italic leading-snug mb-3" style={{ color:"#2F2B1E" }}>{shop.notes}</p>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-['Inter'] text-sm italic" style={{ color:"rgba(61,107,131,0.85)" }}>Tell them Flydentify hooked you up.</p>
                              <img src={logoImg} alt="Flydentify" style={{ height:"14px", width:"auto", filter:"brightness(0) saturate(100%) invert(38%) sepia(60%) saturate(400%) hue-rotate(170deg) brightness(90%)", opacity:0.5 }} />
                            </div>
                            <div className="flex items-center gap-3 pt-2" style={{ borderTop:`1px solid ${sw.border}` }}>
                              <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm font-['Inter'] hover:opacity-70" style={{ color:s.faint }}><Phone size={11}/>{shop.phone}</a>
                              <a href={shop.website} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm font-['Inter'] underline hover:opacity-70 ml-auto" style={{ color:sw.accent }}><ExternalLink size={11}/>Visit ↗</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Local guides (saltwater) */}
                {locationStateAbbr && (() => {
                  const guides = getGuidesForState(locationStateAbbr).length ? getGuidesForState(locationStateAbbr) : getGuidesForRegion(selectedRegion);
                  if (!guides?.length) return null;
                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:sw.card,border:`1px solid ${sw.border}` }}>
                      <div className="flex items-center gap-2 mb-1"><CreelIcon size={16} color={sw.accent}/>
                        <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Local Guides, {swStateInfo?.name ?? swRegion.name}</h2>
                      </div>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color:s.faint }}>Vetted saltwater outfitters</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {guides.map((g,i) => (
                          <div key={i} className="rounded-sm p-4" style={{ backgroundColor:sw.accentFaint,border:`1px solid ${sw.border}`, gridColumn: (i === guides.length - 1 && guides.length % 2 !== 0) ? "1 / -1" : undefined }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div><p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:s.text }}>{g.name}</p><p className="font-['Inter'] text-sm" style={{ color:s.faint }}>{g.location}</p></div>
                              <span className="shrink-0 font-['Inter'] text-sm font-semibold" style={{ color:"#1A2A38" }}>{g.priceRange}</span>
                            </div>
                            <p className="font-['Inter'] text-sm italic leading-snug mb-2" style={{ color:"#2F2B1E" }}>{g.notes}</p>
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-['Inter'] text-sm italic" style={{ color:"rgba(61,107,131,0.85)" }}>Tell them Flydentify hooked you up.</p>
                              <img src={logoImg} alt="Flydentify" style={{ height:"14px", width:"auto", filter:"brightness(0) saturate(100%) invert(38%) sepia(60%) saturate(400%) hue-rotate(170deg) brightness(90%)", opacity:0.5 }} />
                            </div>
                            <a href={g.website} target="_blank" rel="noopener noreferrer" className="text-xs font-['Inter'] underline hover:opacity-70" style={{ color:sw.accent }}>Book ↗</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* ══ FRESHWATER MODE ═════════════════════════════════════════ */}
            {waterMode==="fresh" && (
              <>
                {/* State info card */}
                {stateInfo && (
                  <div className="mb-8 rounded-sm p-5 relative overflow-hidden" style={{ backgroundColor:"rgba(37,45,30,0.05)",border:"1px solid rgba(160,118,58,0.25)" }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(167,122,58,0.5),transparent)" }}/>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><TroutIcon size={16} color={s.amber}/>
                        <h2 className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:s.text }}>Fly Fishing {stateInfo.name}</h2>
                      </div>
                      <a href={stateInfo.licenseUrl} target="_blank" rel="noopener noreferrer"
                        className="font-['Inter'] text-sm underline hover:opacity-70 flex items-center gap-1" style={{ color:s.amber }}><ExternalLink size={10}/>License</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:s.amber }}>Top Rivers</p>
                        <ul className="space-y-1">
                          {stateInfo.topRivers.map((r,i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor:s.amber }}/>
                              <span className="font-['Inter'] text-sm" style={{ color:s.text }}>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:s.amber }}>Target Species</p>
                        <div className="flex flex-wrap gap-4 mb-3">
                          {stateInfo.targetSpecies.map((sp,i) => (
                            <button key={i} className="flex flex-col items-center gap-2 text-left focus:outline-none" style={{ width:80 }}
                              onClick={() => setActiveFishSheet(activeFishSheet === sp ? null : sp)}
                            >
                              <div className="relative overflow-hidden rounded-sm" style={{ width:96, height:64, backgroundColor:"#060D1A", border: activeFishSheet===sp ? "2px solid #A0763A" : "2px solid transparent", transition:"border-color 0.15s" }}>
                                {fishPortraits[sp]
                                  ? <img src={fishPortraits[sp]} alt={sp} className="w-full h-full object-contain p-1" style={{ opacity:0.97 }}/>
                                  : <div className="w-full h-full" style={{ backgroundColor:"rgba(167,122,58,0.1)" }}/>
                                }
                              </div>
                              <span className="font-['Cormorant_Garamond'] italic text-sm text-center leading-tight" style={{ color: activeFishSheet===sp ? "#A67A3A" : s.text }}>{sp}</span>
                            </button>
                          ))}
                        </div>
                        {/* Fish info sheet — FW species */}
                        {activeFishSheet && stateInfo.targetSpecies.includes(activeFishSheet) && (() => {
                          const FW_FISH_NOTES: Record<string,{latin:string,tip:string}> = {
                            "Rainbow Trout":{latin:"Oncorhynchus mykiss",tip:"Target seams and bubble lines. Use a high-stick nymphing technique to keep fly in the strike zone longer."},
                            "Brown Trout":{latin:"Salmo trutta",tip:"Most active at dawn and dusk. Large streamers produce the biggest fish after dark in fall."},
                            "Brook Trout":{latin:"Salvelinus fontinalis",tip:"Native to cold headwaters. Small attractor dries and beadhead nymphs. Rarely refuses a well-presented fly."},
                            "Cutthroat Trout":{latin:"Oncorhynchus clarkii",tip:"Aggressive and opportunistic. Elk hair caddis or stimulator on fast water; small mayfly patterns in pools."},
                            "Steelhead":{latin:"Oncorhynchus mykiss irideus",tip:"Fish on the swing. A classic wet fly on a down-and-across presentation covers the most water efficiently."},
                            "Smallmouth Bass":{latin:"Micropterus dolomieu",tip:"Work rocky structure and current seams. Crayfish and sculpin patterns stripped erratically are deadly."},
                            "Largemouth Bass":{latin:"Micropterus salmoides",tip:"Cast poppers along weed edges at dawn. Slow retrieves near structure outproduce fast presentations."},
                            "Carp":{latin:"Cyprinus carpio",tip:"Sight-fishing only. Present a small nymph or crayfish fly directly in the feeding path, no splash."},
                            "Northern Pike":{latin:"Esox lucius",tip:"Large flashy streamers on a figure-8 retrieve at structure edges. Steel leader essential."},
                            "Walleye":{latin:"Sander vitreus",tip:"Fish deep at night near light edges. Clouser minnows on a slow sink-strip triggers strikes."},
                            "Guadalupe Bass":{latin:"Micropterus treculii",tip:"Texas-endemic. Work rocky Texas Hill Country streams with small wooly buggers and poppers."},
                          };
                          const info = FW_FISH_NOTES[activeFishSheet];
                          const img = fishPortraits[activeFishSheet];
                          return (
                            <div className="mb-3 p-3 rounded-sm" style={{ backgroundColor:"rgba(160,118,58,0.07)", border:"1px solid rgba(160,118,58,0.2)", animation:"fadeIn 0.2s ease" }}>
                              <div className="flex items-start gap-3">
                                {img && <img src={img} alt={activeFishSheet} className="rounded-sm object-contain flex-shrink-0" style={{ width:72, height:48, backgroundColor:"#060D1A" }}/>}
                                <div className="flex-1 min-w-0">
                                  <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:"#2F2B1E" }}>{activeFishSheet}</p>
                                  {info && <p className="font-['Inter'] text-sm italic mb-1" style={{ color:"rgba(26,34,44,0.5)" }}>{info.latin}</p>}
                                  {info && <p className="font-['Inter'] text-sm leading-relaxed" style={{ color:"#2F2B1E" }}>{info.tip}</p>}
                                  <a href="/#/hatch-chart" className="font-['Cinzel'] text-[13px] uppercase tracking-widest mt-2 inline-block" style={{ color:"#A67A3A" }}>Hatch calendar &rarr;</a>
                                </div>
                                <button onClick={() => setActiveFishSheet(null)} className="text-sm flex-shrink-0" style={{ color:"#A67A3A" }}>✕</button>
                              </div>
                            </div>
                          );
                        })()}
                        <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:s.amber }}>Peak season</p>
                        <p className="font-['Inter'] text-sm" style={{ color:s.text }}>{stateInfo.bestMonths.map(m=>["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]).join(", ")}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3" style={{ borderTop:"1px solid rgba(160,118,58,0.2)" }}>
                      <p className="font-['Inter'] text-sm uppercase tracking-widest mb-1.5" style={{ color:s.amber }}>Notable Hatches</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {stateInfo.hatches.map((h,i) => <span key={i} className="font-['Inter'] text-sm px-2 py-0.5 rounded-sm" style={{ backgroundColor:"rgba(120,80,20,0.08)",color:s.muted,border:"1px solid rgba(167,122,58,0.12)" }}>{h}</span>)}
                      </div>
                      <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:s.muted }}>{stateInfo.quickTip}</p>
                    </div>
                  </div>
                )}

                {/* ── River Map — Esri satellite + hydrology overlay + labels ── */}
                {locationLabel && selectedRegion && (() => {
                  const mapRivers = enrichRiversWithAccessPoints(getRiversForStateOrRegion(locationStateAbbr || undefined, selectedRegion)).filter(r=>r.lat&&r.lng);
                  if (!mapRivers.length) return null;
                  const activeRiver = focusedRiver || {
                    lat: locCoords ? locCoords.lat : mapRivers.reduce((s,r)=>s+(r.lat??0),0)/mapRivers.length,
                    lng: locCoords ? locCoords.lon : mapRivers.reduce((s,r)=>s+(r.lng??0),0)/mapRivers.length,
                    name: ""
                  };
                  const mapLabel = stateInfo ? stateInfo.name : region.name;

                  // Difficulty color map
                  const diffColors: Record<string,string> = {
                    beginner: "#6B7A4B",
                    intermediate: "#E8AF34",
                    advanced: "#E87C34",
                    expert: "#DD4444",
                  };

                  const makePinIcon = (diff: string, focused: boolean) => {
                    const fill = diffColors[diff] ?? "#A67A3A";
                    const sz: [number,number] = focused ? [28,38] : [22,30];
                    const anc: [number,number] = focused ? [14,38] : [11,30];
                    return L.divIcon({
                      className: "",
                      html: `<div style="width:${sz[0]}px;height:${sz[1]}px"><svg width="100%" height="100%" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19S22 19 22 11C22 5 17 0 11 0z" fill="${fill}" stroke="rgba(7,30,37,0.9)" stroke-width="1.5"/><circle cx="11" cy="11" r="${focused?5:4}" fill="rgba(255,255,255,0.9)"/></svg></div>`,
                      iconSize: sz,
                      iconAnchor: anc,
                      popupAnchor: [0, -sz[1]],
                    });
                  };

                  return (
                    <div className="mb-10 rounded-sm overflow-hidden" style={{ border:"1px solid rgba(167,122,58,0.25)", isolation:"isolate", zIndex:0, position:"relative" }}>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor:"rgba(37,45,30,0.05)" }}>
                        <div className="flex items-center gap-2">
                          <CompassRoseIcon size={16} color={s.amber}/>
                          <div>
                            <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>River Map</h2>
                            <p className="font-['Inter'] text-[13px] leading-none mt-0.5" style={{ color:s.faint }}>{mapLabel} · {mapRivers.length} rivers</p>
                            <p className="font-['Inter'] text-[13px] leading-none mt-0.5" style={{ color:s.faint }}>Pinch to zoom. Find streams, creeks &amp; hollows.</p>
                          </div>
                        </div>

                      </div>

                      {/* Map */}
                      <div style={{ height: 420, position:"relative" }}>
                        <MapContainer
                          key={`${activeRiver.lat}-${activeRiver.lng}`}
                          center={[activeRiver.lat, activeRiver.lng]}
                          zoom={focusedRiver ? 11 : (locCoords ? 8 : 7)}
                          style={{ height:"100%", width:"100%" }}
                          zoomControl={true}
                          attributionControl={false}
                        >
                          {/* OpenTopoMap — colorful topo with terrain shading, lets blue river overlay stand out */}
                          <TileLayer
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            maxZoom={17}
                            subdomains={["a","b","c"]}
                            attribution="Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap"
                          />
                          {/* US river network — bright blue overlay */}
                          {riverGeoJson && (
                            <GeoJSON
                              key="fw-rivers"
                              data={riverGeoJson}
                              style={{ color: "#3D6B83", weight: 2, opacity: 0.75 }}
                            />
                          )}

                          {/* River markers */}
                          {mapRivers.map((r,i) => (
                            <Marker
                              key={i}
                              position={[r.lat!, r.lng!]}
                              icon={makePinIcon(r.difficulty, focusedRiver?.name===r.name)}
                              eventHandlers={{ click: () => setFocusedRiver({ lat: r.lat!, lng: r.lng!, name: r.name }) }}
                            >
                              <Popup>
                                <div style={{ fontFamily:"Lora,serif", fontSize:13, minWidth:170, padding:2 }}>
                                  <p style={{ fontFamily:"Cormorant Garamond, serif", fontWeight:700, marginBottom:3, fontSize:14, color:"#2F2B1E" }}>{r.name}</p>
                                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                                    <span style={{ fontSize:13, color:"#7A7974" }}>{r.state} · {r.type}</span>
                                    <span style={{ fontSize:13, fontWeight:700, color: diffColors[r.difficulty] ?? "#A67A3A", textTransform:"capitalize" }}>
                                      ● {r.difficulty === "intermediate" ? "Intermediate" : r.difficulty.charAt(0).toUpperCase()+r.difficulty.slice(1)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => { setDirModal({ name: r.name, lat: r.lat!, lng: r.lng! }); setDirOrigin(""); }}
                                    style={{ background:"#A67A3A", color:"#fff", border:"none", borderRadius:2, padding:"5px 10px", fontSize:13, fontFamily:"Lora,serif", cursor:"pointer", width:"100%" }}>
                                    Get directions
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                          {/* Access point markers — navy dots with large tap target */}
                          {mapRivers.filter(r => r.accessPoints?.length).flatMap((r, ri) =>
                            (r.accessPoints ?? []).map((ap, ai) => (
                              <Marker
                                key={`ap-${ri}-${ai}`}
                                position={[ap.lat, ap.lng]}
                                zIndexOffset={1000}
                                icon={L.divIcon({
                                  className: "",
                                  html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer"><div style="width:14px;height:14px;border-radius:50%;background:#6B7A4B;border:2.5px solid rgba(255,255,255,0.95);box-shadow:0 1px 6px rgba(0,0,0,0.55)"></div></div>`,
                                  iconSize: [36, 36],
                                  iconAnchor: [18, 18],
                                  popupAnchor: [0, -20],
                                })}
                                eventHandlers={{ click: () => setActiveAccessPoint({ name: ap.name, type: ap.type, fee: ap.fee, river: r.name, accessNotes: r.accessNotes, whyFish: r.whyFish, usgsUrl: r.usgsUrl }) }}
                              />
                            ))
                          )}
                        </MapContainer>

                        {/* Difficulty legend — bottom left overlay */}
                        <div style={{ position:"absolute", bottom:8, left:8, zIndex:999, pointerEvents:"none" }}>
                          <div className="rounded-sm px-2.5 py-2" style={{ backgroundColor:"rgba(18,22,14,0.85)", backdropFilter:"blur(4px)" }}>
                            <p className="font-['Inter'] text-[9px] uppercase tracking-widest mb-1.5" style={{ color:"rgba(238,240,232,0.6)" }}>Difficulty</p>
                            {[
                              { label:"Beginner", color:"#6B7A4B" },
                              { label:"Intermediate", color:"#E8AF34" },
                              { label:"Advanced", color:"#E87C34" },
                              { label:"Expert", color:"#DD4444" },
                            ].map(d => (
                              <div key={d.label} className="flex items-center gap-1.5 mb-1 last:mb-0">
                                <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill={d.color}/></svg>
                                <span className="font-['Inter'] text-[13px]" style={{ color:"#EFE8D7" }}>{d.label}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop:"1px solid rgba(238,240,232,0.15)" }}>
                              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#6B7A4B"/></svg>
                              <span className="font-['Inter'] text-[13px]" style={{ color:"#EFE8D7" }}>Access point</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Access point info popup */}
                      {activeAccessPoint && (
                        <div style={{ position:"absolute", top:12, right:12, zIndex:1000, maxWidth:260 }}>
                          <div className="rounded-sm" style={{ backgroundColor:"#0D1B33", boxShadow:"0 4px 24px rgba(0,0,0,0.55)", border:"1px solid rgba(245,230,204,0.15)", overflow:"hidden" }}>
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2" style={{ borderBottom:"1px solid rgba(245,230,204,0.08)" }}>
                              <div>
                                <p className="font-['Inter'] text-[9px] uppercase tracking-widest mb-0.5" style={{ color:"#A67A3A" }}>Access Point</p>
                                <p className="font-['Cormorant_Garamond'] text-base font-semibold leading-snug" style={{ color:"rgba(245,230,204,0.95)" }}>{activeAccessPoint.name}</p>
                                <p className="font-['Inter'] text-[11px] mt-0.5" style={{ color:"rgba(245,230,204,0.4)" }}>{activeAccessPoint.river}</p>
                              </div>
                              <button onClick={() => setActiveAccessPoint(null)} className="shrink-0 mt-0.5" style={{ color:"rgba(245,230,204,0.4)", fontSize:16, lineHeight:1 }}>✕</button>
                            </div>
                            {/* Details */}
                            <div className="px-3 py-2.5 space-y-1.5">
                              {activeAccessPoint.type && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-['Inter'] text-[11px] uppercase tracking-widest" style={{ color:"rgba(245,230,204,0.35)" }}>Type</span>
                                  <span className="font-['Inter'] text-[13px]" style={{ color:"rgba(245,230,204,0.75)" }}>{activeAccessPoint.type}</span>
                                </div>
                              )}
                              {activeAccessPoint.fee && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-['Inter'] text-[11px] uppercase tracking-widest" style={{ color:"rgba(245,230,204,0.35)" }}>Fee</span>
                                  <span className="font-['Inter'] text-[13px] font-semibold" style={{ color:"#A67A3A" }}>{activeAccessPoint.fee}</span>
                                </div>
                              )}
                            </div>
                            {/* Access notes from River Conditions */}
                            {activeAccessPoint.accessNotes && (
                              <div className="px-3 pb-2.5" style={{ borderTop:"1px solid rgba(245,230,204,0.07)" }}>
                                <p className="font-['Inter'] text-[11px] uppercase tracking-widest mt-2 mb-1" style={{ color:"rgba(245,230,204,0.35)" }}>Conditions</p>
                                <p className="font-['Inter'] text-[12px] leading-relaxed" style={{ color:"rgba(245,230,204,0.6)" }}>{activeAccessPoint.accessNotes}</p>
                              </div>
                            )}
                            {/* Why fish */}
                            {activeAccessPoint.whyFish && (
                              <div className="px-3 pb-2.5" style={{ borderTop:"1px solid rgba(245,230,204,0.07)" }}>
                                <p className="font-['Inter'] text-[11px] uppercase tracking-widest mt-2 mb-1" style={{ color:"rgba(245,230,204,0.35)" }}>Why fish here</p>
                                <p className="font-['Inter'] text-[12px] leading-relaxed italic" style={{ color:"rgba(245,230,204,0.55)" }}>{activeAccessPoint.whyFish}</p>
                              </div>
                            )}
                            {/* USGS link */}
                            {activeAccessPoint.usgsUrl && (
                              <div className="px-3 pb-3" style={{ borderTop:"1px solid rgba(245,230,204,0.07)" }}>
                                <a href={activeAccessPoint.usgsUrl} target="_blank" rel="noopener noreferrer"
                                  className="mt-2 flex items-center gap-1 font-['Inter'] text-[11px] uppercase tracking-widest hover:opacity-100 transition-opacity"
                                  style={{ color:"#A67A3A", textDecoration:"none", opacity:0.8 }}>
                                  Live gauge data →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* River pill list */}
                      <div className="px-4 py-3 flex flex-wrap gap-2" style={{ backgroundColor:"rgba(37,45,30,0.04)", borderTop:"1px solid rgba(167,122,58,0.15)" }}>
                        {mapRivers.map((r,i) => (
                          <button
                            key={i}
                            onClick={() => setFocusedRiver({ lat: r.lat!, lng: r.lng!, name: r.name })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-['Inter'] text-sm transition-colors"
                            style={{
                              backgroundColor: focusedRiver?.name===r.name ? `${diffColors[r.difficulty]}22` : "rgba(120,80,20,0.08)",
                              border: `1px solid ${focusedRiver?.name===r.name ? diffColors[r.difficulty] : "rgba(160,118,58,0.2)"}`,
                              color: focusedRiver?.name===r.name ? diffColors[r.difficulty] : s.faint,
                            }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor: diffColors[r.difficulty] ?? "#A67A3A", display:"inline-block", flexShrink:0 }}/>
                            {r.name}
                          </button>
                        ))}
                      </div>

                      {/* Plan a Trip CTA */}
                      <div className="px-4 py-3" style={{ borderTop:"1px solid rgba(160,118,58,0.12)" }}>
                        <button
                          data-testid="button-plan-trip-fw-from-map"
                          onClick={() => setShowTripDossier(true)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-['Inter'] text-sm font-medium uppercase tracking-widest transition-all hover:opacity-90"
                          style={{ backgroundColor:"rgba(160,118,58,0.1)", border:"1px solid rgba(160,118,58,0.35)", color:"#A67A3A" }}
                        >
                          <Backpack size={13}/> Plan a trip for {locationLabel || mapLabel}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Recent Catch Reports (hyper-local intel) ─────────────────────── */}
                {recentCatches.length > 0 && (
                  <div className="mb-8 rounded-sm p-4" style={{ backgroundColor:"rgba(37,45,30,0.04)",border:"1px solid rgba(160,118,58,0.2)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-['Inter'] text-sm uppercase tracking-widest" style={{ color:s.amber }}>Recent Catches</span>
                      <Link href="/reports">
                        <span className="font-['Inter'] text-sm underline cursor-pointer" style={{ color:s.faint }}>All reports</span>
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                      {recentCatches.slice(0,5).map(c => {
                        const diff = Math.floor(Date.now()/1000 - c.createdAt);
                        const when = diff < 3600 ? `${Math.floor(diff/60)}m ago` : diff < 86400 ? `${Math.floor(diff/3600)}h ago` : `${Math.floor(diff/86400)}d ago`;
                        const condCol = {poor:"#6B7280",fair:"#D97706",good:"#059669",excellent:"#2563EB"}[c.conditions] || "#6B7280";
                        return (
                          <div key={c.id} className="flex items-center gap-3 flex-wrap">
                            <span className="font-['Inter'] text-sm" style={{ color:"#2F2B1E" }}>{c.species}</span>
                            <span className="font-['Inter'] text-sm italic" style={{ color:s.faint }}>on {c.fly}</span>
                            <span className="font-['Inter'] text-sm" style={{ color:s.faint }}>{c.river}</span>
                            <span className="text-[13px] px-1.5 py-0.5 rounded-sm font-['Inter']" style={{ backgroundColor:`${condCol}18`,color:condCol }}>{c.conditions}</span>
                            <span className="text-[13px] font-['Inter'] ml-auto" style={{ color:s.faint }}>{when}</span>
                          </div>
                        );
                      })}
                    </div>
                    <Link href="/reports">
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity" style={{ borderColor:"rgba(160,118,58,0.15)" }}>
                        <span className="font-['Inter'] text-sm" style={{ color:s.amber }}>+ Log your catch</span>
                        <span className="font-['Inter'] text-sm" style={{ color:s.faint }}>, help build the intel</span>
                      </div>
                    </Link>
                  </div>
                )}

                                {/* ── Merged: Top Rivers (live USGS) + Best Rivers (detail) ── */}
                {locationLabel && selectedRegion && (() => {
                  const detailRivers = getRiversForStateOrRegion(locationStateAbbr || undefined, selectedRegion);
                  const hasLive = riverConditions.length > 0 || riversLoading;
                  if (!detailRivers.length && !hasLive) return null;
                  // Build a CFS lookup keyed by river name (case-insensitive)
                  const cfsMap: Record<string, RiverCondition> = {};
                  riverConditions.forEach(rc => { cfsMap[rc.name.toLowerCase()] = rc; });
                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:"rgba(37,45,30,0.05)",border:"1px solid rgba(160,118,58,0.25)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <RiverIcon size={16} color={s.amber}/>
                          <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Top Rivers, {stateInfo ? stateInfo.name : region.name}</h2>
                        </div>
                        <span className="text-xs font-['Inter'] italic" style={{ color:s.faint }}>Live USGS data</span>
                      </div>
                      {riversLoading && (
                        <div className="flex items-center gap-2 py-2 mb-3" style={{ color:s.faint }}>
                          <Loader2 size={14} className="animate-spin"/>
                          <span className="font-['Inter'] text-sm italic">Fetching live conditions...</span>
                        </div>
                      )}
                      <div className="divide-y" style={{ borderTop:"1px solid rgba(160,118,58,0.15)", borderBottom:"1px solid rgba(160,118,58,0.15)" }}>
                        {detailRivers.map((r,i) => {
                          const live = cfsMap[r.name.toLowerCase()] ||
                            Object.values(cfsMap).find(rc => r.name.toLowerCase().includes(rc.name.toLowerCase().split(" ")[0]));
                          const fish = getFishability(live?.cfs ?? null, live?.tempF ?? null);
                          const isExpanded = expandedRivers.has(r.name);
                          const toggleExpand = () => setExpandedRivers(prev => {
                            const next = new Set(prev);
                            next.has(r.name) ? next.delete(r.name) : next.add(r.name);
                            return next;
                          });
                          // Stocking check
                          const freshStock = stockingData.find(se => {
                            const nameMatch = se.river.toLowerCase().includes(r.name.toLowerCase().split(" ")[0]) || r.name.toLowerCase().includes(se.river.toLowerCase().split(" ")[0]);
                            const days = Math.floor((Date.now() - new Date(se.stockDate).getTime()) / 86400000);
                            return nameMatch && days <= 14;
                          });
                          return (
                            <div key={i} style={{ borderColor:"rgba(160,118,58,0.12)" }}>
                              {/* ── Collapsed row — always visible ── */}
                              <button
                                onClick={toggleExpand}
                                className="w-full flex items-center gap-2 px-3 py-3 text-left transition-colors"
                                style={{ backgroundColor: isExpanded ? "rgba(160,118,58,0.06)" : "transparent" }}
                              >
                                {/* Fishability dot */}
                                <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fish.color }} />

                                {/* River name + state — flex-1 with min-w-0 keeps it from pushing others off */}
                                <div className="flex-1 min-w-0 pr-1">
                                  <p className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color:s.text, lineHeight:1.25 }}>{r.name}</p>
                                  <p className="font-['Inter'] text-[13px] leading-tight" style={{ color:s.faint }}>{r.state}</p>
                                </div>

                                {/* Numbers + status pill stacked vertically — fixed width so name never competes */}
                                <div className="text-right shrink-0 flex flex-col items-end gap-0.5" style={{ minWidth:80 }}>
                                  {live && live.cfs !== null ? (
                                    <>
                                      <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-none" style={{ color:s.text }}>{live.cfs.toLocaleString()} <span className="text-[13px] font-['Inter'] font-normal" style={{ color:s.faint }}>cfs</span></p>
                                      {live.tempF !== null && <p className="font-['Inter'] text-[13px] leading-none" style={{ color:s.faint }}>{live.tempF}°F</p>}
                                    </>
                                  ) : (
                                    <p className="font-['Inter'] text-[13px] italic leading-none" style={{ color:s.faint }}>No data</p>
                                  )}
                                  {/* Status pill inline under numbers */}
                                  <span className="font-['Inter'] text-[13px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm mt-0.5" style={{ backgroundColor:`${fish.color}18`, color:fish.color }}>{fish.label}</span>
                                  {freshStock && <span className="text-[9px] font-['Inter'] font-semibold px-1.5 py-0.5 rounded-sm" style={{ backgroundColor:"rgba(5,150,105,0.12)", color:"#059669" }}>Stocked</span>}
                                </div>

                                {/* Chevron */}
                                {isExpanded ? <ChevronUp size={14} style={{ color:s.faint, flexShrink:0 }}/> : <ChevronDown size={14} style={{ color:s.faint, flexShrink:0 }}/>}
                              </button>

                              {/* ── Expanded detail ── */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1" style={{ backgroundColor:"rgba(160,118,58,0.04)" }}>
                                  {/* Advisory */}
                                  {live?.advisory && (
                                    <p className="font-['Inter'] text-sm italic mb-3 leading-relaxed" style={{ color:"#2F2B1E" }}>{live.advisory}</p>
                                  )}
                                  {!live && (
                                    <p className="font-['Inter'] text-sm italic mb-3 leading-relaxed" style={{ color:s.faint }}>{r.whyFish}</p>
                                  )}
                                  {/* Hatch chips */}
                                  {r.hatchHighlights.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      {r.hatchHighlights.map((h,j) => <span key={j} className="text-[13px] font-['Inter'] px-2 py-0.5 rounded-sm" style={{ backgroundColor:"rgba(167,122,58,0.1)",color:"#2F2B1E",border:"1px solid rgba(167,122,58,0.15)" }}>{h}</span>)}
                                    </div>
                                  )}
                                  {/* Stocking detail */}
                                  {freshStock && (() => {
                                    const days = Math.floor((Date.now() - new Date(freshStock.stockDate).getTime()) / 86400000);
                                    const stockLabel = days === 0 ? "Stocked today" : days === 1 ? "Stocked yesterday" : `Stocked ${days}d ago`;
                                    return (
                                      <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-sm" style={{ backgroundColor:"rgba(5,150,105,0.1)", border:"1px solid rgba(5,150,105,0.2)" }}>
                                        <span style={{ fontSize:13, color:"#059669" }}>🐟</span>
                                        <span className="font-['Inter'] text-[13px] font-semibold" style={{ color:"#059669" }}>{stockLabel}</span>
                                        <span className="font-['Inter'] text-[13px]" style={{ color:"rgba(5,150,105,0.8)" }}>{freshStock.species}{freshStock.countStocked ? `, ${freshStock.countStocked.toLocaleString()} fish` : ""}</span>
                                        {freshStock.sourceUrl && <a href={freshStock.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-[13px] underline ml-auto" style={{ color:"#059669" }}>DNR ↗</a>}
                                      </div>
                                    );
                                  })()}
                                  {/* Access notes */}
                                  <p className="font-['Inter'] text-[13px] mb-3 leading-relaxed" style={{ color:s.faint }}><span className="font-['Cinzel'] uppercase tracking-widest" style={{ fontSize:9 }}>Access: </span>{r.accessNotes}</p>
                                  {/* Access points list */}
                                  {r.accessPoints && r.accessPoints.length > 0 && (
                                    <div className="mb-3">
                                      <p className="font-['Cinzel'] text-[9px] uppercase tracking-widest mb-1.5" style={{ color: s.amber }}>Access points</p>
                                      <div className="flex flex-col gap-1">
                                        {r.accessPoints.map((ap, api) => (
                                          <div key={api} className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm" style={{ backgroundColor:"rgba(13,27,51,0.05)", border:"1px solid rgba(13,27,51,0.1)" }}>
                                            <span style={{ width:9, height:9, borderRadius:"50%", backgroundColor:"#0D1B33", border:"2px solid rgba(167,122,58,0.7)", flexShrink:0, display:"inline-block" }}/>
                                            <div className="flex-1 min-w-0">
                                              <span className="font-['Inter'] text-[13px] font-medium" style={{ color:s.text }}>{ap.name}</span>
                                              {ap.type && <span className="font-['Inter'] text-[13px]" style={{ color:s.faint }}> · {ap.type}</span>}
                                            </div>
                                            {ap.fee && <span className="font-['Inter'] text-[13px] font-semibold shrink-0" style={{ color:"#0D1B33" }}>{ap.fee}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4">
                                    {r.usgsUrl && <a href={r.usgsUrl} target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-xs underline" style={{ color:s.amber }}>USGS Live Data ↗</a>}
                                    {r.lat && r.lng && (
                                      <button onClick={() => setFocusedRiver({ lat: r.lat!, lng: r.lng!, name: r.name })} className="flex items-center gap-1 font-['Inter'] text-sm" style={{ color:s.faint }}>
                                        <MapPin size={10}/> Map
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Live-only rivers with no detail card */}
                        {!riversLoading && riverConditions.filter(rc => !detailRivers.some(dr => dr.name.toLowerCase().includes(rc.name.toLowerCase().split(" ")[0]))).map((r,i) => {
                          const fish = getFishability(r.cfs, r.tempF);
                          return (
                            <div key={`live-${i}`} className="flex items-center gap-2 px-3 py-3" style={{ borderColor:"rgba(160,118,58,0.12)" }}>
                              <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fish.color }} />
                              <div className="flex-1 min-w-0 pr-1">
                                <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-tight" style={{ color:s.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</p>
                                <p className="font-['Inter'] text-[13px] italic leading-tight" style={{ color:s.faint, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.advisory}</p>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-0.5" style={{ minWidth:80 }}>
                                {r.cfs !== null ? (
                                  <>
                                    <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-none" style={{ color:s.text }}>{r.cfs.toLocaleString()} <span className="text-[13px] font-['Inter'] font-normal" style={{ color:s.faint }}>cfs</span></p>
                                    {r.tempF !== null && <p className="font-['Inter'] text-[13px] leading-none" style={{ color:s.faint }}>{r.tempF}°F</p>}
                                  </>
                                ) : <span className="font-['Inter'] text-[13px] italic leading-none" style={{ color:s.faint }}>No data</span>}
                                <span className="font-['Inter'] text-[13px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm mt-0.5" style={{ backgroundColor:`${fish.color}18`, color:fish.color }}>{fish.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Tier 2: Live river conditions strip ────────────────────────── */}
                {locCoords && waterMode === "fresh" && liveRiver && !liveRiver.error && (
                  <div className="mb-8 rounded-sm px-4 py-3 flex flex-wrap items-center gap-4" style={{ backgroundColor: "rgba(160,118,58,0.08)", border: "1px solid rgba(160,118,58,0.2)" }}>
                    <a href="https://waterservices.usgs.gov" target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-[13px] uppercase tracking-widest hover:underline" style={{ color: "#2F2B1E" }}>Live stream · USGS NWIS</a>
                    {liveRiver.flow_cfs != null && (
                      <div className="flex items-center gap-1.5">
                        <Droplets size={13} style={{ color: "#A67A3A" }} />
                        <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: s.text }}>{liveRiver.flow_cfs} cfs</span>
                        <span className="font-['Inter'] text-sm" style={{ color: s.muted }}>{liveRiver.wadeability}</span>
                      </div>
                    )}
                    {liveRiver.water_temp_f != null && (
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={13} style={{ color: "#A67A3A" }} />
                        <span className="font-['Cormorant_Garamond'] text-sm font-semibold" style={{ color: s.text }}>{liveRiver.water_temp_f}°F</span>
                        <span className="font-['Inter'] text-sm" style={{ color: s.muted }}>{liveRiver.temp_advisory?.split(" — ")[0]}</span>
                      </div>
                    )}
                    {liveRiver.station_name && <span className="font-['Inter'] text-sm italic flex-1" style={{ color: s.muted }}>{liveRiver.station_name}</span>}
                    <a href="/#/conditions" onClick={e=>{e.preventDefault();window.location.hash="/conditions";}} className="font-['Inter'] text-[13px] uppercase tracking-widest" style={{ color: "#A67A3A" }}>Full forecast →</a>
                  </div>
                )}
                {/* ── What’s Happening Right Here (stat cards) ──────────────── */}
                {locationLabel && (() => {
                  const topActiveHatch = hatchPredictions.find(p => p.status === "active" || p.status === "imminent") ?? hatchPredictions[0] ?? null;
                  const wadability = getWadability(flowData ? flowData.cfs : null);
                  const comfortZone = getWaterComfortZone(flowData ? flowData.tempF : null);
                  const topFlies = getTopFliesForInsect(topActiveHatch?.insect ?? null);
                  const currentHour = new Date().getHours();
                  const castingAngle = getCastingAngle(currentHour);
                  const activityForecast = getActivityForecast(topActiveHatch, flowData ? flowData.tempF : null, currentHour);
                  const accentColor = s.amber;
                  const cardBorder = "rgba(160,118,58,0.15)";
                  const chipLinks = [
                    "/#/hatch-chart",
                    "/#/conditions",
                    "/#/conditions",
                    "/#/finder",
                    "/#/rigging",
                    "/#/conditions",
                  ];
                  const chips: Array<{ icon: string; title: string; value: string; sub: string; valueColor?: string }> = [
                    {
                      icon: "🦷",
                      title: "Hatch probability",
                      value: topActiveHatch ? `${topActiveHatch.insect} · ${topActiveHatch.confidence}% ${topActiveHatch.status}` : "No active hatch",
                      sub: topActiveHatch ? topActiveHatch.latinName : "Check back during daylight hours",
                      valueColor: accentColor,
                    },
                    {
                      icon: "💧",
                      title: "CFS/flow",
                      value: flowData ? `${flowData.cfs} CFS` : "No gauge data",
                      sub: wadability.label,
                      valueColor: wadability.color,
                    },
                    {
                      icon: "🌡️",
                      title: "Water temperature",
                      value: flowData && flowData.tempF !== null ? `${flowData.tempF}°F` : "No temp data",
                      sub: comfortZone.label,
                      valueColor: comfortZone.color,
                    },
                    {
                      icon: "🪰",
                      title: "Top 3 flies right now",
                      value: topFlies[0],
                      sub: topFlies.slice(1).join(" · "),
                      valueColor: "#2F2B1E",
                    },
                    {
                      icon: "🎣",
                      title: "Casting angle",
                      value: castingAngle,
                      sub: `${currentHour}:00 local time`,
                      valueColor: "#2F2B1E",
                    },
                    {
                      icon: "⚡",
                      title: "Activity forecast",
                      value: activityForecast,
                      sub: "Next 2 hours",
                      valueColor: activityForecast === "High activity expected" ? accentColor : "#2F2B1E",
                    },
                  ];

                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor: "rgba(255,255,255,0.55)", border: `1px solid ${cardBorder}` }}>
                      <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl mb-1" style={{ color: "#2F2B1E" }}>What's happening right here</h2>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color: "#2F2B1E" }}>{locationLabel} · {monthNames[selectedMonth]}</p>

                      <div className="flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
                        {chips.map((chip, i) => (
                          <button key={i} onClick={() => { window.location.hash = chipLinks[i]; }}
                            className="shrink-0 w-[168px] rounded-sm p-3 text-left transition-opacity active:opacity-70" style={{ backgroundColor: "#FAF8F3", border: `1px solid ${cardBorder}`, cursor: "pointer" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span style={{ fontSize: 14 }}>{chip.icon}</span>
                              <span className="font-['Inter'] uppercase tracking-widest" style={{ fontSize: 13, color: "#2F2B1E" }}>{chip.title}</span>
                            </div>
                            <p className="font-['Cormorant_Garamond'] mb-0.5 leading-snug" style={{ fontSize: 16, color: chip.valueColor ?? "#2F2B1E" }}>{chip.value}</p>
                            <p className="font-['Inter'] italic leading-snug" style={{ fontSize: 13, color: "#2F2B1E" }}>{chip.sub}</p>
                          </button>
                        ))}
                      </div>

                      <div className="hidden sm:grid sm:grid-cols-3 gap-3">
                        {chips.map((chip, i) => (
                          <button key={i} onClick={() => { window.location.hash = chipLinks[i]; }}
                            className="rounded-sm p-3 text-left transition-opacity hover:opacity-80" style={{ backgroundColor: "#FAF8F3", border: `1px solid ${cardBorder}`, cursor: "pointer" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span style={{ fontSize: 14 }}>{chip.icon}</span>
                              <span className="font-['Inter'] uppercase tracking-widest" style={{ fontSize: 13, color: "#2F2B1E" }}>{chip.title}</span>
                            </div>
                            <p className="font-['Cormorant_Garamond'] mb-0.5 leading-snug" style={{ fontSize: 16, color: chip.valueColor ?? "#2F2B1E" }}>{chip.value}</p>
                            <p className="font-['Inter'] italic leading-snug" style={{ fontSize: 13, color: "#2F2B1E" }}>{chip.sub}</p>
                          </button>
                        ))}
                      </div>

                      <p className="font-['Inter'] italic mt-3" style={{ fontSize: 13, color: "rgba(37,45,30,0.4)" }}>Tap any card to explore</p>

                    </div>
                  );
                })()}

                {/* ── Tie These On (FW fly box) ──────────────────────────────── */}
                {!locationLabel ? (
                  <div className="rounded-sm p-12 text-center mb-10" style={{ border:`1px solid ${s.border}` }}>
                    <FlyIcon size={32} className="mx-auto mb-4" color="rgba(160,118,58,0.3)"/>
                    <p className="font-['Cormorant_Garamond'] text-lg italic mb-2" style={{ color:s.muted }}>Where are you fishing?</p>
                    <p className="font-['Inter'] text-sm" style={{ color:s.faint }}>Enter a location above to see hatches, fly recommendations, and rigging for your water.</p>
                  </div>
                ) : (
                <div className="mb-10">
                  <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:s.amber }}>Fly Box</p>
                  <h2 className="font-['Cormorant_Garamond'] text-lg pb-2 border-b w-full mb-2" style={{ color:s.text,borderColor:"rgba(167,122,58,0.15)" }}>Tie These On</h2>
                  <p className="font-['Inter'] text-sm italic mb-6 mt-2" style={{ color:s.faint }}>Patterns most likely to produce in {monthNames[selectedMonth]} on {region.rivers[0]} and similar water.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedFlies.map(fly => (
                      <div key={fly.id} className="group overflow-hidden relative border-b"
                        style={{ backgroundColor:"#FAF9F5",borderColor:"rgba(167,122,58,0.25)" }}>
                        <button data-testid={`card-fly-${fly.id}`}
                          onClick={() => { setSelectedFly(fly); setExpandedKnot(null); setKnotsOpen(true); track('fly_selected', { fly_id: fly.id, fly_name: fly.name }); }}
                          className="w-full text-left">
                          <div className="w-full overflow-hidden relative" style={{ aspectRatio:"1/1", backgroundColor:"#EBE7DB" }}>
                            {flyImages[fly.id] ? <img src={flyImages[fly.id]} alt={fly.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 relative z-10" style={{ filter:"sepia(0.05) contrast(1.02)" }}/> : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor:"#EBE7DB" }}><FlyIcon size={28} color="rgba(120,80,20,0.3)"/></div>}
                          </div>
                          <div className="p-4" style={{ backgroundColor:"#FAF9F5" }}>
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <h3 className="font-['Cormorant_Garamond'] italic text-base leading-snug text-[#2F2B1E]">{fly.name}</h3>
                              <span className={`text-sm px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0 font-['Inter'] ${getFlyTypeBadgeClass(fly.type)}`}>{getFlyTypeLabel(fly.type)}</span>
                            </div>
                            <p className="font-['Inter'] text-sm leading-relaxed mb-3 line-clamp-2 text-[#7A7974]">{fly.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-['Inter'] italic text-[#BAB9B4]">{fly.hook}</span>
                              <span className="text-sm font-['Inter'] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:s.amber }}>Details →</span>
                            </div>
                          </div>
                        </button>
                        <div className="px-4 pb-3" style={{ backgroundColor:"#FAF9F5" }}>
                          <SaveToKitButton flyId={fly.id} flyName={fly.name} flyType={fly.type} rigging={fly.rigging} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isPro && lockedFlyCount > 0 && (
                    <div className="mt-4 rounded-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ backgroundColor:"rgba(160,118,58,0.08)",border:"1px solid rgba(160,118,58,0.3)" }}>
                      <div>
                        <p className="font-['Cormorant_Garamond'] text-base mb-1" style={{ color:"#EFE8D7" }}>{lockedFlyCount} more {lockedFlyCount===1?"pattern":"patterns"} recommended for this hatch.</p>
                        <p className="font-['Inter'] text-sm italic" style={{ color:"rgba(238,240,232,0.75)" }}>Upgrade to Flydentify Pro to unlock the full match, $6.99/month.</p>
                      </div>
                      <button onClick={() => setShowPaywall(true)} className="shrink-0 rounded-sm px-5 py-2.5 font-['Inter'] text-sm uppercase tracking-widest transition-colors" style={{ backgroundColor:"#A67A3A",color:"#fff" }} data-testid="button-unlock-flies">Unlock All Flies</button>
                    </div>
                  )}
                </div>
                )}

                {hatchPredictions.length > 0 && (
                  <div className="mb-8 bg-white border-b border-stone-200 py-6 px-6">
                    <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:"#A67A3A" }}>Degree-Day Model</p>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-['Cormorant_Garamond'] text-base font-medium" style={{ color:"#2F2B1E" }}>Hatch Intelligence</h2>
                      <span className="font-['Inter'] text-sm italic ml-1" style={{ color:"#2F2B1E" }}>updated daily</span>
                    </div>
                    <p className="font-['Inter'] text-sm italic mb-4" style={{ color:"#2F2B1E" }}>Predicted hatch activity based on accumulated thermal units and local water temperature</p>
                    <div className="flex flex-col gap-6">
                      {hatchPredictions.filter(p=>p.status!=="weeks_away").slice(0,6).map((pred,i) => (
                        <div key={i} className="rounded-sm overflow-hidden" style={{
                          backgroundColor:pred.status==="active"?"rgba(167,122,58,0.10)":"rgba(120,80,20,0.05)",
                          border:`1px solid ${pred.status==="active"?"rgba(167,122,58,0.35)":"rgba(167,122,58,0.12)"}`
                        }}>
                          {/* ── Frame header: hatch name + status + confidence ── */}
                          <div className="flex items-center justify-between px-4 py-3" style={{
                            backgroundColor:pred.status==="active"?"rgba(167,122,58,0.18)":"rgba(120,80,20,0.10)",
                            borderBottom:`1px solid ${pred.status==="active"?"rgba(167,122,58,0.25)":"rgba(167,122,58,0.10)"}`
                          }}>
                            <div className="flex items-center gap-2">
                              <span className="font-['Cormorant_Garamond'] text-lg font-semibold" style={{ color:"#2F2B1E" }}>{pred.insect}</span>
                              <span className="font-['Inter'] text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wide" style={{
                                backgroundColor:pred.status==="active"?"#A67A3A":pred.status==="imminent"?"rgba(167,122,58,0.35)":"rgba(120,80,20,0.25)",
                                color:pred.status==="active"?"#EFE8D7":"#2F2B1E"
                              }}>{pred.status==="active"?"ACTIVE":pred.status==="imminent"?"IMMINENT":"WANING"}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-['Inter'] text-lg font-bold" style={{ color:"#A67A3A" }}>{pred.confidence}%</span>
                              <span className="font-['Inter'] text-xs" style={{ color:"rgba(47,43,30,0.65)" }}>confidence</span>
                            </div>
                          </div>
                          {/* ── Full hatch art plate ── */}
                          {hatchPlateImages[pred.insect] ? (
                            <HatchPlateLightbox
                              src={hatchPlateImages[pred.insect]}
                              alt={pred.insect}
                              hatchName={pred.insect}
                              thumbnailClass="w-full object-cover"
                              triggerStyle={{ display:"block", width:"100%" }}
                            />
                          ) : insectImages[pred.insect] ? (
                            <div className="w-full flex items-center justify-center" style={{ backgroundColor:"rgba(120,80,20,0.06)", minHeight:160 }}>
                              <img src={insectImages[pred.insect]} alt={pred.insect} className="w-full object-contain" style={{ maxHeight:220, filter:"sepia(0.15) opacity(0.92)" }}/>
                            </div>
                          ) : (
                            <div className="w-full flex items-center justify-center" style={{ backgroundColor:"rgba(120,80,20,0.06)", minHeight:120 }}>
                              <Leaf size={40} style={{ color:"rgba(167,122,58,0.3)" }}/>
                            </div>
                          )}
                          {/* ── 3-column copy strip ── */}
                          <div className="grid grid-cols-3 gap-0" style={{ borderTop:`1px solid rgba(167,122,58,0.12)` }}>
                            <div className="col-span-3 px-4 pt-3 pb-3">
                              <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:"#2F2B1E" }}>{pred.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {naturalistObs.length > 0 && (
                  <div className="mb-8 bg-white border-b border-stone-200 py-6 px-6">
                    <p className="font-['Cinzel'] text-[13px] uppercase tracking-[0.2em] mb-2" style={{ color:"#A67A3A" }}>Field Data</p>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-['Cormorant_Garamond'] text-base font-medium" style={{ color:"#2F2B1E" }}>Live Insect Sightings</h2>
                      <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="font-['Inter'] text-xs flex items-center gap-1 hover:opacity-70" style={{ color:"#2F2B1E" }}><ExternalLink size={10}/>iNaturalist</a>
                    </div>
                    <p className="font-['Inter'] text-sm italic mb-4" style={{ color:"#2F2B1E" }}>Research-grade observations within 150 km · {naturalistObs.length} recent sightings</p>
                    <div className="flex flex-wrap gap-2">
                      {getActiveOrders(naturalistObs).map((order,i) => <span key={i} className="font-['Inter'] text-sm px-3 py-1.5 rounded-sm" style={{ backgroundColor:"rgba(167,122,58,0.15)",color:"#2F2B1E",border:"1px solid rgba(167,122,58,0.3)" }}>{order}</span>)}
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {naturalistObs.slice(0,6).map((obs,i) => (
                        <a key={i} href={obs.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-sm p-2 hover:opacity-80 transition-opacity" style={{ backgroundColor:"rgba(120,80,20,0.06)",border:"1px solid rgba(167,122,58,0.08)" }}>
                          {obs.photoUrl ? <img src={obs.photoUrl} alt={obs.commonName} className="w-10 h-10 rounded-sm object-cover shrink-0"/> : <div className="w-10 h-10 rounded-sm shrink-0 flex items-center justify-center" style={{ backgroundColor:"rgba(167,122,58,0.1)" }}><span style={{ fontSize:18 }}>🪲</span></div>}
                          <div className="min-w-0">
                            <p className="font-['Inter'] text-sm font-medium truncate" style={{ color:"#2F2B1E" }}>{obs.commonName}</p>
                            <p className="font-['Inter'] text-sm truncate" style={{ color:"#2F2B1E" }}>{obs.place}</p>
                            <p className="font-['Inter'] text-sm" style={{ color:"#BAB9B4" }}>{obs.observedOn}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}


                {hatches.length===0 ? (
                  <div className="rounded-sm p-16 text-center" style={{ border:`1px solid ${s.border}` }}>
                    <p className="font-['Cormorant_Garamond'] text-xl italic mb-2" style={{ color:s.muted }}>No hatches recorded for this combination.</p>
                    <p className="font-['Inter'] text-sm" style={{ color:s.faint }}>Try an adjacent month or a different region.</p>
                  </div>
                ) : (
                  <>
                    {topHatch && (
                      <div className="relative overflow-hidden rounded-sm mb-10" style={{ backgroundColor:"#E4E7D8",border:`1px solid ${s.border}` }}>
                        <div className="absolute right-0 top-0 bottom-0 w-2/5 hidden sm:flex items-center justify-center">
                          {hatchPlateImages[topHatch.insect] ? (
                            <img src={hatchPlateImages[topHatch.insect]} alt={topHatch.insect} className="w-full h-full object-cover" style={{ position:"relative", zIndex:1 }}/>
                          ) : insectImages[topHatch.insect] ? (
                            <img src={insectImages[topHatch.insect]} alt={topHatch.insect} className="w-full h-full object-contain p-6" style={{ filter:"sepia(0.15) opacity(1.0)", position:"relative", zIndex:1 }}/>
                          ) : (
                            <div className="w-full h-full" style={{ background:"rgba(167,122,58,0.08)" }}/>
                          )}
                        </div>
                        {/* Full-width gradient fade — covers the seam between text and illustration */}
                        <div className="absolute inset-0 hidden sm:block pointer-events-none" style={{ background:"linear-gradient(to right, #E4E7D8 48%, rgba(228,231,216,0.85) 58%, rgba(228,231,216,0.3) 70%, rgba(228,231,216,0) 82%)", zIndex:2 }}/>
                        <div className="relative p-6 sm:p-8 md:max-w-[60%]" style={{ zIndex:3 }}>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm px-2.5 py-1 rounded-sm font-['Inter'] tracking-wide whitespace-nowrap" style={{ backgroundColor:topHatch.confidence==="high"?"rgba(180,100,20,0.4)":"rgba(100,80,60,0.4)",color:topHatch.confidence==="high"?"#A67A3A":"rgba(37,45,30,0.65)" }}>
                              {topHatch.confidence==="high"?"High confidence":topHatch.confidence==="medium"?"Moderate":"Sporadic"}
                            </span>
                            <span className="text-sm font-['Inter'] uppercase tracking-widest" style={{ color:s.faint }}>{monthNames[selectedMonth]}</span>
                          </div>
                          <h2 className="font-['Cormorant_Garamond'] text-2xl mb-1" style={{ color:s.text }}>{topHatch.insect}</h2>
                          <p className="font-['Inter'] italic text-sm mb-5" style={{ color:s.faint }}>{topHatch.latinName}</p>
                          <p className="font-['Inter'] text-sm leading-relaxed mb-5" style={{ color:"#2F2B1E" }}>{topHatch.description}</p>
                          {topHatch.entomologyNote && (
                            <div className="mb-5 p-3 rounded-sm flex gap-2.5" style={{ backgroundColor:"rgba(120,80,20,0.15)",border:"1px solid rgba(167,122,58,0.2)" }}>
                              <Leaf size={13} style={{ color:"rgba(180,100,20,0.8)" }} className="mt-0.5 shrink-0"/>
                              <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:"#2F2B1E" }}>{topHatch.entomologyNote}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mb-5 overflow-x-auto pb-0.5" style={{ scrollbarWidth:"none" }}>
                            {[{icon:<Clock size={12}/>,label:"Peak hatch",val:topHatch.peakTime},{icon:<Thermometer size={12}/>,label:"Water temp",val:topHatch.waterTemp},{icon:<Clock size={12}/>,label:"Duration",val:topHatch.duration}].map(si => (
                              <div key={si.label} className="rounded-sm p-2.5 shrink-0" style={{ backgroundColor:"rgba(120,80,20,0.2)", minWidth:110, maxWidth:180 }}>
                                <div className="flex items-center gap-1 text-[13px] mb-1 font-['Inter'] leading-tight" style={{ color:"#2F2B1E" }}>{si.icon} {si.label}</div>
                                <p className="font-['Inter'] text-sm font-medium leading-snug break-words whitespace-normal" style={{ color:s.text }}>{si.val}</p>
                              </div>
                            ))}
                          </div>
                          <div className="pl-4" style={{ borderLeft:`2px solid ${s.amber}` }}>
                            <p className="text-sm font-['Inter'] italic leading-relaxed" style={{ color:"#2F2B1E" }}><strong className="not-italic font-medium" style={{ color:s.text }}>What to look for, </strong>{topHatch.lookFor}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {hatches.length > 1 && (
                      <div className="mb-10">
                        <h2 className="font-['Cormorant_Garamond'] text-lg mb-5 pb-2" style={{ color:s.text,borderBottom:"1px solid rgba(167,122,58,0.15)" }}>
                          {monthNames[selectedMonth]} on the {region.rivers[0]}
                        </h2>
                        <div className="space-y-2">
                          {hatches.map((hatch,i) => (
                            <div key={i} className="rounded-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ backgroundColor:s.card,border:`1px solid ${s.border}` }}>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {hatchPlateImages[hatch.insect] ? (
                                  <div className="shrink-0 w-10 h-10 rounded-sm overflow-hidden" style={{ backgroundColor:"rgba(120,80,20,0.06)" }}>
                                    <img src={hatchPlateImages[hatch.insect]} alt={hatch.insect} className="w-full h-full object-cover"/>
                                  </div>
                                ) : insectImages[hatch.insect] ? (
                                  <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-sm overflow-hidden" style={{ backgroundColor:"rgba(120,80,20,0.1)" }}>
                                    <img src={insectImages[hatch.insect]} alt={hatch.insect} className="w-10 h-10 object-contain" style={{ filter:"sepia(0.3) opacity(1.0)" }}/>
                                  </div>
                                ) : <span className="shrink-0 w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor:hatch.confidence==="high"?s.amber:hatch.confidence==="medium"?"#7c7060":"#4a4035" }}/>}
                                <div className="min-w-0">
                                  <p className="font-['Cormorant_Garamond'] text-sm" style={{ color:s.text }}>{hatch.insect}</p>
                                  <p className="font-['Inter'] text-sm italic" style={{ color:s.faint }}>{hatch.latinName} · {hatch.peakTime}</p>
                                  {(() => {
                                    const matchPred = hatchPredictions.find(p => p.insect.toLowerCase().includes(hatch.insect.toLowerCase()) || hatch.insect.toLowerCase().includes(p.insect.toLowerCase()));
                                    if (!matchPred) return null;
                                    const barColor = s.amber;
                                    const trackColor = "rgba(160,118,58,0.15)";
                                    return (
                                      <div className="mt-1.5 max-w-[220px]">
                                        <div className="h-1 rounded-sm overflow-hidden" style={{ backgroundColor:trackColor }}>
                                          <div className="h-1 rounded-sm" style={{ width:`${matchPred.confidence}%`, background:`linear-gradient(to right, ${barColor}40, ${barColor})` }}/>
                                        </div>
                                        <p className="font-['Inter'] mt-1" style={{ fontSize:13, color:"#2F2B1E" }}>{matchPred.confidence}% confidence · {matchPred.status}</p>
                                      </div>
                                    );
                                  })()}
                                  {hatch.entomologyNote && <p className="font-['Inter'] text-sm italic mt-1 leading-relaxed" style={{ color:"#2F2B1E" }}><Leaf size={9} className="inline mr-1"/>{hatch.entomologyNote.substring(0,80)}…</p>}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 shrink-0">
                                {hatch.flies.slice(0,3).map(fid => flies[fid] && (
                                  <button key={fid} data-testid={`button-fly-${fid}`}
                                    onClick={() => { setSelectedFly(flies[fid]); setExpandedKnot(null); track('fly_selected', { fly_id: fid, fly_name: flies[fid].name }); }}
                                    className="text-sm px-2.5 py-1 rounded-sm font-['Inter'] transition-colors min-h-[44px]"
                                    style={{ backgroundColor:"rgba(120,80,20,0.2)",border:"1px solid rgba(167,122,58,0.2)",color:"#5C3510" }}>
                                    {flies[fid].name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}



                {locCoords && <div className="mb-8"><WeatherWidget conditions={weather} loading={weatherLoading}/></div>}



                <hr className="w-full border-t border-stone-400 opacity-20 mb-10" />

                    {/* All FW flies */}
                    <div className="mb-10">
                      <h2 className="font-['Cormorant_Garamond'] text-lg mb-2 pb-3 border-b" style={{ color:s.text,borderColor:"rgba(167,122,58,0.15)" }}>All freshwater patterns</h2>
                      <p className="font-['Inter'] text-sm mb-5 italic" style={{ color:s.muted }}>The essential box for any river.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.values(flies).map(fly => (
                          <button key={fly.id} data-testid={`card-all-fw-fly-${fly.id}`}
                            onClick={() => { setSelectedFly(fly); setExpandedKnot(null); setKnotsOpen(true); track('fly_selected', { fly_id: fly.id, fly_name: fly.name }); }}
                            className="rounded-sm cursor-pointer transition-all text-left overflow-hidden"
                            style={{ backgroundColor:s.card,border:`1px solid ${s.border}` }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor="rgba(160,118,58,0.45)")}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor=s.border)}>
                            {flyImages[fly.id] ? (
                              <div className="w-full overflow-hidden" style={{ aspectRatio:"4/3", backgroundColor:"#EBE7DB" }}>
                                <img src={flyImages[fly.id]} alt={fly.name}
                                  className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105" style={{ filter:"sepia(0.05) contrast(1.02)" }} />
                              </div>
                            ) : (
                              <div className="w-full flex items-center justify-center" style={{ aspectRatio:"4/3", backgroundColor:"rgba(160,118,58,0.08)" }}>
                                <FlyIcon size={28} color="rgba(160,118,58,0.3)" />
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-start justify-between mb-0.5 gap-2">
                                <h3 className="font-['Cormorant_Garamond'] text-sm leading-snug" style={{ color:s.text }}>{fly.name}</h3>
                              </div>
                              <span className={`text-sm px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0 inline-block font-['Inter'] ${getFlyTypeBadgeClass(fly.type)}`}>{getFlyTypeLabel(fly.type)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>


                    {locationLabel && (
                      <div className="mb-8">
                        <button
                          data-testid="button-plan-a-trip"
                          onClick={() => setShowTripDossier(true)}
                          className="w-full flex items-center justify-center gap-3 py-4 rounded-sm font-['Cormorant_Garamond'] text-base font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.99]"
                          style={{ backgroundColor:"#A67A3A", color:"#fff" }}
                        >
                          <Backpack size={18}/>
                          Plan a Trip
                        </button>
                        <p className="text-center font-['Inter'] text-sm italic mt-2" style={{ color:s.faint }}>Full rig setup, fly selection, guides, and fly shops for {locationLabel}</p>
                      </div>
                    )}



                {locationLabel && selectedRegion && (() => {
                  const shops = locationStateAbbr ? (getShopsForState(locationStateAbbr).length?getShopsForState(locationStateAbbr):getShopsForRegion(selectedRegion)) : getShopsForRegion(selectedRegion);
                  if (!shops.length) return null;
                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:"rgba(37,45,30,0.05)",border:"1px solid rgba(160,118,58,0.25)" }}>
                      <div className="flex items-center gap-2 mb-1"><FlyBoxIcon size={16} color={s.amber}/>
                        <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Local Fly Shops, {stateInfo?stateInfo.name:region.name}</h2>
                      </div>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color:s.faint }}>Independent shops with local intel for this region</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {shops.map((shop,i) => (
                          <div key={i} className="rounded-sm p-4 flex flex-col" style={{ backgroundColor:"rgba(120,80,20,0.08)",border:"1px solid rgba(167,122,58,0.12)" }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug" style={{ color:s.text }}>{shop.name}</p>
                                <p className="font-['Inter'] text-sm" style={{ color:s.faint }}>{shop.city}, {shop.state}</p>
                              </div>
                            </div>
                            <p className="font-['Inter'] text-sm italic leading-snug mb-3" style={{ color:"#2F2B1E" }}>{shop.notes}</p>
                            <div className="flex flex-wrap gap-1 mb-3">{shop.rivers.slice(0,3).map((r,j)=><span key={j} className="text-sm font-['Inter'] px-1.5 py-0.5 rounded-sm" style={{ backgroundColor:"rgba(167,122,58,0.1)",color:"#2F2B1E" }}>{r}</span>)}</div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-['Inter'] text-sm italic" style={{ color:"rgba(160,118,58,0.95)" }}>Tell them Flydentify hooked you up.</p>
                              <img src={logoImg} alt="Flydentify" style={{ height:"14px", width:"auto", filter:"brightness(0) saturate(100%) invert(52%) sepia(40%) saturate(500%) hue-rotate(10deg) brightness(85%)", opacity:0.45 }} />
                            </div>
                            <div className="flex items-center gap-3 pt-2" style={{ borderTop:"1px solid rgba(167,122,58,0.1)" }}>
                              <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm font-['Inter'] hover:opacity-70" style={{ color:s.faint }}><Phone size={11}/>{shop.phone}</a>
                              <div className="flex items-center gap-2 ml-auto">
                                <button onClick={() => { setDirModal({ name: shop.name, lat: 0, lng: 0 }); setDirOrigin(""); }} className="flex items-center gap-1 text-sm font-['Inter'] hover:opacity-70 transition-opacity" style={{ color:s.faint }}><MapPin size={11}/>Directions</button>
                                {shop.website && shop.website !== "#" && (
                                  <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-['Inter'] underline hover:opacity-70" style={{ color:s.amber }}><ExternalLink size={11}/>Visit ↗</a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {selectedRegion && (() => {
                  const guides = locationStateAbbr ? (getGuidesForState(locationStateAbbr).length?getGuidesForState(locationStateAbbr):getGuidesForRegion(selectedRegion)) : getGuidesForRegion(selectedRegion);
                  if (!guides?.length) return null;
                  return (
                    <div className="mb-10 rounded-sm p-5" style={{ backgroundColor:"rgba(37,45,30,0.05)",border:"1px solid rgba(160,118,58,0.25)" }}>
                      <div className="flex items-center gap-2 mb-1"><CreelIcon size={16} color={s.amber}/>
                        <h2 className="font-['Inter'] text-sm uppercase tracking-widest font-medium" style={{ color:s.text }}>Local Guides, {stateInfo ? stateInfo.name : region.name}</h2>
                      </div>
                      <p className="font-['Inter'] text-sm italic mb-4" style={{ color:s.faint }}>Vetted outfitters for this region</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {guides.map((g,i) => (
                          <div key={i} className="rounded-sm p-4" style={{ backgroundColor:"rgba(120,80,20,0.08)",border:"1px solid rgba(167,122,58,0.12)", gridColumn: (i === guides.length - 1 && guides.length % 2 !== 0) ? "1 / -1" : undefined }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div><p className="font-['Cormorant_Garamond'] text-sm font-semibold leading-snug" style={{ color:s.text }}>{g.name}</p><p className="font-['Inter'] text-sm" style={{ color:s.faint }}>{g.location}</p></div>
                              <span className="shrink-0 font-['Inter'] text-sm font-semibold" style={{ color:"#2F2B1E" }}>{g.priceRange}</span>
                            </div>
                            <p className="font-['Inter'] text-sm italic leading-snug mb-2" style={{ color:"#2F2B1E" }}>{g.notes}</p>
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-['Inter'] text-sm italic" style={{ color:"rgba(160,118,58,0.95)" }}>Tell them Flydentify hooked you up.</p>
                              <img src={logoImg} alt="Flydentify" style={{ height:"14px", width:"auto", filter:"brightness(0) saturate(100%) invert(52%) sepia(40%) saturate(500%) hue-rotate(10deg) brightness(85%)", opacity:0.45 }} />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1">{g.rivers.slice(0,3).map((r,j)=><span key={j} className="text-sm font-['Inter'] px-1.5 py-0.5 rounded-sm" style={{ backgroundColor:"rgba(167,122,58,0.1)",color:"#2F2B1E" }}>{r}</span>)}</div>
                              {g.website && g.website !== "#" && (
                                <a href={g.website} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-['Inter'] underline hover:opacity-70" style={{ color:s.amber }}>Book ↗</a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Finder page footer ── */}
      <footer style={{ backgroundColor: "#0D1B33", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 40, paddingTop: 48, paddingBottom: 48 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <img src={logoImg} alt="Flydentify" className="footer-logo" style={{ width: "clamp(120px, 18vw, 240px)", height: "auto", filter: "brightness(0) invert(1)", display: "block", margin: "0 auto" }} />

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px", marginTop: 8 }}>
            {[["Finder","/#/finder"],["Hatch chart","/#/hatch-chart"],["Rigging","/#/rigging"],["Conditions","/#/conditions"],["Pricing","/#/pricing"]].map(([label,href]) => (
              <a key={label} href={href} style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,230,204,0.55)", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(245,230,204,0.3)", textAlign: "center", marginTop: 16 }}>
            © 2026 Flydentify LLC · Made in Texas
          </p>
        </div>
      </footer>

      {/* ── Trip Dossier Drawer ──────────────────────────────────────────────── */}
      <TripDossierDrawer
        open={showTripDossier}
        onClose={() => setShowTripDossier(false)}
        waterMode={waterMode}
        locationLabel={locationLabel}
        locationStateAbbr={locationStateAbbr}
        selectedRegion={selectedRegion}
        regionName={region?.name}
        selectedMonth={selectedMonth}
        recommendedFlies={recommendedFlies}
        selectedSWRegion={selectedSWRegion}
        swRegionName={swRegion?.name}
        recommendedSWFlies={recommendedSWFlies}
      />

      {/* ── Freshwater fly detail drawer ─────────────────────────────────────── */}
      {selectedFly && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedFly(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"/>
          <div className="relative z-10 w-full sm:max-w-sm h-full overflow-y-auto" style={{ backgroundColor:"#EFE8D7",borderLeft:"1px solid rgba(160,118,58,0.35)" }} onClick={e=>e.stopPropagation()}>
            <div className="h-48 relative shrink-0 flex items-center justify-center" style={{ backgroundColor:"rgba(160,118,58,0.08)" }}>
              {flyImages[selectedFly.id] ? (
                <img src={flyImages[selectedFly.id]} alt={selectedFly.name} className="w-full h-full object-contain p-4"/>
              ) : (
                <TroutIcon size={64} color="rgba(120,80,20,0.2)"/>
              )}
              <div className="absolute inset-0" style={{ background:"linear-gradient(to top,#EFE8D7 0%,transparent 60%)" }}/>
              <button data-testid="button-close-fly-detail" onClick={() => setSelectedFly(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor:"rgba(0,0,0,0.55)",color:"#fff" }} aria-label="Close"><X size={14}/></button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <span className={`text-sm px-2 py-0.5 rounded-sm font-['Inter'] mb-2 inline-block ${getFlyTypeBadgeClass(selectedFly.type)}`}>{getFlyTypeLabel(selectedFly.type)}</span>
                <h2 className="font-['Cormorant_Garamond'] text-2xl" style={{ color:"#2F2B1E" }}>{selectedFly.name}</h2>
                <p className="font-['Inter'] text-sm italic" style={{ color:"#2F2B1E" }}>{selectedFly.hook}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {[{label:"Imitates",content:selectedFly.imitates},{label:"The Fly",content:selectedFly.description},{label:"How to Fish It",content:selectedFly.technique},{label:"Depth Zone",content:selectedFly.bestDepth}].map(({label,content}) => (
                <div key={label}><h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:"#A67A3A" }}>{label}</h3><p className="font-['Inter'] text-sm leading-relaxed" style={{ color:"#2F2B1E" }}>{content}</p></div>
              ))}
              <div>
                <h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:"#A67A3A" }}>Colors</h3>
                <div className="flex flex-wrap gap-1.5">{selectedFly.colors.map(c=><span key={c} className="text-sm px-2.5 py-1 rounded-sm font-['Inter']" style={{ backgroundColor:"rgba(120,80,20,0.15)",border:"1px solid rgba(167,122,58,0.25)",color:"#2F2B1E" }}>{c}</span>)}</div>
              </div>
              <div className="p-4 rounded-sm flex gap-3" style={{ backgroundColor:"rgba(80,45,8,0.88)",border:"1px solid rgba(167,122,58,0.35)" }}>
                <Info size={13} style={{ color:"#A67A3A" }} className="mt-0.5 shrink-0"/>
                <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:"rgba(240,225,200,0.95)" }}>{selectedFly.notes}</p>
              </div>
              {selectedFly.rigging && (
                <GearSetupCard
                  rigging={selectedFly.rigging}
                  flyType={selectedFly.type}
                  flyName={selectedFly.name}
                />
              )}
              <div className="h-px" style={{ backgroundColor:"rgba(160,118,58,0.22)" }}/>
              <div>
                <button data-testid="button-toggle-knots" onClick={() => setKnotsOpen(!knotsOpen)} className="w-full flex items-center justify-between mb-4 min-h-[44px]">
                  <h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest" style={{ color:"#2F2B1E" }}>Knots for this fly</h3>
                  {knotsOpen?<ChevronUp size={14} style={{ color:"#2F2B1E" }}/>:<ChevronDown size={14} style={{ color:"#2F2B1E" }}/>}
                </button>
                {knotsOpen && (
                  <div className="space-y-3">
                    <p className="text-sm font-['Inter'] italic mb-3" style={{ color:"#2F2B1E" }}>Recommended for rigging a {getFlyTypeLabel(selectedFly.type).toLowerCase()}.</p>
                    {flyKnots.map(rec => {
                      const knot = knots[rec.knotId];
                      if (!knot) return null;
                      const isExpanded = expandedKnot===knot.id;
                      return (
                        <div key={knot.id} data-testid={`knot-card-${knot.id}`} className="rounded-sm" style={{ border:`1px solid ${rec.primary?"rgba(167,122,58,0.35)":"rgba(160,118,58,0.18)"}`, backgroundColor:rec.primary?"rgba(120,80,20,0.07)":"rgba(160,118,58,0.03)" }}>
                          {/* Knot header — tap to expand */}
                          <button className="w-full text-left p-4 min-h-[44px]" onClick={() => setExpandedKnot(isExpanded?null:knot.id)}>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {rec.primary&&<span className="text-sm px-1.5 py-0.5 rounded-sm font-['Inter']" style={{ backgroundColor:"#A67A3A",color:"#fff" }}>First choice</span>}
                                <span className={`text-sm px-2 py-0.5 rounded-sm font-['Inter'] ${getDifficultyColor(knot.difficulty)}`}>{knot.difficulty}</span>
                              </div>
                              <ChevronDown size={13} style={{ color:"#2F2B1E" }} className={`transition-transform shrink-0 ${isExpanded?"rotate-180":""}`}/>
                            </div>
                            <h4 className="font-['Cormorant_Garamond'] text-sm mb-0.5" style={{ color:"#2F2B1E" }}>{knot.name}</h4>
                            <p className="text-sm font-['Inter'] italic leading-relaxed" style={{ color:"rgba(37,45,30,0.75)" }}>{rec.reason}</p>
                          </button>
                          {/* Step carousel — shown when expanded */}
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-1">
                              <KnotCarousel knotId={knot.id} mode="fw" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Saltwater fly detail drawer ───────────────────────────────────────── */}
      {selectedSWFly && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedSWFly(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"/>
          <div className="relative z-10 w-full sm:max-w-sm h-full overflow-y-auto" style={{ backgroundColor:"#EEF2F4",borderLeft:"1px solid rgba(61,107,131,0.35)" }} onClick={e=>e.stopPropagation()}>
            <div className="h-48 relative shrink-0 flex items-center justify-center" style={{ backgroundColor:"rgba(61,107,131,0.08)" }}>
              {flyImages[selectedSWFly.id] ? (
                <img src={flyImages[selectedSWFly.id]} alt={selectedSWFly.name} className="w-full h-full object-contain p-4"/>
              ) : (
                <Waves size={64} color="rgba(61,107,131,0.2)"/>
              )}
              <div className="absolute inset-0" style={{ background:"linear-gradient(to top,#EEF2F4 0%,transparent 60%)" }}/>
              <button onClick={() => setSelectedSWFly(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor:"rgba(0,0,0,0.5)",color:"#fff" }}><X size={14}/></button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <span className={`text-sm px-2 py-0.5 rounded-sm font-['Inter'] mb-2 inline-block ${getSwFlyTypeBadgeClass(selectedSWFly.type)}`}>{getSwFlyTypeLabel(selectedSWFly.type)}</span>
                <h2 className="font-['Cormorant_Garamond'] text-2xl" style={{ color:"#2F2B1E" }}>{selectedSWFly.name}</h2>
                <p className="font-['Inter'] text-sm" style={{ color:"rgba(26,34,44,0.85)" }}>{selectedSWFly.hook}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {[{label:"Imitates",content:selectedSWFly.imitates},{label:"The Fly",content:selectedSWFly.description},{label:"How to Fish It",content:selectedSWFly.technique},{label:"Depth Zone",content:selectedSWFly.bestDepth}].map(({label,content}) => (
                <div key={label}><h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:"#3D6B83" }}>{label}</h3><p className="font-['Inter'] text-sm leading-relaxed" style={{ color:"#1A2A38" }}>{content}</p></div>
              ))}
              <div>
                <h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest mb-2" style={{ color:"#3D6B83" }}>Colors</h3>
                <div className="flex flex-wrap gap-1.5">{selectedSWFly.colors.map(c=><span key={c} className="text-sm px-2.5 py-1 rounded-sm font-['Inter']" style={{ backgroundColor:"rgba(61,107,131,0.15)",border:"1px solid rgba(61,107,131,0.35)",color:"#1A2A38" }}>{c}</span>)}</div>
              </div>
              <div className="p-4 rounded-sm flex gap-3" style={{ backgroundColor:"rgba(6,25,50,0.90)",border:"1px solid rgba(61,107,131,0.35)" }}>
                <Info size={13} style={{ color:"#3D6B83" }} className="mt-0.5 shrink-0"/>
                <p className="font-['Inter'] text-sm italic leading-relaxed" style={{ color:"rgba(240,225,200,0.95)" }}>{selectedSWFly.notes}</p>
              </div>
              {selectedSWFly.rigging && (
                <GearSetupCard
                  rigging={selectedSWFly.rigging}
                  flyType={selectedSWFly.type}
                  flyName={selectedSWFly.name}
                  salt
                />
              )}
              {/* ── Knots for this Fly (SW) ── */}
              {swFlyKnots.length > 0 && (
                <div>
                  <div className="h-px mb-4" style={{ backgroundColor:"rgba(61,107,131,0.22)" }}/>
                  <button onClick={() => setSwKnotsOpen(!swKnotsOpen)} className="w-full flex items-center justify-between mb-4 min-h-[44px]">
                    <h3 className="font-['Inter'] text-sm font-medium uppercase tracking-widest" style={{ color:"#1A2A38" }}>Knots for this fly</h3>
                    {swKnotsOpen ? <ChevronUp size={14} style={{ color:"#1A2A38" }}/> : <ChevronDown size={14} style={{ color:"#1A2A38" }}/>}
                  </button>
                  {swKnotsOpen && (
                    <div className="space-y-3">
                      <p className="text-sm font-['Inter'] italic mb-3" style={{ color:"#1A2A38" }}>Recommended for rigging a {getSwFlyTypeLabel(selectedSWFly.type).toLowerCase()}.</p>
                      {swFlyKnots.map(rec => {
                        const knot = knots[rec.knotId];
                        if (!knot) return null;
                        const isExpanded = swExpandedKnot === knot.id;
                        return (
                          <div key={knot.id} className="rounded-sm" style={{ border:`1px solid ${rec.primary?"rgba(61,107,131,0.35)":"rgba(61,107,131,0.18)"}`, backgroundColor:rec.primary?"rgba(61,107,131,0.08)":"rgba(61,107,131,0.03)" }}>
                            {/* Knot header — tap to expand */}
                            <button className="w-full text-left p-4 min-h-[44px]" onClick={() => setSwExpandedKnot(isExpanded ? null : knot.id)}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {rec.primary && <span className="text-sm px-1.5 py-0.5 rounded-sm font-['Inter']" style={{ backgroundColor:"#3D6B83", color:"#fff" }}>First choice</span>}
                                  <span className={`text-sm px-2 py-0.5 rounded-sm font-['Inter'] ${getDifficultyColor(knot.difficulty)}`}>{knot.difficulty}</span>
                                </div>
                                <ChevronDown size={13} style={{ color:"#1A2A38" }} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}/>
                              </div>
                              <h4 className="font-['Cormorant_Garamond'] text-sm mb-0.5" style={{ color:"#1A2A38" }}>{knot.name}</h4>
                              <p className="text-sm font-['Inter'] italic leading-relaxed" style={{ color:"rgba(26,34,44,0.75)" }}>{rec.reason}</p>
                            </button>
                            {/* Step carousel — shown when expanded */}
                            {isExpanded && (
                              <div className="px-3 pb-3 pt-1">
                                <KnotCarousel knotId={knot.id} mode="sw" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
