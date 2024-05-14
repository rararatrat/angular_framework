import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { Core } from '@eagna-io/core';
import { CrmService } from '../../crm.service';
import { ConditionsDetailComponent } from './conditions-detail/conditions-detail.component';
import { Project } from '../project.static';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';

@Component({
  selector: 'eg-conditions',
  /* templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'] */
  template: `<eg-grid-list #gridList *ngIf="config" [gridListId]="'grid-conditions'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionsComponent implements OnInit, OnDestroy {
  @Input() param: any = {};
  @Input() data: any;
  @ViewChild('gridList') gridList: GridListComponent;

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm: CrmService){}

  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.project_condition(p, m, n),
      title : Core.Localize("conditions"),
      detailComponent: ConditionsDetailComponent,
      formProperties: Project.getTeamProperties()
    }
  }

  ngOnDestroy(): void {}
}
