import { describe, it, expect } from "vitest";
import {
  createCoffeeHouseState,
  updateCoffeeHouse,
  triggerCoffeeHouseHonk,
  COFFEE_HOUSE_BAY,
  COFFEE_BUFF_DURATION,
  COFFEE_COOLDOWN,
  COFFEE_DWELL_THRESHOLD,
  COFFEE_MASTER_BEKIR_CALLOUTS,
} from "./coffee-house";

describe("Coffee House Game Logic (T48)", () => {
  it("initializes with correct defaults", () => {
    const state = createCoffeeHouseState();
    expect(state.serviceBay.x).toBe(COFFEE_HOUSE_BAY.x);
    expect(state.serviceBay.z).toBe(COFFEE_HOUSE_BAY.z);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
  });

  it("dwells when vehicle stops in the service bay and awards pitstop bonus", () => {
    const state = createCoffeeHouseState();
    const pos = { ...COFFEE_HOUSE_BAY };

    // 0.5 saniye bekleme: henüz ödül verilmemeli
    const ev1 = updateCoffeeHouse(state, 0.5, pos, 0.5);
    expect(ev1.awardedCoffeeBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.5);

    // Kalan süreyi tamamlama (toplam >= 1.2s)
    const ev2 = updateCoffeeHouse(state, 0.8, pos, 0.2);
    expect(ev2.awardedCoffeeBonus).toBe(true);
    expect(ev2.cashBonus).toBe(10);
    expect(ev2.repBonus).toBe(1);
    expect(ev2.nitroRefill).toBe(true);
    expect(ev2.dicePlayed).toBe(true);
    expect(state.buffTimer).toBe(COFFEE_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(COFFEE_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
  });

  it("does not award bonus during active cooldown", () => {
    const state = createCoffeeHouseState();
    const pos = { ...COFFEE_HOUSE_BAY };

    // İlk ziyaret
    updateCoffeeHouse(state, COFFEE_DWELL_THRESHOLD + 0.1, pos, 0);
    expect(state.cooldownTimer).toBe(COFFEE_COOLDOWN);

    // Hemen ardından tekrar duraklama
    const ev = updateCoffeeHouse(state, COFFEE_DWELL_THRESHOLD + 0.1, pos, 0);
    expect(ev.awardedCoffeeBonus).toBe(false);
    expect(state.totalVisits).toBe(1);
  });

  it("decrements dwell timer when vehicle moves away or drives fast", () => {
    const state = createCoffeeHouseState();
    const pos = { ...COFFEE_HOUSE_BAY };

    updateCoffeeHouse(state, 0.6, pos, 0.2);
    expect(state.dwellTimer).toBeCloseTo(0.6);

    // Hızlı hareket veya uzaklaşma
    updateCoffeeHouse(state, 0.2, pos, 4.0);
    expect(state.dwellTimer).toBeLessThan(0.6);
  });

  it("responds to vehicle honking within greeting range", () => {
    const state = createCoffeeHouseState();
    const nearPos = { x: COFFEE_HOUSE_BAY.x + 4, z: COFFEE_HOUSE_BAY.z - 4 };

    const greeted = triggerCoffeeHouseHonk(state, nearPos);
    expect(greeted).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(COFFEE_MASTER_BEKIR_CALLOUTS).toContain(state.lastHonkCallout);

    // Çok uzaktan çalınan kornayı karşılamaz
    const farPos = { x: -80, z: -80 };
    const greetedFar = triggerCoffeeHouseHonk(state, farPos);
    expect(greetedFar).toBe(false);
  });

  it("updates timers and triggers periodic dice roll sound when near", () => {
    const state = createCoffeeHouseState();
    state.buffTimer = 10;
    state.cooldownTimer = 20;
    state.diceSoundTimer = 0.1;

    const ev = updateCoffeeHouse(state, 0.2, COFFEE_HOUSE_BAY, 2.0);
    expect(state.buffTimer).toBeCloseTo(9.8);
    expect(state.cooldownTimer).toBeCloseTo(19.8);
    expect(ev.dicePlayed).toBe(true);
  });
});
