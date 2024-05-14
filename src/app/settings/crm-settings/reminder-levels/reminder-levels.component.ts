import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { Core, GridResponse, ResponseObj } from '@eagna-io/core';
import { CrmSettings } from '../crm-settings.static';
import { SettingsService } from '../../settings.service';
import { ReminderLevelsDetailComponent } from './reminder-levels-detail/reminder-levels-detail.component';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';

@Component({
  selector: 'eg-reminder-levels',
  template: `<eg-grid-list [gridListId]="'grid-reminder-levels'"
                #gridList
                [serverOrClient]="'clientSide'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReminderLevelsComponent {
  public type   : "list" | "grid" = "grid";
  public config : IContainerWrapper;
  private _subs = new Subscription();
  /* private _fp = CrmSettings.getReminderLevelsFormProperties(); */

  @ViewChild('gridList') gridList: GridListComponent;

  constructor(private _settings: SettingsService, 
    private _ws: WrapperService, 
    private _activatedRoute: ActivatedRoute){
    
      CrmSettings.reminderLevelsCount = 1;

      this.config = {
        reloaded : true,
        viewtype: this.type,
        params : {},
        apiService : (p, m, n?) => this._settings.reminder_levels(p, m, n).pipe(tap((res: ResponseObj<GridResponse>) => {
          CrmSettings.reminderLevelsCount = (((res?.content?.results || []).length) + 1);
        })),
        title : Core.Localize("reminder_level", {count: 2}),
        /* formProperties: this._fp.formProperties, */
        noModalHeight: true,
        extendedGridDefOverride: {
          amendColDefs: (colDefs, gridResult) => {
            const _toReturn = colDefs.filter(_col => !(['value'].includes(_col.field))).map(_col => {
              if(_col && _col.field == "id"){
                _col.rowDrag = true;
                _col.cellRenderer = 'agGroupCellRenderer';
              }
              return _col;
            });
            return this._ws.containerService._setGridStatusActionCols(this.config, _toReturn, this._activatedRoute)
          },
          animateRows: true,
          rowDragEntireRow: true,
          rowDragManaged: true,
          pagination: false,
          getRowId: (p) => p?.data?.id,
          onRowDragEnd: (event) => {
            if(event.api){
              const _renderedNodes = event.api.getRenderedNodes().map((node, i) => ({...node.data, level: (i+1)}));
              this._subs.add(this.config.apiService(_renderedNodes.map(node => ({id: node.id, level: node.level})), 'patch').subscribe(res=>{
                event.api.setRowData(_renderedNodes);
              }));
            }
          }

        },
        amendSubMenus: (_subMenus) => {
          return _subMenus.filter(_m => _m.id != "view");
        },
        excludedMenus: ["view"],
        gridActionsColumnConfig: {enable: true},
        withDetailRoute: true,
        addEditComponent: ReminderLevelsDetailComponent,
        modalWidth: '80vw',
        /* addCallback: (p) => {
          console.log({p});
          this.gridList?.grid?.refresh();
        } */
      }
  }
  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
