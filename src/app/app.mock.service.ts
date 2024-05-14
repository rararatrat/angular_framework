import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiMethod, GridResponse, HelperService, ResponseObj, SharedService, UserPreferences, userPrefType } from '@eagna-io/core';

import { delay, Observable, of, switchMap } from 'rxjs';
import { AppService } from './app.service';
import { LibraryService } from '../../@library/service/library.service';
import { WrapperService } from '@library/service/wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class AppMockService extends AppService {
  constructor(public http: HttpClient,
    public wr: WrapperService,){
    super(http, wr);
    console.log("AppMockService");
  }

  public static getUserPref(): Observable<ResponseObj<UserPreferences>>{
    const toReturn: ResponseObj<UserPreferences> = {
        content: {
        app: [{ui_theme: 'light', appId: 1, app_name: "framework"}],
        grid: {'grid-server-side_grid-test':{
                appId: 1, prefId: 1, gridId: "grid-server-side_grid-test", user_id: "randy.tolentino", isGlobal: true, type: "",
                columns: '{"state":[{"colId":"country","width":200,"hide":false,"pinned":null,"sort":"asc","sortIndex":0,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"athlete","width":220,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"year","width":200,"hide":false,"pinned":null,"sort":"desc","sortIndex":1,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"sport","width":200,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"gold","width":200,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"silver","width":200,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"bronze","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col5_custom","width":340,"hide": true,"pinned":"left","sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col6_autocomplete","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col7_autocomplete","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col8_autocomplete","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col_date","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"unique","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"unique_case_sensitive","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"required","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"required_when","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"date","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"col9_auto_extra","width":200,"hide": true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null}],"groupState":[]}',
                filters: '{"athlete":{"filterType":"multi","filterModels":[{"filterType":"text","operator":"AND","condition1":{"filterType":"text","type":"nonBlanks"},"condition2":{"filterType":"text","type":"equals","filter":"K"}},{"values":["Kateryna Serdiuk"],"filterType":"set"}]},"year":{"filterType":"multi","filterModels":[{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThanOrEqual","filter":2006},"condition2":{"filterType":"number","type":"lessThanOrEqual","filter":2008}},{"values":["Michael Phelps","Kateryna Serdiuk"],"filterType":"set"}]}}',
                charts: "", profileName: "", theme: 'balham'
                },
                'grid_grid-test': {
                appId: 1, prefId: 2, gridId: "grid_grid-test", user_id: "randy.tolentino", isGlobal: true, type: "",
                columns: "{\"state\":[{\"colId\":\"ag-Grid-AutoColumn\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":\"asc\",\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"id\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":\"asc\",\"sortIndex\":2,\"aggFunc\":null,\"rowGroup\":true,\"rowGroupIndex\":0,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col4_date\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col2\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":\"asc\",\"sortIndex\":1,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col3\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":\"asc\",\"sortIndex\":0,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"multiply\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"validate_when\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"required_when\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"date\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col9_auto_extra\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col5_custom\",\"width\":276,\"hide\":true,\"pinned\":\"left\",\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"required\",\"width\":200,\"hide\":false,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col8_autocomplete\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col7_autocomplete\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col6_autocomplete\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"col_date\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"unique\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null},{\"colId\":\"unique_case_sensitive\",\"width\":200,\"hide\":true,\"pinned\":null,\"sort\":null,\"sortIndex\":null,\"aggFunc\":null,\"rowGroup\":false,\"rowGroupIndex\":null,\"pivot\":false,\"pivotIndex\":null,\"flex\":null}],\"groupState\":[]}",
                filters: "{\"col2\":{\"filterType\":\"multi\",\"filterModels\":[{\"filterType\":\"text\",\"type\":\"nonBlanks\"},{\"values\":[null,\"mvodowfd\",\"name1\",\"name2\",\"name3\",\"name4\",\"name5\",\"sdfdfgeg\",\"test1\",\"test2\",\"test3\",\"test4\",\"u9837u\",\"woeurwuir\"],\"filterType\":\"set\"}]}}",
                charts: "", profileName: "", theme: 'balham'
                }
        },
        locale: 'de',
        sidebar: {
          'eag-parent': {modal: false, mode: 'thin', sidebarVisible: true, menuType:"sidebar"},
          'eag-profile': {modal: false, mode: 'compact', sidebarVisible: false, menuType:'sidebar'},
          'eag-crm': {modal: false, mode: 'thin', sidebarVisible: false, menuType:'sidebar'}
        },
      }, status: {status_code: 200, message: 'OK'}
    };
    console.log("getUserPref", toReturn);
    return of(toReturn).pipe(delay(1));
  }

  public override userPreferences(params: any, changeType: userPrefType, method?: apiMethod, extra?: any): Observable<ResponseObj<UserPreferences>> {
    console.log((method || 'post') + " userPreferences mock data", params);
    if(method != "get"){
      const _userPref = JSON.stringify(<UserPreferences>params);
      localStorage.setItem('userPref', _userPref);
    }
    return localStorage.getItem('userPref') ? of(<ResponseObj<UserPreferences>>{
      content: JSON.parse(localStorage.getItem('userPref') || ''), status: {status_code: 200, message: 'OK'}}) : AppMockService.getUserPref();
  }

  public override loginApi(params?: any): Observable<ResponseObj<any>>{
    return of(<ResponseObj<any>>{content: {}});
  }
}
