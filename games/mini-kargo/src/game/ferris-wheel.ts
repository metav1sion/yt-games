export const FERRIS_WHEEL_POS = { x: -14.0, z: 92.5 } as const;
export const FERRIS_WHEEL_BOARDING_POS = { x: -15.5, z: 88.8 } as const;
export const FERRIS_WHEEL_RADIUS = 7.5;
export const FERRIS_WHEEL_HUB_HEIGHT = 8.5;
export const FERRIS_WHEEL_ROTATION_SPEED = 0.18; // rad/s (~35s per revolution)
export const FERRIS_WHEEL_GONDOLA_COUNT = 12;

export type FerrisWheelEvent = {
  awardedJoyBonus: boolean;
  cashBonus: number;
  repBonus: number;
  honkGreeted: boolean;
  callout?: string;
};

export type FerrisWheelState = {
  wheelAngle: number;
  chaseLightPhase: number;
  dwellTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  totalVisits: number;
};

export const OPERATOR_CALLOUTS = [
  "🎡 Lunaparkçı Şevket: Hoş geldin kaptan! Şehir manzarası buradan harika! 🎡",
  "🎡 Lunaparkçı Şevket: Dönme dolaba bekleriz kaptan, kargo telaşında mola ver! 🌊",
  "🎡 Lunaparkçı Şevket: Sahilin neşesi burada! İyi vardiyalar kaptan! 🎈",
];

export function createFerrisWheelState(): FerrisWheelState {
  return {
    wheelAngle: 0,
    chaseLightPhase: 0,
    dwellTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    totalVisits: 0,
  };
}

export function updateFerrisWheel(
  state: FerrisWheelState,
  dt: number,
  playerPos: { x: number; z: number } = { x: 0, z: 0 },
  playerSpeed = 0,
): FerrisWheelEvent {
  // 1. Dönme dolap sürekli dönüş açısı ve LED ışık fazı
  state.wheelAngle = (state.wheelAngle + dt * FERRIS_WHEEL_ROTATION_SPEED) % (Math.PI * 2);
  state.chaseLightPhase = (state.chaseLightPhase + dt * 4.5) % 1000;

  if (state.cooldownTimer > 0) {
    state.cooldownTimer = Math.max(0, state.cooldownTimer - dt);
  }

  if (state.honkGreetingTimer > 0) {
    state.honkGreetingTimer = Math.max(0, state.honkGreetingTimer - dt);
    if (state.honkGreetingTimer <= 0) {
      state.lastHonkCallout = undefined;
    }
  }

  // 2. Biniş / seyir terasında duraklama kontrolü ("Sahil Neşesi" bonusu)
  const dist = Math.hypot(
    playerPos.x - FERRIS_WHEEL_BOARDING_POS.x,
    playerPos.z - FERRIS_WHEEL_BOARDING_POS.z,
  );

  let awardedJoyBonus = false;
  if (dist <= 6.5 && playerSpeed <= 2.0 && state.cooldownTimer <= 0) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= 1.2) {
      state.dwellTimer = 0;
      state.cooldownTimer = 35.0; // 35 saniye bekleme süresi
      state.totalVisits += 1;
      awardedJoyBonus = true;
    }
  } else if (dist > 7.5 || playerSpeed > 3.0) {
    state.dwellTimer = 0;
  }

  return {
    awardedJoyBonus,
    cashBonus: awardedJoyBonus ? 15 : 0,
    repBonus: awardedJoyBonus ? 1 : 0,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerFerrisWheelHonk(
  state: FerrisWheelState,
  playerPos: { x: number; z: number },
): boolean {
  const dist = Math.hypot(
    playerPos.x - FERRIS_WHEEL_POS.x,
    playerPos.z - FERRIS_WHEEL_POS.z,
  );
  if (dist <= 24.0) {
    const calloutIndex = Math.floor(Math.random() * OPERATOR_CALLOUTS.length);
    state.lastHonkCallout = OPERATOR_CALLOUTS[calloutIndex];
    state.honkGreetingTimer = 4.2;
    return true;
  }
  return false;
}
