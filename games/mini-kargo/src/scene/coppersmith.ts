import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type CoppersmithState,
  COPPERSMITH_CENTER,
  COPPERSMITH_BAY,
  KAZIM_USTA_POS,
  KAZIM_USTA_CALLOUTS,
} from "../game/coppersmith";

export type CoppersmithView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: CoppersmithState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Çarşı "Tarihi Bakırcılar Çarşısı & Antik Kapalı Bedesten" (T56)
 * - Otantik Çarşı Kapalı Bedesten & Bakırcılar Çarşısı:
 *   - Kesme kireçtaşı ve traverten taş kemerli bedesten mimarisi (Arched Stone Portals)
 *   - Klinker tuğla ve rustik taş avlu tablası (12.0m x 9.5m) ve asfalt servis peronu (COPPERSMITH_BAY: X: 63.0, Z: 81.0)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Büyük aydınlatmalı kurumsal çatı tabelası ("🏺 TARİHİ BAKIRCILAR ÇARŞISI · KAZIM USTA 🔨")
 *   - Gece ve gündüz tezgahı aydınlatan sıcak kehribar PointLight armatürü
 *   - Parlak el dövmesi bakır kazanlar, cezve takımları, semaverler ve oymalı bakır siniler
 *   - Taş kemerlerde ve askılarda sergilenen antik Türk kilimleri ve halıları
 *   - Kütük kaide üzerinde döküm çelik bakırcı örsü, topuz çekiç ve bakır işleme aletleri
 * - Animasyonlu Usta Bakırcı NPC — "Bakırcı Kazım Usta" (X: 61.5, Z: 76.5):
 *   - Deri esnaf önlüğü, işlemeli fes, heybetli kıvrık pala bıyık, deri bileklikler
 *   - Elinde pirinç topuz çekiç ile örsteki bakır tepsiyi ritmik dövme / tıklatma animasyonu
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada çekicini kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createCoppersmithView(): CoppersmithView {
  const group = new THREE.Group();
  group.name = "coppersmith-view";
  const obstacles: Rect[] = [];

  const cx = COPPERSMITH_CENTER.x; // 63.0
  const cz = COPPERSMITH_CENTER.z; // 75.5

  // =========================================================================
  // 1. AVLU TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Klinker tuğla ve rustik taş avlu tablası (12.0m x 9.5m)
  box(yardGroup, [12.0, 0.12, 9.5], [0, 0.04, 0], "#c8a165");
  box(yardGroup, [11.6, 0.05, 9.1], [0, 0.10, 0], "#b38246");

  // Çevre granit taş bordürleri
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, -4.75], "#5d4037");
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, 4.75], "#5d4037");
  box(yardGroup, [0.22, 0.18, 9.7], [-6.05, 0.09, 0], "#5d4037");
  box(yardGroup, [0.22, 0.18, 9.7], [6.05, 0.09, 0], "#5d4037");

  // Servis Yanaşma Peronu (COPPERSMITH_BAY: X: 63.0, Z: 81.0) - Z: 84 sokağının kuzey bordüründe
  box(group, [5.2, 0.02, 3.2], [cx, 0.025, cz + 5.5], "#2c3437"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.5, 0.03, cz + 5.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.5, 0.03, cz + 5.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 4.0], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 3.9], isYellow ? "#f39c12" : "#2c3e50");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 5.4], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 6.2);
  group.add(arrowHead);

  // =========================================================================
  // 2. GELENEKSEL KESME TAŞ BEDESTEN MİMARİSİ & TAŞ KEMERLER
  // =========================================================================
  const bedestenGroup = new THREE.Group();
  bedestenGroup.position.set(cx, 0, cz - 1.2);
  group.add(bedestenGroup);

  const bW = 10.6;
  const bD = 5.8;
  const bH = 4.6;

  // Ana kesme kireçtaşı ve traverten arka & yan duvarlar
  box(bedestenGroup, [bW, bH, 0.55], [0, bH / 2, -bD / 2 + 0.28], "#dcd5c1"); // Arka duvar
  box(bedestenGroup, [0.55, bH, bD], [-bW / 2 + 0.28, bH / 2, 0], "#cfc4ae"); // Sol duvar
  box(bedestenGroup, [0.55, bH, bD], [bW / 2 - 0.28, bH / 2, 0], "#cfc4ae"); // Sağ duvar

  // Taş kaide süpürgelikleri ve köşe silmeleri
  box(bedestenGroup, [bW + 0.2, 0.45, bD + 0.2], [0, 0.22, 0], "#8d7b68");

  // Ön Cephe: İkili Anıtsal Taş Kemerler (Dual Arched Portals)
  // 3 ana taş pilaster sütun (Sol, Orta, Sağ)
  const pillarX = [-bW / 2 + 0.35, 0, bW / 2 - 0.35];
  for (const px of pillarX) {
    box(bedestenGroup, [0.8, bH, 0.65], [px, bH / 2, bD / 2 - 0.32], "#b8aa93");
    // Pilaster başlık ve kaideleri
    box(bedestenGroup, [0.95, 0.3, 0.78], [px, bH - 0.8, bD / 2 - 0.32], "#9e8b74");
    box(bedestenGroup, [0.95, 0.35, 0.78], [px, 0.18, bD / 2 - 0.32], "#9e8b74");
  }

  // Kemer üstü taş alınlık frizi (Arch Spandrels & Entablature)
  box(bedestenGroup, [bW, 1.2, 0.65], [0, bH - 0.6, bD / 2 - 0.32], "#dcd5c1");

  // Sol ve Sağ yarım daire tonoz kemer profilleri (Arch Rings)
  for (const archCenterX of [-2.4, 2.4]) {
    // Kemer kavisini oluşturan açılı taş bloklar
    const archRadius = 1.95;
    const archY = bH - 1.25;
    for (let a = 0; a <= Math.PI; a += Math.PI / 8) {
      const vx = archCenterX + Math.cos(a) * archRadius;
      const vy = archY - Math.sin(a) * 0.45;
      const stone = box(bedestenGroup, [0.42, 0.28, 0.7], [vx, vy, bD / 2 - 0.3], "#a3927b");
      stone.rotation.z = a - Math.PI / 2;
    }
    // Kemer kilit taşı (Keystone)
    box(bedestenGroup, [0.45, 0.52, 0.75], [archCenterX, archY + 0.05, bD / 2 - 0.3], "#826e58");
  }

  // Alaturka Pişmiş Toprak Kiremit Saçak Kornişi & Çatı
  box(bedestenGroup, [bW + 0.6, 0.35, bD + 0.6], [0, bH + 0.15, 0], "#8d7b68"); // Korniş
  const roof = box(bedestenGroup, [bW + 0.8, 0.6, bD + 0.8], [0, bH + 0.55, 0], "#a04000"); // Kiremit tabaka
  roof.castShadow = true;

  // Çatı Alınlığı & Ferforje Rüzgar Gülü / Kubbe Alemi
  const finialBase = cylinder(bedestenGroup, 0.35, 0.45, 0.5, [0, bH + 1.0, 0], "#826e58", 8);
  finialBase.castShadow = true;
  cylinder(bedestenGroup, 0.14, 0.14, 0.8, [0, bH + 1.5, 0], "#f39c12", 8); // Pirinç alem gövdesi
  const finialCrescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.05, 8, 16, Math.PI * 1.5),
    mat("#f39c12"),
  );
  finialCrescent.rotation.z = Math.PI / 4;
  finialCrescent.position.set(0, bH + 1.95, 0);
  bedestenGroup.add(finialCrescent);

  // =========================================================================
  // 3. AYDINLATMALI ÇATI TABELASI & GECE AYDINLATMASI
  // =========================================================================
  // Ana Tabela Alınlığı ("🏺 TARİHİ BAKIRCILAR ÇARŞISI · KAZIM USTA 🔨")
  const marqueeSign = label("🏺 TARİHİ BAKIRCILAR ÇARŞISI · KAZIM USTA 🔨");
  marqueeSign.scale.set(6.4, 0.95, 1);
  marqueeSign.position.set(0, bH + 0.85, bD / 2 + 0.15);
  marqueeSign.rotation.x = -0.06;
  bedestenGroup.add(marqueeSign);

  // Alt Kurumsal Şerit ("GELENEKSEL EL DÖVMESİ BAKIR İŞÇİLİĞİ · ANATOLİAN BEDESTEN · 1892")
  const subSign = label("GELENEKSEL EL DÖVMESİ BAKIR İŞÇİLİĞİ · ANATOLİAN BEDESTEN · 1892");
  subSign.scale.set(5.8, 0.45, 1);
  subSign.position.set(0, bH + 0.28, bD / 2 + 0.18);
  bedestenGroup.add(subSign);

  // Sıcak kehribar PointLight armatürü (Tezgahı ve bakır eserleri parlatır)
  const coppersmithLight = new THREE.PointLight("#f39c12", 2.2, 16);
  coppersmithLight.position.set(cx, bH - 0.4, cz + 1.2);
  group.add(coppersmithLight);

  // Vintage pirinç sarkıt fener armatürü muhafazası
  cylinder(group, 0.12, 0.18, 0.35, [cx, bH - 0.3, cz + 1.2], "#d35400", 6);

  // =========================================================================
  // 4. ZENGİN BAKIR ESERLER & PARLAK DÖVME BAKIR SERGİSİ
  // =========================================================================
  // Ana Bakır Sergi Tezgahı (Ön cephe kemer altı sağ tarafı: X: cx + 2.5, Z: cz + 0.8)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(cx + 2.5, 0, cz + 0.8);
  group.add(tableGroup);

  // Masif meşe ve pirinç çerçeveli sergi masası (4.5m x 1.4m x 0.85m)
  box(tableGroup, [4.5, 0.14, 1.4], [0, 0.85, 0], "#5c3818"); // Ahşap tabla
  box(tableGroup, [4.6, 0.04, 1.45], [0, 0.92, 0], "#9e2a2b"); // Kırmızı sergi çuhası / kadife örtü
  box(tableGroup, [0.18, 0.82, 0.18], [-2.0, 0.41, -0.55], "#3e240f"); // 4 ayak
  box(tableGroup, [0.18, 0.82, 0.18], [2.0, 0.41, -0.55], "#3e240f");
  box(tableGroup, [0.18, 0.82, 0.18], [-2.0, 0.41, 0.55], "#3e240f");
  box(tableGroup, [0.18, 0.82, 0.18], [2.0, 0.41, 0.55], "#3e240f");

  // A. BÜYÜK DÖVME BAKIR KAZANLAR (Gleaming Cauldrons)
  // Büyük Şerbet/Yemek Kazanı 1 (Parlak Dövme Kızıl Bakır)
  const cauldron1 = cylinder(tableGroup, 0.52, 0.42, 0.58, [-1.5, 1.25, 0.1], "#d35400", 12);
  cauldron1.castShadow = true;
  cylinder(tableGroup, 0.55, 0.55, 0.06, [-1.5, 1.54, 0.1], "#e67e22", 12); // Geniş ağız silmesi
  // Pirinç kulp halkaları
  for (const kx of [-1.5 - 0.54, -1.5 + 0.54]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12), mat("#f1c40f"));
    handle.position.set(kx, 1.35, 0.1);
    handle.rotation.y = Math.PI / 2;
    tableGroup.add(handle);
  }

  // Orta Bakır Kazan 2 (Koyu Patinalı Meşe Kazanı)
  const cauldron2 = cylinder(tableGroup, 0.44, 0.35, 0.48, [-0.5, 1.18, -0.2], "#b83b1d", 12);
  cauldron2.castShadow = true;
  cylinder(tableGroup, 0.47, 0.47, 0.05, [-0.5, 1.42, -0.2], "#d35400", 12);

  // B. GELENEKSEL BAKIR CEZVE SETLERİ (Cezve Sets on Wooden Tier)
  // 3 kademeli küçük ahşap cezvelik standı
  box(tableGroup, [1.4, 0.25, 0.45], [0.8, 1.05, 0.2], "#4a2810");
  const cezveSizes = [
    { x: 0.35, scale: 0.18, h: 0.28, color: "#e67e22" }, // 1 fincanlık cezve
    { x: 0.8, scale: 0.24, h: 0.34, color: "#d35400" },  // 2 fincanlık cezve
    { x: 1.25, scale: 0.30, h: 0.40, color: "#c0392b" }, // 4 fincanlık kervan cezvesi
  ];
  for (const cezve of cezveSizes) {
    const body = cylinder(tableGroup, cezve.scale * 0.7, cezve.scale, cezve.h, [cezve.x, 1.18 + cezve.h / 2, 0.2], cezve.color, 10);
    body.castShadow = true;
    // Uzun pirinç açılı sap (Brass handle)
    const handle = cylinder(tableGroup, 0.02, 0.02, 0.45, [cezve.x, 1.25 + cezve.h, 0.2 - 0.22], "#f1c40f", 6);
    handle.rotation.x = -Math.PI / 3;
  }

  // C. ÇİFT DEMLİKLİ PARLAK BAKIR ÇAY SEMAVERİ (Grand Copper Samovar)
  const samovarGroup = new THREE.Group();
  samovarGroup.position.set(cx + 4.2, 0.94, cz + 0.8);
  group.add(samovarGroup);

  // Semaver döküm kaidesi ve su haznesi
  cylinder(samovarGroup, 0.28, 0.35, 0.18, [0, 0.09, 0], "#b83b1d", 10);
  cylinder(samovarGroup, 0.38, 0.26, 0.52, [0, 0.44, 0], "#e67e22", 12); // Ana gövde
  cylinder(samovarGroup, 0.12, 0.14, 0.25, [0, 0.82, 0], "#d35400", 8); // Baca borusu
  // Üst demlik (Brewing pot)
  cylinder(samovarGroup, 0.18, 0.14, 0.22, [0, 1.02, 0], "#c0392b", 8);
  cylinder(samovarGroup, 0.06, 0.16, 0.08, [0, 1.17, 0], "#f39c12", 8); // Demlik kapağı & pirinç tutamak
  // Pirinç musluk (Brass tap)
  cylinder(samovarGroup, 0.03, 0.03, 0.16, [0, 0.32, 0.42], "#f1c40f", 6).rotation.x = Math.PI / 2;

  // D. DUVARA ASILI VE ŞÖVALEDE OYMALI BAKIR SİNİLER & TEPSİLER (Embossed Trays)
  // Duvara asılı dev bakır sini (Arka duvarda: X: cx, Z: cz - 3.8)
  const wallTray = cylinder(group, 1.2, 1.2, 0.06, [cx, 2.8, cz - 3.8], "#d35400", 20);
  wallTray.rotation.x = Math.PI / 2;
  // Sini kabartma halkaları
  cylinder(group, 0.85, 0.85, 0.08, [cx, 2.8, cz - 3.78], "#e67e22", 16).rotation.x = Math.PI / 2;
  cylinder(group, 0.42, 0.42, 0.10, [cx, 2.8, cz - 3.76], "#f39c12", 12).rotation.x = Math.PI / 2;

  // Ahşap şövale üzerinde duran oymalı bakır sini (Sol giriş önünde: X: cx - 4.2, Z: cz + 1.2)
  const easelGroup = new THREE.Group();
  easelGroup.position.set(cx - 4.2, 0, cz + 1.2);
  group.add(easelGroup);
  // Şövale ahşap A-çatkı ayakları
  const easelLegL = cylinder(easelGroup, 0.05, 0.05, 2.2, [-0.45, 1.1, 0], "#5c3818", 6);
  easelLegL.rotation.z = 0.18;
  const easelLegR = cylinder(easelGroup, 0.05, 0.05, 2.2, [0.45, 1.1, 0], "#5c3818", 6);
  easelLegR.rotation.z = -0.18;
  const easelLegBack = cylinder(easelGroup, 0.05, 0.05, 2.1, [0, 1.05, -0.65], "#5c3818", 6);
  easelLegBack.rotation.x = -0.32;
  box(easelGroup, [1.4, 0.08, 0.12], [0, 0.95, 0.1], "#3e240f"); // Raf çıtası
  // Şövaledeki oymalı sini
  const easelTray = cylinder(easelGroup, 0.72, 0.72, 0.04, [0, 1.45, 0.05], "#e58e26", 16);
  easelTray.rotation.x = 0.22;

  // E. GELENEKSEL BAKIR İBRİKLER & GÜĞÜMLER (Long-spout Ewers & Water Jugs)
  const ewer1 = cylinder(group, 0.18, 0.26, 0.65, [cx - 2.8, 0.35, cz + 0.8], "#d35400", 10);
  ewer1.castShadow = true;
  cylinder(group, 0.08, 0.16, 0.35, [cx - 2.8, 0.85, cz + 0.8], "#e67e22", 8); // Boyun
  cylinder(group, 0.04, 0.04, 0.55, [cx - 2.8 + 0.18, 0.68, cz + 0.8 + 0.18], "#f1c40f", 6).rotation.z = -0.45; // İbrik ağzı / emzik

  // =========================================================================
  // 5. ANTİK TÜRK KİLİMLERİ VE HALILARI (Antique Kilims on Displays)
  // =========================================================================
  // Sol kemer içine asılmış otantik Türk kilimi (Zengin geometrik motifler)
  const kilimGroupL = new THREE.Group();
  kilimGroupL.position.set(cx - 2.4, 2.6, cz + 1.8);
  group.add(kilimGroupL);
  // Asma çubuğu (Pirinç boru)
  cylinder(kilimGroupL, 0.04, 0.04, 2.6, [0, 1.25, 0], "#d4ac0d", 8).rotation.z = Math.PI / 2;
  // Kırmızı/lacivert ana kilim gövdesi (1.8m x 2.4m)
  box(kilimGroupL, [2.2, 2.3, 0.03], [0, 0.1, 0], "#962d2d"); // Madder red zemin
  box(kilimGroupL, [1.8, 1.9, 0.035], [0, 0.1, 0], "#1b3a4b"); // Indigo navy bordür
  box(kilimGroupL, [1.3, 1.4, 0.04], [0, 0.1, 0], "#d4ac0d"); // Hardal sarısı madalyon
  box(kilimGroupL, [0.7, 0.8, 0.045], [0, 0.1, 0], "#b83b1d"); // Merkez göbek motifi
  // Alt saçak püskülleri (White wool fringe)
  box(kilimGroupL, [2.2, 0.12, 0.025], [0, -1.1, 0], "#f7f1e3");

  // Sağ duvara asılmış küçük namazlık kilimi (Sağ duvarda: X: cx + 4.9, Z: cz - 1.2)
  const kilimGroupR = new THREE.Group();
  kilimGroupR.position.set(cx + 4.9, 2.4, cz - 1.2);
  kilimGroupR.rotation.y = -Math.PI / 2;
  group.add(kilimGroupR);
  box(kilimGroupR, [1.4, 2.0, 0.03], [0, 0, 0], "#27ae60"); // Zümrüt yeşili zemin
  box(kilimGroupR, [1.1, 1.6, 0.035], [0, 0, 0], "#c0392b"); // Kırmızı iç bordür
  box(kilimGroupR, [0.6, 1.0, 0.04], [0, 0, 0], "#f1c40f"); // Mihrap deseni

  // =========================================================================
  // 6. BAKIRCI ÖRSÜ, ÇEKİÇLER & ÇALIŞMA ALANI
  // =========================================================================
  // Masif meşe kütük kaide (Oak anvil stump at X: cx - 1.5, Z: cz + 1.0)
  const stumpGroup = new THREE.Group();
  stumpGroup.position.set(cx - 1.5, 0, cz + 1.0);
  group.add(stumpGroup);

  const stump = cylinder(stumpGroup, 0.42, 0.48, 0.72, [0, 0.36, 0], "#4a2c11", 10);
  stump.castShadow = true;
  cylinder(stumpGroup, 0.45, 0.45, 0.05, [0, 0.45, 0], "#2c3e50", 10); // Çelik çember kasnak

  // Döküm çelik bakırcı örsü (Coppersmith horn anvil)
  const anvilBody = box(stumpGroup, [0.55, 0.28, 0.24], [0, 0.86, 0], "#2c3e50");
  anvilBody.castShadow = true;
  // Örsün sivriltilmiş konik boynuzu (Anvil horn)
  const anvilHorn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 8), mat("#34495e"));
  anvilHorn.rotation.z = Math.PI / 2;
  anvilHorn.position.set(0.42, 0.86, 0);
  stumpGroup.add(anvilHorn);

  // Örs üzerinde dövülmekte olan kabartmalı bakır tabak (Copper dish being hammered)
  const hammeredPlate = cylinder(stumpGroup, 0.24, 0.24, 0.03, [0, 1.01, 0], "#e67e22", 12);
  hammeredPlate.castShadow = true;

  // Çekiç takımı & aletler (Örs kenarında ahşap tokmak ve keski)
  cylinder(stumpGroup, 0.03, 0.03, 0.35, [-0.25, 0.75, 0.22], "#8d6e63", 6).rotation.z = 0.5;

  // =========================================================================
  // 7. ANİMASYONLU USTA BAKIRCI NPC — "BAKIRCI KAZIM USTA"
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(KAZIM_USTA_POS.x, 0, KAZIM_USTA_POS.z);
  group.add(npcGroup);

  // Ayaklar & Botlar
  cylinder(npcGroup, 0.12, 0.14, 0.65, [-0.18, 0.32, 0], "#3e2723", 8); // Sol bacak
  cylinder(npcGroup, 0.12, 0.14, 0.65, [0.18, 0.32, 0], "#3e2723", 8);  // Sağ bacak

  // Gövde (Striped artisan shirt + heavy brown leather apron)
  const torso = box(npcGroup, [0.62, 0.85, 0.44], [0, 1.05, 0], "#eceff1");
  torso.castShadow = true;
  // Deri esnaf önlüğü (Leather apron)
  box(npcGroup, [0.55, 0.75, 0.05], [0, 1.02, 0.22], "#5d2f0a");
  box(npcGroup, [0.45, 0.35, 0.06], [0, 0.72, 0.22], "#4a2406"); // Alt önlük eteği

  // Kafa & Boyun Pivotu
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.52, 0);
  npcGroup.add(headPivot);

  // Kafa
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), mat("#f8c291"));
  headMesh.position.set(0, 0.14, 0);
  headPivot.add(headMesh);

  // İşlemeli Bordo Esnaf Fesi / Kasketi & Altın Püskül
  const fez = cylinder(headPivot, 0.16, 0.19, 0.22, [0, 0.30, 0], "#922b21", 10);
  cylinder(headPivot, 0.02, 0.02, 0.22, [0.10, 0.32, 0.08], "#f1c40f", 6).rotation.z = -0.35; // Altın sarısı püskül
  fez.castShadow = true;

  // Heybetli Kıvrık Esnaf Pala Bıyığı
  const stacheL = cylinder(headPivot, 0.035, 0.015, 0.18, [-0.09, 0.10, 0.17], "#1a252f", 6);
  stacheL.rotation.z = -Math.PI / 3;
  const stacheR = cylinder(headPivot, 0.035, 0.015, 0.18, [0.09, 0.10, 0.17], "#1a252f", 6);
  stacheR.rotation.z = Math.PI / 3;

  // Sol Kol (Örs üstündeki bakır tepsiyi sol eliyle tutma pozu)
  const armL = cylinder(npcGroup, 0.075, 0.065, 0.55, [-0.36, 1.08, 0.15], "#eceff1", 6);
  armL.rotation.x = Math.PI / 4;
  armL.rotation.z = 0.2;
  // Deri bileklik
  cylinder(npcGroup, 0.08, 0.08, 0.10, [-0.36, 0.90, 0.25], "#5d2f0a", 6);

  // Sağ Kol Pivotu (Topuz Çekiçle Dövme / Selamlama Animasyonu)
  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.38, 1.35, 0);
  npcGroup.add(armRPivot);

  const armRMesh = cylinder(armRPivot, 0.075, 0.065, 0.55, [0, -0.25, 0.12], "#eceff1", 6);
  armRMesh.rotation.x = Math.PI / 4;
  // Deri bileklik
  cylinder(armRPivot, 0.08, 0.08, 0.10, [0, -0.38, 0.20], "#5d2f0a", 6);

  // Pirinç Topuz Çekiç (Ball-Peen Hammer in right hand)
  const hammerHandle = cylinder(armRPivot, 0.022, 0.022, 0.48, [0, -0.45, 0.32], "#8d6e63", 6);
  hammerHandle.rotation.x = Math.PI / 3;
  // Çekiç başı (Ball-peen steel head with brass finish)
  const hammerHead = cylinder(armRPivot, 0.05, 0.05, 0.16, [0, -0.62, 0.44], "#f39c12", 8);
  hammerHead.rotation.z = Math.PI / 2;
  const hammerBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat("#f39c12"));
  hammerBall.position.set(-0.09, -0.62, 0.44);
  armRPivot.add(hammerBall);

  // 3D Konuşma Balonu & Karşılama Etiketi
  const speechBubble = label(KAZIM_USTA_CALLOUTS[0]);
  speechBubble.scale.set(5.2, 0.9, 1);
  speechBubble.position.set(0, 2.35, 0);
  speechBubble.visible = false;
  npcGroup.add(speechBubble);

  // =========================================================================
  // 8. ENGEL ALANLARI (Obstacles - Yollar ve Yanaşma Peronu Açık Kalır)
  // =========================================================================
  // Bedesten binası ve sergi tezgahları: minX: 54.6, maxX: 65.4, minZ: 70.9, maxZ: 77.2
  obstacles.push({
    minX: cx - 5.4,
    maxX: cx + 5.4,
    minZ: cz - 4.6,
    maxZ: cz + 1.7,
  });

  let speechTimer = 0;
  let waveTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: CoppersmithState | boolean,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      let state: CoppersmithState | undefined;
      let night = false;

      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
        night = Boolean(isNightOrDusk);
      }

      // Gece ışık yoğunluğu
      coppersmithLight.intensity = night ? 3.6 : 1.8;

      const pPos = playerPos ?? { x: 0, z: 0 };
      const distToNpc = Math.hypot(pPos.x - KAZIM_USTA_POS.x, pPos.z - KAZIM_USTA_POS.z);

      // Kafa ve gövde takibi (22 metre mesafeden)
      if (distToNpc < 22.0) {
        const targetAngle = Math.atan2(pPos.x - KAZIM_USTA_POS.x, pPos.z - KAZIM_USTA_POS.z);
        let diff = targetAngle - npcGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        npcGroup.rotation.y += diff * Math.min(1, dt * 3.5);
      } else {
        npcGroup.rotation.y = THREE.MathUtils.lerp(npcGroup.rotation.y, 0, dt * 2.0);
      }

      // Konuşma balonu ve selamlama sayacı
      if (speechTimer > 0) {
        speechTimer -= dt;
        speechBubble.visible = true;
      } else {
        speechBubble.visible = false;
      }

      if (waveTimer > 0) {
        waveTimer -= dt;
        // Çekici havaya kaldırarak esnaf selamı
        armRPivot.rotation.x = -Math.PI / 2 + Math.sin(waveTimer * 10) * 0.35;
        armRPivot.rotation.z = 0.25;
      } else {
        // Ritmik çekiç dövme animasyonu
        const strikePhase = state ? state.hammerStrikePhase : (Date.now() * 0.005) % (Math.PI * 2);
        // Hızlı vuruş ve yavaş geri çekiliş
        const strikeMotion = Math.sin(strikePhase);
        if (strikeMotion > 0) {
          armRPivot.rotation.x = strikeMotion * 0.65;
        } else {
          armRPivot.rotation.x = strikeMotion * 0.25;
        }
        armRPivot.rotation.z = 0;
      }

      // State'ten gelen çağrı balonu
      if (state && state.callout && speechTimer <= 0) {
        speechBubble.visible = true;
        speechTimer = 4.0;
        waveTimer = 3.0;
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - KAZIM_USTA_POS.x, playerPos.z - KAZIM_USTA_POS.z);
      if (dist < 26.0) {
        speechTimer = 4.5;
        waveTimer = 3.5;
        const randomIdx = Math.floor(Math.random() * KAZIM_USTA_CALLOUTS.length);
        speechBubble.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      obstacles.length = 0;
    },
  };
}
