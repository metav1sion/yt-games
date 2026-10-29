import type { Vec2 } from "./types";

export const LIGHTHOUSE_CENTER: Vec2 = { x: -28.0, z: 91.0 } as const;
export const LIGHTHOUSE_BAY: Vec2 = { x: -28.0, z: 82.0 } as const;
export const RIZA_KAPTAN_POS: Vec2 = { x: -26.5, z: 83.8 } as const;

export const LIGHTHOUSE_BUFF_DURATION = 25.0; // 25 saniye "Fener Rehberliği" gece görüşü & hız/nitro dopingi
export const LIGHTHOUSE_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const LIGHTHOUSE_DWELL_THRESHOLD = 1.2; // 1.2 saniye rıhtım peronunda duraklama eşiği

export type LighthouseState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  fogHornSoundTimer: number;
  totalVisits: number;
  beamRotation: number;
  telescopeScanPhase: number;
};

export type LighthouseEvent = {
  awardedGuidanceBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  fogHornTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const RIZA_KAPTAN_CALLOUTS = [
  "⚓ Fenerci Rıza Kaptan: Heyy gidi deniz kurdu! Fenerin ışığı pruvana rehber olsun! 🌊",
  "🏮 Fenerci Rıza Kaptan: Sis basınca düdüğü çalarız, kargo gemisini de kamyonetini de limana sağ salim yanaştırırız! 🚢",
  "🔭 Fenerci Rıza Kaptan: Dürbünümle ufka baktım, yolun açık evlat! Pupa yelken gazla! 🌟",
  "🧭 Fenerci Rıza Kaptan: Deniz fenerinin ışığı hiç sönmez, Mini Kargo'nun rotası şaşmaz! Kolay gelsin! 📦",
];

export function createLighthouseState(): LighthouseState {
  return {
    center: { ...LIGHTHOUSE_CENTER },
    serviceBay: { ...LIGHTHOUSE_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    fogHornSoundTimer: 8.0,
    totalVisits: 0,
    beamRotation: 0,
    telescopeScanPhase: 0,
  };
}

export function updateLighthouse(
  state: LighthouseState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): LighthouseEvent {
  let fogHornTriggered = false;

  // 1. Dönen arama ışığı ve deniz dürbünü tarama açıları
  state.beamRotation = (state.beamRotation + dt * 0.75) % (Math.PI * 2);
  state.telescopeScanPhase = (state.telescopeScanPhase + dt * 2.2) % (Math.PI * 2);

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

  // 3. Periyodik deniz sis düdüğü (foghorn) tetikleyicisi (oyuncu yakınken)
  state.fogHornSoundTimer -= dt;
  const distToBay = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.fogHornSoundTimer <= 0) {
    state.fogHornSoundTimer = 22.0 + Math.random() * 10.0;
    if (distToBay < 45.0) {
      fogHornTriggered = true;
    }
  }

  // 4. Oyuncu rıhtım peronu etkileşimi (1.2 saniye duraklama)
  let awardedGuidanceBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  const inBay = distToBay < 3.2;
  const isStopped = Math.abs(playerSpeed) < 0.6;

  if (inBay && isStopped) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= LIGHTHOUSE_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      awardedGuidanceBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = LIGHTHOUSE_BUFF_DURATION;
      state.cooldownTimer = LIGHTHOUSE_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      fogHornTriggered = true;

      // Rıza Kaptan teşekkür ve denizci rehberlik repliği
      state.honkGreetingTimer = 4.5;
      state.lastHonkCallout = RIZA_KAPTAN_CALLOUTS[0];
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedGuidanceBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    fogHornTriggered,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerLighthouseHonk(
  state: LighthouseState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - RIZA_KAPTAN_POS.x,
    playerPos.z - RIZA_KAPTAN_POS.z,
  );

  if (dist <= 26.0) {
    state.honkGreetingTimer = 4.0;
    const calloutIndex = Math.floor(Math.random() * RIZA_KAPTAN_CALLOUTS.length);
    state.lastHonkCallout = RIZA_KAPTAN_CALLOUTS[calloutIndex];
    return true;
  }
  return false;
}
