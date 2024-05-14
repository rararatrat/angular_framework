import {  ChangeDetectorRef, Component, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiMethod, Core, ConfirmDialogResult, MESSAGE_SEVERITY, ResponseObj, GridResponse, RouteObserverService, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { Observable, Subscription, map, tap } from 'rxjs';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { ProjectComponent } from 'src/app/crm/project/project.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { Bills } from '../bills';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-bills-crud',
  templateUrl: './bills-crud.component.html',
  styleUrls: ['./bills-crud.component.scss']
})
export class BillsCrudComponent extends RouteObserverService{
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
  public form               = Bills.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("quote", {count: 2});

  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();
  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;

  public dialogVisible      : boolean = false;

  public cache_positions    : any = [];
  public sel_positions      : any = [];
  public excluded_postion   : any = [1,2,3,4,5];
  public sel_type           : "invoice" | "order" | "project" = "order";

  public api                : any = (p?: any, method?: apiMethod, nextUrl?) => this._crm.purchasing_bills(p, method, nextUrl).pipe(tap(res => console.log(res.content.fields.map(_r => _r.field))));
  public itemId             : any;
  public workflow_items     : MenuItem[] = [];

  private _ref: DynamicDialogRef;
  private _subscription = new Subscription();
  _statuses: any[];
  dataType: string;
  relatedDocs: any[];

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _crm                    : CrmService,
              private _cdr                    : ChangeDetectorRef,
              private _route                  : ActivatedRoute,
              private _router                 : Router,
              private _dialogService          : DialogService,
              private _messageService         : MessageService,
              private _sharedService          : SharedService,
              private _titleCase              : TitleCasePipe,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() public dialogConfig : DynamicDialogConfig
            ) {
                super(_route, _router);
                this._title = (this.dialogConfig == null )? this._title : this.dialogConfig.header
                this.mode = (this.dialogConfig == null )? "edit" : this.dialogConfig.data.mode;
                this._isDisabled = (this.mode == "add");
                this.itemId = (this.snapshotParams?.['id'] == undefined)? dialogConfig.data.item?.id : this.snapshotParams['id'];
                this._sharedService.globalVars.gridListChanged = false;
              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      this._setWorkflowItems();
      this.dataType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
      this._initDetailsContainer();

      //TODO related Docs
      if(!this.relatedDocs){
        this.relatedDocs = [];
      }
    }

    private _setWorkflowItems(){

      this.workflow_items = [{
        label:"Accept",
        icon: "fa-solid fa-check",
        visible: true,
        styleClass : "text-success font-bolder bg-success-faded",
        command: (event) => {
          const _status = "accepted";
          this._update({id: this.itemId, status:_status});
          this._setActionItems(_status, this.data);
        },
      },
      {
        label:"Reject",
        visible: true,
        icon: "fa-solid fa-times ",
        styleClass : "text-danger font-bolder bg-danger-faded",
        command: (event) => {
          const _status = "rejected";
          this._setActionItems(_status, this.data);
          this._update({id: this.itemId, status:_status});
        },
      }]
    }

    private _initDetailsContainer(itemId?){
      let that = this;
      const header = this._title;
      this.data = this.dialogConfig?.data?.item;
      this._isDisabled = false
      const showBars = true;

      /* uncomment the below */
      //const showBars = (this.mode == "add") ? false : true;
      let _enabled_status = ['draft', 'accepted']
      this.config = {
        showNavbar        : showBars,
        showDetailbar     : this.mode != 'add',
        detailBarExpanded : true,
        navbarExpanded    : false,
        hasHeader         : true,
        header            : header,
        subheader         : Core.Localize("dContainerSubHeader", {header}),
        dialogConfig      : this.dialogConfig,
        dialogRef         : this.ref,
        itemId            : this.itemId,
        params            : {id:this.config?.itemId},
        detailsApi$       : (param, method, nextUrl)   => {
          return this.api(param, method, nextUrl);
        },
        formProperty      : {
          //includedFields  : this.form['includedFields'],
          formProperties  : this.form['formProperties'],
          mode            : this.mode,
        },
        sidebar       : {
          header,
          items  : [
            {
              label: Core.Localize('general'),
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('bill')}),
              selected: (this.activeIndex == 0),
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('bill')}),
              selected: (this.activeIndex == 1),
            },
            {
              label: Core.Localize('condition', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('conditionOfThisItem', {item: Core.Localize('bill')}),
              selected: (this.activeIndex == 2),
            },
            {
              label: Core.Localize('address'),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-location-dot",
              subTitle: Core.Localize('setTheItemAddress', {item: `${Core.Localize('delivery')} ${Core.Localize('and')?.toLowerCase()} ${Core.Localize('billing')}`}),
              selected: (this.activeIndex == 3),
            },
            {
              label: Core.Localize('text', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-envelope",
              subTitle: Core.Localize('customize_email'),
              selected: (this.activeIndex == 4),
            },

            {
              label: Core.Localize('setting', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-gear",
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('bill')}),
              selected: (this.activeIndex == 5),
            },
          /* {
              label: Core.Localize('flow'),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-microchip",
              subTitle: Core.Localize('related_records'),
              selected: (this.activeIndex == 6),
              onClick : (event) => {
                this.activeIndex = 6;
              },
            }, */
          ]

        },
        hasComments   : true,
        commentsApi$  : (param, method, nextUrl)   => {
          return this._crm.project_comments(param, method, nextUrl)
        },
        hasLogs:true,
        logsApi$      : (param, method, nextUrl) => {
          return this._crm.project_logs(param, method, nextUrl)
        },
        hasUpdates:true,
        updateApi$: (param, method, nextUrl) => {
          return this._crm.project_updates(param, method, nextUrl)
        },

        workflowItems : this.workflow_items,
        actionItems : [
          /* ...(this.detailsConfig?.data?.status == 'COMPLETE'? [] : []), */
          {
            label: Core.Localize('setStatusTo', {status: ''}),
            icon: "fa-solid fa-circle",
            styleClass : "text-lg",
            command: (event) => {
              const _status = (this.data?.status?.value == "draft")?'pending':'draft';
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            }
          },
          {
            label: Core.Localize('create', {item: Core.Localize('order')}),
            visible: false,
            icon: "fa-solid fa-file-invoice",
            styleClass : "text-lg",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "order";
            },
          },
          {
            label: Core.Localize('create', {item: `${Core.Localize('an')} ${Core.Localize('invoice')}`}),
            visible: false,
            icon: "fa-solid fa-file-invoice-dollar",
            styleClass : "text-lg",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "invoice";
            },
          },
          {
            label: Core.Localize('create', {item: `${Core.Localize('a')} ${Core.Localize('project')}`}),
            visible: false,
            icon: "fa-solid fa-diagram-project",
            styleClass : "text-lg",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "project";
              if(this.data.project != null){
                const _dialogConf = <DynamicDialogConfig<{api: (p, m) => Observable<any>, item: any}>>{
                  /* id: Math.random(), */
                  data: {
                    item: this.data.__data__.project
                  },
                  header: Core.Localize('quote'),
                  showHeader: true,
                  maximizable: true,
                  width: '85vw',
                  position:"top",
                  transitionOptions:"0s",
                };
                this._dialogService.open(ProjectComponent, _dialogConf)
              }
            },
          },

          {
            label: Core.Localize('email_item', {item: Core.Localize('bill')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'bills',
                    fields: this.detailsConfig?.fields,
                    emailApi: (rawValue: any) => {
                      //return this._crm.sales_quotes_email({...rawValue, id: item, template: rawValue?.template?.id, language: "EN" }, 'put');
                      return this._crm.sales_quotes_email({...rawValue, id: this.itemId, template: rawValue?.template?.id, language: "EN" }, 'put');
                    }
                },
                header: Core.Localize('email_template'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                height: '90vh',
                position: "top"
              };

              this._ref = this._dialogService.open(EmailRendererComponent, _dialogConf);
              this._subscription.add(this._ref?.onClose.subscribe(result => {
                if ((<ConfirmDialogResult>result)?.isConfirmed) {
                    this._messageService.add({
                      //detail: Core.Localize('emailSuccessfullySent'),
                      severity: MESSAGE_SEVERITY.SUCCESS,
                      summary: Core.Localize('emailSuccessfullySent')});
                }
              }));
            },
          },
          {
            label: Core.Localize('print', {item: Core.Localize('bill')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('quote')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('quote')} ${Core.Localize('without_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('bill')}),
            icon: "fa-solid fa-copy",
            styleClass : "text-lg",
            command : (event) => {
              const _pData = Object.assign({}, this.detailsConfig.data);
              const _status = this._statuses?.find(_s => _s.name == 'Work in Progress');
              delete _pData.id;
              delete _pData.__data__;
              delete _pData.files;
              /* delete _pData.payment_type;
              delete _pData.positions; */

              for (const key in _pData) {
                if (Object.prototype.hasOwnProperty.call(_pData, key)) {
                  const element = _pData[key];

                  if(element){
                    if(key == 'status'){
                      _pData[key] = (_status?.id || 1);
                    } else{
                      if(typeof element == 'object' /* && element.id */){
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
                  if(this.dataType == 'dialog'){
                    this._ref?.close(res?.content?.results?.[0]);
                  } else if(this.dataType == 'route'){
                    this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._route, queryParams: {onRefresh: true}, state: {onRefresh: true}}});
                  }
              }));
            },
          },
          {
            label: Core.Localize('preview'),
            icon: "fa-solid fa-magnifying-glass-dollar",
            styleClass : "text-lg",
            command : (event) => {
              console.log({d: this.detailsConfig?.data});

              const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
                data: {
                  item: this.detailsConfig?.data,
                  template_type: 'bills'
                },
                header: Core.Localize('bill'),
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
                  template_type: 'bills'
                },
                header: Core.Localize('bill'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                styleClass: 'bg-primary-faded'
              };
              //this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
              this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
            },
          },
        ],
        onApiComplete: (perm, data) => {
          let _position_data: any[];
          if(data?.__data__?.position?.length > 0){
            _position_data = data.__data__.position;
            _position_data.forEach(e => {
              e.type = e.pos_type;
              delete e.pos_type;
              this.cache_positions.push(Object.assign({}, e));
            });
            data.positions = this.cache_positions;
            delete data.position;
            data.__data__.positions = this.cache_positions;
            delete data.__data__.position;
          } else if(data?.position && this._wr.helperService.isArrayOfNumber(data.position)){
            this._subs.id('getPurchasingPositionsById').sink = this._crm.purchase_positions({id: data.position}).subscribe({next: (res: ResponseObj<GridResponse>) => {
              if(!this._wr.libraryService.checkGridEmptyFirstResult(res)){
                res.content?.results?.forEach(e => {
                  e.type = e.pos_type;
                  delete e.pos_type;
                  this.cache_positions.push(Object.assign({}, e));
                });
                data.positions = this.cache_positions;
                delete data.position;
                data.__data__.positions = this.cache_positions;
                delete data.__data__.position;
              } else{
                console.warn("empty positions with id", data.position)
              }
            }, 
            complete: () => {
              this._subs.id('getPurchasingPositionsById').unsubscribe();
            }});
          }

          /* if(data && !data.mwst_type){
            data.mwst_type = 1;
            this.detailsConfig?.formGroup?.get('mwst_type')?.setValue(data.mwst_type, {emitEvent: false});
          } */

          this.data       = data;
          this.permission = perm;

          if(this.data?.status){
            this._setActionItems(this.data?.status, this.data);
          }
          this.isLoading = false;
          this.detailsConfig?.triggerChangeDetection();
        },
      }
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
    }

    private _update(param){
      this.isLoading = true;
      this._subs.id('update').sink = this.api(param, 'patch').subscribe({
        next : (res) => {
          this.data = res.content.results[0];
          this.permission = res.content.permission;
        },
        complete : () => {
          this.isLoading = false;
          this.isChanged = true;
          this.data.isChanged = this.isChanged;
          this._sharedService.globalVars.gridListChanged = this.isChanged;
          this.detailsConfig.triggerChangeDetection();
          this._subs.id('update').unsubscribe();
        }
      });
    }

    private _setActionItems(status, data){

      const _status = (typeof status == "object")? status.value.toLowerCase() : status ;
      switch(_status){
        case "draft":
          this.config.workflowItems = this.workflow_items;
          //set bill
          this.config.actionItems[0].label   = 'Set Status to Pending'
          this.config.actionItems[0].icon     = 'fa-solid fa-triangle-exclamation'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = false || data?.project != null;;
          break;
        case "pending":
          this.config.workflowItems = this.workflow_items;
          //set bill
          this.config.actionItems[0].label   = 'Set Status to Draft'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = true || data?.project != null;
          break;
        case "accepted":
          this.config.workflowItems = [];
          //set bill
          this.config.actionItems[0].label    = 'Edit Bill'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = true;
          //create invoice
          this.config.actionItems[2].visible = true;
          //create project
          this.config.actionItems[3].visible = true || data?.project != null;

          break;
        case "rejected":
          this.config.workflowItems = [];
          //set bill
          this.config.actionItems[0].label   = 'Edit Bill'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = false || data?.project != null;

          break;
        case "issued":
          this.config.workflowItems = [];
          //set bill
          this.config.actionItems[0].label    = 'Edit Bill'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = false;
          break;
      }

      this.config.actionItems[3].label   = hasProject(data?.project);

      function hasProject(data){
        if(data != null){
          return `Open ${data.name}`;
        }else{
          return `Create New Project`;
        }
      }
    }

    processBill(data?){
      /* switch(this.sel_type){
        case 'invoice':
          const _oI = {positions:data, company:this.data.company.id, quote: this.itemId, name:this.data.name}
          let _idI = null;
          this._subs.id('order').sink = this._crm.sales_invoices(_oI, "put").subscribe({
            next : (res) => { _idI = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/invoices/', _idI], extraParams:{}})},
          })
          break;

        case 'order':
          const _oP = {positions:data, company:this.data.company.id, quote: this.itemId, name:this.data.name}
          let _id = null;
          this._subs.id('order').sink = this._crm.sales_orders(_oP, "put").subscribe({
            next : (res) => { _id = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/orders/', _id], extraParams:{}})},
          })
          break;

        case 'project':
          break;
      }
      console.log(data, this.data.positions); */
    }

    updateBill(index){
      let form = this.detailsConfig?.formGroup.getRawValue();
      let formStr = this.form["formStructure"][index]["fields"];
      let temp = {};
      formStr.forEach(key => {
        if(typeof(form[key]) == "object"){
          temp[key] = form[key]['id']
        } else {
          temp[key] = form[key];
        }
      });

      let param = {id:this.config.itemId, ...temp};
      this._subs.id('patch_quote').sink = this.api(param, "patch").subscribe(
        {
          next :(res:any) => {
            this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
            this.isChanged = true;
            this.data = {...this.data, isChanged: this.isChanged};
            this.permission = res.content.permission;
            this._sharedService.globalVars.gridListChanged = this.isChanged;
          },
          complete : () => {
            this._subs.id("patch_quote").unsubscribe();
          }
        })
    }

    updatePosition(event){
        const param = {"positions":event.data, "id": this.config.itemId};
        this._subs.id('patch_quote_position').sink = this.api(param, 'patch').subscribe(
          {
            next :(res:any) => {
              this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
              this.isChanged = true;
              this.data = {...this.data, isChanged: this.isChanged};
              this._sharedService.globalVars.gridListChanged = this.isChanged;
            },
            complete : () => {
              this._subs.id("patch_quote_position").unsubscribe();
            }
          });
    }


    override ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.snapshotLoaded = false;
      this._subs.unsubscribe();
    }

    ngAfterViewChecked(){
      if(this.detailsConfig?.isLoading == false && this.isLoading == false && this.detailsConfig?.data && !this._hasChecked){
        /* const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig?.aggs); */
        /* this._setChartConfig(stats_data['chart'], stats_data['info']); */
        this.config = this.config
        this._hasChecked = true
      }
    }
}