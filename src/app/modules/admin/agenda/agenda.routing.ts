import { Route } from '@angular/router';
import { CanDeactivateAgendasDetails } from 'app/modules/admin/agenda/agenda.guards';
import { AgendaResolver, AgendaTagsResolver, AgendasAgendaResolver } from 'app/modules/admin/agenda/agenda.resolvers';
import { AgendaComponent } from 'app/modules/admin/agenda/agenda.component';
import { AgendaListComponent } from 'app/modules/admin/agenda/list/list.component';
import { AgendaDetailsComponent } from 'app/modules/admin/agenda/details/details.component';

export const agendaRoutes: Route[] = [
    {
        path     : '',
        component: AgendaComponent,
        resolve  : {
            tags: AgendaTagsResolver
        },
        children : [
            {
                path     : '',
                component: AgendaListComponent,
                resolve  : {
                    agendas: AgendaResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : AgendaDetailsComponent,
                        resolve      : {
                            agenda: AgendasAgendaResolver
                        },
                        canDeactivate: [CanDeactivateAgendasDetails]
                    }
                ]
            }
        ]
    }
];
