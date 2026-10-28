import * as THREE from "three";
import type { Vec2, VehicleState } from "../game/types";

export type ParticleSystem = {
  update(state: VehicleState, isBoosting: boolean, dt: number): void;
  reset(): void;
  dispose(): void;
  spawnMoneyStream(fromPos: Vec2, toPos: Vec2): void;
  spawnConfetti(pos: Vec2): void;
  spawnImpactSparks(pos: Vec2 | THREE.Vector3, normal?: Vec2): void;
  spawnCrashSmoke(pos: Vec2 | THREE.Vector3): void;
};

const MAX_PARTICLES = 450;

type ParticleType = "dust" | "nitro" | "money" | "confetti" | "spark" | "smoke";

type Particle = {
  active: boolean;
  type: ParticleType;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  curveHeight: number;
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
    opacity: 0.85,
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
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    curveHeight: 1.0,
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

  const MONEY_COLORS = [
    new THREE.Color("#ffd700"), // Altın sarısı
    new THREE.Color("#ffbe0b"), // Amber altın
    new THREE.Color("#2ecc71"), // Zümrüt yeşili
    new THREE.Color("#10ac84"), // Banknot yeşili
    new THREE.Color("#00e676"), // Parlak açık yeşil
  ];

  const CONFETTI_COLORS = [
    new THREE.Color("#ff2a6d"), // Kırmızı / Pembe
    new THREE.Color("#ff4757"), // Canlı Kırmızı
    new THREE.Color("#05d9e8"), // Mavi / Cyan
    new THREE.Color("#1e90ff"), // Derin Mavi
    new THREE.Color("#fed330"), // Canlı Sarı
    new THREE.Color("#ffd700"), // Altın Sarısı
    new THREE.Color("#2ed573"), // Canlı Yeşil
    new THREE.Color("#10ac84"), // Koyu Yeşil
    new THREE.Color("#a55eea"), // Mor
  ];

  const SPARK_COLORS = [
    new THREE.Color("#ffffff"), // Akkor beyaz
    new THREE.Color("#fff275"), // Parlak sarı
    new THREE.Color("#ff9900"), // Ateş turuncusu
    new THREE.Color("#ff5722"), // Kıvılcım kırmızısı
    new THREE.Color("#ffd600"), // Altın sarısı
  ];

  const SMOKE_COLORS = [
    new THREE.Color("#f8f9fa"), // Beyaz kaza dumanı
    new THREE.Color("#e9ecef"), // Açık gri
    new THREE.Color("#ced4da"), // Gri duman
    new THREE.Color("#6c757d"), // Koyu duman
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

  function spawnMoneyStream(fromPos: Vec2, toPos: Vec2) {
    const burstCount = 2;
    for (let c = 0; c < burstCount; c++) {
      const p = particles[head];
      p.active = true;
      p.type = "money";
      p.age = 0;
      p.maxLife = 0.38 + Math.random() * 0.14;
      p.startScale = 0.2 + Math.random() * 0.05;
      p.endScale = 0.28;

      p.startPos.set(
        fromPos.x + (Math.random() - 0.5) * 0.5,
        0.45 + (Math.random() - 0.5) * 0.1,
        fromPos.z + (Math.random() - 0.5) * 0.5,
      );

      p.targetPos.set(
        toPos.x + (Math.random() - 0.5) * 0.8,
        0.08,
        toPos.z + (Math.random() - 0.5) * 0.8,
      );

      p.curveHeight = 1.3 + Math.random() * 0.7;

      p.pos.copy(p.startPos);
      p.vel.set(0, 0, 0);

      p.color.copy(MONEY_COLORS[Math.floor(Math.random() * MONEY_COLORS.length)]);

      head = (head + 1) % MAX_PARTICLES;
    }
  }

  function spawnConfetti(pos: Vec2) {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const p = particles[head];
      p.active = true;
      p.type = "confetti";
      p.age = 0;
      p.maxLife = 1.4 + Math.random() * 0.8;
      p.startScale = 0.22 + Math.random() * 0.08;
      p.endScale = 0.14;

      p.pos.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        0.2 + Math.random() * 0.2,
        pos.z + (Math.random() - 0.5) * 0.4,
      );

      const angle = Math.random() * Math.PI * 2;
      const speedH = 1.8 + Math.random() * 3.8;
      p.vel.set(
        Math.cos(angle) * speedH,
        5.2 + Math.random() * 4.2,
        Math.sin(angle) * speedH,
      );

      p.color.copy(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]);

      head = (head + 1) % MAX_PARTICLES;
    }
  }

  function spawnImpactSparks(pos: Vec2 | THREE.Vector3, normal?: Vec2) {
    const count = 18; // 15-20 adet parlak kıvılcım
    const px = "x" in pos ? pos.x : 0;
    const py = "y" in pos ? pos.y : 0.45;
    const pz = "z" in pos ? pos.z : 0;

    for (let i = 0; i < count; i++) {
      const p = particles[head];
      p.active = true;
      p.type = "spark";
      p.age = 0;
      p.maxLife = 0.18 + Math.random() * 0.18;
      p.startScale = 0.24 + Math.random() * 0.1;
      p.endScale = 0.04;

      p.pos.set(
        px + (Math.random() - 0.5) * 0.25,
        py + (Math.random() - 0.5) * 0.2,
        pz + (Math.random() - 0.5) * 0.25,
      );

      // Normal yönünde veya dışarıya 360 derece hız
      let angle = Math.random() * Math.PI * 2;
      if (normal && (normal.x !== 0 || normal.z !== 0)) {
        const baseAngle = Math.atan2(normal.z, normal.x);
        angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.9;
      }
      const speedH = 3.5 + Math.random() * 5.0;
      p.vel.set(
        Math.cos(angle) * speedH,
        1.5 + Math.random() * 4.2,
        Math.sin(angle) * speedH,
      );

      p.color.copy(SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]);
      head = (head + 1) % MAX_PARTICLES;
    }
  }

  function spawnCrashSmoke(pos: Vec2 | THREE.Vector3) {
    const count = 9; // 8-12 adet kaza dumanı pufu
    const px = "x" in pos ? pos.x : 0;
    const py = "y" in pos ? pos.y : 0.5;
    const pz = "z" in pos ? pos.z : 0;

    for (let i = 0; i < count; i++) {
      const p = particles[head];
      p.active = true;
      p.type = "smoke";
      p.age = 0;
      p.maxLife = 0.65 + Math.random() * 0.45;
      p.startScale = 0.22 + Math.random() * 0.08;
      p.endScale = 0.85 + Math.random() * 0.25;

      p.pos.set(
        px + (Math.random() - 0.5) * 0.4,
        py + Math.random() * 0.3,
        pz + (Math.random() - 0.5) * 0.4,
      );

      const angle = Math.random() * Math.PI * 2;
      const speedH = 0.4 + Math.random() * 0.9;
      p.vel.set(
        Math.cos(angle) * speedH,
        1.2 + Math.random() * 1.6, // Yavaşça yükselir
        Math.sin(angle) * speedH,
      );

      p.color.copy(SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)]);
      head = (head + 1) % MAX_PARTICLES;
    }
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
      if (!state.airborne && (state.altitude ?? 0) < 0.05 && state.drifting && speed > 2.5) {
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

        const t = Math.min(1, p.age / p.maxLife);
        let currentScale = p.startScale;

        if (p.type === "money") {
          // Kavisli (parabolik yay) hareket
          p.pos.x = THREE.MathUtils.lerp(p.startPos.x, p.targetPos.x, t);
          p.pos.z = THREE.MathUtils.lerp(p.startPos.z, p.targetPos.z, t);
          const arc = 4 * p.curveHeight * t * (1 - t);
          p.pos.y = THREE.MathUtils.lerp(p.startPos.y, p.targetPos.y, t) + arc;

          // Pede yaklaştıkça içeri çekilme / küçülme
          if (t < 0.7) {
            currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, t / 0.7);
          } else {
            currentScale = THREE.MathUtils.lerp(p.endScale, 0.02, (t - 0.7) / 0.3);
          }
        } else if (p.type === "confetti") {
          // Yerçekimi ve süzülme
          p.vel.y -= 7.5 * dt;
          if (p.vel.y < -1.4) {
            p.vel.y = -1.4; // Terminal süzülme hızı
          }
          p.vel.x *= Math.exp(-2.2 * dt);
          p.vel.z *= Math.exp(-2.2 * dt);

          p.pos.x += p.vel.x * dt;
          p.pos.y += p.vel.y * dt;
          p.pos.z += p.vel.z * dt;

          if (p.pos.y < 0.05) {
            p.pos.y = 0.05;
            p.vel.set(0, 0, 0);
          }

          if (t > 0.7) {
            currentScale = THREE.MathUtils.lerp(p.startScale, 0.02, (t - 0.7) / 0.3);
          } else {
            currentScale = p.startScale;
          }
        } else if (p.type === "spark") {
          // Kıvılcım: Yerçekimi ve hızlı küçülme
          p.vel.y -= 14.0 * dt;
          p.vel.x *= Math.exp(-2.5 * dt);
          p.vel.z *= Math.exp(-2.5 * dt);

          p.pos.x += p.vel.x * dt;
          p.pos.y += p.vel.y * dt;
          p.pos.z += p.vel.z * dt;

          if (p.pos.y < 0.04) {
            p.pos.y = 0.04;
            p.vel.set(0, 0, 0);
          }
          currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, t);
        } else if (p.type === "smoke") {
          // Kaza Dumanı: Yavaşça yukarı yükselip genişler
          p.vel.y *= Math.exp(-0.8 * dt);
          p.vel.x *= Math.exp(-1.5 * dt);
          p.vel.z *= Math.exp(-1.5 * dt);

          p.pos.x += p.vel.x * dt;
          p.pos.y += p.vel.y * dt;
          p.pos.z += p.vel.z * dt;

          if (t < 0.75) {
            currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, t / 0.75);
          } else {
            currentScale = THREE.MathUtils.lerp(p.endScale, 0.02, (t - 0.75) / 0.25);
          }
        } else {
          // dust ve nitro
          p.pos.x += p.vel.x * dt;
          p.pos.y += p.vel.y * dt;
          p.pos.z += p.vel.z * dt;
          p.vel.multiplyScalar(Math.exp(-2.5 * dt));
          currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, t);
        }

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
    spawnMoneyStream,
    spawnConfetti,
    spawnImpactSparks,
    spawnCrashSmoke,
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
