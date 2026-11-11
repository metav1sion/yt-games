import * as THREE from "three";
import "./style.css";
import { createWorld } from "./scene/world";
import { createCar } from "./scene/car";
import { updateCamera, resetCamera } from "./scene/camera";
import { createMarkers, createDeliveryAnimation } from "./scene/markers";
import { createSkidmarks } from "./scene/skidmarks";
import { createParticles } from "./scene/particles";
import { createClouds } from "./scene/clouds";
import { createInput } from "./game/input";
import { stepVehicle, resetVehicle, TUNING } from "./game/vehicle";
import { resolveCollision } from "./game/collision";
import { createLoop } from "./game/loop";
import { createDeliveryState, stepDelivery, packageInfo } from "./game/delivery";
import { createContactDamageTracker, staticCollisionContacts } from "./game/contact-damage";
import { createHud } from "./ui/hud";
import { createLocalStorageAdapter, asCompanyProgression, type CompanyProgression } from "./platform/storage";
import { createSound } from "./audio/sound";
import { tryPurchaseUpgrade, upgradeCost, MAX_UPGRADE_LEVEL, type UpgradeKind } from "./game/upgrades";
import { createBuyPad, updateBuyPads, type BuyPad } from "./game/buy-pad";
import { createBuyPadsView } from "./scene/buy-pad";
import { applyOfflineEarnings, claimOfflineEarnings, hireCourier, generateCourierCandidate } from "./game/company";
import { createCompanySheet } from "./ui/company-sheet";
import { createTraffic } from "./scene/traffic";
import { createPedestrians } from "./scene/pedestrians";
import { createUrbanFauna } from "./scene/urban-fauna";
import { createEnvironmentalFX } from "./scene/environmental-fx";
import { getLiveryById, checkNewTrophies } from "./game/career";
import { createCourierFleet } from "./game/fleet";
import { createFleetView } from "./scene/fleet";
import { districtById, districtAt, isDistrictUnlocked, type DistrictId } from "./game/districts";
import {
  createDistrictBuyPads,
  DISTRICT_BUY_PAD_DEFS,
} from "./scene/district-barriers";
import { RAMPS, checkRampLaunch } from "./game/ramps";
import { createProps } from "./scene/props";
import { assetManager } from "./scene/assets";
import { createMinimap } from "./ui/minimap";
import type { VehicleType } from "./game/types";
import { createParkedVehicle } from "./scene/parked-vehicle";
import { createAtmosphereController } from "./scene/atmosphere";
import { createWeatherSystem } from "./scene/weather";
import { createPuddlesView } from "./scene/puddles";
import { createPitstopView } from "./scene/pitstop";
import { createPitstopState, stepPitstop } from "./game/pitstop";
import { createStreetVendorsView } from "./scene/street-vendors";
import { createStreetVendorState, stepStreetVendors, consumeFaunaTreat } from "./game/street-vendors";
import { createGasStationState, stepGasStation } from "./game/gas-station";
import {
  createRoadWorkState,
  updateRoadWork,
  triggerRoadWorkHonk,
} from "./game/road-work";
import {
  createSeasideLifeState,
  updateSeasideLife,
  triggerSeasideHonk,
} from "./game/seaside-life";
import {
  createFerrisWheelState,
  updateFerrisWheel,
  triggerFerrisWheelHonk,
} from "./game/ferris-wheel";
import {
  createTramState,
  updateTram,
  triggerTramHonk,
} from "./game/tram";
import {
  createTrainState,
  updateTrain,
  triggerTrainHonk,
} from "./game/train";
import {
  createCommunityParkState,
  updateCommunityPark,
  triggerGardenerHonk,
} from "./game/community-park";
import {
  createFishingHarbourState,
  updateFishingHarbour,
  triggerChefTemelHonk,
} from "./game/fishing-harbour";
import {
  createAutoRepairState,
  updateAutoRepair,
  triggerMechanicHonk,
} from "./game/auto-repair";
import {
  createGroceryStoreState,
  updateGroceryStore,
  triggerGrocerHonk,
  GROCER_HUSNU_POS,
} from "./game/grocery-store";
import {
  createCoffeeHouseState,
  updateCoffeeHouse,
  triggerCoffeeHouseHonk,
  COFFEE_MASTER_BEKIR_POS,
} from "./game/coffee-house";
import {
  createIceCreamStandState,
  updateIceCreamStand,
  triggerIceCreamStandHonk,
  ICE_CREAM_MASTER_ALI_POS,
} from "./game/ice-cream-stand";
import {
  createRestaurantState,
  updateRestaurant,
  triggerRestaurantHonk,
  CHEF_HAKKI_POS,
} from "./game/restaurant";
import {
  createSchoolState,
  updateSchool,
  triggerSchoolHonk,
  HASAN_DAYI_POS,
} from "./game/school";
import {
  createBakeryState,
  updateBakery,
  triggerBakeryHonk,
  SABAN_USTA_POS,
} from "./game/bakery";
import {
  createLighthouseState,
  updateLighthouse,
  triggerLighthouseHonk,
  RIZA_KAPTAN_POS,
} from "./game/lighthouse";
import {
  createMarketState,
  updateMarket,
  triggerMarketHonk,
  CEMIL_DAYI_POS,
} from "./game/market";
import {
  createCarpenterState,
  updateCarpenter,
  triggerCarpenterHonk,
  RUSTEM_USTA_POS,
} from "./game/carpenter";
import {
  createCoppersmithState,
  updateCoppersmith,
  triggerCoppersmithHonk,
  KAZIM_USTA_POS,
} from "./game/coppersmith";
import {
  createCinemaState,
  updateCinema,
  triggerCinemaHonk,
  RIFAT_POS,
} from "./game/cinema";
import {
  createPostOfficeState,
  updatePostOffice,
  triggerPostOfficeHonk,
  KEMAL_POS,
} from "./game/post-office";
import {
  createFoundryState,
  updateFoundry,
  triggerFoundryHonk,
  HAMDI_USTA_POS,
} from "./game/foundry";
import {
  createTurkishCoffeeState,
  updateTurkishCoffee,
  triggerTurkishCoffeeHonk,
  TAHSIN_EFENDI_POS,
} from "./game/turkish-coffee";
import {
  createLifesavingState,
  updateLifesaving,
  triggerLifesavingHonk,
  SUKRU_KAPTAN_POS,
} from "./game/lifesaving";
import {
  createHealthClinicState,
  updateHealthClinic,
  triggerHealthClinicHonk,
  DR_HIKMET_POS,
} from "./game/health-clinic";
import {
  createLatheWorkshopState,
  updateLatheWorkshop,
  triggerLatheWorkshopHonk,
  NECATI_USTA_POS,
} from "./game/lathe-workshop";
export async function startGame(app: HTMLElement) {
  try {
    await assetManager.load();
  } catch (error) {
    console.warn("Mahalle varlıkları yüklenemedi; prosedürel görünüm kullanılıyor:", error);
  }
  app.innerHTML =
    '<canvas id="game" aria-label="Mini Kargo oyun alanı"></canvas>';
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector<HTMLCanvasElement>("#game")!,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor("#70c5ff");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#cbe9fc", 85, 185);
  const hemi = new THREE.HemisphereLight("#e2f3ff", "#72b063", 2.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff5eb", 3.2);
  sun.position.set(-24, 38, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 120;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);
  const atmosphere = createAtmosphereController(renderer, scene, sun, hemi);
  const clouds = createClouds(11);
  scene.add(clouds.group);
  const weather = createWeatherSystem();
  scene.add(weather.group);
  const puddles = createPuddlesView();
  scene.add(puddles.group);
  const pitstopView = createPitstopView();
  scene.add(pitstopView.group);
  let pitstopState = createPitstopState();
  const streetVendorsView = createStreetVendorsView();
  scene.add(streetVendorsView.group);
  let streetVendorsState = createStreetVendorState();
  const world = createWorld();
  scene.add(world.group);
  let gasStationState = createGasStationState();
  let roadWorkState = createRoadWorkState();
  let seasideLifeState = createSeasideLifeState();
  let ferrisWheelState = createFerrisWheelState();
  let tramState = createTramState();
  let trainState = createTrainState();
  let communityParkState = createCommunityParkState();
  let fishingHarbourState = createFishingHarbourState();
  let autoRepairState = createAutoRepairState();
  let groceryStoreState = createGroceryStoreState();
  let coffeeHouseState = createCoffeeHouseState();
  let iceCreamStandState = createIceCreamStandState();
  let restaurantState = createRestaurantState();
  let schoolState = createSchoolState();
  let bakeryState = createBakeryState();
  let lighthouseState = createLighthouseState();
  let marketState = createMarketState();
  let carpenterState = createCarpenterState();
  let coppersmithState = createCoppersmithState();
  let cinemaState = createCinemaState();
  let postOfficeState = createPostOfficeState();
  let foundryState = createFoundryState();
  let turkishCoffeeState = createTurkishCoffeeState();
  let lifesavingState = createLifesavingState();
  let healthClinicState = createHealthClinicState();
  let latheWorkshopState = createLatheWorkshopState();
  let carShineTimer = 0;
  let feedHoldTimer = 0;
  const marker = createMarkers();
  scene.add(marker.group);
  const traffic = createTraffic();
  scene.add(traffic.group);
  const pedestrians = createPedestrians();
  scene.add(pedestrians.group);
  const fleetView = createFleetView();
  scene.add(fleetView.group);
  const buyPadsView = createBuyPadsView();
  scene.add(buyPadsView.group);
  const deliveryAnimation = createDeliveryAnimation(scene);
  const skidmarks = createSkidmarks(scene);
  const particles = createParticles(scene);
  const props = createProps(scene);
  const camera = new THREE.PerspectiveCamera(
    40,
    innerWidth / innerHeight,
    0.1,
    150,
  );
  const storage = createLocalStorageAdapter({
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  });
  const preferences = storage.load(),
    sound = createSound();
  props.setSound?.(sound);
  const urbanFauna = createUrbanFauna(sound);
  scene.add(urbanFauna.group);
  const environmentalFX = createEnvironmentalFX(sound);
  scene.add(environmentalFX.group);
  let progression: CompanyProgression = asCompanyProgression(preferences);
  progression = applyOfflineEarnings(progression, Date.now());
  // Haritadaki tüm evlere (Güneş, Çarşı, Sanayi, Sahil) teslimat yapılabilmesi için tüm bölgeleri açıyoruz
  const allDistricts: DistrictId[] = ["sunny", "market", "industrial", "coastal"];
  if (!progression.unlockedDistricts || progression.unlockedDistricts.length < 4) {
    progression = { ...progression, unlockedDistricts: allDistricts };
  }
  storage.save(progression);

  const currentVehType = (progression.currentVehicle as VehicleType) ?? "van";
  const initialLivery = progression.currentLivery ?? "classic";
  const car = createCar(null, currentVehType, initialLivery);
  scene.add(car.group);

  const isScooterUnlocked = (progression.unlockedVehicles || []).includes("scooter");
  const parkedVehicle = createParkedVehicle({ x: -68, z: -32 });
  scene.add(parkedVehicle.group);
  parkedVehicle.update(0, currentVehType, isScooterUnlocked);

  const contactDamage = createContactDamageTracker();
  // Oyuncunun seçtiği teslimat bölgesi (null = seviyedeki en son bölge).
  let selectedDistrict: DistrictId | null = null;
  let lastDistrict: DistrictId = districtAt(world.depot.x, world.depot.z);
  let vehicle = resetVehicle(world.depot, currentVehType),
    delivery = createDeliveryState(
        progression.upgrades.cargo,
        progression.companyLevel,
        selectedDistrict,
        progression.completedDeliveries,
        null,
        progression.unlockedDistricts,
      ),
    started = false,
    soundEnabled = progression.soundEnabled,
    cameraShake = 0;
  world.updateUnlockedDistricts(progression.companyLevel, progression.unlockedDistricts);
  world.updateCargoRacks(progression.upgrades.cargo ?? 0);
  traffic.setCompanyLevel(progression.companyLevel, progression.unlockedDistricts);
  pedestrians.setCompanyLevel(progression.companyLevel, progression.unlockedDistricts);
  sound.setEnabled(soundEnabled);
  if (typeof window !== "undefined") {
    (window as any).__MINI_KARGO_DEV__ = {
      setVehiclePos: (x: number, z: number, heading = 0) => {
        vehicle.position.x = x;
        vehicle.position.z = z;
        vehicle.heading = heading;
        resetCamera(vehicle.position, vehicle.heading);
      },
      getTramState: () => tramState,
      getTrainState: () => trainState,
      getCommunityParkState: () => communityParkState,
      getFishingHarbourState: () => fishingHarbourState,
      getAutoRepairState: () => autoRepairState,
      getGroceryStoreState: () => groceryStoreState,
      getCoffeeHouseState: () => coffeeHouseState,
      getIceCreamStandState: () => iceCreamStandState,
      getRestaurantState: () => restaurantState,
      getSchoolState: () => schoolState,
      getBakeryState: () => bakeryState,
      getLighthouseState: () => lighthouseState,
      getMarketState: () => marketState,
      getCarpenterState: () => carpenterState,
      getCoppersmithState: () => coppersmithState,
      getCinemaState: () => cinemaState,
      getPostOfficeState: () => postOfficeState,
      getFoundryState: () => foundryState,
      getTurkishCoffeeState: () => turkishCoffeeState,
      getLifesavingState: () => lifesavingState,
      getHealthClinicState: () => healthClinicState,
      getLatheWorkshopState: () => latheWorkshopState,
    };
  }
  const fleet = createCourierFleet({
    onDelivery(ev) {
      progression = {
        ...progression,
        money: progression.money + ev.earnings,
        reputation: progression.reputation + ev.reputation,
      };
      storage.save({ ...progression, soundEnabled });
      hud.update(delivery, progression, soundEnabled);
      hud.showToast(
        `🚚 ${ev.courierName} teslimatı tamamladı! (+${ev.earnings} ₺)`,
        3000,
      );
      sound.pickup();
    },
  });
  fleet.syncWithProgression(
    progression.couriers || [],
    progression.companyLevel,
    world.depot,
    world.homes,
    progression.unlockedDistricts,
  );

  const enginePad = createBuyPad({
    id: "upgrade-engine",
    name: "⚡ Motor Güçlendirme",
    position: { x: -62, z: -26 },
    radius: 2.8,
    targetCost: upgradeCost("engine", progression.upgrades.engine ?? 0),
    level: progression.upgrades.engine ?? 0,
    maxLevel: MAX_UPGRADE_LEVEL.engine,
    isCompleted: (progression.upgrades.engine ?? 0) >= MAX_UPGRADE_LEVEL.engine,
    getNextCost: (lvl) => upgradeCost("engine", lvl),
    onComplete(pad) {
      progression = {
        ...progression,
        upgrades: {
          ...progression.upgrades,
          engine: pad.level,
        },
      };
      storage.save({ ...progression, soundEnabled });
      hud.update(delivery, progression, soundEnabled);
      companySheet.update(progression);
      hud.showToast(`⚡ Motor Seviye ${pad.level}'e yükseltildi!`, 3500);
    },
  });

  const cargoPad = createBuyPad({
    id: "upgrade-cargo",
    name: "📦 Depo Kapasitesi",
    position: { x: -62, z: -36 },
    radius: 2.8,
    targetCost: upgradeCost("cargo", progression.upgrades.cargo ?? 0),
    level: progression.upgrades.cargo ?? 0,
    maxLevel: MAX_UPGRADE_LEVEL.cargo,
    isCompleted: (progression.upgrades.cargo ?? 0) >= MAX_UPGRADE_LEVEL.cargo,
    getNextCost: (lvl) => upgradeCost("cargo", lvl),
    onComplete(pad) {
      progression = {
        ...progression,
        upgrades: {
          ...progression.upgrades,
          cargo: pad.level,
        },
      };
      storage.save({ ...progression, soundEnabled });
      world.updateCargoRacks(pad.level);
      hud.update(delivery, progression, soundEnabled);
      companySheet.update(progression);
      hud.showToast(`📦 Kargo Kapasitesi artırıldı!`, 3500);
    },
  });

  function courierPadCost(level: number): number {
    return 280 + level * 120;
  }

  const initialCourierCount = (progression.couriers || []).length;
  const courierPad = createBuyPad({
    id: "pad_hire_courier",
    name: "👥 Kurye İstihdam Ofisi",
    position: { x: -56, z: -36 },
    radius: 2.8,
    targetCost: courierPadCost(initialCourierCount),
    level: initialCourierCount,
    maxLevel: 12,
    isCompleted: initialCourierCount >= 12,
    getNextCost: (lvl) => courierPadCost(lvl),
    onComplete(pad) {
      const candidate = generateCourierCandidate(
        progression.companyLevel,
        (progression.couriers || []).length,
      );
      progression = {
        ...progression,
        reputation: progression.reputation + 1,
        couriers: [
          ...(progression.couriers || []),
          { ...candidate, assigned: true },
        ],
      };
      storage.save({ ...progression, soundEnabled });
      fleet.syncWithProgression(
        progression.couriers || [],
        progression.companyLevel,
        world.depot,
        world.homes,
        progression.unlockedDistricts,
      );
      companySheet.update(progression);
      hud.update(delivery, progression, soundEnabled);
      hud.showToast(`🎉 YENİ KURYE İŞE ALINDI: ${candidate.name}!`, 4000);
    },
  });

  const nitroPad = createBuyPad({
    id: "pad_nitro_station",
    name: "⚡ Hızlı Nitro İstasyonu",
    position: { x: -56, z: -26 },
    radius: 2.8,
    targetCost: upgradeCost("nitro", progression.upgrades.nitro ?? 0),
    level: progression.upgrades.nitro ?? 0,
    maxLevel: MAX_UPGRADE_LEVEL.nitro,
    isCompleted: (progression.upgrades.nitro ?? 0) >= MAX_UPGRADE_LEVEL.nitro,
    getNextCost: (lvl) => upgradeCost("nitro", lvl),
    onComplete(pad) {
      progression = {
        ...progression,
        upgrades: {
          ...progression.upgrades,
          nitro: pad.level,
        },
      };
      storage.save({ ...progression, soundEnabled });
      hud.update(delivery, progression, soundEnabled);
      companySheet.update(progression);
      hud.showToast(
        `⚡ Hızlı Nitro İstasyonu Seviye ${pad.level}'e yükseltildi!`,
        3500,
      );
      const maxNitro =
        1 + pad.level * (TUNING.nitroMaxBonus ?? 0.25);
      vehicle.nitro = maxNitro;
    },
  });

  const initialScooterUnlocked = (progression.unlockedVehicles || []).includes("scooter");
  const scooterPad = createBuyPad({
    id: "pad_unlock_scooter",
    name: "🛵 Kurye Scooter'ı Aç",
    position: { x: -68, z: -32 },
    radius: 2.8,
    targetCost: 450,
    level: initialScooterUnlocked ? 1 : 0,
    maxLevel: 1,
    isCompleted: initialScooterUnlocked,
    getNextCost: () => 450,
    onComplete() {
      const unlocked = progression.unlockedVehicles || ["van"];
      if (!unlocked.includes("scooter")) {
        progression = {
          ...progression,
          unlockedVehicles: [...unlocked, "scooter"],
        };
        storage.save({ ...progression, soundEnabled });
        hud.update(delivery, progression, soundEnabled);
        companySheet.update(progression);
        hud.showToast("🛵 Kurye Scooter'ının kilidi açıldı!", 4000);
      }
    },
  });

  function handleDistrictUnlock(districtId: DistrictId) {
    const currentUnlocked = progression.unlockedDistricts || ["sunny"];
    if (!currentUnlocked.includes(districtId)) {
      progression = {
        ...progression,
        unlockedDistricts: [...currentUnlocked, districtId],
      };
      storage.save({ ...progression, soundEnabled });
    }

    // 1. İlgili bölgenin yol bariyeri çöksün/kalksın ve engeller güncellensin
    world.updateUnlockedDistricts(progression.companyLevel, progression.unlockedDistricts);

    // 2. Trafik ve yayalar anında aktifleşsin
    traffic.setCompanyLevel(progression.companyLevel, progression.unlockedDistricts);
    pedestrians.setCompanyLevel(progression.companyLevel, progression.unlockedDistricts);

    // 3. Filo teslimatları yeni evleri kapsasın
    fleet.syncWithProgression(
      progression.couriers || [],
      progression.companyLevel,
      world.depot,
      world.homes,
      progression.unlockedDistricts,
    );

    // 4. Arayüz ve minimap güncellensin
    companySheet.update(progression);
    hud.update(delivery, progression, soundEnabled);

    // 5. Toast bildirimi ve kutlama
    const dName = districtById(districtId).name;
    hud.showToast(`🎉 ${dName} AÇILDI!`, 4500);
  }

  const districtPads = createDistrictBuyPads(
    (districtId) =>
      isDistrictUnlocked(
        districtId,
        progression.companyLevel,
        progression.unlockedDistricts,
      ),
    (districtId) => {
      handleDistrictUnlock(districtId);
    },
  );

  const buyPads: BuyPad[] = [
    enginePad,
    cargoPad,
    courierPad,
    nitroPad,
    scooterPad,
    ...districtPads,
  ];
  let coinSoundTimer = 0;

  function syncPadsWithProgression() {
    const engLvl = progression.upgrades.engine ?? 0;
    if (enginePad.level !== engLvl) {
      enginePad.level = engLvl;
      enginePad.isCompleted = engLvl >= enginePad.maxLevel;
      if (!enginePad.isCompleted) {
        enginePad.targetCost = upgradeCost("engine", engLvl);
        enginePad.currentAmount = 0;
      }
    }
    const cargoLvl = progression.upgrades.cargo ?? 0;
    if (cargoPad.level !== cargoLvl) {
      cargoPad.level = cargoLvl;
      cargoPad.isCompleted = cargoLvl >= cargoPad.maxLevel;
      if (!cargoPad.isCompleted) {
        cargoPad.targetCost = upgradeCost("cargo", cargoLvl);
        cargoPad.currentAmount = 0;
      }
    }
    const courierCount = (progression.couriers || []).length;
    if (courierPad.level !== courierCount) {
      courierPad.level = courierCount;
      courierPad.isCompleted = courierCount >= courierPad.maxLevel;
      if (!courierPad.isCompleted) {
        courierPad.targetCost = courierPadCost(courierCount);
        courierPad.currentAmount = 0;
      }
    }
    const nitroLvl = progression.upgrades.nitro ?? 0;
    if (nitroPad.level !== nitroLvl) {
      nitroPad.level = nitroLvl;
      nitroPad.isCompleted = nitroLvl >= nitroPad.maxLevel;
      if (!nitroPad.isCompleted) {
        nitroPad.targetCost = upgradeCost("nitro", nitroLvl);
        nitroPad.currentAmount = 0;
      }
    }
    const scooterUnlocked = (progression.unlockedVehicles || []).includes("scooter");
    const scooterLvl = scooterUnlocked ? 1 : 0;
    if (scooterPad.level !== scooterLvl) {
      scooterPad.level = scooterLvl;
      scooterPad.isCompleted = scooterUnlocked;
      if (!scooterPad.isCompleted) {
        scooterPad.targetCost = 450;
        scooterPad.currentAmount = 0;
      }
    }

    // Bölge açma pedlerini senkronize et
    for (const pad of districtPads) {
      const def = DISTRICT_BUY_PAD_DEFS.find((d) => d.id === pad.id);
      if (!def) continue;
      const isUnlocked = isDistrictUnlocked(
        def.districtId,
        progression.companyLevel,
        progression.unlockedDistricts,
      );
      if (isUnlocked && !pad.isCompleted) {
        pad.level = 1;
        pad.isCompleted = true;
        pad.currentAmount = pad.targetCost;
      }
    }
  }
  resetCamera(vehicle.position, vehicle.heading);
  updateCamera(camera, vehicle, 1);
  const ui = document.createElement("div");
  ui.className = "ui";
  app.append(ui);
  const hud = createHud(ui, {
    restart() {
      void sound.unlock();
      started = true;
      vehicle = resetVehicle(world.depot, (progression.currentVehicle as VehicleType) ?? "van");
      resetCamera(vehicle.position, vehicle.heading);
      skidmarks.reset();
      particles.reset();
      props.reset();
      delivery = createDeliveryState(
        progression.upgrades.cargo,
        progression.companyLevel,
        selectedDistrict,
        progression.completedDeliveries,
        null,
        progression.unlockedDistricts,
      );
      cameraShake = 0;
      contactDamage.reset();
      input.reset();
      hud.hideResult();
      companySheet.hide();
    },
    recover() {
      vehicle = resetVehicle(world.depot, (progression.currentVehicle as VehicleType) ?? "van");
      resetCamera(vehicle.position, vehicle.heading);
      skidmarks.reset();
      particles.reset();
      props.reset();
      delivery = { ...delivery, holdSeconds: 0 };
      cameraShake = 0;
      contactDamage.reset();
      input.reset();
    },
    toggleSound() {
      soundEnabled = !soundEnabled;
      sound.setEnabled(soundEnabled);
      void sound.unlock();
      storage.save({ ...progression, soundEnabled });
      hud.update(delivery, progression, soundEnabled);
    },
    buyUpgrade(kind: UpgradeKind) {
      const purchased = tryPurchaseUpgrade(progression, kind);
      if (purchased === progression) return;
      progression = purchased;
      storage.save({ ...progression, soundEnabled });
      if (kind === "cargo") {
        world.updateCargoRacks(progression.upgrades.cargo ?? 0);
      }
      hud.update(delivery, progression, soundEnabled);
      companySheet.update(progression);
    },
    setHandbrake(on: boolean) {
      input.setHandbrake(on);
    },
    setNitro(on: boolean) {
      input.setNitro(on);
    },
    openCompanySheet() {
      if (companySheet.isVisible()) {
        companySheet.hide();
        return;
      }
      companySheet.show();
      companySheet.update(progression);
      hud.hideResult();
    },
    honk() {
      sound.carHorn();
      urbanFauna.onHonk(vehicle.position);
      world.busStops.onHonk(vehicle.position);
      world.gasStation.onPlayerHonk(vehicle.position);
      triggerRoadWorkHonk(roadWorkState, vehicle.position);
      triggerSeasideHonk(seasideLifeState, vehicle.position, sound, particles);
      triggerFerrisWheelHonk(ferrisWheelState, vehicle.position);
      triggerTramHonk(tramState, vehicle.position);
      triggerTrainHonk(trainState, vehicle.position);
      triggerGardenerHonk(communityParkState, vehicle.position);
      world.communityPark.onPlayerHonk(vehicle.position);
      triggerChefTemelHonk(fishingHarbourState, vehicle.position);
      world.fishingHarbour.onPlayerHonk(vehicle.position);
      triggerMechanicHonk(autoRepairState, vehicle.position);
      world.autoRepair.onPlayerHonk(vehicle.position);
      triggerGrocerHonk(groceryStoreState, vehicle.position);
      world.groceryStore.onPlayerHonk(vehicle.position);
      triggerCoffeeHouseHonk(coffeeHouseState, vehicle.position);
      world.coffeeHouse.onPlayerHonk(vehicle.position);
      triggerIceCreamStandHonk(iceCreamStandState, vehicle.position);
      world.iceCreamStand.onPlayerHonk(vehicle.position);
      triggerRestaurantHonk(restaurantState, vehicle.position);
      world.restaurant.onPlayerHonk(vehicle.position);
      triggerSchoolHonk(schoolState, vehicle.position);
      world.school.onPlayerHonk(vehicle.position);
      triggerBakeryHonk(bakeryState, vehicle.position);
      world.bakery.onPlayerHonk(vehicle.position);
      triggerLighthouseHonk(lighthouseState, vehicle.position);
      world.lighthouse.onPlayerHonk(vehicle.position);
      triggerMarketHonk(marketState, vehicle.position);
      world.market.onPlayerHonk(vehicle.position);
      triggerCarpenterHonk(carpenterState, vehicle.position);
      world.carpenter.onPlayerHonk(vehicle.position);
      triggerCoppersmithHonk(coppersmithState, vehicle.position);
      world.coppersmith.onPlayerHonk(vehicle.position);
      triggerCinemaHonk(cinemaState, vehicle.position);
      world.cinema.onPlayerHonk(vehicle.position);
      triggerPostOfficeHonk(postOfficeState, vehicle.position);
      world.postOffice.onPlayerHonk(vehicle.position);
      triggerFoundryHonk(foundryState, vehicle.position);
      world.foundry.onPlayerHonk(vehicle.position);
      triggerTurkishCoffeeHonk(turkishCoffeeState, vehicle.position);
      world.turkishCoffee.onPlayerHonk(vehicle.position);
      triggerLifesavingHonk(lifesavingState, vehicle.position);
      world.lifesaving.onPlayerHonk(vehicle.position);
      triggerHealthClinicHonk(healthClinicState, vehicle.position);
      world.healthClinic.onPlayerHonk(vehicle.position);
      triggerLatheWorkshopHonk(latheWorkshopState, vehicle.position);
      world.latheWorkshop.onPlayerHonk(vehicle.position);
      if (traffic.onPlayerHonk(vehicle.position)) {
        sound.courierBeep();
      }
    },
    toggleRadio() {
      cycleRadio();
    },
  });

  function cycleRadio() {
    void sound.unlock();
    const nextStation = sound.cycleRadioStation();
    const info = sound.getRadioStationInfo(nextStation);
    const active = nextStation !== "off";
    hud.setRadio(active ? `📻 ${info.shortName}` : "RADYO: KAPALI", active);
    hud.showToast(
      active
        ? `${info.emoji} Radyo: ${info.name} (${info.genre})`
        : "📻 Radyo kapatıldı",
      2400,
    );
  }

  const companySheet = createCompanySheet(ui, {
    onSelectDistrict(id) {
      selectedDistrict = id;
      sound.pickup();
    },
    onSelectLivery(liveryId) {
      progression = { ...progression, currentLivery: liveryId };
      storage.save({ ...progression, soundEnabled });
      car.setLivery(liveryId);
      sound.pickup();
      hud.showToast(`🎨 Kaplama uygulandı: ${getLiveryById(liveryId).name}`, 2500);
    },
    onStartShift() {
      companySheet.hide();
      void sound.unlock();
      if (!started) {
        started = true;
        vehicle = resetVehicle(world.depot, (progression.currentVehicle as VehicleType) ?? "van");
        resetCamera(vehicle.position, vehicle.heading);
        skidmarks.reset();
        particles.reset();
        props.reset();
        delivery = createDeliveryState(
          progression.upgrades.cargo,
          progression.companyLevel,
          selectedDistrict,
          progression.completedDeliveries,
          null,
          progression.unlockedDistricts,
        );
        cameraShake = 0;
        contactDamage.reset();
      }
      input.reset();
      hud.hideResult();
    },
    onBuyUpgrade(kind) {
      const purchased = tryPurchaseUpgrade(progression, kind);
      if (purchased === progression) return;
      progression = purchased;
      storage.save({ ...progression, soundEnabled });
      if (kind === "cargo") {
        world.updateCargoRacks(progression.upgrades.cargo ?? 0);
      }
      companySheet.update(progression);
      hud.update(delivery, progression, soundEnabled);
      sound.pickup();
    },
    onHireCourier(candidate) {
      progression = hireCourier(progression, candidate);
      storage.save({ ...progression, soundEnabled });
      fleet.syncWithProgression(
        progression.couriers || [],
        progression.companyLevel,
        world.depot,
        world.homes,
        progression.unlockedDistricts,
      );
      companySheet.update(progression);
      hud.showToast("🎉 Yeni kurye işe alındı!", 3000);
      sound.delivery();
    },
    onClaimOffline() {
      const amount = progression.offlineEarningsAccumulated;
      progression = claimOfflineEarnings(progression);
      storage.save({ ...progression, soundEnabled });
      companySheet.update(progression);
      hud.showToast(`💰 Kasaya +${amount} ₺ aktarıldı!`, 3000);
      sound.pickup();
    },
  });
  const input = createInput(document.querySelector<HTMLElement>("#joystick")!);
  const minimap = createMinimap(ui, {
    depot: world.depot,
    homes: world.homes,
    bounds: world.bounds,
  });
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  const pause = document.createElement("div");
  pause.className = "pause-overlay";
  pause.textContent = "Kısa bir mola · oyun duraklatıldı";
  pause.hidden = true;
  app.append(pause);
  let currentThrottle = 0;
  let currentNitro = false;
  let swapCooldown = 0;
  let parkStopTimer = 0;
  let jumpAirborneTimer = 0;
  let jumpPeakAltitude = 0;

  const loop = createLoop(
    (dt) => {
      // Dinamik Gökyüzü, Atmosfer (Sabah/Öğle/Gün Batımı/Alacakaranlık), Hava Durumu ve Şehir Animasyonları
      const atmoState = atmosphere.update(dt, vehicle.position);
      const weatherState = weather.update(dt, vehicle.position);

      // Fırtına Şimşek Parlaması & Gök Gürültüsü Sentezi (T40)
      if (weatherState.lightningFlash > 0.01) {
        sun.intensity += weatherState.lightningFlash * 4.2;
        hemi.intensity += weatherState.lightningFlash * 2.8;
      }
      if (weatherState.lightningTriggered) {
        sound.thunderRoll(1.0);
      }

      world.update(
        dt,
        atmoState.isNightOrDusk,
        delivery.targetIndex,
        delivery.phase === "delivering",
        vehicle.position,
      );
      hud.setTime(atmoState.phaseIcon, atmoState.phaseName);
      hud.setWeather(weatherState.weatherIcon, weatherState.weatherName);
      sound.setDistrict(lastDistrict);
      sound.setRainIntensity(weatherState.rainIntensity);
      sound.updateAmbience(dt);
      clouds.update(dt);

      if (swapCooldown > 0) {
        swapCooldown -= dt;
      }
      const scooterUnlocked = (progression.unlockedVehicles || []).includes("scooter");
      parkedVehicle.update(
        dt,
        (progression.currentVehicle as VehicleType) ?? "van",
        scooterUnlocked,
      );

      if (started) {
        const wasAirborne = vehicle.airborne;
        const previous = vehicle.position;
        const drive = input.read(
          vehicle.heading,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
          dt,
        );
        currentThrottle = drive.throttle;
        currentNitro = drive.nitro;
        vehicle = stepVehicle(vehicle, drive, dt, progression.upgrades);

        // Atlama rampaları kontrolü
        const rampLaunch = checkRampLaunch(vehicle, RAMPS);
        if (rampLaunch && !vehicle.airborne) {
          vehicle.verticalVelocity = Math.max(
            vehicle.verticalVelocity,
            rampLaunch.verticalVelocity,
          );
          vehicle.altitude = Math.max(vehicle.altitude, 0.15);
          vehicle.airborne = true;
          jumpAirborneTimer = 0;
          jumpPeakAltitude = 0.15;
          sound.jumpLaunch();
        }

        if (vehicle.airborne) {
          jumpAirborneTimer += dt;
          jumpPeakAltitude = Math.max(jumpPeakAltitude, vehicle.altitude);
        } else if (wasAirborne && !vehicle.airborne) {
          // Araç yere indi: süspansiyon darbesi, iniş tozu ve kamera etkisi
          const landingSpeed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);
          const landingImpact = Math.min(2.0, 0.8 + jumpPeakAltitude * 0.35);
          sound.jumpLanding(landingImpact);
          particles.spawnLandingDust(vehicle.position, landingSpeed);
          cameraShake = Math.max(cameraShake, 0.35 + jumpPeakAltitude * 0.1);

          // Havada kalış ödülü (Stunt Jump Airtime Bonus)
          if (jumpAirborneTimer >= 0.32) {
            const stuntReward = 15;
            progression = {
              ...progression,
              money: progression.money + stuntReward,
            };
            storage.save({ ...progression, soundEnabled });
            companySheet.update(progression);
            sound.playMoneyDrain();
            hud.showToast(`🚀 HAVALI ATLAYIŞ! +${stuntReward}₺`, 2000);
          }
          jumpAirborneTimer = 0;
          jumpPeakAltitude = 0;
        }

        const proposed = vehicle.position;
        const preVelocity = { ...vehicle.velocity };
        const collision = resolveCollision(
          previous,
          proposed,
          world.obstacles,
          world.bounds,
          {
            heading: vehicle.heading,
            velocity: preVelocity,
            altitude: vehicle.altitude,
          },
        );
        const staticContacts = staticCollisionContacts(
          proposed,
          collision.position,
          preVelocity,
          world.obstacles,
          world.bounds,
          0.65,
          vehicle.heading,
        );
        vehicle.position = collision.position;
        vehicle.velocity = collision.velocity;

        // Yağmur su birikintileri ve su sıçratma simülasyonu (T32)
        const currentSpeed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);
        const splashEvent = puddles.update(
          dt,
          vehicle.position,
          currentSpeed,
          vehicle.heading,
          weatherState.wetness,
        );
        if (splashEvent.splashed) {
          sound.puddleSplash(splashEvent.speed);
          particles.spawnPuddleSplash(vehicle.position, splashEvent.speed, vehicle.heading);
          if (splashEvent.hydroplaning && !(lifesavingState.buffTimer > 0)) {
            vehicle.velocity.x *= 0.96;
            vehicle.velocity.z *= 0.96;
            cameraShake = Math.max(cameraShake, 0.18);
          }
        }

        // Yıkılabilir / fırlayan nesneler (Props) çarpışma ve fizik simülasyonu
        props.update(dt, vehicle);
        const old = delivery;
        const trafficContacts = traffic.update(dt, vehicle.position);
        const pedestrianContacts = pedestrians.update(
          dt,
          vehicle.position,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
          weatherState.rainIntensity,
        );
        urbanFauna.update(
          dt,
          vehicle.position,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
        );
        const envResult = environmentalFX.update(
          dt,
          vehicle.position,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
          atmoState.isNightOrDusk,
        );
        if (envResult.leafPileTriggered) {
          progression = {
            ...progression,
            money: progression.money + envResult.bonusReward,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          if (envResult.bonusMessage) {
            hud.showToast(envResult.bonusMessage, 2200);
          }
        }
        if (input.consumeHorn()) {
          sound.carHorn();
          urbanFauna.onHonk(vehicle.position);
          world.busStops.onHonk(vehicle.position);
          streetVendorsView.onPlayerHonk();
          world.gasStation.onPlayerHonk(vehicle.position);
          triggerRoadWorkHonk(roadWorkState, vehicle.position);
          triggerSeasideHonk(seasideLifeState, vehicle.position, sound, particles);
          triggerFerrisWheelHonk(ferrisWheelState, vehicle.position);
      triggerTramHonk(tramState, vehicle.position);
      triggerTrainHonk(trainState, vehicle.position);
      triggerGardenerHonk(communityParkState, vehicle.position);
      world.communityPark.onPlayerHonk(vehicle.position);
      triggerChefTemelHonk(fishingHarbourState, vehicle.position);
      world.fishingHarbour.onPlayerHonk(vehicle.position);
      triggerMechanicHonk(autoRepairState, vehicle.position);
      world.autoRepair.onPlayerHonk(vehicle.position);
      triggerGrocerHonk(groceryStoreState, vehicle.position);
      world.groceryStore.onPlayerHonk(vehicle.position);
      triggerCoffeeHouseHonk(coffeeHouseState, vehicle.position);
      world.coffeeHouse.onPlayerHonk(vehicle.position);
      triggerIceCreamStandHonk(iceCreamStandState, vehicle.position);
      world.iceCreamStand.onPlayerHonk(vehicle.position);
      triggerRestaurantHonk(restaurantState, vehicle.position);
      world.restaurant.onPlayerHonk(vehicle.position);
      triggerSchoolHonk(schoolState, vehicle.position);
      world.school.onPlayerHonk(vehicle.position);
      triggerBakeryHonk(bakeryState, vehicle.position);
      world.bakery.onPlayerHonk(vehicle.position);
      triggerLighthouseHonk(lighthouseState, vehicle.position);
      world.lighthouse.onPlayerHonk(vehicle.position);
      triggerMarketHonk(marketState, vehicle.position);
      world.market.onPlayerHonk(vehicle.position);
      triggerCarpenterHonk(carpenterState, vehicle.position);
      world.carpenter.onPlayerHonk(vehicle.position);
      triggerCoppersmithHonk(coppersmithState, vehicle.position);
      world.coppersmith.onPlayerHonk(vehicle.position);
      triggerCinemaHonk(cinemaState, vehicle.position);
      world.cinema.onPlayerHonk(vehicle.position);
      triggerPostOfficeHonk(postOfficeState, vehicle.position);
      world.postOffice.onPlayerHonk(vehicle.position);
      triggerFoundryHonk(foundryState, vehicle.position);
      world.foundry.onPlayerHonk(vehicle.position);
      triggerTurkishCoffeeHonk(turkishCoffeeState, vehicle.position);
      world.turkishCoffee.onPlayerHonk(vehicle.position);
      triggerLifesavingHonk(lifesavingState, vehicle.position);
      world.lifesaving.onPlayerHonk(vehicle.position);
      triggerHealthClinicHonk(healthClinicState, vehicle.position);
      world.healthClinic.onPlayerHonk(vehicle.position);
      triggerLatheWorkshopHonk(latheWorkshopState, vehicle.position);
      world.latheWorkshop.onPlayerHonk(vehicle.position);
          if (traffic.onPlayerHonk(vehicle.position)) {
            sound.courierBeep();
          }
        }
        if (input.consumeRadio?.()) {
          cycleRadio();
        }

        // Hızlı Şarj (EV Quick-Charger) & Süper Pitstop Simülasyonu (T34)
        const pitstopRes = stepPitstop(
          pitstopState,
          vehicle.position,
          currentSpeed,
          dt,
        );
        pitstopState = pitstopRes.state;
        if (pitstopRes.event === "charging") {
          sound.chargerHum(pitstopState.chargeProgress);
          particles.spawnElectricSparks(vehicle.position, 2);
        } else if (pitstopRes.event === "charge_completed") {
          sound.chargeComplete();
          particles.spawnElectricSparks(vehicle.position, 28);
          const maxNitro = (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) * 1.25;
          vehicle.nitro = maxNitro;
          hud.showToast("⚡ HIZLI ŞARJ TAMAMLANDI! SÜPER NİTRO AKTİF (+%25 HIZ & KAPASİTE)", 4000);
        }
        vehicle.supercharged = pitstopState.isSupercharged;
        pitstopView.update(dt, pitstopState, vehicle.position);
        hud.setSupercharge(pitstopState.isSupercharged, pitstopState.superchargeTimer);

        // Geleneksel Seyyar Sokak Satıcıları (Simitçi & Kestaneci) Simülasyonu (T35)
        const vendorRes = stepStreetVendors(
          streetVendorsState,
          vehicle.position,
          currentSpeed,
          progression.money,
          dt,
        );
        streetVendorsState = vendorRes.state;
        if (vendorRes.event && vendorRes.event.type === "snack_purchased") {
          const v = vendorRes.event.vendor;
          progression = {
            ...progression,
            money: Math.max(0, progression.money - v.cost),
            reputation: progression.reputation + v.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          sound.streetSnack();
          particles.spawnConfetti(vehicle.position);
          const maxNitro = 1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          const toastMsg = v.id === "simit_carsi"
            ? "🥨 ÇITIR SİMİT ALINDI! (+1 İtibar & Enerji Dopingi)"
            : "🌰 SICAK KESTANE ALINDI! (+1 İtibar & Enerji Dopingi)";
          hud.showToast(toastMsg, 3500);
        }
        streetVendorsView.update(dt, streetVendorsState, vehicle.position);
        hud.setSnackBuff(streetVendorsState.energyBuffTimer > 0, streetVendorsState.energyBuffTimer);

        // Sokak Hayvanlarını Besleme & Sevme Etkileşimi (T37)
        if (streetVendorsState.availableTreats > 0 && currentSpeed < 1.4) {
          const feedProx = urbanFauna.checkFeedingProximity(
            vehicle.position,
            currentSpeed,
            true,
          );
          if (feedProx) {
            feedHoldTimer += dt;
            if (feedHoldTimer >= 0.7) {
              feedHoldTimer = 0;
              streetVendorsState = consumeFaunaTreat(streetVendorsState);
              const feedRes = urbanFauna.feedAnimal(feedProx.animalType, vehicle.position);
              particles.spawnHeartParticles(feedProx.position, 14);
              if (feedRes.repBonus > 0 || feedRes.cashBonus > 0) {
                progression = {
                  ...progression,
                  reputation: progression.reputation + feedRes.repBonus,
                  money: progression.money + feedRes.cashBonus,
                };
                storage.save({ ...progression, soundEnabled });
                companySheet.update(progression);
                hud.update(delivery, progression, soundEnabled);
              }
              hud.showToast(feedRes.message, 3500);
            }
          } else {
            feedHoldTimer = 0;
          }
        } else {
          feedHoldTimer = 0;
        }

        // Akaryakıt İstasyonu & Otomatik Oto Yıkama Tüneli Simülasyonu (T36)
        const gasRes = stepGasStation(
          gasStationState,
          vehicle.position,
          currentSpeed,
          dt,
        );
        gasStationState = gasRes.state;
        if (gasRes.event) {
          if (gasRes.event.type === "fuel_completed") {
            sound.fuelPump();
            const maxNitro = (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) * (vehicle.supercharged ? 1.25 : 1.0);
            vehicle.nitro = maxNitro;
            contactDamage.reset();
            progression = {
              ...progression,
              reputation: progression.reputation + gasRes.event.repBonus,
            };
            storage.save({ ...progression, soundEnabled });
            companySheet.update(progression);
            hud.update(delivery, progression, soundEnabled);
            hud.showToast("⛽ DEPO FULLEDİ & ARAÇ BAKIMI TAMAMLANDI! (+1 İtibar)", 3500);
          } else if (gasRes.event.type === "wash_started") {
            sound.carWash();
            particles.spawnWashSpray(vehicle.position, 22);
          } else if (gasRes.event.type === "wash_active") {
            particles.spawnWashSpray(vehicle.position, 6);
          } else if (gasRes.event.type === "wash_completed") {
            progression = {
              ...progression,
              money: progression.money + gasRes.event.cashBonus,
            };
            storage.save({ ...progression, soundEnabled });
            companySheet.update(progression);
            hud.update(delivery, progression, soundEnabled);
            particles.spawnConfetti(vehicle.position);
            hud.showToast("✨ PIRIL PIRIL OTO YIKAMA! +10 ₺ Bahşiş Bonusu", 3500);
          }
        }
        if (gasStationState.isClean) {
          carShineTimer += dt;
          if (carShineTimer >= 0.35) {
            carShineTimer = 0;
            particles.spawnCarShine(vehicle.position, 1);
          }
        }
        world.gasStation.update(
          dt,
          gasStationState,
          vehicle.position,
          atmoState.isNightOrDusk,
        );
        hud.setCleanBuff(gasStationState.isClean, gasStationState.cleanBuffTimer);

        // Dinamik Yol Bakım Şantiyesi Simülasyonu (T38)
        const rwRes = updateRoadWork(
          roadWorkState,
          vehicle.position,
          currentSpeed,
          dt,
          sound,
          particles,
        );
        if (rwRes.safePassAwarded) {
          progression = {
            ...progression,
            money: progression.money + rwRes.rewardMoney,
            reputation: progression.reputation + rwRes.rewardReputation,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          if (rwRes.toastMessage) hud.showToast(rwRes.toastMessage, 3200);
        }
        world.roadWork.update(
          dt,
          roadWorkState.flasherActive,
          roadWorkState.speechText,
          atmoState.isNightOrDusk,
        );

        // Sahil Çay Bahçesi & İskele Balıkçıları Simülasyonu (T39)
        const slRes = updateSeasideLife(
          seasideLifeState,
          vehicle.position,
          currentSpeed,
          dt,
          sound,
          particles,
        );
        if (slRes.teaServed) {
          progression = {
            ...progression,
            reputation: progression.reputation + slRes.rewardReputation,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          if (slRes.toastMessage) hud.showToast(slRes.toastMessage, 3200);
        }
        hud.setTeaBuff(seasideLifeState.teaBuffTimer > 0, seasideLifeState.teaBuffTimer);
        world.seasideLife.update(
          dt,
          seasideLifeState.speechText,
          seasideLifeState.fisherSpeechText,
          atmoState.isNightOrDusk,
        );

        // Büyük Sahil Dönme Dolabı & Lunapark İskelesi Simülasyonu (T41)
        const fwRes = updateFerrisWheel(
          ferrisWheelState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (fwRes.awardedJoyBonus) {
          progression = {
            ...progression,
            money: progression.money + fwRes.cashBonus,
            reputation: progression.reputation + fwRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          sound.carnivalChime();
          particles.spawnConfetti(vehicle.position);
          hud.showToast("🎡 SAHİL NEŞESİ! +15 ₺ (+1 İtibar)", 3200);
        }
        world.ferrisWheel.update(
          dt,
          ferrisWheelState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Tarihi Çarşı Tramvay Hattı & Nostaljik Tramvay Simülasyonu (T42)
        const tramRes = updateTram(
          tramState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (tramRes.bellRung) {
          sound.tramBell();
        }
        if (tramRes.sparkFired) {
          particles.spawnImpactSparks({ x: tramState.position.x, z: tramState.position.z });
        }
        if (tramRes.awardedHeritageBonus) {
          progression = {
            ...progression,
            money: progression.money + tramRes.cashBonus,
            reputation: progression.reputation + tramRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          hud.showToast("🚋 NOSTALJİK HAT HATIRASI! +10 ₺ (+1 İtibar)", 3000);
        }
        world.tram.update(
          dt,
          tramState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sanayi Demiryolu Manevra Hattı & Lokomotif Simülasyonu (T43)
        const trainRes = updateTrain(
          trainState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (trainRes.hornBlown) {
          sound.trainHorn();
        }
        if (trainRes.crossingBellRung) {
          sound.railCrossing();
        }
        if (trainRes.smokePuffed) {
          particles.spawnLandingDust({ x: trainState.position.x, z: trainState.position.z }, 3);
        }
        if (trainRes.awardedLogisticsBonus) {
          progression = {
            ...progression,
            money: progression.money + trainRes.cashBonus,
            reputation: progression.reputation + trainRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          hud.showToast("🚂 SANAYİ DEMİRYOLU LOJİSTİK! +15 ₺ (+1 İtibar)", 3000);
        }
        world.train.update(
          dt,
          trainState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Güneş Mahallesi Çocuk Parkı, Kamelya & Bahçıvan Selahattin Simülasyonu (T44)
        const parkRes = updateCommunityPark(
          communityParkState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (parkRes.windChimePlayed) {
          sound.windChime();
        }
        if (parkRes.awardedPeaceBonus) {
          progression = {
            ...progression,
            money: progression.money + parkRes.cashBonus,
            reputation: progression.reputation + parkRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          hud.showToast("🌳 MAHALLE HUZURU! +10 ₺ (+1 İtibar, 20s Huzur)", 3000);
        }
        world.communityPark.update(
          dt,
          communityParkState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sahil Marina Balıkçı Barınağı & Taze Balık-Ekmek Teknesi Simülasyonu (T45)
        const harbourRes = updateFishingHarbour(
          fishingHarbourState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (harbourRes.sizzlePlayed) {
          sound.fishSizzle();
        }
        if (harbourRes.awardedFeastBonus) {
          progression = {
            ...progression,
            money: progression.money + harbourRes.cashBonus,
            reputation: progression.reputation + harbourRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          hud.showToast("🐟 BALIK-EKMEK ZİYAFETİ! +15 ₺ (+1 İtibar, 20s Derya Kuzusu Gücü)", 3000);
        }
        world.fishingHarbour.update(
          dt,
          fishingHarbourState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sanayi "Usta Eller Oto Sanayi" Tamirhanesi & Araç Bakım Lifti Simülasyonu (T46)
        const autoRepairRes = updateAutoRepair(
          autoRepairState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (autoRepairRes.wrenchPlayed) {
          sound.wrenchClick();
        }
        if (autoRepairRes.awardedRepairBonus) {
          sound.wrenchClick(1.0);
          delivery = {
            ...delivery,
            packageDamage: 0,
            vehicleDamage: 0,
          };
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = maxNitro;
          contactDamage.reset();
          progression = {
            ...progression,
            money: progression.money + autoRepairRes.cashBonus,
            reputation: progression.reputation + autoRepairRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnImpactSparks(vehicle.position);
          hud.showToast("🔧 SANAYİ BAKIMI TAMAMLANDI! +10 ₺ (+1 İtibar, Kargo Tamiri & Nitro Full)", 3500);
        }
        world.autoRepair.update(
          dt,
          autoRepairState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Güneş Mahallesi "Bizim Bakkal" Mahalle Bakkaliyesi & Ekmek/Gazete Tezgahı (T47)
        const groceryRes = updateGroceryStore(
          groceryStoreState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (groceryRes.bellPlayed) {
          sound.shopBell();
        }
        if (groceryRes.awardedBakkalBonus) {
          sound.shopBell(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + groceryRes.cashBonus,
            reputation: progression.reputation + groceryRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(GROCER_HUSNU_POS, vehicle.position);
          hud.showToast("🏪 BAKKAL MOLASI! +10 ₺ (+1 İtibar, Buz Gibi Gazoz Enerjisi & Nitro)", 3500);
        }
        world.groceryStore.update(
          dt,
          groceryStoreState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (T48)
        const coffeeRes = updateCoffeeHouse(
          coffeeHouseState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (coffeeRes.dicePlayed) {
          sound.diceRoll();
        }
        if (coffeeRes.awardedCoffeeBonus) {
          sound.diceRoll(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + coffeeRes.cashBonus,
            reputation: progression.reputation + coffeeRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(COFFEE_MASTER_BEKIR_POS, vehicle.position);
          hud.showToast("☕ ESNAF KAHVESİ MOLASI! +10 ₺ (+1 İtibar, Közde Kahve Zindeliği & Nitro)", 3500);
        }
        world.coffeeHouse.update(
          dt,
          coffeeHouseState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sahil "Kordon Boyu Hakiki Maraş Dondurmacısı" & Plaj Voleybolu / Güneşlenme Terası (T49)
        const iceCreamRes = updateIceCreamStand(
          iceCreamStandState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (iceCreamRes.bellRung) {
          sound.iceCreamBell();
        }
        if (iceCreamRes.awardedIceCreamBonus) {
          sound.iceCreamBell(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + iceCreamRes.cashBonus,
            reputation: progression.reputation + iceCreamRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(ICE_CREAM_MASTER_ALI_POS, vehicle.position);
          hud.showToast("🍦 BUZ GİBİ MARAŞ DONDURMASI! +10 ₺ (+1 İtibar, Dövme Dondurma Serinliği & Nitro)", 3500);
        }
        world.iceCreamStand.update(
          dt,
          iceCreamStandState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (T50)
        const restaurantRes = updateRestaurant(
          restaurantState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (restaurantRes.ladleSoundTriggered) {
          sound.soupLadle();
        }
        if (restaurantRes.awardedMealBonus) {
          sound.soupLadle(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + restaurantRes.cashBonus,
            reputation: progression.reputation + restaurantRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(CHEF_HAKKI_POS, vehicle.position);
          hud.showToast("🍲 SANAYİ TABLDOT MENÜSÜ! +10 ₺ (+1 İtibar, Esnaf Gücü & Nitro)", 3500);
        }
        world.restaurant.update(
          dt,
          restaurantState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu" (T51)
        const schoolRes = updateSchool(
          schoolState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (schoolRes.bellSoundTriggered) {
          sound.schoolBell();
        }
        if (schoolRes.awardedCourtesyBonus) {
          sound.schoolBell(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + schoolRes.cashBonus,
            reputation: progression.reputation + schoolRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(HASAN_DAYI_POS, vehicle.position);
          hud.showToast("🏫 OKUL YOLU SAYGISI! +10 ₺ (+1 İtibar, Nezaket & Nitro)", 3500);
        }
        world.school.update(
          dt,
          schoolState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi" (T52)
        const bakeryRes = updateBakery(
          bakeryState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (bakeryRes.ovenSoundTriggered) {
          sound.woodOven();
        }
        if (bakeryRes.awardedSimitBonus) {
          sound.woodOven(1.0);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + bakeryRes.cashBonus,
            reputation: progression.reputation + bakeryRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(SABAN_USTA_POS, vehicle.position);
          hud.showToast("🥖 SICAK SİMİT ÇITIRI! +10 ₺ (+1 İtibar, Odun Ateşi & Nitro)", 3500);
        }
        world.bakery.update(
          dt,
          bakeryState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sahil "Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı" (T53)
        const lighthouseRes = updateLighthouse(
          lighthouseState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (lighthouseRes.fogHornTriggered) {
          sound.fogHorn();
        }
        if (lighthouseRes.awardedGuidanceBonus) {
          sound.fogHorn(1.1);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + lighthouseRes.cashBonus,
            reputation: progression.reputation + lighthouseRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(RIZA_KAPTAN_POS, vehicle.position);
          hud.showToast("🏮 FENER REHBERLİĞİ! +10 ₺ (+1 İtibar, Gece Görüşü & Nitro)", 3500);
        }
        world.lighthouse.update(
          dt,
          lighthouseState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Güneş Mahallesi "Geleneksel Mahalle Semt Pazarı & Taze Manav Tezgahları" (T54)
        const marketRes = updateMarket(
          marketState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (marketRes.scaleSoundTriggered) {
          sound.marketScale();
        }
        if (marketRes.awardedMarketBonus) {
          sound.marketScale(1.1);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + marketRes.cashBonus,
            reputation: progression.reputation + marketRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(CEMIL_DAYI_POS, vehicle.position);
          hud.showToast("🍉 TAZE PAZAR BEREKETİ! +10 ₺ (+1 İtibar, Canlılık & Nitro)", 3500);
        }
        world.market.update(
          dt,
          marketState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sanayi "Tarihi Marangozlar Sitesi & Ahşap Kereste Atölyesi" (T55)
        const carpenterRes = updateCarpenter(
          carpenterState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (carpenterRes.sawSoundTriggered) {
          sound.buzzSaw();
        }
        if (carpenterRes.awardedCarpenterBonus) {
          sound.buzzSaw(1.1);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + carpenterRes.cashBonus,
            reputation: progression.reputation + carpenterRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(RUSTEM_USTA_POS, vehicle.position);
          hud.showToast("🪵 SANAYİ İŞÇİLİĞİ GÜCÜ! +10 ₺ (+1 İtibar, Gövde Takviyesi & Nitro)", 3500);
        }
        world.carpenter.update(
          dt,
          carpenterState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Çarşı "Tarihi Bakırcılar Çarşısı & Antik Kapalı Bedesten" (T56)
        const coppersmithRes = updateCoppersmith(
          coppersmithState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (coppersmithRes.hammerSoundTriggered) {
          sound.coppersmith();
        }
        if (coppersmithRes.awardedCoppersmithBonus) {
          sound.coppersmith(1.1);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + coppersmithRes.cashBonus,
            reputation: progression.reputation + coppersmithRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(KAZIM_USTA_POS, vehicle.position);
          hud.showToast("🏺 USTA ESNAF HÜRMETİ! +10 ₺ (+1 İtibar, Bahşiş Bereketi & Nitro)", 3500);
        }
        world.coppersmith.update(
          dt,
          coppersmithState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        // Sahil "Açık Hava Yazlık Sineması & Sahil Gazinosu" (T57)
        const cinemaRes = updateCinema(
          cinemaState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (cinemaRes.projectorSoundTriggered) {
          sound.filmProjector();
        }
        if (cinemaRes.awardedCinemaBonus) {
          sound.filmProjector(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + cinemaRes.cashBonus,
            reputation: progression.reputation + cinemaRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(RIFAT_POS, vehicle.position);
          hud.showToast("🎬 YAZLIK SİNEMA KEYFİ! +10 ₺ (+1 İtibar, Açık Hava Sineması & Nitro)", 3500);
        }
        world.cinema.update(
          dt,
          cinemaState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Güneş Mahallesi "Tarihi Mahalle Postanesi & Kargo Dağıtım Şubesi (PTT)" (T58)
        const postOfficeRes = updatePostOffice(
          postOfficeState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (postOfficeRes.stampSoundTriggered) {
          sound.postStamp();
        }
        if (postOfficeRes.awardedPostOfficeBonus) {
          sound.postStamp(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + postOfficeRes.cashBonus,
            reputation: progression.reputation + postOfficeRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(KEMAL_POS, vehicle.position);
          hud.showToast("🏤 EKSPRES POSTA GÜVENCESİ! +10 ₺ (+1 İtibar, PTT Molası & Nitro)", 3500);
        }
        world.postOffice.update(
          dt,
          postOfficeState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Sanayi "Demirciler ve Dökümcüler Sanayi Sitesi & Sıcak Dövme Haddehanesi" (T59)
        const foundryRes = updateFoundry(
          foundryState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (foundryRes.hammerSoundTriggered) {
          sound.powerHammer();
        }
        if (foundryRes.awardedFoundryBonus) {
          sound.powerHammer(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + foundryRes.cashBonus,
            reputation: progression.reputation + foundryRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(HAMDI_USTA_POS, vehicle.position);
          hud.showToast("⚒️ SANAYİ ÇELİĞİ DAYANIKLILIĞI! +10 ₺ (+1 İtibar, Haddehane Molası & Zırh)", 3500);
        }
        world.foundry.update(
          dt,
          foundryState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" (T60)
        const turkishCoffeeRes = updateTurkishCoffee(
          turkishCoffeeState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (turkishCoffeeRes.coffeeSoundTriggered) {
          sound.turkishCoffee();
        }
        if (turkishCoffeeRes.awardedTurkishCoffeeBonus) {
          sound.turkishCoffee(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + turkishCoffeeRes.cashBonus,
            reputation: progression.reputation + turkishCoffeeRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(TAHSIN_EFENDI_POS, vehicle.position);
          hud.showToast("☕ KIRK YILLIK HATIR! +10 ₺ (+1 İtibar, Közde Kahve & Lokum Molası)", 3500);
        }
        world.turkishCoffee.update(
          dt,
          turkishCoffeeState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Sahil "Tarihi Kıyı Tahlisiye & Deniz Kurtarma İstasyonu" (T61)
        const lifesavingRes = updateLifesaving(
          lifesavingState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (lifesavingRes.soundTriggered) {
          sound.lifeboatWinch();
        }
        if (lifesavingRes.awardedLifesavingBonus) {
          sound.lifeboatWinch(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + lifesavingRes.cashBonus,
            reputation: progression.reputation + lifesavingRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(SUKRU_KAPTAN_POS, vehicle.position);
          hud.showToast("🛟 KIYI EMNİYETİ GÜVENCESİ! +10 ₺ (+1 İtibar, Tahlisiye Botu Molası & Nitro)", 3500);
        }
        world.lifesaving.update(
          dt,
          lifesavingState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Güneş Mahallesi "Tarihi Mahalle Sağlık Ocağı & Dispanseri" (T62)
        const healthClinicRes = updateHealthClinic(
          healthClinicState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (healthClinicRes.soundTriggered) {
          sound.medicalChime();
        }
        if (healthClinicRes.awardedHealthClinicBonus) {
          sound.medicalChime(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + healthClinicRes.cashBonus,
            reputation: progression.reputation + healthClinicRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(DR_HIKMET_POS, vehicle.position);
          hud.showToast("🏥 SAĞLIK & SIHHAT GÜVENCESİ! +10 ₺ (+1 İtibar, Sağlık Ocağı Molası & Nitro)", 3500);
        }
        world.healthClinic.update(
          dt,
          healthClinicState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        // Sanayi "Tarihi Makine, Torna & Freze İmalathanesi" (T63)
        const latheRes = updateLatheWorkshop(
          latheWorkshopState,
          dt,
          vehicle.position,
          currentSpeed,
        );
        if (latheRes.soundTriggered) {
          sound.latheMachine();
        }
        if (latheRes.awardedLatheBonus) {
          sound.latheMachine(1.2);
          const maxNitro =
            (1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25)) *
            (vehicle.supercharged ? 1.25 : 1.0);
          vehicle.nitro = Math.min(maxNitro, vehicle.nitro + 0.45);
          progression = {
            ...progression,
            money: progression.money + latheRes.cashBonus,
            reputation: progression.reputation + latheRes.repBonus,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          hud.update(delivery, progression, soundEnabled);
          particles.spawnConfetti(vehicle.position);
          particles.spawnMoneyStream(NECATI_USTA_POS, vehicle.position);
          hud.showToast("⚙️ SANAYİ HASSASİYETİ & TORNA AYARI! +10 ₺ (+1 İtibar, Torna Molası & Nitro)", 3500);
        }
        world.latheWorkshop.update(
          dt,
          latheWorkshopState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );

        const impact = contactDamage.update(
          [...staticContacts, ...trafficContacts, ...pedestrianContacts], dt,
        );
        const effectiveImpact = (carpenterState.buffTimer > 0 || foundryState.buffTimer > 0) ? impact * 0.5 : impact;
        if (impact > 0.15) {
          sound.metalCrash();
          // Çarpışma noktasından kıvılcım patlaması ve kaza dumanı
          particles.spawnImpactSparks(vehicle.position);
          particles.spawnCrashSmoke(vehicle.position);

          // Trafik arabasıyla temas: panikle korna çal ve arabayı sars/it
          if (trafficContacts.length > 0) {
            sound.carHorn();
            urbanFauna.onHonk(vehicle.position);
            if (trafficContacts.collisionCarIndex != null) {
              traffic.impactCar(
                trafficContacts.collisionCarIndex,
                vehicle.position,
                Math.hypot(preVelocity.x, preVelocity.z) || 4.0,
              );
            }
          }
        }
        cameraShake = Math.max(cameraShake, impact);
        delivery = stepDelivery(
          delivery,
          vehicle,
          world.depot,
          world.homes,
          dt,
          effectiveImpact,
          progression.companyLevel,
          selectedDistrict,
          progression.unlockedDistricts,
        );
        if (delivery.completed > old.completed) {
          const earnedCount = delivery.completed - old.completed;
          const earnedMoney =
            delivery.lastReward?.earnings ?? (delivery.earnings - old.earnings);
          const earnedRep =
            delivery.lastReward?.reputation ?? (delivery.reputation - old.reputation);
          const totalDeliveries =
            progression.completedDeliveries + earnedCount;
          const oldLevel = progression.companyLevel;
          const newLevel = Math.floor(totalDeliveries / 10) + 1;

          progression = {
            ...progression,
            bestScore: Math.max(progression.bestScore, delivery.score),
            money: progression.money + earnedMoney,
            reputation: progression.reputation + earnedRep,
            completedDeliveries: totalDeliveries,
            companyLevel: newLevel,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);

          deliveryAnimation.play(
            vehicle.position,
            world.homes[old.targetIndex],
          );
          sound.delivery();
          sound.packageDrop();

          const tipBonus = delivery.lastReward?.tipBonus ?? 0;
          world.deliveryStations.onDelivered(old.targetIndex, old.packageType, tipBonus);
          particles.spawnMoneyStream(world.homes[old.targetIndex], vehicle.position);

          if (tipBonus > 0) {
            sound.customerTip();
            hud.showToast(`💵 MÜŞTERİ BAHŞİŞİ! +${tipBonus} ₺`, 2800);
          }

          if (coppersmithState.buffTimer > 0) {
            const artisanBonus = 15;
            progression = {
              ...progression,
              money: progression.money + artisanBonus,
            };
            sound.customerTip();
            hud.showToast(`🏺 USTA ESNAF HÜRMETİ BAHŞİŞİ! +${artisanBonus} ₺`, 3000);
          }

          if (cinemaState.buffTimer > 0) {
            const cinemaBonus = 15;
            progression = {
              ...progression,
              money: progression.money + cinemaBonus,
            };
            sound.customerTip();
            hud.showToast(`🎬 YAZLIK SİNEMA NEŞESİ BAHŞİŞİ! +${cinemaBonus} ₺`, 3000);
          }

          if (postOfficeState.buffTimer > 0) {
            const postBonus = 15;
            progression = {
              ...progression,
              money: progression.money + postBonus,
            };
            sound.customerTip();
            hud.showToast(`🏤 EKSPRES POSTA PRİMİ! +${postBonus} ₺`, 3000);
          }

          if (foundryState.buffTimer > 0) {
            const foundryBonus = 15;
            progression = {
              ...progression,
              money: progression.money + foundryBonus,
            };
            sound.customerTip();
            hud.showToast(`⚒️ SANAYİ ÇELİĞİ PRİMİ! +${foundryBonus} ₺`, 3000);
          }

          if (turkishCoffeeState.buffTimer > 0) {
            const coffeeBonus = 15;
            progression = {
              ...progression,
              money: progression.money + coffeeBonus,
            };
            sound.customerTip();
            hud.showToast(`☕ KIRK YILLIK HATIR PRİMİ! +${coffeeBonus} ₺`, 3000);
          }

          if (lifesavingState.buffTimer > 0) {
            const rescueBonus = 15;
            progression = {
              ...progression,
              money: progression.money + rescueBonus,
            };
            sound.customerTip();
            hud.showToast(`🛟 KIYI EMNİYETİ PRİMİ! +${rescueBonus} ₺`, 3000);
          }

          if (healthClinicState.buffTimer > 0) {
            const healthBonus = 15;
            progression = {
              ...progression,
              money: progression.money + healthBonus,
            };
            sound.customerTip();
            hud.showToast(`🏥 SAĞLIK & SIHHAT PRİMİ! +${healthBonus} ₺`, 3000);
          }

          if (latheWorkshopState.buffTimer > 0) {
            const latheBonus = 15;
            progression = {
              ...progression,
              money: progression.money + latheBonus,
            };
            sound.customerTip();
            hud.showToast(`⚙️ SANAYİ HASSASİYETİ PRİMİ! +${latheBonus} ₺`, 3000);
          }

          if (delivery.lastReward?.safeBonus && delivery.lastReward.safeBonus > 0) {
            sound.cleanDriveBonus();
            hud.showToast(`⭐ TEMİZ SÜRÜŞ BONUSU! +${delivery.lastReward.safeBonus} ₺`, 2800);
          }

          if (delivery.lastReward?.comboStreak && delivery.lastReward.comboStreak >= 2) {
            const streak = delivery.lastReward.comboStreak;
            const bonus = delivery.lastReward.comboBonus ?? 0;
            sound.comboFanfare(streak);
            particles.spawnConfetti(world.homes[old.targetIndex]);
            const streakLabel =
              streak >= 5
                ? `🏆 ${streak}x KARGO MASTER!`
                : streak >= 4
                  ? `🚀 ${streak}x KUSURSUZ SERİ!`
                  : streak >= 3
                    ? `⚡ ${streak}x EFSANE SERİ!`
                    : `🔥 ${streak}x SERİ TESLİMAT!`;
            hud.showToast(`${streakLabel} +${bonus} ₺ BONUS!`, 3400);
          }

          if (delivery.lastReward?.flashBonus && delivery.lastReward.flashBonus > 0) {
            sound.comboFanfare(5);
            particles.spawnConfetti(world.homes[old.targetIndex]);
            hud.showToast(`⚡ FLAŞ SİPARİŞ TAMAMLANDI! +${delivery.lastReward.flashBonus} ₺ BONUS! 🚀`, 3800);
          }

          // Yeni açılan kariyer başarımlarını ve ödüllerini kontrol et (T27)
          const prevTrophies = progression.careerTrophies ?? [];
          const newTrophies = checkNewTrophies(progression, prevTrophies);
          if (newTrophies.length > 0) {
            const newIds = newTrophies.map((t) => t.id);
            let totalTrophyBonus = 0;
            for (const t of newTrophies) totalTrophyBonus += t.rewardMoney;
            progression = {
              ...progression,
              money: progression.money + totalTrophyBonus,
              careerTrophies: [...prevTrophies, ...newIds],
            };
            storage.save({ ...progression, soundEnabled });
            companySheet.update(progression);
            hud.update(delivery, progression, soundEnabled);
            for (const t of newTrophies) {
              hud.showToast(`🏆 BAŞARIM KAZANILDI: ${t.title} (+${t.rewardMoney} ₺)`, 3500);
            }
            sound.comboFanfare(5);
          }

          if (newLevel > oldLevel) {
            const newlyUnlocked = world.updateUnlockedDistricts(
              newLevel,
              progression.unlockedDistricts,
            );
            traffic.setCompanyLevel(newLevel, progression.unlockedDistricts);
            pedestrians.setCompanyLevel(newLevel, progression.unlockedDistricts);
            fleet.syncWithProgression(
              progression.couriers || [],
              newLevel,
              world.depot,
              world.homes,
              progression.unlockedDistricts,
            );
            if (newlyUnlocked.length > 0) {
              const names = newlyUnlocked
                .map((id) => districtById(id).name)
                .join(", ");
              hud.showToast(`🎉 YENİ BÖLGE AÇILDI: ${names}!`, 4500);
            }
          }
        }
        if (old.phase !== "delivering" && delivery.phase === "delivering") {
          sound.pickup();
          if (delivery.isSpecialContract) {
            hud.showToast(`⭐ ÖZEL SÖZLEŞME: ${packageInfo[delivery.packageType].label}!`, 3600);
          }
          if (delivery.flashRush?.active) {
            hud.showToast(`⚡ FLAŞ SİPARİŞ RUSH! Süre dolmadan yetiştir!`, 3600);
          }
        }
        if (delivery.phase === "result") {
          if (delivery.score > progression.bestScore) {
            progression = {
              ...progression,
              bestScore: delivery.score,
            };
            storage.save({ ...progression, soundEnabled });
            companySheet.update(progression);
          }
        }
      } else {
        currentThrottle = 0;
        currentNitro = false;
        props.update(dt, vehicle);
        puddles.update(dt, vehicle.position, 0, 0, weatherState.wetness);
        pitstopView.update(dt, pitstopState, vehicle.position);
        streetVendorsView.update(dt, streetVendorsState, vehicle.position);
        world.ferrisWheel.update(
          dt,
          ferrisWheelState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.tram.update(
          dt,
          tramState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.train.update(
          dt,
          trainState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.communityPark.update(
          dt,
          communityParkState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.fishingHarbour.update(
          dt,
          fishingHarbourState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.autoRepair.update(
          dt,
          autoRepairState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.groceryStore.update(
          dt,
          groceryStoreState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.coffeeHouse.update(
          dt,
          coffeeHouseState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.iceCreamStand.update(
          dt,
          iceCreamStandState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.restaurant.update(
          dt,
          restaurantState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.school.update(
          dt,
          schoolState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.bakery.update(
          dt,
          bakeryState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.lighthouse.update(
          dt,
          lighthouseState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.market.update(
          dt,
          marketState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.carpenter.update(
          dt,
          carpenterState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.coppersmith.update(
          dt,
          coppersmithState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.cinema.update(
          dt,
          cinemaState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.postOffice.update(
          dt,
          postOfficeState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.foundry.update(
          dt,
          foundryState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.turkishCoffee.update(
          dt,
          turkishCoffeeState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.lifesaving.update(
          dt,
          lifesavingState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.healthClinic.update(
          dt,
          healthClinicState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
        world.latheWorkshop.update(
          dt,
          latheWorkshopState,
          vehicle.position,
          atmoState.isNightOrDusk || weatherState.isStorm,
        );
      }
      if (started) {
        const here = districtAt(vehicle.position.x, vehicle.position.z);
        if (here !== lastDistrict) {
          lastDistrict = here;
          hud.showToast(`📍 ${districtById(here).name}`, 2200);
        }
      }
      cameraShake *= Math.exp(-8 * dt);
      const target =
        delivery.phase === "delivering"
          ? world.homes[delivery.targetIndex]
          : world.depot;
      marker.group.visible = started;
      marker.update(
        target,
        delivery.phase === "delivering",
        dt,
        delivery.holdSeconds,
        delivery.packageType,
      );
      const isNightLights = atmoState.isNightOrDusk || weatherState.rainIntensity > 0.35;
      car.update(vehicle, delivery.phase === "delivering", dt, isNightLights);
      deliveryAnimation.update(dt);
      updateCamera(camera, vehicle, dt, vehicle.velocity, cameraShake);

      const speed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);
      if (started) {
        syncPadsWithProgression();
        const buyResult = updateBuyPads(
          buyPads,
          vehicle.position,
          progression.money,
          dt,
          speed,
        );
        if (buyResult.spentMoney > 0) {
          progression = {
            ...progression,
            money: buyResult.remainingMoney,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);

          if (buyResult.activePad) {
            particles.spawnMoneyStream(vehicle.position, buyResult.activePad.position);
          }

          coinSoundTimer += dt;
          if (coinSoundTimer >= 0.08) {
            coinSoundTimer = 0;
            sound.playMoneyDrain();
          }
        } else {
          coinSoundTimer = 0.08;
        }

        for (const event of buyResult.events) {
          if (event.type === "complete") {
            particles.spawnConfetti(event.pad.position);
            sound.playUnlockJingle();
          }
        }
        buyPadsView.update(buyPads, dt, buyResult.activePad?.id, vehicle.position);

        // Hızlı Nitro İstasyonu pompası dolumu (Oyuncu ped alanındayken anında hızlı doldur)
        const distToNitroPad = Math.hypot(
          vehicle.position.x - nitroPad.position.x,
          vehicle.position.z - nitroPad.position.z,
        );
        const maxNitroCap =
          1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25);
        if (distToNitroPad <= nitroPad.radius) {
          vehicle.nitro = Math.min(maxNitroCap, vehicle.nitro + dt * 2.5);
          vehicle.nitroLocked = false;
        }

        // Garaj Kurye Scooter'ı Değiştirme ve Park Alanı Kontrolü
        if (scooterUnlocked) {
          const distToPark = Math.hypot(
            vehicle.position.x - parkedVehicle.position.x,
            vehicle.position.z - parkedVehicle.position.z,
          );
          const inParkZone = distToPark <= 3.2;

          if (inParkZone) {
            if (speed < 0.6) {
              parkStopTimer += dt;
            } else {
              parkStopTimer = 0;
            }

            const interactPressed = input.consumeInteract();
            const shouldSwap =
              (interactPressed || parkStopTimer >= 0.5) && swapCooldown <= 0;

            if (shouldSwap) {
              swapCooldown = 2.0;
              parkStopTimer = 0;
              const nextType: VehicleType =
                progression.currentVehicle === "scooter" ? "van" : "scooter";
              progression = {
                ...progression,
                currentVehicle: nextType,
              };
              storage.save({ ...progression, soundEnabled });
              vehicle.type = nextType;
              car.setVehicleType(nextType);
              parkedVehicle.setVehicleType(
                nextType === "scooter" ? "van" : "scooter",
              );
              sound.pickup();

              if (nextType === "scooter") {
                hud.showToast("🛵 Kurye Scooter'ına geçildi!", 3500);
              } else {
                hud.showToast("🚚 Kargo Vanına geçildi!", 3500);
              }
            }
          } else {
            parkStopTimer = 0;
          }
        }

        fleet.update(
          dt,
          progression.companyLevel,
          world.depot,
          world.homes,
          progression.unlockedDistricts,
        );
        fleetView.update(fleet.couriers, dt);
        skidmarks.update(vehicle, dt);
        const isBoosting = currentNitro && vehicle.nitro > 0 && currentThrottle > 0.1;
        particles.update(vehicle, isBoosting, dt);
        sound.updateMotor(speed, currentThrottle, currentNitro, vehicle.drifting);
      } else {
        buyPadsView.update(buyPads, dt, null, vehicle.position);
        fleetView.update(fleet.couriers, dt);
        sound.updateMotor(0, 0, false, false);
      }

      hud.update(delivery, progression, soundEnabled);
      const activeMaxNitro =
        1 + (progression.upgrades.nitro ?? 0) * (TUNING.nitroMaxBonus ?? 0.25);
      hud.setNitro(vehicle.nitro, activeMaxNitro);
      minimap.update(
        vehicle.position,
        vehicle.heading,
        target,
        delivery.phase,
        progression.companyLevel,
        dt,
        fleet.couriers.map((c) => c.position),
        progression.unlockedDistricts,
        tramState.position,
        trainState.position,
      );
      hud.setNavigation(
        Math.hypot(
          target.x - vehicle.position.x,
          target.z - vehicle.position.z,
        ),
        Math.atan2(
          target.x - vehicle.position.x,
          -(target.z - vehicle.position.z),
        ),
      );
    },
    () => renderer.render(scene, camera),
  );

  function saveExitTimestamp() {
    progression.lastPlayedTimestamp = Date.now();
    storage.save(progression);
  }

  function visibility() {
    loop.setPaused(document.hidden);
    sound.setPaused(document.hidden);
    if (document.hidden) {
      sound.updateMotor(0, 0, false, false);
      saveExitTimestamp();
    }
    pause.hidden = !document.hidden;
    input.reset();
  }
  document.addEventListener("visibilitychange", visibility);
  visibility();
  hud.update(delivery, progression, soundEnabled);
  companySheet.show();
  companySheet.update(progression);
  loop.start();

  window.addEventListener(
    "pagehide",
    () => {
      saveExitTimestamp();
      loop.dispose();
      input.dispose();
      hud.dispose();
      companySheet.dispose();
      minimap.dispose();
      sound.dispose();
      fleetView.dispose();
      parkedVehicle.dispose();
      skidmarks.dispose();
      particles.dispose();
      clouds.dispose();
      atmosphere.dispose();
      weather.dispose();
      puddles.dispose();
      urbanFauna.dispose();
      pitstopView.dispose();
      streetVendorsView.dispose();
      world.ferrisWheel.dispose();
      world.tram.dispose();
      world.train.dispose();
      world.communityPark.dispose();
      world.fishingHarbour.dispose();
      world.autoRepair.dispose();
      world.groceryStore.dispose();
      world.coffeeHouse.dispose();
      world.iceCreamStand.dispose();
      world.restaurant.dispose();
      world.school.dispose();
      world.bakery.dispose();
      world.lighthouse.dispose();
      world.market.dispose();
      world.carpenter.dispose();
      world.coppersmith.dispose();
      world.cinema.dispose();
      world.postOffice.dispose();
      world.foundry.dispose();
      world.turkishCoffee.dispose();
      world.lifesaving.dispose();
      world.healthClinic.dispose();
      world.latheWorkshop.dispose();
      renderer.dispose();
    },
    { once: true },
  );
}
