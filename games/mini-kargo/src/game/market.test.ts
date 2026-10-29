import { describe, it, expect, beforeEach } from "vitest";
import {
  createMarketState,
  updateMarket,
  triggerMarketHonk,
  MARKET_BAY,
  CEMIL_DAYI_POS,
  MARKET_BUFF_DURATION,
  MARKET_COOLDOWN,
  MARKET_DWELL_THRESHOLD,
  CEMIL_DAYI_CALLOUTS,
} from "./market";

describe("T54: Güneş Mahallesi Semt Pazarı & Manav Tezgahları Game Logic", () => {
  let state: ReturnType<typeof createMarketState>;

  beforeEach(() => {
    state = createMarketState();
  });

  it("initializes with default values", () => {
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.totalVisits).toBe(0);
    expect(state.serviceBay.x).toBe(MARKET_BAY.x);
    expect(state.serviceBay.z).toBe(MARKET_BAY.z);
  });

  it("accumulates dwell timer when player stops inside market bay", () => {
    const res = updateMarket(state, 0.5, MARKET_BAY, 0.0);
    expect(state.dwellTimer).toBeCloseTo(0.5);
    expect(res.awardedMarketBonus).toBe(false);
  });

  it("resets dwell timer when player is moving fast or outside bay", () => {
    state.dwellTimer = 0.8;
    updateMarket(state, 0.2, { x: 0, z: 0 }, 5.0);
    expect(state.dwellTimer).toBeLessThan(0.8);
  });

  it("awards market bonus, reputation, cash, nitro, and buff after dwelling threshold", () => {
    updateMarket(state, MARKET_DWELL_THRESHOLD - 0.1, MARKET_BAY, 0.0);
    const res = updateMarket(state, 0.2, MARKET_BAY, 0.0);

    expect(res.awardedMarketBonus).toBe(true);
    expect(res.cashBonus).toBe(10);
    expect(res.repBonus).toBe(1);
    expect(res.nitroRefill).toBe(true);
    expect(res.buffActive).toBe(true);
    expect(res.scaleSoundTriggered).toBe(true);
    expect(state.buffTimer).toBe(MARKET_BUFF_DURATION);
    expect(state.cooldownTimer).toBe(MARKET_COOLDOWN);
    expect(state.totalVisits).toBe(1);
    expect(state.lastHonkCallout).toBe(CEMIL_DAYI_CALLOUTS[0]);
  });

  it("does not re-award bonus while cooldown timer is active", () => {
    // Award first visit
    updateMarket(state, MARKET_DWELL_THRESHOLD + 0.1, MARKET_BAY, 0.0);
    expect(state.cooldownTimer).toBe(MARKET_COOLDOWN);

    // Dwell again immediately
    const res = updateMarket(state, MARKET_DWELL_THRESHOLD + 0.5, MARKET_BAY, 0.0);
    expect(res.awardedMarketBonus).toBe(false);
  });

  it("triggers Cemil Dayı greeting and callout on honk nearby", () => {
    const honked = triggerMarketHonk(state, CEMIL_DAYI_POS);
    expect(honked).toBe(true);
    expect(state.honkGreetingTimer).toBe(4.0);
    expect(CEMIL_DAYI_CALLOUTS).toContain(state.lastHonkCallout);
  });

  it("does not trigger honk callout when player is too far away", () => {
    const honked = triggerMarketHonk(state, { x: 50, z: 50 });
    expect(honked).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);
  });
});
