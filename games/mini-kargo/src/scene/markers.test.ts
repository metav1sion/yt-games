import { describe, it, expect } from "vitest";
import { createMarkers, createDeliveryAnimation } from "./markers";
import * as THREE from "three";

describe("Markers & Delivery Animation", () => {
  it("initializes marker group with outer ring, base disc, progress ring, pin and label", () => {
    const marker = createMarkers();
    expect(marker.group.children.length).toBeGreaterThanOrEqual(5);

    // Initial update at depot
    marker.update({ x: 0, z: 0 }, false, 0.016, 0);
    expect(marker.group.position.x).toBe(0);
    expect(marker.group.position.z).toBe(0);
  });

  it("scales progress ring smoothly when holdSeconds > 0", () => {
    const marker = createMarkers();
    marker.update({ x: 10, z: 20 }, true, 0.016, 0.5, "standard");
    // Find progress disc (3rd child)
    const progressDisc = marker.group.children.find(
      (c) => c.name === "progressDisc",
    ) as THREE.Mesh;
    expect(progressDisc).toBeDefined();
    expect(progressDisc.visible).toBe(true);
    expect(progressDisc.scale.x).toBeCloseTo(0.5, 2);

    // When holdSeconds is 0, progress disc is hidden
    marker.update({ x: 10, z: 20 }, true, 0.016, 0, "standard");
    expect(progressDisc.visible).toBe(false);
  });

  it("updates contract theme colors dynamically for VIP and special contracts", () => {
    const marker = createMarkers();
    marker.update({ x: 10, z: 20 }, true, 0.016, 0, "vip_express");
    const ringMesh = marker.group.children[0] as THREE.Mesh<
      THREE.RingGeometry,
      THREE.MeshBasicMaterial
    >;
    expect(ringMesh.material.color.getHexString()).toBe("00d2d3");

    // Cold chain
    marker.update({ x: 10, z: 20 }, true, 0.016, 0, "cold_chain");
    expect(ringMesh.material.color.getHexString()).toBe("54a0ff");

    // Heavy freight
    marker.update({ x: 10, z: 20 }, true, 0.016, 0, "heavy_freight");
    expect(ringMesh.material.color.getHexString()).toBe("ff9f43");
  });

  it("plays delivery animation along parabolic arc and hides when complete", () => {
    const scene = new THREE.Scene();
    const anim = createDeliveryAnimation(scene);
    expect(scene.children).toHaveLength(1);
    const parcelGroup = scene.children[0];
    expect(parcelGroup.visible).toBe(false);

    anim.play({ x: 0, z: 0 }, { x: 10, z: 10 });
    expect(parcelGroup.visible).toBe(true);

    // Advance halfway
    anim.update(0.425);
    expect(parcelGroup.visible).toBe(true);
    expect(parcelGroup.position.y).toBeGreaterThan(1);

    // Complete animation
    anim.update(0.5);
    expect(parcelGroup.visible).toBe(false);
  });
});
