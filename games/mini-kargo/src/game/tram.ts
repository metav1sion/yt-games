export const TRAM_LINE_Z = 34.0;
export const TRAM_MIN_X = 16.0;
export const TRAM_MAX_X = 82.0;
export const TRAM_STATION_POS = { x: 64.0, z: 37.8 } as const;
export const TRAM_STATION_STOP_X = 64.0;
export const TRAM_LENGTH = 5.4;
export const TRAM_WIDTH = 2.0;
export const TRAM_CRUISE_SPEED = 3.6; // m/s (~13 km/h nostaljik seyir hızı)
export const TRAM_BRAKE_DECEL = 3.8;
export const TRAM_ACCEL = 2.2;
export const TRAM_STATION_DWELL = 4.0; // s
export const TRAM_TERMINUS_DWELL = 3.5; // s

export type TramPhase = "cruising" | "stopping" | "dwelling" | "yielding";

export type TramState = {
  position: { x: number; z: number };
  direction: 1 | -1; // 1: Doğu (+X), -1: Batı (-X)
  speed: number;
  targetSpeed: number;
  phase: TramPhase;
  dwellTimer: number;
  visitedStationThisRun: boolean;
  cooldownTimer: number;
  interactionDwellTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  totalVisits: number;
  sparkTimer: number;
  bellPending: boolean;
};

export type TramEvent = {
  awardedHeritageBonus: boolean;
  cashBonus: number;
  repBonus: number;
  honkGreeted: boolean;
  bellRung: boolean;
  sparkFired: boolean;
  callout?: string;
};

export const VATMAN_CALLOUTS = [
  "🚋 Vatman İhsan: Çan çan! Yol kargonun kaptan, buyur geç! 📦",
  "🚋 Vatman İhsan: Çarşı Meydanı nostalji turu! İyi çalışmalar kaptan! 🔔",
  "🚋 Vatman İhsan: Kolay gelsin kaptan! Kargo bekletilmez! 🚋",
];

export function createTramState(): TramState {
  return {
    position: { x: 30.0, z: TRAM_LINE_Z },
    direction: 1,
    speed: 0,
    targetSpeed: TRAM_CRUISE_SPEED,
    phase: "cruising",
    dwellTimer: 0,
    visitedStationThisRun: false,
    cooldownTimer: 0,
    interactionDwellTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    totalVisits: 0,
    sparkTimer: 2.5,
    bellPending: false,
  };
}

