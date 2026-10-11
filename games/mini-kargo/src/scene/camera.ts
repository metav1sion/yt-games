import * as THREE from "three";
import type { Vec2 } from "../game/types";
export function updateCamera(
  camera: THREE.PerspectiveCamera,
  position: Vec2,
  dt: number,
) {
  const distance = camera.aspect < 0.8 ? 32 : 27;
  const target = new THREE.Vector3(
    THREE.MathUtils.clamp(position.x, -18, 18),
    distance,
    THREE.MathUtils.clamp(position.z, -15, 15) + distance * 0.78,
  );
  camera.position.lerp(target, 1 - Math.exp(-5 * dt));
  camera.lookAt(camera.position.x, 0, camera.position.z - distance * 0.78);
}
