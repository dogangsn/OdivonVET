import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateCustomerGroupCommand } from "app/modules/admin/definition/customergroup/models/CreateCustomerGroupCommand";
import { CreatePaymentMethodsCommand } from "app/modules/admin/definition/paymentmethods/models/CreatePaymentMethodsCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class PaymentMethodservice {
    constructor(private _httpService: HttpService) { }

    getPaymentMethodsList() : Observable<any>{
        return this._httpService.getRequest(endPoints.paymentmethods.paymentmethodsList);
    }

    creatPaymentMethods(model: CreatePaymentMethodsCommand): Observable<any> {
        return this._httpService.post(endPoints.paymentmethods.createPaymentMethods, model);
    }

    updatePaymentMethods(model: any): Observable<any> {
        return this._httpService.post(endPoints.paymentmethods.updatePaymentMethods, model);
    }

    deletedPaymentMethods(model: any): Observable<any> {
        return this._httpService.post(endPoints.paymentmethods.deletePaymentMethods, model);
    }




}