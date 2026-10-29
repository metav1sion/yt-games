import type { Vec2 } from "./types";

export const CARPENTER_CENTER: Vec2 = { x: 62.0, z: -74.5 } as const;
export const CARPENTER_BAY: Vec2 = { x: 62.0, z: -68.0 } as const;
export const RUSTEM_USTA_POS: Vec2 = { x: 60.5, z: -72.0 } as const;

export const CARPENTER_BUFF_DURATION = 25.0; // 25 saniye "Sanayi İşçiliği Gücü" şasi takviyesi ve darbe dayanıklılığı (-50% darbe hasarı)
export const CARPENTER_COOLDOWN = 35.0; // 35 saniye mola soğuma süresi
export const CARPENTER_DWELL_THRESHOLD = 1.2; // 1.2 saniye atölye peronunda duraklama eşiği

export type CarpenterState = {
  center: Vec2;
  serviceBay: Vec2;
  dwellTimer: number;
  buffTimer: number;
  cooldownTimer: number;
  honkGreetingTimer: number;
  lastHonkCallout?: string;
  callout?: string;
  sawSoundTimer: number;
  totalVisits: number;
  bladeRotationPhase: number;
  sawdustFlutterPhase: number;
};

export type CarpenterEvent = {
  awardedCarpenterBonus: boolean;
  cashBonus: number;
  repBonus: number;
  buffActive: boolean;
  nitroRefill: boolean;
  sawSoundTriggered: boolean;
  honkGreeted: boolean;
  callout?: string;
};

export const RUSTEM_USTA_CALLOUTS = [
  "🪵 Marangoz Rüstem Usta: Hoş geldin evlat! Fırınlanmış meşeden Mini Kargo kasası gibi sağlam kargo sandığı yapıyoruz! 🪚",
  "📐 Marangoz Rüstem Usta: İki kere ölç, bir kere biç! Şasine birinci sınıf gürgen takviyesi attık, yola devam! 🪵",
  "🪚 Marangoz Rüstem Usta: Çam reçinesi ve taze talaş kokusu... Sanayinin en has ahşap işçiliği buradadır! 📦",
  "🌟 Marangoz Rüstem Usta: Güle güle sür kargocu dostum! Ahşabın bereketi de gücü de seninle olsun! 🚚",
];

export function createCarpenterState(): CarpenterState {
  return {
    center: { ...CARPENTER_CENTER },
    serviceBay: { ...CARPENTER_BAY },
    dwellTimer: 0,
    buffTimer: 0,
    cooldownTimer: 0,
    honkGreetingTimer: 0,
    lastHonkCallout: undefined,
    sawSoundTimer: 7.0,
    totalVisits: 0,
    bladeRotationPhase: 0,
    sawdustFlutterPhase: 0,
  };
}

export function updateCarpenter(
  state: CarpenterState,
  dt: number,
  playerPos: Vec2 = { x: 0, z: 0 },
  speed = 0,
): CarpenterEvent {
  const event: CarpenterEvent = {
    awardedCarpenterBonus: false,
    cashBonus: 0,
    repBonus: 0,
    buffActive: false,
    nitroRefill: false,
    sawSoundTriggered: false,
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

  // 2. Daire testere bıçağı dönüş ve talaş fazları
  state.bladeRotationPhase = (state.bladeRotationPhase + dt * 26.0) % (Math.PI * 2);
  state.sawdustFlutterPhase = (state.sawdustFlutterPhase + dt * 5.5) % (Math.PI * 2);

  // 3. Prosedürel daire testere & planya ortam ses döngüsü (yakındayken periyodik)
  const distToCenter = Math.hypot(playerPos.x - state.center.x, playerPos.z - state.center.z);
  if (distToCenter < 28.0) {
    state.sawSoundTimer -= dt;
    if (state.sawSoundTimer <= 0) {
      state.sawSoundTimer = 8.0 + Math.random() * 4.0;
      event.sawSoundTriggered = true;
    }
  }

  // 4. Servis peronunda duraklama kontrolü
  const distToBay = Math.hypot(playerPos.x - state.serviceBay.x, playerPos.z - state.serviceBay.z);
  const isInBay = distToBay <= 3.8;
  const isStopped = Math.abs(speed) <= 1.2;

  if (isInBay && isStopped) {
    state.dwellTimer += dt;
    if (state.dwellTimer >= CARPENTER_DWELL_THRESHOLD && state.cooldownTimer <= 0) {
      state.dwellTimer = 0;
      state.cooldownTimer = CARPENTER_COOLDOWN;
      state.buffTimer = CARPENTER_BUFF_DURATION;
      state.totalVisits += 1;

      event.awardedCarpenterBonus = true;
      event.cashBonus = 10; // 10 ₺ ahşap sandıkçılık bahşişi / sanayi desteği
      event.repBonus = 1;
      event.buffActive = true;
      event.nitroRefill = true;
      event.sawSoundTriggered = true;
      event.callout = RUSTEM_USTA_CALLOUTS[state.totalVisits % RUSTEM_USTA_CALLOUTS.length];
      state.lastHonkCallout = event.callout;
      state.callout = event.callout;
    }
  } else {
    state.dwellTimer = Math.max(0, state.dwellTimer - dt * 2.5);
  }

  return event;
}

export function triggerCarpenterHonk(state: CarpenterState, playerPos: Vec2): boolean {
  const distToRustem = Math.hypot(playerPos.x - RUSTEM_USTA_POS.x, playerPos.z - RUSTEM_USTA_POS.z);
  if (distToRustem <= 22.0) {
    state.honkGreetingTimer = 4.2;
    const calloutIndex = Math.floor(Math.random() * RUSTEM_USTA_CALLOUTS.length);
    state.lastHonkCallout = RUSTEM_USTA_CALLOUTS[calloutIndex];
    state.callout = state.lastHonkCallout;
    return true;
  }
  return false;
}
