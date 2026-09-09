
import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
 {path:'smsparameters',canActivate:[AuthGuard],loadComponent:()=>import('app/modules/admin/provider-settings/provider-settings.component').then(m=>m.ProviderSettingsComponent)},
 {path:'auth/callback',loadComponent:()=>import('app/modules/auth/callback/callback.component').then(m=>m.CallbackComponent)},
 {path:'auth/sign-up',pathMatch:'full',redirectTo:'auth/registration'},
 {path:'auth/registration',loadComponent:()=>import('app/modules/auth/registration/registration.component').then(m=>m.RegistrationComponent)},
 {path:'clinic-account',canActivate:[AuthGuard],loadComponent:()=>import('app/modules/admin/clinic-account/clinic-account.component').then(m=>m.ClinicAccountComponent)},
    // Redirect empty path to '/example'
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/sign-in'
    },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards' },

    // Auth routes for guests
    {
        path: 'auth',
        canMatch: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () =>
                    import(
                        'app/modules/auth/confirmation-required/confirmation-required.module'
                    ).then((m) => m.AuthConfirmationRequiredModule),
            },
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.module'
                    ).then((m) => m.AuthForgotPasswordModule),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.module'
                    ).then((m) => m.AuthResetPasswordModule),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.module').then(
                        (m) => m.AuthSignInModule
                    ),
            },
            {
                path: 'sign-up',
                loadChildren: () =>
                    import('app/modules/auth/sign-up/sign-up.module').then(
                        (m) => m.AuthSignUpModule
                    ),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.module').then(
                        (m) => m.AuthSignOutModule
                    ),
            },
            {
                path: 'unlock-session',
                loadChildren: () =>
                    import(
                        'app/modules/auth/unlock-session/unlock-session.module'
                    ).then((m) => m.AuthUnlockSessionModule),
            },
        ],
    },

    // Landing routes
    // {
    //     path: '',
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty',
    //     },
    //     children: [
    //         {
    //             path: 'home',
    //             loadChildren: () =>
    //                 import('app/modules/landing/home/home.module').then(
    //                     (m) => m.LandingHomeModule
    //                 ),
    //         },
    //         {
    //             path: 'customer',
    //             loadChildren: () =>
    //                 import('app/modules/admin/customer/customer.module').then(
    //                     (m) => m.CustomerModule
    //                 ),
    //         },
    //     ],
    // },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'dashboards',
                loadChildren: () =>
                    import('app/modules/admin/dashboards/dashboards.module').then(
                        (m) => m.DashboardsModule
                    ),
            },
            {
                path: 'customerlist',
                loadChildren: () =>
                    import('app/modules/admin/customer/customerlist/customerlist.module').then(
                        (m) => m.CustomerListModule
                    ),
            },
            {
                path: 'customeradd',
                loadChildren: () =>
                    import('app/modules/admin/customer/customeradd/customeradd.module').then(
                        (m) => m.CustomeraddModule
                    ),
            },
            {
                path: 'farmclientadd',
                loadChildren: () =>
                    import('app/modules/admin/customer/farmclientadd/farmclientadd.module').then(
                        (m) => m.FarmClientaddModule
                    ),
            },
            {
                path: 'examinationadd',
                loadChildren: () =>
                    import('app/modules/admin/patient/examination/examinationadd/examinationadd.module').then(
                        (m) => m.ExaminationaddModule
                    ),
            },
            {
                path: 'appointmentcalendar',
                loadChildren: () =>
                    import('app/modules/admin/appointment/appointmentcalendar/appointment.module').then(
                        (m) => m.AppointmentModule
                    ),
            },
            {
                path: 'vaccineappointment',
                loadChildren: () =>
                    import('app/modules/admin/appointment/vaccineappointment/vaccineappointment.module').then(
                        (m) => m.VaccineappointmentModule
                    ),
            },
            {
                path: 'dailyappointment',
                loadChildren: () =>
                    import('app/modules/admin/appointment/dailyappointment/dailyappointment.module').then(
                        (m) => m.DailyappointmentModule
                    ),
            },
            {
                path: 'reportappointment',
                loadChildren: () =>
                    import('app/modules/admin/appointment/reportappointment/reportappointment.module').then(
                        (m) => m.ReportappointmentModule
                    ),
            },
            {
                path: 'sales',
                loadChildren: () =>
                    import('app/modules/admin/retail/sales/sales.module').then(
                        (m) => m.SalesModule
                    ),
            },
            {
                path: 'buying',
                loadChildren: () =>
                    import('app/modules/admin/retail/buying/buying.module').then(
                        (m) => m.BuyingModule
                    ),
            },
            {
                path: 'lab',
                loadChildren: () =>
                    import('app/modules/admin/patient/lab/lab.module').then(
                        (m) => m.LabModule
                    ),
            },
            {
                path: 'cashtransactions',
                loadChildren: () =>
                    import('app/modules/admin/cashing/cashtransactions/cashtransactions.module').then(
                        (m) => m.CashTransactionsModule
                    ),
            },
            {
                path: 'checkportfolio',
                loadChildren: () =>
                    import('app/modules/admin/cashing/checkportfolio/checkportfolio.module').then(
                        (m) => m.CheckportfolioModule
                    ),
            },
            {
                path: 'vaccinelist',
                loadChildren: () =>
                    import('app/modules/admin/definition/vaccinelist/vaccinelist.module').then(
                        (m) => m.VaccinelistModule
                    ),
            },
            {
                path: 'productdescription',
                loadChildren: () =>
                    import('app/modules/admin/definition/productdescription/productdescription.module').then(
                        (m) => m.ProductdescriptionModule
                    ),
            },
            {
                path: 'vaccinedefinition',
                loadChildren: () =>
                    import('app/modules/admin/definition/vaccinedefinition/vaccinedefinition.module').then(
                        (m) => m.VaccinedefinitionModule
                    ),
            },
            {
                path: 'file-manager',
                loadChildren: () =>
                    import('app/modules/admin/file-manager/file-manager.module').then(
                        (m) => m.FileManagerModule
                    ),
            },
            {
                path: 'demands',
                loadChildren: () =>
                    import('app/modules/admin/demands/demands.module').then(
                        (m) => m.Demands
                    ),
            },
            {
                path: 'suppliers',
                loadChildren: () =>
                    import('app/modules/admin/suppliers/suppliers.module').then(
                        (m) => m.SuppliersModule
                    ),
            },
            {
                path: 'agenda',
                loadChildren: () =>
                    import('app/modules/admin/agenda/agenda.module').then(
                        (m) => m.AgendaModule
                    ),
            },
            {
                path: 'store',
                loadChildren: () =>
                    import('app/modules/admin/store/store.module').then(
                        (m) => m.StoreModule
                    ),
            },
            {
                path: 'clinicalstatistics',
                loadChildren: () =>
                    import('app/modules/admin/clinicalstatistics/clinicalstatistics.module').then(
                        (m) => m.ClinicalstatisticsModule
                    ),
            },
            {
                path: 'reports',
                loadChildren: () =>
                    import('app/modules/admin/reports/reports.module').then(
                        (m) => m.ReportsModule
                    ),
            },
            {
                path: 'sms',
                loadChildren: () =>
                    import('app/modules/admin/sms/sms.module').then(
                        (m) => m.SmsModule
                    ),
            },

            {
                path: 'parameters',
                loadChildren: () =>
                    import('app/modules/admin/settings/parameters/parameters.module').then(
                        (m) => m.ParametersModule
                    ),
            },
            {
                path: 'smsparameters',
                loadChildren: () =>
                    import('app/modules/admin/settings/smsparameters/smsparameters.module').then(
                        (m) => m.SmsparametersModule
                    ),
            },
            {
                path: 'casingdefinition',
                loadChildren: () =>
                    import('app/modules/admin/definition/casingdefinition/casingdefinition.module').then(
                        (m) => m.CasingdefinitionModule
                    ),
            },
            {
                path: 'unitdefinition',
                loadChildren: () =>
                    import('app/modules/admin/definition/unitdefinition/unitdefinition.module').then(
                        (m) => m.UnitDefinitionModule
                    ),
            },
            {
                path: 'appointmenttypes',
                loadChildren: () =>
                    import('app/modules/admin/definition/appointmenttypes/appointmenttypes.module').then(
                        (m) => m.AppointmenttypesModule
                    ),
            },
            {
                path: 'taxes',
                loadChildren: () =>
                    import('app/modules/admin/definition/taxes/taxes.module').then(
                        (m) => m.TaxesModule
                    ),
            },
            {
                path: 'productcategory',
                loadChildren: () =>
                    import('app/modules/admin/definition/productcategory/productcategory.module').then(
                        (m) => m.ProductcategoryModule
                    ),
            },
            {
                path: 'paymentmethods',
                loadChildren: () =>
                    import('app/modules/admin/definition/paymentmethods/paymentmethods.module').then(
                        (m) => m.PaymentMethodsModule
                    ),
            },
            {
                path: 'customergroup',
                loadChildren: () =>
                    import('app/modules/admin/definition/customergroup/customergroup.module').then(
                        (m) => m.CustomergroupModule
                    ),
            },
            {
                path: 'smstemplate',
                loadChildren: () =>
                    import('app/modules/admin/definition/smstemplate/smstemplate.module').then(
                        (m) => m.SmstemplateModule
                    ),
            },
            {
                path: 'generalsettings',
                loadChildren: () =>
                    import('app/modules/admin/generalsettings/generalsettings.module').then(
                        (m) => m.GeneralSettings
                    ),
            },
            {
                path: 'myactivities',
                loadChildren: () =>
                    import('app/modules/admin/myactivities/myactivities.module').then(
                        (m) => m.MyActivitiesModule
                    ),
            },
            {
                path: 'accommodations',
                loadChildren: () =>
                    import('app/modules/admin/pethotels/accommodations/accommodations.module').then(
                        (m) => m.AccommodationsModule
                    ),
            },
            {
                path: 'accommodationrooms',
                loadChildren: () =>
                    import('app/modules/admin/pethotels/accommodationrooms/accommodationrooms.module').then(
                        (m) => m.AccommodationroomsModule
                    ),
            },
            {
                path: 'patientslist',
                loadChildren: () =>
                    import('app/modules/admin/patient/patientlist/patientlist.module').then(
                        (m) => m.PatientlistModule
                    ),
            },
            {
                path: 'services',
                loadChildren: () =>
                    import('app/modules/admin/definition/serviceslist/services.module').then(
                        (m) => m.ServicesModule
                    ),
            },
            {
                path: 'outputtemplate',
                loadChildren: () =>
                    import('app/modules/admin/definition/printtemplate/printtemplate.module').then(
                        (m) => m.PrinttemplateModule
                    ),
            },
            {
                path: 'examination',
                loadChildren: () =>
                    import('app/modules/admin/patient/examination/examinationlist/examinationlist.module').then(
                        (m) => m.ExaminationlistModule
                    ),
            },
        ],
    },
];
