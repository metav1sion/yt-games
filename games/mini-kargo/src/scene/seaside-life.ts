import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import type { Rect } from "../game/types";
import { TEA_CAFE_CENTER, FISHER_1_POS, FISHER_2_POS } from "../game/seaside-life";

export type SeasideLifeView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    cafeSpeech: string | null,
    fisherSpeech: string | null,
    isNightOrDusk?: boolean,
  ): void;
};

export function createSeasideLifeView(): SeasideLifeView {
  const group = new THREE.Group();
  group.name = "seaside-life";

  // =========================================================================
  // 1. SAHİL ÇAY BAHÇESİ (Yalı Çay Bahçesi - X: -60, Z: 83.2)
  // =========================================================================
  const cafeGroup = new THREE.Group();
  cafeGroup.position.set(TEA_CAFE_CENTER.x, 0, TEA_CAFE_CENTER.z);
  group.add(cafeGroup);

  // Ahşap Deck Platform (5.2m x 3.6m x 0.12m)
  box(cafeGroup, [5.2, 0.12, 3.6], [0, 0.06, 0], "#a07855");

  // Pergola Direkleri (4 adet ahşap dikme)
  const pergolaH = 2.4;
  const colXs = [-2.4, 2.4];
  const colZs = [-1.6, 1.6];
  for (const cx of colXs) {
    for (const cz of colZs) {
      box(cafeGroup, [0.12, pergolaH, 0.12], [cx, pergolaH / 2, cz], "#6b4a2f");
    }
  }
  // Pergola Çatı Kirişleri
  box(cafeGroup, [5.4, 0.08, 0.12], [0, pergolaH, -1.6], "#583c24");
  box(cafeGroup, [5.4, 0.08, 0.12], [0, pergolaH, 1.6], "#583c24");
  for (let bx = -2.2; bx <= 2.2; bx += 0.88) {
    box(cafeGroup, [0.08, 0.08, 3.4], [bx, pergolaH + 0.04, 0], "#583c24");
  }

  // Kırmızı-Beyaz Çizgili Kumaş Tente
  const awningMat1 = new THREE.MeshStandardMaterial({ color: "#e74c3c", roughness: 0.7 });
  const awningMat2 = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7 });
  for (let ax = -2.3; ax < 2.3; ax += 0.38) {
    const isRed = Math.floor((ax + 2.3) / 0.38) % 2 === 0;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.03, 3.2),
      isRed ? awningMat1 : awningMat2,
    );
    stripe.position.set(ax + 0.18, pergolaH + 0.07, 0);
    cafeGroup.add(stripe);
  }

  // Tabela: "☕ YALI ÇAY BAHÇESİ"
  const signMesh = label("☕ YALI ÇAY BAHÇESİ", "#f39c12", "#2c3e50");
  signMesh.scale.set(3.8, 0.95, 1);
  signMesh.position.set(0, pergolaH + 0.45, -1.6);
  cafeGroup.add(signMesh);

  // Nostaljik A-Frame Menü Tahtası
  const menuGroup = new THREE.Group();
  menuGroup.position.set(2.4, 0, -1.2);
  menuGroup.rotation.y = -0.5;
  cafeGroup.add(menuGroup);
  box(menuGroup, [0.65, 0.85, 0.04], [0, 0.45, 0], "#1e272e");
  box(menuGroup, [0.06, 0.9, 0.06], [-0.3, 0.45, 0], "#d35400");
  box(menuGroup, [0.06, 0.9, 0.06], [0.3, 0.45, 0], "#d35400");
  const menuText = label("☕ Taze Çay 5₺ · Çıtır Simit 5₺", "#ffffff", "#1e272e");
  menuText.scale.set(2.8, 0.7, 1);
  menuText.position.set(0, 0.48, 0.06);
  menuGroup.add(menuText);

  // Masalar & Hasır Tabureler
  const tablePositions = [
    { x: -1.4, z: -0.6 },
    { x: 0.0, z: 0.4 },
    { x: 1.4, z: -0.6 },
  ];

  for (const tPos of tablePositions) {
    // Ahşap Masa
    cylinder(cafeGroup, 0.45, 0.45, 0.04, [tPos.x, 0.68, tPos.z], "#8e44ad"); // Mor/Ahşap örtü
    cylinder(cafeGroup, 0.04, 0.04, 0.65, [tPos.x, 0.33, tPos.z], "#2c3e50", 8); // Metal ayak
    cylinder(cafeGroup, 0.25, 0.25, 0.02, [tPos.x, 0.02, tPos.z], "#2c3e50", 8); // Taban halkası

    // İnce Belli Çay Bardakları (Masa üstünde 2 adet)
    for (const bOffset of [-0.15, 0.15]) {
      // Minik beyaz porselen tabak
      cylinder(cafeGroup, 0.06, 0.06, 0.01, [tPos.x + bOffset, 0.71, tPos.z], "#ffffff", 8);
      // İnce belli kırmızı çay bardağı
      cylinder(cafeGroup, 0.035, 0.028, 0.07, [tPos.x + bOffset, 0.75, tPos.z], "#e74c3c", 8);
      // Minik sarı çay kaşığı
      box(cafeGroup, [0.06, 0.005, 0.01], [tPos.x + bOffset + 0.04, 0.73, tPos.z], "#f1c40f");
    }

    // Hasır Tabureler (Masa etrafında 2'şer adet)
    for (const sOffset of [-0.65, 0.65]) {
      cylinder(cafeGroup, 0.18, 0.18, 0.4, [tPos.x, 0.2, tPos.z + sOffset * 0.7], "#f39c12", 8); // Hasır örgü
      box(cafeGroup, [0.04, 0.38, 0.04], [tPos.x - 0.1, 0.19, tPos.z + sOffset * 0.7], "#7f8c8d");
      box(cafeGroup, [0.04, 0.38, 0.04], [tPos.x + 0.1, 0.19, tPos.z + sOffset * 0.7], "#7f8c8d");
    }
  }

  // Bakır Semaver Tezgahı (X: -1.8, Z: 1.1)
  const counterGroup = new THREE.Group();
  counterGroup.position.set(-1.8, 0, 1.1);
  cafeGroup.add(counterGroup);
  box(counterGroup, [1.1, 0.85, 0.7], [0, 0.43, 0], "#583c24");
  box(counterGroup, [1.16, 0.04, 0.76], [0, 0.86, 0], "#ffffff"); // Mermer tezgah üstü

  // Parlak Bakır Semaver Gövdesi
  cylinder(counterGroup, 0.16, 0.16, 0.42, [0, 1.08, 0], "#d35400", 12);
  cylinder(counterGroup, 0.08, 0.14, 0.12, [0, 1.34, 0], "#e67e22", 12); // Semaver üst kapak
  cylinder(counterGroup, 0.09, 0.09, 0.18, [0, 1.48, 0], "#bdc3c7", 10); // Çaydanlık
  cylinder(counterGroup, 0.02, 0.02, 0.15, [0, 1.62, 0], "#2c3e50", 6); // Duman bacası
  cylinder(counterGroup, 0.015, 0.015, 0.08, [0, 1.02, 0.18], "#f1c40f", 6); // Musluk

  // Çaycı Rıza Dayı NPC (X: -0.8, Z: 1.1)
  const rizaGroup = new THREE.Group();
  rizaGroup.position.set(-0.8, 0, 1.1);
  cafeGroup.add(rizaGroup);
  // Bacaklar (Gri kumaş pantolon)
  box(rizaGroup, [0.15, 0.48, 0.15], [-0.1, 0.24, 0], "#7f8c8d");
  box(rizaGroup, [0.15, 0.48, 0.15], [0.1, 0.24, 0], "#7f8c8d");
  // Gövde (Beyaz gömlek + lacivert yelek + beyaz bel önlüğü)
  box(rizaGroup, [0.4, 0.5, 0.24], [0, 0.72, 0], "#ecf0f1");
  box(rizaGroup, [0.42, 0.44, 0.25], [0, 0.74, 0], "#2c3e50"); // Yelek
  box(rizaGroup, [0.38, 0.38, 0.26], [0, 0.58, 0.02], "#ffffff"); // Beyaz önlük
  // Kafa ve Kasket
  box(rizaGroup, [0.22, 0.22, 0.22], [0, 1.08, 0], "#f5cd79");
  cylinder(rizaGroup, 0.16, 0.16, 0.06, [0, 1.2, 0], "#34495e", 10); // Kasket
  box(rizaGroup, [0.18, 0.02, 0.12], [0, 1.18, 0.14], "#2c3e50"); // Siperlik

  // Rıza Dayı'nın Askılı Çay Tepsisi (Hareketli Kol)
  const rizaArm = new THREE.Group();
  rizaArm.position.set(0.24, 0.88, 0);
  rizaGroup.add(rizaArm);
  box(rizaArm, [0.1, 0.38, 0.1], [0, -0.16, 0.1], "#ecf0f1");
  // Askılı Çelik Çay Tepsisi
  cylinder(rizaArm, 0.22, 0.22, 0.02, [0, -0.36, 0.24], "#bdc3c7", 12);
  cylinder(rizaArm, 0.015, 0.015, 0.26, [0, -0.23, 0.24], "#f1c40f", 6); // Askı sapı
  // Tepsi üstünde bardak
  cylinder(rizaArm, 0.03, 0.025, 0.06, [0, -0.32, 0.24], "#e74c3c", 8);

  // Konuşma Balonu
  let cafeBubble: THREE.Sprite | null = null;
  const cafeBubbleAnchor = new THREE.Group();
  cafeBubbleAnchor.position.set(0, 1.6, 0);
  rizaGroup.add(cafeBubbleAnchor);

  // =========================================================================
  // 2. İSKELE BALIKÇILARI (Salih Reis & Kemal Ağabey)
  // =========================================================================
  // Balıkçı 1: Salih Reis (X: -48.5, Z: 96.0 - İskelenin ucu)
  const salihGroup = new THREE.Group();
  salihGroup.position.set(FISHER_1_POS.x, 0.14, FISHER_1_POS.z);
  salihGroup.rotation.y = Math.PI / 2; // Denize dönük
  group.add(salihGroup);

  // Bacaklar & Gövde (Sarı balıkçı yağmurluğu)
  box(salihGroup, [0.16, 0.5, 0.16], [-0.11, 0.25, 0], "#27ae60"); // Çizme/Pantolon
  box(salihGroup, [0.16, 0.5, 0.16], [0.11, 0.25, 0], "#27ae60");
  box(salihGroup, [0.42, 0.54, 0.26], [0, 0.77, 0], "#f1c40f"); // Sarı yağmurluk
  box(salihGroup, [0.24, 0.24, 0.24], [0, 1.15, 0], "#eccc68");
  cylinder(salihGroup, 0.18, 0.18, 0.08, [0, 1.28, 0], "#f39c12", 10); // Balıkçı kasketi
  box(salihGroup, [0.22, 0.02, 0.14], [0, 1.25, 0.16], "#d35400"); // Siperlik

  // Olta Kamışı (Salih Reis'in kolları ve 2.8m esnek karbon kamış)
  const rodGroup = new THREE.Group();
  rodGroup.position.set(0, 0.95, 0.2);
  salihGroup.add(rodGroup);
  // Kollar
  box(rodGroup, [0.1, 0.36, 0.1], [-0.18, 0, 0.1], "#f1c40f");
  box(rodGroup, [0.1, 0.36, 0.1], [0.18, 0, 0.1], "#f1c40f");
  // Kamış Gövdesi (Denize doğru eğimli)
  cylinder(rodGroup, 0.02, 0.04, 2.8, [0, 0.6, 1.2], "#2c3e50", 8);
  rodGroup.rotation.x = 0.5; // Kamışı denize indirmiş

  // Misina ve Şamandıra (Su yüzeyinde yüzen mantar)
  const floatMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: "#e74c3c" }),
  );
  floatMesh.position.set(0, -0.6, 2.6);
  rodGroup.add(floatMesh);

  // Yanında Galvaniz Balık Kovası
  const bucketGroup = new THREE.Group();
  bucketGroup.position.set(0.45, 0, 0.1);
  salihGroup.add(bucketGroup);
  cylinder(bucketGroup, 0.16, 0.13, 0.32, [0, 0.16, 0], "#bdc3c7", 10);
  cylinder(bucketGroup, 0.15, 0.15, 0.04, [0, 0.28, 0], "#3498db", 10); // İçindeki deniz suyu

  // Salih Reis Konuşma Balonu
  let salihBubble: THREE.Sprite | null = null;
  const salihBubbleAnchor = new THREE.Group();
  salihBubbleAnchor.position.set(0, 1.6, 0);
  salihGroup.add(salihBubbleAnchor);

  // Balıkçı 2: Kemal Ağabey (X: -51.5, Z: 92.0 - İskelenin solunda oturan)
  const kemalGroup = new THREE.Group();
  kemalGroup.position.set(FISHER_2_POS.x, 0.14, FISHER_2_POS.z);
  kemalGroup.rotation.y = -Math.PI / 2; // Batıya denize dönük
  group.add(kemalGroup);

  // Katlanır Kamp Taburesi
  box(kemalGroup, [0.38, 0.06, 0.38], [0, 0.32, 0], "#27ae60"); // Yeşil bez oturak
  box(kemalGroup, [0.04, 0.35, 0.04], [-0.15, 0.16, -0.15], "#7f8c8d");
  box(kemalGroup, [0.04, 0.35, 0.04], [0.15, 0.16, 0.15], "#7f8c8d");

  // Oturan Vücut
  box(kemalGroup, [0.16, 0.32, 0.32], [-0.1, 0.2, 0.15], "#2980b9"); // Oturan bacaklar
  box(kemalGroup, [0.16, 0.32, 0.32], [0.1, 0.2, 0.15], "#2980b9");
  box(kemalGroup, [0.38, 0.46, 0.24], [0, 0.6, 0], "#e67e22"); // Turuncu kazak
  box(kemalGroup, [0.22, 0.22, 0.22], [0, 0.94, 0], "#f5cd79");
  cylinder(kemalGroup, 0.15, 0.15, 0.08, [0, 1.06, 0], "#34495e", 10); // Şapka

  // Oturarak tuttuğu olta kamışı
  cylinder(kemalGroup, 0.018, 0.035, 2.2, [0.15, 0.7, 0.9], "#7f8c8d", 8);

  // =========================================================================
  // 3. DALGALARLA SALLANAN AHŞAP SANDALLAR ("Meltem" & "Poyraz")
  // =========================================================================
  const boats: { group: THREE.Group; basePos: THREE.Vector3; phase: number }[] = [];

  function createWoodenRowboat(x: number, z: number, rotY: number, name: string, phase: number) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0.08, z);
    bGroup.rotation.y = rotY;
    group.add(bGroup);

    // Tekne Omurgası & Tabanı (Ahşap ceviz)
    box(bGroup, [1.1, 0.15, 2.8], [0, 0.1, 0], "#8b5a2b");
    // Yan Bordalar
    box(bGroup, [0.08, 0.45, 2.8], [-0.55, 0.35, 0], "#a07855");
    box(bGroup, [0.08, 0.45, 2.8], [0.55, 0.35, 0], "#a07855");
    // Sivri Burun (Pruva)
    box(bGroup, [0.7, 0.45, 0.4], [0, 0.35, 1.45], "#8b5a2b");
    // Düz Kıç (Pupa aynası)
    box(bGroup, [1.1, 0.45, 0.08], [0, 0.35, -1.4], "#8b5a2b");

    // Oturak Tahtaları (2 adet)
    box(bGroup, [1.05, 0.05, 0.3], [0, 0.32, -0.4], "#583c24");
    box(bGroup, [1.05, 0.05, 0.3], [0, 0.32, 0.5], "#583c24");

    // Ahşap Kürekler (Çapraz duran)
    cylinder(bGroup, 0.03, 0.03, 1.8, [-0.4, 0.42, 0.2], "#deb887", 6);
    cylinder(bGroup, 0.03, 0.03, 1.8, [0.4, 0.42, 0.2], "#deb887", 6);

    // Tekne İsim Yazısı
    const boatLabel = label(name, "#ffffff", "#8b5a2b");
    boatLabel.scale.set(2.4, 0.65, 1);
    boatLabel.position.set(0, 0.65, 0);
    bGroup.add(boatLabel);

    // İskele kazığına bağlama halatı
    box(bGroup, [0.03, 0.03, 1.1], [0.35, 0.35, 1.4], "#d4ac0d");

    boats.push({
      group: bGroup,
      basePos: new THREE.Vector3(x, 0.08, z),
      phase,
    });
  }

  createWoodenRowboat(-46.4, 93.0, 0.15, "⛵ MELTEM", 0.0);
  createWoodenRowboat(-53.6, 94.2, -0.2, "⛵ POYRAZ", 1.8);

  // Engeller: Çay bahçesinin arka semaver tezgahı (Yayaların Z=83 ve Z=85.5 rotalarını serbest bırakır)
  const obstacles: Rect[] = [
    {
      minX: TEA_CAFE_CENTER.x - 2.4,
      maxX: TEA_CAFE_CENTER.x - 1.2,
      minZ: TEA_CAFE_CENTER.z + 0.8,
      maxZ: TEA_CAFE_CENTER.z + 1.4,
    },
  ];

  let simTime = 0;

  return {
    group,
    obstacles,
    update(dt: number, cafeSpeech: string | null, fisherSpeech: string | null, isNightOrDusk = false) {
      simTime += dt;

      // 1. Çaycı Rıza Dayı tepsi salınımı
      rizaArm.rotation.z = Math.sin(simTime * 2.5) * 0.15;
      rizaArm.position.y = 0.88 + Math.sin(simTime * 5.0) * 0.02;

      // 2. Balıkçı Salih Reis olta kamışı ritmik hareketi
      rodGroup.rotation.x = 0.45 + Math.sin(simTime * 1.5) * 0.12;

      // 3. Sandalların dalga salınımı (Heave, Roll, Pitch)
      for (const b of boats) {
        const wave = Math.sin(simTime * 1.6 + b.phase);
        const waveCross = Math.cos(simTime * 1.2 + b.phase);
        b.group.position.y = b.basePos.y + wave * 0.05;
        b.group.rotation.z = wave * 0.06;
        b.group.rotation.x = waveCross * 0.04;
      }

      // 4. Konuşma Balonları
      if (cafeSpeech) {
        if (!cafeBubble || cafeBubble.name !== cafeSpeech) {
          if (cafeBubble) cafeBubbleAnchor.remove(cafeBubble);
          cafeBubble = label(cafeSpeech, "#ffffff", "#2c3e50");
          cafeBubble.scale.set(3.6, 0.9, 1);
          cafeBubble.name = cafeSpeech;
          cafeBubbleAnchor.add(cafeBubble);
        }
        cafeBubble.visible = true;
      } else if (cafeBubble) {
        cafeBubble.visible = false;
      }

      if (fisherSpeech) {
        if (!salihBubble || salihBubble.name !== fisherSpeech) {
          if (salihBubble) salihBubbleAnchor.remove(salihBubble);
          salihBubble = label(fisherSpeech, "#ffffff", "#1e272e");
          salihBubble.scale.set(3.6, 0.9, 1);
          salihBubble.name = fisherSpeech;
          salihBubbleAnchor.add(salihBubble);
        }
        salihBubble.visible = true;
      } else if (salihBubble) {
        salihBubble.visible = false;
      }
    },
  };
}
