import {Injectable} from '@angular/core';
import {ClinicClientService} from './clinic-client.service';
export interface ClinicFile {id:string;name:string;object_path:string;size:number;mime:string;created_at:string;created_by:string;state:string;}
@Injectable({providedIn:'root'})
export class ClinicFilesService {
 constructor(private clinics:ClinicClientService){}
 async list():Promise<ClinicFile[]> {
  const {data,error}=await (await this.clinics.client()).from('clinic_files').select('*').order('created_at',{ascending:false});
  if(error)throw error;return data;
 }
 async upload(file:File,id:string,patient?:string,customer?:string,kind='document'):Promise<ClinicFile> {
  const db=await this.clinics.client();
  const reservation=await db.rpc('reserve_file',{p_id:id,p_name:file.name,p_size:file.size,p_mime:file.type||'application/octet-stream',p_patient:patient||null,p_customer:customer||null,p_kind:kind});
  if(reservation.error)throw reservation.error;
  const item=reservation.data as ClinicFile;
  if(item.state==='ready')return item;
  const upload=await db.storage.from('clinic-files').upload(item.object_path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
  // A lost upload response is recovered by checking the immutable reserved object.
  if(upload.error){const existing=await db.storage.from('clinic-files').info(item.object_path);if(existing.error)throw upload.error;}
  const done=await db.rpc('finalize_file',{p_id:id});if(done.error)throw done.error;return done.data;
 }
 async remove(id:string):Promise<void>{const {error}=await(await this.clinics.client()).rpc('delete_file',{p_id:id});if(error)throw error;}
 async download(id:string):Promise<Blob>{
  const db=await this.clinics.client();const item=await db.from('clinic_files').select('object_path').eq('id',id).single();
  if(item.error)throw item.error;
  return this.downloadPath(item.data.object_path);
 }
 async downloadPath(path:string):Promise<Blob>{
  const result=await(await this.clinics.client()).storage.from('clinic-files').createSignedUrl(path,60);
  if(result.error)throw result.error;
  const response=await fetch(result.data.signedUrl);if(!response.ok)throw new Error('Dosya indirilemedi.');return response.blob();
 }
}
