import { describe, it, expect } from "vitest";
import {
  createLifesavingState,
  updateLifesaving,
  triggerLifesavingHonk,
  LIFESAVING_CENTER,
  LIFESAVING_BAY,
  LIFESAVING_BUFF_DURATION,
  LIFESAVING_COOLDOWN,
  LIFESAVING_DWELL_THRESHOLD,
  SUKRU_KAPTAN_POS,
  SUKRU_KAPTAN_CALLOUTS,
} from "./lifesaving";

describe("Lifesaving Station Game Logic (T61)", () => {
  it("initializes with default values and valid coordinates", () => {
    const state = createLifesavingState();
    expect(state.center.x).toBe(LIFESAVING_CENTER.x);
    expect(state.center.z).toBe(LIFESAVING_CENTER.z);
    expect(state.serviceBay.x).toBe(LIFESAVING_BAY.x);
    expect(state.serviceBay.z).toBe(LIFESAVING_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("accumulates dwell time and awards pitstop bonus when parked in service bay", () => {
    const state = createLifesavingState();
    const playerPos = { x: LIFESAVING_BAY.x, z: LIFESAVING_BAY.z };

    // Initial stop in bay
    let event = updateLifesaving(state, 0.5, playerPos, 0);
    expect(event.awardedLifesavingBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.5);

    // Complete dwell threshold
    event = updateLifesaving(state, LIFESAVING_DWELL_THRESHOLD, playerPos, 0);
    expect(event.awardedLifesavingBonus).toBe(true);
    expect(event.cashBonus).toBe(10);
    expect(event.repBonus).toBe(1);
    expect(event.nitroRefill).toBe(true);
    expect(event.buffActive).toBe(true);
    expect(event.soundTriggered).toBe(true);
    expect(state.buffTimer).toBe(LIFESAVING_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(LIFESAVING_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(SUKRU_KAPTAN_CALLOUTS).toContain(event.callout);
  });

  it("resets dwell timer if player drives away before threshold", () => {
    const state = createLifesavingState();
    const playerPos = { x: LIFESAVING_BAY.x, z: LIFESAVING_BAY.z };

    updateLifesaving(state, 0.8, playerPos, 0);
    expect(state.dwellTimer).toBeCloseTo(0.8);

    // Move away
    updateLifesaving(state, 0.1, { x: 0, z: 0 }, 10);
    expect(state.dwellTimer).toBe(0);
  });

  it("does not award bonus during cooldown period", () => {
    const state = createLifesavingState();
    state.cooldownTimer = 20.0;
    const playerPos = { x: LIFESAVING_BAY.x, z: LIFESAVING_BAY.z };

    const event = updateLifesaving(state, 2.0, playerPos, 0);
    expect(event.awardedLifesavingBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers honk greeting when player honks within range", () => {
    const state = createLifesavingState();
    const closePos = { x: LIFESAVING_CENTER.x + 5, z: LIFESAVING_CENTER.z };

    const honkTriggered = triggerLifesavingHonk(state, closePos);
    expect(honkTriggered).toBe(true);
    expect(state.honkGreetingTimer).toBe(5.0);
    expect(SUKRU_KAPTAN_CALLOUTS).toContain(state.lastHonkCallout);

    const event = updateLifesaving(state, 0.1, closePos, 5);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toBe(state.lastHonkCallout);
  });

  it("ignores honk if player is far away", () => {
    const state = createLifesavingState();
    const farPos = { x: 50, z: -50 };

    const honkTriggered = triggerLifesavingHonk(state, farPos);
    expect(honkTriggered).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);
  });

  it("updates mechanical animation phases and periodic sound timers", () => {
    const state = createLifesavingState();
    const initialWinch = state.winchCrankPhase;
    const initialBell = state.bellSwingPhase;

    updateLifesaving(state, 0.2, { x: LIFESAVING_CENTER.x, z: LIFESAVING_CENTER.z }, 0);
    expect(state.winchCrankPhase).not.toBe(initialWinch);
    expect(state.bellSwingPhase).not.toBe(initialBell);
  });
});
