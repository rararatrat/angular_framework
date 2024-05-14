import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterDataRoutingModule } from './master-data-routing.module';
import { AddressBookComponent } from './address-book/address-book.component';
import { BusinessActivitiesComponent, } from './business-activities/business-activities.component';
import { LibraryModule } from '@library/library.module';
import { GeneralStatusComponent } from './general-status/general-status.component';
import { GeneralPriorityComponent } from './general-priority/general-priority.component';
import { TranslationComponent } from './translation/translation.component';
import { LanguageComponent } from './language/language.component';
import { UnitsComponent } from './units/units.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProductSettingsComponent } from './product-settings/product-settings.component';
import { EgContentTypeComponent } from './eg-content-type/eg-content-type.component';
import { TaxRatesGlobalComponent } from './tax-rates-global/tax-rates-global.component';


@NgModule({
  declarations: [
    AddressBookComponent,
    BusinessActivitiesComponent,
    GeneralStatusComponent,
    GeneralPriorityComponent,
    TranslationComponent,
    LanguageComponent,
    UnitsComponent,
    ProjectSettingsComponent,
    ProductSettingsComponent,
    EgContentTypeComponent,
    TaxRatesGlobalComponent,
  ],
  imports: [
    CommonModule,
    LibraryModule,
    MasterDataRoutingModule
  ]
})
export class MasterDataModule { }
