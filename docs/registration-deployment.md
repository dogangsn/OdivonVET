# Canlı yapılandırma ve doğrudan üyelik

## Yayın
Yerelde `.env`, canlıda hosting ortam değişkenleri kullanılır:
- `NEXT_PUBLIC_SUPABASE_URL`: Odivon yönetim projesinin URL'si.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: aynı projenin public anahtarı.
- `ODIVON_MANAGEMENT_URL` / `ODIVON_MANAGEMENT_PUBLIC_KEY` tanımlanmışsa karşılık gelen NEXT_PUBLIC değerinden önceliklidir. Kullanılmayan eski değişkenleri kaldırın.

`npm run build`, önce `npm run config` çalıştırır. Eksik/geçersiz ayarlar derlemeyi durdurur. Çıktı `dist/odivon-vet`; tarayıcı `assets/odivon-config.json` okur. Bu dosya ve `.env` Git'e girmez. Değer değişikliği yeniden yayın gerektirir. Service-role, veritabanı parolası ve Management API token bu dosyaya konmaz.

Netlify/Cloudflare Pages için çıktıdaki `_headers`, Vercel için `vercel.json` yapılandırma dosyasına `Cache-Control: no-cache, max-age=0, must-revalidate` uygular. Diğer hostinglerde bu başlığı aynı URL için tanımlayın; SPA yönlendirmesini yalnız uygulama yollarına uygulayın. Yayından sonra ağ panelinde dosyanın JSON döndüğünü ve Cache-Control başlığını kontrol edin. Angular fetch ayrıca `cache: no-cache` kullanır.

## Yönetim Supabase projesi
Public anahtar sunucu ayarı değiştiremez. Supabase Dashboard/CLI yönetim erişimiyle:
1. `supabase/management/migrations` altındaki henüz uygulanmamış SQL dosyalarını tarih sırasıyla uygulayın. Mevcut tablolar varsa körlemesine başlangıç migration'ını çalıştırmayın; migration geçmişini karşılaştırın.
2. Auth'ta e-posta sağlayıcısını ve yeni kayıtları açın, **Confirm email** seçeneğini kapatın; minimum parolayı 12 karakter yapın. Bu ayar yalnız yönetim projesine aittir; klinik davet akışını değiştirmeyin.
3. Site URL'yi canlı uygulama adresine ayarlayın. CAPTCHA aktifse public Turnstile site anahtarını `ODIVON_TURNSTILE_SITE_KEY` olarak, secret anahtarını yalnız Supabase Auth ayarına girin.
4. Mevcut provisioning dokümanına göre Edge Functions ve sunucu secret'larını kurun. `provisioning_enabled=false` varsayılanında başvuru bekleme listesine alınır; üyelik başarılı olması klinik kurulumunun hazır olduğunu ifade etmez.

Doğrudan üyelik: Auth signUp -> oturum -> `register_clinic(p_name,p_owner)` -> `clinic_applications`. Auth'un Confirm email kapalı ayarı hesabı otomatik onaylar; RPC yine geçerli onaylı Auth kullanıcısı ister. Klinik kodu sunucuda üretilir. Hesap oluşup RPC başarısız olursa aynı oturumla başvuru tamamlanabilir. Oturum kaybolmuşsa kayıt ekranındaki “Daha önce başvurdum” seçeneği yönetim hesabına giriş yapar; klinik girişi ayrı kalır.

Klinik giriş ekranı kod istemez. Klinik sahibi için `clinic-directory`, yönetim projesindeki doğrulanmış başvuru e-postasından hazır klinik projesini bulur. Davet edilen personelde davet bağlantısındaki klinik bilgisi tarayıcıya kaydedilir ve sonraki girişlerde kullanılır. Yeni cihazdaki personel ilk kez klinik davet bağlantısını açmalıdır; bir klinik kullanıcısının e-postası genel dizine yazılmaz.

Klinik giriş ekranı kullanıcıdan klinik kodu istemez. Önce yönetim projesindeki hazır klinik kaydı e-posta ile çözer; ekip davet bağlantıları da klinik bağlamını tarayıcıya kaydeder. Dizin yalnız `ready` durumundaki kliniğin public URL ve publishable anahtarını döndürür. Bulutta `clinic-directory` Edge Function'ın güncel sürümü dağıtılmadan kodsuz giriş çalışmaz.

Gerçek bulut kabulü: yeni bir test hesabı ile tek başvuru oluştuğunu, tekrar denemede aynı ID döndüğünü ve kurulum durumunu kontrol edin. Yönetim migration'ı ve Auth ayarları uygulanmadan bu kontrol geçmiş sayılmaz.

## Son doğrulama — 10 Eylül 2026
Verilen yönetim projesinin public Auth settings çağrısı başarılı: kayıt açık, e-posta sağlayıcısı açık, `mailer_autoconfirm=false`. `clinic_applications` için okuma isteği `PGRST205` (tablo schema cache içinde bulunamadı) döndü. Bu oturumda Supabase yönetim erişimi sağlanmadığından bulut migration'ları veya Auth ayarları değiştirilmedi. Önce yukarıdaki yönetim kurulumunu tamamlayın. Public anahtar değiştirmek bu iki eksikliği çözmez.

## Tarayıcı testleri
Uygulama yerelde açıkken `npm run test:registration` çalıştırın. Varsayılan tarayıcı sistemdeki Edge'dir; CI'da Playwright Chromium kurup `PLAYWRIGHT_CHANNEL=chromium` kullanabilirsiniz. `ODIVON_PREVIEW_URL` ile farklı önizleme adresi seçilebilir. Testler Supabase yanıtlarını izole biçimde taklit eder; gerçek hesap oluşturmaz, bulut kabulünün yerine geçmez. Görsel çıktılar `.local` altındadır.

Bu çalışma için üç yönetim migration dosyasının transaction ile birleştirilmiş kopyası `.local/management-bootstrap.sql` altında hazırlandı. Yalnız henüz başlatılmamış yönetim şemasında çalıştırın; mevcut `private` şema veya tablolar varsa üzerine yazmadan hata verir. Sürümlü kaynaklar her zaman `supabase/management/migrations` dosyalarıdır.
