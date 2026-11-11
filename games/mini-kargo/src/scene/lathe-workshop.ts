import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type LatheWorkshopState,
  LATHE_WORKSHOP_CENTER,
  LATHE_WORKSHOP_BAY,
  NECATI_USTA_POS,
  NECATI_USTA_CALLOUTS,
} from "../game/lathe-workshop";

export type LatheWorkshopView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: LatheWorkshopState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sanayi "Tarihi Makine, Torna & Freze İmalathanesi (Torna Aynası & Pres Tezgahı — Torna Ustası Necati Usta)" (T63)
 * - Otantik Sanayi Talaşlı İmalat Atölyesi, Üniversal Torna & Hidrolik Pres Tesisleri:
 *   - Sanayi Organize Bölgesi Z = -50 bulvarının kuzey bordüründe (LATHE_WORKSHOP_CENTER: X: 40.0, Z: -58.0)
 *   - Ağır çelik konstrüksiyon taşıyıcı I-kolonlar, çatı makasları ve galvaniz trapez sac sundurma (Güneye / kameraya tamamen açık cephe)
 *   - Endüstriyel beton avlu tablası (11.6m x 7.6m) ve asfalt servis peronu (LATHE_WORKSHOP_BAY: X: 40.0, Z: -52.8)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve beyaz yön oku
 *   - Büyük aydınlatmalı kurumsal çatı tabelası ("⚙️ SANAYİ TARİHİ TORNA & FREZE ATÖLYESİ · NECATİ USTA 🔩")
 *   - Alt kurumsal şerit ("HASSAS TALAŞLI İMALAT · HİDROLİK PRES & DİŞLİ AÇMA · 1964")
 *   - Gece atölyeyi aydınlatan sıcak kehribar PointLight armatürü
 *   - Ağır Sanayi Üniversal Torna Tezgahı: döküm gövde, hız kolları, dönen 3-ayaklı torna aynası, sıkıştırılmış çelik mil, vida mili ve mavi çelik talaşları
 *   - Ağır Hidrolik Eksantrik Pres Tezgahı: kırmızı C-gövde, üst hidrolik silindir, borular, ritmik dikey basma animasyonlu pres kafası ve kalıp
 *   - Dikey Freze Tezgahı & 5 Çekmeceli Takım Dolabı: mikrometreler, kumpaslar, ağır döküm mengene, matkap uçları ve yağdanlık
 *   - Ham çelik çubuk / profil rafları, pirinç miller, tornalanmış dişli çarklar ve mühürlü MK sevkiyat sandığı
 * - Animasyonlu Usta Tornacı NPC — "Tornacı Necati Usta" (X: 37.8, Z: -54.6):
 *   - Lacivert iş tulumu, koruyucu torna gözlüğü, kıvrık kollar, belde yağlı silme bezi, elinde krom anahtar ve kumpas
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada kolunu kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createLatheWorkshopView(): LatheWorkshopView {
  const group = new THREE.Group();
  group.name = "lathe-workshop-view";
  const obstacles: Rect[] = [];
  const disposables: { dispose(): void }[] = [];

  const cx = LATHE_WORKSHOP_CENTER.x; // 40.0
  const cz = LATHE_WORKSHOP_CENTER.z; // -58.0
  const bayX = LATHE_WORKSHOP_BAY.x; // 40.0
  const bayZ = LATHE_WORKSHOP_BAY.z; // -52.8

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Atölye zemin endüstriyel beton tablası (11.6m x 7.6m)
  box(yardGroup, [11.6, 0.12, 7.6], [0, 0.04, 0], "#7f8c8d");
  box(yardGroup, [11.2, 0.05, 7.2], [0, 0.10, 0], "#636e72");

  // Yağ ve talaş lekeleri (Floor oil stain decals)
  box(yardGroup, [2.2, 0.01, 1.4], [0, 0.11, 0.5], "#2d3436");
  box(yardGroup, [1.6, 0.01, 1.2], [2.8, 0.11, 0.3], "#2d3436");
  box(yardGroup, [1.4, 0.01, 1.0], [-2.6, 0.11, 0.6], "#353b48");

  // Çevre endüstriyel bordür taşları (Kuzey, Doğu ve Batı)
  box(yardGroup, [11.8, 0.18, 0.22], [0, 0.09, -3.8], "#2f3640"); // Kuzey bordür
  box(yardGroup, [0.22, 0.18, 7.8], [-5.85, 0.09, 0], "#2f3640"); // Batı bordür
  box(yardGroup, [0.22, 0.18, 7.8], [5.85, 0.09, 0], "#2f3640"); // Doğu bordür

  // Servis Yanaşma Peronu (LATHE_WORKSHOP_BAY: X: 40.0, Z: -52.8) - Z: -50 bulvarının kuzey bordüründe
  box(group, [5.2, 0.02, 3.0], [bayX, 0.025, bayZ], "#26292d"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.0], [bayX - 2.5, 0.03, bayZ], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.0], [bayX + 2.5, 0.03, bayZ], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [bayX, 0.03, bayZ - 1.4], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [bayX + bx, 0.08, bayZ - 1.5], isYellow ? "#f1c40f" : "#212529");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Kuzeye / atölyeye doğru yönlendirir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [bayX, 0.035, bayZ + 0.5], "#ffffff");
  void arrowStem;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2; // Kuzeye (-Z) bakar
  arrowHead.position.set(bayX, 0.035, bayZ - 0.3);
  group.add(arrowHead);
  disposables.push(arrowHead.geometry, arrowHead.material as THREE.Material);

  // =========================================================================
  // 2. AĞIR ÇELİK KONSTRÜKSİYON ATÖLYE SUNDURMASI
  // =========================================================================
  // Atölye güneye (+Z, kameraya ve yola) tamamen açıktır!
  const shedGroup = new THREE.Group();
  shedGroup.position.set(cx, 0, cz);
  group.add(shedGroup);

  // 4 Adet Ağır Çelik I-Kolon Sütun (Antrasit / petrol mavisi çelik)
  // Kuzey sütunlar Z = -2.6, Güney sütunlar Z = 2.6
  const columnPositions = [
    [-4.2, -2.6],
    [4.2, -2.6],
    [-4.2, 2.6],
    [4.2, 2.6],
  ];

  columnPositions.forEach(([colX, colZ]) => {
    // Çelik I-kolon gövdesi
    box(shedGroup, [0.38, 4.8, 0.38], [colX, 2.4, colZ], "#2c3e50");
    // Taban ankraj flanşı
    box(shedGroup, [0.60, 0.20, 0.60], [colX, 0.10, colZ], "#1e272e");
    // Kolon başlığı destek takozu
    box(shedGroup, [0.60, 0.22, 0.60], [colX, 4.7, colZ], "#1e272e");
  });

  // Yatay Çelik Taşıyıcı Kafes Kirişler (Steel Trusses)
  box(shedGroup, [8.8, 0.40, 0.32], [0, 4.8, -2.6], "#34495e"); // Kuzey kiriş
  box(shedGroup, [8.8, 0.40, 0.32], [0, 4.8, 2.6], "#34495e"); // Güney kiriş
  box(shedGroup, [0.32, 0.40, 5.6], [-4.2, 4.8, 0], "#34495e"); // Batı kiriş
  box(shedGroup, [0.32, 0.40, 5.6], [4.2, 4.8, 0], "#34495e"); // Doğu kiriş

  // Çapraz Rüzgar Gergileri
  const diagA = box(shedGroup, [0.12, 0.12, 5.8], [-4.1, 4.1, 0], "#475569");
  diagA.rotation.x = 0.42;
  const diagB = box(shedGroup, [0.12, 0.12, 5.8], [4.1, 4.1, 0], "#475569");
  diagB.rotation.x = -0.42;

  // Arka (KUZEY -Z) ve Yan Güvenlik Duvarı / Rüzgarlık Panelleri (Antrasit oluklu sac)
  // Güney cephe (+Z) tamamen açık tutulur, böylece kamera doğrudan atölye içine bakar!
  box(shedGroup, [8.2, 3.2, 0.18], [0, 1.7, -2.5], "#3d4852"); // Arka duvar (kuzey)
  box(shedGroup, [0.18, 3.2, 5.0], [-4.1, 1.7, 0], "#343f4b"); // Batı yan duvar
  box(shedGroup, [0.18, 3.2, 5.0], [4.1, 1.7, 0], "#343f4b"); // Doğu yan duvar

  // Oluklu Sanayi Galvaniz Sacı Çatısı (Corrugated Metal Roof)
  const roof = box(shedGroup, [9.4, 0.22, 6.2], [0, 5.1, 0], "#576574");
  roof.rotation.x = -0.05; // Yağmur tahliyesi için hafif arkaya (kuzeye) eğim

  // Çatı Mahya Havalandırma Fenerliği & Egzoz Bacası
  box(shedGroup, [5.4, 0.45, 1.2], [0, 5.4, 0], "#2c3e50");
  const chimney = cylinder(shedGroup, 0.25, 0.25, 1.4, [2.2, 5.8, -1.0], "#34495e", 8);
  const chimneyCap = cylinder(shedGroup, 0.42, 0.05, 0.35, [2.2, 6.55, -1.0], "#2c3e50", 8);
  void chimney; void chimneyCap;

  // =========================================================================
  // 3. AYDINLATMALI BÜYÜK KURUMSAL ÇATI TABELASI & GECE IŞIKLANDIRMASI
  // =========================================================================
  // Çelik Tabela Taşıyıcı Destek Ayakları
  box(shedGroup, [0.18, 0.9, 0.18], [-2.8, 5.1, 2.9], "#2c3e50");
  box(shedGroup, [0.18, 0.9, 0.18], [2.8, 5.1, 2.9], "#2c3e50");

  // Güney çatı alınlığında büyük ışıklı tabela (Güneye / kameraya ve yola bakar, -0.22 açıyla kameraya dönük)
  const signGroup = new THREE.Group();
  signGroup.position.set(0, 5.75, 3.0);
  signGroup.rotation.x = -0.22; // Kameraya doğru belirgin açılı görünürlük
  shedGroup.add(signGroup);

  const signBoard = box(signGroup, [8.8, 1.40, 0.22], [0, 0, 0], "#1a1e24");
  // Altın-sarı sanayi emniyet çerçevesi
  box(signGroup, [9.0, 0.12, 0.26], [0, 0.70, 0], "#f39c12");
  box(signGroup, [9.0, 0.12, 0.26], [0, -0.70, 0], "#f39c12");
  box(signGroup, [0.12, 1.40, 0.26], [-4.45, 0, 0], "#f39c12");
  box(signGroup, [0.12, 1.40, 0.26], [4.45, 0, 0], "#f39c12");

  const signLabel = label("⚙️ SANAYİ TORNA & FREZE · NECATİ USTA 🔩", "#f1c40f", "#1a1e24");
  signLabel.scale.set(6.2, 0.72, 1);
  signLabel.position.set(0, 0.22, 0.14);
  signBoard.add(signLabel);

  // Alt Kurumsal Şerit
  const subLabel = label("HASSAS TALAŞLI İMALAT · HİDROLİK PRES · 1964", "#ffffff", "#c0392b");
  subLabel.scale.set(5.8, 0.36, 1);
  subLabel.position.set(0, -0.32, 0.14);
  signBoard.add(subLabel);

  // Gece ve Gündüz Atölyeyi Aydınlatan Sıcak Kehribar PointLight Armatürü
  const workLight = new THREE.PointLight("#ffa801", 2.2, 20.0);
  workLight.position.set(cx, 4.4, cz + 1.2);
  group.add(workLight);
  disposables.push(workLight);

  // Döküm Çelik Armatür Gövdesi
  cylinder(shedGroup, 0.25, 0.12, 0.32, [0, 4.65, 0.6], "#2f3542", 8);

  // =========================================================================
  // 4. AĞIR SANAYİ ÜNİVERSAL TORNA TEZGAHI (Universal Metal Lathe Machine)
  // =========================================================================
  // Torna tezgahı atölye merkezinde, operatör tarafı güneye (+Z kameraya) bakar
  const latheGroup = new THREE.Group();
  latheGroup.position.set(0, 0, 0.2);
  shedGroup.add(latheGroup);

  // Ağır Dökme Demir Torna Gövdesi & Kızak Yatağı (Lathe Bed & Ways)
  box(latheGroup, [3.2, 0.85, 0.95], [0, 0.52, 0], "#2c3e50");
  box(latheGroup, [3.0, 0.18, 0.85], [0, 0.98, 0], "#34495e");
  // Çift Prizmatik Çelik Kızak Yolları (Prismatic V-ways)
  box(latheGroup, [2.8, 0.08, 0.12], [0, 1.08, -0.22], "#bdc3c7");
  box(latheGroup, [2.8, 0.08, 0.12], [0, 1.08, 0.22], "#bdc3c7");
  // Alt Talaş Teknesi (Chip & Coolant Tray)
  box(latheGroup, [3.4, 0.08, 1.15], [0, 0.14, 0], "#1e272e");

  // Fener Mili Dişli Kutusu (Headstock Gearbox - Sol Kanat)
  box(latheGroup, [0.95, 0.85, 0.92], [-1.15, 1.40, 0], "#2c3e50");
  box(latheGroup, [0.98, 0.12, 0.94], [-1.15, 1.85, 0], "#34495e");
  // Hız Seçici Devir Kolları (Speed Levers - Güneye / kameraya doğru eğimli)
  for (const lx of [-1.35, -1.15, -0.95]) {
    const lever = cylinder(latheGroup, 0.02, 0.02, 0.22, [lx, 1.65, 0.48], "#dfe6e9", 6);
    lever.rotation.x = -Math.PI / 4;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), mat("#e74c3c"));
    knob.position.set(lx, 1.74, 0.56);
    latheGroup.add(knob);
    disposables.push(knob.geometry, knob.material as THREE.Material);
  }
  // Elektrik Kontrol Paneli & Acil Durdurma Mantar Butonu (Emergency Stop)
  box(latheGroup, [0.35, 0.45, 0.06], [-1.15, 1.35, 0.48], "#ecf0f1");
  const eStop = cylinder(latheGroup, 0.05, 0.05, 0.08, [-1.15, 1.25, 0.52], "#c0392b", 8);
  eStop.rotation.x = Math.PI / 2;

  // Dönen 3-Ayaklı Torna Aynası (3-Jaw Self-Centering Chuck)
  const latheChuckGroup = new THREE.Group();
  latheChuckGroup.position.set(-0.55, 1.40, 0);
  latheGroup.add(latheChuckGroup);

  const chuckBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16),
    mat("#95a5a6", 0.3),
  );
  chuckBody.rotation.z = Math.PI / 2;
  latheChuckGroup.add(chuckBody);
  disposables.push(chuckBody.geometry, chuckBody.material as THREE.Material);

  // 3 Adet Kademeli Çelik Sıkma Ayağı (Stepped Jaws)
  for (let j = 0; j < 3; j++) {
    const jawAng = (j * Math.PI * 2) / 3;
    const jaw = box(latheChuckGroup, [0.24, 0.14, 0.10], [0.08, Math.sin(jawAng) * 0.22, Math.cos(jawAng) * 0.22], "#7f8c8d");
    void jaw;
  }

  // Aynaya Bağlı Tornalanan Çelik Mil (Turning Steel Workpiece)
  const workpiece = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.65, 12),
    mat("#dfe6e9", 0.2), // Parlak krom çelik
  );
  workpiece.rotation.z = Math.PI / 2;
  workpiece.position.set(0.35, 1.40, 0);
  latheGroup.add(workpiece);
  disposables.push(workpiece.geometry, workpiece.material as THREE.Material);

  // Gezer Punta (Tailstock - Sağ Kanat)
  box(latheGroup, [0.65, 0.55, 0.65], [1.25, 1.32, 0], "#2c3e50");
  cylinder(latheGroup, 0.08, 0.08, 0.35, [0.95, 1.40, 0], "#7f8c8d", 8).rotation.z = Math.PI / 2; // Punta kovanı
  // Punta Konik Ucu (Dead Center - 60 derece sivriltilmiş mil ucu)
  const deadCenter = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), mat("#bdc3c7"));
  deadCenter.rotation.z = -Math.PI / 2;
  deadCenter.position.set(0.75, 1.40, 0);
  latheGroup.add(deadCenter);
  disposables.push(deadCenter.geometry, deadCenter.material as THREE.Material);
  // Punta İlerletme El Çarkı (Tailstock Handwheel)
  const wheel = cylinder(latheGroup, 0.16, 0.16, 0.04, [1.60, 1.40, 0], "#34495e", 12);
  wheel.rotation.z = Math.PI / 2;

  // Araba, Enine Destek & Kalemlik (Carriage, Cross-slide & Tool Post)
  box(latheGroup, [0.55, 0.22, 0.85], [0.15, 1.15, 0], "#34495e");
  box(latheGroup, [0.35, 0.25, 0.35], [0.15, 1.38, 0.22], "#2c3e50"); // 4-yönlü kare kalemlik
  // Karbür Torna Kalemi & Kesici Uç (Carbide Lathe Tool Bit)
  const tool = box(latheGroup, [0.18, 0.06, 0.28], [0.15, 1.40, 0.06], "#e74c3c");
  void tool;

  // Boyuna Vida Mili & Talaş Mili (Longitudinal Lead Screw & Feed Rod - Ön yüzeyde)
  cylinder(latheGroup, 0.03, 0.03, 2.8, [0.1, 0.85, 0.42], "#7f8c8d", 6).rotation.z = Math.PI / 2;
  cylinder(latheGroup, 0.025, 0.025, 2.8, [0.1, 0.72, 0.42], "#95a5a6", 6).rotation.z = Math.PI / 2;

  // Dönen Dinamik Mavi Çelik Talaşları (Curled Metal Turning Chips)
  const chipGroup = new THREE.Group();
  chipGroup.position.set(0.18, 1.42, 0.02);
  latheGroup.add(chipGroup);

  const chipMeshes: THREE.Mesh[] = [];
  const chipColors = ["#0984e3", "#74b9ff", "#dfe6e9", "#00cec9"];
  for (let i = 0; i < 8; i++) {
    const chipMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.015, 4, 8, Math.PI * 1.5),
      mat(chipColors[i % chipColors.length], 0.2),
    );
    chipMesh.position.set(
      (Math.random() - 0.5) * 0.18,
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.18,
    );
    chipMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    chipGroup.add(chipMesh);
    chipMeshes.push(chipMesh);
    disposables.push(chipMesh.geometry, chipMesh.material as THREE.Material);
  }

  // =========================================================================
  // 5. AĞIR HİDROLİK EKSANTRİK PRES TEZGAHI (Heavy Hydraulic Press Machine)
  // =========================================================================
  // Doğu kanadında, pres ağzı güneye (+Z) açık
  const pressGroup = new THREE.Group();
  pressGroup.position.set(2.6, 0, 0.2);
  shedGroup.add(pressGroup);

  // Ağır Döküm Çelik C-Gövde (Safety Red / Crimson Press Frame)
  box(pressGroup, [1.4, 0.45, 1.3], [0, 0.22, 0], "#2c3e50"); // Ağır taban kaidesi
  box(pressGroup, [1.2, 3.4, 0.45], [0, 1.90, -0.42], "#c0392b"); // Arka dikey omurga (kuzey)
  box(pressGroup, [1.2, 0.85, 1.2], [0, 3.25, 0], "#c0392b"); // Üst konsol gövdesi
  box(pressGroup, [0.35, 2.2, 0.35], [-0.48, 1.70, 0.38], "#d63031"); // Sol ön takviye kolonu
  box(pressGroup, [0.35, 2.2, 0.35], [0.48, 1.70, 0.38], "#d63031"); // Sağ ön takviye kolonu

  // Üst Hidrolik Silindir Gövdesi (Top Hydraulic Ram Cylinder)
  cylinder(pressGroup, 0.28, 0.28, 1.1, [0, 3.90, 0.15], "#2d3436", 12);
  cylinder(pressGroup, 0.34, 0.34, 0.14, [0, 4.40, 0.15], "#34495e", 12); // Silindir flanşı
  // Hidrolik Yüksek Basınç Hortumları (Braided Fluid Lines)
  cylinder(pressGroup, 0.03, 0.03, 1.4, [0.22, 3.85, -0.15], "#1e272e", 6);
  cylinder(pressGroup, 0.03, 0.03, 1.4, [-0.22, 3.85, -0.15], "#1e272e", 6);

  // Alt Sabit Kalıp Tablası (Bolster Plate & Lower Die)
  box(pressGroup, [1.1, 0.25, 0.95], [0, 0.58, 0.15], "#7f8c8d");
  cylinder(pressGroup, 0.24, 0.24, 0.12, [0, 0.74, 0.15], "#bdc3c7", 12); // Alt dairesel kalıp

  // Hareketli Üst Pres Koçu / Pistonu (Moving Hydraulic Stamping Ram)
  const pressRam = new THREE.Group();
  pressRam.position.set(0, 2.4, 0.15);
  pressGroup.add(pressRam);

  // Parlak Krom Piston Mili (Chrome Hydraulic Shaft)
  const pistonShaft = cylinder(pressRam, 0.14, 0.14, 1.2, [0, 0.6, 0], "#dfe6e9", 12);
  void pistonShaft;
  // Ağır Döküm Çelik Baskı Koç Kafası (Steel Stamping Block)
  box(pressRam, [0.95, 0.32, 0.75], [0, 0, 0], "#2c3e50");
  // Üst Baskı Zımbası (Upper Punch Tool)
  cylinder(pressRam, 0.22, 0.22, 0.14, [0, -0.22, 0], "#bdc3c7", 12);

  // Basınç Manometresi (Hydraulic Pressure Gauge)
  const gauge = cylinder(pressGroup, 0.12, 0.12, 0.06, [0.55, 2.4, 0.15], "#ecf0f1", 12);
  gauge.rotation.z = Math.PI / 2;
  const needle = cylinder(pressGroup, 0.015, 0.015, 0.09, [0.59, 2.4, 0.15], "#c0392b", 4);
  void needle;

  // Çift El Emniyet Kumanda Butonları (Dual Safety Palm Buttons - Güneye bakar)
  box(pressGroup, [1.1, 0.08, 0.22], [0, 1.05, 0.58], "#2c3e50");
  cylinder(pressGroup, 0.05, 0.05, 0.06, [-0.42, 1.12, 0.58], "#27ae60", 8); // Sol yeşil basma butonu
  cylinder(pressGroup, 0.05, 0.05, 0.06, [0.42, 1.12, 0.58], "#27ae60", 8); // Sağ yeşil basma butonu

  // =========================================================================
  // 6. DİKEY FREZE TEZGAHI & TAKIM DOLABI (Vertical Milling Machine & Tool Chest)
  // =========================================================================
  // Batı kanadında, iş mili ve tablası güneye (+Z) bakar
  const millGroup = new THREE.Group();
  millGroup.position.set(-2.6, 0, 0.2);
  shedGroup.add(millGroup);

  // Freze Döküm Gövde Kolonu (Knee-and-Column Mill Base & Column)
  box(millGroup, [1.1, 0.35, 1.2], [0, 0.18, 0], "#2c3e50");
  box(millGroup, [0.75, 2.6, 0.75], [0, 1.45, -0.22], "#34495e");
  // Üst Konsol Başlığı (Overarm & Swivel Spindle Head)
  box(millGroup, [0.65, 0.55, 1.2], [0, 2.75, 0.15], "#2c3e50");
  cylinder(millGroup, 0.12, 0.08, 0.45, [0, 2.30, 0.45], "#bdc3c7", 8); // Dikey iş mili & parmak freze çakısı

  // Hareketli T-Kanallı Freze Tablası (Cross-Feed Work Table - Güneye doğru önde)
  box(millGroup, [1.6, 0.14, 0.52], [0, 1.35, 0.38], "#95a5a6");
  box(millGroup, [0.65, 0.45, 0.55], [0, 1.05, 0.15], "#2c3e50"); // Konsol desteği (Knee)
  // Tabla Hareket El Çarkları (Cross-Feed Handwheels)
  cylinder(millGroup, 0.12, 0.12, 0.04, [0.85, 1.35, 0.38], "#dfe6e9", 8).rotation.z = Math.PI / 2;
  cylinder(millGroup, 0.12, 0.12, 0.04, [-0.85, 1.35, 0.38], "#dfe6e9", 8).rotation.z = Math.PI / 2;

  // 5 Çekmeceli Lacivert Metal Takım Dolabı (Mechanic Tool Cabinet - Batı ön köşede)
  const toolCabinet = new THREE.Group();
  toolCabinet.position.set(-3.4, 0, 0.8);
  shedGroup.add(toolCabinet);

  box(toolCabinet, [1.1, 1.05, 0.65], [0, 0.55, 0], "#1e3799");
  // 5 Adet Çekmece ve Krom Kulplar (Güneye / kameraya bakar)
  for (let d = 0; d < 5; d++) {
    const dy = 0.20 + d * 0.18;
    box(toolCabinet, [0.98, 0.14, 0.02], [0, dy, 0.33], "#192a56");
    box(toolCabinet, [0.45, 0.03, 0.03], [0, dy, 0.35], "#dfe6e9"); // Krom kulp
  }
  // Üst Lastik Çalışma Matı
  box(toolCabinet, [1.14, 0.04, 0.68], [0, 1.10, 0], "#2f3640");

  // Hassas Ölçüm Aletleri (Precision Metrology Instruments - Masanın üstünde)
  // 1. Kumpas (Vernier Caliper)
  box(toolCabinet, [0.42, 0.015, 0.06], [-0.25, 1.13, 0], "#bdc3c7");
  box(toolCabinet, [0.06, 0.02, 0.12], [-0.42, 1.13, 0], "#bdc3c7"); // Kumpas sabit çenesi
  box(toolCabinet, [0.06, 0.02, 0.12], [-0.15, 1.13, 0], "#dfe6e9"); // Kumpas hareketli çenesi
  // 2. Mikrometre (Outside Micrometer)
  const microFrame = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 8, Math.PI), mat("#2c3e50"));
  microFrame.rotation.x = Math.PI / 2;
  microFrame.position.set(0.25, 1.13, 0.05);
  toolCabinet.add(microFrame);
  cylinder(toolCabinet, 0.02, 0.02, 0.14, [0.35, 1.13, 0.05], "#dfe6e9", 6).rotation.z = Math.PI / 2;
  disposables.push(microFrame.geometry, microFrame.material as THREE.Material);

  // Ağır Döküm Çelik Tezgah Mengenesi (Heavy Bench Vise)
  box(toolCabinet, [0.32, 0.18, 0.28], [0.35, 1.21, 0.15], "#2c3e50");
  box(toolCabinet, [0.28, 0.12, 0.08], [0.35, 1.25, 0.25], "#bdc3c7"); // Mengene çeneleri
  cylinder(toolCabinet, 0.015, 0.015, 0.28, [0.35, 1.24, 0.32], "#dfe6e9", 6).rotation.x = Math.PI / 2; // Çevirme kolu

  // =========================================================================
  // 7. HAMMADDE RAFLARI, MAMUL DİŞLİLER & SEVKİYAT SANDIKLARI
  // =========================================================================
  // Konsol Çelik Profil ve Mil Rafı (Cantilever Steel Bar Rack - Kuzeydoğu Arkası)
  const rackGroup = new THREE.Group();
  rackGroup.position.set(2.8, 0, -1.8);
  shedGroup.add(rackGroup);

  // Dikme Çelik Kollar
  box(rackGroup, [0.12, 2.2, 0.12], [-0.65, 1.1, 0], "#e67e22");
  box(rackGroup, [0.12, 2.2, 0.12], [0.65, 1.1, 0], "#e67e22");
  // Taşıyıcı Konsol Kolları
  for (const ry of [0.55, 1.15, 1.75]) {
    box(rackGroup, [0.12, 0.06, 0.65], [-0.65, ry, 0.25], "#d35400");
    box(rackGroup, [0.12, 0.06, 0.65], [0.65, ry, 0.25], "#d35400");
  }
  // İstiflenmiş Çelik Miller, Sarı Pirinç Çubuklar ve Bronz Borular
  cylinder(rackGroup, 0.05, 0.05, 1.6, [0, 0.62, 0.25], "#dfe6e9", 8).rotation.z = Math.PI / 2; // Krom mil
  cylinder(rackGroup, 0.04, 0.04, 1.5, [0, 0.62, 0.38], "#dfe6e9", 8).rotation.z = Math.PI / 2;
  cylinder(rackGroup, 0.045, 0.045, 1.5, [0, 1.22, 0.25], "#f1c40f", 8).rotation.z = Math.PI / 2; // Pirinç altıköşe
  cylinder(rackGroup, 0.06, 0.06, 1.4, [0, 1.82, 0.25], "#cd6133", 8).rotation.z = Math.PI / 2; // Bronz boru

  // Ahşap EUR Palet Üzerinde İşlenmiş Dişliler & Parçalar (Finished Gears - Kuzeybatı Arkası)
  const palletGroup = new THREE.Group();
  palletGroup.position.set(-1.2, 0, -1.8);
  shedGroup.add(palletGroup);

  // EUR Palet
  box(palletGroup, [1.2, 0.12, 0.85], [0, 0.06, 0], "#b98a58");
  // Tornalanmış Düz Dişli Çarklar (Machined Spur Gears)
  for (let g = 0; g < 3; g++) {
    const gear = cylinder(palletGroup, 0.22 - g * 0.03, 0.22 - g * 0.03, 0.08, [-0.25, 0.16 + g * 0.09, 0], "#95a5a6", 16);
    void gear;
  }
  // Mühürlü Ahşap Mini Kargo Makine Parçası Sandığı
  const crate = box(palletGroup, [0.65, 0.55, 0.55], [0.28, 0.39, 0], "#8c6239");
  const crateLabel = label("⚙️ MK MAKİNE", "#f1c40f", "#2c3e50");
  crateLabel.scale.set(0.65, 0.25, 1);
  crateLabel.position.set(0, 0, 0.28);
  crate.add(crateLabel);
  // Sarı Gergi Çemberleri
  box(crate, [0.67, 0.04, 0.04], [0, 0.15, 0], "#f1c40f");
  box(crate, [0.67, 0.04, 0.04], [0, -0.15, 0], "#f1c40f");

  // =========================================================================
  // 8. ANİMASYONLU USTA TORNACI NPC — "TORNACI NECATİ USTA" (X: 37.8, Z: -54.6)
  // =========================================================================
  // Necati Usta atölye ön avlusunda durur, güneye (+Z, yola ve kameraya) bakar
  const necatiGroup = new THREE.Group();
  necatiGroup.position.set(NECATI_USTA_POS.x, 0, NECATI_USTA_POS.z);
  group.add(necatiGroup);

  // İş Ayakkabıları / Çelik Burunlu Botlar
  box(necatiGroup, [0.18, 0.14, 0.26], [-0.14, 0.07, 0.04], "#2d3436");
  box(necatiGroup, [0.18, 0.14, 0.26], [0.14, 0.07, 0.04], "#2d3436");

  // Lacivert İş Tulumu Pantolon Paçaları
  cylinder(necatiGroup, 0.10, 0.11, 0.68, [-0.14, 0.44, 0], "#1e3799", 8);
  cylinder(necatiGroup, 0.10, 0.11, 0.68, [0.14, 0.44, 0], "#1e3799", 8);

  // Gövde / Üst Beden & Kafa Grubu (Head tracking için ayrıldı)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.78, 0);
  necatiGroup.add(torsoGroup);

  // Lacivert Tulum Gövdesi & Yağ Lekeleri (Güneye bakar)
  box(torsoGroup, [0.46, 0.62, 0.28], [0, 0.31, 0], "#1e3799");
  box(torsoGroup, [0.42, 0.10, 0.04], [0, 0.38, 0.14], "#192a56"); // Göğüs cebi
  box(torsoGroup, [0.08, 0.08, 0.01], [0.12, 0.22, 0.14], "#2d3436"); // Gres lekesi
  // Belde Takılı Kırmızı-Beyaz Çizgili Silme Bezi (Shop Rag)
  box(torsoGroup, [0.14, 0.22, 0.06], [-0.22, 0.08, 0.08], "#e74c3c");

  // Kafa, Saç ve Koruyucu Torna Gözlüğü Grubu
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  torsoGroup.add(headGroup);

  cylinder(headGroup, 0.07, 0.08, 0.12, [0, 0.04, 0], "#f5cd79", 8); // Boyun
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), mat("#f5cd79"));
  headMesh.position.set(0, 0.18, 0);
  headGroup.add(headMesh);
  disposables.push(headMesh.geometry, headMesh.material as THREE.Material);

  // Kırlaşmış Saçlar
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), mat("#7f8c8d"));
  hair.position.set(0, 0.21, -0.02);
  headGroup.add(hair);
  disposables.push(hair.geometry, hair.material as THREE.Material);

  // Pos Usta Bıyığı (Güneye bakar)
  box(headGroup, [0.14, 0.04, 0.06], [0, 0.14, 0.15], "#57606f");

  // Koruyucu Torna Gözlüğü (Safety Glasses / Goggles)
  box(headGroup, [0.26, 0.06, 0.04], [0, 0.20, 0.16], "#2c3e50"); // Koyu çerçeve
  box(headGroup, [0.09, 0.05, 0.02], [-0.06, 0.20, 0.18], "#81ecec"); // Sol şeffaf cam
  box(headGroup, [0.09, 0.05, 0.02], [0.06, 0.20, 0.18], "#81ecec"); // Sağ şeffaf cam

  // Sol Kol (Belde Dinlenme Pozu)
  const leftArm = cylinder(torsoGroup, 0.065, 0.065, 0.52, [-0.28, 0.28, 0], "#1e3799", 8);
  leftArm.rotation.z = 0.22;
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), mat("#f5cd79"));
  leftHand.position.set(-0.34, 0.02, 0);
  torsoGroup.add(leftHand);
  disposables.push(leftHand.geometry, leftHand.material as THREE.Material);

  // Sağ Kol & El Aleti Grubu (Selamlama & Usta jesti için animasyonlu)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.52, 0);
  torsoGroup.add(rightArmGroup);

  const rightArm = cylinder(rightArmGroup, 0.065, 0.065, 0.52, [0, -0.22, 0], "#1e3799", 8);
  void rightArm;
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), mat("#f5cd79"));
  rightHand.position.set(0, -0.48, 0);
  rightArmGroup.add(rightHand);
  disposables.push(rightHand.geometry, rightHand.material as THREE.Material);

  // Elinde Tutan Parlak Krom İngiliz Anahtarı (Machinist Wrench)
  const wrench = box(rightArmGroup, [0.04, 0.32, 0.02], [0.04, -0.44, 0.08], "#dfe6e9");
  box(rightArmGroup, [0.08, 0.06, 0.025], [0.04, -0.28, 0.08], "#bdc3c7"); // Anahtar açık ağzı
  void wrench;

  // 3B Konuşma Balonu Grubu (Callout Bubble)
  const calloutGroup = new THREE.Group();
  calloutGroup.position.set(0, 2.45, 0);
  calloutGroup.visible = false;
  necatiGroup.add(calloutGroup);

  let currentBubbleText = "";
  let bubbleLabel: THREE.Sprite | null = null;

  function updateBubble(text: string) {
    if (text === currentBubbleText && bubbleLabel) return;
    if (bubbleLabel) {
      calloutGroup.remove(bubbleLabel);
      bubbleLabel.material.dispose();
      bubbleLabel = null;
    }
    currentBubbleText = text;
    bubbleLabel = label(text, "#ffffff", "#1e272e");
    bubbleLabel.scale.set(5.8, 1.05, 1);
    calloutGroup.add(bubbleLabel);
  }

  // =========================================================================
  // 9. ÇARPIŞMA ENGELİ (STATIC OBSTACLES)
  // =========================================================================
  // Atölye binası, torna tezgahı ve presi kapsayan adil dikdörtgen engel
  // Z: -60.8 ile -55.2 arasında kalır. Servis peronu (Z: -52.8) ve Z: -50 bulvarı tamamen açıktır!
  obstacles.push({
    minX: cx - 4.4, // 35.6
    maxX: cx + 4.4, // 44.4
    minZ: cz - 2.8, // -60.8
    maxZ: cz + 2.8, // -55.2
    height: 4.8,
  });

  // =========================================================================
  // 10. ANİMASYON VE GÜNCELLEME DÖNGÜSÜ
  // =========================================================================
  let greetingTimer = 0;
  let activeCalloutText = NECATI_USTA_CALLOUTS[0];

  return {
    group,
    obstacles,

    update(
      dt: number,
      stateOrNight?: LatheWorkshopState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      const state = typeof stateOrNight === "object" ? stateOrNight : null;
      const night = typeof stateOrNight === "boolean" ? stateOrNight : Boolean(isNightOrDusk);

      // Gece aydınlatması
      workLight.intensity = night ? 2.4 : 1.2;

      // Torna aynası dönüş animasyonu
      if (state) {
        latheChuckGroup.rotation.x = state.latheSpinAngle;
        // Hidrolik pres koç kafası dikey basma animasyonu (0.0 - 0.42m vuruş)
        const pressDrop = Math.max(0, Math.sin(state.pressCycle * Math.PI * 2)) * 0.42;
        pressRam.position.y = 2.4 - pressDrop;
      } else {
        latheChuckGroup.rotation.x += dt * 14.0;
        pressRam.position.y = 2.4 - Math.max(0, Math.sin(Date.now() * 0.005)) * 0.42;
      }

      // Dinamik metal talaşlarının hafif titreşimi
      chipGroup.rotation.z += dt * 2.0;

      // Selamlama zamanlayıcısı
      if (state && state.honkGreetingTimer > 0) {
        greetingTimer = state.honkGreetingTimer;
        if (state.lastHonkCallout) {
          activeCalloutText = state.lastHonkCallout;
        }
      } else if (greetingTimer > 0) {
        greetingTimer = Math.max(0, greetingTimer - dt);
      }

      // Tornacı Necati Usta Kafa ve Gövde Takibi (22m mesafe)
      if (playerPos) {
        const dx = playerPos.x - NECATI_USTA_POS.x;
        const dz = playerPos.z - NECATI_USTA_POS.z;
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
        // Kolu havaya kaldırıp anahtarı sallama pozu
        const waveAngle = -Math.PI * 0.75 + Math.sin(greetingTimer * 10.0) * 0.35;
        rightArmGroup.rotation.z = waveAngle;
        rightArmGroup.rotation.x = Math.sin(greetingTimer * 8.0) * 0.25;

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
        playerPos.x - NECATI_USTA_POS.x,
        playerPos.z - NECATI_USTA_POS.z,
      );
      if (dist <= 24.0) {
        greetingTimer = 4.5;
        const idx = Math.floor(Math.random() * NECATI_USTA_CALLOUTS.length);
        activeCalloutText = NECATI_USTA_CALLOUTS[idx];
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
