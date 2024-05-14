import { objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";
import { Article } from "../product/article/article";
import { ItemComponent } from "./item.component";

export enum ItemType{
  STANDARD_POSITION="Standard Position",
  PRODUCT_POSITION="Product Position",
  TEXT_POSITION="Text Position",
  GROUP_POSITION="Group Position",
  DISCOUNT_POSITION="Discount Position",
  SUBTOTAL_POSITION="Subtotal Position",
  PDF_POSITION="PDF Position",
}

export class Item {
  public static ITEM_POSITION_TYPE = [
    {
      "id": 1,
      "position_key": "group_position",
      "name": "Group",
      "description": "group"
    },
    {
        "id": 2,
        "position_key": "subtotal_position",
        "name": "SubTotal",
        "description": "sub_total"
    },
    {
        "id": 3,
        "position_key": "discount_position",
        "name": "Discount",
        "description": "discount"
    },
    {
        "id": 4,
        "position_key": "text_position",
        "name": "Text",
        "description": "text_position"
    },
    {
        "id": 5,
        "position_key": "pdf_position",
        "name": "Pdf Page Break",
        "description": "pdf_page_break"
    },
    {
        "id": 6,
        "position_key": "product_position",
        "name": "Product",
        "description": "product_position"
    },
    {
        "id": 7,
        "position_key": "standard_position",
        "name": "Standard",
        "description": "standard_position"
    }
  ];

  public static getFormStructure(param, mode) : any{

    console.log({getFormStructure: param});

    let _formStructure = []
    const _defaultFields = [
      "quantity","unit", "unit_price", "account", "is_optional",
       "discount_in_percent", "tax", "show_pos_nr",
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

  public static getFormProperty(_that: ItemComponent) : objArrayType {
    const currency = _that?.data?.currency?.name || AppStatic.default_currency; //RT TODO: map the currency ID
    const productFormProperties = Article.getArticleFormProperties(_that);
    const _taxProperty = AppStatic.StandardForm['tax'];

    let _isPercentual = true;

    const _formProperties: objArrayType = {
      is_percentual       : {formChangesToCallback: true, callback(p, _f) {
        /* console.log({p, _f});
        _isPercentual = p.value == true; */
        _that.isPercentualChanged(p, _f);
      }},
      discount_in_percent : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:2, maxFractionDigits:2} },
      pos                 : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:1, maxFractionDigits:2} },
      unit_price          : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      quantity            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:0, maxFractionDigits:2} },
      value               : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:1, maxFractionDigits:2, ...(_isPercentual ? {suffix:"%"} : {}) } },
      qty                 : {icon:"", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      unit                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit", saveField: "id",}, displayVal: "name" },
      type                : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "type", saveField: "id",}, displayVal: "name" },
      //article             : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "article"} , displayVal: "article.name"},
      account             : {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: "name", saveField: "id", extraKey: "account"} , displayVal: "account.name"},
      tax                 : {..._taxProperty, autoConfig: {..._taxProperty?.autoConfig, description_formatter: (opt) => {
                              if(opt){
                                const _tax = opt.tax_rate || 0;
                                if(_tax){
                                  return '<span title="'+ (opt.continent ? '(' +opt.continent + ') ' : '') + opt.description +'">' + (opt.list_country ? opt.list_country + ' ' : '') + _that.percent.transform(_tax, (((_tax * 100) % 1) > 0 ? '.1' : null)) + '</span>';
                                }
                              }
                              return '';
                            }}},
      /* tax                 : {icon:"fa-solid fa-circle-user", type:"autocomplete", autoConfig:  {title: "description", description: "tax_rate", saveField: "id", extraKey: "tax_rates"} , displayVal: "tax.description"}, */
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
    console.log(_that)
    const currency = _that?.data?.currency?.name || AppStatic.default_currency; //RT TODO: map the currency ID
    const productFormProperties = Article.getArticleFormProperties(_that);

    const _formProperties: objArrayType = {
      discount_in_percent : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"%", minFractionDigits:2, maxFractionDigits:2} },
      pos                 : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:0, maxFractionDigits:2} },
      unit_price          : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      quantity            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:1, maxFractionDigits:2} },
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
                                console.log(p)
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
      _discount = ( ((price || data.unit_price)*1) * ((qty || data.quantity)*1) ) * (0.01 * _discountInPercent);
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
      const _sum = Item.computeSum(_allData, {compute: true, belowPos: _data?.pos});
      _discount = _sum * (0.01 * _discountInPercent);
    }
    else if(_data.value){
      _discount = _data.value*1;
    }
    return _discount;
  }

  public static computeSum(arrData: any[] = [], computeWithDiscount?: {compute: boolean, belowPos: number}): number {
    let _sum = 0;
    arrData.forEach((_eachData) => {
      if(_eachData){
        const _type = _eachData.type?.name;
        const _qty = _eachData.quantity*1;
        const _price = _eachData.unit_price*1;
        let _discount = 0;

        /* let _discount = 0
        if(_eachData.discount_in_percent){
          const _discountInPercent = _eachData.discount_in_percent;
          _discount = (_price * _qty) * (0.01 * _discountInPercent);
        }
        else if(_eachData.discount_total){
          _discount = _eachData.discount_total*1;
        } */

        switch(_type){
          case ItemType.PRODUCT_POSITION:
          case ItemType.STANDARD_POSITION:
            _discount = Item.getDiscountAmount(_eachData, _price, _qty);
            // console.log({[_type]: _eachData});
            const _orig_total = (_qty * _price);
            const _discounted_total = (_orig_total - _discount);

            // console.log(`${_orig_total}-${_discount}=${_discounted_total}`);
            _sum += _discounted_total;

            //plus tax
            //_sum += (_discounted_total * (_eachData.tax?.value * 0.01))

            break;
          case ItemType.DISCOUNT_POSITION:
            if(computeWithDiscount?.compute && computeWithDiscount?.belowPos && _eachData.pos < computeWithDiscount?.belowPos){
              let _discount = 0;
              if(_eachData?.is_percentual){
                const _discountInPercent = (_eachData?.value || 0) * 1;
                _discount = _sum * (0.01 * _discountInPercent);
                _sum -= _discount;
              }
              else if(_eachData.value){
                _discount = _eachData?.value*1;
                _sum -= _discount;
              }
            }
            break;
        }
      }
    });
    return _sum;
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
        if(![ItemType.PRODUCT_POSITION, ItemType.STANDARD_POSITION].includes(_data.type?.name) || _data.type?.name == ItemType.GROUP_POSITION){
          delete _data.quantity;
          delete _data.unit;
          delete _data.unit_price;
          delete _data.discount_in_percent;
          delete _data.total_sum;
        }

        _data.actual_position = '';
        if(_data.show_pos_nr || [ItemType.PRODUCT_POSITION, ItemType.STANDARD_POSITION].includes(_data.type?.name)){
          if(_isPreviousGroupChild && !_data.parent){
            _pos++;
          }
          _data.actual_position = _pos;

          if(_data.parent){
            _child = _child + 0.01;
            //console.log({_child});
            _data.actual_position = _pos + _child;
            _isPreviousGroupChild = true;
          } else {
            if(_data.type?.name != ItemType.GROUP_POSITION || _isPreviousGroupChild){
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

}
