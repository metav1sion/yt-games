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

describe("fixed angle comfortable follow camera", () => {
  it("maintains a fixed camera angle when vehicle turns in different directions (zero nausea)", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    // 1. Araç başlangıçta kuzeye (heading = 0) bakıyor
    const vehicleNorth = mockVehicle({ heading: 0, velocity: { x: 0, z: 10 } });
    rig.reset(vehicleNorth.position, 0);
    rig.update(camera, vehicleNorth, 0.5);
    const angle1 = rig.getState().angle;

    // 2. Araç doğuya (heading = PI / 2) dönüyor
    const vehicleEast = mockVehicle({
      heading: Math.PI / 2,
      velocity: { x: 10, z: 0 },
    });
    for (let i = 0; i < 30; i++) rig.update(camera, vehicleEast, 0.05);
    const angle2 = rig.getState().angle;

    // 3. Araç güneye (heading = PI) tam U dönüşü yapıyor
    const vehicleSouth = mockVehicle({
      heading: Math.PI,
      velocity: { x: 0, z: -10 },
    });
    for (let i = 0; i < 30; i++) rig.update(camera, vehicleSouth, 0.05);
    const angle3 = rig.getState().angle;

    // Kamera açısı arabanın yönüyle birlikte DÖNMEZ, sabit kalır!
    expect(angle1).toBe(angle2);
    expect(angle2).toBe(angle3);
  });

  it("positions camera at fixed perspective (~50° pitch from south)", () => {
    const rig = createCameraRig();
    const camera = mockCamera();
    const vehicle = mockVehicle({ position: { x: 10, z: 10 } });

    rig.reset(vehicle.position);
    for (let i = 0; i < 20; i++) rig.update(camera, vehicle, 0.05);

    // Kamera aracın güneyinde (+Z tarafında) ve yukarısında (+Y) yer alır
    expect(camera.position.z).toBeGreaterThan(vehicle.position.z);
    expect(camera.position.y).toBeGreaterThan(18);

    // Eğim açısı ~50° civarındadır (pitch angle)
    const deltaZ = camera.position.z - vehicle.position.z;
    const deltaY = camera.position.y;
    const pitchDeg = (Math.atan2(deltaY, deltaZ) * 180) / Math.PI;
    expect(pitchDeg).toBeGreaterThan(45);
    expect(pitchDeg).toBeLessThan(58);
  });

  it("smoothly tracks vehicle position as it drives through the city", () => {
    const rig = createCameraRig();
    const camera = mockCamera();
    const vehicle = mockVehicle({ position: { x: 0, z: 0 }, velocity: { x: 10, z: 10 } });

    rig.reset(vehicle.position);

    // Araç X: 40, Z: 50 konumuna ilerliyor
    vehicle.position = { x: 40, z: 50 };
    for (let i = 0; i < 40; i++) {
      rig.update(camera, vehicle, 0.05);
    }

    // Kamera konumu aracı merkeze alacak şekilde takip etmiştir
    expect(camera.position.x).toBeGreaterThan(35);
    expect(camera.position.z).toBeGreaterThan(50);
  });

  it("increases FOV with speed while remaining bounded", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    // Düşük hız
    const slowVehicle = mockVehicle({ velocity: { x: 0, z: 1 } });
    rig.reset(slowVehicle.position);
    for (let i = 0; i < 20; i++) rig.update(camera, slowVehicle, 0.05);
    const lowFov = camera.fov;
    expect(lowFov).toBeCloseTo(40, 0);

    // Yüksek nitro hız (20 birim/sn)
    const fastVehicle = mockVehicle({ velocity: { x: 0, z: 20 } });
    for (let i = 0; i < 30; i++) rig.update(camera, fastVehicle, 0.05);
    const highFov = camera.fov;

    expect(highFov).toBeGreaterThan(lowFov + 4);
    expect(highFov).toBeLessThanOrEqual(49);
    expect(highFov).toBeGreaterThanOrEqual(46);
  });

  it("generates offset when shake > 0", () => {
    const rigA = createCameraRig();
    const rigB = createCameraRig();
    const cameraA = mockCamera();
    const cameraB = mockCamera();
    const vehicle = mockVehicle({ position: { x: 10, z: 10 } });

    rigA.reset(vehicle.position);
    rigB.reset(vehicle.position);

    // Biri sarsıntısız, biri sarsıntılı
    rigA.update(cameraA, vehicle, 0.016, vehicle.velocity, 0);
    rigB.update(cameraB, vehicle, 0.016, vehicle.velocity, 1.0);

    const distDiff = cameraA.position.distanceTo(cameraB.position);
    expect(distDiff).toBeGreaterThan(0.01);
  });

  it("adjusts camera height and lookAt when vehicle jumps (altitude > 0)", () => {
    const rig = createCameraRig();
    const camera = mockCamera();

    const groundVehicle = mockVehicle({ altitude: 0 });
    rig.reset(groundVehicle.position);
    for (let i = 0; i < 15; i++) rig.update(camera, groundVehicle, 0.05);
    const groundHeight = camera.position.y;

    const jumpingVehicle = mockVehicle({ altitude: 4.0, airborne: true });
    for (let i = 0; i < 20; i++) rig.update(camera, jumpingVehicle, 0.05);
    const jumpHeight = camera.position.y;

    expect(jumpHeight).toBeGreaterThan(groundHeight + 1.5);
  });
});
