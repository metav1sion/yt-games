import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Rect } from "../game/types";
import {
  FERRIS_WHEEL_POS,
  FERRIS_WHEEL_RADIUS,
  FERRIS_WHEEL_HUB_HEIGHT,
  FERRIS_WHEEL_GONDOLA_COUNT,
  type FerrisWheelState,
} from "../game/ferris-wheel";

export type FerrisWheelView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: FerrisWheelState,
    playerPos?: { x: number; z: number },
    isNightOrDusk?: boolean,
  ): void;
  dispose(): void;
};

/**
 * 🎡 BÜYÜK SAHİL DÖNME DOLABI & LUNAPARK İSKELESİ (Grand Sahil Ferris Wheel & Amusement Pier)
 * - Sahil Şeridi kıyısında (X: -14.0, Z: 92.5) deniz üzerindeki tarihi ahşap ve taş lunapark iskelesi
 * - 15m yüksekliğinde turkuaz ve beyaz çift A-Frame çelik kafes taşıyıcı kuleler
 * - Z ekseninde sürekli dönen 16m çapında çift çemberli çelik çark ve 12 radyal parmaklık
 * - Yerçekimi karşı-rotasyonuyla daima dik duran 12 adet rengarenk yolcu gondolu (Sarı, Mavi, Kırmızı)
 * - Çark çevresinde ritmik yanan 24 adet dinamik LED kovalama ışığı (Chase lights)
 * - Nostaljik ahşap bilet gişesi ("BİLET GİŞESİ · 15₺") ve el sallayan Lunaparkçı Şevket Usta NPC
 */
