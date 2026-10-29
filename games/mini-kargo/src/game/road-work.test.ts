import { describe, it, expect, vi } from "vitest";
import {
  createRoadWorkState,
  updateRoadWork,
  triggerRoadWorkHonk,
  isInsideRoadWorkZone,
  ROAD_WORK_CENTER,
} from "./road-work";

describe("road work simulation logic", () => {
  it("initializes road work state with defaults", () => {
    const state = createRoadWorkState();
    expect(state.center.x).toBe(ROAD_WORK_CENTER.x);
    expect(state.center.z).toBe(ROAD_WORK_CENTER.z);
    expect(state.inZone).toBe(false);
    expect(state.cooldownTimer).toBe(0);
    expect(state.flasherActive).toBe(true);
  });

  it("identifies positions inside road work zone correctly", () => {
    expect(isInsideRoadWorkZone({ x: 26, z: -16 })).toBe(true);
    expect(isInsideRoadWorkZone({ x: 20, z: -17 })).toBe(true);
    expect(isInsideRoadWorkZone({ x: 0, z: 0 })).toBe(false);
    expect(isInsideRoadWorkZone({ x: 50, z: -16 })).toBe(false);
  });

  it("awards safe passing bonus when passing at safe speed", () => {
    const state = createRoadWorkState();
    const sound = { constructionDrill: vi.fn() };
    const particles = { spawnConstructionDust: vi.fn() };

    // 1. Şantiye yakınına yaklaş
    updateRoadWork(state, { x: 17, z: -16 }, 8.0, 0.1, sound, particles);
    expect(state.inZone).toBe(false);

    // 2. Şantiyeye güvenli hızda gir
    updateRoadWork(state, { x: 22, z: -16 }, 8.0, 0.1, sound, particles);
    expect(state.inZone).toBe(true);
    expect(state.violation).toBe(false);

    // 3. Şantiyeden güvenle çık
    const res = updateRoadWork(state, { x: 35, z: -16 }, 8.0, 0.1, sound, particles);
    expect(state.inZone).toBe(false);
    expect(res.safePassAwarded).toBe(true);
    expect(res.rewardMoney).toBe(15);
    expect(res.rewardReputation).toBe(1);
    expect(state.cooldownTimer).toBeGreaterThan(0);
  });

  it("disqualifies safe pass reward if driver speeds through work zone", () => {
    const state = createRoadWorkState();

    // 1. Şantiyeye gir
    updateRoadWork(state, { x: 22, z: -16 }, 14.0, 0.1);
    expect(state.inZone).toBe(true);
    expect(state.violation).toBe(true);
    expect(state.speechText).toContain("Yavaş");

    // 2. Şantiyeden çık
    const res = updateRoadWork(state, { x: 35, z: -16 }, 14.0, 0.1);
    expect(res.safePassAwarded).toBe(false);
    expect(res.rewardMoney).toBe(0);
  });

  it("triggers worker greeting when player honks nearby", () => {
    const state = createRoadWorkState();

    // Uzaktayken korna çal
    const farHonk = triggerRoadWorkHonk(state, { x: -50, z: 0 });
    expect(farHonk).toBe(false);
    expect(state.speechText).toBeNull();

    // Şantiye yanındayken korna çal
    const nearHonk = triggerRoadWorkHonk(state, { x: 25, z: -17 });
    expect(nearHonk).toBe(true);
    expect(state.speechText).toContain("Kadir Usta");
    expect(state.speechTimer).toBe(3.0);
  });

  it("flashes the beacon light over time intervals", () => {
    const state = createRoadWorkState();
    const initialFlash = state.flasherActive;

    updateRoadWork(state, { x: 0, z: 0 }, 0, 0.5);
    expect(state.flasherActive).toBe(!initialFlash);
  });
});
