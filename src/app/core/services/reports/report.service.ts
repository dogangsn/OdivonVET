import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/core/auth/Http.service';
import { endPoints } from "environments/endPoints";
import { ActionResponse } from 'app/core/models/bases/ActionResponse';
@Injectable({
    providedIn: 'root'
})

export class ReportService {

    constructor(private _httpService: HttpService) { }

    createFilter(model: any): Observable<ActionResponse<any>> {
        return this._httpService.post(endPoints.reports.createFilter, model);
    }

    getAppointmentDashboard(): Observable<any> {
        return this._httpService.getRequest(endPoints.reports.getAppointmentDashboard);
    }



}
