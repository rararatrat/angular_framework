import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { Core, GridResponse, ResponseObj, RouteObserverService } from '@eagna-io/core';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { ActivatedRoute, Router } from '@angular/router';
import { ContainerConfig, DetailsContainerConfig, IContainerWrapper } from '@library/library.interface';

import { WrapperService } from '@library/service/wrapper.service';

import { SettingsService } from '../../settings.service';
import { map } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { SubSink } from 'subsink2';
import { ConfigStatic } from '../configuration.static';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'eg-branding',
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.scss']
})
export class BrandingComponent extends RouteObserverService implements OnInit {

  @Input('display') display           : "full" | "meta" | "basic" | "dogtag" = "full";
  @Input('currentType')currentType    : "dialog" | "component" | "route";

  public container          : ContainerConfig = null;
  public config   : DetailsContainerConfig = null;
  public detailsConfig      : DetailsConfig;


  public isLoading          : boolean = true;
  public contentLoading     : boolean = true;
  public data               : any = null;
  public brandingForm       : FormGroup;
  public arr                : any;
  public section            : any = [];
  public createMode         : boolean = false;
  public permission         : any;
  private _form             : any;
  private _subs             : SubSink  = new SubSink();
  public isOrgBranding      : boolean;
  public brandingFormProp   : any = ConfigStatic.getBrandingFormProperties();
  public orgDetails         : any = null ;

  constructor(private _settings               : SettingsService,
              private _app                    : AppService,
              private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _cd                     : ChangeDetectorRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig) {

    super(_route, _router);
    this.display  = (this.currentType == "dialog")?"full":this.display;
  }

  onRouteReady(event, snapshot, root, params): void{
    if(localStorage.hasOwnProperty('org')){
      this.orgDetails = JSON.parse(localStorage.getItem('org'))
    }
  }
  onRouteReloaded(event, snapshot, root, params): void{}

  ngOnInit(): void {
    let items :any;
    this.isLoading = true;
    this._settings.branding().pipe(map( e => {
      e.content.results = e.content.results.map(brand => {
        return {
          label     : brand['name'],
          icon      : "fa-solid fa-circle",
          selected  : this._update('isOrgBranding', brand),
          onClick : (event) => {
            setTimeout(() => {
              this.createMode = false;
              this.isOrgBranding = this._update('isOrgBranding', brand);
              this.data = brand;
              this.config.formProperty.mode = "view";
              this.config.itemId = brand?.id;
              this.config.header = brand.name;
              this.contentLoading =true;
              this._update("init", brand);
            })
          },
        }
      })
      return e;
    })).subscribe({
      next    : (res) => {
        console.log({next: res});

        this.permission = res.content.permission;
        items = res.content.results;
        const temp = {
          label     : Core.Localize('add_new', {item: Core.Localize('branding')}),
          icon      : "fa-solid fa-circle-plus text-primary",
          class     : "text-primary  border-1",
          selected  : false,
          onClick : (event) => {
            this.createMode = true;
            this.isOrgBranding = false;
            this.config.itemId = null;
            this.config.header = `${Core.Localize("add_new")} ${Core.Localize("branding_settings")}`;
            this.config.formProperty.mode = "add";
            this._update('init', null);
          },
        }
        items.unshift(temp);
      },
      error   : (err) => {},
      complete: () => {
        this._initDetailsContainer(items);
        this.isLoading  = false;
        this._cd.detectChanges();
      }
    })
  }



  private _initDetailsContainer(items){
    const header = Core.Localize("branding_settings");
    this.data = this.dialogConfig?.data?.item;
    this.config = {
      showNavbar    : true,
      showDetailbar : false,
      navbarExpanded:true,
      hasHeader     : true,
      header        : Core.Localize('branding'),
      subheader     : Core.Localize("dContainerSubHeader", {header}),
      params        : {},
      sidebar       : {
        header,
        items  : items
      },
      detailsApi$    : (param, method, nextUrl)   => {
        return this._settings.branding(param, method, nextUrl)
      },
      formProperty : {
        formProperties : this.brandingFormProp.formProperties,
        formStructure : this.brandingFormProp.formStructure,

      }
    }
  }



  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public save(){
    const _formData = {id:this.data.id, ...this.detailsConfig.formGroup.value}
    this._update('update',_formData )
  }

  public delete(){
    const _formData = {id:this.data.id, ...this.detailsConfig.formGroup.value}
    this._update('delete',_formData )
  }

  public create(){
    delete this.detailsConfig.formGroup.value['files'];
    const _formData = this.detailsConfig.formGroup.value;
    this._update('create',_formData);
  }

  public setForOrg(){
    this._update('setForOrg',this.data)
  }


  private _update(action, data){
    let toReturn = null;
    switch(action){
      case "isOrgBranding":
        if(localStorage.hasOwnProperty('org')){
          this.orgDetails = JSON.parse(localStorage.getItem('org'))
        }
        toReturn = (this.orgDetails.branding.id == data.id);
        this.isOrgBranding = toReturn;
        break;
      case "setForOrg":
        const formData = {id: this.orgDetails.id, branding: data.id}
        this._subs.id('updateOrg').sink = this._settings.org_organization(formData, "patch").subscribe({
          next :(res) => {
            localStorage.setItem('org', JSON.stringify(res.content.results[0]));
          },
          complete : () =>{
            location.reload();
            this._subs.id('updateOrg').unsubscribe()
          }
        })
        break;
      case "update":
        this._subs.id('updateBrand').sink = this._settings.branding(data, "patch").subscribe({
          complete : () =>{
            this._subs.id('updateBrand').unsubscribe()
          }
        })
        break;
      case "delete":
          this._subs.id('deleteBrand').sink = this._settings.branding(data, "delete").subscribe({
          complete : () =>{
            this._subs.id('deleteBrand').unsubscribe()
            location.reload();
          }
        })
        break;
      case "create":
        this._subs.id('createBrand').sink = this._settings.branding(data, "put").subscribe({
          complete : () =>{
            this._subs.id('createBrand').unsubscribe()
          }
        })
        break;

      case "init":

        this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr : this._cd });
        this.contentLoading = false;
        this.detailsConfig.triggerChangeDetection();

        break;
    }

    return toReturn;
  }



  public _addNewItem(p: IContainerWrapper, mode: "view" | "add" | "edit" | "delete"){
    //const subApi = api$(param, method, nextUrl);
    console.log(p.params)
    this._subs.sink = (p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      const iContainerWrapper: IContainerWrapper = {
        apiService: p.apiService,
        permission: res.content?.permission,
        gridFields: res.content?.fields,
        params: (p?.params || {}),
        noModalHeight: p.noModalHeight == true,

        addCallback: (p2) => {
          /* console.log(p2) */
          if(p2?.isConfirmed){

          }
        },
        ...(p.formProperties ? {formProperties: p.formProperties} : {}),
        ...(p.formStructure ? {formStructure: p.formStructure} : {}),
        ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
      };
      this._wr.containerService.dialogAction(mode, iContainerWrapper);
    }));
  }

  public onImageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

}
