import { describe, it, expect } from "vitest";
import { createHealthClinicView } from "./health-clinic";
import { createHealthClinicState, DR_HIKMET_POS } from "../game/health-clinic";

describe("Health Clinic 3D Scene View", () => {
  it("creates health clinic scene hierarchy with neoclassical building, pharmacy wing, ambulance, and obstacles", () => {
    const view = createHealthClinicView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("health-clinic-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(obs.maxX);
    expect(obs.minZ).toBeLessThan(obs.maxZ);
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createHealthClinicView();
    const state = createHealthClinicState();

    // Day update
    expect(() => {
      view.update(0.016, state, { x: DR_HIKMET_POS.x + 5, z: DR_HIKMET_POS.z + 5 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range", () => {
    const view = createHealthClinicView();
    const near = { x: DR_HIKMET_POS.x + 2, z: DR_HIKMET_POS.z + 2 };
    const far = { x: DR_HIKMET_POS.x + 50, z: DR_HIKMET_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly", () => {
    const view = createHealthClinicView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
