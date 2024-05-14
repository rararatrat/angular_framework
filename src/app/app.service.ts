
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { apiMethod, AppPreferences, GridResponse, HelperService, ResponseObj, SharedService, UserPreferences, userPrefType } from '@eagna-io/core';
import { AbstractCoreService } from '@eagna-io/core/lib/abstract-core';

import { ColDef, ColGroupDef } from 'ag-grid-community';

import { BehaviorSubject, Observable, of, share, Subject, Subscription, switchMap, tap } from 'rxjs';
import { environment as env } from '../environment/environment';



import { WebSocketSubject} from "rxjs/webSocket";
import { WebsocketService } from '../../@library/service/websocket.service';
import { WrapperService } from '@library/service/wrapper.service';


export interface ApiRequestParams{
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  params?: any;
  toGrid?: boolean;
}

let _APP_ID = 1;
let _PREF_ID: number;

@Injectable({
  providedIn: 'root'
})
export class AppService implements AbstractCoreService, OnDestroy {
  private _subscription = new Subscription();
  public ws$            : WebSocketSubject<any>;
  public webSocket$     : any = new Subject();
  public notification$  : any = new Subject<any>();
  public instanceInfo$  : any = new BehaviorSubject<any>({});
  private webSocket: WebSocket;
  private readonly SERVER_URL = 'ws://localhost:8080/ws';

  constructor(
    private _http: HttpClient,
    private _wr: WrapperService,
    @Optional() private _location?: Location,
    @Optional() private _router?: Router,
    @Optional() public wss ?: WebsocketService,
    ) {
    this._subscription.add(this._wr.sharedService.appConfig.app$?.subscribe(_app => {
      _APP_ID = _app?.appId;
      _PREF_ID = _app?.id;
    }));
  }


  //Service specific methods
  protected transformResults(obj, toGrid = false): Observable<ResponseObj<GridResponse>>{
    let _toTransform = JSON.parse(JSON.stringify(obj));
    if(!this._wr.helperService.isResponseObj(obj)){
      if(toGrid && !this._wr.helperService.isGridResponse(obj)){
        _toTransform = <GridResponse>{results: obj, total: (obj || []).length};
      }
      _toTransform = <ResponseObj<GridResponse>>{content: _toTransform, status: {status_code: 200, message: 'OK'}};
    }
    return of(_toTransform);
  }

  protected submitHttpRequest(url: string, params?: any, method = 'get', toGrid = false, byPassOrg=true): Observable<ResponseObj<any>>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if(method == 'get' && this._wr.helperService.isNotEmpty(params)){ //for (get with limit/offset to still work)
      const _params = JSON.parse(JSON.stringify(params));
      delete _params.limit;
      delete _params.offset;
      if(this._wr.helperService.isNotEmpty(_params)){
        method = "post";
      }
    }

    let _params = params;
    try {
      const _org = JSON.parse(this._wr.libraryService.getLocalStorage('org'));
      if(!byPassOrg && _org?.id){
        let _hasOtherParams = false;
        Object.keys(params).forEach(key => {
          if(!_hasOtherParams && !['sort', 'limit'].includes(key)){
            _hasOtherParams = true;
          }
        });
        if(!_hasOtherParams){
          /* console.trace({params}); */
          if(method == 'put'){
            (<FormData>_params)?.append('org', _org.id);
          } else{
            _params = {..._params, org: _org.id};
          }
        }
      }
    } catch (error) {}

