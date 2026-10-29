import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type LighthouseState,
  LIGHTHOUSE_CENTER,
  LIGHTHOUSE_BAY,
  RIZA_KAPTAN_POS,
  RIZA_KAPTAN_CALLOUTS,
} from "../game/lighthouse";

export type LighthouseView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: LighthouseState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sahil "Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı" (T53)
 * - Otantik Kıyı Deniz Feneri Mimarisi:
 *   - Deniz içinde masif sekizgen granit taş dalgakıran kaidesi ve dalgakıran kayalıkları (tetrapod / granite riprap)
 *   - 15 metre yüksekliğinde, 5 katmanlı konik kırmızı-beyaz şeritli tarihi kule gövdesi
 *   - Ahşap kemerli kule giriş kapısı ("1884"), bronz gözetleme pencereleri
 *   - Kuleden kaideye uzanan renkli denizci işaret sancakları (maritime signal pennants)
 *   - Konsollu döküm demir seyir terası ve güvenlik korkulukları (Gallery Balcony)
 *   - 12 yüzeyli cam fener odası, pirinç Fresnel merceği göbeği ve sıcak PointLight aydınlatması
 *   - Dönen hacimsel deniz arama ışığı huzmesi (volumetric sweeping searchlight beam)
 *   - Patinalı yeşil bakır kubbe çatısı ve yelkenli gemi figürlü pirinç rüzgar gülü (weathervane)
 *   - Kordon boyu rıhtım peronu (LIGHTHOUSE_BAY: X: -28.0, Z: 82.0), pirinç pusula gülü mozaiği
 *   - Tarihi bronz anıt plaketi ("⚓ TARİHİ DENİZ FENERİ & KIYI KURTARMA RIHTIMI · 1884")
 *   - Palamar babası, jüt halat yığını ve can simidi güvenlik istasyonu
 * - Animasyonlu Fenerci Kaptan NPC — "Fenerci Rıza Kaptan" (X: -26.5, Z: 83.8):
 *   - Sarı muşamba denizci yağmurluğu (oilskin slicker), kaptan kasketi, pos bıyık
 *   - Pirinç ayaklı sahil deniz dürbünü (tripod telescope) ile ufku tarama
 *   - Oyuncu aracına yönelen baş/gövde takibi (head tracking)
 *   - Korna ve duraklamada iki koluyla coşkulu denizci selamı ve 3D konuşma balonu
 */
