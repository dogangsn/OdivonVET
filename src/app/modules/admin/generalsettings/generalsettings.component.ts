import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-generalsettings',
    templateUrl: './generalsettings.component.html',
    styleUrls: ['./generalsettings.component.css'],
})
export class GeneralsettingsComponent implements OnInit {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'company';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    action:any;
    generalsettingsAction:any;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }
    
        const appointment = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'generalsettings');
        });
    
        if (appointment) {
            this.generalsettingsAction = appointment.roleSettingDetails.find((detail: any) => detail.target === 'generalsettings');
        } else {
            this.generalsettingsAction = null;
        }
    }

    ngOnInit() {
        this.panels = [
            {
                id: 'company',
                icon: 'heroicons_outline:lock-closed',
                title: 'Şirket',
                description:
                    'Şirket Bilgileri, Şube işlemleri ve Genel Bilgileri',
            },
            {
                id: 'branch',
                icon: 'library_books',
                title: 'Şube',
                description:
                    'Şube Bilgileri, Şube işlemleri ve Genel Bilgileri',
            },
            {
                id: 'authority',
                icon: 'heroicons_outline:credit-card',
                title: 'Kullanıcılar',
                description:
                    'Sistem üzerindeki Kullanıcı Eklnemesi, Düzenlenmesi',
            },
            {
                id: 'title',
                icon: 'heroicons_outline:credit-card',
                title: 'Ünvan Tanım',
                description:
                    'Sistem üzerindeki Kullanıcı işlemlerinde ünvan tanımları',
            },
            {
                id: 'rolDef',
                icon: 'heroicons_outline:bell',
                title: 'Roller',
                description:
                    'Kulalnıcı işlemlerinde rol tanımlarını yapılması, Menü, Ekran Ayarları üzerinde yetki kontrollerin yapılması',
            },
            {
                id: 'mailing',
                icon: 'heroicons_outline:mail',
                title: 'Mail Ayarları',
                description:
                    'Şirket üzerinde Mail Trafiği üzerine SMTP ayarlarının tanımlanması',
            },
            {
                id: 'sms',
                icon: 'heroicons_outline:phone',
                title: 'SMS Kayıtları',
                description:
                    'Gönderilen mesajlar, Kalan Kullanım, Raporlar vs.',
            },
            // {
            //     id: 'logs',
            //     icon: 'heroicons_outline:user-group',
            //     title: 'Log Kayıtları',
            //     description:
            //         'İşlemlerde Silme/Düzenleme/Ekleme Log kayıtları detayları',
            // },
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }
    
    goToPanel(panel: string): void {
        this.selectedPanel = panel;
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }
 
    getPanelInfo(id: string): any {
        return this.panels.find((panel) => panel.id === id);
    }
 
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
