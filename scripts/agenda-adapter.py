from pathlib import Path
r=Path(__file__).resolve().parents[1]
(r/'src/app/core/services/agenda/agenda.service.ts').write_text('''import {Injectable} from '@angular/core';
import {BehaviorSubject,defer,Observable,map,tap} from 'rxjs';
import {VetDataService} from 'app/core/supabase/vet-data.service';
import {Agenda} from 'app/modules/admin/agenda/agenda.types';
import {agendaTagsDto} from 'app/modules/admin/agenda/models/agendaTagsDto';
@Injectable({providedIn:'root'})
export class AgendaService {
 private agendas=new BehaviorSubject<any[]>([]);private selected=new BehaviorSubject<any>(null);private tags=new BehaviorSubject<agendaTagsDto[]>([]);
 constructor(private data:VetDataService){}
 get agendas$(){return this.agendas.asObservable();}get agendasDto$(){return this.agendas$;}get agenda$(){return this.selected.asObservable();}get agendaDto$(){return this.agenda$;}get tags$(){return this.tags.asObservable();}get agendasservice$(){return this.getAgendaList();}
 private call(action:string,payload:any={}):Observable<any>{const key=crypto.randomUUID();return defer(()=>this.data.execute<any>('vet/Agenda/'+action,payload,key));}
 getAgendaList():Observable<any>{return this.call('AgendaList').pipe(tap(r=>this.agendas.next(r.data)));}
 getAgenda():Observable<Agenda[]>{return this.getAgendaList().pipe(map(r=>r.data));}
 getAgendaById(id:string):Observable<any>{return this.call('AgendaListById',{id}).pipe(map(r=>{const item=r.data.find(x=>x.id===id);if(!item)throw new Error('Ajanda kaydı bulunamadı.');this.selected.next(item);return item;}));}
 getAgendaById2(id:string){return this.getAgendaById(id);}
 createAgendas(model:any){return this.call('CreateAgenda',model);}
 updateAgendas(model:any){return this.call('UpdateAgenda',model);}updateAgendasMulti(model:any){return this.updateAgendas(model);}
 deleteAgendaSelected(model:any){return this.call('DeleteAgenda',model);}
 createAgenda(type:number,count:number):Observable<Agenda>{return this.createAgendas({agendaType:type,agendaNo:count,agendaTitle:'Yeni görev',isActive:1}).pipe(map(r=>r.data),tap(item=>this.agendas.next([item,...this.agendas.value])));}
 updateAgenda(id:string,item:Agenda):Observable<Agenda>{return this.updateAgendas({...item,id}).pipe(map(r=>r.data),tap(value=>{this.selected.next(value);this.agendas.next(this.agendas.value.map(a=>a.id===id?value:a));}));}
 deleteAgenda(id:string):Observable<boolean>{return this.deleteAgendaSelected({id}).pipe(map(()=>{this.agendas.next(this.agendas.value.filter(x=>x.id!==id));return true;}));}
 updateAgendasOrders(agendas:Agenda[]):Observable<Agenda[]>{return this.call('UpdateOrders',{items:agendas.map((a,i)=>({id:a.id,order:i}))}).pipe(map(()=>agendas));}
 searchAgendas(query:string):Observable<Agenda[]>{return this.getAgenda().pipe(map(rows=>rows.filter(r=>(r.agendaTitle||'').toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))));}
 getTags():Observable<agendaTagsDto[]>{return this.call('Tags').pipe(map(r=>r.data),tap(rows=>this.tags.next(rows)));}
 createTag(tag:agendaTagsDto):Observable<agendaTagsDto>{return this.call('CreateTag',tag).pipe(map(r=>r.data),tap(tag=>this.tags.next([...this.tags.value,tag])));}
 updateTag(id:string,tag:agendaTagsDto):Observable<agendaTagsDto>{return this.call('UpdateTag',{...tag,id}).pipe(map(r=>r.data),tap(tag=>this.tags.next(this.tags.value.map(t=>t.id===id?tag:t))));}
 deleteTag(id:string):Observable<boolean>{return this.call('DeleteTag',{id}).pipe(map(()=>{this.tags.next(this.tags.value.filter(t=>t.id!==id));return true;}));}
}
''',encoding='utf-8')
p=r/'src/app/core/services/myactivities/activities.service.ts'
p.write_text('''import {Injectable} from '@angular/core';import {BehaviorSubject,defer,Observable} from 'rxjs';import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Injectable({providedIn:'root'})export class ActivitiesService {private state=new BehaviorSubject<any[]>([]);constructor(private clinics:ClinicClientService){}get activities():Observable<any>{return this.state.asObservable();}getActivities():Observable<any>{return defer(async()=>{const {data,error}=await(await this.clinics.client()).rpc('my_activities');if(error)throw error;this.state.next(data);return data;});}}
''',encoding='utf-8')
