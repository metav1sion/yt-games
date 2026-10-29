import { describe, expect, it } from "vitest";
import {
  createGroceryStoreState,
  updateGroceryStore,
  triggerGrocerHonk,
  GROCERY_STORE_BAY,
  GROCER_HUSNU_CALLOUTS,
  GROCERY_BUFF_DURATION,
  GROCERY_COOLDOWN,
} from "./grocery-store";

describe("Grocery Store Game Logic (T47)", () => {
  it("initializes state with proper coordinates and zero counters", () => {
    const state = createGroceryStoreState();
    expect(state.serviceBay.x).toBe(GROCERY_STORE_BAY.x);
    expect(state.serviceBay.z).toBe(GROCERY_STORE_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("accumulates dwell time and awards Bakkal Molası bonus on 1.2s stationary dwell", () => {
    const state = createGroceryStoreState();
    const pos = { ...GROCERY_STORE_BAY };

    // 0.6 seconds dwell (half threshold)
    let res = updateGroceryStore(state, 0.6, pos, 0.5);
    expect(res.awardedBakkalBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.6, 2);

    // Another 0.7 seconds dwell (total 1.3s >= 1.2s threshold)
    res = updateGroceryStore(state, 0.7, pos, 0.2);
    expect(res.awardedBakkalBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.bellPlayed).toBe(true);
    expect(state.totalVisits).toBe(1);
    expect(state.buffTimer).toBe(GROCERY_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(GROCERY_COOLDOWN);
    expect(state.dwellTimer).toBe(0);
    expect(res.callout).toBe(GROCER_HUSNU_CALLOUTS[0]);
  });

  it("resets dwell timer when moving too fast or driving away", () => {
    const state = createGroceryStoreState();
    const pos = { ...GROCERY_STORE_BAY };

    updateGroceryStore(state, 0.8, pos, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.8, 2);

    // Moving fast (> 1.5 m/s)
    updateGroceryStore(state, 0.1, pos, 3.0);
    expect(state.dwellTimer).toBe(0);

    // Dwell again
    updateGroceryStore(state, 0.8, pos, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.8, 2);

    // Moved far away (> 7.0m)
    updateGroceryStore(state, 0.1, { x: 50, z: 50 }, 0.5);
    expect(state.dwellTimer).toBe(0);
  });

  it("prevents bonus exploit during cooldown", () => {
    const state = createGroceryStoreState();
    state.cooldownTimer = 20.0;
    const pos = { ...GROCERY_STORE_BAY };

    const res = updateGroceryStore(state, 2.0, pos, 0.0);
    expect(res.awardedBakkalBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers Bakkal Hüsnü Amca greeting callouts on player honk within range", () => {
    const state = createGroceryStoreState();
    const nearPos = { x: GROCERY_STORE_BAY.x + 5, z: GROCERY_STORE_BAY.z - 5 };
    const farPos = { x: 50, z: 50 };

    expect(triggerGrocerHonk(state, farPos)).toBe(false);
    expect(state.lastHonkCallout).toBeUndefined();

    expect(triggerGrocerHonk(state, nearPos)).toBe(true);
    expect(state.lastHonkCallout).toBeDefined();
    expect(GROCER_HUSNU_CALLOUTS).toContain(state.lastHonkCallout!);
    expect(state.honkGreetingTimer).toBe(3.5);
  });

  it("decrements active timers over time", () => {
    const state = createGroceryStoreState();
    state.buffTimer = 10.0;
    state.cooldownTimer = 15.0;
    state.honkGreetingTimer = 2.0;

    updateGroceryStore(state, 1.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBe(9.0);
    expect(state.cooldownTimer).toBe(14.0);
    expect(state.honkGreetingTimer).toBe(1.0);

    updateGroceryStore(state, 2.0, { x: 0, z: 0 }, 5.0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
  });
});
