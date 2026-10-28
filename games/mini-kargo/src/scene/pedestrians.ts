import * as THREE from "three";
import { box, cylinder, mat } from "./world-kit";
import type { Vec2 } from "../game/types";
import type { DamageContact } from "../game/contact-damage";
import { districts, isDistrictUnlocked, type DistrictId } from "../game/districts";

export type PedestrianKind = "casual" | "worker" | "tourist" | "business";

export type Pedestrian = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
  baseSpeed: number;
  min?: number;
  max?: number;
  limit?: number;
  district?: DistrictId;
  color?: string;
  kind?: PedestrianKind;

  // Animasyon Pivotları
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  headGroup: THREE.Group;

  // Yürüme ve Panik Simülasyonu
  walkPhase: number;
  panicTimer: number;
  fleeOffsetX: number;
  fleeOffsetZ: number;
};

export type PedestrianDef = Omit<
  Pedestrian,
  | "group"
  | "baseSpeed"
  | "leftArmPivot"
  | "rightArmPivot"
  | "leftLegPivot"
  | "rightLegPivot"
  | "headGroup"
  | "walkPhase"
  | "panicTimer"
  | "fleeOffsetX"
  | "fleeOffsetZ"
>;

/**
 * Bölgeye özel yayalar:
 * world.test.ts tarafından import edilen orijinal 5 rota eksiksiz korunur.
 */
export const DISTRICT_PEDESTRIANS: PedestrianDef[] = [
  // Çarşı Bölgesi: Orijinal rotalar
  { district: "market", position: { x: 35.4, z: 22 }, axis: "z", direction: 1, speed: 0.82, min: 21, max: 37, color: "#d9534f", kind: "casual" },
  { district: "market", position: { x: 18, z: 45.5 }, axis: "x", direction: 1, speed: 0.75, min: 12, max: 42, color: "#5bc0de", kind: "business" },
  { district: "market", position: { x: 54.5, z: 62 }, axis: "z", direction: -1, speed: 0.85, min: 58, max: 90, color: "#f0ad4e", kind: "casual" },

  // Sahil Bölgesi: Orijinal rotalar
  { district: "coastal", position: { x: -50, z: 88 }, axis: "z", direction: 1, speed: 0.7, min: 86, max: 97, color: "#5cb85c", kind: "tourist" },
  { district: "coastal", position: { x: -30, z: 83 }, axis: "x", direction: 1, speed: 0.85, min: -80, max: -20, color: "#9b59b6", kind: "casual" },
];

/**
 * Şehir bölgeleri açıldığında kaldırımlara katılan ek canlı yayalar.
 */
