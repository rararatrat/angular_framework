import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObserverService, MenuItems, apiMethod, Core, ConfirmDialogResult, MESSAGE_SEVERITY, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { Invoices } from '../invoices';
import { Subscription, forkJoin } from 'rxjs';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-invoices-crud',
  templateUrl: './invoices-crud.component.html',
  styleUrls: ['./invoices-crud.component.scss']
})
export class InvoicesCrudComponent extends RouteObserverService implements OnInit, OnDestroy {
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
  public form               = Invoices.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("invoices");

  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();

  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;

  public dialogVisible      : boolean = false;
  public stateOptions       : any[] = [ {label: 'Select Positions', value: 'positions'},
                                        {label: 'Fixed Amount', value: 'fixed'}];
  public stateValue         : string = 'fixed';

  public cache_positions    : any = [];
  public credit_position    : any = [];

  public sel_positions      : any = [];
  public excluded_postion   : any = [1,2,3,4,5];
  public sel_type           : "credit_notes"  | "project" = "credit_notes";


  public api                : any =  (p?: any, method?: apiMethod, nextUrl?) => this._crm.sales_invoices(p, method, nextUrl);
  public itemId             : any;
  public workflow_items     : MenuItem[] = [];
  private _invoice          : any = Invoices;

  private _subscription     : Subscription = new Subscription();
  private _ref              : DynamicDialogRef;
  relatedDocs: any[];

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _crm                    : CrmService,
              private _cdr                    : ChangeDetectorRef,
              private _dialogService          : DialogService,
              private _messageService         : MessageService,
              private _sharedService          : SharedService,
              private _titleCase              : TitleCasePipe,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig
            ) {

                super(_route, _router);
                this._title = (this.dialogConfig == null )? this._title : this.dialogConfig.header
                this.mode = (this.dialogConfig == null )? "edit" : this.dialogConfig.data.mode;
                this._isDisabled = (this.mode == "add") ? true : false;
                this.itemId = (this.snapshotParams?.['id'] == undefined)? dialogConfig.data.item?.id : this.snapshotParams['id'];
                this._sharedService.globalVars.gridListChanged = false;
              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      this._initDetailsContainer();
    }

    private _setWorkflowItems(){

      this.workflow_items = [{
        label: Core.Localize('issue_invoice'),
        icon: "fa-solid fa-check ",
        visible: true,
        styleClass : "text-success font-bolder",
        command: (event) => {
          let _status = "pending";
          const _s = this.data.status;
          const _stat = (typeof _s == "object")? _s.value.toLowerCase() : "pending" ;
          switch(_stat){
            case "cancelled":
              _status = "draft";
              break;
            case "pending":
              _status = "paid"
              break;
            default:
              _status = "pending";
              break;
          }
          this._setActionItems(_status, this.data);
          this._update({id: this.itemId, status:_status});
        },
      }]

    }

    private _initDetailsContainer(itemId?){
      let that        = this;
      const header    = this._title;
      this.data       = this.dialogConfig?.data?.item;
      this.permission = this.dialogConfig?.data?.permission;

      let item = (this.snapshotParams?.['id'] == undefined) ? this.dialogConfig.data?.item?.id : this.snapshotParams?.['id'];

      //this.mode = "edit";
      this._isDisabled = false
      const showBars = true;

      this.config = {
        showNavbar        : showBars,
        showDetailbar     : this.mode != 'add',
        detailBarExpanded : true,
        navbarExpanded    : false,
        hasHeader         : true,
        header            : header,
        subheader         : Core.Localize("CrudContainerSubHeader", {header}),
        dialogConfig    : this.dialogConfig,
        dialogRef       : this.ref,
        itemId          : item,
        params          : {id:this.config?.itemId},
        detailsApi$     : (param, method, nextUrl)   => {
          return this.api(param, method, nextUrl);
        },
        formProperty : {
          includedFields  : this.form['includedFields'],
          formProperties  : this.form['formProperties'],
          formStructure   : this.form['formStructure'],
          mode            : this.mode,
        },
        sidebar : {
          header,
          items : [
            {
              label: Core.Localize('general'),
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('invoice')}),
              selected: (this.activeIndex == 0) ? true : false,
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('invoice')}),
              selected: (this.activeIndex == 1) ? true : false,
              onClick : (event) => {
                this.activeIndex = 1;
              },
            },
            {
              label: Core.Localize('condition', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('conditionOfThisItem', {item: Core.Localize('invoice')}),
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
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('invoice')}),
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
        hasComments: true,
        commentsApi$  : (param, method, nextUrl)   => {
          return this._crm.project_comments(param, method, nextUrl)
        },
        hasLogs:false,
        hasUpdates:false,
        workflowItems : this.workflow_items,
        actionItems : [

          {
            label: Core.Localize('edit', {item: Core.Localize('invoice')}),
            icon: "fa-solid fa-file-invoice-dollar ",
            visible: false,
            styleClass : "font-medium",
            command: (event) => {
              const _status = "draft";
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            },
          },
          {
            label: Core.Localize('create', {item: Core.Localize('credit_note')}),
            icon: "fa-solid fa-money-bill-wave",
            visible: false,
            styleClass : "text-success font-bolder",
            command: (event) => {
              this.dialogVisible = true;
              this.sel_type = "credit_notes";
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
              /* if(this.data.project != null){
                const _dialogConf = <DynamicDialogConfig<{api: (p, m) => Observable<any>, item: any}>>{
                  data: {
                    item: this.data.__data__.project
                  },
                  header: Core.Localize('invoice'),
                  showHeader: true,
                  maximizable: true,
                  width: '85vw',
                  position:"top",
                  transitionOptions:"0s",
                };
                this._dialogService.open(ProjectComponent, _dialogConf)
              } */
            },
          },
          {
            label: Core.Localize('email_item', {item: Core.Localize('invoice')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'invoices',
                    fields: this.detailsConfig.fields,
                    emailApi: (rawValue: any) => {
                      //TODO sales invoce email
                      return this._crm.sales_quotes_email({...rawValue, id: item, template: 1, language: "EN" }, 'put');
                    }
                },
                header: Core.Localize('email_item', {item: Core.Localize('invoice')}),
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
            label: Core.Localize('print', {item: Core.Localize('invoice')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('invoice')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('invoice')} ${Core.Localize('without_letterhead')}`}),
                icon: "fa-solid fa-print",
                styleClass : "text-lg",
                command : (event) => {

                },
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('invoice')}),
            icon: "fa-solid fa-copy",
            styleClass : "text-lg",
            command : (event) => {

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
                  template_type: 'invoices'
                },
                header: Core.Localize('invoice'),
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
                  template_type: 'invoices'
                },
                header: Core.Localize('invoice'),
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
          let _toInsert: MenuItem[] = [];
          if(data.positions != null || data.positions.length > 0){
            data.positions.forEach(e => this.cache_positions.push(Object.assign({}, e)))
          }
          this.credit_position = [this._invoice.BLANK_POSITION];

          if(data && data.mwst_type < 1){
            data.mwst_type = 1;
            this.detailsConfig?.formGroup?.get('mwst_type')?.setValue(data.mwst_type, {emitEvent: false});
          }

          this.data = data;
          this.permission = perm;
          this._setWorkflowItems()

          this._setActionItems(this.data?.status, this.data);
          this.isLoading = false;
          this.detailsConfig?.triggerChangeDetection();

          console.log({data});

          const _fork$ = {
            orders: this._crm.sales_orders({id: data?.order, limit: 1000}, "post"),
            quotes: this._crm.sales_quotes({id: data?.quote}, "post"),
          }
          
          this._subs.sink = forkJoin(_fork$).subscribe({
            next : ({orders, quotes}) => {
              if(!this._wr.libraryService.checkGridEmptyFirstResult(orders)){
                this.relatedDocs = (orders?.content?.results || []).map(_o => ({..._o, type: 'orders'}));
              }

              if(!this._wr.libraryService.checkGridEmptyFirstResult(quotes)){
                this.relatedDocs = [...(this.relatedDocs || []), ...quotes?.content?.results].map(_o => ({..._o, type: 'quotes'}));
              }
              
              if(!this.relatedDocs){
                this.relatedDocs = [];
              }
            }
          });
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
          this.detailsConfig.triggerChangeDetection();
          this._subs.id('update').unsubscribe();
        }
      });
    }

    private _setActionItems(status, data){
      const _status = (typeof status == "object")? status.value.toLowerCase() : status ;
      switch(_status){
        case "draft":

          //Issue Invoice
          this.workflow_items[0].label      = "Issue Invoice";
          this.workflow_items[0].icon       = "fa-solid fa-check";
          this.workflow_items[0].styleClass = "text-success font-bold bg-success-faded";
          this.config.workflowItems = [this.workflow_items[0]];

          //Edit Invoice
          this.config.actionItems[0].visible = false;
          //Create Credit note
          this.config.actionItems[1].visible = false;
          //create project
          this.config.actionItems[2].visible = false;
          this.config.actionItems[3].disabled = true;

          break;
        case "pending":
          //Issue / cancel Invoice
          this.workflow_items[0].label      = "Invoice is Paid";
          this.workflow_items[0].icon       = "fa-solid fa-check-double";
          this.workflow_items[0].styleClass = "text-success font-bold bg-success-faded";
          this.workflow_items[1] = {
            label:"Cancel Invoice",
            icon: "fa-solid fa-times ",
            visible: true,
            styleClass : "text-danger font-bolder bg-danger-faded",
            command: (event) => {
              let _status = "cancelled";
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            }
          }
          this.config.workflowItems = this.workflow_items;

          //Edit Invoice
          this.config.actionItems[0].visible = true;
          //Create Credit note
          this.config.actionItems[1].visible = true;
          //create project
          this.config.actionItems[2].visible = true;
          this.config.actionItems[3].disabled = false;
          break;
        case "paid":
          this.config.workflowItems = [];
          //Edit Invoice
          this.config.actionItems[0].visible = false;
          //Create Credit note
          this.config.actionItems[1].visible = false;
          //create project
          this.config.actionItems[2].visible = true;
          this.config.actionItems[3].disabled = false;

          break;
        case "cancelled":
          //Issue Invoice
          this.workflow_items[0].label      = "Undo Cancel Invoice";
          this.workflow_items[0].icon       = "fa-solid fa-times";
          this.workflow_items[0].styleClass = "text-primary font-bold bg-primary-faded";
          this.config.workflowItems = [this.workflow_items[0]];
          //Edit Invoice
          this.config.actionItems[0].visible = false;
          //Create Credit note
          this.config.actionItems[1].visible = false;
          //create project
          this.config.actionItems[2].visible = true;
          this.config.actionItems[3].disabled = false;
          break;
      }

      this.config.actionItems[2].label   = hasProject(data?.project);

      function hasProject(data){
        if(data != null){
          return `Open ${data.name}`;
        }else{
          return `Create New Project`;
        }
      }
    }

    processInvoice(data?){
      switch(this.sel_type){
        case 'credit_notes':
          const _oI = { positions   : data,
                        company     : this.data.company.id,
                        name        : this.data.name,
                        invoice_id  : this.itemId,
                        _req_type   : this.stateValue
                      }

          let _idI = null;
          this._subs.id('order').sink = this._crm.sales_credit_notes(_oI, "put").subscribe({
            next : (res) => { _idI = res.content.results[0].id; console.log(res);},
            complete : () => {
                this._subs.id('order').unsubscribe();
                this._wr.helperService.gotoPage({pageName:['/crm/sales/credit_notes/', _idI], extraParams:{}});
              },
          })
          break;

        case 'project':
          break;
      }
      console.log(data, this.data.positions);
    }

    updateInvoice(index){
      let form = this.detailsConfig?.formGroup.getRawValue();
      let formStr = this.form["formStructure"][index]["fields"];
      let temp = {};
      formStr.forEach(key => {
        if(form[key]){
          if(typeof(form[key]) == "object" && form[key]['id']){
            temp[key] = form[key]['id']
          }else {
            temp[key] = form[key];
          }
        }
      });

      let param = {id:this.config.itemId, ...temp};
      this._subs.id('patch_invoice').sink = this.api(param, "patch").subscribe(
        {
          next :(res:any) => {
            this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
            this.isChanged = true;
            this.permission = res.content.permission;
            this.data = {...this.data, isChanged: this.isChanged};
            this.permission = res.content.permission;
            this._sharedService.globalVars.gridListChanged = this.isChanged;
          },
          complete : () => {
            this._subs.id("patch_invoice").unsubscribe();
          }
        })
    }

    updatePosition(event){
        const param = {"positions":event.data, "id": this.config.itemId};
        this._subs.id('patch_invoice_position').sink = this.api(param, 'patch').subscribe(
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
                this._subs.id("patch_invoice_position").unsubscribe();
              });
            }
          })


    }

    isCredNotvalid(){
      return this.credit_position[0]['unit_price'] == null || this.detailsConfig?.formGroup.get('tax').value == ''
    }

    createCreditNote(event){
      event[0]['quantity'] = 1;
      let _id = null;
      const param = { "positions" : event,
                      "invoice_id": this.config.itemId,
                      "currency"  : this.data.currency.id,
                      "mwst_type" : this.data.mwst_type,
                      "company"   : this.data.company.id,
                      "ref"       : this.data.ref,
                      "name"      : this.data.name,
                      "title"     : this.data.title,
                      "contact"   : (this.data.contact != null)?this.data.contact.id:null,
                      "user"      : (this.data.user != null)?this.data.user.id:null,
                      "project"   : (this.data.project != null)?this.data.project.id:null,
                      "language"  : (this.data.language != null)?this.data.language.id:null,
                      "tax"       : this.detailsConfig?.formGroup.get('tax').value['id'],
                      "_req_type" : this.stateValue,
                    };

      this._subs.id('credit_note').sink = this._crm.sales_credit_notes(param, 'put').subscribe(
        {
          next :(res:any) => {
            this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
            this.isChanged = true;
            _id = res.content.results[0].id
          },
          complete : () => {
            setTimeout(()=>{
              this._subs.id("credit_note").unsubscribe();
              this._wr.helperService.gotoPage({pageName:['/crm/sales/credit_notes/', _id], extraParams: (this.data?.isChanged ? {queryParams: {onRefresh: true}} : {})});
            });
          }
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
      this._setChartConfig(stats_data['chart'], stats_data['info']);
      this._hasChecked = true
    }
  }

  override ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._subs?.unsubscribe();
    this.snapshotLoaded = false;
  }
}
