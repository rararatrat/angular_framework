
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { Core } from '@eagna-io/core';
import { AppStatic } from 'src/app/app.static';

@Component({
  selector: 'eg-eg-content-type',
  template: `<eg-grid-list [gridListId]="'settings_md_general_priority_grid'"
    [type]="type"
    [showHeader]="true"
    [(config)]="config">
  </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EgContentTypeComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService){

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._settings.content_types(p, m, n),
      title : Core.Localize("content_type", {count: 2}), 
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: {
        content_type: AppStatic.StandardForm['eg_content_type']
      }
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
