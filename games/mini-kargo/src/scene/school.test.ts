import { describe, it, expect } from "vitest";
import { createSchoolView } from "./school";
import { createSchoolState } from "../game/school";

describe("School View (Güneş Mahallesi Tarihi Taş Mektep & Mahalle Okulu - T51)", () => {
  it("creates school 3D view with meshes and obstacles", () => {
    const view = createSchoolView();
    expect(view.group).toBeDefined();
    expect(view.obstacles.length).toBeGreaterThan(0);
    expect(view.group.children.length).toBeGreaterThan(5);

    // Obstacle should cover the main stone school building
    const bldgObs = view.obstacles[0];
    expect(bldgObs.minX).toBeLessThan(-35);
    expect(bldgObs.maxX).toBeGreaterThan(-35);
    expect(bldgObs.minZ).toBeLessThan(-36);
    expect(bldgObs.maxZ).toBeGreaterThan(-36);

    view.dispose();
  });

  it("updates animations without throwing errors", () => {
    const view = createSchoolView();
    const state = createSchoolState();

    expect(() => {
      view.update(0.1, state, { x: -35, z: -46.5 }, false);
      view.update(0.1, state, { x: -37.2, z: -46.5 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk in proximity", () => {
    const view = createSchoolView();
    expect(view.onPlayerHonk({ x: -37.2, z: -46.5 })).toBe(true);
    expect(view.onPlayerHonk({ x: 100, z: 100 })).toBe(false);

    view.dispose();
  });

  it("cleans up resources on dispose", () => {
    const view = createSchoolView();
    expect(() => view.dispose()).not.toThrow();
  });
});
