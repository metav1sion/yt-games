import * as THREE from "three";
import { box, cylinder, mat } from "./world-kit";
import type { Vec2 } from "../game/types";

export type UrbanFaunaStats = {
  seagulls: number;
  pigeons: number;
  cats: number;
  dogs: number;
};

export type UrbanFauna = {
  group: THREE.Group;
  update(dt: number, playerPos: Vec2, playerSpeed?: number): void;
  onHonk(playerPos: Vec2): void;
  getFaunaStats(): UrbanFaunaStats;
  dispose(): void;
};

type SeagullState = {
  group: THREE.Group;
  leftWingPivot: THREE.Group;
  rightWingPivot: THREE.Group;
  cx: number;
  cz: number;
  radius: number;
  height: number;
  speed: number;
  angle: number;
  phase: number;
};

type PigeonState = {
  group: THREE.Group;
  headPivot: THREE.Group;
  leftWingPivot: THREE.Group;
  rightWingPivot: THREE.Group;
  homeX: number;
  homeZ: number;
  curX: number;
  curZ: number;
  curY: number;
  yaw: number;
  state: "idle" | "scared" | "landing";
  scaredTimer: number;
  wanderAngle: number;
  peckTimer: number;
  seed: number;
};

type CatState = {
  group: THREE.Group;
  headPivot: THREE.Group;
  tailPivot: THREE.Group;
  x: number;
  y: number;
  z: number;
  baseYaw: number;
  meowCooldown: number;
  seed: number;
};

type DogState = {
  group: THREE.Group;
  headPivot: THREE.Group;
  tailPivot: THREE.Group;
  x: number;
  y: number;
  z: number;
  baseYaw: number;
  barkCooldown: number;
};

interface FaunaSound {
  seagullCry?(): void;
  pigeonScatter?(): void;
  catMeow?(): void;
  dogBark?(): void;
}

/**
 * Mini Kargo — Yaşayan Şehir Faunası & Sokak Hayvanları Sistemi (T24)
 * - Sahil Şeridi: Gökyüzünde süzülen 4 deniz martısı (kanat çırpış & termal süzülüş)
 * - Çarşı Bölgesi: Tarihi meydan havuzu etrafında yemlenen 8 şehir güvercini (panik kaçış & havalanma)
 * - Güneş Mahallesi: Bahçe çitleri ve çimlerde güneşlenen 3 sevimli mahalle kedisi (baş takibi & miyavlama)
 * - Sanayi Bölgesi: Lojistik kapısında kulübesinde nöbet tutan bekçi köpeği Karabaş (kuyruk sallama & havlama)
 */
