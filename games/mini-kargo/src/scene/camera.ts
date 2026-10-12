import * as THREE from "three";
import type { Vec2, VehicleState } from "../game/types";

export type CameraRigOptions = {
  fixedAngle?: number; // Sabit dünya açısı (varsayılan Math.PI: güneyden kuzeye bakış)
  baseFov?: number;
  maxFovBoost?: number;
  baseDistance?: number;
  baseHeight?: number;
  positionLagRate?: number;
  lookAheadLagRate?: number;
};

export type CameraRig = {
  update(
    camera: THREE.PerspectiveCamera,
    target: VehicleState | Vec2,
    dt: number,
    velocity?: Vec2,
    shake?: number,
  ): void;
  reset(position: Vec2, heading?: number): void;
  getState(): { angle: number; fov: number; position: THREE.Vector3 };
};

export function createCameraRig(options: CameraRigOptions = {}): CameraRig {
  // Sabit dünya açısı: Math.PI güneyden kuzeye doğru bakar.
  // Kamera araba döndükçe asla kendi etrafında dönmez; sıfır baş dönmesi!
  const fixedAngle = options.fixedAngle ?? Math.PI;
  const baseFov = options.baseFov ?? 40;
  const maxFovBoost = options.maxFovBoost ?? 8.5;
  const positionLagRate = options.positionLagRate ?? 6.0;
  const lookAheadLagRate = options.lookAheadLagRate ?? 7.5;

  let currentFov = baseFov;
  const currentCameraPos = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();
  let initialized = false;

  function reset(position: Vec2, _heading?: number) {
    currentFov = baseFov;
    // Yukarıdan ~50° açıyla izometrik perspektif (tan 50.7° ≈ 22 / 18)
    const baseDist = 18;
    const baseHeight = 22;

    const startX = position.x - Math.sin(fixedAngle) * baseDist;
    const startZ = position.z - Math.cos(fixedAngle) * baseDist;
    currentCameraPos.set(startX, baseHeight, startZ);
    currentLookAt.set(position.x, 0.8, position.z);
    initialized = true;
  }

  function update(
    camera: THREE.PerspectiveCamera,
    target: VehicleState | Vec2,
    dt: number,
    velocityArg?: Vec2,
    shake = 0,
  ) {
    const isVehicleState = "heading" in target;
    const position = isVehicleState ? target.position : target;
    const velocity = isVehicleState
      ? target.velocity
      : velocityArg ?? { x: 0, z: 0 };
    const altitude = isVehicleState ? target.altitude ?? 0 : 0;

    if (!initialized) {
      reset(position);
    }

    const safeDt = Math.min(0.1, Math.max(0.001, dt));
    const speed = Math.hypot(velocity.x, velocity.z);
    const speedNorm = Math.min(1, speed / 20); // 20 birim/sn nitro maksimumu

    // 1. Dinamik FOV (Hız arttıkça hafif genişler)
    const targetFov = baseFov + speedNorm * maxFovBoost;
    currentFov += (targetFov - currentFov) * (1 - Math.exp(-4 * safeDt));
    if (Math.abs(camera.fov - currentFov) > 0.01) {
      camera.fov = currentFov;
      camera.updateProjectionMatrix();
    }

    // 2. Mesafe ve Yükseklik (Mobil ve Hıza Duyarlı, ~50° Açı)
    const isPortrait = camera.aspect < 0.8;
    const distMultiplier = 1 + speedNorm * 0.12;
    const baseDist = (isPortrait ? 22 : 18) * distMultiplier;
    const baseHeight =
      (isPortrait ? 27 : 22) * distMultiplier + altitude * 0.6;

    // 3. Hız Yönüne Yumuşak Bakış (Look-ahead)
    // Kamera dönmez, ancak arabanın hız vektörüne göre hafifçe önüne bakar
    const lookAheadX = velocity.x * (0.12 + speedNorm * 0.08);
    const lookAheadZ = velocity.z * (0.12 + speedNorm * 0.08);

    const idealLookAtX = position.x + lookAheadX;
    const idealLookAtY = 0.8 + altitude;
    const idealLookAtZ = position.z + lookAheadZ;

    const targetLook = new THREE.Vector3(
      idealLookAtX,
      idealLookAtY,
      idealLookAtZ,
    );
    currentLookAt.lerp(targetLook, 1 - Math.exp(-lookAheadLagRate * safeDt));

    // 4. Sabit Açılı Kamera Pozisyonu (Yumuşak Takip)
    // Açısı SABİTTİR. Sadece arabanın konumunu yumuşakça takip eder.
    const leadX = velocity.x * 0.05;
    const leadZ = velocity.z * 0.05;
    const idealPosX = position.x - Math.sin(fixedAngle) * baseDist + leadX;
    const idealPosZ = position.z - Math.cos(fixedAngle) * baseDist + leadZ;
    const idealPosY = baseHeight;

    const targetPos = new THREE.Vector3(idealPosX, idealPosY, idealPosZ);
    currentCameraPos.lerp(targetPos, 1 - Math.exp(-positionLagRate * safeDt));

    // 5. Çarpışma Sarsıntısı (Shake)
    let finalCamX = currentCameraPos.x;
    let finalCamY = currentCameraPos.y;
    let finalCamZ = currentCameraPos.z;

    if (shake > 0.001) {
      const time = performance.now() * 0.04;
      finalCamX += Math.sin(time * 1.7) * shake * 0.16;
      finalCamY += Math.cos(time * 2.1) * shake * 0.12;
      finalCamZ += Math.cos(time * 1.5) * shake * 0.16;
    }

    camera.position.set(finalCamX, finalCamY, finalCamZ);
    camera.lookAt(currentLookAt);
  }

  return {
    update,
    reset,
    getState() {
      return {
        angle: fixedAngle,
        fov: currentFov,
        position: currentCameraPos.clone(),
      };
    },
  };
}

// Varsayılan global rig instance
const globalCameraRig = createCameraRig();

export function updateCamera(
  camera: THREE.PerspectiveCamera,
  target: VehicleState | Vec2,
  dt: number,
  velocity: Vec2 = { x: 0, z: 0 },
  shake = 0,
) {
  globalCameraRig.update(camera, target, dt, velocity, shake);
}

export function resetCamera(position: Vec2, heading?: number) {
  globalCameraRig.reset(position, heading);
}
