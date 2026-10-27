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

/**
 * Bir bölgenin açık olup olmadığını kontrol eder.
 * Şirket seviyesi yeterliyse veya doğrudan unlockedList (satın alma kaydı) içinde varsa açıktır.
 */
export function isDistrictUnlocked(
  districtId: DistrictId,
  companyLevel: number,
  unlockedList?: DistrictId[] | Set<DistrictId>,
): boolean {
  if (districtId === "sunny") return true;
  if (unlockedList) {
    if (unlockedList instanceof Set) {
      if (unlockedList.has(districtId)) return true;
    } else if (Array.isArray(unlockedList) && unlockedList.includes(districtId)) {
      return true;
    }
  }
  const district = districtById(districtId);
  return companyLevel >= district.unlockLevel;
}

export function districtForLevel(
  companyLevel: number,
  unlockedList?: DistrictId[] | Set<DistrictId>,
): District {
  const available = unlockedDistricts(companyLevel, unlockedList);
  return available[available.length - 1] ?? districts[0];
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
 * Oyuncunun şirket seviyesine ve satın alınan bölgelere göre açık olan tüm ev indekslerini döndürür.
 * Seviye 1: [0, 1, 2, 3] (Güneş)
 * Seviye 2: [0..7] (+ Çarşı)
 * Seviye 3: [0..11] (+ Sanayi)
 * Seviye 4+: [0..15] (+ Sahil)
 */
export function getAvailableHomeIndices(
  companyLevel: number,
  unlockedList?: DistrictId[] | Set<DistrictId>,
): number[] {
  const indices: number[] = [];
  for (const district of districts) {
    if (isDistrictUnlocked(district.id, companyLevel, unlockedList)) {
      indices.push(...district.homeIndices);
    }
  }
  return indices.length > 0 ? indices : [0, 1, 2, 3];
}

/**
 * Dünya koordinatından (x, z) bölgeyi döndürür. Harita dört çeyreğe bölünmüştür:
 * Güneş (x<0, z<0), Sanayi (x>0, z<0), Çarşı (x>0, z>0), Sahil (x<0, z>0).
 */
export function districtAt(x: number, z: number): DistrictId {
  if (x < 0) return z < 0 ? "sunny" : "coastal";
  return z < 0 ? "industrial" : "market";
}

/** Verilen seviyede ve açılan bölgelere göre oyuncunun seçebileceği (açık) bölgeler. */
export function unlockedDistricts(
  companyLevel: number,
  unlockedList?: DistrictId[] | Set<DistrictId>,
): District[] {
  return districts.filter((d) => isDistrictUnlocked(d.id, companyLevel, unlockedList));
}

/**
 * Teslimat bölgesi seçimini çözer: seçilen bölge açıksa o, yoksa seviyedeki en son bölge.
 */
export function resolveDistrict(
  companyLevel: number,
  selected?: DistrictId | null,
  unlockedList?: DistrictId[] | Set<DistrictId>,
): District {
  const chosen = selected ? districtById(selected) : null;
  return chosen && isDistrictUnlocked(chosen.id, companyLevel, unlockedList)
    ? chosen
    : districtForLevel(companyLevel, unlockedList);
}
