import { Location, TitleCasePipe } from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import { environment as env } from 'src/environment/environment';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, of, share, Subject, Subscription, switchAll, tap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CoreService, HelperService, ResponseObj, SharedService, UserPreferences, ArrayToObjPipe, GridPeferences, SideBarService, apiMethod, GetInitialsPipe, Core } from '@eagna-io/core';
import { AppService } from '../app.service';
import { LibraryService } from '@library/service/library.service';

let _APP_ID = 1;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{
  public socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  private _api: any = env.apiUrl;
  private _apiWs: any = env.apiWs;
  private _subscription = new Subscription();
  private _ls_user : any;

  constructor(private _http: HttpClient,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _helper: HelperService,
    private _sharedService: SharedService,
    private _appService: AppService,
    private _coreService: CoreService,
    private _arrToObj: ArrayToObjPipe,
    private _sidebarService: SideBarService,
    public _lib: LibraryService,
    private handler: HttpBackend,
    private _titleCase: TitleCasePipe,
    private _initial: GetInitialsPipe
    ) {
      this._subscription.add(this._sharedService.appConfig.app$?.subscribe(_app => {
        _APP_ID = _app.appId;
      }));
    }

  private _processUserInfo(user, encryptDecrypt: 'encrypt' | 'decrypt'): any{ //TODO userModel
    return {
      id                : user.id,
      username          : user.username,
      first_name        : user.first_name,
      last_name         : user.last_name,
      is_superuser      : user.is_superuser, //TODO encrypt/decrypt
      email             : user.email,
      /* app               : user.app, */
      provider          : user.provider,
      groups            : user.groups, //TODO encrypt/decrypt
      user_permissions  : user.groups, //TODO encrypt/decrypt
      picture           : user.picture, //TODO encrypt/decrypt
      globalScheme      : user.globalScheme,//TODO encrypt/decrypt
      globalMenubarPref : user.globalMenubarPref, //TODO encrypt/decrypt
      globalGridPref    : user.globalGridPref, //TODO encrypt/decrypt
      globalChartPref   : user.globalChartPref, //TODO encrypt/decrypt
      globalLocale      : user.locale, //TODO encrypt/decrypt
      hasProvision      : user.provision_verified //TODO encrypt/decrypt
    }
  }


  private _setPreferences(res){

    if(res.status?.status_code == 200 && res?.content){

      // Setting Access  & Refresh Token
      if(res.content.token?.authToken){
        this._lib.setLocalStorage("at", res.content.token.authToken.access_token || "");
        this._lib.setLocalStorage("rt", res.content.token.authToken.refresh_token || "");
      }

      // If Social Auth Sett App Token

      if(res.content.token?.appToken)
      {
        if(res.content.token.appToken.hasOwnProperty("access_token"))
        {
          this._lib.setLocalStorage("apat", res.content.token.appToken.access_token || "");
        }
      }


      //Setting User Details
      if(res.content.user){
        this._sharedService.appConfig.userId = res.content.user.id;

        let initial = '';
        if(res.content.user.first_name || res.content.user.last_name){
          initial = (res.content.user.first_name[0] || '' ) + (res.content.user.last_name[0] || '');
        } else if(res.content.user.email){
          initial = this._initial.transform(res.content.user.email, 0, ['.', '@']);
        } else if(res.content.user.username){
          res.content.user.username.substring(0,2).toUpperCase();
        }

        this._lib.setLocalStorage("user", JSON.stringify(res.content.user ? this._processUserInfo(res.content.user, 'encrypt')  : '{}'));
        this._lib.setLocalStorage("initial", initial);
        this._lib.setLocalStorage("new_notif", res.content.user.hasNotification);
      }

      //Declaring User Pref
      let locale  : any                        = SharedService.defaultUserPref.locale;
      let grid    : {[p: string]: GridPeferences} = {};
      let sidebar : {[p: string]: any} = {};

      if(res.content.user){
        if(res.content.user.app){
          //Setting Grid Perferences
          const _userGrid = (<GridPeferences[]>res.content.user?.grid);
          if(_userGrid){
            //grid = _userGrid;
            grid = this._arrToObj.transform(_userGrid, "gridId");
          }

          //Setting Sidebar Perferences
          const _userSidebar: any[] = res.content.user?.menu;
          if(_userSidebar){
            _userSidebar.forEach(_u => {
              if(_u){
                sidebar = {...sidebar, ...this._arrToObj.transform(_u, "sidebarId")};
              }
            });
          }
        }

        //Setting Locale Perferences en-GB = en
        locale = typeof res.content.user.locale == 'string' && res.content.user.locale?.startsWith('en') ? 'en' : res.content.user.locale;
        this._coreService.setLocale(locale);
      }

      const _userPref: UserPreferences = {
        app: res.content.user.app,
        //app: [],
        locale,
        grid,
        sidebar
      };

      //put to sharedservice object the userdetails
      this._sharedService.userPref[(this._sharedService.appConfig?.appName || 'no-app')] = _userPref;

      //put to localstorage but not the app
      this._lib.setLocalStorage('userPref', JSON.stringify(<UserPreferences>{
        ..._userPref, app: []
      }));

      //this._lib.setLocalStorage("app", JSON.stringify(res.content.user.app))
      let _tmp = (this._helper.isNotEmpty(this._lib.getLocalStorage('landedUrl'))) ? this._lib.getLocalStorage('landedUrl') : (this._lib.getLocalStorage('lastUrl') || '/');
      let _redirectTo = '/';

      if(!_tmp || ['/login',  '/auth/login', ''].includes(_tmp)){
        //do nothing
      } else{
        _redirectTo = _tmp;
      }
      localStorage.setItem('lastUrl', _redirectTo);
      localStorage.setItem('landedUrl', _redirectTo);
      /* this._router.navigate([_redirectTo]); */
      this._helper.gotoPage({pageName: [_redirectTo], extraParams: {}});
    }
    return res;
  }

  public login(user, pwd): Observable<any> {
    const _device = this._appService.instanceInfo$.value;
    const req = {
      username: user,
      password: pwd,
      org:this._lib.getLocalStorage('o_id'),
      ..._device

    }
    return this._appService.loginApi(req).pipe(map((res: ResponseObj<any>) => {
        let temp = this._setPreferences(res);
        return temp;//if response content type is json
      }),
      catchError(err => {
        throw new Error("Invalid Credentials");
      })
    )
  }

  public logout(){
    const _logoutComplete = () => {
      const _org = this._lib.getLocalStorage("o_id")
      localStorage.clear();
      const _locPath = this._location.path();
      const currPath = (_locPath != "" && _locPath != "/logout") ? _locPath : "/";
      this._lib.setLocalStorage("lastUrl", currPath);

      const _lastLocale = this._sharedService.userPref[(this._sharedService.appConfig?.appName || 'no-app')].locale
      this._lib.setLocalStorage("userPref", JSON.stringify({locale: _lastLocale}));
      this._lib.setLocalStorage("o_id", _org);

      this._router.navigate(['/auth/login']);
    }

    this._subscription.add(this._appService.logoutApi({rt: this._lib.getLocalStorage('rt')}).subscribe({
      next : res => {
        _logoutComplete();
      },
      error: err => {
        if(err.status == 401){ //if logout is impossible using current token, force logout
          _logoutComplete();
        }
        catchError(err);
      }
    }));
  }

  public signUp(req): Observable<any> {
    return this._http.post(`${this._api}auth/verify/register/`, req).pipe(
      catchError(err => {
        throw new Error("Invalid Credentials");
      })
    )
  }

  public fetchApp(initial = false): Observable<any>{ //TODO: app[] interface
    const _mapApp = _app => {
      const _appName = (_app.app_name || 'no-app-name').toLowerCase();
      return {
        id: _app.id,
        state: _app,
        routerLink: _app.appId == 1 ? ['/'] : [_appName +'/'],
        label: Core.Localize(_appName) || this._titleCase.transform(_appName), //TODO: test
        icon:"pi pi-th-large text-primary-900"
      }
    };

    const _apps = this._sharedService.userPref[(this._sharedService.appConfig?.appName)].app;
    if(!initial && this._helper.isNotEmpty(_apps)){
      return of(_apps.map(_mapApp));
    } else{
      return this._appService.appPreferences({userId: this._sharedService.appConfig.userId}, "post").pipe(map((res: any) => {
        let tempArr = res?.content?.results /* || [{}] */;
        //this._lib.setLocalStorage('app', JSON.stringify(tempArr));
        return tempArr.map(_mapApp);
      }));
    }
  }

  public verifyUser(params): Observable<any>{
    return this._http.post(`${this._api}auth/verify/verify-registration/`, params)
  }

  public verifyEmail(params): Observable<any>{
    return this._http.post(`${this._api}auth/verify/verify-email/`, params)
  }

  public registerEmail(params): Observable<any>{
    return this._http.post(`${this._api}auth/verify/register-email/`, params)
  }

  public verifyPassword(params): Observable<any>{
    return this._http.post(`${this._api}auth/verify/reset-password/`, params)
  }

  public resetPasswordLink(params): Observable<any>{
    return this._http.post(`${this._api}auth/change_password/`, params)
  }

  public socialLogin(type, social, queryParams?) : Observable<any>
  {
    let retUrl : Observable<any> = null;
    switch(type){
      case "token":
        retUrl = this._http.post(`${this._api}auth/${social}/callback/`, {params:queryParams}).pipe(map(
          (res: ResponseObj<any>) => {
            let temp = this._setPreferences(res);
            return temp;//if response content type is json
          }),
          catchError(err => {
            throw new Error("Invalid Credentials");
          })
        )
        break;
      case "url":
        retUrl =  this._http.get(`${this._api}auth/${social}/url/`);
        break;
    }
    return retUrl;
  }

  public isLoggedIn() {
    let _user: any = this._lib.getLocalStorage("user");
    if(_user){
      _user = JSON.parse(_user);

      if(_user?.id){
        if(!this._sharedService.appConfig.user){
          this._sharedService.appConfig.user = _user;
        }
        if(!this._sharedService.appConfig.userId){
          this._sharedService.appConfig.userId = _user.id;
        }
        return this._helper.isNotEmpty(this._lib.getLocalStorage("at"));
      }
      return false;
    }

    return false;
  }

  public isJedi(): boolean {
    if (this._lib.getLocalStorage("ij") === "true") {
      return true;
    } else {
      return false;
    }
  }

  public sendEmail(): Observable<any> {
    return this._http.get(`${this._api}user/email/`);
  }

  public isUserAuthorized(currentUrl, apps, appId, snapshotData){
    let authorized : boolean = true;

    const _oldAppId = (appId * 1);
    /* this.appId = 1; */
    let _findAppName;
    if(currentUrl && currentUrl != "/"){
      _findAppName = currentUrl.replace('/', '').split('/')?.[0];
    }

    let _foundApp: any;
    if(snapshotData?.['APP_ROUTE'] && _findAppName){
      _foundApp = apps.find(_app => (_app.state?.['app_name'] == _findAppName));
      if(_foundApp){
        appId = (_foundApp.state['appId'] * 1);
      } else{
        /* console.error("**Forbidden Access**"); */
        authorized = false;
      }
    } else{
      _foundApp = apps.find(_app => _app.state?.['appId'] == appId);
    }

    if(_foundApp){
      const ui_theme = _foundApp.state['ui_theme'];
      this._sharedService.appConfig.app$?.next((_foundApp?.state || {}));
      setTimeout(() => {
        this._coreService.setDarkMode(ui_theme);
      });
    }
    return authorized;
  }
  // to remove these are old scripts to test web sockets

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
