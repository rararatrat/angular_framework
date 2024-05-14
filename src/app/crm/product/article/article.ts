import { FormStructure, objArrayType } from "@library/library.interface";

export class Article {
  public static getArticleFormProperties(_that, fromWhere?): {formProperties: objArrayType, includedFields: string[], formStructure: (string | FormStructure)[]} {
    const data = _that?.data;
    const currency = data?.currency?.name;
    const unit = data?.unit?.name;



    const _formProperties: objArrayType = {
      volume            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"m", minFractionDigits:2, maxFractionDigits:2} },
      weight            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"kg", minFractionDigits:2, maxFractionDigits:2} },
      width             : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"m", minFractionDigits:2, maxFractionDigits:2} },
      height            : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:"m", minFractionDigits:2, maxFractionDigits:2} },

      delivery_price    : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },

      purchase_price    : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },
      purchase_total    : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency, currencyDisplay:"symbol"} },

      sale_price       : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency,  currencyDisplay:"symbol"} },
      sale_total       : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:currency,  currencyDisplay:"symbol"} },

      stock_nr          : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },
      stock_min_nr      : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },
      stock_reserved_nr : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },
      stock_available_nr: {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },
      stock_picked_nr   : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },
      stock_disposed_nr : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", suffix:unit, minFractionDigits:0, maxFractionDigits:0} },

      article_group_id  : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "article_group", saveField: "id"}, displayVal: "name" },
      article_type      : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "article_type", saveField: "id"}, displayVal: "name" },
      currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'code',  extraKey: "currency", saveField: "id"},  displayVal: "name" },

      tax_income        : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "tax", saveField: "id"}, displayVal: "name", title:"Pre-Tax for VAT" },
      tax_expense       : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "tax", saveField: "id"}, displayVal: "name", title:"Sales-Tax for VAT" },

      unit              : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit", saveField: "id"}, displayVal: "name" },
      stock_location    : {icon:"fa-solid fa-circle", autoConfig: {title: 'name', description: 'name',  extraKey: "stock_location", saveField: "id"}, displayVal: "stock_location.name" },
      stock_area        : {icon:"fa-solid fa-circle", autoConfig: {title: 'name', description: 'name',  extraKey: "stock_area", saveField: "id"}, displayVal: "stock_area.name" },
      user              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: 'name', saveField: "id", image:{linkToImage:"picture"}} , displayVal: "user.name"},
      contact           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: 'name', saveField: "id", image:{linkToImage:"picture"}} , displayVal: "contact.name"},
      company           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: 'name', saveField: "id", image:{linkToImage:"logo"}} , displayVal: "company.name"},

    };

  const _toReturn   : {formProperties: objArrayType, includedFields: string[], formStructure: (string | FormStructure)[]} = {
      formProperties  : _formProperties,

      includedFields  : [ "name", "article_type","user", "code", "description", "article_group_id",
                          "width", "height", "weight", "volume", "remarks", "unit", "files",

                          "purchase_price", "currency", "tax_income", "tax_expense",
                          "sale_price", "purchase_total", "sale_total",

                          "is_stock", "stock_nr", "stock_min_nr",
                          "stock_location", "stock_area",
                          "company", "contact",

                          "deliverer_code", "deliverer_name", "deliverer_description", "delivery_price",

                          "html_text"
                        ],

      formStructure   : [
          {
            header    : "Product Data",
            subheader : "Details",
            fields    : ["name", "description"], //"user", "code", "description",  "article_group_id", "unit"
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Product Specifications",
            subheader : "Specifications",
            fields    : ["code", "article_type", "article_group_id", "user", "width", "height", "weight", "volume"],
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Remarks",
            subheader : "Specifications",
            fields    : ["remarks"],
            isTwoLine : true,
            collapsed : false
          },
          {
            header    : "Vendor",
            subheader : "Specifications",
            fields    : ["contact", "company"],
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Price Information",
            subheader : "Price Information",
            fields    : ["currency", "unit" ],
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Buy",
            subheader : "Price Information",
            fields    : ["purchase_price", "purchase_total"],
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Sell",
            subheader : "Price Information",
            fields    : [ "sale_price", "sale_total"],
            isTwoLine : false,
            collapsed : false
          },
          {
            header    : "Tax",
            subheader : "Price Information",
            fields    : ["tax_income", "tax_expense"],
            isTwoLine : false,
            collapsed : false
          },

          {
            header    : "Stock Details",
            fields    : [ "is_stock", "stock_nr", "stock_min_nr",
                          "stock_location", "stock_area"],
            isTwoLine : false,
            collapsed: false
          },
          {
            header    : "Vendor Remarks",
            fields    : ["html_text"],
            isTwoLine : true,
            collapsed : false
          },
          {
            header    : "Files",
            subheader : "Upload Any Images, Documents of the product",
            fields    : ["files"],
            isTwoLine : true,
            collapsed: false
          },
      ]
    }

    return _toReturn;
  }
  public static getTaskFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        project   : {autoConfig:  {title: 'name', saveField: "id"} , displayVal: "project.id"},
        creator   : {autoConfig :  {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "creator.name"},
        /* type      : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"task_type"}, displayVal: "type.name"}, */
        type      : {type: "select", autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"task_type"}, displayVal: "type.name"},
        status    : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"status"}, displayVal: "status.name"},
        priority  : {type:"select", autoConfig: {title: 'name',  extraKey:"priority", saveField: "id"}, displayVal: "priority.name"},
        resources : {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "resources.name"}
      },
      formStructure: [
        {
          fields    : ['name', 'project'],
          isTwoLine : false
        },
        {
          header    : "Details",
          fields    : ['type', 'status', 'priority'],
          isTwoLine : true
        },
        {
          header    : "Dates",
          fields    : ['date_start_actual', 'date_end_actual'],
          isTwoLine : true
        },
        {
          header    : "Budget",
          fields    : ['budget_planned', 'budget_actual'],
          isTwoLine : true
        },
        {
          header    : "Assignment",
          fields    : ['creator', 'resources'],
          isTwoLine : false
        },
        {
          fields    : ['description'],
          isTwoLine : true
        },
        {
          fields    : ['files'],
          isTwoLine : true
        },
        /* 'files', 'description' */
      ]
    }

    return _toReturn;
  }
}
