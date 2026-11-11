import type { Vec2 } from "./types";

export const POST_OFFICE_CENTER: Vec2 = { x: -14.0, z: -92.0 } as const;
export const POST_OFFICE_BAY: Vec2 = { x: -14.0, z: -83.5 } as const;
export const KEMAL_POS: Vec2 = { x: -11.5, z: -85.5 } as const;

export const POST_OFFICE_BUFF_DURATION = 25.0; // 25 saniye "Ekspres Posta Güvencesi" teslimat ve hız buff'ı
export const POST_OFFICE_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const POST_OFFICE_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type PostOfficeState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  stampSoundTimer: number;
  totalVisits: number;
  telegraphPulsePhase: number;
};

export type PostOfficeEvent = {
  awardedPostOfficeBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  stampSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const KEMAL_CALLOUTS = [
  "🏤 Postacı Kemal: Selam kargocu dostum! Bak bu ekspres kargolar sana emanet, damgalar basıldı yola çık hazır! 📬",
  "✉️ Postacı Kemal: Bak postacı geliyor selam veriyor! Mini Kargo ile mahallenin mektupları güvende! 📦",
  "⚡ Postacı Kemal: Telgraf telleri tıkır tıkır çalışıyor, tez elden ulaştır kargoları arslanım! 🏤",
  "📮 Postacı Kemal: Kornanı duydum kargocu kardeşim, bereketli dağıtımlar dilerim! 🌟",
];

export function createPostOfficeState(): PostOfficeState {
  return {
    center: { ...POST_OFFICE_CENTER },
    serviceBay: { ...POST_OFFICE_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    stampSoundTimer: 7.0,
    totalVisits: 0,
    telegraphPulsePhase: 0,
  };
}

export function updatePostOffice(
  state: PostOfficeState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): PostOfficeEvent {
  const event: PostOfficeEvent = {
    awardedPostOfficeBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    stampSoundTriggered: false,
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
  }

  // 2. Telgraf ışığı ve puls fazı
  state.telegraphPulsePhase = (state.telegraphPulsePhase + dt * 6.0) % (Math.PI * 2);

  // 3. Prosedürel ortam posta damgası / telgraf sesi (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.stampSoundTimer -= dt;
    if (state.stampSoundTimer <= 0) {
      event.stampSoundTriggered = true;
      state.stampSoundTimer = 6.0 + Math.random() * 4.0;
    }
  } else {
    state.stampSoundTimer = Math.min(state.stampSoundTimer, 3.5);
  }

  // 4. Servis Peronu Yanaşma Kontrolü (POST_OFFICE_BAY: X: -14.0, Z: -77.0)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const inBay = distToBay < 3.2;

  if (inBay && speed < 1.8) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= POST_OFFICE_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      state.dwellTimer = 0;
      state.cooldownTimer = POST_OFFICE_COOLDOWN;
      state.buffTimer = POST_OFFICE_BUFF_DURATION;
      state.totalVisits += 1;

      event.awardedPostOfficeBonus = true;
      event.cashBonus = 10;
      event.repBonus = 1;
      event.nitroRefill = true;
      event.buffActive = true;
      event.stampSoundTriggered = true;

      const randomIdx = Math.floor(Math.random() * KEMAL_CALLOUTS.length);
      event.callout = KEMAL_CALLOUTS[randomIdx];
      state.callout = event.callout;
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return event;
}

export function triggerPostOfficeHonk(state: PostOfficeState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - KEMAL_POS.x, playerPos.z - KEMAL_POS.z);
  if (dist < 26.0) {
    state.honkGreetingTimer = 4.0;
    const randomIdx = Math.floor(Math.random() * KEMAL_CALLOUTS.length);
    state.lastHonkCallout = KEMAL_CALLOUTS[randomIdx];
    return true;
  }
  return false;
}
