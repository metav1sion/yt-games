import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { districts, type DistrictId } from "../game/districts";

const materials = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, roughness = 0.85): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness }),
    );
  }
  return materials.get(key)!;
}

export function box(
  parent: THREE.Object3D,
  size: number[],
  pos: number[],
  color: string,
  roughness = 0.85,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    mat(color, roughness),
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cylinder(
  parent: THREE.Object3D,
  top: number,
  bottom: number,
  height: number,
  pos: number[],
  color: string,
  sides = 12,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, sides),
    mat(color),
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function label(text: string, color = "#23443d", bg = "#fff9e7") {
  if (typeof document === "undefined") {
    return new THREE.Sprite();
  }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const c = canvas.getContext("2d")!;
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(0, 0, 512, 128, 24);
  c.fill();
  c.fillStyle = color;
  c.font = "bold 52px system-ui";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, 256, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: true }),
  );
  sprite.scale.set(5, 1.25, 1);
  return sprite;
}

export type DistrictBarrier = {
  districtId: DistrictId;
  group: THREE.Group;
  obstacles: Rect[];
};

export type World = {
  group: THREE.Group;
  obstacles: Rect[];
  bounds: Rect;
  depot: Vec2;
  homes: Vec2[];
  barriers: DistrictBarrier[];
  updateUnlockedDistricts(companyLevel: number): DistrictId[];
};

