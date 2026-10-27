import { defaultUpgrades, type VehicleUpgrades } from "../game/upgrades";
import { districts, type DistrictId } from "../game/districts";

export type Courier = {
  id: string;
  name: string;
  level: number;
  speed: number; // 0.8 - 1.5
  reliability: number; // hata/kaza yapmama oranı
  wage: number; // saatlik/tur başı maliyet
  assigned: boolean;
};

export type Preferences = {
  bestScore: number;
  soundEnabled: boolean;
  money: number;
  reputation: number;
  companyLevel: number;
  completedDeliveries: number;
  upgrades: VehicleUpgrades;
  lastPlayedTimestamp?: number;
  offlineEarningsAccumulated?: number;
  couriers?: Courier[];
  unlockedVehicles?: string[];
  currentVehicle?: string;
  unlockedDistricts?: DistrictId[];
};

export type CompanyProgression = Preferences & {
  lastPlayedTimestamp: number;
  offlineEarningsAccumulated: number;
  couriers: Courier[];
  unlockedDistricts?: DistrictId[];
};

export type StorageAdapter = {
  load(): Preferences;
  save(value: Partial<Preferences>): void;
};

const defaults = (): Preferences => ({
  bestScore: 0,
  soundEnabled: true,
  money: 0,
  reputation: 0,
  companyLevel: 1,
  completedDeliveries: 0,
  upgrades: defaultUpgrades(),
  unlockedVehicles: ["van"],
  currentVehicle: "van",
  unlockedDistricts: ["sunny"],
});

function valid(value: unknown): Preferences {
  if (!value || typeof value !== "object") return defaults();
  const record = value as Record<string, unknown>;
  const companyLevel = Math.max(1, nonNegativeInteger(record.companyLevel) || 1);
  const res: Preferences = {
    bestScore:
      typeof record.bestScore === "number" &&
      Number.isFinite(record.bestScore) &&
      record.bestScore >= 0
        ? Math.floor(record.bestScore)
        : 0,
    soundEnabled:
      typeof record.soundEnabled === "boolean" ? record.soundEnabled : true,
    money: nonNegativeInteger(record.money),
    reputation: nonNegativeInteger(record.reputation),
    companyLevel,
    completedDeliveries: nonNegativeInteger(record.completedDeliveries),
    upgrades: validUpgrades(record.upgrades),
    unlockedVehicles: validUnlockedVehicles(record.unlockedVehicles),
    currentVehicle: "van",
    unlockedDistricts: validUnlockedDistricts(record.unlockedDistricts, companyLevel),
  };
  res.currentVehicle = validCurrentVehicle(
    record.currentVehicle,
    res.unlockedVehicles!,
  );

  if (
    typeof record.lastPlayedTimestamp === "number" &&
    Number.isFinite(record.lastPlayedTimestamp)
  ) {
    res.lastPlayedTimestamp = Math.floor(record.lastPlayedTimestamp);
  }
  if (
    typeof record.offlineEarningsAccumulated === "number" &&
    Number.isFinite(record.offlineEarningsAccumulated)
  ) {
    res.offlineEarningsAccumulated = Math.floor(
      record.offlineEarningsAccumulated,
    );
  }
  if (Array.isArray(record.couriers)) {
    res.couriers = validCouriers(record.couriers);
  }

  return res;
}

function validCouriers(value: unknown[]): Courier[] {
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((c) => ({
      id: typeof c.id === "string" ? c.id : String(Math.random()),
      name: typeof c.name === "string" ? c.name : "Kurye",
      level: Math.max(1, nonNegativeInteger(c.level) || 1),
      speed:
        typeof c.speed === "number" && Number.isFinite(c.speed) && c.speed > 0
          ? c.speed
          : 1.0,
      reliability:
        typeof c.reliability === "number" &&
        Number.isFinite(c.reliability) &&
        c.reliability > 0
          ? c.reliability
          : 0.85,
      wage: nonNegativeInteger(c.wage) || 20,
      assigned: typeof c.assigned === "boolean" ? c.assigned : true,
    }));
}

function validUpgrades(value: unknown): VehicleUpgrades {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const up: VehicleUpgrades = {
    engine: nonNegativeInteger(record.engine),
    brakes: nonNegativeInteger(record.brakes),
    cargo: nonNegativeInteger(record.cargo),
  };
  if (record.grip !== undefined) {
    up.grip = nonNegativeInteger(record.grip);
  }
  if (record.nitro !== undefined) {
    up.nitro = nonNegativeInteger(record.nitro);
  }
  return up;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function validUnlockedVehicles(value: unknown): string[] {
  if (!Array.isArray(value)) return ["van"];
  const list = value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  if (!list.includes("van")) list.unshift("van");
  return list;
}

function validCurrentVehicle(value: unknown, unlocked: string[]): string {
  if (typeof value === "string" && unlocked.includes(value)) {
    return value;
  }
  return "van";
}

function validUnlockedDistricts(value: unknown, companyLevel = 1): DistrictId[] {
  const set = new Set<DistrictId>(["sunny"]);
  for (const d of districts) {
    if (companyLevel >= d.unlockLevel) {
      set.add(d.id);
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item === "sunny" || item === "market" || item === "industrial" || item === "coastal") {
        set.add(item);
      }
    }
  }
  return Array.from(set);
}

export function asCompanyProgression(pref: Preferences): CompanyProgression {
  const level = pref.companyLevel ?? 1;
  return {
    ...pref,
    lastPlayedTimestamp: pref.lastPlayedTimestamp ?? Date.now(),
    offlineEarningsAccumulated: pref.offlineEarningsAccumulated ?? 0,
    couriers: pref.couriers ?? [],
    unlockedVehicles: pref.unlockedVehicles ?? ["van"],
    currentVehicle: pref.currentVehicle ?? "van",
    unlockedDistricts: validUnlockedDistricts(pref.unlockedDistricts, level),
  };
}

export function createLocalStorageAdapter(
  storage: Pick<Storage, "getItem" | "setItem">,
): StorageAdapter {
  function load() {
    try {
      return valid(JSON.parse(storage.getItem("mini-kargo:v1") || "null"));
    } catch {
      return defaults();
    }
  }
  return {
    load,
    save(value) {
      const current = load();
      const incoming = valid({ ...current, ...value });
      try {
        storage.setItem(
          "mini-kargo:v1",
          JSON.stringify({
            ...incoming,
            bestScore: Math.max(current.bestScore, incoming.bestScore),
          }),
        );
      } catch {
        /* Storage can be unavailable; keep this session playable. */
      }
    },
  };
}
