# Mini Kargo Priority Fixes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the approved plan inline. User instructions override browser automation and delegated review steps. Track steps with checkboxes.

**Goal:** Beş öncelikli kalite sorununu mevcut sistemler ve kayıtlar korunarak düzeltmek.

**Architecture:** Mevcut giriş, HUD, satın alma ve teslimat akışlarında küçük değişiklikler. Sürekli temasın tekrar hasar üretmesini önleyen, Three.js'ten bağımsız bir mantık modülü.

**Tech Stack:** Mevcut TypeScript, Vitest, Three.js ve CSS; tarayıcı otomasyonu kullanılmaz.

**Spec:** `docs/superpowers/plans/2026-10-12-mini-kargo-quality-roadmap.md` içindeki öncelikli bulgular ve kullanıcının 12 Ekim 2026 tarihli beş düzeltme talebi. Bu plan ilk dilime sürekli temas hasarını da dahil eder.

## Global Constraints

- Uygulama bu plan değerlendirildikten sonra başlar; aynı sohbet içinde kendim yürütürüm.
- Para, itibar, şirket seviyesi, yükseltmeler ve mevcut kayıt anahtarı korunur; veri sıfırlama veya otomatik iade yapılmaz.
- Yeni özellik, harita, ekonomi dengesi veya kapsamlı trafik fiziği eklenmez.
- Ben: birim/mantık testleri, TypeScript, build. Kullanıcı: tarayıcı, oynanış, mobil/masaüstü görünüm ve görsel kalite.
- Tarayıcı açma, otomasyon, ekran görüntüsü, görsel inceleme ve `test:browser` çalıştırma yok.
- Her aşamada yalnızca kısa değişiklik ve doğrulama özeti.

## Review Focus

- Joystick alt öğesine basma ve pointer iptali: kontrol başlamalı ve bırakılınca sıfırlanmalı (Aşama 1).
- Yatay/kısa ekranda sonuç düğmesine erişim: kodda kaydırma/yerleşim sağlanır, kullanıcı tarayıcıda doğrular (Aşama 1).
- Eski kayıtta yüksek kapasite seviyesi veya yetersiz bakiye: faydasız alım para eksiltmez (Aşama 2).
- Depodan veya kapasitedeki sıradaki pakete geçiş: yeni paketin hasarı sıfır, araç hasarı korunmuş olmalı (Aşama 3).
- Uzun temas, değişen şiddet ve ayrılıp tekrar temas: hasar kare sayısına bağlı birikmemeli (Aşama 3).

## Aşama 1 — joystick ve mobil sonuç ekranı

**Dosyalar:** `games/mini-kargo/src/game/input.ts`, `input.test.ts`, `src/style.css`; gerekirse sınırlı `src/ui/hud.ts` değişikliği.

**Arayüz:** `createInput()` ve `InputController` dış arayüzü korunur.

- [ ] Giriş kabulü ve sıfırlama için başarısız birim testleri: joystick'in iç öğesine fare basışı kabul edilir; toolbar/sonuç ekranı dokunması sürüş başlatmaz; pointer iptali ve odak kaybı girdiyi sıfırlar. Vitest içinde gerekli küçük olay/DOM fixture'ı kullanılır; gerçek tarayıcı çalıştırılmaz.
- [ ] Fare hedefini doğrudan eşitlikle değil joystick'in içeriğinde bulunmasıyla kontrol et. Hareketli dokunmatik joystick davranışını koru; ekran boyutu değişiminde aktif pointer'ı sıfırla ve joystick'i geçerli konuma getir.
- [ ] Sonuç katmanına ekran yüksekliğiyle sınırlı, güvenli kenar boşluklu dikey kaydırma ekle. Kısa ekranlarda kartın üstünü kesen ortalamayı kaldır; puan, garaj ve yeniden başlatma düğmesini koru. Genel sürüş HUD'u yeniden tasarlanmaz.
- [ ] `npm test`, `npm run typecheck`, `npm run build` çalıştır. Özet: kod kontrolleri sonucu; görsel/gerçek pointer doğrulaması kullanıcıda.

## Aşama 2 — faydasız kapasite satın alımını engelleme

**Dosyalar:** `src/game/upgrades.ts`, yeni `upgrades.test.ts`, `src/bootstrap.ts`, `src/ui/hud.ts` (tüm yollar `games/mini-kargo/` altında).

