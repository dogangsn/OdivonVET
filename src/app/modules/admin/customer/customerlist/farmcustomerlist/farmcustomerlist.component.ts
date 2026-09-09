import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { customersListDto } from '../../models/customersListDto';
import { CustomerDetailsService } from '../service/customerdetailservice';
import { FarmsListDto } from '../../models/farmsListDto';

@Component({
    selector: 'farmcustomerlist',
    templateUrl: './farmcustomerlist.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class FarmCustomersComponent  {

    @Input() farmData: any;

    displayedColumns: string[] = ['farmName', 'farmContact', 'farmRelationship', 'actions'];
    @ViewChild('paginator') paginator: MatPaginator;
    customerlist: FarmsListDto[] = [];
    dataSource = new MatTableDataSource<FarmsListDto>(this.customerlist);


    constructor(private _customerListService: CustomerService,
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private router: Router, private route: ActivatedRoute,
        private customerDetailsService: CustomerDetailsService) {
 
    }
    // ngAfterViewInit(): void {
    //     this.customerlist = this.farmData;
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
        this.dataSource = new MatTableDataSource<FarmsListDto>(
            this.customerlist
        );
    }
}

