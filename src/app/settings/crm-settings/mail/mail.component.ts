import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { SettingsService } from '../../settings.service';
import { Subscription, filter, map, pairwise, startWith, tap } from 'rxjs';
import { MailDetailComponent } from './mail-detail/mail-detail.component';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-mail',
  template: `<eg-grid-list #gridList *apploading="loading==true" [(gridListId)]="gridListId"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public title  : string =  Core.Localize('email_template');
  public gridListId : any = "email_templates_grid";
  private _subs = new Subscription();

  @ViewChild('gridList') gridList : GridListComponent;
  private _tabLoaded: boolean;
  loading = true;

  constructor(private _settings: SettingsService,
    private _ws: WrapperService,
    private _activatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _router: Router){
    this._subs.add(this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      pairwise(),
      ).subscribe((e: any[]) => {
        console.log({act: _activatedRoute});
        if(this._activatedRoute?.snapshot?.queryParams?.['isChanged'] == 'true' && this._activatedRoute?.snapshot?.queryParams?.['isDefault']=='true'){
          this.gridList?.grid?.refresh();
        }
    }));
  }
  fields: any[];

  ngOnInit(): void {
    this._initGridList();
  }

  private _initGridList(){
    let that = this;

    const _emailTemplateApi$ = (p, m, n?) => this._settings.email_templates(p, m, n);

    this.config = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  :  _emailTemplateApi$,
      title       : Core.Localize('email_template'),
      addEditComponent: MailDetailComponent,
      extendedGridDefOverride: {
        amendColDefs: (colDefs, gridResult) => {
          let _toReturn = colDefs;
          //if(this.gridList?.gridId == 'email_templates_grid'){
            _toReturn = _toReturn.filter(_col => !(['value'].includes(_col.field))).map(_col => {
              if(["id", "isDefault", "default_language"].includes(_col.field)){
                _col.hide = true;
              }
              if(_col.field == "eg_content_type"){
                _col.valueGetter = _p => {
                  return (_p.data?.eg_content_type?.model || _p.data?.eg_content_type?.name || '');
                }
                _col.headerName = "Type";
              }
              return _col;
            }).concat([{
              field: 'languages',
              valueFormatter: (_colDef) => {
                const _keys = Object.keys(_colDef.data?.value || {});
                if(_keys.length > 0){
                  return _keys.filter(_key => {
                    return this._ws.helperService.isNotEmpty(_colDef.data?.value?.[_key])
                  }).join(",");
                }
                return _colDef.data?.value;
              },
              filter: false
            }]);
          //}
          return this._ws.containerService._setGridStatusActionCols(this.config, _toReturn, this._activatedRoute);
        }
      },
      amendSubMenus: (_subMenus) => {
        if(!this.gridList || this.gridList?.gridId == 'email_templates_grid'){
          return _subMenus.filter(_m => _m.id != "view" && _m.id != "edit");
        }
        return _subMenus;
      },
      excludedMenus: ["view", "edit"],
      gridActionsColumnConfig: {enable: true},
      withDetailRoute: true,
      modalHeight: '95vh',
      addCallback: (p) => {
        if(p?.isConfirmed && this.gridList?.grid){
          this.gridList.grid.refresh();
        }
      },
    };
    setTimeout(() => {
      this.loading = false;
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {}

  /* chipLabelCallback(p: any, f: FormGroup) {
    //throw new Error("Method not implemented.");
    const _fContent = f.get('content');
    //_fContent?.setValue(`${_fContent?.value}<p>[${p?.value}]</p>`);
    if(this.gridList?.config.formProperties?.["content"]?.textArea){
      this.gridList.config.formProperties["content"].textArea.tinyMceConfig = {...this.gridList.config.formProperties["content"].textArea.tinyMceConfig, clearText: false};
      //this._cd.detectChanges();
    }
    _fContent?.setValue(`[${p?.value}]`);
  } */
}
