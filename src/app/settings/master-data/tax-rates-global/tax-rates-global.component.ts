import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { IContainerWrapper } from '@library/library.interface';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-md-tax-rates-global',
  //templateUrl: './tax-rates-global.component.html',
  template : `
            <eg-grid-list [gridListId]="'settings_md_tax_rates_global'"
                          [type]="type"
                          [showHeader]="true"
                          [(config)]="config">
            </eg-grid-list>
            `,
  styleUrls: ['./tax-rates-global.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxRatesGlobalComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _settings: SettingsService, private _cdr: ChangeDetectorRef){
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._settings.tax_rate_global(p, m, n),
      title : Core.Localize("vat"),
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
