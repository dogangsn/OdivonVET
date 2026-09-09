import {
    Component,
    ViewEncapsulation,
    OnInit,
    Input,
    HostListener,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoService } from '@ngneat/transloco';
import { AccountService } from 'app/core/services/account/account.service';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import {
    finalize,
    interval,
    Subject,
    takeUntil,
    takeWhile,
    tap,
    timer,
} from 'rxjs';

@Component({
    selector: 'auth-confirmation-required',
    templateUrl: './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthConfirmationRequiredComponent {
    confirmation: UntypedFormGroup;
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _accountService: AccountService,
        private _router: Router,
        private _translocoService: TranslocoService
    ) {}
    @Input() data: string;

    countdown: number = 3.0;
    minutes: number;
    seconds: number;

    phone: string;

    private timer: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    ngOnInit(): void {
        // Create the form
        this.confirmation = this._formBuilder.group({
            activationcode: ['', [Validators.required]],
        });

        this.phone = localStorage.getItem('phone');
        this.startTimer();
        // timer(1000, 1000)
        // .pipe(
        //     finalize(() => {
        //         //this._router.navigate(['auth/sign-in']);
        //     }),
        //     takeWhile(() => this.countdown > 0),
        //     takeUntil(this._unsubscribeAll),
        //     tap(() => this.countdown--)
        // )
        // .subscribe();
        // let totalSeconds = 60; // Toplam saniye sayısı (3 dakika)
        // interval(1000)
        //   .pipe(
        //     finalize(() => {
        //       //this._router.navigate(['auth/sign-in']);
        //     }),
        //     takeWhile(() => totalSeconds > 0),
        //     takeUntil(this._unsubscribeAll),
        //     tap(() => {
        //       this.minutes = Math.floor(totalSeconds / 60);
        //       this.seconds = totalSeconds % 60;
        //       totalSeconds--;
        //     })
        //   )
        //   .subscribe();
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    //     this.showSweetAlert('error', "Sayfadan Ayrılamazsınız...");
    //     event.returnValue = false;
    // }

    @HostListener('window:popstate', ['$event']) onPopState(
        event: PopStateEvent
    ) {
        this.showSweetAlert(
            'error',
            'Sayfadan Ayrılma Kararı Aldınız. Bilgilerinizi Tekrar Girerek İşleme Devam Edebilirsiniz...'
        );
        history.pushState(null, document.title, location.href);
    }

    sendActivation(): void {
        var model = {
            Email: localStorage.getItem('email'),
            ActivationCode: this.getFormValueByName('activationcode'),
        };
        debugger;
        this._accountService.complateactivation(model).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    localStorage.removeItem('email');
                    this._router.navigateByUrl('auth/sign-in');
                } else {
                    this.showSweetAlert('error', 'Aktivasyon Kodu yanlış...');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getFormValueByName(formName: string): any {
        return this.confirmation.get(formName).value;
    }

    showSweetAlert(type: string, text: string): void {
        if (type === 'success') {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.success'),
                text,
                SweetalertType.success
            );
            GeneralService.sweetAlert(sweetAlertDto);
        } else {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                text,
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    refreshActivation(): void {
        var model = {
            Username: localStorage.getItem('email'),
            Phone: localStorage.getItem('phone'),
        };

        this._accountService.refreshactivation(model).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.restartTimer();
                } else {
                    this.showSweetAlert(
                        'error',
                        'Aktivasyon Kodu Gönderilemedi...'
                    );
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    startTimer() {
        let totalSeconds = 180;
        this.timer = setInterval(() => {
            if (totalSeconds === 0) {
                clearInterval(this.timer);
                // Timer bittiğinde yapılması gereken işlemler
            } else {
                this.minutes = Math.floor(totalSeconds / 60);
                this.seconds = totalSeconds % 60;
                totalSeconds--;
            }
        }, 1000);
    }

    restartTimer() {
        clearInterval(this.timer);
        this.startTimer();
    }
}
