import { describe, it, expect } from "vitest";
import {
  VEHICLE_LIVERIES,
  CAREER_TROPHIES,
  getLiveryById,
  getUnlockedLiveries,
  getCurrentLivery,
  evaluateCareerTrophies,
  checkNewTrophies,
} from "./career";
import type { CompanyProgression } from "../platform/storage";
import { defaultUpgrades } from "./upgrades";

function createMockProgression(overrides: Partial<CompanyProgression> = {}): CompanyProgression {
  return {
    bestScore: 0,
    soundEnabled: true,
    money: 100,
    reputation: 5,
    companyLevel: 1,
    completedDeliveries: 0,
    upgrades: defaultUpgrades(),
    unlockedVehicles: ["van"],
    currentVehicle: "van",
    unlockedDistricts: ["sunny"],
    lastPlayedTimestamp: Date.now(),
    offlineEarningsAccumulated: 0,
    couriers: [],
    ...overrides,
  };
}

describe("career progression & vehicle liveries (T27)", () => {
  it("defines 4 distinctive vehicle liveries with classic unlocked by default", () => {
    expect(VEHICLE_LIVERIES.length).toBe(4);
    const p = createMockProgression();

    const unlocked = getUnlockedLiveries(p);
    expect(unlocked.length).toBe(1);
    expect(unlocked[0].id).toBe("classic");
  });

  it("unlocks coastal_wave livery with 5 deliveries or coastal district unlocked", () => {
    const p1 = createMockProgression({ completedDeliveries: 5 });
    const unlocked1 = getUnlockedLiveries(p1);
    expect(unlocked1.some((l) => l.id === "coastal_wave")).toBe(true);

    const p2 = createMockProgression({ unlockedDistricts: ["sunny", "coastal"] });
    const unlocked2 = getUnlockedLiveries(p2);
    expect(unlocked2.some((l) => l.id === "coastal_wave")).toBe(true);
  });

  it("unlocks midnight_express and gold_rush liveries with progression", () => {
    const pMid = createMockProgression({ completedDeliveries: 10 });
    expect(getUnlockedLiveries(pMid).some((l) => l.id === "midnight_express")).toBe(true);
    expect(getUnlockedLiveries(pMid).some((l) => l.id === "gold_rush")).toBe(false);

    const pGold = createMockProgression({ companyLevel: 3, completedDeliveries: 15 });
    expect(getUnlockedLiveries(pGold).some((l) => l.id === "gold_rush")).toBe(true);
  });

  it("falls back to classic livery if unknown livery id provided", () => {
    expect(getLiveryById("unknown_livery").id).toBe("classic");
    expect(getLiveryById("gold_rush").id).toBe("gold_rush");

    const p = createMockProgression({ currentLivery: "coastal_wave" });
    expect(getCurrentLivery(p).id).toBe("coastal_wave");
  });

  it("evaluates career trophies accurately according to company progression", () => {
    const p = createMockProgression({
      completedDeliveries: 6,
      companyLevel: 2,
      couriers: [
        {
          id: "c1",
          name: "Burak",
          level: 1,
          speed: 1,
          reliability: 0.9,
          wage: 20,
          assigned: true,
        },
      ],
      unlockedDistricts: ["sunny", "market"],
    });

    const evaluated = evaluateCareerTrophies(p);
    expect(evaluated.totalCount).toBe(CAREER_TROPHIES.length);
    // ilk_teslimat (>=1), usta_sofor (>=5), bolge_fatihi (>=2), filo_patronu (>=1)
    expect(evaluated.unlockedCount).toBe(4);

    const ilkAdim = evaluated.trophies.find((t) => t.trophy.id === "ilk_teslimat");
    expect(ilkAdim?.unlocked).toBe(true);

    const imparator = evaluated.trophies.find((t) => t.trophy.id === "kargo_imparatoru");
    expect(imparator?.unlocked).toBe(false);
  });

  it("detects newly unlocked trophies that were not previously unlocked", () => {
    const p = createMockProgression({ completedDeliveries: 1 });
    const newTrophies = checkNewTrophies(p, []);
    expect(newTrophies.length).toBe(1);
    expect(newTrophies[0].id).toBe("ilk_teslimat");

    // Daha önce açılmışsa tekrar bildirilmez
    const repeated = checkNewTrophies(p, ["ilk_teslimat"]);
    expect(repeated.length).toBe(0);
  });
});
