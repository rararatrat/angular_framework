import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { StatementsDetailComponent } from './statements-detail/statements-detail.component';

@Component({
  selector: 'eg-statements',
  /* templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-sales-statements'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementsComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_statements(p, m, n),
      title : Core.Localize("account_statement", {count: 2}),
      detailComponent: StatementsDetailComponent,
    }
  }

  ngOnDestroy(): void {

  }

}
