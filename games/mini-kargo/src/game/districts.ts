export type DistrictId = "sunny" | "market" | "industrial";

export type District = {
  id: DistrictId;
  name: string;
  unlockLevel: number;
  rewardMultiplier: number;
};

export const districts: District[] = [
  {
    id: "sunny",
    name: "GÜNEŞ MAHALLESİ",
    unlockLevel: 1,
    rewardMultiplier: 1,
  },
  {
    id: "market",
    name: "ÇARŞI BÖLGESİ",
    unlockLevel: 2,
    rewardMultiplier: 1.15,
  },
  {
    id: "industrial",
    name: "SANAYİ BÖLGESİ",
    unlockLevel: 3,
    rewardMultiplier: 1.3,
  },
];

export function districtForLevel(companyLevel: number): District {
  return [...districts]
    .reverse()
    .find((district) => companyLevel >= district.unlockLevel) ?? districts[0];
}

export function districtById(id: DistrictId): District {
  return districts.find((district) => district.id === id) ?? districts[0];
}
