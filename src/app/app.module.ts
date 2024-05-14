import { CUSTOM_ELEMENTS_SCHEMA, Inject, LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { AppComponent } from './app.component';
import { AppStatic } from './app.static';
import { Core, SharedService } from '@eagna-io/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig, Translation } from 'primeng/api';

import localeJa from '@angular/common/locales/ja';
import localeJaExtra from '@angular/common/locales/extra/ja';
import { TranslationWidth, getLocaleDayNames, registerLocaleData } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';


const component = AppStatic.Components();
const module    = AppStatic.Modules();
const provider  = AppStatic.Providers();

registerLocaleData(localeJa, localeJaExtra);

@NgModule({
  declarations: [].concat(component),
  imports     : [].concat(module),
  providers   : [].concat(provider),
  schemas     : [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap   : [AppComponent]
})
export class AppModule {
  public primeNgTranslation : Translation;

  constructor(private _translate: TranslateService,
              private _shared:SharedService,
              @Inject(LOCALE_ID) public LOCALE_ID: any,
              ){

    AppStatic.registerLocale(this.LOCALE_ID);

    this._translate.onDefaultLangChange.subscribe(res => {
      let temp : any = {}
      for (let key in res.translations?.grid) {
        if (Object.prototype.hasOwnProperty.call(res.translations.grid, key)) {
          const element = res.translations.grid[key]?.("variable")
          temp[key] = element.replace("$undefined", "${variable}")
        }
      }
      this._shared.gridLocal = temp;
    });
    AppStatic.setAgGridLicense();
  }
}
