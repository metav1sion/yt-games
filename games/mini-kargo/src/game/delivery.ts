import type { VehicleState, Vec2 } from "./types";
import {
  districtById,
  getAvailableHomeIndices,
  resolveDistrict,
  getDistrictForHome,
  type DistrictId,
} from "./districts";

export type PackageType = "standard" | "urgent" | "fragile";

export const packageInfo: Record<
  PackageType,
  { label: string; instruction: string; seconds: number; multiplier: number }
> = {
  standard: {
    label: "STANDART PAKET",
    instruction: "İşaretli alanda dur ve teslim et.",
    seconds: 45,
    multiplier: 1,
  },
  urgent: {
    label: "ACİL KARGO",
    instruction: "Acil teslimat · hızlı ol!",
    seconds: 35,
    multiplier: 1.35,
  },
  fragile: {
    label: "KIRILABİLİR",
    instruction: "Yavaşla ve dikkatli teslim et.",
    seconds: 55,
    multiplier: 1.2,
  },
};

export const PACKAGE_PROFILE_BY_HOME: Record<number, PackageType> = {
  // Güneş Mahallesi (Konutlar - Dengeli rota)
  0: "standard",
  1: "urgent",
  2: "fragile",
  3: "standard",

  // Çarşı Bölgesi (Dükkanlar - Sıcak yemek, taze ürün ve acil siparişler)
  4: "urgent",   // Pastane (sıcak teslimat)
  5: "fragile",  // Manav (taze gıda ezilmesin)
  6: "standard", // Kitapçı
  7: "urgent",   // Butik (hızlı moda siparişi)

  // Sanayi Bölgesi (Ağır parçalar, antrepo ve lojistik)
  8: "standard",  // Antrepo
  9: "standard",  // Döküm
  10: "urgent",   // Lojistik (üretim hattı parçası)
  11: "standard", // Fabrika

  // Sahil Bölgesi (Lüks villalar, marina ve hassas ürünler)
  12: "fragile",  // Marina (hassas elektronik)
  13: "urgent",   // Kafe (hızlı içecek siparişi)
  14: "fragile",  // Villa (özel porselen/hediyelik)
  15: "fragile",  // Kulüp (cam şişe kargo)
};

export const packageFor = (index: number): PackageType =>
  PACKAGE_PROFILE_BY_HOME[index] ?? (["standard", "urgent", "fragile"] as PackageType[])[index % 3];

export type DeliveryReward = {
  score: number;
  earnings: number;
  reputation: number;
  safeBonus: number;
};

export type DeliveryState = {
  phase: "loading" | "delivering" | "returning" | "result";
  completed: number;
  targetIndex: number;
  holdSeconds: number;
  secondsLeft: number;
  score: number;
  earnings: number;
  reputation: number;
  packageType: PackageType;
  packageSlot: number;
  capacity: number;
  packageDamage: number;
  vehicleDamage: number;
  safeDrivingBonus: number;
  district: DistrictId;
  routeOffset?: number;
  maxDeliveries?: number | null;
  lastReward?: DeliveryReward | null;
};

function pickTargetHome(
  stepIndex: number,
  companyLevel: number,
  selectedDistrict?: DistrictId | null,
  unlockedDistricts?: DistrictId[] | Set<DistrictId>,
): number {
  const activeDistrict = resolveDistrict(companyLevel, selectedDistrict, unlockedDistricts);
  const homesInDistrict = activeDistrict.homeIndices;
  if (homesInDistrict && homesInDistrict.length > 0) {
    return homesInDistrict[stepIndex % homesInDistrict.length];
  }
  const available = getAvailableHomeIndices(companyLevel, unlockedDistricts);
  return available[stepIndex % available.length] ?? 0;
}

export function createDeliveryState(
  cargoLevel = 0,
  companyLevel = 1,
  selectedDistrict: DistrictId | null = null,
  routeOffset = 0,
  maxDeliveries: number | null = null,
  unlockedDistricts?: DistrictId[] | Set<DistrictId>,
): DeliveryState {
  const safeOffset = Math.max(0, Math.floor(routeOffset));
  const targetIndex = pickTargetHome(
    safeOffset,
    companyLevel,
    selectedDistrict,
    unlockedDistricts,
  );
  const targetDistrict = getDistrictForHome(targetIndex);
  const pkg = packageFor(targetIndex);

  return {
    phase: "loading",
    completed: 0,
    targetIndex,
    holdSeconds: 0,
    secondsLeft: packageInfo[pkg].seconds,
    score: 0,
    earnings: 0,
    reputation: 0,
    packageType: pkg,
    packageSlot: 0,
    capacity: Math.min(4, 1 + cargoLevel),
    packageDamage: 0,
    vehicleDamage: 0,
    safeDrivingBonus: 0,
    district: targetDistrict,
    routeOffset: safeOffset,
    maxDeliveries: maxDeliveries ?? null,
    lastReward: null,
  };
}