export function updateTram(
  state: TramState,
  dt: number,
  playerPos: { x: number; z: number } = { x: 0, z: 0 },
  playerSpeed = 0,
): TramEvent {
  let bellRung = false;
  let sparkFired = false;

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

  // Pantograf ark kıvılcımı zamanlayıcısı
  state.sparkTimer -= dt;
  if (state.sparkTimer <= 0) {
    state.sparkTimer = 3.5 + Math.random() * 4.0;
    if (state.speed > 1.0) {
      sparkFired = true;
    }
  }

  if (state.bellPending) {
    bellRung = true;
    state.bellPending = false;
  }

  // 2. Oyuncu araç ray üzerinde doğrudan önünde mi? (Yol verme & Çarpışma önleme)
  const isPlayerOnTrack =
    Math.abs(playerPos.z - TRAM_LINE_Z) < 2.0 &&
    playerPos.x >= TRAM_MIN_X - 2.0 &&
    playerPos.x <= TRAM_MAX_X + 2.0;

  const dxToPlayer = (playerPos.x - state.position.x) * state.direction;
  const isPlayerBlockingAhead = isPlayerOnTrack && dxToPlayer > 0 && dxToPlayer < 7.0;

  // 3. Durum makinesi (State Machine)
  if (isPlayerBlockingAhead) {
    // Oyuncu önü tıkıyor, fren yap ve bekle
    state.phase = "yielding";
    state.targetSpeed = 0;
  } else if (state.phase === "yielding") {
    // Engel kalktı, seyre devam et
    state.phase = "cruising";
    state.targetSpeed = TRAM_CRUISE_SPEED;
  }

  if (state.phase === "dwelling") {
    state.speed = 0;
    state.targetSpeed = 0;
    state.dwellTimer += dt;

    // Terminalde veya durakta bekleme bitti mi?
    const isAtTerminus =
      (state.direction === 1 && state.position.x >= TRAM_MAX_X - 0.5) ||
      (state.direction === -1 && state.position.x <= TRAM_MIN_X + 0.5);

    const requiredDwell = isAtTerminus ? TRAM_TERMINUS_DWELL : TRAM_STATION_DWELL;

    if (state.dwellTimer >= requiredDwell) {
      state.dwellTimer = 0;
      if (isAtTerminus) {
        // Yön değiştir
        state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
        state.visitedStationThisRun = false;
      }
      state.phase = "cruising";
      state.targetSpeed = TRAM_CRUISE_SPEED;
      bellRung = true; // Kalkış çanı
    }
  } else if (state.phase === "cruising" || state.phase === "stopping") {
    // İstasyona yaklaşım kontrolü (Tek yönlü geçişte bir kez durur)
    const distToStation = Math.abs(state.position.x - TRAM_STATION_STOP_X);
    const approachingStation =
      !state.visitedStationThisRun &&
      ((state.direction === 1 && state.position.x <= TRAM_STATION_STOP_X && distToStation < 6.0) ||
        (state.direction === -1 && state.position.x >= TRAM_STATION_STOP_X && distToStation < 6.0));

    // Terminal noktalarına yaklaşım
    const atTerminus =
      (state.direction === 1 && state.position.x >= TRAM_MAX_X - 0.25) ||
      (state.direction === -1 && state.position.x <= TRAM_MIN_X + 0.25);

    if (atTerminus) {
      state.position.x = state.direction === 1 ? TRAM_MAX_X : TRAM_MIN_X;
      state.speed = 0;
      state.phase = "dwelling";
      state.dwellTimer = 0;
      bellRung = true;
    } else if (
      (state.direction === 1 && state.position.x >= TRAM_MAX_X - 4.0) ||
      (state.direction === -1 && state.position.x <= TRAM_MIN_X + 4.0)
    ) {
      state.phase = "stopping";
      state.targetSpeed = 1.0;
    } else if (approachingStation && distToStation < 0.6) {
      state.position.x = TRAM_STATION_STOP_X;
      state.speed = 0;
      state.phase = "dwelling";
      state.dwellTimer = 0;
      state.visitedStationThisRun = true;
      bellRung = true; // Varış çanı
    } else if (approachingStation) {
      state.phase = "stopping";
      state.targetSpeed = 1.2;
    } else {
      state.phase = "cruising";
      state.targetSpeed = TRAM_CRUISE_SPEED;
    }
  }

  // 4. Hızlanma / Frenleme fiziği
  if (state.phase !== "dwelling") {
    if (state.speed < state.targetSpeed) {
      state.speed = Math.min(state.targetSpeed, state.speed + TRAM_ACCEL * dt);
    } else if (state.speed > state.targetSpeed) {
      state.speed = Math.max(state.targetSpeed, state.speed - TRAM_BRAKE_DECEL * dt);
    }

    // Pozisyon güncellemesi
    state.position.x += state.direction * state.speed * dt;
  } else {
    state.speed = 0;
  }
  state.position.z = TRAM_LINE_Z;

  // Sınır güvenliği (Clamp)
  if (state.position.x < TRAM_MIN_X) state.position.x = TRAM_MIN_X;
  if (state.position.x > TRAM_MAX_X) state.position.x = TRAM_MAX_X;

  // 5. Oyuncu Tarihi Tramvay Hatırası Etkileşimi (Station or Tram proximity reward)
  const distToStation = Math.hypot(
    playerPos.x - TRAM_STATION_POS.x,
    playerPos.z - TRAM_STATION_POS.z,
  );
  const distToTram = Math.hypot(
    playerPos.x - state.position.x,
    playerPos.z - state.position.z,
  );

  let awardedHeritageBonus = false;
  const isNear = distToStation <= 6.5 || distToTram <= 5.5;

  if (isNear && playerSpeed <= 2.2 && state.cooldownTimer <= 0) {
    state.interactionDwellTimer += dt;
    if (state.interactionDwellTimer >= 1.2) {
      state.interactionDwellTimer = 0;
      state.cooldownTimer = 30.0; // 30 saniye cooldown
      state.totalVisits += 1;
      awardedHeritageBonus = true;
      bellRung = true;
    }
  } else if (!isNear || playerSpeed > 3.0) {
    state.interactionDwellTimer = 0;
  }

  return {
    awardedHeritageBonus,
    cashBonus: awardedHeritageBonus ? 10 : 0,
    repBonus: awardedHeritageBonus ? 1 : 0,
    honkGreeted: state.honkGreetingTimer > 0,
    bellRung,
    sparkFired,
    callout: state.lastHonkCallout,
  };
}

export function triggerTramHonk(
  state: TramState,
  playerPos: { x: number; z: number },
): boolean {
  const dist = Math.hypot(
    playerPos.x - state.position.x,
    playerPos.z - state.position.z,
  );
  if (dist <= 16.0) {
    state.honkGreetingTimer = 3.2;
    state.lastHonkCallout =
      VATMAN_CALLOUTS[Math.floor(Math.random() * VATMAN_CALLOUTS.length)];
    state.bellPending = true;
    return true;
  }
  return false;
}
