from pathlib import Path
root=Path(__file__).resolve().parents[1]
def put(path,text): (root/path).write_text(text,encoding='utf-8')
put('src/app/core/services/auth/auth.service.ts', '''import {Injectable} from '@angular/core';
import {defer, Observable} from 'rxjs';
import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
import {UserService} from 'app/core/user/user.service';
@Injectable()
export class AuthService {
 constructor(private clinics:ClinicClientService, private users:UserService){}
 get accessToken():string{return localStorage.getItem('accessToken')||'';}
 set accessToken(value:string){localStorage.setItem('accessToken',value);}
 signIn(credentials:{email:string;password:string;rememberMe?:boolean;clinicCode?:string}):Observable<any>{return defer(async()=>{
  const client=await this.clinics.connect(credentials.clinicCode||localStorage.getItem('odivon-clinic-code'));
  const {data,error}=await client.auth.signInWithPassword({email:credentials.email,password:credentials.password});
  if(error)throw error;
  try{const p=await this.clinics.loadProfile();this.users.user={id:p.id,name:p.name,email:p.email};return data;}
  catch(error){await client.auth.signOut();throw error;}
 });}
 check():Observable<boolean>{return defer(async()=>{try{const p=await this.clinics.loadProfile();this.users.user={id:p.id,name:p.name,email:p.email};return true;}catch{return false;}});}
 isLoggedIn():boolean{return !!this.accessToken;}
 signInUsingToken():Observable<boolean>{return this.check();}
 signOut():Observable<boolean>{return defer(async()=>{const client=await this.clinics.client();await client.removeAllChannels();const {error}=await client.auth.signOut();if(error)throw error;for(const k of ['accessToken','actions','navigation','odivon-profile'])localStorage.removeItem(k);return true;});}
 forgotPassword(email:string):Observable<any>{return defer(async()=>{const c=await this.clinics.client();const {data,error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/auth/reset-password?clinic='+encodeURIComponent(this.clinics.code)});if(error)throw error;return data;});}
 resetPassword(password:string):Observable<any>{return defer(async()=>{const c=await this.clinics.client();const {data,error}=await c.auth.updateUser({password});if(error)throw error;return data;});}
 unlockSession(credentials:{email:string;password:string}):Observable<any>{return this.signIn(credentials);}
 signUp(user:any):Observable<any>{return defer(async()=>{const c=await this.clinics.management();const {data,error}=await c.auth.signUp({email:user.email,password:user.password,options:{emailRedirectTo:location.origin+'/auth/registration',captchaToken:user.captchaToken,data:{clinic_name:user.company,owner_name:user.name}}});if(error)throw error;return data;});}
}
''')
put('src/app/core/auth/auth.interceptor.ts', '''import {Injectable} from '@angular/core';
import {HttpEvent,HttpHandler,HttpInterceptor,HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
 // Supabase scopes credentials to its own project. Do not attach clinic tokens globally.
 intercept(req:HttpRequest<unknown>,next:HttpHandler):Observable<HttpEvent<unknown>>{return next.handle(req);}
}
''')
put('src/app/core/auth/guards/auth.guard.ts', '''import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot,CanActivate,CanActivateChild,CanMatch,Router,RouterStateSnapshot,UrlTree} from '@angular/router';
import {Observable,map} from 'rxjs';
import {AuthService} from 'app/core/services/auth/auth.service';
@Injectable({providedIn:'root'})
export class AuthGuard implements CanActivate,CanActivateChild,CanMatch {
 constructor(private auth:AuthService,private router:Router){}
 canActivate(route:ActivatedRouteSnapshot,state:RouterStateSnapshot):Observable<boolean|UrlTree>{return this.check(state.url);}
 canActivateChild(route:ActivatedRouteSnapshot,state:RouterStateSnapshot):Observable<boolean|UrlTree>{return this.check(state.url);}
 canMatch():Observable<boolean|UrlTree>{return this.check('/dashboards');}
 private check(url:string):Observable<boolean|UrlTree>{return this.auth.check().pipe(map(ok=>ok||this.router.createUrlTree(['/auth/sign-in'],{queryParams:{redirectURL:url}})));}
}
''')
p=root/'src/app/modules/auth/sign-in/sign-in.component.ts';s=p.read_text();s=s.replace('email     :', "clinicCode: [localStorage.getItem('odivon-clinic-code') || '', Validators.required],\n            email     :")
s=s.replace("message: 'Yanlış e-posta veya şifre'", "message: response?.message || 'Giriş başarısız'")
s=s.replace("this._router.navigateByUrl(redirectURL);", "this._router.navigateByUrl(redirectURL.startsWith('/') && !redirectURL.startsWith('//') ? redirectURL : '/dashboards');")
p.write_text(s,encoding='utf-8')
p=root/'src/app/modules/auth/sign-in/sign-in.component.html';s=p.read_text().replace('<!-- Email field -->', '''<mat-form-field class="w-full"><mat-label>Klinik kodu</mat-label><input matInput formControlName="clinicCode" autocomplete="organization"><mat-error>Klinik kodu zorunlu</mat-error></mat-form-field>
                <!-- Email field -->''').replace("['/forgot-password']","['/auth/forgot-password']")
p.write_text(s,encoding='utf-8')
