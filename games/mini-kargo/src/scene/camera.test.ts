import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createCameraRig } from "./camera";
import type { VehicleState } from "../game/types";

function mockCamera(aspect = 16 / 9): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(0, 25, 0);
  return camera;
}

function mockVehicle(overrides: Partial<VehicleState> = {}): VehicleState {
  return {
    position: { x: 0, z: 0 },
    velocity: { x: 0, z: 0 },
    heading: 0,
    nitro: 1,
    drifting: false,
    steerAngle: 0,
    altitude: 0,
    verticalVelocity: 0,
    airborne: false,
    ...overrides,
  };
}

describe("dynamic chase camera", () => {
  it("positions camera behind vehicle when driving forward", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    // 1. Heading = 0 (aracın ileri yönü +Z). Kamera arkada (-Z) olmalı.
    const vehicleZ = mockVehicle({ heading: 0, velocity: { x: 0, z: 10 } });
    rig.reset(vehicleZ.position, 0);
    rig.update(camera, vehicleZ, 0.5);

    expect(camera.position.z).toBeLessThan(vehicleZ.position.z);
    expect(camera.position.y).toBeGreaterThan(15);

    // 2. Heading = PI / 2 (aracın ileri yönü +X). Kamera arkada (-X) olmalı.
    const vehicleX = mockVehicle({ heading: Math.PI / 2, velocity: { x: 10, z: 0 } });
    rig.reset(vehicleX.position, Math.PI / 2);
    rig.update(camera, vehicleX, 0.5);

    expect(camera.position.x).toBeLessThan(vehicleX.position.x);
  });

  it("increases FOV with speed while remaining bounded", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    // Düşük hız
    const slowVehicle = mockVehicle({ velocity: { x: 0, z: 1 } });
    rig.reset(slowVehicle.position, 0);
    for (let i = 0; i < 20; i++) rig.update(camera, slowVehicle, 0.05);
    const lowFov = camera.fov;
    expect(lowFov).toBeCloseTo(40, 0);

    // Yüksek nitro hız (20 birim/sn)
    const fastVehicle = mockVehicle({ velocity: { x: 0, z: 20 } });
    for (let i = 0; i < 30; i++) rig.update(camera, fastVehicle, 0.05);
    const highFov = camera.fov;

    expect(highFov).toBeGreaterThan(lowFov + 5);
    expect(highFov).toBeLessThanOrEqual(49);
    expect(highFov).toBeGreaterThanOrEqual(46);
  });

  it("does not flip 180 degrees in reverse gear", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    // Heading = 0 (ileri yön +Z). Ancak araç geri viteste -Z yönünde gidiyor.
    const reverseVehicle = mockVehicle({
      heading: 0,
      velocity: { x: 0, z: -6 }, // Geri vites hızı
    });

    rig.reset(reverseVehicle.position, 0);
    for (let i = 0; i < 30; i++) {
      rig.update(camera, reverseVehicle, 0.05);
    }

    // Kamera 180 derece ters dönüp arabanın önüne (+Z) geçmemeli; arkada (-Z) kalmalı!
    expect(camera.position.z).toBeLessThan(reverseVehicle.position.z);
    const state = rig.getState();
    expect(Math.abs(state.angle)).toBeLessThan(Math.PI / 4);
  });

  it("generates offset when shake > 0", () => {
    const rigA = createCameraRig();
    const rigB = createCameraRig();
    const cameraA = mockCamera();
    const cameraB = mockCamera();
    const vehicle = mockVehicle({ position: { x: 10, z: 10 } });

    rigA.reset(vehicle.position, 0);
    rigB.reset(vehicle.position, 0);

    // Biri sarsıntısız, biri sarsıntılı
    rigA.update(cameraA, vehicle, 0.016, vehicle.velocity, 0);
    rigB.update(cameraB, vehicle, 0.016, vehicle.velocity, 1.0);

    const distDiff = cameraA.position.distanceTo(cameraB.position);
    expect(distDiff).toBeGreaterThan(0.01);
  });

  it("smoothly lags camera heading instead of snapping instantly", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    const vehicle = mockVehicle({ heading: 0 });
    rig.reset(vehicle.position, 0);

    // Araç aniden 90 derece dönüyor
    vehicle.heading = Math.PI / 2;
    rig.update(camera, vehicle, 0.05); // Tek bir kısa frame

    const state = rig.getState();
    // Açı anında PI/2'ye (1.57) zıplamamalı, gecikmeli ve yumuşak gelmeli
    expect(state.angle).toBeGreaterThan(0);
    expect(state.angle).toBeLessThan(Math.PI / 2 * 0.7);
  });
});
