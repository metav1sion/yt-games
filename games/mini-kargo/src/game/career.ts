import type { CompanyProgression } from "../platform/storage";

export type VehicleLivery = {
  id: string;
  name: string;
  icon: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  roofColor: string;
  accentColor: string;
  unlockRequirement: string;
  isUnlocked(progression: CompanyProgression): boolean;
};

export type CareerTrophy = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardMoney: number;
  isUnlocked(progression: CompanyProgression): boolean;
};

export const VEHICLE_LIVERIES: VehicleLivery[] = [
  {
    id: "classic",
    name: "Klasik Kargo",
    icon: "🚚",
    description: "Geleneksel Mini Kargo sarı-yeşil kurumsal kimliği.",
    primaryColor: "#f3b544", // Canlı kargo sarısı
    secondaryColor: "#ffe4a2", // Açık krem
    roofColor: "#ffe4a2",
    accentColor: "#1e5144", // Zümrüt kurumsal yeşil
    unlockRequirement: "Başlangıçta Açık",
    isUnlocked: () => true,
  },
  {
    id: "coastal_wave",
    name: "Sahil Dalgası",
    icon: "🌊",
    description: "Turkuaz deniz ve beyaz köpük renklerinde ferah sahil stili.",
    primaryColor: "#00cec9", // Canlı turkuaz
    secondaryColor: "#81ecec", // Açık camgöbeği
    roofColor: "#ffffff", // Temiz beyaz tavan
    accentColor: "#0984e3", // Okyanus mavisi
    unlockRequirement: "5 teslimat tamamla veya Sahil bölgesini aç",
    isUnlocked: (p) =>
      p.completedDeliveries >= 5 ||
      (p.unlockedDistricts || []).includes("coastal") ||
      p.companyLevel >= 4,
  },
  {
    id: "midnight_express",
    name: "Gece Ekspresi",
    icon: "⚡",
    description: "Mat antrasit gövde ve neon fuşya yarış şeritleri.",
    primaryColor: "#2d3436", // Koyu antrasit
    secondaryColor: "#636e72", // Metalik gri
    roofColor: "#1e272e", // Gece siyahı
    accentColor: "#e84393", // Neon fuşya yarış çizgisi
    unlockRequirement: "10 teslimat tamamla",
    isUnlocked: (p) => p.completedDeliveries >= 10,
  },
  {
    id: "gold_rush",
    name: "Altın Şampiyon",
    icon: "👑",
    description: "Lüks parlak altın kaplama ve prestijli bronz detaylar.",
    primaryColor: "#f1c40f", // Zengin altın sarısı
    secondaryColor: "#f9ca24", // Parlak amber
    roofColor: "#ffffff", // İnci beyazı
    accentColor: "#d35400", // Ateş bronzu
    unlockRequirement: "Şirket Seviyesi 3'e ulaş veya 20 teslimat yap",
    isUnlocked: (p) => p.companyLevel >= 3 || p.completedDeliveries >= 20,
  },
];

export const CAREER_TROPHIES: CareerTrophy[] = [
  {
    id: "ilk_teslimat",
    title: "İlk Adım",
    icon: "📦",
    description: "İlk kargo teslimatını başarıyla müşteriye ulaştır.",
    rewardMoney: 25,
    isUnlocked: (p) => p.completedDeliveries >= 1,
  },
  {
    id: "usta_sofor",
    title: "Kıdemli Dağıtıcı",
    icon: "⭐",
    description: "Toplamda en az 5 teslimatı tamamla.",
    rewardMoney: 50,
    isUnlocked: (p) => p.completedDeliveries >= 5,
  },
  {
    id: "bolge_fatihi",
    title: "Şehir Kâşifi",
    icon: "🗺️",
    description: "En az 2 farklı bölgenin kilidini aç.",
    rewardMoney: 75,
    isUnlocked: (p) =>
      (p.unlockedDistricts?.length ?? 1) >= 2 || p.companyLevel >= 2,
  },
  {
    id: "filo_patronu",
    title: "Filo Patronu",
    icon: "🚚",
    description: "İlk otonom kuryeni işe alarak pasif gelir başlat.",
    rewardMoney: 60,
    isUnlocked: (p) => (p.couriers?.length ?? 0) >= 1,
  },
  {
    id: "kargo_imparatoru",
    title: "Kargo Baronu",
    icon: "👑",
    description: "Şirket seviyesini 3'e yükselt.",
    rewardMoney: 150,
    isUnlocked: (p) => p.companyLevel >= 3,
  },
  {
    id: "efsanevi_kurye",
    title: "Efsanevi Kurye",
    icon: "💎",
    description: "20 teslimatı tamamla ve Mini Kargo efsanesi ol.",
    rewardMoney: 200,
    isUnlocked: (p) => p.completedDeliveries >= 20,
  },
];

export function getLiveryById(id?: string): VehicleLivery {
  const found = VEHICLE_LIVERIES.find((l) => l.id === id);
  return found ?? VEHICLE_LIVERIES[0];
}

export function getUnlockedLiveries(progression: CompanyProgression): VehicleLivery[] {
  return VEHICLE_LIVERIES.filter((l) => l.isUnlocked(progression));
}

export function getCurrentLivery(progression: CompanyProgression): VehicleLivery {
  return getLiveryById(progression.currentLivery);
}

export function evaluateCareerTrophies(progression: CompanyProgression): {
  trophies: { trophy: CareerTrophy; unlocked: boolean }[];
  unlockedCount: number;
  totalCount: number;
} {
  let unlockedCount = 0;
  const trophies = CAREER_TROPHIES.map((trophy) => {
    const unlocked = trophy.isUnlocked(progression);
    if (unlocked) unlockedCount++;
    return { trophy, unlocked };
  });

  return {
    trophies,
    unlockedCount,
    totalCount: CAREER_TROPHIES.length,
  };
}

export function checkNewTrophies(
  progression: CompanyProgression,
  previouslyUnlockedIds: string[] = [],
): CareerTrophy[] {
  const prevSet = new Set(previouslyUnlockedIds);
  return CAREER_TROPHIES.filter(
    (trophy) => trophy.isUnlocked(progression) && !prevSet.has(trophy.id),
  );
}
