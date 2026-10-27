import { describe, expect, it } from "vitest";
import {
  canPurchaseUpgrade,
  tryPurchaseUpgrade,
  upgradeCost,
} from "./upgrades";

describe("upgrade purchase rules", () => {
  it("allows cargo upgrades up to level 3 at exact costs", () => {
    expect(canPurchaseUpgrade("cargo", 0, 220)).toBe(true);
    expect(canPurchaseUpgrade("cargo", 1, 440)).toBe(true);
    expect(canPurchaseUpgrade("cargo", 2, 660)).toBe(true);
  });

  it.each([3, 4, 10])("rejects cargo at level %i even with ample money", level => {
    expect(canPurchaseUpgrade("cargo", level, 10000)).toBe(false);
  });

  it.each(["engine", "brakes", "grip", "nitro"] as const)(
    "enforces max level 4 for %s",
    kind => {
      expect(canPurchaseUpgrade(kind, 3, 10000)).toBe(true);
      expect(canPurchaseUpgrade(kind, 4, 10000)).toBe(false);
    },
  );

  it.each([
    ["cargo", 0, 219],
    ["engine", 0, 179],
    ["brakes", 0, 159],
    ["engine", 2, 539],
    ["brakes", 2, 479],
  ] as const)("rejects %s level %i with insufficient money %i", (kind, level, money) => {
    expect(canPurchaseUpgrade(kind, level, money)).toBe(false);
  });

  it.each([
    ["engine", 0, 180],
    ["engine", 2, 540],
    ["brakes", 0, 160],
    ["brakes", 2, 480],
  ] as const)("preserves %s level %i cost %i and permits its purchase", (kind, level, cost) => {
    expect(upgradeCost(kind, level)).toBe(cost);
    expect(canPurchaseUpgrade(kind, level, cost)).toBe(true);
  });
});

describe("upgrade purchase transaction", () => {
  function state(money: number, cargo = 0) {
    return {
      money,
      upgrades: { engine: 2, brakes: 1, cargo },
      bestScore: 1500,
      reputation: 9,
      companyLevel: 3,
      completedDeliveries: 23,
      soundEnabled: false,
    };
  }

  it("buys the first cargo upgrade without mutating other progression or the original", () => {
    const original = state(500);
    const snapshot = structuredClone(original);
    const purchased = tryPurchaseUpgrade(original, "cargo");
    expect(purchased).not.toBe(original);
    expect(purchased.upgrades).not.toBe(original.upgrades);
    expect(purchased).toEqual({
      ...snapshot,
      money: 280,
      upgrades: { engine: 2, brakes: 1, cargo: 1 },
    });
    expect(original).toEqual(snapshot);
  });

  it.each([3, 4, 10])("preserves the same state and legacy cargo level %i on rejection", level => {
    const original = state(10000, level);
    const snapshot = structuredClone(original);
    expect(tryPurchaseUpgrade(original, "cargo")).toBe(original);
    expect(original).toEqual(snapshot);
  });

  it.each([
    ["cargo", 219],
    ["engine", 539],
    ["brakes", 319],
  ] as const)("preserves the same state when %s is unaffordable", (kind, money) => {
    const original = state(money);
    const snapshot = structuredClone(original);
    expect(tryPurchaseUpgrade(original, kind)).toBe(original);
    expect(original).toEqual(snapshot);
  });

  it.each([
    ["engine", 540, 3, 1],
    ["brakes", 320, 2, 2],
  ] as const)("buys %s at the existing cost %i while retaining legacy cargo", (kind, cost, engine, brakes) => {
    const original = state(1000, 8);
    const snapshot = structuredClone(original);
    expect(tryPurchaseUpgrade(original, kind)).toEqual({
      ...snapshot,
      money: 1000 - cost,
      upgrades: { engine, brakes, cargo: 8 },
    });
    expect(original).toEqual(snapshot);
  });

  it("spends the exact balance on cargo and rejects a repeated purchase", () => {
    const purchased = tryPurchaseUpgrade(state(220), "cargo");
    expect(purchased.money).toBe(0);
    expect(purchased.upgrades.cargo).toBe(1);
    expect(tryPurchaseUpgrade(purchased, "cargo")).toBe(purchased);
  });
});