export function createWorld(): World {
  const group = new THREE.Group();
  const baseObstacles: Rect[] = [];
  const obstacles: Rect[] = [];
  // 200x200 birimlik büyük şehir sınırları
  const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
  const homes: Vec2[] = [];

  // 1. Zemin Tabanı (Terrain Base)
  box(group, [204, 1.0, 204], [0, -0.6, 0], "#98bd8c"); // Genel yeşil çim taban
  box(group, [204, 0.4, 204], [0, -1.3, 0], "#74966a"); // Alt toprak katman

  // Güneybatı Sahil Deniz Alanı (X: -100..-10, Z: 40..100)
  box(group, [94, 0.22, 60], [-53, 0.03, 70], "#4b9fb3", 0.3); // Masmavi su
  box(group, [94, 0.23, 6], [-53, 0.04, 38], "#eadab0"); // Kumsal şeridi

  // 2. Ana Yol Ağı (Connected Grid: Bulvarlar ve Caddeler)
  // Yatay Ana Bulvarlar (Z = 0, Z = -50, Z = 50)
  for (const z of [-50, 0, 50]) {
    const isMain = z === 0;
    const width = isMain ? 9.6 : 8.0;
    const curb = width + 1.2;
    box(group, [196, 0.12, curb], [0, 0.04, z], "#ded6be"); // Kaldırım
    box(group, [196, 0.14, width], [0, 0.09, z], "#526362"); // Sıcak koyu asfalt
    for (let x = -90; x <= 90; x += 6) {
      box(group, [1.6, 0.015, 0.15], [x, 0.18, z], "#fff4d4");
    }
  }

  // Dikey Ana Bulvarlar (X = 0, X = -50, X = 50)
  for (const x of [-50, 0, 50]) {
    const isMain = x === 0;
    const width = isMain ? 9.6 : 8.0;
    const curb = width + 1.2;
    box(group, [curb, 0.12, 196], [x, 0.045, 0], "#ded6be");
    box(group, [width, 0.14, 196], [x, 0.095, 0], "#526362");
    for (let z = -90; z <= 90; z += 6) {
      box(group, [0.15, 0.015, 1.6], [x, 0.19, z], "#fff4d4");
    }
  }

  // Kavşak yaya geçitleri
  for (const z of [-6, 6]) {
    for (let x = -3.5; x <= 3.5; x += 1.2) {
      box(group, [0.65, 0.02, 1.8], [x, 0.21, z], "#fff8e2");
    }
  }
  for (const x of [-6, 6]) {
    for (let z = -3.5; z <= 3.5; z += 1.2) {
      box(group, [1.8, 0.02, 0.65], [x, 0.21, z], "#fff8e2");
    }
  }

  function addTree(x: number, z: number, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    group.add(g);
    cylinder(g, 0.22, 0.3, 1.9, [0, 0.95, 0], "#8f6e4a", 7);
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      mat("#559467"),
    );
    crown.position.set(0, 2.6, 0);
    crown.scale.set(1, 1.1, 0.95);
    crown.castShadow = true;
    g.add(crown);
    const tip = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 0),
      mat("#78a666"),
    );
    tip.position.set(0.4, 3.2, 0.1);
    tip.castShadow = true;
    g.add(tip);
    baseObstacles.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
  }

  function addPalmTree(x: number, z: number) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    group.add(g);
    cylinder(g, 0.18, 0.28, 3.2, [0, 1.6, 0], "#9e7d56", 6);
    for (let i = 0; i < 5; i++) {
      const leaf = box(g, [2.2, 0.06, 0.5], [1.0, 3.3, 0], "#42875b");
      leaf.rotation.y = (i * Math.PI * 2) / 5;
      leaf.rotation.z = -0.25;
    }
    baseObstacles.push({ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 });
  }

  function addStreetLight(x: number, z: number) {
    cylinder(group, 0.08, 0.12, 3.6, [x, 1.8, z], "#38524a", 8);
    box(group, [0.8, 0.16, 0.4], [x, 3.65, z], "#fbeecc");
  }

  // ==========================================
  // BÖLGE 1: 🏡 GÜNEŞ MAHALLESİ (Kuzeybatı)
  // ==========================================
  const depotPos: Vec2 = { x: -40, z: -40 };
  const depotGroup = new THREE.Group();
  depotGroup.position.set(-47, 0, -42);
  group.add(depotGroup);
  box(depotGroup, [10, 4.2, 7.5], [0, 2.1, 0], "#f4bb48");
  box(depotGroup, [10.5, 0.4, 8], [0, 4.3, 0], "#235c4e");
  box(depotGroup, [4.5, 2.6, 0.2], [1.5, 1.3, 3.8], "#315e55");
  box(depotGroup, [9, 0.2, 3], [0, 0.1, 5.0], "#d5d5c0");
  const depotLabel = label("KARGO DEPOSU", "#fff8e6", "#235c4e");
  depotLabel.position.set(0, 5.4, 0);
  depotGroup.add(depotLabel);
  baseObstacles.push({ minX: -52.5, maxX: -41.5, minZ: -46.5, maxZ: -37.5 });

  // Evler 00 - 03 (Sunny)
  const sunnyHouses = [
    { x: -75, z: -75, color: "#efa265", roof: "#b05e46", id: "01" },
    { x: -25, z: -75, color: "#8abcb0", roof: "#3e6e66", id: "02" },
    { x: -75, z: -25, color: "#f5d475", roof: "#ae6550", id: "03" },
    { x: -25, z: -25, color: "#d9a1a1", roof: "#45766b", id: "04" },
  ];

  sunnyHouses.forEach((h) => {
    const g = new THREE.Group();
    g.position.set(h.x, 0, h.z);
    group.add(g);
    box(g, [9.5, 0.16, 8.5], [0, 0.1, 0], "#bed596");
    box(g, [6.5, 3.8, 5.5], [0, 2.0, 0], h.color);
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 5.2, 2.4, 4),
      mat(h.roof),
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.85;
    roof.position.y = 5.0;
    roof.castShadow = true;
    g.add(roof);
    box(g, [1.2, 2.2, 0.15], [0, 1.2, 2.8], "#3b6057");
    const sign = label(h.id);
    sign.scale.set(1.2, 0.45, 1);
    sign.position.set(0, 3.0, 3.0);
    g.add(sign);

    box(g, [9.2, 0.6, 0.1], [0, 0.35, 4.1], "#fff5dc");
    addTree(h.x - 3.8, h.z - 2.8, 0.95);
    addTree(h.x + 3.8, h.z + 2.8, 0.9);

    homes.push({ x: h.x, z: h.z + 5.5 });
    baseObstacles.push({ minX: h.x - 3.8, maxX: h.x + 3.8, minZ: h.z - 3.2, maxZ: h.z + 3.2 });
  });

  // ==========================================
  // BÖLGE 2: 🛍️ ÇARŞI BÖLGESİ (Güneydoğu)
  // ==========================================
  const squareX = 50, squareZ = 50;
  box(group, [12, 0.2, 12], [squareX, 0.12, squareZ], "#eadbb8");
  cylinder(group, 2.5, 2.8, 0.7, [squareX, 0.5, squareZ], "#d9c8a7");
  cylinder(group, 2.1, 2.1, 0.2, [squareX, 0.85, squareZ], "#66b2c2");
  cylinder(group, 0.4, 0.6, 1.4, [squareX, 1.4, squareZ], "#ecd9b8");
  baseObstacles.push({ minX: squareX - 2.8, maxX: squareX + 2.8, minZ: squareZ - 2.8, maxZ: squareZ + 2.8 });

  // Evler 04 - 07 (Market)
  const marketShops = [
    { x: 25, z: 25, color: "#fff4e0", awning: "#d85b48", id: "05", name: "PASTANE" },
    { x: 75, z: 25, color: "#f8eed6", awning: "#3c8375", id: "06", name: "MANAV" },
    { x: 25, z: 75, color: "#fbf2de", awning: "#4a689b", id: "07", name: "KİTAPÇI" },
    { x: 75, z: 75, color: "#fff0d6", awning: "#d59838", id: "08", name: "BUTİK" },
  ];

  marketShops.forEach((s) => {
    const g = new THREE.Group();
    g.position.set(s.x, 0, s.z);
    group.add(g);
    box(g, [8.5, 4.8, 7.0], [0, 2.4, 0], s.color);
    box(g, [8.9, 0.35, 7.4], [0, 4.9, 0], "#a45b4b");
    const awning = box(g, [7.2, 0.35, 2.0], [0, 2.9, 4.2], s.awning);
    awning.rotation.x = 0.22;
    box(g, [6.5, 2.0, 0.12], [0, 1.2, 3.55], "#457471");
    const sign = label(`${s.id} ${s.name}`);
    sign.scale.set(2.2, 0.55, 1);
    sign.position.set(0, 3.8, 3.65);
    g.add(sign);

    addStreetLight(s.x - 4.5, s.z + 4.2);
    addStreetLight(s.x + 4.5, s.z + 4.2);

    homes.push({ x: s.x, z: s.z + 5.5 });
    baseObstacles.push({ minX: s.x - 4.5, maxX: s.x + 4.5, minZ: s.z - 3.8, maxZ: s.z + 3.8 });
  });

  // ==========================================
  // BÖLGE 3: 🏭 SANAYİ BÖLGESİ (Kuzeydoğu)
  // ==========================================
  function addContainers(cx: number, cz: number) {
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    group.add(g);
    const colors = ["#2b6cb0", "#c53030", "#dd6b20", "#319795"];
    box(g, [6.5, 2.4, 2.5], [0, 1.2, -1.5], colors[0]);
    box(g, [6.5, 2.4, 2.5], [0, 1.2, 1.5], colors[1]);
    box(g, [6.5, 2.4, 2.5], [0, 3.6, 0], colors[2]);
    baseObstacles.push({ minX: cx - 3.5, maxX: cx + 3.5, minZ: cz - 3.0, maxZ: cz + 3.0 });
  }
  addContainers(50, -50);

  // Evler 08 - 11 (Industrial)
  const industrialPlants = [
    { x: 25, z: -75, color: "#718096", trim: "#2b6cb0", id: "09", name: "ANTREPO" },
    { x: 75, z: -75, color: "#4a5568", trim: "#c53030", id: "10", name: "DÖKÜM" },
    { x: 25, z: -25, color: "#718096", trim: "#dd6b20", id: "11", name: "LOJİSTİK" },
    { x: 75, z: -25, color: "#4a5568", trim: "#319795", id: "12", name: "FABRİKA" },
  ];

  industrialPlants.forEach((p) => {
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    group.add(g);
    box(g, [11.0, 5.5, 8.5], [0, 2.75, 0], p.color);
    box(g, [11.4, 0.4, 8.9], [0, 5.65, 0], p.trim);
    box(g, [4.2, 3.6, 0.2], [0, 1.8, 4.3], "#2d3748");
    cylinder(g, 0.6, 0.8, 4.5, [4.2, 5.8, -2.5], "#a0aec0", 8);
    const sign = label(`${p.id} ${p.name}`, "#f7fafc", p.trim);
    sign.scale.set(2.4, 0.6, 1);
    sign.position.set(0, 4.2, 4.4);
    g.add(sign);

    homes.push({ x: p.x, z: p.z + 6.0 });
    baseObstacles.push({ minX: p.x - 5.8, maxX: p.x + 5.8, minZ: p.z - 4.5, maxZ: p.z + 4.5 });
  });

  // ==========================================
  // BÖLGE 4: 🌊 SAHİL & PARK BÖLGESİ (Güneybatı)
  // ==========================================
  box(group, [75, 0.35, 0.25], [-50, 0.4, 38], "#f0f4f8");
  for (let x = -85; x <= -15; x += 10) {
    addPalmTree(x, 34);
    box(group, [2.2, 0.14, 0.6], [x + 4, 0.45, 36], "#9c6d48");
    box(group, [2.2, 0.6, 0.12], [x + 4, 0.8, 35.7], "#b28059");
  }

  // Evler 12 - 15 (Coastal)
  const coastalSpots = [
    { x: -75, z: 25, color: "#ffffff", roof: "#319795", id: "13", name: "MARİNA" },
    { x: -25, z: 25, color: "#f7fafc", roof: "#2b6cb0", id: "14", name: "KAFE" },
    { x: -75, z: 75, color: "#ffffff", roof: "#38b2ac", id: "15", name: "VİLLA" },
    { x: -25, z: 75, color: "#f7fafc", roof: "#4299e1", id: "16", name: "KULÜP" },
  ];

  coastalSpots.forEach((c) => {
    const g = new THREE.Group();
    g.position.set(c.x, 0, c.z);
    group.add(g);
    box(g, [8.5, 4.2, 7.5], [0, 2.1, 0], c.color);
    box(g, [9.0, 0.35, 8.0], [0, 4.35, 0], c.roof);
    box(g, [3.2, 2.4, 0.15], [0, 1.2, 3.8], "#4a5568");
    const sign = label(`${c.id} ${c.name}`, "#ffffff", c.roof);
    sign.scale.set(2.2, 0.55, 1);
    sign.position.set(0, 3.2, 3.9);
    g.add(sign);

    addPalmTree(c.x - 4.5, c.z + 2.5);
    addPalmTree(c.x + 4.5, c.z + 2.5);

    homes.push({ x: c.x, z: c.z + 5.5 });
    baseObstacles.push({ minX: c.x - 4.5, maxX: c.x + 4.5, minZ: c.z - 4.0, maxZ: c.z + 4.0 });
  });

  // Ek sokak lambaları
  for (const [x, z] of [
    [-85, -50], [-15, -50], [15, -50], [85, -50],
    [-85, 50], [-15, 50], [15, 50], [85, 50],
    [-50, -85], [-50, -15], [-50, 15], [-50, 85],
    [50, -85], [50, -15], [50, 15], [50, 85],
  ]) {
    addStreetLight(x, z);
    if (Math.abs(z) < 35) addTree(x + 3, z + 3, 1.1);
  }

  // ==========================================
  // KİLİTLİ BÖLGE YOL BARİYERLERİ
  // ==========================================

  function buildRoadBarrier(
    parent: THREE.Group,
    x: number,
    z: number,
    length: number,
    isHorizontal: boolean,
    tag: string,
  ): { group: THREE.Group; obstacle: Rect } {
    const bg = new THREE.Group();
    bg.position.set(x, 0, z);
    parent.add(bg);

    const barW = isHorizontal ? length : 0.6;
    const barD = isHorizontal ? 0.6 : length;

    // Kırmızı-beyaz beton bariyer tabanı
    box(bg, [barW, 0.9, barD], [0, 0.45, 0], "#d63031");
    // Çizgili desen için beyaz bloklar
    const count = Math.floor(length / 2);
    for (let i = 0; i < count; i++) {
      const offset = (i - count / 2 + 0.5) * 1.8;
      const bx = isHorizontal ? offset : 0;
      const bz = isHorizontal ? 0 : offset;
      box(bg, [isHorizontal ? 0.9 : 0.65, 0.92, isHorizontal ? 0.65 : 0.9], [bx, 0.46, bz], "#f5f6fa");
    }

    // Sarı uyarı flaşörleri
    for (const side of [-1, 1]) {
      const fx = isHorizontal ? (side * length) / 2.5 : 0;
      const fz = isHorizontal ? 0 : (side * length) / 2.5;
      cylinder(bg, 0.16, 0.2, 0.4, [fx, 1.1, fz], "#f1c40f", 8);
    }

    // Şantiye uyarı levhası
    const sign = label(tag, "#ffffff", "#c0392b");
    sign.scale.set(isHorizontal ? 3.0 : 1.2, 0.6, 1);
    sign.position.set(0, 1.5, 0);
    bg.add(sign);

    const halfW = barW / 2 + 0.2;
    const halfD = barD / 2 + 0.2;
    const obstacle: Rect = {
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfD,
      maxZ: z + halfD,
    };

    return { group: bg, obstacle };
  }

  const barriers: DistrictBarrier[] = [];

  // 1. Çarşı Bölgesi Bariyerleri (Level 2'de kalkar)
  const marketBarrierGroup = new THREE.Group();
  group.add(marketBarrierGroup);
  const marketObstacles: Rect[] = [];
  const mb1 = buildRoadBarrier(marketBarrierGroup, 5, 50, 10, false, "KİLİTLİ · SEVİYE 2");
  const mb2 = buildRoadBarrier(marketBarrierGroup, 50, 5, 10, true, "KİLİTLİ · SEVİYE 2");
  const mb3 = buildRoadBarrier(marketBarrierGroup, 6, 6, 9, false, "ÇARŞI · SEVİYE 2");
  marketObstacles.push(mb1.obstacle, mb2.obstacle, mb3.obstacle);
  barriers.push({ districtId: "market", group: marketBarrierGroup, obstacles: marketObstacles });

  // 2. Sanayi Bölgesi Bariyerleri (Level 3'te kalkar)
  const industrialBarrierGroup = new THREE.Group();
  group.add(industrialBarrierGroup);
  const industrialObstacles: Rect[] = [];
  const ib1 = buildRoadBarrier(industrialBarrierGroup, 5, -50, 10, false, "KİLİTLİ · SEVİYE 3");
  const ib2 = buildRoadBarrier(industrialBarrierGroup, 50, -5, 10, true, "KİLİTLİ · SEVİYE 3");
  const ib3 = buildRoadBarrier(industrialBarrierGroup, 6, -6, 9, false, "SANAYİ · SEVİYE 3");
  industrialObstacles.push(ib1.obstacle, ib2.obstacle, ib3.obstacle);
  barriers.push({ districtId: "industrial", group: industrialBarrierGroup, obstacles: industrialObstacles });

  // 3. Sahil Bölgesi Bariyerleri (Level 4'te kalkar)
  const coastalBarrierGroup = new THREE.Group();
  group.add(coastalBarrierGroup);
  const coastalObstacles: Rect[] = [];
  const cb1 = buildRoadBarrier(coastalBarrierGroup, -50, 5, 10, true, "KİLİTLİ · SEVİYE 4");
  const cb2 = buildRoadBarrier(coastalBarrierGroup, -5, 50, 10, false, "KİLİTLİ · SEVİYE 4");
  const cb3 = buildRoadBarrier(coastalBarrierGroup, -6, 6, 9, false, "SAHİL · SEVİYE 4");
  coastalObstacles.push(cb1.obstacle, cb2.obstacle, cb3.obstacle);
  barriers.push({ districtId: "coastal", group: coastalBarrierGroup, obstacles: coastalObstacles });

  // Başlangıçta tüm engelleri birleştir
  obstacles.push(...baseObstacles);

  const unlockedSet = new Set<DistrictId>(["sunny"]);

  function updateUnlockedDistricts(companyLevel: number): DistrictId[] {
    const newlyUnlocked: DistrictId[] = [];

    for (const district of districts) {
      if (companyLevel >= district.unlockLevel) {
        if (!unlockedSet.has(district.id)) {
          unlockedSet.add(district.id);
          newlyUnlocked.push(district.id);
        }
      }
    }

    // Bariyerlerin görünürlüğünü güncelle ve engelleri yeniden oluştur
    obstacles.length = 0;
    obstacles.push(...baseObstacles);

    for (const b of barriers) {
      const isUnlocked = unlockedSet.has(b.districtId);
      b.group.visible = !isUnlocked;
      if (!isUnlocked) {
        obstacles.push(...b.obstacles);
      }
    }

    return newlyUnlocked;
  }

  // Varsayılan seviye 1 engellerini ayarla
  updateUnlockedDistricts(1);

  return {
    group,
    obstacles,
    bounds,
    depot: depotPos,
    homes,
    barriers,
    updateUnlockedDistricts,
  };
}
