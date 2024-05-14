
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { Core } from '@eagna-io/core';
import { MasterData } from '../master-data';
import { map } from 'rxjs';

@Component({
  selector: 'eg-general-status',
  template: `<eg-grid-list [gridListId]="'settings_md_general_status_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
/* templateUrl: './activities.component.html',
styleUrls: ['./activities.component.scss'] */
export class GeneralStatusComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService){}

  ngOnInit(): void {
    const _fp = MasterData.getStatusFormProperties();
    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._settings.process_status(p, m, n),
      title : Core.Localize("general_status"),
      /* add: {
        formProperties: _fp.formProperties,
        formStructure: _fp.formStructure
      }, */
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure,
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  ngOnDestroy(): void {

  }
}
