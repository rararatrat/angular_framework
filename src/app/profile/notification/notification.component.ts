import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridListConfig, IContainerWrapper } from '@library/library.interface';
import { ProfileService } from '../profile.service';

import { COLUMN_TYPE, Core, GridResponse, ResponseObj, apiMethod, rowModelType } from '@eagna-io/core';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { AppStatic } from 'src/app/app.static';
import { map } from 'rxjs';

@Component({
  selector: 'eg-notification',
  template: `<eg-grid-list [(gridListId)]="gridListId"
                [type]="type"
                [showHeader]="true"
                [(config)]="config"
                [serverOrClient]="'clientSide'"
                #notificationList>
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize("notification", {count: 2});
  public gridListId : any = null;
  public api$ = (p, m, n?) => this._profile.notification_list(p, m, n);

  @ViewChild('notificationList') gridList : GridListComponent;

  constructor(private _profile: ProfileService){
    this._initGridList();
  }

  ngOnInit(): void {
  }

  private _initGridList(){
    let that = this;
    this.gridListId = "profile_notification_list";
    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : this.api$,
      title : this.title,
      /* detailComponent: NotificationConfigComponent, */
      isReadonly: true,
      config: {
        containerType : "twocolumn",
        hasHeader     : true,
        header        : this.title
      },
      stateTabs: [
        {
          label     : Core.Localize('header_list', {header: Core.Localize('notification')}),
          subTitle  : Core.Localize('your_notifications'),
          icon      : 'pi pi-plus',
          gridId : "profile_notification_list",
          api$ : (p2, m?: apiMethod, n?) => that._profile.notification_list(p2, m, n),
          isReadonly: true,
        },
        {
          label     : Core.Localize('notification_catalogue'),
          subTitle  : Core.Localize('notification_catalogue_desc'),
          icon      : 'pi pi-plus',
          gridId    : "profile_notification_catalogue",
          api$ : (p2, m?: apiMethod, n?) => that._profile.notification_catalogue(p2, m, n),
          formProperties: {eg_content_type: AppStatic.StandardForm['eg_content_type']},
          isReadonly: false,
        },
      ],
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  private _setNotificationConfigColDef(column, containerWrapper){
    let copyCol = [...column];
    if (this.gridListId == "profile_notification_catalogue"){
        copyCol.forEach((element, $index) => {
          if(element.colId == "id"){
            column[$index]['type'] = null;
            column[$index]['cellRenderer']  = (param: any) => {
              if(param && param.data?.id != null){
                return `<button  style=" background: transparent;
                                          outline: unset;
                                          border: 0px;"
                                  class="text-success cursor-pointer">
                          <i class="fa-solid fa-check-circle"></i>
                          <span class="ml-1">Subscribed</span>
                        </button>`
              }else{
                return   `<button style=" background: transparent;
                                          outline: unset;
                                          border: 0px;"
                                  class="text-danger cursor-pointer">
                            <i class="fa-solid fa-times-circle"></i>
                            <span class="ml-1">Not Subscribed</span>
                          </button>`
              }
            };
            column[$index]['cellClass']  = (param: any) => {
              if(param && param.data?.id != null){
                return `cursor-pointer`
              }else{
                return `cursor-pointer`
              }
            }
          } else {
            const _isDate = containerWrapper.gridFields?.find(_f => _f.field == element?.field)?.form == "date";
            column[$index]['type'] = [...[COLUMN_TYPE.EDITABLE_COLUMN],
              ...(_isDate ? [COLUMN_TYPE.DATE_COLUMN] : []),
              ...(element?.type ? (Array.isArray(element?.type) ? element?.type : [element?.type]) : [])
            ];
            //...(column[$index]['type'] ? (Array.isArray(column[$index]['type']) ? column[$index]['type'] : [column[$index]['type']]) : [])
          }
      });
    }
    return copyCol
  }

  ngOnDestroy(): void {}


}
