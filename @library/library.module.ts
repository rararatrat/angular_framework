import { NgModule } from '@angular/core';
import { CommonModule, FormatWidth, NumberFormatStyle, TranslationWidth, getCurrencySymbol, getLocaleCurrencyCode, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleDirection, getLocaleEraNames, getLocaleFirstDayOfWeek, getLocaleMonthNames, getLocaleNumberFormat, getLocaleTimeFormat, registerLocaleData } from '@angular/common';
import { Core, CoreModule } from '@eagna-io/core';
import { ContainerCollectionModule } from './container-collection/container-collection.module';
import { ContentDisplayModule } from './content-display/content-display.module';
import { NavigationModule } from './navigation/navigation.module';
import { CommunicationModule } from './communication/communication.module';
import { TrackingModule } from './tracking/tracking.module';
import { WrapperService } from './service/wrapper.service';
import { ChartModule } from './chart/chart.module';
import { CardComponent } from './card/card.component';
import { LayoutModule } from '@angular/cdk/layout';
const component : any = [
  CardComponent,
];
const module : any = [
  CommonModule,
  CoreModule,
  LayoutModule
];
const appmodule : any = [
  ContainerCollectionModule,
  ContentDisplayModule,
  ChartModule,
  NavigationModule,
  CommunicationModule,
  TrackingModule
]
const service : any = [
  WrapperService
]


@NgModule({
  declarations: component,//[TimePipe].concat(component),
  imports: [].concat(module, appmodule),
  exports: [].concat(component, appmodule, module),
  providers: [].concat(service),
  /* schemas: [CUSTOM_ELEMENTS_SCHEMA] */
})
export class LibraryModule {
/* constructor(){
  console.log(localeEn);
  const locale = "de"
  let eagTranslation

  console.log(translations)
} */



}
