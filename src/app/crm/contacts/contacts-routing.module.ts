import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeopleComponent } from './people/people.component';
import { PeopleDetailComponent } from './people/people-detail/people-detail.component';
import { CompanyComponent } from './company/company.component';
import { CompanyDetailComponent } from './company/company-detail/company-detail.component';
import { ContactsComponent } from './contacts.component';
import { BankComponent } from './bank/bank.component';
import { BankDetailComponent } from './bank/bank-detail/bank-detail.component';


const routes: Routes = [
  { path: '', component: ContactsComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange", data: { title: "titles.contact" },
    children : [
      { path: 'people', component: PeopleComponent, data: { title: "titles.people" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':contactId', component: PeopleDetailComponent, data: { title: "titles.people_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
      },
      { path: 'company', component: CompanyComponent, data: { title: "titles.company" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':companyId', component: CompanyDetailComponent, data: { title: "titles.company_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
      },
      { path: 'banking', component: BankComponent, data: { title: "titles.banking", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':bankId', component: BankDetailComponent, data: { title: "titles.banking_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
      },
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }
