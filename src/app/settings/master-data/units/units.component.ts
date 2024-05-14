import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridListConfig, IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'eg-units-settings',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/* templateUrl: './units.component.html',
styleUrls: ['./units.component.scss'] */
export class UnitsComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  "Measurement Settings";
  public gridListId : any = "settings_md_project_status";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService){

  }


  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.measurement_system(p, m, n),
      title       : "Measurement Settings",
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label : Core.Localize('measurement_system'),
          subTitle: Core.Localize('measurement_system_desc'),
          icon : "fa-solid fa-user",
          gridId : "settings_md_measurement_system",
          api$ : (p2, m?: apiMethod, n?) => that._settings.measurement_system(p2, m, n),
        },
        {
          label :  Core.Localize('manage_unit', {count: 2}),
          subTitle: Core.Localize('manage_unit_desc', {count: 2}),
          icon : "fa-solid fa-user",
          gridId : "settings_md_measurement_units",
          api$ : (p2, m?: apiMethod, n?) => that._settings.measurement_units(p2, m, n),
        },
        {
          label : Core.Localize('measurement_and_unit', {count: 2}),
          subTitle: Core.Localize('measurement_and_unit_desc', {count: 2}),
          icon : "fa-solid fa-user",
          gridId : "settings_md_measurement_grouping",
          api$ : (p2, m?: apiMethod, n?) => that._settings.measurement_pre_units(p2, m, n),
          formProperties: {parent: {autoConfig: {extraKey: "parent_unit", title: "name", saveField: "id"}}, child: {autoConfig: {extraKey: "child_unit", title: "name", saveField: "id"}}}
        },
      ],
      noModalHeight: true,
      withDetailRoute: false
    }
  }



  ngOnDestroy(): void {

  }
}
