import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { CreateStoreCommand } from "app/modules/admin/store/models/CreateStoreCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ChatService {
    constructor(private _httpService: HttpService) { }

    getChatUsers() : Observable<any>{
        return this._httpService.getRequest(endPoints.chat.getAllUsers);
    }

}