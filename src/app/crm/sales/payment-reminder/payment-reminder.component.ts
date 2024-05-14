import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { PaymentReminderDetailComponent } from './payment-reminder-detail/payment-reminder-detail.component';
import { Core } from '@eagna-io/core';
import { Sales } from '../sales';

@Component({
  selector: 'eg-payment-reminder',
  /* templateUrl: './payment-reminder.component.html',
  styleUrls: ['./payment-reminder.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-sales-payment-reminder'"
    [type]="type"
    [showHeader]="true"
    [(config)]="config">
  </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentReminderComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){

  }

  ngOnInit(): void {
    const _fp = Sales.getPaymentRemindersFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_payment_reminders(p, m, n),
      title : Core.Localize("payment_reminder", {count: 2}),
      detailComponent: PaymentReminderDetailComponent,
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure
    }
  }

  ngOnDestroy(): void {

  }

}
