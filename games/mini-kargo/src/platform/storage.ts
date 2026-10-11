export type Preferences = {
  bestScore: number;
  soundEnabled: boolean;
  money: number;
  reputation: number;
  companyLevel: number;
  completedDeliveries: number;
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
});
function valid(value: unknown): Preferences {
  if (!value || typeof value !== "object") return defaults();
  const record = value as Record<string, unknown>;
  return {
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
    companyLevel: Math.max(1, nonNegativeInteger(record.companyLevel) || 1),
    completedDeliveries: nonNegativeInteger(record.completedDeliveries),
  };
}
function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
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
