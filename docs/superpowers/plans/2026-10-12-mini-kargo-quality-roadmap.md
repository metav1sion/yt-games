# Mini Kargo — kalite ve devamlılık yol haritası

Tarih: 12 Ekim 2026
Durum: Mevcut sürüm analiz edildi; aşağıdaki ürün yönü ve öncelikler öneridir. Bu belge eski geliştirme planının otomatik devamı değildir.

## Kullanıcının amacı

Devamlılık için geliştirilen fikirler beğeniliyor; uygulanışlarının kalitesi beğenilmiyor. Amaç sürüş ve teslimatın eğlencesini koruyarak oyuncuya tekrar oynama ve kalıcı ilerleme nedeni vermek. Bütün eklemeleri geri almak veya yeni sistemleri hızla çoğaltmak bu amaca hizmet etmez.

## İncelenen sürüm

Başlangıç karşılaştırması: `4b862f3` (ilk prototip).
Güncel HEAD: `5fc2c6e`.
Altı yeni commit, 17 kaynak dosyasında 820 eklenen ve 44 kaldırılan satır.
Diğer modelin belgesi: `games/mini-kargo/GELISTIRME_PLANI.md` (henüz Git takibinde değil; değiştirilmedi).

Eklenenler: hareketli joystick, araç/kamera ayarları, kalıcı para-itibar-şirket seviyesi, motor/fren/kapasite satın alımları, üç paket türü, trafik/yayalar, hasar, isim ve ödül üzerinden bölge ilerlemesi.

## Doğrulama ve somut bulgular

`npm test`: 34/34 başarılı. `npm run typecheck` ve `npm run build`: başarılı. JavaScript gzip aktarım boyutu 146.46 kB; Vite 500 kB ham parça uyarısı mevcut.

Tarayıcı analizinin çıktısı: `games/mini-kargo/artifacts/audit-2026-10-12/report.json`. İzole Chrome oturumunda kullanıcı kaydı değiştirilmedi. Sonuç ekranı incelemesi gerçek HUD modülüne kontrollü sonuç verisi verilerek yapıldı; tam tur oynanış testi olarak sunulmuyor.

