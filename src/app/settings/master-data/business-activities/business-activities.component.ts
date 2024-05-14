
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { Core } from '@eagna-io/core';
import { map } from 'rxjs';

@Component({
  selector: 'eg-business-activities',
  template: `<eg-grid-list [gridListId]="'settings_md_business_activities_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
/* templateUrl: './activities.component.html',
styleUrls: ['./activities.component.scss'] */
export class BusinessActivitiesComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService){

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._settings.business_activities(p, m, n).pipe(map(res => {
        const _inc = res.content.fields.find(_f=>_f.field=="income_account");
        if(_inc){
          _inc.required = true;
        }
        return res;
      })),
      title : Core.Localize("business_activities"),
      noModalHeight: true,
      withDetailRoute: false
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
