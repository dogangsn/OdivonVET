import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateStockTrackingCommand } from "app/modules/admin/definition/productdescription/models/createStockTrackingCommand";
import { UpdateStockTrackingCommand } from "app/modules/admin/definition/productdescription/models/updateStockTrackingCommand";
import { CreateSmsTemplateCommand } from "app/modules/admin/definition/smstemplate/models/createSmsTemplateCommand";
import { UpdateSmsTemplateCommand } from "app/modules/admin/definition/smstemplate/models/updateSmsTemplateCommand";
import { CreateTaxisCommand } from "app/modules/admin/definition/taxes/models/CreateTaxisCommand";
import { UpdateTaxisCommand } from "app/modules/admin/definition/taxes/models/UpdateTaxisCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SmsTemplateService {
    
    constructor(private _httpService: HttpService) { }

    getSmsTemplate() : Observable<any>{
        return this._httpService.getRequest(endPoints.smstemplate.getSmsTemplate);
    }

    createSmsTemplate(model: CreateSmsTemplateCommand): Observable<any> {
        return this._httpService.post(endPoints.smstemplate.createSmsTemplate, model);
    }

    updateSmsTemplate(model: UpdateSmsTemplateCommand): Observable<any> {
        return this._httpService.post(endPoints.smstemplate.updateSmsTemplate, model);
    }

    deleteSmsTemplate(model: any): Observable<any> {
        return this._httpService.post(endPoints.smstemplate.deleteSmsTemplate, model);
    }

    getSmsTemplateIdBy(model: any): Observable<any> {
        return this._httpService.post(endPoints.smstemplate.getSmsTemplateIdBy, model);
    }
 
}
