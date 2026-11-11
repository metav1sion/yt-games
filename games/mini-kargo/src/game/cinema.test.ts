import { describe, it, expect } from "vitest";
import {
  createCinemaState,
  updateCinema,
  triggerCinemaHonk,
  CINEMA_BAY,
  CINEMA_CENTER,
  CINEMA_DWELL_THRESHOLD,
  CINEMA_BUFF_DURATION,
  CINEMA_COOLDOWN,
  RIFAT_POS,
} from "./cinema";

describe("Cinema State & Interaction", () => {
  it("initializes cinema state with default coordinates and timers", () => {
    const state = createCinemaState();
    expect(state.center.x).toBe(CINEMA_CENTER.x);
    expect(state.center.z).toBe(CINEMA_CENTER.z);
    expect(state.serviceBay.x).toBe(CINEMA_BAY.x);
    expect(state.serviceBay.z).toBe(CINEMA_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("advances film reel and projector flicker phases on update", () => {
    const state = createCinemaState();
    const prevReel = state.filmReelPhase;
    const prevFlicker = state.projectorFlickerPhase;
    updateCinema(state, 0.5, { x: 0, z: 0 }, 5.0);
    expect(state.filmReelPhase).not.toBe(prevReel);
    expect(state.projectorFlickerPhase).not.toBe(prevFlicker);
  });

  it("accumulates dwell timer when stopped in service bay and triggers bonus at threshold", () => {
    const state = createCinemaState();
    // Step short of threshold
    const step1 = updateCinema(state, CINEMA_DWELL_THRESHOLD - 0.2, CINEMA_BAY, 0.0);
    expect(step1.awardedCinemaBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(CINEMA_DWELL_THRESHOLD - 0.2, 1);

    // Cross threshold
    const step2 = updateCinema(state, 0.3, CINEMA_BAY, 0.0);
    expect(step2.awardedCinemaBonus).toBe(true);
    expect(step2.cashBonus).toBe(10);
    expect(step2.repBonus).toBe(1);
    expect(step2.nitroRefill).toBe(true);
    expect(step2.buffActive).toBe(true);
    expect(step2.callout).toBeDefined();
    expect(state.buffTimer).toBe(CINEMA_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(CINEMA_COOLDOWN);
    expect(state.totalVisits).toBe(1);
  });

  it("prevents duplicate bonuses while cooldown timer is active", () => {
    const state = createCinemaState();
    updateCinema(state, CINEMA_DWELL_THRESHOLD + 0.1, CINEMA_BAY, 0.0);
    expect(state.cooldownTimer).toBe(CINEMA_COOLDOWN);

    // Try dwelling again while cooldown is active
    const step = updateCinema(state, CINEMA_DWELL_THRESHOLD + 0.5, CINEMA_BAY, 0.0);
    expect(step.awardedCinemaBonus).toBe(false);
  });

  it("decrements buff timer over time", () => {
    const state = createCinemaState();
    state.buffTimer = 10.0;
    const res = updateCinema(state, 4.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBeCloseTo(6.0, 1);
    expect(res.buffActive).toBe(true);

    updateCinema(state, 7.0, { x: 0, z: 0 }, 5.0);
    expect(state.buffTimer).toBe(0);
  });

  it("triggers honk greeting when within range of Makinist Rıfat", () => {
    const state = createCinemaState();
    const nearPlayer = { x: RIFAT_POS.x + 3.0, z: RIFAT_POS.z + 4.0 };
    const greeted = triggerCinemaHonk(state, nearPlayer);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(state.lastHonkCallout).toBeDefined();

    const farPlayer = { x: RIFAT_POS.x + 40.0, z: RIFAT_POS.z + 40.0 };
    const farGreeted = triggerCinemaHonk(state, farPlayer);
    expect(farGreeted).toBe(false);
  });

  it("resets dwell timer when moving away or speeding", () => {
    const state = createCinemaState();
    updateCinema(state, 0.8, CINEMA_BAY, 0.0);
    expect(state.dwellTimer).toBeGreaterThan(0);

    // High speed in bay decays dwell timer
    updateCinema(state, 0.5, CINEMA_BAY, 10.0);
    expect(state.dwellTimer).toBe(0);
  });
});
