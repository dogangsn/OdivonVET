import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateCustomerCommand } from "app/modules/admin/customer/models/CreateCustomerCommand";
import { CustomerDetailDto } from "app/modules/admin/customer/models/CustomerDetailDto";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    constructor(private _httpService: HttpService) { }

    multiAutoSendMessage(model: any): Observable<any> {
        return this._httpService.post(endPoints.message.multiAutoSendMessage, model);
    }
}