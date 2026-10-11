# Mini Kargo

Güneş Mahallesi'nde küçük bir kargo arabasıyla üç paket teslim et. Three.js, TypeScript ve Vite ile hazırlanmış mobil ve masaüstü tarayıcı prototipi.

## Başlatma

Node.js 22.12+ (bu projede 22.18.0 ile doğrulandı) kullan.

```sh
cd /Users/metehansozen/yt-games/games/mini-kargo
npm ci
npm run dev
```

Terminalde yazan yerel adresi aç; varsayılan `http://localhost:5173`. Port doluysa Vite sonraki portu kullanır. Telefonda aynı Wi-Fi üzerinden terminalde gösterilen Network adresini açabilirsin; bilgisayarın güvenlik duvarı erişime izin vermelidir.

## Kontroller ve kurallar

- Masaüstü: WASD veya ok tuşları; ekrandaki joystick fareyle de çalışır.
- Mobil: joystick'i gitmek istediğin ekran yönüne sürükle. Daha kısa sürükleme daha düşük hız verir. Bırakınca araba yavaşlar.
- Depodaki sarı bölgede yaklaşık bir saniye durarak paket al.
- Yön okunu ve yeşil hedefi takip et; doğru evin alanında bir saniye durarak teslim et.
- Her teslimat 100 temel puan ve kalan 45 saniyelik süreden bonus kazandırır. Bonus bitse de teslimata devam edebilirsin.
- Yeni paket için depoya dön. Üç teslimattan sonra sonuç ekranı açılır.
- “Depoya dön” takılma durumunda arabayı kurtarır; mevcut paket ve süre korunur.
- Hoparlör düğmesi sesi açar/kapatır. En iyi tur ve ses tercihi aynı tarayıcıda saklanır.
- Sekme gizlenince oyun, ses ve bonus sayacı durur.

## Doğrulama

```sh
npm test
npm run typecheck
npm run build
npm run preview -- --port 4173
```

Kritik hareket, yön girdisi, çarpışma, sabit zaman adımı, teslimat ve kayıt kuralları Vitest ile test edilir. Tarayıcı testleri klavye/joystick, üç teslimatlık tur, yeniden başlatma, kurtarma, farklı ekran boyutları, ses tercihi ve hata senaryolarını kapsar.

Üretim sunucusu açıkken ayrı terminalde:

```sh
npm run test:browser
```

Tarayıcı testi macOS'ta kurulu Google Chrome'u kullanır. Başka platformda `npx playwright install chromium` ile test tarayıcısını kurabilirsin; `MINI_KARGO_CHROME` ile farklı Chrome yolunu, `MINI_KARGO_URL` ile sunucu adresini belirtebilirsin. Testler `artifacts/` altına ekran görüntüleri ve JSON raporu yazar. Headless testlerde yazılımsal WebGL kullanılır; performans sonucu gerçek telefona eşit değildir.

## Tamamlanan kapsam

Tek mahalle, altı ev ve bir depo; akıcı serbest sürüş, sabit takip kamerası, bina/ağaç/sınır çarpışmaları, üç teslimatlık tur, paket sallanması ve teslimat animasyonu, süre bonusu, başlangıç/sonuç ekranları, yerel kayıt, ses ve duyarlı arayüz.

## Platform durumu ve sınırlar

YouTube Playables SDK entegrasyonu, Android/iOS YouTube uygulamasında sertifikasyon ve yayınlama bu prototipin kapsamına dahil değildir. `src/platform/storage.ts` yerel adaptördür; YouTube kayıt ve yaşam döngüsü entegrasyonu ayrı çalışma gerektirir.

Trafik, paket düşmesi, yakıt, araç satın alma ve ekonomi sistemi yoktur. Sürüş tam fizik simülasyonu değildir. Dokunmatik ekran uyumu Chrome'da ekran boyutu ve pointer olaylarıyla doğrulanır; gerçek iPhone/Android cihaz testi ayrıca yapılmalıdır.

Vite üretim derlemesinde Three.js içeren JavaScript parçası için 500 kB uyarısı verir. Bu bir derleme hatası değildir; gzip aktarım boyutu yaklaşık 144 kB, tüm paket yaklaşık 575 kB'dır. Paket içi varlık yolları görelidir; uzaktan font, model, doku veya CDN isteği yapılmaz.
