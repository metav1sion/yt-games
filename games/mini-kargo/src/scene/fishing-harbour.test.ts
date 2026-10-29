import { describe, it, expect } from "vitest";
import { createFishingHarbourView } from "./fishing-harbour";
import { createFishingHarbourState } from "../game/fishing-harbour";

describe("Fishing Harbour 3D Scene View", () => {
  it("creates scene group with obstacles, fish-boat, trawlers and seagulls", () => {
    const view = createFishingHarbourView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("fishing-harbour");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Obstacles cover the fish boat and trawlers
    expect(view.obstacles.some((o) => o.minZ > 85)).toBe(true);

    view.dispose();
  });

  it("updates animations without throwing errors", () => {
    const view = createFishingHarbourView();
    const state = createFishingHarbourState();

    expect(() => {
      view.update(0.016, state, { x: -78, z: 83.5 }, false);
      view.update(0.016, state, { x: -74, z: 90 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk with waving reaction", () => {
    const view = createFishingHarbourView();
    const far = { x: 0, z: 0 };
    const near = { x: -78, z: 83.5 };

    expect(view.onPlayerHonk(far)).toBe(false);
    expect(view.onPlayerHonk(near)).toBe(true);

    view.dispose();
  });
});
