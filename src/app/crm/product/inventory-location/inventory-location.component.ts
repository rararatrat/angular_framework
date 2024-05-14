import { ChangeDetectionStrategy, Component, DoCheck, OnDestroy, OnInit, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { Core, GridResponse, ResponseObj } from '@eagna-io/core';
import { InventoryLocation } from './inventory-location';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Subscription, map } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ContentDisplayService } from '@library/content-display/content-display.service';
import { WrapperService } from '@library/service/wrapper.service';

@Component({
  selector: 'eg-inventory-location',
  /* templateUrl: './inventory-location.component.html',
  styleUrls: ['./inventory-location.component.scss'], */
  template: `<eg-grid-list #gridList [gridListId]="'grid-inventory-location'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryLocationComponent{
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form   : any =  InventoryLocation.getFormProperties(this);
  @ViewChild('gridList') gridList : GridListComponent;

  public data           : any;
  public isMapLoading   : boolean = true;
  public address        : any = [];
  private _subs         = new Subscription();
  private _countries    : any[];

  constructor(private _cs: ContentDisplayService, private _ws: WrapperService){
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._cs.crm.inventory_location(p, m, n).pipe(map((res: ResponseObj<GridResponse>) => {
        res.content?.fields?.push({address: "String", form: "address", field: "address", required: false});
        if(!this._ws.libraryService.checkGridEmptyFirstResult(res)){
          res.content.results = res.content.results.map(_data => {
            _data.address = {name: _data.name, bldgNumber: _data.bldgNumber, street: _data.street, city: _data.city, zipcode: _data.zipcode, state: _data.state, country: _data.country};
            return _data;
          })
        }
        return res;
      })),
      title : Core.Localize("stock_location"),
      formProperties: this.form['formProperties'],
      formStructure: this.form['formStructure'],
      noModalHeight: true,
      withDetailRoute: false,
    }
  }

  ngOnInit(){
    this._subs.add(this._cs.settings.getCountryCode().subscribe((res: any) => {
      this._countries = res;
    }));
  }

  ngOnDestroy(){
    this._subs.unsubscribe();
  }

  public onAddressChanged(_p: any, _formGroup: FormGroup){
    console.log({_p, _formGroup});

    _formGroup?.get('name')?.setValue(_p.data?.name)
    this.gridList?.container?.gridFields?.map(_f => _f.field)?.forEach(_field => {
      const _formControl = _formGroup?.get(_field);
      const _data = _p.data?.[_field];
      if(_data && _formControl && _field){
        if(_field != "country"){
          _formControl.setValue(_p.data[_field]);
        } else if(this._countries){
          const _countryData = this._countries.find(_c => _c.name==_data)
          if(_countryData){
            _formControl.setValue(_countryData);
          }
        }
      } 
    })
  }
}
