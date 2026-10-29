import { describe, it, expect } from "vitest";
import { createSeasideLifeView } from "./seaside-life";
import { TEA_CAFE_CENTER } from "../game/seaside-life";

describe("seaside life 3d view", () => {
  it("creates seaside life group and obstacles correctly", () => {
    const view = createSeasideLifeView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("seaside-life");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(TEA_CAFE_CENTER.x);
    expect(obs.maxX).toBeLessThan(TEA_CAFE_CENTER.x);
    expect(obs.minZ).toBeGreaterThan(TEA_CAFE_CENTER.z);
  });

  it("updates boat bobbing, character animations and speech bubbles without error", () => {
    const view = createSeasideLifeView();

    expect(() => {
      // Çaycı konuşuyor, balıkçı suskun
      view.update(0.05, "Çay taze demlendi!", null, false);
      // Balıkçı konuşuyor
      view.update(0.05, null, "Rastgele evlat!", true);
      // İkisi de suskun
      view.update(0.05, null, null, false);
    }).not.toThrow();
  });
});
