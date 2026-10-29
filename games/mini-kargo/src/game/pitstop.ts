import type { Vec2 } from "./types";
import type { DistrictId } from "./districts";

export type PitstopDef = {
  id: string;
  name: string;
  district: DistrictId;
  position: Vec2;
  radius: number;
};

export const DEFAULT_PITSTOP_PAD: PitstopDef = {
  id: "depot_ev_charger",
  name: "⚡ Lojistik Üssü Hızlı Şarj & Pitstop",
  district: "sunny",
  position: { x: -66.5, z: -25.5 },
  radius: 3.2,
};

export type PitstopState = {
  chargeProgress: number; // 0.0 .. 1.0
  isCharging: boolean;
  superchargeTimer: number; // Süper-şarj buff kalan süresi (sn)
  isSupercharged: boolean;
  totalChargesCompleted: number;
};

export type PitstopEvent = "charge_started" | "charging" | "charge_completed";

export type PitstopStepResult = {
  state: PitstopState;
  event?: PitstopEvent;
};

export const SUPERCHARGE_DURATION = 25.0; // 25 saniye güçlü süper-şarj buff'ı
export const FULL_CHARGE_TIME = 1.5; // 1.5 saniyede tam hızlı dolum
export const MAX_CHARGE_SPEED = 2.8; // Bu hızın altında araç şarj olmaya başlar

export function createPitstopState(): PitstopState {
  return {
    chargeProgress: 0,
    isCharging: false,
    superchargeTimer: 0,
    isSupercharged: false,
    totalChargesCompleted: 0,
  };
}

export function stepPitstop(
  state: PitstopState,
  vehiclePos: Vec2,
  vehicleSpeed: number,
  dt: number,
  pad: PitstopDef = DEFAULT_PITSTOP_PAD,
): PitstopStepResult {
  const dist = Math.hypot(vehiclePos.x - pad.position.x, vehiclePos.z - pad.position.z);
  const inRange = dist <= pad.radius;
  const isStoppedOrSlow = vehicleSpeed <= MAX_CHARGE_SPEED;

  let chargeProgress = state.chargeProgress;
  let isCharging = false;
  let superchargeTimer = state.superchargeTimer;
  let isSupercharged = state.isSupercharged;
  let totalChargesCompleted = state.totalChargesCompleted;
  let event: PitstopEvent | undefined;

  // 1. Şarj alanı içi kontrolü
  if (inRange && isStoppedOrSlow) {
    if (chargeProgress < 1.0) {
      isCharging = true;
      const wasCharging = state.isCharging;
      const prevProgress = chargeProgress;
      chargeProgress = Math.min(1.0, chargeProgress + dt / FULL_CHARGE_TIME);

      if (chargeProgress >= 1.0 && prevProgress < 1.0) {
        // Tam şarj tamamlandı!
        superchargeTimer = SUPERCHARGE_DURATION;
        isSupercharged = true;
        totalChargesCompleted += 1;
        event = "charge_completed";
      } else if (!wasCharging) {
        event = "charge_started";
      } else {
        event = "charging";
      }
    } else {
      // Zaten %100 dolu ve alanda bekliyor
      isCharging = false;
    }
  } else {
    // Alandan çıkıldı veya araç hızlı geçiyor
    isCharging = false;
    // Pedden ayrılınca şarj dolum barı sıfırlanır (yeni şarja hazır)
    chargeProgress = 0;
  }

  // 2. Süper-şarj buff süresi geri sayımı (yeni tamamlandığı kare hariç)
  if (event !== "charge_completed") {
    if (superchargeTimer > 0) {
      superchargeTimer = Math.max(0, superchargeTimer - dt);
      isSupercharged = superchargeTimer > 0;
    } else {
      isSupercharged = false;
    }
  }

  return {
    state: {
      chargeProgress,
      isCharging,
      superchargeTimer,
      isSupercharged,
      totalChargesCompleted,
    },
    event,
  };
}
