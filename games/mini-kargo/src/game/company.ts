import type { CompanyProgression, Courier } from "../platform/storage";

export type { Courier };

export const MAX_OFFLINE_SECONDS = 8 * 3600; // 8 saat sınırı (28800 saniye)

const TURKISH_FIRST_NAMES = [
  "Burak",
  "Ayşe",
  "Mehmet",
  "Zeynep",
  "Emre",
  "Selin",
  "Caner",
  "Deniz",
  "Murat",
  "Elif",
  "Onur",
  "Gamze",
];

const TURKISH_EPITHETS = [
  "Hızlı",
  "Seri",
  "Usta",
  "Rüzgar",
  "Express",
  "Jet",
  "Çevik",
  "Dakik",
  "Yıldırım",
  "Atik",
];

/**
 * Oyuncunun oyunda olmadığı süreyi ve kuryelerin kazandığı parayı hesaplar.
 * Maksimum 8 saat sınırına tabidir.
 */
export function calculateOfflineEarnings(
  progression: CompanyProgression,
  currentTime = Date.now(),
): { earnings: number; elapsedSeconds: number; effectiveSeconds: number } {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((currentTime - progression.lastPlayedTimestamp) / 1000),
  );
  const effectiveSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS);

  const activeCouriers = (progression.couriers || []).filter(
    (c) => c.assigned !== false,
  );
  if (activeCouriers.length === 0 || effectiveSeconds <= 0) {
    return { earnings: 0, elapsedSeconds, effectiveSeconds };
  }

  // Her kurye için net saniyelik kazanç (hız ve güvenilirlik çarpanı)
  let totalPerSecond = 0;
  for (const c of activeCouriers) {
    const baseRate = 0.035 * c.level * c.speed * c.reliability;
    const wageDeduction = c.wage / 7200; // Makul maaş kesintisi
    const netRate = Math.max(0.012, baseRate - wageDeduction);
    totalPerSecond += netRate;
  }

  const earnings = Math.floor(totalPerSecond * effectiveSeconds);
  return { earnings, elapsedSeconds, effectiveSeconds };
}

/**
 * Oyuna girişte çevrimdışı kazancı biriken havuza ekler ve zaman damgasını günceller.
 */
export function applyOfflineEarnings(
  progression: CompanyProgression,
  currentTime = Date.now(),
): CompanyProgression {
  const { earnings } = calculateOfflineEarnings(progression, currentTime);
  return {
    ...progression,
    offlineEarningsAccumulated:
      (progression.offlineEarningsAccumulated || 0) + earnings,
    lastPlayedTimestamp: currentTime,
  };
}

/**
 * Biriken çevrimdışı kazancı şirket kasasına aktarır.
 */
export function claimOfflineEarnings(
  progression: CompanyProgression,
  currentTime = Date.now(),
): CompanyProgression {
  const amount = progression.offlineEarningsAccumulated || 0;
  return {
    ...progression,
    money: progression.money + amount,
    offlineEarningsAccumulated: 0,
    lastPlayedTimestamp: currentTime,
  };
}

/**
 * Bir kurye adayının işe alım maliyetini hesaplar.
 */
export function courierHireCost(courier: Courier): number {
  return (
    160 +
    courier.level * 70 +
    Math.round(courier.speed * 60) +
    Math.round(courier.reliability * 50)
  );
}

/**
 * Kurye işe alınabilir mi kontrol eder.
 */
export function canHireCourier(
  progression: CompanyProgression,
  candidate: Courier,
): boolean {
  return progression.money >= courierHireCost(candidate);
}

/**
 * Yeni bir kurye işe alır, parasını kasadan düşer ve kadroya ekler.
 */
export function hireCourier(
  progression: CompanyProgression,
  candidate: Courier,
): CompanyProgression {
  const cost = courierHireCost(candidate);
  if (progression.money < cost) return progression;

  return {
    ...progression,
    money: progression.money - cost,
    reputation: progression.reputation + 1,
    couriers: [...(progression.couriers || []), { ...candidate, assigned: true }],
  };
}

/**
 * Şirket seviyesine göre rastgele bir kurye adayı üretir.
 */
export function generateCourierCandidate(
  companyLevel: number,
  index = 0,
): Courier {
  const firstName =
    TURKISH_FIRST_NAMES[
      (index + Math.floor(Math.random() * TURKISH_FIRST_NAMES.length)) %
        TURKISH_FIRST_NAMES.length
    ];
  const epithet =
    TURKISH_EPITHETS[
      (index + Math.floor(Math.random() * TURKISH_EPITHETS.length)) %
        TURKISH_EPITHETS.length
    ];

  const level = Math.min(
    Math.max(1, Math.floor(Math.random() * companyLevel) + 1),
    5,
  );
  const speed = Number((0.85 + Math.random() * 0.45).toFixed(2)); // 0.85 - 1.30
  const reliability = Number((0.78 + Math.random() * 0.2).toFixed(2)); // 0.78 - 0.98
  const wage = 15 + level * 5;

  return {
    id: `courier_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    name: `${firstName} ${epithet}`,
    level,
    speed,
    reliability,
    wage,
    assigned: true,
  };
}
