
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-general-priority',
  template: `<eg-grid-list [gridListId]="'settings_md_general_priority_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralPriorityComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService){

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._settings.process_priority(p, m, n),
      title : Core.Localize("general_priority"),
      noModalHeight: true,
      withDetailRoute: false,
      /* formProperties: {eg_content_type: {autoConfig: {description: 'description'}}} */
      formProperties:{
        eg_content_type :{ autoConfig:{title:'description', description:'name', saveField:'id'}}
      }
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
