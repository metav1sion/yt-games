import type { Vec2 } from "./types";

export const TURKISH_COFFEE_CENTER: Vec2 = { x: 37.0, z: 75.5 } as const;
export const TURKISH_COFFEE_BAY: Vec2 = { x: 37.0, z: 81.0 } as const;
export const TAHSIN_EFENDI_POS: Vec2 = { x: 35.5, z: 76.8 } as const;

export const TURKISH_COFFEE_BUFF_DURATION = 25.0; // 25 saniye "Kırk Yıllık Hatır" müşteri memnuniyeti & bahşiş primi buff'ı
export const TURKISH_COFFEE_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const TURKISH_COFFEE_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type TurkishCoffeeState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  coffeeSoundTimer: number;
  totalVisits: number;
  emberGlowPhase: number;
  grinderCrankPhase: number;
};

export type TurkishCoffeeEvent = {
  awardedTurkishCoffeeBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  coffeeSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const TAHSIN_EFENDI_CALLOUTS = [
  "☕ Kahveci Tahsin Efendi: Hoş geldin kargocu dostum! Közde kahvemiz pişti, bir fincanın kırk yıl hatırı vardır! 🍬",
  "✨ Kahveci Tahsin Efendi: Hakiki Yemen kahvesi ve çifte kavrulmuş Antep fıstıklı lokumla yola güç kat! 🚚",
  "🔥 Kahveci Tahsin Efendi: Bakır cezvede köpüğü bol kahve, Mini Kargo gibi şehre can veriyor! ☕",
  "🌟 Kahveci Tahsin Efendi: Kornanı duydum kaptan! Lokumun tatlısı, kahvenin hatırı seninle olsun! 📦",
];

export function createTurkishCoffeeState(): TurkishCoffeeState {
  return {
    center: { ...TURKISH_COFFEE_CENTER },
    serviceBay: { ...TURKISH_COFFEE_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    coffeeSoundTimer: 6.0,
    totalVisits: 0,
    emberGlowPhase: 0,
    grinderCrankPhase: 0,
  };
}

export function updateTurkishCoffee(
  state: TurkishCoffeeState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): TurkishCoffeeEvent {
  const event: TurkishCoffeeEvent = {
    awardedTurkishCoffeeBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    coffeeSoundTriggered: false,
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

  // 2. Köz mangalı ve el değirmeni mekanik animasyon fazları
  state.emberGlowPhase = (state.emberGlowPhase + dt * 4.5) % (Math.PI * 2);
  state.grinderCrankPhase = (state.grinderCrankPhase + dt * 3.0) % (Math.PI * 2);

  // 3. Prosedürel ortam kahve kavurma / közde cezve sesi (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.coffeeSoundTimer -= dt;
    if (state.coffeeSoundTimer <= 0) {
      event.coffeeSoundTriggered = true;
      state.coffeeSoundTimer = 5.0 + Math.random() * 3.5;
    }
  }

  // 4. Servis peronunda duraklama kontrolü (TURKISH_COFFEE_BAY: X: 37.0, Z: 81.0)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const isInBay = distToBay <= 3.8;
  const isStopped = Math.abs(speed) <= 1.2;

  if (isInBay && isStopped) {
    if (state.cooldownTimer <= 0) {
      state.dwellTimer += dt;
      if (state.dwellTimer >= TURKISH_COFFEE_DWELL_THRESHOLD) {
        state.dwellTimer = 0;
        state.buffTimer = TURKISH_COFFEE_BUFF_DURATION;
        state.cooldownTimer = TURKISH_COFFEE_COOLDOWN;
        state.totalVisits += 1;

        event.awardedTurkishCoffeeBonus = true;
        event.cashBonus = 10;
        event.repBonus = 1;
        event.nitroRefill = true;
        event.buffActive = true;
        event.coffeeSoundTriggered = true;

        state.lastHonkCallout = TAHSIN_EFENDI_CALLOUTS[0];
        state.honkGreetingTimer = 5.0;
        event.honkGreeted = true;
        event.callout = state.lastHonkCallout;
      }
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return event;
}

export function triggerTurkishCoffeeHonk(state: TurkishCoffeeState, playerPos: Vec2): boolean {
  const distToTahsin = Math.hypot(playerPos.x - TAHSIN_EFENDI_POS.x, playerPos.z - TAHSIN_EFENDI_POS.z);
  if (distToTahsin <= 24.0) {
    const idx = Math.floor(Math.random() * TAHSIN_EFENDI_CALLOUTS.length);
    state.lastHonkCallout = TAHSIN_EFENDI_CALLOUTS[idx];
    state.honkGreetingTimer = 4.5;
    return true;
  }
  return false;
}

export function isTurkishCoffeeBuffActive(state: TurkishCoffeeState): boolean {
  return state.buffTimer > 0;
}
