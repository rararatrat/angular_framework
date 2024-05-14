import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridListConfig, IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'eg-product-settings',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/*   templateUrl: './product-settings.component.html',
  styleUrls: ['./product-settings.component.scss'] */
export class ProductSettingsComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize('settings', {item: Core.Localize('product')});
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
      apiService  : (p, m, n?) => this._settings.product_warehouse_location(p, m, n),
      title       : "Product Settings",
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label: Core.Localize('warehouse_loc', {count: 2}),
          subTitle: Core.Localize('warehouse_loc_desc'),
          icon : "fa-solid fa-circle",
          gridId : "settings_md_product_warehouse_location",
          api$ : (p2, m?: apiMethod, n?) => that._settings.product_warehouse_location(p2, m, n),
        },
        {
          label: Core.Localize('bin_loc', {count: 2}),
          subTitle: Core.Localize('bin_loc_desc'),
          icon : "fa-solid fa-circle",
          gridId : "settings_md_product_bin_location",
          api$ : (p2, m?: apiMethod, n?) => that._settings.product_bin_locations(p2, m, n),
        },
        {
          label: Core.Localize('group', {count: 2}),
          subTitle: Core.Localize('group_desc'),
          icon : "fa-solid fa-circle",
          gridId : "settings_md_product_groups",
          api$ : (p2, m?: apiMethod, n?) => that._settings.product_groups(p2, m, n),
        },
        {
          label : Core.Localize('type', {count: 2}),
          subTitle: Core.Localize('type_desc'),
          icon : "fa-solid fa-circle",
          gridId : "settings_md_product_type",
          api$ : (p2, m?: apiMethod, n?) => that._settings.product_type(p2, m, n),
        },
        {
          label: Core.Localize('type_inheritance', {count: 2}),
          subTitle: Core.Localize('type_inheritance_desc'),
          icon : "fa-solid fa-circle",
          gridId : "settings_md_product_pretype",
          api$ : (p2, m?: apiMethod, n?) => that._settings.product_pre_type(p2, m, n),
        },
      ]

    }
  }

  ngOnDestroy(): void {}
}
