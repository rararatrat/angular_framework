import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'eg-accounting-settings',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/* templateUrl: './accounting-settings.component.html',
styleUrls: ['./accounting-settings.component.scss'] */
export class AccountingSettingsComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize('accounting_settings');
  public gridListId : any = "settings_md_project_status";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService){}

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.accounting_standard(p, m, n),
      title       : this.title,
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label: Core.Localize('standard', {count: 2}),
          subTitle: Core.Localize('standard_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_standards",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_standard(p2, m, n),
        },
        {
          label: Core.Localize('acct_code_dfn'),
          subTitle: Core.Localize('acct_code_dfn_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_code_defn",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_code_defn(p2, m, n),
        },
        {
          label: Core.Localize('fiscal_year'),
          subTitle: Core.Localize('fiscal_year_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_fiscal_year",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_calendar_years(p2, m, n),
        },
        {
          label: Core.Localize('business_year'),
          subTitle: Core.Localize('business_year_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_bus_year",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_business_years(p2, m, n),
        },
        {
          label: Core.Localize('tax'),
          subTitle: Core.Localize('tax_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_tax",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_taxes(p2, m, n),
        },
        {
          label: Core.Localize('curr_and_exchange_rate'),
          subTitle: Core.Localize('curr_and_exchange_rate_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_acct_currency",
          api$ : (p2, m?: apiMethod, n?) => that._settings.accounting_currency(p2, m, n),
        },
      ]

    }
  }

  ngOnDestroy(): void {

  }
}
