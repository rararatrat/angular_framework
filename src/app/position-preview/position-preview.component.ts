import { ChangeDetectorRef, Component, Inject, Input, LOCALE_ID, Optional } from '@angular/core';
import { Core, GridResponse, ResponseObj, SharedService, SubSink } from '@eagna-io/core';
import { IPositionPreviewData, ITemplateSettings, template_type } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, forkJoin } from 'rxjs';
import { Position } from '../crm/sales/position/position';
import { CrmService } from '../crm/crm.service';
import { environment as env } from 'src/environment/environment';
import { SettingsService } from '../settings/settings.service';
import { Templates } from '../settings/templates/templates.static';
import { Observable } from 'tinymce';

@Component({
  selector: 'eg-position-preview',
  templateUrl: './position-preview.component.html',
  styleUrls: ['./position-preview.component.scss']
})
export class PositionPreviewComponent {
  constructor(
    private _crm: CrmService,
    private _cdr: ChangeDetectorRef,
    private _ws: WrapperService,
    private _settingsService: SettingsService,
    @Inject(LOCALE_ID) private _ilocale,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<IPositionPreviewData>){}

  @Input() isMockData = false;

  @Input() data: any;
  //@Input() positionsData: any[] = [];
  @Input() settings: ITemplateSettings;
  @Input() template_type: template_type;

  positionsData: any[] = [];
  positionsForPrint: any[][] = [];
  taxSummary: { sum: number; sumWithTax: number; taxableItems: any[]; };
  orgData: any;
  dateFormat: string;
  locale: string;
  settingsError: boolean;
  currency: any;
  taxedAmount = 0;

  private _api = (p, m) => this._crm.sales_positions(p, m);
  //private _dataType: componentConfigType;
  private _subs: SubSink = new SubSink();
  private _columnsHidden: number
  private _label_from_type: string;
  private _old_leftMargin: number;
  private _old_topMargin: number;
  private _old_rightMargin: number;
  private _old_bottomMargin: number;
  private _old_docBackgroundCover: string;
  private _old_docBackgroundSheet: string;
  public  noTax: boolean = false;
  public envUrl = (env.apiUrl || '').substring(0, (env.apiUrl || '').length-1);
  public positionTypes = Position.typesValue;

  get label_from_type(): string{
    return Position.getLabelFromType(this.template_type);
  }


 /*  this._positionURL = "order_positions";
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

      case 'deliverynotes':
        this._positionURL = "order_positions";
        return 'delivery_id';

        case 'bills':
          this._positionURL = "purchase_positions"; */

  private _getApi(p, m){
    switch(this.template_type){
      case 'bills': 
      case 'quotes': 
        return this._crm.sales_positions(p, m);
      case 'purchaseorders': 
        return this._crm.purchase_positions(p, m);
      case 'order':
      case 'invoices':
      case 'creditnotes': 
      case 'deliveries': 
        return this._crm.order_positions(p, m);
      /* case 'accountstatement': return this._crm.sales_positions(p, m); */
    }
    return this._crm.sales_positions(p, m);
  }

