import { describe, expect, it } from "vitest";
import {
  createCommunityParkState,
  updateCommunityPark,
  triggerGardenerHonk,
  COMMUNITY_PARK_CENTER,
  GAZEBO_POS,
  GARDENER_POS,
  PARK_BUFF_DURATION,
  PARK_COOLDOWN,
  PARK_DWELL_THRESHOLD,
  GARDENER_CALLOUTS,
} from "./community-park";

describe("CommunityPark Gameplay State Machine", () => {
  it("initializes with zero timers and correct center position", () => {
    const state = createCommunityParkState();
    expect(state.center.x).toBe(COMMUNITY_PARK_CENTER.x);
    expect(state.center.z).toBe(COMMUNITY_PARK_CENTER.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("advances animation angles and timers with delta time", () => {
    const state = createCommunityParkState();
    updateCommunityPark(state, 0.5, { x: 0, z: 0 }, 10);
    expect(state.gardenerWaterTimer).toBe(0.5);
    expect(state.carouselAngle).toBeGreaterThan(0);
    expect(state.swingAngle).toBeDefined();
    expect(state.rockerAngle).toBeDefined();
  });

  it("accumulates dwell timer when player stays stationary near gazebo", () => {
    const state = createCommunityParkState();
    const event = updateCommunityPark(state, 0.5, { x: GAZEBO_POS.x, z: GAZEBO_POS.z }, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.5);
    expect(event.awardedPeaceBonus).toBe(false);
  });

  it("awards 'Mahalle Huzuru' bonus after dwelling threshold and triggers buff and cooldown", () => {
    const state = createCommunityParkState();
    // Simulate staying stationary near gazebo for threshold duration
    let event = updateCommunityPark(state, PARK_DWELL_THRESHOLD * 0.6, { x: GAZEBO_POS.x, z: GAZEBO_POS.z }, 0.2);
    expect(event.awardedPeaceBonus).toBe(false);

    event = updateCommunityPark(state, PARK_DWELL_THRESHOLD * 0.6, { x: GAZEBO_POS.x, z: GAZEBO_POS.z }, 0.2);
    expect(event.awardedPeaceBonus).toBe(true);
    expect(event.cashBonus).toBe(10);
    expect(event.repBonus).toBe(1);
    expect(event.windChimePlayed).toBe(true);
    expect(state.buffTimer).toBe(PARK_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(PARK_COOLDOWN);
    expect(state.totalVisits).toBe(1);
  });

  it("does not award bonus during cooldown period", () => {
    const state = createCommunityParkState();
    state.cooldownTimer = 15.0; // on cooldown
    const event = updateCommunityPark(state, PARK_DWELL_THRESHOLD + 0.5, { x: GAZEBO_POS.x, z: GAZEBO_POS.z }, 0);
    expect(event.awardedPeaceBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers gardener honk greeting when player honks within range", () => {
    const state = createCommunityParkState();
    const greeted = triggerGardenerHonk(state, { x: GARDENER_POS.x + 5.0, z: GARDENER_POS.z });
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(GARDENER_CALLOUTS).toContain(state.lastHonkCallout);

    const event = updateCommunityPark(state, 0.1, { x: 0, z: 0 }, 5);
    expect(event.honkGreeted).toBe(true);
    expect(event.callout).toBe(state.lastHonkCallout);
  });

  it("does not trigger gardener greeting when player honks too far away", () => {
    const state = createCommunityParkState();
    const greeted = triggerGardenerHonk(state, { x: 50.0, z: 50.0 }); // far away in Çarşı
    expect(greeted).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
  });
});
