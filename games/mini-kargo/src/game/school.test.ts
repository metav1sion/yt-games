import { describe, it, expect, beforeEach } from "vitest";
import {
  createSchoolState,
  updateSchool,
  triggerSchoolHonk,
  SCHOOL_CENTER,
  SCHOOL_BAY,
  HASAN_DAYI_POS,
  SCHOOL_BUFF_DURATION,
  SCHOOL_COOLDOWN,
  SCHOOL_DWELL_THRESHOLD,
  HASAN_DAYI_CALLOUTS,
} from "./school";

describe("T51: Güneş Mahallesi Tarihi Taş Mektep & Mahalle Okulu Game Logic", () => {
  let state = createSchoolState();

  beforeEach(() => {
    state = createSchoolState();
  });

  it("initializes school state correctly", () => {
    expect(state.center.x).toBe(SCHOOL_CENTER.x);
    expect(state.center.z).toBe(SCHOOL_CENTER.z);
    expect(state.serviceBay.x).toBe(SCHOOL_BAY.x);
    expect(state.serviceBay.z).toBe(SCHOOL_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("updates flag wave phase and paddle angle over time", () => {
    const prevPhase = state.flagWavePhase;
    updateSchool(state, 0.5, { x: 0, z: 0 }, 10);
    expect(state.flagWavePhase).not.toBe(prevPhase);
    expect(typeof state.paddleAngle).toBe("number");
  });

  it("does not award courtesy bonus if player is driving fast past the school", () => {
    const event = updateSchool(state, 1.5, { ...SCHOOL_BAY }, 12.0); // High speed
    expect(event.awardedCourtesyBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
  });

  it("awards courtesy bonus when player stops at school bay for required dwell time", () => {
    // 0.6 seconds - not yet enough
    let event = updateSchool(state, 0.6, { ...SCHOOL_BAY }, 0.2);
    expect(event.awardedCourtesyBonus).toBe(false);
    expect(state.dwellTimer).toBeGreaterThanOrEqual(0.6);

    // Another 0.7 seconds (total 1.3s >= 1.2s threshold)
    event = updateSchool(state, 0.7, { ...SCHOOL_BAY }, 0.1);
    expect(event.awardedCourtesyBonus).toBe(true);
    expect(event.cashBonus).toBe(10);
    expect(event.repBonus).toBe(1);
    expect(event.nitroRefill).toBe(true);
    expect(event.bellSoundTriggered).toBe(true);
    expect(state.buffTimer).toBe(SCHOOL_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(SCHOOL_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.lastHonkCallout).toBe(HASAN_DAYI_CALLOUTS[1]);
  });

  it("respects cooldown timer after courtesy bonus is awarded", () => {
    // Trigger bonus
    updateSchool(state, SCHOOL_DWELL_THRESHOLD + 0.1, { ...SCHOOL_BAY }, 0);
    expect(state.buffTimer).toBe(SCHOOL_BUFF_DURATION);

    // Try again immediately while in cooldown
    const event = updateSchool(state, SCHOOL_DWELL_THRESHOLD + 0.1, { ...SCHOOL_BAY }, 0);
    expect(event.awardedCourtesyBonus).toBe(false);
  });

  it("triggers Hasan Dayı greeting callout when honking nearby", () => {
    // Far away honk -> no greeting
    let honked = triggerSchoolHonk(state, { x: 100, z: 100 });
    expect(honked).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);

    // Nearby honk -> greeting triggered
    honked = triggerSchoolHonk(state, { ...HASAN_DAYI_POS });
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(HASAN_DAYI_CALLOUTS).toContain(state.lastHonkCallout);
  });
});
