import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService, apiMethod, Core } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IStatsChart, InfoCardConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/auth/auth.service';
import { CrmService } from 'src/app/crm/crm.service';
import { Contacts } from '../../contacts';
import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-people-detail',
  templateUrl: './people-detail.component.html',
  styleUrls: ['./people-detail.component.scss']
})
export class PeopleDetailComponent extends RouteObserverService implements OnInit, OnDestroy {
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 0;
  public isChanged          : boolean = true;
  public objArray           : any;
  public editingField       : string;
  /* public user               : any; */
  public passwordForm       : FormGroup;
  public emailForm          : FormGroup;
  public showText           : boolean = false;
  public msg                : string;
  public contactId          : string = null;
  public formProperties     : any =  Contacts.getContactFormProperties()
  private _subs             : SubSink = new SubSink();
  public address            : any = null;
  public banking            : any = null;
  public visual             : InfoCardConfig[];
  public chartData          : any = null;
  public isLoading          : boolean = true;
  public statistics         : IStatsChart[] = null;

  public api = (p?: any, method?: apiMethod, nextUrl?) => this._crm.contactPeople(p, method, nextUrl);

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _crm                    : CrmService,
              private _auth                   : AuthService,
              private _router                 : Router,
              private _cdr                    : ChangeDetectorRef,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig){
    super(_route, _router);
    this.contactId = (this.snapshotParams['contactId'] == undefined)? dialogConfig.data.item.id : this.snapshotParams['contactId'];
  }

  onRouteReady(event, snapshot, root, params): void{}
  onRouteReloaded(event, snapshot, root, params): void{}

  ngOnInit(): void {
    this.snapshotLoaded = true
    this._initDetailsContainer(null)
  }


  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }
  imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  typeof(val){
    return typeof(val);
  }

  private _initDetailsContainer(data){
    let that = this;
    const header = Core.Localize("contact");

    this.config = {
      showNavbar      : true,
      hasHeader       : true,
      header          : header,
      subheader       : Core.Localize("dContainerSubHeader", {header}),
      dialogConfig    : this.dialogConfig,
      dialogRef       : this.ref,
      showDetailbar   : false,
      data            : data,
      itemId          : this.snapshotParams['contactId'],
      detailsApi$     : (param, method, nextUrl)   => {
        return this._crm.contactPeople(param, method, nextUrl)
      },
      formProperty    : {
        includedFields  : this.formProperties['includedFields'],
        formProperties  : this.formProperties['formProperties'],
        formStructure   : this.formProperties['formStructure']
      },

      sidebar       : {
        header,
        items  : [
          {
            label:Core.Localize("details"),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize("company_desc"),
            selected: (this.activeIndex == 0) ? true : false,
            onClick : (event) => {
              this.config.params = {};
              this.activeIndex = 0;
            },
          },
          {
            label:Core.Localize("project"),
            icon: "fa-solid fa-diagram-project",
            subTitle: Core.Localize("project_desc"),
            selected: (this.activeIndex == 1) ? true : false,
            onClick : (event) => {
              console.log(this.detailsConfig?.data);
              this.config.params = {'company':this.detailsConfig?.data['company']};
              this.activeIndex = 1;
            },
          },
          {
            label:Core.Localize("tasks"),
            icon: "fa-solid fa-list-check",
            subTitle: Core.Localize("tasks_desc"),
            selected: (this.activeIndex == 2) ? true : false,
            onClick : (event) => {
              this.config.params = {"project__company__id__icontains": this.detailsConfig?.data['company']};
              this.activeIndex = 2;

            },
          },
          {
            label:Core.Localize("bills"),
            icon: "fa-solid fa-receipt",
            subTitle: Core.Localize("bills_desc"),
            selected: (this.activeIndex == 3) ? true : false,
            onClick : (event) => {
              this.config.params = {};
              this.activeIndex = 3;
            },
          },
          {
            label:Core.Localize("expense"),
            icon: "fa-solid fa-dollar",
            subTitle: Core.Localize("expense_desc"),
            selected: (this.activeIndex == 4) ? true : false,
            onClick : (event) => {
              this.config.params = {};
              this.activeIndex = 4;
            },
          },
          {
            label:Core.Localize("purchase_order"),
            icon: "fa-solid fa-money-check",
            subTitle: Core.Localize("purchase_order_desc"),
            selected: (this.activeIndex == 5) ? true : false,
            onClick : (event) => {
              this.config.params = {'contact':this.contactId};
              this.activeIndex = 5;
            },
          },
          {
            label:Core.Localize("sales_order"),
            icon: "fa-solid fa-sack-dollar",
            subTitle: Core.Localize("sales_order_desc"),
            selected: (this.activeIndex == 6) ? true : false,
            onClick : (event) => {
              this.config.params = {"contact__id__icontains": this.contactId};
              this.activeIndex = 6;
            },
          },
          {
            label:Core.Localize("quote", {count: 2}),
            icon: "fa-solid fa-file-invoice",
            subTitle: Core.Localize("quotes_desc"),
            selected: (this.activeIndex == 7) ? true : false,
            onClick : (event) => {
              this.config.params = {"contact__id__icontains": this.contactId};
              this.activeIndex = 7;
            },
          },
          {
            label:Core.Localize("credit_note", {count: 2}),
            icon: "fa-solid fa-file-invoice-dollar",
            subTitle: Core.Localize("credit_notes_desc"),
            selected: (this.activeIndex == 8) ? true : false,
            onClick : (event) => {
              this.config.params = {"contact__id__icontains": this.contactId};
              this.activeIndex = 8;
            },
          },
        ]

      }
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});


  }

  private _initVisuals(){
    this.visual = [
      {
        illustrationType : "icon",
        illustration : {
          icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
        },
        topic: "Pending Invoices",
        value: 10
      },
      {
        illustrationType : "icon",
        illustration : {
          icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
        },
        topic: "Projects",
        value: 10
      },
      {
        illustrationType : "icon",
        illustration : {
          icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
        },
        topic: "Total Revenue",
        value: 10
      },
      {
        illustrationType : "icon",
        illustration : {
          icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
        },
        topic: "Total Expense",
        value: 10
      }
    ]

    let aggs = this.detailsConfig.aggs;
    this.chartData = {
      job : this._wr.libraryService.reduceRender(aggs.job, "job", "count"),
      /* suffix_name : this._wr.libraryService.reduceRender(aggs.suffix_name, "suffix_name", "count") */
    }



  }

  public afterSaved(isChanged){

  }
  private _setChartConfig(chart_data, info_data){
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
                        callback    : (p) => {
                          console.log(p);
                        },
                        api: (rawValue: any) => {
                          return this._crm.sales_invoices();
                        },
                        params      : {contact : this.detailsConfig.data},
                        //formProp    : Contacts.getBankAccountFormProperties()['formProperties'],
                        //formStruc   : Contacts.getBankAccountFormProperties()['formStructure'],
                        icon        : "fa-solid fa-euro",
                        message     : "No Invoices Details Found",
                        topic       : "Invoices"
                      }
      },
      {
        layout      : 'chart',
        chart_type  :'xy',
        chart_data : chart_data['order__name'],
        title      : 'Order Details' ,
        id         : `order__name${this._wr.libraryService.makeid(3)}`,
        show_label : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        callback    : (p) => {
                          console.log(p);
                        },
                        api: (rawValue: any) => {
                          return this._crm.sales_orders();
                        },
                        params      : {contact : this.detailsConfig.data},
                        //formProp    : Contacts.getBankAccountFormProperties()['formProperties'],
                        //formStruc   : Contacts.getBankAccountFormProperties()['formStructure'],
                        icon        : "fa-solid fa-euro",
                        message     : "No Orders Found",
                        topic       : "Orders"
                      }
      },
      {
        layout      : 'content',
        chart_type  : 'content',
        chart_data  :  [this.detailsConfig.data.__data__.company],
        title       : 'company' ,
        id          : `company_${this._wr.libraryService.makeid(3)}`,
        show_label  : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        api: (rawValue: any) => {
                          return this._crm.contactOrg();
                        },
                        formProp    : Contacts.getOrgFormProperties()['formProperties'],
                        formStruc   : Contacts.getOrgFormProperties()['formStructure'],
                        params      : {company : this.detailsConfig.data},
                        icon        : "fa-solid fa-users",
                        message     : "No Company Found",
                        topic       : "Company"
                      }
      },
    ];
  }

  ngAfterViewChecked(){

    if(this.detailsConfig.isLoading == false && this.detailsConfig?.data && this.address == null){
      const _d = this.detailsConfig.data.__data__;
      this.address = {
        address: _d.address,
      }
      /* this.banking = _d.banking; */

      const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig.aggs);
      this._setChartConfig(stats_data['chart'], stats_data['info']);

      this._wr.libraryService.setCustomBreadcrumbs(this.detailsConfig.data.name, 'route');

      this.detailsConfig.triggerChangeDetection();
    }

  }

  override ngOnDestroy(): void {}

}
