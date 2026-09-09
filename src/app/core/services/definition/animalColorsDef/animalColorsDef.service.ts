import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateAnimalColorsDefCommand } from "app/modules/admin/customer/models/CreateAnimalColorsDefCommand";
import { CreateCustomerGroupCommand } from "app/modules/admin/definition/customergroup/models/CreateCustomerGroupCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AnimalColorsDefService {
    constructor(private _httpService: HttpService) { }

  
    getAnimalColorsDefList() : Observable<any> {
        return this._httpService.getRequest(endPoints.animalColorsDef.animalColorsDefList);
    }

    createCreateAnimalColorsDef(model: CreateAnimalColorsDefCommand): Observable<any> {
        return this._httpService.post(endPoints.animalColorsDef.CreateAnimalColorsDef, model);
    }



}