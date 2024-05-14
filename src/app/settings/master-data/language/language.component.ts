
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-md-language',
  template: `<eg-grid-list [gridListId]="'settings_md_language_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService){

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._settings.language(p, m, n),
      title : Core.Localize("language"),
      noModalHeight: true,
      withDetailRoute: false
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
