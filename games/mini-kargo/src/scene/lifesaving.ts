import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type LifesavingState,
  LIFESAVING_CENTER,
  LIFESAVING_BAY,
  SUKRU_KAPTAN_POS,
  SUKRU_KAPTAN_CALLOUTS,
} from "../game/lifesaving";

export type LifesavingView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: LifesavingState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sahil "Tarihi Kıyı Tahlisiye & Deniz Kurtarma İstasyonu (Can Kurtarma Botu & Kıyı Gözetleme Kulesi)" (T61)
 * - Otantik Türk Kıyı Emniyeti & Can Kurtarma (Tahlisiye) İstasyonu Mimarisi:
 *   - Yıpranmış ahşap sedir rıhtım güvertesi ve kesme granit mendirek kaidesi (13.0m x 11.0m)
 *   - Servis yanaşma peronu (LIFESAVING_BAY: X: -68.0, Z: 80.5 - Sahil Kordon Yolu Z: 80 güney bordüründe)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve beyaz yön oku
 *   - Kesme granit taş kaideli, yatay ahşap lambri kaplamalı çift kanatlı bot hangarı / kayıkhane (8.4m x 5.2m x 5.0m)
 *   - Işıklı büyük kurumsal çatı tabelası ("🛟 TARİHİ KIYI TAHLİSİYE & DENİZ KURTARMA İSTASYONU · KIYI EMNİYETİ ⚓")
 *   - Alt şerit ("T.C. KIYI EMNİYETİ GENEL MÜDÜRLÜĞÜ · CAN KURTARMA & TAHLİSİYE FİLOSU · 1928")
 *   - Gece yanan PointLight armatürü ve asılı pirinç denizci kafesli fener
 * - Eğimli Bot Kızağı & Çelik Ray Sistemi (Angled Slipway Ramp & Rails):
 *   - 14° açıyla doğrudan turkuaz denize inen 9.5m ahşap ve beton kızak rampası
 *   - Çift çelik ray ve tekerlekli çelik bot taşıyıcı beşik (rail slipway carriage)
 *   - Döküm dişli vinç tamburu, dönen krank kolu ve gergin çelik çekme halatı
 * - Tarihi Çift Başlı Can Kurtarma Botu — "TAHLİSİYE-1" (X: -68.0, Z: 91.5):
 *   - 6.4m uzunluğunda çift başlı tahlisiye can kurtarma botu gövdesi
 *   - Turuncu-beyaz Kıyı Emniyeti gövde boyası ("⚓ TAHLİSİYE-1 · CAN KURTARMA 🛟"), lacivert omurga
 *   - Ahşap oturaklar, yedek kürekler, palamar halatları ve pruva projektörü
 *   - Dalga/kızak salınım animasyonu
 * - Yükseltilmiş Ahşap Kıyı Gözetleme Kulesi (Lookout Watchtower - X: -63.5, Z: 87.0):
 *   - 4 masif ahşap ayak üzerinde 4.4m yükseklikte kapalı seyir güvertesi ve balüstradı
 *   - Kırmızı piramidal çatı, pirinç rüzgar gülü, denizci gözetleme dürbünü ve arama projektörü
 *   - Salınan pirinç Sis Çanı (Maritime Fog Bell)
 * - Donatılar:
 *   - 4 adet turuncu-beyaz can simidi, katranlı urgan makaraları, paslı döküm çapa, ilk yardım sandığı
 * - Animasyonlu Baş Tahlisiyeci NPC — "Tahlisiye Reisi Şükrü Kaptan" (X: -65.5, Z: 85.5):
 *   - Turuncu-lacivert Kıyı Emniyeti marin montu, kaptan kasketi, beyaz denizci sakalı ve pirinç megafon
 *   - 22m mesafeden kafa/gövde takibi (head tracking)
 *   - Korna ve duraklamada megafonunu havaya kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createLifesavingView(): LifesavingView {
  const group = new THREE.Group();
  group.name = "lifesaving-view";
  const obstacles: Rect[] = [];

  const cx = LIFESAVING_CENTER.x; // -68.0
  const cz = LIFESAVING_CENTER.z; // 89.0

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE RIHTIM GÜVERTESİ
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Ahşap rıhtım iskelesi ve kesme taş avlu tablası (13.0m x 11.0m)
  box(yardGroup, [13.0, 0.14, 11.0], [0, 0.05, 0], "#718093"); // Granit/beton mendirek kaidesi
  box(yardGroup, [12.4, 0.06, 10.4], [0, 0.12, 0], "#8c7b6c"); // Sedir ahşap güverte tablası

  // Ahşap güverte derz çıtaları
  for (let pz = -5.0; pz <= 5.0; pz += 1.25) {
    box(yardGroup, [12.4, 0.015, 0.06], [0, 0.155, pz], "#5d4037");
  }

  // Deniz tarafı su altı dolfen kazıkları (timber piles - Z: 94.5 güney ucu)
  for (let px = -5.8; px <= 5.8; px += 2.9) {
    cylinder(group, 0.22, 0.22, 1.8, [cx + px, -0.4, cz + 5.4], "#4a3525", 8);
  }

  // Döküm çelik palamar babaları (mooring bollards) ve kalın halat kangalları
  for (const bx of [-5.6, 5.6]) {
    cylinder(group, 0.18, 0.22, 0.55, [cx + bx, 0.35, cz + 4.8], "#2c3e50", 12);
    cylinder(group, 0.28, 0.12, 0.15, [cx + bx, 0.62, cz + 4.8], "#2c3e50", 12);
    // Halat kangalı
    const ropeTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.08, 6, 16),
      mat("#b89758"),
    );
    ropeTorus.rotation.x = Math.PI / 2;
    ropeTorus.position.set(cx + bx, 0.16, cz + 4.8);
    group.add(ropeTorus);
  }

  // Servis Yanaşma Peronu (LIFESAVING_BAY: X: -68.0, Z: 80.5) - Sahil Kordon Yolu Z: 80 güney bordüründe
  box(group, [5.4, 0.02, 3.2], [cx, 0.025, cz - 8.5], "#26292d"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.6, 0.03, cz - 8.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.6, 0.03, cz - 8.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.4, 0.025, 0.15], [cx, 0.03, cz - 6.9], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.5; bx <= 2.5; bx += 0.83) {
    const isYellow = Math.round((bx + 2.5) / 0.83) % 2 === 0;
    box(group, [0.78, 0.16, 0.22], [cx + bx, 0.08, cz - 6.8], isYellow ? "#f1c40f" : "#212529");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz - 8.6], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz - 7.8);
  group.add(arrowHead);

  // =========================================================================
  // 2. TARİHİ TAHLİSİYE İSTASYONU KAYIKHANE BİNASI (8.4m x 5.2m x 5.0m)
  // =========================================================================
  const boathouseGroup = new THREE.Group();
  boathouseGroup.position.set(cx - 1.2, 0, cz - 1.2);
  group.add(boathouseGroup);

  // Alt kat rustik granit/kireçtaşı taş kaide duvarları (1.8m yüksekliğinde)
  box(boathouseGroup, [8.4, 1.8, 5.2], [0, 0.9, 0], "#636e72");
  box(boathouseGroup, [8.5, 0.22, 5.3], [0, 0.12, 0], "#2d3436"); // Taban süpürgeliği
  box(boathouseGroup, [8.6, 0.15, 5.4], [0, 1.8, 0], "#b2bec3"); // Kat silmesi frizi

  // Üst kat yıpranmış yatay ahşap lambri duvarları (2.2m yüksekliğinde)
  box(boathouseGroup, [8.2, 2.2, 5.0], [0, 2.9, 0], "#5c4033");
  // Yatay ahşap lambri çizgileri
  for (let ly = 2.0; ly <= 3.8; ly += 0.35) {
    box(boathouseGroup, [8.25, 0.04, 5.05], [0, ly, 0], "#3e2723");
  }

  // Ahşap köşe dikmeleri ve pervazlar (Lacivert denizci rengi)
  for (const cx1 of [-4.1, 4.1]) {
    for (const cz1 of [-2.5, 2.5]) {
      box(boathouseGroup, [0.35, 4.0, 0.35], [cx1, 2.0, cz1], "#1e3799");
    }
  }

  // Eğimli galvaniz/kiremit kırma çatı (Geniş saçaklı)
  const roof = box(boathouseGroup, [9.0, 0.25, 5.8], [0, 4.2, 0], "#a8432a");
  roof.rotation.x = 0.08;
  box(boathouseGroup, [8.8, 0.45, 0.4], [0, 4.45, 0], "#c0392b"); // Çatı mahyası

  // Çatı Duman / Havalandırma Fenerliği (Cupola / Vent ridge)
  box(boathouseGroup, [2.4, 0.7, 1.4], [0, 4.8, 0], "#5c4033");
  box(boathouseGroup, [2.7, 0.18, 1.7], [0, 5.2, 0], "#c0392b");
  cylinder(boathouseGroup, 0.06, 0.06, 0.9, [0, 5.7, 0], "#f1c40f", 8); // Pirinç paratoner

  // Geniş Çift Kanatlı Bot Hangarı Kapısı (Güney cephesinde raylı kapı açıklığı)
  box(boathouseGroup, [4.2, 3.4, 0.2], [0.6, 1.8, 2.55], "#1e272e"); // Kapı açıklığı yuvası
  // Sürgülü ahşap kapı kanatları
  box(boathouseGroup, [1.9, 3.2, 0.12], [-0.5, 1.8, 2.62], "#3e2723");
  box(boathouseGroup, [1.9, 3.2, 0.12], [1.7, 1.8, 2.62], "#3e2723");
  // Kapı Z-çapraz takviye çıtaları
  box(boathouseGroup, [1.8, 0.12, 0.15], [-0.5, 1.8, 2.65], "#1e3799");
  box(boathouseGroup, [1.8, 0.12, 0.15], [1.7, 1.8, 2.65], "#1e3799");
  // Üst çelik ray ve askı makaraları
  box(boathouseGroup, [4.4, 0.15, 0.15], [0.6, 3.55, 2.65], "#718093");

  // Kuzey/Yol Cephesi Denizci Pencereleri (Kordon yoluna bakan pirinç pervazlı camlar)
  for (const wx of [-2.4, 2.4]) {
    box(boathouseGroup, [1.4, 1.2, 0.2], [wx, 2.8, -2.55], "#1e3799"); // Pencere kasası
    box(boathouseGroup, [1.1, 0.9, 0.1], [wx, 2.8, -2.55], "#81ecec"); // Cam
    box(boathouseGroup, [1.1, 0.06, 0.12], [wx, 2.8, -2.54], "#ffffff"); // Yatay kayıt
    box(boathouseGroup, [0.06, 0.9, 0.12], [wx, 2.8, -2.54], "#ffffff"); // Dikey kayıt
  }

  // =========================================================================
  // 3. IŞIKLI BÜYÜK KURUMSAL ÇATI TABELASI & GECE AYDINLATMASI
  // =========================================================================
  const marqueeGroup = new THREE.Group();
  marqueeGroup.position.set(0, 4.35, -2.75);
  marqueeGroup.rotation.x = -0.15; // Yola doğru 9° öne eğimli
  boathouseGroup.add(marqueeGroup);

  // Arka kaset panel (Lacivert & Altın pervaz)
  box(marqueeGroup, [7.8, 1.35, 0.18], [0, 0, 0], "#102a45");
  box(marqueeGroup, [7.95, 1.48, 0.1], [0, 0, -0.05], "#f39c12"); // Altın dış çerçeve

  // Ana Tabela Yazısı
  const signCanvas = label("🛟 TARİHİ KIYI TAHLİSİYE & CAN KURTARMA ⚓");
  signCanvas.scale.set(1.4, 0.45, 1);
  signCanvas.position.set(0, 0.22, 0.11);
  marqueeGroup.add(signCanvas);

  // Alt Kurumsal Şerit
  const subSignCanvas = label("T.C. KIYI EMNİYETİ GENEL MÜDÜRLÜĞÜ · 1928");
  subSignCanvas.scale.set(1.1, 0.22, 1);
  subSignCanvas.position.set(0, -0.28, 0.11);
  marqueeGroup.add(subSignCanvas);

  // Gece/Gündüz Tabela Aydınlatma Armatürü (PointLight)
  const signLight = new THREE.PointLight("#ffdd88", 2.0, 16.0);
  signLight.position.set(0, 4.8, -3.2);
  boathouseGroup.add(signLight);

  // Asılı Ferforje Denizci Kafesli Fener
  const lanternArm = box(boathouseGroup, [0.08, 0.08, 0.75], [0, 3.8, -2.85], "#2c3e50");
  cylinder(boathouseGroup, 0.12, 0.16, 0.35, [0, 3.55, -3.2], "#f39c12", 8);
  const lanternLight = new THREE.PointLight("#ffaa33", 1.8, 12.0);
  lanternLight.position.set(0, 3.5, -3.2);
  boathouseGroup.add(lanternLight);

  // =========================================================================
  // 4. EĞİMLİ BOT KIZAĞI & ÇELİK RAY SİSTEMİ (SLIPWAY RAMP & CARRIAGE)
  // =========================================================================
  const slipwayGroup = new THREE.Group();
  slipwayGroup.position.set(cx, 0, cz);
  group.add(slipwayGroup);

  // 14° açıyla doğrudan turkuaz denize inen 9.5m ahşap ve beton kızak rampası
  const rampGroup = new THREE.Group();
  rampGroup.position.set(0, 0.15, 1.2);
  rampGroup.rotation.x = 0.22; // ~12.6° eğim
  slipwayGroup.add(rampGroup);

  // Beton ve masif sedir rampası gövdesi (3.2m genişlik, 9.2m uzunluk)
  box(rampGroup, [3.2, 0.18, 9.2], [0, 0, 2.8], "#57606f");
  box(rampGroup, [3.0, 0.08, 9.0], [0, 0.12, 2.8], "#4b4b4b");

  // Çift döküm çelik tren rayı (Heavy steel slipway rails)
  for (const rx of [-0.95, 0.95]) {
    box(rampGroup, [0.12, 0.12, 9.2], [rx, 0.22, 2.8], "#747d8c");
  }

  // Ahşap traversler
  for (let tz = -1.2; tz <= 6.8; tz += 0.8) {
    box(rampGroup, [2.6, 0.06, 0.22], [0, 0.16, tz], "#2f3542");
  }

  // Tekerlekli Çelik Bot Kızağı / Taşıyıcı Beşik (Rail Slipway Carriage)
  const carriageGroup = new THREE.Group();
  carriageGroup.position.set(0, 0.35, 2.6);
  rampGroup.add(carriageGroup);

  box(carriageGroup, [2.5, 0.18, 5.4], [0, 0, 0], "#2f3640"); // Çelik şasi
  // 4 çift döküm flanşlı çelik tekerlek
  for (const wx of [-0.95, 0.95]) {
    for (const wz of [-1.8, 1.8]) {
      cylinder(carriageGroup, 0.16, 0.16, 0.14, [wx, -0.08, wz], "#718093", 12);
    }
  }
  // V-şekilli ahşap omurga destek takozları (keel blocks)
  box(carriageGroup, [2.4, 0.25, 0.3], [0, 0.2, -1.5], "#d35400");
  box(carriageGroup, [2.4, 0.25, 0.3], [0, 0.2, 1.5], "#d35400");

  // Ağır Döküm Dişli Vinç Tamburu (Slipway Winch Drum - Hangara yakın)
  const winchGroup = new THREE.Group();
  winchGroup.position.set(cx, 0.35, cz - 1.8);
  group.add(winchGroup);

  box(winchGroup, [1.4, 0.65, 0.9], [0, 0.32, 0], "#2c3e50"); // Vinç kaidesi
  const drum = cylinder(winchGroup, 0.26, 0.26, 0.75, [0, 0.55, 0], "#7f8c8d", 16);
  drum.rotation.z = Math.PI / 2;
  // Sarılı çelik kablo
  cylinder(winchGroup, 0.24, 0.24, 0.65, [0, 0.55, 0], "#bdc3c7", 16);
  drum.rotation.z = Math.PI / 2;

  // Vinç Krank Kolu (Dönen mekanik kol)
  const crankPivot = new THREE.Group();
  crankPivot.position.set(0.48, 0.55, 0);
  winchGroup.add(crankPivot);
  box(crankPivot, [0.06, 0.32, 0.06], [0, 0.15, 0], "#e74c3c");
  cylinder(crankPivot, 0.04, 0.04, 0.16, [0.08, 0.3, 0], "#f1c40f", 8);

  // Vinçten beşiğe uzanan gergin çelik çekme halatı
  cylinder(group, 0.025, 0.025, 3.4, [cx, 0.45, cz - 0.2], "#bdc3c7", 6);

  // =========================================================================
  // 5. TARİHİ ÇİFT BAŞLI CAN KURTARMA BOTU — "TAHLİSİYE-1" (X: -68.0, Z: 91.5)
  // =========================================================================
  const lifeboatGroup = new THREE.Group();
  lifeboatGroup.position.set(0, 0.55, 0);
  carriageGroup.add(lifeboatGroup);

  // Bot Omurga ve Gövde Tabanı (Lacivert omurga)
  box(lifeboatGroup, [1.6, 0.3, 5.8], [0, 0.15, 0], "#1e3799");

  // Çift Başlı Gövde (Double-ended lifeboat hull - Turuncu üst, beyaz su hattı)
  box(lifeboatGroup, [2.1, 0.45, 5.2], [0, 0.45, 0], "#f5f6fa"); // Beyaz su hattı
  box(lifeboatGroup, [2.2, 0.55, 5.4], [0, 0.85, 0], "#e67e22"); // Canlı Tahlisiye turuncusu üst borda

  // Sivri pruva ve pupa burunları (Double-ended bow and stern cones)
  const bowCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 1.4, 4),
    mat("#e67e22"),
  );
  bowCone.rotation.x = Math.PI / 2;
  bowCone.position.set(0, 0.75, 3.1);
  lifeboatGroup.add(bowCone);

  const sternCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 1.4, 4),
    mat("#e67e22"),
  );
  sternCone.rotation.x = -Math.PI / 2;
  sternCone.position.set(0, 0.75, -3.1);
  lifeboatGroup.add(sternCone);

  // İç Güverte Boşluğu ve Ahşap Oturaklar
  box(lifeboatGroup, [1.7, 0.4, 4.6], [0, 0.95, 0], "#d35400"); // İç havuz
  for (const bz of [-1.5, -0.5, 0.5, 1.5]) {
    box(lifeboatGroup, [1.75, 0.08, 0.35], [0, 1.05, bz], "#8c7b6c"); // Ahşap kürekçi oturakları
  }

  // Bot Bordasında Yazı: "⚓ TAHLİSİYE-1 · CAN KURTARMA 🛟"
  const boatSignLeft = label("⚓ TAHLİSİYE-1 · CAN KURTARMA 🛟");
  boatSignLeft.scale.set(1.1, 0.28, 1);
  boatSignLeft.position.set(-1.12, 0.9, 0);
  boatSignLeft.rotation.y = -Math.PI / 2;
  lifeboatGroup.add(boatSignLeft);

  const boatSignRight = label("⚓ TAHLİSİYE-1 · CAN KURTARMA 🛟");
  boatSignRight.scale.set(1.1, 0.28, 1);
  boatSignRight.position.set(1.12, 0.9, 0);
  boatSignRight.rotation.y = Math.PI / 2;
  lifeboatGroup.add(boatSignRight);

  // Bot Donatısı: 4 adet istiflenmiş ahşap kürek ve pruva projektörü
  for (let oy = 0; oy < 2; oy++) {
    cylinder(lifeboatGroup, 0.04, 0.04, 3.8, [-0.65, 1.15 + oy * 0.08, 0], "#d2b48c", 8);
    cylinder(lifeboatGroup, 0.04, 0.04, 3.8, [0.65, 1.15 + oy * 0.08, 0], "#d2b48c", 8);
  }
  // Pruva pirinç projektör lambası
  cylinder(lifeboatGroup, 0.14, 0.18, 0.28, [0, 1.35, 2.6], "#f1c40f", 12);
  cylinder(lifeboatGroup, 0.12, 0.12, 0.05, [0, 1.35, 2.76], "#ffffff", 12);

  // Bot çevresi beyaz güvenlik can halatı
  for (let rz = -2.2; rz <= 2.2; rz += 1.1) {
    cylinder(lifeboatGroup, 0.03, 0.03, 1.1, [-1.15, 1.05, rz], "#f5f6fa", 6);
    cylinder(lifeboatGroup, 0.03, 0.03, 1.1, [1.15, 1.05, rz], "#f5f6fa", 6);
  }

  // =========================================================================
  // 6. YÜKSELTİLMİŞ AHŞAP KIYI GÖZETLEME KULESİ (WATCHTOWER - X: -63.5, Z: 87.0)
  // =========================================================================
  const towerGroup = new THREE.Group();
  const tx = cx + 4.5; // -63.5
  const tz = cz - 2.0; // 87.0
  towerGroup.position.set(tx, 0, tz);
  group.add(towerGroup);

  // 4 Masif Ahşap Taşıyıcı Ayak (4.4m yüksekliğinde)
  for (const ax of [-1.1, 1.1]) {
    for (const az of [-1.1, 1.1]) {
      cylinder(towerGroup, 0.14, 0.14, 4.4, [ax, 2.2, az], "#4a3525", 8);
      box(towerGroup, [0.35, 0.2, 0.35], [ax, 0.1, az], "#2c3e50"); // Çelik taban pabucu
    }
  }

  // Çapraz X-kiriş gergileri
  for (const hy of [1.4, 2.8]) {
    box(towerGroup, [2.4, 0.12, 0.12], [0, hy, -1.1], "#5c4033");
    box(towerGroup, [2.4, 0.12, 0.12], [0, hy, 1.1], "#5c4033");
    box(towerGroup, [0.12, 0.12, 2.4], [-1.1, hy, 0], "#5c4033");
    box(towerGroup, [0.12, 0.12, 2.4], [1.1, hy, 0], "#5c4033");
  }

  // Ahşap Seyir Güvertesi Platformu (Y: 4.4m)
  box(towerGroup, [2.8, 0.16, 2.8], [0, 4.45, 0], "#8c7b6c");
  // Güvenlik Korkulukları (Balüstrad)
  for (const rx of [-1.3, 1.3]) {
    box(towerGroup, [0.08, 0.9, 2.7], [rx, 4.95, 0], "#1e3799");
  }
  for (const rz of [-1.3, 1.3]) {
    box(towerGroup, [2.7, 0.9, 0.08], [0, 4.95, rz], "#1e3799");
  }

  // Seyir Kulübesi Köşe Direkleri ve Piramidal Kırmızı Çatı
  for (const kx of [-1.2, 1.2]) {
    for (const kz of [-1.2, 1.2]) {
      cylinder(towerGroup, 0.08, 0.08, 1.8, [kx, 5.35, kz], "#ffffff", 8);
    }
  }
  // Piramit kiremit çatı
  const towerRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.1, 1.2, 4),
    mat("#c0392b"),
  );
  towerRoof.rotation.y = Math.PI / 4;
  towerRoof.position.set(0, 6.7, 0);
  towerGroup.add(towerRoof);

  // Çatı Tepesi Pirinç Rüzgar Gülü (Wind Vane)
  cylinder(towerGroup, 0.04, 0.04, 0.75, [0, 7.5, 0], "#f1c40f", 8);
  box(towerGroup, [0.65, 0.08, 0.04], [0, 7.7, 0], "#f39c12");

  // Seyir Platformu Denizci Dürbünü (Brass binoculars) ve Projektör
  cylinder(towerGroup, 0.06, 0.06, 0.95, [0, 4.95, 1.0], "#2c3e50", 8); // Sehpa
  box(towerGroup, [0.35, 0.15, 0.45], [0, 5.45, 1.0], "#f1c40f"); // Çift tüp dürbün

  // Salınan Pirinç Sis Çanı (Maritime Brass Fog Bell & Clapper)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(-1.3, 4.2, 0);
  towerGroup.add(bellGroup);

  box(bellGroup, [0.25, 0.06, 0.06], [0.1, 0, 0], "#2c3e50"); // Askı kolu
  const bellMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.32, 12),
    mat("#f1c40f"),
  );
  bellMesh.rotation.x = Math.PI;
  bellMesh.position.set(0, -0.16, 0);
  bellGroup.add(bellMesh);
  cylinder(bellGroup, 0.03, 0.03, 0.28, [0, -0.22, 0], "#e67e22", 6); // Tokmak

  // Kulenin altına tırmanma ahşap merdiveni
  for (let ly = 0.4; ly <= 4.2; ly += 0.4) {
    box(towerGroup, [0.6, 0.05, 0.05], [0, ly, -1.15], "#d2b48c");
  }

  // =========================================================================
  // 7. CAN KURTARMA DONATIM RAFLARI & TEÇHİZAT
  // =========================================================================
  const gearGroup = new THREE.Group();
  gearGroup.position.set(cx - 5.0, 0, cz + 2.0);
  group.add(gearGroup);

  // Ahşap Can Simidi Askılık Standı
  box(gearGroup, [0.15, 1.8, 3.4], [0, 0.9, 0], "#5c4033");
  box(gearGroup, [0.6, 0.1, 3.6], [0, 0.05, 0], "#2c3e50"); // Ayaklar

  // 4 Adet Turuncu-Beyaz Can Simidi (Lifebuoys)
  for (let i = 0; i < 4; i++) {
    const lz = -1.2 + i * 0.8;
    const lifebuoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.09, 8, 16),
      mat("#e67e22"),
    );
    lifebuoy.rotation.y = Math.PI / 2;
    lifebuoy.position.set(0.12, 1.1, lz);
    gearGroup.add(lifebuoy);

    // Beyaz reflektör şeritleri
    for (const ang of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
      const refStrip = box(gearGroup, [0.06, 0.08, 0.06], [0.12, 1.1 + Math.sin(ang) * 0.32, lz + Math.cos(ang) * 0.32], "#ffffff");
      refStrip.rotation.y = Math.PI / 2;
    }
  }

  // İlk Yardım & Teçhizat Sandığı ("🚑 İLK YARDIM · TAHLİSİYE")
  box(group, [1.2, 0.7, 0.8], [cx - 4.8, 0.35, cz - 2.8], "#c0392b");
  box(group, [1.25, 0.12, 0.85], [cx - 4.8, 0.72, cz - 2.8], "#e74c3c"); // Sandık kapağı
  const aidSign = label("🚑 İLK YARDIM · TAHLİSİYE");
  aidSign.scale.set(0.8, 0.22, 1);
  aidSign.position.set(cx - 4.8, 0.5, cz - 2.38);
  group.add(aidSign);

  // Tarihi Döküm Paslı Çapa (Rıhtıma yaslanmış)
  const anchorGroup = new THREE.Group();
  anchorGroup.position.set(cx + 4.8, 0.45, cz + 3.2);
  anchorGroup.rotation.z = 0.25;
  group.add(anchorGroup);
  cylinder(anchorGroup, 0.08, 0.08, 1.4, [0, 0, 0], "#2f3542", 8); // Şaft
  box(anchorGroup, [0.9, 0.08, 0.08], [0, 0.45, 0], "#2f3542"); // Çapraz kol
  const crownTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.08, 6, 12, Math.PI),
    mat("#2f3542"),
  );
  crownTorus.position.set(0, -0.65, 0);
  anchorGroup.add(crownTorus);

  // =========================================================================
  // 8. ANİMASYONLU BAŞ TAHLİSİYECİ NPC — "Tahlisiye Reisi Şükrü Kaptan"
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(SUKRU_KAPTAN_POS.x, 0, SUKRU_KAPTAN_POS.z);
  group.add(npcGroup);

  // Bacaklar ve Sarı Çizmeler
  cylinder(npcGroup, 0.12, 0.14, 0.45, [-0.18, 0.22, 0], "#f1c40f", 8); // Sol sarı çizme
  cylinder(npcGroup, 0.12, 0.14, 0.45, [0.18, 0.22, 0], "#f1c40f", 8); // Sağ sarı çizme
  cylinder(npcGroup, 0.11, 0.11, 0.5, [-0.18, 0.65, 0], "#1e272e", 8); // Sol lacivert pantolon
  cylinder(npcGroup, 0.11, 0.11, 0.5, [0.18, 0.65, 0], "#1e272e", 8); // Sağ lacivert pantolon

  // Gövde: Su Geçirmez Turuncu-Lacivert Kıyı Emniyeti Marin Montu
  const torso = box(npcGroup, [0.65, 0.75, 0.38], [0, 1.25, 0], "#e67e22");
  box(npcGroup, [0.67, 0.22, 0.4], [0, 1.0, 0], "#1e3799"); // Etek lacivert bant
  box(npcGroup, [0.67, 0.08, 0.41], [0, 1.35, 0], "#f1c40f"); // Reflektör şeridi

  // Sol Kol (Yanda duruş)
  const leftArm = cylinder(npcGroup, 0.09, 0.09, 0.6, [-0.42, 1.2, 0], "#e67e22", 8);
  cylinder(npcGroup, 0.08, 0.08, 0.15, [-0.42, 0.85, 0], "#ffdbac", 8); // Sol el

  // Sağ Kol & Megafon (Hareketli selamlama omzu)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.42, 1.45, 0);
  npcGroup.add(rightArmPivot);

  cylinder(rightArmPivot, 0.09, 0.09, 0.55, [0, -0.28, 0], "#e67e22", 8);
  cylinder(rightArmPivot, 0.08, 0.08, 0.15, [0, -0.58, 0], "#ffdbac", 8); // El

  // Pirinç Denizci Megafonu (Brass loudhailer / megaphone)
  const megaphone = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.42, 12),
    mat("#f1c40f"),
  );
  megaphone.rotation.x = Math.PI / 2;
  megaphone.position.set(0, -0.62, 0.22);
  rightArmPivot.add(megaphone);

  // Kafa, Kaptan Kasketi ve Beyaz Denizci Sakalı
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.68, 0);
  npcGroup.add(headPivot);

  cylinder(headPivot, 0.18, 0.18, 0.28, [0, 0.12, 0], "#ffdbac", 12); // Yüz

  // Gür Beyaz Denizci Sakalı & Pos Bıyık
  box(headPivot, [0.24, 0.18, 0.14], [0, 0.02, 0.14], "#ecf0f1");
  box(headPivot, [0.22, 0.08, 0.12], [0, 0.12, 0.16], "#ecf0f1");

  // Beyaz Kaptan Kasketi (Lacivert vizör & altın çapa broş)
  cylinder(headPivot, 0.22, 0.24, 0.18, [0, 0.28, 0], "#ffffff", 12); // Tepe
  box(headPivot, [0.32, 0.05, 0.18], [0, 0.22, 0.2], "#1e272e"); // Siperlik
  cylinder(headPivot, 0.05, 0.05, 0.04, [0, 0.28, 0.22], "#f1c40f", 8); // Altın çapa rozeti

  // 3D Konuşma Balonu Grubu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.45, 0);
  bubbleGroup.visible = false;
  npcGroup.add(bubbleGroup);

  const bubbleBg = box(bubbleGroup, [3.8, 0.75, 0.08], [0, 0, 0], "#ffffff");
  box(bubbleGroup, [3.9, 0.85, 0.05], [0, 0, -0.02], "#102a45"); // Kenarlık

  let speechBubbleSprite: THREE.Sprite = label(SUKRU_KAPTAN_CALLOUTS[0]);
  speechBubbleSprite.scale.set(1.4, 0.35, 1);
  speechBubbleSprite.position.set(0, 0, 0.05);
  bubbleGroup.add(speechBubbleSprite);

  function updateBubbleText(text: string) {
    bubbleGroup.remove(speechBubbleSprite);
    speechBubbleSprite.material.dispose();
    speechBubbleSprite = label(text);
    speechBubbleSprite.scale.set(1.4, 0.35, 1);
    speechBubbleSprite.position.set(0, 0, 0.05);
    bubbleGroup.add(speechBubbleSprite);
  }

  // =========================================================================
  // 9. ÇARPIŞMA ENGELLERİ (COLLISION OBSTACLES)
  // =========================================================================
  // Boathouse ana gövde engeli
  obstacles.push({
    minX: cx - 5.5,
    maxX: cx + 3.1,
    minZ: cz - 4.0,
    maxZ: cz + 1.6,
  });

  // Kıyı gözetleme kulesi ayakları engeli
  obstacles.push({
    minX: tx - 1.4,
    maxX: tx + 1.4,
    minZ: tz - 1.4,
    maxZ: tz + 1.4,
  });

  // Can simidi askılıkları ve donatım alanı engeli
  obstacles.push({
    minX: cx - 5.8,
    maxX: cx - 4.2,
    minZ: cz + 0.2,
    maxZ: cz + 3.8,
  });

  // NOT: Servis yanaşma peronu LIFESAVING_BAY: X: -68.0, Z: 80.5 tamamen açık ve serbesttir!

  // =========================================================================
  // 10. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let animTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: LifesavingState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      animTimer += dt;

      let state: LifesavingState | undefined;
      let nightMode = false;

      if (typeof stateOrNight === "object" && stateOrNight !== null) {
        state = stateOrNight;
        nightMode = !!isNightOrDusk;
      } else if (typeof stateOrNight === "boolean") {
        nightMode = stateOrNight;
      }

      // Gece / alacakaranlık aydınlatma kontrolü
      const lightIntensity = nightMode ? 2.4 : 1.2;
      signLight.intensity = lightIntensity;
      lanternLight.intensity = nightMode ? 2.2 : 0.8;

      // 1. Vinç krank kolu mekanik dönüşü
      const winchAngle = state ? state.winchCrankPhase : animTimer * 2.8;
      crankPivot.rotation.x = winchAngle;

      // 2. Denizci sis çanı salınımı
      const bellAngle = state ? Math.sin(state.bellSwingPhase) * 0.28 : Math.sin(animTimer * 3.2) * 0.28;
      bellGroup.rotation.z = bellAngle;

      // 3. Can kurtarma botunun hafif dalga / kızak salınımı
      const boatRoll = Math.sin(animTimer * 1.4) * 0.025;
      const boatPitch = Math.cos(animTimer * 1.8) * 0.018;
      lifeboatGroup.rotation.z = boatRoll;
      lifeboatGroup.rotation.x = boatPitch;

      // 4. Şükrü Kaptan Kafa & Kol Takibi (Head & Arm tracking)
      const targetPos = playerPos || (state ? state.serviceBay : { x: cx, z: cz - 8.5 });
      const dx = targetPos.x - SUKRU_KAPTAN_POS.x;
      const dz = targetPos.z - SUKRU_KAPTAN_POS.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 22.0) {
        const targetAngle = Math.atan2(dx, dz);
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, targetAngle, dt * 5.0);
      } else {
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, 0, dt * 2.0);
      }

      // Selamlama veya duraklama durumunda kolunu ve megafonunu havaya kaldırma
      const isGreeting = state && (state.honkGreetingTimer > 0 || state.dwellTimer > 0);
      if (isGreeting) {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -Math.PI * 0.65, dt * 8.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.3, dt * 8.0);
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 4.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 4.0);
      }

      // Konuşma balonu kontrolü
      if (state && state.callout) {
        bubbleGroup.visible = true;
        updateBubbleText(state.callout);
        bubbleGroup.quaternion.copy(group.parent ? group.parent.quaternion : group.quaternion);
      } else {
        bubbleGroup.visible = false;
      }
    },
    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - cx, playerPos.z - cz);
      if (dist <= 26.0) {
        rightArmPivot.rotation.x = -Math.PI * 0.65;
        const randomCallout = SUKRU_KAPTAN_CALLOUTS[Math.floor(Math.random() * SUKRU_KAPTAN_CALLOUTS.length)];
        bubbleGroup.visible = true;
        updateBubbleText(randomCallout);
        return true;
      }
      return false;
    },
    dispose() {
      group.clear();
    },
  };
}
