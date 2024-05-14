import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService, apiMethod, Core, ResponseObj, GridResponse} from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IContainerWrapper, IStatsChart, InfoCardConfig, InfoCardConfigArray } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/auth/auth.service';
import { CrmService } from 'src/app/crm/crm.service';
import { SubSink } from 'subsink2';
import { Contacts } from '../../contacts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eg-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent  extends RouteObserverService implements OnInit, OnDestroy {
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
  public companyId          : string = null;
  public formProperties     : any =  Contacts.getOrgFormProperties()
  private _subs             : SubSink = new SubSink();
  public address            : any = null;
  public banking            : any = null;

  public visual             : InfoCardConfig[];

  public chartData          : any = null;
  public isLoading          : boolean = true;

  public chartData2         : any = {};
  public infoData2          : any = {};
  public infoVisual         : any = {};
  public isLoading2         : boolean = true;
  public api = (p?: any, method?: apiMethod, nextUrl?) => this._crm.contactOrg(p, method, nextUrl);

  private _subscription     = new Subscription();

  public stats              : any = null;

  public chartConfig        : any = {}
  public chart              : IStatsChart;
  public statistics         : IStatsChart[];

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
    this.companyId = (this.snapshotParams['companyId'] == undefined)? dialogConfig.data.item.id : this.snapshotParams['companyId'];

  }

  onRouteReady(event, snapshot, root, params): void{}
  onRouteReloaded(event, snapshot, root, params): void{}

  ngOnInit(): void {
    this.snapshotLoaded = true
    this._initDetailsContainer(null);
    if(this.activeIndex == 0){
      //this.fetch_stats();
    }
  }

  ngAfterViewChecked(){

    if(this.detailsConfig.isLoading == false && this.detailsConfig?.data && this.address == null){
      let _d = this.detailsConfig.data.__data__;
      this.address = {
        billing_add   : _d.billing_add,
        reg_add       : _d.reg_add,
        shipping_add  : _d.shipping_add
      }
      this.banking = _d.banking;

      const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig.aggs);

      this.chartData2 = stats_data['chart'];
      this.infoData2  = stats_data['info'];


      this._setChartConfig(stats_data['chart'], stats_data['info']);

      this._wr.libraryService.setCustomBreadcrumbs(this.detailsConfig.data.name, 'route');

      /* this.detailsConfig.triggerChangeDetection(); */
    }

  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  private _initDetailsContainer(data){
    let that = this;
    const header = Core.Localize("company");


    this.config = {
      showNavbar      : true,
      hasHeader       : true,
      header          : header,
      subheader       : Core.Localize("dContainerSubHeader", {header}),
      dialogConfig    : this.dialogConfig,
      dialogRef       : this.ref,
      showDetailbar   : false,
      data            : data,
      itemId          : this.snapshotParams['companyId'],

      detailsApi$     : (param, method, nextUrl)   => {
        return this._crm.contactOrg(param, method, nextUrl)
      },
      formProperty    : {
        includedFields  : this.formProperties['includedFields'],
        formProperties  : this.formProperties['formProperties']
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
              this.config.params = {'company':this.companyId};
              this.activeIndex = 1;
            },
          },
          {
            label:Core.Localize("tasks"),
            icon: "fa-solid fa-list-check",
            subTitle: Core.Localize("tasks_desc"),
            selected: (this.activeIndex == 2) ? true : false,
            onClick : (event) => {
              this.config.params = {"project__company__id__iexact": this.companyId};
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
              this.config.params = {'contact':this.companyId};
              this.activeIndex = 5;
            },
          },
          {
            label:Core.Localize("sales_order"),
            icon: "fa-solid fa-sack-dollar",
            subTitle: Core.Localize("sales_order_desc"),
            selected: (this.activeIndex == 6) ? true : false,
            onClick : (event) => {
              this.config.params = {'company':this.companyId};
              this.activeIndex = 6;
            },
          },
          {
            label:Core.Localize("quote", {count: 2}),
            icon: "fa-solid fa-file-invoice",
            subTitle: Core.Localize("quotes_desc"),
            selected: (this.activeIndex == 7) ? true : false,
            onClick : (event) => {
              this.config.params = {'company':this.companyId};
              this.activeIndex = 7;
            },
          },
          {
            label:Core.Localize("credit_note", {count: 2}),
            icon: "fa-solid fa-file-invoice-dollar",
            subTitle: Core.Localize("credit_notes_desc"),
            selected: (this.activeIndex == 8) ? true : false,
            onClick : (event) => {
              this.config.params = {"company__id__icontains": this.companyId};
              this.activeIndex = 8;
            },
          },
        ]

      }
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
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
                          this.addBankAccount()
                        },
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
      },
      {
        layout      : 'chart',
        chart_type :'xy',
        chart_data : chart_data['order__name'],
        title      : 'Order Details' ,
        id         : `order__name_${this._wr.libraryService.makeid(3)}`,
        show_label : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        callback    : (p) => {
                          this.addBankAccount()
                        },
                        api: (rawValue: any) => {
                          return this._crm.sales_orders();
                        },
                        params      : {company : this.detailsConfig.data},
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
        chart_data  :  this.detailsConfig.data.__data__.contacts,
        title       : 'Contacts' ,
        id          : `contacts_${this._wr.libraryService.makeid(3)}`,
        show_label  : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        api: (rawValue: any) => {
                          return this._crm.contactPeople();
                        },
                        formProp    : Contacts.getContactFormProperties()['formProperties'],
                        formStruc   : Contacts.getContactFormProperties()['formStructure'],
                        params      : {company : this.detailsConfig.data},
                        icon        : "fa-solid fa-users",
                        message     : Core.Localize("no_contacts_found"),
                        topic       : "Contacts"
                      }
      }

    ]


  }

  /* fetch_stats(){
    const stats$ = this._crm.contactOrg(null,"post", null, "0");
    //const stats$ = this._crm.sales_quotes(this.filters,"post", null, "0");

    this._subs.add(stats$.subscribe({
      next : (res) => {
      const stats_data = this._wr.libraryService.renderStatsDataForCharts(res.content.results);
       this.chartData2 = stats_data['chart'];
       this.infoData2  = stats_data['info'];

       if(Object.keys(this.infoData2).length !== 0){
         let abcx = this._wr.libraryService.renderDataForInfo(this.infoData2, "fa-solid fa-euro-sign")
         console.log(abcx)
         this.infoVisual = abcx;
       }
     },
      complete : () => {
        // this.isLoading2 = false
        // this._subs.id_('stats$').unsubscribe();
      },
      error : (err) => {
      },
    }));
  } */
  public afterSaved(isChanged){

  }

  override ngOnDestroy(): void {}

  addBankAccount() {

  }
}
