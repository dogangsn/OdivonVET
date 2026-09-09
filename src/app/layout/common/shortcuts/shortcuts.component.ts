import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';

@Component({
    selector       : 'shortcuts',
    templateUrl    : './shortcuts.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'shortcuts'
})
export class ShortcutsComponent implements OnInit, OnDestroy
{
    @ViewChild('shortcutsOrigin') private _shortcutsOrigin: MatButton;
    @ViewChild('shortcutsPanel') private _shortcutsPanel: TemplateRef<any>;
    @Input() tooltip: string;
    mode: 'view' | 'modify' | 'add' | 'edit' = 'view';
    shortcutForm: UntypedFormGroup;
    shortcuts: Shortcut[] = [];
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _shortcutsService: ShortcutsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.shortcutForm = this._formBuilder.group({
            id         : [null],
            label      : ['', Validators.required],
            description: [''],
            icon       : ['', Validators.required],
            link       : ['', Validators.required],
            useRouter  : ['', Validators.required]
        });

        this._shortcutsService.shortcuts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((shortcuts: Shortcut[]) => {
                this.shortcuts = shortcuts;
                this._changeDetectorRef.markForCheck();
            });

        // Fetch the initial shortcuts
        this._shortcutsService.getAll().subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        if ( this._overlayRef ) {
            this._overlayRef.dispose();
        }
    }

    openPanel(): void {
        if ( !this._shortcutsPanel || !this._shortcutsOrigin ) {
            return;
        }
        this.mode = 'view';
        if ( !this._overlayRef ) {
            this._createOverlay();
        }
        this._overlayRef.attach(new TemplatePortal(this._shortcutsPanel, this._viewContainerRef));
    }

    closePanel(): void {
        this._overlayRef.detach();
    }

    changeMode(mode: 'view' | 'modify' | 'add' | 'edit'): void {
        this.mode = mode;
    }

    newShortcut(): void {
        this.shortcutForm.reset();
        this.mode = 'add';
    }

    editShortcut(shortcut: Shortcut): void {
        this.shortcutForm.reset(shortcut);
        this.mode = 'edit';
    }

    save(): void {
        const shortcut = this.shortcutForm.value;
        if ( shortcut.id ) {
            this._shortcutsService.update(shortcut.id, shortcut).subscribe();
        } else {
            this._shortcutsService.create(shortcut).subscribe();
        }
        this.mode = 'modify';
    }

    delete(): void {
        const shortcut = this.shortcutForm.value;
        this._shortcutsService.delete(shortcut.id).subscribe();
        this.mode = 'modify';
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    private _createOverlay(): void {
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._shortcutsOrigin._elementRef.nativeElement)
                                  .withLockedPosition(true)
                                  .withPush(true)
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'start',
                                          originY : 'top',
                                          overlayX: 'start',
                                          overlayY: 'bottom'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'bottom',
                                          overlayX: 'end',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'top',
                                          overlayX: 'end',
                                          overlayY: 'bottom'
                                      }
                                  ])
        });

        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }
}
