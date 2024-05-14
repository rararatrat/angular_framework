
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent, SideBarService, RouteObserverService, CapitalizeFirstPipe } from '@eagna-io/core';
import { map, Subscription } from 'rxjs';
import { Config } from 'ng-otp-input/lib/models/config';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from './settings.service';
import { SettingsStatic } from './settings.static';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'eg-settings',
  templateUrl : 'settings.component.html',
  styleUrls : ['settings.component.scss']

})
export class SettingsComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems      !: MenuItem[];

  private _defaultData  : any;
  private _ipAddr       : any;
  public isHome     : boolean = false;
  public loaded     : boolean = false;
  public isLoading  : boolean = true;
  private _subscription = new Subscription();
  public isDisabled : boolean = true;
  public orgId : number;

  public otpConfig : Config = {
    length      :6,
    allowNumbersOnly:true,
    disableAutoFocus: true,
    inputStyles :{'height.rem': 3.5,
                  'width.rem': 2,
                  'border-radius.rem':0.6 ,
                  'margin-top.px':4
                }
  }

  public org$ = this._settings.org_organization().pipe(map(e=>e.content.results));

  @ViewChild('eagSideBar') eagSideBar: SidebarComponent | undefined;

  constructor(  private _wr : WrapperService,
                private _sidebarService: SideBarService,
                private _settings: SettingsService,
                public capitalizeFirst: CapitalizeFirstPipe,
                public _router: Router,
                public _route: ActivatedRoute,
                ){
                  super(_route, _router);

                  this._setIsHome();
  }

  onRouteReady(): void {
    this._setIsHome();
  }

  onRouteReloaded(): void {
    this._setIsHome();
  }

  ngOnInit(): void {
    this._initSidebar();
    /* this.snapshotLoaded = true; */
  }

  private _setIsHome(){
    this.orgId = this.snapshotParams['orgId'];
    if(this._router.url == "/settings"){
      this.isHome = true;
      this.isLoading = false;
      this.isDisabled = true;
      this._initSidebar();
    }else{
      this.isLoading = false;
      this.isHome = false;
      this.isDisabled = false;

      if(this._router.url.split("/").includes("settings")){
        this._initSidebar();
      }

    }
  }

  private _initSidebar(){

    /* this.menuItems = ; */

    const sidebarLoaderId = "eag-settings";
    this._sidebarService.sidebar$.next({
      items     : SettingsStatic.getSidebarMenuItems(this),
      isVisible : true,
      mode      :"compact",
      sidebarLoaderId: sidebarLoaderId
    })

  }

  public imageErr(param){
    this._wr.libraryService.noImageUrl(param);
  }

  override ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
