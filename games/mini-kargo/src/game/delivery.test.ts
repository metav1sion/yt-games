import { describe, it, expect } from "vitest";
import {
  createDeliveryState,
  stepDelivery,
  type DeliveryState,
} from "./delivery";
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
    const frozen = stepDelivery(s, car(depot), depot, homes, 1);
    expect(frozen.score).toBe(s.score);
  });
  it("restartClearsTour", () => {
    const s = createDeliveryState();
    expect(s.completed).toBe(0);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("loading");
  });
});
