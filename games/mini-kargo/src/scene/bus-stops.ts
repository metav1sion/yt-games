import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import type { Vec2 } from "../game/types";

export type BusStopLocation = {
  id: string;
  name: string;
  district: string;
  position: { x: number; z: number };
  rotationY: number;
};

export const BUS_STOP_LOCATIONS: BusStopLocation[] = [
  // 1. Güneş Mahallesi (Konutlar & Depo Çıkışı Durağı)
  {
    id: "stop_sunny",
    name: "GÜNEŞ DURAĞI",
    district: "sunny",
    position: { x: -44, z: -14.2 },
    rotationY: 0,
  },
  // 2. Çarşı Bölgesi (Kapalıçarşı & Meydan Durağı)
  {
    id: "stop_market",
    name: "ÇARŞI MEYDAN DURAĞI",
    district: "market",
    position: { x: 14.2, z: 32 },
    rotationY: Math.PI / 2,
  },
  // 3. Sanayi Bölgesi (Organize Sanayi Fabrikalar Durağı)
  {
    id: "stop_industrial",
    name: "SANAYİ SİTESİ DURAĞI",
    district: "industrial",
    position: { x: 44, z: -14.2 },
    rotationY: Math.PI,
  },
  // 4. Sahil Şeridi (Marina & Kordon Gezinti Durağı)
  {
    id: "stop_coastal",
    name: "SAHİL KORDON DURAĞI",
    district: "coastal",
    position: { x: -14.2, z: 32 },
    rotationY: -Math.PI / 2,
  },
];

export type BusStopsView = {
  group: THREE.Group;
  update(dt: number, playerPos?: { x: number; z: number }): void;
  onHonk(playerPos: { x: number; z: number }): boolean;
  dispose(): void;
};

type Commuter = {
  group: THREE.Group;
  head: THREE.Object3D;
  rightArm: THREE.Object3D;
  basePos: { x: number; z: number };
  waveTimer: number;
  standing: boolean;
};

/**
 * Modern Transit Bus Shelter with Glass Canopy, "D" Transit Sign, Bench, and Commuter NPCs
 */
