import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateTaxisCommand } from "app/modules/admin/definition/taxes/models/CreateTaxisCommand";
import { UpdateTaxisCommand } from "app/modules/admin/definition/taxes/models/UpdateTaxisCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TaxisService {
    
    constructor(private _httpService: HttpService) { }

    getTaxisList() : Observable<any>{
        return this._httpService.getRequest(endPoints.taxis.getTaxisList);
    }

    createTaxis(model: CreateTaxisCommand): Observable<any> {
        return this._httpService.post(endPoints.taxis.createTaxis, model);
    }

    deleteTaxis(model: any): Observable<any> {
        return this._httpService.post(endPoints.taxis.deleteTaxis, model);
    }

    updateTaxis(model: UpdateTaxisCommand): Observable<any> {
        return this._httpService.post(endPoints.taxis.updateTaxis, model);
    }
}
