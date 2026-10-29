import type { Vec2 } from "./types";

export const HARBOUR_CENTER: Vec2 = { x: -78.0, z: 88.0 } as const;
export const HARBOUR_ENTRANCE: Vec2 = { x: -78.0, z: 83.5 } as const;
export const FISH_BOAT_POS: Vec2 = { x: -73.2, z: 91.0 } as const;
export const TRAWLER_1_POS: Vec2 = { x: -83.5, z: 92.5 } as const;
export const TRAWLER_2_POS: Vec2 = { x: -85.0, z: 87.5 } as const;
export const CHEF_TEMEL_POS: Vec2 = { x: -74.8, z: 90.5 } as const;

export const HARBOUR_BUFF_DURATION = 20.0; // 20 saniye ferahlık / derya kuzusu gücü
export const HARBOUR_COOLDOWN = 35.0; // 35 saniye soğuma
export const HARBOUR_DWELL_THRESHOLD = 1.2; // 1.2 saniye bekleme süresi

export type FishingHarbourState = {
  center: Vec2;
  entrance: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  boatWaveTimer: number;
  grillSizzleTimer: number;
  totalVisits: number;
};

export type FishingHarbourEvent = {
  awardedFeastBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  honkGreeted: boolean;
  sizzlePlayed: boolean;
  callout?: string;
};

export const CHEF_TEMEL_CALLOUTS = [
  "🐟 Balıkçı Temel Reis: Gel vatandaş geeel! Derya kuzusu bunlar! Taze palamut balık-ekmek hazır! 🥖",
  "🐟 Balıkçı Temel Reis: Soğanlı mı olsun soğansız mı kaptan? Limonu da sıktık mı tamamdır! 🍋",
  "🐟 Balıkçı Temel Reis: Denizden yeni çıktı, ızgarada nar gibi kızarıyor! Afiyet şifa olsun! 🌊",
  "🐟 Balıkçı Temel Reis: Kargo arabasının sesini duydum! Sıcak ekmek arasına çift fileto çektim! 🍽️",
];

export function createFishingHarbourState(): FishingHarbourState {
  return {
    center: { ...HARBOUR_CENTER },
    entrance: { ...HARBOUR_ENTRANCE },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    boatWaveTimer: 0,
    grillSizzleTimer: 6.0,
    totalVisits: 0,
  };
}

export function updateFishingHarbour(
  state: FishingHarbourState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): FishingHarbourEvent {
  let sizzlePlayed = false;

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

  // 2. Dalga ve ızgara cızırtı simülasyonu
  state.boatWaveTimer += dt;
  state.grillSizzleTimer -= dt;

  const distToHarbour = Math.hypot(playerPos.x - state.entrance.x, playerPos.z - state.entrance.z);
  if (state.grillSizzleTimer <= 0) {
    state.grillSizzleTimer = 14.0 + Math.random() * 6.0;
    if (distToHarbour <= 30.0) {
      sizzlePlayed = true;
    }
  }

  // 3. "Balık Ekmek Ziyafeti" Mola Kontrolü
  // Oyuncu iskele girişi yakınında (<= 6.5m) durakladığında
  let awardedFeastBonus = false;
  let cashBonus = 0;
  let repBonus = 0;

  if (distToHarbour <= 6.5 && playerSpeed < 1.2 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= HARBOUR_DWELL_THRESHOLD) {
      state.dwellTimer = 0;
      state.cooldownTimer = HARBOUR_COOLDOWN;
      state.buffTimer = HARBOUR_BUFF_DURATION;
      state.totalVisits += 1;
      awardedFeastBonus = true;
      cashBonus = 15;
      repBonus = 1;
      sizzlePlayed = true;
      state.honkGreetingTimer = 3.5;
      state.lastHonkCallout = CHEF_TEMEL_CALLOUTS[0];
    }
  } else if (distToHarbour > 7.5 || playerSpeed >= 1.5) {
    state.dwellTimer = 0;
  }

  return {
    awardedFeastBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    honkGreeted: state.honkGreetingTimer > 0,
    sizzlePlayed,
    callout: state.lastHonkCallout,
  };
}

export function triggerChefTemelHonk(
  state: FishingHarbourState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(playerPos.x - state.entrance.x, playerPos.z - state.entrance.z);
  if (dist <= 25.0) {
    state.honkGreetingTimer = 3.5;
    const calloutIdx = Math.floor(Math.random() * CHEF_TEMEL_CALLOUTS.length);
    state.lastHonkCallout = CHEF_TEMEL_CALLOUTS[calloutIdx];
    return true;
  }
  return false;
}
