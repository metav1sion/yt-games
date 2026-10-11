import { describe, it, expect } from "vitest";
import { stepVehicle } from "./vehicle";
const car = () => ({
  position: { x: 0, z: 0 },
  velocity: { x: 0, z: 0 },
  heading: 0,
});
describe("driving", () => {
  it("releaseSlowsVehicle", () => {
    let s = car();
    for (let i = 0; i < 120; i++) s = stepVehicle(s, { x: 0, z: 1 }, 1 / 60);
    const speed = Math.hypot(s.velocity.x, s.velocity.z);
    for (let i = 0; i < 60; i++) s = stepVehicle(s, { x: 0, z: 0 }, 1 / 60);
    expect(Math.hypot(s.velocity.x, s.velocity.z)).toBeLessThan(speed * 0.1);
  });
  it("turnIsGradual", () => {
    const s = stepVehicle(
      { ...car(), velocity: { x: 0, z: 5 } },
      { x: 0, z: -1 },
      1 / 60,
    );
    expect(Math.abs(s.heading)).toBeGreaterThan(0);
    expect(Math.abs(s.heading)).toBeLessThan(0.1);
  });
  it("acceleratesWithoutTeleporting", () => {
    const s = stepVehicle(car(), { x: 1, z: 0 }, 1 / 60);
    expect(Math.hypot(s.velocity.x, s.velocity.z)).toBeGreaterThan(0);
    expect(Math.hypot(s.position.x, s.position.z)).toBeLessThan(0.02);
  });
});
