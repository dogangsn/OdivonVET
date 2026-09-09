export class graphicListDto {
    name:string;
    realType:number;
    months:monthList[];
    realDateYear:number;
    types: string;
    kdvSum:number;
    netPriceSum:number;
    sumAlis:number;
    sumSatis:number;
    
}
export class monthList {
    ocak:number;
    subat:number;
    mart:number;
    nisan:number;
    mayis:number;
    haziran:number;
    temmuz:number;
    agustos:number;
    eylul:number;
    ekim:number;
    kasim:number;
    aralik:number;
}


export class graphicListRequestDto {
    year: number;  
    constructor(
        year: number,
         ) {
         this.year = year;
        }   
}
