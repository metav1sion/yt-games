export const TRAIN_LINE_Z = -38.0;
export const TRAIN_MIN_X = 18.0;
export const TRAIN_MAX_X = 80.0;
export const TRAIN_CROSSING_X = 50.0;
export const TRAIN_CROSSING_APPROACH_DIST = 18.0;
export const TRAIN_SIDING_POS = { x: 26.0, z: -34.8 } as const;
export const TRAIN_LENGTH = 6.2;
export const TRAIN_WIDTH = 2.4;
export const TRAIN_TOTAL_SPAN = 18.0; // Lokomotif + 2 Yük Vagonu toplam tren katarı boyu
export const TRAIN_CRUISE_SPEED = 4.2; // m/s (~15 km/h endüstriyel manevra hızı)
export const TRAIN_APPROACH_SPEED = 2.2;
export const TRAIN_ACCEL = 1.6;
export const TRAIN_BRAKE_DECEL = 2.8;
export const TRAIN_TERMINUS_DWELL = 4.5; // s (tampon manevrası ve yükleme kontrolü)
export const GATE_OPEN_ANGLE = Math.PI / 2; // Dik / açık
export const GATE_CLOSED_ANGLE = 0; // Yatay / kapalı
export const GATE_TRANSITION_SPEED = 1.4; // rad/s

export type TrainPhase = "cruising" | "stopping" | "dwelling" | "yielding";

export type TrainState = {
  position: { x: number; z: number };
  direction: 1 | -1; // 1: Doğu (+X), -1: Batı (-X)
  speed: number;
  targetSpeed: number;
  phase: TrainPhase;
  dwellTimer: number;
  gateAngle: number;
  crossingActive: boolean;
  crossingFlashTimer: number;
  crossingFlashState: boolean;
  crossingBellTimer: number;
  crossingBellPending: boolean;
  hornPending: boolean;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  interactionDwellTimer: number;
  cooldownTimer: number;
  totalVisits: number;
  smokeTimer: number;
  smokePending: boolean;
};

export type TrainEvent = {
  awardedLogisticsBonus: boolean;
  cashBonus: number;
  repBonus: number;
  honkGreeted: boolean;
  hornBlown: boolean;
  crossingBellRung: boolean;
  smokePuffed: boolean;
  callout?: string;
  crossingActive: boolean;
  gateAngle: number;
};

export const MAKINIST_CALLOUTS = [
  "🚂 Makinist Cemal: Düüüt! Sanayi Ekspresi seyrinde, hemzemin geçide dikkat! 📦",
  "🚂 Makinist Cemal: Selam Mini Kargo! Ağır konteyner sevkiyatı yapıyoruz, yolun açık olsun! 🔔",
  "🚂 Makinist Cemal: Kolay gelsin kaptan! Sanayinin çarkları durmaz! 🏭",
];

export function createTrainState(): TrainState {
  return {
    position: { x: 22.0, z: TRAIN_LINE_Z },
    direction: 1,
    speed: 0,
    targetSpeed: TRAIN_CRUISE_SPEED,
    phase: "cruising",
    dwellTimer: 0,
    gateAngle: GATE_OPEN_ANGLE,
    crossingActive: false,
    crossingFlashTimer: 0,
    crossingFlashState: false,
    crossingBellTimer: 0,
    crossingBellPending: false,
    hornPending: false,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    interactionDwellTimer: 0,
    cooldownTimer: 0,
    totalVisits: 0,
    smokeTimer: 1.2,
    smokePending: false,
  };
}

