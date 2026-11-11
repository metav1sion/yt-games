import type { Vec2 } from "./types";

export const LATHE_WORKSHOP_CENTER: Vec2 = { x: 40.0, z: -58.0 } as const;
export const LATHE_WORKSHOP_BAY: Vec2 = { x: 40.0, z: -52.8 } as const;
export const NECATI_USTA_POS: Vec2 = { x: 37.8, z: -54.6 } as const;
export const LATHE_MACHINE_POS: Vec2 = { x: 40.0, z: -57.5 } as const;
export const HYDRAULIC_PRESS_POS: Vec2 = { x: 42.6, z: -57.5 } as const;

export const LATHE_WORKSHOP_BUFF_DURATION = 25.0; // 25 saniye "Sanayi Hassasiyeti & Torna Ayarı" nitro/çeviklik & teslimat primi
export const LATHE_WORKSHOP_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const LATHE_WORKSHOP_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type LatheWorkshopState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  machineSoundTimer: number;
  totalVisits: number;
  latheSpinAngle: number;
  pressCycle: number;
};

export type LatheWorkshopEvent = {
  awardedLatheBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  soundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const NECATI_USTA_CALLOUTS = [
  "⚙️ Necati Usta: Hoş geldin evlat! Binde bir milim hassasiyetle işleriz! 🔩",
  "⏱️ Necati Usta: Çarklar döner, torna işler! Yolun açık olsun! ⚙️",
  "🔩 Necati Usta: Pres bastı, mikrometreyle ölçüldü! Çelik gibi teslimat! 📏",
  "🌟 Necati Usta: Torna aynası senin için dönüyor, gazla kaptan! 🚀",
];

export function createLatheWorkshopState(): LatheWorkshopState {
  return {
    center: { ...LATHE_WORKSHOP_CENTER },
    serviceBay: { ...LATHE_WORKSHOP_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    machineSoundTimer: 5.5,
    totalVisits: 0,
    latheSpinAngle: 0,
    pressCycle: 0,
  };
}

export function updateLatheWorkshop(
  state: LatheWorkshopState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): LatheWorkshopEvent {
  const event: LatheWorkshopEvent = {
    awardedLatheBonus: false,
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

  // 2. Torna aynası ve hidrolik pres animasyon döngüsü
  state.latheSpinAngle = (state.latheSpinAngle + dt * 14.0) % (Math.PI * 2);
  state.pressCycle = (state.pressCycle + dt * 0.75) % 1.0;

  // 3. Prosedürel torna & pres sesi (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.machineSoundTimer -= dt;
    if (state.machineSoundTimer <= 0) {
      event.soundTriggered = true;
      state.machineSoundTimer = 5.0 + Math.random() * 3.5;
    }
  }

  // 4. Servis peronunda duraklama kontrolü
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const isInBay = distToBay <= 3.8;
  const isStopped = Math.abs(speed) <= 1.2;

  if (isInBay && isStopped) {
    if (state.cooldownTimer <= 0) {
      state.dwellTimer += dt;
      if (state.dwellTimer >= LATHE_WORKSHOP_DWELL_THRESHOLD) {
        state.dwellTimer = 0;
        state.buffTimer = LATHE_WORKSHOP_BUFF_DURATION;
        state.cooldownTimer = LATHE_WORKSHOP_COOLDOWN;
        state.totalVisits += 1;

        event.awardedLatheBonus = true;
        event.cashBonus = 10;
        event.repBonus = 1;
        event.nitroRefill = true;
        event.buffActive = true;
        event.soundTriggered = true;

        state.lastHonkCallout = NECATI_USTA_CALLOUTS[0];
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

export function triggerLatheWorkshopHonk(state: LatheWorkshopState, playerPos: Vec2): boolean {
  const distToNecati = Math.hypot(playerPos.x - NECATI_USTA_POS.x, playerPos.z - NECATI_USTA_POS.z);
  if (distToNecati <= 24.0) {
    const idx = Math.floor(Math.random() * NECATI_USTA_CALLOUTS.length);
    state.lastHonkCallout = NECATI_USTA_CALLOUTS[idx];
    state.honkGreetingTimer = 4.5;
    return true;
  }
  return false;
}

export function isLatheWorkshopBuffActive(state: LatheWorkshopState): boolean {
  return state.buffTimer > 0;
}
