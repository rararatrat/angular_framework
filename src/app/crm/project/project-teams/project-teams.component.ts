import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { Core, GridResponse, ResponseObj } from '@eagna-io/core';
import { CrmService } from '../../crm.service';
import { Project } from '../project.static';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Subscription, tap } from 'rxjs';
import { WrapperService } from '@library/service/wrapper.service';
import { Users } from 'src/app/users/users';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'eg-project-teams',
  /* templateUrl: './project-teams.component.html',
  styleUrls: ['./project-teams.component.scss'], */
  template: `<eg-grid-list #gridList *ngIf="config" [gridListId]="'grid-teams'" [data]="data"
                [type]="type"
                [showHeader]="true"
                [selectionOverride]="selectionOverride"
                (selectionChange)="onSelectionChange($event)"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectTeamsComponent implements OnInit, OnDestroy {
  @Input() param: any = {};
  @Input() data: any;
  @Input() selectionOverride = false;
  @ViewChild('gridList') gridList: GridListComponent;

  @Input('type') type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  private _subscription = new Subscription();
  private _api = (p, m, n?) => this._crm.project_team(p, m, n);
  /* private _fields: any[];
  private _permission: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean; role?: any; message?: any; }; */
  private _userFormProperties = Users.getUserFormProperties();

  constructor(private _crm: CrmService, private _profileService: ProfileService, private _wr: WrapperService){}

  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._api(p, m, n),
      title : Core.Localize("team", {count: 2}),
      noModalHeight: true,
      formProperties: Project.getTeamProperties(),
      ...(!this.selectionOverride ? {
        virtualListCols: {cols: [
          {colId: 'id', field: 'id', header: "id"},
          {colId: 'user', field: 'user', header: "name"}]} 
        } : {}),
      ...(this.selectionOverride ? {selectionCallback: (item, p) => {
        this.onSelectionChange({selected: item});
      }} : {})
    }
  }

  onSelectionChange($event: any) {
    const _userApi =  (p, m) => this._profileService.user(p, m);
    this._subscription.add(_userApi({id: $event.selected?.user?.id}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      const _user_data = res.content?.results?.[0];

      const iContainerWrapper: IContainerWrapper = {
        apiService: (p?, m?, n?) => _userApi(p, m),
        permission: res.content.permission,
        gridFields: res.content.fields,
        title: "View User",
        //params: (p.params || {}),
        noModalHeight: true,
        addCallback: (p2) => {},
        formProperties: this._userFormProperties.formProperties,
        formStructure : this._userFormProperties.formStructure
      };

      this._wr.containerService.dialogAction('view', iContainerWrapper, _user_data);
    }));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
