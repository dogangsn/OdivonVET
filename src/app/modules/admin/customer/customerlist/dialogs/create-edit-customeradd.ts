import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { customersListDto } from '../../models/customersListDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { CreateCustomerCommand } from '../../models/CreateCustomerCommand';
import { PatientDetails } from '../../models/PatientDetailsCommand';
import { CustomerGroupListDto } from 'app/modules/admin/definition/customergroup/models/customerGroupListDto';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';
import { CreateEditPatientsDialogComponent } from '../patientsdialogs/create-edit-patients';
import { VeriServisi } from '../service/veri-servisi';
import { MatTableDataSource } from '@angular/material/table'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-create-edit-customeradd-dialog',
    styleUrls: ['./create-edit-customeradd.css'],
    templateUrl: './create-edit-customeradd.html',
})
export class CreateEditCustomerAddDialogComponent implements OnInit {
    displayedColumns: string[] = [
        'name', 'chipNumber', 'birthDate', 'delete'
    ];

    selectedcustomeradd: customersListDto;
    customeradd: FormGroup;
    selectedValue: string;
    patientsAdd: FormGroup;
    patientCount: String = "";
    customers: CreateCustomerCommand = new CreateCustomerCommand();
    customergroupList: CustomerGroupListDto[] = [];

    patients: PatientDetails[] = [];
    dataSource = new MatTableDataSource<PatientDetails>(this.patients);

    constructor(
        private _dialog: MatDialog,
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _customerService: CustomerService,
        private _customergroup: CustomerGroupService,
        private veriServisi: VeriServisi,
        private router: Router, private route: ActivatedRoute,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
        this.getCustomerGroupList();

        this.customeradd = this._formBuilder.group({
            firstName: [''],
            lastName: [''],
            phoneNumber: [''],
            phoneNumber2: [''],
            eMail: [''],
            taxOffice: [''],
            vKNTCNo: [''],
            note: [''],
            discountRate: [0],
            isEmail: false,
            isPhone: false,
            province: [''],
            district: [''],
            longAdress: [''],
        });

        this.patientsAdd = this._formBuilder.group({
            count: ['']
        })
    }

    fillFormData(selectedproductdesf: customersListDto) {
        if (this.selectedcustomeradd !== null) {
            this.customeradd.setValue({
                //name: selectedproductdesf.name,
            });
        }
    }

    getCustomerGroupList() {
        this._customergroup.getcustomerGroupList().subscribe((response) => {
            this.customergroupList = response.data;
        });
    }
    redirectToDelete(id: string) {
        debugger;
        this.dataSource.data = this.dataSource.data.filter(x => x.id !== id);
        this.patients = this.patients.filter(x => x.id !== id);
        // this.dataSource.data.
    }
    addOrUpdateCustomer(): void {
        this.selectedcustomeradd ? this.updateCustomer() : this.addCustomers();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
    }

    addCustomers(): any {
        if (this.customeradd.invalid) {
            this.showSweetAlert('error', 'Zorunlu Alanları Doldurunuz.');
            return;
        }
        const isEmail = this.getFormValueByName('isEmail');
        const isPhone = this.getFormValueByName('isEmail');
        this.customers.isEmail = isEmail;
        this.customers.isPhone = isPhone;
        // this.customers.Id = "00000000-0000-0000-0000-000000000000";

        if (this.fillSelectedInvoice()) {
            this.customers.PatientDetails.forEach((item) => {
                if (item.animalBreed.toString() == "") {
                    item.animalBreed = 0;
                }
                if (item.animalColor.toString() == "") {
                    item.animalColor = 0;
                }
                if (item.animalType.toString() == "") {
                    item.animalType = 0;
                }
                item.id = "00000000-0000-0000-0000-000000000000";
                item.images = null;
            })
            const model = {
                createcustomers: this.customers,
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
                        this._dialogRef.close({
                            status: true,
                        });

                        const sweetAlertDto = new SweetAlertDto(
                            'Kayıt İşlemi Gerçekleşti',
                            'Müşteri Detay Ekranına Yönlendirilmek İster Misiniz?',
                            SweetalertType.success
                        );
                        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
                            (swalResponse) => {
                                if (swalResponse.isConfirmed) {
                                    this.router.navigate(['customerlist/customerdetails', response.data]);
                                }
                            }
                        )
                    } else {
                        this.showSweetAlert(
                            'error',
                            response.errors[0]
                        );
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        }
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
        this.customers.vKNTCNo = this.getFormValueByName('vKNTCNo');
        this.customers.note = this.getFormValueByName('note');
        this.customers.discountRate = this.getFormValueByName('discountRate');
        this.customers.province = this.getFormValueByName('province');
        this.customers.district = this.getFormValueByName('district');
        this.customers.longAdress = this.getFormValueByName('longAdress');
        this.customers.PatientDetails = this.patients;

        return true;
    }

    updateCustomer() { }

    getFormValueByName(formName: string): any {
        if (formName == "patientsAdd") {
            return this.patientsAdd.get(formName).value;
        }
        return this.customeradd.get(formName).value;
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
                SweetalertType.error,
            );
            GeneralService.sweetAlert(sweetAlertDto);
        }
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    addPanelOpen(): void {
        //this.erpfinancemonitorForm.reset();
        this.patientCount = this.patientsAdd.value.count;
        console.log(this.patientCount);

        const dialog = this._dialog
            .open(CreateEditPatientsDialogComponent, {
                // maxWidth: '400vw !important',
                // minHeight: '2000px !important',
                disableClose: true,
                data: { count: this.patientCount },
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    response.data.forEach(item => {
                        this.patients.push(item);
                    });
                    debugger;
                    this.dataSource = new MatTableDataSource(this.patients);
                }
            });
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
        this.customeradd.get(formControlName).setValue(formattedValue);
    }
}
