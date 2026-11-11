import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type TurkishCoffeeState,
  TURKISH_COFFEE_CENTER,
  TURKISH_COFFEE_BAY,
  TAHSIN_EFENDI_POS,
  TAHSIN_EFENDI_CALLOUTS,
} from "../game/turkish-coffee";

export type TurkishCoffeeView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: TurkishCoffeeState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" (T60)
 * - Otantik Osmanlı Revaklı Taş Köşk Mimarisi:
 *   - 3 sivri Osmanlı taş kemeri, yivli mermer sütunlar, mukarnaslı sütun başlıkları ve alaturka kiremit çatı
 *   - Merkezde parlayan pirinç/bakır kubbe ve hilalli pirinç alem (crescent finial)
 *   - Klinker tuğla ve kesme kireçtaşı avlu tablası (12.0m x 9.6m) ve servis yanaşma peronu (TURKISH_COFFEE_BAY: X: 37.0, Z: 81.0)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Işıklı büyük kurumsal çatı tabelası ("☕ TARİHİ ÇARŞI TÜRK KAHVECİSİ · TAHSİN EFENDİ 🍬")
 *   - Alt şerit ("KÖZDE TÜRK KAHVESİ · DİBEK & ANTEP DUBLE LOKUMU · 1908")
 *   - Gece ve gündüz çalışan sıcak kehribar PointLight armatürü ve asılı pirinç kafesli kandil
 * - Közde Kahve Mangalı & Bakır Kum Ocağı:
 *   - Ağır dövme bakır mangal, kızgın kor kömürleri, sıcak kavurma kumu ve nabız atan alev ışığı (PointLight)
 *   - Dövme bakır uzun saplı cezveler ve köpüren taze Türk kahvesi
 *   - Bacadan ve mangaldan yükselen dinamik kahve kokusu / buhar partikülleri
 * - Kahve Çuvalları, Taş Dibek & Pirinç El Değirmeni:
 *   - Jüt un/kahve çuvalları ("YEMEN KAHVESİ · 50 KG" ve "DİBEK KAHVESİ · 50 KG")
 *   - Tarihi taş dibek ve tokmak, mekanik dönen kollu pirinç kahve el değirmeni
 * - Antep Fıstıklı & Güllü Duble Lokum Vitrini & Donatılar:
 *   - Ahşap vitrinde pudra şekerli fıstıklı ve güllü lokum küpleri
 *   - Tebeşirli karataş A-frame fiyat listesi şövalesi
 *   - Dantelli pirinç zarflı porselen fincanlar ve bakır sunum tepsisi
 * - Animasyonlu Usta Kahveci NPC — "Kahveci Tahsin Efendi" (X: 35.5, Z: 76.8):
 *   - Altın sırmalı bordo kadife cepken yelek, fes, kuşak, pos bıyık ve pirinç kahve tepsisi
 *   - 22m mesafeden kafa/gövde takibi (head tracking)
 *   - Korna ve yanaşmada tepsisini havaya kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createTurkishCoffeeView(): TurkishCoffeeView {
  const group = new THREE.Group();
  group.name = "turkish-coffee-view";
  const obstacles: Rect[] = [];

  const cx = TURKISH_COFFEE_CENTER.x; // 37.0
  const cz = TURKISH_COFFEE_CENTER.z; // 75.5

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Avlu zemin klinker tuğla ve kireçtaşı tablası (12.0m x 9.6m)
  box(yardGroup, [12.0, 0.12, 9.6], [0, 0.04, 0], "#d7ccc8");
  box(yardGroup, [11.5, 0.05, 9.1], [0, 0.10, 0], "#8d6e63");

  // Çevre granit bordür taşları
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, -4.8], "#5d4037");
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, 4.8], "#5d4037");
  box(yardGroup, [0.22, 0.18, 9.8], [-6.05, 0.09, 0], "#5d4037");
  box(yardGroup, [0.22, 0.18, 9.8], [6.05, 0.09, 0], "#5d4037");

  // Servis Yanaşma Peronu (TURKISH_COFFEE_BAY: X: 37.0, Z: 81.0) - Z: 84 sokağının kuzey bordüründe
  box(group, [5.2, 0.02, 3.2], [cx, 0.025, cz + 5.5], "#26292d"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.5, 0.03, cz + 5.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.5, 0.03, cz + 5.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 3.9], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 3.8], isYellow ? "#f1c40f" : "#212529");
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
  // 2. OSMANLI REVAKLI TAŞ KÖŞKÜ & MERMER SÜTUNLAR (8.6m x 4.8m x 5.4m)
  // =========================================================================
  const pavilionGroup = new THREE.Group();
  pavilionGroup.position.set(cx, 0, cz);
  group.add(pavilionGroup);

  // Arka ve yan kesme kireçtaşı ana duvarlar (Pavilion stone walls)
  box(pavilionGroup, [8.6, 4.4, 0.45], [0, 2.2, -2.45], "#f5f0e6"); // Arka duvar
  box(pavilionGroup, [0.45, 4.4, 4.9], [-4.075, 2.2, 0], "#f5f0e6"); // Batı yan duvar
  box(pavilionGroup, [0.45, 4.4, 4.9], [4.075, 2.2, 0], "#f5f0e6"); // Doğu yan duvar

  // Rustik pişmiş toprak kaide süpürgeliği
  box(pavilionGroup, [8.7, 0.6, 0.5], [0, 0.3, -2.45], "#a04000");
  box(pavilionGroup, [0.5, 0.6, 5.0], [-4.075, 0.3, 0], "#a04000");
  box(pavilionGroup, [0.5, 0.6, 5.0], [4.075, 0.3, 0], "#a04000");

  // Köşe taşları silmeleri (Ashlar quoins)
  for (let qy = 0.6; qy <= 4.0; qy += 0.6) {
    const isWider = Math.round(qy / 0.6) % 2 === 0;
    const qw = isWider ? 0.55 : 0.48;
    box(pavilionGroup, [qw, 0.28, qw], [-4.075, qy, -2.45], "#d7ccc8");
    box(pavilionGroup, [qw, 0.28, qw], [4.075, qy, -2.45], "#d7ccc8");
    box(pavilionGroup, [qw, 0.28, qw], [-4.075, qy, 2.45], "#d7ccc8");
    box(pavilionGroup, [qw, 0.28, qw], [4.075, qy, 2.45], "#d7ccc8");
  }

  // 4 Adet Yivli Mermer Sütun (4 Fluted Marble Columns with Muqarnas Capitals)
  const columnXPositions = [-3.8, -1.25, 1.25, 3.8];
  for (const colX of columnXPositions) {
    // Sütun kaidesi (Torus/plinth)
    cylinder(pavilionGroup, 0.35, 0.4, 0.45, [colX, 0.225, 2.45], "#bdc3c7", 12);
    // Yivli mermer gövde
    cylinder(pavilionGroup, 0.26, 0.28, 3.2, [colX, 2.05, 2.45], "#ecf0f1", 16);
    // Mukarnaslı sütun başlığı (Muqarnas capital)
    box(pavilionGroup, [0.65, 0.35, 0.65], [colX, 3.8, 2.45], "#ecf0f1");
    box(pavilionGroup, [0.75, 0.15, 0.75], [colX, 4.0, 2.45], "#bdc3c7");
  }

  // 3 Sivri Osmanlı Taş Kemeri (3 Pointed Arches)
  const archSpans = [
    { x: -2.525, w: 2.35 },
    { x: 0, w: 2.35 },
    { x: 2.525, w: 2.35 },
  ];
  for (const arch of archSpans) {
    // Kemer yan lento blokları
    box(pavilionGroup, [arch.w, 0.3, 0.45], [arch.x, 4.15, 2.45], "#f5f0e6");
    // Kemer tepe sivri kilit taşı (Keystone)
    box(pavilionGroup, [0.38, 0.45, 0.48], [arch.x, 4.25, 2.45], "#a04000");
  }

  // Çatı kornişi ve Alaturka kiremit çatı (Hipped Terracotta Roof)
  box(pavilionGroup, [9.2, 0.32, 5.8], [0, 4.4, 0], "#4a2f1c");
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5.4, 1.4, 4),
    mat("#a04000"),
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 5.25, 0);
  pavilionGroup.add(roof);

  // Merkezde Pirinç / Bakır Kubbe & Hilalli Pirinç Alem (Copper Domelet & Crescent Finial)
  cylinder(pavilionGroup, 1.55, 1.6, 0.4, [0, 5.65, 0], "#d7ccc8", 16); // Sekizgen/dairesel kasnak
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat("#d4af37", 0.3),
  );
  dome.position.set(0, 5.85, 0);
  pavilionGroup.add(dome);

  // Hilalli Pirinç Alem (Crescent-and-star brass finial)
  cylinder(pavilionGroup, 0.05, 0.06, 0.75, [0, 7.35, 0], "#f39c12", 8);
  cylinder(pavilionGroup, 0.14, 0.14, 0.12, [0, 7.6, 0], "#f39c12", 10);
  // Hilal yayı
  const crescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.035, 8, 16, Math.PI * 1.3),
    mat("#f39c12", 0.2),
  );
  crescent.rotation.y = Math.PI / 2;
  crescent.position.set(0, 7.82, 0);
  pavilionGroup.add(crescent);

  // Arka duvarda oymalı vitrin ve pencereler
  box(pavilionGroup, [2.4, 2.2, 0.1], [0, 2.2, -2.2], "#3e2723");
  box(pavilionGroup, [2.2, 2.0, 0.05], [0, 2.2, -2.15], "#2c1d11");
  // Raflarda pirinç cezveler ve fincanlar
  for (let ry = 1.4; ry <= 2.8; ry += 0.5) {
    box(pavilionGroup, [2.0, 0.06, 0.25], [0, ry, -2.05], "#5d4037");
    for (let rx = -0.7; rx <= 0.7; rx += 0.45) {
      cylinder(pavilionGroup, 0.07, 0.09, 0.16, [rx, ry + 0.1, -2.0], "#f39c12", 8);
    }
  }

  // =========================================================================
  // 3. IŞIKLI BÜYÜK TABELA VE GECE AYDINLATMASI
  // =========================================================================
  // Çatı alınlığında büyük ışıklı tabela (Öne 12° eğimli)
  const signGroup = new THREE.Group();
  signGroup.position.set(0, 4.8, 2.7);
  signGroup.rotation.x = -0.21;
  pavilionGroup.add(signGroup);

  box(signGroup, [7.8, 0.95, 0.14], [0, 0, 0], "#3e2723"); // Ahşap tabela kasası
  box(signGroup, [7.6, 0.82, 0.16], [0, 0, 0.01], "#1a0f08"); // Koyu zemin
  box(signGroup, [7.7, 0.06, 0.18], [0, 0.44, 0.02], "#d4af37"); // Altın üst pervaz
  box(signGroup, [7.7, 0.06, 0.18], [0, -0.44, 0.02], "#d4af37"); // Altın alt pervaz

  const mainSign = label("☕ TARİHİ ÇARŞI TÜRK KAHVECİSİ · TAHSİN EFENDİ 🍬");
  mainSign.scale.set(1.45, 0.48, 1);
  mainSign.position.set(0, 0.1, 0.11);
  signGroup.add(mainSign);

  const subSign = label("KÖZDE TÜRK KAHVESİ · DİBEK & ANTEP DUBLE LOKUMU · 1908");
  subSign.scale.set(1.15, 0.24, 1);
  subSign.position.set(0, -0.22, 0.11);
  signGroup.add(subSign);

  // Sıcak amber PointLight gece armatürü
  const facadeLight = new THREE.PointLight(0xffb142, 1.4, 22);
  facadeLight.position.set(0, 4.7, 3.2);
  pavilionGroup.add(facadeLight);

  // Asılı ferforje pirinç kafesli kandil (Ornate filigree brass lantern)
  const lanternGroup = new THREE.Group();
  lanternGroup.position.set(0, 3.7, 1.8);
  pavilionGroup.add(lanternGroup);

  cylinder(lanternGroup, 0.02, 0.02, 0.5, [0, 0.25, 0], "#f39c12", 6); // Askı zinciri
  cylinder(lanternGroup, 0.14, 0.18, 0.35, [0, -0.1, 0], "#f39c12", 8); // Pirinç fener gövdesi
  cylinder(lanternGroup, 0.08, 0.12, 0.22, [0, -0.1, 0], "#ffeaa7", 8); // İç amber cam

  const lanternLight = new THREE.PointLight(0xffa502, 1.1, 14);
  lanternLight.position.set(0, -0.1, 0);
  lanternGroup.add(lanternLight);

  // =========================================================================
  // 4. KÖZDE KAHVE MANGALI & BAKIR KUM OCAĞI (Bakır Mangal & Cezveler)
  // =========================================================================
  const stoveGroup = new THREE.Group();
  stoveGroup.position.set(1.5, 0, 0.8);
  pavilionGroup.add(stoveGroup);

  // Taş kaide tezgah
  box(stoveGroup, [2.6, 0.85, 1.4], [0, 0.425, 0], "#d7ccc8");
  box(stoveGroup, [2.7, 0.12, 1.5], [0, 0.91, 0], "#5d4037");

  // Ağır dövme bakır mangal teknesi (Copper sand bed barbecue pan)
  box(stoveGroup, [2.2, 0.22, 1.1], [0, 1.02, 0], "#b87333");
  // Sıcak kızgın kavurma kumu ve kor kömür yatağı
  const sandBed = box(stoveGroup, [2.05, 0.12, 0.95], [0, 1.08, 0], "#c0392b");
  const emberGlow = box(stoveGroup, [1.9, 0.04, 0.8], [0, 1.14, 0], "#ff5722");

  // Ocağın termal titreşen sıcak kor ışığı
  const emberLight = new THREE.PointLight(0xff4500, 1.8, 6.0);
  emberLight.position.set(0, 1.35, 0);
  stoveGroup.add(emberLight);

  // 4 Adet Uzun Saplı Dövme Bakır Cezve (Handcrafted Copper Cezves in hot sand)
  const cezvePositions = [
    { x: -0.6, z: -0.2, rot: 0.2 },
    { x: -0.2, z: 0.15, rot: -0.4 },
    { x: 0.35, z: -0.1, rot: 0.5 },
    { x: 0.7, z: 0.2, rot: -0.3 },
  ];
  for (const c of cezvePositions) {
    const cg = new THREE.Group();
    cg.position.set(c.x, 1.12, c.z);
    cg.rotation.y = c.rot;
    stoveGroup.add(cg);

    // Konik bakır cezve gövdesi
    cylinder(cg, 0.12, 0.16, 0.24, [0, 0.12, 0], "#b87333", 12);
    // Taş taban köpük
    cylinder(cg, 0.11, 0.11, 0.03, [0, 0.24, 0], "#3e2723", 10);
    cylinder(cg, 0.08, 0.08, 0.02, [0, 0.255, 0], "#d7ccc8", 8); // Krema köpüğü
    // Uzun ahşap sap
    const handle = box(cg, [0.03, 0.03, 0.38], [0, 0.2, 0.22], "#5d4037");
    handle.rotation.x = -0.35;
  }

  // Dinamik kahve buharı partikülleri (Rising coffee steam puffs)
  const steamPuffs: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; phase: number }[] = [];
  const steamGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(steamGeo, steamMat);
    const startX = cx + 1.5 + (Math.random() * 0.8 - 0.4);
    const startY = 1.25 + Math.random() * 0.4;
    const startZ = cz + 0.8 + (Math.random() * 0.6 - 0.3);
    mesh.position.set(startX, startY, startZ);
    group.add(mesh);
    steamPuffs.push({
      mesh,
      basePos: new THREE.Vector3(startX, 1.25, startZ),
      speed: 0.6 + Math.random() * 0.4,
      phase: i * 1.2,
    });
  }

  // =========================================================================
  // 5. KAHVE ÇUVALLARI, TAŞ DİBEK & PİRİNÇ EL DEĞİRMENİ
  // =========================================================================
  const storageGroup = new THREE.Group();
  storageGroup.position.set(-2.8, 0, 1.0);
  pavilionGroup.add(storageGroup);

  // Ahşap EUR palet kaide
  box(storageGroup, [1.4, 0.14, 1.1], [0, 0.07, 0], "#bcaaa4");

  // İstiflenmiş Jüt Kahve Çuvalları (Stacked Burlap Coffee Sacks)
  // Çuval 1: Yemen Ham Kahvesi (Yeşil çekirdek)
  const sack1 = box(storageGroup, [0.85, 0.45, 0.55], [-0.2, 0.36, -0.15], "#a1887f");
  sack1.rotation.y = 0.1;
  const sack1Label = label("YEMEN KAHVESİ · 50 KG");
  sack1Label.scale.set(0.65, 0.2, 1);
  sack1Label.position.set(-0.2, 0.42, 0.15);
  storageGroup.add(sack1Label);

  // Çuval 2: Çifte Kavrulmuş Dibek Kahvesi
  const sack2 = box(storageGroup, [0.82, 0.45, 0.52], [0.25, 0.36, 0.1], "#6d4c41");
  sack2.rotation.y = -0.15;
  const sack2Label = label("DİBEK KAHVESİ · 50 KG");
  sack2Label.scale.set(0.65, 0.2, 1);
  sack2Label.position.set(0.25, 0.42, 0.38);
  storageGroup.add(sack2Label);

  // Çuval 3: Üst istif çuval
  const sack3 = box(storageGroup, [0.78, 0.42, 0.48], [0.05, 0.76, 0.0], "#8d6e63");
  sack3.rotation.y = 0.22;

  // Tarihi Taş Dibek (Carved Stone Mortar & Wooden Pestle)
  const mortarGroup = new THREE.Group();
  mortarGroup.position.set(-1.4, 0, 1.2);
  pavilionGroup.add(mortarGroup);

  cylinder(mortarGroup, 0.38, 0.45, 0.75, [0, 0.375, 0], "#546e7a", 12); // Bazalt taş dibek
  cylinder(mortarGroup, 0.28, 0.28, 0.15, [0, 0.72, 0], "#263238", 12); // Dibek iç çanağı
  cylinder(mortarGroup, 0.26, 0.26, 0.04, [0, 0.74, 0], "#3e2723", 10); // Dövülen kahve tozu

  // Ağır gürgen ahşap tokmak
  const pestle = box(mortarGroup, [0.08, 0.95, 0.08], [0.05, 0.95, 0], "#5d4037");
  pestle.rotation.z = 0.18;

  // Nostaljik Pirinç Manuel Kahve El Değirmeni (Cylindrical Brass Manual Coffee Grinder)
  const grinderGroup = new THREE.Group();
  grinderGroup.position.set(-1.4, 0.75, 0.2);
  pavilionGroup.add(grinderGroup);

  cylinder(grinderGroup, 0.14, 0.14, 0.55, [0, 0.275, 0], "#d4af37", 14); // Pirinç silindir gövde
  cylinder(grinderGroup, 0.15, 0.15, 0.08, [0, 0.58, 0], "#f39c12", 14); // Üst huni kapağı
  cylinder(grinderGroup, 0.03, 0.03, 0.18, [0, 0.68, 0], "#7f8c8d", 8); // Krank mili

  // Dönen Krank Kolu ve Ahşap Topuz (Rotating Crank Handle)
  const crankArm = new THREE.Group();
  crankArm.position.set(0, 0.76, 0);
  grinderGroup.add(crankArm);

  box(crankArm, [0.26, 0.02, 0.04], [0.12, 0, 0], "#d4af37");
  cylinder(crankArm, 0.03, 0.03, 0.12, [0.24, 0.06, 0], "#5d4037", 8); // Ahşap döndürme topuzu

  // =========================================================================
  // 6. LOKUM VİTRİNİ, MENÜ ŞÖVALESİ VE SUNUM DONATILARI
  // =========================================================================
  // Antep Fıstıklı & Güllü Lokum Ahşap Vitrini (X: 1.5, Z: -0.8)
  const vitrineGroup = new THREE.Group();
  vitrineGroup.position.set(2.4, 0, -0.6);
  pavilionGroup.add(vitrineGroup);

  box(vitrineGroup, [1.6, 0.85, 0.9], [0, 0.425, 0], "#6d4c41");
  box(vitrineGroup, [1.65, 0.08, 0.95], [0, 0.88, 0], "#5d4037");

  // Cam muhafaza tepsisi
  const glassCover = box(vitrineGroup, [1.45, 0.35, 0.75], [0, 1.08, 0], "#ecf0f1");
  (glassCover.material as THREE.MeshStandardMaterial).transparent = true;
  (glassCover.material as THREE.MeshStandardMaterial).opacity = 0.45;

  // Pudra Şekerli Fıstıklı Duble Lokum Küpleri (Yeşil Antep fıstıklı lokum)
  for (let lx = -0.55; lx <= -0.1; lx += 0.18) {
    for (let lz = -0.22; lz <= 0.22; lz += 0.18) {
      box(vitrineGroup, [0.12, 0.1, 0.12], [lx, 0.96, lz], "#2ecc71"); // Fıstıklı lokum
      box(vitrineGroup, [0.13, 0.02, 0.13], [lx, 1.02, lz], "#ffffff"); // Pudra şekeri
    }
  }

  // Pudra Şekerli Güllü Duble Lokum Küpleri (Kırmızı gül yapraklı lokum)
  for (let lx = 0.1; lx <= 0.55; lx += 0.18) {
    for (let lz = -0.22; lz <= 0.22; lz += 0.18) {
      box(vitrineGroup, [0.12, 0.1, 0.12], [lx, 0.96, lz], "#e74c3c"); // Güllü lokum
      box(vitrineGroup, [0.13, 0.02, 0.13], [lx, 1.02, lz], "#ffffff"); // Pudra şekeri
    }
  }

  const lokumSign = label("🍬 ANTEP FISTIKLI & GÜLLÜ LOKUM");
  lokumSign.scale.set(0.85, 0.22, 1);
  lokumSign.position.set(0, 0.72, 0.48);
  vitrineGroup.add(lokumSign);

  // A-Frame Karataş Tebeşirli Fiyat Şövalesi (Easel Menu)
  const menuGroup = new THREE.Group();
  menuGroup.position.set(3.8, 0, 3.4);
  menuGroup.rotation.y = -0.35;
  pavilionGroup.add(menuGroup);

  // Ahşap A-ayaklar
  const leg1 = box(menuGroup, [0.06, 1.3, 0.06], [-0.35, 0.65, -0.15], "#8d6e63");
  leg1.rotation.x = 0.15;
  const leg2 = box(menuGroup, [0.06, 1.3, 0.06], [0.35, 0.65, -0.15], "#8d6e63");
  leg2.rotation.x = 0.15;
  const backLeg = box(menuGroup, [0.05, 1.25, 0.05], [0, 0.62, 0.22], "#5d4037");
  backLeg.rotation.x = -0.28;

  // Karataş yazı panosu
  const board = box(menuGroup, [0.95, 0.85, 0.06], [0, 0.75, -0.1], "#1e272e");
  board.rotation.x = 0.15;
  const menuText = label("☕ KÖZDE KAHVE: 15₺ | 🍬 ANTEP LOKUMU: 10₺");
  menuText.scale.set(0.8, 0.24, 1);
  menuText.position.set(0, 0.78, -0.06);
  menuText.rotation.x = 0.15;
  menuGroup.add(menuText);

  // Yuvarlak Masada Dantelli Fincan Takımı ve Kristal Sürahi
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-2.6, 0, -0.8);
  pavilionGroup.add(tableGroup);

  cylinder(tableGroup, 0.55, 0.55, 0.06, [0, 0.82, 0], "#5d4037", 14); // Masa tablası
  cylinder(tableGroup, 0.06, 0.06, 0.8, [0, 0.4, 0], "#2c3e50", 8); // Masa ayağı
  cylinder(tableGroup, 0.28, 0.32, 0.04, [0, 0.02, 0], "#2c3e50", 12); // Taban kaidesi

  // Yuvarlak Dövme Bakır Tepsi
  cylinder(tableGroup, 0.38, 0.4, 0.03, [0, 0.86, 0], "#b87333", 14);
  // Porselen Türk Kahvesi Fincanları (Beyaz porselen & altın zarf)
  for (const fx of [-0.15, 0.15]) {
    cylinder(tableGroup, 0.08, 0.06, 0.02, [fx, 0.88, 0], "#f39c12", 8); // Altın zarf tabağı
    cylinder(tableGroup, 0.05, 0.04, 0.07, [fx, 0.92, 0], "#ffffff", 10); // Porselen fincan
    cylinder(tableGroup, 0.04, 0.04, 0.01, [fx, 0.955, 0], "#3e2723", 8); // Kahve köpüğü
  }

  // =========================================================================
  // 7. ANİMASYONLU USTA KAHVECİ NPC — "KAHVECİ TAHSİN EFENDİ"
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(TAHSIN_EFENDI_POS.x, 0, TAHSIN_EFENDI_POS.z); // X: 35.5, Z: 76.8
  group.add(npcGroup);

  // Ayaklar ve koyu lacivert pantolon
  cylinder(npcGroup, 0.11, 0.11, 0.85, [-0.16, 0.425, 0], "#1a252f", 8);
  cylinder(npcGroup, 0.11, 0.11, 0.85, [0.16, 0.425, 0], "#1a252f", 8);
  box(npcGroup, [0.14, 0.1, 0.22], [-0.16, 0.05, 0.04], "#2c3e50");
  box(npcGroup, [0.14, 0.1, 0.22], [0.16, 0.05, 0.04], "#2c3e50");

  // Üst Gövde Grubu (Kafa/Gövde Takibi için Pivot)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.85, 0);
  npcGroup.add(torsoPivot);

  // Beyaz yakasız gömlek & Altın Sırmalı Bordo Kadife Cepken (Embroidered Velvet Vest)
  box(torsoPivot, [0.52, 0.65, 0.32], [0, 0.325, 0], "#ffffff"); // Gömlek
  box(torsoPivot, [0.55, 0.58, 0.34], [0, 0.36, 0], "#800000"); // Bordo kadife cepken
  // Cepken altın sırma işlemeleri
  box(torsoPivot, [0.05, 0.58, 0.35], [-0.14, 0.36, 0], "#f1c40f");
  box(torsoPivot, [0.05, 0.58, 0.35], [0.14, 0.36, 0], "#f1c40f");
  // İpek kırmızı bel kuşağı (Silk sash)
  box(torsoPivot, [0.56, 0.16, 0.35], [0, 0.08, 0], "#c0392b");

  // Sol Kol (Tepsi taşıyan kol)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.31, 0.55, 0);
  torsoPivot.add(leftArm);
  cylinder(leftArm, 0.07, 0.07, 0.35, [0, -0.15, 0.08], "#ffffff", 6);
  leftArm.rotation.x = -0.65;
  leftArm.rotation.y = 0.2;

  // Sağ Kol (Selamlama için hareketli sağ kol pivotu)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.31, 0.55, 0);
  torsoPivot.add(rightArm);
  cylinder(rightArm, 0.07, 0.07, 0.35, [0, -0.15, 0], "#ffffff", 6);

  // Kahve Servis Tepsisi (Pirinç yuvarlak tepsi & fincanlar)
  const trayGroup = new THREE.Group();
  trayGroup.position.set(-0.15, 0.45, 0.38);
  torsoPivot.add(trayGroup);
  cylinder(trayGroup, 0.26, 0.28, 0.02, [0, 0, 0], "#f39c12", 12);
  cylinder(trayGroup, 0.04, 0.03, 0.06, [0.06, 0.04, 0.04], "#ffffff", 8);
  cylinder(trayGroup, 0.04, 0.03, 0.06, [-0.06, 0.04, -0.04], "#ffffff", 8);

  // Kafa Grubu
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.72, 0);
  torsoPivot.add(headPivot);

  // Baş ve boyun
  cylinder(headPivot, 0.08, 0.09, 0.12, [0, -0.04, 0], "#f1c27d", 8);
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    mat("#f1c27d"),
  );
  headMesh.position.set(0, 0.1, 0);
  headPivot.add(headMesh);

  // Pos Esnaf Bıyığı (Graying merchant mustache)
  const stache = box(headPivot, [0.22, 0.05, 0.06], [0, 0.06, 0.17], "#7f8c8d");
  stache.rotation.z = 0.08;

  // Bordo Osmanlı Fezi ve Siyah Püskül (Crimson Fez with Black Tassel)
  cylinder(headPivot, 0.16, 0.14, 0.22, [0, 0.28, 0], "#962d22", 12);
  cylinder(headPivot, 0.015, 0.015, 0.14, [0.08, 0.26, 0.08], "#111111", 6); // Püskül

  // 3D Konuşma Balonu (Speech Bubble)
  const speechBubbleGroup = new THREE.Group();
  speechBubbleGroup.position.set(0, 1.45, 0);
  speechBubbleGroup.visible = false;
  torsoPivot.add(speechBubbleGroup);

  const bubbleBg = box(speechBubbleGroup, [3.8, 0.65, 0.08], [0, 0, 0], "#ffffff");
  (bubbleBg.material as THREE.MeshStandardMaterial).roughness = 0.1;
  const bubbleLabel = label(TAHSIN_EFENDI_CALLOUTS[0]);
  bubbleLabel.scale.set(1.4, 0.35, 1);
  bubbleLabel.position.set(0, 0, 0.05);
  speechBubbleGroup.add(bubbleLabel);

  // =========================================================================
  // 8. ENGEL/ÇARPIŞMA SINIRLARI (Collision Obstacles)
  // =========================================================================
  // 1. Taş köşk ana gövdesi (Pavilion building mass)
  obstacles.push({
    minX: cx - 4.5,
    maxX: cx + 4.5,
    minZ: cz - 2.8,
    maxZ: cz + 2.8,
  });

  // 2. Taş kaide ve ocak tezgahı (Stove counter & barbecue)
  obstacles.push({
    minX: cx + 0.2,
    maxX: cx + 3.2,
    minZ: cz + 0.1,
    maxZ: cz + 1.8,
  });

  // 3. Jüt çuval istifi ve taş dibek (Sacks pallet & mortar)
  obstacles.push({
    minX: cx - 3.6,
    maxX: cx - 0.8,
    minZ: cz + 0.3,
    maxZ: cz + 1.9,
  });

  // 4. Ahşap A-şövale menü tabelası (Menu easel)
  obstacles.push({
    minX: cx + 3.3,
    maxX: cx + 4.4,
    minZ: cz + 2.8,
    maxZ: cz + 4.0,
  });

  // =========================================================================
  // 9. DİNAMİK GÜNCELLEME VE ETKİLEŞİM METOTLARI
  // =========================================================================
  let greetingTimer = 0;

  function update(
    dt: number,
    stateOrNight?: TurkishCoffeeState | boolean,
    playerPos?: Vec2,
    isNightOrDusk = false,
  ) {
    const isNight = typeof stateOrNight === "boolean" ? stateOrNight : isNightOrDusk;
    const state = typeof stateOrNight === "object" ? stateOrNight : undefined;

    // 1. Gece/Gündüz armatür ışık şiddeti ayarı
    facadeLight.intensity = isNight ? 2.2 : 0.8;
    lanternLight.intensity = isNight ? 1.6 : 0.6;

    // 2. Köz mangalı kor ışığı nabız titreşimi (PointLight flame flicker)
    const emberPhase = state ? state.emberGlowPhase : (Date.now() * 0.005) % (Math.PI * 2);
    emberLight.intensity = 1.4 + Math.sin(emberPhase) * 0.5 + Math.cos(emberPhase * 2.3) * 0.3;

    // 3. Kahve el değirmeni krank kolu mekanik dönüşü
    const crankPhase = state ? state.grinderCrankPhase : (Date.now() * 0.003) % (Math.PI * 2);
    crankArm.rotation.y = crankPhase;

    // 4. Kahve kokusu ve buhar partikülleri salınımı
    for (const puff of steamPuffs) {
      puff.phase += dt * puff.speed;
      puff.mesh.position.y = puff.basePos.y + (puff.phase % 1.6);
      puff.mesh.position.x = puff.basePos.x + Math.sin(puff.phase * 3.0) * 0.08;
      const progress = (puff.phase % 1.6) / 1.6;
      (puff.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.35 * (1 - progress));
      const scale = 0.8 + progress * 1.5;
      puff.mesh.scale.set(scale, scale, scale);
    }

    // 5. Tahsin Efendi NPC animasyonları ve konuşma balonu
    if (greetingTimer > 0) {
      greetingTimer = Math.max(0, greetingTimer - dt);
    }

    if (state?.honkGreetingTimer && state.honkGreetingTimer > 0) {
      speechBubbleGroup.visible = true;
      rightArm.rotation.x = -Math.PI * 0.85; // Kolunu havaya kaldırıp selamlama
      rightArm.rotation.z = Math.sin(Date.now() * 0.01) * 0.25;
      if (state.callout) {
        // Baloncuk yönü kameraya bakar
        speechBubbleGroup.lookAt(playerPos?.x ?? 0, 1.8, playerPos?.z ?? 0);
      }
    } else if (greetingTimer > 0) {
      speechBubbleGroup.visible = true;
      rightArm.rotation.x = -Math.PI * 0.85;
      rightArm.rotation.z = Math.sin(Date.now() * 0.01) * 0.25;
    } else {
      speechBubbleGroup.visible = false;
      rightArm.rotation.x = 0;
      rightArm.rotation.z = 0;
    }

    // 6. Baş ve Gövde Takibi (Head & Torso tracking within 22m)
    if (playerPos) {
      const dx = playerPos.x - TAHSIN_EFENDI_POS.x;
      const dz = playerPos.z - TAHSIN_EFENDI_POS.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 22.0) {
        const targetAngle = Math.atan2(dx, dz);
        torsoPivot.rotation.y = THREE.MathUtils.lerp(torsoPivot.rotation.y, targetAngle * 0.65, dt * 4.0);
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, targetAngle * 0.35, dt * 6.0);
      } else {
        torsoPivot.rotation.y = THREE.MathUtils.lerp(torsoPivot.rotation.y, 0, dt * 2.0);
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, 0, dt * 2.0);
      }
    }
  }

  function onPlayerHonk(playerPos: Vec2): boolean {
    const dist = Math.hypot(playerPos.x - TAHSIN_EFENDI_POS.x, playerPos.z - TAHSIN_EFENDI_POS.z);
    if (dist <= 24.0) {
      greetingTimer = 4.5;
      speechBubbleGroup.visible = true;
      return true;
    }
    return false;
  }

  function dispose() {
    group.clear();
  }

  return {
    group,
    obstacles,
    update,
    onPlayerHonk,
    dispose,
  };
}
