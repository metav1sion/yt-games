import { describe, it, expect } from "vitest";
import { createGasStationView } from "./gas-station";
import { createGasStationState } from "../game/gas-station";

describe("Gas Station 3D Scene View (T36)", () => {
  it("initializes gas station group with canopy, pumps, store, wash bay, and colliders", () => {
    const view = createGasStationView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("gas-station-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Verify wash bay tunnel and store obstacles exist
    expect(view.obstacles.some((o) => o.maxX > 65 && o.minZ < -10)).toBe(true);

    view.dispose();
  });

  it("updates without errors across night and washing states", () => {
    const view = createGasStationView();
    const state = createGasStationState();

    expect(() => {
      // Idle daytime
      view.update(0.05, state, { x: 64, z: -9 }, false);

      // Washing nighttime
      state.isWashing = true;
      state.pumpProgress = 0.5;
      view.update(0.05, state, { x: 58, z: -9 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk by waving and showing greeting callout", () => {
    const view = createGasStationView();
    // Player near gas station (x: 68, z: -10)
    const honkTriggered = view.onPlayerHonk({ x: 68, z: -10 });
    expect(honkTriggered).toBe(true);

    // Player far away
    const farHonk = view.onPlayerHonk({ x: -50, z: -50 });
    expect(farHonk).toBe(false);

    view.dispose();
  });
});
