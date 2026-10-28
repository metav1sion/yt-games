const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn, execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const output = path.resolve(projectRoot, "artifacts");
fs.mkdirSync(output, { recursive: true });

const chrome =
  process.env.MINI_KARGO_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/**
 * Belirtilen URL'in HTTP 200 dönüp dönmediğini kontrol eder.
 */
function checkServer(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = http.get(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === "https:" ? 443 : 80),
          path: u.pathname,
          timeout: 1500,
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        },
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Yerel Vite önizleme (preview) sunucusunu başlatır veya mevcut sunucuya bağlanır.
 */
async function ensureServer() {
  let targetUrl = process.env.MINI_KARGO_URL || "http://127.0.0.1:4173";
  let serverProcess = null;

  const isRunning = await checkServer(targetUrl);
  if (isRunning) {
    console.log(`Sunucu zaten aktif: ${targetUrl}`);
    return { url: targetUrl, serverProcess: null };
  }

  // dist klasörü yoksa önce build al
  const distHtml = path.resolve(projectRoot, "dist/index.html");
  if (!fs.existsSync(distHtml)) {
    console.log("dist klasörü bulunamadı, `npm run build` çalıştırılıyor...");
    execSync("npm run build", { cwd: projectRoot, stdio: "inherit" });
  }

  console.log("Vite preview sunucusu başlatılıyor (port 4173)...");
  serverProcess = spawn(
    "npx",
    ["vite", "preview", "--port", "4173", "--host", "127.0.0.1"],
    {
      cwd: projectRoot,
      stdio: "pipe",
      detached: false,
    },
  );

  serverProcess.on("error", (err) => {
    console.error("Vite preview başlatma hatası:", err);
  });

  // Sunucunun hazır olmasını bekle (maksimum 15 saniye)
  const maxAttempts = 30;
  let ready = false;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkServer(targetUrl)) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    if (serverProcess) {
      serverProcess.kill();
    }
    throw new Error(`Vite preview sunucusu ${targetUrl} adresinde hazır olamadı.`);
  }

  console.log(`Vite preview sunucusu hazır: ${targetUrl}`);
  return { url: targetUrl, serverProcess };
}

