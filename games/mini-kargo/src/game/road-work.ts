import type { Vec2 } from "./types";
import type { ParticleSystem } from "../scene/particles";

export type RoadWorkState = {
  center: Vec2;
  zoneRadius: number;
  inZone: boolean;
  violation: boolean;
  cooldownTimer: number;
  drillTimer: number;
  speechText: string | null;
  speechTimer: number;
  flasherActive: boolean;
  flashTimer: number;
};

export type RoadWorkUpdateResult = {
  safePassAwarded: boolean;
  rewardMoney: number;
  rewardReputation: number;
  toastMessage?: string;
};

export const ROAD_WORK_CENTER: Vec2 = { x: 26, z: -16 };
export const ROAD_WORK_ZONE = {
  minX: 18,
  maxX: 34,
  minZ: -19.5,
  maxZ: -12.5,
};

export function createRoadWorkState(): RoadWorkState {
  return {
    center: { ...ROAD_WORK_CENTER },
    zoneRadius: 18,
    inZone: false,
    violation: false,
    cooldownTimer: 0,
    drillTimer: 0,
    speechText: null,
    speechTimer: 0,
    flasherActive: true,
    flashTimer: 0,
  };
}

export function isInsideRoadWorkZone(pos: Vec2): boolean {
  return (
    pos.x >= ROAD_WORK_ZONE.minX &&
    pos.x <= ROAD_WORK_ZONE.maxX &&
    pos.z >= ROAD_WORK_ZONE.minZ &&
    pos.z <= ROAD_WORK_ZONE.maxZ
  );
}

export function updateRoadWork(
  state: RoadWorkState,
  playerPos: Vec2,
  playerSpeed: number,
  dt: number,
  sound?: { constructionDrill?: () => void },
  particles?: Pick<ParticleSystem, "spawnConstructionDust">,
): RoadWorkUpdateResult {
  const result: RoadWorkUpdateResult = {
    safePassAwarded: false,
    rewardMoney: 0,
    rewardReputation: 0,
  };

  if (state.cooldownTimer > 0) {
    state.cooldownTimer -= dt;
  }

  // Flaşör döngüsü: Her 0.4 saniyede bir yanıp söner
  state.flashTimer += dt;
  if (state.flashTimer >= 0.4) {
    state.flashTimer -= 0.4;
    state.flasherActive = !state.flasherActive;
  }

  // Konuşma balonu zamanlayıcısı
  if (state.speechTimer > 0) {
    state.speechTimer -= dt;
    if (state.speechTimer <= 0) {
      state.speechText = null;
    }
  }

  const dx = playerPos.x - state.center.x;
  const dz = playerPos.z - state.center.z;
  const dist = Math.hypot(dx, dz);

  // Yakın mesafede periyodik kırıcı/kompresör sesi ve tozu
  if (dist < 18) {
    state.drillTimer += dt;
    if (state.drillTimer >= 1.4) {
      state.drillTimer = 0;
      sound?.constructionDrill?.();
      particles?.spawnConstructionDust?.({ x: state.center.x - 1.2, z: state.center.z + 1.2 }, 6);
    }
  }

  const currentlyInZone = isInsideRoadWorkZone(playerPos);

  if (currentlyInZone) {
    if (!state.inZone) {
      state.inZone = true;
      state.violation = false;
    }

    // Şantiye içi aşırı hız uyarısı (> 12.5 m/s)
    if (playerSpeed > 12.5) {
      state.violation = true;
      if (!state.speechText) {
        state.speechText = "👷 Kadir Usta: Yavaş kaptan, şantiye burası!";
        state.speechTimer = 2.0;
      }
    }
  } else if (state.inZone) {
    // Şantiyeden yeni çıktı
    state.inZone = false;
    if (!state.violation && state.cooldownTimer <= 0) {
      // Başarılı ve dikkatli şantiye geçişi
      result.safePassAwarded = true;
      result.rewardMoney = 15;
      result.rewardReputation = 1;
      result.toastMessage = "🚧 DİKKATLİ ŞANTİYE GEÇİŞİ! +15 ₺ (+1 İtibar)";
      state.cooldownTimer = 25.0; // 25 saniye cooldown
      state.speechText = "👷 Kadir Usta: Harika geçiş! Yolun açık olsun!";
      state.speechTimer = 2.5;
    }
  }

  return result;
}

export function triggerRoadWorkHonk(state: RoadWorkState, playerPos: Vec2): boolean {
  const dist = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (dist <= 22) {
    state.speechText = "👷 Kadir Usta: Kolay gelsin kaptan! Tek şeride dikkat! 🚧";
    state.speechTimer = 3.0;
    return true;
  }
  return false;
}