    switch(method){
      case 'post': 
        return <Observable<any>>this._http?.post(url, _params).pipe(share());
      case 'put': return <Observable<any>>this._http?.put(url, _params).pipe(share());
      case 'patch': return <Observable<any>>this._http?.patch(url, _params /* , {observe: 'events', reportProgress: true} */).pipe(share());
      case 'delete': return <Observable<any>>this._http?.delete(url, {params}).pipe(share());
      case 'options': return <Observable<any>>this._http?.options(url, params).pipe(share());
      case 'mail'   : return <Observable<any>>this._http?.request('MAIL', url, params).pipe(share());
      case 'view'   : return <Observable<any>>this._http?.request('VIEW', url, {headers}).pipe(share());
      default: return <Observable<any>>this._http?.get(url, {params}).pipe(switchMap((res) => this.transformResults(res, toGrid)),share());
    }
  }

  //AbstractCore Implementation

  public getLocale(){
    if(localStorage != null && localStorage.getItem("userPref") != null){
      const temp = JSON.parse(localStorage.getItem("userPref"));
      console.log(temp.locale);
      return temp.locale;
    }
  }


  public getColumnDefs(gridId: string, extraParams?: any): (ColDef | ColGroupDef)[] {
    let _cols: ColDef[] = [];
    switch(gridId){
      default: _cols = [];
    }
    return _cols;
  }



  public userPreferences(params: any, changeType: userPrefType, method?: apiMethod, extra?: any): Observable<ResponseObj<UserPreferences>> {
    if(method != "get"){
      const storeLocalUserPref = () => {
        const _userPref = JSON.stringify(<UserPreferences>{...params, app: []});
        this._wr.libraryService?.setLocalStorage('userPref', _userPref);
      }

      //write to API
      let _settingUrl = 'settings/';
      let _settingParams: any;
      let sidebarId;

      switch(changeType){
        case 'am': /* TODO: */ break;
        case 'darkMode':
          _settingUrl += 'app_preferences';

          if(method == 'patch'){
            _settingParams = {
              id: (<AppPreferences>extra).id,
              ui_theme: (<AppPreferences>extra).ui_theme
            };
          } else if(method == 'post') {
            _settingParams = extra;
          }
          break;
        case 'gridPref':
        case 'gridTheme':
          method = "patch"; //override the default when updating
          _settingUrl += 'grid_pref';
          if(extra?.gridId){ //when grid theme or preferences is set from Grid Component
            const currentGrid = (<UserPreferences>params).grid[extra?.gridId];
            if(currentGrid){
              if(!currentGrid.columns){
                currentGrid.columns = "{state: []}";
              }
              if(!currentGrid.filters){
                currentGrid.filters = "{}";
              }

              _settingParams = {...currentGrid, prefId: _PREF_ID};
              if(!_settingParams.id){
                method = "put";
              }
            }
          }
          break;
        case 'locale':
          _settingUrl = 'user/list';
          if(method == 'patch'){
            _settingParams = {
                id: (this._wr.sharedService?.appConfig.userId || 0),
                locale: (<UserPreferences>params).locale,
              };
          }
          break;
        case 'sidebar':
          /*const ls = JSON.parse(this._lib.getLocalStorage("user"));
          const isGlobalMenubarPref = ls['globalMenubarPref'] == true
          sidebarId = (isGlobalMenubarPref && (<UserPreferences>params)?.sidebar?.['all']) ? 'all' : extra?.sideBarId; */
          sidebarId = extra?.sideBarId;

          _settingUrl += 'menu_pref';
          _settingParams = {
                ...((<UserPreferences>params)?.sidebar?.[sidebarId]),
                prefId: _PREF_ID,
                sidebarId
          };

          if((<UserPreferences>params)?.sidebar?.[sidebarId]){
            params.sidebar[sidebarId] = {...params.sidebar?.[sidebarId], ..._settingParams};
          }

          if(!_settingParams.id){
            method = "put";
          }
          break;
      }

      //write back to localstorage and call api except when sidebar is using all
      storeLocalUserPref();

      return this.submitHttpRequest(`${env.apiUrl}${_settingUrl}/`, _settingParams, method).pipe(tap((res: ResponseObj<any>) => {
        if(method == 'put'){
          const newId = res.content?.results?.[0]?.id;
          if(newId){
            if(changeType == 'gridPref' || changeType == 'gridTheme'){
              if((<UserPreferences>params)?.grid[extra?.gridId]){
                params.grid[extra?.gridId].id = newId;
              }
              storeLocalUserPref();

            } else if(changeType == 'sidebar' && (<UserPreferences>params)?.sidebar?.[sidebarId]){
              params.sidebar[sidebarId].id = newId;
              storeLocalUserPref();
            }
          }
        }
      }));
    }

    //return either what's in localstorage or from api
    return localStorage.getItem('userPref') ? of(<ResponseObj<UserPreferences>>{
      content: JSON.parse(localStorage.getItem('userPref') || ''), status: {status_code: 200, message: 'OK'}
    }) : this.submitHttpRequest(`${env.apiUrl}userPreferences/`, params, method);
  }

  //apis
  public loginApi(params?: any, method: apiMethod = 'post'){
    return this._http.post(`${env.apiUrl}auth/login/`, params);
  }

  public logoutApi(params?: any, method: apiMethod = 'post'){
    return this._http.post(`${env.apiUrl}auth/logout/`, params);
  }

  public fetchApps(params?: any, method?: apiMethod){
    return this.submitHttpRequest(`${env.apiUrl}settings/app_preferences/`, params, method);
  }

  public appPreferences(params?: any, method?: apiMethod): Observable<ResponseObj<any>> {
    return this.submitHttpRequest(`${env.apiUrl}settings/app_preferences/`, params, method);
  }

  public apps(params?: any, method?: apiMethod): Observable<ResponseObj<any>> {
    return this.submitHttpRequest(`${env.apiUrl}settings/app/`, params, method);
  }

  public myOrganization(params?: any, method?: apiMethod): Observable<ResponseObj<any>> {
    return this.submitHttpRequest(`${env.apiUrl}settings/init_org/${params.id}`, params, method);
  }

  public orgSubject = new BehaviorSubject<any>({});


  public fetchNotifs(params?: any, method?: apiMethod): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}notifs/`, params, method);
  }

  public fetchChats(params?: any, method?: apiMethod): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}chat/`, params, method);
  }

  /* public refreshPage(loc?: Location){
    const _loc = (loc || this._location)?.path();
    if(this._helper.isNotEmpty(_loc) && this._router){
      this._router.navigate(['/'], {skipLocationChange: true}).then(() => {
        this._router.navigate([_loc]);
      });
    }
  } */

  public wssNotification(url?) {
    return this.wss.connect("comms/notifications/");
  }


  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
