# Odivon Vet

Angular 15/Fuse Vet ekranlarının bağımsız ürün olarak ayrıştırılması ve Supabase geçişi. Yeni ürünün kaynakları bu depodadır; BrewCloud.Client ve BrewCloud backend depoları değiştirilmez.

## Çalıştırma

Bu makinede Node 26.3.0 ile production derlemesi doğrulandı; `.nvmrc` bu sürümü belirtir. Supabase JS bağımlılığı Node 22 veya üzerini ister. Angular sürümü 15.1.1 olarak korunmuştur; Angular için büyük sürüm ve resmi Node uyumluluğu çalışması ayrıca ele alınmalıdır.

```powershell
npm ci
npm run supabase:prepare
```

Sonra [yerel geliştirme rehberini](docs/local-development.md) izleyerek iki yerel Supabase ortamını açın, `.env` dosyasını doldurun ve:

```powershell
npm run config
npm run supabase:seed
npm start
```

Tarayıcıya yalnızca proje URL'si ve public/anon anahtarı gider. Klinik service anahtarı, Management API token'ı ve sağlayıcı şifreleri tarayıcı yapılandırmasına yazılmaz.

## Yapı

- `src/app`: Vet ekranları, klinik oturumu, tipli Supabase adaptörleri ve yeni hesap/rapor/SMS/çek/yönetim ekranları.
- `supabase/clinic`: Her kliniğe uygulanan veritabanı, RLS, transaction RPC, özel Storage ve Edge Functions.
- `supabase/management`: Başvuru, klinik dizini, kapasite, tekrar denenebilir kurulum ve manuel aktivasyon.
- `scripts/*.mjs`: Yapılandırma, kurulum paketi, yerel çalışma kopyası ve Storage yedekleme araçları.
- `scripts/*.py`: İlk ayrıştırma sırasında kullanılan tek seferlik düzenleme yardımcılarıdır. Güncel kaynakları yeniden üretmek için çalıştırmayın; sonraki elle yapılan değişiklikleri geçersiz kılabilirler.
- `tests`: PostgreSQL/PGlite iş kuralları ve saf sağlayıcı/kurulum/arşiv testleri.

Gym ve bağımsız appointment-management ürünleri alınmamıştır. Mevcut endpoint dizeleri yalnızca eski Angular servisleriyle uyumlu işlem adlarıdır; HttpService onları Supabase RPC'ye iletir. .NET API çağırmazlar. Oturum Supabase Auth kullanır; canlı randevu güncellemeleri Supabase Realtime kullanır.

## Doğrulama

```powershell
npm test
npm run build
npm run check:edge
```

`check:edge` Deno ister. Bu ortamda aynı kontrol `npx --yes deno@2.9.6 check --config supabase/deno.json ...` ile de çalıştırıldı. PGlite testlerindeki Auth/Storage katalogları sadeleştirilmiştir; başarı gerçek JWT, Storage HTTP, Realtime veya bulut kurulumunun tamamlandığı anlamına gelmez.

Giriş ve klinik başvuru sayfası tarayıcıda kontrol edildi. Canlı proje oluşturulmadı, gerçek e-posta/SMS gönderilmedi. Docker bu ortamda bulunmadığından tam yerel Supabase kabulü ve gerçek yedek geri yükleme bekliyor. Klinik içi ekranların tüm kabul senaryoları henüz tamamlanmadı; bu depo canlı kullanıma hazır olarak değerlendirilmemelidir.

## İşletim ve kalan kabul

- [Yayın, kapasite, zamanlayıcı ve aktivasyon](docs/deployment.md)
- [Veritabanı ve dosya yedekleme / geri yükleme](docs/backup-restore.md)
- [Pilot kabul senaryoları ve doğrulama sınırları](docs/pilot-acceptance.md)
- [Güncel uygulama durumu ve sonraki işler](docs/implementation-status.md)
- [Kaynak işlem envanteri](docs/feature-inventory.md)

Envanterdeki bir işlemin eşleştirilmiş olması, onun bütün ekran senaryolarının doğrulandığı anlamına gelmez. Özellikle çok depolu stok/alış akışları, otomatik hatırlatmalar, finansal ekranların tüm filtreleri, eski özel rol ekranlarının yeni sabit rollere uyarlanması ve tüm menülerin görsel kabulü pilot öncesi takip edilmelidir.

Fuse ve diğer ticari arayüz bağımlılıklarının mevcut lisans dosyaları korunmuştur.

Kayıt ve canlı ortam değişkenleri: [Kurulum rehberi](docs/registration-deployment.md).
