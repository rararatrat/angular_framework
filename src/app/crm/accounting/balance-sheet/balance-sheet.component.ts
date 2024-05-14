import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-balance-sheet',
  /* templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-accounting-balance_sheets'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceSheetComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    const _form = Accounting.getBalanceSheetFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.balance_sheets(p, m, n),
      title : Core.Localize("balance_sheet"),
      noModalHeight: true
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
