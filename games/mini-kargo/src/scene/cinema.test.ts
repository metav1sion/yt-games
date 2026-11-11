import { describe, it, expect } from "vitest";
import { createCinemaView } from "./cinema";
import { createCinemaState, RIFAT_POS } from "../game/cinema";

describe("Cinema 3D Scene View", () => {
  it("creates cinema scene hierarchy with authentic outdoor screen, booth and obstacles", () => {
    const view = createCinemaView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("cinema-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(obs.maxX);
    expect(obs.minZ).toBeLessThan(obs.maxZ);
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createCinemaView();
    const state = createCinemaState();

    // Day update
    expect(() => {
      view.update(0.016, state, { x: RIFAT_POS.x + 5, z: RIFAT_POS.z + 5 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range", () => {
    const view = createCinemaView();
    const near = { x: RIFAT_POS.x + 2, z: RIFAT_POS.z + 2 };
    const far = { x: RIFAT_POS.x + 50, z: RIFAT_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly", () => {
    const view = createCinemaView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
