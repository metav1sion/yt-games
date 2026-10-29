import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type IceCreamStandState,
  ICE_CREAM_STAND_CENTER,
  ICE_CREAM_BAY,
  ICE_CREAM_MASTER_ALI_POS,
  VOLLEYBALL_COURT_CENTER,
  SUN_TERRACE_CENTER,
  ICE_CREAM_MASTER_ALI_CALLOUTS,
} from "../game/ice-cream-stand";

export type IceCreamStandView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: IceCreamStandState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sahil "Kordon Boyu Hakiki Maraş Dondurmacısı" & Plaj Voleybolu / Güneşlenme Terası (T49)
 * - Geleneksel Osmanlı/Maraş Kordon Dondurma Standı (Hakiki Maraş Dondurmacısı):
 *   - Bordo maun ahşap gövde, pirinç çıtalar, cilalı mermer tezgah
 *   - Çift paslanmaz çelik & pirinç soğutma kazanı (dondurma güğümleri), dondurucu duman partikülleri
 *   - Asılı dövme pirinç servis çıngırağı (Dondurmacı Çıngırağı) ve hareketli tokmak
 *   - Ters dizilmiş çıtır kornet külah kuleleri ve meyve/fıstık sos vitrini
 *   - Bordo & krem çizgili oymalı saçaklı Osmanlı tentesi ve pirinç dikmeler
 *   - Gece PointLight aydınlatmalı çatı tabelası: "🍦 HAKİKİ MARAŞ DONDURMACISI · ALİ USTA 🍨" & "BUZ GİBİ DÖVME DONDURMA · SALEP & KEÇİ SÜTÜ"
 *   - Kara tahta menü şövalesi ("🍦 Maraş Dondurması: 10₺ | 🍨 Karışık Külah: 15₺ | 🔔 Çıngırak Çalmak: Serbest")
 *   - Oyuncu kargo yanaşma peronu (X: -23.5, Z: 80.5), zemin çizgileri ve yön oku
 * - Animasyonlu Maraşlı Dondurma Ustası NPC ("Maraşlı Ali Usta" - X: -23.5, Z: 82.3):
 *   - Kırmızı Maraş fesi, siyah püskül, burma bıyık, altın sırmalı bordo cepken yelek, kuşak
 *   - 1.4m uzunluğunda çelik dondurma çubuğu (spatula) ve ucunda uzayan beyaz dövme dondurma külahı
 *   - Dinamik külah döndürme, uzatma ve şaka animasyonu (paddle trick animation)
 *   - Oyuncu aracına yönelen baş/gövde takibi (head tracking) ve 3D konuşma balonu
 * - Plaj Voleybolu Sahası (Beach Volleyball Court - X: -29.0, Z: 86.4):
 *   - İnce altın kum zemin, gergi şeritli beyaz saha sınır çizgileri ve kırmızı köşe bayrakları
 *   - Çift ahşap direk, gergi halatları, file örgüsü, beyaz üst bant ve kırmızı/beyaz antenler
 *   - Kuma düşmüş renkli plaj voleybolu topu, hakem kulesi (umpire tower) ve seyirci oturma bankı
 * - Güneşlenme Terası & Şezlong Alanı (Sun Lounger Terrace - X: -19.5, Z: 85.0):
 *   - Sedir ahşap sahil güvertesi, turkuaz-sarı çizgili yatarlı şezlonglar, rulo plaj havluları
 *   - Büyük renkli plaj şemsiyesi, hindistan cevizi içecekli bambu sehpa
 *   - Kıvrık sahil palmiyesi, asılı kehribar rengi peri fenerleri ve ahşap yön tabelası
 */
