import * as THREE from "three";
import "./style.css";
import { createWorld } from "./scene/world";
import { createCar } from "./scene/car";
import { updateCamera, resetCamera } from "./scene/camera";
import { createMarkers, createDeliveryAnimation } from "./scene/markers";
import { createSkidmarks } from "./scene/skidmarks";
import { createParticles } from "./scene/particles";
import { createInput } from "./game/input";
import { stepVehicle, resetVehicle } from "./game/vehicle";
import { resolveCollision } from "./game/collision";
import { createLoop } from "./game/loop";
import { createDeliveryState, stepDelivery } from "./game/delivery";
import { createContactDamageTracker, staticCollisionContacts } from "./game/contact-damage";
import { createHud } from "./ui/hud";
import { createLocalStorageAdapter, asCompanyProgression, type CompanyProgression } from "./platform/storage";
import { createSound } from "./audio/sound";
import { tryPurchaseUpgrade, type UpgradeKind } from "./game/upgrades";
import { applyOfflineEarnings, claimOfflineEarnings, hireCourier } from "./game/company";
import { createCompanySheet } from "./ui/company-sheet";
import { createTraffic } from "./scene/traffic";
import { createPedestrians } from "./scene/pedestrians";
import { districtById } from "./game/districts";
import { RAMPS, checkRampLaunch } from "./game/ramps";
import { createProps } from "./scene/props";
import { assetManager } from "./scene/assets";
import { createMinimap } from "./ui/minimap";
export function startGame(app: HTMLElement) {
  app.innerHTML =
    '<canvas id="game" aria-label="Mini Kargo oyun alanı"></canvas>';
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector<HTMLCanvasElement>("#game")!,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor("#c9dec0");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#c9dec0", 80, 180);
  scene.add(new THREE.HemisphereLight("#ffefd5", "#739282", 2.4));
  const sun = new THREE.DirectionalLight("#fff1d7", 3);
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
  const world = createWorld();
  scene.add(world.group);
  const car = createCar();
  scene.add(car.group);
  const marker = createMarkers();
  scene.add(marker.group);
  const traffic = createTraffic();
  scene.add(traffic.group);
  const pedestrians = createPedestrians();
  scene.add(pedestrians.group);
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

  const contactDamage = createContactDamageTracker();
  let vehicle = resetVehicle(world.depot),
    delivery = createDeliveryState(
      progression.upgrades.cargo,
      progression.companyLevel,
    ),
    started = false,
    soundEnabled = progression.soundEnabled,
    cameraShake = 0;
  world.updateUnlockedDistricts(progression.companyLevel);
  sound.setEnabled(soundEnabled);
  resetCamera(vehicle.position, vehicle.heading);
  updateCamera(camera, vehicle, 1);
  const ui = document.createElement("div");
  ui.className = "ui";
  app.append(ui);
  const hud = createHud(ui, {
    restart() {
      void sound.unlock();
      started = true;
      vehicle = resetVehicle(world.depot);
      resetCamera(vehicle.position, vehicle.heading);
      skidmarks.reset();
      particles.reset();
      props.reset();
      delivery = createDeliveryState(
        progression.upgrades.cargo,
        progression.companyLevel,
      );
      cameraShake = 0;
      contactDamage.reset();
      input.reset();
      hud.hideResult();
      companySheet.hide();
    },
    recover() {
      vehicle = resetVehicle(world.depot);
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
      started = false;
      companySheet.show();
      companySheet.update(progression);
      hud.hideResult();
    },
  });

  const companySheet = createCompanySheet(ui, {
    onStartShift() {
      companySheet.hide();
      void sound.unlock();
      started = true;
      vehicle = resetVehicle(world.depot);
      resetCamera(vehicle.position, vehicle.heading);
      skidmarks.reset();
      particles.reset();
      props.reset();
      delivery = createDeliveryState(
        progression.upgrades.cargo,
        progression.companyLevel,
      );
      cameraShake = 0;
      contactDamage.reset();
      input.reset();
      hud.hideResult();
    },
    onBuyUpgrade(kind) {
      const purchased = tryPurchaseUpgrade(progression, kind);
      if (purchased === progression) return;
      progression = purchased;
      storage.save({ ...progression, soundEnabled });
      companySheet.update(progression);
      hud.update(delivery, progression, soundEnabled);
      sound.pickup();
    },
    onHireCourier(candidate) {
      progression = hireCourier(progression, candidate);
      storage.save({ ...progression, soundEnabled });
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

  const loop = createLoop(
    (dt) => {
      if (started && delivery.phase !== "result") {
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
        );
        if (delivery.completed > old.completed) {
          deliveryAnimation.play(
            vehicle.position,
            world.homes[old.targetIndex],
          );
          sound.delivery();
        }
        if (old.phase !== "delivering" && delivery.phase === "delivering")
          sound.pickup();
        if (delivery.phase === "result") {
          const oldLevel = progression.companyLevel;
          const totalDeliveries =
            progression.completedDeliveries + delivery.completed;
          const newLevel = Math.floor(totalDeliveries / 10) + 1;
          progression = {
            ...progression,
            bestScore: Math.max(progression.bestScore, delivery.score),
            money: progression.money + delivery.earnings,
            reputation: progression.reputation + delivery.reputation,
            completedDeliveries: totalDeliveries,
            companyLevel: newLevel,
          };
          storage.save({ ...progression, soundEnabled });
          companySheet.update(progression);
          if (newLevel > oldLevel) {
            const newlyUnlocked = world.updateUnlockedDistricts(newLevel);
            if (newlyUnlocked.length > 0) {
              const names = newlyUnlocked
                .map((id) => districtById(id).name)
                .join(", ");
              hud.showToast(`🎉 YENİ BÖLGE AÇILDI: ${names}!`, 4500);
              sound.delivery();
            }
          }
          input.reset();
        }
      } else {
        currentThrottle = 0;
        currentNitro = false;
        props.update(dt, vehicle);
      }
      cameraShake *= Math.exp(-8 * dt);
      const target =
        delivery.phase === "delivering"
          ? world.homes[delivery.targetIndex]
          : world.depot;
      marker.group.visible = delivery.phase !== "result";
      marker.update(target, delivery.phase === "delivering", dt);
      car.update(vehicle, delivery.phase === "delivering", dt);
      deliveryAnimation.update(dt);
      updateCamera(camera, vehicle, dt, vehicle.velocity, cameraShake);

      // Güneş ışığı ve dinamik gölge arabayı takip eder
      sun.position.set(vehicle.position.x - 24, 38, vehicle.position.z + 18);
      sun.target.position.set(vehicle.position.x, 0, vehicle.position.z);

      const speed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);
      if (started && delivery.phase !== "result") {
        skidmarks.update(vehicle, dt);
        const isBoosting = currentNitro && vehicle.nitro > 0 && currentThrottle > 0.1;
        particles.update(vehicle, isBoosting, dt);
        sound.updateMotor(speed, currentThrottle, currentNitro, vehicle.drifting);
      } else {
        sound.updateMotor(0, 0, false, false);
      }

      hud.update(delivery, progression, soundEnabled);
      hud.setNitro(vehicle.nitro);
      minimap.update(
        vehicle.position,
        vehicle.heading,
        target,
        delivery.phase,
        progression.companyLevel,
        dt,
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
      skidmarks.dispose();
      particles.dispose();
      renderer.dispose();
    },
    { once: true },
  );
}
