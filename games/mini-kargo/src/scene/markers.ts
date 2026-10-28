import * as THREE from "three";
import { box, label } from "./world-kit";
import type { Vec2 } from "../game/types";
import type { PackageType } from "../game/delivery";

export function createMarkers() {
  const group = new THREE.Group();

  // 1. Dış hedef halkası (Outer target ring)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.7, 2, 48),
    new THREE.MeshBasicMaterial({
      color: "#f6c55e",
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.25;
  group.add(ring);

  // 2. Taban yarı saydam disk (Base ground disc)
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 48),
    new THREE.MeshBasicMaterial({
      color: "#f6c55e",
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.24;
  group.add(disc);

  // 3. Durma İlerleme Halkası / Dolum Diski (Radial hold progress disc)
  const progressDisc = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 1.7, 48),
    new THREE.MeshBasicMaterial({
      color: "#2ecc71",
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  progressDisc.rotation.x = -Math.PI / 2;
  progressDisc.position.y = 0.245;
  progressDisc.scale.set(0.001, 0.001, 1);
  progressDisc.name = "progressDisc";
  group.add(progressDisc);

  // 4. Havada dönen 3B Pin (Hovering spinning diamond pin)
  const pin = new THREE.Group();
  box(pin, [0.75, 0.75, 0.75], [0, 0, 0], "#f3b544");
  box(pin, [0.14, 0.76, 0.76], [0, 0, 0], "#fff3d0");
  pin.position.y = 3.7;
  group.add(pin);

  // 5. Tabelalar
  const sign = label("PAKET AL", "#244a40", "#fff3cb");
  sign.position.y = 5;
  sign.scale.set(3.4, 0.85, 1);
  group.add(sign);

  let phase = "";
  let time = 0;
  let currentThemeKey = "";

  return {
    group,
    update(
      target: Vec2,
      delivering: boolean,
      dt: number,
      holdSeconds = 0,
      packageType: PackageType = "standard",
    ) {
      group.position.set(target.x, 0, target.z);
      time += dt;

      pin.position.y = 3.8 + Math.sin(time * 3) * 0.16;
      pin.rotation.y = time * 0.65;
      ring.scale.setScalar(1 + Math.sin(time * 3) * 0.035);

      // İlerleme diski dolumu (0'dan 1'e doğru pürüzsüz yayılma)
      const holdProgress = Math.min(1, Math.max(0, holdSeconds));
      if (holdProgress > 0) {
        progressDisc.visible = true;
        const s = Math.max(0.001, holdProgress);
        progressDisc.scale.set(s, s, 1);
        (progressDisc.material as THREE.MeshBasicMaterial).opacity =
          0.35 + holdProgress * 0.45 + Math.sin(time * 8) * 0.1;
      } else {
        progressDisc.visible = false;
        progressDisc.scale.set(0.001, 0.001, 1);
      }

      const key = delivering ? "TESLİM ET" : "PAKET AL";
      const themeKey = delivering ? `${key}:${packageType}` : key;

      if (themeKey !== currentThemeKey) {
        currentThemeKey = themeKey;
        phase = key;

        let ringColor = delivering ? "#5dbb90" : "#f6c55e";
        let labelBg = delivering ? "#2c7760" : "#fff3cb";
        let labelFg = delivering ? "#fff8e4" : "#244a40";

        if (delivering) {
          if (packageType === "vip_express") {
            ringColor = "#00d2d3";
            labelBg = "#006266";
            labelFg = "#ffffff";
          } else if (packageType === "cold_chain") {
            ringColor = "#54a0ff";
            labelBg = "#103c80";
            labelFg = "#ffffff";
          } else if (packageType === "heavy_freight") {
            ringColor = "#ff9f43";
            labelBg = "#803505";
            labelFg = "#ffffff";
          } else if (packageType === "urgent") {
            ringColor = "#ee5253";
            labelBg = "#8c1414";
            labelFg = "#ffffff";
          } else if (packageType === "fragile") {
            ringColor = "#1dd1a1";
            labelBg = "#085741";
            labelFg = "#ffffff";
          }
        }

        const newSign = label(key, labelFg, labelBg);
        (sign.material as THREE.SpriteMaterial).map?.dispose();
        (sign.material as THREE.SpriteMaterial).map = (
          newSign.material as THREE.SpriteMaterial
        ).map;
        (sign.material as THREE.SpriteMaterial).needsUpdate = true;
        newSign.material.dispose();

        (ring.material as THREE.MeshBasicMaterial).color.set(ringColor);
        (disc.material as THREE.MeshBasicMaterial).color.set(ringColor);
      }
    },
  };
}

export function createDeliveryAnimation(scene: THREE.Scene) {
  const parcel = new THREE.Group();
  box(parcel, [0.8, 0.7, 0.8], [0, 0, 0], "#c98e51");
  box(parcel, [0.14, 0.71, 0.81], [0, 0, 0], "#f6d191");
  scene.add(parcel);
  parcel.visible = false;

  let elapsed = 2;
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();

  return {
    play(position: Vec2, home: Vec2) {
      from.set(position.x, 1.2, position.z);
      to.set(home.x, 1, home.z - 3.5);
      elapsed = 0;
      parcel.visible = true;
    },
    update(dt: number) {
      elapsed += dt;
      if (elapsed > 0.85) {
        parcel.visible = false;
        return;
      }
      const t = Math.min(1, elapsed / 0.85);
      parcel.position.lerpVectors(from, to, t);
      parcel.position.y += Math.sin(t * Math.PI) * 2;
      parcel.rotation.y = t * Math.PI * 2;
      parcel.scale.setScalar(1 - t * 0.35);
    },
  };
}
