import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { ApexOptions } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { CustomerDetailDto } from '../models/CustomerDetailDto';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralService } from 'app/core/services/general/general.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { MatDialog } from '@angular/material/dialog';
import { PatientDetailsDto } from '../models/PatientDetailsDto';
import { AddApponitnmentDialogComponent } from '../../appointment/appointmentcalendar/add-apponitnment-dialog/add-apponitnment-dialog.component';
import { AppointmentHistoryComponent } from './dialogs/appointment-history/appointment-history.component';
import { GetColectionEditDialogComponent } from './dialogs/collection/get-collection-editdialog/get-collection-editdialog.component';
import { ColectionTransactionsDialogComponent } from './dialogs/collection/collection-transactions-dialog/collection-transactions-dialog.component';
import { VaccinationCard } from './dialogs/vaccinationcard/vaccinationcard.component';
import { PatientDetails } from '../models/PatientDetailsCommand';
import { CustomerDataService } from './services/customer-data.service';
import { CustomerDetailEditDialogComponent } from './dialogs/customer-detail-edit-dialog/customer-detail-edit-dialog.component';
import { CreateEditCustomersalesComponent } from './dialogs/create-edit-customersales/create-edit-customersales.component';
import { CreateEditDetailspatientsComponent } from './dialogs/create-edit-detailspatients/create-edit-detailspatients.component';
import { PayChartComponent } from './dialogs/pay-chart/pay-chart.component';
import { SmstransactionsDialogComponent } from './dialogs/messege/smstransactions-dialog/smstransactions-dialog.component';
import { SalesDialogComponent } from './dialogs/sales-dialog/sales-dialog.component';
import { EventService } from './services/event.service';
import { CreateEditCustomerpatientsComponent } from './dialogs/create-edit-customerpatients/create-edit-customerpatients.component';
import { BalacecollectionComponent } from './dialogs/balacecollection/balacecollection.component';
import { CustomerGroupListDto } from '../../definition/customergroup/models/customerGroupListDto';
import { CustomerGroupService } from 'app/core/services/definition/customergroup/customergroup.service';

@Component({
    selector: 'customerdetails',
    templateUrl: './customerdetails.component.html',
    styleUrls: ['./customerdetails.component.css']
})
export class CustomerDetailsComponent implements OnInit {
    @Output() salesAdded = new EventEmitter<void>();
    @Output() formDataChanged = new EventEmitter<any>();
    customerDetailForm: FormGroup;
    selectedCustomerId: any;
    boards: any[];
    id: string;
    customerDetail: CustomerDetailDto
    patientDetails: PatientDetailsDto[] = [];
    firstname: string;
    lastname: string;
    phonenumber: string;
    email: string;
    customergroupList: CustomerGroupListDto[] = [];
    patientList: PatientDetails[] = [];

    totalSaleBuyCount: number;
    totalVisitCount: number;
    totalEarnings: number;
    totalCollection: number;
    totalMessageCount: number;

    loader = true;
    action :any;
    customerdetailAction :any;
    recid:string;

