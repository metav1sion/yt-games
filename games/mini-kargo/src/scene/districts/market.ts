import * as THREE from "three";
import { box, cylinder, label, mat, type WorldContext } from "../world-kit";
import {
  buildFireHydrant,
  buildParkBench,
  buildBusStop,
  buildBillboard,
  buildStaticCar,
} from "../city-details";

/** Çarşı Bölgesi (Güneydoğu): Renkli tenteli dükkanlar, kafeler, meydan heykeli ve açık hava masaları/şemsiyeleri. */
export function buildMarketDistrict(ctx: WorldContext) {
  const { group, baseObstacles, homes, assets, addTree, addPalmTree, addStreetLight, addModel } = ctx;
  void assets; void addTree; void addPalmTree; void addStreetLight; void addModel;

  // =========================================================================
  // 1. Çarşı Meydanı (Piazza Square X=50, Z=50)
  // =========================================================================
  const squareX = 50, squareZ = 50;
  // Meydan zemin yükseltisi
  box(group, [12, 0.2, 12], [squareX, 0.12, squareZ], "#eadbb8");
  // Fıskiye ve anıt heykeli kaidesi
  cylinder(group, 2.5, 2.8, 0.7, [squareX, 0.5, squareZ], "#d9c8a7");
  cylinder(group, 2.1, 2.1, 0.2, [squareX, 0.85, squareZ], "#5dade2"); // Fıskiye suyu
  cylinder(group, 0.4, 0.6, 1.4, [squareX, 1.4, squareZ], "#ecd9b8");
  ctx.addModel(group, "nature/statue_column", squareX, squareZ, 3.5);
  baseObstacles.push({ minX: squareX - 2.8, maxX: squareX + 2.8, minZ: squareZ - 2.8, maxZ: squareZ + 2.8 });

  // Meydan köşelerine park bankları ve çiçeklikler
  buildParkBench(group, squareX - 4.2, squareZ - 4.2, Math.PI / 4);
  buildParkBench(group, squareX + 4.2, squareZ - 4.2, -Math.PI / 4);
  buildParkBench(group, squareX - 4.2, squareZ + 4.2, (3 * Math.PI) / 4);
  buildParkBench(group, squareX + 4.2, squareZ + 4.2, -(3 * Math.PI) / 4);

  ctx.addModel(group, "nature/flower_purpleA", squareX - 3.8, squareZ, 4.5);
  ctx.addModel(group, "nature/flower_yellowA", squareX + 3.8, squareZ, 4.5);
  ctx.addModel(group, "nature/flower_redA", squareX, squareZ - 3.8, 4.5);
  ctx.addModel(group, "nature/plant_bushLarge", squareX, squareZ + 3.8, 4.5);

  // =========================================================================
  // 2. Dükkanlar ve Kafeler (Evler 04 - 07)
  // =========================================================================
  const marketShops = [
    { x: 25, z: 25, color: "#fff4e0", awning: "#d85b48", id: "05", name: "PASTANE" },
    { x: 75, z: 25, color: "#f8eed6", awning: "#3c8375", id: "06", name: "MANAV" },
    { x: 25, z: 75, color: "#fbf2de", awning: "#4a689b", id: "07", name: "KİTAPÇI" },
    { x: 75, z: 75, color: "#fff0d6", awning: "#d59838", id: "08", name: "BUTİK" },
  ];

  const SHOP_MODELS = [
    "commercial/building-a",
    "commercial/building-c",
    "commercial/building-f",
    "commercial/building-g",
  ];

  marketShops.forEach((s, i) => {
    // Kaldırım/meydan zemini: dükkanı ve teslimat noktasını bağlar.
    box(group, [11, 0.12, 12.5], [s.x, 0.05, s.z + 2.2], "#ded6be");
    box(group, [4.2, 0.13, 7.4], [s.x, 0.07, s.z + 6.4], "#cdbf9f");

    const g = new THREE.Group();
    g.position.set(s.x, 0, s.z);
    group.add(g);
    const modelRect = ctx.placeModel(SHOP_MODELS[i], s.x, s.z, 6.5);
    let signY = 3.8, signZ = 3.65;
    if (modelRect) {
      baseObstacles.push(modelRect);
      signY = 3.2;
      signZ = modelRect.maxZ - s.z - 0.2;
    } else {
      box(g, [8.5, 4.8, 7.0], [0, 2.4, 0], s.color);
      box(g, [8.9, 0.35, 7.4], [0, 4.9, 0], "#a45b4b");
      const awning = box(g, [7.2, 0.35, 2.0], [0, 2.9, 4.2], s.awning);
      awning.rotation.x = 0.22;
      box(g, [6.5, 2.0, 0.12], [0, 1.2, 3.55], "#457471");
      baseObstacles.push({ minX: s.x - 4.5, maxX: s.x + 4.5, minZ: s.z - 3.8, maxZ: s.z + 3.8 });
    }
    const sign = label(`${s.id} ${s.name}`);
    sign.scale.set(2.2, 0.55, 1);
    sign.position.set(0, signY, signZ);
    g.add(sign);

    // Renkli şemsiyeler, tenteler, açık hava kafe masaları ve saksılar
    ctx.addModel(group, "commercial/detail-awning-wide", s.x, s.z + signZ - 0.2, 4.5);
    ctx.addModel(group, "commercial/detail-parasol-a", s.x - 5.2, s.z + 2.8, 4, 0.4 * i);
    ctx.addModel(group, "commercial/detail-parasol-b", s.x + 5.2, s.z + 2.8, 4, -0.3 * i);

    // Kafe açık hava ahşap masaları ve tabureleri
    for (const sx of [s.x - 5.2, s.x + 5.2]) {
      cylinder(group, 0.38, 0.38, 0.05, [sx, 0.45, s.z + 2.8], "#d35400", 8); // Masa tablası
      cylinder(group, 0.04, 0.04, 0.42, [sx, 0.22, s.z + 2.8], "#2c3e50", 6); // Ayak
    }

    ctx.addModel(group, "nature/plant_bushLarge", s.x - 5.8, s.z - 2.4, 5, i);
    ctx.addModel(group, "nature/plant_bush", s.x + 5.8, s.z - 2.4, 5, -i);
    ctx.addModel(group, "nature/flower_redA", s.x - 6.8, s.z + 4.6, 5, i);
    ctx.addModel(group, "nature/flower_yellowA", s.x + 6.8, s.z + 4.6, 5, i * 2);

    addStreetLight(s.x - 4.5, s.z + 4.2);
    addStreetLight(s.x + 4.5, s.z + 4.2);

    homes.push({ x: s.x, z: s.z + 6.5 });
  });

  // =========================================================================
  // 3. Çarşı Kestirme Sokağı (Market Alley Shortcut)
  // =========================================================================
  box(group, [4.4, 0.12, 20], [35.4, 0.08, 29], "#ded6be");
  box(group, [3.8, 0.13, 20], [35.4, 0.085, 29], "#8b7e66");
  addStreetLight(35.4, 18.5);
  addStreetLight(35.4, 39.5);

  const alleyLeft = ["commercial/building-h", "commercial/building-a", "commercial/building-g"];
  const alleyRight = ["commercial/building-c", "commercial/building-f", "commercial/building-h"];
  const leftOk = alleyLeft.map((id, k) => ctx.placeModel(id, 30.0, 23.2 + k * 5.8, 6.2, Math.PI / 2)).every(Boolean);
  const rightOk = alleyRight.map((id, k) => ctx.placeModel(id, 40.8, 23.2 + k * 5.8, 6.2, -Math.PI / 2)).every(Boolean);
  if (!leftOk) {
    box(group, [4.8, 4.2, 17], [30.6, 2.1, 29], "#ecd9b8");
    box(group, [5.0, 0.35, 17.2], [30.6, 4.3, 29], "#c0392b");
  }
  baseObstacles.push({ minX: 27.0, maxX: 33.0, minZ: 20.5, maxZ: 37.5 });

  if (!rightOk) {
    box(group, [4.8, 4.2, 17], [40.2, 2.1, 29], "#f7e8ce");
    box(group, [5.0, 0.35, 17.2], [40.2, 4.3, 29], "#2980b9");
  }
  baseObstacles.push({ minX: 37.8, maxX: 43.8, minZ: 20.5, maxZ: 37.5 });

  // =========================================================================
  // 4. Çarşı Sokak Mobilyaları & Otopark Araçları
  // =========================================================================
  // Çarşı Otobüs Durağı (Giriş Bulvarı X=14, Z=7.6 civarında)
  buildBusStop(group, 14, 8.8, 0, "ÇARŞI MEYDANI · MİNİ KARGO");

  // Çarşı Reklam Panosu
  buildBillboard(group, 48, 8.8, 0, "TARİHİ ÇARŞI & ALIŞVERİŞ FESTİVALİ", "#d35400", "#fffdf2");

  // Yangın Muslukları ve Park Bankları
  buildFireHydrant(group, 22, 13);
  buildFireHydrant(group, 78, 13);
  buildParkBench(group, 26, 13, 0);
  buildParkBench(group, 74, 13, 0);

  // Park ceplerine park etmiş şık arabalar (Trafiği engellemeyen güvenli cepler)
  buildStaticCar(group, 24, 7.6, 0, "#f5f6fa"); // Beyaz sedan
  buildStaticCar(group, 70, 7.6, 0, "#f1c40f"); // Sarı taksi / sedan
}
