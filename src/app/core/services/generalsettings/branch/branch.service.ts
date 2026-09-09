import { Injectable } from '@angular/core';
import { HttpService } from 'app/core/auth/Http.service';
import { endPoints } from 'environments/endPoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  constructor(private _httpService: HttpService) { }

  getBranchList(): Observable<any> {
    return this._httpService.getRequest(endPoints.settings.getBranchList);
  }

  createBranch(model: any): Observable<any> {
    return this._httpService.post(endPoints.settings.createBranch, model);
  }

  updateBranch(model: any): Observable<any> {
    return this._httpService.post(endPoints.settings.updateBranch, model);
  }

  deleteBranch(model: any): Observable<any> {
    return this._httpService.post(endPoints.settings.deleteBranch, model);
  }

}
