import * as THREE from "three";
import { box, cylinder, mat } from "./world-kit";
import type { Vec2 } from "../game/types";

export type SignalAspect = "green" | "yellow" | "red";
export type PedAspect = "walk" | "stop" | "flashing";

export type TrafficSignalLocation = {
  id: string;
  position: Vec2;
  rotationY: number; // Y ekseni rotasyonu (radyan)
  axis: "x" | "z"; // Hangi bulvar/cadde eksenine bakar
  district?: string;
};

export type TrafficLightSignal = {
  id: string;
  group: THREE.Group;
  axis: "x" | "z";
  redLensMat: THREE.MeshStandardMaterial;
  yellowLensMat: THREE.MeshStandardMaterial;
  greenLensMat: THREE.MeshStandardMaterial;
  pedRedLensMat: THREE.MeshStandardMaterial;
  pedGreenLensMat: THREE.MeshStandardMaterial;
  vehicleAspect: SignalAspect;
  pedAspect: PedAspect;
};

export type TrafficLightsView = {
  group: THREE.Group;
  signals: TrafficLightSignal[];
  getPhase(): string;
  getSignalState(axis: "x" | "z"): { vehicle: SignalAspect; pedestrian: PedAspect };
  update(dt: number, isNightOrDusk?: boolean): void;
  dispose(): void;
};

/**
 * Şehrin kritik kavşak ve yaya geçitlerindeki trafik sinyal direkleri
 */
export const TRAFFIC_SIGNAL_LOCATIONS: TrafficSignalLocation[] = [
  // 1. Merkez Dönel Ada Kavşak Girişleri (X=0, Z=0)
  // Kuzey Geçidi (Z = -7.5) - Z ekseni trafiğine bakar
  { id: "signal_center_north", position: { x: 5.4, z: -8.4 }, rotationY: Math.PI, axis: "z" },
  // Güney Geçidi (Z = +7.5) - Z ekseni trafiğine bakar
  { id: "signal_center_south", position: { x: -5.4, z: 8.4 }, rotationY: 0, axis: "z" },
  // Doğu Geçidi (X = +7.5) - X ekseni trafiğine bakar
  { id: "signal_center_east", position: { x: 8.4, z: -5.4 }, rotationY: Math.PI / 2, axis: "x" },
  // Batı Geçidi (X = -7.5) - X ekseni trafiğine bakar
  { id: "signal_center_west", position: { x: -8.4, z: 5.4 }, rotationY: -Math.PI / 2, axis: "x" },

  // 2. Çarşı Bölgesi Ana Giriş & Meydan Kavşakları
  // Çarşı Bulvar Geçidi (X = 50, Z = 0)
  { id: "signal_market_blvd_e", position: { x: 44.2, z: 6.8 }, rotationY: -Math.PI / 2, axis: "x", district: "market" },
  { id: "signal_market_blvd_w", position: { x: 55.8, z: -6.8 }, rotationY: Math.PI / 2, axis: "x", district: "market" },
  // Çarşı Meydanı Yaya Geçidi (X = 50, Z = 50)
  { id: "signal_market_piazza", position: { x: 55.8, z: 43.2 }, rotationY: 0, axis: "z", district: "market" },

  // 3. Sahil Şeridi Kordon Yaya Geçidi (X = -50, Z = 50)
  { id: "signal_coastal_promenade", position: { x: -44.2, z: 43.2 }, rotationY: 0, axis: "z", district: "coastal" },

  // 4. Sanayi Bölgesi Ağır Yük Kavşağı (X = 50, Z = -50)
  { id: "signal_industrial_cross", position: { x: 44.2, z: -56.8 }, rotationY: Math.PI, axis: "z", district: "industrial" },
];

/**
 * Tek bir trafik ışığı direği (mast arm + araç sinyali + yaya sinyali) inşa eder
 */
