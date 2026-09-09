import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs'; 
import { Item, Items } from './models/file-manager.types';
import { FileManagerService } from 'app/core/services/file-manager/file-manager.service';
import { CanDeactivate, UrlTree } from '@angular/router';
import { FileManagerDetailsComponent } from './details/details.component';

@Injectable({
    providedIn: 'root'
})
export class FileManagerItemResolver implements Resolve<any>
{ 
    constructor(
        private _router: Router,
        private _fileManagerService: FileManagerService
    )
    {
        
    }
 
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item>
    {
        const item = {
            id : route.paramMap.get('id')
        }
        return this._fileManagerService.getItemById(item)
                   .pipe( 
                       catchError((error) => { 
                           console.error(error); 
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');
                           this._router.navigateByUrl(parentUrl);
                           return throwError(error);
                       })
                   );
    }
}

@Injectable({
    providedIn: 'root'
})
export class FileManagerFolderResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fileManagerService: FileManagerService
    )
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item>
    {
        return this._fileManagerService.getItemById(route.paramMap.get('folderId'))
                   .pipe(
                       // Error here means the requested task is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateFileManagerDetails implements CanDeactivate<FileManagerDetailsComponent>
{
    canDeactivate(
        component: FileManagerDetailsComponent,
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

        // If the next state doesn't contain '/file-manager'
        // it means we are navigating away from the
        // file manager app
        if ( !nextState.url.includes('/file-manager') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another item...
        if ( nextState.url.includes('/details') )
        {
            // Just navigate
            return true;
        }
        // Otherwise...
        else
        {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class FileManagerItemsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _fileManagerService: FileManagerService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item[]>
    { 
        return this._fileManagerService.getFileManagerList()
    }
}

 
