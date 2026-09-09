import { Route } from '@angular/router';
import { ClinicalstatisticsComponent } from './clinicalstatistics.component';
// import { AnalyticsComponent } from 'app/modules/admin/dashboards/analytics/analytics.component';
import { ClinicalstatisticsDefaultResolver } from './ClinicalstatisticsDefault.resolvers'; 

export const analyticsRoutes: Route[] = [
    {
        path     : '',
        component: ClinicalstatisticsComponent,
        resolve  : {
            data: ClinicalstatisticsDefaultResolver
        }
    }
];
