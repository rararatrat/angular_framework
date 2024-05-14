import { Component } from '@angular/core';
import { IStatusPanelAngularComp } from 'ag-grid-angular';
import { IStatusPanelParams } from 'ag-grid-community';
import { Position, PositionType } from '../position';
import { AppStatic } from 'src/app/app.static';
import { HelperService } from '@eagna-io/core';

@Component({
  selector: 'eg-position-statusbar',
  templateUrl: './position-statusbar.component.html',
  styleUrls: ['./position-statusbar.component.scss']
})
export class PositionStatusbarComponent implements IStatusPanelAngularComp {
getTaxTooltip(_item: any): string {
  return `Item: ${this._helperService.stripHtml(_item.text)}
    Tax: ${_item.tax?.name}
    `;
  }

  public params!: any;
  public eGui!: HTMLDivElement;
  public sum: number = 0;
  public sumWithTax: number = 0;
  public locale_saved: any = AppStatic.savedLocale;
  public taxableItems: any[] = [];

  constructor(private _helperService: HelperService){}

  agInit(params: IStatusPanelParams): void {
    this.params = params;
  }

  public computeTax(_eachData: any = {}){
    const _qty = _eachData.quantity*1;
    const _price = _eachData.unit_price*1;
    const _discount = Position.getDiscountAmount(_eachData, _price, _qty);
    const _orig_total = (_qty * _price);
    const _discounted_total = (_orig_total - _discount);
    //return {_qty,_price,_discount,_discounted_total, withTax: (_discounted_total * (_eachData.tax?.value * 0.01))};
    return (_discounted_total * (_eachData.tax?.value * 0.01));
  }

  private _computeSum(){
    //setTimeout(() => {
      const _firstData: any[] = (this.params?.anyParams?.firstData || []).filter(_data => !_data.is_optional); //RT compule only the top
      const _sorted = this._helperService.arraySortBy({arr: _firstData, byId: 'pos'});

      this.taxableItems = (_sorted || []).filter(_data => [PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(_data.type?.name) && _data.tax?.value > 0).map(_t => {
        _t.total_tax = this.computeTax(_t);
        return _t;
      });
      this.sum = Position.computeSum(_sorted);

      //then discount
      _sorted.filter(_data => _data.type?.name==PositionType.DISCOUNT_POSITION).forEach(_discountData => {
        if(_discountData.is_percentual){
          const _discountInPercent = ((_discountData?.value || 0) * 1);
          const _discount = this.sum * (0.01 * _discountInPercent)
          this.sum -= _discount;
        } else{
          this.sum -= ((_discountData?.value || 0) * 1);
        }
      });

      const _totalWithTax = this.taxableItems.reduce((total, current) => total + (current?.total_tax || 0), this.sum);
      this.sumWithTax = _totalWithTax;
    //});
  }

  ngDoCheck(){
    this._computeSum();
  }

  getGui() {
    return this.eGui;
  }
}
