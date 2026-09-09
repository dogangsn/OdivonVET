import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';

import {
    FormControl,
    FormGroup,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';

import { CreateCustomerCommand } from '../models/CreateCustomerCommand';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    Observable,
    Subject,
    debounceTime,
    map,
    merge,
    switchMap,
    takeUntil,
} from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    InventoryBrand,
    InventoryPagination,
    InventoryTag,
    InventoryVendor,
    PatientDetails,
    SexTYpe,
} from '../models/PatientDetailsCommand';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { fuseAnimations } from '@fuse/animations';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { CustomerGroupListDto } from '../../definition/customergroup/models/customerGroupListDto';
import { v4 as uuidv4 } from 'uuid';
import { AnimalColorsDefListDto } from '../models/AnimalColorsDefListDto';
import { AnimalColorsDefService } from 'app/core/services/definition/animalColorsDef/animalColorsDef.service';
import { VetAnimalBreedsDefDto } from '../models/VetAnimalBreedsDefDto';
import { VetVetAnimalsTypeListDto } from '../models/VetVetAnimalsTypeListDto';
import { Duration } from 'luxon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditAnimalsColorDialogComponent } from './dialog/create-edit-animalscolor';
import { CityService } from 'app/core/services/assetsService/cityService.service';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';