export const EXTRA_DISTRICT_PEDESTRIANS: PedestrianDef[] = [
  // 1. Çarşı Bölgesi (Piazza & Meydan çevresi)
  { district: "market", position: { x: 44.5, z: 50 }, axis: "z", direction: 1, speed: 0.8, min: 42, max: 58, color: "#9b59b6", kind: "casual" },
  { district: "market", position: { x: 55.5, z: 50 }, axis: "z", direction: -1, speed: 0.78, min: 42, max: 58, color: "#e67e22", kind: "tourist" },
  { district: "market", position: { x: 50, z: 44.5 }, axis: "x", direction: 1, speed: 0.82, min: 42, max: 58, color: "#2ecc71", kind: "business" },
  { district: "market", position: { x: 50, z: 55.5 }, axis: "x", direction: -1, speed: 0.76, min: 42, max: 58, color: "#e74c3c", kind: "casual" },
  { district: "market", position: { x: 20, z: 8.5 }, axis: "x", direction: 1, speed: 0.84, min: 12, max: 45, color: "#3498db", kind: "business" },
  { district: "market", position: { x: 70, z: 8.5 }, axis: "x", direction: -1, speed: 0.8, min: 55, max: 88, color: "#1abc9c", kind: "casual" },

  // 2. Sanayi Bölgesi (Hangar, Antrepo ve fabrika kaldırımları)
  { district: "industrial", position: { x: 40, z: -29 }, axis: "z", direction: 1, speed: 0.88, min: -36, max: -22, color: "#e67e22", kind: "worker" },
  { district: "industrial", position: { x: 10, z: -25 }, axis: "z", direction: 1, speed: 0.82, min: -35, max: -15, color: "#2980b9", kind: "worker" },
  { district: "industrial", position: { x: 70, z: -8.5 }, axis: "x", direction: -1, speed: 0.85, min: 55, max: 85, color: "#f39c12", kind: "worker" },
  { district: "industrial", position: { x: 25, z: -8.5 }, axis: "x", direction: 1, speed: 0.8, min: 12, max: 45, color: "#7f8c8d", kind: "worker" },
  { district: "industrial", position: { x: 88, z: -35 }, axis: "z", direction: -1, speed: 0.84, min: -48, max: -20, color: "#d35400", kind: "worker" },
  { district: "industrial", position: { x: 12, z: -70 }, axis: "z", direction: 1, speed: 0.78, min: -85, max: -55, color: "#2c3e50", kind: "worker" },

  // 3. Sahil Bölgesi (Kordon, İskele, Plaj yürüyüşçüleri)
  { district: "coastal", position: { x: -70, z: 83 }, axis: "x", direction: 1, speed: 0.82, min: -85, max: -20, color: "#e91e63", kind: "tourist" },
  { district: "coastal", position: { x: -50, z: 92 }, axis: "z", direction: -1, speed: 0.72, min: 86, max: 98, color: "#00bcd4", kind: "tourist" },
  { district: "coastal", position: { x: -45, z: 85.5 }, axis: "x", direction: -1, speed: 0.76, min: -85, max: -15, color: "#ffeb3b", kind: "tourist" },
  { district: "coastal", position: { x: -35, z: 8.5 }, axis: "x", direction: 1, speed: 0.86, min: -45, max: -12, color: "#3f51b5", kind: "casual" },
  { district: "coastal", position: { x: -70, z: 8.5 }, axis: "x", direction: -1, speed: 0.8, min: -88, max: -55, color: "#4caf50", kind: "tourist" },
  { district: "coastal", position: { x: -8.5, z: 50 }, axis: "z", direction: -1, speed: 0.82, min: 25, max: 75, color: "#ff5722", kind: "casual" },
];

/**
 * Şehir merkezinde ve Güneş Mahallesinde yürüyen varsayılan yayalar.
 * (Kaldırımlar, kavşak yaya geçitleri, park önleri).
 */
