import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type CinemaState,
  CINEMA_CENTER,
  CINEMA_BAY,
  CINEMA_SCREEN_POS,
  RIFAT_POS,
  RIFAT_CALLOUTS,
} from "../game/cinema";

export type CinemaView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: CinemaState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sahil "Açık Hava Yazlık Sineması & Sahil Gazinosu" (T57)
 * - Otantik Nostaljik Kıyı Yazlık Sineması & Sahil Gazinosu:
 *   - 14.0m x 10.5m kumtaşı ve deniz kumu avlu tablası, rustik bordür taşları ve servis yanaşma peronu (CINEMA_BAY: X: -26.0, Z: 47.2)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku
 *   - Devasa Anıtsal Açık Hava Projeksiyon Perdesi (7.8m x 4.8m Art-Deco korniş, hoparlör boruları, dinamik vintage film projeksiyonu)
 *   - Yükseltilmiş Retro 35mm Makinist Kulesi (Doğu cephesinde ahşap/tuğla kaideli kule, oluklu saç çatı, dönen pirinç 35mm film makaraları)
 *   - Çapraz Hacimsel Projektör Işık Huzmesi (Volumetric projection beam cone with additive blending and dynamic flicker towards screen)
 *   - Kademeli Nostaljik Şezlonglar & Gazino Masaları (Çizgili kumaş yazlık sandalyeler, yeşil gazoz şişeleri, çekirdek tabağı, patlamış mısır)
 *   - Rengarenk Asılı Yazlık Ampul Kordonları (Overhead festoon party string lights)
 *   - Yüksek Işıklı Neon Giriş Takı & Tabela ("🎬 SAHİL AÇIK HAVA YAZLIK SİNEMASI · YILDIZ GAZİNOSU 🍿")
 *   - Ahşap Bilet Gişesi & Tebeşirli Film Afişi Şövalesi ("BU AKŞAM: NEŞELİ GÜNLER & SELVİ BOYLUM")
 * - Animasyonlu Makinist NPC — "Makinist Rıfat" (X: -28.8, Z: 46.2):
 *   - Kasket, askılı lacivert pantolon, beyaz gömlek, bıyık ve elinde pirinç film makarası
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada makarasını kaldırarak selamlama ve 3D konuşma balonu
 */
