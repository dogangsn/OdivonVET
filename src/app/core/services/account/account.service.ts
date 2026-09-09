import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/core/auth/Http.service';
import { ActionResponse } from 'app/core/models/bases/ActionResponse';
import { endPoints } from 'environments/endPoints';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    constructor(private httpService: HttpService) { }

    createaccount(model: any): Observable<any> {
        return this.httpService.post(endPoints.account.createaccount, model);
    }

    complateactivation(model: any): Observable<any> {
        return this.httpService.post(endPoints.account.complateactivation, model);
    }

    refreshactivation(model: any): Observable<any> {
        return this.httpService.post(endPoints.account.refreshactivation, model);
    }
}
