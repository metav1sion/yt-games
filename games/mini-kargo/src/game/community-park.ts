import type { Vec2 } from "./types";

export const COMMUNITY_PARK_CENTER: Vec2 = { x: -35.0, z: -65.0 } as const;
export const GAZEBO_POS: Vec2 = { x: -31.0, z: -62.0 } as const;
export const PLAYGROUND_POS: Vec2 = { x: -38.0, z: -67.0 } as const;
export const GARDENER_POS: Vec2 = { x: -34.0, z: -60.5 } as const;
export const PARK_ENTRANCE_POS: Vec2 = { x: -35.0, z: -55.5 } as const;

export const PARK_BUFF_DURATION = 20.0; // s
export const PARK_COOLDOWN = 30.0; // s
export const PARK_DWELL_THRESHOLD = 1.2; // s

export type CommunityParkState = {
  center: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  swingAngle: number;
  rockerAngle: number;
  carouselAngle: number;
  windChimeTimer: number;
  gardenerWaterTimer: number;
  totalVisits: number;
};

export type CommunityParkEvent = {
  awardedPeaceBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  honkGreeted: boolean;
  windChimePlayed: boolean;
  callout?: string;
};

export const GARDENER_CALLOUTS = [
  "🌻 Bahçıvan Selahattin: Hoş geldin evlat! Parkımızın gülleri gibi açtın, kolay gelsin! 🌹",
  "🌻 Bahçıvan Selahattin: Çocuklar neşeyle oynuyor, mahalleye can katıyorsun kaptan! 📦",
  "🌻 Bahçıvan Selahattin: Mis gibi ıhlamur ve çimen kokuyor değil mi? İyi vardiyalar dilerim! 🍃",
  "🌻 Bahçıvan Selahattin: Çiçeklerimi sularken kornanı duydum, selam olsun Mini Kargo'ya! 🌷",
];

export function createCommunityParkState(): CommunityParkState {
  return {
    center: { ...COMMUNITY_PARK_CENTER },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    swingAngle: 0,
    rockerAngle: 0,
    carouselAngle: 0,
    windChimeTimer: 8.0,
    gardenerWaterTimer: 0,
    totalVisits: 0,
  };
}

export function updateCommunityPark(
  state: CommunityParkState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): CommunityParkEvent {
  let windChimePlayed = false;

  // 1. Sayaç ve süre güncellemeleri
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

  // Animasyon döngüleri
  state.gardenerWaterTimer += dt;
  state.swingAngle = Math.sin(state.gardenerWaterTimer * 2.8) * 0.35;
  state.rockerAngle = Math.sin(state.gardenerWaterTimer * 3.5) * 0.16;
  state.carouselAngle = (state.carouselAngle + dt * 0.45) % (Math.PI * 2);

  // Rüzgar çanı periyodik hafif çınlama (özellikle park yakınındayken)
  const distToPark = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  state.windChimeTimer -= dt;
  if (state.windChimeTimer <= 0) {
    state.windChimeTimer = 16.0 + Math.random() * 8.0;
    if (distToPark <= 28.0) {
      windChimePlayed = true;
    }
  }

  // 2. "Mahalle Huzuru" pitstop mola kontrolü
  let awardedPeaceBonus = false;
  let cashBonus = 0;
  let repBonus = 0;

  // Kamelyaya veya park girişine yakınlık kontrolü (<= 9.0m)
  const distToGazebo = Math.hypot(playerPos.x - GAZEBO_POS.x, playerPos.z - GAZEBO_POS.z);
  const distToEntrance = Math.hypot(playerPos.x - PARK_ENTRANCE_POS.x, playerPos.z - PARK_ENTRANCE_POS.z);
  const isNearParkAmenity = distToGazebo <= 9.0 || distToEntrance <= 6.5;

  if (isNearParkAmenity && playerSpeed < 1.4 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= PARK_DWELL_THRESHOLD) {
      state.dwellTimer = 0;
      state.buffTimer = PARK_BUFF_DURATION;
      state.cooldownTimer = PARK_COOLDOWN;
      state.totalVisits += 1;
      awardedPeaceBonus = true;
      cashBonus = 10;
      repBonus = 1;
      windChimePlayed = true;
    }
  } else {
    // Araç uzaklaşır veya hızlanırsa bekleme süresi yavaşça sıfırlanır
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 1.5);
  }

  return {
    awardedPeaceBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    honkGreeted: state.honkGreetingTimer > 0,
    windChimePlayed,
    callout: state.lastHonkCallout,
  };
}

export function triggerGardenerHonk(
  state: CommunityParkState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(playerPos.x - GARDENER_POS.x, playerPos.z - GARDENER_POS.z);
  if (dist <= 22.0) {
    state.honkGreetingTimer = 4.2;
    const idx = Math.floor(Math.random() * GARDENER_CALLOUTS.length);
    state.lastHonkCallout = GARDENER_CALLOUTS[idx];
    return true;
  }
  return false;
}
