import { describe, it, expect } from "vitest";
import { createFleetView } from "./fleet";
import type { ActiveCourierState } from "../game/fleet";

describe("FleetView 3D Visualizer", () => {
  it("creates a fleet group and manages courier models", () => {
    const fleetView = createFleetView();
    expect(fleetView.group).toBeDefined();

    const mockCourierState: ActiveCourierState = {
      courier: {
        id: "c1",
        name: "Selin Jet",
        level: 2,
        speed: 1.1,
        reliability: 0.95,
        wage: 25,
        assigned: true,
      },
      phase: "driving_to_target",
      position: { x: -50, z: -30 },
      heading: 0,
      targetHomeIndex: 1,
      waypoints: [{ x: -50, z: -30 }],
      waypointIndex: 0,
      timer: 0,
      currentSpeed: 10,
    };

    fleetView.update([mockCourierState], 0.1);
    expect(fleetView.group.children.length).toBe(1);

    // Kurye kaldırıldığında görseli de temizlenmeli
    fleetView.update([], 0.1);
    expect(fleetView.group.children.length).toBe(0);

    fleetView.dispose();
  });
});
