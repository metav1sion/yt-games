import * as THREE from "three";
import { box, cylinder, label, mat, type WorldContext } from "../world-kit";
import {
  buildFireHydrant,
  buildParkBench,
  buildBusStop,
  buildBillboard,
  buildStaticCar,
} from "../city-details";

/** Sahil ve Park Bölgesi (Güneybatı): Turkuaz deniz, altın kumsal, palmiyeler ve sahil iskelesi. */
export function buildCoastalDistrict(ctx: WorldContext) {
  const { group, baseObstacles, homes, assets, addTree, addPalmTree, addStreetLight, addModel } = ctx;
  void assets; void addTree; void addPalmTree; void addStreetLight; void addModel;

  // =========================================================================
  // 1. Kumsal Şeridi: Palmiyeler, Banklar, Çadırlar, Şezlonglar ve Kayalar
  // =========================================================================
  for (let x = -90; x <= -10; x += 10) {
    if (Math.abs(x + 50) < 8) continue; // Yol/iskele girişi açık kalsın
    addPalmTree(x, 85);
    // Sahil yürüyüş yolu bankları
    buildParkBench(group, x + 4, 83.4, 0);

    // Kumsal üstü ahşap şezlonglar (Plaj mobilyaları)
    const loungerX = x - 3;
    box(group, [1.8, 0.15, 0.75], [loungerX, 0.2, 85], "#ecf0f1"); // Beyaz minder
    box(group, [0.6, 0.35, 0.75], [loungerX - 0.55, 0.35, 85], "#bdc3c7"); // Yaslanma başlığı
  }

  ctx.addModel(group, "nature/tent_smallOpen", -78, 86.5, 5, 0.3);
  ctx.addModel(group, "nature/tent_smallOpen", -22, 86.5, 5, -0.4);
  ctx.addModel(group, "nature/rock_largeA", -92, 87, 4, 1.2);
  ctx.addModel(group, "nature/rock_largeA", -12, 87.5, 4, 0.2);

  // Plaj Şemsiyeleri
  ctx.addModel(group, "commercial/detail-parasol-a", -82, 85, 4.5, 0.2);
  ctx.addModel(group, "commercial/detail-parasol-b", -28, 85, 4.5, -0.3);

  // =========================================================================
  // 2. Ahşap Sahil İskelesi (Pier X=-50) ve Kanolar
  // =========================================================================
  box(group, [5, 0.12, 14], [-50, 0.14, 91], "#a77b52");
  for (const pz of [86, 90, 94, 98]) {
    for (const px of [-52.3, -47.7]) {
      cylinder(group, 0.2, 0.2, 1.1, [px, 0.1, pz], "#6b4a2f", 6);
    }
  }
  box(group, [0.2, 0.7, 14], [-52.4, 0.55, 91], "#e8dcc5");
  box(group, [0.2, 0.7, 14], [-47.6, 0.55, 91], "#e8dcc5");

  // Deniz yüzeyi sürülemez engelleri (orijinal sınırları koruyoruz)
  baseObstacles.push({ minX: -100, maxX: -52.5, minZ: 88.6, maxZ: 100 });
  baseObstacles.push({ minX: -47.5, maxX: -8, minZ: 88.6, maxZ: 100 });
  baseObstacles.push({ minX: -52.5, maxX: -47.5, minZ: 98.2, maxZ: 100 });

  // Denizdeki rengarenk kanolar
  ctx.addModel(group, "nature/canoe", -62, 92, 5, 0.5);
  ctx.addModel(group, "nature/canoe", -38, 94, 5, -0.4);
  ctx.addModel(group, "nature/canoe", -75, 96, 5, 1.5);

  // =========================================================================
  // 3. Sahil Mekanları ve Villalar (Evler 12 - 15)
  // =========================================================================
  const coastalSpots = [
    { x: -75, z: 25, color: "#ffffff", roof: "#319795", id: "13", name: "MARİNA" },
    { x: -25, z: 25, color: "#f7fafc", roof: "#2b6cb0", id: "14", name: "KAFE" },
    { x: -75, z: 75, color: "#ffffff", roof: "#38b2ac", id: "15", name: "VİLLA" },
    { x: -25, z: 75, color: "#f7fafc", roof: "#4299e1", id: "16", name: "KULÜP" },
  ];

  const COASTAL_MODELS = [
    "building-type-a",
    "commercial/building-e",
    "building-type-c",
    "commercial/building-e",
  ];

  coastalSpots.forEach((c, i) => {
    // Ahşap teras: bina ve teslimat noktası için zemin
    box(group, [12, 0.1, 13], [c.x, 0.04, c.z + 2.5], "#d9c3a0");

    const g = new THREE.Group();
    g.position.set(c.x, 0, c.z);
    group.add(g);
    const modelRect = ctx.placeModel(COASTAL_MODELS[i], c.x, c.z, 5.5);
    let signY = 3.2, signZ = 3.9;
    if (modelRect) {
      baseObstacles.push(modelRect);
      signY = 3.0;
      signZ = modelRect.maxZ - c.z - 0.1;
    } else {
      box(g, [8.5, 4.2, 7.5], [0, 2.1, 0], c.color);
      box(g, [9.0, 0.35, 8.0], [0, 4.35, 0], c.roof);
      box(g, [3.2, 2.4, 0.15], [0, 1.2, 3.8], "#4a5568");
      baseObstacles.push({ minX: c.x - 4.5, maxX: c.x + 4.5, minZ: c.z - 4.0, maxZ: c.z + 4.0 });
    }
    const sign = label(`${c.id} ${c.name}`, "#ffffff", c.roof);
    sign.scale.set(2.2, 0.55, 1);
    sign.position.set(0, signY, signZ);
    g.add(sign);

    addPalmTree(c.x - 5.5, c.z + 1.5);
    addPalmTree(c.x + 5.5, c.z + 1.5);
    ctx.addModel(group, "commercial/detail-parasol-a", c.x + 4.4, c.z + 3.8, 4, i);
    ctx.addModel(group, "nature/plant_bush", c.x - 3.5, c.z + 4.2, 5, i);
    ctx.addModel(group, "nature/flower_purpleA", c.x + 3.5, c.z + 4.6, 5, i);

    homes.push({ x: c.x, z: c.z + 6.5 });
  });

  // =========================================================================
  // 4. Sahil Sokak Mobilyaları & Otopark Araçları
  // =========================================================================
  // Sahil Kordonu Panosu
  buildBillboard(group, -18, 12, 0, "PALMİYE SAHİL KORDONU", "#0984e3", "#ffffff");

  // Sahil Otobüs Durağı
  buildBusStop(group, -12, 22, -Math.PI / 2, "SAHİL KORDONU · MİNİ KARGO");

  // Yangın Muslukları
  buildFireHydrant(group, -12, 30);
  buildFireHydrant(group, -12, 74);

  // Park ceplerine park etmiş tatil arabaları (Trafiği engellemeyen güvenli cepler)
  buildStaticCar(group, -7.6, 26, Math.PI / 2, "#00cec9"); // Turkuaz sedan
  buildStaticCar(group, -7.6, 68, Math.PI / 2, "#e84393"); // Pembe/kırmızı yaz arabası
}
