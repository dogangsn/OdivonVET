import {Injectable} from '@angular/core';
import {defer, Observable} from 'rxjs';
import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
import {UserService} from 'app/core/user/user.service';
@Injectable()
export class AuthService {
 constructor(private clinics:ClinicClientService, private users:UserService){}
 get accessToken():string{return localStorage.getItem('accessToken')||'';}
 set accessToken(value:string){localStorage.setItem('accessToken',value);}
 signIn(credentials:{email:string;password:string;rememberMe?:boolean}):Observable<any>{return defer(async()=>{
  let client;
  try{client=await this.clinics.connectForEmail(credentials.email);}
  catch(directoryError){
   // A management account is created before its isolated clinic project exists.
   // Authenticate it privately so the user can see the application state without
   // exposing account existence through the public clinic directory.
   const management=await this.clinics.management();
   const {data,error}=await management.auth.signInWithPassword({email:credentials.email.trim(),password:credentials.password});
   if(!error&&data.user)return {applicationPending:true};
   throw directoryError;
  }
  const {data,error}=await client.auth.signInWithPassword({email:credentials.email,password:credentials.password});
  if(error)throw error;
  try{const p=await this.clinics.loadProfile();this.users.user={id:p.id,name:p.name,email:p.email};return data;}
  catch(error){await client.auth.signOut();throw error;}
 });}
 check():Observable<boolean>{return defer(async()=>{try{const p=await this.clinics.loadProfile();this.users.user={id:p.id,name:p.name,email:p.email};return true;}catch{return false;}});}
 isLoggedIn():boolean{return !!this.accessToken;}
 signInUsingToken():Observable<boolean>{return this.check();}
 signOut():Observable<boolean>{return defer(async()=>{const client=await this.clinics.client();await client.removeAllChannels();const {error}=await client.auth.signOut();if(error)throw error;for(const k of ['accessToken','actions','navigation','odivon-profile'])localStorage.removeItem(k);return true;});}
 forgotPassword(email:string):Observable<any>{return defer(async()=>{const c=await this.clinics.client();const {data,error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/auth/callback?clinic='+encodeURIComponent(this.clinics.code)});if(error)throw error;return data;});}
 resetPassword(password:string):Observable<any>{return defer(async()=>{const c=await this.clinics.client();const {data,error}=await c.auth.updateUser({password});if(error)throw error;return data;});}
 unlockSession(credentials:{email:string;password:string}):Observable<any>{return this.signIn(credentials);}
 signUp(user:any):Observable<any>{return defer(async()=>{const c=await this.clinics.management();const {data,error}=await c.auth.signUp({email:user.email,password:user.password,options:{emailRedirectTo:location.origin+'/auth/registration',captchaToken:user.captchaToken,data:{clinic_name:user.company,owner_name:user.name}}});if(error)throw error;return data;});}
}
