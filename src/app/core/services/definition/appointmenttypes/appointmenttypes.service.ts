import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateAnimalColorsDefCommand } from "app/modules/admin/customer/models/CreateAnimalColorsDefCommand";
import { CreateAppointmentTypesCommand } from "app/modules/admin/definition/appointmenttypes/models/createAppointmentTypesCommand";
import { UpdateAppointmentTypesCommand } from "app/modules/admin/definition/appointmenttypes/models/updateAppointmentTypesCommand";
import { CreateCustomerGroupCommand } from "app/modules/admin/definition/customergroup/models/CreateCustomerGroupCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AppointmentTypeservice {
    
    
    constructor(private _httpService: HttpService) { }

    getAppointmentTypes() : Observable<any>{
        return this._httpService.getRequest(endPoints.appointmenttypes.getAppointmentTypes);
    }

    createAppointmentTypes(model: CreateAppointmentTypesCommand): Observable<any> {
        return this._httpService.post(endPoints.appointmenttypes.createAppointmentTypes, model);
    }

    deleteAppointmentTypes(model: any): Observable<any> {
        return this._httpService.post(endPoints.appointmenttypes.deleteAppointmentTypes, model);
    }

    updateAppointmentTypes(model: UpdateAppointmentTypesCommand): Observable<any> {
        return this._httpService.post(endPoints.appointmenttypes.updateAppointmentTypes, model);
    }


}
