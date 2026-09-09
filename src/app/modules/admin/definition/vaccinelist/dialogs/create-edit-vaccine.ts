import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitsService } from 'app/core/services/definition/unitdefinition/units.service';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { VaccineListDto } from '../models/vaccineListDto';
import { VetVetAnimalsTypeListDto } from 'app/modules/admin/customer/models/VetVetAnimalsTypeListDto';
import { CustomerService } from 'app/core/services/customers/customers.service';
import { VaccineMedicine } from '../models/VaccineMedicine';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { TaxisService } from 'app/core/services/definition/taxis/taxis.service';
import { TaxesDto } from '../../taxes/models/taxesDto';
import { fuseAnimations } from '@fuse/animations';
import { ProductDescriptionsDto } from '../../productdescription/models/ProductDescriptionsDto';
import { ProductDescriptionService } from 'app/core/services/definition/productdescription/productdescription.service';
import { CreateVaccineCommand } from '../models/createVaccineCommand';
import { VaccineService } from 'app/core/services/definition/vaccinelist/vaccinelist.service';
import { UpdateVaccineCommand } from '../models/updateVaccineCommand';

@Component({
    selector: 'app-create-edit-vaccine-dialog',
    styleUrls: ['./create-edit-vaccine.scss'],
    templateUrl: './create-edit-vaccine.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class CreateEditVaccineDialogComponent implements OnInit {
    selectedvaccine: VaccineListDto;
    vaccine: FormGroup;
    vaccineMedicineForm: FormGroup;
    buttonDisabled = false;
    panelOpenState = true;


    vaccineMedicine: VaccineMedicine[] = [];
    selectedvaccineMedicine: VaccineMedicine | null = null;

    animalTypesList: VetVetAnimalsTypeListDto[] = [];
    destroy$: Subject<boolean> = new Subject<boolean>();
    taxisList: TaxesDto[] = [];
    productdescription: ProductDescriptionsDto[] = [];
    stylesheet = document.styleSheets[0];

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _formBuilder: FormBuilder,
        private _translocoService: TranslocoService,
        private _customerService: CustomerService,
        private _taxisService: TaxisService,
        private _productdescriptionService: ProductDescriptionService,
        private _vaccineService: VaccineService,
        @Inject(MAT_DIALOG_DATA) public data: VaccineListDto
    ) {
        this.selectedvaccine = data;

    }

    ngOnInit(): void {
        (this.stylesheet as CSSStyleSheet).insertRule('body.light, body .light { position: fixed;}', 0);

        this.getAnimalTypesList();

        zip(
            this.getTaxisList(),
            this.getProductList(),

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
                this.fillFormData(this.selectedvaccine);
            }
        });


        this.vaccine = this._formBuilder.group({
            animalType: [0],
            vaccineName: [''],
            timeDone: [0],
            renewalOption: ['1'],
            obligation: ["0"]
        });

        this.vaccineMedicineForm = this._formBuilder.group({
            id: [''],
            productId: [''],
            quantity: [0],
            salesAmount: [0],
            taxisId: [''],
            remark: ['']
        });
    }

    fillFormData(selectedVaccinedef: VaccineListDto) {

        if (this.selectedvaccine !== null) {
            const numberValue = Number(selectedVaccinedef.animalType);

            this.vaccine.setValue({
                animalType: numberValue,
                vaccineName: selectedVaccinedef.vaccineName,
                timeDone: selectedVaccinedef.timeDone.toString(),
                renewalOption: selectedVaccinedef.renewalOption.toString(),
                obligation: selectedVaccinedef.obligation.toString()
            });
            this.vaccineMedicine = selectedVaccinedef.vetVaccineMedicine;
        }
    }

    getAnimalTypesList() {
        this._customerService.getVetVetAnimalsType().subscribe((response) => {
            this.animalTypesList = response.data;
            console.log('anımals', this.animalTypesList);
        });
    }

    addOrUpdate(): void {
        this.buttonDisabled = true;
        this.selectedvaccine
            ? this.updateVaccine()
            : this.addVaccine();
    }

    closeDialog(): void {
        this._dialogRef.close({ status: null });
        for (let index = 0; index < this.stylesheet.cssRules.length; index++) {
            if (this.stylesheet.cssRules[index].cssText === 'body.light, body .light { position: fixed; }') {
                (this.stylesheet as CSSStyleSheet).deleteRule(index);
            }
        }
    }

    addVaccine(): void {
        const item = new CreateVaccineCommand(
            this.getFormValueByName('animalType'),
            this.getFormValueByName('vaccineName'),
            this.getFormValueByName('timeDone'),
            this.getFormValueByName('renewalOption'),
            this.getFormValueByName('obligation'),
            this.vaccineMedicine
        );

        this._vaccineService.createVaccine(item).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
                    this._dialogRef.close({
                        status: true,
                    });
                    for (let index = 0; index < this.stylesheet.cssRules.length; index++) {
                        if (this.stylesheet.cssRules[index].cssText === 'body.light, body .light { position: fixed; }') {
                            (this.stylesheet as CSSStyleSheet).deleteRule(index);
                        }
                    }
                } else {
                    this.showSweetAlert('error');
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    updateVaccine(): void {
        const item = new UpdateVaccineCommand(
            this.selectedvaccine.id,
            this.getFormValueByName('animalType'),
            this.getFormValueByName('vaccineName'),
            this.getFormValueByName('timeDone'),
            this.getFormValueByName('renewalOption'),
            this.getFormValueByName('obligation'),
            this.vaccineMedicine
        );

        this._vaccineService.updateVaccine(item).subscribe(
            (response) => {
                if (response.isSuccessful) {
                    this.showSweetAlert('success');
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

    getFormValueByName(formName: string): any {
        return this.vaccine.get(formName).value;
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
            ProductType: 2,
        };
        return this._productdescriptionService
            .getProductDescriptionFilters(model);
    }

    setProductList(response: any): void {
        if (response.data) {
            this.productdescription = response.data;
        }
    }

    addNewRow(): void {
        const newId = uuidv4();
        const newmodel: VaccineMedicine =
        {
            id: newId,
            vaccineId: newId,
            quantity: 0,
            dosingType: 0,
            productId: "",
            taxisId: "",
            salesAmount: 0,
            remark: ""
        };
        this.vaccineMedicine.push(newmodel);
        this.selectedvaccineMedicine = newmodel;
        this.vaccineMedicineForm.patchValue(newmodel);
    }

    async toggleDetails(vaccineid: string): Promise<void> {
        await this.closeDetails(vaccineid);
    }

    closeDetails(vaccineid?: string): void {
        if (vaccineid) {
            let selectedVaccine = this.vaccineMedicine.find((vaccine) => vaccine.id === vaccineid);
            if (!this.selectedvaccineMedicine) {
                selectedVaccine = this.vaccineMedicine.find((vaccine) => vaccine.id === vaccineid);
                this.selectedvaccineMedicine = selectedVaccine;
                this.vaccineMedicineForm.patchValue(selectedVaccine);
            }
            else if (this.selectedvaccineMedicine?.id !== selectedVaccine?.id) {
                selectedVaccine = this.vaccineMedicine.find(
                    (product) => product.id === this.selectedvaccineMedicine.id
                );
                selectedVaccine.id = this.vaccineMedicineForm.value?.id;
                selectedVaccine.productId = this.vaccineMedicineForm.value?.productId;
                selectedVaccine.quantity = this.vaccineMedicineForm.value?.quantity;
                selectedVaccine.remark = this.vaccineMedicineForm.value?.remark;
                selectedVaccine.salesAmount = this.vaccineMedicineForm.value?.salesAmount;
                selectedVaccine.taxisId = this.vaccineMedicineForm.value?.taxisId;


                const neVaccineM = this.vaccineMedicine.find((x) => x.id === vaccineid);
                this.selectedvaccineMedicine = neVaccineM;
                this.vaccineMedicineForm.patchValue(neVaccineM);
            } else if (selectedVaccine) {
                selectedVaccine.id = this.vaccineMedicineForm.value?.id;
                selectedVaccine.productId = this.vaccineMedicineForm.value?.productId;
                selectedVaccine.quantity = this.vaccineMedicineForm.value?.quantity;
                selectedVaccine.remark = this.vaccineMedicineForm.value?.remark;
                selectedVaccine.salesAmount = this.vaccineMedicineForm.value?.salesAmount;
                selectedVaccine.taxisId = this.vaccineMedicineForm.value?.taxisId;

                const newId = uuidv4();
                const newmodel: VaccineMedicine =
                {
                    id: newId,
                    vaccineId: newId,
                    quantity: 0,
                    dosingType: 0,
                    productId: "",
                    taxisId: "",
                    salesAmount: 0,
                    remark: ""
                };
                this.vaccineMedicineForm.reset();
                this.selectedvaccineMedicine = null;
            } else {
                this.selectedvaccineMedicine = selectedVaccine;
                this.vaccineMedicineForm.patchValue(selectedVaccine);
            }
        } else {
            let selectedProductIndex = this.vaccineMedicine.findIndex(
                (product) => product.id === this.selectedvaccineMedicine?.id
            );
            if (selectedProductIndex !== -1) {
                this.vaccineMedicine[selectedProductIndex].id = this.vaccineMedicineForm.value?.id;
                this.vaccineMedicine[selectedProductIndex].productId = this.vaccineMedicineForm.value?.productId;
                this.vaccineMedicine[selectedProductIndex].quantity = this.vaccineMedicineForm.value?.quantity;
                this.vaccineMedicine[selectedProductIndex].remark = this.vaccineMedicineForm.value?.remark;
                this.vaccineMedicine[selectedProductIndex].salesAmount = this.vaccineMedicineForm.value?.salesAmount;
                this.vaccineMedicine[selectedProductIndex].taxisId = this.vaccineMedicineForm.value?.taxisId;

            }
        }
    }

    deleteSelectedvaccine(patiendId: any): void {
        const sweetAlertDto = new SweetAlertDto(
            this.translate('sweetalert.areYouSure'),
            this.translate('sweetalert.areYouSureDelete'),
            SweetalertType.warning
        );
        GeneralService.sweetAlertOfQuestion(sweetAlertDto).then(
            (swalResponse) => {
                if (swalResponse.isConfirmed) {
                    debugger;
                    const index = this.vaccineMedicine.findIndex(
                        (patient) => patient.id === patiendId
                    );
                    // if (index !== -1) {
                    //     this.patients.splice(index, 1);
                    //     this.selectedPatients = null;
                    //     this.selectedPatientDetailsForm.reset();
                    //}

                }
            }
        );
    }


}