export function createCinemaView(): CinemaView {
  const group = new THREE.Group();
  group.name = "cinema-view";
  const obstacles: Rect[] = [];

  const cx = CINEMA_CENTER.x; // -26.0
  const cz = CINEMA_CENTER.z; // 42.0

  // =========================================================================
  // 1. AVLU TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Kumtaşı ve deniz kumu avlu tablası (14.0m x 10.5m)
  box(yardGroup, [14.0, 0.12, 10.5], [0, 0.04, 0], "#d5c39a");
  box(yardGroup, [13.6, 0.05, 10.1], [0, 0.10, 0], "#c4b185");

  // Çevre rustik bordür taşları
  box(yardGroup, [14.2, 0.18, 0.22], [0, 0.09, -5.25], "#5d4037");
  box(yardGroup, [14.2, 0.18, 0.22], [0, 0.09, 5.25], "#5d4037");
  box(yardGroup, [0.22, 0.18, 10.7], [-7.05, 0.09, 0], "#5d4037");
  box(yardGroup, [0.22, 0.18, 10.7], [7.05, 0.09, 0], "#5d4037");

  // Servis Yanaşma Peronu (CINEMA_BAY: X: -26.0, Z: 47.2) - Z: 50 bulvarının kuzey bordüründe
  box(group, [5.2, 0.02, 3.0], [cx, 0.025, cz + 5.2], "#2c3437"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.0], [cx - 2.5, 0.03, cz + 5.2], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.0], [cx + 2.5, 0.03, cz + 5.2], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 3.8], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 3.7], isYellow ? "#f39c12" : "#2c3e50");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
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
  // 2. DEVASA ANITSAL AÇIK HAVA PROJEKSİYON PERDESİ (MONUMENTAL SCREEN)
  // =========================================================================
  const screenGroup = new THREE.Group();
  screenGroup.position.set(cx, 0, CINEMA_SCREEN_POS.z);
  group.add(screenGroup);

  const sW = 8.2;
  const sH = 4.8;
  const sD = 0.8;

  // İkili Art-Deco Taşıyıcı Taş Sütunlar (Sol ve Sağ Kule Kaideleri)
  for (const px of [-sW / 2 + 0.45, sW / 2 - 0.45]) {
    box(screenGroup, [0.9, sH + 0.6, sD], [px, (sH + 0.6) / 2, 0], "#ded5c2"); // Taş sütun
    box(screenGroup, [1.1, 0.35, sD + 0.2], [px, 0.18, 0], "#7f8c8d"); // Kaide
    box(screenGroup, [1.1, 0.35, sD + 0.2], [px, sH + 0.5, 0], "#7f8c8d"); // Başlık
    // Altın sarısı Art-Deco dekoratif çıtası
    box(screenGroup, [0.15, sH, sD + 0.05], [px, sH / 2, 0.1], "#f1c40f");
  }

  // Perde Arkası Çelik Kafes Konstrüksiyonu (Truss Framework)
  box(screenGroup, [sW - 0.8, 0.25, 0.25], [0, 1.2, -sD / 2 + 0.1], "#34495e");
  box(screenGroup, [sW - 0.8, 0.25, 0.25], [0, sH - 0.2, -sD / 2 + 0.1], "#34495e");
  for (let tx = -2.6; tx <= 2.6; tx += 1.3) {
    box(screenGroup, [0.18, sH - 1.2, 0.2], [tx, sH / 2 + 0.4, -sD / 2 + 0.1], "#2c3e50");
  }

  // Perde Çerçevesi ve Kırmızı Tiyatro Saçaklığı (Pelmet & Header)
  box(screenGroup, [sW, 0.55, sD + 0.15], [0, sH + 0.4, 0.05], "#c0392b"); // Bordo saçaklık
  box(screenGroup, [sW + 0.2, 0.12, sD + 0.25], [0, sH + 0.7, 0.05], "#f39c12"); // Altın korniş

  // Yan vintage sinema hoparlör boruları (Vintage horn cinema speakers)
  for (const hx of [-sW / 2 + 0.45, sW / 2 - 0.45]) {
    const speakerHorn = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.65, 8),
      mat("#2c3e50"),
    );
    speakerHorn.rotation.x = Math.PI / 2;
    speakerHorn.position.set(hx, sH - 0.4, sD / 2 + 0.25);
    screenGroup.add(speakerHorn);
  }

  // Beyaz Projeksiyon Perdesi (6.8m x 3.6m Masif Yansıtıcı Yüzey)
  const screenBacking = box(screenGroup, [6.8, 3.6, 0.15], [0, sH / 2 + 0.2, 0.1], "#1a1a1a");
  screenBacking.castShadow = true;

  // Gerçek Sinema Beyazı Perde Tabakası (Projection Canvas)
  const screenMat = new THREE.MeshBasicMaterial({ color: "#f8f9fa" });
  const screenCanvas = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.4), screenMat);
  screenCanvas.position.set(0, sH / 2 + 0.2, 0.18);
  screenGroup.add(screenCanvas);

  // Perde üzerinde film projeksiyonu ışık efekti (Dynamic screen light)
  const screenGlowLight = new THREE.PointLight("#fff9e6", 1.8, 14);
  screenGlowLight.position.set(0, sH / 2 + 0.2, 1.2);
  screenGroup.add(screenGlowLight);

  // =========================================================================
  // 3. YÜKSELTİLMİŞ RETRO 35MM MAKİNİST KULESİ (PROJECTOR TOWER - DOĞU CEPHESİNDE)
  // =========================================================================
  // Makinist kulübesi doğu kenarında (cx + 3.8, cz + 1.2) yer alır;
  // böylece merkez hat açıktır ve peron doğrudan dev perdeyi görür!
  const boothGroup = new THREE.Group();
  boothGroup.position.set(cx + 3.8, 0, cz + 1.2);
  group.add(boothGroup);

  const bW = 2.4;
  const bD = 2.2;
  const bH = 2.6;

  // Ahşap taşıyıcı sütunlar üzerinde yükseltilmiş kule platformu
  for (const bx of [-bW / 2 + 0.2, bW / 2 - 0.2]) {
    for (const bz of [-bD / 2 + 0.2, bD / 2 - 0.2]) {
      cylinder(boothGroup, 0.08, 0.08, 1.2, [bx, 0.6, bz], "#4e342e", 6);
    }
  }
  // Ahşap güverte tablası
  box(boothGroup, [bW + 0.2, 0.16, bD + 0.2], [0, 1.2, 0], "#795548");

  // Kabin Alt Tuğla/Ahşap Gövdesi
  box(boothGroup, [bW, bH - 0.6, bD], [0, 1.28 + (bH - 0.6) / 2, 0], "#27ae60"); // Yeşil ahşap lambri
  box(boothGroup, [bW + 0.2, 0.25, bD + 0.2], [0, 1.28 + bH - 0.45, 0], "#1e8449"); // Saçak kornişi
  const boothRoof = box(boothGroup, [bW + 0.4, 0.35, bD + 0.4], [0, 1.28 + bH - 0.15, 0], "#145a32"); // Oluklu metal çatı
  boothRoof.castShadow = true;

  // Ön Projeksiyon Mazgalı (Kuzeybatıya, Perdenin Merkezine Açılandırılmış)
  box(boothGroup, [1.0, 0.6, 0.12], [-0.3, 2.2, -bD / 2 - 0.02], "#1a252f");
  const windowGlass = box(boothGroup, [0.85, 0.45, 0.05], [-0.3, 2.2, -bD / 2], "#74b9ff");
  (windowGlass.material as THREE.MeshStandardMaterial).transparent = true;
  (windowGlass.material as THREE.MeshStandardMaterial).opacity = 0.65;

  // Pirinç Projeksiyon Namlusu (Projection Lens Barrel - Perdeye Bakar)
  const barrel = cylinder(boothGroup, 0.10, 0.14, 0.35, [-0.3, 2.2, -bD / 2 - 0.18], "#f39c12", 10);
  barrel.rotation.x = Math.PI / 2 - 0.15;
  barrel.rotation.y = -0.35;

  // Dönen Çift 35mm Pirinç Film Makaraları (Dual Spinning 35mm Film Reels)
  const reelTopGroup = new THREE.Group();
  reelTopGroup.position.set(-0.4, 1.28 + bH + 0.25, -0.2);
  boothGroup.add(reelTopGroup);

  const reelBottomGroup = new THREE.Group();
  reelBottomGroup.position.set(0.4, 1.28 + bH + 0.25, -0.2);
  boothGroup.add(reelBottomGroup);

  // Üst Makara (Supply Reel)
  cylinder(reelTopGroup, 0.38, 0.38, 0.06, [0, 0, 0], "#f1c40f", 16);
  cylinder(reelTopGroup, 0.12, 0.12, 0.08, [0, 0, 0], "#34495e", 12);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    const spoke = box(reelTopGroup, [0.04, 0.32, 0.07], [Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0], "#d4ac0d");
    spoke.rotation.z = a;
  }

  // Alt Makara (Take-up Reel)
  cylinder(reelBottomGroup, 0.38, 0.38, 0.06, [0, 0, 0], "#f1c40f", 16);
  cylinder(reelBottomGroup, 0.12, 0.12, 0.08, [0, 0, 0], "#34495e", 12);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    const spoke = box(reelBottomGroup, [0.04, 0.32, 0.07], [Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0], "#d4ac0d");
    spoke.rotation.z = a;
  }

  // =========================================================================
  // 4. ÇAPRAZ HACİMSEL PROJEKSİYON IŞIK HUZMESİ (VOLUMETRIC BEAM CONE)
  // =========================================================================
  // Kulübeden (cx + 3.5, 2.2, cz + 1.0) perde merkezine (cx, 2.4, cz - 4.3) uzanır
  const beamOrigin = new THREE.Vector3(cx + 3.5, 2.2, cz + 1.0);
  const beamTarget = new THREE.Vector3(cx, 2.4, cz - 4.3);
  const beamMid = new THREE.Vector3().addVectors(beamOrigin, beamTarget).multiplyScalar(0.5);
  const beamLength = beamOrigin.distanceTo(beamTarget);

  const beamGeo = new THREE.CylinderGeometry(0.10, 1.8, beamLength, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fffce6",
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const projectionBeam = new THREE.Mesh(beamGeo, beamMat);
  projectionBeam.position.copy(beamMid);

  // Namludan perdeye bakış rotasyonu
  const dir = new THREE.Vector3().subVectors(beamTarget, beamOrigin).normalize();
  const axis = new THREE.Vector3(0, 1, 0);
  projectionBeam.quaternion.setFromUnitVectors(axis, dir);
  // Cylinder eksenini hedefe göre çevir
  projectionBeam.rotateX(Math.PI / 2);
  group.add(projectionBeam);

  // =========================================================================
  // 5. NOSTALJİK YAZLIK ŞEZLONGLAR & GAZİNO MASALARI
  // =========================================================================
  const seatingGroup = new THREE.Group();
  seatingGroup.position.set(cx, 0, cz);
  group.add(seatingGroup);

  // 1. Sıra Şezlonglar (Perdeye Yakın Sıra - Kırmızı/Beyaz Çizgili)
  const row1Z = -1.8;
  for (const rx of [-3.2, -1.2, 0.8]) {
    const chair = new THREE.Group();
    chair.position.set(rx, 0, row1Z);
    seatingGroup.add(chair);

    // Ahşap katlanır şezlong iskeleti
    box(chair, [0.75, 0.08, 1.3], [0, 0.24, 0], "#a0522d");
    // Çizgili kumaş oturak
    box(chair, [0.65, 0.04, 1.2], [0, 0.28, 0], "#c0392b");
    box(chair, [0.65, 0.042, 0.32], [0, 0.285, 0], "#f5f6fa"); // Beyaz orta şerit
    // Eğik sırtlık başlığı
    const backrest = box(chair, [0.65, 0.04, 0.55], [0, 0.50, -0.42], "#c0392b");
    backrest.rotation.x = Math.PI / 4;
  }

  // 2. Sıra Şezlonglar (Orta Sıra - Turkuaz/Beyaz Çizgili)
  const row2Z = 0.5;
  for (const rx of [-3.2, -1.2, 0.8]) {
    const chair = new THREE.Group();
    chair.position.set(rx, 0, row2Z);
    seatingGroup.add(chair);

    box(chair, [0.75, 0.08, 1.3], [0, 0.24, 0], "#a0522d");
    box(chair, [0.65, 0.04, 1.2], [0, 0.28, 0], "#00cec9");
    box(chair, [0.65, 0.042, 0.32], [0, 0.285, 0], "#f5f6fa");
    const backrest = box(chair, [0.65, 0.04, 0.55], [0, 0.50, -0.42], "#00cec9");
    backrest.rotation.x = Math.PI / 4;
  }

  // Gazino Yuvarlak Masaları (Round Tables with Tablecloths, Gazoz, Çekirdek, Mısır)
  for (const tx of [-2.2, 1.8]) {
    const table = new THREE.Group();
    table.position.set(tx, 0, -0.7);
    seatingGroup.add(table);

    // Ayak & Masa Tablası
    cylinder(table, 0.06, 0.06, 0.65, [0, 0.32, 0], "#34495e", 6);
    cylinder(table, 0.35, 0.35, 0.06, [0, 0.03, 0], "#2c3e50", 8); // Taban
    cylinder(table, 0.65, 0.65, 0.05, [0, 0.68, 0], "#ffffff", 12); // Beyaz örtülü masa tablası

    // Yeşil Cam Gazoz Şişeleri ("Buz Gibi Çamlıca / Niğde Gazozu")
    const bottle1 = cylinder(table, 0.04, 0.05, 0.24, [-0.18, 0.82, -0.1], "#27ae60", 8);
    bottle1.castShadow = true;
    cylinder(table, 0.02, 0.02, 0.08, [-0.18, 0.96, -0.1], "#2ecc71", 6); // Dar boyun
    cylinder(table, 0.025, 0.025, 0.02, [-0.18, 1.01, -0.1], "#e74c3c", 6); // Kırmızı kapak

    const bottle2 = cylinder(table, 0.04, 0.05, 0.24, [-0.08, 0.82, -0.2], "#27ae60", 8);
    cylinder(table, 0.02, 0.02, 0.08, [-0.08, 0.96, -0.2], "#2ecc71", 6);
    cylinder(table, 0.025, 0.025, 0.02, [-0.08, 1.01, -0.2], "#e74c3c", 6);

    // Porselen Çekirdek Kasesi & Siyah Ayçekirdekleri (Sunflower Seed Bowl)
    cylinder(table, 0.16, 0.12, 0.08, [0.18, 0.74, 0.1], "#ecf0f1", 10);
    cylinder(table, 0.14, 0.14, 0.04, [0.18, 0.78, 0.1], "#2d3436", 8); // Çekirdek yığını

    // Çizgili Patlamış Mısır Kutusu (Popcorn Tub - "🍿")
    box(table, [0.16, 0.22, 0.16], [0.12, 0.81, -0.15], "#f5f6fa");
    box(table, [0.17, 0.08, 0.17], [0.12, 0.94, -0.15], "#f1c40f"); // Patlamış mısır taneleri
  }

  // =========================================================================
  // 6. RENGARENK ASILI YAZLIK AMPUL KORDONLARI (FESTOON STRING LIGHTS)
  // =========================================================================
  const bulbColors = ["#f1c40f", "#e74c3c", "#00cec9", "#2ecc71", "#e67e22", "#9b59b6"];
  const festoonBulbs: THREE.Mesh[] = [];

  for (let bi = 0; bi < 8; bi++) {
    const t = bi / 7;
    const bx = THREE.MathUtils.lerp(-4.5, 4.5, t);
    const bz = THREE.MathUtils.lerp(-2.5, 2.0, t);
    const sag = Math.sin(t * Math.PI) * 0.45;
    const by = 3.6 - sag;

    const bulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({
        color: bulbColors[bi % bulbColors.length],
        emissive: bulbColors[bi % bulbColors.length],
        emissiveIntensity: 0.8,
      }),
    );
    bulbMesh.position.set(cx + bx, by, cz + bz);
    group.add(bulbMesh);
    festoonBulbs.push(bulbMesh);
  }

  // =========================================================================
  // 7. YÜKSEK IŞIKLI NEON GİRİŞ TAKI, TABELA VE BİLET GİŞESİ
  // =========================================================================
  const entranceGroup = new THREE.Group();
  entranceGroup.position.set(cx, 0, cz + 4.8);
  group.add(entranceGroup);

  // İkili Giriş Sütunları
  box(entranceGroup, [0.65, 4.4, 0.65], [-3.4, 2.2, 0], "#ded5c2");
  box(entranceGroup, [0.65, 4.4, 0.65], [3.4, 2.2, 0], "#ded5c2");

  // Ana Tabela Alınlığı ("🎬 SAHİL AÇIK HAVA YAZLIK SİNEMASI · YILDIZ GAZİNOSU 🍿")
  const marqueeSign = label("🎬 SAHİL AÇIK HAVA YAZLIK SİNEMASI · YILDIZ GAZİNOSU 🍿");
  marqueeSign.scale.set(6.8, 0.95, 1);
  marqueeSign.position.set(0, 4.35, 0);
  marqueeSign.rotation.x = -0.06;
  entranceGroup.add(marqueeSign);

  // Alt Kurumsal Şerit ("HER AKŞAM İKİ FİLM BİRDEN · AİLELERE MAHSUSTUR · 1968")
  const subSign = label("HER AKŞAM İKİ FİLM BİRDEN · AİLELERE MAHSUSTUR · 1968");
  subSign.scale.set(6.0, 0.45, 1);
  subSign.position.set(0, 3.75, 0.05);
  entranceGroup.add(subSign);

  // Sıcak neon PointLight armatürü (Girişi ve peronu aydınlatır)
  const cinemaLight = new THREE.PointLight("#ff9f43", 2.2, 16);
  cinemaLight.position.set(cx, 3.8, cz + 4.9);
  group.add(cinemaLight);

  // Ahşap Nostaljik Bilet Gişesi (Sağ Kenar: X: cx + 4.8, Z: cz + 4.2)
  const ticketGroup = new THREE.Group();
  ticketGroup.position.set(cx + 4.8, 0, cz + 4.2);
  group.add(ticketGroup);

  box(ticketGroup, [1.6, 2.2, 1.4], [0, 1.1, 0], "#d35400"); // Ahşap gişe gövdesi
  box(ticketGroup, [1.8, 0.25, 1.6], [0, 2.3, 0], "#a04000"); // Gişe çatısı
  box(ticketGroup, [0.8, 0.5, 0.06], [0, 1.4, 0.72], "#1a252f"); // Gişe camı
  const ticketSign = label("🎟️ BİLET: 15₺ 🍿");
  ticketSign.scale.set(1.4, 0.35, 1);
  ticketSign.position.set(0, 1.95, 0.74);
  ticketGroup.add(ticketSign);

  // Tebeşirli Film Afişi Şövalesi (A-Frame Chalkboard Easel - Sol Kenar)
  const easelGroup = new THREE.Group();
  easelGroup.position.set(cx - 4.8, 0, cz + 4.2);
  group.add(easelGroup);

  box(easelGroup, [1.2, 1.6, 0.08], [0, 0.95, 0], "#2d3436"); // Karatahta
  box(easelGroup, [0.08, 1.8, 0.08], [-0.55, 0.9, 0], "#8d6e63"); // Sol ayak
  box(easelGroup, [0.08, 1.8, 0.08], [0.55, 0.9, 0], "#8d6e63");  // Sağ ayak
  const moviePoster = label("📽️ BU AKŞAM: NEŞELİ GÜNLER & SELVİ BOYLUM 🎞️");
  moviePoster.scale.set(1.5, 0.45, 1);
  moviePoster.position.set(0, 1.05, 0.06);
  easelGroup.add(moviePoster);

  // =========================================================================
  // 8. ANİMASYONLU MAKİNİST NPC — "MAKİNİST RIFAT"
  // =========================================================================
  // Rifat Sol Giriş Kaldırımında (X: cx - 2.8, Z: cz + 4.2) yer alır;
  // perona yanaşan araca doğrudan bakar ve selam verir!
  const npcGroup = new THREE.Group();
  npcGroup.position.set(RIFAT_POS.x, 0, RIFAT_POS.z);
  group.add(npcGroup);

  // Ayaklar & Botlar
  cylinder(npcGroup, 0.12, 0.14, 0.65, [-0.18, 0.32, 0], "#2c3e50", 8); // Sol bacak
  cylinder(npcGroup, 0.12, 0.14, 0.65, [0.18, 0.32, 0], "#2c3e50", 8);  // Sağ bacak

  // Gövde (Kıvrık kollu beyaz gömlek + lacivert askılı pantolon)
  const torso = box(npcGroup, [0.62, 0.85, 0.44], [0, 1.05, 0], "#ffffff");
  torso.castShadow = true;
  // Pantolon askıları (Dark navy suspenders)
  box(npcGroup, [0.08, 0.82, 0.04], [-0.18, 1.05, 0.22], "#2c3e50");
  box(npcGroup, [0.08, 0.82, 0.04], [0.18, 1.05, 0.22], "#2c3e50");

  // Kafa & Boyun Pivotu
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.52, 0);
  npcGroup.add(headPivot);

  // Kafa
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), mat("#f8c291"));
  headMesh.position.set(0, 0.14, 0);
  headPivot.add(headMesh);

  // Nostaljik Basın Kasketi (Newsboy Flat Cap)
  cylinder(headPivot, 0.22, 0.22, 0.12, [0, 0.26, 0], "#34495e", 10);
  const capBrim = box(headPivot, [0.26, 0.04, 0.18], [0, 0.22, 0.15], "#2c3e50");
  capBrim.rotation.x = 0.2;

  // İnce Kıvrık Makinist Bıyığı
  const stacheL = cylinder(headPivot, 0.03, 0.012, 0.16, [-0.08, 0.10, 0.17], "#1a252f", 6);
  stacheL.rotation.z = -Math.PI / 3;
  const stacheR = cylinder(headPivot, 0.03, 0.012, 0.16, [0.08, 0.10, 0.17], "#1a252f", 6);
  stacheR.rotation.z = Math.PI / 3;

  // Sol Kol (Belinde destek pozu)
  const armL = cylinder(npcGroup, 0.075, 0.065, 0.55, [-0.36, 1.05, 0.05], "#ffffff", 6);
  armL.rotation.x = 0.3;
  armL.rotation.z = 0.25;

  // Sağ Kol Pivotu (35mm Film Makarasını Kaldırarak Selamlama Animasyonu)
  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.38, 1.35, 0);
  npcGroup.add(armRPivot);

  cylinder(armRPivot, 0.075, 0.065, 0.55, [0, -0.25, 0.1], "#ffffff", 6);

  // Sağ Elde Tutulan 35mm Pirinç Film Kutusu / Makarası (Film canister)
  const handCanister = cylinder(armRPivot, 0.18, 0.18, 0.08, [0, -0.55, 0.2], "#f1c40f", 12);
  handCanister.rotation.x = Math.PI / 3;

  // 3D Konuşma Balonu & Karşılama Etiketi
  const speechBubble = label(RIFAT_CALLOUTS[0]);
  speechBubble.scale.set(5.4, 0.9, 1);
  speechBubble.position.set(0, 2.35, 0);
  speechBubble.visible = false;
  npcGroup.add(speechBubble);

  // =========================================================================
  // 9. ENGEL ALANLARI (Obstacles - Yollar ve Yanaşma Peronu Açık Kalır)
  // =========================================================================
  // Perde yapısı: minX: cx - 4.4, maxX: cx + 4.4, minZ: cz - 5.2, maxZ: cz - 3.8
  obstacles.push({
    minX: cx - 4.4,
    maxX: cx + 4.4,
    minZ: cz - 5.2,
    maxZ: cz - 3.8,
  });

  // Makinist kulesi (Doğu kenarı): minX: cx + 2.5, maxX: cx + 5.1, minZ: cz + 0.1, maxZ: cz + 2.4
  obstacles.push({
    minX: cx + 2.5,
    maxX: cx + 5.1,
    minZ: cz + 0.1,
    maxZ: cz + 2.4,
  });

  // Sol şövale & sağ gişe engelleri
  obstacles.push({
    minX: cx - 5.6,
    maxX: cx - 4.0,
    minZ: cz + 3.4,
    maxZ: cz + 4.8,
  });
  obstacles.push({
    minX: cx + 4.0,
    maxX: cx + 5.6,
    minZ: cz + 3.4,
    maxZ: cz + 4.8,
  });

  let speechTimer = 0;
  let waveTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: CinemaState | boolean,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      let state: CinemaState | undefined;
      let night = false;

      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
        night = Boolean(isNightOrDusk);
      }

      // Gece ışık ve projektör huzmesi yoğunluğu
      cinemaLight.intensity = night ? 3.6 : 1.8;
      screenGlowLight.intensity = night ? 2.8 : 1.2;

      // Projektör huzmesi opaklığı ve mikro titremesi
      const flicker = Math.sin((state?.projectorFlickerPhase ?? 0) * 1.5) * 0.06;
      beamMat.opacity = Math.max(0.12, (night ? 0.42 : 0.22) + flicker);

      // Film makaralarının dönüşü
      if (state) {
        reelTopGroup.rotation.z = state.filmReelPhase;
        reelBottomGroup.rotation.z = -state.filmReelPhase * 1.1;
      } else {
        reelTopGroup.rotation.z += dt * 4.5;
        reelBottomGroup.rotation.z -= dt * 5.0;
      }

      // Festoon ampullerinin gece parlaması
      const bulbIntensity = night ? 1.6 : 0.6;
      for (const bulb of festoonBulbs) {
        (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = bulbIntensity;
      }

      const pPos = playerPos ?? { x: 0, z: 0 };
      const distToNpc = Math.hypot(pPos.x - RIFAT_POS.x, pPos.z - RIFAT_POS.z);

      // Kafa ve gövde takibi (22 metre mesafeden)
      if (distToNpc < 22.0) {
        const targetAngle = Math.atan2(pPos.x - RIFAT_POS.x, pPos.z - RIFAT_POS.z);
        let diff = targetAngle - npcGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        npcGroup.rotation.y += diff * Math.min(1, dt * 3.5);
      } else {
        npcGroup.rotation.y = THREE.MathUtils.lerp(npcGroup.rotation.y, 0, dt * 2.0);
      }

      // Konuşma balonu ve selamlama sayacı
      if (state?.honkGreetingTimer && state.honkGreetingTimer > 0) {
        speechTimer = state.honkGreetingTimer;
        waveTimer = state.honkGreetingTimer;
        if (state.lastHonkCallout) {
          speechBubble.visible = true;
        }
      }

      if (speechTimer > 0) {
        speechTimer -= dt;
        speechBubble.visible = true;
      } else {
        speechBubble.visible = false;
      }

      // Sağ kol makara kaldırma / el sallama animasyonu
      if (waveTimer > 0) {
        waveTimer -= dt;
        armRPivot.rotation.x = -Math.PI / 2 + Math.sin(waveTimer * 12.0) * 0.45;
        armRPivot.rotation.z = 0.35 + Math.cos(waveTimer * 10.0) * 0.2;
      } else {
        armRPivot.rotation.x = THREE.MathUtils.lerp(armRPivot.rotation.x, 0, dt * 4.0);
        armRPivot.rotation.z = THREE.MathUtils.lerp(armRPivot.rotation.z, 0, dt * 4.0);
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - RIFAT_POS.x, playerPos.z - RIFAT_POS.z);
      if (dist < 26.0) {
        speechTimer = 4.0;
        waveTimer = 4.0;
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
