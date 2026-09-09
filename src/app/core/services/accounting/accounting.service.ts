import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { AppointmentDto } from "app/modules/admin/appointment/appointmentcalendar/models/appointmentDto";
import { CreateAppointmentCommand } from "app/modules/admin/appointment/appointmentcalendar/models/createAppointmentCommand";
import { UpdateAppointmentCommand } from "app/modules/admin/customer/customerdetails/dialogs/appointment-history/models/UpdateAppointmentCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AccountingService {
    constructor(private _httpService: HttpService) { }

    isSaleProductControl(model : any) : Observable<any>{    
        return this._httpService.post(endPoints.accounting.isSaleProductControl, model);
    }
}