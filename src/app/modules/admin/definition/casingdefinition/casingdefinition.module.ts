import { Routes } from "@angular/router";
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
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { CasingdefinitionComponent } from './casingdefinition.component';
import { CreateEditCasingDefinitionDialogComponent } from './dialogs/create-edit-casingdefinition';

// const root: Route[] = [
//     {
//         path     : '',
//         component: CasingdefinitionComponent
//     }
// ];
const routes: Routes = [
    {
        path: '',
        component : CasingdefinitionComponent,
    },
]
@NgModule({

    // imports     : [
    //     FormsModule,
    //     MatButtonModule,
    //     MatFormFieldModule,
    //     MatIconModule,
    //     MatInputModule,
    //     FormsModule,
    //     ReactiveFormsModule,
    //     FuseCardModule,
    //     MatMenuModule,
    //     FormsModule,
    //     MatTableModule,
    //     RouterModule.forChild(routes)
    // ],
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
        RouterModule.forChild(routes)
    ],
    declarations: [
        CasingdefinitionComponent,
        CreateEditCasingDefinitionDialogComponent
    ]
    
})
export class CasingdefinitionModule
{
}