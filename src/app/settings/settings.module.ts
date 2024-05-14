import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { LibraryModule } from '@library/library.module';
import { AccountingSettingsComponent } from './accounting-settings/accounting-settings.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { OrganizationComponent } from './organization/organization.component';


@NgModule({
  declarations: [
    SettingsComponent,
    AccountingSettingsComponent,
    ImportExportComponent,
    OrganizationComponent
  ],
  imports: [
    CommonModule,
    LibraryModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
