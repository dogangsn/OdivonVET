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

export class AppointmentService {
    constructor(private _httpService: HttpService) { }

    getAppointmentslist(model : any) : Observable<any>{    
        return this._httpService.post(endPoints.appointments.appointmensList, model);
    }

    createAppointment(model: CreateAppointmentCommand): Observable<any> {
        return this._httpService.post(endPoints.appointments.createappointment, model);
    }

    deleteAppointment(model: any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.deleteappointment, model);
    }

    updateAppointment(model: any): Observable<any> {
        return this._httpService.post(endPoints.appointments.updateappointment, model);
    }
    
    getUserTitleList(): Observable<any> {
        return this._httpService.getRequest(endPoints.appointments.getvetuserslist);
    }

    getAppointmentsByIdList(model: any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.appointmentsByIdList, model);
    }

    updatePaymentReceivedAppointment(model: any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.updatePaymentReceivedAppointment, model);
    }

    updateCompletedAppointment(model: any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.updateCompletedAppointment, model);
    }

    getAppointmentDailyList() : Observable<any>{    
        return this._httpService.getRequest(endPoints.appointments.getAppointmentDailyList);
    }

    updateAppointmentStatus(model : any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.updateAppointmentStatus, model)
    }

    getAppointmentListByPatientId(model: any) : Observable<any> {
        return this._httpService.post(endPoints.appointments.getAppointmentListByPatientId, model);
    }
 
    appointmentDateCheckControl(model: any): Observable<any> {
        return this._httpService.post(endPoints.appointments.appointmentDateCheckControl, model);
    }


}