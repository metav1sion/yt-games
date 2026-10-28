import type { VehicleState, Vec2 } from "./types";
import {
  districtById,
  getAvailableHomeIndices,
  resolveDistrict,
  getDistrictForHome,
  type DistrictId,
} from "./districts";

export type PackageType =
  | "standard"
  | "urgent"
  | "fragile"
  | "cold_chain"
  | "vip_express"
  | "heavy_freight";

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
  cold_chain: {
    label: "SOĞUK ZİNCİR",
    instruction: "Sıcaklık yükselmeden soğuk zinciri koru!",
    seconds: 38,
    multiplier: 1.65,
  },
  vip_express: {
    label: "VIP ÖZEL KARGO",
    instruction: "Değerli emanet! Sıfır hasarla teslim et.",
    seconds: 48,
    multiplier: 2.1,
  },
  heavy_freight: {
    label: "AĞIR SANAYİ YÜKÜ",
    instruction: "Ağır sanayi parçası · devasa prim kazan!",
    seconds: 58,
    multiplier: 1.85,
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
  comboBonus?: number;
  comboStreak?: number;
  flashBonus?: number;
  tipBonus?: number;
};

export type FlashRushEvent = {
  active: boolean;
  remainingSeconds: number;
  bonus: number;
  title: string;
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
  isSpecialContract?: boolean;
  flashRush?: FlashRushEvent | null;
  packageSlot: number;
  capacity: number;
  packageDamage: number;
  vehicleDamage: number;
  safeDrivingBonus: number;
  comboStreak?: number;
  district: DistrictId;
  routeOffset?: number;
  maxDeliveries?: number | null;
  lastReward?: DeliveryReward | null;
};

