import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { Core, apiMethod } from "@eagna-io/core";
import { GridListComponent } from "@library/container-collection/grid-list/grid-list.component";
import { IContainerWrapper } from "@library/library.interface";
import { SettingsService } from "../../settings.service";
import { Team } from "./team.static";
import { tap } from "rxjs";

@Component({
  selector: 'eg-team',
  /* templateUrl: './team.component.html', */
  template : `<eg-grid-list #gridList [gridListId]="gridListId"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>
              `,
  styleUrls: ['./team.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  "Manage Your Team";
  public gridListId : any = "settings_config_manage_team";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService){}

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;
    const _fpUser = Team.getUserFormProperties();
    const _fpGroup = Team.getGroupFormProperties((p, m) => this._settings.content_types(p, m));

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.user_list(p, m, n),
      title       : this.title,
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title,
                      hasSearch     : true,
                    },
      addCallback(p) {
        console.log()
      },
      stateTabs   : [
        {
          label: Core.Localize('manage_user', {count: 2}),
          subTitle: Core.Localize('manage_users_desc'),
          icon : "fa-solid fa-user",
          gridId : "settings_config_manage_team",
          api$ : (p2, m?: apiMethod, n?) => that._settings.user_list(p2, m, n)/* .pipe(tap(res => {
            console.log( res.content.fields.filter(_f => _f.required).map(_f => ({[_f.field]: JSON.stringify(_f)})))
          })) */,
          formProperties: _fpUser.formProperties,
          formStructure: _fpUser.formStructure,
          isReadonly: true,
          defaultColumns: {columns: {state: [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "date_joined",
            "username",
            "is_superuser",
            "is_staff",
            "is_active",
            "locale",
            "provision",
            "isExternal",
            /* "org", */
            "groups",
            "user_permissions",
            "role",
            "actions"
          ]}}
        },
        {
          label : Core.Localize('user_group', {count: 2}),
          subTitle: Core.Localize('user_groups_desc'),
          icon : "fa-solid fa-user-group",
          gridId : "settings_config_manage_user_group",
          api$ : (p2, m?: apiMethod, n?) => that._settings.user_groups(p2, m, n),
          formStructure: _fpGroup.formStructure,
          formProperties: _fpGroup.formProperties
        },
        {
          label : Core.Localize('user_role', {count: 2}),
          subTitle: Core.Localize('user_roles_desc'),
          icon : "fa-solid fa-user-group",
          gridId : "settings_config_manage_user_roles",
          api$ : (p2, m?: apiMethod, n?) => that._settings.user_role(p2, m, n),

        },

      ],
      withDetailRoute: false,
      noModalHeight: true,
      defaultColumns: {columns: {state: [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "date_joined",
        "username",
        "is_superuser",
        "is_staff",
        "is_active",
        "locale",
        "provision",
        /* "isExternal", */
        /* "org", */
        "groups",
        "user_permissions",
        "role",
        "actions"
      ]}}
    }
  }



  ngOnDestroy(): void {

  }

}
