import { describe, expect, it } from "vitest";
import { createContactDamageTracker, staticCollisionContacts } from "./contact-damage";

describe("contact damage tracker", () => {
  it.each([30, 60, 120])("counts constant contact once over %i steps", steps => {
    const tracker = createContactDamageTracker();
    let total = 0;
    for (let i = 0; i < steps; i++)
      total += tracker.update([{ id: "traffic:0", severity: 0.5 }], 1 / steps);
    expect(total).toBeCloseTo(0.5);
  });

  it("adds only increases above the contact's previous peak", () => {
    const tracker = createContactDamageTracker();
    const impacts = [0.2, 0.1, 0.6, 0.4, 0.6].map(severity =>
      tracker.update([{ id: "traffic:0", severity }], 0.01));
    expect(impacts).toEqual([0.2, 0, 0.6 - 0.2, 0, 0]);
    expect(impacts.reduce((sum, impact) => sum + impact, 0)).toBeCloseTo(0.6);
  });

  it("tracks each vehicle and pedestrian separately", () => {
    const tracker = createContactDamageTracker();
    expect(tracker.update([
      { id: "traffic:0", severity: 0.2 },
      { id: "traffic:1", severity: 0.3 },
      { id: "pedestrian:0", severity: 0.4 },
    ], 0.01)).toBeCloseTo(0.9);
    expect(tracker.update([
      { id: "traffic:0", severity: 0.2 },
      { id: "pedestrian:0", severity: 0.5 },
    ], 0.01)).toBeCloseTo(0.1);
  });

  it("does not double count duplicate samples of the same source", () => {
    const tracker = createContactDamageTracker();
    expect(tracker.update([
      { id: "wall:0", severity: 0.5 },
      { id: "wall:0", severity: 0.2 },
    ], 0.01)).toBe(0.5);
  });

  it("keeps the peak across a separation shorter than 150 ms", () => {
    const tracker = createContactDamageTracker();
    tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01);
    tracker.update([], 0.149);
    expect(tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.1)).toBe(0);
    tracker.update([], 0.1);
    expect(tracker.update([{ id: "traffic:0", severity: 0.6 }], 0.01)).toBeCloseTo(0.1);
  });

  it.each([0.15, 0.2])("rearms after %f seconds without contact", gap => {
    const tracker = createContactDamageTracker();
    tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01);
    tracker.update([], gap / 3);
    tracker.update([], gap / 3);
    tracker.update([], gap / 3);
    expect(tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01)).toBe(0.5);
  });

  it("only rearms sources that have been absent", () => {
    const tracker = createContactDamageTracker();
    const a = { id: "traffic:0", severity: 0.5 };
    const b = { id: "traffic:1", severity: 0.5 };
    tracker.update([a, b], 0.01);
    tracker.update([a], 0.15);
    expect(tracker.update([a, b], 0.01)).toBe(0.5);
  });

  it("reset removes all previous contact peaks and separation times", () => {
    const tracker = createContactDamageTracker();
    tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01);
    tracker.update([], 0.1);
    tracker.reset();
    expect(tracker.update([{ id: "traffic:0", severity: 0.5 }], 0.01)).toBe(0.5);
  });
});

describe("static collision contacts", () => {
  const bounds = { minX: -30, maxX: 30, minZ: -25, maxZ: 25 };
  const obstacles = [{ minX: 10, maxX: 12, minZ: -2, maxZ: 2 }];

  it.each([30, 60, 120])("uses pre-collision speed rather than displacement at %i Hz", steps => {
    const contacts = staticCollisionContacts(
      { x: 9.35 + 5 / steps, z: 0 }, { x: 9.35, z: 0 },
      { x: 5, z: 0 }, obstacles, bounds,
    );
    expect(contacts).toEqual([{ id: "obstacle:0", severity: 0.5 }]);
  });

  it("caps the normalized speed and identifies the contacted boundary", () => {
    expect(staticCollisionContacts(
      { x: 30, z: 0 }, { x: 29.35, z: 0 },
      { x: 20, z: 0 }, obstacles, bounds,
    )).toEqual([{ id: "boundary:right", severity: 1 }]);
  });

  it("does not emit an impact for unobstructed movement", () => {
    expect(staticCollisionContacts(
      { x: 5, z: 0 }, { x: 5, z: 0 },
      { x: 5, z: 0 }, obstacles, bounds,
    )).toEqual([]);
  });
});
