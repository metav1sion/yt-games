import { describe, it, expect } from "vitest";
import {
  districts,
  districtForLevel,
  districtById,
  getAvailableHomeIndices,
  getDistrictForHome,
} from "./districts";
import { createWorld } from "../scene/world";

describe("districts configuration", () => {
  it("contains 4 distinct districts in progressive order", () => {
    expect(districts).toHaveLength(4);
    expect(districts.map((d) => d.id)).toEqual([
      "sunny",
      "market",
      "industrial",
      "coastal",
    ]);
  });

  it("unlocks districts progressively based on company level", () => {
    expect(districtForLevel(1).id).toBe("sunny");
    expect(districtForLevel(2).id).toBe("market");
    expect(districtForLevel(3).id).toBe("industrial");
    expect(districtForLevel(4).id).toBe("coastal");
    expect(districtForLevel(10).id).toBe("coastal");
  });

  it("scales reward multipliers appropriately", () => {
    const multipliers = districts.map((d) => d.rewardMultiplier);
    expect(multipliers).toEqual([1.0, 1.15, 1.3, 1.45]);
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeGreaterThan(multipliers[i - 1]);
    }
  });

  it("looks up districts by ID correctly with fallback", () => {
    expect(districtById("sunny").name).toBe("GÜNEŞ MAHALLESİ");
    expect(districtById("market").name).toBe("ÇARŞI BÖLGESİ");
    expect(districtById("industrial").name).toBe("SANAYİ BÖLGESİ");
    expect(districtById("coastal").name).toBe("SAHİL ŞERİDİ");
  });

  it("maps home indices to corresponding districts correctly", () => {
    expect(getDistrictForHome(0)).toBe("sunny");
    expect(getDistrictForHome(3)).toBe("sunny");
    expect(getDistrictForHome(4)).toBe("market");
    expect(getDistrictForHome(7)).toBe("market");
    expect(getDistrictForHome(8)).toBe("industrial");
    expect(getDistrictForHome(11)).toBe("industrial");
    expect(getDistrictForHome(12)).toBe("coastal");
    expect(getDistrictForHome(15)).toBe("coastal");
  });

  it("filters available delivery home indices based on company level", () => {
    // Seviye 1: Sadece Güneş (4 ev)
    expect(getAvailableHomeIndices(1)).toEqual([0, 1, 2, 3]);
    // Seviye 2: Güneş + Çarşı (8 ev)
    expect(getAvailableHomeIndices(2)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    // Seviye 3: Güneş + Çarşı + Sanayi (12 ev)
    expect(getAvailableHomeIndices(3)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    // Seviye 4: Tüm 16 ev
    expect(getAvailableHomeIndices(4)).toHaveLength(16);
  });
});

describe("expanded 200x200 world architecture & barriers", () => {
  it("creates a world with ~200x200 boundaries", () => {
    const world = createWorld();
    expect(world.bounds).toEqual({
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100,
    });
  });

  it("contains at least 16 distributed delivery target homes", () => {
    const world = createWorld();
    expect(world.homes.length).toBeGreaterThanOrEqual(16);

    world.homes.forEach((home) => {
      expect(home.x).toBeGreaterThanOrEqual(world.bounds.minX);
      expect(home.x).toBeLessThanOrEqual(world.bounds.maxX);
      expect(home.z).toBeGreaterThanOrEqual(world.bounds.minZ);
      expect(home.z).toBeLessThanOrEqual(world.bounds.maxZ);
    });
  });

  it("places depot inside Sunny District boundaries", () => {
    const world = createWorld();
    expect(world.depot.x).toBeLessThan(0); // Batı
    expect(world.depot.z).toBeLessThan(0); // Kuzey
  });

  it("dynamically manages road barriers and obstacle lists when level increases", () => {
    const world = createWorld();

    // Seviye 1: Market, Industrial ve Coastal kilitli olmalı
    const level1ObstacleCount = world.obstacles.length;
    expect(world.barriers.find((b) => b.districtId === "market")?.group.visible).toBe(true);
    expect(world.barriers.find((b) => b.districtId === "industrial")?.group.visible).toBe(true);
    expect(world.barriers.find((b) => b.districtId === "coastal")?.group.visible).toBe(true);

    // Seviye 2'ye yüksel
    const unlockedLevel2 = world.updateUnlockedDistricts(2);
    expect(unlockedLevel2).toEqual(["market"]);
    expect(world.barriers.find((b) => b.districtId === "market")?.group.visible).toBe(false);
    expect(world.obstacles.length).toBeLessThan(level1ObstacleCount);

    // Seviye 3'e yüksel
    const unlockedLevel3 = world.updateUnlockedDistricts(3);
    expect(unlockedLevel3).toEqual(["industrial"]);
    expect(world.barriers.find((b) => b.districtId === "industrial")?.group.visible).toBe(false);

    // Seviye 4'e yüksel
    const unlockedLevel4 = world.updateUnlockedDistricts(4);
    expect(unlockedLevel4).toEqual(["coastal"]);
    expect(world.barriers.find((b) => b.districtId === "coastal")?.group.visible).toBe(false);
  });
});
