import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type CoffeeHouseState,
  COFFEE_HOUSE_CENTER,
  COFFEE_HOUSE_BAY,
  COFFEE_MASTER_BEKIR_POS,
  COFFEE_MASTER_BEKIR_CALLOUTS,
} from "../game/coffee-house";

export type CoffeeHouseView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: CoffeeHouseState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (T48)
 * - Anıtsal Ulu Çınar Ağacı (Platanus orientalis): heybetli gövde, kök payandaları, geniş yaprak kubbesi, çınaraltı halka sediri, asılı kehribar kandiller
 * - Tarihi Taş Kıraathane Mimarisi: kesme taş kireçtaşı cephe, tuğla köşe taşları, kiremit kırma çatı, taş baca, oymalı kemerli pencereler, ahşap kapı
 * - "☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿" aydınlatmalı tabela ve yeşil-krem çizgili tente
 * - Açık hava arnavut kaldırımı teras ve hasır tabureli masalar:
 *   - Kızışmalı sedef kakmalı ahşap tavla masası (tavla tahtası, pullar, minik zarlar)
 *   - Kumda kahve & ince belli bardaklı çay masası
 *   - Günlük gazete ve kahve fincanı masası
 * - Kumda kahve ocağı (bakır kum teknesi, cezveler) ve çift musluklu bakır semaver
 * - Askılı pirinç çay tepsili, kasketli, yelekli ve kafa takipli Kahveci Bekir Usta NPC
 * - "Esnaf Kahvesi" servis yanaşma alanı ve zemin kılavuz çizgileri
 */
