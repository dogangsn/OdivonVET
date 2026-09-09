import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { BehaviorSubject, filter, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor } from 'app/modules/admin/demands/demand1/models/demandProductsListDto';
// import { CreateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/CreateCasingDefinitionCommand";
// import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
// import { UpdateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/UpdateCasingDefinitionCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";
import { parametersListDto } from "app/modules/admin/settings/parameters/models/parametersListDto";
import { UpdateParametersCommand } from "app/modules/admin/settings/parameters/models/UpdateParametersCommand";

import { UpdateDemandProductsCommand } from "app/modules/admin/demands/demand1/models/UpdateDemandProductsCommand";
import { CreateSmsParametersCommand } from "app/modules/admin/settings/smsparameters/models/createSmsParametersCommand";
import { UpdateSmsParametersCommand } from "app/modules/admin/settings/smsparameters/models/updateSmsParametersCommand";
@Injectable({
    providedIn: 'root'
})

export class ParametersService {
    
    constructor(private _httpService: HttpService) { }
    getparameterList() : Observable<any>{
        return this._httpService.getRequest(endPoints.parameters.parametersList);
    }

    updateParameters(model: UpdateParametersCommand): Observable<any> {
        return this._httpService.post(endPoints.parameters.updateparameters, model);
    }

    createSmsParameters(model: CreateSmsParametersCommand): Observable<any> {
        return this._httpService.post(endPoints.parameters.createsmsparameters, model);
    }

    updateSmsParameters(model: UpdateSmsParametersCommand): Observable<any> {
        return this._httpService.post(endPoints.parameters.updatesmsparameters, model);
    }
    

    getSmsParametersIdBy(model: any): Observable<any> {
        return this._httpService.post(endPoints.parameters.getSmsParametersIdBy, model);
    }

    getSmsParametersList() : Observable<any>{
        return this._httpService.getRequest(endPoints.parameters.getSmsParametersList);
    }


}
