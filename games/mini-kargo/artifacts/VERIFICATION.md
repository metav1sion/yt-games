# Doğrulama — 11 Ekim 2026

- `npm test`: 6 dosya, 28 test başarılı.
- `npm run typecheck`: başarılı.
- `npm run build`: başarılı.
- `npm run test:browser`: yerel üretim sunucusunda Google Chrome / Playwright ile başarılı.
- Ekranlar: 1280×800, 390×844 ve 844×390. Arayüz ekran sınırları içinde; hedef ve puan panelleri çakışmıyor.
- Klavye hareketi, joystick sürükleme/iptal, depoya kurtarma, turu yeniden başlatma ve sekme görünürlük olaylarında sayaç durması doğrulandı.
- Gerçek sahnede joystick ile sokak rotaları üzerinden üç teslimat tamamlandı: 517 puan. En iyi puan ve ses tercihi yenileme sonrası korundu.
- WebGL kapalı: yeniden deneme ekranı. AudioContext ve localStorage engelli: oyun çalışmaya devam etti.
- Üç normal ekran denemesinde ve tam turda sıfır JavaScript çalışma zamanı hatası.
- Oynama düğmesine kadar gözlenen açılış: ilk Chrome sayfasında 4157 ms, sonraki iki bağlamda 500 / 549 ms. Yazılımsal WebGL kullanıldı; gerçek telefon performansı olarak yorumlanmamalıdır.
- Üretim dosyaları toplam 575648 bayt; JavaScript gzip 143.51 kB. Varlık referanslarının göreli olduğu ve hedef dosyaların bulunduğu doğrulandı.
- Vite, Three.js içeren minify edilmiş JS parçası 500 kB eşiğini geçtiği için boyut uyarısı verir; build başarılıdır.

Ekran görüntüleri ve ayrıntılar: `gameplay-desktop.png`, `preview-mobile.png`, `preview-landscape.png`, `tour-result.png`, `browser-report.json`.

YouTube SDK entegrasyonu, Playables sertifikasyonu ve gerçek iOS/Android cihaz testi henüz yapılmadı.
