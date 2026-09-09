import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateSaleBuyCommand } from "app/modules/admin/retail/model/CreateSaleBuyCommand";
import { CreateStoreCommand } from "app/modules/admin/store/models/CreateStoreCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TitleService {
    constructor(private _httpService: HttpService) { }

    getTitleList() : Observable<any> {
        return this._httpService.getRequest(endPoints.title.titleDefinationList);
    }

    updateTitle(model: any): Observable<any> {
        return this._httpService.post(endPoints.title.updatetitle, model);
    }

    createTitle(model: any): Observable<any> {
        return this._httpService.post(endPoints.title.createtitle, model);
    }

    deleteTitle(model: any): Observable<any> {
        return this._httpService.post(endPoints.title.deleteTitle, model);
    }

 
}