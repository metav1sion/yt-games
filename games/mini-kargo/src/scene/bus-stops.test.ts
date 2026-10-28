import { describe, it, expect } from "vitest";
import { createBusStops, BUS_STOP_LOCATIONS } from "./bus-stops";

describe("bus stops view", () => {
  it("initializes 4 district bus stops with shelters and signs", () => {
    const stops = createBusStops();
    expect(stops).toBeDefined();
    expect(stops.group.children.length).toBe(4);
    expect(BUS_STOP_LOCATIONS.length).toBe(4);
  });

  it("updates passenger head tracking and animations without error", () => {
    const stops = createBusStops();
    stops.update(0.1, { x: -44, z: -10 });
    stops.update(0.1, { x: 0, z: 0 });
    stops.update(0.1);
  });

  it("triggers wave animation on player honk in proximity", () => {
    const stops = createBusStops();
    // Near Güneş stop (-44, -14.2)
    const wavedNear = stops.onHonk({ x: -42, z: -14 });
    expect(wavedNear).toBe(true);

    // Far away in deep water or unpopulated corner
    const wavedFar = stops.onHonk({ x: 999, z: 999 });
    expect(wavedFar).toBe(false);

    // Update through the wave duration
    stops.update(0.5, { x: -42, z: -14 });
    stops.update(1.5, { x: -42, z: -14 });
  });

  it("disposes geometries and materials cleanly", () => {
    const stops = createBusStops();
    expect(stops.group.children.length).toBe(4);
    stops.dispose();
    expect(stops.group.children.length).toBe(0);
  });
});
