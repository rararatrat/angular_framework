import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Sales } from '../sales';

@Component({
  selector: 'eg-order-payment',
  /* templateUrl: './order-payment.component.html',
  styleUrls: ['./order-payment.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-sales-order-payments'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderPaymentComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    let _fp = Sales.getOrderPaymentFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_order_payments(p, m, n),
      title : Core.Localize("order_payment", {count: 2}),
      noModalHeight: true,
      withDetailRoute: false,
      formStructure: _fp.formStructure
    }
  }
  ngOnDestroy(): void {}
}
