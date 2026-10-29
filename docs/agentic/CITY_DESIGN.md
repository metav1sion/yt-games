# Mini Kargo — City Design & District Specifications

## World Overview
The Mini Kargo map is organized into four interconnected, stylistically distinct districts centered around a unified road network of 39 navigation nodes.

```
+---------------------------------------+
|  Güneş Mahallesi   |  Çarşı Bölgesi   |
|  (Residential)     |  (Commercial)    |
|                    |                  |
+--------------------+------------------+
|  Sanayi Bölgesi    |  Sahil Şeridi    |
|  (Industrial)      |  (Coastal Marina)|
|                    |                  |
+---------------------------------------+
```

---

## 1. Güneş Mahallesi (Residential District)
- **Visual Identity**: Warm, welcoming suburban atmosphere. Soft pastel and terracotta roofs, picket fences, front gardens, flowerbeds, deciduous green trees, authentic American-suburban curbside mailboxes with red alert flags, rooftop solar water-heating panels, and a grand timber entrance welcome archway.
- **Architecture**: Single-family houses, small apartment blocks, neighborhood grocery shops, local park benches, kids playground, and welcoming arch monument ("🏡 GÜNEŞ MAHALLESİ").
- **Logistics Headquarters Campus**: Situated at X: -67..-50, Z: -42..-26. Features the main sorting hub, truck loading dock, corporate monument signage, security guard checkpoint, and an organized 2x2 upgrade apron.
- **Logistics Depot EV Quick-Charger & Pitstop**: Situated at X: -66.5, Z: -25.5. Features twin fast EV charging kiosks with cyan/green LED status rings, flexible charging conduits, ground wireless inductive charging pad, cantilever solar photovoltaic canopy, and dynamic 25-second Supercharge overdrive boost.
- **Güneş Mahallesi Çocuk ve Aile Parkı & Ahşap Kamelya (`createCommunityParkView` - T44)**: Situated in the central residential square at X: -35.0, Z: -65.0:
  - **Peyzaj ve Yürüyüş Yolları**: 18.6m x 18.6m çim ada, taş bordürler, Güney caddeden (Z: -55.5) kuzeye ve doğu-batıya bağlanan 2.6m taş döşeli yürüyüş yolları, merkez dairesel meydan döşemesi, güney giriş ahşap karşılama takı ("🏡 GÜNEŞ MAHALLESİ PARK & ÇOCUK ALANI"), gece yanan kehribar asılı fenerler, beyaz köşe bahçe çitleri, ahşap yükseltilmiş gül ve lavanta tarhları, döküm ayaklı park bankları ve mermer Hayrat Sokak Çeşmesi.
  - **Geleneksel Ahşap Kamelya (Gazebo - X: -31.0, Z: -62.0)**: Yükseltilmiş sekizgen ahşap güverte platformu, 8 adet döküm ahşap taşıyıcı sütun, oymalı ahşap korkuluklar, kiremit kaplı sekizgen çatı, pirinç alem süsü, iç çevre ahşap oturma bankları, piknik masası, bakır çay semaveri, sıcak tavan feneri ve saçağa asılı pentatonik pirinç rüzgar çanları.
  - **Zenginleştirilmiş Çocuk Oyun Alanı (Playground - X: -38.0, Z: -67.0)**:
    - Bordo ve okyanus mavisi çift renkli darbe emici kauçuk karo zemin (10.5m x 8.5m).
    - Çok katlı ahşap oyun kulesi: Tırmanma merdiveni, renkli kumaş çadır çatısı ve canlı sarı helezon/eğimli kaydırak rampası.
    - İkili dinamik salıncak (Swings): Kırmızı A-şeklinde yan direkler, çelik askı zincirleri ve senkron salınan kauçuk oturaklar.
    - Yaylı atlı zıpzıp (Spring Rocker Pony): Ağır çelik helezon yay kaidesi, turuncu at silüeti, kırmızı eyer, tutunma kolları ve dinamik yaylanma animasyonu.
    - Dönen çocuk karuseli (Rotating Merry-Go-Round): Dairesel dönen platform, renkli tutunma parmaklıkları ve sürekli dönüş mekanizması.
    - Ahşap kum havuzu: Sedir ağacı çerçeve, sarı deniz kumu, oyuncak kova ve kürek.
  - **Bahçıvan Selahattin Efendi NPC (X: -34.0, Z: -60.5)**: Zeytin yeşili bahçıvan tulumu, hasır güneş şapkası, pala bıyığı ve elinde galvanizli sulama ibriği ile gül tarhlarını sulayan mahalle bahçıvanı. Yaklaşan oyuncu arabasına kafa çevirme takibi, oyuncu korna çaldığında (`H`) sağ kolunu kaldırarak el sallama ve 3B konuşma balonuyla karşılama (`"🌻 Bahçıvan Selahattin: Hoş geldin evlat! Parkımızın gülleri gibi açtın, kolay gelsin! 🌹"`).
  - **"Mahalle Huzuru" Pitstop Molası & Rüzgar Çanı Ezgisi (`src/game/community-park.ts`)**: Kamelya veya park girişinde 1.2 saniye duraklamak oyuncuya +10 ₺ bahşiş, +1 itibar, pentatonik Web Audio rüzgar çanı ezgisi (`sound.windChime()`), konfeti patlaması ve 20 saniyelik "Mahalle Huzuru" ferahlık bonusu kazandırır (30s soğuma süresi).
  - **Minimap Radar Simgesi**: Güneş Mahallesi üzerinde canlı `🌳` park simgesi.
- **Güneş Mahallesi "Bizim Bakkal" Mahalle Bakkaliyesi & Ekmek/Gazete Tezgahı (`createGroceryStoreView` - T47)**: Situated at the central intersection corner at X: -58.5, Z: -57.0 (facing South-East towards crossroad X: -50, Z: -50 and Park entrance):
  - **Kaldırım Tablası ve Yürüyüş Verandası**: 10.6m x 7.6m pişmiş toprak ve kireçtaşı kaldırım betonu, granit taş bordürler, kiremit rengi karo giriş döşemesi, beyaz/sarı araç yanaşma peronu çizgileri (`GROCERY_STORE_BAY`: X: -55.0, Z: -54.0) ve zemin beyaz kılavuz yön oku.
  - **Geleneksel Bakkal Mimarisi**: 8.2m genişlik, 4.2m yükseklik, 4.6m derinlik. Sıcak pastel krem dış cephe (`#fef9e7`), kiremit süpürgelik kaidesi, beyaz köşe döküm pilasterleri, kiremit çatı saçağı, tuğla baca, üst kat mavi panjurlu pencere ve sardunyalı saksı pervazı.
  - **Aydınlatmalı Tabela ve Vitrin**: Çatı üstünde büyük aydınlatmalı marka levhası (`"🏪 BİZİM BAKKAL · HÜSNÜ AMCA 🥖"`), alt ürün bandı (`"EKMEK · GAZETE · MANAV · SOĞUK MEŞRUBAT"`), 3.6m x 2.0m büyük vitrin camı, sıcak sarı iç aydınlatma (PointLight) ve vitrin arkası rengarenk bakkal ürün rafları (çay kutuları, bakliyat, reçeller).
  - **Nostaljik Kırmızı-Beyaz Çizgili Tente (Awning)**: 7.4m genişlik x 2.2m çıkıntılı kırmızı-beyaz kumaş tente şeritleri, 12 derece öne eğim, dalgalı fırfırlı alt etek ve beyaz ferforje taşıyıcı sütunlar.
  - **Kaldırım Önü Sergi Donatıları**:
    - *Taze Ekmek & Simit Dolabı*: Kırmızı ahşap gövde, cam kapak, iç rafta altın sarısı somun ekmekler, bagetler, susamlı simit halkaları ve `"🥖 TAZE EKMEK"` tabelası.
    - *Döner Tel Gazete Standı*: Döküm ayaklı, krom boru gövdeli, 3 katlı tel gazete cepleri ve kırmızı manşetli günlük gazeteler/mecmualar.
    - *Eğimli Manav Kasaları*: Açılı metal stant üzerinde 3 ahşap meyve-sebze kasası (parlak kırmızı elmalar, turuncu portakallar, taze yeşillikler).
    - *A-Frame Karataş Menü Tabelası*: Ahşap A-çerçeve ve tebeşir yazı etiketi (`"🥖 EKMEK: 8₺ | 🥤 GAZOZ: 12₺ | 📰 GAZETE"`).
    - *Retro Kırmızı Meşrubat Dolabı*: Cam kapaklı soğutucu, yeşil gazoz/ayran şişeleri ve `"BUZ GİBİ GAZOZ"` tabelası.
    - *Sarı PTT Posta Kutusu*: Kaldırım kenarında klasik nostaljik sarı mektup kutusu.
  - **Bakkal Hüsnü Amca NPC (X: -56.5, Z: -55.0)**: Lacivert pantolon, mavi gömlek, beyaz bakkal önlüğü, cebi, kırlaşmış saçları, güler yüzü, pos bıyığı ve EN İKONİK DETAY olarak kulağının arkasına sıkıştırılmış sarı marangoz kurşun kalemi (`#f1c40f` + kırmızı silgi)! Elinde taze francala ekmek tutar. Oyuncu arabasına 18m mesafeden kafa çevirme takibi, oyuncu korna çaldığında (`H`) sağ kolunu kaldırıp el sallama ve 3B konuşma balonlarıyla karşılama (`"🥖 Bakkal Hüsnü Amca: Hoş geldin evlat! Fırından yeni çıktı ekmekler, çıtır çıtır! 🥐"`).
  - **"Bakkal Molası" Pitstop Etkileşimi (`src/game/grocery-store.ts`)**: Bakkal servis peronunda (X: -55.0, Z: -54.0) 1.2 saniye duraklamak oyuncuya +10 ₺ bahşiş/esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25 saniyelik "Buz Gibi Gazoz Enerjisi" çeviklik buff'ı, pirinç kapı çıngırağı sesi (`sound.shopBell()`), konfeti ve altın sikke yağmuru kazandırır (35s soğuma süresi).
  - **Minimap Radar Simgesi**: Güneş Mahallesi üzerinde canlı `🏪` bakkaliye simgesi.
