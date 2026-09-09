export class weekVisitListDto {
    beginDate:Date;
    allVisitcount:number;
    visitCountSum:number;
    unVisitCountSum:number;
    dayName:string;
    thisAndLastType: number;

}
export class weekVisitListRequestDto{
    thisAndLastType: number;  
    constructor(
        thisAndLastType: number,
         ) {
         this.thisAndLastType = thisAndLastType;
        }   

}
