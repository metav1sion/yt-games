import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type RestaurantState,
  RESTAURANT_CENTER,
  RESTAURANT_BAY,
  CHEF_HAKKI_POS,
  CHEF_HAKKI_CALLOUTS,
} from "../game/restaurant";

export type RestaurantView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: RestaurantState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (T50)
 * - Otantik Türk Esnaf/Sanayi Lokantası:
 *   - Sıcak tuğla ve krem sıva cephe, kiremit saçak, tuğla baca
 *   - Gece PointLight aydınlatmalı marka tabelası: "🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"
 *   - Alt ürün bandı: "GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & KURU PİLAV"
 *   - Kırmızı-sarı çizgili ferforje giriş tentesi
 *   - Büyük vitrin camı ve sıcak iç aydınlatma
 *   - Paslanmaz çelik benmari sıcak yemek tezgahı (Kuru fasulye, pilav, güveç, mercimek çorbası)
 *   - Benmari üzerinden yükselen canlı yemek buharı partikülleri
 *   - Döner ocağı: Akkor parlayan dikey rezistanslar, dönen yaprak döner eti ve paslanmaz çelik davlumbaz
 *   - Açık hava yemek masaları, kırmızı pötikare masa örtüleri, ekmek sepetleri ve kürdanlıklar
 *   - A-frame karataş menü şövalesi ("🍲 Kuru Fasulye & Pilav: 25₺ | 🥩 Döner: 35₺ | 🥣 Çorba: 15₺")
 *   - Cam kapaklı retro ayran/meşrubat dolabı
 *   - Oyuncu kargo yanaşma peronu (RESTAURANT_BAY: X: 30.0, Z: -52.5), sarı-siyah bordür çizgileri ve yön oku
 * - Animasyonlu Aşçı NPC — "Aşçı Hakkı Usta" (X: 28.5, Z: -54.5):
 *   - Yüksek beyaz aşçı kepi, çift düğmeli aşçı ceketi, kırmızı fular, beyaz önlük, pala bıyık
 *   - Elinde paslanmaz çelik döner bıçağı, ritmik kesim ve selamlama animasyonu
 *   - Oyuncu aracına yönelen baş/gövde takibi (head tracking) ve 3D konuşma balonu
 */
