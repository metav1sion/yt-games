import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type GroceryStoreState,
  GROCERY_STORE_CENTER,
  GROCERY_STORE_BAY,
  GROCER_HUSNU_POS,
  GROCER_HUSNU_CALLOUTS,
} from "../game/grocery-store";

export type GroceryStoreView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: GroceryStoreState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Güneş Mahallesi "Bizim Bakkal" Mahalle Bakkaliyesi & Ekmek/Gazete Tezgahı (T47)
 * - Geleneksel Türk mahalle bakkaliyesi mimarisi: pastel sarı/krem cephe, kiremit saçak, döküm köşe çıtaları
 * - Çizgili kırmızı-beyaz nostaljik tente (awning) ve vitrin gölgeliği
 * - "🏪 BİZİM BAKKAL · HÜSNÜ AMCA 🥖" aydınlatmalı çatı tabelası ve gece ışıklandırması
 * - Sıcak sarı iç aydınlatmalı vitrin camı ve rengarenk bakkal rafları silüeti
 * - Kaldırımda taze ekmek ve simit dolabı, döner gazete-mecmua tel standı, meyve-sebze kasaları
 * - Karataş menü tabelası (A-frame chalkboard), retro kırmızı meşrubat dolabı ve mermer sokak çeşmesi
 * - Kulağının arkasında kurşun kalemli, kafa takipli ve konuşma balonlu Bakkal Hüsnü Amca NPC
 * - "Bakkal Molası" servis yanaşma alanı ve zemin kılavuz çizgileri
 */
