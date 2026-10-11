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
    });
  });
});
