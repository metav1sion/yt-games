import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type HealthClinicState,
  HEALTH_CLINIC_CENTER,
  HEALTH_CLINIC_BAY,
  DR_HIKMET_POS,
  AMBULANCE_POS,
  DR_HIKMET_CALLOUTS,
} from "../game/health-clinic";

export type HealthClinicView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: HealthClinicState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Güneş Mahallesi "Tarihi Mahalle Sağlık Ocağı & Dispanseri (Beyaz Ambulans & Nöbetçi Eczane)" (T62)
 * - Erken Cumhuriyet / Neoklasik Tarihi Taş Sağlık Ocağı Mimarisi:
 *   - 10.4m x 11.6m granit ve klinker taş avlu tablası, bordür taşları ve servis yanaşma peronu (HEALTH_CLINIC_BAY: X: -11.0, Z: -43.5)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku
 *   - Beyaz badanalı kesme taş duvarlar, rustik gri kaide süpürgeliği, köşe silmeleri
 *   - 4 adet neoklasik pilaster sütun ve Dorik/İon sütun başlıkları
 *   - Üçgen alınlık (pediment) ve kabartma Kızılay Kırmızı Hilal amblemi (Red Crescent relief)
 *   - Masif kemerli giriş kapısı, basamaklı taş sahanlık, simetrik pencereler ve vitray camlar
 *   - Alaturka kiremit kırma çatı ve tuğla havalandırma bacası
 *   - Aydınlatmalı büyük kurumsal tabela ("🏥 GÜNEŞ MAHALLESİ 1 NOLU SAĞLIK OCAĞI & DİSPANSERİ 🩺")
 *   - Alt kurumsal şerit ("T.C. SAĞLIK BAKANLIĞI · BİRİNCİ BASAMAK SAĞLIK HİZMETLERİ · 1952")
 *   - Gece cepheyi aydınlatan sıcak beyaz PointLight armatürü
 * - 24/7 Nöbetçi Eczane Kanadı (On-Duty Pharmacy Wing):
 *   - Çizgili zümrüt yeşili tente sundurması ve cam vitrin
 *   - Aydınlatmalı büyük yeşil neon tabela ("💚 NÖBETÇİ ECZANE · 24 SAAT AÇIK 💊")
 *   - Yeşil Neon Medikal Haç Armatürü (Green Neon Pharmacy Cross) ve nabız atan yeşil PointLight
 * - Park Etmiş Vintage Beyaz Ambulans ("SAĞLIK İMDAT · 112 / HIZIR ACİL" - AMBULANCE_POS: X: -7.6, Z: -38.5):
 *   - Kırmızı-beyaz emniyet çizgili acil ambulans park cebi
 *   - 4.2m x 1.8m x 1.9m vintage Türk ambulans gövdesi, boydan boya kırmızı şerit, döner tepe flaşörleri
 * - Medikal Vitrin & Donatılar:
 *   - İlaç şişeleri/kutuları vitrini, pirinç ibreli boy-kilo baskülü, tebeşirli sağlık panosu, ilk yardım sedyesi
 * - Animasyonlu Başhekim NPC — "Dr. Hikmet Bey" (DR_HIKMET_POS: X: -13.0, Z: -38.5):
 *   - Beyaz doktor önlüğü, boyunda steteskop, elinde tıbbi hasta müşahade dosyası / klipsli pano
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve duraklamada panoyu havaya kaldırarak hekim selamı ve 3D konuşma balonu
 */
