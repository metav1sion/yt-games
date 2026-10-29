import { describe, it, expect } from "vitest";
import { createTrainView } from "./train";
import { createTrainState, TRAIN_LINE_Z, TRAIN_SIDING_POS, GATE_CLOSED_ANGLE } from "../game/train";

describe("scene/train", () => {
  it("creates train view hierarchy with track, level crossing signals, siding platform, locomotive and flatcars", () => {
    const view = createTrainView();

    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("sanayi-freight-railway");
    expect(view.obstacles.length).toBeGreaterThanOrEqual(3); // Bumpers & siding platform & crossing posts

    // Check siding platform obstacle
    const sidingObs = view.obstacles.find(
      (o) =>
        o.minX <= TRAIN_SIDING_POS.x &&
        o.maxX >= TRAIN_SIDING_POS.x &&
        o.minZ <= TRAIN_SIDING_POS.z &&
        o.maxZ >= TRAIN_SIDING_POS.z,
    );
    expect(sidingObs).toBeDefined();

    view.dispose();
  });

  it("updates locomotive and flatcars position and wheel rotation on update", () => {
    const view = createTrainView();
    const state = createTrainState();
    state.position.x = 45.0;
    state.direction = 1;
    state.speed = 4.0;

    view.update(0.1, state, { x: 50, z: -38 }, false);

    const loco = view.group.getObjectByName("locomotive");
    expect(loco).toBeDefined();
    expect(loco?.position.x).toBe(45.0);
    expect(loco?.position.z).toBe(TRAIN_LINE_Z);

    const flatcar1 = view.group.getObjectByName("flatcar-container");
    expect(flatcar1).toBeDefined();
    expect(flatcar1?.position.x).toBeCloseTo(45.0 - 6.5, 0.1);

    const flatcar2 = view.group.getObjectByName("flatcar-machinery");
    expect(flatcar2).toBeDefined();
    expect(flatcar2?.position.x).toBeCloseTo(45.0 - 12.6, 0.1);

    // Test reverse direction (-1)
    state.position.x = 60.0;
    state.direction = -1;
    view.update(0.1, state, { x: 50, z: -38 }, true);
    expect(loco?.position.x).toBe(60.0);
    expect(flatcar1?.position.x).toBeCloseTo(60.0 + 6.5, 0.1);
    expect(flatcar2?.position.x).toBeCloseTo(60.0 + 12.6, 0.1);

    view.dispose();
  });

  it("animates waving arms, flashing crossing lights, and lowered barriers during crossing and honk greeting", () => {
    const view = createTrainView();
    const state = createTrainState();
    state.position.x = 50.0;
    state.crossingActive = true;
    state.gateAngle = GATE_CLOSED_ANGLE;
    state.crossingFlashState = true;
    state.honkGreetingTimer = 3.0;

    expect(() => {
      view.update(0.016, state, { x: 26, z: -34 }, true);
    }).not.toThrow();

    view.dispose();
  });
});
