import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { districts, type DistrictId } from "../game/districts";
import { RAMPS } from "../game/ramps";
import { createRamps } from "./ramps";
import { assetManager, type AssetManager } from "./assets";
import { createWorldContext } from "./world-kit";
import { buildBaseTerrain } from "./base-terrain";
import { buildSunnyDistrict } from "./districts/sunny";
import { buildMarketDistrict } from "./districts/market";
import { buildIndustrialDistrict } from "./districts/industrial";
import { buildCoastalDistrict } from "./districts/coastal";
import { buildDistrictBarriers, type DistrictBarrier } from "./district-barriers";
import { createCargoRacksView, type CargoRacksView } from "./cargo-racks";
import { buildCityBuildings } from "./city-buildings";

export { box, cylinder, label } from "./world-kit";
export type { DistrictBarrier } from "./district-barriers";
export type { CargoRacksView } from "./cargo-racks";
export { buildCityBuildings, CITY_BUILDINGS_CATALOG } from "./city-buildings";

export type World = {
  group: THREE.Group;
  obstacles: Rect[];
  bounds: Rect;
  depot: Vec2;
  homes: Vec2[];
  barriers: DistrictBarrier[];
  cargoRacks: CargoRacksView;
  unlockedDistricts: Set<DistrictId>;
  isDistrictUnlocked(districtId: DistrictId): boolean;
  updateCargoRacks(cargoLevel: number): void;
  updateUnlockedDistricts(
    companyLevel: number,
    extraUnlocked?: DistrictId[] | Set<DistrictId>,
  ): DistrictId[];
};

export function createWorld(assets: Pick<AssetManager, "cloneModel"> = assetManager): World {
  const group = new THREE.Group();
  const obstacles: Rect[] = [];
  // 200x200 birimlik büyük şehir sınırları
  const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };

  buildBaseTerrain(group);

  // Ev sırası (homes indeksleri districts.ts ile eşleşir): Güneş, Çarşı, Sanayi, Sahil.
  const ctx = createWorldContext(group, assets);
  const { depot } = buildSunnyDistrict(ctx);
  buildMarketDistrict(ctx);
  buildIndustrialDistrict(ctx);
  buildCoastalDistrict(ctx);
  buildCityBuildings(ctx);

  const barriers = buildDistrictBarriers(group);
  const baseObstacles = ctx.baseObstacles;
  const unlockedSet = new Set<DistrictId>(["sunny"]);

  function updateUnlockedDistricts(
    companyLevel: number,
    extraUnlocked?: DistrictId[] | Set<DistrictId>,
  ): DistrictId[] {
    const newlyUnlocked: DistrictId[] = [];
    for (const district of districts) {
      const isExtra =
        extraUnlocked &&
        (extraUnlocked instanceof Set
          ? extraUnlocked.has(district.id)
          : Array.isArray(extraUnlocked) && extraUnlocked.includes(district.id));
      if ((companyLevel >= district.unlockLevel || isExtra) && !unlockedSet.has(district.id)) {
        unlockedSet.add(district.id);
        newlyUnlocked.push(district.id);
      }
    }
    // Bariyerlerin görünürlüğünü güncelle ve engelleri yeniden oluştur
    obstacles.length = 0;
    obstacles.push(...baseObstacles);
    for (const b of barriers) {
      const isUnlocked = unlockedSet.has(b.districtId);
      b.group.visible = !isUnlocked;
      b.group.position.y = isUnlocked ? -10 : 0;
      if (!isUnlocked) obstacles.push(...b.obstacles);
    }
    return newlyUnlocked;
  }

  // Varsayılan seviye 1 engellerini ayarla
  updateUnlockedDistricts(1);

  // Zıplama rampalarını dünyaya ekle
  group.add(createRamps(RAMPS));

  // 3D Kargo rafları ve koli yığınları
  const cargoRacks = createCargoRacksView(0);
  group.add(cargoRacks.group);

  return {
    group,
    obstacles,
    bounds,
    depot,
    homes: ctx.homes,
    barriers,
    cargoRacks,
    unlockedDistricts: unlockedSet,
    isDistrictUnlocked(districtId: DistrictId) {
      return unlockedSet.has(districtId);
    },
    updateCargoRacks(cargoLevel: number) {
      cargoRacks.update(cargoLevel);
    },
    updateUnlockedDistricts,
  };
}
