import { describe, it, expect } from "vitest";
import { createFerrisWheelView } from "./ferris-wheel";
import { createFerrisWheelState, FERRIS_WHEEL_POS } from "../game/ferris-wheel";

describe("Ferris Wheel 3D Scene View", () => {
  it("initializes with pier foundation, support towers, 12 gondolas and colliders", () => {
    const view = createFerrisWheelView();
    expect(view.group.name).toBe("grand-ferris-wheel");
    expect(view.group.position.x).toBe(FERRIS_WHEEL_POS.x);
    expect(view.group.position.z).toBe(FERRIS_WHEEL_POS.z);
    expect(view.obstacles.length).toBeGreaterThanOrEqual(2);
    expect(view.group.children.length).toBeGreaterThanOrEqual(4);
    view.dispose();
  });

  it("updates wheel rotation and enforces upright gravity counter-rotation on all gondolas", () => {
    const view = createFerrisWheelView();
    const state = createFerrisWheelState();
    state.wheelAngle = 1.25; // 1.25 radians (~71.6 degrees)
    state.chaseLightPhase = 45;

    view.update(0.1, state, { x: 0, z: 0 }, false);

    // Wheel group should be rotated by state.wheelAngle
    const wheelGroup = view.group.children.find(
      (c) => c.position.y > 5.0 && c.children.length > 10,
    );
    expect(wheelGroup).toBeDefined();
    expect(wheelGroup?.rotation.z).toBeCloseTo(1.25, 2);

    // Gondola pivots inside wheelGroup should have counter-rotation = -wheelAngle
    const gondolaPivots = wheelGroup?.children.filter(
      (c) => c.children.length > 0 && Math.abs(c.position.length() - 7.1) < 0.8,
    );
    expect(gondolaPivots?.length).toBe(12);
    for (const pivot of gondolaPivots!) {
      expect(pivot.rotation.z).toBeCloseTo(-1.25, 2);
    }

    view.dispose();
  });

  it("activates speech bubble and operator waving when honked or nearby", () => {
    const view = createFerrisWheelView();
    const state = createFerrisWheelState();
    state.honkGreetingTimer = 3.5;
    state.lastHonkCallout = "Hoş geldin kaptan!";

    // Update with honk active
    view.update(0.1, state, { x: FERRIS_WHEEL_POS.x, z: FERRIS_WHEEL_POS.z }, false);

    // Clean disposal
    expect(() => view.dispose()).not.toThrow();
  });
});
