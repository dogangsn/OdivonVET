import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateSaleBuyCommand } from "app/modules/admin/retail/model/CreateSaleBuyCommand";
import { CreateStoreCommand } from "app/modules/admin/store/models/CreateStoreCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class RolsService {
    constructor(private _httpService: HttpService) { }

    
    getNavigation(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.getNavigation, model);
    }

    getRolSettings() : Observable<any> {
        return this._httpService.getRequest(endPoints.settings.getRolsSettings);
    }

    getUserRolSettings() : Observable<any> {
        return this._httpService.getRequest(endPoints.settings.getUserRolsSettings);
    }

    getRoleSettingByIdQuery(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.getRoleSettingById, model);
    }

    updateRols(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.updateRols, model);
    }

    createRols(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.createRols, model);
    }

    deleteRols(model: any): Observable<any> {
        return this._httpService.post(endPoints.settings.deleteRols, model);
    }
}