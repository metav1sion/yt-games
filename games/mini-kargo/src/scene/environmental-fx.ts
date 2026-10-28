import * as THREE from "three";
import { box, cylinder, mat } from "./world-kit";
import type { Vec2 } from "../game/types";

export type EnvironmentalFXStats = {
  leafPilesCount: number;
  activeLeafPiles: number;
  sprayActive: boolean;
  welderState: "welding" | "idle";
  activeParticles: number;
};

export type EnvironmentalFXUpdateResult = {
  leafPileTriggered: boolean;
  bonusReward: number;
  bonusMessage?: string;
};

export interface EnvironmentalFXSound {
  leafCrunch?(): void;
  surfCrash?(volume?: number): void;
  weldingArc?(volume?: number): void;
}

export type EnvironmentalFX = {
  group: THREE.Group;
  update(
    dt: number,
    playerPos: Vec2,
    playerSpeed: number,
    isNightOrDusk?: boolean,
  ): EnvironmentalFXUpdateResult;
  getStats(): EnvironmentalFXStats;
  dispose(): void;
};

type LeafPile = {
  x: number;
  z: number;
  group: THREE.Group;
  active: boolean;
  respawnTimer: number;
};

type SwirlParticle = {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  life: number;
  maxLife: number;
  scale: number;
  color: THREE.Color;
  type: "leaf" | "spray" | "spark" | "mist";
};

const MAX_ENV_PARTICLES = 160;

/**
 * Mini Kargo — Bölgesel Çevresel Mikro-Efektler & Yaşayan Dünya Dinamikleri (T26)
 * - Güneş Mahallesi: Sokak kenarları ve parklarda interaktif çıtırdayan sonbahar yaprak yığınları (leaf piles).
 * - Sahil Şeridi: Deniz feneri ve dalgakıran kayalıklarına vuran ritmik okyanus dalga köpüğü ve su serpintisi.
 * - Sanayi Bölgesi: Atölyede çalışan Usta Kaynakçı NPC'si, titreşen mavi-beyaz ark ışığı ve akkor kıvılcım duşu.
 * - Çarşı Bölgesi: Tarihi meydan fıskiyesi su sisi pırıltıları.
 */