export function createCoffeeHouseView(): CoffeeHouseView {
  const group = new THREE.Group();
  group.name = "coffee-house-view";

  const obstacles: Rect[] = [];

  const originX = COFFEE_HOUSE_CENTER.x; // 38.5
  const originZ = COFFEE_HOUSE_CENTER.z; // 62.0

  // =========================================================================
  // 1. KIRAATHANE ARNAVUT KALDIRIMI TERASI & YANAŞMA PERONU
  // =========================================================================
  const terraceW = 14.0;
  const terraceD = 12.0;
  const terraceX = 38.0;
  const terraceZ = 61.0;

  // Ana rustik arnavut kaldırımı tabanı
  box(group, [terraceW, 0.08, terraceD], [terraceX, 0.04, terraceZ], "#c7b299");
  // Taş bordür çerçeveleri
  box(group, [terraceW, 0.12, 0.24], [terraceX, 0.06, terraceZ + terraceD / 2 - 0.12], "#795548");
  box(group, [terraceW, 0.12, 0.24], [terraceX, 0.06, terraceZ - terraceD / 2 + 0.12], "#795548");
  box(group, [0.24, 0.12, terraceD], [terraceX - terraceW / 2 + 0.12, 0.06, terraceZ], "#795548");
  box(group, [0.24, 0.12, terraceD], [terraceX + terraceW / 2 - 0.12, 0.06, terraceZ], "#795548");

  // Oyuncu Yanaşma Alanı (COFFEE_HOUSE_BAY: X: 43.0, Z: 56.5) Beyaz/Sarı Zemin Çizgileri
  const bayX = COFFEE_HOUSE_BAY.x;
  const bayZ = COFFEE_HOUSE_BAY.z;
  box(group, [3.6, 0.015, 0.12], [bayX, 0.055, bayZ + 1.5], "#ffffff");
  box(group, [3.6, 0.015, 0.12], [bayX, 0.055, bayZ - 1.5], "#ffffff");
  box(group, [0.12, 0.015, 3.0], [bayX - 1.8, 0.055, bayZ], "#ffffff");

  // Zemin beyaz kılavuz yön oku
  box(group, [0.26, 0.015, 1.3], [bayX, 0.056, bayZ], "#ffffff");
  box(group, [0.75, 0.015, 0.26], [bayX, 0.056, bayZ - 0.5], "#ffffff");

  // =========================================================================
  // 2. TARİHİ TAŞ KIRAATHANE BİNASI (Stone Coffeehouse Architecture)
  // =========================================================================
  const bldgW = 8.4;
  const bldgH = 4.4;
  const bldgD = 4.8;
  const bldgX = 34.0;
  const bldgZ = 64.5;

  // Ana kesme taş bina gövdesi (Açık kireçtaşı / traverten dokusu)
  box(group, [bldgW, bldgH, bldgD], [bldgX, bldgH / 2, bldgZ], "#d7ccc8");
  // Alt süpürgelik kaidesi
  box(group, [bldgW + 0.12, 0.6, bldgD + 0.12], [bldgX, 0.3, bldgZ], "#5d4037");
  // Rustik koyu köşe taşları (Ashlar pilasters)
  box(group, [0.45, bldgH, 0.45], [bldgX - bldgW / 2 + 0.22, bldgH / 2, bldgZ + bldgD / 2 - 0.22], "#8d6e63");
  box(group, [0.45, bldgH, 0.45], [bldgX + bldgW / 2 - 0.22, bldgH / 2, bldgZ + bldgD / 2 - 0.22], "#8d6e63");

  // Ahşap saçak frizi ve kiremit kırma çatı
  box(group, [bldgW + 0.5, 0.25, bldgD + 0.5], [bldgX, bldgH + 0.12, bldgZ], "#4e342e");
  box(group, [bldgW + 0.3, 0.45, bldgD + 0.3], [bldgX, bldgH + 0.45, bldgZ], "#a04000"); // Alaturka kiremit çatı
  box(group, [bldgW - 1.2, 0.6, bldgD - 1.2], [bldgX, bldgH + 0.95, bldgZ], "#873600"); // Çatı tepe mahyası

  // Taş baca (Köz dumanı menfezi)
  box(group, [0.85, 1.3, 0.85], [bldgX - bldgW / 2 + 1.2, bldgH + 0.85, bldgZ - 0.9], "#795548");
  box(group, [1.0, 0.15, 1.0], [bldgX - bldgW / 2 + 1.2, bldgH + 1.55, bldgZ - 0.9], "#4e342e");

  // Oymalı kemerli ahşap pencereler
  const winW = 1.3, winH = 1.8;
  const winZ = bldgZ - bldgD / 2 - 0.04;
  for (const wx of [bldgX - 2.2, bldgX + 2.2]) {
    // Pencere ahşap kasası
    box(group, [winW + 0.2, winH + 0.2, 0.08], [wx, 2.3, winZ], "#3e2723");
    // Sıcak sarı ışıklı vitrin camı
    box(group, [winW, winH, 0.1], [wx, 2.3, winZ + 0.02], "#ffe082");
    // Kemerli üst başlık
    cylinder(group, winW / 2, winW / 2, 0.1, [wx, 2.3 + winH / 2, winZ + 0.02], "#3e2723", 12).rotation.x = Math.PI / 2;
  }

  // Tarihi oymalı çift ahşap giriş kapısı
  const doorW = 1.7, doorH = 2.6;
  box(group, [doorW + 0.2, doorH + 0.2, 0.1], [bldgX, doorH / 2 + 0.1, winZ], "#3e2723");
  box(group, [doorW, doorH, 0.12], [bldgX, doorH / 2 + 0.1, winZ + 0.02], "#4e342e");
  cylinder(group, 0.04, 0.04, 0.25, [bldgX + 0.15, 1.3, winZ - 0.08], "#f1c40f", 8); // Pirinç kapı kolu

  // Kapı üstü yeşil-krem çizgili nostaljik kumaş tente
  const awningW = 4.4, awningD = 1.8;
  const awningY = 3.2, awningZ = winZ - awningD / 2;
  const awning = box(group, [awningW, 0.12, awningD], [bldgX, awningY, awningZ], "#1b5e20");
  awning.rotation.x = 0.22;
  // Tente fırfırlı ön saçağı
  box(group, [awningW, 0.35, 0.08], [bldgX, awningY - 0.22, winZ - awningD + 0.1], "#f5f5dc");

  // Çatı aydınlatmalı ana tabela ("☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿")
  const marqueeSign = label("☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿", "#ffffff", "#4e342e");
  marqueeSign.scale.set(5.2, 1.2, 1);
  marqueeSign.position.set(bldgX, bldgH + 1.15, bldgZ - bldgD / 2 + 0.15);
  group.add(marqueeSign);

  // İkincil ürün bandı tabelası
  const subSign = label("KUMDA TÜRK KAHVESİ · TAZE ÇAY · TAVLA KEYFİ", "#f1c40f", "#2e7d32");
  subSign.scale.set(4.0, 0.65, 1);
  subSign.position.set(bldgX, bldgH + 0.5, bldgZ - bldgD / 2 + 0.15);
  group.add(subSign);

  // Kıraathane içi sıcak aydınlatma
  const interiorLight = new THREE.PointLight("#ffe082", 2.0, 14);
  interiorLight.position.set(bldgX, 2.5, bldgZ - 1.0);
  group.add(interiorLight);

  // Bina çarpışma engeli
  obstacles.push({
    minX: bldgX - bldgW / 2 - 0.4,
    maxX: bldgX + bldgW / 2 + 0.4,
    minZ: bldgZ - bldgD / 2 - 0.4,
    maxZ: bldgZ + bldgD / 2 + 0.4,
  });

  // =========================================================================
  // 3. ANITSAL ULU ÇINAR AĞACI & HALKA SEDİRİ (Monumental Plane Tree)
  // =========================================================================
  const treeX = 36.8;
  const treeZ = 58.8;

  // Heybetli yaşlı çınar gövdesi (Gnarled trunk)
  cylinder(group, 0.85, 1.25, 5.8, [treeX, 2.9, treeZ], "#4e3629", 10);

  // Zemin kök payandaları (Root buttresses)
  for (let a = 0; a < 4; a++) {
    const angle = (a * Math.PI) / 2 + 0.3;
    const rx = treeX + Math.cos(angle) * 1.35;
    const rz = treeZ + Math.sin(angle) * 1.35;
    cylinder(group, 0.22, 0.42, 0.7, [rx, 0.35, rz], "#3e2723", 8);
  }

  // Çınaraltı dairesel ahşap oturma sediri (Circular Tree Surround Bench)
  const benchInnerR = 1.35;
  const benchOuterR = 1.95;
  const benchH = 0.48;
  // Sedir tablası (8 parça sekizgen ahşap oturma halkası)
  for (let i = 0; i < 8; i++) {
    const segAngle = (i * Math.PI) / 4;
    const midR = (benchInnerR + benchOuterR) / 2;
    const bx = treeX + Math.cos(segAngle) * midR;
    const bz = treeZ + Math.sin(segAngle) * midR;
    const slat = box(group, [0.55, 0.08, 0.85], [bx, benchH, bz], "#8d6e63");
    slat.rotation.y = -segAngle;

    // Ayak dikmesi
    cylinder(group, 0.04, 0.04, benchH, [bx, benchH / 2, bz], "#3e2723", 6);
  }

  // Kalın ana dallar (Thick sprawling branches)
  const branchCoords = [
    { x: treeX - 1.4, y: 5.0, z: treeZ - 0.8, rx: 0.3, rz: 0.5 },
    { x: treeX + 1.5, y: 5.2, z: treeZ + 0.6, rx: -0.4, rz: -0.6 },
    { x: treeX + 0.4, y: 5.4, z: treeZ - 1.5, rx: 0.6, rz: -0.2 },
  ];
  for (const b of branchCoords) {
    const br = cylinder(group, 0.35, 0.5, 2.2, [b.x, b.y, b.z], "#4e3629", 8);
    br.rotation.x = b.rx;
    br.rotation.z = b.rz;
  }

  // Geniş ve heybetli yeşil yaprak kubbesi (Expansive foliage clusters)
  const leafClusters = [
    { x: treeX, y: 7.2, z: treeZ, r: 3.2, col: "#2e7d32" },
    { x: treeX - 2.2, y: 6.4, z: treeZ - 1.2, r: 2.6, col: "#388e3c" },
    { x: treeX + 2.4, y: 6.6, z: treeZ + 1.0, r: 2.8, col: "#2e7d32" },
    { x: treeX + 0.8, y: 6.8, z: treeZ - 2.2, r: 2.5, col: "#43a047" },
    { x: treeX - 1.2, y: 6.5, z: treeZ + 2.0, r: 2.5, col: "#2e7d32" },
    { x: treeX + 0.2, y: 8.4, z: treeZ + 0.2, r: 2.2, col: "#4caf50" },
    { x: treeX - 1.8, y: 7.6, z: treeZ + 0.5, r: 2.0, col: "#f9a825" }, // Sonbahar altın sarısı yaprak dokunuşu
  ];
  for (const lc of leafClusters) {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(lc.r, 1),
      new THREE.MeshStandardMaterial({
        color: lc.col,
        roughness: 0.85,
        flatShading: true,
      }),
    );
    mesh.position.set(lc.x, lc.y, lc.z);
    mesh.scale.set(1.1, 0.8, 1.1);
    group.add(mesh);
  }

  // Dallarından sarkan nostaljik kehribar cam kandiller / fenerler
  const lanternLights: THREE.PointLight[] = [];
  const lanternMeshes: THREE.Mesh[] = [];
  const lanternPositions = [
    { x: treeX - 1.8, y: 4.2, z: treeZ - 0.5 },
    { x: treeX + 1.8, y: 4.3, z: treeZ + 0.8 },
    { x: treeX + 0.2, y: 4.4, z: treeZ - 1.8 },
  ];
  for (const lp of lanternPositions) {
    // Asma zinciri
    cylinder(group, 0.015, 0.015, 0.8, [lp.x, lp.y + 0.4, lp.z], "#b7950b", 6);
    // Pirinç fener gövdesi ve kehribar camı
    cylinder(group, 0.12, 0.16, 0.32, [lp.x, lp.y, lp.z], "#b7950b", 6);
    const glass = cylinder(group, 0.14, 0.14, 0.22, [lp.x, lp.y, lp.z], "#ffb74d", 8);
    lanternMeshes.push(glass);

    const light = new THREE.PointLight("#ffb74d", 1.8, 10);
    light.position.set(lp.x, lp.y, lp.z);
    group.add(light);
    lanternLights.push(light);
  }

  // Ulu Çınar Ağacı gövdesi çarpışma engeli
  obstacles.push({
    minX: treeX - 1.4,
    maxX: treeX + 1.4,
    minZ: treeZ - 1.4,
    maxZ: treeZ + 1.4,
  });

  // =========================================================================
  // 4. AÇIK HAVA HASIR TABURELİ MASALAR & TAVLA MASASI
  // =========================================================================
  function buildWickerStool(x: number, z: number) {
    // Hasır örgü dokulu tabure (Wicker stool)
    cylinder(group, 0.24, 0.22, 0.42, [x, 0.21, z], "#d7ccc8", 8);
    cylinder(group, 0.26, 0.26, 0.08, [x, 0.44, z], "#a1887f", 8); // Hasır oturma minderi
  }

  // --- MASA 1: KIZIŞMALI TAVLA MASASI (X: 38.2, Z: 56.4) ---
  const t1X = 38.2, t1Z = 56.4;
  // Düşük ahşap yuvarlak masa
  cylinder(group, 0.55, 0.55, 0.06, [t1X, 0.52, t1Z], "#5d4037", 12);
  cylinder(group, 0.06, 0.06, 0.5, [t1X, 0.25, t1Z], "#3e2723", 8);
  cylinder(group, 0.35, 0.35, 0.04, [t1X, 0.02, t1Z], "#3e2723", 8);

  // Açık sedef kakmalı ahşap tavla tahtası
  const board = box(group, [0.52, 0.04, 0.44], [t1X, 0.56, t1Z], "#4e342e");
  board.rotation.y = 0.25;
  // Tavla iç yeşil/kahve kumaş zemini
  box(group, [0.46, 0.045, 0.38], [t1X, 0.565, t1Z], "#2e7d32").rotation.y = 0.25;
  // Siyah ve beyaz tavla pulları (Checkers)
  cylinder(group, 0.035, 0.035, 0.02, [t1X - 0.12, 0.59, t1Z - 0.06], "#ffffff", 8);
  cylinder(group, 0.035, 0.035, 0.02, [t1X - 0.12, 0.59, t1Z + 0.06], "#111111", 8);
  cylinder(group, 0.035, 0.035, 0.02, [t1X + 0.12, 0.59, t1Z - 0.04], "#ffffff", 8);
  cylinder(group, 0.035, 0.035, 0.02, [t1X + 0.12, 0.59, t1Z + 0.08], "#111111", 8);
  // Minyatür tavla zarları (Twin miniature dice)
  box(group, [0.03, 0.03, 0.03], [t1X - 0.02, 0.60, t1Z - 0.02], "#ffffff").rotation.y = 0.4;
  box(group, [0.03, 0.03, 0.03], [t1X + 0.04, 0.60, t1Z + 0.02], "#ffffff").rotation.y = -0.5;

  // İki hasır tabure
  buildWickerStool(t1X - 0.65, t1Z);
  buildWickerStool(t1X + 0.65, t1Z);

  // --- MASA 2: KUMDA TÜRK KAHVESİ & ÇAY MASASI (X: 35.2, Z: 61.2) ---
  const t2X = 35.2, t2Z = 61.2;
  cylinder(group, 0.5, 0.5, 0.06, [t2X, 0.52, t2Z], "#6d4c41", 12);
  cylinder(group, 0.06, 0.06, 0.5, [t2X, 0.25, t2Z], "#3e2723", 8);
  // Bakır cezve
  cylinder(group, 0.05, 0.07, 0.12, [t2X - 0.12, 0.61, t2Z], "#d35400", 8);
  cylinder(group, 0.012, 0.012, 0.18, [t2X - 0.22, 0.68, t2Z], "#f1c40f", 6).rotation.z = -0.6; // Pirinç sap
  // İnce belli cam çay bardakları ve kırmızı/beyaz tabaklar
  cylinder(group, 0.06, 0.06, 0.015, [t2X + 0.12, 0.56, t2Z - 0.08], "#c0392b", 8); // Çay tabağı
  cylinder(group, 0.025, 0.03, 0.08, [t2X + 0.12, 0.60, t2Z - 0.08], "#d35400", 8); // Demli çay
  cylinder(group, 0.06, 0.06, 0.015, [t2X + 0.14, 0.56, t2Z + 0.1], "#c0392b", 8);
  cylinder(group, 0.025, 0.03, 0.08, [t2X + 0.14, 0.60, t2Z + 0.1], "#d35400", 8);

  buildWickerStool(t2X, t2Z - 0.65);
  buildWickerStool(t2X, t2Z + 0.65);

  // --- MASA 3: GAZETE & SOHBET KÖŞESİ (X: 41.5, Z: 61.5) ---
  const t3X = 41.5, t3Z = 61.5;
  cylinder(group, 0.5, 0.5, 0.06, [t3X, 0.52, t3Z], "#5d4037", 12);
  cylinder(group, 0.06, 0.06, 0.5, [t3X, 0.25, t3Z], "#3e2723", 8);
  // Açık gazete
  box(group, [0.36, 0.015, 0.26], [t3X, 0.56, t3Z], "#ffffff").rotation.y = 0.2;
  // Zarflı porselen fincan
  cylinder(group, 0.04, 0.035, 0.06, [t3X + 0.12, 0.58, t3Z - 0.1], "#f1c40f", 8);

  buildWickerStool(t3X - 0.65, t3Z);
  buildWickerStool(t3X + 0.65, t3Z);

  // =========================================================================
  // 5. "KUMDA KAHVE" OCAĞI & BAKIR ÇAY SEMAVERİ (Coffee Sand Stove & Samovar)
  // =========================================================================
  const stoveX = 39.8, stoveZ = 63.8;
  // Tuğla kaide tezgahı
  box(group, [2.4, 0.85, 1.2], [stoveX, 0.425, stoveZ], "#8d6e63");
  box(group, [2.6, 0.08, 1.3], [stoveX, 0.89, stoveZ], "#d7ccc8"); // Mermer tezgah üstü

  // Bakır kum teknesi (Kumda kahve teknesi)
  cylinder(group, 0.45, 0.48, 0.18, [stoveX - 0.55, 0.98, stoveZ], "#d35400", 12);
  cylinder(group, 0.42, 0.42, 0.08, [stoveX - 0.55, 1.05, stoveZ], "#e67e22", 12); // Sıcak kavurma kumu
  // Kuma gömülü cezveler
  cylinder(group, 0.05, 0.07, 0.12, [stoveX - 0.45, 1.10, stoveZ - 0.1], "#b7950b", 8);
  cylinder(group, 0.05, 0.07, 0.12, [stoveX - 0.65, 1.10, stoveZ + 0.08], "#b7950b", 8);

  // Çift musluklu geleneksel bakır semaver
  const samovarX = stoveX + 0.65;
  cylinder(group, 0.24, 0.28, 0.65, [samovarX, 1.22, stoveZ], "#d35400", 12); // Bakır gövde
  cylinder(group, 0.06, 0.06, 0.35, [samovarX, 1.68, stoveZ], "#b7950b", 8); // Baca borusu
  cylinder(group, 0.14, 0.16, 0.16, [samovarX, 1.60, stoveZ + 0.12], "#f1c40f", 8); // Üst demlik
  cylinder(group, 0.02, 0.02, 0.08, [samovarX, 1.05, stoveZ - 0.28], "#f1c40f", 6).rotation.x = Math.PI / 2; // Musluk

  // Karataş menü tabelası (A-Frame Chalkboard Easel)
  const easelX = stoveX - 1.6, easelZ = stoveZ - 0.2;
  const boardMesh = label("☕ Kumda Kahve: 15₺\n🍵 Tavşan Kanı Çay: 5₺\n🎲 Tavla: Müesseseden", "#ffffff", "#212121");
  boardMesh.scale.set(1.8, 1.1, 1);
  boardMesh.position.set(easelX, 0.85, easelZ);
  boardMesh.rotation.y = 0.45;
  group.add(boardMesh);
  // Ahşap ayaklar
  cylinder(group, 0.03, 0.03, 1.4, [easelX - 0.4, 0.7, easelZ], "#5d4037", 6);
  cylinder(group, 0.03, 0.03, 1.4, [easelX + 0.4, 0.7, easelZ], "#5d4037", 6);

  // =========================================================================
  // 6. KAHVECİ BEKİR USTA NPC & ASMASI ÇAY TEPSİSİ (Coffee Master NPC)
  // =========================================================================
  const npcX = COFFEE_MASTER_BEKIR_POS.x; // 40.5
  const npcZ = COFFEE_MASTER_BEKIR_POS.z; // 58.5

  const npcGroup = new THREE.Group();
  npcGroup.position.set(npcX, 0, npcZ);
  group.add(npcGroup);

  // Bacaklar (Koyu lacivert kumaş pantolon)
  box(npcGroup, [0.18, 0.65, 0.2], [-0.14, 0.325, 0], "#2c3e50");
  box(npcGroup, [0.18, 0.65, 0.2], [0.14, 0.325, 0], "#2c3e50");
  // Ayakkabılar (Siyah deri kunduralar)
  box(npcGroup, [0.19, 0.12, 0.26], [-0.14, 0.06, 0.03], "#111111");
  box(npcGroup, [0.19, 0.12, 0.26], [0.14, 0.06, 0.03], "#111111");

  // Gövde (Beyaz gömlek + kahverengi işlemeli esnaf yeleği)
  box(npcGroup, [0.52, 0.68, 0.3], [0, 0.98, 0], "#ecf0f1"); // Beyaz gömlek
  box(npcGroup, [0.54, 0.66, 0.32], [0, 0.97, 0], "#795548"); // Yelek
  box(npcGroup, [0.44, 0.58, 0.05], [0, 0.88, 0.17], "#ffffff"); // Beyaz esnaf önlüğü

  // Baş ve Kasket Grubu
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.42, 0);
  npcGroup.add(headGroup);

  // Kafa (Ten rengi)
  box(headGroup, [0.32, 0.32, 0.3], [0, 0, 0], "#f5cba7");
  // Kırlaşmış saçlar
  box(headGroup, [0.34, 0.12, 0.32], [0, 0.12, -0.02], "#7f8c8d");
  // İkonik esnaf pos bıyığı (Pala bıyık)
  box(headGroup, [0.24, 0.06, 0.08], [0, -0.05, 0.16], "#5d6d7e");

  // Kasket / Fez (Bordo Osmanlı esnaf kasketi)
  cylinder(headGroup, 0.18, 0.19, 0.15, [0, 0.22, 0], "#8e2800", 12);
  cylinder(headGroup, 0.21, 0.21, 0.03, [0, 0.16, 0], "#6e1d00", 12); // Siperlik/kenar

  // Sağ Kol (Oyuncu yaklaşınca el sallama animasyonu için pivot)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.33, 1.28, 0);
  npcGroup.add(rightArmGroup);
  box(rightArmGroup, [0.14, 0.58, 0.16], [0, -0.25, 0], "#ecf0f1");
  box(rightArmGroup, [0.12, 0.14, 0.14], [0, -0.58, 0], "#f5cba7"); // El

  // Sol Kol ve Askılı Çay Tepsisi (Iconic Hanging Tea Tray)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.33, 1.28, 0);
  npcGroup.add(leftArmGroup);
  box(leftArmGroup, [0.14, 0.38, 0.16], [0, -0.16, 0.08], "#ecf0f1"); // İleri uzanmış kol

  // Askılı pirinç çay tepsisi grubu (Pivot: sol el hizası)
  const trayGroup = new THREE.Group();
  trayGroup.position.set(-0.02, -0.28, 0.25);
  leftArmGroup.add(trayGroup);

  // 3 telli pirinç askı sapı
  cylinder(trayGroup, 0.015, 0.015, 0.45, [0, -0.18, 0], "#f1c40f", 6);
  // Yuvarlak pirinç çay tepsisi
  cylinder(trayGroup, 0.26, 0.28, 0.03, [0, -0.42, 0], "#f1c40f", 12);
  // Tepsi üzerindeki 3 bardak taze çay
  cylinder(trayGroup, 0.04, 0.04, 0.01, [-0.1, -0.40, -0.06], "#c0392b", 8); // Tabağı
  cylinder(trayGroup, 0.02, 0.025, 0.06, [-0.1, -0.36, -0.06], "#d35400", 8); // Çay
  cylinder(trayGroup, 0.04, 0.04, 0.01, [0.1, -0.40, -0.06], "#c0392b", 8);
  cylinder(trayGroup, 0.02, 0.025, 0.06, [0.1, -0.36, -0.06], "#d35400", 8);
  cylinder(trayGroup, 0.04, 0.04, 0.01, [0.0, -0.40, 0.1], "#c0392b", 8);
  cylinder(trayGroup, 0.02, 0.025, 0.06, [0.0, -0.36, 0.1], "#d35400", 8);

  // 3D Konuşma Balonu (Speech Bubble Callout)
  const speechBubble = label(COFFEE_MASTER_BEKIR_CALLOUTS[0], "#ffffff", "#4e342e");
  speechBubble.scale.set(4.6, 0.95, 1);
  speechBubble.position.set(0, 2.3, 0);
  speechBubble.visible = false;
  npcGroup.add(speechBubble);

  // =========================================================================
  // 7. GÜNCELLEME, ANİMASYON VE KAFADAN TAKİP SİSTEMİ
  // =========================================================================
  let waveTimer = 0;
  let traySwayTime = 0;

  function update(
    dt: number,
    state: CoffeeHouseState,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ): void {
    // Gece/Gündüz asılı kandil ve bina vitrin ışığı ayarı
    if (isNightOrDusk) {
      interiorLight.intensity = 3.4;
      for (const lt of lanternLights) {
        lt.intensity = 3.6;
      }
      for (const m of lanternMeshes) {
        (m.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ffb74d");
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
      }
    } else {
      interiorLight.intensity = 1.6;
      for (const lt of lanternLights) {
        lt.intensity = 1.8;
      }
      for (const m of lanternMeshes) {
        (m.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#000000");
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
      }
    }

    // Çay tepsisinin ritmik hafif salınımı
    traySwayTime += dt * 3.0;
    trayGroup.rotation.z = Math.sin(traySwayTime) * 0.08;
    trayGroup.rotation.x = Math.cos(traySwayTime) * 0.05;

    // Bekir Usta kafa takibi (oyuncu <= 18m mesafedeyse başını oyuncuya çevirir)
    if (playerPos) {
      const dx = playerPos.x - npcX;
      const dz = playerPos.z - npcZ;
      const dist = Math.hypot(dx, dz);
      if (dist < 18.0 && dist > 0.5) {
        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - headGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        headGroup.rotation.y += diff * Math.min(1.0, dt * 5.0);
        headGroup.rotation.y = Math.max(-1.3, Math.min(1.3, headGroup.rotation.y));
      } else {
        headGroup.rotation.y += (0 - headGroup.rotation.y) * Math.min(1.0, dt * 3.0);
      }
    }

    // El Sallama Animasyonu (Korna çalındığında veya mola bonusu verildiğinde)
    if (state.honkGreetingTimer > 0) {
      waveTimer += dt * 8.0;
      rightArmGroup.rotation.x = -1.2 + Math.sin(waveTimer) * 0.45;
      rightArmGroup.rotation.z = 0.5 + Math.cos(waveTimer) * 0.35;

      speechBubble.visible = true;
      speechBubble.scale.set(4.6, 0.95, 1);
    } else {
      waveTimer = 0;
      rightArmGroup.rotation.x += (0 - rightArmGroup.rotation.x) * Math.min(1.0, dt * 4.0);
      rightArmGroup.rotation.z += (0 - rightArmGroup.rotation.z) * Math.min(1.0, dt * 4.0);
      speechBubble.visible = false;
    }
  }

  function onPlayerHonk(playerPos: Vec2): boolean {
    const dist = Math.hypot(playerPos.x - npcX, playerPos.z - npcZ);
    if (dist <= 24.0) {
      waveTimer = 0.1;
      return true;
    }
    return false;
  }

  function dispose(): void {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      } else if (obj instanceof THREE.Light) {
        obj.dispose?.();
      }
    });
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  }

  return {
    group,
    obstacles,
    update,
    onPlayerHonk,
    dispose,
  };
}
