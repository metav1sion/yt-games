import type { Vec2, Rect } from "./types";

export const GAS_STATION_POS: Vec2 = { x: 64.0, z: -9.0 };
export const FUEL_PUMP_POS: Vec2 = { x: 64.0, z: -9.0 };
export const FUEL_PUMP_RADIUS = 3.2;
export const FUEL_HOLD_TIME = 1.2; // 1.2 saniye durunca tam depo & bakım tamamlanır
export const FUEL_MAX_SPEED = 0.9;
export const FUEL_COOLDOWN = 14.0;

export const WASH_BAY_BOUNDS: Rect = {
  minX: 56.0,
  maxX: 60.5,
  minZ: -12.5,
  maxZ: -5.5,
};
export const WASH_MAX_SPEED = 5.5;
export const WASH_MIN_SPEED = 0.2;
export const WASH_COOLDOWN = 20.0;
export const WASH_DURATION = 2.5; // Yıkama fırçalarının ve su köpüğünün aktif kalma süresi
export const WASH_CLEAN_BUFF_DURATION = 30.0; // Pırıl pırıl temizlik buff süresi (30 sn)
export const WASH_CASH_BONUS = 10; // 10 ₺ bahşiş bonusu

export type GasStationState = {
  pumpHoldTimer: number;
  pumpProgress: number;
  fuelCooldown: number;
  washActiveTimer: number;
  isWashing: boolean;
  washCooldown: number;
  cleanBuffTimer: number;
  isClean: boolean;
  totalRefuels: number;
  totalWashes: number;
};

export type GasStationEvent =
  | { type: "fueling"; progress: number }
  | { type: "fuel_completed"; repBonus: number }
  | { type: "wash_started" }
  | { type: "wash_active"; progress: number }
  | { type: "wash_completed"; cashBonus: number; cleanDuration: number };

export type GasStationStepResult = {
  state: GasStationState;
  event?: GasStationEvent;
};

export function createGasStationState(): GasStationState {
  return {
    pumpHoldTimer: 0,
    pumpProgress: 0,
    fuelCooldown: 0,
    washActiveTimer: 0,
    isWashing: false,
    washCooldown: 0,
    cleanBuffTimer: 0,
    isClean: false,
    totalRefuels: 0,
    totalWashes: 0,
  };
}

export function isVehicleAtFuelPump(pos: Vec2): boolean {
  return Math.hypot(pos.x - FUEL_PUMP_POS.x, pos.z - FUEL_PUMP_POS.z) <= FUEL_PUMP_RADIUS;
}

export function isVehicleInWashBay(pos: Vec2): boolean {
  return (
    pos.x >= WASH_BAY_BOUNDS.minX &&
    pos.x <= WASH_BAY_BOUNDS.maxX &&
    pos.z >= WASH_BAY_BOUNDS.minZ &&
    pos.z <= WASH_BAY_BOUNDS.maxZ
  );
}

export function stepGasStation(
  prevState: GasStationState,
  vehiclePos: Vec2,
  vehicleSpeed: number,
  dt: number,
): GasStationStepResult {
  const fuelCooldown = Math.max(0, prevState.fuelCooldown - dt);
  const washCooldown = Math.max(0, prevState.washCooldown - dt);
  const cleanBuffTimer = Math.max(0, prevState.cleanBuffTimer - dt);
  const isClean = cleanBuffTimer > 0;

  let pumpHoldTimer = prevState.pumpHoldTimer;
  let pumpProgress = prevState.pumpProgress;
  let washActiveTimer = prevState.washActiveTimer;
  let isWashing = prevState.isWashing;
  let totalRefuels = prevState.totalRefuels;
  let totalWashes = prevState.totalWashes;
  let event: GasStationEvent | undefined;

  // 1. Akaryakıt Pompası Simülasyonu
  const atPump = isVehicleAtFuelPump(vehiclePos);
  const stoppedAtPump = atPump && Math.abs(vehicleSpeed) <= FUEL_MAX_SPEED && fuelCooldown <= 0;

  if (stoppedAtPump) {
    pumpHoldTimer += dt;
    pumpProgress = Math.min(1.0, pumpHoldTimer / FUEL_HOLD_TIME);

    if (pumpProgress >= 1.0) {
      // Yakıt ikmali tamamlandı
      totalRefuels += 1;
      pumpHoldTimer = 0;
      pumpProgress = 0;
      event = { type: "fuel_completed", repBonus: 1 };
      return {
        state: {
          ...prevState,
          pumpHoldTimer,
          pumpProgress,
          fuelCooldown: FUEL_COOLDOWN,
          washActiveTimer,
          isWashing,
          washCooldown,
          cleanBuffTimer,
          isClean,
          totalRefuels,
          totalWashes,
        },
        event,
      };
    } else {
      event = { type: "fueling", progress: pumpProgress };
    }
  } else {
    // Pompadan ayrılınca veya hareket edince hold timer sıfırlanır
    pumpHoldTimer = Math.max(0, pumpHoldTimer - dt * 2.5);
    pumpProgress = Math.min(1.0, pumpHoldTimer / FUEL_HOLD_TIME);
  }

  // 2. Otomatik Araç Yıkama Tüneli Simülasyonu
  const inWashBay = isVehicleInWashBay(vehiclePos);
  const validWashSpeed =
    Math.abs(vehicleSpeed) >= WASH_MIN_SPEED && Math.abs(vehicleSpeed) <= WASH_MAX_SPEED;

  if (inWashBay && validWashSpeed && !isWashing && washCooldown <= 0) {
    // Yıkama başladı
    isWashing = true;
    washActiveTimer = WASH_DURATION;
    event = { type: "wash_started" };
  } else if (isWashing) {
    washActiveTimer -= dt;
    if (washActiveTimer <= 0) {
      isWashing = false;
      washActiveTimer = 0;
      totalWashes += 1;
      event = {
        type: "wash_completed",
        cashBonus: WASH_CASH_BONUS,
        cleanDuration: WASH_CLEAN_BUFF_DURATION,
      };
      return {
        state: {
          ...prevState,
          pumpHoldTimer,
          pumpProgress,
          fuelCooldown,
          washActiveTimer,
          isWashing,
          washCooldown: WASH_COOLDOWN,
          cleanBuffTimer: WASH_CLEAN_BUFF_DURATION,
          isClean: true,
          totalRefuels,
          totalWashes,
        },
        event,
      };
    } else {
      const progress = 1.0 - washActiveTimer / WASH_DURATION;
      event = { type: "wash_active", progress };
    }
  }

  return {
    state: {
      ...prevState,
      pumpHoldTimer,
      pumpProgress,
      fuelCooldown,
      washActiveTimer,
      isWashing,
      washCooldown,
      cleanBuffTimer,
      isClean,
      totalRefuels,
      totalWashes,
    },
    event,
  };
}
