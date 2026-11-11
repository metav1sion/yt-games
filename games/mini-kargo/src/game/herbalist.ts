import type { Vec2 } from "./types";

export const HERBALIST_CENTER: Vec2 = { x: 24.5, z: 42.0 } as const;
export const HERBALIST_BAY: Vec2 = { x: 24.5, z: 47.2 } as const;
export const IDRIS_EFENDI_POS: Vec2 = { x: 22.8, z: 43.6 } as const;
export const MORTAR_POS: Vec2 = { x: 25.2, z: 43.2 } as const;
export const APOTHECARY_VITRINE_POS: Vec2 = { x: 27.0, z: 41.5 } as const;

export const HERBALIST_BUFF_DURATION = 25.0; // 25 saniye "Aktar Şifası & Bitkisel Zindelik" teslimat primi ve çeviklik buff'ı
export const HERBALIST_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const HERBALIST_DWELL_THRESHOLD = 1.2; // 1.2 saniye şifahane peronunda duraklama eşiği

export type HerbalistState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  totalVisits: number;
  mortarSoundTimer: number;
};

export type HerbalistEvent = {
  awardedHerbalBonus: boolean;
  cashBonus: number;
  repBonus: number;
  nitroRefill: boolean;
  buffActive: boolean;
  soundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const IDRIS_EFENDI_CALLOUTS = [
  "🌿 Aktar İdris Efendi: Hoş geldin evlat! Lokman Hekim şifasıyla dertlere deva, kargoya can katarız! 🧪",
  "🌱 Aktar İdris Efendi: Ihlamurumuz taze, zencefilimiz hakiki! Yolların yorgunluğunu anında alır!",
  "✨ Aktar İdris Efendi: Doğanın binbir şifası bu dükkanda! Mini Kargo'ya bereketli seferler dilerim!",
  "🧪 Aktar İdris Efendi: Bir tutam adaçayı, bir kaşık şifalı macun... Yolun daima açık olsun kaptan! 🍯",
];

export function createHerbalistState(): HerbalistState {
  return {
    center: { ...HERBALIST_CENTER },
    serviceBay: { ...HERBALIST_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    totalVisits: 0,
    mortarSoundTimer: 0,
  };
}

export function isHerbalistBuffActive(state: HerbalistState): boolean {
  return state.buffTimer > 0;
}

export function triggerHerbalistHonk(state: HerbalistState, playerPos: Vec2): boolean {
  const dx = playerPos.x - IDRIS_EFENDI_POS.x;
  const dz = playerPos.z - IDRIS_EFENDI_POS.z;
  const dist = Math.hypot(dx, dz);

  if (dist <= 22.0) {
    state.honkGreetingTimer = 4.0;
    const calloutIndex = Math.floor(Math.random() * IDRIS_EFENDI_CALLOUTS.length);
    state.lastHonkCallout = IDRIS_EFENDI_CALLOUTS[calloutIndex];
    return true;
  }
  return false;
}

export function updateHerbalist(
  state: HerbalistState,
  dt: number,
  playerPos: Vec2,
  playerSpeed: number,
): HerbalistEvent {
  // 1. Sayaç güncellemeleri
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

  // 2. Ritmik Havan & Bitki Öğütme Sesi Zamanlayıcısı (Yakın mesafede periyodik tetikleme)
  let soundTriggered = false;
  state.mortarSoundTimer += dt;
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0 && state.mortarSoundTimer >= 5.5) {
    soundTriggered = true;
    state.mortarSoundTimer = 0;
  }

  // 3. Servis Peronu Yanaşma Kontrolü (HERBALIST_BAY: X: 24.5, Z: 47.2)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const inBay = distToBay <= 3.8;
  const isStopped = Math.abs(playerSpeed) <= 0.6;

  let awardedHerbalBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;
  let honkGreeted = false;
  let callout: string | undefined;

  if (inBay && isStopped) {
    state.dwellTimer += dt;

    if (state.dwellTimer >= HERBALIST_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      state.cooldownTimer = HERBALIST_COOLDOWN;
      state.buffTimer = HERBALIST_BUFF_DURATION;
      state.dwellTimer = 0;
      state.totalVisits += 1;

      awardedHerbalBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      soundTriggered = true;

      state.honkGreetingTimer = 5.0;
      const calloutIndex = (state.totalVisits - 1) % IDRIS_EFENDI_CALLOUTS.length;
      state.lastHonkCallout = IDRIS_EFENDI_CALLOUTS[calloutIndex];
      callout = state.lastHonkCallout;
      honkGreeted = true;
    }
  } else {
    // Perondan ayrılınca bekleme sayacını yumuşakça sıfırla
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedHerbalBonus,
    cashBonus,
    repBonus,
    nitroRefill,
    buffActive: state.buffTimer > 0,
    soundTriggered,
    honkGreeted: honkGreeted || state.honkGreetingTimer > 0,
    callout: callout || (state.honkGreetingTimer > 0 ? state.lastHonkCallout : undefined),
  };
}