- **Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu" (`createSchoolView` - T51)**: Situated along the southern frontage of the Güneş boulevard at X: -35.0, Z: -36.5 (facing North directly across from the Community Park):
  - **Okul Tören Bahçesi ve Yanaşma Peronu**: 14.0m x 12.0m taş döşeli tören avlusu, asfalt servis yanaşma cebi (`SCHOOL_BAY`: X: -35.0, Z: -46.5), sarı-beyaz park sınır çizgileri, bordür emniyet çizgileri ve zemin beyaz kılavuz yön oku.
  - **Erken Cumhuriyet Dönemi Taş Mektep Mimarisi**: 9.4m genişlik x 4.6m yükseklik x 5.2m derinlik. Kesme kireçtaşı cephe kaplaması (`#dcdde1`), gri taş kaide süpürgeliği, köşe silmeleri (ashlar quoins), masif ahşap giriş kapısı ve taş basamaklar, simetrik alt-üst kat kemerli sınıf pencereleri ve kiremit kırma çatı.
  - **Bakır Çan Kulesi & Pirinç Okul Zili (Copper Bell Tower & Belfry)**: Çatının tam ortasında 4 kemerli bakır kule ayağı (`#2e7d32` bakır patina), piramidal bakır kubbe çatısı, kubbe tepesinde pirinç alem süsü ve kule içinde asılı parlayan pirinç okul zili / çanı (`#f39c12`).
  - **Aydınlatmalı Tabela ve Kurumsal Şerit**: Çatıda öne eğimli büyük ışıklı tabela (`"🏫 GÜNEŞ MAHALLESİ İLKOKULU 🔔"`), alt kurumsal şerit (`"T.C. MİLLİ EĞİTİM BAKANLIĞI · TARİHİ TAŞ MEKTEP · 1938"`) ve gece cepheyi aydınlatan PointLight armatürü.
  - **Tören Bayrak Direği ve Dalgalanan Türk Bayrağı**: Bahçe batısında kademeli beyaz mermer kaide üzerinde 6.5m paslanmaz çelik bayrak direği, tepede pirinç alem ve rüzgarda canlı dalgalanan Türk Bayrağı kumaşı (`#e74c3c` zemin + ay yıldız amblemi).
  - **Renkli Seksek Alanı (Hopscotch Court - X: -31.8, Z: -39.7)**: Avlu zemininde 1'den 10'a kadar numaralandırılmış, canlı tebeşir renklerinde (turkuaz, sarı, mercan pembesi, fıstık yeşili, turuncu, leylak) seksek kareleri, beyaz tebeşir hatları ve tepe "GÖKYÜZÜ" yay dairesi.
  - **Park Etmiş Belediye Okul Servis Minibüsü ("34 MK 2026 - OKUL TAŞITI")**: Okul önü park cebinde (X: -30.4, Z: -44.0) 4.8m uzunluğunda canlı okul sarısı gövde (`#f1c40f`), beyaz tavan, siyah tampon, karartılmış camlar, krom jantlar, ön-arka `"34 MK 2026"` plakaları, yan `"OKUL TAŞITI"` tabelası ve şoför tarafında kırmızı sekizgen `"DUR"` levhası.
  - **Okul Geçidi Görevlisi NPC — "Hasan Dayı" (X: -37.2, Z: -46.5)**: Lacivert pantolon, fosforlu sarı reflektörlü emniyet yeleği (`#c0ca33`), yatay gümüş reflektör bantları, beyaz zabıta kasketi, pala bıyık, elinde tuttuğu çift taraflı `"DUR / GEÇ"` okul geçidi paleti ile trafiği yavaşlatma animasyonu, oyuncu aracına 20m mesafeden kafa/gövde takibi (head tracking), korna ve duraklamada iki kolunu kaldırarak selamlama ve 3D konuşma balonuyla karşılama (`"🏫 Hasan Dayı: Aferin evlat! Okul geçidinde yavaşlayan şoförün başımızın üstünde yeri var! ⭐"`).
  - **Okul Bahçesi Donatıları**: Mermer okul bahçesi hayrat sokak çeşmesi, pirinç musluk, öğrenci bisiklet park demiri, camlı okul duyuru panosu (`"DERS PROGRAMI & DUYURULAR"`), batı ve doğu beyaz bahçe çitleri ile taş köşe direkleri.
  - **"Okul Yolu Saygısı" Mola Etkileşimi (`src/game/school.ts`)**: Servis peronunda 1.2 saniye duraklamak: +10 ₺ bahşiş/esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Okul Yolu Saygısı" güvenli sürüş ve nezaket buff'ı, prosedürel pirinç okul zili ezgisi (`sound.schoolBell()`), konfeti ve altın sikke yağmuru kazandırır (35s soğuma süresi).
  - **Minimap Radar Simgesi**: Güneş Mahallesi üzerinde canlı `🏫` okul simgesi.
- **Güneş Mahallesi "Geleneksel Mahalle Semt Pazarı & Taze Manav Tezgahları" (`createMarketView` - T54)**: Situated along the northern curb of the Güneş boulevard at X: -72.0, Z: -58.5 directly connected to Bizim Bakkal:
  - **Pazar Yeri Meydan Tablası ve Yanaşma Peronu**: 12.6m x 9.0m taş döşeli pazar meydanı tablası, granit taş bordürler, asfalt servis yanaşma peronu cebi (`MARKET_BAY`: X: -72.0, Z: -52.5), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
  - **Üç Bölümlü Geleneksel Ahşap Pazar Tezgahları & Çizgili Güneşlik Tenteleri**: Masif çam taşıyıcı direkler, çatı makasları, güneye/yola doğru eğimli masif çam tezgah tablaları, 3 canlı renkli kumaş tente (Sol: sarı-beyaz narenciye tentesi, Orta: kırmızı-beyaz tarla sebzeleri tentesi, Sağ: zümrüt yeşili-beyaz bostan yeşillikleri tentesi) ve dalgalı fırfırlı saçaklar (scalloped valance fringes).
  - **Aydınlatmalı Çatı Tabelası & Kurumsal Esnaf Yazısı**: Orta çadır üzerinde öne eğimli büyük ışıklı çatı tabelası (`"🍉 GÜNEŞ MAHALLESİ SEMT PAZARI · CEMİL DAYI 🍋"`), alt kurumsal şerit (`"GÜNLÜK TAZE MEYVE & SEBZE · ÇİFTLİKTEN SOFRAYA · 1954"`), altın sarısı pervaz çerçevesi ve gece tezgahları aydınlatan sıcak sarı PointLight fener armatürü.
  - **Kademeli Ahşap Kasalar & Zengin Akdeniz Meyve/Sebze Yığınları**:
    - *Meyveler & Narenciye*: Kasalarda parlak sarı Ege limonları, sulu turuncu portakallar ve kıpkırmızı elma piramitleri.
    - *Tarla Sebzeleri*: Kasalarda yeşil taç saplı parlak kırmızı domates piramitleri, çıtır yeşil Çengelköy salatalıkları ve koyu mor patlıcanlar.
    - *Yeşillikler & Bostan*: Kasalarda taze maydanoz, roka demetleri ve sarı dolmalık biberler.
  - **Zemin Dev Karpuz ve Bal Kavunu Piramidi (X: -74.8, Z: -56.5)**: Tezgah önünde ahşap EUR palet üzerinde çizgili koyu yeşil dev karpuzlar, dilimlenmiş sulu içi kıpkırmızı karpuz dilimi ve altın sarısı bal kavunları.
  - **Nostaljik Mekanik Asılı Çift Kefeli Pazar Terazisi (Balance Scale)**: Dövme demir askı kolu, pirinç askı telleri, çift pirinç kefe, sol kefede tartılan domates, sağ kefede 250g gram ağırlığı, üst ibre mekanizması ve tezgah üzerinde ahşap yuvada döküm pirinç ağırlık kulesi seti (100g, 250g, 500g, 1kg).
  - **Tebeşirli Fiyat Şövalesi & Esnaf Donatıları**: Ahşap A-şövale kara tahta fiyat listesi (`"🍅 DOMATES: 15₺ | 🍋 LİMON: 20₺ | 🍉 KARPUZ: 10₺ | 🥒 SALATALIK: 12₺"`), kraft kese kağıdı destesi ve hasır pazar sepeti.
  - **Animasyonlu Pazarcı Esnafı NPC — "Pazarcı Cemil Dayı" (X: -70.5, Z: -55.8)**: Kadife kasket (flat cap), çizgili pazarcı gömleği, cepli esnaf önlüğü, pos bıyık, elinde taze sarı narenciye tutma pozu, 22m mesafeden oyuncu aracına kafa/gövde takibi (head tracking), korna ve duraklamada iki kolunu havaya kaldırarak coşkuyla selamlama ve 3D konuşma balonuyla karşılama (`"🍉 Pazarcı Cemil Dayı: Gel vatandaş geeel! Çiftlikten taze çıktı, sulu sulu domatesler, kütür kütür karpuzlar! 🍋"`).
  - **"Taze Pazar Bereketi" Mola Bonusu & Prosedürel Pazar Terazisi Sesi (`src/game/market.ts`)**: Servis peronunda 1.2s duraklama: +10 ₺ nakit bahşiş/esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Taze Pazar Bereketi" çeviklik, zindelik ve nitro buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel pirinç kefe çınlaması ile terazi rezonansı sesi (`sound.marketScale()`).
  - **Minimap Radar Simgesi**: Güneş Mahallesi üzerinde canlı `🧺` pazar sepeti simgesi.
- **Road & Traffic**: Calm residential streets, cul-de-sacs, residential speed bumps, pedestrian crosswalks, and an unblocked stunt jump ramp (`ramp_sunny_depot` at X=-50, Z=-22) equipped with high-visibility reflector bollards.
- **Soundscape**: Soft summer breeze whisper, rustling trees, and cheerful morning bird chirps.
- **Key Delivery Points**: 4 residential house front porches and garden gates with clear driveways.

---

## 2. Çarşı Bölgesi (Commercial District)
- **Visual Identity**: Dense, bustling urban market center. Storefront awnings, neon and wooden shop signage, outdoor cafe seating, streetlamps, colorful banners, authentic striped-canopy open-air market stalls (Pastane, Manav, Kitapçı, Hediyelik), festive overhead celebration bunting pennants across alleyways, A-frame chalkboard cafe menus, sidewalk flower planters, and the Historic Piazza Clock Tower.
- **Centerpiece Landmark**: Historic Tiered Marble Fountain (`buildPiazzaFountain`) centered in the Piazza roundabout (X: 50, Z: 50) featuring an octagonal marble basin, turquoise pool water, and animated water spray droplets splashing into the bowl.
- **Traditional Street Vendor — Simitçi Hasan Usta**: Situated at X: 42.0, Z: 47.0 facing the central square. Iconic crimson red pushcart with polished brass spoke wheels, clear glass vitrine containing tiers of freshly baked sesame simits, wicker display tray, red-and-white scalloped parasol umbrella, and friendly animated vendor NPC waving to approaching drivers and honks. Offers fresh simits for 5 ₺ granting +1 reputation and energy sprint doping.
- **Tarihi Çarşı Tramvay Hattı & Nostaljik Tramvay (`createTramView` - T42)**:
  - **Gömme Çelik Ray Hattı**: Çarşı ana caddesi (Z: 34.0) boyunca X: 16.0 .. 82.0 arasında uzanan 67 metrelik çift gömme çelik ray (1.3m ray açıklığı, meter/narrow gauge). Her 2.2 metrede bir gömme travers taşları ve iki hatta çelik/ahşap hat sonu emniyet tamponları (X: 15.5 ve X: 82.5) ile sarı-siyah reflektörler.
  - **Katener Havai Hat ve Direkleri**: Kaldırım kenarı boyunca (Z: 37.35) X: 16, 29, 42, 55, 68, 82 koordinatlarında 6 adet ferforje döküm kaideli direk, yola uzanan konsol kolları, seramik izolatörler ve Y: 4.2m seviyesinde boydan boya uzanan bakır temas teli.
  - **Tarihi Çarşı Tramvay Durağı (X: 64.0, Z: 37.8)**: 8.5m x 2.2m yükseltilmiş ahşap/taş yolcu peronu, sarı tırtıklı kabartmalı emniyet çizgisi, engelli/yolcu erişim rampaları, Victorian/Ottoman tarzı 4 flütlü döküm sütunlu yeşil metal tonoz çatı, nostaljik hat güzergah panosu, ahşap bekleme bankı, bekleyen yolcu NPC'si ("Güleryüzlü Yolcu"), kırmızı-beyaz nostaljik durak direği ("DURAK · T2") ve gece ışıyan asılı kehribar fener.
  - **İETT 1923 Beyoğlu Nostaljik Tramvay Modeli**:
    - Boyutlar: 5.4m uzunluk, 2.0m genişlik, 3.2m yükseklik (pantografla 4.2m).
    - Orijinal Beyoğlu tramvayı bordo gövde rengi (`#c0392b`), fildişi/krem pencere kuşağı (`#fdfefe`), altın sarısı süs çıtası, fener çatılı ahşap tavan ve havalandırma menfezleri.
    - Her iki uçta açık makinist sahanlıkları, siyah ferforje korkuluklar, katlanır emniyet kapıları, pirinç el freni çarkı ve vatman kontrol kolu (reosta).
    - Katenere temas eden çelik/pirinç elmas pantograf ve bakır sürtünme pabucu.
    - Aydınlatılmış ön/arka hat tabelası: `"T2 NOSTALJİK TRAMVAY"`, vintage pirinç ön/arka fenerler ve gece ışıyan sıcak sarı yolcu camları.
    - Yol seviyesi emniyet ızgarası (cowcatcher).
  - **Vatman İhsan Efendi NPC**: Lacivert vatman ceketi, altın düğmeler, kasketli şapka ve pala bıyık. Tramvayın gidiş yönüne göre ön sahanlıkta yer alır. Oyuncu yaklaşıp korna (`H`) çaldığında sağ kolunu kaldırarak el sallar ve konuşma balonu gösterir (`"🚋 Vatman İhsan: Çan çan! Yol kargonun kaptan, buyur geç!"`).
  - **Oynanış & Etkileşim (`src/game/tram.ts`)**:
    - Tramvay hızı: ~3.6 m/s (~13 km/h).
    - İstasyonda ~4 saniye duraklama yapar, varış ve kalkışta nostaljik pirinç çan çalar (`sound.tramBell()`).
    - Terminus uçlarında yön değiştirir, kalkış çanı çalar.
    - Oyuncu ray üzerinde önünü kapatırsa durup yol verir (`phase: "yielding"`).
    - Durakta veya tramvay yanında duraklama (1.2s) "Nostaljik Hat Hatırası" bonusu kazandırır (+10 ₺, +1 itibar, konfeti patlaması).
    - Şehir radarı / minimap üzerinde canlı hareket eden `🚋` simgesi.
