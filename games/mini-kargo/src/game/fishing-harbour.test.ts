import { describe, it, expect } from "vitest";
import {
  createFishingHarbourState,
  updateFishingHarbour,
  triggerChefTemelHonk,
  HARBOUR_CENTER,
  HARBOUR_ENTRANCE,
  HARBOUR_DWELL_THRESHOLD,
  HARBOUR_COOLDOWN,
  HARBOUR_BUFF_DURATION,
  CHEF_TEMEL_CALLOUTS,
} from "./fishing-harbour";

describe("Fishing Harbour & Fish-Bread Boat Game Mechanics", () => {
  it("initializes state with correct positions and zero timers", () => {
    const state = createFishingHarbourState();
    expect(state.center).toEqual(HARBOUR_CENTER);
    expect(state.entrance).toEqual(HARBOUR_ENTRANCE);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("dwells near harbour entrance and awards Balık Ekmek Ziyafeti bonus", () => {
    const state = createFishingHarbourState();
    const playerPos = { x: HARBOUR_ENTRANCE.x, z: HARBOUR_ENTRANCE.z };

    // Step halfway
    let event = updateFishingHarbour(state, HARBOUR_DWELL_THRESHOLD / 2, playerPos, 0.5);
    expect(event.awardedFeastBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(HARBOUR_DWELL_THRESHOLD / 2, 2);

    // Complete threshold
    event = updateFishingHarbour(state, HARBOUR_DWELL_THRESHOLD / 2 + 0.1, playerPos, 0.2);
    expect(event.awardedFeastBonus).toBe(true);
    expect(event.cashBonus).toBe(15);
    expect(event.repBonus).toBe(1);
    expect(event.buffActive).toBe(true);
    expect(event.sizzlePlayed).toBe(true);
    expect(state.totalVisits).toBe(1);
    expect(state.buffTimer).toBe(HARBOUR_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(HARBOUR_COOLDOWN);
    expect(state.dwellTimer).toBe(0);
  });

  it("resets dwell timer when vehicle moves away or speeds past", () => {
    const state = createFishingHarbourState();
    const playerPos = { x: HARBOUR_ENTRANCE.x, z: HARBOUR_ENTRANCE.z };

    updateFishingHarbour(state, 0.5, playerPos, 0.4);
    expect(state.dwellTimer).toBeCloseTo(0.5, 2);

    // Speeding up
    updateFishingHarbour(state, 0.1, playerPos, 3.2);
    expect(state.dwellTimer).toBe(0);

    // Moving far away
    updateFishingHarbour(state, 0.5, playerPos, 0.4);
    expect(state.dwellTimer).toBeCloseTo(0.5, 2);
    updateFishingHarbour(state, 0.1, { x: 50, z: 50 }, 0.5);
    expect(state.dwellTimer).toBe(0);
  });

  it("respects cooldown timer before allowing another pitstop reward", () => {
    const state = createFishingHarbourState();
    const playerPos = { x: HARBOUR_ENTRANCE.x, z: HARBOUR_ENTRANCE.z };

    // Award bonus
    updateFishingHarbour(state, HARBOUR_DWELL_THRESHOLD + 0.1, playerPos, 0.1);
    expect(state.cooldownTimer).toBe(HARBOUR_COOLDOWN);

    // Try to dwell while still on cooldown
    const event = updateFishingHarbour(state, HARBOUR_DWELL_THRESHOLD + 0.5, playerPos, 0.1);
    expect(event.awardedFeastBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers Chef Temel honk response within range", () => {
    const state = createFishingHarbourState();
    const nearby = { x: HARBOUR_ENTRANCE.x + 2, z: HARBOUR_ENTRANCE.z + 2 };
    const far = { x: 0, z: 0 };

    expect(triggerChefTemelHonk(state, far)).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);

    expect(triggerChefTemelHonk(state, nearby)).toBe(true);
    expect(state.honkGreetingTimer).toBe(3.5);
    expect(CHEF_TEMEL_CALLOUTS).toContain(state.lastHonkCallout);
  });

  it("decays honk greeting and buff timers over dt", () => {
    const state = createFishingHarbourState();
    state.honkGreetingTimer = 2.0;
    state.buffTimer = 5.0;

    const event = updateFishingHarbour(state, 1.0, { x: 0, z: 0 }, 5.0);
    expect(state.honkGreetingTimer).toBe(1.0);
    expect(state.buffTimer).toBe(4.0);
    expect(event.buffActive).toBe(true);

    updateFishingHarbour(state, 1.5, { x: 0, z: 0 }, 5.0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
  });
});
