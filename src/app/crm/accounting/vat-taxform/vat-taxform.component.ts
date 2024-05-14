import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { VatTaxformDetailComponent } from './vat-taxform-detail/vat-taxform-detail.component';

@Component({
  selector: 'eg-vat-taxform',
  /* templateUrl: './vat-taxform.component.html',
  styleUrls: ['./vat-taxform.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-accounting-vat-taxform'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VatTaxformComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._crm.vat_taxform(p, m, n),
      title : Core.Localize("vat_taxform"),
      //detailComponent: VatTaxformDetailComponent,
      //baseUrl: "crm/accounting/vat_taxform",
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