- **Tarihi Çınaraltı Kıraathanesi & Tavla/Kahve Meydanı (`createCoffeeHouseView` - T48 - X: 38.5, Z: 62.0)**:
  - **Arnavut Kaldırımı Meydan Terası**: 14.0m x 12.0m genişliğinde rustik arnavut kaldırımı meydan döşemesi, koyu granit/ahşap bordürler, oyuncu servis peronu (`COFFEE_HOUSE_BAY`: X: 43.0, Z: 56.5), park sınır çizgileri ve zemin beyaz kılavuz yön oku.
  - **Tarihi Kesme Taş Kıraathane Binası**: 8.4m genişlik, 4.4m yükseklik, 4.8m derinlik. Açık kireçtaşı/traverten kesme taş duvarlar (`#d7ccc8`), koyu tuğla köşe taşları (`#8d6e63`), alaturka kiremit kırma çatı (`#a04000`), ahşap saçak frizi, taş köz bacası, oymalı kemerli pencereler, sıcak sarı iç aydınlatma (PointLight) ve oymalı çift kanatlı ahşap giriş kapısı.
  - **Aydınlatmalı Tabela ve Yeşil-Krem Tente**: Çatı üstünde aydınlatmalı tabela (`"☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿"`), alt ürün bandı (`"KUMDA TÜRK KAHVESİ · TAZE ÇAY · TAVLA KEYFİ"`), koyu yeşil ve krem çizgili kumaş tente ve fırfırlı saçak.
  - **Anıtsal Ulu Çınar Ağacı (X: 36.8, Z: 58.8)**: 5.8m boyunda heybetli yaşlı çınar gövdesi, zemin kök payandaları, kalın ana dallar, 7 kümeli geniş yeşil yaprak kubbesi (`#2e7d32`, `#388e3c`, `#43a047`, sonbahar sarısı dokunuş), gövdeyi çevreleyen 8 parçalı ahşap halka sedir (tree surround bench) ve dallardan sarkan 3 adet pirinç asılı kehribar cam kandil (gece dinamik ışıyan PointLight).
  - **Açık Hava Hasır Tabureli Masalar**:
    - *Kızışmalı Tavla Masası*: Yuvarlak ahşap masa, açık sedef kakmalı tavla tahtası, kumaş zemin, siyah-beyaz pullar, minyatür zarlar ve 2 adet hasır örgülü tabure.
    - *Kumda Kahve & Çay Masası*: Yuvarlak masa, uzun saplı bakır cezve, kırmızı-beyaz tabaklı ince belli cam çay bardakları ve kesme şekerler.
    - *Gazete & Kahve Masası*: Yuvarlak masa, açık günlük gazete ve pirinç zarflı porselen kahve fincanı.
  - **"Kumda Kahve" Ocağı & Bakır Semaver**: Tuğla tezgah kaidesi üzerinde sıcak kavurma kumu dolu bakır kum teknesi, kuma gömülü cezveler, çift musluklu bacalı bakır çay semaveri ve karataş tebeşir menü tabelası (`"☕ Kumda Kahve: 15₺ | 🍵 Tavşan Kanı Çay: 5₺ | 🎲 Tavla: Müesseseden"`).
  - **Kahveci Bekir Usta NPC (X: 40.5, Z: 58.5)**: Lacivert kumaş pantolon, beyaz gömlek, kahverengi işlemeli esnaf yeleği, beyaz önlük, pos bıyık, bordo Osmanlı esnaf kasketi/fezi, sol elinde 3 telli pirinç askılı çay tepsisi ve üzerinde buharı tüten 3 ince belli çay! Ritmik tepsi salınım animasyonu, oyuncu arabasına 18m mesafeden kafa çevirme takibi, oyuncu korna çaldığında (`H`) sağ kolunu kaldırıp el sallama ve 3B konuşma balonlarıyla karşılama (`"☕ Kahveci Bekir Usta: Hoş geldin evlat! Közde kahvemiz taze, tavla masası hazır! 🎲"`).
  - **"Esnaf Kahvesi" Pitstop Etkileşimi (`src/game/coffee-house.ts`)**: Kıraathane servis peronunda (X: 43.0, Z: 56.5) 1.2 saniye duraklamak oyuncuya +10 ₺ bahşiş/esnaf ikramı, +1 itibar, +0.45 nitro dolumu, 25 saniyelik "Közde Kahve Zindeliği" buff'ı, prosedürel ahşap tavla zarı yuvarlanma sesi (`sound.diceRoll()`), konfeti ve altın sikke yağmuru kazandırır (35s soğuma süresi).
  - **Minimap Radar Simgesi**: Çarşı meydanında canlı `🎲` tavla/kıraathane simgesi.
