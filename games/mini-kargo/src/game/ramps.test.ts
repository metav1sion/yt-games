import { describe, it, expect } from "vitest";
import { checkRampLaunch, type Ramp } from "./ramps";
import type { VehicleState } from "./types";

const mockCar = (overrides: Partial<VehicleState> = {}): VehicleState => ({
  position: { x: 0, z: 0 },
  velocity: { x: 0, z: 12 },
  heading: 0,
  nitro: 1,
  drifting: false,
  steerAngle: 0,
  altitude: 0,
  verticalVelocity: 0,
  airborne: false,
  ...overrides,
});

describe("jump ramps mechanics", () => {
  const testRamp: Ramp = {
    id: "test_ramp",
    position: { x: 10, z: 10 },
    size: { x: 4.0, z: 5.0 },
    heading: 0, // Points towards +Z
    height: 2.0,
    launchSpeed: 8,
    launchMultiplier: 0.9,
  };

  it("launches car when entering ramp aligned with heading and sufficient speed", () => {
    const car = mockCar({
      position: { x: 10, z: 10 },
      velocity: { x: 0, z: 12 }, // 12 > 8
      heading: 0, // Same heading
    });

    const result = checkRampLaunch(car, [testRamp]);
    expect(result).not.toBeNull();
    expect(result!.ramp.id).toBe("test_ramp");
    expect(result!.launchSpeed).toBe(12);
    expect(result!.verticalVelocity).toBeCloseTo(12 * 0.9, 1);
  });

  it("does not launch car if speed is below launch threshold", () => {
    const car = mockCar({
      position: { x: 10, z: 10 },
      velocity: { x: 0, z: 5 }, // 5 < 8
      heading: 0,
    });

    const result = checkRampLaunch(car, [testRamp]);
    expect(result).toBeNull();
  });

  it("does not launch car if heading is opposite to ramp direction", () => {
    const car = mockCar({
      position: { x: 10, z: 10 },
      velocity: { x: 0, z: -12 },
      heading: Math.PI, // Facing opposite
    });

    const result = checkRampLaunch(car, [testRamp]);
    expect(result).toBeNull();
  });

  it("does not launch car if vehicle is outside ramp bounds", () => {
    const car = mockCar({
      position: { x: 20, z: 10 }, // 10 units away
      velocity: { x: 0, z: 12 },
      heading: 0,
    });

    const result = checkRampLaunch(car, [testRamp]);
    expect(result).toBeNull();
  });

  it("does not re-launch car if already high in the air above ramp", () => {
    const car = mockCar({
      position: { x: 10, z: 10 },
      velocity: { x: 0, z: 12 },
      heading: 0,
      altitude: 3.5, // Well above ramp height 2.0
      airborne: true,
    });

    const result = checkRampLaunch(car, [testRamp]);
    expect(result).toBeNull();
  });
});
