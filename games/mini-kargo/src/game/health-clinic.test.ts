import { describe, it, expect, beforeEach } from "vitest";
import {
  createHealthClinicState,
  updateHealthClinic,
  triggerHealthClinicHonk,
  HEALTH_CLINIC_CENTER,
  HEALTH_CLINIC_BAY,
  DR_HIKMET_POS,
  HEALTH_CLINIC_BUFF_DURATION,
  HEALTH_CLINIC_COOLDOWN,
  HEALTH_CLINIC_DWELL_THRESHOLD,
  DR_HIKMET_CALLOUTS,
} from "./health-clinic";

describe("health-clinic gameplay state & pitstop mechanics", () => {
  let state = createHealthClinicState();

  beforeEach(() => {
    state = createHealthClinicState();
  });

  it("initializes with default zeroed timers and valid positions", () => {
    expect(state.center.x).toBe(HEALTH_CLINIC_CENTER.x);
    expect(state.center.z).toBe(HEALTH_CLINIC_CENTER.z);
    expect(state.serviceBay.x).toBe(HEALTH_CLINIC_BAY.x);
    expect(state.serviceBay.z).toBe(HEALTH_CLINIC_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("dwell timer accumulates while stopped in service bay", () => {
    const bayPos = { ...HEALTH_CLINIC_BAY };
    const res = updateHealthClinic(state, 0.5, bayPos, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.5);
    expect(res.awardedHealthClinicBonus).toBe(false);
  });

  it("awards bonus and buff once dwell threshold is met", () => {
    const bayPos = { ...HEALTH_CLINIC_BAY };
    updateHealthClinic(state, HEALTH_CLINIC_DWELL_THRESHOLD * 0.6, bayPos, 0.2);
    const res = updateHealthClinic(state, HEALTH_CLINIC_DWELL_THRESHOLD * 0.5, bayPos, 0.2);

    expect(res.awardedHealthClinicBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.buffActive).toBe(true);
    expect(res.soundTriggered).toBe(true);
    expect(res.callout).toBeDefined();
    expect(DR_HIKMET_CALLOUTS).toContain(res.callout);
    expect(state.buffTimer).toBe(HEALTH_CLINIC_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(HEALTH_CLINIC_COOLDOWN);
    expect(state.totalVisits).toBe(1);
  });

  it("respects cooldown timer after bonus is awarded", () => {
    const bayPos = { ...HEALTH_CLINIC_BAY };
    updateHealthClinic(state, HEALTH_CLINIC_DWELL_THRESHOLD + 0.1, bayPos, 0.2);
    expect(state.cooldownTimer).toBe(HEALTH_CLINIC_COOLDOWN);

    const res = updateHealthClinic(state, HEALTH_CLINIC_DWELL_THRESHOLD + 0.1, bayPos, 0.2);
    expect(res.awardedHealthClinicBonus).toBe(false);
  });

  it("decays dwell timer if player drives away or moves fast", () => {
    const bayPos = { ...HEALTH_CLINIC_BAY };
    updateHealthClinic(state, 0.8, bayPos, 0.2);
    expect(state.dwellTimer).toBeCloseTo(0.8);

    updateHealthClinic(state, 0.3, bayPos, 5.0); // Too fast
    expect(state.dwellTimer).toBeLessThan(0.8);
  });

  it("triggers Dr. Hikmet NPC greeting on player honk within range", () => {
    const nearDoctor = { x: DR_HIKMET_POS.x + 2.0, z: DR_HIKMET_POS.z + 1.0 };
    const honked = triggerHealthClinicHonk(state, nearDoctor);
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(DR_HIKMET_CALLOUTS).toContain(state.lastHonkCallout);

    const farAway = { x: 50.0, z: 50.0 };
    const honkedFar = triggerHealthClinicHonk(state, farAway);
    expect(honkedFar).toBe(false);
  });

  it("triggers periodic pulse/clinic sound when near clinic", () => {
    const nearClinic = { ...HEALTH_CLINIC_CENTER };
    state.pulseSoundTimer = 0.05;
    const res = updateHealthClinic(state, 0.1, nearClinic, 2.0);
    expect(res.soundTriggered).toBe(true);
  });
});
