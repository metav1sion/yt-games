import * as THREE from "three";
import type { VehicleState } from "../game/types";

export type ParticleSystem = {
  update(state: VehicleState, isBoosting: boolean, dt: number): void;
  reset(): void;
  dispose(): void;
};

const MAX_PARTICLES = 90;

type Particle = {
  active: boolean;
  type: "dust" | "nitro";
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxLife: number;
  startScale: number;
  endScale: number;
  color: THREE.Color;
};

export function createParticles(scene: THREE.Scene): ParticleSystem {
  const group = new THREE.Group();
  scene.add(group);

  // Oyunun kutusal low-poly stiline uygun minik küpler
  const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_PARTICLES);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_PARTICLES * 3),
    3,
  );
  group.add(mesh);

  const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    mesh.setMatrixAt(i, zeroMatrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
    active: false,
    type: "dust",
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    age: 0,
    maxLife: 1,
    startScale: 0.2,
    endScale: 0.6,
    color: new THREE.Color(),
  }));

  let head = 0;
  const dummy = new THREE.Object3D();

  const DUST_COLORS = [
    new THREE.Color("#e8e6dc"),
    new THREE.Color("#dedbd0"),
    new THREE.Color("#ccc7b8"),
  ];

  const NITRO_COLORS = [
    new THREE.Color("#3ba4ff"), // Canlı neon mavi
    new THREE.Color("#6bd5ff"), // Açık camgöbeği
    new THREE.Color("#ff9933"), // Ateş turuncusu
    new THREE.Color("#ffdd44"), // Kıvılcım sarısı
  ];

  function spawnDust(x: number, y: number, z: number, forwardX: number, forwardZ: number) {
    const p = particles[head];
    p.active = true;
    p.type = "dust";
    p.pos.set(
      x + (Math.random() - 0.5) * 0.15,
      y + 0.05,
      z + (Math.random() - 0.5) * 0.15,
    );
    // Arabanın hareketinin tersine ve yukarı doğru hafif dağılım
    p.vel.set(
      -forwardX * 0.8 + (Math.random() - 0.5) * 0.6,
      0.4 + Math.random() * 0.4,
      -forwardZ * 0.8 + (Math.random() - 0.5) * 0.6,
    );
    p.age = 0;
    p.maxLife = 0.45 + Math.random() * 0.25;
    p.startScale = 0.2 + Math.random() * 0.1;
    p.endScale = 0.55 + Math.random() * 0.2;
    p.color.copy(DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)]);

    head = (head + 1) % MAX_PARTICLES;
  }

  function spawnNitro(x: number, y: number, z: number, forwardX: number, forwardZ: number) {
    const p = particles[head];
    p.active = true;
    p.type = "nitro";
    p.pos.set(
      x + (Math.random() - 0.5) * 0.12,
      y + 0.15,
      z + (Math.random() - 0.5) * 0.12,
    );
    // Egzozdan arkaya doğru yüksek hızla fırlayan kıvılcımlar
    p.vel.set(
      -forwardX * (4.5 + Math.random() * 2.5) + (Math.random() - 0.5) * 0.8,
      0.1 + Math.random() * 0.3,
      -forwardZ * (4.5 + Math.random() * 2.5) + (Math.random() - 0.5) * 0.8,
    );
    p.age = 0;
    p.maxLife = 0.18 + Math.random() * 0.12;
    p.startScale = 0.3;
    p.endScale = 0.05;
    p.color.copy(NITRO_COLORS[Math.floor(Math.random() * NITRO_COLORS.length)]);

    head = (head + 1) % MAX_PARTICLES;
  }

  function reset() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles[i].active = false;
      mesh.setMatrixAt(i, zeroMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  let dustTimer = 0;
  let nitroTimer = 0;

  return {
    update(state: VehicleState, isBoosting: boolean, dt: number) {
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      const sinH = Math.sin(state.heading);
      const cosH = Math.cos(state.heading);

      // 1. Drift Tozu Üretimi
      if (state.drifting && speed > 2.5) {
        dustTimer += dt;
        if (dustTimer >= 0.035) {
          dustTimer = 0;
          // Sol ve sağ arka tekerlek konumu
          const leftX = state.position.x - 0.65 * sinH - 0.55 * cosH;
          const leftZ = state.position.z - 0.65 * cosH + 0.55 * sinH;
          const rightX = state.position.x - 0.65 * sinH + 0.55 * cosH;
          const rightZ = state.position.z - 0.65 * cosH - 0.55 * sinH;

          spawnDust(leftX, 0.05, leftZ, sinH, cosH);
          spawnDust(rightX, 0.05, rightZ, sinH, cosH);
        }
      } else {
        dustTimer = 0;
      }

      // 2. Nitro Alevi Üretimi
      if (isBoosting && speed > 1.0) {
        nitroTimer += dt;
        if (nitroTimer >= 0.02) {
          nitroTimer = 0;
          // Arka tampon egzoz konumu (orta-arka, z = -1.1)
          const exhaustX = state.position.x - 1.1 * sinH;
          const exhaustZ = state.position.z - 1.1 * cosH;

          spawnNitro(exhaustX, 0.25, exhaustZ, sinH, cosH);
          spawnNitro(exhaustX, 0.25, exhaustZ, sinH, cosH);
        }
      } else {
        nitroTimer = 0;
      }

      // 3. Partikülleri güncelle
      let matrixNeedsUpdate = false;
      let colorNeedsUpdate = false;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (!p.active) continue;

        p.age += dt;
        if (p.age >= p.maxLife) {
          p.active = false;
          mesh.setMatrixAt(i, zeroMatrix);
          matrixNeedsUpdate = true;
          continue;
        }

        const t = p.age / p.maxLife;

        // Pozisyon güncellemesi
        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;
        p.pos.z += p.vel.z * dt;

        // Hava sürtünmesi sönümü
        p.vel.multiplyScalar(Math.exp(-2.5 * dt));

        // Ölçek geçişi (toz büyür, alev küçülür)
        const currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, t);

        dummy.position.copy(p.pos);
        dummy.scale.setScalar(currentScale);
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);
        matrixNeedsUpdate = true;

        if (mesh.instanceColor) {
          mesh.setColorAt(i, p.color);
          colorNeedsUpdate = true;
        }
      }

      if (matrixNeedsUpdate) mesh.instanceMatrix.needsUpdate = true;
      if (colorNeedsUpdate && mesh.instanceColor)
        mesh.instanceColor.needsUpdate = true;
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
