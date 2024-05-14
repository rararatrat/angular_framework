import { UpperCasePipe, Location, DOCUMENT } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractCoreService, Core, CoreService, GridResponse, HelperService, ResponseObj, RouteObserverService, SharedService, SidebarComponent, SideBarService, UserPreferences } from '@eagna-io/core';
import { RightbarService } from '@library/navigation/rightbar/rightbar.service';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';

import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { registerLocaleData } from '@angular/common';
import localeGerman from '@angular/common/locales/de';
import localeSwedish from '@angular/common/locales/sv';
import { WrapperService } from '@library/service/wrapper.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SettingsService } from 'src/app/settings/settings.service';


let _scheme = SharedService.defaultUserPref.app[0].ui_theme;

@Component({
  selector: 'eag-userbar',
  templateUrl: './userbar.component.html',
  styleUrls: ['./userbar.component.scss']
})
export class UserbarComponent implements OnInit, AfterViewChecked, OnDestroy {

  @Input('apps') apps           : MenuItem[];
  @Input('initials') initials   : string;
  @Input('orgList') orgList     : MenuItem[];

  @ViewChild("appOverlay") appOverlay : OverlayPanel;
  @ViewChild("app")         overlayPanel : OverlayPanel;
  @ViewChild("pAvatar") pAvatar : any;

  public app_id         = 1;
  public toggleActive   : boolean = false;
  private _userPref     ?: UserPreferences;
  private _sidebarS     : any;
  public items          : MenuItem[];
  public currGridTheme  : any;
  private _loaded = false;
  public loaded = false;
  private _appName = this._wr.sharedService.appConfig.appName;
  public isDebug = this._wr.sharedService.appConfig.env?.main.isDebug == true;
  public avatar         : any = null;
  public newNotif     : boolean = false;
  public user         : any = JSON.parse(this._wr.libraryService.getLocalStorage("user"))
  private _currSidebar : any = null;

  private _subscription = new Subscription();

  constructor(private _sidenav: RightbarService,
      private _sidebarService : SideBarService,
      private _abstractCore: AbstractCoreService,
      private _wr : WrapperService,
      private _upperCase: UpperCasePipe,
      private _translation: TranslateService,
      private _authService: AuthService,
      private _settings: SettingsService,
      private _activatedRoute: ActivatedRoute,
      private _router: Router,

      private handler: HttpBackend,
      private sanitizer: DomSanitizer,
      private cdr: ChangeDetectorRef,
      @Inject(DOCUMENT) private _doc: Document,
      ) {
        this._subscription.add(this._wr.sharedService.appConfig.app$?.subscribe(_app => {
          this.app_id = _app?.appId;
          _scheme = _app?.ui_theme;

        }));

        //this._wr.
      }

    trackByFn(index, item) {
        return item.id; // unique id corresponding to the item
    }

    ngOnInit(): void {
      this.newNotif = this._wr.libraryService.getLocalStorage('new_notif') == 'true';

      this._getUserPref();
      _scheme = this.apps?.map(_app => _app.state).find(_app => _app['appId'] == this.app_id)?.['ui_theme'];
      this._initUserMenu('from init');
      this.fetchImage();
      //this._initApps('from init');

      if(!this._loaded){
        this._subscription.add(this._sidebarService.sidebar$.subscribe(res => {
          if(this._loaded){
            /* this._lib.setCssForContainer(res, "userbar"); */
            this._sidebarS = res;
            this._initUserMenu('sidebar subscribe');
          }
        }));

        this._subscription.add(this._wr.coreService.translationDone$.subscribe(fromWhere => {
          setTimeout(() => {
            this._initUserMenu(fromWhere);
          });
        }));

        setTimeout(() => {
          this._loaded = true;
        });
      }
    }

