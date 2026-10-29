import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type BakeryState,
  BAKERY_CENTER,
  BAKERY_BAY,
  SABAN_USTA_POS,
  SABAN_USTA_CALLOUTS,
} from "../game/bakery";

export type BakeryView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: BakeryState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi" (T52)
 * - Otantik Türk Geleneksel Taş & Tuğla Odun Fırını Mimarisi:
 *   - Rustik kesme taş temel kaidesi, klinker kırmızı tuğla duvarlar, kemerli pencereler
 *   - Öne uzanan kubbeli refrakter taş fırın gövdesi ve kemerli köz odun ateşi fırın ağzı
 *   - Odun ateşi kor ışıltısı ve dinamik titreşen kehribar/turuncu alev ışığı (PointLight)
 *   - Fırın içinde taş taban üzerinde pişen susamlı simitler ve Ramazan pideleri
 *   - Yüksek taş fırın bacasından yükselen canlı odun dumanı partikülleri
 *   - Çatıda öne eğimli büyük aydınlatmalı tabela: "🥖 MEŞHUR TARİHİ SİMİT FIRINI · TAŞ FIRIN ODUN ATEŞİ 🥨"
 *   - Alt kurumsal şerit: "GELENEKSEL ODUN TAŞ FIRINI · ÇITIR SİMİT & RAMAZAN PİDESİ · 1928"
 *   - Kırmızı-krem çizgili nostaljik kumaş tente (awning) ve dalgalı saçak
 *   - Camlı ahşap simit ve ekmek vitrini, dikey ahşap simit askılık direği (simit ağacı)
 *   - Jüt çuval bezinden un çuvalları ("HALİS BUĞDAY UNU - 50 KG") ve istifli meşe odunları
 *   - Tebeşirli karataş A-frame menü panosu ve geleneksel semaver
 *   - Oyuncu yanaşma peronu (BAKERY_BAY: X: 59.5, Z: 31.2)
 * - Animasyonlu Usta Fırıncı NPC — "Fırıncı Şaban Usta" (X: 57.8, Z: 28.5):
 *   - Beyaz fırıncı kıyafeti, unlu önlük, kumaş fırıncı bonesi, pala bıyık
 *   - Elinde tuttuğu 2.4m uzunluğunda ahşap fırın küreği (baker's peel)
 *   - Küreğin ucunda fırına sürülüp çıkarılan dumanı tüten çıtır susamlı simit!
 *   - Fırına simit sürme/çıkarma ileri-geri kol hareketi ve araç kafa takibi (head tracking)
 *   - Korna ve duraklamada küreği havaya kaldırıp selamlama ve 3D konuşma balonu
 */
export function createBakeryView(): BakeryView {
  const group = new THREE.Group();
  group.name = "bakery-view";

  const obstacles: Rect[] = [];

  const originX = BAKERY_CENTER.x; // 59.5
  const originZ = BAKERY_CENTER.z; // 24.5

  // =========================================================================
  // 1. OYUNCU SERVİS PERONU & KALDIRIM ZEMİNİ
  // =========================================================================
  const bayX = BAKERY_BAY.x; // 59.5
  const bayZ = BAKERY_BAY.z; // 31.2

  // Pişmiş toprak klinker tuğla kaldırım tablası (Tarihi tramvay caddesi kuzey kaldırımı)
  box(group, [8.0, 0.08, 9.5], [originX, 0.04, originZ + 2.5], "#b85d39");
  box(group, [4.8, 0.09, 2.6], [bayX, 0.045, bayZ], "#57606f"); // Yanaşma peronu asfalt cebi

  // Yanaşma peronu beyaz sınır çizgileri
  box(group, [4.6, 0.015, 0.12], [bayX, 0.06, bayZ + 1.25], "#ffffff");
  box(group, [4.6, 0.015, 0.12], [bayX, 0.06, bayZ - 1.25], "#ffffff");
  box(group, [0.12, 0.015, 2.5], [bayX - 2.3, 0.06, bayZ], "#ffffff");
  box(group, [0.12, 0.015, 2.5], [bayX + 2.3, 0.06, bayZ], "#ffffff");

  // Kaldırım taşı ve emniyet çizgileri
  for (let bx = -2.0; bx <= 2.0; bx += 0.8) {
    box(group, [0.35, 0.016, 0.14], [bayX + bx, 0.062, bayZ + 1.32], "#e67e22");
    box(group, [0.35, 0.016, 0.14], [bayX + bx + 0.4, 0.062, bayZ + 1.32], "#2f3542");
  }

  // Zemin beyaz kılavuz yön oku
  box(group, [0.26, 0.015, 1.0], [bayX, 0.061, bayZ], "#ffffff");
  box(group, [0.7, 0.015, 0.24], [bayX, 0.061, bayZ + 0.4], "#ffffff");

  // =========================================================================
  // 2. TARİHİ TAŞ & TUĞLA FIRIN BİNASI
  // =========================================================================
  const bldgWidth = 7.6;
  const bldgHeight = 4.8;
  const bldgDepth = 5.2;
  const bldgZ = originZ; // 24.5

  // Kesme kireçtaşı ve moloz taş temel kaidesi
  box(group, [bldgWidth + 0.3, 0.65, bldgDepth + 0.4], [originX, 0.32, bldgZ], "#795548");

  // Pişmiş kırmızı-kahve klinker tuğla duvarlar
  box(
    group,
    [bldgWidth, bldgHeight - 0.65, bldgDepth],
    [originX, 0.65 + (bldgHeight - 0.65) / 2, bldgZ],
    "#a04000",
  );

  // Taş köşe silmeleri (quoins)
  for (const cx of [-bldgWidth / 2 + 0.25, bldgWidth / 2 - 0.25]) {
    for (const cz of [-bldgDepth / 2 + 0.25, bldgDepth / 2 - 0.25]) {
      box(group, [0.55, bldgHeight, 0.55], [originX + cx, bldgHeight / 2, bldgZ + cz], "#d7ccc8");
    }
  }

  // Masif ahşap saçak ve friz kornişi
  box(group, [bldgWidth + 0.4, 0.3, bldgDepth + 0.5], [originX, bldgHeight + 0.15, bldgZ], "#5d4037");

  // Kiremit kırma çatı (Terracotta hip roof)
  const roofGeom = new THREE.ConeGeometry((bldgWidth + 0.5) * 0.68, 1.8, 4);
  roofGeom.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshLambertMaterial({ color: "#b03a2e" });
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.position.set(originX, bldgHeight + 0.3 + 0.9, bldgZ);
  roofMesh.scale.set(1.0, 1.0, bldgDepth / bldgWidth);
  group.add(roofMesh);

  // Üst kat kemerli pencereleri (Güneye bakan ön cephede)
  for (const wx of [-2.0, 0, 2.0]) {
    box(group, [1.0, 1.3, 0.12], [originX + wx, 3.4, bldgZ + bldgDepth / 2 + 0.05], "#3e2723");
    box(group, [0.8, 1.1, 0.14], [originX + wx, 3.4, bldgZ + bldgDepth / 2 + 0.06], "#ffeaa7");
    cylinder(group, 0.02, 0.02, 0.6, [originX + wx - 0.22, 3.1, bldgZ + bldgDepth / 2 + 0.12], "#2d3436", 4);
    cylinder(group, 0.02, 0.02, 0.6, [originX + wx + 0.22, 3.1, bldgZ + bldgDepth / 2 + 0.12], "#2d3436", 4);
  }

  // =========================================================================
  // 3. FIRIN BACASI & YÜKSELEN CANLI ODUN DUMANI
  // =========================================================================
  const chimneyX = originX + 2.3;
  const chimneyZ = bldgZ - 1.0;
  const chimneyHeight = 3.6;
  const chimneyBaseY = bldgHeight;

  // Tuğla fırın bacası gövdesi
  box(group, [0.85, chimneyHeight, 0.85], [chimneyX, chimneyBaseY + chimneyHeight / 2, chimneyZ], "#6d4c41");
  box(group, [1.0, 0.2, 1.0], [chimneyX, chimneyBaseY + chimneyHeight + 0.1, chimneyZ], "#4e342e");

  // Dönen metal duman külahı (rain cowl)
  const cowlMesh = cylinder(
    group,
    0.35,
    0.05,
    0.35,
    [chimneyX, chimneyBaseY + chimneyHeight + 0.35, chimneyZ],
    "#37474f",
    8,
  );

  // Bacadan yükselen 5 adet odun dumanı partikülü
  const smokePuffs: { mesh: THREE.Mesh; seed: number; baseY: number }[] = [];
  const smokeMat = new THREE.MeshBasicMaterial({
    color: "#f5f6fa",
    transparent: true,
    opacity: 0.35,
  });

  for (let i = 0; i < 5; i++) {
    const sGeom = new THREE.SphereGeometry(0.24 + i * 0.06, 6, 6);
    const sMesh = new THREE.Mesh(sGeom, smokeMat);
    const startY = chimneyBaseY + chimneyHeight + 0.5 + i * 0.5;
    sMesh.position.set(chimneyX, startY, chimneyZ);
    group.add(sMesh);
    smokePuffs.push({ mesh: sMesh, seed: i * 1.5, baseY: startY });
  }

  // =========================================================================
  // 4. KÖZ ODUN ATEŞLİ KUBBELİ TAŞ FIRIN GÖZÜ (WOOD-FIRED BRICK DOME OVEN)
  // =========================================================================
  const ovenX = originX; // 59.5
  const ovenZ = bldgZ + bldgDepth / 2 + 0.8; // 27.9 (öne uzanan kemerli kubbeli fırın gözü)
  const ovenBaseY = 0.5;

  // Refrakter tuğla kubbeli fırın gövdesi
  const domeMesh = cylinder(group, 1.45, 1.55, 1.5, [ovenX, ovenBaseY + 0.75, ovenZ], "#c0392b", 12);
  domeMesh.scale.set(1.1, 1.0, 0.85);

  // Kemerli fırın ağzı (arch aperture) taş silmesi (Güneye / caddeye bakar)
  box(group, [1.6, 1.1, 0.3], [ovenX, ovenBaseY + 0.55, ovenZ + 0.75], "#795548");
  box(group, [1.3, 0.85, 0.35], [ovenX, ovenBaseY + 0.5, ovenZ + 0.78], "#1a120b"); // İç karanlık hazne

  // Yanan odun közleri yatağı
  box(group, [1.1, 0.12, 0.6], [ovenX, ovenBaseY + 0.12, ovenZ + 0.5], "#e65100");
  for (let log = -0.35; log <= 0.35; log += 0.35) {
    cylinder(group, 0.06, 0.06, 0.55, [ovenX + log, ovenBaseY + 0.18, ovenZ + 0.5], "#ff5722", 6).rotation.z = Math.PI / 2;
  }

  // Fırın içinde pişen susamlı simitler ve Ramazan pideleri
  for (const simX of [-0.3, 0.3]) {
    const bakedSimit = cylinder(
      group,
      0.15,
      0.15,
      0.04,
      [ovenX + simX, ovenBaseY + 0.22, ovenZ + 0.45],
      "#f39c12",
      8,
    );
    bakedSimit.rotation.x = -0.2;
  }
  // Pişen Ramazan pidesi
  box(group, [0.38, 0.05, 0.3], [ovenX, ovenBaseY + 0.22, ovenZ + 0.35], "#d35400");

  // Kor gibi yanan dinamik fırın ışığı (PointLight)
  const fireLight = new THREE.PointLight("#ff6d00", 1.8, 7.5);
  fireLight.position.set(ovenX, ovenBaseY + 0.65, ovenZ + 0.7);
  group.add(fireLight);

  // =========================================================================
  // 5. AYDINLATMALI ÇATI TABELASI & NOSTALJİK TENTE
  // =========================================================================
  // Büyük Işıklı Çatı Tabelası (Öne eğimli kamera okunurluğu)
  const mainSign = label("🥖 MEŞHUR TARİHİ SİMİT FIRINI · TAŞ FIRIN ODUN ATEŞİ 🥨", "#ffffff", "#c0392b");
  mainSign.scale.set(7.0, 1.2, 1);
  mainSign.position.set(originX, bldgHeight + 1.15, bldgZ + bldgDepth / 2 + 0.2);
  mainSign.rotation.x = -0.15;
  group.add(mainSign);

  // Alt Kurumsal Şerit Bandı
  const subSign = label("GELENEKSEL ODUN TAŞ FIRINI · ÇITIR SİMİT & RAMAZAN PİDESİ · 1928", "#f1c40f", "#4a1200");
  subSign.scale.set(6.4, 0.42, 1);
  subSign.position.set(originX, bldgHeight + 0.38, bldgZ + bldgDepth / 2 + 0.25);
  subSign.rotation.x = -0.15;
  group.add(subSign);

  // Gece ve alacakaranlık tabela & cephe aydınlatması
  const facadeLight = new THREE.PointLight("#fff3e0", 1.2, 9.0);
  facadeLight.position.set(originX, bldgHeight + 0.8, bldgZ + bldgDepth / 2 + 0.8);
  group.add(facadeLight);

  // Nostaljik kırmızı-krem kumaş tente (awning)
  const awningWidth = 7.4;
  const awningProj = 1.8;
  const awningY = 2.7;
  const awningZ = bldgZ + bldgDepth / 2 + 1.0;

  for (let s = 0; s < 10; s++) {
    const sWidth = awningWidth / 10;
    const sX = originX - awningWidth / 2 + sWidth * (s + 0.5);
    const sColor = s % 2 === 0 ? "#c0392b" : "#fffde7";
    const awningStripe = box(group, [sWidth, 0.05, awningProj], [sX, awningY, awningZ], sColor);
    awningStripe.rotation.x = -0.24;
  }
  // Dalgalı fırfırlı alt tente eteği
  box(group, [awningWidth, 0.25, 0.05], [originX, awningY - 0.32, awningZ + awningProj / 2 - 0.15], "#f39c12");

  // =========================================================================
  // 6. TEŞHİR VİTRİNİ, SİMİT ASACAĞI, UN ÇUVALLARI & MEŞE ODUNLARI
  // =========================================================================
  // Camlı ve ahşap simit teşhir vitrini (X: 61.3, Z: 28.5)
  const vitrineX = originX + 1.8;
  const vitrineZ = originZ + 4.0;
  box(group, [1.9, 0.9, 0.75], [vitrineX, 0.45, vitrineZ], "#5d4037");
  box(group, [1.8, 0.65, 0.65], [vitrineX, 1.05, vitrineZ], "#ffeaa7");
  const vitrineSign = label("TAZE ÇITIR SİMİT", "#ffffff", "#d35400");
  vitrineSign.scale.set(1.4, 0.32, 1);
  vitrineSign.position.set(vitrineX, 0.55, vitrineZ + 0.4);
  group.add(vitrineSign);

  // Dikey ahşap simit askılık direği ("Simit Ağacı" - X: 62.3, Z: 29.5)
  const poleX = originX + 2.8;
  const poleZ = originZ + 5.0;
  cylinder(group, 0.06, 0.08, 2.3, [poleX, 1.15, poleZ], "#8d6e63", 8);
  cylinder(group, 0.35, 0.35, 0.08, [poleX, 0.04, poleZ], "#5d4037", 8);
  for (const pegY of [1.2, 1.5, 1.8]) {
    cylinder(group, 0.025, 0.025, 0.7, [poleX, pegY, poleZ], "#d7ccc8", 6).rotation.z = Math.PI / 2;
    for (const sx of [-0.25, 0.25]) {
      const ring = cylinder(group, 0.13, 0.13, 0.03, [poleX + sx, pegY - 0.05, poleZ], "#e67e22", 8);
      ring.rotation.x = Math.PI / 2;
    }
  }

  // İstiflenmiş jüt un çuvalları ("HALİS BUĞDAY UNU - 50 KG" - X: 56.7, Z: 27.8)
  const flourX = originX - 2.8;
  const flourZ = originZ + 3.3;
  box(group, [0.75, 0.35, 0.5], [flourX, 0.18, flourZ], "#d7ccc8");
  box(group, [0.75, 0.35, 0.5], [flourX + 0.1, 0.52, flourZ], "#e0d8d0");
  box(group, [0.7, 0.32, 0.48], [flourX - 0.05, 0.85, flourZ], "#d7ccc8");
  const flourLabel = label("UN 50 KG", "#3e2723", "#d7ccc8");
  flourLabel.scale.set(0.65, 0.22, 1);
  flourLabel.position.set(flourX + 0.1, 0.52, flourZ + 0.26);
  group.add(flourLabel);

  // İstifli meşe odunları yığını (fırınlık yakacak kütükler)
  const woodX = originX - 2.8;
  const woodZ = originZ + 4.2;
  for (let lz = -0.3; lz <= 0.3; lz += 0.3) {
    cylinder(group, 0.09, 0.09, 1.0, [woodX, 0.1, woodZ + lz], "#4e342e", 6).rotation.z = Math.PI / 2;
  }
  for (let lz = -0.15; lz <= 0.15; lz += 0.3) {
    cylinder(group, 0.08, 0.08, 0.9, [woodX, 0.25, woodZ + lz], "#5d4037", 6).rotation.z = Math.PI / 2;
  }
  cylinder(group, 0.08, 0.08, 0.8, [woodX, 0.4, woodZ], "#3e2723", 6).rotation.z = Math.PI / 2;

  // Tebeşirli karataş A-frame menü panosu (X: 56.7, Z: 30.0)
  const boardX = originX - 2.8;
  const boardZ = originZ + 5.5;
  box(group, [0.7, 0.95, 0.06], [boardX, 0.55, boardZ], "#2c3e50");
  box(group, [0.75, 0.05, 0.45], [boardX, 0.1, boardZ], "#5d4037");
  const menuLabel = label("🥨 SİMİT: 7₺ | 🍞 EKMEK: 12₺ | 🫓 PİDE: 15₺", "#ffffff", "#2c3e50");
  menuLabel.scale.set(1.4, 0.3, 1);
  menuLabel.position.set(boardX, 0.55, boardZ + 0.04);
  group.add(menuLabel);

  // Geleneksel pirinç çay semaveri (X: 60.3, Z: 29.5)
  const samovarX = originX + 0.8;
  const samovarZ = originZ + 5.0;
  box(group, [0.55, 0.7, 0.45], [samovarX, 0.35, samovarZ], "#795548");
  cylinder(group, 0.14, 0.12, 0.42, [samovarX, 0.88, samovarZ], "#f39c12", 8);
  cylinder(group, 0.04, 0.04, 0.18, [samovarX, 1.15, samovarZ], "#d35400", 6);

  // =========================================================================
  // 7. ANİMASYONLU USTA FIRINCI NPC — "FIRINCI ŞABAN USTA"
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.name = "npc-saban-usta";
  npcGroup.position.set(SABAN_USTA_POS.x, 0, SABAN_USTA_POS.z);
  group.add(npcGroup);

  // Bacaklar (Beyaz fırıncı pantolonu)
  cylinder(npcGroup, 0.11, 0.09, 0.75, [-0.16, 0.38, 0], "#f5f6fa", 8);
  cylinder(npcGroup, 0.11, 0.09, 0.75, [0.16, 0.38, 0], "#f5f6fa", 8);
  // Ayakkabılar
  box(npcGroup, [0.18, 0.1, 0.28], [-0.16, 0.05, 0.05], "#5d4037");
  box(npcGroup, [0.18, 0.1, 0.28], [0.16, 0.05, 0.05], "#5d4037");

  // Üst Gövde Grubu (Head tracking için döner pivot)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.75, 0);
  npcGroup.add(torsoPivot);

  // Gövde (Beyaz fırıncı gömleği)
  box(torsoPivot, [0.54, 0.65, 0.34], [0, 0.33, 0], "#f5f6fa");

  // Pamuklu beyaz önlük (un lekeli fırıncı önlüğü)
  box(torsoPivot, [0.46, 0.58, 0.05], [0, 0.28, 0.18], "#ecf0f1");
  box(torsoPivot, [0.44, 0.45, 0.05], [0, -0.15, 0.17], "#ecf0f1");

  // Kafa Grubu
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0);
  torsoPivot.add(headGroup);

  // Baş ve boyun
  box(headGroup, [0.28, 0.3, 0.26], [0, 0, 0], "#f5cd79");
  cylinder(headGroup, 0.09, 0.09, 0.14, [0, -0.16, 0], "#f5cd79", 6);

  // Pos bıyık
  box(headGroup, [0.22, 0.08, 0.07], [0, -0.04, 0.14], "#2c3e50");

  // Gözler
  box(headGroup, [0.04, 0.04, 0.02], [-0.07, 0.05, 0.14], "#1e272e");
  box(headGroup, [0.04, 0.04, 0.02], [0.07, 0.05, 0.14], "#1e272e");

  // Kumaş fırıncı bonesi / takkesi
  cylinder(headGroup, 0.18, 0.17, 0.2, [0, 0.18, 0], "#ffffff", 12);
  cylinder(headGroup, 0.22, 0.18, 0.08, [0, 0.24, 0], "#ffffff", 12);

  // Sol Kol (Belinde duruş)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.32, 0.56, 0);
  torsoPivot.add(leftArmPivot);
  cylinder(leftArmPivot, 0.07, 0.06, 0.55, [0, -0.24, 0], "#f5f6fa", 6);
  cylinder(leftArmPivot, 0.05, 0.05, 0.1, [0, -0.52, 0], "#f5cd79", 6);

  // Sağ Kol ve Fırın Küreği Grubu (Baker's Peel Pivot)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 0.56, 0);
  torsoPivot.add(rightArmPivot);

  cylinder(rightArmPivot, 0.07, 0.06, 0.55, [0, -0.24, 0.08], "#f5f6fa", 6);
  cylinder(rightArmPivot, 0.05, 0.05, 0.1, [0, -0.52, 0.14], "#f5cd79", 6);

  // Ahşap fırın küreği (2.4m sedir ağacı sap + geniş yayvan kürek ucu)
  const peelGroup = new THREE.Group();
  peelGroup.position.set(0.08, -0.5, 0.14);
  rightArmPivot.add(peelGroup);

  // Kürek sapı
  cylinder(peelGroup, 0.03, 0.03, 2.4, [0, 0.4, 0.6], "#8d6e63", 6).rotation.x = Math.PI / 3.2;

  // Kürek tablası / bıçağı
  const paddleMesh = box(peelGroup, [0.34, 0.04, 0.55], [0, 0.9, 1.45], "#d7ccc8");
  paddleMesh.rotation.x = Math.PI / 3.2;

  // Küreğin ucunda fırına sürülen / fırından yeni çıkmış çıtır susamlı simit!
  const peelSimit = cylinder(peelGroup, 0.13, 0.13, 0.035, [0, 0.94, 1.48], "#e67e22", 8);
  peelSimit.rotation.x = Math.PI / 3.2;

  // 3D Konuşma Balonu Grubu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.4, 0);
  npcGroup.add(bubbleGroup);
  bubbleGroup.visible = false;

  let currentBubbleText = "";

  // =========================================================================
  // 8. ÇARPIŞMA ENGELİ (OBSTACLE COLLIDER)
  // =========================================================================
  // Trafik şeridi (X=53.6) ve Metropol Tower (X=63.9) ile mükemmel uyumlu engel
  obstacles.push({
    minX: 55.5,
    maxX: 63.5,
    minZ: bldgZ - bldgDepth / 2 - 0.3, // ~21.6
    maxZ: bldgZ + bldgDepth / 2 + 1.2, // ~28.3 (Kubbeli fırını da kapsar, peron Z=31.2'dedir)
  });

  // =========================================================================
  // 9. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let totalTime = 0;

  return {
    group,
    obstacles,
    update(dt: number, state: BakeryState, playerPos?: Vec2, isNightOrDusk = false) {
      totalTime += dt;

      // 1. Işıklandırma güncellemeleri
      facadeLight.intensity = isNightOrDusk ? 1.6 : 0.4;

      // Odun ateşi kor ışığı titremesi (flicker)
      const flicker =
        Math.sin(state.ovenGlowPhase * 3.5) * 0.35 +
        Math.cos(state.ovenGlowPhase * 5.2) * 0.25;
      fireLight.intensity = 1.6 + flicker;
      cowlMesh.rotation.y += dt * 0.8;

      // 2. Canlı odun dumanı partikülleri animasyonu
      for (const puff of smokePuffs) {
        const offset = ((totalTime * 0.75 + puff.seed) % 3.0) / 3.0;
        puff.mesh.position.y = puff.baseY + offset * 1.8;
        puff.mesh.position.x = chimneyX + Math.sin(totalTime * 1.5 + puff.seed) * (0.12 + offset * 0.3);
        puff.mesh.position.z = chimneyZ + Math.cos(totalTime * 1.2 + puff.seed) * (0.12 + offset * 0.3);
        const s = 1.0 + offset * 1.8;
        puff.mesh.scale.set(s, s, s);
      }

      // 3. Fırıncı Şaban Usta fırın küreği ileri-geri sürme animasyonu
      const peelSlide = Math.sin(state.peelSwingPhase) * 0.22;
      peelGroup.position.z = 0.14 + peelSlide;

      // 4. Şaban Usta kafa takibi ve selamlama
      if (playerPos) {
        const dx = playerPos.x - SABAN_USTA_POS.x;
        const dz = playerPos.z - SABAN_USTA_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          let diff = targetAngle - npcGroup.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          torsoPivot.rotation.y = THREE.MathUtils.clamp(diff, -1.1, 1.1);
          headGroup.rotation.y = THREE.MathUtils.clamp(diff * 0.5, -0.6, 0.6);
        } else {
          torsoPivot.rotation.y = THREE.MathUtils.lerp(torsoPivot.rotation.y, 0, dt * 2.0);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.0);
        }
      }

      // Selamlama / korna sırasında sağ kol ve küreği havaya kaldırma
      if (state.honkGreetingTimer > 0) {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          -Math.PI / 2.8 + Math.sin(totalTime * 9.0) * 0.25,
          dt * 8.0,
        );
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(
          rightArmPivot.rotation.z,
          0.35 + Math.cos(totalTime * 8.0) * 0.2,
          dt * 8.0,
        );
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 4.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 4.0);
      }

      // 5. 3D Konuşma Balonu Gösterimi
      if (state.lastHonkCallout && state.honkGreetingTimer > 0) {
        bubbleGroup.visible = true;
        if (currentBubbleText !== state.lastHonkCallout) {
          currentBubbleText = state.lastHonkCallout;
          while (bubbleGroup.children.length > 0) {
            const c = bubbleGroup.children[0] as THREE.Mesh;
            bubbleGroup.remove(c);
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
              if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
              else c.material.dispose();
            }
          }
          const newLabel = label(state.lastHonkCallout, "#ffffff", "#c0392b");
          newLabel.scale.set(5.8, 0.75, 1);
          newLabel.rotation.x = -0.25;
          bubbleGroup.add(newLabel);
        }
      } else {
        bubbleGroup.visible = false;
        currentBubbleText = "";
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - SABAN_USTA_POS.x,
        playerPos.z - SABAN_USTA_POS.z,
      );
      return dist <= 24.0;
    },

    dispose() {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      smokeMat.dispose();
      roofMat.dispose();
    },
  };
}
