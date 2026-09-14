import {Injectable} from '@angular/core';import {BehaviorSubject,Observable,defer} from 'rxjs';import {User} from './user.types';import {ClinicClientService} from 'app/core/supabase/clinic-client.service';
@Injectable({providedIn:'root'}) export class UserService {
 private readonly emptyUser:User={id:'',name:'',email:''};private state=new BehaviorSubject<User>(this.emptyUser);constructor(private clinics:ClinicClientService){}set user(v:User){this.state.next(v??this.emptyUser);}get user$():Observable<User>{return this.state.asObservable();}
 get():Observable<User>{return defer(async()=>{const p=await this.clinics.loadProfile();const u={id:p.id,name:p.name,email:p.email};this.user=u;return u;});}
 update(user:User):Observable<User>{return defer(async()=>{const db=await this.clinics.client();const {error}=await db.auth.updateUser({data:{display_name:user.name}});if(error)throw error;this.user=user;return user;});}
}
