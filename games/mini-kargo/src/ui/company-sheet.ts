import type { CompanyProgression, Courier } from "../platform/storage";
import {
  canPurchaseUpgrade,
  upgradeCost,
  upgradeLabel,
  type UpgradeKind,
} from "../game/upgrades";
import {
  canHireCourier,
  courierHireCost,
  generateCourierCandidate,
} from "../game/company";

export type CompanySheetActions = {
  onStartShift(): void;
  onBuyUpgrade(kind: UpgradeKind): void;
  onHireCourier(candidate: Courier): void;
  onClaimOffline(): void;
};

export type CompanySheetInstance = {
  element: HTMLElement;
  show(): void;
  hide(): void;
  isVisible(): boolean;
  update(progression: CompanyProgression): void;
  dispose(): void;
};

type TabId = "overview" | "garage" | "couriers";

export function createCompanySheet(
  root: HTMLElement,
  actions: CompanySheetActions,
): CompanySheetInstance {
  const element = document.createElement("div");
  element.className = "sheet company-sheet";
  element.setAttribute("aria-label", "Şirket Yönetim Merkezi");

  element.innerHTML = `
    <div class="company-card">
      <header class="company-header">
        <div class="company-brand">
          <span class="company-logo">📦</span>
          <div>
            <h1>Mini Kargo A.Ş.</h1>
            <small>MERKEZ OFİS & LOJİSTİK YÖNETİMİ</small>
          </div>
        </div>
        <div class="company-stats-pill">
          <div class="stat-item"><span class="stat-label">ŞİRKET</span><b id="comp-level">Sv. 1</b></div>
          <div class="stat-item"><span class="stat-label">İTİBAR</span><b id="comp-rep">⭐ 0</b></div>
          <div class="stat-item treasury"><span class="stat-label">KASA</span><strong id="comp-treasury">0 ₺</strong></div>
        </div>
      </header>

      <nav class="company-tabs" role="tablist">
        <button class="tab-button active" data-tab="overview" role="tab">🏢 Genel Bakış</button>
        <button class="tab-button" data-tab="garage" role="tab">🔧 Garaj</button>
        <button class="tab-button" data-tab="couriers" role="tab">👥 Kadro (<span id="courier-badge">0</span>)</button>
      </nav>

      <main class="tab-content">
        <!-- 1. GENEL BAKIŞ -->
        <section class="tab-pane active" id="pane-overview">
          <div class="overview-grid">
            <div class="summary-card">
              <span class="eyebrow">GÜNLÜK LOJİSTİK ÖZETİ</span>
              <div class="summary-numbers">
                <div><span>Teslim Edilen</span><strong id="summary-deliveries">0</strong></div>
                <div><span>Aktif Filo</span><strong id="summary-fleet">0 Kurye</strong></div>
                <div><span>En Yüksek Tur</span><strong id="summary-best-score">0</strong></div>
              </div>
            </div>

            <div class="offline-card" id="offline-card">
              <div class="offline-badge">⚡ PASİF GELİR</div>
              <h3>Kurye Vardiyası Kazancı</h3>
              <p id="offline-desc">Sen yokken kuryelerin teslimat yaptı.</p>
              <div class="offline-action-row">
                <strong id="offline-amount">+0 ₺</strong>
                <button class="primary-button btn-claim" id="btn-claim">💰 Kasayı Topla</button>
              </div>
            </div>
          </div>

          <div class="shift-cta-box">
            <button class="primary-button btn-shift" id="btn-start-shift">
              <span>🚚 VARDİYAYA ÇIK (SÜRÜŞE BAŞLA)</span>
              <small>Mahallenin yeni kargolarını bizzat teslim et →</small>
            </button>
          </div>
        </section>

        <!-- 2. GARAJ -->
        <section class="tab-pane" id="pane-garage" hidden>
          <div class="garage-intro">
            <h3>Araç Atölyesi</h3>
            <p>Kendi kargo aracını geliştir; hızlan, savrulmayı önle ve daha çok kargo taşı.</p>
          </div>
          <div class="garage-grid" id="garage-cards"></div>
        </section>

        <!-- 3. KADRO (KURYELER) -->
        <section class="tab-pane" id="pane-couriers" hidden>
          <div class="couriers-header">
            <div>
              <h3>Kurye Kadrosu</h3>
              <p>İşe aldığın kuryeler sen çevrimdışıyken sana pasif kazanç sağlar.</p>
            </div>
            <button class="secondary-button" id="btn-open-hire">➕ Yeni Kurye İşe Al</button>
          </div>

          <div class="hire-modal" id="hire-box" hidden>
            <div class="hire-card">
              <div class="hire-card-header">
                <span class="eyebrow">İŞ BAŞVURUSU</span>
                <button class="icon-button-sm" id="btn-close-hire">✕</button>
              </div>
              <h4 id="candidate-name">Burak Hızlı</h4>
              <div class="candidate-stats">
                <div><span>Seviye:</span> <b id="candidate-level">1</b></div>
                <div><span>Hız:</span> <b id="candidate-speed">%100</b></div>
                <div><span>Güvenilirlik:</span> <b id="candidate-reliability">%88</b></div>
                <div><span>Maaş:</span> <b id="candidate-wage">20 ₺/sa</b></div>
              </div>
              <div class="candidate-footer">
                <span class="hire-cost" id="candidate-cost">Maliyet: 250 ₺</span>
                <button class="primary-button btn-hire" id="btn-confirm-hire">İşe Al</button>
              </div>
            </div>
          </div>

          <div class="couriers-list" id="couriers-list"></div>
        </section>
      </main>
    </div>
  `;

  root.appendChild(element);

  let currentTab: TabId = "overview";
  let latestProgression: CompanyProgression | null = null;
  let currentCandidate: Courier | null = null;

  // TAB DEĞİŞİMİ
  const tabs = element.querySelectorAll<HTMLButtonElement>(".tab-button");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab as TabId;
      setTab(target);
    });
  });

  function setTab(tabId: TabId) {
    currentTab = tabId;
    tabs.forEach((t) => t.classList?.toggle("active", t.dataset.tab === tabId));
    element.querySelector("#pane-overview")?.toggleAttribute("hidden", tabId !== "overview");
    element.querySelector("#pane-garage")?.toggleAttribute("hidden", tabId !== "garage");
    element.querySelector("#pane-couriers")?.toggleAttribute("hidden", tabId !== "couriers");
    if (latestProgression) {
      renderTabContent(latestProgression);
    }
  }

  // AKSİYON DÜĞMELERİ
  const startBtn = element.querySelector<HTMLButtonElement>("#btn-start-shift");
  startBtn?.addEventListener("click", () => actions.onStartShift());

  const claimBtn = element.querySelector<HTMLButtonElement>("#btn-claim");
  claimBtn?.addEventListener("click", () => actions.onClaimOffline());

  const openHireBtn = element.querySelector<HTMLButtonElement>("#btn-open-hire");
  const closeHireBtn = element.querySelector<HTMLButtonElement>("#btn-close-hire");
  const hireBox = element.querySelector<HTMLElement>("#hire-box");
  const confirmHireBtn = element.querySelector<HTMLButtonElement>("#btn-confirm-hire");

  openHireBtn?.addEventListener("click", () => {
    if (!latestProgression) return;
    currentCandidate = generateCourierCandidate(
      latestProgression.companyLevel,
      (latestProgression.couriers || []).length,
    );
    showHireCandidate(currentCandidate, latestProgression);
    if (hireBox) hireBox.hidden = false;
  });

  closeHireBtn?.addEventListener("click", () => {
    if (hireBox) hireBox.hidden = true;
  });

  confirmHireBtn?.addEventListener("click", () => {
    if (currentCandidate) {
      actions.onHireCourier(currentCandidate);
      if (hireBox) hireBox.hidden = true;
      currentCandidate = null;
    }
  });

  function showHireCandidate(c: Courier, prog: CompanyProgression) {
    const nameEl = element.querySelector("#candidate-name");
    if (nameEl) nameEl.textContent = c.name;
    const levelEl = element.querySelector("#candidate-level");
    if (levelEl) levelEl.textContent = `Sv. ${c.level}`;
    const speedEl = element.querySelector("#candidate-speed");
    if (speedEl) speedEl.textContent = `%${Math.round(c.speed * 100)}`;
    const relEl = element.querySelector("#candidate-reliability");
    if (relEl) relEl.textContent = `%${Math.round(c.reliability * 100)}`;
    const wageEl = element.querySelector("#candidate-wage");
    if (wageEl) wageEl.textContent = `${c.wage} ₺/sa`;
    const cost = courierHireCost(c);
    const costEl = element.querySelector("#candidate-cost");
    if (costEl) costEl.textContent = `Maliyet: ${cost} ₺`;
    if (confirmHireBtn) confirmHireBtn.disabled = !canHireCourier(prog, c);
  }

  // RENDER GARAJ KARTLARI
  const UPGRADE_CONFIGS: {
    kind: UpgradeKind;
    icon: string;
    desc: string;
  }[] = [
    {
      kind: "engine",
      icon: "🚀",
      desc: "Maksimum hızı ve çekiş ivmesini artırır.",
    },
    {
      kind: "brakes",
      icon: "🛑",
      desc: "Fren mesafesini kısaltır, ani duruş sağlar.",
    },
    {
      kind: "grip",
      icon: "🛞",
      desc: "Virajlarda savrulmayı önler, lastik yol tutuşunu artırır.",
    },
    {
      kind: "cargo",
      icon: "📦",
      desc: "Kasayı genişletir; aynı anda 2 paket taşıyabilirsin.",
    },
    {
      kind: "nitro",
      icon: "⚡",
      desc: "Nitro turbo kapasitesini ve dolum hızını artırır.",
    },
  ];

  function renderGarage(prog: CompanyProgression) {
    const container = element.querySelector<HTMLElement>("#garage-cards")!;
    container.innerHTML = "";

    for (const cfg of UPGRADE_CONFIGS) {
      const level = prog.upgrades[cfg.kind] ?? 0;
      const cost = upgradeCost(cfg.kind, level);
      const canBuy = canPurchaseUpgrade(cfg.kind, level, prog.money);
      const isMax = cfg.kind === "cargo" && level >= 1;

      const card = document.createElement("div");
      card.className = "garage-card";
      card.innerHTML = `
        <div class="card-icon">${cfg.icon}</div>
        <div class="card-body">
          <div class="card-title-row">
            <h4>${upgradeLabel(cfg.kind)}</h4>
            <span class="level-badge">${isMax ? "MAKSİMUM" : `Sv. ${level}`}</span>
          </div>
          <p class="card-desc">${cfg.desc}</p>
          <div class="level-bars">
            ${Array.from({ length: 4 })
              .map(
                (_, i) =>
                  `<span class="bar ${i < level ? "filled" : ""}"></span>`,
              )
              .join("")}
          </div>
        </div>
        <div class="card-action">
          <button class="upgrade-btn" data-upgrade="${cfg.kind}" ${
            !canBuy || isMax ? "disabled" : ""
          }>
            ${isMax ? "TAMAMLANDI" : `Geliştir · ${cost} ₺`}
          </button>
        </div>
      `;

      card
        .querySelector("button")!
        .addEventListener("click", () => actions.onBuyUpgrade(cfg.kind));

      container.appendChild(card);
    }
  }

  // RENDER KURYELER
  function renderCouriers(prog: CompanyProgression) {
    const list = element.querySelector<HTMLElement>("#couriers-list")!;
    list.innerHTML = "";
    const couriers = prog.couriers || [];

    if (couriers.length === 0) {
      list.innerHTML = `
        <div class="empty-couriers">
          <span class="empty-icon">🛵</span>
          <h4>Henüz kuryen yok</h4>
          <p>Yeni bir kurye işe alarak sen oyunda yokken bile şirketin kasasını doldurmasını sağla!</p>
        </div>
      `;
      return;
    }

    for (const c of couriers) {
      const item = document.createElement("div");
      item.className = "courier-item";
      item.innerHTML = `
        <div class="courier-avatar">🛵</div>
        <div class="courier-info">
          <div class="courier-name-row">
            <strong>${c.name}</strong>
            <span class="courier-badge">Seviye ${c.level}</span>
          </div>
          <div class="courier-stats-row">
            <span>⚡ Hız: %${Math.round(c.speed * 100)}</span>
            <span>🛡️ Güven: %${Math.round(c.reliability * 100)}</span>
            <span>💸 Maaş: ${c.wage} ₺/sa</span>
          </div>
        </div>
        <div class="courier-status">
          <span class="status-dot"></span>
          <small>VARDİYADA</small>
        </div>
      `;
      list.appendChild(item);
    }
  }

  function renderTabContent(prog: CompanyProgression) {
    if (currentTab === "garage") {
      renderGarage(prog);
    } else if (currentTab === "couriers") {
      renderCouriers(prog);
    }
  }

  return {
    element,
    show() {
      element.hidden = false;
    },
    hide() {
      element.hidden = true;
    },
    isVisible() {
      return !element.hidden;
    },
    update(progression: CompanyProgression) {
      latestProgression = progression;

      // Header bilgileri
      const levelEl = element.querySelector("#comp-level");
      if (levelEl) levelEl.textContent = `Sv. ${progression.companyLevel}`;
      const repEl = element.querySelector("#comp-rep");
      if (repEl) repEl.textContent = `⭐ ${progression.reputation}`;
      const treasuryEl = element.querySelector("#comp-treasury");
      if (treasuryEl) treasuryEl.textContent = `${progression.money} ₺`;

      // Badge
      const count = (progression.couriers || []).length;
      const badgeEl = element.querySelector("#courier-badge");
      if (badgeEl) badgeEl.textContent = String(count);

      // Genel Bakış bilgileri
      const delEl = element.querySelector("#summary-deliveries");
      if (delEl) delEl.textContent = String(progression.completedDeliveries);
      const fleetEl = element.querySelector("#summary-fleet");
      if (fleetEl) fleetEl.textContent = `${count} Kurye`;
      const bestEl = element.querySelector("#summary-best-score");
      if (bestEl) bestEl.textContent = String(progression.bestScore);

      // Çevrimdışı Kazanç kartı
      const accum = progression.offlineEarningsAccumulated || 0;
      const offlineCard = element.querySelector<HTMLElement>("#offline-card");
      const offlineAmount = element.querySelector<HTMLElement>("#offline-amount");
      const offlineDesc = element.querySelector<HTMLElement>("#offline-desc");

      if (offlineAmount) offlineAmount.textContent = `+${accum} ₺`;
      if (offlineCard) {
        if (accum > 0) {
          offlineCard.classList.add("has-earnings");
          if (offlineDesc) offlineDesc.textContent = "Kuryelerin teslimatları tamamladı. Parayı hemen topla!";
          if (claimBtn) claimBtn.disabled = false;
        } else {
          offlineCard.classList.remove("has-earnings");
          if (offlineDesc) {
            offlineDesc.textContent =
              count > 0
                ? "Kuryelerin şehirde aktif çalışıyor. Biriken kazanç burada görünür."
                : "Henüz kuryen yok. Kadro sekmesinden kurye işe al!";
          }
          if (claimBtn) claimBtn.disabled = true;
        }
      }

      renderTabContent(progression);
    },
    dispose() {
      element.remove();
    },
  };
}
