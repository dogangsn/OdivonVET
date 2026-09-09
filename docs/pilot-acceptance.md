# Pilot kabul kaydı

Bu belge tamamlanma iddiası değildir. Otomatik testlerden geçen kontroller ile gerçek Supabase ortamında bekleyen kabul birbirinden ayrılır.

| Senaryo | Mevcut kanıt | Pilot ortamında tamamlanacak kontrol |
|---|---|---|
| Bağımsız ürün | Ayrı depo, Angular production derlemesi | Eski .NET servisleri kapalıyken bütün menüler |
| Klinik izolasyonu | İki PGlite veritabanı, yabancı kullanıcı ve şube reddi | İki gerçek Supabase JWT'si, Storage ve Realtime |
| Yetkiler | RLS/RPC, rol değişimi, son sahip, üyelik değişimi sonrası tekrar çağrı | UI ve doğrudan HTTP çağrıları aynı sonucu vermeli |
| Klinik akış | Müşteri/hasta, muayene, ağırlık, aşı, randevu, otel transaction testleri | Orijinal ekranlarla form ve sonuç karşılaştırması |
| Ticari akış | Satış/KDV/indirim, stok, tahsilat, iptal, tekrar anahtarı | Farklı ödeme ve depolarla uçtan uca senaryolar |
| Raporlar | Tarih filtreleri, aylık randevu DTO'su, kapsam yetkisi | Satış/tahsilat/stok/randevu CSV ve PDF çıktıları |
| SMS/e-posta | XML, teslim kodu, test modu, belirsiz isteği tekrar göndermeme | Doğrulanmış sağlayıcıyla izinli pilot alıcı ve teslim kontrolü |
| Klinik kurulumu | Kota 3, doğrulanmış hesap, lease, kayıp create cevabı, migration checksum | Management API proje oluşturma, fonksiyon dağıtımı, davet, kesinti sonrası devam |
| 14 gün ve aktivasyon | Hazır olma anında başlangıç, yeniden çalıştırmada korunma, server engeli | Süre bitişinde hesap ekranı, dosya indirme, manuel ücretli aktivasyon |
| Yedekleme | Storage arşiv checksum ve örnek bayt geri dönüşü | Tam SQL/Auth ve gerçek Storage geri yükleme provası |
| Görsel kabul | Giriş ekranı ve başvuru bağlantısı tarayıcıda görüldü | Klinik içi ekranlar, mobil boyutlar ve eski ekran karşılaştırması |
| İzleme | Kurulum durum kaydı, outbox, audit ve operasyon rehberi | Alarm alıcısı, harcama uyarısı ve ilk pilot kontrolü |

Bekleyen gerçek ortam testlerini PGlite başarısıyla kapatmayın. `.env`/anahtar, Docker, doğrulanmış e-posta ve SMS hesabı gerektiren kontrollerin sonuçlarını tarih ve ortam bilgisiyle bu dosyaya ekleyin.
