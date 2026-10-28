import { describe, it, expect } from "vitest";
import { createTrafficLights, TRAFFIC_SIGNAL_LOCATIONS } from "./traffic-lights";

describe("TrafficLights", () => {
  it("initializes signals across major city intersections with vehicular and pedestrian heads", () => {
    const lights = createTrafficLights();
    expect(lights.signals).toHaveLength(TRAFFIC_SIGNAL_LOCATIONS.length);
    expect(lights.signals.length).toBeGreaterThanOrEqual(8);
    expect(lights.group.children).toHaveLength(TRAFFIC_SIGNAL_LOCATIONS.length);

    // Initial state
    const first = lights.signals[0];
    expect(first.redLensMat).toBeDefined();
    expect(first.greenLensMat).toBeDefined();
    expect(first.yellowLensMat).toBeDefined();
    expect(first.pedRedLensMat).toBeDefined();
    expect(first.pedGreenLensMat).toBeDefined();
  });

  it("cycles through green, yellow and red phases correctly over time", () => {
    const lights = createTrafficLights();

    // Start at t = 0 (z_green phase)
    lights.update(0.016, false);
    expect(lights.getPhase()).toBe("z_green");
    const zState = lights.getSignalState("z");
    expect(zState.vehicle).toBe("green");
    expect(zState.pedestrian).toBe("stop");

    const xState = lights.getSignalState("x");
    expect(xState.vehicle).toBe("red");
    expect(xState.pedestrian).toBe("walk");

    // Advance to yellow phase (t ~ 11.0s)
    lights.update(11.0, false);
    expect(lights.getPhase()).toBe("z_yellow");
    expect(lights.getSignalState("z").vehicle).toBe("yellow");

    // Advance to x_green phase (t ~ 16.0s total)
    lights.update(5.0, false);
    expect(lights.getPhase()).toBe("x_green");
    expect(lights.getSignalState("x").vehicle).toBe("green");
    expect(lights.getSignalState("z").vehicle).toBe("red");
  });

  it("boosts emissive intensity when isNightOrDusk is true", () => {
    const lights = createTrafficLights();
    const sigZ = lights.signals.find((s) => s.axis === "z")!;

    // Day time update
    lights.update(1.0, false);
    const dayIntensity = sigZ.greenLensMat.emissiveIntensity;

    // Night time update
    lights.update(0.016, true);
    const nightIntensity = sigZ.greenLensMat.emissiveIntensity;

    expect(nightIntensity).toBeGreaterThan(dayIntensity);
  });

  it("cleans up materials and meshes on dispose", () => {
    const lights = createTrafficLights();
    expect(lights.signals.length).toBeGreaterThan(0);
    lights.dispose();
    expect(lights.signals).toHaveLength(0);
    expect(lights.group.children).toHaveLength(0);
  });
});