export function createGroceryStoreView(): GroceryStoreView {
  const group = new THREE.Group();
  group.name = "grocery-store-view";

  const obstacles: Rect[] = [];

  const originX = GROCERY_STORE_CENTER.x; // -58.5
  const originZ = GROCERY_STORE_CENTER.z; // -57.0

  // =========================================================================
  // 1. BAKKAL KALDIRIM TABANI & YANAŞMA PERONU (Sidewalk Apron & Service Stall)
  // =========================================================================
  const apronW = 10.6;
  const apronD = 7.6;
  const apronZ = originZ + 0.3; // -56.7

  // Ana pişmiş toprak ve kireçtaşı kaldırım betonu
  box(group, [apronW, 0.08, apronD], [originX, 0.04, apronZ], "#dfd7c5");
  // Ön veranda yürüyüş ve sergi döşemesi (kiremit renkli karo zemin)
  box(group, [apronW - 0.4, 0.09, 3.4], [originX, 0.045, originZ + 1.8], "#d35400");

  // Kaldırım taş bordürleri
  box(group, [apronW, 0.12, 0.22], [originX, 0.06, apronZ + apronD / 2 - 0.11], "#95a5a6");
  box(group, [0.22, 0.12, apronD], [originX - apronW / 2 + 0.11, 0.06, apronZ], "#95a5a6");
  box(group, [0.22, 0.12, apronD], [originX + apronW / 2 - 0.11, 0.06, apronZ], "#95a5a6");

  // Oyuncu Yanaşma Alanı (GROCERY_STORE_BAY: X: -55.0, Z: -54.0) Beyaz/Sarı Zemin Çizgileri
  const bayX = GROCERY_STORE_BAY.x;
  const bayZ = GROCERY_STORE_BAY.z;
  box(group, [3.8, 0.015, 0.12], [bayX, 0.055, bayZ + 1.6], "#ffffff");
  box(group, [3.8, 0.015, 0.12], [bayX, 0.055, bayZ - 1.6], "#ffffff");
  box(group, [0.12, 0.015, 3.2], [bayX - 1.9, 0.055, bayZ], "#ffffff");

  // Zemin beyaz kılavuz yön oku
  box(group, [0.28, 0.015, 1.4], [bayX, 0.056, bayZ], "#ffffff");
  box(group, [0.8, 0.015, 0.28], [bayX, 0.056, bayZ - 0.55], "#ffffff");

  // =========================================================================
  // 2. ANA BAKKAL BİNASI VE ÇATI MİMARİSİ (Shop Building & Tiled Eaves)
  // =========================================================================
  const bldgW = 8.2;
  const bldgH = 4.2;
  const bldgD = 4.6;
  const bldgZ = originZ - 1.3; // -58.3

  // Ana bakkal bina gövdesi (Pastel sıcak krem rengi)
  box(group, [bldgW, bldgH, bldgD], [originX, bldgH / 2, bldgZ], "#fef9e7");
  // Alt süpürgelik tuğla kaidesi
  box(group, [bldgW + 0.1, 0.6, bldgD + 0.1], [originX, 0.3, bldgZ], "#c0392b");
  // Beyaz köşe döküm pilasterleri
  box(group, [0.35, bldgH, 0.35], [originX - bldgW / 2 + 0.17, bldgH / 2, bldgZ + bldgD / 2 - 0.17], "#ffffff");
  box(group, [0.35, bldgH, 0.35], [originX + bldgW / 2 - 0.17, bldgH / 2, bldgZ + bldgD / 2 - 0.17], "#ffffff");

  // Kiremit çatı saçağı ve parapet
  box(group, [bldgW + 0.5, 0.35, bldgD + 0.5], [originX, bldgH + 0.15, bldgZ], "#b03a2e");
  box(group, [bldgW + 0.3, 0.2, bldgD + 0.3], [originX, bldgH + 0.4, bldgZ], "#922b21");

  // Çatı üstü nostaljik tuğla baca
  box(group, [0.8, 1.2, 0.8], [originX - bldgW / 2 + 1.2, bldgH + 0.8, bldgZ - 0.8], "#c0392b");
  box(group, [0.95, 0.15, 0.95], [originX - bldgW / 2 + 1.2, bldgH + 1.45, bldgZ - 0.8], "#7b241c");

  // Üst kat panjurlu pencere (Sıcak mahalle evi hissi)
  box(group, [1.4, 1.2, 0.1], [originX - 1.8, bldgH - 0.9, bldgZ + bldgD / 2 + 0.05], "#2980b9"); // Mavi panjurlar
  box(group, [1.0, 1.0, 0.12], [originX - 1.8, bldgH - 0.9, bldgZ + bldgD / 2 + 0.06], "#f1c40f"); // Işıyan pencere
  box(group, [1.2, 0.18, 0.35], [originX - 1.8, bldgH - 1.55, bldgZ + bldgD / 2 + 0.15], "#27ae60"); // Çiçeklik saksısı
  cylinder(group, 0.12, 0.12, 0.2, [originX - 2.1, bldgH - 1.35, bldgZ + bldgD / 2 + 0.15], "#e74c3c", 8); // Kırmızı sardunya
  cylinder(group, 0.12, 0.12, 0.2, [originX - 1.5, bldgH - 1.35, bldgZ + bldgD / 2 + 0.15], "#f39c12", 8); // Sarı sardunya

  // Çatı üstü aydınlatmalı ana tabela ("🏪 BİZİM BAKKAL · HÜSNÜ AMCA 🥖")
  const marqueeSign = label("🏪 BİZİM BAKKAL · HÜSNÜ AMCA 🥖", "#ffffff", "#922b21");
  marqueeSign.scale.set(5.2, 1.2, 1);
  marqueeSign.position.set(originX, bldgH + 1.1, bldgZ + bldgD / 2 - 0.1);
  group.add(marqueeSign);

  // Alttaki ikincil ürün bandı tabelası
  const subSign = label("EKMEK · GAZETE · MANAV · SOĞUK MEŞRUBAT", "#f1c40f", "#2c3e50");
  subSign.scale.set(4.6, 0.6, 1);
  subSign.position.set(originX, 3.4, bldgZ + bldgD / 2 + 0.05);
  group.add(subSign);

  // Bina ana fiziksel engel kutusu (Collider)
  obstacles.push({
    minX: originX - bldgW / 2 - 0.1,
    maxX: originX + bldgW / 2 + 0.1,
    minZ: bldgZ - bldgD / 2 - 0.1,
    maxZ: bldgZ + bldgD / 2 + 0.1,
  });

  // =========================================================================
  // 3. VİTRİN CAMI, SICAK İÇ AYDINLATMA VE RAFLAR (Display Window & Interior)
  // =========================================================================
  const vitrinW = 3.6;
  const vitrinH = 2.0;
  const vitrinX = originX - 1.6;
  const vitrinZ = bldgZ + bldgD / 2 + 0.05;

  // Vitrin çerçevesi (Beyaz döküm profil)
  box(group, [vitrinW + 0.2, vitrinH + 0.2, 0.15], [vitrinX, 1.7, vitrinZ], "#ffffff");
  // Vitrin camı (Sıcak kehribar iç ışık yansıması)
  const windowMesh = box(group, [vitrinW, vitrinH, 0.08], [vitrinX, 1.7, vitrinZ + 0.02], "#f9e79f", 0.85);

  // İç aydınlatma ışık kaynağı (PointLight)
  const windowLight = new THREE.PointLight("#ffea88", 1.8, 10.0, 1.4);
  windowLight.position.set(vitrinX, 2.2, vitrinZ + 0.6);
  group.add(windowLight);

  // Vitrin arkası bakkal rafları ve ürün paketleri (Çay kutuları, reçeller, bakliyat)
  for (const ry of [1.1, 1.6, 2.1]) {
    box(group, [vitrinW - 0.4, 0.05, 0.2], [vitrinX, ry, vitrinZ - 0.15], "#d35400"); // Ahşap raf
    // Renkli ürün paketleri
    for (let px = vitrinX - 1.3; px <= vitrinX + 1.3; px += 0.35) {
      const pColor = px % 0.7 === 0 ? "#e74c3c" : px % 0.5 === 0 ? "#f1c40f" : "#27ae60";
      box(group, [0.22, 0.3, 0.14], [px, ry + 0.17, vitrinZ - 0.14], pColor);
    }
  }

  // Giriş Kapısı (Sağ tarafta: X = originX + 2.0)
  const doorX = originX + 2.0;
  box(group, [1.5, 2.5, 0.12], [doorX, 1.3, vitrinZ], "#2c3e50"); // Koyu ahşap kapı çerçevesi
  box(group, [1.1, 1.3, 0.08], [doorX, 1.7, vitrinZ + 0.03], "#85c1e9", 0.6); // Kapı camı
  box(group, [1.1, 0.8, 0.08], [doorX, 0.55, vitrinZ + 0.03], "#34495e"); // Alt panel
  cylinder(group, 0.035, 0.035, 0.28, [doorX + 0.45, 1.25, vitrinZ + 0.08], "#f1c40f", 8); // Pirinç kapı kolu

  // Kapı üstü pirinç bakkal çıngırağı (Door bell)
  cylinder(group, 0.08, 0.04, 0.12, [doorX, 2.65, vitrinZ + 0.12], "#f1c40f", 10);
  box(group, [0.03, 0.18, 0.15], [doorX, 2.75, vitrinZ + 0.08], "#7f8c8d");

  // =========================================================================
  // 4. ÇİZGİLİ BAKKAL TENTESİ (Nostalgic Striped Awning)
  // =========================================================================
  const awningW = 7.4;
  const awningProj = 2.2;
  const awningH = 0.5;
  const awningY = 3.0;
  const awningZ = bldgZ + bldgD / 2 + awningProj / 2 + 0.05;

  const awningGroup = new THREE.Group();
  awningGroup.position.set(originX, awningY, bldgZ + bldgD / 2);
  group.add(awningGroup);

  // Kırmızı-Beyaz çizgili kumaş tente şeritleri
  const stripeW = 0.42;
  const numStripes = Math.floor(awningW / stripeW);
  for (let i = 0; i < numStripes; i++) {
    const sx = -awningW / 2 + i * stripeW + stripeW / 2;
    const isRed = i % 2 === 0;
    const stripeMesh = box(
      awningGroup,
      [stripeW, 0.05, awningProj],
      [sx, 0, awningProj / 2],
      isRed ? "#c0392b" : "#ffffff",
    );
    stripeMesh.rotation.x = 0.22; // 12 derece öne eğim
  }

  // Tente ön saçak fırfırı (Dalgalı alt etek)
  for (let i = 0; i < numStripes; i++) {
    const sx = -awningW / 2 + i * stripeW + stripeW / 2;
    const isRed = i % 2 === 0;
    box(
      awningGroup,
      [stripeW, 0.24, 0.04],
      [sx, -0.32, awningProj - 0.05],
      isRed ? "#c0392b" : "#ffffff",
    );
  }

  // Tente taşıyıcı beyaz ferforje direkleri
  cylinder(group, 0.05, 0.05, 2.8, [originX - awningW / 2 + 0.2, 1.4, bldgZ + bldgD / 2 + awningProj - 0.1], "#ffffff", 8);
  cylinder(group, 0.05, 0.05, 2.8, [originX + awningW / 2 - 0.2, 1.4, bldgZ + bldgD / 2 + awningProj - 0.1], "#ffffff", 8);

  // =========================================================================
  // 5. KALDIRIM SERGİLERİ: EKMEK, GAZETELİK, MANAV KASALARI & MEŞRUBAT
  // =========================================================================
  // 5.1. Taze Ekmek ve Simit Dolabı (Vitrin sol önünde: X = originX - 3.2, Z = originZ + 0.8)
  const breadX = originX - 3.2;
  const breadZ = originZ + 0.8;
  box(group, [1.4, 1.6, 0.8], [breadX, 0.85, breadZ], "#c0392b"); // Kırmızı ahşap gövde
  box(group, [1.2, 1.1, 0.08], [breadX, 0.95, breadZ + 0.42], "#85c1e9", 0.5); // Cam ön kapak
  // İçi altın sarısı ekmekler ve simitler
  cylinder(group, 0.09, 0.09, 0.7, [breadX - 0.3, 0.65, breadZ], "#d4ac0d", 8); // Somun ekmek
  cylinder(group, 0.09, 0.09, 0.7, [breadX + 0.2, 0.65, breadZ], "#d4ac0d", 8);
  cylinder(group, 0.08, 0.08, 0.7, [breadX - 0.1, 1.05, breadZ], "#b7950b", 8);
  // Simit halkaları
  cylinder(group, 0.14, 0.14, 0.04, [breadX + 0.35, 1.05, breadZ], "#996515", 12);
  cylinder(group, 0.14, 0.14, 0.04, [breadX + 0.35, 1.15, breadZ], "#996515", 12);
  const breadSign = label("🥖 TAZE EKMEK", "#ffffff", "#c0392b");
  breadSign.scale.set(1.1, 0.3, 1);
  breadSign.position.set(breadX, 1.8, breadZ + 0.4);
  group.add(breadSign);

  // 5.2. Döner Tel Gazete & Mecmua Standı (X = originX - 1.8, Z = originZ + 1.2)
  const newsX = originX - 1.8;
  const newsZ = originZ + 1.2;
  cylinder(group, 0.22, 0.22, 0.06, [newsX, 0.08, newsZ], "#7f8c8d", 12); // Döküm ayak
  cylinder(group, 0.035, 0.035, 1.4, [newsX, 0.75, newsZ], "#bdc3c7", 8); // Orta boru
  // Tel gazete cepleri ve sergilenen gazeteler
  for (const ny of [0.55, 0.9, 1.25]) {
    box(group, [0.55, 0.03, 0.35], [newsX, ny, newsZ], "#95a5a6"); // Tel ızgara
    // Gazeteler (Beyaz/Siyah manşetli)
    box(group, [0.45, 0.32, 0.04], [newsX, ny + 0.16, newsZ + 0.15], "#f5f6fa");
    box(group, [0.42, 0.06, 0.05], [newsX, ny + 0.26, newsZ + 0.16], "#c0392b"); // Kırmızı manşet bandı
    box(group, [0.45, 0.32, 0.04], [newsX, ny + 0.16, newsZ - 0.15], "#f5f6fa");
  }

  // 5.3. Eğimli Ahşap Manav Kasaları (X = originX - 0.4, Z = originZ + 1.0)
  const crateStandX = originX - 0.4;
  const crateStandZ = originZ + 1.0;
  // Metal stant iskeleti
  box(group, [1.8, 0.45, 0.7], [crateStandX, 0.28, crateStandZ], "#2c3e50");
  // 1. Kasa: Kırmızı Elmalar
  const crate1 = box(group, [0.52, 0.24, 0.42], [crateStandX - 0.55, 0.55, crateStandZ], "#b9770e");
  crate1.rotation.x = 0.25;
  for (let i = -0.15; i <= 0.15; i += 0.12) {
    cylinder(group, 0.055, 0.055, 0.08, [crateStandX - 0.55 + i, 0.68, crateStandZ], "#e74c3c", 8);
  }
  // 2. Kasa: Turuncu Portakallar
  const crate2 = box(group, [0.52, 0.24, 0.42], [crateStandX, 0.55, crateStandZ], "#b9770e");
  crate2.rotation.x = 0.25;
  for (let i = -0.15; i <= 0.15; i += 0.12) {
    cylinder(group, 0.055, 0.055, 0.08, [crateStandX + i, 0.68, crateStandZ], "#e67e22", 8);
  }
  // 3. Kasa: Taze Yeşillikler / Salatalık
  const crate3 = box(group, [0.52, 0.24, 0.42], [crateStandX + 0.55, 0.55, crateStandZ], "#b9770e");
  crate3.rotation.x = 0.25;
  for (let i = -0.15; i <= 0.15; i += 0.12) {
    cylinder(group, 0.05, 0.05, 0.09, [crateStandX + 0.55 + i, 0.68, crateStandZ], "#27ae60", 8);
  }

  // 5.4. A-Frame Karataş Menü Tabelası (X = originX + 0.9, Z = originZ + 1.5)
  const easelX = originX + 0.9;
  const easelZ = originZ + 1.5;
  const easelGroup = new THREE.Group();
  easelGroup.position.set(easelX, 0, easelZ);
  group.add(easelGroup);
  // Ahşap A-çerçeve
  const boardFront = box(easelGroup, [0.75, 0.95, 0.04], [0, 0.55, 0.18], "#2c3e50");
  boardFront.rotation.x = -0.22;
  const boardBack = box(easelGroup, [0.75, 0.95, 0.04], [0, 0.55, -0.18], "#2c3e50");
  boardBack.rotation.x = 0.22;
  // Tebeşir yazı etiketi
  const chalkSign = label("🥖 EKMEK: 8₺\n🥤 GAZOZ: 12₺\n📰 GAZETE", "#ffffff", "#2c3e50");
  chalkSign.scale.set(0.65, 0.7, 1);
  chalkSign.position.set(0, 0.58, 0.25);
  chalkSign.rotation.x = -0.22;
  easelGroup.add(chalkSign);

  // 5.5. Retro Kırmızı Meşrubat Dolabı (X = originX + 3.2, Z = originZ + 0.8)
  const fridgeX = originX + 3.2;
  const fridgeZ = originZ + 0.8;
  box(group, [1.0, 1.85, 0.8], [fridgeX, 0.95, fridgeZ], "#c0392b"); // Kırmızı kabin
  box(group, [0.85, 1.5, 0.06], [fridgeX, 0.95, fridgeZ + 0.42], "#85c1e9", 0.65); // Cam kapak
  // İçi renkli meşrubat şişeleri (Gazoz, Ayran, Kola)
  for (const fy of [0.5, 0.95, 1.4]) {
    for (let fx = fridgeX - 0.25; fx <= fridgeX + 0.25; fx += 0.25) {
      cylinder(group, 0.04, 0.04, 0.24, [fx, fy, fridgeZ], "#2ecc71", 8); // Yeşil gazoz şişeleri
    }
  }
  const fridgeSign = label("BUZ GİBİ GAZOZ", "#ffffff", "#c0392b");
  fridgeSign.scale.set(0.9, 0.22, 1);
  fridgeSign.position.set(fridgeX, 1.95, fridgeZ + 0.42);
  group.add(fridgeSign);

  // 5.6. Nostaljik Sarı PTT Posta Kutusu & Mahalle Hayrat Çeşmesi
  const postBoxX = originX + 4.2;
  const postBoxZ = originZ + 1.6;
  cylinder(group, 0.05, 0.05, 0.8, [postBoxX, 0.4, postBoxZ], "#7f8c8d", 8); // Boru ayak
  box(group, [0.45, 0.6, 0.35], [postBoxX, 1.0, postBoxZ], "#f1c40f"); // Sarı posta kutusu
  box(group, [0.25, 0.04, 0.02], [postBoxX, 1.15, postBoxZ + 0.18], "#2c3e50"); // Mektup atma yarığı

  // =========================================================================
  // 6. BAKKAL HÜSNÜ AMCA NPC (Animated Grocer Character)
  // =========================================================================
  const npcX = GROCER_HUSNU_POS.x; // -56.5
  const npcZ = GROCER_HUSNU_POS.z; // -55.0
  const npcGroup = new THREE.Group();
  npcGroup.position.set(npcX, 0, npcZ);
  group.add(npcGroup);

  // Ayaklar ve Ayakkabılar (Kahverengi deri iskarpin)
  box(npcGroup, [0.22, 0.14, 0.38], [-0.16, 0.07, 0.04], "#6e2c00");
  box(npcGroup, [0.22, 0.14, 0.38], [0.16, 0.07, 0.04], "#6e2c00");

  // Bacaklar ve Pantolon (Koyu lacivert kumaş pantolon)
  box(npcGroup, [0.2, 0.8, 0.22], [-0.16, 0.48, 0], "#2c3e50");
  box(npcGroup, [0.2, 0.8, 0.22], [0.16, 0.48, 0], "#2c3e50");

  // Gövde: Mavi gömlek ve üzerine Beyaz Bakkal Önlüğü (Grocer Apron)
  box(npcGroup, [0.55, 0.75, 0.32], [0, 1.25, 0], "#5dade2"); // Açık mavi gömlek
  box(npcGroup, [0.46, 0.65, 0.12], [0, 1.18, 0.14], "#ffffff"); // Beyaz önlük göğsü
  box(npcGroup, [0.52, 0.45, 0.12], [0, 0.8, 0.13], "#ffffff"); // Beyaz önlük alt eteği
  box(npcGroup, [0.28, 0.2, 0.03], [0, 0.82, 0.2], "#bdc3c7"); // Önlük ön cebi

  // Kollar:
  // Sol Kol (Yanında duran rahat kol)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.35, 1.5, 0);
  cylinder(leftArmGroup, 0.075, 0.075, 0.65, [0, -0.32, 0], "#5dade2", 8); // Sıvanmış kol
  cylinder(leftArmGroup, 0.065, 0.065, 0.25, [0, -0.65, 0], "#f5cba7", 8); // Ten rengi el
  npcGroup.add(leftArmGroup);

  // Sağ Kol (El sallama ve taze ekmek tutma kolu)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.35, 1.5, 0);
  cylinder(rightArmGroup, 0.075, 0.075, 0.65, [0, -0.32, 0], "#5dade2", 8);
  cylinder(rightArmGroup, 0.065, 0.065, 0.25, [0, -0.65, 0], "#f5cba7", 8);
  // Elinde tuttuğu taze francala ekmek
  const handBread = cylinder(rightArmGroup, 0.07, 0.07, 0.45, [0.08, -0.65, 0.15], "#d4ac0d", 8);
  handBread.rotation.z = Math.PI / 4;
  npcGroup.add(rightArmGroup);

  // Baş ve Yüz Grubu (Kafa takibi için döner grup)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.72, 0);
  npcGroup.add(headGroup);

  // Baş gövdesi (Ten rengi)
  cylinder(headGroup, 0.18, 0.18, 0.36, [0, 0.14, 0], "#f5cba7", 10);
  // Kırlaşmış saçlar
  box(headGroup, [0.42, 0.16, 0.42], [0, 0.3, -0.02], "#7f8c8d");
  // Sevimli pos bıyık (Gri/beyaz)
  box(headGroup, [0.24, 0.08, 0.08], [0, 0.08, 0.19], "#bdc3c7");
  // Burun
  box(headGroup, [0.07, 0.09, 0.09], [0, 0.15, 0.2], "#f0b27a");
  // Gülümseyen gözler
  cylinder(headGroup, 0.025, 0.025, 0.04, [-0.08, 0.2, 0.18], "#2c3e50", 6);
  cylinder(headGroup, 0.025, 0.025, 0.04, [0.08, 0.2, 0.18], "#2c3e50", 6);

  // İKONİK DETAY: KULAĞIN ARKASINA SIKIŞTIRILMIŞ SARI KURŞUN KALEM! ✏️
  const pencilGroup = new THREE.Group();
  pencilGroup.position.set(0.2, 0.18, 0.02);
  cylinder(pencilGroup, 0.02, 0.02, 0.28, [0, 0, 0], "#f1c40f", 6); // Sarı hekzagon kurşun kalem
  cylinder(pencilGroup, 0.022, 0.022, 0.06, [0, -0.14, 0], "#e74c3c", 6); // Kırmızı silgi başlığı
  cylinder(pencilGroup, 0.02, 0.005, 0.05, [0, 0.16, 0], "#2c3e50", 6); // Grafit sivriltilmiş uç
  pencilGroup.rotation.z = -0.35;
  pencilGroup.rotation.x = 0.2;
  headGroup.add(pencilGroup);

  // 3B Konuşma Balonu (Speech Bubble)
  const speechBubble = label(GROCER_HUSNU_CALLOUTS[0], "#1a252f", "#ffffff");
  speechBubble.scale.set(4.2, 0.9, 1);
  speechBubble.position.set(0, 2.5, 0);
  speechBubble.visible = false;
  npcGroup.add(speechBubble);

  // =========================================================================
  // 7. GÜNCELLEME, ANİMASYON VE KAFADAN TAKİP SİSTEMİ
  // =========================================================================
  let waveTimer = 0;

  function update(
    dt: number,
    state: GroceryStoreState,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ): void {
    // Gece/Gündüz vitrin ışığı ayarı
    if (isNightOrDusk) {
      windowLight.intensity = 3.2;
      windowLight.color.set("#ffe57f");
      (windowMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#f9e79f");
      (windowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.65;
    } else {
      windowLight.intensity = 1.4;
      windowLight.color.set("#ffea88");
      (windowMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#000000");
      (windowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
    }

    // Hüsnü Amca kafa takibi (oyuncu <= 18m mesafedeyse başını oyuncuya çevirir)
    if (playerPos) {
      const dx = playerPos.x - npcX;
      const dz = playerPos.z - npcZ;
      const dist = Math.hypot(dx, dz);
      if (dist < 18.0 && dist > 0.5) {
        const targetAngle = Math.atan2(dx, dz);
        // Yumuşak dönüş enterpolasyonu
        let diff = targetAngle - headGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        headGroup.rotation.y += diff * Math.min(1.0, dt * 5.0);
        // Maksimum kafa dönme açısını sınırla (-75° .. +75°)
        headGroup.rotation.y = Math.max(-1.3, Math.min(1.3, headGroup.rotation.y));
      } else {
        // Yola doğru rahatça öne bak
        headGroup.rotation.y += (0 - headGroup.rotation.y) * Math.min(1.0, dt * 3.0);
      }
    }

    // El Sallama Animasyonu (Korna çalındığında veya mola bonusu verildiğinde)
    if (state.honkGreetingTimer > 0) {
      waveTimer += dt * 8.0;
      rightArmGroup.rotation.x = -1.2 + Math.sin(waveTimer) * 0.45;
      rightArmGroup.rotation.z = 0.5 + Math.cos(waveTimer) * 0.35;

      // Konuşma balonu metnini göster
      speechBubble.visible = true;
      if (state.lastHonkCallout) {
        // Label mesh userData kontrolü
        speechBubble.scale.set(4.4, 0.95, 1);
      }
    } else {
      waveTimer = 0;
      // Normal ayakta duruş
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
