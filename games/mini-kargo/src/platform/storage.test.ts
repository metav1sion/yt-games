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
    }));
  it("invalidFieldsUseDefaults", () =>
    expect(
      createLocalStorageAdapter(
        memory('{"bestScore":-2,"soundEnabled":"yes"}'),
      ).load(),
    ).toEqual({ bestScore: 0, soundEnabled: true }));
  it("nullRecordUsesDefaults", () =>
    expect(createLocalStorageAdapter(memory("null")).load()).toEqual({
      bestScore: 0,
      soundEnabled: true,
    }));
  it("storageReadFailureUsesDefaults", () =>
    expect(
      createLocalStorageAdapter({
        getItem() {
          throw new Error("denied");
        },
        setItem() {},
      }).load(),
    ).toEqual({ bestScore: 0, soundEnabled: true }));
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
    expect(s.load()).toEqual({ bestScore: 500, soundEnabled: false });
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
    });
  });
});
