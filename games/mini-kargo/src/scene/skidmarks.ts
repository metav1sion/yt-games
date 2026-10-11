import * as THREE from "three";
import type { VehicleState } from "../game/types";

export type SkidmarksManager = {
  update(state: VehicleState, dt: number): void;
  reset(): void;
  dispose(): void;
};

const MAX_MARKS = 180; // Dairesel tampon kapasitesi
const MARK_LIFETIME = 4.5; // saniye
const MIN_DISTANCE_SQ = 0.08; // üst üste iz yığılmasını önleyen minimum mesafe karesi

export function createSkidmarks(scene: THREE.Scene): SkidmarksManager {
  const group = new THREE.Group();
  scene.add(group);

  // Zemin üzerinde yatay duran lastik izi segmenti (quad)
  const geometry = new THREE.PlaneGeometry(0.24, 0.45);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshBasicMaterial({
    color: 0x222e2b,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_MARKS);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(mesh);

  // Başlangıçta tüm instance'ları görünmez yap (scale = 0)
  const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < MAX_MARKS; i++) {
    mesh.setMatrixAt(i, zeroMatrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  type MarkData = {
    active: boolean;
    age: number;
    pos: THREE.Vector3;
    rotY: number;
    initialScale: number;
  };

  const marks: MarkData[] = Array.from({ length: MAX_MARKS }, () => ({
    active: false,
    age: 0,
    pos: new THREE.Vector3(),
    rotY: 0,
    initialScale: 1,
  }));

  let head = 0;
  let lastLeftPos = new THREE.Vector3();
  let lastRightPos = new THREE.Vector3();
  let hasLastPos = false;

  const dummy = new THREE.Object3D();

  function spawnMark(pos: THREE.Vector3, heading: number, intensity: number) {
    const mark = marks[head];
    mark.active = true;
    mark.age = 0;
    mark.pos.copy(pos);
    mark.rotY = heading;
    mark.initialScale = Math.min(1.2, 0.6 + intensity * 0.6);

    head = (head + 1) % MAX_MARKS;
  }

  function reset() {
    for (let i = 0; i < MAX_MARKS; i++) {
      marks[i].active = false;
      mesh.setMatrixAt(i, zeroMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    hasLastPos = false;
  }

  return {
    update(state: VehicleState, dt: number) {
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      const isSkidding = state.drifting && speed > 2.0;

      const sinH = Math.sin(state.heading);
      const cosH = Math.cos(state.heading);

      // Arka sol ve sağ tekerlek dünya koordinatları
      // Tekerlek ofsetleri: z = -0.65 (arka), x = +-0.55
      const leftX = state.position.x - 0.65 * sinH - 0.55 * cosH;
      const leftZ = state.position.z - 0.65 * cosH + 0.55 * sinH;

      const rightX = state.position.x - 0.65 * sinH + 0.55 * cosH;
      const rightZ = state.position.z - 0.65 * cosH - 0.55 * sinH;

      const currentLeft = new THREE.Vector3(leftX, 0.022, leftZ);
      const currentRight = new THREE.Vector3(rightX, 0.022, rightZ);

      if (isSkidding) {
        const distL = hasLastPos ? currentLeft.distanceToSquared(lastLeftPos) : 1;
        const distR = hasLastPos ? currentRight.distanceToSquared(lastRightPos) : 1;

        if (distL > MIN_DISTANCE_SQ || distR > MIN_DISTANCE_SQ) {
          const intensity = Math.min(1, speed / 14);
          spawnMark(currentLeft, state.heading, intensity);
          spawnMark(currentRight, state.heading, intensity);

          lastLeftPos.copy(currentLeft);
          lastRightPos.copy(currentRight);
          hasLastPos = true;
        }
      } else {
        hasLastPos = false;
      }

      // Mevcut izleri güncelle ve yaşlandır (fade-out)
      let needsUpdate = false;
      for (let i = 0; i < MAX_MARKS; i++) {
        const mark = marks[i];
        if (!mark.active) continue;

        mark.age += dt;
        if (mark.age >= MARK_LIFETIME) {
          mark.active = false;
          mesh.setMatrixAt(i, zeroMatrix);
          needsUpdate = true;
          continue;
        }

        // Yaşa bağlı olarak küçülerek ve solarak kaybolur
        const lifeFactor = 1 - mark.age / MARK_LIFETIME;
        const scale = mark.initialScale * Math.min(1, lifeFactor * 1.2);

        dummy.position.copy(mark.pos);
        dummy.rotation.set(0, mark.rotY, 0);
        dummy.scale.set(scale, 1, scale);
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);
        needsUpdate = true;
      }

      if (needsUpdate) {
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
    reset,
    dispose() {
      reset();
      scene.remove(group);
      geometry.dispose();
      material.dispose();
      mesh.dispose();
    },
  };
}
