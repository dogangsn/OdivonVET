
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PatientOwnerListDto } from 'app/modules/admin/patient/patientlist/models/patientOwnerListDto';

import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PatientDetails } from '../../../models/PatientDetailsCommand';
import { CustomerDetailDto } from '../../../models/CustomerDetailDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { Router } from '@angular/router';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';

@Component({
  selector: 'app-patientlist-dialog',
  templateUrl: './patientlist-dialog.component.html',
  styleUrls: ['./patientlist-dialog.component.css']
})
export class PatientlistDialogComponent implements OnInit {

  displayedColumns: string[] = ['name', 'animalTypeName', 'actions'];

  patientList: PatientDetails[] = [];
  customer: CustomerDetailDto;
  dataSource = new MatTableDataSource<PatientDetails>(this.patientList);

  customerId: string = "";
  customerName: string = "";

  @ViewChild('paginator') paginator: MatPaginator;
  loader: boolean = true;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _customerService: CustomerService,
    private router: Router,
    private _translocoService: TranslocoService,
  ) {
    this.customerId = data.customerId;
  }

  ngOnInit() {
    // this.dataSource.paginator = this.paginator;
    zip(
      this.getPatientList(),
      this.getCustomer(),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.setPatientList(value[0]),
            this.setCustomer(value[1])
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => {
        },
      });
  }



  closeDialog(): void {
    this._dialogRef.close({ status: null });
  }
  getCustomer(): Observable<any> {
    const model = {
      id: this.customerId
    }
    return this._customerService.getCustomersFindById(model)

  };


  setCustomer(response: any): void {
    if (response.data) {
      this.customer = response.data;
    }
  }


  getPatientList(): Observable<any> {
    const model = {
      id: this.customerId
    }
    return this._customerService.getPatientsByCustomerId(model)

  }

  setPatientList(response: any): void {
    if (response.data) {
      this.patientList = response.data;
    }

    this.dataSource = new MatTableDataSource<PatientDetails>(
      this.patientList
    );

    setTimeout(() => {
      if (this.dataSource) {
        this.dataSource.paginator = this.paginator;
      }
    }, 0);
 
    this.loader = false;
  }

  public redirectToUpdate = (id: string) => {
    console.log(id);
    this.router.navigate(['/patientslist/patientdetails/', id]);
    this.closeDialog();
  };

  translate(key: string): any {
    return this._translocoService.translate(key);
  }

  public redirectToDelete = (id: string) => {
    const sweetAlertDto = new SweetAlertDto(
      this.translate('sweetalert.areYouSure'),
      this.translate('sweetalert.areYouSureDelete'),
      SweetalertType.warning
    );
    GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
      (swalResponse) => {
        if (swalResponse.isConfirmed) {
          const model = {
            id: id,
          };
          this._customerService
            .deletePatients(model)
            .subscribe((response) => {
              if (response.isSuccessful) {
                const sweetAlertDto2 = new SweetAlertDto(
                  this.translate('sweetalert.success'),
                  this.translate('sweetalert.transactionSuccessful'),
                  SweetalertType.success
                );
                GeneralService.sweetAlert(sweetAlertDto2);
              } else {
                console.error('Silme işlemi başarısız.');
              }
            });
        }
      }
    );
  }

}
