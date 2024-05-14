import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { ExpensesDetailComponent } from './expenses-detail/expenses-detail.component';
import { Purchasing } from '../purchasing';

@Component({
  selector: 'eg-expenses',
  template: `<eg-grid-list [gridListId]="'grid-purchasing-expenses'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;


  constructor(private _crm:CrmService){
  }

  ngOnInit(): void {
    const _fp = Purchasing.getExpenseProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.purchasing_expenses(p, m, n),
      title : Core.Localize("expense", {count: 2}),
      detailComponent: ExpensesDetailComponent,
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure,
      requiredFields: _fp.requiredFields,
      statusField: 'status',
      defaultColumns: {columns: {state: [
        "title",
        "company",
        "project",
        "invoice",
        "bank_account",
        "account",
        "tax",
        "tax_calc",
        "total_w_tax",
        "total_wo_tax",
        "paid_at",
        "due_date",
        "status",
        "actions"
      ]}}
    }
  }

  ngOnDestroy(): void {}
}

