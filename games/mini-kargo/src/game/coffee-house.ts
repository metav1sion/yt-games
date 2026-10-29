import type { Vec2 } from "./types";

export const COFFEE_HOUSE_CENTER: Vec2 = { x: 38.5, z: 62.0 } as const;
export const COFFEE_HOUSE_BAY: Vec2 = { x: 43.0, z: 56.5 } as const;
export const COFFEE_MASTER_BEKIR_POS: Vec2 = { x: 40.5, z: 58.5 } as const;

export const COFFEE_BUFF_DURATION = 25.0; // 25 saniye "Közde Kahve Zindeliği"
export const COFFEE_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const COFFEE_DWELL_THRESHOLD = 1.2; // 1.2 saniye kıraathane önünde duraklama eşiği

export type CoffeeHouseState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  diceSoundTimer: number;
  totalVisits: number;
};

export type CoffeeHouseEvent = {
  awardedCoffeeBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  dicePlayed: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const COFFEE_MASTER_BEKIR_CALLOUTS = [
  "☕ Kahveci Bekir Usta: Hoş geldin evlat! Közde kahvemiz taze, tavla masası hazır! 🎲",
  "🍵 Kahveci Bekir Usta: Çek bir tavşan kanı çay! Kargonun yorgunluğunu alır! ⭐",
  "🎲 Kahveci Bekir Usta: Mars olmak yok ama! Esnafın kahvesi her daim kaynar! ☕",
  "🌿 Kahveci Bekir Usta: Çınaraltının gölgesi gibisi yok, afiyet olsun kaptan! 📦",
];

export function createCoffeeHouseState(): CoffeeHouseState {
  return {
    center: { ...COFFEE_HOUSE_CENTER },
    serviceBay: { ...COFFEE_HOUSE_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    diceSoundTimer: 7.0,
    totalVisits: 0,
  };
}

export function updateCoffeeHouse(
  state: CoffeeHouseState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): CoffeeHouseEvent {
  let dicePlayed = false;

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

  // 2. Tavla zarı atılma ortam sesi simülasyonu
  state.diceSoundTimer -= dt;
  const distToCoffeeHouse = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.diceSoundTimer <= 0) {
    state.diceSoundTimer = 14.0 + Math.random() * 8.0;
    if (distToCoffeeHouse <= 30.0) {
      dicePlayed = true;
    }
  }

  // 3. "Esnaf Kahvesi" Ziyaret ve Dinlenme Kontrolü
  let awardedCoffeeBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  if (distToCoffeeHouse <= 6.0 && playerSpeed < 1.2 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= COFFEE_DWELL_THRESHOLD) {
      awardedCoffeeBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = COFFEE_BUFF_DURATION;
      state.cooldownTimer = COFFEE_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      dicePlayed = true;

      // Bekir Usta tebrik konuşması
      state.honkGreetingTimer = 4.0;
      state.lastHonkCallout = COFFEE_MASTER_BEKIR_CALLOUTS[0];
    }
  } else if (distToCoffeeHouse > 6.0 || playerSpeed >= 1.2) {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 1.5);
  }

  return {
    awardedCoffeeBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    dicePlayed,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerCoffeeHouseHonk(
  state: CoffeeHouseState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - COFFEE_MASTER_BEKIR_POS.x,
    playerPos.z - COFFEE_MASTER_BEKIR_POS.z,
  );
  if (dist <= 24.0) {
    state.honkGreetingTimer = 4.0;
    const idx = Math.floor(Math.random() * COFFEE_MASTER_BEKIR_CALLOUTS.length);
    state.lastHonkCallout = COFFEE_MASTER_BEKIR_CALLOUTS[idx];
    return true;
  }
  return false;
}
