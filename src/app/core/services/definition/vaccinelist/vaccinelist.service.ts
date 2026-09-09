import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateUnitsCommand } from "app/modules/admin/definition/unitdefinition/models/CreateUnitsCommand";
import { CreateVaccineCommand } from "app/modules/admin/definition/vaccinelist/models/createVaccineCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class VaccineService {
    constructor(private _httpService: HttpService) { }

    getVaccineList(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccine.vaccineList, model);
    }

    createVaccine(model: CreateVaccineCommand): Observable<any> {
        return this._httpService.post(endPoints.vaccine.createVaccine, model);
    }

    updateVaccine(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccine.updateVaccine, model);
    }

    deleteVaccine(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccine.deleteVaccine, model);
    }


}