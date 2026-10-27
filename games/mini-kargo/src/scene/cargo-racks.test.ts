import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createCargoRacksView } from "./cargo-racks";

describe("CargoRacksView 3D Construction", () => {
  it("initializes Level 0 with a modest parcel pile", () => {
    const view = createCargoRacksView(0);
    expect(view.level).toBe(0);
    expect(view.group.children.length).toBeGreaterThan(0);

    // Seviye 0'da en az 4 koli grubu olmalı
    expect(view.group.children.length).toBe(4);

    view.dispose();
  });

  it("upgrades to Level 1 and builds a wooden shelving unit", () => {
    const view = createCargoRacksView(0);
    expect(view.level).toBe(0);

    view.update(1);
    expect(view.level).toBe(1);

    // Seviye 1'de raf ünitesi ve koliler olmalı (raf + koli grupları)
    expect(view.group.children.length).toBeGreaterThanOrEqual(5);

    // Raf dikmelerini ve tablalarını kontrol et
    const shelfGroup = view.group.children[0] as THREE.Group;
    expect(shelfGroup.children.length).toBeGreaterThan(5);

    view.dispose();
  });

  it("upgrades to Level 2 and builds heavy-duty palletized warehouse racks", () => {
    const view = createCargoRacksView(1);
    expect(view.level).toBe(1);

    view.update(2);
    expect(view.level).toBe(2);

    // Seviye 2+'da hem ahşap raf, hem paletli büyük kargo rafı, hem zemin paletleri yer almalı
    expect(view.group.children.length).toBeGreaterThanOrEqual(10);

    view.dispose();
  });

  it("safely handles repeated calls and disposal without leaking children", () => {
    const view = createCargoRacksView(0);
    view.update(1);
    view.update(1); // Aynı seviyede tekrar çağrıldığında gereksiz inşa yapmamalı
    expect(view.level).toBe(1);

    view.update(2);
    view.update(0); // Geri seviye dönüşü
    expect(view.level).toBe(0);
    expect(view.group.children.length).toBe(4);

    view.dispose();
    expect(view.group.children.length).toBe(0);
  });
});