1. **Temas hasarı çarpışma olayı olarak modellenmemiş.** Trafik modülü yakınlık katsayısı döndürüyor; teslimat modülü bunu her 1/60 saniyelik güncellemede hasara ekliyor. 0.5 sabit temas girdisi bir saniyede standart paketi %100 hasara ulaştırıyor. Trafik temasında fiziksel ayırma/engelleme bulunmuyor; araçlar iç içe geçebilirken oyuncu ceza alıyor.
2. **Yeni paketin hasarı sıfırlanmıyor.** %40 hasarlı paket teslim edilip depodan yeni paket alındığında yeni paket hâlâ %40 hasarlı. Araç hasarı ayrı; paket hasarı teslimat başına olmalı. Kapasite yükseltmesindeki ikinci paketin de bağımsız kalitesi yok.
3. **Faydasız kapasite satın alımı.** Kapasite seviyeleri 0/1/2/3 için gerçek taşıma kapasitesi 1/2/2/2. Buna rağmen sonraki satın alımlar 440/660/880 para ile sürüyor. Motor ve fren yükseltmeleri de üst sınırsız; ekonomik denge ve kontrollü araç davranışı garantilenmiyor.
4. **Bölge açma görünür içerik açmıyor.** Aynı `createWorld()` çağrısı kullanılıyor. Şirket seviyesi yükselince başlık ve ödül çarpanı değişiyor, harita ve teslimat deneyimi aynı kalıyor. Bölge seçimi veya açılma kutlaması yok.
5. **Turlar çeşitlenmiyor.** Her tur aynı ilk üç ev ve standart → acil → kırılabilir sırası. Altı evin yarısı teslimatlarda kullanılmıyor. Kalıcı sayılar artsa da oynanışın temel rotası değişmiyor.
6. **Kısmi oturum ilerlemesi kayboluyor.** Para, itibar ve teslimat adedi yalnızca turun sonunda kalıcı ilerlemeye ekleniyor. Tur ortasında sayfadan ayrılan oyuncu tamamladığı teslimatların ilerlemesini koruyamıyor.
7. **Joystikte fare regresyonu.** `e.target !== joystick` kontrolü, joystick'in iç düğmesine/ringine basmayı reddediyor. Chrome'da merkezden fare basışı `active` durumunu başlatmadı. Mobil sürüş alanı da UI dışındaki tüm belgeyi dinliyor; sürüş giriş alanı açıkça tanımlanmalı.
8. **Sonuç ekranı fazla sorumluluk taşıyor.** Puan, rekor, kazanç, itibar, hasar, bonus, bakiye, seviye ve üç satın alım aynı ekrana eklenmiş. 844×390'da kart 469.69 px yüksekliğinde; üstü -39.84 px, devam düğmesinin altı 411.84 px. Sayfa taşması kapalı olduğundan düğme tamamen erişilebilir değil.
9. **Yeni özelliklere uygun geri bildirim eksik.** Hasar yalnızca sonuçta görünüyor. Kırılabilir paketin zaman çubuğu hâlâ 45 saniye üzerinden hesaplanıyor; kapasiteyle ikinci teslimata geçilse bile bildirim depoya dön diyor. Araç hasarı sürüşe veya tamire bağlanmıyor. Kazanılan itibar birikiyor fakat somut bir kilit açma koşulunda kullanılmıyor.
10. **Testler sistemler arası davranışı kapsamıyor.** `collisionDamagesFragilePackage` testi standart paketle çalışıyor ve yalnızca hasarın sıfırdan büyük olduğunu ölçüyor. Sürekli temas, paket sıfırlama, yükseltme sınırları, satın alım sonrası davranış ve genişletilen sonuç ekranı kapsanmıyor. Eski doğrulama raporu güncel eklemeleri doğrulamaz.

## Ürün yönü

Önerilen döngü: **keyifli teslimat → anlaşılır kazanç → görünen bir sonraki hedef → hissedilen gelişme → farklı rota**.

Para, paket türleri, kapasite ve bölge açma fikri korunmalı. Her sistem oyuncuya farklı bir seçim veya görünür değişim sağlamalı. İtibar, şirket seviyesi ve para üç ayrı boş sayı olarak büyümemeli; her birinin amacı tanımlanmalı. Sürüş başarısı temel deneyim olmaya devam etmeli.

## Aşama 1 — mevcut özelliklerin güvenilirliği

Öncelik P0; yeni içerik eklemeden mevcut davranışları düzelt.

- Joystick fare/dokunma başlangıcı, sürükleme, iptal ve ekran döndürme davranışını sağlamlaştır.
- Sonuç ekranını dikey ve yatay mobilde erişilebilir yap; mevcut kayıt ve satın alma davranışını koru.
- Hasarı temas başına anlamlı bir olay olarak hesapla; teması sürdürmek aynı darbeyi tekrar tekrar saymasın. Darbe şiddeti hızla ilişkili olsun; süreye yayılan ceza gerekiyorsa açıkça tanımlansın.
- Yeni yüklemede paket hasarını temizle; kapasiteye göre paket durumlarının sahipliğini netleştir.
- Etki sağlamayan kapasite alımlarını engelle. Motor/fren üst sınırlarını ürün dengesiyle birlikte belirle.
- Paket türüne göre sayaç oranını, hedef değişiminde bildirimleri ve hasar geri bildirimini tutarlı yap.
- Yeni kurallar için başarısız test → düzeltme → başarılı test; mobil sonuç ekranı ve kontrol için tarayıcı regresyonları.

Bitiş ölçütü: Erişilemeyen temel düğme, faydasız satın alım veya tekrarlanan haksız hasar yok; mevcut kayıtlar korunuyor; test/typecheck/build ve güncel tarayıcı kontrolü geçiyor.

