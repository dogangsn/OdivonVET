import { Injectable } from "@angular/core";
import { HttpService } from "app/core/auth/Http.service";
import { BehaviorSubject, filter, map, of, switchMap, take, tap, throwError } from 'rxjs';

import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor } from 'app/modules/admin/demands/demand1/models/demandProductsListDto';
// import { CreateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/CreateCasingDefinitionCommand";
// import { DeleteCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/DeleteCasingDefinitionCommand";
// import { UpdateCasingDefinitionCommand } from "app/modules/admin/definition/casingdefinition/models/UpdateCasingDefinitionCommand";
import { endPoints } from "environments/endPoints";
import { Observable } from "rxjs";
import { demandProductsListDto } from "app/modules/admin/demands/demand1/models/demandProductsListDto";
import { CreateDemandProductsCommand } from "app/modules/admin/demands/demand1/models/CreateDemandProductsCommand";
import { DeleteDemandProductsCommand } from "app/modules/admin/demands/demand1/models/DeleteDemandProductsCommand";

import { demandsListDto } from "app/modules/admin/demands/models/demandListDto";
import { CreateDemandCommand } from "app/modules/admin/demands/models/CreateDemandCommand";
import { DeleteDemandCommand } from "app/modules/admin/demands/models/DeleteDemandCommand";
import { UpdateDemandCommand } from "app/modules/admin/demands/models/UpdateDemandCommand";

import { demandTransList } from "app/modules/admin/demands/models/demandListDto";

import { UpdateDemandProductsCommand } from "app/modules/admin/demands/demand1/models/UpdateDemandProductsCommand";
@Injectable({
    providedIn: 'root'
})

export class DemandProductsService {
    
    private _brands: BehaviorSubject<InventoryBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<InventoryCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<demandProductsListDto | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<demandProductsListDto[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<InventoryTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    constructor(private _httpService: HttpService) { }
    getDemandProductsList() : Observable<any>{
        return this._httpService.getRequest(endPoints.demandproducts.demandproductsList);
    }

    createDemandProduct(model: CreateDemandProductsCommand): Observable<any> {
        debugger;
        return this._httpService.post(endPoints.demandproducts.Createdemandproducts, model);
    }
    deleteDemandProduct(model: DeleteDemandProductsCommand): Observable<any> {
        return this._httpService.post(endPoints.demandproducts.Deletedemandproducts, model);
    }
    updateDemandProduct(model: UpdateDemandProductsCommand): Observable<any> {
        return this._httpService.post(endPoints.demandproducts.Updatedemandproducts, model);
    }
    
    getDemandTransList(model : any): Observable<any>{
        debugger;
        return this._httpService.post(endPoints.demandTrans.demandsTransList,model);
    }
    getDemandComplateList(): Observable<any>{
        return this._httpService.getRequest(endPoints.demandComplate.demandsComplateList);
    }
    getDemandLists() : Observable<any>{
        return this._httpService.getRequest(endPoints.demands.demandsList);
    }
    // updateDemandListComplate(model : UpdateDemandCommand): Observable<any> {
    //     return this._httpService.post(endPoints.demands.updatedemand,model);
    // }

    createDemands(model: CreateDemandCommand): Observable<any> {
        return this._httpService.post(endPoints.demands.createdemand, model);
    }
    deleteDemands(model: DeleteDemandCommand): Observable<any> {
        return this._httpService.post(endPoints.demands.deletedemand, model);
    }
    updateDemands(model: UpdateDemandCommand): Observable<any> {
        debugger;
        return this._httpService.post(endPoints.demands.updatedemand, model);
    }
    updateBuyDemands(model: UpdateDemandCommand): Observable<any> {
        debugger;
        return this._httpService.post(endPoints.demands.updatebuydemands, model);
    }
    getProducts(page=0,size=10,sort='name',order:'asc'|'desc'|''='asc',search=''):Observable<{pagination:InventoryPagination;products:demandProductsListDto[]}> {
      return this.getDemandProductsList().pipe(map(response=>{
        const rows=response.data.filter(r=>JSON.stringify(r).toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
        rows.sort((a,b)=>String(a[sort]??'').localeCompare(String(b[sort]??''),'tr')*(order==='desc'?-1:1));
        size=Math.max(1,Math.min(size,100));page=Math.max(0,page);const start=page*size;
        const pagination={length:rows.length,size,page,lastPage:Math.max(0,Math.ceil(rows.length/size)-1),startIndex:start,endIndex:Math.min(start+size,rows.length)-1};
        const products=rows.slice(start,start+size);this._pagination.next(pagination);this._products.next(products);return {pagination,products};
      }));
    }
    getProductById(id: string): Observable<demandProductsListDto>
    {
        debugger;
        return this._products.pipe(
            take(1),
            map((products) => {

                // Find the product
                const product = products.find(item => item.id === id) || null;

                // Update the product
                this._product.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }
    createProduct():Observable<demandProductsListDto> {
      // A new editor row is a local draft; it is persisted by createDemandProduct after validation.
      const row={id:null,productId:null,quantity:1,unitprice:0,amount:0,stockState:0,isActive:1,reserved:0,barcode:'',selected:false,taxisId:null};
      this._products.next([row,...(this._products.value||[])]);return of(row);
    }
    get products$(): Observable<demandProductsListDto[]>
    {
        return this._products.asObservable();
    }

}