**Arayüz:** Ortak satın alma kuralı `canPurchaseUpgrade(kind: UpgradeKind, level: number, money: number): boolean`; HUD ve satın alma işlemi aynı kuralı kullanır. Test edilebilir işlem `tryPurchaseUpgrade<T extends {money: number; upgrades: VehicleUpgrades}>(state: T, kind: UpgradeKind): T`; reddedilen alımda aynı nesneyi döndürür, kabul edilende yalnızca bakiye ve ilgili yükseltmeyi değiştirir. Bootstrap yalnızca değişmiş sonucu kaydeder.

- [ ] Başarısız testler: kapasite 0→1 yeterli parayla alınır; 1 ve üstü kapasite alımı reddedilir; yetersiz bakiye reddedilir; motor/fren için mevcut maliyet kuralı korunur.
- [ ] Gerçek kapasite zaten iki pakette sınırlandığından kapasite yükseltmesini seviye 1'de sınırla. HUD'da "Maksimum · 2 paket" göster ve düğmeyi devre dışı bırak; işlem tarafında da alımı reddet.
- [ ] Önceden kaydedilmiş daha yüksek seviyeleri silme veya düşürme; para/diğer yükseltmeler korunur. Reddedilen alım kayıt yazmaz, para eksiltmez. Bu işlem kuralı için birim testi ekle.
- [ ] Üç kod kontrolünü çalıştır ve kısa özet ver. Satın alma ekranının görünümü kullanıcı tarafından doğrulanır.

## Aşama 3 — paket hasarı ve sürekli temas

**Dosyalar:** `src/game/delivery.ts`, `delivery.test.ts`, yeni `src/game/contact-damage.ts`, `contact-damage.test.ts`, `src/bootstrap.ts`; temas kaynaklarını ayırt etmek için gerekirse sınırlı `src/scene/traffic.ts` ve `pedestrians.ts` değişikliği.

**Arayüz:** `createContactDamageTracker()` → `update(contacts: Array<{id: string; severity: number}>, dt: number): number`, `reset(): void`. Çıktı yalnızca bu adımın ek darbe şiddetidir; teslimatın mevcut hasar katsayıları korunur.

- [ ] Başarısız testler: yeni depo yüklemesinde paket hasarı 0; kapasitedeki sonraki pakette hasar 0; araç hasarı korunur. Hasarın ödülünü hesapladıktan sonra yalnızca yeni pakete geçişte sıfırla; turun son paketinin sonucu korunur.
- [ ] Temas testleri: aynı 0.5 şiddeti bir saniye sürdürmek toplam 0.5 darbe üretir; 30/60/120 adım aynı sonucu verir; 0.2→0.6 şiddet toplam 0.6 üretir; iki farklı kaynak ayrı sayılır; 150 ms ayrılıktan sonra yeni temas yeniden sayılır; restart/reset eski teması temizler.
- [ ] Kaynak bazında temasın en yüksek şiddetini takip et: aynı temasta yalnızca artan şiddet ek hasar üretir; temas en az 150 ms kesilince yeni darbe kabul edilir. Statik engellerde şiddeti adım başına hareket mesafesinden değil çarpışma öncesi hızdan türet; trafik/yaya yakınlık sinyallerini kendi kaynaklarıyla takip et.
- [ ] Hasar girdisi, çarpışma sesi ve kamera sarsıntısını aynı olay hesabına bağla. Restart/kurtarmada takipçiyi sıfırla; bu düğmeler mevcut paket veya araç hasarını ücretsiz temizlemez.
- [ ] Üç kod kontrolünü çalıştır ve kısa özet ver. Hasarın adil hissedilmesi ve görsel/ses geri bildirimleri kullanıcı tarafından oynanarak değerlendirilir.

## Teslim

Her aşama sonunda kod kontrolü sonuçlarını paylaş. Beş düzeltmenin sonunda kullanıcıya kısa bir kontrol listesi sun: joystick, ekran döndürme/yatay sonuç, maksimum kapasite, yeni paket hasarı, uzun temas ve yeniden çarpışma. Tarayıcıda doğrulanmamış davranışları açıkça "kullanıcı testi bekliyor" olarak belirt.
