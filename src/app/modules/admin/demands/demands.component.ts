import { Component, OnInit,AfterViewInit, ViewChild, OnDestroy  } from '@angular/core';
import { CreateDemandProductsCommand } from './demand1/models/CreateDemandProductsCommand';
import { Demand1Component } from './demand1/demand1.component';
import { Demand2Component } from './demand2/demand2.component';
import { Demand3Component } from './demand3/demand3.component';
import { ChangeDetectorRef } from '@angular/core';
import { DemandProductsService } from 'app/core/services/Demands/DemandProducts/demandproducts.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { MatTabGroup,MatTabChangeEvent } from '@angular/material/tabs';
import {  ChangeDetectionStrategy,    ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';


import { Observable,  debounceTime, map, merge, switchMap, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { RepositionScrollStrategy } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-demands',
  templateUrl: './demands.component.html',
  styles : [
    /* language=SCSS */
    `
        .inventory-grid {
            grid-template-columns: 48px auto 40px;

            @screen sm {
                grid-template-columns: 48px auto auto 72px;
            }

            @screen md {
                grid-template-columns: 48px auto 112px  112px 72px;
            }

            @screen lg {
                grid-template-columns: 40px  112px auto  112px 96px 96px 72px;
            }
        }
    `
],
encapsulation: ViewEncapsulation.None,
changeDetection: ChangeDetectionStrategy.OnPush,
animations: fuseAnimations,
})
export class DemandsComponent implements OnInit, OnDestroy,AfterViewInit  {
  @ViewChild(Demand1Component) demand1Component: Demand1Component;
  @ViewChild(Demand2Component) demand2Component: Demand2Component;
  @ViewChild(Demand3Component) demand3Component: Demand3Component;
  public indexs : number = 0;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  isLoading: boolean = false;
  loader=true;
  items = Array(13);
  CreateDemandCom = CreateDemandProductsCommand;
  constructor(
    private demandProductsService: DemandProductsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private _translocoService: TranslocoService,
    private productDescriptionService : ProductDescriptionService,
    private _dialog: MatDialog,
      ) {
    // Demand1Component'ı oluştururken gereken argümanları sağlayın

  }
  ngOnInit() {
    



  }
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  buttonLabel: string = 'Sipariş Oluştur';

  
  ngAfterViewInit(): void
  {
      if ( this._sort && this._paginator )
      {
          // Set the initial sort
          this._sort.sort({
              id          : 'name',
              start       : 'asc',
              disableClear: true
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();

          // If the user changes the sort order...
          this._sort.sortChange
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe(() => {
                  // Reset back to the first page
                  this._paginator.pageIndex = 0;

                  // Close the details
              });
              merge(this._sort.sortChange, this._paginator.page).pipe(
              ),
                map(() => {
                    this.isLoading = false;
                })
            
      }
  }
  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next(null);
      this._unsubscribeAll.complete();
      
  }

  onTabChange(index: MatTabChangeEvent): void {
     const ix = index.index;
    if (ix === 0) {
      this.buttonLabel = 'Sipariş Oluştur';
      this.demand1Component.getDemandProducts();
      this.indexs = 0;
    } else if (ix === 1) {
      this.buttonLabel = 'Onayla';
      this.indexs = 1;
      this.getDemands();
    } 
    else if(ix === 2)
    {
      this.indexs = 2;
      debugger;
      this.demand3Component.getDemands();
    }
    this._changeDetectorRef.markForCheck();
  }
  addTalep(){
    this.demand1Component.createProduct();
  }
  handleButtonClick() {
    // Butona tıklandığında yapılacak işlemler burada
    if(this.indexs == 0)
    {
      console.log(this.indexs);
      this.demand1Component.addDemand();
    }
    // if(this.indexs == 1)
    // {
    //   this.getDemandComplate();
    //   console.log(this.indexs);
    // }
  }
  getDemands(){
    debugger;
    this.demand2Component.getDemands();
  }
  // getDemandComplate(){
  //   this.demand2Component.addDemandComplate();
  // }



































}
