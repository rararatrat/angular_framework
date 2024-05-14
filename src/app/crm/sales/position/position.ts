import { ITemplateSettings, objArrayType, pageSetup, template_type } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";
import { Article } from "../../product/article/article";
import { Core } from "@eagna-io/core";

/** @deprecated */
export enum PositionType {
  STANDARD_POSITION="Standard Position",
  PRODUCT_POSITION="Product Position",
  TEXT_POSITION="Text Position",
  GROUP_POSITION="Group Position",
  DISCOUNT_POSITION="Discount Position",
  SUBTOTAL_POSITION="SubTotal Position",
  PDF_POSITION="PDF Position",
}

export class Position {
  private static _mapExternalVar = this.resetExternalPos();

  public static resetExternalPos(){
    const _toReturn = {
      i: 1,
      j: 1,
      currentParent: 0,
      isChild: false,
      showPos: false
    };
    this._mapExternalVar = _toReturn;
    return _toReturn;
  }

  public static mapExternalPosition(_data, _index, _positions = []){
    //const _pos = _positions.filter(_p => _p.type?.id != this.typesValue.pdf_position.id)
    this._mapExternalVar.isChild = false;

    const _nextItem = (fromIndex, _arr) => {
      const _toReturn = _positions.slice(fromIndex)?.find(_p => _p.type?.id != this.typesValue.pdf_position.id);
      return _toReturn;
    }

    const _processData = (isGroup = false) => {
      if(this._mapExternalVar.showPos){
        if(this._mapExternalVar.isChild){
          _data.external_pos = `${this._mapExternalVar.i}.${this._mapExternalVar.j})`;
          this._mapExternalVar.j++;
  
          //if(this.typesValue.group_position.id == _positions?.[_index + 1]?.type?.id){
          if(this.typesValue.group_position.id == _nextItem(_index + 1, _positions)?.type?.id){
            this._mapExternalVar.i++;
          }
        } else{
          _data.external_pos = `${this._mapExternalVar.i}.`;
          if(!isGroup || _nextItem(_index + 1, _positions)?.parent != _data.id){
            this._mapExternalVar.i++;
          }
        }
      }
    }
    
    if(this.typesValue.pdf_position.id != _data.type?.id){
      if(this.typesValue.group_position.id == _data.type?.id){
        this._mapExternalVar.j = 1;
        if(_data.show_pos_nr){
          this._mapExternalVar.showPos = true;
          this._mapExternalVar.currentParent = _data.id;
        }
        _processData(true);
      } else{
        if(_data.parent > 0 && _data.parent == this._mapExternalVar.currentParent){
          this._mapExternalVar.isChild = true;
        } else{
          this._mapExternalVar.j = 0;
          this._mapExternalVar.showPos = _data.show_pos_nr;
        }
        _processData(false);
      }
    }

    return _data;
  }

  public static typesValue = {
    group_position:     {id: 1, name: 'Group'},
    subtotal_position:  {id: 2, name: 'SubTotal'},
    discount_position:  {id: 3, name: 'Discount'},
    text_position:      {id: 4, name: 'Text'},
    pdf_position:       {id: 5, name: 'Pdf Page Break'},
    product_position:   {id: 6, name: 'Product Position'},
    standard_position:  {id: 7, name: 'Standard Position'}
  }

  public static getLabelFromType(template_type: template_type): string {
    switch(template_type){
        case 'quotes': return Core.Localize('quote');
        case "order": return Core.Localize('sales_order');
        case "invoices": return Core.Localize('invoice');
        case "deliveries": return Core.Localize('delivery_note');
        case "creditnotes": return Core.Localize('credit_note');
        case "accountstatement": return Core.Localize('account_statement');
        case "purchaseorders": return Core.Localize('purchase_order');
        case "bills": return Core.Localize('bill');
        case "expenses": return Core.Localize('expense');
    }
    return '--';
  }

  public static getFormStructure(param, mode) : any{
    let _formStructure = {}
    const _defaultFields = [
      "quantity", "unit_price", "account", "is_optional",
      "unit", "discount_in_percent", "tax", "show_pos_nr",
      "text",
    ];

    switch(param){
      case "standard_position":
          _formStructure =  _defaultFields
        break;
      case "product_position":
          _formStructure =  ['article'].concat(_defaultFields)
        break;
      case "pdf_position":
        _formStructure = [];
        break;
      case "text_position":
        _formStructure = ['show_pos_nr', 'is_optional', 'text'];
        break;
      case "group_position":
        _formStructure = ['show_pos_nr', 'show_pos_prices', 'is_optional', 'text'];
        break;
      case "discount_position":
        _formStructure =  ['is_percentual', 'value', 'is_optional', 'text'];
        break;
      case "subtotal_position":
        _formStructure = ['is_optional', 'text'];
        break;
    }
    return _formStructure;
  }

