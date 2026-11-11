import type { Vec2 } from "./types";

export const FOUNDRY_CENTER: Vec2 = { x: 37.5, z: -75.0 } as const;
export const FOUNDRY_BAY: Vec2 = { x: 37.5, z: -68.0 } as const;
export const HAMDI_USTA_POS: Vec2 = { x: 36.0, z: -72.5 } as const;

export const FOUNDRY_BUFF_DURATION = 25.0; // 25 saniye "Sanayi Çeliği Dayanıklılığı" şasi zırhı & teslimat primi
export const FOUNDRY_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const FOUNDRY_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type FoundryState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  hammerSoundTimer: number;
  totalVisits: number;
  furnacePulsePhase: number;
};

export type FoundryEvent = {
  awardedFoundryBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  hammerSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const HAMDI_USTA_CALLOUTS = [
  "⚒️ Demirci Hamdi Usta: Hoş geldin kargocu evlat! Sıcak çelik örste dövülür, kargo kasası döküm demir gibi sağlam olmalı! 🔥",
  "🔥 Demirci Hamdi Usta: Şahmerdan vurdukça kıvılcımlar saçar! Bu şasiye hiçbir çukur sökmez arslanım! ⚒️",
  "⚡ Demirci Hamdi Usta: Haddehaneden taze çıktı inşaat çeliği, Mini Kargo ile sanayi dimdik ayakta! 🏗️",
  "🛡️ Demirci Hamdi Usta: Kornanı duydum kaptan! Çeliğin tavı yerinde, kazasız belasız teslimatlar! 🌟",
];

export function createFoundryState(): FoundryState {
  return {
    center: { ...FOUNDRY_CENTER },
    serviceBay: { ...FOUNDRY_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    hammerSoundTimer: 6.0,
    totalVisits: 0,
    furnacePulsePhase: 0,
  };
}

export function updateFoundry(
  state: FoundryState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): FoundryEvent {
  const event: FoundryEvent = {
    awardedFoundryBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    hammerSoundTriggered: false,
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

  // 2. Ocağın termal akkor titreşim fazı
  state.furnacePulsePhase = (state.furnacePulsePhase + dt * 5.0) % (Math.PI * 2);

  // 3. Prosedürel ortam şahmerdan / örs çekiç sesi (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.hammerSoundTimer -= dt;
    if (state.hammerSoundTimer <= 0) {
      event.hammerSoundTriggered = true;
      state.hammerSoundTimer = 5.0 + Math.random() * 3.5;
    }
  }

  // 4. Servis peronunda duraklama kontrolü
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const isInBay = distToBay <= 3.8;
  const isStopped = Math.abs(speed) <= 1.2;

  if (isInBay && isStopped) {
    if (state.cooldownTimer <= 0) {
      state.dwellTimer += dt;
      if (state.dwellTimer >= FOUNDRY_DWELL_THRESHOLD) {
        state.dwellTimer = 0;
        state.buffTimer = FOUNDRY_BUFF_DURATION;
        state.cooldownTimer = FOUNDRY_COOLDOWN;
        state.totalVisits += 1;

        event.awardedFoundryBonus = true;
        event.cashBonus = 10;
        event.repBonus = 1;
        event.nitroRefill = true;
        event.buffActive = true;
        event.hammerSoundTriggered = true;

        state.lastHonkCallout = HAMDI_USTA_CALLOUTS[0];
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

export function triggerFoundryHonk(state: FoundryState, playerPos: Vec2): boolean {
  const distToHamdi = Math.hypot(playerPos.x - HAMDI_USTA_POS.x, playerPos.z - HAMDI_USTA_POS.z);
  if (distToHamdi <= 24.0) {
    const idx = Math.floor(Math.random() * HAMDI_USTA_CALLOUTS.length);
    state.lastHonkCallout = HAMDI_USTA_CALLOUTS[idx];
    state.honkGreetingTimer = 4.5;
    return true;
  }
  return false;
}

export function isFoundryBuffActive(state: FoundryState): boolean {
  return state.buffTimer > 0;
}
