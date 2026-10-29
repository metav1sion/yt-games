import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import type { Rect, Vec2 } from "../game/types";
import {
  HARBOUR_CENTER,
  HARBOUR_ENTRANCE,
  FISH_BOAT_POS,
  TRAWLER_1_POS,
  TRAWLER_2_POS,
  CHEF_TEMEL_POS,
  type FishingHarbourState,
} from "../game/fishing-harbour";

export type FishingHarbourView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: FishingHarbourState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

export function createFishingHarbourView(): FishingHarbourView {
  const group = new THREE.Group();
  group.name = "fishing-harbour";
  const obstacles: Rect[] = [];

  const hx = HARBOUR_CENTER.x; // -78.0
  const hz = HARBOUR_CENTER.z; // 88.0

  // =========================================================================
  // 1. BALIKÇI İSKELESİ & RIHTIM GÜVERTESİ (Harbour Boardwalk Pier)
  // =========================================================================
  const pierGroup = new THREE.Group();
  group.add(pierGroup);

  // Kıyıdan denize uzanan ana ahşap iskele platformu (Genişlik: 4.8m, Uzunluk: 13.0m, Z: 83.5 .. 96.5)
  // X: -80.4 .. -75.6
  box(pierGroup, [4.8, 0.16, 13.0], [hx, 0.14, hz], "#8d6e63"); // Weathered cedar planks
  // Taş bordür çerçevesi (İskelenin sahil bağlantısı)
  box(pierGroup, [5.2, 0.2, 0.4], [hx, 0.12, 83.5], "#bdc3c7");

  // İskele altındaki ahşap taşıyıcı kazıklar / dolfenler (Pilings)
  const pilingZs = [84.5, 87.5, 90.5, 93.5, 96.0];
  const pilingXs = [hx - 2.3, hx + 2.3];
  for (const pz of pilingZs) {
    for (const px of pilingXs) {
      cylinder(pierGroup, 0.18, 0.18, 1.4, [px, -0.3, pz], "#4e342e", 8);
    }
  }

  // Döküm çelik bağlama babaları (Mooring Bollards)
  const bollardZs = [85.5, 89.0, 92.5, 95.5];
  for (const bz of bollardZs) {
    // İskelenin iki yanına babalar
    for (const bx of [hx - 2.2, hx + 2.2]) {
      cylinder(pierGroup, 0.1, 0.12, 0.28, [bx, 0.34, bz], "#2c3e50", 8);
      cylinder(pierGroup, 0.15, 0.15, 0.05, [bx, 0.46, bz], "#34495e", 8);
    }
  }

  // İskele kenar güvenlik korkulukları (Tekne yanaşma boşlukları hariç)
  // Batı kenarı korkulukları (Trawler tarafı)
  box(pierGroup, [0.12, 0.75, 4.0], [hx - 2.35, 0.55, 85.5], "#5d4037");
  // Doğu kenarı korkulukları (Balık-ekmek teknesine iniş açık kalacak şekilde)
  box(pierGroup, [0.12, 0.75, 3.5], [hx + 2.35, 0.55, 85.2], "#5d4037");
  box(pierGroup, [0.12, 0.75, 2.5], [hx + 2.35, 0.55, 95.2], "#5d4037");
  // İskele ucu korkuluğu
  box(pierGroup, [4.8, 0.75, 0.12], [hx, 0.55, 96.4], "#5d4037");

  // İskele Giriş Karşılama Takı ("⚓ MARİNA BALIKÇI BARINAĞI")
  const entranceGroup = new THREE.Group();
  entranceGroup.position.set(HARBOUR_ENTRANCE.x, 0, HARBOUR_ENTRANCE.z);
  group.add(entranceGroup);

  // Ahşap giriş pilonları
  box(entranceGroup, [0.26, 3.2, 0.26], [-2.3, 1.6, 0], "#4e342e");
  box(entranceGroup, [0.26, 3.2, 0.26], [2.3, 1.6, 0], "#4e342e");
  box(entranceGroup, [5.1, 0.28, 0.3], [0, 3.2, 0], "#3e2723");
  box(entranceGroup, [4.8, 0.1, 0.34], [0, 3.4, 0], "#5d4037");

  // Giriş Tabelası
  const archSign = label("⚓ MARİNA BALIKÇI BARINAĞI", "#ffffff", "#1a365d");
  archSign.scale.set(4.4, 0.68, 1);
  archSign.position.set(0, 2.8, 0.18);
  entranceGroup.add(archSign);

  // Can Simitleri pilonlarda
  for (const sx of [-2.32, 2.32]) {
    const buoy = cylinder(entranceGroup, 0.26, 0.26, 0.08, [sx, 1.5, 0.15], "#ffffff", 12);
    buoy.rotation.x = Math.PI / 2;
    cylinder(entranceGroup, 0.14, 0.14, 0.09, [sx, 1.5, 0.15], "#e74c3c", 12);
  }

  // Giriş asılı denizci fenerleri
  const lanterns: THREE.Mesh[] = [];
  for (const lx of [-2.3, 2.3]) {
    cylinder(entranceGroup, 0.015, 0.015, 0.4, [lx, 2.9, 0], "#2c3e50", 4);
    const lamp = cylinder(entranceGroup, 0.14, 0.1, 0.22, [lx, 2.65, 0], "#ffdd66", 8);
    lanterns.push(lamp);
  }

  // İskele üstü dekoratif balık kasaları (Stacked Fish Crates)
  const crateGroup = new THREE.Group();
  crateGroup.position.set(hx - 1.4, 0.16, 88.5);
  pierGroup.add(crateGroup);

  box(crateGroup, [0.7, 0.3, 0.5], [0, 0.15, 0], "#bcaaa4");
  box(crateGroup, [0.7, 0.3, 0.5], [0.1, 0.45, 0.05], "#a1887f");
  box(crateGroup, [0.7, 0.3, 0.5], [-0.5, 0.15, 0.1], "#bcaaa4");
  // Kasaların içindeki buz ve balıklar
  box(crateGroup, [0.62, 0.04, 0.42], [0, 0.31, 0], "#e0f7fa"); // Buz
  cylinder(crateGroup, 0.04, 0.05, 0.35, [0.05, 0.34, 0], "#90a4ae", 6).rotation.z = 1.3;
  cylinder(crateGroup, 0.04, 0.05, 0.35, [-0.1, 0.34, 0.05], "#3498db", 6).rotation.z = -1.2;

  // Sarılı Urgan Halatları (Coiled Manila Rope)
  cylinder(pierGroup, 0.4, 0.4, 0.12, [hx - 1.5, 0.22, 93.5], "#d4ac0d", 12);

  // Eski Paslı Gemi Çapası (Rusty Anchor)
  const anchorGroup = new THREE.Group();
  anchorGroup.position.set(hx - 2.1, 0.2, 85.0);
  anchorGroup.rotation.y = 0.3;
  anchorGroup.rotation.z = 0.2;
  pierGroup.add(anchorGroup);
  cylinder(anchorGroup, 0.04, 0.04, 0.9, [0, 0.45, 0], "#5d4037", 6); // Şaft
  box(anchorGroup, [0.6, 0.06, 0.06], [0, 0.75, 0], "#5d4037"); // Çapraz kol
  cylinder(anchorGroup, 0.08, 0.08, 0.04, [0, 0.92, 0], "#3e2723", 8); // Üst halka
  // Alt kavisli tırnaklar
  cylinder(anchorGroup, 0.26, 0.26, 0.06, [0, 0.12, 0], "#5d4037", 8);

  // =========================================================================
  // 2. "TARİHİ MARMARA BALIKÇISI" BALIK-EKMEK TEKNESİ (Floating Grill Boat)
  // =========================================================================
  const fishBoatGroup = new THREE.Group();
  fishBoatGroup.position.set(FISH_BOAT_POS.x, 0.08, FISH_BOAT_POS.z);
  fishBoatGroup.rotation.y = Math.PI; // İskeleden görülecek şekilde güney/kuzey ekseni
  group.add(fishBoatGroup);

  // Tekne Omurgası & Alt Gövdesi (Ahşap & Su Hattı Bandı)
  // Alt koyu lacivert gövde
  box(fishBoatGroup, [2.2, 0.6, 6.2], [0, 0.2, 0], "#1a365d");
  // Üst bordo / kırmızı ahşap borda
  box(fishBoatGroup, [2.26, 0.45, 6.26], [0, 0.65, 0], "#c0392b");
  // Beyaz su hattı ve altın sarısı süs çıtası
  box(fishBoatGroup, [2.3, 0.08, 6.3], [0, 0.45, 0], "#ffffff");
  box(fishBoatGroup, [2.32, 0.06, 6.32], [0, 0.85, 0], "#f1c40f");

  // Sivri Baş Kasara (Pruva burnu)
  box(fishBoatGroup, [1.6, 0.75, 1.2], [0, 0.5, 3.4], "#c0392b");
  cylinder(fishBoatGroup, 0.04, 0.08, 1.4, [0, 1.1, 4.0], "#d4ac0d", 6).rotation.x = 0.6; // Pruva bastonu

  // Geniş Düz Kıç (Ayna)
  box(fishBoatGroup, [2.2, 0.75, 0.2], [0, 0.5, -3.15], "#1a365d");

  // Ahşap Güverte Döşemesi
  box(fishBoatGroup, [2.1, 0.08, 5.8], [0, 0.88, 0], "#d7ccc8");

  // Geleneksel Oymalı Ahşap Köşk / Tente Çatısı (Scalloped Ottoman Canopy)
  // 6 pirinç taşıyıcı sütun
  const boatColXs = [-0.98, 0.98];
  const boatColZs = [-2.4, 0, 2.4];
  for (const cx of boatColXs) {
    for (const cz of boatColZs) {
      cylinder(fishBoatGroup, 0.04, 0.04, 1.8, [cx, 1.8, cz], "#d4ac0d", 8);
    }
  }

  // Zümrüt Yeşili ve Altın Saçaklı Tente Çatısı
  box(fishBoatGroup, [2.3, 0.12, 5.4], [0, 2.7, 0], "#27ae60");
  box(fishBoatGroup, [2.1, 0.2, 5.0], [0, 2.82, 0], "#2ecc71");
  // Oymalı altın saçaklar
  box(fishBoatGroup, [2.36, 0.08, 5.46], [0, 2.64, 0], "#f1c40f");

  // Tekne Yan Ahşap Tabela Marquee: "🐟 TARİHİ MARMARA BALIK-EKMEKÇİSİ 🐟"
  const boatMarquee = label("🐟 TARİHİ MARMARA BALIK-EKMEKÇİSİ 🐟", "#ffeb3b", "#1a365d");
  boatMarquee.scale.set(4.6, 0.72, 1);
  boatMarquee.position.set(-1.18, 2.45, 0);
  boatMarquee.rotation.y = -Math.PI / 2;
  fishBoatGroup.add(boatMarquee);

  // İkinci Tabela (Deniz Tarafı)
  const boatMarqueeSea = label("🐟 TAZE BALIK-EKMEK · ŞİFA DERYASI 🍋", "#ffffff", "#c0392b");
  boatMarqueeSea.scale.set(4.6, 0.72, 1);
  boatMarqueeSea.position.set(1.18, 2.45, 0);
  boatMarqueeSea.rotation.y = Math.PI / 2;
  fishBoatGroup.add(boatMarqueeSea);

  // Asılı Sıcak Gece Fenerleri (Tekne tavanında)
  const boatLanterns: THREE.Mesh[] = [];
  for (const bcz of [-1.8, 0, 1.8]) {
    cylinder(fishBoatGroup, 0.015, 0.015, 0.35, [0, 2.5, bcz], "#2c3e50", 4);
    const bLamp = cylinder(fishBoatGroup, 0.12, 0.09, 0.2, [0, 2.3, bcz], "#ffdd66", 8);
    boatLanterns.push(bLamp);
  }

  // =========================================================================
  // BÜYÜK SAC IZGARA TEZGAHI & YEMEK DETAYLARI (Sizzling Flat-top Fish Grill)
  // =========================================================================
  const grillGroup = new THREE.Group();
  grillGroup.position.set(-0.35, 0.92, 0.1);
  fishBoatGroup.add(grillGroup);

  // Paslanmaz çelik ızgara masası
  box(grillGroup, [1.1, 0.78, 2.4], [0, 0.39, 0], "#7f8c8d");
  // Döküm siyah ızgara sacı
  box(grillGroup, [0.95, 0.06, 2.1], [0, 0.81, 0], "#2d3436");
  // Yağ siperliği (Chrome splashguard)
  box(grillGroup, [0.04, 0.22, 2.1], [0.46, 0.92, 0], "#bdc3c7");
  box(grillGroup, [0.95, 0.22, 0.04], [0, 0.92, -1.03], "#bdc3c7");
  box(grillGroup, [0.95, 0.22, 0.04], [0, 0.92, 1.03], "#bdc3c7");

  // Sac üzerinde kızaran taze palamut filetoları (Sizzling Mackerel Fillets)
  for (let fz = -0.7; fz <= 0.7; fz += 0.35) {
    // Çift fileto balık
    const fish1 = cylinder(grillGroup, 0.08, 0.09, 0.26, [-0.2, 0.85, fz], "#d35400", 6);
    fish1.rotation.x = Math.PI / 2;
    const fish2 = cylinder(grillGroup, 0.08, 0.09, 0.26, [0.05, 0.85, fz], "#e67e22", 6);
    fish2.rotation.x = Math.PI / 2;
  }

  // Izgarada ısınan çıtır somun ekmek yarımları (Crusty Bread Loaves)
  for (let bz = -0.6; bz <= 0.6; bz += 0.45) {
    const bread = box(grillGroup, [0.26, 0.12, 0.38], [0.32, 0.88, bz], "#d35400");
    box(bread, [0.24, 0.04, 0.36], [0, 0.06, 0], "#f5cd79"); // Ekmek içi
  }

  // Salata & Limon Malzeme Kaseleri (Tezgah kenarında)
  // Mor soğan kasesi
  cylinder(grillGroup, 0.16, 0.12, 0.14, [-0.28, 0.88, -0.85], "#ecf0f1", 8);
  cylinder(grillGroup, 0.15, 0.15, 0.04, [-0.28, 0.94, -0.85], "#8e44ad", 8); // Mor soğan
  // Kıvırcık yeşillik kasesi
  cylinder(grillGroup, 0.16, 0.12, 0.14, [-0.28, 0.88, 0.85], "#ecf0f1", 8);
  cylinder(grillGroup, 0.15, 0.15, 0.04, [-0.28, 0.94, 0.85], "#27ae60", 8); // Yeşillik
  // Parlak sarı limonlar
  cylinder(grillGroup, 0.06, 0.06, 0.1, [0.15, 0.88, -0.85], "#f1c40f", 6).rotation.z = 1.2;
  cylinder(grillGroup, 0.06, 0.06, 0.1, [0.15, 0.88, 0.85], "#f1c40f", 6).rotation.z = -1.2;

  // Izgara Baca Borusu & Yükselen Duman Efekti
  cylinder(grillGroup, 0.09, 0.09, 1.8, [0.35, 1.7, 0.7], "#2c3e50", 8);
  cylinder(grillGroup, 0.14, 0.09, 0.15, [0.35, 2.65, 0.7], "#34495e", 8);

  // Yükselen ızgara duman/buhar partikül simülasyon küreleri
  const steamPuffs: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; phase: number }[] = [];
  const steamMat = new THREE.MeshBasicMaterial({
    color: "#f5f6fa",
    transparent: true,
    opacity: 0.35,
  });
  for (let s = 0; s < 4; s++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + s * 0.04, 6, 6), steamMat);
    puff.position.set(0.35, 2.75 + s * 0.28, 0.7);
    grillGroup.add(puff);
    steamPuffs.push({
      mesh: puff,
      basePos: new THREE.Vector3(0.35, 2.75, 0.7),
      speed: 0.6 + s * 0.15,
      phase: s * 1.5,
    });
  }

  // =========================================================================
  // 3. AŞÇI NPC — "BALIKÇI TEMEL REİS" (Chef NPC at the Grill)
  // =========================================================================
  const temelGroup = new THREE.Group();
  temelGroup.position.set(-0.75, 0.92, 0.0);
  fishBoatGroup.add(temelGroup);

  // Bacaklar & Sarı Çizmeler
  box(temelGroup, [0.16, 0.48, 0.16], [0, 0.24, -0.12], "#2c3e50"); // Koyu lacivert pantolon
  box(temelGroup, [0.16, 0.48, 0.16], [0, 0.24, 0.12], "#2c3e50");
  box(temelGroup, [0.18, 0.22, 0.18], [0, 0.11, -0.12], "#f1c40f"); // Sarı balıkçı çizmesi
  box(temelGroup, [0.18, 0.22, 0.18], [0, 0.11, 0.12], "#f1c40f");

  // Gövde: Lacivert-Beyaz Çizgili Denizci Kazağı & Beyaz Aşçı Önlüğü
  box(temelGroup, [0.42, 0.52, 0.44], [0, 0.72, 0], "#1a365d");
  // Beyaz denizci çizgileri
  box(temelGroup, [0.43, 0.06, 0.45], [0, 0.62, 0], "#ffffff");
  box(temelGroup, [0.43, 0.06, 0.45], [0, 0.74, 0], "#ffffff");
  box(temelGroup, [0.43, 0.06, 0.45], [0, 0.86, 0], "#ffffff");
  // Beyaz aşçı bel önlüğü
  box(temelGroup, [0.44, 0.42, 0.46], [0.03, 0.58, 0], "#ffffff");

  // Kafa Grubu (Head Tracking için ayrılmış grup)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.08, 0);
  temelGroup.add(headGroup);

  // Baş, Sakal & Güleç Yüz
  box(headGroup, [0.26, 0.26, 0.26], [0, 0, 0], "#f5cd79");
  box(headGroup, [0.28, 0.14, 0.16], [0.03, -0.06, 0], "#ffffff"); // Beyaz balıkçı sakalı
  // Denizci Kaptanı Kasketi (Navy Captain's Cap)
  cylinder(headGroup, 0.2, 0.2, 0.08, [0, 0.16, 0], "#1a365d", 10);
  box(headGroup, [0.16, 0.03, 0.24], [0.12, 0.14, 0], "#2c3e50"); // Siperlik
  // Altın Çapa Brövesi
  box(headGroup, [0.02, 0.06, 0.06], [0.08, 0.18, 0], "#f1c40f");

  // Sağ Kol (Izgara Spatulası & Çevirme Hareketi)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 0.88, 0.18);
  temelGroup.add(rightArm);
  box(rightArm, [0.1, 0.38, 0.1], [0, -0.16, 0], "#1a365d");
  // Paslanmaz çelik ızgara spatulası
  cylinder(rightArm, 0.02, 0.02, 0.28, [0.14, -0.32, 0], "#7f8c8d", 6).rotation.z = 1.2;
  box(rightArm, [0.12, 0.02, 0.1], [0.26, -0.36, 0], "#bdc3c7"); // Spatula ağzı

  // Sol Kol (Selamlama & Destek Kolu)
  const leftArm = new THREE.Group();
  leftArm.position.set(0.24, 0.88, -0.18);
  temelGroup.add(leftArm);
  box(leftArm, [0.1, 0.38, 0.1], [0, -0.16, 0], "#1a365d");

  // Konuşma Balonu Çapası
  let speechBubble: THREE.Sprite | null = null;
  const bubbleAnchor = new THREE.Group();
  bubbleAnchor.position.set(0, 1.6, 0);
  temelGroup.add(bubbleAnchor);

  // =========================================================================
  // 4. BALIKÇI BARINAĞI MOTORLARI / GIRGIR TEKNELERİ ("Karadenizli" & "Albatros")
  // =========================================================================
  const trawlers: { group: THREE.Group; basePos: THREE.Vector3; phase: number }[] = [];

  function createFishingTrawler(
    x: number,
    z: number,
    rotY: number,
    hullColor: string,
    name: string,
    phase: number,
    hasNetDrum = true,
  ) {
    const tGroup = new THREE.Group();
    tGroup.position.set(x, 0.08, z);
    tGroup.rotation.y = rotY;
    group.add(tGroup);

    // Ana Tekne Gövdesi (Ahşap balıkçı teknesi, 5.2m x 2.2m x 1.1m)
    box(tGroup, [2.0, 0.55, 5.2], [0, 0.24, 0], "#1a252f"); // Su altı koyu omurga
    box(tGroup, [2.1, 0.5, 5.3], [0, 0.65, 0], hullColor); // Gövde rengi
    box(tGroup, [2.14, 0.08, 5.34], [0, 0.88, 0], "#ffffff"); // Beyaz borda süsü

    // Sivri Baş Kasara
    box(tGroup, [1.5, 0.75, 1.2], [0, 0.55, 2.9], hullColor);

    // Düz Kıç Ayna & İsimlik
    box(tGroup, [2.0, 0.7, 0.16], [0, 0.55, -2.65], "#1a252f");
    const nameLabel = label(name, "#ffffff", hullColor);
    nameLabel.scale.set(2.8, 0.65, 1);
    nameLabel.position.set(0, 0.72, -2.76);
    tGroup.add(nameLabel);

    // Ahşap Güverte
    box(tGroup, [1.9, 0.08, 4.8], [0, 0.88, 0], "#bcaaa4");

    // Kaptan Köşkü / Dümen Evi (Wheelhouse)
    box(tGroup, [1.4, 1.2, 1.5], [0, 1.5, -0.6], "#ffffff");
    box(tGroup, [1.46, 0.1, 1.56], [0, 2.15, -0.6], hullColor); // Köşk tavanı
    // Camlar
    box(tGroup, [1.2, 0.4, 0.04], [0, 1.6, 0.16], "#3498db"); // Ön cam
    box(tGroup, [0.04, 0.35, 0.9], [-0.71, 1.6, -0.6], "#3498db"); // Yan camlar
    box(tGroup, [0.04, 0.35, 0.9], [0.71, 1.6, -0.6], "#3498db");

    // Çatı Seyir Feneri Direği & Egzoz Borusu
    cylinder(tGroup, 0.03, 0.03, 1.1, [0, 2.7, -0.6], "#bdc3c7", 6);
    cylinder(tGroup, 0.08, 0.08, 0.1, [0, 3.25, -0.6], "#f1c40f", 8); // Seyir feneri
    cylinder(tGroup, 0.06, 0.06, 1.4, [0.45, 2.5, -1.1], "#2c3e50", 6); // Egzoz bacası

    // Balık Ağı Tamburu & Makara Düzeneği (Gırgır tamburu)
    if (hasNetDrum) {
      const winch = cylinder(tGroup, 0.45, 0.45, 1.4, [0, 1.35, 1.2], "#e67e22", 12);
      winch.rotation.z = Math.PI / 2;
      // Sarılı yeşil balık ağı
      const netMesh = cylinder(tGroup, 0.42, 0.42, 1.1, [0, 1.35, 1.2], "#27ae60", 12);
      netMesh.rotation.z = Math.PI / 2;
      // Tambur taşıyıcı A-Frame ayakları
      box(tGroup, [0.1, 0.9, 0.1], [-0.75, 1.35, 1.2], "#2c3e50");
      box(tGroup, [0.1, 0.9, 0.1], [0.75, 1.35, 1.2], "#2c3e50");
    }

    // Can Simidi
    const tBuoy = cylinder(tGroup, 0.22, 0.22, 0.06, [0.72, 1.5, -0.6], "#ffffff", 10);
    tBuoy.rotation.z = Math.PI / 2;
    cylinder(tGroup, 0.12, 0.12, 0.07, [0.72, 1.5, -0.6], "#e74c3c", 10).rotation.z = Math.PI / 2;

    trawlers.push({
      group: tGroup,
      basePos: new THREE.Vector3(x, 0.08, z),
      phase,
    });
  }

  // Trawler 1: Rize Tipi Ağ Motoru ("⚓ KARADENİZLİ · RİZE")
  createFishingTrawler(
    TRAWLER_1_POS.x, // -83.5
    TRAWLER_1_POS.z, // 92.5
    -0.15,
    "#1e824c", // Koyu Zümrüt Yeşili
    "⚓ KARADENİZLİ · RİZE",
    0.0,
    true,
  );

  // Trawler 2: İstanbul Boğaz Tipi Balıkçı Teknesi ("⚓ ALBATROS · İSTANBUL")
  createFishingTrawler(
    TRAWLER_2_POS.x, // -85.0
    TRAWLER_2_POS.z, // 87.5
    0.2,
    "#c0392b", // Bordo / Kırmızı
    "⚓ ALBATROS · İSTANBUL",
    2.1,
    false,
  );

  // =========================================================================
  // 5. TEKNE ETRAFINDA DÖNEN MARTI SÜRÜSÜ (Hovering Seagulls Flock)
  // =========================================================================
  const seagulls: { group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh; phase: number; radius: number; speed: number; height: number }[] = [];
  const gullsCount = 3;
  for (let g = 0; g < gullsCount; g++) {
    const sGroup = new THREE.Group();
    group.add(sGroup);

    // Martı Gövdesi (Beyaz & Gri)
    box(sGroup, [0.12, 0.1, 0.34], [0, 0, 0], "#ffffff");
    box(sGroup, [0.08, 0.08, 0.14], [0, 0.02, 0.22], "#ffffff"); // Kafa
    cylinder(sGroup, 0.015, 0.005, 0.1, [0, 0.01, 0.32], "#f1c40f", 4).rotation.x = Math.PI / 2; // Sarı gaga

    // Sol Kanat
    const leftWing = box(sGroup, [0.38, 0.02, 0.12], [-0.22, 0.04, 0], "#bdc3c7");
    // Sağ Kanat
    const rightWing = box(sGroup, [0.38, 0.02, 0.12], [0.22, 0.04, 0], "#bdc3c7");

    seagulls.push({
      group: sGroup,
      leftWing,
      rightWing,
      phase: g * ((Math.PI * 2) / gullsCount),
      radius: 3.2 + g * 0.8,
      speed: 1.1 + g * 0.2,
      height: 4.0 + g * 0.5,
    });
  }

  // =========================================================================
  // 6. ÇARPIŞMA ENGELLERİ (Fair & Accurate Obstacles)
  // =========================================================================
  // İskelenin iki yanındaki tekne bordaları ve korkuluk engelleri
  obstacles.push(
    // Balık-ekmek teknesi ve ızgara alanı
    {
      minX: FISH_BOAT_POS.x - 1.2,
      maxX: FISH_BOAT_POS.x + 1.2,
      minZ: FISH_BOAT_POS.z - 3.2,
      maxZ: FISH_BOAT_POS.z + 3.2,
    },
    // Batıdaki Trawler 1
    {
      minX: TRAWLER_1_POS.x - 1.2,
      maxX: TRAWLER_1_POS.x + 1.2,
      minZ: TRAWLER_1_POS.z - 2.8,
      maxZ: TRAWLER_1_POS.z + 2.8,
    },
    // Batıdaki Trawler 2
    {
      minX: TRAWLER_2_POS.x - 1.2,
      maxX: TRAWLER_2_POS.x + 1.2,
      minZ: TRAWLER_2_POS.z - 2.8,
      maxZ: TRAWLER_2_POS.z + 2.8,
    },
    // İskelenin batı korkuluğu ve sandık bölgesi
    {
      minX: hx - 2.4,
      maxX: hx - 1.5,
      minZ: 84.5,
      maxZ: 89.5,
    },
  );

  let waveTime = 0;
  let waveWaving = 0;

  return {
    group,
    obstacles,
    onPlayerHonk(playerPos: Vec2) {
      const d = Math.hypot(playerPos.x - HARBOUR_ENTRANCE.x, playerPos.z - HARBOUR_ENTRANCE.z);
      if (d <= 25.0) {
        waveWaving = 3.5;
        return true;
      }
      return false;
    },
    update(dt: number, state: FishingHarbourState, playerPos?: Vec2, isNightOrDusk = false) {
      waveTime += dt;
      if (waveWaving > 0) waveWaving -= dt;

      // 1. "Tarihi Marmara Balıkçısı" Dalga Salınımı (Heave, Roll, Pitch)
      const boatWave = Math.sin(waveTime * 1.5);
      const boatCross = Math.cos(waveTime * 1.1);
      fishBoatGroup.position.y = 0.08 + boatWave * 0.05;
      fishBoatGroup.rotation.z = boatWave * 0.04;
      fishBoatGroup.rotation.x = boatCross * 0.03;

      // 2. Trawler Motorlarının Bağımsız Dalga Salınımları
      for (const t of trawlers) {
        const tw = Math.sin(waveTime * 1.4 + t.phase);
        const tc = Math.cos(waveTime * 1.0 + t.phase);
        t.group.position.y = t.basePos.y + tw * 0.045;
        t.group.rotation.z = tw * 0.035;
        t.group.rotation.x = tc * 0.025;
      }

      // 3. Buhar / Izgara Duman Partikülleri Yükselişi
      for (const s of steamPuffs) {
        const cycle = ((waveTime * s.speed + s.phase) % 1.0);
        s.mesh.position.y = s.basePos.y + cycle * 0.9;
        const sc = 1.0 + cycle * 1.2;
        s.mesh.scale.set(sc, sc, sc);
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.35 * (1.0 - cycle));
      }

      // 4. Aşçı Temel Reis Izgara Spatulası & Selamlama Animasyonu
      if (state.honkGreetingTimer > 0 || waveWaving > 0) {
        // Coşkulu el sallama
        leftArm.rotation.x = -Math.PI / 2 + Math.sin(waveTime * 8.0) * 0.45;
        leftArm.rotation.z = -0.3 + Math.cos(waveTime * 6.0) * 0.25;
      } else {
        leftArm.rotation.x = 0;
        leftArm.rotation.z = 0;
      }
      // Sağ kolla sürekli balık çevirme / ızgara kontrolü
      rightArm.rotation.x = Math.sin(waveTime * 3.5) * 0.18;
      rightArm.rotation.z = 0.1 + Math.cos(waveTime * 2.5) * 0.12;

      // 5. Aşçı Baş Takibi (Head Tracking towards Player)
      if (playerPos) {
        const dx = playerPos.x - CHEF_TEMEL_POS.x;
        const dz = playerPos.z - CHEF_TEMEL_POS.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= 18.0) {
          const targetAngle = Math.atan2(dx, dz) - fishBoatGroup.rotation.y;
          headGroup.rotation.y = THREE.MathUtils.clamp(targetAngle, -0.85, 0.85);
        } else {
          headGroup.rotation.y = 0;
        }
      }

      // 6. Martı Sürüsü Uçuş Yörüngesi & Kanat Çırpışı
      for (const sg of seagulls) {
        const angle = waveTime * sg.speed + sg.phase;
        const gx = FISH_BOAT_POS.x + Math.cos(angle) * sg.radius;
        const gz = FISH_BOAT_POS.z + Math.sin(angle) * sg.radius;
        const gy = sg.height + Math.sin(waveTime * 2.0 + sg.phase) * 0.35;
        sg.group.position.set(gx, gy, gz);
        sg.group.rotation.y = -angle + Math.PI / 2; // Yöne dönük
        sg.group.rotation.z = -0.15; // Dönüşe yatma (banking)

        // Kanat çırpış fiziği
        const flap = Math.sin(waveTime * 7.5 + sg.phase) * 0.4;
        sg.leftWing.rotation.z = flap;
        sg.rightWing.rotation.z = -flap;
      }

      // 7. Konuşma Balonu (Speech Bubble)
      if (state.lastHonkCallout) {
        if (!speechBubble || speechBubble.name !== state.lastHonkCallout) {
          if (speechBubble) bubbleAnchor.remove(speechBubble);
          speechBubble = label(state.lastHonkCallout, "#ffffff", "#1a365d");
          speechBubble.scale.set(4.2, 0.85, 1);
          speechBubble.name = state.lastHonkCallout;
          bubbleAnchor.add(speechBubble);
        }
        speechBubble.visible = true;
      } else if (speechBubble) {
        speechBubble.visible = false;
      }

      // 8. Gece Fenerleri Emissive Aydınlatması
      const emissiveColor = isNightOrDusk ? new THREE.Color("#ffdd66") : new THREE.Color("#000000");
      for (const lamp of [...lanterns, ...boatLanterns]) {
        const mat = lamp.material as THREE.MeshStandardMaterial;
        mat.emissive = emissiveColor;
        mat.emissiveIntensity = isNightOrDusk ? 1.4 : 0.0;
      }
    },
    dispose() {
      steamMat.dispose();
      group.clear();
    },
  };
}