- **Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi" (`createBakeryView` - T52 - X: 59.5, Z: 24.5)**:
  - **Kaldırım Tablası ve Yanaşma Peronu**: 8.0m x 9.5m pişmiş toprak klinker tuğla kaldırım döşemesi, granit bordürler, oyuncu servis peronu (`BAKERY_BAY`: X: 59.5, Z: 31.2) tarihi tramvay caddesi (Z: 34) kuzey cephesinde, sarı-beyaz bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
  - **Geleneksel Taş & Tuğla Fırın Mimarisi**: 7.6m genişlik, 4.8m yükseklik, 5.2m derinlik. Kesme kireçtaşı ve moloz taş kaide süpürgeliği (`#795548`), pişmiş kırmızı-kahve klinker tuğla duvarlar (`#a04000`), taş köşe silmeleri (`#d7ccc8`), ahşap saçak kornişi (`#5d4037`), kiremit kırma çatı (`#b03a2e`), üst kat lojman kemerli pencereleri ve ferforje korkuluklar.
  - **Köz Odun Ateşli Kubbeli Taş Fırın Gözü (Wood-Fired Brick Dome Oven)**: Ön cepheye uzanan kemerli refrakter tuğla kubbe fırın gövdesi (`#c0392b`), kemerli fırın ağzı taş silmesi, iç haznede yanan meşe odunu közleri yatağı (`#e65100`, `#ff5722`), dinamik titreyen kehribar/turuncu alev ışığı (PointLight), taş taban üzerinde pişen taze susamlı simitler ve Ramazan pideleri.
  - **Fırın Bacası ve Canlı Odun Dumanı**: 3.6m yüksekliğinde tuğla baca (`#6d4c41`), metal döner duman külahı (`#37474f`) ve bacadan gökyüzüne ritmik yükselen 5 adet yarı saydam beyaz odun dumanı partikülü.
  - **Aydınlatmalı Çatı Tabelası & Nostaljik Tente**: Çatıda öne eğimli büyük ışıklı tabela (`"🥖 MEŞHUR TARİHİ SİMİT FIRINI · TAŞ FIRIN ODUN ATEŞİ 🥨"`), alt kurumsal şerit (`"GELENEKSEL ODUN TAŞ FIRINI · ÇITIR SİMİT & RAMAZAN PİDESİ · 1928"`), gece PointLight tabela armatürü, kırmızı-krem çizgili kumaş tente ve dalgalı fırfırlı saçak.
  - **Fırın Önü Sergi ve Donatıları**:
    - *Camlı Ahşap Simit & Ekmek Vitrini*: Sıcak sarı iç aydınlatmalı vitrin camı ve `"TAZE ÇITIR SİMİT"` tabelası.
    - *Dikey Ahşap Simit Askılık Direği ("Simit Ağacı")*: 2.3m sedir direk, çapraz kollar ve üzerlerinde asılı susamlı simit halkaları.
    - *İstiflenmiş Jüt Un Çuvalları*: Duvar dibinde yığılmış 3 adet un çuvalı ve `"UN 50 KG"` dokusu.
    - *Meşe Odunları Yığını*: Fırın közü için istiflenmiş yarılmış meşe kütükleri.
    - *Tebeşirli Karataş A-Frame Fiyat Tabelası*: `"🥨 SİMİT: 7₺ | 🍞 EKMEK: 12₺ | 🫓 PİDE: 15₺"`.
    - *Geleneksel Pirinç Çay Semaveri*: Mermer sehpa üzerinde çift demlikli pirinç semaver.
  - **Fırıncı Şaban Usta NPC (X: 57.8, Z: 28.5)**: Beyaz fırıncı pantolonu, gömleği, un lekeli önlüğü, beyaz kumaş fırıncı bonesi, pos bıyığı, elinde tuttuğu 2.4m ahşap fırın küreği (baker's peel) ve kürek üstünde fırına sürülüp çıkarılan dumanı tüten çıtır susamlı simit! Fırına simit sürme animasyonu, oyuncu arabasına 22m mesafeden kafa/gövde takibi, korna ve duraklamada küreği havaya kaldırıp coşkuyla selamlama ve 3D konuşma balonuyla karşılama (`"🥖 Fırıncı Şaban Usta: Gel kaptan geel! Fırından yeni çıktı, çıtır susamlı simitler yakıyor! 🥨"`).
  - **"Sıcak Simit Çıtırı" Mola Etkileşimi (`src/game/bakery.ts`)**: Servis peronunda (X: 59.5, Z: 31.2) 1.2 saniye duraklamak oyuncuya +10 ₺ bahşiş/esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25 saniyelik "Sıcak Simit Çıtırı" zindelik ve çeviklik buff'ı, prosedürel taş taban fırın küreği & odun ateşi çıtırtısı sesi (`sound.woodOven()`), konfeti ve altın sikke yağmuru kazandırır (35s soğuma süresi).
  - **Minimap Radar Simgesi**: Çarşı bölgesinde tarihi tramvay caddesi üzerinde canlı `🥖` fırın simgesi.
- **Architecture**: Multi-story commercial buildings, bakeries, cafes, boutique shops, and a central plaza with a marble statue column, tiered fountain, and historic clock tower at the alley entrance.
- **Road & Traffic**: Dual-lane thoroughfares, heavy pedestrian crossings, active delivery loading zones, curbside parked vehicles.
- **Soundscape**: Bustling market crowd murmur, distant cafe cup chimes, and lively merchant activity.
- **Key Delivery Points**: 4 commercial storefronts, cafe service entrances, and central plaza kiosks.

---

## 3. Sanayi Bölgesi (Industrial District)
- **Visual Identity**: Utilitarian, functional heavy logistics hub. Corrugated metal cladding, industrial smokestacks, security fences, stacked shipping containers, elevated steel pipe corridors, an imposing 10.4m x 8.5m container gantry crane with an operator cab and airborne suspended cargo container, high-voltage electrical transformer substation (`buildElectricalSubstation`), and dual heavy industrial floodlight towers (`buildIndustrialFloodlight`).
- **Interactive Gas Station & Convenience Store with Car Wash Bay (`createGasStationView`)**: Situated at the Sanayi/Çarşı cross-artery (X: 64, Z: -9) facing the main boulevard:
  - **Forecourt Concrete Slab**: 18m x 11.5m paved apron with yellow entrance/exit directional chevrons, white drive lanes, and safety curbs.
  - **Overhead Illuminated Cantilever Canopy**: 12.8m x 8.2m canopy at Y: 4.2m with crimson/yellow brand fascia ("⛽ MİNİ PETROL · 7/24"), 4 tubular steel columns with yellow/black crash guard bollards, and 6 recessed downlight spotlights with dynamic night emissive boost.
  - **Twin Dual-Sided Fuel Dispenser Islands**: Raised concrete curbed islands with stainless steel rails, digital backlit cyan LED price readouts, flexible rubber hoses with green (Euro Diesel) & blue (Kurşunsuz 95) nozzles, overhead fire extinguisher, and floating radial progress ring. 1.2s stationary stop refuels nitro to 100%, resets collision wear, and awards +1 reputation with double bell chime.
  - **24/7 Convenience Store ("Mini Market & Cafe")**: Glass storefront with warm interior illumination, roof fascia sign ("🏪 MİNİ MARKET · 24s AÇIK"), curbside Air & Water tower ("Hava & Su"), A-frame chalkboard menu ("☕ ÇAY & KAHVE"), and animated attendant NPC Selim Usta who waves and greets drivers.
  - **Automated Vehicle Wash Bay ("Oto Yıkama")**: Drive-through portal with overhead neon marquee ("🚿 OTO YIKAMA"), twin vertical blue/cyan rotating foam rollers, top horizontal yellow rotating roller, and high-pressure spray jets. Driving through wash bay awards 30s "Pırıl Pırıl" clean buff (`#wash-pill`), glistening sparkles, and +10 ₺ cash tip.
- **Dynamic Road Work Hazard Zone & Municipal Road Crew (`createRoadWorkView`)**: Situated at the Sanayi southern artery (X: 26, Z: -16):
  - **Closed-Lane Excavation Trench**: 6.5m x 2.2m dark asphalt cut with layered gravel/sand mounds and brick rubble closing the northern lane (Z: -14.5) while keeping the southern lane (Z: -18.0) open as a single-lane passage.
  - **Flashing Amber Hazard Tower**: Steel lattice mast with diagonal hazard stripes, warning sign ("TEK ŞERİT DİKKAT"), overhead amber LED beacon with pulsing PointLight (1.5x day / 2.5x night emissive boost) oscillating at 0.4s intervals.
  - **Reflective Safety Cones & A-Frame Barricades**: 4 fluorescent orange traffic cones with dual white retroreflective bands and 2 timber A-frame barricades with alternating diagonal red and white stripes.
  - **Municipal Road Crew NPCs ("Belediye Fen İşleri")**:
    - *Kadir Usta (Flagman / Yönlendirici)*: High-vis vest, orange hard hat, animated right-arm flag waving with STOP/SLOW paddle. Callouts: *"👷 Kadir Usta: Kolay gelsin kaptan! Tek şeride dikkat! 🚧"* when honked at, and *"👷 Kadir Usta: Yavaş kaptan, şantiye burası!"* when speeding.
    - *Murat Usta (Jackhammer Operator / Kazı Ustası)*: Orange work coveralls, yellow hard hat, holding a vibrating pneumatic jackhammer with synchronous particle dust bursts (`spawnConstructionDust`).
  - **Safe Speed Passing Challenge**: Passing through the bottleneck at a controlled safe speed (<=12.5 m/s) without collision awards +15 ₺ cash reward, +1 reputation, and confetti fanfare with a 25-second cooldown.
- **Industrial Sanayi Freight Rail Spur & Shunting Locomotive (`createTrainView`)**: Situated along the Sanayi industrial corridor (Z: -38.0, X: 15.0..83.0):
  - **Ballasted Heavy Steel Rail Line & Buffer Stops**: 68m crushed dark granite ballast bed, creosote timber sleepers every 1.5m, standard 1.435m gauge twin extruded steel rails, rubberized level crossing road deck flangeway panels at X = 50, and heavy steel terminus buffer stops with yellow/black hazard chevrons and red reflector discs at X: 15.0 and X: 83.0.
  - **Automated Level Crossing (Hemzemin Geçit - X: 50.0, Z: -38.0)**: Dual crossing signal masts facing northbound and southbound traffic on the main boulevard. Equipped with St. Andrew's crossbuck signs ("DUR · DİKKAT TREN"), alternating flashing red LED warning lamps, electronic bell chime audio (`sound.railCrossing()`), and articulated barrier arms with reflective red-and-white stripes lowering from 85° to 0° to block traffic while trains approach and cross.
  - **Sanayi Freight Siding Platform & Dispatch (X: 26.0, Z: -34.8)**: Raised 13.0m x 3.6m reinforced concrete dock platform with yellow/black safety curb edge, vehicular loading ramp, steel canopy shelter with floodlight downlight, route sign ("SANAYİ YÜKLEME RAMPASI"), parked yellow forklift, wooden EUR pallets loaded with industrial chemical/oil drums, banded timber crates, and animated Supervisor NPC Antrepo Şefi Necati waving his arm upon player approach or honk. Lingering near platform awards "Sanayi Demiryolu Lojistik Bonusu" (+15 ₺, +1 rep).
  - **TCDD DE 11000 / DH 7000 Heavy Shunter Diesel Locomotive**: Safety orange and industrial yellow steel body (`#f39c12`), dark underframe chassis (`#2d3436`), dual 2-axle heavy cast-steel bogies with 8 rotating flanged wheels, front/rear hazard chevron pilot beams, automatic knuckle couplers, engine hood with cooling louvers, roof exhaust fan, vertical exhaust stack emitting dynamic diesel smoke puffs, sealed-beam headlights with night emissive boost, rotating amber cab roof beacon, illuminated cab interior, and animated driver Makinist Cemal Usta who waves upon player honk (`H`) and displays a 3D speech bubble callout (`"🚂 Makinist Cemal: Düüüt! Sanayi Ekspresi seyrinde, hemzemin geçide dikkat! 📦"`).
  - **Coupled Heavy Industrial Freight Flatcars**:
    - *Flatcar 1*: Heavy steel flatbed platform on dual bogies carrying a 20ft Intermodal Shipping Container in bold cobalt blue (`#2980b9`) with silver corner castings, locking rods, and "TCDD TAŞIMACILIK · 20FT" stencils.
    - *Flatcar 2*: Heavy steel machinery flatcar on dual bogies carrying a giant 2.2m diameter timber cable spool wound with copper wire (`#d35400`) and a crated industrial machinery unit secured with yellow ratchet tie-down straps.
  - **Multi-Tone Diesel Air Horn & Crossing Bell**: Synthesized procedural Web Audio 3-tone locomotive air horn (`sound.trainHorn()`) with low chord (147Hz, 185Hz, 220Hz) and rhythmic crossing bell (`sound.railCrossing()`).
  - **Radar Minimap Freight Train Icon**: Real-time animated `🚂` tracking icon navigating the Sanayi industrial sector.
- **Sanayi "Usta Eller Oto Sanayi" Tamirhanesi & Araç Bakım Lifti (`createAutoRepairView`)**: Situated along the Sanayi boulevard (X: 78.0, Z: -57.5) facing the main boulevard (Z: -50) directly adjacent to the Container Gantry Crane:
  - **Workshop Apron & Structure**: 15.4m x 8.6m industrial dark concrete apron slab with dark slate blue steel hangar frame, corrugated siding, roof trusses, hazard yellow/black perimeter curbs, oil stain decals, and large illuminated marquee sign ("🔧 USTA ELLER OTO SANAYİ · MOTOR & MEKANİK 🚗").
  - **Two-Post Working Hydraulic Vehicle Lift (X: 74.5, Z: -58.5)**: Safety blue steel C-channel posts (3.6m tall) with top crossbeam cable tray, push-button power unit, carriage tracks, and 4 articulated lifting arms.
  - **Hoisted Customer Project Vehicle**: Classic turquoise coupe hoisted on the lift arms, elevating and lowering dynamically with `state.liftHeight` (0.45m - 1.75m).
  - **Workshop Detailing & Equipment**: Red 5-drawer rolling tool chest with top socket tray, tire changing machine with turntable and bead breaker arm, wheel balancer with digital LED display, heavy-duty timber workbench with cast iron bench vise and tool shadow board, steel tire display rack with 4 tires, stacked wheels, 3 industrial 200L oil drum barrels (Castrol, Mobil, Opet) with rotary hand pumps, and dual oxygen/acetylene gas cylinders.
  - **Chief Mechanic NPC ("Tamirci Muharrem Usta" - X: 76.0, Z: -56.5)**: Navy mechanic coveralls with grease smudges, red bandana/cap, gray mustache, holding a chrome ratchet socket wrench. Animated tightening motion, vehicle head tracking within 18m, celebratory wrench-waving upon player honk (`H`) or approach, and 3D speech bubble callouts (`"🔧 Tamirci Muharrem Usta: Gel kaptan geeel! Motorun sesinden anlarım, saat gibi çalışacak! 🚗💨"`).
  - **Player Service Bay & "Sanayi Bakımı" Interaction (X: 81.0, Z: -56.0)**: Drive-in service stall with floor marking box, white directional arrow, and curbside digital air & water inflator tower (32 PSI). 1.2s stationary dwell awards +10 ₺ cash bonus, +1 reputation, full nitro refill, instant vehicle package damage restoration (repairs in-transit cargo to 0 damage), 30s "Sanayi Turbo Ayarı" buff, confetti and spark shower, and 40s cooldown.
  - **Procedural Socket Wrench Audio**: Rapid synthesized ratchet micro-clicks (3400Hz - 4800Hz) in `sound.wrenchClick()`.
  - **Radar Minimap Icon**: Real-time `🔧` tracking icon at X: 78, Z: -57.5.
- **Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (`createRestaurantView` - T50)**: Situated along the northern curb of the Sanayi boulevard at X: 30.0, Z: -57.0 (facing South towards Z: -50):
  - **Kaldırım Verandası ve Servis Yanaşma Peronu**: 11.5m x 9.0m beton veranda tablası, granit bordürler, oyuncu servis peronu (`RESTAURANT_BAY`: X: 30.0, Z: -52.5), sarı-siyah sanayi emniyet çizgileri, beyaz park sınır çizgileri ve zemin beyaz kılavuz yön oku.
  - **Geleneksel Esnaf Lokantası Mimarisi**: 9.2m genişlik, 4.2m yükseklik, 5.2m derinlik. Sıcak kiremit kırmızısı tuğla süpürgelik kaidesi (`#9c3d23`), krem sıvalı ana duvarlar (`#fdfbf7`), ahşap saçak frizi, alaturka kiremit kırma çatı (`#b03a2e`), tuğla havalandırma bacası ve metal yağmur siperliği.
  - **Aydınlatmalı Tabela ve Çift Şerit**: Çatı üstünde kameraya doğru 12° öne eğimli büyük tabela (`"🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"`), alt ürün bandı (`"GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & PİLAV"`), altın çerçeve ve gece yanan PointLight spot ışığı.
  - **Kırmızı-Sarı Çizgili Esnaf Tentesi (Awning)**: 8.2m genişlik x 1.65m çıkıntılı kırmızı ve sarı çizgili kumaş tente, dalgalı fırfırlı ön saçak ve siyah döküm çelik taşıyıcı sütunlar.
  - **Büyük Vitrin Camı & İç Aydınlatma**: 4.8m genişliğinde vitrin çerçevesi, şeffaf cam, çift kanatlı ahşap giriş kapısı ve sıcak samimi iç aydınlatma (PointLight).
  - **Paslanmaz Çelik Benmari Sıcak Yemek Tezgahı**: 3.4m uzunluğunda fırçalanmış paslanmaz çelik tezgah, şeffaf pleksi hijyen siperliği (sneeze guard) ve 4 adet Gastro-Norm (GN) sıcak yemek küveti:
    - *Şehriyeli Pirinç Pilavı*: Tane tane tereyağlı altın pirinç pilavı.
    - *Geleneksel Kuru Fasulye*: Nar gibi kırmızı soslu sucuklu kuru fasulye.
    - *Kuzu Güveç*: Sebzeli fırın güveç.
    - *Süzme Mercimek Çorbası*: Kırmızı biberli tereyağ soslu sıcak mercimek çorbası.
    - *Canlı Yemek Buharı*: Küvetlerden yükselen 4 adet ritmik buhar partikülü.
  - **Döner Ocağı & Dönen Yaprak Döner Eti**: Dikey paslanmaz çelik ocak arkalığı ve davlumbaz tavanı, akkor yanan 3 katlı dikey kızılötesi rezistanslar (PointLight ısı titreşimi), dikey çelik şiş üzerinde sürekli dönen marine yaprak döner eti, tepede domates/soğan ve tepside kızarmış et kırıntıları.
  - **Açık Hava Yemek Masaları & Kırmızı Pötikare Örtüler**: Veranda doğu kanadında 2 adet masa, kırmızı-beyaz pötikare masa örtüleri, ahşap dilim ekmek sepetleri, tuzluk ve kürdanlıklar, 4 adet bistro sandalye.
  - **A-Frame Karataş Menü & Retro Meşrubat Dolabı**: Kaldırım kenarında tebeşir menü şövalesi (`"GÜNÜN TABLDOTU: KURU PİLAV 25₺ | YAPRAK DÖNER 35₺ | MERCİMEK 15₺"`), kırmızı cam kapaklı soğuk ayran ve Uludağ gazoz dolabı.
  - **Animasyonlu Aşçı NPC — "Aşçı Hakkı Usta" (X: 28.5, Z: -53.6)**: Yüksek beyaz aşçı kepi, çift düğmeli aşçı ceketi, kırmızı boyun fuları, beyaz önlük, siyah kumaş pantolon, pala bıyık, elinde uzun çelik döner bıçağı tutar. Ritmik döner kesme animasyonu, oyuncu aracına 20m mesafeden yönelen baş/gövde takibi, korna ve duraklamada coşkulu el sallama ve 3D konuşma balonuyla karşılama (`"🍲 Aşçı Hakkı Usta: Gel kaptan geeel! Kuru fasulye fırından yeni çıktı, pilav tane tane! 🍚"`).
  - **"Sanayi Tabldot Menüsü" Mola Bonusu & Kepçe Sesi**: Servis peronunda 1.2 saniye duraklama: +10 ₺ nakit bahşiş, +1 itibar, +0.45 nitro dolumu, 25s "Sanayi Tabldot Zindeliği" güç ve hızlanma buff'ı, altın konfeti/para akışı, 35s soğuma ve prosedürel çelik kepçe tıkırtısı ve sıcak yemek cızırtısı (`sound.soupLadle()`).
  - **Radar Minimap İkonu**: `🍲` sembolü ile haritada gerçek zamanlı gösterilir.
- **Environmental Activity**: Factory smokestacks and crane diesel generator actively vent animated rising steam/smoke plumes (`buildFactoryChimneySmoke`).
- **Architecture**: Large warehouse complexes, cargo depots, repair garages, crane rigs, elevated steel pipe corridors, transformer substation, and heavy storage yards.
- **Road & Traffic**: Wide truck lanes, concrete barrier curbs, industrial jump ramps, forklift traffic lanes, breakable wooden crates.
- **Soundscape**: Low-frequency 48Hz generator hum, 96Hz harmonic vibration, and heavy logistics activity.
- **Key Delivery Points**: 4 warehouse loading docks with roll-up gates and freight pallet zones.

---

## 4. Sahil Şeridi (Coastal Marina District)
- **Visual Identity**: Open, scenic coastal promenade. Seaside stone piers, palm trees, sandy beach borders, water shaders, vintage cast-iron promenade lanterns, an elevated wooden beach lifeguard watchtower equipped with ladder and lifebuoy ring, promenade lifebuoy stations, and authentic marina boats.
- **Centerpiece Landmarks**:
  - Sahil "Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı" (`createLighthouseView` - T53 - X: -28.0, Z: 91.0):
    - **Dalgakıran Kaidesi ve Granit Kayalıklar**: Deniz içinde masif sekizgen granit taş dalgakıran kaidesi (radius 4.2m), kaide etrafında su içinde dalga kırıcı granit kayalık blokları (granite riprap boulders), dalgakırandan kıyıya bağlanan taş rıhtım geçidi (stone quay causeway), döküm çelik palamar babaları, kalın jüt halat kangalları, kule girişinde masif ahşap kapı ve taş kemer sövesi, kapı üstü bronz "1884" plaka levhası ve pirinç duvar feneri.
    - **15 Metre Konik Tarihi Kule Gövdesi**: 5 katmanlı konik kırmızı ve beyaz şeritli kule mimarisi (alt kat kırmızı #c0392b, beyaz #f5f6fa), bronz çerçeveli kemerli gözetleme pencereleri (kuzey ve açık deniz yönlerine bakan).
    - **Denizci İşaret Sancakları / Flamaları (Maritime Signal Flags Halyard)**: Seyir terasından kule kaidesine çapraz gerilmiş halat üzerinde 7 adet renkli denizci işaret sancağı (sarı/mavi, kırmızı/beyaz, yeşil/turuncu).
    - **Döküm Demir Seyir Terası & Korkuluklar (Gallery Balcony)**: Kule tepesinde (Y: 10.3m) konsol çıkmalı dairesel döküm demir seyir terası (#1a202c), taşıyıcı konsol ayakları ve döküm demir güvenlik korkuluk balüstradı.
    - **Cam Fener Odası & Fresnel Merceği (Lantern Room & Fresnel Core)**: 12 yüzeyli transparan cam silindir muhafaza (#74b9ff), bronz dikey cam bölme çıtaları, merkezde pirinç Fresnel merceği göbeği ve akkor ampul, gece ve gündüz çalışan sıcak sarı PointLight fener armatürü (distance 42m).
    - **Dönen Volumetrik Deniz Arama Işığı (Sweeping Searchlight Beam)**: Çift taraflı dönen hacimsel ışık huzmesi konisi (volumetric beam cone with additive blending); gece %42, gündüz %14 opaklıkla denizi ve kordonu tarar.
    - **Patinalı Yeşil Bakır Kubbe & Rüzgar Gülü (Copper Cupola & Weathervane)**: Verdigris patinalı yeşil bakır kubbe çatısı (#16a085), pirinç havalandırma bacası ve tepede rüzgarla salınan minyatür yelkenli kalyon gemi silüeti finialli pirinç rüzgar gülü (#f39c12).
    - **Kordon Rıhtım Peronu, Pusula Gülü & Anıt Plaketi (LIGHTHOUSE_BAY: X: -28.0, Z: 82.0)**: Kordon yolu kenarında 4.8m x 3.2m servis yanaşma peronu, beyaz park sınır çizgileri, sarı-siyah emniyet bordürleri, zemin beyaz kılavuz yön oku, kaldırım üzerinde pirinç kakmalı 8 köşeli Pusula Gülü (Compass Rose) mozaik madalyonu, taş kaide üzerinde açılı tarihi bronz anıt levhası ("⚓ TARİHİ DENİZ FENERİ · 1884"), döküm palamar babası ve sahil güvenlik can simidi istasyonu ("CAN SİMİDİ · SAHİL GÜVENLİK").
    - **Animasyonlu Fenerci Kaptan NPC — "Fenerci Rıza Kaptan" (X: -26.5, Z: 83.8)**: Denizci botları, lacivert pantolon, parlak sarı muşamba denizci yağmurluğu (oilskin slicker), altın çapa bröveli lacivert kaptan kasketi, pos bıyık. Yanında duran pirinç ayaklı sahil deniz dürbünü (brass tripod telescope) ufku tarama animasyonu, oyuncu aracına 26m mesafeden kafa/gövde takibi (head tracking), korna ve duraklamada iki kolunu coşkuyla havaya kaldırıp sallama ve 3D konuşma balonu ("⚓ Fenerci Rıza Kaptan: Heyy gidi deniz kurdu! Fenerin ışığı pruvana rehber olsun! 🌊").
    - **"Fener Rehberliği" Mola Bonusu & Sis Düdüğü (`src/game/lighthouse.ts`)**: Servis peronunda 1.2s duraklama: +10 ₺ nakit bahşiş, +1 itibar, +0.45 nitro dolumu, 25s "Fener Rehberliği" gece görüşü & hız/nitro buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel deniz sis düdüğü akoru (`sound.fogHorn()`).
    - **Radar Minimap İkonu**: `🗼` sembolü ile haritada gerçek zamanlı gösterilir.
  - Active Marina Boats (`buildMarinaBoats`): A classic 6.2m sailing yacht with cabin, tall mast, boom, and furled sails alongside a sporty red-and-white speedboat moored to the wooden pier with animated harmonic wave bobbing physics.
  - Traditional Street Vendor — Kestaneci & Mısır Recep Usta: Situated along the promenade at X: -44.0, Z: 83.2. Turkish crimson dual-compartment street cart with brass trim, charcoal roasting grill with glowing embers and sizzling chestnuts, steaming sweet corn cauldron with animated steam puffs, striped umbrella, and animated vendor NPC with tongs. Sells hot chestnuts/corn for 5 ₺ with cheerful callouts, +1 reputation, and energy boost.
  - Seaside Boardwalk Tea Garden ("☕ Yalı Çay Bahçesi" - X: -60, Z: 83.2): 5.2m x 3.6m elevated timber deck along shoreline, pergola pillars, red-and-white canvas canopy, 3 round tables with 6 woven wicker stools, porcelain saucers with tulip glasses of hot tea, copper samovar station with steam vents, and Tea Master NPC Rıza Dayı. 1s pitstop awards +1 reputation, clinking spoon audio (`sound.teaSpoonClink()`), and 20s "Tavşan Kanı Çay" buff (`#tea-pill`) improving vehicle steering stability and fatigue.
  - Boardwalk Pier Fishing Life: Salih Reis (X: -48.5, Z: 96.0) at the pier edge in yellow waterproof oilskin raincoat with 2.8m carbon rod, floating bobber, bait bucket, rod tugging, and reel sound (`sound.fishingReel()`) with splash particles (`spawnWaterSplash`); Kemal Ağabey on folding canvas stool. Moored wooden rowboats ("Meltem" & "Poyraz") bobbing harmonically on ocean waves.
  - Grand Sahil Ferris Wheel & Amusement Pier ("🎡 BÜYÜK SAHİL DÖNME DOLABI" - X: -14.0, Z: 92.5): Historic timber & stone amusement pier foundation (radius 8.5m) extending into the ocean with footbridge connector from the promenade. 15m towering turquoise/white dual A-frame steel lattice towers, rotating 16m diameter wheel truss with 12 radial spokes, 12 colorful passenger gondolas (yellow, blue, red) counter-rotating to remain upright with gravity, 24 animated perimeter LED chase lights with night emissive boost, nostalgic ticket booth ("🎡 BİLET GİŞESİ · 15₺"), and animated Operator NPC Lunaparkçı Şevket Usta waving and greeting drivers upon honk. Stopping at boarding platform awards "Sahil Neşesi" bonus (+15 ₺ & +1 rep) with celebratory confetti and procedural carnival chime (`sound.carnivalChime()`). Radar icon: `🎡`.
  - Sahil Marina Balıkçı Barınağı & Taze Balık-Ekmek Teknesi (`createFishingHarbourView` - T45 - X: -78.0, Z: 88.0):
    - **Ahşap İskele & Rıhtım Güvertesi**: 13.0m x 4.8m genişliğinde yıpranmış sedir ahşap güverte, taş bordür sahil bağlantısı, denize çakılı dolfen kazıkları, döküm çelik bağlama babaları, iskele korkulukları, giriş ahşap karşılama takı ("⚓ MARİNA BALIKÇI BARINAĞI"), gece yanan kehribar fenerler, can simitleri, istiflenmiş ahşap balık sandıkları (buzlu palamutlar), kalın urgan halatları ve tarihi paslı gemi çapası.
    - **"Tarihi Marmara Balıkçısı" Balık-Ekmek Teknesi (X: -73.2, Z: 91.0)**: İskelenin doğu bordasına bağlı, turkuaz deniz üzerinde ritmik dalgalarla salınan (heave, pitch, roll) geleneksel Boğaziçi ahşap teknesi. Bordo ve lacivert gövde, beyaz su hattı, altın sarısı süs çıtaları, 6 pirinç sütun üzerinde yükselen zümrüt yeşili oymalı saçaklı ahşap tente, iki taraflı ahşap tabela ("🐟 TARİHİ MARMARA BALIK-EKMEKÇİSİ 🐟" & "🐟 TAZE BALIK-EKMEK · ŞİFA DERYASI 🍋"), gece yanan sıcak tavan fenerleri, paslanmaz çelik döküm sac ızgara tezgahı, sac üzerinde nar gibi kızaran palamut filetoları, çıtır somun ekmek yarımları, mor soğan ve taze yeşillik kaseleri, limonlar ve yükselen gerçek zamanlı ızgara dumanı partikülleri.
    - **Aşçı NPC — "Balıkçı Temel Reis" (X: -74.8, Z: 90.5)**: Çizgili lacivert-beyaz denizci kazağı, beyaz aşçı önlüğü, sarı balıkçı çizmeleri, beyaz sakal ve altın çapa bröveli kaptan kasketi. Elinde ızgara spatulası ile balıkları çeviren animasyon, oyuncu aracına yönelen baş takibi (head tracking), korna ve duraklamada coşkulu el sallama ve 3D konuşma balonu ("🐟 Balıkçı Temel Reis: Gel vatandaş geeel! Derya kuzusu bunlar! Taze palamut balık-ekmek hazır! 🥖").
    - **Balıkçı Barınağı Ağ Motorları / Gırgır Tekneleri**:
      - *Trawler 1 ("⚓ KARADENİZLİ · RİZE" - X: -83.5, Z: 92.5)*: Zümrüt yeşili ahşap tekne gövdesi, beyaz dümen köşkü, seyir fenerleri, egzoz bacası ve sarılı yeşil ağ tamburu düzeneği (gırgır makarası).
      - *Trawler 2 ("⚓ ALBATROS · İSTANBUL" - X: -85.0, Z: 87.5)*: Bordo ve lacivert klasik Boğaz balıkçı teknesi, güverte döşemesi, can simidi ve bağlama halatları. Her iki tekne de deniz dalgalarıyla bağımsız salınım gösterir.
    - **Dönen Martı Sürüsü (Hovering Seagulls)**: Balık-ekmek teknesi ve iskele üzerinde termal hava akımında daireler çizen 3 adet beyaz/gri martı; kanat çırpış fiziği, dönüşe yatma ve periyodik martı çığlığı sesleri.
    - **"Balık Ekmek Ziyafeti" Mola Bonusu & Cızırtı Sesi**: İskele girişinde (Z: 83.5 civarı) 1.2 saniye duraklama: +15 ₺ nakit bahşiş, +1 itibar, kutlama konfetisi, 20 saniye "Derya Kuzusu Enerjisi" buff'ı (motor çekişi ve hızlanma artışı), 35s soğuma ve prosedürel Web Audio balık sac ızgara cızırtısı (`sound.fishSizzle()`).
    - **Radar Minimap İkonu**: `🐟` sembolü ile haritada gerçek zamanlı gösterilir.
  - Sahil "Kordon Boyu Hakiki Maraş Dondurmacısı" & Plaj Voleybolu / Güneşlenme Terası (`createIceCreamStandView` - T49 - X: -21.0, Z: 84.4):
    - **Hakiki Maraş Dondurmacısı Kiosk**: Kordon yolu güneyinde (X: -21.0, Z: 84.4) maun ahşap gövde, pirinç çıtalar, damarlı mermer tezgah, çift döküm pirinç ve paslanmaz çelik dondurma güğümleri, yükselen kuru buz dumanı partikülleri, asılı çıtır kornet külah kuleleri, Antep fıstığı/çilek/karadut sos vitrini, asılı dövme pirinç servis çıngırağı ("Dondurmacı Çıngırağı"), bordo-krem çizgili oymalı saçaklı Osmanlı tentesi, gece yanan PointLight çatı tabelası ("🍦 HAKİKİ MARAŞ DONDURMACISI · ALİ USTA 🍨"), alt şerit ("BUZ GİBİ DÖVME DONDURMA · SALEP & KEÇİ SÜTÜ"), kara tahta menü şövalesi ve oyuncu servis yanaşma peronu (`ICE_CREAM_BAY`: X: -21.0, Z: 80.5) ile yön oku.
    - **Animasyonlu Dondurma Ustası NPC — "Maraşlı Ali Usta" (X: -21.0, Z: 83.5)**: Kırmızı Maraş fesi, siyah püskül, burma bıyık, altın sırmalı bordo cepken yelek, kuşak ve beyaz gömlek. 1.4m uzunluğunda çelik dondurma çubuğu (spatula) ucunda uzayan beyaz dövme dondurma ve külah ile meşhur Maraş dondurma şov hareketi (külah çevirme, uzatma ve takla hilesi), oyuncu aracına yönelen baş/gövde takibi (head tracking), korna ve duraklamada çıngırak çalma ve 3D konuşma balonu ("🍦 Maraşlı Ali Usta: Yakala külahı bakalım! Hakiki keçi sütü dövme dondurma! 🍨").
    - **Plaj Voleybolu Sahası (Beach Volleyball Court - X: -27.0, Z: 87.0)**: İnce altın kum zemin, gergi şeritli beyaz saha sınır çizgileri, 4 köşe kırmızı bayrakları, çift ahşap direk, gergi telleri, file örgüsü, beyaz üst bant ve kırmızı/beyaz antenler, kuma düşmüş sarı-mavi plaj voleybolu topu, yüksek ahşap hakem kulesi (umpire tower) ve oturma bankı.
    - **Güneşlenme Terası & Şezlong Alanı (Sun Lounger Terrace - X: -16.5, Z: 85.5)**: Sedir ahşap güverte, turkuaz ve sarı çizgili minderli şezlonglar, rulo plaj havluları, büyük renkli plaj şemsiyesi, hindistan cevizi kokteylli bambu sehpa, kıvrık sahil palmiyesi, asılı kehribar peri feneri ve ahşap sahil yön levhası ("🏖️ KORDON PLAJI & VOLEYBOL 🏐").
    - **"Buz Gibi Maraş Dondurması" Mola Bonusu & Çıngırak Sesi**: Servis peronunda 1.2 saniye duraklama: +10 ₺ nakit bahşiş, +1 itibar, +0.45 nitro dolumu, 25s "Dövme Dondurma Serinliği" buff'ı, altın konfeti/para akışı, 35s soğuma ve prosedürel parlak çift vuruşlu pirinç çıngırak sesi (`sound.iceCreamBell()`).
    - **Radar Minimap İkonu**: `🍦` sembolü ile haritada gerçek zamanlı gösterilir.
- **Architecture**: Waterfront restaurants, marina harbor master station, boardwalk pavilions, resort beach huts, canoes, seaside lounging decks, lifeguard watchtower, and amusement pier.
- **Road & Traffic**: Winding scenic coastal boulevard, bridge crossings, promenade sidewalks, seaside view benches.
- **Soundscape**: Gentle rhythmic rolling ocean waves (LFO-modulated pink noise surf) and occasional distant seagull calls.
- **Key Delivery Points**: 4 marina piers, seafood bistro patios, and coastal boardwalk kiosks.

---

## 5. Dynamic Time of Day & Atmosphere System
- **Shift Day Cycle**: Smoothly transitions across 4 keyframes:
  1. **Sabah (Morning)**: Crisp blue sky (`#6ab7f5`), fresh morning fog (`#cbe7fc`), cool white sun (`#fff8ee`), gentle morning light.
  2. **Öğle (Midday)**: Vibrant azure sky (`#70c5ff`), bright overhead sun (`#fff5eb`), lush hemisphere lighting.
  3. **Gün Batımı (Golden Hour Sunset)**: Warm glowing amber sun (`#ff9d42`), coral horizon sky (`#e67e50`), warm peach fog (`#df9d83`), dramatic long shadows.
  4. **Alacakaranlık (Twilight Dusk)**: Deep sapphire night sky (`#1d243a`), slate fog (`#2b3450`), cool moonlit illumination (`#8ea4d2`), and active glowing lighthouse searchlight.
- **HUD Integration**: Real-time time pill badge displayed in topbar (`☀️ ÖĞLE`, `🌇 GÜN BATIMI`, etc.).
- **Proximity Occlusion & Budget**: Instanced geometries and draw calls under 50 maintain 60 FPS mobile target.

---

## 6. Dynamic Weather, Thunderstorm & Wet Road Reflection System
- **Weather Cycle**: Natural dynamic transitions between clear skies ("Açık Hava" `🌤️`), refreshing summer rain showers ("Yaz Yağmuru" `🌧️`), and sudden summer thunderstorms ("Gök Gürültülü Fırtına" `⛈️`).
- **3D Rain Particles & Wind Tilt**: 420 volumetric falling rain streaks tracking vehicle position with speed ~30 m/s (normal rain) and ~40 m/s with wind slant (`mesh.rotation.z = -0.16`) during thunderstorms.
- **3D Procedural Lightning & Flash Illumination**: Procedural 7-segment jagged lightning bolt in the clouds with dynamic double-strike flash illumination, spiking directional sun and hemisphere light intensity (+4.2 / +2.8) and casting brilliant electric blue-white sheen across the wet city.
- **Procedural Thunder Web Audio**: Multi-stage audio synthesis featuring initial sharp lightning discharge crackle (2200Hz bandpass) followed by deep sub-bass rolling rumble (sub-48Hz triangle & filtered brown noise) echoing across districts with radio ducking.
- **Wet Road Specular Sheen & Dynamic Puddle Expansion**: Real-time asphalt surface reflectivity shader adaptation (`setWorldWetness`). Road roughness drops from 0.85 to 0.22 with 0.2 metalness. Puddles dynamically expand by up to 18% during thunderstorms with heightened ripple frequency.
- **HUD Weather Pill**: Real-time weather status badge displayed in topbar (`🌤️ AÇIK` / `🌧️ YAZ YAĞMURU` / `⛈️ GÖK GÜRÜLTÜLÜ FIRTINA`).

---

## 7. Dynamic Night Lighting & Vehicle Headlight System
- **Vehicle Headlight Cones**:
  - Delivery Van: Dual volumetric forward projection beams (`CylinderGeometry` with `AdditiveBlending` and soft falloff) and specular ground oval puddles on asphalt (`y = 0.03`).
  - Courier Scooter: Single forward headlight beam and ground spot attached to front fork assembly, swiveling seamlessly with handlebar steering angle.
  - Headlight Intensity Lerp: Automatically fades in at dusk/night or during summer rain showers (`headlightIntensity: 0 -> 1`), and dims during bright daylight.
- **City-wide Emissive Architecture**:
  - Streetlamps across Güneş Mahallesi, Çarşı and industrial roads glow with warm incandescent emission (`#ffdd66`, intensity 1.5).
  - Nostalgic promenade cast-iron lanterns along Sahil pier glow with golden amber light (`#ffa834`, intensity 1.6).
  - Commercial storefront display vitrins and apartment windows emit cozy warm interior light (`#f6e58d`, intensity 0.75).
  - Substation electrical safety beacons and heliport pads pulse with caution glow.

---

## 8. Dynamic Pedestrian Rain Reactions & Umbrellas
- **Faceted Colorful Umbrellas**: 8 distinct low-poly umbrella styles (red, blue, yellow, green, purple, orange, turquoise, pink) attached to pedestrian right arm pivots.
- **Dynamic Deployment**: When summer rain begins (`rainIntensity > 0.15`), pedestrians smoothly pop open their umbrellas (`umbrellaScale: 0 -> 1`), raise their right arm overhead, and stroll protected from the downpour.
- **Stowing & Panic Reactions**: Umbrellas fold away when skies clear. Fleeing pedestrians maintain an alert grip on their umbrella while running from vehicle danger.

---

## 9. District Delivery Stations & Customer Reception Visuals
- **16 Physical Delivery Stations** (`createDeliveryStations`):
  1. **Güneş Mahallesi (Homes 0–3)**: Suburban cedar porch parcel bench, "HOŞGELDİNİZ" gold-bordered welcome mat, solar pathway bollard light, resident NPC in cozy casual hoodie and jeans.
  2. **Çarşı Bölgesi (Homes 4–7)**: Boutique reception counter desk, brass service bell, invoice clipboard, "SİPARİŞ TESLİM" sign, storekeeper NPC in apron.
  3. **Sanayi Bölgesi (Homes 8–11)**: Heavy EUR wooden freight pallet, yellow/black hazard safety borders, steel guide stanchions, logistics supervisor NPC with hardhat and barcode scanner.
  4. **Sahil Şeridi (Homes 12–15)**: Boardwalk timber cargo dock, mooring cleat post, hanging lifebuoy ring, coastal server / harbor attendant NPC in nautical sailor shirt.
- **Dynamic NPC Living Reactions**:
  - **Approaching Guidance**: When player drives towards an active delivery target, the corresponding station character waves enthusiastically to welcome the vehicle.
  - **Celebration Jump ("🙌")**: Upon successful delivery drop, the character executes an energetic 1.8-second celebration dance with both arms raised high in victory.
- **Delivered Parcel Visual Stacking**: Neatly stacks up to 3 wrapped gift/cargo parcels matching the delivered contract type on the station desk/pallet.

---

## 10. Delivery Satisfaction, Radial Hold Progress & Combo Streaks
- **Dynamic Radial Hold Progress Disc**: Inner glowing green circle disc expands from 0% to 100% radius as player holds still in the target ring (`holdSeconds`), providing immediate tactile visual feedback before triggering delivery.
- **Contract-Adaptive Marker Themes**: Distinctive ring and pin coloring based on active cargo contract:
  - 💎 VIP Express: Radiant luxury turquoise (`#00d2d3`)
  - 🧊 Cold Chain: Crisp frost azure (`#54a0ff`)
  - ⚡ Heavy Freight: Industrial amber caution (`#ff9f43`)
  - 🔴 Urgent Cargo: Vivid ruby red (`#ee5253`)
  - 🟢 Standard / Fragile: Mint and emerald tones (`#5dbb90`, `#1dd1a1`)
- **Delivery Combo Streak System**:
  - Consecutive undamaged deliveries reward an escalating combo multiplier and cash bonus: 2x (+15 ₺), 3x (+25 ₺, +1 rep), 4x (+40 ₺), 5x+ (+60 ₺).
  - Web Audio procedural fanfare arpeggio chords in `sound.comboFanfare(streak)`.
  - Confetti showers (`particles.spawnConfetti`) and gold coin stream (`particles.spawnMoneyStream`) on milestone streak deliveries.

---

## 11. Living Urban Fauna & Street Life Simulation (T24 & T25)
- **Coastal Soaring Seagulls (`Sahil Şeridi`)**:
  - 4 coastal seagulls soaring gracefully in thermal circular & figure-8 flight paths above the breakwater lighthouse, marina yachts, and beach coastline.
  - Articulated wing flap-and-glide physics: flaps rhythmically for 1.2s then glides with gentle dihedral bank into turns.
  - Procedural oceanic bird cry (`sound.seagullCry()`) synthesized dynamically when driving through Sahil.
- **Piazza Market Pigeons (`Çarşı Bölgesi`)**:
  - 8 city pigeons pecking and bustling on the cobblestones around the historic fountain and market stalls.
  - Idle pecking animation with bobbing heads and small wander hops.
  - Vehicle Evasion / Panic Flight: When player vehicle approaches within 6.5m (or when player honks within 28m), the flock scatters, flaps wings rapidly, ascends into the air up to 3.8m, and circles outward before softly descending to land.
  - Procedural wing flutter & soft coo (`sound.pigeonScatter()`).
- **Suburban Domestic Cats (`Güneş Mahallesi`)**:
  - 3 unique cats situated across the neighborhood:
    - "Tekir" (Ginger Tabby): Perched on the white garden fence / porch railing of Home 1.
    - "Duman" (Smoky Tuxedo): Sunbathing on the front green lawn of Home 2.
    - "Zeytin" (Calico): Resting beside the wooden suburban welcome archway.
  - Gentle tail flicking physics.
  - Head tracking: Head smoothly yaws to follow player vehicle when within 12m.
  - Alert Meow: Meows playfully (`sound.catMeow()`) when player stops close or honks.
- **Industrial Logistics Guard Dog (`Karabaş` - Sanayi Bölgesi)**:
  - Stationed by the entrance checkpoint outside a handcrafted timber doghouse with pitched terracotta roof and water bowl.
  - Authentic Anatolian Shepherd / Kangal coloring (fawn coat, black mask face & ears, curled tail).
  - Continuous tail wagging and vehicle head tracking.
  - Friendly protective bark (`sound.dogBark()`) triggered when vehicle speeds past or honks.
- **Interactive Vehicle Horn & Emergency Flash Delivery Mini-Events (T25)**:
  - Dedicated player horn key (`H`) and mobile HUD touch button (`📢 KORNA`).
  - Honking startles nearby pigeons to take flight, triggers cat meows, and elicits protective barks from Karabaş.
  - "⚡ FLAŞ SİPARİŞ RUSH" mini-event triggers periodically with active countdown and topbar glowing pill indicator, awarding +75 ₺ bonus cash, +2 reputation, and fanfare on timely delivery.

---

## 12. District Environmental Micro-FX & Fleet Career Customization (T26 & T27)
- **Güneş Mahallesi Interactive Crunchy Leaf Piles**:
  - 4 physical leaf pile mounds situated along suburban curbs, lawn borders, and parks (Homes 01 & 02, Depot entrance, Playground).
  - Composed of multi-hued autumn leaves (golden yellow `#f1c40f`, warm amber `#f39c12`, crimson red `#c0392b`, olive green `#27ae60`).
  - Speed-triggered explosion: Driving through a leaf pile at speed (>1.2 m/s) scatters the pile and bursts 24 swirling airborne leaf particles that spiral in the wind before softly floating down.
  - Procedural leaf crunch audio (`sound.leafCrunch()`) and playful "+5 ₺ Sonbahar Keyfi!" bonus reward with 16-second natural pile regeneration.
- **Sahil Şeridi Coastal Breaker Sea Spray Mist**:
  - Located on the maritime lighthouse breakwater rocks (X: -28, Z: 91).
  - Every 3.4 seconds, an ocean swell impacts the rocks, firing foaming white and translucent cyan water droplets (`#e0f7fa`, `#ffffff`) 2.8–4.2m upward into the coastal breeze.
  - Procedural deep ocean surf crash sound (`sound.surfCrash()`) with distance-based acoustic attenuation.
- **Sanayi Bölgesi Metal Fabrication Welding Workshop**:
  - Located in the industrial courtyard (X: 36, Z: -26) equipped with heavy steel workbench, argon gas cylinder, portable inverter machine, and yellow safety screen.
  - Industrial Welder NPC ("Usta Kaynakçı"): Dressed in dark denim overalls and protective leather apron, wearing a full-face helmet with dark visor, holding an articulated welding torch.
  - Dynamic Arc Flicker: High-frequency blue-white point light (`#a5b4fc`, intensity 2.0–5.0) illuminating metal structures and casting dramatic shadows.
  - Falling spark showers: Cascades of glowing orange/yellow sparks bouncing off the workbench and floor.
  - Procedural electric arc buzz audio (`sound.weldingArc()`) with proximity falloff.
- **Çarşı Bölgesi Piazza Fountain Mist**:
  - Glistening water mist particles hovering over the marble fountain basin (X: 50, Z: 50).
- **Company Fleet Career Custom Liveries (T27)**:
  - 4 customizable vehicle styles:
    - 🚚 Klasik Kargo: Traditional yellow/green corporate identity.
    - 🌊 Sahil Dalgası: Vibrant turquoise & ocean blue styling.
    - ⚡ Gece Ekspresi: Stealth anthracite with neon fuchsia racing stripe.
    - 👑 Altın Şampiyon: High-prestige metallic gold & bronze finish.
  - Live real-time material shader color swapping on player van and courier scooter.
  - Career trophies gallery & Livery selector tab in the company management office sheet.

---

## 13. Dynamic Urban Traffic Expansion & Pedestrian Signals (T28)
- **Animated Crosswalk Pedestrian Traffic Signals (`TrafficLights`)**:
  - Installed across 8 key intersections and pedestrian zebra crossings (Central Grand Roundabout, Çarşı Market Square, Sahil Coastal Promenade, Sanayi Heavy Freight Crossing).
  - Physical galvanized steel cantilever mast arms extending 2.6m over road lanes, with round steel bases and anchor brackets.
  - 3-aspect vehicular signal heads (Red, Amber, Green) with hooded sun visors and reflective hazard border panels.
  - 2-aspect pedestrian signal heads mounted at eye level (Red standing silhouette, Green walking silhouette).
  - 26.6-second cyclical traffic controller (Z-axis Green -> Z-axis Yellow -> All Red -> X-axis Green -> X-axis Yellow -> All Red) with dynamic emissive glow scaling up at night and dusk.
- **Scooter Courier AI Traffic Sharing Roads (`CourierScooterTraffic`)**:
  - Autonomous AI delivery scooters driving along city avenues and neighborhood streets in Güneş, Çarşı, and Sahil.
  - Detailed low-poly delivery scooter model: dual wheels with rubber tires and alloy rims, footrest, handlebars, bright LED headlamp, and a large insulated rear thermal delivery box with reflective striping and kargo emblem.
  - Animated AI Courier Rider dressed in windbreaker and safety helmet with tinted visor, dynamically banking and leaning into motion.
  - Interactive horn salute: honking near an AI courier triggers an interactive friendly response ("bip-bip!" procedural sound `sound.courierBeep()`) and greeting shake.
- **Parcel Handoff Micro-Animations & Customer Gratitude**:
  - Customer NPCs transition into an eager receiving handoff posture with outstretched arms when the player vehicle holds to deliver.
  - Floating 3D gratitude speech bubble badges ("⭐⭐⭐⭐⭐ Harika Teslimat!", "📦 Çok Teşekkürler!", "⚡ Jet Hızında Servis!", "🙌 Eline Sağlık Kurye!") rising and fading above customer heads upon delivery.
  - Parabolic parcel swoop animation in `markers.ts` with squash-and-stretch bounce landing.
  - Procedural cardboard rustle and solid drop impact audio (`sound.packageDrop()`).

---

## 14. Audio Jukebox & Living Transit Infrastructure (T29, T30 & T31)
- **Procedural Car Radio Jukebox (`RadioSystem`)**:
  - 3 procedural in-game radio channels + off state:
    1. ☕ **Sakin Lo-Fi** (~76 BPM): Chillhop electric piano/Rhodes chords, smooth walking sub-bass, relaxed pentatonic bell melodies.
    2. ⚡ **Turbo FM** (~126 BPM): High-energy 80s synthwave rolling 16th bassline, punchy kick/snare pulse, driving synth arpeggios.
    3. 🌆 **Şehir Vibes** (~106 BPM): Syncopated funk groove, slap bassline, jazzy chord stabs.
  - Interactive HUD radio pill (`#btn-radio`) with animated 3-bar audio visualizer equalizer, `R` keyboard toggle key, touch controls, and dynamic ducking during horn and fanfare audio events.
- **District Bus Stops & Waiting Commuter NPCs (`BusStops`)**:
  - 4 authentic Turkish transit bus stops ("Otobüs Durakları") placed across all districts:
    - Güneş: `stop_sunny` (X: -44, Z: -14.2)
    - Çarşı: `stop_market` (X: 14.2, Z: 32)
    - Sanayi: `stop_industrial` (X: 44, Z: -14.2)
    - Sahil: `stop_coastal` (X: -14.2, Z: 32)
  - Features curved tinted-glass canopy, classic blue circular "D" (Durak) transit sign post, schedule poster board ("HAT 101"), polished cedar timber bench, recycling receptacle, and curbside yellow painted zigzag bus bay markings.
  - Living Commuter NPCs (seated and standing) featuring vehicle head tracking and friendly responsive arm waving when the player honks (`H`).
- **Rooftop Architectural Realism**:
  - **Solar Water Heaters ("Güneş Enerjisi Termosifon")**: Galvanized storage cylinder tank on A-frame with angled navy blue solar thermal collector panel.
  - **Parabolic Satellite Dishes ("Çanak Anten")**: Concave receiver dish pointed towards the sky with central LNB feed horn.
  - **HVAC Compressor Chillers**: Industrial sheet metal housing with side louvers, circular top exhaust fan, and copper refrigeration piping across apartments and plazas.

---

## 15. Dynamic Weather Puddles, Hydroplaning & Customer Tipping (T32 & T33)
- **Dynamic Road Puddle Accumulation (`createPuddlesView`)**:
  - 12 authentic road puddle locations positioned across all 4 districts along asphalt low points and gutter curbs:
    - Güneş: `sunny_depot_spur` (X: -58, Z: -31), `sunny_cross_c` (X: -48, Z: -48), `sunny_cross_w` (X: -76, Z: -52), `sunny_cross_s` (X: -48, Z: -12)
    - Bulvar: `blvd_west` (X: -44, Z: 1.2), `blvd_center` (X: 6, Z: -1.2), `blvd_east` (X: 45, Z: 1.4)
    - Çarşı: `mkt_piazza_spur` (X: 12, Z: 35), `mkt_south_avenue` (X: 52, Z: 82)
    - Sanayi: `ind_warehouse_bay` (X: 16, Z: -15), `ind_heavy_dock` (X: 48, Z: -64)
    - Sahil: `cst_north_pier` (X: -76, Z: 35), `cst_south_boardwalk` (X: -52, Z: 76)
  - Dynamically responds to weather wetness (`wetness`): invisible and zero-opacity when dry; transitions into reflective deep blue-tinted water discs with expanding concentric ripple rings during and after summer rain showers.
- **Tire Splash Particles & Procedural Audio (`spawnPuddleSplash` & `sound.puddleSplash`)**:
  - Driving through puddles during rain (`wetness > 0.15`) at speed (> 2.2 m/s) triggers dynamic water splashes.
  - Generates 22 aquatic white and cyan droplet particles fanning outwards in lateral wheel bow sprays with gravity drop.
  - Procedural Web Audio synthesis of wet tire water slap and sweeping bandpass spray hiss (2600 Hz -> 650 Hz).
  - Micro-hydroplaning: high-speed puddle encounters (> 6.0 m/s) produce slight realistic tire drag and steering float.
- **Customer Tipping Mechanic & Visual Fanfare (`DeliveryReward.tipBonus` & `sound.customerTip`)**:
  - Prompt, zero-damage deliveries award generous customer cash tips (15 ₺ for fast deliveries, 25 ₺ for lightning-fast deliveries, +5 ₺ extra for Special Contracts up to 30 ₺).
  - Customer NPC displays custom floating speech bubble: `"💵 +{tip} ₺ Bahşiş!"` with a vibrant green badge.
  - Procedural bright two-tone coin chime (1760 Hz & 2637 Hz) and parabolic gold coin stream towards player vehicle.

---

## 16. Logistics EV Quick-Charger Pitstop & Traditional Turkish Street Vendors (T34 & T35)
- **Logistics Depot EV Quick-Charger & Fuel Pitstop (`createPitstopView` & `stepPitstop`)**:
  - Located on the logistics depot apron at X: -66.5, Z: -25.5.
  - Features dark reinforced concrete foundation (6.4m x 4.8m) with hazard safety borders, turquoise induction lane lines, and dual high-tech EV quick-charging kiosks with blue digital displays, green status LEDs, and heavy flexible charging cables.
  - Glowing turquoise induction charging ring (`#00f0ff`) with dynamic rotation and pulsing inner disc.
  - 3D progress disc sweeps 0-100% when vehicle is stationary or crawling (<= 2.8 m/s) on the pad.
  - Completes in 1.5 seconds, triggering an electric blue spark surge (`spawnSuperchargeEnergy`), rising charging hum (`sound.chargerHum`), and futuristic 4-note completion chime (`sound.chargeComplete`).
  - Grants a 25-second Supercharge buff: +25% top speed, +30% acceleration, and unlimited nitro boost with cyan particle trail and topbar HUD pill (`⚡ SÜPER ŞARJ 25s`).
- **Traditional Turkish Street Vendors — Simitçi & Kestaneci (`createStreetVendorsView` & `stepStreetVendors`)**:
  - **Tarihi Taşfırın Simitçisi (Simitçi Hasan Usta)**:
    - Located in Çarşı at X: 42.0, Z: 47.0 near the historic piazza.
    - Features iconic red-and-white wheeled street vendor cart, 4-sided transparent showcase stacked with golden sesame-encrusted simits, striped red/white umbrella canopy, and an apron-clad vendor NPC with chef hat.
    - Approaching vendor triggers welcoming arm wave and callouts ("🥨 Taze çıtır simit!", "🥨 Fırından yeni çıktı!").
  - **Közde Kestaneci & Süt Mısır (Kestaneci Recep Usta)**:
    - Located along Sahil promenade at X: -44.0, Z: 83.2.
    - Features traditional street cart with glowing copper charcoal roasting tray, smoking chimney pipe with animated steam particles, steaming corn on the cob pot, roasted chestnut paper bags, and vendor NPC.
    - Callouts: "🌰 Kestane kebap yemesi sevap!", "🌽 Taze süt mısır!".
  - **Interaction & Energy Buff**:
    - Pausing near vendor purchases fresh street snack for 5 ₺, awarding +1 reputation and a 15-second energy stamina buff (`snackBuff` / `🥨 ENERJİ 15s`).
    - Procedural crisp bite and cheerful chime in `sound.streetSnack()` and golden snack sparkle particles (`spawnSnackCrunch`).






---

## 17. Güneş Mahallesi "Geleneksel Mahalle Semt Pazarı & Taze Manav Tezgahları" (T54)
- **Konum ve Mimari Yapı (`createMarketView` & `src/game/market.ts`)**:
  - Konum: X: -72.0, Z: -58.5 (Güneş Mahallesi batı bulvarı üzeri).
  - 12.6m x 9.0m taş döşeli pazar meydanı tablası, granit taş bordürler, asfalt yanaşma peronu cebi (`MARKET_BAY`: X: -72.0, Z: -52.5).
  - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
  - Masif çam taşıyıcı direkler, çatı makasları, 3 canlı renkli kumaş tente (sarı/beyaz, kırmızı/beyaz, yeşil/beyaz) ve dalgalı fırfırlı saçaklar.
  - Işıklı büyük çatı tabelası (`"🍉 GÜNEŞ MAHALLESİ SEMT PAZARI · CEMİL DAYI 🍋"`), altın sarısı pervaz çerçevesi ve gece PointLight fener armatürü.
  - Kademeli ahşap kasalarda Akdeniz meyve/sebze yığınları (domates, limon, portakal, patlıcan, salatalık, taze maydanoz).
  - Dev karpuz ve bal kavunu piramidi, dilimlenmiş kırmızı sulu karpuz dilimi.
  - Asılı nostaljik çift kefeli pirinç terazi ve pirinç ağırlık seti.
  - Tebeşirli fiyat şövalesi ve kraft kese kağıtları.
- **Pazarcı Esnafı NPC ("Pazarcı Cemil Dayı") & Mola Bonusu**:
  - Kadife kasket, çizgili gömlek, cepli esnaf önlüğü, pos bıyık, elinde taze sarı narenciye.
  - 22m mesafeden kafa/gövde takibi, korna ve duraklamada iki kolunu havaya kaldırarak coşkulu selamlama ve 3D konuşma balonu.
  - "Taze Pazar Bereketi" pitstop bonusu: +10 ₺ nakit bahşiş, +1 itibar, +0.45 nitro dolumu, 25s canlılık buff'ı ve prosedürel terazi sesi (`sound.marketScale()`). Minimap radarda `🧺`.

---

## 18. Sanayi "Tarihi Marangozlar Sitesi & Ahşap Kereste Atölyesi" (T55)
- **Konum ve Mimari Yapı (`createCarpenterView` & `src/game/carpenter.ts`)**:
  - Konum: X: 62.0, Z: -74.5 (Sanayi Organize Bölgesi, Sanayi Kuzey Sokağı Z: -66 bordürü).
  - 12.0m x 9.0m endüstriyel ahşap talaşlı beton avlu, granit taş bordürler, asfalt servis yanaşma peronu (`CARPENTER_BAY`: X: 62.0, Z: -68.0).
  - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
  - 4 adet dikey masif ahşap kolon sütun (Douglas-fir), yatay lamine kirişler, A-çatı makasları ve oluklu galvaniz sanayi sacı gölgeliği.
  - Işıklı büyük kurumsal çatı tabelası (`"🪵 SANAYİ TARİHİ MARANGOZLAR SİTESİ · RÜSTEM USTA 🪚"`), alt kurumsal şerit (`"MASİF AHŞAP İŞÇİLİĞİ · KERESTE & KARGO SANDIKLARI · 1968"`), gece tezgahı aydınlatan sıcak kehribar PointLight armatürü.
  - Dikey kereste istif rafları (sarı çam, kızıl sedir, koyu meşe kalasları).
  - Ahşap EUR palet üzerinde piramit şeklinde istiflenmiş silindirik kabuklu çam kütükleri ve çelik bağlama çemberleri.
  - Dönen dairesel testere tezgahı (çelik daire bıçak, kırmızı koruyucu muhafaza, kesilen ahşap parça ve 8 adet savrulan dinamik altın sarısı talaş partikülü).
  - Marangoz çalışma masası, mengene, el rendesi, ahşap tokmak ve dayanıklı ahşap Mini Kargo sandığı (`"📦 MK"`).
- **Usta Marangoz NPC ("Marangoz Rüstem Usta") & Şasi Gücü Bonusu**:
  - Askılı kot tulum, flanel iş gömleği, talaş tozu lekeleri, kulak arkasında marangoz kurşun kalemi, cepte katlanır sarı metre, heybetli usta bıyığı ve deri eldivenler.
  - 22m mesafeden kafa/gövde takibi, korna ve yanaşmada kolunu kaldırarak usta selamı ve 3D konuşma balonu (`"🪵 Marangoz Rüstem Usta: Hoş geldin evlat! Fırınlanmış meşeden Mini Kargo kasası gibi sağlam kargo sandığı yapıyoruz! 🪚"`).
  - "Sanayi İşçiliği Gücü" pitstop bonusu: +10 ₺ nakit desteği, +1 itibar, +0.45 nitro dolumu, 25s şasi takviyesi & çarpışma darbe hasarını %50 azaltma buff'ı, altın konfeti & para akışı ve prosedürel testere sesi (`sound.buzzSaw()`). Minimap radarda `🪵`.

---

## 19. Çarşı "Tarihi Bakırcılar Çarşısı & Antik Kapalı Bedesten" (T56)
- **Konum ve Mimari Yapı (`createCoppersmithView` & `src/game/coppersmith.ts`)**:
  - Konum: X: 63.0, Z: 75.5 (Tarihi Çarşı Bölgesi, Doğu Z: 84 Sokağı kuzey bordürü).
  - 12.0m x 9.5m klinker tuğla ve rustik taş avlu tablası, granit taş bordürler, asfalt servis yanaşma peronu (`COPPERSMITH_BAY`: X: 63.0, Z: 81.0).
  - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
  - Kesme kireçtaşı ve traverten taş kemerli bedesten revakları (arched stone portals), pişmiş toprak kiremitli saçaklıklar.
  - Işıklı büyük kurumsal çatı tabelası (`"🏺 TARİHİ BAKIRCILAR ÇARŞISI · KAZIM USTA 🔨"`), alt kurumsal şerit (`"EL DÖVMESİ BAKIR SANATI & ANTİK BEDESTEN · 1954"`), gece ve gündüz tezgahı aydınlatan sıcak kehribar PointLight armatürü.
  - Parlak el dövmesi bakır kazanlar, cezve takımları, semaverler ve oymalı bakır siniler.
  - Taş kemerlerde ve askılarda sergilenen otantik el dokuması Türk kilimleri ve halıları.
  - Ağaç kütük kaide üzerinde döküm çelik bakırcı örsü, topuz çekiç ve bakır işleme aletleri.
- **Usta Bakırcı NPC ("Bakırcı Kazım Usta") & Esnaf Hürmeti Bonusu**:
  - Deri esnaf önlüğü, bordo kadife fes, heybetli kıvrık pala bıyık, deri bileklikler.
  - Elinde pirinç topuz çekiç ile örsteki bakır tepsiyi ritmik dövme / tıklatma animasyonu.
  - 22m mesafeden kafa/gövde takibi, korna ve yanaşmada çekicini kaldırarak usta selamı ve 3D konuşma balonu (`"🏺 Bakırcı Kazım Usta: Hoş geldin kargocu evlat! El emeği göz nuru dövme bakır gibi sağlam kargolar taşıyorsun! 🔨"`).
  - "Usta Esnaf Hürmeti" pitstop bonusu: +10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 30s "Usta Esnaf Hürmeti" müşteri teslimatlarında +15 ₺ esnaf bahşişi buff'ı, altın konfeti & para akışı ve prosedürel çekiç vuruşu & metalik rezonans sesi (`sound.coppersmith()`). Minimap radarda `🏺`.

