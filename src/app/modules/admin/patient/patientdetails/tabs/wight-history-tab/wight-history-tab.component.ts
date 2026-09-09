import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientListService } from 'app/core/services/patient/patientList/patientList.service';
import { CustomerDataService } from 'app/modules/admin/customer/customerdetails/services/customer-data.service';
import { WeightControlDto } from '../../models/weightControlDto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { MatDialogRef } from '@angular/material/dialog';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';

@Component({
  selector: 'app-wight-history-tab',
  templateUrl: './wight-history-tab.component.html',
  styleUrls: ['./wight-history-tab.component.css']
})
export class WightHistoryTabComponent implements OnInit {

  recievedPatientId:string;
  weighControls:WeightControlDto[] = [];
  weight:Number;

  dataSource = new MatTableDataSource<WeightControlDto>(this.weighControls);
  @ViewChild('paginator') paginator: MatPaginator;

  displayedColumns: string[] = ['weight', 'controlDate'];
  private _dialogRef: any;

  constructor(
    private _customerDataService: CustomerDataService,
    private _patientService: PatientListService,
    private _translocoService: TranslocoService,
    // private _dialogRef: MatDialogRef<any>,
  ) { }

  ngOnInit() {
    
    this.recievedPatientId=this._customerDataService.getPatientId();
    this.getAccommodationsList();
  }

  getAccommodationsList() {

    const model = {
      PatientId: this.recievedPatientId
    }

    this._patientService.getWeightControls(model).subscribe((response) => {
      this.weighControls = response.data;
      this.dataSource = new MatTableDataSource<WeightControlDto>(
        this.weighControls
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  updateWeight() {
    const model = {
      PatientId: this.recievedPatientId,
      Weight:this.weight
    }
    this._patientService.updatePatientsWeight(model).subscribe(
      (response) => {
          if (response.isSuccessful) {
            this.getAccommodationsList();
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

  translate(key: string): any {
    return this._translocoService.translate(key);
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

  isWeightIncreased(element: any, index: number): boolean {
    if (index === this.weighControls.length - 1) {
      return false
    }
    return element.weight > this.weighControls[index + 1].weight;
  }

  isWeightdecrease(element: any, index: number): boolean {
    
    if (index === this.weighControls.length - 1) {
      return false;
    }
    return element.weight < this.weighControls[index + 1].weight;
  }
  
  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleString('tr-TR', options);
  }

}
