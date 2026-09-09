import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector       : 'modern',
    templateUrl    : './vaccinationcard.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaccinationCard implements OnInit 
{
 
    selectedCustomerId: any;

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any
    )
    {
        this.selectedCustomerId = data;
    }

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    
    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }
}
