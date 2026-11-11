import { describe, it, expect } from "vitest";
import {
  createFoundryState,
  updateFoundry,
  triggerFoundryHonk,
  isFoundryBuffActive,
  FOUNDRY_CENTER,
  FOUNDRY_BAY,
  HAMDI_USTA_POS,
  FOUNDRY_BUFF_DURATION,
  FOUNDRY_COOLDOWN,
  FOUNDRY_DWELL_THRESHOLD,
  HAMDI_USTA_CALLOUTS,
} from "./foundry";

describe("Sanayi Demirciler ve Dökümcüler Sanayi Sitesi (Foundry)", () => {
  it("initializes state with correct coordinates and clean timers", () => {
    const state = createFoundryState();
    expect(state.center.x).toBe(FOUNDRY_CENTER.x);
    expect(state.center.z).toBe(FOUNDRY_CENTER.z);
    expect(state.serviceBay.x).toBe(FOUNDRY_BAY.x);
    expect(state.serviceBay.z).toBe(FOUNDRY_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(isFoundryBuffActive(state)).toBe(false);
  });

  it("accumulates dwell timer when stopped in the service bay and awards bonus after threshold", () => {
    const state = createFoundryState();
    const bayPos = { ...FOUNDRY_BAY };

    // Advance 0.6 seconds (halfway through 1.2s threshold)
    const midEv = updateFoundry(state, 0.6, bayPos, 0);
    expect(state.dwellTimer).toBeCloseTo(0.6, 2);
    expect(midEv.awardedFoundryBonus).toBe(false);
    expect(midEv.buffActive).toBe(false);

    // Advance another 0.65 seconds (exceeding threshold 1.2s)
    const bonusEv = updateFoundry(state, 0.65, bayPos, 0);
    expect(bonusEv.awardedFoundryBonus).toBe(true);
    expect(bonusEv.cashBonus).toBe(10);
    expect(bonusEv.repBonus).toBe(1);
    expect(bonusEv.nitroRefill).toBe(true);
    expect(bonusEv.buffActive).toBe(true);
    expect(bonusEv.hammerSoundTriggered).toBe(true);
    expect(bonusEv.honkGreeted).toBe(true);
    expect(bonusEv.callout).toContain("Demirci Hamdi Usta");
    expect(state.totalVisits).toBe(1);
    expect(state.buffTimer).toBeCloseTo(FOUNDRY_BUFF_DURATION, 1);
    expect(state.cooldownTimer).toBeCloseTo(FOUNDRY_COOLDOWN, 1);
    expect(isFoundryBuffActive(state)).toBe(true);
  });

  it("does not award bonus if vehicle is moving too fast through bay", () => {
    const state = createFoundryState();
    const bayPos = { ...FOUNDRY_BAY };

    for (let i = 0; i < 20; i++) {
      const ev = updateFoundry(state, 0.1, bayPos, 5.0); // 5 m/s speed
      expect(ev.awardedFoundryBonus).toBe(false);
    }
    expect(state.dwellTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("resets dwell timer when leaving the service bay", () => {
    const state = createFoundryState();
    const bayPos = { ...FOUNDRY_BAY };

    updateFoundry(state, 0.8, bayPos, 0);
    expect(state.dwellTimer).toBeGreaterThan(0.7);

    // Move away
    updateFoundry(state, 0.5, { x: 0, z: 0 }, 5.0);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers honk greeting when within distance to Hamdi Usta", () => {
    const state = createFoundryState();
    const closePos = { x: HAMDI_USTA_POS.x + 2.0, z: HAMDI_USTA_POS.z + 2.0 };
    const farPos = { x: 0, z: 0 };

    expect(triggerFoundryHonk(state, farPos)).toBe(false);
    expect(triggerFoundryHonk(state, closePos)).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(HAMDI_USTA_CALLOUTS).toContain(state.lastHonkCallout);

    const ev = updateFoundry(state, 0.1, closePos, 0);
    expect(ev.honkGreeted).toBe(true);
    expect(ev.callout).toBe(state.lastHonkCallout);
  });

  it("triggers periodic ambient hammer sounds when player is nearby", () => {
    const state = createFoundryState();
    state.hammerSoundTimer = 0.05;

    const ev = updateFoundry(state, 0.1, FOUNDRY_CENTER, 2.0);
    expect(ev.hammerSoundTriggered).toBe(true);
    expect(state.hammerSoundTimer).toBeGreaterThan(4.0);
  });

  it("respects cooldown timer and prevents multiple bonuses during cooldown", () => {
    const state = createFoundryState();
    const bayPos = { ...FOUNDRY_BAY };

    // Trigger first bonus
    updateFoundry(state, 1.3, bayPos, 0);
    expect(state.totalVisits).toBe(1);
    expect(state.cooldownTimer).toBeGreaterThan(30);

    // Try to dwell again immediately
    const ev = updateFoundry(state, 1.5, bayPos, 0);
    expect(ev.awardedFoundryBonus).toBe(false);
    expect(state.totalVisits).toBe(1);
  });
});
