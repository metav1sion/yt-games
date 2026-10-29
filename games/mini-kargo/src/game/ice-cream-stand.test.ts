import { describe, expect, it } from "vitest";
import {
  createIceCreamStandState,
  updateIceCreamStand,
  triggerIceCreamStandHonk,
  ICE_CREAM_STAND_CENTER,
  ICE_CREAM_BAY,
  ICE_CREAM_MASTER_ALI_POS,
  ICE_CREAM_BUFF_DURATION,
  ICE_CREAM_COOLDOWN,
  ICE_CREAM_DWELL_THRESHOLD,
  ICE_CREAM_MASTER_ALI_CALLOUTS,
} from "./ice-cream-stand";

describe("Sahil Maraş Dondurmacısı Game Logic", () => {
  it("initializes state with correct default parameters and positions", () => {
    const state = createIceCreamStandState();
    expect(state.center).toEqual(ICE_CREAM_STAND_CENTER);
    expect(state.serviceBay).toEqual(ICE_CREAM_BAY);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(state.trickActive).toBe(false);
  });

  it("accumulates dwell time and awards ice cream bonus upon stationary wait", () => {
    const state = createIceCreamStandState();
    const pos = { ...ICE_CREAM_BAY };

    // 0.5 saniye duraklama (eşik henüz aşılmadı)
    let ev = updateIceCreamStand(state, 0.5, pos, 0);
    expect(ev.awardedIceCreamBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.5);

    // Eşiği tamamlayan ek 0.8 saniye (toplam 1.3s >= 1.2s)
    ev = updateIceCreamStand(state, 0.8, pos, 0);
    expect(ev.awardedIceCreamBonus).toBe(true);
    expect(ev.cashBonus).toBe(10);
    expect(ev.repBonus).toBe(1);
    expect(ev.nitroRefill).toBe(true);
    expect(ev.bellRung).toBe(true);
    expect(ev.trickActive).toBe(true);
    expect(state.buffTimer).toBe(ICE_CREAM_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(ICE_CREAM_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(ev.callout).toBe(ICE_CREAM_MASTER_ALI_CALLOUTS[0]);
  });

  it("decays dwell timer when player leaves service bay or moves fast", () => {
    const state = createIceCreamStandState();
    const pos = { ...ICE_CREAM_BAY };

    updateIceCreamStand(state, 0.6, pos, 0);
    expect(state.dwellTimer).toBeCloseTo(0.6);

    // Araç hızlandığında
    updateIceCreamStand(state, 0.2, pos, 3.5);
    expect(state.dwellTimer).toBeLessThan(0.6);

    // Araç uzaklaştığında
    updateIceCreamStand(state, 0.5, { x: 50, z: 50 }, 0);
    expect(state.dwellTimer).toBe(0);
  });

  it("does not re-award bonus during active cooldown timer", () => {
    const state = createIceCreamStandState();
    const pos = { ...ICE_CREAM_BAY };

    // İlk mola ödülü
    updateIceCreamStand(state, ICE_CREAM_DWELL_THRESHOLD + 0.1, pos, 0);
    expect(state.cooldownTimer).toBe(ICE_CREAM_COOLDOWN);

    // Cooldown aktifken tekrar duraklama
    const ev = updateIceCreamStand(state, ICE_CREAM_DWELL_THRESHOLD + 0.1, pos, 0);
    expect(ev.awardedIceCreamBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("triggers paddle trick and callout on player vehicle honk within range", () => {
    const state = createIceCreamStandState();
    const closePos = {
      x: ICE_CREAM_MASTER_ALI_POS.x + 4.0,
      z: ICE_CREAM_MASTER_ALI_POS.z + 3.0,
    };

    const greeted = triggerIceCreamStandHonk(state, closePos);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(state.trickActive).toBe(true);
    expect(ICE_CREAM_MASTER_ALI_CALLOUTS).toContain(state.lastHonkCallout);

    // Menzil dışı korna testi
    const farPos = { x: 50.0, z: -50.0 };
    const farGreeted = triggerIceCreamStandHonk(state, farPos);
    expect(farGreeted).toBe(false);
  });

  it("decrements buff and cooldown timers over time", () => {
    const state = createIceCreamStandState();
    state.buffTimer = 10.0;
    state.cooldownTimer = 20.0;
    state.trickActive = true;
    state.trickTimer = 2.0;

    const ev = updateIceCreamStand(state, 1.5, { x: 0, z: 0 }, 5);
    expect(state.buffTimer).toBeCloseTo(8.5);
    expect(state.cooldownTimer).toBeCloseTo(18.5);
    expect(state.trickTimer).toBeCloseTo(0.5);
    expect(ev.buffActive).toBe(true);
  });
});
