# Mini Kargo — Ajan Çalışma Kuralları

Bu dosya `games/mini-kargo` kapsamındaki tüm geliştirme, inceleme, alt ajan ve test görevleri için geçerlidir. Ana hedef: mevcut Mini Kargo oyununu koruyarak oynanışı, şehir kalitesini, mobil deneyimi ve teknik güvenilirliği geliştirmek.

## 1. Kaynak ve kapsam

- İşe mevcut kodu ve belgeleri okuyarak başla. `GELISTIRME_PLANI.md`, `README.md` ve `docs/superpowers/` içindeki eski planlar güncel koddan geride olabilir; tamamlanmamış işleri mevcut kaynak ve testlerle doğrulamadan varsayma.
- Oyunun kimliğini koru: Three.js + TypeScript + Vite üzerinde mobil/masaüstü oynanabilen 3B kargo teslimatı ve şirket gelişimi.
- Mevcut kayıtları, para/itibar/şirket ilerlemesini, yükseltmeleri, araçları, kuryeleri, bölge kilitlerini ve çalışan sistemleri bozma. Kayıt şeması değişirse geriye dönük uyumluluğu test et.
- YouTube Playables SDK entegrasyonu, yayınlama, harici servislere veri gönderme ve geri döndürülemez işlemler ayrı onay gerektirir.

## 2. Çok ajanlı çalışma — İZİNLİ

- Kullanıcı bu proje için mimar/koordinatör ajan ve uzman alt ajanlarla görev dağıtımını açıkça onaylamıştır. Gerekli olduğunda alt ajanlar kullan; sırf kullanılabiliyor diye gereksiz ajan oluşturma.
- Ana ajan mimariyi, öncelikleri, görev sınırlarını, entegrasyonu, test sonuçlarını ve bir sonraki işleri yönetir. Gameplay, 3B şehir/çevre, grafik/performans, ekonomi/ilerleme, UI/UX ve QA işleri uygun uzmanlara ayrılabilir.
- Aynı dosyalarda eşzamanlı ve kontrolsüz düzenlemeye izin verme. Bağımsız çalışma alanları/dallar kullan veya görevleri sırala. Birleştirme sonrasında ana ajan değişiklikleri inceleyip regresyon testlerini çalıştırır.
- Küçük, ölçülebilir, doğrulanabilir görevler oluştur. Bir görev bittiğinde kalan öncelikleri değerlendirip ortamın izin verdiği ölçüde sonraki işe geç; kota, izin ve yürütme sınırlarını aşabileceğini iddia etme.

## 3. Tarayıcı, ekran görüntüsü ve görsel QA — İZİNLİ

- Playwright, Puppeteer, uygun tarayıcı kontrol araçları ve mevcut `npm run test:browser` komutu artık **kullanılabilir**. Bu izin önceki tarayıcı/ekran görüntüsü yasağının yerine geçer.
- Geliştirme sunucusunu veya yerel production preview'ı açıp masaüstü, mobil dikey ve mobil yatay ekran boyutlarında kontrolleri, akışı, konsol hatalarını ve UI taşmalarını doğrulayabilirsin.
- Şehir, 3B sahne, kamera, model yerleşimi, ışıklandırma veya HUD değişikliklerinde mümkünse ekran görüntüsü al, görsel olarak incele, somut sorunları düzelt ve yeniden kontrol et. Öncesi/sonrası kanıtlarını yalnızca gerektiğinde küçük ve ilgili dosyalar olarak `artifacts/` altında tut.
- Üç teslimatlık tur, araç hareketi, joystick, bölge geçişi, garaj/satın alma ve kayıt gibi kritik akışları erişilebilir tarayıcı testleriyle doğrulamaya çalış.
- Tarayıcı testi yalnızca yerel proje ve güvenli test ortamlarında çalıştırılabilir. Gerçek kullanıcı verisini silme; kayıt testlerini izole test profili/verisiyle yürüt. Kimlik bilgilerini, özel bilgileri veya oturum içeriklerini ekran görüntülerine/raporlara alma. Harici sitelere otomatik eylem gerçekleştirme.
- Tarayıcı veya grafik ortamı kullanılamıyorsa bunu açıkça belirt; sahte ekran görüntüsü, test sonucu ya da görsel başarı iddiası üretme.
- Masaüstü tarayıcı emülasyonunu gerçek iPhone/Android testi olarak sunma. Nihai görsel beğeni, sürüş hissi ve eğlence değerlendirmesinde kullanıcı kabulü gerekir.

## 4. Şehir kalitesi — ÖNCELİKLİ

- Kullanıcı mevcut şehri zayıf buluyor. Şehri daha canlı, tutarlı, detaylı ve dolaşması keyifli yapmak ana ürün hedeflerinden biridir; yalnızca rastgele obje/bina sayısını artırma.
- Güneş Mahallesi, Çarşı, Sanayi ve Sahil için ayırt edilebilir mimari, yol yapısı, bitki örtüsü, küçük çevre objeleri, yön bulmayı kolaylaştıran işaretler ve uygun hareketlilik geliştir.
- Yolların bağlantılarını, teslimat noktalarına erişimi, engel/çarpışma geometrisini, kamera okunabilirliğini ve mobil performansı koru. Kenney varlıklarını ve mevcut lisansları tercih et; yeni varlıkların lisansını doğrula ve dosyaları yerel tut.
- Büyük ve riskli bir yeniden yazım yerine bölge bazlı, test edilebilir küçük geliştirmeler yap. Görsel kazanım ile render maliyetini birlikte değerlendir.

## 5. Doğrulama ve teslim

- Her anlamlı uygulama diliminde uygun odak testlerini yaz/çalıştır. Entegre değişiklikten sonra `games/mini-kargo` içinde şu kontrolleri çalıştır: `npm test`, `npm run typecheck`, `npm run build`.
- Tarayıcı/oynanışla ilgili değişikliklerde mümkün olduğunda `npm run test:browser` ve ilgili görsel kontrolleri çalıştır. Ortam bağımlılıkları eksikse sonucu atlanmış olarak belirt.
- Kod testleri, tarayıcı kontrolleri, gerçek cihaz testi ve insanın oynayarak kabul etmesi ayrı kanıt düzeyleridir; birini diğerinin yerine gösterme.
- Her görev sonunda kısa özet ver: değişenler, doğrulananlar, henüz doğrulanmayanlar, riskler ve sonraki adım. Gereksiz tekrar, kapsam dışı refactor ve uzun raporlardan kaçın.
- Süreklilik için kararları ve iş durumunu kısa Markdown notlarında sakla. Yeni oturumun Git durumu ve proje notlarından devam edebilmesini sağla.

Bu kurallar, kullanıcı sonraki talimatıyla açıkça değiştirmedikçe Mini Kargo geliştirmelerinde geçerlidir.
