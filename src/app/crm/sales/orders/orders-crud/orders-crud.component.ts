import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObserverService, MenuItems, apiMethod, Core, ConfirmDialogResult, MESSAGE_SEVERITY, ResponseObj, GridResponse, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { Orders } from '../orders';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { Subscription, forkJoin, of } from 'rxjs';
import { SettingsService } from 'src/app/settings/settings.service';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { Position } from '../../position/position';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-orders-crud',
  templateUrl: './orders-crud.component.html',
  styleUrls: ['./orders-crud.component.scss']
})
export class OrdersCrudComponent extends RouteObserverService implements OnInit, OnDestroy {
  private menuItems         !: MenuItem[];
  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public permission         : any;
  public activeIndex        : number = 1;
  public isChanged          : boolean;
  public files              : { [file_name: string]: File[]; } = {};
  public form               = Orders.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("order", {count: 2});
  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();
  public statistics         : IStatsChart[];
  private _hasChecked       : boolean = false;

  public dialogVisible      : boolean = false;

  public cache_positions    : any = [];
  public sel_positions      : any = [];
  public excluded_postion   : any = [1,2,3,4,5];
  public sel_type           : "invoice" | "delivery" | "project" = "delivery";

  public api                : any = (p?: any, method?: apiMethod, nextUrl?) => this._crm.sales_orders(p, method, nextUrl);
  public itemId             : any;
  public workflow_items     : MenuItem[] = [];

  private _subscription     : Subscription = new Subscription();
  private _ref              : DynamicDialogRef;

  private _statuses         : any[];
  public dataType           : string;

