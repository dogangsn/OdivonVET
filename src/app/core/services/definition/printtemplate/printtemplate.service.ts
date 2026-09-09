import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateProductCategoriesCommand } from "app/modules/admin/definition/productcategory/models/CreateProductCategoriesCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class PrintTemplateService {
    constructor(private _httpService: HttpService) { }

    getPrintTemplateList(): Observable<any> {
        return this._httpService.getRequest(endPoints.printtemplate.getPrintTemplateList);
    }

    createPrintTemplate(model: any): Observable<any> {
        return this._httpService.post(endPoints.printtemplate.createPrintTemplate, model);
    }

    updatePrintTemplate(model: any): Observable<any> {
        return this._httpService.post(endPoints.printtemplate.updatePrintTemplate, model);
    }

    deletePrintTemplate(model: any): Observable<any> {
        return this._httpService.post(endPoints.printtemplate.deletePrintTemplate, model);
    }

    getPrintTemplateFilterByType(model: any): Observable<any> {
        return this._httpService.post(endPoints.printtemplate.getPrintTemplateFilterByType, model);
    }
}