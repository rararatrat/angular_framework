import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-account-logs',
  /* templateUrl: './account-logs.component.html',
  styleUrls: ['./account-logs.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-account-logs'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountLogsComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    const _form = Accounting.getLogsFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.account_logs(p, m, n),
      title : Core.Localize("account_logs"),
      noModalHeight: true
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
