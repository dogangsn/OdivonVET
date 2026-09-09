export class UpdatePaymentMethodsCommand {
    recId:string;
    name:string;
    remark:string;

    constructor(recId:string, name:string, remark: string)
    {
        this.recId = recId;
        this.name = name;
        this.remark = remark;
    }
}