# Mini Kargo - Oyun Geliştirme Planı

## 1. Oyunun Ana Vizyonu

Mini Kargo, oyuncunun küçük bir mahallede tek başına çalışan bir kargocudan,
zamanla büyük bir kargo şirketinin sahibine dönüştüğü, kısa turlarla oynanan
bir şirket ve sürüş oyunudur.

Oyuncu:

- Kargoları zamanında ve hasarsız teslim eder.
- Para ve itibar kazanır.
- Aracını geliştirir.
- Daha fazla kargo taşıyabilir.
- Yeni bölgelerin kilidini açar.
- Trafik ve şehir tehlikelerine dikkat eder.
- İleride yeni araçlar ve çalışan kargocular satın alır.
- Şirketini büyüterek daha büyük ve daha değerli teslimatlara ulaşır.

Ana hedef, tek sefer oynanıp biten basit bir sürüş deneyimi yerine,
YouTube Playables üzerinde tekrar tekrar oynanabilen kısa ve anlaşılır bir
ilerleme döngüsü oluşturmaktır.

## 2. Temel Oynanış Döngüsü

Her oyun turu şu akışa sahip olmalıdır:

1. Depoya git ve paketleri yükle.
2. Hedef eve veya bölgeye doğru sür.
3. Trafikten, yayalardan ve engellerden kaçın.
4. Paketi zamanında ve mümkün olduğunca hasarsız teslim et.
5. Depoya dön veya sıradaki paketi teslim et.
6. Para, puan ve itibar kazan.
7. Aracı veya şirketi geliştir.
8. Yeni bölgelerin ve daha değerli görevlerin kilidini aç.
9. Yeni bir tur başlat.

Bu döngü kısa sürede anlaşılmalı, ancak her tur oyuncuya bir sonraki tur için
bir hedef vermelidir.

## 3. Şu Anda Oyunda Olan Sistemler

### Sürüş

- Three.js tabanlı 3B şehir ve araç.
- Klavye ve mobil joystick kontrolleri.
- Mobilde joystick'in dokunulan noktada açılması.
- Daha doğal ivmelenme ve frenleme.
- Gaz bırakınca aracın süzülerek yavaşlaması.
- Hıza bağlı dönüş sınırı.
- Hareket yönüne göre kamera öngörüsü.
- Dönüşte araç gövdesi ve ön tekerlek animasyonu.
- Kargo kutusunun araç üzerinde sallanması.

### Teslimat

- Üç duraklı teslimat turları.
- Depodan paket alma ve hedefte durarak teslim etme.
- Standart, acil ve kırılabilir kargo türleri.
- Kargo türlerine göre farklı süre ve ödül çarpanları.
- Araç kapasitesi yükseltmesiyle aynı anda daha fazla paket taşıma.
- Teslimat sonunda puan, kazanç ve itibar hesaplanması.

### Ekonomi ve İlerleme

- Kalıcı şirket bakiyesi.
- Kalıcı itibar.
- Şirket seviyesi.
- Tamamlanan teslimat sayısı.
- En iyi tur puanı.
- LocalStorage ile kayıt.
- Eski kayıtlarla geriye dönük uyumluluk.

### Araç Garajı

- Motor yükseltmesi:
  - Maksimum hızı artırır.
  - İvmelenmeyi artırır.
- Fren yükseltmesi:
  - Gaz bırakınca daha hızlı yavaşlamayı sağlar.
- Kapasite yükseltmesi:
  - Aynı turda daha fazla paket taşımayı sağlar.

### Şehir ve Tehlikeler

- Statik engeller ve şehir sınırları.
- Hareketli trafik araçları.
- Trafik aracı çarpışma algılama.
- Çarpışmaya bağlı araç ve paket hasarı.
- Kamera sarsıntısı ve çarpışma sesi.
- Yaya karakterleri.
- Yüksek hızla yayalara yaklaşınca tehlike/hasar etkisi.

### Teslimat Kalitesi

- Paket hasarı yüzdesi.
- Araç hasarı.
- Hasarlı teslimatlarda düşük kazanç.
- Hasarsız teslimatta güvenli sürüş bonusu.
- Sonuç ekranında paket durumu ve güvenli sürüş bonusu.

### Bölgeler

- Güneş Mahallesi:
  - Şirket seviyesi 1.
  - Temel ödül çarpanı.
