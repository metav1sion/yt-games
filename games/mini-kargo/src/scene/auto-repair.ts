import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label } from "./world-kit";
import {
  type AutoRepairState,
  AUTO_REPAIR_CENTER,
  AUTO_REPAIR_BAY,
  MECHANIC_MUHARREM_POS,
  CAR_LIFT_POS,
  MECHANIC_MUHARREM_CALLOUTS,
} from "../game/auto-repair";

export type AutoRepairView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: AutoRepairState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sanayi "Usta Eller Oto Sanayi" Tamirhanesi & Araç Bakım Lifti (T46)
 * - Otantik sanayi sitesi tamirhane hangarı, oluklu sac kaplama ve tavan makasları
 * - İki sütunlu çalışan hidrolik araç bakım lifti ve üzerinde yükselip alçalan klasik müşteri aracı
 * - Lastik sökme-takma makinesi, tekerlek balans cihazı, lastik rafları ve istiflenmiş jantlar
 * - Çok çekmeceli kırmızı takım arabası, mengene tezgahı, yağ varilleri ve gaz tüpleri
 * - Lokma anahtarlı, kafa takipli ve konuşma balonlu Baş Usta NPC "Tamirci Muharrem Usta"
 * - Sanayi Bakımı pitstop servis peronu, zemin uyarı çizgileri ve gece aydınlatması
 */
