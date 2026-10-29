import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type MarketState,
  MARKET_CENTER,
  MARKET_BAY,
  CEMIL_DAYI_POS,
  CEMIL_DAYI_CALLOUTS,
} from "../game/market";

export type MarketView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: MarketState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Güneş Mahallesi "Geleneksel Mahalle Semt Pazarı & Taze Manav Tezgahları" (T54)
 * - Otantik Açık Hava Mahalle Pazar Yeri:
 *   - Taş döşeli pazar meydanı tablası ve servis yanaşma peronu (MARKET_BAY: X: -72.0, Z: -52.5)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Üç bölümlü ahşap pazar tezgahları ve çizgili kumaş güneşlik tenteleri (sarı/beyaz, kırmızı/beyaz, yeşil/beyaz)
 *   - Öne eğimli aydınlatmalı çatı tabelası ("🍉 GÜNEŞ MAHALLESİ SEMT PAZARI · CEMİL DAYI 🍋")
 *   - Gece tezgahları aydınlatan sıcak sarı PointLight fener armatürü
 *   - Kademeli masif ahşap kasalarda Akdeniz meyve/sebze yığınları (domates, limon, portakal, patlıcan, salatalık)
 *   - Zemin ahşap palet üzerinde çizgili dev karpuz piramidi ve dilimlenmiş sulu karpuz
 *   - Asılı nostaljik çift kefeli pirinç pazar terazisi ve pirinç gram ağırlıkları seti
 *   - Tebeşirli ahşap A-şövale fiyat tabelası ve kraft kese kağıdı torbaları
 * - Animasyonlu Pazarcı Esnafı NPC — "Pazarcı Cemil Dayı" (X: -70.5, Z: -55.8):
 *   - Kadife kasket, pazarcı gömleği, cepli esnaf önlüğü, pos bıyık
 *   - Elinde taze narenciye, 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada iki koluyla coşkulu selamlama ve 3D konuşma balonu
 */
