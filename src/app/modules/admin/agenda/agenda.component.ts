
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'agenda',
    templateUrl    : './agenda.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

