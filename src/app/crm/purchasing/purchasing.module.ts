import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchasingRoutingModule } from './purchasing-routing.module';
import { PurchasingComponent } from './purchasing.component';
import { BillsComponent } from './bills/bills.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpensesDetailComponent } from './expenses/expenses-detail/expenses-detail.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { LibraryModule } from '@library/library.module';
import { PurchaseOrderCrudComponent } from './purchase-order/purchase-order-crud/purchase-order-crud.component';
import { SalesModule } from '../sales/sales.module';
import { PurchaseOrderDetailComponent } from './purchase-order/purchase-order-detail/purchase-order-detail.component';
import { ItemModule } from '../item/item.module';
import { BillsCrudComponent } from './bills/bills-crud/bills-crud.component';
import { DocumentFlowModule } from '../document-flow/document-flow.module';

const components = [
  PurchasingComponent,
  BillsComponent,
  BillsCrudComponent,
  ExpensesComponent,
  ExpensesDetailComponent,
  PurchaseOrderComponent,
  PurchaseOrderCrudComponent,
  PurchaseOrderDetailComponent
];

@NgModule({
  declarations  : components,
  exports       : components,
  imports: [
    CommonModule,
    LibraryModule,
    PurchasingRoutingModule,
    SalesModule,
    ItemModule,
    DocumentFlowModule
  ]
})
export class PurchasingModule { }
