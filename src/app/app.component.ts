import { Component } from '@angular/core';
import { loadMessages, locale } from 'devextreme/localization';
import localeMessages from 'devextreme/localization/messages/tr.json';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    /**
     * Constructor
     */
    constructor()
    {
        console.log(navigator.language)
        loadMessages(localeMessages);
        locale(navigator.language);
    }
}