export function createLighthouseView(): LighthouseView {
  const group = new THREE.Group();
  group.name = "lighthouse-view";
  const obstacles: Rect[] = [];

  const cx = LIGHTHOUSE_CENTER.x; // -28.0
  const cz = LIGHTHOUSE_CENTER.z; // 91.0

  // =========================================================================
  // 1. TAŞ DALGAKIRAN KAİDESİ VE KAYALIKLAR (Breakwater Plinth & Boulders)
  // =========================================================================
  const plinthGroup = new THREE.Group();
  plinthGroup.position.set(cx, 0, cz);
  group.add(plinthGroup);

  // Sekizgen granit ana kaide tablası (deniz yüzeyinden yükselir)
  cylinder(plinthGroup, 3.8, 4.2, 1.1, [0, 0.55, 0], "#4a5568", 12);
  cylinder(plinthGroup, 3.4, 3.7, 0.35, [0, 1.25, 0], "#2d3748", 12);

  // Dalga kırıcı granit kayalar ve bloklar (Granite Riprap Boulders in Water)
  const rockOffsets = [
    { x: -3.8, z: 1.2, s: 1.25, rot: 0.4, col: "#374151" },
    { x: 3.6, z: 1.8, s: 1.1, rot: -0.8, col: "#4b5563" },
    { x: -2.8, z: -3.2, s: 1.3, rot: 1.2, col: "#1f2937" },
    { x: 3.2, z: -2.9, s: 1.15, rot: 0.9, col: "#374151" },
    { x: -4.1, z: -1.0, s: 1.2, rot: -0.3, col: "#4b5563" },
    { x: 4.2, z: -0.6, s: 1.35, rot: 1.7, col: "#1f2937" },
    { x: 0.0, z: 4.1, s: 1.4, rot: 0.2, col: "#374151" },
    { x: -1.6, z: 4.0, s: 1.05, rot: -1.1, col: "#4b5563" },
    { x: 1.8, z: 3.9, s: 1.1, rot: 0.7, col: "#1f2937" },
  ];

  for (const r of rockOffsets) {
    const rock = box(plinthGroup, [1.4 * r.s, 0.9 * r.s, 1.3 * r.s], [r.x, 0.45 * r.s, r.z], r.col);
    rock.rotation.y = r.rot;
    rock.rotation.x = 0.15 * Math.sin(r.rot);
  }

  // Dalgakırandan kıyıya doğru uzanan taş rıhtım iskelesi geçidi (Stone Quay Causeway)
  box(group, [2.4, 0.4, 3.6], [cx, 0.4, cz - 3.8], "#4a5568");
  box(group, [2.6, 0.1, 3.8], [cx, 0.62, cz - 3.8], "#718096");

  // Rıhtım palamar babaları (Mooring Bollards on Jetty)
  cylinder(group, 0.12, 0.12, 0.5, [cx - 1.1, 0.85, cz - 2.8], "#111827", 8);
  cylinder(group, 0.12, 0.12, 0.5, [cx + 1.1, 0.85, cz - 2.8], "#111827", 8);
  cylinder(group, 0.12, 0.12, 0.5, [cx - 1.1, 0.85, cz - 4.6], "#111827", 8);
  cylinder(group, 0.12, 0.12, 0.5, [cx + 1.1, 0.85, cz - 4.6], "#111827", 8);

  // Kule giriş kapısı ve taş sundurma eşiği (Facing North towards shore)
  box(plinthGroup, [1.1, 1.8, 0.25], [0, 2.0, -2.5], "#2c3e50"); // Masif ahşap kapı
  box(plinthGroup, [1.3, 0.15, 0.4], [0, 1.1, -2.6], "#718096");  // Giriş taş eşiği
  box(plinthGroup, [1.25, 0.2, 0.3], [0, 2.95, -2.55], "#4a5568"); // Kapı üstü taş kemer sövesi

  // Kapı üstü bronz "1884" plaka levhası
  const dateBadge = label("1884", "#f1c40f", "#2c3e50");
  dateBadge.scale.set(0.65, 0.22, 1);
  dateBadge.position.set(0, 3.12, -2.6);
  plinthGroup.add(dateBadge);

  // Giriş kapısı feneri (Doorway brass marine sconce)
  cylinder(plinthGroup, 0.03, 0.03, 0.2, [0.75, 2.4, -2.5], "#d35400", 6);
  const doorLightMesh = cylinder(plinthGroup, 0.08, 0.08, 0.16, [0.75, 2.48, -2.42], "#f1c40f", 8);
  if (doorLightMesh.material instanceof THREE.MeshStandardMaterial) {
    doorLightMesh.material.emissive.set("#f39c12");
    doorLightMesh.material.emissiveIntensity = 0.8;
  }

  // =========================================================================
  // 2. TARİHİ KIRMIZI-BEYAZ KONİK KULE GÖVDESİ (5 Tiered Tapered Tower)
  // =========================================================================
  const towerBands = [
    { yBottom: 1.4, yTop: 3.3, rBottom: 2.35, rTop: 2.15, color: "#c0392b" }, // Kırmızı alt kat
    { yBottom: 3.3, yTop: 5.2, rBottom: 2.15, rTop: 1.9, color: "#f5f6fa" },  // Beyaz kat
    { yBottom: 5.2, yTop: 7.0, rBottom: 1.9, rTop: 1.65, color: "#c0392b" },  // Kırmızı orta kat
    { yBottom: 7.0, yTop: 8.8, rBottom: 1.65, rTop: 1.4, color: "#f5f6fa" },  // Beyaz kat
    { yBottom: 8.8, yTop: 10.2, rBottom: 1.4, rTop: 1.22, color: "#c0392b" }, // Kırmızı üst kat
  ];

  for (const b of towerBands) {
    const h = b.yTop - b.yBottom;
    const yCenter = b.yBottom + h / 2;
    cylinder(plinthGroup, b.rTop, b.rBottom, h, [0, yCenter, 0], b.color, 16);
  }

  // Kule Gözetleme Pencereleri (Kuzey & Batı yönlerine bakan bronz kemerli pencereler)
  box(plinthGroup, [0.42, 0.72, 0.15], [0, 4.3, -2.05], "#1a202c"); // Kuzeye bakan alt pencere
  box(plinthGroup, [0.38, 0.64, 0.15], [0, 7.9, -1.55], "#1a202c"); // Kuzeye bakan üst pencere
  box(plinthGroup, [0.15, 0.68, 0.42], [-1.8, 6.1, 0], "#1a202c");  // Batı deniz yönü penceresi

  // =========================================================================
  // 3. DENİZCİ İŞARET SANCAKLARI / FLAMALARI (Maritime Signal Flags Halyard)
  // =========================================================================
  // Seyir terasından kaideye gerilmiş işaret flamaları
  const flagColors = ["#f1c40f", "#2980b9", "#e74c3c", "#ffffff", "#27ae60", "#e67e22", "#34495e"];
  const numFlags = 7;
  for (let i = 0; i < numFlags; i++) {
    const t = (i + 1) / (numFlags + 1);
    const fx = 1.35 + (2.7 - 1.35) * (1 - t);
    const fy = 10.1 * t + 1.6 * (1 - t);
    const fz = 0.5 + Math.sin(t * Math.PI) * 0.4;
    const fColor = flagColors[i % flagColors.length];
    const flagMesh = box(plinthGroup, [0.32, 0.22, 0.02], [fx, fy, fz], fColor);
    flagMesh.rotation.z = -0.35;
    flagMesh.rotation.y = 0.2;
  }
  // İnce flama halatı
  cylinder(plinthGroup, 0.012, 0.012, 9.6, [2.05, 5.85, 0.7], "#dcdde1", 4).rotation.z = -0.32;

  // =========================================================================
  // 4. DÖKÜM DEMİR SEYİR TERASI & KORKULUKLAR (Gallery Balcony)
  // =========================================================================
  // Konsol çıkması
  cylinder(plinthGroup, 1.9, 1.9, 0.22, [0, 10.31, 0], "#1a202c", 16);
  // Taşıyıcı konsol ayakları
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const kx = Math.cos(a) * 1.5;
    const kz = Math.sin(a) * 1.5;
    box(plinthGroup, [0.15, 0.35, 0.3], [kx, 10.05, kz], "#2d3748").rotation.y = -a;
  }
  // Korkuluk üst çemberi
  cylinder(plinthGroup, 1.86, 1.86, 0.06, [0, 10.95, 0], "#2d3748", 16);
  // Korkuluk dikey dikmeleri
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    const rx = Math.cos(a) * 1.82;
    const rz = Math.sin(a) * 1.82;
    cylinder(plinthGroup, 0.03, 0.03, 0.65, [rx, 10.65, rz], "#2d3748", 4);
  }

  // =========================================================================
  // 5. CAM FENER ODASI & FRESNEL MERCEĞİ (Lantern Room & Fresnel Core)
  // =========================================================================
  const glassMat = mat("#74b9ff", 0.32);
  const glassGeo = new THREE.CylinderGeometry(1.3, 1.3, 1.6, 12);
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.set(0, 11.2, 0);
  plinthGroup.add(glassMesh);

  // Bronz dikey cam bölme çıtaları (Struts)
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const sx = Math.cos(a) * 1.3;
    const sz = Math.sin(a) * 1.3;
    cylinder(plinthGroup, 0.04, 0.04, 1.6, [sx, 11.2, sz], "#d35400", 6);
  }

  // Fresnel merceği pirinç göbeği ve akkor ampul (Emissive Core Bulb)
  const bulbCore = cylinder(plinthGroup, 0.48, 0.48, 0.75, [0, 11.2, 0], "#fff799", 10);
  if (bulbCore.material instanceof THREE.MeshStandardMaterial) {
    bulbCore.material.emissive.set("#fffa65");
    bulbCore.material.emissiveIntensity = 0.9;
  }

  // Fener odası PointLight aydınlatması (Kıyıya ve denize yayılan sıcak sarı ışık)
  const lanternLight = new THREE.PointLight("#fffa65", 1.2, 42, 1.2);
  lanternLight.position.set(cx, 11.2, cz);
  group.add(lanternLight);

  // =========================================================================
  // 6. DÖNEN VOLUMETRİK DENİZ ARAMA IŞIĞI (Sweeping Searchlight Beam)
  // =========================================================================
  const beamGroup = new THREE.Group();
  beamGroup.position.set(0, 11.2, 0);
  plinthGroup.add(beamGroup);

  const beamGeo = new THREE.CylinderGeometry(0.25, 3.6, 26, 16, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, 13);
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fff7c2",
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamGroup.add(beamMesh);

  // Zıt yöne hafif ikincil arka huzme (Dual-side lighthouse optic)
  const backBeamGeo = new THREE.CylinderGeometry(0.18, 2.2, 16, 12, 1, true);
  backBeamGeo.rotateX(-Math.PI / 2);
  backBeamGeo.translate(0, 0, -8);
  const backBeamMat = new THREE.MeshBasicMaterial({
    color: "#fff7c2",
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const backBeamMesh = new THREE.Mesh(backBeamGeo, backBeamMat);
  beamGroup.add(backBeamMesh);

  // =========================================================================
  // 7. PATİNALI YEŞİL BAKIR KUBBE & RÜZGAR GÜLÜ (Copper Cupola & Weathervane)
  // =========================================================================
  // Koni/kubbe bakır çatı
  cylinder(plinthGroup, 0.1, 1.45, 1.6, [0, 12.8, 0], "#16a085", 16);
  // Pirinç havalandırma küresi
  cylinder(plinthGroup, 0.04, 0.05, 0.9, [0, 13.9, 0], "#d35400", 6);
  // Rüzgar gülü yön kolları (N, S, E, W)
  box(plinthGroup, [0.75, 0.06, 0.03], [0, 14.15, 0], "#f39c12");
  box(plinthGroup, [0.03, 0.06, 0.75], [0, 14.15, 0], "#f39c12");

  // Rüzgar gülü tepesindeki minyatür yelkenli gemi silüeti finiali (Ship Finial)
  const shipFinialGroup = new THREE.Group();
  shipFinialGroup.position.set(0, 14.45, 0);
  plinthGroup.add(shipFinialGroup);
  box(shipFinialGroup, [0.45, 0.08, 0.04], [0, 0, 0], "#d35400"); // Gemi gövdesi
  box(shipFinialGroup, [0.04, 0.32, 0.03], [-0.05, 0.16, 0], "#f39c12"); // Ana direk
  box(shipFinialGroup, [0.22, 0.22, 0.02], [0.08, 0.18, 0], "#f1c40f");  // Şişkin ana yelken

  // =========================================================================
  // 8. KORDON RIHTIM PERONU, PUSULA GÜLÜ & ANIT (Promenade Plaque & Bay)
  // =========================================================================
  const bayX = LIGHTHOUSE_BAY.x; // -28.0
  const bayZ = LIGHTHOUSE_BAY.z; // 82.0

  // Peron zemin tablası ve beyaz park sınırları
  const bayW = 4.8;
  const bayD = 3.2;
  box(group, [bayW, 0.015, 0.14], [bayX, 0.07, bayZ - bayD / 2], "#ffffff");
  box(group, [bayW, 0.015, 0.14], [bayX, 0.07, bayZ + bayD / 2], "#ffffff");
  box(group, [0.14, 0.015, bayD], [bayX - bayW / 2, 0.07, bayZ], "#ffffff");
  box(group, [0.14, 0.015, bayD], [bayX + bayW / 2, 0.07, bayZ], "#ffffff");

  // Sarı-siyah peron emniyet çizgileri (Hazard Striping)
  const curbStep = 0.8;
  const curbCount = Math.floor(bayW / curbStep);
  for (let i = 0; i < curbCount; i++) {
    const cxP = bayX - bayW / 2 + i * curbStep + curbStep / 2;
    const cCol = i % 2 === 0 ? "#f1c40f" : "#2d3436";
    box(group, [curbStep - 0.04, 0.02, 0.22], [cxP, 0.075, bayZ + bayD / 2 + 0.15], cCol);
  }

  // Zemin beyaz kılavuz yön oku (Chevron arrow pointing south toward bay)
  box(group, [0.2, 0.02, 1.2], [bayX, 0.072, bayZ], "#ffffff");
  box(group, [0.7, 0.02, 0.18], [bayX, 0.072, bayZ + 0.45], "#ffffff");

  // Kaldırım üzerinde pirinç Pusula Gülü (Compass Rose Mosaic)
  const roseGroup = new THREE.Group();
  roseGroup.position.set(bayX + 2.2, 0.07, bayZ + 1.2);
  group.add(roseGroup);
  cylinder(roseGroup, 0.85, 0.85, 0.02, [0, 0.01, 0], "#2c3e50", 16);
  cylinder(roseGroup, 0.72, 0.72, 0.025, [0, 0.012, 0], "#34495e", 16);
  // 8 köşeli pusula yıldızı
  box(roseGroup, [0.12, 0.03, 1.3], [0, 0.015, 0], "#f1c40f");
  box(roseGroup, [1.3, 0.03, 0.12], [0, 0.015, 0], "#f1c40f");
  const starDiag1 = box(roseGroup, [0.1, 0.028, 0.95], [0, 0.015, 0], "#e67e22");
  starDiag1.rotation.y = Math.PI / 4;
  const starDiag2 = box(roseGroup, [0.1, 0.028, 0.95], [0, 0.015, 0], "#e67e22");
  starDiag2.rotation.y = -Math.PI / 4;

  // Tarihi Bronz Anıt Plaketi ve Taş Kaide (Heritage Plaque Monument)
  const monumentX = bayX - 2.8;
  const monumentZ = bayZ + 1.2;
  box(group, [1.1, 0.75, 0.65], [monumentX, 0.38, monumentZ], "#4a5568");
  box(group, [1.2, 0.12, 0.75], [monumentX, 0.81, monumentZ], "#718096");

  // Açılı bronz anıt levhası
  const plaqueMesh = box(group, [0.95, 0.45, 0.06], [monumentX, 1.0, monumentZ], "#d35400");
  plaqueMesh.rotation.x = -0.35;
  const plaqueLabel = label("⚓ TARİHİ DENİZ FENERİ · 1884", "#ffffff", "#1e3799");
  plaqueLabel.scale.set(1.4, 0.38, 1);
  plaqueLabel.position.set(monumentX, 1.15, monumentZ + 0.06);
  plaqueLabel.rotation.x = -0.35;
  group.add(plaqueLabel);

  // Kordon döküm palamar babası ve jüt halat kangalı
  cylinder(group, 0.14, 0.14, 0.55, [bayX - 2.1, 0.28, bayZ + 1.5], "#111827", 8);
  cylinder(group, 0.42, 0.42, 0.18, [bayX - 1.5, 0.1, bayZ + 1.6], "#b78b56", 10); // Jüt halat

  // Can Simidi İstasyonu (Lifebuoy Stand: "CAN SİMİDİ · SAHİL GÜVENLİK")
  const buoyX = bayX + 3.2;
  const buoyZ = bayZ + 1.5;
  cylinder(group, 0.04, 0.04, 1.45, [buoyX, 0.72, buoyZ], "#e74c3c", 6);
  cylinder(group, 0.38, 0.38, 0.08, [buoyX, 1.1, buoyZ], "#ffffff", 12);
  cylinder(group, 0.24, 0.24, 0.09, [buoyX, 1.1, buoyZ], "#2c3e50", 12);
  // Kırmızı 4 emniyet çeyreği
  box(group, [0.12, 0.42, 0.095], [buoyX, 1.1, buoyZ], "#e74c3c");
  box(group, [0.42, 0.12, 0.095], [buoyX, 1.1, buoyZ], "#e74c3c");

  // =========================================================================
  // 9. ANİMASYONLU NPC — "FENERCİ RIZA KAPTAN" (Old Sailor & Telescope)
  // =========================================================================
  const npcGroup = new THREE.Group();
  npcGroup.position.set(RIZA_KAPTAN_POS.x, 0, RIZA_KAPTAN_POS.z);
  group.add(npcGroup);

  // Gövde ve Kafa pivotları
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0, 0);
  npcGroup.add(torsoPivot);

  // Botlar ve lacivert denizci pantolonu
  box(torsoPivot, [0.22, 0.26, 0.34], [-0.16, 0.13, 0.04], "#1e272e");
  box(torsoPivot, [0.22, 0.26, 0.34], [0.16, 0.13, 0.04], "#1e272e");
  cylinder(torsoPivot, 0.1, 0.1, 0.65, [-0.16, 0.55, 0], "#2c3e50", 6);
  cylinder(torsoPivot, 0.1, 0.1, 0.65, [0.16, 0.55, 0], "#2c3e50", 6);

  // Sarı muşamba denizci yağmurluğu (Yellow Oilskin Slicker)
  box(torsoPivot, [0.54, 0.68, 0.34], [0, 1.15, 0], "#f1c40f");
  box(torsoPivot, [0.56, 0.12, 0.36], [0, 1.44, 0], "#e67e22"); // Fırtına yakalığı
  // Siyah düğme ve kapak şeridi
  box(torsoPivot, [0.06, 0.66, 0.35], [0, 1.15, 0.01], "#2d3436");

  // Kafa grubu
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.58, 0);
  torsoPivot.add(headGroup);

  // Baş ve pos beyaz/gri bıyık
  box(headGroup, [0.32, 0.32, 0.3], [0, 0, 0], "#f5cd79");
  box(headGroup, [0.28, 0.1, 0.14], [0, -0.06, 0.16], "#ecf0f1"); // Pos bıyık
  box(headGroup, [0.08, 0.08, 0.08], [0, 0.02, 0.16], "#e17055");  // Rüzgardan kızarmış burun

  // Kaptan kasketi (Peaked Navy Skipper Cap with Gold Anchor)
  cylinder(headGroup, 0.24, 0.22, 0.18, [0, 0.18, 0], "#1e3799", 10);
  box(headGroup, [0.32, 0.04, 0.22], [0, 0.14, 0.16], "#2c3e50"); // Siyah parlak siperlik
  box(headGroup, [0.14, 0.05, 0.03], [0, 0.22, 0.19], "#f1c40f");  // Altın çapa arması

  // Sağ Kol & Sol Kol
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.34, 1.4, 0);
  torsoPivot.add(leftArmPivot);
  cylinder(leftArmPivot, 0.09, 0.08, 0.58, [0, -0.26, 0], "#f1c40f", 6);
  box(leftArmPivot, [0.12, 0.14, 0.12], [0, -0.56, 0], "#f5cd79"); // El

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.34, 1.4, 0);
  torsoPivot.add(rightArmPivot);
  cylinder(rightArmPivot, 0.09, 0.08, 0.58, [0, -0.26, 0], "#f1c40f", 6);
  box(rightArmPivot, [0.12, 0.14, 0.12], [0, -0.56, 0], "#f5cd79"); // El

  // Pirinç Ayaklı Sahil Deniz Dürbünü (Brass Maritime Tripod Telescope)
  const telescopeStandGroup = new THREE.Group();
  telescopeStandGroup.position.set(0.65, 0, 0.35);
  npcGroup.add(telescopeStandGroup);

  // Üç ayak (Tripod legs)
  cylinder(telescopeStandGroup, 0.025, 0.025, 1.35, [-0.22, 0.65, 0.18], "#d35400", 6).rotation.z = 0.18;
  cylinder(telescopeStandGroup, 0.025, 0.025, 1.35, [0.22, 0.65, 0.18], "#d35400", 6).rotation.z = -0.18;
  cylinder(telescopeStandGroup, 0.025, 0.025, 1.35, [0, 0.65, -0.25], "#d35400", 6).rotation.x = -0.2;

  // Dürbün mafsalı ve optik gövde (Swiveling brass telescope)
  const telescopePivot = new THREE.Group();
  telescopePivot.position.set(0, 1.35, 0);
  telescopeStandGroup.add(telescopePivot);

  cylinder(telescopePivot, 0.06, 0.06, 0.14, [0, 0, 0], "#f39c12", 8);
  const scopeTube = cylinder(telescopePivot, 0.07, 0.045, 0.85, [0, 0.04, 0.28], "#f1c40f", 8);
  scopeTube.rotation.x = Math.PI / 2.2;
  cylinder(telescopePivot, 0.08, 0.08, 0.08, [0, 0.1, 0.66], "#d35400", 8).rotation.x = Math.PI / 2.2; // Ön objektif

  // 3D Konuşma Balonu Grubu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.45, 0);
  npcGroup.add(bubbleGroup);
  bubbleGroup.visible = false;

  let currentBubbleText = "";

  // =========================================================================
  // 10. ÇARPIŞMA ENGELİ (OBSTACLE COLLIDERS)
  // =========================================================================
  // Deniz içindeki kule kaidesi engeli (Orijinal dalgakıran sınırlarını korur: Z=88.2..93.8)
  obstacles.push({
    minX: cx - 2.8,
    maxX: cx + 2.8,
    minZ: cz - 2.8,
    maxZ: cz + 2.8,
  });

  // =========================================================================
  // 11. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let totalTime = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: LighthouseState | boolean,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      totalTime += dt;

      let state: LighthouseState | undefined;
      let night = isNightOrDusk;
      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
      }

      // 1. Dönen arama ışığı huzmesi ve fener ışığı güncellemeleri
      const beamRot = state ? state.beamRotation : totalTime * 0.75;
      beamGroup.rotation.y = beamRot;

      beamMat.opacity = night ? 0.42 : 0.14;
      backBeamMat.opacity = night ? 0.22 : 0.07;
      lanternLight.intensity = night ? 1.6 : 0.5;

      if (bulbCore.material instanceof THREE.MeshStandardMaterial) {
        bulbCore.material.emissiveIntensity = night ? 1.3 : 0.6;
      }

      // Rüzgar gülü gemi finialinin hafif rüzgar salınımı
      shipFinialGroup.rotation.y = Math.sin(totalTime * 1.8) * 0.25;

      // 2. Deniz Dürbünü ufuk tarama salınımı
      const scanPhase = state ? state.telescopeScanPhase : totalTime * 2.2;
      telescopePivot.rotation.y = Math.sin(scanPhase * 0.6) * 0.35;
      telescopePivot.rotation.x = Math.sin(scanPhase * 0.3) * 0.08;

      // 3. Fenerci Rıza Kaptan kafa takibi ve selamlama
      if (playerPos) {
        const dx = playerPos.x - RIZA_KAPTAN_POS.x;
        const dz = playerPos.z - RIZA_KAPTAN_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 26.0) {
          const targetAngle = Math.atan2(dx, dz);
          let diff = targetAngle - npcGroup.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          torsoPivot.rotation.y = THREE.MathUtils.clamp(diff, -1.2, 1.2);
          headGroup.rotation.y = THREE.MathUtils.clamp(diff * 0.5, -0.6, 0.6);
        } else {
          torsoPivot.rotation.y = THREE.MathUtils.lerp(torsoPivot.rotation.y, 0, dt * 2.0);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.0);
        }
      }

      // Selamlama / korna sırasında iki kolu coşkuyla havaya kaldırıp sallama
      const isGreeting = state ? state.honkGreetingTimer > 0 : false;
      if (isGreeting) {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          -Math.PI / 2.6 + Math.sin(totalTime * 9.0) * 0.25,
          dt * 8.0,
        );
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(
          rightArmPivot.rotation.z,
          0.4 + Math.cos(totalTime * 8.0) * 0.2,
          dt * 8.0,
        );
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(
          leftArmPivot.rotation.x,
          -Math.PI / 2.6 - Math.sin(totalTime * 9.0) * 0.25,
          dt * 8.0,
        );
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(
          leftArmPivot.rotation.z,
          -0.4 - Math.cos(totalTime * 8.0) * 0.2,
          dt * 8.0,
        );
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 4.0);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 4.0);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0, dt * 4.0);
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0, dt * 4.0);
      }

      // 4. 3D Konuşma Balonu Gösterimi
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
          const newLabel = label(callout, "#ffffff", "#1e3799");
          newLabel.scale.set(5.8, 0.75, 1);
          newLabel.rotation.x = -0.25;
          bubbleGroup.add(newLabel);
        }
      } else {
        bubbleGroup.visible = false;
        currentBubbleText = "";
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - RIZA_KAPTAN_POS.x,
        playerPos.z - RIZA_KAPTAN_POS.z,
      );
      return dist <= 26.0;
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
      lanternLight.dispose();
      beamMat.dispose();
      backBeamMat.dispose();
      glassMat.dispose();
    },
  };
}
