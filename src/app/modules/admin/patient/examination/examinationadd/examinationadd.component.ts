import {
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    inject,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    UntypedFormBuilder,
    Validators,
} from '@angular/forms';
import { PatientDetails } from '../../../customer/models/PatientDetailsCommand';
import { customersListDto } from '../../../customer/models/customersListDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { Observable, Subject, zip } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { ExaminationDto } from '../model/ExaminationDto';
import { TranslocoService } from '@ngneat/transloco';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExaminationService } from 'app/core/services/examination/exammination.service';
import { SalesDto } from 'app/modules/admin/customer/customerdetails/dialogs/sales-dialog/models/salesDto';
import { v4 as uuidv4 } from 'uuid';
import { ProductDescriptionsDto } from 'app/modules/admin/definition/productdescription/models/ProductDescriptionsDto';
import { TaxesDto } from 'app/modules/admin/definition/taxes/models/taxesDto';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';

@Component({
    selector: 'app-examinationadd',
    templateUrl: './examinationadd.component.html',
    styleUrls: ['./examinationadd.component.css'],
})
export class ExaminationaddComponent implements OnInit {
    examinationForm: FormGroup;

    patientList: PatientDetails[] = [];
    customers: customersListDto[] = [];
    @ViewChild('myPanel') myPanel: MatExpansionPanel;
    @ViewChild('symptomInput') symptomInput: ElementRef<HTMLInputElement>;
    selectedCustomerId: any;
    panelOpenState = false;
    selectedOption: string;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    symptomCtrl = new FormControl('');
    filteredSymptoms: Observable<string[]>;
    symptoms: string[] = [];
    allSymptoms: string[] = [];
    lastSelectedValue: Date = new Date();
    now: Date = new Date();
    addOnBlur = true;
    announcer = inject(LiveAnnouncer);
    symptomsString: string;
    selectedState: string;
    states: string[] = ['Aktif', 'Tamamlandı', 'Bekliyor'];
    loader = true;
    shortcut: Shortcut;

    addEnabled: boolean = true;
    visibleCustomer: boolean;
    private _dialogRef: any;

    displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'discount', 'vat', 'total', 'taxTotal', 'actions'];
    dataSource: SalesDto[] = [];

    products: ProductDescriptionsDto[] = [];
    taxisList: TaxesDto[] = [];
    destroy$: Subject<boolean> = new Subject<boolean>();
    isPrice: boolean = false;

    formGroup: FormGroup;

    discountedTotalAmount: number = 0;

    constructor(
        private _customerService: CustomerService,
        private _formBuilder: UntypedFormBuilder,
        private _translocoService: TranslocoService,
        private _examinationService: ExaminationService,
        private _taxisService: TaxisService,
        private _productdescriptionService: ProductDescriptionService,
        private _shortcutsService: ShortcutsService
    ) {
        this.selectedState = this.states[0];
        this.filteredSymptoms = this.symptomCtrl.valueChanges.pipe(
            startWith(null),
            map((symptom: string | null) =>
                symptom ? this._filter(symptom) : this.allSymptoms.slice()
            )
        );
    }

    ngOnInit() {
        this.getCustomerList();
        this.getSymptomsList();


        zip(
            this.getTaxisList(),
            this.getProductList()
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setTaxis(value[0]),
                    this.setProductList(value[1])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                //this.fillFormData(this.selectedsales);

                this.loader = false;
            }
        });

        this.examinationForm = this._formBuilder.group({
            customerId: ['', Validators.required],
            patientId: ['', Validators.required],
            bodyTemperature: [''],
            pulse: [''],
            respiratoryRate: [''],
            weight: [''],
            complaintAndHistory: [''],
            treatmentDescription: [''],
            selectedState: [this.states[0]],
            isPrice: [false],
            price: [0],
            remark : ['']
        });

       
    }

    getCustomerList() {
        let model = {
            IsArchive : false
        }
        this._customerService.getcustomerlist(model).subscribe((response) => {
            this.customers = response.data;
        });
    }

    getSymptomsList() {
        this._examinationService.getSymptomlist().subscribe((response) => {
            this.allSymptoms = response.data;
        });
    }

    getPatientList() {
        this._customerService
            .getPatientsByCustomerId(this.customers[0].id)
            .subscribe((response) => {
                this.patientList = response.data;
            });
    }

    getFormValueByName(formName: string): any {
        return this.examinationForm.get(formName).value;
    }

    examinationadd(): void {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.examinationAreSure'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    this.symptomsString = this.symptoms.join(', ');
                    debugger;
                    const item = new ExaminationDto(
                        this.lastSelectedValue,
                        this.getFormValueByName('selectedState') === null ? '' : this.getFormValueByName('selectedState'),
                        this.getFormValueByName('customerId') === undefined || this.getFormValueByName('customerId') === null || this.getFormValueByName('customerId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('customerId'),
                        this.getFormValueByName('patientId') === undefined || this.getFormValueByName('patientId') === null || this.getFormValueByName('patientId') === '' ? '00000000-0000-0000-0000-000000000000' : this.getFormValueByName('patientId'),
                        this.getFormValueByName('bodyTemperature') === null ? '' : this.getFormValueByName('bodyTemperature'),
                        this.getFormValueByName('pulse') === null ? '' : this.getFormValueByName('pulse'),
                        this.getFormValueByName('respiratoryRate') === null ? '' : this.getFormValueByName('respiratoryRate'),
                        this.getFormValueByName('weight') === null ? '' : this.getFormValueByName('weight'),
                        this.getFormValueByName('complaintAndHistory') === null ? '' : this.getFormValueByName('complaintAndHistory'),
                        this.getFormValueByName('treatmentDescription') === null ? '' : this.getFormValueByName('treatmentDescription'),
                        this.symptomsString,
                        this.getFormValueByName('isPrice'),
                        this.getFormValueByName('price'),
                        this.dataSource
                    );

                    this._examinationService.createExamination(item).subscribe(
                        (response) => {
                            if (response.isSuccessful) {
                                this.showSweetAlert('success');
                                this.symptoms = [];
                                this.selectedState = this.states[0];
                                this.examinationForm.reset();
                                this.clearInputField();
                                this.dataSource = [];
                                this.myPanel.close();
                                this.examinationForm
                                    .get('selectedState')
                                    .patchValue(this.selectedState);
                                this.togglePriceInput(false);
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
            }
        );
    }

    addToShortCuts() {
        this.shortcut = {
            id: '',
            label: '',
            icon: '',
            link: '',
            useRouter: true
        };

        this.shortcut.description = "Yeni Muayene Ekle";
        this.shortcut.label = "Yeni Muayene Ekle";
        this.shortcut.icon = "heroicons_outline:plus";
        this.shortcut.link = "/examinationadd";

        this._shortcutsService.create(this.shortcut).subscribe();
    }
    
    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    clearInputField() {
        // Input alanını temizleme
        const inputField = document.getElementById(
            'fruitInput'
        ) as HTMLInputElement;
        if (inputField) {
            inputField.value = '';
        }
    }

    handleCustomerChange(event: any) {
        const model = {
            id: event.value,
        };
        if (model.id == undefined) {
            model.id = event;
        }

        this._customerService
            .getPatientsByCustomerId(model)
            .subscribe((response) => {
                this.patientList = response.data;
                if (this.patientList.length === 1) {
                    this.examinationForm
                        .get('patientId')
                        .patchValue(this.patientList[0].id);
                }
            });
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        var varMi = this.allSymptoms.some((symptom) =>
            symptom.toLowerCase().startsWith(value.toLowerCase())
        );
        event.chipInput!.clear();
        if (varMi) {
            return;
        }
        if (value) {
            this.symptoms.push(value);
        }



        this.symptomCtrl.setValue(null);
    }

    remove(symptom: string): void {
        const index = this.symptoms.indexOf(symptom);

        if (index >= 0) {
            this.symptoms.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        if (!this.symptoms.includes(event.option.viewValue)) {
            this.symptoms.push(event.option.viewValue);
        }
        this.symptomInput.nativeElement.value = '';
        this.symptomCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allSymptoms.filter((symptom) =>
            symptom.toLowerCase().includes(filterValue)
        );
    }

    handleValueChange(e) {
        this.lastSelectedValue = e.value; // Son seçilen değeri saklıyoruz
        console.log('Yeni tarih ve saat: ', this.lastSelectedValue);
        // Yeni değeri kullanmak için burada işlemler yapabilirsiniz
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

    addRow() {
        const newRow: SalesDto = { id: uuidv4(), product: '', quantity: 1, unit: 'Adet', unitPrice: 0, discount: 0, vat: 'Yok', netPrice: 0, netVat: 0 };
        this.dataSource = [...this.dataSource, newRow];
    }

    removeRow(element: SalesDto) {
        this.dataSource = this.dataSource.filter(e => e !== element);
    }


    calculateTotal(element: SalesDto): number {
        const price = element.quantity * element.unitPrice;
        const discount = element.discount || 0;
        let totalPrice = price - discount;

        let calcvat = 0;
        if (element.vat !== "Yok") {
            const price = element.quantity * element.unitPrice;
            const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio; //element.vat === '8%' ? 0.08 : element.vat === '18%' ? 0.18 : 0;
            const inculeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

            if (price > 0 && vatRate > 0) {
                if (inculeKDV) {
                    let basePrice = price / (1 + (vatRate / 100))
                    calcvat = price - basePrice;
                    totalPrice = totalPrice - calcvat;
                } else {
                    calcvat = (price * vatRate) / 100
                    totalPrice = totalPrice;
                }
            }
        }
        element.netPrice = totalPrice;

        return totalPrice;
    }

    calculateSubtotal(): number {
        return this.dataSource.reduce((acc, element) => acc + (element.quantity * element.netPrice - (element.discount || 0)), 0);
    }

    calculateVatRow(element: SalesDto): number {
        if (element.vat !== "Yok") {
            const price = element.quantity * element.unitPrice;
            const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio;
            const includeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

            let calcvat = 0;
            if (price > 0 && vatRate > 0) {
                if (includeKDV) {
                    const basePrice = price / (1 + (vatRate / 100));
                    calcvat = price - basePrice;
                } else {
                    calcvat = (price * vatRate) / 100;
                }
            }
            element.netVat = calcvat;

            return calcvat;
        }
    }

    calculateVat(): number {
        return this.dataSource.reduce((acc, element) => {
            if (element.vat !== "Yok") {
                const price = element.quantity * element.unitPrice;
                const vatRate = this.taxisList.find(x => x.id === element.vat).taxRatio;
                const includeKDV = this.products.find(x => x.id === element.product).sellingIncludeKDV;

                let calcvat = 0;
                if (price > 0 && vatRate > 0) {
                    if (includeKDV) {
                        const basePrice = price / (1 + (vatRate / 100));
                        calcvat = price - basePrice;
                    } else {
                        calcvat = (price * vatRate) / 100;
                    }
                }
                element.netVat = calcvat;

                return acc + calcvat;
            }
            return acc;
        }, 0);
    }

    calculateTotalAmount(): number {
        return this.calculateSubtotal() + this.calculateVat();
    }

    getTaxisList(): Observable<any> {
        return this._taxisService.getTaxisList();
    }

    setTaxis(response: any): void {
        if (response.data) {
            this.taxisList = response.data;
        }
    }

    getProductList(): Observable<any> {
        const model = {
            ProductType: 1,
        };
        return this._productdescriptionService.getProductDescriptionFilters(model);
    }

    setProductList(response: any): void {
        this.products = response.data;
    }

    onProductSelectionChange(element: SalesDto): void {
        const selectedProduct = this.products.find(product => product.id === element.product);
        element.unitPrice = selectedProduct ? selectedProduct.sellingPrice : null;
        element.vat = selectedProduct ? selectedProduct.taxisId : null;
    }


    togglePriceInput(checked: boolean) {
        if (checked) {
            this.isPrice = true;
        } else {
            this.isPrice = false;
        }
    }

    applyDiscount() {
        const subtotal = this.calculateSubtotal();
        const vat = this.calculateVat();
        const totalAmount = subtotal + vat;
        const discountAmount = totalAmount * 0.25;
        this.discountedTotalAmount =  discountAmount;
    }


}
