import type { Vec2 } from "./types";

export const AUTO_REPAIR_CENTER: Vec2 = { x: 78.0, z: -57.5 } as const;
export const AUTO_REPAIR_BAY: Vec2 = { x: 81.0, z: -56.0 } as const;
export const MECHANIC_MUHARREM_POS: Vec2 = { x: 75.5, z: -56.5 } as const;
export const CAR_LIFT_POS: Vec2 = { x: 74.5, z: -58.5 } as const;

export const AUTO_REPAIR_BUFF_DURATION = 30.0; // 30 saniye Sanayi Turbo Ayarı
export const AUTO_REPAIR_COOLDOWN = 40.0; // 40 saniye soğuma süresi
export const AUTO_REPAIR_DWELL_THRESHOLD = 1.2; // 1.2 saniye bakım peronunda bekleme süresi

export type AutoRepairState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  liftHeight: number;
  liftDir: number;
  wrenchTimer: number;
  wrenchSoundTimer: number;
  totalRepairs: number;
};

export type AutoRepairEvent = {
  awardedRepairBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  packageRepair: boolean;
  nitroRefill: boolean;
  wrenchPlayed: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const MECHANIC_MUHARREM_CALLOUTS = [
  "🔧 Tamirci Muharrem Usta: Gel kaptan geeel! Motorun sesinden anlarım, saat gibi çalışacak! 🚗💨",
  "🔧 Tamirci Muharrem Usta: Yağını suyunu tazeledim, fren balatalarını çakı gibi yaptım! Hayırlı işler! 🛠️",
  "🔧 Tamirci Muharrem Usta: Kargo arabası dediğin zıpkın gibi olmalı! Turbo ayarını çektim! ⚡",
  "🔧 Tamirci Muharrem Usta: Sanayi esnafı kargocunun dostudur! Bir çayımızı içmeden gitme! ☕",
];

export function createAutoRepairState(): AutoRepairState {
  return {
    center: { ...AUTO_REPAIR_CENTER },
    serviceBay: { ...AUTO_REPAIR_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    liftHeight: 1.1,
    liftDir: 1,
    wrenchTimer: 0,
    wrenchSoundTimer: 7.0,
    totalRepairs: 0,
  };
}

export function updateAutoRepair(
  state: AutoRepairState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): AutoRepairEvent {
  let wrenchPlayed = false;

  // 1. Sayaç ve süre güncellemeleri
  if (state.buffTimer > 0) {
    state.buffTimer = Math.max(0, state.buffTimer - dt);
  }

  if (state.cooldownTimer > 0) {
    state.cooldownTimer = Math.max(0, state.cooldownTimer - dt);
  }

  if (state.honkGreetingTimer > 0) {
    state.honkGreetingTimer = Math.max(0, state.honkGreetingTimer - dt);
    if (state.honkGreetingTimer <= 0) {
      state.lastHonkCallout = undefined;
    }
  }

  // 2. Hidrolik araç lifti ve mekanik anahtar simülasyonu
  state.liftHeight += state.liftDir * dt * 0.35;
  if (state.liftHeight >= 1.75) {
    state.liftHeight = 1.75;
    state.liftDir = -1;
  } else if (state.liftHeight <= 0.45) {
    state.liftHeight = 0.45;
    state.liftDir = 1;
  }

  state.wrenchTimer += dt;
  state.wrenchSoundTimer -= dt;

  const distToRepairShop = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.wrenchSoundTimer <= 0) {
    state.wrenchSoundTimer = 13.0 + Math.random() * 5.0;
    if (distToRepairShop <= 32.0) {
      wrenchPlayed = true;
    }
  }

  // 3. "Sanayi Bakımı" Mola Kontrolü
  // Oyuncu servis peronu içinde (<= 5.5m) durakladığında
  let awardedRepairBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let packageRepair = false;
  let nitroRefill = false;

  if (distToRepairShop <= 5.5 && playerSpeed < 1.2 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= AUTO_REPAIR_DWELL_THRESHOLD) {
      state.dwellTimer = 0;
      state.cooldownTimer = AUTO_REPAIR_COOLDOWN;
      state.buffTimer = AUTO_REPAIR_BUFF_DURATION;
      state.totalRepairs += 1;
      awardedRepairBonus = true;
      cashBonus = 10;
      repBonus = 1;
      packageRepair = true;
      nitroRefill = true;
      wrenchPlayed = true;
      state.honkGreetingTimer = 3.5;
      state.lastHonkCallout = MECHANIC_MUHARREM_CALLOUTS[0];
    }
  } else if (distToRepairShop > 6.5 || playerSpeed >= 1.5) {
    state.dwellTimer = 0;
  }

  return {
    awardedRepairBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    packageRepair,
    nitroRefill,
    wrenchPlayed,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerMechanicHonk(
  state: AutoRepairState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );
  if (dist <= 26.0) {
    state.honkGreetingTimer = 3.5;
    const calloutIdx = Math.floor(Math.random() * MECHANIC_MUHARREM_CALLOUTS.length);
    state.lastHonkCallout = MECHANIC_MUHARREM_CALLOUTS[calloutIdx];
    return true;
  }
  return false;
}
