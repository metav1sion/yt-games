import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createCompanySheet } from "./company-sheet";
import type { CompanyProgression } from "../platform/storage";
import { defaultUpgrades } from "../game/upgrades";

class MockElement {
  children: MockElement[] = [];
  className = "";
  private _html = "";
  hidden = false;
  attributes: Record<string, string> = {};
  parent: MockElement | null = null;
  dataset: Record<string, string> = {};
  textContent: string | null = "";
  listeners: Record<string, ((e: unknown) => void)[]> = {};
  classList = {
    classes: new Set<string>(),
    add: (c: string) => this.classList.classes.add(c),
    remove: (c: string) => this.classList.classes.delete(c),
    toggle: (c: string, force?: boolean) => {
      if (force !== undefined) {
        if (force) this.classList.classes.add(c);
        else this.classList.classes.delete(c);
        return force;
      }
      if (this.classList.classes.has(c)) {
        this.classList.classes.delete(c);
        return false;
      }
      this.classList.classes.add(c);
      return true;
    },
    contains: (c: string) => this.classList.classes.has(c),
  };

  get innerHTML(): string {
    return this._html;
  }

  set innerHTML(html: string) {
    this._html = html;
    this.children = [];

    // id özniteliklerini MockElement olarak çocuklara ekle
    const idMatches = html.matchAll(/id=["']([^"']+)["']/g);
    for (const match of idMatches) {
      const el = new MockElement();
      el.attributes["id"] = match[1];
      this.children.push(el);
      el.parent = this;
    }

    // tab butonlarını ekle
    const tabMatches = html.matchAll(/data-tab=["']([^"']+)["']/g);
    for (const tm of tabMatches) {
      const btn = new MockElement();
      btn.className = "tab-button";
      btn.dataset.tab = tm[1];
      this.children.push(btn);
      btn.parent = this;
    }
  }

  setAttribute(name: string, val: string) {
    this.attributes[name] = val;
  }
  toggleAttribute(name: string, force?: boolean): boolean {
    const has = force !== undefined ? force : !this.attributes[name];
    if (has) this.attributes[name] = "";
    else delete this.attributes[name];
    if (name === "hidden") this.hidden = has;
    return has;
  }
  appendChild(child: MockElement) {
    this.children.push(child);
    child.parent = this;
    return child;
  }
  addEventListener(event: string, handler: (e: unknown) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  removeEventListener(event: string, handler: (e: unknown) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
    }
  }
  click() {
    if (this.listeners["click"]) {
      this.listeners["click"].forEach((h) => h({ currentTarget: this }));
    }
  }
  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
  }
  querySelector(sel: string): MockElement | null {
    if (sel.startsWith("#")) {
      const id = sel.slice(1);
      return this.find((el) => el.attributes["id"] === id);
    }
    if (sel.startsWith(".")) {
      const cls = sel.slice(1);
      return this.find((el) => el.className.split(" ").includes(cls));
    }
    return null;
  }
  querySelectorAll(sel: string): MockElement[] {
    const matches: MockElement[] = [];
    this.findAll(sel, matches);
    return matches;
  }
  private find(predicate: (el: MockElement) => boolean): MockElement | null {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const res = child.find(predicate);
      if (res) return res;
    }
    return null;
  }
  private findAll(sel: string, out: MockElement[]) {
    if (sel.startsWith(".") && this.className.split(" ").includes(sel.slice(1))) {
      out.push(this);
    }
    for (const child of this.children) {
      child.findAll(sel, out);
    }
  }
}

describe("CompanySheet Component", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      createElement: () => new MockElement(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockProgression: CompanyProgression = {
    bestScore: 2500,
    soundEnabled: true,
    money: 1200,
    reputation: 8,
    companyLevel: 3,
    completedDeliveries: 35,
    upgrades: defaultUpgrades(),
    lastPlayedTimestamp: Date.now(),
    offlineEarningsAccumulated: 450,
    couriers: [
      {
        id: "c1",
        name: "Ali Can",
        level: 2,
        speed: 1.1,
        reliability: 0.9,
        wage: 25,
        assigned: true,
      },
    ],
  };

  it("oluşturulduğunda element yapısını ve arayüzü hazırlar", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const actions = {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    };

    const sheet = createCompanySheet(root, actions);
    expect(sheet.element).toBeDefined();
    expect(sheet.isVisible()).toBe(true);

    sheet.hide();
    expect(sheet.isVisible()).toBe(false);

    sheet.show();
    expect(sheet.isVisible()).toBe(true);
  });

  it("update çağrısıyla bakiye ve istatistikler güncellenir", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const actions = {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    };

    const sheet = createCompanySheet(root, actions);
    expect(() => sheet.update(mockProgression)).not.toThrow();
  });

  it("Vardiyaya Çık tıklandığında onStartShift tetiklenir", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const actions = {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    };

    const sheet = createCompanySheet(root, actions);
    const mockEl = sheet.element as unknown as MockElement;
    const startBtn = mockEl.querySelector("#btn-start-shift");

    expect(startBtn).toBeDefined();
    startBtn?.click();
    expect(actions.onStartShift).toHaveBeenCalledTimes(1);
  });

  it("Kasayı Topla tıklandığında onClaimOffline tetiklenir", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const actions = {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    };

    const sheet = createCompanySheet(root, actions);
    const mockEl = sheet.element as unknown as MockElement;
    const claimBtn = mockEl.querySelector("#btn-claim");

    expect(claimBtn).toBeDefined();
    claimBtn?.click();
    expect(actions.onClaimOffline).toHaveBeenCalledTimes(1);
  });

  it("dispose çağrıldığında DOM temizlenir", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const sheet = createCompanySheet(root, {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    });

    sheet.dispose();
    expect((root as unknown as MockElement).children).toHaveLength(0);
  });

  it("bölge seçici açık bölgeleri seçilebilir, kilitlileri devre dışı gösterir ve seçimi bildirir", () => {
    const root = new MockElement() as unknown as HTMLElement;
    const onSelectDistrict = vi.fn();
    const sheet = createCompanySheet(root, {
      onStartShift: vi.fn(),
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
      onSelectDistrict,
    });
    sheet.update({ ...mockProgression, companyLevel: 2 });
    const picker = sheet.element.querySelector("#district-picker") as unknown as MockElement;
    expect(picker.innerHTML).toContain('data-district="market"');
    expect(picker.innerHTML).toMatch(/data-district="industrial" disabled/);
    expect(picker.innerHTML).toMatch(/data-district="coastal" disabled/);
    expect(picker.innerHTML).not.toMatch(/data-district="market" disabled/);
    // Varsayılan vurgu: seviyedeki en son bölge
    expect(picker.innerHTML).toMatch(/district-chip active[^>]*data-district="market"/);

    const chip = (id: string, disabled = false) => ({
      closest: () => ({ dataset: { district: id }, hasAttribute: () => disabled }),
    });
    picker.listeners["click"][0]({ target: chip("industrial", true) });
    expect(onSelectDistrict).not.toHaveBeenCalled();
    picker.listeners["click"][0]({ target: chip("sunny") });
    expect(onSelectDistrict).toHaveBeenCalledWith("sunny");
    expect(picker.innerHTML).toMatch(/district-chip active[^>]*data-district="sunny"/);
  });
});
