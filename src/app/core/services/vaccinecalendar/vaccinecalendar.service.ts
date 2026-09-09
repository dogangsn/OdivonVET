import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateUnitsCommand } from "app/modules/admin/definition/unitdefinition/models/CreateUnitsCommand";
import { CreateVaccineCommand } from "app/modules/admin/definition/vaccinelist/models/createVaccineCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class VaccineCalendarService {
    constructor(private _httpService: HttpService) { }

    getPatientVaccineList(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccineCalendar.patientVaccineList, model);
    }

    createVaccineExaminations(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccineCalendar.createVaccineExaminations, model);
    }

    updateVaccineExamination(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccineCalendar.updateVaccineExamination, model);
    }

    deletePatientVaccine(model: any): Observable<any> {
        return this._httpService.post(endPoints.vaccineCalendar.deletePatientVaccine, model);
    }

    allVaccineAppointmentsList(): Observable<any> {
        return this._httpService.getRequest(endPoints.vaccineCalendar.allVaccineAppointmentsList);
    }


}