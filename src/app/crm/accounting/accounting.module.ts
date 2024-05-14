import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingRoutingModule } from './accounting-routing.module';
import { AccountingComponent } from './accounting.component';
import { AccountComponent } from './account/account.component';
import { AccountDetailComponent } from './account/account-detail/account-detail.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { BalanceSheetDetailComponent } from './balance-sheet/balance-sheet-detail/balance-sheet-detail.component';
import { IncomeStatementComponent } from './income-statement/income-statement.component';
import { IncomeStatementDetailComponent } from './income-statement/income-statement-detail/income-statement-detail.component';
import { ManualEntryComponent } from './manual-entry/manual-entry.component';
import { ManualEntryDetailComponent } from './manual-entry/manual-entry-detail/manual-entry-detail.component';
import { OpenPositionComponent } from './open-position/open-position.component';
import { OpenPositionDetailComponent } from './open-position/open-position-detail/open-position-detail.component';
import { VatJournalComponent } from './vat-journal/vat-journal.component';
import { VatJournalDetailComponent } from './vat-journal/vat-journal-detail/vat-journal-detail.component';
import { VatTaxformComponent } from './vat-taxform/vat-taxform.component';
import { VatTaxformDetailComponent } from './vat-taxform/vat-taxform-detail/vat-taxform-detail.component';
import { AccountLogsComponent } from './account-logs/account-logs.component';
import { AccountLogsDetailComponent } from './account-logs/account-logs-detail/account-logs-detail.component';
import { LibraryModule } from '@library/library.module';

const components = [
  AccountingComponent,
  AccountComponent,
  AccountDetailComponent,
  BalanceSheetComponent,
  BalanceSheetDetailComponent,
  IncomeStatementComponent,
  IncomeStatementDetailComponent,
  ManualEntryComponent,
  ManualEntryDetailComponent,
  OpenPositionComponent,
  OpenPositionDetailComponent,
  VatJournalComponent,
  VatJournalDetailComponent,
  VatTaxformComponent,
  VatTaxformDetailComponent,
  AccountLogsComponent,
  AccountLogsDetailComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    LibraryModule,
    AccountingRoutingModule
  ]
})
export class AccountingModule { }
