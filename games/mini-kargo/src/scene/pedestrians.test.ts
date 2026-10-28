import { describe, expect, it } from "vitest";
import {
  createPedestrians,
  DEFAULT_PEDESTRIANS,
  DISTRICT_PEDESTRIANS,
  EXTRA_DISTRICT_PEDESTRIANS,
} from "./pedestrians";

describe("pedestrians system", () => {
  it("initializes default pedestrians and toggles district pedestrians by company level", () => {
    const pedestrians = createPedestrians();
    const children = pedestrians.group.children;
    const allDistricts = [...DISTRICT_PEDESTRIANS, ...EXTRA_DISTRICT_PEDESTRIANS];
    // Temel yayalar + bölge yayaları
    expect(children.length).toBe(DEFAULT_PEDESTRIANS.length + allDistricts.length);

    // Seviye 1: sadece varsayılanlar görünür olmalı
    pedestrians.setCompanyLevel(1);
    const visibleLvl1 = children.filter((c) => c.visible).length;
    expect(visibleLvl1).toBe(DEFAULT_PEDESTRIANS.length);

    // Seviye 2: Çarşı yayaları da görünür olmalı
    pedestrians.setCompanyLevel(2);
    const visibleLvl2 = children.filter((c) => c.visible).length;
    const marketCount = allDistricts.filter((p) => p.district === "market").length;
    expect(visibleLvl2).toBe(DEFAULT_PEDESTRIANS.length + marketCount);

    // Seviye 4: Tümü görünür
    pedestrians.setCompanyLevel(4);
    const visibleLvl4 = children.filter((c) => c.visible).length;
    expect(visibleLvl4).toBe(DEFAULT_PEDESTRIANS.length + allDistricts.length);

    // Seviye 1 iken market unlockedList ile verildiğinde market yayaları aktifleşir
    pedestrians.setCompanyLevel(1, ["sunny", "market"]);
    const visibleLvl1Market = children.filter((c) => c.visible).length;
    expect(visibleLvl1Market).toBe(DEFAULT_PEDESTRIANS.length + marketCount);
  });

  it("updates pedestrian positions and reports contact at high player speed", () => {
    const pedestrians = createPedestrians();
    // Yayanın tam konumu
    const p0 = pedestrians.group.children[0].position;
    const contacts = pedestrians.update(0.1, { x: p0.x, z: p0.z }, 5.0);
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts[0].severity).toBeGreaterThan(0);
  });

  it("deploys umbrellas during summer rain and stows them when clear", () => {
    const pedestrians = createPedestrians();
    pedestrians.setCompanyLevel(1);

    // Başlangıçta açık hava: şemsiyeler kapalıdır
    pedestrians.update(0.1, { x: 0, z: 0 }, 0, 0);
    let stats = pedestrians.getUmbrellaStats();
    expect(stats.deployed).toBe(0);

    // Yaz yağmuru başlar (rainIntensity = 1.0)
    for (let i = 0; i < 20; i++) {
      pedestrians.update(0.1, { x: 0, z: 0 }, 0, 1.0);
    }
    stats = pedestrians.getUmbrellaStats();
    expect(stats.deployed).toBe(stats.total);
    expect(stats.deployed).toBeGreaterThan(0);

    // Şemsiye tutan yayanın sağ kol açısı yukarı kalkmış olmalı
    const p0 = pedestrians.pedestrians[0];
    expect(p0.umbrellaScale).toBeGreaterThan(0.9);
    expect(p0.umbrellaGroup.visible).toBe(true);
    expect(p0.rightArmPivot.rotation.x).toBeLessThan(-1.0); // baş üzerinde tutuş

    // Yağmur dindiğinde şemsiyeler toplanır
    for (let i = 0; i < 30; i++) {
      pedestrians.update(0.1, { x: 0, z: 0 }, 0, 0);
    }
    stats = pedestrians.getUmbrellaStats();
    expect(stats.deployed).toBe(0);
    expect(p0.umbrellaGroup.visible).toBe(false);
  });
});
