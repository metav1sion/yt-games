import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { districts, type DistrictId } from "../game/districts";
import { RAMPS } from "../game/ramps";
import { createRamps } from "./ramps";
import { assetManager, type AssetManager } from "./assets";
import { createWorldContext, setWorldNightEmissive } from "./world-kit";
import { buildBaseTerrain } from "./base-terrain";
import { buildSunnyDistrict } from "./districts/sunny";
import { buildMarketDistrict } from "./districts/market";
import { buildIndustrialDistrict } from "./districts/industrial";
import { buildCoastalDistrict } from "./districts/coastal";
import { buildDistrictBarriers, type DistrictBarrier } from "./district-barriers";
import { createCargoRacksView, type CargoRacksView } from "./cargo-racks";
import { buildCityBuildings } from "./city-buildings";
import { createDeliveryStations, type DeliveryStationsView } from "./delivery-stations";
import { createTrafficLights, type TrafficLightsView } from "./traffic-lights";
import { createBusStops, type BusStopsView } from "./bus-stops";
import { createGasStationView, type GasStationView } from "./gas-station";
import { createRoadWorkView, type RoadWorkView } from "./road-work";
import { createSeasideLifeView, type SeasideLifeView } from "./seaside-life";
import { createFerrisWheelView, type FerrisWheelView } from "./ferris-wheel";
import { createTramView, type TramView } from "./tram";
import { createTrainView, type TrainView } from "./train";
import { createCommunityParkView, type CommunityParkView } from "./community-park";
import { createFishingHarbourView, type FishingHarbourView } from "./fishing-harbour";
import { createAutoRepairView, type AutoRepairView } from "./auto-repair";
import { createGroceryStoreView, type GroceryStoreView } from "./grocery-store";
import { createCoffeeHouseView, type CoffeeHouseView } from "./coffee-house";

export { box, cylinder, label } from "./world-kit";
export type { DistrictBarrier } from "./district-barriers";
export type { CargoRacksView } from "./cargo-racks";
export type { DeliveryStationsView } from "./delivery-stations";
export type { TrafficLightsView } from "./traffic-lights";
export type { BusStopsView } from "./bus-stops";
export type { GasStationView } from "./gas-station";
export type { RoadWorkView } from "./road-work";
export type { SeasideLifeView } from "./seaside-life";
export type { FerrisWheelView } from "./ferris-wheel";
export type { TramView } from "./tram";
export type { TrainView } from "./train";
export type { CommunityParkView } from "./community-park";
export type { FishingHarbourView } from "./fishing-harbour";
export type { AutoRepairView } from "./auto-repair";
export type { GroceryStoreView } from "./grocery-store";
export type { CoffeeHouseView } from "./coffee-house";
export { buildCityBuildings, CITY_BUILDINGS_CATALOG } from "./city-buildings";

