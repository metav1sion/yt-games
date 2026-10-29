import { describe, it, expect } from "vitest";
import { createRestaurantView } from "./restaurant";
import { createRestaurantState } from "../game/restaurant";

describe("Restaurant View (Sanayi Bereket Lokantası - T50)", () => {
  it("creates restaurant 3D view with meshes and obstacles", () => {
    const view = createRestaurantView();
    expect(view.group).toBeDefined();
    expect(view.obstacles.length).toBeGreaterThan(0);
    expect(view.group.children.length).toBeGreaterThan(5);

    // Obstacle should cover the main building
    const bldgObs = view.obstacles[0];
    expect(bldgObs.minX).toBeLessThan(30);
    expect(bldgObs.maxX).toBeGreaterThan(30);
    expect(bldgObs.minZ).toBeLessThan(-57);
    expect(bldgObs.maxZ).toBeGreaterThan(-57);

    view.dispose();
  });

  it("updates animations without throwing errors", () => {
    const view = createRestaurantView();
    const state = createRestaurantState();

    expect(() => {
      view.update(0.1, state, { x: 30, z: -50 }, false);
      view.update(0.1, state, { x: 28, z: -53 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk in proximity", () => {
    const view = createRestaurantView();
    expect(view.onPlayerHonk({ x: 28.5, z: -54.0 })).toBe(true);
    expect(view.onPlayerHonk({ x: -100, z: 100 })).toBe(false);

    view.dispose();
  });

  it("cleans up resources on dispose", () => {
    const view = createRestaurantView();
    expect(() => view.dispose()).not.toThrow();
  });
});
