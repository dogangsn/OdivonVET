import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private _refreshList = new Subject<void>();

  get refreshList$() {
    return this._refreshList.asObservable();
  }

  triggerRefreshList() {
    this._refreshList.next();
  }
}