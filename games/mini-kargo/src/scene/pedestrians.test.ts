import { describe, expect, it } from "vitest";
import { createPedestrians, DISTRICT_PEDESTRIANS } from "./pedestrians";

describe("pedestrians system", () => {
  it("initializes default pedestrians and toggles district pedestrians by company level", () => {
    const pedestrians = createPedestrians();
    const children = pedestrians.group.children;
    // 4 temel yaya + bölge yayaları
    expect(children.length).toBe(4 + DISTRICT_PEDESTRIANS.length);

    // Seviye 1: sadece varsayılanlar görünür olmalı
    pedestrians.setCompanyLevel(1);
    const visibleLvl1 = children.filter((c) => c.visible).length;
    expect(visibleLvl1).toBe(4);

    // Seviye 2: Çarşı yayaları da görünür olmalı
    pedestrians.setCompanyLevel(2);
    const visibleLvl2 = children.filter((c) => c.visible).length;
    const marketCount = DISTRICT_PEDESTRIANS.filter((p) => p.district === "market").length;
    expect(visibleLvl2).toBe(4 + marketCount);

    // Seviye 4: Tümü görünür
    pedestrians.setCompanyLevel(4);
    const visibleLvl4 = children.filter((c) => c.visible).length;
    expect(visibleLvl4).toBe(4 + DISTRICT_PEDESTRIANS.length);

    // Seviye 1 iken market unlockedList ile verildiğinde market yayaları aktifleşir
    pedestrians.setCompanyLevel(1, ["sunny", "market"]);
    const visibleLvl1Market = children.filter((c) => c.visible).length;
    expect(visibleLvl1Market).toBe(4 + marketCount);
  });

  it("updates pedestrian positions and reports contact at high player speed", () => {
    const pedestrians = createPedestrians();
    // Yayanın tam konumu
    const p0 = pedestrians.group.children[0].position;
    const contacts = pedestrians.update(0.1, { x: p0.x, z: p0.z }, 5.0);
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts[0].severity).toBeGreaterThan(0);
  });
});