export function createIceCreamStandView(): IceCreamStandView {
  const group = new THREE.Group();
  group.name = "ice-cream-stand-view";

  const obstacles: Rect[] = [];

  const originX = ICE_CREAM_STAND_CENTER.x; // -21.0
  const originZ = ICE_CREAM_STAND_CENTER.z; // 84.4

  // =========================================================================
  // 1. KORDON YANAŞMA PERONU & ZEMİN ÇİZGİLERİ
  // =========================================================================
  const bayX = ICE_CREAM_BAY.x; // -21.0
  const bayZ = ICE_CREAM_BAY.z; // 80.5

  // Yanaşma peronu sarı-beyaz park çizgileri (Sahil yolu Z=80 üzerinde)
  box(group, [3.8, 0.015, 0.12], [bayX, 0.055, bayZ + 1.4], "#ffffff");
  box(group, [3.8, 0.015, 0.12], [bayX, 0.055, bayZ - 1.4], "#ffffff");
  box(group, [0.12, 0.015, 2.8], [bayX - 1.9, 0.055, bayZ], "#ffffff");

  // Zemin beyaz kılavuz yön oku
  box(group, [0.26, 0.015, 1.2], [bayX, 0.056, bayZ], "#ffffff");
  box(group, [0.75, 0.015, 0.26], [bayX, 0.056, bayZ - 0.45], "#ffffff");

  // Kordon Yürüyüş Yolu Taş Bordürü ve Ahşap Deck Platformu
  box(group, [4.4, 0.08, 3.0], [originX, 0.04, originZ], "#cbb296"); // Sıcak kordon kaplaması
  box(group, [4.4, 0.12, 0.2], [originX, 0.06, originZ - 1.4], "#6d4c41");
  box(group, [4.4, 0.12, 0.2], [originX, 0.06, originZ + 1.4], "#6d4c41");
  box(group, [0.2, 0.12, 3.0], [originX - 2.1, 0.06, originZ], "#6d4c41");
  box(group, [0.2, 0.12, 3.0], [originX + 2.1, 0.06, originZ], "#6d4c41");

  // =========================================================================
  // 2. HAKİKİ MARAŞ DONDURMACISI KİOSK MİMARİSİ
  // =========================================================================
  const kioskX = originX;
  const kioskZ = originZ + 0.3; // 84.7
  const kioskW = 3.2;
  const kioskH = 2.4;
  const kioskD = 1.6;

  // Ana maun ahşap tezgah gövdesi
  box(group, [kioskW, 1.05, kioskD], [kioskX, 0.52, kioskZ], "#4a151b");
  // Alt süpürgelik pirinç çıtası
  box(group, [kioskW + 0.06, 0.15, kioskD + 0.06], [kioskX, 0.08, kioskZ], "#d4ac0d");
  // Parlak beyaz damarlı mermer tezgah üstü
  box(group, [kioskW + 0.18, 0.1, kioskD + 0.18], [kioskX, 1.08, kioskZ], "#eaecee");

  // Tezgah ön cephe pirinç süs çıtaları & Osmanlı yıldız panelleri
  for (const dx of [-1.1, 0, 1.1]) {
    box(group, [0.75, 0.65, 0.04], [kioskX + dx, 0.55, kioskZ - kioskD / 2 - 0.02], "#641e16");
    box(group, [0.15, 0.15, 0.05], [kioskX + dx, 0.55, kioskZ - kioskD / 2 - 0.03], "#f1c40f"); // Yıldız motifi
  }

  // Kiosk arka servis duvarı ve dolapları
  box(group, [kioskW, 1.4, 0.2], [kioskX, 1.75, kioskZ + kioskD / 2 - 0.1], "#5b2c2f");
  box(group, [kioskW - 0.4, 0.06, 0.3], [kioskX, 1.6, kioskZ + kioskD / 2 - 0.25], "#d4ac0d"); // Külah rafı

  // Çift Dondurma Kazanı (Geleneksel Derin Dövme Pirinç & Paslanmaz Çelik Güğümler)
  const cauldronMat = new THREE.MeshStandardMaterial({
    color: "#d4ac0d",
    metalness: 0.85,
    roughness: 0.25,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: "#f1c40f",
    metalness: 0.9,
    roughness: 0.2,
  });

  const cauldronPositions = [
    { x: kioskX - 0.65, z: kioskZ - 0.3 },
    { x: kioskX + 0.65, z: kioskZ - 0.3 },
  ];

  for (const cp of cauldronPositions) {
    // Çelik kazan bileziği
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16), cauldronMat);
    ring.position.set(cp.x, 1.15, cp.z);
    group.add(ring);

    // Pirinç kubbeli kapak
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 16), lidMat);
    lid.position.set(cp.x, 1.22, cp.z);
    group.add(lid);

    // Kapak tutma topuzu
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), lidMat);
    knob.position.set(cp.x, 1.3, cp.z);
    group.add(knob);
  }

  // Dondurma Soğutma Kuru Buz Buharı / Sis Partikülleri (Procedural vapor puffs)
  const vaporGroup = new THREE.Group();
  group.add(vaporGroup);
  const vaporMat = new THREE.MeshBasicMaterial({
    color: "#e8f8f5",
    transparent: true,
    opacity: 0.45,
  });
  const vaporPuffs: { mesh: THREE.Mesh; baseX: number; baseZ: number; speed: number; phase: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const cp = cauldronPositions[i % 2];
    const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.04, 6, 6), vaporMat);
    const baseX = cp.x + (Math.random() - 0.5) * 0.2;
    const baseZ = cp.z + (Math.random() - 0.5) * 0.2;
    pMesh.position.set(baseX, 1.25 + (i * 0.1), baseZ);
    vaporGroup.add(pMesh);
    vaporPuffs.push({
      mesh: pMesh,
      baseX,
      baseZ,
      speed: 0.4 + (i % 3) * 0.2,
      phase: i * 1.1,
    });
  }

  // Kornet Külah Kuleleri (4 adet dikey istiflenmiş ters waffle külahlar)
  const coneMat = new THREE.MeshStandardMaterial({
    color: "#e59866",
    roughness: 0.8,
  });
  for (const cx of [kioskX - 1.2, kioskX - 1.0, kioskX + 1.0, kioskX + 1.2]) {
    for (let h = 0; h < 4; h++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), coneMat);
      cone.rotation.x = Math.PI; // Ters külah dizilimi
      cone.position.set(cx, 1.25 + h * 0.16, kioskZ + kioskD / 2 - 0.25);
      group.add(cone);
    }
  }

  // Meyve ve Fıstık Sos Cam Vitrini
  box(group, [0.85, 0.24, 0.4], [kioskX, 1.24, kioskZ + 0.1], "#2c3e50"); // Paslanmaz çelik tekne
  box(group, [0.24, 0.12, 0.32], [kioskX - 0.26, 1.25, kioskZ + 0.1], "#27ae60"); // Antep Fıstığı
  box(group, [0.24, 0.12, 0.32], [kioskX, 1.25, kioskZ + 0.1], "#c0392b"); // Çilek Sosu
  box(group, [0.24, 0.12, 0.32], [kioskX + 0.26, 1.25, kioskZ + 0.1], "#8e44ad"); // Karadut / Böğürtlen

  // Asılı Dövme Pirinç Servis Çıngırağı (Ringing shop bell)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(kioskX - 1.1, 2.25, kioskZ - kioskD / 2);
  group.add(bellGroup);

  // Pirinç asma kolu
  box(bellGroup, [0.04, 0.2, 0.16], [0, 0.08, 0.05], "#d4ac0d");
  // Çan gövdesi
  const bellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.18, 12), cauldronMat);
  bellMesh.position.set(0, -0.05, 0);
  bellGroup.add(bellMesh);
  // Çan tokmağı (Clapper)
  const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), cauldronMat);
  clapper.position.set(0, -0.14, 0);
  bellGroup.add(clapper);

  // 4 Pirinç Tente Direği (Awning corner poles)
  const poleMat = new THREE.MeshStandardMaterial({
    color: "#f1c40f",
    metalness: 0.8,
    roughness: 0.3,
  });
  const cornerXs = [kioskX - kioskW / 2 + 0.1, kioskX + kioskW / 2 - 0.1];
  const cornerZs = [kioskZ - kioskD / 2 - 0.2, kioskZ + kioskD / 2];
  for (const px of cornerXs) {
    for (const pz of cornerZs) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, kioskH, 8), poleMat);
      pole.position.set(px, kioskH / 2, pz);
      group.add(pole);
    }
  }

  // Bordo & Krem Çizgili Klasik Maraş Tentesi (Ottoman Burgundy Striped Awning)
  const awningMat1 = new THREE.MeshStandardMaterial({ color: "#7b1113", roughness: 0.65 });
  const awningMat2 = new THREE.MeshStandardMaterial({ color: "#fbfcfc", roughness: 0.65 });
  const awningW = kioskW + 0.5;
  const awningD = kioskD + 0.6;
  const numStripes = 11;
  const stripeW = awningW / numStripes;

  for (let s = 0; s < numStripes; s++) {
    const sx = kioskX - awningW / 2 + (s + 0.5) * stripeW;
    const isBurgundy = s % 2 === 0;
    const stripeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stripeW, 0.08, awningD),
      isBurgundy ? awningMat1 : awningMat2,
    );
    stripeMesh.position.set(sx, kioskH + 0.05, kioskZ - 0.1);
    group.add(stripeMesh);

    // Ön oymalı saçak (Scalloped valence trim)
    const valence = new THREE.Mesh(
      new THREE.BoxGeometry(stripeW, 0.22, 0.04),
      isBurgundy ? awningMat1 : awningMat2,
    );
    valence.position.set(sx, kioskH - 0.08, kioskZ - 0.1 - awningD / 2);
    group.add(valence);
  }

  // Büyük Işıklı Çatı Tabelası & Menü Şövalesi
  const mainSign = label("🍦 HAKİKİ MARAŞ DONDURMACISI · ALİ USTA 🍨", "#ffffff", "#7b1113");
  mainSign.scale.set(3.4, 0.65, 1);
  mainSign.position.set(kioskX, kioskH + 0.45, kioskZ - 0.35);
  group.add(mainSign);

  const subBanner = label("BUZ GİBİ DÖVME DONDURMA · SALEP & KEÇİ SÜTÜ", "#f1c40f", "#4a151b");
  subBanner.scale.set(2.8, 0.38, 1);
  subBanner.position.set(kioskX, kioskH + 0.82, kioskZ - 0.35);
  group.add(subBanner);

  // Gece Sıcak Tabela Aydınlatması (PointLight)
  const marqueeLight = new THREE.PointLight("#ffea85", 0.9, 10, 1.2);
  marqueeLight.position.set(kioskX, kioskH + 0.6, kioskZ - 0.6);
  marqueeLight.visible = false;
  group.add(marqueeLight);

  // A-Frame Kaldırım Menü Şövalesi (Chalkboard Easel)
  const easelGroup = new THREE.Group();
  easelGroup.position.set(kioskX + 1.8, 0, kioskZ - 0.5);
  easelGroup.rotation.y = -Math.PI / 6;
  group.add(easelGroup);
  box(easelGroup, [0.06, 0.9, 0.06], [-0.3, 0.45, 0], "#5d4037");
  box(easelGroup, [0.06, 0.9, 0.06], [0.3, 0.45, 0], "#5d4037");
  box(easelGroup, [0.04, 0.8, 0.04], [0, 0.4, 0.3], "#5d4037"); // Destek bacağı
  box(easelGroup, [0.65, 0.65, 0.04], [0, 0.55, 0], "#1c2833"); // Kara tahta yüzeyi
  const menuLabel = label("🍦 Maraş: 10₺\n🍨 Külah: 15₺\n🔔 Çıngırak: 0₺", "#f4d03f", "#1c2833");
  menuLabel.scale.set(0.65, 0.55, 1);
  menuLabel.position.set(0, 0.55, 0.03);
  easelGroup.add(menuLabel);

  // Kiosk Çarpışma Sınırı (Kargo aracı tezgaha çarpabilir, önünde rahatça yanaşabilir)
  obstacles.push({
    minX: kioskX - kioskW / 2,
    maxX: kioskX + kioskW / 2,
    minZ: kioskZ - kioskD / 2,
    maxZ: kioskZ + kioskD / 2,
  });

  // =========================================================================
  // 3. ANİMASYONLU MARAŞLI DONDURMA USTASI NPC ("Maraşlı Ali Usta")
  // =========================================================================
  const npceGroup = new THREE.Group();
  const npcX = ICE_CREAM_MASTER_ALI_POS.x; // -23.5
  const npcZ = ICE_CREAM_MASTER_ALI_POS.z; // 82.3 (Tezgahın arkasında oyuncuya dönük)
  npceGroup.position.set(npcX, 0, npcZ);
  group.add(npceGroup);

  // Ayaklar ve Şalvar Pantolon
  box(npceGroup, [0.18, 0.12, 0.28], [-0.14, 0.06, 0], "#2c3e50"); // Ayakkabılar
  box(npceGroup, [0.18, 0.12, 0.28], [0.14, 0.06, 0], "#2c3e50");
  box(npceGroup, [0.46, 0.6, 0.28], [0, 0.4, 0], "#1b2631"); // Geniş koyu şalvar

  // Geniş Altın Sarısı / Turuncu Kuşak
  box(npceGroup, [0.5, 0.14, 0.3], [0, 0.72, 0], "#d35400");

  // Gövde: Beyaz Gömlek ve Maraş Altın Sırmalı Cepken Yelek
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.78, 0);
  npceGroup.add(torsoGroup);
  box(torsoGroup, [0.46, 0.6, 0.26], [0, 0.3, 0], "#ffffff"); // Beyaz gömlek
  box(torsoGroup, [0.48, 0.58, 0.28], [0, 0.3, 0], "#7b1113"); // Bordo cepken yelek
  box(torsoGroup, [0.16, 0.52, 0.29], [0, 0.33, 0], "#ffffff"); // Yelek açık ön yaka
  box(torsoGroup, [0.04, 0.52, 0.295], [-0.09, 0.33, 0], "#f1c40f"); // Altın sırma biyeleri
  box(torsoGroup, [0.04, 0.52, 0.295], [0.09, 0.33, 0], "#f1c40f");

  // Kafa Grubu (Baş Takibi için ayrıldı)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.62, 0);
  torsoGroup.add(headGroup);

  // Baş ve Yüz
  box(headGroup, [0.28, 0.28, 0.26], [0, 0.14, 0], "#f5cba7");
  // Karakteristik Burma Bıyık
  box(headGroup, [0.26, 0.06, 0.08], [0, 0.09, -0.14], "#1c2833");
  box(headGroup, [0.06, 0.05, 0.08], [-0.15, 0.12, -0.13], "#1c2833"); // Bıyık kıvrımı
  box(headGroup, [0.06, 0.05, 0.08], [0.15, 0.12, -0.13], "#1c2833");

  // Gözler
  box(headGroup, [0.05, 0.04, 0.04], [-0.08, 0.18, -0.13], "#1c2833");
  box(headGroup, [0.05, 0.04, 0.04], [0.08, 0.18, -0.13], "#1c2833");

  // Geleneksel Kırmızı Maraş Fesi (Fez with black tassel)
  const fez = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.2, 12), new THREE.MeshStandardMaterial({
    color: "#922b21",
    roughness: 0.7,
  }));
  fez.position.set(0, 0.34, 0);
  headGroup.add(fez);
  // Siyah püskül
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.14, 6), new THREE.MeshStandardMaterial({
    color: "#17202a",
  }));
  tassel.position.set(0.1, 0.3, 0.06);
  tassel.rotation.z = -Math.PI / 8;
  headGroup.add(tassel);

  // Kollar ve Uzun Maraş Dondurma Çubuğu (Paddle & Stretchy Ice Cream)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.28, 0.52, 0);
  torsoGroup.add(leftArmGroup);
  box(leftArmGroup, [0.1, 0.42, 0.1], [0, -0.18, 0], "#ffffff");

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.52, 0);
  torsoGroup.add(rightArmGroup);
  box(rightArmGroup, [0.1, 0.42, 0.1], [0, -0.18, 0], "#ffffff");

  // Çelik Dondurma Çubuğu Grubu (Paddle Rig)
  const paddleGroup = new THREE.Group();
  paddleGroup.position.set(0, -0.32, -0.15);
  rightArmGroup.add(paddleGroup);

  // Uzun paslanmaz çelik çubuk (1.4m)
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), new THREE.MeshStandardMaterial({
    color: "#d5dbdb",
    metalness: 0.8,
    roughness: 0.2,
  }));
  rod.rotation.x = Math.PI / 3;
  rod.position.set(0, 0.2, -0.4);
  paddleGroup.add(rod);

  // Çubuğun ucundaki spatula ağzı
  box(paddleGroup, [0.12, 0.02, 0.22], [0, 0.52, -0.95], "#bdc3c7");

  // Spatula Ucuna Yapışık Dövme Maraş Dondurması ve Kornet Külah
  const iceCreamDollop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({
    color: "#fef9e7", // Süt beyazı dövme dondurma
    roughness: 0.4,
  }));
  iceCreamDollop.position.set(0, 0.58, -0.96);
  paddleGroup.add(iceCreamDollop);

  const trickCone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 8), coneMat);
  trickCone.rotation.x = Math.PI;
  trickCone.position.set(0, 0.72, -0.96);
  paddleGroup.add(trickCone);

  // 3D Konuşma Balonu (Speech Bubble)
  const speechBubble = label("", "#ffffff", "rgba(123, 17, 19, 0.92)");
  speechBubble.scale.set(3.6, 0.65, 1);
  speechBubble.position.set(0, 2.35, 0);
  speechBubble.visible = false;
  npceGroup.add(speechBubble);

  // =========================================================================
  // 4. PLAJ VOLEYBOLU SAHASI (Beach Volleyball Court - X: -29.0, Z: 86.4)
  // =========================================================================
  const courtGroup = new THREE.Group();
  const courtX = VOLLEYBALL_COURT_CENTER.x; // -29.0
  const courtZ = VOLLEYBALL_COURT_CENTER.z; // 86.4
  courtGroup.position.set(courtX, 0, courtZ);
  group.add(courtGroup);

  const courtW = 6.2; // X ekseninde saha genişliği
  const courtD = 4.0; // Z ekseninde saha derinliği

  // İnce elenmiş plaj kumu zemin tablası
  box(courtGroup, [courtW + 0.6, 0.03, courtD + 0.6], [0, 0.045, 0], "#f7dc6f"); // Canlı altın kum

  // Beyaz Gergi Şeritli Saha Sınır Çizgileri
  const lineWidth = 0.08;
  box(courtGroup, [courtW, 0.015, lineWidth], [0, 0.065, -courtD / 2], "#ffffff"); // Kuzey çizgi
  box(courtGroup, [courtW, 0.015, lineWidth], [0, 0.065, courtD / 2], "#ffffff");  // Güney çizgi
  box(courtGroup, [lineWidth, 0.015, courtD], [-courtW / 2, 0.065, 0], "#ffffff"); // Batı çizgi
  box(courtGroup, [lineWidth, 0.015, courtD], [courtW / 2, 0.065, 0], "#ffffff");  // Doğu çizgi

  // 4 Köşe Kırmızı Bayrakları
  for (const fx of [-courtW / 2, courtW / 2]) {
    for (const fz of [-courtD / 2, courtD / 2]) {
      cylinder(courtGroup, 0.015, 0.015, 0.45, [fx, 0.24, fz], "#ffffff", 6);
      box(courtGroup, [0.08, 0.06, 0.01], [fx + 0.04, 0.42, fz], "#e74c3c");
    }
  }

  // Merkezi Voleybol Filesi (X=0 ekseninde ortadan ikiye böler, net Z ekseni boyunca uzanır)
  const netH = 1.35;
  const postZ1 = -courtD / 2 - 0.25;
  const postZ2 = courtD / 2 + 0.25;

  // Çift Ahşap File Direği & Gergi Halatları
  cylinder(courtGroup, 0.06, 0.06, netH + 0.2, [0, (netH + 0.2) / 2, postZ1], "#795548", 8);
  cylinder(courtGroup, 0.06, 0.06, netH + 0.2, [0, (netH + 0.2) / 2, postZ2], "#795548", 8);

  // File Örgüsü ve Beyaz Üst Bant
  const netMat = new THREE.MeshStandardMaterial({
    color: "#ecf0f1",
    transparent: true,
    opacity: 0.8,
    roughness: 0.9,
  });
  const netMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, courtD + 0.4), netMat);
  netMesh.position.set(0, netH - 0.32, 0);
  courtGroup.add(netMesh);

  // Üst kalın beyaz bant
  box(courtGroup, [0.06, 0.08, courtD + 0.5], [0, netH, 0], "#ffffff");
  // Kırmızı/Beyaz Anten Çubukları
  box(courtGroup, [0.02, 0.45, 0.02], [0, netH + 0.2, -courtD / 2], "#c0392b");
  box(courtGroup, [0.02, 0.45, 0.02], [0, netH + 0.2, courtD / 2], "#c0392b");

  // Renkli Plaj Voleybolu Topu (Mavi, sarı, beyaz dilimli)
  const ballGroup = new THREE.Group();
  ballGroup.position.set(1.1, 0.2, 0.6);
  courtGroup.add(ballGroup);
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({
    color: "#f1c40f",
    roughness: 0.5,
  }));
  ballGroup.add(ballMesh);
  const ballStripe = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 16), new THREE.MeshStandardMaterial({
    color: "#2980b9",
    roughness: 0.5,
  }));
  ballStripe.rotation.x = Math.PI / 4;
  ballGroup.add(ballStripe);

  // Yüksek Ahşap Hakem Kulesi / Sandalyesi (Umpire Chair - Kuzey-batı köşede)
  const umpireGroup = new THREE.Group();
  umpireGroup.position.set(-courtW / 2 - 0.4, 0, postZ1 - 0.2);
  umpireGroup.rotation.y = Math.PI / 4;
  courtGroup.add(umpireGroup);
  // Ayaklar ve basamaklar
  cylinder(umpireGroup, 0.03, 0.03, 1.8, [-0.3, 0.9, -0.3], "#8d6e63", 6);
  cylinder(umpireGroup, 0.03, 0.03, 1.8, [0.3, 0.9, -0.3], "#8d6e63", 6);
  cylinder(umpireGroup, 0.03, 0.03, 1.8, [-0.3, 0.9, 0.3], "#8d6e63", 6);
  cylinder(umpireGroup, 0.03, 0.03, 1.8, [0.3, 0.9, 0.3], "#8d6e63", 6);
  box(umpireGroup, [0.65, 0.06, 0.65], [0, 1.45, 0], "#a1887f"); // Oturak tablası
  box(umpireGroup, [0.65, 0.45, 0.06], [0, 1.7, -0.3], "#a1887f"); // Sırtlık
  box(umpireGroup, [0.8, 0.04, 0.8], [0, 2.1, 0], "#f39c12"); // Güneşlik kanopisi

  // Seyirci / Oyuncu Ahşap Dinlenme Bankı & Havlular
  const benchGroup = new THREE.Group();
  benchGroup.position.set(courtW / 2 + 0.4, 0, 0);
  benchGroup.rotation.y = -Math.PI / 2;
  courtGroup.add(benchGroup);
  box(benchGroup, [1.6, 0.08, 0.4], [0, 0.38, 0], "#8d6e63");
  cylinder(benchGroup, 0.03, 0.03, 0.38, [-0.7, 0.19, -0.15], "#5d4037", 6);
  cylinder(benchGroup, 0.03, 0.03, 0.38, [0.7, 0.19, -0.15], "#5d4037", 6);
  cylinder(benchGroup, 0.03, 0.03, 0.38, [-0.7, 0.19, 0.15], "#5d4037", 6);
  cylinder(benchGroup, 0.03, 0.03, 0.38, [0.7, 0.19, 0.15], "#5d4037", 6);
  // Katlanmış sahil havluları
  box(benchGroup, [0.35, 0.06, 0.28], [-0.4, 0.44, 0], "#3498db");
  box(benchGroup, [0.35, 0.06, 0.28], [0.3, 0.44, 0], "#e67e22");

  // Voleybol Sahası Engelleri (File direkleri ve hakem kulesi)
  obstacles.push({
    minX: courtX - 0.2,
    maxX: courtX + 0.2,
    minZ: courtZ - courtD / 2 - 0.4,
    maxZ: courtZ + courtD / 2 + 0.4,
  });
  obstacles.push({
    minX: courtX - courtW / 2 - 0.8,
    maxX: courtX - courtW / 2,
    minZ: courtZ + postZ1 - 0.6,
    maxZ: courtZ + postZ1 + 0.2,
  });

  // =========================================================================
  // 5. GÜNEŞLENME TERASI & ŞEZLONG ALANI (Sun Lounger Terrace - X: -19.5, Z: 85.0)
  // =========================================================================
  const terraceGroup = new THREE.Group();
  const terraceX = SUN_TERRACE_CENTER.x; // -19.5
  const terraceZ = SUN_TERRACE_CENTER.z; // 85.0
  terraceGroup.position.set(terraceX, 0, terraceZ);
  group.add(terraceGroup);

  // Sedir Ahşap Sahil Güvertesi (Weathered cedar sundeck)
  box(terraceGroup, [3.2, 0.08, 3.6], [0, 0.04, 0], "#bcaaa4");
  box(terraceGroup, [3.2, 0.12, 0.14], [0, 0.06, -1.73], "#795548");
  box(terraceGroup, [3.2, 0.12, 0.14], [0, 0.06, 1.73], "#795548");

  // Çift Ahşap Yatarlı Şezlong (Turkuaz & Sarı çizgili minderler)
  const loungerMat1 = new THREE.MeshStandardMaterial({ color: "#1abc9c", roughness: 0.6 });
  const loungerMat2 = new THREE.MeshStandardMaterial({ color: "#f1c40f", roughness: 0.6 });

  const loungerZs = [-0.9, 0.9];
  for (let li = 0; li < loungerZs.length; li++) {
    const lz = loungerZs[li];
    const lGroup = new THREE.Group();
    lGroup.position.set(-0.2, 0, lz);
    terraceGroup.add(lGroup);

    // Ahşap şezlong iskeleti
    box(lGroup, [1.9, 0.08, 0.72], [0, 0.22, 0], "#8d6e63");
    cylinder(lGroup, 0.03, 0.03, 0.22, [-0.85, 0.11, -0.3], "#5d4037", 6);
    cylinder(lGroup, 0.03, 0.03, 0.22, [0.85, 0.11, -0.3], "#5d4037", 6);
    cylinder(lGroup, 0.03, 0.03, 0.22, [-0.85, 0.11, 0.3], "#5d4037", 6);
    cylinder(lGroup, 0.03, 0.03, 0.22, [0.85, 0.11, 0.3], "#5d4037", 6);

    // Çizgili sünger plaj minderi
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.08, 0.66),
      li % 2 === 0 ? loungerMat1 : loungerMat2,
    );
    cushion.position.set(0.25, 0.28, 0);
    lGroup.add(cushion);

    // Açılı sırt yaslanma minderi
    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.08, 0.66),
      li % 2 === 0 ? loungerMat1 : loungerMat2,
    );
    backrest.position.set(-0.62, 0.42, 0);
    backrest.rotation.z = Math.PI / 6;
    lGroup.add(backrest);

    // Rulo yapılmış kumsal havlusu
    cylinder(lGroup, 0.06, 0.06, 0.5, [-0.85, 0.56, 0], "#ffffff", 8);
  }

  // Büyük Renkli Plaj Şemsiyesi (Güneşlik)
  const parasolGroup = new THREE.Group();
  parasolGroup.position.set(0.9, 0, 0);
  terraceGroup.add(parasolGroup);
  // Beyaz çelik direk
  cylinder(parasolGroup, 0.04, 0.04, 2.4, [0, 1.2, 0], "#ffffff", 8);
  // Şemsiye kubbesi (8 segmentli sarı-turkuaz)
  const umbrellaDome = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.5, 12), new THREE.MeshStandardMaterial({
    color: "#f39c12",
    roughness: 0.6,
  }));
  umbrellaDome.position.set(0, 2.3, 0);
  parasolGroup.add(umbrellaDome);

  // Bambu Plaj Sehpası & Hindistan Cevizi Kokteyli
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-0.2, 0, 0);
  terraceGroup.add(tableGroup);
  cylinder(tableGroup, 0.28, 0.28, 0.04, [0, 0.32, 0], "#d7ccc8", 12);
  cylinder(tableGroup, 0.03, 0.03, 0.32, [0, 0.16, 0], "#8d6e63", 6);
  // Hindistan cevizi kabuğu
  const coco = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({
    color: "#5d4037",
    roughness: 0.8,
  }));
  coco.position.set(0, 0.4, 0);
  tableGroup.add(coco);
  // Minik kokteyl pipeti
  cylinder(tableGroup, 0.008, 0.008, 0.14, [0.03, 0.48, 0], "#2ecc71", 4);

  // Ahşap Yön Tabelası: "🏖️ KORDON PLAJI · 🏐 VOLEYBOL · 🍦 DONDURMA"
  const signGroup = new THREE.Group();
  signGroup.position.set(-1.3, 0, -1.4);
  signGroup.rotation.y = Math.PI / 4;
  terraceGroup.add(signGroup);
  cylinder(signGroup, 0.04, 0.04, 1.4, [0, 0.7, 0], "#5d4037", 8);
  const beachDirSign = label("🏖️ KORDON PLAJI & VOLEYBOL 🏐", "#ffffff", "#0288d1");
  beachDirSign.scale.set(1.9, 0.38, 1);
  beachDirSign.position.set(0, 1.15, 0);
  signGroup.add(beachDirSign);

  // Kıvrık Sahil Palmiyesi & Kehribar Peri Fenerleri
  const palmGroup = new THREE.Group();
  palmGroup.position.set(1.2, 0, 1.4);
  terraceGroup.add(palmGroup);
  // Eğimli gövde
  cylinder(palmGroup, 0.14, 0.18, 1.2, [0, 0.6, 0], "#6d4c41", 8);
  const upperTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.4, 8), new THREE.MeshStandardMaterial({
    color: "#5d4037",
    roughness: 0.8,
  }));
  upperTrunk.position.set(0.18, 1.8, 0.1);
  upperTrunk.rotation.z = -Math.PI / 14;
  palmGroup.add(upperTrunk);

  // Yaprak tacı
  const leafMat = new THREE.MeshStandardMaterial({ color: "#27ae60", roughness: 0.7 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const frond = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 1.6), leafMat);
    frond.position.set(0.28 + Math.cos(a) * 0.7, 2.5, 0.16 + Math.sin(a) * 0.7);
    frond.rotation.y = a;
    frond.rotation.x = Math.PI / 8;
    palmGroup.add(frond);
  }

  // Peri feneri (Gece kehribar parıldayan asılı lamba)
  const lanternLight = new THREE.PointLight("#ffb74d", 0.8, 6, 1.4);
  lanternLight.position.set(0.3, 2.1, 0.2);
  lanternLight.visible = false;
  palmGroup.add(lanternLight);

  cylinder(palmGroup, 0.04, 0.06, 0.12, [0.3, 2.1, 0.2], "#f39c12", 8);

  // Güneşlenme terası şezlong engelleri
  obstacles.push({
    minX: terraceX - 1.2,
    maxX: terraceX + 1.2,
    minZ: terraceZ - 1.4,
    maxZ: terraceZ + 1.4,
  });

  // =========================================================================
  // GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let animTimer = 0;
  let bellRingTimer = 0;
  let waveTimer = 0;

  function onPlayerHonk(playerPos: Vec2): boolean {
    const dist = Math.hypot(playerPos.x - npcX, playerPos.z - npcZ);
    if (dist <= 24.0) {
      waveTimer = 0.1;
      bellRingTimer = 1.2;
      return true;
    }
    return false;
  }

  function update(
    dt: number,
    state: IceCreamStandState,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ): void {
    animTimer += dt;

    // 1. Gece Işıklandırması Kontrolü
    marqueeLight.visible = isNightOrDusk;
    lanternLight.visible = isNightOrDusk;

    // 2. Kuru Buz Buharı / Sis Animasyonu (Vapor puffs bobbing & rising)
    for (const puff of vaporPuffs) {
      const offset = (animTimer * puff.speed + puff.phase) % 1.0;
      puff.mesh.position.y = 1.18 + offset * 0.35;
      puff.mesh.scale.setScalar(0.7 + offset * 0.8);
      (puff.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.5 * (1.0 - offset),
      );
    }

    // 3. Ali Usta Baş ve Gövde Takibi (Head tracking)
    if (playerPos) {
      const dx = playerPos.x - npcX;
      const dz = playerPos.z - npcZ;
      const dist = Math.hypot(dx, dz);
      if (dist < 18.0) {
        // Aracın yönüne yumuşakça dön
        const targetAngle = Math.atan2(dx, dz) - Math.PI;
        headGroup.rotation.y = THREE.MathUtils.lerp(
          headGroup.rotation.y,
          Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetAngle)),
          dt * 3.5,
        );
      } else {
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.0);
      }
    }

    // 4. Ali Usta Dondurma Çubuğu Şov Animasyonu (Paddle trick / flip)
    if (state.trickActive || waveTimer > 0) {
      if (waveTimer > 0) {
        waveTimer = Math.max(0, waveTimer - dt);
      }
      // Hızlı dondurma uzatma, çevirme ve geri çekme şovu
      const trickPhase = animTimer * 7.5;
      paddleGroup.position.z = -0.15 + Math.sin(trickPhase) * 0.35; // Çubuğu ileri fırlatma
      paddleGroup.rotation.z = Math.sin(trickPhase * 1.5) * 0.55;  // Çubuğu burma / takla
      paddleGroup.rotation.x = Math.cos(trickPhase) * 0.3;
      rightArmGroup.rotation.x = -Math.PI / 4 + Math.sin(trickPhase) * 0.4;
      leftArmGroup.rotation.x = Math.sin(trickPhase * 0.8) * 0.3;

      // Çıngırak çalma
      bellRingTimer = 1.0;
    } else {
      // Normal rölanti nefes ve hafif çubuk salınımı
      const idlePhase = animTimer * 2.0;
      paddleGroup.position.z = -0.15;
      paddleGroup.rotation.z = Math.sin(idlePhase) * 0.08;
      paddleGroup.rotation.x = 0;
      rightArmGroup.rotation.x = Math.sin(idlePhase) * 0.06;
      leftArmGroup.rotation.x = -Math.sin(idlePhase) * 0.06;
    }

    // 5. Çıngırak Tokmağı Sallantısı (Bell clapper swing)
    if (bellRingTimer > 0) {
      bellRingTimer = Math.max(0, bellRingTimer - dt);
      clapper.position.x = Math.sin(animTimer * 25.0) * 0.05;
      bellMesh.rotation.z = Math.sin(animTimer * 25.0) * 0.15;
    } else {
      clapper.position.x = 0;
      bellMesh.rotation.z = 0;
    }

    // 6. 3D Konuşma Balonu Gösterimi
    if (state.honkGreetingTimer > 0 && state.lastHonkCallout) {
      speechBubble.visible = true;
      speechBubble.position.y = 2.35 + Math.sin(animTimer * 3.0) * 0.04;
    } else {
      speechBubble.visible = false;
    }
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
