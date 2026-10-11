import { packageInfo, type DeliveryState } from "../game/delivery";
import {
  canPurchaseUpgrade,
  upgradeCost,
  type UpgradeKind,
  type VehicleUpgrades,
} from "../game/upgrades";
export function createHud(
  root: HTMLElement,
  actions: {
    restart(): void;
    recover(): void;
    toggleSound(): void;
    buyUpgrade(kind: UpgradeKind): void;
  },
) {
  root.innerHTML = `<header class="topbar"><div class="brand"><span class="brand-icon">▣</span><div>mini kargo<small>MAHALLE TESLİMATLARI</small></div></div><span class="district" id="district-name">GÜNEŞ MAHALLESİ <i></i></span></header>
  <section class="task-card" aria-label="Aktif teslimat"><div class="task-heading"><span class="eyebrow">SIRADAKİ DURAK</span><span id="trip-count">01 / 03</span></div><div class="destination"><span class="destination-icon" id="nav-arrow">↑</span><div><h2 id="target-name">Kargo deposu</h2><p id="task-instruction">Paketini almak için alanda dur.</p></div></div><div class="loading-track"><span id="hold-progress"></span></div><div class="task-footer"><span id="distance">Depoda bekle</span><span class="package-status" id="package-status">▣ PAKET BEKLENİYOR</span></div></section>
  <section class="score-card"><div><span class="eyebrow">TUR PUANI</span><strong id="score">0</strong></div><div class="bonus-column"><span class="eyebrow">SÜRE BONUSU</span><strong id="timer">—</strong></div><div class="timer-track"><span id="timer-progress"></span></div></section>
  <div class="toolbar"><button id="sound" class="icon-button" aria-label="Sesi kapat" title="Ses"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="sound-waves" d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/><path class="sound-slash" d="M4 3l17 18"/></svg></button><button id="recover" class="recovery-button" title="Takılırsan depoya dön">↶ <span>Depoya dön</span></button></div>
  <div id="joystick" role="group" aria-label="Sürüş joystick"><span class="stick-ring"></span><span class="stick-knob"></span></div><div class="control-hint">W/S gaz-fren · A/D direksiyon · Space el freni · Shift nitro</div><div class="nitro-bar" aria-label="Nitro"><span class="eyebrow">NİTRO</span><div class="nitro-track"><span id="nitro-fill"></span></div></div>
  <div class="sheet welcome" id="welcome"><div class="intro-card"><span class="eyebrow">KÜÇÜK ARABA. BÜYÜK İŞLER.</span><h1>Mahallenin<br>yeni kargocusu.</h1><p>Paketini al, sokaklara çık.<br>Üç teslimatla mahalleyi mutlu et.</p><div class="intro-rules"><span><b>01</b> Depodan paket al</span><span><b>02</b> İşaretli evde dur</span><span><b>03</b> Hızlı teslim et, bonus kazan</span></div><button class="primary-button" id="start">Hadi yola çık <span>→</span></button><small class="intro-controls">WASD / OK TUŞLARI · MOBİLDE JOYSTICK</small></div></div>
  <div class="sheet result" id="result" hidden><div class="result-card"><span class="result-badge">✓</span><span class="eyebrow">BUGÜNLÜK İŞLER TAMAM</span><h1>Eline sağlık,<br>kargocu!</h1><p>Üç paket, üç mutlu komşu.</p><div class="result-scores"><div><span>TUR PUANI</span><strong id="result-score">0</strong></div><div><span>EN İYİ TUR</span><strong id="best-score">0</strong></div><div><span>KAZANÇ</span><strong id="result-earnings">0 ₺</strong></div><div><span>İTİBAR</span><strong id="result-reputation">+0</strong></div></div><div class="quality-summary"><span>PAKET DURUMU <b id="package-quality">Hasarsız</b></span><span>GÜVENLİ SÜRÜŞ <b id="safe-bonus">+0 ₺</b></span></div><div class="company-summary"><span>ŞİRKET BAKİYESİ</span><strong id="company-money">0 ₺</strong><span>ŞİRKET SEVİYESİ <b id="company-level">1</b></span></div><section class="garage" aria-label="Garaj"><div class="garage-heading"><span class="eyebrow">GARAJ</span><span id="garage-status">Aracını geliştir</span></div><div class="upgrade-list"><button class="upgrade-button" data-upgrade="engine"><span><b>Motor</b><small id="engine-upgrade">Seviye 1 · 180 ₺</small></span><strong>+</strong></button><button class="upgrade-button" data-upgrade="brakes"><span><b>Fren</b><small id="brakes-upgrade">Seviye 1 · 160 ₺</small></span><strong>+</strong></button><button class="upgrade-button" data-upgrade="cargo"><span><b>Kapasite</b><small id="cargo-upgrade">Seviye 1 · 220 ₺</small></span><strong>+</strong></button></div></section><button class="primary-button" id="restart">Bir tur daha <span>↗</span></button></div></div>
  <div class="toast" id="toast" role="status" hidden></div>`;
  const el = <T extends HTMLElement = HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`)!;
  let hintTimer: ReturnType<typeof setTimeout> | undefined;
  let begun = false,
    lastCompleted = 0,
    toastTimer: ReturnType<typeof setTimeout> | undefined;
  function begin() {
    if (!begun)
      hintTimer = setTimeout(() => {
        root.querySelector<HTMLElement>(".control-hint")!.hidden = true;
      }, 12000);
    begun = true;
    el("welcome").hidden = true;
    el("result").hidden = true;
    lastCompleted = 0;
    actions.restart();
    (document.activeElement as HTMLElement)?.blur();
  }
  function buyUpgrade(e: Event) {
    const kind = (e.currentTarget as HTMLElement).dataset.upgrade as UpgradeKind;
    actions.buyUpgrade(kind);
  }
  function recover() {
    actions.recover();
    el("recover").blur();
  }
  function toggle() {
    actions.toggleSound();
    el("sound").blur();
  }
  el("start").addEventListener("click", begin);
  el("restart").addEventListener("click", begin);
  el("recover").addEventListener("click", recover);
  el("sound").addEventListener("click", toggle);
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-upgrade]"))
  button.addEventListener("click", buyUpgrade);
  return {
    update(
      s: DeliveryState,
      progression: {
        bestScore: number;
        money: number;
        reputation: number;
        companyLevel: number;
        upgrades: VehicleUpgrades;
      },
      soundEnabled: boolean,
    ) {
      const delivering = s.phase === "delivering";
      el("trip-count").textContent =
        `${String(Math.min(s.completed + 1, 3)).padStart(2, "0")} / 03`;
      el("target-name").textContent = delivering
        ? `Ev ${String(s.targetIndex + 1).padStart(2, "0")}`
        : "Kargo deposu";
      el("task-instruction").textContent =
        s.holdSeconds > 0
          ? delivering
            ? "Teslim ediliyor…"
            : "Paket yükleniyor…"
          : delivering
            ? packageInfo[s.packageType].instruction
            : s.phase === "returning"
              ? "Yeni paket için depoya dön."
              : "Paketini almak için alanda dur.";
      el("package-status").textContent = delivering
        ? `▣ ${packageInfo[s.packageType].label}`
        : s.phase === "returning"
          ? "▣ DEPODA YÜKLE"
          : "▣ PAKET BEKLENİYOR";
      el("hold-progress").style.width =
        `${Math.min(100, s.holdSeconds * 100)}%`;
      el("score").textContent = String(s.score);
      el("timer").textContent = delivering
        ? `${Math.ceil(s.secondsLeft)}s`
        : "—";
      el("timer-progress").style.width = delivering
        ? `${(s.secondsLeft / 45) * 100}%`
        : "0%";
      el("timer").classList.toggle(
        "expired",
        delivering && s.secondsLeft === 0,
      );
      el("sound").classList.toggle("muted", !soundEnabled);
      el("sound").setAttribute(
        "aria-label",
        soundEnabled ? "Sesi kapat" : "Sesi aç",
      );
      el("sound").setAttribute("aria-pressed", String(!soundEnabled));
      el("result").hidden = !(begun && s.phase === "result");
      el("result-score").textContent = String(s.score);
      el("best-score").textContent = String(progression.bestScore);
      el("result-earnings").textContent = `${s.earnings} ₺`;
      el("result-reputation").textContent = `+${s.reputation}`;
      el("package-quality").textContent =
        s.packageDamage === 0 ? "Hasarsız" : `%${Math.round(s.packageDamage)} hasar`;
      el("safe-bonus").textContent = `+${s.safeDrivingBonus} ₺`;
      el("company-money").textContent = `${progression.money} ₺`;
      el("company-level").textContent = String(progression.companyLevel);
      el("district-name").innerHTML =
        `${s.district === "industrial" ? "SANAYİ BÖLGESİ" : s.district === "market" ? "ÇARŞI BÖLGESİ" : "GÜNEŞ MAHALLESİ"} <i></i>`;
      for (const kind of ["engine", "brakes", "cargo"] as UpgradeKind[]) {
        const level = progression.upgrades[kind];
        el(`${kind}-upgrade`).textContent =
          kind === "cargo" && level >= 1
            ? "Maksimum · 2 paket"
            : `Seviye ${level + 1} · ${upgradeCost(kind, level)} ₺`;
        el(`${kind}-upgrade`).parentElement?.parentElement?.toggleAttribute(
          "disabled",
          !canPurchaseUpgrade(kind, level, progression.money),
        );
      }
      if (s.completed > lastCompleted && s.phase !== "result") {
        el("toast").textContent =
          "✓ Paket teslim edildi. Sıradaki için depoya!";
        el("toast").hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          el("toast").hidden = true;
        }, 3000);
      }
      lastCompleted = s.completed;
    },
    setNitro(level: number) {
      const percent = Math.max(0, Math.min(1, level)) * 100;
      el("nitro-fill").style.width = `${percent}%`;
      el("nitro-fill").classList.toggle("low", percent < 15);
    },
    setNavigation(distance: number, bearing: number) {
      el("distance").textContent =
        distance <= 2
          ? "Alandasın · yavaşla ve dur"
          : `${Math.ceil(distance)} m · hedefe`;
      el("nav-arrow").style.transform = `rotate(${bearing}rad)`;
    },
    dispose() {
      clearTimeout(toastTimer);
      clearTimeout(hintTimer);
      el("start").removeEventListener("click", begin);
      el("restart").removeEventListener("click", begin);
      el("recover").removeEventListener("click", recover);
      el("sound").removeEventListener("click", toggle);
      for (const button of root.querySelectorAll<HTMLButtonElement>("[data-upgrade]"))
        button.removeEventListener("click", buyUpgrade);
      root.remove();
    },
  };
}