export function createFerrisWheelView(): FerrisWheelView {
  const group = new THREE.Group();
  group.name = "grand-ferris-wheel";
  group.position.set(FERRIS_WHEEL_POS.x, 0, FERRIS_WHEEL_POS.z);

  const disposables: { dispose(): void }[] = [];
  const obstacles: Rect[] = [];

  // =========================================================================
  // 1. LUNAPARK İSKELESİ & AHŞAP SEYİR GÜVERTESİ (Pier Foundation & Deck)
  // =========================================================================
  const pierGroup = new THREE.Group();
  group.add(pierGroup);

  // Taş ve beton dalgakıran kaidesi (Sekizgen form)
  cylinder(pierGroup, 8.8, 9.2, 0.5, [0, 0.25, 0], "#4a5568", 8);

  // Ahşap güverte zemin platformu
  cylinder(pierGroup, 8.5, 8.5, 0.1, [0, 0.55, 0], "#9e774f", 16);

  // Sahil kordonundan iskeleye bağlanan ahşap köprü (Footbridge connector)
  box(pierGroup, [5.2, 0.14, 4.8], [0, 0.48, -6.8], "#8c6239");
  box(pierGroup, [0.14, 0.65, 4.8], [-2.55, 0.85, -6.8], "#5c3d1e");
  box(pierGroup, [0.14, 0.65, 4.8], [2.55, 0.85, -6.8], "#5c3d1e");

  // İskele çevresi döküm demir korkuluklar (Perimeter railings)
  for (let a = -Math.PI * 0.85; a <= Math.PI * 0.85; a += Math.PI / 7) {
    if (a > -Math.PI * 0.65 && a < -Math.PI * 0.35) continue; // Köprü girişi açık
    const rx = Math.sin(a) * 8.3;
    const rz = Math.cos(a) * 8.3;
    cylinder(pierGroup, 0.04, 0.04, 0.75, [rx, 0.95, rz], "#2d3748", 4);
  }

  // 4 Köşe Nostaljik İskele Fenerleri
  const lanternMat = new THREE.MeshStandardMaterial({
    color: "#ffa834",
    emissive: "#ffa834",
    emissiveIntensity: 0.8,
  });
  disposables.push(lanternMat);

  const lanternOffsets = [
    [-6.2, -4.8],
    [6.2, -4.8],
    [-6.5, 5.2],
    [6.5, 5.2],
  ];
  for (const [lx, lz] of lanternOffsets) {
    cylinder(pierGroup, 0.08, 0.1, 1.8, [lx, 1.45, lz], "#1a252f", 6);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), lanternMat);
    globe.position.set(lx, 2.45, lz);
    pierGroup.add(globe);
    disposables.push(globe.geometry);
  }

  // =========================================================================
  // 2. ÇİFT A-FRAME ÇELİK KAFES TAŞIYICI KULELER (Steel Support Towers)
  // =========================================================================
  const towersGroup = new THREE.Group();
  group.add(towersGroup);

  const hubY = FERRIS_WHEEL_HUB_HEIGHT; // 8.5m
  const towerZOffsets = [-1.4, 1.4]; // Ön ve arka A-frame

  const towerMatCyan = mat("#00cec9", 0.4);
  const towerMatWhite = mat("#f5f6fa", 0.3);
  disposables.push(towerMatCyan, towerMatWhite);

  const legGeo = new THREE.CylinderGeometry(0.14, 0.22, 8.8, 6);
  disposables.push(legGeo);

  for (const tz of towerZOffsets) {
    // Sol bacak (slanted left leg)
    const leftLeg = new THREE.Mesh(legGeo, towerMatCyan);
    leftLeg.position.set(-2.0, hubY / 2 + 0.3, tz);
    leftLeg.rotation.z = -0.42;
    towersGroup.add(leftLeg);

    // Sağ bacak (slanted right leg)
    const rightLeg = new THREE.Mesh(legGeo, towerMatCyan);
    rightLeg.position.set(2.0, hubY / 2 + 0.3, tz);
    rightLeg.rotation.z = 0.42;
    towersGroup.add(rightLeg);

    // Yatay takviye kirişleri (Horizontal cross struts)
    box(towersGroup, [2.8, 0.12, 0.12], [0, 3.4, tz], "#f5f6fa");
    box(towersGroup, [1.6, 0.12, 0.12], [0, 6.1, tz], "#f5f6fa");

    // Z ekseninde bacakları birbirine bağlayan diyagonaller
    box(towersGroup, [0.12, 0.12, 2.8], [-2.0, 3.4, 0], "#f5f6fa");
    box(towersGroup, [0.12, 0.12, 2.8], [2.0, 3.4, 0], "#f5f6fa");

    // Kaide çelik montaj pabuçları
    box(towersGroup, [0.8, 0.2, 0.8], [-3.8, 0.65, tz], "#2d3436");
    box(towersGroup, [0.8, 0.2, 0.8], [3.8, 0.65, tz], "#2d3436");
  }

  // Merkezi Ana Mil / Göbek Rulmanı (Central Axle Hub)
  const axleMat = mat("#2d3436", 0.2);
  disposables.push(axleMat);
  const axleGeo = new THREE.CylinderGeometry(0.42, 0.42, 3.4, 16);
  disposables.push(axleGeo);
  const axleMesh = new THREE.Mesh(axleGeo, axleMat);
  axleMesh.position.set(0, hubY, 0);
  axleMesh.rotation.x = Math.PI / 2;
  towersGroup.add(axleMesh);

  // Kule colliders (Kargo aracı ana mil kulelerine çarpabilir, iskelede gezebilir)
  obstacles.push({
    minX: FERRIS_WHEEL_POS.x - 2.8,
    maxX: FERRIS_WHEEL_POS.x + 2.8,
    minZ: FERRIS_WHEEL_POS.z - 1.8,
    maxZ: FERRIS_WHEEL_POS.z + 1.8,
  });

  // =========================================================================
  // 3. DÖNEN ÇELİK ÇARK DÜZENEĞİ (Rotating Wheel Assembly)
  // =========================================================================
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, hubY, 0);
  group.add(wheelGroup);

  const wheelRadius = FERRIS_WHEEL_RADIUS; // 7.5m
  const innerRadius = 6.1;

  // Dış ve iç çelik boru çemberler (Torus rims)
  const outerTorusGeo = new THREE.TorusGeometry(wheelRadius, 0.07, 8, 36);
  const innerTorusGeo = new THREE.TorusGeometry(innerRadius, 0.05, 8, 36);
  const steelMat = mat("#dfe6e9", 0.3);
  disposables.push(outerTorusGeo, innerTorusGeo, steelMat);

  // Ön ve arka çemberler
  for (const cz of [-0.65, 0.65]) {
    const outerRim = new THREE.Mesh(outerTorusGeo, steelMat);
    outerRim.position.z = cz;
    wheelGroup.add(outerRim);

    const innerRim = new THREE.Mesh(innerTorusGeo, steelMat);
    innerRim.position.z = cz;
    wheelGroup.add(innerRim);

    // Çemberler arası zikzak kafes kirişler (Diamond lattice bracing)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const spokeGeo = new THREE.CylinderGeometry(0.04, 0.04, wheelRadius - 0.9, 6);
      disposables.push(spokeGeo);
      const spoke = new THREE.Mesh(spokeGeo, steelMat);
      spoke.position.set(
        Math.cos(a) * ((wheelRadius + 0.9) / 2),
        Math.sin(a) * ((wheelRadius + 0.9) / 2),
        cz,
      );
      spoke.rotation.z = a + Math.PI / 2;
      wheelGroup.add(spoke);
    }
  }

  // Merkezi Göbek Yıldızı ve Altın Plaka
  const hubCapGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.5, 12);
  const goldMat = new THREE.MeshStandardMaterial({
    color: "#f1c40f",
    metalness: 0.8,
    roughness: 0.2,
  });
  disposables.push(hubCapGeo, goldMat);
  const hubCap = new THREE.Mesh(hubCapGeo, goldMat);
  hubCap.rotation.x = Math.PI / 2;
  wheelGroup.add(hubCap);

  // 24 Adet Çevre LED Kovalama Işığı (Perimeter LED Chase Lights)
  const ledGeo = new THREE.SphereGeometry(0.12, 6, 6);
  disposables.push(ledGeo);
  const chaseLights: { mesh: THREE.Mesh; angle: number; baseColor: THREE.Color }[] = [];

  const chaseColors = [
    new THREE.Color("#f1c40f"), // Altın sarısı
    new THREE.Color("#00cec9"), // Turkuaz
    new THREE.Color("#fd79a8"), // Pembe
    new THREE.Color("#f5f6fa"), // Beyaz
  ];

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const baseCol = chaseColors[i % chaseColors.length];
    const ledMat = new THREE.MeshStandardMaterial({
      color: baseCol,
      emissive: baseCol,
      emissiveIntensity: 0.8,
    });
    disposables.push(ledMat);

    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(
      Math.cos(angle) * wheelRadius,
      Math.sin(angle) * wheelRadius,
      0.72,
    );
    wheelGroup.add(ledMesh);
    chaseLights.push({ mesh: ledMesh, angle, baseColor: baseCol });
  }

  // =========================================================================
  // 4. 12 ADET ASILI YOLCU GONDOLU (12 Suspended Passenger Gondolas)
  // =========================================================================
  const gondolaCount = FERRIS_WHEEL_GONDOLA_COUNT;
  const gondolaPivots: THREE.Group[] = [];

  const gondolaColors = [
    "#f1c40f", // Sarı
    "#0984e3", // Mavi
    "#e74c3c", // Kırmızı
    "#2ecc71", // Zümrüt Yeşili
  ];

  const cabMatCache = gondolaColors.map((col) => {
    const m = mat(col, 0.4);
    disposables.push(m);
    return m;
  });

  const canopyMat = mat("#f5f6fa", 0.5);
  const benchMat = mat("#2d3436", 0.7);
  const acrylicMat = new THREE.MeshStandardMaterial({
    color: "#74b9ff",
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
  });
  disposables.push(canopyMat, benchMat, acrylicMat);

  for (let i = 0; i < gondolaCount; i++) {
    const angle = (i / gondolaCount) * Math.PI * 2;
    const pivot = new THREE.Group();
    // Mil ekseni üzerindeki montaj noktası
    pivot.position.set(
      Math.cos(angle) * (wheelRadius - 0.4),
      Math.sin(angle) * (wheelRadius - 0.4),
      0,
    );
    wheelGroup.add(pivot);
    gondolaPivots.push(pivot);

    // Askı Kolu (Hanger yoke)
    const hangerGroup = new THREE.Group();
    pivot.add(hangerGroup);
    box(hangerGroup, [0.08, 0.7, 1.45], [0, -0.35, 0], "#2d3436");

    // Gondol Kabini (Molded fiberglass tub)
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, -1.05, 0);
    pivot.add(cabGroup);

    const cabColorMat = cabMatCache[i % cabMatCache.length];
    // Kabin gövdesi
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.75, 1.1),
      cabColorMat,
    );
    bodyMesh.position.set(0, 0, 0);
    cabGroup.add(bodyMesh);
    disposables.push(bodyMesh.geometry);

    // Beyaz kubbeli tavan tentesi (Canopy)
    const canopyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.76, 0.18, 8),
      canopyMat,
    );
    canopyMesh.position.set(0, 0.45, 0);
    cabGroup.add(canopyMesh);
    disposables.push(canopyMesh.geometry);

    // Şeffaf yan cam panelleri
    const winMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), acrylicMat);
    winMesh1.position.set(0, 0.15, 0.56);
    cabGroup.add(winMesh1);
    const winMesh2 = winMesh1.clone();
    winMesh2.position.set(0, 0.15, -0.56);
    winMesh2.rotation.y = Math.PI;
    cabGroup.add(winMesh2);
    disposables.push(winMesh1.geometry);

    // İç koltuk bankı
    const seatMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.12, 0.35),
      benchMat,
    );
    seatMesh.position.set(0, -0.15, 0);
    cabGroup.add(seatMesh);
    disposables.push(seatMesh.geometry);
  }

  // =========================================================================
  // 5. NOSTALJİK BİLET GİŞESİ & KUYRUK KORDONU (Ticket Booth)
  // =========================================================================
  const boothGroup = new THREE.Group();
  boothGroup.position.set(-4.5, 0.55, -4.5);
  boothGroup.rotation.y = 0.5;
  group.add(boothGroup);

  // Gişe ana ahşap kulübesi
  box(boothGroup, [1.8, 2.3, 1.5], [0, 1.15, 0], "#c0392b"); // Kırmızı ahşap cephe
  box(boothGroup, [1.9, 0.15, 1.6], [0, 2.35, 0], "#2c3e50"); // Çatı saçak kenarı

  // Çizgili tente
  box(boothGroup, [2.0, 0.12, 0.75], [0, 2.05, 0.9], "#f5f6fa");

  // Gişe Servis Penceresi & Pirinç Parmaklık
  box(boothGroup, [0.85, 0.7, 0.08], [0, 1.35, 0.76], "#2c3e50");
  box(boothGroup, [1.0, 0.1, 0.35], [0, 0.95, 0.88], "#95a5a6"); // Servis bankosu

  // Işıklı Gişe Tabelası
  const boothSign = label("🎡 BİLET GİŞESİ · 15₺", "#f1c40f", "#2c3e50");
  boothSign.scale.set(2.4, 0.65, 1);
  boothSign.position.set(0, 2.65, 0.45);
  boothGroup.add(boothSign);

  // Bilet gişesi collider
  obstacles.push({
    minX: FERRIS_WHEEL_POS.x - 5.6,
    maxX: FERRIS_WHEEL_POS.x - 3.4,
    minZ: FERRIS_WHEEL_POS.z - 5.6,
    maxZ: FERRIS_WHEEL_POS.z - 3.4,
  });

  // =========================================================================
  // 6. ANİMASYONLU OPERATÖR NPC — "🎡 Lunaparkçı Şevket Usta"
  // =========================================================================
  const operatorGroup = new THREE.Group();
  operatorGroup.position.set(-1.8, 0.55, -3.8);
  operatorGroup.rotation.y = 0.2;
  group.add(operatorGroup);

  // Bacaklar
  box(operatorGroup, [0.18, 0.8, 0.2], [-0.14, 0.4, 0], "#2c3e50");
  box(operatorGroup, [0.18, 0.8, 0.2], [0.14, 0.4, 0], "#2c3e50");

  // Gövde (Mavi-Beyaz çizgili festival yeleği)
  const bodyMat = mat("#2980b9", 0.6);
  disposables.push(bodyMat);
  const opBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.3), bodyMat);
  opBody.position.set(0, 1.1, 0);
  operatorGroup.add(opBody);
  disposables.push(opBody.geometry);

  // Baş & Hasır Şapka (Straw boater hat with red ribbon)
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.28, 0.28),
    mat("#f1c40f", 0.8),
  );
  headMesh.position.set(0, 1.56, 0);
  operatorGroup.add(headMesh);
  disposables.push(headMesh.geometry);

  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.05, 10),
    mat("#e67e22", 0.7),
  );
  hatBrim.position.set(0, 1.72, 0);
  operatorGroup.add(hatBrim);
  disposables.push(hatBrim.geometry);

  // Sağ Kol (Bilet Zımbası Tutan Kol)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.3, 1.35, 0);
  box(rightArm, [0.12, 0.48, 0.12], [0, -0.22, 0], "#2980b9");
  box(rightArm, [0.08, 0.12, 0.2], [0, -0.48, 0.06], "#bdc3c7"); // Zımba
  operatorGroup.add(rightArm);

  // Sol Kol (Kullanıcıya / Kaptana El Sallayan Kol)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.3, 1.35, 0);
  box(leftArm, [0.12, 0.48, 0.12], [0, -0.22, 0], "#2980b9");
  operatorGroup.add(leftArm);

  // 3D Konuşma Balonu (Floating Speech Bubble)
  const speechBubbleGroup = new THREE.Group();
  speechBubbleGroup.position.set(0, 2.3, 0);
  speechBubbleGroup.visible = false;
  operatorGroup.add(speechBubbleGroup);

  const speechSign = label("🎡 Şevket: Hoş geldin!", "#f1c40f", "#2c3e50");
  speechSign.scale.set(2.8, 0.7, 1);
  speechBubbleGroup.add(speechSign);

  let opAnimTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      state: FerrisWheelState,
      playerPos = { x: 0, z: 0 },
      isNightOrDusk = false,
    ) {
      // 1. Çarkın Z eksenindeki sürekli dönüşü
      wheelGroup.rotation.z = state.wheelAngle;

      // 2. Her bir gondolun yerçekimine dik kalması (Counter-rotation)
      for (const pivot of gondolaPivots) {
        pivot.rotation.z = -state.wheelAngle;
      }

      // 3. LED kovalama ışıkları fazı ve gece parlama takviyesi
      const emissiveBoost = isNightOrDusk ? 2.4 : 0.9;
      for (let i = 0; i < chaseLights.length; i++) {
        const item = chaseLights[i];
        const phase = (state.chaseLightPhase + i * 0.45) % (Math.PI * 2);
        const brightness = 0.4 + Math.sin(phase) * 0.6;
        const m = item.mesh.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = brightness * emissiveBoost;
      }

      // 4. Operatör animasyonu ve el sallama
      opAnimTimer += dt * 3.5;
      const distToPlayer = Math.hypot(
        playerPos.x - (FERRIS_WHEEL_POS.x + operatorGroup.position.x),
        playerPos.z - (FERRIS_WHEEL_POS.z + operatorGroup.position.z),
      );

      const isWaving = state.honkGreetingTimer > 0 || distToPlayer <= 14.0;
      if (isWaving) {
        leftArm.rotation.z = -1.8 + Math.sin(opAnimTimer * 2.2) * 0.55;
        leftArm.rotation.x = Math.sin(opAnimTimer * 1.5) * 0.3;
      } else {
        leftArm.rotation.z = -0.15 + Math.sin(opAnimTimer * 0.6) * 0.08;
        leftArm.rotation.x = 0;
      }

      // Konuşma balonu kontrolü
      if (state.lastHonkCallout && state.honkGreetingTimer > 0) {
        speechBubbleGroup.visible = true;
      } else {
        speechBubbleGroup.visible = false;
      }
    },
    dispose() {
      for (const item of disposables) {
        item.dispose();
      }
      group.clear();
    },
  };
}
