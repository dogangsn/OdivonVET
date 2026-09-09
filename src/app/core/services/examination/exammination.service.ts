import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ExaminationService {
    constructor(private _httpService: HttpService) { }

    getExaminationlist(model: any) : Observable<any>{    
        return this._httpService.post(endPoints.examinations.examinationlist, model);
    }

    getExaminationlistById(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.getExamination, model);
    }

    getExaminationlistByPatientId(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.getExaminationlistByPatient, model);
    }

    createExamination(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.createExamination, model);
    }

    getSymptomlist() : Observable<any>{    
        return this._httpService.getRequest(endPoints.examinations.symptomlist);
    }

    updateExamination(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.updateExamination, model);
    }

    updateExaminationStatus(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.updateExaminationStatus, model);
    }

    deleteExamination(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.deleteExamination, model);
    }

    getExaminationsBySaleList(model: any): Observable<any> {
        return this._httpService.post(endPoints.examinations.getExaminationsBySaleList, model);
    }

}