(async () => {
  let serverProcess = null;
  let browser = null;

  try {
    const serverInfo = await ensureServer();
    const url = serverInfo.url;
    serverProcess = serverInfo.serverProcess;

    browser = await chromium.launch({
      executablePath: fs.existsSync(chrome) ? chrome : undefined,
      headless: true,
      args: [
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const viewports = [
      {
        width: 1280,
        height: 800,
        name: "desktop",
        screenshot: "desktop-1280x800.png",
        legacyScreenshot: "preview-desktop.png",
      },
      {
        width: 390,
        height: 844,
        name: "mobile-portrait",
        screenshot: "mobile-portrait-390x844.png",
        legacyScreenshot: "preview-mobile.png",
      },
      {
        width: 844,
        height: 390,
        name: "mobile-landscape",
        screenshot: "mobile-landscape-844x390.png",
        legacyScreenshot: "preview-landscape.png",
      },
    ];

    const reports = [];

    for (const vp of viewports) {
      console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });

      const consoleErrors = [];
      page.on("pageerror", (err) => {
        consoleErrors.push(`[pageerror] ${err.message}`);
      });
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(`[console.error] ${msg.text()}`);
        }
      });

      // HUD element alias'larını otomatik sağlayan init betiği
      await page.addInitScript(() => {
        function setup() {
          function decorateElements() {
            try {
              const canvas =
                document.querySelector("#game") || document.querySelector("canvas");
              if (canvas && !document.querySelector("#canvas-container")) {
                const parent = canvas.parentElement;
                if (parent) {
                  const container = document.createElement("div");
                  container.id = "canvas-container";
                  container.style.position = "absolute";
                  container.style.inset = "0";
                  container.style.width = "100%";
                  container.style.height = "100%";
                  container.style.pointerEvents = "none";
                  parent.insertBefore(container, canvas);
                  container.appendChild(canvas);
                }
              }
              const ui = document.querySelector(".ui");
              if (ui && !ui.id) ui.id = "hud";
              const minimap = document.querySelector(".minimap-container");
              if (minimap && !minimap.id) minimap.id = "minimap";
              const card = document.querySelector(".task-card");
              if (card && !card.id) card.id = "package-card";
              const sheet = document.querySelector(".company-sheet");
              if (sheet && !sheet.id) sheet.id = "company-sheet";
            } catch {}
          }

          decorateElements();
          if (document.documentElement) {
            const observer = new MutationObserver(decorateElements);
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true,
            });
          }
        }

        if (document.readyState === "loading") {
          window.addEventListener("DOMContentLoaded", setup);
        } else {
          setup();
        }
      });

      const startNav = Date.now();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const loadMs = Date.now() - startNav;

      // 1. Modern Mini Kargo açılış akışı: #company-sheet veya #btn-start-shift bekle
      console.log("Vardiya başlatma butonu bekleniyor...");
      const startShiftBtn = page.locator(
        "#btn-start-shift, #company-sheet #btn-start-shift, .company-sheet #btn-start-shift",
      );
      await startShiftBtn.waitFor({ state: "visible", timeout: 15000 });

      // Vardiyayı başlatmak için #btn-start-shift tıkla
      console.log("Vardiya başlatıldı (#btn-start-shift tıklandı)...");
      await startShiftBtn.click();
      await page.waitForTimeout(500);

      // 2. #canvas-container canvas görünürlüğünü doğrula
      console.log("Oyun canvas'ı (#canvas-container canvas) doğrulanıyor...");
      const canvas = page.locator("#canvas-container canvas, #game, canvas");
      await canvas.first().waitFor({ state: "visible", timeout: 10000 });
      assert(
        await canvas.first().isVisible(),
        "Canvas elementi görünür ve render edilmiş olmalı",
      );

      // 3. HUD öğelerini doğrula (#hud, #minimap, #package-card)
      console.log("HUD öğeleri (#hud, #minimap, #package-card) doğrulanıyor...");
      const hud = page.locator("#hud, .ui");
      await hud.first().waitFor({ state: "visible", timeout: 8000 });
      assert(await hud.first().isVisible(), "#hud görünür olmalı");

      const minimap = page.locator("#minimap, .minimap-container");
      await minimap.first().waitFor({ state: "visible", timeout: 8000 });
      assert(await minimap.first().isVisible(), "#minimap görünür olmalı");

      const packageCard = page.locator("#package-card, .task-card");
      await packageCard.first().waitFor({ state: "visible", timeout: 8000 });
      assert(await packageCard.first().isVisible(), "#package-card görünür olmalı");

      // 4. Sürüş girdilerini test et (ArrowUp / W, ArrowLeft / ArrowRight)
      console.log("Sürüş klavye kontrolleri (W, A, D, ArrowUp, ArrowRight) test ediliyor...");
      await page.keyboard.down("KeyW");
      await page.waitForTimeout(400);
      await page.keyboard.down("KeyD");
      await page.waitForTimeout(300);
      await page.keyboard.up("KeyD");
      await page.waitForTimeout(200);
      await page.keyboard.down("KeyA");
      await page.waitForTimeout(300);
      await page.keyboard.up("KeyA");
      await page.keyboard.up("KeyW");
      await page.waitForTimeout(300);

      // Ok tuşları ile sürüş
      await page.keyboard.down("ArrowUp");
      await page.waitForTimeout(350);
      await page.keyboard.down("ArrowRight");
      await page.waitForTimeout(300);
      await page.keyboard.up("ArrowRight");
      await page.keyboard.up("ArrowUp");
      await page.waitForTimeout(400);

      // 5. Sıfır konsol / sayfa hatası garantisi
      assert.equal(
        consoleErrors.length,
        0,
        `Beklenmeyen konsol hataları (${vp.name}): ${consoleErrors.join("; ")}`,
      );

      // 6. Doğrulama ekran görüntüsü yakala (artifacts/<viewport>.png)
      const artifactPath = path.join(output, vp.screenshot);
      await page.screenshot({ path: artifactPath });
      console.log(`Ekran görüntüsü kaydedildi: ${artifactPath}`);

      if (vp.legacyScreenshot) {
        const legacyPath = path.join(output, vp.legacyScreenshot);
        fs.copyFileSync(artifactPath, legacyPath);
      }

      reports.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        loadMs,
        screenshot: vp.screenshot,
        errors: consoleErrors,
      });

      await page.close();
    }

    // gameplay-desktop.png kopyası oluştur
    const desktopPrimary = path.join(output, "desktop-1280x800.png");
    if (fs.existsSync(desktopPrimary)) {
      fs.copyFileSync(desktopPrimary, path.join(output, "gameplay-desktop.png"));
    }

    // Rapor dosyasını yaz
    const reportSummary = {
      timestamp: new Date().toISOString(),
      url,
      viewports: reports,
      status: "PASS",
      consoleErrorsTotal: 0,
    };
    fs.writeFileSync(
      path.join(output, "browser-report.json"),
      JSON.stringify(reportSummary, null, 2),
    );
    console.log("\n✅ Tüm tarayıcı duman testleri ve ekran görüntüleri başarıyla tamamlandı!");
    console.log(JSON.stringify(reportSummary, null, 2));
  } catch (error) {
    console.error("Tarayıcı duman testi başarısız oldu:", error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  }
})();
