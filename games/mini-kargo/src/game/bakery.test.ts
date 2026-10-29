import { describe, it, expect, beforeEach } from "vitest";
import {
  createBakeryState,
  updateBakery,
  triggerBakeryHonk,
  BAKERY_CENTER,
  BAKERY_BAY,
  SABAN_USTA_POS,
  BAKERY_BUFF_DURATION,
  BAKERY_COOLDOWN,
  BAKERY_DWELL_THRESHOLD,
  SABAN_USTA_CALLOUTS,
} from "./bakery";

describe("T52: Çarşı Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi Game Logic", () => {
  let state = createBakeryState();

  beforeEach(() => {
    state = createBakeryState();
  });

  it("initializes bakery state correctly", () => {
    expect(state.center.x).toBe(BAKERY_CENTER.x);
    expect(state.center.z).toBe(BAKERY_CENTER.z);
    expect(state.serviceBay.x).toBe(BAKERY_BAY.x);
    expect(state.serviceBay.z).toBe(BAKERY_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("updates oven glow phase and peel swing phase over time", () => {
    const prevGlow = state.ovenGlowPhase;
    const prevPeel = state.peelSwingPhase;
    updateBakery(state, 0.5, { x: 0, z: 0 }, 10);
    expect(state.ovenGlowPhase).not.toBe(prevGlow);
    expect(state.peelSwingPhase).not.toBe(prevPeel);
  });

  it("does not award simit bonus if player is driving fast past the bakery", () => {
    const event = updateBakery(state, 1.5, { ...BAKERY_BAY }, 12.0); // High speed
    expect(event.awardedSimitBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
  });

  it("awards simit bonus when player stops at bakery bay for required dwell time", () => {
    // 0.6 seconds - not yet enough
    let event = updateBakery(state, 0.6, { ...BAKERY_BAY }, 0.2);
    expect(event.awardedSimitBonus).toBe(false);
    expect(state.dwellTimer).toBeGreaterThanOrEqual(0.6);

    // Another 0.7 seconds (total 1.3s >= 1.2s threshold)
    event = updateBakery(state, 0.7, { ...BAKERY_BAY }, 0.1);
    expect(event.awardedSimitBonus).toBe(true);
    expect(event.cashBonus).toBe(10);
    expect(event.repBonus).toBe(1);
    expect(event.nitroRefill).toBe(true);
    expect(event.ovenSoundTriggered).toBe(true);
    expect(state.buffTimer).toBe(BAKERY_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(BAKERY_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.lastHonkCallout).toBe(SABAN_USTA_CALLOUTS[0]);
  });

  it("respects cooldown timer after simit bonus is awarded", () => {
    // Trigger bonus
    updateBakery(state, BAKERY_DWELL_THRESHOLD + 0.1, { ...BAKERY_BAY }, 0);
    expect(state.buffTimer).toBe(BAKERY_BUFF_DURATION);

    // Try again immediately while in cooldown
    const event = updateBakery(state, BAKERY_DWELL_THRESHOLD + 0.1, { ...BAKERY_BAY }, 0);
    expect(event.awardedSimitBonus).toBe(false);
  });

  it("triggers Şaban Usta greeting callout when honking nearby", () => {
    // Far away honk -> no greeting
    let honked = triggerBakeryHonk(state, { x: 100, z: 100 });
    expect(honked).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);

    // Nearby honk -> greeting triggered
    honked = triggerBakeryHonk(state, { ...SABAN_USTA_POS });
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(SABAN_USTA_CALLOUTS).toContain(state.lastHonkCallout);
  });
});
