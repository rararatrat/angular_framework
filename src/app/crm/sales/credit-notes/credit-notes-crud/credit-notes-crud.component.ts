import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObserverService, MenuItems, apiMethod, Core, ConfirmDialogResult, MESSAGE_SEVERITY, SharedService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IEmailRendererData, IPositionPreviewData, IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { CreditNotes } from '../credit-notes';
import { EmailRendererComponent } from '@library/container-collection/email-renderer/email-renderer.component';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-credit-notes-crud',
  templateUrl: './credit-notes-crud.component.html',
  styleUrls: ['./credit-notes-crud.component.scss']
})

export class CreditNotesCrudComponent extends RouteObserverService implements OnInit {

  @ViewChild('egItem') egItem : any;


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
  public form               = CreditNotes.getFormProperties();
  public mode               : "edit" | "add" | "view" = "add";
  private _title            : any = Core.Localize("CreditNotes");

  public cache_positions    : any = [];
  public sel_positions      : any = [];
  public excluded_postion   : any = [1,2,3,4,5];

  private _isDisabled       : boolean = false;
  private _subs             : SubSink = new SubSink();

  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;

  public api                : any = (p?: any, method?: apiMethod, nextUrl?) => this._crm.sales_credit_notes(p, method, nextUrl);
  public itemId             : any;
  private _ref: DynamicDialogRef;
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
                this.itemId = (this.snapshotParams?.['id'] == undefined)? dialogConfig.data.item?.id : this.snapshotParams['id'];
                this._isDisabled = (this.mode == "add") ? true : false;
                this._sharedService.globalVars.gridListChanged = false;
              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      this._initDetailsContainer();
      //TODO related docs
      if(!this.relatedDocs){
        this.relatedDocs = [];
      }
    }

    private _initDetailsContainer(itemId?){
      let that = this;
      const header = this._title;
      this.data = this.dialogConfig?.data?.item;
      this.permission = this.dialogConfig?.data?.permission;

      let item = (this.snapshotParams?.['id'] == undefined) ? this.dialogConfig.data?.item?.id : this.snapshotParams?.['id'];

      // this.mode = "edit";
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
          mode            : this.mode,
        },
        sidebar : {
          header,
          items : [
            {
              label: Core.Localize('general'),
              icon: "fa-solid fa-file-contract",
              subTitle: Core.Localize('basicInfoOfTheItem', {item: Core.Localize('credit_note')}),
              selected: (this.activeIndex == 0) ? true : false,
            },
            {
              label: Core.Localize('item', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-boxes-packing",
              subTitle: Core.Localize('checkAllTheItems', {item: Core.Localize('credit_note')}),
              selected: (this.activeIndex == 1) ? true : false,
            },
            {
              label: Core.Localize('text', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-envelope",
              subTitle: Core.Localize('customize_email'),
              selected: (this.activeIndex == 2) ? true : false,
            },
            {
              label: Core.Localize('setting', {count: 2}),
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-gear",
              subTitle: Core.Localize('dContainerSubHeader', {header: Core.Localize('credit_note')}),
              selected: (this.activeIndex == 3) ? true : false,
            },
            /* {
              label:"Flow",
              isDisabled : that._isDisabled,
              icon: "fa-solid fa-microchip",
              subTitle: "Related Records",
              selected: (this.activeIndex == 4) ? true : false,
            }, */
          ]
        },
        hasComments: true,
        commentsApi$  : (param, method, nextUrl)   => {
          return this._crm.project_comments(param, method, nextUrl)
        },
        hasLogs:false,
        hasUpdates:false,
        actionItems : [
          {
            label: Core.Localize('setStatusTo', {status: ''}),
            icon: "fa-solid fa-list-check",
            styleClass : "text-lg",
            command : (event) => {
              const _status = (this.data?.status?.value == "draft")?'pending':'draft';
              this._setActionItems(_status, this.data);
              this._update({id: this.itemId, status:_status});
            },
          },
          {
            label: Core.Localize('create', {item: Core.Localize('order')}),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IEmailRendererData>>{
                id: Math.random(),
                data: {
                    template_type: 'creditnotes',
                    fields: this.detailsConfig.fields,
                    emailApi: (rawValue: any) => {
                      //TODO sales credit notes email
                      return this._crm.sales_quotes_email({...rawValue, id: item, template: 1, language: "EN" }, 'put');
                    }
                },
                header: Core.Localize('email_template'),
                showHeader: true,
                maximizable: true,
                width: '85vw',
                height: '90vh',
              };

              this._ref = this._dialogService.open(EmailRendererComponent, _dialogConf);
              this.subscription.add(this._ref?.onClose.subscribe(result => {
                if ((<ConfirmDialogResult>result)?.isConfirmed) {
                    this._messageService.add({
                      severity: MESSAGE_SEVERITY.SUCCESS,
                      summary: Core.Localize('emailSuccessfullySent')});
                }
              }));
            },
          },
          {
            label: Core.Localize('print', {item: Core.Localize('credit_note')}),
            icon: "fa-solid fa-print",
            styleClass : "text-lg",
            items : [
              {
                label: Core.Localize('print', {item: `${Core.Localize('credit_note')} ${Core.Localize('with_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {},
              },
              {
                label: Core.Localize('print', {item: `${Core.Localize('credit_note')} ${Core.Localize('without_letterhead')}`}),
                icon: "fa-solid fa-envelope",
                styleClass : "text-lg",
                command : (event) => {

                },
              }
            ]
          },
          {
            label: Core.Localize('duplicate_item', {item: Core.Localize('credit_note')}),
            icon: "fa-solid fa-copy",
            styleClass : "text-lg",
            command : (event) => {

            },
          },
          {
            label: Core.Localize('preview'),
            icon: "fa-solid fa-envelope",
            styleClass : "text-lg",
            command : (event) => {
              const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
                data: {
                  item: this.detailsConfig?.data,
                  template_type: 'creditnotes'
                },
                header: Core.Localize('credit_note'),
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
                  template_type: 'creditnotes'
                },
                header: Core.Localize('credit_note'),
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
          if(data.positions != null || data.positions.length > 0){
            data.positions.forEach(e => this.cache_positions.push(Object.assign({}, e)))
          }

          if(data){
            if(data.mwst_type < 1){
              data.mwst_type = 1;
              this.detailsConfig?.formGroup?.get('mwst_type')?.setValue(data.mwst_type, {emitEvent: false});
            }
          }

          this.data       = data;
          this.permission = perm;

          this._setActionItems(this.data?.status, this.data);
          this.isLoading = false;
          this.detailsConfig?.triggerChangeDetection();
        },
      }
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
    }


  updateCreditNotes(index){
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
    this._subs.id('patch_credit-notes').sink = this.api(param, "patch").subscribe(
      {
        next :(res:any) => {
          this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
          this.isChanged = true;
          this.data = {...this.data, isChanged: this.isChanged};
          this.permission = res.content.permission;
          this._sharedService.globalVars.gridListChanged = this.isChanged;
        },
        complete : () => {
          this._subs.id("patch_credit-notes").unsubscribe();
        }
      })
  }

  updatePosition(event){
      const param = {"positions":event.data, "id": this.config.itemId};
      this._subs.id('patch_credit-notes_position').sink = this.api(param, 'patch').subscribe(
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
              this._subs.id("patch_credit-notes_position").unsubscribe();
            });
          }
        })
  }

  private _setActionItems(status, data){

    const _status = (typeof status == "object")? status.value.toLowerCase() : status ;
    switch(_status){
      case "draft":
        //set Credit Note
        this.config.actionItems[0].label   = 'Set Status to Pending'
        this.config.actionItems[0].icon     = 'fa-solid fa-triangle-exclamation'

        break;
      case "pending":

        //set Credit Note
        this.config.actionItems[0].label   = 'Set Status to Draft'
        this.config.actionItems[0].icon     = 'fa-solid fa-pencil'

        break;
      case "settled":
        //set Credit Note
        this.config.actionItems[0].visible   = false



        break;
    }
  }

  private _update(param){
    this.isLoading = true;
    this._subs.id('update').sink = this.api(param, 'patch').subscribe({
      next : (res) => {
        this.data = res.content.results[0];
        this.permission = res.content.permission;
        this._cdr.detectChanges();

      },
      complete : () => {
        this.isLoading = false;
        this.detailsConfig.triggerChangeDetection();
        this.egItem.data = this.data;
        this.egItem.permission = this.permission;
        this._subs.id('update').unsubscribe();
      }
    });

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
    if(this.detailsConfig.isLoading == false && this.isLoading == false && this.detailsConfig?.data && !this._hasChecked){
      const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig.aggs);
      this._setChartConfig(stats_data['chart'], stats_data['info']);
      this._hasChecked = true
    }
  }

  override ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._subs.unsubscribe();
    this.snapshotLoaded = false;
  }
}