export function createEnvironmentalFX(sound?: EnvironmentalFXSound): EnvironmentalFX {
  const group = new THREE.Group();
  group.name = "environmental-fx";

  // =========================================================================
  // 1. GÜNEŞ MAHALLESİ — İNTERAKTİF SONBAHAR YAPRAK YIĞINLARI (Leaf Piles)
  // =========================================================================
  const leafPilesGroup = new THREE.Group();
  leafPilesGroup.name = "leaf-piles";
  group.add(leafPilesGroup);

  const leafPileConfigs = [
    { x: -76, z: -72 }, // Ev 01 bahçe kenarı çimleri
    { x: -24, z: -72 }, // Ev 02 kaldırım bordürü
    { x: -54, z: -16 }, // Lojistik üssü park girişi
    { x: -36, z: -36 }, // Çocuk parkı kenarı
  ];

  const LEAF_COLORS = [
    "#f1c40f", // Altın sarısı
    "#f39c12", // Sıcak amber
    "#e67e22", // Sonbahar turuncusu
    "#d35400", // Kızıl yaprak
    "#c0392b", // Bordo kuru yaprak
    "#27ae60", // Zeytuni yeşil
  ];

  const leafPiles: LeafPile[] = leafPileConfigs.map((cfg) => {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(cfg.x, 0, cfg.z);
    leafPilesGroup.add(pileGroup);

    // Kubbeli yaprak yığını tabanı
    const mound = cylinder(pileGroup, 0.95, 1.25, 0.22, [0, 0.11, 0], "#d35400", 9);
    mound.castShadow = false;

    // Üstte dairesel dağıtılmış renkli çıtır yaprak pulları
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2 + (i % 2) * 0.3;
      const rad = 0.35 + (i % 3) * 0.28;
      const lx = Math.cos(angle) * rad;
      const lz = Math.sin(angle) * rad;
      const color = LEAF_COLORS[i % LEAF_COLORS.length];
      const leafMesh = box(pileGroup, [0.32, 0.05, 0.26], [lx, 0.2 + (i % 2) * 0.04, lz], color);
      leafMesh.rotation.y = angle + 0.4;
      leafMesh.rotation.x = ((i % 4) - 2) * 0.12;
    }

    return {
      x: cfg.x,
      z: cfg.z,
      group: pileGroup,
      active: true,
      respawnTimer: 0,
    };
  });

  // =========================================================================
  // 2. SANAYİ BÖLGESİ — METAL ATÖLYESİ & USTA KAYNAKÇI NPC (Welding Workshop)
  // =========================================================================
  const workshopX = 36;
  const workshopZ = -26;
  const workshopGroup = new THREE.Group();
  workshopGroup.position.set(workshopX, 0, workshopZ);
  workshopGroup.name = "welding-workshop";
  group.add(workshopGroup);

  // Ağır çelik kaynak tezgahı (Work Table)
  box(workshopGroup, [2.2, 0.85, 1.3], [0, 0.425, 0], "#34495e");
  box(workshopGroup, [2.3, 0.08, 1.4], [0, 0.88, 0], "#7f8c8d"); // Çelik üst tabla

  // Tezgah üstü kaynak iş parçası (Steel I-Beam) ve mengene
  box(workshopGroup, [1.2, 0.25, 0.25], [-0.15, 1.02, 0.05], "#95a5a6");
  box(workshopGroup, [0.25, 0.35, 0.3], [0.8, 1.05, -0.3], "#2c3e50"); // Mengene

  // Argon gaz tüpü ve regülatör saatleri (Shielding Gas Cylinder)
  cylinder(workshopGroup, 0.16, 0.16, 1.5, [-1.35, 0.75, 0.3], "#1e3799", 8); // Koyu mavi gövde
  cylinder(workshopGroup, 0.06, 0.08, 0.18, [-1.35, 1.58, 0.3], "#f1c40f", 6); // Pirinç vana

  // İnverter kaynak makinesi ve kablosu (Welding Inverter)
  box(workshopGroup, [0.55, 0.42, 0.7], [-1.3, 0.21, -0.45], "#e67e22"); // Canlı endüstriyel turuncu
  box(workshopGroup, [0.12, 0.14, 0.12], [-1.3, 0.46, -0.45], "#2c3e50"); // Taşıma kulpu

  // Sarı-siyah güvenlik siperliği (Hazard Safety Welding Screen)
  box(workshopGroup, [1.9, 1.6, 0.06], [0, 0.85, -0.8], "#f1c40f");
  box(workshopGroup, [1.7, 0.08, 0.08], [0, 1.3, -0.78], "#1e272e");
  box(workshopGroup, [1.7, 0.08, 0.08], [0, 0.45, -0.78], "#1e272e");

  // Usta Kaynakçı NPC (Welder character)
  const welderNPC = new THREE.Group();
  welderNPC.position.set(0, 0, 0.75); // Masanın önünde
  workshopGroup.add(welderNPC);

  // Gövde ve koyu tulum
  box(welderNPC, [0.44, 0.7, 0.26], [0, 0.85, 0], "#2c3e50"); // Koyu mavi iş tulumu
  box(welderNPC, [0.38, 0.55, 0.06], [0, 0.8, -0.14], "#a0522d"); // Deri kaynak önlüğü

  // Bacaklar
  box(welderNPC, [0.16, 0.52, 0.18], [-0.13, 0.26, 0], "#243342");
  box(welderNPC, [0.16, 0.52, 0.18], [0.13, 0.26, 0], "#243342");

  // Baş ve Tam Kapalı Kaynak Kaskı (Welding Helmet)
  const welderHead = new THREE.Group();
  welderHead.position.set(0, 1.32, 0);
  welderNPC.add(welderHead);
  box(welderHead, [0.3, 0.32, 0.32], [0, 0, 0], "#1e272e"); // Mat siyah kask
  // Karartılmış cam vizör (Dark visor with subtle blue gleam)
  box(welderHead, [0.22, 0.12, 0.05], [0, -0.02, -0.17], "#34495e");

  // Sağ Kol & Kaynak Pensesi (Articulated arm holding torch)
  const torchArm = new THREE.Group();
  torchArm.position.set(0.25, 1.1, 0);
  welderNPC.add(torchArm);
  box(torchArm, [0.12, 0.38, 0.14], [0.06, -0.16, -0.15], "#2c3e50"); // Kol
  // Kaynak hamlacı gövdesi ve nozulu
  cylinder(torchArm, 0.03, 0.03, 0.24, [0.06, -0.32, -0.35], "#d35400", 6);
  cylinder(torchArm, 0.02, 0.025, 0.12, [0.06, -0.32, -0.48], "#f1c40f", 6).rotation.x = Math.PI / 2;

  // Dinamik Ark Işığı (Flickering Blue-White PointLight at torch tip)
  const torchTipPos = new THREE.Vector3(workshopX + 0.31, 0.98, workshopZ + 0.27);
  const arcLight = new THREE.PointLight("#a5b4fc", 0, 14, 2.2);
  arcLight.position.copy(torchTipPos);
  group.add(arcLight);

  // =========================================================================
  // 3. ÇOKLU MİKRO-PARÇACIK SİSTEMİ (InstancedMesh: Leaves, Spray, Sparks, Mist)
  // =========================================================================
  const particleGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const particleMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const instancedMesh = new THREE.InstancedMesh(particleGeo, particleMat, MAX_ENV_PARTICLES);
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_ENV_PARTICLES * 3),
    3,
  );
  group.add(instancedMesh);

  const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < MAX_ENV_PARTICLES; i++) {
    instancedMesh.setMatrixAt(i, zeroMatrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

  const particles: SwirlParticle[] = Array.from({ length: MAX_ENV_PARTICLES }, () => ({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    vRotX: 0,
    vRotY: 0,
    vRotZ: 0,
    life: 0,
    maxLife: 1,
    scale: 1,
    color: new THREE.Color(),
    type: "leaf",
  }));

  let particleHead = 0;
  const dummy = new THREE.Object3D();

  function spawnParticle(
    type: "leaf" | "spray" | "spark" | "mist",
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: string | THREE.Color,
    maxLife: number,
    scale = 1.0,
  ) {
    const p = particles[particleHead];
    p.active = true;
    p.type = type;
    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = vx;
    p.vy = vy;
    p.vz = vz;
    p.rotX = Math.random() * Math.PI;
    p.rotY = Math.random() * Math.PI;
    p.rotZ = Math.random() * Math.PI;
    p.vRotX = (Math.random() - 0.5) * 6;
    p.vRotY = (Math.random() - 0.5) * 6;
    p.vRotZ = (Math.random() - 0.5) * 6;
    p.life = 0;
    p.maxLife = maxLife;
    p.scale = scale;
    if (typeof color === "string") {
      p.color.set(color);
    } else {
      p.color.copy(color);
    }

    particleHead = (particleHead + 1) % MAX_ENV_PARTICLES;
  }

  function spawnLeafBurst(cx: number, cz: number) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 2.8;
      const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 0.8;
      const vy = 2.4 + Math.random() * 2.8;
      const vz = Math.sin(angle) * speed + (Math.random() - 0.5) * 0.8;
      const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      spawnParticle(
        "leaf",
        cx + (Math.random() - 0.5) * 0.6,
        0.25 + Math.random() * 0.2,
        cz + (Math.random() - 0.5) * 0.6,
        vx,
        vy,
        vz,
        color,
        1.6 + Math.random() * 0.8,
        0.28 + Math.random() * 0.14,
      );
    }
  }

  function spawnCoastalWaveSpray() {
    const sprayCount = 20;
    const basePositions = [
      { x: -28, z: 91 }, // Fener dalgakıran kayalığı
      { x: -32, z: 89 }, // Yan sığ kaya burnu
    ];
    for (let i = 0; i < sprayCount; i++) {
      const origin = basePositions[i % basePositions.length];
      const angle = (Math.random() - 0.5) * Math.PI * 0.8; // Kıyıya doğru yayılma
      const speedH = 1.2 + Math.random() * 2.2;
      const vx = Math.cos(angle) * speedH + 0.6; // Hafif doğu esintisi
      const vy = 2.8 + Math.random() * 3.4; // Yukarı fışkıran köpük
      const vz = -Math.sin(angle) * speedH - 0.8;
      const sprayColor = Math.random() > 0.4 ? "#ffffff" : "#e0f7fa";
      spawnParticle(
        "spray",
        origin.x + (Math.random() - 0.5) * 1.8,
        0.4 + Math.random() * 0.3,
        origin.z + (Math.random() - 0.5) * 1.8,
        vx,
        vy,
        vz,
        sprayColor,
        1.1 + Math.random() * 0.6,
        0.22 + Math.random() * 0.12,
      );
    }
  }

  function spawnWeldingSparks() {
    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speedH = 0.8 + Math.random() * 1.8;
      const vx = Math.cos(angle) * speedH * 0.7;
      const vy = -0.4 - Math.random() * 2.2; // Masadan aşağı dökülen kıvılcımlar
      const vz = Math.sin(angle) * speedH * 0.7 + 0.4;
      const sparkColors = ["#ffffff", "#fef08a", "#f97316", "#ef4444"];
      const col = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      spawnParticle(
        "spark",
        torchTipPos.x + (Math.random() - 0.5) * 0.12,
        torchTipPos.y + (Math.random() - 0.5) * 0.08,
        torchTipPos.z + (Math.random() - 0.5) * 0.12,
        vx,
        vy,
        vz,
        col,
        0.28 + Math.random() * 0.22,
        0.14 + Math.random() * 0.08,
      );
    }
  }

  // =========================================================================
  // 4. DURUM VE DÖNGÜ YÖNETİMİ
  // =========================================================================
  let waveSprayTimer = 0;
  let waveSprayInterval = 3.4; // Her 3.4 saniyede bir kıyı dalga patlaması
  let weldingState: "welding" | "idle" = "welding";
  let weldingTimer = 0;
  let weldingDuration = 3.2; // 3.2 saniye kaynak yap, 1.6 saniye dinlen
  let sparkIntervalTimer = 0;
  let time = 0;

  return {
    group,
    update(
      dt: number,
      playerPos: Vec2,
      playerSpeed: number,
      isNightOrDusk = false,
    ): EnvironmentalFXUpdateResult {
      time += dt;
      let leafPileTriggered = false;
      let bonusReward = 0;
      let bonusMessage: string | undefined;

      // 1. Güneş Mahallesi Yaprak Yığınları Çarpışma ve Hışırtı Kontrolü
      for (const pile of leafPiles) {
        if (!pile.active) {
          pile.respawnTimer -= dt;
          if (pile.respawnTimer <= 0) {
            pile.active = true;
            pile.group.scale.set(1, 1, 1);
          }
          continue;
        }

        // Aktif yaprak yığını hafif nefes alma hareketi
        const sway = 1 + Math.sin(time * 2.5 + pile.x) * 0.04;
        pile.group.scale.set(sway, sway, sway);

        const dist = Math.hypot(playerPos.x - pile.x, playerPos.z - pile.z);
        if (dist < 1.65 && playerSpeed > 1.2) {
          // Araç yaprak yığınının üstünden geçti!
          pile.active = false;
          pile.group.scale.set(0, 0, 0);
          pile.respawnTimer = 16.0; // 16 saniye sonra yeniden oluşur

          spawnLeafBurst(pile.x, pile.z);
          sound?.leafCrunch?.();

          leafPileTriggered = true;
          bonusReward = 5;
          bonusMessage = "🍂 SONBAHAR KEYFİ! +5 ₺";
        }
      }

      // 2. Sahil Şeridi Dalgakıran Su Serpintisi ve Dalga Çarpması
      waveSprayTimer += dt;
      if (waveSprayTimer >= waveSprayInterval) {
        waveSprayTimer = 0;
        waveSprayInterval = 2.8 + Math.random() * 1.4;
        spawnCoastalWaveSpray();

        // Oyuncu dalgakırana yakınsa derin surf çarpma sesi çal
        const coastalDist = Math.hypot(playerPos.x - (-28), playerPos.z - 91);
        if (coastalDist < 46) {
          const surfVol = Math.max(0, 1 - coastalDist / 46);
          sound?.surfCrash?.(surfVol);
        }
      }

      // 3. Sanayi Bölgesi Metal Kaynak Atölyesi ve Usta Kaynakçı Döngüsü
      weldingTimer += dt;
      if (weldingState === "welding") {
        // Kaynak anında fener ışığı ve kıvılcım titreşimi
        const flicker = Math.random() > 0.15 ? 1.8 + Math.random() * 2.8 : 0.2;
        arcLight.intensity = isNightOrDusk ? flicker * 1.5 : flicker;

        sparkIntervalTimer += dt;
        if (sparkIntervalTimer >= 0.055) {
          sparkIntervalTimer = 0;
          spawnWeldingSparks();

          // Oyuncu atölyeye yakınsa kaynak cızırtı sesi
          const workshopDist = Math.hypot(playerPos.x - workshopX, playerPos.z - workshopZ);
          if (workshopDist < 36) {
            const weldVol = Math.max(0, 1 - workshopDist / 36);
            sound?.weldingArc?.(weldVol);
          }
        }

        // Kaynakçı hamlaç kolunda mikro titreme
        torchArm.rotation.z = (Math.random() - 0.5) * 0.06;
        torchArm.rotation.x = (Math.random() - 0.5) * 0.04;

        if (weldingTimer >= weldingDuration) {
          weldingState = "idle";
          weldingTimer = 0;
          weldingDuration = 1.4 + Math.random() * 1.2;
          arcLight.intensity = 0;
        }
      } else {
        // Dinlenme durumu
        arcLight.intensity = 0;
        torchArm.rotation.set(0, 0, 0);

        if (weldingTimer >= weldingDuration) {
          weldingState = "welding";
          weldingTimer = 0;
          weldingDuration = 2.8 + Math.random() * 2.2;
        }
      }

      // 4. Çarşı Bölgesi Tarihi Fıskiye Su Sisi (Gündüz ve gün batımında pırıltılı)
      if (Math.random() < 0.25) {
        const fAngle = Math.random() * Math.PI * 2;
        const fRad = Math.random() * 1.2;
        spawnParticle(
          "mist",
          50 + Math.cos(fAngle) * fRad,
          1.1 + Math.random() * 0.6,
          50 + Math.sin(fAngle) * fRad,
          (Math.random() - 0.5) * 0.3,
          0.3 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.3,
          "#dff9fb",
          1.4,
          0.12,
        );
      }

      // 5. Parçacık Fiziği ve InstancedMesh Güncellemesi
      let activeCount = 0;
      for (let i = 0; i < MAX_ENV_PARTICLES; i++) {
        const p = particles[i];
        if (!p.active) {
          instancedMesh.setMatrixAt(i, zeroMatrix);
          continue;
        }

        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          instancedMesh.setMatrixAt(i, zeroMatrix);
          continue;
        }

        activeCount++;
        const progress = p.life / p.maxLife;

        // Yerçekimi ve hava direnci
        if (p.type === "leaf") {
          p.vy -= 4.2 * dt; // Kuru yapraklar yavaşça süzülür
          p.vx *= 0.96;
          p.vz *= 0.96;
          // Hafif rüzgar dalgalanması
          p.vx += Math.sin(time * 3 + p.y) * 0.04;
        } else if (p.type === "spray") {
          p.vy -= 9.8 * dt; // Su damlaları yerçekimiyle iner
        } else if (p.type === "spark") {
          p.vy -= 12.0 * dt; // Ağır kıvılcımlar hızla iner
        } else if (p.type === "mist") {
          p.vy += 0.2 * dt; // Sis hafifçe yükselir ve dağılır
          p.vx += 0.15 * dt;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;

        // Zeminle temas (y = 0.04 altına inmez)
        if (p.y < 0.04) {
          p.y = 0.04;
          p.vx *= 0.5;
          p.vz *= 0.5;
          p.vy = 0;
        }

        p.rotX += p.vRotX * dt;
        p.rotY += p.vRotY * dt;
        p.rotZ += p.vRotZ * dt;

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rotX, p.rotY, p.rotZ);

        // Yaşam süresine göre küçülme
        const currentScale = p.scale * (1 - progress * 0.65);
        dummy.scale.set(currentScale, currentScale, currentScale);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
        if (instancedMesh.instanceColor) {
          instancedMesh.setColorAt(i, p.color);
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      return {
        leafPileTriggered,
        bonusReward,
        bonusMessage,
      };
    },
    getStats(): EnvironmentalFXStats {
      const activePiles = leafPiles.filter((p) => p.active).length;
      const activeParticles = particles.filter((p) => p.active).length;
      return {
        leafPilesCount: leafPiles.length,
        activeLeafPiles: activePiles,
        sprayActive: waveSprayTimer < 1.0,
        welderState: weldingState,
        activeParticles,
      };
    },
    dispose() {
      for (const pile of leafPiles) {
        leafPilesGroup.remove(pile.group);
      }
      group.remove(leafPilesGroup);
      group.remove(workshopGroup);
      group.remove(arcLight);
      group.remove(instancedMesh);
      instancedMesh.geometry.dispose();
      particleMat.dispose();
    },
  };
}
