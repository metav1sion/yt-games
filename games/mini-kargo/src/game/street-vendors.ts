import type { Vec2 } from "./types";
import type { DistrictId } from "./districts";

export type StreetVendorId = "simit_carsi" | "kestane_sahil";

export type StreetVendorDef = {
  id: StreetVendorId;
  name: string;
  vendorName: string;
  district: DistrictId;
  position: Vec2;
  radius: number;
  snackName: string;
  cost: number;
  repBonus: number;
  calloutLines: string[];
  thanksLines: string[];
};

export const DEFAULT_STREET_VENDORS: StreetVendorDef[] = [
  {
    id: "simit_carsi",
    name: "Tarihi Taşfırın Simitçisi",
    vendorName: "Simitçi Hasan Usta",
    district: "market",
    position: { x: 42.0, z: 47.0 },
    radius: 3.2,
    snackName: "Çıtır Susamlı Simit",
    cost: 5,
    repBonus: 1,
    calloutLines: [
      "🥨 Taze çıtır simit!",
      "🥨 Fırından yeni çıktı!",
      "🥨 Sıcak gevrek simit!",
    ],
    thanksLines: [
      "🥨 Afiyet olsun kaptan!",
      "🥨 Enerjin bol olsun!",
      "🥨 Hayırlı işler kargocu!",
    ],
  },
  {
    id: "kestane_sahil",
    name: "Közde Kestaneci & Süt Mısır",
    vendorName: "Kestaneci Recep Usta",
    district: "coastal",
    position: { x: -44.0, z: 83.2 },
    radius: 3.2,
    snackName: "Sıcak Közde Kestane",
    cost: 5,
    repBonus: 1,
    calloutLines: [
      "🌰 Kestane kebap yemesi sevap!",
      "🌽 Taze süt mısır!",
      "🌰 Közde sıcak kestane!",
    ],
    thanksLines: [
      "🌰 Bereketli olsun kaptan!",
      "🌽 Afiyet şeker olsun!",
      "🌰 Yolun açık olsun!",
    ],
  },
];

export type StreetVendorState = {
  activeVendorId: StreetVendorId | null;
  holdTimers: Record<StreetVendorId, number>;
  cooldowns: Record<StreetVendorId, number>;
  totalSnacksPurchased: number;
  lastPurchasedVendorId: StreetVendorId | null;
  energyBuffTimer: number; // Sokak lezzeti enerji buff süresi (sn)
};

export type StreetVendorEvent =
  | { type: "snack_purchased"; vendor: StreetVendorDef }
  | { type: "vendor_greeting"; vendor: StreetVendorDef };

export type StreetVendorStepResult = {
  state: StreetVendorState;
  event?: StreetVendorEvent;
};

export const SNACK_HOLD_TIME = 1.0; // 1 saniye durunca satın alınır
export const SNACK_COOLDOWN = 18.0; // 18 saniyede bir aynı tezgahtan atıştırmalık alınabilir
export const SNACK_ENERGY_DURATION = 15.0; // 15 saniye enerji dopingi
export const MAX_VENDOR_INTERACT_SPEED = 2.2;

export function createStreetVendorState(): StreetVendorState {
  return {
    activeVendorId: null,
    holdTimers: {
      simit_carsi: 0,
      kestane_sahil: 0,
    },
    cooldowns: {
      simit_carsi: 0,
      kestane_sahil: 0,
    },
    totalSnacksPurchased: 0,
    lastPurchasedVendorId: null,
    energyBuffTimer: 0,
  };
}

export function stepStreetVendors(
  state: StreetVendorState,
  playerPos: Vec2,
  playerSpeed: number,
  playerMoney: number,
  dt: number,
  vendors: StreetVendorDef[] = DEFAULT_STREET_VENDORS,
): StreetVendorStepResult {
  const holdTimers = { ...state.holdTimers };
  const cooldowns = { ...state.cooldowns };
  let energyBuffTimer = state.energyBuffTimer;
  let totalSnacksPurchased = state.totalSnacksPurchased;
  let lastPurchasedVendorId = state.lastPurchasedVendorId;
  let activeVendorId: StreetVendorId | null = null;
  let event: StreetVendorEvent | undefined;

  // 1. Cooldown geri sayımı
  for (const id of ["simit_carsi", "kestane_sahil"] as const) {
    if (cooldowns[id] > 0) {
      cooldowns[id] = Math.max(0, cooldowns[id] - dt);
    }
  }

  // 2. Enerji dopingi geri sayımı
  if (energyBuffTimer > 0) {
    energyBuffTimer = Math.max(0, energyBuffTimer - dt);
  }

  // 3. Yakındaki seyyar satıcıyı bul
  for (const vendor of vendors) {
    const dist = Math.hypot(playerPos.x - vendor.position.x, playerPos.z - vendor.position.z);
    if (dist <= vendor.radius) {
      activeVendorId = vendor.id;
      const isStopped = playerSpeed <= MAX_VENDOR_INTERACT_SPEED;
      const canAfford = playerMoney >= vendor.cost;
      const onCooldown = cooldowns[vendor.id] > 0;

      if (isStopped && canAfford && !onCooldown) {
        holdTimers[vendor.id] = (holdTimers[vendor.id] ?? 0) + dt;
        if (holdTimers[vendor.id] >= SNACK_HOLD_TIME) {
          // Satın alma tamamlandı!
          holdTimers[vendor.id] = 0;
          cooldowns[vendor.id] = SNACK_COOLDOWN;
          totalSnacksPurchased += 1;
          lastPurchasedVendorId = vendor.id;
          energyBuffTimer = SNACK_ENERGY_DURATION;
          event = { type: "snack_purchased", vendor };
          break;
        }
      } else {
        holdTimers[vendor.id] = 0;
      }
    } else {
      holdTimers[vendor.id] = 0;
    }
  }

  return {
    state: {
      activeVendorId,
      holdTimers,
      cooldowns,
      totalSnacksPurchased,
      lastPurchasedVendorId,
      energyBuffTimer,
    },
    event,
  };
}
