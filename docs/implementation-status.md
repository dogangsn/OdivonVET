# Uygulama durumu — 9 Eylül 2026

Odivon.Vet bağımsız depoda geliştiriliyor. Kaynak BrewCloud.Client ve BrewCloud backend korunuyor. Bu kayıt ilk pilot öncesi geliştirme durumudur; kapsamın tamamlandığı anlamına gelmez.

Son doğrulama: 20 otomatik test geçti. Üretim derlemesi başarılı (`491f125cf950dd5d`). Altı Edge Function Deno tür kontrolüyle doğrulandı. Kurulum paketi 35 klinik migration'ı ve iki klinik Edge Function içeriyor. Yönetim ve klinik yerel çalışma kopyaları yeniden üretildi.

Son tamamlanan değişiklikler:

- Takvim formunun hasta ve aşı alanları, randevu süresi, günlük liste ve çakışma kontrolü.
- Aşı randevusu ile aşı takviminin birlikte oluşturulması, güncellenmesi ve silinmesi.
- Randevu tahsilatının satış/ödeme/stok ile aynı transaction'da yapılması; farklı anahtarla bile ikinci ücretlendirme reddi.
- Tahsilat iptalinde randevu ödeme durumunun otomatik hesaplanması; satış iptalinde stok iadesi.
- Satış detayları ve müşteri satış/tahsilat bakiye alanları; tarihli satış filtresi; kayıtlı birim fiyat ve vergi hesaplaması.
- Üyelik/şube değişiminden sonra eski işlem yanıtının tekrar kullanılmasının engellenmesi.
- SMS kuyruğunda test/canlı niyetinin kayda alınması ve aynı anahtarın farklı alıcılarla kullanılamaması.
- Çek işlem anahtarı, kapalı çek koruması; dosyanın müşteri/hasta/şube ilişkisinin kontrolü.
- Şube adres/telefon alanlarının kaydedilmesi; yeni şubenin randevu ve hayvan türü başlangıç tanımları.
- Gerçek kullanıcı profili ve dahili kısayollar; rapor seçiminde yetki filtresi; girişte Türkçe karakter düzeltmesi.
- Süresi dolan oturumun hesap/dışa aktarım sayfasına yönlendirilmesi.
- SHA-256 kontrollü dosya arşivi ve yalnızca yerel hedefe tekrar çalıştırılabilir geri yükleme aracı.

## Sonraki geliştirme ve kabul

1. **İşlem envanteri:** `docs/feature-inventory.md` kaynak yönlendirme envanteridir. Her aktif ekranın bütün yazma ve okuma varyantları için kabul işaretlenmeli. Hâlâ genel entity eşleştirmesi kullanan uçlar ayrıca kontrol edilmelidir.
2. **Ticari kapsam:** Çok depolu stok ve alış/talep tamamlama ilişkileri, eski finansal filtrelerin tümü ve klinik istatistik filtreleri uçtan uca doğrulanmalı. Mevcut stok ledger'ı ürün/şube esaslıdır; depo bazında tam kabul yapılmadı.
3. **Yönetim:** Eski özel rol/SMTP ekranlarının yeni sabit rol ve sağlayıcı ayarlarıyla değiştirilen yolları taranmalı; erişilebilir eski menü bırakılmamalı. Unvanların personel ilişkisindeki kullanımı kontrol edilmeli.
4. **Entegrasyon:** Otomatik randevu hatırlatma ve müşteri karşılama seçenekleri, sağlayıcı teslim akışı ve hata kurtarma davranışı doğrulanmalı. Resend için gerçek e-posta teslim webhook'u henüz uygulanmadı.
5. **Supabase kabulü:** Docker bu ortamda yok. Gerçek Auth/JWT, Storage HTTP ve Realtime, PGlite katalog testlerinden ayrı çalıştırılmalı. Bulut provisioner'ın Management API ile fiili proje oluşturması/dağıtması denenmedi.
6. **İşletim:** Hazır kliniklere kontrollü migration yayını, gerçek SQL/Auth/Storage geri yükleme provası, harcama alarmı ve pilot izleme sonuçları kaydedilmeli.

PGlite testleri PostgreSQL transaction ve RLS davranışlarını çalıştırır; Supabase servislerinin tümünü çalıştırmaz. Storage arşiv testi örnek baytlar ve bellek içi sağlayıcı kullanır. Giriş/başvuru ekranları tarayıcıda görüldü; klinik içi görsel karşılaştırma yapılmadı. Canlı proje veya gerçek ileti gönderimi bu çalışmada yapılmadı.
