
import { Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItems,  SidebarComponent, RouteObserverService, Core, apiMethod } from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute, Router } from '@angular/router';

import { SettingsService } from '../settings.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig } from '@library/library.interface';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'eg-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']

})
export class OrganizationComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems         !: MenuItems[];
  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public isDisabled         : boolean = true;
  public orgId              : number = null;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 0;
  public isChanged          : boolean;
  public breadcrumbs_title  : string = null;
  public detailsData        : any = null;

  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settings.org_organization(p, method);

  @ViewChild('eagSideBar') eagSideBar: SidebarComponent | undefined;
  private _setOrg: boolean;

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _settings               : SettingsService,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig
              ) {
      super(_route, _router);
                  this._setIsHome();
  }

  onRouteReady(): void { this._setIsHome(); }

  onRouteReloaded(): void { this._setIsHome(); }

  ngOnInit(): void {
    this._initDetailsContainer();
  }

  private _setIsHome(){
    this.orgId = this._route?.snapshot?.params?.['orgId']
    const homePaths = [ `/settings/${this.orgId}/config/details`,
                        `/settings/${this.orgId}/config/branding`,
                        `/settings/${this.orgId}/config/manage_team`,
                        `/settings/${this.orgId}/config/org_structure`,
                      ]
    const redirectPaths = [ `/settings/${this.orgId}/config`,
                            `/settings/${this.orgId}`
                          ]

    if(homePaths.includes(this._router.url)){
      this.isHome = true;
      this.isLoading = false;
    }else if(redirectPaths.includes(this.router.url)){
      this.isHome = true;
      this.isLoading = false;
      this.router.navigate([`/settings/${this.orgId}/config/details`])
    }
    else{
      this.isLoading = false;
      this.isHome = false;
    }
  }

  private _initDetailsContainer(){
    let that = this;
    const header = Core.Localize("org_config");
    this.data = this.dialogConfig?.data?.item;

    this.config = {
      showNavbar      : true,
      navbarExpanded  : true,
      hasHeader       : false,
      header          : header,
      subheader       : Core.Localize("dContainerSubHeader", {header}),
      dialogConfig    : this.dialogConfig,
      showDetailbar   : false,
      dialogRef       : this.ref,
/*         params          : {id:this.user.id},*/
      itemId          : this.orgId,
      detailsApi$     : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl);
      },
      /* formProperty    : {
        includedFields  : profileFormProperty['includedFields'],
        formProperties  : profileFormProperty['formProperties']
      }, */
      sidebar       : {
        header,
        items  : [
          {
            label: Core.Localize('details'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('org_details_desc'),
            routerLink : ['config/details'],
          },
          {
            label: Core.Localize('branding'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('branding_desc'),
            routerLink : ['config/branding'],
          },
          {
            label: Core.Localize('manage_your_teams'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('manage_your_teams_desc'),
            routerLink : ['config/manage_team'],
          },
          {
            label: Core.Localize('org_structure'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('org_structure_desc'),
            routerLink : ['config/org_structure'],
          },
        ]
      }
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr});
    this.isLoading = false;


  }

  ngAfterViewChecked(){
    if(this.detailsData == null){
      this.detailsData = this.detailsConfig.data;
    }else if(!this._setOrg){
      this._setOrg = true;
      localStorage.setItem('org', JSON.stringify(this.detailsData));
    }
  }

  override ngOnDestroy(): void {
    //localStorage.removeItem('org');
  }
}