export function createRestaurantView(): RestaurantView {
  const group = new THREE.Group();
  group.name = "restaurant-view";

  const obstacles: Rect[] = [];

  const originX = RESTAURANT_CENTER.x; // 30.0
  const originZ = RESTAURANT_CENTER.z; // -57.0

  // =========================================================================
  // 1. OYUNCU SERVİS PERONU & ZEMİN ÇİZGİLERİ
  // =========================================================================
  const bayX = RESTAURANT_BAY.x; // 30.0
  const bayZ = RESTAURANT_BAY.z; // -52.5

  // Kaldırım ve servis yanaşma asfalt tablası (Z=-50 bulvarının kuzey cebi)
  box(group, [11.5, 0.08, 9.0], [originX, 0.04, originZ + 2.0], "#7f8c8d"); // Beton veranda zemin
  box(group, [5.2, 0.09, 3.2], [bayX, 0.045, bayZ], "#5d6d7e"); // Park cebi asfaltı

  // Yanaşma peronu sarı-beyaz park sınır çizgileri
  box(group, [5.0, 0.015, 0.12], [bayX, 0.06, bayZ + 1.5], "#ffffff");
  box(group, [5.0, 0.015, 0.12], [bayX, 0.06, bayZ - 1.5], "#ffffff");
  box(group, [0.12, 0.015, 3.0], [bayX - 2.5, 0.06, bayZ], "#ffffff");
  box(group, [0.12, 0.015, 3.0], [bayX + 2.5, 0.06, bayZ], "#ffffff");

  // Zemin sarı-siyah bordür emniyet çizgileri (Sanayi tarzı)
  for (let bx = -2.2; bx <= 2.2; bx += 0.8) {
    box(group, [0.35, 0.016, 0.14], [bayX + bx, 0.062, bayZ - 1.58], "#f1c40f");
    box(group, [0.35, 0.016, 0.14], [bayX + bx + 0.4, 0.062, bayZ - 1.58], "#2c3e50");
  }

  // Zemin beyaz kılavuz yön oku
  box(group, [0.26, 0.015, 1.2], [bayX, 0.061, bayZ], "#ffffff");
  box(group, [0.75, 0.015, 0.26], [bayX, 0.061, bayZ + 0.45], "#ffffff");

  // =========================================================================
  // 2. GELENEKSEL SANAYİ ESNAF LOKANTASI BİNASI
  // =========================================================================
  const bldgWidth = 9.2;
  const bldgHeight = 4.2;
  const bldgDepth = 5.2;
  const bldgZ = originZ - 1.0; // -58.0

  // Tuğla süpürgelik kaidesi
  box(group, [bldgWidth + 0.3, 0.7, bldgDepth + 0.3], [originX, 0.35, bldgZ], "#9c3d23");

  // Ana bina gövdesi (Sıcak krem sıva cephe)
  box(group, [bldgWidth, bldgHeight - 0.7, bldgDepth], [originX, 0.7 + (bldgHeight - 0.7) / 2, bldgZ], "#fdfbf7");

  // Ahşap saçak ve friz bandı
  box(group, [bldgWidth + 0.4, 0.3, bldgDepth + 0.4], [originX, bldgHeight + 0.15, bldgZ], "#5d4037");

  // Alaturka kiremit çatı (Terracotta kırma çatı)
  box(group, [bldgWidth + 0.8, 0.4, bldgDepth + 0.8], [originX, bldgHeight + 0.45, bldgZ], "#b03a2e");
  box(group, [bldgWidth - 1.0, 0.6, bldgDepth - 0.8], [originX, bldgHeight + 0.85, bldgZ], "#962d22");

  // Tuğla havalandırma bacası ve metal yağmur şapkası
  box(group, [0.7, 1.4, 0.7], [originX + 3.2, bldgHeight + 1.2, bldgZ - 1.2], "#9c3d23");
  box(group, [0.9, 0.1, 0.9], [originX + 3.2, bldgHeight + 1.95, bldgZ - 1.2], "#34495e");

  // Ana bina çarpışma engeli
  obstacles.push({
    minX: originX - bldgWidth / 2 - 0.3,
    maxX: originX + bldgWidth / 2 + 0.3,
    minZ: bldgZ - bldgDepth / 2 - 0.3,
    maxZ: bldgZ + bldgDepth / 2 + 0.2, // ~ -55.2
  });

  // =========================================================================
  // 3. AYDINLATMALI MARKA TABELASI & ÇİFT ŞERİT
  // =========================================================================
  const marqueeGroup = new THREE.Group();
  marqueeGroup.position.set(originX, bldgHeight + 1.25, bldgZ + bldgDepth / 2 + 0.15);
  marqueeGroup.rotation.x = -0.22; // Kameraya doğru eğimli ve belirgin görünürlük

  // Tabela arkalığı ve altın çerçevesi
  box(marqueeGroup, [7.6, 1.05, 0.12], [0, 0, 0], "#1c2833");
  box(marqueeGroup, [7.7, 1.12, 0.08], [0, 0, -0.02], "#f39c12");

  // Üst marka levhası
  const mainSign = label("🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩", "#ffffff", "#c0392b");
  mainSign.scale.set(6.8, 0.65, 1);
  mainSign.position.set(0, 0.14, 0.08);
  marqueeGroup.add(mainSign);

  // Alt menü şeridi
  const subSign = label("GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & PİLAV", "#ffffff", "#d35400");
  subSign.scale.set(6.2, 0.26, 1);
  subSign.position.set(0, -0.28, 0.08);
  marqueeGroup.add(subSign);

  // Gece tabela spot ışığı
  const signLight = new THREE.PointLight("#ffea88", 0.65, 8.0);
  signLight.position.set(0, 0.3, 0.9);
  marqueeGroup.add(signLight);

  group.add(marqueeGroup);

  // =========================================================================
  // 4. KIRMIZI-SARI ÇİZGİLİ ESNAF TENTESİ (AWNING)
  // =========================================================================
  const awningGroup = new THREE.Group();
  awningGroup.position.set(originX, 3.1, bldgZ + bldgDepth / 2 + 0.1);

  // 12 derece öne eğimli kumaş tente şeritleri
  const awningMatRed = new THREE.MeshStandardMaterial({ color: "#c0392b", roughness: 0.65 });
  const awningMatYellow = new THREE.MeshStandardMaterial({ color: "#f1c40f", roughness: 0.65 });
  const numStripes = 14;
  const stripeWidth = 8.2 / numStripes;

  for (let s = 0; s < numStripes; s++) {
    const sx = -4.1 + s * stripeWidth + stripeWidth / 2;
    const sMat = s % 2 === 0 ? awningMatRed : awningMatYellow;
    const stripeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stripeWidth * 0.96, 0.04, 1.65),
      sMat,
    );
    stripeMesh.position.set(sx, -0.16, 0.82);
    stripeMesh.rotation.x = 0.2; // Öne tatlı bir eğim
    awningGroup.add(stripeMesh);

    // Dalgalı fırfırlı ön saçak (Valance fringe)
    const fringeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stripeWidth * 0.96, 0.22, 0.03),
      sMat,
    );
    fringeMesh.position.set(sx, -0.42, 1.62);
    awningGroup.add(fringeMesh);
  }

  // Tente taşıyıcı siyah çelik sütunlar
  cylinder(awningGroup, 0.045, 0.045, 2.6, [-3.9, -1.35, 1.6], "#2c3e50");
  cylinder(awningGroup, 0.045, 0.045, 2.6, [3.9, -1.35, 1.6], "#2c3e50");

  group.add(awningGroup);

  // =========================================================================
  // 5. BÜYÜK VİTRİN CAMI & İÇ AYDINLATMA
  // =========================================================================
  const facadeZ = bldgZ + bldgDepth / 2 + 0.02;

  // Vitrin çerçevesi ve camı
  box(group, [4.8, 2.2, 0.12], [originX + 0.8, 1.9, facadeZ], "#2c3e50");
  const winMat = new THREE.MeshStandardMaterial({
    color: "#f9e79f",
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.75,
  });
  const winMesh = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.9, 0.08), winMat);
  winMesh.position.set(originX + 0.8, 1.9, facadeZ + 0.02);
  group.add(winMesh);

  // Çift kanatlı lokanta giriş kapısı
  box(group, [1.8, 2.5, 0.1], [originX - 2.8, 1.35, facadeZ], "#5d4037");
  box(group, [0.6, 1.0, 0.04], [originX - 3.2, 1.7, facadeZ + 0.04], "#d6dbdf");
  box(group, [0.6, 1.0, 0.04], [originX - 2.4, 1.7, facadeZ + 0.04], "#d6dbdf");
  cylinder(group, 0.025, 0.025, 0.4, [originX - 2.85, 1.25, facadeZ + 0.08], "#f39c12"); // Pirinç kapı kolu

  // İç aydınlatma PointLight (Sıcak samimi lokanta ışığı)
  const interiorLight = new THREE.PointLight("#ffda79", 0.85, 6.5);
  interiorLight.position.set(originX + 0.5, 2.2, bldgZ + 1.2);
  group.add(interiorLight);

  // =========================================================================
  // 6. PASLANMAZ ÇELİK BENMARİ SICAK YEMEK TEZGAHI
  // =========================================================================
  const counterX = originX + 0.6;
  const counterZ = facadeZ + 0.55; // -54.85
  const counterY = 0.9;

  // Paslanmaz çelik tezgah gövdesi
  box(group, [3.4, 0.85, 0.95], [counterX, counterY / 2, counterZ], "#95a5a6");
  box(group, [3.5, 0.08, 1.05], [counterX, counterY, counterZ], "#bdc3c7"); // Çelik üst tabla

  // Şeffaf pleksi hijyen vitrini (Sneeze guard)
  box(group, [3.3, 0.45, 0.04], [counterX, counterY + 0.28, counterZ + 0.46], "#e8f8f5");
  box(group, [3.3, 0.04, 0.42], [counterX, counterY + 0.52, counterZ + 0.25], "#e8f8f5");

  // 4 Adet Gastro-Norm (GN) Sıcak Yemek Küveti
  const panWidth = 0.72;
  const panDepth = 0.55;
  const pans = [
    { name: "Pirinç Pilavı", xOff: -1.15, color: "#fef9e7", detailColor: "#d7ccc8" },
    { name: "Kuru Fasulye", xOff: -0.38, color: "#c0392b", detailColor: "#fdfefe" },
    { name: "Kuzu Güveç", xOff: 0.38, color: "#6e2c00", detailColor: "#d35400" },
    { name: "Mercimek Çorba", xOff: 1.15, color: "#f39c12", detailColor: "#e74c3c" },
  ];

  const steamPuffs: THREE.Mesh[] = [];

  for (const pan of pans) {
    const px = counterX + pan.xOff;
    // Çelik küvet çerçevesi
    box(group, [panWidth, 0.04, panDepth], [px, counterY + 0.03, counterZ - 0.06], "#7f8c8d");
    // Yemek yüzeyi
    box(group, [panWidth - 0.06, 0.03, panDepth - 0.06], [px, counterY + 0.04, counterZ - 0.06], pan.color);

    // Yemek süsü (biber/tereyağı/şehriye)
    box(group, [0.22, 0.02, 0.22], [px, counterY + 0.055, counterZ - 0.06], pan.detailColor);

    // Her küvetten yükselen canlı yemek buharı partikülü (Steam puff)
    const steamMat = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.28,
    });
    const steamMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), steamMat);
    steamMesh.position.set(px, counterY + 0.25, counterZ - 0.06);
    group.add(steamMesh);
    steamPuffs.push(steamMesh);
  }

  // =========================================================================
  // 7. DÖNER OCAĞI & DÖNEN YAPRAK DÖNER ETİ (VERTICAL DÖNER SPIT)
  // =========================================================================
  const donerX = originX - 1.8;
  const donerZ = facadeZ + 0.55; // -54.85
  const donerY = 0.9;

  // Döner tezgahı kaidesi
  box(group, [1.1, 0.85, 0.95], [donerX, donerY / 2, donerZ], "#7f8c8d");
  box(group, [1.15, 0.08, 1.0], [donerX, donerY, donerZ], "#bdc3c7");

  // Paslanmaz çelik arka panel ve davlumbaz (Ocak arkalığı)
  box(group, [0.8, 1.35, 0.1], [donerX, donerY + 0.7, donerZ - 0.35], "#7f8c8d");
  box(group, [0.85, 0.2, 0.65], [donerX, donerY + 1.45, donerZ - 0.1], "#95a5a6"); // Davlumbaz tavan

  // Akkor parlayan dikey kızılötesi rezistanslar (Vertical heating elements)
  const heaterMat = new THREE.MeshBasicMaterial({ color: "#e74c3c" });
  for (let r = 0; r < 3; r++) {
    const rz = donerZ - 0.28;
    const ry = donerY + 0.35 + r * 0.32;
    const heater = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.04), heaterMat);
    heater.position.set(donerX, ry, rz);
    group.add(heater);
  }

  // Dönen Döner Şaftı & Yaprak Döner Eti Grubu
  const donerGroup = new THREE.Group();
  donerGroup.position.set(donerX, donerY + 0.1, donerZ);

  // Dikey çelik döner şişi
  cylinder(donerGroup, 0.02, 0.02, 1.25, [0, 0.6, 0], "#ecf0f1");

  // Döner eti (Ters konik/silindirik katmanlı marine yaprak döner eti)
  const meatMat = new THREE.MeshStandardMaterial({
    color: "#5b3726",
    roughness: 0.85,
  });
  const meatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 8), meatMat);
  meatTop.position.set(0, 0.75, 0);
  donerGroup.add(meatTop);

  const meatMid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.38, 8), meatMat);
  meatMid.position.set(0, 0.38, 0);
  donerGroup.add(meatMid);

  // Dönerin tepesine batırılmış domates ve soğan
  cylinder(donerGroup, 0.09, 0.09, 0.08, [0, 0.98, 0], "#c0392b"); // Domates
  cylinder(donerGroup, 0.07, 0.07, 0.06, [0, 1.05, 0], "#f5eef8"); // Soğan

  // Döner tepsisine dökülmüş nar gibi kızarmış et kırıntıları
  box(donerGroup, [0.65, 0.02, 0.55], [0, 0.02, 0], "#3e2723");

  group.add(donerGroup);

  // Döner ocağı gece/gündüz sıcak akkor ışık efekti
  const donerGlowLight = new THREE.PointLight("#ff793f", 0.75, 4.5);
  donerGlowLight.position.set(donerX, donerY + 0.6, donerZ + 0.1);
  group.add(donerGlowLight);

  // =========================================================================
  // 8. AÇIK HAVA YEMEK MASALARI & KIRMIZI PÖTİKARE ÖRTÜLER
  // =========================================================================
  function buildDiningTable(tx: number, tz: number) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(tx, 0, tz);

    // Döküm ayak ve masa tablası
    cylinder(tableGroup, 0.04, 0.04, 0.75, [0, 0.38, 0], "#2c3e50");
    cylinder(tableGroup, 0.28, 0.28, 0.04, [0, 0.02, 0], "#2c3e50"); // Taban kaide
    box(tableGroup, [1.3, 0.05, 1.3], [0, 0.76, 0], "#ffffff");

    // Kırmızı pötikare masa örtüsü (Checkered pattern)
    box(tableGroup, [1.32, 0.052, 1.32], [0, 0.765, 0], "#c0392b");
    box(tableGroup, [0.6, 0.054, 0.6], [0, 0.77, 0], "#ffffff");

    // Masa üstü donatıları: Ekmek sepeti ve tuzluk/biberlik
    box(tableGroup, [0.35, 0.08, 0.25], [-0.3, 0.83, -0.2], "#d35400"); // Ahşap sepet
    box(tableGroup, [0.32, 0.06, 0.22], [-0.3, 0.89, -0.2], "#fcf3cf"); // Dilim ekmekler
    cylinder(tableGroup, 0.03, 0.03, 0.09, [0.35, 0.82, 0.1], "#bdc3c7"); // Cam tuzluk
    cylinder(tableGroup, 0.025, 0.025, 0.08, [0.35, 0.81, 0.22], "#95a5a6"); // Kürdanlık

    // 2 Adet bistro sandalye
    function buildChair(cx: number, cz: number, rotY: number) {
      const cg = new THREE.Group();
      cg.position.set(cx, 0, cz);
      cg.rotation.y = rotY;
      cylinder(cg, 0.02, 0.02, 0.45, [-0.18, 0.22, -0.18], "#34495e");
      cylinder(cg, 0.02, 0.02, 0.45, [0.18, 0.22, -0.18], "#34495e");
      cylinder(cg, 0.02, 0.02, 0.45, [-0.18, 0.22, 0.18], "#34495e");
      cylinder(cg, 0.02, 0.02, 0.45, [0.18, 0.22, 0.18], "#34495e");
      box(cg, [0.42, 0.04, 0.42], [0, 0.45, 0], "#2c3e50"); // Oturak
      box(cg, [0.42, 0.42, 0.03], [0, 0.68, -0.19], "#2c3e50"); // Sırtlık
      tableGroup.add(cg);
    }

    buildChair(-0.75, 0, Math.PI / 2);
    buildChair(0.75, 0, -Math.PI / 2);

    group.add(tableGroup);
  }

  // 2 Açık hava yemek masası (Veranda doğu kanadında, yoldan güvenli mesafede)
  buildDiningTable(originX + 3.8, facadeZ + 1.2); // X: 33.8, Z: -54.2
  buildDiningTable(originX + 3.8, facadeZ + 2.8); // X: 33.8, Z: -52.6

  // =========================================================================
  // 9. A-FRAME KARATAŞ MENÜ ŞÖVALESİ & MEŞRUBAT DOLABI
  // =========================================================================
  // A-Frame Karataş Menü (X: 25.5, Z: -53.2)
  const menuEasel = new THREE.Group();
  menuEasel.position.set(originX - 4.5, 0, facadeZ + 1.8);
  box(menuEasel, [0.04, 1.2, 0.04], [-0.42, 0.6, 0.2], "#5d4037");
  box(menuEasel, [0.04, 1.2, 0.04], [0.42, 0.6, 0.2], "#5d4037");
  box(menuEasel, [0.04, 1.15, 0.04], [0, 0.58, -0.28], "#5d4037"); // Arka ayak

  // Kara tahta yüzeyi ve tebeşir menü
  box(menuEasel, [0.85, 0.95, 0.04], [0, 0.68, 0.18], "#1c2833");
  const menuLabel = label("GÜNÜN TABLDOTU\nKURU PİLAV 25₺\nYAPRAK DÖNER 35₺\nMERCİMEK 15₺", "#fcf3cf", "#1c2833");
  menuLabel.scale.set(0.75, 0.72, 1);
  menuLabel.position.set(0, 0.68, 0.21);
  menuEasel.add(menuLabel);
  group.add(menuEasel);

  // Retro Ayran & Meşrubat Dolabı (X: 25.0, Z: -55.0)
  const coolerGroup = new THREE.Group();
  coolerGroup.position.set(originX - 4.2, 0, facadeZ + 0.4);
  box(coolerGroup, [0.85, 1.75, 0.65], [0, 0.88, 0], "#c0392b"); // Kırmızı gövde
  box(coolerGroup, [0.72, 1.35, 0.04], [0, 0.88, 0.33], "#d6eaf8"); // Cam kapak
  // Cam içi ayran ve gazoz şişeleri
  box(coolerGroup, [0.65, 0.12, 0.45], [0, 1.15, 0.05], "#ffffff"); // Ayranlar
  box(coolerGroup, [0.65, 0.12, 0.45], [0, 0.65, 0.05], "#27ae60"); // Yeşil gazozlar
  const coolerSign = label("BUZ GİBİ AYRAN", "#ffffff", "#2980b9");
  coolerSign.scale.set(0.7, 0.18, 1);
  coolerSign.position.set(0, 1.62, 0.34);
  coolerGroup.add(coolerSign);
  group.add(coolerGroup);

  // =========================================================================
  // 10. ANİMASYONLU AŞÇI NPC — "AŞÇI HAKKI USTA"
  // =========================================================================
  const chefGroup = new THREE.Group();
  chefGroup.position.set(CHEF_HAKKI_POS.x, 0, CHEF_HAKKI_POS.z); // X: 28.5, Z: -53.6
  chefGroup.scale.set(1.15, 1.15, 1.15); // Belirgin ve net görünürlük

  // Bacaklar (Siyah kumaş pantolon)
  cylinder(chefGroup, 0.1, 0.1, 0.75, [-0.16, 0.38, 0], "#1c2833");
  cylinder(chefGroup, 0.1, 0.1, 0.75, [0.16, 0.38, 0], "#1c2833");
  box(chefGroup, [0.16, 0.12, 0.26], [-0.16, 0.06, 0.05], "#000000"); // Ayakkabılar
  box(chefGroup, [0.16, 0.12, 0.26], [0.16, 0.06, 0.05], "#000000");

  // Üst Gövde (Gövde + Kafa grubu head tracking için)
  const chefTorsoGroup = new THREE.Group();
  chefTorsoGroup.position.set(0, 0.75, 0);

  // Çift düğmeli beyaz aşçı ceketi
  box(chefTorsoGroup, [0.54, 0.65, 0.34], [0, 0.32, 0], "#ffffff");
  box(chefTorsoGroup, [0.46, 0.6, 0.04], [0, 0.25, 0.18], "#fdfefe"); // Önlük

  // Kırmızı aşçı boyun fuları (Neckerchief)
  box(chefTorsoGroup, [0.28, 0.1, 0.28], [0, 0.66, 0], "#c0392b");

  // Çift sıra siyah ceket düğmeleri
  for (let b = 0; b < 3; b++) {
    cylinder(chefTorsoGroup, 0.018, 0.018, 0.02, [-0.1, 0.22 + b * 0.14, 0.18], "#1c2833");
    cylinder(chefTorsoGroup, 0.018, 0.018, 0.02, [0.1, 0.22 + b * 0.14, 0.18], "#1c2833");
  }

  // Sol Kol (Belinde veya tezgaha dayalı)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.32, 0.55, 0);
  cylinder(leftArm, 0.07, 0.07, 0.5, [0, -0.22, 0.08], "#ffffff");
  box(leftArm, [0.1, 0.1, 0.1], [0, -0.48, 0.12], "#f5cba7");
  chefTorsoGroup.add(leftArm);

  // Sağ Kol (Döner Bıçağı tutan ve ritmik kesim yapan kol)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 0.55, 0);

  const rightArmMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.48),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  rightArmMesh.position.set(0, -0.22, 0);
  rightArmPivot.add(rightArmMesh);

  // Aşçı Eli
  const rightHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
    new THREE.MeshStandardMaterial({ color: "#f5cba7" }),
  );
  rightHand.position.set(0, -0.48, 0.05);
  rightArmPivot.add(rightHand);

  // Paslanmaz Çelik Uzun Döner Bıçağı (Carving Knife)
  const knifeGroup = new THREE.Group();
  knifeGroup.position.set(0, -0.52, 0.12);
  knifeGroup.rotation.x = Math.PI / 4;

  box(knifeGroup, [0.04, 0.14, 0.04], [0, -0.06, 0], "#5d4037"); // Ahşap kabza
  box(knifeGroup, [0.06, 0.02, 0.06], [0, 0.01, 0], "#bdc3c7"); // Pirinç balçak
  box(knifeGroup, [0.025, 0.55, 0.08], [0, 0.28, 0.02], "#ecf0f1"); // Çelik bıçak namlusu

  rightArmPivot.add(knifeGroup);
  chefTorsoGroup.add(rightArmPivot);

  // Kafa Grubu (Baş, yüz, bıyık ve aşçı kepi)
  const chefHeadGroup = new THREE.Group();
  chefHeadGroup.position.set(0, 0.78, 0);

  // Yüz / Baş
  box(chefHeadGroup, [0.32, 0.32, 0.32], [0, 0.16, 0], "#f5cba7");

  // Kara gözler
  box(chefHeadGroup, [0.05, 0.05, 0.02], [-0.08, 0.19, 0.165], "#1c2833");
  box(chefHeadGroup, [0.05, 0.05, 0.02], [0.08, 0.19, 0.165], "#1c2833");

  // Meşhur Türk Esnaf Aşçısı Pala Bıyığı!
  box(chefHeadGroup, [0.24, 0.08, 0.08], [0, 0.1, 0.18], "#2c3e50");
  box(chefHeadGroup, [0.32, 0.05, 0.06], [0, 0.11, 0.17], "#2c3e50"); // Bıyık kıvrımları

  // İkonik Büyük Beyaz Aşçı Kepi (Chef's Toque Hat)
  cylinder(chefHeadGroup, 0.18, 0.18, 0.12, [0, 0.35, 0], "#ffffff"); // Kep alt bandı
  cylinder(chefHeadGroup, 0.28, 0.22, 0.35, [0, 0.56, 0], "#fdfefe"); // Bombeli üst kısım

  chefTorsoGroup.add(chefHeadGroup);
  chefGroup.add(chefTorsoGroup);

  // 3D Konuşma Balonu Grubu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.5, 0.25);
  bubbleGroup.visible = false;
  chefGroup.add(bubbleGroup);

  group.add(chefGroup);

  // =========================================================================
  // GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let animTime = 0;
  let currentCallout = "";

  function update(
    dt: number,
    state: RestaurantState,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ) {
    animTime += dt;

    // 1. Döner ocağı yaprak döner etinin sürekli dönüşü
    donerGroup.rotation.y = state.spitRotation;

    // 2. Akkor döner ışığı hafif ısı titreşimi (Heat shimmer)
    donerGlowLight.intensity = 0.7 + Math.sin(animTime * 6.0) * 0.12;

    // 3. Sıcak sulu yemek küvetlerinden yükselen buhar partikülleri
    for (let i = 0; i < steamPuffs.length; i++) {
      const sp = steamPuffs[i];
      const cycle = (animTime * 1.5 + i * 0.4) % 1.0;
      sp.position.y = counterY + 0.15 + cycle * 0.45;
      const sScale = 0.8 + cycle * 0.9;
      sp.scale.set(sScale, sScale, sScale);
      (sp.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - cycle) * 0.32);
    }

    // 4. Aşçı Hakkı Usta kol animasyonu
    if (state.honkGreetingTimer > 0) {
      // Coşkulu el sallama
      rightArmPivot.rotation.x = -Math.PI * 0.65 + Math.sin(animTime * 10) * 0.35;
      rightArmPivot.rotation.z = Math.sin(animTime * 8) * 0.25;
    } else {
      // Döner kesme veya tezgah üzerinde ritmik çalışma hareketi
      rightArmPivot.rotation.x = -Math.PI * 0.25 + Math.sin(animTime * 3.5) * 0.18;
      rightArmPivot.rotation.z = 0.05;
    }

    // 5. Oyuncu aracına baş/gövde takibi (Head tracking - 20 metre içinde)
    if (playerPos) {
      const dx = playerPos.x - chefGroup.position.x;
      const dz = playerPos.z - chefGroup.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 20.0) {
        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - chefGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        chefGroup.rotation.y += diff * Math.min(1, dt * 4.5);
      }
    }

    // 6. Konuşma balonu güncellemesi
    if (state.honkGreetingTimer > 0 && state.lastHonkCallout) {
      bubbleGroup.visible = true;
      if (currentCallout !== state.lastHonkCallout) {
        currentCallout = state.lastHonkCallout;
        while (bubbleGroup.children.length > 0) {
          const c = bubbleGroup.children[0];
          bubbleGroup.remove(c);
          if (c instanceof THREE.Mesh) {
            c.geometry.dispose();
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material.dispose();
          }
        }
        const newLabel = label(state.lastHonkCallout, "#ffffff", "#c0392b");
        newLabel.scale.set(5.6, 0.75, 1);
        newLabel.rotation.x = -0.25;
        bubbleGroup.add(newLabel);
      }
    } else {
      bubbleGroup.visible = false;
      currentCallout = "";
    }

    // 7. Gece ve alacakaranlık aydınlatma şiddeti ayarı
    if (isNightOrDusk) {
      signLight.intensity = 1.35;
      interiorLight.intensity = 1.6;
      donerGlowLight.intensity = 1.25;
    } else {
      signLight.intensity = 0.55;
      interiorLight.intensity = 0.85;
      donerGlowLight.intensity = 0.75;
    }
  }

  function onPlayerHonk(playerPos: Vec2): boolean {
    const dist = Math.hypot(
      playerPos.x - CHEF_HAKKI_POS.x,
      playerPos.z - CHEF_HAKKI_POS.z,
    );
    return dist <= 24.0;
  }

  function dispose() {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  return {
    group,
    obstacles,
    update,
    onPlayerHonk,
    dispose,
  };
}
