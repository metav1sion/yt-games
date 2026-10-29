import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type GasStationState,
  FUEL_PUMP_POS,
  FUEL_PUMP_RADIUS,
  WASH_BAY_BOUNDS,
  GAS_STATION_POS,
} from "../game/gas-station";

export type GasStationView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: GasStationState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Mini Kargo — Sanayi/Çarşı Kavşağı Tam Teşekküllü Akaryakıt İstasyonu & Oto Yıkama (T36)
 * - Geniş kavisli ve aydınlatmalı saçak kanopi ("⛽ MİNİ PETROL · 7/24")
 * - Dijital LED ekranlı ikiz akaryakıt pompaları, dolum tabancaları ve hortumlar
 * - 7/24 Açık Market & Cafe ("🏪 MİNİ MARKET"), vitrin aydınlatması ve İstasyon Görevlisi Selim Usta NPC
 * - Dönen köpüklü fırçaları ve tazyikli su jetleri olan otomatik araç yıkama tüneli ("🚿 OTO YIKAMA")
 */
export function createGasStationView(): GasStationView {
  const group = new THREE.Group();
  group.name = "gas-station-view";

  const obstacles: Rect[] = [];

  // =========================================================================
  // 1. İSTASYON BETON TABANI (Forecourt Concrete Apron)
  // =========================================================================
  const apronX = 64.0;
  const apronZ = -9.2;
  const apronW = 18.0;
  const apronD = 11.5;

  // Ana apron beton levhası
  box(group, [apronW, 0.08, apronD], [apronX, 0.04, apronZ], "#bdc3c7");
  // İç asfalt sürüş koridorları
  box(group, [apronW - 0.8, 0.09, apronD - 0.8], [apronX, 0.045, apronZ], "#34495e");

  // Giriş/çıkış sarı yön okları ve güvenlik çizgileri
  for (const ox of [-5.5, 0, 5.5]) {
    box(group, [0.35, 0.015, 2.4], [apronX + ox, 0.095, apronZ + 4.2], "#f1c40f");
    box(group, [0.35, 0.015, 2.4], [apronX + ox, 0.095, apronZ - 4.2], "#f1c40f");
  }

  // =========================================================================
  // 2. MODERN IŞIKLI KANOPİ (Overhead Illuminated Cantilever Canopy)
  // =========================================================================
  const canopyX = 64.0;
  const canopyZ = -8.8;
  const canopyW = 12.8;
  const canopyD = 8.2;
  const canopyH = 4.2;

  const canopyGroup = new THREE.Group();
  canopyGroup.position.set(canopyX, 0, canopyZ);
  group.add(canopyGroup);

  // Üst tavan çatı levhası
  box(canopyGroup, [canopyW, 0.35, canopyD], [0, canopyH, 0], "#ecf0f1");
  // Alt asma tavan soffit kaplaması (koyu antrasit)
  box(canopyGroup, [canopyW - 0.2, 0.1, canopyD - 0.2], [0, canopyH - 0.2, 0], "#2c3e50");

  // Kırmızı & sarı estetik saçak alikobant alınlık (Fascia)
  const fasciaColor = "#d63031"; // Canlı istasyon kırmızısı
  box(canopyGroup, [canopyW + 0.3, 0.75, 0.2], [0, canopyH + 0.15, canopyD / 2 + 0.1], fasciaColor);
  box(canopyGroup, [canopyW + 0.3, 0.75, 0.2], [0, canopyH + 0.15, -canopyD / 2 - 0.1], fasciaColor);
  box(canopyGroup, [0.2, 0.75, canopyD + 0.3], [canopyW / 2 + 0.1, canopyH + 0.15, 0], fasciaColor);
  box(canopyGroup, [0.2, 0.75, canopyD + 0.3], [-canopyW / 2 - 0.1, canopyH + 0.15, 0], fasciaColor);

  // Sarı yarış çizgisi detayı (Fascia accent)
  box(canopyGroup, [canopyW + 0.35, 0.12, 0.22], [0, canopyH - 0.15, canopyD / 2 + 0.11], "#f1c40f");
  box(canopyGroup, [canopyW + 0.35, 0.12, 0.22], [0, canopyH - 0.15, -canopyD / 2 - 0.11], "#f1c40f");

  // Işıklı marka tabelaları (Ön ve Arka Alınlık)
  const frontSign = label("⛽ MİNİ PETROL · 7/24", "#ffffff", "#c0392b");
  frontSign.scale.set(3.8, 0.55, 1);
  frontSign.position.set(0, canopyH + 0.18, canopyD / 2 + 0.25);
  canopyGroup.add(frontSign);

  const rearSign = label("⛽ MİNİ PETROL · 7/24", "#ffffff", "#c0392b");
  rearSign.scale.set(3.8, 0.55, 1);
  rearSign.position.set(0, canopyH + 0.18, -canopyD / 2 - 0.25);
  rearSign.rotation.y = Math.PI;
  canopyGroup.add(rearSign);

  // 4 Adet Çelik Taşıyıcı Kolon ve Çarpma Koruma Babaları
  const columnPositions = [
    [-3.8, -2.4],
    [-3.8, 2.4],
    [3.8, -2.4],
    [3.8, 2.4],
  ];

  const downlightMeshes: THREE.Mesh[] = [];

  for (const [cx, cz] of columnPositions) {
    // Çelik kolon borusu
    cylinder(canopyGroup, 0.14, 0.14, canopyH, [cx, canopyH / 2, cz], "#7f8c8d", 8);
    // Sarı-siyah çarpışma koruma babası
    cylinder(canopyGroup, 0.35, 0.35, 0.75, [cx, 0.38, cz], "#f1c40f", 8);
    cylinder(canopyGroup, 0.37, 0.37, 0.14, [cx, 0.55, cz], "#2c3e50", 8);

    // Engel (kolon çarpışma kutusu)
    obstacles.push({
      minX: canopyX + cx - 0.45,
      maxX: canopyX + cx + 0.45,
      minZ: canopyZ + cz - 0.45,
      maxZ: canopyZ + cz + 0.45,
    });
  }

  // Kanopi Tavan Gömme Spot Işıkları (6 adet)
  const spotPositions = [
    [-3.0, -1.2],
    [0.0, -1.2],
    [3.0, -1.2],
    [-3.0, 1.2],
    [0.0, 1.2],
    [3.0, 1.2],
  ];

  for (const [sx, sz] of spotPositions) {
    const fixture = cylinder(
      canopyGroup,
      0.32,
      0.32,
      0.06,
      [sx, canopyH - 0.22, sz],
      "#ffffff",
      10,
    );
    downlightMeshes.push(fixture);
  }

  // =========================================================================
  // 3. İKİZ AKARYAKIT ADALARI & POMPALARI (Fuel Dispenser Islands)
  // =========================================================================
  const islandConfigs = [
    { z: -1.5, name: "POMPA 1-2" },
    { z: 1.5, name: "POMPA 3-4" },
  ];

  const pumpLedMaterials: THREE.MeshBasicMaterial[] = [];

  for (const cfg of islandConfigs) {
    const iGroup = new THREE.Group();
    iGroup.position.set(0, 0, cfg.z);
    canopyGroup.add(iGroup);

    // Yükseltilmiş beton ada kaidesi (curbed island)
    box(iGroup, [3.8, 0.22, 1.1], [0, 0.11, 0], "#bdc3c7");
    cylinder(iGroup, 0.55, 0.55, 0.22, [-1.9, 0.11, 0], "#bdc3c7", 8);
    cylinder(iGroup, 0.55, 0.55, 0.22, [1.9, 0.11, 0], "#bdc3c7", 8);

    // Paslanmaz çelik darbe koruma bordür şeritleri
    box(iGroup, [3.82, 0.05, 1.12], [0, 0.21, 0], "#ecf0f1");

    // Akaryakıt Pompası Dispenser Gövdesi (Modern kırmızı/beyaz)
    const dispenserW = 0.85;
    const dispenserH = 1.7;
    const dispenserD = 0.55;
    box(iGroup, [dispenserW, dispenserH, dispenserD], [0, 0.22 + dispenserH / 2, 0], "#ecf0f1");
    box(iGroup, [dispenserW + 0.04, 0.15, dispenserD + 0.04], [0, 0.22 + dispenserH + 0.08, 0], "#d63031");

    // Dijital LED Gösterge Ekranı (Ön ve Arka Yüz)
    for (const side of [-1, 1]) {
      const ledZ = (dispenserD / 2 + 0.02) * side;
      const ledMat = new THREE.MeshBasicMaterial({ color: "#00f0ff" });
      pumpLedMaterials.push(ledMat);

      const ledGeom = new THREE.BoxGeometry(0.55, 0.35, 0.02);
      const ledMesh = new THREE.Mesh(ledGeom, ledMat);
      ledMesh.position.set(0, 1.35, ledZ);
      iGroup.add(ledMesh);

      // Pompa numarası etiketi
      box(iGroup, [0.35, 0.14, 0.02], [0, 1.62, ledZ], "#2c3e50");
    }

    // Esnek kauçuk yakıt hortumları ve nozullar (Tabancalar)
    for (const hx of [-dispenserW / 2 - 0.08, dispenserW / 2 + 0.08]) {
      // Sarkan siyah hortum
      cylinder(iGroup, 0.025, 0.025, 0.95, [hx, 0.85, 0], "#111111", 6);
      // Yeşil (Dizel) ve Mavi (Benzin) tabanca yuvaları
      const nozzleColor = hx < 0 ? "#2ecc71" : "#0984e3";
      box(iGroup, [0.08, 0.22, 0.1], [hx, 1.1, 0], nozzleColor);
    }

    // Ada üstü kuru kimyevi yangın söndürme tüpü
    cylinder(iGroup, 0.1, 0.1, 0.45, [-1.5, 0.45, 0], "#e74c3c", 8);

    // Engel
    obstacles.push({
      minX: canopyX - 2.0,
      maxX: canopyX + 2.0,
      minZ: canopyZ + cfg.z - 0.65,
      maxZ: canopyZ + cfg.z + 0.65,
    });
  }

  // Pompa Üstü Yüzen Etkileşim Göstergesi & Dolum İlerleme Halkası
  const promptGroup = new THREE.Group();
  promptGroup.position.set(canopyX, 2.6, canopyZ);
  group.add(promptGroup);

  const promptSign = label("⛽ AKARYAKIT & BAKIM", "#ffffff", "#27ae60");
  promptSign.scale.set(1.9, 0.45, 1);
  promptGroup.add(promptSign);

  // Dolum İlerleme Çubuğu / Halkası
  const progressBg = cylinder(promptGroup, 0.7, 0.7, 0.04, [0, -0.4, 0], "#2c3e50", 16);
  progressBg.rotation.x = Math.PI / 2;
  const progressFill = cylinder(promptGroup, 0.68, 0.68, 0.05, [0, -0.4, 0], "#00f0ff", 16);
  progressFill.rotation.x = Math.PI / 2;
  progressFill.visible = false;

  // =========================================================================
  // 4. 7/24 MİNİ MARKET & CAFE ("MİNİ MARKET")
  // =========================================================================
  const storeX = 70.8;
  const storeZ = -11.6;
  const storeW = 6.4;
  const storeD = 4.6;
  const storeH = 3.6;

  const storeGroup = new THREE.Group();
  storeGroup.position.set(storeX, 0, storeZ);
  group.add(storeGroup);

  // Market Ana Binası (Modern mimari antrasit ve beyaz paneller)
  box(storeGroup, [storeW, storeH, storeD], [0, storeH / 2, 0], "#f5f6fa");
  box(storeGroup, [storeW + 0.2, 0.35, storeD + 0.2], [0, storeH + 0.18, 0], "#2c3e50");

  // Ön Cephe Cam Vitrini (Cam cephe & sıcak iç aydınlatma simülasyonu)
  box(storeGroup, [storeW - 1.2, 2.4, 0.1], [0, 1.45, storeD / 2 + 0.05], "#34495e");
  const glassMat = new THREE.MeshBasicMaterial({ color: "#fceea7", transparent: true, opacity: 0.85 });
  const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(storeW - 1.5, 2.1, 0.08), glassMat);
  glassMesh.position.set(0, 1.45, storeD / 2 + 0.07);
  storeGroup.add(glassMesh);

  // Giriş Otomatik Kayar Kapısı
  box(storeGroup, [1.4, 2.2, 0.12], [0, 1.1, storeD / 2 + 0.08], "#2c3e50");
  box(storeGroup, [0.6, 2.0, 0.05], [-0.32, 1.1, storeD / 2 + 0.1], "#dff9fb", 0.6);
  box(storeGroup, [0.6, 2.0, 0.05], [0.32, 1.1, storeD / 2 + 0.1], "#dff9fb", 0.6);

  // Işıklı Market Tabela Alınlığı
  const storeSign = label("🏪 MİNİ MARKET · 24s AÇIK", "#ffffff", "#27ae60");
  storeSign.scale.set(3.2, 0.55, 1);
  storeSign.position.set(0, storeH - 0.2, storeD / 2 + 0.2);
  storeGroup.add(storeSign);

  // Market Yanı Hava & Su Kulesi (Air & Water Tower)
  const airTowerGroup = new THREE.Group();
  airTowerGroup.position.set(storeX - storeW / 2 - 1.0, 0, storeZ + storeD / 2 - 0.5);
  box(airTowerGroup, [0.5, 1.3, 0.35], [0, 0.65, 0], "#3498db");
  box(airTowerGroup, [0.35, 0.35, 0.04], [0, 0.95, 0.18], "#ffffff");
  cylinder(airTowerGroup, 0.02, 0.02, 0.7, [0.26, 0.6, 0], "#111111", 6);
  const airSign = label("HAVA · SU", "#ffffff", "#2980b9");
  airSign.scale.set(0.65, 0.2, 1);
  airSign.position.set(0, 1.45, 0);
  airTowerGroup.add(airSign);
  group.add(airTowerGroup);

  // A-Frame Cafe Menü Kara Tahtası ("☕ Taze Çay & Kahve")
  const boardGroup = new THREE.Group();
  boardGroup.position.set(storeX - 1.8, 0, storeZ + storeD / 2 + 1.2);
  boardGroup.rotation.y = 0.3;
  box(boardGroup, [0.65, 0.85, 0.06], [0, 0.45, 0], "#2c3e50");
  const coffeeSign = label("☕ ÇAY & KAHVE", "#f1c40f", "#2c3e50");
  coffeeSign.scale.set(0.6, 0.22, 1);
  coffeeSign.position.set(0, 0.6, 0.05);
  boardGroup.add(coffeeSign);
  group.add(boardGroup);

  // Market Binası Engeli
  obstacles.push({
    minX: storeX - storeW / 2 - 0.2,
    maxX: storeX + storeW / 2 + 0.2,
    minZ: storeZ - storeD / 2 - 0.2,
    maxZ: storeZ + storeD / 2 + 0.2,
  });

  // =========================================================================
  // 5. İSTASYON GÖREVLİSİ SELİM USTA NPC
  // =========================================================================
  const attendantGroup = new THREE.Group();
  // Market kapısı önünde bekliyor
  attendantGroup.position.set(storeX - 1.2, 0, storeZ + storeD / 2 + 0.6);
  attendantGroup.rotation.y = -Math.PI / 4;
  group.add(attendantGroup);

  // Bacaklar (Lacivert iş pantolonu)
  box(attendantGroup, [0.14, 0.65, 0.16], [-0.1, 0.32, 0], "#2c3e50");
  box(attendantGroup, [0.14, 0.65, 0.16], [0.1, 0.32, 0], "#2c3e50");
  // Ayakkabılar
  box(attendantGroup, [0.15, 0.1, 0.24], [-0.1, 0.05, 0.04], "#1e272e");
  box(attendantGroup, [0.15, 0.1, 0.24], [0.1, 0.05, 0.04], "#1e272e");

  // Gövde (Kırmızı istasyon üniforması)
  box(attendantGroup, [0.42, 0.55, 0.26], [0, 0.92, 0], "#e74c3c");
  // Sarı yaka ve kimlik kartı
  box(attendantGroup, [0.15, 0.08, 0.02], [0, 1.15, 0.14], "#f1c40f");
  box(attendantGroup, [0.08, 0.1, 0.02], [0.12, 1.0, 0.14], "#ecf0f1");

  // Kafa ve Şapka
  const attendantHead = new THREE.Group();
  attendantHead.position.set(0, 1.35, 0);
  box(attendantHead, [0.22, 0.22, 0.22], [0, 0, 0], "#f5cd79");
  // Kırmızı istasyon şapkası ve siperliği
  box(attendantHead, [0.24, 0.1, 0.24], [0, 0.12, 0], "#c0392b");
  box(attendantHead, [0.24, 0.03, 0.15], [0, 0.08, 0.16], "#c0392b");
  attendantGroup.add(attendantHead);

  // Kollar ve El Sallama Mafsalı
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 1.15, 0);
  box(leftArm, [0.11, 0.5, 0.12], [0, -0.22, 0], "#e74c3c");
  box(leftArm, [0.09, 0.12, 0.09], [0, -0.5, 0], "#f5cd79");
  attendantGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 1.15, 0);
  box(rightArm, [0.11, 0.5, 0.12], [0, -0.22, 0], "#e74c3c");
  box(rightArm, [0.09, 0.12, 0.09], [0, -0.5, 0], "#f5cd79");
  attendantGroup.add(rightArm);

  // Konuşma Balonu
  const attendantBubble = label("⛽ Hoşgeldiniz kaptan!", "#2c3e50", "#ffffff");
  attendantBubble.scale.set(1.8, 0.45, 1);
  attendantBubble.position.set(0, 1.85, 0);
  attendantBubble.visible = false;
  attendantGroup.add(attendantBubble);

  // =========================================================================
  // 6. OTOMATİK ARAÇ YIKAMA TÜNELİ (Automated Car Wash Bay)
  // =========================================================================
  const washX = 58.2;
  const washZ = -9.0;
  const washW = 4.6;
  const washH = 3.6;
  const washD = 6.8;

  const washGroup = new THREE.Group();
  washGroup.position.set(washX, 0, washZ);
  group.add(washGroup);

  // Yıkama Zemin Izgarası (Drenaj kanalı)
  box(washGroup, [3.6, 0.02, washD - 0.4], [0, 0.05, 0], "#1e272e");
  for (let z = -washD / 2 + 0.8; z <= washD / 2 - 0.8; z += 0.8) {
    box(washGroup, [3.4, 0.015, 0.15], [0, 0.065, z], "#57606f");
  }

  // Sol ve Sağ Taşıyıcı Duvar Kemerleri (Portal Walls)
  const wallThick = 0.45;
  box(washGroup, [wallThick, washH, washD], [-washW / 2 + wallThick / 2, washH / 2, 0], "#3498db");
  box(washGroup, [wallThick, washH, washD], [washW / 2 - wallThick / 2, washH / 2, 0], "#3498db");
  // Üst Kemer Tavanı
  box(washGroup, [washW, 0.4, washD], [0, washH, 0], "#2980b9");

  // Yıkama Giriş ve Çıkış Tabela Alınlıkları
  const washSignFront = label("🚿 OTO YIKAMA", "#ffffff", "#0984e3");
  washSignFront.scale.set(2.6, 0.5, 1);
  washSignFront.position.set(0, washH + 0.4, washD / 2 + 0.05);
  washGroup.add(washSignFront);

  const washSignRear = label("🚿 OTO YIKAMA", "#ffffff", "#0984e3");
  washSignRear.scale.set(2.6, 0.5, 1);
  washSignRear.position.set(0, washH + 0.4, -washD / 2 - 0.05);
  washSignRear.rotation.y = Math.PI;
  washGroup.add(washSignRear);

  // Dönen Köpüklü Fırça Ruloları (Rotating Foam Rollers)
  // 1. Sol dikey mavi fırça
  const leftRollerGroup = new THREE.Group();
  leftRollerGroup.position.set(-1.35, 1.4, 0);
  cylinder(leftRollerGroup, 0.45, 0.45, 2.4, [0, 0, 0], "#00cec9", 12);
  cylinder(leftRollerGroup, 0.48, 0.48, 0.25, [0, 0.5, 0], "#0984e3", 12);
  cylinder(leftRollerGroup, 0.48, 0.48, 0.25, [0, -0.5, 0], "#0984e3", 12);
  cylinder(leftRollerGroup, 0.05, 0.05, 2.7, [0, 0, 0], "#718093", 6); // Çelik mil
  washGroup.add(leftRollerGroup);

  // 2. Sağ dikey mavi fırça
  const rightRollerGroup = new THREE.Group();
  rightRollerGroup.position.set(1.35, 1.4, 0);
  cylinder(rightRollerGroup, 0.45, 0.45, 2.4, [0, 0, 0], "#00cec9", 12);
  cylinder(rightRollerGroup, 0.48, 0.48, 0.25, [0, 0.5, 0], "#0984e3", 12);
  cylinder(rightRollerGroup, 0.48, 0.48, 0.25, [0, -0.5, 0], "#0984e3", 12);
  cylinder(rightRollerGroup, 0.05, 0.05, 2.7, [0, 0, 0], "#718093", 6); // Çelik mil
  washGroup.add(rightRollerGroup);

  // 3. Üst yatay sarı tavan fırçası
  const topRollerGroup = new THREE.Group();
  topRollerGroup.position.set(0, 2.4, 0);
  const topRoller = cylinder(topRollerGroup, 0.4, 0.4, 2.6, [0, 0, 0], "#f1c40f", 12);
  topRoller.rotation.z = Math.PI / 2;
  const topMil = cylinder(topRollerGroup, 0.05, 0.05, 3.0, [0, 0, 0], "#718093", 6);
  topMil.rotation.z = Math.PI / 2;
  washGroup.add(topRollerGroup);

  // Yıkama Tüneli Yan Duvar Engelleri (Araç tünelin içinden serbestçe geçer)
  obstacles.push({
    minX: washX - washW / 2,
    maxX: washX - washW / 2 + wallThick + 0.1,
    minZ: washZ - washD / 2,
    maxZ: washZ + washD / 2,
  });
  obstacles.push({
    minX: washX + washW / 2 - wallThick - 0.1,
    maxX: washX + washW / 2,
    minZ: washZ - washD / 2,
    maxZ: washZ + washD / 2,
  });

  // State ve animasyon değişkenleri
  let bubbleTimer = 0;
  let waveTimer = 0;
  let animTime = 0;

  return {
    group,
    obstacles,

    update(
      dt: number,
      state: GasStationState,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      animTime += dt;

      // 1. Kanopi Gece Aydınlatması & Spot Emissive Güncellemesi
      const emissiveColor = isNightOrDusk ? "#fff5cc" : "#ffffff";
      const emissiveIntensity = isNightOrDusk ? 1.4 : 0.2;
      for (const spot of downlightMeshes) {
        const m = spot.material as THREE.MeshStandardMaterial;
        if (m) {
          m.emissive = new THREE.Color(emissiveColor);
          m.emissiveIntensity = emissiveIntensity;
        }
      }

      // Pompa LED'lerinin gece parlaması
      for (const m of pumpLedMaterials) {
        m.color.set(isNightOrDusk ? "#55ffff" : "#00f0ff");
      }

      // 2. Akaryakıt Pompası Dolum İlerlemesi
      if (state.pumpProgress > 0) {
        promptGroup.position.y = 2.6 + Math.sin(animTime * 4) * 0.08;
        progressFill.visible = true;
        const scale = THREE.MathUtils.clamp(state.pumpProgress, 0.05, 1.0);
        progressFill.scale.set(scale, 1, scale);
      } else {
        progressFill.visible = false;
        promptGroup.position.y = 2.6;
      }

      // 3. Oto Yıkama Fırçalarının Dönüşü
      if (state.isWashing) {
        const spinSpeed = 16.0;
        leftRollerGroup.rotation.y += dt * spinSpeed;
        rightRollerGroup.rotation.y -= dt * spinSpeed;
        topRollerGroup.rotation.x += dt * spinSpeed;

        // Fırçalarda hafif salınım / esneme
        leftRollerGroup.position.x = -1.35 + Math.sin(animTime * 12) * 0.06;
        rightRollerGroup.position.x = 1.35 - Math.sin(animTime * 12) * 0.06;
        topRollerGroup.position.y = 2.4 + Math.cos(animTime * 10) * 0.05;
      } else {
        // Yavaşça durma konumuna dön
        leftRollerGroup.position.x = THREE.MathUtils.lerp(leftRollerGroup.position.x, -1.35, dt * 4);
        rightRollerGroup.position.x = THREE.MathUtils.lerp(rightRollerGroup.position.x, 1.35, dt * 4);
        topRollerGroup.position.y = THREE.MathUtils.lerp(topRollerGroup.position.y, 2.4, dt * 4);
      }

      // 4. Selim Usta NPC Davranışı (Kafa takibi, el sallama ve konuşma balonu)
      if (playerPos) {
        const distToAttendant = Math.hypot(
          playerPos.x - attendantGroup.position.x,
          playerPos.z - attendantGroup.position.z,
        );

        if (distToAttendant < 12.0) {
          // Kafasını arabaya doğru çevir
          const targetYaw =
            Math.atan2(
              playerPos.x - attendantGroup.position.x,
              playerPos.z - attendantGroup.position.z,
            ) - attendantGroup.rotation.y;
          const clampedYaw = Math.max(-1.1, Math.min(1.1, targetYaw));
          attendantHead.rotation.y = THREE.MathUtils.lerp(
            attendantHead.rotation.y,
            clampedYaw,
            dt * 5,
          );

          // Yakın duruşta el salla
          if (distToAttendant < 6.0) {
            waveTimer = 1.5;
            if (bubbleTimer <= 0) {
              bubbleTimer = 4.0;
              attendantBubble.visible = true;
            }
          }
        } else {
          attendantHead.rotation.y = THREE.MathUtils.lerp(attendantHead.rotation.y, 0, dt * 2);
        }
      }

      // Konuşma balonu ve el sallama zamanlayıcıları
      if (waveTimer > 0) {
        waveTimer -= dt;
        rightArm.rotation.x = -Math.PI / 1.5 + Math.sin(animTime * 12) * 0.45;
        rightArm.rotation.z = Math.sin(animTime * 8) * 0.25;
      } else {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, dt * 4);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0, dt * 4);
      }

      if (bubbleTimer > 0) {
        bubbleTimer -= dt;
        if (bubbleTimer <= 0) {
          attendantBubble.visible = false;
        }
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - attendantGroup.position.x,
        playerPos.z - attendantGroup.position.z,
      );
      if (dist < 18.0) {
        waveTimer = 2.5;
        bubbleTimer = 3.5;
        attendantBubble.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      group.clear();
      obstacles.length = 0;
    },
  };
}