  public static getFormProperty(_that) : any {
    const currency = _that?.data?.currency?.name || AppStatic.default_currency; //RT TODO: map the currency ID
    const productFormProperties = Article.getArticleFormProperties(_that);

    const _formProperties: objArrayType = {
      discount_in_percent : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:2, maxFractionDigits:2} },
      pos                 : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:1, maxFractionDigits:2} },
      unit_price          : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      quantity            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      value               : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:1, maxFractionDigits:2} },
      qty                 : {icon:"", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      unit                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit", saveField: "id",}, displayVal: "name" },
      type                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "type", saveField: "id",}, displayVal: "name" },
      //article             : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "article"} , displayVal: "article.name"},
      account             : {icon:"fa-solid fa-circle-user", type:"select", autoConfig:  {title: "name", saveField: "id", extraKey: "account"} , displayVal: "account.name"},
      tax                 : {icon:"fa-solid fa-circle-user", type:"select", autoConfig:  {title: "name", saveField: "id", extraKey: "tax_rates"} , displayVal: "taxs.name"},
      article             : {icon:"fa-solid fa-circle-user", type:"autocomplete",
                            formChangesToCallback: true,
                            callback : (data, formGroup) => {
                              _that.importProduct?.(data, formGroup);
                            },
                            autoConfig: {
                              title: "name",
                              saveField: "id",
                              extraKey: "stock",
                              formProperty: {
                                formProperties: productFormProperties.formProperties,
                                formStructure: productFormProperties.formStructure,
                              }
                            } }, //RT: TODO
      discount_type       : {type: "radio", data: [{id: 1, label: 'Percentage'}, {id: 2, label: 'Amount'}]},
      /* is_optional         : {autoConfig: {callback: (p) => {
        console.log("isoptional ",{p});
      }}} */
    };
    return _formProperties
  }

  public static getFormProperties(_that): any{
    const currency = _that?.data?.currency?.name || AppStatic.default_currency; //RT TODO: map the currency ID
    const productFormProperties = Article.getArticleFormProperties(_that);

    const _formProperties: objArrayType = {
      discount_in_percent : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:2, maxFractionDigits:2} },
      pos                 : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:1, maxFractionDigits:2} },
      unit_price          : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      quantity            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      value               : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:1, maxFractionDigits:2} },
      qty                 : {icon:"", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      unit                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit"}, displayVal: "name" },
      type                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "type"}, displayVal: "name" },
      article             : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "article"} , displayVal: "article.name"},
      account             : {icon:"fa-solid fa-circle-user", type:"select", autoConfig:  {title: "name", saveField: "id", extraKey: "account"} , displayVal: "account.name"},
      tax                 : {icon:"fa-solid fa-circle-user", type:"select", autoConfig:  {title: "name", saveField: "id", extraKey: "tax_rates"} , displayVal: "taxs.name"},
      product             : {icon:"fa-solid fa-circle-user", type:"autocomplete", autoConfig:  {
                              title: "name",
                              saveField: "id",
                              extraKey: "stock",
                              formProperty: {
                                formProperties: productFormProperties.formProperties,
                                formStructure: productFormProperties.formStructure,
                              },
                              callback(p) {
                                //_that.newProductCallback?.(p);
                                //_that.importProduct?.(p);
                              },
                            } , displayVal: "product.name"}, //RT: TODO
      discount_type       : {type: "radio", data: [{id: 1, label: 'Percentage'}, {id: 2, label: 'Amount'}]},
      /* is_optional         : {autoConfig: {callback: (p) => {
        console.log("isoptional ",{p});
      }}} */
    };

    //['id', 'name', 'type', 'parent', 'amount', 'unit', 'account', 'tax', 'text', 'unit_price', 'discount_in_percent', 'position_total', 'pos', 'internal_pos', 'is_optional', 'article', 'show_pos_nr', 'is_percentual', 'value', 'discount_total', 'total_sum', 'show_pos_prices']
    let _formStructure = [
      {
        header    : "Standard ",
        subheader : "Enter the Key information for your Quote",
        fields    : [
          "text",
          ["quantity", "unit_price", "account", ...(!_that.params?.data?.parent ? ["is_optional"] : [])],
          ["unit", "discount_in_percent", "tax", "show_pos_nr"]
        ],
        isTwoLine : true
      }
    ];

    switch(_that.params?.type){
      case "Product Position":
        if(_that.params?.mode == "add"){
          _formStructure = [
            {
              header    : "Product",
              subheader : "Import existing or create a new Product",
              fields    : ["product"],
              isTwoLine : false
            },
          ];
        }
        break;
      case "PDF Position":
        _formStructure = [
          {
            header    : "PDF Position",
            subheader : "",
            fields    : [...(!_that.params?.data?.parent ? ["is_optional"] : [])],
            isTwoLine : false
          },
        ];
        break;
      case "Text Position":
        _formStructure = [
          {
            header    : "Text Position",
            subheader : "",
            fields    : ["text", ["show_pos_nr", ...(!_that.params?.data?.parent ? ["is_optional"] : [])]],
            isTwoLine : false
          },
        ];
        break;
      case "Group Position":
        _formStructure = [
          {
            header    : "Group Position",
            subheader : "",
            fields    : ["text", ["show_pos_nr", "show_pos_prices", "is_optional"]],
            isTwoLine : false
          },
        ];
        break;
      case "Discount Position":
        _formStructure = [
          {
            header    : "Discount Position",
            subheader : "",
            fields    : ["text", ["discount_type"], ["value"]],
            isTwoLine : true
          },
        ];
        break;
      case "Subtotal Position":
        _formStructure = [
          {
            header    : "Subtotal Position",
            subheader : "",
            fields    : ["text", (!_that.params?.data?.parent ? ["is_optional"] : [])],
            isTwoLine : false
          },
        ];
        break;
    }


    return {
      formProperties  : _formProperties,
      formStructure   : _formStructure
    };
  }

  public static getDiscountAmount(data: any, price?, qty?): number{
    let _discount = 0
    if(data.discount_in_percent){
      const _discountInPercent = data.discount_in_percent;
      //_discount = ( ((price || data.unit_price)*1) * ((qty || data.quantity)*1) ) * (0.01 * _discountInPercent); CHANGED backend FORMAT
      _discount = ( ((price || data.unit_price)*1) * ((qty || data.quantity)*1) ) * _discountInPercent;
    }
    else if(data.discount_total){
      _discount = data.discount_total*1;
    }
    return _discount;
  }

  public static getOverAllDiscount(_data, _allData?: any[]): number{
    let _discount = 0;
    if(_data?.is_percentual){
      const _discountInPercent = (_data?.value || 0) * 1;
      const _sum = this.computeSum(_allData, {compute: true, belowPos: _data?.internal_pos});
      _discount = _sum * (0.01 * _discountInPercent);
    }
    else if(_data.value){
      _discount = _data.value*1;
    }
    return _discount;
  }

  public static computeSum(arrData: any[] = [], computeWithDiscount?: {compute: boolean, belowPos: number}): number {
    //TODO must apply discount positions over tax
    let _sum = 0;
    arrData.forEach((_eachData) => {
      if(_eachData){
        const _type = _eachData.type?.id;
        const _qty = _eachData.quantity*1;
        //const _qty = (_eachData.amount || 0) *1;
        const _price = _eachData.unit_price*1;
        let _discount = 0;
        switch(_type){
          case this.typesValue.product_position.id:
          case this.typesValue.standard_position.id:
            _discount = this.getDiscountAmount(_eachData, _price, _qty);
            const _orig_total = (_qty * _price);
            const _discounted_total = (_orig_total - _discount);
            _sum += _discounted_total;
            break;
          case this.typesValue.discount_position.id:
            //if(computeWithDiscount?.compute && computeWithDiscount?.belowPos && _eachData.pos < computeWithDiscount?.belowPos){
            if(computeWithDiscount?.compute && computeWithDiscount?.belowPos && _eachData.internal_pos < computeWithDiscount?.belowPos /* && _sum > 0 */){
              //  console.log("each data when computing overall discount", _eachData);
              //let _discount = 0;
              if(_eachData?.is_percentual){
                const _discountInPercent = (_eachData?.value || 0) * 1;
                _discount = _sum * (0.01 * _discountInPercent);
                _sum -= _discount;
                // console.log({discountInPercent: _sum});
              }
              else if(_eachData.value){
                _discount = _eachData?.value*1;
                _sum -= _discount;
                // console.log({discountAmount: _sum});
              }
            }
            break;
        }
      }
    });
    return _sum;
  }

  public static computeTax(_eachData: any = {}, allData = []){
    const _qty = _eachData.quantity*1;
    //const _qty = _eachData.amount*1;
    const _price = _eachData.unit_price*1;
    const _discount = this.getDiscountAmount(_eachData, _price, _qty);
    const _orig_total = (_qty * _price);
    const _discounted_total = (_orig_total - _discount);
    //return {_qty,_price,_discount,_discounted_total, withTax: (_discounted_total * (_eachData.tax?.value * 0.01))};
    //return (_discounted_total * (_eachData.tax?.value * 0.01));
    //return (_discounted_total * (_eachData.tax?.tax_rate * 0.01));
    const _tax_rate = (_eachData.tax?.tax_rate || _eachData.__data__?.tax?.tax_rate);
    //const _toReturn = _discounted_total * _tax_rate;
    let _toReturn = _discounted_total * _tax_rate;

    //TAX = ((gross - tax) * discount1) ... ((gross - tax) * discount1)*discount2 ...
    const discounts = allData?.filter(_data => _data.type.id == Position.typesValue.discount_position.id && _data?.is_percentual);
    (discounts || []).forEach(_d => {
      if(_d?.value > 0){
        _toReturn -= (_toReturn * ((_d.value || 0) * 0.01));
      }
    });

    return _toReturn;
  }

  public static getTotal(_arrData: any[], sortFunc: (param: {arr: any[], byId: string}) => any[]) : {sum: number, sumWithTax: number, taxableItems: any[]} {
    const _toReturn = {sum: 0, sumWithTax: 0, taxableItems: []};

    const _firstData: any[] = (_arrData || []).filter(_data => !_data.is_optional); //RT compule only the top
    //const _sorted = sortFunc({arr: _firstData, byId: 'pos'});
    const _sorted = sortFunc({arr: _firstData, byId: 'internal_pos'});

    //also, only compute product and standard postions (less discount, it will be computed in the end)
    const _tempItems = (_sorted || []).filter(_data => {
      return [Position.typesValue.product_position.id, Position.typesValue.standard_position.id].includes(_data.type?.id) && (_data.tax?.tax_rate > 0 || _data.__data__?.tax?.tax_rate > 0); //added __data__
    }).map(_t => {
      _t.total_tax = this.computeTax(_t, _firstData);
      return _t;
    });

    _tempItems.forEach(_tmp => {
      const _foundItem = _toReturn.taxableItems.find(_t => _t.tax?.id == _tmp.tax?.id);
      if(!_foundItem){
        _toReturn.taxableItems.push({..._tmp, isForTax: true});
      } else{
        _foundItem.total_tax += _tmp.total_tax;
      }
    });


    _toReturn.sum = this.computeSum(_sorted);

    //then discount
    _sorted.filter(_data => _data.type?.id==Position.typesValue.discount_position.id).forEach(_discountData => {
      if(_toReturn.sum > 0){
        if(_discountData.is_percentual){
          const _discountInPercent = ((_discountData?.value || 0) * 1);
          const _discount = _toReturn.sum * (0.01 * _discountInPercent)
          _toReturn.sum -= _discount;
        } else{
          _toReturn.sum -= ((_discountData?.value || 0) * 1);
        }
      }
    });

    const _totalWithTax = _toReturn.taxableItems.reduce((total, current) => total + (current?.total_tax || 0), _toReturn.sum);
    _toReturn.sumWithTax = _totalWithTax > 0 ? _totalWithTax : 0;
    return _toReturn;
  }

  public static getGridApiAllData(api, includeData=true, filterFunc?: (a, b?, c?) => boolean): any[]{
    const _data: any[] = [];
    let _i = 0;
    api?.forEachNode(_node => {
      if(!filterFunc || filterFunc(_node, _i++)){
        _data.push(includeData ? _node.data : _node);
      }
    });
    return _data;
  }

  public static remapActualPosition(contentResult: any[] = []) : any[] {
    let _pos = 1;
    let _child = 0.0;
    let _isPreviousGroupChild = false;
    return contentResult.map(_data => {
      if(_data){
        if(![Position.typesValue.product_position.id, Position.typesValue.standard_position.id, Position.typesValue.group_position.id].includes(_data.type?.id)){
          delete _data.quantity;
          delete _data.unit;
          delete _data.unit_price;
          delete _data.discount_in_percent;
          delete _data.total_sum;
        }

        _data.actual_position = '';
        if(_data.show_pos_nr || [Position.typesValue.product_position.id, Position.typesValue.standard_position.id].includes(_data.type?.id)){
          if(_isPreviousGroupChild && !_data.parent){
            _pos++;
          }
          _data.actual_position = _pos;

          if(_data.parent){
            _child = _child + 0.01;
            _data.actual_position = _pos + _child;
            _isPreviousGroupChild = true;
          } else {
            if(_data.type?.id != Position.typesValue.group_position.id || _isPreviousGroupChild){
              _pos++;
            }
            _child = 0.0;
            _isPreviousGroupChild = false;
          }
        }
      }
      return _data;
    });
    /* res.content.fields.push({actual_position: "Number", form: "number", field: "actual_position", required: false}); */
    //return res;
  }

  public static getTestData(_label_from_type: string){
    //RT TODO switch case based from label / template_type
    const _toReturn = {
      "id": 2,
      "ref": "",
      "name": `Sample ${_label_from_type}`,
      "title": "default value",
      "mwst_is_net": false,
      "show_position_taxes": true,
      "is_valid_from": "2023-06-09T00:00:00+02:00",
      "is_valid_until": "2023-06-09T00:00:00+02:00",
      "total_w_tax": "0.00",
      "total_wo_tax": "0.00",
      "show_total": true,
      "network_link": "network_link",
      "header": "Header",
      "footer": "Footer",
      "api_reference": "api_reference",
      "updated_at": "2023-06-02T16:46:28.350523+02:00",
      "viewed_by_client_at": "viewed_by_client_at",
      "company": {
        "id": 1,
        "name": "Andreas Pelz",
        "logo": "https://test.eagna.io/media/contact/1_Andreas_Pelz/company/logo/eg_rd_black_0-5x.png"
      },
      "contact": {
        "id": 1,
        "name": "Eugene Harper",
        "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png"
      },
      "user": {
        "id": 3,
        "name": "RTs Tolen",
        "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg"
      },
      "project": {
        "name": "Nuclear",
        "id": 1
      },
      "language": {
        "name": "TAGALOG",
        "id": 1
      },
      "bank_account": {
        "name": "name",
        "id": 1
      },
      "currency": {
        "name": "USD",
        "id": 92
      },
      "payment_type": {
        "name": "Checks",
        "id": 2
      },
      "kb_terms_of_payment": null,
      "mwst_type": null,
      "invoice_address": null,
      "delivery_address": null,
      "tax": {
        "name": "Compare nearly throughout our continue would. Maybe analysis I life beyond.",
        "id": 1
      },
      "status": {
        "id": 4,
        "name": "Work In Progress",
        "icon": "fa-solid fa-pencil",
        "color_class": "bg-success-faded text-success"
      },
      "process": null,
      /* 344, 345, 346, 347 */
      "positions": [
        {
            "id": 344,
            "name": null,
            "parent": null,
            "text": "<p><strong>evolve synergistic e-tailers</strong><br>Coach base old nature. Child six standard law past read. Red gun yard of throughout pattern pull.<br><br></p>",
            "quantity": "123.00",
            "unit_price": "49.00",
            "discount_in_percent": "0.1",
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 1,
            "show_pos_nr": true,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
                "name": "SubTotal Position",
                "id": 6
            },
            "account": {
                "name": "Rather safe board thank star he.",
                "id": 1
            },
            "tax": {
                "id": 14,
                "name": "name",
                "tax_rate": "0.095",
                "list_country": "Andorra",
                "continent": "Europe",
                "type": "Higher rate",
                "description": "Financial services",
                "country": 7
            },
            "unit": {
                "name": "E/D3",
                "id": 54
            },
            "article": {
                "name": "evolve synergistic e-tailers",
                "id": 2
            },
            "__data__": {
                "type": {
                    "id": 6,
                    "name": "SubTotal Position"
                },
                "unit": {
                    "id": 54,
                    "name": "E/D3",
                    "system": {
                        "name": "B/C8",
                        "id": 36
                    },
                    "__data__": {
                        "system": {
                            "id": 36,
                            "name": "B/C8"
                        }
                    }
                },
                "account": {
                    "id": 1,
                    "code": "BEC83",
                    "name": "Rather safe board thank star he.",
                    "title": "Pretty old me address cut face. Want continue mind music.",
                    "description": "Around family develop where throw six could.",
                    "acct_std": {
                        "name": "Interest instead action sell off.",
                        "id": 93
                    },
                    "__data__": {
                        "acct_std": {
                            "id": 93,
                            "code": "ACE81",
                            "name": "Interest instead action sell off.",
                            "title": "Hair role thank. Teacher she itself most worker person key. I new find south scientist street.",
                            "description": "Industry car shoulder leave someone maybe gun tell.",
                            "files": []
                        }
                    }
                },
                "tax": {
                    "id": 14,
                    "name": "name",
                    "tax_rate": "0.095",
                    "list_country": "Andorra",
                    "continent": "Europe",
                    "type": "Higher rate",
                    "description": "Financial services",
                    "country": 7
                },
                "article": {
                    "id": 2,
                    "deliverer_code": "BD-18",
                    "deliverer_name": "Gaines Group",
                    "deliverer_description": "Know simply him bag prevent law. Become seat apply add world investment.",
                    "code": "AD-05",
                    "name": "evolve synergistic e-tailers",
                    "description": "Coach base old nature. Child six standard law past read. Red gun yard of throughout pattern pull.",
                    "purchase_price": "26.00",
                    "sale_price": "49.00",
                    "purchase_total": "21.00",
                    "sale_total": "22.00",
                    "is_stock": false,
                    "stock_nr": 49,
                    "stock_min_nr": 54,
                    "stock_reserved_nr": 0,
                    "stock_available_nr": 0,
                    "stock_picked_nr": 0,
                    "stock_disposed_nr": 0,
                    "stock_ordered_nr": 0,
                    "width": "97.00",
                    "height": "28.00",
                    "weight": "30.00",
                    "volume": "81.00",
                    "html_text": "Drive clearly successful data role tough west. Capital since theory close girl between former.",
                    "remarks": "Program article able. Difference begin difference development purpose ready.",
                    "delivery_price": "59.00",
                    "article_group_id": 17,
                    "user": {
                        "id": 3,
                        "name": "RTs Tolen",
                        "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg"
                    },
                    "company": null,
                    "contact": null,
                    "article_type": {
                        "name": "and Sons",
                        "id": 19
                    },
                    "currency": {
                        "name": "MUR",
                        "id": 100
                    },
                    "tax_income": {
                        "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                        "id": 41
                    },
                    "tax_expense": {
                        "name": "Hospital few local until.\nAbility drug same. Night visit central him present economy try.",
                        "id": 15
                    },
                    "unit": {
                        "name": "E/D3",
                        "id": 54
                    },
                    "stock_location": {
                        "name": "Rodriguez-Ewing",
                        "id": 36
                    },
                    "stock_area": {
                        "name": "AA-67",
                        "id": 63
                    },
                    "files": [],
                    "task": [],
                    "__data__": {
                        "article_type": {
                            "id": 19,
                            "name": "and Sons"
                        },
                        "currency": {
                            "id": 100,
                            "code": "NPR",
                            "name": "MUR",
                            "round_factor": "93.00"
                        },
                        "tax_income": {
                            "id": 41,
                            "uuid": "9884c237-6add-4411-9ca7-01232cdd62fe",
                            "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                            "code": "B/A8",
                            "digit": 25,
                            "type": "Open",
                            "tax_settlement_type": "97",
                            "value": "6.00",
                            "net_tax_value": "20.00",
                            "start_year": "1980-06-16T00:00:00+02:00",
                            "end_year": "1973-09-30T00:00:00+01:00",
                            "is_active": true,
                            "display_name": "Open",
                            "acct_code_defn": {
                                "name": "Tv attention view citizen some front.",
                                "id": 31
                            },
                            "files": []
                        },
                        "tax_expense": {
                            "id": 15,
                            "uuid": "fd8172c0-668a-49f5-bfaa-846191b4d6fe",
                            "name": "Hospital few local until.\nAbility drug same. Night visit central him present economy try.",
                            "code": "D/C3",
                            "digit": 32,
                            "type": "Open",
                            "tax_settlement_type": "68",
                            "value": "70.00",
                            "net_tax_value": "56.00",
                            "start_year": "2008-02-02T00:00:00+01:00",
                            "end_year": "1982-12-16T00:00:00+01:00",
                            "is_active": false,
                            "display_name": "Open",
                            "acct_code_defn": {
                                "name": "Ago particular right.",
                                "id": 78
                            },
                            "files": []
                        },
                        "unit": {
                            "id": 54,
                            "name": "E/D3",
                            "system": {
                                "name": "B/C8",
                                "id": 36
                            }
                        },
                        "stock_location": {
                            "id": 36,
                            "name": "Rodriguez-Ewing",
                            "city": "Winsford",
                            "country": "GB",
                            "state": "Europe/London",
                            "lat": "53.19146",
                            "lon": "-2.52398",
                            "files": []
                        },
                        "stock_area": {
                            "id": 63,
                            "name": "AA-67",
                            "type": "Warehouse",
                            "shelf": "ED-61",
                            "stack": "BA-89",
                            "lane": "EDCA-94",
                            "area": "BJA2969",
                            "files": []
                        },
                        "user": {
                            "id": 3,
                            "is_superuser": true,
                            "is_staff": true,
                            "is_active": true,
                            "country": "Algeria",
                            "app_metadata": [],
                            "blocked": false,
                            "created_at": "2023-03-24T07:45:43.062893+01:00",
                            "is_deactivated": false,
                            "email_verified": false,
                            "email": "randy.tolentino@eagna.io",
                            "first_name": "RTs",
                            "last_name": "Tolen",
                            "user_metadata": [],
                            "identities": [],
                            "last_ip": "90.187.210.41",
                            "last_login": "2023-10-11T16:57:28.998170+02:00",
                            "last_password_reset": "2023-03-24T07:45:43.062907+01:00",
                            "logins_count": 0,
                            "multifactor": "google",
                            "phone_number": "010 10101010",
                            "phone_verified": false,
                            "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg",
                            "avatar": "https://test.eagna.io/media/user/3_RTs_Tole/avatar/331294686_897967834661437_8946897111296551985_n.jpg",
                            "date_joined": "2023-03-24T07:45:43.062871+01:00",
                            "updated_at": "2023-03-24T07:45:43.062930+01:00",
                            "user_id": "010 10101010",
                            "provider": "Eagna",
                            "locale": "en",
                            "globalMenubarPref": true,
                            "globalGridPref": true,
                            "globalChartPref": true,
                            "globalScheme": "auto",
                            "provision": "unknown",
                            "provision_app": "unknown",
                            "provision_uri": "",
                            "provision_verified": false,
                            "isExternal": false,
                            "hasNotification": false,
                            "username": "ranran",
                            "groups": [],
                            "user_permissions": [],
                            "role": [],
                            "files": [],
                            "name": "RTs Tolen"
                        },
                        "contact": {
                            "addressBy": "",
                            "title": "",
                            "first_name": "",
                            "last_name": "",
                            "gender": "",
                            "country": "",
                            "date_of_birth": null,
                            "picture": null,
                            "job": "",
                            "email": "",
                            "email_2": "",
                            "phone": "",
                            "phone_2": "",
                            "mobile": "",
                            "fax_number": "",
                            "social": "",
                            "teams": "",
                            "created_at": null,
                            "updated_at": null,
                            "language": null,
                            "company": null,
                            "address": null,
                            "contact_partner": null,
                            "owner": null,
                            "role": null,
                            "category": null,
                            "sector": null,
                            "files": []
                        },
                        "company": {
                            "name": "",
                            "logo": null,
                            "legal_form": "",
                            "suffix_name": "",
                            "abbreviation": "",
                            "registration_no": "",
                            "vat_no": "",
                            "vat_id_no": "",
                            "website": "",
                            "instagram": "",
                            "facebook": "",
                            "twitter": "",
                            "teams": "",
                            "skype": "",
                            "email": "",
                            "email_2": "",
                            "phone": "",
                            "phone_2": "",
                            "mobile": "",
                            "fax_number": "",
                            "created_at": null,
                            "updated_at": null,
                            "contact_partner": null,
                            "owner": null,
                            "billing_add": null,
                            "reg_add": null,
                            "shipping_add": null,
                            "units": null,
                            "language": null,
                            "category": null,
                            "sector": null,
                            "role": null,
                            "files": []
                        }
                    }
                }
            }
        },
        {
            "id": 345,
            "name": null,
            "parent": null,
            "text": "<p>Text <strong>Text </strong>Text</p>",
            "quantity": "98.00",
            "unit_price": "98.00",
            "discount_in_percent": "0.08",
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 2,
            "show_pos_nr": true,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
                "name": "SubTotal Position",
                "id": 6
            },
            "account": null,
            "tax": {
                "id": 3,
                "name": "name",
                "tax_rate": "0.100",
                "list_country": "Afghanistan",
                "continent": "Asia",
                "type": "Higher Rate",
                "description": "Luxury hotels and restaurants; telecom services",
                "country": 2
            },
            "unit": {
                "name": "E/E6",
                "id": 3
            },
            "article": null,
            "__data__": {
                "type": {
                    "id": 6,
                    "name": "SubTotal Position"
                },
                "unit": {
                    "id": 3,
                    "name": "E/E6",
                    "system": {
                        "name": "A/A0",
                        "id": 68
                    },
                    "__data__": {
                        "system": {
                            "id": 68,
                            "name": "A/A0"
                        }
                    }
                },
                "account": {
                    "code": "",
                    "name": "",
                    "title": "",
                    "description": "",
                    "acct_std": null
                },
                "tax": {
                    "id": 3,
                    "name": "name",
                    "tax_rate": "0.100",
                    "list_country": "Afghanistan",
                    "continent": "Asia",
                    "type": "Higher Rate",
                    "description": "Luxury hotels and restaurants; telecom services",
                    "country": 2
                },
                "article": {
                    "deliverer_code": "",
                    "deliverer_name": "",
                    "deliverer_description": "",
                    "code": "",
                    "name": "",
                    "description": "",
                    "purchase_price": null,
                    "sale_price": null,
                    "purchase_total": null,
                    "sale_total": null,
                    "is_stock": false,
                    "stock_nr": null,
                    "stock_min_nr": null,
                    "stock_reserved_nr": null,
                    "stock_available_nr": null,
                    "stock_picked_nr": null,
                    "stock_disposed_nr": null,
                    "stock_ordered_nr": null,
                    "width": null,
                    "height": null,
                    "weight": null,
                    "volume": null,
                    "html_text": "",
                    "remarks": "",
                    "delivery_price": null,
                    "article_group_id": null,
                    "user": null,
                    "company": null,
                    "contact": null,
                    "article_type": null,
                    "currency": null,
                    "tax_income": null,
                    "tax_expense": null,
                    "unit": null,
                    "stock_location": null,
                    "stock_area": null,
                    "files": [],
                    "task": []
                }
            }
        },
        {
            "id": 346,
            "name": null,
            "parent": null,
            "text": "<p><strong>innovate bricks-and-clicks markets</strong><br>Break dog let style prevent. Yes mind threat real.<br><br></p>",
            "quantity": "97.00",
            "unit_price": "190.00",
            "discount_in_percent": null,
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 3,
            "show_pos_nr": false,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
                "name": "SubTotal Position",
                "id": 6
            },
            "account": {
                "name": "Because ground country.",
                "id": 7
            },
            "tax": {
                "id": 3,
                "name": "name",
                "tax_rate": "0.100",
                "list_country": "Afghanistan",
                "continent": "Asia",
                "type": "Higher Rate",
                "description": "Luxury hotels and restaurants; telecom services",
                "country": 2
            },
            "unit": {
                "name": "D/E2",
                "id": 22
            },
            "article": {
                "name": "innovate bricks-and-clicks markets",
                "id": 4
            },
            "__data__": {
                "type": {
                    "id": 6,
                    "name": "SubTotal Position"
                },
                "unit": {
                    "id": 22,
                    "name": "D/E2",
                    "system": {
                        "name": "B/D7",
                        "id": 38
                    },
                    "__data__": {
                        "system": {
                            "id": 38,
                            "name": "B/D7"
                        }
                    }
                },
                "account": {
                    "id": 7,
                    "code": "DAD94",
                    "name": "Because ground country.",
                    "title": "Their deep sometimes account be movie owner understand. Never mind hospital book help pass mind.",
                    "description": "Go single product reality current bad issue hope. Speak property tax else fish seven.",
                    "acct_std": {
                        "name": "Candidate source changes",
                        "id": 1
                    },
                    "__data__": {
                        "acct_std": {
                            "id": 1,
                            "code": "ADD612",
                            "name": "Candidate source changes",
                            "title": "xc v asdfasdfassds sdfsdf s",
                            "description": "Ten that guess. Say large paper beat finally. A feeling first program senior.",
                            "files": [
                                13,
                                15
                            ]
                        }
                    }
                },
                "tax": {
                    "id": 3,
                    "name": "name",
                    "tax_rate": "0.100",
                    "list_country": "Afghanistan",
                    "continent": "Asia",
                    "type": "Higher Rate",
                    "description": "Luxury hotels and restaurants; telecom services",
                    "country": 2
                },
                "article": {
                    "id": 4,
                    "deliverer_code": "ED-56",
                    "deliverer_name": "Ryan Ltd",
                    "deliverer_description": "Reality short detail eye. Individual ground cup land.",
                    "code": "AA-67",
                    "name": "innovate bricks-and-clicks markets",
                    "description": "Break dog let style prevent. Yes mind threat real.",
                    "purchase_price": "35.00",
                    "sale_price": "19.00",
                    "purchase_total": "93.00",
                    "sale_total": "77.00",
                    "is_stock": false,
                    "stock_nr": 1,
                    "stock_min_nr": 87,
                    "stock_reserved_nr": 0,
                    "stock_available_nr": 0,
                    "stock_picked_nr": 0,
                    "stock_disposed_nr": 0,
                    "stock_ordered_nr": 0,
                    "width": "55.00",
                    "height": "40.00",
                    "weight": "41.00",
                    "volume": "9.00",
                    "html_text": "Budget point important edge spring lead respond.",
                    "remarks": "Read word professional then can door support. Kid home control suffer job white authority.",
                    "delivery_price": "46.00",
                    "article_group_id": 54,
                    "user": {
                        "id": 3,
                        "name": "RTs Tolen",
                        "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg"
                    },
                    "company": null,
                    "contact": null,
                    "article_type": {
                        "name": "Ltd",
                        "id": 42
                    },
                    "currency": {
                        "name": "JMD",
                        "id": 96
                    },
                    "tax_income": {
                        "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                        "id": 41
                    },
                    "tax_expense": {
                        "name": "Chair manager simple apply there stop. To sport while dog past.",
                        "id": 9
                    },
                    "unit": {
                        "name": "D/E2",
                        "id": 22
                    },
                    "stock_location": {
                        "name": "Allen and Sons",
                        "id": 25
                    },
                    "stock_area": {
                        "name": "AE-17",
                        "id": 81
                    },
                    "files": [],
                    "task": [],
                    "__data__": {
                        "article_type": {
                            "id": 42,
                            "name": "Ltd"
                        },
                        "currency": {
                            "id": 96,
                            "code": "MUR",
                            "name": "JMD",
                            "round_factor": "48.00"
                        },
                        "tax_income": {
                            "id": 41,
                            "uuid": "9884c237-6add-4411-9ca7-01232cdd62fe",
                            "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                            "code": "B/A8",
                            "digit": 25,
                            "type": "Open",
                            "tax_settlement_type": "97",
                            "value": "6.00",
                            "net_tax_value": "20.00",
                            "start_year": "1980-06-16T00:00:00+02:00",
                            "end_year": "1973-09-30T00:00:00+01:00",
                            "is_active": true,
                            "display_name": "Open",
                            "acct_code_defn": {
                                "name": "Tv attention view citizen some front.",
                                "id": 31
                            },
                            "files": []
                        },
                        "tax_expense": {
                            "id": 9,
                            "uuid": "bd9188dd-12ac-4e8c-b8c1-6fb35bfc1c5e",
                            "name": "Chair manager simple apply there stop. To sport while dog past.",
                            "code": "E/A5",
                            "digit": 8,
                            "type": "Open",
                            "tax_settlement_type": "77",
                            "value": "94.00",
                            "net_tax_value": "1.00",
                            "start_year": "2013-12-02T00:00:00+01:00",
                            "end_year": "1994-02-11T00:00:00+01:00",
                            "is_active": false,
                            "display_name": "Open",
                            "acct_code_defn": {
                                "name": "Glass daughter after tonight rule.",
                                "id": 41
                            },
                            "files": []
                        },
                        "unit": {
                            "id": 22,
                            "name": "D/E2",
                            "system": {
                                "name": "B/D7",
                                "id": 38
                            }
                        },
                        "stock_location": {
                            "id": 25,
                            "name": "Allen and Sons",
                            "city": "Bron",
                            "country": "FR",
                            "state": "Europe/Paris",
                            "lat": "45.73333",
                            "lon": "4.91667",
                            "files": []
                        },
                        "stock_area": {
                            "id": 81,
                            "name": "AE-17",
                            "type": "Warehouse",
                            "shelf": "BB-30",
                            "stack": "AE-66",
                            "lane": "DDCD-94",
                            "area": "3Q851",
                            "files": []
                        },
                        "user": {
                            "id": 3,
                            "is_superuser": true,
                            "is_staff": true,
                            "is_active": true,
                            "country": "Algeria",
                            "app_metadata": [],
                            "blocked": false,
                            "created_at": "2023-03-24T07:45:43.062893+01:00",
                            "is_deactivated": false,
                            "email_verified": false,
                            "email": "randy.tolentino@eagna.io",
                            "first_name": "RTs",
                            "last_name": "Tolen",
                            "user_metadata": [],
                            "identities": [],
                            "last_ip": "90.187.210.41",
                            "last_login": "2023-10-11T16:57:28.998170+02:00",
                            "last_password_reset": "2023-03-24T07:45:43.062907+01:00",
                            "logins_count": 0,
                            "multifactor": "google",
                            "phone_number": "010 10101010",
                            "phone_verified": false,
                            "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg",
                            "avatar": "https://test.eagna.io/media/user/3_RTs_Tole/avatar/331294686_897967834661437_8946897111296551985_n.jpg",
                            "date_joined": "2023-03-24T07:45:43.062871+01:00",
                            "updated_at": "2023-03-24T07:45:43.062930+01:00",
                            "user_id": "010 10101010",
                            "provider": "Eagna",
                            "locale": "en",
                            "globalMenubarPref": true,
                            "globalGridPref": true,
                            "globalChartPref": true,
                            "globalScheme": "auto",
                            "provision": "unknown",
                            "provision_app": "unknown",
                            "provision_uri": "",
                            "provision_verified": false,
                            "isExternal": false,
                            "hasNotification": false,
                            "username": "ranran",
                            "groups": [],
                            "user_permissions": [],
                            "role": [],
                            "files": [],
                            "name": "RTs Tolen"
                        },
                        "contact": {
                            "addressBy": "",
                            "title": "",
                            "first_name": "",
                            "last_name": "",
                            "gender": "",
                            "country": "",
                            "date_of_birth": null,
                            "picture": null,
                            "job": "",
                            "email": "",
                            "email_2": "",
                            "phone": "",
                            "phone_2": "",
                            "mobile": "",
                            "fax_number": "",
                            "social": "",
                            "teams": "",
                            "created_at": null,
                            "updated_at": null,
                            "language": null,
                            "company": null,
                            "address": null,
                            "contact_partner": null,
                            "owner": null,
                            "role": null,
                            "category": null,
                            "sector": null,
                            "files": []
                        },
                        "company": {
                            "name": "",
                            "logo": null,
                            "legal_form": "",
                            "suffix_name": "",
                            "abbreviation": "",
                            "registration_no": "",
                            "vat_no": "",
                            "vat_id_no": "",
                            "website": "",
                            "instagram": "",
                            "facebook": "",
                            "twitter": "",
                            "teams": "",
                            "skype": "",
                            "email": "",
                            "email_2": "",
                            "phone": "",
                            "phone_2": "",
                            "mobile": "",
                            "fax_number": "",
                            "created_at": null,
                            "updated_at": null,
                            "contact_partner": null,
                            "owner": null,
                            "billing_add": null,
                            "reg_add": null,
                            "shipping_add": null,
                            "units": null,
                            "language": null,
                            "category": null,
                            "sector": null,
                            "role": null,
                            "files": []
                        }
                    }
                }
            }
        },
        {
            "id": 347,
            "name": null,
            "parent": null,
            "text": "<p>Discount</p>",
            "quantity": null,
            "unit_price": null,
            "discount_in_percent": null,
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 4,
            "show_pos_nr": false,
            "is_optional": false,
            "is_percentual": true,
            "value": "2",
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
                "name": "Text Position",
                "id": 3
            },
            "account": null,
            "tax": null,
            "unit": null,
            "article": null,
            "__data__": {
                "type": {
                    "id": 3,
                    "name": "Text Position"
                },
                "unit": {
                    "name": "",
                    "system": null
                },
                "account": {
                    "code": "",
                    "name": "",
                    "title": "",
                    "description": "",
                    "acct_std": null
                },
                "tax": {
                    "name": "",
                    "tax_rate": null,
                    "list_country": "",
                    "continent": "",
                    "type": "",
                    "description": "",
                    "country": null
                },
                "article": {
                    "deliverer_code": "",
                    "deliverer_name": "",
                    "deliverer_description": "",
                    "code": "",
                    "name": "",
                    "description": "",
                    "purchase_price": null,
                    "sale_price": null,
                    "purchase_total": null,
                    "sale_total": null,
                    "is_stock": false,
                    "stock_nr": null,
                    "stock_min_nr": null,
                    "stock_reserved_nr": null,
                    "stock_available_nr": null,
                    "stock_picked_nr": null,
                    "stock_disposed_nr": null,
                    "stock_ordered_nr": null,
                    "width": null,
                    "height": null,
                    "weight": null,
                    "volume": null,
                    "html_text": "",
                    "remarks": "",
                    "delivery_price": null,
                    "article_group_id": null,
                    "user": null,
                    "company": null,
                    "contact": null,
                    "article_type": null,
                    "currency": null,
                    "tax_income": null,
                    "tax_expense": null,
                    "unit": null,
                    "stock_location": null,
                    "stock_area": null,
                    "files": [],
                    "task": []
                }
            }
        }
      ],
      "files": [
        []
      ],
      "__data__": {
        "company": {
          "id": 1,
          "name": "Andreas Pelz",
          "logo": "https://test.eagna.io/media/contact/1_Andreas_Pelz/company/logo/eg_rd_black_0-5x.png",
          "__data__": {
            "reg_add": {
              "id": 143,
              "po_box": "po",
              "name": "Rolls-Royce Germany Ltd. & Co. KG",
              "formatted_address": "Hohemarkstraße 60-70, 61440 Oberursel (Taunus), Germany",
              "street": "Hohemarkstraße",
              "bldgNumber": "60-70",
              "city": "Oberursel (Taunus)",
              "state": "Hessen",
              "zipcode": "61440",
              "country": "Germany",
              "lat": "50.2111305",
              "lon": "8.567005800000002",
              "type": "point_of_interest,establishment",
              "place_id": "ChIJ98QhlGyovUcRFcRMNzGzfks",
              "plus_code": "9F2C6H68+FR",
              "icon": "types",
              "status": "OPERATIONAL"
            },
          }
        },
        /* "company": {
          "id": 1,
          "name": "Andreas Pelz",
          "logo": "https://test.eagna.io/media/contact/1_Andreas_Pelz/company/logo/eg_rd_black_0-5x.png",
          "legal_form": "Group",
          "suffix_name": "PLC",
          "abbreviation": "CAD",
          "registration_no": "EB-76457142",
          "vat_no": "DD-21775647",
          "vat_id_no": "EE-68695903",
          "website": "https://www.form-foundation.de",
          "instagram": "@instagram",
          "facebook": "@instagram",
          "twitter": "@instagram",
          "teams": "@instagram",
          "skype": "@instagram",
          "email": "christinamccormick@gmail.com",
          "email_2": "christinamccormick@gmail.com",
          "phone": "+1-546-346-2125x162",
          "phone_2": "+1-676-122-1316x28828",
          "mobile": "001-975-364-2677x0441",
          "fax_number": "(579)370-7533x947",
          "created_at": "2023-03-24T07:58:50.319924+01:00",
          "updated_at": "2023-03-24T07:58:50.319934+01:00",
          "contact_partner": null,
          "owner": null,
          "billing_add": 41,
          "reg_add": 143,
          "shipping_add": 41,
          "units": null,
          "language": {
            "name": "ENG",
            "id": 2
          },
          "category": {
            "name": "PO-Nummer",
            "id": 3
          },
          "sector": null,
          "role": null,
          "files": [],
          "billing": {
            "name": "064 Bridges Common Suite 920",
            "id": 41
          },
          "registered": {
            "name": "Hohemarkstraße 60-70, 61440 Oberursel (Taunus), Germany",
            "id": 143
          },
          "shipping": {
            "name": "064 Bridges Common Suite 920",
            "id": 41
          },
          "__data__": {
            "billing_add": {
              "id": 41,
              "po_box": "PO-183",
              "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
              "formatted_address": "064 Bridges Common Suite 920",
              "street": "17650 Brittany Inlet",
              "bldgNumber": "90247",
              "city": "West Janet",
              "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
              "zipcode": "85522",
              "country": "Trinidad and Tobago",
              "lat": "53.430870",
              "lon": "160.083699",
              "type": "Office",
              "place_id": "80322",
              "plus_code": "04701",
              "icon": "fa-solid fa-user",
              "status": "ACTIVE"
            },
            "reg_add": {
              "id": 143,
              "po_box": "po",
              "name": "Rolls-Royce Germany Ltd. & Co. KG",
              "formatted_address": "Hohemarkstraße 60-70, 61440 Oberursel (Taunus), Germany",
              "street": "Hohemarkstraße",
              "bldgNumber": "60-70",
              "city": "Oberursel (Taunus)",
              "state": "Hessen",
              "zipcode": "61440",
              "country": "Germany",
              "lat": "50.2111305",
              "lon": "8.567005800000002",
              "type": "point_of_interest,establishment",
              "place_id": "ChIJ98QhlGyovUcRFcRMNzGzfks",
              "plus_code": "9F2C6H68+FR",
              "icon": "types",
              "status": "OPERATIONAL"
            },
            "shipping_add": {
              "id": 41,
              "po_box": "PO-183",
              "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
              "formatted_address": "064 Bridges Common Suite 920",
              "street": "17650 Brittany Inlet",
              "bldgNumber": "90247",
              "city": "West Janet",
              "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
              "zipcode": "85522",
              "country": "Trinidad and Tobago",
              "lat": "53.430870",
              "lon": "160.083699",
              "type": "Office",
              "place_id": "80322",
              "plus_code": "04701",
              "icon": "fa-solid fa-user",
              "status": "ACTIVE"
            },
            "contact_partner": {
              "password": "",
              "is_superuser": false,
              "is_staff": false,
              "is_active": false,
              "country": "",
              "app_metadata": null,
              "blocked": false,
              "created_at": null,
              "is_deactivated": false,
              "email_verified": false,
              "email": "",
              "first_name": "",
              "last_name": "",
              "user_metadata": null,
              "identities": null,
              "last_ip": "",
              "last_login": null,
              "last_password_reset": null,
              "logins_count": null,
              "multifactor": "",
              "phone_number": "",
              "phone_verified": false,
              "picture": null,
              "avatar": null,
              "date_joined": null,
              "updated_at": null,
              "user_id": "",
              "provider": "",
              "locale": "",
              "globalMenubarPref": false,
              "globalGridPref": false,
              "globalChartPref": false,
              "globalScheme": "",
              "provision": "",
              "provision_app": "",
              "provision_uri": "",
              "provision_verified": false,
              "isExternal": false,
              "hasNotification": false,
              "username": "",
              "groups": [],
              "user_permissions": [],
              "role": [],
              "files": []
            },
            "owner": {
              "password": "",
              "is_superuser": false,
              "is_staff": false,
              "is_active": false,
              "country": "",
              "app_metadata": null,
              "blocked": false,
              "created_at": null,
              "is_deactivated": false,
              "email_verified": false,
              "email": "",
              "first_name": "",
              "last_name": "",
              "user_metadata": null,
              "identities": null,
              "last_ip": "",
              "last_login": null,
              "last_password_reset": null,
              "logins_count": null,
              "multifactor": "",
              "phone_number": "",
              "phone_verified": false,
              "picture": null,
              "avatar": null,
              "date_joined": null,
              "updated_at": null,
              "user_id": "",
              "provider": "",
              "locale": "",
              "globalMenubarPref": false,
              "globalGridPref": false,
              "globalChartPref": false,
              "globalScheme": "",
              "provision": "",
              "provision_app": "",
              "provision_uri": "",
              "provision_verified": false,
              "isExternal": false,
              "hasNotification": false,
              "username": "",
              "groups": [],
              "user_permissions": [],
              "role": [],
              "files": []
            },
            "language": {
              "id": 2,
              "name": "ENGLISH",
              "language": "ENG",
              "code_2": "EN",
              "code_3": "EN"
            },
            "category": {
              "id": 3,
              "name": "PO-Nummer",
              "memo": {
                "name": "Fisheries officer",
                "id": 64
              },
              "__data__": {
                "memo": {
                  "id": 64,
                  "name": "Fisheries officer",
                  "visible_in": "{}"
                }
              }
            },
            "sector": {
              "name": ""
            },
            "role": {
              "name": "",
              "title": "",
              "abbreviation": "",
              "create": false,
              "read": false,
              "update": false,
              "delete": false,
              "archive": false,
              "override": false
            },
            "contacts": []
          }
        },
        "contact": {
          "id": 1,
          "addressBy": "Mr.",
          "title": "Dr.",
          "first_name": "Eugene",
          "last_name": "Harper",
          "gender": "M",
          "country": "Tonga",
          "date_of_birth": "1926-08-07T00:00:00+01:00",
          "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
          "job": "Corporate investment banker",
          "email": "lsmith@gmail.com",
          "email_2": "lsmith@gmail.com",
          "phone": "123123123",
          "phone_2": "5157448930",
          "mobile": "123123",
          "fax_number": "001-440-716-4976x86210",
          "social": "@isntagram",
          "teams": "@teams",
          "created_at": "2023-03-24T07:58:51.140330+01:00",
          "updated_at": "2023-03-24T07:58:51.140341+01:00",
          "language": null,
          "company": {
            "id": 51,
            "name": "Adams, Davis and Gonzalez",
            "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
          },
          "address": {
            "name": "338 Kenneth Tunnel",
            "id": 26
          },
          "contact_partner": null,
          "owner": null,
          "role": null,
          "category": null,
          "sector": null,
          "files": [],
          "name": "Eugene Harper",
          "isBirthday": false,
          "__data__": {
            "address": {
              "id": 26,
              "po_box": "PO-183",
              "name": "20701 Anthony Shoals\nNew Jeffrey, SD 59509",
              "formatted_address": "338 Kenneth Tunnel",
              "street": "67008 Baker Prairie",
              "bldgNumber": "84763",
              "city": "Johnton",
              "state": "40198 Rodgers Landing Apt. 314\nJohnsonmouth, MT 78457",
              "zipcode": "55194",
              "country": "Ghana",
              "lat": "30.717377",
              "lon": "-97.248583",
              "type": "Office",
              "place_id": "64657",
              "plus_code": "08226",
              "icon": "fa-solid fa-user",
              "status": "ACTIVE"
            },
            "contact_partner": {
              "password": "",
              "is_superuser": false,
              "is_staff": false,
              "is_active": false,
              "country": "",
              "app_metadata": null,
              "blocked": false,
              "created_at": null,
              "is_deactivated": false,
              "email_verified": false,
              "email": "",
              "first_name": "",
              "last_name": "",
              "user_metadata": null,
              "identities": null,
              "last_ip": "",
              "last_login": null,
              "last_password_reset": null,
              "logins_count": null,
              "multifactor": "",
              "phone_number": "",
              "phone_verified": false,
              "picture": null,
              "avatar": null,
              "date_joined": null,
              "updated_at": null,
              "user_id": "",
              "provider": "",
              "locale": "",
              "globalMenubarPref": false,
              "globalGridPref": false,
              "globalChartPref": false,
              "globalScheme": "",
              "provision": "",
              "provision_app": "",
              "provision_uri": "",
              "provision_verified": false,
              "isExternal": false,
              "hasNotification": false,
              "username": "",
              "groups": [],
              "user_permissions": [],
              "role": [],
              "files": []
            },
            "owner": {
              "password": "",
              "is_superuser": false,
              "is_staff": false,
              "is_active": false,
              "country": "",
              "app_metadata": null,
              "blocked": false,
              "created_at": null,
              "is_deactivated": false,
              "email_verified": false,
              "email": "",
              "first_name": "",
              "last_name": "",
              "user_metadata": null,
              "identities": null,
              "last_ip": "",
              "last_login": null,
              "last_password_reset": null,
              "logins_count": null,
              "multifactor": "",
              "phone_number": "",
              "phone_verified": false,
              "picture": null,
              "avatar": null,
              "date_joined": null,
              "updated_at": null,
              "user_id": "",
              "provider": "",
              "locale": "",
              "globalMenubarPref": false,
              "globalGridPref": false,
              "globalChartPref": false,
              "globalScheme": "",
              "provision": "",
              "provision_app": "",
              "provision_uri": "",
              "provision_verified": false,
              "isExternal": false,
              "hasNotification": false,
              "username": "",
              "groups": [],
              "user_permissions": [],
              "role": [],
              "files": []
            },
            "language": {
              "name": "",
              "language": "",
              "code_2": "",
              "code_3": ""
            },
            "category": {
              "name": "",
              "memo": null
            },
            "sector": {
              "name": ""
            },
            "role": {
              "name": "",
              "title": "",
              "abbreviation": "",
              "create": false,
              "read": false,
              "update": false,
              "delete": false,
              "archive": false,
              "override": false
            },
            "company": {
              "id": 51,
              "name": "Adams, Davis and Gonzalez",
              "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg",
              "legal_form": "PLC",
              "suffix_name": "Inc",
              "abbreviation": "BBA",
              "registration_no": "CE-78196443",
              "vat_no": "DE-72250245",
              "vat_id_no": "DD-34225147",
              "website": "https://www.form-foundation.de",
              "instagram": "@instagram",
              "facebook": "@instagram",
              "twitter": "@instagram",
              "teams": "@instagram",
              "skype": "@instagram",
              "email": "christinamccormick@gmail.com",
              "email_2": "christinamccormick@gmail.com",
              "phone": "001-828-757-2370x16632",
              "phone_2": "316.837.1743x681",
              "mobile": "(155)316-1767",
              "fax_number": "(832)745-2099x98216",
              "created_at": "2023-03-24T07:58:50.713636+01:00",
              "updated_at": "2023-03-24T07:58:50.713647+01:00",
              "contact_partner": null,
              "owner": null,
              "billing_add": 41,
              "reg_add": 41,
              "shipping_add": 41,
              "units": null,
              "language": null,
              "category": null,
              "sector": null,
              "role": null,
              "files": [],
              "billing": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "registered": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "shipping": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "__data__": {
                "billing_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "reg_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "shipping_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "contact_partner": {
                  "password": "",
                  "is_superuser": false,
                  "is_staff": false,
                  "is_active": false,
                  "country": "",
                  "app_metadata": null,
                  "blocked": false,
                  "created_at": null,
                  "is_deactivated": false,
                  "email_verified": false,
                  "email": "",
                  "first_name": "",
                  "last_name": "",
                  "user_metadata": null,
                  "identities": null,
                  "last_ip": "",
                  "last_login": null,
                  "last_password_reset": null,
                  "logins_count": null,
                  "multifactor": "",
                  "phone_number": "",
                  "phone_verified": false,
                  "picture": null,
                  "avatar": null,
                  "date_joined": null,
                  "updated_at": null,
                  "user_id": "",
                  "provider": "",
                  "locale": "",
                  "globalMenubarPref": false,
                  "globalGridPref": false,
                  "globalChartPref": false,
                  "globalScheme": "",
                  "provision": "",
                  "provision_app": "",
                  "provision_uri": "",
                  "provision_verified": false,
                  "isExternal": false,
                  "hasNotification": false,
                  "username": "",
                  "groups": [],
                  "user_permissions": [],
                  "role": [],
                  "files": []
                },
                "owner": {
                  "password": "",
                  "is_superuser": false,
                  "is_staff": false,
                  "is_active": false,
                  "country": "",
                  "app_metadata": null,
                  "blocked": false,
                  "created_at": null,
                  "is_deactivated": false,
                  "email_verified": false,
                  "email": "",
                  "first_name": "",
                  "last_name": "",
                  "user_metadata": null,
                  "identities": null,
                  "last_ip": "",
                  "last_login": null,
                  "last_password_reset": null,
                  "logins_count": null,
                  "multifactor": "",
                  "phone_number": "",
                  "phone_verified": false,
                  "picture": null,
                  "avatar": null,
                  "date_joined": null,
                  "updated_at": null,
                  "user_id": "",
                  "provider": "",
                  "locale": "",
                  "globalMenubarPref": false,
                  "globalGridPref": false,
                  "globalChartPref": false,
                  "globalScheme": "",
                  "provision": "",
                  "provision_app": "",
                  "provision_uri": "",
                  "provision_verified": false,
                  "isExternal": false,
                  "hasNotification": false,
                  "username": "",
                  "groups": [],
                  "user_permissions": [],
                  "role": [],
                  "files": []
                },
                "language": {
                  "name": "",
                  "language": "",
                  "code_2": "",
                  "code_3": ""
                },
                "category": {
                  "name": "",
                  "memo": null
                },
                "sector": {
                  "name": ""
                },
                "role": {
                  "name": "",
                  "title": "",
                  "abbreviation": "",
                  "create": false,
                  "read": false,
                  "update": false,
                  "delete": false,
                  "archive": false,
                  "override": false
                },
                "contacts": [
                  {
                    "id": 2,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Adam",
                    "last_name": "Myers",
                    "gender": "M",
                    "country": "Fiji",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "5633948207",
                    "mobile": "001-356-286-8956x45603",
                    "fax_number": "180.586.1292x7794",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.152656+01:00",
                    "updated_at": "2023-03-24T07:58:51.152665+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Adam Myers",
                    "isBirthday": false
                  },
                  {
                    "id": 3,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Elizabeth",
                    "last_name": "Dudley",
                    "gender": "M",
                    "country": "Malta",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "497-796-8209x938",
                    "mobile": "+1-414-460-3806",
                    "fax_number": "001-913-038-0141",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.159857+01:00",
                    "updated_at": "2023-03-24T07:58:51.159865+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Elizabeth Dudley",
                    "isBirthday": false
                  },
                  {
                    "id": 4,
                    "addressBy": "Jr.",
                    "title": "Ind.",
                    "first_name": "Katelyn",
                    "last_name": "Ramirez",
                    "gender": "M",
                    "country": "Gibraltar",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "954.306.8466x71264",
                    "mobile": "001-363-749-2147x943",
                    "fax_number": "7876085203",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.167566+01:00",
                    "updated_at": "2023-03-24T07:58:51.167575+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Katelyn Ramirez",
                    "isBirthday": false
                  },
                  {
                    "id": 5,
                    "addressBy": "MD",
                    "title": "Misc.",
                    "first_name": "Mary",
                    "last_name": "Ruiz",
                    "gender": "M",
                    "country": "Zambia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "4461020142",
                    "mobile": "518-107-6964x588",
                    "fax_number": "001-514-774-0460",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.175466+01:00",
                    "updated_at": "2023-03-24T07:58:51.175475+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Mary Ruiz",
                    "isBirthday": false
                  },
                  {
                    "id": 6,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Christine",
                    "last_name": "Anderson",
                    "gender": "M",
                    "country": "Bhutan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-721-154-3359x2539",
                    "mobile": "(034)489-1164x1524",
                    "fax_number": "(490)066-9860x4850",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.182184+01:00",
                    "updated_at": "2023-03-24T07:58:51.182193+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Christine Anderson",
                    "isBirthday": false
                  },
                  {
                    "id": 7,
                    "addressBy": "DVM",
                    "title": "Dr.",
                    "first_name": "Kimberly",
                    "last_name": "Norris",
                    "gender": "M",
                    "country": "Saudi Arabia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "242-208-3018x1522",
                    "mobile": "339-756-9980x57109",
                    "fax_number": "120.621.8009x97051",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.190046+01:00",
                    "updated_at": "2023-03-24T07:58:51.190053+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Kimberly Norris",
                    "isBirthday": false
                  },
                  {
                    "id": 10,
                    "addressBy": "II",
                    "title": "Mx.",
                    "first_name": "Norman",
                    "last_name": "Glenn",
                    "gender": "M",
                    "country": "Lao People's Democratic Republic",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "4907702330",
                    "mobile": "793.464.5682x467",
                    "fax_number": "732-052-9790x6148",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.216247+01:00",
                    "updated_at": "2023-03-24T07:58:51.216256+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Norman Glenn",
                    "isBirthday": false
                  },
                  {
                    "id": 12,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Anna",
                    "last_name": "Brooks",
                    "gender": "M",
                    "country": "Yemen",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "418.473.2296x5392",
                    "mobile": "+1-760-358-4971x532",
                    "fax_number": "967-075-7410x390",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.235820+01:00",
                    "updated_at": "2023-03-24T07:58:51.235830+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Anna Brooks",
                    "isBirthday": false
                  },
                  {
                    "id": 13,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Cheryl",
                    "last_name": "Briggs",
                    "gender": "M",
                    "country": "Germany",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "213.529.7060x5625",
                    "mobile": "001-433-055-3427x16337",
                    "fax_number": "9744587868",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.243877+01:00",
                    "updated_at": "2023-03-24T07:58:51.243885+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Cheryl Briggs",
                    "isBirthday": false
                  },
                  {
                    "id": 14,
                    "addressBy": "DDS",
                    "title": "Dr.",
                    "first_name": "Mark",
                    "last_name": "Hughes",
                    "gender": "M",
                    "country": "Uganda",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "333.211.8469",
                    "mobile": "(973)551-6174",
                    "fax_number": "+1-212-161-8534",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.252433+01:00",
                    "updated_at": "2023-03-24T07:58:51.252441+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Mark Hughes",
                    "isBirthday": false
                  },
                  {
                    "id": 15,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Debbie",
                    "last_name": "Brown",
                    "gender": "M",
                    "country": "Netherlands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(939)300-2952",
                    "mobile": "(505)422-2571x815",
                    "fax_number": "001-531-265-6830x51271",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.265187+01:00",
                    "updated_at": "2023-03-24T07:58:51.265198+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Debbie Brown",
                    "isBirthday": false
                  },
                  {
                    "id": 16,
                    "addressBy": "DVM",
                    "title": "Dr.",
                    "first_name": "William",
                    "last_name": "Hoover",
                    "gender": "M",
                    "country": "Saint Pierre and Miquelon",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(800)095-7376",
                    "mobile": "060.784.3873x19856",
                    "fax_number": "+1-079-181-5022x84121",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.273536+01:00",
                    "updated_at": "2023-03-24T07:58:51.273545+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "William Hoover",
                    "isBirthday": false
                  },
                  {
                    "id": 17,
                    "addressBy": "DVM",
                    "title": "Dr.",
                    "first_name": "Jonathan",
                    "last_name": "Hines",
                    "gender": "M",
                    "country": "Kuwait",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-223-007-8221",
                    "mobile": "159.396.3174x8391",
                    "fax_number": "001-538-475-0217x74863",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.281029+01:00",
                    "updated_at": "2023-03-24T07:58:51.281039+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Jonathan Hines",
                    "isBirthday": false
                  },
                  {
                    "id": 18,
                    "addressBy": "Jr.",
                    "title": "Ind.",
                    "first_name": "Ivan",
                    "last_name": "Freeman",
                    "gender": "M",
                    "country": "Cape Verde",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-460-206-2347",
                    "mobile": "(715)327-2979",
                    "fax_number": "607.548.0847",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.287650+01:00",
                    "updated_at": "2023-03-24T07:58:51.287658+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Ivan Freeman",
                    "isBirthday": false
                  },
                  {
                    "id": 19,
                    "addressBy": "DVM",
                    "title": "Misc.",
                    "first_name": "Brandon",
                    "last_name": "Smith",
                    "gender": "M",
                    "country": "Uzbekistan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "098.287.3398x097",
                    "mobile": "315-311-6281x5643",
                    "fax_number": "001-269-117-5958x08787",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.295223+01:00",
                    "updated_at": "2023-03-24T07:58:51.295233+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brandon Smith",
                    "isBirthday": false
                  },
                  {
                    "id": 20,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "Jacqueline",
                    "last_name": "Rice",
                    "gender": "M",
                    "country": "Italy",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "002.234.7569",
                    "mobile": "(908)429-7797x21475",
                    "fax_number": "+1-764-914-4752",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.301773+01:00",
                    "updated_at": "2023-03-24T07:58:51.301780+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Jacqueline Rice",
                    "isBirthday": false
                  },
                  {
                    "id": 21,
                    "addressBy": "IV",
                    "title": "Mx.",
                    "first_name": "Elizabeth",
                    "last_name": "Rhodes",
                    "gender": "M",
                    "country": "Slovenia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-064-862-3131x414",
                    "mobile": "932.342.1425",
                    "fax_number": "8507940909",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.309258+01:00",
                    "updated_at": "2023-03-24T07:58:51.309265+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Elizabeth Rhodes",
                    "isBirthday": false
                  },
                  {
                    "id": 22,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Jonathan",
                    "last_name": "Hernandez",
                    "gender": "M",
                    "country": "Slovakia (Slovak Republic)",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(892)486-9228x47714",
                    "mobile": "001-234-132-5201x621",
                    "fax_number": "+1-402-334-2591x7878",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.323200+01:00",
                    "updated_at": "2023-03-24T07:58:51.323210+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Jonathan Hernandez",
                    "isBirthday": false
                  },
                  {
                    "id": 23,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Brian",
                    "last_name": "Case",
                    "gender": "M",
                    "country": "Mali",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "406-930-6411",
                    "mobile": "0463371880",
                    "fax_number": "912.722.1038",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.332879+01:00",
                    "updated_at": "2023-03-24T07:58:51.332889+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brian Case",
                    "isBirthday": false
                  },
                  {
                    "id": 24,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Dennis",
                    "last_name": "Brown",
                    "gender": "M",
                    "country": "Sao Tome and Principe",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(407)585-3161x611",
                    "mobile": "387-337-0642x1414",
                    "fax_number": "(357)778-5370",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.341103+01:00",
                    "updated_at": "2023-03-24T07:58:51.341112+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Dennis Brown",
                    "isBirthday": false
                  },
                  {
                    "id": 25,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Theodore",
                    "last_name": "Rodriguez",
                    "gender": "M",
                    "country": "Barbados",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-832-156-6582x0382",
                    "mobile": "601.875.3279x431",
                    "fax_number": "+1-782-099-8582x6645",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.351582+01:00",
                    "updated_at": "2023-03-24T07:58:51.351592+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Theodore Rodriguez",
                    "isBirthday": false
                  },
                  {
                    "id": 1,
                    "addressBy": "Mr.",
                    "title": "Dr.",
                    "first_name": "Eugene",
                    "last_name": "Harper",
                    "gender": "M",
                    "country": "Tonga",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "123123123",
                    "phone_2": "5157448930",
                    "mobile": "123123",
                    "fax_number": "001-440-716-4976x86210",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.140330+01:00",
                    "updated_at": "2023-03-24T07:58:51.140341+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Eugene Harper",
                    "isBirthday": false
                  },
                  {
                    "id": 26,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Edward",
                    "last_name": "Johnson",
                    "gender": "M",
                    "country": "Sri Lanka",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-605-012-6295x1596",
                    "mobile": "568.777.4266x729",
                    "fax_number": "001-859-505-2742x67202",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.360538+01:00",
                    "updated_at": "2023-03-24T07:58:51.360547+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Edward Johnson",
                    "isBirthday": false
                  },
                  {
                    "id": 27,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Teresa",
                    "last_name": "Johnson",
                    "gender": "M",
                    "country": "Costa Rica",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(222)582-5171",
                    "mobile": "001-632-856-2362",
                    "fax_number": "238.883.4839",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.373213+01:00",
                    "updated_at": "2023-03-24T07:58:51.373221+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Teresa Johnson",
                    "isBirthday": false
                  },
                  {
                    "id": 28,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Alex",
                    "last_name": "Moore",
                    "gender": "M",
                    "country": "Portugal",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "396.774.0842x10318",
                    "mobile": "1019398196",
                    "fax_number": "251.039.0693",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.380719+01:00",
                    "updated_at": "2023-03-24T07:58:51.380728+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Alex Moore",
                    "isBirthday": false
                  },
                  {
                    "id": 29,
                    "addressBy": "Jr.",
                    "title": "Mx.",
                    "first_name": "Christina",
                    "last_name": "Scott",
                    "gender": "M",
                    "country": "Malta",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "158-526-5893x42679",
                    "mobile": "+1-714-086-6188x51529",
                    "fax_number": "001-755-369-4768x8580",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.389198+01:00",
                    "updated_at": "2023-03-24T07:58:51.389207+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Christina Scott",
                    "isBirthday": false
                  },
                  {
                    "id": 30,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Brittany",
                    "last_name": "Bryan",
                    "gender": "M",
                    "country": "Sao Tome and Principe",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "470.414.6415x3518",
                    "mobile": "842-530-4777",
                    "fax_number": "(717)633-1149",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.396854+01:00",
                    "updated_at": "2023-03-24T07:58:51.396863+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brittany Bryan",
                    "isBirthday": false
                  },
                  {
                    "id": 31,
                    "addressBy": "PhD",
                    "title": "Dr.",
                    "first_name": "Collin",
                    "last_name": "Moore",
                    "gender": "M",
                    "country": "Peru",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-692-760-0091",
                    "mobile": "(787)532-9312",
                    "fax_number": "396.150.4687x7890",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.403951+01:00",
                    "updated_at": "2023-03-24T07:58:51.403958+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Collin Moore",
                    "isBirthday": false
                  },
                  {
                    "id": 32,
                    "addressBy": "II",
                    "title": "Dr.",
                    "first_name": "Morgan",
                    "last_name": "Dixon",
                    "gender": "M",
                    "country": "Sri Lanka",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "9230106046",
                    "mobile": "001-268-027-5002x20971",
                    "fax_number": "001-454-187-8498",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.411530+01:00",
                    "updated_at": "2023-03-24T07:58:51.411538+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Morgan Dixon",
                    "isBirthday": false
                  },
                  {
                    "id": 33,
                    "addressBy": "Jr.",
                    "title": "Mx.",
                    "first_name": "Sierra",
                    "last_name": "Harrison",
                    "gender": "M",
                    "country": "San Marino",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-994-606-3744x650",
                    "mobile": "132-800-9101x64136",
                    "fax_number": "(905)445-2688x20145",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.419447+01:00",
                    "updated_at": "2023-03-24T07:58:51.419454+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Sierra Harrison",
                    "isBirthday": false
                  },
                  {
                    "id": 34,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Juan",
                    "last_name": "Howard",
                    "gender": "M",
                    "country": "Togo",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-595-500-8777x8069",
                    "mobile": "458.259.4657",
                    "fax_number": "+1-827-894-2830x09058",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.427372+01:00",
                    "updated_at": "2023-03-24T07:58:51.427380+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Juan Howard",
                    "isBirthday": false
                  },
                  {
                    "id": 35,
                    "addressBy": "II",
                    "title": "Mx.",
                    "first_name": "Andrew",
                    "last_name": "Morrison",
                    "gender": "M",
                    "country": "British Indian Ocean Territory (Chagos Archipelago)",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-570-044-4072x705",
                    "mobile": "(621)368-1298",
                    "fax_number": "+1-487-469-8667x228",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.434392+01:00",
                    "updated_at": "2023-03-24T07:58:51.434400+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Andrew Morrison",
                    "isBirthday": false
                  },
                  {
                    "id": 36,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Hailey",
                    "last_name": "Sanders",
                    "gender": "M",
                    "country": "Tunisia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(776)682-7229",
                    "mobile": "719-371-0303x835",
                    "fax_number": "787-266-2097x444",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.442442+01:00",
                    "updated_at": "2023-03-24T07:58:51.442450+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Hailey Sanders",
                    "isBirthday": false
                  },
                  {
                    "id": 37,
                    "addressBy": "Jr.",
                    "title": "Mx.",
                    "first_name": "Linda",
                    "last_name": "Zuniga",
                    "gender": "M",
                    "country": "Kuwait",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-883-232-5389",
                    "mobile": "869.806.4148x04874",
                    "fax_number": "+1-346-491-5466x5665",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.449449+01:00",
                    "updated_at": "2023-03-24T07:58:51.449457+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Linda Zuniga",
                    "isBirthday": false
                  },
                  {
                    "id": 38,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Donna",
                    "last_name": "Daniels",
                    "gender": "M",
                    "country": "Gabon",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "258.426.1459x028",
                    "mobile": "001-357-462-4274x2930",
                    "fax_number": "001-518-174-7546x724",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.456317+01:00",
                    "updated_at": "2023-03-24T07:58:51.456325+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Donna Daniels",
                    "isBirthday": false
                  },
                  {
                    "id": 39,
                    "addressBy": "MD",
                    "title": "Misc.",
                    "first_name": "Emily",
                    "last_name": "Walls",
                    "gender": "M",
                    "country": "Chile",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-779-401-3964",
                    "mobile": "001-411-063-9404x6699",
                    "fax_number": "750.484.2923",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.463822+01:00",
                    "updated_at": "2023-03-24T07:58:51.463830+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Emily Walls",
                    "isBirthday": false
                  },
                  {
                    "id": 40,
                    "addressBy": "Jr.",
                    "title": "Mx.",
                    "first_name": "Tracy",
                    "last_name": "Mitchell",
                    "gender": "M",
                    "country": "Afghanistan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-909-484-7723x03848",
                    "mobile": "273-831-8292x922",
                    "fax_number": "(533)731-9793x54662",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.470212+01:00",
                    "updated_at": "2023-03-24T07:58:51.470219+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tracy Mitchell",
                    "isBirthday": false
                  },
                  {
                    "id": 41,
                    "addressBy": "PhD",
                    "title": "Dr.",
                    "first_name": "Nicole",
                    "last_name": "Taylor",
                    "gender": "M",
                    "country": "Trinidad and Tobago",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-458-249-3717",
                    "mobile": "259-635-4259",
                    "fax_number": "+1-097-714-6775",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.477260+01:00",
                    "updated_at": "2023-03-24T07:58:51.477268+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Nicole Taylor",
                    "isBirthday": false
                  },
                  {
                    "id": 42,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Misty",
                    "last_name": "Reynolds",
                    "gender": "M",
                    "country": "Guadeloupe",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(072)872-2916x2886",
                    "mobile": "+1-541-815-6083x3548",
                    "fax_number": "913-107-1852x02552",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.483652+01:00",
                    "updated_at": "2023-03-24T07:58:51.483661+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Misty Reynolds",
                    "isBirthday": false
                  },
                  {
                    "id": 43,
                    "addressBy": "DDS",
                    "title": "Dr.",
                    "first_name": "Kathryn",
                    "last_name": "Brown",
                    "gender": "M",
                    "country": "Madagascar",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(508)744-5698",
                    "mobile": "(974)290-0595x40778",
                    "fax_number": "001-000-958-6350x219",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.490258+01:00",
                    "updated_at": "2023-03-24T07:58:51.490266+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Kathryn Brown",
                    "isBirthday": false
                  },
                  {
                    "id": 44,
                    "addressBy": "DDS",
                    "title": "Dr.",
                    "first_name": "Dan",
                    "last_name": "Mosley",
                    "gender": "M",
                    "country": "Korea",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "365.837.6883x97199",
                    "mobile": "727-213-9567x99824",
                    "fax_number": "(263)113-5388x9448",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.497360+01:00",
                    "updated_at": "2023-03-24T07:58:51.497368+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Dan Mosley",
                    "isBirthday": false
                  },
                  {
                    "id": 45,
                    "addressBy": "Jr.",
                    "title": "Ind.",
                    "first_name": "Jose",
                    "last_name": "Stone",
                    "gender": "M",
                    "country": "Dominican Republic",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(777)840-9032x95970",
                    "mobile": "+1-595-939-2077x2739",
                    "fax_number": "(887)616-1062x90419",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.504512+01:00",
                    "updated_at": "2023-03-24T07:58:51.504519+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Jose Stone",
                    "isBirthday": false
                  },
                  {
                    "id": 46,
                    "addressBy": "Jr.",
                    "title": "Misc.",
                    "first_name": "Donald",
                    "last_name": "Greene",
                    "gender": "M",
                    "country": "Montenegro",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "6859248244",
                    "mobile": "001-349-814-9542x223",
                    "fax_number": "8927784771",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.512595+01:00",
                    "updated_at": "2023-03-24T07:58:51.512603+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Donald Greene",
                    "isBirthday": false
                  },
                  {
                    "id": 47,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Brittney",
                    "last_name": "Reed",
                    "gender": "M",
                    "country": "Cocos (Keeling) Islands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-472-694-7667x1754",
                    "mobile": "9956750330",
                    "fax_number": "332.665.3642",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.519397+01:00",
                    "updated_at": "2023-03-24T07:58:51.519405+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brittney Reed",
                    "isBirthday": false
                  },
                  {
                    "id": 48,
                    "addressBy": "DVM",
                    "title": "Dr.",
                    "first_name": "Melissa",
                    "last_name": "Carter",
                    "gender": "M",
                    "country": "South Georgia and the South Sandwich Islands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "346-943-1352",
                    "mobile": "+1-197-981-3493x1903",
                    "fax_number": "(627)844-5122x2676",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.525965+01:00",
                    "updated_at": "2023-03-24T07:58:51.525973+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Melissa Carter",
                    "isBirthday": false
                  },
                  {
                    "id": 49,
                    "addressBy": "III",
                    "title": "Mx.",
                    "first_name": "Bryan",
                    "last_name": "Poole",
                    "gender": "M",
                    "country": "Malawi",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "457.397.3093x278",
                    "mobile": "001-129-473-6298x708",
                    "fax_number": "2534941185",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.531822+01:00",
                    "updated_at": "2023-03-24T07:58:51.531830+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Bryan Poole",
                    "isBirthday": false
                  },
                  {
                    "id": 50,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Nancy",
                    "last_name": "Burnett",
                    "gender": "M",
                    "country": "Suriname",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(927)685-0537",
                    "mobile": "576-527-6268x57825",
                    "fax_number": "545.929.4524x9872",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.537579+01:00",
                    "updated_at": "2023-03-24T07:58:51.537588+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Nancy Burnett",
                    "isBirthday": false
                  },
                  {
                    "id": 51,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Becky",
                    "last_name": "Lyons",
                    "gender": "M",
                    "country": "Panama",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(413)418-8031",
                    "mobile": "140-390-9899x1146",
                    "fax_number": "+1-752-816-8516x12368",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.544036+01:00",
                    "updated_at": "2023-03-24T07:58:51.544044+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Becky Lyons",
                    "isBirthday": false
                  },
                  {
                    "id": 52,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Melissa",
                    "last_name": "Reed",
                    "gender": "M",
                    "country": "Micronesia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-123-583-7890",
                    "mobile": "0869314029",
                    "fax_number": "4605163358",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.551161+01:00",
                    "updated_at": "2023-03-24T07:58:51.551169+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Melissa Reed",
                    "isBirthday": false
                  },
                  {
                    "id": 53,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Nancy",
                    "last_name": "Wong",
                    "gender": "M",
                    "country": "Macao",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(348)385-8001",
                    "mobile": "4391535996",
                    "fax_number": "001-074-991-7785x17694",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.559739+01:00",
                    "updated_at": "2023-03-24T07:58:51.559748+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Nancy Wong",
                    "isBirthday": false
                  },
                  {
                    "id": 54,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Shannon",
                    "last_name": "Matthews",
                    "gender": "M",
                    "country": "Papua New Guinea",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-900-234-1839x4837",
                    "mobile": "6824704039",
                    "fax_number": "001-674-932-6037x6746",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.568870+01:00",
                    "updated_at": "2023-03-24T07:58:51.568880+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Shannon Matthews",
                    "isBirthday": false
                  },
                  {
                    "id": 55,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Edward",
                    "last_name": "Davis",
                    "gender": "M",
                    "country": "British Virgin Islands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-922-106-0495x4790",
                    "mobile": "454-769-8278x9570",
                    "fax_number": "248-058-6626",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.578296+01:00",
                    "updated_at": "2023-03-24T07:58:51.578306+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Edward Davis",
                    "isBirthday": false
                  },
                  {
                    "id": 56,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Anthony",
                    "last_name": "Kirby",
                    "gender": "M",
                    "country": "Bahamas",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "543-328-3435x629",
                    "mobile": "974-422-0359x7610",
                    "fax_number": "+1-945-608-1591x9876",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.586308+01:00",
                    "updated_at": "2023-03-24T07:58:51.586317+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Anthony Kirby",
                    "isBirthday": false
                  },
                  {
                    "id": 57,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Amanda",
                    "last_name": "Webb",
                    "gender": "M",
                    "country": "French Guiana",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(846)658-8813x648",
                    "mobile": "(635)000-8307x523",
                    "fax_number": "001-945-441-6313x436",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.593675+01:00",
                    "updated_at": "2023-03-24T07:58:51.593685+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Amanda Webb",
                    "isBirthday": false
                  },
                  {
                    "id": 58,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "David",
                    "last_name": "Jimenez",
                    "gender": "M",
                    "country": "Vietnam",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-570-838-3913x47025",
                    "mobile": "(594)299-3625x643",
                    "fax_number": "001-708-226-8945",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.601879+01:00",
                    "updated_at": "2023-03-24T07:58:51.601889+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "David Jimenez",
                    "isBirthday": false
                  },
                  {
                    "id": 59,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "Michele",
                    "last_name": "Herrera",
                    "gender": "M",
                    "country": "Slovakia (Slovak Republic)",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(752)293-6524x8055",
                    "mobile": "(120)239-1017",
                    "fax_number": "001-061-461-1405",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.609327+01:00",
                    "updated_at": "2023-03-24T07:58:51.609336+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Michele Herrera",
                    "isBirthday": false
                  },
                  {
                    "id": 60,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Carrie",
                    "last_name": "Mccarthy",
                    "gender": "M",
                    "country": "Belarus",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "1087944777",
                    "mobile": "649-827-7860x7120",
                    "fax_number": "(167)171-6298",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.616810+01:00",
                    "updated_at": "2023-03-24T07:58:51.616819+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Carrie Mccarthy",
                    "isBirthday": false
                  },
                  {
                    "id": 61,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "Daniel",
                    "last_name": "Lewis",
                    "gender": "M",
                    "country": "Lao People's Democratic Republic",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(903)619-0366",
                    "mobile": "(102)349-5455x1294",
                    "fax_number": "(642)917-9005",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.624312+01:00",
                    "updated_at": "2023-03-24T07:58:51.624321+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Daniel Lewis",
                    "isBirthday": false
                  },
                  {
                    "id": 62,
                    "addressBy": "MD",
                    "title": "Ind.",
                    "first_name": "Christopher",
                    "last_name": "Gibson",
                    "gender": "M",
                    "country": "Saint Kitts and Nevis",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(623)581-8612x377",
                    "mobile": "(594)470-1246x7896",
                    "fax_number": "(312)962-3344",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.631867+01:00",
                    "updated_at": "2023-03-24T07:58:51.631877+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Christopher Gibson",
                    "isBirthday": false
                  },
                  {
                    "id": 63,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Rebecca",
                    "last_name": "Wagner",
                    "gender": "M",
                    "country": "Puerto Rico",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(027)391-9580x1142",
                    "mobile": "001-106-996-5093",
                    "fax_number": "+1-579-938-0076",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.639437+01:00",
                    "updated_at": "2023-03-24T07:58:51.639447+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Rebecca Wagner",
                    "isBirthday": false
                  },
                  {
                    "id": 64,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Tammy",
                    "last_name": "Garcia",
                    "gender": "M",
                    "country": "Cook Islands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "7775999481",
                    "mobile": "001-137-132-1492x27141",
                    "fax_number": "(408)526-1641x6742",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.647430+01:00",
                    "updated_at": "2023-03-24T07:58:51.647438+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tammy Garcia",
                    "isBirthday": false
                  },
                  {
                    "id": 65,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Brittney",
                    "last_name": "Reyes",
                    "gender": "M",
                    "country": "Antigua and Barbuda",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "587.620.8140x3881",
                    "mobile": "(791)547-9494x583",
                    "fax_number": "(205)889-0695x23667",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.655101+01:00",
                    "updated_at": "2023-03-24T07:58:51.655111+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brittney Reyes",
                    "isBirthday": false
                  },
                  {
                    "id": 66,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Tanya",
                    "last_name": "Sanchez",
                    "gender": "M",
                    "country": "Bulgaria",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(772)317-7149x9743",
                    "mobile": "798.404.4369x5415",
                    "fax_number": "053-685-1775x24589",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.661506+01:00",
                    "updated_at": "2023-03-24T07:58:51.661515+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tanya Sanchez",
                    "isBirthday": false
                  },
                  {
                    "id": 67,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Ryan",
                    "last_name": "Patterson",
                    "gender": "M",
                    "country": "Georgia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-299-538-2043x37628",
                    "mobile": "899-289-2439x2571",
                    "fax_number": "288-356-5303x21876",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.670734+01:00",
                    "updated_at": "2023-03-24T07:58:51.670745+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Ryan Patterson",
                    "isBirthday": false
                  },
                  {
                    "id": 68,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "Erika",
                    "last_name": "Walker",
                    "gender": "M",
                    "country": "Taiwan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(713)367-1218x2314",
                    "mobile": "(758)626-9892",
                    "fax_number": "816.901.7932",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.678842+01:00",
                    "updated_at": "2023-03-24T07:58:51.678850+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Erika Walker",
                    "isBirthday": false
                  },
                  {
                    "id": 69,
                    "addressBy": "DDS",
                    "title": "Ind.",
                    "first_name": "James",
                    "last_name": "King",
                    "gender": "M",
                    "country": "Malaysia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "8687973200",
                    "mobile": "001-353-900-2182",
                    "fax_number": "001-644-749-8182x418",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.686266+01:00",
                    "updated_at": "2023-03-24T07:58:51.686273+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "James King",
                    "isBirthday": false
                  },
                  {
                    "id": 70,
                    "addressBy": "II",
                    "title": "Misc.",
                    "first_name": "Wendy",
                    "last_name": "Floyd",
                    "gender": "M",
                    "country": "Ethiopia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "263.142.3780x759",
                    "mobile": "+1-238-568-4426x095",
                    "fax_number": "7630661302",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.692626+01:00",
                    "updated_at": "2023-03-24T07:58:51.692634+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Wendy Floyd",
                    "isBirthday": false
                  },
                  {
                    "id": 71,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Brian",
                    "last_name": "Cruz",
                    "gender": "M",
                    "country": "Palestinian Territory",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "323-113-4866x8806",
                    "mobile": "910.877.0147x018",
                    "fax_number": "498.086.0609x519",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.698484+01:00",
                    "updated_at": "2023-03-24T07:58:51.698490+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Brian Cruz",
                    "isBirthday": false
                  },
                  {
                    "id": 72,
                    "addressBy": "III",
                    "title": "Dr.",
                    "first_name": "Charlotte",
                    "last_name": "Walter",
                    "gender": "M",
                    "country": "United Arab Emirates",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-404-081-9841x1104",
                    "mobile": "826-511-7843x41757",
                    "fax_number": "413-425-4687x83806",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.704359+01:00",
                    "updated_at": "2023-03-24T07:58:51.704364+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Charlotte Walter",
                    "isBirthday": false
                  },
                  {
                    "id": 73,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Cindy",
                    "last_name": "Parks",
                    "gender": "M",
                    "country": "United Kingdom",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(269)090-6928",
                    "mobile": "344.680.7550x8248",
                    "fax_number": "(011)650-4258",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.709931+01:00",
                    "updated_at": "2023-03-24T07:58:51.709937+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Cindy Parks",
                    "isBirthday": false
                  },
                  {
                    "id": 74,
                    "addressBy": "DDS",
                    "title": "Ind.",
                    "first_name": "Melissa",
                    "last_name": "Hogan",
                    "gender": "M",
                    "country": "Tokelau",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "210.036.2798",
                    "mobile": "001-267-843-0265x93942",
                    "fax_number": "+1-558-407-2135x43638",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.715976+01:00",
                    "updated_at": "2023-03-24T07:58:51.715984+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Melissa Hogan",
                    "isBirthday": false
                  },
                  {
                    "id": 75,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Dana",
                    "last_name": "Glover",
                    "gender": "M",
                    "country": "Barbados",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "009-633-9584x768",
                    "mobile": "(949)484-9816",
                    "fax_number": "5387065206",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.723416+01:00",
                    "updated_at": "2023-03-24T07:58:51.723425+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Dana Glover",
                    "isBirthday": false
                  },
                  {
                    "id": 76,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Vincent",
                    "last_name": "Potter",
                    "gender": "M",
                    "country": "Antarctica (the territory South of 60 deg S)",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(706)772-4709x469",
                    "mobile": "171.347.8082x65891",
                    "fax_number": "720-923-8983",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.731368+01:00",
                    "updated_at": "2023-03-24T07:58:51.731375+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Vincent Potter",
                    "isBirthday": false
                  },
                  {
                    "id": 77,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Hailey",
                    "last_name": "Elliott",
                    "gender": "M",
                    "country": "Saint Martin",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(285)326-3645x9690",
                    "mobile": "001-759-752-3729x2605",
                    "fax_number": "001-998-294-8913x191",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.736814+01:00",
                    "updated_at": "2023-03-24T07:58:51.736820+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Hailey Elliott",
                    "isBirthday": false
                  },
                  {
                    "id": 78,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Ronald",
                    "last_name": "Rivera",
                    "gender": "M",
                    "country": "Tajikistan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-814-972-6056x989",
                    "mobile": "(978)810-1756x05705",
                    "fax_number": "320.440.8343x209",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.741498+01:00",
                    "updated_at": "2023-03-24T07:58:51.741504+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Ronald Rivera",
                    "isBirthday": false
                  },
                  {
                    "id": 79,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "James",
                    "last_name": "Rowland",
                    "gender": "M",
                    "country": "Kyrgyz Republic",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-947-421-5699",
                    "mobile": "646-582-4110x814",
                    "fax_number": "677.375.9245x06341",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.747383+01:00",
                    "updated_at": "2023-03-24T07:58:51.747390+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "James Rowland",
                    "isBirthday": false
                  },
                  {
                    "id": 80,
                    "addressBy": "Jr.",
                    "title": "Dr.",
                    "first_name": "Victoria",
                    "last_name": "Campbell",
                    "gender": "M",
                    "country": "Congo",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-758-424-9290",
                    "mobile": "400.096.5912x864",
                    "fax_number": "503.458.2708x318",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.752550+01:00",
                    "updated_at": "2023-03-24T07:58:51.752556+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Victoria Campbell",
                    "isBirthday": false
                  },
                  {
                    "id": 81,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Mark",
                    "last_name": "Hardy",
                    "gender": "M",
                    "country": "Angola",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(831)163-0363",
                    "mobile": "343-524-6709x853",
                    "fax_number": "+1-446-179-0447x274",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.757722+01:00",
                    "updated_at": "2023-03-24T07:58:51.757729+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Mark Hardy",
                    "isBirthday": false
                  },
                  {
                    "id": 82,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Robert",
                    "last_name": "Mercado",
                    "gender": "M",
                    "country": "Lao People's Democratic Republic",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-514-031-9502",
                    "mobile": "001-225-552-0113x1120",
                    "fax_number": "496-760-5020",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.763687+01:00",
                    "updated_at": "2023-03-24T07:58:51.763694+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Robert Mercado",
                    "isBirthday": false
                  },
                  {
                    "id": 83,
                    "addressBy": "DVM",
                    "title": "Mx.",
                    "first_name": "Autumn",
                    "last_name": "Marshall",
                    "gender": "M",
                    "country": "Iceland",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "158-732-4078",
                    "mobile": "952.914.6056x55385",
                    "fax_number": "740.471.1313",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.769189+01:00",
                    "updated_at": "2023-03-24T07:58:51.769197+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Autumn Marshall",
                    "isBirthday": false
                  },
                  {
                    "id": 84,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Kelly",
                    "last_name": "Wyatt",
                    "gender": "M",
                    "country": "Northern Mariana Islands",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "9442873876",
                    "mobile": "+1-794-628-1891x227",
                    "fax_number": "139.971.3423x64247",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.775587+01:00",
                    "updated_at": "2023-03-24T07:58:51.775595+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Kelly Wyatt",
                    "isBirthday": false
                  },
                  {
                    "id": 85,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Timothy",
                    "last_name": "Barrett",
                    "gender": "M",
                    "country": "Switzerland",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-799-762-0629x143",
                    "mobile": "001-109-427-4562x58422",
                    "fax_number": "772-115-7103x4209",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.782538+01:00",
                    "updated_at": "2023-03-24T07:58:51.782547+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Timothy Barrett",
                    "isBirthday": false
                  },
                  {
                    "id": 86,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Tina",
                    "last_name": "Rojas",
                    "gender": "M",
                    "country": "Macedonia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "5920701899",
                    "mobile": "+1-206-066-8550x721",
                    "fax_number": "001-314-992-0276",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.789340+01:00",
                    "updated_at": "2023-03-24T07:58:51.789348+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tina Rojas",
                    "isBirthday": false
                  },
                  {
                    "id": 87,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Daniel",
                    "last_name": "Conley",
                    "gender": "M",
                    "country": "Azerbaijan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "001-090-007-3229x8533",
                    "mobile": "(548)492-4750x754",
                    "fax_number": "(401)155-4589x92279",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.795948+01:00",
                    "updated_at": "2023-03-24T07:58:51.795955+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Daniel Conley",
                    "isBirthday": false
                  },
                  {
                    "id": 88,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Tasha",
                    "last_name": "Anderson",
                    "gender": "M",
                    "country": "Turkey",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "195.646.9937",
                    "mobile": "448.930.1197",
                    "fax_number": "489.051.2780x46069",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.802278+01:00",
                    "updated_at": "2023-03-24T07:58:51.802283+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tasha Anderson",
                    "isBirthday": false
                  },
                  {
                    "id": 89,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Amanda",
                    "last_name": "Diaz",
                    "gender": "M",
                    "country": "Ethiopia",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "161.400.3267",
                    "mobile": "346.642.2449x2529",
                    "fax_number": "(685)362-6954",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.808008+01:00",
                    "updated_at": "2023-03-24T07:58:51.808014+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Amanda Diaz",
                    "isBirthday": false
                  },
                  {
                    "id": 90,
                    "addressBy": "DDS",
                    "title": "Misc.",
                    "first_name": "Anita",
                    "last_name": "Collins",
                    "gender": "M",
                    "country": "Honduras",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(954)304-3692",
                    "mobile": "(512)736-8831x465",
                    "fax_number": "618-688-8914x9240",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.812815+01:00",
                    "updated_at": "2023-03-24T07:58:51.812820+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Anita Collins",
                    "isBirthday": false
                  },
                  {
                    "id": 91,
                    "addressBy": "MD",
                    "title": "Dr.",
                    "first_name": "Harold",
                    "last_name": "Brown",
                    "gender": "M",
                    "country": "Guernsey",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-677-013-9200",
                    "mobile": "6014430632",
                    "fax_number": "954-170-6271x373",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.817525+01:00",
                    "updated_at": "2023-03-24T07:58:51.817530+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Harold Brown",
                    "isBirthday": false
                  },
                  {
                    "id": 92,
                    "addressBy": "MD",
                    "title": "Ind.",
                    "first_name": "Katherine",
                    "last_name": "Kelly",
                    "gender": "M",
                    "country": "Austria",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "+1-350-128-8685x680",
                    "mobile": "646.308.2339x205",
                    "fax_number": "028-248-3603x78212",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.824348+01:00",
                    "updated_at": "2023-03-24T07:58:51.824360+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Katherine Kelly",
                    "isBirthday": false
                  },
                  {
                    "id": 93,
                    "addressBy": "MD",
                    "title": "Mx.",
                    "first_name": "Melinda",
                    "last_name": "Martinez",
                    "gender": "M",
                    "country": "Sierra Leone",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(719)647-3817",
                    "mobile": "4188626781",
                    "fax_number": "869.261.1062x8952",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.831316+01:00",
                    "updated_at": "2023-03-24T07:58:51.831326+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Melinda Martinez",
                    "isBirthday": false
                  },
                  {
                    "id": 94,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Michele",
                    "last_name": "Edwards",
                    "gender": "M",
                    "country": "Martinique",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(338)853-8255x019",
                    "mobile": "(424)513-1573x54662",
                    "fax_number": "8232064272",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.838442+01:00",
                    "updated_at": "2023-03-24T07:58:51.838452+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Michele Edwards",
                    "isBirthday": false
                  },
                  {
                    "id": 95,
                    "addressBy": "Jr.",
                    "title": "Ind.",
                    "first_name": "Adrian",
                    "last_name": "Flores",
                    "gender": "M",
                    "country": "Nepal",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "4191753543",
                    "mobile": "707-957-4248",
                    "fax_number": "+1-957-576-4585x0084",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.846353+01:00",
                    "updated_at": "2023-03-24T07:58:51.846362+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Adrian Flores",
                    "isBirthday": false
                  },
                  {
                    "id": 96,
                    "addressBy": "DDS",
                    "title": "Mx.",
                    "first_name": "Kimberly",
                    "last_name": "Schmidt",
                    "gender": "M",
                    "country": "Japan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "8962761337",
                    "mobile": "001-997-691-7805x425",
                    "fax_number": "001-441-715-2029",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.853683+01:00",
                    "updated_at": "2023-03-24T07:58:51.853692+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Kimberly Schmidt",
                    "isBirthday": false
                  },
                  {
                    "id": 97,
                    "addressBy": "Jr.",
                    "title": "Ind.",
                    "first_name": "Garrett",
                    "last_name": "Brown",
                    "gender": "M",
                    "country": "Uzbekistan",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "080-460-3006x8636",
                    "mobile": "+1-160-512-5009x73330",
                    "fax_number": "001-810-929-0201",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.859343+01:00",
                    "updated_at": "2023-03-24T07:58:51.859351+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Garrett Brown",
                    "isBirthday": false
                  },
                  {
                    "id": 98,
                    "addressBy": "PhD",
                    "title": "Mx.",
                    "first_name": "Tyler",
                    "last_name": "Mitchell",
                    "gender": "M",
                    "country": "France",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "844-040-4887x3524",
                    "mobile": "763.449.2575x586",
                    "fax_number": "+1-687-440-9735x38214",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.865508+01:00",
                    "updated_at": "2023-03-24T07:58:51.865516+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Tyler Mitchell",
                    "isBirthday": false
                  },
                  {
                    "id": 99,
                    "addressBy": "MD",
                    "title": "Misc.",
                    "first_name": "Jennifer",
                    "last_name": "Morales",
                    "gender": "M",
                    "country": "Norfolk Island",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "145.574.1788",
                    "mobile": "001-735-462-3196x020",
                    "fax_number": "+1-915-268-8388",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.871648+01:00",
                    "updated_at": "2023-03-24T07:58:51.871657+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Jennifer Morales",
                    "isBirthday": false
                  },
                  {
                    "id": 100,
                    "addressBy": "DDS",
                    "title": "Dr.",
                    "first_name": "Charles",
                    "last_name": "Lopez",
                    "gender": "M",
                    "country": "Eritrea",
                    "date_of_birth": "1926-08-07T00:00:00+01:00",
                    "picture": "https://test.eagna.io/media/https://cdn.eagna.io/img/avatar/male-15.png",
                    "job": "Corporate investment banker",
                    "email": "lsmith@gmail.com",
                    "email_2": "lsmith@gmail.com",
                    "phone": "lsmith@gmail.com",
                    "phone_2": "(721)026-0571x44910",
                    "mobile": "+1-128-629-8731x99435",
                    "fax_number": "(613)338-4745",
                    "social": "@isntagram",
                    "teams": "@teams",
                    "created_at": "2023-03-24T07:58:51.879934+01:00",
                    "updated_at": "2023-03-24T07:58:51.879943+01:00",
                    "language": null,
                    "company": {
                      "id": 51,
                      "name": "Adams, Davis and Gonzalez",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "338 Kenneth Tunnel",
                      "id": 26
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": [],
                    "name": "Charles Lopez",
                    "isBirthday": false
                  }
                ]
              }
            }
          }
        },
        "user": {
          "id": 3,
          "is_superuser": true,
          "is_staff": true,
          "is_active": true,
          "country": "Algeria",
          "app_metadata": [],
          "blocked": false,
          "created_at": "2023-03-24T07:45:43.062893+01:00",
          "is_deactivated": false,
          "email_verified": false,
          "email": "randy.tolentino@eagna.io",
          "first_name": "RTs",
          "last_name": "Tolen",
          "user_metadata": [],
          "identities": [],
          "last_ip": "90.187.210.41",
          "last_login": "2023-10-11T16:57:28.998170+02:00",
          "last_password_reset": "2023-03-24T07:45:43.062907+01:00",
          "logins_count": 0,
          "multifactor": "google",
          "phone_number": "010 10101010",
          "phone_verified": false,
          "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg",
          "avatar": "https://test.eagna.io/media/user/3_RTs_Tole/avatar/331294686_897967834661437_8946897111296551985_n.jpg",
          "date_joined": "2023-03-24T07:45:43.062871+01:00",
          "updated_at": "2023-03-24T07:45:43.062930+01:00",
          "user_id": "010 10101010",
          "provider": "Eagna",
          "locale": "en",
          "globalMenubarPref": true,
          "globalGridPref": true,
          "globalChartPref": true,
          "globalScheme": "auto",
          "provision": "unknown",
          "provision_app": "unknown",
          "provision_uri": "",
          "provision_verified": false,
          "isExternal": false,
          "hasNotification": false,
          "username": "ranran",
          "groups": [],
          "user_permissions": [],
          "role": [],
          "files": [],
          "name": "RTs Tolen"
        },
        "project": {
          "id": 1,
          "name": "Nuclear",
          "description": "Not return believe up drive teacher. Cup chance miss high eat.",
          "date_start_planned": "2004-06-18T00:00:00+02:00",
          "date_end_planned": "2015-07-22T00:00:00+02:00",
          "budget_planned": "43152.00",
          "date_start_actual": "1985-12-16T00:00:00+01:00",
          "date_end_actual": "2001-07-23T00:00:00+02:00",
          "budget_actual": "50709.00",
          "company": {
            "id": 2,
            "name": "Knight-Warren",
            "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
          },
          "contact_partner": null,
          "status": {
            "id": 5,
            "name": "PENDING",
            "icon": "fa-solid fa-triangle-exclamation",
            "color_class": "bg-primary-faded text-primary"
          },
          "priority": null,
          "files": [],
          "__data__": {
            "company": {
              "id": 2,
              "name": "Knight-Warren",
              "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg",
              "legal_form": "Ltd",
              "suffix_name": "and Sons",
              "abbreviation": "BCB",
              "registration_no": "DE-09141044",
              "vat_no": "EE-05586940",
              "vat_id_no": "DD-37841603",
              "website": "https://www.form-foundation.de",
              "instagram": "@instagram",
              "facebook": "@instagram",
              "twitter": "@instagram",
              "teams": "@instagram",
              "skype": "@instagram",
              "email": "christinamccormick@gmail.com",
              "email_2": "christinamccormick@gmail.com",
              "phone": "389-111-1075",
              "phone_2": "431-194-4602x371",
              "mobile": "033-693-1881x5934",
              "fax_number": "+1-731-454-2947x0666",
              "created_at": "2023-03-24T07:58:50.334741+01:00",
              "updated_at": "2023-03-24T07:58:50.334751+01:00",
              "contact_partner": null,
              "owner": null,
              "billing_add": 41,
              "reg_add": 41,
              "shipping_add": 41,
              "units": null,
              "language": null,
              "category": null,
              "sector": null,
              "role": null,
              "files": [],
              "billing": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "registered": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "shipping": {
                "name": "064 Bridges Common Suite 920",
                "id": 41
              },
              "__data__": {
                "billing_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "reg_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "shipping_add": {
                  "id": 41,
                  "po_box": "PO-183",
                  "name": "3504 Martin Crossroad\nEast Richard, ID 95974",
                  "formatted_address": "064 Bridges Common Suite 920",
                  "street": "17650 Brittany Inlet",
                  "bldgNumber": "90247",
                  "city": "West Janet",
                  "state": "0714 Angela Plaza Suite 096\nNew Alexander, SD 47079",
                  "zipcode": "85522",
                  "country": "Trinidad and Tobago",
                  "lat": "53.430870",
                  "lon": "160.083699",
                  "type": "Office",
                  "place_id": "80322",
                  "plus_code": "04701",
                  "icon": "fa-solid fa-user",
                  "status": "ACTIVE"
                },
                "contact_partner": {
                  "password": "",
                  "is_superuser": false,
                  "is_staff": false,
                  "is_active": false,
                  "country": "",
                  "app_metadata": null,
                  "blocked": false,
                  "created_at": null,
                  "is_deactivated": false,
                  "email_verified": false,
                  "email": "",
                  "first_name": "",
                  "last_name": "",
                  "user_metadata": null,
                  "identities": null,
                  "last_ip": "",
                  "last_login": null,
                  "last_password_reset": null,
                  "logins_count": null,
                  "multifactor": "",
                  "phone_number": "",
                  "phone_verified": false,
                  "picture": null,
                  "avatar": null,
                  "date_joined": null,
                  "updated_at": null,
                  "user_id": "",
                  "provider": "",
                  "locale": "",
                  "globalMenubarPref": false,
                  "globalGridPref": false,
                  "globalChartPref": false,
                  "globalScheme": "",
                  "provision": "",
                  "provision_app": "",
                  "provision_uri": "",
                  "provision_verified": false,
                  "isExternal": false,
                  "hasNotification": false,
                  "username": "",
                  "groups": [],
                  "user_permissions": [],
                  "role": [],
                  "files": []
                },
                "owner": {
                  "password": "",
                  "is_superuser": false,
                  "is_staff": false,
                  "is_active": false,
                  "country": "",
                  "app_metadata": null,
                  "blocked": false,
                  "created_at": null,
                  "is_deactivated": false,
                  "email_verified": false,
                  "email": "",
                  "first_name": "",
                  "last_name": "",
                  "user_metadata": null,
                  "identities": null,
                  "last_ip": "",
                  "last_login": null,
                  "last_password_reset": null,
                  "logins_count": null,
                  "multifactor": "",
                  "phone_number": "",
                  "phone_verified": false,
                  "picture": null,
                  "avatar": null,
                  "date_joined": null,
                  "updated_at": null,
                  "user_id": "",
                  "provider": "",
                  "locale": "",
                  "globalMenubarPref": false,
                  "globalGridPref": false,
                  "globalChartPref": false,
                  "globalScheme": "",
                  "provision": "",
                  "provision_app": "",
                  "provision_uri": "",
                  "provision_verified": false,
                  "isExternal": false,
                  "hasNotification": false,
                  "username": "",
                  "groups": [],
                  "user_permissions": [],
                  "role": [],
                  "files": []
                },
                "language": {
                  "name": "",
                  "language": "",
                  "code_2": "",
                  "code_3": ""
                },
                "category": {
                  "name": "",
                  "memo": null
                },
                "sector": {
                  "name": ""
                },
                "role": {
                  "name": "",
                  "title": "",
                  "abbreviation": "",
                  "create": false,
                  "read": false,
                  "update": false,
                  "delete": false,
                  "archive": false,
                  "override": false
                },
                "contacts": [
                  {
                    "id": 102,
                    "addressBy": "1",
                    "title": "1",
                    "first_name": "Shawn",
                    "last_name": "Michaels",
                    "gender": "1",
                    "country": "American Samoa",
                    "date_of_birth": "2023-05-03T00:00:00+02:00",
                    "picture": "https://test.eagna.io/media/20220923-185237_orig.png",
                    "job": "1",
                    "email": "Test",
                    "email_2": "1",
                    "phone": "1",
                    "phone_2": "1",
                    "mobile": "1",
                    "fax_number": "1",
                    "social": "<p>1</p>",
                    "teams": "<p>1</p>",
                    "created_at": "2023-05-02T00:00:00+02:00",
                    "updated_at": "2023-05-03T00:00:00+02:00",
                    "language": {
                      "name": "TA",
                      "id": 1
                    },
                    "company": {
                      "id": 2,
                      "name": "Knight-Warren",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": {
                      "name": "formatted_address",
                      "id": 105
                    },
                    "contact_partner": null,
                    "owner": null,
                    "role": {
                      "name": "Manager",
                      "id": 1
                    },
                    "category": {
                      "name": "Andreas Hein Kunden edited",
                      "id": 1
                    },
                    "sector": {
                      "name": "Dietitian",
                      "id": 1
                    },
                    "files": [],
                    "name": "Shawn Michaels",
                    "isBirthday": false
                  },
                  {
                    "id": 101,
                    "addressBy": "1",
                    "title": "1",
                    "first_name": "Mat",
                    "last_name": "Hardy",
                    "gender": "1",
                    "country": "Algeria",
                    "date_of_birth": "2023-05-16T00:00:00+02:00",
                    "picture": "https://test.eagna.io/media/20221122-172530_orig.jpg",
                    "job": "1",
                    "email": "Test 2",
                    "email_2": "1",
                    "phone": "1",
                    "phone_2": "1",
                    "mobile": "1",
                    "fax_number": "1",
                    "social": "<p>1</p>",
                    "teams": "<p>1</p>",
                    "created_at": "2023-05-09T00:00:00+02:00",
                    "updated_at": "2023-05-16T00:00:00+02:00",
                    "language": {
                      "name": "TA",
                      "id": 1
                    },
                    "company": {
                      "id": 2,
                      "name": "Knight-Warren",
                      "logo": "https://test.eagna.io/media/https://www.form-foundation.de/files/formfoundation-theme/images/logo/fofo-logo-mb.svg"
                    },
                    "address": null,
                    "contact_partner": null,
                    "owner": null,
                    "role": {
                      "name": "Manager",
                      "id": 1
                    },
                    "category": {
                      "name": "Andreas Hein Kunden edited",
                      "id": 1
                    },
                    "sector": {
                      "name": "Dietitian",
                      "id": 1
                    },
                    "files": [],
                    "name": "Mat Hardy",
                    "isBirthday": false
                  }
                ]
              }
            },
            "contact_partner": {
              "password": "",
              "is_superuser": false,
              "is_staff": false,
              "is_active": false,
              "country": "",
              "app_metadata": null,
              "blocked": false,
              "created_at": null,
              "is_deactivated": false,
              "email_verified": false,
              "email": "",
              "first_name": "",
              "last_name": "",
              "user_metadata": null,
              "identities": null,
              "last_ip": "",
              "last_login": null,
              "last_password_reset": null,
              "logins_count": null,
              "multifactor": "",
              "phone_number": "",
              "phone_verified": false,
              "picture": null,
              "avatar": null,
              "date_joined": null,
              "updated_at": null,
              "user_id": "",
              "provider": "",
              "locale": "",
              "globalMenubarPref": false,
              "globalGridPref": false,
              "globalChartPref": false,
              "globalScheme": "",
              "provision": "",
              "provision_app": "",
              "provision_uri": "",
              "provision_verified": false,
              "isExternal": false,
              "hasNotification": false,
              "username": "",
              "groups": [],
              "user_permissions": [],
              "role": [],
              "files": []
            },
            "status": {
              "id": 5,
              "name": "PENDING",
              "description": "PENDING",
              "icon": "fa-solid fa-triangle-exclamation",
              "color_class": "bg-primary-faded text-primary",
              "eg_content_type": {
                "name": "quotes",
                "id": 108
              }
            },
            "files": []
          }
        },
        "language": {
          "id": 1,
          "name": "TAGALOG",
          "language": "TA",
          "code_2": "TA",
          "code_3": "TA"
        },
        "bank_account": {
          "id": 1,
          "name": "name",
          "owner": "1",
          "owner_address": "sdf",
          "owner_zip": "asdfa",
          "owner_city": "asdf",
          "owner_country": "asdf",
          "bc_nr": 3,
          "bank_name": "asdf",
          "bank_nr": "asdf",
          "bank_account_nr": "asdf",
          "iban_nr": "asdf123",
          "remarks": "<p>asdf</p>",
          "invoice_mode": "asdf",
          "qr_invoice_iban": "asdfadf",
          "type": "asdf",
          "currency": {
            "name": "AUD",
            "id": 1
          },
          "account": {
            "name": "Rather safe board thank star he.",
            "id": 1
          },
          "__data__": {
            "currency": {
              "id": 1,
              "code": "THB",
              "name": "AUD",
              "round_factor": "33.00"
            },
            "account": {
              "id": 1,
              "code": "BEC83",
              "name": "Rather safe board thank star he.",
              "title": "Pretty old me address cut face. Want continue mind music.",
              "description": "Around family develop where throw six could.",
              "acct_std": {
                "name": "Interest instead action sell off.",
                "id": 93
              },
              "__data__": {
                "acct_std": {
                  "id": 93,
                  "code": "ACE81",
                  "name": "Interest instead action sell off.",
                  "title": "Hair role thank. Teacher she itself most worker person key. I new find south scientist street.",
                  "description": "Industry car shoulder leave someone maybe gun tell.",
                  "files": []
                }
              }
            }
          }
        },
        "payment_type": {
          "id": 2,
          "name": "Checks"
        },
        "tax": {
          "id": 1,
          "name": "Compare nearly throughout our continue would. Maybe analysis I life beyond.",
          "tax_rate": null,
          "list_country": null,
          "continent": null,
          "type": "Open",
          "description": null,
          "country": null
        },
        "positions": [
          {
            "id": 344,
            "name": null,
            "parent": null,
            "text": "<p><strong>evolve synergistic e-tailers</strong><br>Coach base old nature. Child six standard law past read. Red gun yard of throughout pattern pull.<br><br></p>",
            "quantity": "123.00",
            "unit_price": "49.00",
            "discount_in_percent": "0.1",
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 1,
            "show_pos_nr": true,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
              "name": "SubTotal Position",
              "id": 6
            },
            "account": {
              "name": "Rather safe board thank star he.",
              "id": 1
            },
            "tax": {
              "id": 14,
              "name": "name",
              "tax_rate": "0.095",
              "list_country": "Andorra",
              "continent": "Europe",
              "type": "Higher rate",
              "description": "Financial services",
              "country": 7
            },
            "unit": {
              "name": "E/D3",
              "id": 54
            },
            "article": {
              "name": "evolve synergistic e-tailers",
              "id": 2
            },
            "__data__": {
              "type": {
                "id": 6,
                "name": "SubTotal Position"
              },
              "unit": {
                "id": 54,
                "name": "E/D3",
                "system": {
                  "name": "B/C8",
                  "id": 36
                },
                "__data__": {
                  "system": {
                    "id": 36,
                    "name": "B/C8"
                  }
                }
              },
              "account": {
                "id": 1,
                "code": "BEC83",
                "name": "Rather safe board thank star he.",
                "title": "Pretty old me address cut face. Want continue mind music.",
                "description": "Around family develop where throw six could.",
                "acct_std": {
                  "name": "Interest instead action sell off.",
                  "id": 93
                },
                "__data__": {
                  "acct_std": {
                    "id": 93,
                    "code": "ACE81",
                    "name": "Interest instead action sell off.",
                    "title": "Hair role thank. Teacher she itself most worker person key. I new find south scientist street.",
                    "description": "Industry car shoulder leave someone maybe gun tell.",
                    "files": []
                  }
                }
              },
              "tax": {
                "id": 14,
                "name": "name",
                "tax_rate": "0.095",
                "list_country": "Andorra",
                "continent": "Europe",
                "type": "Higher rate",
                "description": "Financial services",
                "country": 7
              },
              "article": {
                "id": 2,
                "deliverer_code": "BD-18",
                "deliverer_name": "Gaines Group",
                "deliverer_description": "Know simply him bag prevent law. Become seat apply add world investment.",
                "code": "AD-05",
                "name": "evolve synergistic e-tailers",
                "description": "Coach base old nature. Child six standard law past read. Red gun yard of throughout pattern pull.",
                "purchase_price": "26.00",
                "sale_price": "49.00",
                "purchase_total": "21.00",
                "sale_total": "22.00",
                "is_stock": false,
                "stock_nr": 49,
                "stock_min_nr": 54,
                "stock_reserved_nr": 0,
                "stock_available_nr": 0,
                "stock_picked_nr": 0,
                "stock_disposed_nr": 0,
                "stock_ordered_nr": 0,
                "width": "97.00",
                "height": "28.00",
                "weight": "30.00",
                "volume": "81.00",
                "html_text": "Drive clearly successful data role tough west. Capital since theory close girl between former.",
                "remarks": "Program article able. Difference begin difference development purpose ready.",
                "delivery_price": "59.00",
                "article_group_id": 17,
                "user": {
                  "id": 3,
                  "name": "RTs Tolen",
                  "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg"
                },
                "company": null,
                "contact": null,
                "article_type": {
                  "name": "and Sons",
                  "id": 19
                },
                "currency": {
                  "name": "MUR",
                  "id": 100
                },
                "tax_income": {
                  "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                  "id": 41
                },
                "tax_expense": {
                  "name": "Hospital few local until.\nAbility drug same. Night visit central him present economy try.",
                  "id": 15
                },
                "unit": {
                  "name": "E/D3",
                  "id": 54
                },
                "stock_location": {
                  "name": "Rodriguez-Ewing",
                  "id": 36
                },
                "stock_area": {
                  "name": "AA-67",
                  "id": 63
                },
                "files": [],
                "task": [],
                "__data__": {
                  "article_type": {
                    "id": 19,
                    "name": "and Sons"
                  },
                  "currency": {
                    "id": 100,
                    "code": "NPR",
                    "name": "MUR",
                    "round_factor": "93.00"
                  },
                  "tax_income": {
                    "id": 41,
                    "uuid": "9884c237-6add-4411-9ca7-01232cdd62fe",
                    "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                    "code": "B/A8",
                    "digit": 25,
                    "type": "Open",
                    "tax_settlement_type": "97",
                    "value": "6.00",
                    "net_tax_value": "20.00",
                    "start_year": "1980-06-16T00:00:00+02:00",
                    "end_year": "1973-09-30T00:00:00+01:00",
                    "is_active": true,
                    "display_name": "Open",
                    "acct_code_defn": {
                      "name": "Tv attention view citizen some front.",
                      "id": 31
                    },
                    "files": []
                  },
                  "tax_expense": {
                    "id": 15,
                    "uuid": "fd8172c0-668a-49f5-bfaa-846191b4d6fe",
                    "name": "Hospital few local until.\nAbility drug same. Night visit central him present economy try.",
                    "code": "D/C3",
                    "digit": 32,
                    "type": "Open",
                    "tax_settlement_type": "68",
                    "value": "70.00",
                    "net_tax_value": "56.00",
                    "start_year": "2008-02-02T00:00:00+01:00",
                    "end_year": "1982-12-16T00:00:00+01:00",
                    "is_active": false,
                    "display_name": "Open",
                    "acct_code_defn": {
                      "name": "Ago particular right.",
                      "id": 78
                    },
                    "files": []
                  },
                  "unit": {
                    "id": 54,
                    "name": "E/D3",
                    "system": {
                      "name": "B/C8",
                      "id": 36
                    }
                  },
                  "stock_location": {
                    "id": 36,
                    "name": "Rodriguez-Ewing",
                    "city": "Winsford",
                    "country": "GB",
                    "state": "Europe/London",
                    "lat": "53.19146",
                    "lon": "-2.52398",
                    "files": []
                  },
                  "stock_area": {
                    "id": 63,
                    "name": "AA-67",
                    "type": "Warehouse",
                    "shelf": "ED-61",
                    "stack": "BA-89",
                    "lane": "EDCA-94",
                    "area": "BJA2969",
                    "files": []
                  },
                  "user": {
                    "id": 3,
                    "is_superuser": true,
                    "is_staff": true,
                    "is_active": true,
                    "country": "Algeria",
                    "app_metadata": [],
                    "blocked": false,
                    "created_at": "2023-03-24T07:45:43.062893+01:00",
                    "is_deactivated": false,
                    "email_verified": false,
                    "email": "randy.tolentino@eagna.io",
                    "first_name": "RTs",
                    "last_name": "Tolen",
                    "user_metadata": [],
                    "identities": [],
                    "last_ip": "90.187.210.41",
                    "last_login": "2023-10-11T16:57:28.998170+02:00",
                    "last_password_reset": "2023-03-24T07:45:43.062907+01:00",
                    "logins_count": 0,
                    "multifactor": "google",
                    "phone_number": "010 10101010",
                    "phone_verified": false,
                    "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg",
                    "avatar": "https://test.eagna.io/media/user/3_RTs_Tole/avatar/331294686_897967834661437_8946897111296551985_n.jpg",
                    "date_joined": "2023-03-24T07:45:43.062871+01:00",
                    "updated_at": "2023-03-24T07:45:43.062930+01:00",
                    "user_id": "010 10101010",
                    "provider": "Eagna",
                    "locale": "en",
                    "globalMenubarPref": true,
                    "globalGridPref": true,
                    "globalChartPref": true,
                    "globalScheme": "auto",
                    "provision": "unknown",
                    "provision_app": "unknown",
                    "provision_uri": "",
                    "provision_verified": false,
                    "isExternal": false,
                    "hasNotification": false,
                    "username": "ranran",
                    "groups": [],
                    "user_permissions": [],
                    "role": [],
                    "files": [],
                    "name": "RTs Tolen"
                  },
                  "contact": {
                    "addressBy": "",
                    "title": "",
                    "first_name": "",
                    "last_name": "",
                    "gender": "",
                    "country": "",
                    "date_of_birth": null,
                    "picture": null,
                    "job": "",
                    "email": "",
                    "email_2": "",
                    "phone": "",
                    "phone_2": "",
                    "mobile": "",
                    "fax_number": "",
                    "social": "",
                    "teams": "",
                    "created_at": null,
                    "updated_at": null,
                    "language": null,
                    "company": null,
                    "address": null,
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": []
                  },
                  "company": {
                    "name": "",
                    "logo": null,
                    "legal_form": "",
                    "suffix_name": "",
                    "abbreviation": "",
                    "registration_no": "",
                    "vat_no": "",
                    "vat_id_no": "",
                    "website": "",
                    "instagram": "",
                    "facebook": "",
                    "twitter": "",
                    "teams": "",
                    "skype": "",
                    "email": "",
                    "email_2": "",
                    "phone": "",
                    "phone_2": "",
                    "mobile": "",
                    "fax_number": "",
                    "created_at": null,
                    "updated_at": null,
                    "contact_partner": null,
                    "owner": null,
                    "billing_add": null,
                    "reg_add": null,
                    "shipping_add": null,
                    "units": null,
                    "language": null,
                    "category": null,
                    "sector": null,
                    "role": null,
                    "files": []
                  }
                }
              }
            }
          },
          {
            "id": 345,
            "name": null,
            "parent": null,
            "text": "<p>Text <strong>Text </strong>Text</p>",
            "quantity": "98.00",
            "unit_price": "98.00",
            "discount_in_percent": "0.08",
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 2,
            "show_pos_nr": true,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
              "name": "SubTotal Position",
              "id": 6
            },
            "account": null,
            "tax": {
              "id": 3,
              "name": "name",
              "tax_rate": "0.100",
              "list_country": "Afghanistan",
              "continent": "Asia",
              "type": "Higher Rate",
              "description": "Luxury hotels and restaurants; telecom services",
              "country": 2
            },
            "unit": {
              "name": "E/E6",
              "id": 3
            },
            "article": null,
            "__data__": {
              "type": {
                "id": 6,
                "name": "SubTotal Position"
              },
              "unit": {
                "id": 3,
                "name": "E/E6",
                "system": {
                  "name": "A/A0",
                  "id": 68
                },
                "__data__": {
                  "system": {
                    "id": 68,
                    "name": "A/A0"
                  }
                }
              },
              "account": {
                "code": "",
                "name": "",
                "title": "",
                "description": "",
                "acct_std": null
              },
              "tax": {
                "id": 3,
                "name": "name",
                "tax_rate": "0.100",
                "list_country": "Afghanistan",
                "continent": "Asia",
                "type": "Higher Rate",
                "description": "Luxury hotels and restaurants; telecom services",
                "country": 2
              },
              "article": {
                "deliverer_code": "",
                "deliverer_name": "",
                "deliverer_description": "",
                "code": "",
                "name": "",
                "description": "",
                "purchase_price": null,
                "sale_price": null,
                "purchase_total": null,
                "sale_total": null,
                "is_stock": false,
                "stock_nr": null,
                "stock_min_nr": null,
                "stock_reserved_nr": null,
                "stock_available_nr": null,
                "stock_picked_nr": null,
                "stock_disposed_nr": null,
                "stock_ordered_nr": null,
                "width": null,
                "height": null,
                "weight": null,
                "volume": null,
                "html_text": "",
                "remarks": "",
                "delivery_price": null,
                "article_group_id": null,
                "user": null,
                "company": null,
                "contact": null,
                "article_type": null,
                "currency": null,
                "tax_income": null,
                "tax_expense": null,
                "unit": null,
                "stock_location": null,
                "stock_area": null,
                "files": [],
                "task": []
              }
            }
          },
          {
            "id": 346,
            "name": null,
            "parent": null,
            "text": "<p><strong>innovate bricks-and-clicks markets</strong><br>Break dog let style prevent. Yes mind threat real.<br><br></p>",
            "quantity": "97.00",
            "unit_price": "190.00",
            "discount_in_percent": null,
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 3,
            "show_pos_nr": false,
            "is_optional": false,
            "is_percentual": false,
            "value": null,
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
              "name": "SubTotal Position",
              "id": 6
            },
            "account": {
              "name": "Because ground country.",
              "id": 7
            },
            "tax": {
              "id": 3,
              "name": "name",
              "tax_rate": "0.100",
              "list_country": "Afghanistan",
              "continent": "Asia",
              "type": "Higher Rate",
              "description": "Luxury hotels and restaurants; telecom services",
              "country": 2
            },
            "unit": {
              "name": "D/E2",
              "id": 22
            },
            "article": {
              "name": "innovate bricks-and-clicks markets",
              "id": 4
            },
            "__data__": {
              "type": {
                "id": 6,
                "name": "SubTotal Position"
              },
              "unit": {
                "id": 22,
                "name": "D/E2",
                "system": {
                  "name": "B/D7",
                  "id": 38
                },
                "__data__": {
                  "system": {
                    "id": 38,
                    "name": "B/D7"
                  }
                }
              },
              "account": {
                "id": 7,
                "code": "DAD94",
                "name": "Because ground country.",
                "title": "Their deep sometimes account be movie owner understand. Never mind hospital book help pass mind.",
                "description": "Go single product reality current bad issue hope. Speak property tax else fish seven.",
                "acct_std": {
                  "name": "Candidate source changes",
                  "id": 1
                },
                "__data__": {
                  "acct_std": {
                    "id": 1,
                    "code": "ADD612",
                    "name": "Candidate source changes",
                    "title": "xc v asdfasdfassds sdfsdf s",
                    "description": "Ten that guess. Say large paper beat finally. A feeling first program senior.",
                    "files": [
                      13,
                      15
                    ]
                  }
                }
              },
              "tax": {
                "id": 3,
                "name": "name",
                "tax_rate": "0.100",
                "list_country": "Afghanistan",
                "continent": "Asia",
                "type": "Higher Rate",
                "description": "Luxury hotels and restaurants; telecom services",
                "country": 2
              },
              "article": {
                "id": 4,
                "deliverer_code": "ED-56",
                "deliverer_name": "Ryan Ltd",
                "deliverer_description": "Reality short detail eye. Individual ground cup land.",
                "code": "AA-67",
                "name": "innovate bricks-and-clicks markets",
                "description": "Break dog let style prevent. Yes mind threat real.",
                "purchase_price": "35.00",
                "sale_price": "19.00",
                "purchase_total": "93.00",
                "sale_total": "77.00",
                "is_stock": false,
                "stock_nr": 1,
                "stock_min_nr": 87,
                "stock_reserved_nr": 0,
                "stock_available_nr": 0,
                "stock_picked_nr": 0,
                "stock_disposed_nr": 0,
                "stock_ordered_nr": 0,
                "width": "55.00",
                "height": "40.00",
                "weight": "41.00",
                "volume": "9.00",
                "html_text": "Budget point important edge spring lead respond.",
                "remarks": "Read word professional then can door support. Kid home control suffer job white authority.",
                "delivery_price": "46.00",
                "article_group_id": 54,
                "user": {
                  "id": 3,
                  "name": "RTs Tolen",
                  "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg"
                },
                "company": null,
                "contact": null,
                "article_type": {
                  "name": "Ltd",
                  "id": 42
                },
                "currency": {
                  "name": "JMD",
                  "id": 96
                },
                "tax_income": {
                  "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                  "id": 41
                },
                "tax_expense": {
                  "name": "Chair manager simple apply there stop. To sport while dog past.",
                  "id": 9
                },
                "unit": {
                  "name": "D/E2",
                  "id": 22
                },
                "stock_location": {
                  "name": "Allen and Sons",
                  "id": 25
                },
                "stock_area": {
                  "name": "AE-17",
                  "id": 81
                },
                "files": [],
                "task": [],
                "__data__": {
                  "article_type": {
                    "id": 42,
                    "name": "Ltd"
                  },
                  "currency": {
                    "id": 96,
                    "code": "MUR",
                    "name": "JMD",
                    "round_factor": "48.00"
                  },
                  "tax_income": {
                    "id": 41,
                    "uuid": "9884c237-6add-4411-9ca7-01232cdd62fe",
                    "name": "Eight size establish TV own no these. On training hard reason less window pick.",
                    "code": "B/A8",
                    "digit": 25,
                    "type": "Open",
                    "tax_settlement_type": "97",
                    "value": "6.00",
                    "net_tax_value": "20.00",
                    "start_year": "1980-06-16T00:00:00+02:00",
                    "end_year": "1973-09-30T00:00:00+01:00",
                    "is_active": true,
                    "display_name": "Open",
                    "acct_code_defn": {
                      "name": "Tv attention view citizen some front.",
                      "id": 31
                    },
                    "files": []
                  },
                  "tax_expense": {
                    "id": 9,
                    "uuid": "bd9188dd-12ac-4e8c-b8c1-6fb35bfc1c5e",
                    "name": "Chair manager simple apply there stop. To sport while dog past.",
                    "code": "E/A5",
                    "digit": 8,
                    "type": "Open",
                    "tax_settlement_type": "77",
                    "value": "94.00",
                    "net_tax_value": "1.00",
                    "start_year": "2013-12-02T00:00:00+01:00",
                    "end_year": "1994-02-11T00:00:00+01:00",
                    "is_active": false,
                    "display_name": "Open",
                    "acct_code_defn": {
                      "name": "Glass daughter after tonight rule.",
                      "id": 41
                    },
                    "files": []
                  },
                  "unit": {
                    "id": 22,
                    "name": "D/E2",
                    "system": {
                      "name": "B/D7",
                      "id": 38
                    }
                  },
                  "stock_location": {
                    "id": 25,
                    "name": "Allen and Sons",
                    "city": "Bron",
                    "country": "FR",
                    "state": "Europe/Paris",
                    "lat": "45.73333",
                    "lon": "4.91667",
                    "files": []
                  },
                  "stock_area": {
                    "id": 81,
                    "name": "AE-17",
                    "type": "Warehouse",
                    "shelf": "BB-30",
                    "stack": "AE-66",
                    "lane": "DDCD-94",
                    "area": "3Q851",
                    "files": []
                  },
                  "user": {
                    "id": 3,
                    "is_superuser": true,
                    "is_staff": true,
                    "is_active": true,
                    "country": "Algeria",
                    "app_metadata": [],
                    "blocked": false,
                    "created_at": "2023-03-24T07:45:43.062893+01:00",
                    "is_deactivated": false,
                    "email_verified": false,
                    "email": "randy.tolentino@eagna.io",
                    "first_name": "RTs",
                    "last_name": "Tolen",
                    "user_metadata": [],
                    "identities": [],
                    "last_ip": "90.187.210.41",
                    "last_login": "2023-10-11T16:57:28.998170+02:00",
                    "last_password_reset": "2023-03-24T07:45:43.062907+01:00",
                    "logins_count": 0,
                    "multifactor": "google",
                    "phone_number": "010 10101010",
                    "phone_verified": false,
                    "picture": "https://test.eagna.io/media/user/3_RT_Toles/picture/Artboard_1_1.jpg",
                    "avatar": "https://test.eagna.io/media/user/3_RTs_Tole/avatar/331294686_897967834661437_8946897111296551985_n.jpg",
                    "date_joined": "2023-03-24T07:45:43.062871+01:00",
                    "updated_at": "2023-03-24T07:45:43.062930+01:00",
                    "user_id": "010 10101010",
                    "provider": "Eagna",
                    "locale": "en",
                    "globalMenubarPref": true,
                    "globalGridPref": true,
                    "globalChartPref": true,
                    "globalScheme": "auto",
                    "provision": "unknown",
                    "provision_app": "unknown",
                    "provision_uri": "",
                    "provision_verified": false,
                    "isExternal": false,
                    "hasNotification": false,
                    "username": "ranran",
                    "groups": [],
                    "user_permissions": [],
                    "role": [],
                    "files": [],
                    "name": "RTs Tolen"
                  },
                  "contact": {
                    "addressBy": "",
                    "title": "",
                    "first_name": "",
                    "last_name": "",
                    "gender": "",
                    "country": "",
                    "date_of_birth": null,
                    "picture": null,
                    "job": "",
                    "email": "",
                    "email_2": "",
                    "phone": "",
                    "phone_2": "",
                    "mobile": "",
                    "fax_number": "",
                    "social": "",
                    "teams": "",
                    "created_at": null,
                    "updated_at": null,
                    "language": null,
                    "company": null,
                    "address": null,
                    "contact_partner": null,
                    "owner": null,
                    "role": null,
                    "category": null,
                    "sector": null,
                    "files": []
                  },
                  "company": {
                    "name": "",
                    "logo": null,
                    "legal_form": "",
                    "suffix_name": "",
                    "abbreviation": "",
                    "registration_no": "",
                    "vat_no": "",
                    "vat_id_no": "",
                    "website": "",
                    "instagram": "",
                    "facebook": "",
                    "twitter": "",
                    "teams": "",
                    "skype": "",
                    "email": "",
                    "email_2": "",
                    "phone": "",
                    "phone_2": "",
                    "mobile": "",
                    "fax_number": "",
                    "created_at": null,
                    "updated_at": null,
                    "contact_partner": null,
                    "owner": null,
                    "billing_add": null,
                    "reg_add": null,
                    "shipping_add": null,
                    "units": null,
                    "language": null,
                    "category": null,
                    "sector": null,
                    "role": null,
                    "files": []
                  }
                }
              }
            }
          },
          {
            "id": 347,
            "name": null,
            "parent": null,
            "text": "<p>Discount</p>",
            "quantity": null,
            "unit_price": null,
            "discount_in_percent": null,
            "position_total": null,
            "pos": "1.00",
            "internal_pos": 4,
            "show_pos_nr": false,
            "is_optional": false,
            "is_percentual": true,
            "value": "2",
            "total_sum": "0.00",
            "discount_total": null,
            "show_pos_prices": false,
            "quote_qty": 0,
            "j_order_detail": [],
            "type": {
              "name": "Text Position",
              "id": 3
            },
            "account": null,
            "tax": null,
            "unit": null,
            "article": null,
            "__data__": {
              "type": {
                "id": 3,
                "name": "Text Position"
              },
              "unit": {
                "name": "",
                "system": null
              },
              "account": {
                "code": "",
                "name": "",
                "title": "",
                "description": "",
                "acct_std": null
              },
              "tax": {
                "name": "",
                "tax_rate": null,
                "list_country": "",
                "continent": "",
                "type": "",
                "description": "",
                "country": null
              },
              "article": {
                "deliverer_code": "",
                "deliverer_name": "",
                "deliverer_description": "",
                "code": "",
                "name": "",
                "description": "",
                "purchase_price": null,
                "sale_price": null,
                "purchase_total": null,
                "sale_total": null,
                "is_stock": false,
                "stock_nr": null,
                "stock_min_nr": null,
                "stock_reserved_nr": null,
                "stock_available_nr": null,
                "stock_picked_nr": null,
                "stock_disposed_nr": null,
                "stock_ordered_nr": null,
                "width": null,
                "height": null,
                "weight": null,
                "volume": null,
                "html_text": "",
                "remarks": "",
                "delivery_price": null,
                "article_group_id": null,
                "user": null,
                "company": null,
                "contact": null,
                "article_type": null,
                "currency": null,
                "tax_income": null,
                "tax_expense": null,
                "unit": null,
                "stock_location": null,
                "stock_area": null,
                "files": [],
                "task": []
              }
            }
          }
        ],
        "files": [],
        "status": {
          "id": 4,
          "name": "Work In Progress",
          "description": "QUotes Status",
          "icon": "fa-solid fa-pencil",
          "color_class": "bg-success-faded text-success",
          "eg_content_type": {
            "name": "quotes",
            "id": 108
          }
        } */
      }
    };
    //console.log({_toReturn});
    return _toReturn;
  }

}
