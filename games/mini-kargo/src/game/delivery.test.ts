import { describe, it, expect } from "vitest";
import {
  createDeliveryState,
  stepDelivery,
  type DeliveryState,
} from "./delivery";
import { getAvailableHomeIndices, getDistrictForHome } from "./districts";
import { createContactDamageTracker } from "./contact-damage";
import type { VehicleState, Vec2 } from "./types";
const depot = { x: 0, z: 0 },
  homes = [
    { x: 10, z: 0 },
    { x: 20, z: 0 },
    { x: 30, z: 0 },
  ];
const car = (position: Vec2, speed = 0): VehicleState => ({
  position,
  velocity: { x: speed, z: 0 },
  heading: 0,
  nitro: 1,
  drifting: false,
  steerAngle: 0,
  altitude: 0,
  verticalVelocity: 0,
  airborne: false,
});
function wait(state: DeliveryState, position: Vec2, seconds = 1.1) {
  for (let i = 0; i < Math.ceil(seconds * 60); i++)
    state = stepDelivery(state, car(position), depot, homes, 1 / 60);
  return state;
}
describe("delivery tour", () => {
  it("depotRequiresOneSecondStop", () => {
    let s = createDeliveryState();
    s = wait(s, depot, 0.5);
    expect(s.phase).toBe("loading");
    s = wait(s, depot, 0.6);
    expect(s.phase).toBe("delivering");
    expect(s.secondsLeft).toBeGreaterThan(44);
  });
  it("leavingZoneResetsHold", () => {
    let s = wait(createDeliveryState(), depot, 0.5);
    expect(s.holdSeconds).toBeGreaterThan(0.4);
    s = stepDelivery(s, car({ x: 5, z: 0 }), depot, homes, 1 / 60);
    expect(s.holdSeconds).toBe(0);
    s = wait(s, depot, 0.6);
    expect(s.phase).toBe("loading");
  });
  it("movingCarCannotLoad", () => {
    let s = createDeliveryState();
    for (let i = 0; i < 120; i++)
      s = stepDelivery(s, car(depot, 2), depot, homes, 1 / 60);
    expect(s.phase).toBe("loading");
  });
  it("wrongHouseDoesNotDeliver", () => {
    const s = wait(wait(createDeliveryState(), depot), homes[1], 2);
    expect(s.completed).toBe(0);
    expect(s.phase).toBe("delivering");
  });
  it("expiredBonusStillAllowsDelivery", () => {
    let s = wait(createDeliveryState(), depot);
    s = wait(s, { x: 5, z: 0 }, 46);
    s = wait(s, homes[0]);
    expect(s.completed).toBe(1);
    expect(s.score).toBe(100);
    expect(s.earnings).toBe(125);
    expect(s.reputation).toBe(1);
  });
  it("deliveryScoresOnce", () => {
    let s = wait(wait(createDeliveryState(), depot), homes[0]);
    const score = s.score;
    s = wait(s, homes[0], 3);
    expect(s.completed).toBe(1);
    expect(s.score).toBe(score);
  });
  it("thirdDeliveryEndsTour", () => {
    let s = createDeliveryState();
    for (let i = 0; i < 3; i++) {
      s = wait(s, depot);
      s = wait(s, homes[i]);
    }
    expect(s.completed).toBe(3);
    expect(s.phase).toBe("result");
    expect(s.score).toBeGreaterThan(300);
    expect(s.earnings).toBeGreaterThan(s.score);
    expect(s.reputation).toBeGreaterThan(0);
    const frozen = stepDelivery(s, car(depot), depot, homes, 1);
    expect(frozen.score).toBe(s.score);
  });
  it("packageTypesChangeAcrossStops", () => {
    let s = wait(createDeliveryState(), depot);
    expect(s.packageType).toBe("standard");
    s = wait(s, homes[0]);
    s = wait(s, depot);
    expect(s.packageType).toBe("urgent");
    s = wait(s, homes[1]);
    s = wait(s, depot);
    expect(s.packageType).toBe("fragile");
  });
  it("cargoUpgradeCarriesIntoNextDelivery", () => {
    let s = wait(createDeliveryState(1), depot);
    s = wait(s, homes[0]);
    expect(s.phase).toBe("delivering");
    expect(s.targetIndex).toBe(1);
    expect(s.packageSlot).toBe(2);
  });
  it("collisionDamagesFragilePackage", () => {
    let s = wait(createDeliveryState(), depot);
    s = stepDelivery(s, car(homes[0]), depot, homes, 0.1, 0.5);
    expect(s.packageDamage).toBeGreaterThan(0);
    expect(s.vehicleDamage).toBeGreaterThan(0);
  });
  it("companyLevelUnlocksDistrictReward", () => {
    const starter = createDeliveryState(0, 1);
    const market = createDeliveryState(0, 2);
    expect(starter.district).toBe("sunny");
    expect(market.district).toBe("market");
    let s = wait(market, depot);
    s = wait(s, homes[0]);
    expect(s.earnings).toBeGreaterThan(125);
  });
  it("only selects Sunny homes for company level 1", () => {
    const available = getAvailableHomeIndices(1);
    expect(available).toEqual([0, 1, 2, 3]);
    let state = createDeliveryState(0, 1);
    expect(available).toContain(state.targetIndex);
    expect(getDistrictForHome(state.targetIndex)).toBe("sunny");

    // Check consecutive deliveries across the tour
    for (let completed = 0; completed < 3; completed++) {
      state = stepDelivery(state, car(depot), depot, homes, 1, 0, 1);
      expect(available).toContain(state.targetIndex);
      expect(getDistrictForHome(state.targetIndex)).toBe("sunny");
    }
  });
  it("includes unlocked district homes as company level increases", () => {
    const level1Homes = getAvailableHomeIndices(1);
    const level2Homes = getAvailableHomeIndices(2);
    const level3Homes = getAvailableHomeIndices(3);
    const level4Homes = getAvailableHomeIndices(4);

    expect(level1Homes).toHaveLength(4);
    expect(level2Homes).toHaveLength(8);
    expect(level3Homes).toHaveLength(12);
    expect(level4Homes).toHaveLength(16);

    const stateL1 = createDeliveryState(0, 1);
    expect(level1Homes).toContain(stateL1.targetIndex);

    const stateL2 = createDeliveryState(0, 2);
    expect(level2Homes).toContain(stateL2.targetIndex);
    expect(getDistrictForHome(stateL2.targetIndex)).toBe("market");

    const stateL3 = createDeliveryState(0, 3);
    expect(level3Homes).toContain(stateL3.targetIndex);
    expect(getDistrictForHome(stateL3.targetIndex)).toBe("industrial");

    const stateL4 = createDeliveryState(0, 4);
    expect(level4Homes).toContain(stateL4.targetIndex);
    expect(getDistrictForHome(stateL4.targetIndex)).toBe("coastal");
  });
  it("restartClearsTour", () => {
    const s = createDeliveryState();
    expect(s.completed).toBe(0);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("loading");
  });
});


