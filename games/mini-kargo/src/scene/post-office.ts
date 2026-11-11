import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type PostOfficeState,
  POST_OFFICE_CENTER,
  POST_OFFICE_BAY,
  KEMAL_POS,
  KEMAL_CALLOUTS,
} from "../game/post-office";

export type PostOfficeView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: PostOfficeState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Güneş Mahallesi "Tarihi Mahalle Postanesi & Kargo Dağıtım Şubesi (PTT)" (T58)
 * - Erken Cumhuriyet / Neoklasik Tarihi Taş Postane Mimarisi:
 *   - 14.0m x 11.4m klinker tuğla ve granit avlu tablası, bordür taşları ve servis yanaşma peronu (POST_OFFICE_BAY: X: -14.0, Z: -83.5)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku
 *   - Kesme kireçtaşı ve sıcak traverten taş duvarlar, koyu gri kaide süpürgeliği, köşe silmeleri
 *   - 4 adet neoklasik pilaster sütun ve İon/Dorik sütun başlıkları
 *   - Masif koyu meşe çift kanatlı giriş kapısı, pirinç kulplar, kemerli taş kapı sövesi ve basamaklı sahanlık
 *   - Simetrik kemerli pencereler, vitray camlar ve taş denizlikler
 *   - Masif kiremit kırma çatı, korniş, taş friz ve tuğla baca
 *   - Aydınlatmalı büyük sarı-lacivert kurumsal tabela ("🏤 GÜNEŞ MAHALLESİ TARİHİ POSTANESİ · PTT 📬")
 *   - Alt kurumsal şerit ("T.C. POSTA VE TELGRAF TEŞKİLATI · KURULUŞ 1840 · DAĞITIM ŞUBESİ")
 *   - Giriş kemeri üzerinde pirinç döküm Posta Güvercini & Borazan rölyefi
 *   - Gece cepheyi aydınlatan sıcak kehribar PointLight armatürü
 *   - Nostaljik pirinç mektup atma yuvaları / telgraf mazgalları ("ŞEHİR İÇİ", "ŞEHİRLER ARASI", "TELGRAF & APS")
 *   - Kaldırımda klasik nostaljik sarı silindirik PTT mektup kutusu
 *   - Park etmiş 2 adet nostaljik kırmızı-sarı PTT dağıtım mopedi (çift sarı heybe çanta ve "PTT DAĞITIM" plakası)
 *   - Mekanik döküm paket kantar baskülü, ahşap Mini Kargo / PTT mühürlü koli sandıkları, telgraf direği ve izolatörler
 * - Animasyonlu Başpostacı NPC — "Postacı Kemal Efendi" (X: -11.5, Z: -85.5):
 *   - Lacivert PTT postacı üniforması, sarı biyeler, altın düğmeler, sarı şeritli lacivert kasket, omuzda deri mektup çantası
 *   - Elinde mühürlü ekspres kargo zarfı ve teslimat çizelgesi
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve duraklamada zarfı havaya kaldırarak selamlama ve 3D konuşma balonu
 */
