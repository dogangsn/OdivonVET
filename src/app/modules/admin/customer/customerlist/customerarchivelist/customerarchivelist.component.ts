import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { customersListDto } from '../../models/customersListDto';
import { CustomerDetailsService } from '../service/customerdetailservice';

@Component({
    selector: 'customersarchivelist',
    templateUrl: './customerarchivelist.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CustomersArchiveListComponent {

    @Input() archiveData: any;

    displayedColumns: string[] = ['recId', 'firstName', 'lastName', 'phoneNumber', 'phoneNumber2', 'eMail', 'note', 'balance', 'actions'];
    @ViewChild('paginator') paginator: MatPaginator;
    customerlist: customersListDto[] = [];
    dataSource = new MatTableDataSource<customersListDto>(this.customerlist);


    constructor(private _customerListService: CustomerService,
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private router: Router, private route: ActivatedRoute,
        private customerDetailsService: CustomerDetailsService) {

    }
    // ngAfterViewInit(): void {
    //     this.customerlist = this.archiveData;
    //     this.dataSource = new MatTableDataSource<customersListDto>(
    //         this.customerlist
    //     ); 
    // }


    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    load(data: any): void {
        debugger
        this.customerlist = data;
        this.dataSource = new MatTableDataSource<customersListDto>(
            this.customerlist
        );
    }
}

