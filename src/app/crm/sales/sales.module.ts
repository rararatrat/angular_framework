import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
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
import { LibraryModule } from '@library/library.module';
import { QuotesCrudComponent } from './quotes/quotes-crud/quotes-crud.component';
/* import { PositionComponent } from './position/position.component'; */
/* import { PositionCrudComponent } from './position/position-crud/position-crud.component'; */
/* import { PositionStatusbarComponent } from './position/position-statusbar/position-statusbar.component'; */
import { OrdersCrudComponent } from './orders/orders-crud/orders-crud.component';
import { InvoicesCrudComponent } from './invoices/invoices-crud/invoices-crud.component';
import { CreditNotesCrudComponent } from './credit-notes/credit-notes-crud/credit-notes-crud.component';
import { ItemModule } from '../item/item.module';
import { DeliveryCrudComponent } from './delivery-notes/delivery-crud/delivery-crud.component';
import { TemplatesModule } from 'src/app/settings/templates/templates.module';
import { DocumentFlowModule } from '../document-flow/document-flow.module';


const components = [
  SalesComponent,
  CreditNotesComponent,
  CreditNotesCrudComponent,
  DeliveryNotesComponent,
  DeliveryCrudComponent,
  InvoicesComponent,
  InvoicesCrudComponent,
  OrdersComponent,
  OrdersCrudComponent,
  PaymentReminderComponent,
  PaymentReminderDetailComponent,
  QuotesComponent,
  QuotesCrudComponent,
  StatementsComponent,
  StatementsDetailComponent,
  BalanceStatementComponent,
  OrderPaymentComponent,
  /* PositionComponent, */
  /* PositionCrudComponent, */
  /* PositionStatusbarComponent */
];

@NgModule({
  declarations: components,
  exports     : components,
  imports     : [
                  CommonModule,
                  LibraryModule,
                  SalesRoutingModule,
                  TemplatesModule,
                  ItemModule,
                  DocumentFlowModule
                ]
})
export class SalesModule { }