export function createUrbanFauna(sound?: FaunaSound): UrbanFauna {
  const group = new THREE.Group();
  group.name = "urban-fauna";

  // ==========================================
  // 1. SAHİL ŞERİDİ — SÜZÜLEN DENİZ MARTILARI (4 adet)
  // ==========================================
  const seagulls: SeagullState[] = [];
  const seagullConfigs = [
    { cx: -26, cz: 88, radius: 16, height: 8.5, speed: 0.58, phase: 0 },
    { cx: 16, cz: 76, radius: 19, height: 9.8, speed: 0.52, phase: 1.9 },
    { cx: -8, cz: 65, radius: 22, height: 11.2, speed: 0.46, phase: 3.6 },
    { cx: 28, cz: 92, radius: 15, height: 7.9, speed: 0.64, phase: 5.1 },
  ];

  for (const cfg of seagullConfigs) {
    const sGroup = new THREE.Group();

    // Gövde (Akıcı beyaz low-poly aero gövde)
    box(sGroup, [0.18, 0.14, 0.44], [0, 0, 0], "#f8f9fa", 0.6);
    // Kafa
    box(sGroup, [0.13, 0.13, 0.15], [0, 0.05, 0.25], "#ffffff", 0.5);
    // Sarı gaga ve kırmızı leke
    box(sGroup, [0.05, 0.04, 0.14], [0, 0.03, 0.38], "#f1c40f", 0.4);
    box(sGroup, [0.03, 0.02, 0.04], [0, 0.02, 0.42], "#e74c3c", 0.4);
    // Gözler
    box(sGroup, [0.14, 0.03, 0.03], [0, 0.07, 0.27], "#2d3436", 0.4);
    // Kuyruk tüyleri
    box(sGroup, [0.14, 0.03, 0.18], [0, 0.02, -0.28], "#f8f9fa", 0.6);

    // Sol Kanat Mafsalı
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.09, 0.04, 0.0);
    box(leftWingPivot, [0.38, 0.025, 0.16], [-0.19, 0, 0], "#f8f9fa", 0.6);
    box(leftWingPivot, [0.24, 0.02, 0.12], [-0.48, 0, -0.02], "#718093", 0.6);
    sGroup.add(leftWingPivot);

    // Sağ Kanat Mafsalı
    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.09, 0.04, 0.0);
    box(rightWingPivot, [0.38, 0.025, 0.16], [0.19, 0, 0], "#f8f9fa", 0.6);
    box(rightWingPivot, [0.24, 0.02, 0.12], [0.48, 0, -0.02], "#718093", 0.6);
    sGroup.add(rightWingPivot);

    group.add(sGroup);
    seagulls.push({
      group: sGroup,
      leftWingPivot,
      rightWingPivot,
      cx: cfg.cx,
      cz: cfg.cz,
      radius: cfg.radius,
      height: cfg.height,
      speed: cfg.speed,
      angle: cfg.phase,
      phase: cfg.phase,
    });
  }

  let seagullCryCooldown = 14.0;

  // ==========================================
  // 2. ÇARŞI BÖLGESİ — MEYDAN GÜVERCİNLERİ (8 adet)
  // ==========================================
  const pigeons: PigeonState[] = [];
  const pigeonCoords = [
    [47.5, 47.0],
    [52.8, 48.2],
    [45.2, 53.6],
    [54.0, 52.5],
    [49.0, 44.5],
    [51.5, 55.8],
    [44.0, 48.5],
    [55.5, 46.2],
  ];

  pigeonCoords.forEach(([hx, hz], index) => {
    const pGroup = new THREE.Group();

    // Gövde (Mavi-gri tüyler)
    box(pGroup, [0.18, 0.15, 0.25], [0, 0.11, 0], "#576574", 0.7);
    // Yanardöner mor boyun halkası
    box(pGroup, [0.12, 0.08, 0.12], [0, 0.19, 0.09], "#6c5ce7", 0.5);

    // Baş mafsalı (Yem arama kafa hareketi için)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.22, 0.13);
    box(headPivot, [0.10, 0.10, 0.11], [0, 0, 0], "#576574", 0.7);
    box(headPivot, [0.03, 0.03, 0.07], [0, -0.02, 0.08], "#2d3436", 0.5);
    pGroup.add(headPivot);

    // Sol & Sağ Kanat mafsalları
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.09, 0.11, 0);
    box(leftWingPivot, [0.03, 0.12, 0.20], [0, 0, 0], "#2f3542", 0.8);
    pGroup.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.09, 0.11, 0);
    box(rightWingPivot, [0.03, 0.12, 0.20], [0, 0, 0], "#2f3542", 0.8);
    pGroup.add(rightWingPivot);

    // Turuncu minik ayaklar
    box(pGroup, [0.03, 0.07, 0.03], [-0.05, 0.035, 0], "#e67e22");
    box(pGroup, [0.03, 0.07, 0.03], [0.05, 0.035, 0], "#e67e22");

    pGroup.position.set(hx, 0.04, hz);
    group.add(pGroup);

    pigeons.push({
      group: pGroup,
      headPivot,
      leftWingPivot,
      rightWingPivot,
      homeX: hx,
      homeZ: hz,
      curX: hx,
      curZ: hz,
      curY: 0.04,
      yaw: (index * Math.PI) / 4,
      state: "idle",
      scaredTimer: 0,
      wanderAngle: index * 0.8,
      peckTimer: index * 0.4,
      seed: index * 1.33,
    });
  });

  // ==========================================
  // 3. GÜNEŞ MAHALLESİ — SEVİMLİ KEDİLER (3 adet)
  // ==========================================
  const cats: CatState[] = [];
  const catConfigs = [
    // Tekir (Turuncu tekir) - Ev 1 bahçe çiti üzeri
    { x: -42.8, y: 0.92, z: -57.5, yaw: 0.4, coat: "#e67e22", chest: "#f39c12", seed: 0 },
    // Duman (Siyah-beyaz smokin kedi) - Ev 2 ön çimliği
    { x: -26.0, y: 0.08, z: -36.5, yaw: -0.6, coat: "#2d3436", chest: "#ffffff", seed: 1 },
    // Zeytin (Alaca kedi) - Mahalle giriş taş duvarı
    { x: -48.2, y: 0.45, z: -15.5, yaw: 1.57, coat: "#d35400", chest: "#fad390", seed: 2 },
  ];

  for (const cfg of catConfigs) {
    const cGroup = new THREE.Group();
    cGroup.position.set(cfg.x, cfg.y, cfg.z);
    cGroup.rotation.y = cfg.yaw;

    // Gövde
    box(cGroup, [0.18, 0.16, 0.36], [0, 0.12, 0], cfg.coat, 0.75);
    // Göğüs tüyü
    box(cGroup, [0.12, 0.10, 0.14], [0, 0.10, 0.12], cfg.chest, 0.75);

    // Kafa mafsalı (Oyuncu aracını bakışla takip edebilmesi için)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.20, 0.16);
    box(headPivot, [0.15, 0.13, 0.15], [0, 0, 0], cfg.coat, 0.75);
    // Sivri kulaklar
    box(headPivot, [0.04, 0.06, 0.02], [-0.05, 0.08, -0.01], "#fab1a0");
    box(headPivot, [0.04, 0.06, 0.02], [0.05, 0.08, -0.01], "#fab1a0");
    // Beyaz ağızlık & pembe burun
    box(headPivot, [0.07, 0.05, 0.04], [0, -0.03, 0.08], "#ffffff");
    box(headPivot, [0.03, 0.02, 0.01], [0, -0.01, 0.10], "#e84393");
    cGroup.add(headPivot);

    // Kuyruk mafsalı (Kıvrımlı hareket için)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.16, -0.18);
    box(tailPivot, [0.04, 0.18, 0.04], [0, 0.09, -0.08], cfg.coat, 0.75);
    cGroup.add(tailPivot);

    // Patiler
    box(cGroup, [0.05, 0.07, 0.06], [-0.06, 0.035, 0.12], "#ffffff");
    box(cGroup, [0.05, 0.07, 0.06], [0.06, 0.035, 0.12], "#ffffff");
    box(cGroup, [0.05, 0.07, 0.06], [-0.06, 0.035, -0.12], "#ffffff");
    box(cGroup, [0.05, 0.07, 0.06], [0.06, 0.035, -0.12], "#ffffff");

    group.add(cGroup);
    cats.push({
      group: cGroup,
      headPivot,
      tailPivot,
      x: cfg.x,
      y: cfg.y,
      z: cfg.z,
      baseYaw: cfg.yaw,
      meowCooldown: 0,
      seed: cfg.seed,
    });
  }

  // ==========================================
  // 4. SANAYİ BÖLGESİ — BEKÇİ KÖPEĞİ ("KARABAŞ")
  // ==========================================
  const dogHouseGroup = new THREE.Group();
  dogHouseGroup.position.set(-44.0, 0, 18.0);
  dogHouseGroup.rotation.y = Math.PI / 2;

  // Ahşap köpek kulübesi
  box(dogHouseGroup, [1.4, 1.1, 1.3], [0, 0.55, 0], "#8b5a2b", 0.9);
  // Giriş kapısı (karanlık oyuk)
  box(dogHouseGroup, [0.55, 0.72, 0.05], [0, 0.36, 0.65], "#1e272e", 0.95);
  // Eğimli terakota çatı
  box(dogHouseGroup, [1.6, 0.08, 1.5], [0, 1.15, 0], "#c0392b", 0.8);
  // Ön ahşap sundurma tabanı
  box(dogHouseGroup, [1.6, 0.06, 0.9], [0, 0.03, 0.9], "#a0522d", 0.9);
  // Paslanmaz çelik su tası ve su
  cylinder(dogHouseGroup, 0.16, 0.14, 0.09, [0.6, 0.06, 1.0], "#bdc3c7", 8);
  cylinder(dogHouseGroup, 0.13, 0.13, 0.02, [0.6, 0.09, 1.0], "#3498db", 8);

  // Karabaş Köpek Modeli
  const dogGroup = new THREE.Group();
  // Kulübe önü verandasında gururla oturuyor
  dogGroup.position.set(0, 0.06, 0.8);

  // Gövde (Kangal bej rengi)
  box(dogGroup, [0.26, 0.28, 0.52], [0, 0.24, 0], "#d3a268", 0.8);
  box(dogGroup, [0.22, 0.22, 0.22], [0, 0.36, 0.18], "#c89658", 0.8);

  // Kafa mafsalı (Sürücü yaklaşınca bakar)
  const dogHeadPivot = new THREE.Group();
  dogHeadPivot.position.set(0, 0.46, 0.26);
  box(dogHeadPivot, [0.18, 0.18, 0.22], [0, 0, 0], "#d3a268", 0.8);
  // Siyah Karabaş maskesi ve burun
  box(dogHeadPivot, [0.12, 0.10, 0.14], [0, -0.03, 0.16], "#2d3436", 0.7);
  box(dogHeadPivot, [0.04, 0.03, 0.02], [0, 0.01, 0.23], "#111111", 0.5);
  // Sarkık siyah kulaklar
  box(dogHeadPivot, [0.04, 0.10, 0.06], [-0.10, 0.01, -0.02], "#2d3436", 0.8);
  box(dogHeadPivot, [0.04, 0.10, 0.06], [0.10, 0.01, -0.02], "#2d3436", 0.8);
  dogGroup.add(dogHeadPivot);

  // Kuyruk mafsalı (Dostane sallanma için)
  const dogTailPivot = new THREE.Group();
  dogTailPivot.position.set(0, 0.32, -0.24);
  box(dogTailPivot, [0.07, 0.18, 0.07], [0, 0.10, -0.06], "#c89658", 0.8);
  dogGroup.add(dogTailPivot);

  // Ayaklar
  box(dogGroup, [0.08, 0.16, 0.08], [-0.09, 0.08, 0.18], "#d3a268");
  box(dogGroup, [0.08, 0.16, 0.08], [0.09, 0.08, 0.18], "#d3a268");
  box(dogGroup, [0.08, 0.12, 0.14], [-0.09, 0.06, -0.16], "#d3a268");
  box(dogGroup, [0.08, 0.12, 0.14], [0.09, 0.06, -0.16], "#d3a268");

  dogHouseGroup.add(dogGroup);
  group.add(dogHouseGroup);

  const dog: DogState = {
    group: dogGroup,
    headPivot: dogHeadPivot,
    tailPivot: dogTailPivot,
    x: -44.0,
    y: 0,
    z: 18.0,
    baseYaw: Math.PI / 2,
    barkCooldown: 0,
  };

  let globalTime = 0;

  return {
    group,

    update(dt: number, playerPos: Vec2, playerSpeed = 0) {
      globalTime += dt;

      // 1. Martıların uçuşu ve süzülmesi
      seagullCryCooldown -= dt;
      let playerInCoastal = false;

      for (const gull of seagulls) {
        gull.angle += gull.speed * dt;
        const x = gull.cx + gull.radius * Math.cos(gull.angle);
        const z = gull.cz + gull.radius * Math.sin(gull.angle);
        const y = gull.height + Math.sin(gull.angle * 2.0) * 0.45;

        gull.group.position.set(x, y, z);
        // Teğet yönüne bak
        gull.group.rotation.y = -gull.angle + Math.PI / 2;
        // Dönüşe göre yatış (banking roll)
        gull.group.rotation.z = -0.28 * Math.sin(gull.angle);

        // Kanat çırpış veya süzülüş döngüsü
        const cycle = (globalTime + gull.phase) % 4.2;
        if (cycle < 1.2) {
          // Çırpış
          const flap = Math.sin(cycle * 22) * 0.42;
          gull.leftWingPivot.rotation.z = flap;
          gull.rightWingPivot.rotation.z = -flap;
        } else {
          // Süzülüş (hafif V dihedral)
          gull.leftWingPivot.rotation.z = 0.06;
          gull.rightWingPivot.rotation.z = -0.06;
        }

        if (Math.hypot(playerPos.x - x, playerPos.z - z) < 45) {
          playerInCoastal = true;
        }
      }

      // Sahil bölgesinde periyodik martı çığlığı
      if (playerInCoastal && seagullCryCooldown <= 0) {
        seagullCryCooldown = 15.0 + Math.random() * 15.0;
        sound?.seagullCry?.();
      }

      // 2. Çarşı güvercinlerinin davranışı
      let scatterTriggeredThisFrame = false;

      for (const p of pigeons) {
        const distToPlayer = Math.hypot(playerPos.x - p.curX, playerPos.z - p.curZ);
        const playerThreat = distToPlayer < (playerSpeed > 4 ? 8.5 : 5.8);

        if (playerThreat && p.state !== "scared") {
          p.state = "scared";
          p.scaredTimer = 3.6 + Math.random() * 0.8;
          if (!scatterTriggeredThisFrame) {
            scatterTriggeredThisFrame = true;
            sound?.pigeonScatter?.();
          }
        }

        if (p.state === "scared") {
          p.scaredTimer -= dt;
          // Havaya yüksel ve uzaklaş
          p.curY = THREE.MathUtils.lerp(p.curY, 3.2 + Math.sin(p.seed) * 0.8, dt * 4.5);
          const escapeAngle = Math.atan2(p.curX - playerPos.x, p.curZ - playerPos.z);
          p.curX += Math.sin(escapeAngle) * dt * 3.5;
          p.curZ += Math.cos(escapeAngle) * dt * 3.5;
          p.yaw = escapeAngle;

          // Hızlı kanat çırpış (uçuş)
          const flap = Math.sin(globalTime * 32 + p.seed) * 0.75;
          p.leftWingPivot.rotation.z = flap;
          p.rightWingPivot.rotation.z = -flap;

          if (p.scaredTimer <= 0) {
            p.state = "landing";
          }
        } else if (p.state === "landing") {
          // Yere yumuşak süzülerek iniş
          p.curY = THREE.MathUtils.lerp(p.curY, 0.04, dt * 3.0);
          p.curX = THREE.MathUtils.lerp(p.curX, p.homeX, dt * 2.5);
          p.curZ = THREE.MathUtils.lerp(p.curZ, p.homeZ, dt * 2.5);
          p.leftWingPivot.rotation.z = 0.1;
          p.rightWingPivot.rotation.z = -0.1;

          if (Math.abs(p.curY - 0.04) < 0.08) {
            p.curY = 0.04;
            p.state = "idle";
          }
        } else {
          // Boşta yemlenme (yerde)
          p.peckTimer += dt;
          p.headPivot.rotation.x = Math.max(0, Math.sin(p.peckTimer * 3.5) * 0.55);
          p.leftWingPivot.rotation.z = 0;
          p.rightWingPivot.rotation.z = 0;

          // Küçük adımlarla hafif yer değiştirme
          if (Math.sin(p.peckTimer * 0.8) > 0.85) {
            p.curX = p.homeX + Math.sin(p.wanderAngle) * 0.5;
            p.curZ = p.homeZ + Math.cos(p.wanderAngle) * 0.5;
          }
        }

        p.group.position.set(p.curX, p.curY, p.curZ);
        p.group.rotation.y = p.yaw;
      }

      // 3. Güneş Mahallesi kedileri (baş takibi & kuyruk)
      for (const cat of cats) {
        cat.meowCooldown -= dt;
        // Kuyruk salınımı
        cat.tailPivot.rotation.y = Math.sin(globalTime * 2.4 + cat.seed) * 0.42;

        const distToPlayer = Math.hypot(playerPos.x - cat.x, playerPos.z - cat.z);
        if (distToPlayer < 12.0) {
          // Kafayı arabaya doğru çevir
          const targetAngle =
            Math.atan2(playerPos.x - cat.x, playerPos.z - cat.z) - cat.baseYaw;
          const clamped = Math.max(-1.15, Math.min(1.15, targetAngle));
          cat.headPivot.rotation.y = THREE.MathUtils.lerp(
            cat.headPivot.rotation.y,
            clamped,
            dt * 5.0,
          );

          // Yakın duruşta miyavlama
          if (distToPlayer < 3.8 && cat.meowCooldown <= 0) {
            cat.meowCooldown = 8.0;
            sound?.catMeow?.();
          }
        } else {
          cat.headPivot.rotation.y = THREE.MathUtils.lerp(
            cat.headPivot.rotation.y,
            0,
            dt * 2.0,
          );
        }
      }

      // 4. Sanayi bekçi köpeği Karabaş
      dog.barkCooldown -= dt;
      // Dostane kuyruk sallama
      dog.tailPivot.rotation.y = Math.sin(globalTime * 3.8) * 0.48;

      const distToDog = Math.hypot(playerPos.x - dog.x, playerPos.z - dog.z);
      if (distToDog < 14.0) {
        const targetAngle =
          Math.atan2(playerPos.x - dog.x, playerPos.z - dog.z) - dog.baseYaw;
        const clamped = Math.max(-1.0, Math.min(1.0, targetAngle));
        dog.headPivot.rotation.y = THREE.MathUtils.lerp(
          dog.headPivot.rotation.y,
          clamped,
          dt * 5.0,
        );

        // Hızlı geçişte uyarı havlaması
        if (distToDog < 6.5 && playerSpeed > 4.5 && dog.barkCooldown <= 0) {
          dog.barkCooldown = 5.0;
          sound?.dogBark?.();
        }
      } else {
        dog.headPivot.rotation.y = THREE.MathUtils.lerp(
          dog.headPivot.rotation.y,
          0,
          dt * 2.0,
        );
      }
    },

    onHonk(playerPos: Vec2) {
      // 1. Meydan güvercinleri kornayla anında ürküp havalanır
      const distToPiazza = Math.hypot(playerPos.x - 50, playerPos.z - 50);
      if (distToPiazza < 28.0) {
        let scatterTriggered = false;
        for (const p of pigeons) {
          if (p.state !== "scared") {
            p.state = "scared";
            p.scaredTimer = 4.0 + Math.random() * 0.6;
            if (!scatterTriggered) {
              scatterTriggered = true;
              sound?.pigeonScatter?.();
            }
          }
        }
      }

      // 2. Güneş Mahallesi kedileri kornada kulak dikip miyavlar
      for (const cat of cats) {
        const dist = Math.hypot(playerPos.x - cat.x, playerPos.z - cat.z);
        if (dist < 16.0 && cat.meowCooldown <= 0) {
          cat.meowCooldown = 6.0;
          sound?.catMeow?.();
        }
      }

      // 3. Karabaş kornaya coşkuyla karşılık havlar
      const distToDog = Math.hypot(playerPos.x - dog.x, playerPos.z - dog.z);
      if (distToDog < 20.0 && dog.barkCooldown <= 0) {
        dog.barkCooldown = 4.0;
        sound?.dogBark?.();
      }
    },

    getFaunaStats() {
      return {
        seagulls: seagulls.length,
        pigeons: pigeons.length,
        cats: cats.length,
        dogs: 1,
      };
    },

    dispose() {
      group.clear();
    },
  };
}
