from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
def put(p,s):(root/p).write_text(s,encoding='utf-8')
p=root/'src/app/app.module.ts';s=p.read_text();s=re.sub(r'^import .*FuseMockApiModule.*\n|^import .*mockApiServices.*\n','',s,flags=re.M);s=s.replace('        FuseMockApiModule.forRoot(mockApiServices),','');p.write_text(s)
put('src/app/app.resolvers.ts','''import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';import {Observable} from 'rxjs';
import {NavigationService} from 'app/core/navigation/navigation.service';
@Injectable({providedIn:'root'}) export class InitialDataResolver implements Resolve<any>{constructor(private nav:NavigationService){}resolve():Observable<any>{return this.nav.get();}}
''')
routes=[('dashboards','Genel Bakış'),('customerlist','Müşteriler'),('patientslist','Hastalar'),('appointmentcalendar','Randevu Takvimi'),('vaccineappointment','Aşı Takvimi'),('examination','Muayeneler'),('sales','Satışlar'),('buying','Alışlar'),('productdescription','Ürün ve Stok'),('cashtransactions','Kasa İşlemleri'),('checkportfolio','Çek Portföyü'),('suppliers','Tedarikçiler'),('store','Depolar'),('demands','Talepler'),('lab','Laboratuvar'),('accommodations','Pet Oteli'),('accommodationrooms','Odalar'),('file-manager','Dosyalar'),('reports','Raporlar'),('sms','SMS'),('agenda','Ajanda'),('clinicalstatistics','Klinik İstatistikleri'),('generalsettings','Yönetim'),('parameters','Parametreler'),('clinic-account','Klinik Hesabı')]
actual=set(re.findall(r"path:\s*'([^']+)'",(root/'src/app/app.routing.ts').read_text()))
nav=[{'id':p,'title':title,'type':'basic','icon':'heroicons_outline:chevron-right','link':'/'+p} for p,title in routes if p in actual or p=='clinic-account']
put('src/app/core/navigation/navigation.service.ts','''import {Injectable} from '@angular/core';import {Observable,ReplaySubject,of} from 'rxjs';import {Navigation} from './navigation.types';
@Injectable({providedIn:'root'}) export class NavigationService {
 private state=new ReplaySubject<Navigation>(1);get navigation$():Observable<Navigation>{return this.state.asObservable();}
 get():Observable<Navigation>{const items='''+json.dumps(nav,ensure_ascii=False)+''' as any;const value={default:items,compact:items,futuristic:items,horizontal:items};localStorage.setItem('navigation',JSON.stringify(value));this.state.next(value);return of(value);}
}
''')
p=root/'src/app/core/services/general/general.service.ts';s=p.read_text();a=s.index('        const result = localStorage');b=s.index('        return this.tokenInfoModel;',a)
s=s[:a]+'''        const p=JSON.parse(localStorage.getItem('odivon-profile') || '{}');
        this.tokenInfoModel = {id:p.id,FirstName:p.name || '',LastName:'',UserName:p.email || '',CompanyId:localStorage.getItem('odivon-clinic-code'),TenantId:localStorage.getItem('odivon-clinic-code'),AccountType:'Vet',Host:location.host,SubscriptionType:''};
'''+s[b:];p.write_text(s)
put('src/app/core/user/user.service.ts','''import {Injectable} from '@angular/core';import {Observable,ReplaySubject,defer} from 'rxjs';import {User} from './user.types';import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Injectable({providedIn:'root'}) export class UserService {
 private state=new ReplaySubject<User>(1);constructor(private clinics:ClinicClientService){}set user(v:User){this.state.next(v);}get user$():Observable<User>{return this.state.asObservable();}
 get():Observable<User>{return defer(async()=>{const p=await this.clinics.loadProfile();const u={id:p.id,name:p.name,email:p.email};this.user=u;return u;});}
 update(user:User):Observable<User>{return defer(async()=>{const db=await this.clinics.client();const {error}=await db.auth.updateUser({data:{display_name:user.name}});if(error)throw error;this.user=user;return user;});}
}
''')
p=root/'src/app/modules/admin/customer/customer.module.ts';s=p.read_text();s=re.sub(r'^import .*devexpress-reporting-angular.*\n','',s,flags=re.M).replace('      DxReportViewerModule,','');p.write_text(s)
# Replace the .NET report viewer with a filtered local table/export dialog.
put('src/app/modules/admin/customer/report/customerlistReport/customerlistReport.component.ts','''import {Component,Inject,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {MAT_DIALOG_DATA,MatDialogRef} from '@angular/material/dialog';import {VetDataService} from 'app/core/supabase/vet-data.service';
@Component({selector:'customer-list-report',standalone:true,imports:[CommonModule],template:`<section class="p-6"><h2 class="text-2xl font-bold">Müşteri Raporu</h2><p role="alert">{{error}}</p><button class="m-2 p-2 border" (click)="print()">Yazdır / PDF</button><button class="m-2 p-2 border" (click)="closeDialog()">Kapat</button><table class="w-full"><thead><tr><th>Ad Soyad</th><th>Telefon</th><th>Hasta</th></tr></thead><tbody><tr *ngFor="let r of rows"><td>{{r.firstName}} {{r.lastName}}</td><td>{{r.phoneNumber}}</td><td>{{r.petCount}}</td></tr></tbody></table></section>`})
export class customerlistReportComponent implements OnInit {
 rows:any[]=[];error='';constructor(private data:VetDataService,private dialog:MatDialogRef<customerlistReportComponent>,@Inject(MAT_DIALOG_DATA)public model:any){}
 async ngOnInit(){try{this.rows=(await this.data.execute<any[]>('vet/Customers/CustomersList',{isArchive:false})).data;}catch(e){this.error=e.message;}}
 print(){window.print();}closeDialog(){this.dialog.close();}
}
''')
p=root/'src/app/app.routing.ts';s=p.read_text();s=s.replace('export const appRoutes: Route[] = [', '''export const appRoutes: Route[] = [
 {path:'auth/registration',loadComponent:()=>import('app/modules/auth/registration/registration.component').then(m=>m.RegistrationComponent)},
 {path:'clinic-account',canActivate:[AuthGuard],loadComponent:()=>import('app/modules/admin/clinic-account/clinic-account.component').then(m=>m.ClinicAccountComponent)},''');p.write_text(s)
