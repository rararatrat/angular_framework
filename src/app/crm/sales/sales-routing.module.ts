import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditNotesComponent } from './credit-notes/credit-notes.component';
import { DeliveryNotesComponent } from './delivery-notes/delivery-notes.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { OrdersComponent } from './orders/orders.component';
import { PaymentReminderComponent } from './payment-reminder/payment-reminder.component';
import { PaymentReminderDetailComponent } from './payment-reminder/payment-reminder-detail/payment-reminder-detail.component';
import { QuotesComponent } from './quotes/quotes.component';
import { StatementsComponent } from './statements/statements.component';
import { StatementsDetailComponent } from './statements/statements-detail/statements-detail.component';
import { BalanceStatementComponent } from './balance-statement/balance-statement.component';
import { OrderPaymentComponent } from './order-payment/order-payment.component';
import { OrdersCrudComponent } from './orders/orders-crud/orders-crud.component';
import { InvoicesCrudComponent } from './invoices/invoices-crud/invoices-crud.component';
import { CreditNotesCrudComponent } from './credit-notes/credit-notes-crud/credit-notes-crud.component';
import { SalesComponent } from './sales.component';
import { QuotesCrudComponent } from './quotes/quotes-crud/quotes-crud.component';
import { DeliveryCrudComponent } from './delivery-notes/delivery-crud/delivery-crud.component';


const routes: Routes = [
  { path: '', component: SalesComponent, data: {title: "titles.sales"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    children:
    [
      { path: 'quotes', component: QuotesComponent, data: {title: "titles.quote", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [
        /* { path: 'preview', component: PositionWrapperComponent, data: {title: "titles.quote", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}, */
        { path: ':id', component: QuotesCrudComponent, data: {title: "titles.quote", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      ]
    },
    { path: 'credit_notes', component: CreditNotesComponent, data: {title: "titles.credit_note", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: CreditNotesCrudComponent, data: {title: "titles.credit_note", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

    { path: 'delivery_notes', component: DeliveryNotesComponent, data: {title: "titles.delivery_note", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: DeliveryCrudComponent, data: {title: "titles.delivery_note", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

    { path: 'invoices', component: InvoicesComponent, data: {title: "titles.invoices"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: InvoicesCrudComponent, data: {title: "titles.invoices"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

    { path: 'orders', component: OrdersComponent, data: {title: "titles.order"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: OrdersCrudComponent, data: {title: "titles.order"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
    },
    { path: 'order_payments', component: OrderPaymentComponent, data: {title: "titles.order_payment"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      /* children: [{ path: ':id', component: OrderPaymentDetailComponent, data: {title: "titles.order_payment"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},

    { path: 'payment_reminder', component: PaymentReminderComponent, data: {title: "titles.payment_reminder"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: PaymentReminderDetailComponent, data: {title: "titles.payment_reminder"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},


    { path: 'statements', component: StatementsComponent, data: {title: "titles.account_statement", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: StatementsDetailComponent, data: {title: "titles.account_statement", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

    { path: 'balance_statement', component: BalanceStatementComponent, data: {title: "titles.balance_statement"}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
      /* children: [{ path: ':id', component: BalanceStatementDetailComponent, data: {title: "titles.balance_statement"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
