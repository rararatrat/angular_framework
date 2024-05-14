import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillsComponent } from './bills/bills.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpensesDetailComponent } from './expenses/expenses-detail/expenses-detail.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchasingComponent } from './purchasing.component';
import { PurchaseOrderCrudComponent } from './purchase-order/purchase-order-crud/purchase-order-crud.component';
import { BillsCrudComponent } from './bills/bills-crud/bills-crud.component';

const routes: Routes = [
  {
    path: '', data: { title: "titles.purchasing" }, component: PurchasingComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    children: [
      {
        path: 'bills', component: BillsComponent, data: { title: "titles.bill", pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: BillsCrudComponent, data: { title: "titles.bill", pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange" }]
      },
      
      {
        path: 'expenses', component: ExpensesComponent, data: { title: "titles.expense", pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: ExpensesDetailComponent, data: { title: "titles.expense", pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange" }]
      },

      {
        path: 'purchase_order', component: PurchaseOrderComponent, data: { title: "titles.purchase_order" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: PurchaseOrderCrudComponent, data: { title: "titles.purchase_order" }, runGuardsAndResolvers: "paramsOrQueryParamsChange" }]
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasingRoutingModule { }
