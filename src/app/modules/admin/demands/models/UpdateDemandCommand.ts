export class UpdateDemandCommand {
    id: string;
    date:string;
    documentno:string;
    suppliers:string;
    deliverydate:string;
    note:string;
    state:number;
    iscomplated:boolean;

    constructor(
        id: string ,
        date:string,
        documentno:string,
        suppliers:string,
        deliverydate:string,
        note:string,
        state:number,
        iscomplated:boolean,
        ) {
        this.id = id;
        this.date = date;
        this.documentno = documentno;
        this.suppliers = suppliers;
        this.deliverydate = deliverydate;
        this.note = note;
        this.state = state;
        this.iscomplated = iscomplated;

    }
    
}
