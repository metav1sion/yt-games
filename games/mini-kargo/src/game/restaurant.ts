import type { Vec2 } from "./types";

export const RESTAURANT_CENTER: Vec2 = { x: 30.0, z: -57.0 } as const;
export const RESTAURANT_BAY: Vec2 = { x: 30.0, z: -52.5 } as const;
export const CHEF_HAKKI_POS: Vec2 = { x: 28.5, z: -53.6 } as const;

export const RESTAURANT_BUFF_DURATION = 25.0; // 25 saniye "Sanayi Tabldot Zindeliği" güç & hızlanma dopingi
export const RESTAURANT_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const RESTAURANT_DWELL_THRESHOLD = 1.2; // 1.2 saniye lokanta önünde duraklama eşiği

export type RestaurantState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  ladleSoundTimer: number;
  totalVisits: number;
  spitRotation: number;
};

export type RestaurantEvent = {
  awardedMealBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  ladleSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const CHEF_HAKKI_CALLOUTS = [
  "🍲 Aşçı Hakkı Usta: Gel kaptan geeel! Kuru fasulye fırından yeni çıktı, pilav tane tane! 🍚",
  "🥩 Aşçı Hakkı Usta: Yaprak dönerimiz nar gibi kızardı! Sanayi kaptanına bol porsiyon! 🥖",
  "🥣 Aşçı Hakkı Usta: Sıcak bir mercimek çorbası iç, yola zinde devam et! Afiyet bal şeker olsun! 🌟",
  "🚚 Aşçı Hakkı Usta: Kargonun bereketi lokantamızın lezzetiyle birleşti! Kolay gelsin kaptan! 📦",
];

export function createRestaurantState(): RestaurantState {
  return {
    center: { ...RESTAURANT_CENTER },
    serviceBay: { ...RESTAURANT_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    ladleSoundTimer: 7.5,
    totalVisits: 0,
    spitRotation: 0,
  };
}

export function updateRestaurant(
  state: RestaurantState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): RestaurantEvent {
  let ladleSoundTriggered = false;

  // 1. Döner ocağı sürekli dönüş simülasyonu
  state.spitRotation = (state.spitRotation + dt * 0.8) % (Math.PI * 2);

  // 2. Sayaç ve süre güncellemeleri
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

  // 3. Ortam kepçe ve cızırtı sesi simülasyonu (oyuncu yakınken)
  state.ladleSoundTimer -= dt;
  const distToBay = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.ladleSoundTimer <= 0) {
    state.ladleSoundTimer = 9.0 + Math.random() * 5.0;
    if (distToBay < 22.0) {
      ladleSoundTriggered = true;
    }
  }

  // 4. Oyuncu servis peronu etkileşimi (1.2 saniye duraklama)
  let awardedMealBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  const isAtBay = distToBay <= 4.2;
  const isStopped = playerSpeed <= 1.5;

  if (isAtBay && isStopped && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= RESTAURANT_DWELL_THRESHOLD) {
      // Bonus kazanıldı!
      awardedMealBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = RESTAURANT_BUFF_DURATION;
      state.cooldownTimer = RESTAURANT_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      ladleSoundTriggered = true;

      // Aşçı Hakkı Usta özel karşılama
      state.honkGreetingTimer = 4.5;
      state.lastHonkCallout =
        CHEF_HAKKI_CALLOUTS[
          Math.floor(Math.random() * CHEF_HAKKI_CALLOUTS.length)
        ];
    }
  } else if (!isAtBay || !isStopped) {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedMealBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    ladleSoundTriggered,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerRestaurantHonk(
  state: RestaurantState,
  playerPos: Vec2,
): boolean {
  const distToChef = Math.hypot(
    playerPos.x - CHEF_HAKKI_POS.x,
    playerPos.z - CHEF_HAKKI_POS.z,
  );

  if (distToChef <= 24.0) {
    state.honkGreetingTimer = 4.0;
    state.lastHonkCallout =
      CHEF_HAKKI_CALLOUTS[
        Math.floor(Math.random() * CHEF_HAKKI_CALLOUTS.length)
      ];
    return true;
  }
  return false;
}
