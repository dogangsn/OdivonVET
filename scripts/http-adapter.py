from pathlib import Path
root=Path(__file__).resolve().parents[1]
(root/'src/app/core/auth/Http.service.ts').write_text('''import {Injectable} from '@angular/core';
import {defer, Observable} from 'rxjs';
import {VetDataService} from 'app/core/supabase/vet-data.service';
@Injectable({providedIn:'root'})
export class HttpService {
 constructor(private data:VetDataService){}
 get(url:string):Promise<any>{return this.data.execute(url);}
 getRequest(url:string):Observable<any>{return defer(()=>this.data.execute(url));}
 post(url:string,body:unknown):Observable<any>{const key=crypto.randomUUID();return defer(()=>this.data.execute(url,body,key));}
 put(url:string,body:unknown):Observable<any>{return this.post(url,body);}
 delete(url:string,body:unknown):Observable<any>{return this.post(url,body);}
 run<T>(url:string,body:unknown,options?:object):Observable<any>{return this.post(url,body);}
 signUp(url:string,body:unknown):Observable<any>{return this.post(url,body);}
 signIn(url:string,body:unknown):Observable<any>{throw new Error('Use Supabase Auth');}
}
''',encoding='utf-8')
