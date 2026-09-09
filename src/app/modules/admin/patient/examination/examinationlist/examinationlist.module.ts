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
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { CommonModule } from '@angular/common'; 
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import {
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';
import {
    BrowserModule,
    BrowserTransferStateModule,
} from '@angular/platform-browser';
import { DxCheckBoxModule, DxSchedulerModule, DxSelectBoxModule } from 'devextreme-angular';
import { DxDateBoxModule } from 'devextreme-angular';
import {MatCardModule} from '@angular/material/card';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
// import { ExaminationaddComponent } from './examinationadd.component'; 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import { ExaminationlistComponent } from './examinationlist.component';

const root: Route[] = [
    {
        path     : '',
        component: ExaminationlistComponent
    }
];

@NgModule({

    imports     : [
        CommonModule ,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
     
        ReactiveFormsModule,
        FuseCardModule,
        MatMenuModule,
        MatTableModule,
        FullCalendarModule,
        MatDialogModule,
        MatDatepickerModule,
        MatSelectModule,
        MatRadioModule,
        SharedModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatSortModule,
        MatRippleModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatSelectModule,
        DxDateBoxModule,
        DxSchedulerModule,
        MatCardModule,
        DxDateBoxModule,
        DxCheckBoxModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatExpansionModule,
        RouterModule.forChild(root),
    ],
    declarations: [
        ExaminationlistComponent
    ]
    
})
export class ExaminationlistModule
{
}