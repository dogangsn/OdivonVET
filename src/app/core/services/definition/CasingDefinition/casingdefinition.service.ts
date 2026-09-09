import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/CreateCasingDefinitionCommand";
import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
import { UpdateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/UpdateCasingDefinitionCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CasingDefinitionService {
    constructor(private _httpService: HttpService) { }

    getCasingDefinitionList() : Observable<any>{
        return this._httpService.getRequest(endPoints.casedefinition.casedefinitionList);
    }

    createCasingDefinition(model: CreateCasingDefinitionCommand): Observable<any> {
        return this._httpService.post(endPoints.casedefinition.Createcasedefinition, model);
    }
    deleteCasingDefinition(id?: DeleteCasingDefinitionCommand): Observable<any> {
        return this._httpService.post(endPoints.casedefinition.Deletecasedefinition, id);
    }
    updateCasingDefinition(model: UpdateCasingDefinitionCommand): Observable<any> {
        return this._httpService.post(endPoints.casedefinition.Updatecasedefinition, model);
    }
}
