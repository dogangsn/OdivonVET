import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { customersListDto } from '../../customer/models/customersListDto';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { LabService } from 'app/core/services/lab/lab.service';
import { PatientOwnerListDto } from '../patientlist/models/patientOwnerListDto';
import { PatientListService } from 'app/core/services/patient/patientList/patientList.service';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LabuploaddocumentComponent } from './labuploaddocument/labuploaddocument.component';

@Component({
    selector: 'lab',
    templateUrl: './lab.component.html',
})
export class LabComponent implements OnInit {

    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('paginatorpatient') paginatorpatient: MatPaginator;
    @ViewChild('paginatorcustomer') paginatorcustomer: MatPaginator;

    displayedColumns: string[] = [
        'firstName',
        'lastName',
        'phoneNumber',
        'phoneNumber2',
        'eMail',
        'note',
        'actions',
    ];

    displayedColumnsPatient: string[] = ['name', 'animalTypeName', 'customerFirsLastName', 'actions'];

    displayedColumnsCustomer: string[] = ['recId', 'firstName', 'lastName', 'phoneNumber', 'phoneNumber2', 'eMail', 'actions'];


    loader = true;
 
    customerlist: customersListDto[] = [];
    dataSource = new MatTableDataSource<customersListDto>(this.customerlist);

    patientList: PatientOwnerListDto[] = [];
    dataSourcepatient = new MatTableDataSource<PatientOwnerListDto>(this.patientList);

    customerlistAll: customersListDto[] = [];
    dataSourceCustomer = new MatTableDataSource<customersListDto>(this.customerlistAll);


    constructor(
        
        private _translocoService: TranslocoService,
        private _labService: LabService,
        private _patientService: PatientListService,
        private _customerListService: CustomerService,
        private router: Router,
        private _dialog: MatDialog,
    ) {}

    ngOnInit() {
      this.getCustomerLabList();
    }

    getCustomerLabList() {
        this._labService.getCustomersLabList().subscribe((response) => {
            this.customerlist = response.data;
            this.loader = false;
            console.log(this.customerlist);
        });
    }

    patientOwnerList() {
        this._patientService.gtPatientList().subscribe((response) => {
            this.patientList = response.data;
            this.dataSourcepatient = new MatTableDataSource<PatientOwnerListDto>(
                this.patientList
            );
            setTimeout(() => {
                if (this.dataSource) {
                  this.dataSourcepatient.paginator = this.paginatorpatient;
                }
              }, 0);
              this.loader = false;
        });
    }

    getCustomerList(archive: boolean) {

        let model = {
            IsArchive: archive
        }
        this._customerListService.getcustomerlist(model).subscribe((response) => {
            if (!archive) {
                this.customerlistAll = response.data;
                this.dataSourceCustomer = new MatTableDataSource<customersListDto>(
                    this.customerlistAll
                );
                setTimeout(() => {
                    if (this.dataSource) {
                        this.dataSourceCustomer.paginator = this.paginatorcustomer;
                    }
                }, 0);
            }

            this.loader = false;
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onTabChange(event: any) {
        if (event === 1) {
            this.patientOwnerList();
        }
        else if (event === 2) {
             this.getCustomerList(false);
        }
        else {
            this.getCustomerLabList();
        }
    }

    public redirectToUpdate = (id: string) => {
        this.router.navigate(['/lab/labdetails/', id]);
    };
 
    

}
