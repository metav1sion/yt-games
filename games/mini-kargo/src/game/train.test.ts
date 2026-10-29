import { describe, it, expect } from "vitest";
import {
  createTrainState,
  updateTrain,
  triggerTrainHonk,
  TRAIN_LINE_Z,
  TRAIN_MIN_X,
  TRAIN_MAX_X,
  TRAIN_CROSSING_X,
  TRAIN_SIDING_POS,
  TRAIN_CRUISE_SPEED,
  GATE_OPEN_ANGLE,
  GATE_CLOSED_ANGLE,
} from "./train";

describe("game/train", () => {
  it("initializes with valid default values along Sanayi rail line", () => {
    const state = createTrainState();
    expect(state.position.z).toBe(TRAIN_LINE_Z);
    expect(state.direction).toBe(1);
    expect(state.speed).toBe(0);
    expect(state.targetSpeed).toBe(TRAIN_CRUISE_SPEED);
    expect(state.phase).toBe("cruising");
    expect(state.gateAngle).toBeCloseTo(GATE_OPEN_ANGLE, 0.01);
    expect(state.crossingActive).toBe(false);
  });

  it("accelerates toward cruise speed when cruising", () => {
    const state = createTrainState();
    const event1 = updateTrain(state, 1.0, { x: 0, z: 0 }, 0);
    expect(state.speed).toBeGreaterThan(0);
    expect(event1.crossingActive).toBe(false);

    updateTrain(state, 2.5, { x: 0, z: 0 }, 0);
    expect(state.speed).toBeCloseTo(TRAIN_CRUISE_SPEED, 0.5);
  });

  it("activates level crossing, lowers gates and dings bells near X = 50 boulevard", () => {
    const state = createTrainState();
    state.position.x = TRAIN_CROSSING_X - 10.0; // 40.0 -> approaching crossing
    state.speed = TRAIN_CRUISE_SPEED;

    const event = updateTrain(state, 0.1, { x: 0, z: 0 }, 0);
    expect(state.crossingActive).toBe(true);
    expect(event.crossingActive).toBe(true);
    expect(state.gateAngle).toBeLessThan(GATE_OPEN_ANGLE);

    // Let gates close fully
    updateTrain(state, 1.5, { x: 0, z: 0 }, 0);
    expect(state.gateAngle).toBe(GATE_CLOSED_ANGLE);

    // Once train clears crossing (e.g. at X = 75), gates open back up
    state.position.x = 75.0;
    const clearedEvent = updateTrain(state, 0.1, { x: 0, z: 0 }, 0);
    expect(clearedEvent.crossingActive).toBe(false);

    updateTrain(state, 2.0, { x: 0, z: 0 }, 0);
    expect(state.gateAngle).toBeCloseTo(GATE_OPEN_ANGLE, 0.05);
  });

  it("decelerates at terminus, dwells, sounds departure horn, and reverses direction", () => {
    const state = createTrainState();
    state.position.x = TRAIN_MAX_X - 0.1;
    state.direction = 1;

    const ev1 = updateTrain(state, 0.5, { x: 0, z: 0 }, 0);
    expect(state.position.x).toBe(TRAIN_MAX_X);
    expect(state.speed).toBe(0);
    expect(state.phase).toBe("dwelling");
    expect(ev1.hornBlown).toBe(true);

    // Dwell for 5.0 seconds (exceeding TRAIN_TERMINUS_DWELL 4.5s)
    const ev2 = updateTrain(state, 5.0, { x: 0, z: 0 }, 0);
    expect(state.direction).toBe(-1);
    expect(state.phase).toBe("cruising");
    expect(ev2.hornBlown).toBe(true);
  });

  it("yields and brakes if player vehicle blocks the tracks ahead", () => {
    const state = createTrainState();
    state.position.x = 30.0;
    state.direction = 1;
    state.speed = 3.0;

    // Player blocks tracks at X: 35, Z: -38
    const event = updateTrain(state, 0.2, { x: 35.0, z: TRAIN_LINE_Z }, 0);
    expect(state.phase).toBe("yielding");
    expect(state.targetSpeed).toBe(0);

    // Player moves out of the way
    updateTrain(state, 0.2, { x: 35.0, z: -25.0 }, 0);
    expect(state.phase).toBe("cruising");
    expect(state.targetSpeed).toBe(TRAIN_CRUISE_SPEED);
  });

  it("greets player and blows locomotive horn when player honks nearby", () => {
    const state = createTrainState();
    state.position.x = 45.0;

    const greetedFar = triggerTrainHonk(state, { x: 0.0, z: 0.0 });
    expect(greetedFar).toBe(false);

    const greetedNear = triggerTrainHonk(state, { x: 48.0, z: -36.0 });
    expect(greetedNear).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(state.lastHonkCallout).toBeDefined();

    const event = updateTrain(state, 0.1, { x: 48.0, z: -36.0 }, 0);
    expect(event.hornBlown).toBe(true);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toContain("Makinist Cemal");
  });

  it("awards Sanayi Demiryolu Lojistik bonus upon lingering near siding loading platform", () => {
    const state = createTrainState();
    // Lingering for 1.5s near siding platform
    const ev1 = updateTrain(state, 0.5, TRAIN_SIDING_POS, 0.5);
    expect(ev1.awardedLogisticsBonus).toBe(false);

    const ev2 = updateTrain(state, 0.8, TRAIN_SIDING_POS, 0.5);
    expect(ev2.awardedLogisticsBonus).toBe(true);
    expect(ev2.cashBonus).toBe(15);
    expect(ev2.repBonus).toBe(1);
    expect(ev2.hornBlown).toBe(true);
    expect(state.cooldownTimer).toBe(35.0);

    // Should not re-award immediately due to cooldown
    const ev3 = updateTrain(state, 1.5, TRAIN_SIDING_POS, 0.5);
    expect(ev3.awardedLogisticsBonus).toBe(false);
  });
});
