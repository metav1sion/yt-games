import { describe, it, expect } from "vitest";
import {
  createLatheWorkshopState,
  updateLatheWorkshop,
  triggerLatheWorkshopHonk,
  isLatheWorkshopBuffActive,
  LATHE_WORKSHOP_CENTER,
  LATHE_WORKSHOP_BAY,
  NECATI_USTA_POS,
  LATHE_WORKSHOP_BUFF_DURATION,
  LATHE_WORKSHOP_COOLDOWN,
  LATHE_WORKSHOP_DWELL_THRESHOLD,
  NECATI_USTA_CALLOUTS,
} from "./lathe-workshop";

describe("Sanayi Tarihi Makine, Torna & Freze İmalathanesi (Lathe Workshop)", () => {
  it("initializes state with correct coordinates and clean timers", () => {
    const state = createLatheWorkshopState();
    expect(state.center.x).toBe(LATHE_WORKSHOP_CENTER.x);
    expect(state.center.z).toBe(LATHE_WORKSHOP_CENTER.z);
    expect(state.serviceBay.x).toBe(LATHE_WORKSHOP_BAY.x);
    expect(state.serviceBay.z).toBe(LATHE_WORKSHOP_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(isLatheWorkshopBuffActive(state)).toBe(false);
  });

  it("accumulates dwell timer when stopped in the service bay and awards bonus after threshold", () => {
    const state = createLatheWorkshopState();
    const bayPos = { ...LATHE_WORKSHOP_BAY };

    // Advance 0.6 seconds (halfway through 1.2s threshold)
    const midEv = updateLatheWorkshop(state, 0.6, bayPos, 0);
    expect(state.dwellTimer).toBeCloseTo(0.6, 2);
    expect(midEv.awardedLatheBonus).toBe(false);
    expect(midEv.buffActive).toBe(false);

    // Advance another 0.65 seconds (exceeding threshold 1.2s)
    const bonusEv = updateLatheWorkshop(state, 0.65, bayPos, 0);
    expect(bonusEv.awardedLatheBonus).toBe(true);
    expect(bonusEv.cashBonus).toBe(10);
    expect(bonusEv.repBonus).toBe(1);
    expect(bonusEv.nitroRefill).toBe(true);
    expect(bonusEv.buffActive).toBe(true);
    expect(bonusEv.soundTriggered).toBe(true);
    expect(bonusEv.honkGreeted).toBe(true);
    expect(bonusEv.callout).toContain("Tornacı Necati Usta");
    expect(state.totalVisits).toBe(1);
    expect(state.buffTimer).toBeCloseTo(LATHE_WORKSHOP_BUFF_DURATION, 1);
    expect(state.cooldownTimer).toBeCloseTo(LATHE_WORKSHOP_COOLDOWN, 1);
    expect(isLatheWorkshopBuffActive(state)).toBe(true);
  });

  it("does not award bonus if vehicle is moving too fast through bay", () => {
    const state = createLatheWorkshopState();
    const bayPos = { ...LATHE_WORKSHOP_BAY };

    for (let i = 0; i < 20; i++) {
      const ev = updateLatheWorkshop(state, 0.1, bayPos, 8.5); // moving at 8.5 m/s
      expect(ev.awardedLatheBonus).toBe(false);
    }
    expect(state.totalVisits).toBe(0);
    expect(state.dwellTimer).toBe(0);
  });

  it("decays dwell timer when vehicle leaves the bay before threshold", () => {
    const state = createLatheWorkshopState();
    const bayPos = { ...LATHE_WORKSHOP_BAY };

    updateLatheWorkshop(state, 0.8, bayPos, 0);
    expect(state.dwellTimer).toBeCloseTo(0.8, 2);

    const outsidePos = { x: bayPos.x + 20, z: bayPos.z + 20 };
    updateLatheWorkshop(state, 0.2, outsidePos, 5.0);
    expect(state.dwellTimer).toBeLessThan(0.8);
  });

  it("respects cooldown timer before allowing another bonus award", () => {
    const state = createLatheWorkshopState();
    const bayPos = { ...LATHE_WORKSHOP_BAY };

    // Trigger bonus first time
    updateLatheWorkshop(state, LATHE_WORKSHOP_DWELL_THRESHOLD + 0.1, bayPos, 0);
    expect(state.totalVisits).toBe(1);

    // Try to trigger again while cooldown active
    const secondEv = updateLatheWorkshop(state, LATHE_WORKSHOP_DWELL_THRESHOLD + 0.1, bayPos, 0);
    expect(secondEv.awardedLatheBonus).toBe(false);
    expect(state.totalVisits).toBe(1);

    // Expire cooldown
    state.cooldownTimer = 0;
    const thirdEv = updateLatheWorkshop(state, LATHE_WORKSHOP_DWELL_THRESHOLD + 0.1, bayPos, 0);
    expect(thirdEv.awardedLatheBonus).toBe(true);
    expect(state.totalVisits).toBe(2);
  });

  it("handles player honk within range of Tornacı Necati Usta", () => {
    const state = createLatheWorkshopState();
    const near = { x: NECATI_USTA_POS.x + 3, z: NECATI_USTA_POS.z + 3 };
    const far = { x: NECATI_USTA_POS.x + 60, z: NECATI_USTA_POS.z + 60 };

    expect(triggerLatheWorkshopHonk(state, near)).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(NECATI_USTA_CALLOUTS).toContain(state.lastHonkCallout);

    expect(triggerLatheWorkshopHonk(state, far)).toBe(false);
  });

  it("triggers periodic machine sound when vehicle is nearby", () => {
    const state = createLatheWorkshopState();
    state.machineSoundTimer = 0.05;

    const near = { ...LATHE_WORKSHOP_CENTER };
    const ev = updateLatheWorkshop(state, 0.1, near, 0);
    expect(ev.soundTriggered).toBe(true);
  });
});
