import { describe, it, expect, beforeEach } from "vitest";
import {
  createHerbalistState,
  updateHerbalist,
  triggerHerbalistHonk,
  isHerbalistBuffActive,
  HERBALIST_BAY,
  HERBALIST_CENTER,
  HERBALIST_DWELL_THRESHOLD,
  HERBALIST_BUFF_DURATION,
  HERBALIST_COOLDOWN,
  IDRIS_EFENDI_POS,
  type HerbalistState,
} from "./herbalist";

describe("Çarşı Tarihi Baharatçı, Aktar & Lokman Hekim Şifahanesi (Herbalist)", () => {
  let state: HerbalistState;

  beforeEach(() => {
    state = createHerbalistState();
  });

  it("initializes state with correct coordinates and clean timers", () => {
    expect(state.center.x).toBe(HERBALIST_CENTER.x);
    expect(state.center.z).toBe(HERBALIST_CENTER.z);
    expect(state.serviceBay.x).toBe(HERBALIST_BAY.x);
    expect(state.serviceBay.z).toBe(HERBALIST_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(isHerbalistBuffActive(state)).toBe(false);
  });

  it("accumulates dwell timer when stopped in the service bay and awards bonus after threshold", () => {
    // 1. Bay içinde ancak eşik süresinden az duraklama
    const step1 = updateHerbalist(state, HERBALIST_DWELL_THRESHOLD - 0.2, HERBALIST_BAY, 0.0);
    expect(step1.awardedHerbalBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(HERBALIST_DWELL_THRESHOLD - 0.2, 1);
    expect(isHerbalistBuffActive(state)).toBe(false);

    // 2. Eşiği aşan duraklama: Ödül verilir
    const bonusEv = updateHerbalist(state, 0.3, HERBALIST_BAY, 0.0);
    expect(bonusEv.awardedHerbalBonus).toBe(true);
    expect(bonusEv.cashBonus).toBe(10);
    expect(bonusEv.repBonus).toBe(1);
    expect(bonusEv.nitroRefill).toBe(true);
    expect(bonusEv.buffActive).toBe(true);
    expect(bonusEv.soundTriggered).toBe(true);
    expect(bonusEv.honkGreeted).toBe(true);
    expect(bonusEv.callout).toContain("Aktar İdris Efendi");
    expect(state.totalVisits).toBe(1);
    expect(state.buffTimer).toBeCloseTo(HERBALIST_BUFF_DURATION, 1);
    expect(state.cooldownTimer).toBeCloseTo(HERBALIST_COOLDOWN, 1);
    expect(isHerbalistBuffActive(state)).toBe(true);
  });

  it("does not award bonus if vehicle is moving too fast through bay", () => {
    const fastEv = updateHerbalist(state, HERBALIST_DWELL_THRESHOLD + 0.5, HERBALIST_BAY, 5.0);
    expect(fastEv.awardedHerbalBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("decays dwell timer when vehicle leaves the bay before threshold", () => {
    updateHerbalist(state, 0.8, HERBALIST_BAY, 0.0);
    expect(state.dwellTimer).toBeCloseTo(0.8, 1);

    // Bay dışına çıkış (örneğin X: 0, Z: 0)
    updateHerbalist(state, 0.5, { x: 0, z: 0 }, 0.0);
    expect(state.dwellTimer).toBeLessThan(0.8);
  });

  it("respects cooldown timer before allowing another bonus award", () => {
    // İlk ödülü al
    updateHerbalist(state, HERBALIST_DWELL_THRESHOLD + 0.1, HERBALIST_BAY, 0.0);
    expect(state.cooldownTimer).toBe(HERBALIST_COOLDOWN);

    // Hemen ardından tekrar duraklama
    const step = updateHerbalist(state, HERBALIST_DWELL_THRESHOLD + 0.5, HERBALIST_BAY, 0.0);
    expect(step.awardedHerbalBonus).toBe(false);
    expect(state.totalVisits).toBe(1);
  });

  it("handles player honk within range of Aktar İdris Efendi", () => {
    // 1. Çok uzakta korna çalma
    const farHonk = triggerHerbalistHonk(state, { x: 90, z: 90 });
    expect(farHonk).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);

    // 2. 22m mesafede korna çalma
    const nearHonk = triggerHerbalistHonk(state, {
      x: IDRIS_EFENDI_POS.x + 5.0,
      z: IDRIS_EFENDI_POS.z + 5.0,
    });
    expect(nearHonk).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(state.lastHonkCallout).toContain("Aktar İdris Efendi");

    // Update sırasında selamın korunması
    const ev = updateHerbalist(state, 1.0, { x: 0, z: 0 }, 0.0);
    expect(ev.honkGreeted).toBe(true);
    expect(ev.callout).toContain("Aktar İdris Efendi");
  });

  it("triggers periodic mortar sound when vehicle is nearby", () => {
    state.mortarSoundTimer = 5.6;
    const ev = updateHerbalist(state, 0.1, HERBALIST_CENTER, 0.0);
    expect(ev.soundTriggered).toBe(true);
    expect(state.mortarSoundTimer).toBe(0);
  });
});
