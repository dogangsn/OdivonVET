import {Component} from '@angular/core';import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Component({selector:'app-reports',templateUrl:'./reports.component.html'})
export class ReportsComponent{kind='sales';from=new Date().toISOString().slice(0,7)+'-01';to=new Date().toISOString().slice(0,10);branch='';rows:any[]=[];columns:string[]=[];branches:any[]=[];error='';busy=false;
 kinds:{value:string;label:string}[]=[];
 constructor(private clinics:ClinicClientService){
 this.kinds=[{value:'sales',label:'Satış / alış',scope:'finance'},{value:'collections',label:'Tahsilat',scope:'finance'},{value:'stock',label:'Stok',scope:'inventory'},{value:'appointments',label:'Randevu',scope:'appointments'}].filter(k=>clinics.permissions.some(p=>p.scope===k.scope&&p.read));
 this.kind=this.kinds[0]?.value||'';this.loadBranches();}async loadBranches(){try{const {data,error}=await (await this.clinics.client()).from('branches').select('*');if(error)throw error;this.branches=data;}catch(e){this.error=e.message;}}
 async load(){this.busy=true;this.error='';try{const {data,error}=await (await this.clinics.client()).rpc('clinic_report',{p_kind:this.kind,p_from:this.from,p_to:this.to,p_branch:this.branch||null});if(error)throw error;this.rows=data;this.columns=data.length?Object.keys(data[0]):[];}catch(e){this.error=e.message;}finally{this.busy=false;}}
 csv(){const cell=(v:any)=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};const text=[this.columns,...this.rows.map(r=>this.columns.map(c=>r[c]))].map(r=>r.map(cell).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='odivon-'+this.kind+'.csv';a.click();URL.revokeObjectURL(url);}
 print(){window.print();}}