@Component({
    selector: 'customeradd',
    templateUrl: './customeradd.component.html',
    styles: [
        /* language=SCSS */
        `
            .inventory-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class CustomeraddComponent implements OnInit, AfterViewInit, OnDestroy {
    accountForm: FormGroup;

    customers: CreateCustomerCommand = new CreateCustomerCommand();
    patients: PatientDetails[];

    customergroupList: CustomerGroupListDto[] = [];
    animalcolorDefList: AnimalColorsDefListDto[] = [];
    animalTypesList: VetVetAnimalsTypeListDto[] = [];
    animalBreedsDef: VetAnimalBreedsDefDto[] = [];

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    brands: InventoryBrand[];
    sextype: SexTYpe[];
    filteredTags: VetAnimalBreedsDefDto[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: InventoryPagination;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedPatients: PatientDetails | null = null;
    selectedPatientDetailsForm: UntypedFormGroup;
    tags: InventoryTag[];
    tagsEditMode: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedValue: string;
    AnimalTypeControl: FormControl = new FormControl();
    cities: any[] = [];
    district: any[] = [];
    selectedCityValue: string;
    shortcut : Shortcut;
    //

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _customerService: CustomerService,
        private _translocoService: TranslocoService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _customergroup: CustomerGroupService,
        private _animalColorDefService: AnimalColorsDefService,
        private router: Router,
        private route: ActivatedRoute,
        private _dialog: MatDialog,
        private _cityService: CityService,
        private _shortcutsService: ShortcutsService
    ) { }

    ngOnInit() {

        this.patients = [];
        this.getCustomerGroupList();
        this.getAnimalColorsDefList();
        this.getAnimalTypesList();
        this.getAnimalBreedsDefList();

        this._cityService.getCities().subscribe(data => {
            this.cities = data;
        });

        this.accountForm = this._formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            phoneNumber2: [''],
            eMail: ['', [Validators.email]],
            taxOffice: [''],
            vKNTCNo: [''],
            note: [''],
            discountRate: [0],
            isEmail: false,
            isPhone: false,
            province: [''],
            district: [''],
            longAdress: [''],
            customergroup : ['']
        });

        //
        this.selectedPatientDetailsForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            birthDate: [''],
            chipNumber: [''],
            sex: [1],
            animalType: [0],
            animalBreed: [''],
            animalColor: [''],
            reportNumber: [''],
            specialNote: [''],
            sterilization: [''],
            images: [[]],
            active: [false],
        });

        this.brands = brands;
        this.sextype = sextype;
        this.patients = products;
        this.tags = tags;

        this.AnimalTypeControl.valueChanges.subscribe((selectedVendor) => {
            this.filterTagsByVendor(selectedVendor);
        });
        this.patients = [];
        console.log(this.patients);
    }

    filterTagsByVendor(selectedVendor: any) {

        console.log(selectedVendor.value);
        const selectedValue = selectedVendor.value;
        // Seçilen vendor'a ait tagleri filtrele
        this.filteredTags = this.animalBreedsDef.filter(
            (tag) => tag.animaltype == selectedValue
        );
        this.animalBreedsDef.forEach((tag) => {
            tag.isSelected = false;
        });
        this.selectedPatientDetailsForm.get('animalBreed').setValue(null);
        this.selectedPatients.animalBreed = null;
    }

    getFormValueByName(formName: string): any {
        return this.accountForm.get(formName).value;
    }

    fillSelectedInvoice(): boolean {
        const firstName = this.getFormValueByName('firstName');
        if (!firstName || firstName === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Hasta Sahibi Adı Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }

        if (this.patients.length == 0 || this.patients === null) {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate('Hasta Bilgisi Giriniz.'),
                SweetalertType.warning
            );
            GeneralService.sweetAlert(sweetAlertDto);
            return false;
        }

        this.customers.firstName = this.getFormValueByName('firstName');
        this.customers.lastName = this.getFormValueByName('lastName');
        this.customers.phoneNumber = this.getFormValueByName('phoneNumber');
        this.customers.phoneNumber2 = this.getFormValueByName('phoneNumber2');
        this.customers.eMail = this.getFormValueByName('eMail');
        this.customers.taxOffice = this.getFormValueByName('taxOffice');
        this.customers.vKNTCNo = this.getFormValueByName('vKNTCNo').toString();;
        this.customers.note = this.getFormValueByName('note');
        this.customers.discountRate = this.getFormValueByName('discountRate');
        this.customers.province = this.getFormValueByName('province');
        this.customers.district = this.getFormValueByName('district');
        this.customers.longAdress = this.getFormValueByName('longAdress');
        this.customers.isPhone = this.getFormValueByName('isPhone');
        this.customers.isEmail = this.getFormValueByName('isEmail');
        this.customers.customerGroup = this.getFormValueByName('customergroup')
        this.customers.PatientDetails = this.patients;

        return true;
    }



    saveOpenedPatient(): void {
        if (this.selectedPatients) {
            let selectedProduct = this.patients.find(
                (product) => product.id === this.selectedPatients.id
            );

            selectedProduct.id = this.selectedPatientDetailsForm.value?.id;
            selectedProduct.name =
                this.selectedPatientDetailsForm.value?.name;
            selectedProduct.birthDate =
                this.selectedPatientDetailsForm.value?.birthDate;
            selectedProduct.chipNumber =
                this.selectedPatientDetailsForm.value?.chipNumber;
            selectedProduct.reportNumber =
                this.selectedPatientDetailsForm.value?.reportNumber;
            selectedProduct.specialNote =
                this.selectedPatientDetailsForm.value?.specialNote;
            selectedProduct.sterilization =
                this.selectedPatientDetailsForm.value?.sterilization;
            selectedProduct.sex =
                this.selectedPatientDetailsForm.value?.sex;
            selectedProduct.animalType =
                this.selectedPatientDetailsForm.value?.animalType;
            selectedProduct.animalBreed =
                this.selectedPatientDetailsForm.value?.animalBreed;
            selectedProduct.animalColor =
                this.selectedPatientDetailsForm.value?.animalColor;
            selectedProduct.active =
                this.selectedPatientDetailsForm.value?.active;
            selectedProduct.thumbnail =
                this.selectedPatientDetailsForm.value?.thumbnail;
            selectedProduct.tags =
                this.selectedPatientDetailsForm.value?.tags;
            selectedProduct.images =
                this.selectedPatientDetailsForm.value?.images;
            this.selectedPatientDetailsForm.reset();
            this.selectedPatients = null;
        }



    }






    addCustomers(): any {

        if (this.accountForm.invalid) {
            this.showSweetAlert('error', 'Zorunlu Alanları Doldurunuz.');
            return;
        }
        if (this.fillSelectedInvoice()) {
            this.saveOpenedPatient();

            const model = {
                createcustomers: this.customers,
                IsCreateVaccine: false
            };
            if (!this.phoneNumberValidator(this.customers.phoneNumber)) {
                this.showSweetAlert(
                    'error',
                    'Telefon Numarası Alan Kodu Hatalı. Kontrol Ediniz.'
                );
                return;
            }
            this._customerService.createCustomers(model).subscribe(
                (response) => {
                    if (response.isSuccessful) {
                        const sweetAlertDto = new SweetAlertDto(
                            'Kayıt İşlemi Gerçekleşti',
                            'Müşteri Detay Ekranına Yönlendirilmek İster Misiniz?',
                            SweetalertType.success
                        );
                        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
                            (swalResponse) => {
                                if (swalResponse.isConfirmed) {
                                    this.router.navigate([
                                        'customerlist/customerdetails',
                                        response.data,
                                    ]);
                                }
                            }
                        );
                    } else {

                        this.showSweetAlert('error', response.errors[0]);
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }

    addCustomersWithVaccine(): any {

        if (this.accountForm.invalid) {
            this.showSweetAlert('error', 'Zorunlu Alanları Doldurunuz.');
            return;
        }
        if (this.fillSelectedInvoice()) {
            this.saveOpenedPatient();
            
            const model = {
                createcustomers: this.customers,
                IsCreateVaccine: true
            };
            if (!this.phoneNumberValidator(this.customers.phoneNumber)) {
                this.showSweetAlert(
                    'error',
                    'Telefon Numarası Alan Kodu Hatalı. Kontrol Ediniz.'
                );
                return;
            }
            this._customerService.createCustomers(model).subscribe(
                (response) => {
                    if (response.isSuccessful) {
                        const sweetAlertDto = new SweetAlertDto(
                            'Kayıt İşlemi Gerçekleşti',
                            'Aşı Kayıt Ekranına yönlendirileceksiniz!',
                            SweetalertType.success
                        );
                        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
                            (swalResponse) => {
                                if (swalResponse.isConfirmed) {
                                    this._dialog.closeAll();
                                    this.router.navigate([
                                        'customerlist/createvaccine',
                                        response.data,
                                    ]);
                                }
                            }
                        );
                    } else {

                        this.showSweetAlert('error', response.errors[0]);
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }

    getAnimalColorsDefList() {
        this._animalColorDefService
            .getAnimalColorsDefList()
            .subscribe((response) => {
                this.animalcolorDefList = response.data;
            });
    }

    getAnimalTypesList() {
        this._customerService.getVetVetAnimalsType().subscribe((response) => {
            this.animalTypesList = response.data;
            console.log('anımals', this.animalTypesList);
        });
    }

    getAnimalBreedsDefList() {
        this._customerService.getAnimalBreedsDefList().subscribe((response) => {
            this.animalBreedsDef = response.data;
        });
    }

    showSweetAlert(type: string, text: string): void {
        if (type === 'success') {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.success'),
                this.translate(text),
                SweetalertType.success
            );
            GeneralService.sweetAlert(sweetAlertDto);
        } else {
            const sweetAlertDto = new SweetAlertDto(
                this.translate('sweetalert.error'),
                this.translate(text),
                SweetalertType.error
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    getCustomerGroupList() {
        this._customergroup.getcustomerGroupList().subscribe((response) => {
            this.customergroupList = response.data;
        });
    }

    createPatient(): void {
        let selectedProductIndex = this.patients.findIndex(
            (product) => product.id === this.selectedPatients?.id
        );
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US');
        if (selectedProductIndex !== -1) {
            //selectedProduct = this.selectedPatientDetailsForm.value;

            this.patients[selectedProductIndex] = {
                ...this.selectedPatientDetailsForm.value,
            };
            const newId = uuidv4();

            const newPatient: PatientDetails = {
                id: newId,
                recId: '',
                name: '',
                birthDate: today,
                chipNumber: '',
                reportNumber: '',
                specialNote: '',
                sterilization: false,
                sex: 1,
                animalType: 0,
                animalBreed: null,
                animalColor: 0,
                tags: [],
                images: [],
                active: true,
                thumbnail: '',
            };
            this.selectedPatientDetailsForm.reset(
                this.patients[selectedProductIndex]
            );
        }
        const newId = uuidv4();
        const newPatient: PatientDetails = {
            id: newId,
            recId: '',
            name: '',
            birthDate: today,
            chipNumber: '',
            reportNumber: '',
            specialNote: '',
            sterilization: false,
            sex: 1,
            animalType: 0,
            animalBreed: null,
            animalColor: 0,
            tags: [],
            images: [],
            active: true,
            thumbnail: '',
        };
        this.patients.push(newPatient);
        this.selectedPatients = newPatient;

        this.selectedPatientDetailsForm.patchValue(newPatient);
        this.filteredTags = [];

        //this.tagsEditMode = true;
        //this._changeDetectorRef.markForCheck();
    }

    async toggleDetails(patientId: string): Promise<void> {

        console.log('patiendid', patientId);

        // if (this.selectedPatients && this.selectedPatients.id === patientId) {
        //     this.closeDetails(patientId);
        //     return;
        // }

        await this.closeDetails(patientId);

        // const selectedProduct = this.patients.find(
        //     (product) => product.id === productId
        // );
        // if (selectedProduct) {
        //     this.selectedPatients = selectedProduct;
        //     this.selectedPatientDetailsForm.patchValue(selectedProduct);
        //     this._changeDetectorRef.markForCheck();
        // }
        console.log('selected', this.selectedPatients);
    }

    deleteSelectedProduct(patiendId: any): void {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {

                    const index = this.patients.findIndex(
                        (patient) => patient.id === patiendId
                    );
                    if (index !== -1) {
                        this.patients.splice(index, 1);
                        this.selectedPatients = null;
                        this.selectedPatientDetailsForm.reset();
                    }

                    // const product =
                    //     this.selectedPatientDetailsForm.getRawValue();
                    // const productIndex = this.patients.findIndex(
                    //     (product) => product.id === product.id
                    // );
                    // if (productIndex !== -1) {
                    //     this.patients.splice(productIndex, 1);
                    //     if (
                    //         this.selectedPatients &&
                    //         this.selectedPatients.id === product.id
                    //     ) {
                    //         this.closeDetails(product.id);
                    //     }
                    //     this._changeDetectorRef.markForCheck();
                    // }
                }
            }
        );
    }

    closeDetails(productId?: string): void {
        if (productId) {
            let selectedProduct = this.patients.find(
                (product) => product.id === productId
            );

            if (!this.selectedPatients) {
                selectedProduct = this.patients.find(
                    (product) => product.id === productId
                );
                this.selectedPatients = selectedProduct;


                // selectedProduct.animalType ile eşleşen hayvan türlerini filtreleyin
                this.filteredTags = this.animalBreedsDef.filter(
                    (tag) => tag.animaltype == selectedProduct.animalType
                );

                // selectedProduct.animalBreed ile eşleşen hayvan türünü bulun ve isSelected alanını true yapın
                const value = this.filteredTags.find(x => x.recId == selectedProduct.animalBreed);
                if (value) {
                    value.isSelected = true;
                }

                // Filtrelenmiş ve güncellenmiş listeyi yeniden gösterin
                this.filteredTags = [...this.filteredTags];




                this.selectedPatientDetailsForm.patchValue(selectedProduct);
            } else if (this.selectedPatients?.id !== selectedProduct?.id) {
                selectedProduct = this.patients.find(
                    (product) => product.id === this.selectedPatients.id
                );
                selectedProduct.id = this.selectedPatientDetailsForm.value?.id;
                selectedProduct.name =
                    this.selectedPatientDetailsForm.value?.name;
                selectedProduct.birthDate =
                    this.selectedPatientDetailsForm.value?.birthDate;
                selectedProduct.chipNumber =
                    this.selectedPatientDetailsForm.value?.chipNumber;
                selectedProduct.reportNumber =
                    this.selectedPatientDetailsForm.value?.reportNumber;
                selectedProduct.specialNote =
                    this.selectedPatientDetailsForm.value?.specialNote;
                selectedProduct.sterilization =
                    this.selectedPatientDetailsForm.value?.sterilization;
                selectedProduct.sex =
                    this.selectedPatientDetailsForm.value?.sex;
                selectedProduct.animalType =
                    this.selectedPatientDetailsForm.value?.animalType;
                selectedProduct.animalBreed =
                    this.selectedPatientDetailsForm.value?.animalBreed;
                selectedProduct.animalColor =
                    this.selectedPatientDetailsForm.value?.animalColor;
                selectedProduct.active =
                    this.selectedPatientDetailsForm.value?.active;
                selectedProduct.thumbnail =
                    this.selectedPatientDetailsForm.value?.thumbnail;
                selectedProduct.tags =
                    this.selectedPatientDetailsForm.value?.tags;
                selectedProduct.images =
                    this.selectedPatientDetailsForm.value?.images;

                const newPatient = this.patients.find(
                    (x) => x.id === productId
                );
                this.selectedPatients = newPatient;

                this.filteredTags = this.animalBreedsDef.filter(
                    (tag) => tag.animaltype == this.selectedPatients.animalType
                );

                // selectedProduct.animalBreed ile eşleşen hayvan türünü bulun ve isSelected alanını true yapın
                const value = this.filteredTags.find(x => x.recId == this.selectedPatients.animalBreed);
                if (value) {
                    value.isSelected = true;
                }
                this.selectedPatientDetailsForm.patchValue(newPatient);
            } else if (selectedProduct) {
                selectedProduct.id = this.selectedPatientDetailsForm.value?.id;
                selectedProduct.name =
                    this.selectedPatientDetailsForm.value?.name;
                selectedProduct.birthDate =
                    this.selectedPatientDetailsForm.value?.birthDate;
                selectedProduct.chipNumber =
                    this.selectedPatientDetailsForm.value?.chipNumber;
                selectedProduct.reportNumber =
                    this.selectedPatientDetailsForm.value?.reportNumber;
                selectedProduct.specialNote =
                    this.selectedPatientDetailsForm.value?.specialNote;
                selectedProduct.sterilization =
                    this.selectedPatientDetailsForm.value?.sterilization;
                selectedProduct.sex =
                    this.selectedPatientDetailsForm.value?.sex;
                selectedProduct.animalType =
                    this.selectedPatientDetailsForm.value?.animalType;
                selectedProduct.animalBreed =
                    this.selectedPatientDetailsForm.value?.animalBreed;
                selectedProduct.animalColor =
                    this.selectedPatientDetailsForm.value?.animalColor;
                selectedProduct.active =
                    this.selectedPatientDetailsForm.value?.active;
                selectedProduct.thumbnail =
                    this.selectedPatientDetailsForm.value?.thumbnail;
                selectedProduct.tags =
                    this.selectedPatientDetailsForm.value?.tags;
                selectedProduct.images =
                    this.selectedPatientDetailsForm.value?.images;
                const newId = uuidv4();
                const newPatient: PatientDetails = {
                    id: newId,
                    recId: '',
                    name: '',
                    birthDate: null,
                    chipNumber: '',
                    reportNumber: '',
                    specialNote: '',
                    sterilization: false,
                    sex: 0,
                    animalType: 2,
                    animalBreed: null,
                    animalColor: 0,
                    tags: [],
                    images: [],
                    active: true,
                    thumbnail: '',
                };
                this.selectedPatientDetailsForm.reset();
                this.selectedPatients = null;
            } else {
                this.selectedPatients = selectedProduct;
                this.selectedPatientDetailsForm.patchValue(selectedProduct);
            }
        } else {
            let selectedProductIndex = this.patients.findIndex(
                (product) => product.id === this.selectedPatients?.id
            );
            if (selectedProductIndex !== -1) {
                this.patients[selectedProductIndex].id =
                    this.selectedPatientDetailsForm.value?.id;
                this.patients[selectedProductIndex].name =
                    this.selectedPatientDetailsForm.value?.name;
                this.patients[selectedProductIndex].birthDate =
                    this.selectedPatientDetailsForm.value?.birthDate;
                this.patients[selectedProductIndex].chipNumber =
                    this.selectedPatientDetailsForm.value?.chipNumber;
                this.patients[selectedProductIndex].reportNumber =
                    this.selectedPatientDetailsForm.value?.reportNumber;
                this.patients[selectedProductIndex].specialNote =
                    this.selectedPatientDetailsForm.value?.specialNote;
                this.patients[selectedProductIndex].sterilization =
                    this.selectedPatientDetailsForm.value?.sterilization;
                this.patients[selectedProductIndex].sex =
                    this.selectedPatientDetailsForm.value?.sex;
                this.patients[selectedProductIndex].animalType =
                    this.selectedPatientDetailsForm.value?.animalType;
                this.patients[selectedProductIndex].animalBreed =
                    this.selectedPatientDetailsForm.value?.animalBreed;
                this.patients[selectedProductIndex].animalColor =
                    this.selectedPatientDetailsForm.value?.animalColor;
                this.patients[selectedProductIndex].active =
                    this.selectedPatientDetailsForm.value?.active;
                this.patients[selectedProductIndex].thumbnail =
                    this.selectedPatientDetailsForm.value?.thumbnail;
                this.patients[selectedProductIndex].tags =
                    this.selectedPatientDetailsForm.value?.tags;
                this.patients[selectedProductIndex].images =
                    this.selectedPatientDetailsForm.value?.images;
            }
        }
        console.log('patients', this.patients);
    }

    ngOnDestroy(): void {
        this.patients = [];
        this.selectedPatientDetailsForm.reset();
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }

    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    filterTags(event): void {
        const value = event.target.value.toLowerCase();
        this.filteredTags = this.animalBreedsDef.filter((tag) =>
            tag.breedName.toLowerCase().includes(value)
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    ngAfterViewInit(): void {
        // if (this._sort && this._paginator) {
        //     this._sort.sort({
        //         id: 'name',
        //         start: 'asc',
        //         disableClear: true,
        //     });
        //     this._changeDetectorRef.markForCheck();
        //     this._sort.sortChange
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe(() => {
        //             this._paginator.pageIndex = 0;
        //             // this.closeDetails(productId);
        //         });
        //     // Get products if sort or page changes
        //     // merge(this._sort.sortChange, this._paginator.page)
        //     //     .pipe(
        //     //         switchMap(() => {
        //     //             this.closeDetails(productId);
        //     //             this.isLoading = true;
        //     //             return this._inventoryService.getProducts(
        //     //                 this._paginator.pageIndex,
        //     //                 this._paginator.pageSize,
        //     //                 this._sort.active,
        //     //                 this._sort.direction
        //     //             );
        //     //         }),
        //     //         map(() => {
        //     //             this.isLoading = false;
        //     //         })
        //     //     )
        //     //     .subscribe();
        // }
    }

    cycleImages(forward: boolean = true): void {
        const count =
            this.selectedPatientDetailsForm.get('images').value.length;
        const currentIndex =
            this.selectedPatientDetailsForm.get('currentImageIndex').value;
        const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
        const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

        if (forward) {
            this.selectedPatientDetailsForm
                .get('currentImageIndex')
                .setValue(nextIndex);
        } else {
            this.selectedPatientDetailsForm
                .get('currentImageIndex')
                .setValue(prevIndex);
        }
    }

    filterTagsInputKeyDown(event): void {
        if (event.key !== 'Enter') {
            return;
        }
        if (this.filteredTags.length === 0) {
            this.createTag(event.target.value);
            event.target.value = '';
            return;
        }
        const tag = this.filteredTags[0];
        // const isTagApplied = this.selectedPatients.tags.find(
        //     (id) => id === tag.id
        // );
        // if (isTagApplied) {
        //     this.removeTagFromProduct(tag);
        // } else {
        //     this.addTagToProduct(tag);
        // }
    }

    createTag(title: string): void {
        const tag = {
            title,
        };

        // Create tag on the server
        // this._inventoryService.createTag(tag).subscribe((response) => {
        //     // Add the tag to the product
        //     this.addTagToProduct(response);
        // });
    }

    updateTagTitle(tag: InventoryTag, event): void {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        // this._inventoryService
        //     .updateTag(tag.id, tag)
        //     .pipe(debounceTime(300))
        //     .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deleteTag(tag: InventoryTag): void {
        // Delete the tag from the server
        // this._inventoryService.deleteTag(tag.id).subscribe();
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    addTagToProduct(tag: VetAnimalBreedsDefDto): void {
        // Add the tag
        // this.selectedPatients.animalBreed.unshift(tag.id);

        // Update the selected product form
        this.selectedPatientDetailsForm
            .get('tags')
            .patchValue(this.selectedPatients.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    removeTagFromProduct(tag: VetAnimalBreedsDefDto): void {
        // Remove the tag
        // this.selectedPatients.tags.splice(
        //     this.selectedPatients.tags.findIndex((item) => item === tag.id),
        //     1
        // );

        // Update the selected product form
        this.selectedPatientDetailsForm
            .get('tags')
            .patchValue(this.selectedPatients.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    toggleProductTag(
        tag: VetAnimalBreedsDefDto,
        change: MatCheckboxChange
    ): void {

        if (change.checked) {
            this.filteredTags.forEach((tag) => {
                tag.isSelected = false;
            });
            tag.isSelected = true;
            this.selectedPatientDetailsForm
                .get('animalBreed')
                .setValue(tag.recId);
            this.selectedPatients.animalBreed = tag.recId;
        } else {
            tag.isSelected = false;
            this.selectedPatientDetailsForm.get('animalBreed').setValue(null);
            this.selectedPatients.animalBreed = null;
        }
    }

    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.tags.findIndex(
                (tag) => tag.title.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    formatPhoneNumber(inputValue: string, formControlName: string): void {
        // Sadece sayıları alarak filtreleme yapın
        const numericValue = inputValue.replace(/\D/g, '');

        // Sayıları uygun formatta düzenle
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

        // Düzenlenmiş değeri input alanına atayın
        this.accountForm.get(formControlName).setValue(formattedValue);
    }

    phoneNumberValidator(phoneNumber: any): boolean {

        const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/; // İstenen telefon numarası formatı
        const validAreaCodes = [
            '(505)',
            '(506)',
            '(507)',
            '(551)',
            '(552)',
            '(553)',
            '(554)',
            '(555)',
            '(556)',
            '(557)',
            '(558)',
            '(559)',
            '(501)',
            '(502)',
            '(503)',
            '(504)',
            '(540)',
            '(541)',
            '(542)',
            '(543)',
            '(544)',
            '(545)',
            '(546)',
            '(547)',
            '(548)',
            '(549)',
            '(530)',
            '(531)',
            '(532)',
            '(533)',
            '(534)',
            '(535)',
            '(536)',
            '(537)',
            '(538)',
            '(539)',
            '(501)',
            '(502)',
            '(503)',
            '(504)',
            '(505)',
            '(506)',
            '(507)',
        ];

        // if (!phoneNumberPattern.test(phoneNumber)) {
        //     return { invalidPhoneNumber: { value: phoneNumber } };
        // }

        const inputAreaCode = phoneNumber.substring(0, 5); // Telefon numarasından alan kodunu al

        if (!validAreaCodes.includes(inputAreaCode)) {
            return false; // Geçersiz alan kodu hatası
        }
        return true;
    }

    addPanelOpen(): void {
        const dialog = this._dialog
            .open(CreateEditAnimalsColorDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: null,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getAnimalColorsDefList();
                }
            });

    }

    handleCityChange(event: any) {
        let city = this.cities.filter(x => x.name === event.value);
        if (city.length > 0) {
            this.district = city[0].districts;
        } else {
            this.district = [];
        }
    }

    
    addToShortCuts() {
        this.shortcut = {
            id: '',  
            label: '',
            icon: '',
            link: '',
            useRouter: true
        };
    
        this.shortcut.description = "Yeni Müşteri Ekle";
        this.shortcut.label = "Müşteri Ekle";
        this.shortcut.icon = "heroicons_outline:user-plus";
        this.shortcut.link = "/customeradd";
    
        this._shortcutsService.create(this.shortcut).subscribe();
    }


}

export const sextype = [
    {
        id: 1,
        parentId: null,
        name: 'Erkek',
        slug: 'Erkek',
    },
    {
        id: 2,
        parentId: null,
        name: 'Dişi',
        slug: 'Dişi',
    },
];

export const brands = [
    {
        id: 'e1789f32-9475-43e7-9256-451d2e3a2282',
        name: 'Benton',
        slug: 'benton',
    },
    {
        id: '61d52c2a-8947-4a2c-8c35-f36baef45b96',
        name: 'Capmia',
        slug: 'capmia',
    },
    {
        id: 'f9987124-7ada-4b93-bef7-35280b3ddbd7',
        name: 'Lara',
        slug: 'lara',
    },
    {
        id: '5913ee46-a497-41db-a118-ee506011529f',
        name: 'Premera',
        slug: 'premera',
    },
    {
        id: '2c4d98d8-f334-4125-9596-862515f5526b',
        name: 'Zeon',
        slug: 'zeon',
    },
];

export const tags = [
    {
        id: '167190fa-51b4-45fc-a742-8ce1b33d24ea',
        title: 'mens',
    },
    {
        id: '3baea410-a7d6-4916-b79a-bdce50c37f95',
        title: 'ladies',
    },
    {
        id: '8ec8f60d-552f-4216-9f11-462b95b1d306',
        title: 'unisex',
    },
    {
        id: '8837b93f-388b-43cc-851d-4ca8f23f3a61',
        title: '44mm',
    },
    {
        id: '8f868ddb-d4a2-461d-bc3b-d7c8668687c3',
        title: '40mm',
    },
    {
        id: '2300ac48-f268-466a-b765-8b878b6e14a7',
        title: '5 ATM',
    },
    {
        id: '0b11b742-3125-4d75-9a6f-84af7fde1969',
        title: '10 ATM',
    },
    {
        id: '0fc39efd-f640-41f8-95a5-3f1d749df200',
        title: 'automatic',
    },
    {
        id: '7d6dd47e-7472-4f8b-93d4-46c114c44533',
        title: 'chronograph',
    },
    {
        id: 'b1286f3a-e2d0-4237-882b-f0efc0819ec3',
        title: 'watch',
    },
];

export const vendors = [
    {
        id: '987dd10a-43b1-49f9-bfd9-05bb2dbc7029',
        name: 'Evel',
        slug: 'evel',
    },
    {
        id: '998b0c07-abfd-4ba3-8de1-7563ef3c4d57',
        name: 'Mivon',
        slug: 'mivon',
    },
    {
        id: '05ebb527-d733-46a9-acfb-a4e4ec960024',
        name: 'Neogen',
        slug: 'neogen',
    },
];
export const products = [];
