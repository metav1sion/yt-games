import type { Vec2 } from "./types";

export const LIFESAVING_CENTER: Vec2 = { x: -68.0, z: 89.0 } as const;
export const LIFESAVING_BAY: Vec2 = { x: -68.0, z: 80.5 } as const;
export const SUKRU_KAPTAN_POS: Vec2 = { x: -65.5, z: 85.5 } as const;

export const LIFESAVING_BUFF_DURATION = 25.0; // 25 saniye "Kıyı Emniyeti Güvencesi" suda kızaklama (hydroplane) bağışıklığı & teslimat bahşiş primi buff'ı
export const LIFESAVING_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const LIFESAVING_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type LifesavingState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  soundTimer: number;
  totalVisits: number;
  winchCrankPhase: number;
  lanternGlowPhase: number;
  bellSwingPhase: number;
};

export type LifesavingEvent = {
  awardedLifesavingBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  soundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const SUKRU_KAPTAN_CALLOUTS = [
  "🛟 Tahlisiye Reisi Şükrü Kaptan: Selam kargocu evlat! Kıyı Emniyeti 7/24 nöbette, fırtına kopsa da yolun açık olsun! 🌊",
  "⚓ Tahlisiye Reisi Şükrü Kaptan: Tahlisiye-1 can kurtarma botumuz her an göreve hazır! Islak yollarda hız kesme, deniz kuralları can kurtarır! 🚤",
  "🔔 Tahlisiye Reisi Şükrü Kaptan: Sis çanını çaldık, pusulan şaşmasın! Mini Kargo sahillerimizin gururu! 🚚",
  "🌟 Tahlisiye Reisi Şükrü Kaptan: Kornanı duydum kaptan! Can simidimiz hazır, pruvan neta olsun! 📦",
];

export function createLifesavingState(): LifesavingState {
  return {
    center: { ...LIFESAVING_CENTER },
    serviceBay: { ...LIFESAVING_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    soundTimer: 6.0,
    totalVisits: 0,
    winchCrankPhase: 0,
    lanternGlowPhase: 0,
    bellSwingPhase: 0,
  };
}

export function updateLifesaving(
  state: LifesavingState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): LifesavingEvent {
  const event: LifesavingEvent = {
    awardedLifesavingBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    soundTriggered: false,
    honkGreeted: false,
  };

  // 1. Buff ve soğuma sayaçları
  if (state.buffTimer > 0) {
    state.buffTimer = Math.max(0, state.buffTimer - dt);
  }
  event.buffActive = state.buffTimer > 0;

  if (state.cooldownTimer > 0) {
    state.cooldownTimer = Math.max(0, state.cooldownTimer - dt);
  }

  if (state.honkGreetingTimer > 0) {
    state.honkGreetingTimer = Math.max(0, state.honkGreetingTimer - dt);
    event.honkGreeted = true;
    event.callout = state.lastHonkCallout;
    state.callout = state.lastHonkCallout;
  } else {
    state.callout = undefined;
  }

  // 2. Mekanik animasyon fazları (Vinç, fener ve sis çanı salınımı)
  state.winchCrankPhase = (state.winchCrankPhase + dt * 2.8) % (Math.PI * 2);
  state.lanternGlowPhase = (state.lanternGlowPhase + dt * 4.0) % (Math.PI * 2);
  state.bellSwingPhase = (state.bellSwingPhase + dt * 3.2) % (Math.PI * 2);

  // 3. Prosedürel ortam sis çanı & vinç tıkırtısı sesi (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.soundTimer -= dt;
    if (state.soundTimer <= 0) {
      event.soundTriggered = true;
      state.soundTimer = 5.0 + Math.random() * 3.5;
    }
  }

  // 4. Servis peronunda duraklama kontrolü (LIFESAVING_BAY: X: -68.0, Z: 80.5)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const isInBay = distToBay <= 3.8;
  const isStopped = Math.abs(speed) <= 1.2;

  if (isInBay && isStopped) {
    if (state.cooldownTimer <= 0) {
      state.dwellTimer += dt;
      if (state.dwellTimer >= LIFESAVING_DWELL_THRESHOLD) {
        state.dwellTimer = 0;
        state.buffTimer = LIFESAVING_BUFF_DURATION;
        state.cooldownTimer = LIFESAVING_COOLDOWN;
        state.totalVisits += 1;

        event.awardedLifesavingBonus = true;
        event.cashBonus = 10;
        event.repBonus = 1;
        event.nitroRefill = true;
        event.buffActive = true;
        event.soundTriggered = true;

        const calloutIdx = (state.totalVisits - 1) % SUKRU_KAPTAN_CALLOUTS.length;
        event.callout = SUKRU_KAPTAN_CALLOUTS[calloutIdx];
        state.callout = event.callout;
      }
    }
  } else {
    state.dwellTimer = 0;
  }

  return event;
}

export function triggerLifesavingHonk(state: LifesavingState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (dist <= 26.0) {
    state.honkGreetingTimer = 5.0;
    const randomIdx = Math.floor(Math.random() * SUKRU_KAPTAN_CALLOUTS.length);
    state.lastHonkCallout = SUKRU_KAPTAN_CALLOUTS[randomIdx];
    state.callout = state.lastHonkCallout;
    return true;
  }
  return false;
}
