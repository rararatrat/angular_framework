import { Component, Input, TrackByFunction } from '@angular/core';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'eg-document-flow',
  templateUrl: './document-flow.component.html',
  styleUrls: ['./document-flow.component.scss']
})
export class DocumentFlowComponent {
  locale: any;
  dateFormat: string;
  constructor(private _ws: WrapperService){}
  
  @Input()
  relatedDocs: any[] = [];
  
  public onSelectionChange($event: MouseEvent,_t15: any) {}
  public trackByFn: TrackByFunction<any>;
  public cols: any[];
  public items: MenuItem[];
  public selected: any;

  ngOnInit(){
    this.cols = [
      {field: 'created_on', colId: 'date'},
      {field: 'name', colId: 'document'},
      {field: 'title', colId: 'title'},
      {field: 'currency', colId: 'currency', header: "name",},
      {field: 'total_w_tax', colId: 'gross'},
      {field: 'status', colId: 'status', header: "name",},
      {field: 'actions', colId: 'actions'},
    ];

    const _localeFormat = this._ws.coreService.getLocaleFormat();
    this.locale = _localeFormat._locale;
    this.dateFormat = _localeFormat._dateFormat;

    //console.log({rel: this.relatedDocs});
  }

  gotoPage(_data: any) {
    if(_data){
      const _redirectTo = _data.redirectTo || '/crm/sales';
      this._ws.helperService.gotoPage({pageName: `${_redirectTo}/${_data['type']}/${_data['id']}`, extraParams: {}, newTab: true});
    }
  }
}
