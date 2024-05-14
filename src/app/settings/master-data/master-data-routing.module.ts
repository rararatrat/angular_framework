import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { AddressBookComponent } from './address-book/address-book.component';
import { BusinessActivitiesComponent } from './business-activities/business-activities.component';
import { GeneralStatusComponent } from './general-status/general-status.component';
import { GeneralPriorityComponent } from './general-priority/general-priority.component';
import { TranslationComponent } from './translation/translation.component';
import { LanguageComponent } from './language/language.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProductSettingsComponent } from './product-settings/product-settings.component';
import { UnitsComponent } from './units/units.component';
import { EgContentTypeComponent } from './eg-content-type/eg-content-type.component';
import { TaxRatesGlobalComponent } from './tax-rates-global/tax-rates-global.component';

const routes: Routes = [
  {path: '', runGuardsAndResolvers: "paramsOrQueryParamsChange", data:{title: "Master Data"},
    children:[
      {path: 'addressbook', data: {title: "titles.address_book"}, component:AddressBookComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  },
      {path: 'business_activites', data: { title: 'titles.business_activities' }, component:BusinessActivitiesComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'general_status', data: { title: 'titles.general_status' }, component:GeneralStatusComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'general_priority', data: { title: 'titles.general_priority' }, component:GeneralPriorityComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'content_type', data: { title: 'titles.content_type' }, component:EgContentTypeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'translation', data: { title: 'titles.translation' }, component:TranslationComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'language', data: { title: 'titles.language' }, component:LanguageComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'project_settings', data: { title: 'titles.project' }, component:ProjectSettingsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'product_settings', data: { title: 'titles.product' }, component:ProductSettingsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'measurement', data: { title: 'titles.unit', pluralCount: 2 }, component:UnitsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'tax_rates', data: { title: 'titles.vat' }, component:TaxRatesGlobalComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},

      //{path: 'notification', component: NotificationComponent, data: {title: 'titles.route_notification' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
