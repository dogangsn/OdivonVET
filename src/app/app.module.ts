import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { FormsModule } from '@angular/forms';
import { CustomerListModule } from './modules/admin/customer/customerlist/customerlist.module';
import { CustomerModule } from './modules/admin/customer/customer.module';
import {MatStepperModule} from '@angular/material/stepper';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CreateEditPatientsDialogComponent } from './modules/admin/customer/customerlist/patientsdialogs/create-edit-patients';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';


const routerConfig: ExtraOptions = {
    preloadingStrategy       : PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};

@NgModule({
    declarations: [
        AppComponent,

    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),

        // Core module of your application
        CoreModule,
        MatStepperModule,
        // Layout module of your application
        LayoutModule,
        FormsModule,
        // CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })


    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA // Eğer gerekirse bu satırı ekleyin
      ],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}
