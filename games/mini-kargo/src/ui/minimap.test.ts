import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  worldToMinimap,
  isDistrictLocked,
  createMinimap,
  DEFAULT_BOUNDS,
} from "./minimap";

class MockDOMElement {
  children: MockDOMElement[] = [];
  className = "";
  width = 0;
  height = 0;
  attributes: Record<string, string> = {};
  parent: MockDOMElement | null = null;

  setAttribute(name: string, val: string) {
    this.attributes[name] = val;
  }
  appendChild(child: MockDOMElement) {
    this.children.push(child);
    child.parent = this;
    return child;
  }
  contains(child: MockDOMElement): boolean {
    return this.children.includes(child);
  }
  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
  }
  getContext(type: string) {
    if (type === "2d") {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        closePath: vi.fn(),
      };
    }
    return null;
  }
}

describe("Minimap", () => {
  beforeEach(() => {
    const doc = {
      createElement: (tag: string) => {
        const el = new MockDOMElement();
        if (tag === "canvas") {
          el.width = 105;
          el.height = 105;
        }
        return el;
      },
    };
    vi.stubGlobal("document", doc);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("worldToMinimap projection", () => {
    it("harita merkezini canvas merkezine eşler", () => {
      const pos = worldToMinimap(0, 0, 100, DEFAULT_BOUNDS);
      expect(pos.x).toBeCloseTo(50);
      expect(pos.y).toBeCloseTo(50);
    });

    it("harita sınırlarını doğru piksel sınırlarına eşler", () => {
      // Sol üst (-100, -100)
      const topLeft = worldToMinimap(-100, -100, 105, DEFAULT_BOUNDS);
      expect(topLeft.x).toBeCloseTo(0);
      expect(topLeft.y).toBeCloseTo(0);

      // Sağ alt (100, 100)
      const bottomRight = worldToMinimap(100, 100, 105, DEFAULT_BOUNDS);
      expect(bottomRight.x).toBeCloseTo(105);
      expect(bottomRight.y).toBeCloseTo(105);
    });

    it("depo koordinatını (-40, -40) orantılı olarak dönüştürür", () => {
      // (-40 - (-100)) / 200 = 60 / 200 = 0.3
      const depot = worldToMinimap(-40, -40, 100, DEFAULT_BOUNDS);
      expect(depot.x).toBeCloseTo(30);
      expect(depot.y).toBeCloseTo(30);
    });

    it("özel sınırlar (custom bounds) ile doğru çalışır", () => {
      const customBounds = { minX: 0, maxX: 50, minZ: 0, maxZ: 50 };
      const point = worldToMinimap(25, 25, 200, customBounds);
      expect(point.x).toBeCloseTo(100);
      expect(point.y).toBeCloseTo(100);
    });
  });

  describe("isDistrictLocked", () => {
    it("Güneş Mahallesi (sunny) seviye 1'de her zaman açıktır", () => {
      expect(isDistrictLocked("sunny", 1)).toBe(false);
      expect(isDistrictLocked("sunny", 2)).toBe(false);
    });

    it("Çarşı Bölgesi (market) seviye 1'de kilitli, seviye 2'de açıktır", () => {
      expect(isDistrictLocked("market", 1)).toBe(true);
      expect(isDistrictLocked("market", 2)).toBe(false);
      expect(isDistrictLocked("market", 3)).toBe(false);
    });

    it("Sanayi Bölgesi (industrial) seviye 1 ve 2'de kilitli, seviye 3'te açıktır", () => {
      expect(isDistrictLocked("industrial", 1)).toBe(true);
      expect(isDistrictLocked("industrial", 2)).toBe(true);
      expect(isDistrictLocked("industrial", 3)).toBe(false);
    });

    it("Sahil Şeridi (coastal) seviye 3'e kadar kilitli, seviye 4'te açıktır", () => {
      expect(isDistrictLocked("coastal", 1)).toBe(true);
      expect(isDistrictLocked("coastal", 3)).toBe(true);
      expect(isDistrictLocked("coastal", 4)).toBe(false);
      expect(isDistrictLocked("coastal", 5)).toBe(false);
    });
  });

  describe("createMinimap lifecycle and DOM", () => {
    it("container ve canvas elementlerini doğru özelliklerle oluşturur", () => {
      const root = new MockDOMElement() as unknown as HTMLElement;
      const minimap = createMinimap(root, { size: 105 });

      expect(minimap.container).toBeDefined();
      expect(minimap.canvas).toBeDefined();
      expect(minimap.canvas.width).toBe(105);
      expect(minimap.canvas.height).toBe(105);
      expect((root as unknown as MockDOMElement).contains(minimap.container as unknown as MockDOMElement)).toBe(true);
      expect((minimap.container as unknown as MockDOMElement).contains(minimap.canvas as unknown as MockDOMElement)).toBe(true);
    });

    it("update çağrısı güvenle çalışır ve hata vermez", () => {
      const root = new MockDOMElement() as unknown as HTMLElement;
      const minimap = createMinimap(root, {
        depot: { x: -40, z: -40 },
        homes: [{ x: 10, z: 20 }],
      });

      expect(() => {
        minimap.update(
          { x: 0, z: 0 },
          0,
          { x: -40, z: -40 },
          "delivering",
          1,
          0.016,
        );
      }).not.toThrow();
    });

    it("dispose çağrıldığında container DOM'dan temizlenir", () => {
      const root = new MockDOMElement() as unknown as HTMLElement;
      const minimap = createMinimap(root);

      expect((root as unknown as MockDOMElement).contains(minimap.container as unknown as MockDOMElement)).toBe(true);
      minimap.dispose();
      expect((root as unknown as MockDOMElement).contains(minimap.container as unknown as MockDOMElement)).toBe(false);
    });
  });
});
