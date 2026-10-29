import type { Vec2 } from "./types";

export const ICE_CREAM_STAND_CENTER: Vec2 = { x: -21.0, z: 84.4 } as const;
export const ICE_CREAM_BAY: Vec2 = { x: -21.0, z: 80.5 } as const;
export const ICE_CREAM_MASTER_ALI_POS: Vec2 = { x: -21.0, z: 83.5 } as const;
export const VOLLEYBALL_COURT_CENTER: Vec2 = { x: -27.0, z: 87.0 } as const;
export const SUN_TERRACE_CENTER: Vec2 = { x: -16.5, z: 85.5 } as const;

export const ICE_CREAM_BUFF_DURATION = 25.0; // 25 saniye "Buz Gibi Maraş Dondurması" hız & zindelik dopingi
export const ICE_CREAM_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const ICE_CREAM_DWELL_THRESHOLD = 1.2; // 1.2 saniye dondurmacı önünde duraklama eşiği

export type IceCreamStandState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  bellSoundTimer: number;
  totalVisits: number;
  trickActive: boolean;
  trickTimer: number;
};

export type IceCreamStandEvent = {
  awardedIceCreamBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  bellRung: boolean;
  trickActive: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const ICE_CREAM_MASTER_ALI_CALLOUTS = [
  "🍦 Maraşlı Ali Usta: Yakala külahı bakalım! Hakiki keçi sütü dövme dondurma! 🍨",
  "🔔 Maraşlı Ali Usta: Çevir çevir düşmez! Kargo kaptanına buz gibi serinlik! 🚀",
  "🍦 Maraşlı Ali Usta: Maraş'ın hası burada! Bir külah dondurma, bin yıllık lezzet! 🌟",
  "🏐 Maraşlı Ali Usta: Sahilin güneşi sıcak ama dondurmamız buz gibi! Afiyet olsun! 🏖️",
];

export function createIceCreamStandState(): IceCreamStandState {
  return {
    center: { ...ICE_CREAM_STAND_CENTER },
    serviceBay: { ...ICE_CREAM_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    bellSoundTimer: 8.0,
    totalVisits: 0,
    trickActive: false,
    trickTimer: 0,
  };
}

export function updateIceCreamStand(
  state: IceCreamStandState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): IceCreamStandEvent {
  let bellRung = false;

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

  if (state.trickActive) {
    state.trickTimer = Math.max(0, state.trickTimer - dt);
    if (state.trickTimer <= 0) {
      state.trickActive = false;
    }
  }

  // 2. Dondurmacı çıngırağı ortam sesi simülasyonu
  state.bellSoundTimer -= dt;
  const distToStand = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.bellSoundTimer <= 0) {
    state.bellSoundTimer = 16.0 + Math.random() * 8.0;
    if (distToStand <= 32.0) {
      bellRung = true;
    }
  }

  // 3. "Maraş Dondurması Molası" Ziyaret ve Dinlenme Kontrolü
  let awardedIceCreamBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  if (distToStand <= 6.0 && playerSpeed < 1.2 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= ICE_CREAM_DWELL_THRESHOLD) {
      awardedIceCreamBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      bellRung = true;
      state.buffTimer = ICE_CREAM_BUFF_DURATION;
      state.cooldownTimer = ICE_CREAM_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      state.trickActive = true;
      state.trickTimer = 3.5;

      // Ali Usta tebrik ve şaka konuşması
      state.honkGreetingTimer = 4.0;
      state.lastHonkCallout = ICE_CREAM_MASTER_ALI_CALLOUTS[0];
    }
  } else if (distToStand > 6.0 || playerSpeed >= 1.2) {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 1.5);
  }

  return {
    awardedIceCreamBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    bellRung,
    trickActive: state.trickActive,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerIceCreamStandHonk(
  state: IceCreamStandState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - ICE_CREAM_MASTER_ALI_POS.x,
    playerPos.z - ICE_CREAM_MASTER_ALI_POS.z,
  );
  if (dist <= 24.0) {
    state.honkGreetingTimer = 4.0;
    state.trickActive = true;
    state.trickTimer = 3.5;
    const idx = Math.floor(Math.random() * ICE_CREAM_MASTER_ALI_CALLOUTS.length);
    state.lastHonkCallout = ICE_CREAM_MASTER_ALI_CALLOUTS[idx];
    return true;
  }
  return false;
}
