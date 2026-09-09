import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot,CanActivate,CanActivateChild,CanMatch,Router,RouterStateSnapshot,UrlTree} from '@angular/router';
import {Observable,map} from 'rxjs';
import {AuthService} from 'app/core/services/auth/auth.service';
import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Injectable({providedIn:'root'})
export class AuthGuard implements CanActivate,CanActivateChild,CanMatch {
 constructor(private auth:AuthService,private router:Router,private clinics:ClinicClientService){}
 canActivate(route:ActivatedRouteSnapshot,state:RouterStateSnapshot):Observable<boolean|UrlTree>{return this.check(state.url);}
 canActivateChild(route:ActivatedRouteSnapshot,state:RouterStateSnapshot):Observable<boolean|UrlTree>{return this.check(state.url);}
 canMatch():Observable<boolean|UrlTree>{return this.check('/dashboards');}
 private check(url:string):Observable<boolean|UrlTree>{return this.auth.check().pipe(map(ok=>{
  if(!ok)return this.router.createUrlTree(['/auth/sign-in'],{queryParams:{redirectURL:url}});
  if(!this.clinics.entitled && !/^\/(clinic-account|sign-out)(?:[/?#]|$)/.test(url))return this.router.createUrlTree(['/clinic-account']);
  return true;
 }));}
}
