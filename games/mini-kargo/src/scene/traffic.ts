import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Vec2 } from "../game/types";
import type { DamageContact } from "../game/contact-damage";
import { districts, isDistrictUnlocked, type DistrictId } from "../game/districts";

export type VehicleKind = "taxi" | "police" | "suv" | "truck" | "sedan";

export type TrafficCar = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
  /** Dolaşım aralığı (hareket ekseni boyunca). Varsayılan -90..90. */
  min?: number;
  max?: number;
  /** Yalnızca bu bölge açıkken görünür ve temas eder. */
  district?: DistrictId;
  kind?: VehicleKind;
  color?: string;
  size?: [number, number, number];
  /** Çarpışma ve sarsıntı durumları */
  recoilX: number;
  recoilZ: number;
  shakeTimer: number;
  hornTimer: number;
  flasherTimer: number;
  policeFlasherL?: THREE.Mesh;
  policeFlasherR?: THREE.Mesh;
};

export type TrafficCarDef = Omit<
  TrafficCar,
  "group" | "recoilX" | "recoilZ" | "shakeTimer" | "hornTimer" | "flasherTimer" | "policeFlasherL" | "policeFlasherR"
>;

export type TrafficUpdateResult = DamageContact[] & {
  collisionCarIndex?: number | null;
  contacts: DamageContact[];
};

// 4 Tekerlek ekleyici
function addWheels(group: THREE.Group, w: number, l: number, radius = 0.24, thickness = 0.16) {
  const wheelGeom = new THREE.CylinderGeometry(radius, radius, thickness, 10);
  const wheelMat = mat("#1a202c", 0.9);
  const hubMat = mat("#cbd5e0", 0.4);

  const halfW = w / 2;
  const positions = [
    [-halfW, radius, l * 0.32],
    [halfW, radius, l * 0.32],
    [-halfW, radius, -l * 0.32],
    [halfW, radius, -l * 0.32],
  ];

  for (const [wx, wy, wz] of positions) {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);

    // Jant kapağı
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, thickness + 0.02, 8), hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wx, wy, wz);
    group.add(hub);
  }
}

