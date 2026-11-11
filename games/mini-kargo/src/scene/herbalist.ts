import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type HerbalistState,
  HERBALIST_CENTER,
  HERBALIST_BAY,
  IDRIS_EFENDI_POS,
  MORTAR_POS,
  APOTHECARY_VITRINE_POS,
  IDRIS_EFENDI_CALLOUTS,
} from "../game/herbalist";

export type HerbalistView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: HerbalistState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Çarşı "Tarihi Baharatçı, Aktar & Lokman Hekim Şifahanesi (Aktar İdris Efendi)" (T64)
 * - Otantik Osmanlı Taş ve Ahşap Dükkan Mimarisi:
 *   - Çarşı Bulvarı Z = 50'nin kuzey bordüründe (HERBALIST_CENTER: X: 24.5, Z: 42.0)
 *   - Çift sivri Osmanlı taş kemeri, mukarnaslı mermer söveler ve alaturka kiremit sundurma çatı
 *   - Klinker tuğla ve kireçtaşı avlu tablası (11.8m x 8.4m) ve servis yanaşma peronu (HERBALIST_BAY: X: 24.5, Z: 47.2)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Büyük aydınlatmalı kurumsal çatı tabelası ("🌿 TARİHİ ÇARŞI AKTARI & ŞİFAHANESİ · İDRİS EFENDİ 🧪")
 *   - Alt kurumsal şerit ("LOKMAN HEKİM ŞİFALI BİTKİLERİ · BAHARAT & DOĞAL MACUNLAR · 1892")
 *   - Gece dükkanı ve tezgahı aydınlatan sıcak kehribar PointLight armatürü ve ferforje pirinç kandil
 *   - Renkli Baharat Piramitleri & Çuvalları: Antep İpek Pul Biberi & Sumak (kırmızı), Zerdeçal & Safran (sarı),
 *     Dağ Kekiği & Nane (yeşil), Kimyon & Toz Biber (turuncu), jüt çuvallar ve ahşap baharat kürekleri
 *   - Saçaklardan asılı kurutulmuş kırmızı biber, dolmalık patlıcan ve sarımsak dizileri
 *   - Çok çekmeceli geleneksel ahşap aktar dolabı ve cam vitrinde şifalı tentür kavanozları
 *   - Döküm pirinç çift kefeli denge terazisi ve gramaj ağırlıkları
 *   - Ritmik animasyonlu dökme bronz havan & havaneli (öğütme hareketi ve aromatik şifa buharı)
 * - Animasyonlu Usta Aktar NPC — "Aktar İdris Efendi" (X: 22.8, Z: 43.6):
 *   - Zümrüt yeşili kadife cepken yelek, ipek kuşak, bilge ak sakal, yuvarlak tel gözlükler, şifalı ot demeti
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada kolunu kaldırarak bilge selamı ve 3D konuşma balonu
 */
