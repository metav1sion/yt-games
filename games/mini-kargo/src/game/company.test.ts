import { describe, expect, it } from "vitest";
import {
  calculateOfflineEarnings,
  applyOfflineEarnings,
  claimOfflineEarnings,
  hireCourier,
  courierHireCost,
  MAX_OFFLINE_SECONDS,
  type Courier,
} from "./company";
import type { CompanyProgression } from "../platform/storage";
import { defaultUpgrades, tryPurchaseUpgrade } from "./upgrades";

function createMockProgression(
  overrides?: Partial<CompanyProgression>,
): CompanyProgression {
  return {
    bestScore: 0,
    soundEnabled: true,
    money: 1000,
    reputation: 5,
    companyLevel: 2,
    completedDeliveries: 10,
    upgrades: defaultUpgrades(),
    lastPlayedTimestamp: 1000000,
    offlineEarningsAccumulated: 0,
    couriers: [],
    ...overrides,
  };
}

const mockCourier: Courier = {
  id: "c1",
  name: "Burak Hızlı",
  level: 1,
  speed: 1.0,
  reliability: 0.9,
  wage: 20,
  assigned: true,
};

describe("Company Tycoon & Offline Earnings", () => {
  it("kurye sayısı 0 iken çevrimdışı kazanç 0 olmalıdır", () => {
    const prog = createMockProgression({ couriers: [] });
    // 5 saat sonra
    const result = calculateOfflineEarnings(prog, prog.lastPlayedTimestamp + 5 * 3600 * 1000);
    expect(result.earnings).toBe(0);
    expect(result.elapsedSeconds).toBe(5 * 3600);
  });

  it("atanmış kurye ile çevrimdışı kazanç doğru hesaplanmalıdır", () => {
    const prog = createMockProgression({
      couriers: [mockCourier],
    });
    // 1 saat sonra (3600 sn)
    const result = calculateOfflineEarnings(prog, prog.lastPlayedTimestamp + 3600 * 1000);
    expect(result.earnings).toBeGreaterThan(0);
    expect(result.elapsedSeconds).toBe(3600);
    expect(result.effectiveSeconds).toBe(3600);
  });

  it("çevrimdışı kazanç 8 saat (28800 sn) sınırını aşmamalıdır", () => {
    const prog = createMockProgression({
      couriers: [mockCourier],
    });

    const eightHoursMs = MAX_OFFLINE_SECONDS * 1000;
    const result8h = calculateOfflineEarnings(prog, prog.lastPlayedTimestamp + eightHoursMs);

    // 24 saat sonra açıldığında
    const twentyFourHoursMs = 24 * 3600 * 1000;
    const result24h = calculateOfflineEarnings(prog, prog.lastPlayedTimestamp + twentyFourHoursMs);

    expect(result24h.effectiveSeconds).toBe(MAX_OFFLINE_SECONDS);
    expect(result24h.earnings).toBe(result8h.earnings);
  });

  it("applyOfflineEarnings biriken kazancı ekler ve zaman damgasını günceller", () => {
    const prog = createMockProgression({
      couriers: [mockCourier],
      offlineEarningsAccumulated: 50,
    });
    const now = prog.lastPlayedTimestamp + 3600 * 1000;
    const updated = applyOfflineEarnings(prog, now);

    expect(updated.lastPlayedTimestamp).toBe(now);
    expect(updated.offlineEarningsAccumulated).toBeGreaterThan(50);
  });

  it("claimOfflineEarnings biriken parayı kasaya ekler ve havuzu sıfırlar", () => {
    const prog = createMockProgression({
      money: 500,
      offlineEarningsAccumulated: 320,
    });
    const now = 2000000;
    const claimed = claimOfflineEarnings(prog, now);

    expect(claimed.money).toBe(820);
    expect(claimed.offlineEarningsAccumulated).toBe(0);
    expect(claimed.lastPlayedTimestamp).toBe(now);
  });

  it("kurye işe alımında para kasadan doğru düşmeli ve kadroya eklenmelidir", () => {
    const prog = createMockProgression({ money: 500, couriers: [] });
    const cost = courierHireCost(mockCourier);
    expect(prog.money).toBeGreaterThanOrEqual(cost);

    const hired = hireCourier(prog, mockCourier);
    expect(hired.money).toBe(500 - cost);
    expect(hired.couriers).toHaveLength(1);
    expect(hired.couriers[0].id).toBe(mockCourier.id);
    expect(hired.reputation).toBe(prog.reputation + 1);
  });

  it("yetersiz bakiye durumunda kurye işe alınamaz ve para düşmez", () => {
    const prog = createMockProgression({ money: 50, couriers: [] });
    const hired = hireCourier(prog, mockCourier);

    expect(hired.money).toBe(50);
    expect(hired.couriers).toHaveLength(0);
  });

  it("araç yükseltme alımlarında kasa parası doğru düşmelidir", () => {
    const prog = createMockProgression({ money: 400 });
    // engine seviye 0 -> maliyet 180
    const upgraded = tryPurchaseUpgrade(prog, "engine");
    expect(upgraded.money).toBe(220);
    expect(upgraded.upgrades.engine).toBe(1);
  });
});