export function updateTrain(
  state: TrainState,
  dt: number,
  playerPos: { x: number; z: number } = { x: 0, z: 0 },
  playerSpeed = 0,
): TrainEvent {
  let hornBlown = false;
  let crossingBellRung = false;
  let smokePuffed = false;

  // 1. Sayaç güncellemeleri
  if (state.cooldownTimer > 0) {
    state.cooldownTimer = Math.max(0, state.cooldownTimer - dt);
  }

  if (state.honkGreetingTimer > 0) {
    state.honkGreetingTimer = Math.max(0, state.honkGreetingTimer - dt);
    if (state.honkGreetingTimer <= 0) {
      state.lastHonkCallout = undefined;
    }
  }

  // Dizel egzoz dumanı püskürtme zamanlayıcısı
  state.smokeTimer -= dt;
  if (state.smokeTimer <= 0) {
    state.smokeTimer = 1.0 + Math.random() * 1.5;
    if (state.speed > 0.5 || state.phase === "dwelling") {
      smokePuffed = true;
    }
  }

  if (state.hornPending) {
    hornBlown = true;
    state.hornPending = false;
  }

  // 2. Hemzemin Geçit Aktiflik Kontrolü (X = 50 Bulvar Geçişi)
  // Tren katarının önü ve arkası X = 50 civarındayken geçit kapalıdır
  const trainFrontX = state.position.x + (state.direction * TRAIN_LENGTH) / 2;
  const trainRearX = state.position.x - state.direction * (TRAIN_TOTAL_SPAN - TRAIN_LENGTH / 2);
  const minTrainX = Math.min(trainFrontX, trainRearX);
  const maxTrainX = Math.max(trainFrontX, trainRearX);

  // Yaklaşma mesafesi veya geçiş anı
  const approachingFromWest = state.direction === 1 && state.position.x < TRAIN_CROSSING_X && state.position.x >= TRAIN_CROSSING_X - TRAIN_CROSSING_APPROACH_DIST;
  const approachingFromEast = state.direction === -1 && state.position.x > TRAIN_CROSSING_X && state.position.x <= TRAIN_CROSSING_X + TRAIN_CROSSING_APPROACH_DIST;
  const occupyingCrossing = minTrainX <= TRAIN_CROSSING_X + 6.0 && maxTrainX >= TRAIN_CROSSING_X - 6.0;

  const shouldCrossingBeActive = approachingFromWest || approachingFromEast || occupyingCrossing;
  const prevCrossingActive = state.crossingActive;
  state.crossingActive = shouldCrossingBeActive;

  // Geçit yeni aktifleştiğinde tren düdüğü çalar
  if (state.crossingActive && !prevCrossingActive && state.speed > 1.0) {
    hornBlown = true;
  }

  // Bariyer kolu açısı animasyonu
  if (state.crossingActive) {
    state.gateAngle = Math.max(GATE_CLOSED_ANGLE, state.gateAngle - GATE_TRANSITION_SPEED * dt);
    // Flaşör ve çan
    state.crossingFlashTimer += dt;
    if (state.crossingFlashTimer >= 0.4) {
      state.crossingFlashTimer = 0;
      state.crossingFlashState = !state.crossingFlashState;
    }
    state.crossingBellTimer += dt;
    if (state.crossingBellTimer >= 0.48) {
      state.crossingBellTimer = 0;
      crossingBellRung = true;
    }
  } else {
    state.gateAngle = Math.min(GATE_OPEN_ANGLE, state.gateAngle + GATE_TRANSITION_SPEED * dt);
    state.crossingFlashTimer = 0;
    state.crossingFlashState = false;
    state.crossingBellTimer = 0;
  }

  // 3. Oyuncu araç ray üzerinde doğrudan önünde mi? (Yol verme & Çarpışma önleme)
  const isPlayerOnTrack =
    Math.abs(playerPos.z - TRAIN_LINE_Z) < 2.2 &&
    playerPos.x >= TRAIN_MIN_X - 2.0 &&
    playerPos.x <= TRAIN_MAX_X + 2.0;

  const dxToPlayer = (playerPos.x - state.position.x) * state.direction;
  const isPlayerBlockingAhead = isPlayerOnTrack && dxToPlayer > 0 && dxToPlayer < 9.0;

  // 4. Durum makinesi (State Machine)
  if (isPlayerBlockingAhead) {
    state.phase = "yielding";
    state.targetSpeed = 0;
  } else if (state.phase === "yielding") {
    state.phase = "cruising";
    state.targetSpeed = TRAIN_CRUISE_SPEED;
  }

  if (state.phase === "dwelling") {
    state.speed = 0;
    state.targetSpeed = 0;
    state.dwellTimer += dt;

    if (state.dwellTimer >= TRAIN_TERMINUS_DWELL) {
      state.dwellTimer = 0;
      // Yön değiştir
      state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
      state.phase = "cruising";
      state.targetSpeed = TRAIN_CRUISE_SPEED;
      hornBlown = true; // Kalkış düdüğü
    }
  } else if (state.phase === "cruising" || state.phase === "stopping") {
    // Uç noktalara (Terminus) yaklaşım
    const atTerminus =
      (state.direction === 1 && state.position.x >= TRAIN_MAX_X - 0.2) ||
      (state.direction === -1 && state.position.x <= TRAIN_MIN_X + 0.2);

    if (atTerminus) {
      state.position.x = state.direction === 1 ? TRAIN_MAX_X : TRAIN_MIN_X;
      state.speed = 0;
      state.phase = "dwelling";
      state.dwellTimer = 0;
      hornBlown = true; // Varış düdüğü
    } else if (
      (state.direction === 1 && state.position.x >= TRAIN_MAX_X - 6.0) ||
      (state.direction === -1 && state.position.x <= TRAIN_MIN_X + 6.0)
    ) {
      state.phase = "stopping";
      state.targetSpeed = TRAIN_APPROACH_SPEED;
    } else {
      state.phase = "cruising";
      state.targetSpeed = TRAIN_CRUISE_SPEED;
    }
  }

  // 5. Hızlanma / Frenleme fiziği
  if (state.phase !== "dwelling") {
    if (state.speed < state.targetSpeed) {
      state.speed = Math.min(state.targetSpeed, state.speed + TRAIN_ACCEL * dt);
    } else if (state.speed > state.targetSpeed) {
      state.speed = Math.max(state.targetSpeed, state.speed - TRAIN_BRAKE_DECEL * dt);
    }
    state.position.x += state.direction * state.speed * dt;
  } else {
    state.speed = 0;
  }
  state.position.z = TRAIN_LINE_Z;

  // Sınır güvenliği (Clamp)
  if (state.position.x < TRAIN_MIN_X) state.position.x = TRAIN_MIN_X;
  if (state.position.x > TRAIN_MAX_X) state.position.x = TRAIN_MAX_X;

  // 6. Oyuncu Sanayi Demiryolu Lojistik Bonusu (Freight Siding Logistics Bonus)
  const distToSiding = Math.hypot(
    playerPos.x - TRAIN_SIDING_POS.x,
    playerPos.z - TRAIN_SIDING_POS.z,
  );
  const distToLocomotive = Math.hypot(
    playerPos.x - state.position.x,
    playerPos.z - state.position.z,
  );

  let awardedLogisticsBonus = false;
  const isNear = distToSiding <= 7.0 || distToLocomotive <= 6.5;

  if (isNear && playerSpeed <= 2.5 && state.cooldownTimer <= 0) {
    state.interactionDwellTimer += dt;
    if (state.interactionDwellTimer >= 1.2) {
      state.interactionDwellTimer = 0;
      state.cooldownTimer = 35.0; // 35 saniye cooldown
      state.totalVisits += 1;
      awardedLogisticsBonus = true;
      hornBlown = true;
    }
  } else if (!isNear || playerSpeed > 3.2) {
    state.interactionDwellTimer = 0;
  }

  return {
    awardedLogisticsBonus,
    cashBonus: awardedLogisticsBonus ? 15 : 0,
    repBonus: awardedLogisticsBonus ? 1 : 0,
    honkGreeted: state.honkGreetingTimer > 0,
    hornBlown,
    crossingBellRung,
    smokePuffed,
    callout: state.lastHonkCallout,
    crossingActive: state.crossingActive,
    gateAngle: state.gateAngle,
  };
}

export function triggerTrainHonk(
  state: TrainState,
  playerPos: { x: number; z: number },
): boolean {
  const dist = Math.hypot(
    playerPos.x - state.position.x,
    playerPos.z - state.position.z,
  );
  if (dist <= 18.0) {
    state.honkGreetingTimer = 3.5;
    state.lastHonkCallout =
      MAKINIST_CALLOUTS[Math.floor(Math.random() * MAKINIST_CALLOUTS.length)];
    state.hornPending = true;
    return true;
  }
  return false;
}
