import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createDeliveryStations } from "./delivery-stations";
import type { Vec2 } from "../game/types";

describe("DeliveryStations", () => {
  const dummyHomes: Vec2[] = Array.from({ length: 16 }, (_, i) => ({
    x: (i % 4) * 20 - 30,
    z: Math.floor(i / 4) * 20 - 30,
  }));

  it("creates 16 distinctive stations with character models and props", () => {
    const stationsView = createDeliveryStations(dummyHomes);
    expect(stationsView.stations).toHaveLength(16);
    expect(stationsView.group.children).toHaveLength(16);

    const stats = stationsView.getStationStats();
    expect(stats.totalStations).toBe(16);
    expect(stats.totalDeliveredParcels).toBe(0);

    // Verify district specialization
    const sunnyStation = stationsView.stations[0];
    expect(sunnyStation.kind).toBe("porch");
    expect(sunnyStation.characterGroup).toBeDefined();

    const marketStation = stationsView.stations[4];
    expect(marketStation.kind).toBe("store");

    const industrialStation = stationsView.stations[8];
    expect(industrialStation.kind).toBe("pallet");

    const coastalStation = stationsView.stations[12];
    expect(coastalStation.kind).toBe("dock");
  });

  it("triggers wave animation for target delivery station when approaching", () => {
    const stationsView = createDeliveryStations(dummyHomes);
    const targetStation = stationsView.stations[2];

    // Initial arm rotation
    stationsView.update(0.016, -1, false);
    const initialRot = targetStation.rightArmPivot.rotation.z;

    // Approaching with delivery active
    stationsView.update(0.1, 2, true);
    expect(targetStation.rightArmPivot.rotation.z).not.toBe(initialRot);
    expect(targetStation.waveTimer).toBeGreaterThan(0);
  });

  it("triggers celebration jump and stacks delivered parcels upon onDelivered", () => {
    const stationsView = createDeliveryStations(dummyHomes);
    const targetStation = stationsView.stations[5];

    expect(targetStation.deliveredCount).toBe(0);
    expect(targetStation.deliveredParcelsGroup.children).toHaveLength(0);

    // First delivery (cold chain)
    stationsView.onDelivered(5, "cold_chain");
    expect(targetStation.deliveredCount).toBe(1);
    expect(targetStation.celebrateTimer).toBeGreaterThan(0);
    expect(targetStation.deliveredParcelsGroup.children).toHaveLength(1);

    // Update animation should jump
    stationsView.update(0.05, 5, false);
    expect(targetStation.characterGroup.position.y).toBeGreaterThan(0);
    expect(targetStation.leftArmPivot.rotation.z).toBeGreaterThan(1.5); // Arms up celebration

    // Multiple deliveries up to clamp
    stationsView.onDelivered(5, "vip_express");
    stationsView.onDelivered(5, "heavy_freight");
    stationsView.onDelivered(5, "standard");
    expect(targetStation.deliveredCount).toBe(4);
    expect(targetStation.deliveredParcelsGroup.children).toHaveLength(3); // Clamped visual stack
  });

  it("cleans up resources upon dispose", () => {
    const stationsView = createDeliveryStations(dummyHomes);
    expect(stationsView.stations.length).toBe(16);
    stationsView.dispose();
    expect(stationsView.stations.length).toBe(0);
    expect(stationsView.group.children.length).toBe(0);
  });
});