export type World = {
  group: THREE.Group;
  obstacles: Rect[];
  bounds: Rect;
  depot: Vec2;
  homes: Vec2[];
  barriers: DistrictBarrier[];
  cargoRacks: CargoRacksView;
  deliveryStations: DeliveryStationsView;
  trafficLights: TrafficLightsView;
  busStops: BusStopsView;
  gasStation: GasStationView;
  roadWork: RoadWorkView;
  seasideLife: SeasideLifeView;
  ferrisWheel: FerrisWheelView;
  tram: TramView;
  train: TrainView;
  communityPark: CommunityParkView;
  fishingHarbour: FishingHarbourView;
  autoRepair: AutoRepairView;
  groceryStore: GroceryStoreView;
  coffeeHouse: CoffeeHouseView;
  unlockedDistricts: Set<DistrictId>;
  isDistrictUnlocked(districtId: DistrictId): boolean;
  update(
    dt: number,
    isNightOrDusk?: boolean,
    activeTargetIndex?: number,
    isDelivering?: boolean,
    playerPos?: Vec2,
  ): void;
  getNightFactor?(): number;
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
  const { fountain } = buildMarketDistrict(ctx);
  const { chimneySmokes } = buildIndustrialDistrict(ctx);
  const { lighthouse, marinaBoats } = buildCoastalDistrict(ctx);
  buildCityBuildings(ctx);

  // Akaryakıt İstasyonu & Oto Yıkama (T36)
  const gasStation = createGasStationView();
  group.add(gasStation.group);
  ctx.baseObstacles.push(...gasStation.obstacles);

  // Dinamik Yol Bakım Şantiyesi (T38)
  const roadWork = createRoadWorkView();
  group.add(roadWork.group);
  ctx.baseObstacles.push(...roadWork.obstacles);

  // Sahil Çay Bahçesi & İskele Balıkçıları (T39)
  const seasideLife = createSeasideLifeView();
  group.add(seasideLife.group);
  ctx.baseObstacles.push(...seasideLife.obstacles);

  // Büyük Sahil Dönme Dolabı & Lunapark İskelesi (T41)
  const ferrisWheel = createFerrisWheelView();
  group.add(ferrisWheel.group);
  ctx.baseObstacles.push(...ferrisWheel.obstacles);

  // Tarihi Çarşı Tramvay Hattı & Nostaljik Tramvay (T42)
  const tram = createTramView();
  group.add(tram.group);
  ctx.baseObstacles.push(...tram.obstacles);

  // Sanayi Bölgesi Ağır Demiryolu Manevra Hattı & Dizel Lokomotif (T43)
  const train = createTrainView();
  group.add(train.group);
  ctx.baseObstacles.push(...train.obstacles);

  // Güneş Mahallesi Çocuk Parkı, Kamelya & Bahçıvan Selahattin (T44)
  const communityPark = createCommunityParkView();
  group.add(communityPark.group);
  ctx.baseObstacles.push(...communityPark.obstacles);

  // Sahil Marina Balıkçı Barınağı & Taze Balık-Ekmek Teknesi (T45)
  const fishingHarbour = createFishingHarbourView();
  group.add(fishingHarbour.group);
  ctx.baseObstacles.push(...fishingHarbour.obstacles);

  // Sanayi "Usta Eller Oto Sanayi" Tamirhanesi & Araç Bakım Lifti (T46)
  const autoRepair = createAutoRepairView();
  group.add(autoRepair.group);
  ctx.baseObstacles.push(...autoRepair.obstacles);

  // Güneş Mahallesi "Bizim Bakkal" Mahalle Bakkaliyesi & Ekmek/Gazete Tezgahı (T47)
  const groceryStore = createGroceryStoreView();
  group.add(groceryStore.group);
  ctx.baseObstacles.push(...groceryStore.obstacles);

  // Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (T48)
  const coffeeHouse = createCoffeeHouseView();
  group.add(coffeeHouse.group);
  ctx.baseObstacles.push(...coffeeHouse.obstacles);

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

  // 16 Teslimat Noktası İstasyonları & Karşılayıcı NPC Karakterleri
  const deliveryStations = createDeliveryStations(ctx.homes);
  group.add(deliveryStations.group);

  // Şehir Sinyalizasyon & Yaya Geçidi Trafik Işıkları
  const trafficLights = createTrafficLights();
  group.add(trafficLights.group);

  // Şehir İçi Otobüs Durakları ("D" Levhaları, Cam Kanopi, Bank & Bekleyen Yolcular)
  const busStops = createBusStops();
  group.add(busStops.group);

  let currentNightFactor = 0;

  return {
    group,
    obstacles,
    bounds,
    depot,
    homes: ctx.homes,
    barriers,
    cargoRacks,
    deliveryStations,
    trafficLights,
    busStops,
    gasStation,
    roadWork,
    seasideLife,
    ferrisWheel,
    tram,
    train,
    communityPark,
    fishingHarbour,
    autoRepair,
    groceryStore,
    coffeeHouse,
    unlockedDistricts: unlockedSet,
    isDistrictUnlocked(districtId: DistrictId) {
      return unlockedSet.has(districtId);
    },
    update(
      dt: number,
      isNightOrDusk = false,
      activeTargetIndex = -1,
      isDelivering = false,
      playerPos?: Vec2,
    ) {
      const targetNight = isNightOrDusk ? 1.0 : 0.0;
      currentNightFactor = THREE.MathUtils.lerp(
        currentNightFactor,
        targetNight,
        1 - Math.exp(-4 * dt),
      );
      setWorldNightEmissive(currentNightFactor);

      lighthouse.update(dt, isNightOrDusk);
      marinaBoats.update(dt);
      fountain.update(dt);
      for (const smoke of chimneySmokes) {
        smoke.update(dt);
      }
      deliveryStations.update(dt, activeTargetIndex, isDelivering);
      trafficLights.update(dt, isNightOrDusk);
      busStops.update(dt, playerPos);
    },
    getNightFactor() {
      return currentNightFactor;
    },
    updateCargoRacks(cargoLevel: number) {
      cargoRacks.update(cargoLevel);
    },
    updateUnlockedDistricts,
  };
}
