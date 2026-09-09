import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateUnitsCommand } from "app/modules/admin/definition/unitdefinition/models/CreateUnitsCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class UnitsService {
    constructor(private _httpService: HttpService) { }

    getUnitsList() : Observable<any>{
        return this._httpService.getRequest(endPoints.units.unitsList);
    }

    createUnits(model: CreateUnitsCommand): Observable<any> {
        return this._httpService.post(endPoints.units.createUnits, model);
    }

    updateUnits(model: any): Observable<any> {
        return this._httpService.post(endPoints.units.updateUnits, model);
    }

    deleteUnits(model: any): Observable<any> {
        return this._httpService.post(endPoints.units.deleteUnits, model);
    }


}