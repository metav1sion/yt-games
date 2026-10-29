import type { Vec2 } from "./types";
import type { ParticleSystem } from "../scene/particles";

export type SeasideLifeState = {
  cafeCenter: Vec2;
  fisher1Center: Vec2;
  fisher2Center: Vec2;
  teaDwellTimer: number;
  teaBuffTimer: number;
  teaCooldown: number;
  speechText: string | null;
  speechTimer: number;
  fisherSpeechText: string | null;
  fisherSpeechTimer: number;
  fishCatchTimer: number;
};

export type SeasideUpdateResult = {
  teaServed: boolean;
  rewardReputation: number;
  teaBuffActive: boolean;
  toastMessage?: string;
};

export const TEA_CAFE_CENTER: Vec2 = { x: -60, z: 83.2 };
export const FISHER_1_POS: Vec2 = { x: -48.5, z: 96.0 };
export const FISHER_2_POS: Vec2 = { x: -51.5, z: 92.0 };

export function createSeasideLifeState(): SeasideLifeState {
  return {
    cafeCenter: { ...TEA_CAFE_CENTER },
    fisher1Center: { ...FISHER_1_POS },
    fisher2Center: { ...FISHER_2_POS },
    teaDwellTimer: 0,
    teaBuffTimer: 0,
    teaCooldown: 0,
    speechText: null,
    speechTimer: 0,
    fisherSpeechText: null,
    fisherSpeechTimer: 0,
    fishCatchTimer: 0,
  };
}

export function updateSeasideLife(
  state: SeasideLifeState,
  playerPos: Vec2,
  playerSpeed: number,
  dt: number,
  sound?: { teaSpoonClink?: () => void; fishingReel?: () => void },
  particles?: Pick<ParticleSystem, "spawnWaterSplash">,
): SeasideUpdateResult {
  const result: SeasideUpdateResult = {
    teaServed: false,
    rewardReputation: 0,
    teaBuffActive: state.teaBuffTimer > 0,
  };

  // Buff ve cooldown süreleri
  if (state.teaBuffTimer > 0) {
    state.teaBuffTimer = Math.max(0, state.teaBuffTimer - dt);
    result.teaBuffActive = state.teaBuffTimer > 0;
  }
  if (state.teaCooldown > 0) {
    state.teaCooldown = Math.max(0, state.teaCooldown - dt);
  }

  // Konuşma balonları
  if (state.speechTimer > 0) {
    state.speechTimer -= dt;
    if (state.speechTimer <= 0) state.speechText = null;
  }
  if (state.fisherSpeechTimer > 0) {
    state.fisherSpeechTimer -= dt;
    if (state.fisherSpeechTimer <= 0) state.fisherSpeechText = null;
  }

  // Periyodik balık çekme ve su sıçratma
  state.fishCatchTimer += dt;
  if (state.fishCatchTimer >= 8.0) {
    state.fishCatchTimer = 0;
    particles?.spawnWaterSplash?.(
      { x: state.fisher1Center.x, z: state.fisher1Center.z + 2.0 },
      8,
    );
  }

  // Sahil Çay Bahçesi mola kontrolü
  const cafeDist = Math.hypot(playerPos.x - state.cafeCenter.x, playerPos.z - state.cafeCenter.z);
  if (cafeDist <= 5.5 && playerSpeed < 1.2 && state.teaCooldown <= 0) {
    state.teaDwellTimer += dt;
    if (state.teaDwellTimer >= 1.0) {
      // 1 saniye duraklama tamamlandı: Çay ikram edilir
      state.teaDwellTimer = 0;
      state.teaBuffTimer = 20.0; // 20 saniyelik ferahlık buff'ı
      state.teaCooldown = 35.0; // 35 saniye soğuma
      result.teaServed = true;
      result.rewardReputation = 1;
      result.teaBuffActive = true;
      result.toastMessage = "☕ TAVŞAN KANI ÇAY MOLASI! (20s Ferahlık, +1 İtibar)";
      state.speechText = "☕ Rıza Dayı: Afiyet olsun kaptan, tavşan kanı çay iyi gelir!";
      state.speechTimer = 3.0;
      sound?.teaSpoonClink?.();
    }
  } else if (cafeDist > 6.0 || playerSpeed >= 1.5) {
    state.teaDwellTimer = 0;
  }

  return result;
}

export function triggerSeasideHonk(
  state: SeasideLifeState,
  playerPos: Vec2,
  sound?: { fishingReel?: () => void },
  particles?: Pick<ParticleSystem, "spawnWaterSplash">,
): boolean {
  const dCafe = Math.hypot(playerPos.x - state.cafeCenter.x, playerPos.z - state.cafeCenter.z);
  const dFisher1 = Math.hypot(playerPos.x - state.fisher1Center.x, playerPos.z - state.fisher1Center.z);
  const dFisher2 = Math.hypot(playerPos.x - state.fisher2Center.x, playerPos.z - state.fisher2Center.z);

  // Kafeye çok yakınsa öncelik kafecide
  if (dCafe <= 10) {
    state.speechText = "☕ Rıza Dayı: Çaylar taze demlendi kaptan, buyur gel!";
    state.speechTimer = 3.0;
    return true;
  }

  // İskele balıkçıları
  if (dFisher1 <= 16 || dFisher2 <= 16) {
    state.fisherSpeechText = "🎣 Salih Reis: Rastgele evlat! Bugün lüfer bol!";
    state.fisherSpeechTimer = 3.0;
    sound?.fishingReel?.();
    particles?.spawnWaterSplash?.(
      { x: state.fisher1Center.x, z: state.fisher1Center.z + 1.8 },
      10,
    );
    return true;
  }

  return false;
}
