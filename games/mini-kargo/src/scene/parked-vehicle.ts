import * as THREE from "three";
import { box } from "./world";
import { label } from "./world-kit";
import { buildScooterVisual, buildVanVisual } from "./car";
import type { Vec2, VehicleType } from "../game/types";

export type ParkedVehicle = {
  group: THREE.Group;
  position: Vec2;
  setVehicleType(type: VehicleType): void;
  getDisplayedVehicle(): VehicleType;
  update(
    dt: number,
    activePlayerVehicle: VehicleType,
    isUnlocked: boolean,
  ): void;
  dispose(): void;
};

export function createParkedVehicle(
  initialPosition: Vec2 = { x: -68, z: -32 },
): ParkedVehicle {
  const group = new THREE.Group();
  group.position.set(initialPosition.x, 0, initialPosition.z);

  // 1. Zemin Park Yeri Çizgileri
  const stall = new THREE.Group();
  group.add(stall);
  // Asfalt park alanı
  box(stall, [2.8, 0.02, 4.0], [0, 0.015, 0], "#273746");
  // Beyaz park şeritleri
  box(stall, [0.10, 0.025, 3.8], [-1.3, 0.02, 0], "#ffffff");
  box(stall, [0.10, 0.025, 3.8], [1.3, 0.02, 0], "#ffffff");
  box(stall, [2.6, 0.025, 0.10], [0, 0.02, -1.85], "#ffffff");

  // 2. 3D Scooter ve Van Görselleri
  const scooter = buildScooterVisual();
  scooter.group.position.set(0, 0.08, 0);
  scooter.group.rotation.y = Math.PI / 2;
  group.add(scooter.group);

  const van = buildVanVisual();
  van.group.position.set(0, 0.08, 0);
  van.group.rotation.y = Math.PI / 2;
  group.add(van.group);

  // 3. Bilgi Etiketi (Floating Label)
  const scooterLabel = label("🛵 Kurye Scooter'ı", "#ffffff", "#235c4e");
  scooterLabel.position.set(0, 2.3, 0);
  group.add(scooterLabel);

  const vanLabel = label("🚚 Kargo Vanı", "#ffffff", "#235c4e");
  vanLabel.position.set(0, 2.3, 0);
  group.add(vanLabel);

  let displayed: VehicleType = "scooter";
  scooter.group.visible = true;
  scooterLabel.visible = true;
  van.group.visible = false;
  vanLabel.visible = false;

  let time = 0;

  function setVehicleType(type: VehicleType) {
    displayed = type;
    const isScooter = type === "scooter";
    scooter.group.visible = isScooter;
    scooterLabel.visible = isScooter;
    van.group.visible = !isScooter;
    vanLabel.visible = !isScooter;
  }

  return {
    group,
    position: { ...initialPosition },
    setVehicleType,
    getDisplayedVehicle() {
      return displayed;
    },
    update(dt: number, activePlayerVehicle: VehicleType, isUnlocked: boolean) {
      group.visible = isUnlocked;
      if (!isUnlocked) return;

      time += dt;
      // Park alanında oyuncunun o an KULLANMADIĞI araç bekler
      const targetVehicle: VehicleType =
        activePlayerVehicle === "scooter" ? "van" : "scooter";
      if (displayed !== targetVehicle) {
        setVehicleType(targetVehicle);
      }

      // Etiket hafifçe havada süzülür
      const bob = Math.sin(time * 3) * 0.08;
      scooterLabel.position.y = 2.3 + bob;
      vanLabel.position.y = 2.3 + bob;
    },
    dispose() {
      // Temizleme
      group.clear();
    },
  };
}
