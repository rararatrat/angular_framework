/* Angular Imports */
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http";

import { AppComponent } from "./app.component";

import { APP_ID, CoreModule, SharedModule, SharedService, envAppConfig } from '@eagna-io/core';

/* RxJs */
import { BehaviorSubject, Subject } from 'rxjs';

/* Modules for Translation */
import { TranslateModule, TranslateLoader, MissingTranslationHandler, TranslateCompiler} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { CustomTranslateLoader } from './translate/translate.loader';
import { MyMissingTranslationHandler } from './translate/missing';

/* License Manager */
import { LicenseManager } from 'ag-grid-enterprise';

/* PrimeNg */
import {ChartModule} from 'primeng/chart';
import { AppRoutingModule } from "./app-routing.module";

/* Environment */
import { environment as env } from 'src/environment/environment';
import { LOCALE_ID } from "@angular/core";
import { HttpRequestsInterceptor } from "@library/interceptor/http-request.interceptor";
import { LibraryModule } from "@library/library.module";
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";
import { MessageService, Translation } from "primeng/api";

/* Angular Locale */
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

import localeJa from '@angular/common/locales/ja';
import localeJaExtra from '@angular/common/locales/extra/ja';

import localeKo from '@angular/common/locales/ko';
import localeKoExtra from '@angular/common/locales/extra/ko';

import localeIt from '@angular/common/locales/it';
import localeItExtra from '@angular/common/locales/extra/it';

import localeTa from '@angular/common/locales/ta';
import localeTaExtra from '@angular/common/locales/ta';

import localeTl from '@angular/common/locales/pt-TL';
import localeTlExtra from '@angular/common/locales/pt-TL';

import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/es';

import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/pt';

import localeGa from '@angular/common/locales/ga';
import localeGaExtra from '@angular/common/locales/ga';

import localeZh from '@angular/common/locales/zh';
import localeZhExtra from '@angular/common/locales/zh';

import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/en';

import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/fr';
import { objArrayType } from "@library/library.interface";
import { HomeComponent } from "./home/home.component";
import { FormGroup } from "@angular/forms";

export class AppStatic {
  static savedLocale = SharedService.getSavedLocale(env.locale);
  /* static modalHeight = "80vh";
  static modalWidth = '50vw'; */
  static default_currency = 'EUR';

  static Components():any[]{
    return [
      AppComponent,
      HomeComponent
    ]
  }

