import { describe, it, expect } from "vitest";
import { createPostOfficeView } from "./post-office";
import { createPostOfficeState, KEMAL_POS } from "../game/post-office";

describe("Post Office 3D Scene View", () => {
  it("creates post office scene hierarchy with neoclassical building, signs, mopeds, and obstacles", () => {
    const view = createPostOfficeView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("post-office-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(obs.maxX);
    expect(obs.minZ).toBeLessThan(obs.maxZ);
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createPostOfficeView();
    const state = createPostOfficeState();

    // Day update
    expect(() => {
      view.update(0.016, state, { x: KEMAL_POS.x + 5, z: KEMAL_POS.z + 5 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range", () => {
    const view = createPostOfficeView();
    const near = { x: KEMAL_POS.x + 2, z: KEMAL_POS.z + 2 };
    const far = { x: KEMAL_POS.x + 50, z: KEMAL_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly", () => {
    const view = createPostOfficeView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
