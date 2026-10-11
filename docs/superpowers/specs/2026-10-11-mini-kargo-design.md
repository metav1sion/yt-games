# Mini Kargo — ilk sürüm tasarımı

## Amaç ve onaylanan yön

YouTube Playables'a sunulabilecek, mobil ve masaüstünde oynanan küçük bir 3D kargo oyunu. Oyuncu renkli bir mahallede arabayı serbestçe sürer, depodan paket alır ve evlere teslim eder. Kısa teslimat turlarında süre bonusu vardır; süre bitince oyun sona ermez, bonus kaybolur.

Onaylanan seçimler: serbest sürüş, yukarıdan açılı takip kamerası, mobil sanal joystick ve masaüstü WASD/ok tuşları, bırakınca yavaşlama, teslimat alanında durarak teslim etme, ilk sürümde düşmeyen fakat sallanan paketler.

Aşağıdaki sayısal değerler ve teknik ayrıntılar ilk prototip için öneridir; oynanış değerlendirmesiyle ayarlanacaktır.

## İlk oynanabilir sürüm

- Bir depo, altı teslimat evi, bir meydan ve birbirine bağlı birkaç sokaktan oluşan tek mahalle.
- Bir araba ve okunabilir, renk kodlu teslimat işaretleri.
- Her turda sırayla üç teslimat. Aynı anda tek aktif hedef ve tek paket.
- Depodaki alanda yaklaşık bir saniye durunca paket yüklenir. Yükleme sonrası hedef işaretlenir.
- Doğru evin alanında yaklaşık bir saniye düşük hızda kalınca teslimat tamamlanır. Alanı terk etmek ilerlemeyi sıfırlar.
- Her teslimat temel puan kazandırır; yükleme anında başlayan geri sayımın kalan süresi ek puan verir. Başlangıç hedefi teslimat başına 45 saniyedir.
- Teslimattan sonra depoya dönülür. Üç teslimattan sonra tur puanı, en iyi puan ve yeniden oyna seçeneği gösterilir.
- Paketler viraj ve hızlanmayla görsel olarak sallanır; ilk sürümde yük kaybı yoktur.
- Süre bonusu dışında yakıt, para ekonomisi, araç satın alma, trafik ve yaya sistemi yoktur.

## Kontrol ve sürüş

Mobil joystick'in yönü ekran üzerindeki gitmek istenen yönü belirtir; mesafesi hedef hızı belirler. Araba bu yöne sınırlı dönüş hızıyla döner. Masaüstünde WASD/ok tuşları aynı yön modelini kullanır. Bu ilk sürümde gaz ve direksiyonun ayrı yönetildiği simülasyon kontrolleri kullanılmaz.

Hareket yatay düzlemde hesaplanır. Hızlanma, yavaşlama, dönüş hızı ve hafif yanal kayma ayarlanabilir parametrelerdir. Kamera sabit açıyla yumuşak takip eder; oyuncunun kamera kontrolü yoktur. Binalar ve harita sınırı arabayı engeller. Çarpışmalarda hız düşer, araç duvar boyunca kayabilir. Takılma durumları için arabayı depoya döndüren bir kurtarma düğmesi bulunur; aktif paket korunur, geri sayım devam eder.

## Görsel ve ses yönü

Basit geometrilerle üretilen renkli, stilize 3D mahalle; belirgin yollar, alçak evler, okunabilir teslimat bölgeleri. İlk sürüm dış model indirmeyi gerektirmez. Arabanın üstündeki paket, tekerlek hareketi ve teslimatta kapıya giden paket animasyonu temel geri bildirimdir.

Arayüz aktif hedefi, teslimat sayısını, süre bonusunu ve puanı gösterir. İlk oynayışta tek kısa kontrol ipucu görünür. Ses kapatma düğmesi vardır; ses tarayıcının kullanıcı etkileşimi koşuluna göre başlatılır. Ses yüklenememesi oyunu engellemez.

## Teknik yapı

TypeScript, Three.js ve Vite. İlk oyun `games/mini-kargo` altında bağımsız geliştirilir ve paketlenir. Henüz başka oyun olmadığı için ortak paket oluşturulmaz; tekrar eden ihtiyaç ortaya çıkınca ayrılır.

Sorumluluklar ayrı tutulur: oyun durumları ve tur akışı; araç hareketi ve çarpışmalar; mahalle ve teslimat noktaları; kamera ve görsel sahne; klavye/dokunma girdisi; HTML arayüz; platform kayıt ve yaşam döngüsü adaptörü.

Tur durumları: başlangıç → depodan yükleme → teslimata gitme → depoya dönüş veya tur sonucu. Ekran ve işaretler bu durumdan türetilir. Puan sadece teslimatın tamamlanmasıyla güncellenir; aynı teslimat tekrar puan kazandıramaz.

Tam fizik motoru yerine bu ölçek için basit yatay araç hareketi ve daire/dikdörtgen çarpışmaları kullanılır. Büyük kare zaman farklarını sınırlayan sabit adımlı güncelleme uygulanır. Sekme gizlendiğinde oyun ve bonus sayacı durur; dönüşte zaman sıçraması oluşmaz. Yeniden boyutlandırma joystick, arayüz ve kamera oranını günceller. WebGL başlatılamazsa anlaşılır hata ve yeniden deneme seçeneği gösterilir.

## Platform ve kayıt

Önce tarayıcıda çalışan oyun hazırlanır. Platform adaptörü, yerel geliştirmede yerel kayıt; YouTube ortamında Playables SDK ile kayıt, ses ve yaşam döngüsü entegrasyonuna geçiş sınırı sağlar. İlk sürüm yalnızca en iyi tur puanını ve ses tercihini saklar. Hatalı veya erişilemeyen kayıt varsayılan ayarlarla devam eder.

YouTube entegrasyonu ve yayınlama ayrı doğrulama aşamasıdır; yerel oynanabilir sürüm yayın onayı anlamına gelmez. Resmî belgeler geliştirici erişiminin erken erişimde olduğunu belirtiyor. Paket içi varlık yolları göreli tutulur; başlangıç yükü küçük, açılış hedefi beş saniyenin altındadır. Yayınlama öncesi güncel SDK ve sertifikasyon gereksinimleri yeniden kontrol edilir.

Kaynaklar:

- https://developers.google.com/youtube/gaming/playables
- https://developers.google.com/youtube/gaming/playables/certification/requirements_stability

## Doğrulama ve kabul

- Masaüstünde klavyeyle ve mobil boyutta dokunmatik kontrolle üç teslimatlık tur tamamlanabilir.
- Araç bina içinden geçmez; kurtarma düğmesi takılan aracı geri getirir.
- Paket yükleme ve teslimat yalnızca doğru bölgede durunca gerçekleşir.
- Süre bitince temel teslimat puanı kazanılabilir, süre bonusu kazanılamaz.
- Sekme gizlenince sayaç durur; geri dönüşte araç sıçramaz.
- Yeniden başlatma turu temizler; en iyi puan yenilemede korunur.
- TypeScript denetimi ve üretim derlemesi başarılıdır.
- Kritik teslimat ve puan kuralları için küçük mantık testleri; sürüş, dokunma ve okunabilirlik için tarayıcıda gerçek oynanış kontrolü yapılır.
- YouTube uyumluluğu ancak SDK entegrasyonu ve ilgili platform testleri yapıldıktan sonra iddia edilir.

## Sonraki aşama

Bu yazılı tasarım kullanıcı tarafından değerlendirildikten sonra uygulama planı hazırlanır. Sürüş hissi ilk uygulama önceliğidir; harita ve teslimat akışı bunun üzerine kurulur.
