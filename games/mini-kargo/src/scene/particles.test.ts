import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createParticles } from "./particles";
import type { VehicleState } from "../game/types";

describe("particles system", () => {
  const dummyState: VehicleState = {
    position: { x: 0, z: 0 },
    velocity: { x: 5, z: 0 },
    heading: 0,
    steerAngle: 0,
    nitro: 0,
    drifting: false,
    airborne: false,
    altitude: 0,
    verticalVelocity: 0,
  };

  it("initializes without errors and creates scene nodes", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);
    expect(particles).toBeDefined();
    expect(scene.children.length).toBe(1);
    particles.dispose();
    expect(scene.children.length).toBe(0);
  });

  it("spawns money stream particles along a parabolic arc", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    const fromPos = { x: 10, z: 10 };
    const toPos = { x: 15, z: 12 };

    // Para akışı fırlat
    particles.spawnMoneyStream(fromPos, toPos);

    // Güncelleme çağrısı ile partiküller hareket etmeli
    expect(() => {
      particles.update(dummyState, false, 0.05);
      particles.update(dummyState, false, 0.1);
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns confetti particles on buy pad completion", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    const padPos = { x: -60, z: -24 };

    // Konfeti fırlat
    particles.spawnConfetti(padPos);

    // Simülasyonu 1 saniye boyunca adımla
    expect(() => {
      for (let i = 0; i < 20; i++) {
        particles.update(dummyState, false, 0.05);
      }
    }).not.toThrow();

    // Reset çağrıldığında temizlenmeli
    particles.reset();
    particles.dispose();
  });

  it("updates active money and confetti particles over their full lifetime", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    particles.spawnMoneyStream({ x: 0, z: 0 }, { x: 10, z: 10 });
    particles.spawnConfetti({ x: 5, z: 5 });

    // Parçacıklar canlıyken güncelleme
    particles.update(dummyState, false, 0.3);

    // Ömürleri dolduktan sonra temizlenme döngüsü
    particles.update(dummyState, false, 2.5);

    particles.dispose();
  });

  it("handles drift dust and nitro boost update correctly", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    const driftingState: VehicleState = {
      ...dummyState,
      velocity: { x: 10, z: 0 },
      drifting: true,
      airborne: false,
      altitude: 0,
    };

    expect(() => {
      // Drift tozları tetiklensin
      for (let i = 0; i < 5; i++) {
        particles.update(driftingState, false, 0.04);
      }
      // Nitro alevi tetiklensin
      for (let i = 0; i < 5; i++) {
        particles.update(driftingState, true, 0.03);
      }
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns impact sparks and crash smoke on collision and updates without errors", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnImpactSparks({ x: 5, z: -10 });
      particles.spawnCrashSmoke({ x: 5, z: -10 });

      for (let i = 0; i < 10; i++) {
        particles.update(dummyState, false, 0.05);
      }
    }).not.toThrow();

    particles.dispose();
  });
});
