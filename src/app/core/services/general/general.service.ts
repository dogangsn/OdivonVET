import { Injectable } from '@angular/core';
import { StorageDto } from 'app/core/models/storage/StorageDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import jwtDecode from 'jwt-decode';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    static tokenInfoModel: StorageDto;

    static tokenInfo(): StorageDto {
        const p=JSON.parse(localStorage.getItem('odivon-profile') || '{}');
        this.tokenInfoModel = {id:p.id,FirstName:p.name || '',LastName:'',UserName:p.email || '',CompanyId:localStorage.getItem('odivon-clinic-code'),TenantId:localStorage.getItem('odivon-clinic-code'),AccountType:'Vet',Host:location.host,SubscriptionType:''};
        return this.tokenInfoModel;
    }
    static sweetAlert(model: SweetAlertDto): void {
        const sweetIcon = this.convertToSweetAlertIconType(model.icon);
        Swal.fire({
            title: model.title,
            text: model.text,
            icon: sweetIcon,
            confirmButtonText: 'Ok',
        });
    }

    static convertToSweetAlertIconType(sweetType: SweetalertType): any {
        switch (sweetType) {
            case SweetalertType.success:
                return 'success';
            case SweetalertType.error:
                return 'error';
            case SweetalertType.info:
                return 'info';
            case SweetalertType.question:
                return 'question';
            case SweetalertType.warning:
                return 'warning';
            default:
                return 'success';
        }
    }

    static sweetAlertOfQuestion(
        model: SweetAlertDto
    ): Promise<SweetAlertResult<any>> {
        const sweetIcon = this.convertToSweetAlertIconType(model.icon);
        return Swal.fire({
            title: model.title,
            text: model.text,
            icon: sweetIcon,
            confirmButtonText: 'Yes',
            allowEnterKey: false,
            showCancelButton: true,
            confirmButtonColor: '#1878C6',
            cancelButtonColor: '#DF3B3B',
        });
    }

    
    
    
}