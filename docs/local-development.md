# Yerel geliştirme

Kanonik kaynak `supabase/management` ve `supabase/clinic` dizinlerindedir. `.local` dizini Supabase CLI çalışma kopyasıdır; buradaki migration dosyalarını elle değiştirmeyin. `.env` ve üretilen tarayıcı bağlantı dosyası Git'e alınmaz.

Ön koşullar: Node.js, npm, çalışan Docker Desktop ve Supabase CLI. Angular 15 korunmuştur; bu çalışma makinesinde Node 26.3 ile production derlemesi doğrulandı. Docker bu çalışma ortamında bulunmadığı için aşağıdaki tam Supabase akışı henüz çalıştırılamadı.

```powershell
npm ci
npm run supabase:prepare
supabase start --workdir .local/management
supabase start --workdir .local/clinic
```

İki yerel PostgreSQL/Auth/Storage ortamı birbirinden ayrıdır. Yönetim API'si 54321, klinik API'si 55321; Studio portları 54323 ve 55323; e-posta test kutuları 54324 ve 55324'tür.

`.env.example` dosyasını `.env` olarak kopyalayın. Her ortam için Supabase CLI `status` çıktısındaki **anon** anahtarını ilgili `ODIVON_*_PUBLIC_KEY` alanına yazın. **service_role** anahtarını yalnızca `ODIVON_CLINIC_SERVICE_KEY` alanına, yerel sahip şifresini `ODIVON_LOCAL_OWNER_PASSWORD` alanına yazın. Kimlik bilgilerini terminal çıktılarıyla paylaşmayın.

```powershell
npm run config
npm run supabase:seed
supabase functions serve --workdir .local/clinic --env-file .local/clinic/worker.env
npm start
```

Giriş: `http://localhost:4200`, klinik kodu `local-clinic`, e-posta `owner@example.test`, `.env` içinde seçtiğiniz şifre. Seed komutu yalnızca localhost adreslerini kabul eder; yeniden çalıştırmak şifreyi veya deneme başlangıcını değiştirmez. Klinik davetleri yerel e-posta test kutusunda görünür. Klinik başvuru ekranı yönetim Auth hesabını kullanır; klinik oturumuyla ortak değildir.

Yeni migration sonrasında `npm run supabase:prepare` çalıştırın. Mevcut yerel veriyi korumak için `supabase migration up --local --workdir .local/clinic` kullanın. `supabase db reset` yerel veriyi siler; yalnızca yeniden kurulması istenen test ortamında kullanın.

Docker olmadan `npm test` PGlite PostgreSQL motorunda migration, transaction, RLS ve iş akışı testlerini çalıştırır. Bu testlerde Auth ve Storage katalogları sadeleştirilmiştir; gerçek JWT doğrulaması, Storage HTTP erişimi ve Realtime taşıması test edilmez. `npm run build` frontend derlemesidir. Deno kuruluysa `npm run check:edge` Edge Function tür kontrolüdür.

Yerel otomatik proje açma testi gerçek bulut projesi oluşturmaz. Kuyruk durum makinesi sahte sağlayıcıyla test edilir. Gerçek proje oluşturma, yönetim hesabı ve SMTP ayarları tanımlanıp kurulum ayrıca etkinleştirildiğinde çalışır.
