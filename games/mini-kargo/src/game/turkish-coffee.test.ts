import { describe, it, expect } from "vitest";
import {
  createTurkishCoffeeState,
  updateTurkishCoffee,
  triggerTurkishCoffeeHonk,
  isTurkishCoffeeBuffActive,
  TURKISH_COFFEE_CENTER,
  TURKISH_COFFEE_BAY,
  TAHSIN_EFENDI_POS,
  TURKISH_COFFEE_BUFF_DURATION,
  TURKISH_COFFEE_COOLDOWN,
  TURKISH_COFFEE_DWELL_THRESHOLD,
  TAHSIN_EFENDI_CALLOUTS,
} from "./turkish-coffee";

describe("Turkish Coffee Game Logic", () => {
  it("initializes default state correctly", () => {
    const state = createTurkishCoffeeState();
    expect(state.center.x).toBe(TURKISH_COFFEE_CENTER.x);
    expect(state.center.z).toBe(TURKISH_COFFEE_CENTER.z);
    expect(state.serviceBay.x).toBe(TURKISH_COFFEE_BAY.x);
    expect(state.serviceBay.z).toBe(TURKISH_COFFEE_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(isTurkishCoffeeBuffActive(state)).toBe(false);
  });

  it("decrements buff and cooldown timers over time", () => {
    const state = createTurkishCoffeeState();
    state.buffTimer = 10.0;
    state.cooldownTimer = 20.0;

    const event = updateTurkishCoffee(state, 1.0, { x: 0, z: 0 }, 10);
    expect(state.buffTimer).toBeCloseTo(9.0, 2);
    expect(state.cooldownTimer).toBeCloseTo(19.0, 2);
    expect(event.buffActive).toBe(true);
    expect(isTurkishCoffeeBuffActive(state)).toBe(true);
  });

  it("advances ember glow and grinder crank phases smoothly", () => {
    const state = createTurkishCoffeeState();
    expect(state.emberGlowPhase).toBe(0);
    expect(state.grinderCrankPhase).toBe(0);

    updateTurkishCoffee(state, 0.5, { x: 0, z: 0 }, 0);
    expect(state.emberGlowPhase).toBeGreaterThan(0);
    expect(state.grinderCrankPhase).toBeGreaterThan(0);
  });

  it("triggers periodic roasting/brewing sound when player is nearby", () => {
    const state = createTurkishCoffeeState();
    state.coffeeSoundTimer = 0.1;

    const event = updateTurkishCoffee(state, 0.2, { x: TURKISH_COFFEE_CENTER.x, z: TURKISH_COFFEE_CENTER.z }, 0);
    expect(event.coffeeSoundTriggered).toBe(true);
    expect(state.coffeeSoundTimer).toBeGreaterThan(4.0);
  });

  it("awards pitstop bonus, cash, reputation, nitro, and buff on 1.2s dwell in service bay", () => {
    const state = createTurkishCoffeeState();
    const bayPos = { ...TURKISH_COFFEE_BAY };

    // Dwell for 1.0s (less than 1.2s threshold)
    let event = updateTurkishCoffee(state, 1.0, bayPos, 0);
    expect(event.awardedTurkishCoffeeBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(1.0, 2);

    // Dwell for another 0.3s (total 1.3s >= 1.2s threshold)
    event = updateTurkishCoffee(state, 0.3, bayPos, 0);
    expect(event.awardedTurkishCoffeeBonus).toBe(true);
    expect(event.cashBonus).toBe(10);
    expect(event.repBonus).toBe(1);
    expect(event.nitroRefill).toBe(true);
    expect(event.buffActive).toBe(true);
    expect(event.coffeeSoundTriggered).toBe(true);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toBe(TAHSIN_EFENDI_CALLOUTS[0]);

    expect(state.buffTimer).toBe(TURKISH_COFFEE_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(TURKISH_COFFEE_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(isTurkishCoffeeBuffActive(state)).toBe(true);

    // Further dwell during cooldown does not award bonus again
    event = updateTurkishCoffee(state, 1.5, bayPos, 0);
    expect(event.awardedTurkishCoffeeBonus).toBe(false);
  });

  it("decays dwell timer when vehicle leaves bay or drives at speed", () => {
    const state = createTurkishCoffeeState();
    state.dwellTimer = 0.8;

    updateTurkishCoffee(state, 0.2, { x: 0, z: 0 }, 10);
    expect(state.dwellTimer).toBeCloseTo(0.4, 2);
  });

  it("responds to player honk when within 24m of Tahsin Efendi", () => {
    const state = createTurkishCoffeeState();
    const nearPos = { x: TAHSIN_EFENDI_POS.x + 5, z: TAHSIN_EFENDI_POS.z + 5 };

    const triggered = triggerTurkishCoffeeHonk(state, nearPos);
    expect(triggered).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.5);
    expect(TAHSIN_EFENDI_CALLOUTS).toContain(state.lastHonkCallout);

    // Update propagates honk greeting event
    const event = updateTurkishCoffee(state, 0.1, nearPos, 5);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toBe(state.lastHonkCallout);

    // Far away honk does not trigger
    const farPos = { x: -80, z: -80 };
    const farTriggered = triggerTurkishCoffeeHonk(state, farPos);
    expect(farTriggered).toBe(false);
  });
});
