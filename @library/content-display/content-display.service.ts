import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiMethod, HelperService, ResponseObj, SharedService } from '@eagna-io/core';

import { WrapperService } from '@library/service/wrapper.service';

import { firstValueFrom, Observable, share } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CrmService } from 'src/app/crm/crm.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { environment as env } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentDisplayService extends AppService {

  constructor(public http: HttpClient, public wr: WrapperService, public crm: CrmService, public settings : SettingsService) {
    super(http, wr);
  }

  public searchAddress(params?: any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}external/address/`, params, 'get').pipe(share())
  }
  public getPlace(params?: any, method: apiMethod = 'post'): Observable<any>{
    return this.submitHttpRequest(`${env.apiUrl}external/place/`, params, method)
  }

  public getPublicHolidays(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}external/publicHolidays/`, params, method).pipe(share());
  }

}
