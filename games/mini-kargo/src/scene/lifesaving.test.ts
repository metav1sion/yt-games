import { describe, it, expect } from "vitest";
import { createLifesavingView } from "./lifesaving";
import { createLifesavingState, SUKRU_KAPTAN_POS, LIFESAVING_BAY } from "../game/lifesaving";

describe("Lifesaving Station 3D Scene View (T61)", () => {
  it("creates LifesavingView with correct group name and meshes", () => {
    const view = createLifesavingView();
    expect(view.group.name).toBe("lifesaving-view");
    expect(view.group.children.length).toBeGreaterThan(0);
    expect(view.obstacles.length).toBeGreaterThan(0);
  });

  it("ensures service bay remains clear of obstacles", () => {
    const view = createLifesavingView();
    const bayX = LIFESAVING_BAY.x;
    const bayZ = LIFESAVING_BAY.z;

    // Service bay at X: -68.0, Z: 80.5 must not collide with any obstacle
    for (const obs of view.obstacles) {
      const collidesWithBay =
        bayX >= obs.minX && bayX <= obs.maxX && bayZ >= obs.minZ && bayZ <= obs.maxZ;
      expect(collidesWithBay).toBe(false);
    }
  });

  it("updates animations without throwing errors", () => {
    const view = createLifesavingView();
    const state = createLifesavingState();

    expect(() => {
      view.update(0.016, state, { x: LIFESAVING_BAY.x, z: LIFESAVING_BAY.z }, false);
    }).not.toThrow();

    expect(() => {
      view.update(0.016, state, { x: 0, z: 0 }, true);
    }).not.toThrow();
  });

  it("handles player honk interaction within range", () => {
    const view = createLifesavingView();
    const closePos = { x: SUKRU_KAPTAN_POS.x, z: SUKRU_KAPTAN_POS.z };
    const farPos = { x: 100, z: -100 };

    expect(view.onPlayerHonk(closePos)).toBe(true);
    expect(view.onPlayerHonk(farPos)).toBe(false);
  });

  it("disposes resources cleanly", () => {
    const view = createLifesavingView();
    expect(() => view.dispose()).not.toThrow();
  });
});
