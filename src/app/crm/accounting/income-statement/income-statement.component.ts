import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { IncomeStatementDetailComponent } from './income-statement-detail/income-statement-detail.component';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-income-statement',
  /* templateUrl: './income-statement.component.html',
  styleUrls: ['./income-statement.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-income-statements'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeStatementComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    const _form = Accounting.getIncomeFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.income_statements(p, m, n),
      title : Core.Localize("income_statement"),
      noModalHeight: true,
      withDetailRoute: false,
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
