import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type SchoolState,
  SCHOOL_CENTER,
  SCHOOL_BAY,
  HASAN_DAYI_POS,
  HASAN_DAYI_CALLOUTS,
} from "../game/school";

export type SchoolView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: SchoolState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu" (T51)
 * - Otantik Türk Erken Cumhuriyet Dönemi Taş Mektep Mimarisi:
 *   - Kesme kireçtaşı cephe, köşe silmeleri, kiremit kırma çatı
 *   - Çatı ortasında bakır çan kulesi (belfry) ve pirinç okul zili
 *   - Gece PointLight aydınlatmalı tabela: "🏫 GÜNEŞ MAHALLESİ İLKOKULU 🔔"
 *   - Alt şerit: "T.C. MİLLİ EĞİTİM BAKANLIĞI · TARİHİ TAŞ MEKTEP · 1938"
 *   - Okul bahçesi tören alanı, bayrak direği ve dalgalanan Türk bayrağı
 *   - Rengarenk tebeşirle çizilmiş 1-10 numaralı seksek alanı (hopscotch)
 *   - Okul önünde park etmiş sarı belediye servis minibüsü ("34 MK 2026 - OKUL TAŞITI")
 *   - Mermer okul bahçesi çeşmesi (hayrat), öğrenci bisiklet park demiri
 *   - Oyuncu servis ve yanaşma peronu (SCHOOL_BAY: X: -35.0, Z: -46.5)
 * - Animasyonlu Okul Geçidi Görevlisi NPC — "Hasan Dayı" (X: -37.2, Z: -46.5):
 *   - Reflektörlü sarı emniyet yeleği, beyaz zabıta kasketi, pala bıyık
 *   - Elinde "DUR / GEÇ" okul geçidi paleti ile yönlendirme animasyonu
 *   - Oyuncu aracına yönelen baş/gövde takibi (head tracking) ve 3D konuşma balonu
 */
