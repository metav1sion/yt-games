import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Rect } from "../game/types";
import {
  TRAIN_LINE_Z,
  TRAIN_MIN_X,
  TRAIN_MAX_X,
  TRAIN_CROSSING_X,
  TRAIN_SIDING_POS,
  TRAIN_LENGTH,
  TRAIN_WIDTH,
  GATE_OPEN_ANGLE,
  type TrainState,
} from "../game/train";

export type TrainView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: TrainState,
    playerPos?: { x: number; z: number },
    isNightOrDusk?: boolean,
  ): void;
  dispose(): void;
};

/**
 * 🚂 SANAYİ BÖLGESİ AĞIR DEMİRYOLU MANEVRA HATTI & DİZEL LOKOMOTİF (Industrial Freight Rail Spur & Shunting Locomotive)
 * - Sanayi Bölgesi (Z: -38.0) boyunca X: 15.0 .. 83.0 arasında uzanan ağır ray hattı
 * - X = 50 Bulvarı üzerinde tam teşekküllü Hemzemin Geçit (flanş plakaları, St. Andrew çaprazı, çift flaşörler, hareketli bariyer kolları)
 * - Sanayi Yükleme Rampası & Antrepo İstasyonu (X: 26.0, Z: -34.8): beton rampa, sarı-siyah emniyet şeritleri, vinç/forklift, paletler, Şef Necati NPC
 * - TCDD DE 11000 / DH 7000 tipi Ağır Manevra Dizel Lokomotifi:
 *   - Turuncu-sarı sanayi gövdesi (#f39c12), siyah şasi (#2d3436), sarı-siyah şivron tamponlar
 *   - İkiz 2-dingilli ağır çelik boji tekerlekleri, döner sarı tepe ikaz tepe lambası
 *   - Aydınlatılmış makinist kabini, camlar ve el sallayan Makinist Cemal Usta NPC'si
 *   - Çift farlar, egzoz bacası ve dinamik konuşma balonu
 * - Vagon 1 (Konteyner Düz Vagon): 20ft TCDD Taşımacılık kobalt mavi (#2980b9) intermodal kargo konteyneri
 * - Vagon 2 (Ağır Makine & Kablo Makarası Vagonu): Dev ahşap kablo makarası ve sarı gergili sandık
 */
