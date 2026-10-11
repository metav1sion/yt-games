export type DistrictId = "sunny" | "market" | "industrial" | "coastal";

export type District = {
  id: DistrictId;
  name: string;
  unlockLevel: number;
  rewardMultiplier: number;
  homeIndices: number[];
};

export const districts: District[] = [
  {
    id: "sunny",
    name: "GÜNEŞ MAHALLESİ",
    unlockLevel: 1,
    rewardMultiplier: 1,
    homeIndices: [0, 1, 2, 3],
  },
  {
    id: "market",
    name: "ÇARŞI BÖLGESİ",
    unlockLevel: 2,
    rewardMultiplier: 1.15,
    homeIndices: [4, 5, 6, 7],
  },
  {
    id: "industrial",
    name: "SANAYİ BÖLGESİ",
    unlockLevel: 3,
    rewardMultiplier: 1.3,
    homeIndices: [8, 9, 10, 11],
  },
  {
    id: "coastal",
    name: "SAHİL ŞERİDİ",
    unlockLevel: 4,
    rewardMultiplier: 1.45,
    homeIndices: [12, 13, 14, 15],
  },
];

export function districtForLevel(companyLevel: number): District {
  return (
    [...districts]
      .reverse()
      .find((district) => companyLevel >= district.unlockLevel) ?? districts[0]
  );
}

export function districtById(id: DistrictId): District {
  return districts.find((district) => district.id === id) ?? districts[0];
}

/**
 * Verilen ev indeksinin (0-15) ait olduğu bölgeyi döndürür.
 */
export function getDistrictForHome(homeIndex: number): DistrictId {
  for (const district of districts) {
    if (district.homeIndices.includes(homeIndex)) {
      return district.id;
    }
  }
  return "sunny";
}

/**
 * Oyuncunun şirket seviyesine göre açık olan tüm ev indekslerini döndürür.
 * Seviye 1: [0, 1, 2, 3] (Güneş)
 * Seviye 2: [0..7] (+ Çarşı)
 * Seviye 3: [0..11] (+ Sanayi)
 * Seviye 4+: [0..15] (+ Sahil)
 */
export function getAvailableHomeIndices(companyLevel: number): number[] {
  const indices: number[] = [];
  for (const district of districts) {
    if (companyLevel >= district.unlockLevel) {
      indices.push(...district.homeIndices);
    }
  }
  return indices.length > 0 ? indices : [0, 1, 2, 3];
}
