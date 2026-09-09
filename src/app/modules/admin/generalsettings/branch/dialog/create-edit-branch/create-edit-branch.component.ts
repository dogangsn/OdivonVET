import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { BranchDto } from '../../models/BranchDto';
import { BranchService } from 'app/core/services/generalsettings/branch/branch.service';

@Component({
  selector: 'app-create-edit-branch',
  templateUrl: './create-edit-branch.component.html',
  styleUrls: ['./create-edit-branch.component.css']
})
export class CreateEditBranchComponent implements OnInit {
  branchForm: FormGroup;
  selectedBranch: BranchDto = new BranchDto();
  isUpdate: boolean;
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private _translocoService: TranslocoService,
    private branchService: BranchService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.isUpdate = true;
      this.selectedBranch = data;
    }
  }

  ngOnInit() {
    this.branchForm = this._formBuilder.group({
      name: ['', Validators.required],
      district: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
    });
    if (this.isUpdate) {
      this.fillFormData(this.selectedBranch);
    }
  }

  addOrUpdateBranch(): void {
    this.isUpdate ? this.updateBranch() : this.addBranch();
  }

  addBranch(): void {
    const model = new BranchDto();
    model.name = this.getFormValueByName("name");
    model.district = this.getFormValueByName("district");
    model.address = this.getFormValueByName("address");
    model.phone = this.getFormValueByName("phone");

    this.branchService.createBranch(model).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert('success');
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.showSweetAlert('error');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  updateBranch(): void {
    const model = new BranchDto();
    model.id = this.selectedBranch.id;
    model.name = this.getFormValueByName("name");
    model.district = this.getFormValueByName("district");
    model.address = this.getFormValueByName("address");
    model.phone = this.getFormValueByName("phone");

    this.branchService.updateBranch(model).subscribe(
      (response) => {
        if (response.isSuccessful) {
          this.showSweetAlert('success');
          this._dialogRef.close({
            status: true,
          });
        } else {
          this.showSweetAlert('error');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }

  getFormValueByName(formName: string): any {
    return this.branchForm.get(formName).value;
  }

  showSweetAlert(type: string): void {
    if (type === 'success') {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.success'),
        this.translate('sweetalert.transactionSuccessful'),
        SweetalertType.success
      );
      GeneralService.sweetAlert(sweetAlertDto);
    } else {
      const sweetAlertDto = new SweetAlertDto(
        this.translate('sweetalert.error'),
        this.translate('sweetalert.transactionFailed'),
        SweetalertType.error
      );
      GeneralService.sweetAlert(sweetAlertDto);
    }
  }

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  fillFormData(selectedBranch: BranchDto) {
    if (selectedBranch) {
      const branchData = selectedBranch;
      this.branchForm.patchValue({
        name: branchData.name,
        district: branchData.district,
        address: branchData.address,
        phone: branchData.phone
      });
    }
  }

  formatPhoneNumber(inputValue: string, formControlName: string): void {
    const numericValue = inputValue.replace(/\D/g, '');

    let formattedValue = '';
    if (numericValue.length > 0) {
      formattedValue += '(' + numericValue.substring(0, 3) + ')';
    }
    if (numericValue.length > 3) {
      formattedValue += ' ' + numericValue.substring(3, 6);
    }
    if (numericValue.length > 6) {
      formattedValue += '-' + numericValue.substring(6, 10);
    }

    this.branchForm.get(formControlName).setValue(formattedValue);
  }

}