export function createMarketView(): MarketView {
  const group = new THREE.Group();
  group.name = "market-view";
  const obstacles: Rect[] = [];

  const cx = MARKET_CENTER.x; // -72.0
  const cz = MARKET_CENTER.z; // -58.5

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE KALDIRIM BORDÜRLERİ
  // =========================================================================
  const plazaGroup = new THREE.Group();
  plazaGroup.position.set(cx, 0, cz);
  group.add(plazaGroup);

  // Açık hava pazar yeri taş avlusu (12.6m x 9.0m)
  box(plazaGroup, [12.6, 0.12, 9.0], [0, 0.04, 0], "#ded6be");
  box(plazaGroup, [12.2, 0.05, 8.6], [0, 0.10, 0], "#c8bfa8");

  // Çevre granit bordür taşları
  box(plazaGroup, [12.8, 0.18, 0.22], [0, 0.09, -4.5], "#7f8c8d");
  box(plazaGroup, [12.8, 0.18, 0.22], [0, 0.09, 4.5], "#7f8c8d");
  box(plazaGroup, [0.22, 0.18, 9.2], [-6.35, 0.09, 0], "#7f8c8d");
  box(plazaGroup, [0.22, 0.18, 9.2], [6.35, 0.09, 0], "#7f8c8d");

  // Servis Yanaşma Peronu (MARKET_BAY: X: -72.0, Z: -52.5) - Z: -50 bulvarının kuzey bordüründe
  box(group, [5.2, 0.02, 3.0], [cx, 0.025, cz + 6.0], "#3a4750"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.0], [cx - 2.5, 0.03, cz + 6.0], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.0], [cx + 2.5, 0.03, cz + 6.0], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 4.5], "#fff4d4"); // Yol kenarı durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 4.5], isYellow ? "#f1c40f" : "#2c3e50");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına doğru yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 5.9], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 6.7);
  group.add(arrowHead);

  // =========================================================================
  // 2. ÜÇ BÖLÜMLÜ GELENEKSEL PAZAR TEZGAHLARI & ÇİZGİLİ ÇADIR TENTELERİ
  // =========================================================================
  // Üç tezgah bölmesi: Sol (Meyve/Narenciye), Orta (Ana Sebze), Sağ (Yeşillikler & Bostan)
  // Tezgahlar güneye (yola ve kameraya) bakar
  const stalls = [
    { x: -3.8, width: 3.8, col1: "#f1c40f", col2: "#ffffff", title: "NARENCİYE & MEYVE" },
    { x: 0.0, width: 4.2, col1: "#e74c3c", col2: "#ffffff", title: "TARLA SEBZELERİ" },
    { x: 3.8, width: 3.8, col1: "#27ae60", col2: "#ffffff", title: "BOSTAN YEŞİLLİĞİ" },
  ];

  const awningPivots: THREE.Group[] = [];

  for (const s of stalls) {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(cx + s.x, 0, cz - 0.5);
    group.add(stallGroup);

    // Dört köşe masif ahşap taşıyıcı direkler
    const hBack = 2.8;
    const hFront = 2.4;
    const halfW = s.width / 2 - 0.15;
    const halfD = 1.5;
    cylinder(stallGroup, 0.07, 0.07, hBack, [-halfW, hBack / 2, -halfD], "#8d6e63", 8);
    cylinder(stallGroup, 0.07, 0.07, hBack, [halfW, hBack / 2, -halfD], "#8d6e63", 8);
    cylinder(stallGroup, 0.07, 0.07, hFront, [-halfW, hFront / 2, halfD], "#8d6e63", 8);
    cylinder(stallGroup, 0.07, 0.07, hFront, [halfW, hFront / 2, halfD], "#8d6e63", 8);

    // Çapraz ahşap kirişler ve çatı makasları
    box(stallGroup, [s.width - 0.2, 0.08, 0.08], [0, hBack - 0.05, -halfD], "#6d4c41");
    box(stallGroup, [s.width - 0.2, 0.08, 0.08], [0, hFront - 0.05, halfD], "#6d4c41");
    box(stallGroup, [0.08, 0.08, halfD * 2], [-halfW, (hBack + hFront) / 2 - 0.05, 0], "#6d4c41");
    box(stallGroup, [0.08, 0.08, halfD * 2], [halfW, (hBack + hFront) / 2 - 0.05, 0], "#6d4c41");

    // Eğimli ahşap tezgah tablası (Güneye / kameraya doğru açılı sergi masası)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0.85, 0.2);
    tableGroup.rotation.x = 0.24; // Kameraya doğru eğimli açı
    stallGroup.add(tableGroup);

    // Masif çam tezgah tahtaları
    box(tableGroup, [s.width - 0.3, 0.08, 2.4], [0, 0, 0], "#d7ba89");
    box(tableGroup, [s.width - 0.3, 0.14, 0.06], [0, 0.08, 1.2], "#b38243"); // Ön düşme önleyici ahşap çıta

    // Canlı Çizgili Kumaş Çadır Tentesi (Striped Canvas Canopy)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, (hBack + hFront) / 2 + 0.15, 0);
    stallGroup.add(canopyGroup);
    awningPivots.push(canopyGroup);

    // Çatı eğimi (Arkadan öne / kuzeyden güneye iniş)
    const roofSlope = new THREE.Group();
    roofSlope.rotation.x = -0.14; // Kameraya doğru eğim (tentenin üstü görünür)
    canopyGroup.add(roofSlope);

    // 8 adet renkli kumaş şeridi (Çizgili desen)
    const stripeCount = 8;
    const stripeW = s.width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const sx = -s.width / 2 + stripeW / 2 + i * stripeW;
      const col = i % 2 === 0 ? s.col1 : s.col2;
      box(roofSlope, [stripeW + 0.01, 0.04, 3.4], [sx, 0, 0], col);

      // Ön dalgalı fırfırlı kumaş saçak (Scalloped Valance Fringe)
      const fringe = box(roofSlope, [stripeW - 0.02, 0.22, 0.03], [sx, -0.10, 1.7], col);
      fringe.rotation.z = (i % 2 === 0 ? 0.06 : -0.06);
    }
  }

  // =========================================================================
  // 3. AYDINLATMALI ÇATI TABELASI & KURUMSAL ESNAF YAZISI
  // =========================================================================
  // Orta çadır üzerinde güneye / kameraya bakan büyük aydınlatmalı tabela
  const signBoard = box(group, [7.2, 1.15, 0.18], [cx, 3.15, cz - 0.5], "#1e272e");
  signBoard.rotation.x = -0.14; // Kameraya bakan eğim

  // Altın sarısı pervaz çerçevesi
  box(group, [7.4, 0.08, 0.22], [cx, 3.72, cz - 0.6], "#f39c12");
  box(group, [7.4, 0.08, 0.22], [cx, 2.58, cz - 0.4], "#f39c12");

  // Işıklı Pazar Tabelası
  const marketSign = label("🍉 GÜNEŞ MAHALLESİ SEMT PAZARI · CEMİL DAYI 🍋", "#ffffff", "#1e272e");
  marketSign.scale.set(6.8, 0.85, 1);
  marketSign.rotation.x = -0.14;
  marketSign.position.set(cx, 3.22, cz - 0.38);
  group.add(marketSign);

  // Alt Kurumsal Slogan Şeridi
  const subtitleSign = label("GÜNLÜK TAZE MEYVE & SEBZE · ÇİFTLİKTEN SOFRAYA · 1954", "#f1c40f", "#2c3e50");
  subtitleSign.scale.set(5.8, 0.35, 1);
  subtitleSign.rotation.x = -0.14;
  subtitleSign.position.set(cx, 2.72, cz - 0.28);
  group.add(subtitleSign);

  // Gece Pazar Tezgahlarını Aydınlatan Sıcak Sarı PointLight
  const marketLight = new THREE.PointLight("#ffeaa7", 2.4, 18);
  marketLight.position.set(cx, 2.8, cz + 0.5);
  group.add(marketLight);

  // =========================================================================
  // 4. KADEMELİ AHŞAP KASALAR & ZENGİN AKDENİZ MEYVE/SEBZE YIĞINLARI
  // =========================================================================
  // A. Sol Tezgah: Narenciye & Meyveler (Limon, Portakal, Kırmızı Elma)
  const fruitProduce = [
    // Ön sıra (güneyde / kameraya en yakın): Sarı limon kasası
    { x: cx - 4.6, z: cz + 0.6, col: "#f1c40f", count: 8, radius: 0.12 },
    // Orta sıra: Turuncu portakal kasası
    { x: cx - 3.4, z: cz + 0.6, col: "#e67e22", count: 8, radius: 0.14 },
    // Arka sıra: Kırmızı elma kasası
    { x: cx - 4.0, z: cz - 0.4, col: "#e74c3c", count: 8, radius: 0.13 },
  ];

  for (const fp of fruitProduce) {
    box(group, [1.0, 0.22, 0.75], [fp.x, 0.96, fp.z], "#b38243");
    box(group, [0.92, 0.18, 0.68], [fp.x, 0.98, fp.z], "#8d6e63");
    for (let i = 0; i < fp.count; i++) {
      const ox = ((i % 4) - 1.5) * 0.22;
      const oz = (Math.floor(i / 4) - 0.5) * 0.24;
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(fp.radius, 7, 6), mat(fp.col));
      fruit.position.set(fp.x + ox, 1.10, fp.z + oz);
      group.add(fruit);
    }
  }

  // B. Orta Tezgah: Sebzeler (Kıpkırmızı Tarla Domatesleri, Mor Patlıcanlar, Çengelköy Salatalıkları)
  const vegProduce = [
    // Ön sol: Domates kasası (Piramit küreler + yeşil taç sap)
    { x: cx - 0.7, z: cz + 0.6, col: "#c0392b", count: 8, radius: 0.13 },
    // Ön sağ: Salatalık kasası (Yeşil silindirler)
    { x: cx + 0.7, z: cz + 0.6, col: "#27ae60", count: 6, isCuke: true },
    // Arka: Parlak koyu mor patlıcanlar
    { x: cx, z: cz - 0.4, col: "#4a235a", count: 6, isEggplant: true },
  ];

  for (const vp of vegProduce) {
    box(group, [1.0, 0.22, 0.75], [vp.x, 0.96, vp.z], "#b38243");
    box(group, [0.92, 0.18, 0.68], [vp.x, 0.98, vp.z], "#8d6e63");

    if (vp.isCuke) {
      for (let i = 0; i < vp.count; i++) {
        const ox = ((i % 3) - 1.0) * 0.26;
        const oz = (Math.floor(i / 3) - 0.5) * 0.26;
        const cuke = cylinder(group, 0.05, 0.05, 0.32, [vp.x + ox, 1.10, vp.z + oz], "#27ae60", 6);
        cuke.rotation.z = Math.PI / 2 + 0.15 * i;
      }
    } else if (vp.isEggplant) {
      for (let i = 0; i < vp.count; i++) {
        const ox = ((i % 3) - 1.0) * 0.28;
        const oz = (Math.floor(i / 3) - 0.5) * 0.26;
        const ep = cylinder(group, 0.08, 0.06, 0.36, [vp.x + ox, 1.10, vp.z + oz], "#4a235a", 8);
        ep.rotation.x = Math.PI / 2;
        cylinder(group, 0.02, 0.04, 0.08, [vp.x + ox, 1.10, vp.z + oz - 0.19], "#2ecc71", 6);
      }
    } else {
      for (let i = 0; i < vp.count; i++) {
        const ox = ((i % 4) - 1.5) * 0.22;
        const oz = (Math.floor(i / 4) - 0.5) * 0.24;
        const tomato = new THREE.Mesh(new THREE.SphereGeometry(vp.radius, 7, 6), mat(vp.col));
        tomato.position.set(vp.x + ox, 1.10, vp.z + oz);
        group.add(tomato);
        cylinder(group, 0.015, 0.03, 0.04, [vp.x + ox, 1.22, vp.z + oz], "#2ecc71", 5);
      }
    }
  }

  // C. Sağ Tezgah: Yeşillikler & Bostan (Taze Maydanoz, Roka, Sarı Biberler)
  const greensProduce = [
    { x: cx + 3.4, z: cz + 0.6, col: "#2ecc71" },
    { x: cx + 4.6, z: cz + 0.6, col: "#f39c12" },
    { x: cx + 4.0, z: cz - 0.4, col: "#1e824c" },
  ];

  for (const gp of greensProduce) {
    box(group, [1.0, 0.22, 0.75], [gp.x, 0.96, gp.z], "#b38243");
    box(group, [0.92, 0.18, 0.68], [gp.x, 0.98, gp.z], "#8d6e63");
    for (let i = 0; i < 6; i++) {
      const ox = ((i % 3) - 1.0) * 0.26;
      const oz = (Math.floor(i / 3) - 0.5) * 0.26;
      const bunch = box(group, [0.24, 0.16, 0.22], [gp.x + ox, 1.10, gp.z + oz], gp.col);
      bunch.rotation.y = i * 0.4;
    }
  }

  // =========================================================================
  // 5. ZEMİN DEV KARPUZ VE BAL KAVUNU PİRAMİDİ (Watermelon & Melon Pallet)
  // =========================================================================
  // Tezgah önünde (X: -74.8, Z: -56.5) ahşap EUR palet üzerinde karpuz yığını
  const melonPalletX = cx - 2.8;
  const melonPalletZ = cz + 2.0;

  box(group, [1.8, 0.14, 1.4], [melonPalletX, 0.07, melonPalletZ], "#b38243");
  box(group, [1.7, 0.06, 1.3], [melonPalletX, 0.17, melonPalletZ], "#d7ba89");

  const watermelonOffsets = [
    { x: -0.45, z: -0.3, s: 0.30 },
    { x: 0.15, z: -0.3, s: 0.32 },
    { x: -0.45, z: 0.3, s: 0.29 },
    { x: 0.15, z: 0.3, s: 0.31 },
    { x: -0.15, z: 0.0, s: 0.33 },
  ];

  for (const wm of watermelonOffsets) {
    const wmMesh = new THREE.Mesh(
      new THREE.SphereGeometry(wm.s, 9, 8),
      mat("#196f3d"),
    );
    wmMesh.scale.set(1.0, 0.88, 1.25);
    wmMesh.position.set(melonPalletX + wm.x, 0.2 + wm.s * 0.88, melonPalletZ + wm.z);
    wmMesh.rotation.y = wm.x * 2.0;
    group.add(wmMesh);

    for (let a = 0; a < 4; a++) {
      const stripe = cylinder(
        group,
        wm.s * 1.01,
        wm.s * 1.01,
        0.05,
        [melonPalletX + wm.x, 0.2 + wm.s * 0.88, melonPalletZ + wm.z],
        "#0e4b25",
        8,
      );
      stripe.rotation.x = Math.PI / 2;
      stripe.rotation.z = (a * Math.PI) / 4;
    }
  }

  // Kesilmiş sulu dilim karpuz (Sliced watermelon wedge)
  const wedgeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.08, 6, 1, false, 0, Math.PI / 3),
    mat("#c0392b"),
  );
  wedgeMesh.rotation.x = Math.PI / 2;
  wedgeMesh.position.set(melonPalletX + 0.65, 0.26, melonPalletZ);
  group.add(wedgeMesh);

  // Yanında altın sarısı bal kavunları
  for (const mx of [0.55, 0.62]) {
    const melon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 7), mat("#f39c12"));
    melon.position.set(melonPalletX + mx, 0.38, melonPalletZ + (mx === 0.55 ? -0.4 : 0.4));
    group.add(melon);
  }

  // =========================================================================
  // 6. NOSTALJİK ASILI MEKANİK TERAZİ & PİRİNÇ AĞIRLIKLAR (Balance Scale)
  // =========================================================================
  const scaleGroup = new THREE.Group();
  scaleGroup.position.set(cx - 0.2, 1.95, cz + 0.4);
  group.add(scaleGroup);

  cylinder(scaleGroup, 0.025, 0.025, 0.4, [0, 0.2, 0], "#2c3e50", 6);
  box(scaleGroup, [0.5, 0.03, 0.03], [0, 0.02, 0], "#1a252f");

  const leftPanGroup = new THREE.Group();
  leftPanGroup.position.set(-0.22, 0, 0);
  scaleGroup.add(leftPanGroup);

  const rightPanGroup = new THREE.Group();
  rightPanGroup.position.set(0.22, 0, 0);
  scaleGroup.add(rightPanGroup);

  cylinder(leftPanGroup, 0.008, 0.008, 0.35, [0, -0.18, 0], "#f1c40f", 4);
  cylinder(rightPanGroup, 0.008, 0.008, 0.35, [0, -0.18, 0], "#f1c40f", 4);

  cylinder(leftPanGroup, 0.16, 0.14, 0.03, [0, -0.36, 0], "#f39c12", 10);
  cylinder(rightPanGroup, 0.16, 0.14, 0.03, [0, -0.36, 0], "#f39c12", 10);

  const weighedTomato = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mat("#e74c3c"));
  weighedTomato.position.set(0, -0.30, 0);
  leftPanGroup.add(weighedTomato);

  cylinder(rightPanGroup, 0.035, 0.04, 0.08, [0, -0.31, 0], "#f1c40f", 8);

  // Tezgah üstünde döküm pirinç ağırlık kulesi seti (100g, 250g, 500g, 1kg)
  const weightSetGroup = new THREE.Group();
  weightSetGroup.position.set(cx + 0.6, 1.05, cz + 0.4);
  group.add(weightSetGroup);

  box(weightSetGroup, [0.38, 0.04, 0.14], [0, 0.02, 0], "#8d6e63");
  const weights = [
    { x: -0.12, r: 0.025, h: 0.06 },
    { x: -0.04, r: 0.032, h: 0.08 },
    { x: 0.05, r: 0.040, h: 0.10 },
    { x: 0.13, r: 0.048, h: 0.12 },
  ];
  for (const w of weights) {
    cylinder(weightSetGroup, w.r, w.r, w.h, [w.x, 0.04 + w.h / 2, 0], "#f1c40f", 8);
    cylinder(weightSetGroup, w.r * 0.4, w.r * 0.4, 0.02, [w.x, 0.04 + w.h + 0.01, 0], "#f39c12", 6);
  }

  // =========================================================================
  // 7. TEBEŞİRLİ FİYAT ŞÖVALESİ & KRAFT KESE KAĞIDI DONATILARI
  // =========================================================================
  const easelX = cx + 2.4;
  const easelZ = cz + 2.0;

  const easelGroup = new THREE.Group();
  easelGroup.position.set(easelX, 0, easelZ);
  easelGroup.rotation.y = -0.25;
  group.add(easelGroup);

  box(easelGroup, [0.06, 1.25, 0.06], [-0.4, 0.62, -0.18], "#8d6e63");
  box(easelGroup, [0.06, 1.25, 0.06], [0.4, 0.62, -0.18], "#8d6e63");
  box(easelGroup, [0.06, 1.15, 0.06], [0, 0.58, -0.42], "#6d4c41");

  box(easelGroup, [0.86, 0.95, 0.04], [0, 0.72, -0.14], "#1a1a1a");
  box(easelGroup, [0.92, 0.05, 0.08], [0, 0.26, -0.14], "#b38243");

  const priceSign = label("🍅 DOMATES: 15₺\n🍋 LİMON: 20₺\n🍉 KARPUZ: 10₺\n🥒 SALATALIK: 12₺", "#ffffff", "#1a1a1a");
  priceSign.scale.set(0.78, 0.85, 1);
  priceSign.position.set(0, 0.72, -0.11);
  easelGroup.add(priceSign);

  box(group, [0.35, 0.45, 0.08], [cx + 1.8, 1.25, cz + 0.2], "#c8a165");
  cylinder(group, 0.18, 0.14, 0.28, [cx + 2.2, 0.25, cz + 1.2], "#935116", 8);

  // =========================================================================
  // 8. ANİMASYONLU PAZARCI ESNAFI NPC — "PAZARCI CEMIL DAYI"
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(CEMIL_DAYI_POS.x, 0, CEMIL_DAYI_POS.z);
  group.add(npcGroup);

  box(npcGroup, [0.18, 0.12, 0.32], [-0.16, 0.06, 0.04], "#2c3e50");
  box(npcGroup, [0.18, 0.12, 0.32], [0.16, 0.06, 0.04], "#2c3e50");

  cylinder(npcGroup, 0.11, 0.11, 0.72, [-0.16, 0.46, 0], "#4a3525", 8);
  cylinder(npcGroup, 0.11, 0.11, 0.72, [0.16, 0.46, 0], "#4a3525", 8);

  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.82, 0);
  npcGroup.add(torsoGroup);

  box(torsoGroup, [0.58, 0.65, 0.36], [0, 0.32, 0], "#3498db");
  box(torsoGroup, [0.60, 0.62, 0.38], [0, 0.32, 0], "#5d4037");
  box(torsoGroup, [0.46, 0.68, 0.06], [0, 0.24, 0.19], "#fdfefe");
  box(torsoGroup, [0.26, 0.18, 0.03], [0, 0.18, 0.23], "#d5dbdb");

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  torsoGroup.add(headGroup);

  cylinder(headGroup, 0.09, 0.09, 0.12, [0, 0.06, 0], "#e0ac69", 8);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 9, 8), mat("#e0ac69"));
  headMesh.position.set(0, 0.22, 0);
  headGroup.add(headMesh);

  const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.10, 8), mat("#3e2723"));
  capMesh.position.set(0, 0.34, 0.02);
  capMesh.rotation.x = 0.15;
  headGroup.add(capMesh);

  const visorMesh = box(headGroup, [0.28, 0.03, 0.15], [0, 0.30, 0.20], "#271610");
  visorMesh.rotation.x = 0.22;

  const mustache = box(headGroup, [0.24, 0.07, 0.08], [0, 0.18, 0.19], "#2c3e50");
  mustache.rotation.z = -0.05;

  box(headGroup, [0.04, 0.04, 0.02], [-0.07, 0.24, 0.19], "#1a1a1a");
  box(headGroup, [0.04, 0.04, 0.02], [0.07, 0.24, 0.19], "#1a1a1a");

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(-0.35, 0.58, 0);
  torsoGroup.add(rightArmPivot);
  cylinder(rightArmPivot, 0.08, 0.07, 0.56, [0, -0.26, 0], "#3498db", 6);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mat("#e0ac69"));
  rightHand.position.set(0, -0.56, 0);
  rightArmPivot.add(rightHand);
  const heldLemon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 6), mat("#f1c40f"));
  heldLemon.position.set(0, -0.63, 0.04);
  rightArmPivot.add(heldLemon);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(0.35, 0.58, 0);
  torsoGroup.add(leftArmPivot);
  cylinder(leftArmPivot, 0.08, 0.07, 0.56, [0, -0.26, 0], "#3498db", 6);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mat("#e0ac69"));
  leftHand.position.set(0, -0.56, 0);
  leftArmPivot.add(leftHand);

  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.35, 0);
  bubbleGroup.visible = false;
  npcGroup.add(bubbleGroup);
  let currentBubbleText = "";

  // =========================================================================
  // 9. ÇARPIŞMA ENGELLERİ (Obstacles)
  // =========================================================================
  obstacles.push({
    minX: cx - 6.2,
    maxX: cx + 6.2,
    minZ: cz - 2.2,
    maxZ: cz + 1.2,
  });

  obstacles.push({
    minX: melonPalletX - 1.0,
    maxX: melonPalletX + 1.0,
    minZ: melonPalletZ - 0.8,
    maxZ: melonPalletZ + 0.8,
  });

  obstacles.push({
    minX: easelX - 0.5,
    maxX: easelX + 0.5,
    minZ: easelZ - 0.5,
    maxZ: easelZ + 0.5,
  });

  let totalTime = 0;

  return {
    group,
    obstacles,

    update(
      dt: number,
      stateOrNight?: MarketState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      totalTime += dt;
      let state: MarketState | undefined;
      let night = false;

      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
        night = isNightOrDusk ?? false;
      }

      marketLight.intensity = night ? 2.6 : 0.65;

      const swingAngle = Math.sin(totalTime * 2.5) * 0.08;
      leftPanGroup.position.y = swingAngle * 0.4;
      rightPanGroup.position.y = -swingAngle * 0.4;

      for (let i = 0; i < awningPivots.length; i++) {
        awningPivots[i].rotation.z = Math.sin(totalTime * 2.2 + i * 1.2) * 0.015;
      }

      if (playerPos) {
        const dx = playerPos.x - CEMIL_DAYI_POS.x;
        const dz = playerPos.z - CEMIL_DAYI_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          const clamped = THREE.MathUtils.clamp(targetAngle, -Math.PI / 2.2, Math.PI / 2.2);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, clamped, dt * 5.0);
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, clamped * 0.35, dt * 3.5);
        } else {
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.5);
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, 0, dt * 2.5);
        }
      }

      const isGreeting = state ? state.honkGreetingTimer > 0 : false;
      if (isGreeting) {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          -Math.PI / 2.5 + Math.sin(totalTime * 9.0) * 0.25,
          dt * 8.0,
        );
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(
          rightArmPivot.rotation.z,
          0.35 + Math.cos(totalTime * 8.0) * 0.2,
          dt * 8.0,
        );
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(
          leftArmPivot.rotation.x,
          -Math.PI / 2.5 - Math.sin(totalTime * 9.0) * 0.25,
          dt * 8.0,
        );
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(
          leftArmPivot.rotation.z,
          -0.35 - Math.cos(totalTime * 8.0) * 0.2,
          dt * 8.0,
        );
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 4.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 4.0);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -0.3, dt * 4.0);
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.1, dt * 4.0);
      }

      const callout = state?.lastHonkCallout;
      if (callout && state && state.honkGreetingTimer > 0) {
        bubbleGroup.visible = true;
        if (currentBubbleText !== callout) {
          currentBubbleText = callout;
          while (bubbleGroup.children.length > 0) {
            const c = bubbleGroup.children[0] as THREE.Mesh;
            bubbleGroup.remove(c);
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
              if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
              else c.material.dispose();
            }
          }
          const newLabel = label(callout, "#ffffff", "#1b5e20");
          newLabel.scale.set(5.5, 0.70, 1);
          newLabel.rotation.x = -0.15;
          bubbleGroup.add(newLabel);
        }
      } else {
        bubbleGroup.visible = false;
        currentBubbleText = "";
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - CEMIL_DAYI_POS.x,
        playerPos.z - CEMIL_DAYI_POS.z,
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
      marketLight.dispose();
    },
  };
}
