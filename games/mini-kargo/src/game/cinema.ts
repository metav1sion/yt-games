import type { Vec2 } from "./types";

export const CINEMA_CENTER: Vec2 = { x: -26.0, z: 42.0 } as const;
export const CINEMA_BAY: Vec2 = { x: -26.0, z: 47.2 } as const;
export const CINEMA_SCREEN_POS: Vec2 = { x: -26.0, z: 37.5 } as const;
export const RIFAT_POS: Vec2 = { x: -28.8, z: 46.2 } as const;

export const CINEMA_BUFF_DURATION = 25.0; // 25 saniye "Yazlık Sinema Keyfi" sürat ve neşe buff'ı
export const CINEMA_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const CINEMA_DWELL_THRESHOLD = 1.2; // 1.2 saniye sinema peronunda duraklama eşiği

export type CinemaState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  projectorSoundTimer: number;
  totalVisits: number;
  filmReelPhase: number;
  projectorFlickerPhase: number;
};

export type CinemaEvent = {
  awardedCinemaBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  projectorSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const RIFAT_CALLOUTS = [
  "🎬 Makinist Rıfat: Hoş geldin kargocu dostum! İki film birden makaralar dönüyor, taze patlamış mısırını al geç! 🍿",
  "✨ Makinist Rıfat: Bu akşam Türk sineması gecesi! Selvi Boylum Al Yazmalım perdede! 📽️",
  "🎞️ Makinist Rıfat: 35 milimetre hakiki film makarası! Kömür ark lambası yandı mı cıvıl cıvıl olur sahil! 🌟",
  "🍿 Makinist Rıfat: Soğuk gazozunu aç, çekirdeğini çitle! Yaz gecelerinin neşesi sinemadadır! 🥤",
];

export function createCinemaState(): CinemaState {
  return {
    center: { ...CINEMA_CENTER },
    serviceBay: { ...CINEMA_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    projectorSoundTimer: 7.0,
    totalVisits: 0,
    filmReelPhase: 0,
    projectorFlickerPhase: 0,
  };
}

export function updateCinema(
  state: CinemaState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): CinemaEvent {
  const event: CinemaEvent = {
    awardedCinemaBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    projectorSoundTriggered: false,
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

  // 2. Film makarası dönüşü ve projektör titreşimi fazları
  state.filmReelPhase = (state.filmReelPhase + dt * 5.2) % (Math.PI * 2);
  state.projectorFlickerPhase = (state.projectorFlickerPhase + dt * 14.0) % (Math.PI * 2);

  // 3. Prosedürel 35mm film projektör çarkı ortam ses döngüsü (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.projectorSoundTimer -= dt;
    if (state.projectorSoundTimer <= 0) {
      event.projectorSoundTriggered = true;
      state.projectorSoundTimer = 5.5 + Math.random() * 3.5;
    }
  } else {
    state.projectorSoundTimer = Math.min(state.projectorSoundTimer, 3.5);
  }

  // 4. Servis Peronu Yanaşma Kontrolü (CINEMA_BAY: X: -26.0, Z: 47.2)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const inBay = distToBay < 3.2;

  if (inBay && speed < 1.8) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= CINEMA_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      state.dwellTimer = 0;
      state.cooldownTimer = CINEMA_COOLDOWN;
      state.buffTimer = CINEMA_BUFF_DURATION;
      state.totalVisits += 1;

      event.awardedCinemaBonus = true;
      event.cashBonus = 10;
      event.repBonus = 1;
      event.nitroRefill = true;
      event.buffActive = true;
      event.projectorSoundTriggered = true;

      const randomIdx = Math.floor(Math.random() * RIFAT_CALLOUTS.length);
      event.callout = RIFAT_CALLOUTS[randomIdx];
      state.callout = event.callout;
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return event;
}

export function triggerCinemaHonk(state: CinemaState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - RIFAT_POS.x, playerPos.z - RIFAT_POS.z);
  if (dist < 26.0) {
    state.honkGreetingTimer = 4.0;
    const randomIdx = Math.floor(Math.random() * RIFAT_CALLOUTS.length);
    state.lastHonkCallout = RIFAT_CALLOUTS[randomIdx];
    return true;
  }
  return false;
}
