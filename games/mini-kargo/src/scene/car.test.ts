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

describe("createCar body pitch stability", () => {
  it.each([1 / 30, 1 / 60, 1 / 120])(
    "approaches the ground pitch target for five seconds at dt=%s",
    (dt) => {
      for (const speed of [4, 12]) {
        const car = createCar();
        const body = car.group.children[0] as THREE.Group;
        const state = { ...mockVehicle(), velocity: { x: 0, z: speed } };
        const target = speed === 4 ? -0.016 : -0.035;
        let previousError = Math.abs(body.rotation.x - target);

        for (let frame = 0; frame < Math.round(5 / dt); frame++) {
          car.update(state, false, dt);
          const pitch = body.rotation.x;
          const error = Math.abs(pitch - target);
          expect(Number.isFinite(pitch)).toBe(true);
          expect(pitch).toBeGreaterThanOrEqual(-0.035);
          expect(pitch).toBeLessThanOrEqual(0.035);
          expect(error).toBeLessThanOrEqual(previousError + 1e-12);
          expect(car.group.position.y).toBeCloseTo(0.08, 12);
          previousError = error;
        }

        expect(body.rotation.x).toBeCloseTo(target, 6);
      }
    },
  );

  it.each([1 / 30, 1 / 60, 1 / 120])(
    "keeps pitch finite and converging through ascent, descent and landing at dt=%s",
    (dt) => {
      const car = createCar();
      const body = car.group.children[0] as THREE.Group;
      const state = { ...mockVehicle(), velocity: { x: 0, z: 12 } };
      const phases = [
        { airborne: true, altitude: 1, verticalVelocity: 4, target: -0.1 },
        { airborne: true, altitude: 2, verticalVelocity: 30, target: -0.32 },
        { airborne: true, altitude: 3, verticalVelocity: 0, target: 0 },
        { airborne: true, altitude: 2, verticalVelocity: -4, target: 0.1 },
        { airborne: true, altitude: 1, verticalVelocity: -30, target: 0.32 },
        { airborne: false, altitude: 0, verticalVelocity: 0, target: -0.035 },
      ];

      for (const { target, ...phase } of phases) {
        Object.assign(state, phase);
        const initialPitch = body.rotation.x;
        let previousError = Math.abs(initialPitch - target);

        for (let frame = 0; frame < Math.round(3 / dt); frame++) {
          car.update(state, false, dt);
          const pitch = body.rotation.x;
          const error = Math.abs(pitch - target);
          expect(Number.isFinite(pitch)).toBe(true);
          expect(Math.abs(pitch)).toBeLessThanOrEqual(0.32);
          expect(pitch).toBeGreaterThanOrEqual(Math.min(initialPitch, target));
          expect(pitch).toBeLessThanOrEqual(Math.max(initialPitch, target));
          expect(error).toBeLessThanOrEqual(previousError + 1e-12);
          expect(car.group.position.y).toBeCloseTo(0.08 + phase.altitude, 12);
          previousError = error;
        }

        expect(body.rotation.x).toBeCloseTo(target, 6);
      }
    },
  );

  it("keeps accumulated wheel rotation separate from body pitch and altitude", () => {
    const movingCar = createCar();
    const stationaryCar = createCar();
    const movingBody = movingCar.group.children[0] as THREE.Group;
    const stationaryBody = stationaryCar.group.children[0] as THREE.Group;
    const state = {
      ...mockVehicle(),
      airborne: true,
      altitude: 2,
      verticalVelocity: 4,
      velocity: { x: 0, z: 12 },
    };
    const wheels: THREE.Object3D[] = [];
    movingBody.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry) {
        wheels.push(child.parent!);
      }
    });
    const rolls = [...new Set(wheels)];
    expect(rolls).toHaveLength(4);

    for (let frame = 0; frame < 300; frame++) {
      movingCar.update(state, false, 1 / 60);
      stationaryCar.update({ ...state, velocity: { x: 0, z: 0 } }, false, 1 / 60);
      expect(movingBody.rotation.x).toBeCloseTo(stationaryBody.rotation.x, 12);
      expect(Math.abs(movingBody.rotation.x)).toBeLessThanOrEqual(0.1);
      expect(movingBody.rotation.y).toBe(0);
      expect(movingBody.rotation.z).toBe(0);
      expect(movingCar.group.position.y).toBeCloseTo(2.08, 12);
      for (const roll of rolls) {
        expect(roll.rotation.x).toBeCloseTo(((frame + 1) * 12) / (60 * 0.3), 8);
        expect(roll.rotation.y).toBe(0);
        expect(roll.rotation.z).toBe(0);
      }
    }

    expect(rolls[0].rotation.x).toBeGreaterThan(2 * Math.PI);
    expect(movingBody.rotation.x).toBeCloseTo(-0.1, 6);
  });
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