function buildTrafficLightPole(loc: TrafficSignalLocation): TrafficLightSignal {
  const group = new THREE.Group();
  group.position.set(loc.position.x, 0, loc.position.z);
  group.rotation.y = loc.rotationY;

  const STEEL_COLOR = "#3d4852"; // Galvanizli çelik direk
  const HOUSING_COLOR = "#1a202c"; // Siyah mat sinyal kasası
  const HOOD_COLOR = "#0d1117"; // Güneş siperliği

  // 1. Zemin Taban Flanşı ve Ankraj Cıvataları
  cylinder(group, 0.28, 0.32, 0.12, [0, 0.06, 0], "#2d3748", 12);
  cylinder(group, 0.22, 0.24, 0.18, [0, 0.15, 0], "#4a5568", 12);

  // 2. Dikey Çelik Taşıyıcı Direk (Yükseklik 4.3m)
  cylinder(group, 0.1, 0.13, 4.3, [0, 2.2, 0], STEEL_COLOR, 10);

  // 3. Yatay Konsol Mast Arm (Yolun üzerine uzanan 2.6m yatay kol)
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.085, 2.6, 8),
    mat(STEEL_COLOR, 0.6),
  );
  arm.rotation.z = -Math.PI / 2;
  arm.position.set(1.3, 4.15, 0);
  group.add(arm);

  // Çapraz takviye gergisi
  const brace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
    mat(STEEL_COLOR, 0.6),
  );
  brace.rotation.z = -Math.PI / 4;
  brace.position.set(0.42, 3.8, 0);
  group.add(brace);

  // =========================================================================
  // 4. Konsol Ucundaki 3'lü Araç Sinyal Başlığı (Vehicular Signal Head)
  // =========================================================================
  const vHeadGroup = new THREE.Group();
  vHeadGroup.position.set(2.4, 3.85, 0);
  group.add(vHeadGroup);

  // Ana kasa ve sarı-siyah reflektör arka panel
  box(vHeadGroup, [0.36, 1.05, 0.32], [0, 0, 0], HOUSING_COLOR, 0.8);
  box(vHeadGroup, [0.46, 1.15, 0.04], [0, 0, -0.16], "#f1c40f", 0.6); // Reflektif sarı çerçeve
  box(vHeadGroup, [0.42, 1.11, 0.045], [0, 0, -0.16], "#1a202c", 0.6);

  // Üç renkli lens materyalleri (StandardMaterial with emissive)
  const redLensMat = new THREE.MeshStandardMaterial({
    color: "#4a1010",
    emissive: new THREE.Color("#000000"),
    roughness: 0.2,
    metalness: 0.1,
  });
  const yellowLensMat = new THREE.MeshStandardMaterial({
    color: "#4a3c10",
    emissive: new THREE.Color("#000000"),
    roughness: 0.2,
    metalness: 0.1,
  });
  const greenLensMat = new THREE.MeshStandardMaterial({
    color: "#104a25",
    emissive: new THREE.Color("#000000"),
    roughness: 0.2,
    metalness: 0.1,
  });

  const lensGeom = new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12);

  // Kırmızı Lens (Üst)
  const redMesh = new THREE.Mesh(lensGeom, redLensMat);
  redMesh.rotation.x = Math.PI / 2;
  redMesh.position.set(0, 0.32, 0.15);
  vHeadGroup.add(redMesh);
  // Güneş siperliği
  box(vHeadGroup, [0.24, 0.04, 0.14], [0, 0.44, 0.18], HOOD_COLOR);

  // Sarı / Amber Lens (Orta)
  const yellowMesh = new THREE.Mesh(lensGeom, yellowLensMat);
  yellowMesh.rotation.x = Math.PI / 2;
  yellowMesh.position.set(0, 0, 0.15);
  vHeadGroup.add(yellowMesh);
  box(vHeadGroup, [0.24, 0.04, 0.14], [0, 0.12, 0.18], HOOD_COLOR);

  // Yeşil Lens (Alt)
  const greenMesh = new THREE.Mesh(lensGeom, greenLensMat);
  greenMesh.rotation.x = Math.PI / 2;
  greenMesh.position.set(0, -0.32, 0.15);
  vHeadGroup.add(greenMesh);
  box(vHeadGroup, [0.24, 0.04, 0.14], [0, -0.2, 0.18], HOOD_COLOR);

  // =========================================================================
  // 5. Direk Üzerindeki 2'li Yaya Sinyal Başlığı (Pedestrian Signal Head)
  // =========================================================================
  const pHeadGroup = new THREE.Group();
  pHeadGroup.position.set(0, 1.9, 0.18);
  group.add(pHeadGroup);

  // Yaya sinyal kasası
  box(pHeadGroup, [0.24, 0.52, 0.2], [0, 0, 0], HOUSING_COLOR, 0.8);

  const pedRedLensMat = new THREE.MeshStandardMaterial({
    color: "#4a1010",
    emissive: new THREE.Color("#000000"),
    roughness: 0.2,
  });
  const pedGreenLensMat = new THREE.MeshStandardMaterial({
    color: "#104a25",
    emissive: new THREE.Color("#000000"),
    roughness: 0.2,
  });

  const pedLensGeom = new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10);

  // Yaya Kırmızı "DUR" Lensi (Üst)
  const pedRedMesh = new THREE.Mesh(pedLensGeom, pedRedLensMat);
  pedRedMesh.rotation.x = Math.PI / 2;
  pedRedMesh.position.set(0, 0.14, 0.09);
  pHeadGroup.add(pedRedMesh);
  box(pHeadGroup, [0.2, 0.03, 0.1], [0, 0.23, 0.11], HOOD_COLOR);

  // Yaya Yeşil "GEÇ" Lensi (Alt)
  const pedGreenMesh = new THREE.Mesh(pedLensGeom, pedGreenLensMat);
  pedGreenMesh.rotation.x = Math.PI / 2;
  pedGreenMesh.position.set(0, -0.14, 0.09);
  pHeadGroup.add(pedGreenMesh);
  box(pHeadGroup, [0.2, 0.03, 0.1], [0, -0.05, 0.11], HOOD_COLOR);

  return {
    id: loc.id,
    group,
    axis: loc.axis,
    redLensMat,
    yellowLensMat,
    greenLensMat,
    pedRedLensMat,
    pedGreenLensMat,
    vehicleAspect: "red",
    pedAspect: "stop",
  };
}