export function createBusStops(): BusStopsView {
  const group = new THREE.Group();
  group.name = "bus_stops";

  const commuters: Commuter[] = [];

  const STEEL = "#2d3748";
  const GLASS = "#cbebfb";
  const TIMBER = "#975a16";
  const SIGN_BLUE = "#1d4ed8";
  const YELLOW_BAY = "#ecc94b";

  for (const loc of BUS_STOP_LOCATIONS) {
    const stopGroup = new THREE.Group();
    stopGroup.position.set(loc.position.x, 0, loc.position.z);
    stopGroup.rotation.y = loc.rotationY;
    group.add(stopGroup);

    // 1. Durak Beton Kaidesi (Kaldırım Yükseltisi)
    box(stopGroup, [4.8, 0.16, 2.2], [0, 0.08, 0], "#a0aec0");

    // 2. Çelik Taşıyıcı Dikmeler (4 dikme)
    const postCoords: [number, number][] = [
      [-2.1, -0.85],
      [2.1, -0.85],
      [-2.1, 0.85],
      [2.1, 0.85],
    ];
    for (const [px, pz] of postCoords) {
      cylinder(stopGroup, 0.05, 0.05, 2.6, [px, 1.3, pz], STEEL, 8);
    }

    // 3. Arka ve Yan Rüzgarlık Cam Panelleri (Yarı şeffaf temperli cam)
    // Arka cam panel
    const backGlass = box(stopGroup, [4.0, 1.9, 0.06], [0, 1.25, -0.85], GLASS, 0.2);
    // Yan cam panel (sol rüzgarlık)
    const sideGlass = box(stopGroup, [0.06, 1.9, 1.6], [-2.1, 1.25, 0], GLASS, 0.2);

    // 4. Çatı Taşıyıcı Kemerler ve Kavisli Cam Sundurma
    box(stopGroup, [4.8, 0.1, 2.2], [0, 2.65, 0], STEEL);
    const roofCanopy = box(stopGroup, [4.6, 0.08, 2.1], [0, 2.7, 0], GLASS, 0.3);

    // 5. Otobüs Sefer Saatleri & Hat Haritası Panosu
    const scheduleFrame = box(stopGroup, [1.1, 0.85, 0.08], [0.8, 1.45, -0.82], STEEL);
    const schedulePoster = box(stopGroup, [1.0, 0.75, 0.09], [0.8, 1.45, -0.81], "#f7fafc");
    // Hat rozeti
    const lineBadge = label("HAT 101", "#ffffff", "#e53e3e");
    lineBadge.scale.set(0.7, 0.2, 1);
    lineBadge.position.set(0.8, 1.7, -0.75);
    stopGroup.add(lineBadge);

    // Durak İsmi Alınlık Tabelası
    const nameSign = label(loc.name, "#ffffff", "#1e3a8a");
    nameSign.scale.set(2.2, 0.38, 1);
    nameSign.position.set(0, 2.9, 0.95);
    stopGroup.add(nameSign);

    // 6. Ahşap Bekleme Bankı
    // Bank ayakları
    for (const bx of [-1.1, 0.1]) {
      box(stopGroup, [0.08, 0.45, 0.55], [bx, 0.38, -0.3], STEEL);
    }
    // Oturma çıtaları
    box(stopGroup, [1.5, 0.06, 0.55], [-0.5, 0.58, -0.3], TIMBER);
    // Sırtlık çıtaları
    box(stopGroup, [1.5, 0.35, 0.06], [-0.5, 0.85, -0.55], TIMBER);

    // 7. Paslanmaz Çelik Çöp & Geri Dönüşüm Kovası
    cylinder(stopGroup, 0.18, 0.16, 0.75, [2.15, 0.53, 0.6], "#cbd5e0", 12);
    box(stopGroup, [0.38, 0.08, 0.38], [2.15, 0.94, 0.6], STEEL);

    // 8. İkonik Mavi "D" (Otobüs Durağı) Levha Direği
    const poleX = 2.7;
    const poleZ = 0.9;
    cylinder(stopGroup, 0.04, 0.04, 2.8, [poleX, 1.4, poleZ], "#d1d5db", 8);
    // D Harfi Dairesi (Çift taraflı görünüm)
    const signDisc = cylinder(stopGroup, 0.34, 0.34, 0.08, [poleX, 2.5, poleZ], SIGN_BLUE, 16);
    signDisc.rotation.x = Math.PI / 2;
    // D harfi plakası
    const signLabel = label("D", "#ffffff", SIGN_BLUE);
    signLabel.scale.set(0.5, 0.5, 1);
    signLabel.position.set(poleX, 2.5, poleZ + 0.05);
    stopGroup.add(signLabel);

    // 9. Asfaltta Sarı Zikzak "OTOBÜS" Yanaşma Cebi
    for (let zx = -2.2; zx <= 2.2; zx += 1.1) {
      box(stopGroup, [0.8, 0.02, 0.14], [zx, 0.015, 1.45], YELLOW_BAY);
    }

    // 10. Bekleyen Yolcu / Komşu NPC'leri
    // Yolcu 1: Bankta oturan yolcu
    const seatedPassenger = buildCommuterCharacter(false, "#3b82f6", "#1f2937");
    seatedPassenger.group.position.set(-0.5, 0.16, -0.3);
    stopGroup.add(seatedPassenger.group);
    commuters.push({
      ...seatedPassenger,
      basePos: { x: loc.position.x, z: loc.position.z },
      waveTimer: 0,
      standing: false,
    });

    // Yolcu 2: Ayakta bekleyen yolcu (telefonuna bakan veya yola dönük)
    const standingPassenger = buildCommuterCharacter(true, "#ec4899", "#374151");
    standingPassenger.group.position.set(1.4, 0.16, 0.35);
    stopGroup.add(standingPassenger.group);
    commuters.push({
      ...standingPassenger,
      basePos: { x: loc.position.x, z: loc.position.z },
      waveTimer: 0,
      standing: true,
    });
  }

  function buildCommuterCharacter(
    standing: boolean,
    shirtColor: string,
    pantsColor: string,
  ): { group: THREE.Group; head: THREE.Object3D; rightArm: THREE.Object3D } {
    const charGroup = new THREE.Group();
    const SKIN = "#ffdbac";

    if (standing) {
      // Bacaklar (ayakta)
      cylinder(charGroup, 0.07, 0.07, 0.65, [-0.11, 0.33, 0], pantsColor, 6);
      cylinder(charGroup, 0.07, 0.07, 0.65, [0.11, 0.33, 0], pantsColor, 6);
      // Gövde (sweatshirt/ceket)
      box(charGroup, [0.38, 0.48, 0.22], [0, 0.88, 0], shirtColor);
    } else {
      // Bacaklar (oturan - bükük dizler)
      box(charGroup, [0.14, 0.36, 0.14], [-0.11, 0.2, 0.14], pantsColor);
      box(charGroup, [0.14, 0.36, 0.14], [0.11, 0.2, 0.14], pantsColor);
      box(charGroup, [0.14, 0.14, 0.32], [-0.11, 0.38, -0.05], pantsColor);
      box(charGroup, [0.14, 0.14, 0.32], [0.11, 0.38, -0.05], pantsColor);
      // Gövde
      box(charGroup, [0.36, 0.46, 0.2], [0, 0.68, -0.15], shirtColor);
    }

    // Baş & Saç
    const headPivot = new THREE.Group();
    const headY = standing ? 1.25 : 1.05;
    const headZ = standing ? 0 : -0.15;
    headPivot.position.set(0, headY, headZ);
    charGroup.add(headPivot);

    box(headPivot, [0.24, 0.24, 0.24], [0, 0, 0], SKIN);
    // Saç
    box(headPivot, [0.26, 0.1, 0.26], [0, 0.1, 0], "#4a2c11");

    // Sağ Kol (el sallama için pivot)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.24, standing ? 1.05 : 0.85, headZ);
    charGroup.add(rightArm);
    cylinder(rightArm, 0.05, 0.05, 0.42, [0, -0.21, 0], shirtColor, 6);
    box(rightArm, [0.08, 0.08, 0.08], [0, -0.44, 0], SKIN);

    // Sol Kol
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.24, standing ? 1.05 : 0.85, headZ);
    charGroup.add(leftArm);
    cylinder(leftArm, 0.05, 0.05, 0.42, [0, -0.21, 0], shirtColor, 6);

    return { group: charGroup, head: headPivot, rightArm };
  }

  return {
    group,
    update(dt: number, playerPos?: { x: number; z: number }) {
      for (const commuter of commuters) {
        // El sallama animasyonu
        if (commuter.waveTimer > 0) {
          commuter.waveTimer -= dt;
          const waveAngle = Math.sin((1.8 - commuter.waveTimer) * 14) * 0.45 + 2.2;
          commuter.rightArm.rotation.z = waveAngle;
        } else {
          commuter.rightArm.rotation.z = THREE.MathUtils.lerp(
            commuter.rightArm.rotation.z,
            0,
            1 - Math.exp(-6 * dt),
          );
        }

        // Oyuncuya doğru kafa çevirme (head tracking)
        if (playerPos) {
          const dx = playerPos.x - commuter.basePos.x;
          const dz = playerPos.z - commuter.basePos.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 18) {
            const targetYaw = Math.atan2(dx, dz);
            commuter.head.rotation.y = THREE.MathUtils.lerp(
              commuter.head.rotation.y,
              targetYaw * 0.4,
              1 - Math.exp(-4 * dt),
            );
          } else {
            commuter.head.rotation.y = THREE.MathUtils.lerp(
              commuter.head.rotation.y,
              0,
              1 - Math.exp(-3 * dt),
            );
          }
        }
      }
    },
    onHonk(playerPos: { x: number; z: number }): boolean {
      let anyWaved = false;
      for (const commuter of commuters) {
        const dist = Math.hypot(playerPos.x - commuter.basePos.x, playerPos.z - commuter.basePos.z);
        if (dist < 26) {
          commuter.waveTimer = 1.8;
          anyWaved = true;
        }
      }
      return anyWaved;
    },
    dispose() {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      group.clear();
      commuters.length = 0;
    },
  };
}
