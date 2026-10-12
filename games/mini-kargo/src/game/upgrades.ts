export type UpgradeKind = "engine" | "brakes" | "cargo" | "grip" | "nitro";

export type VehicleUpgrades = {
  engine: number;
  brakes: number;
  cargo: number;
  grip?: number;
  nitro?: number;
};

export const defaultUpgrades = (): VehicleUpgrades => ({
  engine: 0,
  brakes: 0,
  cargo: 0,
});

export function upgradeCost(kind: UpgradeKind, level: number) {
  const base: Record<UpgradeKind, number> = {
    engine: 180,
    brakes: 160,
    cargo: 220,
    grip: 170,
    nitro: 200,
  };
  return base[kind] * (level + 1);
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
  const level = state.upgrades[kind] ?? 0;
  if (!canPurchaseUpgrade(kind, level, state.money)) return state;
  return {
    ...state,
    money: state.money - upgradeCost(kind, level),
    upgrades: { ...state.upgrades, [kind]: level + 1 },
  };
}

export function upgradeLabel(kind: UpgradeKind) {
  return {
    engine: "Motor",
    brakes: "Fren",
    cargo: "Kapasite",
    grip: "Lastik Tutuşu",
    nitro: "Nitro Deposu",
  }[kind];
}
