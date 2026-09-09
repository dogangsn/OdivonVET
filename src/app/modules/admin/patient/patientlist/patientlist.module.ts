
import { PatientlistComponent } from './patientlist.component';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';

import { PatientDetailsComponent } from '../patientdetails/patientdetails.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectFilterModule } from 'app/shared/select-filter.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatStepperModule } from '@angular/material/stepper';
import { DxCheckBoxModule, DxDateBoxModule } from 'devextreme-angular';
import { MatTabsModule } from '@angular/material/tabs';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MatDialogModule } from '@angular/material/dialog'; 
import { CreateEditPatientComponent } from './create-edit-patient/create-edit-patient.component';
import { CustomerPatientsTabComponent } from '../patientdetails/tabs/customer-patients-tab/customer-patients-tab.component';
import { PatientAccommodationTabComponent } from '../patientdetails/tabs/patient-accommodation-tab/patient-accommodation-tab.component';
import { PatientAppointmentsTabComponent } from '../patientdetails/tabs/patient-appointments-tab/patient-appointments-tab.component';
import { PatientExaminationsTabComponent } from '../patientdetails/tabs/patient-examinations-tab/patient-examinations-tab.component';
import { PatientInseminationsTabComponent } from '../patientdetails/tabs/patient-inseminations-tab/patient-inseminations-tab.component';
import { PatientVaccineAppointmentTabComponent } from '../patientdetails/tabs/patient-vaccine-appointment-tab/patient-vaccine-appointment-tab.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { WightHistoryTabComponent } from '../patientdetails/tabs/wight-history-tab/wight-history-tab.component';
import { MatCardModule } from '@angular/material/card';
import { CreatevaccineComponent } from '../createvaccine/createvaccine/createvaccine.component';
import { VaccineAppointmentDoneComponent } from '../patientdetails/tabs/patient-vaccine-appointment-tab/dialogs/vaccine-appointment-done/vaccine-appointment-done.component';


const root: Route[] = [
  {
    path: '',
    component: PatientlistComponent
  },
  {
    path: 'patientdetails/:id',
    component: PatientDetailsComponent
  }
];



@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    FuseCardModule,
    MatMenuModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    FuseCardModule,
    MatMenuModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSortModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    SharedModule,
    MatDialogModule,
    MatDatepickerModule, 
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    RouterModule.forChild(root),
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatSelectFilterModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    NgApexchartsModule,
    MatStepperModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    MatTabsModule,
    DropdownModule,
    FileUploadModule,
    InputTextModule,
    CalendarModule,
    RadioButtonModule,
    ButtonModule,
    CardModule,
    MatCardModule,
    MatExpansionModule,
    RouterModule.forChild(root),
  ],
  declarations: [
    PatientlistComponent,
    PatientDetailsComponent,
    CreateEditPatientComponent,
    CustomerPatientsTabComponent,
    PatientAccommodationTabComponent,
    PatientAppointmentsTabComponent,
    PatientExaminationsTabComponent,
    PatientInseminationsTabComponent,
    PatientVaccineAppointmentTabComponent,
    WightHistoryTabComponent,
    VaccineAppointmentDoneComponent
    ]

})
export class PatientlistModule { }
