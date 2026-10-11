import "./style.css";
import { startGame } from "./bootstrap";
const app = document.querySelector<HTMLDivElement>("#app")!;
try {
  startGame(app);
} catch (error) {
  app.innerHTML = `<div class="error-screen"><div class="result-card"><span class="brand-icon">▣</span><h2>Oyun başlatılamadı.</h2><p>Yeniden deneyebilirsin.</p><button class="primary-button" id="retry">Yeniden dene <span>↻</span></button></div></div>`;
  document
    .querySelector("#retry")!
    .addEventListener("click", () => location.reload());
  console.error("Mini Kargo başlatılamadı:", error);
}
