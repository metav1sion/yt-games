import type { Vec2 } from "./types";

export const COPPERSMITH_CENTER: Vec2 = { x: 63.0, z: 75.5 } as const;
export const COPPERSMITH_BAY: Vec2 = { x: 63.0, z: 81.0 } as const;
export const KAZIM_USTA_POS: Vec2 = { x: 61.5, z: 76.5 } as const;

export const COPPERSMITH_BUFF_DURATION = 25.0; // 25 saniye "Usta Esnaf Hürmeti" müşteri bahşişi ve esnaf prestij buff'ı
export const COPPERSMITH_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const COPPERSMITH_DWELL_THRESHOLD = 1.2; // 1.2 saniye bedesten peronunda duraklama eşiği

export type CoppersmithState = {
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
  hammerStrikePhase: number;
  metalPolishPhase: number;
};

export type CoppersmithEvent = {
  awardedCoppersmithBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  hammerSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const KAZIM_USTA_CALLOUTS = [
  "🏺 Bakırcı Kazım Usta: Hoş geldin evlat! Ateşte tavlanan, çekiçle dövülen bakırın sesi berekettir! 🔨",
  "✨ Bakırcı Kazım Usta: Bir elinde çekiç, bir elinde sabır... Hakiki bakır işi aceleye gelmez! ☕",
  "🧿 Bakırcı Kazım Usta: Al bu el dövmesi cezveyi, teslimatların üstüne mis gibi köpüklü kahve pişirirsin! 📦",
  "🌟 Bakırcı Kazım Usta: Yolun açık olsun kargocu dostum! Esnafın duası ve bereketi seninle olsun! 🚚",
];

export function createCoppersmithState(): CoppersmithState {
  return {
    center: { ...COPPERSMITH_CENTER },
    serviceBay: { ...COPPERSMITH_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    hammerSoundTimer: 6.5,
    totalVisits: 0,
    hammerStrikePhase: 0,
    metalPolishPhase: 0,
  };
}

export function updateCoppersmith(
  state: CoppersmithState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): CoppersmithEvent {
  const event: CoppersmithEvent = {
    awardedCoppersmithBonus: false,
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
  }

  // 2. Çekiç vuruşu ve metal parlatma ritmik fazları
  state.hammerStrikePhase = (state.hammerStrikePhase + dt * 4.8) % (Math.PI * 2);
  state.metalPolishPhase = (state.metalPolishPhase + dt * 3.2) % (Math.PI * 2);

  // 3. Prosedürel çekiç çınlaması ortam ses döngüsü (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.hammerSoundTimer -= dt;
    if (state.hammerSoundTimer <= 0) {
      event.hammerSoundTriggered = true;
      state.hammerSoundTimer = 5.0 + Math.random() * 3.5;
    }
  } else {
    state.hammerSoundTimer = Math.min(state.hammerSoundTimer, 3.5);
  }

  // 4. Servis Peronu Yanaşma Kontrolü (COPPERSMITH_BAY: X: 60.0, Z: 81.0)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const inBay = distToBay < 3.2;

  if (inBay && speed < 1.8) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= COPPERSMITH_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      state.dwellTimer = 0;
      state.cooldownTimer = COPPERSMITH_COOLDOWN;
      state.buffTimer = COPPERSMITH_BUFF_DURATION;
      state.totalVisits += 1;

      event.awardedCoppersmithBonus = true;
      event.cashBonus = 10;
      event.repBonus = 1;
      event.nitroRefill = true;
      event.buffActive = true;
      event.hammerSoundTriggered = true;

      const randomIdx = Math.floor(Math.random() * KAZIM_USTA_CALLOUTS.length);
      event.callout = KAZIM_USTA_CALLOUTS[randomIdx];
      state.callout = event.callout;
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return event;
}

export function triggerCoppersmithHonk(state: CoppersmithState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - KAZIM_USTA_POS.x, playerPos.z - KAZIM_USTA_POS.z);
  if (dist < 26.0) {
    state.honkGreetingTimer = 4.0;
    const randomIdx = Math.floor(Math.random() * KAZIM_USTA_CALLOUTS.length);
    state.lastHonkCallout = KAZIM_USTA_CALLOUTS[randomIdx];
    return true;
  }
  return false;
}
