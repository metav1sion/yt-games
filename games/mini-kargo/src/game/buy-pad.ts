import type { Vec2 } from "./types";

export type BuyPad = {
  id: string;
  name: string;
  position: Vec2;
  radius: number;
  targetCost: number;
  currentAmount: number;
  level: number;
  maxLevel: number;
  isCompleted: boolean;
  onComplete?: (pad: BuyPad) => void;
  getNextCost?: (level: number, pad: BuyPad) => number;
};

export type BuyPadEvent =
  | {
      type: "deposit";
      padId: string;
      pad: BuyPad;
      amount: number;
      currentAmount: number;
      targetCost: number;
    }
  | {
      type: "complete";
      padId: string;
      pad: BuyPad;
      level: number;
      maxLevel: number;
      isMaxLevel: boolean;
      nextCost?: number;
    };

export type UpdateBuyPadsOptions = {
  playerSpeed?: number;
  drainRate?: number;
  speedThreshold?: number;
  onComplete?: (pad: BuyPad) => void;
};

export type UpdateBuyPadsResult = {
  spentMoney: number;
  remainingMoney: number;
  activePad: BuyPad | null;
  events: BuyPadEvent[];
};

export const DEFAULT_DRAIN_RATE = 120;
export const DEFAULT_SPEED_THRESHOLD = 2.0;

export function createBuyPad(params: {
  id: string;
  name: string;
  position: Vec2;
  targetCost: number;
  radius?: number;
  currentAmount?: number;
  level?: number;
  maxLevel?: number;
  isCompleted?: boolean;
  onComplete?: (pad: BuyPad) => void;
  getNextCost?: (level: number, pad: BuyPad) => number;
}): BuyPad {
  return {
    id: params.id,
    name: params.name,
    position: params.position,
    radius: params.radius ?? 3.0,
    targetCost: params.targetCost,
    currentAmount: params.currentAmount ?? 0,
    level: params.level ?? 0,
    maxLevel: params.maxLevel ?? 3,
    isCompleted: params.isCompleted ?? false,
    ...(params.onComplete ? { onComplete: params.onComplete } : {}),
    ...(params.getNextCost ? { getNextCost: params.getNextCost } : {}),
  };
}

/**
 * Oyuncunun pedler üzerindeki durumunu kontrol eder, parayı pede akıtır
 * ve seviye yükseltmelerini tetikler.
 *
 * @param pads Oyundaki mevcut BuyPad listesi
 * @param playerPos Oyuncunun araba pozisyonu (Vec2: x, z)
 * @param playerMoney Oyuncunun mevcut kasasındaki para
 * @param dt Delta zamanı (saniye)
 * @param speedOrOptions Oyuncunun hızı veya ek ayarlar
 * @param maybeOptions Ek ayarlar (hız ayrı bir argüman olarak geçildiğinde)
 */
export function updateBuyPads(
  pads: BuyPad[],
  playerPos: Vec2,
  playerMoney: number,
  dt: number,
  speedOrOptions?: number | UpdateBuyPadsOptions,
  maybeOptions?: UpdateBuyPadsOptions,
): UpdateBuyPadsResult {
  const options =
    typeof speedOrOptions === "object" && speedOrOptions !== null
      ? speedOrOptions
      : (maybeOptions ?? {});

  const playerSpeed =
    typeof speedOrOptions === "number"
      ? speedOrOptions
      : (options.playerSpeed ?? 0);

  const drainRate = options.drainRate ?? DEFAULT_DRAIN_RATE;
  const speedThreshold = options.speedThreshold ?? DEFAULT_SPEED_THRESHOLD;

  const result: UpdateBuyPadsResult = {
    spentMoney: 0,
    remainingMoney: Math.max(0, playerMoney),
    activePad: null,
    events: [],
  };

  if (dt <= 0 || pads.length === 0) {
    return result;
  }

  // Oyuncunun içinde bulunduğu en yakın tamamlanmamış pedi bul
  let closestPad: BuyPad | null = null;
  let minDistance = Infinity;

  for (const pad of pads) {
    if (pad.isCompleted) continue;
    const dx = playerPos.x - pad.position.x;
    const dz = playerPos.z - pad.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= pad.radius && dist < minDistance) {
      minDistance = dist;
      closestPad = pad;
    }
  }

  if (!closestPad) {
    return result;
  }

  result.activePad = closestPad;

  // Hız eşiği kontrolü: Oyuncu duruyor veya yavaş olmalı (hız < speedThreshold)
  if (playerSpeed >= speedThreshold) {
    return result;
  }

  // Bakiye kontrolü: Oyuncunun parası olmalı
  if (playerMoney <= 0) {
    return result;
  }

  // Pede aktarılacak para miktarı hesabı
  const needed = Math.max(0, closestPad.targetCost - closestPad.currentAmount);
  if (needed <= 0) {
    // Ped zaten dolmuşsa tamamlama adımı
    completePad(closestPad, options, result);
    return result;
  }

  const maxTransfer = drainRate * dt;
  const toTransfer = Math.min(playerMoney, needed, maxTransfer);

  if (toTransfer > 0) {
    closestPad.currentAmount += toTransfer;
    result.spentMoney = toTransfer;
    result.remainingMoney = Math.max(0, playerMoney - toTransfer);

    result.events.push({
      type: "deposit",
      padId: closestPad.id,
      pad: closestPad,
      amount: toTransfer,
      currentAmount: closestPad.currentAmount,
      targetCost: closestPad.targetCost,
    });
  }

  // Dolum hedefine ulaşıldı mı kontrolü (küçük ondalık kaymalarına karşı epsilon payı ile)
  if (closestPad.currentAmount >= closestPad.targetCost - 1e-4) {
    completePad(closestPad, options, result);
  }

  return result;
}

function completePad(
  pad: BuyPad,
  options: UpdateBuyPadsOptions,
  result: UpdateBuyPadsResult,
) {
  pad.currentAmount = pad.targetCost;
  pad.level += 1;
  const isMax = pad.level >= pad.maxLevel;
  let nextCost: number | undefined;

  if (isMax) {
    pad.isCompleted = true;
  } else {
    pad.currentAmount = 0;
    if (pad.getNextCost) {
      nextCost = pad.getNextCost(pad.level, pad);
    } else {
      nextCost = Math.round(pad.targetCost * 1.5);
    }
    pad.targetCost = nextCost;
  }

  pad.onComplete?.(pad);
  options.onComplete?.(pad);

  result.events.push({
    type: "complete",
    padId: pad.id,
    pad,
    level: pad.level,
    maxLevel: pad.maxLevel,
    isMaxLevel: isMax,
    nextCost,
  });
}