export function createTrainView(): TrainView {
  const group = new THREE.Group();
  group.name = "sanayi-freight-railway";

  const disposables: { dispose(): void }[] = [];
  const obstacles: Rect[] = [];

  const trackStartX = TRAIN_MIN_X - 3.0; // 15.0
  const trackEndX = TRAIN_MAX_X + 3.0; // 83.0
  const trackLength = trackEndX - trackStartX; // 68m
  const trackCenterX = (trackStartX + trackEndX) / 2; // 49.0

  // =========================================================================
  // 1. BALASTLI ÇELİK RAY HATTI & TAMPONLAR (Ballasted Track & Buffer Stops)
  // =========================================================================
  const trackGroup = new THREE.Group();
  group.add(trackGroup);

  // Koyu gri kırma granit balast zemin yatağı
  box(trackGroup, [trackLength + 2.0, 0.08, 2.8], [trackCenterX, 0.04, TRAIN_LINE_Z], "#3d444c");

  const railMat = new THREE.MeshStandardMaterial({
    color: "#b0bec5",
    metalness: 0.85,
    roughness: 0.25,
  });
  disposables.push(railMat);

  // Standart ray açıklığı (1.435m standard gauge: Z ± 0.7175)
  const railGeom = new THREE.BoxGeometry(trackLength, 0.08, 0.12);
  disposables.push(railGeom);

  const northRail = new THREE.Mesh(railGeom, railMat);
  northRail.position.set(trackCenterX, 0.12, TRAIN_LINE_Z - 0.72);
  northRail.receiveShadow = true;
  trackGroup.add(northRail);

  const southRail = new THREE.Mesh(railGeom, railMat);
  southRail.position.set(trackCenterX, 0.12, TRAIN_LINE_Z + 0.72);
  southRail.receiveShadow = true;
  trackGroup.add(southRail);

  // Ray traversleri (Her 1.5 metrede bir emprenye ahşap travers)
  for (let sx = trackStartX + 0.8; sx <= trackEndX - 0.8; sx += 1.5) {
    box(trackGroup, [0.32, 0.06, 2.3], [sx, 0.08, TRAIN_LINE_Z], "#2c1e14");
  }

  // Hemzemin geçit zemin lastik/kauçuk dolgu plakaları (X = 45.8 .. 54.2)
  box(trackGroup, [8.6, 0.07, 2.6], [TRAIN_CROSSING_X, 0.11, TRAIN_LINE_Z], "#2d3436");
  // Sarı uyarı kılavuz şeritleri
  box(trackGroup, [8.6, 0.015, 0.12], [TRAIN_CROSSING_X, 0.155, TRAIN_LINE_Z - 1.25], "#f1c40f");
  box(trackGroup, [8.6, 0.015, 0.12], [TRAIN_CROSSING_X, 0.155, TRAIN_LINE_Z + 1.25], "#f1c40f");

  // Hat sonu ağır tampon kirişleri (Terminus Buffer Stops) at X: 15.0 and X: 83.0
  for (const bx of [trackStartX, trackEndX]) {
    const bumperGroup = new THREE.Group();
    bumperGroup.position.set(bx, 0, TRAIN_LINE_Z);
    trackGroup.add(bumperGroup);

    // Ağır çelik gövde & payandalar
    box(bumperGroup, [0.85, 0.85, 2.2], [0, 0.45, 0], "#2d3436");
    // Sarı-Siyah diyagonal emniyet levhası
    box(bumperGroup, [0.9, 0.35, 2.15], [0, 0.55, 0], "#f39c12");
    box(bumperGroup, [0.92, 0.35, 0.25], [0, 0.55, -0.55], "#2d3436");
    box(bumperGroup, [0.92, 0.35, 0.25], [0, 0.55, 0.55], "#2d3436");

    // İkiz kırmızı reflektör plakaları
    cylinder(bumperGroup, 0.12, 0.12, 0.05, [bx > 50 ? -0.48 : 0.48, 0.55, -0.65], "#e74c3c", 8);
    cylinder(bumperGroup, 0.12, 0.12, 0.05, [bx > 50 ? -0.48 : 0.48, 0.55, 0.65], "#e74c3c", 8);

    // Fiziksel çarpışma engeli
    obstacles.push({
      minX: bx - 0.6,
      maxX: bx + 0.6,
      minZ: TRAIN_LINE_Z - 1.2,
      maxZ: TRAIN_LINE_Z + 1.2,
    });
  }

  // =========================================================================
  // 2. HEMZEMİN GEÇİT SİNYALLERİ & BARİYERLERİ (Level Crossing Gates & Signals)
  // =========================================================================
  const crossingGroup = new THREE.Group();
  group.add(crossingGroup);

  const barrierArms: THREE.Group[] = [];
  const flasherLamps: { meshA: THREE.Mesh; meshB: THREE.Mesh; light: THREE.PointLight }[] = [];

  const redFlasherMat = new THREE.MeshStandardMaterial({
    color: "#e74c3c",
    emissive: "#e74c3c",
    emissiveIntensity: 0.2,
    roughness: 0.3,
  });
  disposables.push(redFlasherMat);

  // Kuzey ve Güney Geçit Direkleri: Kuzey (45.2, -35.2), Güney (54.8, -40.8)
  const crossingPosts = [
    { x: 45.2, z: -35.2, yaw: Math.PI, armPivotX: 0, armPivotZ: 0 },
    { x: 54.8, z: -40.8, yaw: 0, armPivotX: 0, armPivotZ: 0 },
  ];

  crossingPosts.forEach((cp, idx) => {
    const postGroup = new THREE.Group();
    postGroup.position.set(cp.x, 0, cp.z);
    postGroup.rotation.y = cp.yaw;
    crossingGroup.add(postGroup);

    // Kaide ve çelik direk
    cylinder(postGroup, 0.22, 0.26, 0.4, [0, 0.2, 0], "#2f3542", 8);
    cylinder(postGroup, 0.08, 0.08, 3.2, [0, 1.8, 0], "#747d8c", 8);

    // Bariyer motor kutusu
    box(postGroup, [0.35, 0.55, 0.4], [0, 1.05, 0], "#2f3542");

    // St. Andrew Demiryolu Çaprazı (Crossbuck sign: "DUR · DİKKAT TREN")
    const signGroup = new THREE.Group();
    signGroup.position.set(0, 2.7, 0.1);
    postGroup.add(signGroup);

    const crossMat = mat("#ffffff", 0.4);
    disposables.push(crossMat);
    const arm1 = box(signGroup, [1.1, 0.16, 0.04], [0, 0, 0], "#ffffff");
    arm1.rotation.z = 0.65;
    const arm2 = box(signGroup, [1.1, 0.16, 0.04], [0, 0, 0], "#ffffff");
    arm2.rotation.z = -0.65;

    // Kırmızı çerçeve şeritleri
    box(signGroup, [0.2, 0.14, 0.05], [-0.4, 0.25, 0], "#e74c3c").rotation.z = 0.65;
    box(signGroup, [0.2, 0.14, 0.05], [0.4, -0.25, 0], "#e74c3c").rotation.z = 0.65;
    box(signGroup, [0.2, 0.14, 0.05], [-0.4, -0.25, 0], "#e74c3c").rotation.z = -0.65;
    box(signGroup, [0.2, 0.14, 0.05], [0.4, 0.25, 0], "#e74c3c").rotation.z = -0.65;

    // Çift Yatay Flaşör Lambaları (Sol / Sağ)
    box(postGroup, [0.75, 0.08, 0.08], [0, 2.2, 0.1], "#2f3542");

    const lampGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10);
    disposables.push(lampGeom);

    const lampA = new THREE.Mesh(lampGeom, redFlasherMat.clone());
    lampA.rotation.x = Math.PI / 2;
    lampA.position.set(-0.32, 2.2, 0.15);
    postGroup.add(lampA);
    disposables.push(lampA.material as THREE.Material);

    const lampB = new THREE.Mesh(lampGeom, redFlasherMat.clone());
    lampB.rotation.x = Math.PI / 2;
    lampB.position.set(0.32, 2.2, 0.15);
    postGroup.add(lampB);
    disposables.push(lampB.material as THREE.Material);

    const flashLight = new THREE.PointLight("#ff3838", 0, 8);
    flashLight.position.set(0, 2.2, 0.4);
    postGroup.add(flashLight);

    flasherLamps.push({ meshA: lampA, meshB: lampB, light: flashLight });

    // Çan zili başlığı
    cylinder(postGroup, 0.14, 0.08, 0.18, [0, 3.45, 0], "#bdc3c7", 8);

    // Hareketli Bariyer Kolu (Pivot Y: 1.15m)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 1.15, 0.22);
    postGroup.add(armGroup);
    barrierArms.push(armGroup);

    // Karşı ağırlık
    box(armGroup, [0.22, 0.25, 0.65], [-0.35, 0, 0], "#1e272e");

    // Ana bariyer kolu (4.4m uzunluğunda, kırmızı-beyaz çizgili)
    const gateArmLen = 4.4;
    box(armGroup, [gateArmLen, 0.12, 0.06], [gateArmLen / 2, 0, 0], "#ffffff");

    // Kırmızı şeritler
    for (let rx = 0.5; rx <= gateArmLen - 0.4; rx += 0.8) {
      box(armGroup, [0.35, 0.125, 0.07], [rx, 0, 0], "#e74c3c");
    }

    // Uç kırmızı LED ışık
    cylinder(armGroup, 0.04, 0.04, 0.08, [gateArmLen - 0.1, 0.1, 0], "#e74c3c", 6);

    // Başlangıçta açık pozisyona (dik) getir
    armGroup.rotation.z = GATE_OPEN_ANGLE;

    // Direk taban engeli
    obstacles.push({
      minX: cp.x - 0.4,
      maxX: cp.x + 0.4,
      minZ: cp.z - 0.4,
      maxZ: cp.z + 0.4,
    });
  });

  // =========================================================================
  // 3. SANAYİ YÜKLEME RAMPASI & ANTREPO İSTASYONU (Freight Siding Platform)
  // =========================================================================
  const sidingGroup = new THREE.Group();
  sidingGroup.position.set(TRAIN_SIDING_POS.x, 0, TRAIN_SIDING_POS.z);
  group.add(sidingGroup);

  // Yükseltilmiş beton platform deck (13m x 0.9m x 3.6m)
  box(sidingGroup, [13.0, 0.85, 3.6], [0, 0.425, 0], "#7f8c8d");
  // Sarı-siyah emniyet kenarı (Ray tarafı Z: -36.2)
  box(sidingGroup, [13.05, 0.12, 0.22], [0, 0.85, -1.7], "#f1c40f");
  for (let hx = -6.0; hx <= 6.0; hx += 1.2) {
    box(sidingGroup, [0.55, 0.125, 0.23], [hx, 0.85, -1.7], "#2d3436");
  }

  // Batı rampası (araç ve forklift çıkışı)
  box(sidingGroup, [2.5, 0.45, 3.6], [-7.2, 0.22, 0], "#636e72");

  // Çelik sundurma kanopisi (Canopy shelter with 4 tubular columns)
  box(sidingGroup, [7.5, 0.15, 3.2], [0, 3.4, 0], "#2c3e50");
  for (const cx of [-3.2, 3.2]) {
    for (const cz of [-1.3, 1.3]) {
      cylinder(sidingGroup, 0.07, 0.07, 2.6, [cx, 2.1, cz], "#95a5a6", 8);
    }
  }

  // İstasyon tabela levhası ("SANAYİ YÜKLEME RAMPASI · LOKOMOTİF DİSPANÇER")
  const sidingSign = label("SANAYİ YÜKLEME RAMPASI");
  sidingSign.position.set(0, 3.75, -1.6);
  sidingSign.scale.set(1.9, 0.45, 1);
  sidingGroup.add(sidingSign);

  // Platform aydınlatma projektörü
  const sidingFloodlight = new THREE.PointLight("#fffae6", 0.8, 14);
  sidingFloodlight.position.set(0, 3.2, 0);
  sidingGroup.add(sidingFloodlight);

  // Paletler ve endüstriyel kargo varilleri
  box(sidingGroup, [1.2, 0.14, 0.8], [-2.0, 0.92, 0.4], "#8c6239"); // Ahşap palet
  cylinder(sidingGroup, 0.26, 0.26, 0.75, [-2.2, 1.35, 0.3], "#2980b9", 10); // Mavi varil
  cylinder(sidingGroup, 0.26, 0.26, 0.75, [-1.8, 1.35, 0.5], "#e67e22", 10); // Turuncu varil

  // Ağır çemberli ahşap kargo sandığı
  box(sidingGroup, [1.4, 1.1, 1.2], [2.2, 1.4, 0.2], "#b3895d");
  box(sidingGroup, [1.42, 0.08, 1.22], [2.2, 1.4, 0.2], "#2c3e50"); // Çelik çember

  // Sarı forklift modeli
  const forklift = new THREE.Group();
  forklift.position.set(4.5, 0.85, 0.2);
  sidingGroup.add(forklift);
  box(forklift, [1.4, 0.65, 0.95], [0, 0.35, 0], "#f1c40f");
  box(forklift, [0.75, 0.95, 0.85], [-0.2, 0.95, 0], "#2c3e50"); // Kabin
  cylinder(forklift, 0.04, 0.04, 1.6, [0.65, 0.9, -0.35], "#34495e", 6); // Asansör direği
  cylinder(forklift, 0.04, 0.04, 1.6, [0.65, 0.9, 0.35], "#34495e", 6);
  box(forklift, [0.6, 0.04, 0.08], [0.95, 0.3, -0.2], "#7f8c8d"); // Çatallar
  box(forklift, [0.6, 0.04, 0.08], [0.95, 0.3, 0.2], "#7f8c8d");

  // Antrepo Şefi Necati NPC'si
  const supervisorGroup = new THREE.Group();
  supervisorGroup.position.set(-0.5, 0.85, -0.8);
  sidingGroup.add(supervisorGroup);

  // Ayaklar ve gövde (Lacivert tulum & turuncu reflektörlü iş yeleği)
  cylinder(supervisorGroup, 0.1, 0.1, 0.65, [-0.12, 0.32, 0], "#1e272e", 6);
  cylinder(supervisorGroup, 0.1, 0.1, 0.65, [0.12, 0.32, 0], "#1e272e", 6);
  box(supervisorGroup, [0.38, 0.55, 0.24], [0, 0.9, 0], "#e67e22"); // Yelek
  box(supervisorGroup, [0.39, 0.06, 0.25], [0, 0.92, 0], "#ffffff"); // Reflektör

  // Kafa ve Beyaz Baret
  cylinder(supervisorGroup, 0.12, 0.12, 0.24, [0, 1.3, 0], "#fad390", 8);
  cylinder(supervisorGroup, 0.18, 0.16, 0.12, [0, 1.45, 0], "#f5f6fa", 8); // Baret

  // Sağ El (El sallama pivotu)
  const necatiArm = new THREE.Group();
  necatiArm.position.set(0.24, 1.1, 0);
  supervisorGroup.add(necatiArm);
  cylinder(necatiArm, 0.05, 0.05, 0.45, [0, -0.2, 0], "#e67e22", 6);
  cylinder(necatiArm, 0.06, 0.06, 0.1, [0, -0.42, 0], "#fad390", 6);

  // El terminali / Barkod okuyucu
  box(supervisorGroup, [0.12, 0.18, 0.06], [-0.22, 0.9, 0.15], "#2f3542");

  // Şef Necati Konuşma Balonu
  const supervisorBubble = label("Şef Necati: Sanayi Ekspresi hazır! Kolay gelsin kaptan! 📦");
  supervisorBubble.position.set(0, 2.2, 0);
  supervisorBubble.scale.set(2.4, 0.6, 1);
  supervisorBubble.visible = false;
  supervisorGroup.add(supervisorBubble);

  // Platform fiziksel engeli
  obstacles.push({
    minX: TRAIN_SIDING_POS.x - 6.5,
    maxX: TRAIN_SIDING_POS.x + 6.5,
    minZ: TRAIN_SIDING_POS.z - 1.8,
    maxZ: TRAIN_SIDING_POS.z + 1.8,
  });

  // =========================================================================
  // 4. DİZEL MANEVRA LOKOMOTİFİ (TCDD DE 11000 / DH 7000 Shunter)
  // =========================================================================
  const trainParentGroup = new THREE.Group();
  group.add(trainParentGroup);

  const locoGroup = new THREE.Group();
  locoGroup.name = "locomotive";
  trainParentGroup.add(locoGroup);

  const L = TRAIN_LENGTH; // 6.2m
  const W = TRAIN_WIDTH; // 2.4m

  const shunterYellow = mat("#f39c12", 0.35); // Canlı iş makinesi sarısı
  const shunterDark = mat("#2d3436", 0.7); // Ağır çelik şasi ve tamponlar
  const shunterOrange = mat("#e67e22", 0.4);
  const wheelMat = mat("#747d8c", 0.85);

  const windowLitMat = new THREE.MeshStandardMaterial({
    color: "#ffeaa7",
    emissive: "#f39c12",
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const headlampMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  disposables.push(shunterYellow, shunterDark, shunterOrange, wheelMat, windowLitMat, headlampMat);

  // 4.1. Ağır Çelik Şasi Gövdesi (Heavy Steel Underframe)
  box(locoGroup, [L, 0.35, W], [0, 0.55, 0], "#2d3436");
  // Yürüme platformu emniyet kenarı
  box(locoGroup, [L + 0.1, 0.06, W + 0.1], [0, 0.73, 0], "#f39c12");

  // Ön ve Arka Şivronlu Tampon Kirişleri (Pilot beams with yellow/black hazard chevrons)
  for (const px of [-L / 2, L / 2]) {
    const isFront = px > 0;
    const beam = new THREE.Group();
    beam.position.set(px, 0.45, 0);
    locoGroup.add(beam);

    box(beam, [0.15, 0.45, W + 0.05], [0, 0, 0], "#f1c40f");
    // Şivron şeritleri
    for (const sz of [-0.9, -0.45, 0, 0.45, 0.9]) {
      box(beam, [0.16, 0.45, 0.18], [0, 0, sz], "#2d3436");
    }
    // Otomatik kuplör (Knuckle coupler)
    box(beam, [0.35, 0.18, 0.22], [isFront ? 0.22 : -0.22, 0, 0], "#1e272e");
    // Tampon diskleri
    cylinder(beam, 0.14, 0.14, 0.18, [isFront ? 0.15 : -0.15, 0, -0.85], "#2f3542", 8).rotation.z = Math.PI / 2;
    cylinder(beam, 0.14, 0.14, 0.18, [isFront ? 0.15 : -0.15, 0, 0.85], "#2f3542", 8).rotation.z = Math.PI / 2;
  }

  // 4.2. İkiz 2-Dingilli Bojiler ve Tekerlekler (Dual 2-Axle Bogies)
  const rotatingWheels: THREE.Mesh[] = [];
  const bogieCenters = [-1.8, 1.8];

  for (const bx of bogieCenters) {
    // Boji çerçevesi
    box(locoGroup, [1.8, 0.25, W - 0.3], [bx, 0.32, 0], "#2f3542");

    for (const wx of [bx - 0.55, bx + 0.55]) {
      for (const wz of [-0.85, 0.85]) {
        const wheel = cylinder(locoGroup, 0.32, 0.32, 0.12, [wx, 0.32, wz], "#747d8c", 12);
        wheel.rotation.x = Math.PI / 2;
        rotatingWheels.push(wheel);
        // Flanş çemberi
        cylinder(locoGroup, 0.36, 0.36, 0.03, [wx, 0.32, wz + (wz > 0 ? -0.06 : 0.06)], "#57606f", 12).rotation.x = Math.PI / 2;
      }
    }
  }

  // 4.3. Motor Kompartımanı / Uzun Burun (Engine Hood)
  const hoodL = 3.6;
  const hoodW = W - 0.4;
  const hoodH = 1.7;
  box(locoGroup, [hoodL, hoodH, hoodW], [0.8, 0.75 + hoodH / 2, 0], "#f39c12");
  // Ön radyatör ızgarası
  box(locoGroup, [0.08, hoodH - 0.3, hoodW - 0.3], [0.8 + hoodL / 2 + 0.02, 1.6, 0], "#2c3e50");
  // Yan soğutma panelleri / louver
  for (const lz of [-hoodW / 2 - 0.02, hoodW / 2 + 0.02]) {
    for (let lx = -0.5; lx <= 2.0; lx += 0.8) {
      box(locoGroup, [0.55, 0.9, 0.04], [lx, 1.6, lz], "#2c3e50");
    }
  }
  // Tavan fan ızgaraları
  cylinder(locoGroup, 0.35, 0.35, 0.08, [1.6, 0.75 + hoodH + 0.04, 0], "#2c3e50", 12);

  // Dizel Egzoz Bacası (Exhaust stack)
  const exhaustStack = cylinder(locoGroup, 0.12, 0.15, 0.65, [0.2, 0.75 + hoodH + 0.32, 0], "#2f3542", 8);

  // 4.4. Yükseltilmiş Makinist Kabini (Raised Operator Cab)
  const cabL = 1.8;
  const cabW = W - 0.15;
  const cabH = 2.05;
  const cabX = -1.8;
  const cabY = 0.75 + cabH / 2;
  box(locoGroup, [cabL, cabH, cabW], [cabX, cabY, 0], "#e67e22");

  // Kabin tavan siperliği
  box(locoGroup, [cabL + 0.2, 0.12, cabW + 0.2], [cabX, 0.75 + cabH + 0.06, 0], "#2c3e50");

  // Kabin camları (Geniş ön, arka ve yan pencereler)
  // Ön cam (Motora bakan)
  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, cabW - 0.4), windowLitMat);
  frontWin.position.set(cabX + cabL / 2 + 0.02, 2.1, 0);
  locoGroup.add(frontWin);

  // Arka cam
  const rearWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, cabW - 0.4), windowLitMat);
  rearWin.position.set(cabX - cabL / 2 - 0.02, 2.1, 0);
  locoGroup.add(rearWin);

  // Yan camlar
  for (const wz of [-cabW / 2 - 0.02, cabW / 2 + 0.02]) {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(cabL - 0.4, 0.65, 0.06), windowLitMat);
    sideWin.position.set(cabX, 2.1, wz);
    locoGroup.add(sideWin);
  }

  // Döner Tepe İkaz Lambası (Roof rotating amber beacon)
  const beaconBase = cylinder(locoGroup, 0.12, 0.14, 0.1, [cabX, 0.75 + cabH + 0.16, 0], "#2f3542", 8);
  const beaconLens = cylinder(locoGroup, 0.09, 0.09, 0.16, [cabX, 0.75 + cabH + 0.28, 0], "#f1c40f", 8);
  const beaconLight = new THREE.PointLight("#f39c12", 0.5, 6);
  beaconLight.position.set(cabX, 0.75 + cabH + 0.35, 0);
  locoGroup.add(beaconLight);

  // Makinist Cemal Usta NPC (Kabinde kontrol başında)
  const makinistGroup = new THREE.Group();
  makinistGroup.position.set(cabX, 1.35, 0.3);
  locoGroup.add(makinistGroup);

  cylinder(makinistGroup, 0.14, 0.14, 0.5, [0, 0.25, 0], "#2980b9", 8); // Mavi gömlek
  cylinder(makinistGroup, 0.1, 0.1, 0.2, [0, 0.6, 0], "#fad390", 8); // Yüz
  cylinder(makinistGroup, 0.14, 0.12, 0.08, [0, 0.72, 0], "#1e272e", 8); // Kasket

  const makinistArm = new THREE.Group();
  makinistArm.position.set(0, 0.45, 0.2);
  makinistGroup.add(makinistArm);
  cylinder(makinistArm, 0.04, 0.04, 0.35, [0, -0.15, 0], "#2980b9", 6);
  cylinder(makinistArm, 0.05, 0.05, 0.08, [0, -0.32, 0], "#fad390", 6);

  // Makinist Konuşma Balonu
  const makinistBubble = label("Makinist Cemal: Düüüt! Sanayi Ekspresi seyrinde! 🚂");
  makinistBubble.position.set(cabX, 3.8, 0);
  makinistBubble.scale.set(2.4, 0.6, 1);
  makinistBubble.visible = false;
  locoGroup.add(makinistBubble);

  // Ön ve Arka Halojen Projektör Farları (Sealed-beam dual headlights)
  const locoHeadlights: THREE.Mesh[] = [];
  const frontHeadlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), headlampMat);
  frontHeadlamp.rotation.z = Math.PI / 2;
  frontHeadlamp.position.set(L / 2 + 0.08, 1.9, 0);
  locoGroup.add(frontHeadlamp);
  locoHeadlights.push(frontHeadlamp);

  const rearHeadlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), headlampMat);
  rearHeadlamp.rotation.z = Math.PI / 2;
  rearHeadlamp.position.set(-L / 2 - 0.08, 2.3, 0);
  locoGroup.add(rearHeadlamp);
  locoHeadlights.push(rearHeadlamp);

  // =========================================================================
  // 5. VAGON 1: KONTEYNER TAŞIYICI DÜZ VAGON (Container Flatcar)
  // =========================================================================
  const flatcar1 = new THREE.Group();
  flatcar1.name = "flatcar-container";
  trainParentGroup.add(flatcar1);

  const car1L = 5.4;
  const carW = W - 0.2;

  // Çelik şasi
  box(flatcar1, [car1L, 0.3, carW], [0, 0.52, 0], "#2c3e50");

  // Vagon bojileri ve tekerlekleri
  for (const bx of [-1.6, 1.6]) {
    box(flatcar1, [1.5, 0.2, carW - 0.3], [bx, 0.32, 0], "#2f3542");
    for (const wx of [bx - 0.45, bx + 0.45]) {
      for (const wz of [-0.85, 0.85]) {
        const w = cylinder(flatcar1, 0.3, 0.3, 0.1, [wx, 0.32, wz], "#747d8c", 10);
        w.rotation.x = Math.PI / 2;
        rotatingWheels.push(w);
      }
    }
  }

  // 20ft Intermodal Nakliye Konteyneri (Kobalt Mavi)
  const containerL = 4.8;
  const containerH = 2.1;
  const containerW = carW - 0.1;
  box(flatcar1, [containerL, containerH, containerW], [0, 0.67 + containerH / 2, 0], "#2980b9");
  // Konteyner olukları / nervürler
  for (let cx = -containerL / 2 + 0.4; cx <= containerL / 2 - 0.4; cx += 0.5) {
    box(flatcar1, [0.08, containerH - 0.1, containerW + 0.02], [cx, 0.67 + containerH / 2, 0], "#1f618d");
  }
  // Konteyner köşe dökümleri
  for (const kx of [-containerL / 2 + 0.1, containerL / 2 - 0.1]) {
    for (const kz of [-containerW / 2 + 0.1, containerW / 2 - 0.1]) {
      box(flatcar1, [0.22, containerH + 0.02, 0.22], [kx, 0.67 + containerH / 2, kz], "#1a5276");
    }
  }
  // Konteyner yan stensil levhası
  const containerLabel = label("TCDD TAŞIMACILIK · 20FT");
  containerLabel.position.set(0, 1.8, containerW / 2 + 0.04);
  containerLabel.scale.set(2.2, 0.4, 1);
  flatcar1.add(containerLabel);

  // =========================================================================
  // 6. VAGON 2: AĞIR MAKİNE & KABLO MAKARASI VAGONU (Machinery Flatcar)
  // =========================================================================
  const flatcar2 = new THREE.Group();
  flatcar2.name = "flatcar-machinery";
  trainParentGroup.add(flatcar2);

  // Çelik şasi ve yan babalar
  box(flatcar2, [car1L, 0.3, carW], [0, 0.52, 0], "#2c3e50");
  for (let sx = -car1L / 2 + 0.3; sx <= car1L / 2 - 0.3; sx += 0.9) {
    cylinder(flatcar2, 0.04, 0.04, 0.6, [sx, 0.85, -carW / 2 + 0.05], "#34495e", 6);
    cylinder(flatcar2, 0.04, 0.04, 0.6, [sx, 0.85, carW / 2 - 0.05], "#34495e", 6);
  }

  // Vagon bojileri ve tekerlekleri
  for (const bx of [-1.6, 1.6]) {
    box(flatcar2, [1.5, 0.2, carW - 0.3], [bx, 0.32, 0], "#2f3542");
    for (const wx of [bx - 0.45, bx + 0.45]) {
      for (const wz of [-0.85, 0.85]) {
        const w = cylinder(flatcar2, 0.3, 0.3, 0.1, [wx, 0.32, wz], "#747d8c", 10);
        w.rotation.x = Math.PI / 2;
        rotatingWheels.push(w);
      }
    }
  }

  // Yük 1: Dev Ahşap Sanayi Kablo Makarası (Giant Industrial Cable Spool)
  const spoolGroup = new THREE.Group();
  spoolGroup.position.set(-1.1, 1.55, 0);
  flatcar2.add(spoolGroup);

  // Yan ahşap flanş diskleri
  cylinder(spoolGroup, 0.95, 0.95, 0.12, [0, 0, -0.65], "#8c6239", 14).rotation.x = Math.PI / 2;
  cylinder(spoolGroup, 0.95, 0.95, 0.12, [0, 0, 0.65], "#8c6239", 14).rotation.x = Math.PI / 2;
  // Bakır kablo sarılı tambur
  cylinder(spoolGroup, 0.75, 0.75, 1.2, [0, 0, 0], "#d35400", 12).rotation.x = Math.PI / 2;
  // Ahşap destek takozları
  box(flatcar2, [0.4, 0.3, 1.6], [-1.8, 0.75, 0], "#5c3d25");
  box(flatcar2, [0.4, 0.3, 1.6], [-0.4, 0.75, 0], "#5c3d25");

  // Yük 2: Ağır Endüstriyel Makine Sandığı & Sarı Gerdirme Kayışları
  const crateL = 1.6;
  const crateH = 1.3;
  const crateW = 1.5;
  box(flatcar2, [crateL, crateH, crateW], [1.3, 0.67 + crateH / 2, 0], "#b3895d");
  // Sarı bağlama cırcır kayışları (Tie-down straps)
  box(flatcar2, [0.08, crateH + 0.04, crateW + 0.04], [0.9, 0.67 + crateH / 2, 0], "#f1c40f");
  box(flatcar2, [0.08, crateH + 0.04, crateW + 0.04], [1.7, 0.67 + crateH / 2, 0], "#f1c40f");

  // =========================================================================
  // 7. GÜNCELLEME VE ANİMASYON DÖNGÜSÜ (Update & Animation Loop)
  // =========================================================================
  let wheelRot = 0;
  let beaconRot = 0;
  let waveTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      state: TrainState,
      playerPos?: { x: number; z: number },
      isNightOrDusk = false,
    ) {
      // 1. Lokomotif ve vagonların ray üzerindeki dizilimi
      // Tren katarı dizilimi: Lokomotif önde, arkasında Vagon 1, en arkada Vagon 2
      const dir = state.direction; // 1 = Doğu (+X), -1 = Batı (-X)
      const locoX = state.position.x;
      const vagon1X = locoX - dir * 6.5;
      const vagon2X = locoX - dir * 12.6;

      locoGroup.position.set(locoX, 0, TRAIN_LINE_Z);
      locoGroup.rotation.y = dir === 1 ? 0 : Math.PI;

      flatcar1.position.set(vagon1X, 0, TRAIN_LINE_Z);
      flatcar1.rotation.y = dir === 1 ? 0 : Math.PI;

      flatcar2.position.set(vagon2X, 0, TRAIN_LINE_Z);
      flatcar2.rotation.y = dir === 1 ? 0 : Math.PI;

      // Hafif ray sarsıntısı mikro-titreşimi
      if (state.speed > 0.5) {
        locoGroup.position.y = Math.sin(locoX * 5.0) * 0.015;
        flatcar1.position.y = Math.sin(vagon1X * 5.0) * 0.012;
        flatcar2.position.y = Math.sin(vagon2X * 5.0) * 0.012;
      } else {
        locoGroup.position.y = 0;
        flatcar1.position.y = 0;
        flatcar2.position.y = 0;
      }

      // 2. Tekerlek dönüş fiziği
      wheelRot += (state.speed * dt * dir) / 0.32;
      for (const w of rotatingWheels) {
        w.rotation.z = wheelRot;
      }

      // 3. Makinist tepe ikaz lambası dönüşü
      beaconRot += dt * 5.0;
      beaconLight.intensity = (state.speed > 0.2 || state.crossingActive) ? 0.4 + Math.sin(beaconRot) * 0.35 : 0.05;

      // 4. Bariyer Kolları ve Hemzemin Geçit Flaşörleri
      barrierArms.forEach((arm) => {
        arm.rotation.z = state.gateAngle;
      });

      flasherLamps.forEach((f) => {
        if (state.crossingActive) {
          const isA = state.crossingFlashState;
          (f.meshA.material as THREE.MeshStandardMaterial).emissiveIntensity = isA ? 1.6 : 0.1;
          (f.meshB.material as THREE.MeshStandardMaterial).emissiveIntensity = !isA ? 1.6 : 0.1;
          f.light.intensity = 1.2;
        } else {
          (f.meshA.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.05;
          (f.meshB.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.05;
          f.light.intensity = 0;
        }
      });

      // 5. El sallama ve NPC animasyonları
      waveTimer += dt * 3.5;
      const distToPlayer = playerPos
        ? Math.hypot(playerPos.x - TRAIN_SIDING_POS.x, playerPos.z - TRAIN_SIDING_POS.z)
        : 999;
      const isPlayerNearSiding = distToPlayer < 12.0;

      if (state.honkGreetingTimer > 0) {
        // Makinist ve Şef Necati korna selamlaması
        makinistArm.rotation.x = Math.sin(waveTimer * 2.2) * 0.65 - 0.4;
        necatiArm.rotation.z = Math.sin(waveTimer * 2.5) * 0.7 + 0.6;
        makinistBubble.visible = true;
        supervisorBubble.visible = true;
      } else if (isPlayerNearSiding) {
        // Şef Necati yaklaşan kargo aracına el sallar
        necatiArm.rotation.z = Math.sin(waveTimer * 1.5) * 0.45 + 0.5;
        makinistBubble.visible = false;
        supervisorBubble.visible = false;
      } else {
        makinistArm.rotation.x = 0;
        necatiArm.rotation.z = 0;
        makinistBubble.visible = false;
        supervisorBubble.visible = false;
      }

      // 6. Gece / Alacakaranlık Işıklandırması
      const nightIntensity = isNightOrDusk ? 1.2 : 0.2;
      headlampMat.emissiveIntensity = isNightOrDusk ? 1.5 : 0.4;
      windowLitMat.emissiveIntensity = isNightOrDusk ? 0.7 : 0.2;
      sidingFloodlight.intensity = isNightOrDusk ? 1.4 : 0.3;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      group.clear();
    },
  };
}
