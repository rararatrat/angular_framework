import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItems, apiMethod, Core, ConfirmDialogResult, MESSAGE_SEVERITY, ResponseObj, GridResponse, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { forkJoin } from 'rxjs';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { DeliveryNotes } from '../delivery-notes';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-delivery-crud',
  templateUrl: './delivery-crud.component.html',
  styleUrls: ['./delivery-crud.component.scss']
})
export class DeliveryCrudComponent {
  private menuItems         !: MenuItems[];
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
  public form               = DeliveryNotes.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("delivery", {count: 2});

  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();
  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;

  public dialogVisible      : boolean = false;

  public cache_positions    : any = [];
  public sel_positions      : any = [];
  public sel_type           : "invoice" | "order" | "project" = "order";

  public api                : any = (p?: any, method?: apiMethod, nextUrl?) => this._crm.sales_delivery_notes(p, method, nextUrl);
  public itemId             : any;
  public workflow_items     : MenuItem[] = [];

  private _ref: DynamicDialogRef;
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
                this._title = (this.dialogConfig == null )? this._title : this.dialogConfig.header
                this.mode = (this.dialogConfig == null )? "edit" : this.dialogConfig.data.mode;
                this._isDisabled = (this.mode == "add") ? true : false;
                this.itemId = this._route?.snapshot?.params?.['id']  || dialogConfig.data.item?.id;
                this._sharedService.globalVars.gridListChanged = false;
              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      console.log({itemId: this.itemId})
      if(this.itemId){
        this._setWorkflowItems();
        this.dataType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
        this._initDetailsContainer();
        this._initRelatedDocs();
      }
    }

    private _initRelatedDocs(){
      const _fork$ = {
        orders: this._crm.sales_orders({quote: this.itemId, limit: 1000}, "post"),
        invoices: this._crm.sales_invoices({quote: this.itemId, limit: 1000}, "post"),
      }

      this._subs.sink = forkJoin(_fork$).subscribe({
        next : ({orders, invoices}) => {
            //console.log({orders, invoices});

            if(!this._wr.libraryService.checkGridEmptyFirstResult(orders)){
              this.relatedDocs = (orders?.content?.results || []).map(_o => ({..._o, type: 'orders'}));
            }
            if(!this._wr.libraryService.checkGridEmptyFirstResult(invoices)){
              this.relatedDocs = (this.relatedDocs || []).concat((invoices?.content?.results || []).map(_o => ({..._o, type: 'invoices'})));
            }
            // console.log({orders, invoices, rel: this.relatedDocs});
  
            if(!this.relatedDocs){
              this.relatedDocs = [];
            }
            this._cdr.detectChanges();
        }
      });
    }


    private _setWorkflowItems(){

      this.workflow_items = [{
        label:"Done",
        icon: "fa-solid fa-check",
        visible: true,
        styleClass : "text-success font-bolder bg-success-faded",
        command: (event) => {
          const _status = "done";
          this._update({id: this.itemId, status:_status});
          this._setActionItems(_status, this.data);
        },
      },
      {
        label:"Cancel",
        visible: true,
        icon: "fa-solid fa-times ",
        styleClass : "text-danger font-bolder bg-danger-faded",
        command: (event) => {
          const _status = "cancelled";
          this._update({id: this.itemId, status:_status});
          this._setActionItems(_status, this.data);
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
      let _enabled_status = ['draft', 'done']
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
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('delivery')}),
              selected: (this.activeIndex == 0) ? true : false,
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('delivery')}),
              selected: (this.activeIndex == 1) ? true : false,
              onClick : (event) => {
                this.activeIndex = 1;
              },
            },
            {
              label: Core.Localize('condition', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('conditionOfThisItem', {item: Core.Localize('delivery')}),
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
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('delivery')}),
              selected: (this.activeIndex == 5) ? true : false,
              onClick : (event) => {
                this.activeIndex = 5;
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
          /* {
            label: `Set Status to `,
            icon: "fa-solid fa-circle",
            styleClass : "text-lg",
            command: (event) => {
              const _status = (this.data?.status?.value == "draft")?'pending':'draft';
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            }
          }, */
          /* {
            label:"Create Order",
            visible: false,
            icon: "fa-solid fa-file-invoice",
            styleClass : "text-lg",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "order";
            },
          },
          {
            label:"Create a Invoice",
            visible: false,
            icon: "fa-solid fa-file-invoice-dollar",
            styleClass : "text-lg",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "invoice";
            },
          },
          {
            label:"Create a Project",
            visible: false,
            icon: "fa-solid fa-diagram-project",
            styleClass : "text-lg",
            command: (event) => {
              
              if(this.data.project != null){
                const _dialogConf = <DynamicDialogConfig<{api: (p, m) => Observable<any>, item: any}>>{
                  //id: Math.random(),
                  data: {
                    item: this.data.__data__.project
                  },
                  header:  Core.Localize('project'),
                  showHeader: true,
                  maximizable: true,
                  width: '85vw',
                  position:"top",
                  transitionOptions:"0s",
                };
                this._dialogService.open(ProjectDetailComponent, _dialogConf);
              } else {
                this.dialogVisible = true;
                this.sel_type = "project";
              }
            },
          }, */
          {
            label: Core.Localize('email_item', {item: Core.Localize('delivery')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'deliveries',
                    fields: this.detailsConfig?.fields,
                    emailApi: (rawValue: any) => {
                      //return this._crm.sales_quotes_email({...rawValue, id: item, template: rawValue?.template?.id, language: "EN" }, 'put');
                      return this._crm.sales_quotes_email({...rawValue, id: this.itemId, template: rawValue?.template?.id, language: "EN" }, 'put');
                    }
                },
                header: Core.Localize('email_item', {item: Core.Localize('delivery')}),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                height: '90vh',
                position: "top"
              };

              this._ref = this._dialogService.open(EmailRendererComponent, _dialogConf);
              this._subs.sink = this._ref?.onClose.subscribe(result => {
                if ((<ConfirmDialogResult>result)?.isConfirmed) {
                    this._messageService.add({
                      //detail: Core.Localize('emailSuccessfullySent'),
                      severity: MESSAGE_SEVERITY.SUCCESS,
                      summary: Core.Localize('emailSuccessfullySent')});
                }
              });
            },
          },
          {
            label: Core.Localize('print', {item: Core.Localize('delivery')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('delivery')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('delivery')} ${Core.Localize('without_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('delivery')}),
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

              this._subs.sink = this.detailsConfig.api(_pData, 'put').subscribe((res: ResponseObj<GridResponse>) => { //code 204
                  this._messageService.add({detail: Core.Localize("stateSuccessfully", {state: Core.Localize('statusDuplicated')}) , severity: MESSAGE_SEVERITY.SUCCESS});
                  this.isChanged = true;
                  this.data = {...this.data, isChanged: this.isChanged};
                  if(this.dataType == 'dialog'){
                    this._ref?.close(res?.content?.results?.[0]);
                  } else if(this.dataType == 'route'){
                    this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._route, queryParams: {onRefresh: true}, state: {onRefresh: true}}});
                  }
              });
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
                  template_type: 'deliveries'
                },
                header: Core.Localize('delivery'),
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
                  template_type: 'deliveries'
                },
                header: Core.Localize('delivery'),
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
          //console.log({perm, data});
          if((data?.__data__?.positions || []).length > 0){
            data.__data__.positions/* .filter(_p => ['standard_position', 'product_position'].includes(_p.type?.position_key)) */.forEach(e => {
              const _tmp = Object.assign({}, e);
              this.cache_positions.push(_tmp);
              this.sel_positions.push(_tmp);
            });
          }

          if(data){
            if(data.mwst_type < 1){
              data.mwst_type = 1;
              this.detailsConfig?.formGroup?.get('mwst_type')?.setValue(1, {emitEvent: false});
            }
          }

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
      this.config.workflowItems = [];
      const _status = (typeof status == "object")? status.value.toLowerCase() : status ;
      switch(_status){
        case "draft":
          this.config.workflowItems = this.workflow_items;
          //set delivery
          /* this.config.actionItems[0].label   = 'Set Status to Pending'
          this.config.actionItems[0].icon     = 'fa-solid fa-triangle-exclamation'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = false || data?.project != null; */
          break;
        /* case "pending":
          this.config.workflowItems = this.workflow_items;
          //set delivery
          this.config.actionItems[0].label   = 'Set Status to Draft'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = true || data?.project != null;
          break;
        case "done":
          this.config.workflowItems = [];
          //set delivery
          this.config.actionItems[0].label    = 'Edit Delivery'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = true;
          //create invoice
          this.config.actionItems[2].visible = true;
          //create project
          this.config.actionItems[3].visible = true || data?.project != null;
          break;
        case "cancelled":
          this.config.workflowItems = [];
          //set Delivery
          this.config.actionItems[0].label   = 'Edit Delivery'
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
          //set Delivery
          this.config.actionItems[0].label    = 'Edit Delivery'
          this.config.actionItems[0].icon     = 'fa-solid fa-pencil'
          //create order
          this.config.actionItems[1].visible = false;
          //create invoice
          this.config.actionItems[2].visible = false;
          //create project
          this.config.actionItems[3].visible = false;
          break; */
      }
/* 
      this.config.actionItems[3].label  = hasProject(data?.project);

      function hasProject(data){
        if(data != null){
          return `Open ${data.name}`;
        }else{
          return `Create New Project`;
        }
      } */
    }

    processDelivery(data?){
      switch(this.sel_type){
        case 'invoice':
          const _oI = {positions:data, company:this.data.company.id, quote: this.itemId, name: this.data.name, title: (this.data.title || '')}
          let _idI = null;
          this._subs.id('order').sink = this._crm.sales_invoices(_oI, "put").subscribe({
            next : (res) => { _idI = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/invoices/', _idI], extraParams:{}})},
          })
          break;

        case 'order':
          const _oP = {positions:data, company:this.data.company.id, quote: this.itemId, name: this.data.name, title: (this.data.title || '')}
          let _id = null;
          this._subs.id('order').sink = this._crm.sales_orders(_oP, "put").subscribe({
            next : (res) => { _id = res.content.results[0].id; console.log(res);},
            complete : () => { this._wr.helperService.gotoPage({pageName:['/crm/sales/orders/', _id], extraParams:{}})},
          })
          break;

        case 'project':
          //RT TODO
          break;
      }
    }

    updateDelivery(index){
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


    ngOnDestroy(): void {
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
