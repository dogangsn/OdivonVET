import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AgendaService } from 'app/core/services/Agenda/agenda.service';
import { Tag, Agenda } from 'app/modules/admin/agenda/agenda.types';
import { agendaDto } from './models/agendaDto';
import { AgendaListByIdQuery } from './models/AgendaListByIdQuery';
@Injectable({
    providedIn: 'root'
})
export class AgendaTagsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _agendaService: AgendaService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Tag[]>
    {
      debugger;
        return this._agendaService.getTags();
    }
}

@Injectable({
    providedIn: 'root'
})
export class AgendaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _agendaService: AgendaService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Agenda[]>
    {
      debugger;
        return this._agendaService.getAgenda();
    }
}

@Injectable({
    providedIn: 'root'
})
export class AgendasAgendaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _agendaService: AgendaService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const agendaId = route.paramMap.get('id');
    debugger;
        // İlk servis çağrısı
        return this._agendaService.getAgendaById(agendaId).pipe(
          switchMap((firstServiceResult: AgendaListByIdQuery | Agenda) => {
            // İlk servis çağrısı başarılı oldu, ancak boş bir sonuç döndü
            debugger;
            if (!firstServiceResult) {
              debugger;
              // İkinci servis çağrısını yap
              return this._agendaService.getAgendaById2(agendaId).pipe(
                catchError((secondError) => {
                  // İkinci servis çağrısı da başarısız oldu veya boş bir sonuç döndü
                  debugger;
                  console.error(secondError);
    
                  // Parent URL'yi al
                  const parentUrl = state.url.split('/').slice(0, -1).join('/');
    
                  // Parent URL'ye yönlendir
                  this._router.navigateByUrl(parentUrl);
    
                  // Hata fırlat
                  return throwError(secondError);
                })
              );
            } else {
              // İlk servis çağrısı başarılı oldu ve boş bir sonuç dönmedi, bu nedenle sonucu direk olarak döndür
              return of(firstServiceResult as AgendaListByIdQuery);
            }
          }),
          catchError((error) => {
            // İlk servis çağrısında veya ikinci servis çağrısında bir hata olursa
            console.error(error);
    
            // Parent URL'yi al
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
    
            // Parent URL'ye yönlendir
            this._router.navigateByUrl(parentUrl);
    
            // Hata fırlat
            return throwError(error);
          })
        );
      }
    // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AgendaListByIdQuery>
    // {





    //     return this._agendaService.getAgendaById(route.paramMap.get('id'))
    //                .pipe(
    //                    // Error here means the requested task is not available
    //                    catchError((error) => {

    //                        // Log the error
    //                        debugger;
    //                        console.error(error);

    //                        // Get the parent url
    //                        const parentUrl = state.url.split('/').slice(0, -1).join('/');

    //                        // Navigate to there
    //                        this._router.navigateByUrl(parentUrl);

    //                        // Throw an error
    //                        return throwError(error);
    //                    })
    //                );
    // }
}
