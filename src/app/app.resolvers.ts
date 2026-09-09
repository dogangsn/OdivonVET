import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';import {Observable} from 'rxjs';
import {NavigationService} from 'app/core/navigation/navigation.service';
@Injectable({providedIn:'root'}) export class InitialDataResolver implements Resolve<any>{constructor(private nav:NavigationService){}resolve():Observable<any>{return this.nav.get();}}