export function createHerbalistView(): HerbalistView {
  const group = new THREE.Group();
  group.name = "herbalist-view";
  const obstacles: Rect[] = [];
  const disposables: { dispose(): void }[] = [];

  const cx = HERBALIST_CENTER.x; // 24.5
  const cz = HERBALIST_CENTER.z; // 42.0

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Klinker tuğla ve rustik kireçtaşı parke zemin tablası (11.8m x 8.4m)
  box(yardGroup, [11.8, 0.12, 8.4], [0, 0.04, 0], "#ded2be");
  box(yardGroup, [11.2, 0.05, 7.8], [0, 0.10, 0], "#8d6e63");

  // Çevre granit bordür taşları
  box(yardGroup, [12.0, 0.18, 0.22], [0, 0.09, -4.2], "#5d4037");
  box(yardGroup, [12.0, 0.18, 0.22], [0, 0.09, 4.2], "#5d4037");
  box(yardGroup, [0.22, 0.18, 8.6], [-5.95, 0.09, 0], "#5d4037");
  box(yardGroup, [0.22, 0.18, 8.6], [5.95, 0.09, 0], "#5d4037");

  // Servis Yanaşma Peronu (HERBALIST_BAY: X: 24.5, Z: 47.2) - Çarşı Z: 50 bulvarının kuzey bordüründe
  box(group, [5.2, 0.02, 3.2], [cx, 0.025, cz + 5.2], "#26292d"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.5, 0.03, cz + 5.2], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.5, 0.03, cz + 5.2], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 3.7], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 3.6], isYellow ? "#f1c40f" : "#212529");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncuya dükkana yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 5.1], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 5.9);
  group.add(arrowHead);

  // =========================================================================
  // 2. OTANTİK OSMANLI TAŞ & AHŞAP DÜKKAN MİMARİSİ (8.4m x 4.8m x 4.9m)
  // =========================================================================
  const shopGroup = new THREE.Group();
  shopGroup.position.set(cx, 0, cz - 1.2);
  group.add(shopGroup);

  // Taş taban kaidesi ve kesme kireçtaşı ana gövde
  box(shopGroup, [8.4, 0.45, 4.8], [0, 0.22, 0], "#7f8c8d"); // Bazalt su basman kaidesi
  box(shopGroup, [8.2, 4.0, 4.6], [0, 2.45, 0], "#ded6be"); // Sıcak bej kesme kireçtaşı duvarlar

  // Arka ve yan duvar kalınlıkları
  box(shopGroup, [8.2, 4.0, 0.5], [0, 2.45, -2.1], "#c8be9f"); // Arka duvar
  box(shopGroup, [0.5, 4.0, 4.4], [-3.9, 2.45, 0], "#c8be9f"); // Sol duvar
  box(shopGroup, [0.5, 4.0, 4.4], [3.9, 2.45, 0], "#c8be9f"); // Sağ duvar

  // İç dükkan ahşap döşeme zemini ve tavanı
  box(shopGroup, [7.4, 0.08, 4.0], [0, 0.48, 0], "#6d4c41"); // Rustik ceviz zemin
  box(shopGroup, [7.4, 0.15, 4.0], [0, 3.8, 0], "#5d4037"); // Kirişli tavan

  // Çift Sivri Osmanlı Taş Kemeri (Pointed stone arches on the front facade)
  // Merkez orta sütun ve iki yan pilastır
  cylinder(shopGroup, 0.25, 0.28, 3.2, [0, 1.85, 2.1], "#f5f0e6", 12); // Orta mermer sütun
  cylinder(shopGroup, 0.28, 0.28, 0.35, [0, 3.5, 2.1], "#ecd9b8", 8); // Mukarnaslı başlık
  cylinder(shopGroup, 0.28, 0.32, 0.35, [0, 0.55, 2.1], "#d9c8a7", 8); // Sütun kaidesi

  cylinder(shopGroup, 0.22, 0.24, 3.2, [-3.8, 1.85, 2.1], "#f5f0e6", 8); // Sol pilastır
  cylinder(shopGroup, 0.22, 0.24, 3.2, [3.8, 1.85, 2.1], "#f5f0e6", 8); // Sağ pilastır

  // Çift kemer alınlığı ve üst taş lento
  box(shopGroup, [8.4, 0.65, 0.6], [0, 3.85, 2.1], "#ecd9b8"); // Üst mermer arşitrav
  box(shopGroup, [3.6, 0.35, 0.3], [-1.9, 3.35, 2.1], "#d9c8a7"); // Sol kemer lentosu
  box(shopGroup, [3.6, 0.35, 0.3], [1.9, 3.35, 2.1], "#d9c8a7"); // Sağ kemer lentosu

  // Geleneksel Ahşap Cumbalı Saçaklık ve Alaturka Kiremit Çatı
  box(shopGroup, [8.8, 0.25, 5.2], [0, 4.5, 0], "#5d4037"); // Ahşap korniş tabanı
  // Kırma kiremit çatı
  const roofGeom = new THREE.ConeGeometry(5.6, 1.6, 4);
  roofGeom.rotateY(Math.PI / 4);
  const roofMesh = new THREE.Mesh(roofGeom, mat("#a04000")); // Pişmiş alaturka kiremit rengi
  roofMesh.position.set(0, 5.35, 0);
  roofMesh.scale.set(1.15, 1.0, 0.85);
  shopGroup.add(roofMesh);

  // Ahşap çatı destek payandaları (Corbels)
  for (let px = -3.6; px <= 3.6; px += 1.8) {
    const corbel = box(shopGroup, [0.18, 0.45, 0.4], [px, 4.25, 2.3], "#4e342e");
    corbel.rotation.x = -0.35;
  }

  // Dükkan Fiziksel Çarpışma Kutuları (Ana bina gövdesi)
  obstacles.push({
    minX: cx - 4.4,
    maxX: cx + 4.4,
    minZ: cz - 3.7,
    maxZ: cz + 1.2,
  });

  // =========================================================================
  // 3. IŞIKLI BÜYÜK KURUMSAL ÇATI TABELASI & GECE AYDINLATMASI
  // =========================================================================
  const signGroup = new THREE.Group();
  signGroup.position.set(cx, 4.45, cz + 1.25);
  group.add(signGroup);

  // Ahşap tabela kasası ve altın pervaz çerçevesi
  box(signGroup, [6.8, 0.95, 0.18], [0, 0, 0], "#3e2723");
  box(signGroup, [6.95, 1.05, 0.12], [0, 0, -0.02], "#d4af37"); // Altın yaldız pervaz

  // Ana Tabela Metni
  const mainSign = label("🌿 TARİHİ ÇARŞI AKTARI & ŞİFAHANESİ · İDRİS EFENDİ 🧪", "#fff4d4", "#1b5e20");
  mainSign.scale.set(6.4, 0.9, 1);
  mainSign.position.set(0, 0.16, 0.11);
  signGroup.add(mainSign);

  // Alt Kurumsal Şerit Metni
  const subSign = label("LOKMAN HEKİM ŞİFALI BİTKİLERİ · BAHARAT & DOĞAL MACUNLAR · 1892", "#fffde7", "#2e7d32");
  subSign.scale.set(5.8, 0.5, 1);
  subSign.position.set(0, -0.25, 0.11);
  signGroup.add(subSign);

  // Sıcak Kehribar Dükkan & Tezgah Aydınlatma Armatürü (PointLight)
  const workLight = new THREE.PointLight("#ffb74d", 1.4, 18, 1.2);
  workLight.position.set(cx, 3.6, cz + 1.8);
  group.add(workLight);

  // Asılı Ferforje Pirinç Kafesli Kandil Feneri
  cylinder(group, 0.03, 0.03, 0.8, [cx, 3.4, cz + 1.8], "#d4af37", 6); // Askı zinciri
  cylinder(group, 0.22, 0.18, 0.45, [cx, 2.9, cz + 1.8], "#d4af37", 8); // Pirinç kafes
  const lanternGlass = cylinder(group, 0.16, 0.14, 0.35, [cx, 2.9, cz + 1.8], "#ffe082", 8); // Kandil camı
  lanternGlass.material = mat("#ffe082", 0.2);

  // =========================================================================
  // 4. RENKLİ BAHARAT PİRAMİTLERİ, ÇANAKLAR & JÜT ÇUVALLAR
  // =========================================================================
  // Masif Ceviz Baharat Tezgahı (Ön cephede X: 24.5, Z: 43.1)
  const counterX = cx + 0.4;
  const counterZ = cz + 0.8;
  box(group, [4.2, 0.85, 1.2], [counterX, 0.48, counterZ], "#5d4037"); // Tezgah gövdesi
  box(group, [4.4, 0.12, 1.4], [counterX, 0.94, counterZ], "#4e342e"); // Üst kalın tabla

  // 4 Farklı Karakteristik Canlı Baharat Piramidi & Pirinç Kaseleri
  const SPICES = [
    { name: "ANTEP PUL BİBER & SUMAK", color: "#c0392b", x: counterX - 1.5, radius: 0.38, height: 0.52 },
    { name: "HİNT ZERDEÇAL & SAFRAN", color: "#f39c12", x: counterX - 0.5, radius: 0.36, height: 0.48 },
    { name: "DAĞ KEKİĞİ & NANE", color: "#27ae60", x: counterX + 0.5, radius: 0.35, height: 0.46 },
    { name: "TATLI TOZ BİBER & KİMYON", color: "#d35400", x: counterX + 1.5, radius: 0.38, height: 0.50 },
  ];

  SPICES.forEach((sp) => {
    // Bakır/pirinç kase kaidesi
    cylinder(group, sp.radius + 0.05, sp.radius + 0.02, 0.12, [sp.x, 1.04, counterZ], "#b87333", 16);
    // Konik baharat piramidi tepesi
    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(sp.radius, sp.height, 16),
      mat(sp.color, 0.8),
    );
    mound.position.set(sp.x, 1.1 + sp.height / 2, counterZ);
    group.add(mound);

    // Küçük ahşap baharat küreği (spice scoop sapı tepeye batırılmış)
    const scoopHandle = cylinder(group, 0.02, 0.02, 0.28, [sp.x + 0.08, 1.35, counterZ - 0.05], "#ecd9b8", 6);
    scoopHandle.rotation.z = 0.35;
  });

  // Tezgah Önünde Sıralı Rustik Jüt Baharat Çuvalları (EUR çuval bezleri)
  const SACKS = [
    { labelText: "İPEK PUL BİBER", spiceColor: "#c0392b", x: counterX - 1.4, z: counterZ + 0.95 },
    { labelText: "KİMYON & TARÇIN", spiceColor: "#d35400", x: counterX - 0.3, z: counterZ + 0.98 },
    { labelText: "HİNT SAFRANI", spiceColor: "#f1c40f", x: counterX + 0.8, z: counterZ + 0.94 },
  ];

  SACKS.forEach((sack) => {
    // Çuval gövdesi (büzgülü rustik kenevir silindiri)
    cylinder(group, 0.36, 0.38, 0.65, [sack.x, 0.35, sack.z], "#d7ccc8", 12);
    cylinder(group, 0.33, 0.36, 0.12, [sack.x, 0.68, sack.z], "#bcaaa4", 12); // Katlanmış çuval ağzı
    // Açık çuvalın üstünden görünen baharat katmanı
    cylinder(group, 0.30, 0.30, 0.04, [sack.x, 0.72, sack.z], sack.spiceColor, 12);

    // Çuval etiketi
    const sackLabel = label(sack.labelText, "#3e2723", "#d7ccc8");
    sackLabel.scale.set(0.65, 0.25, 1);
    sackLabel.position.set(sack.x, 0.36, sack.z + 0.38);
    group.add(sackLabel);
  });

  // =========================================================================
  // 5. SAÇAKLARDAN ASILI KURUTULMUŞ BİBER, PATLICAN VE OTLAR
  // =========================================================================
  const garlandGroup = new THREE.Group();
  garlandGroup.position.set(cx, 3.4, cz + 0.9);
  group.add(garlandGroup);

  // Kırmızı kurutulmuş sivri acı biber dizileri
  for (let gx = -2.8; gx <= 2.8; gx += 0.9) {
    cylinder(garlandGroup, 0.008, 0.008, 1.2, [gx, -0.6, 0], "#3e2723", 4); // İp
    // Sıralı kırmızı biber taneleri
    for (let gy = -0.15; gy >= -1.1; gy -= 0.14) {
      const pepper = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.14, 6),
        mat("#b71c1c"),
      );
      pepper.position.set(gx + (Math.sin(gy * 8) * 0.04), gy, 0);
      pepper.rotation.z = Math.sin(gy * 12) * 0.4;
      garlandGroup.add(pepper);
    }
  }

  // Mor/siyah kurutulmuş dolmalık patlıcan oyuntusu dizileri
  for (let ex = -2.35; ex <= 2.35; ex += 1.8) {
    cylinder(garlandGroup, 0.008, 0.008, 0.9, [ex, -0.45, 0.15], "#3e2723", 4);
    for (let ey = -0.18; ey >= -0.85; ey -= 0.18) {
      cylinder(garlandGroup, 0.065, 0.06, 0.12, [ex, ey, 0.15], "#2c1d30", 8);
    }
  }

  // Kurutulmuş dağ kekiği ve adaçayı demetleri
  for (const hx of [-3.2, 3.2]) {
    cylinder(garlandGroup, 0.01, 0.01, 0.5, [hx, -0.25, 0.05], "#8d6e63", 4);
    cylinder(garlandGroup, 0.16, 0.08, 0.45, [hx, -0.55, 0.05], "#33691e", 8);
  }

  // =========================================================================
  // 6. LOKMAN HEKİM ŞİFAHANE CAM ŞİŞELERİ & ÇOK ÇEKMECELİ DOLAP
  // =========================================================================
  // Doğu İç Duvar: Ahşap Çok Çekmeceli Aktar Dolabı (X: 27.2, Z: 41.5)
  const cabX = cx + 2.8;
  const cabZ = cz - 0.8;
  box(group, [1.4, 2.6, 2.8], [cabX, 1.45, cabZ], "#4e342e"); // Dolap masif gövde

  // 12 Adet Pirinç Kulplu Minik Çekmece Izgarası
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const drawX = cabX - 0.68;
      const drawY = 0.65 + row * 0.55;
      const drawZ = cabZ - 0.9 + col * 0.9;
      box(group, [0.08, 0.45, 0.75], [drawX, drawY, drawZ], "#5d4037");
      cylinder(group, 0.025, 0.025, 0.08, [drawX - 0.06, drawY, drawZ], "#d4af37", 6); // Pirinç kulp
    }
  }

  // Cam Şifahane Vitrin Rafı & Sıralı Şifa Tentür Kavanozları (X: 26.2, Z: 42.6)
  box(group, [1.2, 0.95, 0.55], [APOTHECARY_VITRINE_POS.x, 0.52, APOTHECARY_VITRINE_POS.z], "#5d4037");
  box(group, [1.1, 0.65, 0.45], [APOTHECARY_VITRINE_POS.x, 1.35, APOTHECARY_VITRINE_POS.z], "#80deea", 0.45); // Cam vitrin

  // Sıralı Amber, Zümrüt ve Safir Eczacı Şişeleri
  const JARS = [
    { color: "#e65100", x: APOTHECARY_VITRINE_POS.x - 0.35, z: APOTHECARY_VITRINE_POS.z }, // Amber tentür
    { color: "#1b5e20", x: APOTHECARY_VITRINE_POS.x - 0.12, z: APOTHECARY_VITRINE_POS.z }, // Zümrüt şurup
    { color: "#0d47a1", x: APOTHECARY_VITRINE_POS.x + 0.12, z: APOTHECARY_VITRINE_POS.z }, // Safir özüt
    { color: "#b71c1c", x: APOTHECARY_VITRINE_POS.x + 0.35, z: APOTHECARY_VITRINE_POS.z }, // Gül şurubu
  ];
  JARS.forEach((jar) => {
    cylinder(group, 0.075, 0.075, 0.22, [jar.x, 1.15, jar.z], jar.color, 8);
    cylinder(group, 0.045, 0.045, 0.06, [jar.x, 1.28, jar.z], "#d4af37", 6); // Pirinç kapak
  });

  // =========================================================================
  // 7. PİRİNÇ DENGE TERAZİSİ, DÖKME BRONZ HAVAN & ÖĞÜTME ANİMASYONU
  // =========================================================================
  // Döküm Pirinç Çift Kefeli Denge Terazisi (X: 23.6, Z: 43.1)
  const scaleX = counterX - 0.9;
  const scaleZ = counterZ - 0.2;
  cylinder(group, 0.14, 0.16, 0.06, [scaleX, 1.02, scaleZ], "#d4af37", 12); // Taban kaidesi
  cylinder(group, 0.025, 0.025, 0.65, [scaleX, 1.35, scaleZ], "#d4af37", 8); // Dikey pirinç sütun
  box(group, [0.65, 0.025, 0.025], [scaleX, 1.65, scaleZ], "#d4af37"); // Yatay denge kolu

  // Sol ve Sağ Kefeler (Asılı pirinç tavalar)
  for (const side of [-0.28, 0.28]) {
    cylinder(group, 0.005, 0.005, 0.25, [scaleX + side, 1.52, scaleZ], "#d4af37", 4); // İnce zincir
    cylinder(group, 0.11, 0.08, 0.03, [scaleX + side, 1.38, scaleZ], "#d4af37", 10); // Kefe tavası
  }
  // Pirinç gramaj ağırlıkları seti
  cylinder(group, 0.035, 0.035, 0.08, [scaleX + 0.38, 1.03, scaleZ - 0.15], "#d4af37", 8);
  cylinder(group, 0.025, 0.025, 0.06, [scaleX + 0.44, 1.02, scaleZ - 0.15], "#d4af37", 8);

  // Dökme Bronz Havan & Animasyonlu Havaneli (Mortar & Pestle - X: 25.2, Z: 43.2)
  const mortarGroup = new THREE.Group();
  mortarGroup.position.set(MORTAR_POS.x, 1.0, MORTAR_POS.z);
  group.add(mortarGroup);

  // Ağır bronz havan gövdesi
  cylinder(mortarGroup, 0.16, 0.12, 0.22, [0, 0.11, 0], "#cd7f32", 14);
  cylinder(mortarGroup, 0.13, 0.13, 0.03, [0, 0.21, 0], "#33691e", 10); // İçinde ezilen şifalı zencefil/nane ezmesi

  // Ritmik ezme ve öğütme animasyonu yapacak havaneli (Pestle)
  const pestleMesh = cylinder(mortarGroup, 0.032, 0.045, 0.38, [0, 0.32, 0], "#b87333", 8);
  pestleMesh.rotation.z = 0.25;

  // Havandan yükselen aromatik şifalı koku buharı / bitki partikülleri
  const aromaGroup = new THREE.Group();
  aromaGroup.position.set(MORTAR_POS.x, 1.25, MORTAR_POS.z);
  group.add(aromaGroup);

  const steamParticles: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + i * 0.015, 6, 6),
      mat("#aed581", 0.35),
    );
    puff.position.set(
      (Math.random() - 0.5) * 0.15,
      i * 0.14,
      (Math.random() - 0.5) * 0.15,
    );
    aromaGroup.add(puff);
    steamParticles.push(puff);
  }

  // =========================================================================
  // 8. ANİMASYONLU USTA AKTAR NPC — "AKTAR İDRİS EFENDİ" (X: 22.8, Z: 43.6)
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(IDRIS_EFENDI_POS.x, 0, IDRIS_EFENDI_POS.z);
  group.add(npcGroup);

  // Gövde ve kafa rotasyon takip grupları
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0, 0);
  npcGroup.add(torsoGroup);

  // Ayaklar ve koyu kahve esnaf pantolonu
  box(torsoGroup, [0.24, 0.75, 0.26], [-0.18, 0.38, 0], "#3e2723");
  box(torsoGroup, [0.24, 0.75, 0.26], [0.18, 0.38, 0], "#3e2723");
  box(torsoGroup, [0.26, 0.15, 0.38], [-0.18, 0.08, 0.05], "#1b120c"); // Deri çarık/ayakkabı
  box(torsoGroup, [0.26, 0.15, 0.38], [0.18, 0.08, 0.05], "#1b120c");

  // Gövde: Beyaz gömlek, zümrüt yeşili kadife cepken yelek & ipek kırmızı kuşak
  box(torsoGroup, [0.65, 0.85, 0.38], [0, 1.15, 0], "#ffffff"); // Beyaz gömlek
  box(torsoGroup, [0.68, 0.78, 0.40], [0, 1.18, 0], "#1e8449"); // Zümrüt yeşili işlemeli cepken yelek
  box(torsoGroup, [0.67, 0.18, 0.42], [0, 0.82, 0], "#c0392b"); // İpek kırmızı kuşak

  // Sol Kol: Belde dinlenir pozisyonda
  const leftArm = cylinder(torsoGroup, 0.09, 0.08, 0.65, [-0.42, 1.1, 0], "#1e8449", 8);
  leftArm.rotation.z = -0.22;
  // Sol elde tutulan taze nane demeti
  cylinder(torsoGroup, 0.08, 0.04, 0.24, [-0.48, 0.82, 0.05], "#33691e", 8);

  // Sağ Kol: Selamlama ve el sallama animasyonu yapacak grup
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.42, 1.45, 0);
  torsoGroup.add(rightArmGroup);

  cylinder(rightArmGroup, 0.09, 0.08, 0.65, [0, -0.32, 0], "#1e8449", 8);
  cylinder(rightArmGroup, 0.07, 0.07, 0.15, [0, -0.65, 0], "#f5cba7", 8); // Sağ el

  // Baş Grubu: Kafa takibi (Head tracking)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.68, 0);
  torsoGroup.add(headGroup);

  // Yüz ve ten rengi
  box(headGroup, [0.38, 0.42, 0.36], [0, 0.18, 0], "#f5cba7");

  // Bilge Ak Sakal ve Bıyık
  box(headGroup, [0.42, 0.32, 0.22], [0, -0.05, 0.14], "#ffffff"); // Beyaz sakal
  box(headGroup, [0.34, 0.10, 0.16], [0, 0.12, 0.16], "#f5f5f5"); // Pos bıyık

  // Yuvarlak Tel Gözlükler (Pirinç çerçeveler)
  cylinder(headGroup, 0.055, 0.055, 0.02, [-0.10, 0.22, 0.19], "#d4af37", 8);
  cylinder(headGroup, 0.055, 0.055, 0.02, [0.10, 0.22, 0.19], "#d4af37", 8);
  box(headGroup, [0.08, 0.015, 0.015], [0, 0.22, 0.19], "#d4af37"); // Gözlük köprüsü

  // Geleneksel Bordo Fes & Siyah Püskül
  cylinder(headGroup, 0.22, 0.20, 0.26, [0, 0.46, 0], "#7b1113", 12);
  cylinder(headGroup, 0.015, 0.015, 0.18, [0.06, 0.48, -0.10], "#111111", 4); // Püskül ipi

  // 3D Konuşma Balonu Grubu
  const calloutGroup = new THREE.Group();
  calloutGroup.position.set(0, 2.75, 0);
  npcGroup.add(calloutGroup);
  calloutGroup.visible = false;

  let currentBubbleText = "";
  let bubbleLabel: THREE.Sprite | null = null;

  function updateBubble(text: string) {
    if (text === currentBubbleText && bubbleLabel) return;
    if (bubbleLabel) {
      calloutGroup.remove(bubbleLabel);
      try {
        bubbleLabel.material.dispose();
      } catch {}
      bubbleLabel = null;
    }
    currentBubbleText = text;
    bubbleLabel = label(text, "#1b5e20", "#ffffff");
    bubbleLabel.scale.set(5.6, 1.1, 1);
    calloutGroup.add(bubbleLabel);
  }

  updateBubble(IDRIS_EFENDI_CALLOUTS[0]);

  // =========================================================================
  // 9. UPDATE, ANİMASYON VE ONPLAYERHONK
  // =========================================================================
  let greetingTimer = 0;
  let activeCalloutText = IDRIS_EFENDI_CALLOUTS[0];
  let animTime = 0;

  return {
    group,
    obstacles,

    update(
      dt: number,
      stateOrNight?: HerbalistState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      const state = typeof stateOrNight === "object" ? stateOrNight : null;
      const night = typeof stateOrNight === "boolean" ? stateOrNight : Boolean(isNightOrDusk);
      animTime += dt;

      // Gece aydınlatması
      workLight.intensity = night ? 2.2 : 1.2;

      // Havaneli (Pestle) ritmik öğütme animasyonu
      const pestleStroke = Math.sin(animTime * 4.5);
      pestleMesh.position.y = 0.32 + Math.abs(pestleStroke) * 0.12;
      pestleMesh.rotation.z = 0.25 + Math.sin(animTime * 3.5) * 0.15;

      // Aromatik şifa buharı yükselme animasyonu
      steamParticles.forEach((puff, idx) => {
        puff.position.y = ((animTime * 0.4 + idx * 0.25) % 0.6);
        puff.scale.setScalar(0.7 + puff.position.y * 1.5);
      });

      // Selamlama zamanlayıcısı
      if (state && state.honkGreetingTimer > 0) {
        greetingTimer = state.honkGreetingTimer;
        if (state.lastHonkCallout) {
          activeCalloutText = state.lastHonkCallout;
        }
      } else if (greetingTimer > 0) {
        greetingTimer = Math.max(0, greetingTimer - dt);
      }

      // Aktar İdris Efendi Kafa ve Gövde Takibi (22m mesafe)
      if (playerPos) {
        const dx = playerPos.x - IDRIS_EFENDI_POS.x;
        const dz = playerPos.z - IDRIS_EFENDI_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, targetAngle, 0.08);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetAngle * 0.4, 0.12);
        } else {
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, 0, 0.04);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.04);
        }
      }

      // Selamlama / El Sallama Animasyonu
      if (greetingTimer > 0) {
        // Kolu havaya kaldırıp bilgece selam verme hareketi
        const waveAngle = -Math.PI * 0.72 + Math.sin(greetingTimer * 9.0) * 0.30;
        rightArmGroup.rotation.z = waveAngle;
        rightArmGroup.rotation.x = Math.sin(greetingTimer * 7.0) * 0.20;

        // 3D Konuşma balonunu göster
        updateBubble(activeCalloutText);
        calloutGroup.visible = true;
      } else {
        rightArmGroup.rotation.z = THREE.MathUtils.lerp(rightArmGroup.rotation.z, 0, 0.1);
        rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, 0, 0.1);
        calloutGroup.visible = false;
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - IDRIS_EFENDI_POS.x,
        playerPos.z - IDRIS_EFENDI_POS.z,
      );
      if (dist <= 24.0) {
        greetingTimer = 4.5;
        const idx = Math.floor(Math.random() * IDRIS_EFENDI_CALLOUTS.length);
        activeCalloutText = IDRIS_EFENDI_CALLOUTS[idx];
        updateBubble(activeCalloutText);
        calloutGroup.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      obstacles.length = 0;
      if (bubbleLabel) {
        try {
          bubbleLabel.material.dispose();
        } catch {}
      }
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
        if (obj instanceof THREE.Light) {
          obj.dispose?.();
        }
      });
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {}
      });
      disposables.length = 0;
    },
  };
}
