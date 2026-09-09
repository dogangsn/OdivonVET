import {Injectable} from '@angular/core';
import {HttpEvent,HttpHandler,HttpInterceptor,HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
 // Supabase scopes credentials to its own project. Do not attach clinic tokens globally.
 intercept(req:HttpRequest<unknown>,next:HttpHandler):Observable<HttpEvent<unknown>>{return next.handle(req);}
}
