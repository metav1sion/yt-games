import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Rect } from "../game/types";
import {
  TRAM_LINE_Z,
  TRAM_MIN_X,
  TRAM_MAX_X,
  TRAM_STATION_POS,
  TRAM_LENGTH,
  TRAM_WIDTH,
  type TramState,
} from "../game/tram";

export type TramView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: TramState,
    playerPos?: { x: number; z: number },
    isNightOrDusk?: boolean,
  ): void;
  dispose(): void;
};

/**
 * 🚋 TARİHİ ÇARŞI TRAMVAY HATTI & NOSTALJİK TRAMVAY (Historic Çarşı Tramway Heritage Line)
 * - Çarşı Bölgesi ana caddesi (Z: 34.0) boyunca X: 16.0 .. 82.0 arasında uzanan gömme ray hattı
 * - 6 adet ferforje katener havai hat direği ve Y: 4.2m bakır temas teli
 * - Tarihi Çarşı Tramvay Durağı (X: 48.0, Z: 37.8): yükseltilmiş ahşap peron, yeşil sundurma, nostaljik hat tabelası, durak direği ve bekleyen yolcu NPC
 * - İETT 1923 Beyoğlu nostaljik tramvay replikası:
 *   - Bordo gövde (#c0392b), krem cam kuşağı (#fdfefe), fener çatılı ahşap tavan
 *   - İki uçta açık makinist sahanlığı, pirinç el freni çarkı ve kontrol kolu
 *   - Katenere uzanan pirinç/çelik elmas pantograf mekanizması
 *   - Aydınlatılmış cam hat tabelası: "T2 NOSTALJİK TRAMVAY · ÇARŞI - İSKELE"
 *   - Gece ışıması artan vintage pirinç ön/arka farlar ve sıcak iç aydınlatma
 *   - Aktif yöne geçen Vatman İhsan Efendi NPC'si (korna çalındığında el sallar)
 *   - Dinamik konuşma balonu ve pantograf ark kıvılcımları
 */
