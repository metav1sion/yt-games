import * as THREE from "three";
import { box, cylinder, mat } from "./world-kit";

/**
 * Modernize edilmiş, canlı, sevimli (cozy low-poly arcade) şehir zemin tabanı.
 * Çift şeritli kaliteli asfalt bulvarlar, iki renkli bordür taşları,
 * kavşaklarda gerçekçi yaya geçitleri (zebra), dur çizgileri, dönel ada,
 * otopark cepleri, kumsal ve turkuaz sahil.
 */
export function buildBaseTerrain(group: THREE.Group) {
  // =========================================================================
  // 1. Zemin Tabanı (Terrain Base) & Karakteristik Bölge Katmanları
  // =========================================================================
  // 1.0 Ana Zemin (Canlı taze yeşil)
  box(group, [204, 1.0, 204], [0, -0.6, 0], "#7bb661"); // Taze çim yeşili
  box(group, [204, 0.4, 204], [0, -1.3, 0], "#558242"); // Toprak alt katmanı

  // 1.1 Çarşı Bölgesi: Şık taş parke / piazza zemin plakası (X: 0..100, Z: 0..100)
  box(group, [98, 0.05, 98], [50, 0.01, 50], "#e6dcbe");
  // Çarşı meydanı dekoratif iç bordürü
  box(group, [46, 0.06, 46], [50, 0.015, 50], "#d5c9a7");

  // 1.2 Sanayi Bölgesi: Koyu endüstriyel beton avlu (X: 0..100, Z: -100..0)
  box(group, [98, 0.05, 98], [50, 0.01, -50], "#697782");
  // Sanayi içi ağır araç beton yolu
  box(group, [44, 0.06, 44], [50, 0.015, -50], "#586570");

  // 1.3 Sahil Bölgesi: Kordon zemini & Kumsal (X: -100..0, Z: 0..100)
  box(group, [98, 0.05, 78], [-50, 0.01, 40], "#ebdcb2");

  // Güneybatı Sahil Deniz & Kumsal Alanı (X: -100..-4, Z: 80..100)
  // Derin turkuaz deniz
  box(group, [96, 0.22, 18], [-52, 0.03, 91], "#29a3b8", 0.15);
  box(group, [96, 0.24, 8], [-52, 0.04, 96], "#1e7b8f", 0.15); // Derinlik
  // Canlı altın kumsal
  box(group, [96, 0.18, 6], [-52, 0.035, 83], "#f3dfa2");
  // Kıyı dalga köpükleri (çift katmanlı su geçişi)
  box(group, [96, 0.2, 0.9], [-52, 0.048, 86], "#e8f8f9", 0.2);
  box(group, [96, 0.21, 0.4], [-52, 0.052, 86.5], "#ffffff", 0.1);

  // Ahşap Sahil İskelesi (X: -45, Z: 82..98)
  box(group, [4.4, 0.25, 15], [-45, 0.15, 90.5], "#9e6e44");
  // İskele korkulukları
  box(group, [0.15, 0.6, 15], [-47.1, 0.5, 90.5], "#cfa77d");
  box(group, [0.15, 0.6, 15], [-42.9, 0.5, 90.5], "#cfa77d");
  // İskele kazıkları
  for (const z of [84, 88, 92, 96]) {
    cylinder(group, 0.22, 0.22, 1.3, [-47.1, 0.2, z], "#5c3d25", 8);
    cylinder(group, 0.22, 0.22, 1.3, [-42.9, 0.2, z], "#5c3d25", 8);
  }

  // =========================================================================
  // 2. Yardımcı Fonksiyonlar: Bordür Taşları ve Otopark Çizgileri
  // =========================================================================
  const ASPHALT_COLOR = "#2f3640"; // Koyu, modern, temiz antrasit asfalt
  const SIDEWALK_COLOR = "#ded7c3"; // Şık açık bej kaldırım
  const CURB_RED = "#d63031"; // Kırmızı bordür dişi
  const CURB_WHITE = "#f5f6fa"; // Beyaz bordür dişi
  const LANE_LINE_YELLOW = "#fbc531"; // Çift şerit orta sarı çizgisi
  const STOP_LINE_WHITE = "#ffffff";

  /**
   * İki renkli (kırmızı-beyaz) kaldırım bordür taşları ekler.
   */
  function addCurbsX(startX: number, endX: number, z: number) {
    const step = 2.4;
    const count = Math.floor((endX - startX) / step);
    for (let i = 0; i < count; i++) {
      const cx = startX + i * step + step / 2;
      const color = i % 2 === 0 ? CURB_RED : CURB_WHITE;
      box(group, [step - 0.05, 0.14, 0.35], [cx, 0.07, z], color);
    }
  }

  function addCurbsZ(x: number, startZ: number, endZ: number) {
    const step = 2.4;
    const count = Math.floor((endZ - startZ) / step);
    for (let i = 0; i < count; i++) {
      const cz = startZ + i * step + step / 2;
      const color = i % 2 === 0 ? CURB_RED : CURB_WHITE;
      box(group, [0.35, 0.14, step - 0.05], [x, 0.07, cz], color);
    }
  }

  /**
   * Yol kenarına şık park cebi ve beyaz park çizgileri ekler.
   */
  function addParkingBayX(x: number, z: number, bays = 3, bayWidth = 2.8) {
    const totalW = bays * bayWidth;
    box(group, [totalW, 0.13, 2.6], [x, 0.08, z], ASPHALT_COLOR);
    for (let i = 0; i <= bays; i++) {
      const lx = x - totalW / 2 + i * bayWidth;
      box(group, [0.14, 0.015, 2.4], [lx, 0.16, z], "#ffffff");
    }
    const offsetZ = z > 0 ? z + 1.2 : z - 1.2;
    box(group, [totalW, 0.015, 0.12], [x, 0.16, offsetZ], "#ffffff");
  }

  function addParkingBayZ(x: number, z: number, bays = 3, bayWidth = 2.8) {
    const totalL = bays * bayWidth;
    box(group, [2.6, 0.13, totalL], [x, 0.08, z], ASPHALT_COLOR);
    for (let i = 0; i <= bays; i++) {
      const lz = z - totalL / 2 + i * bayWidth;
      box(group, [2.4, 0.015, 0.14], [x, 0.16, lz], "#ffffff");
    }
    const offsetX = x > 0 ? x + 1.2 : x - 1.2;
    box(group, [0.12, 0.015, totalL], [offsetX, 0.16, z], "#ffffff");
  }

  // =========================================================================
  // 3. Ana Yol Ağı (Connected Grid: Bulvarlar ve Caddeler)
  // =========================================================================
  // Yatay Ana Bulvarlar (Z = 0, Z = -50, Z = 50)
  for (const z of [-50, 0, 50]) {
    const isMain = z === 0;
    const width = isMain ? 9.8 : 8.2;
    const curb = width + 2.0;
    const len = z === -50 ? 104 : 196;
    const posX = z === -50 ? 46 : 0;

    box(group, [len, 0.12, curb], [posX, 0.04, z], SIDEWALK_COLOR);
    box(group, [len, 0.14, width], [posX, 0.09, z], ASPHALT_COLOR);

    const curbHalf = width / 2 + 0.18;
    const startX = z === -50 ? -6 : -96;
    const endX = z === -50 ? 96 : 96;
    addCurbsX(startX, endX, z - curbHalf);
    addCurbsX(startX, endX, z + curbHalf);

    const lineStartX = z === -50 ? 6 : -92;
    for (let x = lineStartX; x <= 92; x += 4.5) {
      box(group, [2.2, 0.015, 0.16], [x, 0.17, z - 0.14], LANE_LINE_YELLOW);
      box(group, [2.2, 0.015, 0.16], [x, 0.17, z + 0.14], LANE_LINE_YELLOW);
    }

    box(group, [len, 0.012, 0.14], [posX, 0.165, z - width / 2 + 0.35], "#ffffff");
    box(group, [len, 0.012, 0.14], [posX, 0.165, z + width / 2 - 0.35], "#ffffff");
  }

  // Dikey Ana Bulvarlar (X = 0, X = -50, X = 50)
  for (const x of [-50, 0, 50]) {
    const isMain = x === 0;
    const width = isMain ? 9.8 : 8.2;
    const curb = width + 2.0;
    const len = x === -50 ? 90 : 196;
    const posZ = x === -50 ? 39 : 0;

    box(group, [curb, 0.12, len], [x, 0.045, posZ], SIDEWALK_COLOR);
    box(group, [width, 0.14, len], [x, 0.095, posZ], ASPHALT_COLOR);

    const curbHalf = width / 2 + 0.18;
    const startZ = x === -50 ? -6 : -96;
    const endZ = x === -50 ? 84 : 96;
    addCurbsZ(x - curbHalf, startZ, endZ);
    addCurbsZ(x + curbHalf, startZ, endZ);

    const lineStartZ = x === -50 ? 6 : -92;
    const lineEndZ = x === -50 ? 80 : 92;
    for (let z = lineStartZ; z <= lineEndZ; z += 4.5) {
      box(group, [0.16, 0.015, 2.2], [x - 0.14, 0.175, z], LANE_LINE_YELLOW);
      box(group, [0.16, 0.015, 2.2], [x + 0.14, 0.175, z], LANE_LINE_YELLOW);
    }

    box(group, [0.14, 0.012, len], [x - width / 2 + 0.35, 0.17, posZ], "#ffffff");
    box(group, [0.14, 0.012, len], [x + width / 2 - 0.35, 0.17, posZ], "#ffffff");
  }

  // =========================================================================
  // 4. Bölge İçi Bağlantı Sokakları
  // =========================================================================
  // Çarşı Sokakları (Z = 34, Z = 84)
  for (const z of [34, 84]) {
    box(group, [88, 0.11, 7.8], [44, 0.035, z], "#ded6be");
    box(group, [88, 0.13, 6.2], [44, 0.08, z], "#384347");
    addCurbsX(6, 88, z - 3.25);
    addCurbsX(6, 88, z + 3.25);
    for (let x = 10; x <= 82; x += 6) {
      box(group, [2.0, 0.015, 0.16], [x, 0.155, z], "#fff4d4");
    }
  }

  // Sanayi Sokakları (Z = -66, Z = -16)
  for (const z of [-66, -16]) {
    box(group, [88, 0.11, 7.8], [44, 0.035, z], "#8c979e");
    box(group, [88, 0.13, 6.2], [44, 0.08, z], "#2b3035");
    addCurbsX(6, 88, z - 3.25);
    addCurbsX(6, 88, z + 3.25);
    for (let x = 10; x <= 82; x += 6) {
      box(group, [2.0, 0.015, 0.16], [x, 0.155, z], "#f4d03f"); // Sanayide sarı çizgi
    }
  }

  // Sahil Kordon Yolları (Z = 34, Z = 80)
  for (const z of [34, 80]) {
    box(group, [88, 0.11, 7.8], [-44, 0.035, z], "#e2d3b4");
    box(group, [88, 0.13, 6.2], [-44, 0.08, z], "#384347");
    addCurbsX(-88, -6, z - 3.25);
    addCurbsX(-88, -6, z + 3.25);
    for (let x = -82; x <= -10; x += 6) {
      box(group, [2.0, 0.015, 0.16], [x, 0.155, z], "#fff4d4");
    }
  }

  // =========================================================================
  // 5. Otopark Cepleri ve Park Çizgileri (Park Bays)
  // =========================================================================
  // Çarşı Bulvarı Park Alanları
  addParkingBayX(24, 7.6, 4, 2.7);
  addParkingBayX(70, 7.6, 4, 2.7);
  // Güneş Mahallesi Park Alanları
  addParkingBayX(-25, -7.6, 3, 2.7);
  addParkingBayX(-72, -7.6, 3, 2.7);
  // Sanayi Bölgesi Kamyon/Araç Park Alanları
  addParkingBayZ(7.6, -26, 3, 3.2);
  addParkingBayZ(7.6, -74, 3, 3.2);
  // Sahil Kordon Park Alanları
  addParkingBayZ(-7.6, 26, 4, 2.7);
  addParkingBayZ(-7.6, 68, 4, 2.7);

  // =========================================================================
  // 6. Merkez Dönel Ada / Kavşak Meydanı (Roundabout X=0, Z=0)
  // =========================================================================
  cylinder(group, 2.5, 2.65, 0.22, [0, 0.15, 0], CURB_RED, 24);
  cylinder(group, 2.35, 2.5, 0.24, [0, 0.16, 0], CURB_WHITE, 24);
  cylinder(group, 2.2, 2.2, 0.26, [0, 0.17, 0], SIDEWALK_COLOR, 24);
  cylinder(group, 1.95, 2.05, 0.35, [0, 0.24, 0], "#6ba353", 18);
  cylinder(group, 0.85, 0.95, 0.55, [0, 0.65, 0], "#d5c9a7", 12);
  cylinder(group, 0.75, 0.75, 0.15, [0, 0.88, 0], "#3498db", 12);
  cylinder(group, 0.28, 0.34, 1.6, [0, 1.65, 0], "#ede1c5", 8);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 10),
    mat("#f1c40f", 0.4),
  );
  globe.position.set(0, 2.6, 0);
  globe.castShadow = true;
  group.add(globe);

  // =========================================================================
  // 7. Kavşak Yaya Geçitleri (Zebra Crossings) ve Dur Çizgileri (Stop Lines)
  // =========================================================================
  for (const z of [-6.6, 6.6]) {
    for (let x = -3.8; x <= 3.8; x += 1.1) {
      box(group, [0.72, 0.02, 2.2], [x, 0.19, z], "#fffdf2");
    }
    const stopZ = z > 0 ? z + 2.0 : z - 2.0;
    box(group, [8.2, 0.02, 0.38], [0, 0.19, stopZ], STOP_LINE_WHITE);
  }

  for (const x of [-6.6, 6.6]) {
    for (let z = -3.8; z <= 3.8; z += 1.1) {
      box(group, [2.2, 0.02, 0.72], [x, 0.19, z], "#fffdf2");
    }
    const stopX = x > 0 ? x + 2.0 : x - 2.0;
    box(group, [0.38, 0.02, 8.2], [stopX, 0.19, 0], STOP_LINE_WHITE);
  }

  const subJunctions = [
    { x: 50, z: 0 },
    { x: 0, z: 50 },
    { x: 0, z: -50 },
    { x: 50, z: 50 },
    { x: 50, z: -50 },
    { x: -50, z: 50 },
  ];

  for (const j of subJunctions) {
    for (const dz of [-5.5, 5.5]) {
      for (let ox = -3.2; ox <= 3.2; ox += 1.1) {
        box(group, [0.65, 0.02, 1.8], [j.x + ox, 0.19, j.z + dz], "#fffdf2");
      }
      const sz = dz > 0 ? j.z + dz + 1.6 : j.z + dz - 1.6;
      box(group, [7.2, 0.02, 0.32], [j.x, 0.19, sz], STOP_LINE_WHITE);
    }
    for (const dx of [-5.5, 5.5]) {
      for (let oz = -3.2; oz <= 3.2; oz += 1.1) {
        box(group, [1.8, 0.02, 0.65], [j.x + dx, 0.19, j.z + oz], "#fffdf2");
      }
      const sx = dx > 0 ? j.x + dx + 1.6 : j.x + dx - 1.6;
      box(group, [0.32, 0.02, 7.2], [sx, 0.19, j.z], STOP_LINE_WHITE);
    }
  }
}
