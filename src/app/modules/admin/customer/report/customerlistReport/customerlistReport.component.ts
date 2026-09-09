import {Component,Inject,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {MAT_DIALOG_DATA,MatDialogRef} from '@angular/material/dialog';import {VetDataService} from 'app/core/supabase/vet-data.service';
@Component({selector:'customer-list-report',standalone:true,imports:[CommonModule],template:`<section class="p-6"><h2 class="text-2xl font-bold">Müşteri Raporu</h2><p role="alert">{{error}}</p><button class="m-2 p-2 border" (click)="print()">Yazdır / PDF</button><button class="m-2 p-2 border" (click)="closeDialog()">Kapat</button><table class="w-full"><thead><tr><th>Ad Soyad</th><th>Telefon</th><th>Hasta</th></tr></thead><tbody><tr *ngFor="let r of rows"><td>{{r.firstName}} {{r.lastName}}</td><td>{{r.phoneNumber}}</td><td>{{r.petCount}}</td></tr></tbody></table></section>`})
export class customerlistReportComponent implements OnInit {
 rows:any[]=[];error='';constructor(private data:VetDataService,private dialog:MatDialogRef<customerlistReportComponent>,@Inject(MAT_DIALOG_DATA)public model:any){}
 async ngOnInit(){try{this.rows=(await this.data.execute<any[]>('vet/Customers/CustomersList',{isArchive:false})).data;}catch(e){this.error=e.message;}}
 print(){window.print();}closeDialog(){this.dialog.close();}
}
