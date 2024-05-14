import { Component, EventEmitter, Inject, Input, ChangeDetectionStrategy, OnDestroy, OnInit, Output, ViewChild, ChangeDetectorRef, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MenuItems, MenuSideBarSettings, RouteObserverService, SharedService, SideBarService, UserPreferences, Core, AbstractCoreService, SidebarComponent, sideBarMode, ResponseObj, GridResponse } from '@eagna-io/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { WrapperService } from '@library/service/wrapper.service';
import WebFont from 'webfontloader';
import { BehaviorSubject, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';

import { SubSink } from 'subsink2';
/* import * as L from 'leaflet'; */
import { UserbarComponent } from '@library/navigation/userbar/userbar.component';
import { AuthService } from 'src/app/auth/auth.service';
import { Breadcrumb } from 'primeng/breadcrumb';
import { SettingsService } from 'src/app/settings/settings.service';


@Component({
  selector: 'eg-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
  providers: [
    {provide: AbstractCoreService, useClass: AppService},
    {provide: AppService, useClass: AppService},
    /* {
      provide: LOCALE_ID,
      deps: [AppService],      //some service handling global settings
      useFactory: (appService) => appService.getLocale()  //returns locale string
    } */
  ]
})
export class MainContainerComponent extends RouteObserverService implements OnInit, OnDestroy, AfterViewChecked {

  @Input("data")                data                : any;
  @Output("dataChange")         dataChange          : EventEmitter<any> = new EventEmitter();


  @Input("appId")               appId               : any;
  @Output("appIdChange")        appIdChange         : EventEmitter<any> = new EventEmitter();

  @Output("callback") callback  : EventEmitter<any> = new EventEmitter();

  @ViewChild('eagSideBar')  eagSideBar: SidebarComponent | undefined;
  @ViewChild('eagBreadcrumb')  eagBreadcrumb: Breadcrumb | undefined;
  @ViewChild('userBar')     userBar   : UserbarComponent;

  public resolution         : any;
  public isLoading          : boolean = true;
  public translationDone    : boolean = false;
  public deviceInfo         : any;
  public isGlobalMenuPref   : boolean;
  public items              : MenuItem[];
  public menuItems          !: MenuItems[];
  public toggleMenu         !: MenuItem[];
  private _userPref         ?: UserPreferences;
  public new_notif          : boolean = null;
  public currOrg            : any = null;
  private _themeArr         : any = [];
  public logoSrc            : any = null;
  public home               : MenuItem = {icon: PrimeIcons.HOME, routerLink: '/'};
  public currentUrl         : String;
  private _subs             : SubSink = new SubSink();

  public authorized         : boolean = true;
  public isAuth             : boolean = false;
  public isMobile             : boolean = false;
  public apps               ?: MenuItem[];
  public initials           ?: string;
  public shared             : any;
  public isSidebarHidden    : boolean = false;
  public showBreadCrumbs    : boolean = true;
  private _map              : any;
  public isVisible          : boolean = false;
  public sidebarState       : boolean = true;
  private _copyBreadCrumbs  : any;
  public orgMenuItems       : MenuItem[];
  public isHome             : boolean = false;
  public isTranslationDone  = false;
  public orgLogo: string;

  constructor(private _wr : WrapperService,
              private _sidebar: SideBarService,
              public _app : AppService,
              private _abstractCore: AbstractCoreService,
              private _auth: AuthService,
              private _activatedRoute: ActivatedRoute,
              private _cdr: ChangeDetectorRef,
              private _router: Router,
              private _settings: SettingsService
              )
  {
    super(_activatedRoute, _router);
    this.shared = this._wr.sharedService;
    this._app.webSocket$ = this._app.wssNotification();



    this._setBreadCrumbs();
    /* temp */
    /* this.isMobile = true;
    document.body.style.width = "100vw";
    document.body.style.height = "100vh"; */

  }

  ngOnInit(): void {
    this._subs.sink = this._sidebar.sidebar$.subscribe(res => {
      this.isVisible = res.isVisible || res.items.length > 0;
      this.sidebarState = this.isVisible;
      this._sideBarWidth(res.mode);
    })


    this.snapshotLoaded = true;

    let scssVarLogo = document.documentElement.style.getPropertyValue(`--brand-logo`);
    this.logoSrc = (scssVarLogo == "") ? "../assets/img/eg_rd_black.png" : scssVarLogo.toString();

    try {
      const _orgData = JSON.parse(this._wr.libraryService.getLocalStorage('org'));
      
      if(_orgData?.logo){
        this.orgLogo = _orgData.logo;
      }
    } catch (error) {}

    this._fetchData(1);

    this._setUserPref();


    //this.snapshotLoaded = true;
  }

  private _sideBarWidth(data:sideBarMode){
    switch(data){
      case "compact":
        /* the sidebar width is 8rem: adding 0.6rem for padding */
        document.documentElement.style.setProperty(`--sidebar-width`, "8.6rem")
        break;
      case 'thin':
        /* the sidebar width is 5rem: adding 0.6rem for padding */
        document.documentElement.style.setProperty(`--sidebar-width`, "5.6rem")
        break;
      case 'list':
        /* the sidebar width is 18rem: adding 0.6rem for padding */
        document.documentElement.style.setProperty(`--sidebar-width`, "18.6rem")
        break;
    }
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    const device = this._wr.libraryService.detectDeviceType(event);
    /* document.documentElement.style.setProperty(`--min-width`, event.target.innerWidth) */
    if(device != "mobile"){
      this.isMobile = false;
      document.documentElement.style.setProperty(`--min-width`, event.target.innerWidth)
    }else{
      this.isMobile = true;
      document.body.style.width = "100vw";
    }


  }

  private _setBreadCrumbs(){

    if(this.shared != undefined || this.shared?.globalVars?.breadcrumbs.length > 0){
      this._copyBreadCrumbs = this.shared.globalVars;

    }else{
      this.shared.globalVars = this.shared.globalVars;
      this.eagBreadcrumb.ngAfterContentInit();
    }

    if(this.shared == undefined || this.shared?.globalVars?.breadcrumbs?.length ==  0){
      this.shared.globalVars = this._copyBreadCrumbs;

    }
    this.showBreadCrumbs = true;

  }

  public toggleSideBar(){
    const _temp = this._sidebar.sidebar$.value;
    _temp.isVisible = !_temp.isVisible;
    this._sidebar.sidebar$.next(_temp);
    this.sidebarState = _temp.isVisible;
  }

  private _checkTranslations(){
    this._subs.id('translations').sink = this._wr.coreService.translationDone$.subscribe((_ttrans) =>{
      this.translationDone = true;
      this._subs.id('translations').unsubscribe();
    })
  }

  public onRouteReady(event?: any[]): void{
    const previousEvent = event[event.length-2];
    const lastEvent = event[event.length-1];
    this.currentUrl = lastEvent?.url;

    this.isAuth = this.currentUrl.includes('/auth/register') || this.currentUrl.includes('/auth/login') || this.currentUrl.includes('/auth/verify') || this.currentUrl.includes('/auth/forgotPassword');
    this.isHome =  this.currentUrl == '/' || this.currentUrl.includes('/search/');
/*     this.isMobile = this.currentUrl.includes('/mobile');
 */
    if(previousEvent?.url?.includes('/auth/login') || previousEvent?.url?.includes('/auth/verify') || previousEvent?.url?.includes('/auth/forgotPassword')){ //check if previous screen is login/verify
      this._userPref = <UserPreferences>JSON.parse(localStorage.getItem('userPref') || '{}');


      this._initApps('onRouteReady').then(() => {
        this._checkAppAuthorized();
        this._checkTranslations();
        this._cdr.detectChanges();
      }).catch(e => {
        if((<HttpErrorResponse>e).status == 401){
          //console.warn("NO ACCESS TO APP, logging out");

          /* this._auth.logout(); */
          this.isLoading = false;
          this._cdr.detectChanges();
        } else{
          //console.warn("error", e);
        }
      }).finally(() => {
        if(this.translationDone){
          this.isLoading = false;
          this._setBreadCrumbs();
          this._cdr.detectChanges();
        }
      });
    }



  }

  public onRouteReloaded(event,snapshot, rootData, rootParams) : void{
    /* this.isMobile = this.currentUrl.includes('/mobile'); */
    this.isHome =  this.currentUrl == '/' || this.currentUrl.includes('/search/');
    if(!this.isAuth){
        this.menuItems = [];

        this._initApps('onRouteReloaded').then(() => {
          this._checkAppAuthorized();
        }).catch(e => {
          //console.warn("init apps after onRouteReloaded", e);
          if((<HttpErrorResponse>e).status == 401){
            console.warn("NO ACCESS TO APP, logging out");
            /* this._auth.logout(); */
          } else{
            //console.warn("error", e);
          }
          this._cdr.detectChanges();
        });
      }else{
        //this.initMap(this.currOrg);
      }
      this._setBreadCrumbs();
  }

  private _fetchData(org){
    this.isLoading = true;
    this._app.myOrganization({id: org}, "post").subscribe({
      next      : (res) => {
        //this.currOrg = res.content.results[0]['organization'];
        this.currOrg = res.content.results[0];
        if(!this._wr.libraryService.getLocalStorage('org')){
          try {
            this._wr.libraryService.setLocalStorage('org', JSON.stringify(this.currOrg));
          } catch (error) {}
        }
        this._wr.libraryService.setLocalStorage('o_id', this.currOrg?.id);
        this._app.orgSubject.next(this.currOrg);
        if(this.isAuth){
          //this.initMap(this.currOrg);
        }
      },
      error     : (err) => {
        this._loadFonts('Roboto');
        this.logoSrc = "../assets/img/eg_rd_black.png" ;
        this.isLoading = false;
        this._cdr.detectChanges();

      },
      complete  : () => {
        if(this.currOrg != null){
          let branding = this.currOrg.__data__?.branding;
          this.logoSrc = this.currOrg.logo || "../assets/img/eg_rd_black.png" ;
          this._loadFonts(branding?.['font_family'] || 'Roboto');
          try{
            this._wr.libraryService.setAppUiTheme(this.currOrg);
          } catch(err){
            this.isLoading = false;
            this._cdr.detectChanges();
          }
          this.isLoading = false;
          this._cdr.detectChanges();
        }

        /* setTimeout(e => {
          this.isLoading = false;
        }, 1000); */
      },
    })
  }

  private _loadFonts(font?) {
    let tFont = font || "Roboto";
    WebFont.load({
      google: {
          families: [ tFont + ' Condensed:100,300,400,500,700,900',
                      tFont + ' Mono:100,300,400,500,700,900',
                      tFont + ':100,300,400,500,700,900'
                    ],
      },
      loading :() => {
        this.isLoading = true
        this.deviceInfo = this._wr.libraryService.setDevice(this._wr.libraryService.resolutionArray);

      },
      active :() => {

        setTimeout(e => {
          this.isLoading = false;
        }, 1000);
      },
      inactive :() => { },
    });
  }

  private _setUserPref(){
    this.isLoading = true;

    let _nextUserPref = (userPref: UserPreferences) => {
      if(!this._wr.sharedService.userPref$){
        this._wr.sharedService.userPref$ = new BehaviorSubject<UserPreferences>(userPref);
      } else{
        this._wr.sharedService.userPref$.next(userPref);
      }
      this._userPref = userPref;

      this._wr.coreService.translationDone$.subscribe(_ttrans => {
        //SETUP the menu items

        this._initLocale();
        this._initApps('localize', true).then(() => {
          setTimeout(() => {
            this._checkAppAuthorized();
          }, 1);
        }).catch(e => {
          if((<HttpErrorResponse>e).status == 401){
            //console.warn("NO ACCESS TO APP, logging out");
            /* this._auth.logout(); */
          } else{
            //console.warn("error", e);
          }
        }).finally(()=>{
          this._wr.communicationService.updateNotificationfavicon();
          this.snapshotLoaded = true;
          this.isLoading = false;
          this.isTranslationDone = true;
          this._cdr.detectChanges();
        });

        if(_ttrans=='changed'){
          this._wr.coreService.createBreadcrumbs(this._activatedRoute.root)
        }
      });

    };

    if(this._auth.isLoggedIn()){
      this._wr.coreService.setAndGetUserPreferences(this._abstractCore, false, this._wr.sharedService.userPref).subscribe({next: userPref => {
          if(this._wr.sharedService.userPref){
            this._wr.sharedService.userPref[(this._wr.sharedService.appConfig?.appName || 'no-app')] = userPref;
            _nextUserPref(userPref);
          }
        }, error: err => {
          //console.warn("setAndGetUserPreferences error", err)

          if(this._wr.sharedService.userPref){
            this._wr.sharedService.userPref[(this._wr.sharedService.appConfig?.appName || 'no-app')] = ({} as UserPreferences);
            _nextUserPref(SharedService.defaultUserPref);
          }
        }, complete: () => {
          this._subs.add(this._wr.sharedService.userPref$?.subscribe(_userPref => {
            if(this.isLoading){
              this._userPref = _userPref;

              this._initLocale();
            }
          }));
        }
      });
    } else{
      this._wr.coreService.translationDone$.subscribe(_ttrans => {
        this.isLoading = false;
        this.isTranslationDone = true;
      });
    }
  }

  private _initApps(fromWhere, initial = false): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._subs.sink = this._app.webSocket$.subscribe(
        message => {

          this._wr.libraryService.setLocalStorage('new_notif', true)
          this._wr.communicationService.notification$.next(message)
          this._wr.communicationService.updateNotificationfavicon();

        },
        error => {},
        () => {}
      )
      const apps$ = this._auth.fetchApp(initial);
      this._subs.sink = apps$.subscribe({
        next : res => {
          this.apps = res;
          this.initials = this._wr.libraryService.getLocalStorage("initial");
          if(this._wr.sharedService.userPref[(this._wr.sharedService.appConfig?.appName)]){
            this._wr.sharedService.userPref[(this._wr.sharedService.appConfig.appName)].app = res.map(_app => _app.state);
          }
          //  *Do NOT DELETE*this is needed for  the fertching and setting of menu preferences
          setTimeout(() => {resolve(true);}, 10)

        },
        error: err => {
          reject(err)
          this.isLoading = false;
        }
      });

      const _setOrg = (_orgId, _refresh = false) => {
        if(_orgId){
          this._settings.org_organization({id: _orgId}, 'post').subscribe(res => {
            this._wr.libraryService.setLocalStorage('org', JSON.stringify(res.content?.results?.[0]));
            
            if(_refresh){
              setTimeout(()=>{
                //console.log({_routeProp: this.snapshotParams, curr: this.currentUrl});
                
                if((this.currentUrl || '').startsWith('/settings')){
                  this._wr.helperService.gotoPage({pageName: ['settings', _orgId, 'config'], extraParams: {}});
                } else{
                  location.reload();
                }
              });
            }
          });
        }
      }

      this._subs.sink = this._settings.org_organization({limit: 100}, 'post').subscribe({next: (res: ResponseObj<GridResponse>) => {
        let _currentOrg: any;
        try {
          _currentOrg = JSON.parse(this._wr.libraryService.getLocalStorage('org'));
        } catch (error) {}
        
        this.orgMenuItems = (res.content?.results || []).map(_m => {
          const _toReturn = {
            id: _m.id,
            disabled: _currentOrg?.id == _m.id,
            label: _m.name,
            icon: PrimeIcons.BUILDING,
            command(event) {
              _setOrg(event?.item?.id, true);
            },
          };
          return _toReturn;
        });

        if(!_currentOrg){
          _setOrg(res.content?.results?.[0]?.id);
        }
      }, error: (err) => {
        this.orgMenuItems = [];
      },
    })
    });
  }


  private _checkAppAuthorized(){
    this.authorized = this._auth.isUserAuthorized(this.currentUrl, this.apps, this.appId, this.snapshotData);
  }


  private _initLocale(){}

  ngAfterViewChecked(): void {
    this._cdr.detectChanges();
  }

  override ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

}
