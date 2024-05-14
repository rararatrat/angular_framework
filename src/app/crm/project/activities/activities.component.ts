import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { Core } from '@eagna-io/core';
import { CrmService } from '../../crm.service';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Project } from '../project.static';

@Component({
  selector: 'eg-activities',
  /* templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'] */
  template: `<eg-grid-list #gridList *ngIf="config" [gridListId]="'grid-activities'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  @Input() param: any = {};
  @Input() data: any;
  @ViewChild('gridList') gridList: GridListComponent;

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm: CrmService){}

  ngOnInit(): void {
    const _fActivityTaskProps = Project.getActivitiesProperties();

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.project_activities(p, m, n),
      title : Core.Localize("activity", {count: 2}),
      formProperties: _fActivityTaskProps.formProperties,
      formStructure: _fActivityTaskProps.formStructure,
      lockedFields: _fActivityTaskProps.lockedFields,
    }
  }

  ngOnDestroy(): void {}
}
