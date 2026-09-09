import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateSaleBuyCommand } from "app/modules/admin/retail/model/CreateSaleBuyCommand";
import { CreateStoreCommand } from "app/modules/admin/store/models/CreateStoreCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CompanyService {
    constructor(private _httpService: HttpService) { }

    
    getCompany() : Observable<any> {
        return this._httpService.getRequest(endPoints.settings.getCompany);
    }

    updateCompany(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.updateCompany, model);
    }

}