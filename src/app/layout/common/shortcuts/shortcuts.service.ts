import {Injectable} from '@angular/core';
import {BehaviorSubject,Observable,map,tap} from 'rxjs';
import {Shortcut} from './shortcuts.types';
import {HttpService} from 'app/core/auth/Http.service';
import {endPoints} from 'environments/endPoints';
@Injectable({providedIn:'root'})
export class ShortcutsService {
 private state=new BehaviorSubject<Shortcut[]>([]);
 constructor(private http:HttpService){}
 get shortcuts$():Observable<Shortcut[]>{return this.state.asObservable();}
 getAll():Observable<Shortcut[]>{return this.http.getRequest(endPoints.shortCuts.getShortCuts).pipe(map(r=>r.data as Shortcut[]),tap(rows=>this.state.next(rows)));}
 create(shortcut:Shortcut):Observable<Shortcut>{return this.http.post(endPoints.shortCuts.createShortCuts,{shortcut}).pipe(map(r=>r.data as Shortcut),tap(row=>this.state.next([...this.state.value,row])));}
 update(id:string,shortcut:Shortcut):Observable<Shortcut>{return this.http.post(endPoints.shortCuts.updateShortCuts,{id,shortcut}).pipe(map(r=>r.data as Shortcut),tap(row=>this.state.next(this.state.value.map(s=>s.id===id?row:s))));}
 delete(id:string):Observable<boolean>{return this.http.post(endPoints.shortCuts.deleteShortCuts,{id}).pipe(map(()=>true),tap(()=>this.state.next(this.state.value.filter(s=>s.id!==id))));}
}
