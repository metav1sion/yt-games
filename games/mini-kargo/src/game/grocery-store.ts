import type { Vec2 } from "./types";

export const GROCERY_STORE_CENTER: Vec2 = { x: -58.5, z: -57.0 } as const;
export const GROCERY_STORE_BAY: Vec2 = { x: -55.0, z: -54.0 } as const;
export const GROCER_HUSNU_POS: Vec2 = { x: -56.5, z: -55.0 } as const;

export const GROCERY_BUFF_DURATION = 25.0; // 25 saniye "Buz Gibi Gazoz Enerjisi"
export const GROCERY_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const GROCERY_DWELL_THRESHOLD = 1.2; // 1.2 saniye bakkal önünde bekleme eşiği

export type GroceryStoreState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  bellSoundTimer: number;
  totalVisits: number;
};

export type GroceryStoreEvent = {
  awardedBakkalBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  bellPlayed: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const GROCER_HUSNU_CALLOUTS = [
  "🥖 Bakkal Hüsnü Amca: Hoş geldin evlat! Fırından yeni çıktı ekmekler, çıtır çıtır! 🥐",
  "🥤 Bakkal Hüsnü Amca: Kolay gelsin kaptan! Buz gibi bir gazoz açayım mı yola? 📦",
  "📰 Bakkal Hüsnü Amca: Gazeteler, taze simit hazır! Mahallemizin kargosu canavar gibi! ⭐",
  "🧺 Bakkal Hüsnü Amca: Kargolar tam vaktinde! Hüsnü Amcan sana bir çay ısmarlasın! ☕",
];

export function createGroceryStoreState(): GroceryStoreState {
  return {
    center: { ...GROCERY_STORE_CENTER },
    serviceBay: { ...GROCERY_STORE_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    bellSoundTimer: 8.0,
    totalVisits: 0,
  };
}

export function updateGroceryStore(
  state: GroceryStoreState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): GroceryStoreEvent {
  let bellPlayed = false;

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

  // 2. Kapı çıngırağı ortam sesi simülasyonu
  state.bellSoundTimer -= dt;
  const distToBakkal = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.bellSoundTimer <= 0) {
    state.bellSoundTimer = 16.0 + Math.random() * 8.0;
    if (distToBakkal <= 28.0) {
      bellPlayed = true;
    }
  }

  // 3. "Bakkal Molası" Ziyaret ve Dinlenme Kontrolü
  let awardedBakkalBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  if (distToBakkal <= 6.0 && playerSpeed < 1.2 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= GROCERY_DWELL_THRESHOLD) {
      state.dwellTimer = 0;
      state.cooldownTimer = GROCERY_COOLDOWN;
      state.buffTimer = GROCERY_BUFF_DURATION;
      state.totalVisits += 1;
      awardedBakkalBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      bellPlayed = true;
      state.honkGreetingTimer = 3.5;
      state.lastHonkCallout = GROCER_HUSNU_CALLOUTS[0];
    }
  } else if (distToBakkal > 7.0 || playerSpeed >= 1.5) {
    state.dwellTimer = 0;
  }

  return {
    awardedBakkalBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    bellPlayed,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerGrocerHonk(
  state: GroceryStoreState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );
  if (dist <= 26.0) {
    state.honkGreetingTimer = 3.5;
    const calloutIdx = Math.floor(Math.random() * GROCER_HUSNU_CALLOUTS.length);
    state.lastHonkCallout = GROCER_HUSNU_CALLOUTS[calloutIdx];
    return true;
  }
  return false;
}
