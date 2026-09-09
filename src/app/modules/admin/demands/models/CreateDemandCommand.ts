import { demandProductsListDto } from "../demand1/models/demandProductsListDto";

export class CreateDemandCommand {
   // id: string;
    date:string;
    documentno:string;
    suppliers:string;
    deliverydate:string;
    note:string;
    state:number;
    iscomplated:boolean;
    demandProductList : demandProductsListDto[];
    constructor(
       // id: string ,
        date:string,
        documentno:string,
        suppliers:string,
        deliverydate:string,
        note:string,
        state:number,
        iscomplated:boolean,
        demandProductList : demandProductsListDto[]
        ) {
        //this.id = id;
        this.date = date;
        this.documentno = documentno;
        this.suppliers = suppliers;
        this.deliverydate = deliverydate;
        this.note = note;
        this.state = state;
        this.iscomplated = iscomplated;
        this.demandProductList = demandProductList;
        

    }
}