  static Modules():any[]{
    return [
      CoreModule,
      AppRoutingModule,
      BrowserModule,
      /* ChartModule, */
      BrowserAnimationsModule,

      AuthModule,
      LibraryModule,
      ProfileModule,

      TranslateModule.forRoot({
        defaultLanguage: AppStatic.savedLocale,
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
          deps: [HttpClient]
        },
        compiler: {
          provide: TranslateCompiler,
          useClass: TranslateMessageFormatCompiler
        },
        missingTranslationHandler: {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler}
      }),
      /* NgxTranslateRoutesModule.forRoot({enableRouteTranslate: false,enableTitleTranslate: true}), */
      SharedModule.forRoot({sharedService: new SharedService({appConfig: {
          env: {
            main: <envAppConfig>{locale: env.locale, apiUrl: env.apiUrl, isProd: env.production === true, isDebug: env.debug == true, hideConsoleLog: env.hideConsoleLog}
          },
          appName: 'app-framework',
          app$: new BehaviorSubject({appId: 1}),
        },
        agGridLicenseKey: env.agGridLicense,
        tinyMceApiKey: env.tinyMceApiKey
      })}),
    ]
  }

  static Providers(): any[]{
    return [
      { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
      { provide: Window, useValue: window },
      { provide: LOCALE_ID, useFactory: () => {
        /* const curr = AppStatic.savedLocale;
        const lo = (AppStatic.savedLocale == "tl") ? "pt-TL" : AppStatic.savedLocale; */

        return AppStatic.savedLocale;
      } },
      { provide: APP_ID, useValue: 1 },
      MessageService
    ]
  }

  static setAgGridLicense() {
    LicenseManager.setLicenseKey(env.agGridLicense);
  }

  static PrimeNgTranslations$ : Subject<Translation>;

  static registerLocale(locale){

    switch(locale){
      case "en":
        registerLocaleData(localeEn, localeEnExtra);
        break;
      case "de":
        registerLocaleData(localeDe, localeDeExtra);
        break;
       case "ta":
        registerLocaleData(localeTa, localeTaExtra);
        break;
     case "ga":
        registerLocaleData(localeGa, localeGaExtra);
        break;
      case "pt-TL":
        registerLocaleData(localeTl, localeTlExtra);
        break;
      case "fr":
        registerLocaleData(localeFr, localeFrExtra);
        break;
      case "ja":
        registerLocaleData(localeJa, localeJaExtra);
        break;
      case "ko":
        registerLocaleData(localeKo, localeKoExtra);
        break;
      case "it":
        registerLocaleData(localeIt, localeItExtra);
        break;
      case "es":
        registerLocaleData(localeEs, localeEsExtra);
        break;
      case "pt":
        registerLocaleData(localePt, localePtExtra);
        break;
      case "zh":
        registerLocaleData(localeZh, localeZhExtra);
        break;
      default:
        registerLocaleData(localeEn, localeEnExtra);
        break;
    }
  }

  static StandardForm: objArrayType = {
    currency      : {type:"select", autoConfig: {title: "name", saveField: "id"}},
    language      : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
    discount_type : {type: "radio", data: [{id: 1, label: 'Percentage'}, {id: 2, label: 'Amount'}]},
    billing_add: {autoConfig: {extraKey: 'ext_address'}},
    shipping_add: {autoConfig: {extraKey: 'ext_address'}},
    reg_add: {autoConfig: {extraKey: 'ext_address'}},
    address: {icon:"fa-solid fa-registered", type:"address"},
    category: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "contact_category"}, displayVal: "category.name" },
    contact_partner: {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "contact_partner"} , displayVal: "contact_partner.name"},
    //company: {icon:"fa-solid fa-sitemap", type:"autocomplete",autoConfig:  {title: ['name'], saveField: "id", extraKey: "company"} , displayVal: "company.name",  placeholder:"Search company"},
    company: {icon:"fa-solid fa-sitemap", autoConfig:  {title: ['name'], saveField: "id", image: {linkToImage:"logo"}} , displayVal: "company.name", placeholder:"Search company"},
    role: {autoConfig  : {title: "name", extraKey: "project_role", saveField: "id"}, displayVal: "role.name" },
    sector: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "contact_sector"}, displayVal: "name" },
    country: {icon:"fa-solid fa-globe", type:"select", autoConfig: {title: 'name', description: 'name', icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}, /* displayVal: "country.name" */},
    country_api: {icon:"fa-solid fa-globe", type:"select", autoConfig: {title: 'name', description: 'name', extraKey: "country_api", icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}, /* displayVal: "country.name" */},
    date_start_planned: { dateConfig: {minDate: new Date()}, callback: (p) => {
      (<FormGroup>p.input.formGroup).get('date_end_planned').setValue(null);
      (<FormGroup>p.input.formGroup).get('date_start_actual').setValue(null);
      (<FormGroup>p.input.formGroup).get('date_end_actual').setValue(null);

      (<FormGroup>p.input.formGroup).get('date_end_planned').enable();
      (<FormGroup>p.input.formGroup).get('date_start_actual').enable();

      (<objArrayType>p.objArray)['date_end_planned'].dateConfig = {...p.objArray['date_end_planned'].dateConfig, minDate: p.input?.data };
      (<objArrayType>p.objArray)['date_start_actual'].dateConfig = {...p.objArray['date_start_actual'].dateConfig, minDate: p.input?.data };
      (<objArrayType>p.objArray)['date_end_actual'].dateConfig = {...p.objArray['date_end_actual'].dateConfig, minDate: p.input?.data };
    }},
    date_end_planned: { dateConfig: {minDate: new Date()}},
    date_start_actual: { dateConfig: {maxDate: new Date()}, callback :(p) => {
      (<FormGroup>p.input.formGroup).get('date_end_actual').setValue(null);
      (<FormGroup>p.input.formGroup).get('date_end_actual').enable();
      (<objArrayType>p.objArray)['date_end_actual'].dateConfig = {...p.objArray['date_end_actual'].dateConfig, minDate: p.input?.data };
    }},
    date_end_actual: {dateConfig: {maxDate: new Date()}},
    payment_type: {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: 'name', description: 'name', saveField: "id"},  displayVal: "name"},
    eg_content_type: {type: "select", autoConfig:{title:'description', description:'name', saveField:'id'}, displayVal: 'name'},
    tax : {icon:"fa-solid fa-circle-user", type:"select", autoConfig:  {title: "name", saveField: "id", extraKey: "tax_rates"}, displayVal: "tax.tax_rate" },
    mwst_type: {type: "radio", data: [ {id: 1, label: 'Incl. Tax', value: 1},
                {id: 2, label: 'Excl. Tax', value: 2},
                {id: 3, label: 'Tax exempt', value: 3}
              ]
    },
    mwst_is_net: {type: "radio", data: [ {id: 1, label: 'Gross', value:false},
                  {id: 2, label: 'Net',   value:true}
              ]
    }
  }
}