put('src/app/modules/admin/clinic-account/clinic-account.component.ts','''import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {RouterModule} from '@angular/router';import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Component({selector:'app-clinic-account',standalone:true,imports:[CommonModule,RouterModule],template:`<main class="p-8 max-w-4xl mx-auto"><h1 class="text-3xl font-bold">Klinik Hesabı</h1><p class="my-4" role="status">{{message}}</p><p>{{settings?.name}} — {{settings?.status}}</p><p *ngIf="settings?.trial_ends_at">Deneme bitişi: {{settings.trial_ends_at | date:'medium'}}</p><button class="p-3 border my-4" [disabled]="busy" (click)="exportData()">Verilerimi dışa aktar</button><p>Deneme süresi dolduğunda ücretli aktivasyon için Odivon ile iletişime geçin. Veriler otomatik silinmez.</p><a routerLink="/dashboards" class="block my-4 underline">Kliniğe dön</a><a routerLink="/sign-out">Çıkış</a></main>`})
export class ClinicAccountComponent implements OnInit{settings:any;message='';busy=false;constructor(private clinics:ClinicClientService){}async ngOnInit(){try{const {data,error}=await (await this.clinics.client()).from('clinic_settings').select('*').single();if(error)throw error;this.settings=data;}catch(e){this.message=e.message;}}
 async exportData(){this.busy=true;try{const {data,error}=await (await this.clinics.client()).rpc('export_clinic');if(error)throw error;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='odivon-vet-export.json';a.click();URL.revokeObjectURL(url);this.message='Veri dışa aktarımı hazır. Dosya içerikleri ayrıca yedeklenmelidir.';}catch(e){this.message=e.message;}finally{this.busy=false;}}
}
''')
