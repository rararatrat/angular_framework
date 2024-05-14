import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../crm.service';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { Core } from '@eagna-io/core';
import { Project } from './project.static';
import { Subscription, map, of, switchMap, tap } from 'rxjs';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '@library/service/container.service';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'eg-project',
  template: `<eg-grid-list *ngIf="config" [gridListId]="'grid-project'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  @Input() data: any;

  public type   : "list" | "grid" | "stats" | "stats" = "grid";
  public config : IContainerWrapper;
  private _subs = new Subscription();
  private _statuses: any = {};

  constructor(private _crm:CrmService, 
    private _activatedRoute: ActivatedRoute, 
    private _containerService: ContainerService,
    private _settings: SettingsService
  ){}

  ngOnInit(): void {
    const pf = Project.getProjectFormProperties();
    this.config = {
      reloaded : true,
      description: Core.Localize('create_new_project_desc'),
      viewtype: this.type,
      params : {...this.param},
      skipTranslation: true,
      apiService : (p, m, n?) => {
        //RT: invoice_amount mandatory
        if(m == 'put'){
          p.append('invoice_amount', '1');
        }
        return this._crm.project_list(p, m, n).pipe(map(res => {
          if(m == 'post'){
            const _tmp = res.content?.fields?.find(_f => _f.field == 'invoice_amount');
            if(_tmp){
              _tmp.required = false;
            }

            /* ((res.content?.aggs || []).find(_agg => {
              if(Object.keys(_agg)?.[0] == 'state'){
                return true;
              }
              return false;
            })?.state || []).forEach((_eachAgg, _index) => {
              if(_eachAgg?.state__name){
                this._statuses[_index] = _eachAgg.state__name;
              }
            }); */
          }
          return res;
        }));
      },
      title : Core.Localize("project"),
      detailComponent: ProjectDetailComponent,
      formProperties: pf.formProperties,
      formStructure: pf.formStructure,
      lockedFields: pf.lockedFields,
      statusField: "state",
      defaultColumns: {columns: {state: [
        "name",
        "date_start_planned",
        "date_end_planned",
        "budget_planned",
        "date_start_actual",
        "date_end_actual",
        "budget_actual",
        "budget_type",
        "invoice_type",
        "invoice_amount",
        "company",
        "contact",
        "actions",
        "ref",
        "state"
      ]}},
      gridActionsColumnConfig: {enable: true}, //RT status and actions enablement
      withDetailRoute: true, //RT status and actions enablement
      extendedGridDefOverride:{
        amendColDefs: (colDefs, gridResponse) => {
          const _stateCol = colDefs.find(_col => _col.colId == 'state');
          if(_stateCol){
            /* console.log({_stateCol}); */
            _stateCol.valueFormatter = (params) => {
              return this._statuses?.[params.value] || '';
            }
          }

          //console.log({gridResponse});
          /* this.config.gridFields = gridResponse.fields;
          this.config.permission = gridResponse.permission; */

          return this._containerService._setGridStatusActionCols(this.config, colDefs, this._activatedRoute);
          //return colDefs;
        },
        /* onFirstDataRendered(event) {
          const _colDefs = event.api.getColumnDefs();
          event.api.setColumnDefs(this._containerService._setGridStatusActionCols(this.config, _colDefs, this._activatedRoute));
        }, */
      }
    };

    this._settings.project_status({limit: 100}).subscribe(_res => {
      _res.content.results.forEach(_s => {
        if(_s){
          this._statuses[_s.id] = _s.name;
        }
      });
    });
  }

  /* fetch_stats(){
    const stats$ = this._crm.project_list(null,"post", null, "0");
    //const stats$ = this._crm.sales_quotes(this.filters,"post", null, "0");

    this._subs.add(stats$.subscribe({
      next : (res) => {
      //const stats_data = this._wr.libraryService.renderStatsDataForCharts(res.content.results);
      // this.chartData2 = stats_data['chart'];
      // this.infoData2  = stats_data['info'];

      // if(Object.keys(this.infoData2).length !== 0){
      //   let abcx = this._wr.libraryService.renderDataForInfo(this.infoData2, "fa-solid fa-euro-sign")
      //   console.log(abcx)
      //   this.infoVisual = abcx;
      // }
     },
      complete : () => {
        // this.isLoading2 = false
        // this._subs.id_('stats$').unsubscribe();
      },
      error : (err) => {
      },
    }));
  } */

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
