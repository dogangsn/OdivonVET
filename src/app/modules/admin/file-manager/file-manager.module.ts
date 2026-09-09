import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FileUploadDialogComponent } from './file-upload-dialog/file-upload-dialog.component';
import { FileManagerDetailsComponent } from './details/details.component';
import { CanDeactivateFileManagerDetails, FileManagerItemResolver } from './file-manager.resolvers';
import { fileManagerRoutes } from './file-manager.routing';
import { FileManagerListComponent } from './list/list.component';
import { FileManagerComponent } from './file-manager.component';

@NgModule({
  declarations: [
    FileManagerComponent,
    FileManagerDetailsComponent,
    FileManagerListComponent,
    FileUploadDialogComponent
  ],
  imports: [
    RouterModule.forChild(fileManagerRoutes),
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],

})
export class FileManagerModule { }
