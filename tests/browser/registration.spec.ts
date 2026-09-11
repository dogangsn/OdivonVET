import {test,expect,Page} from '@playwright/test';
const user={id:'10000000-0000-0000-0000-000000000001',aud:'authenticated',role:'authenticated',email:'owner@example.test',email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{clinic_name:'Test Klinik',owner_name:'Test Owner'},created_at:new Date().toISOString()};
const jwt='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test-signature';
const application={id:'20000000-0000-0000-0000-000000000001',clinic_name:'Test Klinik',code:'vet-test',state:'waitlisted'};
async function setup(page:Page,options:{confirm?:boolean;missing?:boolean;rpcFail?:boolean;existing?:boolean}={}){
 const calls={signup:0,rpc:0};let stored=false;
 await page.route('**/assets/odivon-config.json',route=>route.fulfill(options.missing?{status:404,body:'missing'}:{json:{management:{url:'https://registration-test.supabase.co',publishableKey:'sb_publishable_test'},clinics:[]}}));
 await page.route('https://registration-test.supabase.co/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/auth/v1/settings')return route.fulfill({json:{disable_signup:false,external:{email:true},mailer_autoconfirm:!options.confirm}});
  if(path==='/auth/v1/signup'){
   calls.signup++;
   if(options.existing)return route.fulfill({status:422,json:{code:'user_already_exists',msg:'User already registered'}});
   await new Promise(resolve=>setTimeout(resolve,150));
   return route.fulfill({json:{user,access_token:jwt,refresh_token:'test-refresh-token',token_type:'bearer',expires_in:3600}});
  }
  if(path==='/auth/v1/user')return route.fulfill({json:user});
  if(path==='/rest/v1/rpc/register_clinic'){
   calls.rpc++;expect(route.request().postDataJSON()).toEqual({p_name:'Test Klinik',p_owner:'Test Owner'});
   if(options.rpcFail&&calls.rpc===1)return route.fulfill({status:503,json:{message:'unavailable'}});
   stored=true;return route.fulfill({json:application.id});
  }
  if(path==='/rest/v1/clinic_applications')return route.fulfill({json:stored?[application]:[]});
  return route.fulfill({status:500,json:{message:'Unexpected test request: '+path}});
 });
 await page.goto('/auth/registration');return calls;
}
async function fill(page:Page){await page.getByLabel('Klinik adı').fill('Test Klinik');await page.getByLabel('Ad soyad').fill('Test Owner');await page.getByLabel('E-posta adresi').fill('owner@example.test');await page.getByLabel('Parola',{exact:true}).fill('test-password-1234');}
test('missing configuration and confirmation requirement block signup with visible feedback',async({page})=>{
 let calls=await setup(page,{missing:true});await expect(page.getByRole('alert')).toContainText('bağlanılamadı');await expect(page.getByRole('button',{name:'Üye ol',exact:true})).toBeEnabled();expect(calls.signup).toBe(0);
 await page.unrouteAll({behavior:'wait'});calls=await setup(page,{confirm:true});await expect(page.getByRole('alert')).toContainText('henüz kullanıma açılmadı');await fill(page);await expect(page.getByText('18/12+')).toBeVisible();await page.getByRole('button',{name:'Üye ol',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Confirm email');expect(calls.signup).toBe(0);
});
test('validation, password visibility and successful membership produce one signup without a clinic-code field',async({page})=>{
 const calls=await setup(page);await expect(page.getByLabel('Klinik kodu')).toHaveCount(0);
 await page.getByRole('button',{name:'Üye ol',exact:true}).click();expect(calls.signup).toBe(0);await expect(page.getByText('Geçerli bir e-posta adresi girin.')).toBeVisible();
 await fill(page);await page.getByRole('button',{name:'Parolayı göster'}).click();await expect(page.getByLabel('Parola',{exact:true})).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Üye ol',exact:true}).click();await expect(page.getByRole('button',{name:'İşleminiz tamamlanıyor…'})).toBeDisabled();
 await expect(page.getByRole('heading',{name:'Başvurunuz oluşturuldu.'})).toBeVisible();expect(calls.signup).toBe(1);expect(calls.rpc).toBe(1);
});
test('partial registration retries the application without creating another account',async({page})=>{
 const calls=await setup(page,{rpcFail:true});await fill(page);await page.getByRole('button',{name:'Üye ol',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Hesabınız oluşturuldu');
 await page.getByRole('button',{name:'Başvuruyu tamamla',exact:true}).click();await expect(page.getByRole('heading',{name:'Başvurunuz oluşturuldu.'})).toBeVisible();expect(calls.signup).toBe(1);expect(calls.rpc).toBe(2);
});
test('existing email stays on form and does not claim success',async({page})=>{
 const calls=await setup(page,{existing:true});await fill(page);await page.getByRole('button',{name:'Üye ol',exact:true}).click();await expect(page.getByRole('alert')).toContainText('zaten var');expect(calls.rpc).toBe(0);
});
test('sign in resolves the clinic from email without asking for a code',async({page})=>{
 let directoryBody:any;
 await page.route('**/assets/odivon-config.json',route=>route.fulfill({json:{management:{url:'https://registration-test.supabase.co',publishableKey:'sb_publishable_test'},clinics:[]}}));
 await page.route('https://registration-test.supabase.co/functions/v1/clinic-directory',route=>{
  directoryBody=route.request().postDataJSON();
  return route.fulfill({json:{code:'vet-test',url:'https://clinic-test.supabase.co',publishableKey:'sb_publishable_clinic'}});
 });
 await page.route('https://clinic-test.supabase.co/**',route=>route.fulfill({status:400,json:{message:'Invalid login credentials'}}));
 await page.goto('/auth/sign-in');
 await expect(page.getByLabel('Klinik kodu')).toHaveCount(0);
 await page.getByLabel('E-Posta').fill('OWNER@EXAMPLE.TEST');
 await page.getByLabel('Parola',{exact:true}).fill('wrong-password');
 await page.getByRole('button',{name:'Giriş Yap'}).click();
 await expect.poll(()=>directoryBody).toEqual({email:'owner@example.test'});
 await expect(page.getByText('Klinik hesabı bulunamadı veya e-posta/parola hatalı')).toBeVisible();
});
test('platform account sign in opens its pending clinic application',async({page})=>{
 await page.route('**/assets/odivon-config.json',route=>route.fulfill({json:{management:{url:'https://registration-test.supabase.co',publishableKey:'sb_publishable_test'},clinics:[]}}));
 await page.route('https://registration-test.supabase.co/**',route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/functions/v1/clinic-directory')return route.fulfill({status:404,json:{error:'Klinik bulunamadı'}});
  if(path==='/auth/v1/token')return route.fulfill({json:{user,access_token:jwt,refresh_token:'test-refresh-token',token_type:'bearer',expires_in:3600}});
  if(path==='/auth/v1/user')return route.fulfill({json:user});
  if(path==='/auth/v1/settings')return route.fulfill({json:{disable_signup:false,external:{email:true},mailer_autoconfirm:true}});
  if(path==='/rest/v1/clinic_applications')return route.fulfill({json:[application]});
  return route.fulfill({status:500,json:{message:'Unexpected test request: '+path}});
 });
 await page.goto('/auth/sign-in');
 await page.getByLabel('E-Posta').fill(user.email);
 await page.getByLabel('Parola',{exact:true}).fill('test-password-1234');
 await page.getByRole('button',{name:'Giriş Yap'}).click();
 await expect(page).toHaveURL(/\/auth\/registration$/);
 await expect(page.getByText('Klinik kurulumu henüz başlatılmadı. Bu hesapla klinik ekranlarına giriş yapılamaz.')).toBeVisible();
});
test('desktop and mobile branding fit the viewport',async({page})=>{
 await setup(page);await expect(page.getByRole('button',{name:'Üye ol',exact:true})).toBeEnabled();
 await expect(page.locator('.odivon-brand img')).toHaveCSS('width','40px');
 await expect.poll(()=>page.locator('.odivon-brand img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 await page.screenshot({path:'.local/registration-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await expect(page.locator('.odivon-story')).toBeHidden();await expect(page.locator('.odivon-mobile-brand')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'.local/registration-mobile-ready.png',fullPage:true});
 await page.goto('/auth/sign-in');await expect(page.getByRole('heading',{name:'Kaldığınız yerden devam edin.'})).toBeVisible();
 await expect(page.getByLabel('Klinik kodu')).toHaveCount(0);
 await expect(page.getByLabel('E-Posta')).toBeVisible();
 await expect(page.getByLabel('Klinik kodu')).toHaveCount(0);
 await expect(page.locator('.odivon-mobile-brand img')).toHaveCSS('width','36px');
 await expect.poll(()=>page.locator('.odivon-mobile-brand img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'.local/sign-in-mobile.png',fullPage:true});
});
