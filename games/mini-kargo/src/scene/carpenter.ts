import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type CarpenterState,
  CARPENTER_CENTER,
  CARPENTER_BAY,
  RUSTEM_USTA_POS,
  RUSTEM_USTA_CALLOUTS,
} from "../game/carpenter";

export type CarpenterView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: CarpenterState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sanayi "Tarihi Marangozlar Sitesi & Ahşap Kereste Atölyesi" (T55)
 * - Otantik Sanayi Ahşap İşleme Atölyesi & Kereste İstif Sahası:
 *   - Masif Douglas-fir taşıyıcı ahşap kolonlar, A-çatı makasları ve galvaniz sundurma
 *   - Beton ve talaş zeminli avlu tablası (12.0m x 9.0m) ve asfalt servis peronu (CARPENTER_BAY: X: 62.0, Z: -68.0)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Büyük aydınlatmalı kurumsal çatı tabelası ("🪵 SANAYİ TARİHİ MARANGOZLAR SİTESİ · RÜSTEM USTA 🪚")
 *   - Gece atölyeyi aydınlatan sıcak kehribar PointLight armatürü
 *   - Dikey kereste istif raflarında sarı çam, kızıl sedir ve koyu meşe kalasları
 *   - Ahşap palet üzerinde piramit şeklinde istiflenmiş silindirik çam kütükleri
 *   - Dönen metal daire testere tezgahı, kırmızı koruma siperi ve dinamik talaş partikülleri
 *   - Marangoz çalışma tezgahı, el rendesi, tokmak ve ahşap kargo sandığı
 * - Animasyonlu Usta Marangoz NPC — "Marangoz Rüstem Usta" (X: 60.5, Z: -72.0):
 *   - Bordo flanel gömlek, askılı kot tulum, talaş lekeleri, kulak arkası kurşun kalemi, katlanır sarı metre
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada kolunu kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createCarpenterView(): CarpenterView {
  const group = new THREE.Group();
  group.name = "carpenter-view";
  const obstacles: Rect[] = [];

  const cx = CARPENTER_CENTER.x; // 62.0
  const cz = CARPENTER_CENTER.z; // -74.5

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Atölye zemin beton/sıkıştırılmış talaş tablası (12.0m x 9.0m)
  box(yardGroup, [12.0, 0.12, 9.0], [0, 0.04, 0], "#968f82");
  box(yardGroup, [11.6, 0.05, 8.6], [0, 0.10, 0], "#857e72");

  // Çevre granit ve endüstriyel bordür taşları
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, -4.5], "#4b5358");
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, 4.5], "#4b5358");
  box(yardGroup, [0.22, 0.18, 9.2], [-6.05, 0.09, 0], "#4b5358");
  box(yardGroup, [0.22, 0.18, 9.2], [6.05, 0.09, 0], "#4b5358");

  // Servis Yanaşma Peronu (CARPENTER_BAY: X: 62.0, Z: -68.0) - Z: -66 sokağının kuzey bordüründe
  box(group, [5.2, 0.02, 3.2], [cx, 0.025, cz + 6.5], "#2e3338"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.5, 0.03, cz + 6.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.5, 0.03, cz + 6.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 5.0], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 4.9], isYellow ? "#f1c40f" : "#212529");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 6.4], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 7.2);
  group.add(arrowHead);

  // =========================================================================
  // 2. MASİF DOUGLAS-FIR AHŞAP KARKAS & A-ÇATI MAKASLARI
  // =========================================================================
  const shedGroup = new THREE.Group();
  shedGroup.position.set(cx, 0, cz - 0.5);
  group.add(shedGroup);

  const shedW = 10.4;
  const shedD = 6.8;
  const hCol = 3.8;

  // 4 ana dikey masif ahşap kolon sütun
  const colPositions = [
    [-shedW / 2 + 0.3, -shedD / 2 + 0.3],
    [shedW / 2 - 0.3, -shedD / 2 + 0.3],
    [-shedW / 2 + 0.3, shedD / 2 - 0.3],
    [shedW / 2 - 0.3, shedD / 2 - 0.3],
  ];
  for (const [colX, colZ] of colPositions) {
    box(shedGroup, [0.38, hCol, 0.38], [colX, hCol / 2, colZ], "#6e3f19");
    // Taban döküm demir pabuçları
    box(shedGroup, [0.46, 0.18, 0.46], [colX, 0.09, colZ], "#34495e");
  }

  // Yatay masif lamine kirişler
  box(shedGroup, [shedW, 0.28, 0.32], [0, hCol - 0.14, -shedD / 2 + 0.3], "#5c3314");
  box(shedGroup, [shedW, 0.28, 0.32], [0, hCol - 0.14, shedD / 2 - 0.3], "#5c3314");
  box(shedGroup, [0.32, 0.28, shedD], [-shedW / 2 + 0.3, hCol - 0.14, 0], "#5c3314");
  box(shedGroup, [0.32, 0.28, shedD], [shedW / 2 - 0.3, hCol - 0.14, 0], "#5c3314");

  // Çift Eğimli Çatı Makasları & A-Truss Kirişleri
  const trussRoof = new THREE.Group();
  trussRoof.position.set(0, hCol, 0);
  shedGroup.add(trussRoof);

  // Oluklu galvaniz sanayi sacı gölgeliği (yarı açık atölye çatısı)
  const roofSlopeL = box(trussRoof, [shedW + 0.6, 0.08, shedD / 2 + 0.6], [0, 0.55, -shedD / 4], "#4a5568");
  roofSlopeL.rotation.x = 0.25;
  const roofSlopeR = box(trussRoof, [shedW + 0.6, 0.08, shedD / 2 + 0.6], [0, 0.55, shedD / 4], "#52606d");
  roofSlopeR.rotation.x = -0.25;

  // Çatı sırt mahyası ve ahşap korniş saçakları
  box(trussRoof, [shedW + 0.8, 0.16, 0.24], [0, 0.95, 0], "#6e3f19");

  // =========================================================================
  // 3. IŞIKLI BÜYÜK KURUMSAL ÇATI TABELASI & GECE AYDINLATMASI
  // =========================================================================
  const marqueeGroup = new THREE.Group();
  marqueeGroup.position.set(0, hCol + 0.85, shedD / 2 + 0.05);
  shedGroup.add(marqueeGroup);

  // Ahşap tabela alınlık levhası
  box(marqueeGroup, [8.4, 0.95, 0.18], [0, 0, 0], "#3e2716");
  box(marqueeGroup, [8.6, 0.12, 0.24], [0, 0.48, 0], "#c68a4c"); // Altın sarısı üst pervaz
  box(marqueeGroup, [8.6, 0.12, 0.24], [0, -0.48, 0], "#c68a4c"); // Alt pervaz

  // Kurumsal yazı etiketleri
  const mainSign = label("🪵 SANAYİ TARİHİ MARANGOZLAR SİTESİ · RÜSTEM USTA 🪚", "#fff8e7", "#5c3314");
  mainSign.scale.set(4.0, 0.52, 1);
  mainSign.position.set(0, 0.14, 0.12);
  marqueeGroup.add(mainSign);

  const subSign = label("MASİF AHŞAP İŞÇİLİĞİ · KERESTE & KARGO SANDIKLARI · 1968", "#f9e79f", "#2c3e50");
  subSign.scale.set(3.4, 0.28, 1);
  subSign.position.set(0, -0.22, 0.12);
  marqueeGroup.add(subSign);

  // Gece aydınlatması için sıcak amber PointLight armatürü
  const nightLight = new THREE.PointLight(0xffb74d, 0, 14, 1.4);
  nightLight.position.set(0, hCol - 0.4, 0);
  shedGroup.add(nightLight);

  // Nostaljik atölye sarkıt lamba armatürü (yeşil emaye çan gölgelik)
  cylinder(shedGroup, 0.32, 0.08, 0.25, [0, hCol - 0.25, 0], "#196f3d", 12);
  cylinder(shedGroup, 0.02, 0.02, 0.5, [0, hCol, 0], "#17202a", 6);

  // =========================================================================
  // 4. DİKEY KERESTE İSTİF RAFLARI (Batı Kanadı: X: cx - 3.8)
  // =========================================================================
  const rackGroup = new THREE.Group();
  rackGroup.position.set(cx - 3.8, 0, cz - 0.8);
  group.add(rackGroup);

  // Ağır çelik taşıyıcı A-çatkı iskeleti
  box(rackGroup, [0.22, 3.6, 4.4], [-1.0, 1.8, 0], "#2c3e50");
  box(rackGroup, [0.22, 3.6, 4.4], [1.0, 1.8, 0], "#2c3e50");
  box(rackGroup, [2.2, 0.18, 4.4], [0, 0.1, 0], "#34495e");

  // Dikey sıralanmış masif tahtalar (Sarı çam, kızıl sedir, meşe)
  const lumberColors = ["#dfae64", "#b9770e", "#7e5109", "#e5b364", "#a0522d", "#d4ac0d"];
  for (let lz = -1.8; lz <= 1.8; lz += 0.45) {
    const colA = lumberColors[Math.abs(Math.round(lz * 5)) % lumberColors.length];
    const colB = lumberColors[(Math.abs(Math.round(lz * 5)) + 1) % lumberColors.length];
    const hPlank = 3.0 + (Math.sin(lz * 3.0) * 0.4);

    // Sol ve sağ kademelerdeki dikey tahtalar
    box(rackGroup, [0.12, hPlank, 0.35], [-0.5, hPlank / 2, lz], colA);
    box(rackGroup, [0.12, hPlank - 0.2, 0.35], [0.5, (hPlank - 0.2) / 2, lz], colB);
  }

  // =========================================================================
  // 5. ÇAM KÜTÜK YIĞINLARI & PALETLER (Doğu Kanadı: X: cx + 3.8)
  // =========================================================================
  const logPileGroup = new THREE.Group();
  logPileGroup.position.set(cx + 3.8, 0, cz - 0.8);
  group.add(logPileGroup);

  // EUR ahşap palet kaidesi
  box(logPileGroup, [2.6, 0.18, 4.2], [0, 0.09, 0], "#a07844");

  // Piramit şeklinde istiflenmiş silindirik çam kütükleri (Alt sıra 3, orta sıra 2, üst sıra 1)
  const logRadius = 0.32;
  const logLength = 3.8;
  const logLayers = [
    { y: 0.18 + logRadius, xs: [-0.68, 0.0, 0.68] },
    { y: 0.18 + logRadius * 2.5, xs: [-0.34, 0.34] },
    { y: 0.18 + logRadius * 4.0, xs: [0.0] },
  ];

  for (const layer of logLayers) {
    for (const lx of layer.xs) {
      // Çam kütüğü silindiri (Z eksenine yatık)
      const logMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(logRadius, logRadius, logLength, 12),
        mat("#5c3a21"),
      );
      logMesh.rotation.x = Math.PI / 2;
      logMesh.position.set(lx, layer.y, 0);
      logPileGroup.add(logMesh);

      // Kütük uç kesitleri (Halkalı açık ahşap dokusu)
      cylinder(logPileGroup, logRadius * 0.94, logRadius * 0.94, 0.02, [lx, layer.y, logLength / 2 + 0.01], "#d7b274", 12);
      cylinder(logPileGroup, logRadius * 0.94, logRadius * 0.94, 0.02, [lx, layer.y, -logLength / 2 - 0.01], "#d7b274", 12);
    }
  }

  // Çelik bağlama gerdirme şeritleri
  for (const sz of [-1.2, 1.2]) {
    box(logPileGroup, [2.2, 0.04, 0.06], [0, 0.18 + logRadius * 4.4, sz], "#2c3e50");
  }

  // =========================================================================
  // 6. DÖNEN DAİRE TESTERE TEZGAHI & TALAŞ PARTİKÜLLERİ (X: cx + 1.4, Z: cz + 0.8)
  // =========================================================================
  const sawTableGroup = new THREE.Group();
  sawTableGroup.position.set(cx + 1.4, 0, cz + 0.8);
  group.add(sawTableGroup);

  // Döküm demir tezgah gövdesi ve ayakları
  box(sawTableGroup, [1.8, 0.92, 1.3], [0, 0.46, 0], "#2c3e50");
  box(sawTableGroup, [1.9, 0.08, 1.4], [0, 0.96, 0], "#7f8c8d"); // Parlak taşlanmış çelik tezgah tablası

  // Dairesel Testere Bıçağı (Dönen bileşen)
  const bladePivot = new THREE.Group();
  bladePivot.position.set(0, 1.15, 0);
  sawTableGroup.add(bladePivot);

  const bladeRadius = 0.42;
  const bladeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(bladeRadius, bladeRadius, 0.025, 20),
    mat("#e0e0e0"),
  );
  bladeMesh.rotation.z = Math.PI / 2; // Dikey testere bıçağı diski
  bladePivot.add(bladeMesh);

  // Testere dişleri kontrast halkası
  const teethMesh = new THREE.Mesh(
    new THREE.RingGeometry(bladeRadius * 0.82, bladeRadius, 20),
    mat("#95a5a6"),
  );
  teethMesh.rotation.y = Math.PI / 2;
  bladePivot.add(teethMesh);

  // Kırmızı güvenlik koruyucu muhafazası (Blade Safety Hood)
  cylinder(sawTableGroup, 0.46, 0.46, 0.12, [0, 1.32, 0], "#c0392b", 12);

  // Kesilen masif tahta iş parçası
  box(sawTableGroup, [0.9, 0.08, 1.8], [0.35, 1.02, 0.1], "#dfae64");

  // Dinamik Savrulan Talaş Partikülleri (Dynamic Sawdust Particles)
  const sawdustGroup = new THREE.Group();
  sawdustGroup.position.set(0, 1.15, 0);
  sawTableGroup.add(sawdustGroup);

  const sawdustFlakes: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; phase: number }[] = [];
  const flakeColors = ["#f39c12", "#f1c40f", "#d4ac0d", "#e59866"];
  for (let i = 0; i < 8; i++) {
    const flakeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.06),
      mat(flakeColors[i % flakeColors.length]),
    );
    const ang = (i / 8) * Math.PI * 2;
    const rad = 0.15 + (i * 0.04);
    const bp = new THREE.Vector3(Math.cos(ang) * rad, 0.1 + (i * 0.05), Math.sin(ang) * rad);
    flakeMesh.position.copy(bp);
    sawdustGroup.add(flakeMesh);
    sawdustFlakes.push({
      mesh: flakeMesh,
      basePos: bp,
      speed: 2.5 + (i * 0.4),
      phase: i * 0.8,
    });
  }

  // =========================================================================
  // 7. MARANGOZ ÇALIŞMA TEZGAHI & EL ALETLERİ (X: cx - 1.2, Z: cz + 0.8)
  // =========================================================================
  const benchGroup = new THREE.Group();
  benchGroup.position.set(cx - 1.2, 0, cz + 0.8);
  group.add(benchGroup);

  // Ağır gürgen çalışma masası
  box(benchGroup, [1.8, 0.88, 0.9], [0, 0.44, 0], "#784212");
  box(benchGroup, [2.0, 0.12, 1.0], [0, 0.94, 0], "#935116"); // Kalın masif tabla

  // Tezgah ön mengene çenesi ve ahşap sıkma kolu
  box(benchGroup, [0.38, 0.16, 0.12], [-0.7, 0.92, 0.55], "#5c3314");
  cylinder(benchGroup, 0.025, 0.025, 0.32, [-0.7, 0.92, 0.65], "#dfae64", 8);

  // Tezgah üstü aletler: el rendesi, tokmak ve çekiç
  // El rendesi (Hand plane)
  box(benchGroup, [0.32, 0.08, 0.12], [0.2, 1.04, 0], "#b9770e");
  cylinder(benchGroup, 0.03, 0.03, 0.08, [0.3, 1.12, 0], "#5c3314", 8);

  // Ahşap tokmak (Carpenter mallet)
  box(benchGroup, [0.14, 0.12, 0.1], [-0.2, 1.05, 0.15], "#873600");
  cylinder(benchGroup, 0.02, 0.02, 0.28, [-0.2, 1.05, 0], "#dfae64", 8);

  // Tamamlanmış dayanıklı ahşap Mini Kargo sandığı (Heavy Wooden Cargo Crate)
  const crateGroup = new THREE.Group();
  crateGroup.position.set(cx - 2.5, 0, cz + 2.0);
  group.add(crateGroup);
  box(crateGroup, [1.1, 0.9, 1.1], [0, 0.45, 0], "#b9770e");
  box(crateGroup, [1.14, 0.12, 1.14], [0, 0.85, 0], "#873600"); // Kapak kuşağı
  box(crateGroup, [1.14, 0.12, 1.14], [0, 0.06, 0], "#873600"); // Taban kuşağı

  // Sandık üzeri Mini Kargo şablon logosu
  const crateLogo = label("📦 MK", "#2c3e50", "#dfae64");
  crateLogo.scale.set(0.6, 0.35, 1);
  crateLogo.position.set(0, 0.45, 0.56);
  crateGroup.add(crateLogo);

  // =========================================================================
  // 8. ANİMASYONLU USTA MARANGOZ NPC — "MARANGOZ RÜSTEM USTA"
  // =========================================================================
  const rustemGroup = new THREE.Group();
  rustemGroup.position.set(RUSTEM_USTA_POS.x, 0, RUSTEM_USTA_POS.z);
  group.add(rustemGroup);

  // Botlar
  box(rustemGroup, [0.22, 0.16, 0.32], [-0.16, 0.08, 0.05], "#2c3e50");
  box(rustemGroup, [0.22, 0.16, 0.32], [0.16, 0.08, 0.05], "#2c3e50");

  // Kot tulum bacakları (Sawdust dusted denim)
  box(rustemGroup, [0.22, 0.72, 0.26], [-0.16, 0.50, 0], "#284b63");
  box(rustemGroup, [0.22, 0.72, 0.26], [0.16, 0.50, 0], "#284b63");

  // Gövde: Bordo flanel gömlek ve askılı kot tulum göğsü
  box(rustemGroup, [0.58, 0.76, 0.34], [0, 1.16, 0], "#900c3f"); // Bordo ekoseli gömlek
  box(rustemGroup, [0.46, 0.58, 0.36], [0, 1.12, 0.02], "#284b63"); // Kot tulum önlüğü
  // Tulum sarı pirinç tokaları
  box(rustemGroup, [0.08, 0.08, 0.04], [-0.16, 1.36, 0.20], "#f1c40f");
  box(rustemGroup, [0.08, 0.08, 0.04], [0.16, 1.36, 0.20], "#f1c40f");
  // Göğüs cebi ve katlanır sarı marangoz metresi (Folding ruler)
  box(rustemGroup, [0.18, 0.14, 0.02], [-0.12, 1.18, 0.21], "#1f384d");
  box(rustemGroup, [0.05, 0.22, 0.03], [-0.12, 1.25, 0.22], "#f1c40f");

  // Kafa ve Boyun Pivoti (Head tracking için)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.58, 0);
  rustemGroup.add(headPivot);

  // Kafa
  box(headPivot, [0.34, 0.34, 0.32], [0, 0.17, 0], "#f5cba7");
  // Heybetli usta bıyığı
  box(headPivot, [0.24, 0.08, 0.08], [0, 0.11, 0.18], "#5d6d7e");
  // Kulak arkasına sıkıştırılmış marangoz kurşun kalemi (Carpenter pencil)
  box(headPivot, [0.04, 0.22, 0.04], [0.20, 0.22, 0.02], "#e74c3c");
  box(headPivot, [0.03, 0.06, 0.03], [0.20, 0.33, 0.02], "#17202a"); // Kurşun uç

  // Kollar ve Selamlama Pivoti
  // Sol Kol (Belinde dinlenen sol kol)
  const leftArm = box(rustemGroup, [0.16, 0.65, 0.18], [-0.36, 1.15, 0], "#900c3f");
  cylinder(rustemGroup, 0.08, 0.08, 0.16, [-0.36, 0.78, 0], "#784212", 8); // Deri eldiven

  // Sağ Kol Pivoti (Selamlama & Alet tutma)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.36, 1.45, 0);
  rustemGroup.add(rightArmPivot);

  const rightArm = box(rightArmPivot, [0.16, 0.65, 0.18], [0, -0.30, 0], "#900c3f");
  cylinder(rightArmPivot, 0.08, 0.08, 0.16, [0, -0.66, 0], "#784212", 8); // Eldiven

  // Elde tutulan ahşap tokmak
  const handTool = box(rightArmPivot, [0.12, 0.18, 0.10], [0, -0.74, 0.12], "#873600");
  cylinder(rightArmPivot, 0.02, 0.02, 0.28, [0, -0.64, 0.12], "#dfae64", 8);

  // 3D Konuşma Balonu (Speech Bubble)
  const speechBubbleGroup = new THREE.Group();
  speechBubbleGroup.position.set(0, 2.35, 0);
  speechBubbleGroup.visible = false;
  rustemGroup.add(speechBubbleGroup);

  box(speechBubbleGroup, [4.8, 0.95, 0.14], [0, 0, 0], "#ffffff");
  box(speechBubbleGroup, [4.9, 1.05, 0.08], [0, 0, -0.02], "#3e2716"); // Kahve/altın çerçeve

  const speechText = label("🪵 Hoş geldin evlat! Fırınlanmış meşeden sandık yapıyoruz! 🪚", "#2c3e50", "#ffffff");
  speechText.scale.set(4.4, 0.65, 1);
  speechText.position.set(0, 0.04, 0.08);
  speechBubbleGroup.add(speechText);

  // Balon yön kuyruğu (aşağı gösterir)
  const tailMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.35, 3),
    mat("#ffffff"),
  );
  tailMesh.rotation.z = Math.PI;
  tailMesh.position.set(0, -0.58, 0);
  speechBubbleGroup.add(tailMesh);

  // =========================================================================
  // 9. ENGEL GEOMETRİSİ (COLLIDERS)
  // =========================================================================
  // Ana ahşap atölye binası, tezgahlar ve kereste rafları kütlesi
  // Service bay X: 62.0, Z: -68.0 tamamen açık ve serbesttir!
  obstacles.push({
    minX: cx - 5.5, // 56.5
    maxX: cx + 5.5, // 67.5
    minZ: cz - 4.0, // -78.5
    maxZ: cz + 3.0, // -71.5
    height: 4.2,
  });

  // =========================================================================
  // 10. GÜNCELLEME VE ETKİLEŞİM METODLARI
  // =========================================================================
  let speechTimer = 0;
  let waveTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: CarpenterState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      let state: CarpenterState | undefined;
      let night = false;
      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
        night = Boolean(isNightOrDusk);
      }

      // 1. Gece aydınlatması PointLight kontrolü
      if (night) {
        nightLight.intensity = THREE.MathUtils.lerp(nightLight.intensity, 1.8, dt * 3.0);
      } else {
        nightLight.intensity = THREE.MathUtils.lerp(nightLight.intensity, 0.0, dt * 3.0);
      }

      // 2. Dönen daire testere bıçağı animasyonu
      bladeMesh.rotation.x += dt * 32.0;

      // 3. Talaş partikülleri savrulma ve yerçekimi süzülüşü
      for (const flake of sawdustFlakes) {
        flake.phase += dt * flake.speed;
        const lift = (Math.sin(flake.phase) + 1.0) * 0.18;
        const drift = Math.cos(flake.phase * 0.8) * 0.08;
        flake.mesh.position.y = flake.basePos.y + lift;
        flake.mesh.position.x = flake.basePos.x + drift;
        flake.mesh.rotation.x += dt * 6.0;
        flake.mesh.rotation.y += dt * 8.0;
      }

      // 4. Marangoz Rüstem Usta kafa ve gövde takibi (22m içinde)
      if (playerPos) {
        const dx = playerPos.x - RUSTEM_USTA_POS.x;
        const dz = playerPos.z - RUSTEM_USTA_POS.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, targetAngle, dt * 4.0);
        } else {
          headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, 0, dt * 2.0);
        }
      }

      // 5. Duraklama / Honk selamlama animasyonu
      if (state && (state.dwellTimer > 0 || state.honkGreetingTimer > 0)) {
        waveTimer = Math.max(waveTimer, 2.5);
      }
      if (waveTimer > 0) {
        waveTimer -= dt;
        const wave = Math.sin((2.5 - waveTimer) * 7.5);
        rightArmPivot.rotation.x = -1.2 + wave * 0.45;
        rightArmPivot.rotation.z = -0.3 + wave * 0.35;
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 4.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 4.0);
      }

      // 6. Konuşma balonu zamanlayıcısı ve metni
      if (state?.callout || state?.lastHonkCallout) {
        speechTimer = 4.2;
        speechBubbleGroup.visible = true;
      }
      if (speechTimer > 0) {
        speechTimer -= dt;
        speechBubbleGroup.visible = true;
        // Kamera veya oyuncuya doğru hafif hafif yukarı süzülme
        speechBubbleGroup.position.y = 2.35 + Math.sin(speechTimer * 2.5) * 0.05;
      } else {
        speechBubbleGroup.visible = false;
      }
    },
    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - RUSTEM_USTA_POS.x, playerPos.z - RUSTEM_USTA_POS.z);
      if (dist <= 22.0) {
        waveTimer = 3.5;
        speechTimer = 4.0;
        speechBubbleGroup.visible = true;
        return true;
      }
      return false;
    },
    dispose() {
      nightLight.dispose();
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
    },
  };
}
