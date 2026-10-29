import { describe, it, expect } from "vitest";
import {
  createPitstopState,
  stepPitstop,
  DEFAULT_PITSTOP_PAD,
  SUPERCHARGE_DURATION,
  FULL_CHARGE_TIME,
  MAX_CHARGE_SPEED,
} from "./pitstop";

describe("Pitstop & EV Quick-Charger Mechanics", () => {
  it("initializes with zero progress and inactive supercharge", () => {
    const state = createPitstopState();
    expect(state.chargeProgress).toBe(0);
    expect(state.isCharging).toBe(false);
    expect(state.isSupercharged).toBe(false);
    expect(state.superchargeTimer).toBe(0);
    expect(state.totalChargesCompleted).toBe(0);
  });

  it("does not start charging when vehicle is outside pad radius", () => {
    const state = createPitstopState();
    // Pad is at -66.5, -25.5 with radius 3.2. Let's place vehicle at 0, 0
    const result = stepPitstop(state, { x: 0, z: 0 }, 0, 0.1);
    expect(result.state.isCharging).toBe(false);
    expect(result.state.chargeProgress).toBe(0);
    expect(result.event).toBeUndefined();
  });

  it("does not charge if vehicle is speeding through the pad (> MAX_CHARGE_SPEED)", () => {
    const state = createPitstopState();
    const result = stepPitstop(
      state,
      DEFAULT_PITSTOP_PAD.position,
      MAX_CHARGE_SPEED + 1.0,
      0.1,
    );
    expect(result.state.isCharging).toBe(false);
    expect(result.state.chargeProgress).toBe(0);
    expect(result.event).toBeUndefined();
  });

  it("starts charging and progresses when stopped inside pad", () => {
    let state = createPitstopState();
    const pos = { ...DEFAULT_PITSTOP_PAD.position };

    // Step 1: starts charging
    let result = stepPitstop(state, pos, 0.5, 0.5);
    expect(result.state.isCharging).toBe(true);
    expect(result.state.chargeProgress).toBeCloseTo(0.5 / FULL_CHARGE_TIME);
    expect(result.event).toBe("charge_started");

    // Step 2: continues charging
    state = result.state;
    result = stepPitstop(state, pos, 0.2, 0.5);
    expect(result.state.isCharging).toBe(true);
    expect(result.state.chargeProgress).toBeCloseTo(1.0 / FULL_CHARGE_TIME);
    expect(result.event).toBe("charging");
  });

  it("completes full charge after FULL_CHARGE_TIME and activates supercharge buff", () => {
    let state = createPitstopState();
    const pos = { ...DEFAULT_PITSTOP_PAD.position };

    const result = stepPitstop(state, pos, 0, FULL_CHARGE_TIME + 0.1);
    expect(result.state.chargeProgress).toBe(1.0);
    expect(result.state.isSupercharged).toBe(true);
    expect(result.state.superchargeTimer).toBe(SUPERCHARGE_DURATION);
    expect(result.state.totalChargesCompleted).toBe(1);
    expect(result.event).toBe("charge_completed");
  });

  it("counts down supercharge buff timer over time", () => {
    let state = createPitstopState();
    state.isSupercharged = true;
    state.superchargeTimer = 10.0;

    // Driving away
    const result = stepPitstop(state, { x: 10, z: 10 }, 5.0, 3.0);
    expect(result.state.isSupercharged).toBe(true);
    expect(result.state.superchargeTimer).toBeCloseTo(7.0);

    // Buff expires after full duration
    const expiredResult = stepPitstop(result.state, { x: 10, z: 10 }, 5.0, 8.0);
    expect(expiredResult.state.isSupercharged).toBe(false);
    expect(expiredResult.state.superchargeTimer).toBe(0);
  });
});
