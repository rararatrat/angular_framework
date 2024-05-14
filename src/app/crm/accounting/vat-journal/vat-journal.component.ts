import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { VatJournalDetailComponent } from './vat-journal-detail/vat-journal-detail.component';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-vat-journal',
  /* templateUrl: './vat-journal.component.html',
  styleUrls: ['./vat-journal.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-accounting-vat-journal'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VatJournalComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    const _form = Accounting.getVatJournalFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.vat_journals(p, m, n),
      title : Core.Localize("vat_journal"),
      noModalHeight: true
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
