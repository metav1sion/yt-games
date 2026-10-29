import { describe, expect, it } from "vitest";
import {
  createLighthouseState,
  updateLighthouse,
  triggerLighthouseHonk,
  LIGHTHOUSE_BAY,
  RIZA_KAPTAN_POS,
  LIGHTHOUSE_BUFF_DURATION,
  LIGHTHOUSE_COOLDOWN,
  LIGHTHOUSE_DWELL_THRESHOLD,
  RIZA_KAPTAN_CALLOUTS,
} from "./lighthouse";

describe("Sahil Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı Game Logic (T53)", () => {
  it("creates initial state with correct coordinates and zeroed timers", () => {
    const state = createLighthouseState();
    expect(state.center.x).toBe(-28.0);
    expect(state.center.z).toBe(91.0);
    expect(state.serviceBay.x).toBe(LIGHTHOUSE_BAY.x);
    expect(state.serviceBay.z).toBe(LIGHTHOUSE_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(state.beamRotation).toBe(0);
  });

  it("updates beam rotation and telescope phases continuously", () => {
    const state = createLighthouseState();
    updateLighthouse(state, 0.1, { x: 0, z: 0 }, 5);
    expect(state.beamRotation).toBeGreaterThan(0);
    expect(state.telescopeScanPhase).toBeGreaterThan(0);
  });

  it("accumulates dwell timer and awards Fener Rehberliği bonus on stationary threshold", () => {
    const state = createLighthouseState();
    const bayPos = { ...LIGHTHOUSE_BAY };

    // Henüz eşik dolmadı (0.5s < 1.2s)
    let res = updateLighthouse(state, 0.5, bayPos, 0.1);
    expect(res.awardedGuidanceBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.5);

    // Eşik tamamlandı (0.5s + 0.8s = 1.3s >= 1.2s)
    res = updateLighthouse(state, 0.8, bayPos, 0.1);
    expect(res.awardedGuidanceBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.buffActive).toBe(true);
    expect(res.fogHornTriggered).toBe(true);
    expect(state.buffTimer).toBe(LIGHTHOUSE_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(LIGHTHOUSE_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.lastHonkCallout).toBe(RIZA_KAPTAN_CALLOUTS[0]);
    expect(res.callout).toBe(RIZA_KAPTAN_CALLOUTS[0]);
  });

  it("does not award bonus during cooldown period", () => {
    const state = createLighthouseState();
    state.cooldownTimer = 20.0;
    const bayPos = { ...LIGHTHOUSE_BAY };

    const res = updateLighthouse(state, LIGHTHOUSE_DWELL_THRESHOLD + 0.1, bayPos, 0.1);
    expect(res.awardedGuidanceBonus).toBe(false);
    expect(state.totalVisits).toBe(0);
  });

  it("decays dwell timer when player leaves service bay or speeds through", () => {
    const state = createLighthouseState();
    state.dwellTimer = 0.8;
    const bayPos = { ...LIGHTHOUSE_BAY };

    // Hızlı geçiş
    updateLighthouse(state, 0.2, bayPos, 4.5);
    expect(state.dwellTimer).toBeLessThan(0.8);

    // Uzakta olma
    updateLighthouse(state, 0.2, { x: 50, z: 50 }, 0);
    expect(state.dwellTimer).toBeLessThan(0.4);
  });

  it("triggers honk greeting callout within 26m radius", () => {
    const state = createLighthouseState();
    const nearPos = { x: RIZA_KAPTAN_POS.x + 3.0, z: RIZA_KAPTAN_POS.z + 4.0 };

    const greeted = triggerLighthouseHonk(state, nearPos);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(state.lastHonkCallout).toBeDefined();
    expect(RIZA_KAPTAN_CALLOUTS).toContain(state.lastHonkCallout);

    // Çok uzakta korna çalma
    const farPos = { x: 50, z: 50 };
    const farGreeted = triggerLighthouseHonk(state, farPos);
    expect(farGreeted).toBe(false);
  });

  it("clears callout when honk greeting timer expires", () => {
    const state = createLighthouseState();
    triggerLighthouseHonk(state, { ...RIZA_KAPTAN_POS });
    expect(state.lastHonkCallout).toBeDefined();

    updateLighthouse(state, 4.5, { x: 0, z: 0 }, 0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
  });

  it("triggers periodic ambient foghorn when player is within 45m", () => {
    const state = createLighthouseState();
    state.fogHornSoundTimer = 0.05;

    const res = updateLighthouse(state, 0.1, { ...LIGHTHOUSE_BAY }, 0);
    expect(res.fogHornTriggered).toBe(true);
    expect(state.fogHornSoundTimer).toBeGreaterThan(15.0);
  });
});
