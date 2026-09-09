import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateUnitsCommand } from "app/modules/admin/definition/unitdefinition/models/CreateUnitsCommand";
import { CreateVaccineCommand } from "app/modules/admin/definition/vaccinelist/models/createVaccineCommand";
import { CreateRoomCommand } from "app/modules/admin/pethotels/accommodationrooms/models/createRoomCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AccommodationsRoonService {
    constructor(private _httpService: HttpService) { }

    getRoomList() : Observable<any>{
        return this._httpService.getRequest(endPoints.pethotels.getRoomList);
    }

    createRoom(model: CreateRoomCommand): Observable<any> {
        return this._httpService.post(endPoints.pethotels.createRoom, model);
    }

    updateRoom(model: any): Observable<any> {
        return this._httpService.post(endPoints.pethotels.updateRoom, model);
    }

    deleteRoom(model: any): Observable<any> {
        return this._httpService.post(endPoints.pethotels.deleteRoom, model);
    }


}