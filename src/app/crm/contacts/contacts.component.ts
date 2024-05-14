import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService } from '@eagna-io/core';
import { CrmService } from '../crm.service';
import { IStatsChart } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent extends RouteObserverService implements OnInit, OnDestroy {

  constructor(private _crm  : CrmService,
              private _wr   : WrapperService,
              private _cdr  : ChangeDetectorRef,
              public _router: Router,
              public _route : ActivatedRoute,)
  {
    super(_route, _router);
  }
  public data               : any;
  public statistics         : IStatsChart[];
  private _hasChecked       : Boolean = false;
  public isHome             : boolean = true;
  public isLoading          : boolean = true;
  private _subs             : SubSink = new SubSink();

  onRouteReady(): void {
    this._setIsHome();
  }

  onRouteReloaded(): void {
    this._setIsHome();
  }

  private _setIsHome(){
    if(this._router.url == "/crm/contacts"){
      this.isHome = true;
      this._initDashboard();
    }else{
      this.isLoading = false;
      this.isHome = false;
      this._cdr.detectChanges();
    }

  }

  private _initDashboard(){
    const _filters = {
      "project" :{
        "field":"status",
        "sub_field":"name",
        "filter":null
      },
      "quotes" :{
        "field":"status",
        "sub_field":"name",
        "filter":null
      },
      "order" :{
        "field":"status",
        "sub_field":"name",
        "filter":null
      },
      "invoices" :{
        "field":"status",
        "sub_field":"name",
        "filter":null
      },
      "reg_add" :{
        "field":"country"
      }
    }
    this._subs.id('dash').sink = this._crm.contactOrg(_filters, "post", null, "0").subscribe({
      next : (value) => {
        this.data = value.content;
      },
      complete : () => {
        const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.data.aggs);
        this._setChartConfig(stats_data['chart'], stats_data['info']);
        this._subs.id('dash').unsubscribe();
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    })
  }

  private _setChartConfig(chart_data, info_data){
    /* Just an Example needs to change on when configuring */
    this.statistics = [
      {
        layout     : 'chart',
        chart_type :'xy',
        chart_data : chart_data['invoices__name'],
        title      : 'Invoices Details' ,
        id         : `invoices__name_${this._wr.libraryService.makeid(3)}`,
        show_label : false,
        no_data    : {
                        action      : 'Add',
                        hasCallback : true,
                        callback    : (p) => {},
                        api: (rawValue: any) => {
                          return this._crm.sales_invoices(rawValue);
                        },
                        //formProp    : Contacts.getBankAccountFormProperties()['formProperties'],
                        //formStruc   : Contacts.getBankAccountFormProperties()['formStructure'],
                        icon        : "fa-solid fa-euro",
                        message     : "No Invoices Details Found",
                        topic       : "Invoices"
                      }
      }
    ]
  }

  ngOnInit(): void {
    this._setIsHome();
  }

  override ngOnDestroy(): void {

  }

}
