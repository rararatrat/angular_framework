
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridListConfig, IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Core, apiMethod } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';
import { map } from 'rxjs';

@Component({
  selector: 'eg-address-book',
  template: `<eg-grid-list #gridList [gridListId]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush

})
/* templateUrl: './project-settings.component.html',
styleUrls: ['./project-settings.component.scss'] */
export class AddressBookComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  "Address Book & Contacts";
  public gridListId : any = "settings_md_ab_categories";

  @ViewChild('gridList') gridList : GridListComponent;

  constructor(private _settings: SettingsService){

  }


  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings.contact_categories(p, m, n),
      title       : `${Core.Localize('address_book')} ${Core.Localize('and')} ${Core.Localize('contact', {count: 2})}`,
      config      : {
                      containerType : "twocolumn",
                      hasHeader     : true,
                      header        : this.title
                    },
      stateTabs   : [
        {
          label:  Core.Localize('Category', {count: 2}),
          subTitle: Core.Localize('manage_contact_categories'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_ab_categories",
          api$ : (p2, m?: apiMethod, n?) => that._settings.contact_categories(p2, m, n),
        },
        {
          label: Core.Localize('sector'),
          subTitle: Core.Localize('add_remove_sectors'),
          icon: 'fa-solid fa-circle',
          gridId : "settings_md_ab_sector",
          api$ : (p2, m?: apiMethod, n?) => that._settings.contact_sector(p2, m, n),
        },
        {
          label : Core.Localize('title', {count: 2}),
          subTitle: Core.Localize('add_remove_title'), //here
          icon : "fa-solid fa-circle",
          gridId : "settings_md_ab_title",
          api$ : (p2, m?: apiMethod, n?) => that._settings.contact_title(p2, m, n),
        },
        {
          label: Core.Localize('form_of_address'),
          subTitle: Core.Localize('add_remove_form_of_address'),
          icon : "fa-solid fa-user",
          gridId : "settings_md_ab_address_form",
          api$ : (p2, m?: apiMethod, n?) => that._settings.contact_address(p2, m, n),
        },
        {
          label: Core.Localize('memo'),
          subTitle: Core.Localize('add_remove_memo'),
          icon : "fa-solid fa-user",
          gridId : "settings_md_ab_memo",
          api$ : (p2, m?: apiMethod, n?) => that._settings.contact_memo(p2, m, n),
        },

      ],
      noModalHeight: true,
      withDetailRoute: false
    }
  }



  ngOnDestroy(): void {

  }
}
