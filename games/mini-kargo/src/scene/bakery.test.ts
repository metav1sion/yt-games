import { describe, it, expect } from "vitest";
import { createBakeryView } from "./bakery";
import { createBakeryState } from "../game/bakery";

describe("Bakery View (Çarşı Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi - T52)", () => {
  it("creates bakery 3D view with meshes and obstacles", () => {
    const view = createBakeryView();
    expect(view.group).toBeDefined();
    expect(view.obstacles.length).toBeGreaterThan(0);
    expect(view.group.children.length).toBeGreaterThan(5);

    // Obstacle should cover the main stone bakery building and dome oven
    const bldgObs = view.obstacles[0];
    expect(bldgObs.minX).toBeLessThan(59.5);
    expect(bldgObs.maxX).toBeGreaterThan(59.5);
    expect(bldgObs.minZ).toBeLessThan(24.5);
    expect(bldgObs.maxZ).toBeGreaterThan(24.5);

    view.dispose();
  });

  it("updates animations without throwing errors", () => {
    const view = createBakeryView();
    const state = createBakeryState();

    expect(() => {
      view.update(0.1, state, { x: 59.5, z: 31.2 }, false);
      view.update(0.1, state, { x: 57.8, z: 28.5 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk in proximity", () => {
    const view = createBakeryView();
    expect(view.onPlayerHonk({ x: 57.8, z: 28.5 })).toBe(true);
    expect(view.onPlayerHonk({ x: 100, z: 100 })).toBe(false);

    view.dispose();
  });

  it("cleans up resources on dispose", () => {
    const view = createBakeryView();
    expect(() => view.dispose()).not.toThrow();
  });
});
