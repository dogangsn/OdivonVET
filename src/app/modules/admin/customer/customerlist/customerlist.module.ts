import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CustomersListComponent } from './customerlist.component';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectFilterModule } from 'app/shared/select-filter.module'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';     
import { DxCheckBoxModule, DxDateBoxModule } from 'devextreme-angular';
import { MatTabsModule } from '@angular/material/tabs';
import { PatientTabComponent } from '../customerdetails/tabs/patient-tab/patient-tab.component';
import { PayChartTabComponent } from '../customerdetails/tabs/paychart-tab/paychart-tab.component';
import { AccommodationsTabComponent } from '../customerdetails/tabs/accommodations-tab/accommodations-tab.component'; 
import { ExaminationTabComponent } from '../customerdetails/tabs/examination-tab/examination-tab.component';
import { VaccineTabComponent } from '../customerdetails/tabs/vaccine-tab/vaccine-tab.component';
import { MatBadgeModule } from '@angular/material/badge';  
import { CreateEditPatientsDialogComponent } from './patientsdialogs/create-edit-patients';
import { CreateEditCustomerAddDialogComponent } from './dialogs/create-edit-customeradd';
import { CustomerDetailsComponent } from '../customerdetails/customerdetails.component';
import { CustomerDetailEditDialogComponent } from '../customerdetails/dialogs/customer-detail-edit-dialog/customer-detail-edit-dialog.component';
import { CreateEditCustomersalesComponent } from '../customerdetails/dialogs/create-edit-customersales/create-edit-customersales.component';
import { CreateEditDetailspatientsComponent } from '../customerdetails/dialogs/create-edit-detailspatients/create-edit-detailspatients.component';
import { AppointmentHistoryComponent } from '../customerdetails/dialogs/appointment-history/appointment-history.component';
import { GetColectionEditDialogComponent } from '../customerdetails/dialogs/collection/get-collection-editdialog/get-collection-editdialog.component';
import { ColectionTransactionsDialogComponent } from '../customerdetails/dialogs/collection/collection-transactions-dialog/collection-transactions-dialog.component';
import { PayChartComponent } from '../customerdetails/dialogs/pay-chart/pay-chart.component';
import { VaccinationCard } from '../customerdetails/dialogs/vaccinationcard/vaccinationcard.component';
import { EditAppointmentComponent } from '../customerdetails/dialogs/appointment-history/dialogs/edit-appointment.component';
import { PatientlistDialogComponent } from '../customerdetails/dialogs/patientlist-dialog/patientlist-dialog.component';
import { SmstransactionsDialogComponent } from '../customerdetails/dialogs/messege/smstransactions-dialog/smstransactions-dialog.component';
import { SalesDialogComponent } from '../customerdetails/dialogs/sales-dialog/sales-dialog.component';
import { SalesTabComponent } from '../customerdetails/tabs/sales-tab/sales-tab.component';
import { CreateEditSalesComponent } from '../customerdetails/dialogs/collection/create-edit-sales/create-edit-sales.component';
import { MatChipsModule } from '@angular/material/chips';
import { CreateEditCustomerpatientsComponent } from '../customerdetails/dialogs/create-edit-customerpatients/create-edit-customerpatients.component';
import { BalacecollectionComponent } from '../customerdetails/dialogs/balacecollection/balacecollection.component';
import { MatCardModule } from '@angular/material/card';
import { CreatevaccineComponent } from '../../patient/createvaccine/createvaccine/createvaccine.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CustomersArchiveListComponent } from './customerarchivelist/customerarchivelist.component';
import { FarmCustomersComponent } from './farmcustomerlist/farmcustomerlist.component';
import { ExaminationCollectionComponent } from '../customerdetails/dialogs/collection/examination-collection/examination-collection.component';



const root: Route[] = [
    {
        path     : '',
        component: CustomersListComponent
    },
    {
        path: 'customerdetails/:id', 
        component: CustomerDetailsComponent,
    },
    {
        path: 'createvaccine/:id', 
        component: CreatevaccineComponent,
    },
];

@NgModule({

    imports     : [
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
        MatSelectFilterModule ,
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
        MatChipsModule,
        MatBadgeModule,
        MatCardModule,
        DragDropModule,
        RouterModule.forChild(root),
    ],
    declarations: [
        CustomersListComponent,
        CreateEditCustomerAddDialogComponent,
        CreateEditPatientsDialogComponent,
        CustomerDetailsComponent,
        CustomerDetailEditDialogComponent,
        CreateEditCustomersalesComponent,
        CreateEditDetailspatientsComponent,
        AppointmentHistoryComponent,
        GetColectionEditDialogComponent,
        ColectionTransactionsDialogComponent,
        PayChartComponent,
        VaccinationCard,
        EditAppointmentComponent,
        PatientTabComponent,
        PayChartTabComponent,
        AccommodationsTabComponent,
        PatientlistDialogComponent,
        ExaminationTabComponent,
        VaccineTabComponent,
        SmstransactionsDialogComponent,
        SalesDialogComponent,
        SalesTabComponent,
        CreateEditSalesComponent,
        CreateEditCustomerpatientsComponent,
        BalacecollectionComponent,
        CreatevaccineComponent,
        CustomersArchiveListComponent,
        FarmCustomersComponent,
        ExaminationCollectionComponent
        //  DxReportViewerComponent
    ]

    
})
export class CustomerListModule
{
}