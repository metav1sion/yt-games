import type { Vec2 } from "./types";

export const HEALTH_CLINIC_CENTER: Vec2 = { x: -11.0, z: -34.0 } as const;
export const HEALTH_CLINIC_BAY: Vec2 = { x: -11.0, z: -43.5 } as const;
export const DR_HIKMET_POS: Vec2 = { x: -13.0, z: -38.5 } as const;
export const AMBULANCE_POS: Vec2 = { x: -7.6, z: -38.5 } as const;

export const HEALTH_CLINIC_BUFF_DURATION = 25.0; // 25 saniye "Sağlık & Sıhhat Güvencesi" zindelik, yorgunluk giderme & prim buff'ı
export const HEALTH_CLINIC_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const HEALTH_CLINIC_DWELL_THRESHOLD = 1.2; // 1.2 saniye peronda duraklama eşiği

export type HealthClinicState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  pulseSoundTimer: number;
  totalVisits: number;
  neonPulsePhase: number;
  ambulanceFlasherPhase: number;
};

export type HealthClinicEvent = {
  awardedHealthClinicBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  soundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const DR_HIKMET_CALLOUTS = [
  "🏥 Dr. Hikmet Bey: Hoş geldin kargocu evlat! Yollar yorar, tansiyonuna dikkat et, sıhhatin her şeyden mühim! 🩺",
  "💊 Dr. Hikmet Bey: Nöbetçi eczanemiz 7/24 açık! Soğuk havalarda vitaminini eksik etme, kargoları güvenle ulaştır! 💚",
  "🚑 Dr. Hikmet Bey: Selam genç kurye! Ambulansımız hazır bekler ama sen yine de trafikte temkini elden bırakma! 🌟",
  "🩺 Dr. Hikmet Bey: Kornanı duydum evlat, canın sağ olsun! Reçeten yazıldı: Bol moral ve güvenli sürüş! 💉",
];

export function createHealthClinicState(): HealthClinicState {
  return {
    center: { ...HEALTH_CLINIC_CENTER },
    serviceBay: { ...HEALTH_CLINIC_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    pulseSoundTimer: 7.0,
    totalVisits: 0,
    neonPulsePhase: 0,
    ambulanceFlasherPhase: 0,
  };
}

export function updateHealthClinic(
  state: HealthClinicState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): HealthClinicEvent {
  const event: HealthClinicEvent = {
    awardedHealthClinicBonus: false,
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
  }

  // 2. Neon nabız ve ambulans flaşör fazı
  state.neonPulsePhase = (state.neonPulsePhase + dt * 4.0) % (Math.PI * 2);
  state.ambulanceFlasherPhase = (state.ambulanceFlasherPhase + dt * 8.0) % (Math.PI * 2);

  // 3. Prosedürel ortam medikal EKG kalp sinyali ve klinik zili (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.pulseSoundTimer -= dt;
    if (state.pulseSoundTimer <= 0) {
      event.soundTriggered = true;
      state.pulseSoundTimer = 6.0 + Math.random() * 4.0;
    }
  }

  // 4. Servis peronu yanaşma kontrolü (HEALTH_CLINIC_BAY)
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const inBay = distToBay <= 3.8;
  const isStoppedOrSlow = speed < 1.4;

  if (inBay && isStoppedOrSlow && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= HEALTH_CLINIC_DWELL_THRESHOLD) {
      // Bonus ve buff kazanımı
      state.dwellTimer = 0;
      state.cooldownTimer = HEALTH_CLINIC_COOLDOWN;
      state.buffTimer = HEALTH_CLINIC_BUFF_DURATION;
      state.totalVisits += 1;

      event.awardedHealthClinicBonus = true;
      event.cashBonus = 10;
      event.repBonus = 1;
      event.buffActive = true;
      event.nitroRefill = true;
      event.soundTriggered = true;

      // Dr. Hikmet Bey tebrik selamı
      state.honkGreetingTimer = 4.0;
      state.lastHonkCallout = DR_HIKMET_CALLOUTS[0];
      event.honkGreeted = true;
      event.callout = state.lastHonkCallout;
    }
  } else if (!inBay || speed >= 1.8) {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return event;
}

export function triggerHealthClinicHonk(state: HealthClinicState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - DR_HIKMET_POS.x, playerPos.z - DR_HIKMET_POS.z);
  if (dist <= 26.0) {
    state.honkGreetingTimer = 4.0;
    const callouts = DR_HIKMET_CALLOUTS;
    state.lastHonkCallout = callouts[Math.floor(Math.random() * callouts.length)];
    return true;
  }
  return false;
}
