import * as THREE from "three";
import "./style.css";
import { createWorld } from "./scene/world";
import { createCar } from "./scene/car";
import { updateCamera } from "./scene/camera";
import { createMarkers, createDeliveryAnimation } from "./scene/markers";
import { createInput } from "./game/input";
import { stepVehicle, resetVehicle } from "./game/vehicle";
import { resolveMovement } from "./game/collision";
import { createLoop } from "./game/loop";
import { createDeliveryState, stepDelivery } from "./game/delivery";
import { createHud } from "./ui/hud";
import { createLocalStorageAdapter } from "./platform/storage";
import { createSound } from "./audio/sound";
import { upgradeCost, type UpgradeKind } from "./game/upgrades";
import { createTraffic } from "./scene/traffic";
import { createPedestrians } from "./scene/pedestrians";
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
  scene.fog = new THREE.Fog("#c9dec0", 48, 85);
  scene.add(new THREE.HemisphereLight("#ffefd5", "#739282", 2.4));
  const sun = new THREE.DirectionalLight("#fff1d7", 3);
  sun.position.set(-18, 30, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
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
  let vehicle = resetVehicle(world.depot),
    delivery = createDeliveryState(
      preferences.upgrades.cargo,
      preferences.companyLevel,
    ),
    started = false,
    progression = { ...preferences },
    soundEnabled = preferences.soundEnabled,
    cameraShake = 0,
    lastTrafficDamage = 0;
  sound.setEnabled(soundEnabled);
  camera.position.set(vehicle.position.x, 27, vehicle.position.z + 21);
  updateCamera(camera, vehicle.position, 1);
  const ui = document.createElement("div");
  ui.className = "ui";
  app.append(ui);
  const hud = createHud(ui, {
    restart() {
      void sound.unlock();
      started = true;
      vehicle = resetVehicle(world.depot);
      delivery = createDeliveryState(
        progression.upgrades.cargo,
        progression.companyLevel,
      );
      cameraShake = 0;
      lastTrafficDamage = 0;
      input.reset();
    },
    recover() {
      vehicle = resetVehicle(world.depot);
      delivery = { ...delivery, holdSeconds: 0 };
      cameraShake = 0;
      lastTrafficDamage = 0;
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
      const cost = upgradeCost(kind, progression.upgrades[kind]);
      if (progression.money < cost) return;
      progression = {
        ...progression,
        money: progression.money - cost,
        upgrades: {
          ...progression.upgrades,
          [kind]: progression.upgrades[kind] + 1,
        },
      };
      storage.save({ ...progression, soundEnabled });
      hud.update(delivery, progression, soundEnabled);
    },
  });
  const input = createInput(document.querySelector<HTMLElement>("#joystick")!);
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
  const loop = createLoop(
    (dt) => {
      if (started && delivery.phase !== "result") {
        const previous = vehicle.position;
        vehicle = stepVehicle(vehicle, input.read(), dt, progression.upgrades);
        const proposed = vehicle.position;
        const resolved = resolveMovement(
          previous,
          proposed,
          0.65,
          world.obstacles,
          world.bounds,
        );
        const collisionDistance = Math.hypot(
          proposed.x - resolved.x,
          proposed.z - resolved.z,
        );
        if (Math.abs(resolved.x - proposed.x) > 0.001) vehicle.velocity.x = 0;
        if (Math.abs(resolved.z - proposed.z) > 0.001) vehicle.velocity.z = 0;
        vehicle.position = resolved;
        const old = delivery;
        const trafficDamage = traffic.update(dt, vehicle.position);
        const pedestrianRisk = pedestrians.update(
          dt,
          vehicle.position,
          Math.hypot(vehicle.velocity.x, vehicle.velocity.z),
        );
        const impact = trafficDamage + pedestrianRisk;
        if (impact > 0.15 && lastTrafficDamage <= 0.15) sound.collision();
        cameraShake = Math.max(cameraShake, impact);
        lastTrafficDamage = impact;
        delivery = stepDelivery(
          delivery,
          vehicle,
          world.depot,
          world.homes,
          dt,
          collisionDistance + trafficDamage + pedestrianRisk,
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
          progression = {
            ...progression,
            bestScore: Math.max(progression.bestScore, delivery.score),
            money: progression.money + delivery.earnings,
            reputation: progression.reputation + delivery.reputation,
            completedDeliveries:
              progression.completedDeliveries + delivery.completed,
            companyLevel:
              Math.floor(
                (progression.completedDeliveries + delivery.completed) / 10,
              ) + 1,
          };
          storage.save({ ...progression, soundEnabled });
          input.reset();
        }
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
      updateCamera(camera, vehicle.position, dt, vehicle.velocity, cameraShake);
      hud.update(delivery, progression, soundEnabled);
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
  function visibility() {
    loop.setPaused(document.hidden);
    sound.setPaused(document.hidden);
    pause.hidden = !document.hidden;
    input.reset();
  }
  document.addEventListener("visibilitychange", visibility);
  visibility();
  hud.update(delivery, progression, soundEnabled);
  loop.start();

  window.addEventListener(
    "pagehide",
    () => {
      loop.dispose();
      input.dispose();
      hud.dispose();
      sound.dispose();
      renderer.dispose();
    },
    { once: true },
  );
}
