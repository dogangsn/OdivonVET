# Pilot yayını

Bu depo henüz üretim kabulü almış değildir. Önce iki test kliniğinde Auth/Storage/Realtime izolasyonu ve ekran kabulü tamamlanmalıdır. Derleme ve PostgreSQL birim testlerinin geçmesi bulut kabulü yerine geçmez.

## Yönetim projesi

1. Supabase yönetim projesini oluşturun. `supabase/management/migrations` dosyalarını sırasıyla uygulayın. Klinikteki hasta/finans tablolarını buraya kurmayın.
2. Yönetim Auth'ta e-posta doğrulaması, SMTP, minimum şifre uzunluğu ve Turnstile CAPTCHA'yı etkinleştirin. Site URL ve `/auth/registration` dönüş adresini yalnızca ürün alan adıyla sınırlandırın. Tarayıcı config dosyasında `turnstileSiteKey` tanımlayın.
3. `npm run supabase:bundle` çalıştırın. `clinic-directory`, `clinic-provisioner`, `clinic-maintenance`, `clinic-activate` işlevlerini yönetim projesine dağıtın. JWT gateway doğrulaması bu işlevlerde kapalıdır: herkese açık dizin yalnızca hazır kliniğin **public** bağlantısını döndürür; diğerleri kendi sunucu token'ını doğrular. `clinic-members` klinik JWT'sini Auth servisine doğrulatır.
4. Yönetim Edge secrets: `APP_ORIGIN`, `SUPABASE_MANAGEMENT_TOKEN`, `SUPABASE_ORGANIZATION_SLUG`, `SUPABASE_REGION`, `WORKER_TOKEN`, `CLINIC_WORKER_MASTER`, `ACTIVATION_TOKEN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. Üç token birbirinden farklı, rastgele ve güçlü olmalıdır. Management token yalnızca Odivon organizasyonuyla sınırlı yetkiler taşımalıdır. `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` platform tarafından sağlanır.
5. Vault'ta `odivon_management_url` ve `odivon_worker_token` secrets oluşturun. `supabase/management/ops/scheduler.sql` dosyasını çalıştırın. Zamanlayıcı provisioning ve bakım işlevlerini her dakika çağırır; ayrı API sunucusu gerekmez.
6. Organizasyonun toplam proje sayısı, fiyat planı ve bütçesi incelendikten sonra `private.platform_settings.provisioning_enabled=true` ayarlayın. `trial_slots=3` varsayılanını koruyun. Ücretli veya denemesi bitmiş fakat silinmemiş projelerin ayırdığı slotlar otomatik boşalmaz. Slot artırımı bütçe kararıdır.

Kurulum her çağrıda bir adım veya bir migration uygular. Proje adı başvuru UUID'sinden üretilir; oluşturma niyeti dış çağrıdan önce kaydedilir. Yanıt kaybolduğunda aynı isimli proje aranır; ikinci bir oluşturma isteği gönderilmez. Migration checksum'u değişirse kurulum durur. `attention` kayıtları incelenmeden yeniden kuyruğa alınmamalıdır.

## Klinik ve frontend

Klinik kurulumu migration'ları, özel dosya alanını, Edge işlevlerini, Auth davetini, rolleri ve başlangıç tanımlarını uygular. Deneme süresi `prepare_clinic` başarılı olduğunda 14 gün olarak başlar; tekrar çağrı aynı bitişi korur.

SMS/e-posta başlangıçta **test modundadır**. Klinik sahibi Genel Ayarlar'da Mutlucell ve Resend bilgilerini kaydedip canlı modu açar. Anahtarlar private şemada saklanır; tarayıcıya geri döndürülmez. Auth davetlerinin SMTP'si bundan ayrıdır ve yönetim projesinin kurulum girdisidir. Gerçek gönderim için doğrulanmış adres/başlık ve sağlayıcı hesabı gerekir. Test sonuçları SMS geçmişinde açıkça belirtilir.

`.env` üzerinden yalnızca yönetim URL'si ve public anahtarıyla `npm run config`, ardından `npm run build` çalıştırın. `dist/odivon-vet` herhangi bir HTTPS statik barındırıcıda yayınlanabilir. Bütün Angular yolları `/index.html` dosyasına yönlenmelidir; `/assets/*` bulunamadığında HTML yerine 404 dönmelidir. Cache politikası: `index.html` ve `odivon-config.json` kısa/no-cache; hash içeren JS/CSS uzun immutable cache. Service-role, SMTP, SMS ve Management token'larını frontend ortam değişkenlerine veya config dosyasına koymayın.

## Ödeme teyidi

Odivon yöneticisi sunucu tarafından `clinic-activate` işlevine `{id: başvuru UUID, reference: ödeme teyidi}` gönderir; Authorization değeri `ACTIVATION_TOKEN` olur. Önce klinik veritabanındaki abonelik açılır, sonra merkez kayıt güncellenir. Ağ hatasında aynı referansla yeniden denemek güvenlidir; durum iki tarafta kontrol edilmelidir. Bu uç nokta tarayıcı yönetim paneline public anahtarla açılmamalıdır.

## İzleme ve değişiklik yayını

- `clinic_applications.state='attention'`, eski lease'ler ve uzun süre ilerlemeyen migration kayıtları.
- Cron iş sonuçları, `net._http_response` HTTP hata durumları ve Edge Function 5xx sayıları. Yanıtlara kimlik bilgileri, hasta verileri veya sağlayıcı XML'leri yazılmamalıdır.
- Klinik `message_outbox` unknown/failed kayıtları. Unknown kayıtlar otomatik yeniden gönderilmez; önce sağlayıcı panelinden sonuç doğrulanır.
- Supabase organizasyon faturası, compute proje sayısı, Storage ve egress. Bu depoda otomatik fatura okuma veya harcama alarmı entegrasyonu henüz doğrulanmış değildir; pilotta platform harcama limitleri ve uyarıları açılmalıdır.
- Yayımlanmış migration'ları değiştirmeyin. Bu ilk geliştirme sürümü için migration'lar henüz dondurulmamıştır. Sonraki sürümleri önce test projesinde, sonra her klinikte sıralı ve kontrollü uygulayın. Mevcut worker yeni klinik kurulumunu yürütür; hazır kliniklere toplu yükseltme ayrı kontrollü işlemdir.

Resmi sözleşmeler: [Supabase proje oluşturma](https://supabase.com/docs/reference/api/v1-create-a-project), [SQL çalıştırma](https://supabase.com/docs/reference/api/v1-run-a-query), [Edge dağıtımı](https://supabase.com/docs/reference/api/v1-deploy-a-function), [zamanlama](https://supabase.com/docs/guides/functions/schedule-functions), [Mutlucell gönderim](https://www.mutlucell.com.tr/toplusmsapi/hm_xml_kodunu_post_etme.htm), [teslim raporu](https://mutlucell.com.tr/toplusmsapi/hm_paket_raporu.htm), [Resend](https://resend.com/docs/api-reference/emails/send-email).
