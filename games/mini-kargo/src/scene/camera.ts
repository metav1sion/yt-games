import * as THREE from "three";
import type { Vec2, VehicleState } from "../game/types";

export type CameraRigOptions = {
  baseFov?: number;
  maxFovBoost?: number;
  baseDistance?: number;
  baseHeight?: number;
  angleLagRate?: number;
  lookAheadDist?: number;
  positionLagRate?: number;
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

/**
 * En kısa yönlü açı farkını [-PI, PI] aralığında hesaplar.
 */
function shortestAngleDiff(target: number, current: number): number {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

export function createCameraRig(options: CameraRigOptions = {}): CameraRig {
  const baseFov = options.baseFov ?? 40;
  const maxFovBoost = options.maxFovBoost ?? 8.5;
  const angleLagRate = options.angleLagRate ?? 3.4;
  const positionLagRate = options.positionLagRate ?? 6.0;

  let currentAngle: number | null = null;
  let currentFov = baseFov;
  let currentCameraPos = new THREE.Vector3();
  let currentLookAt = new THREE.Vector3();
  let initialized = false;

  function reset(position: Vec2, heading = Math.PI / 2) {
    currentAngle = heading;
    currentFov = baseFov;
    const baseDist = 19;
    const baseHeight = 24;
    currentCameraPos.set(
      position.x - Math.sin(heading) * baseDist,
      baseHeight,
      position.z - Math.cos(heading) * baseDist,
    );
    currentLookAt.set(
      position.x + Math.sin(heading) * 2,
      0.8,
      position.z + Math.cos(heading) * 2,
    );
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
    const vehicleHeading = isVehicleState ? target.heading : undefined;
    const velocity = isVehicleState
      ? target.velocity
      : velocityArg ?? { x: 0, z: 0 };

    if (!initialized) {
      reset(position, vehicleHeading ?? Math.PI / 2);
    }

    const safeDt = Math.min(0.1, Math.max(0.001, dt));
    const speed = Math.hypot(velocity.x, velocity.z);
    const speedNorm = Math.min(1, speed / 20); // 20 birim/sn nitro maksimumu

    // 1. Hedef Kamera Açısı ve Geri Vites Koruması
    // Araç ileri giderken aracın yönünü (heading) veya hareket yönünü takip et.
    // Geri giderken kamera aniden 180° dönmemeli; mevcut açıyı korumalıdır.
    let targetAngle = currentAngle!;

    if (vehicleHeading !== undefined) {
      const forwardX = Math.sin(vehicleHeading);
      const forwardZ = Math.cos(vehicleHeading);
      const forwardSpeed = velocity.x * forwardX + velocity.z * forwardZ;

      if (forwardSpeed < -0.4 && speed > 0.8) {
        // Geri viteste sürüş: Mevcut kamera açısını koru, 180° ters dönme
        targetAngle = currentAngle!;
      } else {
        // Normal veya durma hali: Arabanın burnuna göre arkasında kal
        targetAngle = vehicleHeading;
      }
    } else if (speed > 0.5) {
      // Sadece Vec2 verildiyse hareket yönünü takip et
      targetAngle = Math.atan2(velocity.x, velocity.z);
    }

    // Yumuşak açı sönümlemesi (heading lag)
    const angleDiff = shortestAngleDiff(targetAngle, currentAngle!);
    currentAngle = currentAngle! + angleDiff * (1 - Math.exp(-angleLagRate * safeDt));

    // 2. Dinamik FOV
    const targetFov = baseFov + speedNorm * maxFovBoost;
    currentFov += (targetFov - currentFov) * (1 - Math.exp(-4 * safeDt));
    if (Math.abs(camera.fov - currentFov) > 0.01) {
      camera.fov = currentFov;
      camera.updateProjectionMatrix();
    }

    // 3. Mesafe ve Yükseklik (Mobil ve Hıza Duyarlı)
    const isPortrait = camera.aspect < 0.8;
    const baseDist = (isPortrait ? 24 : 19) * (1 + speedNorm * 0.16);
    const baseHeight = (isPortrait ? 29 : 24) * (1 + speedNorm * 0.14);

    // 4. Hedef Kamera Pozisyonu (Arabanın Arkası ve Yukarısı)
    const idealPosX = position.x - Math.sin(currentAngle) * baseDist;
    const idealPosZ = position.z - Math.cos(currentAngle) * baseDist;
    const idealPosY = baseHeight;

    const targetPos = new THREE.Vector3(idealPosX, idealPosY, idealPosZ);
    currentCameraPos.lerp(targetPos, 1 - Math.exp(-positionLagRate * safeDt));

    // 5. İleri Bakış (Look-ahead)
    const lookAheadDist = 1.5 + speedNorm * 3.0;
    const idealLookAtX = position.x + Math.sin(currentAngle) * lookAheadDist;
    const idealLookAtZ = position.z + Math.cos(currentAngle) * lookAheadDist;
    const idealLookAtY = 0.8;

    const targetLook = new THREE.Vector3(idealLookAtX, idealLookAtY, idealLookAtZ);
    currentLookAt.lerp(targetLook, 1 - Math.exp(-8 * safeDt));

    // 6. Çarpışma Sarsıntısı (Shake)
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
        angle: currentAngle ?? Math.PI / 2,
        fov: currentFov,
        position: currentCameraPos.clone(),
      };
    },
  };
}

// Varsayılan global rig instance (geriye dönük doğrudan fonksiyon çağrıları için)
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
