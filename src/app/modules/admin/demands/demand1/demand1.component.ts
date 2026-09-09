import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, debounceTime, map, merge, switchMap, takeUntil } from 'rxjs';
import { DemandProductsService } from 'app/core/services/Demands/DemandProducts/demandproducts.service'; // ProductService'nin gerçek adını ve yolunu belirtmelisiniz
import { InventoryCategory, demandProductsListDto } from './models/demandProductsListDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InventoryBrand, InventoryPagination, InventoryTag, InventoryVendor } from '../../customer/models/PatientDetailsCommand';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { fuseAnimations } from '@fuse/animations';
import { CreateDemandProductsCommand } from './models/CreateDemandProductsCommand';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { RepositionScrollStrategy } from '@angular/cdk/overlay';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { ProductDescriptionsDto } from '../../definition/productdescription/models/ProductDescriptionsDto';
import { CreateEditDemandDialogComponent } from '../dialogs/create-edit-demand';
import { MatDialog } from '@angular/material/dialog';
import { Demand2Component } from '../demand2/demand2.component';
import { TaxesDto } from '../../definition/taxes/models/taxesDto';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
@Component({
    selector: 'app-demand1',
    template: './demand1/demand1.component.html',
    templateUrl: './demand1.component.html',
    styles: [
        /* language=SCSS */
        `
        .inventory-grid {
            grid-template-columns: 48px auto 40px;

            @screen sm {
                grid-template-columns: 96px auto 112px 72px;
            }

            @screen md {
                grid-template-columns: 48px 112px auto 112px 72px;
            }

            @screen lg {
                grid-template-columns: 48px 112px auto 112px 96px 96px 72px 72px;
            }
        }
    `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})


export class Demand1Component implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(CreateEditDemandDialogComponent) CreateEditDemandDialogComponent: CreateEditDemandDialogComponent;
    @ViewChild(Demand2Component) demand2Component: Demand2Component;


    //[x: string]: any;
    displayedColumns: string[] = [
        'name',
        'categoryCode',
        'actions',
    ];
    // products$: Observable<any>; 
    productsList: demandProductsListDto[] = [];
    selecteDemandList: demandProductsListDto[] = [];
    productdescription: ProductDescriptionsDto[] = [];
    productss: demandProductsListDto;
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
    selectedProductForm: UntypedFormGroup;
    tags: InventoryTag[];
    tagsEditMode: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _dialogRef: any;
    public remmemberselected;
    private quantityAdet;
    seclest : UntypedFormGroup;
    loader=true;
    items = Array(13);
    taxisList: TaxesDto[] = [];

    constructor(
        private demandProductsService: DemandProductsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private productDescriptionService: ProductDescriptionService,
        private _dialog: MatDialog,
        private _taxisService: TaxisService,

    ) { }


    ngOnInit(): void {
        this.getTaxisList()
        this.getProducts();
        this.getDemandProducts();
        this.selectedProductForm = this._formBuilder.group({
            id: ['', Validators.required],
            productId: ['', Validators.required],
            barcode: [''],
            stockState: [0],
            reserved: [0],
            unitPrice: [0],
            amount: [0],
            isActive: [{ value: 0, disabled: true }],
            quantity: [0],
            taxisId: ['']
            //cost             : [''],
            //brand            : [''],
            //taxPercent       : [''],
            //thumbnail        : [''],
            // category       : [''],
            // description    : [''],
            // tags           : [[]],
            // sku            : [''],
            // vendor         : [''],
            // weight         : [''],
            // images         : [[]],
            // currentImageIndex: [0],
            // Image index that is currently being viewed

        });




    }
    getTaxisList() {
        this._taxisService.getTaxisList().subscribe((response) => {
            this.taxisList = response.data;
        });

    }
    isActiveClick(): void {
        const productIdvalue = this.getFormValueByName('productId');
        const selectedProducts = this.productdescription.find(product => product.id === productIdvalue);
        this.selectedProduct.isActive = selectedProducts.active == true ? 1 : 0;
        //this.selectedProductForm.get('isActive').value === selectedProducts.active == true ? 1 : 0;
        //this.selectedProductForm.patchValue(product);
        this._changeDetectorRef.markForCheck();
    }
    onProductSelectionChange(event: any): void {
        debugger;
        const selectedProductId = event.value; // Seçilen ürünün id değeri
        const selectedProducts = this.productdescription.find(product => product.id === selectedProductId);
        if (selectedProducts !== null) {
            var total = (selectedProducts.buyingIncludeKDV !== true ? selectedProducts.buyingPrice * (1 + (selectedProducts.ratio / 100)) : selectedProducts.buyingPrice);
            var vatSumCalc = total * (1 + (selectedProducts.ratio / 100));
            var vatSum = vatSumCalc - total;

            if (selectedProducts) {
                this.selectedProductForm.patchValue({
                    taxisId: 0
                });
                this.selectedProductForm.patchValue({

                    productId: selectedProductId,
                    barcode: selectedProducts.productBarcode,
                    isActive: (selectedProducts.active === true ? 1 : 0),

                    unitPrice: selectedProducts.buyingPrice,
                    stockState: 0,
                    reserved: 0,
                    amount: 0,
                    taxisId: selectedProducts.taxisId == null ? 0 : selectedProducts.taxisId
                });
                this.selectedProduct.isActive = selectedProducts.active == true ? 1 : 0;

                // this.selectedProduct.isActive
                //this.selectedProductForm.get('isActive').value === selectedProducts.active == true ? 1 : 0;
                this.quantityAdet = selectedProducts.id;
            }
        }

    }
    onQuantitySelectionChange(event: any): void {
        const inputValue = parseFloat(this.getFormValueByName('stockState'));
        const productIdvalue = this.getFormValueByName('productId');
        debugger;
        if (inputValue !== null) {
            const selectedProductId = inputValue; // Seçilen ürünün id değeri
            //const id = 
            const selectedProducts = this.productdescription.find(product => product.id === productIdvalue);
            var total = (selectedProducts.buyingIncludeKDV !== true ? inputValue * (selectedProducts.buyingPrice * (1 + (selectedProducts.ratio / 100))) : inputValue * selectedProducts.buyingPrice);
            var vatSumCalc = total * (1 + (selectedProducts.ratio / 100));
            var vatSum = vatSumCalc - total;
            if (selectedProducts) {
                this.selectedProductForm.patchValue({
                    reserved: total.toFixed(2),
                    // taxisId: selectedProducts.taxisId,
                    //isActive: selectedProducts.active=== true ? 1 : 0
                });

            }
        }

    }
    onSelectionChange(event: any) {
        event.source.writeValue(event.source.value); // Seçimi iptal et
    }
    
    getDemandProducts() {

        this.demandProductsService.getDemandProductsList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.loader=false;
                debugger;
                if (response && response.data) {
                    this.productsList = response.data;
                    this.cdr.markForCheck();
                    console.log(this.productsList);
                    // Diğer işlemleri burada gerçekleştirin.
                }
            });
        
    }
    getProducts() {
        this.productDescriptionService.GetProductDescriptionList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    debugger;
                    this.productdescription = response.data;
                    this.cdr.markForCheck();
                }
            });

    }
    getTaxRatio(): string {
        // Mevcut taxisId değerini al
        const selectedTaxisId = this.selectedProductForm.get('taxisId')?.value;
        
        // taxisList içinde selectedTaxisId ile eşleşen öğeyi bul
        const selectedItem = this.taxisList.find(item => item.id === selectedTaxisId);
        
        // Eğer öğe bulunursa taxRatio'yu döndür, yoksa '0' döndür
        return selectedItem ? selectedItem.taxRatio.toString() : '0';
    }
    onCellValueChanged(newValue: string): void {
        debugger;
        const selectedTaxisId = this.selectedProductForm.get('taxisId')?.value;
        const selectedItem = this.taxisList.find(item => item.id === selectedTaxisId);

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
                    return this.productsList;
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
            if (this.demand2Component) {
                this.demand2Component.getDemands();
            }
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
    toggleDetails(productId: string): void {
        // If the product is already selected...
        if (this.selectedProduct && this.selectedProduct.id === productId) {
            // Close the details
            this.closeDetails();
            return;
        }
        // Get the product by id
        var product = this.productsList.find(x => x.id === productId);
        //   this.demandProductsService.getProductById(productId)
        //       .subscribe((product) => {
        //           // Set the selected product
        this.selectedProduct = product;
        debugger;
        this.getDemandProducts();
        //           // Fill the form
        this.selectedProductForm.patchValue(product);

        //           // Mark for check
        this._changeDetectorRef.markForCheck();
        //       });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
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
        return this.selectedProductForm.get(formName).value;
    }
    addDemand(): void {
        this.selecteDemandList = this.productsList.filter(x => x.selected === true);
        if (this.selecteDemandList.length === 0) {
            const sweetAlertDto = new SweetAlertDto(
                'Uyarı!',
                'Lütfen satır seçiniz!',
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return;

        }
        const falseState = this.selecteDemandList.filter(x => x.productId === "00000000-0000-0000-0000-000000000000");
        if (falseState.length > 0) {
            const sweetAlertDto = new SweetAlertDto(
                'Uyarı!',
                'Ürün Seçilmeyen satır/satırlar mevcuttur. Lütfen seçili satır/satırları kontrol ediniz.',
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return;
        }
        if (this.selecteDemandList.length > 0) {
            // Önce fonksiyonu çağır ve ardından dialog penceresini aç

            const dialog = this._dialog
                .open(CreateEditDemandDialogComponent, {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: this.selecteDemandList,
                })
                .afterClosed()
                .subscribe((response) => {
                    // Dialog kapatıldığında çalışacak kod bloğu
                    if (response.status) {
                        this.getDemandProducts();
                        //this.getDemandProducts();
                        //this.demand2Component.getDemands();

                        // Gerekirse burada başka işlemler yapabilirsiniz
                    }
                });
            //this.CreateEditDemandDialogComponent.selectedDemandList = this.selecteDemandList
            // this.CreateEditDemandDialogComponent.addDemandProductList(this.selecteDemandList);
        }
    }

    createProduct(): void {

        const demandProductItem = new CreateDemandProductsCommand(
            '00000000-0000-0000-0000-000000000000',
            0,
            0,
            0,
            0,
            0,
            0,
            '0'
        );

        var proid;
        this.demandProductsService.createDemandProduct(demandProductItem).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    // this.getSuppliers();
                    proid = response.data.id;
                    this.getlist(proid);
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );


        //this.getSuppliers();


    }

    getlist(proid: string): void {
        this.selectedProductForm = this._formBuilder.group({
            id: ['', Validators.required],
            productId: ['', Validators.required],
            barcode: ['', Validators.required],
            stockState: [0],
            reserved: [0],
            unitPrice: [0],
            amount: [0],
            isActive: [{ value: 0, disabled: true }],
            quantity: [0],
            taxisId: ['']

        });
        var product;
        this.demandProductsService.getDemandProductsList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.data) {
                    //this.getSuppliers();
                    //proid = response.data.id;
                    this.productsList = response.data
                    product = this.productsList.find(x => x.id === proid);
                    if (product) {
                        this.selectedProduct = product;
                        this.getDemandProducts();
                        //this.selectedProductForm = this.seclest;
                        this.selectedProductForm.patchValue(product);
                        this._changeDetectorRef.markForCheck();
                    }
                    // this.selectedProduct = product;
                    // //this.selectedProductForm.patchValue(product)
                    // this.cdr.detectChanges();
                    // debugger;
                    // this.selectedProductForm.patchValue(product);

                }
            });

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
    updateSelectedProduct(): void {
        // Get the product object
        const product = this.selectedProductForm.getRawValue();
        if (product != null) {
            product.isActive = product.isActive == true ? 1 : 0;
            // product.productId = this.productdescription.id;

            //product.productId = this.selectedProductForm.get('id').value;
        }

        this.demandProductsService.updateDemandProduct(product).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this.getDemandProducts();
                    this._changeDetectorRef.markForCheck();
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    /**
     * Delete the selected product using the form data
     */
    deleteSelectedProduct(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Ürün Silinecektir!',
            message: 'Bu ürünü kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }

        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {

                // Get the product object
                const product = this.selectedProductForm.getRawValue();
                // Delete the product on the server
                this.demandProductsService.deleteDemandProduct(product).subscribe((response) => {

                    // Close the details
                    if (response.isSuccessful) {
                        this.getDemandProducts();
                        this._changeDetectorRef.markForCheck();
                        this.showSweetAlert('success');
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this.showSweetAlert('error');
                    }

                });
            }
        });
    }

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
