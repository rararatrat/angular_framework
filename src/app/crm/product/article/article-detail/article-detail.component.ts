import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService, apiMethod, Core, ConfirmDialogResult, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IContainerWrapper, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { Article } from '../article';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eg-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleDetailComponent extends RouteObserverService implements OnInit, OnDestroy, AfterViewInit {

  public mode               :  "add" | "edit" | "view" = "view";

  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public gridConfig         : IContainerWrapper  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 4;
  public isChanged          : boolean;
  public item               : any;
  public form               : any = null;

  public tplDetails         : any[] = [];
  public tplVendor          : any[] = [];
  public tplStock           : any[] = [];

  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;

  @ViewChild('gridList') gridList: GridListComponent;

  public api = (p?: any, method?: apiMethod, nextUrl?) => this._crm.product_item(p, method);
  public afterViewInitLoaded: boolean;
  private _subs = new Subscription();

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _crm                    : CrmService,
              private _cd                     : ChangeDetectorRef,
              private _sharedService          : SharedService,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig
            ) {
                super(_route, _router);
                this._sharedService.globalVars.gridListChanged = false;
              }
    onRouteReady(): void {}
    onRouteReloaded(): void {}

    public toggle(index){
      this.form['formStructure'][index]['collapsed'] = !this.form['formStructure'][index]['collapsed'];
    }

    ngOnInit(): void {
      this.item = this.snapshot.params['id'];
      this._initDetailsContainer();
    }

    private _initTplDetail(form){
      this.tplDetails = form.filter(e =>
        {
          return !['Files', 'Stock Details', 'Vendor', 'Vendor Remarks'].includes(e.header)
        }
      ).map((item) => ({ ...item, id: form.indexOf(item) }));
    }

    private _getFromStructure(section){
      return this.form['formStructure'].filter(e =>
        {
          return section.includes(e.header)
        }
      ).map((item) => ({ ...item, id: this.form['formStructure'].indexOf(item) }));
    }

    private _initDetailsContainer(){
      const header = Core.Localize("item");

      this.data = this.dialogConfig?.data?.item;
      this.config = {
        showNavbar      : true,
        hasHeader       : true,
        header          : header,
        subheader       : Core.Localize("dContainerSubHeader", {header}),
        dialogConfig    : this.dialogConfig,
        showDetailbar   : true,
        detailBarExpanded: false,
        dialogRef       : this.ref,
        itemId          :  this.item,
        detailsApi$     : (param, method, nextUrl)   => {
          return this.api(param, method, nextUrl);
        },
        onApiComplete   : (param, event) => {
          this.data = event;
          this.form = Article.getArticleFormProperties(this, 'detail');
          this.detailsConfig.config.formProperty =  {
            formProperties  : this.form['formProperties'],
            formStructure   : this.form['formStructure']
          };

          this._initTplDetail(this.form['formStructure']);
          this.tplVendor  = this._getFromStructure(['Vendor', 'Vendor Remarks']);
          this.tplStock   = this._getFromStructure(['Stock Details']);

          this.detailsConfig.overrideObjArray();
          this.isLoading = false;

          /* const _controls = this.detailsConfig.formGroup?.controls;
          for (const key in _controls) {
            if (Object.prototype.hasOwnProperty.call(_controls, key)) {
              const element = _controls[key];
              console.log({key, err: element.errors, valid: element.valid, value: element.value, element});
            }
          } */ 
        },
        hasComments: true,
        commentsApi$  : (param, method, nextUrl)   => {
          return this._crm.product_item_comments(param, method, nextUrl)
        },
        sidebar       : {
          header,
          items  : [
            {
              label: Core.Localize("product"),
              icon: "fa-solid fa-box",
              subTitle: Core.Localize("product_desc"),
              selected: (this.activeIndex == 0)
            },
            {
              label: Core.Localize("gallery"),
              icon: "fa-solid fa-images",
              subTitle: Core.Localize("gallery_desc"),
              selected: (this.activeIndex == 1)
            },
            {
              label: Core.Localize("vendor"),
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize("vendor_desc"),
              selected: (this.activeIndex == 2)
            },
            {
              label: Core.Localize("stock_location"),
              icon: "fa-solid fa-map-location",
              subTitle: Core.Localize("stock_location_desc"),
              selected: (this.activeIndex == 3) 
            },
            {
              label: Core.Localize("task"),
              icon: "fa-solid fa-list-check",
              subTitle: Core.Localize("task_desc"),
              selected: (this.activeIndex == 4),
              onClick : (event) => {
                const _fProps     = Article.getTaskFormProperties();

                this.gridConfig   = {
                  reloaded        : true,
                  viewtype        : 'grid',
                  params          : {type__name__icontains:'kundenprojekt', type:2, id: this.data?.task},
                  apiService      : (p, m, n?) => this._crm.project_tasks(p, m, n),
                  title           : Core.Localize("task"),
                  formProperties  : _fProps.formProperties,
                  formStructure   : _fProps.formStructure,
                  addCallback     : (param:ConfirmDialogResult) => {
                    const _data = param.apiData.results[0];
                    let _taskArr    = this.data.task.concat(_data['id']);
                    this._subs.add(this.api({id:this.data.id, task: _taskArr}, 'patch').subscribe(res => {
                      this.data = res.content.results[0];
                      this.gridList.grid.apiCallParams.params = {...this.gridList.container.params, id: _taskArr};
                      this.gridList.triggerChangeDetection();
                    }));
                  }
                }

              },
            },
          ]

        }
      }

      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cd});
    }


  afterSaved(changes){
    console.log({changes});
    if(changes?.field=="currency"){
      this.ngOnInit();
    }
    if(this.dialogConfig?.data){
      this.dialogConfig.data.isChanged = changes;
    }
    this._sharedService.globalVars.gridListChanged = changes;
  }

  override ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.afterViewInitLoaded = true;
    })
  }

  private _setChartConfig(chart_data, info_data){
    /* Just an Example needs to change on when configuring */
    this.statistics = [
      {
        layout      : 'chart',
        chart_type :'xy',
        chart_data : chart_data['invoices__name'],
        title      : 'Invoices Details' ,
        id         : `invoices__name_${this._wr.libraryService.makeid(3)}`,
        show_label : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        callback    : (p) => {},
                        api: (rawValue: any) => {
                          return this._crm.sales_invoices(rawValue);
                        },
                        params      : {company : this.detailsConfig.data},
                        //formProp    : Contacts.getBankAccountFormProperties()['formProperties'],
                        //formStruc   : Contacts.getBankAccountFormProperties()['formStructure'],
                        icon        : "fa-solid fa-euro",
                        message     : "No Invoices Details Found",
                        topic       : "Invoices"
                      }
      }
    ]
  }

  ngAfterViewChecked(){
    if(this.detailsConfig.isLoading == false && this.detailsConfig?.data && !this._hasChecked){
      const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig.aggs);
      this._setChartConfig(stats_data['chart'], stats_data['info']);
      this._hasChecked = true
    }
  }
}
