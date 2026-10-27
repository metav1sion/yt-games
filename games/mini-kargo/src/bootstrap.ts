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
import { createDeliveryState, stepDelivery } from "./game/delivery";
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
  scene.add(new THREE.HemisphereLight("#e2f3ff", "#72b063", 2.2));
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
  const clouds = createClouds(11);
  scene.add(clouds.group);
  const world = createWorld();
  scene.add(world.group);
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
  let progression: CompanyProgression = asCompanyProgression(preferences);
  progression = applyOfflineEarnings(progression, Date.now());
  storage.save(progression);

  const currentVehType = (progression.currentVehicle as VehicleType) ?? "van";
  const car = createCar(null, currentVehType);
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
    position: { x: -52, z: -27 },
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
    position: { x: -52, z: -37 },
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
    position: { x: -44, z: -32 },
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
    position: { x: -60, z: -24 },
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
  });

  const companySheet = createCompanySheet(ui, {
    onSelectDistrict(id) {
      selectedDistrict = id;
      sound.pickup();
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

  const loop = createLoop(
    (dt) => {
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

        // Yıkılabilir / fırlayan nesneler (Props) çarpışma ve fizik simülasyonu
        const propHit = props.update(dt, vehicle);
        if (propHit) {
          sound.collision();
        }
        const old = delivery;
        const trafficContacts = traffic.update(dt, vehicle.position);
        const pedestrianContacts = pedestrians.update(
          dt,
          vehicle.position,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
        );
        const impact = contactDamage.update(
          [...staticContacts, ...trafficContacts, ...pedestrianContacts], dt,
        );
        if (impact > 0.15) sound.collision();
        cameraShake = Math.max(cameraShake, impact);
        delivery = stepDelivery(
          delivery,
          vehicle,
          world.depot,
          world.homes,
          dt,
          impact,
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
        if (old.phase !== "delivering" && delivery.phase === "delivering")
          sound.pickup();
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
      marker.update(target, delivery.phase === "delivering", dt);
      car.update(vehicle, delivery.phase === "delivering", dt);
      deliveryAnimation.update(dt);
      updateCamera(camera, vehicle, dt, vehicle.velocity, cameraShake);

      // Güneş ışığı ve dinamik gölge arabayı takip eder
      sun.position.set(vehicle.position.x - 24, 38, vehicle.position.z + 18);
      sun.target.position.set(vehicle.position.x, 0, vehicle.position.z);
      clouds.update(dt);

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
        buyPadsView.update(buyPads, dt, buyResult.activePad?.id);

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
        buyPadsView.update(buyPads, dt, null);
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
      renderer.dispose();
    },
    { once: true },
  );
}
