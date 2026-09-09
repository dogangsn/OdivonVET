import { CustomerDataService } from './../../customer/customerdetails/services/customer-data.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { PatientListService } from 'app/core/services/patient/patientList/patientList.service';
import { PatientDetailsDto } from '../../customer/models/PatientDetailsDto';
import { CustomerDetailDto } from '../../customer/models/CustomerDetailDto';
@Component({
  selector: 'app-patientdetails',
  templateUrl: './patientdetails.component.html',
  styleUrls: ['./patientdetails.component.scss'],
})

export class PatientDetailsComponent implements OnInit {

  selectedPatientId: any;
  patient: PatientDetailsDto;
  customer: CustomerDetailDto;
  name:string;
  loader = true;
  items = Array(6);

  sex: string[] = ['Dişi', 'Erkek'];
  sexText: string;
  selectedTabIndex: number = 0; 
  tab: string

  constructor(
    private route: ActivatedRoute,
    private _patientService: PatientListService,
    private _customerService: CustomerService,
    private _customerDataService: CustomerDataService
  ) {

  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.selectedPatientId = params['id'];
      console.log('Müşteri ID:', this.selectedPatientId);
    });
    this.tab = this.route.snapshot.queryParamMap.get('tab');
    if (this.tab==="vaccine-calendar") {
      this.selectedTabIndex=3;
    }
    this._customerDataService.setPatientId(this.selectedPatientId);
    this.getPatientDetail();
  }

  getPatientDetail() {

    var model = {
      id: this.selectedPatientId
    }

    this._patientService.getPatientFindById(model).subscribe(response => {
      
        this.patient = response.data;
        this.patient.id = this.patient.id.split("-").pop();
        this.name = this.patient.name;
        this.sexText = this.sex[this.patient.sex];
        this.getCustomerDetail(this.patient.customerId);
        
    });
  }
  getCustomerDetail(id:string) {
    var model = {
      id: id
    }

    this._customerService.getCustomersFindById(model).subscribe(response => {
      
        this.customer = response.data;
        this._customerDataService.setCustomerId(this.customer.id);
        this.loader = false;
    });


    
  }

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return new Date(date).toLocaleString('tr-TR', options);
  }

  onTabChange(event: any) {
    if(event === 5){
        
    }

}

}



// export class PatientDetailsComponent implements OnInit {
//   @Output() formDataChanged = new EventEmitter<any>();
//   selectedCustomerId: any;
//   imageUrl: string | ArrayBuffer | null = null;
//   patientForm: FormGroup;
//   customers: SelectItem[];
//   types: SelectItem[];
//   breeds: SelectItem[];

//   constructor(private route: ActivatedRoute,
//     private messageService: MessageService,
//     private _formBuilder: FormBuilder) {

//     this.customers = [
//       { label: 'Doğan Güneş', value: 'DG' },
//     ];

//     this.types = [
//       { label: 'Köpek', value: 'dog' },
//       { label: 'Kedi', value: 'cat' },
//     ];

//     this.breeds = [
//       { label: 'Afgan Tazısı', value: 'afghan' },
//     ];
//   }

//   ngOnInit() {
//     this.route.params.subscribe((params) => {
//       this.selectedCustomerId = params['id'];
//       console.log('Müşteri ID:', this.selectedCustomerId);
//     });

//     this.patientForm = this._formBuilder.group({
//       patientCustomer: ['', Validators.required],
//       patientType: ['', Validators.required],
//       patientBreed: ['', Validators.required],
//       patientName: ['', Validators.required],
//       patientBirthDate: ['', Validators.required],
//       patientGender: ['', Validators.required],
//       patientImg: ['']
//     });
//   }

//   onSelect(event: any) {
//     if (event.files && event.files[0]) {
//       const file = event.files[0];
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         this.imageUrl = e.target?.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   onUpload(event: any) {
//     for (let file of event.files) {
//       // Yüklenen foto ile ilgili işlemler gelecek
//       console.log(file);
//     }
//     this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
//   }

//   removeImage() {
//     this.imageUrl = null;
//   }

//   saveChanges() {
//     if (this.patientForm.valid) {
//       console.log('Form Değerleri:', this.patientForm.value);
//     } else {
//       console.log('Form Geçerli Değil');
//     }
//   }
// }