  ngOnInit(){
    const _localeFormat = this._ws.coreService.getLocaleFormat();
    this.locale = _localeFormat._locale;
    this.dateFormat = _localeFormat._dateFormat;

    const _dataType = this._ws.libraryService.getRenderedType(this.dialogConfig, this.dialogConfig?.data);

    //set data and settings from dialog
    if(_dataType == 'dialog'){
      if(!this.data){
        this.data = this.dialogConfig?.data?.item || {};
      }
      if(!this.template_type){
        this.template_type = this.dialogConfig?.data?.template_type || 'quotes';
      }

      //currency
      this.currency = this.data?.currency?.name || 'EUR';

      if(!this.settings){
        //this.settings = this.dialogConfig?.data?.settings;
        if(!this.settings && this.template_type){
          this._subs.id('fetchConfigBasedOnTplType').sink = this._settingsService.doc_config({eg_content_type__content_model: this.template_type}, 'post').subscribe({
            next: (res: ResponseObj<GridResponse>) => {
              const _isEmpty = this._ws.libraryService.checkGridEmptyFirstResult(res);
              if(!_isEmpty){
                const _firstResult = res?.content?.results?.[0];
                const _fork$ = {
                  setup   : this._settingsService.doc_setup({id: _firstResult?.doc_setup.id}, "post"),
                  template: this._settingsService.doc_templates({id: _firstResult?.doc_template.id}, "post"),
                }
                this._subs.id('forkSetup').sink = forkJoin(_fork$).subscribe({
                  next : ({setup, template}) => {
                    this._mapToTemplateSettings(template?.content?.results?.[0], setup?.content?.results?.[0]);
                  },
                  complete : () => {},
                  error : (err) => {}
                })
              } else {
                if(!this.settings){
                  this.settings = Templates.getDefaultDocConfig();
                  this._assignCssDistanceVariable()
                }
              }
            }, complete() {}})
        } else{
          if(!this.template_type){
            this.template_type = 'quotes';
          }
          if(!this.settings){
            this.settings = Templates.getDefaultDocConfig();
            this._assignCssDistanceVariable();
          }
        }
      } else{
        this._assignCssDistanceVariable();
      }
    } else{
      if(!this.data){
        console.warn('no data provided');
      }
      this._assignCssDistanceVariable();
    }

    if(this.data){
      this.positionsData = this.data.__data__.positions || this.data.positions || [];
    }

    /* uncomment this and comment the block below when tax_rate is now available in positions[] data */
    if(this._ws.helperService.isArrayOfNumber(this.positionsData)){
      this._api = (p, m) => this._getApi(p, m);
      this._subs.id('fetchPositions').sink = this._api?.({id: this.positionsData, limit: 1000, sort: [{sort:"asc", colId:"internal_pos"}]}, 'post').subscribe((res: ResponseObj<GridResponse>) => { //colId:"pos"
        this.positionsData = (res.content.results || []);
        this.processContentPreview('api');
      });

    } else if(this._ws.helperService.isArrayOfObject(this.positionsData)){
      Position.resetExternalPos();
      this.positionsData = this._ws.helperService.arraySortBy({arr: (this.positionsData || []), byId: 'internal_pos'}).map((_d, _idx, _arr) => Position.mapExternalPosition(_d, _idx, _arr));
      this.processContentPreview('has data');
    }

    /* if(this._ws.helperService.isArrayOfNumber(this.positionsData) || (this._ws.helperService.isArrayOfObject(this.positionsData) && this.positionsData?.[0]?.tax?.tax_rate==undefined)){
      const _ids = this._ws.helperService.isArrayOfObject(this.positionsData) ? (this.positionsData || []).map(_p => _p.id) : this.positionsData;
      this._subs.id('fetchPositions').sink = this._api?.({id: _ids, limit: 1000, sort: [{sort:"asc", colId:"internal_pos" }]}, 'post').subscribe((res: ResponseObj<GridResponse>) => { //colId:"pos"
        this.positionsData = (res.content.results || []);
        this.processContentPreview();
      });

    } else if(this._ws.helperService.isArrayOfObject(this.positionsData)){
      this.positionsData = this._ws.helperService.arraySortBy({arr: (this.positionsData || []), byId: 'internal_pos'}); //byId: 'pos'
      this.processContentPreview();
    } */
  }

  private _mapToTemplateSettings(template, pageSetup){
    const _mapped           = Templates.resultsToSettings(template, pageSetup);
    this.settings           = _mapped.template[0];
    this._assignCssDistanceVariable();
  }

  public processContentPreview(_fromWhere?: string){
    // console.log({positionData: this.positionsData});

    try {
      this.orgData = JSON.parse(this._ws.libraryService.getLocalStorage("org"));
    } catch (error) {}

    //let _i = 0
    let _i = 0;
    let _eachPage: any[] = [];
    (this.positionsData || []).forEach((_posData, ind) => {
      if(_posData?.type?.id != this.positionTypes?.pdf_position.id){
        _eachPage.push(_posData);
        _i++;

        if(ind == this.positionsData.length - 1){

          //only one content means end, push it toPrint
          //if(ind == 0){
          if(_eachPage.length > 0){
            this.positionsForPrint.push(_eachPage);
            //_i++;
            _i = 0;
            _eachPage = [];
          }
        }
      } else {
        if(_i > 0){
          if(_eachPage[_i-1]?.type?.id != this.positionTypes?.pdf_position.id){
            this.positionsForPrint.push(_eachPage);
            //_i++;
            _i = 0;
            _eachPage = [];
          }
        }
      }
    });

    this.taxSummary = Position.getTotal(this.positionsData, this._ws.helperService.arraySortBy);
    if((this.taxSummary.taxableItems || []).length == 0){
      this.noTax = true;
    }

    /* this.taxedAmount = (this.taxSummary.taxableItems || []).reduce((accumulator, currentValue) => accumulator + currentValue?.total_tax, 0);
    console.log({taxedAmount: this.taxedAmount}); */

    if(this.noTax){
      this.taxSummary.taxableItems.unshift({tax: {name: Core.Localize('sum')}, total_tax: (this.taxSummary?.sum || 0), isForTax: true, isFirst: true});
    } else{
      this.taxSummary.taxableItems.unshift({tax: {name: Core.Localize('sum')}, total_tax: (this.taxSummary?.sum || 0), isForTax: true, isFirst: true});
      this.taxSummary.taxableItems.push({tax: {name: Core.Localize('sum_with_tax')}, total_tax: (this.taxSummary?.sumWithTax || 0), isForTax: true});
    }
    /* if(this.taxSummary?.sum){
      this.taxSummary.taxableItems.unshift({tax: {name: 'Sum'}, total_tax: (this.taxSummary?.sum || 0), isForTax: true, isFirst: true});
    }
    if(!this.noTax && this.taxSummary?.sumWithTax){
      this.taxSummary.taxableItems.push({tax: {name: 'Sum with Tax'}, total_tax: (this.taxSummary?.sumWithTax || 0), isForTax: true});
    } */
    /* console.log({taxSummary: this.taxSummary}); */
    this._cdr.detectChanges();
  }

