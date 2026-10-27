import * as THREE from "three";
import { box, cylinder, label, mat, type WorldContext } from "../world-kit";
import type { Vec2 } from "../../game/types";
import {
  SUNNY_DEPOT,
  SUNNY_DEPOT_BUILDING,
  SUNNY_DEPOT_COLLIDER,
  SUNNY_HOMES,
  SUNNY_ROAD_TILES,
  SUNNY_DEPOT_APRON,
} from "../sunny-layout";
import {
  buildFireHydrant,
  buildParkBench,
  buildBusStop,
  buildBillboard,
  buildStaticCar,
  buildPlayground,
} from "../city-details";

/** Güneş Mahallesi (Kuzeybatı): Gerçek Lojistik Merkezi üssü, bahçeli sevimli evler ve çocuk parkı. */
export function buildSunnyDistrict(ctx: WorldContext): { depot: Vec2 } {
  const { group, baseObstacles, homes, addTree, addStreetLight, addModel } = ctx;

  // =========================================================================
  // 1. Yol Karoları
  // =========================================================================
  for (const tile of SUNNY_ROAD_TILES) {
    if (!addModel(group, tile.model, tile.x, tile.z, 10, tile.rotation)) {
      const crossing = tile.model === "road-crossroad";
      const horizontal = tile.rotation === 0;
      box(group, [10, 0.12, 10], [tile.x, 0.04, tile.z], "#ded6be");
      box(group, [horizontal || crossing ? 10 : 8, 0.14, !horizontal || crossing ? 10 : 8], [tile.x, 0.09, tile.z], "#526362");
    }
  }

  // Sunny sokaklarını X=0 ve Z=0 ana bulvarlarına bağlayan geçiş karoları
  for (const z of [-80, -10]) {
    box(group, [6, 0.12, 9.2], [-3, 0.04, z], "#ded6be");
    box(group, [6, 0.14, 8.0], [-3, 0.085, z], "#526362");
  }
  for (const x of [-80, -20]) {
    box(group, [9.2, 0.12, 6], [x, 0.04, -3], "#ded6be");
    box(group, [8.0, 0.14, 6], [x, 0.085, -3], "#526362");
  }

  // =========================================================================
  // 2. Kargo Deposu (Lojistik Merkezi - Ana Üs)
  // =========================================================================
  const depotPos = { ...SUNNY_DEPOT };
  const depotGroup = new THREE.Group();
  depotGroup.position.set(SUNNY_DEPOT_BUILDING.x, 0, SUNNY_DEPOT_BUILDING.z);
  group.add(depotGroup);

  // Ana depo binası gövdesi (Modern lojistik mimarisi)
  box(depotGroup, [10.5, 4.4, 7.8], [0, 2.2, 0], "#f5b041"); // Canlı kurumsal kargo sarısı
  box(depotGroup, [11.0, 0.45, 8.2], [0, 4.5, 0], "#1e5144"); // Çatı parapeti

  // Ön müşteri ve personel girişi
  box(depotGroup, [4.5, 2.6, 0.25], [1.5, 1.3, 3.95], "#2a6f5e");
  box(depotGroup, [1.8, 2.2, 0.3], [1.5, 1.1, 4.0], "#34495e"); // Cam kapı

  // Ön yükleme sundurması ve sundurma direkleri
  box(depotGroup, [9.2, 0.25, 3.2], [0, 0.12, 5.2], "#d5d5c0");
  box(depotGroup, [9.6, 0.2, 3.0], [0, 3.6, 5.2], "#2a6f5e"); // Sundurma tavanı
  cylinder(depotGroup, 0.08, 0.08, 3.6, [-4.2, 1.8, 6.4], "#7f8c8d", 8);
  cylinder(depotGroup, 0.08, 0.08, 3.6, [4.2, 1.8, 6.4], "#7f8c8d", 8);

  // Arka Tır / Kamyon Yanaşma Rampası (Loading Dock)
  box(depotGroup, [4.0, 2.8, 0.2], [-2.2, 1.5, -3.95], "#2c3e50"); // Tır yükleme sarmal kepengi
  box(depotGroup, [4.2, 0.3, 0.3], [-2.2, 0.15, -4.1], "#f1c40f"); // Sarı-siyah rampa tamponu
  box(depotGroup, [0.8, 0.32, 0.32], [-3.8, 0.15, -4.1], "#1e272e");
  box(depotGroup, [0.8, 0.32, 0.32], [-0.6, 0.15, -4.1], "#1e272e");

  // Çatı üstünde aydınlatmalı büyük "MİNİ KARGO A.Ş." Tabelası
  const depotLabel = label("MİNİ KARGO A.Ş. · LOJİSTİK ÜSSÜ", "#ffffff", "#1e5144");
  depotLabel.position.set(0, 5.8, 0.5);
  depotLabel.scale.set(6.2, 1.4, 1);
  depotGroup.add(depotLabel);

  // Depo collider'ını koruyoruz
  baseObstacles.push(SUNNY_DEPOT_COLLIDER);

  // Apron zemin kaplaması ve oyuncu başlangıç park alanı
  box(
    group,
    [12, 0.1, SUNNY_DEPOT_APRON.maxZ - SUNNY_DEPOT_APRON.minZ],
    [-61, -0.04, (SUNNY_DEPOT_APRON.minZ + SUNNY_DEPOT_APRON.maxZ) / 2],
    "#d8d8c6",
  );
  box(group, [3.8, 0.04, 3.8], [depotPos.x, 0.025, depotPos.z], "#f4bb48");

  // =========================================================================
  // 3. Depo Çevresi: Konteynerler, Güvenlik Kulübesi, Paletler ve Forklift
  // =========================================================================
  // Depo arkası istiflenmiş kargo konteynerleri
  addModel(group, "industrial/shipping-container-a", -72, -44, 2.2, Math.PI / 2);
  addModel(group, "industrial/shipping-container-b", -72, -41, 2.2, Math.PI / 2);
  addModel(group, "industrial/shipping-container-c", -72, -42.5, 2.2, Math.PI / 2);
  // Üst kat konteyner
  if (group.children.length > 0) {
    const lastChild = group.children[group.children.length - 1];
    if (lastChild.userData.assetId === "industrial/shipping-container-c") {
      lastChild.position.y = 2.8;
    }
  }

  // Güvenlik Kulübesi (Guard Booth) & Giriş Bariyeri
  const guardX = -53, guardZ = -22;
  box(group, [2.0, 2.4, 2.0], [guardX, 1.2, guardZ], "#34495e");
  box(group, [2.2, 0.2, 2.2], [guardX, 2.45, guardZ], "#e74c3c");
  box(group, [1.6, 0.9, 0.1], [guardX, 1.4, guardZ + 1.02], "#74b9ff", 0.3); // Cam
  // Çizgili bariyer kolu
  box(group, [3.2, 0.14, 0.14], [guardX - 2.4, 0.9, guardZ + 0.8], "#f5f6fa");
  box(group, [1.0, 0.16, 0.16], [guardX - 1.8, 0.9, guardZ + 0.8], "#d63031");
  box(group, [1.0, 0.16, 0.16], [guardX - 3.2, 0.9, guardZ + 0.8], "#d63031");

  // Kargo Paletleri, Koli Yığınları ve Forklift Alanı
  for (const [px, pz] of [[-66, -31], [-66, -33.5], [-66, -28.5]] as const) {
    box(group, [1.4, 0.2, 1.4], [px, 0.1, pz], "#c19a6b"); // Ahşap palet
    box(group, [0.65, 0.55, 0.65], [px, 0.48, pz], "#e67e22"); // Koli
    box(group, [0.55, 0.45, 0.55], [px + 0.1, 0.95, pz], "#d35400"); // Üst koli
  }

  // Depo Park ve Yanaşma Çizgileri
  for (const z of [-30, -34]) {
    box(group, [3.2, 0.015, 0.15], [-64, 0.03, z], "#fff4d4");
  }

  // Depo çevresi peyzaj ve çitler
  addModel(group, "nature/plant_bushLarge", -70, -36, 4);
  addModel(group, "nature/fence_simple", -55, -42, 3.5);
  addModel(group, "nature/flower_purpleA", -56, -34, 4);

  // Kargo Yön Tabelası
  buildBillboard(group, -50, -21, 0, "MİNİ KARGO MERKEZ LOJİSTİK ÜSSÜ", "#ffffff", "#1e5144");

  // =========================================================================
  // 4. Güneş Mahallesi Evleri (Homes 00 - 03)
  // =========================================================================
  SUNNY_HOMES.forEach((h) => {
    const g = new THREE.Group();
    g.position.set(h.x, 0, h.z);
    group.add(g);

    // Bahçe zemin çimi
    box(g, [9.8, 0.1, 7.8], [0, -0.04, -0.4], "#8ec06c");

    if (!addModel(g, h.model, 0, 0, 5)) {
      box(g, [6.5, 3.8, 5.5], [0, 2.0, 0], h.color);
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 5.2, 2.4, 4), mat(h.roof));
      roof.rotation.y = Math.PI / 4;
      roof.scale.z = 0.85;
      roof.position.y = 5;
      roof.castShadow = true;
      g.add(roof);
      box(g, [1.2, 2.2, 0.15], [0, 1.2, 2.8], "#3b6057");
    }

    const sign = label(String(h.index + 1).padStart(2, "0"));
    sign.scale.set(1.2, 0.45, 1);
    sign.position.set(0, 3, 3);
    g.add(sign);

    // Bahçe giriş yürüyüş yolu
    box(g, [3.6, 0.05, 3.2], [0, 0.005, 3.6], "#e2d7c5");

    // Bahçe çitleri ve peyzaj çiçekleri
    addModel(g, "nature/plant_bush", 4.2, 0, 4);
    addModel(g, "nature/flower_redA", -3.6, 3.8, 4);
    addModel(g, "nature/flower_yellowA", 3.6, 3.8, 4);
    addModel(g, "nature/fence_simple", -4.2, -1.8, 3.5, Math.PI / 2);
    addModel(g, "nature/fence_simple", 4.2, -1.8, 3.5, Math.PI / 2);

    addTree(h.x - 5.5, h.z, 0.85);

    homes.push({ ...h.delivery });
    baseObstacles.push(h.collider);
  });

  // =========================================================================
  // 5. Çocuk Oyun Parkı ve Mahalle Sokak Mobilyaları
  // =========================================================================
  // Çocuk Parkı (Güneş Mahallesi yeşil alanı: X=-36, Z=-64)
  buildPlayground(group, -36, -64);

  // Otobüs Durağı
  buildBusStop(group, -48, -13, Math.PI, "GÜNEŞ MH. · MİNİ KARGO");

  // Yangın Muslukları ve Park Bankları
  buildFireHydrant(group, -48, -27);
  buildFireHydrant(group, -72, -13);
  buildParkBench(group, -44, -13, Math.PI);
  buildParkBench(group, -72, -23, 0);

  // Park ceplerine park etmiş sevimli arabalar (Trafiği engellemeyen güvenli cepler)
  buildStaticCar(group, -25, -7.6, 0, "#e74c3c"); // Kırmızı sedan
  buildStaticCar(group, -72, -7.6, 0, "#3498db"); // Mavi sedan

  // Sokak lambaları ve ağaçlar
  addTree(-69, -43, 0.85);
  addTree(-24, -36, 1.0);
  addTree(-48, -74, 0.9);
  addStreetLight(-68, -34);
  addStreetLight(-74.5, -74.5);
  addStreetLight(-25.5, -55.5);

  return { depot: depotPos };
}
