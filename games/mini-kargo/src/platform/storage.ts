export type Preferences = { bestScore: number; soundEnabled: boolean };
export type StorageAdapter = {
  load(): Preferences;
  save(value: Preferences): void;
};
const defaults = (): Preferences => ({ bestScore: 0, soundEnabled: true });
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
      const incoming = valid(value),
        current = load();
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
