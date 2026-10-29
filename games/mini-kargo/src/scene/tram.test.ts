import { describe, it, expect } from "vitest";
import { createTramView } from "./tram";
import { createTramState, TRAM_LINE_Z, TRAM_STATION_POS } from "../game/tram";

describe("scene/tram", () => {
  it("creates tram view hierarchy with static track, catenary, station, and tramcar", () => {
    const view = createTramView();

    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("carsi-heritage-tram");
    expect(view.obstacles.length).toBeGreaterThanOrEqual(3); // Bumpers & station platform

    // Check station obstacle
    const stationObs = view.obstacles.find(
      (o) =>
        o.minX <= TRAM_STATION_POS.x &&
        o.maxX >= TRAM_STATION_POS.x &&
        o.minZ <= TRAM_STATION_POS.z &&
        o.maxZ >= TRAM_STATION_POS.z,
    );
    expect(stationObs).toBeDefined();

    view.dispose();
  });

  it("updates tram position and driver posture on update", () => {
    const view = createTramView();
    const state = createTramState();
    state.position.x = 42.0;
    state.direction = 1;
    state.speed = 3.5;

    view.update(0.1, state, { x: 50, z: 34 }, false);

    const tramMesh = view.group.getObjectByName("nostalgic-tram-car");
    expect(tramMesh).toBeDefined();
    expect(tramMesh?.position.x).toBe(42.0);
    expect(tramMesh?.position.z).toBe(TRAM_LINE_Z);

    // Test reverse direction (-1)
    state.position.x = 60.0;
    state.direction = -1;
    view.update(0.1, state, { x: 50, z: 34 }, true);
    expect(tramMesh?.position.x).toBe(60.0);

    view.dispose();
  });

  it("animates waving arm and speech bubble when greeted by honk", () => {
    const view = createTramView();
    const state = createTramState();
    state.honkGreetingTimer = 2.5;
    state.lastHonkCallout = "🚋 Vatman İhsan: Çan çan! Yol kargonun!";

    // Update with active greeting
    expect(() => {
      view.update(0.016, state, { x: 42, z: 36 }, true);
    }).not.toThrow();

    view.dispose();
  });
});
