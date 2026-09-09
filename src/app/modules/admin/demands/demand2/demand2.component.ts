import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, debounceTime, map, merge, switchMap, takeUntil } from 'rxjs';
import { DemandProductsService } from 'app/core/services/Demands/DemandProducts/demandproducts.service'; // ProductService'nin gerçek adını ve yolunu belirtmelisiniz
import { demandProductsListDto } from '../demand1/models/demandProductsListDto';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InventoryBrand, InventoryPagination, InventoryTag, InventoryVendor } from '../../customer/models/PatientDetailsCommand';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { fuseAnimations } from '@fuse/animations';
// import { CreateDemandProductsCommand } from './models/CreateDemandProductsCommand';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { RepositionScrollStrategy } from '@angular/cdk/overlay';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from '../../definition/productdescription/models/ProductDescriptionsDto';
import { CreateEditDemandDialogComponent } from '../dialogs/create-edit-demand';
import { MatDialog } from '@angular/material/dialog';
import { InventoryCategory, demandsListDto, demandTransList } from '../models/demandListDto';
import { SuppliersService } from 'app/core/services/suppliers/suppliers.service';
import { suppliersListDto } from '../../suppliers/models/suppliersListDto';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-demand2',
    template: './demand2/demand2.component.html',
    templateUrl: './demand2.component.html',
    styles: [
        /* language=SCSS */
        `
        .inventory-grid {
            grid-template-columns: 96px 48px auto 40px;

            @screen sm {
                grid-template-columns: 96px 48px auto 112px 72px;
            }

            @screen md {
                grid-template-columns: 96px 48px 112px auto 112px 72px;
            }

            @screen lg {
                grid-template-columns: 96px auto 112px 112px 96px 96px 72px 112px;
            }
        }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})


export class Demand2Component implements OnInit, OnDestroy {
    @ViewChild(CreateEditDemandDialogComponent) CreateEditDemandDialogComponent: CreateEditDemandDialogComponent;

    //[x: string]: any;
    displayedColumns: string[] = [
        'name',
        'categoryCode',
        'actions',
    ];
    // products$: Observable<any>; 
    demandList: demandsListDto[] = [];
    SelecteddemandListAll: demandsListDto[] = [];
    demandTransList: demandTransList[] = [];
    demandTransListlast: demandTransList[] = [];
    selecteDemandList: demandProductsListDto[] = [];
    productdescription: ProductDescriptionsDto[] = [];
    productss: demandProductsListDto;
    demandss: demandsListDto;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    quantityInput: string = '';
    products$: Observable<demandProductsListDto[]>;
    isLoading: boolean = false;
    brands: InventoryBrand[];
    categories: InventoryCategory[];
    filteredTags: InventoryTag[];
    flashMessage: 'success' | 'error' | null = null;
    // isLoading: boolean = false;
    pagination: InventoryPagination;
    //searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedProduct: demandProductsListDto | null = null;
    selectedDemand: demandsListDto | null = null;
    selectedDemandForm: UntypedFormGroup;
    tags: InventoryTag[];
    tagsEditMode: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _dialogRef: any;
    public remmemberselected;
    private quantityAdet;
    seclest: UntypedFormGroup;
    supplierscards: suppliersListDto[] = [];
    productsList: demandProductsListDto[] = [];

    stateNumber: number = 2;
    constructor(
        private demandProductsService: DemandProductsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private productDescriptionService: ProductDescriptionService,
        private _dialog: MatDialog,
        private _suppliersService: SuppliersService,
    ) { }


    ngOnInit(): void {

        this.selectedDemandForm = this._formBuilder.group({
            id: ['', Validators.required],
            date: ['', Validators.required],
            documentno: ['', Validators.required],
            suppliers: ['', Validators.required],
            deliverydate: ['', Validators.required],
            note: ['', Validators.required],
            state: [0]
        });

        this.getProducts();
        this.getDemands();
        this.getDemandsTedarikci();
        this.getDemandProducts();


    }
    getProducts() {
        this.productDescriptionService.GetProductDescriptionList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    this.productdescription = response.data;
                    this.cdr.markForCheck();
                }
            });

    }
    getDemandProducts() {

        const demandProductItem = new demandTransList(
            this.selectedDemand.id,
            '00000000-0000-0000-0000-000000000000',
            0,
            0,
            0,
            0,
            0,
            0,
            '0',
            '00000000-0000-0000-0000-000000000000',
            'taxisId'
        );
        //this.getTransforid.id = ;


        this.demandProductsService.getDemandTransList(demandProductItem)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    this.demandTransListlast = response.data
                    this.demandTransList = this.demandTransListlast.filter(x => x.ownerId === this.selectedDemand.id);
                    this.cdr.markForCheck();
                    console.log(this.demandTransList);
                    // Diğer işlemleri burada gerçekleştirin.
                }
            });

    }
    getDemandsTedarikci() {
        this._suppliersService.getSuppliersList().subscribe((response) => {
            this.supplierscards = response.data;
            console.log(this.supplierscards);
        });
    }


    onQuantitySelectionChange(event: any): void {
        const inputValue = parseFloat(this.getFormValueByName('stockState'));
        const productIdvalue = this.getFormValueByName('productId');

        if (inputValue !== null) {
            const selectedProductId = inputValue; // Seçilen ürünün id değeri
            //const id = 
            const selectedProducts = this.productdescription.find(product => product.id === productIdvalue);
            var total = (selectedProducts.buyingIncludeKDV !== true ? inputValue * (selectedProducts.buyingPrice * (1 + (selectedProducts.ratio / 100))) : inputValue * selectedProducts.buyingPrice);
            var vatSumCalc = total * (1 + (selectedProducts.ratio / 100));
            var vatSum = vatSumCalc - total;
            if (selectedProducts) {
                this.selectedDemandForm.patchValue({
                    reserved: total.toFixed(2),
                    amount: vatSum.toFixed(2),
                    //isActive: selectedProducts.active=== true ? 1 : 0
                });

            }
        }

    }
    getDemands() {
        // this.demandProductsService.getDemandProductsList().subscribe((response) => {
        //     if (response && response.data) {
        //         this.productsList = response.data;
        //         console.log(this.productsList);
        //         // Diğer işlemleri burada gerçekleştirin.
        //     }
        this.demandProductsService.getDemandLists()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    this.demandList = response.data;
                    this.cdr.markForCheck();
                    console.log(this.demandList);
                    // Diğer işlemleri burada gerçekleştirin.
                }
            });

    }
    addDemandComplate(demandId: string) {
        debugger;

        Swal.fire({
            title: 'Onaylıyor musunuz?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet',
            cancelButtonText: 'Hayır'
        }).then((result) => {
            if (result.isConfirmed) {
                this.stateNumber = 1;
                var demand = this.demandList.find(x => x.id === demandId);

                this.selectedDemand = demand;
                //this.getDemands();
                debugger;
                this.selectedDemandForm.patchValue(demand);
                //  this.cdr.markForCheck();
                debugger;
                const selectRow = this.selectedDemandForm.getRawValue();
                // this.SelecteddemandListAll  = this.demandList.filter(x => x.selected === true);
                this.demandProductsService.updateDemands(selectRow).subscribe(
                    (response) => {
                        if (response.isSuccessful) {
                            this.showSweetAlert('success');
                            this.getDemands();
                            this._changeDetectorRef.markForCheck();
                            this.stateNumber = 2;
                        } else {
                            this.showSweetAlert('error');
                        }
                    },
                    (err) => {
                        console.log(err);
                    }
                );

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Kullanıcı "Hayır" butonuna bastı
                this.stateNumber = 2
                return;
            }
        });




    }
    deleteDemandComplate(demandId: string) {
        Swal.fire({
            title: 'İlgili kayıt silinecektir. Onaylıyor musunuz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet',
            cancelButtonText: 'Hayır'
        }).then((result) => {
            if (result.isConfirmed) {
                this.stateNumber = 1;
                var demand = this.demandList.find(x => x.id === demandId);

                this.selectedDemand = demand;
                //    this.getDemandProducts();
                this.selectedDemandForm.patchValue(demand);
                this.cdr.markForCheck();
                debugger;
                const selectRow = this.selectedDemandForm.getRawValue();
                // this.SelecteddemandListAll  = this.demandList.filter(x => x.selected === true);
                this.demandProductsService.deleteDemands(selectRow).subscribe(
                    (response) => {
                        if (response.isSuccessful) {
                            this.showSweetAlert('success');
                            this.getDemands();
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this.showSweetAlert('error');
                        }
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Kullanıcı "Hayır" butonuna bastı
                return;
            }
        });
    }
    /**
       * After view init
       */
    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
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
                    this.closeDetails();
                });
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this.demandList;
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();

        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle product details
     *
     * @param productId
     */
    toggleDetails(demandId: string): void {
        // If the product is already selected...
        if (this.selectedDemand && this.selectedDemand.id === demandId) {
            // Close the details
            this.closeDetails();
            return;
        }
        debugger;
        // Get the product by id
        this.stateNumber = 2;
        var demand = this.demandList.find(x => x.id === demandId);
        //   this.demandProductsService.getProductById(productId)
        //       .subscribe((product) => {
        //           // Set the selected product
        this.selectedDemand = demand;
        this.getDemandProducts();
        //this.demandTransList = this.demandTransListlast.filter(x=>x.ownerId === this.selectedDemand.id);
        //           // Fill the form
        this.selectedDemandForm.patchValue(demand);

        //           // Mark for check
        this.cdr.markForCheck();
        //       });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedDemand = null;
    }

    /**
     * Cycle through images of selected product
     */

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredTags.length === 0) {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];

    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void {
        const tag = {
            title
        };

    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: InventoryTag, event): void {
        tag.title = event.target.value;

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: InventoryTag): void {
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the product
     *
     * @param tag
     */
    addTagToProduct(tag: InventoryTag): void {
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the product
     *
     * @param tag
     */
    removeTagFromProduct(tag: InventoryTag): void {
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle product tag
     *
     * @param tag
     * @param change
     */
    toggleProductTag(tag: InventoryTag, change: MatCheckboxChange): void {
        if (change.checked) {
            this.addTagToProduct(tag);
        }
        else {
            this.removeTagFromProduct(tag);
        }
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    /**
     * Create product
     */
    getFormValueByName(formName: string): any {
        return this.selectedDemandForm.get(formName).value;
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

    /**
     * Update the selected product using the form data
     */


    /**
     * Delete the selected product using the form data
     */


    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
