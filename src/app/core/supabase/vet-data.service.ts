import {Injectable} from '@angular/core';
import {ClinicClientService} from './clinic-client.service';
export interface ActionResult<T>{data:T;isSuccessful:boolean;errors:string[];statusCode:number;}
export class VetOperationError extends Error {constructor(message:string,public code?:string){super(message);}}
@Injectable({providedIn:'root'})
export class VetDataService {
 constructor(private clinics:ClinicClientService){}
 async execute<T>(operation:string,payload:unknown={},key?:string):Promise<ActionResult<T>>{
  const db=await this.clinics.client();
  const {data,error}=await db.rpc('vet_execute',{p_operation:operation,p_payload:payload||{},p_key:key||crypto.randomUUID()});
  if(error)throw new VetOperationError(error.message,error.code);
  return data as ActionResult<T>;
 }
}
