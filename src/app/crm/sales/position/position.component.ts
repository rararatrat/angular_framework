import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { CrmService } from '../../crm.service';
import { IContainerWrapper } from '@library/library.interface';
import { COLUMN_TYPE, CellCustomActions, ComponentLookup, Core, ExtendedGridDefinition, GridResponse, ResponseObj, SubSink} from '@eagna-io/core';
import { Position, PositionType } from './position';
import { WrapperService } from '@library/service/wrapper.service';
import { StatusPanelDef } from 'ag-grid-community';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
/* import { PositionCrudComponent } from './position-crud/position-crud.component'; */
/* import { PositionStatusbarComponent } from './position-statusbar/position-statusbar.component'; */
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Subscription, map, tap } from 'rxjs';
import { FirstDataRenderedEvent } from 'ag-grid-community';
import { DecimalPipe } from '@angular/common';
import { AppStatic } from 'src/app/app.static';
import { FormGroup } from '@angular/forms';
/* import { deepEqual } from 'ts-deep-equal' */
export type cmptType = 'orders' | 'purchaseorder' | 'creditnotes' | 'invoices' | 'quotes' | 'deliveries' /* 'deliverynotes' */;

@ComponentLookup('SalesPositionComponent')
@Component({
  selector: 'eg-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class PositionComponent{

  //@Input('type') type                       : "quote" | "order" | "invoice" | "credit_note";
  @Input("fuck") fuck : any  = "asdasd";

  @Input('data') data                       : any = null;
  @Output('dataChange') dataChange          : any = new EventEmitter();

  @Input('product') product                 : any = null;
  @Output('productChange') productChange    : any = new EventEmitter();

  @Output('callback') callback : any = new EventEmitter();

  @ViewChild('gridList') gridList: GridListComponent;
  @ViewChild('gridList2') gridList2: GridListComponent;

  @Input() componentType: cmptType = 'quotes';


  constructor(private _crm: CrmService,
              private _wr: WrapperService,
              private _decimal: DecimalPipe,
              private _cd: ChangeDetectorRef,
              private _renderer: Renderer2){
              this._positionURL = (this.componentType == "quotes") ? "sales_positions" : "order_positions";
              }

  public viewType       : "list" | "grid" | "stats" = "grid";
  public config         : IContainerWrapper;

  public params         : any = {};
  public form           : any;

  public newType        : any = "Group Position";
  public mode           : "edit" | "add" | "view" = "view";

  public StatusPanelDef : StatusPanelDef[];

  /* Grid row expanding/collapsing */
  public nodeExpanded   : boolean = false;
  private _toExpand     : boolean = false;
  private _expanding    : boolean = false;
  private _isRendered   : boolean = false;

  public draftInProgress  : boolean = true;
  public activeNode       : any;

  private _positionTypes  : any[] = [];
  private _sub              = new Subscription();

  public items : MenuItem[] = [];

  public positionMenu : MenuItem[] = [];
  private _sel_action : string = null;

  private _subs : SubSink = new SubSink();
  private _positionURL : string = null;


  public parentNode: any;
  private _anyParams = {
    firstData: [],
    refresh: false
  };

  public locale_saved: any = AppStatic.savedLocale;
  public grid2 = {
    rowData: [],
    dataIsSet: false,
    configuring: false,
    loaded: false
  };

  public isLoading = false;

  public get extendedGridDefn() {
    let _dataRollback = [];
    let retvar : ExtendedGridDefinition = {
      /* isRowMaster: p => p?.type?.name != 'PDF Position', */
      amendColDefs : (colDefs, _firstResult) => {
        /* Settign the Columns */
        const _visibleCol = ['type', 'id', 'text', 'quantity', 'unit_price', 'unit', 'discount_in_percent', 'total_sum'];
        colDefs.forEach(_col => {
          if(!_visibleCol.includes(_col.field) ){
            _col.hide = true;
          }

          if(_col && _col.field == "id"){
            _col.rowDrag = (p) => true;
            //_col.rowDrag = (p) => p.data?.type?.name != PositionType.DISCOUNT_POSITION;
            _col.cellRenderer = 'agGroupCellRenderer';
            _col.headerName = Core.Localize('item');
            _col.valueFormatter = p => {
              let _act = p.data?.actual_position;
              if(_act > 0){
                if(_act % 1 >= 0 && _act % 1 < 0.10){
                  _act = _act - (_act % 1) + ((_act % 1) * 10);
                  if(_act % 1 > 0){
                    return this._decimal.transform(_act, "0.1");
                  }
                  return this._decimal.transform(_act, "0.0");
                } else if(_act % 1 >= 0.10){
                  return this._decimal.transform(_act, "0.2")
                }
              }
              return ''
            };
          } else if(_col.field == 'parent'){
            _col.type = COLUMN_TYPE.EDITABLE_COLUMN;
          } else if(_col.field == 'total_sum'){
            _col.valueGetter = p => {
              const _data = p?.data;
              if(_data){
                if([PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION, PositionType.GROUP_POSITION, PositionType.SUBTOTAL_POSITION].includes(_data.type?.name)){
                  let _toSum = [_data];
                  if(_data.type?.name == PositionType.GROUP_POSITION){
                    /* let _group_sum = 0; */
                    const _parentId = _data.id;
                    if(_parentId){
                      _toSum = _firstResult.results.filter(_res => _res.parent == _parentId /* && [PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(_res.type?.name) */);
                    }

                    /* return _group_sum; */
                  }

                  if(_data.type?.name == PositionType.SUBTOTAL_POSITION){
                    _toSum = (_firstResult.results || []).filter(_fData => (_fData.pos * 1) < (_data.pos * 1));
                  }

                  return Position.computeSum(_toSum);
                } else if(_data.type?.name == PositionType.DISCOUNT_POSITION){
                  const _discount = Position.getOverAllDiscount(_data, _firstResult.results);
                  return (_discount * -1);
                }
              }

              return '';
            };
            if(this.nodeExpanded){
              _col.wrapText = true;
              _col.autoHeight = true;
            }
            _col.cellRenderer = p => {
              let _toReturn = p.value;
              if(_toReturn != ''){
                _toReturn = this._decimal.transform(_toReturn, "0.2", this.locale_saved);
                if(this.nodeExpanded){
                  const _grossP = Core.Localize('grossProceeds')
                  if([PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(p.data?.type?.name)){
                    _toReturn = `${_toReturn}
                    <div style='font-size: 9.5px' title="${_grossP}">${_grossP}</div>`
                  }
                }
              }

              return _toReturn;
            }

            _col.headerName = Core.Localize('priceInCurrency', {currency: this.data?.currency?.name});
            _col.cellClass = 'text-right';
            //_col.width = 134;
            _col.flex = 1;
            _col.pinned = 'right';
            //_col.headerClass = 'text-right';
          } else if(_col.field == 'discount_in_percent'){
            _col.valueGetter = (p) => {
              const _data = p.data;
              if(_data){
                if((_data.type?.name == PositionType.DISCOUNT_POSITION && _data.is_percentual)){
                  return (_data.value * 1) + '%';
                } else if([PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(p.data?.type?.name) && (_data.discount_in_percent * 1) > 0){
                  return (_data.discount_in_percent * 1) + '%';
                }
              }
              return '';
            };
            _col.headerName = Core.Localize('discount');
            _col.cellClass = 'text-right';
            _col.pinned = 'right';
          } else if(_col.field == 'unit_price'){
            if(this.nodeExpanded){
              _col.wrapText = true;
              _col.autoHeight = true;
            }
            _col.cellRenderer = p => {
              let _toReturn = p.value;
              if(_toReturn != '' && this.nodeExpanded){
                if([PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(p.data?.type?.name) && p.data?.tax){
                  _toReturn = `${_toReturn}
                  <div style='font-size: 9.5px'>${this._decimal.transform((p.data.tax?.value || 0), "0.2", this.locale_saved)}%</div>`
                }
              }

              return _toReturn;
            }

            _col.headerName = Core.Localize('individualPrice');
            _col.cellClass = 'text-right';
            _col.pinned = 'right';
          } else if(_col.field == 'unit'){
            _col.pinned = 'right';
          } else if(_col.field == 'quantity'){
            _col.headerName = Core.Localize('qty');
            _col.cellClass = 'text-right';
            _col.pinned = 'right';
          } else if(_col.field == 'text'){
            _col.headerName = Core.Localize('description');
            if(this.nodeExpanded){
              _col.wrapText = true;
              _col.autoHeight = true;

              _col.cellRenderer = p => {
                if(p.data?.type?.name == PositionType.PDF_POSITION){
                  return Core.Localize('pdfPagebreak');
                }
                const _div1 = this._renderer.createElement('div');
                // const _html = this._renderer.createText(p.value);
                // console.log({_div1, _html})
                // this._renderer.appendChild(_div1, _html)
                if(_div1){
                  _div1.innerHTML = p.value;
                  _div1.style = 'white-space: pre-wrap';
                }
                return _div1;
                /* return `<div innerHTML="${p.value}" style='white-space: pre-wrap'></div>`; */
              };
            } else {
              _col.valueFormatter = p => {
                return this._wr.helperService.stripHtml(p.value || '');
              }
            }
            _col.flex = 1;
          }
        });

        //colDefs = this._ws.containerService._setGridStatusActionCols(this.config, colDefs, null)

        colDefs.unshift({
          field: "",
          cellRenderer: 'cellCustom',
          width: 40,
          pinned: 'left',
          hide: false,
          cellClass: (p) => 'text-center full-width full-height text-primary bg-primary-faded font-bold  cursor-pointer',
          cellRendererParams: (p: any) => {
            if(p /* && p.data?.type?.name?.toLowerCase() != "pdf position" */){ //p?.data?.[param?.statusField]?.name || p?.data?.[param?.statusField]
              let _actions : CellCustomActions[] = [
                {
                  colId: "action_view",
                  isHidden: false,
                  //icon : "fa-solid fa-info-circle",
                  icon: p => {
                    switch(p.data?.type?.name){
                      case PositionType.PRODUCT_POSITION:
                        return PrimeIcons.SHOPPING_CART;
                      case PositionType.STANDARD_POSITION:
                        return PrimeIcons.BOX;
                      case PositionType.TEXT_POSITION:
                        return PrimeIcons.ALIGN_JUSTIFY;
                      case PositionType.GROUP_POSITION:
                        return PrimeIcons.TABLE;
                      case PositionType.DISCOUNT_POSITION:
                        return PrimeIcons.MINUS;
                      case PositionType.SUBTOTAL_POSITION:
                        return PrimeIcons.DOLLAR;
                      case PositionType.PDF_POSITION:
                        return PrimeIcons.FILE_PDF;
                      default:
                        return "fa-solid fa-info-circle";
                    }
                  },
                  title: p => p.data?.type?.name || '',
                  iconClass : "pt-2 text-primary",
                  iconStyle: {'font-size': '14px !important'},
                  clickCallback : (event, params) => {
                    if(params){
                      this.mode = "view";
                      this.activeNode = params.node;
                      params.node.setExpanded(!params.node.expanded);
                    }
                  },

                }
              ]
              return {actions:  _actions};
            }
            return {};
          },
          filterValueGetter: p => (p.data?.type?.name || '')
        },
        {
          field: "",
          cellRenderer: 'cellCustom',
          width: 40,
          pinned: 'left',
          hide: false,
          cellClass: (p) => 'text-center full-width full-height bg-danger-faded text-danger font-bold  cursor-pointer',
          cellRendererParams: (p: any) => {
            if(p){
              let _actions : CellCustomActions[] = [
                {
                  colId     : "action_delete",
                  isHidden  : false,
                  icon      : (params) => {
                    if(params && params.data){
                      if(this.draftInProgress){
                        return   "fa-solid fa-ban text-gray cursor-wait";
                      }else{
                        return   "fa-solid fa-trash";
                      }
                    }else{
                      return "";
                    }
                  },
                  clickCallback : (event, params) => {
                    params.api.applyTransaction({remove:[params.data]});
                    this.manageFromGrid('delete', params.data);
                    //;

                  },
                }
              ]
              return {actions:  _actions};
            }
            return {};
          }
        },
        {
          field: "",
          cellRenderer: 'cellCustom',
          width: 40,
          pinned: 'left',
          hide: false,
          cellClass: (p) => 'text-center full-width full-height bg-warn-faded text-warn font-bold cursor-pointer',
          cellRendererParams: (p: any) => {
            if(p /* && p.data?.type?.name?.toLowerCase() != "pdf position" */){ //p?.data?.[param?.statusField]?.name || p?.data?.[param?.statusField]
              let _actions : CellCustomActions[] = [
                {
                  colId     : "action_edit",
                  isHidden  : false,
                  icon      : (params) => {
                    if(params && params.data ){
                      if(this.draftInProgress){
                        return   "fa-solid fa-ban text-gray cursor-wait";
                      }else{
                        return   "fa-solid fa-pencil";
                      }
                    }else{
                      return "";
                    }
                  },
                  clickCallback : (event, params) => {
                    if(params){
                      this.mode = "edit";
                      this.activeNode = params.node;
                      params.node.setExpanded(!params.node.expanded);
                      this.draftInProgress = params.node.expanded
                    }
                  },
                }
              ]
              return {actions:  _actions};
            }
            return {};
          }
        },{
          field: "",
          cellRenderer: 'cellCustom',
          width: 70,
          pinned: 'left',
          hide: false,
          cellClass: (params) =>{
            {
              if(params && params.data && params.data.type?.name?.toLowerCase() == "group position"){
                return 'text-center full-width full-height bg-success-faded text-success font-bold  cursor-pointer';
              }else{
                return "bg-plain-faded";
              }
            }
          },
          cellRendererParams: (p: any) => {
            if(p && p.data?.type?.name?.toLowerCase() == "group position"){ //p?.data?.[param?.statusField]?.name || p?.data?.[param?.statusField]
              let _actions : CellCustomActions[] = [
                {
                  colId     : "action_add",
                  isHidden  : false,
                  isMulti   : true,
                  menuItems : [...[
                      { label: 'Standard Position',
                        icon: PrimeIcons.BOX,
                        clickCallback: (pp) => {
                          this.add('Standard Position', p .node?.rowIndex, p.data);
                        }
                      },
                      { label: 'Product Position',
                        icon: PrimeIcons.SHOPPING_CART,
                        clickCallback: (pp) => {
                          this.add('Product Position', p.node?.rowIndex, p.data);
                        }
                      }
                    ],
                    ...[{...this.items?.[0], clickCallback: (pp) => {
                      this.items?.[0]?.command?.({item: {state: {rowIndex: p.node?.rowIndex, parentNode: p.data}}});
                    }}],
                    ...this.items.slice(3,5).map(_item => ({..._item, clickCallback: (pp) => {
                      _item?.command?.({item: {state: {rowIndex: p.node?.rowIndex, parentNode: p.data}}});
                    }}))
                  ],
                  icon      : (params) => {
                    if(this.draftInProgress){
                      return   "fa-solid fa-ban text-gray cursor-wait";
                    }else{
                      return   "fa-solid fa-plus-circle";
                    }
                  },
                  /* clickCallback : (event, params) => {
                    this.mode = "add";
                    if(params && params.data && params.data.type.name.toLowerCase() == "group position"){

                      this.newType = params.data.type.name;
                      if(!this.draftInProgress){
                        this.add(params.data.type.name, params.node.rowIndex, params.data?.id);
                        this.draftInProgress = true;
                      }

                    }
                  }, */
                }
              ]
              return {actions:  _actions};
            }
            return {};
          }
        }
        )
        return colDefs
      },
      alignedGrids: [],
      suppressMoveWhenRowDragging : false,
      rowDragEntireRow            : true,
      rowDragManaged              : true,
      animateRows                 : true,
      /* rowDragMultiRow             : true, */
      serverSideInfiniteScroll    : false,
      pagination                  : false,
      rowSelection                : "multiple",
      masterDetail                : true,
      /* detailCellRenderer          : PositionCrudComponent, */
      onRowGroupOpened            : (event) => {
        //onClose(this.mode)
        if(!event?.expanded){
          this.draftInProgress = false;
          this.mode = 'view';
          /* if(event.data?.id){
            this.gridList?.grid?.refresh({redrawRows: {refreshWithIds: [event.data.id]}});
          } */
        }
      },
      getRowId: p => p.data?.id,
      onDragStarted: (event) => {
        _dataRollback = Position.getGridApiAllData(event.api).slice(0);
        //_dataRollback = event.api?.getRenderedNodes().map(_node => _node.data);
      },
      /* onRowDragEnter: (event) => {console.log({onRowDragEnter: event, node: event.node});}, */
      onRowDragEnd                : (event) => {
        if(event && event.node){
          let _newNodes = [];
          //const _renderedNodes = event.api.getRenderedNodes();
          const _renderedNodes = Position.getGridApiAllData(event.api, false);
          //console.log({_renderedNodes});

          let isChildMoved = false;
          const currIndex = event.node.rowIndex;
          let _j = 1;

          const _newParentId = _renderedNodes[currIndex-1]?.data?.parent || _renderedNodes[currIndex-1]?.data?.id;
          let _newParent = _renderedNodes.find(_r => _r.data?.id == _newParentId)?.data;

          if((event.node?.data?.type?.name != PositionType.DISCOUNT_POSITION &&  _newParent?.type?.name != PositionType.DISCOUNT_POSITION) ||
            (event.node?.data?.type?.name == PositionType.DISCOUNT_POSITION &&  _newParent?.type?.name == PositionType.DISCOUNT_POSITION)){
          /* if((![PositionType.DISCOUNT_POSITION, PositionType.SUBTOTAL_POSITION].includes(event.node?.data?.type?.name) && ![PositionType.DISCOUNT_POSITION, PositionType.SUBTOTAL_POSITION].includes(_newParent?.type?.name)) ||
            ([PositionType.DISCOUNT_POSITION, PositionType.SUBTOTAL_POSITION].includes(event.node?.data?.type?.name) && [PositionType.DISCOUNT_POSITION, PositionType.SUBTOTAL_POSITION].includes(_newParent?.type?.name))){ */
            if(_newParent?.type?.name?.toLowerCase()=="group position" && event.node?.data.parent && currIndex > 0){ //only child from other parents are allowed
              if(_renderedNodes[currIndex-1]?.data.id != event.node?.data.parent){
                //let _newParent = _renderedNodes[currIndex-1]?.data;
                if(_newParent){
                  event.node.setData({...event.node?.data, parent: _newParentId});
                  const _newChildren = _renderedNodes.filter(n => n.data?.parent == _newParentId);
                  _newChildren.forEach(_child => {
                    //_child.data.pos = ((_newParent.pos * 1) + (_j++ * 0.01));
                    const _ppos = this._wr.helperService.pipeDecimal(((_newParent.pos * 1) + ((_j++) * 0.01)), "en", ".1");
                    _child.setData({..._child.data,
                      pos: _ppos,
                      /* parent: _newParent?.id */
                    });
                  });

                  _newNodes = _newChildren.slice(0);

                  /* remap */
                  const _newDataWithActualPos = Position.remapActualPosition(_renderedNodes.map(_n => _n.data));
                  event.api.setRowData(_newDataWithActualPos);
                  this._anyParams.firstData = _newDataWithActualPos;
                  /* end remap */

                  isChildMoved = true;
                }
              }
            }

            if(!isChildMoved){
              let _i=0
              //separate parent from children
              _newNodes = _renderedNodes.filter(node => node.parent?.rowIndex == null && node.data?.parent <= 0).map(node => {
                if(node.parent?.rowIndex != null){
                  return node;
                } else {
                  return {...node, data: {...node.data, pos: ++_i}};
                }
              });

              //children
              const _children = _renderedNodes.filter(node => node.parent?.rowIndex == null && node.data?.parent > 0);
              let _childCount = 1;
              let _previousParent = null
              _newNodes = _newNodes.concat(_children).map(node => {
                const _parentNode = _newNodes.find(pNode => pNode.data?.id == node.data?.parent);
                if(_parentNode){
                  if(_previousParent?.id != _parentNode?.data.id){
                    _previousParent = _parentNode.data;
                    _childCount = 1;
                  }
                  // const _childrenCount = _children.filter(pNode => pNode.data?.parent == _parentNode.data?.id).length;
                  // return {...node, data: {...node.data, pos: (((_parentNode.data?.pos * 1) + ((_childrenCount || 1) * 0.01)))}};

                  return {...node, data: {...node.data, pos: (((_parentNode.data?.pos * 1) + ((_childCount++) * 0.01)))}};
                } else{
                  //_childCount = 1;
                  return node;
                }
              });

              const _toApply = this._wr.helperService.arraySortBy({arr: _newNodes.map(_n => _n.data), byId: "pos"});
              const _newDataWithActualPos = Position.remapActualPosition(_toApply);
              event.api.setRowData(_newDataWithActualPos);
              this._anyParams.firstData = _newDataWithActualPos;
            }

            event.api?.refreshCells({columns: ['total_sum'], force: true});
            event.api?.refreshCells({columns: ['id'], force: true});

            const _apiParams = _newNodes.map(_node => ({id: _node.data?.id, pos: _node.data?.pos, parent: _node.data?.parent}));

            this._positionURL = (this.componentType == "quotes") ? "sales_positions" : "order_positions";
            this._sub.add(this._crm?.[this._positionURL](_apiParams, "patch").subscribe({next: res => {
              this.manageFromGrid("patch", event.node.data);
            },
            error: () => {
              event.api.setRowData(_dataRollback.splice(0));
              _dataRollback = [];
              /* event.api.refreshCells({columns: ['actual_position'], force: true});
              event.api?.refreshCells({columns: ['id'], force: true}); */
            }
            }));
          } else {
            event.api.setRowData(_dataRollback.splice(0));
            _dataRollback = [];
          }
        }
      },

      detailCellRendererParams    : (event) =>  {
        return {type: (this.mode == "add" ? this.newType : event?.data?.type?.name),
          fromComponent: this.componentType,
          parentNode: this.parentNode,
          mode: this.mode,
          inputData: this.data,
          anyParams: this._anyParams,
          positionTypes: this._positionTypes,
          onClick : (type, data) => {
            this.manageFromGrid(type, data);
          },
          onClose : (mode) => {
            this.activeNode?.setExpanded(false);
            this.draftInProgress = false;
            if(mode == "add" && !this.activeNode.expanded){
              const _row = this.gridList.grid.gridParams;
              setTimeout(() => {
                _row.api.applyTransaction({remove:[this.activeNode.data]});
              }, 100);
            }
          },
          refresh : () => {
            this.isLoading = true;

            setTimeout(() => {
              this.isLoading = false;
              this._cd.detectChanges();
            }, 100)
          },
          reInitGrid : (param:any) => {
            console.log(param)
            this.gridList.visible = false;
            setTimeout(e => {
              this.gridList.visible = true;
              this._anyParams.firstData = Position.getGridApiAllData(event.api);
              this.mode = "view";
              this._cd.detectChanges();
            }, 1000)
          },
          refreshStatusBar: () => {
            //this._anyParams.refresh = true;
            this._anyParams.firstData = Position.getGridApiAllData(event.api);
          }
        };
      },
      detailRowHeight             : (this.componentType == 'orders' ? 100 : 350),
      /* detailRowAutoHeight: true, */
      /* getRowHeight: p => {
        if(this.nodeExpanded){
          if([PositionType.PRODUCT_POSITION, PositionType.STANDARD_POSITION].includes(p.data?.type?.name)){
            if(!p?.node.detail){
              return 50;
            }
          }
        }
        return undefined;
      }, */

      statusBar:  {
        statusPanels: [
          /* {
            statusPanel: PositionStatusbarComponent,
            statusPanelParams: {
              anyParams: this._anyParams
            }
          }, */
        ],
      },

      rowClassRules :  {
        'bg-primary-faded': (params) => {
          return (params?.data == null);
        },
        'bg-warn-faded': (params) => {
          const _isGroup = params.data?.type?.name?.toLowerCase()
          return (_isGroup == 'group position' || this._wr.helperService.isNotEmpty(params.data?.parent));
        }
      },

      onFirstDataRendered: (_e: FirstDataRenderedEvent) => {
        /* if(!event.context?.isOptionalItems){
          this._anyParams.firstData = Position.getGridApiAllData(event.api);
        } */
        if(this._toExpand){
          this._isRendered = true;
        }

        this.items = [
          {
              label: 'Text Position',
              icon: PrimeIcons.ALIGN_JUSTIFY,
              command: (event) => {
                this.add('Text Position', event?.item?.state?.['rowIndex'], event?.item?.state?.['parentNode']);
              },
          },
          {
              label: 'Group',
              icon: PrimeIcons.TABLE,
              command: (event) => {
                this.add('Group Position');
              },
          },
          {
            label: 'Discount',
            icon: PrimeIcons.PERCENTAGE,
            command: (event) => {
              this.add('Discount Position');
            },
          },
          {
            label: 'Subtotal',
            icon: PrimeIcons.DOLLAR,
            command: (event) => {
              this.add('Subtotal Position', event?.item?.state?.['rowIndex'], event?.item?.state?.['parentNode']);
            },
          },
          {
            label: 'PDF page break',
            icon: PrimeIcons.FILE_PDF,
            command: (event) => {
              this.add('PDF Position', event?.item?.state?.['rowIndex'], event?.item?.state?.['parentNode']);
            },
          }


          /* RT: process/status/ "eg_content_type__description__icontains": "quotes" */
        ];
        this.draftInProgress = false;
      },
    };

    return retvar;
  }

  ngOnInit(): void {

    this._initMenu();

    this.nodeExpanded   = this.componentType == 'orders';
    this._toExpand      = this.nodeExpanded == true;
    const _isArrayOfObj = this._wr.helperService.isArrayOfObject(this.data?.positions);

    this.params = {
      id: (_isArrayOfObj) ? this.data?.positions.map(e => {return e.id}) : (this.data?.positions || []),
      limit:100,
      sort: [{sort: "asc", colId: "pos"}]
    };
    this._positionURL = (this.componentType == "quotes") ? "sales_positions" : "order_positions";

    this.form = Position.getFormProperties(this);

    this.config = {
      reloaded : true,
      viewtype: this.viewType,
      params : {...this.params},
      apiService : (p, m, n?) => this._crm?.[this._positionURL](p, (m == 'options' ? 'post' : m), n).pipe(map((res: ResponseObj<GridResponse>) => {
        const _resultForGrid1 = (res.content?.results || [])/* .map(_data => {
          if(!_data.tax?.value){
            _data.tax = {..._data.tax, value: Math.random()}
          }
          return _data;
        }); */
        res.content.results = Position.remapActualPosition(_resultForGrid1);

        /* For optional items */
        if(!this.grid2.dataIsSet){
          this.grid2.dataIsSet = true;
          const _resultForGrid2 = res.content?.results?.filter(_data => _data.is_optional);
          if((_resultForGrid2 || []).length > 0){
            this.grid2.rowData = Position.remapActualPosition(_resultForGrid2);
            this.grid2.configuring = true;
          }

          this._anyParams.firstData = _resultForGrid1.slice(0);
          res.content.results = Position.remapActualPosition(_resultForGrid1.filter(_data => !_data.is_optional));
        }

        return res;
      }), tap((res: ResponseObj<GridResponse>) => {
        const noRowData = this._wr.libraryService.checkGridEmptyFirstResult(res);
        if(noRowData){
          this.draftInProgress = false;
        }
      })),
      title : Core.Localize("position"),
      formProperties: this.form.formProperties,
      formStructure: this.form.formStructure,
      extendedGridDefOverride : this.extendedGridDefn,
      excludedMenus: ['edit', 'delete', 'new', 'view']
    };

    this._sub.add(this._crm.position_type({limit: 50}, "post").subscribe((res: ResponseObj<GridResponse>) => {
       this._positionTypes = res.content?.results;
       this._sub.unsubscribe();

    }));
  }

  manageFromGrid(action, data){
    const _data = this.gridList.grid.rowData;
    let _retArr = [];

    _data.forEach(e => {
      _retArr.push(e.id);
    })

    if(action == "put"){
      _retArr.push(data.id);

      this.params.api?.refreshClientSideRowModel();
    }
    else if(action == "delete"){
      const indexToRemove: number = _retArr.indexOf(data.id);
      console.log(_retArr)
      console.log(action, data);

      if (indexToRemove !== -1) {
        _retArr.splice(indexToRemove, 1);
      }

      this._sub.add(this._crm?.[this._positionURL]({id:data.id}, "delete").subscribe(res => {}));

      this.callback.emit({action: "patch", data: _retArr})
    }
    else if(action == "patch"){
      let _node = this.gridList.grid.getAllNodes().find(e => e.data.id == data.id);
      _node?.setExpanded(false);
      this.gridList.grid.gridParams.api.applyTransaction({update: [data] })
    }

    this.draftInProgress = false;
  }

  add(type, index?, _parentNode?){
    if(!this.draftInProgress){
      const _gridParams = this.gridList.grid.gridParams;
      let _rowCount     = _gridParams.api.getRenderedNodes().filter(_node => _node.data?.type?.name != PositionType.DISCOUNT_POSITION).length;
      //let _rowCount = _gridParams.api.getDisplayedRowCount();

      let _index = (index >= 0) ? index + 1 : _rowCount;
      //this.parentNode = _parent?.id;
      this.parentNode = _parentNode;
      this.newType  = type;
      this.mode     = "add";

      if(type != 'PDF Position'){
        /* DURING TEST if(!this.draftInProgress){ */
          let data      = [null];
          _gridParams.api.applyTransaction({add:data, addIndex:_index});
          const newNode = _gridParams.api.getDisplayedRowAtIndex(_index);
          _gridParams.api.setRowNodeExpanded(newNode, true);
          this.activeNode = newNode;
          //DURING TEST this.draftInProgress = true;
        /* } */
      } else{
        const _newType = this._positionTypes.find(_pos => _pos.name == type);
        let newNode;


        console.log({parentNode: this.parentNode});
        if(this.parentNode){
          //if PDF is added from parent Node
          const _findLastChild = (_gridParams.api.getRenderedNodes() || []).filter(val => val.data?.parent == this.parentNode.id).reverse()[0];
          if(_findLastChild){
            newNode = _findLastChild;
            _index = (_findLastChild?.rowIndex + 1);
          }
        } else{
          newNode = _gridParams.api.getDisplayedRowAtIndex(_index-1);
        }

        let _newPos: any = ((newNode?.data.pos || 1) * 1);
        if(_newPos){
          const _parent = _newPos * 1;
          const _child = _newPos % 1;

          if(!this.parentNode){
            _newPos = ((_parent) - (_child)) + 1;
          } else{
            _newPos = ((_parent - _child) + ((_child * 1) + 0.01));
          }

          /* _newPos = ((_parent) - (_child)) + 1; */
          _newPos = this._wr.helperService.pipeDecimal(_newPos, "en", ".1");
        }

        const apiParam: any = { type: (_newType?.id || 1),
                                pos: _newPos,
                                unit_price: 10,
                                discount_in_percent: 10,
                                discount_total: 10,
                                total_sum: 10,
                                account: 1,
                                tax: 1,
                                [this._parentIdType()]: this.data.id
                              };
        if(this.parentNode){
          apiParam.parent = this.parentNode.id;
        }

        this._sub.add(this._crm?.[this._positionURL](apiParam, 'put').subscribe({
          next : (res: ResponseObj<GridResponse>) => {
            _gridParams.api.applyTransaction({add: res.content.results, addIndex:_index});
            this.manageFromGrid("put", res.content.results?.[0]);
          },
          complete : () => {
            // this.detailsConfig.isLoading = false;
            // this._cd.detectChanges();
            //this.params.refresh?.()
            //this._wr.helperService.gotoPage({extraParams: {}});
          },
          error : (err) => {
            // this.detailsConfig.isLoading = false;
            // this._cd.detectChanges();
          },
        }));
      }

      this.draftInProgress = true;
    }
  }



  /* Vignesh Codes */


  private _parentIdType(){

    switch(this.componentType){
      case 'orders':
        return 'order_id';

      case 'purchaseorder':
        return 'purchase_order_id';

      case 'creditnotes':
        return 'credit_notes_id';

      case 'invoices':
        return 'invoice_id';

      case 'quotes':
        return 'quote';

      case 'deliveries':
        return 'delivery_id';
    }

  }


  managePosition(action, data, title?){

    switch(action){
      case "add":
        console.log(this.data);

        const _posType = this._positionTypes.filter(e => e.position_key == this._sel_action)[0];
        const _config : IContainerWrapper = {
          apiService: (p?, m?, n?) => this._crm?.[this._positionURL](p, m, n),
          title: title,
          params: {type:_posType['id'], [this._parentIdType()]:this.data.id},
          formProperties:Position.getFormProperty(this),
          formStructure: Position.getFormStructure(this._sel_action, this.mode)
        };

        console.log(_config)
        this._addNewItem(_config)
        break;
      case "add_node":
        const _gridParams = this.gridList.grid.gridParams;
        let _rowCount     = _gridParams.api.getRenderedNodes().filter(_node => _node.data?.type?.name != PositionType.DISCOUNT_POSITION).length;
        let _index        = _rowCount;
        _gridParams.api.applyTransaction({add:data, addIndex:_index});
        break;
      case "add_pdf_position":
        const _posPdfType = this._positionTypes.filter(e => e.position_key == this._sel_action)[0];
        const _req = {
          [this._parentIdType()]:this.data.id,
          type:_posPdfType['id'],
          name:_posPdfType['name'],
          description:_posPdfType['name'],
        }
        this._subs.id('pdf_pos').sink = this._crm?.[this._positionURL](_req, "put").subscribe(res => {
          this.managePosition("add_node",  res.content.results)
          this._subs.id("pdf_pos").unsubscribe();
        })
        break;


    }
  }

  private _initMenu(){
    let that = this;
    this.positionMenu = [
      {
        label : 'Add Standard Position',
        icon  : 'fa-solid fa-circle',
        command : (param) => {
          this._sel_action = "standard_position";
          const _title = Core.Localize('standard') + ' ' + Core.Localize('position');
          this.managePosition("add", null, _title)
        }
      },
      {
        label : 'Add Product',
        icon  : 'fa-solid fa-circle',
        command : (param) => {
          this._sel_action = "product_position";
          const _title = Core.Localize('product') + ' ' + Core.Localize('position');
          this.managePosition("add", null, _title)
        }
      },
      {
        label : 'More Items',
        icon  : 'fa-solid fa-caret-down',
        items : [
          {
            label : 'Add Text Position',
            icon  : 'fa-solid fa-circle',
            command : (param) => {
              this._sel_action = "text_position";
              const _title = Core.Localize('text') + ' ' + Core.Localize('position');
              this.managePosition("add", null, _title);
            }
          },
          {
            label : 'Add Group',
            icon  : 'fa-solid fa-circle',
            command : (param) => {
              this._sel_action = "group_position";
              this._addNewItem(this.config)
              const _title = Core.Localize('group') + ' ' + Core.Localize('position');
              this.managePosition("add", null, _title);
            },

          },
          {
            label : 'Add Discount',
            icon  : 'fa-solid fa-circle',
            command : (param) => {
              this._sel_action = "discount_position";
              const _title = Core.Localize('discount') + ' ' + Core.Localize('position');
              this.managePosition("add", null, _title)
            }
          },
          {
            label : 'Add Subtotal',
            icon  : 'fa-solid fa-circle',
            command : (param) => {
              this._sel_action = "subtotal_position";
              const _title = Core.Localize('subtotal') + ' ' + Core.Localize('position');
              this.managePosition("add", null, _title)
            }
          },
          {
            label : 'Add PDF Page break',
            icon  : 'fa-solid fa-circle',
            command : (param) => {
              this._sel_action = "pdf_position";
              this.managePosition("add_pdf_position", null);
            }
          },
        ]

      },
    ]
  }

  public importProduct(data, formGroup:FormGroup){
      formGroup.get('unit')?.setValue(data['value'].unit)
      formGroup.get('unit_price')?.setValue(data['value'].sale_price)
      formGroup.get('text')?.setValue(
        `<p><b>${data['value'].name}</b><br>
          ${data['value'].description}<br><br>`
      )
  }

  private _addNewItem(p: IContainerWrapper, mode: "view" | "add" | "edit" | "delete" = "add", ){
    //const subApi = api$(param, method, nextUrl);
    this._subs.sink =   (p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      const iContainerWrapper: IContainerWrapper = {
        apiService: p.apiService,
        permission: res.content?.permission,
        gridFields: res.content?.fields,
        title: p.title,
        params: (p.params || {}),
        noModalHeight: p.noModalHeight == true,
        addCallback: (p2) => {
          if(p2?.isConfirmed){
            console.log(p2);
            if(this._sel_action == "product_position"){
              this.config.formProperties['article']['formChangesToCallback'] = false;
            }
            const _gridParams = this.gridList.grid.gridParams;
            let data      = p2?.apiData?.results;
            let _rowCount     = _gridParams.api.getRenderedNodes().filter(_node => _node.data?.type?.name != PositionType.DISCOUNT_POSITION).length;
            let _index = _rowCount;

            _gridParams.api.applyTransaction({add:data, addIndex:_index});
            /* this.egSubItem?.gridList?.grid?.refresh(); */
            /* if(this.egTask?.taskGridList?.grid?.isChanged()){TODO} */
          }
        },
        ...(p.formProperties ? {formProperties: p.formProperties} : {}),
        ...(p.formStructure ? {formStructure: p.formStructure} : {}),
        ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
      };
      console.log({iContainerWrapper})
      this._wr.containerService.dialogAction(mode, iContainerWrapper);
    }));
  }



  ngAfterViewInit(){
    if(this.gridList.grid){
      this.gridList.grid.agStyle = {height: "75vh"};
    }
  }

  ngOnDestroy(): void {
    this.draftInProgress = false;
    this._sub.unsubscribe();
  }

  ngDoCheck(): void {
    if(this.grid2.rowData.length > 0){
      if(this.gridList?.grid && this.gridList2?.grid && this.grid2.configuring && !this.grid2.loaded){
        this.grid2.configuring = false;
        this.grid2.loaded = true;

        this.gridList.grid.agStyle = {height: "50vh"};
        this.gridList.grid.gridOptions.alignedGrids.push(this.gridList2?.grid?.gridOptions);

        this.gridList2.grid.agStyle = {height: "35vh"};
        this.gridList2.grid.gridOptions.alignedGrids.push(this.gridList?.grid?.gridOptions);
      }
    }else {
      if(this.gridList?.grid){
        this.gridList.grid.agClass = "h-full"
        this.gridList.grid.agStyle = {height: "100%"};
      }
    }




    //EXPANDING MECHANISM, only applicable to certain views
    /* console.log({_toExpand: this._toExpand, expanding: this._expanding }); */
    if(this.nodeExpanded && this._toExpand && !this._expanding){
      const _gridParams = this.gridList?.grid?.gridParams;

      if(_gridParams && this._isRendered){
        this._expanding = true;
        if(this.componentType == 'orders'){
          _gridParams.api?.forEachNode(n => {
            n.setExpanded(this.nodeExpanded);
          });
        }

        /* console.log({_gridParams}); */
        setTimeout(() => {
          _gridParams.columnApi.autoSizeColumn('text');
        });
        this._isRendered = false;
        this._expanding = false;
        this._toExpand = false;
      }
    }
  }
}
