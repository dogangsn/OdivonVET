from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'src/app/core/services/Demands/DemandProducts/demandproducts.service.ts';s=p.read_text(encoding='utf-8')
a=s.index('    getProducts(');b=s.index('    getProductById(',a)
s=s[:a]+'''    getProducts(page=0,size=10,sort='name',order:'asc'|'desc'|''='asc',search=''):Observable<{pagination:InventoryPagination;products:demandProductsListDto[]}> {
      return this.getDemandProductsList().pipe(map(response=>{
        const rows=response.data.filter(r=>JSON.stringify(r).toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
        rows.sort((a,b)=>String(a[sort]??'').localeCompare(String(b[sort]??''),'tr')*(order==='desc'?-1:1));
        size=Math.max(1,Math.min(size,100));page=Math.max(0,page);const start=page*size;
        const pagination={length:rows.length,size,page,lastPage:Math.max(0,Math.ceil(rows.length/size)-1),startIndex:start,endIndex:Math.min(start+size,rows.length)-1};
        const products=rows.slice(start,start+size);this._pagination.next(pagination);this._products.next(products);return {pagination,products};
      }));
    }
'''+s[b:]
a=s.index('    createProduct()');b=s.index('    get products$',a)
s=s[:a]+'''    createProduct():Observable<demandProductsListDto> {
      // A new editor row is a local draft; it is persisted by createDemandProduct after validation.
      const row={id:null,productId:null,quantity:1,unitprice:0,amount:0,stockState:0,isActive:1,reserved:0,barcode:'',selected:false,taxisId:null};
      this._products.next([row,...(this._products.value||[])]);return of(row);
    }
'''+s[b:]
s=s.replace("import { HttpClient } from '@angular/common/http';",'').replace(',private _httpClient : HttpClient','');p.write_text(s,encoding='utf-8')
