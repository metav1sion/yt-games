import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createProps, type PropDef } from "../scene/props";
import type { VehicleState } from "./types";

const mockCar = (overrides: Partial<VehicleState> = {}): VehicleState => ({
  position: { x: 0, z: 0 },
  velocity: { x: 0, z: 12 },
  heading: 0,
  nitro: 1,
  drifting: false,
  steerAngle: 0,
  altitude: 0,
  verticalVelocity: 0,
  airborne: false,
  ...overrides,
});

describe("destructible and launchable props system", () => {
  it("launches prop with upward and forward impulse when car collides", () => {
    const scene = new THREE.Scene();
    const testDefs: PropDef[] = [
      { kind: "cone", position: { x: 0, z: 0.5 } },
    ];
    const props = createProps(scene, testDefs);
    const car = mockCar({
      position: { x: 0, z: 0 },
      velocity: { x: 0, z: 12 },
    });

    const initialCarSpeed = Math.hypot(car.velocity.x, car.velocity.z);
    const hit = props.update(1 / 60, car);

    expect(hit).toBe(true);
    const prop = props.props[0];
    expect(prop.hit).toBe(true);

    // Obje havaya doğru fırlar (vel.y >= 4)
    expect(prop.vel.y).toBeGreaterThanOrEqual(4.0);

    // Obje arabanın çarpma yönünde (Z ekseninde) hız kazanır
    expect(prop.vel.z).toBeGreaterThan(5.0);

    // Obje dönme/takla açısı hızı kazanır
    expect(
      Math.abs(prop.angVel.x) + Math.abs(prop.angVel.y) + Math.abs(prop.angVel.z),
    ).toBeGreaterThan(0);

    // Araba duvara çarpmış gibi durmaz! Sadece hafifçe yavaşlar (~%5-10)
    const afterCarSpeed = Math.hypot(car.velocity.x, car.velocity.z);
    expect(afterCarSpeed).toBeGreaterThan(initialCarSpeed * 0.85);
    expect(afterCarSpeed).toBeLessThan(initialCarSpeed);
  });

  it("does not collide with props when car flies high above them", () => {
    const scene = new THREE.Scene();
    const testDefs: PropDef[] = [
      { kind: "box", position: { x: 0, z: 0 } },
    ];
    const props = createProps(scene, testDefs);
    const highCar = mockCar({
      position: { x: 0, z: 0 },
      velocity: { x: 0, z: 14 },
      altitude: 3.5, // Araç kutunun üstünden uçuyor
      airborne: true,
    });

    const hit = props.update(1 / 60, highCar);
    expect(hit).toBe(false);
    expect(props.props[0].hit).toBe(false);
  });

  it("updates flying prop physics with gravity and bounce", () => {
    const scene = new THREE.Scene();
    const testDefs: PropDef[] = [
      { kind: "trash", position: { x: 0, z: 0 } },
    ];
    const props = createProps(scene, testDefs);
    const car = mockCar({ position: { x: 0, z: 0 }, velocity: { x: 0, z: 10 } });

    props.update(1 / 60, car);
    const prop = props.props[0];
    expect(prop.hit).toBe(true);

    // Simüle et ve yerçekimi ile hareket ettiğini doğrula
    for (let i = 0; i < 40; i++) {
      props.update(1 / 60, mockCar({ position: { x: 100, z: 100 } }));
    }

    // Pozisyon değişmiş olmalı
    expect(prop.pos.z).toBeGreaterThan(prop.initialPos.z);
  });

  it("resets props back to original positions on reset()", () => {
    const scene = new THREE.Scene();
    const testDefs: PropDef[] = [
      { kind: "cone", position: { x: 10, z: 20 } },
    ];
    const props = createProps(scene, testDefs);
    const car = mockCar({ position: { x: 10, z: 19.8 }, velocity: { x: 0, z: 10 } });

    props.update(1 / 60, car);
    expect(props.props[0].hit).toBe(true);

    props.reset();
    expect(props.props[0].hit).toBe(false);
    expect(props.props[0].pos.x).toBe(10);
    expect(props.props[0].pos.z).toBe(20);
    expect(props.props[0].vel.length()).toBe(0);
  });
});
