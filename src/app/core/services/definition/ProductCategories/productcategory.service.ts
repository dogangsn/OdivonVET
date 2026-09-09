import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateProductCategoriesCommand } from "app/modules/admin/definition/productcategory/models/CreateProductCategoriesCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ProductCategoryService {
    constructor(private _httpService: HttpService) { }

    getProductCategoryList() : Observable<any>{
        return this._httpService.getRequest(endPoints.productcategory.productcategoryList);
    }

    createProductCategory(model: CreateProductCategoriesCommand): Observable<any> {
        return this._httpService.post(endPoints.productcategory.createProductCategory, model);
    }

    updateProductCategory(model: any): Observable<any> {
        return this._httpService.post(endPoints.productcategory.updateProductCategory, model);
    }

    deleteProductCategory(model: any): Observable<any> {
        return this._httpService.post(endPoints.productcategory.deleteProductCategory, model);
    }
}