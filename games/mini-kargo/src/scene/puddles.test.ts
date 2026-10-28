import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as THREE from "three";
import { createPuddlesView, CITY_PUDDLES } from "./puddles";

describe("createPuddlesView", () => {
  it("initializes with 12 city road puddles across 4 districts", () => {
    expect(CITY_PUDDLES.length).toBeGreaterThanOrEqual(12);
    const districts = new Set(CITY_PUDDLES.map((p) => p.district));
    expect(districts.has("sunny")).toBe(true);
    expect(districts.has("market")).toBe(true);
    expect(districts.has("industrial")).toBe(true);
    expect(districts.has("coastal")).toBe(true);
  });

  it("remains hidden and transparent when dry (wetness = 0)", () => {
    const puddles = createPuddlesView();
    expect(puddles.group.visible).toBe(false);

    const event = puddles.update(0.1, { x: -58, z: -31 }, 10, 0, 0);
    expect(event.splashed).toBe(false);
    expect(puddles.group.visible).toBe(false);
    puddles.dispose();
  });

  it("becomes visible and ramps opacity during summer rain (wetness > 0.05)", () => {
    const puddles = createPuddlesView();
    for (let i = 0; i < 10; i++) {
      puddles.update(0.1, { x: 0, z: 0 }, 0, 0, 0.8);
    }
    expect(puddles.group.visible).toBe(true);
    puddles.dispose();
  });

  it("triggers splash and hydroplaning when driving through puddle at speed", () => {
    const puddles = createPuddlesView();
    // Islaklığı yükselt
    for (let i = 0; i < 10; i++) {
      puddles.update(0.1, { x: 0, z: 0 }, 0, 0, 0.85);
    }

    // Puddle konumu: sunny_depot_spur (-58, -31)
    const event = puddles.update(0.016, { x: -58, z: -31 }, 7.5, 0, 0.85);
    expect(event.splashed).toBe(true);
    expect(event.hydroplaning).toBe(true);
    expect(event.puddleId).toBe("sunny_depot_spur");

    // Cooldown sırasında anında ikinci sıçrama tetiklenmez
    const rapidFollowup = puddles.update(0.016, { x: -58, z: -31 }, 7.5, 0, 0.85);
    expect(rapidFollowup.splashed).toBe(false);

    puddles.dispose();
  });

  it("checks position splash for external agents (like traffic vehicles)", () => {
    const puddles = createPuddlesView();
    expect(puddles.checkPositionSplash({ x: -58, z: -31 }, 4.0, 0.5)).toBe(true);
    expect(puddles.checkPositionSplash({ x: -58, z: -31 }, 1.0, 0.5)).toBe(false); // çok yavaş
    expect(puddles.checkPositionSplash({ x: -58, z: -31 }, 5.0, 0.05)).toBe(false); // yol kuru
    expect(puddles.checkPositionSplash({ x: 99, z: 99 }, 5.0, 0.8)).toBe(false); // birikinti yok
    puddles.dispose();
  });
});
