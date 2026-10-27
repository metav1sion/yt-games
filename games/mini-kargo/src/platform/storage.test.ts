import { describe, it, expect } from "vitest";
import { createLocalStorageAdapter } from "./storage";
function memory(initial: string | null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}
describe("safe preferences", () => {
  it("invalidJsonUsesDefaults", () =>
    expect(createLocalStorageAdapter(memory("{broken")).load()).toEqual({
      bestScore: 0,
      soundEnabled: true,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    }));
  it("invalidFieldsUseDefaults", () =>
    expect(
      createLocalStorageAdapter(
        memory('{"bestScore":-2,"soundEnabled":"yes"}'),
      ).load(),
    ).toEqual({
      bestScore: 0,
      soundEnabled: true,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    }));
  it("nullRecordUsesDefaults", () =>
    expect(createLocalStorageAdapter(memory("null")).load()).toEqual({
      bestScore: 0,
      soundEnabled: true,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    }));
  it("storageReadFailureUsesDefaults", () =>
    expect(
      createLocalStorageAdapter({
        getItem() {
          throw new Error("denied");
        },
        setItem() {},
      }).load(),
    ).toEqual({
      bestScore: 0,
      soundEnabled: true,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    }));
  it("storageWriteFailureDoesNotThrow", () =>
    expect(() =>
      createLocalStorageAdapter({
        getItem: () => null,
        setItem() {
          throw new Error("quota");
        },
      }).save({ bestScore: 150, soundEnabled: false }),
    ).not.toThrow());
  it("bestScoreNeverDecreases", () => {
    const s = createLocalStorageAdapter(
      memory('{"bestScore":500,"soundEnabled":true}'),
    );
    s.save({ bestScore: 100, soundEnabled: false });
    expect(s.load()).toEqual({
      bestScore: 500,
      soundEnabled: false,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    });
  });
  it("newRecordAndSoundPreferencePersist", () => {
    const backing = memory(null);
    createLocalStorageAdapter(backing).save({
      bestScore: 600,
      soundEnabled: false,
    });
    expect(createLocalStorageAdapter(backing).load()).toEqual({
      bestScore: 600,
      soundEnabled: false,
      money: 0,
      reputation: 0,
      companyLevel: 1,
      completedDeliveries: 0,
      upgrades: { engine: 0, brakes: 0, cargo: 0 },
      unlockedVehicles: ["van"],
      currentVehicle: "van",
      unlockedDistricts: ["sunny"],
    });
  });
  it("persists unlocked vehicles and current vehicle switch", () => {
    const backing = memory(null);
    const adapter = createLocalStorageAdapter(backing);
    adapter.save({
      unlockedVehicles: ["van", "scooter"],
      currentVehicle: "scooter",
    });
    expect(adapter.load().unlockedVehicles).toEqual(["van", "scooter"]);
    expect(adapter.load().currentVehicle).toBe("scooter");
  });
  it("falls back to van if currentVehicle is not unlocked", () => {
    const backing = memory(null);
    const adapter = createLocalStorageAdapter(backing);
    adapter.save({
      unlockedVehicles: ["van"],
      currentVehicle: "scooter",
    });
    expect(adapter.load().currentVehicle).toBe("van");
  });
  it("persists unlocked districts and includes company level districts", () => {
    const backing = memory(null);
    const adapter = createLocalStorageAdapter(backing);
    adapter.save({
      unlockedDistricts: ["sunny", "market"],
    });
    expect(adapter.load().unlockedDistricts).toEqual(["sunny", "market"]);

    // Seviye arttığında ilgili bölge otomatik eklenir
    adapter.save({
      companyLevel: 3,
    });
    expect(adapter.load().unlockedDistricts).toContain("market");
    expect(adapter.load().unlockedDistricts).toContain("industrial");
  });
});
