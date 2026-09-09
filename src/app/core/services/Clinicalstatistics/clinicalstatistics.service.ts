import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { clinicalstatisticsListDto, clinicalstatisticsResponseDto } from "app/modules/admin/clinicalstatistics/models/clinicalstatisticsListDto";
import { graphicListRequestDto } from "app/modules/admin/clinicalstatistics/models/graphicListDto";
import { weekVisitListDto, weekVisitListRequestDto } from "app/modules/admin/clinicalstatistics/models/weekVisitListDto";
import { CreateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/CreateCasingDefinitionCommand";
import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
import { UpdateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/UpdateCasingDefinitionCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ClinicalStatisticsService {
    constructor(private _httpService: HttpService) { }

    // getCasingDefinitionList() : Observable<any>{
    //     return this._httpService.getRequest(endPoints.casedefinition.casedefinitionList);
    // }

    getClinicalstatisticsList(model: clinicalstatisticsResponseDto): Observable<any> {
        return this._httpService.post(endPoints.clinicalstatistics.getClinicalstatisticsList, model);
    }
    getGraphicList(model: graphicListRequestDto): Observable<any> {
        return this._httpService.post(endPoints.clinicalstatistics.getGraphicList, model);
    }
    getWeekVisitList(model: weekVisitListRequestDto): Observable<any> {
        return this._httpService.post(endPoints.clinicalstatistics.getweekVisitList, model);
    }
    getBagelSliceGraphList() : Observable<any>{
        return this._httpService.getRequest(endPoints.clinicalstatistics.getbagelSliceGraphList);
    }
    // deleteCasingDefinition(id?: DeleteCasingDefinitionCommand): Observable<any> {
    //     return this._httpService.post(endPoints.casedefinition.Deletecasedefinition, id);
    // }
    // updateCasingDefinition(model: UpdateCasingDefinitionCommand): Observable<any> {
    //     return this._httpService.post(endPoints.casedefinition.Updatecasedefinition, model);
    // }
}
