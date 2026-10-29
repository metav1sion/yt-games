import { describe, it, expect } from "vitest";
import { createAutoRepairView } from "./auto-repair";
import { createAutoRepairState } from "../game/auto-repair";

describe("Sanayi Auto Repair Workshop 3D View (T46)", () => {
  it("creates auto repair 3D group and structures", () => {
    const view = createAutoRepairView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("auto-repair-view");
    expect(view.group.children.length).toBeGreaterThan(10);
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
  });

  it("updates hydraulic lift height and NPC animations during loop tick", () => {
    const view = createAutoRepairView();
    const state = createAutoRepairState();

    expect(() => {
      view.update(0.016, state, { x: 78.0, z: -57.5 }, false);
      view.update(0.016, state, { x: 78.0, z: -57.5 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk interactions within range", () => {
    const view = createAutoRepairView();

    // Far honk
    const farHonk = view.onPlayerHonk({ x: 0, z: 0 });
    expect(farHonk).toBe(false);

    // Near honk
    const nearHonk = view.onPlayerHonk({ x: 76.0, z: -56.5 });
    expect(nearHonk).toBe(true);

    view.dispose();
  });
});
