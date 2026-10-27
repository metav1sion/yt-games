import * as THREE from "three";
import type { BuyPad } from "../game/buy-pad";

export type BuyPadVisual = {
  group: THREE.Group;
  update(pad: BuyPad, dt: number, isTransferring?: boolean): void;
  dispose(): void;
};

export type BuyPadsView = {
  group: THREE.Group;
  update(pads: BuyPad[], dt: number, activePadId?: string | null): void;
  dispose(): void;
};

const COIN_COUNT = 8;

/**
 * Tek bir BuyPad için yerde parıldayan neon zemin halkası,
 * dolum çemberi, uçuşan para parçacıkları ve 3D yüzen etiket oluşturur.
 */
export function createBuyPadVisual(initialPad: BuyPad): BuyPadVisual {
  const group = new THREE.Group();
  group.position.set(initialPad.position.x, 0, initialPad.position.z);

  const radius = initialPad.radius;

  // 1. Zemin Dış Neon Halka
  const outerRingGeo = new THREE.RingGeometry(radius * 0.88, radius, 48);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: "#00f0ff",
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.04;
  group.add(outerRing);

  // 2. Zemin İç Saydam Neon Dairesi
  const innerDiscGeo = new THREE.CircleGeometry(radius * 0.88, 48);
  const innerDiscMat = new THREE.MeshBasicMaterial({
    color: "#00d2ff",
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
  innerDisc.rotation.x = -Math.PI / 2;
  innerDisc.position.y = 0.03;
  group.add(innerDisc);

  // 3. İç İkincil Vurgu Halkası
  const innerRingGeo = new THREE.RingGeometry(radius * 0.70, radius * 0.73, 48);
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.045;
  group.add(innerRing);

  // 4. Dolum Çemberi (Progress Fill Ring - Para aktıkça 0'dan 360 dereceye dolar)
  let currentFillProgress = -1;
  const fillMat = new THREE.MeshBasicMaterial({
    color: "#39ff14",
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  let fillGeo = new THREE.RingGeometry(
    radius * 0.74,
    radius * 0.86,
    48,
    1,
    -Math.PI / 2,
    0.001,
  );
  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
  fillMesh.rotation.x = -Math.PI / 2;
  fillMesh.position.y = 0.05;
  fillMesh.visible = false;
  group.add(fillMesh);

  function updateFillRing(progress: number) {
    const clamped = Math.max(0, Math.min(1, progress));
    if (Math.abs(clamped - currentFillProgress) < 0.005) return;
    currentFillProgress = clamped;

    fillGeo.dispose();
    const thetaLength = Math.max(0.001, clamped * Math.PI * 2);
    fillGeo = new THREE.RingGeometry(
      radius * 0.74,
      radius * 0.86,
      48,
      1,
      -Math.PI / 2,
      thetaLength,
    );
    fillMesh.geometry = fillGeo;
    fillMesh.visible = clamped > 0.005;
  }

  // 5. Tamamlanma Dalgası (Completion Expansion Wave)
  let waveProgress = 1.0;
  const waveGeo = new THREE.RingGeometry(radius * 0.85, radius, 48);
  const waveMat = new THREE.MeshBasicMaterial({
    color: "#ffea00",
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const waveMesh = new THREE.Mesh(waveGeo, waveMat);
  waveMesh.rotation.x = -Math.PI / 2;
  waveMesh.position.y = 0.06;
  group.add(waveMesh);

  // 6. Uçuşan Para / Madeni Para Parçacıkları (Cash Flow Effect)
  const coinsGroup = new THREE.Group();
  group.add(coinsGroup);
  const coinMeshes: THREE.Mesh[] = [];
  const coinOffsets: { angle: number; speed: number; y: number }[] = [];
  const coinGeo = new THREE.BoxGeometry(0.2, 0.06, 0.2);
  const coinMat = new THREE.MeshBasicMaterial({
    color: "#ffea00",
    transparent: true,
    opacity: 0.9,
  });

  for (let i = 0; i < COIN_COUNT; i++) {
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.visible = false;
    coinsGroup.add(coin);
    coinMeshes.push(coin);
    coinOffsets.push({
      angle: (i / COIN_COUNT) * Math.PI * 2,
      speed: 1.5 + (i % 3) * 0.4,
      y: (i / COIN_COUNT) * 2.2,
    });
  }

  // 7. 3D Yüzen Etiket (Floating Badge Sprite)
  let sprite: THREE.Sprite | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let texture: THREE.CanvasTexture | null = null;
  let lastDrawnKey = "";

  if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    ctx = canvas.getContext("2d");
    if (ctx) {
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
        transparent: true,
      });
      sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.4, 1.38, 1);
      sprite.position.y = 2.8;
      group.add(sprite);
    }
  }

  function renderLabel(pad: BuyPad, isTransferring: boolean) {
    if (!ctx || !canvas || !texture) return;

    const currentFloor = Math.floor(pad.currentAmount);
    const key = `${pad.name}_${pad.level}_${currentFloor}_${pad.targetCost}_${pad.isCompleted}_${isTransferring}`;
    if (key === lastDrawnKey) return;
    lastDrawnKey = key;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Koyu yarı saydam panel
    ctx.beginPath();
    ctx.roundRect(8, 8, w - 16, h - 16, 22);
    ctx.fillStyle = "rgba(12, 19, 31, 0.88)";
    ctx.fill();

    // Neon çerçeve
    ctx.lineWidth = isTransferring ? 5 : 3;
    ctx.strokeStyle = pad.isCompleted
      ? "#38ef7d"
      : isTransferring
        ? "#39ff14"
        : "#00f0ff";
    ctx.stroke();

    // Üst Satır: İsim & Seviye
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const isScooterPad = pad.id === "pad_unlock_scooter";
    const titleText = isScooterPad && pad.isCompleted
      ? "🛵 Araç Değiştir"
      : pad.isCompleted
        ? `${pad.name} (Maks. Sv.)`
        : `${pad.name} (Sv. ${pad.level + 1})`;
    const fontSize = titleText.length > 22 ? 24 : 32;
    ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText(titleText, w / 2, titleText.length > 22 ? 24 : 20);

    // Orta Satır: Maliyet / Dolum Durumu
    ctx.font = "bold 30px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = pad.isCompleted
      ? "#38ef7d"
      : isTransferring
        ? "#ffea00"
        : "#38bdf8";

    const costText = isScooterPad && pad.isCompleted
      ? "Dur veya [E]'ye bas"
      : pad.isCompleted
        ? "✓ TAMAMLANDI"
        : `[ ${currentFloor} / ${pad.targetCost} ₺ ]`;
    ctx.fillText(costText, w / 2, 64);

    // Alt Kısım: Mini İlerleme Çubuğu
    if (!pad.isCompleted) {
      const barX = 40;
      const barY = 114;
      const barW = w - 80;
      const barH = 14;
      const progress = Math.max(
        0,
        Math.min(1, pad.currentAmount / Math.max(1, pad.targetCost)),
      );

      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fillStyle = "#1e293b";
      ctx.fill();

      if (progress > 0) {
        ctx.beginPath();
        ctx.roundRect(barX, barY, Math.max(12, barW * progress), barH, 7);
        ctx.fillStyle = isTransferring ? "#39ff14" : "#00f0ff";
        ctx.fill();
      }
    }

    texture.needsUpdate = true;
  }

  // Başlangıç çizimi
  renderLabel(initialPad, false);

  let time = 0;
  let prevLevel = initialPad.level;

  return {
    group,
    update(pad: BuyPad, dt: number, isTransferring = false) {
      time += dt;

      // Pozisyon senkronu
      group.position.set(pad.position.x, 0, pad.position.z);

      // Seviye atlandığında tamamlama dalgasını tetikle
      if (pad.level > prevLevel) {
        prevLevel = pad.level;
        waveProgress = 0;
      }

      // Neon taban nefes alma animasyonu
      const pulseSpeed = isTransferring ? 8 : 3;
      const pulse = Math.sin(time * pulseSpeed);
      outerRingMat.opacity = isTransferring
        ? 0.85 + 0.15 * pulse
        : 0.65 + 0.2 * pulse;
      const scaleMultiplier = isTransferring ? 1 + 0.02 * pulse : 1.0;
      outerRing.scale.set(scaleMultiplier, scaleMultiplier, 1);

      // Renk durumu
      if (pad.isCompleted) {
        outerRingMat.color.set("#38ef7d");
        innerDiscMat.color.set("#22c55e");
        fillMat.color.set("#38ef7d");
      } else if (isTransferring) {
        outerRingMat.color.set("#39ff14");
        innerDiscMat.color.set("#39ff14");
        fillMat.color.set("#ffea00");
      } else {
        outerRingMat.color.set("#00f0ff");
        innerDiscMat.color.set("#00d2ff");
        fillMat.color.set("#39ff14");
      }

      // Dolum çemberi güncellemesi
      const progress = pad.isCompleted
        ? 1.0
        : pad.currentAmount / Math.max(1, pad.targetCost);
      updateFillRing(progress);

      // Uçuşan para parçacıkları animasyonu
      if (isTransferring && !pad.isCompleted) {
        coinsGroup.visible = true;
        for (let i = 0; i < COIN_COUNT; i++) {
          const coin = coinMeshes[i];
          const info = coinOffsets[i];
          info.y += dt * info.speed;
          if (info.y > 2.2) {
            info.y = 0.2;
            info.angle = Math.random() * Math.PI * 2;
          }
          coin.visible = true;
          const currentRadius = radius * 0.65 * (1 - info.y / 2.5);
          coin.position.x = Math.cos(info.angle + time * 2) * currentRadius;
          coin.position.z = Math.sin(info.angle + time * 2) * currentRadius;
          coin.position.y = info.y;
          coin.rotation.y = time * 5 + i;
          coin.rotation.x = time * 3;
        }
      } else {
        coinsGroup.visible = false;
      }

      // Tamamlanma genişleme dalgası
      if (waveProgress < 1.0) {
        waveProgress += dt * 1.5;
        const waveScale = 1.0 + waveProgress * 0.7;
        waveMesh.scale.set(waveScale, waveScale, 1);
        waveMat.opacity = Math.max(0, (1 - waveProgress) * 0.8);
        waveMesh.visible = true;
      } else {
        waveMesh.visible = false;
      }

      // 3D Yüzen etiket hover ve çizim güncellemesi
      if (sprite) {
        sprite.position.y = 2.8 + Math.sin(time * 2.2) * 0.12;
        renderLabel(pad, isTransferring);
      }
    },

    dispose() {
      outerRingGeo.dispose();
      outerRingMat.dispose();
      innerDiscGeo.dispose();
      innerDiscMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      fillGeo.dispose();
      fillMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      coinGeo.dispose();
      coinMat.dispose();
      if (texture) texture.dispose();
      if (sprite) (sprite.material as THREE.Material).dispose();

      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
    },
  };
}

/**
 * Birden fazla BuyPad için 3D görsel yöneticisi.
 */
export function createBuyPadsView(initialPads: BuyPad[] = []): BuyPadsView {
  const group = new THREE.Group();
  const visualMap = new Map<string, BuyPadVisual>();

  function sync(pads: BuyPad[]) {
    const currentIds = new Set(pads.map((p) => p.id));

    // Kaldırılanları temizle
    for (const [id, visual] of visualMap.entries()) {
      if (!currentIds.has(id)) {
        group.remove(visual.group);
        visual.dispose();
        visualMap.delete(id);
      }
    }

    // Yeni olanları ekle
    for (const pad of pads) {
      if (!visualMap.has(pad.id)) {
        const visual = createBuyPadVisual(pad);
        group.add(visual.group);
        visualMap.set(pad.id, visual);
      }
    }
  }

  sync(initialPads);

  return {
    group,
    update(pads: BuyPad[], dt: number, activePadId: string | null = null) {
      sync(pads);
      for (const pad of pads) {
        const visual = visualMap.get(pad.id);
        if (visual) {
          const isTransferring = activePadId === pad.id;
          visual.update(pad, dt, isTransferring);
        }
      }
    },
    dispose() {
      for (const visual of visualMap.values()) {
        visual.dispose();
      }
      visualMap.clear();
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
    },
  };
}
