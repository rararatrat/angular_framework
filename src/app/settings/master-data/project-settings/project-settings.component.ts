import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';
import { CrmService } from 'src/app/crm/crm.service';

@Component({
  selector: 'eg-project-settings',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/* templateUrl: './project-settings.component.html',
styleUrls: ['./project-settings.component.scss'] */
export class ProjectSettingsComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize('settings', {item: Core.Localize('project')});
  public gridListId : any = "settings_md_project_status";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService, private _crm: CrmService){}

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.project_status(p, m, n),
      title       : Core.Localize("project_status"),
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label: Core.Localize('project_status'),
          subTitle: Core.Localize('project_status_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_project_status",
          api$ : (p2, m?: apiMethod, n?) => that._settings.project_status(p2, m, n),
        },
        {
          label: Core.Localize('project_task_type', {count: 2}),
          subTitle: Core.Localize('project_task_type_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_project_task_types",
          api$ : (p2, m?: apiMethod, n?) => that._crm.project_task_type(p2, m, n),
        },
        {
          label: Core.Localize('hourly_rate'),
          subTitle: Core.Localize('hourly_rate_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_project_hourly_rate",
          api$ : (p2, m?: apiMethod, n?) => that._settings.project_hourly_rate(p2, m, n),
        },
        {
          label: Core.Localize('document_setting', {count: 2}),
          subTitle: Core.Localize('document_setting_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_project_document",
          api$ : (p2, m?: apiMethod, n?) => that._settings.project_documents(p2, m, n),
        },
      ],
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  ngOnDestroy(): void {

  }
}
