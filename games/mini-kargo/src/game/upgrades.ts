export type UpgradeKind = "engine" | "brakes" | "cargo";
export type VehicleUpgrades = Record<UpgradeKind, number>;

export const defaultUpgrades = (): VehicleUpgrades => ({
  engine: 0,
  brakes: 0,
  cargo: 0,
});

export function upgradeCost(kind: UpgradeKind, level: number) {
  const base = { engine: 180, brakes: 160, cargo: 220 }[kind];
  return base * (level + 1);
}

export function canPurchaseUpgrade(
  kind: UpgradeKind,
  level: number,
  money: number,
): boolean {
  return (kind !== "cargo" || level < 1) && money >= upgradeCost(kind, level);
}

export function tryPurchaseUpgrade<
  T extends { money: number; upgrades: VehicleUpgrades },
>(state: T, kind: UpgradeKind): T {
  const level = state.upgrades[kind];
  if (!canPurchaseUpgrade(kind, level, state.money)) return state;
  return {
    ...state,
    money: state.money - upgradeCost(kind, level),
    upgrades: { ...state.upgrades, [kind]: level + 1 },
  };
}

export function upgradeLabel(kind: UpgradeKind) {
  return { engine: "Motor", brakes: "Fren", cargo: "Kapasite" }[kind];
}
