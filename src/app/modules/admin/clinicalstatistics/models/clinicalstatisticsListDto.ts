export class clinicalstatisticsListDto {
    total: string;
    paymentType:string;
    year: number;
    month:string;
    customerId:string;
    requestType:number;
    Type:number;

}
export class clinicalstatisticsResponseDto {
    ThisWeekCustomerTotal: clinicalstatisticsListDto;
    PaymentTypeTotal: clinicalstatisticsListDto;
    PaymentTypeYearsTotal:clinicalstatisticsListDto;
     constructor(
        // id: string ,
        ThisWeekCustomerTotal: clinicalstatisticsListDto,
        PaymentTypeTotal: clinicalstatisticsListDto,
        PaymentTypeYearsTotal:clinicalstatisticsListDto,
         ) {
         //this.id = id;
         this.ThisWeekCustomerTotal = ThisWeekCustomerTotal;
         this.PaymentTypeTotal = PaymentTypeTotal;
         this.PaymentTypeYearsTotal = PaymentTypeYearsTotal;
 }
}
export class clinicalstatisticsListRequestDto {
    total: string;
    paymentType:string;
    year: number;
    month:string;
    customerId:string;
    requestType:number;
    Type:number;
    constructor(
        // id: string ,
        total: string,
        paymentType:string,
        year: number,
        month:string,
        customerId:string,
        requestType:number,
        Type:number,

         ) {
         //this.id = id;
         this.total = total;
         this.paymentType = paymentType;
         this.year = year;
         this.month = month;
         this.customerId = customerId;
         this.requestType = requestType;
         this.Type = Type;

        }   
}
export class customersListClinicalStatisticsDto {
    id:string;
    firstName:string;
    lastName: string;
    phonenumber:Number;
    phonenumber2: Number;
    eMail:string;
    note:string;
}


 