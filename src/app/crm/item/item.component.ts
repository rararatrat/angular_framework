import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ComponentLookup, Core, GridResponse, ResponseObj, SubSink } from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from '../crm.service';
import { MenuItem, SortEvent } from 'primeng/api';
import { IContainerWrapper, objArrayType } from '@library/library.interface';
import { Item } from './item';
import { Table } from 'primeng/table';
import { FormGroup } from '@angular/forms';
import {CdkDragDrop, CdkDropList, CdkDrag, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import { Menu } from 'primeng/menu';
import { Position } from '../sales/position/position';

export type componentType = 'orders' | 'purchaseorder' | 'creditnotes' | 'invoices' | 'quotes' | /* 'deliverynotes' */ 'deliveries' | 'bills';

@ComponentLookup('ItemComponent')
@Component({
  selector: 'eg-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, OnDestroy {
  @ViewChild('itemTable') itemtable         : Table;

  @Input('perm') perm                       : any = null;
  @Output('permChange') permChange          : any = new EventEmitter();

  @Input('data') data                       : any = null;
  @Output('dataChange') dataChange          : any = new EventEmitter();

  @Input('product') product                 : any = null;
  @Output('productChange') productChange    : any = new EventEmitter();

  @Input() componentType: componentType = null;

  @Output('callback') callback : any = new EventEmitter();

  private _sel_action   : string = null;
  public config         : IContainerWrapper;
  public mode           : "edit" | "add" | "view" = "view";

  public positionMenu     : MenuItem[] = [];
  public position_items   : any[] = [];
  public item             : any = null;
  public taxGroup         : any = null;
  public total            : any = null;
  public visible          : boolean = false;
  public totalDetail      : boolean = false;

  public positionTypes = Position.typesValue;

  private _positionTypes  : any[] = Item.ITEM_POSITION_TYPE;
  private _positionURL    : string = null;

  private _cache_pos_items: any[] = [];

  @ViewChild('groupMenu') _menu: Menu;

  private _subs           : SubSink = new SubSink();
  private _posPermissions          : any;
  private _posGridFields           : any[];
  private _isDisabledMenu : boolean = false;
  private _itemProps: any;
  private _formProperties: objArrayType;
  private _iContainerWrapper: IContainerWrapper;
  public selectedGroup: any;
  private _droppedItem: any;
  public locale: string;
  taxSummary: { sum: number; sumWithTax: number; taxableItems: any[]; };
  taxedAmount = 0;
  
  /* public groupPositionMenu: MenuItem[]; */

  constructor(private _crm: CrmService,
              private _wr: WrapperService,
              public decimal: DecimalPipe,
              public percent: PercentPipe,
              private _cd: ChangeDetectorRef){}

  public noDropPredicate(drag: CdkDrag<any>, drop: CdkDropList<any>) {
    return true;
  }

  public toggleGroup($event: MouseEvent, _menu: Menu, _item: any) {
    _menu.toggle($event);
    
    if(_menu.visible){
      this.selectedGroup = _item;
    } else{
      this.selectedGroup = null;
    }
  }

  public toPercent(val){
    if(typeof(val) == "string"){
      val = parseFloat(val) / 100
    }else{
      val =  val / 100
    }
    return val;
  }

  public isEditable(){
    let disabled = true;
    if(this.data != null && this.data?.status){

      const _blocked = [ 'delivered', 'accepted', 'rejected', 'completed', 'partial'];
      const _allowed = ['draft','pending'];
      const _s = this.data.status.value

      if(!_s || _allowed.includes(_s) ){ //RT TODO
        disabled = false;
      }else if (_blocked.includes(_s)){
        disabled = true;
      }else {
        disabled = true;
      }
    } else{
      disabled = false;
    }
    this._isDisabledMenu = disabled;
    return disabled
  }

  /* private _mapExternalVar = {
    i: 1,
    j: 1,
    currentParent: 0,
    isChild: false,
    showPos: false
  };

  private _mapExternalPosition(_data, _index, _positions){
    this._mapExternalVar.isChild = false;
    const _processData = (isGroup = false) => {
      if(this._mapExternalVar.isChild){
        _data.external_pos = `${this._mapExternalVar.i}.${this._mapExternalVar.j})`;
        this._mapExternalVar.j++;

        if(this.isGroup(_positions?.[_index + 1])){
          this._mapExternalVar.i++;
        }
      } else{
        _data.external_pos = `${this._mapExternalVar.i}.`;
        // console.log(_positions?.[_index + 1]);
        if(!isGroup || _positions?.[_index + 1]?.parent != _data.id){
          this._mapExternalVar.i++;
        }
      }
    }
    
    if(!this.isPdf(_data)){
      if(this.isGroup(_data)){
        this._mapExternalVar.j = 1;
        if(_data.show_pos_nr){
          this._mapExternalVar.showPos = true;
          this._mapExternalVar.currentParent = _data.id;
        }
        _processData(true);
      } else{
        if(_data.parent > 0 && _data.parent == this._mapExternalVar.currentParent){
          this._mapExternalVar.isChild = true;
          //this._mapExternalVar.showPos = this._mapExternalVar.showPos;
        } else{
          this._mapExternalVar.j = 0;
          this._mapExternalVar.showPos = _data.show_pos_nr;
        }
        _processData(false);
      }
    }

    return _data;
  } */

  ngOnInit(): void {
    const _localeFormat = this._wr.coreService.getLocaleFormat();
    this.locale = _localeFormat._locale;

    this._formProperties = Item.getFormProperty(this);
    if(this.data != null || this.data != undefined){
      if(this.data.positions?.length > 0){
        Position.resetExternalPos();
        this.position_items   = this.sort(this.data.__data__.positions, 'internal_pos').map((_d, _idx, _arr) => Position.mapExternalPosition(_d, _idx, _arr));
        this._cache_pos_items = this.sort(this.data.__data__.positions, 'internal_pos');
        this.calcItemTax();
      }else{
        this.position_items   = [];
        this._cache_pos_items = [];
      }

    }else {
      this.position_items   = [];
      this._cache_pos_items = [];
    }
    this._initMenu();
    this._groupParentIdType();

    this.taxSummary = Position.getTotal(this.position_items, this._wr.helperService.arraySortBy);
    this.taxedAmount = (this.taxSummary.taxableItems || []).reduce((accumulator, currentValue) => accumulator + currentValue?.total_tax, 0);
    
    // console.log({taxedAmount: this.taxedAmount});

    //RT to subscribe only once instead of every opening the modal
    this._subs.id("getPositionFields").sink = this._crm[this._positionURL]?.({}, 'options')?.subscribe((res: ResponseObj<GridResponse>) => {
      this._posPermissions = res.content.permission;
      this._posGridFields = res.content.fields;
    });
  }

  public getPositionType(data){
    const _t = this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    return _t;
  }

  public isDiscount(data){
    const _groupPos = this._positionTypes.find(_p => _p.position_key == "discount_position");
    return _groupPos?.id == data.type.id;
  }

  public isGroup(data){
    const _groupPos = this._positionTypes.find(_p => _p.position_key == "group_position");
    return _groupPos?.id == data.type.id;
  }

  public isPdf(data){
    const _t = this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    return _t['id'] == 5;
  }
  public isText(data){
    const _t = this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    return _t['id'] == 4;
  }
  public isSubTotal(data){
    const _t = this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    return _t['id'] == 2;
  }

  computeSum(_data: any) {
    if((this.position_items || []).length > 0){
      const _positionData = this._wr.helperService.arraySortBy({arr: this.position_items, byId: 'internal_pos'}) 
      //initial to compute is the lineitem
      let _toSum = [_data];

      //if group, compute all the positions with parent id
      if(this.isGroup(_data)){
        const _parentId = _data.id;
        if(_parentId){
          _toSum = _positionData.filter(_res => _res.parent == _parentId);
        }
      }

      //if subtotal, compute all the positions with
      else if(this.isSubTotal(_data)){
        //_toSum = (this.positionsData || []).filter(_fData => (_fData.pos * 1) < (_data.pos * 1));
        _toSum = (_positionData || []).filter(_fData => (_fData.internal_pos * 1) < (_data.internal_pos * 1));
      }

      //for discount position
      else if(this.isDiscount(_data)){
        _toSum = (_positionData || []).filter(_fData =>  ((_fData.internal_pos * 1) < (_data.internal_pos * 1)));
        const _discount = Position.getOverAllDiscount(_data, _toSum);
        return (_discount * -1);
      }

      //const _toReturn = Position.computeSum(_toSum);
      const _toReturn = Position.computeSum(_toSum, {compute: this.isSubTotal(_data), belowPos: _data?.internal_pos});
      if(_toReturn >= 0){
        return _toReturn;
      }
    }
    return '';
  }

  private _initMenu(){
    this.isEditable();

    const _tPositionMenu = [];
    this._positionTypes.forEach(e => {
      let _translatedType = Core.Localize(e.name);
      if(_translatedType ==  `{translations.${e.name}}`){
        _translatedType = Core.Localize(e.position_key);
      }

      const _action = (e.position_key == "pdf_position") ? "add_pdf_position" : "add";
      const _type =  {
        id: e.position_key,
        label : _translatedType,
        icon  : 'fa-solid fa-plus',
        disabled : !this.perm?.update,
        command : (param) => {
          this._sel_action = e.position_key;
          const _title = Core.Localize('position_type', {type: _translatedType});
          const _groupParentId = ((this.selectedGroup?.id || 0)) * 1; // to make a copy
          setTimeout(() => {
            this.managePosition(_action,  this.data, _title, _groupParentId)
          });
        }
      };

      _tPositionMenu.push(_type)
    })

    this.positionMenu = _tPositionMenu;
    /* this.groupPositionMenu = this.positionMenu.filter(_p => !['group_position', 'discount_position'].includes(_p.id)) */
  }

  private _groupParentIdType(){
    switch(this.componentType){
      case 'orders':
        this._positionURL = "order_positions";
        return 'order_id';

      case 'purchaseorder':
        this._positionURL = "purchase_positions";
        return 'purchase_order_id';

      case 'creditnotes':
        this._positionURL = "order_positions";
        return 'credit_notes_id';

      case 'invoices':
        this._positionURL = "order_positions";
        return 'invoice_id';

      case 'quotes':
        this._positionURL = "sales_positions";
        return 'quote';

      case 'deliveries':
        this._positionURL = "order_positions";
        return 'delivery_id';

        case 'bills':
          this._positionURL = "purchase_positions";
          return 'bill_id';
    }
  }

  isPercentualChanged(p: any, _f: FormGroup<any>) {
    //console.log({p, _f});
    if(this._iContainerWrapper?.formProperties['value']?.numberConfig){
      this._iContainerWrapper.formProperties['value'].numberConfig.suffix = (p.value==true ? '%' : undefined);
    }
  }

  managePosition(action, data, title?, groupParentId?){
    switch(action){
      case "add":
          const _posType = this._positionTypes.filter(e => e.position_key == this._sel_action)[0];
          const _config : IContainerWrapper = {
            apiService: (p?, m?, n?) => this._crm?.[this._positionURL](p, m, n),
            title: title,
            params: {type: _posType['id'], [this._groupParentIdType()]:this.data?.id},
            formProperties: this._formProperties,
            formStructure: Item.getFormStructure(this._sel_action, this.mode)
          };
          this._addNewItem(_config, 'add', ['standard_position', 'product_position'].includes(this._sel_action) ? {unit: 'pc.'} : null, this._sel_action, groupParentId);
        break;

      case "add_pdf_position":
        const _posPdfType = this._positionTypes.filter(e => e.position_key == this._sel_action)[0];
        const _req = {
          [this._groupParentIdType()]:this.data.id,
          type:_posPdfType['id'],
          name:_posPdfType['name'],
          description:_posPdfType['name'],
          ...(groupParentId ? {parent: groupParentId} : {})
        }
        this._subs.id('pdf_pos').sink = this._crm?.[this._positionURL](_req, "put").subscribe(res => {
          this.data.__data__.positions = this.data.__data__.positions.concat(res.content.results);
          this.data.isChanged = true;
          this.position_items = this.data.__data__.positions;
          this._cd.detectChanges();
          this._subs.id("pdf_pos").unsubscribe();
        })
        break;


    }
  }

  public edit(data){
    const _pType= this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    this._sel_action = _pType['position_key'];

    const _config : IContainerWrapper = {
      apiService: (p?, m?, n?) => this._crm?.[this._positionURL](p, m, n),
      title: "hello",
      params: {id:data.id, [this._groupParentIdType()]:this.data?.id},
      formProperties: this._formProperties,
      formStructure: Item.getFormStructure(this._sel_action, this.mode)
    };
    this._addNewItem(_config, "edit", data)
  }

  public view(data){
    const _pType= this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    this._sel_action = _pType['position_key'];
    if(_pType['id'] != 5){
      const _config : IContainerWrapper = {
        apiService: (p?, m?, n?) => this._crm?.[this._positionURL](p, m, n),
        title: "hello",
        params: {id:data.id},
        formProperties: this._formProperties,
        formStructure: Item.getFormStructure(this._sel_action, this.mode)
      };
      this._addNewItem(_config, "view", data)
    }
  }

  public delete(data){
    const _pType= this._wr.libraryService.findObjectInArray(this._positionTypes, "position_key", data.type.position_key);
    this._sel_action = _pType['position_key'];
    const _config : IContainerWrapper = {
      apiService: (p?, m?, n?) => this._crm?.[this._positionURL]?.(p, m, n),
      title: "hello",
      params: {id:data.id, [this._groupParentIdType()]:this.data?.id},
      formProperties: this._formProperties,
      formStructure: Item.getFormStructure(data.type.name, this.mode)
    };
    this._addNewItem(_config, "delete", data)
  }

  public calculate(value, taxed?){
    return this._crm.calculate(value, taxed)
  }

  public calcItemTax(){
    let temp = this._crm.calcItemTax(this.position_items, this.data);
    this.total = temp['total'];
    this.taxGroup = temp['tax_group'];
  }

  public summaryCalc(isTax?:boolean){
    let _temp = this._crm.summaryCalc(this.position_items, isTax);
    return _temp
  }

  onDragStart($event: CdkDragStart<any>, _item: any) {
    this._droppedItem = _item;
  }

  public drop(event: CdkDragDrop<string[]>) {
    // console.log({drop: this._droppedItem});
    //if(!this.isDiscount(this.position_items?.[event.currentIndex])){
    if((!this.isDiscount(this.position_items?.[event.currentIndex]) || this.isSubTotal(this._droppedItem)) && !(this.isGroup(this._droppedItem) && this.position_items?.[event.currentIndex]?.parent > 0)){
      const _origItems = this.position_items.slice(0);
      if(this._droppedItem && this.isGroup(this._droppedItem)){
        /* _origItems.filter(_pos => _pos.parent == this._droppedItem.id).forEach((_pos, _i) => {
          const _currIndexofChild = _origItems?.findIndex(_pp => _pp.id==_pos.id);

          console.log({from: _currIndexofChild, to: (event.currentIndex + (_i + (event.currentIndex > event.previousIndex ? 0 : 1)))});
          //moveItemInArray(this.position_items, _currIndexofChild, (event.currentIndex + (_i + (event.currentIndex > event.previousIndex ? 0 : 1))));
          moveItemInArray(this.position_items, _currIndexofChild + ((event.currentIndex > event.previousIndex ? -1 : 0) ), (event.currentIndex + (_i +  (event.currentIndex > event.previousIndex ? 0 : 1))));
        });
        this._droppedItem = null; */
        const _parentId = this._droppedItem?.id;
        const _parentGroupMembers = this.data.__data__.positions?.filter(_d => _d?.parent == _parentId);
        const _nonParentGroupMembers = this.data.__data__.positions?.filter(_d => _d?.parent != _parentId && _d?.id != _parentId);

        const _left = _nonParentGroupMembers.slice(0, event.currentIndex);
        const _toInsert = [this._droppedItem, ..._parentGroupMembers];
        const _right = _nonParentGroupMembers.slice(event.currentIndex);

        this.data.__data__.positions = [..._left, ..._toInsert, ..._right];
        this.position_items   = this.data.__data__.positions;
        this._cache_pos_items = this.data.__data__.positions;
      } else {
        moveItemInArray(this.position_items, event.previousIndex, event.currentIndex);
      }
      this.reorderItems(this.position_items);
    }
    
  }

  public reorderItems(newOrder: any[]) {
    const items = this._cache_pos_items;

    const newPositionMap: { [key: number]: number } = {};

    // Populate newPositionMap with the internal_pos values from newOrder
    for (let i = 0; i < newOrder.length; i++) {
      newPositionMap[newOrder[i].id] = i;
    }

    // Sort items based on their new positions
    items.sort((a, b) => newPositionMap[a.id] - newPositionMap[b.id]);

    // Update internal_pos based on the new order
    for (let i = 0; i < items.length; i++) {
      items[i].internal_pos = i+1;
    }
    //this.itemtable.value  = items
    Position.resetExternalPos();
    this.position_items   = items.map((_d, _idx, _arr) => Position.mapExternalPosition(_d, _idx, _arr));
    const _test = [...items];
    const _cache_pos_items = _test.map(e => {return {"id": e.id, "internal_pos":e.internal_pos}})

    this._subs.id('updates').sink = this._crm?.[this._positionURL](_cache_pos_items,'patch').subscribe(res => {
      this.data.isChanged = true;
      this._subs.id('updates').unsubscribe();
      this._cd.detectChanges();
    });

    /* this._cd.detectChanges(); */
    //return items;
  }

  private _addNewItem(p: IContainerWrapper, mode: "view" | "add" | "edit" | "delete" = "add", item?, pos_type?: string, groupParentId?){
    // console.log({groupParentId, selectedGroup: this.selectedGroup, fields: this._posGridFields, fs: p.formStructure});
    this._iContainerWrapper = {
      apiService: p.apiService,
      permission: this._posPermissions,
      gridFields: this._posGridFields,
      title: p.title,
      params: ({...(p.params || {}), ...(groupParentId ? {parent: groupParentId} : {})}),
      noModalHeight: p.noModalHeight == true,
      addCallback: (p2) => {
        
        let _parentGroupIndex;
        if(groupParentId){
          _parentGroupIndex = this.data.__data__.positions?.findIndex(_d => _d?.id == groupParentId);
        }

        if(p2?.isConfirmed){
          if(mode == "add"){
            if(this.data != null || this.data != undefined){
              /* let's insert in between the new child */
              if(groupParentId && _parentGroupIndex >= 1){
                let _adjustIndex = 1;
                const _parentGroupMembersCount = this.data.__data__.positions?.filter(_d => _d?.parent == groupParentId)?.length || 0;
                const _left = this.data.__data__.positions?.slice?.(0, _parentGroupIndex + _adjustIndex + _parentGroupMembersCount);
                const _right = this.data.__data__.positions?.slice?.(_parentGroupIndex + _adjustIndex + _parentGroupMembersCount);
                const _inserted = [..._left, ...p2.apiData.results, ..._right];

                this.data.__data__.positions = _inserted;
              } else{
                this.data.__data__.positions = this.data.__data__.positions.concat(p2.apiData.results);
              }

              this.position_items   = this.data.__data__.positions;
              this._cache_pos_items = this.data.__data__.positions;

              this.reorderItems(this.position_items);
              this.calcItemTax();
              this._cd.detectChanges();
              this._subs.id("addNewItem").unsubscribe();
            }
          } else{
            this.position_items = this._wr.libraryService.updateObjectByIdInArray(this.position_items, p2.apiData.results[0], item.id)
            this.calcItemTax()
            this._cd.detectChanges();
            this._subs.id("addNewItem").unsubscribe();
          }

          this.callback.emit(p2.apiData.results[0]);
        }
      },
      deleteCallback: (p) => {
        this._wr.libraryService.spliceObjectFromArray(this.position_items, item, 'id');
        this.calcItemTax();
        this._cd.detectChanges();
        this._subs.id("addNewItem").unsubscribe();
      },
      ...(mode == 'add'? {initValue: {
          ...(['standard_position', 'product_position'].includes(pos_type) ? {
            is_percentual: true,
            show_pos_prices: true,
            unit: 'pc.'
          } : {}),
          show_pos_nr: true,
        }} : {}),
      ...(p.formProperties ? {formProperties: p.formProperties} : {}),
      ...(p.formStructure ? {formStructure: p.formStructure} : {}),
      ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
    } as IContainerWrapper;
    this._wr.containerService.dialogAction(mode, this._iContainerWrapper, item);
    //}));
  }

  public importProduct(data, formGroup:FormGroup){
    formGroup.get('unit')?.setValue(data['value'].unit)
    formGroup.get('unit_price')?.setValue(data['value'].sale_price)
    formGroup.get('text')?.setValue(
      `<p><b>${data['value'].name}</b><br>
      ${data['value'].description}<br><br>`
      )
    }

  initSort(data):any {
    data.sort((data1, data2) => {
      let value1 = data1['internal_pos'];
      let value2 = data2['internal_pos'];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return data;
    });
    return data;
  }

  public sorting(event){
    if(event.hasOwnProperty('multisortmeta')){
      const _sort = event['multisortmeta'][1]

      if(_sort['order'] == 1){
        this.itemtable.value.sort((a, b) => a[_sort['field']] - b[_sort['field']]);
      }else{
        this.itemtable.value.sort((a, b) => b[_sort['field']] - a[_sort['field']]);
      }
    }
  }

  public sort(data, field, order:'asc'|'desc'='asc', type?){
    if(order == 'asc'){
      data.sort((a, b) => a[field] - b[field]);
    }else{
      data.sort((a, b) => b[field] - a[field]);
    }
    return data;
  }


  ngAfterViewInit(){
    if(this._menu){
      this._subs.sink = this._menu.onHide.subscribe(e => {
        this.selectedGroup = null;
      });
    }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
