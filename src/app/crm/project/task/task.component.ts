import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { Core } from '@eagna-io/core';
import { Project } from '../project.static';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';

@Component({
  selector: 'eg-task',
  /* templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'] */
  template: `<eg-grid-list #gridList *ngIf="config" [gridListId]="'grid-task'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskComponent implements OnInit, OnDestroy {
  @Input() data: any;
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  @Input('param') param: any = {}; //projectId
  @Output('paramChange') paramChange : any = new EventEmitter();

  @Input() project: number; //projectId
  @Input() showHeader = true;
  @Input() taskType: string;
  @Input() noDetailRoute = false;
  @Input() initValue: any;

  @ViewChild('gridList') gridList: GridListComponent;

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    const _fProps = Project.getTaskFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.project_tasks(p, m, n),
      title : Core.Localize("task"),
      detailComponent: TaskDetailComponent,
      formProperties: _fProps.formProperties,
      formStructure: _fProps.formStructure,
      lockedFields: _fProps.lockedFields,
      statusField: 'status',
      initValue: this.initValue
    }
  }
  ngOnDestroy(): void {}
}
