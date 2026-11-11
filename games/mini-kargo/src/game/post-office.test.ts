import { describe, it, expect, beforeEach } from "vitest";
import {
  createPostOfficeState,
  updatePostOffice,
  triggerPostOfficeHonk,
  POST_OFFICE_CENTER,
  POST_OFFICE_BAY,
  KEMAL_POS,
  POST_OFFICE_BUFF_DURATION,
  POST_OFFICE_COOLDOWN,
  POST_OFFICE_DWELL_THRESHOLD,
  KEMAL_CALLOUTS,
} from "./post-office";

describe("post-office gameplay state & pitstop mechanics", () => {
  let state = createPostOfficeState();

  beforeEach(() => {
    state = createPostOfficeState();
  });

  it("initializes with default zeroed timers and valid positions", () => {
    expect(state.center.x).toBe(POST_OFFICE_CENTER.x);
    expect(state.center.z).toBe(POST_OFFICE_CENTER.z);
    expect(state.serviceBay.x).toBe(POST_OFFICE_BAY.x);
    expect(state.serviceBay.z).toBe(POST_OFFICE_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("dwell timer accumulates while stopped in service bay", () => {
    const bayPos = { ...POST_OFFICE_BAY };
    const res = updatePostOffice(state, 0.5, bayPos, 0.5);
    expect(state.dwellTimer).toBeCloseTo(0.5);
    expect(res.awardedPostOfficeBonus).toBe(false);
  });

  it("awards bonus and buff once dwell threshold is met", () => {
    const bayPos = { ...POST_OFFICE_BAY };
    updatePostOffice(state, POST_OFFICE_DWELL_THRESHOLD * 0.6, bayPos, 0.2);
    const res = updatePostOffice(state, POST_OFFICE_DWELL_THRESHOLD * 0.5, bayPos, 0.2);

    expect(res.awardedPostOfficeBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.buffActive).toBe(true);
    expect(res.stampSoundTriggered).toBe(true);
    expect(res.callout).toBeDefined();
    expect(KEMAL_CALLOUTS).toContain(res.callout);
    expect(state.buffTimer).toBe(POST_OFFICE_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(POST_OFFICE_COOLDOWN);
    expect(state.totalVisits).toBe(1);
  });

  it("respects cooldown timer after bonus is awarded", () => {
    const bayPos = { ...POST_OFFICE_BAY };
    updatePostOffice(state, POST_OFFICE_DWELL_THRESHOLD + 0.1, bayPos, 0.2);
    expect(state.cooldownTimer).toBe(POST_OFFICE_COOLDOWN);

    const res = updatePostOffice(state, POST_OFFICE_DWELL_THRESHOLD + 0.1, bayPos, 0.2);
    expect(res.awardedPostOfficeBonus).toBe(false);
  });

  it("decays dwell timer if player drives away or moves fast", () => {
    const bayPos = { ...POST_OFFICE_BAY };
    updatePostOffice(state, 0.8, bayPos, 0.2);
    expect(state.dwellTimer).toBeCloseTo(0.8);

    updatePostOffice(state, 0.3, bayPos, 5.0); // Too fast
    expect(state.dwellTimer).toBeLessThan(0.8);
  });

  it("triggers Kemal NPC greeting on player honk within range", () => {
    const nearKemal = { x: KEMAL_POS.x + 2.0, z: KEMAL_POS.z + 1.0 };
    const honked = triggerPostOfficeHonk(state, nearKemal);
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(KEMAL_CALLOUTS).toContain(state.lastHonkCallout);

    const farAway = { x: 50.0, z: 50.0 };
    const honkedFar = triggerPostOfficeHonk(state, farAway);
    expect(honkedFar).toBe(false);
  });

  it("triggers periodic stamp/telegraph ambient sound when near post office", () => {
    const nearPostOffice = { ...POST_OFFICE_CENTER };
    state.stampSoundTimer = 0.05;
    const res = updatePostOffice(state, 0.1, nearPostOffice, 2.0);
    expect(res.stampSoundTriggered).toBe(true);
  });
});
