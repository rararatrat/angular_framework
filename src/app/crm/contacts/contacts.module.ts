import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsRoutingModule } from './contacts-routing.module';
import { ContactsComponent } from './contacts.component';
import { PeopleComponent } from './people/people.component';
import { PeopleDetailComponent } from './people/people-detail/people-detail.component';
import { CompanyComponent } from './company/company.component';
import { CompanyDetailComponent } from './company/company-detail/company-detail.component';
import { LibraryModule } from '@library/library.module';
import { ProjectModule } from '../project/project.module';
import { PurchasingModule } from '../purchasing/purchasing.module';
import { SalesModule } from '../sales/sales.module';
import { BankComponent } from './bank/bank.component';

@NgModule({
  declarations: [
    ContactsComponent,
    PeopleComponent,
    PeopleDetailComponent,
    CompanyComponent,
    CompanyDetailComponent,
    BankComponent,
  ],
  imports: [
    LibraryModule,
    CommonModule,
    ContactsRoutingModule,
    ProjectModule,
    PurchasingModule,
    SalesModule
  ]
})
export class ContactsModule { }
