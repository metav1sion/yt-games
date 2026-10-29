import { describe, it, expect } from "vitest";
import {
  createCarpenterState,
  updateCarpenter,
  triggerCarpenterHonk,
  CARPENTER_BAY,
  CARPENTER_CENTER,
  CARPENTER_DWELL_THRESHOLD,
  CARPENTER_BUFF_DURATION,
  CARPENTER_COOLDOWN,
  RUSTEM_USTA_POS,
} from "./carpenter";

describe("Carpenter Workshop Game Logic (T55)", () => {
  it("initializes with correct defaults and positions", () => {
    const state = createCarpenterState();
    expect(state.center.x).toBe(CARPENTER_CENTER.x);
    expect(state.center.z).toBe(CARPENTER_CENTER.z);
    expect(state.serviceBay.x).toBe(CARPENTER_BAY.x);
    expect(state.serviceBay.z).toBe(CARPENTER_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("advances blade and sawdust phases on update", () => {
    const state = createCarpenterState();
    const prevBlade = state.bladeRotationPhase;
    const prevSawdust = state.sawdustFlutterPhase;
    updateCarpenter(state, 0.5, { x: 0, z: 0 }, 5.0);
    expect(state.bladeRotationPhase).not.toBe(prevBlade);
    expect(state.sawdustFlutterPhase).not.toBe(prevSawdust);
  });

  it("accumulates dwell timer when stopped in service bay and triggers bonus at threshold", () => {
    const state = createCarpenterState();
    // Step short of threshold
    const step1 = updateCarpenter(state, CARPENTER_DWELL_THRESHOLD - 0.2, CARPENTER_BAY, 0.0);
    expect(step1.awardedCarpenterBonus).toBe(false);
    expect(state.dwellTimer).toBeGreaterThan(0);

    // Step across threshold
    const step2 = updateCarpenter(state, 0.3, CARPENTER_BAY, 0.0);
    expect(step2.awardedCarpenterBonus).toBe(true);
    expect(step2.cashBonus).toBe(10);
    expect(step2.repBonus).toBe(1);
    expect(step2.buffActive).toBe(true);
    expect(step2.nitroRefill).toBe(true);
    expect(step2.sawSoundTriggered).toBe(true);
    expect(step2.callout).toBeDefined();

    expect(state.buffTimer).toBe(CARPENTER_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(CARPENTER_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.dwellTimer).toBe(0);
  });

  it("enforces cooldown so multiple bonuses cannot be claimed repeatedly", () => {
    const state = createCarpenterState();
    updateCarpenter(state, CARPENTER_DWELL_THRESHOLD + 0.1, CARPENTER_BAY, 0.0);
    expect(state.cooldownTimer).toBe(CARPENTER_COOLDOWN);

    // Try dwelling again while cooldown is active
    const step = updateCarpenter(state, CARPENTER_DWELL_THRESHOLD + 0.5, CARPENTER_BAY, 0.0);
    expect(step.awardedCarpenterBonus).toBe(false);
  });

  it("decrements buff timer over time", () => {
    const state = createCarpenterState();
    state.buffTimer = 10.0;
    const res = updateCarpenter(state, 4.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBeCloseTo(6.0, 1);
    expect(res.buffActive).toBe(true);

    updateCarpenter(state, 7.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBe(0);
  });

  it("triggers honk greeting when within range of Rustem Usta", () => {
    const state = createCarpenterState();
    const greeted = triggerCarpenterHonk(state, RUSTEM_USTA_POS);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(state.lastHonkCallout).toBeDefined();

    // Out of range should fail
    const farGreeted = triggerCarpenterHonk(state, { x: 0, z: 0 });
    expect(farGreeted).toBe(false);
  });

  it("resets dwell timer when moving away or speeding", () => {
    const state = createCarpenterState();
    updateCarpenter(state, 0.8, CARPENTER_BAY, 0.0);
    expect(state.dwellTimer).toBeGreaterThan(0);

    // High speed in bay decays dwell timer
    updateCarpenter(state, 0.5, CARPENTER_BAY, 10.0);
    expect(state.dwellTimer).toBe(0);
  });
});
