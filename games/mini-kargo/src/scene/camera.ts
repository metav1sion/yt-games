import * as THREE from "three";
import type { Vec2 } from "../game/types";
export function updateCamera(
  camera: THREE.PerspectiveCamera,
  position: Vec2,
  dt: number,
  velocity: Vec2 = { x: 0, z: 0 },
  shake = 0,
) {
  const distance = camera.aspect < 0.8 ? 32 : 27;
  const speed = Math.hypot(velocity.x, velocity.z);
  const lookAhead = Math.min(3.5, speed * 0.42);
  const direction =
    speed > 0.05
      ? { x: velocity.x / speed, z: velocity.z / speed }
      : { x: 0, z: 0 };
  const target = new THREE.Vector3(
    THREE.MathUtils.clamp(position.x + direction.x * lookAhead, -18, 18),
    distance,
    THREE.MathUtils.clamp(position.z + direction.z * lookAhead, -15, 15) +
      distance * 0.78,
  );
  camera.position.lerp(target, 1 - Math.exp(-5 * dt));
  if (shake > 0.001) {
    const time = performance.now() * 0.04;
    camera.position.x += Math.sin(time * 1.7) * shake * 0.12;
    camera.position.y += Math.cos(time * 2.1) * shake * 0.08;
  }
  camera.lookAt(camera.position.x, 0, camera.position.z - distance * 0.78);
}
