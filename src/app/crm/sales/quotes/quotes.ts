import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Quotes {
  public static getFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | any)[]}{
    const _formProperties: objArrayType = {
      company           : { icon:"fa-solid fa-circle-user",
                            displayVal: "company.name",
                            autoConfig:  {title: "name", saveField: "id", extraKey: "company", image:{linkToImage:"logo"}}},
      contact           : {icon:"fa-solid fa-circle-user", displayVal: "contact.name", autoConfig:  {title: "name", saveField: "id", extraKey: "contact", image:{linkToImage:"picture"}, formProperty: {
        formProperties: {
          category: AppStatic.StandardForm["category"],
          language: AppStatic.StandardForm["language"],
          role: AppStatic.StandardForm["role"],
          sector: AppStatic.StandardForm["sector"],
          country: AppStatic.StandardForm["country"],
        }
      }}},
      user              : {icon:"fa-solid fa-circle-user", displayVal: "user.name", autoConfig:  {title: "name", saveField: "id", extraKey: "user", image:{linkToImage:"picture"}, formProperty: {
        formProperties: {
          country: AppStatic.StandardForm["country"],
        }
      }}},
      invoice_address   : {icon:"fa-solid fa-registered", type:"address", title:"Invoice Address", autoConfig:{extraKey:"invoice_address"}},
      delivery_address  : {icon:"fa-solid fa-registered", type:"address", title:"Delivery Address", autoConfig:{extraKey:"delivery_address"}},
      project           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "project"} , displayVal: "project.name"},
      language          : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
      bank_account      : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "bank_account"} , displayVal: "bank_account.name"},
      currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "currency"}, displayVal: "name" },
      payment_type      : {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: 'name', description: 'name'},  displayVal: "name"},
      taxs              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "description", description: "tax_rate", saveField: "id", extraKey: "tax"} , displayVal: "taxs.name"},
      mwst_type         : AppStatic.StandardForm['mwst_type'],
      mwst_is_net       : AppStatic.StandardForm['mwst_is_net'],
    };

    const _toReturn   : {formProperties: objArrayType, formStructure: (FormStructure | string)[]} = {
      formProperties  : _formProperties,
      formStructure   : [
                          {
                            key       : "details",
                            header    : Core.Localize('item_details', {item: Core.Localize('quote')}),
                            subheader : Core.Localize('enter_key_info', {item: Core.Localize('quote')}),
                            fields    : ["name", "company","contact", "user", "project"],
                            isTwoLine : false
                          },
                          {
                            key       : "items",
                            header    : Core.Localize('item', {count: 2}),
                            subheader : Core.Localize('list_of_products', {item: Core.Localize('quote')}),
                            fields    : [ "files"],
                            isTwoLine : false
                          },
                          {
                            key       : "conditions",
                            header    : Core.Localize('condition', {count: 2}),
                            subheader : Core.Localize('conditions_desc', {item: Core.Localize('quote')}),
                            fields    : ["payment_type","is_valid_from","is_valid_until"/* ,"kb_terms_of_payment" */],
                            isTwoLine : false
                          },
                          {
                            key       : "address",
                            header    : Core.Localize('address'),
                            subheader : Core.Localize('delivery_and_invoice', {item: Core.Localize('quote')}),
                            fields    : [ "delivery_address", "invoice_address"],
                            isTwoLine : false
                          },
                          {
                            key       : "text",
                            header    : Core.Localize('text', {count: 2}),
                            subheader : Core.Localize('texts_desc'),
                            fields    : [ "title","header", "footer","language",],
                            isTwoLine : false
                          },
                          {
                            key       : "settings",
                            header    : Core.Localize('setting', {count: 2}),
                            subheader : Core.Localize('settings_desc'),
                            fields    : [ "show_position_taxes", "show_total", "bank_account", "currency",
                                          "mwst_type", "mwst_is_net"],
                            isTwoLine : false
                          },
                        ]
    }
    return _toReturn;
  }

}
