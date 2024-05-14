import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Core, RouteObserverService, SideBarService, UserPreferences } from '@eagna-io/core';
import { ComponentConfig, InPlaceConfig } from '@library/library.interface';

import { WrapperService } from '@library/service/wrapper.service';
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink2';
import { ProfileService } from '../profile.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ISideBar } from '@eagna-io/core/lib/navigation/sidebar/sidebar.interface';
@Component({
  selector: 'eg-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent extends RouteObserverService implements OnInit, OnDestroy {
  private _subscription = new Subscription();

  constructor(private _profile: ProfileService,
              private _sidebarService: SideBarService,
              private _wr : WrapperService,
              private _router: Router,
              @Optional() private _route           : ActivatedRoute,
              @Optional() private _dialogConfig    : DynamicDialogConfig
              ) {
                super(_route, _router);
                //expecting sidebar to toggle visible and modal
                this._subscription.add(this._sidebarService?.sidebarSettings$?.subscribe(res => {
                  if(res && this.user?.globalMenubarPref && this.userPref?.sidebar['all']){
                    this.userPref.sidebar['all'] = {...this.userPref.sidebar['all'], modal: res.modal, sidebarVisible: res.sidebarVisible};
                  }
                  if(!this.userPref?.sidebar?.['all']){
                    this.userPref.sidebar['all'] = {sidebarId: "all", menuType: 'sidebar', mode: 'thin', modal: false, sidebarVisible: true};
                    this._wr.libraryService.setLocalStorage("userPref", JSON.stringify(this.userPref));
                  }
                }));
              }
  @Input('data')    data        : any = null;
  @Input('display') display     : "full" | "meta" | "basic" | "dogtag" = "full";
  @Input('currentType')currentType    : "dialog" | "component" | "route" = null;

  public cc             : ComponentConfig = null;
  public form           : FormGroup<any>;
  public inPlaceConf    : InPlaceConfig;
  public inPlaceOpen    : boolean = true;

  public language       : any = []
  public languageOptions: any = []
  public timezone       : any = []
  public timezoneOptions: any = []

  public user           : any = JSON.parse(this._wr.libraryService.getLocalStorage("user"));
  public userPref       : UserPreferences = JSON.parse(this._wr.libraryService.getLocalStorage("userPref"));

  public scheme       : any = {value: null, options:[]} ;
  public layout       : any = {value: null, options:[]} ;
  public grid         : any = {value: null, options:[]} ;

  public appList        : any;
  private _menuList     : any;
  private _gridList     : any;
  private _sidbarConf : ISideBar;
  ngOnInit(): void {

    this._initComponent()


  }
  onRouteReady(event, snapshot, rootData, rootParams): void {}

  onRouteReloaded(): void {}

  private _initComponent(){
    this.cc = {
      header        : {show: true, name: "Account Details"},
      subHeader     : {show: true, name: null},
      data          : this.data,
      currentType   : this._wr.libraryService.getRenderedType(this._dialogConfig, this.data),
      subs          : new SubSink(),
      isLoading     : false,
      permission    : null
    }

    this._getData();
    this.manageAppPref("fetch");
  }

  private _initInPlace(){
    let that = this;
    this.inPlaceConf = {
      formGroup   : this.form,
      method      : "callback",
      isWholeForm : false,
      permission  : this.cc.permission,
      api$: (param?:any) => {
        return this._profile.appPreferences(param, "patch")
      },
      onUpdate : (param) => {
        that.onChange("language", (param?.name || ''));
      },

    }
  }

  private _initForm(data){
    let tObj    = {};
    let tData   = (data.hasOwnProperty('results'))?data.results[0]:data;
    let tFields = (data.hasOwnProperty('fields'))?data.fields:[];
    let temp = [];

    Object.keys(tData).forEach((key, value) => {
      if(key != "__data__"){
        tObj[key] = new FormControl(tData[key], []) ;
      }
    });

    this.form = new FormGroup(tObj)
  }


  private _getData(){
    this.scheme.options =   [ {label: Core.Localize('dark'), value: 'dark', icon: "pi pi-moon"},
                              {label: Core.Localize('light'), value: 'light', icon: "pi pi-sun"},
                              {label: Core.Localize('auto'), value: 'auto', icon: "pi pi-bolt"}
                            ];
    this.scheme.value   = this.scheme.options.find(e => e.value.toLowerCase() == this.user.globalScheme);

    this.languageOptions =  [ {name: Core.Localize('english'), code: 'EN'},
                              {name: Core.Localize('deutsch'), code: 'DE'},
                              {name: Core.Localize('french'), code: 'FR'},

                            ]
    this.language = this.languageOptions.find(e => e.code.toLowerCase() == this.user.globalLocale);

    this.timezoneOptions =  [ {name: 'Germany +1', code: 'DE'},

                            ]

    this.layout.options   =  [
                                {label: Core.Localize('compact'), value: 'compact', type: "sidebar"},
                                {label: Core.Localize('list'),    value: 'list', type: "sidebar"},
                                {label: Core.Localize('thin'), value: 'thin', type: "sidebar"}
                            ]
    this.layout.value = this.layout.options.find(e => e.value == this.userPref?.sidebar?.['all']?.mode);

    this.grid.options = [ {label: 'Balham', value: 'balham'},
                          {label: 'Alpine', value: 'alpine'},
                        ]
    this.grid.value = this.grid.options.find(e => e.value == this.userPref?.grid?.['all']?.theme);

  }

  public onChange(topic, newValue) {
    switch(topic){
      case "scheme":
        this.user.globalScheme = newValue.value;
        this._subscription.add(this._profile.user({id:this.user.id, globalScheme:newValue.value}, "patch").subscribe(res => {
          this._wr.libraryService.setLocalStorage("user", JSON.stringify(this.user));
        }));

        this.appList.forEach(element => {
          element['ui_theme'] = newValue.value;
        });
        this.manageAppPref("patch", this.appList);
        this._wr.coreService.setDarkMode(newValue.value);
       break;

      case "global_menubar":
        this.user.globalMenubarPref = newValue;
        this._subscription.add(this._profile.user({id:this.user.id, globalMenubarPref:newValue}, "patch").subscribe(res => {
          this._wr.libraryService.setLocalStorage("user", JSON.stringify(this.user));
          setTimeout(() => {
            window.location.reload();
          });
        }));
        break;

      case "layout":
        this._sidbarConf = {...this._sidebarService.sidebar$.value,  mode: newValue.value, sidebarLoaderId:"all"}
        if(this.user.globalMenubarPref){
          if(!this.userPref?.sidebar?.['all']){
            this.userPref.sidebar['all'] = {sidebarLoaderId: "all",  mode: newValue.value, sidebarVisible: true};
          } else{
            this.userPref.sidebar['all'].mode = newValue.value;
            this.userPref.sidebar['all'].menuType = newValue.type;
            this.userPref.sidebar['all'].sidebarVisible = true;
          }

          this._sidebarService.sidebar$.next(this._sidbarConf)
          this._wr.libraryService.setLocalStorage("userPref", JSON.stringify(this.userPref));
          this.manageMenuPref("patch",this.userPref.sidebar['all']);

        }
      break;

      case "global_grid":
        this.user.globalGridPref = newValue;
        this._subscription.add(this._profile.user({id:this.user.id, globalGridPref:newValue}, "patch").subscribe(res => {
          this._wr.libraryService.setLocalStorage("user", JSON.stringify(this.user));
          setTimeout(() => {
            window.location.reload();
          });
        }));
        break;

      case "grid-theme":
        if(this.user.globalGridPref){
          if(!this.userPref?.grid?.['all']){
            this.userPref.grid['all'] = {gridId: 'all', theme: newValue.value};
          } else{
            this.userPref.grid['all'].theme = newValue.value;
          }
          this._wr.libraryService.setLocalStorage("userPref", JSON.stringify(this.userPref))
          this.manageGridPref("patch",this.userPref.grid['all']);
          this._wr.coreService.setAgTheme(newValue.value);

          setTimeout(() => {
            window.location.reload();
          });

        }
      break;

      case "language":
        this.appList.forEach(element => {
          element['locale'] = newValue;
        });
        this.manageAppPref("patch", this.appList);
        break;
    }
  }

  public manageAppPref(topic, params?){
    switch(topic){
      case "fetch":
        /* if(this._wr.sharedService.userPref?.[this._wr.sharedService.appConfig.appName]){
          this.appList = this._wr.sharedService.userPref[(this._wr.sharedService.appConfig.appName)].app;
          //this.manageMenuPref("fetch", res.content.results);
          //this.manageGridPref("fetch", res.content.results);
        } else{


        } */
        this._subscription.add(this._profile.app_pref({userId:this.user.id}, "post").subscribe(res => {
          this.appList = res.content.results;
          this.cc.permission = res.content.permission;

          this.manageMenuPref("fetch", res.content.results);
          this.manageGridPref("fetch", res.content.results);

          this._initForm(res.content);
          this._initInPlace();
        }));
        break;
      case "patch":
        this._subscription.add(this._profile.app_pref(Array.isArray(params) ? params.map(_p => ({..._p, locale: _p.locale.id || _p.locale})) : params, "patch").subscribe(res => {
          //this.appList = res.content.results
        }));
        break;
    }
  }

  public manageMenuPref(topic, params?){
    switch(topic){
      case "fetch":
        let menuArr = []
        params.forEach(element => {
          menuArr.push(element['id'])
        });

        this._subscription.add(this._profile.menu_pref({prefId:menuArr}, "get").subscribe(res => {
          this._menuList = res.content.results[0]
        }));

        break;

        case "patch":
          this._subscription.add(this._profile.menu_pref(params, "patch").subscribe(res => {
            this._menuList = res.content.results
          }));
        break;

    }
  }

  public manageGridPref(topic, params?){
    switch(topic){
      case "fetch":
        let gridArr = []
        params.forEach(element => {
          gridArr.push(element['id'])
        });

        this._subscription.add(this._profile.grid_pref({prefId:gridArr}, "get").subscribe(res => {
          this._gridList = res.content.results[0]
        }));
        break;

        case "patch":
          this._subscription.add(this._profile.grid_pref(params, "patch").subscribe(res => {
            this._menuList = res.content.results

          }));
        break;

    }
  }

  override ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
