# Cloudflare Pages yayını

Cloudflare Pages projesi `dogangsn/OdivonVET` deposunun `master` dalına bağlanır.

- Project name: `odivon-vet`
- Production branch: `master`
- Build command: `npm ci && npm run build`
- Build output: `dist/odivon-vet`
- Node.js: `.nvmrc` içindeki sürüm

Production ve Preview ortamlarına `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ve `ODIVON_TURNSTILE_SITE_KEY` tanımlanır. Bunlar public istemci değerleridir. Üç değerden biri eksikse production derlemesi durur. Supabase Management token, service-role, SMTP parolası ve Turnstile secret Cloudflare Pages değişkenlerine eklenmez.

Production custom domain `vet.odivon.com` olarak bağlanır. Turnstile widget izinli alan adlarında `vet.odivon.com` ve gerekli önizleme alan adı bulunmalıdır. Supabase Auth Site URL ve redirect listesi de aynı production adresini kullanır.

`_redirects` Angular yollarını `index.html` dosyasına taşır. `_headers`, runtime Supabase config için `no-store`, hash içeren JS/CSS için uzun immutable cache uygular. Yayından sonra `npm run verify:live` ile config, Auth, tablo ve dizin işlevi kontrol edilir.

Cloudflare hesabında terminal oturumu varsa doğrudan yayın `npm run deploy:cloudflare` ile yapılabilir. Git bağlantılı kalıcı yayın için Pages dashboard ayarları yukarıdaki değerlerle kaydedilir.
