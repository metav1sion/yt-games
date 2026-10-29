import type { Vec2 } from "./types";

export const SCHOOL_CENTER: Vec2 = { x: -35.0, z: -36.5 } as const;
export const SCHOOL_BAY: Vec2 = { x: -35.0, z: -46.5 } as const;
export const HASAN_DAYI_POS: Vec2 = { x: -37.2, z: -46.5 } as const;

export const SCHOOL_BUFF_DURATION = 25.0; // 25 saniye "Okul Yolu Saygısı" güvenli sürüş & nezaket dopingi
export const SCHOOL_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const SCHOOL_DWELL_THRESHOLD = 1.2; // 1.2 saniye okul önünde duraklama eşiği

export type SchoolState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  bellSoundTimer: number;
  totalVisits: number;
  flagWavePhase: number;
  paddleAngle: number;
};

export type SchoolEvent = {
  awardedCourtesyBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  bellSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const HASAN_DAYI_CALLOUTS = [
  "🔔 Hasan Dayı: Yavaş geç kaptan! Mektep yolu burası, çocuklar derste! 🎒",
  "🏫 Hasan Dayı: Aferin evlat! Okul geçidinde yavaşlayan şoförün başımızın üstünde yeri var! ⭐",
  "🇹🇷 Hasan Dayı: Taş mektebin zili çaldı, teneffüs vakti! Hayırlı işler kaptan! 📦",
  "🧒 Hasan Dayı: Çocuklar sana emanet kaptan! Dikkatli sürüşün için teşekkürler! 🌟",
];

export function createSchoolState(): SchoolState {
  return {
    center: { ...SCHOOL_CENTER },
    serviceBay: { ...SCHOOL_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    bellSoundTimer: 8.5,
    totalVisits: 0,
    flagWavePhase: 0,
    paddleAngle: 0,
  };
}

export function updateSchool(
  state: SchoolState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): SchoolEvent {
  let bellSoundTriggered = false;

  // 1. Bayrak ve geçit görevlisi dur/geç paleti dalgalanma fazı
  state.flagWavePhase = (state.flagWavePhase + dt * 3.5) % (Math.PI * 2);
  state.paddleAngle = Math.sin(state.flagWavePhase) * 0.25;

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

  // 3. Ortam okul zili sesi simülasyonu (oyuncu yakınken)
  state.bellSoundTimer -= dt;
  const distToBay = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.bellSoundTimer <= 0) {
    state.bellSoundTimer = 18.0 + Math.random() * 8.0;
    if (distToBay < 26.0) {
      bellSoundTriggered = true;
    }
  }

  // 4. Oyuncu servis peronu etkileşimi (1.2 saniye duraklama)
  let awardedCourtesyBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  const inBay = distToBay < 3.2;
  const isStopped = Math.abs(playerSpeed) < 0.6;

  if (inBay && isStopped) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= SCHOOL_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      awardedCourtesyBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = SCHOOL_BUFF_DURATION;
      state.cooldownTimer = SCHOOL_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      bellSoundTriggered = true;

      // Hasan Dayı teşekkür ve tebrik konuşması
      state.honkGreetingTimer = 4.5;
      state.lastHonkCallout = HASAN_DAYI_CALLOUTS[1]; // Okul geçidi teşekkür repliği
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedCourtesyBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    bellSoundTriggered,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerSchoolHonk(
  state: SchoolState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - HASAN_DAYI_POS.x,
    playerPos.z - HASAN_DAYI_POS.z,
  );

  if (dist <= 24.0) {
    state.honkGreetingTimer = 4.0;
    const calloutIndex = Math.floor(Math.random() * HASAN_DAYI_CALLOUTS.length);
    state.lastHonkCallout = HASAN_DAYI_CALLOUTS[calloutIndex];
    return true;
  }
  return false;
}