describe("package damage across deliveries", () => {
  it.each(["loading", "returning"] as const)("clears a new depot package during %s while retaining vehicle damage", phase => {
    const state = { ...createDeliveryState(), phase, packageDamage: 40, vehicleDamage: 27 };
    const loaded = stepDelivery(state, car(depot), depot, homes, 1);
    expect(loaded.phase).toBe("delivering");
    expect(loaded.packageDamage).toBe(0);
    expect(loaded.vehicleDamage).toBe(27);
    expect(state.packageDamage).toBe(40);
  });

  it("rewards the damaged package before clearing the next cargo slot", () => {
    const state: DeliveryState = {
      ...createDeliveryState(1), phase: "delivering", packageSlot: 1,
      secondsLeft: 0, packageDamage: 44, vehicleDamage: 27,
    };
    const next = stepDelivery(state, car(homes[0]), depot, homes, 1);
    expect(next.earnings).toBe(80);
    expect(next.safeDrivingBonus).toBe(0);
    expect(next.completed).toBe(1);
    expect(next.packageSlot).toBe(2);
    expect(next.packageType).toBe("urgent");
    expect(next.packageDamage).toBe(0);
    expect(next.vehicleDamage).toBe(27);
    expect(state.packageDamage).toBe(44);
  });

  it("retains the last package damage for the result screen", () => {
    const state: DeliveryState = {
      ...createDeliveryState(1), phase: "delivering", completed: 2,
      targetIndex: 2, packageSlot: 1, packageType: "fragile",
      secondsLeft: 0, packageDamage: 44, vehicleDamage: 27,
    };
    const result = stepDelivery(state, car(homes[2]), depot, homes, 1);
    expect(result.phase).toBe("result");
    expect(result.packageDamage).toBe(44);
    expect(result.vehicleDamage).toBe(27);
    expect(result.earnings).toBe(96);
    expect(result.safeDrivingBonus).toBe(0);
    expect(stepDelivery(result, car(depot), depot, homes, 1, 1)).toBe(result);
  });
});


describe("contact events applied to delivery damage", () => {
  it.each([30, 60, 120])("applies constant contact damage once at %i Hz", steps => {
    const tracker = createContactDamageTracker();
    let state: DeliveryState = { ...createDeliveryState(), phase: "delivering" };
    for (let i = 0; i < steps; i++) {
      const impact = tracker.update([{ id: "traffic:0", severity: 0.5 }], 1 / steps);
      state = stepDelivery(state, car({ x: 5, z: 0 }), depot, homes, 1 / steps, impact);
    }
    expect(state.packageDamage).toBeCloseTo(6);
    expect(state.vehicleDamage).toBeCloseTo(11);
  });

  it("applies peak increases and a separated second impact with fragile coefficients", () => {
    const tracker = createContactDamageTracker();
    let state: DeliveryState = {
      ...createDeliveryState(), phase: "delivering", packageType: "fragile",
    };
    for (const severity of [0.2, 0.6, 0.6]) {
      state = stepDelivery(state, car({ x: 5, z: 0 }), depot, homes, 0.01,
        tracker.update([{ id: "traffic:0", severity }], 0.01));
    }
    expect(state.packageDamage).toBeCloseTo(19.2);
    expect(state.vehicleDamage).toBeCloseTo(13.2);
    tracker.update([], 0.15);
    state = stepDelivery(state, car({ x: 5, z: 0 }), depot, homes, 0.01,
      tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01));
    expect(state.packageDamage).toBeCloseTo(35.2);
    expect(state.vehicleDamage).toBeCloseTo(24.2);
  });
});
