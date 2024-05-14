import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiMethod, ResponseObj,} from '@eagna-io/core';
import { Observable, share } from 'rxjs';
import { AppService } from '../app.service';
import { environment as env } from 'src/environment/environment';

import { WrapperService } from '@library/service/wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends AppService {

  constructor(public http: HttpClient, public wr:WrapperService, private _handler: HttpBackend) {
    super(http, wr);
  }

  public user(params?: any, method: apiMethod = 'get'): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}user/list/`, params, method)
  }
  public activate_mfa(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/activate-mfa/`, params, method)
  }
  public generate_mfa(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/generate-mfa/`, params, method)
  }

  public app_pref(params?: any, method: apiMethod = 'get'): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}settings/app_preferences/`, params, method)
  }
  public menu_pref(params?: any, method: apiMethod = 'get'): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}settings/menu_pref/`, params, method)
  }
  public grid_pref(params?: any, method: apiMethod = 'get'): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}settings/grid_pref/`, params, method)
  }


  public getIpAddress(): Observable<any>{
    let temp = new HttpClient(this._handler);
    return temp.get("https://api.ipify.org?format=json")
  }

  public getUserLocation(ipAddress): Observable<any>{
    let temp = new HttpClient(this._handler);
    return temp.get(`https://freegeoip.app/json/${ipAddress}`)
  }

  public registerEmail(params): Observable<any>{
    return this.submitHttpRequest(`${env.apiUrl}auth/verify/register-email/`, params, "post");
  }

  public approvals(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/transactions/`, params, method)
  }
  public groups(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/groups/`, params, method)
  }

  public preferences(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/app_preferences/`, params, method)
  }

  public authentication_logs(params?: any, method: apiMethod = 'post', n?): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}user/authentication_logs/`, params, method)
  }

  public activity_logs(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/notif_pref/`, params, method)
  }

  public notification_catalogue(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}comms/notification_catalogue/`, params, method)
  }
  public notification_list(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}comms/notifications/`, params, method).pipe(share());
  }

  public activities_list(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}comms/activities/`, params, method).pipe(share());
  }



}
