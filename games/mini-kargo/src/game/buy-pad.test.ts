import { describe, it, expect, vi } from "vitest";
import {
  createBuyPad,
  updateBuyPads,
  type BuyPad,
} from "./buy-pad";
import {
  createDistrictBuyPads,
  DISTRICT_BUY_PAD_DEFS,
} from "../scene/district-barriers";

describe("BuyPad System Logic", () => {
  it("initializes a BuyPad with correct default values", () => {
    const pad = createBuyPad({
      id: "depot-expand",
      name: "Depo Genişletme",
      position: { x: 10, z: 20 },
      targetCost: 200,
    });

    expect(pad.id).toBe("depot-expand");
    expect(pad.name).toBe("Depo Genişletme");
    expect(pad.position).toEqual({ x: 10, z: 20 });
    expect(pad.radius).toBe(3.0);
    expect(pad.targetCost).toBe(200);
    expect(pad.currentAmount).toBe(0);
    expect(pad.level).toBe(0);
    expect(pad.maxLevel).toBe(3);
    expect(pad.isCompleted).toBe(false);
  });

  describe("Distance & Proximity Detection", () => {
    it("drains money when player is within radius of the pad", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Yakıt İstasyonu",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 300,
      });

      // Player at distance 2.0 (inside radius 3.0), standing still (speed 0)
      const res = updateBuyPads([pad], { x: 0, z: 2 }, 100, 0.5);

      // Drain rate default is 120 ₺/s, for 0.5s -> 60 ₺
      expect(res.spentMoney).toBeCloseTo(60, 2);
      expect(res.remainingMoney).toBeCloseTo(40, 2);
      expect(pad.currentAmount).toBeCloseTo(60, 2);
      expect(res.activePad?.id).toBe("pad-1");
      expect(res.events).toHaveLength(1);
      expect(res.events[0]).toMatchObject({
        type: "deposit",
        padId: "pad-1",
        amount: expect.closeTo(60, 2),
      });
    });

    it("does not drain money when player is outside radius", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Depo",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 300,
      });

      // Player at distance 4.0 (outside radius 3.0)
      const res = updateBuyPads([pad], { x: 4, z: 0 }, 100, 1.0);

      expect(res.spentMoney).toBe(0);
      expect(res.remainingMoney).toBe(100);
      expect(pad.currentAmount).toBe(0);
      expect(res.activePad).toBeNull();
      expect(res.events).toHaveLength(0);
    });

    it("selects the closest pad when multiple pads are nearby", () => {
      const pad1 = createBuyPad({
        id: "pad-1",
        name: "Pad 1",
        position: { x: 2, z: 0 },
        radius: 4.0,
        targetCost: 100,
      });
      const pad2 = createBuyPad({
        id: "pad-2",
        name: "Pad 2",
        position: { x: 0.5, z: 0 },
        radius: 4.0,
        targetCost: 100,
      });

      const res = updateBuyPads([pad1, pad2], { x: 0, z: 0 }, 100, 0.5);

      // pad2 is at distance 0.5, pad1 is at 2.0 -> pad2 is closer
      expect(res.activePad?.id).toBe("pad-2");
      expect(pad2.currentAmount).toBeGreaterThan(0);
      expect(pad1.currentAmount).toBe(0);
    });
  });

  describe("Vehicle Speed Threshold", () => {
    it("does not drain money when player moves at or above speed threshold (>= 2.0)", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Hızlı Geçiş",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 300,
      });

      // Speed 2.5 (>= 2.0)
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0, 2.5);

      expect(res.spentMoney).toBe(0);
      expect(res.remainingMoney).toBe(100);
      expect(pad.currentAmount).toBe(0);
      expect(res.activePad?.id).toBe("pad-1");
      expect(res.events).toHaveLength(0);
    });

    it("drains money when vehicle is slow (< 2.0)", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Yavaş Geçiş",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 300,
      });

      // Speed 1.2 (< 2.0)
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 0.25, 1.2);

      expect(res.spentMoney).toBeCloseTo(30, 2); // 120 * 0.25 = 30
      expect(res.remainingMoney).toBeCloseTo(70, 2);
      expect(pad.currentAmount).toBeCloseTo(30, 2);
    });

    it("respects speed passed via options object", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Ayar Testi",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 300,
      });

      const fastRes = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0, {
        playerSpeed: 3.0,
      });
      expect(fastRes.spentMoney).toBe(0);

      const slowRes = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0, {
        playerSpeed: 0.5,
      });
      expect(slowRes.spentMoney).toBe(100); // 120 dt=1.0 capped by money 100
    });
  });

  describe("Balance & Insufficient Money Handling", () => {
    it("drains only available player money when balance is less than drain amount", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Kasa Testi",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 500,
      });

      // Player has only 25 ₺, drain for 1s would be 120 ₺
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 25, 1.0);

      expect(res.spentMoney).toBe(25);
      expect(res.remainingMoney).toBe(0);
      expect(pad.currentAmount).toBe(25);
      expect(pad.isCompleted).toBe(false);
    });

    it("does not drain when player has 0 balance", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Sıfır Bakiye",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 500,
        currentAmount: 50,
      });

      const res = updateBuyPads([pad], { x: 0, z: 0 }, 0, 1.0);

      expect(res.spentMoney).toBe(0);
      expect(res.remainingMoney).toBe(0);
      expect(pad.currentAmount).toBe(50);
      expect(res.activePad?.id).toBe("pad-1");
      expect(res.events).toHaveLength(0);
    });

    it("custom drain rate is respected", () => {
      const pad = createBuyPad({
        id: "pad-1",
        name: "Hızlı Akış",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 500,
      });

      const res = updateBuyPads([pad], { x: 0, z: 0 }, 500, 1.0, {
        drainRate: 250,
      });

      expect(res.spentMoney).toBe(250);
      expect(res.remainingMoney).toBe(250);
      expect(pad.currentAmount).toBe(250);
    });
  });

  describe("Target Cost Reached & onComplete Trigger", () => {
    it("caps spent money to remaining needed amount and triggers onComplete", () => {
      const onCompletePad = vi.fn();
      const onCompleteOption = vi.fn();

      const pad = createBuyPad({
        id: "depot-expand",
        name: "Depo Genişletme",
        position: { x: 0, z: 0 },
        radius: 3.0,
        targetCost: 100,
        currentAmount: 80,
        level: 0,
        maxLevel: 2,
        onComplete: onCompletePad,
      });

      // Needs 20 ₺ to finish, player has 200 ₺, 1s drain = 120 ₺
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 200, 1.0, {
        onComplete: onCompleteOption,
      });

      // Should only drain 20 ₺, leaving 180 ₺
      expect(res.spentMoney).toBe(20);
      expect(res.remainingMoney).toBe(180);

      // onComplete callbacks should have been invoked
      expect(onCompletePad).toHaveBeenCalledTimes(1);
      expect(onCompletePad).toHaveBeenCalledWith(pad);
      expect(onCompleteOption).toHaveBeenCalledTimes(1);
      expect(onCompleteOption).toHaveBeenCalledWith(pad);

      // Level should increment
      expect(pad.level).toBe(1);
      // Since level 1 < maxLevel 2, pad is not yet fully completed
      expect(pad.isCompleted).toBe(false);
      // currentAmount should reset for the next level
      expect(pad.currentAmount).toBe(0);
      // targetCost should increase for level 1 (default 1.5x)
      expect(pad.targetCost).toBe(150);

      // Events should have both deposit and complete
      const completeEvent = res.events.find((e) => e.type === "complete");
      expect(completeEvent).toBeDefined();
      expect(completeEvent).toMatchObject({
        type: "complete",
        padId: "depot-expand",
        level: 1,
        maxLevel: 2,
        isMaxLevel: false,
        nextCost: 150,
      });
    });

    it("uses custom getNextCost formula when provided", () => {
      const pad = createBuyPad({
        id: "custom-cost",
        name: "Özel Maliyet",
        position: { x: 0, z: 0 },
        targetCost: 100,
        level: 0,
        maxLevel: 3,
        getNextCost: (lvl) => (lvl + 1) * 200,
      });

      updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0);

      expect(pad.level).toBe(1);
      expect(pad.targetCost).toBe(400); // (1 + 1) * 200
    });

    it("marks pad as isCompleted when maxLevel is reached", () => {
      const pad = createBuyPad({
        id: "final-pad",
        name: "Son Aşama",
        position: { x: 0, z: 0 },
        targetCost: 50,
        currentAmount: 0,
        level: 1,
        maxLevel: 2,
      });

      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0);

      expect(pad.level).toBe(2);
      expect(pad.isCompleted).toBe(true);
      expect(pad.currentAmount).toBe(50);

      const completeEvent = res.events.find((e) => e.type === "complete");
      expect(completeEvent).toMatchObject({
        isMaxLevel: true,
      });
    });

    it("ignores completed pads on subsequent updates", () => {
      const pad = createBuyPad({
        id: "done-pad",
        name: "Tamamlanmış Ped",
        position: { x: 0, z: 0 },
        targetCost: 50,
        currentAmount: 50,
        level: 2,
        maxLevel: 2,
        isCompleted: true,
      });

      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0);

      expect(res.spentMoney).toBe(0);
      expect(res.remainingMoney).toBe(100);
      expect(res.activePad).toBeNull();
      expect(res.events).toHaveLength(0);
    });
  });

  describe("Depot Expansion BuyPads (Courier & Nitro Station)", () => {
    it("configures pad_hire_courier with correct position, name and progressive cost", () => {
      const courierPadCost = (lvl: number) => 280 + lvl * 120;
      let couriersCount = 0;

      const pad = createBuyPad({
        id: "pad_hire_courier",
        name: "👥 Kurye İstihdam Ofisi",
        position: { x: -44, z: -32 },
        targetCost: courierPadCost(couriersCount),
        level: couriersCount,
        maxLevel: 12,
        getNextCost: (lvl) => courierPadCost(lvl),
        onComplete: (completedPad) => {
          couriersCount = completedPad.level;
        },
      });

      expect(pad.id).toBe("pad_hire_courier");
      expect(pad.name).toBe("👥 Kurye İstihdam Ofisi");
      expect(pad.position).toEqual({ x: -44, z: -32 });
      expect(pad.targetCost).toBe(280);

      // 1. Kurye işe alımı
      const res1 = updateBuyPads([pad], { x: -44, z: -32 }, 500, 3.0); // 3 sn * 120 = 360 > 280
      expect(pad.level).toBe(1);
      expect(pad.targetCost).toBe(400); // 280 + 1 * 120 = 400
      expect(pad.currentAmount).toBe(0);
      expect(pad.isCompleted).toBe(false);

      // 2. Kurye işe alımı
      const res2 = updateBuyPads([pad], { x: -44, z: -32 }, 600, 4.0); // 4 sn * 120 = 480 > 400
      expect(pad.level).toBe(2);
      expect(pad.targetCost).toBe(520); // 280 + 2 * 120 = 520
    });

    it("configures pad_nitro_station with correct position, name and cost 200", () => {
      let nitroUpgraded = false;
      const pad = createBuyPad({
        id: "pad_nitro_station",
        name: "⚡ Hızlı Nitro İstasyonu",
        position: { x: -60, z: -24 },
        targetCost: 200,
        level: 0,
        maxLevel: 4,
        onComplete: (completedPad) => {
          nitroUpgraded = true;
          expect(completedPad.level).toBe(1);
        },
      });

      expect(pad.id).toBe("pad_nitro_station");
      expect(pad.name).toBe("⚡ Hızlı Nitro İstasyonu");
      expect(pad.position).toEqual({ x: -60, z: -24 });
      expect(pad.targetCost).toBe(200);

      const res = updateBuyPads([pad], { x: -60, z: -24 }, 300, 2.0); // 2 sn * 120 = 240 > 200
      expect(nitroUpgraded).toBe(true);
      expect(pad.level).toBe(1);
    });

    it("configures pad_unlock_scooter at x: -68, z: -32 with cost 450 and maxLevel 1", () => {
      let scooterUnlocked = false;
      const pad = createBuyPad({
        id: "pad_unlock_scooter",
        name: "🛵 Kurye Scooter'ı Aç",
        position: { x: -68, z: -32 },
        targetCost: 450,
        level: 0,
        maxLevel: 1,
        onComplete: (completedPad) => {
          scooterUnlocked = true;
          expect(completedPad.id).toBe("pad_unlock_scooter");
          expect(completedPad.level).toBe(1);
          expect(completedPad.isCompleted).toBe(true);
        },
      });

      expect(pad.id).toBe("pad_unlock_scooter");
      expect(pad.name).toBe("🛵 Kurye Scooter'ı Aç");
      expect(pad.position).toEqual({ x: -68, z: -32 });
      expect(pad.targetCost).toBe(450);
      expect(pad.maxLevel).toBe(1);
      expect(pad.isCompleted).toBe(false);

      // Player stands on the pad with 500 ₺ for 4 seconds (4s * 120 = 480 > 450)
      const res = updateBuyPads([pad], { x: -68, z: -32 }, 500, 4.0);
      expect(scooterUnlocked).toBe(true);
      expect(pad.level).toBe(1);
      expect(pad.isCompleted).toBe(true);
      expect(res.spentMoney).toBe(450);
      expect(res.remainingMoney).toBe(50);
    });
  });

  describe("District Unlock BuyPads (Market, Industrial, Coastal)", () => {
    it("defines 3 district BuyPads with correct IDs, names, positions and costs", () => {
      expect(DISTRICT_BUY_PAD_DEFS).toHaveLength(3);

      const marketDef = DISTRICT_BUY_PAD_DEFS.find((d) => d.id === "pad_unlock_market");
      expect(marketDef).toBeDefined();
      expect(marketDef?.name).toBe("🚧 Çarşı Bölgesi Giriş Kapısı");
      expect(marketDef?.position).toEqual({ x: 0, z: 12 });
      expect(marketDef?.targetCost).toBe(500);
      expect(marketDef?.maxLevel).toBe(1);

      const industrialDef = DISTRICT_BUY_PAD_DEFS.find((d) => d.id === "pad_unlock_industrial");
      expect(industrialDef).toBeDefined();
      expect(industrialDef?.name).toBe("🚧 Sanayi Bölgesi Giriş Kapısı");
      expect(industrialDef?.position).toEqual({ x: 12, z: 0 });
      expect(industrialDef?.targetCost).toBe(1000);
      expect(industrialDef?.maxLevel).toBe(1);

      const coastalDef = DISTRICT_BUY_PAD_DEFS.find((d) => d.id === "pad_unlock_coastal");
      expect(coastalDef).toBeDefined();
      expect(coastalDef?.name).toBe("🚧 Sahil Kordonu Giriş Kapısı");
      expect(coastalDef?.position).toEqual({ x: -12, z: 0 });
      expect(coastalDef?.targetCost).toBe(1800);
      expect(coastalDef?.maxLevel).toBe(1);
    });

    it("creates district pads as locked when neither level nor unlockedSet has them", () => {
      const pads = createDistrictBuyPads(() => false);
      expect(pads).toHaveLength(3);
      for (const pad of pads) {
        expect(pad.isCompleted).toBe(false);
        expect(pad.level).toBe(0);
        expect(pad.currentAmount).toBe(0);
      }
    });

    it("automatically marks pads completed if already unlocked by company level", () => {
      const unlockedDistricts = new Set(["sunny", "market"]);
      const pads = createDistrictBuyPads((id) => unlockedDistricts.has(id));

      const marketPad = pads.find((p) => p.id === "pad_unlock_market");
      const industrialPad = pads.find((p) => p.id === "pad_unlock_industrial");

      expect(marketPad?.isCompleted).toBe(true);
      expect(marketPad?.level).toBe(1);
      expect(marketPad?.currentAmount).toBe(500);

      expect(industrialPad?.isCompleted).toBe(false);
      expect(industrialPad?.level).toBe(0);
    });

    it("allows physical unlocking by pouring money into Çarşı barricade pad", () => {
      const onUnlock = vi.fn();
      const pads = createDistrictBuyPads(() => false, onUnlock);
      const marketPad = pads.find((p) => p.id === "pad_unlock_market")!;

      // 1. Oyuncu Çarşı barikatının önüne gider (x: 0, z: 12), para akmaya başlar
      const res1 = updateBuyPads([marketPad], { x: 0, z: 12 }, 300, 2.0); // 2 sn * 120 = 240 ₺
      expect(res1.spentMoney).toBe(240);
      expect(marketPad.currentAmount).toBe(240);
      expect(marketPad.isCompleted).toBe(false);
      expect(onUnlock).not.toHaveBeenCalled();

      // 2. Kalan parayı da akıtır (260 ₺ daha gerekir)
      const res2 = updateBuyPads([marketPad], { x: 0, z: 12 }, 600, 3.0); // 3 sn * 120 = 360 > 260
      expect(res2.spentMoney).toBe(260);
      expect(marketPad.currentAmount).toBe(500);
      expect(marketPad.isCompleted).toBe(true);
      expect(marketPad.level).toBe(1);
      expect(onUnlock).toHaveBeenCalledWith("market", marketPad);
    });

    it("allows physical unlocking for Sanayi (1000 ₺) and Sahil (1800 ₺)", () => {
      const onUnlock = vi.fn();
      const pads = createDistrictBuyPads(() => false, onUnlock);
      const industrialPad = pads.find((p) => p.id === "pad_unlock_industrial")!;
      const coastalPad = pads.find((p) => p.id === "pad_unlock_coastal")!;

      // Sanayi pedi (1000 ₺)
      updateBuyPads([industrialPad], { x: 12, z: 0 }, 1500, 10.0);
      expect(industrialPad.isCompleted).toBe(true);
      expect(onUnlock).toHaveBeenCalledWith("industrial", industrialPad);

      // Sahil pedi (1800 ₺)
      updateBuyPads([coastalPad], { x: -12, z: 0 }, 2000, 20.0);
      expect(coastalPad.isCompleted).toBe(true);
      expect(onUnlock).toHaveBeenCalledWith("coastal", coastalPad);
    });
  });
});
