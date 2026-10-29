import { describe, it, expect } from "vitest";
import {
  createFerrisWheelState,
  updateFerrisWheel,
  triggerFerrisWheelHonk,
  FERRIS_WHEEL_BOARDING_POS,
  FERRIS_WHEEL_POS,
  FERRIS_WHEEL_ROTATION_SPEED,
} from "./ferris-wheel";

describe("Ferris Wheel Game Logic", () => {
  it("initializes state with zero rotation and zero visits", () => {
    const state = createFerrisWheelState();
    expect(state.wheelAngle).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(state.dwellTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.honkGreetingTimer).toBe(0);
  });

  it("updates rotation angle and chase light phase smoothly with time", () => {
    const state = createFerrisWheelState();
    const event = updateFerrisWheel(state, 1.0, { x: 0, z: 0 }, 10);
    expect(state.wheelAngle).toBeCloseTo(FERRIS_WHEEL_ROTATION_SPEED, 3);
    expect(state.chaseLightPhase).toBeGreaterThan(0);
    expect(event.awardedJoyBonus).toBe(false);
  });

  it("awards Sahil Neşesi bonus when vehicle stops at boarding deck for 1.2s", () => {
    const state = createFerrisWheelState();
    const pos = { x: FERRIS_WHEEL_BOARDING_POS.x, z: FERRIS_WHEEL_BOARDING_POS.z };

    // Advance 0.8s (not enough)
    const e1 = updateFerrisWheel(state, 0.8, pos, 0.5);
    expect(e1.awardedJoyBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.8, 2);

    // Advance 0.5s more (total 1.3s >= 1.2s threshold)
    const e2 = updateFerrisWheel(state, 0.5, pos, 0.5);
    expect(e2.awardedJoyBonus).toBe(true);
    expect(e2.cashBonus).toBe(15);
    expect(e2.repBonus).toBe(1);
    expect(state.totalVisits).toBe(1);
    expect(state.cooldownTimer).toBe(35);

    // Subsequent tick should not immediately award again due to cooldown
    const e3 = updateFerrisWheel(state, 0.5, pos, 0.5);
    expect(e3.awardedJoyBonus).toBe(false);
  });

  it("resets dwell timer if vehicle moves away or speeds through", () => {
    const state = createFerrisWheelState();
    const pos = { x: FERRIS_WHEEL_BOARDING_POS.x, z: FERRIS_WHEEL_BOARDING_POS.z };

    updateFerrisWheel(state, 0.8, pos, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.8, 2);

    // Moving away resets dwell timer
    updateFerrisWheel(state, 0.2, { x: -40, z: 20 }, 10);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers operator greeting and speech callout when honking nearby", () => {
    const state = createFerrisWheelState();
    const nearby = { x: FERRIS_WHEEL_POS.x + 4, z: FERRIS_WHEEL_POS.z - 5 };
    const honked = triggerFerrisWheelHonk(state, nearby);
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(state.lastHonkCallout).toBeDefined();

    const event = updateFerrisWheel(state, 0.1, nearby, 5);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toBe(state.lastHonkCallout);
  });

  it("does not trigger honk greeting when player is far away", () => {
    const state = createFerrisWheelState();
    const farAway = { x: 50, z: -50 };
    const honked = triggerFerrisWheelHonk(state, farAway);
    expect(honked).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);
  });
});
