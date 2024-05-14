import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Core } from '@eagna-io/core';
import { IContainerWrapper, INoDataFound } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';

import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-no-data-found',
  templateUrl: './no-data-found.component.html',
  styleUrls: ['./no-data-found.component.scss']
})
export class NoDataFoundComponent implements OnInit, OnDestroy {
  @Input('config') config           : INoDataFound = null;

  private _subs     : SubSink = new SubSink();
  public  topic     : any;
  public  message   : any;
  public  action    : any;
  public  icon      : any = "fa-solid fa-database";
  public  hasCallback = false;


  constructor(private _wr: WrapperService){}

  ngOnInit(): void {
    this.topic        = (this.config?.topic != null)? this.config?.topic : "";
    this.message      = (this.config?.message != null || "") ? this.config?.message : this.config?.topic;
    this.action       = (this.config?.action != null) ? Core.Localize(this.config?.action || 'add', {item: Core.Localize((this.config?.topic || '').toLowerCase())})  : Core.Localize('add', {item: Core.Localize('data')});
    this.hasCallback  = this.config?.hasCallback;
    this.icon         = (this.config?.icon != null) ? this.config?.icon : this.icon;
  }

  callback(param){
    this.config?.callback(param);
  }

  addNewData()
  {
    const _fp = (this.config?.hasOwnProperty('formProp')) ?this.config?.formProp : null;
    const _fs = (this.config?.hasOwnProperty('formStruc')) ?this.config?.formStruc : null;
    this._subs.id("opt_cmp").sink = this.config?.api({}, "options").subscribe(
      {
        next : (res) => {
          const iContainerWrapper: IContainerWrapper = {
            apiService  : (p?, m?, n?) =>  this.config?.api(p, m),
            permission  : res.content.permission,
            gridFields  : res.content.fields,
            title       : this.topic,
            params      : (this.config?.params)?this.config?.params: null,
            noModalHeight: true,
            addCallback: (param) => {
              this.config?.callback(param);
            },
            formProperties: _fp,
            formStructure : _fs
          }
          this._wr.containerService.dialogAction('add', iContainerWrapper);
        },
        complete : () => {
          this._subs.id("opt_cmp").unsubscribe();
          this._wr.cdr.detectChanges();

        }
      }
    )
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