export function createTramView(): TramView {
  const group = new THREE.Group();
  group.name = "carsi-heritage-tram";

  const disposables: { dispose(): void }[] = [];
  const obstacles: Rect[] = [];

  // =========================================================================
  // 1. GÖMME ÇELİK RAY HATTI & TAMPONLAR (Embedded Steel Rail Track & Bumpers)
  // =========================================================================
  const trackGroup = new THREE.Group();
  group.add(trackGroup);

  const railMat = new THREE.MeshStandardMaterial({
    color: "#b0bec5",
    metalness: 0.85,
    roughness: 0.25,
  });
  disposables.push(railMat);

  const trackStartX = TRAM_MIN_X - 0.5; // ~15.5
  const trackEndX = TRAM_MAX_X + 0.5; // ~82.5
  const trackLength = trackEndX - trackStartX; // 67m
  const trackCenterX = (trackStartX + trackEndX) / 2; // 49m

  // Kuzey ve Güney rayları (1.3m ray açıklığı - meter/narrow gauge)
  const railGeom = new THREE.BoxGeometry(trackLength, 0.05, 0.12);
  disposables.push(railGeom);

  const northRail = new THREE.Mesh(railGeom, railMat);
  northRail.position.set(trackCenterX, 0.125, TRAM_LINE_Z - 0.65);
  northRail.receiveShadow = true;
  trackGroup.add(northRail);

  const southRail = new THREE.Mesh(railGeom, railMat);
  southRail.position.set(trackCenterX, 0.125, TRAM_LINE_Z + 0.65);
  southRail.receiveShadow = true;
  trackGroup.add(southRail);

  // Ray aralarında gömme granit/ahşap travers plakaları (Her 2.2 metrede bir)
  const sleeperMat = mat("#57606f", 0.8);
  disposables.push(sleeperMat);
  for (let sx = trackStartX + 1.0; sx <= trackEndX - 1.0; sx += 2.2) {
    box(trackGroup, [0.38, 0.03, 1.8], [sx, 0.095, TRAM_LINE_Z], "#57606f");
  }

  // Hat sonu emniyet tamponları (Terminus Buffer Stops) at X: 15.5 and X: 82.5
  for (const bx of [trackStartX, trackEndX]) {
    const bumperGroup = new THREE.Group();
    bumperGroup.position.set(bx, 0, TRAM_LINE_Z);
    trackGroup.add(bumperGroup);

    // Ağır çelik gövde
    box(bumperGroup, [0.75, 0.7, 1.9], [0, 0.38, 0], "#2d3436");
    // Sarı-Siyah diyagonal emniyet kirişi
    box(bumperGroup, [0.8, 0.28, 1.85], [0, 0.45, 0], "#f1c40f");
    box(bumperGroup, [0.82, 0.28, 0.22], [0, 0.45, -0.45], "#2d3436");
    box(bumperGroup, [0.82, 0.28, 0.22], [0, 0.45, 0.45], "#2d3436");

    // İkiz kırmızı kedi gözü reflektörler
    cylinder(bumperGroup, 0.1, 0.1, 0.05, [bx > 50 ? -0.42 : 0.42, 0.45, -0.55], "#e74c3c", 8);
    cylinder(bumperGroup, 0.1, 0.1, 0.05, [bx > 50 ? -0.42 : 0.42, 0.45, 0.55], "#e74c3c", 8);

    // Tampon engeli
    obstacles.push({
      minX: bx - 0.5,
      maxX: bx + 0.5,
      minZ: TRAM_LINE_Z - 1.0,
      maxZ: TRAM_LINE_Z + 1.0,
    });
  }

  // =========================================================================
  // 2. KATENER HAVAI HAT VE DİREKLERİ (Catenary Masts & Contact Wire)
  // =========================================================================
  const catenaryGroup = new THREE.Group();
  group.add(catenaryGroup);

  const mastMat = mat("#1e272e", 0.6);
  disposables.push(mastMat);

  const mastXPositions = [16, 29, 42, 55, 68, 82];
  const mastZ = 37.35; // Kaldırım kenarı
  const wireY = 4.2; // Temas teli yüksekliği

  for (const mx of mastXPositions) {
    const mast = new THREE.Group();
    mast.position.set(mx, 0, mastZ);
    catenaryGroup.add(mast);

    // Döküm kaide & dikey çelik direk
    cylinder(mast, 0.18, 0.22, 0.6, [0, 0.3, 0], "#2f3542", 8);
    cylinder(mast, 0.11, 0.14, 4.2, [0, 2.4, 0], "#1e272e", 8);

    // Dekoratif ferforje süs halkası
    cylinder(mast, 0.16, 0.16, 0.12, [0, 3.8, 0], "#d6a2e8", 8);

    // Yola doğru uzanan kemerli konsol kolu (Cantilever bracket reaching over track)
    const armLength = mastZ - TRAM_LINE_Z; // ~3.35m
    box(mast, [0.08, 0.08, armLength], [0, wireY + 0.15, -armLength / 2], "#2f3542");
    // Çapraz destek gergisi
    box(mast, [0.06, 0.06, armLength * 0.7], [0, wireY + 0.5, -armLength * 0.45], "#1e272e");

    // Beyaz seramik yalıtkan izolatör fincanı
    cylinder(mast, 0.06, 0.08, 0.22, [0, wireY + 0.08, -armLength], "#f5f6fa", 8);
  }

  // Boydan boya uzanan bakır temas teli (Catenary copper wire)
  const wireGeom = new THREE.CylinderGeometry(0.016, 0.016, trackLength, 6);
  const wireMat = new THREE.MeshStandardMaterial({
    color: "#e67e22",
    metalness: 0.9,
    roughness: 0.3,
  });
  disposables.push(wireGeom, wireMat);

  const contactWire = new THREE.Mesh(wireGeom, wireMat);
  contactWire.rotation.z = Math.PI / 2;
  contactWire.position.set(trackCenterX, wireY, TRAM_LINE_Z);
  catenaryGroup.add(contactWire);

  // =========================================================================
  // 3. TARİHİ ÇARŞI TRAMVAY DURAĞI (Historic Çarşı Tram Station)
  // =========================================================================
  const stationGroup = new THREE.Group();
  stationGroup.position.set(TRAM_STATION_POS.x, 0, TRAM_STATION_POS.z);
  group.add(stationGroup);

  // Yükseltilmiş ahşap ve taş peron (Raised Station Platform: 8.5m x 2.2m)
  // Taş kaide
  box(stationGroup, [8.8, 0.14, 2.3], [0, 0.08, 0], "#747d8c");
  // Ahşap güverte tahtaları
  box(stationGroup, [8.5, 0.12, 2.2], [0, 0.21, 0], "#8c6239");
  // Ray tarafı sarı tırtıklı kabartmalı emniyet çizgisi (Tactile warning strip)
  box(stationGroup, [8.5, 0.02, 0.2], [0, 0.28, -1.0], "#f1c40f");

  // İki uçta engelli/yolcu rampası
  const rampL = box(stationGroup, [1.2, 0.08, 2.2], [-4.8, 0.1, 0], "#747d8c");
  rampL.rotation.z = 0.14;
  const rampR = box(stationGroup, [1.2, 0.08, 2.2], [4.8, 0.1, 0], "#747d8c");
  rampR.rotation.z = -0.14;

  // Nostaljik İstasyon Sundurması (Victorian Canopy Shelter)
  const canopyZ = 0.3;
  // 4 Döküm demir sütun
  for (const cx of [-2.8, -0.9, 0.9, 2.8]) {
    cylinder(stationGroup, 0.07, 0.09, 2.6, [cx, 1.45, canopyZ - 0.7], "#1b4332", 8);
    cylinder(stationGroup, 0.07, 0.09, 2.6, [cx, 1.45, canopyZ + 0.7], "#1b4332", 8);
  }
  // Ahşap tavan kirişleri
  box(stationGroup, [6.4, 0.14, 1.8], [0, 2.8, canopyZ], "#402914");
  // Yeşil metal tonoz çatı
  const roof = cylinder(stationGroup, 1.4, 1.4, 6.6, [0, 3.1, canopyZ], "#2d6a4f", 12);
  roof.rotation.z = Math.PI / 2;
  roof.scale.set(1, 0.28, 1);

  // Sundurma içi nostaljik hat güzergah panosu ("İETT NOSTALJİK TRAMVAY HATTI")
  box(stationGroup, [2.4, 0.8, 0.08], [0, 1.9, canopyZ + 0.75], "#f5f6fa");
  const stationSign = label("T2 NOSTALJİK TRAMVAY · ÇARŞI MEYDANI");
  stationSign.position.set(0, 1.9, canopyZ + 0.8);
  stationSign.scale.set(2.2, 0.65, 1);
  stationGroup.add(stationSign);

  // Ahşap bekleme bankı
  box(stationGroup, [2.2, 0.08, 0.45], [0, 0.55, canopyZ + 0.3], "#a0522d");
  box(stationGroup, [2.2, 0.45, 0.06], [0, 0.8, canopyZ + 0.5], "#8b4513");
  cylinder(stationGroup, 0.03, 0.03, 0.4, [-0.9, 0.38, canopyZ + 0.3], "#2d3436", 6);
  cylinder(stationGroup, 0.03, 0.03, 0.4, [0.9, 0.38, canopyZ + 0.3], "#2d3436", 6);

  // Kırmızı-Beyaz Nostaljik Durak Tabelası Direği
  cylinder(stationGroup, 0.05, 0.06, 2.8, [3.8, 1.45, -0.6], "#2f3542", 8);
  cylinder(stationGroup, 0.35, 0.35, 0.06, [3.8, 2.5, -0.6], "#e74c3c", 16);
  cylinder(stationGroup, 0.26, 0.26, 0.07, [3.8, 2.5, -0.6], "#ffffff", 16);
  box(stationGroup, [0.55, 0.16, 0.08], [3.8, 2.5, -0.6], "#2c3e50");
  const stopSignText = label("DURAK · T2");
  stopSignText.position.set(3.8, 2.5, -0.55);
  stopSignText.scale.set(0.65, 0.32, 1);
  stationGroup.add(stopSignText);

  // Sundurma altı nostaljik fener
  const lanternMat = new THREE.MeshStandardMaterial({
    color: "#ffa834",
    emissive: "#ffa834",
    emissiveIntensity: 0.9,
  });
  disposables.push(lanternMat);
  const lanternGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lanternMat);
  lanternGlobe.position.set(0, 2.65, canopyZ);
  stationGroup.add(lanternGlobe);
  disposables.push(lanternGlobe.geometry);

  // Bekleyen Yolcu NPC ("Güleryüzlü Yolcu")
  const passengerGroup = new THREE.Group();
  passengerGroup.position.set(0.5, 0.28, canopyZ + 0.3);
  stationGroup.add(passengerGroup);

  box(passengerGroup, [0.32, 0.38, 0.28], [0, 0.4, 0], "#4b6584"); // Gövde
  box(passengerGroup, [0.12, 0.35, 0.35], [-0.08, 0.18, 0.1], "#2c3e50"); // Bacaklar
  box(passengerGroup, [0.12, 0.35, 0.35], [0.08, 0.18, 0.1], "#2c3e50");
  const passHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat("#fed330", 0.6));
  passHead.position.set(0, 0.72, 0);
  passengerGroup.add(passHead);
  disposables.push(passHead.geometry);
  // Gazete / Çanta
  box(passengerGroup, [0.22, 0.18, 0.05], [0, 0.46, 0.18], "#d1d8e0");

  // İstasyon platform engeli
  obstacles.push({
    minX: TRAM_STATION_POS.x - 3.2,
    maxX: TRAM_STATION_POS.x + 3.2,
    minZ: TRAM_STATION_POS.z - 1.0,
    maxZ: TRAM_STATION_POS.z + 1.1,
  });

  // =========================================================================
  // 4. NOSTALJİK TRAMVAY MODELİ (Historic Istanbul T2 Nostalgic Streetcar)
  // =========================================================================
  const tramGroup = new THREE.Group();
  tramGroup.name = "nostalgic-tram-car";
  tramGroup.position.set(TRAM_MIN_X + 15, 0, TRAM_LINE_Z);
  group.add(tramGroup);

  const L = TRAM_LENGTH; // 5.4m
  const W = TRAM_WIDTH; // 2.0m

  // Materyaller
  const tramRed = mat("#c0392b", 0.3); // Orijinal Beyoğlu tramvay kırmızısı
  const tramCream = mat("#fdfefe", 0.4); // Krem pencere kuşağı
  const tramDark = mat("#2d3436", 0.7); // Şasi ve çelik parçalar
  const tramWood = mat("#8c6239", 0.6); // Ahşap tavan ve çıtalar
  const brassMat = new THREE.MeshStandardMaterial({
    color: "#f39c12",
    metalness: 0.85,
    roughness: 0.25,
  });

  const windowLitMat = new THREE.MeshStandardMaterial({
    color: "#f6e58d",
    emissive: "#f6e58d",
    emissiveIntensity: 0.4,
    roughness: 0.2,
  });

  const headlampMat = new THREE.MeshStandardMaterial({
    color: "#fff9d2",
    emissive: "#fff9d2",
    emissiveIntensity: 0.7,
    roughness: 0.1,
  });

  disposables.push(tramRed, tramCream, tramDark, tramWood, brassMat, windowLitMat, headlampMat);

  // 4.1. Şasi & Tekerlek Bojileri (Chassis & Wheel Bogies)
  box(tramGroup, [L - 0.4, 0.24, W - 0.2], [0, 0.32, 0], "#2d3436");

  // Ön ve Arka Karasaban / Yol Temizleyici Izgara (Pilot Cowcatcher Grill)
  for (const cx of [-L / 2 + 0.15, L / 2 - 0.15]) {
    box(tramGroup, [0.15, 0.22, W - 0.3], [cx, 0.18, 0], "#636e72");
    // Emniyet demirleri
    cylinder(tramGroup, 0.03, 0.03, W - 0.4, [cx, 0.12, 0], "#2d3436", 6);
  }

  // 4 Adet Çelik Flanşlı Ray Tekerleği
  const wheelOffsets = [
    [-1.5, -0.65],
    [-1.5, 0.65],
    [1.5, -0.65],
    [1.5, 0.65],
  ];
  for (const [wx, wz] of wheelOffsets) {
    const wheel = cylinder(tramGroup, 0.24, 0.24, 0.12, [wx, 0.24, wz], "#747d8c", 10);
    wheel.rotation.x = Math.PI / 2;
    // Jant flanşı
    const flange = cylinder(tramGroup, 0.27, 0.27, 0.03, [wx, 0.24, wz + (wz > 0 ? -0.06 : 0.06)], "#57606f", 10);
    flange.rotation.x = Math.PI / 2;
  }

  // 4.2. Gövde Alt Paneli (Bordo Crimson Red Lower Hull)
  // Kapalı yolcu kabini uzunluğu: 3.6m
  const cabinL = 3.6;
  box(tramGroup, [cabinL, 0.85, W], [0, 0.85, 0], "#c0392b");

  // Sarı süs şeridi / kuşak
  box(tramGroup, [cabinL + 0.02, 0.06, W + 0.02], [0, 1.28, 0], "#f1c40f");

  // 4.3. Krem Pencere Kuşağı & Camlar (Window Tier)
  box(tramGroup, [cabinL, 0.95, W - 0.06], [0, 1.75, 0], "#fdfefe");

  // Yan pencereler (Her iki tarafta 4'er aydınlatılmış pencere)
  for (const pz of [-W / 2 - 0.01, W / 2 + 0.01]) {
    for (let i = 0; i < 4; i++) {
      const px = -cabinL / 2 + 0.5 + i * 0.86;
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.03), windowLitMat);
      win.position.set(px, 1.8, pz);
      tramGroup.add(win);
      disposables.push(win.geometry);

      // Ahşap pencere çıtası
      box(tramGroup, [0.04, 0.65, 0.04], [px, 1.8, pz], "#8c6239");
      box(tramGroup, [0.65, 0.04, 0.04], [px, 1.8, pz], "#8c6239");
    }
  }

  // 4.4. Fener Çatı / Ahşap Tonoz Tavan (Clerestory Curved Roof)
  // Ana tavan gövdesi
  box(tramGroup, [cabinL + 0.2, 0.16, W + 0.1], [0, 2.3, 0], "#c0392b");
  // Yükseltilmiş fener çatı (Monitor clerestory vents)
  box(tramGroup, [cabinL - 0.4, 0.22, W - 0.6], [0, 2.45, 0], "#fdfefe");
  const roofTop = cylinder(tramGroup, (W - 0.5) / 2, (W - 0.5) / 2, cabinL - 0.3, [0, 2.6, 0], "#95a5a6", 12);
  roofTop.rotation.z = Math.PI / 2;
  roofTop.scale.set(1, 0.35, 1);

  // 4.5. Açık Makinist Sahanlıkları (Open Front & Rear Vestibules)
  const platforms = [-L / 2 + 0.45, L / 2 - 0.45];
  for (const vx of platforms) {
    const isEast = vx > 0;
    // Taban ahşap ızgarası
    box(tramGroup, [0.85, 0.1, W - 0.1], [vx, 0.45, 0], "#8c6239");
    // Ön/arka kavisli demir korkuluk
    box(tramGroup, [0.08, 0.75, W - 0.2], [vx + (isEast ? 0.4 : -0.4), 0.85, 0], "#2d3436");
    // Yan güvenlik kapıları / korkuluk
    box(tramGroup, [0.8, 0.75, 0.06], [vx, 0.85, -W / 2 + 0.08], "#2d3436");
    box(tramGroup, [0.8, 0.75, 0.06], [vx, 0.85, W / 2 - 0.08], "#2d3436");

    // Pirinç tutamak el rayı
    cylinder(tramGroup, 0.03, 0.03, W - 0.1, [vx + (isEast ? 0.4 : -0.4), 1.25, 0], "#f39c12", 8);

    // Pirinç Vatman Kontrol Kolu & El Freni Çarkı (Rheostat Controller & Handbrake)
    cylinder(tramGroup, 0.08, 0.1, 0.75, [vx + (isEast ? 0.15 : -0.15), 0.85, 0.35], "#2f3542", 8);
    cylinder(tramGroup, 0.16, 0.16, 0.04, [vx + (isEast ? 0.15 : -0.15), 1.25, 0.35], "#f39c12", 8);

    // Klasik Pirinç Yuvarlak Ön Fener (Vintage Headlamp)
    cylinder(tramGroup, 0.16, 0.2, 0.22, [vx + (isEast ? 0.45 : -0.45), 1.15, 0], "#f39c12", 10);
    const headlamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), headlampMat);
    headlamp.position.set(vx + (isEast ? 0.52 : -0.52), 1.15, 0);
    tramGroup.add(headlamp);
    disposables.push(headlamp.geometry);

    // Kırmızı köşe stop fenerleri
    cylinder(tramGroup, 0.05, 0.05, 0.08, [vx + (isEast ? 0.42 : -0.42), 1.35, -0.75], "#e74c3c", 8);
    cylinder(tramGroup, 0.05, 0.05, 0.08, [vx + (isEast ? 0.42 : -0.42), 1.35, 0.75], "#e74c3c", 8);

    // Hat Işıklı Tabela Kasası ("T2 NOSTALJİK TRAMVAY")
    box(tramGroup, [0.15, 0.26, 1.1], [vx + (isEast ? 0.2 : -0.2), 2.22, 0], "#1a252f");
    const routeSign = label("T2 NOSTALJİK TRAMVAY");
    routeSign.position.set(vx + (isEast ? 0.28 : -0.28), 2.22, 0);
    routeSign.scale.set(0.9, 0.3, 1);
    tramGroup.add(routeSign);
  }

  // 4.6. Çelik & Pirinç Elmas Pantograf (Diamond Pantograph)
  const pantographGroup = new THREE.Group();
  pantographGroup.position.set(0, 2.65, 0);
  tramGroup.add(pantographGroup);

  // Kaide
  box(pantographGroup, [0.6, 0.08, 0.6], [0, 0.04, 0], "#2d3436");
  for (const cx of [-0.22, 0.22]) {
    for (const cz of [-0.22, 0.22]) {
      cylinder(pantographGroup, 0.04, 0.04, 0.1, [cx, 0.09, cz], "#f5f6fa", 6);
    }
  }

  // Alt kollar (Y: 2.65 -> 3.4)
  const armL1 = cylinder(pantographGroup, 0.025, 0.025, 0.85, [-0.18, 0.42, 0], "#747d8c", 6);
  armL1.rotation.z = -0.35;
  const armR1 = cylinder(pantographGroup, 0.025, 0.025, 0.85, [0.18, 0.42, 0], "#747d8c", 6);
  armR1.rotation.z = 0.35;

  // Üst kollar (Y: 3.4 -> 4.2)
  const armL2 = cylinder(pantographGroup, 0.022, 0.022, 0.9, [-0.12, 1.15, 0], "#747d8c", 6);
  armL2.rotation.z = 0.28;
  const armR2 = cylinder(pantographGroup, 0.022, 0.022, 0.9, [0.12, 1.15, 0], "#747d8c", 6);
  armR2.rotation.z = -0.28;

  // En üst temas pabucu (Copper contact slider shoe at Y: 4.2m)
  const sliderShoe = box(pantographGroup, [0.12, 0.05, 1.1], [0, 1.54, 0], "#e67e22");
  cylinder(pantographGroup, 0.03, 0.03, 0.16, [0, 1.52, -0.55], "#2d3436", 6);
  cylinder(pantographGroup, 0.03, 0.03, 0.16, [0, 1.52, 0.55], "#2d3436", 6);

  // 4.7. Vatman İhsan Efendi NPC (Driver NPC)
  const driverGroup = new THREE.Group();
  tramGroup.add(driverGroup);

  // Koyu lacivert üniforma ceket (#1a365d)
  box(driverGroup, [0.32, 0.42, 0.32], [0, 1.25, 0], "#1a365d");
  // Altın sarısı pirinç düğmeler
  for (const by of [1.18, 1.28, 1.38]) {
    cylinder(driverGroup, 0.02, 0.02, 0.04, [0.16, by, 0], "#f1c40f", 6);
  }
  // Pantolon
  box(driverGroup, [0.13, 0.48, 0.28], [0, 0.8, -0.07], "#0f172a");
  box(driverGroup, [0.13, 0.48, 0.28], [0, 0.8, 0.07], "#0f172a");

  // Kafa & Bıyıklı Vatman Yüzü
  const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), mat("#fed330", 0.6));
  driverHead.position.set(0, 1.58, 0);
  driverGroup.add(driverHead);
  disposables.push(driverHead.geometry);
  // Siyah pala bıyık
  box(driverGroup, [0.08, 0.04, 0.12], [0.11, 1.55, 0], "#1e272e");

  // Vatman Kasketi / Kondüktör Şapkası (Navy cap with visor)
  cylinder(driverGroup, 0.16, 0.14, 0.08, [0, 1.68, 0], "#1a365d", 8);
  box(driverGroup, [0.14, 0.03, 0.18], [0.08, 1.66, 0], "#2d3436"); // Siperlik
  // Şapka kokartı
  cylinder(driverGroup, 0.025, 0.025, 0.03, [0.11, 1.7, 0], "#f1c40f", 6);

  // Sağ Kol (Selamlama için dönebilir)
  const rightArm = new THREE.Group();
  rightArm.position.set(0, 1.4, 0.19);
  driverGroup.add(rightArm);
  cylinder(rightArm, 0.05, 0.06, 0.35, [0, -0.15, 0], "#1a365d", 6);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), mat("#fed330", 0.6));
  hand.position.set(0, -0.32, 0);
  rightArm.add(hand);
  disposables.push(hand.geometry);

  // Sol kol (Kontrol kolunu tutar)
  const leftArm = cylinder(driverGroup, 0.05, 0.06, 0.35, [0.08, 1.25, -0.19], "#1a365d", 6);
  leftArm.rotation.x = -0.35;

  // 4.8. 3B Konuşma Balonu (Floating Speech Bubble)
  const hasDocument = typeof document !== "undefined";
  const bubbleCanvas = hasDocument ? document.createElement("canvas") : null;
  if (bubbleCanvas) {
    bubbleCanvas.width = 512;
    bubbleCanvas.height = 128;
  }
  const bubbleCtx = bubbleCanvas ? bubbleCanvas.getContext("2d") : null;

  const bubbleTexture = bubbleCanvas ? new THREE.CanvasTexture(bubbleCanvas) : null;
  const bubbleMat = bubbleTexture
    ? new THREE.SpriteMaterial({
        map: bubbleTexture,
        transparent: true,
        opacity: 0,
        depthTest: false,
      })
    : null;
  if (bubbleTexture) disposables.push(bubbleTexture);
  if (bubbleMat) disposables.push(bubbleMat);

  const speechSprite = bubbleMat ? new THREE.Sprite(bubbleMat) : new THREE.Sprite();
  speechSprite.position.set(0, 4.8, 0);
  speechSprite.scale.set(4.8, 1.2, 1);
  tramGroup.add(speechSprite);

  let currentCallout = "";

  function renderSpeechBubble(text: string, opacity: number) {
    if (!bubbleCtx || !bubbleMat || !bubbleTexture) return;
    bubbleMat.opacity = opacity;
    if (text === currentCallout && opacity > 0) return;
    currentCallout = text;

    bubbleCtx.clearRect(0, 0, 512, 128);
    if (!text || opacity <= 0) {
      bubbleTexture.needsUpdate = true;
      return;
    }

    // Balon zemin kutusu
    bubbleCtx.fillStyle = "rgba(255, 255, 255, 0.94)";
    bubbleCtx.strokeStyle = "#c0392b";
    bubbleCtx.lineWidth = 5;
    bubbleCtx.beginPath();
    bubbleCtx.roundRect(12, 12, 488, 92, 18);
    bubbleCtx.fill();
    bubbleCtx.stroke();

    // Alt ok üçgeni
    bubbleCtx.fillStyle = "#ffffff";
    bubbleCtx.beginPath();
    bubbleCtx.moveTo(240, 104);
    bubbleCtx.lineTo(256, 122);
    bubbleCtx.lineTo(272, 104);
    bubbleCtx.fill();

    // Metin
    bubbleCtx.fillStyle = "#1e272e";
    bubbleCtx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    bubbleCtx.textAlign = "center";
    bubbleCtx.textBaseline = "middle";
    bubbleCtx.fillText(text, 256, 58);

    bubbleTexture.needsUpdate = true;
  }

  let waveTime = 0;

  return {
    group,
    obstacles,
    update(dt, state, playerPos, isNightOrDusk) {
      // 1. Tramvay vagon pozisyonu ve rotasyonu
      tramGroup.position.x = state.position.x;
      tramGroup.position.z = state.position.z;

      // 2. Makinist İhsan'ın platformu ve yönü (Gidiş yönüne göre ön sahanlıkta durur)
      const targetPlatformX = state.direction === 1 ? L / 2 - 0.45 : -L / 2 + 0.45;
      driverGroup.position.x = targetPlatformX;
      driverGroup.rotation.y = state.direction === 1 ? 0 : Math.PI;

      // 3. Makinist selamlama animasyonu (El sallama)
      if (state.honkGreetingTimer > 0) {
        waveTime += dt * 9.0;
        rightArm.rotation.x = -Math.PI * 0.7 + Math.sin(waveTime) * 0.4;
        rightArm.rotation.z = Math.sin(waveTime * 1.5) * 0.25;
      } else {
        waveTime = 0;
        rightArm.rotation.set(0, 0, 0);
      }

      // 4. Konuşma balonu güncellemesi
      if (state.lastHonkCallout && state.honkGreetingTimer > 0) {
        const bubbleOpacity = Math.min(1, state.honkGreetingTimer * 2.0);
        renderSpeechBubble(state.lastHonkCallout, bubbleOpacity);
      } else {
        renderSpeechBubble("", 0);
      }

      // 5. Gece / Alacakaranlık Aydınlatması (Night Emissive Lighting)
      const emissiveBoost = isNightOrDusk ? 1.6 : 0.6;
      headlampMat.emissiveIntensity = 0.8 * emissiveBoost;
      lanternMat.emissiveIntensity = 1.0 * emissiveBoost;
      windowLitMat.emissiveIntensity = 0.6 * emissiveBoost;

      // Hafif ray sarsıntısı efekti (Seyir halindeyken)
      if (state.speed > 0.5) {
        tramGroup.position.y = Math.sin(state.position.x * 6.0) * 0.012;
      } else {
        tramGroup.position.y = 0;
      }
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      group.clear();
    },
  };
}
