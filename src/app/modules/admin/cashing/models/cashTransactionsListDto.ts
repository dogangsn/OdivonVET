export class CashTransactionsListDto {
    id: string;
    date: string;
    process: string;
    paymentType: string;
    recordUser: string;
    customer : string;
    remark: string;
    debit: number;
    balance : number;
    amount: number;
}