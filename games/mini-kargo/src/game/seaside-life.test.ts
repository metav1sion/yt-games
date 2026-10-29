import { describe, it, expect, vi } from "vitest";
import {
  createSeasideLifeState,
  updateSeasideLife,
  triggerSeasideHonk,
  TEA_CAFE_CENTER,
  FISHER_1_POS,
} from "./seaside-life";

describe("seaside life simulation logic", () => {
  it("initializes seaside life state correctly", () => {
    const state = createSeasideLifeState();
    expect(state.cafeCenter.x).toBe(TEA_CAFE_CENTER.x);
    expect(state.cafeCenter.z).toBe(TEA_CAFE_CENTER.z);
    expect(state.teaBuffTimer).toBe(0);
    expect(state.teaCooldown).toBe(0);
  });

  it("serves tea and activates 20s buff when stopping near cafe for 1 second", () => {
    const state = createSeasideLifeState();
    const sound = { teaSpoonClink: vi.fn(), fishingReel: vi.fn() };

    // 0.5 saniye dur
    let res = updateSeasideLife(state, { x: -60, z: 83.2 }, 0, 0.5, sound);
    expect(res.teaServed).toBe(false);
    expect(state.teaBuffTimer).toBe(0);

    // 0.6 saniye daha dur (toplam > 1.0s)
    res = updateSeasideLife(state, { x: -60, z: 83.2 }, 0, 0.6, sound);
    expect(res.teaServed).toBe(true);
    expect(res.rewardReputation).toBe(1);
    expect(res.teaBuffActive).toBe(true);
    expect(state.teaBuffTimer).toBe(20.0);
    expect(sound.teaSpoonClink).toHaveBeenCalled();
    expect(state.speechText).toContain("Rıza Dayı");
  });

  it("resets tea dwell timer if vehicle drives away fast", () => {
    const state = createSeasideLifeState();
    updateSeasideLife(state, { x: -60, z: 83.2 }, 0, 0.5);
    expect(state.teaDwellTimer).toBe(0.5);

    // Hızlanıp uzaklaş
    updateSeasideLife(state, { x: -50, z: 83.2 }, 8.0, 0.2);
    expect(state.teaDwellTimer).toBe(0);
  });

  it("triggers fisherman greeting and reel sound when player honks near pier", () => {
    const state = createSeasideLifeState();
    const sound = { fishingReel: vi.fn() };
    const particles = { spawnWaterSplash: vi.fn() };

    const honked = triggerSeasideHonk(state, { x: -50, z: 90 }, sound, particles);
    expect(honked).toBe(true);
    expect(state.fisherSpeechText).toContain("Salih Reis");
    expect(sound.fishingReel).toHaveBeenCalled();
    expect(particles.spawnWaterSplash).toHaveBeenCalled();
  });

  it("triggers cafe greeting when honking near cafe", () => {
    const state = createSeasideLifeState();
    const honked = triggerSeasideHonk(state, { x: -61, z: 82 });
    expect(honked).toBe(true);
    expect(state.speechText).toContain("Rıza Dayı");
  });
});
