import { describe, it, expect } from "vitest";
import {
  createCoppersmithState,
  updateCoppersmith,
  triggerCoppersmithHonk,
  COPPERSMITH_BAY,
  COPPERSMITH_CENTER,
  COPPERSMITH_DWELL_THRESHOLD,
  COPPERSMITH_BUFF_DURATION,
  COPPERSMITH_COOLDOWN,
  KAZIM_USTA_POS,
} from "./coppersmith";

describe("Coppersmith State & Interaction", () => {
  it("initializes coppersmith state with default coordinates and timers", () => {
    const state = createCoppersmithState();
    expect(state.center.x).toBe(COPPERSMITH_CENTER.x);
    expect(state.center.z).toBe(COPPERSMITH_CENTER.z);
    expect(state.serviceBay.x).toBe(COPPERSMITH_BAY.x);
    expect(state.serviceBay.z).toBe(COPPERSMITH_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("advances hammer strike and metal polish phases on update", () => {
    const state = createCoppersmithState();
    const prevHammer = state.hammerStrikePhase;
    const prevPolish = state.metalPolishPhase;
    updateCoppersmith(state, 0.5, { x: 0, z: 0 }, 5.0);
    expect(state.hammerStrikePhase).not.toBe(prevHammer);
    expect(state.metalPolishPhase).not.toBe(prevPolish);
  });

  it("accumulates dwell timer when stopped in service bay and triggers bonus at threshold", () => {
    const state = createCoppersmithState();
    // Step short of threshold
    const step1 = updateCoppersmith(state, COPPERSMITH_DWELL_THRESHOLD - 0.2, COPPERSMITH_BAY, 0.0);
    expect(step1.awardedCoppersmithBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(COPPERSMITH_DWELL_THRESHOLD - 0.2, 1);

    // Cross threshold
    const step2 = updateCoppersmith(state, 0.3, COPPERSMITH_BAY, 0.0);
    expect(step2.awardedCoppersmithBonus).toBe(true);
    expect(step2.cashBonus).toBe(10);
    expect(step2.repBonus).toBe(1);
    expect(step2.nitroRefill).toBe(true);
    expect(step2.buffActive).toBe(true);
    expect(step2.callout).toBeDefined();
    expect(state.buffTimer).toBe(COPPERSMITH_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(COPPERSMITH_COOLDOWN);
    expect(state.totalVisits).toBe(1);
  });

  it("prevents duplicate bonuses while cooldown timer is active", () => {
    const state = createCoppersmithState();
    updateCoppersmith(state, COPPERSMITH_DWELL_THRESHOLD + 0.1, COPPERSMITH_BAY, 0.0);
    expect(state.cooldownTimer).toBe(COPPERSMITH_COOLDOWN);

    // Try dwelling again while cooldown is active
    const step = updateCoppersmith(state, COPPERSMITH_DWELL_THRESHOLD + 0.5, COPPERSMITH_BAY, 0.0);
    expect(step.awardedCoppersmithBonus).toBe(false);
  });

  it("decrements buff timer over time", () => {
    const state = createCoppersmithState();
    state.buffTimer = 10.0;
    const res = updateCoppersmith(state, 4.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBeCloseTo(6.0, 1);
    expect(res.buffActive).toBe(true);

    updateCoppersmith(state, 7.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBe(0);
  });

  it("triggers honk greeting when within range of Kazım Usta", () => {
    const state = createCoppersmithState();
    const nearPlayer = { x: KAZIM_USTA_POS.x + 3.0, z: KAZIM_USTA_POS.z + 4.0 };
    const greeted = triggerCoppersmithHonk(state, nearPlayer);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(state.lastHonkCallout).toBeDefined();

    const farPlayer = { x: KAZIM_USTA_POS.x + 40.0, z: KAZIM_USTA_POS.z + 40.0 };
    const farGreeted = triggerCoppersmithHonk(state, farPlayer);
    expect(farGreeted).toBe(false);
  });

  it("resets dwell timer when moving away or speeding", () => {
    const state = createCoppersmithState();
    updateCoppersmith(state, 0.8, COPPERSMITH_BAY, 0.0);
    expect(state.dwellTimer).toBeGreaterThan(0);

    // High speed in bay decays dwell timer
    updateCoppersmith(state, 0.5, COPPERSMITH_BAY, 10.0);
    expect(state.dwellTimer).toBe(0);
  });
});
