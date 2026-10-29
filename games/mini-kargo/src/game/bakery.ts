import type { Vec2 } from "./types";

export const BAKERY_CENTER: Vec2 = { x: 59.5, z: 24.5 } as const;
export const BAKERY_BAY: Vec2 = { x: 59.5, z: 31.2 } as const;
export const SABAN_USTA_POS: Vec2 = { x: 57.8, z: 28.5 } as const;

export const BAKERY_BUFF_DURATION = 25.0; // 25 saniye "Sıcak Simit Çıtırı" zindelik & çeviklik dopingi
export const BAKERY_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const BAKERY_DWELL_THRESHOLD = 1.2; // 1.2 saniye fırın önünde duraklama eşiği

export type BakeryState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  ovenSoundTimer: number;
  totalVisits: number;
  ovenGlowPhase: number;
  peelSwingPhase: number;
};

export type BakeryEvent = {
  awardedSimitBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  ovenSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const SABAN_USTA_CALLOUTS = [
  "🥨 Fırıncı Şaban Usta: Gel kaptan geel! Fırından yeni çıktı, çıtır susamlı simitler yakıyor! 🥖",
  "🔥 Fırıncı Şaban Usta: Meşe odunu ateşi bu, taş fırının lezzeti bir başkadır! Bereketli yollar! 📦",
  "🫓 Fırıncı Şaban Usta: Mis kokulu Ramazan pidesiyle çıtır simit kargo şoförüne can verir! 🥐",
  "🌟 Fırıncı Şaban Usta: Afiyet şeker olsun kaptan, Mini Kargo'nun yolu daima açık olsun! 🚚",
];

export function createBakeryState(): BakeryState {
  return {
    center: { ...BAKERY_CENTER },
    serviceBay: { ...BAKERY_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    ovenSoundTimer: 7.5,
    totalVisits: 0,
    ovenGlowPhase: 0,
    peelSwingPhase: 0,
  };
}

export function updateBakery(
  state: BakeryState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): BakeryEvent {
  let ovenSoundTriggered = false;

  // 1. Odun ateşi kor ışıltısı ve fırın küreği salınım fazı
  state.ovenGlowPhase = (state.ovenGlowPhase + dt * 4.2) % (Math.PI * 2);
  state.peelSwingPhase = (state.peelSwingPhase + dt * 2.8) % (Math.PI * 2);

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

  // 3. Ortam fırın & odun ateşi çıtırtısı sesi simülasyonu (oyuncu yakınken)
  state.ovenSoundTimer -= dt;
  const distToBay = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.ovenSoundTimer <= 0) {
    state.ovenSoundTimer = 16.0 + Math.random() * 8.0;
    if (distToBay < 26.0) {
      ovenSoundTriggered = true;
    }
  }

  // 4. Oyuncu servis peronu etkileşimi (1.2 saniye duraklama)
  let awardedSimitBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  const inBay = distToBay < 3.2;
  const isStopped = Math.abs(playerSpeed) < 0.6;

  if (inBay && isStopped) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= BAKERY_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      awardedSimitBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = BAKERY_BUFF_DURATION;
      state.cooldownTimer = BAKERY_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      ovenSoundTriggered = true;

      // Şaban Usta teşekkür ve tebrik konuşması
      state.honkGreetingTimer = 4.5;
      state.lastHonkCallout = SABAN_USTA_CALLOUTS[0]; // Fırından yeni çıktı repliği
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedSimitBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    ovenSoundTriggered,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerBakeryHonk(
  state: BakeryState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - SABAN_USTA_POS.x,
    playerPos.z - SABAN_USTA_POS.z,
  );

  if (dist <= 24.0) {
    state.honkGreetingTimer = 4.0;
    const calloutIndex = Math.floor(Math.random() * SABAN_USTA_CALLOUTS.length);
    state.lastHonkCallout = SABAN_USTA_CALLOUTS[calloutIndex];
    return true;
  }
  return false;
}
