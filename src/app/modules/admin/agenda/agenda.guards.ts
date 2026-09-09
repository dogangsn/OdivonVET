import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AgendaDetailsComponent } from 'app/modules/admin/agenda/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateAgendasDetails implements CanDeactivate<AgendaDetailsComponent>
{
    canDeactivate(
        component: AgendaDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/tasks'
        // it means we are navigating away from the
        // tasks app
        if ( !nextState.url.includes('/agenda') )
        {

            // Let it navigate
            return true;
        }

        // If we are navigating to another task...
        if ( nextRoute.paramMap.get('id') )
        {
            // Just navigate
             return true;
            //return component.closeDrawer().then(() => true);

        }
        // Otherwise...
        else
        {

            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}