    constructor(
        private route: ActivatedRoute,
        private _router: Router,
        private _formBuilder: UntypedFormBuilder,
        private _customerService: CustomerService,
        private _translocoService: TranslocoService,
        private _dialog: MatDialog,
        private _customerDataService: CustomerDataService,
        private _eventService: EventService,
        private _customergroup: CustomerGroupService,
    ) { 

        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const customer = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'customer');
        });
    
        if (customer) {
            this.customerdetailAction = customer.roleSettingDetails.find((detail: any) => detail.target === 'customer');
        } else {
            this.customerdetailAction = null;
        }
    }

    ngOnInit() {

        this.route.params.subscribe((params) => {
            this.selectedCustomerId = params['id'];
            console.log('Müşteri ID:', this.selectedCustomerId);
        });

        this.getCustomerDetailList();
        this.getCustomerGroupList();
        this._customerDataService.setCustomerId(this.selectedCustomerId);

        this.customerDetailForm = this._formBuilder.group({
            email: [{ value: '', disabled: true }],
            phonenumber: [{ value: '', disabled: true }],
            phonenumber2: [{ value: '', disabled: true }],
            city: [{ value: '', disabled: true }],
            district: [{ value: '', disabled: true }],
            taxoffice: [{ value: '', disabled: true }],
            vkntcno: [{ value: '', disabled: true }],
            note: [{ value: '', disabled: true }],
            smsNotification: [{ value: '', disabled: true }],
            emailNotification: [{ value: '', disabled: true }],
            address: [{ value: '', disabled: true }],
            customerdiscount: [{ value: '', disabled: true }],
            customerGroup: [{ value: '', disabled: true }],
            recordDate: [{ value: '', disabled: true }],
        });
    }

    // getUserAvatarUrl(): string {
    //     const initials = this.userFirstName.charAt(0) + this.userLastName.charAt(0);
    // Eğer bir API'den veya başka bir kaynaktan fotoğraf URL'sini almanız gerekiyorsa, burada yapabilirsiniz.
    //     // Örneğin: return 'https://example.com/api/getUserAvatar?initials=' + initials;

    // Eğer fotoğrafları lokal olarak saklıyorsanız, assets klasörü içinde uygun bir yere koyabilir ve buradan kullanabilirsiniz.
    //     return `assets/avatars/${initials}.png`; // Örnek: assets/avatars/JD.png
    //   }
    addSale(): void {
        // Satış eklendiğini belirten bir event emit ediyoruz
        this.salesAdded.emit();
    }

    addPanelOpen(): void {

        const model = {
            customerId: this.selectedCustomerId,
            firstname: this.customerDetail.firstname,
            lastname: this.customerDetail.lastname,
            customerDetailForm: this.customerDetailForm.value
        }

        const dialog = this._dialog
            .open(CustomerDetailEditDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    getCustomerGroupList() {
        this._customergroup.getcustomerGroupList().subscribe((response) => {
            this.customergroupList = response.data;
        });
    }


    trackByFn(index: number, item: any): any {
        return item.id || index;
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

    getCustomerDetailList() {

        var model = {
            id: this.selectedCustomerId
        }

        this._customerService.getCustomersFindById(model).subscribe(response => {
            if (response.isSuccessful) {
                this.customerDetail = response.data;
                this.patientDetails = this.customerDetail.patientDetails
                this.firstname = this.customerDetail.firstname;
                this.lastname = this.customerDetail.lastname;
                this.phonenumber = this.customerDetail.phonenumber;
                this.email = this.customerDetail.email;
                this.recid = this.customerDetail.recid;
                this.totalSaleBuyCount = response.data.totalData.totalSaleBuyCount;
                this.totalVisitCount = response.data.totalData.totalVisitCount;
                this.totalEarnings = response.data.totalData.totalEarnings;
                this.totalCollection = response.data.totalData.totalCollection;
                this.totalMessageCount = response.data.totalData.totalMessageCount;
                this.customerDetailForm.patchValue({
                    email: this.customerDetail.email,
                    phonenumber: this.customerDetail.phonenumber,
                    phonenumber2: this.customerDetail.phonenumber2,
                    city: this.customerDetail.city,
                    district: this.customerDetail.district,
                    taxoffice: this.customerDetail.taxoffice,
                    vkntcno: this.customerDetail.vkntcno,
                    note: this.customerDetail.note,
                    smsNotification: this.customerDetail.isphone,
                    emailNotification: this.customerDetail.isemail,
                    address: this.customerDetail.longadress,
                    customerdiscount: this.customerDetail.discountrate,
                    customerGroup: this.customerDetail.customergroup,
                    recordDate: this.customerDetail.createdate,
                });
            }
            else {
                this.showSweetAlert('error');
            }
            this.loader = false;
        });
    }

    openSaleCustomers(): void {

        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(SalesDialogComponent, {
                // maxWidth: '100vw !important',
                minWidth: '800px',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this._eventService.dialogClosed.emit(true);
                    this.getCustomerDetailList();
                }
            });
    }

    openNewPatients(): void {
        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(CreateEditCustomerpatientsComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    addAppointment(): void {

        const model = {
            customerId: this.selectedCustomerId,
            visibleCustomer: false,
            patientId: null,
            patinetlist: null,
            selectedAppointment: null
        }
        const patientModel = {
            id: this.selectedCustomerId
        }
        this._customerService.getPatientsByCustomerId(patientModel).subscribe((response) => {
            this.patientList = response.data;
            if (this.patientList.length === 1) {
                model.patientId = this.patientList[0].id;
            }
            if (this.patientList.length > 0) {
                model.patinetlist = this.patientList;
            }
            const dialog = this._dialog
                .open(AddApponitnmentDialogComponent, {
                    minWidth: '1000px',
                    disableClose: true,
                    data: model
                })
                .afterClosed()
                .subscribe((response) => {
                    if (response.status) {
                    }
                });
        });


    }

    openAppointmentHistory(): void {

        const model = {
            customerId: this.selectedCustomerId,
            isPatientDetail: false,
            selectedPatientId : '00000000-0000-0000-0000-000000000000',
            visibleCustomer: false,
        }
        console.log(model);
        const dialog = this._dialog
            .open(AppointmentHistoryComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    //openGetCollection
    openGetCollection(): void {

        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(GetColectionEditDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    //openCollectionTransaction
    openCollectionTransaction(): void {

        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(ColectionTransactionsDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    // this.getCustomerList();
                }
            });
    }

    openBalanceCollection(): void {

        let customerlist: any[] = [];

        let customer: Customer = {
            name: this.firstname + ' ' + this.lastname,
            id: this.selectedCustomerId,
            balance: this.totalEarnings - this.totalCollection
        };
        customerlist.push(customer);

        const model = {
            customerId: this.selectedCustomerId,
            customerlist: customerlist,

        }
        console.log(model);
        const dialog = this._dialog
            .open(BalacecollectionComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    // this.getCustomerList();
                }
            });
    }

    //openPayChart
    openPayChart(): void {

        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(PayChartComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    // this.getCustomerList();
                }
            });
    }

    //openvaccinationcard
    openvaccinationcard(): void {

        const model = {
            customerId: this.selectedCustomerId,
        }
        console.log(model);
        const dialog = this._dialog
            .open(VaccinationCard, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    //smstransactions-dialog
    smstransactions(): void {
        const model = {
            customerId: this.selectedCustomerId,
        }

        const dialog = this._dialog
            .open(SmstransactionsDialogComponent, {
                maxWidth: '100vw !important',
                disableClose: true,
                data: model
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getCustomerDetailList();
                }
            });
    }

    public redirectToUpdatePatient = (id: string) => {

        const selectedPatients = this.patientDetails.find((item) => item.recId == id);
        if (selectedPatients) {
            // const model = {
            //     customerId: this.selectedCustomerId,
            //     selectedpatients: selectedPatients
            // }
            // console.log(model);
            // const dialog = this._dialog
            //     .open(CreateEditDetailspatientsComponent, {
            //         maxWidth: '100vw !important',
            //         disableClose: true,
            //         data: model
            //     })
            //     .afterClosed()
            //     .subscribe((response) => {
            //         if (response.status) {
            //             this.getCustomerDetailList();
            //         }
            //     });

            const model = {
                customerId: this.selectedCustomerId,
                selectedPatients : selectedPatients
            }
            console.log(model);
            const dialog = this._dialog
                .open(CreateEditCustomerpatientsComponent, {
                    maxWidth: '100vw !important',
                    disableClose: true,
                    data: model
                })
                .afterClosed()
                .subscribe((response) => {
                    if (response.status) {
                        this.getCustomerDetailList();
                    }
                });


        }
    }

    public redirectToDeletePatient = (id: string) => {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    const model = {
                        id: id,
                    };
                    this._customerService
                        .deletePatients(model)
                        .subscribe((response) => {
                            if (response.isSuccessful) {
                                this.getCustomerDetailList();
                                const sweetAlertDto2 = new SweetAlertDto(
                                    this.translate('sweetalert.success'),
                                    this.translate('sweetalert.transactionSuccessful'),
                                    SweetalertType.success
                                );
                                GeneralService.sweetAlert(sweetAlertDto2);
                            } else {
                                console.error('Silme işlemi başarısız.');
                            }
                        });
                }
            }
        );
    }

    openPatientTab() {
        debugger
        this._customerDataService.setCustomerId(this.selectedCustomerId);
    }

    onTabChange(event: any) {
        this._eventService.dialogClosed.emit(true);
        if (event === 6) {
            
        }
    }


}

interface Customer {
    name: string;
    id: number;
    balance: number;
}
