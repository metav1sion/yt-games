import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import type { DistrictId } from "../game/districts";
import { createBuyPad, type BuyPad } from "../game/buy-pad";
import { box, cylinder, label } from "./world-kit";

export type DistrictBuyPadDef = {
  id: string;
  name: string;
  districtId: DistrictId;
  position: Vec2;
  targetCost: number;
  maxLevel: number;
};

export const DISTRICT_BUY_PAD_DEFS: DistrictBuyPadDef[] = [
  {
    id: "pad_unlock_market",
    name: "🚧 Çarşı Bölgesi Giriş Kapısı",
    districtId: "market",
    position: { x: 0, z: 12 },
    targetCost: 500,
    maxLevel: 1,
  },
  {
    id: "pad_unlock_industrial",
    name: "🚧 Sanayi Bölgesi Giriş Kapısı",
    districtId: "industrial",
    position: { x: 12, z: 0 },
    targetCost: 1000,
    maxLevel: 1,
  },
  {
    id: "pad_unlock_coastal",
    name: "🚧 Sahil Kordonu Giriş Kapısı",
    districtId: "coastal",
    position: { x: -12, z: 0 },
    targetCost: 1800,
    maxLevel: 1,
  },
];

export function createDistrictBuyPad(
  def: DistrictBuyPadDef,
  isUnlocked: boolean,
  onComplete?: (pad: BuyPad) => void,
): BuyPad {
  return createBuyPad({
    id: def.id,
    name: def.name,
    position: def.position,
    radius: 3.0,
    targetCost: def.targetCost,
    level: isUnlocked ? 1 : 0,
    maxLevel: def.maxLevel,
    isCompleted: isUnlocked,
    currentAmount: isUnlocked ? def.targetCost : 0,
    ...(onComplete ? { onComplete } : {}),
  });
}

export function createDistrictBuyPads(
  isUnlocked: (districtId: DistrictId) => boolean,
  onUnlock?: (districtId: DistrictId, pad: BuyPad) => void,
): BuyPad[] {
  return DISTRICT_BUY_PAD_DEFS.map((def) =>
    createDistrictBuyPad(
      def,
      isUnlocked(def.districtId),
      onUnlock ? (pad) => onUnlock(def.districtId, pad) : undefined,
    ),
  );
}

export type DistrictBarrier = {
  districtId: DistrictId;
  group: THREE.Group;
  obstacles: Rect[];
};