export function createSchoolView(): SchoolView {
  const group = new THREE.Group();
  group.name = "school-view";

  const obstacles: Rect[] = [];

  const originX = SCHOOL_CENTER.x; // -35.0
  const originZ = SCHOOL_CENTER.z; // -36.5

  // =========================================================================
  // 1. OYUNCU SERVİS PERONU & BAHÇE ZEMİNİ
  // =========================================================================
  const bayX = SCHOOL_BAY.x; // -35.0
  const bayZ = SCHOOL_BAY.z; // -46.5

  // Okul tören bahçesi taş döşeme tablası (Z=-50 bulvarının güney cephesi)
  box(group, [14.0, 0.08, 12.0], [originX, 0.04, originZ - 2.5], "#a4b0be"); // Courtyard paver
  box(group, [5.2, 0.09, 3.2], [bayX, 0.045, bayZ], "#57606f"); // Dropoff bay asphalt

  // Yanaşma peronu sarı-beyaz sınır çizgileri
  box(group, [5.0, 0.015, 0.12], [bayX, 0.06, bayZ + 1.5], "#ffffff");
  box(group, [5.0, 0.015, 0.12], [bayX, 0.06, bayZ - 1.5], "#ffffff");
  box(group, [0.12, 0.015, 3.0], [bayX - 2.5, 0.06, bayZ], "#ffffff");
  box(group, [0.12, 0.015, 3.0], [bayX + 2.5, 0.06, bayZ], "#ffffff");

  // Kaldırım taşı ve okul yolu emniyet çizgileri
  for (let bx = -2.2; bx <= 2.2; bx += 0.8) {
    box(group, [0.35, 0.016, 0.14], [bayX + bx, 0.062, bayZ - 1.58], "#f1c40f");
    box(group, [0.35, 0.016, 0.14], [bayX + bx + 0.4, 0.062, bayZ - 1.58], "#2f3542");
  }

  // Zemin beyaz kılavuz yön oku
  box(group, [0.26, 0.015, 1.2], [bayX, 0.061, bayZ], "#ffffff");
  box(group, [0.75, 0.015, 0.26], [bayX, 0.061, bayZ - 0.45], "#ffffff");

  // =========================================================================
  // 2. GELENEKSEL TARİHİ TAŞ MEKTEP BİNASI
  // =========================================================================
  const bldgWidth = 9.4;
  const bldgHeight = 4.6;
  const bldgDepth = 5.2;
  const bldgZ = originZ + 0.5; // -36.0

  // Taş süpürgelik kaidesi
  box(group, [bldgWidth + 0.4, 0.6, bldgDepth + 0.4], [originX, 0.3, bldgZ], "#747d8c");

  // Ana bina gövdesi (Kesme kireçtaşı cephe)
  box(group, [bldgWidth, bldgHeight - 0.6, bldgDepth], [originX, 0.6 + (bldgHeight - 0.6) / 2, bldgZ], "#dcdde1");

  // Taş köşe silmeleri (quoins)
  for (const cx of [-bldgWidth / 2 + 0.25, bldgWidth / 2 - 0.25]) {
    for (const cz of [-bldgDepth / 2 + 0.25, bldgDepth / 2 - 0.25]) {
      box(group, [0.55, bldgHeight, 0.55], [originX + cx, bldgHeight / 2, bldgZ + cz], "#b2bec3");
    }
  }

  // Ahşap saçak ve friz kornişi
  box(group, [bldgWidth + 0.5, 0.3, bldgDepth + 0.5], [originX, bldgHeight + 0.15, bldgZ], "#5d4037");

  // Kırma kiremit çatı (Terracotta hipped roof)
  box(group, [bldgWidth + 0.9, 0.4, bldgDepth + 0.9], [originX, bldgHeight + 0.45, bldgZ], "#b03a2e");
  box(group, [bldgWidth - 1.2, 0.7, bldgDepth - 1.0], [originX, bldgHeight + 0.95, bldgZ], "#962d22");
  box(group, [bldgWidth - 3.2, 0.6, bldgDepth - 2.2], [originX, bldgHeight + 1.5, bldgZ], "#7b241c");

  // Çift tuğla baca
  for (const chimX of [-2.8, 2.8]) {
    box(group, [0.5, 1.4, 0.5], [originX + chimX, bldgHeight + 1.6, bldgZ - 0.6], "#9c3d23");
    box(group, [0.65, 0.15, 0.65], [originX + chimX, bldgHeight + 2.35, bldgZ - 0.6], "#5d4037");
  }

  // =========================================================================
  // 3. BAKIR ÇAN KULESİ (COPPER BELL TOWER & PIRINÇ OKUL ZİLİ)
  // =========================================================================
  const belfryY = bldgHeight + 1.8;
  // Taş kule kaidesi
  box(group, [1.6, 0.5, 1.6], [originX, belfryY, bldgZ], "#747d8c");
  // 4 adet kemerli bakır kule ayağı (Weathered copper patina)
  for (const bx of [-0.6, 0.6]) {
    for (const bz of [-0.6, 0.6]) {
      cylinder(group, 0.08, 0.08, 1.2, [originX + bx, belfryY + 0.85, bldgZ + bz], "#2e7d32", 8);
    }
  }
  // Bakır kule kubbe çatısı (Piramit kubbe)
  box(group, [1.8, 0.3, 1.8], [originX, belfryY + 1.55, bldgZ], "#27ae60");
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 1.2, 4),
    new THREE.MeshLambertMaterial({ color: 0x1e8449 }),
  );
  spire.position.set(originX, belfryY + 2.3, bldgZ);
  spire.rotation.y = Math.PI / 4;
  group.add(spire);

  // Kubbe pirinç alem süsü
  cylinder(group, 0.03, 0.03, 0.45, [originX, belfryY + 3.0, bldgZ], "#f1c40f", 8);
  const finialSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xf1c40f }),
  );
  finialSphere.position.set(originX, belfryY + 3.25, bldgZ);
  group.add(finialSphere);

  // Kule içinde asılı parlayan pirinç okul zili / çanı
  const bellMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.28, 0.42, 12),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.85, roughness: 0.25 }),
  );
  bellMesh.position.set(originX, belfryY + 0.95, bldgZ);
  group.add(bellMesh);

  // =========================================================================
  // 4. OKUL TABELASI VE GECE AYDINLATMASI
  // =========================================================================
  // Büyük Işıklı Çatı Tabelası (Öne eğimli kamera okunurluğu)
  const mainSign = label("🏫 GÜNEŞ MAHALLESİ İLKOKULU 🔔", "#ffffff", "#1e3799");
  mainSign.scale.set(6.8, 1.2, 1);
  mainSign.position.set(originX, bldgHeight + 1.1, bldgZ - bldgDepth / 2 - 0.2);
  mainSign.rotation.x = -0.15;
  group.add(mainSign);

  // Alt Kurumsal Şerit Bandı
  const subSign = label("T.C. MİLLİ EĞİTİM BAKANLIĞI · TARİHİ TAŞ MEKTEP · 1938", "#f1c40f", "#0a3d62");
  subSign.scale.set(6.0, 0.42, 1);
  subSign.position.set(originX, bldgHeight + 0.35, bldgZ - bldgDepth / 2 - 0.25);
  subSign.rotation.x = -0.15;
  group.add(subSign);

  // Gece tabela ve cephe aydınlatması
  const facadeLight = new THREE.PointLight(0xfff3cd, 0.85, 16);
  facadeLight.position.set(originX, bldgHeight + 1.4, bldgZ - bldgDepth / 2 - 1.2);
  group.add(facadeLight);

  // =========================================================================
  // 5. CEPHE DETAYLARI: PENCERELER, KAPI, TAŞ BASAMAKLAR
  // =========================================================================
  // Giriş taş basamakları
  box(group, [2.4, 0.2, 1.0], [originX, 0.1, bldgZ - bldgDepth / 2 - 0.5], "#95a5a6");
  box(group, [2.0, 0.2, 0.7], [originX, 0.3, bldgZ - bldgDepth / 2 - 0.35], "#bdc3c7");

  // Çift kanatlı masif ahşap giriş kapısı
  box(group, [1.6, 2.4, 0.15], [originX, 1.5, bldgZ - bldgDepth / 2 + 0.05], "#4b3832");
  // Kapı pirinç tokmakları
  cylinder(group, 0.04, 0.04, 0.1, [originX - 0.25, 1.4, bldgZ - bldgDepth / 2 - 0.05], "#f1c40f", 8);
  cylinder(group, 0.04, 0.04, 0.1, [originX + 0.25, 1.4, bldgZ - bldgDepth / 2 - 0.05], "#f1c40f", 8);

  // Kapı üstü taş kemer ve saçak
  box(group, [2.2, 0.25, 0.5], [originX, 2.85, bldgZ - bldgDepth / 2 - 0.2], "#747d8c");

  // Simetrik mektep pencereleri (Alt ve üst kat sınıfları)
  for (const wx of [-3.2, -1.8, 1.8, 3.2]) {
    // Alt kat penceresi
    box(group, [1.0, 1.3, 0.1], [originX + wx, 1.5, bldgZ - bldgDepth / 2 + 0.02], "#2f3542");
    box(group, [1.1, 0.1, 0.25], [originX + wx, 0.8, bldgZ - bldgDepth / 2 - 0.05], "#747d8c"); // Taş denizlik
    // Üst kat penceresi
    box(group, [1.0, 1.2, 0.1], [originX + wx, 3.4, bldgZ - bldgDepth / 2 + 0.02], "#2f3542");
    box(group, [1.1, 0.1, 0.25], [originX + wx, 2.75, bldgZ - bldgDepth / 2 - 0.05], "#747d8c");
  }

  // =========================================================================
  // 6. BAYRAK DİREĞİ VE DALGALANAN TÜRK BAYRAĞI
  // =========================================================================
  const flagX = originX - 4.5; // -39.5
  const flagZ = originZ - 2.8; // -39.3
  // Beyaz mermer kademeli kaide
  box(group, [1.2, 0.25, 1.2], [flagX, 0.125, flagZ], "#ffffff");
  box(group, [0.8, 0.25, 0.8], [flagX, 0.35, flagZ], "#ecf0f1");
  // Paslanmaz çelik bayrak direği
  cylinder(group, 0.05, 0.06, 6.2, [flagX, 3.45, flagZ], "#bdc3c7", 10);
  // Tepe pirinç alem
  const flagTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xf1c40f }),
  );
  flagTip.position.set(flagX, 6.6, flagZ);
  group.add(flagTip);

  // Dalgalanan Türk Bayrağı
  const flagGroup = new THREE.Group();
  flagGroup.position.set(flagX, 5.7, flagZ);

  // Kırmızı kumaş zemin (1.6m x 1.0m)
  const flagCloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.0, 6, 4),
    new THREE.MeshLambertMaterial({
      color: 0xe74c3c,
      side: THREE.DoubleSide,
    }),
  );
  flagCloth.position.set(0.8, 0, 0);
  flagGroup.add(flagCloth);

  // Hilal ve Yıldız amblemi
  const crestLabel = label("🇹🇷", "#ffffff", "#e74c3c");
  crestLabel.scale.set(0.7, 0.7, 1);
  crestLabel.position.set(0.65, 0, 0.02);
  flagGroup.add(crestLabel);

  group.add(flagGroup);

  // =========================================================================
  // 7. SEkSEK ALANI (HOPSCOTCH COURT ON COURTYARD ASPHALT)
  // =========================================================================
  // Bahçe zemininde 1-10 numaralı renkli tebeşir seksek karesi
  const hopX = originX + 3.2; // -31.8
  const hopZ = originZ - 3.2; // -39.7

  const hopColors = [
    "#00cec9", "#ffeaa7", "#ff7675", "#55efc4", "#fab1a0",
    "#74b9ff", "#a29bfe", "#fdcb6e", "#e17055", "#0984e3",
  ];

  // 1-10 arası kutuları çiziyoruz
  const hopTiles: { num: number; x: number; z: number }[] = [
    { num: 1, x: 0, z: 2.4 },
    { num: 2, x: 0, z: 1.6 },
    { num: 3, x: 0, z: 0.8 },
    { num: 4, x: -0.42, z: 0.0 },
    { num: 5, x: 0.42, z: 0.0 },
    { num: 6, x: 0, z: -0.8 },
    { num: 7, x: -0.42, z: -1.6 },
    { num: 8, x: 0.42, z: -1.6 },
    { num: 9, x: 0, z: -2.4 },
    { num: 10, x: 0, z: -3.2 },
  ];

  hopTiles.forEach((tile) => {
    const tileMesh = box(
      group,
      [0.72, 0.015, 0.72],
      [hopX + tile.x, 0.05, hopZ + tile.z],
      hopColors[tile.num - 1],
    );
    // Beyaz tebeşir sınır çizgisi
    box(group, [0.76, 0.016, 0.04], [hopX + tile.x, 0.052, hopZ + tile.z - 0.36], "#ffffff");
    box(group, [0.76, 0.016, 0.04], [hopX + tile.x, 0.052, hopZ + tile.z + 0.36], "#ffffff");
    box(group, [0.04, 0.016, 0.76], [hopX + tile.x - 0.36, 0.052, hopZ + tile.z], "#ffffff");
    box(group, [0.04, 0.016, 0.76], [hopX + tile.x + 0.36, 0.052, hopZ + tile.z], "#ffffff");

    // Numara etiketi
    const numLabel = label(String(tile.num), "#2d3436", hopColors[tile.num - 1]);
    numLabel.scale.set(0.35, 0.35, 1);
    numLabel.position.set(hopX + tile.x, 0.065, hopZ + tile.z);
    numLabel.rotation.x = -Math.PI / 2;
    group.add(numLabel);
  });

  // Tepe "DÜNYA / GÖKYÜZÜ" yarı dairesi
  box(group, [1.4, 0.015, 0.6], [hopX, 0.05, hopZ - 3.8], "#6c5ce7");
  const skyLabel = label("GÖKYÜZÜ", "#ffffff", "#6c5ce7");
  skyLabel.scale.set(0.9, 0.3, 1);
  skyLabel.position.set(hopX, 0.065, hopZ - 3.8);
  skyLabel.rotation.x = -Math.PI / 2;
  group.add(skyLabel);

  // =========================================================================
  // 8. PARK ETMİŞ SARI BELEDİYE OKUL SERVİS MİNİBÜSÜ ("34 MK 2026")
  // =========================================================================
  const busX = originX + 4.6; // -30.4
  const busZ = originZ - 7.5; // -44.0
  const busGroup = new THREE.Group();
  busGroup.position.set(busX, 0, busZ);

  // Minibüs sarı ana gövdesi (4.8m uzunluk x 2.2m genişlik x 2.1m yükseklik)
  box(busGroup, [2.2, 1.3, 4.6], [0, 1.0, 0], "#f1c40f"); // Okul servis sarısı
  // Beyaz tavan şapkası
  box(busGroup, [2.15, 0.3, 4.5], [0, 1.8, 0], "#ffffff");
  // Alt şasi siyah koruma bandı
  box(busGroup, [2.25, 0.35, 4.7], [0, 0.45, 0], "#2d3436");

  // Karartılmış camlar (Ön cam, yan camlar, arka cam)
  box(busGroup, [2.1, 0.65, 0.15], [0, 1.35, 2.3], "#34495e"); // Ön cam
  box(busGroup, [2.1, 0.55, 0.15], [0, 1.35, -2.3], "#34495e"); // Arka cam
  box(busGroup, [0.15, 0.65, 3.4], [-1.08, 1.35, -0.1], "#34495e"); // Sol yan camlar
  box(busGroup, [0.15, 0.65, 3.4], [1.08, 1.35, -0.1], "#34495e"); // Sağ yan camlar

  // Minibüs 4 adet tekerleği
  for (const wx of [-1.05, 1.05]) {
    for (const wz of [-1.4, 1.4]) {
      cylinder(busGroup, 0.36, 0.36, 0.28, [wx, 0.36, wz], "#1e272e", 12);
      cylinder(busGroup, 0.2, 0.2, 0.3, [wx, 0.36, wz], "#bdc3c7", 8); // Jant
    }
  }

  // Ön tampon, panjur ve farlar
  box(busGroup, [2.3, 0.3, 0.3], [0, 0.4, 2.38], "#2d3436");
  cylinder(busGroup, 0.14, 0.14, 0.1, [-0.8, 0.75, 2.35], "#ffffff", 8); // Sol far
  cylinder(busGroup, 0.14, 0.14, 0.1, [0.8, 0.75, 2.35], "#ffffff", 8); // Sağ far

  // Plakalar ("34 MK 2026")
  const frontPlate = label("34 MK 2026", "#000000", "#ffffff");
  frontPlate.scale.set(0.9, 0.25, 1);
  frontPlate.position.set(0, 0.4, 2.46);
  busGroup.add(frontPlate);

  const rearPlate = label("34 MK 2026", "#000000", "#ffffff");
  rearPlate.scale.set(0.9, 0.25, 1);
  rearPlate.position.set(0, 0.4, -2.46);
  rearPlate.rotation.y = Math.PI;
  busGroup.add(rearPlate);

  // Yan "OKUL TAŞITI" siyah-kırmızı şerit levhası
  const busSideSignL = label("OKUL TAŞITI", "#ffffff", "#c0392b");
  busSideSignL.scale.set(2.4, 0.45, 1);
  busSideSignL.position.set(-1.12, 1.05, 0);
  busSideSignL.rotation.y = -Math.PI / 2;
  busGroup.add(busSideSignL);

  // Şoför tarafı açılır sekizgen kırmızı "DUR" levhası (STOP paddle)
  const stopSignGroup = new THREE.Group();
  stopSignGroup.position.set(-1.25, 1.1, 1.0);
  const stopMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0xc0392b }),
  );
  stopMesh.rotation.x = Math.PI / 2;
  stopSignGroup.add(stopMesh);
  const stopLabel = label("DUR", "#ffffff", "#c0392b");
  stopLabel.scale.set(0.45, 0.25, 1);
  stopLabel.position.set(0, 0, 0.04);
  stopSignGroup.add(stopLabel);
  busGroup.add(stopSignGroup);

  group.add(busGroup);

  // =========================================================================
  // 9. OKUL GEÇİDİ GÖREVLİSİ NPC — "HASAN DAYI"
  // =========================================================================
  const hasanX = HASAN_DAYI_POS.x; // -37.2
  const hasanZ = HASAN_DAYI_POS.z; // -46.5
  const hasanGroup = new THREE.Group();
  hasanGroup.position.set(hasanX, 0, hasanZ);

  // Bacaklar (Lacivert pantolon)
  cylinder(hasanGroup, 0.09, 0.09, 0.85, [-0.15, 0.425, 0], "#1e3799", 8);
  cylinder(hasanGroup, 0.09, 0.09, 0.85, [0.15, 0.425, 0], "#1e3799", 8);
  // Siyah zabıta/görevli ayakkabıları
  box(hasanGroup, [0.16, 0.12, 0.26], [-0.15, 0.06, 0.05], "#2d3436");
  box(hasanGroup, [0.16, 0.12, 0.26], [0.15, 0.06, 0.05], "#2d3436");

  // Gövde (Reflektörlü fosforlu sarı/yeşil emniyet yeleği ve beyaz gömlek)
  box(hasanGroup, [0.52, 0.72, 0.32], [0, 1.15, 0], "#c0ca33"); // Fosforlu sarı yelek
  // Gümüş reflektör yatay şeritleri
  box(hasanGroup, [0.54, 0.08, 0.34], [0, 1.25, 0], "#ffffff");
  box(hasanGroup, [0.54, 0.08, 0.34], [0, 1.0, 0], "#ffffff");

  // Baş ve Yüz (Dost canlısı mektep bekçisi ve geçit amcası)
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0xffdbac }),
  );
  headMesh.position.set(0, 1.65, 0);
  hasanGroup.add(headMesh);

  // Hasan Dayı pala bıyık
  box(hasanGroup, [0.22, 0.07, 0.08], [0, 1.6, 0.18], "#7f8c8d");

  // Beyaz zabıta / trafik memuru kasketi (Peaked cap with black visor)
  cylinder(hasanGroup, 0.24, 0.22, 0.16, [0, 1.78, 0], "#ffffff", 10);
  box(hasanGroup, [0.26, 0.04, 0.16], [0, 1.73, 0.18], "#2d3436"); // Siyah siperlik

  // Sol kol (Gövde yanında hazır duruş)
  const leftArm = cylinder(hasanGroup, 0.06, 0.06, 0.65, [-0.34, 1.12, 0], "#1e3799", 8);
  leftArm.rotation.z = -0.15;

  // Sağ kol pivotu ve elinde tuttuğu "DUR / GEÇ" Okul Geçidi Paleti
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 1.38, 0);
  hasanGroup.add(rightArmPivot);

  // Sağ kol
  cylinder(rightArmPivot, 0.06, 0.06, 0.65, [0.08, -0.28, 0.08], "#1e3799", 8);
  // El
  const rightHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 6),
    new THREE.MeshLambertMaterial({ color: 0xffdbac }),
  );
  rightHand.position.set(0.12, -0.58, 0.16);
  rightArmPivot.add(rightHand);

  // Okul Geçidi Dur/Geç Paleti Sapı (Alüminyum sopa)
  cylinder(rightArmPivot, 0.025, 0.025, 0.95, [0.12, -0.45, 0.25], "#bdc3c7", 8);
  // Dairesel Palet Diski (Ön: DUR Kırmızı, Arka: GEÇ Yeşil)
  const paddleDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0xc0392b }),
  );
  paddleDisc.position.set(0.12, -0.15, 0.25);
  paddleDisc.rotation.x = Math.PI / 2;
  rightArmPivot.add(paddleDisc);

  // Ön DUR etiketi
  const durLabel = label("DUR", "#ffffff", "#c0392b");
  durLabel.scale.set(0.35, 0.2, 1);
  durLabel.position.set(0.12, -0.15, 0.28);
  rightArmPivot.add(durLabel);

  // Arka GEÇ etiketi
  const gecLabel = label("GEÇ", "#ffffff", "#27ae60");
  gecLabel.scale.set(0.35, 0.2, 1);
  gecLabel.position.set(0.12, -0.15, 0.22);
  gecLabel.rotation.y = Math.PI;
  rightArmPivot.add(gecLabel);

  // Hasan Dayı 3D Konuşma Balonu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.45, 0);
  bubbleGroup.visible = false;
  hasanGroup.add(bubbleGroup);

  group.add(hasanGroup);

  // =========================================================================
  // 10. ÇEVRE DETAYLARI: MERMER ÇEŞME, BİSİKLETLİK, ÇİTLER & AĞAÇLAR
  // =========================================================================
  // Mermer Okul Çeşmesi (Hayrat sokak çeşmesi)
  const ftnX = originX - 4.8;
  const ftnZ = originZ - 6.2;
  box(group, [0.9, 1.4, 0.5], [ftnX, 0.7, ftnZ], "#ffffff");
  box(group, [1.05, 0.2, 0.65], [ftnX, 1.45, ftnZ], "#bdc3c7"); // Üst kemer
  cylinder(group, 0.025, 0.025, 0.15, [ftnX, 0.75, ftnZ + 0.28], "#f1c40f", 8); // Pirinç musluk
  box(group, [0.75, 0.35, 0.45], [ftnX, 0.2, ftnZ + 0.35], "#ecf0f1"); // Su yalağı

  // Öğrenci Bisiklet Park Demiri (Bicycle rack)
  const bikeX = originX + 5.0;
  const bikeZ = originZ - 3.0;
  box(group, [0.1, 0.6, 2.4], [bikeX, 0.3, bikeZ], "#7f8c8d");
  for (let bz = -0.9; bz <= 0.9; bz += 0.45) {
    cylinder(group, 0.02, 0.02, 0.65, [bikeX, 0.32, bikeZ + bz], "#bdc3c7", 6);
  }

  // Okul Duyuru Panosu (Bulletin Board)
  const noticeX = originX - 2.5;
  const noticeZ = originZ - 7.6;
  box(group, [1.4, 1.0, 0.1], [noticeX, 1.4, noticeZ], "#5d4037");
  const noticeLabel = label("DERS PROGRAMI & DUYURULAR", "#ffffff", "#2c3e50");
  noticeLabel.scale.set(1.2, 0.3, 1);
  noticeLabel.position.set(noticeX, 1.4, noticeZ + 0.06);
  group.add(noticeLabel);

  // Okul Bahçe Giriş Çitleri ve Taş Direkler
  // Batı Çit Duvarı
  box(group, [0.4, 1.2, 10.0], [originX - 6.8, 0.6, originZ - 2.0], "#ffffff");
  box(group, [0.6, 1.5, 0.6], [originX - 6.8, 0.75, originZ - 7.0], "#747d8c"); // Köşe taş direk
  box(group, [0.6, 1.5, 0.6], [originX - 6.8, 0.75, originZ + 3.0], "#747d8c");

  // Doğu Çit Duvarı
  box(group, [0.4, 1.2, 10.0], [originX + 6.8, 0.6, originZ - 2.0], "#ffffff");
  box(group, [0.6, 1.5, 0.6], [originX + 6.8, 0.75, originZ - 7.0], "#747d8c");
  box(group, [0.6, 1.5, 0.6], [originX + 6.8, 0.75, originZ + 3.0], "#747d8c");

  // =========================================================================
  // 11. STATİK ENGEL SINIRLARI (OBSTACLES)
  // =========================================================================
  // 1. Taş Mektep Ana Binası
  obstacles.push({
    minX: originX - bldgWidth / 2 - 0.2,
    maxX: originX + bldgWidth / 2 + 0.2,
    minZ: bldgZ - bldgDepth / 2 - 0.2,
    maxZ: bldgZ + bldgDepth / 2 + 0.2,
  });

  // 2. Park etmiş sarı okul servis minibüsü
  obstacles.push({
    minX: busX - 1.3,
    maxX: busX + 1.3,
    minZ: busZ - 2.4,
    maxZ: busZ + 2.4,
  });

  // 3. Batı Bahçe Çiti
  obstacles.push({
    minX: originX - 7.1,
    maxX: originX - 6.5,
    minZ: originZ - 7.2,
    maxZ: originZ + 3.2,
  });

  // 4. Doğu Bahçe Çiti
  obstacles.push({
    minX: originX + 6.5,
    maxX: originX + 7.1,
    minZ: originZ - 7.2,
    maxZ: originZ + 3.2,
  });

  // =========================================================================
  // 12. ANİMASYON VE GÜNCELLEME DÖNGÜSÜ
  // =========================================================================
  let animTime = 0;
  let currentCallout = "";

  function update(
    dt: number,
    state: SchoolState,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ) {
    animTime += dt;

    // 1. Dalgalanan Türk Bayrağı harmonik salınımı
    flagGroup.rotation.y = Math.sin(state.flagWavePhase) * 0.25;
    flagGroup.rotation.z = Math.cos(state.flagWavePhase * 0.8) * 0.08;

    // 2. Hasan Dayı Okul Geçidi Paleti kaldırma/yönlendirme hareketi
    if (state.honkGreetingTimer > 0) {
      // Coşkulu iki kol havaya kaldırma ve selamlama
      rightArmPivot.rotation.x = -Math.PI * 0.75 + Math.sin(animTime * 10) * 0.35;
      rightArmPivot.rotation.z = Math.sin(animTime * 8) * 0.2;
    } else {
      // Geçit görevlisi dur/geç paletini yavaşça çevirme ve yolu kontrol etme
      rightArmPivot.rotation.x = -Math.PI * 0.35 + Math.sin(animTime * 2.5) * 0.18;
      rightArmPivot.rotation.z = state.paddleAngle * 0.5;
    }

    // 3. Çan kulesindeki okul zilinin hafif salınımı
    bellMesh.rotation.z = Math.sin(animTime * 1.8) * 0.12;

    // 4. Oyuncu aracına baş/gövde takibi (Head tracking - 20 metre içinde)
    if (playerPos) {
      const dx = playerPos.x - hasanGroup.position.x;
      const dz = playerPos.z - hasanGroup.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 20.0) {
        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - hasanGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        hasanGroup.rotation.y += diff * Math.min(1, dt * 4.5);
      }
    }

    // 5. Konuşma balonu güncellemesi
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
        const newLabel = label(state.lastHonkCallout, "#ffffff", "#1e3799");
        newLabel.scale.set(5.8, 0.75, 1);
        newLabel.rotation.x = -0.25;
        bubbleGroup.add(newLabel);
      }
    } else {
      bubbleGroup.visible = false;
      currentCallout = "";
    }

    // 6. Gece ve alacakaranlık aydınlatma şiddeti ayarı
    if (isNightOrDusk) {
      facadeLight.intensity = 1.45;
    } else {
      facadeLight.intensity = 0.55;
    }
  }

  function onPlayerHonk(playerPos: Vec2): boolean {
    const dist = Math.hypot(
      playerPos.x - HASAN_DAYI_POS.x,
      playerPos.z - HASAN_DAYI_POS.z,
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
