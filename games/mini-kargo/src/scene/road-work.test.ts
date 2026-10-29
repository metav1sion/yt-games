import { describe, it, expect } from "vitest";
import { createRoadWorkView } from "./road-work";
import { ROAD_WORK_CENTER } from "../game/road-work";

describe("road work 3d view", () => {
  it("creates road work group and obstacles correctly", () => {
    const view = createRoadWorkView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("road-work");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(ROAD_WORK_CENTER.x);
    expect(obs.maxX).toBeGreaterThan(ROAD_WORK_CENTER.x);
  });

  it("updates flasher, animations and speech bubble without error", () => {
    const view = createRoadWorkView();

    expect(() => {
      // Gündüz aktif flaşör
      view.update(0.05, true, "Test speech", false);
      // Gece pasif flaşör
      view.update(0.05, false, null, true);
    }).not.toThrow();
  });
});
