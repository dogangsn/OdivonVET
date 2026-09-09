import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateCustomerGroupCommand } from "app/modules/admin/definition/customergroup/models/CreateCustomerGroupCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CustomerGroupService {
    constructor(private _httpService: HttpService) { }

    getcustomerGroupList() : Observable<any>{
        return this._httpService.getRequest(endPoints.customergroup.customerGroupList);
    }

    createcustomerGroupDef(model: CreateCustomerGroupCommand): Observable<any> {
        return this._httpService.post(endPoints.customergroup.createCustomerGroupDef, model);
    }

    updatecustomerGroupDef(model: any): Observable<any> {
        return this._httpService.post(endPoints.customergroup.updateCustomerGroupDef, model);
    }

    deletedcustomerGroupDef(model: any): Observable<any> {
        return this._httpService.post(endPoints.customergroup.deleteCustomerGroupDef, model);
    }




}