/** Kilitli bölge girişlerindeki bariyerleri kurar. */
export function buildDistrictBarriers(group: THREE.Group): DistrictBarrier[] {
  function buildRoadBarrier(
    parent: THREE.Group,
    x: number,
    z: number,
    length: number,
    isHorizontal: boolean,
    tag: string,
  ): { group: THREE.Group; obstacle: Rect } {
    const bg = new THREE.Group();
    bg.position.set(x, 0, z);
    parent.add(bg);

    const barW = isHorizontal ? length : 0.6;
    const barD = isHorizontal ? 0.6 : length;

    // Kırmızı-beyaz beton bariyer tabanı
    box(bg, [barW, 0.9, barD], [0, 0.45, 0], "#d63031");
    // Çizgili desen için beyaz bloklar
    const count = Math.floor(length / 2);
    for (let i = 0; i < count; i++) {
      const offset = (i - count / 2 + 0.5) * 1.8;
      const bx = isHorizontal ? offset : 0;
      const bz = isHorizontal ? 0 : offset;
      box(bg, [isHorizontal ? 0.9 : 0.65, 0.92, isHorizontal ? 0.65 : 0.9], [bx, 0.46, bz], "#f5f6fa");
    }

    // Sarı uyarı flaşörleri
    for (const side of [-1, 1]) {
      const fx = isHorizontal ? (side * length) / 2.5 : 0;
      const fz = isHorizontal ? 0 : (side * length) / 2.5;
      cylinder(bg, 0.16, 0.2, 0.4, [fx, 1.1, fz], "#f1c40f", 8);
    }

    // Şantiye uyarı levhası
    const sign = label(tag, "#ffffff", "#c0392b");
    sign.scale.set(isHorizontal ? 3.0 : 1.2, 0.6, 1);
    sign.position.set(0, 1.5, 0);
    bg.add(sign);

    const halfW = barW / 2 + 0.2;
    const halfD = barD / 2 + 0.2;
    const obstacle: Rect = {
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfD,
      maxZ: z + halfD,
    };

    return { group: bg, obstacle };
  }

  const barriers: DistrictBarrier[] = [];

  // 1. Çarşı Bölgesi Bariyerleri (Level 2'de kalkar)
  const marketBarrierGroup = new THREE.Group();
  group.add(marketBarrierGroup);
  const marketObstacles: Rect[] = [];
  const mb1 = buildRoadBarrier(marketBarrierGroup, 5, 50, 10, false, "KİLİTLİ · SEVİYE 2");
  const mb2 = buildRoadBarrier(marketBarrierGroup, 50, 5, 10, true, "KİLİTLİ · SEVİYE 2");
  const mb3 = buildRoadBarrier(marketBarrierGroup, 6, 6, 9, false, "ÇARŞI · SEVİYE 2");
  const mb4 = buildRoadBarrier(marketBarrierGroup, 5, 34, 8, false, "KİLİTLİ · SEVİYE 2");
  const mb5 = buildRoadBarrier(marketBarrierGroup, 5, 84, 8, false, "KİLİTLİ · SEVİYE 2");
  // Çimenden kaçak geçişi önleyen tam sınır hattı engelleri
  marketObstacles.push(
    mb1.obstacle,
    mb2.obstacle,
    mb3.obstacle,
    mb4.obstacle,
    mb5.obstacle,
    { minX: 4.6, maxX: 5.4, minZ: 4.6, maxZ: 100 },
    { minX: 4.6, maxX: 100, minZ: 4.6, maxZ: 5.4 },
  );
  barriers.push({ districtId: "market", group: marketBarrierGroup, obstacles: marketObstacles });

  // 2. Sanayi Bölgesi Bariyerleri (Level 3'te kalkar)
  const industrialBarrierGroup = new THREE.Group();
  group.add(industrialBarrierGroup);
  const industrialObstacles: Rect[] = [];
  const ib1 = buildRoadBarrier(industrialBarrierGroup, 5, -50, 10, false, "KİLİTLİ · SEVİYE 3");
  const ib2 = buildRoadBarrier(industrialBarrierGroup, 50, -5, 10, true, "KİLİTLİ · SEVİYE 3");
  const ib3 = buildRoadBarrier(industrialBarrierGroup, 6, -6, 9, false, "SANAYİ · SEVİYE 3");
  const ib4 = buildRoadBarrier(industrialBarrierGroup, 5, -66, 8, false, "KİLİTLİ · SEVİYE 3");
  const ib5 = buildRoadBarrier(industrialBarrierGroup, 5, -16, 8, false, "KİLİTLİ · SEVİYE 3");
  industrialObstacles.push(
    ib1.obstacle,
    ib2.obstacle,
    ib3.obstacle,
    ib4.obstacle,
    ib5.obstacle,
    { minX: 4.6, maxX: 5.4, minZ: -100, maxZ: -4.6 },
    { minX: 4.6, maxX: 100, minZ: -5.4, maxZ: -4.6 },
  );
  barriers.push({ districtId: "industrial", group: industrialBarrierGroup, obstacles: industrialObstacles });

  // 3. Sahil Bölgesi Bariyerleri (Level 4'te kalkar)
  const coastalBarrierGroup = new THREE.Group();
  group.add(coastalBarrierGroup);
  const coastalObstacles: Rect[] = [];
  const cb1 = buildRoadBarrier(coastalBarrierGroup, -50, 5, 10, true, "KİLİTLİ · SEVİYE 4");
  const cb2 = buildRoadBarrier(coastalBarrierGroup, -5, 50, 10, false, "KİLİTLİ · SEVİYE 4");
  const cb3 = buildRoadBarrier(coastalBarrierGroup, -6, 6, 9, false, "SAHİL · SEVİYE 4");
  const cb4 = buildRoadBarrier(coastalBarrierGroup, -5, 34, 8, false, "KİLİTLİ · SEVİYE 4");
  const cb5 = buildRoadBarrier(coastalBarrierGroup, -5, 80, 8, false, "KİLİTLİ · SEVİYE 4");
  coastalObstacles.push(
    cb1.obstacle,
    cb2.obstacle,
    cb3.obstacle,
    cb4.obstacle,
    cb5.obstacle,
    { minX: -100, maxX: -4.6, minZ: 4.6, maxZ: 5.4 },
    { minX: -5.4, maxX: -4.6, minZ: 4.6, maxZ: 100 },
  );
  barriers.push({ districtId: "coastal", group: coastalBarrierGroup, obstacles: coastalObstacles });
  return barriers;
}
