import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridListConfig, IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';
import { map } from 'rxjs';

@Component({
  selector: 'eg-crm-settings-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string = Core.Localize('settings', {item: Core.Localize('payment')});
  public gridListId : any = "settings_md_crm_payment";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService){}

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.crm_payment_types(p, m, n),
      title       : Core.Localize('payment_types'),
      noModalHeight: true,
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label: Core.Localize('payment_type', {count: 2}),
          subTitle: Core.Localize('payment_types_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_crm_payment_types",
          api$ : (p2, m?: apiMethod, n?) => that._settings.crm_payment_types(p2, m, n),
        },
        {
          label: Core.Localize('payment_reminder', {count: 2}),
          subTitle: Core.Localize('payment_reminders_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_crm_payment_reminders",
          api$ : (p2, m?: apiMethod, n?) => that._settings.crm_payment_reminders(p2, m, n),
        },
        {
          label: Core.Localize('payment_template', {count: 2}),
          subTitle: Core.Localize('payment_templates_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_crm_payment_template",
          api$ : (p2, m?: apiMethod, n?) => that._settings.crm_payment_template(p2, m, n),
        },
        {
          label: Core.Localize('payment_service'),
          subTitle: Core.Localize('payment_service_desc'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_crm_payment",
          api$ : (p2, m?: apiMethod, n?) => that._settings.crm_payment(p2, m, n).pipe(map(res => ({...res, content: {...res.content, fields: res.content.fields.map(_f => {
            if(_f?.field == 'uuid'){
              _f.required = false;
            }
            return _f;
          })}}))),
        }
      ],
      withDetailRoute: false,
      excludedFields: ['uuid', 'created_at']
    }
  }



  ngOnDestroy(): void {

  }
}
