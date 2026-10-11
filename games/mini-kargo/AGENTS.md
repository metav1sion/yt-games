# Mini Kargo çalışma kuralları

- Tarayıcı, gerçek oynanış, mobil/masaüstü görünüm, kullanıcı deneyimi ve görsel kalite testleri kullanıcıya aittir.
- Playwright, Puppeteer, tarayıcı otomasyonu veya manuel tarayıcı kontrolü kullanma. Tarayıcı açma, ekran görüntüsü alma ve görsel inceleme yapma. Mevcut `test:browser` komutunu çalıştırma.
- Kod tarafında ilgili birim/mantık testlerini yaz; her uygulama aşamasında `npm test`, `npm run typecheck`, `npm run build` çalıştır ve hataları gider.
- Kod doğrulamasını görsel/oynanış doğrulaması olarak sunma; kullanıcı testini bekleyen davranışları açıkça belirt.
- Mevcut kayıtları, oyuncu ilerlemesini ve çalışan sistemleri koru. Onaylanan kapsam dışına çıkma.
- Kısa planlar ve aşama özetleri kullan. Gereksiz araştırma, tekrar eden analiz, ayrıntılı rapor ve kapsam dışı düzenleme yapma.
- Kullanıcı açıkça istemedikçe alt ajan/delegasyon kullanma; kod incelemesini de kendin yap.
- Bu kurallar sonraki Mini Kargo geliştirmelerinde geçerlidir; kullanıcı açıkça değiştirirse yeni talimatını uygula.