export function stepDelivery(
  state: DeliveryState,
  vehicle: VehicleState,
  depot: Vec2,
  homes: Vec2[],
  dt: number,
  collisionDamage = 0,
  companyLevel = 1,
  selectedDistrict: DistrictId | null = null,
  unlockedDistricts?: DistrictId[] | Set<DistrictId>,
): DeliveryState {
  if (state.phase === "result") return state;
  const s: DeliveryState = { ...state };

  if (s.phase === "delivering" && collisionDamage > 0) {
    s.vehicleDamage = Math.min(100, s.vehicleDamage + collisionDamage * 22);
    s.packageDamage = Math.min(
      100,
      s.packageDamage +
        collisionDamage * (s.packageType === "fragile" ? 32 : 12),
    );
  }

  const safeIndex =
    homes.length > 0
      ? s.targetIndex < homes.length
        ? s.targetIndex
        : s.targetIndex % homes.length
      : 0;
  const target = s.phase === "delivering" ? homes[safeIndex] : depot;
  if (s.phase === "delivering") s.secondsLeft = Math.max(0, s.secondsLeft - dt);

  const inZone =
    Math.hypot(vehicle.position.x - target.x, vehicle.position.z - target.z) <=
    2;
  const stopped = Math.hypot(vehicle.velocity.x, vehicle.velocity.z) <= 0.5;

  s.holdSeconds = inZone && stopped ? s.holdSeconds + dt : 0;

  if (s.holdSeconds + 1e-9 >= 1) {
    s.holdSeconds = 0;

    if (s.phase === "delivering") {
      const info = packageInfo[s.packageType];
      const districtMultiplier = districtById(s.district).rewardMultiplier;
      const reward = Math.floor(
        (100 + Math.floor(s.secondsLeft * 2)) *
          info.multiplier *
          districtMultiplier,
      );
      const qualityMultiplier = Math.max(0.35, 1 - s.packageDamage / 220);
      const safeBonus = s.packageDamage === 0 ? 25 : 0;
      const qualityReward = Math.floor(reward * qualityMultiplier) + safeBonus;
      const repGain = s.secondsLeft > 20 ? 2 : 1;

      s.score += reward;
      s.earnings += qualityReward;
      s.reputation += repGain;
      s.safeDrivingBonus += safeBonus;
      s.completed++;
      s.lastReward = {
        score: reward,
        earnings: qualityReward,
        reputation: repGain,
        safeBonus,
      };

      const nextStep = (s.routeOffset ?? 0) + s.completed;
      if (s.maxDeliveries != null && s.completed >= s.maxDeliveries) {
        s.phase = "result";
      } else if (s.packageSlot < s.capacity) {
        s.packageSlot++;
        s.phase = "delivering";
        s.targetIndex = pickTargetHome(
          nextStep,
          companyLevel,
          selectedDistrict,
          unlockedDistricts,
        );
        s.district = getDistrictForHome(s.targetIndex);
        s.packageType = packageFor(s.targetIndex);
        s.secondsLeft = packageInfo[s.packageType].seconds;
        s.packageDamage = 0;
      } else {
        s.phase = "returning";
        s.targetIndex = pickTargetHome(
          nextStep,
          companyLevel,
          selectedDistrict,
          unlockedDistricts,
        );
        s.district = getDistrictForHome(s.targetIndex);
      }
    } else {
      const nextStep = (s.routeOffset ?? 0) + s.completed;
      s.phase = "delivering";
      s.packageSlot = 1;
      s.targetIndex = pickTargetHome(
        nextStep,
        companyLevel,
        selectedDistrict,
        unlockedDistricts,
      );
      s.district = getDistrictForHome(s.targetIndex);
      s.packageType = packageFor(s.targetIndex);
      s.secondsLeft = packageInfo[s.packageType].seconds;
      s.packageDamage = 0;
      s.lastReward = null;
    }
  }

  return s;
}
