import { describe, expect, it } from "vitest";
import {
  createTraffic,
  DEFAULT_TRAFFIC,
  DISTRICT_TRAFFIC,
  EXTRA_DISTRICT_TRAFFIC,
} from "./traffic";

describe("traffic system", () => {
  it("creates high-density traffic with 30-40 vehicles across multiple types", () => {
    const traffic = createTraffic();
    const totalVehicles = traffic.cars.length;

    // Araç sayısı 30-40 aralığında olmalı
    expect(totalVehicles).toBeGreaterThanOrEqual(30);
    expect(totalVehicles).toBeLessThanOrEqual(40);
    expect(totalVehicles).toBe(
      DEFAULT_TRAFFIC.length + DISTRICT_TRAFFIC.length + EXTRA_DISTRICT_TRAFFIC.length,
    );

    // Çeşitli araç türleri mevcut olmalı: taksi, polis, suv, kamyonet, sedan
    const kinds = new Set(traffic.cars.map((c) => c.kind));
    expect(kinds.has("taxi")).toBe(true);
    expect(kinds.has("police")).toBe(true);
    expect(kinds.has("suv")).toBe(true);
    expect(kinds.has("truck")).toBe(true);
    expect(kinds.has("sedan")).toBe(true);
  });

  it("toggles district traffic visibility with company level and extra unlocked districts", () => {
    const traffic = createTraffic();

    // Seviye 1 varsayılan (sadece sunny)
    traffic.setCompanyLevel(1);
    const visibleLvl1 = traffic.cars.filter((c) => c.group.visible).length;
    expect(visibleLvl1).toBe(DEFAULT_TRAFFIC.length);

    // Çarşı bölgesi açılınca
    traffic.setCompanyLevel(2);
    const visibleLvl2 = traffic.cars.filter((c) => c.group.visible).length;
    const marketCount = [...DISTRICT_TRAFFIC, ...EXTRA_DISTRICT_TRAFFIC].filter(
      (c) => c.district === "market",
    ).length;
    expect(visibleLvl2).toBe(DEFAULT_TRAFFIC.length + marketCount);

    // Seviye 4: Tümü aktif
    traffic.setCompanyLevel(4);
    const visibleLvl4 = traffic.cars.filter((c) => c.group.visible).length;
    expect(visibleLvl4).toBe(traffic.cars.length);
  });

  it("applies physical recoil, shake and collision contact on car impact", () => {
    const traffic = createTraffic();
    const car0 = traffic.cars[0];

    // Oyuncu araca çarptığında
    const hitPos = { x: car0.position.x - 0.5, z: car0.position.z };
    traffic.impactCar(0, hitPos, 6.0);

    expect(car0.shakeTimer).toBeGreaterThan(0);
    expect(Math.abs(car0.recoilX)).toBeGreaterThan(0);

    // Update sırasında hareket etmeli ve sönümlenmeli
    const result = traffic.update(0.05, { x: car0.position.x, z: car0.position.z });
    expect(result.contacts.length).toBeGreaterThan(0);
  });
});
