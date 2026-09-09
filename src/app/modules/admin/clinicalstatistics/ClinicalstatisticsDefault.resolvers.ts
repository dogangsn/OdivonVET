import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
// import { AnalyticsService } from 'app/modules/admin/dashboards/analytics/analytics.service';
import { ClinicalstatisticsDefaultService } from './clinicalstatisticsdefault.service';
@Injectable({
    providedIn: 'root'
})
export class ClinicalstatisticsDefaultResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _analyticsService: ClinicalstatisticsDefaultService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {debugger;
        return this._analyticsService.getData();
    }
}