- Çarşı Bölgesi:
  - Şirket seviyesi 2.
  - Daha yüksek ödül çarpanı.
- Sanayi Bölgesi:
  - Şirket seviyesi 3.
  - En yüksek mevcut bölge ödül çarpanı.

Şu an bölgeler ağırlıklı olarak ilerleme ve ekonomi farkı oluşturuyor.
İlerleyen aşamalarda her bölgenin görsel ve oynanış olarak da farklılaşması
gerekiyor.

## 4. Geliştirme Öncelikleri

## Faz 1 - Temel Oynanışı Sağlamlaştırma

- [x] Daha iyi araç fiziği.
- [x] Farklı kargo türleri.
- [x] Araç yükseltmeleri.
- [x] Hasar ve teslimat kalitesi.
- [x] Trafik araçları.
- [x] Yayalar.
- [x] Mobil joystick.
- [ ] Trafik araçlarının oyuncunun önünü tamamen kapatmasını engellemek.
- [ ] Çarpışma hasarının tekrar tekrar birikmesini dengelemek.
- [ ] Trafik ve yaya yoğunluğunu şirket seviyesine göre ayarlamak.
- [ ] Trafik araçlarına fren lambası ve daha belirgin görsel yön göstergeleri
  eklemek.

## Faz 2 - Bölge Farklılıkları

- [ ] Çarşı Bölgesi için farklı bina, tabela ve zemin görselleri.
- [ ] Sanayi Bölgesi için depo, fabrika ve kamyon görselleri.
- [ ] Her bölgede farklı yol düzeni.
- [ ] Bölgeye özel trafik yoğunluğu.
- [ ] Bölgeye özel teslimat süreleri.
- [ ] Bölgeye özel kargo türleri.
- [ ] Bölge seçimini oyuncuya bırakmak.
- [ ] Bölge kilitlerini sonuç ekranında anlaşılır göstermek.

## Faz 3 - Şirket Büyütme

- [ ] Garaj binası ve görsel şirket merkezi.
- [ ] Depo kapasitesi yükseltmesi.
- [ ] Daha hızlı paket yükleme.
- [ ] Günlük veya haftalık şirket hedefleri.
- [ ] İtibar seviyelerine göre müşteri ödülleri.
- [ ] Şirket seviyesine bağlı yeni görevler.
- [ ] Şirket seviyesine bağlı yeni araçların açılması.
- [ ] Şirket adını özelleştirme.
- [ ] Şirket merkezinde alınan geliştirmeleri görsel olarak gösterme.

## Faz 4 - Yeni Araçlar

Oyuncunun farklı oyun tarzları arasında seçim yapabilmesi hedefleniyor:

- [ ] Başlangıç arabası:
  - Dengeli hız, kapasite ve kontrol.
- [ ] Hızlı motosiklet:
  - Çok hızlı, düşük kapasite, daha hassas kontrol.
- [ ] Küçük kamyonet:
  - Yüksek kapasite, düşük hız, daha güçlü fren ihtiyacı.
- [ ] Elektrikli araç:
  - Sessiz sürüş, iyi ivmelenme, özel enerji mekaniği.
- [ ] Araç satın alma ve araç değiştirme ekranı.
- [ ] Her aracın kendine özgü yükseltme ağacı.

## Faz 5 - Çalışan Kargocular

Uzun vadede oyuncu sadece araç kullanan kişi değil, şirket yöneten kişi
olmalıdır.

- [ ] Çalışan kargocu satın alma.
- [ ] Çalışanların otomatik teslimat yapması.
- [ ] Çalışan hız, dikkat ve kapasite özellikleri.
- [ ] Çalışan maaşları.
- [ ] Çalışan yorgunluğu veya vardiya sistemi.
- [ ] Çalışan performans raporu.
- [ ] Oyuncunun manuel sürüş ile otomatik gelir arasında seçim yapması.

## Faz 6 - Görev ve Tekrar Oynanabilirlik

- [ ] Günlük görevler.
- [ ] Hasarsız teslimat serisi.
- [ ] Belirli sürede teslimat görevi.
- [ ] Sadece kırılabilir paket görevi.
- [ ] Trafiksiz değil, yoğun trafikli özel görevler.
- [ ] Bahşiş sistemi.
- [ ] Müşteri memnuniyeti.
- [ ] Combo veya teslimat serisi bonusu.
- [ ] Özel ödüllü nadir kargolar.
- [ ] Kısa süreli etkinlikler.

