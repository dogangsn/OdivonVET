# Yedekleme ve geri yükleme

Veritabanı ve dosyalar ayrı yedeklenir. Supabase veritabanı yedeği Storage nesnelerinin yalnızca metadata kayıtlarını içerir; dosya baytlarını içermez. Veritabanı yedeği için sağlayıcının [CLI yedekleme/geri yükleme](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) ve [yedek kapsamı](https://supabase.com/docs/guides/platform/backups) belgelerini kullanın.

Her klinik için kaynak proje kimliği, PostgreSQL sürümü, migration checksum listesi, veritabanı yedeği ve Storage arşivi aynı yedek envanterine kaydedilmelidir. Yönetim projesi ayrıca yedeklenir; klinik dosyası içermez. Operatör erişimiyle alınan SQL yedeği `private` sağlayıcı ayarları ve Auth kayıtları gibi gizli içerik barındırabilir. Yedekleri şifreli ve erişimi kısıtlı bir konumda saklayın; Git'e eklemeyin.

## Dosya arşivi

Yedekleme aracı `clinic_files` envanterindeki hazır, silinmiş fakat saklanan ve tamamlanmamış dosyaları tarar. Her mevcut dosya SHA-256 özetiyle saklanır. Henüz yüklenmemiş `pending` dosyalar manifestte ayrıca belirtilir. Bir hazır dosya indirilemiyorsa işlem başarısızdır; `manifest.json` oluşmaz. Tamamlanmamış arşivi başarılı yedek saymayın. Araç yedek klasörünü yeniden kullanmaz.

Operatör ortamında `ODIVON_ARCHIVE_URL` ve `ODIVON_ARCHIVE_SERVICE_KEY` değerlerini sağlayın. Anahtar çıktı ve manifest içine yazılmaz.

```powershell
node scripts/backup-storage.mjs backup backups/clinic-code/2026-09-09/storage
```

Yedek alırken klinik yazma işlemleri bakım penceresinde durdurulmalıdır. SQL yedeği ve dosya arşivi aynı bakım penceresinde alınır; aksi halde aralarında tutarlı bir anlık görüntü garantisi yoktur.

## Geri yükleme provası

1. Ayrı, boş bir yerel Supabase hedefi açın. Yedeğin PostgreSQL/Auth/Storage sürümlerini kontrol edin. Çalışan kliniğe geri yüklemeyin.
2. SQL yedeğini sağlayıcının yukarıdaki prosedürüyle geri yükleyin. Auth kullanıcıları ve `private` şema, uygulama verileri, politikalar ve migration geçmişi birlikte değerlendirilmelidir. Storage nesne metadata'sını dosya içeriği sanmayın.
3. `clinic-files` kovasının özel olduğunu doğrulayın. Operatör ortamını **hedef yerel projenin** URL ve service anahtarına geçirin.
4. Dosyaları yükleyin:

```powershell
node scripts/backup-storage.mjs restore-local backups/clinic-code/2026-09-09/storage
```

Araç önce bütün yerel checksum değerlerini ve hedef dosyaları inceler. Farklı içerikli bir hedef dosyanın üstüne yazmaz. Aynı içerikli dosyayı atlar; kesilen yükleme yeniden çalıştırılabilir. Her yeni yüklemeden sonra indirip checksum değerini tekrar doğrular. Bu komut yalnızca localhost hedeflerini kabul eder. Canlı geri yükleme ayrı operatör çalışmasıdır.

5. Tablo satır sayılarını, satış/tahsilat toplamlarını, stok bakiyesini, Auth kullanıcı sayısını ve dosya manifestini karşılaştırın. Klinik sahibiyle giriş, bir personel yetki reddi, hasta belgesi indirme ve süresi dolmuş sahibi dışa aktarma senaryolarını çalıştırın.
6. Yönetim dizini doğru klinik adresini göstermeli; Auth dönüş adresleri, Edge Functions, sırlar ve zamanlayıcılar hedef ortama göre tekrar kurulmalıdır. Deneme başlangıcını uzatmayın. E-posta/SMS provada test modunda kalmalıdır.

## Doğrulama kaydı

`tests/storage-archive.test.mjs` örnek baytların arşiv → geri yükleme → indirme eşitliğini, yeniden çalıştırmayı ve bozuk arşivde yazma yapılmamasını doğrular. Bu test bellek içi Storage adaptörü kullanır. Gerçek Supabase Storage ve tam SQL/Auth geri yükleme provası henüz çalıştırılmadı; Docker/Supabase ortamı gerektirir. Pilot kabul tutanağında kaynak/hedef kimliği, yedek zamanı, kayıp veri aralığı ve geri yükleme süresi kaydedilmeden canlı kullanıma geçilmemelidir.
