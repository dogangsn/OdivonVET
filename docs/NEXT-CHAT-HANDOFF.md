# Odivon Vet — yeni sohbet devir notu

Bu dosya yeni Codex sohbetinde çalışmaya doğrudan devam etmek için hazırlanmıştır. Yeni sohbette önce bu dosyayı ve yalnızca ilgili kaynak dosyalarını okuyun; eski konuşmayı yeniden incelemeye gerek yoktur.

## Proje ve hedef

- Yerel proje: `C:\Users\dogan\Documents\Private\Project\Odivon.Vet`
- GitHub: `dogangsn/OdivonVET`, ana dal `master`
- Canlı uygulama: `https://vet.odivon.com`
- Frontend: Angular 15.1.1 + Fuse
- Backend: ayrı .NET API yok; Supabase Auth, PostgreSQL/RPC, Storage, Realtime ve Edge Functions kullanılıyor.
- Yönetim ve her klinik ayrı Supabase projesinde tutulacak şekilde tasarlandı.
- BrewCloud.Client ve BrewCloud backend kaynakları korunuyor; Odivon.Vet bağımsız üründür.

## Canlı altyapı durumu

- Yönetim Supabase proje ref: `bchqsyqimcudbybdovjx`
- İlk klinik Supabase proje ref: `iitqlypqjdsbnpvyyjuk`
- Klinik projesinde 35/35 migration uygulanmış ve 56 public tablo oluşmuştur.
- Klinik sahibi profili `owner`, aktif ve entitlement kontrolünden geçiyor.
- Supabase Free planı nedeniyle yönetim projesine ek olarak şu anda yalnız bir klinik projesi kullanılabiliyor. Canlı `trial_slots` bu nedenle `1`; üç otomatik klinik hedefi ücretli kapasite açılınca uygulanabilir.
- Canlı üyelik → yönetim Auth → klinik başvurusu → kurulum durumu → klinik dizini → klinik Auth akışı çalışır.
- Var olan pilot kullanıcıyla kod girmeden giriş ve dashboard açılışı doğrulandı.
- Gizli değerler yalnız git dışındaki `.env.deploy` dosyasındadır. Token, SMTP parolası, service role anahtarı veya kullanıcı parolası kaynaklara/dokümana yazılmamalıdır.

## Tamamlanan son düzeltmeler

- `d31aa1b`: TinyMCE harici `no-api-key` CDN betiği kaldırıldı; paket yerel `/tinymce` varlıklarından yükleniyor.
- `86002c8`: arama ve hızlı sohbet şablonlarında eksik kişi nesneleri için güvenli erişim eklendi.
- `d87c151`: kullanıcı servisi başlangıç değeri `BehaviorSubject` ile garanti edildi; kullanıcı menüsündeki avatar/durum erişimleri korumalı hale getirildi.
- `9c9e23a`: çıkış Observable'ı gerçekten çalıştırılıyor; klinik ve yönetim Supabase oturumları ile Odivon yerel kayıtları temizleniyor.
- `162a254`: giriş sırasında yerleşim kullanıcı bilgisi başlatılıyor.
- `0e56a3a`: klinik kurulum akışı Supabase plan sınırlarını dikkate alıyor.
- Canlı çıkıştan sonra `/dashboards` isteğinin `/auth/sign-in?redirectURL=...` adresine yönlendiği doğrulandı.
- Son canlı pakette dashboard açıldı; `avatar` ve TinyMCE konsol hataları görülmedi.
- `npm run build` başarılıdır ve çalışma ağacı temizdir.

## Önemli dosyalar

- `src/app/core/supabase/`: yönetim/klinik istemcileri ve bağlantı çözümleme
- `src/app/core/auth/auth.service.ts`: giriş ve çıkış akışı
- `src/app/modules/auth/registration/`: üyelik ve başvuru durumu
- `supabase/management/`: yönetim migration ve Edge Functions
- `supabase/clinic/`: standart klinik migration, RLS ve fonksiyonlar
- `scripts/deploy-management.mjs`: yönetim dağıtımı
- `scripts/configure.mjs`: public çalışma zamanı config üretimi
- `docs/implementation-status.md`: ayrıntılı uygulama durumu
- `docs/pilot-acceptance.md`: pilot kabul senaryoları
- `docs/feature-inventory.md`: taşınan ekran ve işlemler

## Sıradaki işler

1. Canlı temel ekran smoke testini genişletin: müşteriler, hastalar, randevu, muayene, satış, alış, ürün/stok, kasa, laboratuvar, pet oteli, dosyalar, raporlar, SMS ve yönetim.
2. Her ekranda yalnız açılışı değil oluşturma–güncelleme–silme/iptal ve yeniden yükleme sonrası kalıcılığı doğrulayın. Test verilerini pilot verisinden açıkça ayırın.
3. DevExtreme `W0004 material.blue.light.compact` tema yükleme uyarısını inceleyin. CSS canlıda `200 text/css` dönüyor; uyarının çift tema yüklemesi veya yaklaşık 1 MB dosya süresiyle ilişkisini ölçün.
4. Satış, KDV, indirim, tahsilat, stok hareketi, iptal ve idempotency RPC senaryolarını canlı olmayan klinik ortamında uçtan uca test edin.
5. RLS için iki klinik gerektiren izolasyon testini ücretli Supabase kapasitesi veya geçici ikinci test ortamı açılınca tamamlayın.
6. SMTP davet/şifre belirleme akışını gerçek teslimatla; Mutlucell akışını test sağlayıcısıyla doğrulayın.
7. Yedekleme ve geri yükleme prosedürünü gerçek klinik projesinde prova edin.
8. Angular 15 + Node 26 uyumsuzluk riskini ayrı yükseltme işi olarak planlayın; mevcut üründe büyük Angular yükseltmesini işlev testleri tamamlanmadan başlatmayın.

## Çalışma komutları

```powershell
cd C:\Users\dogan\Documents\Private\Project\Odivon.Vet
git status --short
npm ci
npm test
npm run build
npm run check:edge
```

Yönetim/Supabase dağıtımından önce `.env.deploy` varlığını doğrulayın, içeriğini terminal çıktısına basmayın. Cloudflare Git bağlantısı `master` commitlerini otomatik derler; hazırlık aşaması birkaç dakika sürebilir. Canlı sürümü yalnız commit gönderilmiş olmasıyla değil, `https://vet.odivon.com` HTML'i ve temiz tarayıcı konsoluyla doğrulayın.

## Yeni sohbet için kısa başlangıç istemi

> `C:\Users\dogan\Documents\Private\Project\Odivon.Vet\docs\NEXT-CHAT-HANDOFF.md` dosyasını oku ve Odivon Vet geliştirmesine “Sıradaki işler” listesinin ilk tamamlanmamış maddesinden devam et. Gizli değerleri çıktı verme. Her düzeltmeden sonra uygun testi ve production build'i çalıştır, commit edip `master` dalına gönder ve canlı sürümü doğrula.
