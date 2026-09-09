import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ProductDescriptionService {
    constructor(private _httpService: HttpService) { }

    GetProductDescriptionList() : Observable<any>{
        return this._httpService.getRequest(endPoints.productdescription.productdescriptionList);
    }

    createProductDescription(model:  any): Observable<any> {
        return this._httpService.post(endPoints.productdescription.createProductDescriptions, model);
    }

    deleteProductDescription(model: any): Observable<any> {
        return this._httpService.post(endPoints.productdescription.deleteProductDescriptions, model);
    }

    updateProductDescription(model: any): Observable<any> {
        return this._httpService.post(endPoints.productdescription.updateProductDescriptions, model);
    }

    getProductDescriptionFilters(model: any) : Observable<any> {
        return this._httpService.post(endPoints.productdescription.productDescriptionFilters,model);
    }

    productMovementList(model: any) : Observable<any> {
        return this._httpService.post(endPoints.productdescription.productMovementList,model);
    }

    updateProductActive(model: any) : Observable<any> {
        return this._httpService.post(endPoints.productdescription.updateProductActive,model);
    }

}