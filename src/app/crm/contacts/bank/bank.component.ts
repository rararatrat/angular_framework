import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Contacts } from '../contacts';

@Component({
  selector: 'eg-bank',
  /* templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'], */
  template: `<eg-grid-list [gridListId]="'grid-banking'"
                [type]="viewType"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankComponent implements OnInit, OnDestroy {
  @Input() viewType   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
  }

  ngOnInit(): void {
    const _fp = Contacts.getBankAccountFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.viewType,
      /* params : this.param, */
      apiService : (p, m, n?) => this._crm.bankingAccount(p, m, n),
      title : Core.Localize("banking"),
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure,
      noModalHeight: true,
      modalWidth: '90vw',
      withDetailRoute: false,
    }
  }

  ngOnDestroy(): void {}
}
