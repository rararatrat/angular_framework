import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrmComponent } from './crm.component';
import { AuthGuard } from '@library/interceptor/auth.guard';

const routes: Routes = [
  { path: '', component: CrmComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",
    data: {appId: 2, sidebarLoaderId: 'eag-crm', title: 'titles.crm'},
    children : [
      { path: '', data: { title: '' }, loadChildren: () => import('./project/project.module').then(m => m.ProjectModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      { path: 'accounting', data: { title: ''  }, loadChildren: () => import('./accounting/accounting.module').then(m => m.AccountingModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      { path: 'product', data: { title: '' }, loadChildren: () => import('./product/product.module').then(m => m.ProductModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      { path: 'purchasing', data: { title: '' }, loadChildren: () => import('./purchasing/purchasing.module').then(m => m.PurchasingModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      { path: 'sales', data: { title: '' }, loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      { path: 'contacts', data: { title: '' }, loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule), runGuardsAndResolvers: "paramsOrQueryParamsChange" },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
