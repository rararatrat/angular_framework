import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService, MenuItems, MenuSideBarSettings, SidebarComponent, SideBarService, RouteObserverService, Core } from '@eagna-io/core';


import { filter, Subscription } from 'rxjs';
import { ProfileService } from './profile.service';

import { Config } from 'ng-otp-input/lib/models/config';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink2';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'eg-profile',
  //template: '<router-outlet></router-outlet>',
  template : `<div class="w-full h-full" *apploading="isLoading">
                <ng-container [ngSwitch]="isHome">
                  <ng-container *ngSwitchCase="true">
                    <eg-profile-account></eg-profile-account>
                  </ng-container>
                  <ng-container *ngSwitchCase="false">
                    <router-outlet></router-outlet>
                  </ng-container>
                </ng-container>
              </div>`,
  providers: [ProfileService]

})
export class ProfileComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems      !: MenuItem[];

  private _defaultData  : any;
  private _ipAddr       : any;
  public isHome     : boolean = false;
  public loaded     : boolean = false;
  public isLoading  : boolean = true;
  private _subscription = new Subscription();
  private _subs : SubSink = new SubSink();

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
  public otp : FormControl = new FormControl(null,  [Validators.required, Validators.minLength(6)])

  @ViewChild('eagSideBar') eagSideBar: SidebarComponent | undefined;

  constructor(  private _wr : WrapperService,
                private _sidebarService: SideBarService,
                private _profile: ProfileService,
                private _router: Router,
                private _activatedRoute: ActivatedRoute,
                ){
                  super(_activatedRoute, _router);
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
    /* this._subscription.add(this._profile.getIpAddress().subscribe(res => {
      this._ipAddr = res
    })); */
    const data = this._wr.libraryService.getIpAddress();
    const te = this._wr.libraryService.getOSInfo();
    // device  Info
    const device = window.navigator;
    console.log(data);

  }

  private _setIsHome(){
    if(this._router.url == "/profile"){
      this.isHome = true;
      this.isLoading = false;
    }else{
      this.isLoading = false;
      this.isHome = false;

    }
  }

  private _initSidebar(){
    this.menuItems = [
    {
      icon: 'fa-solid fa-bell',
      label: Core.Localize('notification'),

      /* subTitle: 'Notification', */

      routerLink:['profile/notification'],
      routerLinkActiveOptions: { exact: true }
    },
    {
      icon: 'fa-solid fa-timeline',
      label: Core.Localize('activity', {count: 2}),
      /* subTitle: 'Activities', */

      routerLink:['profile/activities'],
      routerLinkActiveOptions: { exact: true }
    },
    {
      icon:'fa-solid fa-check-circle',
      label: Core.Localize('approval_history'),
      /* subTitle: 'Approval History', */

      routerLink: ['profile/approvals'],
      routerLinkActiveOptions: { exact: true }
    },
    {
      icon: 'fa-solid fa-shield',
      label: Core.Localize('security'),
      /* subTitle: 'Security', */

      routerLink: ['profile/security'],
      skipLocationChange:true,
      replaceUrl:true,
      routerLinkActiveOptions: { exact: true },
      items:[
        {
          icon: 'fa-solid fa-shield',
          label: Core.Localize('security'),
          /* subTitle: 'Security', */

          routerLink: ['profile/security'],
          routerLinkActiveOptions: { exact: true },
          items:[
            {
              icon: 'fa-solid fa-shield',
              label: Core.Localize('security'),
              /* subTitle: 'Security', */

              routerLink: ['profile/security'],
              routerLinkActiveOptions: { exact: true },
              items:[

              ]
            },
          ]
        },
      ]
    },
    {
      icon: 'fa-solid fa-user-group',
      label: Core.Localize('group', {count: 2}),
      /* subTitle: 'Groups', */

      routerLink: ['profile/groups'],
      routerLinkActiveOptions: { exact: true }
    },
  ];

  const sidebarLoaderId = "eag-profile";
  let _savedSidebar;

  this._sidebarService.sidebar$.next({
      items     : this.menuItems,
      isVisible : true,
      mode      :"thin",
      sidebarLoaderId:sidebarLoaderId
    })
  }

  override ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