## Aşama 2 — ilerleme deneyiminin tasarımı

Önce ekran akışını ve ekonomi ilişkilerini tasarla, ardından uygula.

- Tur sonucunda önce kazanç ve sıradaki anlamlı hedef; ayrıntı ve garaj ayrı, küçük akışlar.
- Her yükseltme “ne değişiyor?” sorusuna cevap versin: kapasite gerçek ek paket, motor/fren kontrollü sürüş farkı.
- İlk birkaç tur için sınırlı yükseltme seviyeleri ve elle dengelenmiş maliyetler; her turda net bir hedefe yaklaşma.
- Teslimat tamamlandıkça kalıcı kazancı güvenle kaydet; tur sonu tekrar para vermesin. Yarım turdan dönüş politikasını netleştir.
- Satın alınan gelişmeleri araç veya depoda görünür kıl.
- İtibarın ne açtığı ve şirket seviyesinin ne ölçtüğü tanımlansın; aynı şeyi ölçen gereksiz göstergeler azaltılsın.

Bitiş ölçütü: Oyuncu sonuç ekranına baktığında bir sonraki hedefini ve alacağı faydayı anlayabiliyor; ilk gelişme kısa sürede hissediliyor; ayrılıp döndüğünde hak edilmiş ilerleme kaybolmuyor.

## Aşama 3 — aynı mahallede tekrar oynama değeri

- Altı evi kullanan, yol uzunluğu dengelenmiş farklı üç duraklı rotalar.
- Standart/acil/kırılabilir görevlerin farklı sürüş kararları; yalnızca süre ve çarpan değişimiyle yetinme.
- Trafiğin şerit, geçiş ve çarpışma davranışını yeniden kur; okunabilir görseller ve öngörülebilir tehlikeler.
- Yayaları önce güvenilir çevre hareketi olarak ele al; risk/ceza ancak oyuncu tehlikeyi önceden okuyabiliyorsa kullanılsın.
- Rota, hedef ve yük değişimi kısa oturumlarda anlaşılır kalmalı.

Bitiş ölçütü: Arka arkaya birkaç tur aynı rotanın tekrarı gibi hissettirmiyor; farklı görevlerin karar farkı var; trafik sürüş keyfini bozmuyor.

## Aşama 4 — gerçek içerik açılması

- Önce yalnızca bir yeni bölge: farklı yol düzeni, binalar ve görev profili.
- Bölge kilidi, ilerleme ve açılma anı açıkça gösterilsin; kullanıcı bölge seçebilsin.
- Başarı ölçütü ödül çarpanından önce farklı oynanış ve görsel kimlik olsun.
- Ardından, deneyim iyiyse bir yeni araç; günlük görev, otomatik çalışan ve hava sistemleri daha sonra değerlendirilsin.

Bitiş ölçütü: Yeni bölge açmak gerçekten yeni bir sürüş/teslimat deneyimi kazandırıyor.

## Önerilen ilk uygulama dilimi

Küçük ve doğrudan incelenebilir başlangıç: **joystick regresyonu + mobil sonuç ekranı + faydasız kapasite satın alımı + paket hasarı sıfırlama**. Mevcut arayüz akışı ve kalıcı kayıt korunarak dört somut kalite hatası giderilir. Hasar/ trafik modelinin daha kapsamlı yeniden tasarımı ikinci dilime ayrılır.

Bu ilk dilim yeni şirket sistemi veya harita eklemeyi gerektirmez. Sonraki mimari ilerleme çalışmasının tasarımı, gerçek kullanımdaki geri bildirimle netleştirilir.

## Şimdilik genişletilmeyecekler

Çalışan kargocular, otomatik gelir, maaş/vardiya, elektrikli araç enerji sistemi, hava durumu ve etkinlikler. Önce mevcut kısa tur gerçekten eğlenceli ve ilerlemesi anlamlı olmalı. YouTube SDK entegrasyonu ve sertifikasyon ayrı aşama olarak kalır.
