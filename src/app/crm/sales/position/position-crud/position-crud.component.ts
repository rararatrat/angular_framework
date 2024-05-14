import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Position, PositionType } from '../position';
import { FormBuilder } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from 'src/app/crm/crm.service';
import { Subscription, map, tap } from 'rxjs';
import { GridResponse, ResponseObj } from '@eagna-io/core';

@Component({
  selector: 'eg-position-crud',
  templateUrl: './position-crud.component.html',
  styleUrls: ['./position-crud.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionCrudComponent implements  ICellRendererAngularComp, OnDestroy{

  @Output('callback')callback : any = new EventEmitter();

  public form           : any;
  public config         : DetailsContainerConfig = null;
  public detailsConfig  : DetailsConfig;
  public files              : { [file_name: string]: File[]; } = {};
  public isChanged          : boolean;
  public mode               : "edit" | "add" | "view" = "add";
  public  isLoading         : boolean = true;
  public data               : any = null;
  private _type               : any;
  public newProduct         : any;
  private _sub              = new Subscription();
  public total_sum          = 0;

  public positionType       = PositionType;

  constructor(  private _fb: FormBuilder,
                private _wr: WrapperService,
                private _crmService: CrmService,
                private _cd : ChangeDetectorRef){
                }
  public firstRecord!: any;
  public params : any;

  agInit(params): void {
    this.params = params;
    this.firstRecord = params?.data;
    this.mode = params.mode;
    this.data = params.inputData;
    this.form = Position.getFormProperties(this);
    this.initDetailsContainer((this.mode == "add") ? null : params?.data?.id);
    //this._type = params.data?.type?.name || params?.type;
    this._type = params?.type;

    /* console.log({data: this.data, params}); */
  }

  typeOf(param){
    return typeof(param)
  }

  initDetailsContainer(itemId) {
    let _printOnce = false;
    this.config = {
      hasHeader     : false,
      header        : null,
      subheader     : null,
      dialogConfig  : null,
      dialogRef     : null,
      /*data          : this.params?.data,
      itemId        : (this.id || this._activatedRoute?.snapshot?.params?.['id']), */
      itemId        : (itemId)? itemId : null,
      detailsApi$    : (param, method, nextUrl)   =>  {
        //_updateParam = param;
        return this._crmService.sales_positions(param, method, nextUrl).pipe(map((res: ResponseObj<GridResponse>) => {
          res.content.fields = res.content.fields.concat(
              {article: "Number", form: "autocomplete", field: "product", required: false},
              {discount_type: "String", form: "radio", field: "discount_type", required: true}
          );
          return res;
        }), tap(res => {
          if(method == 'patch'){
            const _newData = res?.content?.results?.[0];
            if(_newData){
              this.params?.node?.parent?.setData?.(_newData);
              //this.params?.api.refreshCells({rows: [this.params?.node?.parent]}, true)
              //this.params?.api?.refreshToolPanel?.();
              this.params?.refreshStatusBar?.();

              if(param.hasOwnProperty('is_optional')){
                this._wr.helperService.gotoPage({extraParams: {}});
              }
            }
          }
        }));
      },
      paramUpdate   : (p1, p2) => {
        console.log({p1, p2, detailsData: this.detailsConfig?.data});

        if(p2 == 'is_optional' && this.detailsConfig?.data?.type?.name == PositionType.GROUP_POSITION){
          const _parentId = this.detailsConfig?.data?.id;
          const _toUpdate = (this.params?.anyParams?.firstData || []).filter(_data => _data.parent == _parentId);
          if(_toUpdate.length > 0 && p1){
            const _toReturn = [{id: p1.id, is_optional: p1.is_optional}].concat(_toUpdate.map(_data => ({id: _data.id, is_optional: p1.is_optional})));
            return _toReturn;
          }
        }
        return p1;
      },
      hasUpdates    : false,
      hasComments   : false,
      hasLogs       : false,
      formProperty  : {
        formProperties  : this.form['formProperties'],
        formStructure   : this.form['formStructure'],
        mode            : this.mode
      },
      onApiComplete: () => {
        this._sub.add(this.detailsConfig.formGroup?.get("product").valueChanges.subscribe((newValue) => {
          this.importProduct({rawData: newValue});
        }));

        if(this.params.type == PositionType.DISCOUNT_POSITION){
          if(this.detailsConfig?.data.is_percentual === true){
            /* this.detailsConfig.formGroup.get('discount_type')?.setValue({id: 1, label: 'Percentage'}); */
            this.detailsConfig.formGroup.get('discount_type')?.setValue(1);
            this.detailsConfig.config.formProperty.formProperties['value'].numberConfig.suffix = "%";
          } else if(this.detailsConfig?.data.is_percentual === false){
            /* this.detailsConfig.formGroup.get('discount_type')?.setValue({id: 2, label: 'Amount'}); */
            this.detailsConfig.formGroup.get('discount_type')?.setValue(2);
            this.detailsConfig.config.formProperty.formProperties['value'].numberConfig.suffix = "";
          }

          this._sub.add(this.detailsConfig.formGroup.get('discount_type')?.valueChanges.subscribe((newValue) => {
            if(this.detailsConfig.config.formProperty.formProperties['value'].numberConfig){
              //if(newValue.id == 1){
              if(newValue == 1){
                this.detailsConfig.config.formProperty.formProperties['value'].numberConfig.suffix = "%";
              } else{
                this.detailsConfig.config.formProperty.formProperties['value'].numberConfig.suffix = "";
              }
            }
          }));
          this.detailsConfig.triggerChangeDetection();
        }
      }
    };
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr:this._cd});
    setTimeout(() => {
      this._computeSum();
    })
  }

  setThem(){
    /* const _index = this._type == 'Standard Position' ? 1 : 0; */
    let form    = this.detailsConfig.formGroup.getRawValue();
    const param = {}
    Object.keys(form).forEach(key => {
      const isExists = this._wr.libraryService.valueInMatrix(this.form['formStructure'][0]?.['fields'], key);

      if(isExists && form[key]){
        if(typeof(form[key]) == "object"){
          param[key] = form[key]['id']
        }else {
          param[key] = form[key];
        }
      } else if(form[key]){
        param[key] = form[key]?.id || form[key];
      } else if(typeof form[key] == 'boolean'){
        param[key] = form[key] == true;
      } else {
        //TODO
      }
    });

    /* Test */
    /* if(!param['discount_total']){
      param['discount_total'] = 10;
    }
    if(!param['total_sum']){
      param['total_sum'] = 10;
    }
    if(!param['discount_in_percent']){
      param['discount_in_percent'] = 10;
    }
    if(!param['unit_price']){
      param['unit_price'] = 10;
    }
    if(!param['account']){
      param['account'] = 1;
    }
    if(!param['tax']){
      param['tax'] = 1;
    } */
    /* End Test */

    if(param.hasOwnProperty('discount_type')){
      if(param?.['discount_type'] == 1){
        param['is_percentual'] = true;
      } else{
        param['is_percentual'] = false;
      }
      delete param['discount_type'];
    }

    switch(this.mode){
      case "add":
        param['quote']=this.data.id;

        this._api("put", param);
        break;

      case "edit":
        param['id']             = this.params?.data?.id;
        this._api("patch", param);
        break;

      default:
        this.delete();
        break;
    }
  }

  add(){}

  update(){
    let form    = this.detailsConfig.formGroup.getRawValue();
    const param = {}

    Object.keys(form).forEach(key => {
      const isExists = this._wr.libraryService.valueInMatrix(this.form['formStructure'][1]['fields'], key);
      if(isExists){
        if(typeof(form[key]) == "object"){
          param[key] = form[key]['id']
        }else {
          param[key] = form[key];
        }
      }
    });
    param['id']             = this.params?.data?.id;
    /* param['discount_total'] = 10;
    param['total_sum']      = 10; */
  }

  delete(){ }

  /* public getGridApiAllData(api, filterFunc?: (a, b?, c?) => boolean): any[]{
    const _data: any[] = [];
    let _i = 0;
    api?.forEachNode(_node => {
      if(!filterFunc || filterFunc(_node, _i++)){
        _data.push(_node.data);
      }
    });
    return _data;
  } */

  private _api(method, param, parentIndex?){
    //let _rowCount = this.params?.api.getDisplayedRowCount();
    //let _rowCount = this.params.api.getRenderedNodes().filter(_node => _node.data?.type?.name != PositionType.DISCOUNT_POSITION).length;
    const _allData = Position.getGridApiAllData(this.params?.api);
    const _rowCount = _allData.filter(_data => _data?.type?.name != PositionType.DISCOUNT_POSITION).length;

    //let _rowCount = .getRenderedNodes().filter(_node => _node.data?.type?.name != PositionType.DISCOUNT_POSITION).length;
    //let _lastNode = this.params?.api.getDisplayedRowAtIndex(_rowCount-3); //to get the node above the parent and collapsed
    let _lastNode = this.params?.api.getDisplayedRowAtIndex(_rowCount-2); //have to deduct 1

    param.type = 1;
    const newType = this.params?.positionTypes.find(_pos => _pos.name == this._type);
    if(newType?.id){
      param.type = newType?.id;
    }

    let _newPos = _lastNode?.data?.pos || 1;
    console.log({params: this.params})
    if(this.params.parentNode){
      param.parent = this.params.parentNode?.id;
      _newPos = this.params.parentNode?.pos || 1;

      //if parent has 1 or more child, find the last child
      const _findLastChild = (this.params.api.getRenderedNodes() || []).filter(val => val.data?.parent == this.params.parentNode?.id).reverse()[0];
      if(_findLastChild){
        _newPos = _findLastChild?.data.pos;
      }
    }

    if(_newPos){
      const _parent = _newPos * 1;
      const _child = _newPos % 1;

      if(!this.params.parentNode?.id){
        _newPos = ((_parent) - (_child)) + 1;
      } else{
        _newPos = ((_parent - _child) + ((_child * 1) + 0.01));
      }
      if(this.params?.mode == "add"){
        param.pos = this._wr.helperService.pipeDecimal(_newPos, "en", ".1");
      }
    }

    this.detailsConfig.isLoading = true;
    this._cd.detectChanges();

    let _cacheData = null;

    const discountItems = _allData.filter(_data => _data?.type?.name == PositionType.DISCOUNT_POSITION);
    this._sub.add(this._crmService.sales_positions(param, method).subscribe({
      next : (res) => {
        this.params.onClick(method, res.content.results[0]);
        _cacheData = (this.params.anyParams?.firstData || []).concat(res.content.results)


      },
      complete : () => {
        if(this._wr.helperService.isNotEmpty(discountItems)){
          this._crmService.sales_positions(discountItems.map(_data => ({id: _data.id, pos: ((_data.pos * 1) + 1)})), 'patch').subscribe(res2 => {
            this.detailsConfig.isLoading = false;

            this._cd.detectChanges();
            //this._wr.helperService.gotoPage({extraParams: {}});
          });
        } else{
          if(_cacheData != null){

            this.params.api.setRowData(_cacheData)
            this.params.api?.refreshCells({columns: ['id'], force: true});
            this.params.refreshStatusBar();

            this.detailsConfig.isLoading = false;
            this.params.reInitGrid("jellybeadb");
            this._cd.detectChanges();
          }
          //this._wr.helperService.gotoPage({extraParams: {}});
        }

      },
      error : (err) => {
        this.detailsConfig.isLoading = false;
        this._cd.detectChanges();
      },
    }));
  }


  close(){
    this.params.onClose(this.mode);
  }

  // called when the cell is refreshed
  refresh(params: any): boolean {
    return false;
  }

  afterSaved(isChanged){}

  importProduct(p) {
    this.newProduct = p.rawData;
    const _amt = this.detailsConfig.formGroup?.get('amount')?.value;
    this.params.type = "Standard Position";
    this.form = Position.getFormProperties(this);
    setTimeout(() => {
      this.detailsConfig.formGroup?.get('text')?.setValue(`<p><b>${this.newProduct?.name}</b><br>
${this.newProduct?.description}<br><br>

${this.newProduct?.html_text}
</p>`);

      this.detailsConfig.formGroup?.get('unit')?.setValue(this.newProduct?.unit);
      this.detailsConfig.formGroup?.get('amount')?.setValue(_amt);
      this.detailsConfig.formGroup?.get('unit_price')?.setValue(this.newProduct?.sale_price);
    });
  }

  private _computeSum(){
    let _dataToCompute;
    if(this.params?.mode != 'view'){
      if (this.detailsConfig?.formGroup){
        _dataToCompute = {...this.detailsConfig.formGroup.getRawValue(), type: {name: PositionType.STANDARD_POSITION}}; //RT To Revisit type
      }
    } else{
      _dataToCompute = this.params?.data;
    }
    if(_dataToCompute){
      this.total_sum = Position.computeSum([_dataToCompute]);
    }
  }

  ngDoCheck(){
    this._computeSum();
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }

}
