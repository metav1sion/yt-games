import type { Vec2 } from "./types";

export const MARKET_CENTER: Vec2 = { x: -72.0, z: -58.5 } as const;
export const MARKET_BAY: Vec2 = { x: -72.0, z: -52.5 } as const;
export const CEMIL_DAYI_POS: Vec2 = { x: -70.5, z: -55.8 } as const;

export const MARKET_BUFF_DURATION = 25.0; // 25 saniye "Taze Pazar Bereketi" canlılık & nitro dopingi
export const MARKET_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const MARKET_DWELL_THRESHOLD = 1.2; // 1.2 saniye pazar peronunda duraklama eşiği

export type MarketState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  scaleSoundTimer: number;
  totalVisits: number;
  scaleSwingPhase: number;
  awningFlutterPhase: number;
};

export type MarketEvent = {
  awardedMarketBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  scaleSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const CEMIL_DAYI_CALLOUTS = [
  "🍉 Pazarcı Cemil Dayı: Gel vatandaş geeel! Çiftlikten taze çıktı, sulu sulu domatesler, kütür kütür karpuzlar! 🍋",
  "🍅 Pazarcı Cemil Dayı: Seç al kaptan! Akşama kargo yorgunluğuna iyi gelir, vitamin deposu bunlar! 🍊",
  "⚖️ Pazarcı Cemil Dayı: Tartıda gram şaşmaz, Mini Kargo'nun rotası sapmaz! Bereketli olsun! 🍇",
  "🌟 Pazarcı Cemil Dayı: Güneş Mahallesi'nin en taze tezgahı! Hayırlı teslimatlar evlat! 📦",
];

export function createMarketState(): MarketState {
  return {
    center: { ...MARKET_CENTER },
    serviceBay: { ...MARKET_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    scaleSoundTimer: 7.5,
    totalVisits: 0,
    scaleSwingPhase: 0,
    awningFlutterPhase: 0,
  };
}

export function updateMarket(
  state: MarketState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  playerSpeed = 0,
): MarketEvent {
  let scaleSoundTriggered = false;

  // 1. Terazi salınım ve tente dalgalanma fazları
  state.scaleSwingPhase = (state.scaleSwingPhase + dt * 2.8) % (Math.PI * 2);
  state.awningFlutterPhase = (state.awningFlutterPhase + dt * 3.2) % (Math.PI * 2);

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

  // 3. Ortam terazi tıkırtısı ve pazar çağrısı sesi (oyuncu yakınken)
  state.scaleSoundTimer -= dt;
  const distToBay = Math.hypot(
    playerPos.x - state.serviceBay.x,
    playerPos.z - state.serviceBay.z,
  );

  if (state.scaleSoundTimer <= 0) {
    state.scaleSoundTimer = 19.0 + Math.random() * 9.0;
    if (distToBay < 30.0) {
      scaleSoundTriggered = true;
    }
  }

  // 4. Oyuncu pazar yanaşma peronu etkileşimi (1.2 saniye duraklama)
  let awardedMarketBonus = false;
  let cashBonus = 0;
  let repBonus = 0;
  let nitroRefill = false;

  const inBay = distToBay < 3.2;
  const isStopped = Math.abs(playerSpeed) < 0.6;

  if (inBay && isStopped) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= MARKET_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      awardedMarketBonus = true;
      cashBonus = 10;
      repBonus = 1;
      nitroRefill = true;
      state.buffTimer = MARKET_BUFF_DURATION;
      state.cooldownTimer = MARKET_COOLDOWN;
      state.dwellTimer = 0;
      state.totalVisits += 1;
      scaleSoundTriggered = true;

      // Cemil Dayı teşekkür ve bereket repliği
      state.honkGreetingTimer = 4.5;
      state.lastHonkCallout = CEMIL_DAYI_CALLOUTS[0];
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.0);
  }

  return {
    awardedMarketBonus,
    cashBonus,
    repBonus,
    buffActive: state.buffTimer > 0,
    nitroRefill,
    scaleSoundTriggered,
    honkGreeted: state.honkGreetingTimer > 0,
    callout: state.lastHonkCallout,
  };
}

export function triggerMarketHonk(
  state: MarketState,
  playerPos: Vec2,
): boolean {
  const dist = Math.hypot(
    playerPos.x - CEMIL_DAYI_POS.x,
    playerPos.z - CEMIL_DAYI_POS.z,
  );

  if (dist <= 24.0) {
    state.honkGreetingTimer = 4.0;
    const calloutIndex = Math.floor(Math.random() * CEMIL_DAYI_CALLOUTS.length);
    state.lastHonkCallout = CEMIL_DAYI_CALLOUTS[calloutIndex];
    return true;
  }
  return false;
}
