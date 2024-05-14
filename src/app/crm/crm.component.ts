import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuSideBarSettings, SharedService, Core, MenuItems, SideBarService, RouteObserverService} from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { CRM } from './crm.static';
import { CrmService } from './crm.service';
import { SubSink } from 'subsink2';
import { IStatsChart } from '@library/library.interface';
import { DatePipe, DecimalPipe } from '@angular/common';
@Component({
  selector: 'eg-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
  /* changeDetection: ChangeDetectionStrategy.OnPush */
})
export class CrmComponent extends RouteObserverService implements OnInit, OnDestroy{
  public items      : MenuItem[];
  public menuItems  !: MenuItem[];
  public isLoading  : boolean = false;
  public isHome     : boolean = true;
  private _subs     : SubSink = new SubSink();

  public stats      : any = null;
  public chartConfig        : any = {}
  public chart              : IStatsChart;
  public statistics         : IStatsChart[];

  constructor(private _wr: WrapperService,
              private _sidebarService: SideBarService,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _cdr: ChangeDetectorRef,
              private _crm : CrmService,
              private datePipe: DatePipe,
              private decimalPipe: DecimalPipe,

  ){
    super(_activatedRoute, _router);
    this._setIsHome();
  }

  onRouteReady(): void {

    this._setIsHome();

   }
   private _setIsHome(){

     if(this._router.url == "/crm"){
      this._initDashboard();
        //this.isLoading = false;
        this.isHome = true;

     }else{

       this.isLoading = false;
       this.isHome = false;

     }
   }
   onRouteReloaded(): void {

     this._setIsHome();
     this._initSidebar();
   }

  ngOnInit(): void {
    this._initSidebar();

  }

  private _initSidebar(){
    this._sidebarService.sidebar$.next({
      items     : CRM.getSidebarMenuItems(this),
      isVisible : true,
      mode      :"compact",
      sidebarLoaderId:"eag-crm"
    })
  }

  private _initDashboard(){
    this._subs.sink = this._crm.crm_stats().subscribe({
      next : (res) => {
        this.stats = res;

        this._setChartConfig(res, null)
      },
      error : (err) => {

      },
      complete : () => {
        this.isLoading = false
      }

    })
  }

  private _setChartConfig(chart_data, info_data){
    this.statistics = [
      {
        layout     : 'chart',
        chart_type : 'xy',
        chart_data : this._getDataForChart(chart_data['monthly'], 'invoices'),
        title      : null,
        id         : `invoices__name_${this._wr.libraryService.makeid(3)}`,
        show_label : true
    },
    {
      layout      : 'chart',
      chart_type :'xy',
      chart_data : this._getDataForChart(chart_data['monthly'], 'invoices'),
      title      : null,
      id         : `bills__name_${this._wr.libraryService.makeid(3)}`,
      show_label : true
  },
    {
      layout      : 'chart',
      chart_type :'clustered',
      chart_data : this._getDataForChart(chart_data['monthly'], 'cash'),
      title      : null,
      id         : `overview__name_${this._wr.libraryService.makeid(3)}`,
      show_label : true
    },

    ]
  }

  private _getDataForChart(main, attribute, sub?){
    let t = []
    Object.keys(main).forEach(element => {
      let da = new Date(element);
      t.push({category:this.datePipe.transform(da, 'MMM'),
              value :(sub == null) ? main[element][attribute] : main[element][attribute][sub],
              id:element})
    });

    return t
  }

  private _formatData(main, category, attribute){
    let t = []
    main.forEach(element => {
      let da = new Date(element);
      t.push({category:element[category],
              value : element[attribute],
              id:element[category]})
    });
    console.log(t)
    return t
  }


  private _manipulate_stats(){
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

        console.log(value);

      },
      complete : () => {

        this._subs.id('dash').unsubscribe();
      }
    })
  }

  override ngOnDestroy(): void {
    this._subs.unsubscribe()
  }
}
