import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Project } from '../project.static';

@Component({
  selector: 'eg-time-tracking',
  /* templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss'], */
  template: `<eg-grid-list  #gridList [gridListId]="'grid-time-tracking'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  @Input() project: number;
  @Input() data: any;
  @ViewChild('gridList') gridList: GridListComponent;

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    const _fp = Project.getTimeTrackingProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      apiService : (p, m, n?) => this._crm.project_time_tracking(p, m, n),
      params: {project: this.project},
      title : Core.Localize("time_tracking"),
      noModalHeight: true,
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure
    }
  }

  ngOnDestroy(): void {}
}
