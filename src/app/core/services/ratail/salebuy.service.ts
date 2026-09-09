import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateSaleBuyCommand } from "app/modules/admin/retail/model/CreateSaleBuyCommand";
import { CreateStoreCommand } from "app/modules/admin/store/models/CreateStoreCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SaleBuyService {
    constructor(private _httpService: HttpService) { }

    getBuySaleList(model :any) : Observable<any>{
        return this._httpService.post(endPoints.saleBuy.saleBuyList, model);
    }

    getBuySaleFilterList(model: any) : Observable<any>{
        return this._httpService.post(endPoints.saleBuy.saleBuyFilter, model);
    }

    createSaleBuy(model:  CreateSaleBuyCommand): Observable<any> {
        return this._httpService.post(endPoints.saleBuy.createSaleBuy, model);
    }

    deletedSaleBuy(model: any): Observable<any> {
        return this._httpService.post(endPoints.saleBuy.deleteSaleBuy, model);
    }

    updateSaleBuy(model: any): Observable<any> {
        return this._httpService.post(endPoints.saleBuy.updateSaleBuy, model);
    }
}