/**
 * Şehrin trafik sinyalizasyon sistemini oluşturur
 */
export function createTrafficLights(): TrafficLightsView {
  const group = new THREE.Group();
  group.name = "city_traffic_lights";

  const signals: TrafficLightSignal[] = [];

  for (const loc of TRAFFIC_SIGNAL_LOCATIONS) {
    const signal = buildTrafficLightPole(loc);
    signals.push(signal);
    group.add(signal.group);
  }

  // Döngü süreleri:
  // Faz 1: Z ekseni YEŞİL (10.0s)
  // Faz 2: Z ekseni SARI (2.5s)
  // Faz 3: Hepsi KIRMIZI güvenlik aralığı (0.8s)
  // Faz 4: X ekseni YEŞİL (10.0s)
  // Faz 5: X ekseni SARI (2.5s)
  // Faz 6: Hepsi KIRMIZI güvenlik aralığı (0.8s)
  const CYCLE_TIME = 26.6;
  let timer = 0;

  return {
    group,
    signals,
    getPhase() {
      const t = timer % CYCLE_TIME;
      if (t < 10.0) return "z_green";
      if (t < 12.5) return "z_yellow";
      if (t < 13.3) return "all_red_1";
      if (t < 23.3) return "x_green";
      if (t < 25.8) return "x_yellow";
      return "all_red_2";
    },
    getSignalState(axis: "x" | "z") {
      const phase = this.getPhase();
      if (axis === "z") {
        if (phase === "z_green") return { vehicle: "green", pedestrian: "stop" };
        if (phase === "z_yellow") return { vehicle: "yellow", pedestrian: "stop" };
        if (phase === "x_green") return { vehicle: "red", pedestrian: "walk" };
        if (phase === "x_yellow") return { vehicle: "red", pedestrian: "flashing" };
        return { vehicle: "red", pedestrian: "stop" };
      } else {
        if (phase === "x_green") return { vehicle: "green", pedestrian: "stop" };
        if (phase === "x_yellow") return { vehicle: "yellow", pedestrian: "stop" };
        if (phase === "z_green") return { vehicle: "red", pedestrian: "walk" };
        if (phase === "z_yellow") return { vehicle: "red", pedestrian: "flashing" };
        return { vehicle: "red", pedestrian: "stop" };
      }
    },
    update(dt: number, isNightOrDusk = false) {
      timer += dt;
      const phase = this.getPhase();

      // Gece veya alacakaranlıkta ışık parıltısı artar
      const emissiveMultiplier = isNightOrDusk ? 2.6 : 1.7;

      for (const sig of signals) {
        let vState: SignalAspect = "red";
        let pState: PedAspect = "stop";

        if (sig.axis === "z") {
          if (phase === "z_green") {
            vState = "green";
            pState = "stop";
          } else if (phase === "z_yellow") {
            vState = "yellow";
            pState = "stop";
          } else if (phase === "x_green") {
            vState = "red";
            pState = "walk";
          } else if (phase === "x_yellow") {
            vState = "red";
            pState = "flashing";
          } else {
            vState = "red";
            pState = "stop";
          }
        } else {
          // X ekseni
          if (phase === "x_green") {
            vState = "green";
            pState = "stop";
          } else if (phase === "x_yellow") {
            vState = "yellow";
            pState = "stop";
          } else if (phase === "z_green") {
            vState = "red";
            pState = "walk";
          } else if (phase === "z_yellow") {
            vState = "red";
            pState = "flashing";
          } else {
            vState = "red";
            pState = "stop";
          }
        }

        sig.vehicleAspect = vState;
        sig.pedAspect = pState;

        // Araç Sinyalleri Emissive Güncellemesi
        if (vState === "red") {
          sig.redLensMat.emissive.set("#ff2222");
          sig.redLensMat.emissiveIntensity = emissiveMultiplier;
          sig.yellowLensMat.emissive.set("#000000");
          sig.yellowLensMat.emissiveIntensity = 0;
          sig.greenLensMat.emissive.set("#000000");
          sig.greenLensMat.emissiveIntensity = 0;
        } else if (vState === "yellow") {
          sig.redLensMat.emissive.set("#000000");
          sig.redLensMat.emissiveIntensity = 0;
          sig.yellowLensMat.emissive.set("#ffaa00");
          sig.yellowLensMat.emissiveIntensity = emissiveMultiplier;
          sig.greenLensMat.emissive.set("#000000");
          sig.greenLensMat.emissiveIntensity = 0;
        } else {
          // green
          sig.redLensMat.emissive.set("#000000");
          sig.redLensMat.emissiveIntensity = 0;
          sig.yellowLensMat.emissive.set("#000000");
          sig.yellowLensMat.emissiveIntensity = 0;
          sig.greenLensMat.emissive.set("#00ff66");
          sig.greenLensMat.emissiveIntensity = emissiveMultiplier;
        }

        // Yaya Sinyalleri Emissive Güncellemesi
        if (pState === "walk") {
          sig.pedRedLensMat.emissive.set("#000000");
          sig.pedRedLensMat.emissiveIntensity = 0;
          sig.pedGreenLensMat.emissive.set("#00ff66");
          sig.pedGreenLensMat.emissiveIntensity = emissiveMultiplier;
        } else if (pState === "flashing") {
          const flash = Math.sin(timer * 12) > 0;
          sig.pedRedLensMat.emissive.set(flash ? "#ff2222" : "#000000");
          sig.pedRedLensMat.emissiveIntensity = flash ? emissiveMultiplier : 0;
          sig.pedGreenLensMat.emissive.set("#000000");
          sig.pedGreenLensMat.emissiveIntensity = 0;
        } else {
          // stop
          sig.pedRedLensMat.emissive.set("#ff2222");
          sig.pedRedLensMat.emissiveIntensity = emissiveMultiplier;
          sig.pedGreenLensMat.emissive.set("#000000");
          sig.pedGreenLensMat.emissiveIntensity = 0;
        }
      }
    },
    dispose() {
      for (const sig of signals) {
        sig.redLensMat.dispose();
        sig.yellowLensMat.dispose();
        sig.greenLensMat.dispose();
        sig.pedRedLensMat.dispose();
        sig.pedGreenLensMat.dispose();
      }
      group.clear();
      signals.length = 0;
    },
  };
}