export const DEFAULT_PEDESTRIANS: PedestrianDef[] = [
  // 1. Orijinal 4 temel rota (test uyumluluğu için aynen korunur)
  { position: { x: -18, z: -4.1 }, axis: "x", direction: 1, speed: 1.05, limit: 28, kind: "casual" },
  { position: { x: 14, z: 4.1 }, axis: "x", direction: -1, speed: 0.8, limit: 28, kind: "casual" },
  { position: { x: -4.1, z: -19 }, axis: "z", direction: 1, speed: 0.9, limit: 23, kind: "casual" },
  { position: { x: 4.1, z: 18 }, axis: "z", direction: -1, speed: 0.72, limit: 23, kind: "casual" },

  // 2. Kavşak Zebra Yaya Geçitlerinde Karşıdan Karşıya Geçenler
  { position: { x: -2.0, z: -6.6 }, axis: "x", direction: 1, speed: 0.85, min: -3.8, max: 3.8, color: "#e53e3e", kind: "casual" },
  { position: { x: 2.0, z: 6.6 }, axis: "x", direction: -1, speed: 0.82, min: -3.8, max: 3.8, color: "#3182ce", kind: "business" },
  { position: { x: 6.6, z: -2.0 }, axis: "z", direction: 1, speed: 0.86, min: -3.8, max: 3.8, color: "#38a169", kind: "casual" },
  { position: { x: -6.6, z: 2.0 }, axis: "z", direction: -1, speed: 0.84, min: -3.8, max: 3.8, color: "#d69e2e", kind: "tourist" },

  // 3. Ana Bulvar Kaldırımlarında Yürüyüş Yapanlar
  { position: { x: -5.8, z: -40 }, axis: "z", direction: 1, speed: 0.92, min: -75, max: 75, color: "#805ad5", kind: "business" },
  { position: { x: 5.8, z: 40 }, axis: "z", direction: -1, speed: 0.88, min: -75, max: 75, color: "#dd6b20", kind: "casual" },
  { position: { x: -40, z: -5.8 }, axis: "x", direction: 1, speed: 0.9, min: -75, max: 75, color: "#319795", kind: "casual" },
  { position: { x: 40, z: 5.8 }, axis: "x", direction: -1, speed: 0.86, min: -75, max: 75, color: "#e53e3e", kind: "tourist" },

  // 4. Güneş Mahallesi (Depo, Park ve Evler Önü Kaldırımları)
  { position: { x: -55, z: -25 }, axis: "z", direction: 1, speed: 0.85, min: -38, max: -15, color: "#4a5568", kind: "worker" },
  { position: { x: -65, z: -74 }, axis: "x", direction: 1, speed: 0.8, min: -85, max: -45, color: "#48bb78", kind: "casual" },
  { position: { x: -35, z: -74 }, axis: "x", direction: -1, speed: 0.82, min: -55, max: -15, color: "#ed8936", kind: "casual" },
  { position: { x: -20, z: -45 }, axis: "z", direction: 1, speed: 0.84, min: -75, max: -15, color: "#4299e1", kind: "business" },
];

/**
 * Hareketli, animasyonlu, kollar/bacaklar sallanan sevimli low-poly yaya karakteri üretir.
 */
function buildAnimatedPedestrian(
  parent: THREE.Group,
  color: string,
  kind: PedestrianKind = "casual",
): {
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  headGroup: THREE.Group;
} {
  // 1. Gövde (Torso)
  box(parent, [0.28, 0.44, 0.2], [0, 0.68, 0], color);

  // 2. Kafa Grubu (Ten, Saç/Şapka)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);
  parent.add(headGroup);

  const skinColors = ["#fed7aa", "#fcd34d", "#fbcfe8", "#e2b388", "#bb8253"];
  const skin = skinColors[Math.abs(Math.round(parent.position.x * 3 + parent.position.z * 7)) % skinColors.length];
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    mat(skin, 0.9),
  );
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Saç veya Şapka Stili
  if (kind === "worker") {
    // Sarı İşçi Bareti
    const baret = box(headGroup, [0.26, 0.1, 0.26], [0, 0.12, 0], "#f59e0b");
    baret.castShadow = true;
  } else if (kind === "tourist") {
    // Siperlikli Beyzbol Şapkası
    box(headGroup, [0.24, 0.08, 0.24], [0, 0.12, 0], "#e53e3e");
    box(headGroup, [0.2, 0.03, 0.14], [0, 0.08, 0.15], "#e53e3e");
  } else if (kind === "business") {
    // Şık saç modeli
    box(headGroup, [0.24, 0.08, 0.24], [0, 0.12, -0.02], "#1a202c");
  } else {
    // Renkli standart saç
    const hairCols = ["#78350f", "#1c1917", "#b45309", "#d97706"];
    const hCol = hairCols[Math.abs(Math.round(parent.position.x * 5 + parent.position.z * 11)) % hairCols.length];
    box(headGroup, [0.24, 0.08, 0.24], [0, 0.12, 0], hCol);
  }

  // 3. Kollar (Omuzdan asılı pivotlar)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.2, 0.86, 0);
  parent.add(leftArmPivot);
  box(leftArmPivot, [0.09, 0.38, 0.09], [0, -0.19, 0], color);
  box(leftArmPivot, [0.07, 0.08, 0.07], [0, -0.38, 0], skin); // El

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.2, 0.86, 0);
  parent.add(rightArmPivot);
  box(rightArmPivot, [0.09, 0.38, 0.09], [0, -0.19, 0], color);
  box(rightArmPivot, [0.07, 0.08, 0.07], [0, -0.38, 0], skin); // El

  // 4. Bacaklar (Kalçadan asılı pivotlar)
  const pantsColor = kind === "worker" ? "#1e3a8a" : kind === "business" ? "#1e293b" : "#334155";

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.08, 0.46, 0);
  parent.add(leftLegPivot);
  box(leftLegPivot, [0.1, 0.44, 0.1], [0, -0.22, 0], pantsColor);
  box(leftLegPivot, [0.1, 0.06, 0.14], [0, -0.42, 0.02], "#0f172a"); // Ayakkabı

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.08, 0.46, 0);
  parent.add(rightLegPivot);
  box(rightLegPivot, [0.1, 0.44, 0.1], [0, -0.22, 0], pantsColor);
  box(rightLegPivot, [0.1, 0.06, 0.14], [0, -0.42, 0.02], "#0f172a"); // Ayakkabı

  return { leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot, headGroup };
}