export function createHealthClinicView(): HealthClinicView {
  const group = new THREE.Group();
  group.name = "health-clinic-view";
  const obstacles: Rect[] = [];

  const cx = HEALTH_CLINIC_CENTER.x; // -11.0
  const cz = HEALTH_CLINIC_CENTER.z; // -34.0

  // =========================================================================
  // 1. AVLU TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Granit taş ve açık klinker avlu tablası (10.4m x 11.6m)
  box(yardGroup, [10.4, 0.12, 11.6], [0, 0.04, 0], "#ecf0f1");
  box(yardGroup, [10.0, 0.05, 11.2], [0, 0.10, 0], "#dfe4ea");

  // Çevre bordür taşları
  box(yardGroup, [10.6, 0.18, 0.22], [0, 0.09, -5.8], "#747d8c");
  box(yardGroup, [10.6, 0.18, 0.22], [0, 0.09, 5.8], "#747d8c");
  box(yardGroup, [0.22, 0.18, 11.8], [-5.25, 0.09, 0], "#747d8c");
  box(yardGroup, [0.22, 0.18, 11.8], [5.25, 0.09, 0], "#747d8c");

  // Servis Yanaşma Peronu (HEALTH_CLINIC_BAY: X: -11.0, Z: -43.5) - Z: -50 bulvarının güney bordüründe
  box(group, [4.8, 0.02, 3.2], [cx, 0.025, cz - 9.5], "#2c3437"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.3, 0.03, cz - 9.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.3, 0.03, cz - 9.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [4.8, 0.025, 0.15], [cx, 0.03, cz - 8.0], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.2; bx <= 2.2; bx += 0.8) {
    const isYellow = Math.round((bx + 2.2) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz - 7.9], isYellow ? "#f1c40f" : "#2c3e50");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz - 9.6], "#ffffff");
  arrowStem.rotation.x = Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz - 10.4);
  group.add(arrowHead);

  // =========================================================================
  // 2. TARİHİ NEOKLASİK SAĞLIK OCAĞI VE DİSPANSER BİNASI (MAIN CLINIC BUILDING)
  // =========================================================================
  const bldgGroup = new THREE.Group();
  bldgGroup.position.set(cx, 0, cz);
  group.add(bldgGroup);

  const bldgW = 7.6;
  const bldgH = 5.0;
  const bldgD = 5.6;

  // Beyaz badanalı kesme taş ana kütle
  box(bldgGroup, [bldgW, bldgH, bldgD], [0, bldgH / 2, 1.0], "#f8f9fa");

  // Koyu rustik taş kaide süpürgeliği
  box(bldgGroup, [bldgW + 0.16, 0.55, bldgD + 0.16], [0, 0.275, 1.0], "#bdc3c7");

  // Taş friz ve saçak kornişi
  box(bldgGroup, [bldgW + 0.35, 0.30, bldgD + 0.35], [0, bldgH - 0.15, 1.0], "#dfe4ea");

  // Köşe silmeleri (Ashlar Quoins)
  const quoinW = 0.38;
  const quoinD = 0.38;
  const corners = [
    [-bldgW / 2 + quoinW / 2, 1.0 - bldgD / 2 + quoinD / 2],
    [bldgW / 2 - quoinW / 2, 1.0 - bldgD / 2 + quoinD / 2],
    [-bldgW / 2 + quoinW / 2, 1.0 + bldgD / 2 - quoinD / 2],
    [bldgW / 2 - quoinW / 2, 1.0 + bldgD / 2 - quoinD / 2],
  ];
  corners.forEach(([qx, qz]) => {
    for (let qy = 0.6; qy < bldgH - 0.4; qy += 0.55) {
      box(bldgGroup, [quoinW + 0.06, 0.24, quoinD + 0.06], [qx, qy, qz], "#dcdde1");
    }
  });

  // Neoklasik Pilaster Sütunlar (Giriş cephesinde 4 adet)
  const pilasterX = [-2.6, -0.9, 0.9, 2.6];
  pilasterX.forEach((px) => {
    // Sütun kaidesi
    box(bldgGroup, [0.42, 0.35, 0.18], [px, 0.45, 1.0 - bldgD / 2 - 0.06], "#bdc3c7");
    // Sütun gövdesi
    box(bldgGroup, [0.32, bldgH - 1.2, 0.14], [px, bldgH / 2 - 0.2, 1.0 - bldgD / 2 - 0.06], "#ecf0f1");
    // Dorik/İon başlık
    box(bldgGroup, [0.44, 0.28, 0.20], [px, bldgH - 0.45, 1.0 - bldgD / 2 - 0.06], "#dcdde1");
  });

  // Giriş Portal Saçağı ve Basamaklı Taş Sahanlık
  box(bldgGroup, [2.4, 0.15, 1.4], [0, 0.08, 1.0 - bldgD / 2 - 0.65], "#bdc3c7"); // Alt basamak
  box(bldgGroup, [2.0, 0.15, 1.0], [0, 0.22, 1.0 - bldgD / 2 - 0.48], "#dcdde1"); // Üst basamak

  // Masif Koyu Ahşap Çift Kanatlı Giriş Kapısı
  box(bldgGroup, [1.5, 2.6, 0.15], [0, 1.45, 1.0 - bldgD / 2 - 0.02], "#2c3e50");
  box(bldgGroup, [1.3, 1.1, 0.06], [0, 2.05, 1.0 - bldgD / 2 + 0.06], "#74b9ff", 0.4); // Üst vitray cam
  // Pirinç Kapı Kolları
  cylinder(bldgGroup, 0.03, 0.03, 0.22, [-0.12, 1.35, 1.0 - bldgD / 2 - 0.10], "#f1c40f", 8);
  cylinder(bldgGroup, 0.03, 0.03, 0.22, [0.12, 1.35, 1.0 - bldgD / 2 - 0.10], "#f1c40f", 8);

  // Üçgen Alınlık (Classical Pediment) & Kızılay Kırmızı Hilal Rölyefi (Red Crescent)
  const pedimentGroup = new THREE.Group();
  pedimentGroup.position.set(0, bldgH, 1.0 - bldgD / 2);
  bldgGroup.add(pedimentGroup);

  // Alınlık tabanı ve üçgen timpanon
  box(pedimentGroup, [3.8, 0.24, 0.4], [0, 0.12, 0], "#dfe4ea");
  const pedimentMesh = new THREE.Mesh(
    new THREE.ConeGeometry(2.4, 1.2, 4),
    mat("#f8f9fa"),
  );
  pedimentMesh.rotation.y = Math.PI / 4;
  pedimentMesh.scale.set(1.1, 1.0, 0.35);
  pedimentMesh.position.set(0, 0.72, 0);
  pedimentGroup.add(pedimentMesh);

  // Kızılay Kırmızı Hilal Rölyefi (Red Crescent Emblem on Pediment)
  const crescentBase = cylinder(pedimentGroup, 0.38, 0.38, 0.10, [0, 0.65, -0.15], "#e74c3c", 16);
  crescentBase.rotation.x = Math.PI / 2;
  const crescentCutout = cylinder(pedimentGroup, 0.32, 0.32, 0.12, [0.12, 0.65, -0.16], "#f8f9fa", 16);
  crescentCutout.rotation.x = Math.PI / 2;

  // Masif Alaturka Kiremit Kırma Çatı (Hipped Terracotta Roof)
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(0, bldgW * 0.76, 2.2, 4),
    mat("#962d22"),
  );
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.05, 1.0, bldgD / bldgW);
  roof.position.set(0, bldgH + 1.1, 1.0);
  roof.castShadow = true;
  bldgGroup.add(roof);

  // Tuğla Havalandırma Bacası
  box(bldgGroup, [0.65, 1.3, 0.65], [bldgW / 2 - 1.2, bldgH + 1.4, 1.0 - 0.8], "#c0392b");
  box(bldgGroup, [0.75, 0.14, 0.75], [bldgW / 2 - 1.2, bldgH + 2.05, 1.0 - 0.8], "#7f8c8d");

  // Simetrik Kemerli Pencereler
  const windowPos = [
    [-1.75, 1.6, 1.0 - bldgD / 2 - 0.02],
    [1.75, 1.6, 1.0 - bldgD / 2 - 0.02],
    [-1.75, 3.4, 1.0 - bldgD / 2 - 0.02],
    [1.75, 3.4, 1.0 - bldgD / 2 - 0.02],
    [0, 3.4, 1.0 - bldgD / 2 - 0.02],
  ];
  const windowMeshes: THREE.Mesh[] = [];
  windowPos.forEach(([wx, wy, wz]) => {
    // Taş söve
    box(bldgGroup, [1.05, 1.45, 0.12], [wx, wy, wz], "#dfe4ea");
    // Pencere camı
    const winMesh = box(bldgGroup, [0.85, 1.25, 0.06], [wx, wy, wz - 0.02], "#74b9ff", 0.5);
    windowMeshes.push(winMesh);
    // Pencere çıtaları
    box(bldgGroup, [0.05, 1.25, 0.08], [wx, wy, wz - 0.03], "#ffffff");
    box(bldgGroup, [0.85, 0.05, 0.08], [wx, wy, wz - 0.03], "#ffffff");
    // Taş denizlik
    box(bldgGroup, [1.15, 0.10, 0.22], [wx, wy - 0.72, wz - 0.05], "#bdc3c7");
  });

  // =========================================================================
  // 3. AYDINLATMALI BÜYÜK KURUMSAL TABELA & GECE AYDINLATMASI
  // =========================================================================
  // Büyük Işıklı Kurumsal Tabela ("🏥 GÜNEŞ MAHALLESİ 1 NOLU SAĞLIK OCAĞI & DİSPANSERİ 🩺")
  const clinicSign = label(
    "🏥 GÜNEŞ MAHALLESİ 1 NOLU SAĞLIK OCAĞI & DİSPANSERİ 🩺",
    "#ffffff",
    "#c0392b",
  );
  clinicSign.scale.set(6.2, 1.15, 1);
  clinicSign.position.set(0, bldgH + 0.35, 1.0 - bldgD / 2 - 0.25);
  bldgGroup.add(clinicSign);

  // Alt Kurumsal Şerit ("T.C. SAĞLIK BAKANLIĞI · BİRİNCİ BASAMAK SAĞLIK HİZMETLERİ · 1952")
  const subSign = label(
    "T.C. SAĞLIK BAKANLIĞI · BİRİNCİ BASAMAK SAĞLIK HİZMETLERİ · 1952",
    "#f1c40f",
    "#2c3e50",
  );
  subSign.scale.set(5.4, 0.55, 1);
  subSign.position.set(0, bldgH - 0.30, 1.0 - bldgD / 2 - 0.25);
  bldgGroup.add(subSign);

  // Gece giriş cephesini aydınlatan sıcak PointLight
  const clinicEntranceLight = new THREE.PointLight("#ffffff", 0, 14, 1.5);
  clinicEntranceLight.position.set(0, 3.2, 1.0 - bldgD / 2 - 0.8);
  bldgGroup.add(clinicEntranceLight);

  // =========================================================================
  // 4. 24/7 NÖBETÇİ ECZANE KANADI & PARLAYAN YEŞİL NEON HAÇ (PHARMACY WING)
  // =========================================================================
  const pharmacyGroup = new THREE.Group();
  pharmacyGroup.position.set(-bldgW / 2 + 0.9, 0, 1.0 - bldgD / 2 + 0.8);
  bldgGroup.add(pharmacyGroup);

  // Eczane Girişi & Vitrin
  box(pharmacyGroup, [2.4, 2.6, 0.15], [0, 1.3, -0.85], "#27ae60");
  box(pharmacyGroup, [2.1, 1.9, 0.08], [0, 1.4, -0.92], "#a8e6cf", 0.6); // Vitrin camı

  // Çizgili Zümrüt Yeşili & Beyaz Güneşlik Tentesi
  const canopyGroup = new THREE.Group();
  canopyGroup.position.set(0, 2.65, -0.9);
  pharmacyGroup.add(canopyGroup);

  const canopyW = 2.6;
  const canopyD = 1.3;
  const stripeCount = 6;
  const stripeW = canopyW / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    const isGreen = i % 2 === 0;
    const stripe = box(
      canopyGroup,
      [stripeW, 0.04, canopyD],
      [-canopyW / 2 + (i + 0.5) * stripeW, 0, canopyD / 2],
      isGreen ? "#27ae60" : "#ffffff",
    );
    stripe.rotation.x = 0.22;
  }

  // Aydınlatmalı Büyük Yeşil Eczane Tabelası ("💚 NÖBETÇİ ECZANE · 24 SAAT AÇIK 💊")
  const pharmacySign = label(
    "💚 NÖBETÇİ ECZANE · 24 SAAT AÇIK 💊",
    "#ffffff",
    "#27ae60",
  );
  pharmacySign.scale.set(3.2, 0.85, 1);
  pharmacySign.position.set(0, 3.1, -0.9);
  pharmacyGroup.add(pharmacySign);

  // Yeşil Neon Medikal Haç Armatürü (Green Neon Cross - İkonik Türk Nöbetçi Eczane Haçı)
  const crossGroup = new THREE.Group();
  crossGroup.position.set(0, 4.0, -1.05);
  pharmacyGroup.add(crossGroup);

  // Neon Haç Arka Gövdesi (Koyu metal kutu)
  box(crossGroup, [0.42, 1.35, 0.12], [0, 0, 0], "#1e272e");
  box(crossGroup, [1.35, 0.42, 0.12], [0, 0, 0], "#1e272e");

  // Parlayan Zümrüt Yeşili Neon Ön Tüpleri
  const neonMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
  const neonVertical = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.25, 0.05), neonMat);
  neonVertical.position.set(0, 0, -0.07);
  crossGroup.add(neonVertical);

  const neonHorizontal = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.05), neonMat);
  neonHorizontal.position.set(0, 0, -0.07);
  crossGroup.add(neonHorizontal);

  // Yeşil Neon PointLight
  const neonLight = new THREE.PointLight("#2ecc71", 1.8, 12, 1.6);
  neonLight.position.set(0, 0, -0.35);
  crossGroup.add(neonLight);

  // =========================================================================
  // 5. PARK ETMİŞ VINTAGE BEYAZ AMBULANS ("SAĞLIK İMDAT · 112 / HIZIR ACİL")
  // =========================================================================
  const ambGroup = new THREE.Group();
  ambGroup.position.set(AMBULANCE_POS.x, 0, AMBULANCE_POS.z);
  group.add(ambGroup);

  // Acil Servis Park Cebi Zemin İşaretleri
  box(group, [2.4, 0.02, 4.8], [AMBULANCE_POS.x, 0.028, AMBULANCE_POS.z], "#2c3437");
  box(group, [2.4, 0.025, 0.12], [AMBULANCE_POS.x, 0.032, AMBULANCE_POS.z - 2.4], "#d63031");
  box(group, [2.4, 0.025, 0.12], [AMBULANCE_POS.x, 0.032, AMBULANCE_POS.z + 2.4], "#d63031");
  box(group, [0.12, 0.025, 4.8], [AMBULANCE_POS.x - 1.2, 0.032, AMBULANCE_POS.z], "#ffffff");
  box(group, [0.12, 0.025, 4.8], [AMBULANCE_POS.x + 1.2, 0.032, AMBULANCE_POS.z], "#ffffff");

  // Zemin "AMBULANS" Yazısı
  const ambFloorSign = label("AMBULANS · 112", "#ffffff", "#c0392b");
  ambFloorSign.rotation.x = -Math.PI / 2;
  ambFloorSign.scale.set(1.8, 0.55, 1);
  ambFloorSign.position.set(AMBULANCE_POS.x, 0.035, AMBULANCE_POS.z - 1.4);
  group.add(ambFloorSign);

  // 5.1 Ambulans Şasisi ve Tekerlekleri
  const wheelGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16);
  const wheelMat = mat("#1e272e");
  const hubMat = mat("#bdc3c7");
  const wheelOffsets = [
    [-0.85, 0.34, -1.25],
    [0.85, 0.34, -1.25],
    [-0.85, 0.34, 1.25],
    [0.85, 0.34, 1.25],
  ];
  wheelOffsets.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    ambGroup.add(wheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 8), hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wx, wy, wz);
    ambGroup.add(hub);
  });

  // 5.2 Ambulans Gövdesi (4.0m uzunluk x 1.7m genişlik x 1.85m yükseklik)
  // Beyaz ana gövde
  box(ambGroup, [1.65, 1.35, 3.8], [0, 1.05, 0], "#ffffff");
  // Boydan boya uzanan canlı kırmızı emniyet şeridi
  box(ambGroup, [1.68, 0.28, 3.82], [0, 0.95, 0], "#d63031");

  // Kabin ön kaputu
  box(ambGroup, [1.62, 0.55, 0.9], [0, 0.65, -1.75], "#ffffff");
  box(ambGroup, [1.64, 0.16, 0.9], [0, 0.65, -1.75], "#d63031");

  // Ön krom radyatör ızgarası & yuvarlak farlar
  box(ambGroup, [0.85, 0.32, 0.08], [0, 0.55, -2.22], "#bdc3c7");
  cylinder(ambGroup, 0.12, 0.12, 0.08, [-0.55, 0.55, -2.22], "#f1c40f", 12);
  cylinder(ambGroup, 0.12, 0.12, 0.08, [0.55, 0.55, -2.22], "#f1c40f", 12);

  // Ön cam & yan pencereler
  const windShield = box(ambGroup, [1.5, 0.65, 0.12], [0, 1.25, -1.35], "#74b9ff", 0.4);
  windShield.rotation.x = -0.25;
  // Yan kabin camları
  box(ambGroup, [1.68, 0.48, 0.75], [0, 1.25, -0.85], "#74b9ff", 0.4);
  // Yan hasta kabini pencereleri
  box(ambGroup, [1.68, 0.42, 1.4], [0, 1.25, 0.65], "#74b9ff", 0.4);

  // Arka çift kanatlı kapı detayı
  box(ambGroup, [0.04, 1.15, 0.06], [0, 1.05, 1.91], "#747d8c");
  box(ambGroup, [1.4, 0.12, 0.18], [0, 0.38, 1.95], "#bdc3c7"); // Arka basamak

  // Tavan acil tepe lambaları / döner flaşör çubuğu (Emergency Lightbar)
  box(ambGroup, [1.2, 0.08, 0.18], [0, 1.78, -0.6], "#2c3e50"); // Çelik tavan montaj rayı
  const redFlasher = cylinder(ambGroup, 0.12, 0.14, 0.18, [-0.42, 1.88, -0.6], "#e74c3c", 10);
  const blueFlasher = cylinder(ambGroup, 0.12, 0.14, 0.18, [0.42, 1.88, -0.6], "#0984e3", 10);

  const flasherLight = new THREE.PointLight("#ff3838", 1.2, 8, 1.8);
  flasherLight.position.set(0, 2.05, -0.6);
  ambGroup.add(flasherLight);

  // Yan ambulans kurumsal logoları ("SAĞLIK İMDAT · 112")
  const ambSideSignL = label("SAĞLIK İMDAT · 112", "#ffffff", "#c0392b");
  ambSideSignL.rotation.y = -Math.PI / 2;
  ambSideSignL.scale.set(1.8, 0.45, 1);
  ambSideSignL.position.set(-0.85, 1.0, 0.2);
  ambGroup.add(ambSideSignL);

  const ambSideSignR = label("SAĞLIK İMDAT · 112", "#ffffff", "#c0392b");
  ambSideSignR.rotation.y = Math.PI / 2;
  ambSideSignR.scale.set(1.8, 0.45, 1);
  ambSideSignR.position.set(0.85, 1.0, 0.2);
  ambGroup.add(ambSideSignR);

  // =========================================================================
  // 6. MEDİKAL VİTRİN, BOY-KİLO BASKÜLÜ VE DONATILAR
  // =========================================================================
  // 6.1 Nostaljik Boy-Kilo Ölçüm Terazisi (Vintage Medical Balance Scale)
  const scaleGroup = new THREE.Group();
  scaleGroup.position.set(cx - 3.2, 0, cz - 4.5);
  group.add(scaleGroup);

  box(scaleGroup, [0.65, 0.12, 0.65], [0, 0.06, 0], "#7f8c8d"); // Döküm demir ayak basma platformu
  cylinder(scaleGroup, 0.05, 0.05, 1.75, [0, 0.95, -0.24], "#bdc3c7", 8); // Dikey sütun
  // Üst yuvarlak pirinç ibre kadranı
  cylinder(scaleGroup, 0.22, 0.22, 0.08, [0, 1.85, -0.24], "#f1c40f", 16);
  cylinder(scaleGroup, 0.18, 0.18, 0.09, [0, 1.85, -0.23], "#ffffff", 16);
  // İbre
  box(scaleGroup, [0.03, 0.14, 0.02], [0, 1.87, -0.18], "#c0392b");
  // Boy ölçer cetveli
  box(scaleGroup, [0.08, 1.4, 0.04], [0, 1.1, -0.19], "#f5f6fa");

  // 6.2 Tebeşirli Karataş Sağlık Panosu (A-Frame Clinic Chalkboard)
  const chalkGroup = new THREE.Group();
  chalkGroup.position.set(cx + 2.8, 0, cz - 4.2);
  group.add(chalkGroup);

  const boardFront = box(chalkGroup, [1.0, 1.2, 0.05], [0, 0.65, 0.18], "#2c3e50");
  boardFront.rotation.x = -0.24;
  const boardBack = box(chalkGroup, [1.0, 1.2, 0.05], [0, 0.65, -0.18], "#2c3e50");
  boardBack.rotation.x = 0.24;

  const chalkSign = label(
    "🩺 NÖBETÇİ DOKTOR: DR. HİKMET BEY\n💊 AŞI & PANSUMAN: 08:00 - 17:00\n💚 ECZANE: 7/24 AÇIK",
    "#ffffff",
    "#1e272e",
  );
  chalkSign.rotation.x = -0.24;
  chalkSign.scale.set(1.2, 0.85, 1);
  chalkSign.position.set(0, 0.68, 0.22);
  chalkGroup.add(chalkSign);

  // 6.3 İlk Yardım Sedyesi & Oksijen Tüpü Donatısı
  const gurneyGroup = new THREE.Group();
  gurneyGroup.position.set(cx + 3.8, 0, cz - 1.5);
  group.add(gurneyGroup);

  // Sedye tekerlekleri ve katlanır krom bacaklar
  box(gurneyGroup, [0.95, 0.08, 2.1], [0, 0.65, 0], "#ecf0f1"); // Sedye minderi
  box(gurneyGroup, [0.98, 0.06, 0.45], [0, 0.72, -0.75], "#bdc3c7"); // Baş yastığı
  cylinder(gurneyGroup, 0.04, 0.04, 0.65, [-0.4, 0.32, -0.8], "#7f8c8d", 8);
  cylinder(gurneyGroup, 0.04, 0.04, 0.65, [0.4, 0.32, -0.8], "#7f8c8d", 8);
  cylinder(gurneyGroup, 0.04, 0.04, 0.65, [-0.4, 0.32, 0.8], "#7f8c8d", 8);
  cylinder(gurneyGroup, 0.04, 0.04, 0.65, [0.4, 0.32, 0.8], "#7f8c8d", 8);

  // Oksijen Tüpü
  const o2Tank = cylinder(gurneyGroup, 0.14, 0.14, 0.95, [0.55, 0.55, 0.2], "#3498db", 12);
  cylinder(gurneyGroup, 0.06, 0.06, 0.16, [0.55, 1.08, 0.2], "#f1c40f", 8); // Manometre

  // =========================================================================
  // 7. ANİMASYONLU BAŞHEKİM NPC — "DR. HİKMET BEY"
  // =========================================================================
  const drGroup = new THREE.Group();
  drGroup.position.set(DR_HIKMET_POS.x, 0, DR_HIKMET_POS.z);
  group.add(drGroup);

  // Bacaklar (Lacivert kumaş pantolon ve siyah ayakkabılar)
  const leftLeg = cylinder(drGroup, 0.11, 0.11, 0.65, [-0.16, 0.325, 0], "#2c3e50", 8);
  const rightLeg = cylinder(drGroup, 0.11, 0.11, 0.65, [0.16, 0.325, 0], "#2c3e50", 8);
  box(drGroup, [0.15, 0.12, 0.26], [-0.16, 0.06, -0.05], "#1e272e");
  box(drGroup, [0.15, 0.12, 0.26], [0.16, 0.06, -0.05], "#1e272e");

  // Gövde Üst Grubu (Kafa/gövde takibi için döner)
  const drUpper = new THREE.Group();
  drUpper.position.set(0, 0.65, 0);
  drGroup.add(drUpper);

  // Beyaz Doktor Önlüğü & İç Mavi Gömlek
  box(drUpper, [0.52, 0.72, 0.32], [0, 0.36, 0], "#ffffff");
  box(drUpper, [0.22, 0.35, 0.05], [0, 0.48, -0.15], "#74b9ff"); // İç cerrahi/vizit gömleği
  box(drUpper, [0.08, 0.28, 0.06], [0, 0.44, -0.16], "#c0392b"); // Kırmızı kravat

  // Önlük Etekleri
  box(drUpper, [0.54, 0.38, 0.34], [0, 0.12, 0], "#ffffff");

  // Gümüş-Siyah Steteskop (Stethoscope hanging around neck)
  const stethTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.025, 8, 16, Math.PI),
    mat("#2c3e50"),
  );
  stethTorus.rotation.x = Math.PI / 2;
  stethTorus.position.set(0, 0.68, -0.08);
  drUpper.add(stethTorus);
  // Steteskop diyafram tamburu
  cylinder(drUpper, 0.055, 0.055, 0.03, [0.08, 0.42, -0.17], "#bdc3c7", 12);

  // Kafa ve Yüz
  const drHead = new THREE.Group();
  drHead.position.set(0, 0.82, 0);
  drUpper.add(drHead);

  // Ten rengi baş
  box(drHead, [0.32, 0.34, 0.30], [0, 0.08, 0], "#f5cd79");
  // Kırlaşmış hekim saçları
  box(drHead, [0.34, 0.14, 0.32], [0, 0.22, -0.02], "#7f8c8d");
  // Altın Çerçeveli Hekim Gözlüğü
  box(drHead, [0.28, 0.08, 0.04], [0, 0.10, -0.16], "#f1c40f");
  box(drHead, [0.10, 0.06, 0.05], [-0.08, 0.10, -0.16], "#74b9ff", 0.4);
  box(drHead, [0.10, 0.06, 0.05], [0.08, 0.10, -0.16], "#74b9ff", 0.4);
  // Hekim Bıyığı
  box(drHead, [0.18, 0.06, 0.06], [0, 0.01, -0.16], "#7f8c8d");

  // Kollar & Elinde Tıbbi Müşahade Dosyası (Clipboard)
  // Sol Kol (Rahat duruş)
  const leftArm = cylinder(drUpper, 0.07, 0.07, 0.55, [-0.34, 0.32, 0], "#ffffff", 8);

  // Sağ Kol & Pano Grubu (Selamlama animasyonu için döner)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.34, 0.55, 0);
  drUpper.add(rightArmPivot);

  const rightArm = cylinder(rightArmPivot, 0.07, 0.07, 0.55, [0, -0.24, 0], "#ffffff", 8);
  rightArm.rotation.x = -0.25;

  // Tıbbi Hasta Dosyası / Klipsli Pano (Medical Chart Clipboard)
  const clipboardGroup = new THREE.Group();
  clipboardGroup.position.set(0, -0.45, -0.12);
  rightArmPivot.add(clipboardGroup);

  box(clipboardGroup, [0.28, 0.38, 0.03], [0, 0, 0], "#d35400"); // Ahşap pano tablası
  box(clipboardGroup, [0.24, 0.32, 0.02], [0, -0.01, -0.02], "#ffffff"); // Beyaz hasta reçetesi kağıdı
  box(clipboardGroup, [0.12, 0.05, 0.04], [0, 0.16, -0.02], "#bdc3c7"); // Çelik klips

  // 3D Konuşma Balonu (Callout Speech Bubble)
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 1.85, 0);
  bubbleGroup.visible = false;
  drGroup.add(bubbleGroup);

  const bubbleText = label(DR_HIKMET_CALLOUTS[0], "#2c3e50", "#ffffff");
  bubbleText.scale.set(4.8, 1.25, 1);
  bubbleGroup.add(bubbleText);

  // =========================================================================
  // 8. ÇARPIŞMA ENGELLERİ (COLLIDERS & OBSTACLES)
  // =========================================================================
  // 1. Ana Sağlık Ocağı ve Eczane Binası Masif Engeli
  obstacles.push({
    minX: cx - bldgW / 2 - 0.2,
    maxX: cx + bldgW / 2 + 0.2,
    minZ: cz - bldgD / 2 - 0.2 + 1.0,
    maxZ: cz + bldgD / 2 + 0.2 + 1.0,
  });

  // 2. Park Etmiş Beyaz Ambulans Engeli
  obstacles.push({
    minX: AMBULANCE_POS.x - 1.1,
    maxX: AMBULANCE_POS.x + 1.1,
    minZ: AMBULANCE_POS.z - 2.2,
    maxZ: AMBULANCE_POS.z + 2.2,
  });

  // 3. Boy-Kilo Baskülü Engeli
  obstacles.push({
    minX: cx - 3.6,
    maxX: cx - 2.8,
    minZ: cz - 4.9,
    maxZ: cz - 4.1,
  });

  // 4. İlk Yardım Sedyesi ve Oksijen Tüpü Engeli
  obstacles.push({
    minX: cx + 3.2,
    maxX: cx + 4.4,
    minZ: cz - 2.6,
    maxZ: cz - 0.4,
  });

  // =========================================================================
  // 9. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let calloutTimer = 0;
  let animTime = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: HealthClinicState | boolean,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      animTime += dt;
      let state: HealthClinicState | undefined;
      let night = isNightOrDusk;

      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
      }

      // 1. Gece/Gündüz Işıklandırması
      const targetEntranceIntensity = night ? 1.6 : 0.0;
      clinicEntranceLight.intensity = THREE.MathUtils.lerp(
        clinicEntranceLight.intensity,
        targetEntranceIntensity,
        dt * 3.0,
      );

      // 2. Yeşil Neon Eczane Haçı Nabız Animasyonu
      const neonPulse = 0.5 + 0.5 * Math.sin(animTime * 3.5);
      neonMat.color.setRGB(0.18 + neonPulse * 0.12, 0.80 + neonPulse * 0.20, 0.44);
      neonLight.intensity = (night ? 2.4 : 1.4) + neonPulse * 0.8;

      // 3. Ambulans Tepe Flaşörleri
      const flasherPhase = (animTime * 8.0) % (Math.PI * 2);
      const isRedCycle = Math.sin(flasherPhase) > 0;
      flasherLight.color.set(isRedCycle ? "#ff3838" : "#0984e3");
      flasherLight.intensity = night ? 1.4 : 0.8;
      redFlasher.scale.setScalar(isRedCycle ? 1.15 : 0.95);
      blueFlasher.scale.setScalar(!isRedCycle ? 1.15 : 0.95);

      // 4. Pencerelerin Gece Sıcak İç Aydınlatması
      windowMeshes.forEach((win) => {
        const winMat = win.material as THREE.MeshStandardMaterial;
        if (winMat) {
          winMat.emissive.set(night ? "#f6e58d" : "#000000");
          winMat.emissiveIntensity = night ? 0.65 : 0.0;
        }
      });

      // 5. Dr. Hikmet Bey Kafa ve Gövde Takibi (Head Tracking)
      if (playerPos) {
        const dx = playerPos.x - DR_HIKMET_POS.x;
        const dz = playerPos.z - DR_HIKMET_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          drUpper.rotation.y = THREE.MathUtils.lerp(drUpper.rotation.y, targetAngle, dt * 4.0);
        } else {
          drUpper.rotation.y = THREE.MathUtils.lerp(drUpper.rotation.y, 0, dt * 2.0);
        }
      }

      // 6. Konuşma Balonu & Karşılama Selamı
      if (state && state.honkGreetingTimer > 0) {
        calloutTimer = state.honkGreetingTimer;
        if (state.lastHonkCallout) {
          bubbleGroup.visible = true;
          // Sağ kolu panoyla havaya kaldırma selamı
          rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -1.35, dt * 6.0);
        }
      } else if (calloutTimer > 0) {
        calloutTimer -= dt;
        if (calloutTimer <= 0) {
          bubbleGroup.visible = false;
        }
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -1.35, dt * 6.0);
      } else {
        bubbleGroup.visible = false;
        // Dinlenme pozuna dönüş
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 3.0);
      }
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - DR_HIKMET_POS.x, playerPos.z - DR_HIKMET_POS.z);
      if (dist <= 26.0) {
        calloutTimer = 4.0;
        bubbleGroup.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      obstacles.length = 0;
    },
  };
}