// 🚕 Sarı Taksi Modeli
function buildTaxiModel(group: THREE.Group, w = 1.25, h = 0.54, l = 2.2) {
  addWheels(group, w, l);
  // Gövde (Canlı Sarı)
  box(group, [w, h, l], [0, h * 0.85, 0], "#f1c40f", 0.5);
  // Siyah-Beyaz damalı yan şerit
  box(group, [w + 0.02, 0.1, l * 0.85], [0, h * 0.75, 0], "#2d3748");
  // Cam kabin
  box(group, [w * 0.85, h * 0.68, l * 0.48], [0, h * 1.5, -l * 0.02], "#1a202c", 0.2);
  // Ön farlar
  box(group, [0.24, 0.12, 0.05], [-w * 0.34, h * 0.85, l * 0.5], "#fff9d2");
  box(group, [0.24, 0.12, 0.05], [w * 0.34, h * 0.85, l * 0.5], "#fff9d2");
  // Arka stop lambaları
  box(group, [0.24, 0.12, 0.05], [-w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  box(group, [0.24, 0.12, 0.05], [w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  // Taksi Tabelası
  box(group, [0.55, 0.16, 0.24], [0, h * 1.95, -l * 0.02], "#ffdd00");
  box(group, [0.42, 0.08, 0.26], [0, h * 1.95, -l * 0.02], "#1a202c");
}

// 🚓 Polis Arabası Modeli
function buildPoliceModel(car: TrafficCar, group: THREE.Group, w = 1.28, h = 0.56, l = 2.3) {
  addWheels(group, w, l);
  // Beyaz ana gövde
  box(group, [w, h, l], [0, h * 0.85, 0], "#ffffff", 0.6);
  // Lacivert yan ve kaput detayları
  box(group, [w + 0.02, h * 0.45, l * 0.65], [0, h * 0.85, 0], "#1a365d");
  // Cam kabin
  box(group, [w * 0.85, h * 0.68, l * 0.48], [0, h * 1.5, -l * 0.02], "#1a202c", 0.2);
  // Ön/arka farlar
  box(group, [0.24, 0.12, 0.05], [-w * 0.34, h * 0.85, l * 0.5], "#bee3f8");
  box(group, [0.24, 0.12, 0.05], [w * 0.34, h * 0.85, l * 0.5], "#bee3f8");
  box(group, [0.24, 0.12, 0.05], [-w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  box(group, [0.24, 0.12, 0.05], [w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  // Tepe Çakar Lambası Barı
  box(group, [0.65, 0.08, 0.18], [0, h * 1.88, -l * 0.02], "#4a5568");
  const blueLight = box(group, [0.25, 0.14, 0.16], [-0.18, h * 1.98, -l * 0.02], "#3182ce");
  const redLight = box(group, [0.25, 0.14, 0.16], [0.18, h * 1.98, -l * 0.02], "#e53e3e");
  car.policeFlasherL = blueLight;
  car.policeFlasherR = redLight;
}

// 🚙 SUV / Aile Aracı Modeli
function buildSuvModel(group: THREE.Group, color: string, w = 1.36, h = 0.72, l = 2.45) {
  addWheels(group, w, l, 0.28, 0.18);
  // Gövde
  box(group, [w, h, l], [0, h * 0.85, 0], color, 0.5);
  // Geniş tavan ve camlar
  box(group, [w * 0.88, h * 0.62, l * 0.62], [0, h * 1.48, -l * 0.06], "#2d3748", 0.3);
  // Tavan Rayları (Roof Rails)
  box(group, [0.08, 0.08, l * 0.55], [-w * 0.38, h * 1.84, -l * 0.06], "#cbd5e0");
  box(group, [0.08, 0.08, l * 0.55], [w * 0.38, h * 1.84, -l * 0.06], "#cbd5e0");
  // Arka Stepne Tekerleği
  const spare = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 10), mat("#1a202c", 0.9));
  spare.rotation.x = Math.PI / 2;
  spare.position.set(0, h * 0.95, -l * 0.56);
  spare.castShadow = true;
  group.add(spare);
  // Farlar
  box(group, [0.26, 0.14, 0.05], [-w * 0.34, h * 0.85, l * 0.5], "#fffbe6");
  box(group, [0.26, 0.14, 0.05], [w * 0.34, h * 0.85, l * 0.5], "#fffbe6");
  box(group, [0.26, 0.14, 0.05], [-w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  box(group, [0.26, 0.14, 0.05], [w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
}

// 🚚 Dağıtım Kamyoneti (Box Truck) Modeli
function buildTruckModel(group: THREE.Group, cabColor: string, w = 1.52, h = 0.95, l = 3.3) {
  addWheels(group, w, l, 0.3, 0.2);
  // Ön sürücü kabini
  box(group, [w, h * 0.85, l * 0.35], [0, h * 0.75, l * 0.32], cabColor);
  // Ön cam
  box(group, [w * 0.88, h * 0.45, 0.08], [0, h * 0.95, l * 0.49], "#2d3748", 0.2);
  // Arka Kapalı Kargo Kasası
  box(group, [w * 1.05, h * 1.25, l * 0.65], [0, h * 1.05, -l * 0.18], "#edf2f7", 0.8);
  // Kasa yan kargo çizgisi
  box(group, [w * 1.06, 0.22, l * 0.62], [0, h * 1.05, -l * 0.18], "#dd6b20");
  // Farlar
  box(group, [0.28, 0.15, 0.05], [-w * 0.34, h * 0.65, l * 0.5], "#fffbe6");
  box(group, [0.28, 0.15, 0.05], [w * 0.34, h * 0.65, l * 0.5], "#fffbe6");
  box(group, [0.28, 0.15, 0.05], [-w * 0.34, h * 0.45, -l * 0.5], "#e53e3e");
  box(group, [0.28, 0.15, 0.05], [w * 0.34, h * 0.45, -l * 0.5], "#e53e3e");
}

// 🚗 Standart Sedan Araba Modeli
function buildSedanModel(group: THREE.Group, color: string, w = 1.22, h = 0.54, l = 2.15) {
  addWheels(group, w, l);
  box(group, [w, h, l], [0, h * 0.85, 0], color, 0.6);
  box(group, [w * 0.83, h * 0.66, l * 0.42], [0, h * 1.48, l * 0.05], "#2d3748", 0.3);
  box(group, [0.22, 0.12, 0.05], [-w * 0.34, h * 0.85, l * 0.5], "#fffbe6");
  box(group, [0.22, 0.12, 0.05], [w * 0.34, h * 0.85, l * 0.5], "#fffbe6");
  box(group, [0.22, 0.12, 0.05], [-w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
  box(group, [0.22, 0.12, 0.05], [w * 0.34, h * 0.85, -l * 0.5], "#e53e3e");
}

/**
 * Bölgeye özel trafik tanımları.
 * world.test.ts tarafından import edildiği için orijinal 9 rota tam olarak korunur.
 */
export const DISTRICT_TRAFFIC: TrafficCarDef[] = [
  { district: "market", position: { x: 20, z: 53.6 }, axis: "x", direction: 1, speed: 2.2, min: 12, max: 90, kind: "taxi", color: "#f1c40f" },
  { district: "market", position: { x: 80, z: 46.4 }, axis: "x", direction: -1, speed: 2.0, min: 12, max: 90, kind: "sedan", color: "#4a7fb0" },
  { district: "market", position: { x: 46.4, z: 20 }, axis: "z", direction: 1, speed: 2.1, min: 12, max: 90, kind: "police", color: "#ffffff" },
  { district: "market", position: { x: 53.6, z: 85 }, axis: "z", direction: -1, speed: 1.9, min: 12, max: 90, kind: "suv", color: "#6aa86a" },
  { district: "industrial", position: { x: 20, z: -51.8 }, axis: "x", direction: 1, speed: 1.8, min: 12, max: 90, kind: "truck", color: "#c05621", size: [1.5, 0.9, 3.2] },
  { district: "industrial", position: { x: 80, z: -48.2 }, axis: "x", direction: -1, speed: 1.7, min: 12, max: 90, kind: "truck", color: "#2b6cb0", size: [1.5, 0.9, 3.2] },
  { district: "industrial", position: { x: 50, z: -85 }, axis: "z", direction: 1, speed: 1.9, min: -90, max: -12, kind: "truck", color: "#718096", size: [1.5, 0.9, 3.2] },
  { district: "coastal", position: { x: -48.2, z: 20 }, axis: "z", direction: 1, speed: 3.8, min: 12, max: 80, kind: "suv", color: "#38b2ac" },
  { district: "coastal", position: { x: -85, z: 51.8 }, axis: "x", direction: 1, speed: 3.4, min: -90, max: -12, kind: "taxi", color: "#f1c40f" },
];

/**
 * Bölgeler açıldığında ana bulvarlarda ve güvenli hatlarda akan ek araçlar.
 */
export const EXTRA_DISTRICT_TRAFFIC: TrafficCarDef[] = [
  // Çarşı açılınca bulvar trafiği takviyesi
  { district: "market", position: { x: 40, z: 52.2 }, axis: "x", direction: 1, speed: 2.8, min: 12, max: 90, kind: "taxi", color: "#f1c40f" },
  { district: "market", position: { x: 70, z: 47.8 }, axis: "x", direction: -1, speed: 2.6, min: 12, max: 90, kind: "suv", color: "#d97706" },
  { district: "market", position: { x: 47.8, z: 60 }, axis: "z", direction: 1, speed: 2.7, min: 12, max: 90, kind: "police", color: "#ffffff" },

  // Sanayi açılınca ağır araç takviyesi
  { district: "industrial", position: { x: 45, z: -52.2 }, axis: "x", direction: 1, speed: 2.2, min: 12, max: 90, kind: "truck", color: "#e65100" },
  { district: "industrial", position: { x: 75, z: -47.8 }, axis: "x", direction: -1, speed: 2.1, min: 12, max: 90, kind: "suv", color: "#374151" },
  { district: "industrial", position: { x: 52.2, z: -40 }, axis: "z", direction: -1, speed: 2.4, min: -90, max: -12, kind: "truck", color: "#475569" },

  // Sahil açılınca kordon/bulvar araçları
  { district: "coastal", position: { x: -40, z: 52.2 }, axis: "x", direction: 1, speed: 3.5, min: -90, max: -12, kind: "taxi", color: "#f1c40f" },
  { district: "coastal", position: { x: -70, z: 47.8 }, axis: "x", direction: -1, speed: 3.3, min: -90, max: -12, kind: "suv", color: "#0ea5e9" },
  { district: "coastal", position: { x: -52.2, z: 45 }, axis: "z", direction: 1, speed: 3.2, min: 12, max: 80, kind: "sedan", color: "#ec4899" },
];

/**
 * Ana Bulvarlarda ve Güneş Mahallesinde kesintisiz akan varsayılan araçlar.
 */
export const DEFAULT_TRAFFIC: TrafficCarDef[] = [
  // 1. Z = 0 Ana Doğu-Batı Bulvarı (Çift Şerit)
  { position: { x: -65, z: 2.2 }, axis: "x", direction: 1, speed: 3.2, min: -90, max: 90, kind: "taxi", color: "#f1c40f" },
  { position: { x: -15, z: 2.2 }, axis: "x", direction: 1, speed: 3.0, min: -90, max: 90, kind: "suv", color: "#1e3a8a" },
  { position: { x: 35, z: 2.2 }, axis: "x", direction: 1, speed: 3.3, min: -90, max: 90, kind: "police", color: "#ffffff" },
  { position: { x: 75, z: -2.2 }, axis: "x", direction: -1, speed: 3.1, min: -90, max: 90, kind: "truck", color: "#2563eb" },
  { position: { x: 25, z: -2.2 }, axis: "x", direction: -1, speed: 3.0, min: -90, max: 90, kind: "taxi", color: "#f1c40f" },
  { position: { x: -35, z: -2.2 }, axis: "x", direction: -1, speed: 2.9, min: -90, max: 90, kind: "sedan", color: "#e11d48" },

  // 2. X = 0 Ana Kuzey-Güney Bulvarı (Çift Şerit)
  { position: { x: 2.2, z: 65 }, axis: "z", direction: -1, speed: 3.1, min: -90, max: 90, kind: "sedan", color: "#10b981" },
  { position: { x: 2.2, z: 15 }, axis: "z", direction: -1, speed: 3.3, min: -90, max: 90, kind: "taxi", color: "#f1c40f" },
  { position: { x: 2.2, z: -45 }, axis: "z", direction: -1, speed: 3.0, min: -90, max: 90, kind: "suv", color: "#831843" },
  { position: { x: -2.2, z: -75 }, axis: "z", direction: 1, speed: 3.2, min: -90, max: 90, kind: "police", color: "#ffffff" },
  { position: { x: -2.2, z: -25 }, axis: "z", direction: 1, speed: 2.9, min: -90, max: 90, kind: "truck", color: "#ea580c" },
  { position: { x: -2.2, z: 35 }, axis: "z", direction: 1, speed: 3.0, min: -90, max: 90, kind: "sedan", color: "#7c3aed" },

  // 3. Güneş Mahallesi Sokakları (Z = -80, Z = -10, X = -80, X = -50)
  { position: { x: -55, z: -48.2 }, axis: "x", direction: 1, speed: 3.0, min: -90, max: -10, kind: "sedan", color: "#b85d4e" },
  { position: { x: -75, z: -80 }, axis: "x", direction: 1, speed: 2.7, min: -88, max: -12, kind: "taxi", color: "#f1c40f" },
  { position: { x: -25, z: -80 }, axis: "x", direction: -1, speed: 2.6, min: -88, max: -12, kind: "suv", color: "#047857" },
  { position: { x: -65, z: -10 }, axis: "x", direction: 1, speed: 2.8, min: -88, max: -12, kind: "truck", color: "#f59e0b" },
  { position: { x: -25, z: -10 }, axis: "x", direction: -1, speed: 2.7, min: -88, max: -12, kind: "sedan", color: "#475569" },
  { position: { x: -80, z: -35 }, axis: "z", direction: 1, speed: 2.8, min: -88, max: -12, kind: "police", color: "#ffffff" },
  { position: { x: -50, z: -65 }, axis: "z", direction: -1, speed: 2.6, min: -88, max: -12, kind: "taxi", color: "#f1c40f" },
];

export function createTraffic() {
  const group = new THREE.Group();
  group.name = "city_traffic";

  const cars: TrafficCar[] = [];

  // 1. Varsayılan araçları ekle
  for (const def of DEFAULT_TRAFFIC) {
    cars.push({
      ...def,
      position: { ...def.position },
      group: new THREE.Group(),
      recoilX: 0,
      recoilZ: 0,
      shakeTimer: 0,
      hornTimer: 0,
      flasherTimer: 0,
    });
  }

  // 2. Bölge araçlarını ekle
  for (const extra of DISTRICT_TRAFFIC) {
    cars.push({
      ...extra,
      position: { ...extra.position },
      group: new THREE.Group(),
      recoilX: 0,
      recoilZ: 0,
      shakeTimer: 0,
      hornTimer: 0,
      flasherTimer: 0,
    });
  }

  // 3. Ek bölge bulvar araçlarını ekle
  for (const extra of EXTRA_DISTRICT_TRAFFIC) {
    cars.push({
      ...extra,
      position: { ...extra.position },
      group: new THREE.Group(),
      recoilX: 0,
      recoilZ: 0,
      shakeTimer: 0,
      hornTimer: 0,
      flasherTimer: 0,
    });
  }

  // Modelleri oluştur
  cars.forEach((car, index) => {
    const kind = car.kind ?? (index % 5 === 0 ? "taxi" : index % 5 === 1 ? "police" : index % 5 === 2 ? "suv" : index % 5 === 3 ? "truck" : "sedan");
    const color = car.color ?? ["#f1c40f", "#ffffff", "#1e3a8a", "#c05621", "#7c3aed"][index % 5];

    switch (kind) {
      case "taxi":
        buildTaxiModel(car.group);
        break;
      case "police":
        buildPoliceModel(car, car.group);
        break;
      case "suv":
        buildSuvModel(car.group, color);
        break;
      case "truck":
        buildTruckModel(car.group, color);
        break;
      case "sedan":
      default:
        buildSedanModel(car.group, color);
        break;
    }

    car.group.position.set(car.position.x, 0.08, car.position.z);
    car.group.visible = !car.district;
    group.add(car.group);
  });

  let unlocked = new Set<DistrictId>(["sunny"]);

  return {
    group,
    cars,
    /** Şirket seviyesine veya açık bölgeler listesine göre bölge trafiğini açar. */
    setCompanyLevel(level: number, unlockedDistricts?: DistrictId[] | Set<DistrictId>) {
      unlocked = new Set(
        districts
          .filter((d) => isDistrictUnlocked(d.id, level, unlockedDistricts))
          .map((d) => d.id),
      );
      const hasMarket = unlocked.has("market");
      // Ana bulvardaki arabalar çarşı açıldığında tüm eksende akar
      if (cars.length > 5) {
        cars[3].max = hasMarket ? 90 : 0;
        cars[4].max = hasMarket ? 90 : 0;
      }
      for (const car of cars) {
        car.group.visible = !car.district || unlocked.has(car.district);
      }
    },

    /**
     * Araç çarpışması anında trafik arabasını sarsar ve geriye iter.
     */
    impactCar(carIndex: number, hitPos: Vec2, impactForce: number) {
      const car = cars[carIndex];
      if (!car) return;
      const dx = car.position.x - hitPos.x;
      const dz = car.position.z - hitPos.z;
      const dist = Math.hypot(dx, dz) || 1;
      const push = Math.min(1.8, impactForce * 0.4);
      car.recoilX += (dx / dist) * push;
      car.recoilZ += (dz / dist) * push;
      car.shakeTimer = 0.4;
      car.hornTimer = 0.5; // Korna çalma isteği
    },

    update(dt: number, player: Vec2): TrafficUpdateResult {
      const contacts: DamageContact[] = [];
      let collisionCarIndex: number | null = null;

      for (const [index, car] of cars.entries()) {
        const active = !car.district || unlocked.has(car.district);
        if (!active) continue;

        const min = car.min ?? -90;
        const max = car.max ?? 90;

        // Normal sürüş hareketi
        car.position[car.axis] += car.direction * car.speed * dt;
        if (car.direction > 0 && car.position[car.axis] > max) car.position[car.axis] = min;
        if (car.direction < 0 && car.position[car.axis] < min) car.position[car.axis] = max;

        // Geri tepme sönümlenmesi (Recoil recovery)
        if (Math.abs(car.recoilX) > 0.01 || Math.abs(car.recoilZ) > 0.01) {
          car.recoilX *= Math.exp(-6 * dt);
          car.recoilZ *= Math.exp(-6 * dt);
        } else {
          car.recoilX = 0;
          car.recoilZ = 0;
        }

        // Sarsıntı animasyonu (Shake / wobble)
        let rollAngle = 0;
        if (car.shakeTimer > 0) {
          car.shakeTimer -= dt;
          rollAngle = Math.sin(car.shakeTimer * 30) * 0.12 * (car.shakeTimer / 0.4);
        }

        // Polis tepe lambası çakarı
        if (car.kind === "police" && car.policeFlasherL && car.policeFlasherR) {
          car.flasherTimer += dt;
          const flash = Math.sin(car.flasherTimer * 16) > 0;
          (car.policeFlasherL.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(
            flash ? "#3182ce" : "#000000",
          );
          (car.policeFlasherR.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(
            flash ? "#000000" : "#e53e3e",
          );
        }

        // Pozisyon ve rotasyon
        const finalX = car.position.x + car.recoilX;
        const finalZ = car.position.z + car.recoilZ;
        car.group.position.set(finalX, 0.08, finalZ);

        const baseRotY =
          car.axis === "x"
            ? car.direction > 0
              ? Math.PI / 2
              : -Math.PI / 2
            : car.direction > 0
              ? 0
              : Math.PI;
        car.group.rotation.set(0, baseRotY, rollAngle);

        // Çarpışma teması kontrolü
        const distance = Math.hypot(player.x - finalX, player.z - finalZ);
        if (distance < 1.75) {
          const sev = 1 - distance / 1.75;
          contacts.push({ id: `traffic:${index}`, severity: sev });
          collisionCarIndex = index;
        }
      }

      // Geriye dönük uyumluluk: contacts dizisini döner, aynı zamanda collisionCarIndex ve contacts özelliklerini taşır
      const result = contacts as DamageContact[] & {
        collisionCarIndex?: number | null;
        contacts: DamageContact[];
      };
      result.collisionCarIndex = collisionCarIndex;
      result.contacts = contacts;
      return result;
    },
  };
}
