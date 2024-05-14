import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { ProfileService } from '../profile.service';
import { Core } from '@eagna-io/core';
import { AppStatic } from 'src/app/app.static';

@Component({
  selector: 'eg-activities',
  template: `<eg-grid-list [gridListId]="'grid-profile-activities'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
/* templateUrl: './activities.component.html',
styleUrls: ['./activities.component.scss'] */
export class ActivitiesComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _profile: ProfileService){
    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._profile.activities_list(p, m, n),
      title : Core.Localize('activity', {count: 2}),
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: {
        message: {type: 'json'},
        user_triggered: {autoConfig: { extraKey: 'user' }},
        eg_content_type: AppStatic.StandardForm['eg_content_type']
      },
      isReadonly: true,
      defaultColumns: {columns: {state: [
        "name",
        "eg_content_type",
        "date_notified",
        "action",
        "status_from",
        "status_to",
        "actions",
        "message",
      ]}}
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
