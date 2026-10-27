import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createBuyPad } from "../game/buy-pad";
import { createBuyPadVisual, createBuyPadsView } from "./buy-pad";

describe("BuyPad 3D Scene Visuals", () => {
  it("creates BuyPadVisual group with neon ring, disc, and fill mesh", () => {
    const pad = createBuyPad({
      id: "depot-upgrade",
      name: "Depo Genişletme",
      position: { x: 5, z: 15 },
      radius: 3.5,
      targetCost: 200,
    });

    const visual = createBuyPadVisual(pad);
    expect(visual.group).toBeInstanceOf(THREE.Group);
    expect(visual.group.position.x).toBe(5);
    expect(visual.group.position.z).toBe(15);

    // Initial update
    visual.update(pad, 0.1, false);
    expect(visual.group.children.length).toBeGreaterThanOrEqual(4);

    // Update with money transfer active
    pad.currentAmount = 100;
    visual.update(pad, 0.1, true);

    // Verify fill ring is visible when progress > 0
    const fillRing = visual.group.children.find(
      (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.RingGeometry,
    );
    expect(fillRing).toBeDefined();

    visual.dispose();
    expect(visual.group.children.length).toBe(0);
  });

  it("handles level completion wave and completed state visuals", () => {
    const pad = createBuyPad({
      id: "engine-upgrade",
      name: "Motor Güçlendirme",
      position: { x: 0, z: 0 },
      targetCost: 100,
    });

    const visual = createBuyPadVisual(pad);

    // Complete the pad
    pad.level = 1;
    pad.currentAmount = 100;
    visual.update(pad, 0.05, false);

    // Further progression to completed state
    pad.isCompleted = true;
    visual.update(pad, 0.05, false);

    visual.dispose();
  });

  it("manages multiple pads dynamically with createBuyPadsView", () => {
    const pad1 = createBuyPad({
      id: "pad-1",
      name: "Pad 1",
      position: { x: 0, z: 0 },
      targetCost: 100,
    });
    const pad2 = createBuyPad({
      id: "pad-2",
      name: "Pad 2",
      position: { x: 10, z: 10 },
      targetCost: 200,
    });

    const manager = createBuyPadsView([pad1, pad2]);
    expect(manager.group.children.length).toBe(2);

    // Update with pad-1 active
    manager.update([pad1, pad2], 0.1, "pad-1");

    // Remove pad-2 dynamically
    manager.update([pad1], 0.1, null);
    expect(manager.group.children.length).toBe(1);

    // Add a new pad dynamically
    const pad3 = createBuyPad({
      id: "pad-3",
      name: "Pad 3",
      position: { x: -10, z: -10 },
      targetCost: 300,
    });
    manager.update([pad1, pad3], 0.1, "pad-3");
    expect(manager.group.children.length).toBe(2);

    manager.dispose();
    expect(manager.group.children.length).toBe(0);
  });

  it("renders visuals for courier hiring and nitro station pads", () => {
    const courierPad = createBuyPad({
      id: "pad_hire_courier",
      name: "👥 Kurye İstihdam Ofisi",
      position: { x: -44, z: -32 },
      targetCost: 280,
    });
    const nitroPad = createBuyPad({
      id: "pad_nitro_station",
      name: "⚡ Hızlı Nitro İstasyonu",
      position: { x: -60, z: -24 },
      targetCost: 200,
    });

    const manager = createBuyPadsView([courierPad, nitroPad]);
    expect(manager.group.children.length).toBe(2);

    manager.update([courierPad, nitroPad], 0.1, "pad_hire_courier");
    expect(manager.group.children.length).toBe(2);

    manager.dispose();
    expect(manager.group.children.length).toBe(0);
  });
});
