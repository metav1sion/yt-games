import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createParkedVehicle } from "./parked-vehicle";

describe("ParkedVehicle 3D visual", () => {
  it("initializes at the specified position with stall floor lines and models", () => {
    const parked = createParkedVehicle({ x: -68, z: -32 });
    expect(parked.group).toBeInstanceOf(THREE.Group);
    expect(parked.group.position.x).toBe(-68);
    expect(parked.group.position.z).toBe(-32);

    // Initial state: not yet unlocked, should hide when update(dt, 'van', false)
    parked.update(0.1, "van", false);
    expect(parked.group.visible).toBe(false);

    // When unlocked, becomes visible
    parked.update(0.1, "van", true);
    expect(parked.group.visible).toBe(true);

    // When player is driving van, parked vehicle displays scooter
    expect(parked.getDisplayedVehicle()).toBe("scooter");

    // When player is driving scooter, parked vehicle displays van
    parked.update(0.1, "scooter", true);
    expect(parked.getDisplayedVehicle()).toBe("van");

    parked.dispose();
  });

  it("toggles 3D vehicle models and floating labels with setVehicleType", () => {
    const parked = createParkedVehicle({ x: -68, z: -32 });

    parked.setVehicleType("scooter");
    expect(parked.getDisplayedVehicle()).toBe("scooter");

    // Has meshes for scooter (2 wheels, etc.)
    const meshes: THREE.Mesh[] = [];
    parked.group.traverse((c) => {
      if (c instanceof THREE.Mesh) meshes.push(c);
    });
    expect(meshes.length).toBeGreaterThan(10);

    parked.setVehicleType("van");
    expect(parked.getDisplayedVehicle()).toBe("van");

    parked.dispose();
    expect(parked.group.children).toHaveLength(0);
  });
});
