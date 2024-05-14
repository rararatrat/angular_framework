import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { ProfileService } from '../profile.service';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';

@Component({
  selector: 'eg-security',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/* templateUrl: './activities.component.html',
styleUrls: ['./activities.component.scss'] */
export class SecurityComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize("security");
  public gridListId : any = "profile_authentication_logs";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _profile: ProfileService){}

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._profile.authentication_logs(p, m, n),
      title       : Core.Localize("security"),
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label: Core.Localize('authentication_log', {count: 2}),
          subTitle: '', //"Authentication Logs",
          icon: 'fa-solid fa-circle',
          gridId : "settings_config_manage_team",
          api$ : (p2, m?: apiMethod, n?) => that._profile.authentication_logs(p2, m, n),
        },/* 
        {
          label: 'Activity Logs',
          subTitle: "Add / Remove Users From your Organization",
          icon : "fa-solid fa-user",
          gridId : "profile_authentication_logs",
          api$ : (p2, m?: apiMethod, n?) => that._profile.activity_logs(p2, 'post', n),
        }, */
        {
          label: Core.Localize('preference', {count: 2}),
          subTitle: Core.Localize('app_preference_desc'),
          icon : "fa-solid fa-user",
          gridId : "profile_app_preferences",
          api$ : (p2, m?: apiMethod, n?) => that._profile.appPreferences(p2, m),
        },

      ],
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: {appId: {type: 'select', autoConfig: {title: 'app_name', description: 'app_name', saveField: 'id'}, }}
    }
  }



  ngOnDestroy(): void {

  }
}