  public positionTypes      = Position.typesValue;
  relatedDocs: any[];

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _crm                    : CrmService,
              private _cdr                    : ChangeDetectorRef,
              private _dialogService          : DialogService,
              private _messageService         : MessageService,
              private _settings               : SettingsService,
              private _sharedService          : SharedService,
              private _titleCase              : TitleCasePipe,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig
            ) {
                super(_route, _router);
                this._title       = (this.dialogConfig == null )? this._title : this.dialogConfig.header
                this.mode         = (this.dialogConfig == null )? "edit" : this.dialogConfig.data.mode;
                this.itemId       = (this.snapshotParams?.['id'] == undefined)? dialogConfig.data.item?.id : this.snapshotParams['id'];
                this._isDisabled  = (this.mode == "add") ? true : false;
                this._sharedService.globalVars.gridListChanged = false;
              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      this.isLoading = true;
      this.dataType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
      this._initDetailsContainer();
    }

    private _setWorkflowItems(){
      this.workflow_items = [ {
        label: Core.Localize('done'),
        disabled: !this.permission.update,
        visible: true,
        icon: "fa-solid fa-check ",
        styleClass : "text-success font-bolder text-lg bg-success-faded",
        command: (event) => {
          const _status = "done";
          this._setActionItems(_status, this.data);
          this._update({id: this.itemId, status:_status});
        },
      },
      {
        label: Core.Localize('cancel', {item: Core.Localize('order')}),
        disabled: !this.permission.update,
        visible: true,
        icon: "fa-solid fa-times ",
        styleClass : "text-danger font-bolder text-lg bg-danger-faded",
        command: (event) => {
          const _status = "cancelled";
          this._setActionItems(_status, this.data);
          this._update({id: this.itemId, status:_status});
        },
      },]
    }
    private _initDetailsContainer(itemId?){
      let that = this;
      const header = this._title;
      this.data       = this.dialogConfig?.data?.item;
      this.permission = this.dialogConfig?.data?.permission;

      let item = (this.snapshotParams?.['id'] == undefined) ? this.dialogConfig.data?.item?.id : this.snapshotParams?.['id'];

      // this.mode = "edit";
      this._isDisabled = false;
      const showBars = true;

      this.config = {
        showNavbar        : showBars,
        showDetailbar     : this.mode != 'add',
        detailBarExpanded : true,
        navbarExpanded    : false,
        hasHeader         : true,
        header            : header,
        subheader         : Core.Localize("dContainerSubHeader", {header}),
        dialogConfig    : this.dialogConfig,
        dialogRef       : this.ref,
        itemId          : item,
        params          : {id:this.config?.itemId},
        detailsApi$     : (param, method, nextUrl) => this.api(param, method, nextUrl),
        formProperty : {
          includedFields  : this.form['includedFields'],
          formProperties  : this.form['formProperties'],
          mode            : this.mode,
        },
        sidebar : {
          header,
          items : [
            {
              label: Core.Localize('general'),
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('order')}),
              selected: (this.activeIndex == 0) ? true : false,
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('order')}),
              selected: (this.activeIndex == 1) ? true : false,
              onClick : (event) => {
                this.activeIndex = 1;
              },
            },
            {
              label: Core.Localize('condition', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('conditionOfThisItem', {item: Core.Localize('order')}),
              selected: (this.activeIndex == 2) ? true : false,
              onClick : (event) => {
                this.activeIndex = 2;
              },
            },
            {
              label: Core.Localize('address'),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-location-dot",
              subTitle: Core.Localize('setTheItemAddress', {item: `${Core.Localize('delivery')} ${Core.Localize('and')?.toLowerCase()} ${Core.Localize('billing')}`}),
              selected: (this.activeIndex == 3) ? true : false,
              onClick : (event) => {
                this.activeIndex = 3;
              },
            },
            {
              label: Core.Localize('text', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-envelope",
              subTitle: Core.Localize('customize_email'),
              selected: (this.activeIndex == 4) ? true : false,
              onClick : (event) => {
                this.activeIndex = 4;
              },
            },
            {
              label: Core.Localize('setting', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-gear",
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('order')}),
              selected: (this.activeIndex == 5) ? true : false,
              onClick : (event) => {
                this.activeIndex = 5;
                this._cdr.detectChanges();
              },
            },
            {
              label: Core.Localize('flow'),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-microchip",
              subTitle: Core.Localize('related_records'),
              selected: (this.activeIndex == 6) ? true : false,
              onClick : (event) => {
                this.activeIndex = 6;
              },
            },  
          ]
        },
        hasComments   : true,
        commentsApi$  : (param, method, nextUrl) => this._crm.sales_comments(param, method, nextUrl),
        /* hasLogs:true,
        logsApi$: (param, method, nextUrl)   =>this._crm.project_comments(param, method, nextUrl), */
        hasUpdates:false,
        workflowItems : this.workflow_items,
        actionItems : [
          {
            label: Core.Localize('create', {item: Core.Localize('delivery')}),
            icon: "fa-solid fa-truck ",
            disabled: true,
            styleClass : " text-lg",
            command: (event) => {
              const _status = "partial";
              this.dialogVisible = true;
              this.sel_type = "delivery";
            },
          },
          {
            label: Core.Localize('create', {item: Core.Localize('invoice')}),
            disabled: true,
            icon: "fa-solid fa-file-invoice-dollar ",
            styleClass : "text-lg",
            command: (event) => {
              const _status = "partial";
              this.dialogVisible = true;
              this.sel_type = "invoice";
            },
          },
          {
            label: Core.Localize('create', {item: Core.Localize('project')}),
            disabled: true,
            icon: "fa-solid fa-diagram-project",
            styleClass : "text-lg",
            command: (event) => {
             /*  this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status}); */
            },
          },
          {
            label: Core.Localize('edit', {item: Core.Localize('order')}),
            visible: false,
            icon: "fa-solid fa-file-pen",
            styleClass : "text-lg",
            command: (event) => {
              const _status = "pending";
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            },
          },
          {
            label: Core.Localize('email_item', {item: Core.Localize('order')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'order',
                    fields: this.detailsConfig.fields,
                    emailApi: (rawValue: any) => {
                      //TODO sales order email
                      return this._crm.sales_quotes_email({...rawValue, id: item, template: 1, language: "EN" }, 'put');
                    }
                },
                header: Core.Localize('create', {item: Core.Localize('order')}),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                height: '90vh',
              };

              this._ref = this._dialogService.open(EmailRendererComponent, _dialogConf);
              this._subscription.add(this._ref?.onClose.subscribe(result => {
                if ((<ConfirmDialogResult>result)?.isConfirmed) {
                    this._messageService.add({
                      severity: MESSAGE_SEVERITY.SUCCESS,
                      summary: Core.Localize('emailSuccessfullySent')});
                }
              }));
            },
          },
          {
            label: Core.Localize('print', {item: Core.Localize('order')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('order')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-print",
                styleClass : "text-lg",
                command : (event) => {

                },
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('order')} ${Core.Localize('without_letterhead')}` }),
                icon: "fa-solid fa-print",
                styleClass : "text-lg",
                command : (event) => {

                },
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('order')}),
            icon: "fa-solid fa-copy",
            styleClass : "text-lg",
            command : (event) => {
              const _pData = Object.assign({}, this.detailsConfig.data);
              const _status = this._statuses?.find(_s => _s.name == 'PENDING');
              delete _pData.id;
              delete _pData.__data__;
              delete _pData.payment_type;
              //delete _pData.positions;

              for (const key in _pData) {
                if (Object.prototype.hasOwnProperty.call(_pData, key)) {
                  const element = _pData[key];

                  if(element){
                    if(key == 'status'){
                      _pData[key] = (_status?.id || 1);
                    } else{
                      if(typeof element == 'object'){
                        if(Array.isArray(element)){
                          //delete _pData[key];
                        } else if(element.id){
                          _pData[key] = element.id;
                        }
                      }
                    }
                  }
                }
              }

              this.subscription.add(this.detailsConfig.api(_pData, 'put').subscribe((res: ResponseObj<GridResponse>) => { //code 204
                  this._messageService.add({detail: Core.Localize("stateSuccessfully", {state: Core.Localize('statusDuplicated')}) , severity: MESSAGE_SEVERITY.SUCCESS});
                  this.isChanged = true;
                  this.data = {...this.data, isChanged: this.isChanged};
                  this.permission = res.content.permission;

                  if(this.dataType == 'dialog'){
                    this._ref?.close(res?.content?.results?.[0]);
                  } else if(this.dataType == 'route'){
                    this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._route, queryParams: {onRefresh: true}, state: {onRefresh: true}}});
                  }
              }));

              /* this.detailsConfig.api(_pData, 'put').subscribe((res: ResponseObj<GridResponse>) => {
                if([200, 201].includes(res?.status.status_code)){
                  this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
                  this.isChanged = true;
                  this.data = {...this.data, isChanged: this.isChanged};
                }
              }) */
            },
          },
          {
            label: Core.Localize('preview'),
            icon: "fa-solid fa-magnifying-glass-dollar",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
                data: {
                  item: this.detailsConfig?.data,
                  template_type: 'order'
                },
                header: Core.Localize('order'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                styleClass: 'bg-primary-faded'
              };

              this._ref = this._dialogService.open(PositionPreviewComponent, _dialogConf);
            },
          },
          {
            label: Core.Localize('edit', {item: this._titleCase.transform(Core.Localize('template'))}),
            icon: "fa-solid fa-pen-to-square",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
                data: {
                  item: this.detailsConfig?.data,
                  template_type: 'order'
                },
                header: Core.Localize('order'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                styleClass: 'bg-primary-faded'
              };
              this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
            },
          },
        ],

        onApiComplete: (perm, data) => {
          if((data?.__data__?.positions || []).length > 0){
            /* data.__data__.positions.filter(_p => ['standard_position', 'product_position'].includes(_p.type?.position_key)).forEach(e => { */
            data.__data__.positions.forEach(e => {
              this.cache_positions.push(Object.assign({}, e));
              this.sel_positions.push(Object.assign({}, e));
            })
          }

          if(!this.detailsConfig.formGroup?.get('mwst_type')?.value || this.detailsConfig.formGroup?.get('mwst_type')?.value === "0"){ //RT
            this.detailsConfig.formGroup?.get('mwst_type')?.setValue(1, {emitEvent: false});
          }

          this.data       = data;
          this.permission = perm;
          this._setWorkflowItems();
          this._setActionItems(this.data?.status, this.data);

          this.isLoading = false;
          this.detailsConfig?.triggerChangeDetection();

          //Related Documents
          let _invoice_ids = (data.__data__?.invoices || []).map(_i => _i.id);
          const _fork$ = {
            quotes: this._crm.sales_quotes({id: data?.quote, limit: 1000}, "post"),
            //invoices: (_invoice_ids.length > 0 ? this._crm.sales_invoices({id: _invoice_ids, limit: 1000}, "post") : of({ content: {results: []}} as ResponseObj<GridResponse>)),
            invoices: (this._crm.sales_invoices({order: data?.id, limit: 1000}, "post")),
          }
    

          this._subs.sink = forkJoin(_fork$).subscribe({
            next : ({quotes, invoices}) => {
              if(!this._wr.libraryService.checkGridEmptyFirstResult(quotes)){
                this.relatedDocs = (quotes?.content?.results || []).map(_o => ({..._o, type: 'quotes'}));
              }

              if(!this._wr.libraryService.checkGridEmptyFirstResult(invoices)){
                this.relatedDocs = (invoices?.content?.results || []).map(_o => ({..._o, type: 'invoices'}));
              }
              
              if(!this.relatedDocs){
                this.relatedDocs = [];
              }
            }
          });
        }
      }
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});

      this.subscription.add(this._settings.process_status({limit: 100, eg_content_type: 107}).subscribe( (res: ResponseObj<GridResponse>) => {
        this._statuses = res.content.results;
      }));
    }

    private _update(param){
      this.isLoading = true;
      this._subs.id('update').sink = this.api(param, 'patch').subscribe({
        next : (res) => {
          this.data = res.content.results[0];
          this.permission = res.content.permission;
        }, error: (err) => {
          this.isLoading = false;
          this.detailsConfig.triggerChangeDetection();
          this._subs.id('update').unsubscribe();
        },
        complete : () => {
          this.isLoading = false;
          this.detailsConfig.triggerChangeDetection();
          this._subs.id('update').unsubscribe();
        }
      });
    }

    private _setActionItems(status, data){
      const _status = (typeof status == "object")? status.value.toLowerCase() : status ;
      
      this.config.actionItems[0].disabled = hasPositions(data?.positions) || _status == 'done';
      this.config.actionItems[1].disabled = hasPositions(data?.positions) || _status == 'done';

      this.config.actionItems[2].label   = hasProject(data?.project);

      switch(_status){
        case "pending":
          this.config.workflowItems = this.workflow_items;
          //create delivery
          this.config.actionItems[0].visible = true;
          //create invoice
          this.config.actionItems[1].visible = true;
          //create project
          this.config.actionItems[2].visible = true || data?.project != null;;
          //edit order again
          this.config.actionItems[3].visible = false;

          break;
        case "partial":
          this.config.workflowItems = this.workflow_items;
          //create delivery
          this.config.actionItems[0].visible = true;
          //create invoice
          this.config.actionItems[1].visible = true;
          //create project
          this.config.actionItems[2].visible = false || data?.project != null;;
          //edit order again
          this.config.actionItems[3].visible = false;

          break;
        case "done":
          this.config.workflowItems = [];
          //create delivery
          this.config.actionItems[0].visible = true;
          //create invoice
          this.config.actionItems[1].visible = true;
          //create project
          this.config.actionItems[2].visible = false || data?.project != null;
          //edit order again
          this.config.actionItems[3].visible = true;

          break;
        case "cancelled":
          this.config.workflowItems = [];
          //create delivery
          this.config.actionItems[0].visible = false;
          //create invoice
          this.config.actionItems[1].visible = false;
          //create project
          this.config.actionItems[2].visible = true || data?.project != null;
          //edit order again
          this.config.actionItems[3].visible = true;
          break;

      }

      function hasPositions(data){
        if(data != null && data.length > 0){
          return false;
        }else{
          return true;
        }
      }
      function hasProject(data){
        if(data != null){
          return Core.Localize('open', data.name);
        }else{
          return Core.Localize('create', {item: Core.Localize('new', {item: Core.Localize('project')})});
        }
      }
    }

    processOrder(data?){
      /* let _data = [];
      if(this._wr.helperService.isArrayOfNumber(data)){
        _data = data;
      } else if(this._wr.helperService.isArrayOfObject(data)){
        _data = data.map(_d => _d.id);
      } */
      switch(this.sel_type){
        case 'invoice':
          const _oI = {positions:data, company:this.data.company.id, order: this.itemId, name:this.data.name}
          let _idI = null;
          this._subs.id('order').sink = this._crm.sales_invoices(_oI, "put").subscribe({
            next : (res) => { _idI = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/invoices/', _idI], extraParams:{}})},
          })
          break;

        case 'delivery':
          const _oP = {positions:data, company:this.data.company.id, order: this.itemId, name:this.data.name}
          let _id = null;
          this._subs.id('order').sink = this._crm.sales_delivery_notes(_oP, "put").subscribe({
            next : (res) => { _id = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/delivery_notes/', _id], extraParams:{}})},
            error: (err) => {
              if(err?.error?.details?.detail){
                this._messageService.add({detail: err?.error?.details?.detail, severity: MESSAGE_SEVERITY.WARN, contentStyleClass: 'bg-warn'});
              }
            },
          })
          break;
      }
    }

    updateOrder(index){
      let form = this.detailsConfig?.formGroup.getRawValue();
      let formStr = this.form["formStructure"][index]["fields"];
      let temp = {};
      formStr.forEach(key => {
        if(typeof(form[key]) == "object"){
          temp[key] = form[key]['id']
        }else {
          temp[key] = form[key];
        }
      });

      let param = {id:this.config.itemId, ...temp};
      this._subs.id('patch_order').sink = this.api(param, "patch").subscribe(
        {
          next :(res:any) => {
            this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
            this.isChanged = true;
            this.data = {...this.data, isChanged: this.isChanged};
            this.permission = res.content.permission;
            this._sharedService.globalVars.gridListChanged = this.isChanged;
          },
          complete : () => {
            this._subs.id("patch_order").unsubscribe();
          }
        })
    }

    updatePosition(event){
        const param = {"positions":event.data, "id": this.config.itemId};

        this._subs.id('patch_order_position').sink = this.api(param, 'patch').subscribe(
          {
            next :(res:any) => {
              this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
              this.isChanged = true;
              this.data = {...this.data, isChanged: this.isChanged};
              this.permission = res.content.permission;
              this._sharedService.globalVars.gridListChanged = this.isChanged;
            },
            complete : () => {
              setTimeout(()=>{
                this._subs.id("patch_order_position").unsubscribe();
              });
            }
          })


    }


    override ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.snapshotLoaded = false;
      this._subs.unsubscribe();
    }

    private _setChartConfig(chart_data, info_data){
      //Just an Example needs to change on when configuring
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
                            return this._crm.sales_invoices();
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
        this._hasChecked = true
        this._setChartConfig(stats_data['chart'], stats_data['info']);
      }
    }
}


/*    private _setStatus(_stat: string){
        const _newStatus = this._statuses?.find(_s => _s.name?.toUpperCase() == _stat);
        if(_newStatus){
          this.detailsConfig?.api({id: this.detailsConfig?.data.id, status: _newStatus.id}, 'patch').subscribe( res => {
            this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
            this._wr.helperService.gotoPage({extraParams: {}});
          });
        } else{
          this._messageService?.add({summary: `Status '${_stat}' not found.

          ${Core.Localize('pleaseNotifyAdmin', {org: 'Eagna'})}`, severity: MESSAGE_SEVERITY.WARN});
        }
    } */
