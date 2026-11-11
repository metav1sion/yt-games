import { describe, it, expect } from "vitest";
import { createHerbalistView } from "./herbalist";
import {
  HERBALIST_CENTER,
  HERBALIST_BAY,
  IDRIS_EFENDI_POS,
  createHerbalistState,
} from "../game/herbalist";

describe("Tarihi Çarşı Aktarı & Şifahanesi View", () => {
  it("creates scene group with obstacles and correct structure", () => {
    const view = createHerbalistView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("herbalist-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Obstacle should cover the shop building
    const shopObs = view.obstacles.find(
      (o) =>
        o.minX <= HERBALIST_CENTER.x &&
        o.maxX >= HERBALIST_CENTER.x &&
        o.minZ <= HERBALIST_CENTER.z &&
        o.maxZ >= HERBALIST_CENTER.z,
    );
    expect(shopObs).toBeDefined();

    // Service bay should not collide with obstacle
    const bayInObs = view.obstacles.some(
      (o) =>
        HERBALIST_BAY.x >= o.minX &&
        HERBALIST_BAY.x <= o.maxX &&
        HERBALIST_BAY.z >= o.minZ &&
        HERBALIST_BAY.z <= o.maxZ,
    );
    expect(bayInObs).toBe(false);

    view.dispose();
  });

  it("updates animations without throwing across day and night modes", () => {
    const view = createHerbalistView();
    const state = createHerbalistState();

    expect(() => {
      view.update(0.016, state, { x: 20, z: 45 }, false);
      view.update(0.016, state, { x: 24, z: 47 }, true);
      view.update(0.016, true);
      view.update(0.016);
    }).not.toThrow();

    view.dispose();
  });

  it("handles player honk when within proximity of Aktar İdris Efendi", () => {
    const view = createHerbalistView();

    // Far honk
    const farResult = view.onPlayerHonk({ x: 99, z: 99 });
    expect(farResult).toBe(false);

    // Near honk
    const nearResult = view.onPlayerHonk({
      x: IDRIS_EFENDI_POS.x + 2,
      z: IDRIS_EFENDI_POS.z + 2,
    });
    expect(nearResult).toBe(true);

    // Update with active greeting
    expect(() => {
      view.update(0.1, undefined, IDRIS_EFENDI_POS, false);
    }).not.toThrow();

    view.dispose();
  });

  it("disposes cleanly without leaks", () => {
    const view = createHerbalistView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
