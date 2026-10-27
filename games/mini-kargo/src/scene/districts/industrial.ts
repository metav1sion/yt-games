import * as THREE from "three";
import { box, cylinder, label, mat, type WorldContext } from "../world-kit";
import {
  buildFireHydrant,
  buildBillboard,
  buildStaticCar,
  buildIndustrialPipes,
} from "../city-details";

/** Sanayi Bölgesi (Kuzeydoğu): Fabrikalar, boru hatları, yüksek bacalar, su kuleleri ve konteyner labirenti. */
export function buildIndustrialDistrict(ctx: WorldContext) {
  const { group, baseObstacles, homes, assets, addTree, addPalmTree, addStreetLight, addModel } = ctx;
  void assets; void addTree; void addPalmTree; void addStreetLight; void addModel;

  // =========================================================================
  // 1. Sanayi Kestirme Yolu (Industrial Corridor Shortcut)
  // =========================================================================
  box(group, [4.6, 0.12, 16], [50, 0.08, -29], "#4f5b66"); // Asfalt zemin
  box(group, [0.2, 0.02, 12], [50, 0.14, -29], "#f1c40f"); // Sarı yol çizgisi

  // Sol kargo hangarı
  box(group, [5.6, 4.8, 14], [44.8, 2.4, -29], "#34495e");
  box(group, [5.8, 0.4, 14.2], [44.8, 4.9, -29], "#2980b9");
  baseObstacles.push({ minX: 42.0, maxX: 47.6, minZ: -36.0, maxZ: -22.0 });

  // Sağ kargo hangarı
  box(group, [5.6, 4.8, 14], [55.2, 2.4, -29], "#2c3e50");
  box(group, [5.8, 0.4, 14.2], [55.2, 4.9, -29], "#d35400");
  baseObstacles.push({ minX: 52.4, maxX: 58.0, minZ: -36.0, maxZ: -22.0 });

  // =========================================================================
  // 2. Konteyner Labirenti (Shipping Container Stacks)
  // =========================================================================
  function addContainers(cx: number, cz: number) {
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    group.add(g);
    const colors = ["#2b6cb0", "#c53030", "#dd6b20", "#319795"];
    const placed = [
      ctx.addModel(group, "industrial/shipping-container-a", cx, cz - 1.5, 2.1, Math.PI / 2),
      ctx.addModel(group, "industrial/shipping-container-b", cx, cz + 1.5, 2.1, Math.PI / 2),
      ctx.addModel(group, "industrial/shipping-container-c", cx, cz, 2.1, Math.PI / 2),
    ];
    if (placed[2]) group.children[group.children.length - 1].position.y = 2.7; // üstteki konteyner
    if (!placed.every(Boolean)) {
      box(g, [6.5, 2.4, 2.5], [0, 1.2, -1.5], colors[0]);
      box(g, [6.5, 2.4, 2.5], [0, 1.2, 1.5], colors[1]);
      box(g, [6.5, 2.4, 2.5], [0, 3.6, 0], colors[2]);
    }
    baseObstacles.push({
      minX: cx - 3.5,
      maxX: cx + 3.5,
      minZ: cz - 3.0,
      maxZ: cz + 3.0,
      height: 2.8,
    });
  }

  // Kavşak dışı konteyner labirenti istifleri
  addContainers(64, -58);
  addContainers(84, -40);

  // =========================================================================
  // 3. Yüksek Endüstriyel Boru Hatları (Pipelines)
  // =========================================================================
  // Hangar arkasında ve tesisler arasında uzanan boru hatları (Yükseklik 3.6m)
  buildIndustrialPipes(group, 22, -40, 24, true, 3.6);
  buildIndustrialPipes(group, 62, -40, 24, true, 3.6);

  // =========================================================================
  // 4. Fabrikalar ve Tesisler (Evler 08 - 11)
  // =========================================================================
  const industrialPlants = [
    { x: 25, z: -75, color: "#718096", trim: "#2b6cb0", id: "09", name: "ANTREPO" },
    { x: 75, z: -75, color: "#4a5568", trim: "#c53030", id: "10", name: "DÖKÜM" },
    { x: 25, z: -25, color: "#718096", trim: "#dd6b20", id: "11", name: "LOJİSTİK" },
    { x: 75, z: -25, color: "#4a5568", trim: "#319795", id: "12", name: "FABRİKA" },
  ];

  const PLANT_MODELS = [
    "industrial/building-a",
    "industrial/building-b",
    "industrial/building-b",
    "industrial/building-a",
  ];

  industrialPlants.forEach((p, i) => {
    // Beton avlu: tesisi ve teslimat noktasını bağlar.
    box(group, [14, 0.1, 17], [p.x, 0.04, p.z + 1.5], "#a9b0b5");
    box(group, [4.4, 0.11, 6], [p.x, 0.06, p.z + 7], "#8e979d");

    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    group.add(g);
    const modelRect = ctx.placeModel(PLANT_MODELS[i], p.x, p.z, 5.2);
    let signY = 4.2, signZ = 4.4;
    if (modelRect) {
      baseObstacles.push(modelRect);
      signY = 3.3;
      signZ = modelRect.maxZ - p.z - 0.1;
      ctx.addModel(group, "industrial/chimney-large", p.x + 4.4, p.z - 3.2, 3.2);
    } else {
      box(g, [11.0, 5.5, 8.5], [0, 2.75, 0], p.color);
      box(g, [11.4, 0.4, 8.9], [0, 5.65, 0], p.trim);
      box(g, [4.2, 3.6, 0.2], [0, 1.8, 4.3], "#2d3748");
      cylinder(g, 0.6, 0.8, 4.5, [4.2, 5.8, -2.5], "#a0aec0", 8);
      baseObstacles.push({ minX: p.x - 5.8, maxX: p.x + 5.8, minZ: p.z - 4.5, maxZ: p.z + 4.5 });
    }
    const sign = label(`${p.id} ${p.name}`, "#f7fafc", p.trim);
    sign.scale.set(2.4, 0.6, 1);
    sign.position.set(0, signY, signZ);
    g.add(sign);

    // Çevre detayları: tanklar, konteynerler ve emniyet çitleri
    ctx.addModel(group, "industrial/detail-tank-large", p.x - 8, p.z + 2, 2.6, i);
    baseObstacles.push({ minX: p.x - 9.9, maxX: p.x - 6.1, minZ: p.z + 0.1, maxZ: p.z + 3.9 });
    ctx.addModel(group, "industrial/shipping-container-" + "abc"[i % 3], p.x + 9, p.z + 3, 1.8, Math.PI / 2);
    baseObstacles.push({ minX: p.x + 6.2, maxX: p.x + 11.8, minZ: p.z + 1.6, maxZ: p.z + 4.4, height: 2.4 });

    // Tesis arka güvenlik çitleri
    ctx.addModel(group, "nature/fence_simple", p.x - 5, p.z - 5.5, 4);
    ctx.addModel(group, "nature/fence_simple", p.x + 5, p.z - 5.5, 4);

    homes.push({ x: p.x, z: p.z + 7.0 });
  });

  // Su kulesi: sanayi bölgesinin silüeti
  ctx.addModel(group, "industrial/water-tower", 38, -62, 6);
  baseObstacles.push({ minX: 36.5, maxX: 39.5, minZ: -63.5, maxZ: -60.5 });

  // =========================================================================
  // 5. Sanayi Sokak Mobilyaları & Otopark Araçları
  // =========================================================================
  // Sanayi Bölgesi Giriş Panosu
  buildBillboard(group, 18, -12, 0, "ORGANİZE SANAYİ BÖLGESİ", "#f1c40f", "#2c3e50");

  // Yangın Muslukları
  buildFireHydrant(group, 14, -24);
  buildFireHydrant(group, 72, -14);

  // Park ceplerine park etmiş sanayi/lojistik araçları (Trafiği engellemeyen güvenli cepler)
  buildStaticCar(group, 7.6, -26, Math.PI / 2, "#34495e"); // Koyu gri iş arabası
  buildStaticCar(group, 7.6, -74, Math.PI / 2, "#2980b9"); // Mavi lojistik aracı
}
