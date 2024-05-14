import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { AccountLogsDetailComponent } from './account-logs/account-logs-detail/account-logs-detail.component';
import { AccountLogsComponent } from './account-logs/account-logs.component';

const routes: Routes = [{ path: '', data: { title: "titles.accounting" }, component: AccountComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange"},
  { path: 'account', component: AccountComponent, data: { title: "titles.account" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  children: [{ path: ':id', component: AccountDetailComponent, data: { title: "titles.account_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

  { path: 'balance_sheet', component: BalanceSheetComponent, data: { title: "titles.balance_sheet" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  children: [{ path: ':id', component: BalanceSheetDetailComponent, data: { title: "titles.balance_sheet" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

  { path: 'income_statement', component: IncomeStatementComponent, data: { title: "titles.income_statement" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  /* children: [{ path: ':id', component: IncomeStatementDetailComponent, data: { title: "titles.income_statement" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},

  { path: 'logs', component: AccountLogsComponent, data: { title: "titles.logs" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  children: [{ path: ':id', component: AccountLogsDetailComponent, data: { title: "titles.logs" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

  { path: 'manual_entry', component: ManualEntryComponent, data: { title: "titles.manual_entry" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  children: [{ path: ':id', component: ManualEntryDetailComponent, data: { title: "titles.manual_entry" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

  { path: 'open_position', component: OpenPositionComponent, data: { title: "titles.open_position" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  /* children: [{ path: ':id', component: OpenPositionDetailComponent, data: { title: "titles.open_position" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},

  { path: 'vat_journal', component: VatJournalComponent, data: { title: "titles.vat_journal" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  children: [{ path: ':id', component: VatJournalDetailComponent, data: { title: "titles.vat_journal" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},

  { path: 'vat_taxform', component: VatTaxformComponent, data: { title: "titles.vat_taxform" } , runGuardsAndResolvers: "paramsOrQueryParamsChange",
  /* children: [{ path: ':id', component: VatTaxformDetailComponent, data: { title: "titles.vat_tax_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