export function createAutoRepairView(): AutoRepairView {
  const group = new THREE.Group();
  group.name = "auto-repair-view";

  const obstacles: Rect[] = [];

  const originX = AUTO_REPAIR_CENTER.x; // 78.0
  const originZ = AUTO_REPAIR_CENTER.z; // -57.5

  // =========================================================================
  // 1. TAMİRHANE BETON ZEMİNİ & GİRİŞ RAMPASI (Workshop Apron & Floor)
  // =========================================================================
  const floorW = 15.4;
  const floorD = 8.6;
  const floorZ = originZ - 0.2; // -57.7

  // Ana atölye zemin betonu (koyu sanayi antrasit betonu)
  box(group, [floorW, 0.08, floorD], [originX, 0.04, floorZ], "#4b5563");
  // İç servis peronu zemin döşemesi (yağ tutmaz reçine zemin)
  box(group, [floorW - 0.6, 0.09, floorD - 0.6], [originX, 0.045, floorZ], "#374151");

  // Giriş bordürü ve sarı-siyah emniyet şeritleri
  for (let x = originX - floorW / 2 + 0.6; x <= originX + floorW / 2 - 0.6; x += 1.2) {
    const isYellow = Math.round(x * 2) % 2 === 0;
    box(group, [1.1, 0.095, 0.25], [x, 0.05, originZ + floorD / 2 - 0.3], isYellow ? "#f1c40f" : "#2c3e50");
  }

  // Zemin yağ lekesi patineleri (otantik sanayi hissi)
  cylinder(group, 0.9, 0.9, 0.005, [CAR_LIFT_POS.x, 0.052, CAR_LIFT_POS.z], "#1e272e", 12);
  cylinder(group, 0.6, 0.6, 0.005, [CAR_LIFT_POS.x + 0.5, 0.052, CAR_LIFT_POS.z + 0.4], "#2f3640", 10);
  cylinder(group, 0.7, 0.7, 0.005, [AUTO_REPAIR_BAY.x, 0.052, AUTO_REPAIR_BAY.z], "#2f3640", 12);

  // Peron 1 (Sol - Lift Alanı) Sarı Zemin Sınır Çizgileri
  box(group, [4.8, 0.015, 0.12], [CAR_LIFT_POS.x, 0.055, CAR_LIFT_POS.z + 2.4], "#f1c40f");
  box(group, [4.8, 0.015, 0.12], [CAR_LIFT_POS.x, 0.055, CAR_LIFT_POS.z - 2.4], "#f1c40f");
  box(group, [0.12, 0.015, 4.8], [CAR_LIFT_POS.x - 2.4, 0.055, CAR_LIFT_POS.z], "#f1c40f");

  // Peron 2 (Sağ - Oyuncu Bakım Peronu) Sarı-Beyaz Zemin Kılavuz Çizgileri
  box(group, [4.4, 0.015, 0.14], [AUTO_REPAIR_BAY.x, 0.055, AUTO_REPAIR_BAY.z + 2.2], "#f1c40f");
  box(group, [4.4, 0.015, 0.14], [AUTO_REPAIR_BAY.x, 0.055, AUTO_REPAIR_BAY.z - 2.2], "#f1c40f");
  box(group, [0.14, 0.015, 4.4], [AUTO_REPAIR_BAY.x + 2.2, 0.055, AUTO_REPAIR_BAY.z], "#f1c40f");

  // Peron zemin yön oku (İleri doğru beyaz ok)
  box(group, [0.35, 0.015, 1.8], [AUTO_REPAIR_BAY.x, 0.056, AUTO_REPAIR_BAY.z], "#ffffff");
  box(group, [1.0, 0.015, 0.35], [AUTO_REPAIR_BAY.x, 0.056, AUTO_REPAIR_BAY.z - 0.7], "#ffffff");

  // =========================================================================
  // 2. ATÖLYE HANGARI VE ÇATI MAKASLARI (Workshop Hangar & Trusses)
  // =========================================================================
  const wallH = 4.6;
  const backWallZ = floorZ - floorD / 2 + 0.2; // -61.8

  // Arka ana duvar (Koyu çelik panel)
  box(group, [floorW, wallH, 0.4], [originX, wallH / 2, backWallZ], "#2c3e50");
  box(group, [floorW + 0.2, 0.25, 0.45], [originX, wallH, backWallZ], "#d35400"); // Kırmızı çatı bordürü
  obstacles.push({
    minX: originX - floorW / 2 - 0.2,
    maxX: originX + floorW / 2 + 0.2,
    minZ: backWallZ - 0.3,
    maxZ: backWallZ + 0.3,
  });

  // Sol yan duvar
  const sideWallD = floorD - 0.6;
  const leftWallX = originX - floorW / 2 + 0.2;
  box(group, [0.4, wallH, sideWallD], [leftWallX, wallH / 2, floorZ + 0.1], "#34495e");
  obstacles.push({
    minX: leftWallX - 0.3,
    maxX: leftWallX + 0.3,
    minZ: floorZ - sideWallD / 2,
    maxZ: floorZ + sideWallD / 2,
  });

  // Sağ yan duvar
  const rightWallX = originX + floorW / 2 - 0.2;
  box(group, [0.4, wallH, sideWallD], [rightWallX, wallH / 2, floorZ + 0.1], "#34495e");
  obstacles.push({
    minX: rightWallX - 0.3,
    maxX: rightWallX + 0.3,
    minZ: floorZ - sideWallD / 2,
    maxZ: floorZ + sideWallD / 2,
  });

  // Orta taşıyıcı çelik kolon (İki peron arası)
  box(group, [0.45, wallH, 0.45], [originX - 0.2, wallH / 2, floorZ + 0.1], "#f39c12");

  // Ön çatı alnı ve çelik kiriş (Front roof truss beam)
  const frontBeamZ = floorZ + floorD / 2 - 0.3;
  box(group, [floorW, 0.5, 0.45], [originX, wallH - 0.25, frontBeamZ], "#2c3e50");
  // Çatı saçak eğimi
  box(group, [floorW + 0.6, 0.22, floorD + 0.8], [originX, wallH + 0.2, floorZ], "#7f8c8d");

  // Büyük Işıklı Tabela: "🔧 USTA ELLER OTO SANAYİ · MOTOR & MEKANİK 🚗"
  const marqueeSign = label("🔧 USTA ELLER OTO SANAYİ · MOTOR & MEKANİK 🚗", "#ffffff", "#c0392b");
  marqueeSign.scale.set(7.5, 1.1, 1);
  marqueeSign.position.set(originX, wallH + 0.85, frontBeamZ + 0.25);
  group.add(marqueeSign);

  // Yan Servis Levhası
  const sideSign = label("ARAÇ BAKIM & LİFT", "#f1c40f", "#2c3e50");
  sideSign.scale.set(2.4, 0.65, 1);
  sideSign.position.set(originX - 4.0, wallH - 0.25, frontBeamZ + 0.26);
  group.add(sideSign);

  // Peron Üstü Tabela
  const baySign = label("HIZLI SERVİS NOKTASI", "#2ecc71", "#2c3e50");
  baySign.scale.set(2.6, 0.65, 1);
  baySign.position.set(originX + 3.8, wallH - 0.25, frontBeamZ + 0.26);
  group.add(baySign);

  // Tavan sarkıt lambaları (Atölye aydınlatması)
  const workshopLights: THREE.PointLight[] = [];
  for (const lx of [originX - 3.8, originX + 3.8]) {
    // Abajur kapağı
    cylinder(group, 0.5, 0.15, 0.35, [lx, wallH - 0.5, floorZ], "#34495e", 12);
    // Sarkıt kablo
    cylinder(group, 0.03, 0.03, 0.5, [lx, wallH - 0.2, floorZ], "#2c3e50", 6);
    // Sıcak sarı ışık kaynağı
    const pLight = new THREE.PointLight(0xffeaa7, 0.6, 16);
    pLight.position.set(lx, wallH - 0.7, floorZ);
    group.add(pLight);
    workshopLights.push(pLight);
  }

  // =========================================================================
  // 3. İKİ SÜTUNLU ÇALIŞAN HİDROLİK ARAÇ LİFTİ (Two-Post Hydraulic Car Lift)
  // =========================================================================
  const liftGroup = new THREE.Group();
  liftGroup.position.set(CAR_LIFT_POS.x, 0, CAR_LIFT_POS.z);
  group.add(liftGroup);

  const columnH = 3.6;
  const colDistX = 1.45; // Sütunlar arası mesafe

  // Sol hidrolik sütun (Mavi çelik C-profil)
  box(liftGroup, [0.4, columnH, 0.5], [-colDistX, columnH / 2, 0], "#0984e3");
  box(liftGroup, [0.65, 0.08, 0.75], [-colDistX, 0.04, 0], "#2d3436"); // Taban plakası

  // Sağ hidrolik sütun (Mavi çelik C-profil)
  box(liftGroup, [0.4, columnH, 0.5], [colDistX, columnH / 2, 0], "#0984e3");
  box(liftGroup, [0.65, 0.08, 0.75], [colDistX, 0.04, 0], "#2d3436"); // Taban plakası

  // Üst kiriş köprüsü (Hidrolik senkronizasyon ve kablo kanalı)
  box(liftGroup, [colDistX * 2 + 0.4, 0.22, 0.35], [0, columnH - 0.1, 0], "#0984e3");

  // Hidrolik pompa ünitesi ve buton panosu (Sağ sütun üzerinde)
  box(liftGroup, [0.22, 0.75, 0.3], [colDistX + 0.26, 1.5, 0], "#2d3436");
  box(liftGroup, [0.08, 0.14, 0.1], [colDistX + 0.38, 1.6, 0], "#2ecc71"); // Yeşil başlat butonu
  box(liftGroup, [0.08, 0.14, 0.1], [colDistX + 0.38, 1.4, 0], "#e74c3c"); // Kırmızı acil stop

  // Lift sütunları fiziksel engelleri
  obstacles.push({
    minX: CAR_LIFT_POS.x - colDistX - 0.45,
    maxX: CAR_LIFT_POS.x - colDistX + 0.45,
    minZ: CAR_LIFT_POS.z - 0.5,
    maxZ: CAR_LIFT_POS.z + 0.5,
  });
  obstacles.push({
    minX: CAR_LIFT_POS.x + colDistX - 0.45,
    maxX: CAR_LIFT_POS.x + colDistX + 0.45,
    minZ: CAR_LIFT_POS.z - 0.5,
    maxZ: CAR_LIFT_POS.z + 0.5,
  });

  // Hareketli Taşıyıcı Kızaklar ve Kaldırma Kolları (Elevating Carriage & Arms)
  const carriageGroup = new THREE.Group();
  liftGroup.add(carriageGroup);

  // Sol kızak ve kollar
  box(carriageGroup, [0.42, 0.45, 0.52], [-colDistX, 0, 0], "#d63031");
  box(carriageGroup, [0.95, 0.1, 0.14], [-colDistX + 0.45, -0.15, 0.85], "#e17055");
  box(carriageGroup, [0.95, 0.1, 0.14], [-colDistX + 0.45, -0.15, -0.85], "#e17055");

  // Sağ kızak ve kollar
  box(carriageGroup, [0.42, 0.45, 0.52], [colDistX, 0, 0], "#d63031");
  box(carriageGroup, [0.95, 0.1, 0.14], [colDistX - 0.45, -0.15, 0.85], "#e17055");
  box(carriageGroup, [0.95, 0.1, 0.14], [colDistX - 0.45, -0.15, -0.85], "#e17055");

  // Kauçuk kaldırma pabuçları (4 adet)
  for (const signX of [-1, 1]) {
    for (const signZ of [-1, 1]) {
      cylinder(carriageGroup, 0.14, 0.14, 0.08, [signX * 0.9, -0.06, signZ * 0.85], "#2d3436", 8);
    }
  }

  // =========================================================================
  // 4. LİFT ÜZERİNDEKİ KLASİK PROJE ARACI (Hoisted Customer Project Car)
  // =========================================================================
  const projectCarGroup = new THREE.Group();
  carriageGroup.add(projectCarGroup);

  // Araç şasisi / gövdesi (Turkuaz klasik sedan)
  box(projectCarGroup, [1.5, 0.65, 3.1], [0, 0.4, 0], "#16a085");
  // Kabin ve tavan (Beyaz tavan)
  box(projectCarGroup, [1.35, 0.55, 1.7], [0, 0.95, -0.1], "#ecf0f1");
  // Ön/arka camlar (Koyu cam)
  box(projectCarGroup, [1.32, 0.45, 0.1], [0, 0.9, 0.76], "#2c3e50");
  box(projectCarGroup, [1.32, 0.45, 0.1], [0, 0.9, -0.96], "#2c3e50");
  // Yan camlar
  box(projectCarGroup, [1.36, 0.42, 1.4], [0, 0.9, -0.1], "#2c3e50");

  // Krom tamponlar ve ızgara
  box(projectCarGroup, [1.54, 0.18, 0.14], [0, 0.3, 1.58], "#bdc3c7");
  box(projectCarGroup, [1.54, 0.18, 0.14], [0, 0.3, -1.58], "#bdc3c7");
  box(projectCarGroup, [0.8, 0.25, 0.08], [0, 0.45, 1.56], "#7f8c8d");

  // Ön Farlar
  for (const fx of [-0.55, 0.55]) {
    cylinder(projectCarGroup, 0.14, 0.14, 0.1, [fx, 0.48, 1.55], "#f5f6fa", 10);
  }
  // Arka Stoplar
  for (const rx of [-0.55, 0.55]) {
    cylinder(projectCarGroup, 0.12, 0.12, 0.1, [rx, 0.48, -1.55], "#e74c3c", 8);
  }

  // Havada asılı tekerlekler (Hafifçe serbest salınan tekerlekler)
  for (const wx of [-0.78, 0.78]) {
    for (const wz of [-0.95, 0.95]) {
      const wheel = cylinder(projectCarGroup, 0.32, 0.32, 0.22, [wx, 0.1, wz], "#2d3436", 12);
      wheel.rotation.z = Math.PI / 2;
      // Jant göbeği
      const hub = cylinder(projectCarGroup, 0.18, 0.18, 0.24, [wx, 0.1, wz], "#bdc3c7", 8);
      hub.rotation.z = Math.PI / 2;
    }
  }

  // =========================================================================
  // 5. ATÖLYE DETAY VE EKİPMANLARI (Tire Changer, Tool Chest, Drums, Bench)
  // =========================================================================
  // 5.1 Çok Çekmeceli Kırmızı Takım Arabası (Mechanic Rolling Tool Chest)
  const toolChestGroup = new THREE.Group();
  toolChestGroup.position.set(originX - 5.8, 0, floorZ - 0.5);
  group.add(toolChestGroup);

  box(toolChestGroup, [0.85, 1.15, 0.6], [0, 0.65, 0], "#c0392b");
  box(toolChestGroup, [0.92, 0.08, 0.68], [0, 1.25, 0], "#2c3e50"); // Üst tabla
  // Çekmece kulpları
  for (let ch = 0.35; ch <= 1.1; ch += 0.2) {
    box(toolChestGroup, [0.65, 0.04, 0.05], [0, ch, 0.32], "#bdc3c7");
  }
  // Yan çekme kolu ve 4 tekerlek
  box(toolChestGroup, [0.08, 0.08, 0.45], [0.46, 1.05, 0], "#bdc3c7");
  for (const cx of [-0.35, 0.35]) {
    for (const cz of [-0.22, 0.22]) {
      cylinder(toolChestGroup, 0.08, 0.08, 0.06, [cx, 0.08, cz], "#2d3436", 8);
    }
  }
  obstacles.push({
    minX: originX - 6.4,
    maxX: originX - 5.2,
    minZ: floorZ - 1.0,
    maxZ: floorZ,
  });

  // 5.2 Lastik Sökme-Takma Makinesi (Tire Changing Machine)
  const tireMachineGroup = new THREE.Group();
  tireMachineGroup.position.set(originX - 6.2, 0, floorZ - 2.6);
  group.add(tireMachineGroup);

  box(tireMachineGroup, [0.9, 0.95, 0.85], [0, 0.48, 0], "#2980b9");
  // Döner tabla
  cylinder(tireMachineGroup, 0.42, 0.42, 0.12, [0, 1.0, 0], "#bdc3c7", 16);
  // Dikey sökme sütunu ve baskı kolu
  box(tireMachineGroup, [0.18, 1.1, 0.18], [-0.3, 1.45, -0.3], "#2c3e50");
  box(tireMachineGroup, [0.45, 0.14, 0.14], [-0.1, 1.95, -0.1], "#e74c3c");
  obstacles.push({
    minX: originX - 6.8,
    maxX: originX - 5.6,
    minZ: floorZ - 3.2,
    maxZ: floorZ - 2.0,
  });

  // 5.3 Tekerlek Balans Makinesi (Wheel Balancer)
  const balancerGroup = new THREE.Group();
  balancerGroup.position.set(originX - 4.8, 0, backWallZ + 0.6);
  group.add(balancerGroup);

  box(balancerGroup, [0.75, 1.05, 0.65], [0, 0.55, 0], "#34495e");
  // Koruyucu kapak çemberi
  cylinder(balancerGroup, 0.45, 0.45, 0.12, [0.45, 0.85, 0], "#2c3e50", 12);
  // Dijital gösterge ekranı
  box(balancerGroup, [0.35, 0.22, 0.05], [0, 1.15, 0.28], "#00d2d3");

  // 5.4 Lastik Rafı ve İstiflenmiş Jantlı Lastikler
  const tireRackGroup = new THREE.Group();
  tireRackGroup.position.set(originX - 2.4, 0, backWallZ + 0.5);
  group.add(tireRackGroup);

  // Çelik boru raf ayakları
  box(tireRackGroup, [2.4, 0.08, 0.5], [0, 0.85, 0], "#e67e22");
  box(tireRackGroup, [2.4, 0.08, 0.5], [0, 1.75, 0], "#e67e22");
  for (const rx of [-1.15, 1.15]) {
    box(tireRackGroup, [0.08, 2.0, 0.5], [rx, 1.0, 0], "#2c3e50");
  }
  // Raftaki dik lastikler
  for (let tx = -0.85; tx <= 0.85; tx += 0.42) {
    const tire = cylinder(tireRackGroup, 0.34, 0.34, 0.18, [tx, 1.25, 0], "#2d3436", 12);
    tire.rotation.x = Math.PI / 2;
  }
  obstacles.push({
    minX: originX - 3.7,
    maxX: originX - 1.1,
    minZ: backWallZ,
    maxZ: backWallZ + 0.9,
  });

  // Yerde istiflenmiş 3 lastik (Piramit istif)
  for (const [stX, stY, stZ] of [
    [originX - 1.2, 0.14, floorZ + 1.8],
    [originX - 0.7, 0.14, floorZ + 1.8],
    [originX - 0.95, 0.38, floorZ + 1.8],
  ]) {
    const stTire = cylinder(group, 0.32, 0.32, 0.22, [stX, stY, stZ], "#2d3436", 12);
    stTire.rotation.z = Math.PI / 2;
  }

  // 5.5 Sanayi 200L Madeni Yağ Varilleri (Oil Drums - Castrol, Mobil, Opet)
  const barrelConfigs = [
    { x: originX + 1.6, color: "#c0392b", brand: "CASTROL" },
    { x: originX + 2.4, color: "#2980b9", brand: "MOBIL" },
    { x: originX + 3.2, color: "#f1c40f", brand: "OPET" },
  ];
  for (const bcfg of barrelConfigs) {
    // Varil gövdesi
    cylinder(group, 0.35, 0.35, 1.05, [bcfg.x, 0.55, backWallZ + 0.55], bcfg.color, 12);
    // Takviye çemberleri
    cylinder(group, 0.36, 0.36, 0.05, [bcfg.x, 0.3, backWallZ + 0.55], "#2c3e50", 12);
    cylinder(group, 0.36, 0.36, 0.05, [bcfg.x, 0.8, backWallZ + 0.55], "#2c3e50", 12);
    // Manuel döner basma kolu (Rotary hand pump)
    cylinder(group, 0.04, 0.04, 0.45, [bcfg.x, 1.25, backWallZ + 0.55], "#bdc3c7", 6);
    box(group, [0.15, 0.04, 0.04], [bcfg.x + 0.06, 1.45, backWallZ + 0.55], "#d63031");
  }
  obstacles.push({
    minX: originX + 1.1,
    maxX: originX + 3.7,
    minZ: backWallZ,
    maxZ: backWallZ + 1.0,
  });

  // 5.6 Ağır Hizmet Mengene Tezgahı ve Takım Panosu (Workbench with Bench Vise)
  const benchGroup = new THREE.Group();
  benchGroup.position.set(originX + 6.0, 0, backWallZ + 0.7);
  group.add(benchGroup);

  // Masif ahşap tezgah tablası
  box(benchGroup, [2.2, 0.12, 0.95], [0, 0.9, 0], "#d35400");
  // Ağır çelik ayaklar ve alt raf
  for (const bx of [-0.95, 0.95]) {
    box(benchGroup, [0.1, 0.85, 0.85], [bx, 0.45, 0], "#2c3e50");
  }
  box(benchGroup, [2.0, 0.06, 0.8], [0, 0.25, 0], "#34495e");

  // Döküm Mengene (Cast iron bench vise)
  box(benchGroup, [0.28, 0.22, 0.35], [-0.75, 1.05, 0.3], "#34495e");
  cylinder(benchGroup, 0.03, 0.03, 0.32, [-0.75, 1.05, 0.48], "#bdc3c7", 6); // Mengene kolu

  // Duvar Takım Gölge Panosu (Pegboard with tools)
  box(benchGroup, [2.1, 1.4, 0.05], [0, 1.8, -0.42], "#bdc3c7");
  // Çekiç, anahtar vb. silüetleri
  box(benchGroup, [0.4, 0.06, 0.04], [-0.5, 1.9, -0.38], "#c0392b");
  box(benchGroup, [0.06, 0.35, 0.04], [-0.5, 1.7, -0.38], "#7f8c8d");
  box(benchGroup, [0.05, 0.45, 0.04], [0.2, 1.8, -0.38], "#2980b9");
  box(benchGroup, [0.05, 0.4, 0.04], [0.45, 1.8, -0.38], "#f39c12");

  obstacles.push({
    minX: originX + 4.8,
    maxX: originX + 7.2,
    minZ: backWallZ,
    maxZ: backWallZ + 1.25,
  });

  // 5.7 Oksijen & Asetilen Kaynak Gaz Tüpleri
  const gasTanksGroup = new THREE.Group();
  gasTanksGroup.position.set(rightWallX - 0.6, 0, floorZ + 1.5);
  group.add(gasTanksGroup);

  // Yeşil oksijen tüpü (Uzun)
  cylinder(gasTanksGroup, 0.16, 0.16, 1.45, [-0.2, 0.75, 0], "#27ae60", 12);
  cylinder(gasTanksGroup, 0.08, 0.08, 0.14, [-0.2, 1.52, 0], "#bdc3c7", 8); // Vana
  // Kırmızı asetilen tüpü (Daha kalın ve kısa)
  cylinder(gasTanksGroup, 0.2, 0.2, 1.15, [0.2, 0.6, 0], "#c0392b", 12);
  cylinder(gasTanksGroup, 0.08, 0.08, 0.14, [0.2, 1.22, 0], "#bdc3c7", 8); // Vana
  // Emniyet zinciri
  box(gasTanksGroup, [0.75, 0.04, 0.04], [0, 0.9, 0.2], "#f1c40f");

  // =========================================================================
  // 6. BAŞ USTA NPC: "TAMİRCİ MUHARREM USTA" (Chief Mechanic NPC)
  // =========================================================================
  const mechanicGroup = new THREE.Group();
  mechanicGroup.position.set(MECHANIC_MUHARREM_POS.x, 0, MECHANIC_MUHARREM_POS.z);
  mechanicGroup.rotation.y = Math.PI * 0.15;
  group.add(mechanicGroup);

  // Güvenlik botları
  box(mechanicGroup, [0.22, 0.16, 0.3], [-0.14, 0.08, 0.04], "#2c3e50");
  box(mechanicGroup, [0.22, 0.16, 0.3], [0.14, 0.08, 0.04], "#2c3e50");

  // Bacaklar (Lacivert tulum kumaşı)
  box(mechanicGroup, [0.2, 0.65, 0.22], [-0.14, 0.45, 0], "#1e3799");
  box(mechanicGroup, [0.2, 0.65, 0.22], [0.14, 0.45, 0], "#1e3799");

  // Gövde ve tulum göğsü (Ön cep ve sarı logo nakışı)
  box(mechanicGroup, [0.55, 0.68, 0.32], [0, 1.05, 0], "#1e3799");
  box(mechanicGroup, [0.38, 0.32, 0.04], [0, 1.1, 0.16], "#0c2461"); // Ön tulum cebi
  box(mechanicGroup, [0.08, 0.08, 0.02], [-0.1, 1.2, 0.18], "#f1c40f"); // Rozet

  // Baş ve Yüz Grubu (Dinamik kafa takibi)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.45, 0);
  mechanicGroup.add(headPivot);

  // Kafa
  cylinder(headPivot, 0.18, 0.18, 0.32, [0, 0.15, 0], "#fad390", 12);
  // Kırmızı Usta Bandanası / Kasketi
  box(headPivot, [0.42, 0.12, 0.44], [0, 0.3, 0], "#c0392b");
  box(headPivot, [0.38, 0.06, 0.22], [0, 0.26, 0.24], "#e74c3c"); // Siperlik
  // Gür beyaz/gri bıyık
  box(headPivot, [0.24, 0.08, 0.08], [0, 0.1, 0.18], "#ecf0f1");
  // Kaşlar ve gözler
  box(headPivot, [0.08, 0.03, 0.03], [-0.08, 0.18, 0.17], "#7f8c8d");
  box(headPivot, [0.08, 0.03, 0.03], [0.08, 0.18, 0.17], "#7f8c8d");

  // Sol Kol (Rölantide belde destekli)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.32, 1.32, 0);
  mechanicGroup.add(leftArmPivot);
  cylinder(leftArmPivot, 0.09, 0.08, 0.55, [0, -0.25, 0.05], "#fad390", 8);

  // Sağ Kol & Krom Cırcır Lokma Anahtar Grubu (Dinamik vidalama ve el sallama)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 1.32, 0);
  mechanicGroup.add(rightArmPivot);

  // Üst kol ve ön kol
  cylinder(rightArmPivot, 0.09, 0.08, 0.55, [0, -0.25, 0.08], "#fad390", 8);

  // Krom Cırcır Lokma Anahtar (Chrome Ratchet Socket Wrench)
  const wrenchMesh = new THREE.Group();
  wrenchMesh.position.set(0, -0.5, 0.15);
  rightArmPivot.add(wrenchMesh);

  // Anahtar sapı (Siyah kauçuk kavrama)
  cylinder(wrenchMesh, 0.03, 0.03, 0.42, [0, 0, 0], "#2d3436", 8);
  // Krom gövde
  cylinder(wrenchMesh, 0.032, 0.032, 0.25, [0, 0.2, 0], "#bdc3c7", 8);
  // Cırcır lokma kafası
  cylinder(wrenchMesh, 0.07, 0.07, 0.12, [0, 0.35, 0.04], "#dfe6e9", 12);
  cylinder(wrenchMesh, 0.05, 0.05, 0.08, [0, 0.35, 0.12], "#7f8c8d", 8); // Lokma ucu

  // =========================================================================
  // 7. 3B KONUŞMA BALONU (Speech Bubble Billboard)
  // =========================================================================
  let speechBubble: THREE.Sprite | null = null;
  const bubbleAnchor = new THREE.Group();
  bubbleAnchor.position.set(0, 1.85, 0);
  mechanicGroup.add(bubbleAnchor);

  // =========================================================================
  // 8. OYUNCU PERONU ETKİLEŞİM İSTASYONU VE HAVA/SU KULESİ (Pitstop Tower)
  // =========================================================================
  const towerGroup = new THREE.Group();
  towerGroup.position.set(AUTO_REPAIR_BAY.x + 2.4, 0, AUTO_REPAIR_BAY.z);
  group.add(towerGroup);

  // Dijital Hava & Su İstasyonu kulesi (Air & Water inflator tower)
  box(towerGroup, [0.45, 1.5, 0.45], [0, 0.75, 0], "#2c3e50");
  box(towerGroup, [0.55, 0.1, 0.55], [0, 1.5, 0], "#e67e22");
  // Dijital basınç ekranı (32 PSI)
  box(towerGroup, [0.35, 0.22, 0.05], [0, 1.25, 0.24], "#00d2d3");
  // Sarmal hava hortumu
  cylinder(towerGroup, 0.14, 0.14, 0.6, [0.26, 0.8, 0], "#e74c3c", 8);

  // =========================================================================
  // 9. DİNAMİK GÜNCELLEME VE ETKİLEŞİM METOTLARI
  // =========================================================================
  return {
    group,
    obstacles,

    update(
      dt: number,
      state: AutoRepairState,
      playerPos: Vec2 = { x: 0, z: 0 },
      isNightOrDusk = false,
    ) {
      // 1. Lift yüksekliği animasyonu
      carriageGroup.position.y = state.liftHeight;

      // 2. Gece/Fırtına atölye aydınlatması yoğunluğu
      const targetLightIntensity = isNightOrDusk ? 1.4 : 0.6;
      for (const pl of workshopLights) {
        pl.intensity += (targetLightIntensity - pl.intensity) * Math.min(1, dt * 3);
      }

      // 3. Muharrem Usta kafa takibi (Oyuncu 18m içindeyse)
      const distToPlayer = Math.hypot(
        playerPos.x - MECHANIC_MUHARREM_POS.x,
        playerPos.z - MECHANIC_MUHARREM_POS.z,
      );

      if (distToPlayer <= 18.0) {
        const dx = playerPos.x - MECHANIC_MUHARREM_POS.x;
        const dz = playerPos.z - MECHANIC_MUHARREM_POS.z;
        const angle = Math.atan2(dx, dz) - mechanicGroup.rotation.y;
        headPivot.rotation.y += (angle - headPivot.rotation.y) * Math.min(1, dt * 5.0);
      } else {
        headPivot.rotation.y += (0 - headPivot.rotation.y) * Math.min(1, dt * 3.0);
      }

      // 4. Sağ kol cırcır lokma vidalama / el sallama animasyonu
      if (state.honkGreetingTimer > 0) {
        // Korna veya pitstop selamı: Lokma anahtarını havaya kaldırıp neşeyle salla
        const waveAngle = Math.sin(state.wrenchTimer * 12.0) * 0.45;
        rightArmPivot.rotation.x = Math.PI * 0.85 + waveAngle;
        rightArmPivot.rotation.z = -0.35;
      } else {
        // Normal rölanti vidalama hareketi: cırcır lokma ile motor/parça sıkma
        const tightenMotion = Math.sin(state.wrenchTimer * 5.0) * 0.35;
        rightArmPivot.rotation.x = 0.45 + tightenMotion;
        rightArmPivot.rotation.z = 0.15;
      }

      // 5. Konuşma balonu güncellemesi
      if (state.lastHonkCallout && state.honkGreetingTimer > 0) {
        if (!speechBubble || speechBubble.name !== state.lastHonkCallout) {
          if (speechBubble) bubbleAnchor.remove(speechBubble);
          speechBubble = label(state.lastHonkCallout, "#ffffff", "#c0392b");
          speechBubble.scale.set(4.4, 0.85, 1);
          speechBubble.name = state.lastHonkCallout;
          bubbleAnchor.add(speechBubble);
        }
        speechBubble.visible = true;
      } else if (speechBubble) {
        speechBubble.visible = false;
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - MECHANIC_MUHARREM_POS.x,
        playerPos.z - MECHANIC_MUHARREM_POS.z,
      );
      if (dist <= 26.0) {
        const calloutIdx = Math.floor(Math.random() * MECHANIC_MUHARREM_CALLOUTS.length);
        const calloutText = MECHANIC_MUHARREM_CALLOUTS[calloutIdx];
        if (!speechBubble || speechBubble.name !== calloutText) {
          if (speechBubble) bubbleAnchor.remove(speechBubble);
          speechBubble = label(calloutText, "#ffffff", "#c0392b");
          speechBubble.scale.set(4.4, 0.85, 1);
          speechBubble.name = calloutText;
          bubbleAnchor.add(speechBubble);
        }
        speechBubble.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      for (const pl of workshopLights) {
        pl.dispose();
      }
    },
  };
}
