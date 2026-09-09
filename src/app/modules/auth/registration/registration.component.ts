import {Component,OnInit,OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Component({selector:'app-registration',standalone:true,
 imports:[CommonModule,ReactiveFormsModule,RouterModule,MatFormFieldModule,MatInputModule,MatButtonModule],
 templateUrl:'./registration.component.html',styleUrls:['./registration.component.scss']})
export class RegistrationComponent implements OnInit,OnDestroy {
 form=this.fb.group({name:['',[Validators.required,Validators.minLength(2),Validators.maxLength(120)]],owner:['',[Validators.required,Validators.minLength(2),Validators.maxLength(120)]],email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(12)]]});
 busy=false;loading=true;ready=false;hasAccount=false;showPassword=false;message='';application:any;
 captchaToken='';private widget:any;private timer:any;private destroyed=false;
 constructor(private fb:FormBuilder,private clinics:ClinicClientService){}
 ngOnInit(){void this.initialize();}
 ngOnDestroy(){this.destroyed=true;clearTimeout(this.timer);if(this.widget!==undefined)(window as any).turnstile?.remove(this.widget);}
 async initialize(){
  this.loading=true;this.ready=false;this.message='';
  try {
   const client=await this.clinics.management();
   const {data:{session},error}=await client.auth.getSession();if(error)throw error;
   if(session){const result=await client.auth.getUser();if(result.error)throw result.error;this.restoreAccount(result.data.user);await this.fetchApplication();}
   const config=await this.clinics.config();
   if(!this.hasAccount){
    const response=await fetch(config.management.url+'/auth/v1/settings',{headers:{apikey:config.management.publishableKey}});
    if(!response.ok)throw new Error('settings');
    const settings=await response.json();
    if(settings.disable_signup||!settings.external?.email||!settings.mailer_autoconfirm){
     this.message='Üyelik hizmeti henüz kullanıma açılmadı. Lütfen daha sonra tekrar deneyin.';
     return;
    }
   }
   if(!this.hasAccount && config.turnstileSiteKey)await this.loadCaptcha(config.turnstileSiteKey);
   this.ready=true;
  }catch{this.message='Kayıt hizmetine bağlanılamadı. Lütfen yeniden deneyin.';}
  finally{this.loading=false;}
 }
 private restoreAccount(user:any){
  this.hasAccount=true;const m=user.user_metadata||{};
  this.form.patchValue({name:m.clinic_name||this.form.value.name,owner:m.owner_name||this.form.value.owner,email:user.email,password:''});
  this.form.controls.email.disable();this.form.controls.password.disable();
 }
 async submit(){
  if(this.busy||!this.ready)return;
  this.form.patchValue({name:(this.form.value.name||'').trim(),owner:(this.form.value.owner||'').trim()});
  this.form.markAllAsTouched();if(this.form.invalid)return;
  this.busy=true;this.message='';
  try{
   const client=await this.clinics.management();
   if(!this.hasAccount){
    const config=await this.clinics.config();
    if(config.turnstileSiteKey&&!this.captchaToken){this.message='Lütfen güvenlik doğrulamasını tamamlayın.';return;}
    const value=this.form.getRawValue();
    const {data,error}=await client.auth.signUp({email:value.email.trim(),password:value.password,options:{captchaToken:this.captchaToken||undefined,data:{clinic_name:value.name,owner_name:value.owner}}});
    if(error)throw error;
    if(!data.session||!data.user){this.message='Hesap oturumu açılamadı. Mevcut hesabınız varsa giriş yapın; kayıt hizmetinin doğrudan üyelik ayarını kontrol etmesi gerekebilir.';return;}
    this.restoreAccount(data.user);
   }
   const {error}=await client.rpc('register_clinic',{p_name:this.form.value.name,p_owner:this.form.value.owner});
   if(error)throw error;
   await this.fetchApplication();
  }catch(e){this.message=this.errorMessage(e);}
  finally{this.busy=false;if(this.widget!==undefined){(window as any).turnstile?.reset(this.widget);this.captchaToken='';}}
 }
 errorMessage(e:any):string{
  if(e?.code==='user_already_exists'||/already registered/i.test(e?.message||''))return 'Bu e-posta ile bir hesap zaten var. Giriş yaparak devam edin.';
  if(e?.status===429)return 'Kayıt hizmeti şu anda yoğun. Lütfen daha sonra tekrar deneyin.';
  if(this.hasAccount)return 'Hesabınız oluşturuldu ancak klinik başvurusu tamamlanamadı. Bilgilerinizi kontrol edip “Başvuruyu tamamla” ile tekrar deneyin.';
  return 'Üyelik tamamlanamadı. E-posta ve parolanızı kontrol edip yeniden deneyin.';
 }
 async resume(){
  if(this.busy||!this.ready)return;const value=this.form.getRawValue();
  if(!value.email||!value.password){this.message='Devam etmek için e-posta ve parolanızı girin.';return;}
  this.busy=true;this.message='';
  try{const client=await this.clinics.management();const {data,error}=await client.auth.signInWithPassword({email:value.email.trim(),password:value.password});if(error)throw error;this.restoreAccount(data.user);await this.fetchApplication();}
  catch{this.message='Hesaba giriş yapılamadı. E-posta ve parolanızı kontrol edin.';}finally{this.busy=false;}
 }
 async refresh(){if(this.busy)return;this.busy=true;this.message='';try{await this.fetchApplication();}catch{this.message='Kurulum durumu alınamadı. Yeniden deneyin.';}finally{this.busy=false;}}
 private async fetchApplication(){
  const {data,error}=await (await this.clinics.management()).from('clinic_applications').select('id,clinic_name,code,state,trial_ends_at,paid,safe_error').maybeSingle();if(error)throw error;
  this.application=data;clearTimeout(this.timer);
  if(data&&!['ready','attention','waitlisted'].includes(data.state)&&!this.destroyed)this.timer=setTimeout(()=>void this.refresh(),10000);
 }
 async loadCaptcha(siteKey:string){
  const w=window as any;
  if(!w.turnstile)await new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=()=>resolve();script.onerror=()=>reject(new Error('captcha'));document.head.appendChild(script);});
  if(this.destroyed)return;
  this.widget=w.turnstile.render('#registration-captcha',{sitekey:siteKey,callback:(token:string)=>this.captchaToken=token,'expired-callback':()=>this.captchaToken=''});
 }
 stateLabel(state:string){return ({waitlisted:'Başvurunuz alındı. Kapasite açıldığında kliniğiniz hazırlanacak.',queued:'Kliniğiniz kurulum sırasında.',creating:'Kliniğiniz hazırlanıyor.',waiting:'Kliniğiniz hazırlanıyor.',schema:'Klinik veritabanınız hazırlanıyor.',functions:'Klinik hizmetleriniz hazırlanıyor.',owner:'Klinik hesabınız hazırlanıyor.',ready:'Kliniğiniz hazır. Klinik hesabınızı oluşturmak için davet e-postanızı açın.',attention:'Kurulumun tamamlanması için Odivon ekibi başvurunuzu inceleyecek.'} as any)[state]||'Başvurunuz işleniyor.';}
}
