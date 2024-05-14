import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObserverService, MenuItems, apiMethod, Core, CustomDialogConfig, ConfirmDialogResult, MESSAGE_SEVERITY, ResponseObj, GridResponse, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { Subscription, map } from 'rxjs';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { PurchaseOrder } from '../purchase-order';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-purchase-order-crud',
  templateUrl: './purchase-order-crud.component.html',
  styleUrls: ['./purchase-order-crud.component.scss']
})
export class PurchaseOrderCrudComponent extends RouteObserverService implements OnInit, OnDestroy {
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
  public form               = PurchaseOrder.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("purchase_order");

  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();
  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;


  public api = (p?: any, method?: apiMethod, nextUrl?) => this._crm.purchase_orders(p, method, nextUrl);
  itemId: any;

  private _ref: DynamicDialogRef;
  private _subscription = new Subscription();
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
      this._initDetailsContainer();

      //TODO related Docs
      if(!this.relatedDocs){
        this.relatedDocs = [];
      }
    }

    private _initDetailsContainer(itemId?){
      let that = this;
      const header = this._title;
      this.data = this.dialogConfig?.data?.item;
      this.permission = this.dialogConfig?.data?.permission;
      //const _itemId = (this.data != undefined && this.data.hasOwnProperty('id')) ? this.data['id'] : null;
      //let item = (itemId != null) ? itemId : _itemId;

      let item = (this.snapshotParams?.['id'] == undefined) ? this.dialogConfig.data?.item?.id : this.snapshotParams?.['id'];

      // this.mode = "edit";
      this._isDisabled = false
      const showBars = true;

      /* uncomment the below */
      //const showBars = (this.mode == "add") ? false : true;

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
        itemId            :  this.itemId,
        params            : {id:this.config?.itemId},
        detailsApi$       : (param, method, nextUrl)   => {
          return this.api(param, method, nextUrl);
        },
        formProperty    : {
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
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('purchase_order')}),
              selected: (this.activeIndex == 0),
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('purchase_order')}),
              selected: (this.activeIndex == 1),
              onClick : (event) => {
                this.activeIndex = 1;
              },
            },
            {
              label: Core.Localize('condition', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('conditionOfThisItem', {item: Core.Localize('purchase_order')}),
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
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('purchase_order')}),
              selected: (this.activeIndex == 5),
            },
            {
              label: Core.Localize('flow'),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-microchip",
              subTitle: Core.Localize('related_records'),
              selected: (this.activeIndex == 6)
            },
          ]

        },
        hasComments: true,
        hasLogs:false,
        hasUpdates:false,
        actionItems : [
          {
            label: Core.Localize('setStatusTo', {status: ''}),
            icon: "fa-solid fa-list-check",
            styleClass : "text-lg",
            command : (event) => {

            },
          },
          {
            label: Core.Localize('email_item', {item: Core.Localize('purchase_order')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'purchaseorders',
                    fields: this.detailsConfig.fields,
                    emailApi: (rawValue: any) => {
                      return this._crm.sales_quotes_email({...rawValue, id: item, template: rawValue?.template?.id, language: "EN" }, 'put');
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
            label: Core.Localize('print', {item: Core.Localize('purchase_order')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('purchase_order')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('purchase_order')} ${Core.Localize('without_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('purchase_order')}),
            icon: "fa-solid fa-envelope",
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
                  template_type: 'purchaseorders'
                },
                header: Core.Localize('purchase_order'),
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
                  template_type: 'purchaseorders'
                },
                header: Core.Localize('purchase_order'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                styleClass: 'bg-primary-faded'
              };
              this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
            },
          },
        ],
        onApiComplete: (param, data) => {
          /* this.data= data; */

          if(this.detailsConfig.formGroup?.get('mwst_type')?.value < 1){
            this.detailsConfig.formGroup?.get('mwst_type').setValue(1, {emitEvent: false});
          }
        },
      }
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
      this.isLoading = false;
    }

    createQuote(){
      /* [disabled]="detailsConfig.formGroup.invalid" */

      let form = this.detailsConfig?.formGroup.getRawValue();
      let formStr = this.form["formStructure"][0]["fields"];
      let param = {};

      formStr.forEach(key => {
        if(typeof(form[key]) == "object"){
          param[key] = form[key]['id']
        }else {
          param[key] = form[key];
        }
      });

        this._subs.id('new_quote').sink = this.api(param, "put").subscribe(
          {
            next :(res:any) => {
              this.mode = "edit";
              this._isDisabled = false;
              this.activeIndex = 3;
              this._initDetailsContainer(res.content.results[0]['id']);
              this.config.detailBarExpanded = true;
              this.config.navbarExpanded    = true;
            },
            complete : () => {
              this._subs.id("new_quote").unsubscribe();
            }
          })
    }

    updatePO(index){
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
              this.permission = res.content.permission;
              this._sharedService.globalVars.gridListChanged = this.isChanged;
            },
            complete : () => {
              this._subs.id("patch_quote_position").unsubscribe();
            }
          })


    }

    afterSaved(isChanged){
      this.isChanged = isChanged;
      this.data = {...this.data, isChanged: this.isChanged};
      this._sharedService.globalVars.gridListChanged = this.isChanged;
    }

    override ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.snapshotLoaded = false;
      this._subs.unsubscribe();
    }

    onSave() {
      const _formRawValue = this.detailsConfig?.formGroup?.getRawValue();
      const _formValue = {
        id: _formRawValue.id,
        show_position_taxes:  _formRawValue.show_position_taxes,
        show_total: _formRawValue.show_total,
        bank_account: _formRawValue.bank_account?.account.id,
        mwst_is_net:  _formRawValue.mwst_is_net,
        /* mwst_type:  _formRawValue.mwst_type, */
        currency: _formRawValue.currency?.id,
      }

      this.subscription.add(this.api(_formValue, 'patch').subscribe(res => {
        this.isChanged = true;
        this.data = {...this.data, isChanged: this.isChanged};
        this.permission = res.content.permission;
        this._sharedService.globalVars.gridListChanged = this.isChanged;
      }));
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
}
