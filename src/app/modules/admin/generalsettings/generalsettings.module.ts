import {ProviderSettingsComponent} from '../provider-settings/provider-settings.component';
import {ClinicTeamComponent} from '../clinic-team/clinic-team.component';
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
import { GeneralsettingsComponent } from './generalsettings.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsCompanyComponent } from './company/company.component';
import { SettingsAppKeyComponent } from './appkey/appkey.component';
import { SettingsAuthorityComponent } from './authority/authority.component';
import { SettingsLogsComponent } from './logs/logs.component';
import { SettingsRolDefComponent } from './rolDef/rolDef.component';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateEditUsersDialogComponent } from './authority/dialogs/create-edit-users';
import { CreateEditRoleDefComponent } from './rolDef/dialogs/create-edit-roleDef/create-edit-roleDef.component';
import { MatTreeModule } from '@angular/material/tree';
import { TitleComponent } from './title/title.component';
import { CreateEditTitleComponent } from './title/dialogs/create-edit-title';
import { MailingComponent } from './mailing/mailing.component';
import { CreateEditSmstSettingComponent } from './mailing/dialogs/create-edit-smtpmailsettings';
import {MatTabsModule} from '@angular/material/tabs';
import { SmslogComponent } from './smslog/smslog.component';
import { CreateEditBranchComponent } from './branch/dialog/create-edit-branch/create-edit-branch.component';
import { BranchComponent } from './branch/branch.component';

const root: Route[] = [
    {
        path: '',
        component: GeneralsettingsComponent,
    },
];

@NgModule({
    imports: [ProviderSettingsComponent,ClinicTeamComponent,
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
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        FuseAlertModule,
        SharedModule,
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
        MatTreeModule,
        MatTabsModule,
        RouterModule.forChild(root),
    ],
    declarations: [
        GeneralsettingsComponent,
        SettingsRolDefComponent,
        SettingsLogsComponent,
        SettingsCompanyComponent,
        SettingsAuthorityComponent,
        SettingsAppKeyComponent,
        CreateEditUsersDialogComponent,
        CreateEditRoleDefComponent,
        TitleComponent,
        CreateEditTitleComponent,
        MailingComponent,
        CreateEditSmstSettingComponent,
        SmslogComponent,
        CreateEditBranchComponent,
        BranchComponent
    ],
})
export class GeneralSettings {}