export function createPedestrians() {
  const group = new THREE.Group();
  group.name = "city_pedestrians";

  const pedestrians: Pedestrian[] = [];

  // 1. Varsayılan yayalar
  for (const def of DEFAULT_PEDESTRIANS) {
    const pGroup = new THREE.Group();
    const parts = buildAnimatedPedestrian(pGroup, def.color ?? "#d66f5b", def.kind ?? "casual");
    pedestrians.push({
      ...def,
      position: { ...def.position },
      baseSpeed: def.speed,
      group: pGroup,
      ...parts,
      walkPhase: Math.random() * Math.PI * 2,
      panicTimer: 0,
      fleeOffsetX: 0,
      fleeOffsetZ: 0,
    });
  }

  // 2. Bölge yayaları
  for (const extra of DISTRICT_PEDESTRIANS) {
    const pGroup = new THREE.Group();
    const parts = buildAnimatedPedestrian(pGroup, extra.color ?? "#5bc0de", extra.kind ?? "casual");
    pedestrians.push({
      ...extra,
      position: { ...extra.position },
      baseSpeed: extra.speed,
      group: pGroup,
      ...parts,
      walkPhase: Math.random() * Math.PI * 2,
      panicTimer: 0,
      fleeOffsetX: 0,
      fleeOffsetZ: 0,
    });
  }

  // 3. Ek bölge yayaları
  for (const extra of EXTRA_DISTRICT_PEDESTRIANS) {
    const pGroup = new THREE.Group();
    const parts = buildAnimatedPedestrian(pGroup, extra.color ?? "#38a169", extra.kind ?? "casual");
    pedestrians.push({
      ...extra,
      position: { ...extra.position },
      baseSpeed: extra.speed,
      group: pGroup,
      ...parts,
      walkPhase: Math.random() * Math.PI * 2,
      panicTimer: 0,
      fleeOffsetX: 0,
      fleeOffsetZ: 0,
    });
  }

  // Sahneye ekle
  pedestrians.forEach((p) => {
    p.group.position.set(p.position.x, 0, p.position.z);
    p.group.visible = !p.district;
    group.add(p.group);
  });

  let unlocked = new Set<DistrictId>(["sunny"]);

  return {
    group,
    pedestrians,
    setCompanyLevel(level: number, unlockedDistricts?: DistrictId[] | Set<DistrictId>) {
      unlocked = new Set(
        districts
          .filter((d) => isDistrictUnlocked(d.id, level, unlockedDistricts))
          .map((d) => d.id),
      );
      for (const ped of pedestrians) {
        ped.group.visible = !ped.district || unlocked.has(ped.district);
      }
    },

    update(dt: number, player: Vec2, playerSpeed: number) {
      const contacts: DamageContact[] = [];

      for (const [index, p] of pedestrians.entries()) {
        const active = !p.district || unlocked.has(p.district);
        if (!active) continue;

        // Oyuncuya mesafe kontrolü
        const distToPlayer = Math.hypot(
          player.x - (p.position.x + p.fleeOffsetX),
          player.z - (p.position.z + p.fleeOffsetZ),
        );

        // Hızlı araba yaklaştığında panik kaçış durumu!
        const isCarDanger = distToPlayer < 4.2 && playerSpeed > 3.2;
        if (isCarDanger) {
          p.panicTimer = 1.2; // 1.2 saniye panik hali
        }

        const isPanicking = p.panicTimer > 0;
        if (isPanicking) {
          p.panicTimer -= dt;
          // Yoldan / oyuncunun arabasından zıt yöne kaçış vektörü
          const dx = (p.position.x + p.fleeOffsetX) - player.x;
          const dz = (p.position.z + p.fleeOffsetZ) - player.z;
          const len = Math.hypot(dx, dz) || 1;
          p.fleeOffsetX += (dx / len) * 2.8 * dt;
          p.fleeOffsetZ += (dz / len) * 2.8 * dt;
          // Hızlı adım
          p.walkPhase += dt * 18;
        } else {
          // Normal yürüyüş temposuna geri dönme
          p.fleeOffsetX *= Math.exp(-4 * dt);
          p.fleeOffsetZ *= Math.exp(-4 * dt);
          p.walkPhase += dt * p.speed * 4.8;
        }

        // Ana hareket ekseni
        const currentSpeed = isPanicking ? p.baseSpeed * 1.6 : p.baseSpeed;
        p.position[p.axis] += p.direction * currentSpeed * dt;

        if (p.limit !== undefined) {
          if (Math.abs(p.position[p.axis]) > p.limit) {
            p.direction = p.direction === 1 ? -1 : 1;
          }
        } else if (p.min !== undefined && p.max !== undefined) {
          if (p.direction > 0 && p.position[p.axis] > p.max) {
            p.direction = -1;
          } else if (p.direction < 0 && p.position[p.axis] < p.min) {
            p.direction = 1;
          }
        }

        // Pozisyon
        const finalX = p.position.x + p.fleeOffsetX;
        const finalZ = p.position.z + p.fleeOffsetZ;
        p.group.position.set(finalX, 0, finalZ);

        // Rotasyon (Hareket yönüne bakar)
        p.group.rotation.y =
          p.axis === "x"
            ? p.direction > 0
              ? Math.PI / 2
              : -Math.PI / 2
            : p.direction > 0
              ? 0
              : Math.PI;

        // 🚶 Animasyon: Kollar ve Bacaklar
        if (isPanicking) {
          // Panik: Kollar havada çırpınır!
          const armFlail = Math.sin(p.panicTimer * 28) * 0.35;
          p.leftArmPivot.rotation.x = -2.6 + armFlail;
          p.rightArmPivot.rotation.x = -2.6 - armFlail;
          p.leftArmPivot.rotation.z = -0.4;
          p.rightArmPivot.rotation.z = 0.4;

          // Hızlı bacak adımları
          p.leftLegPivot.rotation.x = Math.sin(p.walkPhase) * 0.75;
          p.rightLegPivot.rotation.x = -Math.sin(p.walkPhase) * 0.75;
        } else {
          // Normal Yürüyüş: Kollar ve bacaklar ahenkle sallanır
          const armSwing = Math.sin(p.walkPhase) * 0.55;
          p.leftArmPivot.rotation.x = armSwing;
          p.rightArmPivot.rotation.x = -armSwing;
          p.leftArmPivot.rotation.z = 0;
          p.rightArmPivot.rotation.z = 0;

          const legSwing = Math.sin(p.walkPhase) * 0.62;
          p.leftLegPivot.rotation.x = -legSwing;
          p.rightLegPivot.rotation.x = legSwing;
        }

        // Çarpışma teması (Yayaya çarpma cezası)
        if (distToPlayer < 1.35 && playerSpeed > 3.5) {
          contacts.push({ id: `pedestrian:${index}`, severity: (1 - distToPlayer / 1.35) * 0.45 });
        }
      }

      return contacts;
    },
  };
}