## Faz 7 - Şehir Yaşamı ve Atmosfer

- [ ] Daha fazla yaya türü.
- [ ] Yaya geçitlerinde bekleyen yayalar.
- [ ] Dükkanlar ve açılıp kapanan işletmeler.
- [ ] Park halindeki araçlar.
- [ ] Günün farklı saatleri.
- [ ] Yağmur veya kaygan zemin gibi kontrollü hava etkileri.
- [ ] Bölgeye özel sesler.
- [ ] Daha fazla çevresel animasyon.
- [ ] Teslimat yapılan evlerde kısa tepki animasyonları.

## 5. Ekonomi Tasarım İlkeleri

Ekonomi oyuncuyu zorlamak için değil, bir sonraki hedefe yönlendirmek için
kullanılmalıdır.

- İlk yükseltme birkaç tur içinde alınabilmeli.
- Yeni bölge açılması anlamlı bir hedef olmalı.
- Oyuncu her tur sonunda en az bir ilerleme hissetmeli.
- Hasar cezaları sert ama oyunu bitirecek kadar ağır olmamalı.
- Daha riskli görevler daha iyi ödüllendirmeli.
- Otomatik çalışanlar açıldığında manuel sürüşün değerini koruyacak bonuslar
  bulunmalı.
- YouTube Playables oturumları kısa olduğu için oyuncu uzun süre beklemek
  zorunda bırakılmamalı.

## 6. Mobil ve YouTube Playables Gereksinimleri

- Oyun ilk birkaç saniyede anlaşılmalı.
- Mobil HUD ekranı kaplamamalı.
- Joystick oyuncunun dokunduğu bölgede açılmalı.
- Butonlar başparmakla kolay kullanılmalı.
- Sonuç ekranı küçük ekranlarda taşmamalı.
- Tek tur mümkün olduğunca kısa tutulmalı.
- Oyun ses kapalıyken de oynanabilir olmalı.
- LocalStorage kullanılamadığında oyun tamamen çalışmayı sürdürmeli.
- Build boyutu ve açılış süresi düzenli olarak kontrol edilmeli.
- Harici hesap veya zorunlu giriş gerektirmemeli.

## 7. Teknik Geliştirme İlkeleri

- Her yeni sistem küçük ve test edilebilir bir paket olarak eklenmeli.
- Oyun mantığı Three.js görsel katmanından ayrı tutulmalı.
- Kalıcı veriler `storage.ts` üzerinden yönetilmeli.
- Yeni ekonomi davranışları unit test ile doğrulanmalı.
- Mobil davranışlar tarayıcı smoke testiyle kontrol edilmeli.
- Mevcut kayıtlar bozulmamalı.
- Yeni sistemler başarısız olduğunda oyun oynanamaz hale gelmemeli.
- Her geliştirmeden sonra test, typecheck ve production build çalıştırılmalı.

## 8. Önerilen Sıradaki İşler

Bir sonraki geliştirme sırası:

1. Bölgeleri görsel olarak birbirinden ayırmak.
2. Bölge seçimi ve bölge kilidi ekranını eklemek.
3. Günlük görevler ve teslimat serisi bonusu eklemek.
4. Garaj/depo binasını görsel olarak büyütmek.
5. Yeni araç türlerinden motosikleti eklemek.
6. Çalışan kargocular için temel otomatik gelir sistemini kurmak.
7. Daha büyük harita ve yeni bölge yollarını eklemek.

## 9. Başarı Ölçütleri

Geliştirmelerin başarılı sayılması için:

- Oyuncu ilk turu yardım almadan tamamlayabilmeli.
- Her tur sonunda para veya ilerleme kazanmalı.
- En az üç farklı anlamlı geliştirme hedefi bulunmalı.
- Trafik ve yayalar oyunu zorlaştırmalı ancak haksız hissettirmemeli.
- Mobil ekranda oyun alanı ve HUD birlikte kullanılabilir kalmalı.
- Yeni bölge veya araç açmak oyuncuya belirgin bir hedef vermeli.
- En az 10-15 dakikalık tekrar oynama isteği oluşturmalı.

