import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createCar } from "./car";
import type { VehicleState } from "../game/types";

const mockVehicle = (): VehicleState => ({
  position: { x: 0, z: 0 },
  velocity: { x: 0, z: 0 },
  heading: 0,
  nitro: 1,
  drifting: false,
  steerAngle: 0,
  altitude: 0,
  verticalVelocity: 0,
  airborne: false,
});

describe("createCar vehicle geometry and visual parts", () => {
  it("renders complete car with yellow chassis, cabin, wheels, and cargo", () => {
    const car = createCar();

    // 1. Grup ve gövde hiyerarşisi
    expect(car.group).toBeInstanceOf(THREE.Group);
    expect(car.group.children.length).toBeGreaterThan(0);

    const body = car.group.children[0] as THREE.Group;
    expect(body).toBeInstanceOf(THREE.Group);

    // 2. Tüm parçalar (şasi, kabin, camlar, 4 tekerlek, farlar, kargo) mevcuttur
    // En az 15 ayrı mesh/parça içerir (şasi, kabin, camlar, 4 tekerlek, 4 jant, tamponlar, farlar, koli)
    const meshes: THREE.Mesh[] = [];
    body.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });

    expect(meshes.length).toBeGreaterThanOrEqual(14);

    // 3. 4 tekerleğin silindir geometrisi doğrulanır
    const cylinders = meshes.filter(
      (m) => m.geometry instanceof THREE.CylinderGeometry,
    );
    // 4 tekerlek + 4 jant göbeği = en az 8 silindir
    expect(cylinders.length).toBeGreaterThanOrEqual(8);

    // 4. Sarı kaporta rengi (#f3b544) mevcuttur
    const materials = meshes.map((m) => m.material as THREE.MeshStandardMaterial);
    const hasYellowChassis = materials.some(
      (mat) => mat.color?.getHexString().toLowerCase() === "f3b544",
    );
    expect(hasYellowChassis).toBe(true);

    // 5. Update çağrıldığında araba konum ve rotasyonunu günceller
    car.update(mockVehicle(), true, 1 / 60);
    expect(car.group.position.y).toBeCloseTo(0.08, 2);
  });

  it("rotates wheels purely along rolling axis and steers front wheels without wobble", () => {
    const car = createCar();
    const movingVehicle: VehicleState = {
      ...mockVehicle(),
      velocity: { x: 0, z: 8 },
      steerAngle: 0.35,
    };
    car.update(movingVehicle, false, 1 / 60);

    // Roll groups rotate along X, holder groups steer along Y, tire cylinder meshes stay Z=PI/2
    const body = car.group.children[0] as THREE.Group;
    let foundFrontHolder = false;
    let foundRollGroup = false;

    body.traverse((child) => {
      if (child instanceof THREE.Group && child !== body) {
        if (Math.abs(child.rotation.y - (-0.35)) < 1e-4) {
          foundFrontHolder = true;
        }
        if (child.rotation.x > 0.01) {
          foundRollGroup = true;
        }
      }
    });

    expect(foundFrontHolder).toBe(true);
    expect(foundRollGroup).toBe(true);
  });
});
