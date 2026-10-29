import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createCarpenterView } from "./carpenter";
import { CARPENTER_BAY, CARPENTER_CENTER, createCarpenterState, RUSTEM_USTA_POS } from "../game/carpenter";

describe("Carpenter View 3D Scene (T55)", () => {
  it("creates a group with obstacles leaving service bay unobstructed", () => {
    const view = createCarpenterView();
    expect(view.group).toBeInstanceOf(THREE.Group);
    expect(view.group.name).toBe("carpenter-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Verify CARPENTER_BAY is NOT inside any obstacle
    for (const obs of view.obstacles) {
      const inX = CARPENTER_BAY.x >= obs.minX && CARPENTER_BAY.x <= obs.maxX;
      const inZ = CARPENTER_BAY.z >= obs.minZ && CARPENTER_BAY.z <= obs.maxZ;
      expect(inX && inZ).toBe(false);
    }
  });

  it("updates without errors during day and night cycles", () => {
    const view = createCarpenterView();
    const state = createCarpenterState();

    // Day update
    expect(() => {
      view.update(0.1, state, { x: 0, z: 0 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.1, state, RUSTEM_USTA_POS, true);
    }).not.toThrow();
  });

  it("responds to player honk when within 22 meters of Rustem Usta", () => {
    const view = createCarpenterView();
    const reactedClose = view.onPlayerHonk(RUSTEM_USTA_POS);
    expect(reactedClose).toBe(true);

    const reactedFar = view.onPlayerHonk({ x: -100, z: -100 });
    expect(reactedFar).toBe(false);
  });

  it("disposes geometries and materials cleanly", () => {
    const view = createCarpenterView();
    expect(() => view.dispose()).not.toThrow();
  });
});