export function createPostOfficeView(): PostOfficeView {
  const group = new THREE.Group();
  group.name = "post-office-view";
  const obstacles: Rect[] = [];

  const cx = POST_OFFICE_CENTER.x; // -14.0
  const cz = POST_OFFICE_CENTER.z; // -92.0

  // =========================================================================
  // 1. AVLU TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Klinker tuğla ve granit taş avlu tablası (14.0m x 11.4m)
  box(yardGroup, [14.0, 0.12, 11.4], [0, 0.04, 2.5], "#dcdde1");
  box(yardGroup, [13.6, 0.05, 11.0], [0, 0.10, 2.5], "#bdc3c7");

  // Çevre bordür taşları
  box(yardGroup, [14.2, 0.18, 0.22], [0, 0.09, -3.25], "#747d8c");
  box(yardGroup, [14.2, 0.18, 0.22], [0, 0.09, 8.25], "#747d8c");
  box(yardGroup, [0.22, 0.18, 11.6], [-7.05, 0.09, 2.5], "#747d8c");
  box(yardGroup, [0.22, 0.18, 11.6], [7.05, 0.09, 2.5], "#747d8c");

  // Servis Yanaşma Peronu (POST_OFFICE_BAY: X: -14.0, Z: -83.5) - Z: -80 caddesinin kuzey bordüründe
  box(group, [5.2, 0.02, 3.0], [cx, 0.025, cz + 8.5], "#2c3437"); // Asfalt yanaşma peronu cebi
  box(group, [0.15, 0.025, 3.0], [cx - 2.5, 0.03, cz + 8.5], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.0], [cx + 2.5, 0.03, cz + 8.5], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 7.1], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 7.0], isYellow ? "#f1c40f" : "#1a365d");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 8.4], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 9.2);
  group.add(arrowHead);

  // =========================================================================
  // 2. NEOKLASİK TARİHİ TAŞ POSTANE BİNASI (MAIN POST OFFICE BUILDING)
  // =========================================================================
  const bldgGroup = new THREE.Group();
  bldgGroup.position.set(cx, 0, cz);
  group.add(bldgGroup);

  const bldgW = 9.6;
  const bldgH = 5.2;
  const bldgD = 6.4;

  // Masif Koyu Gri Taş Kaide Süpürgeliği
  box(bldgGroup, [bldgW + 0.5, 0.65, bldgD + 0.5], [0, 0.32, 0], "#57606f");

  // Sıcak Traverten / Kesme Kireçtaşı Ana Gövde Duvarları
  box(bldgGroup, [bldgW, bldgH - 0.65, bldgD], [0, 0.65 + (bldgH - 0.65) / 2, 0], "#f5f0e6");

  // Köşe Kesme Taş Silmeleri (Ashlar Quoins)
  const quoinOffsets = [
    [-bldgW / 2, -bldgD / 2],
    [bldgW / 2, -bldgD / 2],
    [-bldgW / 2, bldgD / 2],
    [bldgW / 2, bldgD / 2],
  ];
  quoinOffsets.forEach(([qx, qz]) => {
    box(bldgGroup, [0.65, bldgH, 0.65], [qx, bldgH / 2, qz], "#dcdde1");
  });

  // 4 Adet Neoklasik Pilaster Sütun (Ön Cephe Z: bldgD / 2)
  const colXPositions = [-3.4, -1.2, 1.2, 3.4];
  colXPositions.forEach((colX) => {
    // Sütun gövdesi
    box(bldgGroup, [0.55, bldgH - 0.4, 0.3], [colX, (bldgH - 0.4) / 2 + 0.2, bldgD / 2 + 0.12], "#e2d9cc");
    // İon/Dorik sütun başlığı ve taban pabucu
    box(bldgGroup, [0.75, 0.22, 0.42], [colX, bldgH - 0.1, bldgD / 2 + 0.15], "#dcdde1");
    box(bldgGroup, [0.75, 0.22, 0.42], [colX, 0.45, bldgD / 2 + 0.15], "#dcdde1");
  });

  // Çatı Kornişi ve Taş Friz Silmesi
  box(bldgGroup, [bldgW + 0.7, 0.35, bldgD + 0.7], [0, bldgH + 0.18, 0], "#dcdde1");
  box(bldgGroup, [bldgW + 0.9, 0.25, bldgD + 0.9], [0, bldgH + 0.45, 0], "#747d8c");

  // Masif Kiremit Kırma Çatı (Terracotta Hipped Roof)
  const roofH = 1.9;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.hypot(bldgW, bldgD) * 0.52, roofH, 4),
    mat("#962d22"),
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, bldgH + 0.55 + roofH / 2, 0);
  roof.castShadow = true;
  bldgGroup.add(roof);

  // Kiremit Tuğla Baca
  box(bldgGroup, [0.65, 1.4, 0.65], [-3.0, bldgH + 1.6, -1.2], "#c0392b");
  box(bldgGroup, [0.8, 0.15, 0.8], [-3.0, bldgH + 2.35, -1.2], "#7f8c8d");

  // =========================================================================
  // 3. MERKEZİ GİRİŞ PORTALI, MASİF KAPILAR VE BASAMAKLAR
  // =========================================================================
  // Basamaklı Taş Giriş Sahanlığı
  box(bldgGroup, [3.2, 0.2, 1.4], [0, 0.1, bldgD / 2 + 0.7], "#a4b0be");
  box(bldgGroup, [2.8, 0.2, 1.0], [0, 0.3, bldgD / 2 + 0.5], "#cbd5e0");

  // Kemerli Giriş Portali Sövesi
  box(bldgGroup, [2.4, 3.2, 0.3], [0, 1.8, bldgD / 2 + 0.15], "#dcdde1");
  box(bldgGroup, [2.6, 0.35, 0.45], [0, 3.45, bldgD / 2 + 0.2], "#747d8c");

  // Masif Çift Kanatlı Koyu Meşe Giriş Kapısı
  box(bldgGroup, [1.8, 2.7, 0.15], [0, 1.55, bldgD / 2 + 0.2], "#4b3832");
  // Altın Pirinç Kapı Kolları
  cylinder(bldgGroup, 0.04, 0.04, 0.25, [-0.2, 1.5, bldgD / 2 + 0.3], "#f39c12", 8);
  cylinder(bldgGroup, 0.04, 0.04, 0.25, [0.2, 1.5, bldgD / 2 + 0.3], "#f39c12", 8);

  // Kemer Üzerinde Pirinç Döküm Posta Güvercini & Borazan Rölyefi
  const emblemGroup = new THREE.Group();
  emblemGroup.position.set(0, 3.9, bldgD / 2 + 0.18);
  cylinder(emblemGroup, 0.08, 0.22, 0.6, [0, 0, 0], "#f1c40f", 8);
  box(emblemGroup, [0.75, 0.12, 0.1], [0, 0.18, 0], "#f39c12");
  bldgGroup.add(emblemGroup);

  // Simetrik Kemerli Pencereler (Sol ve Sağ Kanatlar)
  const windowXPositions = [-2.3, 2.3];
  windowXPositions.forEach((wx) => {
    // Alt kat penceresi
    box(bldgGroup, [1.2, 1.6, 0.12], [wx, 1.8, bldgD / 2 + 0.08], "#2f3542");
    box(bldgGroup, [1.0, 1.4, 0.14], [wx, 1.8, bldgD / 2 + 0.09], "#74b9ff", 0.4);
    box(bldgGroup, [1.4, 0.14, 0.35], [wx, 0.95, bldgD / 2 + 0.18], "#dcdde1");
    // Üst kat kemerli penceresi
    box(bldgGroup, [1.2, 1.3, 0.12], [wx, 3.8, bldgD / 2 + 0.08], "#2f3542");
    box(bldgGroup, [1.0, 1.1, 0.14], [wx, 3.8, bldgD / 2 + 0.09], "#74b9ff", 0.4);
    box(bldgGroup, [1.4, 0.14, 0.35], [wx, 3.1, bldgD / 2 + 0.18], "#dcdde1");
  });

  // =========================================================================
  // 4. AYDINLATMALI SARI-LACİVERT PTT TABELASI & KURUMSAL LEVHALAR
  // =========================================================================
  // Büyük Aydınlatmalı Çatı Alınlık Tabelası
  const mainSign = label("🏤 GÜNEŞ MAHALLESİ TARİHİ POSTANESİ · PTT 📬", "#1a365d", "#f1c40f");
  mainSign.scale.set(6.8, 1.15, 1);
  mainSign.position.set(cx, bldgH + 0.9, cz + bldgD / 2 + 0.2);
  group.add(mainSign);

  // Alt Kurumsal Şerit Bandı
  const subSign = label("T.C. POSTA VE TELGRAF TEŞKİLATI · KURULUŞ 1840 · DAĞITIM ŞUBESİ", "#ffffff", "#1a365d");
  subSign.scale.set(5.8, 0.45, 1);
  subSign.position.set(cx, bldgH + 0.25, cz + bldgD / 2 + 0.25);
  group.add(subSign);

  // Sıcak Gece Cephe Aydınlatma Feneri (PointLight)
  const facadeLight = new THREE.PointLight("#ffeaa7", 1.8, 26, 1.4);
  facadeLight.position.set(cx, bldgH + 0.6, cz + bldgD / 2 + 1.2);
  group.add(facadeLight);

  // Ferforje Fener Muhafazası
  cylinder(bldgGroup, 0.12, 0.16, 0.4, [0, bldgH + 0.5, bldgD / 2 + 0.9], "#2c3e50", 8);
  box(bldgGroup, [0.08, 0.08, 0.8], [0, bldgH + 0.7, bldgD / 2 + 0.5], "#2c3e50");

  // =========================================================================
  // 5. NOSTALJİK PİRİNÇ MEKTUP MAZGALLARI & SARI PTT POSTA KUTUSU
  // =========================================================================
  // Cephede 3 Adet Nostaljik Pirinç Mektup Atma Yuvası (Doğu Kanadı Duvarında, X: 3.5, Z: bldgD / 2 + 0.1)
  const mailDrops = [
    { labelText: "ŞEHİR İÇİ", y: 2.1 },
    { labelText: "ŞEHİRLER ARASI", y: 1.6 },
    { labelText: "TELGRAF & APS", y: 1.1 },
  ];
  mailDrops.forEach((md) => {
    box(bldgGroup, [0.95, 0.28, 0.08], [3.5, md.y, bldgD / 2 + 0.08], "#f39c12");
    box(bldgGroup, [0.75, 0.06, 0.1], [3.5, md.y + 0.02, bldgD / 2 + 0.09], "#1a202c");
    const dropLabel = label(md.labelText, "#ffffff", "#1a365d");
    dropLabel.scale.set(0.85, 0.18, 1);
    dropLabel.position.set(cx + 3.5, md.y - 0.08, cz + bldgD / 2 + 0.14);
    group.add(dropLabel);
  });

  // Kaldırım Kenarında Klasik Nostaljik Sarı Silindirik PTT Posta Kutusu (X: cx + 4.8, Z: cz + 5.6)
  const pillarBoxGroup = new THREE.Group();
  pillarBoxGroup.position.set(cx + 4.8, 0, cz + 5.6);
  cylinder(pillarBoxGroup, 0.35, 0.38, 0.15, [0, 0.075, 0], "#2c3e50", 12);
  cylinder(pillarBoxGroup, 0.28, 0.28, 1.15, [0, 0.72, 0], "#f1c40f", 14);
  cylinder(pillarBoxGroup, 0.29, 0.29, 0.18, [0, 0.95, 0], "#1a365d", 14);
  box(pillarBoxGroup, [0.24, 0.05, 0.08], [0, 1.05, 0.25], "#f39c12");
  box(pillarBoxGroup, [0.20, 0.02, 0.10], [0, 1.05, 0.26], "#1a202c");
  const boxDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat("#f1c40f"),
  );
  boxDome.position.set(0, 1.3, 0);
  pillarBoxGroup.add(boxDome);
  group.add(pillarBoxGroup);

  // =========================================================================
  // 6. PARK ETMİŞ 2 ADET PTT POSTA DAĞITIM MOPEDİ (POSTAL DISPATCH MOPEDS)
  // =========================================================================
  // Batı Kanadında Park Etmiş PTT Dağıtım Mopedleri (X: cx - 4.6, Z: cz + 4.8 ve cz + 6.2)
  const mopedZPositions = [cz + 4.8, cz + 6.2];
  mopedZPositions.forEach((mz, mIdx) => {
    const mopedGroup = new THREE.Group();
    mopedGroup.position.set(cx - 4.6, 0, mz);
    mopedGroup.rotation.y = -Math.PI / 2 + 0.12 * (mIdx === 0 ? 1 : -1);

    // Tekerlekler (Ön & Arka)
    const wheelMat = mat("#1a202c", 0.9);
    const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), wheelMat);
    fw.rotation.z = Math.PI / 2;
    fw.position.set(0, 0.28, 0.75);
    mopedGroup.add(fw);

    const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), wheelMat);
    rw.rotation.z = Math.PI / 2;
    rw.position.set(0, 0.28, -0.65);
    mopedGroup.add(rw);

    // Kırmızı PTT Gövdesi
    box(mopedGroup, [0.36, 0.42, 1.1], [0, 0.48, 0.05], "#e74c3c");
    box(mopedGroup, [0.32, 0.12, 0.55], [0, 0.72, -0.2], "#2c3e50");
    cylinder(mopedGroup, 0.02, 0.02, 0.5, [0, 0.78, 0.6], "#bdc3c7", 8);
    box(mopedGroup, [0.65, 0.04, 0.04], [0, 1.02, 0.6], "#bdc3c7");
    cylinder(mopedGroup, 0.09, 0.09, 0.1, [0, 0.85, 0.78], "#fff9d2", 8);

    // İKONİK DETAY: Canlı Sarı Arka PTT Heybe Dağıtım Çantaları & Ön Sepet
    box(mopedGroup, [0.22, 0.35, 0.48], [-0.28, 0.58, -0.45], "#f1c40f");
    box(mopedGroup, [0.22, 0.35, 0.48], [0.28, 0.58, -0.45], "#f1c40f");
    box(mopedGroup, [0.38, 0.36, 0.42], [0, 0.85, -0.55], "#f1c40f");
    box(mopedGroup, [0.40, 0.06, 0.44], [0, 1.04, -0.55], "#1a365d");
    box(mopedGroup, [0.42, 0.22, 0.28], [0, 0.68, 0.78], "#2c3e50");
    box(mopedGroup, [0.24, 0.14, 0.02], [0, 0.38, -0.82], "#ffffff");

    group.add(mopedGroup);
  });

  // Moped Park Bölgesi Engeli (Obstacle)
  obstacles.push({
    minX: cx - 5.5,
    maxX: cx - 3.7,
    minZ: cz + 4.2,
    maxZ: cz + 6.8,
  });

  // =========================================================================
  // 7. PAKET KANTAR BASKÜLÜ, PTT KOLİLERİ VE TELGRAF DİREĞİ
  // =========================================================================
  // Mekanik Ağır Paket Kantar Baskülü (X: cx + 3.8, Z: cz + 4.2)
  const scaleGroup = new THREE.Group();
  scaleGroup.position.set(cx + 3.8, 0, cz + 4.2);
  box(scaleGroup, [1.1, 0.18, 0.9], [0, 0.09, 0], "#34495e");
  cylinder(scaleGroup, 0.05, 0.05, 1.1, [0.42, 0.65, 0], "#7f8c8d", 8);
  cylinder(scaleGroup, 0.24, 0.24, 0.1, [0.42, 1.25, 0], "#ffffff", 12);
  cylinder(scaleGroup, 0.25, 0.25, 0.08, [0.42, 1.25, -0.01], "#f1c40f", 12);
  box(scaleGroup, [0.55, 0.42, 0.55], [-0.08, 0.38, 0], "#d35400");
  box(scaleGroup, [0.58, 0.04, 0.58], [-0.08, 0.42, 0], "#c0392b");
  group.add(scaleGroup);

  // Telgraf ve Telefon Direği (X: cx + 5.8, Z: cz + 6.0)
  const poleGroup = new THREE.Group();
  poleGroup.position.set(cx + 5.8, 0, cz + 6.0);
  cylinder(poleGroup, 0.12, 0.16, 6.2, [0, 3.1, 0], "#5d4037", 10);
  box(poleGroup, [1.4, 0.12, 0.12], [0, 5.6, 0], "#4e342e");
  box(poleGroup, [1.8, 0.12, 0.12], [0, 5.9, 0], "#4e342e");
  for (const ix of [-0.7, -0.35, 0.35, 0.7]) {
    cylinder(poleGroup, 0.04, 0.05, 0.15, [ix, 6.02, 0], "#ffffff", 6);
  }
  group.add(poleGroup);

  // =========================================================================
  // 8. ANİMASYONLU BAŞPOSTACI NPC — "POSTACI KEMAL EFENDİ"
  // =========================================================================
  const kemalGroup = new THREE.Group();
  kemalGroup.position.set(KEMAL_POS.x, 0, KEMAL_POS.z);
  group.add(kemalGroup);

  // Bacaklar (Lacivert PTT üniforma pantolonu)
  box(kemalGroup, [0.2, 0.8, 0.22], [-0.15, 0.4, 0], "#1a365d");
  box(kemalGroup, [0.2, 0.8, 0.22], [0.15, 0.4, 0], "#1a365d");
  box(kemalGroup, [0.22, 0.14, 0.32], [-0.15, 0.07, 0.05], "#1a202c");
  box(kemalGroup, [0.22, 0.14, 0.32], [0.15, 0.07, 0.05], "#1a202c");

  // Gövde Grubu
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.82, 0);
  kemalGroup.add(torsoGroup);

  box(torsoGroup, [0.58, 0.65, 0.34], [0, 0.32, 0], "#1a365d");
  box(torsoGroup, [0.24, 0.25, 0.04], [0, 0.52, 0.18], "#f1c40f");
  box(torsoGroup, [0.06, 0.45, 0.04], [0, 0.26, 0.18], "#f1c40f");
  for (let dy = 0.15; dy <= 0.45; dy += 0.14) {
    cylinder(torsoGroup, 0.03, 0.03, 0.05, [0, dy, 0.19], "#f39c12", 8);
  }

  // Omuzda Çapraz Deri Postacı Mektup Çantası
  box(torsoGroup, [0.08, 0.72, 0.36], [-0.08, 0.36, 0], "#795548");
  box(torsoGroup, [0.42, 0.32, 0.18], [-0.32, 0.18, 0.02], "#5d4037");
  box(torsoGroup, [0.44, 0.12, 0.20], [-0.32, 0.28, 0.02], "#4e342e");
  cylinder(torsoGroup, 0.02, 0.02, 0.04, [-0.32, 0.18, 0.12], "#f39c12", 8);

  // Baş ve Kasket Grubu
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  torsoGroup.add(headGroup);

  cylinder(headGroup, 0.1, 0.1, 0.15, [0, 0.06, 0], "#f5cba7", 8);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat("#f5cba7"));
  headMesh.position.set(0, 0.22, 0);
  headGroup.add(headMesh);

  box(headGroup, [0.24, 0.08, 0.1], [0, 0.18, 0.18], "#3e2723");

  // Resmi Lacivert PTT Kasketi
  box(headGroup, [0.42, 0.14, 0.42], [0, 0.35, 0.02], "#1a365d");
  box(headGroup, [0.44, 0.04, 0.44], [0, 0.30, 0.02], "#f1c40f");
  cylinder(headGroup, 0.04, 0.04, 0.04, [0, 0.35, 0.24], "#f39c12", 8);
  const visor = box(headGroup, [0.38, 0.03, 0.18], [0, 0.28, 0.26], "#1a202c");
  visor.rotation.x = 0.25;

  // Sol Kol (Panoya Tutunma)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.58, 0);
  torsoGroup.add(leftArm);
  box(leftArm, [0.15, 0.55, 0.16], [-0.02, -0.25, 0.05], "#1a365d");
  cylinder(leftArm, 0.06, 0.06, 0.12, [-0.02, -0.55, 0.08], "#f5cba7", 8);
  box(leftArm, [0.24, 0.35, 0.04], [-0.02, -0.52, 0.18], "#795548");
  box(leftArm, [0.20, 0.30, 0.02], [-0.02, -0.52, 0.21], "#ffffff");

  // Sağ Kol (Zarf Tutma & Selamlama)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.35, 0.58, 0);
  torsoGroup.add(rightArmPivot);

  box(rightArmPivot, [0.15, 0.55, 0.16], [0.02, -0.25, 0.05], "#1a365d");
  cylinder(rightArmPivot, 0.06, 0.06, 0.12, [0.02, -0.55, 0.08], "#f5cba7", 8);

  const envelope = new THREE.Group();
  envelope.position.set(0.04, -0.58, 0.18);
  box(envelope, [0.28, 0.18, 0.03], [0, 0, 0], "#ffffff");
  box(envelope, [0.08, 0.08, 0.04], [0, 0, 0.02], "#c0392b");
  rightArmPivot.add(envelope);

  // 3D Konuşma Balonu
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.35, 0);
  bubbleGroup.visible = false;
  kemalGroup.add(bubbleGroup);
  let currentBubbleText = "";

  // =========================================================================
  // 9. ÇARPIŞMA ENGELLERİ (COLLIDERS & OBSTACLES)
  // =========================================================================
  // Ana Postane Binası Masif Engeli
  obstacles.push({
    minX: cx - bldgW / 2 - 0.2,
    maxX: cx + bldgW / 2 + 0.2,
    minZ: cz - bldgD / 2 - 0.2,
    maxZ: cz + bldgD / 2 + 0.2,
  });

  // Baskül ve Kantar Alanı Engeli
  obstacles.push({
    minX: cx + 3.2,
    maxX: cx + 4.5,
    minZ: cz + 3.6,
    maxZ: cz + 4.8,
  });

  // Telgraf Direği Engeli
  obstacles.push({
    minX: cx + 5.5,
    maxX: cx + 6.1,
    minZ: cz + 5.7,
    maxZ: cz + 6.3,
  });

  // =========================================================================
  // 10. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ
  // =========================================================================
  let speechTimer = 0;
  let waveTimer = 0;

  return {
    group,
    obstacles,
    update(
      dt: number,
      stateOrNight?: PostOfficeState | boolean,
      playerPos?: Vec2,
      isNightOrDusk?: boolean,
    ) {
      let state: PostOfficeState | undefined;
      let night = false;

      if (typeof stateOrNight === "boolean") {
        night = stateOrNight;
      } else if (stateOrNight) {
        state = stateOrNight;
        night = isNightOrDusk ?? false;
      }

      facadeLight.intensity = night ? 2.4 : 0.8;

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
          const newLabel = label(callout, "#ffffff", "#1a365d");
          newLabel.scale.set(5.5, 0.70, 1);
          newLabel.rotation.x = -0.15;
          bubbleGroup.add(newLabel);
        }
      } else {
        bubbleGroup.visible = false;
        currentBubbleText = "";
      }

      if (playerPos) {
        const dx = playerPos.x - KEMAL_POS.x;
        const dz = playerPos.z - KEMAL_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 24.0) {
          const targetAngle = Math.atan2(dx, dz);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetAngle, dt * 4.5);
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, targetAngle * 0.45, dt * 3.0);
        } else {
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.0);
          torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, 0, dt * 2.0);
        }

        if ((state && (state.honkGreetingTimer > 0 || state.dwellTimer > 0.2))) {
          waveTimer += dt * 7.5;
          rightArmPivot.rotation.x = -Math.PI * 0.72 + Math.sin(waveTimer) * 0.28;
          rightArmPivot.rotation.z = Math.cos(waveTimer) * 0.18;
        } else {
          rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, dt * 5.0);
          rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 5.0);
        }
      }
    },
    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - KEMAL_POS.x, playerPos.z - KEMAL_POS.z);
      return dist <= 26.0;
    },
    dispose() {
      facadeLight.dispose();
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