  computeSum(_data: any) {
    if(this.positionsData){
      //initial to compute is the lineitem
      let _toSum = [_data];

      //if group, compute all the positions with parent id
      if(_data.type?.id == this.positionTypes?.group_position.id){
        const _parentId = _data.id;
        if(_parentId){
          _toSum = this.positionsData.filter(_res => _res.parent == _parentId);
        }
      }
      //if subtotal, compute all the positions with
      else if(_data.type?.id == this.positionTypes?.subtotal_position.id){
        //_toSum = (this.positionsData || []).filter(_fData => (_fData.pos * 1) < (_data.pos * 1));
        _toSum = (this.positionsData || []).filter(_fData => (_fData.internal_pos * 1) < (_data.internal_pos * 1));
      }

      //for discount position
      else if(_data.type?.id==this.positionTypes?.discount_position.id){
        _toSum = (this.positionsData || []).filter(_fData =>  ((_fData.internal_pos * 1) < (_data.internal_pos * 1)));
        const _discount = Position.getOverAllDiscount(_data, _toSum);
        return (_discount * -1);
      }

      //const _toReturn = Position.computeSum(_toSum);
      const _toReturn = Position.computeSum(_toSum, {compute: _data.type?.id == this.positionTypes?.subtotal_position.id, belowPos: _data?.internal_pos});
      if(_toReturn >= 0){
        return _toReturn;
      }
    }
    return '';
  }

  public get columnsHidden(){
    let _toReturn = 0;
    if(this.settings){
      if(!this.settings.setup?.columnOptions?.showPositionNumber){
        _toReturn++;
      }
      if(!this.settings.setup?.columnOptions?.showAmount){
        _toReturn++;
      }
      if(!this.settings.setup?.columnOptions?.showUnitPrice){
        _toReturn++;
      }
    }
    return _toReturn;
  }

  private _assignCssDistanceVariable(_whichPadding?: 'left' | 'top' | 'right' | 'bottom'){
    if(this.settings){
      if(!_whichPadding){
        this._assignCssDistanceVariable('left');
        this._assignCssDistanceVariable('top');
        this._assignCssDistanceVariable('right');
        this._assignCssDistanceVariable('bottom');
      } else{
        this[`_old_${_whichPadding}Margin`] = this.settings.distance[_whichPadding + 'Margin' ] || 12;
        // console.log({_assignCssDistanceVariable: _whichPadding, [`--pdf-page-padding-${_whichPadding}`]: `${this.settings.distance[_whichPadding + 'Margin' ]}mm`})
        document.documentElement.style.setProperty(`--pdf-page-padding-${_whichPadding}`, `${this.settings.distance[_whichPadding + 'Margin' ]}mm`);
      }
    }
  }

  private _setBackgroundImages(){
    /* setup the background image url just once TODO: if changed on the fly */
    if(this._old_docBackgroundCover != this.settings?.letterHead?.docBackgroundCover){
      this._old_docBackgroundCover = this.settings?.letterHead?.docBackgroundCover
      document.documentElement.style.setProperty(`--front-cover-url`, `url("${this.envUrl}${this.settings?.letterHead?.docBackgroundCover}")`);
    }
    if(this._old_docBackgroundSheet != this.settings?.letterHead?.docBackgroundSheet){
      this._old_docBackgroundSheet = this.settings?.letterHead?.docBackgroundSheet
      document.documentElement.style.setProperty(`--succeeding-cover-url`, `url("${this.envUrl}${this.settings?.letterHead?.docBackgroundSheet}")`);
    }
  }

  ngDoCheck(){
    this._setBackgroundImages();

    if(this._old_leftMargin != undefined && this._old_leftMargin != this.settings.distance.leftMargin){
      this._assignCssDistanceVariable('left');
    }
    if(this._old_topMargin != undefined && this._old_topMargin != this.settings.distance.topMargin){
      this._assignCssDistanceVariable('top');
    }
    if(this._old_rightMargin != undefined && this._old_rightMargin != this.settings.distance.rightMargin){
      this._assignCssDistanceVariable('right');
    }
    if(this._old_bottomMargin != undefined && this._old_bottomMargin != this.settings.distance.bottomMargin){
      this._assignCssDistanceVariable('bottom');
    }
  }
}
