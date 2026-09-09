import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClinicalstatisticsComponent } from './clinicalstatistics.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';
import { analyticsRoutes } from './ClinicalstatisticsDefault.routing';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from "@angular/material/select";
import { MatDialog,MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule, DatePipe } from '@angular/common';


const root: Route[] = [
    {
        path     : '',
        component: ClinicalstatisticsComponent
    }
];

@NgModule({

    imports     : [
        RouterModule.forChild(analyticsRoutes),
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        FuseCardModule,
        MatMenuModule,
        MatTableModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatProgressBarModule,
        MatSortModule,
        MatTooltipModule,
        NgApexchartsModule,
        SharedModule,
        MatRippleModule,
        MatSidenavModule,
        MatTabsModule,
        TranslocoModule,
        MatPaginatorModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        CommonModule,
        
        
        // RouterModule.forChild(root)
    ],
    declarations: [
        ClinicalstatisticsComponent
    ],
    providers:[
        DatePipe
    ]
    
})
export class ClinicalstatisticsModule
{
}