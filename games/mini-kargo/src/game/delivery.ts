import type { VehicleState, Vec2 } from "./types";
import type { VehicleUpgrades } from "./upgrades";
import { districtById, districtForLevel, type DistrictId } from "./districts";
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
const packageFor = (index: number): PackageType =>
  (["standard", "urgent", "fragile"] as PackageType[])[index % 3];
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
};
export function createDeliveryState(cargoLevel = 0, companyLevel = 1): DeliveryState {
  return {
    phase: "loading",
    completed: 0,
    targetIndex: 0,
    holdSeconds: 0,
    secondsLeft: 45,
    score: 0,
    earnings: 0,
    reputation: 0,
    packageType: packageFor(0),
    packageSlot: 0,
    capacity: Math.min(2, 1 + cargoLevel),
    packageDamage: 0,
    vehicleDamage: 0,
    safeDrivingBonus: 0,
    district: districtForLevel(companyLevel).id,
  };
}
export function stepDelivery(
  state: DeliveryState,
  vehicle: VehicleState,
  depot: Vec2,
  homes: Vec2[],
  dt: number,
  collisionDamage = 0,
): DeliveryState {
  if (state.phase === "result") return state;
  const s = { ...state };
  if (s.phase === "delivering" && collisionDamage > 0) {
    s.vehicleDamage = Math.min(100, s.vehicleDamage + collisionDamage * 22);
    s.packageDamage = Math.min(
      100,
      s.packageDamage +
        collisionDamage * (s.packageType === "fragile" ? 32 : 12),
    );
  }
  const target = s.phase === "delivering" ? homes[s.targetIndex] : depot;
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
      s.score += reward;
      s.earnings += qualityReward;
      s.reputation += s.secondsLeft > 20 ? 2 : 1;
      s.safeDrivingBonus += safeBonus;
      s.completed++;
      if (s.completed === 3) {
        s.phase = "result";
      } else if (s.packageSlot < s.capacity) {
        s.packageSlot++;
        s.phase = "delivering";
        s.targetIndex = s.completed;
        s.packageType = packageFor(s.targetIndex);
        s.secondsLeft = packageInfo[s.packageType].seconds;
        s.packageDamage = 0;
      } else {
        s.phase = "returning";
        s.targetIndex = s.completed;
      }
    } else {
      s.phase = "delivering";
      s.packageSlot = 1;
      s.packageType = packageFor(s.targetIndex);
      s.secondsLeft = packageInfo[s.packageType].seconds;
      s.packageDamage = 0;
    }
  }
  return s;
}
