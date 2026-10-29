import { describe, it, expect } from "vitest";
import {
  createRestaurantState,
  updateRestaurant,
  triggerRestaurantHonk,
  RESTAURANT_BAY,
  CHEF_HAKKI_POS,
  RESTAURANT_BUFF_DURATION,
  RESTAURANT_COOLDOWN,
} from "./restaurant";

describe("Restaurant Game Logic (Sanayi Bereket Lokantası - T50)", () => {
  it("initializes restaurant state correctly", () => {
    const state = createRestaurantState();
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(state.serviceBay.x).toBe(RESTAURANT_BAY.x);
    expect(state.serviceBay.z).toBe(RESTAURANT_BAY.z);
    expect(state.spitRotation).toBe(0);
  });

  it("updates döner spit rotation continuously", () => {
    const state = createRestaurantState();
    updateRestaurant(state, 1.0, { x: 0, z: 0 }, 10);
    expect(state.spitRotation).toBeCloseTo(0.8);
  });

  it("dwells and awards Sanayi Tabldot bonus when parked at service bay", () => {
    const state = createRestaurantState();

    // 0.6 seconds at service bay (speed = 0)
    let res = updateRestaurant(state, 0.6, RESTAURANT_BAY, 0);
    expect(res.awardedMealBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.6);

    // Another 0.7 seconds (total 1.3s > 1.2s threshold)
    res = updateRestaurant(state, 0.7, RESTAURANT_BAY, 0);
    expect(res.awardedMealBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.buffActive).toBe(true);
    expect(res.ladleSoundTriggered).toBe(true);
    expect(res.callout).toBeDefined();
    expect(state.totalVisits).toBe(1);
    expect(state.cooldownTimer).toBe(RESTAURANT_COOLDOWN);
    expect(state.buffTimer).toBe(RESTAURANT_BUFF_DURATION);
  });

  it("decays dwell timer when moving away or driving too fast", () => {
    const state = createRestaurantState();
    updateRestaurant(state, 0.8, RESTAURANT_BAY, 0);
    expect(state.dwellTimer).toBeCloseTo(0.8);

    // Drive away fast
    updateRestaurant(state, 0.5, { x: 100, z: 100 }, 15);
    expect(state.dwellTimer).toBe(0);
  });

  it("prevents duplicate bonuses during cooldown period", () => {
    const state = createRestaurantState();
    updateRestaurant(state, 1.5, RESTAURANT_BAY, 0);
    expect(state.totalVisits).toBe(1);

    // Still in cooldown
    const res = updateRestaurant(state, 1.5, RESTAURANT_BAY, 0);
    expect(res.awardedMealBonus).toBe(false);
    expect(state.totalVisits).toBe(1);
  });

  it("triggers Chef Hakkı Usta greeting on player honk nearby", () => {
    const state = createRestaurantState();
    const honked = triggerRestaurantHonk(state, {
      x: CHEF_HAKKI_POS.x + 3.0,
      z: CHEF_HAKKI_POS.z + 2.0,
    });
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(state.lastHonkCallout).toBeDefined();

    // Far away honk ignored
    const farHonked = triggerRestaurantHonk(state, { x: -80, z: 80 });
    expect(farHonked).toBe(false);
  });
});