    public fetchImage(){

      let user    : any = JSON.parse(this._wr.libraryService.getLocalStorage("user"));
      if(user.provider != "azuread-oauth2"){
        this.avatar = user.picture;
      }else {
        if(user.picture.hasOwnProperty("changingThisBreaksApplicationSecurity"))
        {
          this.avatar = user.picture.changingThisBreaksApplicationSecurity;
        }else {
          let token  = this._wr.libraryService.getLocalStorage("apat").toString();
          let temp = new HttpClient(this.handler);
          let headers   = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'image/*'
          })

          temp.get(user.picture, {
            headers,
            responseType: 'arraybuffer',
          }).subscribe( {
              next: (data:any) => {
                const TYPED_ARRAY = new Uint8Array(data);
                const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
                let base64String = btoa(STRING_CHAR);

                //sanitize the url that is passed as a value to image src attrtibute
                this.avatar = this.sanitizer.bypassSecurityTrustUrl(
                  'data:image/*;base64, ' + base64String
                );
                user.picture = this.avatar;
                localStorage.setItem("user", JSON.stringify(user));
              },
              error: (err: any)  => {
                this.avatar ='../../assets/img/account_circle-black-48dp.svg';
              }
          })
        }

      }
    }


    private _toggleSidebarMode(mode, param){


      this._sidebarS[mode] = param;

      this._sidebarService.sidebar$.next(this._sidebarS);

      if(!this._userPref.sidebar){
        this._userPref.sidebar = {[this._sidebarS?.sidebarLoaderId]: this._sidebarS};
      } else{
        this._userPref.sidebar[this._sidebarS?.sidebarLoaderId] = this._sidebarS;
      }
      this._subscription.add(this._abstractCore.userPreferences(this._userPref, "sidebar", "put").subscribe({next: result =>{}}));
    }

    private _changeGridTheme(theme){
      this._wr.coreService.setAgTheme(theme, this._abstractCore);
      location.reload();
    }

    private _initUserMenu(fromWhere){
      const isDarkMode = this._wr.coreService.isDarkMode;
      setTimeout(() => {
        this.items = [];
        let that = this;

        const _getOnOffIcon = (_onOff: boolean): string => {
          return (_onOff ? 'font-eg-true ' : 'font-eg-false ') + PrimeIcons.CIRCLE_FILL;
        };

        this.items = [
          {
              label: Core.Localize('myActivities'),
              icon:'pi pi-fw pi-user',
              routerLink: "profile/activities"
          },
          {
              label: Core.Localize('editProfile'),
              icon:'pi pi-fw pi-user-edit',
              routerLink:"profile"
          },
          {
              label: Core.Localize('org'),
              icon:'pi pi-fw pi-key',
              items: [
                {
                  label: Core.Localize('setting', {count: 2}),
                  icon:'pi pi-fw pi-key',
                  routerLink: "settings"
                },
                {
                  label: Core.Localize('choose_org'),
                  icon: PrimeIcons.BUILDING,
                  items: this.orgList,
                },
              ]
          },
          {
              label: Core.Localize('preferences'),
              icon:'pi pi-fw pi-sliders-h',

              items : [
                {label: Core.Localize('scheme'), icon: "pi pi-bolt",
                  items: [
                    {label: 'Auto', disabled: _scheme == 'auto', command(event){
                      that._wr.coreService.setDarkMode('auto', that._abstractCore);
                    }},
                    {
                      label: `${ isDarkMode ? Core.Localize('lightMode') : Core.Localize('darkMode') }`,
                      icon: ( isDarkMode ? PrimeIcons.SUN : PrimeIcons.MOON),
                      id: 'light-dark-mode',
                      command(event?: any){
                        that._wr.coreService.setDarkMode(isDarkMode ? "light" : "dark", that._abstractCore);
                      },
                      //disabled
                    },
                  ]
                },
                { label: Core.Localize('layout'),
                  icon:PrimeIcons.TH_LARGE,
                  disabled: !this.user?.['globalMenubarPref'],
                  items: [
                    {
                      label: Core.Localize('list'),
                      id: 'default-mode',
                      icon: _getOnOffIcon( this._userPref?.sidebar?.['all']?.menuType == 'sidebar' && this._userPref?.sidebar?.['all']?.mode == 'list' ),
                      command(event?: any) {
                        that._toggleSidebarMode("mode", undefined);
                      }
                    },
                    {
                      id: 'compact-mode',
                      label: Core.Localize('compact'),
                      icon: _getOnOffIcon( this._userPref?.sidebar?.['all']?.menuType == 'sidebar' && this._userPref?.sidebar?.['all']?.mode == 'compact' ),
                      command: (event?: any) => {
                        that._toggleSidebarMode("mode", 'compact');
                      },
                    },
                    { id: 'thin-mode',
                      label: Core.Localize('thin'),
                      icon: _getOnOffIcon( this._userPref?.sidebar?.['all']?.menuType == 'sidebar' && this._userPref?.sidebar?.['all']?.mode == 'thin' ),
                      command: (event?: any) => {
                        that._toggleSidebarMode("mode", "thin");
                      },
                    },
                    { id: 'classic-mode',
                      label: Core.Localize('classic'),
                      icon: _getOnOffIcon( this._userPref?.sidebar?.['all']?.menuType == 'menubar' ),
                      command: (event?: any) => {
                        const isMenu = (this._userPref?.sidebar?.['all']?.menuType == 'menubar')? 'sidebar' : 'menubar';
                        that._toggleSidebarMode("type", isMenu);
                      },
                    },
                    {
                        separator:true
                    },
                    {
                      id: 'turn-on-off-modal',
                      label: Core.Localize(this._userPref?.sidebar?.['all']?.modal ? 'modalOff' : 'modalOn'),
                      icon: _getOnOffIcon( this._userPref?.sidebar?.['all']?.modal == true ),
                      state : {'byPassClickAction': true},
                      disabled: this._userPref?.sidebar?.['all']?.menuType == 'menubar',
                      command(){
                        if(that._sidebarService.sidebar$){
                          const _onOff    = false;
                          const _thisItem = this;
                          _thisItem.label = Core.Localize(this._sidebarS?.modal ? 'modalOff' : 'modalOn');
                          _thisItem.title = _thisItem.label
                          _thisItem.icon  = (_onOff ? 'font-eg-true ' : 'font-eg-false ') + PrimeIcons.CIRCLE_FILL;
                          that._toggleSidebarMode("modal", _onOff);
                          }
                        },
                      }
                    ] as MenuItem[]
                },
                {
                  id: 'aggrid-pref',
                  icon: PrimeIcons.TABLE,
                  label: Core.Localize('grid'),
                  disabled: !this.user?.['globalGridPref'],
                  items: [
                    {
                      icon: _getOnOffIcon( this._userPref?.grid?.['all']?.theme == 'balham' ),
                      id: 'aggrid-balham',
                      label: Core.Localize('balham'),
                      command(){
                          that._changeGridTheme('balham');
                      }
                    },
                    {
                      icon: _getOnOffIcon( this._userPref?.grid?.['all']?.theme == 'alpine' ),
                      id: 'aggrid-alpine',
                      label: Core.Localize('alpine'),
                      command(){
                          that._changeGridTheme('alpine');
                      },
                    },/*
                    {
                      //icon: _getOnOffIcon( this._userPref?.grid?.theme == 'blue' ),
                      id: 'aggrid-blue',
                      label: appLocalize['blue'),
                      command(){
                          that._changeGridTheme('blue');
                      },
                      disabled: _isDarkMode
                    },
                    {
                      //icon: _getOnOffIcon( this._userPref?.grid?.theme == 'bootstrap' ),
                      id: 'aggrid-bootstrap',
                      label: appLocalize['bootstrap'),
                      command(){
                          that._changeGridTheme('bootstrap');
                      },
                      disabled: _isDarkMode
                    },
                    {
                      //icon: _getOnOffIcon( this._userPref?.grid?.theme == 'fresh' ),
                      id: 'aggrid-fresh',
                      label: appLocalize['classic'),
                      command(){
                          that._changeGridTheme('fresh');
                      },
                      disabled: _isDarkMode
                    } */
                ] as MenuItem[]
                },

                //TODO RT: flags diff
                {label: Core.Localize('language'), icon: `pi fi fis fi-${this._userPref?.locale == 'en' ? 'gb' : (this._userPref?.locale == 'pt-TL' ? 'ph' : this._userPref?.locale)}`, id: 'menu-locale', tooltip: `${this._upperCase.transform(this._userPref?.locale)}`, //fis
                  items: [
                    {label: 'DE', icon: `pi fi fis fi-de`, disabled: this._userPref?.locale == 'de', command(){
                      that._wr.coreService.setLocale('de', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'EN', icon: `pi fi fis fi-gb`, disabled: this._userPref?.locale == 'en', command(){
                      that._wr.coreService.setLocale('en', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'FR', icon: `pi fi fis fi-fr`, disabled: this._userPref?.locale == 'fr', command(){
                      that._wr.coreService.setLocale('fr', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'IT', icon: `pi fi fis fi-it`, disabled: this._userPref?.locale == 'it', command(){
                      that._wr.coreService.setLocale('it', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'ES', icon: `pi fi fis fi-es`, disabled: this._userPref?.locale == 'es', command(){
                      that._wr.coreService.setLocale('es', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'PT', icon: `pi fi fis fi-pt`, disabled: this._userPref?.locale == 'pt', command(){
                      that._wr.coreService.setLocale('pt', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'GA', icon: `pi fi fis fi-ie`, disabled: this._userPref?.locale == 'ga', command(){
                      that._wr.coreService.setLocale('ga', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'TA', icon: `pi fi fis fi-in`, disabled: this._userPref?.locale == 'ta', command(){
                      that._wr.coreService.setLocale('ta', that._abstractCore);
                      location.reload();
                    }},

                    {label: 'JA', icon: `pi fi fis fi-jp`, disabled: this._userPref?.locale == 'ja', command(){
                      that._wr.coreService.setLocale('ja', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'KO', icon: `pi fi fis fi-kr`, disabled: this._userPref?.locale == 'ko', command(){
                      that._wr.coreService.setLocale('ko', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'TL', icon: `pi fi fis fi-ph`, disabled: this._userPref?.locale == 'pt-TL', command(){
                      that._wr.coreService.setLocale('pt-TL', that._abstractCore);
                      location.reload();
                    }},
                    {label: 'CN', icon: `pi fi fis fi-cn`, disabled: this._userPref?.locale == 'zh', command(){
                      that._wr.coreService.setLocale('zh', that._abstractCore);
                      location.reload();
                    }},
                    /* {label: 'SW', icon: `pi fi fis fi-ke`, disabled: this._userPref?.locale == 'sw', command(){
                      that._coreService.setLocale('sw', that._abstractCore);
                    }}, */
                  ]
                }
            ]
          },
          {
              separator:true
          },
          {
              label: Core.Localize('logout'), icon:'pi pi-fw pi-power-off', command: () => { this._authService.logout() }
          }
        ];
      })
    }

    private _getUserPref(){
       const sidebarLoaderId = this._sidebarService.sidebar$.value.sidebarLoaderId;
      if(this._wr.sharedService.userPref && this._wr.helperService.isNotEmpty(this._wr.sharedService.userPref) && this._appName){
        this._userPref = this._wr.sharedService?.userPref[this._appName];

        if( this._userPref?.sidebar){
          this._sidebarS  = this._userPref?.sidebar[sidebarLoaderId];
        }
      }

      this._subscription.add(this._wr.sharedService.userPref$?.subscribe(_userPref => {
        if(this._loaded){
          this._userPref = _userPref;

          if(_userPref.changeType?.type == 'darkMode'){
            _scheme = this.apps?.map(_app => _app.state).find(_app => _app['appId'] == this.app_id)?.['ui_theme'];
          }

          this._initUserMenu('userPref$ subscription');
          if(!this._sidebarS && _userPref.sidebar){
            this._sidebarS = _userPref.sidebar[this._sidebarService.sidebar$.value.sidebarLoaderId];
          }
        }
      }));
    }

    toggleRightbar(param, settings?:any){
      this._currSidebar = param;
    switch(param){
        case "contacts":
            this.toggleActive = !this.toggleActive;
            settings = {
                rbClass     : "p-sidebar-md",
                rbPosition  : "right",
                rbModal     : false,
                rbfullScreen: false,
            }

            this._sidenav.newToggle(param, settings);
            break;
        case "notification":
            this.newNotif = false;
            this._wr.libraryService.setLocalStorage('new_notif', false);
            this._wr.communicationService.updateNotificationfavicon();
            this.toggleActive = !this.toggleActive;
            settings = {
                rbClass     : "p-sidebar-md",
                rbPosition  : "right",
                rbModal     : false,
                rbfullScreen: false,
            }
            this._sidenav.newToggle(param, settings);
            break;
        case "help":
            this.toggleActive = !this.toggleActive;
            settings = {
                rbClass     : "p-sidebar-lg",
                rbPosition  : "right",
                rbModal     : false,
                rbfullScreen: false,
            }
            this._sidenav.newToggle(param, settings);
            break;
        case "chat":
            this.toggleActive = !this.toggleActive;
            settings = {
                rbClass     : "p-sidebar-lg",
                rbPosition  : "right",
                rbModal     : false,
                rbfullScreen: false,
            }
            this._sidenav.newToggle(param, settings);
            break;


    }

  }

  ngAfterViewChecked(): void {
    this.loaded = this._loaded == true;
    if(this._currSidebar != null && this._sidenav.sidenav._visible && this._currSidebar == "notification"){
      this._wr.libraryService.setLocalStorage('new_notif', false);
      this.newNotif = false;
      this._wr.communicationService.updateNotificationfavicon();
    }else {
      this.newNotif = this._wr.libraryService.getLocalStorage('new_notif') == 'true';
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
