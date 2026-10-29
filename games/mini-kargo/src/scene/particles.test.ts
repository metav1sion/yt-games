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

  it("spawns landing dust when vehicle touches ground after stunt jump", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnLandingDust({ x: 50, z: -38 }, 12);
      for (let i = 0; i < 15; i++) {
        particles.update(dummyState, false, 0.05);
      }
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns puddle water splash spray particles when vehicle splashes through wet roads", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnPuddleSplash({ x: -58, z: -31 }, 8.5, 0.5);
      for (let i = 0; i < 15; i++) {
        particles.update(dummyState, false, 0.04);
      }
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns electric recharge sparks when vehicle is in EV pitstop", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnElectricSparks({ x: -66.5, z: -25.5 }, 16);
      for (let i = 0; i < 15; i++) {
        particles.update(dummyState, false, 0.04);
      }
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns wash spray foam and car shine sparkles during and after car wash", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnWashSpray({ x: 58, z: -9 }, 20);
      particles.spawnCarShine({ x: 58, z: -9 }, 4);
      for (let i = 0; i < 20; i++) {
        particles.update(dummyState, false, 0.04);
      }
    }).not.toThrow();

    particles.dispose();
  });

  it("spawns construction dust and coastal water splash particles", () => {
    const scene = new THREE.Scene();
    const particles = createParticles(scene);

    expect(() => {
      particles.spawnConstructionDust({ x: 26, z: -16 }, 8);
      particles.spawnWaterSplash({ x: -48.5, z: 96 }, 10);
      for (let i = 0; i < 15; i++) {
        particles.update(dummyState, false, 0.04);
      }
    }).not.toThrow();

    particles.dispose();
  });
});
