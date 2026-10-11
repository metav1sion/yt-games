import * as THREE from "three";
import { box, label } from "./world";
import type { Vec2 } from "../game/types";
export function createMarkers() {
  const group = new THREE.Group();
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
  const pin = new THREE.Group();
  box(pin, [0.75, 0.75, 0.75], [0, 0, 0], "#f3b544");
  box(pin, [0.14, 0.76, 0.76], [0, 0, 0], "#fff3d0");
  pin.position.y = 3.7;
  group.add(pin);
  const sign = label("PAKET AL", "#244a40", "#fff3cb");
  sign.position.y = 5;
  sign.scale.set(3.4, 0.85, 1);
  group.add(sign);
  let phase = "",
    time = 0;
  return {
    group,
    update(target: Vec2, delivering: boolean, dt: number) {
      group.position.set(target.x, 0, target.z);
      time += dt;
      pin.position.y = 3.8 + Math.sin(time * 3) * 0.16;
      pin.rotation.y = time * 0.65;
      ring.scale.setScalar(1 + Math.sin(time * 3) * 0.035);
      const key = delivering ? "TESLİM ET" : "PAKET AL";
      if (key !== phase) {
        phase = key;
        const newSign = label(
          key,
          delivering ? "#fff8e4" : "#244a40",
          delivering ? "#2c7760" : "#fff3cb",
        );
        (sign.material as THREE.SpriteMaterial).map?.dispose();
        (sign.material as THREE.SpriteMaterial).map = (
          newSign.material as THREE.SpriteMaterial
        ).map;
        (sign.material as THREE.SpriteMaterial).needsUpdate = true;
        newSign.material.dispose();
        (ring.material as THREE.MeshBasicMaterial).color.set(
          delivering ? "#5dbb90" : "#f6c55e",
        );
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
  let elapsed = 2,
    from = new THREE.Vector3(),
    to = new THREE.Vector3();
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
