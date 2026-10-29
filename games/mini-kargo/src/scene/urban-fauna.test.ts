import { describe, it, expect, vi } from "vitest";
import { createUrbanFauna } from "./urban-fauna";

describe("urban fauna system (T24)", () => {
  it("initializes four district animal species with authentic stats", () => {
    const mockSound = {
      seagullCry: vi.fn(),
      pigeonScatter: vi.fn(),
      catMeow: vi.fn(),
      dogBark: vi.fn(),
    };

    const fauna = createUrbanFauna(mockSound);
    expect(fauna.group).toBeDefined();

    const stats = fauna.getFaunaStats();
    expect(stats.seagulls).toBe(4);
    expect(stats.pigeons).toBe(8);
    expect(stats.cats).toBe(3);
    expect(stats.dogs).toBe(1);

    fauna.dispose();
  });

  it("updates seagulls in circular thermal flight and triggers coastal cries", () => {
    const mockSound = {
      seagullCry: vi.fn(),
      pigeonScatter: vi.fn(),
      catMeow: vi.fn(),
      dogBark: vi.fn(),
    };

    const fauna = createUrbanFauna(mockSound);

    // Sahil bölgesinde sürüş yapıldığında (x: 0, z: 75)
    for (let i = 0; i < 20; i++) {
      fauna.update(1.0, { x: 0, z: 75 }, 8.0);
    }

    expect(mockSound.seagullCry).toHaveBeenCalled();
    fauna.dispose();
  });

  it("triggers pigeon panic scatter and fluttering flight on vehicle proximity", () => {
    const mockSound = {
      seagullCry: vi.fn(),
      pigeonScatter: vi.fn(),
      catMeow: vi.fn(),
      dogBark: vi.fn(),
    };

    const fauna = createUrbanFauna(mockSound);

    // Çarşı meydanına (X: 50, Z: 50) hızla yaklaşma
    fauna.update(0.1, { x: 49.5, z: 46.5 }, 6.0);

    expect(mockSound.pigeonScatter).toHaveBeenCalled();
    fauna.dispose();
  });

  it("triggers prompt reaction across fauna when player honks", () => {
    const mockSound = {
      seagullCry: vi.fn(),
      pigeonScatter: vi.fn(),
      catMeow: vi.fn(),
      dogBark: vi.fn(),
    };

    const fauna = createUrbanFauna(mockSound);

    // Çarşı meydanında korna çalma
    fauna.onHonk({ x: 50, z: 50 });
    expect(mockSound.pigeonScatter).toHaveBeenCalled();

    // Sanayi lojistik kapısında (X: -44, Z: 18) korna çalma
    fauna.onHonk({ x: -44, z: 18 });
    expect(mockSound.dogBark).toHaveBeenCalled();

    // Güneş Mahallesi kedi yakınında (X: -42, Z: -57) korna çalma
    fauna.onHonk({ x: -42, z: -57 });
    expect(mockSound.catMeow).toHaveBeenCalled();

    fauna.dispose();
  });

  it("animates cat head tracking toward player vehicle in Güneş Mahallesi", () => {
    const fauna = createUrbanFauna();

    // Kedi 0 koordinatları: -42.8, -57.5
    // Araç yaklaştığında kafa açısı güncellenmeli
    fauna.update(0.2, { x: -40.0, z: -55.0 }, 2.0);

    // Temizleme testi
    fauna.dispose();
    expect(fauna.group.children.length).toBe(0);
  });

  it("supports feeding interactions with cats, Karabaş and pigeons when treat is available", () => {
    const mockSound = {
      catPurr: vi.fn(),
      dogBark: vi.fn(),
    };
    const fauna = createUrbanFauna(mockSound);

    // 1. Kedi yakınında (X: -42.8, Z: -57.5) durunca tespit
    const catProx = fauna.checkFeedingProximity({ x: -42.0, z: -57.0 }, 0.5, true);
    expect(catProx).not.toBeNull();
    expect(catProx?.animalType).toBe("cat");

    // Besleme işlemi
    const catFeedRes = fauna.feedAnimal("cat", { x: -42.0, z: -57.0 });
    expect(catFeedRes.repBonus).toBe(1);
    expect(mockSound.catPurr).toHaveBeenCalled();

    // 2. Karabaş yakınında (X: -44, Z: 18) durunca tespit
    const dogProx = fauna.checkFeedingProximity({ x: -43.5, z: 18.0 }, 0.4, true);
    expect(dogProx).not.toBeNull();
    expect(dogProx?.animalType).toBe("dog");

    const dogFeedRes = fauna.feedAnimal("dog");
    expect(dogFeedRes.repBonus).toBe(1);
    expect(mockSound.dogBark).toHaveBeenCalled();

    // 3. Meydan güvercinleri yakınında (X: 50, Z: 50)
    const pigeonProx = fauna.checkFeedingProximity({ x: 50.5, z: 50.5 }, 0.5, true);
    expect(pigeonProx).not.toBeNull();
    expect(pigeonProx?.animalType).toBe("pigeons");

    const pigeonFeedRes = fauna.feedAnimal("pigeons");
    expect(pigeonFeedRes.cashBonus).toBe(5);

    fauna.dispose();
  });
});
