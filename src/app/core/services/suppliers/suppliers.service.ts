import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateSuppliersCommand } from "app/modules/admin/suppliers/models/CreateSuppliersCommand";
 import { DeleteSuppliersCommand } from "app/modules/admin/suppliers/models/DeleteSuppliersCommand";
 import { UpdateSuppliersCommand } from "app/modules/admin/suppliers/models/UpdateSuppliersCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SuppliersService {
    constructor(private _httpService: HttpService) { }

    getSuppliersList() : Observable<any>{
        return this._httpService.getRequest(endPoints.suppliers.suppliersList);
    }

    createSuppliers(model: CreateSuppliersCommand): Observable<any> {
        return this._httpService.post(endPoints.suppliers.Createsuppliers, model);
    }
    deleteSuppliers(id?: DeleteSuppliersCommand): Observable<any> {
        return this._httpService.post(endPoints.suppliers.Deletesuppliers, id);
    }
    updateSuppliers(model: UpdateSuppliersCommand): Observable<any> {
        return this._httpService.post(endPoints.suppliers.Updatesuppliers, model);
    }
}
