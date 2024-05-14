import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Sales } from '../sales';

@Component({
  selector: 'eg-balance-statement',
  /* templateUrl: './balance-statement.component.html',
  styleUrls: ['./balance-statement.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-sales-balance-statement'"
    [type]="type"
    [showHeader]="true"
    [(config)]="config">
  </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceStatementComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){ }

  ngOnInit(): void {
    const _fp = Sales.getBalanceStatementsFormProperties();

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_balance_statement(p, m, n),
      title : Core.Localize("balance_statement"),
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: _fp.formProperties,
      statusField: 'status',
      defaultColumns: {columns: {state: [
          "name",
          "title",
          "company",
          "contact",
          "user",
          "project",
          "language",
          "bank_account",
          "currency",
          "payment_type",
          "kb_terms_of_payment",
          "old_terms_of_payment_id",
          "quote",
          "mwst_type",
          "mwst_is_net",
          "tax",
          "network_link",
          "show_position_taxes",
          "is_valid_from",
          "is_valid_until",
          "total_w_tax",
          "total_wo_tax",
          "show_total",
          "invoice_address",
          "delivery_address",
          "is_recurring_order",
          "recurrence_type",
          "repeat_every_time",
          "repeat_every_time_unit",
          "starts_on",
          "ends_on",
          "is_infinite_period",
          "is_partial_invoice",
          "partial_invoice_type",
          "status",
          "process",
          "header",
          "footer",
          "api_reference",
          "template_slug",
          "updated_at",
          "viewed_by_client_at",
          "created_on",
          "positions",
          "files",
          "actions"
      ]}}
    }
  }
  ngOnDestroy(): void {}
}
