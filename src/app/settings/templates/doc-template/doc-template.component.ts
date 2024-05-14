import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Data, Params, NavigationEnd } from '@angular/router';
import { Core, MenuItems, RouteObserverService, SubSink, apiMethod } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, ITemplateSettings, pageSetup, template_type } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SettingsService } from '../../settings.service';
import { Templates } from '../templates.static';
import { forkJoin, tap } from 'rxjs';
import { Position } from 'src/app/crm/sales/position/position';

@Component({
  selector: 'eg-doc-template',
  templateUrl: './doc-template.component.html',
  styleUrls: ['./doc-template.component.scss']
})
export class DocTemplateComponent extends RouteObserverService implements OnInit, OnDestroy{
  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public tplLoading         : boolean = true;
  public _hasChecked        : boolean = false;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public rawdata            : any = null;
  public activeIndex        : number = 0;
  public isChanged          : boolean;
  private _subs             : SubSink = new SubSink();
  private _form             : any = Templates;

  public template_type      : template_type
  public template_setup     : pageSetup
  public template_settings  : ITemplateSettings

  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settings.doc_config(p, method);
  orig_template_type: any;

  constructor(private _wr           : WrapperService,
    private _fb                     : FormBuilder,
    private _router                 : Router,
    private _settings               : SettingsService,
    private _cd                     : ChangeDetectorRef,
    @Optional() private _route      : ActivatedRoute,
    @Optional() public dialogConfig : DynamicDialogConfig
  ) {
    super(_route, _router);
  }

  override onRouteReady(event?: any[], snapshot?: ActivatedRouteSnapshot, rootData?: Data, rootParams?: Params): void {

  }
  override onRouteReloaded(event?: NavigationEnd, snapshot?: ActivatedRouteSnapshot, rootData?: Data, rootParams?: Params): void {

  }

  ngOnInit(): void {
    this._initDetailsContainer()

  }
  private _initDetailsContainer(){
    let _cfgFrmProp = this._form.getConfigFormProperties();

    let _hasRowData = true;
    const header  = Core.Localize("doc_template", {count: 2});
    
    const _dataType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.dialogConfig?.data);

    //set data and settings from dialog
    if(_dataType == 'dialog'){
      this.data = this.dialogConfig?.data?.item;
    } else{
      this.data = Position.getTestData(this.template_type);
    }

    this.config   = {
      showNavbar    : true,
      showDetailbar : false,
      navbarExpanded:true,
      hasHeader     : false,
      header        : "Templates",
      subheader     : Core.Localize("dContainerSubHeader", {header}),
      params        : {},
      sidebar       : {
        header,
        items       : []
      },
      detailsApi$    : (param, method, nextUrl) => {
        const _param = method == 'post' ? {...param, limit: 100} : param; 
        return this.api(_param, method, nextUrl).pipe(tap(res => {
        _hasRowData = !this._wr.libraryService.checkGridEmptyFirstResult(res);
        }))},
      formProperty : {
        formProperties : _cfgFrmProp['formStructure'],
        formStructure : _cfgFrmProp['formProperties']
      },
      onApiComplete : (perm, data) => {
        if(data && _hasRowData){
          let _cacheData : any  = [...data];
          const _t : MenuItems[] = _cacheData.map((m, index) => {
            if(m){
              return {
                label : `${m.eg_content_type.name}`,
                subTitle :`${m.doc_template.name}`,
                icon  : "fa-solid fa-circle",
                selected : this.activeIndex == index,
                data  : m,
                onClick : (item, parent, event) => {
                  const _d = item.data;
                  this.data = item.data;
                  this.template_type = (m.eg_content_type.name || '').replace(' ', '');
                  this.orig_template_type = m.eg_content_type.name;
  
                  const _fork$ = {
                      setup   : this._settings.doc_setup({id:_d.doc_setup.id}, "post"),
                      template: this._settings.doc_templates({id:_d.doc_template.id}, "post"),
                  }
                  this._subs.sink = forkJoin(_fork$).subscribe({
                    next : ({setup, template}) => {
                      this._mapToTemplateSettings(template.content.results[0], setup.content.results[0])
                    },
                    complete : () => {
  
                    },
                    error : (err) => {}
                  })
                }
              }
            } else{
              return null;
            }
          });
          
          this.config.sidebar.items = this._wr.helperService.filterUnique(_t, 'label');
          //this.config.sidebar.items = _t.filter((_value: any, _index: number, _arr: any[]) => _arr.findIndex(_eachArr => _eachArr['label'] == _value['label']) === _index);
        }

        this.isLoading = false;
      }
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr : this._cd });
  }

  private _mapToTemplateSettings(template, pageSetup){
    this.rawdata            = {template,pageSetup};
    const _mapped           = Templates.resultsToSettings(template, pageSetup);
    this.template_settings  = _mapped.template[0]
    this.tplLoading         = false;
  }

  ngAfterViewChecked(){
    if(this.detailsConfig?.isLoading == false && this.isLoading == false && this.detailsConfig?.data && !this._hasChecked){
      this.config = this.config
      this._hasChecked = true
    }
  }

  override ngOnDestroy(): void {

  }
}