export function resolvePackageForTour(
  targetIndex: number,
  completed: number,
  companyLevel: number,
  unlockedDistricts?: DistrictId[] | Set<DistrictId>,
): { packageType: PackageType; isSpecialContract: boolean } {
  const available = getAvailableHomeIndices(companyLevel, unlockedDistricts);
  // Eğer birden fazla bölge açıksa her 3. teslimat kazançlı bir Özel Sözleşme (Special Contract) olur
  if (available.length > 4 && completed > 0 && completed % 3 === 2) {
    const targetDistrict = getDistrictForHome(targetIndex);
    if (targetDistrict === "coastal") {
      return { packageType: "vip_express", isSpecialContract: true };
    } else if (targetDistrict === "industrial") {
      return { packageType: "heavy_freight", isSpecialContract: true };
    } else {
      return { packageType: "cold_chain", isSpecialContract: true };
    }
  }
  return { packageType: packageFor(targetIndex), isSpecialContract: false };
}

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
    isSpecialContract: false,
    flashRush: null,
    packageSlot: 0,
    capacity: Math.min(4, 1 + cargoLevel),
    packageDamage: 0,
    vehicleDamage: 0,
    safeDrivingBonus: 0,
    comboStreak: 0,
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
    const damageFactor =
      s.packageType === "fragile" ? 32 : s.packageType === "vip_express" ? 38 : 12;
    s.packageDamage = Math.min(
      100,
      s.packageDamage + collisionDamage * damageFactor,
    );
    if (s.packageDamage > 5) {
      s.comboStreak = 0;
    }
  }

  const safeIndex =
    homes.length > 0
      ? s.targetIndex < homes.length
        ? s.targetIndex
        : s.targetIndex % homes.length
      : 0;
  const target = s.phase === "delivering" ? homes[safeIndex] : depot;
  if (s.phase === "delivering") {
    s.secondsLeft = Math.max(0, s.secondsLeft - dt);
    if (s.flashRush?.active) {
      s.flashRush.remainingSeconds = Math.max(0, s.flashRush.remainingSeconds - dt);
      if (s.flashRush.remainingSeconds <= 0) {
        s.flashRush.active = false;
      }
    }
  }

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

      const isVip = s.packageType === "vip_express";
      const isCold = s.packageType === "cold_chain";
      const isHeavy = s.packageType === "heavy_freight";

      let safeBonus = 0;
      if (s.packageDamage === 0) {
        safeBonus = isVip ? 50 : 25;
      }
      if (isCold && s.secondsLeft > 15) {
        safeBonus += 35;
      }
      if (isHeavy) {
        safeBonus += 40;
      }

      let comboBonus = 0;
      if (s.packageDamage === 0) {
        s.comboStreak = (s.comboStreak ?? 0) + 1;
        if (s.comboStreak >= 5) {
          comboBonus = 60;
        } else if (s.comboStreak >= 4) {
          comboBonus = 40;
        } else if (s.comboStreak >= 3) {
          comboBonus = 25;
        } else if (s.comboStreak >= 2) {
          comboBonus = 15;
        }
      } else {
        s.comboStreak = 0;
      }

      let flashBonus = 0;
      if (s.flashRush?.active && s.flashRush.remainingSeconds > 0) {
        flashBonus = s.flashRush.bonus;
        s.flashRush.active = false;
      }

      // Müşteri Bahşiş Mekaniği (Customer Tip Mechanic - T33)
      // Sıfır hasarla ve hızlı teslimat yapıldığında memnun müşteri cömertçe bahşiş bırakır
      let tipBonus = 0;
      if (s.packageDamage === 0) {
        if (s.secondsLeft >= 22) {
          tipBonus = 25; // Yıldırım hızında kusursuz teslimat
        } else if (s.secondsLeft >= 12) {
          tipBonus = 15; // Hızlı ve güvenli teslimat
        }
        if (tipBonus > 0 && s.isSpecialContract) {
          tipBonus += 5; // Özel sözleşme müşterisi ek bahşiş primi (+5 ₺)
        }
      }

      const qualityReward = Math.floor(reward * qualityMultiplier) + safeBonus + comboBonus + flashBonus + tipBonus;
      const repGain =
        (s.secondsLeft > 20 ? 2 : 1) +
        (isVip && s.packageDamage === 0 ? 2 : 0) +
        ((s.comboStreak ?? 0) >= 3 ? 1 : 0) +
        (flashBonus > 0 ? 2 : 0) +
        (tipBonus >= 25 ? 1 : 0);

      s.score += reward + comboBonus * 2 + flashBonus * 2;
      s.earnings += qualityReward;
      s.reputation += repGain;
      s.safeDrivingBonus += safeBonus;
      s.completed++;
      s.lastReward = {
        score: reward + comboBonus * 2 + flashBonus * 2,
        earnings: qualityReward,
        reputation: repGain,
        safeBonus,
        comboBonus,
        comboStreak: s.comboStreak,
        flashBonus: flashBonus > 0 ? flashBonus : undefined,
        tipBonus: tipBonus > 0 ? tipBonus : undefined,
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
        const resolved = resolvePackageForTour(
          s.targetIndex,
          s.completed,
          companyLevel,
          unlockedDistricts,
        );
        s.packageType = resolved.packageType;
        s.isSpecialContract = resolved.isSpecialContract;
        s.secondsLeft = packageInfo[s.packageType].seconds;
        s.packageDamage = 0;
        if (s.completed > 0 && s.completed % 3 === 0 && !s.flashRush?.active) {
          s.flashRush = {
            active: true,
            remainingSeconds: 45,
            bonus: 75,
            title: "⚡ FLAŞ SİPARİŞ RUSH",
          };
        }
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
      if (s.completed > 0 && s.completed % 3 === 0 && !s.flashRush?.active) {
        s.flashRush = {
          active: true,
          remainingSeconds: 45,
          bonus: 75,
          title: "⚡ FLAŞ SİPARİŞ RUSH",
        };
      }
      s.targetIndex = pickTargetHome(
        nextStep,
        companyLevel,
        selectedDistrict,
        unlockedDistricts,
      );
      s.district = getDistrictForHome(s.targetIndex);
      const resolved = resolvePackageForTour(
        s.targetIndex,
        s.completed,
        companyLevel,
        unlockedDistricts,
      );
      s.packageType = resolved.packageType;
      s.isSpecialContract = resolved.isSpecialContract;
      s.secondsLeft = packageInfo[s.packageType].seconds;
      s.packageDamage = 0;
      s.lastReward = null;
    }
  }

  return s;
}
