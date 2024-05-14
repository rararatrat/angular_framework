
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { MasterData } from '../master-data';
import { Subscription, map, tap } from 'rxjs';
import { GridResponse, ResponseObj } from '@eagna-io/core';

@Component({
  selector: 'eg-md-translation',
  template: `<eg-grid-list [gridListId]="'settings_md_translation_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  private _sub = new Subscription();

  constructor(private _settings: SettingsService){
    
    /* let i=1169;
    const _delI = (_i?) => {
      if(i <= 1181 ){
        setTimeout(() => {
          this._settings.translation?.({id: i}, 'delete').subscribe({next(value) {
            _delI(++i);
          }, error:(err) => {
            console.log(err);
          },})
        })
      }
    }; */

    /* const _redoCall = (err, p, m, n) => {
      console.log(err);
      if(err.error?.error?.message == "Internal Server Error"){
        setTimeout(() => {
          this.config.apiService?.(p, m, n).subscribe({next(value) {
            
          }, error:(err) => {
            //_redoCall(err, p, m, n);
          },})
        })
      }
    } */

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {/* group: 'translations' */},
      apiService : (p, m, n?) => {
        /* console.log({p, m, instance: (p instanceof FormData), config: this.config.formProperties}); */
        if(m == 'put'){
          
          for (const key in this.config.formProperties) {
            if (Object.prototype.hasOwnProperty.call(this.config.formProperties, key)) {
              if(p instanceof FormData){
                const _default_name = p.get("default_name");
                const _xfields = ['default_name', 'keyword', 'group'];
                const element = p.get(key);
                if(!_xfields.includes(key) && !element){
                    p.append(key, _default_name);
                } else if(key == 'group' && !element){
                  p.append('group', 'translations');
                }
              } else if(!p?.[key]){
                p[key] = p.default_name;
              }
            }
          }
        }
        /* console.log({p}); */
        return this._settings.translation(p, m, n).pipe(tap({next: (res: ResponseObj<GridResponse>) => {
          if(res?.content?.fields){
            this.config = {...this.config, formProperties: MasterData.getTranslationsFormProperties(res.content.fields)};
          }
        }, error: (err) => {}}))},
      title : "Translation",
      fromComponent: "translations",
      withDetailRoute: false,
      initValue: {group: 'translations'}
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
